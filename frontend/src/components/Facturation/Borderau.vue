<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header Section -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Statement Sheet Dashboard</h1>
            <p class="text-gray-600 mt-2">Manage and generate statement sheets for validated invoices</p>
          </div>
        </div>

        <!-- Statistics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <!-- Total Invoices Card -->
          <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i class="pi pi-file-o text-blue-600 text-xl"></i>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Total Invoices</p>
                <p class="text-2xl font-bold text-gray-900">{{ validatedInvoices.length }}</p>
              </div>
            </div>
          </div>

          <!-- Selected Invoices Card -->
          <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <i class="pi pi-check-square text-green-600 text-xl"></i>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Selected</p>
                <p class="text-2xl font-bold text-gray-900">{{ selectedInvoices.length }}</p>
              </div>
            </div>
          </div>

          <!-- Unique Companies Card -->
          <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <i class="pi pi-building text-purple-600 text-xl"></i>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Companies</p>
                <p class="text-2xl font-bold text-gray-900">{{ getUniqueCompaniesCount() }}</p>
              </div>
            </div>
          </div>

          <!-- Total Value Card -->
          <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <i class="pi pi-dollar text-orange-600 text-xl"></i>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Total Value</p>
                <p class="text-2xl font-bold text-gray-900">{{ formatCurrency(getTotalValue()) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Selected Amount Card -->
        <div 
          v-if="selectedInvoices.length > 0"
          class="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl shadow-lg p-6 text-white mb-8"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-green-100">Selected Invoices Amount</p>
              <p class="text-3xl font-bold">{{ formatCurrency(totalAmount) }}</p>
              <p class="text-green-100 mt-1">{{ selectedInvoices.length }} invoice(s) selected</p>
            </div>
            <div class="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <i class="pi pi-check-circle text-2xl"></i>
            </div>
          </div>
          <div v-if="hasMultipleCompanies" class="mt-4 p-3 bg-red-500 bg-opacity-80 rounded-lg flex items-center">
            <i class="pi pi-exclamation-triangle mr-2"></i>
            <span class="text-sm">Warning: Selected invoices belong to different companies</span>
          </div>
        </div>
      </div>

      <!-- Messages Section -->
      <div class="mb-6 space-y-3">
        <!-- Success Message -->
        <div v-if="successMessage" class="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center">
          <i class="pi pi-check-circle mr-3 text-green-600"></i>
          <span>{{ successMessage }}</span>
        </div>
        
        <!-- Error Message -->
        <div v-if="errorMessage" class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center">
          <i class="pi pi-exclamation-circle mr-3 text-red-600"></i>
          <span>{{ errorMessage }}</span>
        </div>
      </div>

      <!-- Data Table Card -->
      <div class="bg-white rounded-xl shadow-lg overflow-hidden">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-gray-800 flex items-center">
              <i class="pi pi-table mr-3 text-blue-600"></i>
              Validated Invoices
            </h2>
            <Button 
              label="Generate Statement Sheet" 
              icon="pi pi-save" 
              class="bg-blue-600 hover:bg-blue-700 text-white font-semibold transition duration-200"
              :disabled="selectedInvoices.length === 0 || generating || hasMultipleCompanies"
              :loading="generating"
              @click="generateStatement"
            />
          </div>
        </div>

        <div class="p-6">
          <!-- Loading State -->
          <div v-if="loading" class="text-center py-16">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="pi pi-spinner pi-spin text-blue-600 text-2xl"></i>
            </div>
            <h3 class="text-xl font-medium text-gray-900 mb-2">Loading Invoices</h3>
            <p class="text-gray-500">Please wait while we fetch the data...</p>
          </div>

          <!-- Invoice Table -->
          <div v-else-if="validatedInvoices.length > 0" class="overflow-x-auto">
            <DataTable 
              :value="validatedInvoices" 
              v-model:selection="selectedInvoices"
              selectionMode="multiple"
              :metaKeySelection="false"
              class="w-full"
              dataKey="id"
              stripedRows
              tableStyle="min-width: 100%"
              :paginator="true"
              :rows="10"
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              :rowsPerPageOptions="[5,10,25]"
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
            >
              <Column 
                selectionMode="multiple" 
                headerStyle="width: 3rem" 
                bodyStyle="width: 3rem"
              />

              <Column field="nomAssure" header="Insured Name" sortable>
                <template #body="{ data }">
                  <div class="flex items-center">
                    <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <i class="pi pi-user text-blue-600 text-sm"></i>
                    </div>
                    <span class="text-gray-700 font-medium truncate block w-40">{{ data.nomAssure }}</span>
                  </div>
                </template>
              </Column>
          
              <Column field="invoiceNumber" header="Invoice No." sortable>
                <template #body="{ data }">
                  <span class="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{{ data.invoiceNumber }}</span>
                </template>
              </Column>

              <Column field="companyName" header="Company" sortable>
                <template #body="{ data }">
                  <div class="flex items-center">
                    <div class="w-6 h-6 bg-purple-100 rounded flex items-center justify-center mr-2">
                      <i class="pi pi-building text-purple-600 text-xs"></i>
                    </div>
                    <span class="text-gray-700 truncate block w-40">{{ data.companyName }}</span>
                  </div>
                </template>
              </Column>
          
              <Column field="amount" header="Amount" sortable>
                <template #body="{ data }">
                  <span class="text-green-600 font-bold">{{ formatCurrency(data.amount) }}</span>
                </template>
              </Column>

              <Column field="createdAt" header="Date" sortable>
                <template #body="{ data }">
                  <div class="flex items-center">
                    <i class="pi pi-calendar text-gray-400 mr-2"></i>
                    <span class="text-gray-600 text-sm">{{ formatDate(data.createdAt) }}</span>
                  </div>
                </template>
              </Column>
            </DataTable>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-16">
            <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="pi pi-inbox text-gray-400 text-3xl"></i>
            </div>
            <h3 class="text-xl font-medium text-gray-900 mb-2">No Validated Invoices</h3>
            <p class="text-gray-500">There are no validated invoices available at the moment.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';

const validatedInvoices = ref([]);
const selectedInvoices = ref([]);
const loading = ref(false);
const generating = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

onMounted(async () => {
  await loadInvoices();
});

const loadInvoices = async () => {
  loading.value = true;
  try {
    const res = await axios.get('http://localhost:5000/api/facturation/valid-calcul');
    validatedInvoices.value = res.data;
    // Clear any previous messages
    successMessage.value = '';
    errorMessage.value = '';
  } catch (error) {
    console.error("Error loading invoices:", error);
    errorMessage.value = 'Error loading invoices. Please try again.';
  } finally {
    loading.value = false;
  }
};

const totalAmount = computed(() =>
  selectedInvoices.value.reduce((total, invoice) => total + (invoice.amount || 0), 0)
);

// Check if selected invoices belong to multiple companies
const hasMultipleCompanies = computed(() => {
  if (selectedInvoices.value.length <= 1) return false;
  const companyIds = [...new Set(selectedInvoices.value.map(invoice => invoice.invoiceCompanyId))];
  return companyIds.length > 1;
});

// Statistics helper functions
const getUniqueCompaniesCount = () => {
  const companyIds = [...new Set(validatedInvoices.value.map(invoice => invoice.invoiceCompanyId))];
  return companyIds.length;
};

const getTotalValue = () => {
  return validatedInvoices.value.reduce((total, invoice) => total + (invoice.amount || 0), 0);
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-DZ', { 
    style: 'currency', 
    currency: 'DZD',
    minimumFractionDigits: 2
  }).format(value || 0);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const generateStatement = async () => {
  if (selectedInvoices.value.length === 0) {
    errorMessage.value = 'Please select at least one invoice.';
    return;
  }

  if (hasMultipleCompanies.value) {
    errorMessage.value = 'All selected invoices must belong to the same company.';
    return;
  }

  generating.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    const response = await axios.post('http://localhost:5000/api/facturation/generate-statement', {
      selectedInvoices: selectedInvoices.value
    });

    if (response.data.success) {
      successMessage.value = `Statement sheet ${response.data.bordereauNumber} generated successfully! ${response.data.invoicesProcessed} invoices processed.`;
      
      // Clear selection and reload invoices
      selectedInvoices.value = [];
      await loadInvoices();
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        successMessage.value = '';
      }, 5000);
    }
  } catch (error) {
    console.error("Error generating statement:", error);
    errorMessage.value = error.response?.data?.error || 'Error generating statement sheet. Please try again.';
    
    // Clear error message after 5 seconds
    setTimeout(() => {
      errorMessage.value = '';
    }, 5000);
  } finally {
    generating.value = false;
  }
};
</script>

<style scoped>
/* Additional styles for better UX */
.pi-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>