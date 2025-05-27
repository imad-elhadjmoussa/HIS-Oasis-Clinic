<script setup>
import { ref, onMounted } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import { useToast } from 'primevue/usetoast'

import { getPatient } from '../../api/patient' // Import your getPatient function
import { formatDate } from '../../pages/Reception'

const props = defineProps({
    patientId: {
        type: Number,
        required: true
    }
})

const toast = useToast()
const visible = ref(false)
const patient = ref(null)
const loading = ref(false)

const fetchPatient = async () => {
    try {
        loading.value = true
        patient.value = await getPatient(props.patientId)
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message,
            life: 3000
        })
    } finally {
        loading.value = false
    }
}

const formatPhoneNumber = (phone) => {
    if (!phone) return ''
    return `${phone.slice(0, 3)} ${phone.slice(3, 5)} ${phone.slice(5, 7)} ${phone.slice(7)}`
}

onMounted(() => {
    fetchPatient()
})
</script>

<template>
    <Card>
        <template #title>
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <i class="pi pi-user"></i>
                    <span>Patient Information</span>
                </div>
                <Button v-if="patient" icon="pi pi-info-circle" label="Details" class="p-button-info p-button-sm"
                    @click="visible = true" />
            </div>
        </template>
        <template #content>
            <div v-if="loading" class="flex justify-center py-4">
                <i class="pi pi-spinner pi-spin"></i>
            </div>
            <div v-else-if="patient" class="grid gap-3">
                <div class="flex items-center gap-3">
                    <i class="pi pi-id-card text-gray-500"></i>
                    <div>
                        <p class="text-sm text-gray-500">Full Name</p>
                        <p class="font-medium">{{ patient.first_name }} {{ patient.last_name }}</p>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <i class="pi pi-tag text-gray-500"></i>
                    <div>
                        <p class="text-sm text-gray-500">National ID</p>
                        <p class="font-medium">{{ patient.national_id_number }}</p>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <i class="pi pi-phone text-gray-500"></i>
                    <div>
                        <p class="text-sm text-gray-500">Phone Number</p>
                        <p class="font-medium">{{ formatPhoneNumber(patient.phone_number) }}</p>
                    </div>
                </div>
            </div>
            <div v-else class="text-center py-4 text-gray-500">
                Patient data not available
            </div>
        </template>
    </Card>

    <Dialog v-model:visible="visible" modal header="Patient Details" :style="{ width: '50vw' }"
        :breakpoints="{ '960px': '75vw', '640px': '90vw' }">
        <div v-if="patient" class="grid gap-4">
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <p class="text-sm text-gray-500">First Name</p>
                    <p class="font-medium">{{ patient.first_name }}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Last Name</p>
                    <p class="font-medium">{{ patient.last_name }}</p>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <p class="text-sm text-gray-500">National ID</p>
                    <p class="font-medium">{{ patient.national_id_number }}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Date of Birth</p>
                    <p class="font-medium">{{ formatDate(patient.date_of_birth) }}</p>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <p class="text-sm text-gray-500">Phone Number</p>
                    <p class="font-medium">{{ formatPhoneNumber(patient.phone_number) }}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Email</p>
                    <p class="font-medium">{{ patient.email || '-' }}</p>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <p class="text-sm text-gray-500">Gender</p>
                    <p class="font-medium">{{ patient.gender }}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Blood Type</p>
                    <p class="font-medium">{{ patient.blood_type || '-' }}</p>
                </div>
            </div>

            <div>
                <p class="text-sm text-gray-500">Address</p>
                <p class="font-medium">{{ patient.address || '-' }}</p>
            </div>
        </div>
    </Dialog>
</template>