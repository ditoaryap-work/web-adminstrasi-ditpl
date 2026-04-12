<template>
  <div class="space-y-6 pb-12">
    <!-- View Mode: LIST -->
    <div
      v-if="viewMode === 'list'"
      class="space-y-6"
    >
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div
          v-motion
          :initial="{ opacity: 0, x: -20 }"
          :enter="{ opacity: 1, x: 0 }"
        >
          <div class="flex items-center gap-3 mb-2 text-kementan-green">
            <FileText :size="20" />
            <span class="text-xs font-bold tracking-[0.3em] uppercase">Arsip Kedinasan</span>
          </div>
          <h1 class="text-3xl font-extrabold text-gray-800">
            Manajer SPT
          </h1>
          <p class="text-gray-500 mt-2 text-sm max-w-lg font-medium">
            Kelola, terbitkan, dan simpan arsip Surat Perintah Tugas (SPT) Direktorat.
          </p>
        </div>

        <button 
          class="bg-kementan-green text-white px-6 py-3 rounded-xl font-bold shadow-md shadow-kementan-green/20 flex items-center gap-3 hover:bg-[#004d26] transition-all text-sm"
          @click="openForm()"
        >
          <Plus :size="18" />
          <span>Buat SPT Baru</span>
        </button>
      </div>

      <!-- Filter & Search -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 10 }"
        :enter="{ opacity: 1, y: 0 }"
        class="glass-card p-4 rounded-2xl flex flex-col lg:flex-row gap-4"
      >
        <div class="relative flex-1">
          <Search
            class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            :size="18"
          />
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Cari berdasarkan nomor surat atau maksud perjalanan..."
            class="w-full bg-white border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-gray-800 outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all shadow-sm text-sm font-medium placeholder:text-gray-400"
          >
        </div>
      </div>

      <!-- Table Section -->
      <div class="glass-card rounded-3xl overflow-hidden shadow-md border-gray-200 min-h-[400px] relative">
        <div
          v-if="isLoading && sptList.length === 0"
          class="flex flex-col items-center justify-center py-20 bg-white/50 h-full absolute inset-0"
        >
          <div class="w-10 h-10 border-4 border-kementan-green/20 border-t-kementan-green rounded-full animate-spin" />
          <p class="mt-4 text-sm font-bold text-gray-500 uppercase tracking-widest animate-pulse">
            Memuat Data...
          </p>
        </div>
        
        <div
          v-else
          class="overflow-x-auto custom-scrollbar"
        >
          <table class="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr class="bg-gray-50/80 text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] border-b border-gray-200">
                <th class="py-5 px-6">
                  Data Dokumen
                </th>
                <th class="py-5 px-6 text-center">
                  Peserta
                </th>
                <th class="py-5 px-6">
                  Maksud Perjalanan & Tujuan
                </th>
                <th class="py-5 px-6 text-center">
                  Aksi Dokumen
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white/40">
              <template v-if="paginatedList.length > 0">
                <tr 
                  v-for="(spt, i) in paginatedList" 
                  :key="spt.id_spt"
                  v-motion
                  :initial="{ opacity: 0, y: 5 }"
                  :enter="{ opacity: 1, y: 0, transition: { delay: i * 30 } }"
                  class="group hover:bg-emerald-50/30 transition-colors"
                >
                  <td class="py-4 px-6">
                    <div>
                      <div class="mt-1" />
                      <p class="text-sm font-bold text-gray-800">
                        {{ spt.no || '[Nomor Belum Diisi]' }}
                      </p>
                      <p class="text-[10px] text-gray-500 font-bold tracking-widest mt-1 uppercase">
                        {{ formatIndoDate(spt.tanggal_surat) }} 
                        <span
                          v-if="spt.created_at"
                          class="mx-1 lowercase text-gray-300 font-normal"
                        >|</span> 
                        <span
                          v-if="spt.created_at"
                          class="text-[9px] font-normal capitalize opacity-75"
                        >Dibuat: {{ spt.created_at }}</span>
                      </p>
                    </div>
                  </td>
                  <td class="py-4 px-6 text-center">
                    <div class="flex flex-col items-center gap-1">
                      <div class="inline-block px-3 py-1 rounded-full text-[10px] font-bold border border-gray-200 bg-gray-50 uppercase tracking-tighter">
                        {{ spt.peserta_count }} Peserta
                      </div>
                      <span class="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                        {{ (spt.peserta_count || 0) > 5 ? 'Template Lampiran' : 'Template Lembar 1' }}
                      </span>
                    </div>
                  </td>
                  <td class="py-4 px-6">
                    <div class="max-w-md">
                      <p class="text-xs text-gray-600 leading-relaxed font-medium line-clamp-2">
                        {{ spt.maksud_perjalanan }}
                      </p>
                      <p class="text-[10px] text-kementan-green font-bold mt-1 uppercase tracking-widest">
                        {{ spt.peserta?.[0]?.tujuan || '-' }}
                      </p>
                    </div>
                  </td>
                  <td class="py-4 px-6 text-center">
                    <div class="flex items-center justify-center gap-2">
                      <button
                        v-if="spt.file_link"
                        class="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors font-bold text-xs flex items-center gap-2 shadow-sm"
                        @click="openFile(spt.file_link)"
                      >
                        <Download :size="14" /> Download
                      </button>
                      <button
                        v-if="spt.file_link"
                        class="p-1.5 bg-white rounded-lg text-gray-400 border border-gray-200 hover:text-blue-600 shadow-sm transition-all"
                        title="Preview di Tab Baru"
                        @click="openFile(spt.file_link)"
                      >
                        <ExternalLink :size="14" />
                      </button>
                      <span
                        v-if="!spt.file_link"
                        class="px-3 py-1.5 bg-gray-50 text-gray-400 rounded-lg border border-gray-200 text-xs font-medium"
                      >
                        Belum Ada
                      </span>
                      <button
                        class="p-1.5 bg-white rounded-lg text-gray-400 border border-gray-200 hover:text-kementan-green shadow-sm transition-all"
                        title="Edit"
                        @click="openForm(spt)"
                      >
                        <Edit :size="14" />
                      </button>
                      <button
                        class="p-1.5 bg-white rounded-lg text-gray-400 border border-gray-200 hover:text-red-500 shadow-sm transition-all"
                        title="Hapus"
                        @click="handleDelete(spt.id_spt)"
                      >
                        <Trash2 :size="14" />
                      </button>
                    </div>
                  </td>
                </tr>
              </template>
              <tr v-else>
                <td
                  colspan="4"
                  class="py-16 text-center"
                >
                  <div class="flex flex-col items-center gap-3">
                    <FileText
                      :size="32"
                      class="text-gray-300"
                    />
                    <p class="text-gray-400 font-medium text-sm">
                      Berdasarkan pencarian, tidak ditemukan data SPT yang sesuai.
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div
          v-if="filteredList.length > 0 && !isLoading"
          class="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50/50"
        >
          <p class="text-xs text-gray-500 font-medium">
            Menampilkan <span class="font-bold text-gray-700">{{ (safePage - 1) * ITEMS_PER_PAGE + 1 }}–{{ Math.min(safePage * ITEMS_PER_PAGE, filteredList.length) }}</span> dari <span class="font-bold text-gray-700">{{ filteredList.length }}</span>
          </p>
          <div class="flex gap-1">
            <button
              :disabled="safePage <= 1"
              class="p-1.5 rounded-lg border bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-30"
              @click="currentPage--"
            >
              <ChevronLeft :size="16" />
            </button>
            <button
              :disabled="safePage >= totalPages"
              class="p-1.5 rounded-lg border bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-30"
              @click="currentPage++"
            >
              <ChevronRight :size="16" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- View Mode: FORM -->
    <div
      v-else-if="viewMode === 'form'"
      v-motion
      :initial="{ opacity: 0, y: 10 }"
      :enter="{ opacity: 1, y: 0 }"
      class="max-w-5xl mx-auto space-y-6 pb-12"
    >
      <button
        class="flex items-center gap-2 text-gray-500 hover:text-kementan-green transition-colors font-semibold text-sm bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 w-max"
        @click="closeForm"
      >
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
                <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Nomor Surat Tugas <span class="text-red-400">*</span></label>
                <input 
                  v-model="formData.no" 
                  type="text" 
                  class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all font-bold placeholder:text-gray-300" 
                  placeholder="Contoh: 147.6/TU-040/J.4/11/2025" 
                >
              </div>
              <div>
                <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Tanggal Surat <span class="text-red-400">*</span></label>
                <input 
                  v-model="formData.tanggal_surat" 
                  type="date" 
                  class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 font-bold transition-all" 
                >
              </div>
            </div>

            <div>
              <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Maksud Perjalanan / Dasar Penugasan <span class="text-red-400">*</span></label>
              <textarea 
                v-model="formData.maksud_perjalanan" 
                rows="3"
                class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all font-medium leading-relaxed"
                placeholder="Jelaskan tujuan dan landasan hukum kegiatan penugasan ini..."
              />
            </div>
          </div>

          <!-- PESERTA PENUGASAN -->
          <div class="space-y-6">
            <div class="flex items-center justify-between border-b border-gray-100 pb-3">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users :size="18" />
                </div>
                <h4 class="text-xs font-black text-gray-700 tracking-widest uppercase">
                  Peserta Penugasan
                </h4>
              </div>
              <div 
                class="px-3 py-1 rounded-full text-[10px] font-black tracking-widest border"
                :class="formData.peserta.length > 5 ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-emerald-50 text-kementan-green border-emerald-100'"
              >
                {{ formData.peserta.length > 5 ? 'FORMAT LAMPIRAN (2 HALAMAN)' : 'FORMAT BODY (1 HALAMAN)' }}
              </div>
            </div>

            <div class="space-y-4">
              <div
                v-if="formData.peserta.length === 0"
                class="py-12 border-2 border-dashed border-gray-100 rounded-3xl text-center space-y-4"
              >
                <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                  <UserPlus :size="32" />
                </div>
                <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Belum ada peserta terpilih
                </p>
              </div>

              <div
                v-else
                class="space-y-3"
              >
                <div 
                  v-for="(p, idx) in formData.peserta" 
                  :key="idx"
                  class="bg-white border-2 border-kementan-green/20 p-5 rounded-2xl shadow-sm relative group overflow-hidden"
                >
                  <div class="absolute top-0 left-0 w-1.5 h-full bg-kementan-green/50" />
                  <div class="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center pb-4 border-b border-gray-100 mb-4">
                    <div class="flex items-center gap-3 min-w-0">
                      <div class="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-sm font-black text-kementan-green shrink-0">
                        {{ idx + 1 }}
                      </div>
                      <div class="min-w-0">
                        <p class="text-sm font-extrabold text-gray-800 truncate">
                          {{ p.nama_lengkap }}
                        </p>
                        <p class="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                          NIP: {{ p.nip || 'Tanpa NIP' }} <span class="mx-1">•</span> Gol: {{ p.pangkat_gol || '-' }} <span class="mx-1">•</span> {{ p.jabatan || '-' }}
                        </p>
                      </div>
                    </div>
                    <button
                      class="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-lg transition-colors font-bold text-xs uppercase tracking-widest border border-red-100 hover:border-red-500 shrink-0"
                      @click="removeParticipant(idx)"
                    >
                      <Trash2 :size="14" /> Hapus
                    </button>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Lokasi Tujuan</label>
                      <input
                        v-model="p.tujuan"
                        type="text"
                        class="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-xs font-bold outline-none focus:border-kementan-green focus:bg-white transition-all focus:ring-4 focus:ring-kementan-green/10"
                        placeholder="Contoh: Bogor"
                      >
                    </div>
                    <div>
                      <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Waktu Pelaksanaan</label>
                      <input
                        v-model="p.tanggal_pelaksanaan"
                        type="text"
                        class="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-xs font-bold outline-none focus:border-kementan-green focus:bg-white transition-all focus:ring-4 focus:ring-kementan-green/10"
                        placeholder="Contoh: 24 – 30 Des 2025"
                      >
                    </div>
                  </div>
                </div>
              </div>

              <div class="pt-2">
                <SearchableDropdown
                  v-model:value="participantSelector"
                  label="Cari & Tambah Peserta"
                  :options="pegawaiOptions"
                  placeholder="Ketik nama atau NIP pegawai..."
                  @change="addParticipant"
                />
              </div>
            </div>
          </div>

          <!-- MAK -->
          <div class="space-y-6">
            <div class="flex items-center gap-3 border-b border-gray-100 pb-3">
              <div class="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <FileText :size="18" />
              </div>
              <h4 class="text-xs font-black text-gray-700 tracking-widest uppercase">
                Kode MAK
              </h4>
            </div>
            <div>
              <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">MAK (Mata Anggaran Keluaran) <span class="text-red-400">*</span></label>
              <input 
                v-model="formData.mak" 
                type="text" 
                class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all font-bold" 
                placeholder="Contoh: MAK 7012.EAH.001.054.A.524111" 
              >
            </div>
          </div>

          <!-- FOOTER ACTIONS -->
          <div class="pt-8 border-t border-gray-100 flex gap-4">
            <button
              type="button"
              class="px-6 py-3.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm w-40"
              @click="closeForm"
            >
              Batal
            </button>
            <button 
              :disabled="isSubmitting || !formData.no || !formData.mak || formData.peserta.length === 0" 
              class="flex-1 px-6 py-3.5 bg-kementan-green text-white font-bold rounded-xl hover:bg-[#004d26] transition-all flex justify-center items-center gap-3 shadow-md shadow-kementan-green/20 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed text-sm uppercase tracking-widest" 
              @click="handleSave"
            >
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
        <div
          v-if="successModal.isOpen"
          class="fixed inset-0 z-[10000] flex items-center justify-center p-4"
        >
          <div
            class="absolute inset-0 bg-gray-900/50"
            @click="successModal.isOpen = false"
          />
          
          <div 
            v-motion
            :initial="{ opacity: 0, scale: 0.95, y: 12 }"
            :enter="{ opacity: 1, scale: 1, y: 0, transition: { duration: 200 } }"
            class="relative bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl"
          >
            <div class="p-6 pb-2 text-center">
              <div class="w-14 h-14 rounded-full bg-emerald-50 mx-auto flex items-center justify-center mb-4">
                <CheckCircle
                  :size="28"
                  class="text-emerald-500"
                />
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
                    {{ successModal.item?.peserta_count }} Orang
                  </p>
                </div>
              </div>
            </div>
            <div class="p-5 pt-4 flex flex-col gap-2.5">
              <button 
                v-if="successModal.item?.file_link"
                class="w-full py-3 bg-emerald-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2.5 hover:bg-emerald-600 transition-colors text-sm" 
                @click="openFile(successModal.item.file_link)"
              >
                <Download :size="18" /> Download PDF
              </button>
              <p
                v-else
                class="text-center text-xs text-gray-400 font-semibold py-3"
              >
                PDF sedang diproses...
              </p>
              <button 
                class="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors" 
                @click="successModal.isOpen = false"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- Global Loading Overlay -->
    <Teleport to="body">
      <transition name="fade">
        <div
          v-if="isProcessing"
          class="fixed inset-0 z-[11000] flex flex-col items-center justify-center p-6 bg-slate-900/80"
        >
          <div class="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <p class="mt-6 text-white font-bold tracking-widest uppercase animate-pulse">
            {{ processingMessage }}
          </p>
        </div>
      </transition>
    </Teleport>

    <!-- Global Notifications Modal -->
    <GlobalModal 
      :is-open="notificationModal.isOpen"
      :type="notificationModal.type"
      :title="notificationModal.title"
      :message="notificationModal.message"
      :confirm-text="notificationModal.confirmText"
      @close="notificationModal.isOpen = false"
      @confirm="notificationModal.onConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { 
  FileText, Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight, 
  Save, Download, CheckCircle, Users, UserPlus, ExternalLink
} from 'lucide-vue-next'
import { fetchApi } from '../config/api'
import { useDataStore } from '../stores/useDataStore'
import { SptData, PegawaiData, AdminData, SptPeserta } from '../types/api'
import { formatIndoDate } from '../utils/date'
import GlobalModal from '../components/GlobalModal.vue'
import SearchableDropdown from '../components/SearchableDropdown.vue'

const ITEMS_PER_PAGE = 10

// Store
const dataStore = useDataStore()

// State
const sptList = ref<SptData[]>([])
const pegawaiList = ref<PegawaiData[]>([])
const isLoading = ref(true)
const searchQuery = ref('')
const currentPage = ref(1)
const viewMode = ref<'list'|'form'>('list')
const isEditMode = ref(false)
const isSubmitting = ref(false)
const isProcessing = ref(false)
const processingMessage = ref('')
const adminProfile = ref<AdminData | null>(null)

const participantSelector = ref('')

const formData = ref({
  id_spt: '',
  no: '',
  tanggal_surat: '',
  maksud_perjalanan: '',
  peserta: [] as SptPeserta[],
  tim_poksi: '',
  mak: ''
})

const successModal = ref({
  isOpen: false,
  item: null as SptData | null
})

const notificationModal = ref({
  isOpen: false,
  type: 'success' as 'success' | 'error' | 'warning' | 'info' | 'confirm',
  title: '',
  message: '',
  confirmText: '',
  onConfirm: () => {}
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
    type, title, message, onConfirm, confirmText
  }
}

// Lifecycle
onMounted(() => {
  const storedData = localStorage.getItem('adminData')
  if (storedData) {
    adminProfile.value = JSON.parse(storedData)
  }
  fetchData()
})

watch(searchQuery, () => {
  currentPage.value = 1
})

// Methods
const fetchData = async () => {
  isLoading.value = true
  const role = adminProfile.value?.role || 'Admin'
  const tim_poksi = role === 'Super Admin' ? 'SEMUA' : (adminProfile.value?.tim_poksi || '')
  
  try {
    let freshSpt: SptData[] = []
    let freshPegawai: PegawaiData[] = []

    // 1. Fetch SPT Data (from cache or network)
    if (dataStore.isCacheValid('spt')) {
      freshSpt = dataStore.sptData
    } else {
      const resSpt = await fetchApi<SptData[]>("GET_SPT_LIST", { tim_poksi })
      if (resSpt.status && resSpt.data) {
        freshSpt = resSpt.data
        dataStore.setSptData(freshSpt)
      }
    }

    // 2. Fetch Pegawai Data
    if (dataStore.isCacheValid('pegawai')) {
      freshPegawai = dataStore.pegawaiData
    } else {
      const resPegawai = await fetchApi<PegawaiData[]>("GET_PEGAWAI")
      if (resPegawai.status && resPegawai.data) {
        freshPegawai = resPegawai.data
        dataStore.setPegawaiData(freshPegawai)
      }
    }

    sptList.value = freshSpt
    pegawaiList.value = freshPegawai
  } catch (err) {
    console.error("Gagal menarik data:", err)
    showNotification('error', 'Gagal Menarik Data', 'Terjadi kesalahan saat menghubungkan ke server.')
  } finally {
    isLoading.value = false
  }
}

const openForm = (data: SptData | null = null) => {
  if (data) {
    formData.value = { 
      ...data,
      peserta: Array.isArray(data.peserta) ? [...data.peserta] : []
    }
    isEditMode.value = true
  } else {
    formData.value = {
      id_spt: '',
      no: '',
      tanggal_surat: new Date().toISOString().split('T')[0],
      maksud_perjalanan: '',
      peserta: [],
      tim_poksi: adminProfile.value?.tim_poksi || '',
      mak: ''
    }
    isEditMode.value = false
  }
  participantSelector.value = ''
  viewMode.value = 'form'
}

const closeForm = () => {
  viewMode.value = 'list'
}

const addParticipant = (strIdx: string) => {
  if (!strIdx) return
  const p = pegawaiList.value[parseInt(strIdx)]
  if (!p) return

  // Check if exists using NIP or Exact Object Ref
  if (formData.value.peserta.some((existing: SptPeserta) => existing.nip === p.nip && existing.nama_lengkap === p.nama_lengkap)) {
    showNotification('warning', 'Duplikasi Peserta', 'Pegawai ini sudah ada di daftar peserta.')
    participantSelector.value = ''
    return
  }

  if (p) {
    let extractedGol = '-'
    // Since PegawaiData from interface has nama_lengkap
    if (p.golongan) {
      const match = p.golongan.match(/[IVX]+/i)
      if (match) extractedGol = match[0].toUpperCase()
    }

    formData.value.peserta.push({
      nama_lengkap: p.nama_lengkap, // fallback
      nip: p.nip,
      pangkat_gol: extractedGol,
      jabatan: p.jabatan,
      tujuan: '',
      tanggal_pelaksanaan: ''
    })
  }
  participantSelector.value = ''
}

const removeParticipant = (index: number) => {
  formData.value.peserta.splice(index, 1)
}

const handleSave = async () => {
  if (formData.value.peserta.length === 0) {
    showNotification('warning', 'Peserta Kosong', 'Harap masukkan minimal satu peserta penugasan.')
    return
  }

  isSubmitting.value = true
  try {
    const payload = {
      ...formData.value,
      peserta_count: formData.value.peserta.length
    }
    const result = await fetchApi("SAVE_SPT", { data: payload })
    
    if (result.status) {
      const savedItem = { ...payload, file_link: result.data?.file_link || null }
      successModal.value = { isOpen: true, item: savedItem }
      
      // Force cache invalidation so GET_SPT_LIST fetches new data
      dataStore.invalidateCache('spt')
      closeForm()
      await fetchData()
    } else {
      showNotification('error', 'Gagal Menyimpan', result.message || 'Terjadi kesalahan pada server.')
    }
  } catch {
    showNotification('error', 'Jaringan Error', 'Gagal menghubungi server. Pastikan koneksi internet stabil.')
  } finally {
    isSubmitting.value = false
  }
}

const handleDelete = (id: string) => {
  showNotification(
    'confirm', 
    'Konfirmasi Hapus', 
    'Apakah Anda yakin ingin menghapus arsip SPT ini? Tindakan ini tidak dapat dibatalkan.',
    async () => {
      isProcessing.value = true
      processingMessage.value = 'Menghapus Data...'
      try {
        const result = await fetchApi("DELETE_SPT", { id_spt: id })
        if (result.status) {
          dataStore.invalidateCache('spt') // invalidate cache after delete
          await fetchData()
          showNotification('success', 'Hapus Berhasil', 'Arsip SPT telah dihapus dari sistem.')
        } else {
          showNotification('error', 'Hapus Gagal', result.message)
        }
      } catch {
        showNotification('error', 'Gagal', 'Terjadi kesalahan jaringan saat menghapus.')
      } finally {
        isProcessing.value = false
      }
    }
  )
}

const openFile = (url: string) => {
  if (!url) return
  window.open(url, '_blank')
}


// Computed
const filteredList = computed(() => {
  return sptList.value.filter((s: SptData) => {
    const no = String(s.no || '').toLowerCase()
    const purpose = String(s.maksud_perjalanan || '').toLowerCase()
    const q = searchQuery.value.toLowerCase()
    return no.includes(q) || purpose.includes(q)
  })
})

const totalPages = computed(() => Math.ceil(filteredList.value.length / ITEMS_PER_PAGE) || 1)
const safePage = computed(() => Math.min(currentPage.value, Math.max(1, totalPages.value)))
const paginatedList = computed(() => filteredList.value.slice((safePage.value - 1) * ITEMS_PER_PAGE, safePage.value * ITEMS_PER_PAGE))

const pegawaiOptions = computed(() => pegawaiList.value.map((p: PegawaiData, idx: number) => ({
  value: String(idx), 
  label: `${p.nama_lengkap || p.nama} - ${p.jabatan || p.poksi || '-'}` 
})))
</script>

<style scoped>
/* Modal Transition */
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;  
  overflow: hidden;
}
</style>
