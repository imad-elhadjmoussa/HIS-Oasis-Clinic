<script setup>
import { ref, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { deleteDoctor } from '../../api/doctor';
import { Button, Column, DataTable, Select,InputText,Tag, Dialog } from 'primevue';

const toast = useToast();
const props = defineProps({
    doctors: Array,
    specialties: Array,
    loading: Boolean
});

const emit = defineEmits(['edit-doctor', 'refresh']);

const searchName = ref('');
const searchSpecialty = ref(null);
const deleteDialogVisible = ref(false);
const doctorToDelete = ref(null);

const filteredDoctors = computed(() => {
    let result = props.doctors;

    if (searchName.value) {
        const query = searchName.value.toLowerCase();
        result = result.filter(doctor =>
            `${doctor.first_name} ${doctor.last_name}`.toLowerCase().includes(query) ||
            doctor.national_id_number.includes(query)
        );
    }

    if (searchSpecialty.value) {
        result = result.filter(doctor =>
            doctor.specialty_id === searchSpecialty.value.id
        );
    }

    return result;
});

const getSpecialtyName = (id) => {
    const specialty = props.specialties.find(s => s.id === id);
    return specialty ? specialty.specialty_name : 'N/A';
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
};

const handleEdit = (doctor) => {
    emit('edit-doctor', doctor);
};

const confirmDelete = (doctor) => {
    doctorToDelete.value = doctor;
    deleteDialogVisible.value = true;
};

const handleDelete = async () => {
    try {
        await deleteDoctor(doctorToDelete.value.id);
        emit('refresh');
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Doctor deleted successfully',
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
        doctorToDelete.value = null;
    }
};
</script>

<template>
    <div class="mb-4 flex flex-wrap align-items-center gap-3">
        <div class="flex-1 min-w-[200px]">
            <span class="p-input-icon-left w-full">
                <InputText v-model="searchName" placeholder="Search doctors..." class="w-full" />
            </span>
        </div>

        <div class="flex-1 min-w-[250px]">
            <Select v-model="searchSpecialty" :options="props.specialties" optionLabel="specialty_name"
                placeholder="Filter by specialty" :showClear="true" class="w-full" />
        </div>
    </div>

    <DataTable :value="filteredDoctors" :paginator="true" :rows="10" :loading="loading" stripedRows>
        <template #empty>
            <div class="text-center p-4 text-gray-500">
                <i class="pi pi-user text-2xl mb-2" />
                <p>No doctors found</p>
            </div>
        </template>

        <template #loading>
            <div class="flex items-center justify-center p-4">
                <i class="pi pi-spinner pi-spin mr-2"></i>
                <span>Loading doctors...</span>
            </div>
        </template>

        <Column field="id" header="ID" sortable>
            <template #body="{ data }">
                <span class="font-medium">{{ data.id }}</span>
            </template>
        </Column>

        <Column header="Name" sortable>
            <template #body="{ data }">
                <span class="font-medium">{{ data.first_name }} {{ data.last_name }}</span>
            </template>
        </Column>

        <Column field="national_id_number" header="National ID" sortable>
            <template #body="{ data }">
                <span class="font-mono">{{ data.national_id_number }}</span>
            </template>
        </Column>

        <Column field="date_of_birth" header="Birth Date" sortable>
            <template #body="{ data }">
                {{ formatDate(data.date_of_birth) }}
            </template>
        </Column>

        <Column field="gender" header="Gender" sortable>
            <template #body="{ data }">
                <Tag :value="data.gender" :severity="data.gender === 'male' ? 'info' : 'warning'" />
            </template>
        </Column>

        <Column field="specialty_id" header="Specialty" sortable>
            <template #body="{ data }">
                <Tag :value="getSpecialtyName(data.specialty_id)" />
            </template>
        </Column>

        <Column header="Actions" style="width: 120px">
            <template #body="{ data }">
                <div class="flex gap-2">
                    <Button icon="pi pi-pencil" class="p-button-sm p-button-text" @click="handleEdit(data)" />
                    <Button icon="pi pi-trash" class="p-button-sm p-button-text p-button-danger"
                        @click="confirmDelete(data)" />
                </div>
            </template>
        </Column>
    </DataTable>

    <Dialog v-model:visible="deleteDialogVisible" header="Confirm Deletion" :modal="true" :style="{ width: '450px' }">
        <div class="confirmation-content">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="doctorToDelete">
                Are you sure you want to delete Dr. <b>{{ doctorToDelete.first_name }} {{ doctorToDelete.last_name
                    }}</b>?
            </span>
        </div>

        <template #footer>
            <Button size="small" label="No" icon="pi pi-times" class="p-button-secondary" @click="deleteDialogVisible = false" />
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