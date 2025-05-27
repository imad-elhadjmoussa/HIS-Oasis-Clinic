<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import Avenant_card from '../cards/Avenant_card.vue';
import Avenant_tab from '../tabs/Avenant_tab.vue';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import RadioButton from 'primevue/radiobutton';
import Calendar from 'primevue/calendar';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';

const API_BASE_URL = import.meta.env.VITE_SERVER_URL;

// Retrieve the avenant ID from the route
const route = useRoute();
const avenantId = route.params.id;
const toast = useToast();

// Data states
const avenantData = ref(null);
const loading = ref(true);
const error = ref(null);
const processingActivation = ref(false);

// Dialog control
const activationDialog = ref(false);
const activationType = ref('now');
const activationDate = ref(null);

// Fetch data from API
const fetchAvenantData = async () => {
  try {
    loading.value = true;
    const response = await axios.get(`${API_BASE_URL}/api/convention/avenants/${avenantId}`);
    avenantData.value = response.data;
    loading.value = false;
  } catch (err) {
    error.value = "Failed to load avenant data";
    loading.value = false;
    console.error("Error fetching avenant data:", err);
  }
};

// Open activation dialog
const openActivationDialog = () => {
  activationDialog.value = true;
};

// Close dialog
const closeDialog = () => {
  activationDialog.value = false;
};

// Handle activation
const handleActivation = async () => {
  if (processingActivation.value) return; // Prevent multiple submissions
  
  processingActivation.value = true;
  
  try {
    if (activationType.value === 'now') {
      // Immediate activation - use today's date
      const today = new Date();
      const formattedDate = formatDate(today);
      
      await axios.put(`${API_BASE_URL}/api/convention/avenants/activate/${avenantId}`, {
        activationDate: formattedDate
      });
      
      toast.add({
        severity: 'success',
        summary: 'Activation Successful',
        detail: 'The avenant has been activated',
        life: 3000
      });
    } else if (activationType.value === 'later' && activationDate.value) {
      // Scheduled activation - send the date and activate_later=yes query param
      const formattedDate = formatDate(activationDate.value);
      
      await axios.put(
        `${API_BASE_URL}/api/convention/avenants/activate/${avenantId}?activate_later=yes`, 
        { activationDate: formattedDate }
      );
      
      toast.add({
        severity: 'success',
        summary: 'Scheduled Successfully',
        detail: `The avenant has been scheduled for activation on ${formattedDate}`,
        life: 3000
      });
    } else {
      toast.add({
        severity: 'error',
        summary: 'Missing Date',
        detail: 'Please select an activation date',
        life: 3000
      });
      processingActivation.value = false;
      return; // Don't close dialog if date is missing
    }
    
    // Refresh avenant data to show updated status/timestamp
    await fetchAvenantData();
    closeDialog();
    
    console.log('Updated avenant data after operation:', avenantData.value);
  } catch (error) {
    console.error('Error processing avenant:', error);
    toast.add({
      severity: 'error',
      summary: 'Operation Failed',
      detail: error.response?.data?.error || 'Failed to process the avenant',
      life: 3000
    });
    processingActivation.value = false;
  } finally {
    processingActivation.value = false;
  }
};

// Format date for API - YYYY-MM-DD format (no time for DATE type)
const formatDate = (date) => {
  if (!date) return null;
  
  // Create a new Date object with the selected date
  const d = new Date(date);
  
  // Format as YYYY-MM-DD
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

// Fetch data when component mounts
onMounted(() => {
  fetchAvenantData();
});
</script>
<template>
  <Toast />
  <div class="content">
    <div class="title">
      <h1 id="maintitle">Avenant</h1>
    </div>
    <!-- Show loading state -->
    <div v-if="loading" class="loading">
      Loading avenant data...
    </div>
    <!-- Show error message if any -->
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    <!-- Show content when data is loaded -->
    <div v-else-if="avenantData">
      <Avenant_card :id="avenantData.id" :contractId="avenantData.contract_id" :status="avenantData.status" :createdAt="avenantData.created_at"
        :activateAt="avenantData.activate_at ? avenantData.activate_at : 'Not selected yet'"
         />
        <div class="activer">
            <Button v-if="avenantData.status === 'Pending'"
                   icon="pi pi-file-check"
                   severity="success"
                   label="Activate"
                   @click="openActivationDialog" />
        </div>
      <div class="title">
        <h1 id="contracts">Avenant Content</h1>
      </div>
      <Avenant_tab :avenantState="avenantData.status" :avenantpage="'yes'" :avenantid="avenantData.id" :contractState="avenantData.contract_status"/>
    </div>

    <!-- Activation Dialog -->
    <Dialog 
      v-model:visible="activationDialog" 
      modal 
      header="Activate Avenant" 
      :style="{ width: '450px' }"
      :closable="true">
      <div class="activation-options">
        <div class="radio-option">
          <RadioButton v-model="activationType" inputId="activate-now" name="activation-type" value="now" />
          <label for="activate-now" class="ml-2">Activate now</label>
        </div>
        <div class="radio-option">
          <RadioButton v-model="activationType" inputId="activate-later" name="activation-type" value="later" />
          <label for="activate-later" class="ml-2">Select activation date</label>
        </div>
        
        <!-- Date picker that appears only when "Select activation date" is chosen -->
        <div v-if="activationType === 'later'" class="date-picker-container">
          <Calendar v-model="activationDate" :showIcon="true" dateFormat="dd/mm/yy" />
        </div>
      </div>
      
      <div class="dialog-footer">
        <Button label="Cancel" severity="secondary" text @click="closeDialog" />
        <Button 
          label="OK" 
          severity="success" 
          @click="handleActivation"
          :loading="processingActivation" />
      </div>
    </Dialog>
  </div>
</template>
<style scoped>
.container {
  display: flex;
  flex-direction: row;
}
.content {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding-top: 10px;
  padding-right: 20px;
  padding-bottom: 20px;
}
.title h1 {
  margin-top: 40px;
  margin-bottom: 30px;
  font-weight: bold;
  font-size: 2rem;
}
.title #maintitle {
  margin-top: 20px;
  margin-bottom: 10px;
  font-weight: bold;
  font-size: 2rem;
}
#contracts {
  margin-top: 1rem;
}
.loading,
.error {
  padding: 20px;
  margin: 20px 0;
  border-radius: 8px;
}
.loading {
  background-color: #f0f0f0;
}
.error {
  background-color: #ffebee;
  color: #d32f2f;
}
.activer {
    margin-top: 1rem;
    margin-left: 1rem;
    margin-bottom: 0.5rem;
    display: flex;
    flex-direction: row;
}
.activation-options {
  padding: 1rem 0;
}
.radio-option {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}
.date-picker-container {
  margin-top: 0.5rem;
  margin-left: 1.5rem;
  margin-bottom: 1rem;
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding-top: 1rem;
}
</style>