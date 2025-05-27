<script setup>
import { ref, computed, onMounted } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputText from "primevue/inputtext";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import { RouterLink } from "vue-router";
import { useToast } from "primevue/usetoast";
import Toast from "primevue/toast";
import Dropdown from 'primevue/dropdown';
import { getPatients, deletePatient } from "../../../api/patient";
import { formatDate, showNotification } from "./../index";
import AddPatientModel from "./../../../components/Patients/AddPatientModel.vue";

const toast = useToast();
const patients = ref([]);
const searchTerm = ref("");
const addPatientDialog = ref(false);
const deleteDialogVisible = ref(false);
const patientToDelete = ref(null);
const isDeleting = ref(false);
const filterField = ref('all');

const filterOptions = ref([
    { label: 'All Fields', value: 'all' },
    { label: 'National ID', value: 'national_id_number' },
    { label: 'Phone Number', value: 'phone_number' },
    { label: 'Full Name', value: 'name' }
]);

const fetchPatients = async () => {
    try {
        const response = await getPatients();
        patients.value = response;
    } catch (error) {
        showNotification(toast, error.message || 'Failed to fetch patients', 'error');
    }
};

const confirmDelete = (patient) => {
    patientToDelete.value = patient;
    deleteDialogVisible.value = true;
};

const handleDelete = async () => {
    if (!patientToDelete.value) return;

    isDeleting.value = true;
    try {
        await deletePatient(patientToDelete.value.id);
        showNotification(toast, 'Patient deleted successfully', 'success');
        await fetchPatients();
    } catch (error) {
        showNotification(toast, error.message || 'Failed to delete patient', 'error');
    } finally {
        isDeleting.value = false;
        deleteDialogVisible.value = false;
        patientToDelete.value = null;
    }
};

onMounted(async () => {
    await fetchPatients();
});

const filteredPatients = computed(() => {
    let result = patients.value;
    if (searchTerm.value) {
        const term = searchTerm.value.toLowerCase();

        if (filterField.value === 'all') {
            result = result.filter(patient =>
                `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(term) ||
                patient.national_id_number.includes(term) ||
                patient.phone_number.includes(term) ||
                patient.email?.toLowerCase().includes(term)
            );
        } else if (filterField.value === 'name') {
            result = result.filter(patient =>
                `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(term)
            );
        } else if (filterField.value === 'national_id_number') {
            result = result.filter(patient =>
                patient.national_id_number.includes(term)
            );
        } else if (filterField.value === 'phone_number') {
            result = result.filter(patient =>
                patient.phone_number.includes(term)
            );
        }
    }
    return result;
});

const refreshPatients = async () => {
    await fetchPatients();
    addPatientDialog.value = false;
};
</script>

<template>
    <div class="p-4">
        <Toast position="top-right" />

        <h2 class="text-3xl mb-10 font-semibold">Patients List</h2>


        <div class="flex flex-col sm:flex-row items-center gap-4 mb-6">
            <div class="relative flex-1 w-full flex gap-2">
                <Dropdown size="small" v-model="filterField" :options="filterOptions" optionLabel="label" optionValue="value"
                    class="w-40" />
                <InputText size="small" class="w-full" v-model="searchTerm"
                    :placeholder="`Search by ${filterOptions.find(f => f.value === filterField)?.label.toLowerCase()}...`" />
            </div>
            <Button size="small" icon="pi pi-user-plus" label="Add Patient" @click="addPatientDialog = true" class="p-button-primary w-full sm:w-auto" />
        </div>

        <DataTable :value="filteredPatients" :paginator="true" :rows="5" responsiveLayout="scroll"
            class="p-datatable-sm">
            <Column field="national_id_number" header="National ID" sortable></Column>
            <Column field="name" header="Full Name" sortable>
                <template #body="{ data }">
                    {{ data.first_name }} {{ data.last_name }}
                </template>
            </Column>
            <Column field="phone_number" header="Phone" sortable></Column>
            <Column field="date_of_birth" header="Date of Birth" sortable>
                <template #body="{ data }">
                    {{ formatDate(data.date_of_birth) }}
                </template>
            </Column>

            <Column header="Actions" style="width: 120px">
                <template #body="{ data }">
                    <div class="flex gap-2">
                        <RouterLink :to="`patients/${data.id}`">
                            <Button icon="pi pi-eye" class="p-button-rounded p-button-info p-button-text" />
                        </RouterLink>
                        <Button icon="pi pi-trash" class="p-button-rounded p-button-danger p-button-text"
                            @click="confirmDelete(data)" />
                    </div>
                </template>
            </Column>
        </DataTable>

        <!-- Dialogs -->
        <AddPatientModel v-model:visible="addPatientDialog" :patients="patients" @patient-added="refreshPatients" />

        <!-- Delete Confirmation Dialog -->
        <Dialog v-model:visible="deleteDialogVisible" :style="{ width: '450px' }" header="Confirm Deletion"
            :modal="true" :closable="!isDeleting">
            <div class="confirmation-content flex items-center gap-3">
                <i class="pi pi-exclamation-triangle text-red-500" style="font-size: 2rem" />
                <div>
                    <p>Are you sure you want to delete this patient?</p>
                    <p class="font-semibold mt-2">
                        {{ patientToDelete?.first_name }} {{ patientToDelete?.last_name }}
                        <span class="text-gray-600">(ID: {{ patientToDelete?.national_id_number }})</span>
                    </p>
                    <p class="text-sm text-red-500 mt-2">This action cannot be undone.</p>
                </div>
            </div>
            <template #footer>
                <Button label="Cancel" icon="pi pi-times" @click="deleteDialogVisible = false" class="p-button-text"
                    :disabled="isDeleting" />
                <Button label="Delete" icon="pi pi-trash" @click="handleDelete" class="p-button-danger"
                    :loading="isDeleting" />
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
.confirmation-content {
    display: flex;
    align-items: flex-start;
}

.flex.gap-2 {
    flex-wrap: nowrap;
}
</style>