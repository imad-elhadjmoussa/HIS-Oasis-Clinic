<template>
    <div class="w-full p-4">
        <Toast position="top-right" />
        <!-- Search Bar, Filter Dropdown & Add Button -->
        <div class="flex flex-col lg:flex-row justify-between items-center mb-4 gap-2">
            <div class="flex flex-grow gap-2">
                <Dropdown v-model="selectedFilter" :options="filterOptions" optionLabel="label" optionValue="value"
                    class="p-dropdown-sm" />

                <InputText v-if="selectedFilter !== 'created_at'" v-model="searchQuery" placeholder="Search..."
                    class="w-full p-2 border rounded-lg" />

                <Calendar v-if="selectedFilter === 'created_at'" v-model="searchQuery" dateFormat="yy-mm-dd"
                    placeholder="Select Date" class="w-full rounded-lg" showIcon />
            </div>

            <Button v-if="props.contractState === 'Pending'" label="Add" icon="pi pi-plus" @click="openAddDialog()" />
        </div>

        <!-- PrimeVue DataTable -->
        <DataTable :value="filteredItems" stripedRows paginator :rows="8" tableStyle="min-width: 50rem"
            :loading="loading">
            <Column field="id" header="ID"></Column>
            <Column field="annex_name" header="Name"></Column>
            <Column field="specialty_name" header="Specialty"></Column>
            <Column field="created_by" header="Created By">
                <template #body="slotProps">
                    {{ capitalizeFirstLetter(slotProps.data.created_by) }}
                </template>
            </Column>
            <Column field="created_at" header="Created At">
            </Column>
            <Column v-if="props.contractState === 'Pending'" header="Edit">
                <template #body="slotProps">
                    <Button icon="pi pi-pencil" severity="warn" size="small"  @click="openEditDialog(slotProps.data)" />
                </template>
            </Column>
            <Column v-if="props.contractState === 'Pending'" header="Delete">
                <template #body="slotProps">
                    <Button icon="pi pi-trash" severity="danger" size="small"
                        @click="confirmDelete(slotProps.data)" />
                </template>
            </Column>
            <Column header="Details">
                <template #body="slotProps">
                    <Button icon="pi pi-eye" severity="info" size="small" label="Details" @click="moreInfo(slotProps.data)" />
                </template>
            </Column>
            <template #empty>
                <div class="text-center text-gray-500 py-6 flex flex-col items-center">
                    <i class="pi pi-folder-open text-3xl mb-2"></i>
                    <span>No annexes found.</span>
                </div>
            </template>
        </DataTable>

        <!-- Dialog for Add -->
        <Dialog v-model:visible="addDialogVisible" header="Add Annex" modal>
            <div class="p-fluid flex flex-col px-5 w-full lg:w-96">
                <label>Name:</label>
                <InputText size="small" v-model="form.annex_name" />
                <small v-if="addFormErrors.annex_name" class="text-red-500">{{ addFormErrors.annex_name }}</small>

                <label class="mt-3 mb-1">Specialty:</label>
                <Dropdown v-model="form.specialty_id" :options="specialties" optionLabel="specialty_name"
                    optionValue="id" placeholder="Select Specialty" class="w-full mb-3" />
                <small v-if="addFormErrors.specialty_id" class="text-red-500">{{ addFormErrors.specialty_id }}</small>

                <div class="mt-4 text-right">
                    <Button label="Cancel" icon="pi pi-times" @click="addDialogVisible = false" class="p-button-text" />
                    <Button label="Save" icon="pi pi-check" @click="saveNewItem" :loading="savingData"
                        class="p-button-primary ml-2" />
                </div>
            </div>
        </Dialog>

        <!-- Dialog for Edit -->
        <Dialog v-model:visible="editDialogVisible" header="Edit Annex" modal>
            <div class="p-fluid flex flex-col px-5 w-full lg:w-96">
                <label>Name:</label>
                <InputText size="small" v-model="form.annex_name" />
                <small v-if="editFormErrors.annex_name" class="text-red-500">{{ editFormErrors.annex_name }}</small>

                <label class="mt-3 mb-1">Specialty:</label>
                <Dropdown v-model="form.specialty_id" :options="specialties" optionLabel="specialty_name"
                    optionValue="id" placeholder="Select Specialty" class="w-full mb-3" />
                <small v-if="editFormErrors.specialty_id" class="text-red-500">{{ editFormErrors.specialty_id }}</small>

                <div class="mt-4 text-right">
                    <Button label="Cancel" icon="pi pi-times" @click="editDialogVisible = false"
                        class="p-button-text" />
                    <Button label="Save" icon="pi pi-check" @click="updateItem" :loading="savingData"
                        class="p-button-primary ml-2" />
                </div>
            </div>
        </Dialog>

        <!-- Dialog for Delete Confirmation -->
        <Dialog v-model:visible="deleteDialogVisible" header="Confirm Delete" modal>
            <div class="p-fluid flex flex-col px-5 w-full">
                <p>Are you sure you want to delete this annex?</p>
                <div class="mt-4 text-right">
                    <Button label="No" icon="pi pi-times" @click="deleteDialogVisible = false" class="p-button-text" />
                    <Button label="Yes" icon="pi pi-check" @click="deleteItem" :loading="deletingData" severity="danger"
                        class="ml-2" />
                </div>
            </div>
        </Dialog>
    </div>
</template>

<script setup>
import { ref, computed, defineProps, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import axios from "axios";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Dropdown from "primevue/dropdown";
import Calendar from "primevue/calendar";
import Toast from "primevue/toast";
import { useUserStore } from './../../../stors/user';
const userStore = useUserStore();  // Pinia store for user
const API_BASE_URL = import.meta.env.VITE_SERVER_URL;

const props = defineProps({
    contractState: String,
    contractId: String
});

const router = useRouter();
const toast = useToast();
const searchQuery = ref("");
const selectedFilter = ref("annex_name"); // Default filter
const filterOptions = [
    { label: "By ID", value: "id" },
    { label: "By Name", value: "annex_name" },
    { label: "By Creation time", value: "created_at" },
    { label: "By Specialty", value: "specialty_name" }
];

const loading = ref(false);
const savingData = ref(false);
const deletingData = ref(false);
const items = ref([]);
const specialties = ref([]);
const addDialogVisible = ref(false);
const editDialogVisible = ref(false);
const deleteDialogVisible = ref(false);

// Form error refs
const addFormErrors = ref({});
const editFormErrors = ref({});

const form = ref({
    id: null,
    contract_id: "",
    annex_name: "",
    specialty_id: null
});

// For delete operation
const itemToDelete = ref(null);

// Validation function
const validateForm = (formData, formErrors) => {
    // Clear previous errors
    formErrors.value = {};
    let isValid = true;

    if (!formData.annex_name || !formData.annex_name.trim()) {
        formErrors.value.annex_name = "Name is required";
        isValid = false;
    }

    if (!formData.specialty_id) {
        formErrors.value.specialty_id = "Specialty is required";
        isValid = false;
    }

    return isValid;
};

// Format date to dd/mm/yy
const formatDate = (dateString) => {
    if (!dateString) return '';

    try {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString().slice(-2);

        return `${day}/${month}/${year}`;
    } catch (error) {
        console.error("Error formatting date:", error);
        return dateString;
    }
};

// Capitalize first letter of a string
const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
};

// Filtered items based on search query
const filteredItems = computed(() => {
    if (!searchQuery.value) return items.value;

    return items.value.filter(item => {
        switch (selectedFilter.value) {
            case "id":
                return item.id.toString().includes(searchQuery.value);
            case "annex_name":
                return item.annex_name.toLowerCase().includes(searchQuery.value.toLowerCase());
            case "created_at":
                return item.created_at === searchQuery.value;
            case "specialty_name":
                return item.specialty_name.toLowerCase().includes(searchQuery.value.toLowerCase());
            default:
                return true;
        }
    });
});

// Fetch annexes for the contract
const fetchAnnexes = async () => {
    try {
        loading.value = true;
        const response = await axios.get(`${API_BASE_URL}/api/convention/annexes/contract/${props.contractId}`);
        items.value = response.data;

        
    } catch (error) {
        console.error("Error fetching annexes:", error);
        const errorMessage = error.response?.data?.message || 'Failed to load annexes';
        toast.add({ severity: 'error', summary: 'Error', detail: errorMessage, life: 3000 });
    } finally {
        loading.value = false;
    }
};

// Fetch available specialties
const fetchSpecialties = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/convention/specialties/${props.contractId}`);
        specialties.value = response.data;

        if (specialties.value.length === 0) {
            toast.add({ severity: 'warn', summary: 'Warning', detail: 'No available specialties found', life: 3000 });
        }
    } catch (error) {
        console.error("Error fetching specialties:", error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load specialties', life: 3000 });
    }
};

// Open add dialog and fetch available specialties
const openAddDialog = async () => {
    form.value = {
        id: null,
        contract_id: props.contractId,
        annex_name: "",
        specialty_id: null
    };
    addFormErrors.value = {}; // Clear form errors
    await fetchSpecialties();
    addDialogVisible.value = true;
};

// Open edit dialog and fetch available specialties
const openEditDialog = async (item) => {
    // We need to convert the item to match our form structure
    form.value = {
        id: item.id,
        contract_id: item.contract_id,
        annex_name: item.annex_name,
        specialty_id: item.specialty_id
    };
    editFormErrors.value = {}; // Clear form errors
    await fetchSpecialties();
    // Add the current specialty to the list if it's not already there
    const specialtyExists = specialties.value.some(s => s.id === item.specialty_id);
    if (!specialtyExists) {
        specialties.value.push({
            id: item.specialty_id,
            specialty_name: item.specialty_name
        });
    }
    editDialogVisible.value = true;
};

// Confirm delete operation
const confirmDelete = (item) => {
    itemToDelete.value = item;
    deleteDialogVisible.value = true;
};

// Delete the annex
const deleteItem = async () => {
    try {
        deletingData.value = true;
        await axios.delete(`${API_BASE_URL}/api/convention/annexes/${itemToDelete.value.id}`);

        // Remove the deleted item from the list
        await fetchAnnexes(); // Refresh the list
        deleteDialogVisible.value = false;
        toast.add({ severity: 'success', summary: 'Success', detail: 'Annex deleted successfully', life: 3000 });
    } catch (error) {
        console.error("Error deleting annex:", error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: `Failed to delete annex: ${error.response?.data?.message || error.message}`,
            life: 3000
        });
    } finally {
        deletingData.value = false;
        itemToDelete.value = null;
    }
};

// Save new annex
const saveNewItem = async () => {
    // Validate form before proceeding
    if (!validateForm(form.value, addFormErrors)) {
        return;
    }

    try {
        savingData.value = true;
        const response = await axios.post(`${API_BASE_URL}/api/convention/annexes/${props.contractId}`, {
            annex_name: form.value.annex_name,
            specialty_id: form.value.specialty_id
        });

        // Add the new item to the list
        await fetchAnnexes(); // Refresh the list
        addDialogVisible.value = false;
        toast.add({ severity: 'success', summary: 'Success', detail: 'Annex created successfully', life: 3000 });
    } catch (error) {
        console.error("Error saving annex:", error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: `Failed to save annex: ${error.response?.data?.message || error.message}`,
            life: 3000
        });
    } finally {
        savingData.value = false;
    }
};

// Update existing annex
const updateItem = async () => {
    // Validate form before proceeding
    if (!validateForm(form.value, editFormErrors)) {
        return;
    }

    try {
        savingData.value = true;
        const response = await axios.put(`${API_BASE_URL}/api/convention/annexes/${form.value.id}`, {
            annex_name: form.value.annex_name,
            specialty_id: form.value.specialty_id
        });

        // Update the item in the list
        await fetchAnnexes(); // Refresh the list
        editDialogVisible.value = false;
        toast.add({ severity: 'success', summary: 'Success', detail: 'Annex updated successfully', life: 3000 });
    } catch (error) {
        console.error("Error updating annex:", error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: `Failed to update annex: ${error.response?.data?.message || error.message}`,
            life: 3000
        });
    } finally {
        savingData.value = false;
    }
};

// Navigate to annex details
const moreInfo = (item) => {
  const basePath = userStore.role === 'Admin' ? '/conventionoffice' : '';
  router.push({
    path: `${basePath}/Annex/${item.id}`,
  });
};

// Fetch data on component mount
onMounted(() => {
    fetchAnnexes();
});
</script>