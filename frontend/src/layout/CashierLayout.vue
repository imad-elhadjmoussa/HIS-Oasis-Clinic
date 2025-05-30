<script setup lang="ts">
import { Toast } from 'primevue';
import { useUserStore } from '../stors/user';
import Button from 'primevue/button';
import { useRouter } from 'vue-router';
import Avatar from 'primevue/avatar';

const router = useRouter();
const userStore = useUserStore();

const logout = async () => {
    try {
        await userStore.logout();
        router.push('/login');
    } catch (error) {
        console.error('Logout error:', error);
        router.push('/login');
    }
};


</script>

<template>


    <div class="bg-white/95 backdrop-blur-xl shadow-md border-b border-gray-200/50">
        <div class="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div class="flex items-center">
                <div class="relative group">
                    <img src="../assets/logo.jpg" alt="Hospital Logo"
                        class="h-12 w-auto mr-4 rounded-lg shadow-md transition-all duration-300 group-hover:shadow-lg ring-1 ring-gray-200">
                    <div
                        class="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-teal-600/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    </div>
                </div>
                <div class="hidden sm:block">
                    <h1 class="text-2xl font-bold text-gray-800">
                        OASIS CLINIC
                    </h1>
                    <p class="text-xs text-gray-500 font-medium tracking-wide">
                        Hospital Information System
                    </p>
                </div>
            </div>
            <div class="flex items-center space-x-4">
                <!-- User Info -->
                <div class="relative">
                    <Avatar :icon="userStore.user ? 'pi pi-user' : 'pi pi-spinner pi-spin'" shape="circle"
                        class="bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-md ring-2 ring-white" />
                    <div class="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
                        v-if="userStore.isAuthenticated"></div>
                </div>
                <div class="hidden md:block text-right mr-4" v-if="userStore.user">
                    <p class="text-sm font-semibold text-gray-800">{{ userStore.fullName }}</p>
                    <!-- <p class="text-xs text-gray-500">{{ userStore.email }}</p> -->
                    <p class="text-xs text-blue-600 capitalize">{{ userStore.role }}</p>
                </div>

                <Button label="Logout" icon="pi pi-sign-out"
                    class="p-button-text p-button-sm text-gray-600 hover:text-red-600 transition-all duration-300"
                    @click="logout" severity="danger" :loading="userStore.loading" />


            </div>
        </div>
    </div>

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
