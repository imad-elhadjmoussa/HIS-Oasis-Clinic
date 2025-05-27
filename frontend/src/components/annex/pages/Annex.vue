<script setup>
import Annex_prestation_table from '../tables/Annex_prestation_table.vue';
import Annex_card from '../cards/Annex_card.vue';
import { onMounted, ref } from "vue";
import { useRoute } from 'vue-router';  // Import useRoute
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_SERVER_URL;
const route = useRoute();  // Access the route

// Get the id param from the route params
const id = route.params.id;

const annexData = ref(null);
const error = ref(null);

onMounted(async () => {
    try {
        if (id) {
            const response = await axios.get(`${API_BASE_URL}/api/convention/annexes/${id}`);
            console.log('Response data:', response.data);
            annexData.value = response.data;
        }
    } catch (err) {
        error.value = "Failed to load annex data";
        console.error(err);
    }
});
</script>
<template>
    <div class="content">
        <div class="title">
            <h1 id="maintitle">Annex</h1>
        </div>
        
        <div v-if="error">{{ error }}</div>
        <div v-if="annexData">
            <Annex_card
                :id="annexData.id"
                :contractId="annexData.contract_id"
                :name="annexData.annex_name"
                :description="annexData.specialty_name"
                :createdAt="annexData.created_at"
                :createdBy="annexData.created_by"
                :contractState="annexData.contract_status"
            />
        </div>

        <div class="title">
            <h1 id="contracts">Prestation</h1>
        </div>
        <Annex_prestation_table 
            v-if="annexData"
            :contractState="annexData.contract_status" 
            :avenantpage="'no'" 
            :annexId="id" 
        />
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
    margin-top: 40px;
    margin-bottom: 30px;
    font-weight: bold;
    font-size: 2rem;
}
.title #maintitle {
    margin-top: 20px;
    margin-bottom: 10px;
    font-weight: bold;
    font-size: 2rem;
}
#contracts {
    margin-top: 1rem;
}
</style>