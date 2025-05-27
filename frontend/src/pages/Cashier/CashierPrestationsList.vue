<template>
    <div class="parent">
        <!-- Three cards at the top of the page -->
        <div class="cards-container mb-6 w-full">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Card 1: Number of services -->
                <Card class="shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-blue-500">
                    <template #title>
                        <div class="flex justify-between items-center">
                            <span class="text-lg font-semibold text-gray-700">Prestations</span>
                            <span class="text-2xl font-bold text-blue-600">{{ services.length }}</span>
                        </div>
                    </template>
                    <template #content>
                        <div class="flex flex-col items-center py-2">
                            <i class="pi pi-list text-5xl mb-3 text-blue-500"></i>
                            <div class="text-sm text-gray-500 text-center">
                                Total number of Prestations
                            </div>
                        </div>
                    </template>
                </Card>

                <!-- Card 2: Total invoice -->
                <Card class="shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-indigo-500">
                    <template #title>
                        <div class="text-lg font-semibold text-gray-700">Total Invoice</div>
                    </template>
                    <template #content>
                        <div class="flex flex-col items-center py-2">
                            <i class="pi pi-calculator text-5xl mb-3 text-indigo-500"></i>
                            <div class="text-2xl font-bold text-indigo-600 mb-2">
                                {{ formatCurrency(totalFacture) }}
                            </div>
                            <div class="text-sm text-gray-500 text-center">
                                Total amount to invoice
                            </div>
                        </div>
                    </template>
                </Card>

                <!-- Card 3: Already paid -->
                <Card class="shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-green-500">
                    <template #title>
                        <div class="text-lg font-semibold text-gray-700">Already Paid</div>
                    </template>
                    <template #content>
                        <div class="flex flex-col items-center py-2">
                            <i class="pi pi-check-circle text-5xl mb-3 text-green-500"></i>
                            <div class="text-2xl font-bold text-green-600 mb-2">
                                {{ formatCurrency(totalFacture - partRestante) }}
                            </div>
                            <div class="text-sm text-gray-500 text-center">
                                {{ calculatePaymentPercentage() }}% of total amount
                            </div>
                        </div>
                    </template>
                </Card>
            </div>
        </div>

        <!-- Container for the two parallel tables -->
        <div class="tables-container">
            <!-- Prestation List Section -->
            <div class="div1">
                <h3 class="text-xl font-bold mb-4">Prestation List</h3>
                <div class="table-wrapper">
                    <DataTable :value="filteredServices" stripedRows paginator :rows="4"
                        class="p-datatable-sm prestation-table">
                        <Column field="prestation_name" class="min-w-48">
                            <template #header>
                                <div class="flex flex-col w-full">
                                    <span>Prestation</span>
                                    <InputText v-model="nameFilter" placeholder="Filter by Name"
                                        class="w-full p-inputtext-sm mt-1" />
                                </div>
                            </template>
                            <template #body="{ data }">
                                <div class="prestation-row" :class="{
                                    'prestation-paid': isPrestaionFullyPaid(data.id),
                                    'prestation-not-paid': !isPrestaionFullyPaid(data.id)
                                }">
                                    <span class="truncate">{{ data.prestation_name }}</span>
                                </div>
                            </template>
                        </Column>

                        <Column field="price" header="Price (DZD)" class="min-w-32">
                            <template #body="{ data }">
                                <div class="flex items-center justify-between w-full gap-2">
                                    <span class="flex-1 text-right">{{ formatCurrency(data.price) }}</span>
                                </div>
                            </template>
                        </Column>

                        <Column header="Amount to Pay (DZD)" class="min-w-40">
                            <template #body="{ data }">
                                <div class="flex flex-col">
                                    <InputNumber v-model="data.amountToPay" mode="currency" currency="DZD"
                                        :max="getRemainingAmount(data.id)" class="w-full"
                                        :disabled="isPrestaionFullyPaid(data.id)"
                                        :placeholder="formatCurrency(getRemainingAmount(data.id))" />

                                </div>
                            </template>
                        </Column>
                    </DataTable>
                </div>

                <div class="flex justify-end gap-5 items-center mt-4">
                    <div class="flex items-center gap-2">
                        <label class="font-bold">Remaining Invoice:</label>
                        <p class="px-4 py-1 rounded-lg bg-gray-200 text-gray-900">
                            {{ formatCurrency(partRestante) }}
                        </p>
                    </div>
                    <Button label="Pay" icon="pi pi-check-circle" severity="success" class="p-button-sm"
                        @click="validatePayment" :disabled="!hasPendingPayments" />
                </div>

                <!-- Edit Modal -->
                <Dialog v-model:visible="isEditModalVisible" modal header="Edit Service Price" class="w-full max-w-sm">
                    <div class="p-fluid space-y-4">
                        <div class="mb-4">
                            <label class="font-bold mb-2">Prestation:</label>
                            <p>{{ selectedService?.prestation_name }}</p>
                        </div>
                        <div class="mb-4">
                            <label class="font-bold mb-2">Current Price:</label>
                            <p>{{ selectedService ? formatCurrency(selectedService.price) : '' }}</p>
                        </div>
                        <label class="font-bold mb-2">New Price:</label>
                        <InputNumber ref="priceInput" v-model="editedPrice" mode="currency" currency="DZD"
                            class="w-full" />
                    </div>
                    <template #footer>
                        <Button label="Cancel" icon="pi pi-times" severity="secondary" text
                            @click="isEditModalVisible = false" />
                        <Button label="Save" icon="pi pi-save" severity="success" @click="saveEdit" />
                    </template>
                </Dialog>
            </div>

            <!-- History Section -->
            <div class="div2">
                <h4 class="text-xl font-bold mb-4">Transactions</h4>
                <div class="transactions-wrapper">
                    <DataTable :value="historiquePaiements" stripedRows class="transactions-table" scrollable
                        scrollHeight="400px">
                        <Column field="prestation" header="Prestation" class="min-w-32" />
                        <Column field="date" header="Payment Date" class="min-w-28" />
                        <Column field="montant" header="Amount Paid (DZD)" class="min-w-32">
                            <template #body="{ data }">
                                <span class="text-right block">{{ formatCurrency(data.montant) }}</span>
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </div>

            <Toast />
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import InputNumber from 'primevue/inputnumber';
import Dialog from 'primevue/dialog';
import Toast from 'primevue/toast';
import Card from 'primevue/card';
import { useToast } from 'primevue/usetoast';

const route = useRoute();
const toast = useToast();
const ficheId = parseInt(route.params.ficheId);

// States
const nameFilter = ref('');
const isEditModalVisible = ref(false);
const selectedService = ref(null);
const editedPrice = ref(0);
const priceInput = ref(null);
const services = ref([]);
const historiquePaiements = ref([]);
const remainingAmounts = ref({});

// Fetch prestations
onMounted(async () => {
    await reloadServices();
    await loadHistoriquePaiements();
});

// Computed
const totalFacture = computed(() => services.value.reduce((sum, s) => sum + Number(s.price), 0));
const partRestante = computed(() => {
    const totalPaid = historiquePaiements.value.reduce((sum, p) => sum + Number(p.montant), 0);
    return Math.max(0, totalFacture.value - totalPaid);
});

const isFullyPaid = computed(() => {
    // Explicitly convert to numbers before adding
    const totalPaid = historiquePaiements.value.reduce((sum, p) => sum + Number(p.montant), 0);
    return Math.round(totalPaid * 100) >= Math.round(totalFacture.value * 100);
});

const isPrestaionFullyPaid = (prestationId) => {
    const prestationPayments = historiquePaiements.value.filter(p => p.prestation_id === prestationId);

    // Make sure to explicitly convert to numbers before adding
    const totalPaid = prestationPayments.reduce((sum, p) => sum + Number(p.montant), 0);

    const service = services.value.find(s => s.id === prestationId);
    if (!service) return false;

    return Math.round(totalPaid * 100) >= Math.round(service.price * 100);
};

const filteredServices = computed(() =>
    services.value.filter(s =>
        s.prestation_name.toLowerCase().includes(nameFilter.value.toLowerCase())
    )
);

const hasPendingPayments = computed(() =>
    services.value.some(s => s.amountToPay > 0 && !isPrestaionFullyPaid(s.id))
);

// Method to calculate payment percentage
const calculatePaymentPercentage = () => {
    if (totalFacture.value <= 0) return 0;
    const percentage = ((totalFacture.value - partRestante.value) / totalFacture.value) * 100;
    return percentage.toFixed(0);
};

// Helpers
const getRemainingAmount = (serviceId) => {
    return remainingAmounts.value[serviceId] || 0;
};

// Edit modal
const openEditModal = (service) => {
    if (isPrestaionFullyPaid(service.id)) {
        toast.add({ severity: 'info', summary: 'Information', detail: 'This service is already fully paid.', life: 3000 });
        return;
    }

    selectedService.value = service;
    editedPrice.value = service.price;
    isEditModalVisible.value = true;
};

const saveEdit = async () => {
    if (!selectedService.value) return;

    const prestationId = selectedService.value.id;
    let parsedPrice = 0;

    // Make sure the price is a valid number
    if (typeof editedPrice.value === 'string') {
        parsedPrice = parseFloat(editedPrice.value.toString().replace(/[^\d.-]/g, '').replace(',', '.'));
    } else {
        parsedPrice = editedPrice.value;
    }

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
        toast.add({ severity: 'warn', summary: 'Invalid Price', detail: 'Price must be a positive number.', life: 3000 });
        return;
    }

    try {
        const res = await axios.put(`http://localhost:5000/api/cashier/prestations/${prestationId}/price`, {
            price: parsedPrice
        });

        if (res.status === 200) {
            // Update price in local list
            selectedService.value.price = parsedPrice;
            toast.add({ severity: 'success', summary: 'Price Updated', detail: 'Price has been saved.', life: 3000 });
            isEditModalVisible.value = false;

            // Recalculate remaining amounts
            await loadHistoriquePaiements();
        } else {
            throw new Error("Error during update");
        }

    } catch (error) {
        console.error("Update error:", error);
        toast.add({ severity: 'error', summary: 'Error', detail: "Price update error", life: 3000 });
    }
};

// Save payments
const validatePayment = async () => {
    const paiementsAEffectuer = services.value.filter(s => s.amountToPay > 0 && !isPrestaionFullyPaid(s.id));

    if (paiementsAEffectuer.length === 0) {
        toast.add({ severity: 'warn', summary: 'No Payment', detail: 'Please enter an amount to pay', life: 3000 });
        return;
    }

    try {
        for (const service of paiementsAEffectuer) {
            await axios.post('http://localhost:5000/api/cashier/paiements', {
                prestation_id: service.id,
                amount_paid: service.amountToPay,
                caisse_id: 1
            });
            service.amountToPay = 0; // Reset after payment
        }

        toast.add({ severity: 'success', summary: 'Payments Saved', life: 3000 });

        // Reload data
        await reloadServices();
        await loadHistoriquePaiements();

    } catch (err) {
        console.error(err);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Save failed', life: 3000 });
    }
};

const reloadServices = async () => {
    try {
        const res = await axios.get(`http://localhost:5000/api/cashier/prestations/fiche/${ficheId}`);
        services.value = res.data.map(p => ({
            ...p,
            amountToPay: 0 // Will be set after loading remaining amounts
        }));

        // Load remaining amounts first, then set default values
        await loadHistoriquePaiements();

        // Set default amountToPay to remaining amount for unpaid services
        services.value.forEach(service => {
            if (!isPrestaionFullyPaid(service.id)) {
                service.amountToPay = getRemainingAmount(service.id);
            }
        });

    } catch (error) {
        console.error("Error loading services:", error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load services', life: 3000 });
    }
};

const loadHistoriquePaiements = async () => {
    try {
        const all = [];
        remainingAmounts.value = {}; // Reset remaining amounts

        for (const s of services.value) {
            try {
                const res = await axios.get(`http://localhost:5000/api/cashier/paiements/prestation/${s.id}`);

                // Check response format
                if (res.data && res.data.payments) {
                    // New API format
                    res.data.payments.forEach(p => {
                        all.push({
                            prestation: s.prestation_name,
                            prestation_id: s.id, // Add ID to find the service
                            date: new Date(p.created_at).toLocaleDateString(),
                            montant: p.amount_paid
                        });
                    });
                    remainingAmounts.value[s.id] = res.data.remainingAmount;
                } else if (Array.isArray(res.data)) {
                    // Old API format (for compatibility)
                    res.data.forEach(p => {
                        all.push({
                            prestation: s.prestation_name,
                            prestation_id: s.id, // Add ID to find the service
                            date: new Date(p.created_at).toLocaleDateString(),
                            montant: p.amount_paid
                        });
                    });

                    // Calculate remaining amount via payments
                    const totalPaid = res.data.reduce((sum, p) => sum + parseFloat(p.amount_paid), 0);
                    remainingAmounts.value[s.id] = Math.max(0, s.price - totalPaid);
                }
            } catch (error) {
                console.error(`Error loading payments for service ${s.id}:`, error);
            }
        }

        historiquePaiements.value = all;

    } catch (err) {
        console.error("Global error:", err);
        toast.add({ severity: 'error', summary: 'Error', detail: 'History loading failed', life: 3000 });
    }
};

const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(value)) {
        return 'N/A DZD';
    }
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency', currency: 'DZD'
    }).format(value);
};
</script>

<style>
/* Global style for paid services indicator */
.prestation-table tr {
    position: relative;
}

.prestation-paid {
    position: relative;
}

.prestation-paid::before {
    content: "";
    position: absolute;
    left: -8px;
    top: 0;
    height: 100%;
    width: 4px;
    background-color: #4CAF50;
}

.prestation-not-paid {
    position: relative;
}

.prestation-not-paid::before {
    content: "";
    position: absolute;
    left: -8px;
    top: 0;
    height: 100%;
    width: 4px;
    background-color: #D46F4D;
}
</style>

<style scoped>
.parent {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 1rem;
}

.cards-container {
    margin-bottom: 2rem;
    width: 100%;
}

/* Enhanced cards styling */
.cards-container .p-card {
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border-radius: 12px;
    overflow: hidden;
}

.cards-container .p-card:hover {
    transform: translateY(-2px);
    transition: all 0.3s ease;
}

/* Container for the two parallel tables */
.tables-container {
    display: flex;
    flex-direction: row;
    gap: 24px;
    width: 100%;
    min-height: 600px;
}

.div1,
.div2 {
    flex: 1;
    display: flex;
    flex-direction: column;
}

/* Fix for prestation table - prevent horizontal scroll */
.table-wrapper {
    width: 100%;
    overflow: hidden;
}

.prestation-table {
    width: 100%;
    table-layout: fixed;
}

.prestation-table .p-datatable-table {
    width: 100% !important;
    min-width: auto !important;
}

.prestation-table .p-column-header-content {
    width: 100%;
}

/* Fix for transactions table - enable vertical scroll only with fixed header */
.transactions-wrapper {
    flex: 1;
    overflow: hidden;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: white;
    height: 450px;
}

.transactions-table {
    height: 100%;
}

.transactions-table .p-datatable-wrapper {
    height: 100%;
}

.transactions-table .p-datatable-header {
    position: sticky;
    top: 0;
    z-index: 1;
    background: white;
    border-bottom: 1px solid #e5e7eb;
}

.transactions-table .p-datatable-thead>tr>th {
    position: sticky;
    top: 0;
    z-index: 1;
    background: #f8fafc;
    border-bottom: 2px solid #e5e7eb;
    font-weight: 600;
}

.transactions-table .p-datatable-table {
    width: 100%;
    table-layout: fixed;
}

/* Column width constraints */
.min-w-48 {
    min-width: 12rem;
    max-width: 20rem;
}

.min-w-32 {
    min-width: 8rem;
    max-width: 12rem;
}

.min-w-40 {
    min-width: 10rem;
    max-width: 14rem;
}

.min-w-28 {
    min-width: 7rem;
    max-width: 10rem;
}

/* Prestation row styling */
.prestation-row {
    padding: 4px 0;
    width: 100%;
}

.prestation-row span {
    display: block;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* Responsive design */
@media (max-width: 1024px) {
    .tables-container {
        flex-direction: column;
        gap: 20px;
    }

    .div1,
    .div2 {
        width: 100%;
    }

    .transactions-table {
        height: 350px;
    }

    .transactions-wrapper {
        height: 350px;
    }
}

@media (max-width: 768px) {
    .parent {
        padding: 0.5rem;
    }

    .tables-container {
        gap: 16px;
    }

    .cards-container {
        margin-bottom: 1.5rem;
    }
}
</style>