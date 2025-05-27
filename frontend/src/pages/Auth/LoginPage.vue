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

const email = ref(""); // Changed from 'username' to 'email'
const password = ref("");
const toast = useToast();
const router = useRouter();

const loginUser = async () => {
    if (!email.value || !password.value) {
        toast.add({ severity: "warn", summary: "Validation Error", detail: "All fields are required", life: 3000 });
        return;
    }

    try {
        const data = await login(email.value, password.value);
        // Store user session in localStorage
        // localStorage.setItem("user", JSON.stringify(data.user));
        // Show success toast
        toast.add({ severity: "success", summary: "Success", detail: "Login successful!", life: 3000 });
        // Redirect after login
        setTimeout(() => {
            // router.push("/"); // Change to your target page
            window.location.reload();
        }, 2000);
    } catch (error) {
        toast.add({ severity: "error", summary: "Login Failed", detail: error.message, life: 3000 });
    }
};
</script>

<template>
    <div class="flex justify-center items-center min-h-screen">
        <Toast />
        <Card class="w-96 p-4 shadow-lg">
            <template #title>
                <h2 class="text-center">Login</h2>
            </template>
            <template #content>
                <div class="p-fluid">
                    <div class="mb-4">
                        <label for="email" class="block font-medium mb-1">Email</label>
                        <InputText id="email" v-model="email" class="w-full" placeholder="Enter email" />
                    </div>

                    <div class="mb-4">
                        <label for="password" class="block font-medium mb-1">Password</label>
                        <Password id="password" v-model="password" class="w-full" placeholder="Enter password"
                            toggleMask />
                    </div>

                    <Button label="Login" icon="pi pi-sign-in" class="w-full" @click="loginUser" />
                </div>
            </template>
        </Card>
    </div>
</template>

<style scoped>
/* Additional styling (optional) */
</style>
