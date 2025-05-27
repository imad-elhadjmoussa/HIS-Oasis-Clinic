<script setup lang="ts">
import { Button, Toast, useToast } from 'primevue';
import { logoutUser } from '../api/auth';

const toast=useToast();

</script>

<template>
    <Toast />
    <header class=" py-2 border-b-[1px] border-gray-200  ">
        <nav class="container flex justify-between items-center">
            <img src="../assets/logo.jpg" alt="Clinique Logo" class="w-12 h-12 rounded-full" />
            <!-- Logout btn -->
            <Button @click="logoutUser(toast)" label="Logout" icon="pi pi-power-off" class="p-button-danger p-button-rounded p-button-sm" />
        </nav>
    </header>

    <div class="container !my-4">
        <router-view></router-view>
    </div>
</template>

<style scoped>
.container {
    max-width: 1200px;
    margin: 0 auto;
}
</style>