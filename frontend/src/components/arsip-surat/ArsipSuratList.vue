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
          class="bg-kementan-green text-white px-6 py-3 rounded-xl font-bold shadow-md shadow-kementan-green/20 flex items-center gap-3 hover:bg-[#004d26] transition-all text-sm"
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
            :class="filterTipe === tab.value ? 'bg-white text-kementan-green shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'"
            @click="filterTipe = tab.value">
            {{ tab.label }}
          </button>
        </div>

        <div class="relative flex-1">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" :size="18" />
          <input v-model="localSearchQuery" type="text"
            placeholder="Cari berdasarkan nomor surat, perihal, atau asal tujuan..."
            class="w-full bg-white border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-gray-800 outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all shadow-sm text-sm font-medium placeholder:text-gray-400">
        </div>
        <button
          class="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-600 hover:text-kementan-green hover:border-kementan-green hover:bg-emerald-50 transition-all shadow-sm text-sm font-bold group"
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
                <th class="py-5 px-6">
                  Dokumen & Asal/Tujuan
                </th>
                <th class="py-5 px-4 text-center">
                  Informasi
                </th>
                <th class="py-5 px-6">
                  Perihal & Status
                </th>
                <th class="py-5 px-6 text-center">
                  Aksi Dokumen
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white/40">
              <template v-if="paginatedList.length > 0">
                <tr v-for="(surat, i) in paginatedList" :key="surat.id" v-motion :initial="{ opacity: 0, y: 5 }"
                  :enter="{ opacity: 1, y: 0, transition: { delay: i * 30 } }"
                  class="group hover:bg-emerald-50/30 transition-colors">
                  <td class="py-4 px-6">
                    <div>
                      <div class="flex items-center gap-2 mb-1">
                        <span
                          class="inline-block px-2 py-0.5 rounded-md text-[9px] font-bold tracking-widest uppercase border"
                          :class="surat.tipeSurat === 'Masuk' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-purple-50 text-purple-600 border-purple-100'">
                          {{ surat.tipeSurat }}
                        </span>
                      </div>
                      <p class="text-sm font-bold text-gray-800">
                        {{ surat.nomorSurat || '[Nomor Belum Diisi]' }}
                      </p>
                      <p class="text-[10px] text-gray-400 font-medium mt-0.5">
                        {{ surat.asalTujuan }}
                      </p>
                      <p class="text-[10px] text-gray-500 font-bold tracking-widest mt-1 uppercase">
                        {{ formatIndoDate(surat.tanggalSurat) }}
                        <span v-if="surat.createdAt" class="mx-1 lowercase text-gray-300 font-normal">|</span>
                        <span v-if="surat.createdAt" class="text-[9px] font-normal capitalize opacity-75">Dibuat: {{
                          surat.createdAt }}</span>
                      </p>
                    </div>
                  </td>
                  <td class="py-4 px-4 text-center">
                    <div class="flex flex-col items-center gap-1.5">
                      <span
                        class="inline-block px-3 py-1 rounded-full text-[10px] font-bold border border-gray-200 bg-gray-50 uppercase tracking-tighter">
                        {{ surat.kategoriSurat }}
                      </span>
                      <span class="text-[9px] font-bold uppercase tracking-widest" :class="{
                        'text-red-500': surat.sifatSurat === 'Rahasia' || surat.sifatSurat === 'Penting',
                        'text-amber-500': surat.sifatSurat === 'Segera',
                        'text-kementan-green': surat.sifatSurat === 'Biasa'
                      }">
                        {{ surat.sifatSurat }}
                      </span>
                    </div>
                  </td>
                  <td class="py-4 px-6">
                    <div class="max-w-md">
                      <p class="text-xs text-gray-600 leading-relaxed font-medium line-clamp-2">
                        {{ surat.perihal }}
                      </p>
                      <div v-if="surat.kategoriSurat === 'Undangan'" class="mt-1.5">
                        <div class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-bold border"
                          :class="surat.fileNotulensi ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-500 border-rose-100'">
                          <component :is="surat.fileNotulensi ? CheckCircle2 : AlertCircle" :size="11" />
                          {{ surat.fileNotulensi ? 'Notulensi Tersedia' : 'Belum Ada Notulensi' }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="py-4 px-6 text-center">
                    <div class="flex items-center justify-center gap-2">
                      <!-- SURAT ACTIONS -->
                      <div v-if="surat.fileSurat"
                        class="flex gap-1 items-center bg-blue-50/50 p-1 rounded-xl border border-blue-100">
                        <button
                          class="px-2 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold text-[10px] flex items-center gap-1.5 shadow-sm uppercase tracking-wider"
                          title="Preview Surat" @click="openPreview(surat.fileSurat)">
                          <Eye :size="12" /> Preview
                        </button>
                        <button
                          class="p-1.5 bg-white rounded-lg text-indigo-600 border border-indigo-200 hover:bg-indigo-50 shadow-sm transition-all"
                          title="Download Surat"
                          @click="triggerDownload(surat.fileSurat, `Surat_${surat.nomorSurat.replace(/\//g, '_')}`)">
                          <Download :size="12" />
                        </button>
                      </div>

                      <!-- NOTULENSI ACTIONS -->
                      <div v-if="surat.fileNotulensi"
                        class="flex gap-1 items-center bg-emerald-50/50 p-1 rounded-xl border border-emerald-100">
                        <button
                          class="px-2 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-bold text-[10px] flex items-center gap-1.5 shadow-sm uppercase tracking-wider"
                          title="Preview Notulensi" @click="openPreview(surat.fileNotulensi)">
                          <Eye :size="12" /> Preview
                        </button>
                        <button
                          class="p-1.5 bg-white rounded-lg text-emerald-600 border border-emerald-200 hover:bg-emerald-50 shadow-sm transition-all"
                          title="Download Notulensi"
                          @click="triggerDownload(surat.fileNotulensi, `Ntl_${surat.nomorSurat.replace(/\//g, '_')}`)">
                          <Download :size="12" />
                        </button>
                      </div>
                      <button v-else-if="surat.kategoriSurat === 'Undangan'"
                        class="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors font-bold text-[10px] flex items-center gap-1.5 shadow-sm uppercase tracking-wider"
                        title="Isi Notulensi / Tindak Lanjut" @click="openNotulensiModal(surat)">
                        < NotebookPen :size="13" /> Isi Tindak Lanjut
                      </button>

                      <!-- GLOBAL ACTIONS -->
                      <div class="flex gap-1 items-center ml-2 border-l pl-3 border-gray-100">
                        <button
                          class="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors font-bold text-[10px] flex items-center gap-1.5 shadow-sm uppercase tracking-wider"
                          title="Edit Data" @click="openForm(surat)">
                          <Edit :size="13" /> Edit
                        </button>
                        <button
                          class="px-3 py-1.5 bg-rose-50 text-rose-700 rounded-lg border border-rose-200 hover:bg-rose-100 transition-colors font-bold text-[10px] flex items-center gap-1.5 shadow-sm uppercase tracking-wider"
                          title="Hapus Data" @click="handleDelete(surat.id)">
                          <Trash2 :size="13" /> Hapus
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
              <tr v-else>
                <td colspan="4" class="py-16 text-center">
                  <div class="flex flex-col items-center gap-3">
                    <Inbox :size="32" class="text-gray-300" />
                    <p class="text-gray-400 font-medium text-sm">
                      Berdasarkan pencarian, tidak ditemukan data surat yang sesuai.
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="filteredList.length > 0 && !isLoading"
          class="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50/50">
          <p class="text-xs text-gray-500 font-medium">
            Menampilkan <span class="font-bold text-gray-700">{{ (currentPage - 1) * ITEMS_PER_PAGE + 1 }}–{{
              Math.min(currentPage * ITEMS_PER_PAGE, filteredList.length) }}</span> dari <span
              class="font-bold text-gray-700">{{ filteredList.length }}</span>
          </p>
          <div class="flex gap-1">
            <button :disabled="currentPage <= 1"
              class="p-1.5 rounded-lg border bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-30"
              @click="currentPage--">
              <ChevronLeft :size="16" />
            </button>
            <button :disabled="currentPage >= totalPages"
              class="p-1.5 rounded-lg border bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-30"
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
}>()

const filterTabs = [
  { value: 'Semua', label: 'Semua Surat' },
  { value: 'Masuk', label: 'Surat Masuk' },
  { value: 'Keluar', label: 'Surat Keluar' },
  { value: 'BelumTindakLanjut', label: 'Belum Ada Hasil' },
]

const localSearchQuery = computed({ get: () => props.searchQuery, set: (val) => { emit('update:searchQuery', val); emit('update:currentPage', 1) } })
const localFilterTipe = computed({ get: () => props.filterTipe, set: (val) => { emit('update:filterTipe', val); emit('update:currentPage', 1) } })
const localCurrentPage = computed({ get: () => props.currentPage, set: (val) => emit('update:currentPage', val) })

const ITEMS_PER_PAGE = 10

const formatIndoDate = (dateStr: string): string => {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return dateStr
  }
}

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
