<script setup>
import { ref, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { deleteSpecialty } from '../../api/specialty';
import { Button, Column, DataTable, InputText, Dialog } from 'primevue';

const toast = useToast();
const props = defineProps({
    specialties: Array,
    loading: Boolean
});

const emit = defineEmits(['edit-specialty', 'refresh']);

const searchName = ref('');
const deleteDialogVisible = ref(false);
const specialtyToDelete = ref(null);

// Filter specialties based on name or code search (case-insensitive)
const filteredSpecialties = computed(() => {
    if (!searchName.value.trim()) return props.specialties;

    const searchTerm = searchName.value.trim().toLowerCase();
    return props.specialties.filter(specialty => {
        return (
            (specialty.specialty_name && specialty.specialty_name.toLowerCase().includes(searchTerm)) ||
            (specialty.specialty_code && specialty.specialty_code.toLowerCase().includes(searchTerm))
        );
    });
});

const handleEdit = (specialty) => {
    emit('edit-specialty', specialty);
};

const confirmDelete = (specialty) => {
    specialtyToDelete.value = specialty;
    deleteDialogVisible.value = true;
};

const handleDelete = async () => {
    try {
        await deleteSpecialty(specialtyToDelete.value.id);
        emit('refresh');
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Specialty deleted successfully',
            life: 3000,
        });
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message,
            life: 3000,
        });
    } finally {
        deleteDialogVisible.value = false;
        specialtyToDelete.value = null;
    }
};
</script>

<template>
    <div class="mb-4">
        <span class="p-input-icon-left">
            <InputText v-model="searchName" placeholder="Search by name or code..." class="w-full md:w-80" />
        </span>
    </div>

    <DataTable :value="filteredSpecialties" :paginator="true" class="p-datatable-sm" :rows="4" :loading="loading"
        stripedRows>
        <template #empty>
            <div class="text-center p-4 text-gray-500">
                <i class="pi pi-briefcase text-2xl mb-2" />
                <p>No specialties found</p>
            </div>
        </template>

        <template #loading>
            <div class="flex items-center justify-center p-4">
                <i class="pi pi-spinner pi-spin mr-2"></i>
                <span>Loading specialties...</span>
            </div>
        </template>

        <Column field="specialty_code" header="Code" sortable>
            <template #body="{ data }">
                <span class="font-medium">{{ data.specialty_code }}</span>
            </template>
        </Column>

        <Column field="specialty_name" header="Name" sortable>
            <template #body="{ data }">
                <span class="font-medium">{{ data.specialty_name }}</span>
            </template>
        </Column>

        <Column field="description" header="Description">
            <template #body="{ data }">
                <span class="text-gray-600">{{ data.description || '-' }}</span>
            </template>
        </Column>

        <Column header="Actions" style="width: 100px">
            <template #body="{ data }">
                <div class="flex gap-2">
                    <Button icon="pi pi-pencil" class="p-button-sm p-button-text" @click="handleEdit(data)" />
                    <Button icon="pi pi-trash" class="p-button-sm p-button-text p-button-danger"
                        @click="confirmDelete(data)" />
                </div>
            </template>
        </Column>
    </DataTable>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:visible="deleteDialogVisible" header="Confirm Deletion" :modal="true" :style="{ width: '450px' }">
        <div class="confirmation-content">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="specialtyToDelete">
                Are you sure you want to delete <b>{{ specialtyToDelete.specialty_name }}</b>?
            </span>
        </div>

        <template #footer>
            <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteDialogVisible = false" />
            <Button label="Yes" icon="pi pi-check" class="p-button-text p-button-danger" @click="handleDelete" />
        </template>
    </Dialog>
</template>

<style scoped>
.confirmation-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 1rem;
}
</style>