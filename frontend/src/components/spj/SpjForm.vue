<template>
  <div v-motion :initial="{ opacity: 0, y: 10 }" :enter="{ opacity: 1, y: 0 }"
      class="max-w-6xl mx-auto space-y-6 pb-12">
      <button
        class="flex items-center gap-2 text-gray-500 hover:text-kementan-green transition-colors font-semibold text-sm bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 w-max"
        @click="closeForm">
        <ChevronLeft :size="18" /> Kembali ke Daftar SPJ
      </button>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- FORM UTAMA -->
        <div class="lg:col-span-2 glass-card rounded-3xl overflow-hidden shadow-lg border border-gray-200">
          <div class="bg-gradient-to-r from-kementan-green to-emerald-700 px-8 py-6 text-white">
            <h2 class="text-2xl font-extrabold">{{ isEditMode ? 'Edit Kwitansi SPJ' : 'Kwitansi (Rampung) SPJ & SPD' }}
            </h2>
            <p class="text-emerald-100 font-medium text-sm mt-1">Input rincian lengkap perjalanan dinas sesuai format
              Standar BPK.</p>
          </div>

          <div class="p-8 space-y-8">
            <!-- SECTION 1: IDENTITAS SURAT -->
            <div class="space-y-5">
              <div class="flex items-center gap-3 mb-2">
                <div
                  class="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-sm">
                  <FileText :size="17" />
                </div>
                <h4 class="text-sm font-black text-gray-800">Identitas Surat</h4>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Nomor
                    Pengajuan LS</label>
                  <input type="text" v-model="formData.nomorLs" placeholder="Contoh: 1, 2, 45"
                    class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all font-bold placeholder:text-gray-300">
                </div>
                <div>
                  <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Nomor
                    Surat
                    Tugas</label>
                  <input type="text" v-model="formData.nomorSt" placeholder="Otomatis Terisi..."
                    class="w-full bg-gray-50 border border-gray-300 rounded-xl py-3.5 px-4 text-sm font-bold text-gray-600 outline-none">
                </div>
                <div>
                  <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Tanggal
                    Surat Tugas</label>
                  <input type="date" v-model="formData.tglPerintah"
                    class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 font-bold transition-all">
                </div>
                <div>
                  <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Kode
                    Kapoksi
                    / Unit</label>
                  <input type="text" v-model="formData.kodeKapoksi" placeholder="misal: PLU, TU, dll"
                    class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all font-bold placeholder:text-gray-300">
                </div>
                <div>
                  <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Kode
                    MAK</label>
                  <input type="text" v-model="formData.kodeMak" placeholder="misal: 45354.RBO..."
                    class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all font-bold placeholder:text-gray-300">
                </div>
                <div>
                  <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Asal
                    Instansi</label>
                  <input type="text" v-model="formData.asalInstansi"
                    class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all font-bold">
                </div>
                <div class="md:col-span-3">
                  <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Uraian
                    Pembayaran (Kuitansi)</label>
                  <input type="text" v-model="formData.uraianPembayaran"
                    placeholder="Pembayaran biaya perjalanan dinas dalam rangka..."
                    class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all font-medium">
                </div>
              </div>
            </div>

            <!-- SECTION 2: PELAKSANA SPD -->
            <div class="space-y-5">
              <div class="flex items-center gap-3 mb-2">
                <div
                  class="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-sm">
                  <User :size="17" />
                </div>
                <h4 class="text-sm font-black text-gray-800">Pelaksana SPD</h4>
              </div>
              <div class="space-y-5">
                <SearchableDropdown label="Cari Pegawai (Autofill)" :options="pegawaiOptions"
                  :value="selectedPegawaiIndex" placeholder="Contoh: Budi Santoso..." :is-loading="isPegawaiLoading"
                  required @change="handlePegawaiChange" />
                <div class="grid grid-cols-2 md:grid-cols-3 gap-5">
                  <div>
                    <label
                      class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">NIP</label>
                    <input type="text" v-model="formData.nip"
                      class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm font-bold outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all">
                  </div>
                  <div>
                    <label
                      class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Pangkat/Gol
                      Ruang</label>
                    <input type="text" v-model="formData.pangkatGol"
                      class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm font-bold outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all">
                  </div>
                  <div>
                    <label
                      class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Golongan
                      (BPK)</label>
                    <input type="text" v-model="formData.gol" placeholder="Contoh: Golongan III"
                      class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm font-bold outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all placeholder:text-gray-300">
                  </div>
                  <div>
                    <label
                      class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Jabatan</label>
                    <input type="text" v-model="formData.jabatan"
                      class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm font-bold outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all">
                  </div>
                  <div>
                    <label
                      class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Tingkat
                      Biaya</label>
                    <input type="text" v-model="formData.tingkatBiaya"
                      class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm font-bold outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all">
                  </div>
                </div>
              </div>
            </div>

            <!-- SECTION 3: TUJUAN & WAKTU -->
            <div class="space-y-5">
              <div class="flex items-center gap-3 mb-2">
                <div
                  class="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white flex items-center justify-center shadow-sm">
                  <MapPin :size="17" />
                </div>
                <h4 class="text-sm font-black text-gray-800">Tujuan & Waktu Perjalanan</h4>
              </div>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-5">
                <div class="col-span-2">
                  <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Maksud /
                    Tujuan Acara</label>
                  <input type="text" v-model="formData.maksudTujuan"
                    class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm font-bold outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all">
                </div>
                <div>
                  <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">No SPD
                    (Otomatis)</label>
                  <input type="text" v-model="formData.noSpd" readonly
                    class="w-full bg-gray-50 border border-gray-300 rounded-xl py-3.5 px-4 text-sm font-bold text-blue-700 outline-none">
                </div>
                <div>
                  <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Nomor
                    Urut
                    SPD</label>
                  <input type="text" v-model="formData.noUrutSpd" placeholder="Contoh: 001"
                    class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm font-bold outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all placeholder:text-gray-300">
                </div>

                <div class="col-span-2">
                  <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Akun
                    MAK</label>
                  <input type="text" v-model="formData.noAkun" placeholder="Contoh: 45354.RBO.005.101.0A.521211"
                    class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm font-medium outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all placeholder:text-gray-300">
                </div>
                <div>
                  <label
                    class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Kendaraan</label>
                  <select v-model="formData.kendaraan"
                    class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm font-bold outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all">
                    <option value="Pesawat">Pesawat</option>
                    <option value="Kendaraan Umum">Kendaraan Umum</option>
                  </select>
                </div>
                <div>
                  <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Lama
                    (Hari)</label>
                  <input type="number" v-model="formData.lamaTugas" readonly
                    class="w-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-300 rounded-xl py-3.5 px-4 text-sm outline-none">
                </div>

                <div class="col-span-2">
                  <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Kota
                    Tujuan
                    (Utama)</label>
                  <input type="text" v-model="formData.tujuan1"
                    class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm font-bold outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all"
                    placeholder="Contoh: Jawa Barat">
                </div>
                <div>
                  <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Tujuan 2
                    (Opsional)</label>
                  <input type="text" v-model="formData.tujuan2"
                    class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm font-bold outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all">
                </div>
                <div>
                  <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Tujuan 3
                    (Opsional)</label>
                  <input type="text" v-model="formData.tujuan3"
                    class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm font-bold outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all">
                </div>

                <div class="col-span-2">
                  <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Periode
                    Tugas</label>
                  <div class="grid grid-cols-2 gap-4">
                    <input type="date" v-model="formData.tglBerangkat"
                      class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm font-bold outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all">
                    <input type="date" v-model="formData.tglKembali"
                      class="w-full bg-white border border-gray-300 rounded-xl py-3.5 px-4 text-sm font-bold outline-none focus:border-kementan-green focus:ring-4 focus:ring-kementan-green/10 transition-all">
                  </div>
                </div>
              </div>
            </div>

            <!-- Rincian Biaya -->
            <div class="space-y-6">
              <div class="flex items-center gap-3 mb-2">
                <div
                  class="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white flex items-center justify-center shadow-sm">
                  <Coins :size="17" />
                </div>
                <h4 class="text-sm font-black text-gray-800">Rincian Biaya Perjalanan</h4>
              </div>

              <!-- Uang Harian -->
              <div class="space-y-4">
                <div class="flex items-center justify-between border-b border-gray-100 pb-2">
                  <h4 class="text-xs font-black text-emerald-600 tracking-widest uppercase">Uang Harian</h4>
                  <button
                    class="text-xs bg-emerald-50 text-emerald-600 px-3 py-1.5 font-bold rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1"
                    @click="addUH">
                    <Plus :size="14" /> Tambah Baris
                  </button>
                </div>
                <div v-for="(uh, i) in formData.uangHarian" :key="'uh' + i"
                  class="flex flex-col sm:flex-row gap-3 bg-gray-50 p-4 rounded-xl relative border border-gray-200">
                  <div
                    class="absolute -top-2 -left-2 bg-kementan-green text-white w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold shadow-sm">
                    {{ i + 1 }}</div>
                  <div class="flex-1">
                    <label class="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Tarif
                      Perhari
                      (Rp)</label>
                    <input type="number" v-model.number="uh.perhari" @input="calcUH(i)"
                      class="w-full bg-white border border-gray-300 rounded-xl py-2.5 px-3 text-sm outline-none font-bold focus:border-kementan-green transition-all">
                  </div>
                  <div class="w-20">
                    <label class="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Hari</label>
                    <input type="number" v-model.number="uh.hari" @input="calcUH(i)"
                      class="w-full bg-white border border-gray-300 rounded-xl py-2.5 px-3 text-sm outline-none text-center font-bold focus:border-kementan-green transition-all">
                  </div>
                  <div class="flex-1">
                    <label
                      class="block text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Subtotal</label>
                    <input type="text" readonly :value="formatNumber(uh.total)"
                      class="w-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 rounded-xl py-2.5 px-3 text-sm outline-none">
                  </div>
                  <button v-if="formData.uangHarian.length > 1"
                    class="text-gray-400 hover:text-rose-600 mt-4 transition-colors"
                    @click="formData.uangHarian.splice(i, 1)">
                    <Trash2 :size="16" />
                  </button>
                </div>
              </div>

              <!-- Penginapan -->
              <div class="space-y-4 pt-4 border-t border-gray-100">
                <div class="flex items-center justify-between border-b border-gray-100 pb-2">
                  <h4 class="text-xs font-black text-kementan-green tracking-widest uppercase">Penginapan (Hotel)</h4>
                  <button
                    class="text-xs bg-emerald-50 text-emerald-600 px-3 py-1.5 font-bold rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1"
                    @click="addHtl">
                    <Plus :size="14" /> Tambah Hotel
                  </button>
                </div>
                <div v-for="(htl, i) in formData.penginapan" :key="'htl' + i"
                  class="flex flex-col sm:flex-row gap-3 bg-gray-50 p-4 rounded-xl relative border border-gray-200 flex-wrap">
                  <div class="flex-1 min-w-[120px]">
                    <label class="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Nama
                      Hotel</label>
                    <input type="text" v-model="htl.nama"
                      class="w-full bg-white border border-gray-300 rounded-xl py-2.5 px-3 text-sm outline-none font-bold focus:border-kementan-green transition-all">
                  </div>
                  <div class="w-32">
                    <label class="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Rate
                      (Rp)</label>
                    <input type="number" v-model.number="htl.perhari" @input="calcHtl(i)"
                      class="w-full bg-white border border-gray-300 rounded-xl py-2.5 px-3 text-sm outline-none font-bold focus:border-kementan-green transition-all">
                  </div>
                  <div class="w-16">
                    <label
                      class="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Malam</label>
                    <input type="number" v-model.number="htl.hari" @input="calcHtl(i)"
                      class="w-full bg-white border border-gray-300 rounded-xl py-2.5 px-3 text-sm outline-none text-center font-bold focus:border-kementan-green transition-all">
                  </div>
                  <div class="w-32">
                    <label
                      class="block text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Subtotal</label>
                    <input type="text" readonly :value="formatNumber(htl.total)"
                      class="w-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 rounded-xl py-2.5 px-3 text-sm outline-none">
                  </div>
                  <button v-if="formData.penginapan.length > 1"
                    class="text-gray-400 hover:text-rose-600 mt-4 transition-colors"
                    @click="formData.penginapan.splice(i, 1)">
                    <Trash2 :size="16" />
                  </button>
                </div>
              </div>

              <!-- Tiket Transport Darat/Pesawat dsb -->
              <div class="space-y-4 pt-4 border-t border-gray-100">
                <h4
                  class="text-xs font-black text-kementan-green tracking-widest uppercase border-b border-gray-100 pb-2">
                  Biaya Tiket & Transport Lain</h4>

                <!-- Berangkat -->
                <div class="bg-blue-50/30 p-4 rounded-xl border border-blue-200 space-y-3">
                  <div class="flex items-center justify-between">
                    <p class="text-xs font-black text-blue-800 tracking-wide">Tiket Berangkat</p>
                    <button class="text-[10px] text-blue-600 font-bold flex items-center gap-1"
                      @click="addTiket('berangkat')">
                      <Plus :size="12" /> Tambah Tiket
                    </button>
                  </div>
                  <div v-for="(tkt, i) in formData.tiketBerangkat" :key="'tb' + i"
                    class="grid grid-cols-2 lg:grid-cols-7 gap-2 bg-white p-3 rounded-xl border border-gray-200 relative pr-8">
                    <input type="date" v-model="tkt.tgl"
                      class="col-span-2 lg:col-span-1 border border-gray-300 rounded-lg px-2.5 py-2 text-xs font-bold outline-none focus:border-kementan-green transition-all"
                      title="Tanggal">
                    <input type="text" v-model="tkt.dari" placeholder="Dari"
                      class="border border-gray-300 rounded-lg px-2.5 py-2 text-xs font-bold outline-none focus:border-kementan-green transition-all placeholder:text-gray-300">
                    <input type="text" v-model="tkt.ke" placeholder="Ke"
                      class="border border-gray-300 rounded-lg px-2.5 py-2 text-xs font-bold outline-none focus:border-kementan-green transition-all placeholder:text-gray-300">
                    <input type="text" v-model="tkt.maskapai" placeholder="Pesawat/KA"
                      class="border border-gray-300 rounded-lg px-2.5 py-2 text-xs font-bold outline-none focus:border-kementan-green transition-all placeholder:text-gray-300">
                    <input type="text" v-model="tkt.kodeBooking" placeholder="Kode Booking"
                      class="border border-gray-300 rounded-lg px-2.5 py-2 text-xs font-bold outline-none focus:border-kementan-green transition-all placeholder:text-gray-300">
                    <input type="number" v-model.number="tkt.harga" placeholder="Harga"
                      class="col-span-2 lg:col-span-1 border border-blue-300 rounded-lg px-2.5 py-2 text-xs font-bold text-blue-700 bg-blue-50 outline-none focus:border-blue-500 transition-all">
                    <button class="absolute right-2.5 top-3 text-gray-400 hover:text-rose-600 transition-colors"
                      @click="formData.tiketBerangkat.splice(i, 1)">
                      <X :size="14" />
                    </button>
                  </div>
                </div>

                <!-- Pulang -->
                <div class="bg-indigo-50/30 p-4 rounded-xl border border-indigo-200 space-y-3">
                  <div class="flex items-center justify-between">
                    <p class="text-xs font-black text-indigo-800 tracking-wide">Tiket Pulang</p>
                    <button class="text-[10px] text-indigo-600 font-bold flex items-center gap-1"
                      @click="addTiket('pulang')">
                      <Plus :size="12" /> Tambah Tiket
                    </button>
                  </div>
                  <div v-for="(tkt, i) in formData.tiketPulang" :key="'tp' + i"
                    class="grid grid-cols-2 lg:grid-cols-7 gap-2 bg-white p-3 rounded-xl border border-gray-200 relative pr-8">
                    <input type="date" v-model="tkt.tgl"
                      class="col-span-2 lg:col-span-1 border border-gray-300 rounded-lg px-2.5 py-2 text-xs font-bold outline-none focus:border-kementan-green transition-all"
                      title="Tanggal">
                    <input type="text" v-model="tkt.dari" placeholder="Dari"
                      class="border border-gray-300 rounded-lg px-2.5 py-2 text-xs font-bold outline-none focus:border-kementan-green transition-all placeholder:text-gray-300">
                    <input type="text" v-model="tkt.ke" placeholder="Ke"
                      class="border border-gray-300 rounded-lg px-2.5 py-2 text-xs font-bold outline-none focus:border-kementan-green transition-all placeholder:text-gray-300">
                    <input type="text" v-model="tkt.maskapai" placeholder="Pesawat/KA"
                      class="border border-gray-300 rounded-lg px-2.5 py-2 text-xs font-bold outline-none focus:border-kementan-green transition-all placeholder:text-gray-300">
                    <input type="text" v-model="tkt.kodeBooking" placeholder="Kode Booking"
                      class="border border-gray-300 rounded-lg px-2.5 py-2 text-xs font-bold outline-none focus:border-kementan-green transition-all placeholder:text-gray-300">
                    <input type="number" v-model.number="tkt.harga" placeholder="Harga"
                      class="col-span-2 lg:col-span-1 border border-indigo-300 rounded-lg px-2.5 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 outline-none focus:border-indigo-500 transition-all">
                    <button class="absolute right-2.5 top-3 text-gray-400 hover:text-rose-600 transition-colors"
                      @click="formData.tiketPulang.splice(i, 1)">
                      <X :size="14" />
                    </button>
                  </div>
                </div>

                <!-- Transport Darat -->
                <div class="bg-amber-50/30 p-4 rounded-xl border border-amber-200 space-y-3">
                  <div class="flex items-center justify-between">
                    <p class="text-xs font-black text-amber-800 tracking-wide">Transport Lokal (Darat)</p>
                    <button class="text-[10px] text-amber-600 font-bold flex items-center gap-1" @click="addTrp">
                      <Plus :size="12" /> Tambah Transport
                    </button>
                  </div>
                  <div v-for="(t, i) in formData.transport" :key="'trp' + i" class="flex gap-2 relative">
                    <input type="number" v-model.number="t.perhari" @input="calcTrp(i)" placeholder="Tarif"
                      class="border border-gray-300 rounded-lg px-2.5 py-2 text-xs flex-1 font-bold outline-none focus:border-kementan-green transition-all placeholder:text-gray-300">
                    <input type="number" v-model.number="t.hari" @input="calcTrp(i)" placeholder="Qty"
                      class="border border-gray-300 rounded-lg px-2.5 py-2 text-xs w-20 font-bold outline-none text-center focus:border-kementan-green transition-all placeholder:text-gray-300">
                    <input type="text" readonly :value="formatNumber(t.total)"
                      class="border border-amber-200 bg-amber-50 rounded-lg px-2.5 py-2 text-xs font-bold text-amber-800 flex-1 outline-none">
                    <button class="text-gray-400 hover:text-rose-600 ml-1 transition-colors"
                      @click="formData.transport.splice(i, 1)">
                      <X :size="14" />
                    </button>
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
                      <input type="number" v-model.number="formData.taksi"
                        class="border border-gray-300 rounded-lg p-2 text-right text-xs w-32 font-bold outline-none focus:border-kementan-green transition-all">
                    </div>
                    <div class="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-200">
                      <label class="text-xs font-bold text-gray-600">Representasi</label>
                      <input type="number" v-model.number="formData.representasi"
                        class="border border-gray-300 rounded-lg p-2 text-right text-xs w-32 font-bold outline-none focus:border-kementan-green transition-all">
                    </div>
                    <div class="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-200">
                      <label class="text-xs font-bold text-gray-600">Lainnya / Uang Saku</label>
                      <input type="number" v-model.number="formData.uangLainnya"
                        class="border border-gray-300 rounded-lg p-2 text-right text-xs w-32 font-bold outline-none focus:border-kementan-green transition-all">
                    </div>
                  </div>
                </div>

                <div>
                  <h4 class="text-xs font-black text-blue-600 tracking-widest uppercase mb-3">Upload Bukti Lampiran</h4>
                  <div class="border-2 border-dashed border-gray-300 bg-gray-50/50 rounded-xl p-5 text-center">
                    <UploadCloud :size="24" class="mx-auto text-gray-400 mb-2" />
                    <p class="text-[10px] text-gray-500 font-medium mb-3">Pilih format Gambar (JPG/PNG) atau
                      PDF.<br />Dokumen PDF akan otomatis didecode menjadi gambar lampiran.</p>
                    <input type="file" multiple accept=".pdf,.png,.jpg,.jpeg"
                      class="text-xs text-center mx-auto block max-w-full overflow-hidden file:mr-4 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:bg-kementan-green/10 file:text-kementan-green hover:file:bg-kementan-green/20 file:transition-colors"
                      @change="onFileChange">
                  </div>
                  <div class="mt-2 text-[10px] font-bold text-emerald-600 flex items-center gap-1"
                    v-if="filesForUpload.length">
                    <CheckCircle :size="12" /> {{ filesForUpload.length }} lembar bukti siap disematkan.
                  </div>
                  <div class="mt-2 text-[10px] text-gray-500" v-else-if="formData.fileBukti && isEditMode">
                    Lampiran lama <a :href="formData.fileBukti" target="_blank" class="text-blue-500 underline">Lihat
                      disini</a>.
                  </div>
                </div>
              </div>

              <!-- SUBMIT BUTTONS -->
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
              <div
                class="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-sm">
                <Search :size="17" />
              </div>
              <h4 class="text-sm font-black text-gray-800">Cek SBM Provinsi</h4>
            </div>

            <div class="space-y-5">
              <SearchableDropdown v-model:value="sbmQuery" label="Ketik Nama Kota/SBM Tujuan" :options="sbmOptions"
                :is-loading="isSbmLoading" placeholder="Contoh: Jawa Barat" />

              <transition name="fade">
                <div v-if="selectedSbm"
                  class="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/50 rounded-2xl p-5 space-y-4 shadow-sm">
                  <div>
                    <p class="text-[10px] font-black text-blue-500/80 tracking-widest uppercase mb-1">Uang Harian (Per
                      Hari)
                    </p>
                    <p class="text-xl font-extrabold text-blue-700">Rp {{ formatNumber(selectedSbm.uangHarian) }}</p>
                  </div>

                  <div class="grid grid-cols-2 gap-4 pt-4 border-t border-blue-200/50">
                    <div class="bg-white/60 p-2.5 rounded-xl border border-blue-100/30">
                      <p class="text-[9px] font-black text-blue-500 tracking-widest uppercase mb-1">Tiket Bisnis</p>
                      <p class="font-bold text-gray-700 text-xs">{{ formatNumber(selectedSbm.data?.tiketBisnis || '') }}
                      </p>
                    </div>
                    <div class="bg-white/60 p-2.5 rounded-xl border border-blue-100/30">
                      <p class="text-[9px] font-black text-blue-500 tracking-widest uppercase mb-1">Tkt Ekonomi</p>
                      <p class="font-bold text-gray-700 text-xs">{{ formatNumber(selectedSbm.data?.tiketEkonomi || '') }}
                      </p>
                    </div>
                  </div>

                  <button type="button"
                    class="w-full mt-2 py-3 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 hover:shadow-md transition-all flex items-center justify-center gap-2"
                    @click="handleApplySbm">
                    Terapkan Nilai ini ke Baris 1
                  </button>
                </div>
              </transition>
            </div>
          </div>

          <!-- SUMMARY -->
          <div class="glass-card bg-white rounded-3xl p-6 lg:p-8 border border-gray-200 shadow-md sticky top-[22rem]">
            <div class="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div
                class="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white flex items-center justify-center shadow-sm">
                <Coins :size="17" />
              </div>
              <h4 class="text-sm font-black text-gray-800">Ringkasan Total</h4>
            </div>

            <ul class="text-sm space-y-3.5 mb-6">
              <li class="flex justify-between items-center"><span
                  class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Uang Harian</span><span
                  class="font-bold text-gray-700">Rp {{ formatNumber(sumUH) }}</span></li>
              <li class="flex justify-between items-center"><span
                  class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Penginapan</span><span
                  class="font-bold text-gray-700">Rp {{ formatNumber(sumHTL) }}</span></li>
              <li class="flex justify-between items-center"><span
                  class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Transport Lokal</span><span
                  class="font-bold text-gray-700">Rp {{ formatNumber(sumTRP) }}</span></li>
              <li class="flex justify-between items-center"><span
                  class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tiket PP</span><span
                  class="font-bold text-gray-700">Rp {{ formatNumber(sumTKT) }}</span></li>
              <li class="flex justify-between items-center"><span
                  class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Lainnya</span><span
                  class="font-bold text-gray-700">Rp
                  {{ formatNumber(Number(formData.taksi || 0) + Number(formData.representasi || 0) + Number(formData.uangLainnya || 0)) }}</span>
              </li>
            </ul>

            <div class="p-5 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-200">
              <p class="text-[10px] font-black text-emerald-500/80 tracking-widest uppercase mb-1">Jumlah Dibayar (Grand
                Total)</p>
              <p class="text-2xl font-black text-emerald-700 tracking-tight">Rp {{ formatNumber(grandTotal) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ChevronLeft, FileText, MapPin, Coins, Plus, Trash2, X, UploadCloud, CheckCircle, Search, Save, User } from 'lucide-vue-next'
import SearchableDropdown from '../SearchableDropdown.vue'
import type { SpjData, PegawaiData, SbmData, SpjTiket } from '../../types/api'

const props = defineProps<{
  initialData: SpjData
  isEditMode: boolean
  pegawaiOptions: any[]
  sbmOptions: any[]
  pegawaiList: PegawaiData[]
  sbmList: SbmData[]
  isPegawaiLoading: boolean
  isSbmLoading: boolean
  isSubmitting: boolean
  processingMessage: string
}>()

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'save', formData: SpjData, filesForUpload: File[]): void
  (e: 'notify', type: any, title: string, message: string): void
}>()

const formData = ref<SpjData>(JSON.parse(JSON.stringify(props.initialData)))
const filesForUpload = ref<File[]>([])

const emptyTiket = (): SpjTiket => ({ tgl: '', dari: '', ke: '', maskapai: '', kodeBooking: '', noTiket: '', harga: 0 })

function formatNumber(v: any) { return (Number(v) || 0).toLocaleString('id-ID') }


const sumUH = computed(() => formData.value.uangHarian.reduce((a, b) => a + (Number(b.total) || 0), 0))
const sumHTL = computed(() => formData.value.penginapan.reduce((a, b) => a + (Number(b.total) || 0), 0))
const sumTRP = computed(() => formData.value.transport.reduce((a, b) => a + (Number(b.total) || 0), 0))
const sumTKT = computed(() => formData.value.tiketBerangkat.reduce((a, b) => a + (Number(b.harga) || 0), 0) + formData.value.tiketPulang.reduce((a, b) => a + (Number(b.harga) || 0), 0))
const grandTotal = computed(() => sumUH.value + sumHTL.value + sumTRP.value + sumTKT.value + Number(formData.value.taksi || 0) + Number(formData.value.representasi || 0) + Number(formData.value.uangLainnya || 0))

const calcUH = (i: number) => formData.value.uangHarian[i].total = (Number(formData.value.uangHarian[i].perhari) || 0) * (Number(formData.value.uangHarian[i].hari) || 0)
const calcHtl = (i: number) => formData.value.penginapan[i].total = (Number(formData.value.penginapan[i].perhari) || 0) * (Number(formData.value.penginapan[i].hari) || 0)
const calcTrp = (i: number) => formData.value.transport[i].total = (Number(formData.value.transport[i].perhari) || 0) * (Number(formData.value.transport[i].hari) || 0)

const notify = (type: any, title: string, message: string) => emit('notify', type, title, message)

const addUH = () => { if (formData.value.uangHarian.length < 3) formData.value.uangHarian.push({ perhari: 0, hari: 0, total: 0 }); else notify('warning', 'Batas Maksimal', 'Uang harian maksimal 3 baris.') }
const addHtl = () => { if (formData.value.penginapan.length < 9) formData.value.penginapan.push({ nama: '', perhari: 0, hari: 0, total: 0 }); else notify('warning', 'Batas Maksimal', 'Hotel/Penginapan maksimal 9 tempat.') }
const addTrp = () => { if (formData.value.transport.length < 3) formData.value.transport.push({ perhari: 0, hari: 0, total: 0 }); else notify('warning', 'Batas Maksimal', 'Transport darat maksimal 3 baris.') }
const addTiket = (type: 'berangkat' | 'pulang') => {
  if (type === 'berangkat' && formData.value.tiketBerangkat.length < 2) formData.value.tiketBerangkat.push(emptyTiket())
  else if (type === 'pulang' && formData.value.tiketPulang.length < 3) formData.value.tiketPulang.push(emptyTiket())
  else notify('warning', 'Batas Maksimal', `Tiket ${type} sudah penuh maksimal slot.`)
}

const selectedPegawaiIndex = computed(() => { const idx = props.pegawaiList.findIndex(p => p.nip === formData.value.nip && p.namaLengkap === formData.value.nama); return idx >= 0 ? String(idx) : '' })
const handlePegawaiChange = (strIdx: string) => {
  if (!strIdx) return
  const p = props.pegawaiList[parseInt(strIdx)]
  if (p) {
    formData.value.nama = p.namaLengkap; formData.value.jabatan = p.jabatan || ''; formData.value.nip = p.nip || ''; formData.value.pangkatGol = p.pangkatGolRuang || ''; formData.value.gol = p.golongan || ''
  }
}

const sbmQuery = ref('')
const selectedSbm = computed(() => props.sbmList.find(s => s.kecKab === sbmQuery.value))

watch([() => formData.value.tglBerangkat, () => formData.value.tglKembali], ([start, end]) => {
  if (start && end) {
    const d1 = new Date(start); const d2 = new Date(end)
    const diff = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)) + 1
    formData.value.lamaTugas = String(diff > 0 ? diff : 0)
  }
})

watch([() => formData.value.noUrutSpd, () => formData.value.kodeKapoksi, () => formData.value.tglPerintah], ([urut, kapoksi, tgl]) => {
  if (urut && kapoksi && tgl) {
    const d = new Date(tgl)
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    formData.value.noSpd = `${urut}/${kapoksi}/SPD/PEL.LIP/${mm}/${yyyy}`
  }
})

const handleApplySbm = () => {
  if (selectedSbm.value && formData.value.uangHarian.length > 0) {
    formData.value.uangHarian[0].perhari = Number(selectedSbm.value.uangHarian)
    if (formData.value.lamaTugas) formData.value.uangHarian[0].hari = Number(formData.value.lamaTugas)
    calcUH(0)
    formData.value.tujuan1 = selectedSbm.value.kecKab
    notify('success', 'SBM Berhasil Diterapkan', 'Basis tarif dan tujuan telah dialihkan ke rincian Kwitansi.');
  }
}

function onFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files || files.length === 0) return
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    if (file.size > 20 * 1024 * 1024) { notify('warning', 'Ukuran Terlalu Besar', `File ${file.name} > 20MB. Skip.`); continue }
    filesForUpload.value.push(file)
  }
}

function closeForm() { emit('cancel') }
function handleSave() { 
  formData.value.jumlahDibayar = grandTotal.value
  emit('save', formData.value, filesForUpload.value) 
}

</script>

<style scoped>
input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
