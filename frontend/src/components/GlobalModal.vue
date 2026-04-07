<template>
  <Teleport to="body">
    <transition name="modal-fade">
      <div v-if="isOpen" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <!-- Overlay -->
        <div 
          class="absolute inset-0 bg-black/40 backdrop-blur-md" 
          @click="type !== 'confirm' && close()"
        ></div>
        
        <!-- Modal Content -->
        <div 
          v-motion
          :initial="{ opacity: 0, scale: 0.9, y: 20 }"
          :enter="{ opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } }"
          class="relative bg-white rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl border border-gray-100"
        >
          <!-- Header (Type-based) -->
          <div :class="headerStyles" class="p-8 text-center relative overflow-hidden">
             <div class="absolute inset-0 opacity-10 pointer-events-none" style="background-image: url('https://www.transparenttextures.com/patterns/leaf.png')"></div>
             <div class="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl mx-auto flex items-center justify-center border border-white/30 shadow-lg mb-4">
                <component :is="iconComponent" :size="32" class="text-white" />
             </div>
             <h3 class="text-xl font-extrabold text-white mb-1 leading-tight">{{ title || defaultTitle }}</h3>
             <p class="text-white/80 text-[11px] font-medium leading-relaxed tracking-wide px-4">
               {{ message }}
             </p>
          </div>

          <!-- Actions -->
          <div class="p-6 bg-white flex flex-col gap-2">
             <button 
               v-if="type === 'confirm'"
               @click="confirmAction" 
               class="w-full py-3.5 bg-red-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
             >
                {{ confirmText || 'Ya, Hapus' }}
             </button>
             <button 
               @click="close" 
               :class="type === 'confirm' ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-kementan-green text-white hover:bg-[#004d26] shadow-lg shadow-kementan-green/20'"
               class="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
             >
                {{ type === 'confirm' ? 'Batal' : (closeText || 'Tutup') }}
             </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { 
  CheckCircle, AlertCircle, Trash2, Info 
} from 'lucide-vue-next'

const props = defineProps({
  isOpen: Boolean,
  type: {
    type: String, // success, error, warning, confirm, info
    default: 'success'
  },
  title: String,
  message: String,
  confirmText: String,
  closeText: String
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
    case 'warning': return AlertCircle
    default: return Info
  }
})

const headerStyles = computed(() => {
  switch (props.type) {
    case 'success': return 'bg-gradient-to-br from-kementan-green to-emerald-600'
    case 'error': return 'bg-gradient-to-br from-red-500 to-rose-600'
    case 'confirm': return 'bg-gradient-to-br from-orange-500 to-red-600'
    case 'warning': return 'bg-gradient-to-br from-amber-500 to-orange-600'
    default: return 'bg-gradient-to-br from-blue-500 to-indigo-600'
  }
})
</script>

<style scoped>
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}
</style>
