<script setup>
import { useToast } from 'primevue/usetoast';
import { deleteModality } from '../../api/modality';
import { ref } from 'vue';
import { Button, Column, DataTable, Dialog } from 'primevue';

const props = defineProps({
    modalities: {
        type: Array,
        required: true
    },
    loading: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['edit-modality', 'refresh']);

const toast = useToast();
const deleteDialogVisible = ref(false);
const modalityToDelete = ref(null);

const confirmDelete = (modality) => {
    modalityToDelete.value = modality;
    deleteDialogVisible.value = true;
};

const handleDelete = async () => {
    try {
        await deleteModality(modalityToDelete.value.id);
        emit('refresh');
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Modality deleted successfully',
            life: 3000
        });
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message,
            life: 3000
        });
    } finally {
        deleteDialogVisible.value = false;
        modalityToDelete.value = null;
    }
};
</script>

<template>
    <div class="card p-4">
        <DataTable :value="modalities" :loading="loading" class="p-datatable-sm" responsiveLayout="scroll">
            <Column field="modality_name" header="Modality Name" :sortable="true">
                <template #body="{ data }">
                    <span class="font-medium">{{ data.modality_name }}</span>
                </template>
            </Column>

            <Column field="prestation_name" header="Prestation List" :sortable="true">
                <template #body="{ data }">
                    <span class="bg-blue-100 text-blue-800 py-1 px-2 rounded-md text-sm">
                        {{ data.prestation_name }}
                    </span>
                </template>
            </Column>

            <Column field="room_name" header="Waiting Room" :sortable="true">
                <template #body="{ data }">
                    <span class="bg-green-100 text-green-800 py-1 px-2 rounded-md text-sm">
                        {{ data.room_name }}
                    </span>
                </template>
            </Column>

            <Column field="created_at" header="Created" :sortable="true">
                <template #body="{ data }">
                    {{ new Date(data.created_at).toLocaleDateString() }}
                </template>
            </Column>

            <Column header="Actions" :exportable="false" style="min-width: 120px">
                <template #body="{ data }">
                    <div class="flex gap-2 justify-center">
                        <Button icon="pi pi-pencil" class="p-button-sm p-button-rounded p-button-text p-button-primary"
                            @click="emit('edit-modality', data)" />
                        <Button icon="pi pi-trash" class="p-button-sm p-button-rounded p-button-text p-button-danger"
                            @click="confirmDelete(data)" />
                    </div>
                </template>
            </Column>

            <template #empty>
                <div class="text-center p-4 text-gray-500">
                    <i class="pi pi-inbox text-2xl mb-2" />
                    <p>No modalities found</p>
                </div>
            </template>

            <template #loading>
                <div class="flex justify-center p-4">
                    <i class="pi pi-spinner pi-spin text-2xl" />
                </div>
            </template>
        </DataTable>

        <Dialog v-model:visible="deleteDialogVisible" modal header="Confirm Deletion" :style="{ width: '400px' }">
            <div class="flex align-items-center gap-3 mb-3">
                <i class="pi pi-exclamation-triangle text-red-500" style="font-size: 2rem" />
                <span>Are you sure you want to delete <strong>{{ modalityToDelete?.modality_name }}</strong>?</span>
            </div>

            <template #footer>
                <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteDialogVisible = false" />
                <Button label="Yes" icon="pi pi-check" class="p-button-danger" @click="handleDelete" />
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
:deep(.p-datatable .p-datatable-thead > tr > th) {
    background-color: #f8f9fa;
    font-weight: 600;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
    background-color: #f8fafc !important;
}
</style>