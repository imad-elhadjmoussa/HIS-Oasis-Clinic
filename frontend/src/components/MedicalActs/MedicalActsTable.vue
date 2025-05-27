<template>
    <div class="table-section">
        <div class="flex justify-between items-center mb-4">
            <h3 class="section-title">Medical Acts</h3>
            <Button label="Add Act" icon="pi pi-plus" class="p-button-sm" @click="$emit('edit-act', 'new')" />
        </div>

        <DataTable :value="acts" :paginator="true" :rows="5" stripedRows class="p-datatable-sm">
            <Column field="code" header="Code" sortable style="width: 100px"></Column>
            <Column field="name" header="Name" sortable></Column>
            <Column header="Specialty">
                <template #body="{ data }">
                    {{ getSpecialtyName(data.specialty) }}
                </template>
            </Column>
            <Column field="price" header="Price" sortable>
                <template #body="{ data }">
                    ${{ data.price }}
                </template>
            </Column>
            <Column header="Actions" style="width: 120px">
                <template #body="{ data }">
                    <div class="flex gap-2">
                        <Button icon="pi pi-pencil" class="p-button-sm p-button-text"
                            @click="$emit('edit-act', data.id)" />
                        <Button icon="pi pi-trash" class="p-button-sm p-button-text p-button-danger"
                            @click="$emit('delete-act', data.id)" />
                    </div>
                </template>
            </Column>
        </DataTable>
    </div>
</template>

<script setup>
const props = defineProps(['acts', 'specialties']);

const getSpecialtyName = (id) => {
    const specialty = props.specialties.find(s => s.id === id);
    return specialty ? specialty.name : 'Unknown';
};
</script>