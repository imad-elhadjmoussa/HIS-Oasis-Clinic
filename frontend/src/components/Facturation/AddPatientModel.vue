<script setup>
import { ref } from "vue";
// import { useToast } from "primevue/usetoast";
import InputText from "primevue/inputtext";
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import InputMask from 'primevue/inputmask';
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import { createPatient, validatePatient } from "../api/patient";
import { Toast } from "primevue";
import {  bloodTypes, genders, showNotification } from "../api/index";

// const toast = useToast();
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

const emit = defineEmits(['update:visible']);

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

const addPatient = async () => {
    try {
        // Validate required fields
        validatePatient(newPatient.value);
        // Call API service
        const createdPatient = await createPatient(newPatient.value);
        // Update local state (if using Vue, React, etc.)
        props.patients.unshift(createdPatient.patient);
        // Show success message
        showNotification(toast, createdPatient.message, 'success');
        // Reset the form
        newPatient.value = {
            national_id_number: "",
            first_name: "",
            last_name: "",
            birth_date: "",
            phone_number: "",
            email: "",
            address: "",
            gender: "",
            blood_type: ""
        };
        // Close the dialog
        closeDialog();

    } catch (error) {
        // Handle errors
        showNotification(toast, error.message || 'Failed to add patient', 'error');
    }
};

const closeDialog = () => {
    emit('update:visible', false);
};
</script>

<template>
    <!-- <Toast /> -->
    <Dialog :visible="visible" @update:visible="closeDialog" :style="{ width: '700px' }" header="Add New Patient"
        :modal="true">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">National ID*</label>
                <InputMask size="small" v-model="newPatient.national_id_number" mask="9999999999" placeholder="XXXXXXXXXX"
                    class="w-full" />
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">First Name*</label>
                <InputText size="small" placeholder="First Name" v-model="newPatient.first_name" class="w-full"
                    required />
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Last Name*</label>
                <InputText size="small" placeholder="Last Name" v-model="newPatient.last_name" class="w-full"
                    required />
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Date of Birth*</label>
                <Calendar size="small" placeholder="Birth Date" v-model="newPatient.date_of_birth" dateFormat="yy-mm-dd"
                    class="w-full" />
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <Dropdown size="small" v-model="newPatient.gender" :options="genders" placeholder="Select gender"
                    class="w-full" />
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Phone*</label>
                <InputMask size="small" v-model="newPatient.phone_number" mask="9999999999" placeholder="0XXXXXXXXX"
                    class="w-full" />
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <InputText size="small" placeholder="Email" v-model="newPatient.email" type="email" class="w-full" />
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
                <Dropdown size="small" v-model="newPatient.blood_type" :options="bloodTypes"
                    placeholder="Select blood type" class="w-full" />
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <InputText size="small" placeholder="Address" v-model="newPatient.address" class="w-full" />
            </div>
        </div>
        <template #footer>
            <Button size="small" label="Cancel" icon="pi pi-times" @click="closeDialog" class="p-button-secondary" />
            <Button size="small" label="Add" icon="pi pi-plus" @click="addPatient" class="p-button-success" />
        </template>
    </Dialog>
</template>