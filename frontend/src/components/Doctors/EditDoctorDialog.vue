<script setup>
import { ref, watch, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { Dialog, InputText, Calendar, Dropdown, Button, InputMask } from 'primevue';
import { updateDoctor } from '../../api/doctor';

const toast = useToast();
const props = defineProps({
    visible: Boolean,
    doctor: Object,
    specialties: Array
});

const emit = defineEmits(['update:visible', 'update:doctor', 'doctor-updated']);

const editedDoctor = ref({
    first_name: '',
    last_name: '',
    national_id_number: '',
    date_of_birth: null,
    phone_number: '',
    email: '',
    gender: null,
    specialty_id: null,
    ...props.doctor
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

watch(() => props.doctor, (newVal) => {
    editedDoctor.value = {
        first_name: '',
        last_name: '',
        national_id_number: '',
        date_of_birth: null,
        phone_number: '',
        email: '',
        gender: null,
        specialty_id: null,
        ...newVal
    };
    clearErrors();
});

const clearErrors = () => {
    errors.value = {};
};

const validateForm = () => {
    clearErrors();
    let isValid = true;
    const nameRegex = /^[a-zA-Z\u00C0-\u017F\s'-]+$/;
    const phoneRegex = /^(0)(5|6|7)[0-9]{8}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const nationalIdRegex = /^\d{18}$/;

    // First name validation
    if (!editedDoctor.value.first_name?.trim()) {
        errors.value.first_name = 'First name is required';
        isValid = false;
    } else if (!nameRegex.test(editedDoctor.value.first_name.trim())) {
        errors.value.first_name = 'Only letters and basic punctuation allowed';
        isValid = false;
    }

    // Last name validation
    if (!editedDoctor.value.last_name?.trim()) {
        errors.value.last_name = 'Last name is required';
        isValid = false;
    } else if (!nameRegex.test(editedDoctor.value.last_name.trim())) {
        errors.value.last_name = 'Only letters and basic punctuation allowed';
        isValid = false;
    }

    // National ID validation
    if (!editedDoctor.value.national_id_number?.trim()) {
        errors.value.national_id_number = 'National ID is required';
        isValid = false;
    } else if (!nationalIdRegex.test(editedDoctor.value.national_id_number.replace(/\s/g, ''))) {
        errors.value.national_id_number = 'Must be exactly 18 digits';
        isValid = false;
    }

    // Phone validation
    if (!editedDoctor.value.phone_number?.trim()) {
        errors.value.phone_number = 'Phone number is required';
        isValid = false;
    } else if (!phoneRegex.test(editedDoctor.value.phone_number.replace(/\s/g, ''))) {
        errors.value.phone_number = 'Valid Algerian format required (05XX XXX XXX)';
        isValid = false;
    }

    // Date of birth validation
    if (!editedDoctor.value.date_of_birth) {
        errors.value.date_of_birth = 'Date of birth is required';
        isValid = false;
    } else {
        const dob = new Date(editedDoctor.value.date_of_birth);
        const today = new Date();

        if (dob > today) {
            errors.value.date_of_birth = 'Date cannot be in the future';
            isValid = false;
        } else if (dob < minBirthDate.value) {
            errors.value.date_of_birth = 'Maximum age allowed is 80 years';
            isValid = false;
        } else if (dob > maxBirthDate.value) {
            errors.value.date_of_birth = 'Minimum age required is 25 years';
            isValid = false;
        }
    }

    // Email validation (required)
    if (!editedDoctor.value.email?.trim()) {
        errors.value.email = 'Email is required';
        isValid = false;
    } else if (!emailRegex.test(editedDoctor.value.email.trim())) {
        errors.value.email = 'Valid email format required (name@domain.com)';
        isValid = false;
    }

    return isValid;
};

const submit = async () => {
    if (!validateForm()) {
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
        // Clean data before sending
        const cleanedData = {
            ...editedDoctor.value,
            national_id_number: editedDoctor.value.national_id_number.replace(/\s/g, ''),
            phone_number: editedDoctor.value.phone_number.replace(/\s/g, '')
        };

        const data = await updateDoctor(editedDoctor.value.id, cleanedData);
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Doctor updated successfully',
            life: 3000,
        });
        emit('doctor-updated');
        closeDialog();
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to update doctor',
            life: 3000,
        });
    } finally {
        loading.value = false;
    }
};

const closeDialog = () => {
    emit('update:visible', false);
};
</script>

<template>
    <Dialog :visible="visible" @update:visible="$emit('update:visible', $event)" header="Edit Doctor" :modal="true"
        :style="{ width: '600px' }" :closable="!loading">
        <div class="grid grid-cols-2 gap-4">
            <!-- Column 1 -->
            <div class="space-y-3">
                <div>
                    <label class="block mb-1 font-medium">First Name*</label>
                    <InputText size="small" v-model="editedDoctor.first_name" placeholder="First name" class="w-full"
                        :class="{ 'p-invalid': errors.first_name }" :disabled="loading" />
                    <small v-if="errors.first_name" class="p-error">{{ errors.first_name }}</small>
                </div>

                <div>
                    <label class="block mb-1 font-medium">National ID*</label>
                    <InputMask size="small" v-model="editedDoctor.national_id_number" mask="999999999999999999"
                        placeholder="18-digit number" class="w-full" :class="{ 'p-invalid': errors.national_id_number }"
                        :disabled="loading" />
                    <small v-if="errors.national_id_number" class="p-error">{{ errors.national_id_number }}</small>
                </div>

                <div>
                    <label class="block mb-1 font-medium">Phone Number*</label>
                    <InputMask size="small" v-model="editedDoctor.phone_number" mask="9999999999"
                        placeholder="05XX XXX XXX" class="w-full" :class="{ 'p-invalid': errors.phone_number }"
                        :disabled="loading" />
                    <small v-if="errors.phone_number" class="p-error">{{ errors.phone_number }}</small>
                </div>

                <div>
                    <label class="block mb-1 font-medium">Gender</label>
                    <Dropdown size="small" v-model="editedDoctor.gender" :options="genderOptions" optionLabel="label"
                        optionValue="value" placeholder="Select gender" class="w-full" :disabled="loading" />
                </div>
            </div>

            <!-- Column 2 -->
            <div class="space-y-3">
                <div>
                    <label class="block mb-1 font-medium">Last Name*</label>
                    <InputText size="small" v-model="editedDoctor.last_name" placeholder="Last name" class="w-full"
                        :class="{ 'p-invalid': errors.last_name }" :disabled="loading" />
                    <small v-if="errors.last_name" class="p-error">{{ errors.last_name }}</small>
                </div>

                <div>
                    <label class="block mb-1 font-medium">Date of Birth*</label>
                    <Calendar size="small" v-model="editedDoctor.date_of_birth" dateFormat="dd/mm/yy" class="w-full"
                        :showIcon="true" :maxDate="maxBirthDate" :minDate="minBirthDate"
                        :class="{ 'p-invalid': errors.date_of_birth }" :disabled="loading" />
                    <small v-if="errors.date_of_birth" class="p-error">{{ errors.date_of_birth }}</small>
                    <small v-else class="text-xs text-gray-500 mt-1 block">
                        Must be between 25-80 years old
                    </small>
                </div>

                <div>
                    <label class="block mb-1 font-medium">Email*</label>
                    <InputText size="small" v-model="editedDoctor.email" placeholder="example@domain.com" class="w-full"
                        :class="{ 'p-invalid': errors.email }" :disabled="loading" type="email" />
                    <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
                </div>

                <div>
                    <label class="block mb-1 font-medium">Specialty</label>
                    <Dropdown size="small" v-model="editedDoctor.specialty_id" :options="specialties"
                        optionLabel="specialty_name" optionValue="id" placeholder="Select specialty" class="w-full"
                        :disabled="loading" />
                </div>
            </div>
        </div>

        <template #footer>
            <Button label="Cancel" icon="pi pi-times" severity="secondary" @click="closeDialog" :disabled="loading" />
            <Button label="Save" icon="pi pi-check" severity="success" @click="submit" :loading="loading" />
        </template>
    </Dialog>
</template>

<style scoped>
.p-error {
    color: #e24c4c;
    font-size: 0.875rem;
}
</style>