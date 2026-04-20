<template>
  <div class="space-y-6 pb-12">
    <!-- View Mode: LIST -->
    <SptjmList
      v-if="viewMode === 'list'"
      :sptjm-list="sptjmList"
      :is-loading="isLoading"
      v-model:search-query="searchQuery"
      v-model:current-page="currentPage"
      :admin-profile="adminProfile"
      @refresh="handleRefresh"
      @add="openForm()"
      @edit="(item) => openForm(item)"
      @delete="handleDelete"
      @preview="openPreview"
      @download="triggerDownload"
    />

    <!-- View Mode: FORM -->
    <SptjmForm
      v-else-if="viewMode === 'form'"
      :initial-data="formData"
      :is-edit-mode="isEditMode"
      :is-processing="isProcessing"
      :pegawai-options="pegawaiOptions"
      :is-pegawai-loading="isPegawaiLoading"
      :selected-pegawai-id="selectedPegawaiId"
      @cancel="closeForm"
      @save="handleSubmit"
      @pegawai-change="handlePegawaiChange"
    />

    <!-- Global Loading Overlay -->
    <Teleport to="body">
      <transition name="fade">
        <div v-if="isProcessing"
          class="fixed inset-0 z-[11000] flex flex-col items-center justify-center p-6 bg-slate-900/80">
          <div class="w-16 h-16 border-4 border-kementan-green/30 border-t-kementan-green rounded-full animate-spin" />
          <p class="mt-6 text-white font-bold tracking-widest uppercase animate-pulse">
            Menyimpan Data...
          </p>
        </div>
      </transition>
    </Teleport>

    <!-- Global Notification Modal -->
    <GlobalModal :is-open="notificationModal.isOpen" :type="notificationModal.type" :title="notificationModal.title"
      :message="notificationModal.message" :confirm-text="notificationModal.confirmText"
      @close="notificationModal.isOpen = false" @confirm="notificationModal.onConfirm" />

    <!-- File Preview Modal -->
    <FilePreviewModal :is-open="showPreview" :file-url="previewUrl" @close="showPreview = false" />

    <!-- SPTJM Success Result Modal -->
    <Teleport to="body">
      <transition name="modal-fade">
        <div v-if="showSuccessResult" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="handleSuccessDone" />
          
          <div 
            v-motion
            :initial="{ opacity: 0, scale: 0.9, y: 20 }"
            :enter="{ opacity: 1, scale: 1, y: 0 }"
            class="relative bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-100"
          >
            <div class="p-8 text-center">
              <div class="w-20 h-20 bg-emerald-50 rounded-full mx-auto flex items-center justify-center mb-6">
                <CheckCircle :size="40" class="text-emerald-500" />
              </div>
              <h3 class="text-2xl font-bold text-slate-800 mb-2">Simpan Berhasil</h3>
              <p class="text-slate-500 text-sm leading-relaxed px-4">
                Dokumen SPTJM telah berhasil digenerate dan disimpan ke sistem.
              </p>
            </div>

            <div class="px-6 pb-8 space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <button 
                  @click="handlePreviewGenerated"
                  class="flex items-center justify-center gap-2 py-3.5 bg-slate-100 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all active:scale-95"
                >
                  <Eye :size="18" />
                  Lihat PDF
                </button>
                <button 
                  @click="handleDownloadGenerated"
                  class="flex items-center justify-center gap-2 py-3.5 bg-slate-100 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all active:scale-95"
                >
                  <Download :size="18" />
                  Download
                </button>
              </div>
              
              <button 
                @click="handleSuccessDone"
                class="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold text-sm hover:bg-emerald-600 shadow-lg shadow-emerald-200 transition-all active:scale-[0.98]"
              >
                Selesai & Kembali
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { CheckCircle, Eye, Download } from 'lucide-vue-next'
import GlobalModal from '../components/GlobalModal.vue'
import FilePreviewModal from '../components/FilePreviewModal.vue'
import SptjmList from '../components/sptjm/SptjmList.vue'
import SptjmForm from '../components/sptjm/SptjmForm.vue'
import { useDataStore } from '../stores/useDataStore'
import api from '../config/api'
import { triggerDownload } from '../utils/drive'

const dataStore = useDataStore()

const isLoading = ref(false)
const isPegawaiLoading = ref(false)
const isProcessing = ref(false)

const viewMode = ref<'list' | 'form'>('list')
const isEditMode = ref(false)

const sptjmList = ref<any[]>([])
const pegawaiList = ref<any[]>([])

const searchQuery = ref('')
const currentPage = ref(1)

const showPreview = ref(false)
const previewUrl = ref('')

const notificationModal = ref({
  isOpen: false,
  type: 'success' as 'success' | 'error' | 'warning' | 'info' | 'confirm',
  title: '',
  message: '',
  confirmText: '',
  onConfirm: () => { },
})

const showSuccessResult = ref(false)
const lastGeneratedUrl = ref('')

const adminProfile = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('adminData') || '{}')
  } catch {
    return {}
  }
})

const getDefaultForm = () => ({
  id: '',
  namaLengkap: '',
  nip: '',
  jabatan: '',
  timPoksi: '',
  tujuan: '',
  tanggalPerjalanan: '',
  tanggalKembali: '',
  rincianPesawat: [],
  keteranganPenginapan: '',
  biayaPenginapan: '',
  keteranganTransportasi: '',
  biayaTransportasi: '',
  totalBiaya: '',
  tanggalTtd: new Date().toISOString().split('T')[0],
  fileLink: '',
  createdAt: ''
})

const formData = ref<any>(getDefaultForm())
const selectedPegawaiId = ref('')

const pegawaiOptions = computed(() => {
  let list = pegawaiList.value
  if (adminProfile.value.role !== 'Super Admin' && adminProfile.value.timPoksi) {
    list = list.filter(p => String(p.poksi || '').toLowerCase() === String(adminProfile.value.timPoksi || '').toLowerCase())
  }
  return list.map((item) => ({
    label: item.namaLengkap,
    value: item.id
  }))
})

const showNotification = (
  type: 'success' | 'error' | 'warning' | 'info' | 'confirm',
  title: string,
  message: string,
  onConfirm: (() => void) | null = null,
  confirmText = ''
) => {
  notificationModal.value = {
    isOpen: true,
    type,
    title,
    message,
    confirmText,
    onConfirm: onConfirm ?? (() => { }),
  }
}

const fetchSptjm = async (force = false) => {
  if (!force && dataStore.isCacheValid('sptjm') && sptjmList.value.length > 0) return

  isLoading.value = true
  try {
    const response = await api.get('/api/sptjm')
    const res = response.data
    if (res.status && res.data) {
      sptjmList.value = res.data
      dataStore.setSptjmData(res.data)
    }
  } catch {
    sptjmList.value = []
  } finally {
    isLoading.value = false
  }
}

const fetchPegawai = async () => {
  if (dataStore.isCacheValid('pegawai')) {
    pegawaiList.value = dataStore.pegawaiData
    return
  }
  isPegawaiLoading.value = true
  try {
    const response = await api.get('/api/pegawai')
    const res = response.data
    if (res.status && res.data) {
      pegawaiList.value = res.data
      dataStore.setPegawaiData(res.data)
    }
  } finally {
    isPegawaiLoading.value = false
  }
}

const handlePegawaiChange = (id: string) => {
  selectedPegawaiId.value = id
  if (id) {
    const peg = pegawaiList.value.find(p => p.id === id)
    if (peg) {
      formData.value.namaLengkap = peg.namaLengkap
      formData.value.nip = peg.nip || '-'
      formData.value.jabatan = peg.jabatan
      formData.value.timPoksi = peg.timPoksi || adminProfile.value.timPoksi
    }
  } else {
    formData.value.namaLengkap = ''
    formData.value.nip = ''
    formData.value.jabatan = ''
    formData.value.timPoksi = ''
  }
}

const openPreview = (url: string) => {
  if (!url) return
  previewUrl.value = url
  showPreview.value = true
}

const formatDateForInput = (dateStr: string): string => {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ''
    return d.toISOString().split('T')[0]
  } catch {
    return ''
  }
}

const openForm = (data: any = null) => {
  if (data) {
    isEditMode.value = true
    formData.value = {
      ...getDefaultForm(),
      ...data,
      rincianPesawat: Array.isArray(data.rincianPesawat) ? data.rincianPesawat : [],
      tanggalPerjalanan: formatDateForInput(data.tanggalPerjalanan),
      tanggalKembali: formatDateForInput(data.tanggalKembali),
      tanggalTtd: formatDateForInput(data.tanggalTtd)
    }
    let pList = pegawaiList.value
    if (adminProfile.value.role !== 'Super Admin' && adminProfile.value.timPoksi) {
      pList = pList.filter(p => String(p.poksi || '').toLowerCase() === String(adminProfile.value.timPoksi || '').toLowerCase())
    }
    const matchedPegawai = pList.find((p: any) => p.namaLengkap === data.namaLengkap || p.id === data.nip)
    selectedPegawaiId.value = matchedPegawai ? matchedPegawai.id : ''
  } else {
    isEditMode.value = false
    formData.value = { ...getDefaultForm(), timPoksi: adminProfile.value.timPoksi ?? '' }
    selectedPegawaiId.value = ''
  }
  viewMode.value = 'form'
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const closeForm = () => {
  viewMode.value = 'list'
  isEditMode.value = false
  formData.value = getDefaultForm()
}

const handleRefresh = async () => {
  dataStore.invalidateCache('sptjm')
  await fetchSptjm(true)
}

const handleSubmit = async (updatedFormData: any) => {
  isProcessing.value = true
  try {
    const isEdit = isEditMode.value
    const endpoint = isEdit ? `/api/sptjm/${updatedFormData.id}` : '/api/sptjm'
    const method = isEdit ? 'patch' : 'post'

    const response = await api[method](endpoint, updatedFormData)
    const res = response.data

    if (res.status) {
      // 1. Invalidate cache and fetch immediately
      dataStore.invalidateCache('sptjm')
      await fetchSptjm(true)
      
      // 2. Prepare success modal
      lastGeneratedUrl.value = res.data?.fileLink || ''
      isProcessing.value = false
      showSuccessResult.value = true
    } else {
      isProcessing.value = false
      showNotification('error', 'Gagal', res.message)
    }
  } catch (err: any) {
    isProcessing.value = false
    showNotification('error', 'Error System', err.message || 'Terjadi kesalahan tidak terduga.')
  }
}

const handleDownloadGenerated = () => {
  if (lastGeneratedUrl.value) {
    triggerDownload(lastGeneratedUrl.value)
  }
}

const handlePreviewGenerated = () => {
  if (lastGeneratedUrl.value) {
    openPreview(lastGeneratedUrl.value)
  }
}

const handleSuccessDone = () => {
  showSuccessResult.value = false
  closeForm()
}

const handleDelete = (id: string) => {
  showNotification(
    'confirm',
    'Hapus SPTJM?',
    'Data yang dihapus tidak dapat dikembalikan.',
    async () => {
      isProcessing.value = true
      try {
        const res = await api.delete(`/api/sptjm/${id}`)
        if (res.data.status) {
          // Optimistic Update: Langsung hapus dari state lokal agar UI segera berubah
          sptjmList.value = sptjmList.value.filter(item => item.id !== id)
          dataStore.setSptjmData(sptjmList.value)
          dataStore.invalidateCache('sptjm')

          showNotification('success', 'Berhasil', 'Data SPTJM telah dihapus')
          
          // Sinkronisasi ulang dengan server
          await fetchSptjm(true)
        } else {
          showNotification('error', 'Gagal Menghapus', res.data.message)
        }
      } catch (err: any) {
        showNotification('error', 'Error System', err.message || 'Terjadi kesalahan.')
      } finally {
        isProcessing.value = false
      }
    },
    'Hapus Permanen'
  )
}

onMounted(() => {
  fetchSptjm()
  fetchPegawai()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}
</style>
