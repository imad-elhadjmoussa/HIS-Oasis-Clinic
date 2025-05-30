<script setup>
import { ref } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Dialog from 'primevue/dialog';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { deleteMedicalRecord } from '../../api/medical_record.js';
import { formatDate } from '../../pages/Reception/index.js';
import { useUserStore } from '../../stors/user.js';

const router = useRouter();
const toast = useToast();
const userStore = useUserStore();

const props = defineProps({
    records: {
        type: Array,
        required: true
    }
});

const emit = defineEmits(['record-deleted']);

// Delete confirmation dialog state
const deleteDialogVisible = ref(false);
const recordToDelete = ref(null);

const navigateToDetailsPage = (ficheId) => {
    if (userStore.role === "Admin") {
        router.push(`/reception/medical-records/${ficheId}`);
    } else {
        router.push(`/medical-records/${ficheId}`);
    }
};

const confirmDelete = (record) => {
    recordToDelete.value = record;
    deleteDialogVisible.value = true;
};

const deleteRecord = async () => {
    if (!recordToDelete.value) return;

    try {
        await deleteMedicalRecord(recordToDelete.value.id);
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Medical record deleted successfully',
            life: 3000
        });
        emit('record-deleted');
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to delete medical record',
            life: 3000
        });
    } finally {
        deleteDialogVisible.value = false;
        recordToDelete.value = null;
    }
};

// Status severity based on completion
const getStatusSeverity = (status) => {
    return status === 'billed' ? 'success' : 'danger';
};
</script>

<template>
    <div>
        <DataTable :value="records" :paginator="true" :rows="5" responsiveLayout="scroll" class="p-datatable-sm">
            <Column field="id" header="Medical Record ID" sortable
                style="width: 100px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"></Column>
            <Column field="patient_name" header="Patient" sortable>
                <template #body="{ data }">
                    <div class="font-medium">{{ data.first_name }} {{ data.last_name }}</div>
                </template>
            </Column>
            <Column field="company_name" header="Company" sortable>
                <template #body="{ data }">
                    <div>{{ data.company_name }}</div>
                    <div class="text-sm text-gray-500">Contract: {{ data.contract_name }}</div>
                </template>
            </Column>
            <Column field="status" header="Status" sortable style="width: 150px">
                <template #body="{ data }">
                    <Tag :value="data.status" :severity="getStatusSeverity(data.status)" class="capitalize" />
                </template>
            </Column>

            <Column header="Actions" style="width: 120px">
                <template #body="{ data }">
                    <div class="flex gap-2">
                        <Button icon="pi pi-eye" class="p-button-rounded p-button-text p-button-info"
                            @click="navigateToDetailsPage(data.id)" />
                        <Button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger"
                            @click="confirmDelete(data)" />
                    </div>
                </template>
            </Column>

            <template #empty>
                <div class="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
                    <i class="pi pi-inbox text-4xl text-gray-400 mb-4"></i>
                    <h3 class="text-lg font-medium text-gray-600 mb-2">No Medical Records Found</h3>
                    <p class="text-gray-500 text-center mb-4">There are no medical records to display.</p>
                </div>
            </template>
        </DataTable>

        <!-- Delete Confirmation Dialog -->
        <Dialog v-model:visible="deleteDialogVisible" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="confirmation-content">
                <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                <span v-if="recordToDelete">
                    Are you sure you want to delete the medical record for
                    <b>{{ recordToDelete.first_name }} {{ recordToDelete.last_name }}</b>?
                </span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" @click="deleteDialogVisible = false" class="p-button-text" />
                <Button label="Yes" icon="pi pi-check" @click="deleteRecord" class="p-button-danger" autofocus />
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
.confirmation-content {
    display: flex;
    align-items: center;
    justify-content: center;
}

.capitalize {
    text-transform: capitalize;
}
</style>