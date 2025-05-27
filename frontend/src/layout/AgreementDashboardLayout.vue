<script setup>
import { ref, onMounted, watchEffect } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useToast } from "primevue/usetoast";
import Button from "primevue/button";
import Toast from "primevue/toast";
import { logoutUser } from "../api/auth"; // Assuming you have an auth API
import { useUserStore } from './../stors/user';

const userStore = useUserStore();  // Pinia store for user
const isCollapsed = ref(false);
const router = useRouter();
const route = useRoute();
const toast = useToast();

// Fetch session if not loaded yet
onMounted(() => {
    if (!userStore.user && !userStore.loading) {
        userStore.fetchSession();  // Fetch user session on mount
    }
});

// Toggle sidebar
const toggleSidebar = () => {
    isCollapsed.value = !isCollapsed.value;
};

// Base menu items
const baseMenuItems = [
    { label: "Dashboard", icon: "pi pi-chart-bar", route: "/", exact: true },
    { label: "Companies", icon: "pi pi-building", route: "/companies" },
    { label: "Settings", icon: "pi pi-cog", route: "/settings" },
    { label: "Logout", icon: "pi pi-sign-out", action: "logout" }
];

// Dynamically adjust routes based on user role (from Pinia store)
const menuItems = ref([]);

watchEffect(() => {
    if (userStore.role) {
        menuItems.value = baseMenuItems.map(item => {
            if (item.action) return item; // Skip logout item

            // For Admin, prepend '/conventionoffice' to routes
            if (userStore.role === 'Admin') {
                return {
                    ...item,
                    route: `/conventionoffice${item.route}`
                };
            }
            return item;
        });
    } else {
        // Default to base menu items if role is not loaded yet
        menuItems.value = baseMenuItems;
    }
});

// Check if route is active
const isActiveRoute = (menuItem) => {
    if (menuItem.action) return false;
    if (menuItem.exact) {
        return route.path === menuItem.route;
    }
    return route.path.startsWith(menuItem.route);
};

// Navigate to a route
const navigateTo = (path) => {
    router.push(path).catch(() => { });
};

// Navigate to root based on role
const goToRoot = () => {
    const rootPath = userStore.role === 'Admin' ? '/' : '/';
    navigateTo(rootPath);
};

const logout = async () => {
    try {
        await logoutUser();

        // Clear user data in the Pinia store
        userStore.logout();

        // Clear user data from storage
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');

        toast.add({
            severity: 'success',
            summary: 'Logged out',
            detail: 'You have been successfully logged out.',
            life: 3000,
        });

        setTimeout(() => {
            router.push('/login');
        }, 2000);
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Logout failed. Please try again.',
            life: 3000,
        });
    }
};
</script>

<template>
    <Toast />
    <div class="flex">
        <!-- Sidebar -->
        <div :class="isCollapsed ? 'w-[80px]' : 'w-[250px]'"
            class="h-screen z-20 bg-[#021526] border-r-[0.5px] overflow-hidden shadow-sm border-gray-200 text-gray-200 fixed bottom-0 top-0 left-0 transition-all duration-300 flex flex-col p-4">

            <!-- Sidebar Header -->
            <div class="flex items-center justify-between mb-6">
                <img @click="goToRoot" class="w-10 h-10 rounded-full cursor-pointer" src="./../assets/logo.jpg" alt="Logo">
                <Button v-if="!isCollapsed" @click="toggleSidebar" icon="pi pi-times" severity="danger" variant="text"
                    rounded aria-label="Cancel" />
            </div>

            <!-- Sidebar Menu -->
            <ul class="space-y-2">
                <template v-for="(item, index) in menuItems" :key="index">
                    <li v-if="item.action === 'logout'" @click="logout"
                        class="flex items-center gap-3 py-2 px-4 text-md rounded-md hover:bg-red-600/70 cursor-pointer transition bg-red-600/50">
                        <i :class="item.icon"></i>
                        <span class="inline-block text-nowrap" v-if="!isCollapsed">{{ item.label }}</span>
                    </li>

                    <li v-else @click="navigateTo(item.route)" :class="[
                        'flex items-center gap-3 py-2 px-4 text-md rounded-md hover:bg-gray-800 transition cursor-pointer',
                        { 'bg-gray-800': isActiveRoute(item) }]">
                        <i :class="item.icon"></i>
                        <span class="inline-block text-nowrap" v-if="!isCollapsed">{{ item.label }}</span>
                    </li>
                </template>
            </ul>
        </div>

        <!-- Main Content -->
        <div :class="isCollapsed ? 'ml-[80px] w-[calc(100%-80px)]' : 'ml-[250px] w-[calc(100%-250px)]'"
            class="transition-all min-h-screen bg-gray-50">
            <!-- Page Content -->
            <div class="p-6">
                <router-view />
            </div>
        </div>
    </div>
</template>

<style scoped>
.transition-all {
    transition: all 0.3s ease-in-out;
}
</style>