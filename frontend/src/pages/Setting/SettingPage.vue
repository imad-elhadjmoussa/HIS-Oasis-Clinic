<template>

    <ProfileInfoCard :user="user" :loading="loading" @edit="openEditDialog" />

    <EditProfileDialog v-model:visible="editDialogVisible" :user="user" @saved="handleProfileSaved" />

</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useUserStore } from '../../stors/user';
import EditProfileDialog from '../../components/Profile/EditProfileDialog.vue';
import ProfileInfoCard from '../../components/Profile/ProfileInfoCard.vue';
import ProfileHeaderCard from '../../components/Profile/ProfileHeaderCard.vue';
import ProfileSecurityCard from '../../components/Profile/ProfileSecurityCard.vue';
import { Card, Button, ProgressSpinner, Message } from 'primevue';


// Components


const userStore = useUserStore();
const toast = useToast();
const editDialogVisible = ref(false);

// Computed properties
const loading = computed(() => userStore.loading);
const isAuthenticated = computed(() => userStore.isAuthenticated);
const user = computed(() => userStore.user);

const openEditDialog = () => {
    editDialogVisible.value = true;
};

const handleProfileSaved = () => {
    toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Profile updated successfully',
        life: 3000
    });
};

// Fetch user data on mount
onMounted(async () => {
    if (!userStore.user) {
        await userStore.fetchSession();
    }
});
</script>

<style scoped>
.settings-container {
    max-width: 1400px;
    margin: 2rem auto;
    padding: 1rem;
}
</style>