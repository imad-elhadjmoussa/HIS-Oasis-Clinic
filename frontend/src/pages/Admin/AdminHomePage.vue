<template>
    <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-slate-100">
        <!-- Top Navigation Bar -->
        <div class="bg-white/95 backdrop-blur-xl shadow-md border-b border-gray-200/50">
            <div class="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                <div class="flex items-center">
                    <div class="relative group">
                        <img src="../../assets/logo.jpg" alt="Hospital Logo"
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
                        @click="logout" :loading="userStore.loading" />


                </div>
            </div>
        </div>

        <!-- Main Content -->
        <div class="max-w-7xl mx-auto px-6 py-6">
            <!-- Welcome Section -->
            <div class="text-center mb-8">
                <div v-if="userStore.loading" class="flex justify-center items-center py-8">
                    <i class="pi pi-spinner pi-spin text-2xl text-gray-500"></i>
                    <span class="ml-3 text-gray-600">Loading...</span>
                </div>
                <!-- <div v-else-if="userStore.user">
                    <h2 class="text-3xl font-bold text-gray-800 mb-2">
                        Welcome, {{ userStore.fullName }}
                    </h2>
                    <p class="text-gray-600 text-lg max-w-2xl mx-auto mb-4">
                        Quickly access the various management modules of your clinic
                    </p>
                    <div class="inline-flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                        <i class="pi pi-user mr-2"></i>
                        Logged in as {{ userStore.role }}
                    </div>
                </div> -->
                <!-- <div v-else>
                    <h2 class="text-3xl font-bold text-gray-800 mb-4">
                        Dashboard
                    </h2>
                    <p class="text-gray-600 text-lg max-w-2xl mx-auto">
                        Quickly access the various management modules of your clinic
                    </p>
                </div> -->
            </div>

            <!-- Cards Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <!-- User Management Card -->
                <div class="group relative bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl border border-gray-200/60 cursor-pointer transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                    @click="navigateTo('/users')">
                    <div
                        class="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-blue-700/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    </div>
                    <div
                        class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100/40 to-transparent rounded-full -translate-y-12 translate-x-12">
                    </div>

                    <div class="relative z-10">
                        <div
                            class="bg-gradient-to-br from-blue-600 to-blue-700 p-5 rounded-xl mb-6 group-hover:scale-105 transition-transform duration-300 shadow-md">
                            <i class="pi pi-users text-white text-2xl"></i>
                        </div>
                        <h3
                            class="text-xl font-semibold text-gray-800 mb-3 group-hover:text-blue-700 transition-colors duration-300">
                            User Management
                        </h3>
                        <p class="text-gray-600 text-sm leading-relaxed">
                            Administration of user accounts and access permissions management
                        </p>
                        <div
                            class="mt-6 flex items-center text-blue-700 group-hover:translate-x-1 transition-transform duration-300">
                            <span class="font-medium text-sm">Access module</span>
                            <i class="pi pi-arrow-right ml-2 text-sm"></i>
                        </div>
                    </div>
                </div>

                <!-- Reception Card -->
                <div class="group relative bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl border border-gray-200/60 cursor-pointer transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                    @click="navigateTo('/reception')">
                    <div
                        class="absolute inset-0 bg-gradient-to-br from-teal-600/5 via-transparent to-teal-700/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    </div>
                    <div
                        class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-teal-100/40 to-transparent rounded-full -translate-y-12 translate-x-12">
                    </div>

                    <div class="relative z-10">
                        <div
                            class="bg-gradient-to-br from-teal-600 to-teal-700 p-5 rounded-xl mb-6 group-hover:scale-105 transition-transform duration-300 shadow-md">
                            <i class="pi pi-calendar text-white text-2xl"></i>
                        </div>
                        <h3
                            class="text-xl font-semibold text-gray-800 mb-3 group-hover:text-teal-700 transition-colors duration-300">
                            Reception
                        </h3>
                        <p class="text-gray-600 text-sm leading-relaxed">
                            Appointment management, patient reception and medical records
                        </p>
                        <div
                            class="mt-6 flex items-center text-teal-700 group-hover:translate-x-1 transition-transform duration-300">
                            <span class="font-medium text-sm">Access module</span>
                            <i class="pi pi-arrow-right ml-2 text-sm"></i>
                        </div>
                    </div>
                </div>

                <!-- Preferences Card -->
                <div class="group relative bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl border border-gray-200/60 cursor-pointer transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                    @click="navigateTo('/preferences')">
                    <div
                        class="absolute inset-0 bg-gradient-to-br from-slate-600/5 via-transparent to-slate-700/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    </div>
                    <div
                        class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-slate-100/40 to-transparent rounded-full -translate-y-12 translate-x-12">
                    </div>

                    <div class="relative z-10">
                        <div
                            class="bg-gradient-to-br from-slate-600 to-slate-700 p-5 rounded-xl mb-6 group-hover:scale-105 transition-transform duration-300 shadow-md">
                            <i class="pi pi-cog text-white text-2xl"></i>
                        </div>
                        <h3
                            class="text-xl font-semibold text-gray-800 mb-3 group-hover:text-slate-700 transition-colors duration-300">
                            Settings
                        </h3>
                        <p class="text-gray-600 text-sm leading-relaxed">
                            Configuration of doctors, specialties and system parameters
                        </p>
                        <div
                            class="mt-6 flex items-center text-slate-700 group-hover:translate-x-1 transition-transform duration-300">
                            <span class="font-medium text-sm">Access module</span>
                            <i class="pi pi-arrow-right ml-2 text-sm"></i>
                        </div>
                    </div>
                </div>

                <!-- Billing Card -->
                <div class="group relative bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl border border-gray-200/60 cursor-pointer transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                    @click="navigateTo('/cashier')">
                    <div
                        class="absolute inset-0 bg-gradient-to-br from-green-600/5 via-transparent to-green-700/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    </div>
                    <div
                        class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-100/40 to-transparent rounded-full -translate-y-12 translate-x-12">
                    </div>

                    <div class="relative z-10">
                        <div
                            class="bg-gradient-to-br from-green-600 to-green-700 p-5 rounded-xl mb-6 group-hover:scale-105 transition-transform duration-300 shadow-md">
                            <i class="pi pi-credit-card text-white text-2xl"></i>
                        </div>
                        <h3
                            class="text-xl font-semibold text-gray-800 mb-3 group-hover:text-green-700 transition-colors duration-300">
                            Billing
                        </h3>
                        <p class="text-gray-600 text-sm leading-relaxed">
                            Invoice generation, payment tracking and transactions
                        </p>
                        <div
                            class="mt-6 flex items-center text-green-700 group-hover:translate-x-1 transition-transform duration-300">
                            <span class="font-medium text-sm">Access module</span>
                            <i class="pi pi-arrow-right ml-2 text-sm"></i>
                        </div>
                    </div>
                </div>

                <!-- Financial Management Card -->
                <div class="group relative bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl border border-gray-200/60 cursor-pointer transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                    @click="navigateTo('/billing')">
                    <div
                        class="absolute inset-0 bg-gradient-to-br from-indigo-600/5 via-transparent to-indigo-700/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    </div>
                    <div
                        class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-100/40 to-transparent rounded-full -translate-y-12 translate-x-12">
                    </div>

                    <div class="relative z-10">
                        <div
                            class="bg-gradient-to-br from-indigo-600 to-indigo-700 p-5 rounded-xl mb-6 group-hover:scale-105 transition-transform duration-300 shadow-md">
                            <i class="pi pi-wallet text-white text-2xl"></i>
                        </div>
                        <h3
                            class="text-xl font-semibold text-gray-800 mb-3 group-hover:text-indigo-700 transition-colors duration-300">
                            Financial Management
                        </h3>
                        <p class="text-gray-600 text-sm leading-relaxed">
                            Financial analysis, reporting and clinic revenue tracking
                        </p>
                        <div
                            class="mt-6 flex items-center text-indigo-700 group-hover:translate-x-1 transition-transform duration-300">
                            <span class="font-medium text-sm">Access module</span>
                            <i class="pi pi-arrow-right ml-2 text-sm"></i>
                        </div>
                    </div>
                </div>

                <!-- Contracts Card -->
                <div class="group relative bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl border border-gray-200/60 cursor-pointer transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                    @click="navigateTo('/beraucontracts')">
                    <div
                        class="absolute inset-0 bg-gradient-to-br from-gray-600/5 via-transparent to-gray-700/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    </div>
                    <div
                        class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-100/40 to-transparent rounded-full -translate-y-12 translate-x-12">
                    </div>

                    <div class="relative z-10">
                        <div
                            class="bg-gradient-to-br from-gray-600 to-gray-700 p-5 rounded-xl mb-6 group-hover:scale-105 transition-transform duration-300 shadow-md">
                            <i class="pi pi-file-edit text-white text-2xl"></i>
                        </div>
                        <h3
                            class="text-xl font-semibold text-gray-800 mb-3 group-hover:text-gray-700 transition-colors duration-300">
                            Contract Management
                        </h3>
                        <p class="text-gray-600 text-sm leading-relaxed">
                            Administration and analysis of contracts with partners
                        </p>
                        <div
                            class="mt-6 flex items-center text-gray-700 group-hover:translate-x-1 transition-transform duration-300">
                            <span class="font-medium text-sm">Access module</span>
                            <i class="pi pi-arrow-right ml-2 text-sm"></i>
                        </div>
                    </div>
                </div>
            </div>

            <!-- System Status -->
            <div class="mt-8 bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/60">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <div class="bg-green-100 p-3 rounded-lg">
                            <i class="pi pi-shield text-green-600 text-xl"></i>
                        </div>
                        <div>
                            <h4 class="font-semibold text-gray-800">System Operational</h4>
                            <p class="text-sm text-gray-600">All services are functioning normally</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-6 text-sm text-gray-600">
                        <div class="flex items-center">
                            <div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <span>Database</span>
                        </div>
                        <div class="flex items-center">
                            <div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <span>Server</span>
                        </div>
                        <div class="flex items-center">
                            <div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <span>Security</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';
import Button from 'primevue/button';
import Avatar from 'primevue/avatar';
import { useUserStore } from '../../stors/user';

const router = useRouter();
const userStore = useUserStore();

onMounted(async () => {
    if (!userStore.user) {
        await userStore.fetchSession();
    }
});

const navigateTo = (url) => {
    router.push(url);
};

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