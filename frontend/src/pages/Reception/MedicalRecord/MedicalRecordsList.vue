<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast'
import Card from 'primevue/card'
import { getMedicalRecords } from '../../../api/medical_record'
import AddMedicalRecordDialog from '../../../components/MedicalRecords/AddMedicalRecordDialog.vue'
import MedicalRecordsTable from '../../../components/MedicalRecords/MedicalRecordsTable.vue'
import { formatDate, showNotification } from '../index'

const toast = useToast()

const medicalRecords = ref([])
const loading = ref(false)
const error = ref(null)

// Filters
const filters = ref({
    search: '',
    filterField: 'record_id', // Default filter field
})

const filterOptions = [
    { label: 'Medical Record ID', value: 'record_id' },
    { label: 'Patient', value: 'patient' },
    { label: 'Company', value: 'company' },
    { label: 'Contract', value: 'contract' },
]

const addMedicalRecordDialog = ref(false)

// Fetch medical records data
onMounted(async () => {
    await fetchMedicalRecords()
})

const fetchMedicalRecords = async () => {
    try {
        loading.value = true
        error.value = null
        const response = await getMedicalRecords()
        medicalRecords.value = response;
    } catch (err) {
        error.value = err.message
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to fetch medical records',
            life: 3000
        })
    } finally {
        loading.value = false
    }
}

const filteredMedicalRecords = computed(() => {
    if (!filters.value.search) return medicalRecords.value

    return medicalRecords.value.filter(record => {
        const searchTerm = filters.value.search.toLowerCase()
        const field = filters.value.filterField

        if (field === 'record_id') {
            return record.id.toString().includes(searchTerm)
        }
        else if (field === 'patient') {
            return (
                record.first_name.toLowerCase().includes(searchTerm) ||
                record.last_name.toLowerCase().includes(searchTerm) ||
                record.national_id_number.includes(searchTerm))
        }
        else if (field === 'company') {
            return record.company_name?.toLowerCase().includes(searchTerm)
        }
        else if (field === 'contract') {
            return record.contract_name?.toLowerCase().includes(searchTerm)
        }
        return true
    })
})

const refreshMedicalRecords = () => {
    fetchMedicalRecords()
}
</script>

<template>
    <div class="p-2">
        <Toast position="top-right" />

        <div class="flex mb-10 flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h1 class="text-3xl font-bold">Medical Records</h1>
        </div>

        <!-- Error message -->
        <div v-if="error" class="p-4 mb-4 bg-red-100 text-red-700 rounded">
            Error loading records: {{ error }}
        </div>

        <!-- Simplified Filter Section -->
        <div class="flex  gap-4 mb-6 ">
            <div class="w-full sm:w-1/4">
                <Dropdown size="small" v-model="filters.filterField" :options="filterOptions" optionLabel="label"
                    optionValue="value" class="w-full" />
            </div>

            <div class=" flex-1">
                <InputText size="small" v-model="filters.search" class="w-full" placeholder="Search records..." />
            </div>

            <Button label="Add New Record" icon="pi pi-plus" @click="addMedicalRecordDialog = true"
                class="p-button-sm p-button-primary" />

        </div>

        <!-- Loading indicator -->
        <div v-if="loading" class="flex justify-center p-4">
            <i class="pi pi-spinner pi-spin text-2xl"></i>
            <span class="ml-2">Loading medical records...</span>
        </div>

        <!-- Data Table -->
        <MedicalRecordsTable v-else :records="filteredMedicalRecords" @refresh="refreshMedicalRecords"
            @record-deleted="refreshMedicalRecords" />

        <AddMedicalRecordDialog v-model:visible="addMedicalRecordDialog" @record-added="refreshMedicalRecords" />
    </div>
</template>

<style scoped>
/* Make dropdowns match input height */
</style>