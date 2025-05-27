<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import EditDoctorDialog from '../../components/Doctors/EditDoctorDialog.vue';
import AddDoctorDialog from '../../components/Doctors/AddDoctorDialog.vue';
import DoctorsTable from '../../components/Doctors/DoctorsTable.vue';
import { getDoctors } from '../../api/doctor';
import { getSpecialties } from '../../api/specialty';
import { Button } from 'primevue';

const toast = useToast();
const doctors = ref([]);
const specialties = ref([]);
const loading = ref(false);
const visibleAddDialog = ref(false);
const visibleEditDialog = ref(false);
const selectedDoctor = ref(null);

const fetchData = async () => {
    loading.value = true;
    try {
        const [doctorsResponse, specialtiesResponse] = await Promise.all([
            getDoctors(),
            getSpecialties()
        ]);
        doctors.value = doctorsResponse;
        specialties.value = specialtiesResponse;
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message,
            life: 3000,
        });
    } finally {
        loading.value = false;
    }
};

const handleEditDoctor = (doctor) => {
    selectedDoctor.value = { ...doctor };
    visibleEditDialog.value = true;
};

onMounted(fetchData);

const refreshDoctors = () => {
    fetchData();
};
</script>

<template>
    <div class="w-full">
        <Toast />
        <div class="flex justify-between align-items-center mb-4">
            <h1 class="text-2xl font-bold">Doctor Management</h1>
            <Button label="Add Doctor" icon="pi pi-plus" class="p-button-sm p-button-primary"
                @click="visibleAddDialog = true" />
        </div>

        <DoctorsTable :doctors="doctors" :specialties="specialties" :loading="loading" @edit-doctor="handleEditDoctor"
            @refresh="fetchData" />

        <AddDoctorDialog v-model:visible="visibleAddDialog" :specialties="specialties"
            @doctor-created="refreshDoctors" />

        <EditDoctorDialog v-model:visible="visibleEditDialog" v-model:doctor="selectedDoctor" :specialties="specialties"
            @doctor-updated="refreshDoctors" />
    </div>
</template>