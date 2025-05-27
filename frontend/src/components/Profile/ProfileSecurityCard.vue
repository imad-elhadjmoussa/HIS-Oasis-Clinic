<template>
    <Card>
        <template #title>
            <h4 class="text-700">Account Security</h4>
        </template>
        <template #content>
            <Button label="Change Password" icon="pi pi-lock"
                class="p-button-text w-full text-left justify-content-start" />
            <Button label="Two-Factor Auth" icon="pi pi-shield"
                class="p-button-text w-full text-left justify-content-start mt-2" />
            <Divider />
            <div class="field">
                <label class="text-600">Account Status</label>
                <InputText :value="user.status" disabled class="w-full capitalize" />
            </div>
            <div class="field">
                <label class="text-600">Member Since</label>
                <InputText :value="formatDate(user.created_at)" disabled class="w-full" />
            </div>
        </template>
    </Card>
</template>

<script setup>
import { computed } from 'vue';
import { useUserStore } from '../../stors/user';
import { Button } from 'primevue';

const userStore = useUserStore();

const user = computed(() => userStore.user);

const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};
</script>