<script setup>
import { ref, computed, onMounted } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputText from "primevue/inputtext";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import Tag from "primevue/tag";
import Select from "primevue/select";
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";
import { createRole, getRoles } from "../../api/roles";
import { Toast, useToast } from "primevue";

const roles=ref([]);

const services = ref([
    { id: 1, name: "Consultation", status: "Active" },
    { id: 2, name: "Support", status: "Inactive" },
    { id: 3, name: "Maintenance", status: "Pending" },
]);

const fetchRoles = async () => {
    try {
        roles.value = await getRoles();
    } catch (error) {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: error.message,
            life: 3000,
        });
    }
};

onMounted(fetchRoles);

const statuses = ["Active", "Inactive", "Pending"];
const toast = useToast();
const searchRole = ref("");
const searchService = ref("");
const selectedRole = ref(null);
const selectedService = ref(null);
const editRoleDialog = ref(false);
const editServiceDialog = ref(false);
const addRoleDialog = ref(false);
const addServiceDialog = ref(false);
const newRole = ref({ name: "", description: "" });
const newService = ref({ name: "", status: "" });

const filteredRoles = computed(() => {
    return roles.value.filter(role => role.name.toLowerCase().includes(searchRole.value.toLowerCase()));
});

const filteredServices = computed(() => {
    return services.value.filter(service => service.name.toLowerCase().includes(searchService.value.toLowerCase()));
});

const getTagSeverity = (status) => {
    switch (status) {
        case "Active": return "success";
        case "Inactive": return "danger";
        case "Pending": return "warning";
        default: return "info";
    }
};

const openEditRoleDialog = (role) => {
    selectedRole.value = { ...role };
    editRoleDialog.value = true;
};

const openEditServiceDialog = (service) => {
    selectedService.value = { ...service };
    editServiceDialog.value = true;
};

const saveRole = () => {
    const index = roles.value.findIndex(r => r.id === selectedRole.value.id);
    if (index !== -1) roles.value[index] = { ...selectedRole.value };
    editRoleDialog.value = false;
};

const saveService = () => {
    const index = services.value.findIndex(s => s.id === selectedService.value.id);
    if (index !== -1) services.value[index] = { ...selectedService.value };
    editServiceDialog.value = false;
};

const addRole = async () => {
    try {
        const createdRole = await createRole(newRole.value);
        toast.add({
            severity: "success",
            summary: "Success",
            detail: createdRole.message,
            life: 3000,
        });
        roles.value.push(createdRole.role);
        addRoleDialog.value = false;
    } catch (error) {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: error.message,
            life: 3000,
        });
    }
};

const addService = () => {
    services.value.push({ ...newService.value, id: services.value.length + 1 });
    addServiceDialog.value = false;
};
</script>

<template>
    <section>
        <Toast />
        <h2 class="header-lg">Roles & Services Management</h2>

        <TabView>
            <TabPanel header="Roles Management">
                <div class="my-3 w-full flex items-center justify-between">
                    <InputText size="small" v-model="searchRole" placeholder="Search roles..." />
                    <Button size="small" label="Add Role" icon="pi pi-plus" @click="addRoleDialog = true" />
                </div>

                <DataTable :value="filteredRoles" paginator :rows="5">
                    <Column field="name" header="Role Name"></Column>
                    <Column field="description" header="Description"></Column>
                    <Column>
                        <template #body="{ data }">
                            <Button size="small" icon="pi pi-pencil" @click="openEditRoleDialog(data)"
                                class="p-button-outlined" />
                        </template>
                    </Column>
                </DataTable>
            </TabPanel>

            <TabPanel header="Services Management">
                <div class="my-3 w-full flex items-center justify-between">
                    <InputText size="small" v-model="searchService" placeholder="Search services..." />
                    <Button size="small" label="Add Service" icon="pi pi-plus" @click="addServiceDialog = true" />
                </div>
                <DataTable :value="filteredServices" paginator :rows="5">
                    <Column field="name" header="Service"></Column>
                    <Column field="status" header="Status">
                        <template #body="{ data }">
                            <Tag :value="data.status" :severity="getTagSeverity(data.status)" />
                        </template>
                    </Column>
                    <Column>
                        <template #body="{ data }">
                            <Button size="small" icon="pi pi-pencil" @click="openEditServiceDialog(data)"
                                class="p-button-outlined" />
                        </template>
                    </Column>
                </DataTable>
            </TabPanel>
        </TabView>

        <!-- Add Role Dialog -->
        <Dialog v-model:visible="addRoleDialog" class="w-full max-w-[500px]" header="Add Role" modal>
            <form class="p-fluid flex flex-col px-5">
                <label>Role Name:</label>
                <InputText size="small" v-model="newRole.name" placeholder="Name" />
                <label class="mt-3">Description:</label>
                <InputText size="small" v-model="newRole.description"  placeholder="Description" />
                <div class="flex gap-3 mt-4">
                    <Button size="small" label="Cancel" severity="secondary" icon="pi pi-times"
                        @click="addRoleDialog = false" class="flex-1" />
                    <Button size="small" label="Add" icon="pi pi-check" @click="addRole"
                        class="p-button-primary flex-1" />
                </div>
            </form>
        </Dialog>

        <!-- Edit role -->
        <Dialog v-model:visible="editRoleDialog" class="w-full max-w-[500px]" header="Edit Role" modal>
            <form class="p-fluid flex flex-col px-5">
                <label>Role Name:</label>
                <InputText size="small" v-model="selectedRole.name" placeholder="Name" />
                <label class="mt-3">Status:</label>
                <Select size="small" v-model="selectedRole.status" :options="statuses" placeholder="Select Status" />
                <div class="flex gap-3 mt-4">
                    <Button size="small" label="Cancel" severity="secondary" icon="pi pi-times"
                        @click="editRoleDialog = false" class="flex-1" />
                    <Button size="small" label="Save" icon="pi pi-check" @click="saveRole"
                        class="p-button-primary flex-1" />
                </div>
            </form>
        </Dialog>

        <!-- Add Service Dialog -->
        <Dialog v-model:visible="addServiceDialog" class="w-full max-w-[500px]" header="Add Service" modal>
            <form class="p-fluid flex flex-col px-5">
                <label>Service Name:</label>
                <InputText size="small" v-model="newService.name" placeholder="Name" />
                <label class="mt-3">Status:</label>
                <Select size="small" v-model="newService.status" :options="statuses" placeholder="Select Status" />
                <div class="flex gap-3 mt-4">
                    <Button size="small" label="Cancel" severity="secondary" icon="pi pi-times"
                        @click="addServiceDialog = false" class="flex-1" />
                    <Button size="small" label="Add" icon="pi pi-check" @click="addService"
                        class="p-button-primary flex-1" />
                </div>
            </form>
        </Dialog>

        <!-- Edit Service Dialog -->
        <Dialog v-model:visible="editServiceDialog" class="w-full max-w-[500px]" header="Edit Service" modal>
            <form class="p-fluid flex flex-col px-5">
                <label>Service Name:</label>
                <InputText size="small" v-model="selectedService.name" placeholder="Name" />
                <label class="mt-3">Status:</label>
                <Select size="small" v-model="selectedService.status" :options="statuses" placeholder="Select Status" />
                <div class="flex gap-3 mt-4">
                    <Button size="small" label="Cancel" severity="secondary" icon="pi pi-times"
                        @click="editServiceDialog = false" class="flex-1" />
                    <Button size="small" label="Save" icon="pi pi-check" @click="saveService"
                        class="p-button-primary flex-1" />
                </div>
            </form>
        </Dialog>
    </section>
</template>
