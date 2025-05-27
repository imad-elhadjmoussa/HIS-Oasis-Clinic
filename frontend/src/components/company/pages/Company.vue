<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import Company_card from '../cards/Company_card.vue';
import Contract_contact_tab from '../tabs/Contract_contact_tab.vue';
const API_BASE_URL = import.meta.env.VITE_SERVER_URL;
// Get route parameters
const route = useRoute();
const id = route.params.id; // Get ID from route params

// Create reactive data variables
const company = ref({
  id: '',
  company_name: '',
  address: '',
  phone_number: '',
  email: ''
});

// Function to fetch company data
const fetchCompanyData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/convention/companies/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch company data');
    }
    const data = await response.json();
    company.value = data;
  } catch (error) {
    console.error('Error fetching company data:', error);
  }
};

// Fetch data when component is mounted
onMounted(() => {
  fetchCompanyData();
});
</script>

<template>
  <div class="content">
    <div class="title">
      <h1>Company</h1>
    </div>
    <!-- Pass the fetched data to Company_card -->
    <Company_card 
      :id="company.id" 
      :name="company.company_name" 
      :address="company.address" 
      :contact="company.contact" 
      :phone="company.phone_number" 
      :email="company.email" 
    />
    <div class="title">
      <h1 id="contracts">Company Content</h1>
    </div>
    <Contract_contact_tab :companyId="id" />
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
  margin-top: 10px;
  margin-bottom: 20px;
  font-weight: bold;
  font-size: 2rem;
}
#contracts {
  margin-top: 1rem;
}
</style>