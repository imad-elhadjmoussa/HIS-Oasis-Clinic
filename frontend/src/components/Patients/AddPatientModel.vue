<script setup>
import { ref } from "vue";
import { useToast } from "primevue/usetoast";
import InputText from "primevue/inputtext";
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import InputMask from 'primevue/inputmask';
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import { createPatient } from "../../api/patient";
import { DatePicker, Toast } from "primevue";
import { bloodTypes, genders, showNotification } from "../../pages/Reception";

const toast = useToast();
const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    },
    patients: {
        type: Array,
        required: true
    },
});

const emit = defineEmits(['update:visible', 'patient-added']);

const newPatient = ref({
    national_id_number: "",
    first_name: "",
    last_name: "",
    date_of_birth: "",
    phone_number: "",
    email: "",
    address: "",
    gender: "",
    blood_type: ""
});

const errors = ref({});

const validatePatientForm = () => {
    errors.value = {};
    const nameRegex = /^[a-zA-Z\u00C0-\u017F\s]+$/;
    const phoneRegex = /^(0)(5|6|7)[0-9]{8}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // National ID validation
    if (!newPatient.value.national_id_number) {
        errors.value.national_id_number = 'National ID is required';
    } else if (newPatient.value.national_id_number.length !== 18) {
        errors.value.national_id_number = 'National ID must be 18 digits';
    } else if (!/^\d+$/.test(newPatient.value.national_id_number)) {
        errors.value.national_id_number = 'National ID must contain only numbers';
    }

    // First name validation
    if (!newPatient.value.first_name) {
        errors.value.first_name = 'First name is required';
    } else if (!nameRegex.test(newPatient.value.first_name)) {
        errors.value.first_name = 'First name can only contain letters and spaces';
    }

    // Last name validation
    if (!newPatient.value.last_name) {
        errors.value.last_name = 'Last name is required';
    } else if (!nameRegex.test(newPatient.value.last_name)) {
        errors.value.last_name = 'Last name can only contain letters and spaces';
    }

    // Enhanced Date of Birth validation
    if (!newPatient.value.date_of_birth) {
        errors.value.date_of_birth = 'Date of birth is required';
    } else {
        const dob = new Date(newPatient.value.date_of_birth);
        const today = new Date();
        const minDate = new Date();
        minDate.setFullYear(today.getFullYear() - 120); // 120 years ago
        const maxDate = new Date();
        maxDate.setFullYear(today.getFullYear() - 1); // At least 1 year old

        if (isNaN(dob.getTime())) {
            errors.value.date_of_birth = 'Please enter a valid date';
        } else if (dob > today) {
            errors.value.date_of_birth = 'Date of birth cannot be in the future';
        } else if (dob < minDate) {
            errors.value.date_of_birth = 'Patient age cannot exceed 120 years';
        } else if (dob > maxDate) {
            errors.value.date_of_birth = 'Patient must be at least 1 year old';
        }
    }

    // Phone validation
    if (!newPatient.value.phone_number) {
        errors.value.phone_number = 'Phone number is required';
    } else if (!phoneRegex.test(newPatient.value.phone_number)) {
        errors.value.phone_number = 'Please enter a valid Algerian phone number (e.g., 05XX XXX XXX)';
    }

    // Email validation
    if (newPatient.value.email && !emailRegex.test(newPatient.value.email)) {
        errors.value.email = 'Please enter a valid email address';
    }

    return Object.keys(errors.value).length === 0;
};

const resetForm = () => {
    newPatient.value = {
        national_id_number: "",
        first_name: "",
        last_name: "",
        date_of_birth: "",
        phone_number: "",
        email: "",
        address: "",
        gender: "",
        blood_type: ""
    };
    errors.value = {};
};

const validateAndSubmit = async () => {
    if (validatePatientForm()) {
        await addPatient();
    }
};

const addPatient = async () => {
    try {
        // Call API service
        const createdPatient = await createPatient(newPatient.value);

        // Emit event to parent component
        emit('patient-added');

        // Show success message
        showNotification(toast, createdPatient.message, 'success');

        // Reset the form
        resetForm();

        // Close the dialog
        closeDialog();

    } catch (error) {
        // Handle errors
        showNotification(toast, error.message || 'Failed to add patient', 'error');

        // Handle API validation errors
        if (error.response && error.response.data.errors) {
            errors.value = { ...errors.value, ...error.response.data.errors };
        }
    }
};

const closeDialog = () => {
    resetForm();
    emit('update:visible', false);
};
</script>

<template>
    <Toast />
    <Dialog :visible="visible" @update:visible="closeDialog" :style="{ width: '750px' }" header="Add New Patient"
        :modal="true">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- National ID -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">National ID*</label>
                <InputMask size="small" v-model="newPatient.national_id_number" mask="999999999999999999"
                    placeholder="18-digit number" class="w-full" :class="{ 'p-invalid': errors.national_id_number }" />
                <small v-if="errors.national_id_number" class="p-error">{{ errors.national_id_number }}</small>
            </div>

            <!-- First Name -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">First Name*</label>
                <InputText size="small" placeholder="First Name" v-model="newPatient.first_name" class="w-full"
                    :class="{ 'p-invalid': errors.first_name }" />
                <small v-if="errors.first_name" class="p-error">{{ errors.first_name }}</small>
            </div>

            <!-- Last Name -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Last Name*</label>
                <InputText size="small" placeholder="Last Name" v-model="newPatient.last_name" class="w-full"
                    :class="{ 'p-invalid': errors.last_name }" />
                <small v-if="errors.last_name" class="p-error">{{ errors.last_name }}</small>
            </div>

            <!-- Date of Birth -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Date of Birth*</label>
                <DatePicker size="small" v-model="newPatient.date_of_birth" dateFormat="dd/mm/yy"
                    placeholder="dd/mm/yyyy" showIcon fluid :showOnFocus="false"
                    :class="{ 'p-invalid': errors.date_of_birth }" />
                <small v-if="errors.date_of_birth" class="p-error">{{ errors.date_of_birth }}</small>
            </div>

            <!-- Gender -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <Dropdown size="small" v-model="newPatient.gender" :options="genders" placeholder="Select gender"
                    class="w-full" />
            </div>

            <!-- Phone -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Phone*</label>
                <InputMask size="small" v-model="newPatient.phone_number" mask="9999999999" placeholder="0XXXXXXXXX"
                    class="w-full" :class="{ 'p-invalid': errors.phone_number }" />
                <small v-if="errors.phone_number" class="p-error">{{ errors.phone_number }}</small>
            </div>

            <!-- Email -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <InputText size="small" placeholder="Email" v-model="newPatient.email" type="email" class="w-full"
                    :class="{ 'p-invalid': errors.email }" />
                <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
            </div>

            <!-- Blood Type -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
                <Dropdown size="small" v-model="newPatient.blood_type" :options="bloodTypes"
                    placeholder="Select blood type" class="w-full" />
            </div>

            <!-- Address -->
            <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <InputText size="small" placeholder="Address" v-model="newPatient.address" class="w-full" />
            </div>
        </div>

        <template #footer>
            <Button size="small" label="Cancel" icon="pi pi-times" @click="closeDialog" class="p-button-secondary" />
            <Button size="small" label="Add" icon="pi pi-plus" @click="validateAndSubmit" class="p-button-success" />
        </template>
    </Dialog>
</template>