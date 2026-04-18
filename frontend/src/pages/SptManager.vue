<template>
  <div class="space-y-6 pb-12">
    <!-- View Mode: LIST -->
    <SptList
      v-if="viewMode === 'list'"
      :spt-list="sptList"
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
    <SptForm
      v-else-if="viewMode === 'form'"
      :initial-data="formData"
      :is-edit-mode="isEditMode"
      :is-processing="isProcessing"
      :pegawai-options="pegawaiOptions"
      :pegawai-list="pegawaiList"
      :admin-profile="adminProfile"
      @cancel="closeForm"
      @save="handleSubmit"
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
import SptList from '../components/spt/SptList.vue'
import SptForm from '../components/spt/SptForm.vue'
import { useDataStore } from '../stores/useDataStore'
import api from '../config/api'
import { triggerDownload } from '../utils/drive'

const dataStore = useDataStore()

const isLoading = ref(false)
const isPegawaiLoading = ref(false)
const isProcessing = ref(false)

const viewMode = ref<'list' | 'form'>('list')
const isEditMode = ref(false)

const sptList = ref<any[]>([])
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
  no: '',
  timPoksi: '',
  maksudSpt: '',
  tanggalSurat: '',
  pejabatMenugaskan: 'Direktur',
  namaPenandatangan: '',
  nipPenandatangan: '',
  jabatanPenandatangan: 'Direktur',
  peserta: [
    {
      namaLengkap: '',
      nip: '',
      jabatan: '',
      pangkatGolongan: '',
      tujuan: '',
      lamanya: '',
      tanggalMulai: '',
      tanggalSelesai: ''
    }
  ],
  fileLink: '',
  createdAt: ''
})

const formData = ref<any>(getDefaultForm())

const pegawaiOptions = computed(() => {
  let list = pegawaiList.value
  if (adminProfile.value.role !== 'Super Admin' && adminProfile.value.timPoksi) {
    list = list.filter(p => p.timPoksi === adminProfile.value.timPoksi)
  }
  return list.map((item: any) => ({
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

const fetchSpt = async (force = false) => {
  if (!force && dataStore.isCacheValid('spt') && sptList.value.length > 0) return

  isLoading.value = true
  try {
    const response = await api.get('/api/spt')
    const res = response.data
    if (res.status && res.data) {
      sptList.value = res.data.map((item: any) => {
        let parsedPeserta = []
        if (typeof item.peserta === 'string') {
          try {
            parsedPeserta = JSON.parse(item.peserta)
          } catch {
            parsedPeserta = []
          }
        } else if (Array.isArray(item.peserta)) {
          parsedPeserta = item.peserta
        }
        return {
          ...item,
          peserta: parsedPeserta
        }
      })
      dataStore.setSptData(res.data)
    }
  } catch {
    sptList.value = []
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
    let p = Array.isArray(data.peserta) ? [...data.peserta] : []
    if (p.length === 0) {
      p = getDefaultForm().peserta
    } else {
      p = p.map(pes => ({
        ...pes,
        tanggalMulai: formatDateForInput(pes.tanggalMulai),
        tanggalSelesai: formatDateForInput(pes.tanggalSelesai)
      }))
    }
    formData.value = {
      ...getDefaultForm(),
      ...data,
      peserta: p,
      tanggalSurat: formatDateForInput(data.tanggalSurat)
    }
  } else {
    isEditMode.value = false
    formData.value = { ...getDefaultForm(), timPoksi: adminProfile.value.timPoksi ?? '' }
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
  dataStore.invalidateCache('spt')
  await fetchSpt(true)
}

const handleSubmit = async (updatedFormData: any) => {
  isProcessing.value = true
  try {
    const payload = {
      ...updatedFormData,
      peserta: JSON.stringify(updatedFormData.peserta)
    }

    const response = await api.post('/api/spt', payload)
    const res = response.data

    isProcessing.value = false
    if (res.status) {
      showNotification('success', 'Berhasil', isEditMode.value ? 'Data SPT diperbarui.' : 'Data SPT disimpan.', async () => {
        dataStore.invalidateCache('spt')
        await fetchSpt(true)
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
    'Hapus SPT?',
    'Data yang dihapus tidak dapat dikembalikan.',
    async () => {
      isProcessing.value = true
      try {
        const response = await api.delete(`/api/spt/${id}`)
        const res = response.data
        isProcessing.value = false
        if (res.status) {
          showNotification('success', 'Berhasil', 'Dokumen SPT telah dihapus.')
          dataStore.invalidateCache('spt')
          await fetchSpt(true)
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
  fetchSpt()
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
