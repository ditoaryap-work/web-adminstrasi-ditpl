<template>
  <div class="h-full flex flex-col pb-12">
    <!-- View Mode: PROFIL -->
    <div v-if="viewMode === 'view'" class="space-y-6">
      <div class="mb-2">
        <h1 class="text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight">Profil Pengguna</h1>
        <p class="text-sm text-gray-500 mt-1 font-medium">Lihat dan kelola informasi akun e-Office Anda.</p>
      </div>

      <div class="max-w-4xl w-full">
        <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
          <div class="p-8 sm:p-10">
            
            <div class="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-10">
              <!-- Avatar -->
              <div
                class="w-32 h-32 rounded-full bg-gradient-to-br from-kementan-green to-emerald-500 flex items-center justify-center text-white text-5xl font-extrabold shadow-lg border-4 border-white flex-shrink-0">
                {{ profile.namaAdmin?.charAt(0).toUpperCase() || 'U' }}
              </div>

              <!-- Header Info -->
              <div class="text-center sm:text-left flex-1 mt-2">
                <h2 class="text-3xl font-bold text-gray-900 mb-1">{{ profile.namaAdmin || 'Nama Pengguna' }}</h2>
                <p class="text-gray-500 font-medium mb-4 text-lg">@{{ profile.username || 'username' }}</p>
                <div class="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <span
                    class="px-4 py-1.5 bg-kementan-green/10 text-kementan-green rounded-full text-xs font-bold uppercase tracking-widest border border-kementan-green/20 shadow-sm">
                    {{ profile.role || 'Admin' }}
                  </span>
                  <span class="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-widest border border-blue-100 shadow-sm">
                    {{ profile.timPoksi || 'Tanpa Tim' }}
                  </span>
                </div>
              </div>

              <!-- Tombol Edit Profil -->
              <div class="w-full sm:w-auto flex justify-center sm:block mt-4 sm:mt-0">
                <button @click="openEditForm"
                  class="flex items-center gap-2 px-6 py-2.5 bg-white text-kementan-green border-2 border-kementan-green rounded-xl font-bold text-sm shadow-sm hover:bg-kementan-green hover:text-white transition-all whitespace-nowrap active:scale-95">
                  <Edit :size="16" /> Edit Profil
                </button>
              </div>
            </div>

            <div class="border-t border-gray-100 pt-8">
              <h3 class="text-lg font-bold text-gray-900 mb-6">Informasi Akun</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div class="space-y-1.5">
                  <label class="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Nama Lengkap</label>
                  <div class="px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-semibold">
                    {{ profile.namaAdmin || '-' }}
                  </div>
                </div>
                <div class="space-y-1.5">
                  <label class="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Username</label>
                  <div class="px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-semibold">
                    {{ profile.username || '-' }}
                  </div>
                </div>
                <div class="space-y-1.5">
                  <label class="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Hak Akses (Role)</label>
                  <div class="px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-semibold">
                    {{ profile.role || '-' }}
                  </div>
                </div>
                <div class="space-y-1.5">
                  <label class="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Tim / Kelompok Kerja</label>
                  <div class="px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-semibold">
                    {{ profile.timPoksi || '-' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- View Mode: FORM EDIT -->
    <div v-else-if="viewMode === 'edit'" v-motion :initial="{ opacity: 0, y: 10 }" :enter="{ opacity: 1, y: 0 }" class="max-w-4xl space-y-6">
      <button
        class="flex items-center gap-2 text-gray-500 hover:text-kementan-green transition-colors font-semibold text-sm bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 w-max"
        @click="closeEditForm"
      >
        <ChevronLeft :size="18" /> Kembali ke Profil
      </button>

      <div class="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-gray-200 overflow-hidden">
        <div class="bg-gradient-to-r from-kementan-green to-emerald-700 px-8 py-6 text-white">
          <h2 class="text-2xl font-extrabold">Edit Profil</h2>
          <p class="text-emerald-100 font-medium text-sm mt-1">
            Ubah nama atau kata sandi akun Anda.
          </p>
        </div>

        <div class="p-8 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Nama Lengkap -->
            <div>
              <label class="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">Nama Lengkap <span class="text-red-400">*</span></label>
              <input
                v-model="editForm.namaAdmin"
                type="text"
                required
                class="w-full border border-gray-300 rounded-xl py-3 px-4 text-sm font-medium outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all bg-white"
                placeholder="Masukkan nama lengkap"
              >
            </div>

            <!-- Kata Sandi -->
            <div>
              <label class="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">Kata Sandi Baru</label>
              <div class="relative">
                <input
                  v-model="editForm.password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  class="w-full border border-gray-300 rounded-xl py-3 pl-4 pr-12 text-sm font-medium outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all bg-white"
                  placeholder="Kosongkan jika tidak ingin mengubah"
                >
                <button 
                  type="button" 
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-kementan-green transition-colors focus:outline-none"
                  tabindex="-1"
                  @click="showPassword = !showPassword"
                >
                  <EyeOff v-if="showPassword" :size="18" />
                  <Eye v-else :size="18" />
                </button>
              </div>

              <!-- Password Strength Indicator -->
              <div v-if="editForm.password" class="mt-2 space-y-1.5">
                <div class="flex gap-1">
                  <div class="h-1 flex-1 rounded-full transition-all duration-300"
                    :class="passwordStrength >= 1 ? passwordStrengthColor : 'bg-gray-200'" />
                  <div class="h-1 flex-1 rounded-full transition-all duration-300"
                    :class="passwordStrength >= 2 ? passwordStrengthColor : 'bg-gray-200'" />
                  <div class="h-1 flex-1 rounded-full transition-all duration-300"
                    :class="passwordStrength >= 3 ? passwordStrengthColor : 'bg-gray-200'" />
                  <div class="h-1 flex-1 rounded-full transition-all duration-300"
                    :class="passwordStrength >= 4 ? passwordStrengthColor : 'bg-gray-200'" />
                </div>
                <p class="text-[10px] font-semibold" :class="passwordStrengthTextColor">
                  {{ passwordStrengthLabel }}
                </p>
              </div>
              <p class="text-[10px] text-gray-400 mt-1.5 font-medium italic">
                Min. 6 karakter, disarankan kombinasi huruf &amp; angka.
              </p>
            </div>
          </div>
          
          <div class="flex gap-3 bg-blue-50/80 p-4 border border-blue-100 rounded-2xl mt-4">
            <div class="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white shrink-0 shadow-sm shadow-blue-200">
              <AlertCircle :size="18" />
            </div>
            <div class="space-y-1">
              <p class="text-xs font-extrabold text-blue-900 leading-none">Informasi Penting</p>
              <p class="text-[10px] font-semibold text-blue-800/80 leading-relaxed">
                Perubahan profil akan langsung diperbarui di seluruh sistem. Harap ingat kata sandi baru Anda jika diubah.
              </p>
            </div>
          </div>

          <div class="pt-6 mt-6 border-t border-gray-100 flex gap-4">
            <button
              type="button"
              class="px-6 py-3.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm w-40"
              @click="closeEditForm"
            >
              Batal
            </button>
            <button
              :disabled="isSaving"
              class="flex-1 px-6 py-3.5 bg-kementan-green text-white font-bold rounded-xl hover:bg-[#004d26] transition-colors flex justify-center items-center gap-2 shadow-md shadow-kementan-green/20 disabled:opacity-70 disabled:cursor-not-allowed text-sm"
              @click="saveProfile"
            >
              <template v-if="isSaving">
                <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Menyimpan...</span>
              </template>
              <template v-else>
                <Save :size="18" /> Simpan Perubahan
              </template>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Processing Overlay -->
    <ProcessingOverlay :is-processing="isSaving" title="Menyimpan Profil" message="Sedang memperbarui informasi akun Anda..." />

    <!-- Modals -->
    <GlobalModal :is-open="showSuccessModal" type="success" title="Berhasil!" message="Profil Anda telah berhasil diperbarui." @close="showSuccessModal = false" />
    <GlobalModal :is-open="showErrorModal" type="error" title="Gagal!" :message="errorMessage" @close="showErrorModal = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue'
import { Edit, Save, Eye, EyeOff, ChevronLeft, AlertCircle } from 'lucide-vue-next'
import api from '../config/api'
import ProcessingOverlay from '../components/ProcessingOverlay.vue'
import GlobalModal from '../components/GlobalModal.vue'
import { useDataStore } from '../stores/useDataStore'

const dataStore = useDataStore()
const profile = computed(() => dataStore.adminProfile || {})

const viewMode = ref<'view' | 'edit'>('view')
const isSaving = ref(false)
const showPassword = ref(false)
const showSuccessModal = ref(false)
const showErrorModal = ref(false)
const errorMessage = ref('')

const editForm = reactive({
  namaAdmin: '',
  password: ''
})

onMounted(() => {
  if (dataStore.adminProfile) {
    editForm.namaAdmin = dataStore.adminProfile.namaAdmin || ''
  }
})

// --- Password Strength Logic ---
const passwordStrength = computed(() => {
  const pw = editForm.password
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

const openEditForm = () => {
  editForm.namaAdmin = profile.value.namaAdmin || ''
  editForm.password = ''
  showPassword.value = false
  viewMode.value = 'edit'
}

const closeEditForm = () => {
  viewMode.value = 'view'
}

const saveProfile = async () => {
  if (!editForm.namaAdmin || editForm.namaAdmin.length < 3) {
    errorMessage.value = 'Nama minimal 3 karakter.'
    showErrorModal.value = true
    return
  }

  if (editForm.password && editForm.password.length < 6) {
    errorMessage.value = 'Kata sandi minimal 6 karakter.'
    showErrorModal.value = true
    return
  }

  try {
    isSaving.value = true
    const response = await api.put('/api/auth/profile', {
      namaAdmin: editForm.namaAdmin,
      password: editForm.password || undefined
    })

    if (response.data.status) {
      const storedData = JSON.parse(localStorage.getItem('adminData') || '{}')
      storedData.namaAdmin = editForm.namaAdmin
      localStorage.setItem('adminData', JSON.stringify(storedData))
      
      dataStore.setAdminProfile({
        ...dataStore.adminProfile,
        namaAdmin: editForm.namaAdmin
      })
      
      closeEditForm()
      showSuccessModal.value = true
    }
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'Terjadi kesalahan saat menyimpan profil.'
    showErrorModal.value = true
  } finally {
    isSaving.value = false
  }
}
</script>
