<script setup>
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";
import Contract_table  from '../tables/Contract_table.vue';
import Contacts_table  from '../tables/Contacts_table.vue';


import { ref, computed , defineProps } from "vue";
const props = defineProps({
  companyId: String,
});
</script>
<template>
  <section>        
        <TabView>
            <TabPanel header="Contracts">
                <Contract_table :companyId="props.companyId"/>
            </TabPanel>
            
            <TabPanel header="Contacts">
                <Contacts_table :companyId="props.companyId" />
            </TabPanel>
        </TabView>

          

        
    </section>
</template>