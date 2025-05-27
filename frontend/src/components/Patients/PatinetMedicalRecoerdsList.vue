<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast'
import Card from 'primevue/card'
import { getPatientMedicalRecords } from '../../api/patient'
import MedicalRecordsTable from '../MedicalRecords/MedicalRecordsTable.vue'
import AddMedicalRecordDialog from '../MedicalRecords/AddMedicalRecordDialog.vue'

const toast = useToast()
const route = useRoute()

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
    { label: 'Company', value: 'company' },
    { label: 'Contract', value: 'contract' },
]

const addMedicalRecordDialog = ref(false)

// Fetch medical records data for the specific patient
onMounted(async () => {
    await fetchPatientMedicalRecords()
})

const fetchPatientMedicalRecords = async () => {
    try {
        loading.value = true
        error.value = null
        const patientId = route.params.id
        const response = await getPatientMedicalRecords(patientId)
        medicalRecords.value = response
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
    fetchPatientMedicalRecords()
}
</script>

<template>
    <div class="p-2">
        <Toast position="top-right" />

        <h1 class="text-3xl my-5 font-bold">Patient Medical Records</h1>


        <!-- Error message -->
        <div v-if="error" class="p-4 mb-4 bg-red-100 text-red-700 rounded">
            Error loading records: {{ error }}
        </div>

        <!-- Simplified Filter Section -->
        <div class="flex gap-4 mb-6">
            <div class="w-full sm:w-1/4">
                <Dropdown size="small" v-model="filters.filterField" :options="filterOptions" optionLabel="label"
                    optionValue="value" class="w-full" />
            </div>

            <div class="flex-1">
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

        <!-- Empty state -->
        <div v-else-if="medicalRecords.length === 0"
            class="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
            <i class="pi pi-folder-open text-4xl text-gray-400 mb-4"></i>
            <h3 class="text-lg font-medium text-gray-600 mb-2">No Medical Records Found</h3>
            <p class="text-gray-500 text-center mb-4">This patient doesn't have any medical records yet.</p>
            <Button label="Add First Record" icon="pi pi-plus" @click="addMedicalRecordDialog = true"
                class="p-button-sm p-button-primary" />
        </div>

        <!-- Data Table -->
        <MedicalRecordsTable v-else :records="filteredMedicalRecords" @record-deleted="refreshMedicalRecords" />

        <AddMedicalRecordDialog v-model:visible="addMedicalRecordDialog" @record-added="refreshMedicalRecords"
            :patient="route.params.id" />
    </div>
</template>

<style scoped>
/* Make dropdowns match input height */
</style>