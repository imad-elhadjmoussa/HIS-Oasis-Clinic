<template>
    <div class="min-h-screen bg-slate-50 p-6">
        <div class="mx-auto max-w-7xl space-y-8">
            <!-- Header -->
            <div class="space-y-2">
                <h1 class="text-3xl font-bold tracking-tight text-slate-900">Medical Dashboard</h1>
                <p class="text-slate-600">Overview of patients and medical records</p>
            </div>

            <!-- Statistics Cards -->
            <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Patients" :value="stats.totalPatients" icon="pi-users" trend="up"
                    trend-value="+12%" color="bg-gradient-to-r from-blue-500 to-blue-600" :is-loading="isLoading" />
                <StatCard title="Medical Records" :value="stats.totalMedicalRecords" icon="pi-file" trend="up"
                    trend-value="+8%" color="bg-gradient-to-r from-emerald-500 to-emerald-600"
                    :is-loading="isLoading" />
                <StatCard title="Unbilled Records" :value="stats.unbilledRecords" icon="pi-clock" trend="down"
                    trend-value="-3%" color="bg-gradient-to-r from-orange-500 to-orange-600" :is-loading="isLoading" />
                <StatCard title="Billed Records" :value="stats.billedRecords" icon="pi-check-circle" trend="up"
                    trend-value="+15%" color="bg-gradient-to-r from-purple-500 to-purple-600" :is-loading="isLoading" />
            </div>

            <!-- Charts Row -->
            <div class="grid gap-6 lg:grid-cols-2">
                <Card
                    class="rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50">
                    <template #header>
                        <div class="border-b border-slate-100 p-6 pb-4">
                            <div class="flex items-center space-x-2">
                                <div class="rounded-lg bg-slate-100 p-2">
                                    <i class="pi pi-chart-bar text-slate-600"></i>
                                </div>
                                <h3 class="text-lg font-semibold text-slate-900">Medical Records by Status</h3>
                            </div>
                        </div>
                    </template>
                    <template #content>
                        <div class="p-6 pt-0">
                            <div v-if="isLoading" class="space-y-4">
                                <div v-for="i in 2" :key="i" class="space-y-2">
                                    <div class="flex justify-between">
                                        <Skeleton height="1rem" width="5rem"></Skeleton>
                                        <Skeleton height="1rem" width="3rem"></Skeleton>
                                    </div>
                                    <Skeleton height="0.5rem" width="100%"></Skeleton>
                                </div>
                            </div>
                            <div v-else class="space-y-6">
                                <div v-for="status in statusData" :key="status.label" class="space-y-2">
                                    <div class="flex items-center justify-between text-sm">
                                        <div class="flex items-center space-x-2">
                                            <span class="font-medium text-slate-700 capitalize">{{ status.label
                                                }}</span>
                                            <span class="text-slate-500">({{ status.count.toLocaleString() }})</span>
                                        </div>
                                        <span class="font-semibold text-slate-900">{{ status.percentage }}%</span>
                                    </div>
                                    <ProgressBar :value="status.percentage" :class="status.colorClass" class="h-2"
                                        :show-value="false"></ProgressBar>
                                </div>
                            </div>
                        </div>
                    </template>
                </Card>

                <Card
                    class="rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50">
                    <template #header>
                        <div class="border-b border-slate-100 p-6 pb-4">
                            <div class="flex items-center space-x-2">
                                <div class="rounded-lg bg-slate-100 p-2">
                                    <i class="pi pi-users text-slate-600"></i>
                                </div>
                                <h3 class="text-lg font-semibold text-slate-900">Records by Gender</h3>
                            </div>
                        </div>
                    </template>
                    <template #content>
                        <div class="p-6 pt-0">
                            <div v-if="isLoading" class="space-y-4">
                                <div v-for="i in 2" :key="i" class="space-y-2">
                                    <div class="flex justify-between">
                                        <Skeleton height="1rem" width="5rem"></Skeleton>
                                        <Skeleton height="1rem" width="3rem"></Skeleton>
                                    </div>
                                    <Skeleton height="0.5rem" width="100%"></Skeleton>
                                </div>
                            </div>
                            <div v-else class="space-y-6">
                                <div v-for="gender in genderData" :key="gender.label" class="space-y-2">
                                    <div class="flex items-center justify-between text-sm">
                                        <div class="flex items-center space-x-2">
                                            <span class="font-medium text-slate-700 capitalize">{{ gender.label
                                                }}</span>
                                            <span class="text-slate-500">({{ gender.count.toLocaleString() }})</span>
                                        </div>
                                        <span class="font-semibold text-slate-900">{{ gender.percentage }}%</span>
                                    </div>
                                    <ProgressBar :value="gender.percentage" :class="gender.colorClass" class="h-2"
                                        :show-value="false"></ProgressBar>
                                </div>
                            </div>
                        </div>
                    </template>
                </Card>
            </div>

            <!-- Monthly Summary -->
            <Card
                class="rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50">
                <template #header>
                    <div class="border-b border-slate-100 p-6 pb-4">
                        <div class="flex items-center space-x-2">
                            <div class="rounded-lg bg-slate-100 p-2">
                                <i class="pi pi-calendar text-slate-600"></i>
                            </div>
                            <h3 class="text-lg font-semibold text-slate-900">Monthly Summary</h3>
                        </div>
                    </div>
                </template>
                <template #content>
                    <div class="p-6 pt-0">
                        <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7">
                            <div v-for="month in monthlySummary" :key="month.name"
                                class="group cursor-pointer space-y-3 rounded-lg border border-slate-200 bg-white p-4 transition-all duration-300 hover:border-slate-300 hover:shadow-md">
                                <div class="space-y-1">
                                    <p class="text-2xl font-bold text-slate-900">{{ month.value }}</p>
                                    <p class="text-sm font-medium text-slate-600">{{ month.name }}</p>
                                </div>
                                <div class="h-1.5 overflow-hidden rounded-full bg-slate-100">
                                    <div class="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-700 ease-out"
                                        :style="{ width: `${month.percentage}%` }"></div>
                                </div>
                            </div>
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
import Skeleton from 'primevue/skeleton'

// Mock API functions (replace with your actual API calls)
const getMedicalRecords = async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    return Array.from({ length: 1847 }, (_, i) => ({
        id: i + 1,
        status: Math.random() > 0.6 ? 'billed' : 'unbilled',
        date: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
    }))
}

const getPatients = async () => {
    await new Promise(resolve => setTimeout(resolve, 800))
    return Array.from({ length: 2156 }, (_, i) => ({
        id: i + 1,
        gender: Math.random() > 0.45 ? 'male' : 'female'
    }))
}

// Stats data
const stats = ref({
    totalPatients: 0,
    totalMedicalRecords: 0,
    unbilledRecords: 0,
    billedRecords: 0,
    malePatients: 0,
    femalePatients: 0
})

const isLoading = ref(true)

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
const statusData = computed(() => [
    {
        label: 'billed',
        count: stats.value.billedRecords,
        percentage: stats.value.totalMedicalRecords > 0
            ? Math.round((stats.value.billedRecords / stats.value.totalMedicalRecords) * 100)
            : 0,
        colorClass: 'p-progressbar-purple'
    },
    {
        label: 'unbilled',
        count: stats.value.unbilledRecords,
        percentage: stats.value.totalMedicalRecords > 0
            ? Math.round((stats.value.unbilledRecords / stats.value.totalMedicalRecords) * 100)
            : 0,
        colorClass: 'p-progressbar-orange'
    }
])

const genderData = computed(() => [
    {
        label: 'male',
        count: stats.value.malePatients,
        percentage: stats.value.totalPatients > 0
            ? Math.round((stats.value.malePatients / stats.value.totalPatients) * 100)
            : 0,
        colorClass: 'p-progressbar-blue'
    },
    {
        label: 'female',
        count: stats.value.femalePatients,
        percentage: stats.value.totalPatients > 0
            ? Math.round((stats.value.femalePatients / stats.value.totalPatients) * 100)
            : 0,
        colorClass: 'p-progressbar-pink'
    }
])

// Load statistics
const loadStats = async () => {
    try {
        isLoading.value = true

        const [patients, records] = await Promise.all([
            getPatients(),
            getMedicalRecords()
        ])

        const maleCount = patients.filter(p => p.gender === 'male').length
        const femaleCount = patients.filter(p => p.gender === 'female').length
        const unbilledCount = records.filter(r => r.status === 'unbilled').length
        const billedCount = records.filter(r => r.status === 'billed').length

        stats.value = {
            totalPatients: patients.length,
            totalMedicalRecords: records.length,
            unbilledRecords: unbilledCount,
            billedRecords: billedCount,
            malePatients: maleCount,
            femalePatients: femaleCount
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error)
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    loadStats()
})
</script>

<!-- StatCard Component -->
<script>
import { defineComponent } from 'vue'

export const StatCard = defineComponent({
    name: 'StatCard',
    props: {
        title: String,
        value: Number,
        icon: String,
        trend: String,
        trendValue: String,
        color: String,
        isLoading: Boolean
    },
    template: `
    <div class="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50">
      <div class="flex items-center justify-between">
        <div class="space-y-2">
          <p class="text-sm font-medium text-slate-600">{{ title }}</p>
          <div class="space-y-1">
            <div v-if="isLoading" class="h-8 w-24 animate-pulse rounded bg-slate-200"></div>
            <p v-else class="text-3xl font-bold tracking-tight text-slate-900">
              {{ value.toLocaleString() }}
            </p>
            <div v-if="!isLoading" class="flex items-center space-x-1 text-xs">
              <i :class="trend === 'up' ? 'pi pi-arrow-up text-emerald-500' : 'pi pi-arrow-down text-red-500'"></i>
              <span :class="trend === 'up' ? 'text-emerald-600 font-medium' : 'text-red-600 font-medium'">
                {{ trendValue }}
              </span>
              <span class="text-slate-500">from last month</span>
            </div>
          </div>
        </div>
        <div :class="'rounded-full p-3 transition-transform duration-300 group-hover:scale-110 ' + color">
          <i :class="'text-white text-xl ' + icon"></i>
        </div>
      </div>
      <div class="absolute inset-0 bg-gradient-to-r from-transparent to-slate-50/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
    </div>
  `
})
</script>

<style scoped>
/* Custom ProgressBar colors */
:deep(.p-progressbar-purple .p-progressbar-value) {
    background: linear-gradient(to right, #8b5cf6, #7c3aed);
}

:deep(.p-progressbar-orange .p-progressbar-value) {
    background: linear-gradient(to right, #f97316, #ea580c);
}

:deep(.p-progressbar-blue .p-progressbar-value) {
    background: linear-gradient(to right, #3b82f6, #2563eb);
}

:deep(.p-progressbar-pink .p-progressbar-value) {
    background: linear-gradient(to right, #ec4899, #db2777);
}

/* Custom Card styling */
:deep(.p-card) {
    border: none;
    box-shadow: none;
}

:deep(.p-card .p-card-header) {
    padding: 0;
    border: none;
}

:deep(.p-card .p-card-content) {
    padding: 0;
}

/* Loading skeleton animations */
.animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }
}

/* Responsive grid */
.grid {
    display: grid;
}

@media (min-width: 640px) {
    .sm\:grid-cols-2 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (min-width: 768px) {
    .md\:grid-cols-3 {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
}

@media (min-width: 1024px) {
    .lg\:grid-cols-4 {
        grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    .lg\:grid-cols-7 {
        grid-template-columns: repeat(7, minmax(0, 1fr));
    }

    .lg\:grid-cols-2 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}
</style>