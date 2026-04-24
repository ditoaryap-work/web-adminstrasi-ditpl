<template>
  <div class="space-y-6 pb-12">
    <!-- View Mode: LIST -->
    <SpjList
      v-if="viewMode === 'list'"
      :sptjm-list="sptjmList"
      :is-loading="isLoading"
      v-model:search-query="searchQuery"
      v-model:current-page="currentPage"
      @add="openForm"
      @edit="openForm"
      @delete="handleDelete"
      @preview="openPreview"
      @refresh="handleRefresh"
    />

    <!-- View Mode: FORM -->
    <SpjForm
      v-else-if="viewMode === 'form'"
      :initial-data="formData"
      :is-edit-mode="isEditMode"
      :pegawai-options="pegawaiOptions"
      :sbm-options="sbmOptions"
      :pegawai-list="pegawaiList"
      :sbm-list="sbmList"
      :is-pegawai-loading="isPegawaiLoading"
      :is-sbm-loading="isSbmLoading"
      :is-submitting="isSubmitting"
      :processing-message="processingMessage"
      @cancel="closeForm"
      @save="handleSave"
      @notify="notify"
    />

    <!-- SUCCESS MODAL SPJ -->
    <Teleport to="body">
      <transition name="modal-fade">
        <div v-if="successModal.isOpen" class="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-gray-900/50" @click="successModal.isOpen = false" />
          <div v-motion :initial="{ opacity: 0, scale: 0.95, y: 12 }"
            :enter="{ opacity: 1, scale: 1, y: 0, transition: { duration: 200 } }"
            class="relative bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl">
            <div class="p-6 pb-2 text-center">
              <div class="w-14 h-14 rounded-full bg-emerald-50 mx-auto flex items-center justify-center mb-4">
                <CheckCircle :size="28" class="text-emerald-500" />
              </div>
              <h3 class="text-lg font-bold text-gray-800 mb-1">Kwitansi Berhasil Disimpan!</h3>
              <p class="text-sm text-gray-500">Dokumen SPJ telah direkam ke database.</p>
            </div>
            <div class="px-6 pb-2">
              <div class="grid grid-cols-2 gap-3">
                <div class="bg-gray-50 p-3.5 rounded-xl">
                  <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Pelaksana</p>
                  <p class="text-xs font-bold text-gray-800 truncate">{{ successModal.nama || '???' }}</p>
                </div>
                <div class="bg-emerald-50 p-3.5 rounded-xl">
                  <p class="text-[9px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Total Dibayar</p>
                  <p class="text-xs font-bold text-emerald-700">Rp {{ formatNumber(successModal.jumlah) }}</p>
                </div>
              </div>
            </div>
            <div class="p-5 pt-4 flex flex-col gap-2.5">
              <template v-if="successModal.fileUrl">
                <button
                  class="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2.5 hover:bg-blue-700 transition-colors text-sm"
                  @click="openPreview(successModal.fileUrl)">
                  <Eye :size="18" /> Preview Dokumen
                </button>
                <button
                  class="w-full py-3 bg-emerald-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2.5 hover:bg-emerald-600 transition-colors text-sm"
                  @click="openFile(successModal.fileUrl)">
                  <Download :size="18" /> Download PDF
                </button>
              </template>
              <p v-else class="text-center text-xs text-gray-400 font-semibold py-3">PDF sedang diproses...</p>
              <button
                class="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors"
                @click="successModal.isOpen = false">
                Tutup
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- Global Loading Overlay (Ported from Svelte) -->
    <ProcessingOverlay
      :is-processing="isSubmitting"
      title="Memproses Kwitansi SPJ"
      :message="processingMessage || 'Sistem sedang menyusun dokumen PDF dan mengunggahnya ke Google Drive. Mohon tunggu beberapa saat...'"
    />

    <!-- GLOBAL NOTIF -->
    <GlobalModal :is-open="notificationModal.isOpen" :type="notificationModal.type" :title="notificationModal.title"
      :message="notificationModal.message" :confirm-text="notificationModal.confirmText"
      @close="notificationModal.isOpen = false"
      @confirm="() => { if (notificationModal.onConfirm) notificationModal.onConfirm(); notificationModal.isOpen = false }" />

    <!-- File Preview Modal -->
    <FilePreviewModal :is-open="showPreview" :file-url="previewUrl" @close="showPreview = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { CheckCircle, Eye, Download } from 'lucide-vue-next'
import ProcessingOverlay from '../components/ProcessingOverlay.vue'
import GlobalModal from '../components/GlobalModal.vue'
import FilePreviewModal from '../components/FilePreviewModal.vue'
import SpjList from '../components/spj/SpjList.vue'
import SpjForm from '../components/spj/SpjForm.vue'
import { useDataStore } from '../stores/useDataStore'
import api, { fetchApi } from '../config/api'
import type { SpjData, PegawaiData, SbmData, ApiResponse, AdminData, SpjTiket } from '../types/api'

const store = useDataStore()

const adminData = computed<AdminData>(() => {
  try { return JSON.parse(localStorage.getItem('adminData') || '{}') }
  catch { return {} as AdminData }
})

// STATE
const viewMode = ref<'list' | 'form'>('list')
const isEditMode = ref(false)
const isLoading = ref(false)
const isSubmitting = ref(false)
const processingMessage = ref('')
const searchQuery = ref('')
const currentPage = ref(1)

const sptjmList = ref<SpjData[]>([]) 
const pegawaiList = ref<PegawaiData[]>([])
const sbmList = ref<SbmData[]>([])

const isPegawaiLoading = ref(false)
const isSbmLoading = ref(false)

// SUCCESS MODAL
const successModal = ref({
  isOpen: false,
  fileUrl: '',
  nama: '',
  jumlah: 0
})

// NOTIF
const notificationModal = ref({
  isOpen: false, type: 'success' as 'success' | 'error' | 'warning', title: '', message: '', confirmText: '',
  onConfirm: null as (() => void) | null | undefined
})
function notify(type: 'success' | 'error' | 'warning', title: string, message: string, onC: (() => void) | null = null, confirmText: string = 'Tutup') {
  notificationModal.value = { isOpen: true, type, title, message, onConfirm: onC, confirmText }
}

const emptyTiket = (): SpjTiket => ({ tgl: '', dari: '', ke: '', maskapai: '', kodeBooking: '', noTiket: '', harga: 0 })
const emptyForm = (): SpjData => ({
  id: '', nomorSt: '', asalInstansi: 'Direktorat Penyediaan Lahan', nip: '', nama: '', pangkatGol: '', gol: '',
  maksudTujuan: '', jumlahDibayar: 0, tujuan1: '', tujuan2: '', tujuan3: '',
  lamaTugas: '', tglBerangkat: '', tglKembali: '',
  uangHarian: [{ perhari: 0, hari: 0, total: 0 }],
  penginapan: [{ nama: '', perhari: 0, hari: 0, total: 0 }],
  transport: [{ perhari: 0, hari: 0, total: 0 }],
  tiketBerangkat: [emptyTiket()],
  tiketPulang: [emptyTiket()],
  taksi: 0, representasi: 0, uangLainnya: 0,
  noSpd: '',
  noUrutSpd: '',
  noAkun: '',
  kodeMak: '',
  kodeKapoksi: '',
  nomorLs: '',
  uraianPembayaran: '',
  jabatan: '', tingkatBiaya: '', kendaraan: 'Pesawat', tglPerintah: new Date().toISOString().split('T')[0],
  timPoksi: adminData.value?.timPoksi || '', fileLink: '', fileBukti: ''
})
const formData = ref<SpjData>(emptyForm())

function formatNumber(v: any) { return (Number(v) || 0).toLocaleString('id-ID') }

// LOOKUPS
const pegawaiOptions = computed(() => pegawaiList.value.map((p, idx) => ({ value: String(idx), label: `${p.namaLengkap} - ${p.jabatan || p.poksi || '-'}` })))
const sbmOptions = computed(() => sbmList.value.map(s => ({ value: s.kecKab, label: s.kecKab, subtitle: s.golongan })))

// FETCH
async function loadList() {
  isLoading.value = true
  try {
    const response = await api.get<ApiResponse<SpjData[]>>('/api/spj')
    if (response.data.status && response.data.data) {
      sptjmList.value = response.data.data
      store.setSpjData(response.data.data)
    }
  } catch (err) {
    console.error('[SPJ] loadList error:', err)
  } finally { isLoading.value = false }
}
async function loadPegawai() {
  isPegawaiLoading.value = true
  try {
    if (store.isCacheValid('pegawai')) {
      pegawaiList.value = store.pegawaiData
      return
    }
    const rs = await fetchApi<PegawaiData[]>('GET_PEGAWAI')
    if (rs.status && rs.data) {
      pegawaiList.value = rs.data
      store.setPegawaiData(rs.data)
    }
  } catch (e) {
    console.error('[SPJ] loadPegawai error:', e)
  } finally {
    isPegawaiLoading.value = false
  }
}
async function loadSbm() {
  isSbmLoading.value = true
  try {
    if (store.isCacheValid('sbm')) {
      sbmList.value = store.sbmData
      return
    }
    const rs = await fetchApi<SbmData[]>('GET_SBM')
    if (rs.status && rs.data) {
      sbmList.value = rs.data
      store.setSbmData(rs.data)
    }
  } catch (e) {
    console.error('[SPJ] loadSbm error:', e)
  } finally {
    isSbmLoading.value = false
  }
}

// ACTION
function openForm(item?: SpjData | Event) {
  // if button passes event it will be ignored as SpjData properties won't align. We'll do a safe check
  if (item && 'id' in item) {
    formData.value = JSON.parse(JSON.stringify(item))
    if (!formData.value.uangHarian?.length) formData.value.uangHarian = [{ perhari: 0, hari: 0, total: 0 }]
    if (!formData.value.penginapan?.length) formData.value.penginapan = [{ nama: '', perhari: 0, hari: 0, total: 0 }]
    if (!formData.value.transport?.length) formData.value.transport = [{ perhari: 0, hari: 0, total: 0 }]
    if (!formData.value.tiketBerangkat?.length) formData.value.tiketBerangkat = [emptyTiket()]
    if (!formData.value.tiketPulang?.length) formData.value.tiketPulang = [emptyTiket()]
    isEditMode.value = true
  } else {
    formData.value = emptyForm()
    isEditMode.value = false
  }
  viewMode.value = 'form'
}

function closeForm() { viewMode.value = 'list' }
function openFile(url: string) { window.open(url, '_blank') }

const showPreview = ref(false)
const previewUrl = ref('')
const handleRefresh = async () => {
  store.invalidateCache('spj')
  await loadList()
}

const openPreview = (url: string) => {
  if (!url) return
  previewUrl.value = url
  showPreview.value = true
}

async function handleSave(updatedFormData: SpjData, filesForUpload: File[]) {
  isSubmitting.value = true
  processingMessage.value = "Menyusun Kwitansi & Menyatukan File Bukti (Harap tunggu...)"
  
  try {
    const formDataObj = new FormData()

    formDataObj.append('data', JSON.stringify(updatedFormData))

    filesForUpload.forEach((file) => {
      formDataObj.append('files', file)
    })

    const response = await api.post<ApiResponse<any>>('/api/spj', formDataObj, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    if (response.data.status) {
      store.invalidateCache('spj')
      await loadList()
      const data = response.data.data
      const finalFileLink = data?.fileLink || ''

      successModal.value = {
        isOpen: true,
        fileUrl: finalFileLink,
        nama: updatedFormData.nama,
        jumlah: Number(updatedFormData.jumlahDibayar || 0)
      }
      closeForm()
    } else {
      notify('error', 'Gagal', response.data.message || 'Terjadi kesalahan sistem.')
    }
  } catch (err: any) {
    notify('error', 'Error Network', err.response?.data?.message || err.toString())
  } finally {
    isSubmitting.value = false
    processingMessage.value = ""
  }
}

async function handleDelete(id: string) {
  notify('warning', 'Hapus Data?', 'Kwitansi yang sudah dihapus tidak dapat direstore.', async () => {
    isSubmitting.value = true
    try {
      const response = await api.delete<ApiResponse<any>>(`/api/spj/${id}`)
      if (response.data.status) {
        store.invalidateCache('spj')
        await loadList()
        notify('success', 'Dihapus', 'Data SPJ telah dihapus dari PostgreSQL & Google Sheets.')
      }
      else notify('error', 'Gagal', response.data.message)
    } finally { isSubmitting.value = false }
  }, 'Ya, Hapus Saja')
}

onMounted(async () => {
  await Promise.all([loadList(), loadPegawai(), loadSbm()])
})
</script>

<style scoped>
/* Modal transition */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
