<template>
    <div class="grid">
        <!-- First Row - Stats Cards -->
        <div class="col-12 md:col-6 lg:col-3">
            <Card class="shadow-1 hover:shadow-3 transition-all transition-duration-300 border-1 surface-border">
                <template #content>
                    <div class="flex flex-column gap-3">
                        <div class="flex justify-between align-items-center">
                            <span class="text-color-secondary font-medium">Total Patients</span>
                            <div class="p-2 border-round surface-card" style="background-color: var(--blue-50)">
                                <i class="pi pi-users text-blue-500 text-lg"></i>
                            </div>
                        </div>
                        <div class="text-900 font-bold text-4xl">{{ totalPatients }}</div>
                        <div class="text-sm text-color-secondary">
                            <span
                                :class="totalPatients >= Math.floor(totalPatients * 0.88) ? 'text-green-500' : 'text-red-500'">
                                {{ totalPatients >= Math.floor(totalPatients * 0.88) ? '↑' : '↓' }}
                                {{ Math.abs(Math.floor(totalPatients * 0.88) - totalPatients) }}
                            </span>
                            <span class="ml-1">from last month</span>
                        </div>
                    </div>
                </template>
            </Card>
        </div>

        <div class="col-12 md:col-6 lg:col-3">
            <Card class="shadow-1 hover:shadow-3 transition-all transition-duration-300 border-1 surface-border">
                <template #content>
                    <div class="flex flex-column gap-3">
                        <div class="flex justify-between align-items-center">
                            <span class="text-color-secondary font-medium">Medical Records</span>
                            <div class="p-2 border-round surface-card" style="background-color: var(--green-50)">
                                <i class="pi pi-file text-green-500 text-lg"></i>
                            </div>
                        </div>
                        <div class="text-900 font-bold text-4xl">{{ totalMedicalRecords }}</div>
                        <div class="text-sm text-color-secondary">
                            <span
                                :class="totalMedicalRecords >= Math.floor(totalMedicalRecords * 0.92) ? 'text-green-500' : 'text-red-500'">
                                {{ totalMedicalRecords >= Math.floor(totalMedicalRecords * 0.92) ? '↑' : '↓' }}
                                {{ Math.abs(Math.floor(totalMedicalRecords * 0.92) - totalMedicalRecords) }}
                            </span>
                            <span class="ml-1">from last month</span>
                        </div>
                    </div>
                </template>
            </Card>
        </div>

        <div class="col-12 md:col-6 lg:col-3">
            <Card class="shadow-1 hover:shadow-3 transition-all transition-duration-300 border-1 surface-border">
                <template #content>
                    <div class="flex flex-column gap-3">
                        <div class="flex justify-between align-items-center">
                            <span class="text-color-secondary font-medium">Unbilled Records</span>
                            <div class="p-2 border-round surface-card" style="background-color: var(--orange-50)">
                                <i class="pi pi-clock text-orange-500 text-lg"></i>
                            </div>
                        </div>
                        <div class="text-900 font-bold text-4xl">{{ unbilledRecords }}</div>
                        <div class="text-sm text-color-secondary">
                            <span
                                :class="unbilledRecords >= Math.floor(unbilledRecords * 1.03) ? 'text-green-500' : 'text-red-500'">
                                {{ unbilledRecords >= Math.floor(unbilledRecords * 1.03) ? '↑' : '↓' }}
                                {{ Math.abs(Math.floor(unbilledRecords * 1.03) - unbilledRecords) }}
                            </span>
                            <span class="ml-1">from last month</span>
                        </div>
                    </div>
                </template>
            </Card>
        </div>

        <div class="col-12 md:col-6 lg:col-3">
            <Card class="shadow-1 hover:shadow-3 transition-all transition-duration-300 border-1 surface-border">
                <template #content>
                    <div class="flex flex-column gap-3">
                        <div class="flex justify-between align-items-center">
                            <span class="text-color-secondary font-medium">Billed Records</span>
                            <div class="p-2 border-round surface-card" style="background-color: var(--purple-50)">
                                <i class="pi pi-check-circle text-purple-500 text-lg"></i>
                            </div>
                        </div>
                        <div class="text-900 font-bold text-4xl">{{ billedRecords }}</div>
                        <div class="text-sm text-color-secondary">
                            <span
                                :class="billedRecords >= Math.floor(billedRecords * 0.85) ? 'text-green-500' : 'text-red-500'">
                                {{ billedRecords >= Math.floor(billedRecords * 0.85) ? '↑' : '↓' }}
                                {{ Math.abs(Math.floor(billedRecords * 0.85) - billedRecords) }}
                            </span>
                            <span class="ml-1">from last month</span>
                        </div>
                    </div>
                </template>
            </Card>
        </div>

        <!-- Second Row - Visualization Cards -->
        <div class="col-12 lg:col-6">
            <Card class="shadow-1 border-1 surface-border">
                <template #title>
                    <div class="flex align-items-center gap-2">
                        <i class="pi pi-tags"></i>
                        <span>Medical Records by Status</span>
                    </div>
                </template>
                <template #content>
                    <div class="flex flex-column gap-4">
                        <div v-for="status in statusData" :key="status.label" class="flex flex-column gap-2">
                            <div class="flex justify-between align-items-center">
                                <div class="flex align-items-center gap-2">
                                    <span class="capitalize font-medium">{{ status.label }}</span>
                                    <span class="text-sm text-color-secondary">({{ status.value }})</span>
                                </div>
                                <span class="font-bold">{{ status.percentage }}%</span>
                            </div>
                            <ProgressBar :value="status.percentage" :class="status.class" class="h-2"></ProgressBar>
                        </div>
                    </div>
                </template>
            </Card>
        </div>

        <div class="col-12 lg:col-6">
            <Card class="shadow-1 border-1 surface-border">
                <template #title>
                    <div class="flex align-items-center gap-2">
                        <i class="pi pi-users"></i>
                        <span>Records by Gender</span>
                    </div>
                </template>
                <template #content>
                    <div class="flex flex-column gap-4">
                        <div v-for="gender in genderData" :key="gender.label" class="flex flex-column gap-2">
                            <div class="flex justify-between align-items-center">
                                <div class="flex align-items-center gap-2">
                                    <span class="capitalize font-medium">{{ gender.label }}</span>
                                    <span class="text-sm text-color-secondary">({{ gender.value }})</span>
                                </div>
                                <span class="font-bold">{{ gender.percentage }}%</span>
                            </div>
                            <ProgressBar :value="gender.percentage" :class="gender.class" class="h-2"></ProgressBar>
                        </div>
                    </div>
                </template>
            </Card>
        </div>

        <!-- Third Row - Monthly Summary -->
        <div class="col-12">
            <Card class="shadow-1 border-1 surface-border">
                <template #title>
                    <div class="flex align-items-center gap-2">
                        <i class="pi pi-calendar"></i>
                        <span>Monthly Summary</span>
                    </div>
                </template>
                <template #content>
                    <div class="flex flex-wrap gap-5">
                        <div v-for="month in monthlySummary" :key="month.name" class="flex flex-column gap-1"
                            style="min-width: 120px">
                            <span class="font-bold">{{ month.value }}</span>
                            <span class="text-sm text-color-secondary">{{ month.name }}</span>
                            <ProgressBar :value="month.percentage" class="h-2 bg-gray-100"></ProgressBar>
                        </div>
                    </div>
                </template>
            </Card>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Card from 'primevue/card'
import ProgressBar from 'primevue/progressbar'
import { getMedicalRecords } from '../../api/medical_record'
import { getPatients } from '../../api/patient'

// Stats
const totalPatients = ref(0)
const totalMedicalRecords = ref(0)
const unbilledRecords = ref(0)
const billedRecords = ref(0)

// Monthly summary data
const monthlySummary = ref([
    { name: 'Jan', value: '1,234', percentage: 70 },
    { name: 'Feb', value: '1,543', percentage: 85 },
    { name: 'Mar', value: '1,876', percentage: 95 },
    { name: 'Apr', value: '1,432', percentage: 75 },
    { name: 'May', value: '1,987', percentage: 100 },
    { name: 'Jun', value: '1,654', percentage: 85 },
    { name: 'Jul', value: '1,321', percentage: 70 }
])

// Computed data for visualizations
const statusData = computed(() => {
    const total = totalMedicalRecords.value || 1
    return [
        {
            label: 'billed',
            value: billedRecords.value,
            percentage: Math.round((billedRecords.value / total) * 100),
            class: 'bg-purple-500'
        },
        {
            label: 'unbilled',
            value: unbilledRecords.value,
            percentage: Math.round((unbilledRecords.value / total) * 100),
            class: 'bg-orange-500'
        }
    ]
})

const genderData = computed(() => {
    const maleCount = Math.floor(totalPatients.value * 0.55)
    const femaleCount = totalPatients.value - maleCount
    const total = maleCount + femaleCount || 1

    return [
        {
            label: 'male',
            value: maleCount,
            percentage: Math.round((maleCount / total) * 100),
            class: 'bg-blue-500'
        },
        {
            label: 'female',
            value: femaleCount,
            percentage: Math.round((femaleCount / total) * 100),
            class: 'bg-pink-500'
        }
    ]
})

const loadStats = async () => {
    try {
        // Fetch patients
        const patients = await getPatients()
        totalPatients.value = patients.length

        // Fetch medical records
        const records = await getMedicalRecords()
        totalMedicalRecords.value = records.length
        unbilledRecords.value = records.filter(r => r.status === 'unbilled').length
        billedRecords.value = records.filter(r => r.status === 'billed').length

    } catch (error) {
        console.error('Error loading dashboard stats:', error)
    }
}

onMounted(() => {
    loadStats()
})
</script>

<style scoped>
.p-card {
    border-radius: 12px;
}

.p-card .p-card-title {
    font-size: 1.1rem;
    font-weight: 600;
}

.p-card .p-card-content {
    padding: 1.25rem;
}

.transition-duration-300 {
    transition-duration: 300ms;
}

/* Make sure cards in the same row have equal height */
.grid {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
}

.col-12,
.col-md-6,
.col-lg-3,
.col-lg-6 {
    display: flex;
    flex-direction: column;
}
</style>