<script setup>
import { ref, computed } from "vue";
import { Button, Column, DataTable, InputText, Tag, Dropdown } from "primevue";

import AddUserDialog from "./AddUserDialog.vue";

const props = defineProps({
    users: {
        type: Array,
        default: () => []
    },
    roles: {
        type: Array,
        default: () => []
    },
    loading: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['add-user', 'edit-user', 'delete-user']);

// Search configuration
const searchTerm = ref('');
const searchColumn = ref('all');
const columnOptions = ref([
    { label: 'All Columns', value: 'all' },
    { label: 'Username', value: 'username' },
    { label: 'Email', value: 'email' },
    { label: 'Phone', value: 'phone' },
    { label: 'Role', value: 'role' },
    { label: 'Status', value: 'status' }
]);

// Get role name from role_id
const getRoleName = (roleId) => {
    const role = props.roles.find(r => r.id === roleId);
    return role ? role.role_name : 'Unknown';
};

const filteredUsers = computed(() => {
    if (!searchTerm.value) return props.users;

    const term = searchTerm.value.toLowerCase();
    return props.users.filter(user => {
        if (searchColumn.value === 'all') {
            return (
                user.username.toLowerCase().includes(term) ||
                user.email.toLowerCase().includes(term) ||
                user.phone.includes(term) ||
                getRoleName(user.role_id).toLowerCase().includes(term) ||
                user.status.toLowerCase().includes(term)
            );
        }
        if (searchColumn.value === 'role') {
            return getRoleName(user.role_id).toLowerCase().includes(term);
        }
        const fieldValue = String(user[searchColumn.value]).toLowerCase();
        return fieldValue.includes(term);
    });
});

const getSeverity = (status) => {
    return status?.toLowerCase() === 'active' ? 'success' : 'danger';
};
</script>

<template>
    <div class="card p-4">
        <!-- Search Row -->
        <div class="flex gap-2 mb-4">
            <Dropdown v-model="searchColumn" :options="columnOptions" optionLabel="label" optionValue="value"
                placeholder="Search by" class="w-1/4" />
            <span class="p-input-icon-left flex-1">
                <InputText v-model="searchTerm" placeholder="Search users..." class="w-full" />
            </span>
        </div>

        <!-- DataTable -->
        <DataTable :value="filteredUsers" :paginator="true" :rows="10" :loading="props.loading" stripedRows
            class="p-datatable-sm">
            <template #empty>
                <div class="text-center p-4 text-gray-500">
                    <i class="pi pi-users text-2xl mb-2" />
                    <p>No users found</p>
                </div>
            </template>

            <template #loading>
                <div class="flex items-center justify-center p-4">
                    <i class="pi pi-spinner pi-spin mr-2"></i>
                    <span>Loading users...</span>
                </div>
            </template>

            <Column field="fullName" header="Full Name" sortable>
                <template #body="{ data }">
                    <span class="font-medium">{{ data.first_name }} {{ data.last_name }}</span>
                </template>
            </Column>

            <Column field="email" header="Email" sortable>
                <template #body="{ data }">
                    <a :href="`mailto:${data.email}`" class="text-primary hover:underline">
                        {{ data.email }}
                    </a>
                </template>
            </Column>

            <Column field="phone" header="Phone" sortable>
                <template #body="{ data }">
                    <a :href="`tel:${data.phone_number}`" class="text-primary hover:underline">
                        {{ data.phone_number }}
                    </a>
                </template>
            </Column>

            <Column field="role" header="Role" sortable>
                <template #body="{ data }">
                    <Tag :value="data.role" class="capitalize" />
                </template>
            </Column>

            <Column field="status" header="Status" sortable>
                <template #body="{ data }">
                    <Tag :value="data.status" :severity="getSeverity(data.status)" class="capitalize" />
                </template>
            </Column>

            <Column header="Actions" style="width: 100px">
                <template #body="{ data }">
                    <div class="flex gap-2">
                        <Button icon="pi pi-pencil" class="p-button-sm p-button-text"
                            @click="$emit('edit-user', data)" />
                    </div>
                </template>
            </Column>
        </DataTable>
    </div>
</template>

<style scoped></style>