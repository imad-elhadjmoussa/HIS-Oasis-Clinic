<template>
  <div class="w-full p-4">
    <!-- Toast and Confirm Dialog -->
    <Toast />
    <ConfirmDialog />

    <!-- Search Bar & Add Button -->
    <div class="flex flex-col lg:flex-row justify-between items-center mb-4 gap-2">
      <div class="relative flex-grow flex items-center gap-2">
        <Dropdown v-model="searchFilter" :options="filterOptions" optionLabel="label" optionValue="value"
          placeholder="Filter By" class="border rounded-lg" />
        <InputText v-model="searchQuery" placeholder="Search..." class="w-full p-2 border rounded-lg" />
      </div>
      <Button label="Add Contract" icon="pi pi-plus" @click="openAddDialog" />
    </div>

    <!-- PrimeVue DataTable -->
    <DataTable :value="filteredItems" stripedRows paginator :rows="8" tableStyle="min-width: 50rem">
      <Column field="id" header="ID"></Column>
      <Column field="contract_name" header="Name"></Column>
      <Column field="start_date" header="Start Date"></Column>
      <Column field="end_date" header="End Date"><template #body="slotProps">
          {{ slotProps.data.end_date || 'No end date' }}
        </template>
      </Column>

      <!-- Status Column -->
      <Column header="Status">
        <template #body="slotProps">
          <Tag :severity="getTagSeverity(slotProps.data.status)">
            {{ slotProps.data.status }}
          </Tag>
        </template>
      </Column>

      <!-- Actions Column -->
      <Column header="Details">
        <template #body="slotProps">
          <div class="flex gap-2">
            <Button icon="pi pi-eye" severity="info" label="Details" size="small" @click="moreInfo(slotProps.data)" />
          </div>
        </template>
      </Column>
      <Column header="Delete">
        <template #body="slotProps">
          <div class="flex gap-2">
            <Button v-if="slotProps.data.status === 'Pending'" icon="pi pi-trash" size="small" severity="danger"
              @click="confirmDelete(slotProps.data)" />
          </div>
        </template>
      </Column>
      <template #empty>
        <div class="text-center text-gray-500 py-6 flex flex-col items-center">
          <i class="pi pi-file text-3xl mb-2"></i>
          <span>No contracts found.</span>
        </div>
      </template>
    </DataTable>

    <!-- Add Contract Dialog -->
    <Dialog v-model:visible="addDialog" header="Add Contract" modal class="p-4" :style="{ width: '30rem' }">
      <div class="p-fluid flex flex-col px-5 w-full lg:w-96">
        <label>Name:</label>
        <InputText size="small" v-model="newContract.contract_name" />
        <small v-if="formErrors.contract_name" class="text-red-500">{{ formErrors.contract_name }}</small>

        <label class="mt-3">Start Date:</label>
        <Calendar v-model="newContract.start_date" dateFormat="dd/mm/yy" showIcon class="w-full" />
        <small v-if="formErrors.start_date" class="text-red-500">{{ formErrors.start_date }}</small>

        <label class="mt-3">End Date:</label>
        <Calendar v-model="newContract.end_date" dateFormat="dd/mm/yy" showIcon class="w-full" />
        <small v-if="formErrors.end_date" class="text-red-500">{{ formErrors.end_date }}</small>

        <label class="mt-3">Min Price:</label>
        <InputNumber v-model="newContract.min_price" mode="currency" currency="DZD" locale="fr-FR" />
        <small v-if="formErrors.min_price" class="text-red-500">{{ formErrors.min_price }}</small>

        <label class="mt-3">Max Price:</label>
        <InputNumber v-model="newContract.max_price" mode="currency" currency="DZD" locale="fr-FR" />
        <small v-if="formErrors.max_price" class="text-red-500">{{ formErrors.max_price }}</small>

        <label class="mt-3">Discount Percentage:</label>
        <InputNumber v-model="newContract.discount_percentage" suffix="%" />
        <small v-if="formErrors.discount_percentage" class="text-red-500">{{ formErrors.discount_percentage }}</small>

        <label class="mt-3">Family Authorization:</label>
        <div class="flex flex-wrap gap-3 mt-2">
          <div v-for="option in familyAuthOptions" :key="option.value" class="flex align-items-center">
            <Checkbox v-model="selectedFamilyAuth" :value="option.value" :inputId="option.value" name="family_auth" />
            <label :for="option.value" class="ml-2">{{ option.label }}</label>
          </div>
        </div>
        <small v-if="formErrors.family_auth" class="text-red-500">{{ formErrors.family_auth }}</small>

        <div class="mt-4 text-right">
          <Button label="Cancel" icon="pi pi-times" @click="addDialog = false" class="p-button-text" />
          <Button label="Save" icon="pi pi-check" @click="saveContract" class="p-button-primary ml-2" />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, onMounted } from "vue";
import axios from "axios";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Button from "primevue/button";
import Tag from "primevue/tag";
import Dialog from "primevue/dialog";
import Dropdown from "primevue/dropdown";
import Calendar from "primevue/calendar";
import Checkbox from "primevue/checkbox";
import Toast from "primevue/toast";
import ConfirmDialog from "primevue/confirmdialog";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import { useRouter } from "vue-router";
import { useUserStore } from './../../../stors/user';  // Import Pinia store
const API_BASE_URL = import.meta.env.VITE_SERVER_URL;
const userStore = useUserStore();  // Pinia store for user
const props = defineProps({
  companyId: {
    type: String,
    required: true
  }
});

const router = useRouter();
const toast = useToast();
const confirm = useConfirm();
const searchQuery = ref("");
const searchFilter = ref("contract_name"); // Default filter by name

// Dropdown options for filtering
const filterOptions = ref([
  { label: "By ID", value: "id" },
  { label: "By Name", value: "contract_name" },
  { label: "Active Only", value: "Active" },
  { label: "Pending Only", value: "Pending" },
  { label: "Expired Only", value: "Expired" }
]);

// Family authorization options
const familyAuthOptions = ref([
  { label: "Ascendant", value: "ascendant" },
  { label: "Descendant", value: "descendant" },
  { label: "Conjoint", value: "Conjoint" },
  { label: "Adherent", value: "adherent" },
  { label: "Autre", value: "autre" }
]);

const selectedFamilyAuth = ref([]);

const items = ref([]);
const addDialog = ref(false);
const newContract = ref({
  contract_name: "",
  start_date: null,
  end_date: null,
  min_price: null,
  max_price: null,
  discount_percentage: null
});

const formErrors = ref({
  contract_name: "",
  start_date: "",
  end_date: "",
  min_price: "",
  max_price: "",
  discount_percentage: "",
  family_auth: ""
});

// Function to return severity based on status
const getTagSeverity = (status) => {
  switch (status) {
    case "Active":
      return "success";
    case "Expired":
      return "danger";
    case "Pending":
      return "warning";
    default:
      return "info";
  }
};

// Fetch contracts for the current company
const fetchContracts = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/convention/contracts/company/${props.companyId}`);

    // Check if response.data is an array or has a specific property that contains the array
    const contractData = Array.isArray(response.data) ? response.data :
      (response.data.contracts || response.data.data || []);

    items.value = contractData;
    console.log("Fetched contracts:", items.value); // For debugging
  } catch (error) {
    console.error("Failed to fetch contracts:", error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load contracts: ' + (error.response?.data?.message || error.message),
      life: 3000
    });
  }
};

onMounted(() => {
  fetchContracts();
});

// Computed property for filtering items based on selection
const filteredItems = computed(() => {
  if (["Active", "Pending", "Expired"].includes(searchFilter.value)) {
    return items.value.filter(item => item.status === searchFilter.value);
  }
  return items.value.filter(item => {
    const searchValue = searchQuery.value.toLowerCase();
    return String(item[searchFilter.value] || "").toLowerCase().includes(searchValue);
  });
});

const resetFormErrors = () => {
  formErrors.value = {
    contract_name: "",
    start_date: "",
    end_date: "",
    min_price: "",
    max_price: "",
    discount_percentage: "",
    family_auth: ""
  };
};

const validateForm = (formData) => {
  resetFormErrors();
  let isValid = true;

  if (!formData.contract_name) {
    formErrors.value.contract_name = "Contract name is required";
    isValid = false;
  }

  if (!formData.start_date) {
    formErrors.value.start_date = "Start date is required";
    isValid = false;
  }

  if (!formData.end_date) {
    formErrors.value.end_date = "End date is required";
    isValid = false;
  } else if (formData.start_date && new Date(formData.start_date) >= new Date(formData.end_date)) {
    formErrors.value.end_date = "End date must be after start date";
    isValid = false;
  }

  // Additional validations for the new fields if needed
  if (formData.min_price !== null && formData.max_price !== null && parseFloat(formData.min_price) > parseFloat(formData.max_price)) {
    formErrors.value.max_price = "Max price must be greater than min price";
    isValid = false;
  }

  if (formData.discount_percentage !== null && (parseFloat(formData.discount_percentage) < 0 || parseFloat(formData.discount_percentage) > 100)) {
    formErrors.value.discount_percentage = "Discount percentage must be between 0 and 100";
    isValid = false;
  }

  return isValid;
};

const openAddDialog = () => {
  resetFormErrors();
  newContract.value = {
    contract_name: "",
    start_date: null,
    end_date: null,
    min_price: null,
    max_price: null,
    discount_percentage: null
  };
  selectedFamilyAuth.value = [];
  addDialog.value = true;
};

const formatDateForAPI = (date) => {
  if (!date) return null;

  const d = new Date(date);
  // Format: YYYY-MM-DD
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const saveContract = async () => {
  // Make a copy of the form data
  const contractData = { ...newContract.value };

  // Format dates before validation
  if (contractData.start_date) {
    contractData.start_date = formatDateForAPI(contractData.start_date);
  }

  if (contractData.end_date) {
    contractData.end_date = formatDateForAPI(contractData.end_date);
  }

  // Format numeric values - ensure they're numbers, not objects (PrimeVue InputNumber returns objects)
  if (contractData.min_price !== null) {
    contractData.min_price = Number(contractData.min_price);
  }

  if (contractData.max_price !== null) {
    contractData.max_price = Number(contractData.max_price);
  }

  if (contractData.discount_percentage !== null) {
    contractData.discount_percentage = Number(contractData.discount_percentage);
  }

  // Add the family_auth from checkboxes (convert array to SET format for MySQL)
  if (selectedFamilyAuth.value.length > 0) {
    contractData.family_auth = selectedFamilyAuth.value.join(',');
  } else {
    contractData.family_auth = null; // Explicitly set to null if empty
  }

  console.log('Sending data to API:', contractData); // Debug the data being sent

  if (!validateForm(contractData)) return;

  try {
    // Call the POST API endpoint
    const response = await axios.post(`${API_BASE_URL}/api/convention/contracts/company/${props.companyId}`, contractData);

    console.log('API response:', response.data); // Debug the response

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Contract created successfully',
      life: 3000
    });

    addDialog.value = false;
    fetchContracts(); // Refresh the list
  } catch (error) {
    console.error('API error details:', error.response?.data); // Debug the error

    // Show error toast with backend error message
    const errorMessage = error.response?.data?.message || 'Failed to create contract';
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: errorMessage,
      life: 3000
    });
  }
};

// Navigate to contract details
const moreInfo = (contract) => {
  const basePath = userStore.role === 'Admin' ? '/conventionoffice' : '';
  router.push({
    path: `${basePath}/contract/${contract.id}`,
  });
};

// NEW FUNCTIONS FOR DELETE FUNCTIONALITY
// Show confirmation dialog before deleting a contract
const confirmDelete = (contract) => {
  confirm.require({
    message: `Are you sure you want to delete contract "${contract.contract_name}"?`,
    header: 'Delete Confirmation',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: () => deleteContract(contract.id),
    reject: () => {
      // Optional: Do something when deletion is rejected
      toast.add({
        severity: 'info',
        summary: 'Cancelled',
        detail: 'Contract deletion cancelled',
        life: 3000
      });
    }
  });
};

// Delete contract function
const deleteContract = async (contractId) => {
  try {
    await axios.delete(`${API_BASE_URL}/api/convention/contracts/${contractId}`);

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Contract deleted successfully',
      life: 3000
    });

    // Refresh the contracts list
    fetchContracts();
  } catch (error) {
    console.error('Error deleting contract:', error);

    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to delete contract: ' + (error.response?.data?.message || error.message),
      life: 3000
    });
  }
};
</script>