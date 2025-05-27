<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import { getSpecialties, getSpecialtyDetails } from '../../api/specialty'
import { useRoute } from 'vue-router'
import { createMedicalRecordPrestation } from '../../api/medical-record-prestation'

const toast = useToast()
const route = useRoute()
const id = route.params.id

const props = defineProps({
    modelValue: {
        type: Boolean,
        required: true
    },
    prestations: {
        type: Array,
        required: true
    }
})


const emit = defineEmits([
    'update:modelValue',
    'add-prestation'
])

// State for fetched data
const specialties = ref([])
const currentSpecialtyDetails = ref({
    specialty_id: null,
    specialty_name: '',
    doctors: [],
    prestations: []
})

// Current prestation data
const newPrestation = ref({
    specialty: null,
    prestation: null,
    doctor: null
})

// Fetch all specialties when component mounts
onMounted(async () => {
    try {
        const response = await getSpecialties()
        specialties.value = response
    } catch (error) {
        showError('Failed to fetch specialties', error)
    }
})

// Fetch and update specialty details when a specialty is selected
const fetchSpecialtyDetails = async (specialtyId) => {
    if (!specialtyId) return

    try {
        const response = await getSpecialtyDetails(specialtyId)
        currentSpecialtyDetails.value = response
        resetDependentFields()
    } catch (error) {
        showError(`Failed to fetch details for specialty ${specialtyId}`, error)
        resetSpecialtyDetails()
    }
}

// Reset dependent fields
const resetDependentFields = () => {
    newPrestation.value.prestation = null
    newPrestation.value.doctor = null
}

// Reset specialty details
const resetSpecialtyDetails = () => {
    currentSpecialtyDetails.value = {
        specialty_id: null,
        specialty_name: '',
        doctors: [],
        prestations: []
    }
}

// Selected prestation details
const selectedPrestation = computed(() => {
    if (!newPrestation.value.prestation) return null
    return currentSpecialtyDetails.value.prestations.find(
        p => p.prestation_id === newPrestation.value.prestation
    )
})

// Total amount calculation
const totalAmount = computed(() => {
    return selectedPrestation.value?.price || 0
})

// Show error toast
const showError = (message, error) => {
    console.error(message, error)
    toast.add({
        severity: 'error',
        summary: 'Error',
        detail: message,
        life: 5000
    })
}

// Add new prestation
const addPrestation = async () => {
    if (!selectedPrestation.value) return
    try {
        const data = {
            specialty_id: newPrestation.value.specialty,
            prestation_id: newPrestation.value.prestation,
            doctor_id: newPrestation.value.doctor,
            medical_record_id: id
        }
        const response = await createMedicalRecordPrestation(data)
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: response.message,
            life: 3000
        })
        emit('update:modelValue', false)
        emit('add-prestation')
    } catch (error) {
        showError('Failed to add prestation', error.message)
    }
}

// Watch for specialty changes
watch(() => newPrestation.value.specialty, (newSpecialtyId) => {
    if (newSpecialtyId) {
        fetchSpecialtyDetails(newSpecialtyId)
    } else {
        resetSpecialtyDetails()
        resetDependentFields()
    }
})

// Reset form when dialog opens
watch(() => props.modelValue, (visible) => {
    if (visible) {
        newPrestation.value = {
            specialty: null,
            prestation: null,
            doctor: null
        }
        resetSpecialtyDetails()
    }
})
</script>

<template>
    <Dialog :visible="modelValue" @update:visible="$emit('update:modelValue', $event)" header="Add Medical Prestation"
        :style="{ width: '700px' }" :modal="true" class="p-fluid">
        <div class="grid gap-4">
            <!-- Prestation form -->
            <div class="grid grid-cols-2 gap-4">
                <div class="field">
                    <label for="specialty" class="block text-sm font-medium mb-1">Specialty*</label>
                    <Dropdown id="specialty" v-model="newPrestation.specialty" :options="specialties"
                        optionLabel="specialty_name" optionValue="id" placeholder="Select Specialty" class="w-full" />
                </div>

                <div class="field">
                    <label for="prestation" class="block text-sm font-medium mb-1">Medical Prestation*</label>
                    <Dropdown id="prestation" v-model="newPrestation.prestation"
                        :options="currentSpecialtyDetails.prestations" optionLabel="prestation_name"
                        optionValue="prestation_id" placeholder="Select Prestation" class="w-full"
                        :disabled="!newPrestation.specialty" />
                </div>
            </div>

            <div class="field">
                <label for="doctor" class="block text-sm font-medium mb-1">Doctor</label>
                <Dropdown id="doctor" v-model="newPrestation.doctor" :options="currentSpecialtyDetails.doctors"
                    optionLabel="doctor_first_name" optionValue="doctor_id"
                    placeholder="Select Doctor" class="w-full" :disabled="!newPrestation.specialty" />
            </div>


        </div>

        <template #footer>
            <Button label="Cancel" icon="pi pi-times" @click="$emit('update:modelValue', false)"
                class="p-button-text" />
            <Button label="Add Prestation" icon="pi pi-plus" @click="addPrestation"
                :disabled="!newPrestation.specialty || !newPrestation.prestation || !newPrestation.doctor"
                class="p-button-success" />
        </template>
    </Dialog>
</template>