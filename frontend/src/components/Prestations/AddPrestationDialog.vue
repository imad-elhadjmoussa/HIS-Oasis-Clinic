<script setup>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { Button, Dialog, InputText, Select } from 'primevue';
import { createPrestation } from '../../api/prestation';

const toast = useToast();
const props = defineProps({
    visible: Boolean,
    specialties: Array
});

const emit = defineEmits(['update:visible', 'prestation-created']);

const prestation = ref({
    prestation_name: '',
    prestation_code: '',
    specialty_id: null
});
const loading = ref(false);
const errors = ref({
    prestation_name: false,
    prestation_code: false,
    specialty_id: false
});

const validate = () => {
    let isValid = true;
    errors.value = {
        prestation_name: false,
        prestation_code: false,
        specialty_id: false
    };

    if (!prestation.value.prestation_name.trim()) {
        errors.value.prestation_name = true;
        isValid = false;
    }

    if (!prestation.value.prestation_code.trim()) {
        errors.value.prestation_code = true;
        isValid = false;
    }

    if (!prestation.value.specialty_id) {
        errors.value.specialty_id = true;
        isValid = false;
    }

    return isValid;
};

const submit = async () => {
    if (!validate()) {
        toast.add({
            severity: 'error',
            summary: 'Validation Error',
            detail: 'Please fill all required fields',
            life: 3000,
        });
        return;
    }

    loading.value = true;
    try {
        const data = await createPrestation(prestation.value);
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Prestation created successfully',
            life: 3000,
        });
        emit('prestation-created');
        closeDialog();
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message,
            life: 3000,
        });
    } finally {
        loading.value = false;
    }
};

const closeDialog = () => {
    prestation.value = {
        prestation_name: '',
        prestation_code: '',
        specialty_id: null
    };
    errors.value = {
        prestation_name: false,
        prestation_code: false,
        specialty_id: false
    };
    emit('update:visible', false);
};
</script>

<template>
    <Dialog :visible="visible" @update:visible="$emit('update:visible', $event)" header="Add New Prestation"
        :modal="true" :style="{ width: '450px' }">
        <div class="flex flex-col gap-3">
            <div class="field">
                <label for="prestation_code" class="block">Prestation Code *</label>
                <InputText size="small" id="prestation_code" v-model.trim="prestation.prestation_code" class="w-full"
                    placeholder="Prestation Code" :class="{ 'p-invalid': errors.prestation_code }" />
                <small v-if="errors.prestation_code" class="p-error">Prestation code is required</small>
            </div>

            <div class="field">
                <label for="prestation_name" class="block">Prestation Name *</label>
                <InputText size="small" id="prestation_name" v-model.trim="prestation.prestation_name" class="w-full"
                    placeholder="Prestation Name" :class="{ 'p-invalid': errors.prestation_name }" />
                <small v-if="errors.prestation_name" class="p-error">Prestation name is required</small>
            </div>

            <div class="field">
                <label for="specialty_id" class="block">Specialty *</label>
                <Select size="small" v-model="prestation.specialty_id" optionValue="id" :options="props.specialties"
                    optionLabel="specialty_name" placeholder="Select a Specialty" class="w-full"
                    :class="{ 'p-invalid': errors.specialty_id }" />
                <small v-if="errors.specialty_id" class="p-error">Specialty is required</small>
            </div>
        </div>

        <template #footer>
            <Button size="small" label="Cancel" icon="pi pi-times" class="p-button-secondary" @click="closeDialog" />
            <Button size="small" label="Save" icon="pi pi-check" class="p-button-success" @click="submit"
                :loading="loading" />
        </template>
    </Dialog>
</template>

<style scoped>
.field {
    margin-bottom: 1rem;
}
</style>