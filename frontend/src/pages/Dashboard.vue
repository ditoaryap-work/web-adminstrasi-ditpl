<template>
  <div class="space-y-8 pb-10">
    <!-- Top Section: Welcome & Calendar -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
      
      <!-- Welcome Section -->
      <div 
        v-motion
        :initial="{ opacity: 0, y: 10 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }"
        class="xl:col-span-2 relative overflow-hidden glass-card rounded-3xl p-8 lg:p-10 border-gray-200 shadow-md flex flex-col justify-center"
      >
        <div class="absolute top-0 right-0 w-64 h-64 bg-kementan-green/5 blur-[40px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div class="absolute bottom-0 left-0 w-64 h-64 bg-kementan-gold/5 blur-[40px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
        
        <div class="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <div class="flex items-center gap-3 mb-4">
              <div class="w-8 h-8 rounded-lg bg-kementan-green/10 flex items-center justify-center text-kementan-green border border-kementan-green/20">
                <TrendingUp :size="16" />
              </div>
              <span class="text-[10px] font-bold tracking-[0.3em] uppercase text-kementan-green">Sistem Aktif</span>
            </div>
            <h1 class="text-3xl lg:text-4xl font-extrabold text-gray-800 mb-2 leading-tight">
              Selamat Datang, <br />
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-kementan-green to-emerald-600 drop-shadow-sm">{{ adminName }}</span>
            </h1>
            <p class="text-gray-500 max-w-xl text-sm leading-relaxed mb-8 font-medium">
              Pantau seluruh arus administrasi Direktorat Penyediaan Lahan dalam satu layar kendali. Seluruh data tersinkronisasi otomatis dengan Google Sheets.
            </p>
            <div class="flex gap-4">
              <router-link to="/sptjm" class="bg-kementan-green text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#004d26] transition-all shadow-md shadow-kementan-green/20 text-sm">
                Mulai Buat SPT <ArrowRight :size="18" />
              </router-link>
            </div>
          </div>

          <div class="hidden md:block w-32 h-32 opacity-[0.03] pointer-events-none" style="background-image: url('https://www.transparenttextures.com/patterns/connected.png')"></div>
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
           <div class="p-2 bg-kementan-green/10 text-kementan-green rounded-lg">
              <CalendarIcon :size="20" />
           </div>
           <h2 class="text-lg font-extrabold text-gray-800">Kalender</h2>
        </div>
        <div class="flex-1 flex items-center justify-center border border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
           <!-- Placeholder for Calendar logic or simple date -->
           <div class="text-center">
             <p class="text-4xl font-black text-kementan-green opacity-80">{{ currentDay }}</p>
             <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">{{ currentMonthYear }}</p>
           </div>
        </div>
      </div>

    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div 
        v-for="(stat, i) in stats" 
        :key="i"
        v-motion
        :initial="{ opacity: 0, y: 10 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 200 + (i * 50), duration: 500 } }"
        class="glass-card p-6 rounded-2xl border group relative overflow-hidden"
        :class="stat.border"
      >
        <div class="absolute top-0 right-0 w-24 h-24 blur-[20px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" :class="stat.bg"></div>
        <div class="relative z-10 flex flex-col justify-between h-full">
          <div class="p-3 rounded-xl w-fit mb-6 shadow-sm" :class="[stat.bg, stat.color]">
            <component :is="stat.icon" :size="24" />
          </div>
          <div>
            <p class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{{ stat.title }}</p>
            <div class="flex items-baseline gap-2">
              <h3 class="text-3xl font-extrabold text-gray-800 tracking-tight">{{ stat.val }}</h3>
              <span class="text-[10px] text-gray-400 font-bold">DOKUMEN</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Section: Recent Activity -->
    <div 
      v-motion
      :initial="{ opacity: 0, y: 10 }"
      :enter="{ opacity: 1, y: 0, transition: { delay: 300, duration: 500 } }"
      class="glass-card rounded-3xl p-8 border-gray-200 shadow-md flex flex-col"
    >
      <div class="flex justify-between items-center mb-8">
        <h2 class="text-lg font-extrabold text-gray-800 uppercase tracking-wider">Aktivitas Terakhir</h2>
        <button class="text-[10px] font-bold text-kementan-green hover:text-[#004d26] transition-colors uppercase tracking-widest underline underline-offset-4">Lihat Semua</button>
      </div>
      <div class="flex flex-col items-center justify-center py-10 text-gray-500 italic gap-4 flex-1">
         <div class="w-12 h-12 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center shadow-sm">
            <Clock :size="20" class="text-gray-400" />
         </div>
         <p class="text-sm font-medium tracking-wide">Belum ada riwayat tercatat di database.</p>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { 
  FileText, CheckCircle, Clock, TrendingUp, 
  ArrowRight, Calendar as CalendarIcon, FileEdit 
} from 'lucide-vue-next'

const adminName = ref('Admin')
const now = ref(new Date())

const currentDay = computed(() => now.value.getDate())
const currentMonthYear = computed(() => {
  return now.value.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
})

onMounted(() => {
  const adminData = JSON.parse(localStorage.getItem('adminData') || '{}')
  adminName.value = adminData.nama_admin || 'Admin'
})

const stats = [
  { title: 'SPT Aktif', val: '12', icon: FileText, color: 'text-kementan-green', bg: 'bg-kementan-green/10', border: 'border-kementan-green/20' },
  { title: 'Draft Tersimpan', val: '04', icon: FileEdit, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { title: 'SPJ Selesai', val: '08', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { title: 'Menunggu Antrean', val: '02', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' }
]
</script>
