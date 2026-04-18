<template>
  <div class="space-y-6 pb-12">
    <!-- VIEW MODE: LIST -->
    <ArsipSuratList
      v-if="viewMode === 'list'"
      :surat-list="suratList"
      :is-loading="isLoading"
      v-model:search-query="searchQuery"
      v-model:filter-tipe="filterTipe"
      v-model:current-page="currentPage"
      :admin-role="adminData.role"
      :admin-tim-poksi="adminData.timPoksi"
      @refresh="handleRefresh"
      @add="() => openForm()"
      @edit="(s) => openForm(s)"
      @delete="handleDelete"
      @preview="openPreview"
      @download="triggerDownload"
      @openNotulensi="openNotulensiModal"
    />

    <!-- VIEW MODE: FORM -->
    <ArsipSuratForm
      v-if="viewMode === 'form'"
      :initial-data="formData"
      :is-edit-mode="isEditMode"
      :is-processing="isProcessing"
      :pegawai-list="pegawaiList"
      @cancel="closeForm"
      @save="handleSubmit"
      @notify="showNotification"
    />

    <!-- NOTULENSI MODAL -->
    <NotulensiModal
      v-if="showNotulensiModal"
      :initial-data="formData"
      :is-open="showNotulensiModal"
      :is-processing="isProcessing"
      @close="closeForm"
      @save="handleSubmit"
      @notify="showNotification"
    />

    <!-- Success Modal Baru (Instant Feedback) -->
    <Teleport to="body">
      <transition name="fade">
        <div v-if="successModal.isOpen"
          class="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div v-motion :initial="{ opacity: 0, scale: 0.9, y: 20 }" :enter="{ opacity: 1, scale: 1, y: 0 }"
            class="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-emerald-100">
            <div class="h-2 bg-emerald-500 w-full" />
            <div class="p-8 text-center">
              <div class="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <!-- CheckCircle2 has been extracted safely -->
                <svg class="w-12 h-12 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <h3 class="text-xl font-bold text-gray-800 mb-2">{{ successModal.title }}</h3>
              <p class="text-sm text-gray-500 mb-8 leading-relaxed">
                Berkas untuk nomor surat <span class="font-bold text-gray-700">{{ successModal.nomorSurat }}</span>
                telah berhasil diproses dan tersimpan di Google Drive.
              </p>

              <div class="space-y-3">
                <div v-if="successModal.fileSurat" class="flex gap-2">
                  <button @click="openPreview(successModal.fileSurat)"
                    class="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 transition-all shadow-md flex items-center justify-center gap-2">
                     Preview Surat
                  </button>
                  <button
                    @click="triggerDownload(successModal.fileSurat, `Surat_${successModal.nomorSurat.replace(/\//g, '_')}`)"
                    class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all flex items-center justify-center border border-emerald-100">
                     D
                  </button>
                </div>

                <div v-if="successModal.fileNotulensi" class="flex gap-2">
                  <button @click="openPreview(successModal.fileNotulensi)"
                    class="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-all shadow-md flex items-center justify-center gap-2">
                     Preview Notulensi
                  </button>
                  <button
                    @click="triggerDownload(successModal.fileNotulensi, `Ntl_${successModal.nomorSurat.replace(/\//g, '_')}`)"
                    class="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all flex items-center justify-center border border-blue-100">
                     D
                  </button>
                </div>

                <button @click="successModal.isOpen = false"
                  class="w-full py-3 bg-gray-100 text-gray-500 rounded-xl font-bold text-xs hover:bg-gray-200 transition-all mt-4">
                  TUTUP
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- Global Loading Overlay -->
    <Teleport to="body">
      <transition name="fade">
        <div v-if="isProcessing"
          class="fixed inset-0 z-[11000] flex flex-col items-center justify-center p-6 bg-slate-900/80">
          <div class="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <p class="mt-6 text-white font-bold tracking-widest uppercase animate-pulse">
            {{ processingMessage }}
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
import ArsipSuratList from '../components/arsip-surat/ArsipSuratList.vue'
import ArsipSuratForm from '../components/arsip-surat/ArsipSuratForm.vue'
import NotulensiModal from '../components/arsip-surat/NotulensiModal.vue'
import { useDataStore } from '../stores/useDataStore'
import api from '../config/api'
import { triggerDownload } from '../utils/drive'
import type { SuratData, PegawaiData } from '../types/api'

// ─── STORES ──────────────────────────────────────────────
const dataStore = useDataStore()

// ─── STATE ───────────────────────────────────────────────
const isLoading = ref(false)
const isProcessing = ref(false)
const processingMessage = ref('')
const viewMode = ref<'list' | 'form'>('list')
const isEditMode = ref(false)
const showNotulensiModal = ref(false)

const suratList = ref<SuratData[]>([])
const pegawaiList = ref<PegawaiData[]>([])

const searchQuery = ref('')
const filterTipe = ref('Semua')
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

const successModal = ref({
  isOpen: false,
  fileSurat: '',
  fileNotulensi: '',
  title: '',
  nomorSurat: ''
})

const adminData = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('adminData') || '{}')
  } catch {
    return {}
  }
})

interface FormData {
  id: string
  timPoksi: string
  tipeSurat: 'Masuk' | 'Keluar'
  kategoriSurat: string
  sifatSurat: string
  nomorSurat: string
  tanggalMasuk: string
  tanggalSurat: string
  asalTujuan: string
  perihal: string
  tglAcaraMulai: string
  tglAcaraSelesai: string
  disposisiKe: string[]
  tglDisposisi: string
  tindakLanjut: string
  fileSurat: string
  fileNotulensi: string
  createdAt: string
}

const getDefaultForm = (): FormData => ({
  id: '',
  timPoksi: '',
  tipeSurat: 'Masuk',
  kategoriSurat: 'Surat Dinas',
  sifatSurat: 'Biasa',
  nomorSurat: '',
  tanggalMasuk: new Date().toISOString().split('T')[0],
  tanggalSurat: new Date().toISOString().split('T')[0],
  asalTujuan: '',
  perihal: '',
  tglAcaraMulai: '',
  tglAcaraSelesai: '',
  disposisiKe: [],
  tglDisposisi: '',
  tindakLanjut: '',
  fileSurat: '',
  fileNotulensi: '',
  createdAt: '',
})

const formData = ref<FormData>(getDefaultForm())

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

const fetchSurat = async (force = false) => {
  if (!force && dataStore.isCacheValid('surat') && suratList.value.length > 0) return

  isLoading.value = true
  try {
    const response = await api.get('/api/surat')
    const res = response.data
    if (res.status && res.data) {
      suratList.value = res.data
      dataStore.setSuratData(res.data)
    }
  } catch (err) {
    console.error('[SURAT] Fetch error:', err)
  } finally {
    isLoading.value = false
  }
}

const fetchPegawai = async () => {
  if (dataStore.isCacheValid('pegawai')) {
    pegawaiList.value = dataStore.pegawaiData
    return
  }
  try {
    const response = await api.get('/api/pegawai')
    const res = response.data
    if (res.status && res.data) {
      pegawaiList.value = res.data
      dataStore.setPegawaiData(res.data)
    }
  } catch (err) {
    console.error('[PEGAWAI] Fetch error:', err)
  }
}

const handleRefresh = async () => {
  dataStore.invalidateCache('surat')
  await fetchSurat(true)
}

const openPreview = (url: string) => {
  if (!url) return
  previewUrl.value = url
  showPreview.value = true
}

const openForm = (data: SuratData | null = null) => {
  if (data) {
    isEditMode.value = true
    formData.value = {
      ...getDefaultForm(),
      ...data,
      disposisiKe: Array.isArray(data.disposisiKe) ? [...data.disposisiKe] : [],
      tglAcaraMulai: data.tglAcaraMulai ? formatDateForInput(data.tglAcaraMulai) : '',
      tglAcaraSelesai: data.tglAcaraSelesai ? formatDateForInput(data.tglAcaraSelesai) : '',
      tglDisposisi: data.tglDisposisi ? formatDateForInput(data.tglDisposisi) : '',
      tanggalMasuk: formatDateForInput(data.tanggalMasuk),
      tanggalSurat: formatDateForInput(data.tanggalSurat),
      fileSurat: data.fileSurat ?? '',
      fileNotulensi: data.fileNotulensi ?? '',
      createdAt: data.createdAt ?? '',
    }
  } else {
    isEditMode.value = false
    formData.value = { ...getDefaultForm(), timPoksi: adminData.value.timPoksi ?? '' }
  }
  viewMode.value = 'form'
  showNotulensiModal.value = false
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const openNotulensiModal = (data: SuratData) => {
  isEditMode.value = true
  formData.value = {
    ...getDefaultForm(),
    ...data,
    disposisiKe: Array.isArray(data.disposisiKe) ? [...data.disposisiKe] : [],
    tglAcaraMulai: data.tglAcaraMulai ? formatDateForInput(data.tglAcaraMulai) : '',
    tglAcaraSelesai: data.tglAcaraSelesai ? formatDateForInput(data.tglAcaraSelesai) : '',
    tglDisposisi: data.tglDisposisi ? formatDateForInput(data.tglDisposisi) : '',
    tanggalMasuk: formatDateForInput(data.tanggalMasuk),
    tanggalSurat: formatDateForInput(data.tanggalSurat),
    fileSurat: data.fileSurat ?? '',
    fileNotulensi: data.fileNotulensi ?? '',
    createdAt: data.createdAt ?? '',
  }
  showNotulensiModal.value = true
  viewMode.value = 'list'
}

const closeForm = () => {
  viewMode.value = 'list'
  isEditMode.value = false
  showNotulensiModal.value = false
  formData.value = getDefaultForm()
}

const handleSubmit = async (updatedFormData: FormData, files: { fileSurat: File | null, fileNotulensi: File | null }) => {
  processingMessage.value = 'Menyimpan Data...'
  isProcessing.value = true
  try {
    const fd = new window.FormData()

    fd.append('data', JSON.stringify(updatedFormData))

    if (files.fileSurat) {
      fd.append('fileSurat', files.fileSurat)
    }

    if (files.fileNotulensi) {
      fd.append('fileNotulensi', files.fileNotulensi)
    }

    const response = await api.post('/api/surat', fd)
    const res = response.data

    isProcessing.value = false
    if (res.status) {
      successModal.value = {
        isOpen: true,
        fileSurat: res.data?.fileSurat || updatedFormData.fileSurat,
        fileNotulensi: res.data?.fileNotulensi || updatedFormData.fileNotulensi,
        title: isEditMode.value ? 'Data Berhasil Diperbarui' : 'Data Berhasil Disimpan',
        nomorSurat: updatedFormData.nomorSurat
      }

      dataStore.invalidateCache('surat')
      await fetchSurat(true)
      closeForm()
    } else {
      showNotification('error', 'Gagal Menyimpan', res.message)
    }
  } catch (err: unknown) {
    isProcessing.value = false
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan tidak terduga.'
    showNotification('error', 'Error!', message)
  }
}

const handleDelete = (id: string) => {
  showNotification(
    'confirm',
    'Hapus Arsip?',
    'Data yang dihapus tidak dapat dikembalikan dari database.',
    async () => {
      processingMessage.value = 'Menghapus Data...'
      isProcessing.value = true
      try {
        const response = await api.delete(`/api/surat/${id}`)
        const res = response.data
        isProcessing.value = false
        if (res.status) {
          showNotification('success', 'Berhasil', 'Arsip surat telah dihapus.')
          dataStore.invalidateCache('surat')
          await fetchSurat(true)
        } else {
          showNotification('error', 'Gagal Menghapus', res.message)
        }
      } catch (err: unknown) {
        isProcessing.value = false
        const message = err instanceof Error ? err.message : 'Terjadi kesalahan.'
        showNotification('error', 'Error!', message)
      }
    },
    'Hapus Permanen'
  )
}

onMounted(() => {
  fetchSurat()
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
