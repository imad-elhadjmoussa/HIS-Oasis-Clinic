<template>
  <div class="not-found-container">
    <i class="pi pi-exclamation-triangle not-found-icon"></i>
    <h1>404 - Page Not Found</h1>
    <p>The page you're looking for doesn't exist.</p>
    <Button label="Go back to Home Page" icon="pi pi-home" @click="goToHomePage" />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import Button from 'primevue/button'

const router = useRouter()

const goToHomePage = async () => {
  await router.push('/')
}
</script>

<style scoped>
.not-found-container {
  text-align: center;
  padding: 3rem;
}

.not-found-icon {
  font-size: 4rem;
  color: #e74c3c;
  margin-bottom: 1rem;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
}
</style>
