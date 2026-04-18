<template>
  <Teleport to="body">
      <transition name="fade">
        <div v-if="showNotulensiModal"
          class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
          <div v-motion :initial="{ scale: 0.95, opacity: 0 }" :enter="{ scale: 1, opacity: 1 }"
            class="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div class="flex items-center gap-3">
                <NotebookPen class="text-kementan-green" :size="20" />
                <h3 class="font-extrabold text-gray-800 tracking-wide">
                  Input Tindak Lanjut / Notulensi
                </h3>
              </div>
              <button class="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                @click="closeForm">
                <X :size="20" />
              </button>
            </div>

            <div class="p-6 overflow-y-auto space-y-6">
              <div class="space-y-2">
                <label class="field-label">Hasil / Catatan (Opsional)</label>
                <textarea v-model="formData.tindakLanjut" rows="6" class="field-input min-h-[140px]"
                  placeholder="Berikan catatan, hasil keputusan, atau ringkasan notulensi kegiatan..." />
              </div>

              <div class="space-y-2">
                <label class="field-label">File Notulensi / Hasil <span class="text-gray-300">(Opsional, Maks
                    5MB)</span></label>
                <div class="flex flex-col sm:flex-row items-center gap-4">
                  <label
                    class="px-5 py-3.5 bg-blue-50 text-blue-700 font-bold text-sm tracking-wider rounded-xl cursor-pointer hover:bg-blue-100 transition-colors border border-blue-200 shadow-sm w-full sm:w-auto text-center shrink-0">
                    <span>Pilih File PDF</span>
                    <input type="file" class="hidden" accept=".pdf"
                      @change="(e) => handleFileUpload(e, 'fileNotulensi')">
                  </label>
                  <div v-if="files.fileNotulensi"
                    class="flex items-center gap-2 text-sm text-gray-600 truncate border border-gray-100 px-4 py-2.5 rounded-xl w-full bg-gray-50 shadow-sm">
                    <FileText :size="16" class="text-blue-500 shrink-0" />
                    <span class="truncate">{{ files.fileNotulensi.name }}</span>
                  </div>
                  <div v-else-if="formData.fileNotulensi"
                    class="flex items-center justify-between border border-emerald-100 px-4 py-2.5 rounded-xl w-full bg-emerald-50 shadow-sm gap-2">
                    <div class="flex items-center gap-2 truncate text-emerald-700 font-medium">
                      <CheckCircle2 :size="16" class="shrink-0" />
                      <span class="text-sm truncate">Notulensi tersimpan</span>
                    </div>
                  </div>
                </div>
                <p v-if="formData.fileNotulensi && !files.fileNotulensi"
                  class="text-[10px] text-gray-400 font-medium mt-1">
                  Upload file baru jika ingin mengganti file yang lama.
                </p>
              </div>
            </div>

            <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-4">
              <button
                class="px-6 py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors text-sm w-32"
                @click="closeForm">
                Batal
              </button>
              <button :disabled="isProcessing"
                class="flex-1 px-6 py-3 bg-kementan-green text-white font-bold rounded-xl hover:bg-[#004d26] transition-colors shadow-md shadow-kementan-green/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                @click="handleSubmit">
                <template v-if="isProcessing">
                  <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Menyimpan...</span>
                </template>
                <template v-else>
                  <Save :size="18" /> Simpan Data
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
