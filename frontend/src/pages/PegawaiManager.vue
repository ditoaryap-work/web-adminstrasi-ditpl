<template>
  <div class="space-y-6 pb-12">
    <!-- View Mode: LIST -->
    <div v-if="viewMode === 'list'" class="space-y-6">
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div 
          v-motion
          :initial="{ opacity: 0, x: -20 }"
          :enter="{ opacity: 1, x: 0, transition: { duration: 500 } }"
        >
          <div class="flex items-center gap-3 mb-2 text-kementan-green">
            <Users :size="20" />
            <span class="text-xs font-bold tracking-[0.3em] uppercase">Database Personel</span>
          </div>
          <h1 class="text-3xl font-extrabold text-gray-800">Manajemen Pegawai</h1>
          <p class="text-gray-500 mt-2 text-sm max-w-lg font-medium">
            Kelola data induk pegawai, pangkat, dan jabatan untuk otomasi penugasan.
          </p>
        </div>

        <button 
          v-motion
          :initial="{ scale: 1 }"
          :hovered="{ scale: 1.02 }"
          :tapped="{ scale: 0.98 }"
          @click="openForm()"
          class="bg-kementan-green text-white px-5 py-3 rounded-xl font-bold shadow-md shadow-kementan-green/20 flex items-center gap-2 hover:bg-[#004d26] transition-all text-sm"
        >
          <Plus :size="18" />
          <span>Tambah Pegawai</span>
        </button>
      </div>

      <!-- Filter & Search Bar -->
      <div 
        v-motion
        :initial="{ opacity: 0, y: 10 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 100, duration: 500 } }"
        class="glass-card p-4 rounded-2xl flex flex-col lg:flex-row gap-4"
      >
        <div class="relative flex-1">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" :size="18" />
          <input 
            type="text" 
            placeholder="Cari berdasarkan Nama atau NIP..." 
            v-model="searchQuery"
            class="w-full bg-white border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-gray-800 outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all shadow-sm text-sm font-medium placeholder:text-gray-400"
          />
        </div>
      </div>

      <!-- Table Section -->
      <div class="glass-card rounded-3xl overflow-hidden relative shadow-md border-gray-200 min-h-[400px]">
        <div v-if="isLoading && pegawaiList.length === 0" class="flex flex-col items-center justify-center py-20 bg-white/50 h-full absolute inset-0">
          <div class="w-10 h-10 border-4 border-kementan-green/20 border-t-kementan-green rounded-full animate-spin"></div>
          <p class="mt-4 text-sm font-bold text-gray-500 uppercase tracking-widest animate-pulse">Memuat Data...</p>
        </div>
        
        <div v-else class="overflow-x-auto custom-scrollbar">
          <table class="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr class="bg-gray-50/80 text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] border-b border-gray-200">
                <th class="py-5 px-6">Identitas Pegawai</th>
                <th class="py-5 px-6 min-w-[200px]">Pangkat / Gol</th>
                <th class="py-5 px-6">Jabatan & Unit</th>
                <th class="py-5 px-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white/40">
              <template v-if="paginatedPegawai.length > 0">
                <tr 
                  v-for="(p, idx) in paginatedPegawai" 
                  :key="p.nip"
                  v-motion
                  :initial="{ opacity: 0, y: 5 }"
                  :enter="{ opacity: 1, y: 0, transition: { delay: 200 + (idx * 20), duration: 400 } }"
                  class="group hover:bg-emerald-50/30 transition-colors"
                >
                  <td class="py-4 px-6">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-full bg-gradient-to-br from-kementan-green/10 to-emerald-100 flex items-center justify-center text-kementan-green font-bold border border-kementan-green/20 text-sm shrink-0">
                        {{ p.nama_lengkap.charAt(0) }}
                      </div>
                      <div class="min-w-0">
                        <p class="text-sm font-bold text-gray-800 truncate">{{ p.nama_lengkap }}</p>
                        <p class="text-[11px] text-gray-400 font-medium tracking-wider">{{ p.nip }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="py-4 px-6">
                    <div>
                      <p class="text-xs font-bold text-gray-600">{{ p.pangkat_gol_ruang || '-' }}</p>
                      <div class="inline-block px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-[9px] font-bold text-emerald-700 mt-1 uppercase tracking-wider">
                        Gol {{ p.golongan }}
                      </div>
                    </div>
                  </td>
                  <td class="py-4 px-6">
                    <div class="max-w-xs">
                      <p class="text-xs text-gray-600 leading-relaxed truncate font-medium">{{ p.jabatan }}</p>
                      <p class="text-[10px] text-kementan-green font-bold mt-1 uppercase tracking-widest">{{ p.poksi }}</p>
                    </div>
                  </td>
                  <td class="py-4 px-6">
                    <div class="flex items-center justify-center gap-2">
                      <button @click="openForm(p)" class="p-2 bg-white rounded-lg text-gray-400 border border-gray-200 hover:text-kementan-green hover:border-kementan-green hover:bg-emerald-50 shadow-sm transition-all">
                        <Edit :size="15" />
                      </button>
                      <button @click="confirmDelete(p)" class="p-2 bg-white rounded-lg text-gray-400 border border-gray-200 hover:text-red-500 hover:border-red-200 hover:bg-red-50 shadow-sm transition-all">
                        <Trash2 :size="15" />
                      </button>
                    </div>
                  </td>
                </tr>
              </template>
              <tr v-else>
                <td colspan="4" class="py-16 text-center text-gray-400 font-medium">
                  Tidak ditemukan data pegawai yang cocok.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="filteredPegawai.length > 0 && !isLoading" class="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50/50">
          <p class="text-xs text-gray-500 font-medium">
            Menampilkan <span class="font-bold text-gray-700">{{ (safePage - 1) * ITEMS_PER_PAGE + 1 }}–{{ Math.min(safePage * ITEMS_PER_PAGE, filteredPegawai.length) }}</span> dari <span class="font-bold text-gray-700">{{ filteredPegawai.length }}</span> pegawai
          </p>
          <div class="flex items-center gap-1">
            <button :disabled="safePage <= 1" @click="handlePageChange(safePage - 1)" class="p-1.5 rounded-lg border bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-30"><ChevronLeft :size="16" /></button>
            <button v-for="page in visiblePages" :key="page" @click="handlePageChange(page)" class="w-8 h-8 rounded-lg text-xs font-bold transition-all" :class="page === safePage ? 'bg-kementan-green text-white shadow-sm' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'">{{ page }}</button>
            <button :disabled="safePage >= totalPages" @click="handlePageChange(safePage + 1)" class="p-1.5 rounded-lg border bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-30"><ChevronRight :size="16" /></button>
          </div>
        </div>
      </div>
    </div>

    <!-- View Mode: FORM -->
    <div v-else v-motion :initial="{ opacity: 0, y: 10 }" :enter="{ opacity: 1, y: 0 }" class="max-w-4xl mx-auto space-y-6 pb-12">
      <button @click="closeForm" class="flex items-center gap-2 text-gray-500 hover:text-kementan-green transition-colors font-semibold text-sm bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 w-max">
        <ChevronLeft :size="18" /> Kembali ke Daftar
      </button>

      <div class="glass-card rounded-3xl overflow-hidden shadow-lg border border-gray-200">
        <div class="bg-gradient-to-r from-kementan-green to-emerald-700 px-8 py-6 text-white">
          <h2 class="text-2xl font-extrabold">{{ isEditMode ? 'Edit Data Pegawai' : 'Tambah Pegawai Baru' }}</h2>
          <p class="text-emerald-100 font-medium text-sm mt-1">Lengkapi informasi biodata dan kepangkatan pegawai.</p>
        </div>

        <div class="p-8 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2 px-1">Nama Lengkap <span class="text-red-400">*</span></label>
              <input type="text" v-model="formData.nama_lengkap" class="w-full border border-gray-300 rounded-xl py-3 px-4 text-sm font-medium outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all shadow-sm" placeholder="Contoh: Agus Setiawan, SE." />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2 px-1">NIP</label>
              <input type="text" v-model="formData.nip" :readonly="isEditMode" class="w-full border border-gray-300 rounded-xl py-3 px-4 text-sm font-medium outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all shadow-sm" :class="isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''" placeholder="Kosongkan jika honorer" />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2 px-1">Pangkat/Gol Ruang</label>
              <input type="text" v-model="formData.pangkat_gol_ruang" class="w-full border border-gray-300 rounded-xl py-3 px-4 text-sm font-medium outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all shadow-sm" placeholder="Contoh: Penata / IIIc" />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2 px-1">Golongan</label>
              <input type="text" v-model="formData.golongan" class="w-full border border-gray-300 rounded-xl py-3 px-4 text-sm font-medium outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all shadow-sm" placeholder="Contoh: III/c" />
            </div>
            <div class="md:col-span-2">
              <label class="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2 px-1">Jabatan</label>
              <input type="text" v-model="formData.jabatan" class="w-full border border-gray-300 rounded-xl py-3 px-4 text-sm font-medium outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all shadow-sm" placeholder="Contoh: Analis Kebijakan Ahli Muda" />
            </div>
            <div class="md:col-span-2">
              <label class="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2 px-1">Unit Kerja / Poksi</label>
              <input type="text" v-model="formData.poksi" class="w-full border border-gray-300 rounded-xl py-3 px-4 text-sm font-medium outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all shadow-sm" placeholder="Contoh: Poksi Perluasan Lahan" />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2 px-1">Direktorat</label>
              <input type="text" v-model="formData.direktorat" class="w-full border border-gray-300 rounded-xl py-3 px-4 text-sm font-medium outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all shadow-sm" placeholder="Contoh: Direktorat Penyediaan Lahan" />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2 px-1">Tingkat Biaya</label>
              <input type="text" v-model="formData.tingkat_biaya" class="w-full border border-gray-300 rounded-xl py-3 px-4 text-sm font-medium outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all shadow-sm" placeholder="Contoh: A / B / C" />
            </div>
          </div>

          <div class="pt-6 border-t border-gray-100 flex gap-4">
            <button @click="closeForm" class="px-6 py-3.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm w-40">Batal</button>
            <button @click="handleSave" :disabled="isSubmitting" class="flex-1 px-6 py-3.5 bg-kementan-green text-white font-bold rounded-xl hover:bg-[#004d26] transition-colors flex justify-center items-center gap-2 shadow-md shadow-kementan-green/20 disabled:opacity-70 text-sm">
              <template v-if="isSubmitting"><div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div><span>Menyimpan...</span></template>
              <template v-else><Save :size="18" /> Simpan Data Pegawai</template>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Notification Modal -->
    <GlobalModal 
      :isOpen="notificationModal.isOpen"
      :type="notificationModal.type"
      :title="notificationModal.title"
      :message="notificationModal.message"
      :confirmText="notificationModal.confirmText"
      @close="notificationModal.isOpen = false"
      @confirm="notificationModal.onConfirm"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { GAS_URL } from '../config/api'
import { Users, Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight, Save } from 'lucide-vue-next'
import GlobalModal from '../components/GlobalModal.vue'

const ITEMS_PER_PAGE = 10

// State
const pegawaiList = ref([])
const isLoading = ref(true)
const searchQuery = ref('')
const currentPage = ref(1)
const viewMode = ref('list')
const isEditMode = ref(false)
const isSubmitting = ref(false)

const formData = ref({
  row_number: null, nama_lengkap: '', nip: '', pangkat_gol_ruang: '', golongan: '', jabatan: '', poksi: '', direktorat: '', tingkat_biaya: ''
})

const notificationModal = ref({
  isOpen: false,
  type: 'success',
  title: '',
  message: '',
  confirmText: '',
  onConfirm: () => {}
})

const showNotification = (type, title, message, onConfirm = null, confirmText = '') => {
  notificationModal.value = {
    isOpen: true,
    type, title, message, onConfirm, confirmText
  }
}

// Lifecycle
onMounted(() => {
  fetchPegawai()
})

watch(searchQuery, () => {
  currentPage.value = 1
})

// Methods
const fetchPegawai = async () => {
  isLoading.value = true
  try {
    const response = await fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify({ action: "GET_PEGAWAI" })
    })
    const result = await response.json()
    if (result.success) {
      pegawaiList.value = result.data
    }
  } catch (error) {
    console.error("Error fetching pegawai:", error)
  } finally {
    isLoading.value = false
  }
}

const openForm = (p = null) => {
  if (p) {
    formData.value = { ...p }
    isEditMode.value = true
  } else {
    formData.value = { row_number: null, nama_lengkap: '', nip: '', pangkat_gol_ruang: '', golongan: '', jabatan: '', poksi: '', direktorat: '', tingkat_biaya: '' }
    isEditMode.value = false
  }
  viewMode.value = 'form'
}

const closeForm = () => {
  viewMode.value = 'list'
}

const handleSave = async () => {
  if (!formData.value.nama_lengkap) {
    showNotification('warning', 'Data Belum Lengkap', 'Nama Lengkap wajib diisi.')
    return
  }
  
  isSubmitting.value = true
  try {
    const response = await fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify({ action: "SAVE_PEGAWAI", data: formData.value })
    })
    const result = await response.json()
    if (result.success) {
      await fetchPegawai()
      closeForm()
      showNotification('success', 'Berhasil Disimpan', `Data pegawai ${formData.value.nama_lengkap} telah diperbarui di sistem.`)
    } else {
      showNotification('error', 'Gagal', result.message)
    }
  } catch (error) {
    showNotification('error', 'Jaringan Error', 'Terjadi kesalahan saat menghubungkan ke server.')
  } finally {
    isSubmitting.value = false
  }
}

const confirmDelete = (pegawai) => {
  showNotification(
    'confirm',
    'Hapus Pegawai',
    `Apakah Anda yakin ingin menghapus data ${pegawai.nama_lengkap}? Tindakan ini tidak dapat dibatalkan.`,
    () => handleDelete(pegawai.row_number),
    'Ya, Hapus'
  )
}

const handleDelete = async (row_number) => {
  isLoading.value = true
  try {
    const response = await fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify({ action: "DELETE_PEGAWAI", row_number })
    })
    const result = await response.json()
    if (result.success) {
      await fetchPegawai()
      showNotification('success', 'Berhasil Dihapus', 'Data pegawai telah dihapus dari database.')
    } else {
      showNotification('error', 'Gagal', result.message)
    }
  } catch (error) {
    showNotification('error', 'Gagal', 'Terjadi kesalahan jaringan.')
  } finally {
    isLoading.value = false
  }
}

const handlePageChange = (p) => {
  currentPage.value = p
}

// Computed
const filteredPegawai = computed(() => {
  if (!searchQuery.value) return pegawaiList.value
  const q = searchQuery.value.toLowerCase()
  return pegawaiList.value.filter(p => 
    p.nama_lengkap.toLowerCase().includes(q) || 
    p.nip.includes(q)
  )
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredPegawai.value.length / ITEMS_PER_PAGE)))
const safePage = computed(() => Math.min(currentPage.value, Math.max(1, totalPages.value)))
const paginatedPegawai = computed(() => {
  const start = (safePage.value - 1) * ITEMS_PER_PAGE
  return filteredPegawai.value.slice(start, start + ITEMS_PER_PAGE)
})

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, safePage.value - 2)
  const end = Math.min(totalPages.value, start + 4)
  const finalStart = Math.max(1, end - 4)
  for (let i = finalStart; i <= end; i++) pages.push(i)
  return pages
})
</script>
