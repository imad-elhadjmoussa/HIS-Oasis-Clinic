<script setup>
import { ref, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { deletePrestation } from '../../api/prestation';
import { Button, Column, DataTable, Dialog, InputText, Select, Tag } from 'primevue';

const toast = useToast();
const props = defineProps({
    prestations: Array,
    specialties: Array, // To show specialty names
    loading: Boolean
});

const emit = defineEmits(['edit-prestation', 'refresh']);

const searchName = ref('');
const searchCode = ref('');
const selectedSpecialty = ref(null); // For specialty filter

const deleteDialogVisible = ref(false);
const prestationToDelete = ref(null);

const filteredPrestations = computed(() => {
    let result = props.prestations;

    // Filter by name if search term exists
    if (searchName.value) {
        const nameQuery = searchName.value.toLowerCase();
        result = result.filter(p =>
            p.prestation_name.toLowerCase().includes(nameQuery)
        );
    }

    // Filter by code if search term exists
    if (searchCode.value) {
        const codeQuery = searchCode.value.toLowerCase();
        result = result.filter(p =>
            p.prestation_code.toLowerCase().includes(codeQuery)
        );
    }

    // Filter by specialty if selected
    if (selectedSpecialty.value) {
        result = result.filter(p =>
            p.specialty_id === selectedSpecialty.value.id
        );
    }

    return result;
});

const getSpecialtyName = (id) => {
    const specialty = props.specialties.find(s => s.id === id);
    return specialty ? specialty.specialty_name : 'N/A';
};

const handleEdit = (prestation) => {
    emit('edit-prestation', prestation);
};

const confirmDelete = (prestation) => {
    prestationToDelete.value = prestation;
    deleteDialogVisible.value = true;
};

const handleDelete = async () => {
    try {
        await deletePrestation(prestationToDelete.value.id);
        emit('refresh');
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Prestation deleted successfully',
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
        prestationToDelete.value = null;
    }
};
</script>

<template>
    <div class="mb-4 flex flex-wrap align-items-center gap-3">
        <!-- Search by Name -->
        <div class="flex-1 min-w-[200px]">
            <span class="p-input-icon-left w-full">
                <InputText v-model="searchName" placeholder="Search by name..." class="w-full" />
            </span>
        </div>

        <!-- Search by Code -->
        <div class="flex-1 min-w-[200px]">
            <span class="p-input-icon-left w-full">
                <InputText v-model="searchCode" placeholder="Search by code..." class="w-full" />
            </span>
        </div>

        <!-- Filter by Specialty -->
        <div class="flex-1 min-w-[250px]">
            <Select v-model="selectedSpecialty" :options="props.specialties" optionLabel="specialty_name"
                placeholder="Filter by specialty (All)" :showClear="true" class="w-full">
                <template #option="slotProps">
                    <span>{{ slotProps.option.specialty_name }}</span>
                </template>
            </Select>
        </div>
    </div>

    <DataTable :value="filteredPrestations" :paginator="true" :rows="5" class="p-datatable-sm" :loading="loading" stripedRows>
        <template #empty>
            <div class="text-center p-4 text-gray-500">
                <i class="pi pi-list text-2xl mb-2" />
                <p>No prestations found</p>
            </div>
        </template>

        <template #loading>
            <div class="flex items-center justify-center p-4">
                <i class="pi pi-spinner pi-spin mr-2"></i>
                <span>Loading prestations...</span>
            </div>
        </template>

        <Column field="prestation_code" header="Code" sortable>
            <template #body="{ data }">
                <span class="font-medium">{{ data.prestation_code }}</span>
            </template>
        </Column>

        <Column field="prestation_name" header="Name" sortable>
            <template #body="{ data }">
                <span class="font-medium">{{ data.prestation_name }}</span>
            </template>
        </Column>

        <Column field="specialty_id" header="Specialty" sortable>
            <template #body="{ data }">
                <Tag :value="getSpecialtyName(data.specialty_id)" />
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
            <span v-if="prestationToDelete">
                Are you sure you want to delete <b>{{ prestationToDelete.prestation_name }}</b>?
            </span>
        </div>

        <template #footer>
            <Button size="small" label="No" icon="pi pi-times" class="p-button-secondary"
                @click="deleteDialogVisible = false" />
            <Button size="small" label="Yes" icon="pi pi-check" class="p-button-danger" @click="handleDelete" />
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