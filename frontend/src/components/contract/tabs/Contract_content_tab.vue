<script setup>
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";
import Agreement_table  from '../tables/Agreement_table.vue';
import Agreement_para_table  from '../tables/Agreement_para_table.vue';
import Annex_table  from '../tables/Annex_table.vue';
import Avenant_table  from '../tables/Avenant_table.vue';

import { ref, computed , defineProps } from "vue";
const props = defineProps({
    contractState: String,
    contractid: String,
    isgeneral: String
});
</script>
<template>
  <section>        
        <TabView>
            <TabPanel header="Agreement">
                <Agreement_table :contractState="contractState"  :contractid="contractid" />
            </TabPanel>
            
            <TabPanel header="Configurable Agreement">
                <Agreement_para_table :contractState="contractState" :avenantpage="'no'" :contractid="contractid"/>
            </TabPanel>

            <TabPanel header="Annex">
                <Annex_table :contractState="contractState" :contractId="contractid" :isgeneral="props.isgeneral" />
            </TabPanel>
            <TabPanel v-if="contractState === 'Active' || contractState === 'Expired'" header="Avenant" :contractid="contractid">
                <Avenant_table :contractState="contractState" :contractid="contractid"/>
            </TabPanel>
        </TabView>

        

        

        

        
    </section>
</template>