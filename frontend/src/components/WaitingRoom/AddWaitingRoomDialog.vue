<script setup>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { createWaitingRoom } from '../../api/waiting_rooms';
import { Button, Dialog, InputNumber, InputText } from 'primevue';

const props = defineProps({
    modelValue: {
        type: Boolean,
        required: true
    }
});

const emit = defineEmits(['update:visible', 'waiting-room-created']);

const toast = useToast();
const waitingRoom = ref({
    room_name: '',
    capacity: null
});
const loading = ref(false);
const errors = ref({
    room_name: null,
    capacity: null
});

const validate = () => {
    let valid = true;
    errors.value = {
        room_name: null,
        capacity: null
    };

    if (!waitingRoom.value.room_name) {
        errors.value.room_name = 'Room name is required';
        valid = false;
    }

    if (waitingRoom.value.capacity === null || waitingRoom.value.capacity <= 0) {
        errors.value.capacity = 'Valid capacity is required';
        valid = false;
    }

    return valid;
};

const saveWaitingRoom = async () => {
    if (!validate()) return;

    loading.value = true;
    try {
        await createWaitingRoom(waitingRoom.value);
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Waiting room created successfully',
            life: 3000
        });
        emit('waiting-room-created');
        closeDialog();
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message,
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

const closeDialog = () => {
    waitingRoom.value = {
        room_name: '',
        capacity: null
    };
    errors.value = {
        room_name: null,
        capacity: null
    };
    emit('update:visible', false);
};
</script>

<template>
    <Dialog v-bind:visible="modelValue" modal header="Add New Waiting Room" :style="{ width: '400px' }"
        @update:visible="closeDialog">
        <div class="flex flex-col gap-2">
            <!-- Room Name -->
            <div class="field mb-2">
                <label for="room_name" class="block text-xs font-medium mb-1">Room Name</label>
                <InputText id="room_name" v-model="waitingRoom.room_name" class="w-full p-inputtext-xs"
                    :class="{ 'p-invalid': errors.room_name }" placeholder="Room name" size="small" />
                <small v-if="errors.room_name" class="p-error text-xs">{{ errors.room_name }}</small>
            </div>

            <!-- Capacity -->
            <div class="field mb-2">
                <label for="capacity" class="block text-xs font-medium mb-1">Capacity</label>
                <InputNumber id="capacity" v-model="waitingRoom.capacity" class="w-full p-inputtext-xs"
                    :class="{ 'p-invalid': errors.capacity }" mode="decimal" :min="1" placeholder="Capacity" size="small" />
                <small v-if="errors.capacity" class="p-error text-xs">{{ errors.capacity }}</small>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end gap-2">
                <Button label="Cancel" icon="pi pi-times" class="p-button-text p-button-sm p-button-secondary"
                    size="small" @click="closeDialog" />
                <Button label="Save" icon="pi pi-check" class="p-button-sm" size="small" :loading="loading"
                    @click="saveWaitingRoom" />
            </div>
        </template>
    </Dialog>
</template>

<style scoped>
.p-dialog .p-dialog-content {
    padding: 1.25rem;
}

.field {
    margin-bottom: 0.75rem;
}
</style>