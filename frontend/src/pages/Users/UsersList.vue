<script setup>
import { ref, onMounted } from "vue";
import { useToast } from "primevue/usetoast";
import UsersTable from "./../../components/users/UsersTable.vue";
import AddUserDialog from "./../../components/users/AddUserDialog.vue";
import EditUserDialog from "./../../components/users/EditUserDialog.vue";
import { getUsers, createUser } from "../../api/users";
import { getRoles } from "../../api/roles";
import { Button } from "primevue";
import { getSpecialties } from "../../api/specialty";

const toast = useToast();
const users = ref([]);
const specialties = ref([]);
const loading = ref(false);
const visibleAddDialog = ref(false);
const visibleEditDialog = ref(false);
const selectedUser = ref(null);

const roles = [
    "Admin",
    "Reception",
    "Manager",
    "Facturation",
    "Convention",
    "Cashier",
]

// Fetch data
const fetchData = async () => {
    loading.value = true;
    try {
        const [usersResponse, specialtiesResponse] = await Promise.all([
            getUsers(),
            getSpecialties(),
        ]);
        users.value = usersResponse;
        specialties.value = specialtiesResponse;
    } catch (error) {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: error.message,
            life: 3000,
        });
    } finally {
        loading.value = false;
    }
};

// Handle user edit
const handleEditUser = (user) => {
    selectedUser.value = { ...user };
    visibleEditDialog.value = true;
};

// Handle user update
const handleUserUpdated = () => {
    fetchData();
    toast.add({
        severity: "success",
        summary: "Success",
        detail: "User updated successfully",
        life: 3000,
    });
};

onMounted(fetchData);

const refreshUsers = () => {
    fetchData();
};
</script>

<template>
    <div class=" w-full">
        <Toast />
        <div class="flex justify-between align-items-center mb-4">
            <h1 class="text-2xl font-bold">User Management</h1>

        </div>

        <div class="mb-4 flex justify-end">
            <Button label="Add User" icon="pi pi-plus" class="p-button-sm p-button-primary"
                @click="visibleAddDialog = true" />
        </div>

        <UsersTable :users="users" :roles="roles" :loading="loading" @edit-user="handleEditUser" @refresh="fetchData" />

        <AddUserDialog v-model:visible="visibleAddDialog" :roles="roles" :specialties="specialties"
            @user-created="refreshUsers" />

        <EditUserDialog v-model:visible="visibleEditDialog" v-model:user="selectedUser" :roles="roles"
            :specialties="specialties" @user-updated="refreshUsers" />
    </div>
</template>