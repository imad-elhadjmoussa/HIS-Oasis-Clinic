<template>
    <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-slate-100">
        <!-- Top Navigation Bar -->
        <div class="bg-white/95 backdrop-blur-xl shadow-md border-b border-gray-200/50 animate-fade-in-down">
            <div class="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                <div class="flex items-center">
                    <div class="relative group hover:scale-105 transition-transform duration-300 cursor-pointer">
                        <img src="../../assets/logo.jpg" alt="Hospital Logo"
                            class="h-12 w-auto mr-4 rounded-lg shadow-md transition-all duration-300 group-hover:shadow-lg ring-1 ring-gray-200">
                        <div
                            class="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-teal-600/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        </div>
                    </div>
                    <div class="hidden sm:block">
                        <h1 class="text-2xl font-bold text-gray-800 animate-fade-in">
                            OASIS CLINIC
                        </h1>
                        <p class="text-xs text-gray-500 font-medium tracking-wide animate-fade-in-delayed">
                            Hospital Information System
                        </p>
                    </div>
                </div>
                <div class="flex items-center space-x-4">
                    <!-- User Info -->
                    <div class="relative hover:scale-110 transition-transform duration-300">
                        <Avatar :icon="userStore.user ? 'pi pi-user' : 'pi pi-spinner pi-spin'" shape="circle"
                            class="bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-md ring-2 ring-white" />
                        <div class="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"
                            v-if="userStore.isAuthenticated"></div>
                    </div>
                    <div class="hidden md:block text-right mr-4 animate-slide-in-right" v-if="userStore.user">
                        <p class="text-sm font-semibold text-gray-800">{{ userStore.fullName }}</p>
                        <p class="text-xs text-blue-600 capitalize">{{ userStore.role }}</p>
                    </div>

                    <div class="hover:scale-105 transition-transform duration-300">
                        <Button label="Logout" icon="pi pi-sign-out" severity="danger"
                            class="p-button-text p-button-sm text-gray-600 hover:text-red-600 transition-all duration-300"
                            @click="logout" :loading="userStore.loading" />
                    </div>
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
            </div>

            <!-- Cards Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <!-- Reception Card -->

                <div class="group relative bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl border border-gray-200/60 cursor-pointer transition-all duration-300 overflow-hidden hover:scale-102 hover:-translate-y-2 animate-fade-in-up"
                    style="animation-delay: 0.3s" @click="navigateTo('/reception')">
                    <div
                        class="absolute inset-0 bg-gradient-to-br from-teal-600/5 via-transparent to-teal-700/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    </div>
                    <div
                        class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-teal-100/40 to-transparent rounded-full -translate-y-12 translate-x-12">
                    </div>

                    <div class="relative z-10">
                        <div class="bg-gradient-to-br from-teal-600 to-teal-700 p-5 rounded-xl mb-6 transition-all duration-300 shadow-md relative z-20 group-hover:rotate-3 group-hover:scale-110"
                            style="width: 70px; height: 70px;">
                            <i
                                class="pi pi-calendar text-white text-2xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></i>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-800 mb-3 group-hover:text-teal-700 transition-all duration-300 relative z-10 group-hover:-translate-y-1"
                            style="text-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                            Reception
                        </h3>
                        <p class="text-gray-600 text-sm leading-relaxed relative z-10">
                            Appointment management, patient reception and medical records
                        </p>
                        <div
                            class="mt-6 flex items-center text-teal-700 transition-transform duration-300 relative z-10 group-hover:translate-x-1">
                            <span class="font-medium text-sm">Access module</span>
                            <i class="pi pi-arrow-right ml-2 text-sm"></i>
                        </div>
                    </div>
                </div>
                    <!-- chashier Card -->
                <div class="group relative bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl border border-gray-200/60 cursor-pointer transition-all duration-300 overflow-hidden hover:scale-102 hover:-translate-y-2 animate-fade-in-up"
                    style="animation-delay: 0.5s" @click="navigateTo('/cashier')">
                    <div
                        class="absolute inset-0 bg-gradient-to-br from-emerald-600/5 via-transparent to-emerald-700/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    </div>
                    <div
                        class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-100/40 to-transparent rounded-full -translate-y-12 translate-x-12">
                    </div>

                    <div class="relative z-10">
                        <div class="bg-gradient-to-br from-emerald-600 to-emerald-700 p-5 rounded-xl mb-6 transition-all duration-300 shadow-md relative z-20 group-hover:rotate-3 group-hover:scale-110"
                            style="width: 70px; height: 70px;">
                            <i
                                class="pi pi-credit-card text-white text-2xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></i>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-800 mb-3 group-hover:text-emerald-700 transition-all duration-300 relative z-10 group-hover:-translate-y-1"
                            style="text-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                            Cashier
                        </h3>
                        <p class="text-gray-600 text-sm leading-relaxed relative z-10">
                            Payment tracking and transactions
                        </p>
                        <div
                            class="mt-6 flex items-center text-emerald-700 transition-transform duration-300 relative z-10 group-hover:translate-x-1">
                            <span class="font-medium text-sm">Access module</span>
                            <i class="pi pi-arrow-right ml-2 text-sm"></i>
                        </div>
                    </div>
                </div>
                 <!-- Reports Card -->
                <div class="group relative bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl border border-gray-200/60 cursor-pointer transition-all duration-300 overflow-hidden hover:scale-102 hover:-translate-y-2 animate-fade-in-up"
                    style="animation-delay: 0.7s" @click="navigateTo('/facturation')">
                    <div
                        class="absolute inset-0 bg-gradient-to-br from-rose-600/5 via-transparent to-rose-700/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    </div>
                    <div
                        class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-rose-100/40 to-transparent rounded-full -translate-y-12 translate-x-12">
                    </div>

                    <div class="relative z-10">
                        <div class="bg-gradient-to-br from-rose-600 to-rose-700 p-5 rounded-xl mb-6 transition-all duration-300 shadow-md relative z-20 group-hover:rotate-3 group-hover:scale-110"
                            style="width: 70px; height: 70px;">
                            <i
                                class="pi pi-chart-bar text-white text-2xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></i>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-800 mb-3 group-hover:text-rose-700 transition-all duration-300 relative z-10 group-hover:-translate-y-1"
                            style="text-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                            Billing Office
                        </h3>
                        <p class="text-gray-600 text-sm leading-relaxed relative z-10">
                            Manage invoices, and financial records for the clinic.
                        </p>
                        <div
                            class="mt-6 flex items-center text-rose-700 transition-transform duration-300 relative z-10 group-hover:translate-x-1">
                            <span class="font-medium text-sm">Access module</span>
                            <i class="pi pi-arrow-right ml-2 text-sm"></i>
                        </div>
                    </div>
                </div>
                 <!-- Contracts Card -->
                <div class="group relative bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl border border-gray-200/60 cursor-pointer transition-all duration-300 overflow-hidden hover:scale-102 hover:-translate-y-2 animate-fade-in-up"
                    style="animation-delay: 0.6s" @click="navigateTo('/conventionoffice')">
                    <div
                        class="absolute inset-0 bg-gradient-to-br from-amber-600/5 via-transparent to-amber-700/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    </div>
                    <div
                        class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-100/40 to-transparent rounded-full -translate-y-12 translate-x-12">
                    </div>

                    <div class="relative z-10">
                        <div class="bg-gradient-to-br from-amber-600 to-amber-700 p-5 rounded-xl mb-6 transition-all duration-300 shadow-md relative z-20 group-hover:rotate-3 group-hover:scale-110"
                            style="width: 70px; height: 70px;">
                            <i
                                class="pi pi-file-edit text-white text-2xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></i>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-800 mb-3 group-hover:text-amber-700 transition-all duration-300 relative z-10 group-hover:-translate-y-1"
                            style="text-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                            Contract Management
                        </h3>
                        <p class="text-gray-600 text-sm leading-relaxed relative z-10">
                            Administration and analysis of contracts with partners
                        </p>
                        <div
                            class="mt-6 flex items-center text-amber-700 transition-transform duration-300 relative z-10 group-hover:translate-x-1">
                            <span class="font-medium text-sm">Access module</span>
                            <i class="pi pi-arrow-right ml-2 text-sm"></i>
                        </div>
                    </div>
                </div>
                <!-- User Management Card -->
                <div class="group relative bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl border border-gray-200/60 cursor-pointer transition-all duration-300 overflow-hidden hover:scale-102 hover:-translate-y-2 animate-fade-in-up"
                    style="animation-delay: 0.2s" @click="navigateTo('/users')">
                    <div
                        class="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-blue-700/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    </div>
                    <div
                        class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100/40 to-transparent rounded-full -translate-y-12 translate-x-12">
                    </div>

                    <div class="relative z-10">
                        <div class="bg-gradient-to-br from-blue-600 to-blue-700 p-5 rounded-xl mb-6 transition-all duration-300 shadow-md relative z-20 group-hover:rotate-3 group-hover:scale-110"
                            style="width: 70px; height: 70px;">
                            <i
                                class="pi pi-users text-white text-2xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></i>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-800 mb-3 group-hover:text-blue-700 transition-all duration-300 relative z-10 group-hover:-translate-y-1"
                            style="text-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                            User Management
                        </h3>
                        <p class="text-gray-600 text-sm leading-relaxed relative z-10">
                            Administration of user accounts and access permissions management
                        </p>
                        <div
                            class="mt-6 flex items-center text-blue-700 transition-transform duration-300 relative z-10 group-hover:translate-x-1">
                            <span class="font-medium text-sm">Access module</span>
                            <i class="pi pi-arrow-right ml-2 text-sm"></i>
                        </div>
                    </div>
                </div>

                

                <!-- Preferences Card -->
                <div class="group relative bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl border border-gray-200/60 cursor-pointer transition-all duration-300 overflow-hidden hover:scale-102 hover:-translate-y-2 animate-fade-in-up"
                    style="animation-delay: 0.4s" @click="navigateTo('/preferences/specialties')">
                    <div
                        class="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-transparent to-violet-700/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    </div>
                    <div
                        class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-violet-100/40 to-transparent rounded-full -translate-y-12 translate-x-12">
                    </div>

                    <div class="relative z-10">
                        <div class="bg-gradient-to-br from-violet-600 to-violet-700 p-5 rounded-xl mb-6 transition-all duration-300 shadow-md relative z-20 group-hover:rotate-3 group-hover:scale-110"
                            style="width: 70px; height: 70px;">
                            <i
                                class="pi pi-cog text-white text-2xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></i>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-800 mb-3 group-hover:text-violet-700 transition-all duration-300 relative z-10 group-hover:-translate-y-1"
                            style="text-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                            Preferences
                        </h3>
                        <p class="text-gray-600 text-sm leading-relaxed relative z-10">
                            Configuration of doctors, specialties and system parameters
                        </p>
                        <div
                            class="mt-6 flex items-center text-violet-700 transition-transform duration-300 relative z-10 group-hover:translate-x-1">
                            <span class="font-medium text-sm">Access module</span>
                            <i class="pi pi-arrow-right ml-2 text-sm"></i>
                        </div>
                    </div>
                </div>

            

               

               
            </div>

            <!-- System Status -->
            <div class="mt-8 bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/60 animate-fade-in"
                style="animation-delay: 0.8s">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <div class="bg-green-100 p-3 rounded-lg animate-bounce-gentle">
                            <i class="pi pi-shield text-green-600 text-xl"></i>
                        </div>
                        <div>
                            <h4 class="font-semibold text-gray-800">System Operational</h4>
                            <p class="text-sm text-gray-600">All services are functioning normally</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-6 text-sm text-gray-600">
                        <div class="flex items-center hover:scale-110 transition-transform duration-300">
                            <div class="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                            <span>Database</span>
                        </div>
                        <div class="flex items-center hover:scale-110 transition-transform duration-300">
                            <div class="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                            <span>Server</span>
                        </div>
                        <div class="flex items-center hover:scale-110 transition-transform duration-300">
                            <div class="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
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

<style scoped>
/* Custom animations using CSS instead of Framer Motion */
@keyframes fadeInDown {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes slideInRight {
    from {
        opacity: 0;
        transform: translateX(20px);
    }

    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes bounceGentle {

    0%,
    20%,
    50%,
    80%,
    100% {
        transform: translateY(0);
    }

    40% {
        transform: translateY(-5px);
    }

    60% {
        transform: translateY(-3px);
    }
}

.animate-fade-in-down {
    animation: fadeInDown 0.5s ease-out;
}

.animate-fade-in {
    animation: fadeIn 0.5s ease-out;
}

.animate-fade-in-delayed {
    animation: fadeIn 0.5s ease-out 0.3s both;
}

.animate-fade-in-up {
    animation: fadeInUp 0.5s ease-out both;
}

.animate-slide-in-right {
    animation: slideInRight 0.5s ease-out 0.4s both;
}

.animate-bounce-gentle {
    animation: bounceGentle 2s infinite;
}

/* Hover scale utilities */
.hover\:scale-102:hover {
    transform: scale(1.02);
}

/* Custom floating animation */
@keyframes float {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-5px);
    }
}

.floating {
    animation: float 3s ease-in-out infinite;
}

/* Custom glow effect */
.glow {
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
}

/* Custom text gradient */
.text-gradient {
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
}
</style>