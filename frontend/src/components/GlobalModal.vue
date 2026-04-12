<template>
  <Teleport to="body">
    <transition name="modal-fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      >
        <!-- Overlay -->
        <div 
          class="absolute inset-0 bg-gray-900/50" 
          @click="type !== 'confirm' && close()"
        />
        
        <!-- Modal Content -->
        <div 
          v-motion
          :initial="{ opacity: 0, scale: 0.95, y: 12 }"
          :enter="{ opacity: 1, scale: 1, y: 0, transition: { duration: 200 } }"
          class="relative bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl"
        >
          <!-- Icon + Content -->
          <div class="p-6 pb-2 text-center">
            <div 
              class="w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-4"
              :class="iconBgStyles"
            >
              <component
                :is="iconComponent"
                :size="28"
                :class="iconColorStyles"
              />
            </div>
            <h3 class="text-lg font-bold text-gray-800 mb-1.5">
              {{ title || defaultTitle }}
            </h3>
            <p class="text-sm text-gray-500 leading-relaxed px-2">
              {{ message }}
            </p>
          </div>

          <!-- Actions -->
          <div class="p-5 pt-4 flex gap-3">
            <button 
              v-if="type === 'confirm'"
              class="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors" 
              @click="close"
            >
              Batal
            </button>
            <button 
              v-if="type === 'confirm'"
              class="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold text-sm hover:bg-red-600 transition-colors" 
              @click="confirmAction"
            >
              {{ confirmText || 'Ya, Hapus' }}
            </button>
            <button 
              v-if="type !== 'confirm'"
              class="flex-1 py-3 rounded-xl font-semibold text-sm transition-colors" 
              :class="primaryBtnStyles"
              @click="close"
            >
              {{ closeText || 'Mengerti' }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  CheckCircle, AlertCircle, Trash2, Info, AlertTriangle
} from 'lucide-vue-next'

const props = defineProps({
  isOpen: Boolean,
  type: {
    type: String, // success, error, warning, confirm, info
    default: 'success'
  },
  title: { type: String, default: '' },
  message: { type: String, default: '' },
  confirmText: { type: String, default: '' },
  closeText: { type: String, default: '' }
})

const emit = defineEmits(['close', 'confirm'])

const close = () => {
  emit('close')
}

const confirmAction = () => {
  emit('confirm')
  close()
}

const defaultTitle = computed(() => {
  switch (props.type) {
    case 'success': return 'Berhasil!'
    case 'error': return 'Terjadi Kesalahan'
    case 'confirm': return 'Konfirmasi Hapus'
    case 'warning': return 'Peringatan'
    default: return 'Informasi'
  }
})

const iconComponent = computed(() => {
  switch (props.type) {
    case 'success': return CheckCircle
    case 'error': return AlertCircle
    case 'confirm': return Trash2
    case 'warning': return AlertTriangle
    default: return Info
  }
})

const iconBgStyles = computed(() => {
  switch (props.type) {
    case 'success': return 'bg-emerald-50'
    case 'error': return 'bg-red-50'
    case 'confirm': return 'bg-orange-50'
    case 'warning': return 'bg-amber-50'
    default: return 'bg-blue-50'
  }
})

const iconColorStyles = computed(() => {
  switch (props.type) {
    case 'success': return 'text-emerald-500'
    case 'error': return 'text-red-500'
    case 'confirm': return 'text-orange-500'
    case 'warning': return 'text-amber-500'
    default: return 'text-blue-500'
  }
})

const primaryBtnStyles = computed(() => {
  switch (props.type) {
    case 'success': return 'bg-emerald-500 text-white hover:bg-emerald-600'
    case 'error': return 'bg-red-500 text-white hover:bg-red-600'
    case 'warning': return 'bg-amber-500 text-white hover:bg-amber-600'
    default: return 'bg-blue-500 text-white hover:bg-blue-600'
  }
})
</script>

<style scoped>
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}
</style>
