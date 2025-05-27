<template>
    <div class="management-panel">
        <!-- Tab Navigation -->
        <TabView class="panel-tabs">
            <!-- Specialties Section -->
            <TabPanel header="Specialties">
                <SpecialtiesTable :specialties="specialties" @edit-specialty="editSpecialty"
                    @delete-specialty="deleteSpecialty" />
            </TabPanel>

            <!-- Medical Acts Section -->
            <TabPanel header="Medical Acts">
                <MedicalActsTable :acts="medicalActs" :specialties="specialties" @edit-act="editMedicalAct"
                    @delete-act="deleteMedicalAct" />
            </TabPanel>

            <!-- Doctors Section -->
            <TabPanel header="Doctors">
                <DoctorsTable :doctors="doctors" :specialties="specialties" @edit-doctor="editDoctor"
                    @delete-doctor="deleteDoctor" />
            </TabPanel>
        </TabView>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { TabView, TabPanel } from 'primevue';
import SpecialtiesTable from '../../components/Specialties/SpecialtiesTable.vue';
import MedicalActsTable from '../../components/MedicalActs/MedicalActsTable.vue';
import DoctorsTable from '../../components/Doctors/DoctorsTable.vue';


// Sample data (would come from API in real app)
const specialties = ref([
    { id: 1, name: 'Cardiology', description: 'Heart and cardiovascular system' },
    { id: 2, name: 'Neurology', description: 'Nervous system disorders' },
    { id: 3, name: 'Pediatrics', description: 'Child healthcare' }
]);

const medicalActs = ref([
    { id: 101, code: 'CARD-001', name: 'Echocardiogram', specialty: 1, price: 250 },
    { id: 102, code: 'NEU-002', name: 'EEG', specialty: 2, price: 180 },
    { id: 103, code: 'PED-003', name: 'Vaccination', specialty: 3, price: 50 }
]);

const doctors = ref([
    { id: 1001, name: 'Dr. Smith', specialty: 1, email: 'smith@hospital.com', status: 'active' },
    { id: 1002, name: 'Dr. Johnson', specialty: 2, email: 'johnson@hospital.com', status: 'active' },
    { id: 1003, name: 'Dr. Lee', specialty: 3, email: 'lee@hospital.com', status: 'on leave' }
]);

// Methods (would connect to API in real app)
const editSpecialty = (id) => console.log('Edit specialty:', id);
const deleteSpecialty = (id) => console.log('Delete specialty:', id);
const editMedicalAct = (id) => console.log('Edit medical act:', id);
const deleteMedicalAct = (id) => console.log('Delete medical act:', id);
const editDoctor = (id) => console.log('Edit doctor:', id);
const deleteDoctor = (id) => console.log('Delete doctor:', id);
</script>

<style scoped>

</style>