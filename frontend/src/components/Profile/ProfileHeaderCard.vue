<template>
    <Card >
        <template #content>
            <div class="flex flex-column align-items-center gap-4">
                <div class="relative">
                    <img src="../../assets/examination.png" class=" size-20 rounded-full border-circle shadow-3"
                        alt="User Avatar" />
                    <Button icon="pi pi-camera"
                        class="absolute bottom-0 right-0 w-3rem h-3rem border-circle bg-indigo-500"
                        @click="openAvatarDialog" />
                </div>

                <div class="text-center">
                    <h3 class="mb-1 text-900">{{ fullName }}</h3>
                    <Tag :value="user.role" class="capitalize" :severity="roleSeverity" />
                </div>
            </div>
        </template>
    </Card>
</template>

<script setup>
import { computed } from 'vue';
import { useUserStore } from '../../stors/user';
import { useToast } from 'primevue/usetoast';
import { Card, Tag } from 'primevue';

const userStore = useUserStore();
const toast = useToast();

const user = computed(() => userStore.user);
const fullName = computed(() => userStore.fullName);

const roleSeverity = computed(() => {
    switch (user.value?.role) {
        case 'admin': return 'danger';
        case 'doctor': return 'info';
        case 'patient': return 'success';
        default: return null;
    }
});

const openAvatarDialog = () => {
    toast.add({
        severity: 'info',
        summary: 'Coming Soon',
        detail: 'Avatar upload feature will be available soon',
        life: 3000
    });
};
</script>