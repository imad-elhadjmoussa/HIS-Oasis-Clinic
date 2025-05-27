<script setup>
import { ref, computed, onMounted } from 'vue'
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import { formatDate } from '../../pages/Reception'
import { getContractDetails } from '../../api/contract'
import ChangeAgreementDialog from './ChangeAgreementDialog.vue'

const props = defineProps({
    contractId: {
        type: Number,
        required: true
    },
    totalPrestations: {
        type: Number,
        required: true
    },
})
const emit = defineEmits(['refresh'])

const contractDetails = ref(null)
const loading = ref(true)
const error = ref(null)
const showChangeAgreementDialog = ref(false)

const fetchContractDetails = async (id) => {
    try {
        error.value = null
        loading.value = true
        const data = await getContractDetails(id)
        contractDetails.value = data
    } catch (err) {
        error.value = err
        console.error('Error fetching contract details:', err)
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchContractDetails(props.contractId)
})

const statusSeverity = computed(() => {
    if (!contractDetails.value?.status) return 'info'
    return contractDetails.value.status === 'Active' ? 'success' : 'danger'
})

const formatPrice = (price) => {
    if (price === null || price === undefined) return 'N/A'
    return new Intl.NumberFormat('ar-DZ', {
        style: 'currency',
        currency: 'DZD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(price)
}

const getAgreementDescription = () => {
    return contractDetails.value?.agreement?.description || 'No description available'
}

const getAgreementDetails = (field) => {
    return contractDetails.value?.agreement_details?.[field] ?? 'N/A'
}

const getAnnexes = () => {
    return contractDetails.value?.annexes || []
}

const handleContractChange = (id) => {
    fetchContractDetails(id)
    emit('refresh')
}
</script>

<template>
    <div v-if="loading" class="flex justify-center p-4">
        <i class="pi pi-spinner pi-spin text-2xl"></i>
    </div>

    <div v-else-if="error" class="p-4 text-center text-red-500">
        <i class="pi pi-exclamation-triangle mr-2"></i>
        Failed to load contract details
    </div>

    <div v-else-if="!contractDetails" class="p-4 text-center text-gray-500">
        <i class="pi pi-info-circle mr-2"></i>
        No contract details available
    </div>

    <div v-else class="grid gap-4">
        <Card class="flex flex-col h-full">
            <template #title>
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="pi pi-file text-primary"></i>
                        <span class="text-xl font-bold">
                            {{ contractDetails.contract_name || 'Unnamed Contract' }}
                        </span>
                    </div>
                    <Tag :value="contractDetails.status || 'Unknown'" :severity="statusSeverity"
                        :icon="contractDetails.status === 'Active' ? 'pi pi-check' : 'pi pi-times'" rounded />
                </div>
            </template>

            <template #subtitle>
                <div class="flex items-center gap-2 text-sm text-gray-600">
                    <i class="pi pi-building"></i>
                    <span v-if="contractDetails.company_id">
                        {{ contractDetails.company.name }}
                    </span>
                    <span v-else class="text-gray-400">
                        No company specified
                    </span>
                </div>
            </template>

            <template #content>
                <div class="grid gap-3 flex-grow">
                    <div class="flex flex-col gap-1">
                        <div class="flex items-center gap-2 text-sm text-gray-500">
                            <i class="pi pi-align-left"></i>
                            <span>Description</span>
                        </div>
                        <p class="line-clamp-2 m-0">
                            {{ getAgreementDescription() }}
                        </p>
                    </div>
                </div>
            </template>

            <template #footer>
                <div class="mt-auto">
                    <div class="flex flex-col gap-1">
                        <Button label="Change Agreement" icon="pi pi-pencil" @click="showChangeAgreementDialog = true"
                            class="p-button-sm w-full" :disabled="totalPrestations > 0" :pt="{
                                root: {
                                    class: totalPrestations > 0 ? 'opacity-60 cursor-not-allowed' : ''
                                }
                            }" />
                        <Tag v-if="totalPrestations > 0" severity="danger" icon="pi pi-info-circle"
                            value="Cannot change agreement when prestations exist" class="text-sm mt-1 w-full" />
                    </div>
                </div>
            </template>
        </Card>
    </div>

    <ChangeAgreementDialog :visible="showChangeAgreementDialog" :current-agreement="contractDetails?.agreement || {}"
        @update:visible="showChangeAgreementDialog = $event" @contract-changed="handleContractChange" />
</template>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>