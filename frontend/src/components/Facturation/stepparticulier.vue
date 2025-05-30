<template>
    <div class="max-w-4xl mx-auto px-4">
      <h3 class="text-3xl font-semibold text-white text-center mb-12">
        Choisir le type de document
      </h3>
  
      <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Facture -->
        <div
          class="rounded-xl cursor-pointer transition-all duration-300 transform hover:-translate-y-2"
          :class="{ 'scale-105': activeMode === 'facture' }"
          @click="selectMode('facture')"
        >
          <div class="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-lg border border-blue-300 h-full">
            <div class="p-8 text-center flex flex-col items-center justify-center h-full">
              <div class="bg-white/20 p-6 rounded-full mb-6 backdrop-blur-sm">
                <i class="pi pi-file text-6xl text-white"></i>
              </div>
              <h5 class="font-bold text-2xl text-white mb-4">Facture</h5>
              <p class="text-blue-100 text-lg">Générer une facture standard</p>
            </div>
          </div>
        </div>
  
        <!-- Proformat -->
        <div
          class="rounded-xl cursor-pointer transition-all duration-300 transform hover:-translate-y-2"
          :class="{ 'scale-105': activeMode === 'proformat' }"
          @click="selectMode('proformat')"
        >
          <div class="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-lg border border-blue-300 h-full">
            <div class="p-8 text-center flex flex-col items-center justify-center h-full">
              <div class="bg-white/20 p-6 rounded-full mb-6 backdrop-blur-sm">
                <i class="pi pi-file-pdf text-6xl text-white"></i>
              </div>
              <h5 class="font-bold text-2xl text-white mb-4">Proformat</h5>
              <p class="text-blue-100 text-lg">Générer une facture proforma</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  
  const activeMode = ref('')
  const router = useRouter()
  
  function selectMode(mode) {
    activeMode.value = mode
  
    // Add a small delay for visual feedback before navigation
    setTimeout(() => {
      if (mode === 'facture') {
        router.push('/homep')
      } else if (mode === 'proformat') {
        router.push('/proformatp')
      }
    }, 300)
  }
  </script>
  
  <style scoped>
  .scale-105 {
    transform: scale(1.05);
  }
  </style>