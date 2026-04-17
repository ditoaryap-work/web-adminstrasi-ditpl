<template>
  <div class="space-y-8 pb-20">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Pengaturan Sistem</h1>
        <p class="text-gray-500 mt-1 font-medium">Kelola integrasi Google Sheets dan konfigurasi sistem di satu tempat.</p>
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
      <!-- SINKRONISASI CARD -->
      <div class="xl:col-span-2 space-y-8">
        <section class="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden group">
          <div class="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <RefreshCw :size="120" />
          </div>
          
          <div class="relative z-10">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                <RefreshCw :size="24" />
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-800">Sinkronisasi Google Sheets</h3>
                <p class="text-sm text-gray-500">Ekspor seluruh data dari Database ke Spreadsheet.</p>
              </div>
            </div>

            <div class="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 mb-8">
              <ul class="space-y-3">
                <li class="flex items-start gap-3 text-sm text-blue-800">
                  <div class="mt-1 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                  <span>Proses ini akan memperbarui data <strong>Pegawai, SPJ, SBM, dan Admin</strong> secara massal.</span>
                </li>
                <li class="flex items-start gap-3 text-sm text-blue-800">
                  <div class="mt-1 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                  <span>Aman dari <i>Rate Limit</i> Google karena menggunakan metode Batch Overwrite.</span>
                </li>
              </ul>
            </div>

            <div class="flex items-center gap-4">
              <button 
                @click="triggerSync"
                :disabled="isSyncing || syncCooldown > 0"
                class="flex items-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                :class="[
                  syncStatus === 'Berhasil!' ? 'bg-emerald-500 text-white shadow-emerald-200' :
                  syncStatus === 'Gagal' ? 'bg-red-500 text-white shadow-red-200' :
                  'bg-kementan-green text-white shadow-kementan-green/30 hover:shadow-xl hover:-translate-y-0.5'
                ]"
              >
                <RefreshCw :class="{ 'animate-spin': isSyncing }" :size="20" />
                <span v-if="isSyncing">Sedang Menyinkronkan...</span>
                <span v-else-if="syncStatus">{{ syncStatus }}</span>
                <span v-else-if="syncCooldown > 0">Tunggu {{ syncCooldown }} Detik</span>
                <span v-else>🔄 Jalankan Sinkronisasi Sekarang</span>
              </button>
              
              <p v-if="syncCooldown > 0" class="text-xs text-gray-400 font-medium">
                Anti-spam aktif. Mohon tunggu sejenak.
              </p>
            </div>
          </div>
        </section>

        <!-- KONFIGURASI TIM SECTION -->
        <section class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
                <FolderTree :size="20" />
              </div>
              <h3 class="text-lg font-bold text-gray-800">Konfigurasi Folder & Template</h3>
            </div>
            
            <button 
              @click="fetchConfigs"
              class="p-2 hover:bg-white rounded-lg transition-colors text-gray-400 hover:text-gray-600"
              title="Refresh Data"
            >
              <RotateCcw :size="18" />
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-widest px-8">
                  <th class="py-4 pl-8">Tim / Poksi</th>
                  <th class="py-4">Folder SPT</th>
                  <th class="py-4">Template SPT</th>
                  <th class="py-4">Folder SPJ</th>
                  <th class="py-4 pr-8 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50 uppercase text-[11px] font-bold">
                <tr v-for="item in configs" :key="item.timPoksi" class="hover:bg-gray-50/30 transition-colors">
                  <td class="py-5 pl-8 text-gray-900">{{ item.timPoksi }}</td>
                  <td class="py-5 text-gray-500 font-mono truncate max-w-[150px]">{{ item.folderIdSpt || '-' }}</td>
                  <td class="py-5 text-gray-500 font-mono truncate max-w-[150px]">{{ item.templateIdSptV2 || '-' }}</td>
                  <td class="py-5 text-gray-500 font-mono truncate max-w-[150px]">{{ item.folderIdSpj || '-' }}</td>
                  <td class="py-5 pr-8 text-right">
                    <button 
                      @click="editConfig(item)"
                      class="px-3 py-1.5 rounded-lg border border-gray-200 hover:border-kementan-green hover:text-kementan-green transition-all"
                    >
                      Detail/Edit
                    </button>
                  </td>
                </tr>
                <tr v-if="loadingConfigs">
                  <td colspan="5" class="py-20 text-center">
                    <div class="flex flex-col items-center gap-3">
                      <RefreshCw class="animate-spin text-gray-300" :size="32" />
                      <span class="text-gray-400 text-xs tracking-widest uppercase">Memuat Data Konfigurasi...</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <!-- SIDE INFO -->
      <div class="space-y-6">
        <div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 text-white shadow-xl">
          <h4 class="text-lg font-bold mb-4 flex items-center gap-2">
            <ShieldCheck class="text-emerald-400" :size="20" />
            Keamanan Sistem
          </h4>
          <p class="text-sm text-gray-300 leading-relaxed mb-6">
            Hanya <strong>Super Admin</strong> yang memiliki akses penuh untuk mengubah Folder ID dan Template ID sistem. 
            Admin biasa hanya dapat melihat konfigurasi ini.
          </p>
          <div class="space-y-4">
            <div class="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
              <div class="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Lock :size="14" />
              </div>
              <div class="text-xs">
                <p class="font-bold">Role Anda:</p>
                <p class="text-emerald-400">{{ userRole }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <h4 class="text-sm font-bold text-gray-800 mb-4 tracking-tight uppercase">Bantuan</h4>
          <div class="space-y-4">
            <div v-for="(tip, i) in tips" :key="i" class="flex gap-3">
              <span class="text-kementan-green font-bold text-xs">{{ i+1 }}.</span>
              <p class="text-[11px] text-gray-500 leading-relaxed">{{ tip }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL EDIT CONFIG (Simple Version) -->
    <transition name="fade">
      <div v-if="isModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="isModalOpen = false" />
        <div class="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-8 overflow-y-auto max-h-[90vh]">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-2xl font-bold text-gray-800">Edit Konfigurasi: {{ selectedConfig?.timPoksi }}</h3>
            <button @click="isModalOpen = false" class="text-gray-400 hover:text-gray-600">
              <X :size="24" />
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div v-for="(val, key) in fieldLabels" :key="key" class="space-y-1.5">
              <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                {{ val }}
              </label>
              <input 
                v-model="editForm[key]"
                type="text"
                class="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-kementan-green/20 focus:border-kementan-green outline-none transition-all font-mono text-xs"
                placeholder="ID Folder/Template..."
                :disabled="userRole !== 'Super Admin'"
              />
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-6 border-t border-gray-50">
            <button 
              @click="isModalOpen = false"
              class="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
            >
              Batal
            </button>
            <button 
              v-if="userRole === 'Super Admin'"
              @click="saveConfig"
              :disabled="saving"
              class="px-8 py-3 bg-kementan-green text-white rounded-xl font-bold shadow-lg shadow-kementan-green/20 hover:shadow-xl active:scale-95 transition-all flex items-center gap-2"
            >
              <Save v-if="!saving" :size="18" />
              <RefreshCw v-else class="animate-spin" :size="18" />
              {{ saving ? 'Menyimpan...' : 'Simpan Perubahan' }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { 
  RefreshCw, FolderTree, RotateCcw, ShieldCheck, 
  Lock, X, Save 
} from 'lucide-vue-next'
import api from '../config/api'

// --- Sync State ---
const isSyncing = ref(false)
const syncCooldown = ref(0)
const syncStatus = ref('')

// --- Config State ---
const configs = ref<any[]>([])
const loadingConfigs = ref(false)
const userRole = ref('')
const isModalOpen = ref(false)
const selectedConfig = ref<any>(null)
const saving = ref(false)

const editForm = reactive<any>({
  folderIdSpt: '',
  folderIdSptjm: '',
  templateIdSptV1: '',
  templateIdSptV2: '',
  templateIdSptjm: '',
  folderIdSuratMasuk: '',
  folderIdSuratKeluar: '',
  folderIdNotulensi: '',
  folderIdSpj: '',
  templateIdSpj: ''
})

const fieldLabels = {
  folderIdSpt: 'Folder Google Drive (SPT)',
  templateIdSptV2: 'Template Google Doc (SPT)',
  folderIdSpj: 'Folder Google Drive (Kwitansi SPJ)',
  templateIdSpj: 'Template Google Doc (Kwitansi SPJ)',
  folderIdSptjm: 'Folder Drive (SPTJM)',
  templateIdSptjm: 'Template Doc (SPTJM)',
  folderIdSuratMasuk: 'Folder Surat Masuk',
  folderIdSuratKeluar: 'Folder Surat Keluar'
}

const tips = [
  'Sinkronisasi manual sebaiknya dilakukan setelah Anda selesai melakukan banyak perubahan data.',
  'ID Folder dapat ditemukan di URL folder Google Drive setelah tab "/folders/".',
  'Jangan mengubah konfigurasi ini sembarangan karena akan memutus integrasi dokumen otomatis.'
]

onMounted(async () => {
  const adminData = JSON.parse(localStorage.getItem('adminData') || '{}')
  userRole.value = adminData.role || 'Admin'
  await fetchConfigs()
})

const fetchConfigs = async () => {
  loadingConfigs.value = true
  try {
    const res = await api.get('/api/config')
    if (res.data.status) {
      configs.value = res.data.data
    }
  } catch (error) {
    console.error('Failed to fetch configs:', error)
  } finally {
    loadingConfigs.value = false
  }
}

const triggerSync = async () => {
  if (isSyncing.value || syncCooldown.value > 0) return
  
  isSyncing.value = true
  syncStatus.value = ''
  
  try {
    const response = await api.post('/api/sync')
    if (response.data.status) {
      syncStatus.value = 'Berhasil!'
      setTimeout(() => { if (syncStatus.value === 'Berhasil!') syncStatus.value = '' }, 3000)
    } else {
      syncStatus.value = 'Gagal'
      setTimeout(() => { if (syncStatus.value === 'Gagal') syncStatus.value = '' }, 3000)
    }
  } catch (error) {
    console.error('Trigger sync error:', error)
    syncStatus.value = 'Error :('
    setTimeout(() => { if (syncStatus.value === 'Error :(') syncStatus.value = '' }, 3000)
  } finally {
    isSyncing.value = false
    syncCooldown.value = 15
    
    const interval = setInterval(() => {
      syncCooldown.value--
      if (syncCooldown.value <= 0) {
        clearInterval(interval)
      }
    }, 1000)
  }
}

const editConfig = (item: any) => {
  selectedConfig.value = item
  // Map values to form
  Object.keys(editForm).forEach(key => {
    editForm[key] = item[key] || ''
  })
  isModalOpen.value = true
}

const saveConfig = async () => {
  if (userRole.value !== 'Super Admin') return
  
  saving.value = true
  try {
    const payload = {
      timPoksi: selectedConfig.value.timPoksi,
      ...editForm
    }
    const res = await api.put(`/api/config/${selectedConfig.value.timPoksi}`, payload)
    if (res.data.status) {
      await fetchConfigs()
      isModalOpen.value = false
    }
  } catch (error) {
    console.error('Save config error:', error)
    alert('Gagal menyimpan konfigurasi.')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

font-mono {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
}
</style>
