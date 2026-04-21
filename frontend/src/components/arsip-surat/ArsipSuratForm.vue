<template>
  <div v-motion :initial="{ opacity: 0, y: 10 }" :enter="{ opacity: 1, y: 0 }" class="max-w-5xl mx-auto space-y-6 pb-12">
    <button
      class="flex items-center gap-2 text-gray-500 hover:text-kementan-green transition-all font-bold text-xs bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-gray-100 w-max group"
      @click="closeForm">
      <ChevronLeft :size="16" class="group-hover:-translate-x-1 transition-transform" />
      <span class="uppercase tracking-widest">Kembali ke Daftar</span>
    </button>

    <div class="glass-card rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-200/50 bg-white/80 backdrop-blur-xl">
      <!-- Form Header -->
      <div class="bg-gradient-to-br from-kementan-green to-emerald-800 px-10 py-10 text-white relative overflow-hidden">
        <div class="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
          <Inbox :size="240" />
        </div>
        <div class="relative z-10">
          <div class="flex items-center gap-3 mb-3">
            <div class="p-2 bg-white/20 rounded-xl backdrop-blur-md">
              <Plus v-if="!isEditMode" :size="20" />
              <Edit v-else :size="20" />
            </div>
            <span class="text-xs font-black tracking-[0.3em] uppercase opacity-80">Persuratan Direktorat</span>
          </div>
          <h2 class="text-3xl font-black tracking-tight">
            {{ isEditMode ? 'Edit Dokumen Arsip' : 'Registrasi Arsip Baru' }}
          </h2>
          <p class="text-emerald-100/80 font-bold text-sm mt-2 max-w-xl leading-relaxed">
            Pastikan nomor surat dan klasifikasi metadata sudah sesuai dengan dokumen asli sebelum disimpan.
          </p>
        </div>
      </div>

      <form class="p-10 space-y-12" @submit.prevent="handleSubmit">
        <!-- SECTION 1: Klasifikasi Utama -->
        <div class="space-y-8">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-2xl bg-emerald-50 text-kementan-green flex items-center justify-center font-black text-sm shadow-inner border border-emerald-100/50">01</div>
            <h4 class="text-xs font-black text-kementan-green tracking-[0.25em] uppercase border-b border-gray-100 pb-2 flex-1">
              Klasifikasi & Identitas Dokumen
            </h4>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="space-y-2">
              <label class="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Tipe Surat <span class="text-rose-500">*</span></label>
              <div class="relative group">
                <select v-model="formData.tipeSurat" required 
                  class="w-full bg-gray-50/50 border border-gray-200 rounded-2xl py-3.5 px-5 text-sm font-bold text-gray-800 outline-none focus:border-kementan-green focus:bg-white focus:ring-4 focus:ring-kementan-green/10 transition-all appearance-none cursor-pointer">
                  <option value="Masuk">SURAT MASUK</option>
                  <option value="Keluar">SURAT KELUAR</option>
                </select>
                <ChevronDown class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-focus-within:text-kementan-green transition-colors" :size="16" />
              </div>
            </div>
            <div class="space-y-2">
              <label class="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Kategori <span class="text-rose-500">*</span></label>
              <div class="relative group">
                <select v-model="formData.kategoriSurat" required 
                  class="w-full bg-gray-50/50 border border-gray-200 rounded-2xl py-3.5 px-5 text-sm font-bold text-gray-800 outline-none focus:border-kementan-green focus:bg-white focus:ring-4 focus:ring-kementan-green/10 transition-all appearance-none cursor-pointer">
                  <option v-for="cat in categories" :key="cat" :value="cat">{{ cat.toUpperCase() }}</option>
                </select>
                <ChevronDown class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-focus-within:text-kementan-green transition-colors" :size="16" />
              </div>
            </div>
            <div class="space-y-2">
              <label class="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Tingkat Sifat <span class="text-rose-500">*</span></label>
              <div class="relative group">
                <select v-model="formData.sifatSurat" required 
                  class="w-full bg-gray-50/50 border border-gray-200 rounded-2xl py-3.5 px-5 text-sm font-bold text-gray-800 outline-none focus:border-kementan-green focus:bg-white focus:ring-4 focus:ring-kementan-green/10 transition-all appearance-none cursor-pointer">
                  <option v-for="s in priorities" :key="s" :value="s">{{ s.toUpperCase() }}</option>
                </select>
                <ChevronDown class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-focus-within:text-kementan-green transition-colors" :size="16" />
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div class="md:col-span-6 space-y-2">
              <label class="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Nomor Surat Resmi <span class="text-rose-500">*</span></label>
              <input v-model="formData.nomorSurat" type="text" required 
                class="w-full bg-gray-50/50 border border-gray-200 rounded-2xl py-3.5 px-5 text-sm font-bold text-gray-800 outline-none focus:border-kementan-green focus:bg-white focus:ring-4 focus:ring-kementan-green/10 transition-all"
                placeholder="Contoh: B-123/OT.040/A.5/01/2024">
            </div>
            <div class="md:col-span-3 space-y-2">
              <label class="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Tanggal Terima <span class="text-rose-500">*</span></label>
              <input v-model="formData.tanggalMasuk" type="date" required 
                class="w-full bg-gray-50/50 border border-gray-200 rounded-2xl py-3.5 px-5 text-sm font-bold text-gray-800 outline-none focus:border-kementan-green focus:bg-white transition-all uppercase">
            </div>
            <div class="md:col-span-3 space-y-2">
              <label class="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Tanggal Surat <span class="text-rose-500">*</span></label>
              <input v-model="formData.tanggalSurat" type="date" required 
                class="w-full bg-gray-50/50 border border-gray-200 rounded-2xl py-3.5 px-5 text-sm font-bold text-gray-800 outline-none focus:border-kementan-green focus:bg-white transition-all uppercase">
            </div>
          </div>
        </div>

        <!-- SECTION 2: Konten -->
        <div class="space-y-8">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm shadow-inner border border-indigo-100/50">02</div>
            <h4 class="text-xs font-black text-kementan-green tracking-[0.25em] uppercase border-b border-gray-100 pb-2 flex-1">
              Subjek & Entitas Relasi
            </h4>
          </div>

          <div class="space-y-6">
            <div class="space-y-2">
              <label class="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                {{ formData.tipeSurat === 'Masuk' ? 'Instansi / Pengirim Asal' : 'Pihak / Instansi Tujuan' }}
                <span class="text-rose-500">*</span>
              </label>
              <input v-model="formData.asalTujuan" type="text" required 
                class="w-full bg-gray-50/50 border border-gray-200 rounded-2xl py-3.5 px-5 text-sm font-bold text-gray-800 outline-none focus:border-kementan-green focus:bg-white focus:ring-4 focus:ring-kementan-green/10 transition-all"
                placeholder="Masukkan nama lengkap instansi atau unit kerja...">
            </div>

            <div class="space-y-2">
              <label class="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Ringkasan Perihal <span class="text-rose-500">*</span></label>
              <textarea v-model="formData.perihal" rows="3" required 
                class="w-full bg-gray-50/50 border border-gray-200 rounded-2xl py-4 px-5 text-sm font-bold text-gray-800 outline-none focus:border-kementan-green focus:bg-white focus:ring-4 focus:ring-kementan-green/10 transition-all leading-relaxed"
                placeholder="Tuliskan inti dari dokumen ini..." />
            </div>

            <div v-if="['Undangan', 'Laporan'].includes(formData.kategoriSurat)" 
              v-motion :initial="{ opacity: 0, height: 0 }" :enter="{ opacity: 1, height: 'auto' }"
              class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
              <div class="space-y-2">
                <label class="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 underline decoration-indigo-200">Mulai Kegiatan <span class="text-gray-400 opacity-60 font-medium">(Optional)</span></label>
                <input v-model="formData.tglAcaraMulai" type="date" class="w-full bg-gray-50/50 border border-gray-200 rounded-2xl py-3.5 px-5 text-sm font-bold text-gray-800 outline-none focus:border-indigo-500 focus:bg-white transition-all uppercase">
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 underline decoration-indigo-200">Selesai Kegiatan <span class="text-gray-400 opacity-60 font-medium">(Optional)</span></label>
                <input v-model="formData.tglAcaraSelesai" type="date" class="w-full bg-gray-50/50 border border-gray-200 rounded-2xl py-3.5 px-5 text-sm font-bold text-gray-800 outline-none focus:border-indigo-500 focus:bg-white transition-all uppercase">
              </div>
            </div>
          </div>
        </div>

        <!-- SECTION 3: Disposisi -->
        <div class="space-y-8">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-black text-sm shadow-inner border border-purple-100/50">03</div>
            <h4 class="text-xs font-black text-kementan-green tracking-[0.25em] uppercase border-b border-gray-100 pb-2 flex-1">
              Disposisi & Hasil Tindak Lanjut
            </h4>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div class="space-y-6">
              <div class="space-y-3">
                <label class="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Teruskan / Disposisi Ke</label>
                <div class="relative group">
                  <Search class="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors" :size="20" />
                  <input v-model="pegawaiSearch" type="text" 
                    class="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-14 pr-5 text-sm font-bold text-gray-800 outline-none focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/10 transition-all shadow-inner"
                    placeholder="Ketik nama atau NIP..." autocomplete="off" @input="handlePegawaiSearch" @blur="clearSearchDelayed">
                  
                  <div v-if="showPegawaiDropdown && filteredPegawai.length > 0"
                    class="absolute z-[100] left-0 right-0 mt-2 bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div v-for="p in filteredPegawai" :key="p.nip"
                      class="px-6 py-4 hover:bg-purple-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0 group/item flex items-center justify-between"
                      @mousedown.prevent="addDisposisi(p)">
                      <div>
                        <p class="text-sm font-extrabold text-gray-800 group-hover/item:text-purple-700 transition-colors">
                          {{ p.namaLengkap }}
                        </p>
                        <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                          {{ p.jabatan || p.poksi || '-' }}
                        </p>
                      </div>
                      <Plus :size="16" class="text-gray-300 group-hover/item:text-purple-500" />
                    </div>
                  </div>
                </div>

                <div class="flex flex-wrap gap-2.5 p-4 rounded-2xl bg-gray-50/80 border border-dashed border-gray-300 min-h-[60px]">
                  <span v-if="formData.disposisiKe.length === 0" class="text-[11px] text-gray-400 font-bold italic tracking-wide self-center mx-auto opacity-60">Belum ada pegawai ditugaskan...</span>
                  <div v-for="(name, idx) in formData.disposisiKe" :key="idx"
                    class="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-purple-100/50 text-purple-700 text-[11px] font-black shadow-sm group/tag animate-in zoom-in duration-200">
                    <span>{{ name.toUpperCase() }}</span>
                    <button type="button" class="text-gray-300 hover:text-rose-500 transition-colors bg-gray-50 rounded-md p-1" @click="removeDisposisi(idx)">
                      <X :size="12" />
                    </button>
                  </div>
                </div>
              </div>

              <div class="space-y-2">
                <label class="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Tanggal Disposisi</label>
                <input v-model="formData.tglDisposisi" type="date" class="w-full bg-gray-50/50 border border-gray-200 rounded-2xl py-3.5 px-5 text-sm font-bold text-gray-800 outline-none focus:border-purple-500 focus:bg-white transition-all uppercase">
              </div>
            </div>

            <div class="space-y-3 flex flex-col">
              <label class="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Catatan Hasil / Notulensi Teks</label>
              <textarea v-model="formData.tindakLanjut" 
                class="flex-1 w-full bg-gray-50/50 border border-gray-200 rounded-[2rem] py-5 px-6 text-sm font-bold text-gray-800 outline-none focus:border-kementan-green focus:bg-white focus:ring-4 focus:ring-kementan-green/10 transition-all leading-relaxed shadow-inner min-h-[200px]"
                placeholder="Berikan ringkasan keputusan, arahan pimpinan, atau hasil kegiatan di sini..." />
            </div>
          </div>
        </div>

        <!-- SECTION 4: Upload -->
        <div class="space-y-8">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-sm shadow-inner border border-emerald-100/50">04</div>
            <h4 class="text-xs font-black text-kementan-green tracking-[0.25em] uppercase border-b border-gray-100 pb-2 flex-1">
              Digitalisasi Dokumen (G-Drive)
            </h4>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
            <!-- File Surat -->
            <div class="space-y-3">
              <label class="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 italic opacity-80">Berkas Utama (Scan Surat)</label>
              <div
                class="group relative h-40 rounded-[2rem] border-2 border-dashed border-gray-300 bg-gray-50/50 flex flex-col items-center justify-center cursor-pointer hover:border-kementan-green hover:bg-emerald-50 transition-all overflow-hidden shadow-inner"
                @click="(fileSuratRef as HTMLInputElement)?.click()">
                <input ref="fileSuratRef" type="file" class="hidden" accept=".pdf,image/*" @change="(e) => handleFileUpload(e, 'fileSurat')">
                
                <div v-if="!files.fileSurat && !formData.fileSurat" class="flex flex-col items-center gap-2">
                  <div class="p-3 bg-white rounded-2xl shadow-sm text-gray-400 group-hover:text-kementan-green transition-transform group-hover:scale-110">
                    <UploadCloud :size="28" />
                  </div>
                  <span class="text-[10px] font-black text-gray-400 uppercase tracking-tighter group-hover:text-kementan-green">Unggah PDF / Gambar</span>
                </div>
                <div v-else class="flex flex-col items-center w-full px-10 gap-2">
                  <div class="p-3 bg-white rounded-2xl shadow-sm text-kementan-green">
                    <FileText :size="28" />
                  </div>
                  <span class="text-[10px] font-black text-gray-800 uppercase line-clamp-1 text-center w-full">
                    {{ files.fileSurat?.name ?? 'Dokumen Tersimpan di Cloud' }}
                  </span>
                  <div class="flex gap-2">
                    <span v-if="files.fileSurat" class="px-2 py-1 bg-emerald-100 text-[8px] font-black text-emerald-700 rounded-md uppercase">
                      {{ (files.fileSurat.size / 1024 / 1024).toFixed(2) }} MB
                    </span>
                    <span v-else class="px-2 py-1 bg-blue-100 text-[8px] font-black text-blue-700 rounded-md uppercase">CLOUD SYNCED</span>
                  </div>
                </div>
                <!-- Tooltip info -->
                <div class="absolute bottom-3 text-center w-full px-4">
                  <p v-if="formData.fileSurat && !files.fileSurat" class="text-[8px] font-black text-emerald-600 uppercase tracking-widest opacity-60">Status: Aktif</p>
                </div>
              </div>
            </div>

            <!-- File Lampiran -->
            <div class="space-y-3">
              <label class="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 italic opacity-80">Lampiran / Hasil Notulensi</label>
              <div
                class="group relative h-40 rounded-[2rem] border-2 border-dashed border-gray-300 bg-gray-50/50 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-600 hover:bg-emerald-50 transition-all overflow-hidden shadow-inner"
                @click="(fileNotulensiRef as HTMLInputElement)?.click()">
                <input ref="fileNotulensiRef" type="file" class="hidden" accept=".pdf,image/*" @change="(e) => handleFileUpload(e, 'fileNotulensi')">
                
                <div v-if="!files.fileNotulensi && !formData.fileNotulensi" class="flex flex-col items-center gap-2">
                  <div class="p-3 bg-white rounded-2xl shadow-sm text-gray-400 group-hover:text-emerald-500 transition-transform group-hover:scale-110">
                    <NotebookPen :size="28" />
                  </div>
                  <span class="text-[10px] font-black text-gray-400 uppercase tracking-tighter group-hover:text-emerald-600">Lampirkan Hasil Akhir</span>
                </div>
                <div v-else class="flex flex-col items-center w-full px-10 gap-2">
                  <div class="p-3 bg-emerald-100 rounded-2xl shadow-sm text-emerald-700">
                    <CheckCircle2 :size="28" />
                  </div>
                  <span class="text-[10px] font-black text-gray-800 uppercase line-clamp-1 text-center w-full">
                    {{ files.fileNotulensi?.name ?? 'Hasil Lampiran Ada' }}
                  </span>
                  <div v-if="files.fileNotulensi" class="px-2 py-1 bg-emerald-100 text-[8px] font-black text-emerald-700 rounded-md uppercase">
                    {{ (files.fileNotulensi.size / 1024 / 1024).toFixed(2) }} MB
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ACTIONS -->
        <div class="pt-10 border-t border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <p class="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest italic order-2 sm:order-1">
            * Seluruh perubahan akan tercatat di log audit sistem.
          </p>
          <div class="flex gap-4 w-full sm:w-max order-1 sm:order-2">
            <button type="button" 
              class="flex-1 sm:flex-none px-10 py-4 bg-gray-100 text-gray-500 font-black rounded-2xl hover:bg-gray-200 transition-all text-xs uppercase tracking-[0.2em]" 
              @click="closeForm">
              BATAL
            </button>
            <button type="submit" :disabled="isProcessing"
              class="flex-1 sm:flex-none px-12 py-4 bg-kementan-green text-white font-black rounded-2xl hover:bg-[#004d26] hover:shadow-2xl hover:shadow-kementan-green/30 transition-all flex justify-center items-center gap-4 disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed text-xs uppercase tracking-[0.3em] shadow-xl shadow-kementan-green/10">
              <template v-if="isProcessing">
                <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>MEMPROSES...</span>
              </template>
              <template v-else>
                {{ isEditMode ? 'PERBARUI DATA' : 'SIMPAN ARSIP' }}
              </template>
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ChevronLeft, ChevronDown, Search, X, UploadCloud, FileText, NotebookPen, CheckCircle2, Inbox, Edit, Plus } from 'lucide-vue-next'
import type { SuratData, PegawaiData } from '../../types/api'

const props = defineProps<{
  initialData: any
  isEditMode: boolean
  isProcessing: boolean
  pegawaiList: PegawaiData[]
  adminTimPoksi: string
}>()

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'save', formData: any, files: { fileSurat: File | null, fileNotulensi: File | null }): void
  (e: 'notify', type: any, title: string, message: string): void
}>()

// Use proxy to avoid side effect on prop
const formData = ref<any>(JSON.parse(JSON.stringify(props.initialData)))

// Watch for initialData changes (re-initialization if needed)
watch(() => props.initialData, (newVal) => {
  formData.value = JSON.parse(JSON.stringify(newVal))
}, { deep: true })

const categories = ['Surat Dinas', 'Undangan', 'Nota Dinas', 'Laporan', 'Sertifikat', 'Kontrak', 'Lainnya']
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

  // RELEVANCE SORTING: Own department first
  const adminPoksi = props.adminTimPoksi?.toLowerCase() || ''
  
  filteredPegawai.value = [...props.pegawaiList]
    .filter(p => {
      const nameMatch = (p.namaLengkap || '').toLowerCase().includes(q)
      const nipMatch = (p.nip || '').toLowerCase().includes(q)
      return nameMatch || nipMatch
    })
    .sort((a, b) => {
      const aInPoksi = (a.poksi || '').toLowerCase() === adminPoksi ? 1 : 0
      const bInPoksi = (b.poksi || '').toLowerCase() === adminPoksi ? 1 : 0
      return bInPoksi - aInPoksi // Poksi members at top
    })
    .slice(0, 8)
    
  showPegawaiDropdown.value = true
}

const addDisposisi = (p: PegawaiData) => {
  if (!formData.value.disposisiKe) formData.value.disposisiKe = []
  if (!formData.value.disposisiKe.includes(p.namaLengkap)) {
    formData.value.disposisiKe.push(p.namaLengkap)
  }
  pegawaiSearch.value = ''
  filteredPegawai.value = []
  showPegawaiDropdown.value = false
}

const removeDisposisi = (idx: number | string) => { 
  formData.value.disposisiKe.splice(Number(idx), 1) 
}

const clearSearchDelayed = () => { setTimeout(() => { showPegawaiDropdown.value = false }, 200) }

const handleFileUpload = (e: Event, field: 'fileSurat' | 'fileNotulensi') => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  
  if (file.size > 10 * 1024 * 1024) {
    emit('notify', 'error', 'UKURAN FILE TERLALU BESAR', 'Maksimal ukuran file adalah 10 MB.')
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

<style scoped>
.glass-card {
  box-shadow: 0 4px 50px -12px rgba(0, 0, 0, 0.08);
}
</style>
