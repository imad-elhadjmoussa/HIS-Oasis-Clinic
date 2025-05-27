<script setup lang="ts">
import { Toast } from 'primevue';


</script>

<template>


    <header class=" py-2 border-b-[1px] border-gray-200  ">
        <nav class="container">
            <img src="./../assets/logo.jpg" alt="Clinique Logo" class="w-13 h-13 rounded-full" />
        </nav>
    </header>

    <div class=" container my-4 ">
        <Toast />
        <router-view>

        </router-view>
    </div>


</template>



<style scoped>
.container {
    max-width: 1300px;
    margin: 0 auto;
    padding: 0 20px;
}
</style>
