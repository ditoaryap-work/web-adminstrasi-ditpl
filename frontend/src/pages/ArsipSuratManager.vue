<template>
  <div class="space-y-6 pb-12">
    <!-- VIEW MODE: LIST -->
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
            <Inbox :size="20" />
            <span class="text-xs font-bold tracking-[0.3em] uppercase">Manajemen Dokumen</span>
          </div>
          <h1 class="text-3xl font-extrabold text-gray-800">
            Arsip Persuratan
          </h1>
          <p class="text-gray-500 mt-2 text-sm max-w-lg font-medium">
            Registrasi surat masuk, keluar, dan notulensi acara Direktorat secara digital.
          </p>
        </div>

        <button
          class="bg-kementan-green text-white px-6 py-3 rounded-xl font-bold shadow-md shadow-kementan-green/20 flex items-center gap-3 hover:bg-[#004d26] transition-all text-sm"
          @click="openForm()"
        >
          <Plus :size="18" />
          <span>Registrasi Surat Baru</span>
        </button>
      </div>

      <!-- Filter & Search -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 10 }"
        :enter="{ opacity: 1, y: 0 }"
        class="glass-card p-4 rounded-2xl flex flex-col lg:flex-row gap-4"
      >
        <div class="flex items-center gap-1 sm:gap-2 bg-gray-50 p-1 rounded-xl border border-gray-100 overflow-x-auto custom-scrollbar shrink-0 max-w-full">
          <button
            v-for="tab in filterTabs"
            :key="tab.value"
            class="px-3 sm:px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap"
            :class="filterTipe === tab.value ? 'bg-white text-kementan-green shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'"
            @click="filterTipe = tab.value"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="relative flex-1">
          <Search
            class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            :size="18"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari berdasarkan nomor surat, perihal, atau asal tujuan..."
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
          v-if="isLoading && suratList.length === 0"
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
          <table class="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr class="bg-gray-50/80 text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] border-b border-gray-200">
                <th class="py-5 px-6">
                  Dokumen & Asal/Tujuan
                </th>
                <th class="py-5 px-4 text-center">
                  Informasi
                </th>
                <th class="py-5 px-6">
                  Perihal & Status
                </th>
                <th class="py-5 px-6 text-center">
                  Aksi Dokumen
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white/40">
              <template v-if="paginatedList.length > 0">
                <tr
                  v-for="(surat, i) in paginatedList"
                  :key="surat.id_surat"
                  v-motion
                  :initial="{ opacity: 0, y: 5 }"
                  :enter="{ opacity: 1, y: 0, transition: { delay: i * 30 } }"
                  class="group hover:bg-emerald-50/30 transition-colors"
                >
                  <td class="py-4 px-6">
                    <div>
                      <div class="flex items-center gap-2 mb-1">
                        <span
                          class="inline-block px-2 py-0.5 rounded-md text-[9px] font-bold tracking-widest uppercase border"
                          :class="surat.tipe_surat === 'Masuk' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-purple-50 text-purple-600 border-purple-100'"
                        >
                          {{ surat.tipe_surat }}
                        </span>
                      </div>
                      <p class="text-sm font-bold text-gray-800">
                        {{ surat.nomor_surat || '[Nomor Belum Diisi]' }}
                      </p>
                      <p class="text-[10px] text-gray-400 font-medium mt-0.5">
                        {{ surat.asal_tujuan }}
                      </p>
                      <p class="text-[10px] text-gray-500 font-bold tracking-widest mt-1 uppercase">
                        {{ formatIndoDate(surat.tanggal_surat) }}
                        <span
                          v-if="surat.created_at"
                          class="mx-1 lowercase text-gray-300 font-normal"
                        >|</span>
                        <span
                          v-if="surat.created_at"
                          class="text-[9px] font-normal capitalize opacity-75"
                        >Dibuat: {{ surat.created_at }}</span>
                      </p>
                    </div>
                  </td>
                  <td class="py-4 px-4 text-center">
                    <div class="flex flex-col items-center gap-1.5">
                      <span class="inline-block px-3 py-1 rounded-full text-[10px] font-bold border border-gray-200 bg-gray-50 uppercase tracking-tighter">
                        {{ surat.kategori_surat }}
                      </span>
                      <span
                        class="text-[9px] font-bold uppercase tracking-widest"
                        :class="{
                          'text-red-500': surat.sifat_surat === 'Rahasia' || surat.sifat_surat === 'Penting',
                          'text-amber-500': surat.sifat_surat === 'Segera',
                          'text-kementan-green': surat.sifat_surat === 'Biasa'
                        }"
                      >
                        {{ surat.sifat_surat }}
                      </span>
                    </div>
                  </td>
                  <td class="py-4 px-6">
                    <div class="max-w-md">
                      <p class="text-xs text-gray-600 leading-relaxed font-medium line-clamp-2">
                        {{ surat.perihal }}
                      </p>
                      <div
                        v-if="surat.kategori_surat === 'Undangan'"
                        class="mt-1.5"
                      >
                        <div
                          class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-bold border"
                          :class="surat.file_notulensi ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-500 border-rose-100'"
                        >
                          <component
                            :is="surat.file_notulensi ? CheckCircle2 : AlertCircle"
                            :size="11"
                          />
                          {{ surat.file_notulensi ? 'Notulensi Tersedia' : 'Belum Ada Notulensi' }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="py-4 px-6 text-center">
                    <div class="flex items-center justify-center gap-2">
                      <!-- SURAT ACTIONS -->
                      <div v-if="surat.file_surat" class="flex gap-1 items-center bg-blue-50/50 p-1 rounded-xl border border-blue-100">
                        <button
                          class="px-2 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold text-[10px] flex items-center gap-1.5 shadow-sm uppercase tracking-wider"
                          title="Preview Surat"
                          @click="openPreview(surat.file_surat)"
                        >
                          <Eye :size="12" /> Preview
                        </button>
                        <button
                          class="p-1.5 bg-white rounded-lg text-indigo-600 border border-indigo-200 hover:bg-indigo-50 shadow-sm transition-all"
                          title="Download Surat"
                          @click="triggerDownload(surat.file_surat, `Surat_${surat.nomor_surat.replace(/\//g, '_')}`)"
                        >
                          <Download :size="12" />
                        </button>
                      </div>

                      <!-- NOTULENSI ACTIONS -->
                      <div v-if="surat.file_notulensi" class="flex gap-1 items-center bg-emerald-50/50 p-1 rounded-xl border border-emerald-100">
                        <button
                          class="px-2 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-bold text-[10px] flex items-center gap-1.5 shadow-sm uppercase tracking-wider"
                          title="Preview Notulensi"
                          @click="openPreview(surat.file_notulensi)"
                        >
                          <Eye :size="12" /> Preview
                        </button>
                        <button
                          class="p-1.5 bg-white rounded-lg text-emerald-600 border border-emerald-200 hover:bg-emerald-50 shadow-sm transition-all"
                          title="Download Notulensi"
                          @click="triggerDownload(surat.file_notulensi, `Ntl_${surat.nomor_surat.replace(/\//g, '_')}`)"
                        >
                          <Download :size="12" />
                        </button>
                      </div>
                      <button
                        v-else-if="surat.kategori_surat === 'Undangan'"
                        class="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors font-bold text-[10px] flex items-center gap-1.5 shadow-sm uppercase tracking-wider"
                        title="Isi Notulensi / Tindak Lanjut"
                        @click="openNotulensiModal(surat)"
                      >
                        <NotebookPen :size="13" /> Isi Tindak Lanjut
                      </button>

                      <!-- GLOBAL ACTIONS -->
                      <div class="flex gap-1 items-center ml-2 border-l pl-3 border-gray-100">
                        <button
                          class="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors font-bold text-[10px] flex items-center gap-1.5 shadow-sm uppercase tracking-wider"
                          title="Edit Data"
                          @click="openForm(surat)"
                        >
                          <Edit :size="13" /> Edit
                        </button>
                        <button
                          class="px-3 py-1.5 bg-rose-50 text-rose-700 rounded-lg border border-rose-200 hover:bg-rose-100 transition-colors font-bold text-[10px] flex items-center gap-1.5 shadow-sm uppercase tracking-wider"
                          title="Hapus Data"
                          @click="handleDelete(surat.id_surat)"
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
                  colspan="4"
                  class="py-16 text-center"
                >
                  <div class="flex flex-col items-center gap-3">
                    <Inbox
                      :size="32"
                      class="text-gray-300"
                    />
                    <p class="text-gray-400 font-medium text-sm">
                      Berdasarkan pencarian, tidak ditemukan data surat yang sesuai.
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
            Menampilkan <span class="font-bold text-gray-700">{{ (currentPage - 1) * ITEMS_PER_PAGE + 1 }}–{{ Math.min(currentPage * ITEMS_PER_PAGE, filteredList.length) }}</span> dari <span class="font-bold text-gray-700">{{ filteredList.length }}</span>
          </p>
          <div class="flex gap-1">
            <button
              :disabled="currentPage <= 1"
              class="p-1.5 rounded-lg border bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-30"
              @click="currentPage--"
            >
              <ChevronLeft :size="16" />
            </button>
            <button
              :disabled="currentPage >= totalPages"
              class="p-1.5 rounded-lg border bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-30"
              @click="currentPage++"
            >
              <ChevronRight :size="16" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- VIEW MODE: FORM -->
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
        <ChevronLeft :size="18" /> Kembali ke Daftar Arsip
      </button>

      <div class="glass-card rounded-3xl overflow-hidden shadow-lg border border-gray-200">
        <!-- Form Header -->
        <div class="bg-gradient-to-r from-emerald-600 to-kementan-green px-8 py-7 text-white relative overflow-hidden">
          <div class="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
            <Inbox :size="200" />
          </div>
          <h2 class="text-2xl font-extrabold">
            {{ isEditMode ? 'Edit Data Arsip Surat' : 'Registrasi Surat Baru' }}
          </h2>
          <p class="text-emerald-50 font-medium text-sm mt-1 opacity-90">
            Lengkapi detail surat dengan teliti dan akurat.
          </p>
        </div>

        <form
          class="p-8 space-y-10"
          @submit.prevent="handleSubmit"
        >
          <!-- SECTION 1: Klasifikasi -->
          <div class="space-y-6">
            <div class="flex items-center gap-3 border-b border-gray-100 pb-4">
              <span class="w-8 h-8 rounded-lg bg-emerald-50 text-kementan-green flex items-center justify-center font-black text-xs shadow-inner">01</span>
              <h4 class="text-xs font-black text-gray-700 tracking-widest uppercase">
                Klasifikasi & Metadata Dokumen
              </h4>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="space-y-2">
                <label class="field-label">Tipe Surat <span class="text-red-400">*</span></label>
                <div class="field-select-wrapper">
                  <select
                    v-model="formData.tipe_surat"
                    required
                    class="field-select"
                  >
                    <option value="Masuk">
                      Surat Masuk
                    </option>
                    <option value="Keluar">
                      Surat Keluar
                    </option>
                  </select>
                  <ChevronDown
                    class="field-select-icon"
                    :size="16"
                  />
                </div>
              </div>
              <div class="space-y-2">
                <label class="field-label">Kategori Dokumen <span class="text-red-400">*</span></label>
                <div class="field-select-wrapper">
                  <select
                    v-model="formData.kategori_surat"
                    required
                    class="field-select"
                  >
                    <option
                      v-for="cat in categories"
                      :key="cat"
                      :value="cat"
                    >
                      {{ cat }}
                    </option>
                  </select>
                  <ChevronDown
                    class="field-select-icon"
                    :size="16"
                  />
                </div>
              </div>
              <div class="space-y-2">
                <label class="field-label">Tingkat Sifat <span class="text-red-400">*</span></label>
                <div class="field-select-wrapper">
                  <select
                    v-model="formData.sifat_surat"
                    required
                    class="field-select"
                  >
                    <option
                      v-for="s in priorities"
                      :key="s"
                      :value="s"
                    >
                      {{ s }}
                    </option>
                  </select>
                  <ChevronDown
                    class="field-select-icon"
                    :size="16"
                  />
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="space-y-2">
                <label class="field-label">Nomor Surat Resmi <span class="text-red-400">*</span></label>
                <input
                  v-model="formData.nomor_surat"
                  type="text"
                  required
                  class="field-input"
                  placeholder="Nomor tertera di dokumen"
                >
              </div>
              <div class="space-y-2">
                <label class="field-label">Tanggal Masuk/Keluar <span class="text-red-400">*</span></label>
                <input
                  v-model="formData.tanggal_masuk"
                  type="date"
                  required
                  class="field-input"
                >
              </div>
              <div class="space-y-2">
                <label class="field-label">Tanggal Lembar Surat <span class="text-red-400">*</span></label>
                <input
                  v-model="formData.tanggal_surat"
                  type="date"
                  required
                  class="field-input"
                >
              </div>
            </div>
          </div>

          <!-- SECTION 2: Konten & Relasi -->
          <div class="space-y-6">
            <div class="flex items-center gap-3 border-b border-gray-100 pb-4">
              <span class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs shadow-inner">02</span>
              <h4 class="text-xs font-black text-gray-700 tracking-widest uppercase">
                Konten & Entitas Relasi
              </h4>
            </div>

            <div class="space-y-2">
              <label class="field-label">
                {{ formData.tipe_surat === 'Masuk' ? 'Instansi Asal' : 'Instansi/Pihak Tujuan' }}
                <span class="text-red-400">*</span>
              </label>
              <input
                v-model="formData.asal_tujuan"
                type="text"
                required
                class="field-input"
                placeholder="Nama Instansi / Biro / Tim / Perorangan"
              >
            </div>

            <div class="space-y-2">
              <label class="field-label">Ringkasan Perihal <span class="text-red-400">*</span></label>
              <textarea
                v-model="formData.perihal"
                rows="3"
                required
                class="field-input"
                placeholder="Tuliskan pokok bahasan surat ini..."
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="field-label">Mulai Acara <span class="text-gray-300">(Opsional)</span></label>
                <input
                  v-model="formData.tgl_acara_mulai"
                  type="date"
                  class="field-input"
                >
              </div>
              <div class="space-y-2">
                <label class="field-label">Selesai Acara <span class="text-gray-300">(Opsional)</span></label>
                <input
                  v-model="formData.tgl_acara_selesai"
                  type="date"
                  class="field-input"
                >
              </div>
            </div>
          </div>

          <!-- SECTION 3: Disposisi -->
          <div class="space-y-6">
            <div class="flex items-center gap-3 border-b border-gray-100 pb-4">
              <span class="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-black text-xs shadow-inner">03</span>
              <h4 class="text-xs font-black text-gray-700 tracking-widest uppercase">
                Disposisi & Hasil Kegiatan
              </h4>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Disposisi Smart Search -->
              <div class="space-y-4">
                <div class="space-y-2">
                  <label class="field-label">Disposisikan Ke <span class="text-gray-300">(Opsional)</span></label>
                  <div class="relative">
                    <Search
                      class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      :size="18"
                    />
                    <input
                      v-model="pegawaiSearch"
                      type="text"
                      class="field-input !pl-12"
                      placeholder="Ketik nama pegawai untuk mencari..."
                      autocomplete="off"
                      @input="handlePegawaiSearch"
                      @blur="clearSearchDelayed"
                    >
                    <!-- Dropdown Hasil Pencarian -->
                    <div
                      v-if="showPegawaiDropdown && filteredPegawai.length > 0"
                      class="absolute z-50 left-0 right-0 mt-1 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                    >
                      <div
                        v-for="p in filteredPegawai"
                        :key="p.nip"
                        class="px-5 py-3.5 hover:bg-emerald-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0"
                        @mousedown.prevent="addDisposisi(p)"
                      >
                        <p class="text-xs font-bold text-gray-800">
                          {{ p.namaLengkap }}
                        </p>
                        <p class="text-[10px] text-gray-400 font-medium tracking-wide uppercase">
                          {{ p.jabatan || p.poksi || '-' }}
                        </p>
                      </div>
                    </div>
                    <div
                      v-else-if="showPegawaiDropdown && pegawaiSearch.length >= 2 && filteredPegawai.length === 0"
                      class="absolute z-50 left-0 right-0 mt-1 bg-white rounded-2xl shadow-xl border border-gray-100 px-5 py-4 text-xs text-gray-400 font-medium"
                    >
                      Tidak ada pegawai ditemukan.
                    </div>
                  </div>
                  <!-- Disposisi Tags -->
                  <div class="flex flex-wrap gap-2 min-h-[44px] p-3 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <span
                      v-if="formData.disposisi_ke.length === 0"
                      class="text-[10px] text-gray-400 italic self-center"
                    >Belum ada pegawai dipilih...</span>
                    <div
                      v-for="(name, idx) in formData.disposisi_ke"
                      :key="idx"
                      class="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-emerald-100 text-kementan-green text-[11px] font-bold shadow-sm"
                    >
                      <span>{{ name }}</span>
                      <button
                        type="button"
                        class="hover:text-red-500 transition-colors"
                        @click="removeDisposisi(idx)"
                      >
                        <X :size="12" />
                      </button>
                    </div>
                  </div>
                </div>
                <div class="space-y-2">
                  <label class="field-label">Tanggal Disposisi <span class="text-gray-300">(Opsional)</span></label>
                  <input
                    v-model="formData.tgl_disposisi"
                    type="date"
                    class="field-input"
                  >
                </div>
              </div>

              <!-- Tindak Lanjut -->
              <div class="space-y-2">
                <label class="field-label">Tindak Lanjut / Notulensi Teks <span class="text-gray-300">(Opsional)</span></label>
                <textarea
                  id="field-notulensi"
                  v-model="formData.tindak_lanjut"
                  rows="8"
                  class="field-input min-h-[180px]"
                  placeholder="Berikan catatan, hasil keputusan, atau ringkasan notulensi kegiatan..."
                />
              </div>
            </div>
          </div>

          <!-- SECTION 4: Upload Berkas -->
          <div class="space-y-6">
            <div class="flex items-center gap-3 border-b border-gray-100 pb-4">
              <span class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xs shadow-inner">04</span>
              <h4 class="text-xs font-black text-gray-700 tracking-widest uppercase">
                Digitalisasi Berkas (Google Drive)
              </h4>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- File Surat -->
              <div class="space-y-2">
                <label class="field-label">File Lembar Surat <span class="text-gray-300">(PDF/Gambar)</span></label>
                <div
                  class="h-32 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:border-kementan-green hover:bg-emerald-50 transition-all group"
                  @click="(fileSuratRef as HTMLInputElement)?.click()"
                >
                  <input
                    ref="fileSuratRef"
                    type="file"
                    class="hidden"
                    accept=".pdf,image/*"
                    @change="(e) => handleFileUpload(e, 'file_surat')"
                  >
                  <div
                    v-if="!files.file_surat && !formData.file_surat"
                    class="flex flex-col items-center gap-1"
                  >
                    <UploadCloud
                      :size="24"
                      class="text-gray-400 group-hover:text-kementan-green transition-colors"
                    />
                    <span class="text-[10px] font-black text-gray-500 uppercase">Klik untuk Unggah Berkas</span>
                  </div>
                  <div
                    v-else
                    class="flex flex-col items-center w-full px-6 gap-1"
                  >
                    <FileText
                      :size="24"
                      class="text-kementan-green"
                    />
                    <span class="text-[10px] font-black text-kementan-green uppercase line-clamp-1 max-w-full">
                      {{ files.file_surat?.name ?? 'Berkas Tersimpan' }}
                    </span>
                    <span
                      v-if="files.file_surat"
                      class="text-[9px] font-bold text-gray-400 uppercase"
                    >
                      {{ (files.file_surat.size / 1024 / 1024).toFixed(2) }} MB
                    </span>
                    <span
                      v-else
                      class="px-2 py-0.5 rounded bg-emerald-100 text-[8px] text-kementan-green font-black"
                    >DRIVE CLOUD</span>
                  </div>
                </div>
                <p
                  v-if="formData.file_surat && !files.file_surat"
                  class="text-[9px] text-center font-bold text-gray-400 italic"
                >
                  File saat ini sudah tersimpan di G-Drive. Upload baru akan menggantikannya.
                </p>
              </div>

              <!-- File Notulensi -->
              <div class="space-y-2">
                <label class="field-label">File Notulensi/Lampiran <span class="text-gray-300">(PDF/Gambar)</span></label>
                <div
                  class="h-32 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-all group"
                  @click="(fileNotulensiRef as HTMLInputElement)?.click()"
                >
                  <input
                    ref="fileNotulensiRef"
                    type="file"
                    class="hidden"
                    accept=".pdf,image/*"
                    @change="(e) => handleFileUpload(e, 'file_notulensi')"
                  >
                  <div
                    v-if="!files.file_notulensi && !formData.file_notulensi"
                    class="flex flex-col items-center gap-1"
                  >
                    <UploadCloud
                      :size="24"
                      class="text-gray-400 group-hover:text-emerald-500 transition-colors"
                    />
                    <span class="text-[10px] font-black text-gray-500 uppercase">Klik untuk Lampirkan Hasil</span>
                  </div>
                  <div
                    v-else
                    class="flex flex-col items-center w-full px-6 gap-1"
                  >
                    <NotebookPen
                      :size="24"
                      class="text-emerald-600"
                    />
                    <span class="text-[10px] font-black text-emerald-700 uppercase line-clamp-1 max-w-full">
                      {{ files.file_notulensi?.name ?? 'Notulensi Tersimpan' }}
                    </span>
                    <span
                      v-if="files.file_notulensi"
                      class="text-[9px] font-bold text-gray-400 uppercase"
                    >
                      {{ (files.file_notulensi.size / 1024 / 1024).toFixed(2) }} MB
                    </span>
                    <span
                      v-else
                      class="px-2 py-0.5 rounded bg-emerald-100 text-[8px] text-emerald-600 font-black"
                    >DRIVE CLOUD</span>
                  </div>
                </div>
                <p
                  v-if="formData.file_notulensi && !files.file_notulensi"
                  class="text-[9px] text-center font-bold text-gray-400 italic"
                >
                  Berkas pendukung tersedia di cloud.
                </p>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="pt-8 border-t border-gray-100 flex gap-4">
            <button
              type="button"
              class="px-6 py-3.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm w-40"
              @click="closeForm"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="isProcessing"
              class="flex-1 px-6 py-3.5 bg-kementan-green text-white font-bold rounded-xl hover:bg-[#004d26] transition-all flex justify-center items-center gap-3 shadow-md shadow-kementan-green/20 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed text-sm uppercase tracking-widest"
            >
              <template v-if="isProcessing">
                <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Dalam Proses...</span>
              </template>
              <template v-else>
                {{ isEditMode ? 'Perbarui Data Arsip' : 'Simpan & Unggah Berkas' }}
              </template>
            </button>
          </div>
        </form>
      </div>
    </div>

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

    <!-- Global Notification Modal -->
    <GlobalModal
      :is-open="notificationModal.isOpen"
      :type="notificationModal.type"
      :title="notificationModal.title"
      :message="notificationModal.message"
      :confirm-text="notificationModal.confirmText"
      @close="notificationModal.isOpen = false"
      @confirm="notificationModal.onConfirm"
    />

    <!-- Notulensi/Tindak Lanjut Modal -->
    <Teleport to="body">
      <transition name="fade">
        <div
          v-if="showNotulensiModal"
          class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm"
        >
          <div
            v-motion
            :initial="{ scale: 0.95, opacity: 0 }"
            :enter="{ scale: 1, opacity: 1 }"
            class="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div class="flex items-center gap-3">
                <NotebookPen
                  class="text-kementan-green"
                  :size="20"
                />
                <h3 class="font-extrabold text-gray-800 tracking-wide">
                  Input Tindak Lanjut / Notulensi
                </h3>
              </div>
              <button
                class="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                @click="closeForm"
              >
                <X :size="20" />
              </button>
            </div>
            
            <div class="p-6 overflow-y-auto space-y-6">
              <div class="space-y-2">
                <label class="field-label">Hasil / Catatan (Opsional)</label>
                <textarea
                  v-model="formData.tindak_lanjut"
                  rows="6"
                  class="field-input min-h-[140px]"
                  placeholder="Berikan catatan, hasil keputusan, atau ringkasan notulensi kegiatan..."
                />
              </div>
              
              <div class="space-y-2">
                <label class="field-label">File Notulensi / Hasil <span class="text-gray-300">(Opsional, Maks 5MB)</span></label>
                <div class="flex flex-col sm:flex-row items-center gap-4">
                  <label class="px-5 py-3.5 bg-blue-50 text-blue-700 font-bold text-sm tracking-wider rounded-xl cursor-pointer hover:bg-blue-100 transition-colors border border-blue-200 shadow-sm w-full sm:w-auto text-center shrink-0">
                    <span>Pilih File PDF</span>
                    <input
                      type="file"
                      class="hidden"
                      accept=".pdf"
                      @change="(e) => handleFileUpload(e, 'file_notulensi')"
                    >
                  </label>
                  <div
                    v-if="files.file_notulensi"
                    class="flex items-center gap-2 text-sm text-gray-600 truncate border border-gray-100 px-4 py-2.5 rounded-xl w-full bg-gray-50 shadow-sm"
                  >
                    <FileText
                      :size="16"
                      class="text-blue-500 shrink-0"
                    />
                    <span class="truncate">{{ files.file_notulensi.name }}</span>
                  </div>
                  <div
                    v-else-if="formData.file_notulensi"
                    class="flex items-center justify-between border border-emerald-100 px-4 py-2.5 rounded-xl w-full bg-emerald-50 shadow-sm gap-2"
                  >
                    <div class="flex items-center gap-2 truncate text-emerald-700 font-medium">
                      <CheckCircle2
                        :size="16"
                        class="shrink-0"
                      />
                      <span class="text-sm truncate">Notulensi tersimpan</span>
                    </div>
                  </div>
                </div>
                <p
                  v-if="formData.file_notulensi && !files.file_notulensi"
                  class="text-[10px] text-gray-400 font-medium mt-1"
                >
                  Upload file baru jika ingin mengganti file yang lama.
                </p>
              </div>
            </div>

            <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-4">
              <button
                class="px-6 py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors text-sm w-32"
                @click="closeForm"
              >
                Batal
              </button>
              <button
                :disabled="isProcessing"
                class="flex-1 px-6 py-3 bg-kementan-green text-white font-bold rounded-xl hover:bg-[#004d26] transition-colors shadow-md shadow-kementan-green/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                @click="handleSubmit"
              >
                <template v-if="isProcessing">
                  <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Menyimpan...</span>
                </template>
                <template v-else>
                  <Save :size="18" /> Simpan Data
                </template>
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- File Preview Modal -->
    <FilePreviewModal
      :is-open="showPreview"
      :file-url="previewUrl"
      @close="showPreview = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import type { Ref } from 'vue'
import GlobalModal from '../components/GlobalModal.vue'
import FilePreviewModal from '../components/FilePreviewModal.vue'
import { useDataStore } from '../stores/useDataStore'
import api from '../config/api'
import { triggerDownload } from '../utils/drive'
import type { SuratData, PegawaiData } from '../types/api'
import {
  Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight, ChevronDown,
  Inbox, FileText, UploadCloud, X, CheckCircle2, AlertCircle, NotebookPen, Download, Save, Eye, ExternalLink, RefreshCw
} from 'lucide-vue-next'

// ─── CONSTS ──────────────────────────────────────────────
const ITEMS_PER_PAGE = 10

const filterTabs = [
  { value: 'Semua', label: 'Semua Surat' },
  { value: 'Masuk', label: 'Surat Masuk' },
  { value: 'Keluar', label: 'Surat Keluar' },
  { value: 'BelumTindakLanjut', label: 'Belum Ada Hasil' },
]
const categories = ['Surat Dinas', 'Undangan', 'Nota Dinas', 'Laporan', 'Sertifikat', 'Lainnya']
const priorities = ['Biasa', 'Segera', 'Penting', 'Rahasia']

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

// Template refs dengan tipe benar
const fileSuratRef = ref<HTMLInputElement | null>(null)
const fileNotulensiRef = ref<HTMLInputElement | null>(null)

// File state dengan tipe eksplisit
const files: Ref<{ file_surat: File | null; file_notulensi: File | null }> = ref({
  file_surat: null,
  file_notulensi: null,
})

// Disposisi search state
const pegawaiSearch = ref('')
const filteredPegawai = ref<PegawaiData[]>([])
const showPegawaiDropdown = ref(false)

// Notification state
const notificationModal = ref({
  isOpen: false,
  type: 'success' as 'success' | 'error' | 'warning' | 'info' | 'confirm',
  title: '',
  message: '',
  confirmText: '',
  onConfirm: () => {},
})

// Form Data dengan tipe eksplisit
interface FormData {
  id_surat: string
  tim_poksi: string
  tipe_surat: 'Masuk' | 'Keluar'
  kategori_surat: string
  sifat_surat: string
  nomor_surat: string
  tanggal_masuk: string
  tanggal_surat: string
  asal_tujuan: string
  perihal: string
  tgl_acara_mulai: string
  tgl_acara_selesai: string
  disposisi_ke: string[]
  tgl_disposisi: string
  tindak_lanjut: string
  file_surat: string
  file_notulensi: string
  created_at: string
}

const getDefaultForm = (): FormData => ({
  id_surat: '',
  tim_poksi: '',
  tipe_surat: 'Masuk',
  kategori_surat: 'Surat Dinas',
  sifat_surat: 'Biasa',
  nomor_surat: '',
  tanggal_masuk: new Date().toISOString().split('T')[0],
  tanggal_surat: new Date().toISOString().split('T')[0],
  asal_tujuan: '',
  perihal: '',
  tgl_acara_mulai: '',
  tgl_acara_selesai: '',
  disposisi_ke: [],
  tgl_disposisi: '',
  tindak_lanjut: '',
  file_surat: '',
  file_notulensi: '',
  created_at: '',
})

const formData = ref<FormData>(getDefaultForm())

// ─── COMPUTED ─────────────────────────────────────────────
const adminData = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('adminData') || '{}')
  } catch {
    return {}
  }
})

const filteredList = computed(() => {
  let list = suratList.value

  // Role filter (backend sudah filter, ini safety net di FE)
  if (adminData.value.role !== 'Super Admin' && adminData.value.tim_poksi) {
    list = list.filter(s => s.tim_poksi === adminData.value.tim_poksi)
  }

  // Tipe filter
  if (filterTipe.value === 'BelumTindakLanjut') {
    list = list.filter(s => !s.file_notulensi && (!s.tindak_lanjut || s.tindak_lanjut.trim() === ''))
  } else if (filterTipe.value !== 'Semua') {
    list = list.filter(s => s.tipe_surat === filterTipe.value)
  }

  // Search filter
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(s =>
      (s.nomor_surat ?? '').toLowerCase().includes(q) ||
      (s.perihal ?? '').toLowerCase().includes(q) ||
      (s.asal_tujuan ?? '').toLowerCase().includes(q)
    )
  }

  return list
})

const totalPages = computed(() => Math.ceil(filteredList.value.length / ITEMS_PER_PAGE) || 1)
const paginatedList = computed(() => {
  const page = Math.min(currentPage.value, totalPages.value)
  return filteredList.value.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
})

// ─── HELPERS ──────────────────────────────────────────────
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
    onConfirm: onConfirm ?? (() => {}),
  }
}

const formatIndoDate = (dateStr: string): string => {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return dateStr
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



// ─── METHODS ──────────────────────────────────────────────
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

const handlePegawaiSearch = () => {
  const q = pegawaiSearch.value.toLowerCase().trim()
  if (q.length < 2) {
    filteredPegawai.value = []
    showPegawaiDropdown.value = false
    return
  }
  filteredPegawai.value = pegawaiList.value.filter(p =>
    p.namaLengkap.toLowerCase().includes(q) ||
    p.nip.toLowerCase().includes(q)
  ).slice(0, 6)
  showPegawaiDropdown.value = true
}

const addDisposisi = (pegawai: PegawaiData) => {
  if (!formData.value.disposisi_ke.includes(pegawai.namaLengkap)) {
    formData.value.disposisi_ke.push(pegawai.namaLengkap)
  }
  pegawaiSearch.value = ''
  filteredPegawai.value = []
  showPegawaiDropdown.value = false
}

const removeDisposisi = (idx: number) => {
  formData.value.disposisi_ke.splice(idx, 1)
}

const clearSearchDelayed = () => {
  // Delay agar @mousedown pada item dropdown sempat terjadi dulu
  setTimeout(() => {
    showPegawaiDropdown.value = false
  }, 200)
}

const handleFileUpload = (e: Event, field: 'file_surat' | 'file_notulensi') => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  // Batas 10 MB (10 * 1024 * 1024 bytes) mencegah Payload 413 Error GAS
  if (file.size > 10485760) {
    showNotification('error', 'File Terlalu Besar!', 'Ukuran maksimal file lampiran adalah 10 MB. Silakan kompres kompres file terlebih dahulu.')
    input.value = '' // Reset input
    return
  }

  files.value[field] = file
}

const openForm = (data: SuratData | null = null, focusNotulensi = false) => {
  if (data) {
    isEditMode.value = true
    formData.value = {
      ...getDefaultForm(),
      ...data,
      disposisi_ke: Array.isArray(data.disposisi_ke) ? [...data.disposisi_ke] : [],
      tgl_acara_mulai: data.tgl_acara_mulai ? formatDateForInput(data.tgl_acara_mulai) : '',
      tgl_acara_selesai: data.tgl_acara_selesai ? formatDateForInput(data.tgl_acara_selesai) : '',
      tgl_disposisi: data.tgl_disposisi ? formatDateForInput(data.tgl_disposisi) : '',
      tanggal_masuk: formatDateForInput(data.tanggal_masuk),
      tanggal_surat: formatDateForInput(data.tanggal_surat),
      file_surat: data.file_surat ?? '',
      file_notulensi: data.file_notulensi ?? '',
      created_at: data.created_at ?? '',
    }
  } else {
    isEditMode.value = false
    formData.value = { ...getDefaultForm(), tim_poksi: adminData.value.tim_poksi ?? '' }
  }
  files.value = { file_surat: null, file_notulensi: null }
  pegawaiSearch.value = ''
  filteredPegawai.value = []
  viewMode.value = 'form'

  if (focusNotulensi) {
    nextTick(() => {
      const el = document.getElementById('field-notulensi')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.focus()
      }
    })
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const openNotulensiModal = (data: SuratData) => {
  isEditMode.value = true
  formData.value = {
    ...getDefaultForm(),
    ...data,
    disposisi_ke: Array.isArray(data.disposisi_ke) ? [...data.disposisi_ke] : [],
    tgl_acara_mulai: data.tgl_acara_mulai ? formatDateForInput(data.tgl_acara_mulai) : '',
    tgl_acara_selesai: data.tgl_acara_selesai ? formatDateForInput(data.tgl_acara_selesai) : '',
    tgl_disposisi: data.tgl_disposisi ? formatDateForInput(data.tgl_disposisi) : '',
    tanggal_masuk: formatDateForInput(data.tanggal_masuk),
    tanggal_surat: formatDateForInput(data.tanggal_surat),
    file_surat: data.file_surat ?? '',
    file_notulensi: data.file_notulensi ?? '',
    created_at: data.created_at ?? '',
  }
  files.value = { file_surat: null, file_notulensi: null }
  showNotulensiModal.value = true
}

const closeForm = () => {
  viewMode.value = 'list'
  isEditMode.value = false
  showNotulensiModal.value = false
  formData.value = getDefaultForm()
  files.value = { file_surat: null, file_notulensi: null }
}

const handleSubmit = async () => {
  processingMessage.value = 'Menyimpan Data...'
  isProcessing.value = true
  try {
    const fd = new FormData()
    
    // Kirim seluruh body form ter-stringify
    fd.append('data', JSON.stringify(formData.value))

    if (files.value.file_surat) {
      fd.append('file_surat', files.value.file_surat)
    }

    if (files.value.file_notulensi) {
      fd.append('file_notulensi', files.value.file_notulensi)
    }

    const response = await api.post('/api/surat', fd)
    const res = response.data

    isProcessing.value = false
    if (res.status) {
      showNotification(
        'success',
        isEditMode.value ? 'Data Diperbarui!' : 'Berhasil Disimpan!',
        'Data surat dan berkas telah tertaut dengan Google Drive.'
      )
      dataStore.invalidateCache('surat')
      await fetchSurat(true)
      closeForm()
    } else {
      showNotification('error', 'Gagal!', res.message)
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
          showNotification('success', 'Terhapus!', 'Arsip telah dihapus dari sistem.')
          dataStore.invalidateCache('surat')
          await fetchSurat(true)
        } else {
          showNotification('error', 'Gagal!', res.message)
        }
      } catch (err: unknown) {
        isProcessing.value = false
        const message = err instanceof Error ? err.message : 'Gagal menghapus data.'
        showNotification('error', 'Error!', message)
      }
    },
    'Ya, Hapus!'
  )
}

const handleRefresh = async () => {
  dataStore.invalidateCache('surat')
  await fetchSurat(true)
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

// ─── LIFECYCLE ────────────────────────────────────────────
onMounted(() => {
  fetchSurat()
  fetchPegawai()
})

// ─── WATCHERS ─────────────────────────────────────────────
watch(searchQuery, () => { currentPage.value = 1 })
watch(filterTipe, () => { currentPage.value = 1 })
</script>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(229, 231, 235, 1);
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.04), 0 8px 10px -6px rgba(0,0,0,0.02);
}

.custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 9999px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }

.field-label {
  display: block;
  font-size: 10px;
  font-weight: 800;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  padding: 0 4px;
  margin-bottom: 4px;
}

.field-input {
  width: 100%;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  padding: 14px 18px;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.field-input:focus {
  border-color: var(--color-kementan-green, #006633);
  box-shadow: 0 0 0 4px rgba(0, 102, 51, 0.08);
}
.field-input::placeholder { color: #d1d5db; }

/* Custom Select dengan ikon */
.field-select-wrapper {
  position: relative;
}
.field-select {
  width: 100%;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 14px 44px 14px 18px;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.field-select:focus {
  border-color: var(--color-kementan-green, #006633);
  box-shadow: 0 0 0 4px rgba(0, 102, 51, 0.08);
}
.field-select-icon {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  pointer-events: none;
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
