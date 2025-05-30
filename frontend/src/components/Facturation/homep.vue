<template>
    <div class="card">
      <DataTable v-if="products.length > 0" :value="products" tableStyle="min-width: 50rem">
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-2">
            <span class="text-xl font-bold">Liste des Factures</span>
          </div>
        </template>
        <Column field="invoiceNumber" header="N° Facture">
          <template #body="{ data }">{{ data.invoiceNumber || 'N/A' }}</template>
        </Column>
  
        <Column field="patient" header="Patient">
          <template #body="{ data }">{{ data.patient }}</template>
        </Column>
  
        <Column field="amount" header="Montant">
          <template #body="{ data }">{{ formatCurrency(data.amount) }}</template>
        </Column>
  
        <Column header="Status">
          <template #body="{ data }">
            <Tag :value="data.status" :severity="getSeverity(data.status)" />
          </template>
        </Column>
  
        <Column header="Actions">
          <template #body="{ data }">
            <Button icon="pi pi-list" label="Générer" class="p-button-sm p-button-info" @click="openFactureModal(data)" />
          </template>
        </Column>
      </DataTable>
  
      <!-- Affichage si aucune donnée -->
      <div v-else class="text-center text-gray-500 p-4">
        Aucune facture trouvée.
      </div>
  
      <!-- Fenêtre modale -->
      <Dialog v-model:visible="showFactureModal" modal header="Détails de la Facture" :style="{ width: '50vw' }">
        <patientF v-if="selectedFacture" :facture="selectedFacture" />
        <template #footer>
          <Button v-if="selectedFacture" label="Générer la facture" icon="pi pi-check" class="p-button-sm p-button-success"
            @click="validateFacture" />
        </template>
      </Dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import DataTable from 'primevue/datatable';
  import Column from 'primevue/column';
  import Button from 'primevue/button';
  import Tag from "primevue/tag";
  import Dialog from 'primevue/dialog';
  import patientF from './facturePatient.vue';
  
  const router = useRouter();
  const products = ref([]);
  const filters = ref({ borderauNumber: '', invoiceNumber: '' });
  const showFactureModal = ref(false);
  const selectedFacture = ref(null);
  const invoiceCounter = ref(1);
  const facturesValidees = ref([]);
  
  // Vérification des données
  onMounted(() => {
    console.log("Chargement des produits...");
    products.value = [
      {
         invoiceNumber: null, patient: "Jean Dupont", amount: 150.0, status: "en attente" },
      {
         invoiceNumber: null, patient: "Marie Curie", amount: 200.5, status: "en attente" },
      {
         invoiceNumber: null, patient: "Albert Einstein", amount: 300.75, status: "en attente" }
    ];
    console.log("Produits chargés :", products.value);
  });
  
  const formatCurrency = (value) => {
    return value.toLocaleString('fr-FR', { style: 'currency', currency: 'DZD' });
  };
  
  const getSeverity = (status) => {
    switch (status) {
      case 'validée': return 'success';
      case 'en attente': return 'danger';
      default: return null;
    }
  };
  
  const validateFacture = () => {
    if (selectedFacture.value) {
      const year = new Date().getFullYear();
      const newInvoiceNumber = String(invoiceCounter.value).padStart(4, '0') + '/' + year;
      
      selectedFacture.value.invoiceNumber = newInvoiceNumber;
      selectedFacture.value.status = "validée";
      selectedFacture.value.borderauNumber = "N/A";
      
      facturesValidees.value.push({ ...selectedFacture.value });
      invoiceCounter.value++;
    }
    showFactureModal.value = false;
  };
  
  const openFactureModal = (facture) => {
    selectedFacture.value = facture;
    showFactureModal.value = true;
  };
  </script>
  