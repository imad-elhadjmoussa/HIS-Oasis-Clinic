<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Dropdown from 'primevue/dropdown'
import { getAllContracts, getCompanyContracts } from '../../api/contract'
import { getCompanies } from '../../api/companies'
import { updateMedicalRecord } from '../../api/medical_record'
import { useRoute } from 'vue-router'

const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    }
})

const router = useRoute()
const emit = defineEmits(['update:visible', 'contract-changed'])

// Search and loading states
const contractSearch = ref('')
const loadingContracts = ref(false)
const loadingCompanies = ref(false)

// Data stores
const companies = ref([])
const contracts = ref([])
const selectedCompany = ref(null)

// Fetch all companies when component mounts
onMounted(async () => {
    try {
        loadingCompanies.value = true
        companies.value = await getCompanies()
    } catch (error) {
        console.error('Error fetching companies:', error)
    } finally {
        loadingCompanies.value = false
    }
})

// Fetch contracts when company is selected
const fetchCompanyContracts = async (companyId) => {
    try {
        loadingContracts.value = true
        contracts.value = await getCompanyContracts(companyId, { status: 'Active' })
        console.log(contracts.value);
    } catch (error) {
        console.error('Error fetching contracts:', error)
        contracts.value = []
    } finally {
        loadingContracts.value = false
    }
}

// Watch for company selection changes
watch(selectedCompany, (newVal) => {
    if (newVal) {
        fetchCompanyContracts(newVal.id)
    } else {
        contracts.value = []
    }
})

const changeContractMedical = async (id, data) => {
    try {
        await updateMedicalRecord(id, data)
    } catch (error) {
        console.error('Error updating medical record:', error)
    }
}

const filteredContracts = computed(() => {
    if (!contractSearch.value) return contracts.value

    const searchTerm = contractSearch.value.toLowerCase()
    return contracts.value.filter(contract =>
        contract.contract_name.toLowerCase().includes(searchTerm)
    )
})

const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
}

const statusSeverity = (status) => {
    switch (status) {
        case 'Active': return 'success'
        case 'Pending': return 'warning'
        case 'Expired': return 'danger'
        default: return 'info'
    }
}

const selectContract = (contract) => {
    const data = {
        contract_id: contract.id,
        company_id: selectedCompany.value.id,
    }
    const MedicalId = router.params.id
    changeContractMedical(MedicalId, data)
    emit('contract-changed',contract.id);
    emit('update:visible', false)
}
</script>

<template>
    <Dialog :visible="visible" @update:visible="$emit('update:visible', $event)" header="Select Contract"
        :style="{ width: '700px' }" :modal="true">
        <div class="flex flex-col gap-4">
            <!-- Company Selection Dropdown -->
            <div class="field">
                <label class="block text-sm font-medium mb-1">Company</label>
                <Dropdown v-model="selectedCompany" :options="companies" optionLabel="company_name"
                    placeholder="Select a company" class="w-full" :loading="loadingCompanies" :filter="true"
                    filterPlaceholder="Search companies">
                </Dropdown>
            </div>

            <!-- Contract Search and Table -->
            <div v-if="selectedCompany">
                <InputText v-model="contractSearch" placeholder="Search by contract name..." class="w-full" />

                <DataTable :value="filteredContracts" :loading="loadingContracts" class="p-datatable-sm mt-2">
                    <Column field="contract_name" header="Contract Name">
                        <template #body="{ data }">
                            <div class="font-medium">{{ data.contract_name }}</div>
                            <div class="text-xs text-gray-500">ID: {{ data.id }}</div>
                        </template>
                    </Column>

                    <Column header="Status" style="width: 120px">
                        <template #body="{ data }">
                            <Tag :value="data.status" :severity="statusSeverity(data.status)" />
                        </template>
                    </Column>

                    <Column header="Start Date" style="width: 120px">
                        <template #body="{ data }">
                            {{ formatDate(data.start_date) }}
                        </template>
                    </Column>

                    <Column header="End Date" style="width: 120px">
                        <template #body="{ data }">
                            {{ formatDate(data.end_date) }}
                        </template>
                    </Column>

                    <Column header="Select" style="width: 80px">
                        <template #body="{ data }">
                            <Button icon="pi pi-check" class="p-button-sm p-button-rounded p-button-success"
                                @click="selectContract(data)" />
                        </template>
                    </Column>

                    <template #empty>
                        <div class="text-center py-4 text-gray-500">
                            No contracts found for selected company
                        </div>
                    </template>
                </DataTable>
            </div>

            <div v-else class="text-center py-4 text-gray-500">
                Please select a company to view contracts
            </div>
        </div>

        <template #footer>
            <Button label="Close" @click="$emit('update:visible', false)" class="p-button-text" />
        </template>
    </Dialog>
</template>

<style scoped>
.field {
    margin-bottom: 1rem;
}
</style>