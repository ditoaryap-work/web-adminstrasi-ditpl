<template>
  <div class="space-y-6 pb-12">
    <!-- View Mode: LIST -->
    <div
      v-if="viewMode === 'list'"
      class="space-y-6"
    >
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div
          v-motion
          :initial="{ opacity: 0, x: -20 }"
          :enter="{ opacity: 1, x: 0 }"
        >
          <div class="flex items-center gap-3 mb-2 text-kementan-green">
            <FileSignature :size="20" />
            <span class="text-xs font-bold tracking-[0.3em] uppercase">Mekanisme SPPD</span>
          </div>
          <h1 class="text-3xl font-extrabold text-gray-800">
            Manajer SPTJM
          </h1>
          <p class="text-gray-500 mt-2 text-sm max-w-lg font-medium">
            Kelola data dan terbitkan dokumen Surat Pernyataan Tanggungjawab Mutlak (Biaya Rill).
          </p>
        </div>

        <button 
          class="bg-kementan-green text-white px-6 py-3 rounded-xl font-bold shadow-md shadow-kementan-green/20 flex items-center gap-3 hover:bg-[#004d26] transition-all text-sm"
          @click="openForm()"
        >
          <Plus :size="18" />
          <span>Tambah Dokumen (SPTJM)</span>
        </button>
      </div>

      <!-- Filter & Search -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 10 }"
        :enter="{ opacity: 1, y: 0 }"
        class="glass-card p-4 rounded-2xl flex flex-col lg:flex-row gap-4"
      >
        <div class="relative flex-1">
          <Search
            class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            :size="18"
          />
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Cari berdasarkan nama atau tujuan perjalanan..."
            class="w-full bg-white border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-gray-800 outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all shadow-sm text-sm font-medium placeholder:text-gray-400"
          >
        </div>
        <button 
          class="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-600 hover:text-kementan-green hover:border-kementan-green hover:bg-emerald-50 transition-all shadow-sm text-sm font-bold group"
          :disabled="isLoading"
          title="Refresh Data dari Server"
          @click="handleRefresh"
        >
          <RefreshCw :size="18" :class="{ 'animate-spin': isLoading }" />
          <span class="hidden sm:inline">Refresh Data</span>
        </button>
      </div>

      <!-- Table Section -->
      <div class="glass-card rounded-3xl overflow-hidden shadow-md border-gray-200 min-h-[400px] relative">
        <div
          v-if="isLoading && sptjmList.length === 0"
          class="flex flex-col items-center justify-center py-20 bg-white/50 h-full absolute inset-0"
        >
          <div class="w-10 h-10 border-4 border-kementan-green/20 border-t-kementan-green rounded-full animate-spin" />
          <p class="mt-4 text-sm font-bold text-gray-500 uppercase tracking-widest animate-pulse">
            Memuat Data...
          </p>
        </div>
        
        <div
          v-else
          class="overflow-x-auto custom-scrollbar"
        >
          <table class="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr class="bg-gray-50/80 text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] border-b border-gray-200">
                <th class="py-5 px-6 w-[40%]">
                  Informasi Pelaksana
                </th>
                <th class="py-5 px-6">
                  Rincian Perjalanan
                </th>
                <th class="py-5 px-6 text-center">
                  Aksi Dokumen
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white/40">
              <template v-if="paginatedList.length > 0">
                <tr 
                  v-for="(item, idx) in paginatedList" 
                  :key="item.id_sptjm"
                  v-motion
                  :initial="{ opacity: 0, y: 5 }"
                  :enter="{ opacity: 1, y: 0, transition: { delay: idx * 30 } }"
                  class="group hover:bg-emerald-50/30 transition-colors"
                >
                  <td class="py-4 px-6">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200 text-sm shrink-0">
                        {{ String(item.nama_lengkap || '?').charAt(0) }}
                      </div>
                      <div>
                        <p class="text-sm font-bold text-gray-800">
                          {{ item.nama_lengkap }}
                        </p>
                        <p class="text-[11px] text-gray-400 font-medium tracking-wider">
                          {{ item.nip || 'Tak Ada NIP' }}
                          <span
                            v-if="item.created_at"
                            class="mx-1 lowercase text-gray-300 font-normal"
                          >|</span> 
                          <span
                            v-if="item.created_at"
                            class="text-[9px] font-normal opacity-75"
                          >Dibuat: {{ item.created_at }}</span>
                        </p>
                      </div>
                    </div>
                  </td>
                  <td class="py-4 px-6">
                    <div>
                      <p class="text-xs font-bold text-gray-700 mb-1">
                        Tujuan: {{ item.tujuan }}
                      </p>
                      <div class="flex items-center gap-1.5 text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded w-max">
                        <span>{{ formatSmartDateRange(item.tanggal_perjalanan, item.tanggal_kembali) }}</span>
                      </div>
                    </div>
                  </td>
                  <td class="py-4 px-6 text-center">
                    <div class="flex items-center justify-center gap-2">
                      <!-- Primary Actions Group -->
                      <div v-if="item.file_link" class="flex items-center gap-1.5 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                        <button
                          class="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold text-[10px] flex items-center gap-1.5 shadow-sm uppercase tracking-wider"
                          title="Preview Dokumen"
                          @click="openPreview(item.file_link)"
                        >
                          <Eye :size="13" /> Preview
                        </button>
                        <button
                          class="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors font-bold text-[10px] flex items-center gap-1.5 shadow-sm uppercase tracking-wider"
                          title="Download File Langsung"
                          @click="triggerDownload(item.file_link, `SPTJM_${item.tujuan.replace(/\s+/g, '_')}`)"
                        >
                          <Download :size="13" /> Download
                        </button>
                      </div>

                      <span
                        v-if="!item.file_link"
                        class="px-3 py-1.5 bg-gray-50 text-gray-400 rounded-lg border border-gray-100 text-[10px] font-bold uppercase tracking-wider"
                      >
                        Belum Ada
                      </span>

                      <!-- Admin Actions Group -->
                      <div class="flex items-center gap-2 ml-2 pl-3 border-l border-gray-100">
                        <button
                          class="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors font-bold text-[10px] flex items-center gap-1.5 shadow-sm uppercase tracking-wider"
                          title="Edit SPTJM"
                          @click="openForm(item)"
                        >
                          <Edit :size="13" /> Edit
                        </button>
                        <button
                          class="px-3 py-1.5 bg-rose-50 text-rose-700 rounded-lg border border-rose-200 hover:bg-rose-100 transition-colors font-bold text-[10px] flex items-center gap-1.5 shadow-sm uppercase tracking-wider"
                          title="Hapus SPTJM"
                          @click="handleDelete(item.id_sptjm)"
                        >
                          <Trash2 :size="13" /> Hapus
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
              <tr v-else>
                <td
                  colspan="3"
                  class="py-16 text-center"
                >
                  <div class="flex flex-col items-center gap-3">
                    <FileSignature
                      :size="32"
                      class="text-gray-300"
                    />
                    <p class="text-gray-400 font-medium text-sm">
                      Berdasarkan pencarian, tidak ditemukan data SPTJM yang sesuai.
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div
          v-if="filteredList.length > 0 && !isLoading"
          class="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50/50"
        >
          <p class="text-xs text-gray-500 font-medium">
            Menampilkan <span class="font-bold text-gray-700">{{ (safePage - 1) * ITEMS_PER_PAGE + 1 }}–{{ Math.min(safePage * ITEMS_PER_PAGE, filteredList.length) }}</span> dari <span class="font-bold text-gray-700">{{ filteredList.length }}</span>
          </p>
          <div class="flex gap-1">
            <button
              :disabled="safePage <= 1"
              class="p-1.5 rounded-lg border bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-30"
              @click="currentPage--"
            >
              <ChevronLeft :size="16" />
            </button>
            <button
              :disabled="safePage >= totalPages"
              class="p-1.5 rounded-lg border bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-30"
              @click="currentPage++"
            >
              <ChevronRight :size="16" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- View Mode: FORM -->
    <div
      v-else-if="viewMode === 'form'"
      v-motion
      :initial="{ opacity: 0, y: 10 }"
      :enter="{ opacity: 1, y: 0 }"
      class="max-w-5xl mx-auto space-y-6 pb-12"
    >
      <button
        class="flex items-center gap-2 text-gray-500 hover:text-kementan-green transition-colors font-semibold text-sm bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 w-max"
        @click="closeForm"
      >
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
              <SearchableDropdown
                label="Pilih Pegawai (Ketik untuk mencari)"
                :options="pegawaiOptions"
                :value="selectedPegawaiIndex"
                placeholder="Contoh: Budi Santoso..."
                required
                @change="handlePegawaiChange"
              />
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">NIP</label>
                  <input
                    type="text"
                    readonly
                    class="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm font-medium text-gray-600 outline-none"
                    :value="formData.nip"
                    placeholder="Otomatis"
                  >
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Jabatan</label>
                  <input
                    type="text"
                    readonly
                    class="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm font-medium text-gray-600 outline-none truncate"
                    :value="formData.jabatan"
                    placeholder="Otomatis"
                  >
                </div>
              </div>
            </div>

            <!-- Ketentuan Perjalanan -->
            <div class="space-y-5">
              <h4 class="text-xs font-bold text-kementan-green tracking-widest uppercase border-b border-gray-100 pb-2">
                Ketentuan Perjalanan
              </h4>
              <div>
                <label class="block text-xs font-bold text-gray-600 uppercase mb-1.5">Tujuan Perjalanan <span class="text-red-400">*</span></label>
                <input
                  v-model="formData.tujuan"
                  type="text"
                  class="w-full bg-white border border-gray-300 rounded-xl py-3 px-4 text-sm outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all font-medium"
                  placeholder="Contoh: Bogor, Jawa Barat"
                >
              </div>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label class="block text-xs font-bold text-gray-600 uppercase mb-1.5">Mulai Tanggal <span class="text-red-400">*</span></label>
                  <input
                    v-model="formData.tanggal_perjalanan"
                    type="date"
                    class="w-full bg-white border border-gray-300 rounded-xl py-3 px-4 text-sm outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all font-medium"
                  >
                </div>
                <div>
                  <label class="block text-xs font-bold text-gray-600 uppercase mb-1.5">Selesai Tanggal <span class="text-red-400">*</span></label>
                  <input
                    v-model="formData.tanggal_kembali"
                    type="date"
                    class="w-full bg-white border border-gray-300 rounded-xl py-3 px-4 text-sm outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all font-medium"
                  >
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
                  <input
                    type="text"
                    :value="formatNumberForInput(formData.tiket_berangkat)"
                    class="w-full bg-white border border-gray-300 rounded-xl py-3 px-4 text-sm outline-none focus:border-kementan-green font-medium"
                    placeholder="contoh: 1.500.000"
                    @input="(e: Event) => updateNumberField('tiket_berangkat', (e.target as HTMLInputElement).value)"
                  >
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-gray-600 uppercase mb-1.5">Tiket Pulang (Rp)</label>
                  <input
                    type="text"
                    :value="formatNumberForInput(formData.tiket_pulang)"
                    class="w-full bg-white border border-gray-300 rounded-xl py-3 px-4 text-sm outline-none focus:border-kementan-green font-medium"
                    placeholder="contoh: 1.500.000"
                    @input="(e: Event) => updateNumberField('tiket_pulang', (e.target as HTMLInputElement).value)"
                  >
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-gray-600 uppercase mb-1.5">Biaya Tiket Pesawat (Ekonomi SBM - Rp)</label>
                  <input
                    type="text"
                    :value="formatNumberForInput(formData.biaya_sbm)"
                    class="w-full bg-white border border-gray-300 rounded-xl py-3 px-4 text-sm outline-none focus:border-blue-500 font-medium"
                    placeholder="Otomatis dari CEK SBM"
                    @input="(e: Event) => updateNumberField('biaya_sbm', (e.target as HTMLInputElement).value)"
                  >
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-gray-600 uppercase mb-1.5">Total Keseluruhan</label>
                  <div class="relative">
                    <input
                      type="text"
                      readonly
                      :value="'Rp ' + formatNumber(totalSum)"
                      class="w-full bg-emerald-50 border border-emerald-200 rounded-xl py-3 px-4 text-sm font-bold text-emerald-800 outline-none"
                    >
                    <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-emerald-600 font-bold">OTOMATIS</span>
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
                <label class="block text-xs font-bold text-gray-600 uppercase mb-1.5">Tanggal Surat Dibuat <span class="text-red-400">*</span></label>
                <input
                  v-model="formData.tanggal_ttd"
                  type="date"
                  class="w-full bg-white border border-gray-300 rounded-xl py-3 px-4 text-sm outline-none focus:border-kementan-green font-medium"
                >
              </div>
            </div>

            <div class="pt-6 border-t border-gray-100 flex gap-4">
              <button
                type="button"
                class="px-6 py-3.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm w-40"
                @click="closeForm"
              >
                Batal
              </button>
              <button
                :disabled="isSubmitting || !formData.nip"
                class="flex-1 px-6 py-3.5 bg-kementan-green text-white font-bold rounded-xl hover:bg-[#004d26] transition-colors flex justify-center items-center gap-2 shadow-md shadow-kementan-green/20 disabled:opacity-70 disabled:cursor-not-allowed text-sm"
                @click="handleSave"
              >
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
              <SearchableDropdown
                v-model:value="sbmQuery"
                label="Ketik Nama Kota/Kabupaten"
                :options="sbmOptions"
                placeholder="Contoh: Bogor"
              />

              <transition name="fade">
                <div
                  v-if="selectedSbm"
                  class="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3 mt-4"
                >
                  <div>
                    <p class="text-[10px] font-bold text-blue-400 uppercase">
                      Tujuan Spesifik
                    </p>
                    <p class="text-sm font-bold text-blue-900 leading-tight">
                      {{ selectedSbm.tujuan_lengkap || "-" }}
                    </p>
                  </div>
                  <div class="pt-2 border-t border-blue-100/50">
                    <p class="text-[10px] font-bold text-blue-400 uppercase">
                      Uang Harian
                    </p>
                    <p class="text-lg font-extrabold text-kementan-green">
                      Rp {{ formatNumber(selectedSbm.uang_harian) }}
                    </p>
                  </div>
                  <div class="grid grid-cols-2 gap-2 pt-2 border-t border-blue-100/50 text-[10px]">
                    <div>
                      <p class="font-bold text-blue-400 uppercase">
                        T. Bisnis
                      </p>
                      <p class="font-bold text-blue-900">
                        {{ formatSbmVal(selectedSbm.tiket_bisnis) }}
                      </p>
                    </div>
                    <div>
                      <p class="font-bold text-blue-400 uppercase">
                        T. Ekonomi
                      </p>
                      <p class="font-bold text-blue-900">
                        {{ formatSbmVal(selectedSbm.tiket_ekonomi) }}
                      </p>
                    </div>
                    <div>
                      <p class="font-bold text-blue-400 uppercase">
                        Taxi Jkt
                      </p>
                      <p class="font-bold text-blue-900">
                        {{ formatSbmVal(selectedSbm.taxi_jakarta) }}
                      </p>
                    </div>
                    <div>
                      <p class="font-bold text-blue-400 uppercase">
                        Taxi Daerah
                      </p>
                      <p class="font-bold text-blue-900">
                        {{ formatSbmVal(selectedSbm.taxi_daerah) }}
                      </p>
                    </div>
                  </div>
                    
                  <button
                    type="button"
                    class="w-full mt-2 py-2 bg-blue-600 text-white text-[10px] font-bold rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
                    @click="handleApplySbm"
                  >
                    ↓ Terapkan ke Form
                  </button>
                </div>
                <div
                  v-else
                  class="bg-gray-50 border border-gray-100 rounded-xl p-6 text-center mt-4"
                >
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
        <div
          v-if="successModal.isOpen"
          class="fixed inset-0 z-[10000] flex items-center justify-center p-4"
        >
          <div
            class="absolute inset-0 bg-gray-900/50"
            @click="successModal.isOpen = false"
          />
          
          <div 
            v-motion
            :initial="{ opacity: 0, scale: 0.95, y: 12 }"
            :enter="{ opacity: 1, scale: 1, y: 0, transition: { duration: 200 } }"
            class="relative bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl"
          >
            <div class="p-6 pb-2 text-center">
              <div class="w-14 h-14 rounded-full bg-emerald-50 mx-auto flex items-center justify-center mb-4">
                <CheckCircle
                  :size="28"
                  class="text-emerald-500"
                />
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
                    {{ successModal.item?.nama_lengkap || '???' }}
                  </p>
                </div>
                <div class="bg-emerald-50 p-3.5 rounded-xl">
                  <p class="text-[9px] font-bold text-emerald-400 uppercase tracking-widest mb-1">
                    Total Biaya
                  </p>
                  <p class="text-xs font-bold text-emerald-700">
                    Rp {{ formatNumber(successModal.item?.total_biaya) }}
                  </p>
                </div>
              </div>
            </div>
            <div class="p-5 pt-4 flex flex-col gap-2.5">
              <button 
                v-if="successModal.item?.file_link"
                class="w-full py-3 bg-emerald-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2.5 hover:bg-emerald-600 transition-colors text-sm" 
                @click="openFile(successModal.item.file_link)"
              >
                <Download :size="18" /> Download PDF
              </button>
              <p
                v-else
                class="text-center text-xs text-gray-400 font-semibold py-3"
              >
                PDF sedang diproses...
              </p>
              <button 
                class="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors" 
                @click="successModal.isOpen = false"
              >
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
        <div
          v-if="isProcessing"
          class="fixed inset-0 z-[11000] flex flex-col items-center justify-center p-6 bg-slate-900/80"
        >
          <div class="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <p class="mt-6 text-white font-bold tracking-widest uppercase animate-pulse">
            {{ processingMessage }}
          </p>
        </div>
      </transition>
    </Teleport>

    <!-- Global Notifications Modal -->
    <GlobalModal 
      :is-open="notificationModal.isOpen"
      :type="notificationModal.type"
      :title="notificationModal.title"
      :message="notificationModal.message"
      :confirm-text="notificationModal.confirmText"
      @close="notificationModal.isOpen = false"
      @confirm="() => { if(notificationModal.onConfirm) notificationModal.onConfirm(); notificationModal.isOpen = false }"
    />

    <!-- File Preview Modal -->
    <FilePreviewModal
      :is-open="showPreview"
      :file-url="previewUrl"
      @close="showPreview = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { 
  FileSignature, Search, Plus, Edit, Trash2, 
  Save, ChevronLeft, ChevronRight, Download, CheckCircle, ExternalLink, Eye, RefreshCw
} from 'lucide-vue-next'
import { fetchApi } from '../config/api'
import { useDataStore } from '../stores/useDataStore'
import { PegawaiData, SptjmData, SbmData, AdminData } from '../types/api'
import { formatSmartDateRange } from '../utils/date'
import { triggerDownload } from '../utils/drive'
import GlobalModal from '../components/GlobalModal.vue'
import SearchableDropdown from '../components/SearchableDropdown.vue'
import FilePreviewModal from '../components/FilePreviewModal.vue'

const ITEMS_PER_PAGE = 10

// Store
const dataStore = useDataStore()

// State
const sptjmList = ref<SptjmData[]>([])
const pegawaiList = ref<PegawaiData[]>([])
const sbmList = ref<SbmData[]>([])
const isLoading = ref(true)
const searchQuery = ref('')
const currentPage = ref(1)
const adminProfile = ref<AdminData | null>(null)
const viewMode = ref<'list'|'form'>('list')
const isEditMode = ref(false)
const isSubmitting = ref(false)
const isProcessing = ref(false)
const processingMessage = ref('')
const sbmQuery = ref('')

const formData = ref({
  id_sptjm: '', nama_lengkap: '', nip: '', jabatan: '', tujuan: '', 
  tanggal_perjalanan: '', tanggal_kembali: '', tiket_berangkat: 0, 
  tiket_pulang: 0, total_biaya: 0, tanggal_ttd: '', tim_poksi: '',
  biaya_sbm: 0, file_link: ''
})

const successModal = ref({
  isOpen: false,
  item: null as SptjmData | null
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

// Computed
const filteredList = computed(() => {
  return sptjmList.value.filter((s: SptjmData) => {
    const nama = String(s.nama_lengkap || '').toLowerCase()
    const tjn = String(s.tujuan || '').toLowerCase()
    const q = searchQuery.value.toLowerCase()
    return nama.includes(q) || tjn.includes(q)
  })
})

const totalPages = computed(() => Math.ceil(filteredList.value.length / ITEMS_PER_PAGE) || 1)
const safePage = computed(() => Math.min(currentPage.value, Math.max(1, totalPages.value)))
const paginatedList = computed(() => filteredList.value.slice((safePage.value - 1) * ITEMS_PER_PAGE, safePage.value * ITEMS_PER_PAGE))

const selectedSbm = computed(() => sbmList.value.find((s: SbmData) => s.ibu_kota === sbmQuery.value))

const pegawaiOptions = computed(() => pegawaiList.value.map((p, idx) => ({
  value: String(idx), 
  label: `${p.nama_lengkap} - ${p.jabatan || p.poksi || '-'}` 
})))

const selectedPegawaiIndex = computed(() => {
  const idx = pegawaiList.value.findIndex(p => p.nip === formData.value.nip && p.nama_lengkap === formData.value.nama_lengkap)
  return idx >= 0 ? String(idx) : ''
})

const sbmOptions = computed(() => sbmList.value.map((s: SbmData) => ({ 
  value: s.ibu_kota, 
  label: s.ibu_kota, 
  subtitle: s.tujuan_lengkap 
})))

const handlePegawaiChange = (strIdx: string) => {
  if (!strIdx) {
    formData.value.nama_lengkap = ''
    formData.value.jabatan = ''
    formData.value.nip = ''
    return
  }
  const p = pegawaiList.value[parseInt(strIdx)]
  if (p) {
    formData.value.nama_lengkap = p.nama_lengkap
    formData.value.jabatan = p.jabatan || ''
    formData.value.nip = p.nip || ''
  }
}

const totalSum = computed(() => {
  return Number(formData.value.tiket_berangkat || 0) + 
         Number(formData.value.tiket_pulang || 0)
})

// Lifecycle
onMounted(() => {
  const storedData = localStorage.getItem('adminData')
  if (storedData) {
    adminProfile.value = JSON.parse(storedData)
    const role = adminProfile.value?.role || 'Admin'
    const poksi = role === 'Super Admin' ? 'SEMUA' : (adminProfile.value?.tim_poksi || '')
    fetchData(poksi)
  }
})

// Reset page on search change
watch(searchQuery, () => {
  currentPage.value = 1
})

// Methods
const fetchData = async (tim_poksi: string) => {
  isLoading.value = true
  try {
    const needsPegawai = !dataStore.isCacheValid('pegawai')
    const needsSptjm = !dataStore.isCacheValid('sptjm')
    
    const fetchPromises = []
    if (needsPegawai) fetchPromises.push(fetchApi<PegawaiData[]>("GET_PEGAWAI"))
    else fetchPromises.push(Promise.resolve({ status: true, data: dataStore.pegawaiData }))
      
    if (needsSptjm) fetchPromises.push(fetchApi<SptjmData[]>("GET_SPTJM_LIST", { tim_poksi }))
    else fetchPromises.push(Promise.resolve({ status: true, data: dataStore.sptjmData }))

    const [resPegawai, resSptjm] = await Promise.all(fetchPromises)
    
    if (resPegawai.status && resPegawai.data) {
      pegawaiList.value = resPegawai.data as unknown as PegawaiData[]
      if (needsPegawai) dataStore.setPegawaiData(resPegawai.data as unknown as PegawaiData[])
    }
    
    if (resSptjm.status && resSptjm.data) {
      sptjmList.value = resSptjm.data as unknown as SptjmData[]
      if (needsSptjm) dataStore.setSptjmData(resSptjm.data as unknown as SptjmData[])
    }
  } catch {
    console.error("Gagal menarik data")
  } finally {
    isLoading.value = false
  }
}

const fetchSbmData = async () => {
  try {
    if (dataStore.isCacheValid('sbm')) {
      sbmList.value = dataStore.sbmData
    } else {
      const res = await fetchApi<SbmData[]>("GET_SBM")
      if (res.status && res.data) {
        sbmList.value = res.data
        dataStore.setSbmData(res.data)
      }
    }
  } catch {
    console.error("Gagal menarik data SBM")
  }
}

const normalizeDate = (val: string | null | undefined) => {
  if (!val) return ''
  try {
    const d = new Date(val)
    if (isNaN(d.getTime())) return String(val)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  } catch {
    return String(val)
  }
}

const openForm = (data: SptjmData | null = null) => {
  if (sbmList.value.length === 0) fetchSbmData()
  
  if (data) {
    formData.value = { 
      ...data,
      tanggal_perjalanan: normalizeDate(data.tanggal_perjalanan),
      tanggal_kembali: normalizeDate(data.tanggal_kembali),
      tanggal_ttd: normalizeDate(data.tanggal_ttd),
      file_link: data.file_link || ''
    }
    isEditMode.value = true
  } else {
    formData.value = {
      id_sptjm: '', nama_lengkap: '', nip: '', jabatan: '', tujuan: '', 
      tanggal_perjalanan: '', tanggal_kembali: '', tiket_berangkat: 0, 
      tiket_pulang: 0, total_biaya: 0, tanggal_ttd: new Date().toISOString().split('T')[0], 
      tim_poksi: adminProfile.value?.tim_poksi || '',
      biaya_sbm: 0, file_link: ''
    }
    isEditMode.value = false
  }
  sbmQuery.value = ''
  viewMode.value = 'form'
}

const closeForm = () => {
  viewMode.value = 'list'
}

const handleApplySbm = () => {
  if (selectedSbm.value) {
    formData.value.biaya_sbm = Number(selectedSbm.value.tiket_ekonomi) || 0
    if (!formData.value.tujuan) formData.value.tujuan = selectedSbm.value.tujuan_lengkap || ''
  }
}

const handleSave = async () => {
  if (!formData.value.nip) {
    showNotification('warning', 'Data Belum Lengkap', 'Mohon pilih pegawai pelaksana terlebih dahulu.')
    return
  }
  if (!formData.value.tujuan) {
    showNotification('warning', 'Data Belum Lengkap', 'Mohon isi tujuan perjalanan.')
    return
  }
  if (!formData.value.tanggal_perjalanan) {
    showNotification('warning', 'Data Belum Lengkap', 'Mohon isi tanggal mulai perjalanan.')
    return
  }
  if (!formData.value.tanggal_kembali) {
    showNotification('warning', 'Data Belum Lengkap', 'Mohon isi tanggal selesai perjalanan.')
    return
  }
  if (!formData.value.tanggal_ttd) {
    showNotification('warning', 'Data Belum Lengkap', 'Mohon isi tanggal surat dibuat.')
    return
  }

  isSubmitting.value = true
  formData.value.total_biaya = totalSum.value

  try {
    const result = await fetchApi<{ id_sptjm?: string, file_link?: string }>("SAVE_SPTJM", { data: formData.value })
    
    if (result.status) {
      if (result.data?.id_sptjm) {
        formData.value.id_sptjm = result.data.id_sptjm
      }
      const savedItem = { ...formData.value, file_link: (result.data as { file_link?: string })?.file_link || null } as SptjmData
      formData.value.total_biaya = totalSum.value
      
      successModal.value = { isOpen: true, item: savedItem }
      dataStore.invalidateCache('sptjm')
      closeForm()
      await fetchData(adminProfile.value!.tim_poksi)
    } else {
      showNotification('error', 'Gagal Menyimpan', result.message || 'Terjadi kesalahan saat menghubungi server.')
    }
  } catch {
    showNotification('error', 'Gagal Jaringan', 'Tidak dapat menghubungi server. Pastikan koneksi internet Anda stabil.')
  } finally {
    isSubmitting.value = false
  }
}

const handleDelete = (id: string) => {
  showNotification(
    'confirm', 
    'Konfirmasi Hapus', 
    'Apakah Anda yakin ingin menghapus dokumen SPTJM ini? Tindakan ini tidak dapat dibatalkan.',
    async () => {
      isProcessing.value = true
      processingMessage.value = 'Menghapus Data...'
      try {
        const result = await fetchApi("DELETE_SPTJM", { id_sptjm: id })
        if (result.status) {
          dataStore.invalidateCache('sptjm')
          await fetchData(adminProfile.value?.tim_poksi || '')
          showNotification('success', 'Hapus Berhasil', 'Dokumen SPTJM telah dihapus dari sistem.')
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
  dataStore.invalidateCache('sptjm')
  await fetchData(adminProfile.value?.tim_poksi || '')
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

// Helpers
const formatNumber = (val: number | string | null | undefined) => {
  return String(val || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

const formatNumberForInput = (val: number | string | null | undefined) => {
  if (val === 0 || val === '0' || !val) return '';
  return String(val).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

const updateNumberField = (field: keyof typeof formData.value, val: string) => {
  const numText = val.toString().replace(/[^0-9]/g, '');
  (formData.value as Record<string, unknown>)[field] = numText ? parseInt(numText, 10) : 0;
}

const formatSbmVal = (val: number | string | null | undefined) => {
  return val ? `Rp ${formatNumber(val)}` : '-'
}




</script>

<style scoped>
/* Modal Transition */
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
