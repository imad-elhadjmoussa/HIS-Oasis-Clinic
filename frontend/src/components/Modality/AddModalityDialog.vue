<script setup>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { createModality } from '../../api/modality';
import { Button, Dialog, Dropdown, InputText } from 'primevue';

const props = defineProps({
    modelValue: {
        type: Boolean,
        required: true
    },
    prestationLists: {
        type: Array,
        default: () => []
    },
    waitingRooms: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(['update:visible', 'modality-created']);

const toast = useToast();
const modality = ref({
    modality_name: '',
    prestation_list_id: null,
    waiting_room_id: null
});
const loading = ref(false);
const errors = ref({
    modality_name: null,
    prestation_list_id: null,
    waiting_room_id: null
});

const validate = () => {
    let valid = true;
    errors.value = {
        modality_name: null,
        prestation_list_id: null,
        waiting_room_id: null
    };

    if (!modality.value.modality_name) {
        errors.value.modality_name = 'Modality name is required';
        valid = false;
    }

    if (!modality.value.prestation_list_id) {
        errors.value.prestation_list_id = 'Prestation list is required';
        valid = false;
    }

    if (!modality.value.waiting_room_id) {
        errors.value.waiting_room_id = 'Waiting room is required';
        valid = false;
    }

    return valid;
};

const saveModality = async () => {
    if (!validate()) return;

    loading.value = true;
    try {
        await createModality(modality.value);
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Modality created successfully',
            life: 3000
        });
        emit('modality-created');
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
    modality.value = {
        modality_name: '',
        prestation_list_id: null,
        waiting_room_id: null
    };
    errors.value = {
        modality_name: null,
        prestation_list_id: null,
        waiting_room_id: null
    };
    emit('update:visible', false);
};
</script>

<template>
    <Dialog :visible="modelValue" modal header="Add New Modality" :style="{ width: '400px' }"
        @update:visible="closeDialog">
        <div class="flex flex-col gap-2">
            <div class="field mb-2">
                <label for="modality_name" class="block text-xs font-medium mb-1">Modality Name</label>
                <InputText id="modality_name" v-model="modality.modality_name" class="w-full p-inputtext-xs"
                    :class="{ 'p-invalid': errors.modality_name }" placeholder="Enter modality name" size="small" />
                <small v-if="errors.modality_name" class="p-error text-xs">{{ errors.modality_name }}</small>
            </div>

            <div class="field mb-2">
                <label for="prestation_list_id" class="block text-xs font-medium mb-1">Prestation </label>
                <Dropdown id="prestation_list_id" v-model="modality.prestation_list_id" :options="prestationLists"
                    optionLabel="prestation_name" optionValue="id" placeholder="Select a prestation list"
                    class="w-full p-inputtext-xs" :class="{ 'p-invalid': errors.prestation_list_id }" />
                <small v-if="errors.prestation_list_id" class="p-error text-xs">{{ errors.prestation_list_id
                }}</small>
            </div>

            <div class="field mb-2">
                <label for="waiting_room_id" class="block text-xs font-medium mb-1">Waiting Room</label>
                <Dropdown id="waiting_room_id" v-model="modality.waiting_room_id" :options="waitingRooms"
                    optionLabel="room_name" optionValue="id" placeholder="Select a waiting room"
                    class="w-full p-inputtext-xs" :class="{ 'p-invalid': errors.waiting_room_id }" />
                <small v-if="errors.waiting_room_id" class="p-error text-xs">{{ errors.waiting_room_id }}</small>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end gap-2">
                <Button label="Cancel" icon="pi pi-times" class="p-button-text p-button-sm p-button-secondary"
                    size="small" @click="closeDialog" />
                <Button label="Save" icon="pi pi-check" class="p-button-sm" size="small" :loading="loading"
                    @click="saveModality" />
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