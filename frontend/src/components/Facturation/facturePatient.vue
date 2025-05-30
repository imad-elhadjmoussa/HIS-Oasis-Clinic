<template>
  <div class="p-6 bg-white shadow-md rounded-md max-w-4xl mx-auto">
    <!-- Informations -->
    <div class="mb-6 border-b pb-4">
      <p><strong>Nom Entreprise :</strong> {{ facture.entreprise }}</p>
      <p><strong>Nom Patient :</strong> {{ facture.patient }}</p>
      <p><strong>N° Facture :</strong> {{ facture.invoice_patient_number }}</p>
      <p><strong>Date Admission :</strong> {{ facture.dateAdmission }}</p>
    </div>

    <!-- Tableau prestations -->
    <!-- Tableau prestations -->
<div class="overflow-x-auto">
  <DataTable :value="facture.prestations" class="min-w-full" removableSort>
    <Column field="prestation" header="Prestation" sortable />
    <Column field="date" header="Date" sortable />
    <Column field="montantHT" header="Montant HT" sortable>
      <template #body="{ data }">
        {{ formatCurrency(data.montantHT) }}
      </template>
    </Column>
    <Column field="tva" header="TVA" sortable>
      <template #body="{ data }">
        {{ formatCurrency(data.tva) }}
      </template>
    </Column>
    <Column field="ttc" header="TTC" sortable>
      <template #body="{ data }">
        {{ formatCurrency(data.ttc) }}
      </template>
    </Column>
    <!-- <Column header="Actions">
      <template #body="{ index }">
        <Button icon="pi pi-pencil" class="p-button-rounded p-button-text p-button-sm mr-2" @click="editPrestation(index)" />
        <Button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger p-button-sm" @click="deletePrestation(index)" />
      </template>
    </Column> -->
  </DataTable>
</div>


    <!-- Totaux -->
    <div class="mt-4 p-4 bg-gray-100 rounded-md">
      <p><strong>Total HT :</strong> {{ formatCurrency(totalHT) }}</p>
      <p><strong>TVA Totale :</strong> {{ formatCurrency(totalTVA) }}</p>
      <p><strong>Total TTC :</strong> {{ formatCurrency(totalTTC) }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';

const route = useRoute();
const patientId = route.params.patientId || route.params.id;

const facture = ref({
  id: route.params.id,
  entreprise: '',
  patient: '',
  dateAdmission: '',
  prestations: []
});

onMounted(async () => {

  try {
    const response = await axios.get(`http://localhost:5000/api/facturation/patients/${patientId}/prestations/examiner-done`);
    console.log(response.data);
    const data = response.data;

    const parseDate = (dateStr) => {
      if (!dateStr) return new Date().toISOString().split('T')[0];
      return dateStr.split('T')[0];
    };

    const parsePrestation = (p) => {
      const montantHT = p.price - p.patient_part;
      const tvaRate = p.tva ?? 9.0;
      const tva = (tvaRate / 100) * montantHT;
      return {
        prestation: p.prestation_name,
        date: parseDate(p.date || p.created_at),
        montantHT,
        tvaRate,
        tva,
        ttc: montantHT + tva
      };
    };

    if (Array.isArray(data) && data.length > 0) {
      facture.value.prestations = data.map(parsePrestation);
      
      // Set company name, invoice number, and admission date from the first record
      // (assuming all prestations are for the same patient/invoice)
      const firstRecord = data[0];
      facture.value.entreprise = firstRecord.company_name || '';
      facture.value.invoice_patient_number = firstRecord.invoice_patient_number || '';
      facture.value.dateAdmission = parseDate(firstRecord.date_admission);
      
      // Set patient name
      facture.value.patient = `${firstRecord.first_name} ${firstRecord.last_name}`;
    } else {
      // Fallback: get patient info separately if no prestations found
      // const patientRes = await axios.get(`http://localhost:5000/api/facturation/patients/${patientId}`);
      // if (patientRes.data) {
      //   facture.value.patient = `${patientRes.data.first_name} ${patientRes.data.last_name}`;
      // }
    }
  } catch (err) {
    console.error("Erreur lors du chargement des prestations:", err);
  }
});

const newPrestation = ref({ prestation: '', date: '', montantHT: 0, tvaRate: 10 });
const isEditing = ref(false);
const editingIndex = ref(null);

const savePrestation = () => {
  const { prestation, date, montantHT, tvaRate } = newPrestation.value;
  const tva = montantHT * (tvaRate / 100);
  const ttc = montantHT + tva;
  const data = { prestation, date, montantHT, tvaRate, tva, ttc };

  if (isEditing.value) {
    facture.value.prestations[editingIndex.value] = data;
  } else {
    facture.value.prestations.push(data);
  }
  resetForm();
};

const editPrestation = (index) => {
  newPrestation.value = { ...facture.value.prestations[index] };
  isEditing.value = true;
  editingIndex.value = index;
};

const deletePrestation = (index) => {
  if (confirm('Supprimer cette prestation ?')) {
    facture.value.prestations.splice(index, 1);
  }
};

const cancelEdit = () => resetForm();

const resetForm = () => {
  newPrestation.value = { prestation: '', date: '', montantHT: 0, tvaRate: 10 };
  isEditing.value = false;
  editingIndex.value = null;
};

const totalHT = computed(() => facture.value.prestations.reduce((sum, p) => sum + p.montantHT, 0));
const totalTVA = computed(() => facture.value.prestations.reduce((sum, p) => sum + p.tva, 0));
const totalTTC = computed(() => facture.value.prestations.reduce((sum, p) => sum + p.ttc, 0));

const formatCurrency = (value) => value.toLocaleString('fr-FR', { style: 'currency', currency: 'DZD' });
</script>

<style scoped>
strong {
  color: #333;
}
</style>