<template>
  <div class="space-y-6 pb-12">
    <!-- View Mode: LIST -->
    <div v-if="viewMode === 'list'" class="space-y-6">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div v-motion :initial="{ opacity: 0, x: -20 }" :enter="{ opacity: 1, x: 0 }">
          <div class="flex items-center gap-3 mb-2 text-kementan-green">
            <FileText :size="20" />
            <span class="text-xs font-bold tracking-[0.3em] uppercase">Mekanisme SPPD</span>
          </div>
          <h1 class="text-3xl font-extrabold text-gray-800">Manajer SPJ & SPD</h1>
          <p class="text-gray-500 mt-2 text-sm max-w-lg font-medium">
            Kelola data dan terbitkan Kwitansi perjalanan dinas Standar Audit BPK.
          </p>
        </div>

        <button 
          class="bg-kementan-green text-white px-6 py-3 rounded-xl font-bold shadow-md shadow-kementan-green/20 flex items-center gap-3 hover:bg-[#004d26] transition-all text-sm"
          @click="openForm()"
        >
          <Plus :size="18" />
          <span>Tambah Kwitansi (SPJ)</span>
        </button>
      </div>

      <!-- Filter & Search -->
      <div v-motion :initial="{ opacity: 0, y: 10 }" :enter="{ opacity: 1, y: 0 }" class="glass-card p-4 rounded-2xl flex flex-col lg:flex-row gap-4">
        <div class="relative flex-1">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" :size="18" />
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Cari berdasarkan nama, tujuan, atau NIP..."
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
        <div v-if="isLoading && sptjmList.length === 0" class="flex flex-col items-center justify-center py-20 bg-white/50 h-full absolute inset-0">
          <div class="w-10 h-10 border-4 border-kementan-green/20 border-t-kementan-green rounded-full animate-spin" />
          <p class="mt-4 text-sm font-bold text-gray-500 uppercase tracking-widest animate-pulse">Memuat Data...</p>
        </div>
        
        <div v-else class="overflow-x-auto custom-scrollbar">
          <table class="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr class="bg-gray-50/80 text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] border-b border-gray-200">
                <th class="py-5 px-6 w-[40%]">Informasi Pelaksana</th>
                <th class="py-5 px-6">Rincian Perjalanan</th>
                <th class="py-5 px-6 text-center">Aksi Dokumen</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white/40">
              <template v-if="paginatedList.length > 0">
                <tr 
                  v-for="(item, idx) in paginatedList" :key="item.id"
                  v-motion :initial="{ opacity: 0, y: 5 }" :enter="{ opacity: 1, y: 0, transition: { delay: idx * 30 } }"
                  class="group hover:bg-emerald-50/30 transition-colors"
                >
                  <td class="py-4 px-6">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200 text-sm shrink-0">
                        {{ String(item.nama || '?').charAt(0) }}
                      </div>
                      <div>
                        <p class="text-sm font-bold text-gray-800">{{ item.nama }} <span class="bg-blue-100 text-blue-700 text-[9px] px-1.5 py-0.5 rounded">{{ item.gol }}</span></p>
                        <p class="text-[11px] text-gray-400 font-medium tracking-wider">
                          NIP: {{ item.nip || 'Tak Ada NIP' }}
                          <span v-if="item.nomor_st" class="mx-1 lowercase text-gray-300 font-normal">|</span> 
                          <span v-if="item.nomor_st" class="text-[10px] font-normal opacity-75">ST: {{ item.nomor_st }}</span>
                        </p>
                      </div>
                    </div>
                  </td>
                  <td class="py-4 px-6">
                    <div>
                      <p class="text-xs font-bold text-gray-700 mb-1">Tujuan: {{ item.tujuan_1 }}</p>
                      <div class="flex flex-col gap-1">
                        <div class="flex items-center gap-1.5 text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded w-max">
                          <span>{{ item.tgl_berangkat }} → {{ item.tgl_kembali }} ({{ item.lama_tugas }} hari)</span>
                        </div>
                        <p class="text-xs font-bold text-emerald-600">Rp {{ formatNumber(item.jumlah_dibayar) }}</p>
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
                          @click="triggerDownload(item.file_link, `SPJ_${item.nama}_${item.id}`)"
                        >
                          <Download :size="13" /> Download
                        </button>
                      </div>

                      <span v-if="!item.file_link" class="px-3 py-1.5 bg-gray-50 text-gray-400 rounded-lg border border-gray-100 text-[10px] font-bold uppercase tracking-wider">Belum Ada</span>

                      <!-- Admin Actions Group -->
                      <div class="flex items-center gap-2 ml-2 pl-3 border-l border-gray-100">
                        <button 
                          class="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors font-bold text-[10px] flex items-center gap-1.5 shadow-sm uppercase tracking-wider" 
                          title="Edit SPJ" 
                          @click="openForm(item)"
                        >
                          <Edit :size="13" /> Edit
                        </button>
                        <button 
                          class="px-3 py-1.5 bg-rose-50 text-rose-700 rounded-lg border border-rose-200 hover:bg-rose-100 transition-colors font-bold text-[10px] flex items-center gap-1.5 shadow-sm uppercase tracking-wider" 
                          title="Hapus SPJ" 
                          @click="handleDelete(item.id)"
                        >
                          <Trash2 :size="13" /> Hapus
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
              <tr v-else>
                <td colspan="3" class="py-16 text-center">
                  <div class="flex flex-col items-center gap-3">
                    <FileText :size="32" class="text-gray-300" />
                    <p class="text-gray-400 font-medium text-sm">Berdasarkan pencarian, tidak ditemukan data SPJ yang sesuai.</p>
                  </div>
                </td>
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
            <button :disabled="safePage <= 1" class="p-1.5 rounded-lg border bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-30" @click="currentPage--"><ChevronLeft :size="16" /></button>
            <button :disabled="safePage >= totalPages" class="p-1.5 rounded-lg border bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-30" @click="currentPage++"><ChevronRight :size="16" /></button>
          </div>
        </div>
      </div>
    </div>

    <!-- View Mode: FORM -->
    <div v-else-if="viewMode === 'form'" v-motion :initial="{ opacity: 0, y: 10 }" :enter="{ opacity: 1, y: 0 }" class="max-w-6xl mx-auto space-y-6 pb-12">
      <button class="flex items-center gap-2 text-gray-500 hover:text-kementan-green transition-colors font-semibold text-sm bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 w-max" @click="closeForm">
        <ChevronLeft :size="18" /> Kembali ke Daftar SPJ
      </button>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- FORM UTAMA -->
        <div class="lg:col-span-2 glass-card rounded-3xl overflow-hidden shadow-lg border border-gray-200">
          <div class="bg-gradient-to-r from-kementan-green to-emerald-700 px-8 py-6 text-white">
            <h2 class="text-2xl font-extrabold">{{ isEditMode ? 'Edit Kwitansi SPJ' : 'Kwitansi (Rampung) SPJ & SPD' }}</h2>
            <p class="text-emerald-100 font-medium text-sm mt-1">Input rincian lengkap perjalanan dinas sesuai format Standar BPK.</p>
          </div>

          <div class="p-8 space-y-8">
            <!-- SECTION 1: IDENTITAS SURAT -->
            <div class="space-y-5">
              <div class="flex items-center gap-3 mb-2">
                <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-sm">
                  <FileText :size="17" />
                </div>
                <h4 class="text-sm font-black text-gray-800">Identitas Surat</h4>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Nomor Pengajuan LS</label>
                  <input type="text" v-model="formData.nomor_ls" placeholder="Contoh: 1, 2, 45" class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all font-bold placeholder:text-gray-300">
                </div>
                <div>
                  <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Nomor Surat Tugas</label>
                  <input type="text" v-model="formData.nomor_st" placeholder="Otomatis Terisi..." class="w-full bg-gray-50 border border-gray-300 rounded-xl py-3.5 px-4 text-sm font-bold text-gray-600 outline-none">
                </div>
                <div>
                  <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Tanggal Surat Tugas</label>
                  <input type="date" v-model="formData.tgl_perintah" class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 font-bold transition-all">
                </div>
                <div>
                  <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Kode Kapoksi / Unit</label>
                  <input type="text" v-model="formData.kode_kapoksi" placeholder="misal: PLU, TU, dll" class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all font-bold placeholder:text-gray-300">
                </div>
                <div>
                  <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Kode MAK</label>
                  <input type="text" v-model="formData.kode_mak" placeholder="misal: 45354.RBO..." class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all font-bold placeholder:text-gray-300">
                </div>
                <div>
                  <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Asal Instansi</label>
                  <input type="text" v-model="formData.asal_instansi" class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all font-bold">
                </div>
                <div class="md:col-span-3">
                  <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Uraian Pembayaran (Kuitansi)</label>
                  <input type="text" v-model="formData.uraian_pembayaran" placeholder="Pembayaran biaya perjalanan dinas dalam rangka..." class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all font-medium">
                </div>
              </div>
            </div>

            <!-- SECTION 2: PELAKSANA SPD -->
            <div class="space-y-5">
              <div class="flex items-center gap-3 mb-2">
                <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-sm">
                  <User :size="17" />
                </div>
                <h4 class="text-sm font-black text-gray-800">Pelaksana SPD</h4>
              </div>
              <div class="space-y-5">
                <SearchableDropdown label="Cari Pegawai (Autofill)" :options="pegawaiOptions" :value="selectedPegawaiIndex" placeholder="Contoh: Budi Santoso..." :is-loading="isPegawaiLoading" required @change="handlePegawaiChange" />
                <div class="grid grid-cols-2 md:grid-cols-3 gap-5">
                  <div>
                    <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">NIP</label>
                    <input type="text" v-model="formData.nip" class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm font-bold outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all">
                  </div>
                  <div>
                    <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Pangkat/Gol Ruang</label>
                    <input type="text" v-model="formData.pangkat_gol" class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm font-bold outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all">
                  </div>
                  <div>
                    <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Golongan (BPK)</label>
                    <input type="text" v-model="formData.gol" placeholder="Contoh: Golongan III" class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm font-bold outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all placeholder:text-gray-300">
                  </div>
                  <div>
                    <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Jabatan</label>
                    <input type="text" v-model="formData.jabatan" class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm font-bold outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all">
                  </div>
                  <div>
                    <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Tingkat Biaya</label>
                    <input type="text" v-model="formData.tingkat_biaya" class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm font-bold outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all">
                  </div>
                </div>
              </div>
            </div>

            <!-- SECTION 3: TUJUAN & WAKTU -->
            <div class="space-y-5">
              <div class="flex items-center gap-3 mb-2">
                <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white flex items-center justify-center shadow-sm">
                  <MapPin :size="17" />
                </div>
                <h4 class="text-sm font-black text-gray-800">Tujuan & Waktu Perjalanan</h4>
              </div>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-5">
                <div class="col-span-2">
                  <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Maksud / Tujuan Acara</label>
                  <input type="text" v-model="formData.maksud_tujuan" class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm font-bold outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all">
                </div>
                <div>
                  <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">No SPD (Otomatis)</label>
                  <input type="text" v-model="formData.no_spd" readonly class="w-full bg-gray-50 border border-gray-300 rounded-xl py-3.5 px-4 text-sm font-bold text-blue-700 outline-none">
                </div>
                <div>
                  <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Nomor Urut SPD</label>
                  <input type="text" v-model="formData.no_urut_spd" placeholder="Contoh: 001" class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm font-bold outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all placeholder:text-gray-300">
                </div>
                
                <div class="col-span-2">
                  <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Akun MAK</label>
                  <input type="text" v-model="formData.no_akun" placeholder="Contoh: 45354.RBO.005.101.0A.521211" class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm font-medium outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all placeholder:text-gray-300">
                </div>
                <div>
                  <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Kendaraan</label>
                  <select v-model="formData.kendaraan" class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm font-bold outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all">
                    <option value="Pesawat">Pesawat</option>
                    <option value="Kendaraan Umum">Kendaraan Umum</option>
                  </select>
                </div>
                <div>
                  <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Lama (Hari)</label>
                  <input type="number" v-model="formData.lama_tugas" readonly class="w-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-300 rounded-xl py-3.5 px-4 text-sm outline-none">
                </div>
                
                <div class="col-span-2">
                  <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Kota Tujuan (Utama)</label>
                  <input type="text" v-model="formData.tujuan_1" class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm font-bold outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all" placeholder="Contoh: Jawa Barat">
                </div>
                <div>
                  <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Tujuan 2 (Opsional)</label>
                  <input type="text" v-model="formData.tujuan_2" class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm font-bold outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all">
                </div>
                <div>
                  <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Tujuan 3 (Opsional)</label>
                  <input type="text" v-model="formData.tujuan_3" class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm font-bold outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all">
                </div>

                <div class="col-span-2">
                  <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Periode Tugas</label>
                  <div class="grid grid-cols-2 gap-4">
                    <input type="date" v-model="formData.tgl_berangkat" class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm font-bold outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all">
                    <input type="date" v-model="formData.tgl_kembali" class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm font-bold outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all">
                  </div>
                </div>
              </div>
            </div>

            <!-- Rincian Biaya -->
            <div class="space-y-6">
              <div class="flex items-center gap-3 mb-2">
                <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white flex items-center justify-center shadow-sm">
                  <Coins :size="17" />
                </div>
                <h4 class="text-sm font-black text-gray-800">Rincian Biaya Perjalanan</h4>
              </div>
              
              <!-- Uang Harian -->
              <div class="space-y-4">
                <div class="flex items-center justify-between border-b border-gray-100 pb-2">
                  <h4 class="text-xs font-black text-emerald-600 tracking-widest uppercase">Uang Harian</h4>
                  <button class="text-xs bg-emerald-50 text-emerald-600 px-3 py-1.5 font-bold rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1" @click="addUH"><Plus :size="14" /> Tambah Baris</button>
                </div>
                <div v-for="(uh, i) in formData.uang_harian" :key="'uh'+i" class="flex flex-col sm:flex-row gap-3 bg-gray-50 p-4 rounded-xl relative border border-gray-200">
                  <div class="absolute -top-2 -left-2 bg-kementan-green text-white w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold shadow-sm">{{i+1}}</div>
                  <div class="flex-1">
                    <label class="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Tarif Perhari (Rp)</label>
                    <input type="number" v-model.number="uh.perhari" @input="calcUH(i)" class="w-full bg-white border border-gray-300 rounded-xl py-2.5 px-3 text-sm outline-none font-bold focus:border-kementan-green transition-all">
                  </div>
                  <div class="w-20">
                    <label class="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Hari</label>
                    <input type="number" v-model.number="uh.hari" @input="calcUH(i)" class="w-full bg-white border border-gray-300 rounded-xl py-2.5 px-3 text-sm outline-none text-center font-bold focus:border-kementan-green transition-all">
                  </div>
                  <div class="flex-1">
                    <label class="block text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Subtotal</label>
                    <input type="text" readonly :value="formatNumber(uh.total)" class="w-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 rounded-xl py-2.5 px-3 text-sm outline-none">
                  </div>
                  <button v-if="formData.uang_harian.length > 1" class="text-gray-400 hover:text-rose-600 mt-4 transition-colors" @click="formData.uang_harian.splice(i, 1)"><Trash2 :size="16"/></button>
                </div>
              </div>

            <!-- Penginapan -->
            <div class="space-y-4 pt-4 border-t border-gray-100">
              <div class="flex items-center justify-between border-b border-gray-100 pb-2">
                <h4 class="text-xs font-black text-kementan-green tracking-widest uppercase">Penginapan (Hotel)</h4>
                <button class="text-xs bg-emerald-50 text-emerald-600 px-3 py-1.5 font-bold rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1" @click="addHtl"><Plus :size="14" /> Tambah Hotel</button>
              </div>
              <div v-for="(htl, i) in formData.penginapan" :key="'htl'+i" class="flex flex-col sm:flex-row gap-3 bg-gray-50 p-4 rounded-xl relative border border-gray-200 flex-wrap">
                <div class="flex-1 min-w-[120px]">
                  <label class="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Nama Hotel</label>
                  <input type="text" v-model="htl.nama" class="w-full bg-white border border-gray-300 rounded-xl py-2.5 px-3 text-sm outline-none font-bold focus:border-kementan-green transition-all">
                </div>
                <div class="w-32">
                  <label class="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Rate (Rp)</label>
                  <input type="number" v-model.number="htl.perhari" @input="calcHtl(i)" class="w-full bg-white border border-gray-300 rounded-xl py-2.5 px-3 text-sm outline-none font-bold focus:border-kementan-green transition-all">
                </div>
                <div class="w-16">
                  <label class="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Malam</label>
                  <input type="number" v-model.number="htl.hari" @input="calcHtl(i)" class="w-full bg-white border border-gray-300 rounded-xl py-2.5 px-3 text-sm outline-none text-center font-bold focus:border-kementan-green transition-all">
                </div>
                <div class="w-32">
                  <label class="block text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Subtotal</label>
                  <input type="text" readonly :value="formatNumber(htl.total)" class="w-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 rounded-xl py-2.5 px-3 text-sm outline-none">
                </div>
                <button v-if="formData.penginapan.length > 1" class="text-gray-400 hover:text-rose-600 mt-4 transition-colors" @click="formData.penginapan.splice(i, 1)"><Trash2 :size="16"/></button>
              </div>
            </div>

            <!-- Tiket Transport Darat/Pesawat dsb -->
            <div class="space-y-4 pt-4 border-t border-gray-100">
               <h4 class="text-xs font-black text-kementan-green tracking-widest uppercase border-b border-gray-100 pb-2">Biaya Tiket & Transport Lain</h4>
               
               <!-- Berangkat -->
               <div class="bg-blue-50/30 p-4 rounded-xl border border-blue-200 space-y-3">
                 <div class="flex items-center justify-between">
                   <p class="text-xs font-black text-blue-800 tracking-wide">Tiket Berangkat</p>
                   <button class="text-[10px] text-blue-600 font-bold flex items-center gap-1" @click="addTiket('berangkat')"><Plus :size="12" /> Tambah Tiket</button>
                 </div>
                 <div v-for="(tkt, i) in formData.tiket_berangkat" :key="'tb'+i" class="grid grid-cols-2 lg:grid-cols-7 gap-2 bg-white p-3 rounded-xl border border-gray-200 relative pr-8">
                    <input type="date" v-model="tkt.tgl" class="col-span-2 lg:col-span-1 border border-gray-300 rounded-lg px-2.5 py-2 text-xs font-bold outline-none focus:border-kementan-green transition-all" title="Tanggal">
                    <input type="text" v-model="tkt.dari" placeholder="Dari" class="border border-gray-300 rounded-lg px-2.5 py-2 text-xs font-bold outline-none focus:border-kementan-green transition-all placeholder:text-gray-300">
                    <input type="text" v-model="tkt.ke" placeholder="Ke" class="border border-gray-300 rounded-lg px-2.5 py-2 text-xs font-bold outline-none focus:border-kementan-green transition-all placeholder:text-gray-300">
                    <input type="text" v-model="tkt.maskapai" placeholder="Pesawat/KA" class="border border-gray-300 rounded-lg px-2.5 py-2 text-xs font-bold outline-none focus:border-kementan-green transition-all placeholder:text-gray-300">
                    <input type="text" v-model="tkt.kode_booking" placeholder="Kode Booking" class="border border-gray-300 rounded-lg px-2.5 py-2 text-xs font-bold outline-none focus:border-kementan-green transition-all placeholder:text-gray-300">
                    <input type="number" v-model.number="tkt.harga" placeholder="Harga" class="col-span-2 lg:col-span-1 border border-blue-300 rounded-lg px-2.5 py-2 text-xs font-bold text-blue-700 bg-blue-50 outline-none focus:border-blue-500 transition-all">
                    <button class="absolute right-2.5 top-3 text-gray-400 hover:text-rose-600 transition-colors" @click="formData.tiket_berangkat.splice(i,1)"><X :size="14"/></button>
                 </div>
               </div>

               <!-- Pulang -->
               <div class="bg-indigo-50/30 p-4 rounded-xl border border-indigo-200 space-y-3">
                 <div class="flex items-center justify-between">
                   <p class="text-xs font-black text-indigo-800 tracking-wide">Tiket Pulang</p>
                   <button class="text-[10px] text-indigo-600 font-bold flex items-center gap-1" @click="addTiket('pulang')"><Plus :size="12" /> Tambah Tiket</button>
                 </div>
                 <div v-for="(tkt, i) in formData.tiket_pulang" :key="'tp'+i" class="grid grid-cols-2 lg:grid-cols-7 gap-2 bg-white p-3 rounded-xl border border-gray-200 relative pr-8">
                    <input type="date" v-model="tkt.tgl" class="col-span-2 lg:col-span-1 border border-gray-300 rounded-lg px-2.5 py-2 text-xs font-bold outline-none focus:border-kementan-green transition-all" title="Tanggal">
                    <input type="text" v-model="tkt.dari" placeholder="Dari" class="border border-gray-300 rounded-lg px-2.5 py-2 text-xs font-bold outline-none focus:border-kementan-green transition-all placeholder:text-gray-300">
                    <input type="text" v-model="tkt.ke" placeholder="Ke" class="border border-gray-300 rounded-lg px-2.5 py-2 text-xs font-bold outline-none focus:border-kementan-green transition-all placeholder:text-gray-300">
                    <input type="text" v-model="tkt.maskapai" placeholder="Pesawat/KA" class="border border-gray-300 rounded-lg px-2.5 py-2 text-xs font-bold outline-none focus:border-kementan-green transition-all placeholder:text-gray-300">
                    <input type="text" v-model="tkt.kode_booking" placeholder="Kode Booking" class="border border-gray-300 rounded-lg px-2.5 py-2 text-xs font-bold outline-none focus:border-kementan-green transition-all placeholder:text-gray-300">
                    <input type="number" v-model.number="tkt.harga" placeholder="Harga" class="col-span-2 lg:col-span-1 border border-indigo-300 rounded-lg px-2.5 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 outline-none focus:border-indigo-500 transition-all">
                    <button class="absolute right-2.5 top-3 text-gray-400 hover:text-rose-600 transition-colors" @click="formData.tiket_pulang.splice(i,1)"><X :size="14"/></button>
                 </div>
               </div>
               
               <!-- Transport Darat -->
               <div class="bg-amber-50/30 p-4 rounded-xl border border-amber-200 space-y-3">
                 <div class="flex items-center justify-between">
                   <p class="text-xs font-black text-amber-800 tracking-wide">Transport Lokal (Darat)</p>
                   <button class="text-[10px] text-amber-600 font-bold flex items-center gap-1" @click="addTrp"><Plus :size="12" /> Tambah Transport</button>
                 </div>
                 <div v-for="(t, i) in formData.transport" :key="'trp'+i" class="flex gap-2 relative">
                    <input type="number" v-model.number="t.perhari" @input="calcTrp(i)" placeholder="Tarif" class="border border-gray-300 rounded-lg px-2.5 py-2 text-xs flex-1 font-bold outline-none focus:border-kementan-green transition-all placeholder:text-gray-300">
                    <input type="number" v-model.number="t.hari" @input="calcTrp(i)" placeholder="Qty" class="border border-gray-300 rounded-lg px-2.5 py-2 text-xs w-20 font-bold outline-none text-center focus:border-kementan-green transition-all placeholder:text-gray-300">
                    <input type="text" readonly :value="formatNumber(t.total)" class="border border-amber-200 bg-amber-50 rounded-lg px-2.5 py-2 text-xs font-bold text-amber-800 flex-1 outline-none">
                    <button class="text-gray-400 hover:text-rose-600 ml-1 transition-colors" @click="formData.transport.splice(i,1)"><X :size="14"/></button>
                 </div>
               </div>
            </div>

            <!-- Biaya Lainnya & Upload -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
               <div>
                  <h4 class="text-xs font-black text-kementan-green tracking-widest uppercase mb-3">Lainnya</h4>
                  <div class="space-y-3">
                    <div class="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-200">
                       <label class="text-xs font-bold text-gray-600">Taksi (Kuitansi)</label>
                       <input type="number" v-model.number="formData.taksi" class="border border-gray-300 rounded-lg p-2 text-right text-xs w-32 font-bold outline-none focus:border-kementan-green transition-all">
                    </div>
                    <div class="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-200">
                       <label class="text-xs font-bold text-gray-600">Representasi</label>
                       <input type="number" v-model.number="formData.representasi" class="border border-gray-300 rounded-lg p-2 text-right text-xs w-32 font-bold outline-none focus:border-kementan-green transition-all">
                    </div>
                    <div class="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-200">
                       <label class="text-xs font-bold text-gray-600">Lainnya / Uang Saku</label>
                       <input type="number" v-model.number="formData.uang_lainnya" class="border border-gray-300 rounded-lg p-2 text-right text-xs w-32 font-bold outline-none focus:border-kementan-green transition-all">
                    </div>
                  </div>
               </div>
               
               <div>
                  <h4 class="text-xs font-black text-blue-600 tracking-widest uppercase mb-3">Upload Bukti Lampiran</h4>
                  <div class="border-2 border-dashed border-gray-300 bg-gray-50/50 rounded-xl p-5 text-center">
                    <UploadCloud :size="24" class="mx-auto text-gray-400 mb-2" />
                    <p class="text-[10px] text-gray-500 font-medium mb-3">Pilih format Gambar (JPG/PNG) atau PDF.<br/>Dokumen PDF akan otomatis didecode menjadi gambar lampiran.</p>
                    <input type="file" multiple accept=".pdf,.png,.jpg,.jpeg" class="text-xs text-center mx-auto block max-w-full overflow-hidden file:mr-4 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:bg-kementan-green/10 file:text-kementan-green hover:file:bg-kementan-green/20 file:transition-colors" @change="onFileChange">
                  </div>
                  <div class="mt-2 text-[10px] font-bold text-emerald-600 flex items-center gap-1" v-if="filesForUpload.length">
                     <CheckCircle :size="12" /> {{filesForUpload.length}} lembar bukti siap disematkan.
                  </div>
                  <div class="mt-2 text-[10px] text-gray-500" v-else-if="formData.file_bukti && isEditMode">
                     Lampiran lama <a :href="formData.file_bukti" target="_blank" class="text-blue-500 underline">Lihat disini</a>.
                  </div>
               </div>
            </div>

            <!-- SUBMIT BUTTONS -->
            <div class="pt-6 border-t border-gray-100 flex gap-4">
              <button type="button" class="px-6 py-3.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm w-40" @click="closeForm">
                Batal
              </button>
              <button :disabled="isSubmitting || !formData.nip" class="flex-1 px-6 py-3.5 bg-kementan-green text-white font-bold rounded-xl hover:bg-[#004d26] transition-colors flex justify-center items-center gap-2 shadow-md shadow-kementan-green/20 disabled:opacity-70 disabled:cursor-not-allowed text-sm" @click="handleSave">
                <template v-if="isSubmitting">
                  <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{{ processingMessage || 'Menyimpan & Menyusun PDF Kwitansi...' }}</span>
                </template>
                <template v-else>
                  <Save :size="18" /> Simpan Kwitansi SPJ
                </template>
              </button>
            </div>
          </div>
        </div>
      </div>
        
      <!-- SIDEBAR -->
      <div class="space-y-6">
           <!-- SBM LOOKUP -->
          <div class="glass-card bg-white rounded-3xl p-6 lg:p-8 border border-gray-200 shadow-md sticky top-6">
            <div class="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-sm">
                <Search :size="17" />
              </div>
              <h4 class="text-sm font-black text-gray-800">Cek SBM Provinsi</h4>
            </div>
            
            <div class="space-y-5">
              <SearchableDropdown v-model:value="sbmQuery" label="Ketik Nama Kota/SBM Tujuan" :options="sbmOptions" :is-loading="isSbmLoading" placeholder="Contoh: Jawa Barat" />
              
              <transition name="fade">
                <div v-if="selectedSbm" class="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/50 rounded-2xl p-5 space-y-4 shadow-sm">
                  <div>
                    <p class="text-[10px] font-black text-blue-500/80 tracking-widest uppercase mb-1">Uang Harian (Per Hari)</p>
                    <p class="text-xl font-extrabold text-blue-700">Rp {{ formatNumber(selectedSbm.uang_harian) }}</p>
                  </div>
                  
                  <div class="grid grid-cols-2 gap-4 pt-4 border-t border-blue-200/50">
                     <div class="bg-white/60 p-2.5 rounded-xl border border-blue-100/30">
                       <p class="text-[9px] font-black text-blue-500 tracking-widest uppercase mb-1">Tiket Bisnis</p>
                       <p class="font-bold text-gray-700 text-xs">{{formatNumber(selectedSbm.tiket_bisnis)}}</p>
                     </div>
                     <div class="bg-white/60 p-2.5 rounded-xl border border-blue-100/30">
                       <p class="text-[9px] font-black text-blue-500 tracking-widest uppercase mb-1">Tkt Ekonomi</p>
                       <p class="font-bold text-gray-700 text-xs">{{formatNumber(selectedSbm.tiket_ekonomi)}}</p>
                     </div>
                  </div>
                  
                  <button type="button" class="w-full mt-2 py-3 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 hover:shadow-md transition-all flex items-center justify-center gap-2" @click="handleApplySbm">
                    Terapkan Nilai ini ke Baris 1
                  </button>
                </div>
              </transition>
            </div>
          </div>
          
          <!-- SUMMARY -->
          <div class="glass-card bg-white rounded-3xl p-6 lg:p-8 border border-gray-200 shadow-md sticky top-[22rem]">
             <div class="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
               <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white flex items-center justify-center shadow-sm">
                 <Coins :size="17" />
               </div>
               <h4 class="text-sm font-black text-gray-800">Ringkasan Total</h4>
             </div>
             
             <ul class="text-sm space-y-3.5 mb-6">
                <li class="flex justify-between items-center"><span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Uang Harian</span><span class="font-bold text-gray-700">Rp {{formatNumber(sumUH)}}</span></li>
                <li class="flex justify-between items-center"><span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Penginapan</span><span class="font-bold text-gray-700">Rp {{formatNumber(sumHTL)}}</span></li>
                <li class="flex justify-between items-center"><span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Transport Lokal</span><span class="font-bold text-gray-700">Rp {{formatNumber(sumTRP)}}</span></li>
                <li class="flex justify-between items-center"><span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tiket PP</span><span class="font-bold text-gray-700">Rp {{formatNumber(sumTKT)}}</span></li>
                <li class="flex justify-between items-center"><span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Lainnya</span><span class="font-bold text-gray-700">Rp {{formatNumber(Number(formData.taksi||0)+Number(formData.representasi||0)+Number(formData.uang_lainnya||0))}}</span></li>
             </ul>
             
             <div class="p-5 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-200">
                <p class="text-[10px] font-black text-emerald-500/80 tracking-widest uppercase mb-1">Jumlah Dibayar (Grand Total)</p>
                <p class="text-2xl font-black text-emerald-700 tracking-tight">Rp {{formatNumber(grandTotal)}}</p>
             </div>
          </div>
        </div>
      </div>
    </div>

    <!-- SUCCESS MODAL SPJ -->
    <Teleport to="body">
      <transition name="modal-fade">
        <div
          v-if="successModal.isOpen"
          class="fixed inset-0 z-[10000] flex items-center justify-center p-4"
        >
          <div class="absolute inset-0 bg-gray-900/50" @click="successModal.isOpen = false" />
          <div 
            v-motion
            :initial="{ opacity: 0, scale: 0.95, y: 12 }"
            :enter="{ opacity: 1, scale: 1, y: 0, transition: { duration: 200 } }"
            class="relative bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl"
          >
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
                  @click="openPreview(successModal.fileUrl)"
                >
                  <Eye :size="18" /> Preview Dokumen
                </button>
                <button 
                  class="w-full py-3 bg-emerald-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2.5 hover:bg-emerald-600 transition-colors text-sm" 
                  @click="openFile(successModal.fileUrl)"
                >
                  <Download :size="18" /> Download PDF
                </button>
              </template>
              <p v-else class="text-center text-xs text-gray-400 font-semibold py-3">PDF sedang diproses...</p>
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

    <!-- GLOBAL NOTIF -->
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
import { FileText, Plus, Search, Download, ExternalLink, Edit, Trash2, ChevronLeft, ChevronRight, Save, UploadCloud, X, User, MapPin, Coins, Eye, RefreshCw, CheckCircle } from 'lucide-vue-next'
import SearchableDropdown from '../components/SearchableDropdown.vue'
import GlobalModal from '../components/GlobalModal.vue'
import FilePreviewModal from '../components/FilePreviewModal.vue'
import { useDataStore } from '../stores/useDataStore'
import api, { fetchApi } from '../config/api'
import { triggerDownload } from '../utils/drive'
import type { SpjData, SpjUangHarian, SpjPenginapan, SpjTransport, SpjTiket, PegawaiData, ApiResponse, AdminData, SbmData } from '../types/api'

const ITEMS_PER_PAGE = 10
const store = useDataStore()

const adminData = computed<AdminData>(() => {
  try { return JSON.parse(localStorage.getItem('adminData') || '{}') }
  catch { return {} as AdminData }
})

// STATE
const viewMode = ref<'list'|'form'>('list')
const isEditMode = ref(false)
const isLoading = ref(false)
const isSubmitting = ref(false)
const processingMessage = ref('')
const searchQuery = ref('')
const currentPage = ref(1)

const sptjmList = ref<SpjData[]>([]) // reuse existing variable name logic structure
const pegawaiList = ref<PegawaiData[]>([])
const sbmList = ref<SbmData[]>([])

const isPegawaiLoading = ref(false)
const isSbmLoading = ref(false)

const filesForUpload = ref<File[]>([])

// SUCCESS MODAL
const successModal = ref({
  isOpen: false,
  fileUrl: '',
  nama: '',
  jumlah: 0
})

// NOTIF
const notificationModal = ref({
  isOpen: false, type: 'success' as 'success'|'error'|'warning', title: '', message: '', confirmText: '',
  onConfirm: null as (() => void) | null | undefined
})
function notify(type: 'success'|'error'|'warning', title: string, message: string, onC: (()=>void)|null = null, confirmText: string = 'Tutup') {
  notificationModal.value = { isOpen: true, type, title, message, onConfirm: onC, confirmText }
}

// FORM DATA
const emptyTiket = (): SpjTiket => ({ tgl: '', dari: '', ke: '', maskapai: '', kode_booking: '', no_tiket: '', harga: 0 })
const emptyForm = (): SpjData => ({
  id: '', nomor_st: '', asal_instansi: 'Direktorat Penyediaan Lahan', nip: '', nama: '', pangkat_gol: '', gol: '', 
  maksud_tujuan: '', jumlah_dibayar: 0, tujuan_1: '', tujuan_2: '', tujuan_3: '',
  lama_tugas: '', tgl_berangkat: '', tgl_kembali: '',
  uang_harian: [{ perhari: 0, hari: 0, total: 0 }],
  penginapan: [{ nama: '', perhari: 0, hari: 0, total: 0 }],
  transport: [{ perhari: 0, hari: 0, total: 0 }],
  tiket_berangkat: [emptyTiket()],
  tiket_pulang: [emptyTiket()],
  taksi: 0, representasi: 0, uang_lainnya: 0,
  no_spd: '', 
  no_urut_spd: '', 
  no_akun: '', 
  kode_mak: '', 
  kode_kapoksi: '', 
  nomor_ls: '', 
  uraian_pembayaran: '',
  jabatan: '', tingkat_biaya: '', kendaraan: 'Pesawat', tgl_perintah: new Date().toISOString().split('T')[0],
  tim_poksi: adminData.value?.tim_poksi || '', file_link: '', file_bukti: ''
})
const formData = ref<SpjData>(emptyForm())

// CALCULATIONS
const sumUH = computed(() => formData.value.uang_harian.reduce((a,b)=>a+(Number(b.total)||0), 0))
const sumHTL = computed(() => formData.value.penginapan.reduce((a,b)=>a+(Number(b.total)||0), 0))
const sumTRP = computed(() => formData.value.transport.reduce((a,b)=>a+(Number(b.total)||0), 0))
const sumTKT = computed(() => formData.value.tiket_berangkat.reduce((a,b)=>a+(Number(b.harga)||0), 0) + formData.value.tiket_pulang.reduce((a,b)=>a+(Number(b.harga)||0), 0))
const grandTotal = computed(() => sumUH.value + sumHTL.value + sumTRP.value + sumTKT.value + Number(formData.value.taksi||0) + Number(formData.value.representasi||0) + Number(formData.value.uang_lainnya||0))

function formatNumber(v: any) { return (Number(v)||0).toLocaleString('id-ID') }

const calcUH = (i:number) => formData.value.uang_harian[i].total = (Number(formData.value.uang_harian[i].perhari)||0)*(Number(formData.value.uang_harian[i].hari)||0)
const calcHtl = (i:number) => formData.value.penginapan[i].total = (Number(formData.value.penginapan[i].perhari)||0)*(Number(formData.value.penginapan[i].hari)||0)
const calcTrp = (i:number) => formData.value.transport[i].total = (Number(formData.value.transport[i].perhari)||0)*(Number(formData.value.transport[i].hari)||0)

// ADDERS & LIMITS
const addUH = () => { if(formData.value.uang_harian.length < 3) formData.value.uang_harian.push({perhari:0,hari:0,total:0}); else notify('warning','Batas Maksimal','Uang harian maksimal 3 baris.') }
const addHtl = () => { if(formData.value.penginapan.length < 9) formData.value.penginapan.push({nama:'',perhari:0,hari:0,total:0}); else notify('warning','Batas Maksimal','Hotel/Penginapan maksimal 9 tempat.') }
const addTrp = () => { if(formData.value.transport.length < 3) formData.value.transport.push({perhari:0,hari:0,total:0}); else notify('warning','Batas Maksimal','Transport darat maksimal 3 baris.') }
const addTiket = (type: 'berangkat'|'pulang') => {
  if(type==='berangkat' && formData.value.tiket_berangkat.length<2) formData.value.tiket_berangkat.push(emptyTiket())
  else if(type==='pulang' && formData.value.tiket_pulang.length<3) formData.value.tiket_pulang.push(emptyTiket())
  else notify('warning','Batas Maksimal',`Tiket ${type} sudah penuh maksimal slot.`)
}

// LOOKUPS
const pegawaiOptions = computed(() => pegawaiList.value.map((p, idx) => ({ value: String(idx), label: `${p.namaLengkap} - ${p.jabatan || p.poksi || '-'}` })))
const selectedPegawaiIndex = computed(() => { const idx = pegawaiList.value.findIndex(p => p.nip === formData.value.nip && p.namaLengkap === formData.value.nama); return idx >= 0 ? String(idx) : '' })
const handlePegawaiChange = (strIdx: string) => {
  if (!strIdx) return
  const p = pegawaiList.value[parseInt(strIdx)]
  if (p) {
    formData.value.nama = p.namaLengkap; formData.value.jabatan = p.jabatan || ''; formData.value.nip = p.nip || ''; formData.value.pangkat_gol = p.pangkatGol || ''; formData.value.gol = p.golongan || ''
  }
}

const sbmQuery = ref('')
const sbmOptions = computed(() => sbmList.value.map(s => ({ value: s.ibu_kota, label: s.ibu_kota, subtitle: s.tujuan_lengkap })))
const selectedSbm = computed(() => sbmList.value.find(s => s.ibu_kota === sbmQuery.value))
// AUTO LOGIC
watch([() => formData.value.tgl_berangkat, () => formData.value.tgl_kembali], ([start, end]) => {
  if (start && end) {
    const d1 = new Date(start); const d2 = new Date(end)
    const diff = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)) + 1
    formData.value.lama_tugas = diff > 0 ? diff : 0
  }
})

watch(() => formData.value.nomor_ls, (newLS) => {
  if (!newLS || isEditMode.value) return
  // Hitung urutan berdasarkan LS yang sama di list yang sudah ada
  const sameLS = sptjmList.value.filter(s => s.nomor_ls === newLS)
  const nextUrut = sameLS.length + 1
  formData.value.no_urut_spd = String(nextUrut).padStart(3, '0')
})

watch([() => formData.value.no_urut_spd, () => formData.value.kode_kapoksi, () => formData.value.tgl_perintah], ([urut, kapoksi, tgl]) => {
  if (urut && kapoksi && tgl) {
    const d = new Date(tgl)
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    formData.value.no_spd = `${urut}/${kapoksi}/SPD/PEL.LIP/${mm}/${yyyy}`
  }
})

const handleApplySbm = () => {
  if(selectedSbm.value && formData.value.uang_harian.length > 0) {
    formData.value.uang_harian[0].perhari = selectedSbm.value.uang_harian
    if(formData.value.lama_tugas) formData.value.uang_harian[0].hari = Number(formData.value.lama_tugas)
    calcUH(0)
    formData.value.tujuan_1 = selectedSbm.value.ibu_kota // prepopulate city
    notify('success','SBM Berhasil Diterapkan','Basis tarif dan tujuan telah dialihkan ke rincian Kwitansi.');
  }
}

// PAGINATION & LISTING
const filteredList = computed(() => {
  const q = searchQuery.value.toLowerCase()
  if (!q) return sptjmList.value
  return sptjmList.value.filter(s => (s.nama || '').toLowerCase().includes(q) || (s.tujuan_1 || '').toLowerCase().includes(q) || (s.nip || '').includes(q))
})
const totalPages = computed(() => Math.max(1, Math.ceil(filteredList.value.length / ITEMS_PER_PAGE)))
const safePage = computed(() => Math.min(currentPage.value, Math.max(1, totalPages.value)))
const paginatedList = computed(() => filteredList.value.slice((safePage.value - 1) * ITEMS_PER_PAGE, safePage.value * ITEMS_PER_PAGE))
watch(searchQuery, () => currentPage.value = 1)

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

function onFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files || files.length === 0) return
  
  for(let i=0; i<files.length; i++) {
    const file = files[i]
    if (file.size > 20 * 1024 * 1024) { notify('warning','Ukuran Terlalu Besar',`File ${file.name} > 20MB. Skip.`); continue }
    filesForUpload.value.push(file)
  }
}

// ACTION
function openForm(item?: SpjData) {
  if (item) {
    formData.value = JSON.parse(JSON.stringify(item))
    if (!formData.value.uang_harian?.length) formData.value.uang_harian = [{ perhari: 0, hari: 0, total: 0 }]
    if (!formData.value.penginapan?.length) formData.value.penginapan = [{ nama: '', perhari: 0, hari: 0, total: 0 }]
    if (!formData.value.transport?.length) formData.value.transport = [{ perhari: 0, hari: 0, total: 0 }]
    if (!formData.value.tiket_berangkat?.length) formData.value.tiket_berangkat = [emptyTiket()]
    if (!formData.value.tiket_pulang?.length) formData.value.tiket_pulang = [emptyTiket()]
    isEditMode.value = true
  } else {
    formData.value = emptyForm()
    isEditMode.value = false
  }
  filesForUpload.value = []
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

async function handleSave() {
  isSubmitting.value = true
  processingMessage.value = "Menyusun Kwitansi & Menyatukan File Bukti (Harap tunggu...)"
  formData.value.jumlah_dibayar = grandTotal.value
  
  try {
    const formDataObj = new FormData()
    
    // 1. Append Data sebagai JSON string
    formDataObj.append('data', JSON.stringify(formData.value))
    
    // 2. Append Files
    filesForUpload.value.forEach((file) => {
      formDataObj.append('files', file)
    })

    const response = await api.post<ApiResponse<any>>('/api/spj', formDataObj, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    if (response.data.status) {
      store.invalidateCache('spj')
      await loadList()
      const data = response.data.data
      successModal.value = {
        isOpen: true,
        fileUrl: data?.file_link || '',
        nama: formData.value.nama,
        jumlah: grandTotal.value
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
      if(response.data.status) { 
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
.custom-scrollbar::-webkit-scrollbar { height: 8px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
/* Hide number spinner */
input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
/* Modal transition */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
