<script setup>
import { ref, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Calendar from 'primevue/calendar';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import InputMask from 'primevue/inputmask';
import { createDoctor } from '../../api/doctor';

const toast = useToast();
const props = defineProps({
    visible: Boolean,
    specialties: Array
});

const emit = defineEmits(['update:visible', 'doctor-created']);

const doctor = ref({
    first_name: '',
    last_name: '',
    national_id_number: '',
    date_of_birth: null,
    phone_number: '',
    email: '',
    gender: null,
    specialty_id: null
});

const loading = ref(false);
const errors = ref({});

// Gender options
const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' }
];

// Date validation limits
const maxBirthDate = computed(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 25); // Doctors must be at least 25 years old
    return date;
});

const minBirthDate = computed(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 80); // Maximum age 80 years
    return date;
});

const validateDoctorForm = () => {
    errors.value = {};
    const nameRegex = /^[a-zA-Z\u00C0-\u017F\s'-]+$/;
    const phoneRegex = /^(0)(5|6|7)[0-9]{8}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const nationalIdRegex = /^\d{18}$/;

    // First name validation
    if (!doctor.value.first_name?.trim()) {
        errors.value.first_name = 'First name is required';
    } else if (doctor.value.first_name.trim().length < 2) {
        errors.value.first_name = 'First name must be at least 2 characters';
    } else if (doctor.value.first_name.trim().length > 50) {
        errors.value.first_name = 'First name cannot exceed 50 characters';
    } else if (!nameRegex.test(doctor.value.first_name.trim())) {
        errors.value.first_name = 'First name can only contain letters, spaces, apostrophes and hyphens';
    }

    // Last name validation
    if (!doctor.value.last_name?.trim()) {
        errors.value.last_name = 'Last name is required';
    } else if (doctor.value.last_name.trim().length < 2) {
        errors.value.last_name = 'Last name must be at least 2 characters';
    } else if (doctor.value.last_name.trim().length > 50) {
        errors.value.last_name = 'Last name cannot exceed 50 characters';
    } else if (!nameRegex.test(doctor.value.last_name.trim())) {
        errors.value.last_name = 'Last name can only contain letters, spaces, apostrophes and hyphens';
    }

    // National ID validation
    if (!doctor.value.national_id_number?.trim()) {
        errors.value.national_id_number = 'National ID is required';
    } else if (!nationalIdRegex.test(doctor.value.national_id_number.replace(/\s/g, ''))) {
        errors.value.national_id_number = 'National ID must be exactly 18 digits';
    }


    // Date of Birth validation
    if (!doctor.value.date_of_birth) {
        errors.value.date_of_birth = 'Date of birth is required';
    } else {
        try {
            const dob = new Date(doctor.value.date_of_birth);
            const today = new Date();

            // Set time to start of day for accurate comparison
            today.setHours(0, 0, 0, 0);
            dob.setHours(0, 0, 0, 0);

            if (isNaN(dob.getTime())) {
                errors.value.date_of_birth = 'Please enter a valid date';
            } else if (dob > today) {
                errors.value.date_of_birth = 'Date cannot be in the future';
            } else if (dob < minBirthDate.value) {
                errors.value.date_of_birth = 'Maximum age allowed is 80 years';
            } else if (dob > maxBirthDate.value) {
                errors.value.date_of_birth = 'Minimum age required is 25 years';
            }
        } catch (e) {
            errors.value.date_of_birth = 'Invalid date format';
        }
    }

    // Phone validation
    if (!doctor.value.phone_number?.trim()) {
        errors.value.phone_number = 'Phone number is required';
    } else if (!phoneRegex.test(doctor.value.phone_number.replace(/\s/g, ''))) {
        errors.value.phone_number = 'Please enter a valid Algerian phone number (0XXX XXX XXX)';
    }

    // Email validation (optional but must be valid if provided)
    if (!doctor.value.email?.trim()) {
        errors.value.email = 'Email is required';
    } else if (!emailRegex.test(doctor.value.email.trim())) {
        errors.value.email = 'Please enter a valid email address (e.g., name@domain.com)';
    } else if (doctor.value.email.trim().length > 100) {
        errors.value.email = 'Email cannot exceed 100 characters';
    }


    // Gender validation (optional)
    if (doctor.value.gender && !['male', 'female'].includes(doctor.value.gender)) {
        errors.value.gender = 'Please select a valid gender';
    }

    // Specialty validation
    if (!doctor.value.specialty_id) {
        errors.value.specialty_id = 'Specialty is required';
    } else if (!props.specialties?.find(s => s.id === doctor.value.specialty_id)) {
        errors.value.specialty_id = 'Please select a valid specialty';
    }

    return Object.keys(errors.value).length === 0;
};

const submit = async () => {
    if (!validateDoctorForm()) {
        toast.add({
            severity: 'warn',
            summary: 'Validation Error',
            detail: 'Please fix the errors in the form',
            life: 3000,
        });
        return;
    }

    loading.value = true;
    try {
        // Clean the data before sending
        const cleanedDoctor = {
            ...doctor.value,
            first_name: doctor.value.first_name?.trim(),
            last_name: doctor.value.last_name?.trim(),
            national_id_number: doctor.value.national_id_number?.replace(/\s/g, ''),
            phone_number: doctor.value.phone_number?.replace(/\s/g, ''),
            email: doctor.value.email?.trim() || null,
        };

        const data = await createDoctor(cleanedDoctor);
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Doctor created successfully',
            life: 3000,
        });
        emit('doctor-created', data);
        closeDialog();
    } catch (error) {
        console.error('Error creating doctor:', error);

        let errorMessage = 'Failed to create doctor';
        if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.message) {
            errorMessage = error.message;
        }

        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: errorMessage,
            life: 5000,
        });

        // Handle server-side validation errors
        if (error.response?.data?.errors) {
            errors.value = { ...errors.value, ...error.response.data.errors };
        }
    } finally {
        loading.value = false;
    }
};

const closeDialog = () => {
    doctor.value = {
        first_name: '',
        last_name: '',
        national_id_number: '',
        date_of_birth: null,
        phone_number: '',
        email: '',
        gender: null,
        specialty_id: null
    };
    errors.value = {};
    emit('update:visible', false);
};

// Watch for dialog visibility to reset form when closed
import { watch } from 'vue';
watch(() => props.visible, (newVal) => {
    if (!newVal) {
        errors.value = {};
    }
});
</script>

<template>
    <Dialog :visible="visible" @update:visible="emit('update:visible', $event)" header="Add New Doctor" :modal="true"
        :style="{ width: '600px' }" :closable="!loading">
        <form @submit.prevent="submit" class="p-fluid">
            <div class="grid grid-cols-2 gap-4">
                <!-- Column 1 -->
                <div class="space-y-4">
                    <div>
                        <label for="first_name" class="block mb-2 font-medium">First Name*</label>
                        <InputText id="first_name" v-model="doctor.first_name" placeholder="Enter first name"
                            class="w-full" :class="{ 'p-invalid': errors.first_name }" :disabled="loading"
                            maxlength="50" size="small" required />
                        <small v-if="errors.first_name" class="p-error">{{ errors.first_name }}</small>
                    </div>

                    <div>
                        <label for="national_id" class="block mb-2 font-medium">National ID*</label>
                        <InputMask id="national_id" v-model="doctor.national_id_number" mask="999999999999999999"
                            placeholder="18-digit number" class="w-full"
                            :class="{ 'p-invalid': errors.national_id_number }" :disabled="loading" size="small"
                            required />
                        <small v-if="errors.national_id_number" class="p-error">{{ errors.national_id_number }}</small>
                    </div>

                    <div>
                        <label for="phone" class="block mb-2 font-medium">Phone Number*</label>
                        <InputMask id="phone" v-model="doctor.phone_number" mask="9999999999" placeholder="05XX XXX XXX"
                            class="w-full" :class="{ 'p-invalid': errors.phone_number }" :disabled="loading"
                            size="small" required />
                        <small v-if="errors.phone_number" class="p-error">{{ errors.phone_number }}</small>
                    </div>

                    <div>
                        <label for="gender" class="block mb-2 font-medium">Gender</label>
                        <Dropdown id="gender" v-model="doctor.gender" :options="genderOptions" optionLabel="label"
                            optionValue="value" placeholder="Select gender" class="w-full"
                            :class="{ 'p-invalid': errors.gender }" :disabled="loading" size="small" />
                        <small v-if="errors.gender" class="p-error">{{ errors.gender }}</small>
                    </div>
                </div>

                <!-- Column 2 -->
                <div class="space-y-4">
                    <div>
                        <label for="last_name" class="block mb-2 font-medium">Last Name*</label>
                        <InputText id="last_name" v-model="doctor.last_name" placeholder="Enter last name"
                            class="w-full" :class="{ 'p-invalid': errors.last_name }" :disabled="loading" maxlength="50"
                            size="small" required />
                        <small v-if="errors.last_name" class="p-error">{{ errors.last_name }}</small>
                    </div>

                    <div>
                        <label for="dob" class="block mb-2 font-medium">Date of Birth*</label>
                        <Calendar id="dob" v-model="doctor.date_of_birth" dateFormat="dd/mm/yy" class="w-full"
                            :showIcon="true" :maxDate="maxBirthDate" :minDate="minBirthDate"
                            :class="{ 'p-invalid': errors.date_of_birth }" :disabled="loading" placeholder="dd/mm/yyyy"
                            size="small" required />
                        <small v-if="errors.date_of_birth" class="p-error">{{ errors.date_of_birth }}</small>
                        <small v-else class="text-xs text-gray-500 mt-1 block">
                            Must be between 25-80 years old
                        </small>
                    </div>

                    <div>
                        <label for="email" class="block mb-2 font-medium">Email</label>
                        <InputText id="email" v-model="doctor.email" placeholder="example@domain.com" class="w-full"
                            :class="{ 'p-invalid': errors.email }" :disabled="loading" maxlength="100" type="email"
                            size="small" />
                        <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
                        <small v-else class="text-xs text-gray-500 mt-1 block">
                            Optional, but must be a valid email format
                        </small>
                    </div>

                    <div>
                        <label for="specialty" class="block mb-2 font-medium">Specialty*</label>
                        <Dropdown id="specialty" v-model="doctor.specialty_id" :options="specialties || []"
                            optionLabel="specialty_name" optionValue="id" placeholder="Select specialty" class="w-full"
                            :class="{ 'p-invalid': errors.specialty_id }" :disabled="loading" required />
                        <small v-if="errors.specialty_id" class="p-error">{{ errors.specialty_id }}</small>
                    </div>
                </div>
            </div>
        </form>

        <template #footer>
            <div class="flex justify-end gap-2">
                <Button label="Cancel" icon="pi pi-times" severity="secondary" @click="closeDialog"
                    :disabled="loading" />
                <Button label="Save" icon="pi pi-check" severity="success" @click="submit" :loading="loading" />
            </div>
        </template>
    </Dialog>
</template>

<style scoped>
.p-error {
    color: #e24c4c;
    font-size: 0.875rem;
}

.font-medium {
    font-weight: 500;
}
</style>