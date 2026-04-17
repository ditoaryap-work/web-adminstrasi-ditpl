<template>
  <div class="h-full flex flex-col space-y-6">
    <!-- Header Page -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-black text-gray-800 tracking-tight">Manajemen Template</h1>
        <p class="text-sm text-gray-500 mt-1">Konfigurasi struktur dokumen dasar untuk sistem administrasi</p>
      </div>
      <div class="flex items-center gap-3">
        <button v-if="isAdmin" @click="syncTemplates" 
                class="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold hover:border-kementan-green hover:text-kementan-green transition-all shadow-sm disabled:opacity-50"
                :disabled="loading || isOperating !== null">
          <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': isOperating === 'sync' }" />
          Sync dari Drive
        </button>
        <span v-if="loading" class="text-xs font-semibold text-kementan-green flex items-center gap-2">
          <Loader2 class="w-4 h-4 animate-spin" />
          Memuat...
        </span>
      </div>
    </div>

    <!-- Alert / Pesan -->
    <div v-if="isAdmin" class="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 text-blue-800">
      <Info class="w-5 h-5 shrink-0 mt-0.5" />
      <div class="text-sm italic">
        <strong>Mode Akses: Super Admin.</strong> Anda memiliki hak penuh untuk menyesuaikan parameter dokumen dan melakukan sinkronisasi template utama. Perubahan akan berdampak secara real-time pada seluruh tim.
      </div>
    </div>
    <div v-else class="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 text-red-800">
      <ShieldAlert class="w-5 h-5 shrink-0 mt-0.5" />
      <div class="text-sm">
        <strong>Akses Terbatas.</strong> Modul ini hanya dapat diakses oleh Super Admin untuk menjaga konsistensi struktur dokumen legal.
      </div>
    </div>

    <!-- Grid Template Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-6">
      <div v-for="tpl in templates" :key="tpl.id"
           class="bg-white rounded-2xl border transition-all duration-300 relative group flex flex-col"
           :class="tpl.exists ? 'border-kementan-green/30 shadow-md shadow-kementan-green/5' : 'border-gray-200 opacity-80'">
        
        <!-- Status Badge -->
        <div class="absolute -top-3 -right-3">
          <span v-if="tpl.exists" class="flex items-center gap-1 bg-gradient-to-br from-emerald-400 to-kementan-green text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-sm">
            <CheckCircle2 class="w-3 h-3" />
            Aktif
          </span>
          <span v-else class="flex items-center gap-1 bg-gradient-to-br from-gray-400 to-gray-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-sm">
            <XCircle class="w-3 h-3" />
            Kosong
          </span>
        </div>

        <div class="p-6 flex-1">
          <div class="flex items-start gap-4 mb-4">
             <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                <FileWord class="w-6 h-6 text-blue-600" />
             </div>
             <div>
                <h3 class="font-bold text-gray-800 text-lg leading-tight">{{ tpl.name }}</h3>
                <span class="inline-block mt-1 text-[10px] font-bold tracking-widest text-blue-600 bg-blue-50 uppercase px-2 py-0.5 rounded border border-blue-200/50">
                  MODUL: {{ tpl.module }}
                </span>
             </div>
          </div>

          <div class="space-y-2 mt-6">
            <div class="flex justify-between text-xs text-gray-500 pb-2 border-b border-gray-100">
              <span class="font-semibold">Nama File:</span>
              <span class="truncate max-w-[150px]" :title="tpl.filename">{{ tpl.filename }}</span>
            </div>
            <div class="flex justify-between text-xs text-gray-500 pb-2 border-b border-gray-100">
              <span class="font-semibold">Ukuran Size:</span>
              <span>{{ tpl.sizeKb > 0 ? tpl.sizeKb + ' KB' : '-' }}</span>
            </div>
            <div class="flex justify-between text-xs text-gray-500 pb-2">
              <span class="font-semibold">Modifikasi Terakhir:</span>
              <span>{{ tpl.lastModified ? new Date(tpl.lastModified).toLocaleString('id-ID') : '-' }}</span>
            </div>
          </div>
        </div>

        <!-- Action Area -->
        <div class="p-4 bg-gray-50 border-t border-gray-100 rounded-b-2xl flex gap-3">
          <button @click="downloadTemplate(tpl.id, tpl.filename)" 
                  class="flex-1 flex justify-center items-center gap-2 py-2.5 rounded-xl font-semibold text-xs transition-colors bg-white border border-gray-200 text-gray-700 hover:text-kementan-green hover:border-kementan-green focus:ring-4 focus:ring-kementan-green/10"
                  :disabled="!tpl.exists || isOperating === tpl.id">
            <Download class="w-4 h-4" />
            <span v-if="isOperating === tpl.id + '_dl'">Unduh...</span>
            <span v-else>Unduh</span>
          </button>
          
          <div class="flex-1 relative">
             <input type="file" :id="'file_'+tpl.id" accept=".docx" class="hidden" @change="(e) => onFileSelected(e, tpl.id)" />
             <button @click="triggerUpload(tpl.id)"
                    class="w-full flex justify-center items-center gap-2 py-2.5 rounded-xl font-semibold text-xs transition-all disabled:opacity-50"
                    :class="isAdmin ? 'bg-kementan-green text-white hover:bg-emerald-600 shadow-sm' : 'bg-gray-200 text-gray-400 cursor-not-allowed'"
                    :disabled="!isAdmin || isOperating !== null">
              <Upload class="w-4 h-4" />
              <span v-if="isOperating === tpl.id + '_up'">Proses..</span>
              <span v-else>Replace</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import api from '../config/api';
import { 
  FileBox as FileWord, 
  Download, Upload, CheckCircle2, 
  XCircle, Info, ShieldAlert, Loader2, RefreshCw
} from 'lucide-vue-next';
import Swal from 'sweetalert2';
import { AdminData } from '../types/api';

interface TemplateInfo {
    id: string;
    name: string;
    module: string;
    filename: string;
    exists: boolean;
    sizeKb: number;
    lastModified: string | null;
}

const templates = ref<TemplateInfo[]>([]);
const loading = ref(false);
const isOperating = ref<string | null>(null);

const adminData = computed<AdminData | null>(() => {
    const raw = localStorage.getItem('adminData');
    if (raw) {
        try { return JSON.parse(raw); } catch { return null; }
    }
    return null;
});

const isAdmin = computed(() => {
    return adminData.value?.role === 'Super Admin';
});

const fetchTemplates = async () => {
    loading.value = true;
    try {
        const res = await api.get('/api/templates');
        if (res.data.status) {
            templates.value = res.data.data;
        }
    } catch (e: any) {
        console.error("Gagal get templates", e);
        Swal.fire('Error', 'Gagal memuat list template', 'error');
    } finally {
        loading.value = false;
    }
};

const downloadTemplate = async (id: string, filename: string) => {
    isOperating.value = id + '_dl';
    try {
        const res = await api.get(`/api/templates/${id}/download`, {
            responseType: 'blob'
        });
        
        // Blobs with FileSaver approach
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        
        // Cleanup dom
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (e: any) {
        console.error("Gagal download template", e);
        Swal.fire('Error', 'File tidak ditemukan atau terjadi kesalahan server', 'error');
    } finally {
        isOperating.value = null;
    }
};

const triggerUpload = (id: string) => {
    if (!isAdmin.value) return;
    const inputFiles = document.getElementById(`file_${id}`) as HTMLInputElement;
    if (inputFiles) {
        inputFiles.click();
    }
};

const onFileSelected = async (event: Event, id: string) => {
    const target = event.target as HTMLInputElement;
    if (!target.files || target.files.length === 0) return;
    
    const file = target.files[0];
    
    // Validasi ekstensi file
    if (!file.name.toLowerCase().endsWith('.docx')) {
        Swal.fire('Format Tidak Dukung', 'Sistem hanya menerima file dengan ekstensi .docx.', 'warning');
        target.value = '';
        return;
    }

    const confirm = await Swal.fire({
        title: 'Konfirmasi Pembaruan',
        text: `Anda akan memperbarui template "${file.name}". File baru akan menggantikan format lama untuk seluruh pengguna secara permanen.`,
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Perbarui Sekarang',
        cancelButtonText: 'Batalkan',
        confirmButtonColor: '#059669',
    });

    if (!confirm.isConfirmed) {
        target.value = '';
        return;
    }

    // Eksekusi upload
    isOperating.value = id + '_up';
    
    try {
        const formData = new FormData();
        formData.append('file', file);
        
        const res = await api.put(`/api/templates/${id}/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (res.data.status) {
            Swal.fire({
                title: 'Berhasil',
                text: 'Template telah diperbarui dan cache tim telah dibersihkan.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
            await fetchTemplates();
        } else {
            Swal.fire('Gagal', res.data.message, 'error');
        }
    } catch (e: any) {
        console.error("Gagal replace template", e);
        Swal.fire('Gagal', e.response?.data?.message || 'Gagal menyimpan template baru', 'error');
    } finally {
        isOperating.value = null;
        target.value = '';
    }
};

const syncTemplates = async () => {
    if (!isAdmin.value) return;

    const confirm = await Swal.fire({
        title: 'Konfirmasi Sinkronisasi',
        text: 'Sistem akan mengunduh versi terbaru seluruh template dari Google Drive dan menyinkronkan data lokal. Lanjutkan?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Lakukan Sinkronisasi',
        cancelButtonText: 'Batalkan',
        confirmButtonColor: '#059669',
    });

    if (!confirm.isConfirmed) return;

    isOperating.value = 'sync';
    try {
        const res = await api.post('/api/templates/sync');
        if (res.data.status) {
            Swal.fire({
                title: 'Berhasil',
                text: res.data.message,
                icon: 'success',
                timer: 3000,
                showConfirmButton: false
            });
            await fetchTemplates();
        }
    } catch (e: any) {
        console.error("Gagal sync template", e);
        Swal.fire('Gagal Sinkronisasi', e.response?.data?.message || 'Terjadi kesalahan sistem saat proses sinkronisasi.', 'error');
    } finally {
        isOperating.value = null;
    }
};

onMounted(() => {
    fetchTemplates();
});
</script>
