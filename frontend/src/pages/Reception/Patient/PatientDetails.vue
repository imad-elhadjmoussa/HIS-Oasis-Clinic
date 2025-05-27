<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import { useToast } from 'primevue/usetoast';
import Toast from 'primevue/toast';
import EditPatientDialog from '../../../components/Patients/EditPatientDialog.vue';
import { getPatient, getPatientMedicalRecords } from '../../../api/patient';
import { calculateAge, formatDate, showNotification, statusSeverity } from '..';
import MedicalRecordsTable from '../../../components/MedicalRecords/MedicalRecordsTable.vue';
import PatinetMedicalRecoerdsList from '../../../components/Patients/PatinetMedicalRecoerdsList.vue';

const toast = useToast();
const route = useRoute();
const router = useRouter();
const patientId = route.params.id;
const editPatientDialog = ref(false);

const patientMedicalRecords = ref([]);

// Patient data from the image
const patient = ref(null);

const detailsDialog = ref(false);

const fetchPatient = async () => {
    try {
        const response = await getPatient(patientId);
        patient.value = response;
    } catch (error) {
        showNotification(toast, error.message || 'Failed to fetch patients', 'error');
    }
};

const fetchPatientMedicalRecords = async () => {
    try {
        const response = await getPatientMedicalRecords(patientId);
        patientMedicalRecords.value = response;
        console.log(patientMedicalRecords.value);
    } catch (error) {
        showNotification(toast, error.message || 'Failed to fetch medical records', 'error');
    }
};

onMounted(async () => {
    await fetchPatientMedicalRecords();
});

onMounted(async () => {
    await fetchPatient();
});

const openEditDialog = () => {
    editPatientDialog.value = true;
};

const savePatientChanges = (updatedPatient) => {
    patient.value = updatedPatient;
    editPatientDialog.value = false;
};

</script>

<template>
    <div class=" py-6 ">
        <Toast />

        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 class="text-2xl font-bold text-gray-800">Patient Information</h2>
            <div class="flex gap-2">
                <Button label="Back" icon="pi pi-arrow-left" severity="secondary" @click="router.push('/patients')" />
            </div>
        </div>

        <!-- Main Patient Card -->
        <div class=" rounded-lg  p-6 mb-4 border-[1px] border-gray-200 ">
            <div class="flex flex-col md:flex-row gap-6">
                <!-- Patient Picture -->
                <div class="flex flex-col items-center md:w-1/5">
                    <div class="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md mb-4">
                        <img src="./../../../assets/examination.png" alt="Patient Photo"
                            class="w-full h-full object-cover">
                    </div>
                </div>

                <!-- Key Information -->
                <div class="md:w-4/5">
                    <div class="flex justify-between items-start mb-4">
                        <h3 class="text-xl font-semibold">Patient #{{ patient?.id }}</h3>
                        <p>
                        </p>
                        <div class="flex gap-2">
                            <Button label="View Full Details" icon="pi pi-info-circle" severity="info"
                                class="p-button-sm" @click="detailsDialog = true" />
                            <Button label="Edit" icon="pi pi-pencil" class="p-button-sm p-button-warning"
                                @click="openEditDialog" />
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="space-y-2">
                            <h4 class="text-sm font-medium text-gray-500">Full Name</h4>
                            <p class="font-medium">{{ patient?.first_name }} {{ patient?.last_name }}</p>
                        </div>
                        <div class="space-y-2">
                            <h4 class="text-sm font-medium text-gray-500">National ID</h4>
                            <p>{{ patient?.national_id_number }}</p>
                        </div>
                        <div class="space-y-2">
                            <h4 class="text-sm font-medium text-gray-500">Date of Birth</h4>
                            <p>{{ formatDate(patient?.date_of_birth) }} ({{ calculateAge(patient?.date_of_birth) }}
                                years)</p>
                        </div>
                        <div class="space-y-2">
                            <h4 class="text-sm font-medium text-gray-500">Phone Number</h4>
                            <p>{{ patient?.phone_number }}</p>
                        </div>
                        <div class="space-y-2">
                            <h4 class="text-sm font-medium text-gray-500">Gender</h4>
                            <p>{{ patient?.gender }}</p>
                        </div>
                        <div class="space-y-2">
                            <h4 class="text-sm font-medium text-gray-500">Blood Group</h4>
                            <p>{{ patient?.blood_type }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Additional Details Dialog -->
        <Dialog v-model:visible="detailsDialog" modal header="Patient Full Details" :style="{ width: '50vw' }">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                <div class="space-y-4">
                    <div>
                        <h4 class="text-sm font-medium text-gray-500">Full Name</h4>
                        <p>{{ patient?.first_name }} {{ patient?.last_name }}</p>
                    </div>
                    <div>
                        <h4 class="text-sm font-medium text-gray-500">National ID</h4>
                        <p>{{ patient?.national_id_number || 'N/A' }}</p>
                    </div>
                    <div>
                        <h4 class="text-sm font-medium text-gray-500">Date of Birth</h4>
                        <p>{{ formatDate(patient?.date_of_birth) || 'N/A' }}</p>
                    </div>
                    <div>
                        <h4 class="text-sm font-medium text-gray-500">Phone Number</h4>
                        <p>{{ patient?.phone_number || 'N/A' }}</p>
                    </div>
                    <div>
                        <h4 class="text-sm font-medium text-gray-500">Email Address</h4>
                        <p>{{ patient?.email || 'N/A' }}</p>
                    </div>
                </div>
                <div class="space-y-4">
                    <div>
                        <h4 class="text-sm font-medium text-gray-500">Gender</h4>
                        <p>{{ patient?.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : 'N/A'
                            }}</p>
                    </div>
                    <div>
                        <h4 class="text-sm font-medium text-gray-500">Blood Type</h4>
                        <p>{{ patient?.blood_type || 'N/A' }}</p>
                    </div>
                    <div>
                        <h4 class="text-sm font-medium text-gray-500">Address</h4>
                        <p>{{ patient?.address || 'N/A' }}</p>
                    </div>
                    
                </div>
            </div>
            <template #footer>
                <Button label="Close" icon="pi pi-times" @click="detailsDialog = false" class="p-button-text" />
            </template>
        </Dialog>


        <!-- <MedicalRecordsTable :records="patientMedicalRecords" /> -->
        <PatinetMedicalRecoerdsList :records="patientMedicalRecords" />


        <!-- Edit Patient Dialog -->
        <EditPatientDialog v-model:visible="editPatientDialog" :patient="patient" @save="savePatientChanges"
            @close="editPatientDialog = false" />
    </div>
</template>

<style scoped>
/* Add any custom styles here */
</style>