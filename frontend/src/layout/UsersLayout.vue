<script setup>
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useToast } from "primevue/usetoast";
import Button from "primevue/button";
import Toast from "primevue/toast";
import Avatar from "primevue/avatar";
import { logoutUser } from "../api/auth";

const isCollapsed = ref(false);
const router = useRouter();
const route = useRoute();
const toast = useToast();

const toggleSidebar = () => {
    isCollapsed.value = !isCollapsed.value;
};

const menuItems = [
    { label: "All Users", icon: "pi pi-users", route: "/users" },
    // { label: "Settings", icon: "pi pi-cog", route: "/users/settings" },
    { label: "Logout", icon: "pi pi-sign-out", action: "logout" }
];

const isActiveRoute = (menuItem) => {
    if (menuItem.action) return false;

    if (menuItem.exact) {
        return route.path === menuItem.route;
    }
    return route.path.startsWith(menuItem.route);
};

const logout = async () => {
    try {
        await logoutUser();
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Logged out successfully',
            life: 3000
        });
        router.push('/login');
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Logout failed',
            life: 3000
        });
    }
};

const goToRoot = () => {
    router.push('/');
};
</script>

<template>
    <Toast />

    <div :class="isCollapsed ? 'w-[80px]' : 'w-[250px]'"
        class="h-screen z-20 bg-[#021526] border-r-[0.5px] overflow-hidden shadow-sm border-gray-200 text-gray-200 fixed bottom-0 top-0 left-0 transition-all duration-300 flex flex-col p-4">
        <div class="flex items-center justify-between mb-6">
            <img @click="goToRoot" class="w-10 h-10 rounded-full cursor-pointer" src="./../assets/logo.jpg" alt="Logo">
            <Button v-if="!isCollapsed" @click="toggleSidebar" icon="pi pi-times" severity="danger" variant="text"
                rounded aria-label="Cancel" />
        </div>

        <ul class="space-y-2">
            <template v-for="(item, index) in menuItems" :key="index">
                <li v-if="item.action === 'logout'" @click="logout"
                    class="flex items-center gap-3 py-2 px-4 text-md rounded-md hover:bg-red-600/70 cursor-pointer transition bg-red-600/50 ">
                    <i :class="item.icon"></i>
                    <span class="inline-block text-nowrap" v-if="!isCollapsed">{{ item.label }}</span>
                </li>

                <router-link v-else :to="item.route" custom v-slot="{ navigate }">
                    <li @click="navigate" :class="[
                        'flex items-center gap-3 py-2 px-4 text-md rounded-md hover:bg-gray-800 transition cursor-pointer',
                        { 'bg-gray-800': isActiveRoute(item) }
                    ]">
                        <i :class="item.icon"></i>
                        <span class="inline-block text-nowrap" v-if="!isCollapsed">{{ item.label }}</span>
                    </li>
                </router-link>
            </template>
        </ul>
    </div>

    <div :class="isCollapsed ? 'ml-[80px] w-[calc(100%-80px)]' : 'ml-[250px] w-[calc(100%-250px)]'"
        class="transition-all p-6">
        <RouterView />
    </div>
</template>

<style scoped>
.transition-all {
    transition: all 0.3s ease-in-out;
}
</style>