<template>
<div v-motion :initial="{ opacity: 0, y: 10 }" :enter="{ opacity: 1, y: 0 }"
      class="max-w-5xl mx-auto space-y-6 pb-12">
      <button
        class="flex items-center gap-2 text-gray-500 hover:text-kementan-green transition-colors font-semibold text-sm bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 w-max"
        @click="closeForm">
        <ChevronLeft :size="18" /> Kembali ke Daftar SPT
      </button>

      <div class="glass-card rounded-3xl shadow-lg border border-gray-200">
        <div class="bg-gradient-to-r from-emerald-600 to-kementan-green px-8 py-7 text-white relative overflow-hidden">
          <div class="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
            <FileText :size="200" />
          </div>
          <h2 class="text-2xl font-extrabold">
            {{ isEditMode ? 'Edit Dokumen SPT' : 'Buat Surat Perintah Tugas Baru' }}
          </h2>
          <p class="text-emerald-50 font-medium text-sm mt-1 opacity-90">
            Dokumen penugasan resmi untuk perjalanan dinas luar wilayah.
          </p>
        </div>

        <div class="p-8 space-y-10">
          <!-- INFORMASI DASAR -->
          <div class="space-y-6">
            <div class="flex items-center gap-3 border-b border-gray-100 pb-3">
              <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FileText :size="18" />
              </div>
              <h4 class="text-xs font-black text-gray-700 tracking-widest uppercase">
                Informasi Dasar Dokumen
              </h4>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Nomor
                  Surat
                  Tugas <span class="text-red-400">*</span></label>
                <input v-model="formData.no" type="text"
                  class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all font-medium placeholder:text-gray-400"
                  placeholder="Contoh: 147.6/TU-040/J.4/11/2025">
              </div>
              <div>
                <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Tanggal Surat <span class="text-red-400">*</span></label>
                <input v-model="formData.tanggalSurat" type="date"
                  class="w-full bg-white border border-gray-300 rounded-xl py-3 px-4 text-sm outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 font-medium transition-all">
              </div>
            </div>

            <div>
              <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Maksud Perjalanan / Dasar Penugasan <span class="text-red-400">*</span></label>
              <textarea v-model="formData.maksudPerjalanan" rows="3"
                class="w-full bg-white border border-gray-300 rounded-xl py-3 px-4 text-sm outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all font-medium leading-relaxed placeholder:text-gray-400"
                placeholder="Jelaskan tujuan dan landasan hukum kegiatan penugasan ini..." />
            </div>

            <div>
              <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Kegiatan <span class="text-red-400">*</span></label>
              <input v-model="formData.kegiatan" type="text"
                class="w-full bg-white border border-gray-300 rounded-xl py-3 px-4 text-sm outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all font-medium placeholder:text-gray-400"
                placeholder="Contoh: Bimbingan Teknis Sistem Informasi 2025">
            </div>

            <!-- MAK -->
            <div>
              <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">MAK (Mata Anggaran Keluaran) <span class="text-red-400">*</span></label>
              <input v-model="formData.mak" type="text"
                class="w-full bg-white border border-gray-300 rounded-xl py-3 px-4 text-sm outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all font-medium placeholder:text-gray-400"
                placeholder="Contoh: MAK 7012.EAH.001.054.A.524111">
            </div>
          </div>

          <!-- PESERTA PENUGASAN -->
          <div class="space-y-5">
            <!-- Header: sama persis dengan style section Informasi Dasar Dokumen -->
            <div class="flex items-center justify-between border-b border-gray-100 pb-3">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Users :size="18" />
                </div>
                <h4 class="text-xs font-black text-gray-700 tracking-widest uppercase">
                  Peserta Penugasan
                </h4>
              </div>
              <div class="px-3 py-1.5 rounded-xl text-[10px] font-bold tracking-widest"
                :class="formData.peserta.length > 5 ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'">
                <div class="flex items-center gap-1.5">
                  <FileText :size="12" />
                  <span>{{ formData.peserta.length > 5 ? '2 Halaman' : '1 Halaman' }}</span>
                </div>
              </div>
            </div>

            <!-- Kolom Pencarian Tambah Peserta (selalu di atas) -->
            <div class="bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-2xl p-4 border border-emerald-100">
              <label class="block text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-2">+ Tambah
                Peserta</label>
              <SearchableDropdown v-model:value="participantSelector" label="" :options="pegawaiOptions"
                :is-loading="isPegawaiLoading" placeholder="Ketik nama atau NIP pegawai..." @change="addParticipant" />
            </div>

            <!-- Auto Fill Section (muncul jika ≥2 peserta) -->
            <transition name="fade">
              <div v-if="formData.peserta.length > 1"
                class="rounded-[2rem] border border-slate-200 bg-white shadow-sm overflow-hidden transition-all hover:shadow-md">
                <button type="button"
                  class="w-full flex items-center justify-between px-7 py-5 bg-slate-50/60 hover:bg-slate-100/80 transition-all outline-none"
                  @click="isBulkFill = !isBulkFill">
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-2xl bg-emerald-600/10 flex items-center justify-center transition-transform duration-500"
                      :class="{ 'rotate-[360deg] bg-emerald-600 text-white': isBulkFill }">
                      <Zap :size="18" :class="{ 'text-emerald-600': !isBulkFill, 'text-white': isBulkFill }" />
                    </div>
                    <div class="text-left">
                      <span class="block text-[11px] font-black text-slate-800 uppercase tracking-[0.2em]">Auto Fill</span>
                      <span class="block text-[10px] text-slate-400 font-bold uppercase mt-1">Sinkronkan Lokasi & Waktu Peserta</span>
                    </div>
                  </div>
                  <div class="px-4 py-2 bg-white border border-slate-200 rounded-2xl text-[10px] font-black text-slate-500 uppercase transition-all hover:border-emerald-500 hover:text-emerald-600 flex items-center gap-2 shadow-sm">
                    <span>{{ isBulkFill ? 'Tutup Panel' : 'Buka Panel' }}</span>
                    <ChevronDown :size="14" class="transition-transform duration-500" :class="{ 'rotate-180': isBulkFill }" />
                  </div>
                </button>
                
                <div class="auto-collapse-grid" :class="{ 'is-open': isBulkFill }">
                  <div class="overflow-hidden">
                    <div class="p-8 pt-2 bg-slate-50/40 space-y-6 border-t border-slate-100">
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-2.5">
                          <label class="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                            <MapPin :size="14" class="text-emerald-600" /> Lokasi Tujuan Serentak
                          </label>
                          <input v-model="bulkTujuan" type="text"
                            class="w-full bg-white border border-slate-200 rounded-2xl py-4 px-5 text-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 transition-all font-bold placeholder:text-slate-300 shadow-sm"
                            placeholder="Ketik lokasi tujuan utama..." @input="applyBulkFill">
                        </div>
                        <div class="space-y-2.5">
                          <label class="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                            <Calendar :size="14" class="text-emerald-600" /> Waktu Pelaksanaan Serentak
                          </label>
                          <input v-model="bulkTanggal" type="text"
                            class="w-full bg-white border border-slate-200 rounded-2xl py-4 px-5 text-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 transition-all font-bold placeholder:text-slate-300 shadow-sm"
                            placeholder="Contoh: 12 - 14 Maret 2025" @input="applyBulkFill">
                        </div>
                      </div>
                      
                      <div class="flex items-center justify-between pt-2 border-t border-slate-200/50">
                        <p class="text-[10px] text-slate-400 font-medium italic">
                          *Perubahan akan langsung diterapkan ke semua peserta terdaftar.
                        </p>
                        <button 
                          @click="() => { bulkTujuan = ''; bulkTanggal = ''; applyBulkFill(); isBulkFill = false }"
                          class="px-5 py-2.5 rounded-xl text-[10px] font-black text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 uppercase tracking-widest transition-all flex items-center gap-2"
                        >
                          <Trash2 :size="14" /> Bersihkan & Tutup
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </transition>

            <!-- Daftar Peserta -->
            <div v-if="formData.peserta.length > 0" class="space-y-4">
              <div v-for="(p, idx) in formData.peserta" :key="idx"
                class="group bg-white rounded-2xl border border-slate-200 p-6 relative hover:border-emerald-400 hover:shadow-md transition-all duration-300">
                <!-- Tombol Hapus -->
                <button
                  class="absolute top-4 right-4 w-9 h-9 rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 shadow-sm"
                  @click="removePeserta(Number(idx))" title="Hapus peserta ini">
                  <Trash2 :size="16" />
                </button>

                <div class="flex flex-col lg:flex-row gap-8 lg:pr-10">
                  <!-- Identitas Peserta -->
                  <div class="flex-1 lg:max-w-[300px]">
                    <div class="flex items-center gap-4 mb-4">
                      <div
                        class="w-8 h-8 shrink-0 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs font-black shadow-md shadow-emerald-100">
                        {{ Number(idx) + 1 }}
                      </div>
                      <h5 class="text-sm font-black text-slate-800 leading-tight">{{ p.namaLengkap }}</h5>
                    </div>
                    <div class="grid grid-cols-1 gap-2.5 ml-12">
                      <div class="flex items-center gap-2">
                        <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest w-8">NIP</span>
                        <span class="text-xs text-slate-600 font-bold">{{ p.nip || '-' }}</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest w-8">Gol</span>
                        <span class="px-2 py-0.5 rounded-lg bg-emerald-50 text-[10px] text-emerald-700 font-black border border-emerald-100/50">{{ p.pangkatGol || '-' }}</span>
                      </div>
                      <div class="flex items-start gap-2">
                        <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest w-8 mt-1">Jab</span>
                        <span class="text-xs text-slate-600 font-medium leading-relaxed italic">{{ p.jabatan || '-' }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Kolom Input Lokasi & Tanggal -->
                  <div class="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full lg:border-l lg:border-slate-100 lg:pl-8 pt-6 lg:pt-0 border-t border-slate-100 sm:border-t-0">
                    <div class="space-y-2">
                      <label class="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                        <MapPin :size="12" /> Lokasi Tujuan
                      </label>
                      <input v-model="p.tujuan" type="text"
                        class="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all font-bold placeholder:text-slate-300"
                        placeholder="Contoh: Bogor, Jawa Barat">
                    </div>
                    <div class="space-y-2">
                      <label class="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                        <Calendar :size="12" /> Waktu Pelaksanaan
                      </label>
                      <input v-model="p.tanggalPelaksanaan" type="text"
                        class="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all font-bold placeholder:text-slate-300"
                        placeholder="Contoh: 12 - 14 Mar 2025">
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- FOOTER ACTIONS -->
          <div class="pt-8 border-t border-gray-100 flex gap-4">
            <button type="button"
              class="px-6 py-3.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm w-40"
              @click="closeForm">
              Batal
            </button>
            <button :disabled="isSubmitting || !formData.no || !formData.tanggalSurat || !formData.maksudPerjalanan || !formData.kegiatan || !formData.mak || formData.peserta.length === 0"
              class="flex-1 px-6 py-3.5 bg-kementan-green text-white font-bold rounded-xl hover:bg-[#004d26] transition-all flex justify-center items-center gap-3 shadow-md shadow-kementan-green/20 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed text-sm uppercase tracking-widest"
              @click="handleSave">
              <template v-if="isSubmitting">
                <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Dalam Proses...</span>
              </template>
              <template v-else>
                <Save :size="18" /> Simpan & Finalkan SPT
              </template>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Notification Modal -->
      <GlobalModal 
        :is-open="notificationModal.isOpen"
        :type="notificationModal.type"
        :title="notificationModal.title"
        :message="notificationModal.message"
        :confirm-text="notificationModal.confirmText"
        @close="notificationModal.isOpen = false"
        @confirm="() => { if(notificationModal.onConfirm) notificationModal.onConfirm(); notificationModal.isOpen = false }"
      />
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronLeft, Trash2, Users, FileText, ChevronDown, ChevronUp, CheckCircle, Zap, MapPin, Calendar, Save, Eye, Download } from 'lucide-vue-next'
import SearchableDropdown from '../SearchableDropdown.vue'
import GlobalModal from '../GlobalModal.vue'
import { triggerDownload } from '../../utils/drive'

const props = defineProps<{
  initialData: any
  isEditMode: boolean
  isProcessing: boolean
  pegawaiOptions: any[]
  pegawaiList: any[]
  adminProfile: any
}>()

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'save', formData: any): void
}>()

const formData = ref<any>(JSON.parse(JSON.stringify(props.initialData)))

// --- State & Variables ---
const participantSelector = ref('')
const isPegawaiLoading = ref(false)
const isBulkFill = ref(false)
const bulkTujuan = ref('')
const bulkTanggal = ref('')
const isSubmitting = computed(() => props.isProcessing)

const notificationModal = ref({
  isOpen: false,
  type: 'success' as 'success' | 'error' | 'warning' | 'info' | 'confirm',
  title: '',
  message: '',
  confirmText: '',
  onConfirm: null as (() => void) | null
})

const showNotification = (
  type: 'success' | 'error' | 'warning' | 'info' | 'confirm',
  title: string,
  message: string,
  onConfirm: (() => void) | null = null,
  confirmText = ''
) => {
  notificationModal.value = {
    isOpen: true,
    type,
    title,
    message,
    confirmText,
    onConfirm: onConfirm || null,
  }
}

const getPegawaiIndex = (nama: string) => {
  return props.pegawaiOptions.findIndex(p => p.value === nama)
}

const addParticipant = (value: string) => {
  if (!value) return
  const peg = props.pegawaiList.find(p => p.namaLengkap === value)
  if (!peg) return
  
  // Prevent duplicates with Alert
  if (formData.value.peserta.some((p: any) => p.namaLengkap === peg.namaLengkap)) {
    showNotification(
      'warning',
      'Peserta Sudah Ada',
      `${peg.namaLengkap} sudah ada dalam daftar peserta.`
    )
    participantSelector.value = ''
    return
  }

  formData.value.peserta.push({
    namaLengkap: peg.namaLengkap,
    nip: peg.nip || '-',
    jabatan: peg.jabatan || '',
    pangkatGol: peg.golongan || '-',
    pangkatGolongan: peg.golongan || '-',
    tujuan: bulkTujuan.value || '',
    tanggalPelaksanaan: bulkTanggal.value || '',
    lamanya: '',
    tanggalMulai: '',
    tanggalSelesai: ''
  })
  participantSelector.value = ''
}

// --- Actions ---
const applyBulkFill = () => {
  formData.value.peserta.forEach((p: any) => {
    if (bulkTujuan.value) p.tujuan = bulkTujuan.value
    if (bulkTanggal.value) p.tanggalPelaksanaan = bulkTanggal.value
  })
}

const removePeserta = (index: number) => {
    formData.value.peserta.splice(index, 1)
}

const handleSave = () => {
    emit('save', formData.value)
}

const handleSubmit = () => {
    emit('save', formData.value)
}

const openPreview = (url: string) => {
  if (!url) return
  window.open(url, '_blank')
}

const closeForm = () => emit('cancel')
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.auto-collapse-grid {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.auto-collapse-grid.is-open {
  grid-template-rows: 1fr;
}

.glass-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
</style>