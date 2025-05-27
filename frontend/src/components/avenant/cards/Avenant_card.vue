<script setup>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';

const toast = useToast();

const props = defineProps({
  id: String,
  contractId: String,
  status: String,
  createdAt: String,
  activateAt: String,
});

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text);
  toast.add({
    severity: 'success',
    summary: 'Copied',
    detail: 'Text copied to clipboard',
    life: 3000
  });
};
</script>

<template>
  <div class="w-full bg-white rounded-xl shadow-md border border-gray-200 p-6">
    <!-- Compact Header -->
    <div class="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
      <h3 class="text-xl font-semibold text-gray-800">avenant details</h3>
      <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
        <i class="pi pi-file-edit text-white text-sm"></i>
      </div>
    </div>

    <!-- Information Grid -->
    <div class="grid grid-cols-2 gap-6">
      <!-- Left Column -->
      <div class="space-y-4">
        <!-- ID -->
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <i class="pi pi-id-card text-blue-600 text-sm"></i>
          </div>
          <div class="flex-grow min-w-0">
            <p class="text-xs text-gray-500 mb-1">ID</p>
            <div class="flex items-center">
              <p class="text-gray-800 font-medium mr-2 truncate">{{ id }}</p>
              <button
                class="text-gray-400 hover:text-blue-500 p-1 rounded transition-colors"
                @click="copyToClipboard(id)"
              >
                <i class="pi pi-copy text-xs"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Contract ID -->
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <i class="pi pi-file-edit text-green-600 text-sm"></i>
          </div>
          <div class="flex-grow min-w-0">
            <p class="text-xs text-gray-500 mb-1">Contract ID</p>
            <div class="flex items-center">
              <p class="text-gray-800 font-medium mr-2 truncate">{{ contractId }}</p>
              <button
                class="text-gray-400 hover:text-blue-500 p-1 rounded transition-colors"
                @click="copyToClipboard(contractId)"
              >
                <i class="pi pi-copy text-xs"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Status -->
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <i class="pi pi-check-circle text-purple-600 text-sm"></i>
          </div>
          <div class="flex-grow">
            <p class="text-xs text-gray-500 mb-1">Status</p>
            <p class="text-gray-800 font-medium">{{ status }}</p>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="space-y-4">
        <!-- Activate At -->
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <i class="pi pi-clock text-teal-600 text-sm"></i>
          </div>
          <div class="flex-grow">
            <p class="text-xs text-gray-500 mb-1">Activate At</p>
            <p class="text-gray-800 font-medium">{{ activateAt }}</p>
          </div>
        </div>

        <!-- Created At -->
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <i class="pi pi-calendar text-orange-600 text-sm"></i>
          </div>
          <div class="flex-grow">
            <p class="text-xs text-gray-500 mb-1">Created At</p>
            <p class="text-gray-800 font-medium">{{ createdAt }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>