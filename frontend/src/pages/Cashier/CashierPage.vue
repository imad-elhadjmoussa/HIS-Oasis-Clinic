<template>
  <div class="bg-white p-4">
    <h2 class="text-4xl font-semibold text-gray-800 mb-4">Latest Fiches</h2>

    <div class="w-full flex items-center gap-2 mb-4">
      <InputText v-model="searchQuery" placeholder="Search Fiche ID..." class="p-inputtext-sm w-full md:w-[50%]" />
    </div>

    <DataTable :value="filteredFiches" paginator :rows="9" class="p-datatable-sm">
      <Column field="id" header="Fiche ID">
        <template #body="{ data }">
          <span>{{ data.id }}</span>
        </template>
      </Column>

      <Column field="created_at" header="Created At">
        <template #body="{ data }">
          <span>{{ formatDate(data.created_at) }}</span>
        </template>
      </Column>

      <Column header="Status">
        <template #body="{ data }">
          <Tag :value="data.status" :severity="getTagSeverity(data.status)" />
        </template>
      </Column>

      <Column header="Actions">
        <template #body="{ data }">
          <Button @click="viewPrestationDetails(data)" icon="pi pi-list" label="View Prestations"
            class="p-button-sm p-button-info" />
        </template>
      </Column>
    </DataTable>

    <!-- Détail fiche si besoin -->
    <Dialog v-model:visible="infoDialog" header="Fiche Information" modal>
      <div class="p-fluid flex flex-col px-5 w-[400px]">
        <p><strong>Date:</strong> {{ formatDate(selectedFiche.created_at) }}</p>
        <p><strong>Notes:</strong> {{ selectedFiche.notes }}</p>
        <p><strong>Status:</strong> {{ selectedFiche.status }}</p>
        <div class="mt-4 text-right">
          <Button label="Close" icon="pi pi-times" @click="infoDialog = false" class="p-button-text" />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import Tag from 'primevue/tag';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import { useUserStore } from '../../stors/user';
import { useRouter } from 'vue-router';

// Données
const userStore = useUserStore();
const searchQuery = ref('');
const fiches = ref([]);
const infoDialog = ref(false);
const selectedFiche = ref({});
const router = useRouter();

const filteredFiches = computed(() => {
  return fiches.value.filter(fiche =>
    fiche.id.toString().includes(searchQuery.value.trim())
  );
});

const viewPrestationDetails = (data) => {
  const basePath = userStore.role === 'Admin' ? '/cashier' : '';
  router.push(`${basePath}/fiches/${data.id}/prestations`);
};

const getTagSeverity = (status) => {
  switch (status) {
    case 'Completed': return 'success';
    case 'In Progress': return 'info';
    case 'Pending': return 'warning';
    default: return 'secondary';
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

onMounted(async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/cashier/fiches/unbilled'); fiches.value = response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des fiches:', error);
  }
});
</script>
