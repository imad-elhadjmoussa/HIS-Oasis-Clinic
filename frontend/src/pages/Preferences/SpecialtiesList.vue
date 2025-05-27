<script setup>
import { ref, onMounted } from "vue";
import { useToast } from "primevue/usetoast";
import { getSpecialties } from "../../api/specialty";
import AddSpecialtyDialog from "../../components/Specialties/AddSpecialtyDialog.vue";
import EditSpecialtyDialog from "../../components/Specialties/EditSpecialtyDialog.vue";
import SpecialtiesTable from "../../components/Specialties/SpecialtiesTable.vue";
import { Button } from "primevue";

const toast = useToast();
const specialties = ref([]);
const loading = ref(false);
const visibleAddDialog = ref(false);
const visibleEditDialog = ref(false);
const selectedSpecialty = ref(null);

// Fetch data
const fetchData = async () => {
    loading.value = true;
    try {
        const response = await getSpecialties();
        specialties.value = response;
    } catch (error) {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: error.message,
            life: 3000,
        });
    } finally {
        loading.value = false;
    }
};

// Handle specialty edit
const handleEditSpecialty = (specialty) => {
    selectedSpecialty.value = { ...specialty };
    visibleEditDialog.value = true;
};

// Handle specialty update
const handleSpecialtyUpdated = () => {
    fetchData();
    toast.add({
        severity: "success",
        summary: "Success",
        detail: "Specialty updated successfully",
        life: 3000,
    });
};

onMounted(fetchData);

const refreshSpecialties = () => {
    fetchData();
};
</script>

<template>
    <div class="w-full">
        <Toast />
        <div class="flex justify-between align-items-center mb-4">
            <h1 class="text-2xl font-bold">Specialty Management</h1>
        </div>

        <div class="mb-4 flex justify-end">
            <Button label="Add Specialty" icon="pi pi-plus" class="p-button-sm p-button-primary"
                @click="visibleAddDialog = true" />
        </div>

        <SpecialtiesTable :specialties="specialties" :loading="loading" @edit-specialty="handleEditSpecialty"
            @refresh="fetchData" />

        <AddSpecialtyDialog v-model:visible="visibleAddDialog" @specialty-created="refreshSpecialties" />

        <EditSpecialtyDialog v-model:visible="visibleEditDialog" v-model:specialty="selectedSpecialty"
            @specialty-updated="refreshSpecialties" />
    </div>
</template>