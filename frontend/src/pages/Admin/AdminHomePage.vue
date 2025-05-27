<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Top Navigation Bar -->
        <div class="bg-white shadow-sm">
            <div class="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                <div class="flex items-center">
                    <img src="../assets/logo.jpg" alt="Hospital Logo" class="h-8 mr-4">
                </div>
                <div class="flex items-center space-x-4">
                    <Button label="Logout" icon="pi pi-sign-out"
                        class="p-button-text p-button-sm text-gray-600 hover:text-red-500" @click="logout" />
                    <Avatar icon="pi pi-user" shape="circle" />
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <div class="max-w-7xl mx-auto px-6 py-8">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Patient Management -->
                <div class="bg-blue-50 rounded-lg border border-blue-200 p-6 flex flex-col items-center text-center cursor-pointer hover:bg-blue-100 transition-colors"
                    @click="navigateTo('/users')">
                    <div class="bg-blue-100 p-4 rounded-full mb-4">
                        <i class="pi pi-users text-blue-600 text-2xl"></i>
                    </div>
                    <h2 class="text-lg font-medium text-gray-700 mb-2">Users</h2>
                    <p class="text-gray-500 text-sm">User Management</p>
                </div>

                <!-- Appointments -->
                <div class="bg-green-50 rounded-lg border border-green-200 p-6 flex flex-col items-center text-center cursor-pointer hover:bg-green-100 transition-colors"
                    @click="navigateTo('/reception')">
                    <div class="bg-green-100 p-4 rounded-full mb-4">
                        <i class="pi pi-calendar text-green-600 text-2xl"></i>
                    </div>
                    <h2 class="text-lg font-medium text-gray-700 mb-2">Reception</h2>
                    <p class="text-gray-500 text-sm">Manage patients and Medical Records</p>
                </div>

                <!-- Staff -->
                <div class="bg-purple-50 rounded-lg border border-purple-200 p-6 flex flex-col items-center text-center cursor-pointer hover:bg-purple-100 transition-colors"
                    @click="navigateTo('/preferences')">
                    <div class="bg-purple-100 p-4 rounded-full mb-4">
                        <i class="pi pi-id-card text-purple-600 text-2xl"></i>
                    </div>
                    <h2 class="text-lg font-medium text-gray-700 mb-2">Preferences</h2>
                    <p class="text-gray-500 text-sm">Manage doctors and Specialties</p>
                </div>

                <!-- Inventory -->
                <div class="bg-amber-50 rounded-lg border border-amber-200 p-6 flex flex-col items-center text-center cursor-pointer hover:bg-amber-100 transition-colors"
                    @click="navigateTo('/cashier')">
                    <div class="bg-amber-100 p-4 rounded-full mb-4">
                        <i class="pi pi-box text-amber-600 text-2xl"></i>
                    </div>
                    <h2 class="text-lg font-medium text-gray-700 mb-2">Billing</h2>
                    <p class="text-gray-500 text-sm">Manage invoices and payments</p>
                </div>

                <!-- Billing -->
                <div class="bg-emerald-50 rounded-lg border border-emerald-200 p-6 flex flex-col items-center text-center cursor-pointer hover:bg-emerald-100 transition-colors"
                    @click="navigateTo('/billing')">
                    <div class="bg-emerald-100 p-4 rounded-full mb-4">
                        <i class="pi pi-money-bill text-emerald-600 text-2xl"></i>
                    </div>
                    <h2 class="text-lg font-medium text-gray-700 mb-2">Billing</h2>
                    <p class="text-gray-500 text-sm">Manage invoices and payments</p>
                </div>

                <!-- Reports -->
                <div class="bg-red-50 rounded-lg border border-red-200 p-6 flex flex-col items-center text-center cursor-pointer hover:bg-red-100 transition-colors"
                    @click="navigateTo('/conventionoffice')">
                    <div class="bg-red-100 p-4 rounded-full mb-4">
                        <i class="pi pi-chart-bar text-red-600 text-2xl"></i>
                    </div>
                    <h2 class="text-lg font-medium text-gray-700 mb-2">Contracts</h2>
                    <p class="text-gray-500 text-sm">View analytics and insights</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import Avatar from 'primevue/avatar';

const router = useRouter();

const navigateTo = (url) => {
    router.push(url);
};

const logout = () => {
    // Add your logout logic here
    console.log('Logging out...');
    router.push('/login');
};
</script>