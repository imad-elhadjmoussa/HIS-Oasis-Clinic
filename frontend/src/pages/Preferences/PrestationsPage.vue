<script setup>
import { ref, onMounted } from "vue";
import { useToast } from "primevue/usetoast";
import PrestationsTable from "../../components/Prestations/PrestationsTable.vue";
import AddPrestationDialog from "../../components/Prestations/AddPrestationDialog.vue";
import EditPrestationDialog from "../../components/Prestations/EditPrestationDialog.vue";
import { getPrestations } from "../../api/prestation";
import { getSpecialties } from "../../api/specialty";
import { Button } from "primevue";

const toast = useToast();
const prestations = ref([]);
const specialties = ref([]);
const loading = ref(false);
const visibleAddDialog = ref(false);
const visibleEditDialog = ref(false);
const selectedPrestation = ref(null);

const fetchData = async () => {
    loading.value = true;
    try {
        const [prestationsResponse, specialtiesResponse] = await Promise.all([
            getPrestations(),
            getSpecialties()
        ]);
        prestations.value = prestationsResponse;
        specialties.value = specialtiesResponse;
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

const handleEditPrestation = (prestation) => {
    selectedPrestation.value = { ...prestation };
    visibleEditDialog.value = true;
};

onMounted(fetchData);

const refreshPrestations = () => {
    fetchData();
};
</script>

<template>
    <div class="w-full">
        <Toast />
        <div class="flex justify-between align-items-center mb-4">
            <h1 class="text-2xl font-bold">Prestation Management</h1>
        </div>

        <div class="mb-4 flex justify-end">
            <Button label="Add Prestation" icon="pi pi-plus" class="p-button-sm p-button-primary"
                @click="visibleAddDialog = true" />
        </div>

        <PrestationsTable :prestations="prestations" :specialties="specialties" :loading="loading"
            @edit-prestation="handleEditPrestation" @refresh="fetchData" />

        <AddPrestationDialog v-model:visible="visibleAddDialog" :specialties="specialties"
            @prestation-created="refreshPrestations" />

        <EditPrestationDialog v-model:visible="visibleEditDialog" v-model:prestation="selectedPrestation"
            :specialties="specialties" @prestation-updated="refreshPrestations" />
    </div>
</template>