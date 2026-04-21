<template>
  <Teleport to="body">
    <transition name="modal-fade">
      <div v-if="isOpen" class="fixed inset-0 z-[11000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
        <div class="absolute inset-0" @click="$emit('close')" />
        
        <div v-motion
          :initial="{ opacity: 0, scale: 0.9, y: 20 }"
          :enter="{ opacity: 1, scale: 1, y: 0 }"
          class="relative bg-white rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col"
        >
          <!-- Header -->
          <div class="px-8 pt-8 pb-6 bg-slate-50/50 border-b border-gray-100 flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
                <Info :size="24" />
              </div>
              <div>
                <h3 class="text-xl font-extrabold text-slate-800 tracking-tight leading-tight">Detail Arsip Surat</h3>
                <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Informasi Lengkap Dokumen</p>
              </div>
            </div>
            <button @click="$emit('close')" class="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400">
              <X :size="24" />
            </button>
          </div>

          <!-- Body (Scrollable) -->
          <div class="p-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
            <!-- Bento Grid Layout -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <!-- SECTION: IDENTITAS -->
              <div class="space-y-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                <div class="flex items-center gap-2 mb-2 text-indigo-600">
                  <Fingerprint :size="16" />
                  <span class="text-[10px] font-black uppercase tracking-widest">Identitas Dokumen</span>
                </div>
                
                <div class="space-y-3">
                  <div>
                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Nomor Registrasi</p>
                    <p class="text-sm font-bold text-slate-700 break-all select-all">{{ surat.nomorSurat || '-' }}</p>
                  </div>
                  
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Tanggal Surat</p>
                      <p class="text-xs font-bold text-slate-700">{{ formatIndoDate(surat.tanggalSurat) }}</p>
                    </div>
                    <div>
                      <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Tipe Surat</p>
                      <span class="inline-block px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest border"
                      :class="surat.tipeSurat === 'Masuk' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-purple-50 text-purple-600 border-purple-100'">
                        {{ surat.tipeSurat }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- SECTION: METADATA -->
              <div class="space-y-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                <div class="flex items-center gap-2 mb-2 text-indigo-600">
                  <Tag :size="16" />
                  <span class="text-[10px] font-black uppercase tracking-widest">Klasifikasi</span>
                </div>

                <div class="space-y-3">
                  <div>
                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Tim Kerja / Poksi</p>
                    <p class="text-xs font-bold text-slate-700">{{ surat.timPoksi || 'UMUM' }}</p>
                  </div>
                  
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Kategori</p>
                      <p class="text-xs font-bold text-slate-700">{{ surat.kategoriSurat || '-' }}</p>
                    </div>
                    <div>
                      <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Sifat</p>
                      <span class="inline-block px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest border"
                        :class="{
                          'bg-rose-50 text-rose-600 border-rose-100': surat.sifatSurat === 'Rahasia' || surat.sifatSurat === 'Penting',
                          'bg-amber-50 text-amber-600 border-amber-100': surat.sifatSurat === 'Segera',
                          'bg-emerald-50 text-emerald-600 border-emerald-100': surat.sifatSurat === 'Biasa'
                        }">
                        {{ surat.sifatSurat }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- SECTION: KONTEN (FULL WIDTH) -->
              <div class="md:col-span-2 space-y-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                 <div class="flex items-center gap-2 mb-1 text-kementan-green">
                  <FileText :size="18" />
                  <span class="text-[10px] font-black uppercase tracking-widest">Konten & Perihal</span>
                </div>
                
                <div class="space-y-4">
                  <div>
                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Asal / Tujuan</p>
                    <p class="text-base font-extrabold text-slate-800 leading-snug">{{ surat.asalTujuan }}</p>
                  </div>
                  
                  <div class="pt-4 border-t border-gray-50">
                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Perihal</p>
                    <p class="text-sm font-medium text-slate-600 leading-relaxed whitespace-pre-wrap">{{ surat.perihal }}</p>
                  </div>
                </div>
              </div>

              <!-- SECTION: TINDAK LANJUT / NEGARA -->
              <div class="md:col-span-2 space-y-4 bg-amber-50/30 p-6 rounded-2xl border border-amber-100/50">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2 text-amber-700">
                    <NotebookPen :size="18" />
                    <span class="text-[10px] font-black uppercase tracking-widest">Catatan Tindak Lanjut / Hasil</span>
                  </div>
                  <div class="px-3 py-1 rounded-full text-[8px] font-black uppercase border shadow-sm"
                    :class="surat.fileNotulensi ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-100 text-amber-700 border-amber-200'">
                    {{ surat.fileNotulensi ? 'SELESAI' : 'MENUNGGU' }}
                  </div>
                </div>

                <div v-if="surat.tindakLanjut" class="mt-2 text-sm text-slate-700 font-medium whitespace-pre-wrap italic leading-relaxed">
                  "{{ surat.tindakLanjut }}"
                </div>
                <div v-else class="text-xs text-amber-600 mt-2 italic font-medium">
                  Belum ada catatan tindak lanjut yang terekam untuk dokumen ini.
                </div>
              </div>

            </div>
          </div>

          <!-- Footer Actions -->
          <div class="px-8 py-6 bg-slate-50 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
             <template v-if="surat.fileSurat">
               <button @click="$emit('download', surat.fileSurat, `Surat_${surat.nomorSurat.replace(/\//g, '_')}`)" 
                class="flex-1 flex items-center justify-center gap-3 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-xs hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                <Download :size="18" /> Download File Surat
              </button>
             </template>
             <template v-if="surat.fileNotulensi">
               <button @click="$emit('download', surat.fileNotulensi, `Hasil_${surat.nomorSurat.replace(/\//g, '_')}`)" 
                class="flex-1 flex items-center justify-center gap-3 py-4 bg-kementan-green text-white rounded-2xl font-bold text-xs hover:bg-[#004d26] transition-all shadow-lg shadow-kementan-green/20">
                <FileCheck :size="18" /> Download Hasil Acara
              </button>
             </template>
             <button @click="$emit('close')" class="px-8 py-4 bg-white text-slate-500 border border-slate-200 rounded-2xl font-bold text-xs hover:bg-slate-100 transition-all">
                Tutup Jendela
             </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { X, Info, Download, FileText, Fingerprint, Tag, NotebookPen, FileCheck } from 'lucide-vue-next'
import type { SuratData } from '../../types/api'
import { formatIndoDate } from '../../utils/date'

defineProps<{
  isOpen: boolean
  surat: SuratData
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'download', url: string, filename: string): void
}>()
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}
</style>
