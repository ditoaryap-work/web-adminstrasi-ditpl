<template>
<div  v-motion :initial="{ opacity: 0, y: 10 }" :enter="{ opacity: 1, y: 0 }"
      class="max-w-5xl mx-auto space-y-6 pb-12">
      <button
        class="flex items-center gap-2 text-gray-500 hover:text-kementan-green transition-colors font-semibold text-sm bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 w-max"
        @click="closeForm">
        <ChevronLeft :size="18" /> Kembali ke Daftar SPT
      </button>

      <div class="glass-card rounded-3xl overflow-hidden shadow-lg border border-gray-200">
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
                  class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all font-bold placeholder:text-gray-300"
                  placeholder="Contoh: 147.6/TU-040/J.4/11/2025">
              </div>
              <div>
                <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Tanggal
                  Surat
                  <span class="text-red-400">*</span></label>
                <input v-model="formData.tanggalSurat" type="date"
                  class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 font-bold transition-all">
              </div>
            </div>

            <div>
              <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Maksud
                Perjalanan / Dasar Penugasan <span class="text-red-400">*</span></label>
              <textarea v-model="formData.maksudPerjalanan" rows="3"
                class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all font-medium leading-relaxed"
                placeholder="Jelaskan tujuan dan landasan hukum kegiatan penugasan ini..." />
            </div>

            <div>
              <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Kegiatan
                <span class="text-red-400">*</span></label>
              <input v-model="formData.kegiatan" type="text"
                class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all font-medium"
                placeholder="Contoh: Bimbingan Teknis Sistem Informasi 2025">
            </div>

            <!-- MAK -->
            <div>
              <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">MAK (Mata
                Anggaran Keluaran) <span class="text-red-400">*</span></label>
              <input v-model="formData.mak" type="text"
                class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all font-bold"
                placeholder="Contoh: MAK 7012.EAH.001.054.A.524111">
            </div>
          </div>

          <!-- PESERTA PENUGASAN - Redesign -->
          <div class="space-y-5">
            <!-- Header -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div
                  class="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-sm">
                  <Users :size="17" />
                </div>
                <div>
                  <h4 class="text-sm font-black text-gray-800">Peserta Penugasan</h4>
                  <p class="text-[10px] text-gray-400 font-medium mt-0.5">{{ formData.peserta.length }} orang dipilih
                  </p>
                </div>
              </div>
              <div class="px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest"
                :class="formData.peserta.length > 5 ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm' : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm'">
                <div class="flex items-center gap-1.5">
                  <FileText :size="12" />
                  <span>{{ formData.peserta.length > 5 ? '2 HALAMAN' : '1 HALAMAN' }}</span>
                </div>
              </div>
            </div>

            <!-- Kolom Pencarian Tambah Peserta (selalu di atas) -->
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
              <label class="block text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">+ Tambah
                Peserta</label>
              <SearchableDropdown v-model:value="participantSelector" label="" :options="pegawaiOptions"
                :is-loading="isPegawaiLoading" placeholder="Ketik nama atau NIP pegawai..." @change="addParticipant" />
            </div>

            <!-- Bulk Fill Toggle (muncul jika ≥2 peserta) -->
            <transition name="fade">
              <div v-if="formData.peserta.length > 1"
                class="rounded-xl border border-dashed border-gray-300 overflow-hidden">
                <button type="button"
                  class="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                  @click="isBulkFill = !isBulkFill">
                  <div class="flex items-center gap-2">
                    <Zap :size="16" class="text-kementan-green" />
                    <span class="text-xs font-bold text-gray-700 uppercase tracking-widest">Isi Lokasi & Tanggal
                      Serentak</span>
                    <span class="text-[10px] text-gray-500 font-medium">(untuk semua peserta)</span>
                  </div>
                  <div class="flex items-center gap-1 text-[11px] font-bold text-gray-500">
                    <span>{{ isBulkFill ? 'Tutup' : 'Buka' }}</span>
                    <ChevronUp v-if="isBulkFill" :size="16" />
                    <ChevronDown v-else :size="16" />
                  </div>
                </button>
                <transition name="fade">
                  <div v-if="isBulkFill"
                    class="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 bg-white border-t border-gray-200">
                    <div>
                      <label class="flex items-center gap-1.5 text-xs font-bold text-gray-600 mb-2">
                        <MapPin :size="14" class="text-gray-400" /> Lokasi Tujuan
                      </label>
                      <input v-model="bulkTujuan" type="text"
                        class="w-full bg-white border border-gray-300 rounded-xl py-2.5 px-3.5 text-sm outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all font-bold"
                        placeholder="Contoh: Bogor, Jawa Barat" @input="applyBulkFill">
                    </div>
                    <div class="pt-2 border-t border-blue-100/50">
                      <label class="flex items-center gap-1.5 text-xs font-bold text-gray-600 mb-2">
                        <Calendar :size="14" class="text-gray-400" /> Waktu Pelaksanaan
                      </label>
                      <input v-model="bulkTanggal" type="text"
                        class="w-full bg-white border border-gray-300 rounded-xl py-2.5 px-3.5 text-sm outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all font-bold"
                        placeholder="Contoh: 24 – 30 Des 2025" @input="applyBulkFill">
                    </div>
                  </div>
                </transition>
              </div>
            </transition>

            <!-- Empty State -->
            <div v-if="formData.peserta.length === 0"
              class="flex flex-col items-center justify-center gap-3 py-10 rounded-2xl bg-gray-50/80 border-2 border-dashed border-gray-200">
              <div
                class="w-14 h-14 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center text-gray-300">
                <UserPlus :size="28" />
              </div>
              <div class="text-center">
                <p class="text-xs font-black text-gray-400 uppercase tracking-widest">Belum ada peserta</p>
                <p class="text-[10px] text-gray-400 mt-0.5">Cari dan tambahkan peserta melalui kolom di atas</p>
              </div>
            </div>

            <!-- Daftar Peserta (Standard Styling) -->
            <div v-else class="space-y-4">
              <div v-for="(p, idx) in formData.peserta" :key="idx"
                class="group bg-white rounded-xl border border-gray-300 p-5 relative hover:border-kementan-green hover:shadow-sm focus-within:border-kementan-green focus-within:ring-4 focus-within:ring-kementan-green/10 transition-all">
                <!-- Tombol Hapus -->
                <button
                  class="absolute top-4 right-4 shrink-0 w-8 h-8 rounded-lg bg-gray-100 text-gray-500 hover:bg-rose-50 hover:text-rose-600 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 focus-within:opacity-100 focus:opacity-100"
                  @click="removePeserta(Number(idx))" title="Hapus peserta ini">
                  <Trash2 :size="16" />
                </button>

                <div class="flex flex-col md:flex-row gap-6 md:pr-10">
                  <!-- Identitas Peserta -->
                  <div class="flex-1 md:min-w-[280px] md:max-w-[320px]">
                    <div class="flex items-center gap-3 mb-3">
                      <div
                        class="w-7 h-7 shrink-0 rounded-full bg-kementan-green text-white flex items-center justify-center text-xs font-bold shadow-sm">
                        {{ Number(idx) + 1 }}
                      </div>
                      <h5 class="text-sm font-bold text-gray-800 leading-tight line-clamp-1">{{ p.namaLengkap }}</h5>
                    </div>
                    <div class="flex flex-col gap-1.5 ml-10">
                      <p class="text-xs text-gray-500 font-medium"><span class="font-bold text-gray-400">NIP:</span> {{
                        p.nip || '-' }}</p>
                      <p class="text-xs text-gray-500 font-medium"><span class="font-bold text-gray-400">Gol:</span> {{
                        p.pangkatGol || '-' }}</p>
                      <p class="text-xs text-gray-500 font-medium leading-relaxed max-w-[220px]"><span
                          class="font-bold text-gray-400">Jabatan:</span> {{ p.jabatan || '-' }}</p>
                    </div>
                  </div>

                  <!-- Kolom Input Lokasi & Tanggal -->
                  <div
                    class="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-5 w-full border-t border-gray-100 pt-4 md:border-t-0 md:pt-0 md:border-l md:pl-6">
                    <div>
                      <label class="flex items-center gap-1.5 text-xs font-bold text-gray-600 mb-2">
                        <MapPin :size="14" class="text-gray-400" /> Lokasi Tujuan
                      </label>
                      <input v-model="p.tujuan" type="text"
                        class="w-full bg-white border border-gray-300 rounded-xl py-3 px-4 text-sm outline-none focus:border-kementan-green transition-all font-bold"
                        placeholder="Contoh: Bogor, Jawa Barat">
                    </div>
                    <div>
                      <label class="flex items-center gap-1.5 text-xs font-bold text-gray-600 mb-2">
                        <Calendar :size="14" class="text-gray-400" /> Waktu Pelaksanaan
                      </label>
                      <input v-model="p.tanggalPelaksanaan" type="text"
                        class="w-full bg-white border border-gray-300 rounded-xl py-3 px-4 text-sm outline-none focus:border-kementan-green transition-all font-bold"
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
            <button :disabled="isSubmitting || !formData.no || !formData.mak || formData.peserta.length === 0"
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
    </div>

    <!-- SUCCESS MODAL -->
    <Teleport to="body">
      <transition name="modal-fade">
        <div v-if="successModal.isOpen" class="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-gray-900/50" @click="successModal.isOpen = false" />

          <div v-motion :initial="{ opacity: 0, scale: 0.95, y: 12 }"
            :enter="{ opacity: 1, scale: 1, y: 0, transition: { duration: 200 } }"
            class="relative bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl">
            <div class="p-6 pb-2 text-center">
              <div class="w-14 h-14 rounded-full bg-emerald-50 mx-auto flex items-center justify-center mb-4">
                <CheckCircle :size="28" class="text-emerald-500" />
              </div>
              <h3 class="text-lg font-bold text-gray-800 mb-1">
                SPT Berhasil Disimpan!
              </h3>
              <p class="text-sm text-gray-500">
                Dokumen telah diarsipkan ke sistem.
              </p>
            </div>

            <div class="px-6 pb-2">
              <div class="grid grid-cols-2 gap-3">
                <div class="bg-gray-50 p-3.5 rounded-xl">
                  <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Nomor Surat
                  </p>
                  <p class="text-xs font-bold text-gray-800 truncate">
                    {{ successModal.item?.no }}
                  </p>
                </div>
                <div class="bg-emerald-50 p-3.5 rounded-xl">
                  <p class="text-[9px] font-bold text-emerald-400 uppercase tracking-widest mb-1">
                    Peserta
                  </p>
                  <p class="text-xs font-bold text-emerald-700">
                    {{ successModal.item?.pesertaCount }} Orang
                  </p>
                </div>
              </div>
            </div>
            <div class="p-5 pt-4 flex flex-col gap-2.5">
              <template v-if="successModal.item?.fileLink">
                <button
                  class="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2.5 hover:bg-blue-700 transition-colors text-sm"
                  @click="openPreview(successModal.item!.fileLink)">
                  <Eye :size="18" /> Preview Dokumen
                </button>
                <button
                  class="w-full py-3 bg-emerald-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2.5 hover:bg-emerald-600 transition-colors text-sm"
                  @click="triggerDownload(successModal.item!.fileLink, `SPT_${successModal.item?.no?.replace(/\//g, '_')}`)">
                  <Download :size="18" /> Download PDF
                </button>
              </template>
              <p v-else class="text-center text-xs text-gray-400 font-semibold py-3">
                PDF sedang diproses...
              </p>
              <button
                class="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors"
                @click="successModal.isOpen = false">
                Tutup
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronLeft, Plus, Search, Trash2, Users, FileText, ChevronDown, ChevronUp, CheckCircle2, CheckCircle, UserCircle, UserPlus, Briefcase, Zap, MapPin, Calendar, Save, Eye, Download, X } from 'lucide-vue-next'
import SearchableDropdown from '../SearchableDropdown.vue'
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
const pejabats = ['Direktur', 'Kasubbag Tata Usaha', 'Ketua Tim', 'Kabag']
const jabatanPenandatangans = ['Direktur', 'Pejabat Pembuat Komitmen', 'Kuasa Pengguna Anggaran']

// --- Missing variable declarations ---
const participantSelector = ref('')
const isPegawaiLoading = ref(false)
const isBulkFill = ref(false)
const bulkTujuan = ref('')
const bulkTanggal = ref('')
const isSubmitting = ref(false)
const successModal = ref<{
  isOpen: boolean
  item: { no?: string; pesertaCount?: number; fileLink?: string } | null
}>({
  isOpen: false,
  item: null
})

const getPegawaiIndex = (nama: string) => {
  return props.pegawaiOptions.findIndex(p => p.value === nama)
}

const addParticipant = (value: string) => {
  if (!value) return
  const peg = props.pegawaiList.find(p => p.namaLengkap === value)
  if (!peg) return
  // Prevent duplicates
  if (formData.value.peserta.some((p: any) => p.namaLengkap === peg.namaLengkap)) return
  formData.value.peserta.push({
    namaLengkap: peg.namaLengkap,
    nip: peg.nip || '-',
    jabatan: peg.jabatan || '',
    pangkatGol: peg.pangkatGolongan || '-',
    pangkatGolongan: peg.pangkatGolongan || '-',
    tujuan: bulkTujuan.value || '',
    tanggalPelaksanaan: bulkTanggal.value || '',
    lamanya: '',
    tanggalMulai: '',
    tanggalSelesai: ''
  })
  participantSelector.value = ''
}

const applyBulkFill = () => {
  formData.value.peserta.forEach((p: any) => {
    if (bulkTujuan.value) p.tujuan = bulkTujuan.value
    if (bulkTanggal.value) p.tanggalPelaksanaan = bulkTanggal.value
  })
}

const handlePegawaiChange = (index: number, pesertaIndex: number) => {
  if (index >= 0) {
    let pList = props.pegawaiList
    if (props.adminProfile.role !== 'Super Admin' && props.adminProfile.timPoksi) {
       pList = pList.filter(p => p.timPoksi === props.adminProfile.timPoksi)
    }
    const peg = pList[index]
    formData.value.peserta[pesertaIndex] = {
      ...formData.value.peserta[pesertaIndex],
      namaLengkap: peg.namaLengkap,
      nip: peg.nip || '-',
      jabatan: peg.jabatan,
      pangkatGolongan: peg.pangkatGolongan || '-'
    }
  } else {
    formData.value.peserta[pesertaIndex] = {
      ...formData.value.peserta[pesertaIndex],
      namaLengkap: '', nip: '', jabatan: '', pangkatGolongan: ''
    }
  }
}

const handlePenandatanganChange = (index: number) => {
   if (index >= 0) {
     const peg = props.pegawaiList[index]
     formData.value.namaPenandatangan = peg.namaLengkap
     formData.value.nipPenandatangan = peg.nip || '-'
   } else {
     formData.value.namaPenandatangan = ''
     formData.value.nipPenandatangan = ''
   }
}

const addPeserta = () => {
    formData.value.peserta.push({
        namaLengkap: '', nip: '', jabatan: '', pangkatGolongan: '', tujuan: '', lamanya: '',
        tanggalMulai: formData.value.peserta[0]?.tanggalMulai || '',
        tanggalSelesai: formData.value.peserta[0]?.tanggalSelesai || ''
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
</script>\n