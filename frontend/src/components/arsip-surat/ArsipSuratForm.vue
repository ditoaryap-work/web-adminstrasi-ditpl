<template>
  <div  v-motion :initial="{ opacity: 0, y: 10 }" :enter="{ opacity: 1, y: 0 }"
      class="max-w-5xl mx-auto space-y-6 pb-12">
      <button
        class="flex items-center gap-2 text-gray-500 hover:text-kementan-green transition-colors font-semibold text-sm bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 w-max"
        @click="closeForm">
        <ChevronLeft :size="18" /> Kembali ke Daftar Arsip
      </button>

      <div class="glass-card rounded-3xl overflow-hidden shadow-lg border border-gray-200">
        <!-- Form Header -->
        <div class="bg-gradient-to-r from-emerald-600 to-kementan-green px-8 py-7 text-white relative overflow-hidden">
          <div class="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
            <Inbox :size="200" />
          </div>
          <h2 class="text-2xl font-extrabold">
            {{ isEditMode ? 'Edit Data Arsip Surat' : 'Registrasi Surat Baru' }}
          </h2>
          <p class="text-emerald-50 font-medium text-sm mt-1 opacity-90">
            Lengkapi detail surat dengan teliti dan akurat.
          </p>
        </div>

        <form class="p-8 space-y-10" @submit.prevent="handleSubmit">
          <!-- SECTION 1: Klasifikasi -->
          <div class="space-y-6">
            <div class="flex items-center gap-3 border-b border-gray-100 pb-4">
              <span
                class="w-8 h-8 rounded-lg bg-emerald-50 text-kementan-green flex items-center justify-center font-black text-xs shadow-inner">01</span>
              <h4 class="text-xs font-black text-gray-700 tracking-widest uppercase">
                Klasifikasi & Metadata Dokumen
              </h4>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="space-y-2">
                <label class="field-label">Tipe Surat <span class="text-red-400">*</span></label>
                <div class="field-select-wrapper">
                  <select v-model="formData.tipeSurat" required class="field-select">
                    <option value="Masuk">
                      Surat Masuk
                    </option>
                    <option value="Keluar">
                      Surat Keluar
                    </option>
                  </select>
                  <ChevronDown class="field-select-icon" :size="16" />
                </div>
              </div>
              <div class="space-y-2">
                <label class="field-label">Kategori Dokumen <span class="text-red-400">*</span></label>
                <div class="field-select-wrapper">
                  <select v-model="formData.kategoriSurat" required class="field-select">
                    <option v-for="cat in categories" :key="cat" :value="cat">
                      {{ cat }}
                    </option>
                  </select>
                  <ChevronDown class="field-select-icon" :size="16" />
                </div>
              </div>
              <div class="space-y-2">
                <label class="field-label">Tingkat Sifat <span class="text-red-400">*</span></label>
                <div class="field-select-wrapper">
                  <select v-model="formData.sifatSurat" required class="field-select">
                    <option v-for="s in priorities" :key="s" :value="s">
                      {{ s }}
                    </option>
                  </select>
                  <ChevronDown class="field-select-icon" :size="16" />
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="space-y-2">
                <label class="field-label">Nomor Surat Resmi <span class="text-red-400">*</span></label>
                <input v-model="formData.nomorSurat" type="text" required class="field-input"
                  placeholder="Nomor tertera di dokumen">
              </div>
              <div class="space-y-2">
                <label class="field-label">Tanggal Masuk/Keluar <span class="text-red-400">*</span></label>
                <input v-model="formData.tanggalMasuk" type="date" required class="field-input">
              </div>
              <div class="space-y-2">
                <label class="field-label">Tanggal Lembar Surat <span class="text-red-400">*</span></label>
                <input v-model="formData.tanggalSurat" type="date" required class="field-input">
              </div>
            </div>
          </div>

          <!-- SECTION 2: Konten & Relasi -->
          <div class="space-y-6">
            <div class="flex items-center gap-3 border-b border-gray-100 pb-4">
              <span
                class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs shadow-inner">02</span>
              <h4 class="text-xs font-black text-gray-700 tracking-widest uppercase">
                Konten & Entitas Relasi
              </h4>
            </div>

            <div class="space-y-2">
              <label class="field-label">
                {{ formData.tipeSurat === 'Masuk' ? 'Instansi Asal' : 'Instansi/Pihak Tujuan' }}
                <span class="text-red-400">*</span>
              </label>
              <input v-model="formData.asalTujuan" type="text" required class="field-input"
                placeholder="Nama Instansi / Biro / Tim / Perorangan">
            </div>

            <div class="space-y-2">
              <label class="field-label">Ringkasan Perihal <span class="text-red-400">*</span></label>
              <textarea v-model="formData.perihal" rows="3" required class="field-input"
                placeholder="Tuliskan pokok bahasan surat ini..." />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="field-label">Mulai Acara <span class="text-gray-300">(Opsional)</span></label>
                <input v-model="formData.tglAcaraMulai" type="date" class="field-input">
              </div>
              <div class="space-y-2">
                <label class="field-label">Selesai Acara <span class="text-gray-300">(Opsional)</span></label>
                <input v-model="formData.tglAcaraSelesai" type="date" class="field-input">
              </div>
            </div>
          </div>

          <!-- SECTION 3: Disposisi -->
          <div class="space-y-6">
            <div class="flex items-center gap-3 border-b border-gray-100 pb-4">
              <span
                class="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-black text-xs shadow-inner">03</span>
              <h4 class="text-xs font-black text-gray-700 tracking-widest uppercase">
                Disposisi & Hasil Kegiatan
              </h4>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Disposisi Smart Search -->
              <div class="space-y-4">
                <div class="space-y-2">
                  <label class="field-label">Disposisikan Ke <span class="text-gray-300">(Opsional)</span></label>
                  <div class="relative">
                    <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" :size="18" />
                    <input v-model="pegawaiSearch" type="text" class="field-input !pl-12"
                      placeholder="Ketik nama pegawai untuk mencari..." autocomplete="off" @input="handlePegawaiSearch"
                      @blur="clearSearchDelayed">
                    <!-- Dropdown Hasil Pencarian -->
                    <div v-if="showPegawaiDropdown && filteredPegawai.length > 0"
                      class="absolute z-50 left-0 right-0 mt-1 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                      <div v-for="p in filteredPegawai" :key="p.nip"
                        class="px-5 py-3.5 hover:bg-emerald-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0"
                        @mousedown.prevent="addDisposisi(p)">
                        <p class="text-xs font-bold text-gray-800">
                          {{ p.namaLengkap }}
                        </p>
                        <p class="text-[10px] text-gray-400 font-medium tracking-wide uppercase">
                          {{ p.jabatan || p.poksi || '-' }}
                        </p>
                      </div>
                    </div>
                    <div v-else-if="showPegawaiDropdown && pegawaiSearch.length >= 2 && filteredPegawai.length === 0"
                      class="absolute z-50 left-0 right-0 mt-1 bg-white rounded-2xl shadow-xl border border-gray-100 px-5 py-4 text-xs text-gray-400 font-medium">
                      Tidak ada pegawai ditemukan.
                    </div>
                  </div>
                  <!-- Disposisi Tags -->
                  <div
                    class="flex flex-wrap gap-2 min-h-[44px] p-3 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <span v-if="formData.disposisiKe.length === 0"
                      class="text-[10px] text-gray-400 italic self-center">Belum ada pegawai dipilih...</span>
                    <div v-for="(name, idx) in formData.disposisiKe" :key="idx"
                      class="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-emerald-100 text-kementan-green text-[11px] font-bold shadow-sm">
                      <span>{{ name }}</span>
                      <button type="button" class="hover:text-red-500 transition-colors" @click="removeDisposisi(idx)">
                        <X :size="12" />
                      </button>
                    </div>
                  </div>
                </div>
                <div class="space-y-2">
                  <label class="field-label">Tanggal Disposisi <span class="text-gray-300">(Opsional)</span></label>
                  <input v-model="formData.tglDisposisi" type="date" class="field-input">
                </div>
              </div>

              <!-- Tindak Lanjut -->
              <div class="space-y-2">
                <label class="field-label">Tindak Lanjut / Notulensi Teks <span
                    class="text-gray-300">(Opsional)</span></label>
                <textarea id="field-notulensi" v-model="formData.tindakLanjut" rows="8"
                  class="field-input min-h-[180px]"
                  placeholder="Berikan catatan, hasil keputusan, atau ringkasan notulensi kegiatan..." />
              </div>
            </div>
          </div>

          <!-- SECTION 4: Upload Berkas -->
          <div class="space-y-6">
            <div class="flex items-center gap-3 border-b border-gray-100 pb-4">
              <span
                class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xs shadow-inner">04</span>
              <h4 class="text-xs font-black text-gray-700 tracking-widest uppercase">
                Digitalisasi Berkas (Google Drive)
              </h4>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- File Surat -->
              <div class="space-y-2">
                <label class="field-label">File Lembar Surat <span class="text-gray-300">(PDF/Gambar)</span></label>
                <div
                  class="h-32 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:border-kementan-green hover:bg-emerald-50 transition-all group"
                  @click="(fileSuratRef as HTMLInputElement)?.click()">
                  <input ref="fileSuratRef" type="file" class="hidden" accept=".pdf,image/*"
                    @change="(e) => handleFileUpload(e, 'fileSurat')">
                  <div v-if="!files.fileSurat && !formData.fileSurat" class="flex flex-col items-center gap-1">
                    <UploadCloud :size="24" class="text-gray-400 group-hover:text-kementan-green transition-colors" />
                    <span class="text-[10px] font-black text-gray-500 uppercase">Klik untuk Unggah Berkas</span>
                  </div>
                  <div v-else class="flex flex-col items-center w-full px-6 gap-1">
                    <FileText :size="24" class="text-kementan-green" />
                    <span class="text-[10px] font-black text-kementan-green uppercase line-clamp-1 max-w-full">
                      {{ files.fileSurat?.name ?? 'Berkas Tersimpan' }}
                    </span>
                    <span v-if="files.fileSurat" class="text-[9px] font-bold text-gray-400 uppercase">
                      {{ (files.fileSurat.size / 1024 / 1024).toFixed(2) }} MB
                    </span>
                    <span v-else
                      class="px-2 py-0.5 rounded bg-emerald-100 text-[8px] text-kementan-green font-black">DRIVE
                      CLOUD</span>
                  </div>
                </div>
                <p v-if="formData.fileSurat && !files.fileSurat"
                  class="text-[9px] text-center font-bold text-gray-400 italic">
                  File saat ini sudah tersimpan di G-Drive. Upload baru akan menggantikannya.
                </p>
              </div>

              <!-- File Notulensi -->
              <div class="space-y-2">
                <label class="field-label">File Notulensi/Lampiran <span
                    class="text-gray-300">(PDF/Gambar)</span></label>
                <div
                  class="h-32 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-all group"
                  @click="(fileNotulensiRef as HTMLInputElement)?.click()">
                  <input ref="fileNotulensiRef" type="file" class="hidden" accept=".pdf,image/*"
                    @change="(e) => handleFileUpload(e, 'fileNotulensi')">
                  <div v-if="!files.fileNotulensi && !formData.fileNotulensi" class="flex flex-col items-center gap-1">
                    <UploadCloud :size="24" class="text-gray-400 group-hover:text-emerald-500 transition-colors" />
                    <span class="text-[10px] font-black text-gray-500 uppercase">Klik untuk Lampirkan Hasil</span>
                  </div>
                  <div v-else class="flex flex-col items-center w-full px-6 gap-1">
                    <NotebookPen :size="24" class="text-emerald-600" />
                    <span class="text-[10px] font-black text-emerald-700 uppercase line-clamp-1 max-w-full">
                      {{ files.fileNotulensi?.name ?? 'Notulensi Tersimpan' }}
                    </span>
                    <span v-if="files.fileNotulensi" class="text-[9px] font-bold text-gray-400 uppercase">
                      {{ (files.fileNotulensi.size / 1024 / 1024).toFixed(2) }} MB
                    </span>
                    <span v-else class="px-2 py-0.5 rounded bg-emerald-100 text-[8px] text-emerald-600 font-black">DRIVE
                      CLOUD</span>
                  </div>
                </div>
                <p v-if="formData.fileNotulensi && !files.fileNotulensi"
                  class="text-[9px] text-center font-bold text-gray-400 italic">
                  Berkas pendukung tersedia di cloud.
                </p>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="pt-8 border-t border-gray-100 flex gap-4">
            <button type="button"
              class="px-6 py-3.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm w-40"
              @click="closeForm">
              Batal
            </button>
            <button type="submit" :disabled="isProcessing"
              class="flex-1 px-6 py-3.5 bg-kementan-green text-white font-bold rounded-xl hover:bg-[#004d26] transition-all flex justify-center items-center gap-3 shadow-md shadow-kementan-green/20 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed text-sm uppercase tracking-widest">
              <template v-if="isProcessing">
                <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Dalam Proses...</span>
              </template>
              <template v-else>
                {{ isEditMode ? 'Perbarui Data Arsip' : 'Simpan & Unggah Berkas' }}
              </template>
            </button>
          </div>
        </form>
      </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronLeft, ChevronDown, Search, X, UploadCloud, FileText, NotebookPen } from 'lucide-vue-next'
import type { SuratData, PegawaiData } from '../../types/api'

const props = defineProps<{
  initialData: any
  isEditMode: boolean
  isProcessing: boolean
  pegawaiList: PegawaiData[]
}>()

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'save', formData: any, files: { fileSurat: File | null, fileNotulensi: File | null }): void
  (e: 'notify', type: any, title: string, message: string): void
}>()

const formData = ref<any>(JSON.parse(JSON.stringify(props.initialData)))
const categories = ['Surat Dinas', 'Undangan', 'Nota Dinas', 'Laporan', 'Sertifikat', 'Lainnya']
const priorities = ['Biasa', 'Segera', 'Penting', 'Rahasia']

const fileSuratRef = ref<HTMLInputElement | null>(null)
const fileNotulensiRef = ref<HTMLInputElement | null>(null)
const files = ref<{ fileSurat: File | null, fileNotulensi: File | null }>({ fileSurat: null, fileNotulensi: null })

const pegawaiSearch = ref('')
const filteredPegawai = ref<PegawaiData[]>([])
const showPegawaiDropdown = ref(false)

const handlePegawaiSearch = () => {
  const q = pegawaiSearch.value.toLowerCase().trim()
  if (q.length < 2) {
    filteredPegawai.value = []
    showPegawaiDropdown.value = false
    return
  }
  filteredPegawai.value = props.pegawaiList.filter(p => p.namaLengkap.toLowerCase().includes(q) || p.nip.toLowerCase().includes(q)).slice(0, 6)
  showPegawaiDropdown.value = true
}

const addDisposisi = (p: PegawaiData) => {
  if (!formData.value.disposisiKe.includes(p.namaLengkap)) formData.value.disposisiKe.push(p.namaLengkap)
  pegawaiSearch.value = ''
  filteredPegawai.value = []
  showPegawaiDropdown.value = false
}

const removeDisposisi = (idx: number | string) => { formData.value.disposisiKe.splice(Number(idx), 1) }

const clearSearchDelayed = () => { setTimeout(() => { showPegawaiDropdown.value = false }, 200) }

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

const handleSubmit = () => {
  emit('save', formData.value, files.value)
}
const closeForm = () => emit('cancel')
</script>
