<template>
  <Teleport to="body">
    <transition name="fade">
      <div v-if="showNotulensiModal"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
        <div v-motion :initial="{ scale: 0.95, opacity: 0, y: 20 }" :enter="{ scale: 1, opacity: 1, y: 0 }"
          class="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] border border-emerald-100/50">
          
          <!-- Header with Gradient matching SPTJM -->
          <div class="bg-gradient-to-r from-kementan-green to-emerald-800 px-8 py-7 text-white relative overflow-hidden">
             <div class="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
               <NotebookPen :size="160" />
             </div>
             <div class="relative z-10">
               <div class="flex items-center gap-3 mb-1">
                 <div class="p-1.5 bg-white/20 rounded-lg backdrop-blur-md">
                   <NotebookPen :size="18" />
                 </div>
                 <span class="text-[10px] font-black tracking-[0.3em] uppercase opacity-80 text-emerald-100">Feedback Kegiatan</span>
               </div>
               <h3 class="text-xl font-black tracking-tight">
                 Tindak Lanjut / Notulensi
               </h3>
             </div>
             <button class="absolute top-6 right-6 p-2 text-white/50 hover:text-white transition-colors rounded-xl hover:bg-white/10"
               @click="closeForm">
               <X :size="20" />
             </button>
          </div>

          <div class="p-8 overflow-y-auto space-y-8 bg-white">
            <div class="space-y-3">
              <label class="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Hasil / Catatan Strategis <span class="text-gray-300 font-medium">(Opsional)</span></label>
              <textarea v-model="formData.tindakLanjut" rows="6" 
                class="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-5 text-sm font-bold text-gray-800 outline-none focus:border-kementan-green focus:bg-white focus:ring-4 focus:ring-kementan-green/10 transition-all leading-relaxed shadow-inner min-h-[160px]"
                placeholder="Berikan catatan, hasil keputusan, atau ringkasan notulensi kegiatan..." />
            </div>

            <div class="space-y-4">
              <label class="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Lampiran Digital <span class="text-gray-300 font-medium">(PDF/Image, Maks 10MB)</span></label>
              <div class="flex flex-col gap-4">
                <label
                  class="group flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-[1.5rem] bg-gray-50/50 cursor-pointer hover:border-kementan-green hover:bg-emerald-50 transition-all">
                  <div v-if="!files.fileNotulensi && !formData.fileNotulensi" class="flex flex-col items-center gap-2">
                    <div class="p-3 bg-white rounded-xl shadow-sm text-gray-400 group-hover:text-kementan-green transition-all group-hover:scale-110">
                      <FileText :size="24" />
                    </div>
                    <span class="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Pilih Dokumen Hasil</span>
                  </div>
                  <div v-else class="flex flex-col items-center gap-2 px-6">
                    <div class="p-3 bg-white rounded-xl shadow-sm text-emerald-600">
                      <CheckCircle2 :size="24" />
                    </div>
                    <span class="text-[10px] font-black text-gray-800 uppercase line-clamp-1 text-center">
                      {{ files.fileNotulensi?.name ?? 'Dokumen Tersimpan di Drive' }}
                    </span>
                    <span v-if="files.fileNotulensi" class="px-2 py-1 bg-emerald-100 text-[8px] font-black text-emerald-700 rounded-md uppercase">
                      {{ (files.fileNotulensi.size / 1024 / 1024).toFixed(2) }} MB
                    </span>
                  </div>
                  <input type="file" class="hidden" accept=".pdf,image/*"
                    @change="(e) => handleFileUpload(e, 'fileNotulensi')">
                </label>
                
                <p v-if="formData.fileNotulensi && !files.fileNotulensi"
                  class="text-[9px] text-emerald-600 font-bold uppercase tracking-widest text-center italic opacity-60">
                  * Upload file baru untuk memperbarui lampiran sebelumnya.
                </p>
              </div>
            </div>
          </div>

          <div class="px-8 py-6 bg-gray-50/80 border-t border-gray-100 flex gap-4">
            <button
              class="px-8 py-4 bg-white border border-gray-200 text-gray-500 font-black rounded-2xl hover:bg-gray-100 transition-all text-[10px] uppercase tracking-widest w-40"
              @click="closeForm">
              BATAL
            </button>
            <button :disabled="isProcessing"
              class="flex-1 px-8 py-4 bg-kementan-green text-white font-black rounded-2xl hover:bg-[#004d26] transition-all shadow-xl shadow-kementan-green/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.2em]"
              @click="handleSubmit">
              <template v-if="isProcessing">
                <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>MENYIMPAN...</span>
              </template>
              <template v-else>
                <Save :size="16" /> SIMPAN DATA
              </template>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NotebookPen, X, FileText, CheckCircle2, Save } from 'lucide-vue-next'

const props = defineProps<{
  initialData: any
  isOpen: boolean
  isProcessing: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', formData: any, files: { fileSurat: File | null, fileNotulensi: File | null }): void
  (e: 'notify', type: any, title: string, message: string): void
}>()

const showNotulensiModal = computed(() => props.isOpen)

const formData = ref<any>(JSON.parse(JSON.stringify(props.initialData)))
const files = ref<{ fileSurat: File | null, fileNotulensi: File | null }>({ fileSurat: null, fileNotulensi: null })

const handleFileUpload = (e: Event, field: 'fileSurat' | 'fileNotulensi') => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (file.size > 10485760) {
    emit('notify', 'error', 'File Terlalu Besar!', 'Maksimal 10 MB.')
    input.value = ''
    return
  }
  files.value[field] = file
}

const closeForm = () => emit('close')
const handleSubmit = () => { emit('save', formData.value, files.value) }
</script>
