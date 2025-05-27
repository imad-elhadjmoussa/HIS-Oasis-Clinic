<script setup>
import { ref, onMounted, watchEffect } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useToast } from "primevue/usetoast";
import Button from "primevue/button";
import Toast from "primevue/toast";
import Avatar from "primevue/avatar";
import { useUserStore } from './../stors/user';
import { logoutUser } from "../api/auth";

const isCollapsed = ref(false);
const router = useRouter();
const route = useRoute();
const toast = useToast();
const userStore = useUserStore();

onMounted(() => {
    if (!userStore.user && !userStore.loading) {
        userStore.fetchSession();
    }
});

const toggleSidebar = () => {
    isCollapsed.value = !isCollapsed.value;
};

// Base menu items - all top level
const baseMenuItems = [
    { label: "Dashboard", icon: "pi pi-home", route: "/", exact: true },
    { label: "Specialties", icon: "pi pi-briefcase", route: "/specialties" },
    { label: "Prestations", icon: "pi pi-list", route: "/prestations" },
    { label: "Doctors", icon: "pi pi-user", route: "/doctors" },
    { label: "Waiting Rooms", icon: "pi pi-clock", route: "/waiting-rooms" },
    { label: "Modalities", icon: "pi pi-cog", route: "/modalities" },
    { label: "Settings", icon: "pi pi-cog", route: "/settings" },
    { label: "Logout", icon: "pi pi-sign-out", action: "logout" }
];

const menuItems = ref([]);

watchEffect(() => {
    if (userStore.role) {
        menuItems.value = baseMenuItems.map(item => {
            if (item.action) return item; // Skip logout item
            
            // For Admin, prepend '/preferences' to specific routes
            if (userStore.role === 'Admin') {
                const adminPrefixedRoutes = ['/specialties', '/prestations', '/doctors',"/waiting-rooms", '/settings', '/modalities'];
                if (adminPrefixedRoutes.includes(item.route)) {
                    return {
                        ...item,
                        route: `/preferences${item.route}`
                    };
                }
            }
            return item;
        });
    }
});

const isActiveRoute = (menuItem) => {
    if (menuItem.action) return false;
    if (menuItem.exact) {
        return route.path === menuItem.route;
    }
    return route.path.startsWith(menuItem.route);
};

const navigateTo = (path) => {
    router.push(path).catch(() => { });
};

const goToRoot = () => {
    navigateTo('/');
};

const logout = async () => {
    try {
        await logoutUser();
        userStore.logout();
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
    <!-- Sidebar -->
    <div :class="isCollapsed ? 'w-[80px]' : 'w-[250px]'"
        class="h-screen z-20 bg-[#021526] border-r-[0.5px] overflow-hidden shadow-sm border-gray-200 text-gray-200 fixed bottom-0 top-0 left-0 transition-all duration-300 flex flex-col p-4">

        <div class="flex items-center justify-between mb-6">
            <img @click="goToRoot" class="w-10 h-10 rounded-full cursor-pointer" src="./../assets/logo.jpg" alt="Logo">
            <Button v-if="!isCollapsed" @click="toggleSidebar" icon="pi pi-times" severity="danger" variant="text"
                rounded aria-label="Cancel" />
        </div>

        <ul class="space-y-2">
            <template v-for="(item, index) in menuItems" :key="index">
                <!-- Logout Button -->
                <li v-if="item.action === 'logout'" @click="logout"
                    class="flex items-center gap-3 py-2 px-4 text-md rounded-md hover:bg-red-600/70 cursor-pointer transition bg-red-600/50">
                    <i :class="item.icon"></i>
                    <span class="inline-block text-nowrap" v-if="!isCollapsed">{{ item.label }}</span>
                </li>

                <!-- Regular Menu Items -->
                <li v-else @click="navigateTo(item.route)" :class="[
                    'flex items-center gap-3 py-2 px-4 text-md rounded-md hover:bg-gray-800 transition cursor-pointer',
                    { 'bg-gray-800': isActiveRoute(item) }]">
                    <i :class="item.icon"></i>
                    <span class="inline-block text-nowrap" v-if="!isCollapsed">{{ item.label }}</span>
                </li>
            </template>
        </ul>
    </div>

    <!-- Main Content Area -->
    <div :class="isCollapsed ? 'ml-[80px] w-[calc(100%-80px)]' : 'ml-[250px] w-[calc(100%-250px)]'"
        class="transition-all min-h-screen">
        <!-- Page Content -->
        <div class="p-6">
            <RouterView />
        </div>
    </div>
</template>

<style scoped>
.transition-all {
    transition: all 0.3s ease-in-out;
}
</style>