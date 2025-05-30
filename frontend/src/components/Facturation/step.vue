<template>
  <div class="max-w-4xl mx-auto px-4">
    <h3 class="text-3xl font-semibold text-white text-center mb-12">
      Choisir votre mode de facturation
    </h3>

    <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Clinique-Entreprise -->
      <div
        class="rounded-xl cursor-pointer transition-all duration-300 transform hover:-translate-y-2"
        :class="{ 'scale-105': activeMode === 'entreprise' }"
        @click="selectMode('entreprise')"
      >
        <div class="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-lg border border-blue-300 h-full">
          <div class="p-8 text-center flex flex-col items-center justify-center h-full">
            <div class="bg-white/20 p-6 rounded-full mb-6 backdrop-blur-sm">
              <i class="pi pi-building text-6xl text-white"></i>
            </div>
            <h5 class="font-bold text-2xl text-white mb-4">Clinique-Entreprise</h5>
            <p class="text-blue-100 text-lg">Pour les professionnels et entreprises</p>
          </div>
        </div>
      </div>

      <!-- Clinique-Particulier -->
      <div
        class="rounded-xl cursor-pointer transition-all duration-300 transform hover:-translate-y-2"
        :class="{ 'scale-105': activeMode === 'particulier' }"
        @click="selectMode('particulier')"
      >
        <div class="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-lg border border-blue-300 h-full">
          <div class="p-8 text-center flex flex-col items-center justify-center h-full">
            <div class="bg-white/20 p-6 rounded-full mb-6 backdrop-blur-sm">
              <i class="pi pi-user text-6xl text-white"></i>
            </div>
            <h5 class="font-bold text-2xl text-white mb-4">Clinique-Particulier</h5>
            <p class="text-blue-100 text-lg">Pour les clients individuels</p>
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
    if (mode === 'entreprise') {
      router.push('/home')
    } else if (mode === 'particulier') {
      router.push('/stepparticulier')
    }
  }, 300)
}
</script>

<style scoped>
.scale-105 {
  transform: scale(0.8);
}
</style>