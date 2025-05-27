<script setup>
import { ref, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Badge from 'primevue/badge'
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import { useRoute } from 'vue-router'
import { deletePrestationMedicalRecord, getPrestationsMedicalRecord } from '../../api/medical-record-prestation'
import { useToast } from 'primevue/usetoast'
import AddPrestationDialog from './AddPrestationDialog.vue'

const toast = useToast()
const prestationsMedicalRecord = ref([])
const route = useRoute()
const id = route.params.id
const showAddDialog = ref(false)
const showDeleteDialog = ref(false)
const loading = ref(false)
const deletingId = ref(null)
const prestationToDelete = ref(null)

defineProps({
    medicalRecordStatus: {
        type: String,
        required: true
    }
})

const emit = defineEmits(["refresh"])

const fetchPrestationMedicalRecord = async () => {
    try {
        loading.value = true
        const data = await getPrestationsMedicalRecord(id)
        prestationsMedicalRecord.value = data
    } catch (error) {
        console.error("Error fetching medical record:", error)
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

const handleAddPrestation = async () => {
    await fetchPrestationMedicalRecord()
    showAddDialog.value = false
    emit("refresh")
}

const handleDeletePrestation = (prestation) => {
    prestationToDelete.value = prestation
    showDeleteDialog.value = true
}

const confirmDelete = async () => {
    if (!prestationToDelete.value) return

    try {
        deletingId.value = prestationToDelete.value.id
        const data = await deletePrestationMedicalRecord(prestationToDelete.value.id)
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Medical act deleted successfully',
            life: 3000
        })
        await fetchPrestationMedicalRecord()
        emit("refresh")
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to delete medical act',
            life: 3000
        })
    } finally {
        deletingId.value = null
        prestationToDelete.value = null
        showDeleteDialog.value = false
    }
}

const getStatusSeverity = (isPaid) => {
    return isPaid ? 'success' : 'warning'
}

onMounted(() => {
    fetchPrestationMedicalRecord()
})
</script>

<template>
    <div class="grid gap-4">
        <Card>
            <template #title>
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="pi pi-list"></i>
                        <span>Medical Record Acts</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <Badge :value="prestationsMedicalRecord.length" severity="info" />
                        <Button v-if="medicalRecordStatus !== 'billed'" label="Add Medical Act" icon="pi pi-plus"
                            @click="showAddDialog = true" class="p-button-primary p-button-sm" />
                    </div>
                </div>
            </template>
            <template #content>
                <div v-if="loading" class="flex justify-center p-4">
                    <i class="pi pi-spinner pi-spin text-2xl"></i>
                </div>

                <div v-else-if="prestationsMedicalRecord.length === 0"
                    class="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
                    <i class="pi pi-inbox text-4xl text-gray-400 mb-4"></i>
                    <h3 class="text-lg font-medium text-gray-600 mb-2">No Medical Acts Found</h3>
                    <p class="text-gray-500 text-center mb-4">This medical record doesn't have any acts yet.</p>
                    <Button label="Add First Act" icon="pi pi-plus" @click="showAddDialog = true"
                        class="p-button-sm p-button-primary" />
                </div>

                <DataTable v-else :value="prestationsMedicalRecord" class="p-datatable-sm" :paginator="true" :rows="5">
                    <Column field="prestation_name" header="Act Name"></Column>
                    <Column field="specialty_name" header="Specialty"></Column>
                    
                    <Column header="Price" style="width: 100px">
                        <template #body="{ data }">
                            <Tag :value="data.patient_part"
                                :severity="data.patient_part === data.price ? '' : 'success'" class="capitalize" />
                        </template>
                    </Column>
                    <Column header="Payment Status" headerStyle="white-space: nowrap;" style="width: 120px">
                        <template #body="{ data }">
                            <Tag :value="data.payment_status"
                                :severity="data.payment_status === 'paid' ? 'success' : 'danger'" class="capitalize" />
                        </template>
                    </Column>
                    <Column header="Actions" style="width: 100px">
                        <template #body="{ data }">
                            <Button v-if="data.payment_status !== 'paid'" icon="pi pi-trash"
                                class="p-button-rounded p-button-text p-button-danger p-button-sm"
                                @click="handleDeletePrestation(data)" />
                            <Button v-else icon="pi pi-lock"
                                class="p-button-rounded p-button-text p-button-secondary p-button-sm"
                                v-tooltip="'Paid prestations cannot be deleted'" disabled />
                        </template>
                    </Column>
                </DataTable>
            </template>
        </Card>
    </div>

    <AddPrestationDialog :prestations="prestationsMedicalRecord" v-model:modelValue="showAddDialog"
        @add-prestation="handleAddPrestation" />

    <Dialog v-model:visible="showDeleteDialog" header="Confirm Deletion" :style="{ width: '450px' }" :modal="true">
        <div class="flex align-items-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span>Are you sure you want to delete this medical act?</span>
        </div>
        <template #footer>
            <Button label="No" icon="pi pi-times" class="p-button-text" @click="showDeleteDialog = false" />
            <Button label="Yes" icon="pi pi-check" class="p-button-danger" @click="confirmDelete"
                :loading="deletingId === prestationToDelete?.id" />
        </template>
    </Dialog>
</template>

<style scoped>
.capitalize {
    text-transform: capitalize;
}
</style>