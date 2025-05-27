<script setup>
import { ref } from "vue";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import Button from "primevue/button";
import Card from "primevue/card";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import { useRouter } from "vue-router";
import { login } from "../../api/auth";

const email = ref("");
const password = ref("");
const toast = useToast();
const router = useRouter();
const isLoading = ref(false);

const loginUser = async () => {
    if (!email.value || !password.value) {
        toast.add({ severity: "warn", summary: "Validation Error", detail: "All fields are required", life: 3000 });
        return;
    }

    isLoading.value = true;

    try {
        const data = await login(email.value, password.value);
        toast.add({ severity: "success", summary: "Success", detail: "Login successful!", life: 3000 });
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    } catch (error) {
        toast.add({ severity: "error", summary: "Login Failed", detail: error.message, life: 3000 });
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <div class="login-container">
        <Toast position="top-right" />
        <Card class="login-card">
            <template #header>
                <div class="flex justify-content-center">
                    <img src="https://via.placeholder.com/150x50?text=Logo" alt="Company Logo" class="logo"
                        v-if="false" />
                </div>
            </template>
            <template #title>
                <h2 class="text-center text-2xl font-bold text-gray-800">Welcome Back</h2>
                <p class="text-center text-gray-600 mt-2">Please login to your account</p>
            </template>
            <template #content>
                <div class="p-fluid">
                    <div class="field mb-5">
                        <label for="email" class="block font-medium mb-2 text-gray-700">Email Address</label>
                        <InputText id="email" v-model="email" class="w-full" placeholder="your@email.com"
                            autocomplete="email" />
                    </div>

                    <div class="field mb-1">
                        <label for="password" class="block font-medium mb-2 text-gray-700">Password</label>
                        <Password id="password" v-model="password" class="w-full" placeholder="Enter password"
                            toggleMask :feedback="false" inputClass="w-full" autocomplete="current-password" />
                    </div>

                    <div class="flex justify-end mb-5">
                        <router-link to="/forgot-password"
                            class="text-sm text-primary-600 hover:text-primary-800 hover:underline">
                            Forgot password?
                        </router-link>
                    </div>

                    <Button label="Login" icon="pi pi-sign-in" class="w-full p-3" :loading="isLoading"
                        @click="loginUser" />
                </div>
            </template>

            <template #footer>
                <div class="text-center text-xs text-gray-500 mt-4">
                    By continuing, you agree to our <a href="#" class="hover:underline">Terms of Service</a> and <a
                        href="#" class="hover:underline">Privacy Policy</a>.
                </div>
            </template>
        </Card>
    </div>
</template>

<style scoped>
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    padding: 1rem;
}

.login-card {
    width: 100%;
    max-width: 420px;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
    border: none;
}

.logo {
    height: 50px;
    margin-bottom: 1.5rem;
}

:deep(.p-card-title) {
    margin-bottom: 0.5rem;
}

:deep(.p-card-content) {
    padding-bottom: 0;
}

:deep(.p-password input) {
    width: 100%;
}

:deep(.p-button) {
    background-color: var(--primary-color);
    border-color: var(--primary-color);
    transition: all 0.3s ease;
}

:deep(.p-button:hover) {
    background-color: var(--primary-600);
    border-color: var(--primary-600);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

:deep(.p-inputtext:focus) {
    box-shadow: 0 0 0 0.2rem rgba(100, 181, 246, 0.25);
    border-color: var(--primary-color);
}
</style>