<template>
    <div class="card p-4">
      <!-- Bouton "Nouveau" -->
      <Button label="Nouveau" icon="pi pi-plus" class="p-button-sm p-button-black mb-3" @click="ouvrirDialog" />
  
      <!-- Tableau des factures proformat -->
      <DataTable :value="facturesProformat" tableStyle="min-width: 50rem">
        <Column field="numero" header="N° Facture Proformat"></Column>
        <Column field="patient" header="Patient"></Column>
        <Column field="montant" header="Montant Global">
          <template #body="{ data }">{{ formatCurrency(data.montant) }}</template>
        </Column>
        <Column header="Action">
          <template #body>
            <Button icon="pi pi-eye" class="p-button-sm p-button-info" label="View" />
          </template>
        </Column>
      </DataTable>
  
      <!-- Dialog pour ajouter une facture proformat -->
      <Dialog v-model:visible="dialogVisible" modal :style="{ width: dialogWidth }" header="Nouvelle Facture Proformat">
        <div class="grid gap-4">
          <div>
            <label class="font-semibold">Convention</label>
            <Dropdown v-model="selectedConvention" :options="conventions" optionLabel="nom" placeholder="Sélectionner" class="w-full" />
          </div>
          <div>
            <label class="font-semibold">Patient</label>
            <Dropdown v-model="selectedPatient" :options="patients" optionLabel="nom" placeholder="Sélectionner" class="w-full" />
          </div>
          <Button label="Nouveau patient" icon="pi pi-user-plus" class="p-button-sm p-button-secondary" @click="addPatientDialog = true" />
          
          <!-- Champs supplémentaires si "Nouveau patient" est sélectionné -->
          <!-- <div v-if="ajoutPatient" class="grid gap-4">
            <div>
              <label class="font-semibold">Nom Bénéficiaire</label>
              <InputText v-model="nouveauPatient.nom" placeholder="Nom du patient" class="w-full" />
            </div>
            <div>
              <label class="font-semibold">Âge</label>
              <InputNumber v-model="nouveauPatient.age" class="w-full" />
            </div>
            <div>
              <label class="font-semibold">Téléphone</label>
              <InputText v-model="nouveauPatient.phone" placeholder="Numéro de téléphone" class="w-full" />
            </div>
          </div> -->
                  <AddPatientModel v-model:visible="addPatientDialog"  />

        </div>
  
        <template #footer>
          <Button label="Valider" icon="pi pi-check" class="p-button-sm p-button-success" @click="validerFacture" />
        </template>
      </Dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  import DataTable from 'primevue/datatable';
  import Column from 'primevue/column';
  import Button from 'primevue/button';
  import Dialog from 'primevue/dialog';
  import Dropdown from 'primevue/dropdown';
  import InputText from 'primevue/inputtext';
  import InputNumber from 'primevue/inputnumber';
  import AddPatientModel from './AddPatientModel.vue'
  
  // Liste des factures proformat (exemple)
  const facturesProformat = ref([
    { numero: "PROF-001", patient: "Ali Benali", montant: 15000 },
    { numero: "PROF-002", patient: "Fatima Omar", montant: 25000 }
  ]);
  const addPatientDialog = ref(false);
  // Liste des conventions et patients (exemple)
  const conventions = ref([{ nom: "CNAS" }, { nom: "CASNOS" }]);
  const patients = ref([{ nom: "Ali Benali" }, { nom: "Fatima Omar" }]);
  
  // Variables pour le formulaire
  const dialogVisible = ref(false);
  const dialogWidth = ref("40vw");
  const selectedConvention = ref(null);
  const selectedPatient = ref(null);
  const ajoutPatient = ref(false);
  
  // Nouveau patient
  const nouveauPatient = ref({ nom: "", age: null, phone: "" });
  
  // Ouvrir le dialog
  const ouvrirDialog = () => {
    dialogVisible.value = true;
    ajoutPatient.value = false; // Réinitialise l'affichage
    dialogWidth.value = "40vw"; // Taille normale au départ
  };
  
  // Agrandir le dialog si on ajoute un nouveau patient
  const ajouterNouveauPatient = () => {
    ajoutPatient.value = true;
    dialogWidth.value = "50vw";
  };
  
  // Valider la facture
  const validerFacture = () => {
    if (ajoutPatient.value) {
      patients.value.push({ nom: nouveauPatient.value.nom }); // Ajoute le nouveau patient
    }
    dialogVisible.value = false;
  };
  
  // Formatter les montants en DZD
  const formatCurrency = (value) => {
    return value.toLocaleString('fr-FR', { style: 'currency', currency: 'DZD' });
  };
  </script>
  