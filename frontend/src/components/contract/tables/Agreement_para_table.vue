<template>
  <div class="w-full p-4">
    <!-- Search Bar, Filter Dropdown & Add Button -->
    <div class="flex flex-col lg:flex-row justify-between items-center mb-4 gap-2">
      <div class="flex items-center gap-2 flex-grow">
        <!-- Dropdown Filter -->
        <Dropdown v-model="filterType" :options="filterOptions" optionLabel="label" optionValue="value"
          class="w-40 border rounded-lg" />

        <!-- Dynamic Search Input -->
        <InputText v-if="filterType === 'id'" v-model="searchQuery" placeholder="Search by ID..."
          class="w-full rounded-lg" />
        <Calendar v-else v-model="searchDate" placeholder="Select Date" class="w-full rounded-lg" dateFormat="dd/mm/yy"
          showIcon />
      </div>
    </div>

    <!-- PrimeVue DataTable -->
    <DataTable :value="filteredItems" stripedRows paginator :rows="8" tableStyle="min-width: 60rem">
      <Column field="id" header="ID"></Column>
      
      <!-- Formatted Date Columns -->
      <Column field="start_date" header="Start Date">
        <template #body="slotProps">
          {{ formatDateDisplay(slotProps.data.start_date) }}
        </template>
      </Column>
      
      <Column field="end_date" header="End Date">
        <template #body="slotProps">
          {{ slotProps.data.end_date ? formatDateDisplay(slotProps.data.end_date) : "There is no end date" }}
        </template>
      </Column>
      
      <Column header="Family Auth">
        <template #body="slotProps">
          {{ formatFamilyAuth(slotProps.data.family_auth) }}
        </template>
      </Column>
      
      <Column field="max_price" header="Max Price">
        <template #body="slotProps">
          {{ slotProps.data.max_price !== null && slotProps.data.max_price !== undefined ? slotProps.data.max_price : "There is no max price" }}
        </template>
      </Column>
      
      <Column field="min_price" header="Min Price">
        <template #body="slotProps">
          {{ slotProps.data.min_price !== null && slotProps.data.min_price !== undefined ? slotProps.data.min_price : "There is no min price" }}
        </template>
      </Column>
      
      <!-- Properly formatted percentage column -->
      <Column field="discount_percentage" header="Discount (%)">
        <template #body="slotProps">
          {{ formatPercentage(slotProps.data.discount_percentage) }}
        </template>
      </Column>
      
      <Column field="created_at" header="Created At">
        <template #body="slotProps">
          {{ formatDateDisplay(slotProps.data.created_at) }}
        </template>
      </Column>

      <!-- Edit button for Pending contracts -->
      <Column v-if="props.contractState === 'Pending'" header="Edit">
        <template #body="slotProps">
          <Button icon="pi pi-pencil" severity="warn"  
            @click="editItem(slotProps.data)" />
        </template>
      </Column>
      <Column v-if="avenantpage === 'yes' && avenantState === 'Pending'" header="Avenant">
        <template #body="slotProps">
          <div class="flex gap-2">
            <Button icon="pi pi-pencil" severity="warn" size="small" 
              @click="editItem(slotProps.data)" />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- Edit Dialog -->
    <Dialog v-model:visible="dialogVisible" header="Edit Agreement Details" modal :style="{ width: '30rem' }">
      <div class="p-fluid flex flex-col px-5 w-full max-h-[85vh] overflow-auto">
        <label class="mt-3">Start Date:</label>
        <Calendar v-model="currentItem.start_date" dateFormat="dd/mm/yy" showIcon class="w-full" />

        <label class="mt-3">End Date:</label>
        <Calendar v-model="currentItem.end_date" dateFormat="dd/mm/yy" showIcon class="w-full" />

        <label class="mt-3">Max Price:</label>
        <InputNumber v-model="currentItem.max_price" mode="currency" currency="DZD" locale="fr-FR" class="w-full" />

        <label class="mt-3">Min Price:</label>
        <InputNumber v-model="currentItem.min_price" mode="currency" currency="DZD" locale="fr-FR" class="w-full" />

        <label class="mt-3">Discount Percentage (%):</label>
        <div class="p-inputgroup">
          <InputNumber v-model="currentItem.discount_percentage" class="w-full" />
        </div>

        <label class="mt-3 mb-4">Family Authorization:</label>
        <div class="flex flex-wrap gap-4">
          <div v-for="option in familyAuthOptions" :key="option" class="flex items-center space-x-2">
            <Checkbox :value="option" v-model="selectedFamilyAuth" />
            <label>{{ option }}</label>
          </div>
        </div>

        <div class="mt-4 text-right">
          <Button label="Cancel" icon="pi pi-times" @click="dialogVisible = false" class="p-button-text" />
          <Button label="Save" icon="pi pi-check" @click="saveItem" class="p-button-primary ml-2" />
        </div>
      </div>
    </Dialog>

    <!-- Toast for notifications -->
    <Toast />
  </div>
</template>

<script setup>
import { ref, computed, defineProps, onMounted, watch } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Checkbox from "primevue/checkbox";
import Calendar from "primevue/calendar";
import Dropdown from "primevue/dropdown";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_SERVER_URL;

const toast = useToast();

const props = defineProps({
  contractState: String,
  avenantpage: String,
  avenantState: String,
  contractid: String,
  avenantid:String
});

// Search filters
const searchQuery = ref("");
const searchDate = ref(null);
const filterType = ref("id");

const filterOptions = [
  { label: "By ID", value: "id" },
  { label: "By Creation Time", value: "created_at" },
  { label: "By Start Date", value: "start_date" },
  { label: "By End Date", value: "end_date" }
];

const dialogVisible = ref(false);
const currentItem = ref({
  start_date: null,
  end_date: null,
  family_auth: "",
  max_price: 0,
  min_price: 0,
  discount_percentage: 0,
  avenant_id: null
});

// Family auth options based on database schema
const familyAuthOptions = ["ascendant", "descendant", "Conjoint", "adherent", "autre"];
const selectedFamilyAuth = ref([]);

// Watch for changes in selectedFamilyAuth and update currentItem.family_auth
watch(selectedFamilyAuth, (newVal) => {
  currentItem.value.family_auth = newVal.join(',');
});

const items = ref([]);

// Format date for display in DD/MM/YYYY format
const formatDateDisplay = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());

  return `${day}/${month}/${year}`;
};

// Format family_auth for display
const formatFamilyAuth = (familyAuth) => {
  if (!familyAuth) return "None";
  return typeof familyAuth === 'string' 
    ? familyAuth.split(',').join(', ') 
    : familyAuth.join(', ');
};

// Format percentage for display
const formatPercentage = (percentage) => {
  if (!percentage) return "0%";
  const value = parseFloat(percentage);
  return isNaN(value) ? "0%" : `${value}%`;
};

// Fetch agreement details based on props
const fetchAgreementDetails = async () => {
  try {
    let response;
    
    if (props.avenantpage === "yes") {
      // Fetch by avenant ID
      response = await axios.get(`${API_BASE_URL}/api/convention/agreementdetails/avenant/${props.avenantid}`);
    } else {
      // Fetch by contract ID
      response = await axios.get(`${API_BASE_URL}/api/convention/agreementdetails/${props.contractid}`);
    }
    
    // Process the fetched data
    items.value = response.data.map(item => ({
      ...item,
      // Convert dates to Date objects for Calendar component
      start_date: item.start_date ? new Date(item.start_date) : null,
      end_date: item.end_date ? new Date(item.end_date) : null,
      // Ensure family_auth is a string
      family_auth: item.family_auth || ""
    }));
    
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `Failed to load agreement details: ${error.message}`,
      life: 3000
    });
    console.error("Error fetching agreement details:", error);
  }
};

onMounted(() => {
  fetchAgreementDetails();
});

// Filter Logic
const filteredItems = computed(() => {
  if (filterType.value === "id") {
    return items.value.filter(item => 
      item.contract_id && item.contract_id.toString().includes(searchQuery.value)
    );
  } else if (searchDate.value) {
    const searchDateStr = formatDate(searchDate.value);
    if (filterType.value === "created_at") {
      return items.value.filter(item => formatDate(item.created_at) === searchDateStr);
    } else if (filterType.value === "start_date") {
      return items.value.filter(item => formatDate(item.start_date) === searchDateStr);
    } else if (filterType.value === "end_date") {
      return items.value.filter(item => formatDate(item.end_date) === searchDateStr);
    }
  }
  return items.value;
});

// Open Dialog for Editing
const editItem = (item) => {
  currentItem.value = { ...item };
  
  // Parse family auth string to array for checkboxes
  if (item.family_auth) {
    selectedFamilyAuth.value = item.family_auth.split(',');
  } else {
    selectedFamilyAuth.value = [];
  }
  
  dialogVisible.value = true;
};

// Save Item Logic
const saveItem = async () => {
  try {
    // Prepare data for API
    const payload = {
      start_date: formatDate(currentItem.value.start_date),
      end_date: formatDate(currentItem.value.end_date),
      family_auth: selectedFamilyAuth.value.join(','),
      max_price: currentItem.value.max_price,
      min_price: currentItem.value.min_price,
      discount_percentage: currentItem.value.discount_percentage,
      avenant_id: currentItem.value.avenant_id
    };

    // Call API to update agreement detail
    const response = await axios.put(
      `${API_BASE_URL}/api/convention/agreementdetails/${props.contractid}/${currentItem.value.id}`,
      payload
    );

    // Refresh data
    await fetchAgreementDetails();
    
    dialogVisible.value = false;
    
    // Show success message
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Agreement details updated successfully',
      life: 3000
    });
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `Failed to update agreement details: ${error.message}`,
      life: 3000
    });
    console.error("Error updating agreement details:", error);
  }
};

// Utility function to format date for storage (YYYY-MM-DD)
const formatDate = (date) => {
  if (!date) return null;
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return null; // Return null if invalid date
  
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
</script>