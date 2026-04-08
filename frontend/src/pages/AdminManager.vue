<template>
  <div class="space-y-6 pb-12">
    <!-- View Mode: LIST -->
    <div v-if="viewMode === 'list'" class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div v-motion :initial="{ opacity: 0, x: -20 }" :enter="{ opacity: 1, x: 0 }">
          <div class="flex items-center gap-3 mb-2 text-kementan-green">
            <Users :size="20" />
            <span class="text-xs font-bold tracking-[0.3em] uppercase">Database & Akses</span>
          </div>
          <h1 class="text-3xl font-extrabold text-gray-800">Manajer Admin</h1>
          <p class="text-gray-500 mt-2 text-sm max-w-lg font-medium">
            Kelola hak akses pengguna dan keanggotaan Poksi masing-masing tim.
          </p>
        </div>

        <div class="flex gap-3">
          <button
            v-motion :initial="{ scale: 1 }" :hovered="{ scale: 1.02 }"
            @click="fetchAdmins"
            class="bg-white text-gray-600 px-4 py-3 rounded-xl font-bold shadow-sm border border-gray-200 hover:bg-gray-50 transition-all flex items-center gap-2"
          >
            <RefreshCw :size="18" :class="isLoading ? 'animate-spin text-kementan-green' : ''" />
            <span class="hidden sm:block text-sm">Segarkan</span>
          </button>
          <button
            v-motion :initial="{ scale: 1 }" :hovered="{ scale: 1.02 }"
            @click="openForm()"
            class="bg-kementan-green text-white px-5 py-3 rounded-xl font-bold shadow-md shadow-kementan-green/20 flex items-center gap-2 hover:bg-[#004d26] transition-all text-sm"
          >
            <Plus :size="18" />
            <span>Tambah Admin</span>
          </button>
        </div>
      </div>

      <!-- Error State -->
      <div v-if="error" v-motion :initial="{ opacity: 0, y: 10 }" :enter="{ opacity: 1, y: 0 }" class="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 border border-red-100">
        <AlertCircle :size="20" />
        <p class="text-sm font-semibold">{{ error }}</p>
      </div>

      <!-- Search -->
      <div v-motion :initial="{ opacity: 0, y: 10 }" :enter="{ opacity: 1, y: 0 }" class="glass-card p-4 rounded-2xl">
        <div class="relative">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" :size="18" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama, username, atau poksi..."
            v-model="searchQuery"
            class="w-full bg-white border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-gray-800 outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all font-medium placeholder:text-gray-400 shadow-sm text-sm"
          />
        </div>
      </div>

      <!-- Admin List -->
      <div class="glass-card rounded-3xl overflow-hidden shadow-md relative border border-gray-200">
        <div v-if="isLoading && admins.length === 0" class="flex flex-col items-center justify-center py-20 bg-white/50">
          <div class="w-10 h-10 border-4 border-kementan-green/20 border-t-kementan-green rounded-full animate-spin"></div>
          <p class="mt-4 text-sm font-bold text-gray-500 uppercase tracking-widest animate-pulse">Memuat Data...</p>
        </div>
        <div v-else-if="paginatedAdmins.length === 0" class="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
          <Users :size="32" class="text-gray-300" />
          <p class="text-sm font-medium">Tidak ada data admin ditemukan.</p>
        </div>
        <div v-else class="divide-y divide-gray-100">
          <div
            v-for="(admin, i) in paginatedAdmins"
            :key="admin.username"
            v-motion :initial="{ opacity: 0, y: 5 }" :enter="{ opacity: 1, y: 0, transition: { delay: i * 30 } }"
            class="flex items-center justify-between px-6 py-4 hover:bg-emerald-50/30 transition-colors gap-4"
          >
            <!-- Left: Profile Info -->
            <div class="flex items-center gap-4 min-w-0 flex-1">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-kementan-green/10 to-emerald-100 text-kementan-green font-bold flex items-center justify-center border border-kementan-green/20 shadow-sm shrink-0">
                {{ admin.nama_admin ? admin.nama_admin.charAt(0).toUpperCase() : '?' }}
              </div>
              <div class="min-w-0">
                <p class="text-sm font-bold text-gray-800 truncate">{{ admin.nama_admin }}</p>
                <p class="text-xs text-gray-400 font-medium truncate">@{{ admin.username }}</p>
              </div>
            </div>

            <!-- Center: Poksi Badge -->
            <div class="hidden sm:flex items-center justify-center shrink-0">
              <span class="inline-block px-3 py-1 bg-kementan-green/10 text-kementan-green border border-kementan-green/20 rounded-full text-[11px] font-bold uppercase tracking-tight shadow-sm whitespace-nowrap">
                {{ admin.tim_poksi }}
              </span>
            </div>

            <!-- Right: Actions -->
            <div class="flex items-center gap-2 shrink-0">
              <button
                @click="openForm(admin)"
                class="p-2 bg-white rounded-lg text-gray-400 border border-gray-200 hover:text-kementan-green hover:border-kementan-green hover:bg-emerald-50 shadow-sm transition-all"
                title="Edit Admin"
              >
                <Edit :size="15" />
              </button>
              <button
                @click="handleDelete(admin.username)"
                class="p-2 bg-white rounded-lg text-gray-400 border border-gray-200 hover:text-red-500 hover:border-red-500 hover:bg-red-50 shadow-sm transition-all"
                title="Hapus Admin"
              >
                <Trash2 :size="15" />
              </button>
            </div>
          </div>
        </div>

        <!-- Pagination Footer -->
        <div v-if="filteredAdmins.length > 0 && !isLoading" class="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50/50">
          <p class="text-xs text-gray-500 font-medium">
            Menampilkan <span class="font-bold text-gray-700">{{ (safePage - 1) * ITEMS_PER_PAGE + 1 }}–{{ Math.min(safePage * ITEMS_PER_PAGE, filteredAdmins.length) }}</span> dari <span class="font-bold text-gray-700">{{ filteredAdmins.length }}</span> admin
          </p>
          <div class="flex items-center gap-1">
            <button
              :disabled="safePage <= 1"
              @click="currentPage--"
              class="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-all"
            >
              <ChevronLeft :size="16" />
            </button>
            <button
              v-for="page in totalPages"
              :key="page"
              @click="currentPage = page"
              class="w-8 h-8 rounded-lg text-xs font-bold transition-all"
              :class="[
                page === safePage
                  ? 'bg-kementan-green text-white shadow-sm'
                  : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
              ]"
            >
              {{ page }}
            </button>
            <button
              :disabled="safePage >= totalPages"
              @click="currentPage++"
              class="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-all"
            >
              <ChevronRight :size="16" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- View Mode: FORM -->
    <div v-else-if="viewMode === 'form'" v-motion :initial="{ opacity: 0, y: 10 }" :enter="{ opacity: 1, y: 0 }" class="max-w-4xl mx-auto space-y-6 pb-12">
      <button @click="closeForm" class="flex items-center gap-2 text-gray-500 hover:text-kementan-green transition-colors font-semibold text-sm bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 w-max">
        <ChevronLeft :size="18" /> Kembali ke Daftar Admin
      </button>

      <div class="glass-card rounded-3xl shadow-lg border border-gray-200">
        <div class="bg-gradient-to-r from-kementan-green to-emerald-700 px-8 py-6 text-white rounded-t-3xl">
          <h2 class="text-2xl font-extrabold">{{ isEditMode ? 'Edit Data Admin' : 'Tambah Admin Baru' }}</h2>
          <p class="text-emerald-100 font-medium text-sm mt-1">Lengkapi informasi di bawah ini untuk mengelola hak akses.</p>
        </div>

        <div class="p-8 space-y-6">
          <div class="flex gap-3 bg-blue-50/50 p-4 border border-blue-100 rounded-xl">
            <AlertCircle :size="20" class="text-blue-500 shrink-0 mt-0.5" />
            <p class="text-xs font-medium text-blue-800 leading-relaxed">
              Admin hanya bisa melihat dan memproses SPT sesuai <b>Tim Poksi</b> yang didaftarkan.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">Username Login <span class="text-red-400">*</span></label>
              <input
                type="text" required
                :readonly="isEditMode"
                class="w-full border rounded-xl py-3 px-4 text-sm font-medium outline-none transition-all"
                :class="isEditMode ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white border-gray-300 focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10'"
                v-model="formData.username"
                placeholder="contoh: agus.setiawan"
              />
              <p v-if="isEditMode" class="text-[10px] text-orange-500 mt-1.5 italic font-medium">Username tidak dapat diubah setelah dibuat.</p>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">Kata Sandi <span class="text-red-400">*</span></label>
              <div class="relative">
                <input
                  :type="showFormPassword ? 'text' : 'password'" required
                  class="w-full border border-gray-300 rounded-xl py-3 pl-4 pr-12 text-sm font-medium outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all bg-white"
                  v-model="formData.password"
                  placeholder="Masukkan kata sandi"
                  minlength="6"
                  autocomplete="new-password"
                />
                <button 
                  type="button" 
                  @click="showFormPassword = !showFormPassword"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-kementan-green transition-colors focus:outline-none"
                  tabindex="-1"
                  :title="showFormPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'"
                >
                  <EyeOff v-if="showFormPassword" :size="18" />
                  <Eye v-else :size="18" />
                </button>
              </div>
              <!-- Password Strength Indicator -->
              <div v-if="formData.password" class="mt-2 space-y-1.5">
                <div class="flex gap-1">
                  <div class="h-1 flex-1 rounded-full transition-all duration-300" :class="passwordStrength >= 1 ? passwordStrengthColor : 'bg-gray-200'"></div>
                  <div class="h-1 flex-1 rounded-full transition-all duration-300" :class="passwordStrength >= 2 ? passwordStrengthColor : 'bg-gray-200'"></div>
                  <div class="h-1 flex-1 rounded-full transition-all duration-300" :class="passwordStrength >= 3 ? passwordStrengthColor : 'bg-gray-200'"></div>
                  <div class="h-1 flex-1 rounded-full transition-all duration-300" :class="passwordStrength >= 4 ? passwordStrengthColor : 'bg-gray-200'"></div>
                </div>
                <p class="text-[10px] font-semibold" :class="passwordStrengthTextColor">{{ passwordStrengthLabel }}</p>
              </div>
              <p class="text-[10px] text-gray-400 mt-1.5 font-medium">Min. 6 karakter, disarankan kombinasi huruf &amp; angka.</p>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">Nama Lengkap <span class="text-red-400">*</span></label>
              <input
                type="text" required
                class="w-full border border-gray-300 rounded-xl py-3 px-4 text-sm font-medium outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all bg-white"
                v-model="formData.nama_admin"
                placeholder="Contoh: Agus Setiawan, SE."
              />
            </div>

            <div>
              <CustomDropdown
                label="Afiliasi Tim Poksi"
                :required="true"
                :options="POKSI_OPTIONS"
                v-model:value="formData.tim_poksi"
                placeholder="-- Pilih Tim Poksi --"
              />
            </div>

            <!-- Profile section removed for performance -->
          </div>

          <div class="pt-6 mt-6 border-t border-gray-100 flex gap-4">
            <button @click="closeForm" type="button" class="px-6 py-3.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm w-40">
              Batal
            </button>
            <button
              @click="handleSave"
              :disabled="isSubmitting"
              class="flex-1 px-6 py-3.5 bg-kementan-green text-white font-bold rounded-xl hover:bg-[#004d26] transition-colors flex justify-center items-center gap-2 shadow-md shadow-kementan-green/20 disabled:opacity-70 disabled:cursor-not-allowed text-sm"
            >
              <template v-if="isSubmitting">
                <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Menyimpan...</span>
              </template>
              <template v-else><Save :size="18" /> Simpan Data Admin</template>
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
import { Users, Search, Plus, Edit, Trash2, X, RefreshCw, AlertCircle, Save, ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-vue-next'
import CustomDropdown from '../components/CustomDropdown.vue'
import GlobalModal from '../components/GlobalModal.vue'

const POKSI_OPTIONS = [
  { value: 'Tata Usaha Direktorat Penyediaan Lahan', label: 'Tata Usaha Direktorat Penyediaan Lahan' },
  { value: 'Pendayagunaan Lahan', label: 'Pendayagunaan Lahan' },
  { value: 'Perancangan Teknis Penyediaan Lahan', label: 'Perancangan Teknis Penyediaan Lahan' },
  { value: 'Perluasan Lahan Wilayah I', label: 'Perluasan Lahan Wilayah I' },
  { value: 'Perluasan Lahan Wilayah II', label: 'Perluasan Lahan Wilayah II' },
]

const ITEMS_PER_PAGE = 10

// State
const admins = ref([])
const isLoading = ref(true)
const error = ref('')
const searchQuery = ref('')
const currentPage = ref(1)
const viewMode = ref('list')
const isEditMode = ref(false)
const isSubmitting = ref(false)
const showFormPassword = ref(false)

const formData = ref({
  username: '', password: '', nama_admin: '', tim_poksi: ''
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
  fetchAdmins()
})

// Reset page on search
watch(searchQuery, () => {
  currentPage.value = 1
})

// Methods
const fetchAdmins = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const response = await fetch(GAS_URL, {
      method: 'POST',
      body: JSON.stringify({ action: "GET_ADMINS" }),
    })
    const resData = await response.json()
    if (resData.success) {
      admins.value = resData.data
    } else {
      error.value = resData.message
    }
  } catch (err) {
    error.value = 'Gagal terhubung ke server'
  } finally {
    isLoading.value = false
  }
}

const openForm = (admin = null) => {
  if (admin) {
    formData.value = { ...admin }
    isEditMode.value = true
  } else {
    formData.value = {
      username: '', password: '', nama_admin: '', tim_poksi: ''
    }
    isEditMode.value = false
  }
  viewMode.value = 'form'
  showFormPassword.value = false
}

const closeForm = () => {
  viewMode.value = 'list'
}

const handleSave = async () => {
  if (!formData.value.username || !formData.value.password || !formData.value.nama_admin || !formData.value.tim_poksi) {
    showNotification('warning', 'Data Belum Lengkap', 'Semua kolom bertanda bintang wajib diisi.')
    return
  }
  if (formData.value.password.length < 6) {
    showNotification('warning', 'Kata Sandi Terlalu Pendek', 'Kata sandi minimal harus 6 karakter untuk keamanan akun.')
    return
  }
  isSubmitting.value = true
  try {
    const response = await fetch(GAS_URL, {
      method: 'POST',
      body: JSON.stringify({ action: "SAVE_ADMIN", data: formData.value }),
    })
    const resData = await response.json()
    if (resData.success) {
      // Update local storage if updating self
      const currentAdmin = JSON.parse(localStorage.getItem('adminData') || '{}')
      if (currentAdmin.username === formData.value.username) {
         // Refresh list first to get new URLs
         await fetchAdmins()
         const updated = admins.value.find(a => a.username === formData.value.username)
         if (updated) localStorage.setItem('adminData', JSON.stringify(updated))
          // Refresh window to update layout context
          window.location.reload()
      } else {
          await fetchAdmins()
          closeForm()
          showNotification('success', 'Admin Disimpan', `Data untuk @${formData.value.username} telah diperbarui.`)
      }
    } else {
      showNotification('error', 'Gagal', resData.message)
    }
  } catch (err) {
    showNotification('error', 'Gagal Jaringan', 'Tidak dapat menghubungi server.')
  } finally {
    isSubmitting.value = false
  }
}

const handleDelete = (username) => {
  showNotification(
    'confirm', 
    'Hapus Admin?', 
    `Apakah Anda yakin ingin menghapus akses untuk @${username}? Data yang dihapus tidak dapat dipulihkan.`,
    async () => {
      isLoading.value = true
      try {
        const response = await fetch(GAS_URL, {
          method: 'POST',
          body: JSON.stringify({ action: "DELETE_ADMIN", username }),
        })
        const resData = await response.json()
        if (resData.success) {
          await fetchAdmins()
          showNotification('success', 'Admin Dihapus', 'Hak akses admin telah dicabut.')
        } else {
          showNotification('error', 'Gagal', resData.message)
          isLoading.value = false
        }
      } catch (err) {
        showNotification('error', 'Gagal', 'Terjadi kesalahan jaringan.')
        isLoading.value = false
      }
    }
  )
}




// Computed
const filteredAdmins = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return admins.value.filter(admin =>
    (admin.nama_admin?.toLowerCase() || '').includes(q) ||
    (admin.username?.toLowerCase() || '').includes(q) ||
    (admin.tim_poksi?.toLowerCase() || '').includes(q)
  )
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredAdmins.value.length / ITEMS_PER_PAGE)))
const safePage = computed(() => Math.min(currentPage.value, Math.max(1, totalPages.value)))
const paginatedAdmins = computed(() => filteredAdmins.value.slice((safePage.value - 1) * ITEMS_PER_PAGE, safePage.value * ITEMS_PER_PAGE))

// Password Strength Calculator
const passwordStrength = computed(() => {
  const pw = formData.value.password
  if (!pw) return 0
  let score = 0
  if (pw.length >= 6) score++
  if (pw.length >= 8 && /[A-Z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 12) score++
  return score
})

const passwordStrengthColor = computed(() => {
  const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-500']
  return colors[Math.max(0, passwordStrength.value - 1)] || 'bg-gray-200'
})

const passwordStrengthTextColor = computed(() => {
  const colors = ['text-red-500', 'text-orange-500', 'text-yellow-600', 'text-emerald-600']
  return colors[Math.max(0, passwordStrength.value - 1)] || 'text-gray-400'
})

const passwordStrengthLabel = computed(() => {
  const labels = ['Sangat Lemah', 'Lemah', 'Cukup Kuat', 'Kuat']
  return labels[Math.max(0, passwordStrength.value - 1)] || ''
})
</script>
