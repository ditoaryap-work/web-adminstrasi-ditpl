<template>
  <div class="space-y-6 pb-12">
    <!-- View Mode: LIST -->
    <div v-if="viewMode === 'list'" class="space-y-6">
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div v-motion :initial="{ opacity: 0, x: -20 }" :enter="{ opacity: 1, x: 0 }">
          <div class="flex items-center gap-3 mb-2 text-kementan-green">
            <FileText :size="20" />
            <span class="text-xs font-bold tracking-[0.3em] uppercase">Arsip Kedinasan</span>
          </div>
          <h1 class="text-3xl font-extrabold text-gray-800">Manajer SPT</h1>
          <p class="text-gray-500 mt-2 text-sm max-w-lg font-medium">
            Kelola, terbitkan, dan simpan arsip Surat Perintah Tugas (SPT) Direktorat.
          </p>
        </div>

        <button 
          @click="openForm()"
          class="bg-kementan-green text-white px-6 py-3 rounded-xl font-bold shadow-md shadow-kementan-green/20 flex items-center gap-3 hover:bg-[#004d26] transition-all"
        >
          <Plus :size="20" />
          <span>Buat SPT Baru</span>
        </button>
      </div>

      <!-- Filter & Search -->
      <div v-motion :initial="{ opacity: 0, y: 10 }" :enter="{ opacity: 1, y: 0 }" class="glass-card p-4 rounded-2xl flex flex-col lg:flex-row gap-4">
        <div class="relative flex-1">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" :size="18" />
          <input 
            type="text" 
            placeholder="Cari berdasarkan nomor surat atau maksud perjalanan..." 
            v-model="searchQuery"
            class="w-full bg-white border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-gray-800 outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all shadow-sm text-sm font-medium placeholder:text-gray-400"
          />
        </div>
      </div>

      <!-- Table Section -->
      <div class="glass-card rounded-3xl overflow-hidden shadow-md border-gray-200 min-h-[400px] relative">
        <div v-if="isLoading && sptList.length === 0" class="flex flex-col items-center justify-center py-20 bg-white/50 h-full absolute inset-0">
          <div class="w-10 h-10 border-4 border-kementan-green/20 border-t-kementan-green rounded-full animate-spin"></div>
          <p class="mt-4 text-sm font-bold text-gray-500 uppercase tracking-widest animate-pulse">Memuat Data...</p>
        </div>
        
        <div v-else class="overflow-x-auto custom-scrollbar">
          <table class="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr class="bg-gray-50/80 text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] border-b border-gray-200">
                <th class="py-6 px-8">Data Dokumen</th>
                <th class="py-6 px-8 text-center px-4">Peserta</th>
                <th class="py-6 px-8">Maksud Perjalanan & Tujuan</th>
                <th class="py-6 px-8 text-center">Aksi Dokumen</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white/40">
              <template v-if="paginatedList.length > 0">
                <tr 
                  v-for="(spt, i) in paginatedList" 
                  :key="spt.id_spt"
                  class="group hover:bg-emerald-50/30 transition-colors"
                >
                  <td class="py-6 px-8">
                    <div>
                      <div 
                        class="inline-block px-2 py-0.5 rounded-md text-[9px] font-bold mb-1 tracking-widest uppercase border"
                        :class="spt.status === 'Draft' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'"
                      >
                        {{ spt.status }}
                      </div>
                      <p class="text-sm font-bold text-gray-800">{{ spt.no || '[Nomor Belum Diisi]' }}</p>
                      <p class="text-[10px] text-gray-500 font-bold tracking-widest mt-1 uppercase">{{ formatIndoDate(spt.tanggal_surat) }}</p>
                    </div>
                  </td>
                  <td class="py-6 px-8 text-center">
                    <div class="flex flex-col items-center gap-1">
                      <div class="inline-block px-3 py-1 rounded-full text-[10px] font-bold border border-gray-200 bg-gray-50 uppercase tracking-tighter">
                        {{ spt.peserta_count }} Peserta
                      </div>
                      <span class="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                        {{ spt.peserta_count > 5 ? 'Template Lampiran' : 'Template Lembar 1' }}
                      </span>
                    </div>
                  </td>
                  <td class="py-6 px-8">
                    <div class="max-w-md">
                      <p class="text-xs text-gray-600 leading-relaxed font-medium line-clamp-2">{{ spt.maksud_perjalanan }}</p>
                      <p class="text-[10px] text-kementan-green font-bold mt-1 uppercase tracking-widest">{{ spt.peserta?.[0]?.tujuan || '-' }}</p>
                    </div>
                  </td>
                  <td class="py-6 px-8">
                    <div class="flex items-center justify-center gap-3">
                      <button v-if="spt.file_link" @click="openFile(spt.file_link)" class="px-3 py-2 bg-blue-50 text-blue-700 rounded-xl border border-blue-200 hover:bg-blue-100 transition-colors font-bold text-xs flex items-center gap-2 shadow-sm">
                        <Download :size="14" /> Download
                      </button>
                      <span v-else class="text-[9px] font-bold text-gray-400 uppercase">No PDF</span>
                      <button @click="openForm(spt)" class="p-2.5 bg-white rounded-xl text-gray-400 border border-gray-200 hover:text-kementan-green shadow-sm transition-all">
                        <Edit :size="16" />
                      </button>
                      <button @click="handleDelete(spt.id_spt)" class="p-2.5 bg-white rounded-xl text-gray-400 border border-gray-200 hover:text-red-500 shadow-sm transition-all">
                        <Trash2 :size="16" />
                      </button>
                    </div>
                  </td>
                </tr>
              </template>
              <tr v-else>
                <td colspan="4" class="py-16 text-center text-gray-400 font-medium">Berdasarkan pencarian, tidak ditemukan data SPT yang sesuai.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="filteredList.length > 0 && !isLoading" class="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50/50">
          <p class="text-xs text-gray-500 font-medium">
            Menampilkan <span class="font-bold text-gray-700">{{ (safePage - 1) * ITEMS_PER_PAGE + 1 }}–{{ Math.min(safePage * ITEMS_PER_PAGE, filteredList.length) }}</span> dari <span class="font-bold text-gray-700">{{ filteredList.length }}</span>
          </p>
          <div class="flex gap-1">
            <button :disabled="safePage <= 1" @click="currentPage--" class="p-1.5 rounded-lg border bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-30"><ChevronLeft :size="16" /></button>
            <button :disabled="safePage >= totalPages" @click="currentPage++" class="p-1.5 rounded-lg border bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-30"><ChevronRight :size="16" /></button>
          </div>
        </div>
      </div>
    </div>

    <!-- View Mode: FORM -->
    <div v-else-if="viewMode === 'form'" v-motion :initial="{ opacity: 0, y: 10 }" :enter="{ opacity: 1, y: 0 }" class="max-w-5xl mx-auto space-y-6 pb-12">
      <button @click="closeForm" class="flex items-center gap-2 text-gray-500 hover:text-kementan-green transition-colors font-semibold text-sm bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 w-max">
        <ChevronLeft :size="18" /> Kembali ke Daftar SPT
      </button>

      <div class="glass-card rounded-3xl overflow-hidden shadow-lg border border-gray-200">
        <div class="bg-gradient-to-r from-emerald-600 to-kementan-green px-8 py-7 text-white relative overflow-hidden">
          <div class="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
             <FileText :size="200" />
          </div>
          <h2 class="text-2xl font-extrabold">{{ isEditMode ? 'Edit Dokumen SPT' : 'Buat Surat Perintah Tugas Baru' }}</h2>
          <p class="text-emerald-50 font-medium text-sm mt-1 opacity-90">Dokumen penugasan resmi untuk perjalanan dinas luar wilayah.</p>
        </div>

        <div class="p-8 space-y-10">
          <!-- INFORMASI DASAR -->
          <div class="space-y-6">
            <div class="flex items-center gap-3 border-b border-gray-100 pb-3">
               <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><FileText :size="18" /></div>
               <h4 class="text-xs font-black text-gray-700 tracking-widest uppercase">Informasi Dasar Dokumen</h4>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Nomor Surat Tugas <span class="text-red-400">*</span></label>
                <input 
                  type="text" 
                  v-model="formData.no" 
                  class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all font-bold placeholder:text-gray-300" 
                  placeholder="Contoh: 147.6/TU-040/J.4/11/2025" 
                />
              </div>
              <div>
                <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Tanggal Surat <span class="text-red-400">*</span></label>
                <input 
                  type="date" 
                  v-model="formData.tanggal_surat" 
                  class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 font-bold transition-all" 
                />
              </div>
            </div>

            <div>
              <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Maksud Perjalanan / Dasar Penugasan <span class="text-red-400">*</span></label>
              <textarea 
                v-model="formData.maksud_perjalanan" 
                rows="3"
                class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all font-medium leading-relaxed"
                placeholder="Jelaskan tujuan dan landasan hukum kegiatan penugasan ini..."
              ></textarea>
            </div>
          </div>

          <!-- PESERTA PENUGASAN -->
          <div class="space-y-6">
            <div class="flex items-center justify-between border-b border-gray-100 pb-3">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><Users :size="18" /></div>
                <h4 class="text-xs font-black text-gray-700 tracking-widest uppercase">Peserta Penugasan</h4>
              </div>
              <div 
                class="px-3 py-1 rounded-full text-[10px] font-black tracking-widest border"
                :class="formData.peserta.length > 5 ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-emerald-50 text-kementan-green border-emerald-100'"
              >
                {{ formData.peserta.length > 5 ? 'FORMAT LAMPIRAN (2 HALAMAN)' : 'FORMAT BODY (1 HALAMAN)' }}
              </div>
            </div>

            <div class="space-y-4">
              <div v-if="formData.peserta.length === 0" class="py-12 border-2 border-dashed border-gray-100 rounded-3xl text-center space-y-4">
                 <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                    <UserPlus :size="32" />
                 </div>
                 <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">Belum ada peserta terpilih</p>
              </div>

              <div v-else class="space-y-3">
                 <div 
                  v-for="(p, idx) in formData.peserta" 
                  :key="idx"
                  class="bg-gray-50 border border-gray-100 p-5 rounded-2xl space-y-3"
                 >
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-3 min-w-0">
                         <div class="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[10px] font-black text-gray-500 shrink-0">
                            {{ idx + 1 }}
                         </div>
                         <div class="min-w-0">
                            <p class="text-xs font-bold text-gray-800 truncate">{{ p.nama_lengkap }}</p>
                            <p class="text-[9px] text-gray-400 font-bold uppercase">{{ p.nip }} · {{ p.pangkat_gol || '-' }}</p>
                         </div>
                      </div>
                      <button @click="removeParticipant(idx)" class="p-2 text-gray-300 hover:text-red-500 transition-colors">
                         <X :size="16" />
                      </button>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label class="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Tujuan</label>
                        <input type="text" v-model="p.tujuan" class="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-xs font-bold outline-none focus:border-kementan-green transition-all" placeholder="Contoh: Bogor" />
                      </div>
                      <div>
                        <label class="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Waktu Pelaksanaan</label>
                        <input type="text" v-model="p.tanggal_pelaksanaan" class="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-xs font-bold outline-none focus:border-kementan-green transition-all" placeholder="24 – 30 Des 2025" />
                      </div>
                    </div>
                 </div>
              </div>

              <div class="pt-2">
                 <SearchableDropdown
                   label="Cari & Tambah Peserta"
                   :options="pegawaiOptions"
                   v-model:value="participantSelector"
                   @change="addParticipant"
                   placeholder="Ketik nama atau NIP pegawai..."
                 />
              </div>
            </div>
          </div>

          <!-- MAK -->
          <div class="space-y-6">
            <div class="flex items-center gap-3 border-b border-gray-100 pb-3">
               <div class="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center"><FileText :size="18" /></div>
               <h4 class="text-xs font-black text-gray-700 tracking-widest uppercase">Kode MAK</h4>
            </div>
            <div>
              <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">MAK (Mata Anggaran Keluaran)</label>
              <input 
                type="text" 
                v-model="formData.mak" 
                class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all font-bold" 
                placeholder="Contoh: MAK 7012.EAH.001.054.A.524111" 
              />
            </div>
          </div>

          <!-- FOOTER ACTIONS -->
          <div class="pt-8 border-t border-gray-100 flex gap-4">
            <button @click="closeForm" type="button" class="px-6 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-colors text-xs uppercase tracking-widest w-40">Batal</button>
            <button 
              @click="handleSave" 
              :disabled="isSubmitting || !formData.no || formData.peserta.length === 0" 
              class="flex-1 px-6 py-4 bg-kementan-green text-white font-black rounded-2xl hover:bg-[#004d26] transition-all flex justify-center items-center gap-3 shadow-xl shadow-kementan-green/30 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed text-xs uppercase tracking-widest"
            >
              <template v-if="isSubmitting">
                <div class="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Dalam Proses...</span>
              </template>
              <template v-else><Save :size="18" /> Simpan & Finalkan SPT</template>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- SUCCESS MODAL -->
    <Teleport to="body">
      <transition name="modal-bounce">
        <div v-if="successModal.isOpen" class="fixed inset-0 z-[10000] flex items-center justify-center p-6">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-xl" @click="successModal.isOpen = false"></div>
          
          <div 
            v-motion
            :initial="{ opacity: 0, scale: 0.8, y: 50 }"
            :enter="{ opacity: 1, scale: 1, y: 0 }"
            class="relative bg-white rounded-[3rem] w-full max-w-lg overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)]"
          >
            <div class="bg-gradient-to-br from-emerald-500 to-kementan-green p-12 text-center text-white relative">
               <div class="absolute inset-0 opacity-10" style="background-image: url('https://www.transparenttextures.com/patterns/leaf.png')"></div>
               <div class="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-[2.5rem] mx-auto flex items-center justify-center border border-white/40 shadow-2xl mb-8">
                  <CheckCircle :size="54" />
               </div>
               <h3 class="text-3xl font-black mb-2 tracking-tight">SPT Berhasil!</h3>
               <p class="text-emerald-50 text-sm font-medium opacity-80 uppercase tracking-widest whitespace-nowrap">Dokumen Telah Diarsipkan</p>
            </div>

            <div class="p-10 space-y-8">
              <div class="grid grid-cols-2 gap-4">
                 <div class="bg-gray-50/80 p-5 rounded-3xl border border-gray-100/50">
                    <p class="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Nomor Surat</p>
                    <p class="text-sm font-black text-gray-800">{{ successModal.item?.no }}</p>
                 </div>
                 <div class="bg-blue-50/50 p-5 rounded-3xl border border-blue-100/50">
                    <p class="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] mb-2 px-1">Peserta</p>
                    <p class="text-sm font-black text-blue-700">{{ successModal.item?.peserta_count }} Orang</p>
                 </div>
              </div>
              <div class="space-y-3">
                 <button 
                  v-if="successModal.item?.file_link"
                  @click="openFile(successModal.item.file_link)" 
                  class="w-full py-5 bg-kementan-green text-white rounded-[1.5rem] font-bold flex items-center justify-center gap-4 shadow-lg shadow-kementan-green/20 hover:bg-[#004d26] transition-all active:scale-95 text-sm uppercase tracking-widest"
                 >
                    <Download :size="20" /> Download File PDF
                 </button>
                 <p v-else class="text-center text-xs text-gray-400 font-bold uppercase tracking-widest py-4">PDF sedang diproses...</p>
                 <button 
                   @click="successModal.isOpen = false" 
                   class="w-full py-4 bg-gray-50 text-gray-500 border border-gray-100 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-white hover:text-red-500 transition-all shadow-sm"
                 >
                    Tutup
                 </button>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- Global Notifications Modal -->
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
import { 
  FileText, Search, Plus, Edit, Trash2, X, ChevronLeft, ChevronRight, 
  Save, Download, CheckCircle, Users, UserPlus, ExternalLink
} from 'lucide-vue-next'
import { GAS_URL } from '../config/api'
import GlobalModal from '../components/GlobalModal.vue'
import SearchableDropdown from '../components/SearchableDropdown.vue'

const ITEMS_PER_PAGE = 10

// State
const sptList = ref([])
const pegawaiList = ref([])
const isLoading = ref(true)
const searchQuery = ref('')
const currentPage = ref(1)
const viewMode = ref('list')
const isEditMode = ref(false)
const isSubmitting = ref(false)
const adminProfile = ref(null)

const participantSelector = ref('')

const formData = ref({
  id_spt: '',
  no: '',
  tanggal_surat: '',
  maksud_perjalanan: '',
  peserta: [],
  status: 'Final',
  tim_poksi: '',
  mak: ''
})

const successModal = ref({
  isOpen: false,
  item: null
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
  const storedData = localStorage.getItem('adminData')
  if (storedData) {
    adminProfile.value = JSON.parse(storedData)
  }
  fetchData()
})

watch(searchQuery, () => {
  currentPage.value = 1
})

// Methods
const fetchData = async () => {
  isLoading.value = true
  const tim_poksi = adminProfile.value?.tim_poksi || ''
  try {
    const [resSpt, resPegawai] = await Promise.all([
      fetch(GAS_URL, { method: "POST", body: JSON.stringify({ action: "GET_SPT_LIST", tim_poksi }) }),
      fetch(GAS_URL, { method: "POST", body: JSON.stringify({ action: "GET_PEGAWAI" }) })
    ])
    
    const [dataSpt, dataPegawai] = await Promise.all([resSpt.json(), resPegawai.json()])
    
    if (dataSpt.success) sptList.value = dataSpt.data
    if (dataPegawai.success) pegawaiList.value = dataPegawai.data
  } catch (err) {
    console.error("Gagal menarik data:", err)
    showNotification('error', 'Gagal Menarik Data', 'Terjadi kesalahan saat menghubungkan ke server.')
  } finally {
    isLoading.value = false
  }
}

const openForm = (data = null) => {
  if (data) {
    formData.value = { 
      ...data,
      peserta: Array.isArray(data.peserta) ? [...data.peserta] : []
    }
    isEditMode.value = true
  } else {
    formData.value = {
      id_spt: '',
      no: '',
      tanggal_surat: new Date().toISOString().split('T')[0],
      maksud_perjalanan: '',
      peserta: [],
      status: 'Final',
      tim_poksi: adminProfile.value?.tim_poksi || '',
      mak: ''
    }
    isEditMode.value = false
  }
  participantSelector.value = ''
  viewMode.value = 'form'
}

const closeForm = () => {
  viewMode.value = 'list'
}

const addParticipant = (nip) => {
  if (!nip) return
  // Check if exists
  if (formData.value.peserta.some(p => p.nip === nip)) {
    showNotification('warning', 'Duplikasi Peserta', 'Pegawai ini sudah ada di daftar peserta.')
    participantSelector.value = ''
    return
  }

  const p = pegawaiList.value.find(p => p.nip === nip)
  if (p) {
    let extractedGol = '-'
    if (p.golongan) {
      const match = p.golongan.match(/[IVX]+/i)
      if (match) extractedGol = match[0].toUpperCase()
    }

    formData.value.peserta.push({
      nama_lengkap: p.nama_lengkap,
      nip: p.nip,
      pangkat_gol: extractedGol,
      jabatan: p.jabatan,
      tujuan: '',
      tanggal_pelaksanaan: ''
    })
  }
  participantSelector.value = ''
}

const removeParticipant = (index) => {
  formData.value.peserta.splice(index, 1)
}

const handleSave = async () => {
  if (formData.value.peserta.length === 0) {
    showNotification('warning', 'Peserta Kosong', 'Harap masukkan minimal satu peserta penugasan.')
    return
  }

  isSubmitting.value = true
  try {
    const response = await fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify({ 
        action: "SAVE_SPT", 
        data: {
          ...formData.value,
          peserta_count: formData.value.peserta.length
        } 
      })
    })
    const result = await response.json()
    
    if (result.success) {
      var savedItem = { ...formData.value, peserta_count: formData.value.peserta.length }
      if (result.data?.file_link) savedItem.file_link = result.data.file_link
      successModal.value = { isOpen: true, item: savedItem }
      closeForm()
      fetchData()
    } else {
      showNotification('error', 'Gagal Menyimpan', result.message || 'Terjadi kesalahan pada server.')
    }
  } catch (error) {
    showNotification('error', 'Jaringan Error', 'Gagal menghubungi server. Pastikan koneksi internet stabil.')
  } finally {
    isSubmitting.value = false
  }
}

const handleDelete = (id) => {
  showNotification(
    'confirm', 
    'Konfirmasi Hapus', 
    'Apakah Anda yakin ingin menghapus arsip SPT ini? Tindakan ini tidak dapat dibatalkan.',
    async () => {
      try {
        const response = await fetch(GAS_URL, {
          method: "POST",
          body: JSON.stringify({ action: "DELETE_SPT", id_spt: id })
        })
        const result = await response.json()
        if (result.success) {
          fetchData()
          showNotification('success', 'Hapus Berhasil', 'Arsip SPT telah dihapus dari sistem.')
        } else {
          showNotification('error', 'Hapus Gagal', result.message)
        }
      } catch (error) {
        showNotification('error', 'Gagal', 'Terjadi kesalahan jaringan saat menghapus.')
      }
    }
  )
}

const openFile = (url) => {
  if (!url) return
  window.open(url, '_blank')
}

const showSuccessModal = (item) => {
  successModal.value = { isOpen: true, item: { ...item } }
}

const formatIndoDate = (isoDate) => {
  if (!isoDate) return '-'
  try {
    const d = new Date(isoDate)
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch (e) { return isoDate }
}

// Computed
const filteredList = computed(() => {
  return sptList.value.filter(s => {
    const no = String(s.no || '').toLowerCase()
    const purpose = String(s.maksud_perjalanan || '').toLowerCase()
    const q = searchQuery.value.toLowerCase()
    return no.includes(q) || purpose.includes(q)
  })
})

const totalPages = computed(() => Math.ceil(filteredList.value.length / ITEMS_PER_PAGE) || 1)
const safePage = computed(() => Math.min(currentPage.value, Math.max(1, totalPages.value)))
const paginatedList = computed(() => filteredList.value.slice((safePage.value - 1) * ITEMS_PER_PAGE, safePage.value * ITEMS_PER_PAGE))

const pegawaiOptions = computed(() => pegawaiList.value.map(p => ({
  value: p.nip, 
  label: `${p.nama_lengkap} - ${p.jabatan}` 
})))
</script>

<style scoped>
/* Modal Transition */
.modal-bounce-enter-active {
  animation: bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
.modal-bounce-leave-active {
  animation: bounce-in 0.3s reverse ease-in;
}
@keyframes bounce-in {
  0% { transform: scale(0.85); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;  
  overflow: hidden;
}
</style>
