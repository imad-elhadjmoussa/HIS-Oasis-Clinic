<script setup>
import { ref, watch } from 'vue';
import { Button, InputText } from 'primevue';
import { useToast } from 'primevue/usetoast';
import Dialog from 'primevue/dialog';
import { updateSpecialty } from '../../api/specialty';

const toast = useToast();
const props = defineProps({
    visible: Boolean,
    specialty: Object
});

const emit = defineEmits(['update:visible', 'update:specialty', 'specialty-updated']);

const editedSpecialty = ref({
    specialty_name: '',
    specialty_code: '',
    description: '',
    ...props.specialty
});
const loading = ref(false);
const errors = ref({
    specialty_name: false,
    specialty_code: false
});

watch(() => props.specialty, (newVal) => {
    editedSpecialty.value = {
        specialty_name: '',
        specialty_code: '',
        description: '',
        ...newVal
    };
    // Reset errors when specialty changes
    errors.value = {
        specialty_name: false,
        specialty_code: false
    };
});

const validate = () => {
    let valid = true;
    errors.value = {
        specialty_name: false,
        specialty_code: false
    };

    if (!editedSpecialty.value.specialty_name?.trim()) {
        errors.value.specialty_name = true;
        valid = false;
    }

    if (!editedSpecialty.value.specialty_code?.trim()) {
        errors.value.specialty_code = true;
        valid = false;
    }

    return valid;
};

const submit = async () => {
    if (!validate()) {
        toast.add({
            severity: 'error',
            summary: 'Validation Error',
            detail: 'Name and Code are required fields',
            life: 3000,
        });
        return;
    }

    loading.value = true;
    try {
        const data = await updateSpecialty(editedSpecialty.value.id, editedSpecialty.value);
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: data.message,
            life: 3000,
        });
        emit('specialty-updated');
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
    emit('update:visible', false);
};
</script>

<template>
    <Dialog :visible="visible" @update:visible="$emit('update:visible', $event)" header="Edit Specialty" :modal="true"
        :style="{ width: '450px' }" :closable="false">
        <div class="flex flex-col gap-3">
            <!-- Specialty Name (Required) -->
            <div class="field">
                <label for="specialty_name" class="block">Specialty Name *</label>
                <InputText size="small" placeholder="Specialty Name" id="specialty_name"
                    v-model.trim="editedSpecialty.specialty_name" class="w-full"
                    :class="{ 'p-invalid': errors.specialty_name }" autofocus />
                <small v-if="errors.specialty_name" class="p-error">Specialty name is required</small>
            </div>

            <!-- Specialty Code (Required) -->
            <div class="field">
                <label for="specialty_code" class="block">Specialty Code *</label>
                <InputText size="small" placeholder="Specialty Code" id="specialty_code"
                    v-model.trim="editedSpecialty.specialty_code" class="w-full"
                    :class="{ 'p-invalid': errors.specialty_code }" />
                <small v-if="errors.specialty_code" class="p-error">Specialty code is required</small>
            </div>

            <!-- Description (Optional) -->
            <div class="field">
                <label for="description" class="block">Description</label>
                <InputText size="small" placeholder="Description" id="description"
                    v-model.trim="editedSpecialty.description" class="w-full" />
            </div>
        </div>

        <template #footer>
            <div class="flex justify-content-end gap-2">
                <Button size="small" label="Cancel" icon="pi pi-times" class="p-button-secondary"
                    @click="closeDialog" />
                <Button size="small" label="Save" icon="pi pi-check" class="p-button-success" @click="submit"
                    :loading="loading" />
            </div>
        </template>
    </Dialog>
</template>

<style scoped>
.field {
    margin-bottom: 1rem;
}
</style>