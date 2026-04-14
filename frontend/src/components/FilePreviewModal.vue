<template>
  <Teleport to="body">
    <transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[12000] flex items-center justify-center p-4 sm:p-6 bg-slate-900/70 backdrop-blur-sm"
        @click.self="$emit('close')"
        @keydown.esc="$emit('close')"
      >
        <div
          v-motion
          :initial="{ scale: 0.92, opacity: 0, y: 20 }"
          :enter="{ scale: 1, opacity: 1, y: 0 }"
          class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col"
          style="max-height: 92vh"
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-3.5 border-b border-gray-100 bg-gray-50/80 shrink-0">
            <div class="flex items-center gap-3 min-w-0">
              <div class="p-2 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                <FileText :size="18" class="stroke-[2.5]" />
              </div>
              <div class="min-w-0">
                <h3 class="font-extrabold text-sm text-gray-800 tracking-wide truncate">Preview Dokumen</h3>
                <p class="text-[10px] text-gray-400 font-medium truncate">{{ displayUrl }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <a
                :href="fileUrl"
                target="_blank"
                rel="noopener"
                class="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors border border-blue-100"
              >
                <ExternalLink :size="14" />
                Tab Baru
              </a>
              <button
                class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all rounded-xl"
                @click="$emit('close')"
              >
                <X :size="20" />
              </button>
            </div>
          </div>

          <!-- Content -->
          <div class="flex-1 relative bg-gray-100 min-h-0">
            <!-- Loading State -->
            <div
              v-if="isFrameLoading"
              class="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/90 z-10"
            >
              <div class="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <p class="text-xs font-bold text-gray-500 uppercase tracking-widest animate-pulse">Memuat Preview...</p>
            </div>

            <!-- iframe Preview -->
            <iframe
              :src="previewUrl"
              class="w-full h-full border-0"
              style="min-height: 70vh"
              allow="autoplay"
              @load="isFrameLoading = false"
            />
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { FileText, ExternalLink, X } from 'lucide-vue-next'

const props = defineProps<{
  isOpen: boolean
  fileUrl: string
}>()

defineEmits<{
  (e: 'close'): void
}>()

const isFrameLoading = ref(true)

// Reset loading state saat URL berubah atau modal dibuka
watch(() => props.isOpen, (open) => {
  if (open) isFrameLoading.value = true
})

// Konversi Google Drive URL ke preview embed URL
const previewUrl = computed(() => {
  const url = props.fileUrl || ''
  
  // Google Drive file link → embeddable preview
  const driveMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
  if (driveMatch) {
    return `https://drive.google.com/file/d/${driveMatch[1]}/preview`
  }
  
  // Google Docs/Slides/Sheets → embed
  if (url.includes('docs.google.com')) {
    return url.replace(/\/(edit|view).*/, '/preview')
  }
  
  // Fallback: gunakan Google Docs viewer untuk URL lain
  if (url.startsWith('http')) {
    return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`
  }
  
  return url
})

const displayUrl = computed(() => {
  const url = props.fileUrl || ''
  if (url.length > 60) return url.substring(0, 57) + '...'
  return url
})
</script>
