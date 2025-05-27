<script setup>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';

const toast = useToast();

const props = defineProps({
  id: String,
  company: String,
  startDate: String,
  endDate: String,
  status: String
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
      <h3 class="text-xl font-semibold text-gray-800">Contract details</h3>
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
            <p class="text-xs text-gray-500 mb-1">Id</p>
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

        <!-- Company -->
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <i class="pi pi-building text-green-600 text-sm"></i>
          </div>
          <div class="flex-grow">
            <p class="text-xs text-gray-500 mb-1">Company</p>
            <p class="text-gray-800 font-medium">{{ company }}</p>
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
        <!-- Start Date -->
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <i class="pi pi-calendar-plus text-teal-600 text-sm"></i>
          </div>
          <div class="flex-grow">
            <p class="text-xs text-gray-500 mb-1">Start Date</p>
            <p class="text-gray-800 font-medium">{{ startDate }}</p>
          </div>
        </div>

        <!-- End Date -->
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <i class="pi pi-calendar-times text-orange-600 text-sm"></i>
          </div>
          <div class="flex-grow">
            <p class="text-xs text-gray-500 mb-1">End Date</p>
            <p class="text-gray-800 font-medium">{{ endDate || 'No end date' }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>