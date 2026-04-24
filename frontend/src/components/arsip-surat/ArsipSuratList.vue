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
                class="group hover:bg-gray-50/80 transition-colors border-b border-gray-100 last:border-0">
                <!-- COLUMN 1: IDENTITAS DOKUMEN -->
                <td class="py-5 px-6 align-top w-[220px]">
                  <div class="flex flex-col gap-2">
                    <div class="flex items-center gap-1.5">
                      <span
                        class="inline-block px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase border"
                        :class="surat.tipeSurat === 'Masuk' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-purple-50 text-purple-600 border-purple-100'">
                        {{ surat.tipeSurat }}
                      </span>
                      <div
                        class="px-2 py-0.5 rounded-md bg-gray-50 border border-gray-100 text-[8px] font-black text-gray-500 uppercase tracking-widest">
                        {{ surat.timPoksi || 'UMUM' }}
                      </div>
                    </div>
                    <div class="space-y-1.5">
                      <p class="text-[13px] font-bold text-gray-800 leading-snug line-clamp-2 break-words tracking-tight uppercase"
                        :title="surat.nomorSurat">
                        {{ surat.nomorSurat || '[BELUM ADA NOMOR]' }}
                      </p>
                      <div class="flex flex-col gap-1 mt-1">
                        <div class="flex items-center gap-1.5 text-slate-600">
                          <Calendar :size="10" class="text-kementan-green/70" />
                          <span class="text-[10px] font-bold uppercase tracking-tight">
                            {{ formatIndoDate(surat.tanggalSurat) }}
                          </span>
                        </div>
                        <div v-if="surat.createdAt" class="flex items-center gap-1.5 text-slate-400">
                          <Clock :size="10" />
                          <span class="text-[9px] font-medium italic">
                            Input: {{ formatIndoDateTime(surat.createdAt) }} WIB
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>

                <!-- COLUMN 2: KONTEN UTAMA & PERIHAL -->
                <td class="py-5 px-6 align-top min-w-[320px]">
                  <div class="space-y-3">
                    <div class="max-w-[400px]">
                      <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Asal / Tujuan</p>
                      <p class="text-xs font-bold text-gray-800 leading-tight uppercase tracking-tight line-clamp-2"
                        :title="surat.asalTujuan">
                        {{ surat.asalTujuan || '-' }}
                      </p>
                    </div>

                    <div class="max-w-[400px]">
                      <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Perihal</p>
                      <p class="text-xs text-gray-600 leading-relaxed font-medium line-clamp-2 italic">
                        "{{ surat.perihal || 'Tidak ada perihal' }}"
                      </p>
                    </div>

                    <div class="flex flex-wrap items-center gap-1.5 pt-1">
                      <span
                        class="px-2 py-0.5 rounded bg-slate-100/50 border border-slate-200 text-[8px] font-black text-slate-500 uppercase tracking-widest">
                        {{ surat.kategoriSurat }}
                      </span>
                      <span class="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border" :class="{
                        'bg-rose-50 text-rose-600 border-rose-100': surat.sifatSurat === 'Rahasia' || surat.sifatSurat === 'Penting',
                        'bg-amber-50 text-amber-600 border-amber-100': surat.sifatSurat === 'Segera',
                        'bg-emerald-50 text-emerald-600 border-emerald-100': surat.sifatSurat === 'Biasa'
                      }">
                        {{ surat.sifatSurat }}
                      </span>
                    </div>
                  </div>
                </td>

                <!-- COLUMN 3: STATUS & AKSI -->
                <td class="py-5 px-6 align-top w-[240px]">
                  <div class="flex flex-col gap-4 items-center">
                    <!-- Row 1: Status -->
                    <div
                      class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border bg-white shadow-sm"
                      :class="surat.fileNotulensi ? 'text-emerald-600 border-emerald-200' : 'text-rose-600 border-rose-200'">
                      <div class="w-1.5 h-1.5 rounded-full"
                        :class="surat.fileNotulensi ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'"></div>
                      {{ surat.fileNotulensi ? 'SELESAI' : 'MENUNGGU' }}
                    </div>

                    <!-- Row 2: File Actions (Modern Redesign) -->
                    <div class="flex items-center gap-1.5">
                      <button
                        class="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100 shadow-sm"
                        title="Detail" @click="emit('view-detail', surat)">
                        <Info :size="15" />
                      </button>

                      <div v-if="surat.fileSurat"
                        class="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
                        <button
                          class="w-8 h-8 flex items-center justify-center bg-white text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-slate-200/50"
                          title="Preview" @click="openPreview(surat.fileSurat)">
                          <Eye :size="14" />
                        </button>
                        <button
                          class="w-8 h-8 flex items-center justify-center bg-white text-slate-400 rounded-lg hover:bg-slate-800 hover:text-white transition-all shadow-sm border border-slate-200/50"
                          title="Download"
                          @click="triggerDownload(surat.fileSurat, `Surat_${surat.nomorSurat.replace(/\//g, '_')}`)">
                          <Download :size="14" />
                        </button>
                      </div>
                      <div v-else class="text-[7px] font-black text-slate-300 italic px-2">TANPA FILE</div>
                    </div>

                    <!-- Row 3: Follow-up (Shortened) -->
                    <div class="flex items-center gap-1">
                      <div v-if="surat.fileNotulensi" class="flex items-center gap-1">
                        <button
                          class="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-all font-black text-[9px] uppercase tracking-widest flex items-center gap-1.5 shadow-sm"
                          @click="openPreview(surat.fileNotulensi)">
                          <FileCheck :size="12" /> HASIL
                        </button>
                        <button
                          class="p-2 bg-white text-emerald-600 rounded-md border border-emerald-200 hover:bg-emerald-50 transition-all"
                          title="Download Hasil"
                          @click="triggerDownload(surat.fileNotulensi, `Ntl_${surat.nomorSurat.replace(/\//g, '_')}`)">
                          <Download :size="12" />
                        </button>
                      </div>
                      <button v-else
                        class="px-5 py-2 bg-white text-amber-600 rounded-lg border-2 border-dashed border-amber-300 hover:bg-amber-50 hover:border-amber-400 transition-all font-black text-[9px] flex items-center gap-2 uppercase tracking-widest shadow-sm w-fit"
                        @click="openNotulensiModal(surat)">
                        <NotebookPen :size="14" /> Tindak Lanjut
                      </button>
                    </div>

                    <!-- Row 4: System Actions -->
                    <div class="flex items-center justify-center gap-3 pt-2 border-t border-slate-100 w-full">
                      <button class="flex items-center gap-1 text-slate-400 hover:text-emerald-600 transition-colors"
                        @click="openForm(surat)">
                        <Edit :size="11" />
                        <span class="text-[9px] font-bold uppercase">Edit</span>
                      </button>
                      <button class="flex items-center gap-1 text-slate-400 hover:text-rose-600 transition-colors"
                        @click="handleDelete(surat.id)">
                        <Trash2 :size="11" />
                        <span class="text-[9px] font-bold uppercase">Hapus</span>
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
                  <div
                    class="w-16 h-16 rounded-3xl bg-gray-50 flex items-center justify-center border border-gray-100 shadow-inner">
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
          <button :disabled="localCurrentPage <= 1"
            class="p-1.5 rounded-lg border bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-all shadow-sm"
            @click="localCurrentPage--">
            <ChevronLeft :size="16" />
          </button>
          <button v-for="page in visiblePages" :key="page"
            class="w-8 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center"
            :class="page === safePage ? 'bg-kementan-green text-white shadow-sm' : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'"
            @click="localCurrentPage = page">
            {{ page }}
          </button>
          <button :disabled="localCurrentPage >= totalPages"
            class="p-1.5 rounded-lg border bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-all shadow-sm"
            @click="localCurrentPage++">
            <ChevronRight :size="16" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight, Inbox, Eye, Download, NotebookPen, CheckCircle2, AlertCircle, RefreshCw, Info, FileCheck, Calendar, Clock } from 'lucide-vue-next'
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

const visiblePages = computed(() => {
  const pages: number[] = []
  const start = Math.max(1, safePage.value - 2)
  const end = Math.min(totalPages.value, start + 4)
  const finalStart = Math.max(1, end - 4)
  for (let i = finalStart; i <= end; i++) {
    if (i >= 1) pages.push(i)
  }
  return pages
})

function triggerDownload(url: string, filename: string) { emit('download', url, filename) }
function openPreview(url: string) { emit('preview', url) }
function openForm(item?: SuratData) { item ? emit('edit', item) : emit('add') }
function handleRefresh() { emit('refresh') }
function handleDelete(id: string) { emit('delete', id) }
function openNotulensiModal(item: SuratData) { emit('openNotulensi', item) }
const filterTipe = localFilterTipe
const currentPage = localCurrentPage
</script>
