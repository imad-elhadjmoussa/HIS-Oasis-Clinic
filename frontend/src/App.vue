<script setup>
import { ref, computed, onMounted, watchEffect } from "vue";

// Reactive reference for user
const user = ref(null);

// Function to update user data
const updateUser = () => {
  const storedUser = localStorage.getItem("user");
  user.value = storedUser ? JSON.parse(storedUser) : null;
};

// Fetch user when component mounts
onMounted(() => {
  updateUser();
});

// Watch for changes in localStorage (whenever user logs in or out)
watchEffect(() => {
  updateUser();
});

// Computed class based on user role
const containerClass = computed(() => {
  return user.value && user.value.role === "Reception"
    ? "w-full max-w-[1200px] mx-auto px-4"
    : "";
});
</script>

<template>
  <div>
    <RouterView />
  </div>
</template>

<style scoped></style>
