<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Contract_card from '../cards/Contract_card.vue';
import Contract_content_tab from '../tabs/Contract_content_tab.vue';
import Button from "primevue/button";
import ConfirmDialog from 'primevue/confirmdialog';
import { useConfirm } from "primevue/useconfirm";
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_SERVER_URL;

// Get the route and router objects
const route = useRoute();
const router = useRouter();
const toast = useToast();
const confirm = useConfirm();

// Get contract ID from route params as string
const contractId = route.params.id.toString();

// Contract data with reactive reference
const contract = ref({
    id: contractId,
    contract_name: '',
    status: 'Pending',
    company_name: '',
    is_general: 'no'
});

// Date variables
const startDate = ref('');
const endDate = ref('');

// Loading state for buttons
const loading = ref({
    activate: false,
    terminate: false
});

// Function to fetch contract data
const fetchContractData = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/convention/contracts/${contractId}`);
        
        if (response.data) {
            contract.value = {
                ...response.data,
                id: contractId // Ensure ID is always a string
            };
            
            // Set the date variables
            startDate.value = response.data.start_date;
            endDate.value = response.data.end_date;
        }
    } catch (error) {
        console.error('Error fetching contract data:', error);
        toast.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'Failed to load contract data', 
            life: 3000 
        });
    }
};

// Fetch data when component is mounted
onMounted(() => {
    fetchContractData();
});

// Function to activate the contract
const activateContract = async () => {
    try {
        loading.value.activate = true;
        await axios.patch(`${API_BASE_URL}/api/convention/contracts/contract/${contractId}/activate`);
        
        // Update the contract status locally
        contract.value.status = 'Active';
        
        // Show success toast
        toast.add({ 
            severity: 'success', 
            summary: 'Contract Activated', 
            detail: 'The contract has been successfully activated.', 
            life: 6000 
        });
        
        // Refresh data
        fetchContractData();
    } catch (error) {
        toast.add({ 
            severity: 'error', 
            summary: 'Activation Failed', 
            detail: error.response?.data?.message || 'An error occurred during activation.', 
            life: 6000 
        });
    } finally {
        loading.value.activate = false;
    }
};

// Function to terminate the contract
const terminateContract = async () => {
    try {
        loading.value.terminate = true;
        await axios.patch(`${API_BASE_URL}/api/convention/contracts/contract/${contractId}/expire`);
        
        // Update the contract status locally
        contract.value.status = 'Terminated';
        
        // Show success toast
        toast.add({ 
            severity: 'success', 
            summary: 'Contract Terminated', 
            detail: 'The contract has been successfully terminated.', 
            life: 3000 
        });
        
        // Refresh data
        fetchContractData();
    } catch (error) {
        toast.add({ 
            severity: 'error', 
            summary: 'Termination Failed', 
            detail: error.response?.data?.message || 'An error occurred during termination.', 
            life: 3000 
        });
    } finally {
        loading.value.terminate = false;
    }
};

// Function to confirm activation
const confirmActivate = () => {
    confirm.require({
        message: 'Are you sure you want to activate this contract?',
        header: 'Confirm Activation',
        icon: 'pi pi-info-circle',
        acceptClass: 'p-button-success',
        accept: () => {
            activateContract();
        }
    });
};

// Function to confirm termination
const confirmTerminate = () => {
    confirm.require({
        message: 'Are you sure you want to terminate this contract? This action cannot be undone.',
        header: 'Confirm Termination',
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-danger',
        accept: () => {
            terminateContract();
        }
    });
};
</script>
<template>
    <div class="content">
        <!-- Toast and ConfirmDialog for notifications and confirmations -->
        <Toast position="top-right" />
        <ConfirmDialog />
        
        <div class="title">
            <h1 id="maintitle">Contract</h1>
        </div>
        <Contract_card 
            :id="contractId"
            :company="contract.company_name" 
            :status="contract.status"
            :name="contract.contract_name"
            :startDate="startDate"
            :endDate="endDate"
        />
        <div class="activeresilier">
            <Button v-if="contract.status === 'Pending'" 
                   icon="pi pi-file-check" 
                   severity="success" 
                   label="Activate" 
                   :loading="loading.activate"
                   @click="confirmActivate" />
            <Button v-if="contract.status === 'Active' && contract.is_general === 'no'" 
                   icon="pi pi-file-excel" 
                   severity="danger" 
                   label="Terminate" 
                   :loading="loading.terminate"
                   @click="confirmTerminate" />
        </div>
        <div class="title">
            <h1 id="contracts">Contract Content</h1>
        </div>
        <Contract_content_tab :contractState="contract.status" :contractid="contractId" />
    </div>
</template>
<style scoped>
.container {
    display: flex;
    flex-direction: row;
}
.content {
    display: flex;
    flex-direction: column;
    flex: 1;
    padding-top: 10px;
    padding-right: 20px;
    padding-bottom: 20px;
}
.title h1 {
    margin-top: 40px;
    margin-bottom: 30px;
    font-weight: bold;
    font-size: 2rem;
}
.title #maintitle {
    margin-top: 20px;
    margin-bottom: 10px;
    font-weight: bold;
    font-size: 2rem;
}
.activeresilier {
    margin-top: 1rem;
    margin-left: 1rem;
    margin-bottom: 0.5rem;
    display: flex;
    flex-direction: row;
}
#contracts {
    margin-top: 1rem;
}
</style>