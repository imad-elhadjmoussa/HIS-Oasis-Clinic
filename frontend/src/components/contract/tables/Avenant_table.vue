<template>
    <div class="w-full p-4">
        <!-- Search Bar & Filter Dropdown -->
        <div class="flex flex-col lg:flex-row justify-between items-center mb-4 gap-2">
            <div class="flex flex-grow gap-2">
                <Dropdown v-model="selectedFilter" :options="filterOptions" optionLabel="label" optionValue="value"
                    class="p-dropdown-sm" />
                <InputText v-if="selectedFilter !== 'created_at'" v-model="searchQuery" placeholder="Search..."
                    class="w-full p-2 border rounded-lg" />
                <Calendar v-if="selectedFilter === 'created_at'" v-model="searchQuery" dateFormat="yy-mm-dd"
                    placeholder="Select Date" class="w-full rounded-lg" showIcon />
            </div>
            <Button v-if="!hasPendingAvenant && (props.contractState ==='Pending'||props.contractState ==='Active')" label="Add Avenant" icon="pi pi-plus" @click="createAvenant" />
        </div>
        <!-- PrimeVue DataTable -->
        <DataTable :value="filteredItems" stripedRows paginator :rows="8" tableStyle="min-width: 50rem">
            <Column field="id" header="ID"></Column>
            <Column field="contract_id" header="Contract ID"></Column>
            <Column field="status" header="Status">
                <template #body="slotProps">
                    <Tag :value="slotProps.data.status" :severity="getTagSeverity(slotProps.data.status)" />
                </template>
            </Column>
            <Column field="created_at" header="Created At">
                <template #body="slotProps">
                    {{ slotProps.data.created_at || 'N/A' }}
                </template>
            </Column>
            <Column header="Details">
                <template #body="slotProps">
                    <Button icon="pi pi-eye" severity="info" label="Details" size="small" @click="moreInfo(slotProps.data)" />
                </template>
            </Column>
            <template #empty>
                <div class="text-center text-gray-500 py-6 flex flex-col items-center">
                    <i class="pi pi-file-excel text-3xl mb-2"></i>
                    <span>No avenants found.</span>
                </div>
            </template>
        </DataTable>
        <Toast />
    </div>
</template>
<script setup>
import { ref, computed, defineProps, onMounted } from "vue";
import { useRouter } from "vue-router";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import Dropdown from "primevue/dropdown";
import Calendar from "primevue/calendar";
import Tag from "primevue/tag";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import axios from "axios";
import { useUserStore } from './../../../stors/user';
const userStore = useUserStore();  // Pinia store for user
const API_BASE_URL = import.meta.env.VITE_SERVER_URL;

const props = defineProps({
    contractState: String,
    contractid: String
});

const router = useRouter();
const toast = useToast();
const searchQuery = ref("");
const selectedFilter = ref("id");
const hasPendingAvenant = ref(false);
const items = ref([]);

const filterOptions = [
    { label: "By ID", value: "id" },
    { label: "By Contract ID", value: "contract_id" },
    { label: "By Status", value: "status" },
    { label: "By Creation Date", value: "created_at" },
];

const fetchAvenants = async () => {
    try {
        if (props.contractid) {
            // Fetch avenants by contract ID
            const response = await axios.get(`${API_BASE_URL}/api/convention/avenants/contract/${props.contractid}`);
            items.value = response.data;

            // Check for pending avenants
            const pendingResponse = await axios.get(`${API_BASE_URL}/api/convention/avenants/pending/check/${props.contractid}`);
            hasPendingAvenant.value = pendingResponse.data.hasPending;
        }
    } catch (error) {
        console.error("Failed to fetch avenants data:", error);
    }
};

const createAvenant = async () => {
    try {
        if (props.contractid) {
            await axios.post(`${API_BASE_URL}/api/convention/avenants/avenant_creat/${props.contractid}`);
            toast.add({ severity: 'success', summary: 'Success', detail: 'New avenant created successfully', life: 3000 });
            // Refresh the data after creating new avenant
            fetchAvenants();
        }
    } catch (error) {
        console.error("Failed to create avenant:", error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to create avenant', life: 3000 });
    }
};

// Fetch avenants data when component is mounted
onMounted(() => {
    fetchAvenants();
});

const getTagSeverity = (status) => {
    switch (status) {
        case "Active":
            return "success";
        case "Pending":
            return "warning";
        case "Expired":
        case "Inactive":
            return "danger";
        default:
            return "info";
    }
};

const filteredItems = computed(() => {
    if (!searchQuery.value) return items.value;
    return items.value.filter(item => {
        const query = searchQuery.value.toString().toLowerCase();
        switch (selectedFilter.value) {
            case "id":
                return item.id.toString().includes(query);
            case "contract_id":
                return item.contract_id.toString().includes(query);
            case "status":
                return item.status.toLowerCase().includes(query);
            case "created_at":
                // Handle null created_at for filtering
                if (!item.created_at) {
                    // If searching for "n/a" or similar, match null values
                    return query === "n/a" || query === "na" || query === "null";
                }
                return item.created_at === query;
            default:
                return true;
        }
    });
});

const moreInfo = (item) => {
  const basePath = userStore.role === 'Admin' ? '/conventionoffice' : '';
  router.push({
    path: `${basePath}/Avenant/${item.id}`,
  });
};
</script>