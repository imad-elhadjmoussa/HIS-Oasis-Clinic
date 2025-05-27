<template>
  <div class="w-full p-4">
    <!-- Toast and Confirm Dialog -->
    <Toast />
    <!-- <ConfirmDialog /> -->

    <!-- Search Bar & Add Button -->
    <div class="flex flex-col lg:flex-row justify-between items-center mb-4 gap-2">
      <div class="relative flex-grow flex items-center gap-2">
        <Dropdown v-model="searchFilter" :options="filterOptions" optionLabel="label" optionValue="value"
          placeholder="Filter By" class="border rounded-lg" />
        <InputText v-model="searchQuery" placeholder="Search..." class="w-full p-2 border rounded-lg" />
      </div>
      <Button label="Add Contact" icon="pi pi-plus" @click="openAddDialog" />
    </div>

    <!-- PrimeVue DataTable -->
    <DataTable :value="filteredItems" stripedRows paginator :rows="8" tableStyle="min-width: 50rem">
      <Column field="id" header="ID"></Column>
      <!-- Removed company_id column -->
      <Column field="Name" header="Name"></Column>
      <Column field="job_function" header="Function"></Column>
      <Column field="phone_number" header="Phone"></Column>
      <Column field="email" header="Email"></Column>
      <Column header="Edit">
        <template #body="slotProps">
          <Button icon="pi pi-pencil" severity="warn" size="small"  @click="editItem(slotProps.data)" />
        </template>
      </Column>
      <Column header="Delete">
        <template #body="slotProps">
          <Button icon="pi pi-trash" severity="danger" size="small"  @click="confirmDelete(slotProps.data)" />
        </template>
      </Column>
      <template #empty>
        <div class="text-center text-gray-500 py-6 flex flex-col items-center">
          <i class="pi pi-users text-3xl mb-2"></i>
          <span>No contacts found.</span>
        </div>
      </template>
    </DataTable>

    <!-- Add Contact Dialog -->
    <Dialog v-model:visible="addDialog" header="Add Contact" modal>
      <div class="p-fluid flex flex-col px-5 w-full lg:w-96">
        <label>Name:</label>
        <InputText size="small" v-model="newContact.Name" />
        <small v-if="formErrors.Name" class="text-red-500">{{ formErrors.Name }}</small>

        <label class="mt-3">Function:</label>
        <InputText size="small" v-model="newContact.job_function" />
        <small v-if="formErrors.job_function" class="text-red-500">{{ formErrors.job_function }}</small>

        <label class="mt-3">Phone:</label>
        <InputText size="small" v-model="newContact.phone_number" />
        <small v-if="formErrors.phone_number" class="text-red-500">{{ formErrors.phone_number }}</small>

        <label class="mt-3">Email:</label>
        <InputText size="small" v-model="newContact.email" />
        <small v-if="formErrors.email" class="text-red-500">{{ formErrors.email }}</small>

        <div class="mt-4 text-right">
          <Button label="Cancel" icon="pi pi-times" @click="addDialog = false" class="p-button-text" />
          <Button label="Save" icon="pi pi-check" @click="saveContact" class="p-button-primary ml-2" />
        </div>
      </div>
    </Dialog>

    <!-- Edit Dialog -->
    <Dialog v-model:visible="editDialog" header="Edit Contact" modal>
      <div class="p-fluid flex flex-col px-5 w-full lg:w-96">
        <label>Name:</label>
        <InputText size="small" v-model="selectedContact.Name" />
        <small v-if="formErrors.Name" class="text-red-500">{{ formErrors.Name }}</small>

        <label class="mt-3">Function:</label>
        <InputText size="small" v-model="selectedContact.job_function" />
        <small v-if="formErrors.job_function" class="text-red-500">{{ formErrors.job_function }}</small>

        <label class="mt-3">Phone:</label>
        <InputText size="small" v-model="selectedContact.phone_number" />
        <small v-if="formErrors.phone_number" class="text-red-500">{{ formErrors.phone_number }}</small>

        <label class="mt-3">Email:</label>
        <InputText size="small" v-model="selectedContact.email" />
        <small v-if="formErrors.email" class="text-red-500">{{ formErrors.email }}</small>

        <div class="mt-4 text-right">
          <Button label="Cancel" icon="pi pi-times" @click="editDialog = false" class="p-button-text" />
          <Button label="Save" icon="pi pi-check" @click="updateContact" class="p-button-primary ml-2" />
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
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Dropdown from "primevue/dropdown";
import Toast from "primevue/toast";
// Remove this line: import ConfirmDialog from "primevue/confirmdialog";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
const API_BASE_URL = import.meta.env.VITE_SERVER_URL;

const props = defineProps({
  companyId: {
    type: String,
    required: true
  }
});

const toast = useToast();
const confirm = useConfirm();
const searchQuery = ref("");
const searchFilter = ref("Name"); // Default filter by name

// Dropdown options for filtering
const filterOptions = ref([
  { label: "By Name", value: "Name" },
  { label: "By ID", value: "id" },
  { label: "By Job Function", value: "job_function" },
  { label: "By Phone", value: "phone_number" },
  { label: "By Email", value: "email" }
]);

const items = ref([]);
const addDialog = ref(false);
const editDialog = ref(false);
const newContact = ref({ Name: "", job_function: "", phone_number: "", email: "", company_id: props.companyId });
const selectedContact = ref({});
const formErrors = ref({
  Name: "",
  job_function: "",
  phone_number: "",
  email: ""
});

// Fetch contacts for the current company
const fetchContacts = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/convention/contacts/${props.companyId}`);
    // Check if response.data is an array or has a specific property that contains the array
    const contactData = Array.isArray(response.data) ? response.data :
      (response.data.contacts || response.data.data || []);

    // Transform the data to ensure consistent field naming
    items.value = contactData.map(contact => {
      // This handles cases where the backend might send inconsistent field names
      return {
        id: contact.id,
        Name: contact.Name || contact.name, // Handle both possible cases
        company_id: contact.company_id,
        job_function: contact.job_function || "", // Use job_function instead of fonction
        phone_number: contact.phone_number || contact.phone,
        email: contact.email
      };
    });

    console.log("Fetched contacts:", items.value); // For debugging
  } catch (error) {
    console.error("Failed to fetch contacts:", error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load contacts',
      life: 3000
    });
  }
};

onMounted(() => {
  fetchContacts();
});

const filteredItems = computed(() => {
  return items.value.filter(item => {
    const searchValue = searchQuery.value.toLowerCase();
    return String(item[searchFilter.value]).toLowerCase().includes(searchValue);
  });
});

const resetFormErrors = () => {
  formErrors.value = {
    Name: "",
    job_function: "",
    phone_number: "",
    email: ""
  };
};

const validateForm = (formData) => {
  resetFormErrors();
  let isValid = true;

  if (!formData.Name) {
    formErrors.value.Name = "Name is required";
    isValid = false;
  }

  if (!formData.phone_number) {
    formErrors.value.phone_number = "Phone number is required";
    isValid = false;
  } else if (formData.phone_number.length !== 10 || !/^\d+$/.test(formData.phone_number)) {
    formErrors.value.phone_number = "Phone number must be 10 digits";
    isValid = false;
  }

  if (!formData.email) {
    formErrors.value.email = "Email is required";
    isValid = false;
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      formErrors.value.email = "Invalid email format";
      isValid = false;
    }
  }

  return isValid;
};

const openAddDialog = () => {
  resetFormErrors();
  newContact.value = { Name: "", job_function: "", phone_number: "", email: "", company_id: props.companyId };
  addDialog.value = true;
};

const saveContact = async () => {
  if (!validateForm(newContact.value)) return;

  try {
    // Call the POST API endpoint with properly named fields
    const response = await axios.post(`${API_BASE_URL}/api/convention/contacts/${props.companyId}`, {
      Name: newContact.value.Name,
      job_function: newContact.value.job_function,
      phone_number: newContact.value.phone_number,
      email: newContact.value.email
    });

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Contact created successfully',
      life: 3000
    });

    addDialog.value = false;
    fetchContacts(); // Refresh the list
  } catch (error) {
    // Show error toast with backend error message
    const errorMessage = error.response?.data?.message || 'Failed to create contact';
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: errorMessage,
      life: 3000
    });
  }
};

const editItem = (item) => {
  resetFormErrors();
  selectedContact.value = { ...item }; // Use spread operator to create a copy
  editDialog.value = true;
};

const updateContact = async () => {
  if (!validateForm(selectedContact.value)) return;

  try {
    // Call the PUT API endpoint with properly named fields
    await axios.put(`${API_BASE_URL}/api/convention/contacts/edit/${selectedContact.value.id}`, {
      Name: selectedContact.value.Name,
      job_function: selectedContact.value.job_function,
      phone_number: selectedContact.value.phone_number,
      email: selectedContact.value.email
    });

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Contact updated successfully',
      life: 3000
    });

    editDialog.value = false;
    fetchContacts(); // Refresh the list
  } catch (error) {
    // Show error toast with backend error message
    const errorMessage = error.response?.data?.message || 'Failed to update contact';
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: errorMessage,
      life: 3000
    });
  }
};

// Confirm delete contact
const confirmDelete = (contact) => {
  confirm.require({
    message: `Are you sure you want to delete the contact "${contact.Name}"?`,
    header: "Confirm Deletion",
    icon: "pi pi-exclamation-triangle",
    acceptClass: "p-button-danger",
    accept: () => deleteContact(contact.id),
    reject: () => {
      toast.add({
        severity: "info",
        summary: "Cancelled",
        detail: "You have cancelled the deletion",
        life: 3000
      });
    }
  });
};

// Delete contact
const deleteContact = async (contactId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/api/convention/contacts/${contactId}`);

    toast.add({
      severity: "success",
      summary: "Success",
      detail: response.data.message || "Contact deleted successfully",
      life: 3000
    });

    fetchContacts(); // Refresh the list
  } catch (error) {
    console.error("Error deleting contact:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.response?.data?.message || "Failed to delete contact",
      life: 3000
    });
  }
};
</script>