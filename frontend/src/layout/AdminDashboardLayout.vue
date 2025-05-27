<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import Button from "primevue/button";
import Toast from "primevue/toast";
import { logoutUser } from "../api/auth";

const isCollapsed = ref(false);
const router = useRouter();
const toast = useToast();

const toggleSidebar = () => {
    isCollapsed.value = !isCollapsed.value;
};

const menuItems = [
    { label: "Users", icon: "pi pi-users", route: "/users" },
    // { label: "Roles & Services", icon: "pi pi-shield", route: "/roles-services" },
    { label: "Preferences", icon: "pi pi-users", route: "/preferences" },
    { label: "Reception", icon: "pi pi-bell", route: "/reception" },
    { label: "Agreement", icon: "pi pi-file", route: "/agreement" },
    { label: "Service Manager", icon: "pi pi-briefcase", route: "/service-manager" },
    { label: "Facturation", icon: "pi pi-credit-card", route: "/facturation" },
    { label: "Cashier", icon: "pi pi-wallet", route: "/cashier" },
    { label: "Settings", icon: "pi pi-cog", route: "/settings" },
    { label: "Logout", icon: "pi pi-sign-out", action: "logout" } // Logout without a route
];


</script>

<template>
    <Toast />

    <div :class="isCollapsed ? 'w-[80px]' : 'w-[250px]'"
        class="h-screen z-20 bg-[#021526] border-r-[0.5px] overflow-hidden shadow-sm border-gray-200 text-gray-200 fixed bottom-0 top-0 left-0 transition-all duration-300 flex flex-col p-4">
        <!-- Sidebar Header -->
        <div class="flex items-center justify-between mb-6">
            <img @click="toggleSidebar" class="w-10 h-10 rounded-full cursor-pointer" src="./../assets/logo.jpg"
                alt="Logo">
            <Button v-if="!isCollapsed" @click="toggleSidebar" icon="pi pi-times" severity="danger" variant="text"
                rounded aria-label="Cancel" />
        </div>

        <!-- Sidebar Menu -->
        <ul class="space-y-2">
            <template v-for="(item, index) in menuItems" :key="index">
                <!-- Logout button instead of a route -->
                <li v-if="item.action === 'logout'" @click="logoutUser(toast)"
                    class="flex items-center gap-3 py-2 px-4 text-md rounded-md hover:bg-red-600 cursor-pointer transition">
                    <i :class="item.icon"></i>
                    <span class="inline-block text-nowrap" v-if="!isCollapsed">{{ item.label }}</span>
                </li>

                <!-- Regular navigation links -->
                <router-link v-else :to="item.route"
                    class="flex items-center gap-3 py-2 px-4 text-md rounded-md hover:bg-gray-800 transition">
                    <i :class="item.icon"></i>
                    <span class="inline-block text-nowrap" v-if="!isCollapsed">{{ item.label }}</span>
                </router-link>
            </template>
        </ul>
    </div>

    <div :class="isCollapsed ? 'ml-[80px] w-[calc(100%-80px)]' : 'ml-[250px] w-[calc(100%-250px)]'"
        class=" transition-all p-6">
        <RouterView />
    </div>
</template>

<style scoped>
.transition-all {
    transition: all 0.3s ease-in-out;
}
</style>
