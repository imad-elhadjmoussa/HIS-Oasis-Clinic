<template>
  <div class="w-full p-4">
    <!-- Search Bar, Filter Dropdown & Add Button -->
    <div class="flex flex-col lg:flex-row justify-between items-center mb-4 gap-2">
      <div class="flex items-center gap-2 flex-grow">
        <!-- Dropdown Filter -->
        <Dropdown v-model="filterType" :options="filterOptions" optionLabel="label" optionValue="value"
          class="w-40 border rounded-lg" />
        <!-- Dynamic Search Input -->
        <InputText v-if="filterType === 'id'" v-model="searchQuery" placeholder="Search by ID..." class="w-full p-2 " />
        <Calendar v-else v-model="searchDate" placeholder="Select Date" class="w-full p-2  rounded-lg"
          dateFormat="dd/mm/yy" showIcon />
      </div>
      <!-- Add-->
      <Button v-if="props.contractState === 'Pending'" label="Add" icon="pi pi-plus" @click="openAddDialog()" />
    </div>
    <!-- PrimeVue DataTable -->
    <DataTable :value="filteredItems" stripedRows paginator :rows="8" tableStyle="min-width: 50rem">
      <Column field="id" header="ID"></Column>
      <Column field="title" header="Title"></Column>
      <Column field="created_at" header="Created At">
        <template #body="slotProps">
          {{ formatDate(slotProps.data.created_at) }}
        </template>
      </Column>
      <Column v-if="props.contractState === 'Pending'" header="Actions">
        <template #body="slotProps">
          <Button icon="pi pi-pencil" severity="warn" size="small" @click="openEditDialog(slotProps.data)" />
          <Button icon="pi pi-trash" severity="danger" size="small" class="ml-2"
            @click="confirmDelete(slotProps.data)" />
        </template>
      </Column>
      <Column header="Description">
        <template #body="slotProps">
          <Button icon="pi pi-eye" severity="info" size="small" label="Description" @click="showMoreInfo(slotProps.data)" />
        </template>
      </Column>
      <template #empty>
        <div class="text-center text-gray-500 py-6 flex flex-col items-center">
          <i class="pi pi-file text-3xl mb-2"></i>
          <span>No agreements found.</span>
        </div>
      </template>
    </DataTable>
    <!-- Add Agreement Dialog -->
    <Dialog v-model:visible="addDialogVisible" header="Add Agreement" modal class="w-1/3">
      <div class="p-4">
        <div class="mb-3">
          <label class="block text-sm font-medium">Title</label>
          <InputText v-model="addForm.title" class="w-full p-2 border rounded-lg" />
        </div>
        <div class="mb-3">
          <label class="block text-sm font-medium">Description</label>
          <Textarea v-model="addForm.description" class="w-full p-2 border rounded-lg" rows="3" />
        </div>
        <div class="flex justify-end gap-2">
          <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="addDialogVisible = false" />
          <Button label="Save" icon="pi pi-check" class="p-button-primary ml-2" @click="saveAddItem" />
        </div>
      </div>
    </Dialog>
    <!-- Edit agreement Dialog -->
    <Dialog v-model:visible="editDialogVisible" header="Edit Agreement" modal class="w-1/3">
      <div class="p-4">
        <div class="mb-3">
          <label class="block text-sm font-medium">Title</label>
          <InputText v-model="editForm.title" class="w-full p-2 border rounded-lg" />
        </div>
        <div class="mb-3">
          <label class="block text-sm font-medium">Description</label>
          <Textarea v-model="editForm.description" class="w-full p-2 border rounded-lg" rows="3" />
        </div>
        <div class="flex justify-end gap-2">
          <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="editDialogVisible = false" />
          <Button label="Save" icon="pi pi-check" class="p-button-primary ml-2" @click="saveEditItem" />
        </div>
      </div>
    </Dialog>
    <!-- More Info Dialog -->
    <Dialog v-model:visible="infoDialogVisible" header="Description" modal class="w-1/3">
      <div class="p-4">
        <div class="mb-3">
          <h3 class="text-lg font-semibold mb-2">{{ selectedItem.title || "Untitled" }}</h3>
        </div>
        <div class="border p-3 rounded-lg max-h-60 overflow-auto break-words">
          {{ selectedItem.description || "No description available." }}
        </div>
      </div>
      <div class="flex justify-end gap-2 mt-4">
        <Button label="Close" class="p-button-text" @click="infoDialogVisible = false" />
      </div>
    </Dialog>
    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:visible="deleteDialogVisible" header="Confirm Delete" modal class="w-1/3">
      <div class="p-4">
        <p>Are you sure you want to delete this agreement?</p>
      </div>
      <div class="flex justify-end gap-2 mt-4">
        <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteDialogVisible = false" />
        <Button label="Yes" icon="pi pi-check" severity="danger" @click="deleteItem" />
      </div>
    </Dialog>
    <!-- Toast -->
    <Toast />
  </div>
</template>
<script setup>
import { ref, computed, defineProps, onMounted } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Dropdown from "primevue/dropdown";
import Calendar from "primevue/calendar";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_SERVER_URL;
const props = defineProps({
  contractState: String,
  contractid: String  // Changed from contractId to contractid to match parent component
});
const toast = useToast();
const searchQuery = ref("");
const searchDate = ref(null);
const filterType = ref("id");
const filterOptions = [
  { label: "By ID", value: "id" },
  { label: "By Creation Time", value: "createdAt" }
];
const addDialogVisible = ref(false);
const editDialogVisible = ref(false);
const infoDialogVisible = ref(false);
const deleteDialogVisible = ref(false);
const selectedItem = ref({});
const addForm = ref({ title: "", description: "" });
const editForm = ref({ id: null, contract_id: "", title: "", description: "" });
const itemToDelete = ref(null);
const items = ref([]);
const filteredItems = computed(() => {
  if (filterType.value === "id") {
    return items.value.filter(item =>
      item.id.toString().includes(searchQuery.value)
    );
  } else {
    if (!searchDate.value) {
      return items.value;
    }
    const formattedDate = searchDate.value.toISOString().split('T')[0];
    return items.value.filter(item => {
      const itemDate = new Date(item.created_at).toISOString().split('T')[0];
      return itemDate === formattedDate;
    });
  }
});
onMounted(() => {
  fetchAgreements();
});
const fetchAgreements = async () => {
  if (!props.contractid) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Contract ID is missing', life: 3000 });
    return;
  }
  try {
    const response = await axios.get(`${API_BASE_URL}/api/convention/agreements/contract/${props.contractid}`);
    items.value = response.data;
  } catch (error) {
    console.error('Error fetching agreements:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch agreements', life: 3000 });
  }
};
const openAddDialog = () => {
  addForm.value = { title: "", description: "" };
  addDialogVisible.value = true;
};
const openEditDialog = (item) => {
  editForm.value = {
    id: item.id,
    title: item.title || "",
    description: item.description
  };
  editDialogVisible.value = true;
};
const saveAddItem = async () => {
  if (!addForm.value.description) {
    toast.add({ severity: 'warn', summary: 'Warning', detail: 'Description is required', life: 3000 });
    return;
  }
  if (!addForm.value.title) {
    toast.add({ severity: 'warn', summary: 'Warning', detail: 'Title is required', life: 3000 });
    return;
  }
  try {
    await axios.post(`${API_BASE_URL}/api/convention/agreements/contract/${props.contractid}`, {
      title: addForm.value.title,
      description: addForm.value.description
    });
    await fetchAgreements();
    addDialogVisible.value = false;
    toast.add({ severity: 'success', summary: 'Success', detail: 'Agreement added successfully', life: 3000 });
  } catch (error) {
    console.error('Error adding agreement:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to add agreement', life: 3000 });
  }
};
const saveEditItem = async () => {
  if (!editForm.value.description) {
    toast.add({ severity: 'warn', summary: 'Warning', detail: 'Description is required', life: 3000 });
    return;
  }
  if (!editForm.value.title) {
    toast.add({ severity: 'warn', summary: 'Warning', detail: 'Title is required', life: 3000 });
    return;
  }
  try {
    await axios.put(`${API_BASE_URL}/api/convention/agreements/${editForm.value.id}`, {
      title: editForm.value.title,
      description: editForm.value.description
    });
    await fetchAgreements();
    editDialogVisible.value = false;
    toast.add({ severity: 'success', summary: 'Success', detail: 'Agreement updated successfully', life: 3000 });
  } catch (error) {
    console.error('Error updating agreement:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update agreement', life: 3000 });
  }
};
const showMoreInfo = (item) => {
  selectedItem.value = { ...item };
  infoDialogVisible.value = true;
};
const confirmDelete = (item) => {
  itemToDelete.value = item;
  deleteDialogVisible.value = true;
};
const deleteItem = async () => {
  if (!itemToDelete.value) return;
  try {
    await axios.delete(`${API_BASE_URL}/api/convention/agreements/${itemToDelete.value.id}`);
    await fetchAgreements();
    deleteDialogVisible.value = false;
    toast.add({ severity: 'success', summary: 'Success', detail: 'Agreement deleted successfully', life: 3000 });
  } catch (error) {
    console.error('Error deleting agreement:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete agreement', life: 3000 });
  }
};
// Date formatter function
const formatDate = (dateString) => {
  if (!dateString) return '';
  return dateString.split('T')[0]; // Extracts '2025-05-05'
};
</script>