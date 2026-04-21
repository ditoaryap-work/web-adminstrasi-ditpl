<template>
  <div class="space-y-6">
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div v-motion :initial="{ opacity: 0, x: -20 }" :enter="{ opacity: 1, x: 0 }">
          <div class="flex items-center gap-3 mb-2 text-kementan-green">
            <Inbox :size="20" />
            <span class="text-xs font-bold tracking-[0.3em] uppercase">Manajemen Dokumen</span>
          </div>
          <h1 class="text-3xl font-extrabold text-gray-800">
            Arsip Persuratan
          </h1>
          <p class="text-gray-500 mt-2 text-sm max-w-lg font-medium">
            Registrasi surat masuk, keluar, dan notulensi acara Direktorat secara digital.
          </p>
        </div>

        <button
          class="bg-kementan-green text-white px-6 py-3.5 rounded-2xl font-bold shadow-lg shadow-kementan-green/20 flex items-center gap-3 hover:bg-[#004d26] transition-all text-sm active:scale-95"
          @click="openForm()">
          <Plus :size="18" />
          <span>Registrasi Surat Baru</span>
        </button>
      </div>

      <!-- Filter & Search -->
      <div v-motion :initial="{ opacity: 0, y: 10 }" :enter="{ opacity: 1, y: 0 }"
        class="glass-card p-4 rounded-2xl flex flex-col lg:flex-row gap-4">
        <div
          class="flex items-center gap-1 sm:gap-2 bg-gray-50 p-1 rounded-xl border border-gray-100 overflow-x-auto custom-scrollbar shrink-0 max-w-full">
          <button v-for="tab in filterTabs" :key="tab.value"
            class="px-3 sm:px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap"
            :class="filterTipe === tab.value ? 'bg-white text-kementan-green shadow-sm border border-gray-100' : 'text-gray-500 hover:text-gray-700'"
            @click="filterTipe = tab.value">
            {{ tab.label }}
          </button>
        </div>

        <div class="relative flex-1">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" :size="18" />
          <input v-model="localSearchQuery" type="text"
            placeholder="Cari berdasarkan nomor surat, perihal, atau asal tujuan..."
            class="w-full bg-white border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 text-gray-900 outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all shadow-sm text-sm font-medium placeholder:text-gray-400">
        </div>
        <button
          class="flex items-center gap-2 px-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-gray-600 hover:text-kementan-green hover:border-kementan-green hover:bg-emerald-50 transition-all shadow-sm text-sm font-bold group active:scale-95"
          :disabled="isLoading" title="Refresh Data dari Server" @click="handleRefresh">
          <RefreshCw :size="18" :class="{ 'animate-spin': isLoading }" />
          <span class="hidden sm:inline">Refresh Data</span>
        </button>
      </div>

      <!-- Table Section -->
      <div class="glass-card rounded-3xl overflow-hidden shadow-md border-gray-200 min-h-[400px] relative">
        <div v-if="isLoading && suratList.length === 0"
          class="flex flex-col items-center justify-center py-20 bg-white/50 h-full absolute inset-0">
          <div class="w-10 h-10 border-4 border-kementan-green/20 border-t-kementan-green rounded-full animate-spin" />
          <p class="mt-4 text-sm font-bold text-gray-500 uppercase tracking-widest animate-pulse">
            Memuat Data...
          </p>
        </div>

        <div v-else class="overflow-x-auto custom-scrollbar">
          <table class="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr
                class="bg-gray-50/80 text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] border-b border-gray-200">
                <th class="py-5 px-6 w-[30%]">
                  Identitas Dokumen
                </th>
                <th class="py-5 px-6 w-[40%]">
                  Konten Utama & Perihal
                </th>
                <th class="py-5 px-6 text-center w-[30%]">
                  Status & Aksi
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white/40">
              <template v-if="paginatedList.length > 0">
                <tr v-for="(surat, i) in paginatedList" :key="surat.id" v-motion :initial="{ opacity: 0, y: 5 }"
                  :enter="{ opacity: 1, y: 0, transition: { delay: i * 30 } }"
                  class="group hover:bg-emerald-50/10 transition-colors">
                  <!-- COLUMN 1: IDENTITAS (30%) -->
                  <td class="py-5 px-6 align-top w-[30%]">
                    <div class="flex flex-col gap-3">
                      <div class="flex items-center gap-2">
                        <span
                          class="inline-block px-2 py-0.5 rounded text-[9px] font-black tracking-widest uppercase border"
                          :class="surat.tipeSurat === 'Masuk' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-purple-50 text-purple-600 border-purple-100'">
                          {{ surat.tipeSurat }}
                        </span>
                        <div
                          class="px-2 py-0.5 rounded-full bg-gray-50 border border-gray-200 text-[8px] font-black text-gray-500 uppercase tracking-widest">
                          {{ surat.timPoksi || 'UMUM' }}
                        </div>
                      </div>
                      <div class="space-y-1">
                        <p class="text-sm font-bold text-gray-900 leading-tight truncate px-0.5" :title="surat.nomorSurat">
                          {{ surat.nomorSurat || '[NOMOR BELUM DIISI]' }}
                        </p>
                        <div class="flex items-center gap-2 px-0.5">
                          <span class="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                            {{ formatIndoDate(surat.tanggalSurat) }}
                          </span>
                          <span v-if="surat.createdAt" class="text-[9px] text-gray-300 font-medium italic border-l border-gray-200 pl-2">
                            {{ formatIndoDateTime(surat.createdAt).split(' ')[1] }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <!-- COLUMN 2: KONTEN UTAMA (40%) -->
                  <td class="py-5 px-6 align-top w-[40%]">
                    <div class="space-y-3">
                      <div>
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Asal / Tujuan</p>
                        <p class="text-sm font-bold text-gray-800 leading-tight uppercase tracking-tight line-clamp-1 truncate" :title="surat.asalTujuan">
                          {{ surat.asalTujuan }}
                        </p>
                      </div>
                      
                      <div>
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Perihal</p>
                        <p class="text-xs text-gray-600 leading-relaxed font-medium line-clamp-2 italic">
                          "{{ surat.perihal }}"
                        </p>
                      </div>

                      <div class="flex flex-wrap items-center gap-2 pt-1">
                        <span class="px-2 py-0.5 rounded bg-slate-50 border border-slate-100 text-[8px] font-black text-slate-500 uppercase tracking-widest">
                          {{ surat.kategoriSurat }}
                        </span>
                        <span class="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border"
                          :class="{
                            'bg-rose-50 text-rose-600 border-rose-100': surat.sifatSurat === 'Rahasia' || surat.sifatSurat === 'Penting',
                            'bg-amber-50 text-amber-600 border-amber-100': surat.sifatSurat === 'Segera',
                            'bg-emerald-50 text-emerald-600 border-emerald-100': surat.sifatSurat === 'Biasa'
                          }">
                          {{ surat.sifatSurat }}
                        </span>
                      </div>
                    </div>
                  </td>

                  <!-- COLUMN 3: STATUS & AKSI (30%) -->
                  <td class="py-5 px-6 align-top w-[30%]">
                    <div class="flex flex-col gap-3">
                      <!-- Row 1: Status Badge -->
                      <div class="flex justify-center">
                        <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm transition-all"
                          :class="surat.fileNotulensi ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'">
                          <component :is="surat.fileNotulensi ? CheckCircle2 : AlertCircle" :size="12" />
                          {{ surat.fileNotulensi ? 'SELESAI' : 'MENUNGGU' }}
                        </div>
                      </div>

                      <!-- Row 2: Unified Action Group (Info + File) -->
                      <div class="flex items-center justify-center gap-1.5 bg-gray-50/50 p-1.5 rounded-2xl border border-gray-100 shadow-inner">
                        <!-- Info Button -->
                        <button
                          class="px-3 py-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center gap-2 group/info"
                          @click="emit('view-detail', surat)">
                          <Info :size="15" />
                          <span class="text-[9px] font-black uppercase tracking-tighter">Detail</span>
                        </button>

                        <div class="w-[1px] h-6 bg-gray-200 mx-1"></div>

                        <!-- File Actions -->
                        <div v-if="surat.fileSurat" class="flex items-center gap-1">
                          <button
                            class="p-2 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm flex items-center justify-center border border-blue-200"
                            title="Preview Surat" @click="openPreview(surat.fileSurat)">
                            <Eye :size="14" />
                          </button>
                          <button
                            class="p-2 bg-white text-slate-400 rounded-xl border border-slate-200 hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm"
                            title="Download Surat" @click="triggerDownload(surat.fileSurat, `Surat_${surat.nomorSurat.replace(/\//g, '_')}`)">
                            <Download :size="14" />
                          </button>
                        </div>
                        <div v-else class="text-[8px] font-black text-gray-300 italic px-2">TANPA FILE</div>
                      </div>

                      <!-- Row 3: Follow-up Action Area -->
                      <div class="flex items-center justify-center">
                        <div v-if="surat.fileNotulensi" class="flex items-center gap-2 bg-emerald-50/50 p-1.5 rounded-2xl border border-emerald-100 w-full max-w-[220px]">
                           <button
                              class="flex-1 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm"
                              @click="openPreview(surat.fileNotulensi)">
                              <FileCheck :size="13" /> LIHAT HASIL
                            </button>
                           <button
                              class="p-2 bg-white text-emerald-600 rounded-xl border border-emerald-200 hover:bg-emerald-50 transition-all shadow-sm"
                              title="Download Hasil"
                              @click="triggerDownload(surat.fileNotulensi, `Ntl_${surat.nomorSurat.replace(/\//g, '_')}`)">
                              <Download :size="13" />
                            </button>
                        </div>
                        <button v-else
                          class="w-full max-w-[220px] py-2.5 bg-white text-amber-600 rounded-2xl border-2 border-dashed border-amber-200 hover:bg-amber-50 hover:border-amber-400 hover:scale-[1.02] transition-all font-black text-[10px] flex items-center justify-center gap-2 uppercase tracking-widest shadow-sm"
                          @click="openNotulensiModal(surat)">
                          <NotebookPen :size="16" /> Tindak Lanjut
                        </button>
                      </div>

                      <!-- Row 4: System Area (Sync with SPTJM style) -->
                      <div class="flex items-center justify-center gap-2 pt-2 border-t border-gray-100">
                         <button
                          class="px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 hover:bg-emerald-600 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm"
                          @click="openForm(surat)">
                          <Edit :size="12" /> Edit
                        </button>
                         <button
                          class="px-4 py-1.5 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 hover:bg-rose-600 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm"
                          @click="handleDelete(surat.id)">
                          <Trash2 :size="12" /> Hapus
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
              <tr v-else>
                <td colspan="4" class="py-24 text-center">
                  <div v-motion :initial="{ opacity: 0, scale: 0.9 }" :enter="{ opacity: 1, scale: 1 }"
                    class="flex flex-col items-center gap-4">
                    <div class="w-16 h-16 rounded-3xl bg-gray-50 flex items-center justify-center border border-gray-100 shadow-inner">
                      <Inbox :size="32" class="text-gray-300" />
                    </div>
                    <div class="space-y-1">
                      <p class="text-gray-800 font-black text-sm uppercase tracking-[0.2em]">
                        Arsip Belum Ditemukan
                      </p>
                      <p class="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                        Sesuaikan filter atau kata kunci pencarian Anda
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination (SPT Standard) -->
        <div v-if="filteredList.length > 0 && !isLoading"
          class="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50/50">
          <p class="text-xs text-gray-600 font-medium">
            Menampilkan <span class="font-bold text-gray-700">{{ (currentPage - 1) * ITEMS_PER_PAGE + 1 }}–{{
              Math.min(currentPage *
                ITEMS_PER_PAGE, filteredList.length) }}</span> dari <span class="font-bold text-gray-700">{{
                filteredList.length
              }}</span>
          </p>
          <div class="flex gap-1">
            <button :disabled="currentPage <= 1"
              class="p-1.5 rounded-lg border bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-all shadow-sm"
              @click="currentPage--">
              <ChevronLeft :size="16" />
            </button>
            <button :disabled="currentPage >= totalPages"
              class="p-1.5 rounded-lg border bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-all shadow-sm"
              @click="currentPage++">
              <ChevronRight :size="16" />
            </button>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight, Inbox, Eye, Download, NotebookPen, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-vue-next'
import type { SuratData } from '../../types/api'
import { formatIndoDate, formatIndoDateTime } from '../../utils/date'

const props = defineProps<{
  suratList: SuratData[]
  isLoading: boolean
  searchQuery: string
  filterTipe: string
  currentPage: number
  adminRole: string
  adminTimPoksi: string
}>()

const emit = defineEmits<{
  (e: 'update:searchQuery', value: string): void
  (e: 'update:filterTipe', value: string): void
  (e: 'update:currentPage', value: number): void
  (e: 'refresh'): void
  (e: 'add'): void
  (e: 'edit', item: SuratData): void
  (e: 'delete', id: string): void
  (e: 'preview', url: string): void
  (e: 'download', url: string, filename: string): void
  (e: 'openNotulensi', item: SuratData): void
  (e: 'view-detail', item: SuratData): void
}>()

const filterTabs = [
  { value: 'Semua', label: 'Semua Arsip' },
  { value: 'Masuk', label: 'Surat Masuk' },
  { value: 'Keluar', label: 'Surat Keluar' },
  { value: 'BelumTindakLanjut', label: 'Belum Ada Hasil' },
]

const localSearchQuery = computed({ get: () => props.searchQuery, set: (val) => { emit('update:searchQuery', val); emit('update:currentPage', 1) } })
const localFilterTipe = computed({ get: () => props.filterTipe, set: (val) => { emit('update:filterTipe', val); emit('update:currentPage', 1) } })
const localCurrentPage = computed({ get: () => props.currentPage, set: (val) => emit('update:currentPage', val) })

const ITEMS_PER_PAGE = 10

const filteredList = computed(() => {
  let list = props.suratList
  if (props.adminRole !== 'Super Admin' && props.adminTimPoksi) {
    list = list.filter(s => s.timPoksi === props.adminTimPoksi)
  }
  if (localFilterTipe.value === 'BelumTindakLanjut') {
    list = list.filter(s => !s.fileNotulensi && (!s.tindakLanjut || s.tindakLanjut.trim() === ''))
  } else if (localFilterTipe.value !== 'Semua') {
    list = list.filter(s => s.tipeSurat === localFilterTipe.value)
  }
  if (localSearchQuery.value.trim()) {
    const q = localSearchQuery.value.toLowerCase()
    list = list.filter(s =>
      (s.nomorSurat ?? '').toLowerCase().includes(q) ||
      (s.perihal ?? '').toLowerCase().includes(q) ||
      (s.asalTujuan ?? '').toLowerCase().includes(q)
    )
  }
  return list
})

const totalPages = computed(() => Math.ceil(filteredList.value.length / ITEMS_PER_PAGE) || 1)
const safePage = computed(() => Math.min(localCurrentPage.value, totalPages.value))
const paginatedList = computed(() => filteredList.value.slice((safePage.value - 1) * ITEMS_PER_PAGE, safePage.value * ITEMS_PER_PAGE))

function triggerDownload(url: string, filename: string) { emit('download', url, filename) }
function openPreview(url: string) { emit('preview', url) }
function openForm(item?: SuratData) { item ? emit('edit', item) : emit('add') }
function handleRefresh() { emit('refresh') }
function handleDelete(id: string) { emit('delete', id) }
function openNotulensiModal(item: SuratData) { emit('openNotulensi', item) }
const filterTipe = localFilterTipe
const currentPage = localCurrentPage
</script>

