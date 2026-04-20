<template>
<div  v-motion :initial="{ opacity: 0, y: 10 }" :enter="{ opacity: 1, y: 0 }"
      class="max-w-5xl mx-auto space-y-6 pb-12">
      <button
        class="flex items-center gap-2 text-gray-500 hover:text-kementan-green transition-colors font-semibold text-sm bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 w-max"
        @click="closeForm">
        <ChevronLeft :size="18" /> Kembali ke Daftar SPTJM
      </button>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- FORM UTAMA -->
        <div class="lg:col-span-2 glass-card rounded-3xl overflow-hidden shadow-lg border border-gray-200">
          <div class="bg-gradient-to-r from-kementan-green to-emerald-700 px-8 py-6 text-white">
            <h2 class="text-2xl font-extrabold">
              {{ isEditMode ? 'Edit Dokumen SPTJM' : 'Rekam Bukti Tanggungjawab' }}
            </h2>
            <p class="text-emerald-100 font-medium text-sm mt-1">
              Lengkapi form sesuai rincian perjalanan dinas sebenarnya.
            </p>
          </div>

          <div class="p-8 space-y-8">
            <!-- Identitas -->
            <div class="space-y-5">
              <h4 class="text-xs font-bold text-kementan-green tracking-widest uppercase border-b border-gray-100 pb-2">
                Identitas Pelaksana
              </h4>
              <SearchableDropdown label="Pilih Pegawai (Ketik untuk mencari)" :options="pegawaiOptions"
                :value="selectedPegawaiId" placeholder="Contoh: Budi Santoso..." :is-loading="isPegawaiLoading"
                required @change="handlePegawaiChange" />
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">NIP</label>
                  <input type="text" readonly
                    class="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm font-medium text-gray-600 outline-none"
                    :value="formData.nip" placeholder="Otomatis">
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Jabatan</label>
                  <input type="text" readonly
                    class="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm font-medium text-gray-600 outline-none truncate"
                    :value="formData.jabatan" placeholder="Otomatis">
                </div>
              </div>
            </div>

            <!-- Ketentuan Perjalanan -->
            <div class="space-y-5">
              <h4 class="text-xs font-bold text-kementan-green tracking-widest uppercase border-b border-gray-100 pb-2">
                Ketentuan Perjalanan
              </h4>
              <div>
                <label class="block text-xs font-bold text-gray-600 uppercase mb-1.5">Tujuan Perjalanan <span
                    class="text-red-400">*</span></label>
                <input v-model="formData.tujuan" type="text"
                  class="w-full bg-white border border-gray-300 rounded-xl py-3 px-4 text-sm outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all font-medium"
                  placeholder="Contoh: Bogor, Jawa Barat">
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label class="block text-xs font-bold text-gray-600 uppercase mb-1.5">Mulai Tanggal <span
                      class="text-red-400">*</span></label>
                  <input v-model="formData.tanggalPerjalanan" type="date"
                    class="w-full bg-white border border-gray-300 rounded-xl py-3 px-4 text-sm outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all font-medium">
                </div>
                <div>
                  <label class="block text-xs font-bold text-gray-600 uppercase mb-1.5">Selesai Tanggal <span
                      class="text-red-400">*</span></label>
                  <input v-model="formData.tanggalKembali" type="date"
                    class="w-full bg-white border border-gray-300 rounded-xl py-3 px-4 text-sm outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all font-medium">
                </div>
              </div>
            </div>

            <!-- Rincian Nominal -->
            <div class="space-y-5">
              <h4 class="text-xs font-bold text-kementan-green tracking-widest uppercase border-b border-gray-100 pb-2">
                Rincian Nominal Rill
              </h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label class="block text-[10px] font-bold text-gray-600 uppercase mb-1.5">Tiket Berangkat (Rp)</label>
                  <input type="text" :value="formatNumberForInput(formData.tiketBerangkat)"
                    class="w-full bg-white border border-gray-300 rounded-xl py-3 px-4 text-sm outline-none focus:border-kementan-green font-medium"
                    placeholder="contoh: 1.500.000"
                    @input="(e: Event) => updateNumberField('tiketBerangkat', (e.target as HTMLInputElement).value)">
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-gray-600 uppercase mb-1.5">Tiket Pulang (Rp)</label>
                  <input type="text" :value="formatNumberForInput(formData.tiketPulang)"
                    class="w-full bg-white border border-gray-300 rounded-xl py-3 px-4 text-sm outline-none focus:border-kementan-green font-medium"
                    placeholder="contoh: 1.500.000"
                    @input="(e: Event) => updateNumberField('tiketPulang', (e.target as HTMLInputElement).value)">
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-gray-600 uppercase mb-1.5">Biaya Tiket Pesawat (Ekonomi
                    SBM
                    - Rp)</label>
                  <input type="text" :value="formatNumberForInput(formData.biayaSbm)"
                    class="w-full bg-white border border-gray-300 rounded-xl py-3 px-4 text-sm outline-none focus:border-blue-500 font-medium"
                    placeholder="Otomatis dari CEK SBM"
                    @input="(e: Event) => updateNumberField('biayaSbm', (e.target as HTMLInputElement).value)">
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-gray-600 uppercase mb-1.5">Total Keseluruhan</label>
                  <div class="relative">
                    <input type="text" readonly :value="'Rp ' + formatNumber(totalSum)"
                      class="w-full bg-emerald-50 border border-emerald-200 rounded-xl py-3 px-4 text-sm font-bold text-emerald-800 outline-none">
                    <span
                      class="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-emerald-600 font-bold">OTOMATIS</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Penandatanganan -->
            <div class="space-y-5">
              <h4 class="text-xs font-bold text-kementan-green tracking-widest uppercase border-b border-gray-100 pb-2">
                Penandatanganan
              </h4>
              <div class="md:w-1/2">
                <label class="block text-xs font-bold text-gray-600 uppercase mb-1.5">Tanggal Surat Dibuat <span
                    class="text-red-400">*</span></label>
                <input v-model="formData.tanggalTtd" type="date"
                  class="w-full bg-white border border-gray-300 rounded-xl py-3 px-4 text-sm outline-none focus:border-kementan-green font-medium">
              </div>
            </div>

            <div class="pt-6 border-t border-gray-100 flex gap-4">
              <button type="button"
                class="px-6 py-3.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm w-40"
                @click="closeForm">
                Batal
              </button>
              <button :disabled="isSubmitting || !formData.nip"
                class="flex-1 px-6 py-3.5 bg-kementan-green text-white font-bold rounded-xl hover:bg-[#004d26] transition-colors flex justify-center items-center gap-2 shadow-md shadow-kementan-green/20 disabled:opacity-70 disabled:cursor-not-allowed text-sm"
                @click="handleSave">
                <template v-if="isSubmitting">
                  <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Menyimpan & Menyusun PDF...</span>
                </template>
                <template v-else>
                  <Save :size="18" /> Simpan SPTJM
                </template>
              </button>
            </div>
          </div>
        </div>

        <!-- SBM LOOKUP PANEL -->
        <div class="space-y-4">
          <div class="glass-card rounded-2xl p-6 border border-gray-200 shadow-sm sticky top-6">
            <div class="flex items-center gap-2 text-blue-600 mb-4 border-b border-gray-100 pb-3">
              <Search :size="18" />
              <h3 class="font-extrabold text-sm uppercase tracking-wider">
                Cek Data SBM
              </h3>
            </div>

            <div class="space-y-4">
              <SearchableDropdown v-model:value="sbmQuery" label="Ketik Nama Kota/Kabupaten" :options="sbmOptions"
                placeholder="Contoh: Bogor" :is-loading="isSbmLoading" />

              <transition name="fade">
                <div v-if="selectedSbm" class="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-4 mt-4">
                  <div>
                    <p class="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">
                      Tujuan Spesifik
                    </p>
                    <p class="text-sm font-bold text-blue-900 leading-tight">
                      {{ selectedSbm.tujuanLengkap || "-" }}
                    </p>
                  </div>
                  <div class="pt-3 border-t border-blue-100/50">
                    <p class="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">
                      Tiket Ekonomi SBM
                    </p>
                    <p class="text-2xl font-black text-blue-600">
                      {{ formatSbmVal(selectedSbm.tiketEkonomi) }}
                    </p>
                    <p class="text-[9px] text-blue-400 font-medium mt-1">
                      *Nilai referensi untuk perbandingan SPTJM
                    </p>
                  </div>

                  <button type="button"
                    class="w-full mt-2 py-3 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-md hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                    @click="handleApplySbm">
                    <Plus :size="14" /> Terapkan ke Form
                  </button>
                </div>
                <div v-else class="bg-gray-50 border border-gray-100 rounded-xl p-6 text-center mt-4">
                  <p class="text-[10px] text-gray-400 font-medium leading-relaxed uppercase tracking-wider">
                    Cari kota tujuan untuk melihat referensi biaya perjalanan sesuai standar (SBM).
                  </p>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- SUCCESS MODAL -->
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
              <h3 class="text-lg font-bold text-gray-800 mb-1">
                SPTJM Berhasil Disimpan!
              </h3>
              <p class="text-sm text-gray-500">
                Dokumen telah direkam ke database pusat.
              </p>
            </div>

            <div class="px-6 pb-2">
              <div class="grid grid-cols-2 gap-3">
                <div class="bg-gray-50 p-3.5 rounded-xl">
                  <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Pelaksana
                  </p>
                  <p class="text-xs font-bold text-gray-800 truncate">
                    {{ successModal.item?.namaLengkap || '???' }}
                  </p>
                </div>
                <div class="bg-emerald-50 p-3.5 rounded-xl">
                  <p class="text-[9px] font-bold text-emerald-400 uppercase tracking-widest mb-1">
                    Total Biaya
                  </p>
                  <p class="text-xs font-bold text-emerald-700">
                    Rp {{ formatNumber(successModal.item?.totalBiaya) }}
                  </p>
                </div>
              </div>
            </div>
            <div class="p-5 pt-4 flex flex-col gap-2.5">
              <template v-if="successModal.item?.fileLink">
                <button
                  class="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2.5 hover:bg-blue-700 transition-colors text-sm"
                  @click="openPreview(successModal.item!.fileLink)">
                  <Eye :size="18" /> Preview Dokumen
                </button>
                <button
                  class="w-full py-3 bg-emerald-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2.5 hover:bg-emerald-600 transition-colors text-sm"
                  @click="triggerDownload(successModal.item!.fileLink, `SPTJM_${successModal.item?.namaLengkap?.replace(/\s+/g, '_')}`)">
                  <Download :size="18" /> Download PDF
                </button>
              </template>
              <p v-else class="text-center text-xs text-gray-400 font-semibold py-3">
                PDF sedang diproses...
              </p>
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ChevronLeft, Plus, Trash2, Save, Search, CheckCircle, Eye, Download } from 'lucide-vue-next'
import SearchableDropdown from '../SearchableDropdown.vue'
import { triggerDownload } from '../../utils/drive'
import api from '../../config/api'

const props = defineProps<{
  initialData: any
  isEditMode: boolean
  isProcessing: boolean
  pegawaiOptions: any[]
  isPegawaiLoading: boolean
  selectedPegawaiId: string
}>()

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'save', formData: any): void
  (e: 'pegawaiChange', id: string): void
}>()

const formData = ref<any>(JSON.parse(JSON.stringify(props.initialData)))

// --- Missing variable declarations ---
const isSubmitting = ref(false)
const sbmQuery = ref('')
const isSbmLoading = ref(false)
const sbmOptions = ref<any[]>([])
const selectedSbm = ref<any>(null)
const successModal = ref<{
  isOpen: boolean
  item: { namaLengkap?: string; totalBiaya?: number; fileLink?: string } | null
}>({
  isOpen: false,
  item: null
})

const fullSbmList = ref<any[]>([])

// Sync formData when parent updates initialData (critical for auto-fill NIP/Jabatan)
watch(() => props.initialData, (newVal) => {
  formData.value = JSON.parse(JSON.stringify(newVal))
}, { deep: true })

// Update selectedSbm panel when dropdown value changes
watch(sbmQuery, (newVal) => {
  if (!newVal) {
    selectedSbm.value = null
    return
  }
  const item = fullSbmList.value.find(s => String(s.id) === String(newVal))
  if (item) {
    const extraData = item.data || {}
    selectedSbm.value = {
      ...item,
      tujuanLengkap: item.kecKab,
      tiketEkonomi: extraData.tiketEkonomi || extraData.pEkonomi || 0, 
      tiketBisnis: extraData.tiketBisnis || extraData.pBisnis || 0,
      taxiJakarta: extraData.taxiJakarta || 0,
      taxiDaerah: extraData.taxiDaerah || 0,
      uangHarian: item.uangHarian || 0
    }
  }
})

const fetchSbmList = async () => {
  isSbmLoading.value = true
  try {
    console.log('[SptjmForm] Menarik data SBM...');
    const response = await api.get('/api/sbm')
    const res = response.data
    console.log('[SptjmForm] Respon SBM:', res);
    if (res.status && res.data) {
      fullSbmList.value = res.data
      sbmOptions.value = res.data.map((item: any) => ({
        label: item.kecKab,
        value: item.id
      }))
      console.log(`[SptjmForm] ${sbmOptions.value.length} lokasi SBM dimuat.`);
    }
  } catch (err) {
    console.error('[SptjmForm] Gagal memuat SBM:', err);
  } finally {
    isSbmLoading.value = false
  }
}

// --- Number formatting ---
// --- Number formatting helper that handles both DB strings (480000.00) and manual inputs (480.000)
const parseVal = (val: any): number => {
  if (typeof val === 'number') return val
  if (!val) return 0
  const s = String(val).trim()
  
  // Case A: Format database "150000.00" (Drizzle/Numeric return)
  // Memiliki tepat satu titik, tidak ada koma, dan 2 angka di belakang titik
  const parts = s.split('.')
  if (parts.length === 2 && parts[1].length === 2 && !s.includes(',')) {
    return Math.floor(parseFloat(s))
  }
  
  // Case B: Format input Indonesia "200.000" (Thousands separator is dot)
  // Kita hapus semua titik, karena di sistem ini input uang tidak pakai desimal koma
  const cleanStr = s.replace(/\./g, '')
  const num = parseInt(cleanStr.replace(/\D/g, ''), 10)
  return isNaN(num) ? 0 : num
}

const formatNumber = (val: any): string => {
  const num = parseVal(val)
  return new Intl.NumberFormat('id-ID').format(num)
}

const formatNumberForInput = (val: any): string => {
  const num = parseVal(val)
  if (num === 0) return ''
  return new Intl.NumberFormat('id-ID').format(num)
}

const formatSbmVal = (val: any): string => {
  const num = parseVal(val)
  if (num === 0) return '-'
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(num)
}

const updateNumberField = (field: string, value: string) => {
  const num = parseInt(value.replace(/\D/g, ''), 10)
  formData.value[field] = isNaN(num) ? '' : num.toString()
}

// --- Pegawai handler moved ---

// --- Sum calculations ---
const sumToNumber = (val: any): number => {
    return parseVal(val)
}

const totalSum = computed(() => {
    return sumToNumber(formData.value.tiketBerangkat) +
           sumToNumber(formData.value.tiketPulang)
})

// --- SBM Lookup ---
const handleApplySbm = () => {
  if (!selectedSbm.value) return
  formData.value.tujuan = selectedSbm.value.tujuanLengkap || formData.value.tujuan
  formData.value.biayaSbm = selectedSbm.value.tiketEkonomi?.toString() || ''
}

// --- Save ---
const handleSave = () => {
    // 1. Koreksi Total Simpan: Gunakan totalSum (Berangkat + Pulang)
    formData.value.totalBiaya = totalSum.value.toString()
    
    const payload = JSON.parse(JSON.stringify(formData.value))
    
    // 2. Hapus ID Kosong: Agar database bisa generate UUID otomatis untuk data baru
    if (payload.id === "") {
        delete payload.id
    }
    
    emit('save', payload)
}

const openPreview = (url: string) => {
  if (!url) return
  window.open(url, '_blank')
}

const closeForm = () => emit('cancel')

const handlePegawaiChange = (id: string) => {
  emit('pegawaiChange', id)
}

onMounted(() => {
  fetchSbmList()
})
</script>