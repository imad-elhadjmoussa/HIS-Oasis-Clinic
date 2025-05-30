<script setup>
import { ref, onMounted } from "vue";
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
const isPageLoaded = ref(false);
const loginState = ref('idle'); // 'idle', 'loading', 'success', 'error'

// Animation triggers
onMounted(() => {
    setTimeout(() => {
        isPageLoaded.value = true;
    }, 100);
});

const loginUser = async () => {
    if (!email.value || !password.value) {
        toast.add({ severity: "warn", summary: "Validation Error", detail: "All fields are required", life: 3000 });
        // Shake animation for validation error
        loginState.value = 'error';
        setTimeout(() => {
            loginState.value = 'idle';
        }, 600);
        return;
    }

    isLoading.value = true;
    loginState.value = 'loading';

    try {
        const data = await login(email.value, password.value);
        loginState.value = 'success';
        toast.add({ severity: "success", summary: "Success", detail: "Login successful!", life: 3000 });
        
        // Success animation sequence
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    } catch (error) {
        loginState.value = 'error';
        toast.add({ severity: "error", summary: "Login Failed", detail: error.message, life: 3000 });
        
        // Reset state after error animation
        setTimeout(() => {
            loginState.value = 'idle';
        }, 600);
    } finally {
        setTimeout(() => {
            isLoading.value = false;
        }, 500);
    }
};
</script>

<template>
    <div class="login-container" :class="{ 'page-loaded': isPageLoaded }">
        <Toast position="top-right" />
        
        <!-- Background Medical Pattern -->
        <div class="medical-bg">
            <div class="medical-cross medical-cross-1"></div>
            <div class="medical-cross medical-cross-2"></div>
            <div class="medical-cross medical-cross-3"></div>
            <div class="medical-cross medical-cross-4"></div>
        </div>

        <!-- Success Overlay -->
        <div class="success-overlay" :class="{ 'show': loginState === 'success' }">
            <div class="success-animation">
                <div class="checkmark-container">
                    <div class="checkmark">
                        <div class="checkmark-circle"></div>
                        <div class="checkmark-stem"></div>
                        <div class="checkmark-kick"></div>
                    </div>
                </div>
                <h3>Login Successful!</h3>
                <p>Redirecting to dashboard...</p>
            </div>
        </div>

        <Card class="login-card" :class="{ 
            'shake': loginState === 'error', 
            'success-glow': loginState === 'success',
            'loading-pulse': loginState === 'loading'
        }">
            <template #header>
                <div class="clinic-header">
                    <div class="logo-container">
                        <div class="clinic-info">
                            <h1 class="clinic-name">HIS Clinique des Oasis</h1>
                            <p class="clinic-subtitle">Hospital Information System</p>
                        </div>
                    </div>
                </div>
            </template>
            
            <template #title>
                <div class="login-title">
                    <h2>Welcome Back</h2>
                    <p>Please sign in to access the system</p>
                </div>
            </template>
            
            <template #content>
                <div class="login-form">
                    <div class="field">
                        <label for="email" class="field-label">
                            <i class="pi pi-envelope"></i>
                            Email Address
                        </label>
                        <InputText 
                            id="email" 
                            v-model="email" 
                            class="field-input" 
                            placeholder="doctor@clinique-oasis.com"
                            autocomplete="email"
                            :disabled="loginState === 'loading' || loginState === 'success'"
                        />
                    </div>

                    <div class="field">
                        <label for="password" class="field-label">
                            <i class="pi pi-lock"></i>
                            Password
                        </label>
                        <Password 
                            id="password" 
                            v-model="password" 
                            class="field-input" 
                            placeholder="Enter your password"
                            toggleMask 
                            :feedback="false" 
                            inputClass="w-full" 
                            autocomplete="current-password"
                            :disabled="loginState === 'loading' || loginState === 'success'"
                        />
                    </div>

                    <Button 
                        :label="loginState === 'success' ? 'Success!' : 'Sign In'" 
                        :icon="loginState === 'success' ? 'pi pi-check' : 'pi pi-sign-in'" 
                        class="login-button" 
                        :class="{ 'success-button': loginState === 'success' }"
                        :loading="isLoading"
                        :disabled="loginState === 'success'"
                        @click="loginUser" 
                    />
                </div>
            </template>

            <template #footer>
                <div class="login-footer">
                    <p class="footer-text">
                        © 2025 Clinique des Oasis. All rights reserved.
                    </p>
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
    background: linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%);
    padding: 2rem 1rem;
    position: relative;
    overflow: hidden;
    opacity: 0;
    transform: translateY(20px);
    animation: pageEntrance 0.8s ease-out forwards;
}

.login-container.page-loaded {
    opacity: 1;
    transform: translateY(0);
}

/* Page Load Animation */
@keyframes pageEntrance {
    0% {
        opacity: 0;
        transform: translateY(20px);
    }
    100% {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Medical Background Pattern */
.medical-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    opacity: 0;
    animation: bgFadeIn 1.2s ease-out 0.3s forwards;
}

@keyframes bgFadeIn {
    to {
        opacity: 0.03;
    }
}

.medical-cross {
    position: absolute;
    width: 40px;
    height: 40px;
    background: #10b981;
    transform: rotate(45deg);
}

.medical-cross::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 60px;
    height: 8px;
    background: #10b981;
}

.medical-cross::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 8px;
    height: 60px;
    background: #10b981;
}

.medical-cross-1 { top: 10%; left: 15%; animation: float 6s ease-in-out infinite; }
.medical-cross-2 { top: 20%; right: 20%; animation: float 8s ease-in-out infinite reverse; }
.medical-cross-3 { bottom: 30%; left: 10%; animation: float 7s ease-in-out infinite; }
.medical-cross-4 { bottom: 15%; right: 15%; animation: float 9s ease-in-out infinite reverse; }

@keyframes float {
    0%, 100% { transform: translateY(0px) rotate(45deg); }
    50% { transform: translateY(-20px) rotate(45deg); }
}

/* Success Overlay */
.success-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(16, 185, 129, 0.95);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    opacity: 0;
    visibility: hidden;
    backdrop-filter: blur(10px);
    transition: all 0.5s ease;
}

.success-overlay.show {
    opacity: 1;
    visibility: visible;
}

.success-animation {
    text-align: center;
    color: white;
    transform: scale(0.8);
    animation: successPop 0.6s ease-out forwards;
}

@keyframes successPop {
    0% {
        transform: scale(0.8);
        opacity: 0;
    }
    50% {
        transform: scale(1.1);
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
}

.success-animation h3 {
    font-size: 2rem;
    margin: 1rem 0 0.5rem;
    font-weight: 700;
}

.success-animation p {
    font-size: 1.1rem;
    opacity: 0.9;
    margin: 0;
}

/* Checkmark Animation */
.checkmark-container {
    margin-bottom: 1rem;
}

.checkmark {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: block;
    stroke-width: 4;
    stroke: white;
    stroke-miterlimit: 10;
    margin: 0 auto;
    box-shadow: inset 0px 0px 0px white;
    animation: checkmarkFill 0.4s ease-in-out 0.4s forwards, checkmarkScale 0.3s ease-in-out 0.9s both;
    position: relative;
    background: rgba(255, 255, 255, 0.1);
    border: 3px solid white;
}

.checkmark-circle {
    stroke-dasharray: 166;
    stroke-dashoffset: 166;
    stroke-width: 3;
    stroke-miterlimit: 10;
    stroke: white;
    fill: none;
    animation: checkmarkStroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.checkmark-stem {
    position: absolute;
    width: 3px;
    height: 16px;
    background: white;
    left: 32px;
    top: 40px;
    transform: rotate(45deg);
    transform-origin: bottom;
    animation: checkmarkStem 0.3s ease-in-out 0.9s both;
}

.checkmark-kick {
    position: absolute;
    width: 3px;
    height: 8px;
    background: white;
    left: 25px;
    top: 44px;
    transform: rotate(-45deg);
    transform-origin: bottom;
    animation: checkmarkKick 0.2s ease-in-out 1.1s both;
}

@keyframes checkmarkStroke {
    100% {
        stroke-dashoffset: 0;
    }
}

@keyframes checkmarkScale {
    0%, 100% {
        transform: none;
    }
    50% {
        transform: scale3d(1.1, 1.1, 1);
    }
}

@keyframes checkmarkFill {
    100% {
        box-shadow: inset 0px 0px 0px 60px rgba(255, 255, 255, 0.2);
    }
}

@keyframes checkmarkStem {
    0% {
        height: 0;
        opacity: 0;
    }
    100% {
        height: 16px;
        opacity: 1;
    }
}

@keyframes checkmarkKick {
    0% {
        height: 0;
        opacity: 0;
    }
    100% {
        height: 8px;
        opacity: 1;
    }
}

/* Card Styling */
.login-card {
    width: 100%;
    max-width: 480px;
    background: #ffffff;
    border-radius: 20px;
    box-shadow: 
        0 20px 40px rgba(0, 0, 0, 0.1),
        0 0 0 1px rgba(255, 255, 255, 0.8);
    border: none;
    backdrop-filter: blur(10px);
    position: relative;
    overflow: hidden;
    transform: translateY(30px);
    opacity: 0;
    animation: cardEntrance 0.8s ease-out 0.2s forwards;
    transition: all 0.3s ease;
}

@keyframes cardEntrance {
    0% {
        transform: translateY(30px);
        opacity: 0;
    }
    100% {
        transform: translateY(0);
        opacity: 1;
    }
}

/* Card State Animations */
.login-card.shake {
    animation: shake 0.6s ease-in-out;
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
}

.login-card.loading-pulse {
    animation: loadingPulse 2s ease-in-out infinite;
}

@keyframes loadingPulse {
    0%, 100% { 
        box-shadow: 
            0 20px 40px rgba(0, 0, 0, 0.1),
            0 0 0 1px rgba(255, 255, 255, 0.8);
    }
    50% { 
        box-shadow: 
            0 25px 50px rgba(16, 185, 129, 0.15),
            0 0 0 1px rgba(16, 185, 129, 0.3);
    }
}

.login-card.success-glow {
    box-shadow: 
        0 20px 40px rgba(16, 185, 129, 0.3),
        0 0 0 1px rgba(16, 185, 129, 0.5);
    animation: successGlow 1s ease-in-out;
}

@keyframes successGlow {
    0% {
        box-shadow: 
            0 20px 40px rgba(0, 0, 0, 0.1),
            0 0 0 1px rgba(255, 255, 255, 0.8);
    }
    50% {
        box-shadow: 
            0 25px 50px rgba(16, 185, 129, 0.4),
            0 0 0 3px rgba(16, 185, 129, 0.6);
    }
    100% {
        box-shadow: 
            0 20px 40px rgba(16, 185, 129, 0.3),
            0 0 0 1px rgba(16, 185, 129, 0.5);
    }
}

.login-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #10b981, #059669, #047857);
}

/* Header Styling */
.clinic-header {
    padding: 2rem 2rem 1rem;
    text-align: center;
    background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
}

.logo-container {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.clinic-info {
    text-align: center;
}

.clinic-name {
    font-size: 1.8rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0;
    background: linear-gradient(135deg, #10b981, #059669);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    opacity: 0;
    transform: translateY(20px);
    animation: titleSlideIn 0.8s ease-out 0.4s forwards;
}

@keyframes titleSlideIn {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.clinic-subtitle {
    font-size: 0.95rem;
    color: #6b7280;
    margin: 0.25rem 0 0;
    font-weight: 500;
    letter-spacing: 0.5px;
    opacity: 0;
    animation: subtitleFadeIn 0.8s ease-out 0.6s forwards;
}

@keyframes subtitleFadeIn {
    to {
        opacity: 1;
    }
}

/* Title Styling */
.login-title {
    text-align: center;
    padding: 0 2rem 1rem;
}

.login-title h2 {
    font-size: 1.75rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 0.5rem;
    opacity: 0;
    transform: translateY(15px);
    animation: titleSlideIn 0.8s ease-out 0.5s forwards;
}

.login-title p {
    color: #6b7280;
    font-size: 1rem;
    margin: 0;
    font-weight: 500;
    opacity: 0;
    animation: subtitleFadeIn 0.8s ease-out 0.7s forwards;
}

/* Form Styling */
.login-form {
    padding: 0 2rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    opacity: 0;
    transform: translateX(-20px);
    animation: fieldSlideIn 0.6s ease-out forwards;
}

.field:nth-child(1) { animation-delay: 0.8s; }
.field:nth-child(2) { animation-delay: 0.9s; }

@keyframes fieldSlideIn {
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

.field-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    color: #374151;
    font-size: 0.95rem;
}

.field-label i {
    color: #10b981;
    font-size: 1.1rem;
}

.field-input {
    width: 100%;
}

.login-button {
    width: 100%;
    height: 54px;
    background: linear-gradient(135deg, #10b981, #059669);
    border: none;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: 600;
    letter-spacing: 0.5px;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
    opacity: 0;
    transform: translateY(20px);
    animation: buttonSlideIn 0.6s ease-out 1s forwards;
}

@keyframes buttonSlideIn {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.login-button:hover {
    background: linear-gradient(135deg, #059669, #047857);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
}

.login-button:active {
    transform: translateY(0);
}

.login-button.success-button {
    background: linear-gradient(135deg, #10b981, #059669);
    animation: successButtonPulse 1s ease-in-out;
}

@keyframes successButtonPulse {
    0%, 100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.05);
    }
}

/* Footer Styling */
.login-footer {
    text-align: center;
    padding: 1.5rem 2rem 2rem;
    background: #f8fafc;
    margin-top: 1rem;
}

.footer-text {
    color: #9ca3af;
    font-size: 0.85rem;
    margin: 0;
    font-weight: 400;
    opacity: 0;
    animation: footerFadeIn 0.8s ease-out 1.2s forwards;
}

@keyframes footerFadeIn {
    to {
        opacity: 1;
    }
}

/* Deep Styling for PrimeVue Components */
:deep(.p-card-header) {
    padding: 0;
    border-bottom: none;
}

:deep(.p-card-title) {
    padding: 0;
    margin: 0;
}

:deep(.p-card-content) {
    padding: 0;
}

:deep(.p-card-footer) {
    padding: 0;
    border-top: none;
}

:deep(.p-inputtext) {
    height: 52px;
    border: 2px solid #e5e7eb;
    border-radius: 10px;
    padding: 0 1rem;
    font-size: 1rem;
    background: #ffffff;
    transition: all 0.3s ease;
}

:deep(.p-inputtext:focus) {
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    outline: none;
    transform: translateY(-1px);
}

:deep(.p-inputtext:disabled) {
    background: #f9fafb;
    border-color: #e5e7eb;
    color: #9ca3af;
}

:deep(.p-password) {
    width: 100%;
}

:deep(.p-password .p-inputtext) {
    width: 100%;
    padding-right: 3rem;
}

:deep(.p-password .p-password-toggle-mask) {
    color: #10b981;
    right: 1rem;
}

:deep(.p-button-loading-icon) {
    color: white;
}

/* Loading button animation */
:deep(.p-button-loading) {
    animation: buttonLoading 1.5s ease-in-out infinite;
}

@keyframes buttonLoading {
    0%, 100% {
        box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
    }
    50% {
        box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5);
    }
}

/* Responsive Design */
@media (max-width: 640px) {
    .login-container {
        padding: 1rem;
    }
    
    .login-card {
        max-width: 100%;
        margin: 0;
        border-radius: 16px;
    }
    
    .clinic-header {
        padding: 1.5rem 1.5rem 1rem;
    }
    
    .clinic-name {
        font-size: 1.5rem;
    }
    
    .login-title {
        padding: 0 1.5rem 1rem;
    }
    
    .login-title h2 {
        font-size: 1.5rem;
    }
    
    .login-form {
        padding: 0 1.5rem 1rem;
    }
    
    .login-footer {
        padding: 1.5rem;
    }
    
    .footer-text {
        font-size: 0.8rem;
    }
    
    .success-animation h3 {
        font-size: 1.5rem;
    }
    
    .checkmark {
        width: 60px;
        height: 60px;
    }
    
    .checkmark-stem {
        height: 12px;
        left: 24px;
        top: 30px;
    }
    
    .checkmark-kick {
        height: 6px;
        left: 19px;
        top: 33px;
    }
}

/* Reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
    
    .medical-cross {
        animation: none;
    }
    
    .login-container {
        opacity: 1;
        transform: none;
    }
    
    .login-card {
        opacity: 1;
        transform: none;
    }
}
</style>