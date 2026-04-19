<template>
<div class="space-y-6">
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div v-motion :initial="{ opacity: 0, x: -20 }" :enter="{ opacity: 1, x: 0 }">
          <div class="flex items-center gap-3 mb-2 text-kementan-green">
            <FileSignature :size="20" />
            <span class="text-xs font-bold tracking-[0.3em] uppercase">Mekanisme SPPD</span>
          </div>
          <h1 class="text-3xl font-extrabold text-gray-800">
            Manajer SPTJM
          </h1>
          <p class="text-gray-500 mt-2 text-sm max-w-lg font-medium">
            Kelola data dan terbitkan dokumen Surat Pernyataan Tanggungjawab Mutlak (Biaya Rill).
          </p>
        </div>

        <button
          class="bg-kementan-green text-white px-6 py-3 rounded-xl font-bold shadow-md shadow-kementan-green/20 flex items-center gap-3 hover:bg-[#004d26] transition-all text-sm"
          @click="openForm()">
          <Plus :size="18" />
          <span>Tambah Dokumen (SPTJM)</span>
        </button>
      </div>

      <!-- Filter & Search -->
      <div v-motion :initial="{ opacity: 0, y: 10 }" :enter="{ opacity: 1, y: 0 }"
        class="glass-card p-4 rounded-2xl flex flex-col lg:flex-row gap-4">
        <div class="relative flex-1">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" :size="18" />
          <input v-model="localSearchQuery" type="text" placeholder="Cari berdasarkan nama atau tujuan perjalanan..."
            class="w-full bg-white border border-gray-300 rounded-xl py-3 pl-12 pr-4 text-gray-900 outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all shadow-sm text-sm font-medium placeholder:text-gray-600">
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
        <div v-if="isLoading && sptjmList.length === 0"
          class="flex flex-col items-center justify-center py-20 bg-white/50 h-full absolute inset-0">
          <div class="w-10 h-10 border-4 border-kementan-green/20 border-t-kementan-green rounded-full animate-spin" />
          <p class="mt-4 text-sm font-bold text-gray-500 uppercase tracking-widest animate-pulse">
            Memuat Data...
          </p>
        </div>

        <div v-else class="overflow-x-auto custom-scrollbar">
          <table class="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr
                class="bg-gray-50/80 text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] border-b border-gray-200">
                <th class="py-5 px-6 w-[35%]">
                  Informasi Pelaksana
                </th>
                <th class="py-5 px-6 w-[35%]">
                  Rincian Perjalanan
                </th>
                <th class="py-5 px-6 text-center">
                  Aksi Dokumen
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white/40">
              <template v-if="paginatedList.length > 0">
                <tr v-for="(item, idx) in paginatedList" :key="item.id" v-motion :initial="{ opacity: 0, y: 5 }"
                  :enter="{ opacity: 1, y: 0, transition: { delay: idx * 30 } }"
                  class="group hover:bg-emerald-50/10 transition-colors">
                  <!-- INFORMASI PELAKSANA -->
                  <td class="py-5 px-6 align-middle">
                    <div class="flex items-center gap-3">
                      <!-- Avatar mapping -->
                      <div
                        class="w-9 h-9 rounded-full bg-gradient-to-br from-kementan-green/10 to-emerald-100 flex items-center justify-center text-kementan-green font-bold border border-kementan-green/20 text-sm shrink-0">
                        {{ (item.namaLengkap || 'P').charAt(0) }}
                      </div>
                      <div>
                        <p class="text-sm font-bold text-gray-800 leading-tight mb-1">{{ item.namaLengkap }}</p>
                        <div class="space-y-0.5">
                          <p class="text-[11px] font-bold text-gray-600 tracking-wider truncate max-w-[200px]">{{ item.nip ||
                            '-' }}</p>
                          <p class="text-[9px] text-gray-600 font-medium italic">
                            Dibuat: {{ item.createdAt ? formatIndoDate(item.createdAt) : '-' }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </td>

                  <!-- RINCIAN PERJALANAN -->
                  <td class="py-5 px-6 align-middle">
                    <div class="space-y-2">
                      <div class="flex flex-col">
                        <span class="text-sm font-extrabold text-gray-700 truncate max-w-[250px]" :title="item.tujuan">
                          Tujuan: {{ item.tujuan }}
                        </span>
                      </div>
                      <div class="inline-flex items-center px-3 py-1 rounded bg-gray-100/80 border border-gray-200">
                        <span class="text-[10px] font-bold text-gray-500 uppercase">
                          {{ formatIndoDate(item.tanggalPerjalanan) }} s/d {{ formatIndoDate(item.tanggalKembali) }}
                        </span>
                      </div>
                      <div v-if="adminProfile?.timPoksi"
                        class="ml-2 inline-block px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-[8px] font-black text-emerald-600 uppercase tracking-widest">
                        {{ adminProfile.timPoksi }}
                      </div>
                    </div>
                  </td>

                  <!-- AKSI DOKUMEN -->
                  <td class="py-4 px-6 text-center">
                    <div class="flex items-center justify-center gap-2">
                      <!-- Document View/Download Group -->
                      <div v-if="item.fileLink"
                        class="flex items-center gap-1.5 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                        <button
                          class="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold text-[10px] flex items-center gap-1.5 shadow-sm uppercase tracking-wider"
                          title="Preview Dokumen" @click="openPreview(item.fileLink)">
                          <Eye :size="13" /> Preview
                        </button>
                        <button
                          class="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors font-bold text-[10px] flex items-center gap-1.5 shadow-sm uppercase tracking-wider"
                          title="Download File Langsung"
                          @click="triggerDownload(item.fileLink, `SPTJM_${(item.tujuan || 'dok').replace(/\s+/g, '_')}`)">
                          <Download :size="13" /> Download
                        </button>
                      </div>
                      <div v-else class="flex items-center">
                        <span
                          class="text-[10px] font-bold text-gray-600 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">Menunggu
                          Draft</span>
                      </div>

                      <!-- Edit/Delete Group -->
                      <div class="flex items-center gap-2 ml-2 pl-3 border-l border-gray-100">
                        <button
                          class="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors font-bold text-[10px] flex items-center gap-1.5 shadow-sm uppercase tracking-wider"
                          title="Edit SPTJM" @click="openForm(item)">
                          <Edit :size="13" /> Edit
                        </button>
                        <button
                          class="px-3 py-1.5 bg-rose-50 text-rose-700 rounded-lg border border-rose-200 hover:bg-rose-100 transition-colors font-bold text-[10px] flex items-center gap-1.5 shadow-sm uppercase tracking-wider"
                          title="Hapus SPTJM" @click="handleDelete(item.id)">
                          <Trash2 :size="13" /> Hapus
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
              <tr v-else>
                <td colspan="3" class="py-16 text-center">
                  <div class="flex flex-col items-center gap-3 py-12">
                    <div class="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-200 mb-2 border border-gray-100">
                      <FileSignature :size="32" />
                    </div>
                    <p class="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                      Data Tidak Ditemukan
                    </p>
                    <p class="text-gray-300 text-xs max-w-[200px] text-center leading-relaxed">
                      Belum ada data SPTJM yang sesuai dengan pencarian Anda.
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
import { Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight, FileSignature, Eye, Download, RefreshCw } from 'lucide-vue-next'

const props = defineProps<{
  sptjmList: any[]
  isLoading: boolean
  searchQuery: string
  currentPage: number
  adminProfile: any
}>()

const emit = defineEmits<{
  (e: 'update:searchQuery', value: string): void
  (e: 'update:currentPage', value: number): void
  (e: 'refresh'): void
  (e: 'add'): void
  (e: 'edit', item: any): void
  (e: 'delete', id: string): void
  (e: 'preview', url: string): void
  (e: 'download', url: string, filename: string): void
}>()

const localSearchQuery = computed({ get: () => props.searchQuery, set: (val) => { emit('update:searchQuery', val); emit('update:currentPage', 1) } })
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
  let list = props.sptjmList
  if (props.adminProfile && props.adminProfile.role !== 'Super Admin' && props.adminProfile.timPoksi) {
    list = list.filter((s: any) => s.timPoksi === props.adminProfile.timPoksi)
  }
  if (localSearchQuery.value.trim()) {
    const q = localSearchQuery.value.toLowerCase()
    list = list.filter((s: any) =>
      (s.namaLengkap ?? '').toLowerCase().includes(q) ||
      (s.tujuan ?? '').toLowerCase().includes(q)
    )
  }
  return list
})

const totalPages = computed(() => Math.ceil(filteredList.value.length / ITEMS_PER_PAGE) || 1)
const safePage = computed(() => Math.min(localCurrentPage.value, totalPages.value))
const paginatedList = computed(() => filteredList.value.slice((safePage.value - 1) * ITEMS_PER_PAGE, safePage.value * ITEMS_PER_PAGE))

function triggerDownload(url: string, filename: string) { emit('download', url, filename) }
function openPreview(url: string) { emit('preview', url) }
function openForm(item: any = null) { if(item) emit('edit', item); else emit('add'); }
function handleDelete(id: string) { emit('delete', id) }
function handleRefresh() { emit('refresh') }
</script>\n