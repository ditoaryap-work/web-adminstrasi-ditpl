<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div v-motion :initial="{ opacity: 0, x: -20 }" :enter="{ opacity: 1, x: 0 }">
        <div class="flex items-center gap-3 mb-2 text-kementan-green">
          <FileText :size="20" />
          <span class="text-xs font-bold tracking-[0.3em] uppercase">Mekanisme SPPD</span>
        </div>
        <h1 class="text-3xl font-extrabold text-gray-800">Manajer SPJ & SPD</h1>
        <p class="text-gray-500 mt-2 text-sm max-w-lg font-medium">
          Kelola data dan terbitkan Kwitansi perjalanan dinas Standar Audit BPK.
        </p>
      </div>

      <button
        class="bg-kementan-green text-white px-6 py-3 rounded-xl font-bold shadow-md shadow-kementan-green/20 flex items-center gap-3 hover:bg-[#004d26] transition-all text-sm"
        @click="$emit('add')">
        <Plus :size="18" />
        <span>Tambah Kwitansi (SPJ)</span>
      </button>
    </div>

    <!-- Filter & Search -->
    <div v-motion :initial="{ opacity: 0, y: 10 }" :enter="{ opacity: 1, y: 0 }"
      class="glass-card p-4 rounded-2xl flex flex-col lg:flex-row gap-4">
      <div class="relative flex-1">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" :size="18" />
        <input v-model="localSearchQuery" type="text" placeholder="Cari berdasarkan nama, tujuan, atau NIP..."
          class="w-full bg-white border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-gray-800 outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all shadow-sm text-sm font-medium placeholder:text-gray-400">
      </div>
      <button
        class="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-600 hover:text-kementan-green hover:border-kementan-green hover:bg-emerald-50 transition-all shadow-sm text-sm font-bold group"
        :disabled="isLoading" title="Refresh Data dari Server" @click="$emit('refresh')">
        <RefreshCw :size="18" :class="{ 'animate-spin': isLoading }" />
        <span class="hidden sm:inline">Refresh Data</span>
      </button>
    </div>

    <!-- Table Section -->
    <div class="glass-card rounded-3xl overflow-hidden shadow-md border-gray-200 min-h-[400px] relative">
      <div v-if="isLoading && sptjmList.length === 0"
        class="flex flex-col items-center justify-center py-20 bg-white/50 h-full absolute inset-0">
        <div class="w-10 h-10 border-4 border-kementan-green/20 border-t-kementan-green rounded-full animate-spin" />
        <p class="mt-4 text-sm font-bold text-gray-500 uppercase tracking-widest animate-pulse">Memuat Data...</p>
      </div>

      <div v-else class="overflow-x-auto custom-scrollbar">
        <table class="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr
              class="bg-gray-50/80 text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] border-b border-gray-200">
              <th class="py-5 px-6 w-[40%]">Informasi Pelaksana</th>
              <th class="py-5 px-6">Rincian Perjalanan</th>
              <th class="py-5 px-6 text-center">Aksi Dokumen</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 bg-white/40">
            <template v-if="paginatedList.length > 0">
              <tr v-for="(item, idx) in paginatedList" :key="item.id" v-motion :initial="{ opacity: 0, y: 5 }"
                :enter="{ opacity: 1, y: 0, transition: { delay: idx * 30 } }"
                class="group hover:bg-emerald-50/30 transition-colors">
                <td class="py-4 px-6">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200 text-sm shrink-0">
                      {{ String(item.nama || '?').charAt(0) }}
                    </div>
                    <div>
                      <p class="text-sm font-bold text-gray-800">{{ item.nama }} <span
                          class="bg-blue-100 text-blue-700 text-[9px] px-1.5 py-0.5 rounded">{{ item.gol }}</span></p>
                      <p class="text-[11px] text-gray-400 font-medium tracking-wider">
                        NIP: {{ item.nip || 'Tak Ada NIP' }}
                        <span v-if="item.nomorSt" class="mx-1 lowercase text-gray-300 font-normal">|</span>
                        <span v-if="item.nomorSt" class="text-[10px] font-normal opacity-75">ST: {{ item.nomorSt
                          }}</span>
                      </p>
                    </div>
                  </div>
                </td>
                <td class="py-4 px-6">
                  <div>
                    <p class="text-xs font-bold text-gray-700 mb-1">Tujuan: {{ item.tujuan1 }}</p>
                    <div class="flex flex-col gap-1">
                      <div
                        class="flex items-center gap-1.5 text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded w-max">
                        <span>{{ item.tglBerangkat }} → {{ item.tglKembali }} ({{ item.lamaTugas }} hari)</span>
                      </div>
                      <p class="text-xs font-bold text-emerald-600">Rp {{ formatNumber(item.jumlahDibayar) }}</p>
                    </div>
                  </div>
                </td>
                <td class="py-4 px-6 text-center">
                  <div class="flex items-center justify-center gap-2">
                    <!-- Primary Actions Group -->
                    <div v-if="item.fileLink"
                      class="flex items-center gap-1.5 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                      <button
                        class="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold text-[10px] flex items-center gap-1.5 shadow-sm uppercase tracking-wider"
                        title="Preview Dokumen" @click="$emit('preview', item.fileLink)">
                        <Eye :size="13" /> Preview
                      </button>
                      <button
                        class="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors font-bold text-[10px] flex items-center gap-1.5 shadow-sm uppercase tracking-wider"
                        title="Download File Langsung"
                        @click="handleDownload(item.fileLink, `SPJ_${item.nama}_${item.id}`)">
                        <Download :size="13" /> Download
                      </button>
                    </div>

                    <span v-if="!item.fileLink"
                      class="px-3 py-1.5 bg-gray-50 text-gray-400 rounded-lg border border-gray-100 text-[10px] font-bold uppercase tracking-wider">Belum
                      Ada</span>

                    <!-- Admin Actions Group -->
                    <div class="flex items-center gap-2 ml-2 pl-3 border-l border-gray-100">
                      <button
                        class="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors font-bold text-[10px] flex items-center gap-1.5 shadow-sm uppercase tracking-wider"
                        title="Edit SPJ" @click="$emit('edit', item)">
                        <Edit :size="13" /> Edit
                      </button>
                      <button
                        class="px-3 py-1.5 bg-rose-50 text-rose-700 rounded-lg border border-rose-200 hover:bg-rose-100 transition-colors font-bold text-[10px] flex items-center gap-1.5 shadow-sm uppercase tracking-wider"
                        title="Hapus SPJ" @click="$emit('delete', item.id)">
                        <Trash2 :size="13" /> Hapus
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
            <tr v-else>
              <td colspan="3" class="py-16 text-center">
                <div class="flex flex-col items-center gap-3">
                  <FileText :size="32" class="text-gray-300" />
                  <p class="text-gray-400 font-medium text-sm">Berdasarkan pencarian, tidak ditemukan data SPJ yang
                    sesuai.</p>
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
          Menampilkan <span class="font-bold text-gray-700">{{ (safePage - 1) * ITEMS_PER_PAGE + 1 }}–{{
            Math.min(safePage *
              ITEMS_PER_PAGE, filteredList.length) }}</span> dari <span class="font-bold text-gray-700">{{
              filteredList.length
            }}</span>
        </p>
        <div class="flex gap-1">
          <button :disabled="safePage <= 1"
            class="p-1.5 rounded-lg border bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-30"
            @click="localCurrentPage--">
            <ChevronLeft :size="16" />
          </button>
          <button :disabled="safePage >= totalPages"
            class="p-1.5 rounded-lg border bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-30"
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
import { FileText, Plus, Search, Download, Edit, Trash2, ChevronLeft, ChevronRight, Eye, RefreshCw } from 'lucide-vue-next'
import type { SpjData } from '../../types/api'
import { triggerDownload } from '../../utils/drive'

const props = defineProps<{
  sptjmList: SpjData[]
  isLoading: boolean
  searchQuery: string
  currentPage: number
}>()

const emit = defineEmits<{
  (e: 'update:searchQuery', value: string): void
  (e: 'update:currentPage', value: number): void
  (e: 'refresh'): void
  (e: 'add'): void
  (e: 'edit', item: SpjData): void
  (e: 'delete', id: string): void
  (e: 'preview', url: string): void
}>()

const ITEMS_PER_PAGE = 10

const localSearchQuery = computed({
  get: () => props.searchQuery,
  set: (val) => {
    emit('update:searchQuery', val)
    emit('update:currentPage', 1) 
  }
})

const localCurrentPage = computed({
  get: () => props.currentPage,
  set: (val) => emit('update:currentPage', val)
})

const filteredList = computed(() => {
  const q = localSearchQuery.value.toLowerCase()
  if (!q) return props.sptjmList
  return props.sptjmList.filter(s => (s.nama || '').toLowerCase().includes(q) || (s.tujuan1 || '').toLowerCase().includes(q) || (s.nip || '').includes(q))
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredList.value.length / ITEMS_PER_PAGE)))
const safePage = computed(() => Math.min(localCurrentPage.value, Math.max(1, totalPages.value)))
const paginatedList = computed(() => filteredList.value.slice((safePage.value - 1) * ITEMS_PER_PAGE, safePage.value * ITEMS_PER_PAGE))

function formatNumber(v: any) { return (Number(v) || 0).toLocaleString('id-ID') }

function handleDownload(url: string, filename: string) {
  triggerDownload(url, filename)
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
