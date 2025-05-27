<script setup>
import { ref, onMounted } from "vue";
import { useToast } from "primevue/usetoast";

import { getModalities } from "../../api/modality";
import { getPrestations } from "../../api/prestation";
import { getWaitingRooms } from "../../api/waiting_rooms";
import { Button } from "primevue";
import ModalityTable from "../../components/Modality/ModalityTable.vue";
import AddModalityDialog from "../../components/Modality/AddModalityDialog.vue";

const toast = useToast();
const modalities = ref([]);
const prestationLists = ref([]);
const waitingRooms = ref([]);
const loading = ref(false);
const visibleAddDialog = ref(false);
const visibleEditDialog = ref(false);
const selectedModality = ref(null);

const fetchData = async () => {
    loading.value = true;
    try {
        const [modalitiesRes, prestationListsRes, waitingRoomsRes] = await Promise.all([
            getModalities(),
            getPrestations(),
            getWaitingRooms()
        ]);
        modalities.value = modalitiesRes;
        prestationLists.value = prestationListsRes;
        waitingRooms.value = waitingRoomsRes;
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

const handleEditModality = (modality) => {
    selectedModality.value = { ...modality };
    visibleEditDialog.value = true;
};

onMounted(fetchData);

const refreshModalities = () => {
    fetchData();
};
</script>

<template>
    <div class="w-full">
        <Toast />
        <div class="flex justify-between align-items-center mb-4">
            <h1 class="text-2xl font-bold">Modality Management</h1>
        </div>

        <div class="mb-4 flex justify-end">
            <Button label="Add Modality" icon="pi pi-plus" class="p-button-sm p-button-primary"
                @click="visibleAddDialog = true" />
        </div>

        <ModalityTable :modalities="modalities" :loading="loading" @edit-modality="handleEditModality"
            @refresh="fetchData" />

        <AddModalityDialog v-model:visible="visibleAddDialog" :prestation-lists="prestationLists"
            :waiting-rooms="waitingRooms" @modality-created="refreshModalities" />

        <EditModalityDialog v-model:visible="visibleEditDialog" v-model:modality="selectedModality"
            :prestation-lists="prestationLists" :waiting-rooms="waitingRooms" @modality-updated="refreshModalities" />
    </div>
</template>