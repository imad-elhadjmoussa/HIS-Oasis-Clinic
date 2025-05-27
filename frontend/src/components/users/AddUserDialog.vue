<script setup>
import { ref, defineEmits, defineModel, computed } from "vue";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import Dropdown from "primevue/dropdown";
import { useToast } from "primevue/usetoast";
import { createUser } from "./../../api/users.js";
import DatePicker from "primevue/datepicker";
import InputMask from 'primevue/inputmask';

const props = defineProps({
    roles: {
        type: Array,
        default: () => [],
    },
    specialties: {
        type: Array,
        default: () => [],
    },
    visible: Boolean,
});

const statusOptions = ["active", "inactive"];
const genderOptions = ["male", "female"];

const visible = defineModel("visible");
const toast = useToast();
const emit = defineEmits(["user-created"]);
const errors = ref({});

const newUser = ref({
    first_name: "",
    last_name: "",
    national_id_number: "",
    date_of_birth: "",
    phone_number: "",
    email: "",
    gender: "",
    role: "",
    specialty_id: "",
    status: "active",
    password: "",
});

// Date validation limits
const maxBirthDate = computed(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 18); // At least 18 years old
    return date;
});

const minBirthDate = computed(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 100); // Max 100 years old
    return date;
});

const validateUserForm = () => {
    errors.value = {};
    const nameRegex = /^[a-zA-Z\u00C0-\u017F\s]+$/;
    const phoneRegex = /^(0)(5|6|7)[0-9]{8}$/; // Algerian format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/; // Min 8 chars, at least one letter and one number

    // First name validation
    if (!newUser.value.first_name) {
        errors.value.first_name = 'First name is required';
    } else if (!nameRegex.test(newUser.value.first_name)) {
        errors.value.first_name = 'First name can only contain letters and spaces';
    }

    // Last name validation
    if (!newUser.value.last_name) {
        errors.value.last_name = 'Last name is required';
    } else if (!nameRegex.test(newUser.value.last_name)) {
        errors.value.last_name = 'Last name can only contain letters and spaces';
    }

    // National ID validation
    if (!newUser.value.national_id_number) {
        errors.value.national_id_number = 'National ID is required';
    } else if (newUser.value.national_id_number.length !== 18) {
        errors.value.national_id_number = 'National ID must be 18 digits';
    } else if (!/^\d+$/.test(newUser.value.national_id_number)) {
        errors.value.national_id_number = 'National ID must contain only numbers';
    }

    // Date of Birth validation
    if (!newUser.value.date_of_birth) {
        errors.value.date_of_birth = 'Date of birth is required';
    } else {
        const dob = new Date(newUser.value.date_of_birth);
        const today = new Date();

        if (isNaN(dob.getTime())) {
            errors.value.date_of_birth = 'Please enter a valid date (dd/mm/yyyy)';
        } else if (dob > today) {
            errors.value.date_of_birth = 'Date cannot be in the future';
        } else if (dob < minBirthDate.value) {
            errors.value.date_of_birth = 'Maximum age allowed is 100 years';
        } else if (dob > maxBirthDate.value) {
            errors.value.date_of_birth = 'Minimum age required is 18 years';
        }
    }

    // Phone validation
    if (!newUser.value.phone_number) {
        errors.value.phone_number = 'Phone number is required';
    } else if (!phoneRegex.test(newUser.value.phone_number)) {
        errors.value.phone_number = 'Please enter a valid Algerian phone number (e.g., 05XX XXX XXX)';
    }

    // Email validation
    if (!newUser.value.email) {
        errors.value.email = 'Email is required';
    } else if (!emailRegex.test(newUser.value.email)) {
        errors.value.email = 'Please enter a valid email address';
    }

    // Role validation
    if (!newUser.value.role) {
        errors.value.role = 'Role is required';
    } else if (newUser.value.role === 'Manager' && !newUser.value.specialty_id) {
        errors.value.specialty_id = 'Specialty is required for Manager role';
    }

    // Password validation
    if (!newUser.value.password) {
        errors.value.password = 'Password is required';
    } else if (!passwordRegex.test(newUser.value.password)) {
        errors.value.password = 'Password must be at least 8 characters with at least one letter and one number';
    }

    return Object.keys(errors.value).length === 0;
};

const addUser = async () => {
    if (validateUserForm()) {
        try {
            const createdUser = await createUser(newUser.value);
            emit("user-created");
            toast.add({
                severity: "success",
                summary: "Success",
                detail: createdUser.message,
                life: 3000,
            });
            resetForm();
            visible.value = false;
        } catch (error) {
            toast.add({
                severity: "error",
                summary: "Error",
                detail: error.message,
                life: 3000,
            });
            // Handle API validation errors
            if (error.response?.data?.errors) {
                errors.value = { ...errors.value, ...error.response.data.errors };
            }
        }
    }
};

const resetForm = () => {
    newUser.value = {
        first_name: "",
        last_name: "",
        national_id_number: "",
        date_of_birth: "",
        phone_number: "",
        email: "",
        gender: "",
        role: "",
        specialty_id: "",
        status: "active",
        password: "",
    };
    errors.value = {};
};
</script>

<template>
    <Dialog v-model:visible="visible" class="w-full max-w-[700px]" header="Add New User" modal>
        <form class="p-fluid flex flex-col px-5 gap-3" @submit.prevent="addUser">
            <div class="grid grid-cols-2 gap-4">
                <!-- Column 1 -->
                <div class="space-y-3">
                    <div>
                        <label class="block mb-1">First Name*</label>
                        <InputText size="small" v-model="newUser.first_name" placeholder="Enter first name"
                            class="w-full" :class="{ 'p-invalid': errors.first_name }" />
                        <small v-if="errors.first_name" class="p-error">{{ errors.first_name }}</small>
                    </div>

                    <div>
                        <label class="block mb-1">National ID*</label>
                        <InputMask size="small" v-model="newUser.national_id_number" mask="999999999999999999"
                            placeholder="18-digit number" class="w-full"
                            :class="{ 'p-invalid': errors.national_id_number }" />
                        <small v-if="errors.national_id_number" class="p-error">{{ errors.national_id_number }}</small>
                    </div>

                    <div>
                        <label class="block mb-1">Phone Number*</label>
                        <InputMask size="small" v-model="newUser.phone_number" mask="9999999999"
                            placeholder="05XX XXX XXX" class="w-full" :class="{ 'p-invalid': errors.phone_number }" />
                        <small v-if="errors.phone_number" class="p-error">{{ errors.phone_number }}</small>
                    </div>

                    <div>
                        <label class="block mb-1">Gender</label>
                        <Dropdown size="small" v-model="newUser.gender" :options="genderOptions"
                            placeholder="Select gender" class="w-full" />
                    </div>

                    <div>
                        <label class="block mb-1">Specialty</label>
                        <Dropdown size="small" v-model="newUser.specialty_id" :options="specialties"
                            optionLabel="specialty_name" optionValue="id" placeholder="Select specialty" class="w-full"
                            :class="{ 'p-invalid': errors.specialty_id }" :disabled="newUser.role !== 'Manager'" />
                        <small v-if="errors.specialty_id" class="p-error">{{ errors.specialty_id }}</small>
                        <small v-else-if="newUser.role === 'Manager'" class="text-xs text-gray-500 mt-1 block">
                            Required for Manager role
                        </small>
                    </div>
                </div>

                <!-- Column 2 -->
                <div class="space-y-3">
                    <div>
                        <label class="block mb-1">Last Name*</label>
                        <InputText size="small" v-model="newUser.last_name" placeholder="Enter last name" class="w-full"
                            :class="{ 'p-invalid': errors.last_name }" />
                        <small v-if="errors.last_name" class="p-error">{{ errors.last_name }}</small>
                    </div>

                    <div>
                        <label class="block mb-1">Date of Birth</label>
                        <DatePicker v-model="newUser.date_of_birth" showIcon fluid :showOnFocus="false"
                            :maxDate="maxBirthDate" :minDate="minBirthDate" size="small" dateFormat="dd/mm/yy"
                            class="w-full" placeholder="dd/mm/yyyy" :class="{ 'p-invalid': errors.date_of_birth }" />
                        <small v-if="errors.date_of_birth" class="p-error">{{ errors.date_of_birth }}</small>
                    </div>

                    <div>
                        <label class="block mb-1">Email*</label>
                        <InputText size="small" v-model="newUser.email" placeholder="user@example.com" class="w-full"
                            :class="{ 'p-invalid': errors.email }" />
                        <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
                    </div>

                    <div>
                        <label class="block mb-1">Role*</label>
                        <Dropdown size="small" v-model="newUser.role" :options="props.roles" placeholder="Select role"
                            class="w-full" :class="{ 'p-invalid': errors.role }" />
                        <small v-if="errors.role" class="p-error">{{ errors.role }}</small>
                    </div>

                    <div>
                        <label class="block mb-1">Password*</label>
                        <InputText size="small" type="password" v-model="newUser.password" placeholder="Create password"
                            class="w-full" :class="{ 'p-invalid': errors.password }" />
                        <small v-if="errors.password" class="p-error">{{ errors.password }}</small>
                    </div>

                    <div>
                        <label class="block mb-1">Status</label>
                        <Dropdown size="small" v-model="newUser.status" :options="statusOptions" class="w-full" />
                    </div>
                </div>
            </div>

            <div class="mt-6 flex gap-3 justify-end">
                <Button size="small" class="w-24" label="Cancel" severity="secondary" icon="pi pi-times"
                    @click="visible = false" />
                <Button size="small" label="Save" icon="pi pi-check" type="submit" class="p-button-primary w-24" />
            </div>
        </form>
    </Dialog>
</template>