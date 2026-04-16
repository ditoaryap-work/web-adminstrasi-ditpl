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
          <h1 class="text-3xl font-extrabold text-gray-800">
            Manajer SPT
          </h1>
          <p class="text-gray-500 mt-2 text-sm max-w-lg font-medium">
            Kelola, terbitkan, dan simpan arsip Surat Perintah Tugas (SPT) Direktorat.
          </p>
        </div>

        <button
          class="bg-kementan-green text-white px-6 py-3 rounded-xl font-bold shadow-md shadow-kementan-green/20 flex items-center gap-3 hover:bg-[#004d26] transition-all text-sm"
          @click="openForm()">
          <Plus :size="18" />
          <span>Buat SPT Baru</span>
        </button>
      </div>

      <!-- Filter & Search -->
      <div v-motion :initial="{ opacity: 0, y: 10 }" :enter="{ opacity: 1, y: 0 }"
        class="glass-card p-4 rounded-2xl flex flex-col lg:flex-row gap-4">
        <div class="relative flex-1">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" :size="18" />
          <input v-model="searchQuery" type="text" placeholder="Cari berdasarkan nomor surat atau maksud perjalanan..."
            class="w-full bg-white border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-gray-800 outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all shadow-sm text-sm font-medium placeholder:text-gray-400">
        </div>
        <button
          class="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-600 hover:text-kementan-green hover:border-kementan-green hover:bg-emerald-50 transition-all shadow-sm text-sm font-bold group"
          :disabled="isLoading" title="Refresh Data dari Server" @click="handleRefresh">
          <RefreshCw :size="18" :class="{ 'animate-spin': isLoading }" />
          <span class="hidden sm:inline">Refresh Data</span>
        </button>
      </div>

      <!-- Table Section -->
      <div class="glass-card rounded-3xl overflow-hidden shadow-md border-gray-200 min-h-[400px] relative">
        <div v-if="isLoading && sptList.length === 0"
          class="flex flex-col items-center justify-center py-20 bg-white/50 h-full absolute inset-0">
          <div class="w-10 h-10 border-4 border-kementan-green/20 border-t-kementan-green rounded-full animate-spin" />
          <p class="mt-4 text-sm font-bold text-gray-500 uppercase tracking-widest animate-pulse">
            Memuat Data...
          </p>
        </div>

        <div v-else class="overflow-x-auto custom-scrollbar">
          <table class="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr
                class="bg-gray-50/80 text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] border-b border-gray-200">
                <th class="py-5 px-6">
                  Data Dokumen
                </th>
                <th class="py-5 px-6 text-center">
                  Peserta
                </th>
                <th class="py-5 px-6">
                  Maksud Perjalanan & Tujuan
                </th>
                <th class="py-5 px-6 text-center">
                  Aksi Dokumen
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white/40">
              <template v-if="paginatedList.length > 0">
                <tr v-for="(spt, i) in paginatedList" :key="spt.id_spt" v-motion :initial="{ opacity: 0, y: 5 }"
                  :enter="{ opacity: 1, y: 0, transition: { delay: i * 30 } }"
                  class="group hover:bg-emerald-50/30 transition-colors">
                  <td class="py-4 px-6">
                    <div>
                      <div class="mt-1" />
                      <p class="text-sm font-bold text-gray-800">
                        {{ spt.no || '[Nomor Belum Diisi]' }}
                      </p>
                      <p class="text-[10px] text-gray-500 font-bold tracking-widest mt-1 uppercase">
                        {{ formatIndoDate(spt.tanggal_surat) }}
                        <span v-if="spt.created_at" class="mx-1 lowercase text-gray-300 font-normal">|</span>
                        <span v-if="spt.created_at" class="text-[9px] font-normal capitalize opacity-75">Dibuat: {{
                          spt.created_at }}</span>
                      </p>
                    </div>
                  </td>
                  <td class="py-4 px-6 text-center">
                    <div class="flex flex-col items-center gap-1">
                      <div
                        class="inline-block px-3 py-1 rounded-full text-[10px] font-bold border border-gray-200 bg-gray-50 uppercase tracking-tighter">
                        {{ spt.peserta_count }} Peserta
                      </div>
                      <span class="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                        {{ (spt.peserta_count || 0) > 5 ? 'Template Lampiran' : 'Template Lembar 1' }}
                      </span>
                    </div>
                  </td>
                  <td class="py-4 px-6">
                    <div class="max-w-md">
                      <p class="text-xs text-gray-600 leading-relaxed font-medium line-clamp-2">
                        {{ spt.maksud_perjalanan }}
                      </p>
                      <p class="text-[10px] text-kementan-green font-bold mt-1 uppercase tracking-widest">
                        {{ spt.peserta?.[0]?.tujuan || '-' }}
                      </p>
                    </div>
                  </td>
                  <td class="py-4 px-6 text-center">
                    <div class="flex items-center justify-center gap-2">
                      <!-- Primary Actions Group -->
                      <div v-if="spt.file_link"
                        class="flex items-center gap-1.5 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                        <button
                          class="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold text-[10px] flex items-center gap-1.5 shadow-sm uppercase tracking-wider"
                          title="Preview Dokumen" @click="openPreview(spt.file_link)">
                          <Eye :size="13" /> Preview
                        </button>
                        <button
                          class="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors font-bold text-[10px] flex items-center gap-1.5 shadow-sm uppercase tracking-wider"
                          title="Download File Langsung"
                          @click="triggerDownload(spt.file_link, `SPT_${spt.no.replace(/\//g, '_')}`)">
                          <Download :size="13" /> Download
                        </button>
                      </div>

                      <span v-if="!spt.file_link"
                        class="px-3 py-1.5 bg-gray-50 text-gray-400 rounded-lg border border-gray-100 text-[10px] font-bold uppercase tracking-wider">
                        Belum Ada
                      </span>

                      <!-- Admin Actions Group -->
                      <div class="flex items-center gap-2 ml-2 pl-3 border-l border-gray-100">
                        <button
                          class="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors font-bold text-[10px] flex items-center gap-1.5 shadow-sm uppercase tracking-wider"
                          title="Edit SPT" @click="openForm(spt)">
                          <Edit :size="13" /> Edit
                        </button>
                        <button
                          class="px-3 py-1.5 bg-rose-50 text-rose-700 rounded-lg border border-rose-200 hover:bg-rose-100 transition-colors font-bold text-[10px] flex items-center gap-1.5 shadow-sm uppercase tracking-wider"
                          title="Hapus SPT" @click="handleDelete(spt.id_spt)">
                          <Trash2 :size="13" /> Hapus
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
              <tr v-else>
                <td colspan="4" class="py-16 text-center">
                  <div class="flex flex-col items-center gap-3">
                    <FileText :size="32" class="text-gray-300" />
                    <p class="text-gray-400 font-medium text-sm">
                      Berdasarkan pencarian, tidak ditemukan data SPT yang sesuai.
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="filteredList.length > 0 && !isLoading"
          class="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50/50">
          <p class="text-xs text-gray-500 font-medium">
            Menampilkan <span class="font-bold text-gray-700">{{ (safePage - 1) * ITEMS_PER_PAGE + 1 }}–{{
              Math.min(safePage *
                ITEMS_PER_PAGE, filteredList.length) }}</span> dari <span class="font-bold text-gray-700">{{
                filteredList.length
              }}</span>
          </p>
          <div class="flex gap-1">
            <button :disabled="safePage <= 1"
              class="p-1.5 rounded-lg border bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-30"
              @click="currentPage--">
              <ChevronLeft :size="16" />
            </button>
            <button :disabled="safePage >= totalPages"
              class="p-1.5 rounded-lg border bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-30"
              @click="currentPage++">
              <ChevronRight :size="16" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- View Mode: FORM -->
    <div v-else-if="viewMode === 'form'" v-motion :initial="{ opacity: 0, y: 10 }" :enter="{ opacity: 1, y: 0 }"
      class="max-w-5xl mx-auto space-y-6 pb-12">
      <button
        class="flex items-center gap-2 text-gray-500 hover:text-kementan-green transition-colors font-semibold text-sm bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 w-max"
        @click="closeForm">
        <ChevronLeft :size="18" /> Kembali ke Daftar SPT
      </button>

      <div class="glass-card rounded-3xl overflow-hidden shadow-lg border border-gray-200">
        <div class="bg-gradient-to-r from-emerald-600 to-kementan-green px-8 py-7 text-white relative overflow-hidden">
          <div class="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
            <FileText :size="200" />
          </div>
          <h2 class="text-2xl font-extrabold">
            {{ isEditMode ? 'Edit Dokumen SPT' : 'Buat Surat Perintah Tugas Baru' }}
          </h2>
          <p class="text-emerald-50 font-medium text-sm mt-1 opacity-90">
            Dokumen penugasan resmi untuk perjalanan dinas luar wilayah.
          </p>
        </div>

        <div class="p-8 space-y-10">
          <!-- INFORMASI DASAR -->
          <div class="space-y-6">
            <div class="flex items-center gap-3 border-b border-gray-100 pb-3">
              <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FileText :size="18" />
              </div>
              <h4 class="text-xs font-black text-gray-700 tracking-widest uppercase">
                Informasi Dasar Dokumen
              </h4>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Nomor
                  Surat
                  Tugas <span class="text-red-400">*</span></label>
                <input v-model="formData.no" type="text"
                  class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all font-bold placeholder:text-gray-300"
                  placeholder="Contoh: 147.6/TU-040/J.4/11/2025">
              </div>
              <div>
                <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Tanggal
                  Surat
                  <span class="text-red-400">*</span></label>
                <input v-model="formData.tanggal_surat" type="date"
                  class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 font-bold transition-all">
              </div>
            </div>

            <div>
              <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Maksud
                Perjalanan / Dasar Penugasan <span class="text-red-400">*</span></label>
              <textarea v-model="formData.maksud_perjalanan" rows="3"
                class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all font-medium leading-relaxed"
                placeholder="Jelaskan tujuan dan landasan hukum kegiatan penugasan ini..." />
            </div>

            <div>
              <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Kegiatan
                <span class="text-red-400">*</span></label>
              <input v-model="formData.kegiatan" type="text"
                class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all font-medium"
                placeholder="Contoh: Bimbingan Teknis Sistem Informasi 2025">
            </div>

            <!-- MAK -->
            <div>
              <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">MAK (Mata
                Anggaran Keluaran) <span class="text-red-400">*</span></label>
              <input v-model="formData.mak" type="text"
                class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all font-bold"
                placeholder="Contoh: MAK 7012.EAH.001.054.A.524111">
            </div>
          </div>

          <!-- PESERTA PENUGASAN - Redesign -->
          <div class="space-y-5">
            <!-- Header -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div
                  class="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-sm">
                  <Users :size="17" />
                </div>
                <div>
                  <h4 class="text-sm font-black text-gray-800">Peserta Penugasan</h4>
                  <p class="text-[10px] text-gray-400 font-medium mt-0.5">{{ formData.peserta.length }} orang dipilih
                  </p>
                </div>
              </div>
              <div class="px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest"
                :class="formData.peserta.length > 5 ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm' : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm'">
                <div class="flex items-center gap-1.5">
                  <FileText :size="12" />
                  <span>{{ formData.peserta.length > 5 ? '2 HALAMAN' : '1 HALAMAN' }}</span>
                </div>
              </div>
            </div>

            <!-- Kolom Pencarian Tambah Peserta (selalu di atas) -->
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
              <label class="block text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">+ Tambah
                Peserta</label>
              <SearchableDropdown v-model:value="participantSelector" label="" :options="pegawaiOptions"
                placeholder="Ketik nama atau NIP pegawai..." @change="addParticipant" />
            </div>

            <!-- Bulk Fill Toggle (muncul jika ≥2 peserta) -->
            <transition name="fade">
              <div v-if="formData.peserta.length > 1"
                class="rounded-xl border border-dashed border-gray-300 overflow-hidden">
                <button type="button"
                  class="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                  @click="isBulkFill = !isBulkFill">
                  <div class="flex items-center gap-2">
                    <Zap :size="16" class="text-kementan-green" />
                    <span class="text-xs font-bold text-gray-700 uppercase tracking-widest">Isi Lokasi & Tanggal
                      Serentak</span>
                    <span class="text-[10px] text-gray-500 font-medium">(untuk semua peserta)</span>
                  </div>
                  <div class="flex items-center gap-1 text-[11px] font-bold text-gray-500">
                    <span>{{ isBulkFill ? 'Tutup' : 'Buka' }}</span>
                    <ChevronUp v-if="isBulkFill" :size="16" />
                    <ChevronDown v-else :size="16" />
                  </div>
                </button>
                <transition name="fade">
                  <div v-if="isBulkFill"
                    class="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 bg-white border-t border-gray-200">
                    <div>
                      <label class="flex items-center gap-1.5 text-xs font-bold text-gray-600 mb-2">
                        <MapPin :size="14" class="text-gray-400" /> Lokasi Tujuan
                      </label>
                      <input v-model="bulkTujuan" type="text"
                        class="w-full bg-white border border-gray-300 rounded-xl py-2.5 px-3.5 text-sm outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all font-bold"
                        placeholder="Contoh: Bogor, Jawa Barat" @input="applyBulkFill">
                    </div>
                    <div>
                      <label class="flex items-center gap-1.5 text-xs font-bold text-gray-600 mb-2">
                        <Calendar :size="14" class="text-gray-400" /> Waktu Pelaksanaan
                      </label>
                      <input v-model="bulkTanggal" type="text"
                        class="w-full bg-white border border-gray-300 rounded-xl py-2.5 px-3.5 text-sm outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all font-bold"
                        placeholder="Contoh: 24 – 30 Des 2025" @input="applyBulkFill">
                    </div>
                  </div>
                </transition>
              </div>
            </transition>

            <!-- Empty State -->
            <div v-if="formData.peserta.length === 0"
              class="flex flex-col items-center justify-center gap-3 py-10 rounded-2xl bg-gray-50/80 border-2 border-dashed border-gray-200">
              <div
                class="w-14 h-14 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center text-gray-300">
                <UserPlus :size="28" />
              </div>
              <div class="text-center">
                <p class="text-xs font-black text-gray-400 uppercase tracking-widest">Belum ada peserta</p>
                <p class="text-[10px] text-gray-400 mt-0.5">Cari dan tambahkan peserta melalui kolom di atas</p>
              </div>
            </div>

            <!-- Daftar Peserta (Standard Styling) -->
            <div v-else class="space-y-4">
              <div v-for="(p, idx) in formData.peserta" :key="idx"
                class="group bg-white rounded-xl border border-gray-300 p-5 relative hover:border-kementan-green hover:shadow-sm focus-within:border-kementan-green focus-within:ring-4 focus-within:ring-kementan-green/10 transition-all">
                <!-- Tombol Hapus -->
                <button
                  class="absolute top-4 right-4 shrink-0 w-8 h-8 rounded-lg bg-gray-100 text-gray-500 hover:bg-rose-50 hover:text-rose-600 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 focus-within:opacity-100 focus:opacity-100"
                  @click="removeParticipant(idx)" title="Hapus peserta ini">
                  <Trash2 :size="16" />
                </button>

                <div class="flex flex-col md:flex-row gap-6 md:pr-10">
                  <!-- Identitas Peserta -->
                  <div class="flex-1 md:min-w-[280px] md:max-w-[320px]">
                    <div class="flex items-center gap-3 mb-3">
                      <div
                        class="w-7 h-7 shrink-0 rounded-full bg-kementan-green text-white flex items-center justify-center text-xs font-bold shadow-sm">
                        {{ idx + 1 }}
                      </div>
                      <h5 class="text-sm font-bold text-gray-800 leading-tight line-clamp-1">{{ p.nama_lengkap }}</h5>
                    </div>
                    <div class="flex flex-col gap-1.5 ml-10">
                      <p class="text-xs text-gray-500 font-medium"><span class="font-bold text-gray-400">NIP:</span> {{
                        p.nip || '-' }}</p>
                      <p class="text-xs text-gray-500 font-medium"><span class="font-bold text-gray-400">Gol:</span> {{
                        p.pangkat_gol || '-' }}</p>
                      <p class="text-xs text-gray-500 font-medium leading-relaxed max-w-[220px]"><span
                          class="font-bold text-gray-400">Jabatan:</span> {{ p.jabatan || '-' }}</p>
                    </div>
                  </div>

                  <!-- Kolom Input Lokasi & Tanggal -->
                  <div
                    class="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-5 w-full border-t border-gray-100 pt-4 md:border-t-0 md:pt-0 md:border-l md:pl-6">
                    <div>
                      <label class="flex items-center gap-1.5 text-xs font-bold text-gray-600 mb-2">
                        <MapPin :size="14" class="text-gray-400" /> Lokasi Tujuan
                      </label>
                      <input v-model="p.tujuan" type="text"
                        class="w-full bg-white border border-gray-300 rounded-xl py-3 px-4 text-sm outline-none focus:border-kementan-green transition-all font-bold"
                        placeholder="Contoh: Bogor, Jawa Barat">
                    </div>
                    <div>
                      <label class="flex items-center gap-1.5 text-xs font-bold text-gray-600 mb-2">
                        <Calendar :size="14" class="text-gray-400" /> Waktu Pelaksanaan
                      </label>
                      <input v-model="p.tanggal_pelaksanaan" type="text"
                        class="w-full bg-white border border-gray-300 rounded-xl py-3 px-4 text-sm outline-none focus:border-kementan-green transition-all font-bold"
                        placeholder="Contoh: 12 - 14 Mar 2025">
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- FOOTER ACTIONS -->
          <div class="pt-8 border-t border-gray-100 flex gap-4">
            <button type="button"
              class="px-6 py-3.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm w-40"
              @click="closeForm">
              Batal
            </button>
            <button :disabled="isSubmitting || !formData.no || !formData.mak || formData.peserta.length === 0"
              class="flex-1 px-6 py-3.5 bg-kementan-green text-white font-bold rounded-xl hover:bg-[#004d26] transition-all flex justify-center items-center gap-3 shadow-md shadow-kementan-green/20 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed text-sm uppercase tracking-widest"
              @click="handleSave">
              <template v-if="isSubmitting">
                <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Dalam Proses...</span>
              </template>
              <template v-else>
                <Save :size="18" /> Simpan & Finalkan SPT
              </template>
            </button>
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
                SPT Berhasil Disimpan!
              </h3>
              <p class="text-sm text-gray-500">
                Dokumen telah diarsipkan ke sistem.
              </p>
            </div>

            <div class="px-6 pb-2">
              <div class="grid grid-cols-2 gap-3">
                <div class="bg-gray-50 p-3.5 rounded-xl">
                  <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Nomor Surat
                  </p>
                  <p class="text-xs font-bold text-gray-800 truncate">
                    {{ successModal.item?.no }}
                  </p>
                </div>
                <div class="bg-emerald-50 p-3.5 rounded-xl">
                  <p class="text-[9px] font-bold text-emerald-400 uppercase tracking-widest mb-1">
                    Peserta
                  </p>
                  <p class="text-xs font-bold text-emerald-700">
                    {{ successModal.item?.peserta_count }} Orang
                  </p>
                </div>
              </div>
            </div>
            <div class="p-5 pt-4 flex flex-col gap-2.5">
              <template v-if="successModal.item?.file_link">
                <button
                  class="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2.5 hover:bg-blue-700 transition-colors text-sm"
                  @click="openPreview(successModal.item!.file_link)">
                  <Eye :size="18" /> Preview Dokumen
                </button>
                <button
                  class="w-full py-3 bg-emerald-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2.5 hover:bg-emerald-600 transition-colors text-sm"
                  @click="triggerDownload(successModal.item!.file_link, `SPT_${successModal.item?.no?.replace(/\//g, '_')}`)">
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

    <!-- Global Notifications Modal -->
    <GlobalModal :is-open="notificationModal.isOpen" :type="notificationModal.type" :title="notificationModal.title"
      :message="notificationModal.message" :confirm-text="notificationModal.confirmText"
      @close="notificationModal.isOpen = false"
      @confirm="() => { if (notificationModal.onConfirm) notificationModal.onConfirm(); notificationModal.isOpen = false }" />

    <!-- File Preview Modal -->
    <FilePreviewModal :is-open="showPreview" :file-url="previewUrl" @close="showPreview = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import {
  FileText, Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight,
  Save, Download, CheckCircle, Users, UserPlus, ExternalLink, Eye, RefreshCw,
  Zap, ChevronUp, ChevronDown, MapPin, Calendar
} from 'lucide-vue-next'
import { fetchApi } from '../config/api'
import { useDataStore } from '../stores/useDataStore'
import { SptData, PegawaiData, AdminData, SptPeserta } from '../types/api'
import { formatIndoDate } from '../utils/date'
import GlobalModal from '../components/GlobalModal.vue'
import SearchableDropdown from '../components/SearchableDropdown.vue'
import FilePreviewModal from '../components/FilePreviewModal.vue'
import { triggerDownload } from '../utils/drive'

const ITEMS_PER_PAGE = 10

// Store
const dataStore = useDataStore()

// State
const sptList = ref<SptData[]>([])
const pegawaiList = ref<PegawaiData[]>([])
const isLoading = ref(true)
const searchQuery = ref('')
const currentPage = ref(1)
const viewMode = ref<'list' | 'form'>('list')
const isEditMode = ref(false)
const isSubmitting = ref(false)
const isProcessing = ref(false)
const processingMessage = ref('')
const adminProfile = ref<AdminData | null>(null)

const participantSelector = ref('')

const formData = ref({
  id_spt: '',
  no: '',
  tanggal_surat: '',
  kegiatan: '',
  maksud_perjalanan: '',
  peserta: [] as SptPeserta[],
  tim_poksi: '',
  mak: ''
})

// Bulk fill state untuk fitur samakan lokasi & tanggal
const isBulkFill = ref(false)
const bulkTujuan = ref('')
const bulkTanggal = ref('')

const applyBulkFill = () => {
  formData.value.peserta.forEach(p => {
    if (bulkTujuan.value) p.tujuan = bulkTujuan.value
    if (bulkTanggal.value) p.tanggal_pelaksanaan = bulkTanggal.value
  })
}

const successModal = ref({
  isOpen: false,
  item: null as SptData | null
})

const notificationModal = ref({
  isOpen: false,
  type: 'success' as 'success' | 'error' | 'warning' | 'info' | 'confirm',
  title: '',
  message: '',
  confirmText: '',
  onConfirm: null as (() => void) | null
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
    type, title, message, onConfirm: onConfirm || null, confirmText
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
  const role = adminProfile.value?.role || 'Admin'
  const tim_poksi = role === 'Super Admin' ? 'SEMUA' : (adminProfile.value?.tim_poksi || '')

  try {
    let freshSpt: SptData[] = []
    let freshPegawai: PegawaiData[] = []

    // 1. Fetch SPT Data (from cache or network)
    if (dataStore.isCacheValid('spt')) {
      freshSpt = dataStore.sptData
    } else {
      const resSpt = await fetchApi<SptData[]>("GET_SPT_LIST", { tim_poksi })
      if (resSpt.status && resSpt.data) {
        freshSpt = resSpt.data
        dataStore.setSptData(freshSpt)
      }
    }

    // 2. Fetch Pegawai Data
    if (dataStore.isCacheValid('pegawai')) {
      freshPegawai = dataStore.pegawaiData
    } else {
      const resPegawai = await fetchApi<PegawaiData[]>("GET_PEGAWAI")
      if (resPegawai.status && resPegawai.data) {
        freshPegawai = resPegawai.data
        dataStore.setPegawaiData(freshPegawai)
      }
    }

    sptList.value = freshSpt
    pegawaiList.value = freshPegawai
  } catch (err) {
    console.error("Gagal menarik data:", err)
    showNotification('error', 'Gagal Menarik Data', 'Terjadi kesalahan saat menghubungkan ke server.')
  } finally {
    isLoading.value = false
  }
}

const openForm = (data: SptData | null = null) => {
  if (data) {
    formData.value = {
      ...data,
      kegiatan: (data as any).kegiatan || '',
      peserta: Array.isArray(data.peserta) ? [...data.peserta] : []
    }
    isEditMode.value = true
  } else {
    formData.value = {
      id_spt: '',
      no: '',
      tanggal_surat: new Date().toISOString().split('T')[0],
      kegiatan: '',
      maksud_perjalanan: '',
      peserta: [],
      tim_poksi: adminProfile.value?.tim_poksi || '',
      mak: ''
    }
    isEditMode.value = false
  }
  isBulkFill.value = false
  bulkTujuan.value = ''
  bulkTanggal.value = ''
  participantSelector.value = ''
  viewMode.value = 'form'
}

const closeForm = () => {
  viewMode.value = 'list'
}

const addParticipant = (strIdx: string) => {
  if (!strIdx) return
  const p = pegawaiList.value[parseInt(strIdx)]
  if (!p) return

  // Check if exists using NIP or Exact Object Ref
  if (formData.value.peserta.some((existing: SptPeserta) => existing.nip === p.nip && existing.nama_lengkap === p.nama_lengkap)) {
    showNotification('warning', 'Duplikasi Peserta', 'Pegawai ini sudah ada di daftar peserta.')
    participantSelector.value = ''
    return
  }

  if (p) {
    let extractedGol = '-'
    // Since PegawaiData from interface has nama_lengkap
    if (p.golongan) {
      const match = p.golongan.match(/[IVX]+/i)
      if (match) extractedGol = match[0].toUpperCase()
    }

    formData.value.peserta.push({
      nama_lengkap: p.nama_lengkap, // fallback
      nip: p.nip,
      pangkat_gol: extractedGol,
      jabatan: p.jabatan,
      tujuan: '',
      tanggal_pelaksanaan: ''
    })
  }
  participantSelector.value = ''
}

const removeParticipant = (index: number) => {
  formData.value.peserta.splice(index, 1)
}

const handleSave = async () => {
  if (formData.value.peserta.length === 0) {
    showNotification('warning', 'Peserta Kosong', 'Harap masukkan minimal satu peserta penugasan.')
    return
  }

  isSubmitting.value = true
  try {
    const payload = {
      ...formData.value,
      peserta_count: formData.value.peserta.length
    }
    const result = await fetchApi("SAVE_SPT", { data: payload })

    if (result.status) {
      const savedItem = { ...payload, file_link: (result.data as any)?.file_link || null }
      successModal.value = { isOpen: true, item: savedItem as any }

      // Force cache invalidation so GET_SPT_LIST fetches new data
      dataStore.invalidateCache('spt')
      closeForm()
      await fetchData()
    } else {
      showNotification('error', 'Gagal Menyimpan', result.message || 'Terjadi kesalahan pada server.')
    }
  } catch {
    showNotification('error', 'Jaringan Error', 'Gagal menghubungi server. Pastikan koneksi internet stabil.')
  } finally {
    isSubmitting.value = false
  }
}

const handleDelete = (id: string) => {
  showNotification(
    'confirm',
    'Konfirmasi Hapus',
    'Apakah Anda yakin ingin menghapus arsip SPT ini? Tindakan ini tidak dapat dibatalkan.',
    async () => {
      isProcessing.value = true
      processingMessage.value = 'Menghapus Data...'
      try {
        const result = await fetchApi("DELETE_SPT", { id_spt: id })
        if (result.status) {
          dataStore.invalidateCache('spt') // invalidate cache after delete
          await fetchData()
          showNotification('success', 'Hapus Berhasil', 'Arsip SPT telah dihapus dari sistem.')
        } else {
          showNotification('error', 'Hapus Gagal', result.message)
        }
      } catch {
        showNotification('error', 'Gagal', 'Terjadi kesalahan jaringan saat menghapus.')
      } finally {
        isProcessing.value = false
      }
    }
  )
}

const handleRefresh = async () => {
  dataStore.invalidateCache('spt')
  await fetchData()
}

const openFile = (url: string) => {
  if (!url) return
  window.open(url, '_blank')
}

const showPreview = ref(false)
const previewUrl = ref('')
const openPreview = (url: string) => {
  if (!url) return
  previewUrl.value = url
  showPreview.value = true
}


// Computed
const filteredList = computed(() => {
  return sptList.value.filter((s: SptData) => {
    const no = String(s.no || '').toLowerCase()
    const purpose = String(s.maksud_perjalanan || '').toLowerCase()
    const q = searchQuery.value.toLowerCase()
    return no.includes(q) || purpose.includes(q)
  })
})

const totalPages = computed(() => Math.ceil(filteredList.value.length / ITEMS_PER_PAGE) || 1)
const safePage = computed(() => Math.min(currentPage.value, Math.max(1, totalPages.value)))
const paginatedList = computed(() => filteredList.value.slice((safePage.value - 1) * ITEMS_PER_PAGE, safePage.value * ITEMS_PER_PAGE))

const pegawaiOptions = computed(() => pegawaiList.value.map((p: PegawaiData, idx: number) => ({
  value: String(idx),
  label: `${p.nama_lengkap} - ${p.jabatan || p.poksi || '-'}`
})))
</script>

<style scoped>
/* Modal Transition */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
