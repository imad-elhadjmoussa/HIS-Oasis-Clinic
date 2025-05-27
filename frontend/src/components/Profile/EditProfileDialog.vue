<template>
    <Dialog v-bind:visible="visible" header="Edit Profile" :modal="true" class="w-full max-w-4xl"
        :dismissableMask="true" :closable="true">
        <div class="space-y-6">
            <!-- Basic Information Section -->
            <div>
                <h3 class="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <i class="pi pi-user text-slate-600"></i>
                    Basic Information
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="space-y-1">
                        <label for="first_name" class="text-sm font-medium text-slate-700">First Name</label>
                        <InputText id="first_name" v-model="form.first_name"
                            class="w-full border-slate-300 focus:border-blue-500 focus:ring-blue-200"
                            placeholder="Enter first name" />
                    </div>

                    <div class="space-y-1">
                        <label for="last_name" class="text-sm font-medium text-slate-700">Last Name</label>
                        <InputText id="last_name" v-model="form.last_name"
                            class="w-full border-slate-300 focus:border-blue-500 focus:ring-blue-200"
                            placeholder="Enter last name" />
                    </div>

                    <div class="space-y-1">
                        <label for="date_of_birth" class="text-sm font-medium text-slate-700">Date of Birth</label>
                        <Calendar id="date_of_birth" v-model="form.date_of_birth" dateFormat="yy-mm-dd" class="w-full"
                            :showIcon="true" iconDisplay="input" placeholder="Select date of birth" />
                    </div>

                    <div class="space-y-1">
                        <label for="gender" class="text-sm font-medium text-slate-700">Gender</label>
                        <Dropdown id="gender" v-model="form.gender" :options="genderOptions" optionLabel="label"
                            optionValue="value" placeholder="Select Gender" class="w-full" />
                    </div>
                </div>
            </div>

            <!-- Contact Information Section -->
            <div>
                <h3 class="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <i class="pi pi-envelope text-slate-600"></i>
                    Contact Information
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="space-y-1">
                        <label for="email" class="text-sm font-medium text-slate-700">Email Address</label>
                        <InputText id="email" v-model="form.email" type="email"
                            class="w-full border-slate-300 focus:border-blue-500 focus:ring-blue-200"
                            placeholder="Enter email address" />
                    </div>

                    <div class="space-y-1">
                        <label for="phone_number" class="text-sm font-medium text-slate-700">Phone Number</label>
                        <InputText id="phone_number" v-model="form.phone_number"
                            class="w-full border-slate-300 focus:border-blue-500 focus:ring-blue-200"
                            placeholder="Enter phone number" />
                    </div>
                </div>
            </div>

            <!-- Additional Information Section -->
            <div>
                <h3 class="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <i class="pi pi-id-card text-slate-600"></i>
                    Additional Information
                </h3>
                <div class="grid grid-cols-1 gap-4">
                    <div class="space-y-1">
                        <label for="national_id_number" class="text-sm font-medium text-slate-700">National ID
                            Number</label>
                        <InputText id="national_id_number" v-model="form.national_id_number"
                            class="w-full border-slate-300 focus:border-blue-500 focus:ring-blue-200"
                            placeholder="Enter national ID number" />
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end gap-3">
                <Button label="Cancel" icon="pi pi-times"
                    class="p-button-outlined p-button-secondary border-slate-300 text-slate-700 hover:bg-slate-50"
                    @click="close" />
                <Button label="Save Changes" icon="pi pi-check"
                    class="bg-blue-600 hover:bg-blue-700 border-blue-600 text-white shadow-sm" :loading="saving"
                    @click="save" />
            </div>
        </template>
    </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { Dialog, InputText, Calendar, Dropdown, Button } from 'primevue';
import { useUserStore } from '../../stors/user';

const props = defineProps({
    visible: Boolean,
    user: Object
});

const emit = defineEmits(['update:visible', 'saved']);

const userStore = useUserStore();
const saving = ref(false);

const genderOptions = ref([
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
]);

const form = ref({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    national_id_number: '',
    date_of_birth: '',
    gender: ''
});

watch(() => props.user, (newUser) => {
    if (newUser) {
        form.value = {
            first_name: newUser.first_name || '',
            last_name: newUser.last_name || '',
            email: newUser.email || '',
            phone_number: newUser.phone_number || '',
            national_id_number: newUser.national_id_number || '',
            date_of_birth: newUser.date_of_birth ? new Date(newUser.date_of_birth) : null,
            gender: newUser.gender || ''
        };
    }
}, { immediate: true });

const close = () => {
    emit('update:visible', false);
};

const save = async () => {
    saving.value = true;
    try {
        const payload = {
            ...form.value,
            date_of_birth: form.value.date_of_birth ? form.value.date_of_birth.toISOString().split('T')[0] : null
        };

        await userStore.updateProfile(payload);
        emit('saved');
        close();
    } catch (error) {
        console.error('Error updating profile:', error);
    } finally {
        saving.value = false;
    }
};
</script>

<style scoped>
/* Custom dialog styling */
:deep(.p-dialog) {
    border-radius: 12px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

:deep(.p-dialog-header) {
    background: linear-gradient(to right, #f8fafc, #f1f5f9);
    border-bottom: 1px solid #e2e8f0;
    border-radius: 12px 12px 0 0;
    padding: 1.25rem 1.5rem;
}

:deep(.p-dialog-title) {
    font-size: 1.25rem;
    font-weight: 600;
    color: #0f172a;
}

:deep(.p-dialog-content) {
    padding: 1.5rem;
    background: #ffffff;
}

:deep(.p-dialog-footer) {
    background: #f8fafc;
    border-top: 1px solid #e2e8f0;
    border-radius: 0 0 12px 12px;
    padding: 1rem 1.5rem;
}

/* Input styling */
:deep(.p-inputtext) {
    border-radius: 8px;
    border: 1px solid #cbd5e1;
    padding: 0.625rem 0.875rem;
    font-size: 0.875rem;
    transition: all 0.2s ease;
}

:deep(.p-inputtext:focus) {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

:deep(.p-calendar) {
    width: 100%;
}

:deep(.p-calendar .p-inputtext) {
    width: 100%;
}

:deep(.p-dropdown) {
    border-radius: 8px;
    border: 1px solid #cbd5e1;
}

:deep(.p-dropdown:not(.p-disabled).p-focus) {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Button styling */
:deep(.p-button) {
    border-radius: 8px;
    padding: 0.625rem 1.25rem;
    font-weight: 500;
    font-size: 0.875rem;
    transition: all 0.2s ease;
}

:deep(.p-button.p-button-outlined) {
    background: transparent;
}

:deep(.p-button.p-button-outlined:hover) {
    background: #f8fafc;
}
</style>