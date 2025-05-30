<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header Section -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Medical Records Dashboard</h1>
            <p class="text-gray-600 mt-2">{{ entrepriseNom || 'Company Name' }}</p>
          </div>
          <router-link :to="{ name: 'Borderau', params: { factures: JSON.stringify(facturesValidees) } }">
            <Button 
              label="Generate Summary" 
              icon="pi pi-book" 
              class="p-button-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg" 
            />
          </router-link>
        </div>

        <!-- Statistics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <!-- Total Records Card -->
          <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i class="pi pi-users text-blue-600 text-xl"></i>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Total Records</p>
                <p class="text-2xl font-bold text-gray-900">{{ products.length }}</p>
              </div>
            </div>
          </div>

          <!-- Pending Records Card -->
          <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <i class="pi pi-clock text-orange-600 text-xl"></i>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Waiting</p>
                <p class="text-2xl font-bold text-gray-900">{{ getPendingCount() }}</p>
              </div>
            </div>
          </div>

          <!-- Validated Records Card -->
          <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <i class="pi pi-check-circle text-yellow-600 text-xl"></i>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Validated</p>
                <p class="text-2xl font-bold text-gray-900">{{ getValidatedCount() }}</p>
              </div>
            </div>
          </div>

          <!-- Billed Records Card -->
          <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <i class="pi pi-dollar text-green-600 text-xl"></i>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Billed</p>
                <p class="text-2xl font-bold text-gray-900">{{ getBilledCount() }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Total Amount Card -->
        <!-- <div class="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-6 text-white mb-8">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-purple-100">Total Amount</p>
              <p class="text-3xl font-bold">{{ formatCurrency(getTotalAmount()) }}</p>
            </div>
            <div class="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <i class="pi pi-chart-line text-2xl"></i>
            </div>
          </div>
        </div> -->
      </div>

      <!-- Data Table Card -->
      <div class="bg-white rounded-xl shadow-lg overflow-hidden">
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-800 flex items-center">
            <i class="pi pi-table mr-3 text-blue-600"></i>
            Medical Records List
          </h2>
        </div>

        <div class="p-6">
          <DataTable 
            v-if="products.length > 0" 
            :value="products" 
            tableStyle="min-width: 50rem"
            :paginator="true" 
            :rows="10"
            :rowsPerPageOptions="[5, 10, 20]"
            class="p-datatable-sm"
            stripedRows
          >
            <Column field="borderauNumber" header="Summary No." sortable>
              <template #body="{ data }">
                <span class="font-medium">{{ data.bordereauNumber || 'N/A' }}</span>
              </template>
            </Column>

            <Column field="invoiceNumber" header="Invoice No." sortable>
              <template #body="{ data }">
                <span class="font-medium">{{ data.invoiceNumber || 'N/A' }}</span>
              </template>
            </Column>

            <Column field="patient" header="Patient" sortable>
              <template #body="{ data }">
                <div class="flex items-center">
                  <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <i class="pi pi-user text-blue-600 text-sm"></i>
                  </div>
                  <span class="font-medium text-gray-900">{{ data.patient }}</span>
                </div>
              </template>
            </Column>

            <Column field="amount" header="Amount" sortable>
              <template #body="{ data }">
                <span class="font-bold text-green-600">{{ formatCurrency(data.amount || 0) }}</span>
              </template>
            </Column>

            <Column header="Status" sortable>
              <template #body="{ data }">
                <Tag 
                  :value="data.status" 
                  :severity="getSeverity(data.status)"
                  class="px-3 py-1 text-sm font-medium rounded-full"
                />
              </template>
            </Column>

            <Column header="Actions">
              <template #body="{ data }">
                <Button
                  :label="data.status === 'waiting' ? 'Generate' : 'View'"
                  :icon="data.status === 'waiting' ? 'pi pi-check-circle' : 'pi pi-eye'"
                  :class="data.status === 'waiting' ? 'p-button-sm p-button-success' : 'p-button-sm p-button-info'"
                  @click="openFactureModal(data)"
                />
              </template>
            </Column>
          </DataTable>

          <div v-else class="text-center py-16">
            <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="pi pi-inbox text-gray-400 text-3xl"></i>
            </div>
            <h3 class="text-xl font-medium text-gray-900 mb-2">No Records Found</h3>
            <p class="text-gray-500">No invoices found for this company.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Dialog -->
    <Dialog 
      v-model:visible="showFactureModal" 
      modal 
      header="Invoice Details" 
      :style="{ width: '50vw' }"
      class="p-dialog-maximized-responsive"
    >
      <patientF 
        v-if="selectedFacture" 
        :facture="selectedFacture" 
        :readOnlyMode="selectedFacture.status !== 'waiting'"
      />
      <template #footer>
        <div class="flex gap-3">
          <Button 
            v-if="selectedFacture && selectedFacture.status === 'waiting'" 
            label="Confirm Invoice" 
            icon="pi pi-check" 
            class="p-button-success" 
            @click="validateFacture" 
          />
          <Button 
            v-else-if="selectedFacture && selectedFacture.status !== 'waiting'" 
            label="Print" 
            icon="pi pi-print" 
            class="p-button-secondary" 
            @click="printFacture" 
          />
          <Button 
            label="Cancel" 
            icon="pi pi-times" 
            class="p-button-text" 
            @click="showFactureModal = false" 
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Tag from "primevue/tag";
import Dialog from 'primevue/dialog';
import patientF from './facturePatient.vue';

const route = useRoute();
const products = ref([]);
const entrepriseNom = ref('');
const showFactureModal = ref(false);
const selectedFacture = ref(null);
const facturesValidees = ref([]);

onMounted(async () => {
  const entrepriseId = route.params.id;
  if (!entrepriseId) {
    console.error("No company ID provided in the route.");
    return;
  }

  try {
    const entrepriseResponse = await axios.get(`http://localhost:5000/api/facturation/entreprises`);
    const entreprise = entrepriseResponse.data.find(e => e.company_id == entrepriseId);
    if (entreprise) {
      entrepriseNom.value = entreprise.company_name;
    }

    const response = await axios.get(`http://localhost:5000/api/facturation/patients/company/${entrepriseId}/unbilled-examined-patients`);
    products.value = response.data.map((item) => ({
      ...item,
      patient: `${item.first_name} ${item.last_name}`,
      status: item.status ,
      invoiceNumber: item.invoice_patient_number || null,
      bordereauNumber: item.bordereau_number || null,
      amount: item.amount || 0
    }));

  } catch (error) {
    console.error("Error loading patients:", error);
  }
});

const formatCurrency = (value) =>
  value.toLocaleString('en-US', { style: 'currency', currency: 'DZD' });

const getSeverity = (status) => {
  switch (status) {
    case 'billed': return 'success';
    case 'validated': return 'warning';
    case 'waiting': return 'danger';
    default: return null;
  }
};

// Statistics helper functions
const getPendingCount = () => products.value.filter(p => p.status === 'waiting').length;
const getValidatedCount = () => products.value.filter(p => p.status === 'validated').length;
const getBilledCount = () => products.value.filter(p => p.status === 'billed').length;
const getTotalAmount = () => products.value.reduce((sum, p) => sum + (p.amount || 0), 0);

const validateFacture = async () => {
  if (!selectedFacture.value) return;
 console.log('selectedFacture.value:', selectedFacture.value);
  console.log('selectedFacture.value.id:', selectedFacture.value.id);
  try {
    const response = await axios.put(
      `http://localhost:5000/api/facturation/invoicepatient/generate/${selectedFacture.value.id}`
    );

    const updatedIndex = products.value.findIndex(
      p => p.id === selectedFacture.value.id
    );

    if (updatedIndex !== -1) {
      products.value[updatedIndex] = {
        ...products.value[updatedIndex],
        invoiceNumber: response.data.invoice_patient_number,
        status: 'validated',
        borderauNumber: response.data.borderau_patient_number || 'N/A'
      };
    }

    facturesValidees.value.push({ ...selectedFacture.value });
    showFactureModal.value = false;
  } catch (error) {
    console.error("Error generating invoice:", error);
  }
};

const openFactureModal = (facture) => {
  selectedFacture.value = facture;
  showFactureModal.value = true;
};

const printFacture = () => {
  if (!selectedFacture.value) return;
  
  // Créer une nouvelle fenêtre pour l'impression
  const printWindow = window.open('', '_blank');
  
  // Obtenir le contenu du dialog (sans les boutons d'actions)
  const dialogContent = document.querySelector('.p-dialog-content');
  
  if (dialogContent && printWindow) {
    // HTML pour l'impression avec les styles nécessaires
    const printHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Facture - ${selectedFacture.value.patient}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              color: #333;
            }
            .p-6 { padding: 1.5rem; }
            .bg-white { background-color: white; }
            .shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
            .rounded-md { border-radius: 0.375rem; }
            .max-w-4xl { max-width: 56rem; }
            .mx-auto { margin-left: auto; margin-right: auto; }
            .mb-6 { margin-bottom: 1.5rem; }
            .border-b { border-bottom: 1px solid #e5e7eb; }
            .pb-4 { padding-bottom: 1rem; }
            .overflow-x-auto { overflow-x: auto; }
            .min-w-full { min-width: 100%; }
            .mt-4 { margin-top: 1rem; }
            .p-4 { padding: 1rem; }
            .bg-gray-100 { background-color: #f3f4f6; }
            strong { font-weight: bold; color: #333; }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 1rem;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 8px 12px; 
              text-align: left;
            }
            th { 
              background-color: #f8f9fa; 
              font-weight: bold;
            }
            .actions-column { display: none !important; }
            
            @media print {
              .actions-column { display: none !important; }
              .p-button { display: none !important; }
            }
          </style>
        </head>
        <body>
          ${dialogContent.innerHTML}
        </body>
      </html>
    `;
    
    printWindow.document.write(printHTML);
    printWindow.document.close();
    
    // Attendre que le contenu soit chargé puis imprimer
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  }
};
</script>