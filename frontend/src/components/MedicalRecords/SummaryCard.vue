<script setup>
import Card from 'primevue/card'

const props = defineProps({
    totalPrestations: {
        type: Number,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    totalEffected: {
        type: Number,
        default: 0
    },
    totalUneffected: {
        type: Number,
        default: 0
    }
})
</script>

<template>
    <Card>
        <template #title>
            <div class="flex items-center gap-2">
                <i class="pi pi-chart-bar"></i>
                <span>Medical Record Summary</span>
            </div>
        </template> 
        <template #content>
            <div class="flex flex-wrap gap-2 md:gap-4">
                <!-- Total Acts -->
                <div class="flex-1 min-w-[120px] bg-blue-50 p-3 rounded-lg">
                    <p class="text-sm font-medium text-gray-500">Total Acts</p>
                    <p class="text-xl font-medium">{{ props.totalPrestations }}</p>
                </div>

                <!-- Effected -->
                <div class="flex-1 min-w-[120px] bg-green-50 p-3 rounded-lg">
                    <p class="text-sm font-medium text-gray-500">Effected</p>
                    <p class="text-xl font-medium text-green-600">
                        {{ props.totalEffected }}
                    </p>
                </div>

                <!-- Not Effected -->
                <div class="flex-1 min-w-[120px] bg-yellow-50 p-3 rounded-lg">
                    <p class="text-sm font-medium text-gray-500">Not Effected</p>
                    <p class="text-xl font-medium text-yellow-600">
                        {{ props.totalUneffected }}
                    </p>
                </div>

                <!-- Total Amount -->
                <div class="flex-1 min-w-[120px] bg-purple-50 p-3 rounded-lg">
                    <p class="text-sm font-medium text-gray-500">Total Amount</p>
                    <p class="text-xl font-bold">
                        {{ totalAmount }} DA
                    </p>
                </div>
            </div>
        </template>
    </Card>
</template>

<style scoped>

</style>