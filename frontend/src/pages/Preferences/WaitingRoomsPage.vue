<script setup>
import { ref, onMounted } from "vue";
import { useToast } from "primevue/usetoast";
import { getWaitingRooms } from "../../api/waiting_rooms";


import { Button } from "primevue";
import WaitingRoomTable from "../../components/WaitingRoom/WaitingRoomTable.vue";
import AddWaitingRoomDialog from "../../components/WaitingRoom/AddWaitingRoomDialog.vue";
import EditWaitingRoomDialog from "../../components/WaitingRoom/EditWaitingRoomDialog.vue";

const toast = useToast();
const waitingRooms = ref([]);
const loading = ref(false);
const visibleAddDialog = ref(false);
const visibleEditDialog = ref(false);
const selectedWaitingRoom = ref(null);

// Fetch data
const fetchData = async () => {
    loading.value = true;
    try {
        const response = await getWaitingRooms();
        waitingRooms.value = response;
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

// Handle waiting room edit
const handleEditWaitingRoom = (room) => {
    selectedWaitingRoom.value = { ...room };
    visibleEditDialog.value = true;
};

// Handle waiting room update
const handleWaitingRoomUpdated = () => {
    fetchData();
    toast.add({
        severity: "success",
        summary: "Success",
        detail: "Waiting room updated successfully",
        life: 3000,
    });
};

onMounted(fetchData);

const refreshWaitingRooms = () => {
    fetchData();
};
</script>

<template>
    <div class="w-full">
        <Toast />
        <div class="flex justify-between align-items-center mb-4">
            <h1 class="text-2xl font-bold">Waiting Room Management</h1>
        </div>

        <div class="mb-4 flex justify-end">
            <Button label="Add Waiting Room" icon="pi pi-plus" class="p-button-sm p-button-primary"
                @click="visibleAddDialog = true" />
        </div>

        <WaitingRoomTable :waitingRooms="waitingRooms" :loading="loading" @edit-waiting-room="handleEditWaitingRoom"
            @refresh="fetchData" />

        <AddWaitingRoomDialog v-model:visible="visibleAddDialog" @waiting-room-created="refreshWaitingRooms" />

        <EditWaitingRoomDialog v-model:visible="visibleEditDialog" v-model:waitingRoom="selectedWaitingRoom"
            @waiting-room-updated="refreshWaitingRooms" />
    </div>
</template>