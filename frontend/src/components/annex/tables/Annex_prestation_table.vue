<template>
  <div class="w-full p-4">
    <!-- Search Bar & Add Button -->
    <div class="flex flex-col lg:flex-row justify-between items-center mb-4 gap-2">
      <div class="relative flex-grow flex items-center gap-2">
        <Dropdown v-model="searchFilter" :options="filterOptions" optionLabel="label" optionValue="value"
          placeholder="Filter By" class="border rounded-lg" />
        <InputText v-model="searchQuery" placeholder="Search..." class="w-full p-2 border rounded-lg" />
      </div>
      <Button v-if="props.contractState === 'Pending'" label="Add Prestation" icon="pi pi-plus"
        @click="openAddDialog" />
      <Button v-if="props.avenantpage === 'yes'" label="Add Prestation" icon="pi pi-plus" @click="openAddDialog" />
    </div>

    <!-- PrimeVue DataTable -->
    <DataTable :value="filteredItems" stripedRows paginator :rows="8" tableStyle="min-width: 50rem">
      <Column field="id" header="ID"></Column>
      <Column field="prestation_name" header="Name"></Column>
      <Column field="prestation_code" header="Code"></Column>
      <Column field="price" header="Price"></Column>
      <Column field="patient_part" header="Patient Part"></Column>
      <Column field="tva" header="TVA (%)">
        <template #body="slotProps">
          {{ slotProps.data.tva }}%
        </template>
      </Column>
      <Column v-if="props.contractState === 'Pending'" header="Actions">
        <template #body="slotProps">
          <Button icon="pi pi-pencil" severity="warn" size="small"  @click="openEditDialog(slotProps.data)" />
        </template>
      </Column>
      <Column v-if="props.contractState === 'Pending'" header="Delete">
        <template #body="slotProps">
          <Button icon="pi pi-trash" severity="danger" size="small"  class="ml-2"
            @click="confirmDelete(slotProps.data)" />
        </template>
      </Column>
      <template #empty>
        <div class="text-center text-gray-500 py-6 flex flex-col items-center">
          <i class="pi pi-list text-3xl mb-2"></i>
          <span>No prestations found.</span>
        </div>
      </template>
    </DataTable>

    <!-- Add Prestation Dialog -->
    <Dialog v-model:visible="addDialog" header="Add Prestation" modal>
      <div class="p-fluid flex flex-col px-5 w-full lg:w-96">
        <label class="mt-3">Name & Code:</label>
        <Dropdown v-model="selectedPrestation" :options="prestationOptions" optionLabel="label"
          placeholder="Select Prestation" class="w-full mb-3" @change="onPrestationChange" />

        <label class="mt-3">Price:</label>
        <InputNumber v-model="newService.price" mode="currency" currency="DZD" locale="en-US"
          @update:modelValue="calculatePatientPart" />

        <label class="mt-3">Patient Percentage (%):</label>
        <InputNumber v-model="newService.patientPercentage" suffix="%" @update:modelValue="calculatePatientPart" />

        <label class="mt-3">Patient Part:</label>
        <InputNumber v-model="newService.patientPart" mode="currency" currency="DZD" locale="en-US" />

        <label class="mt-3">TVA (%):</label>
        <InputNumber v-model="newService.tva" suffix="%" />

        <div class="mt-4 text-right">
          <Button label="Cancel" icon="pi pi-times" @click="addDialog = false" class="p-button-text" />
          <Button label="Save" icon="pi pi-check" @click="saveService" class="p-button-primary ml-2" />
        </div>
      </div>
    </Dialog>

    <!-- Edit Prestation Dialog -->
    <Dialog v-model:visible="editDialog" header="Edit Prestation" modal>
      <div class="p-fluid flex flex-col px-5 w-full lg:w-96">
        <label class="mt-3">Name & Code:</label>
        <div v-if="isEditingExistingPrestation" class="mb-3 p-2 border rounded bg-gray-100">
          {{ selectedService.prestation_name }} ({{ selectedService.prestation_code }})
        </div>
        <Dropdown v-else v-model="selectedEditPrestation" :options="prestationOptions" optionLabel="label"
          placeholder="Select Prestation" class="w-full mb-3" @change="onEditPrestationChange" />

        <label class="mt-3">Price:</label>
        <InputNumber v-model="selectedService.price" mode="currency" currency="DZD" locale="en-US"
          @update:modelValue="calculateSelectedPatientPart" />

        <label class="mt-3">Patient Percentage (%):</label>
        <InputNumber v-model="selectedService.patientPercentage" suffix="%"
          @update:modelValue="calculateSelectedPatientPart" />

        <label class="mt-3">Patient Part:</label>
        <InputNumber v-model="selectedService.patient_part" mode="currency" currency="DZD" locale="en-US" />

        <label class="mt-3">TVA (%):</label>
        <InputNumber v-model="selectedService.tva" suffix="%" />

        <div class="mt-4 text-right">
          <Button label="Cancel" icon="pi pi-times" @click="editDialog = false" class="p-button-text" />
          <Button label="Save" icon="pi pi-check" @click="updateService" class="p-button-primary ml-2" />
        </div>
      </div>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:visible="deleteDialog" header="Confirm Delete" modal class="w-full md:w-96">
      <div class="p-4">
        <p>Are you sure you want to delete this prestation?</p>
        <div class="mt-4 flex justify-end">
          <Button label="No" icon="pi pi-times" @click="deleteDialog = false" class="p-button-text" />
          <Button label="Yes" icon="pi pi-check" @click="deleteItem" severity="danger" class="ml-2" />
        </div>
      </div>
    </Dialog>

    <!-- Toast Component -->
    <Toast />
  </div>
</template>

<script setup>
import { ref, computed, defineProps, onMounted } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Dropdown from "primevue/dropdown";
import Toast from "primevue/toast";
import axios from "axios";
import { useToast } from "primevue/usetoast";

const API_BASE_URL = import.meta.env.VITE_SERVER_URL;

const props = defineProps({
  contractState: String,
  avenantpage: String,
  avenantState: String,
  annexId: String,
});

const toast = useToast();

// State variables
const searchQuery = ref("");
const searchFilter = ref("prestation_name"); // Default filter by name

const prestations = ref([]);
const prestationListItems = ref([]);
const prestationOptions = ref([]);
const isEditingExistingPrestation = ref(false);

const filterOptions = ref([
  { label: "By ID", value: "id" },
  { label: "By Name", value: "prestation_name" },
  { label: "By Code", value: "prestation_code" },
  { label: "By Price", value: "price" },
  { label: "By TVA", value: "tva" }
]);

// Dialog state variables
const addDialog = ref(false);
const editDialog = ref(false);
const deleteDialog = ref(false);
const selectedPrestation = ref(null);
const selectedEditPrestation = ref(null);
const itemToDelete = ref(null);

const newService = ref({
  prestation_list_id: null,
  price: 0,
  patientPercentage: 20,
  patientPart: 0,
  tva: 9.00  // Default TVA value
});

const selectedService = ref({});

// Fetch data on component mount
onMounted(async () => {
  await fetchPrestations();
  await fetchPrestationList();
});

// Fetch prestations for the annex
const fetchPrestations = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/convention/prestationprices/annex/${props.annexId}`);
    prestations.value = response.data;

    // Calculate percentage for each item
    prestations.value.forEach(item => {
      if (item.price > 0) {
        item.patientPercentage = (item.patient_part / item.price) * 100;
      } else {
        item.patientPercentage = 0;
      }
      
      // Ensure TVA is properly formatted
      if (item.tva === null || item.tva === undefined) {
        item.tva = 9.00; // Default value if missing
      }
    });

  } catch (error) {
    console.error('Error fetching prestations:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load prestations', life: 3000 });
  }
};

// Fetch prestation list options (only once)
const fetchPrestationList = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/convention/prestationlists/annex/${props.annexId}`);
    prestationListItems.value = response.data;

    // Format options for dropdown
    prestationOptions.value = prestationListItems.value.map(item => ({
      label: `${item.prestation_name} (${item.prestation_code})`,
      value: item.id,
      name: item.prestation_name,
      code: item.prestation_code
    }));

  } catch (error) {
    console.error('Error fetching prestation list:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load prestation list', life: 3000 });
  }
};

// Add prestation handlers
const openAddDialog = () => {
  selectedPrestation.value = null;
  newService.value = {
    prestation_list_id: null,
    price: 0,
    patientPercentage: 20,
    patientPart: 0,
    tva: 9.00  // Default TVA value
  };
  addDialog.value = true;
};

const onPrestationChange = () => {
  if (selectedPrestation.value) {
    newService.value.prestation_list_id = selectedPrestation.value.value;
  }
};

const calculatePatientPart = () => {
  if (newService.value.price && newService.value.patientPercentage) {
    newService.value.patientPart = (newService.value.price * newService.value.patientPercentage) / 100;
  }
};

const saveService = async () => {
  if (!selectedPrestation.value) {
    toast.add({ severity: 'warn', summary: 'Warning', detail: 'Please select a prestation', life: 3000 });
    return;
  }

  try {
    const serviceData = {
      prestation_list_id: newService.value.prestation_list_id,
      price: newService.value.price,
      patient_part: newService.value.patientPart,
      tva: newService.value.tva,
      updated_by_id: null,
      avenant_id: null,
      head: 'yes'
    };

    await axios.post(`${API_BASE_URL}/api/convention/prestationprices/add/${props.annexId}`, serviceData);

    toast.add({ severity: 'success', summary: 'Success', detail: 'Prestation added successfully', life: 3000 });
    addDialog.value = false;

    // Refresh prestations list
    await fetchPrestations();
    await fetchPrestationList(); // Refresh available options

  } catch (error) {
    console.error('Error adding prestation:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to add prestation', life: 3000 });
  }
};

// Edit prestation handlers
const openEditDialog = (item) => {
  selectedService.value = { ...item };

  // Calculate percentage if not available
  if (!selectedService.value.patientPercentage && selectedService.value.price > 0) {
    selectedService.value.patientPercentage = (selectedService.value.patient_part / selectedService.value.price) * 100;
  }

  // Ensure TVA is available
  if (selectedService.value.tva === null || selectedService.value.tva === undefined) {
    selectedService.value.tva = 9.00;
  }

  // For existing items, we don't need to change the prestation_list_id
  isEditingExistingPrestation.value = true;
  editDialog.value = true;
};

const onEditPrestationChange = () => {
  if (selectedEditPrestation.value) {
    selectedService.value.prestation_list_id = selectedEditPrestation.value.value;
    selectedService.value.prestation_name = selectedEditPrestation.value.name;
    selectedService.value.prestation_code = selectedEditPrestation.value.code;
  }
};

const calculateSelectedPatientPart = () => {
  if (selectedService.value.price && selectedService.value.patientPercentage) {
    selectedService.value.patient_part = (selectedService.value.price * selectedService.value.patientPercentage) / 100;
  }
};

const updateService = async () => {
  try {
    const updateData = {
      price: selectedService.value.price,
      patient_part: selectedService.value.patient_part,
      tva: selectedService.value.tva,
      updated_by_id: null,
      prestation_list_id: selectedService.value.prestation_list_id,
      avenant_id: null,
      head: 'yes'
    };

    await axios.put(`${API_BASE_URL}/api/convention/prestationprices/edit/${selectedService.value.id}`, updateData);

    toast.add({ severity: 'success', summary: 'Success', detail: 'Prestation updated successfully', life: 3000 });
    editDialog.value = false;

    // Refresh prestations list
    await fetchPrestations();

  } catch (error) {
    console.error('Error updating prestation:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update prestation', life: 3000 });
  }
};

// Delete prestation handlers
const confirmDelete = (item) => {
  itemToDelete.value = item;
  deleteDialog.value = true;
};

const deleteItem = async () => {
  if (!itemToDelete.value) return;

  try {
    await axios.delete(`${API_BASE_URL}/api/convention/prestationprices/delete/${itemToDelete.value.id}`);

    toast.add({ severity: 'success', summary: 'Success', detail: 'Prestation deleted successfully', life: 3000 });
    deleteDialog.value = false;
    itemToDelete.value = null;

    // Refresh prestations list
    await fetchPrestations();
    await fetchPrestationList(); // Refresh available options

  } catch (error) {
    console.error('Error deleting prestation:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete prestation', life: 3000 });
  }
};

// Filtered items based on search
const filteredItems = computed(() => {
  if (!searchQuery.value) return prestations.value;

  return prestations.value.filter(item => {
    const searchValue = searchQuery.value.toLowerCase();
    const fieldValue = item[searchFilter.value];

    if (fieldValue === null || fieldValue === undefined) return false;
    return String(fieldValue).toLowerCase().includes(searchValue);
  });
});
</script>