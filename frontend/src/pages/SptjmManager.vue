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
      :selected-pegawai-index="selectedPegawaiIndex"
      @cancel="closeForm"
      @save="handleSubmit"
      @pegawaiChange="handlePegawaiChange"
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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
  fileLink: '',
  createdAt: ''
})

const formData = ref<any>(getDefaultForm())
const selectedPegawaiIndex = ref(-1)

const pegawaiOptions = computed(() => {
  let list = pegawaiList.value
  if (adminProfile.value.role !== 'Super Admin' && adminProfile.value.timPoksi) {
    list = list.filter(p => p.timPoksi === adminProfile.value.timPoksi)
  }
  return list.map(item => ({
    label: `${item.namaLengkap} - ${item.nip || 'Non NIP'}`,
    value: item.namaLengkap
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

const handlePegawaiChange = (index: number) => {
  selectedPegawaiIndex.value = index
  if (index >= 0) {
    let filteredList = pegawaiList.value
    if (adminProfile.value.role !== 'Super Admin' && adminProfile.value.timPoksi) {
      filteredList = filteredList.filter(p => p.timPoksi === adminProfile.value.timPoksi)
    }
    const peg = filteredList[index]
    formData.value.namaLengkap = peg.namaLengkap
    formData.value.nip = peg.nip || '-'
    formData.value.jabatan = peg.jabatan
    formData.value.timPoksi = peg.timPoksi
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
      tanggalKembali: formatDateForInput(data.tanggalKembali)
    }
    let pList = pegawaiList.value
    if (adminProfile.value.role !== 'Super Admin' && adminProfile.value.timPoksi) {
      pList = pList.filter(p => p.timPoksi === adminProfile.value.timPoksi)
    }
    selectedPegawaiIndex.value = pList.findIndex((p: any) => p.namaLengkap === data.namaLengkap)
  } else {
    isEditMode.value = false
    formData.value = { ...getDefaultForm(), timPoksi: adminProfile.value.timPoksi ?? '' }
    selectedPegawaiIndex.value = -1
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
    const response = await api.post('/api/sptjm', updatedFormData)
    const res = response.data

    isProcessing.value = false
    if (res.status) {
      showNotification('success', 'Berhasil', isEditMode.value ? 'Data SPTJM diperbarui.' : 'Data SPTJM disimpan.', async () => {
        dataStore.invalidateCache('sptjm')
        await fetchSptjm(true)
        closeForm()
      })
    } else {
      showNotification('error', 'Gagal', res.message)
    }
  } catch (err: any) {
    isProcessing.value = false
    showNotification('error', 'Error System', err.message || 'Terjadi kesalahan tidak terduga.')
  }
}

const handleDelete = (id: string) => {
  showNotification(
    'confirm',
    'Hapus SPTJM?',
    'Data yang dihapus tidak dapat dikembalikan.',
    async () => {
      isProcessing.value = true
      try {
        const response = await api.delete(`/api/sptjm/${id}`)
        const res = response.data
        isProcessing.value = false
        if (res.status) {
          showNotification('success', 'Berhasil', 'Dokumen SPTJM telah dihapus.')
          dataStore.invalidateCache('sptjm')
          await fetchSptjm(true)
        } else {
          showNotification('error', 'Gagal Menghapus', res.message)
        }
      } catch (err: any) {
        isProcessing.value = false
        showNotification('error', 'Error System', err.message || 'Terjadi kesalahan.')
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
</style>
