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
  
      <!-- Dialog pour ajouter une facture proformat pour particulier (sans convention) -->
       <!-- Dialog pour ajouter une facture proformat -->
    <Dialog v-model:visible="dialogVisible" modal :style="{ width: '40vw' }" header="Nouvelle Facture Proformat (Particulier)">
      <div class="grid gap-4">
        <div>
          <label class="font-semibold">Patient</label>
          <Dropdown v-model="selectedPatient" :options="patients" optionLabel="nom" placeholder="Sélectionner" class="w-full" />
        </div>
        <Button label="Nouveau patient" icon="pi pi-user-plus" class="p-button-sm p-button-secondary" @click="afficherDialogPatient" />
      </div>

      <template #footer>
        <Button label="Valider" icon="pi pi-check" class="p-button-sm p-button-success" @click="validerFacture" />
      </template>
    </Dialog>

    <!-- Dialog pour ajouter un nouveau patient (repris du deuxième composant) -->
    <Dialog v-model:visible="patientDialogVisible" :style="{ width: '700px' }" header="Ajouter un nouveau patient"
      :modal="true">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">N° d'identification*</label>
          <InputMask size="small" v-model="nouveauPatient.national_id_number" mask="9999999999" placeholder="XXXXXXXXXX"
            class="w-full" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Prénom*</label>
          <InputText size="small" placeholder="Prénom" v-model="nouveauPatient.first_name" class="w-full"
            required />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nom*</label>
          <InputText size="small" placeholder="Nom" v-model="nouveauPatient.last_name" class="w-full"
            required />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Date de Naissance*</label>
          <Calendar size="small" placeholder="Date de naissance" v-model="nouveauPatient.date_of_birth" dateFormat="yy-mm-dd"
            class="w-full" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Genre</label>
          <Dropdown size="small" v-model="nouveauPatient.gender" :options="genders" placeholder="Sélectionner le genre"
            class="w-full" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone*</label>
          <InputMask size="small" v-model="nouveauPatient.phone_number" mask="9999999999" placeholder="0XXXXXXXXX"
            class="w-full" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <InputText size="small" placeholder="Email" v-model="nouveauPatient.email" type="email" class="w-full" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Groupe Sanguin</label>
          <Dropdown size="small" v-model="nouveauPatient.blood_type" :options="bloodTypes"
            placeholder="Sélectionner le groupe sanguin" class="w-full" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
          <InputText size="small" placeholder="Adresse" v-model="nouveauPatient.address" class="w-full" />
        </div>
      </div>
      <template #footer>
        <Button size="small" label="Annuler" icon="pi pi-times" @click="fermerDialogPatient" class="p-button-secondary" />
        <Button size="small" label="Ajouter" icon="pi pi-plus" @click="ajouterPatient" class="p-button-success" />
      </template>
    </Dialog>
    <Toast/>
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
  import InputMask from 'primevue/inputmask';
import Calendar from 'primevue/calendar';
import Toast from 'primevue/toast';
import { bloodTypes, genders, showNotification } from "../api/index";
import { createPatient, validatePatient } from "../api/patient";
  
  // Liste des factures proformat (exemple)
  const facturesProformat = ref([
    { numero: "PROF-P001", patient: "Ali Benali", montant: 15000 },
    { numero: "PROF-P002", patient: "Fatima Omar", montant: 25000 }
  ]);
  
  // Liste des patients (exemple)
  const patients = ref([{ nom: "Ali Benali" }, { nom: "Fatima Omar" }]);
  
  // Variables pour le formulaire
  const dialogVisible = ref(false);
  const dialogWidth = ref("40vw");
  const selectedPatient = ref(null);
  const ajoutPatient = ref(false);
  
 // Variables pour le formulaire de patient
const patientDialogVisible = ref(false);
const nouveauPatient = ref({
  national_id_number: "",
  first_name: "",
  last_name: "",
  date_of_birth: "",
  phone_number: "",
  email: "",
  address: "",
  gender: "",
  blood_type: ""
});
  
  // Ouvrir le dialog
  const ouvrirDialog = () => {
    dialogVisible.value = true;
    ajoutPatient.value = false; // Réinitialise l'affichage
    dialogWidth.value = "40vw"; // Taille normale au départ
  };
  
  // Afficher le dialog pour ajouter un patient
const afficherDialogPatient = () => {
  patientDialogVisible.value = true;
};

// Fermer le dialog patient
const fermerDialogPatient = () => {
  patientDialogVisible.value = false;
  // Réinitialiser le formulaire
  nouveauPatient.value = {
    national_id_number: "",
    first_name: "",
    last_name: "",
    date_of_birth: "",
    phone_number: "",
    email: "",
    address: "",
    gender: "",
    blood_type: ""
  };
};

// Ajouter un nouveau patient
const ajouterPatient = async () => {
  try {
    // Valider les champs requis
    validatePatient(nouveauPatient.value);
    
    // Appeler l'API
    const createdPatient = await createPatient(nouveauPatient.value);
    
    // Ajouter le patient à la liste locale
    patients.value.push({ 
      nom: `${nouveauPatient.value.first_name} ${nouveauPatient.value.last_name}`,
      id: createdPatient.patient.id
    });
    
    // Sélectionner automatiquement le nouveau patient
    selectedPatient.value = patients.value[patients.value.length - 1];
    
    // Afficher un message de succès
    showNotification(toast, 'Patient ajouté avec succès', 'success');
    
    // Fermer le dialog
    fermerDialogPatient();
    
  } catch (error) {
    // Gérer les erreurs
    showNotification(toast, error.message || 'Échec de l\'ajout du patient', 'error');
  }
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