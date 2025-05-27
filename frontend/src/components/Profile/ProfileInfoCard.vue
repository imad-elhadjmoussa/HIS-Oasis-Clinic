<template>
    <div class="">
        <!-- Profile Header - Changed background to bg-gray-900 -->


        <!-- Profile Info -->
        <div class="bg-gray-900 rounded-xl shadow-sm p-6 mb-2 border border-gray-200">
            <div class="flex flex-col md:flex-row items-center gap-6">
                <!-- Avatar Section -->
                <div class="relative">
                    <Avatar :image="avatarUrl" icon="pi pi-user" size="xlarge" shape="circle"
                        class="w-24 h-24 border-4 border-white shadow-lg" />
                    <Tag :value="user.status" :severity="statusSeverity"
                        class="absolute -bottom-2 -right-2 text-xs font-bold shadow-sm" />
                </div>

                <!-- Profile Info -->
                <div class="flex-1 text-center md:text-left">
                    <div class="flex justify-between items-start">
                        <div>
                            <h1 class="text-2xl md:text-3xl font-bold text-white">
                                {{ user.first_name }} {{ user.last_name }}
                            </h1>
                            <div class="flex items-center gap-2 mt-2">
                                <Tag :value="user.role" severity="info" />
                                <!-- Specialty Tag in Header -->
                                <Tag v-if="user.specialty_name" :value="user.specialty_name" severity="success" />
                            </div>
                        </div>
                        <Button icon="pi pi-pencil" label="Edit Profile" @click="editMode = !editMode"
                            class="p-button-sm p-button-secondary" />
                    </div>

                    <!-- Quick Info -->
                    <div class="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
                        <Chip class="bg-white/20 backdrop-blur-sm">
                            <i class="pi pi-id-card text-white mr-2"></i>
                            <span class="text-white">ID: {{ user.national_id_number || 'N/A' }}</span>
                        </Chip>
                        <Chip class="bg-white/20 backdrop-blur-sm">
                            <i class="pi pi-envelope text-white mr-2"></i>
                            <span class="text-white">{{ user.email }}</span>
                        </Chip>
                        <Chip class="bg-white/20 backdrop-blur-sm">
                            <i class="pi pi-phone text-white mr-2"></i>
                            <span class="text-white">{{ user.phone_number }}</span>
                        </Chip>
                    </div>
                </div>
            </div>
        </div>



        <!-- Profile Information -->
        <Card class="shadow-sm border border-gray-200">
            <template #content>
                <div v-if="!editMode" class="space-y-6">
                    <!-- View Mode -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Personal Info -->
                        <div class="space-y-4">
                            <h3 class="text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h3>

                            <div class="space-y-4">
                                <div>
                                    <p class="text-sm text-gray-500">First Name</p>
                                    <p class="text-gray-900">{{ user.first_name }}</p>
                                </div>

                                <div>
                                    <p class="text-sm text-gray-500">Last Name</p>
                                    <p class="text-gray-900">{{ user.last_name }}</p>
                                </div>

                                <div>
                                    <p class="text-sm text-gray-500">Date of Birth</p>
                                    <p class="text-gray-900">{{ formattedDateOfBirth }}</p>
                                </div>

                                <div>
                                    <p class="text-sm text-gray-500">Gender</p>
                                    <p class="text-gray-900">{{ user.gender }}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Contact Info -->
                        <div class="space-y-4">
                            <h3 class="text-lg font-semibold text-gray-900 border-b pb-2">Contact Information</h3>

                            <div class="space-y-4">
                                <div>
                                    <p class="text-sm text-gray-500">Email</p>
                                    <p class="text-gray-900">{{ user.email }}</p>
                                </div>

                                <div>
                                    <p class="text-sm text-gray-500">Phone Number</p>
                                    <p class="text-gray-900">{{ user.phone_number }}</p>
                                </div>

                                <div>
                                    <p class="text-sm text-gray-500">National ID</p>
                                    <p class="text-gray-900">{{ user.national_id_number || 'Not provided' }}</p>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                <!-- Edit Mode -->
                <form v-else @submit.prevent="handleSubmit" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Personal Info -->
                        <div class="space-y-4">
                            <h3 class="text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h3>

                            <div class="space-y-2">
                                <label class="block text-sm font-medium text-gray-700">First Name</label>
                                <InputText size="small" v-model="formData.first_name" class="w-full" />
                            </div>

                            <div class="space-y-2">
                                <label class="block text-sm font-medium text-gray-700">Last Name</label>
                                <InputText size="small" v-model="formData.last_name" class="w-full" />
                            </div>

                            <div class="space-y-2">
                                <label class="block text-sm font-medium text-gray-700">Date of Birth</label>
                                <Calendar size="small" v-model="formData.date_of_birth" dateFormat="yy-mm-dd"
                                    class="w-full" />
                            </div>

                            <div class="space-y-2">
                                <label class="block text-sm font-medium text-gray-700">Gender</label>
                                <Dropdown size="small" v-model="formData.gender" :options="genderOptions"
                                    optionLabel="label" optionValue="value" class="w-full" />
                            </div>
                        </div>

                        <!-- Contact Info -->
                        <div class="space-y-4">
                            <h3 class="text-lg font-semibold text-gray-900 border-b pb-2">Contact Information</h3>

                            <div class="space-y-2">
                                <label class="block text-sm font-medium text-gray-700">Email</label>
                                <InputText size="small" v-model="formData.email" class="w-full" />
                            </div>

                            <div class="space-y-2">
                                <label class="block text-sm font-medium text-gray-700">Phone Number</label>
                                <InputText size="small" v-model="formData.phone_number" class="w-full" />
                            </div>

                            <div class="space-y-2">
                                <label class="block text-sm font-medium text-gray-700">National ID</label>
                                <InputText size="small" v-model="formData.national_id_number" class="w-full" />
                            </div>
                        </div>
                    </div>

                    <!-- Form Actions -->
                    <div class="flex justify-end gap-3 pt-4">
                        <Button label="Cancel" icon="pi pi-times" @click="cancelEdit"
                            class="p-button-text p-button-sm text-gray-600" />
                        <Button label="Save Changes" icon="pi pi-check" type="submit"
                            class="p-button-sm bg-blue-600 hover:bg-blue-700" />
                    </div>
                </form>
            </template>
        </Card>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Avatar, Tag, InputText, Button, Chip, Card, Dropdown, Calendar, InputMask, Toast, useToast } from 'primevue';
import { useUserStore } from '../../stors/user';

const userStore = useUserStore();
const user = computed(() => userStore.user);

const editMode = ref(false);
const formData = ref({ ...user.value });

const toast = useToast();



const statusSeverity = computed(() => {
    switch (user.value.status?.toLowerCase()) {
        case 'active': return 'success';
        case 'inactive': return 'warning';
        case 'pending': return 'info';
        default: return 'secondary';
    }
});

const formattedDateOfBirth = computed(() => {
    if (!user.value.date_of_birth) return 'Not specified';
    const date = new Date(user.value.date_of_birth);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
});

const formattedGender = computed(() => {
    if (!user.value.gender) return 'Not specified';
    return user.value.gender.charAt(0).toUpperCase() + user.value.gender.slice(1);
});

const genderOptions = ref([
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
]);

const cancelEdit = () => {
    formData.value = { ...user.value };
    editMode.value = false;
};

const handleSubmit = async () => {
    try {
        await userStore.updateUser(formData.value);

        toast.add({
            severity: 'success',
            summary: 'Profile Updated',
            detail: 'Your profile has been updated successfully.',
            life: 3000
        });

        editMode.value = false;
    } catch (error) {
        console.error('Error updating profile:', error);
    }
};
</script>

<style scoped>
.p-avatar {
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}

.p-tag {
    font-weight: 600;
    letter-spacing: 0.5px;
}

.p-chip {
    background-color: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
}
</style>