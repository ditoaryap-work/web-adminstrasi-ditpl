<template>
  <div class="space-y-8 pb-10">
    <!-- Top Section: Welcome & Calendar -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
      <!-- Welcome Section -->
      <div 
        v-motion
        :initial="{ opacity: 0, y: 10 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }"
        class="xl:col-span-2 relative overflow-hidden glass-card rounded-3xl p-6 sm:p-8 lg:p-10 border-gray-200 shadow-md flex flex-col justify-center"
      >
        <div class="absolute top-0 right-0 w-64 h-64 bg-kementan-green/5 blur-[40px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div class="absolute bottom-0 left-0 w-64 h-64 bg-kementan-gold/5 blur-[40px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        
        <div class="relative z-10">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-kementan-green/20 to-kementan-green/5 flex items-center justify-center text-kementan-green border border-kementan-green/20 shadow-inner">
              <TrendingUp :size="16" />
            </div>
            <span class="text-[10px] font-bold tracking-[0.3em] uppercase text-kementan-green">Sistem Aktif</span>
          </div>
          <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-800 mb-2 leading-tight">
            Selamat Datang, <br>
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-kementan-green to-emerald-600 drop-shadow-sm">{{ adminName }}</span>
          </h1>
          <p class="text-gray-500 max-w-xl text-sm leading-relaxed mb-6 font-medium">
            Pantau seluruh arus administrasi Direktorat Penyediaan Lahan dalam satu layar kendali.
          </p>
        </div>
      </div>

      <!-- Simple Calendar Widget -->
      <div 
        v-motion
        :initial="{ opacity: 0, y: 10 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 100, duration: 500 } }"
        class="glass-card rounded-3xl p-6 border-gray-200 shadow-md flex flex-col"
      >
        <div class="flex items-center gap-3 mb-4">
          <div class="p-2.5 bg-gradient-to-br from-kementan-green/20 to-kementan-green/5 text-kementan-green rounded-xl border border-kementan-green/10 shadow-sm">
            <CalendarIcon :size="20" />
          </div>
          <h2 class="text-lg font-extrabold text-gray-800">
            Kalender
          </h2>
        </div>
        <div class="flex-1 flex items-center justify-center border border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
          <div class="text-center">
            <p class="text-4xl font-black text-kementan-green opacity-80">
              {{ currentDay }}
            </p>
            <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">
              {{ currentMonthYear }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      <div 
        v-for="(stat, i) in stats" 
        :key="i"
        v-motion
        :initial="{ opacity: 0, y: 10 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 200 + (i * 50), duration: 500 } }"
        class="glass-card p-4 sm:p-6 rounded-2xl border group relative overflow-hidden"
        :class="stat.border"
      >
        <div
          class="absolute top-0 right-0 w-24 h-24 blur-[20px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"
          :class="stat.bg"
        />
        <div class="relative z-10 flex flex-col justify-between h-full">
          <div
            class="p-3 sm:p-3.5 rounded-2xl w-fit mb-5 sm:mb-7 shadow-sm border border-white/50 relative group-hover:scale-110 transition-transform duration-300"
            :class="[stat.bg, stat.color]"
          >
            <div class="absolute inset-0 bg-white/20 rounded-2xl blur-[1px]" />
            <component
              :is="stat.icon"
              :size="22"
              class="relative z-10"
            />
          </div>
          <div>
            <p class="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
              {{ stat.title }}
            </p>
            <div class="flex items-baseline gap-1.5 sm:gap-2">
              <h3 class="text-2xl sm:text-3xl font-extrabold text-gray-800 tracking-tight">
                <template v-if="isLoadingStats">
                  <div class="w-8 h-6 bg-gray-200 rounded animate-pulse" />
                </template>
                <template v-else>
                  {{ stat.val }}
                </template>
              </h3>
              <span class="text-[9px] sm:text-[10px] text-gray-400 font-bold hidden sm:inline">DOKUMEN</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Section: Quick Access -->
    <div 
      v-motion
      :initial="{ opacity: 0, y: 10 }"
      :enter="{ opacity: 1, y: 0, transition: { delay: 300, duration: 500 } }"
      class="glass-card rounded-3xl p-6 sm:p-8 border-gray-200 shadow-md"
    >
      <h2 class="text-sm font-extrabold text-gray-800 uppercase tracking-wider mb-6">
        Akses Cepat
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <router-link 
          to="/spt" 
          class="flex items-center gap-3 p-4 rounded-xl bg-emerald-50/80 border border-emerald-100 hover:bg-emerald-100 transition-all group"
        >
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-kementan-green/20 to-kementan-green/5 flex items-center justify-center text-kementan-green group-hover:bg-gradient-to-br group-hover:from-kementan-green group-hover:to-emerald-600 group-hover:text-white transition-all shadow-sm shrink-0">
            <FileText :size="18" />
          </div>
          <div>
            <p class="text-sm font-bold text-gray-800">
              Surat Tugas
            </p>
            <p class="text-[10px] text-gray-500 font-medium">
              Kelola SPT Direktorat
            </p>
          </div>
        </router-link>
        <router-link 
          to="/sptjm" 
          class="flex items-center gap-3 p-4 rounded-xl bg-blue-50/80 border border-blue-100 hover:bg-blue-100 transition-all group"
        >
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center text-blue-600 group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-blue-600 group-hover:text-white transition-all shadow-sm shrink-0">
            <FileEdit :size="18" />
          </div>
          <div>
            <p class="text-sm font-bold text-gray-800">
              SPTJM
            </p>
            <p class="text-[10px] text-gray-500 font-medium">
              Biaya Rill Perjalanan
            </p>
          </div>
        </router-link>
        <router-link 
          to="/pegawai" 
          class="flex items-center gap-3 p-4 rounded-xl bg-orange-50/80 border border-orange-100 hover:bg-orange-100 transition-all group"
        >
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-500/5 flex items-center justify-center text-orange-600 group-hover:bg-gradient-to-br group-hover:from-orange-500 group-hover:to-orange-600 group-hover:text-white transition-all shadow-sm shrink-0">
            <Users :size="18" />
          </div>
          <div>
            <p class="text-sm font-bold text-gray-800">
              Master Pegawai
            </p>
            <p class="text-[10px] text-gray-500 font-medium">
              Database Personel
            </p>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { fetchApi } from '../config/api'
import { useDataStore } from '../stores/useDataStore'
import { SptData, SptjmData, PegawaiData } from '../types/api'
import { 
  FileText, CheckCircle, TrendingUp, Users,
  Calendar as CalendarIcon, FileEdit, CheckSquare
} from 'lucide-vue-next'

const adminName = ref('Admin')
const now = ref(new Date())
const isLoadingStats = ref(true)

const sptCount = ref(0)
const sptjmCount = ref(0)
const sptWithPdf = ref(0)
const sptjmWithPdf = ref(0)

const dataStore = useDataStore()

const currentDay = computed(() => now.value.getDate())
const currentMonthYear = computed(() => {
  return now.value.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
})

onMounted(async () => {
  const adminDataString = localStorage.getItem('adminData')
  const adminData = adminDataString ? JSON.parse(adminDataString) : {}
  adminName.value = adminData.nama_admin || 'Admin'

  try {
    const role = adminData.role || 'Admin'
    const tim_poksi = role === 'Super Admin' ? 'SEMUA' : (adminData.tim_poksi || '')
    
    // Check Cache for SPT
    let dataSpt: SptData[] = []
    if (dataStore.isCacheValid('spt')) {
      dataSpt = dataStore.sptData
    } else {
      const resSpt = await fetchApi<SptData[]>("GET_SPT_LIST", { tim_poksi })
      if (resSpt.status && resSpt.data) {
        dataSpt = resSpt.data
        dataStore.setSptData(dataSpt)
      }
    }

    // Check Cache for SPTJM
    let dataSptjm: SptjmData[] = []
    if (dataStore.isCacheValid('sptjm')) {
      dataSptjm = dataStore.sptjmData
    } else {
      const resSptjm = await fetchApi<SptjmData[]>("GET_SPTJM_LIST", { tim_poksi })
      if (resSptjm.status && resSptjm.data) {
        dataSptjm = resSptjm.data
        dataStore.setSptjmData(dataSptjm)
      }
    }

    // Pre-fetch Pegawai for cache warming (used by SPT, SPTJM, SPJ, ArsipSurat)
    if (!dataStore.isCacheValid('pegawai')) {
      const resPegawai = await fetchApi<PegawaiData[]>("GET_PEGAWAI")
      if (resPegawai.status && resPegawai.data) {
        dataStore.setPegawaiData(resPegawai.data)
      }
    }
    
    sptCount.value = dataSpt.length
    sptWithPdf.value = dataSpt.filter(s => s.file_link).length
    
    sptjmCount.value = dataSptjm.length
    sptjmWithPdf.value = dataSptjm.filter(s => s.file_link || (s as SptjmData & {document_link?: string}).document_link).length
    
  } catch {
    console.error("Dashboard Stats Error")
  } finally {
    isLoadingStats.value = false
  }
})

const stats = computed(() => [
  { title: 'Total SPT', val: String(sptCount.value).padStart(2, '0'), icon: FileText, color: 'text-kementan-green', bg: 'bg-gradient-to-br from-kementan-green/20 to-kementan-green/5', border: 'border-kementan-green/20' },
  { title: 'SPT Selesai', val: String(sptWithPdf.value).padStart(2, '0'), icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-gradient-to-br from-emerald-500/20 to-emerald-500/5', border: 'border-emerald-500/20' },
  { title: 'Total SPTJM', val: String(sptjmCount.value).padStart(2, '0'), icon: FileEdit, color: 'text-blue-600', bg: 'bg-gradient-to-br from-blue-500/20 to-blue-500/5', border: 'border-blue-500/20' },
  { title: 'SPTJM Selesai', val: String(sptjmWithPdf.value).padStart(2, '0'), icon: CheckSquare, color: 'text-orange-600', bg: 'bg-gradient-to-br from-orange-500/20 to-orange-500/5', border: 'border-orange-500/20' },
])
</script>
