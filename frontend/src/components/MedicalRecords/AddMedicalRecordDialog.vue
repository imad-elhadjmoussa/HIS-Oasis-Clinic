<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useToast } from 'primevue/usetoast'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import { createFiche } from '../../api/medical_record.js'
import { showNotification } from '../../pages/Reception/index.js'
import { getCompanies } from '../../api/companies.js'
import { getPatients, getPatient } from '../../api/patient.js'
import DatePicker from 'primevue/datepicker';


const toast = useToast()
const api_url = import.meta.env.VITE_SERVER_URL

const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    },
    medicalRecords: {
        type: Array,
        required: true
    },
    patient: {
        type: [Object, Number, String],
        default: null
    }
})

const emit = defineEmits(['update:visible', 'record-added'])

const newFiche = ref({
    patient_id: "",
    company_id: null,
    contract_id: null,
    prise_en_charge_date: null,
    prise_en_charge_image: null
})

// For UI only - not sent to API
const selectedPatientName = ref("")
const loadingPatient = ref(false)

const companies = ref([])
const contracts = ref([])
const patients = ref([])
const searchTerm = ref("")
const showPatientDropdown = ref(false)

// Computed property for filtered patients
const filteredPatients = computed(() => {
    if (!searchTerm.value) return []
    const term = searchTerm.value.toLowerCase()
    return patients.value.filter(patient =>
        patient.first_name?.toLowerCase().includes(term) ||
        patient.last_name?.toLowerCase().includes(term) ||
        patient.national_id_number?.includes(term) ||
        patient.phone_number?.includes(term)
    )
})

const fetchCompanies = async () => {
    try {
        const response = await getCompanies()
        companies.value = response || []
    } catch (error) {
        showNotification(toast, error.message || 'Failed to fetch companies', 'error')
        companies.value = []
    }
}

const fetchPatients = async () => {
    try {
        const response = await getPatients()
        patients.value = response || []
    } catch (error) {
        showNotification(toast, error.message || 'Failed to fetch patients', 'error')
        patients.value = []
    }
}

const fetchPatientDetails = async (patientId) => {
    try {
        loadingPatient.value = true
        const patient = await getPatient(patientId)
        if (patient) {
            selectedPatientName.value = `${patient.first_name} ${patient.last_name} (${patient.national_id_number})`
        }
    } catch (error) {
        showNotification(toast, error.message || 'Failed to fetch patient details', 'error')
        selectedPatientName.value = `Patient ID: ${patientId}`
    } finally {
        loadingPatient.value = false
    }
}

const fetchCompanyContracts = async (companyId) => {
    if (!companyId) {
        contracts.value = []
        newFiche.value.contract_id = null
        return
    }

    try {
        const response = await fetch(`${api_url}/api/contracts/company/${companyId}?status=active`)
        if (!response.ok) throw new Error('Failed to fetch contracts')
        contracts.value = await response.json()
    } catch (error) {
        showNotification(toast, error.message || 'Failed to fetch contracts', 'error')
        contracts.value = []
    }
}

// Initialize component
const initialize = async () => {
    await fetchCompanies()

    if (props.patient) {
        if (typeof props.patient === 'object') {
            // Full patient object provided
            newFiche.value.patient_id = props.patient.id
            selectedPatientName.value = `${props.patient.first_name} ${props.patient.last_name} (${props.patient.national_id_number})`
        } else {
            // Just patient ID provided
            newFiche.value.patient_id = props.patient
            await fetchPatientDetails(props.patient)
        }
    } else {
        await fetchPatients()
    }
}

// Fetch data when component mounts
onMounted(initialize)

// Fetch contracts when company is selected
watch(() => newFiche.value.company_id, fetchCompanyContracts)

const closeDialog = () => {
    emit('update:visible', false)
}

const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
        newFiche.value.prise_en_charge_image = file;
    }
}

const submitFiche = async () => {
    try {
        if (!newFiche.value.patient_id) {
            throw new Error('Patient is required');
        }

        // Create payload - the createFiche function will handle conversion to FormData if needed
        const payload = {
            patient_id: newFiche.value.patient_id,
            company_id: newFiche.value.company_id,
            contract_id: newFiche.value.contract_id,
            prise_en_charge_date: newFiche.value.prise_en_charge_date,
            prise_en_charge_image: newFiche.value.prise_en_charge_image // Include the image file
        };

        console.log(payload);

        await createFiche(payload);
        showNotification(toast, 'Fiche created successfully', 'success');
        emit('record-added');
        closeDialog();
    } catch (error) {
        showNotification(toast, error.message || 'Failed to create fiche', 'error');
    }
};
const resetForm = () => {
    newFiche.value = {
        patient_id: props.patient ?
            (typeof props.patient === 'object' ? props.patient.id : props.patient)
            : "",
        company_id: null,
        contract_id: null,
        prise_en_charge_date: null,
        prise_en_charge_image: null
    }

    if (props.patient && typeof props.patient === 'object') {
        selectedPatientName.value = `${props.patient.first_name} ${props.patient.last_name} (${props.patient.national_id_number})`
    } else if (props.patient) {
        fetchPatientDetails(props.patient)
    } else {
        selectedPatientName.value = ""
    }

    searchTerm.value = ""
    contracts.value = []
    showPatientDropdown.value = false
}

const selectPatient = (patient) => {
    newFiche.value.patient_id = patient.id
    selectedPatientName.value = `${patient.first_name} ${patient.last_name} (${patient.national_id_number})`
    searchTerm.value = selectedPatientName.value
    showPatientDropdown.value = false
}

// Reset form when dialog is opened
watch(() => props.visible, (isVisible) => {
    if (isVisible) resetForm()
})

// Watch for patient prop changes
watch(() => props.patient, (newPatient) => {
    if (newPatient) {
        if (typeof newPatient === 'object') {
            newFiche.value.patient_id = newPatient.id
            selectedPatientName.value = `${newPatient.first_name} ${newPatient.last_name} (${newPatient.national_id_number})`
        } else {
            newFiche.value.patient_id = newPatient
            fetchPatientDetails(newPatient)
        }
    }
})
</script>

<template>
    <Dialog :visible="visible" @update:visible="closeDialog" :style="{ width: '600px' }" header="Create New Medical Record"
        :modal="true" class="p-fluid">
        <div class="grid">
            <!-- Patient Input - Different based on whether patient prop is provided -->
            <div class="field" v-if="!patient">
                <label for="patientSearch" class="block text-sm font-medium mb-1">Patient*</label>
                <div class="relative">
                    <InputText id="patientSearch" v-model="searchTerm" class="w-full" size="small" required
                        @focus="showPatientDropdown = true"
                        @blur="setTimeout(() => { showPatientDropdown = false }, 200)"
                        placeholder="Search by name, ID, or phone" />

                    <div v-if="showPatientDropdown && filteredPatients.length > 0"
                        class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                        <div v-for="patient in filteredPatients" :key="patient.id"
                            class="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                            @mousedown.prevent="selectPatient(patient)">
                            <div class="font-medium">{{ patient.first_name }} {{ patient.last_name }}</div>
                            <div class="text-xs text-gray-500">
                                ID: {{ patient.national_id_number }} | Phone: {{ patient.phone_number }}
                            </div>
                        </div>
                    </div>
                </div>
                <small v-if="newFiche.patient_id" class="text-green-600">
                    Patient selected: {{ selectedPatientName }}
                </small>
            </div>

            <div class="field" v-else>
                <label class="block text-sm font-medium mb-1">Patient</label>
                <div class="p-2 border rounded bg-gray-50">
                    <template v-if="loadingPatient">
                        <i class="pi pi-spinner pi-spin mr-2"></i>
                        Loading patient details...
                    </template>
                    <template v-else>
                        {{ selectedPatientName || `Patient ID: ${patient}` }}
                    </template>
                </div>
                <small class="text-gray-500">Patient is pre-selected</small>
            </div>

            <div class="field">
                <label for="company" class="block text-sm font-medium mb-1">Company</label>
                <Dropdown id="company" v-model="newFiche.company_id" optionLabel="company_name" :options="companies"
                    optionValue="id" placeholder="Select Company" class="w-full" size="small" />
            </div>

            <div class="field">
                <label for="agreement" class="block text-sm font-medium mb-1">Contract</label>
                <Dropdown id="agreement" v-model="newFiche.contract_id" :options="contracts" optionLabel="contract_name"
                    optionValue="id" placeholder="Select Contract" class="w-full" size="small"
                    :disabled="!newFiche.company_id" />
                <small v-if="newFiche.company_id && contracts.length === 0" class="text-gray-500">
                    No contracts available for the selected company
                </small>
            </div>

            <div class="field">
                <label for="date_prise_en_charge" class="block text-sm font-medium mb-1">Date of Prise en Charge</label>
                <DatePicker size="small" v-model="newFiche.prise_en_charge_date" placeholder="Date of prise en charge"
                    class="w-full" showIcon iconDisplay="input" />
            </div>

            <div class="field">
                <label for="imageUpload" class="block text-sm font-medium mb-1">Upload Prise en Charge Image:</label>
                <input  type="file" id="imageUpload" @change="handleImageUpload" accept="image/*" class="w-full py-2 px-3 border border-gray-300 rounded-lg " />
                <small v-if="newFiche.image" class="text-green-600">Image selected</small>
            </div>
        </div>

        <template #footer>
            <Button size="small" label="Cancel" icon="pi pi-times" @click="closeDialog" class="p-button-secondary" />
            <Button size="small" label="Create" icon="pi pi-check" @click="submitFiche" class="p-button-success"
                :disabled="!newFiche.patient_id & !newFiche.date_prise_en_charge" :loading="loadingPatient" />
        </template>
    </Dialog>
</template>

<style scoped>
.field {
    margin-bottom: 1.5rem;
}

.relative {
    position: relative;
}

.absolute {
    position: absolute;
}

.z-10 {
    z-index: 10;
}

.max-h-60 {
    max-height: 15rem;
}

.overflow-auto {
    overflow: auto;
}
</style>