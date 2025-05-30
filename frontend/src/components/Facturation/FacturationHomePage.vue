<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header Section -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-800 mb-2">Facture Dashboard</h1>
        <p class="text-gray-600">Gérez vos factures et suivez les dossiers non facturés</p>
      </div>

      <!-- État de chargement -->
      <div v-if="loading" class="flex justify-center items-center py-16">
        <div class="text-center">
          <i class="pi pi-spin pi-spinner text-5xl text-blue-500 mb-4"></i>
          <p class="text-xl text-gray-600">Chargement des données...</p>
        </div>
      </div>

      <!-- Message d'erreur -->
      <div v-else-if="error" class="max-w-2xl mx-auto">
        <div class="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg shadow-sm">
          <div class="flex">
            <div class="flex-shrink-0">
              <i class="pi pi-exclamation-triangle text-red-400 text-xl"></i>
            </div>
            <div class="ml-3">
              <h3 class="text-lg font-medium text-red-800">Erreur de chargement</h3>
              <p class="mt-2 text-red-700">{{ error }}</p>
              <div class="mt-4">
                <Button 
                  label="Réessayer" 
                  icon="pi pi-refresh" 
                  class="p-button-outlined p-button-danger"
                  @click="fetchEntreprises" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div v-else class="space-y-8">
        <!-- Statistics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Total Companies Card -->
          <div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow duration-300">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i class="pi pi-building text-blue-600 text-xl"></i>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Total Entreprises</p>
                <p class="text-3xl font-bold text-gray-900">{{ fiches.length }}</p>
              </div>
            </div>
          </div>

          <!-- Total Unbilled Patients Card -->
          <div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500 hover:shadow-xl transition-shadow duration-300">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <i class="pi pi-users text-red-600 text-xl"></i>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">medical records unbilled</p>
                <p class="text-3xl font-bold text-gray-900">{{ totalUnbilledPatients }}</p>
              </div>
            </div>
          </div>

          <!-- Average Unbilled Per Company Card -->
          <div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500 hover:shadow-xl transition-shadow duration-300">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <i class="pi pi-chart-bar text-yellow-600 text-xl"></i>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Moyen of company</p>
                <p class="text-3xl font-bold text-gray-900">{{ averageUnbilledPerCompany }}</p>
              </div>
            </div>
          </div>

          <!-- Filtered Results Card -->
          <div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow duration-300">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <i class="pi pi-filter text-green-600 text-xl"></i>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Résultats Filtrés</p>
                <p class="text-3xl font-bold text-gray-900">{{ filteredFiches.length }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters Section -->
        <div class="bg-white rounded-xl shadow-lg p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <i class="pi pi-filter mr-2 text-blue-600"></i>
            Filtres of search
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">Filtrer by companies</label>
              <InputText 
                v-model="entrepriseFilter" 
                placeholder="Nom de l'entreprise..." 
                class="w-full"
                :class="{'p-invalid': entrepriseFilter && filteredFiches.length === 0}"
              />
            </div>
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">Filtrer by nrb of medical record</label>
              <InputText 
                v-model="nbrActNonFactureFilter" 
                placeholder="Nombre de dossiers..." 
                class="w-full"
                :class="{'p-invalid': nbrActNonFactureFilter && filteredFiches.length === 0}"
              />
            </div>
          </div>
          <!-- Clear Filters Button -->
          <div class="mt-4 flex justify-end">
            <Button 
              v-if="entrepriseFilter || nbrActNonFactureFilter"
              label="Effacer les filtres" 
              icon="pi pi-times" 
              class="p-button-outlined p-button-secondary p-button-sm"
              @click="clearFilters"
            />
          </div>
        </div>

        <!-- Data Table Section -->
        <div class="bg-white rounded-xl shadow-lg overflow-hidden">
          <div class="p-6 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-800 flex items-center">
              <i class="pi pi-table mr-2 text-blue-600"></i>
              Liste des Entreprises
            </h3>
          </div>
          
          <DataTable 
            :value="filteredFiches" 
            paginator 
            :rows="10" 
            class="w-full"
            :rowsPerPageOptions="[5, 10, 20, 50]"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Affichage de {first} à {last} sur {totalRecords} entrées"
            responsiveLayout="scroll"
            :rowHover="true"
            stripedRows
          >
            <!-- Company Column -->
            <Column field="company_name" header="Companies" sortable class="min-w-48">
              <template #body="{ data }">
                <div class="flex items-center">
                  <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <i class="pi pi-building text-blue-600"></i>
                  </div>
                  <div>
                    <p class="font-semibold text-gray-900">{{ data.company_name }}</p>
                    <p class="text-sm text-gray-500">ID: {{ data.company_id }}</p>
                  </div>
                </div>
              </template>
            </Column>

            <!-- Unbilled Count Column -->
            <Column field="non_factured_count" header="unbilled medical record" sortable dataType="numeric" class="text-center">
              <template #body="{ data }">
                <div class="flex items-center justify-center">
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                        :class="getBadgeClass(data.non_factured_count)">
                    {{ data.non_factured_count }}
                  </span>
                </div>
              </template>
            </Column>

            <!-- Status Column -->
            <Column header="Statut" class="text-center">
              <template #body="{ data }">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                      :class="getStatusClass(data.non_factured_count)">
                  <i :class="getStatusIcon(data.non_factured_count)" class="mr-1"></i>
                  {{ getStatusText(data.non_factured_count) }}
                </span>
              </template>
            </Column>

            <!-- Actions Column -->
            <Column header="Actions" class="text-center">
              <template #body="{ data }">
                <div class="flex gap-3 justify-center">
                  <Button 
                    icon="pi pi-list" 
                    label="Voir Détails" 
                    class="p-button-sm p-button-info p-button-rounded"
                    @click="navigateToPatient(data)"
                    v-tooltip.top="'Voir les détails des patients'"
                  />
                </div>
              </template>
            </Column>
          </DataTable>

          <!-- Empty State Messages -->
          <div v-if="filteredFiches.length === 0 && fiches.length > 0" class="text-center py-12">
            <i class="pi pi-search text-6xl text-gray-300 mb-4"></i>
            <h3 class="text-xl font-medium text-gray-600 mb-2">Aucun résultat trouvé</h3>
            <p class="text-gray-500">Aucune entreprise ne correspond aux critères de filtrage.</p>
            <Button 
              label="Effacer les filtres" 
              icon="pi pi-times" 
              class="p-button-outlined mt-4"
              @click="clearFilters"
            />
          </div>
          
          <div v-if="fiches.length === 0 && !loading && !error" class="text-center py-12">
            <i class="pi pi-inbox text-6xl text-gray-300 mb-4"></i>
            <h3 class="text-xl font-medium text-gray-600 mb-2">Aucune donnée disponible</h3>
            <p class="text-gray-500">Aucune entreprise avec des patients non facturés.</p>
            <Button 
              label="Actualiser" 
              icon="pi pi-refresh" 
              class="p-button-outlined mt-4"
              @click="fetchEntreprises"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';

const router = useRouter();
const entrepriseFilter = ref('');
const nbrActNonFactureFilter = ref('');
const fiches = ref([]);
const loading = ref(false);
const error = ref(null);

console.log("GGGG");

// Utilisez l'URL correcte avec le préfixe /api
const fetchEntreprises = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    // URL corrigée pour correspondre à votre configuration backend
    const response = await axios.get('http://localhost:5000/api/facturation/entreprises');
    console.log('Données reçues de l\'API:', response.data);
    
    fiches.value = response.data;
  } catch (err) {
    console.error('Erreur de chargement des entreprises:', err);
    error.value = `Impossible de charger les données: ${err.message || 'Erreur inconnue'}`;
  } finally {
    loading.value = false;
  }
};

// Navigation vers les différentes pages avec l'ID de l'entreprise
const navigateToPatient = (data) => {
  console.log("Navigation vers patient:", data);
  router.push({
    name: 'xxx',
    params: { id: data.company_id },
    query: { entreprise: data.company_name }
  });
};

const navigateToProformat = (data) => {
  router.push({ 
    path: '/proformat', 
    query: { 
      entrepriseId: data.company_id, 
      entreprise: data.company_name 
    } 
  });
};

const navigateToViewFacture = (data) => {
  router.push({ 
    path: '/viewfacture', 
    query: { 
      entrepriseId: data.company_id, 
      entreprise: data.company_name 
    } 
  });
};

// Statistics computations
const totalUnbilledPatients = computed(() => {
  return fiches.value.reduce((total, fiche) => total + fiche.non_factured_count, 0);
});

const averageUnbilledPerCompany = computed(() => {
  if (fiches.value.length === 0) return 0;
  return Math.round(totalUnbilledPatients.value / fiches.value.length);
});

// Utility functions for styling
const getBadgeClass = (count) => {
  if (count === 0) return 'bg-green-100 text-green-800';
  if (count <= 5) return 'bg-yellow-100 text-yellow-800';
  if (count <= 10) return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
};

const getStatusClass = (count) => {
  if (count === 0) return 'bg-green-100 text-green-800';
  if (count <= 5) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

const getStatusIcon = (count) => {
  if (count === 0) return 'pi pi-check-circle';
  if (count <= 5) return 'pi pi-exclamation-triangle';
  return 'pi pi-times-circle';
};

const getStatusText = (count) => {
  if (count === 0) return 'À jour';
  if (count <= 5) return 'Attention';
  return 'Urgent';
};

const clearFilters = () => {
  entrepriseFilter.value = '';
  nbrActNonFactureFilter.value = '';
};

onMounted(() => {
  fetchEntreprises();
});

const filteredFiches = computed(() => {
  if (!entrepriseFilter.value && !nbrActNonFactureFilter.value) {
    return fiches.value;
  }
  
  return fiches.value.filter(fiche =>
    fiche.company_name.toLowerCase().includes(entrepriseFilter.value.toLowerCase()) &&
    fiche.non_factured_count.toString().includes(nbrActNonFactureFilter.value)
  );
});
</script>

<style scoped>
/* Custom styling for better visual hierarchy */
.p-datatable .p-datatable-tbody > tr:hover {
  background-color: #f8fafc !important;
}

.p-datatable .p-datatable-thead > tr > th {
  background-color: #f1f5f9;
  color: #334155;
  font-weight: 600;
  border-bottom: 2px solid #e2e8f0;
}

.p-datatable .p-datatable-tbody > tr > td {
  padding: 1rem 0.75rem;
  border-bottom: 1px solid #f1f5f9;
}

.p-button-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.p-inputtext:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

/* Animation for cards */
.bg-white {
  transition: all 0.3s ease;
}

.bg-white:hover {
  transform: translateY(-2px);
}

/* Custom scrollbar for better UX */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>