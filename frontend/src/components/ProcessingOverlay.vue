<template>
  <Teleport to="body">
    <transition name="overlay-fade">
      <div v-if="isProcessing"
        class="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
        <div v-motion :initial="{ opacity: 0, scale: 0.95, y: 10 }"
          :enter="{ opacity: 1, scale: 1, y: 0, transition: { duration: 250 } }"
          class="bg-white p-8 rounded-[2rem] shadow-2xl flex flex-col items-center max-w-md w-full text-center border border-emerald-100">
          <!-- Spinning Icon -->
          <div
            class="w-16 h-16 bg-emerald-50 text-kementan-green rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-emerald-100">
            <RefreshCw :size="32" class="animate-spin" />
          </div>

          <!-- Title -->
          <h3 class="text-xl font-extrabold text-gray-900 mb-3 tracking-tight">
            {{ title || 'Memproses Dokumen' }}
          </h3>

          <!-- Description -->
          <p class="text-sm text-gray-500 font-medium leading-relaxed">
            {{ message || 'Sistem sedang menyusun dokumen PDF dan mengunggahnya ke Google Drive. Mohon tunggu beberapa
            saat...' }}
          </p>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { RefreshCw } from 'lucide-vue-next'

defineProps<{
  isProcessing: boolean
  title?: string
  message?: string
}>()
</script>

<style scoped>
.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.2s ease;
}

.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}
</style>
