# Arsitektur & Database Master [APP] E-Office Dit. PL

Dokumen ini adalah cetak biru mutlak keseluruhan infrastruktur **Hybrid (PostgreSQL & Google Cloud)** yang menggerakan web E-Office Dit. PL. PostgreSQL berfungsi sebagai database utama (CRUD), sementara Google Sheets berfungsi sebagai mirror/arsip audit otomatis.

## 1. Peta Hierarki Google Drive

Sistem penyimpanan membagi arsip berdasarkan *Tim Poksi*. Setiap Tim memegang kontrol dan privasi atas dokumennya.

```text
📁 [APP] E-Office Dit. PL
 ├── 📁 1_Database
 │    └── 📊 Database E-Office (Spreadsheet Induk dengan 7 Tab)
 │
  ├── 📁 2_Template_Sistem (Arsip/Legacy)
 │    ├── 📄 1_Template_SPT_v1
 │    ├── 📄 2_Template_SPT_v2
 │    ├── 📄 3_Template_SPJ / Kuitansi
 │    └── 📄 4_Template_SPTJM
 │    *Catatan: Sistem sekarang menggunakan template lokal di folder /backend/template.*
 │
  ├── 📁 3_Arsip_Dokumen
 │    ├── 📁 TU_Direktorat_PL
 │    │    ├── 📁 SPT                   (ID Folder: kolom B di Config)
 │    │    ├── 📁 SPTJM                 (ID Folder: kolom C di Config)
 │    │    ├── 📁 SPJ_Kuitansi          (ID Folder: kolom J di Config)
 │    │    ├── 📁 Surat_Masuk           (ID Folder: kolom G di Config)
 │    │    ├── 📁 Surat_Keluar          (ID Folder: kolom H di Config)
 │    │    └── 📁 Notulensi_Acara       (ID Folder: kolom I di Config)
 │    │
 │    ├── 📁 Tim_Poksi_Lainnya...
 │         └── (Struktur sama)
 │
 └── 📁 4_Assets_Media
      └── Menyimpan file aset web statis.
```

---

## 2. Struktur Relasional Database (Google Sheets)

Semua pergerakan basis data ditangani terpusat melalui **PostgreSQL**. Google Sheets digunakan sebagai Mirror Database 1-way (Postgres -> Sheets) yang berisikan 8 Tab:

### TAB 1: `DATA_ADMIN` (Manajemen Pengguna)
- `A` - **username**: Username untuk login.
- `B` - **password**: Kata sandi akses.
- `C` - **nama_admin**: Nama pengguna.
- `D` - **tim_poksi**: Tim Poksi tempat admin bertugas.
- `E` - **last_login**: Tanggal & jam login terakhir.
- `F` - **role**: Level akses (Super Admin / Admin).

### TAB 2: `CONFIG` (Pusat Sinkronisasi Folder Drive)
- `A` - **tim_poksi**: Primary Key.
- `B` - **folder_id_spt**
- `C` - **folder_id_sptjm**
- `D` - **folder_id_surat_masuk**
- `E` - **folder_id_surat_keluar**
- `F` - **folder_id_notulensi**
- `G` - **folder_id_spj**

### TAB 3: `SBM` (Kamus Standar Biaya Masukan)
- Tabel masif ini menyimpan referensi akuntansi uang harian, tiket, pajak bandara, dll. Sistem membaca kota `Kec_Kab` dan parameter `Pesawat` maupun Golongan Eselon.

### TAB 4: `DATA_PEGAWAI` (Data Fungsional Pejabat)
- `A` - Kode
- `B` - **nama_lengkap**
- `C` - nip
- `D` - golongan
- `E` - pangkat_gol_ruang
- `F` - tingkat_biaya
- `G` - jabatan
- `H` - direktorat
- `I` - poksi

### TAB 5: `SPT` (Rekam Penerbitan Surat Tugas)
- `A` - id_spt
- `B` - no
- `C` - tanggal_surat
- `D` - maksud_perjalanan
- `E` - **peserta**: Object Array dalam bentuk JSON / Teks untuk efisiensi baris (Many to One).
- `F` - peserta_count
- `G` - **tim_poksi**: Penentu siapa yang bisa melihat data ini.
- `H` - file_link
- `I` - mak
- `J` - created_at
- `K` - **kegiatan**: Deskripsi kegiatan SPT.

### TAB 6: `SPTJM` (Rekam Penerbitan Pakta Biaya Riil)
- `A` - id_sptjm
- `B` - nama_lengkap
- `C` - nip
- `D` - jabatan
- `E` - tujuan
- `F` - tanggal_perjalanan
- `G` - tanggal_kembali
- `H` - tiket_berangkat
- `I` - tiket_pulang
- `J` - biaya_sbm: (Referensi SBM - Tidak dihitung ke total).
- `K` - **total_biaya**: (Hanya jumlah Tiket Berangkat + Pulang).
- `L` - tanggal_ttd
- `M` - **tim_poksi**: Filter otorisasi.
- `N` - file_link
- `O` - created_at

### TAB 7: `SURAT` (Modul Arsip Persuratan / E-Arsip)
Tab ini menampung log Surat Masuk, Surat Keluar, dan Undangan dengan integrasi digitalisasi berkas.
- `A` - **id_surat**: PK (SRT-timestamp).
- `B` - **tim_poksi**: Filter otorisasi unit.
- `C` - **tipe_surat**: 'Masuk' atau 'Keluar'.
- `D` - **kategori_surat**: 'Surat Dinas', 'Undangan', 'Nota Dinas', dll.
- `E` - **sifat_surat**: 'Biasa', 'Segera', 'Penting', 'Rahasia'.
- `F` - **nomor_surat**: Nomor resmi dokumen.
- `G` - **tanggal_masuk**: Tanggal terima/kirim fisik.
- `H` - **tanggal_surat**: Tanggal tertera di surat.
- `I` - **asal_tujuan**: Instansi pengirim atau penerima.
- `J` - **perihal**: Ringkasan isi surat.
- `K` - **tgl_acara_mulai**: Start event (jika kategori Undangan).
- `L` - **tgl_acara_selesai**: End event (jika kategori Undangan).
- `M` - **disposisi_ke**: List nama tim/pegawai (JSON Array).
- `N` - **tgl_disposisi**: Tanggal diteruskan.
- `O` - **tindak_lanjut**: Catatan hasil/notulensi teks.
- `P` - **file_surat**: URL G-Drive Berkas Surat.
- `Q` - **file_notulensi**: URL G-Drive Berkas Notulensi/Lampiran.
- `R` - **created_at**: Timestamp log dibuat.

### TAB 8: `PERJADIN` (Rekam Kwitansi SPJ & SPD Perjalanan Dinas)
Tab flat 1-baris-per-orang (**119 kolom**) untuk menyimpan seluruh rincian perjalanan dinas sesuai format audit BPK. Sub-item disimpan dalam kolom berseri. Auto-create header oleh `Spj.gs`.

**Kolom Identitas BPK (A-I, index 0-8):**
- `A` - **id_perjadin**: PK sistem (SPJ-timestamp).
- `B` - **nomor_st**: Nomor ST/SPPD.
- `C` - **asal_instansi**: Asal instansi (default: "Direktorat PL").
- `D` - **nip**, `E` - **nama**, `F` - **pangkat_gol**, `G` - **gol**: Identitas pelaksana.
- `H` - **maksud_tujuan**: Bunyi akun perjalanan dinas.
- `I` - **jumlah_dibayar**: Total jumlah yang dibayar (computed via backend `Spj.gs` for data integrity).

**Kolom Tujuan & Waktu (J-O, index 9-14):**
- `J-L` - **tujuan_1, tujuan_2, tujuan_3**: Kota tujuan (multi-destinasi).
- `M` - **lama_tugas**, `N` - **tgl_berangkat**, `O` - **tgl_kembali**.

**Uang Harian 1-3 (P-X, index 15-23):** 3 slot × 3 field (perhari, hari, total).
**Penginapan 1-9 (Y-BH, index 24-59):** 9 slot × 4 field (nama, perhari, hari, total).
**Extra BPK (BI-BJ, index 60-61):** 2 kolom cadangan BPK.
**Transport 1-3 (BK-BS, index 62-70):** 3 slot × 3 field (perhari, hari, total).
**Tiket Berangkat 1-2 (BT-CG, index 71-84):** 2 slot × 7 field (tgl, dari, ke, maskapai, kode_booking, no_tiket, harga).
**Tiket Pulang 1-3 (CH-DB, index 85-105):** 3 slot × 7 field.
**Biaya Lain (DC-DE, index 106-108):** taksi, representasi, uang_lainnya.
**Sistem & Template (DF-DO, index 109-118):** no_spd, no_akun, jabatan, tingkat_biaya, kendaraan, tgl_perintah, tim_poksi, file_link, file_bukti, created_at.

---

## 3. Logika Role-Based Access Control (RBAC)

Aplikasi menggunakan sistem otorisasi berbasis peran (role) untuk menentukan batasan akses data antar unit kerja (Tim Poksi).

### 3.1. Definisi Peran (Roles)
- **Admin**: Peran standar. Hanya dapat melihat, menambah, mengubah, dan menghapus data yang memiliki label `tim_poksi` yang sama dengan akun tersebut.
- **Super Admin**: Peran tingkat tinggi. Memiliki hak akses penuh untuk melihat seluruh data dari semua Tim Poksi di setiap modul (Dashboard, SPT, SPTJM, dan Arsip Persuratan).

### 3.2. Mekanisme Filter Global
Untuk mendukung akses lintas unit bagi Super Admin, sistem menggunakan logika khusus pada Backend:
1. **Keyword 'SEMUA'**: Saat Super Admin mengakses data, Frontend akan mengirimkan parameter `tim_poksi: 'SEMUA'`.
2. **Bypass Filter**: Jika parameter yang diterima adalah `'SEMUA'`, maka pencarian data akan mengabaikan filter kolom `tim_poksi`.
3. **Persistensi Role**: Informasi role disimpan pada **Kolom F** di tab `DATA_ADMIN`.

### 3.3. Keamanan Sisi Klien (Frontend)
- **Session Management**: Data role disimpan dalam `localStorage` saat login.
- **Form Authorization**: Pilihan role hanya dapat diubah oleh admin yang memiliki akses ke modul Manajer Admin.
- **Context Refresh**: Saat admin mengubah role mereka sendiri, sistem akan memicu pembaruan sesi dan muat ulang halaman (`window.location.reload()`) untuk memastikan perubahan hak akses diterapkan secara instan di tatap muka pengguna.

---

## 4. Logika & Konvensi Frontend

Bagian ini mendokumentasikan pola teknis yang digunakan di sisi Client (Vue.js) untuk memastikan pengalaman pengguna yang premium dan fungsionalitas yang kuat.

### 4.1. Utilitas Download Langsung (Direct Download)
File: `src/utils/drive.ts`

Sistem mengimplementasikan konversi URL Google Drive secara otomatis untuk menghindari tab viewer default browser yang lambat.
- **Mekanisme**: Mengambil File ID dari URL `/file/d/[ID]/view` dan mengubahnya menjadi endpoint `/uc?export=download&id=[ID]`.
- **Trigger**: Menggunakan elemen `<a>` tersembunyi dengan atribut `download` untuk memicu penyimpanan file langsung ke sistem operasi pengguna.

### 4.2. Standarisasi Tabel Manajemen (Premium Layout)
Seluruh modul manajer utama telah direfaktor menjadi arsitektur modular untuk meningkatkan performa dan kemudahan pemeliharaan. Desain tabel "Premium" diimplementasikan di dalam komponen `*List.vue`:
- **Kolom Informasi Pelaksana**: Menampilkan Avatar (inisial nama) dengan badge status tambahan (seperti `+N LAINNYA` jika peserta > 1).
- **Kolom Rincian Perjalanan**: Menggunakan perpaduan teks tebal untuk tujuan dan *background-badges* untuk tanggal serta label Tim Poksi.
- **Hirarki Tombol Aksi**:
    - **PREVIEW (Primary)**: Biru (`bg-blue-600`), Ikon `Eye`. Membuka pratinjau PDF.
    - **DOWNLOAD (Indigo)**: Indigo (`bg-indigo-50`), Ikon `Download`. Unduh file langsung via `drive.ts`.
    - **EDIT (Emerald)**: Emerald (`bg-emerald-50`), Ikon `Edit3`. Form modifikasi.
    - **HAPUS (Rose)**: Rose (`bg-rose-50`), Ikon `Trash2`. Penghapusan permanen.

### 4.3. Normalisasi Data Administratif (Auth Compatibility)
File: `src/components/Layout.vue`

Untuk mengatasi perbedaan format antara sistem lama dan baru, dilakukan normalisasi di level komponen utama:
- `nama_admin` dipetakan dari `parsed.nama_admin` atau `parsed.nama`.
- `tim_poksi` dipetakan dari `parsed.tim_poksi` atau `parsed.timPoksi`.
- Hal ini memastikan profil pengguna tetap terbaca meskipun versi token/auth berubah.

### 4.4. Perilaku Navigasi (Router Key)
Untuk memastikan user dapat mereset tampilan halaman (misalnya keluar dari Form Mode kembali ke List Mode) hanya dengan mengklik menu yang sama di sidebar:
- **Full-Path Key**: `router-view` menggunakan `:key="$route.fullPath"` sehingga setiap perubahan parameter (termasuk timestamp) akan memaksa komponen halaman untuk melakukan insialisasi ulang (re-mount).

### 4.5. Arsitektur Komponen Modular (Manager-List-Form)
Modul utama (`SPJ`, `SPT`, `SPTJM`, `ArsipSurat`) dipisahkan menjadi tiga lapisan tanggung jawab:
1. **Orchestrator (Manager)**: File di `src/pages/*.vue`. Mengelola state global, API fetching (`api.get`, `api.post`), manajemen cache `useDataStore`, dan koordinasi modal (File Preview, Notifikasi).
2. **List Component**: File di `src/components/[folder]/*List.vue`. Menangani UI tabel, pencarian lokal, filter, paginasi, dan event aksi (Edit/Delete/Preview).
3. **Form Component**: File di `src/components/[folder]/*Form.vue`. Menangani input data, validasi, kalkulasi dinamis, dan integrasi `SearchableDropdown` untuk data pegawai.

Keuntungan: Reduksi baris kode per file (dari 1000+ ke <400 baris), efisiensi token AI dalam proses debugging, dan isolasi logika form yang kompleks.

### 4.6. TypeScript Strict Synchronization (Type Safety)
Sebagai komitmen terhadap arsitektur _production-ready_, aplikasi menuntut sinkronisasi absolut antara Vue Template dan `<script setup lang="ts">`.
- **Deklarasi Eksplisit**: Semua variabel, *formatter*, dan _event hook_ (seperti `isSubmitting`, `openForm`, `handleRefresh`) yang dipanggil pada template **WAJIB** dideklarasikan secara konkrit di script.
- **Event Proxy**: Pemanggilan fungsi interaktif dari List atau Form tidak boleh memanipulasi _state_ secara langsung. Melainkan harus diarahkan ke *emit proxies* (contoh: `function handleRefresh() { emit('refresh') }`) demi menjaga data _flow_ dari parent (Orchestrator).
- **Penanganan Index `v-for`**: Pada Vue, index _loop_ objek sering dipersepsikan sebagai gabungan tipe (`string | number`). Oleh karena itu, *method param* yang bertugas memanipulasi _Array/List_ **WAJIB** dikonversi secara sadar (misal: `idx: number | string` lalu `Number(idx)`) untuk menghindari *lint errors* ketika build `vue-tsc --noEmit`.

### 4.7. AI Agentic Skills & Tooling
Aplikasi ini dikembangkan menggunakan dukungan asisten AI terintegrasi (seperti Claude Code atau Antigravity). Repositori ini dilengkapi dengan spesialisasi _skills_ yang berada di dalam folder(`.agent/skills/`). 
Kumpulan _skill_ ini (misalnya `bun-development`, `drizzle-orm-expert`, `vibe-code-auditor`, `production-code-audit`, `testing-patterns`, dsb.) **WAJIB** digunakan oleh agen AI dalam setiap sesi penyesuaian fungsionalitas, migrasi, maupun validasi arsitektur demi menjamin _best practices_ tetap selaras dengan ekosistem lokal.

---

## 5. Sinkronisasi PostgreSQL & Google Sheets

### 5.1. Aliran Data (Flow)
Sistem menggunakan pola **Local-First with Cloud Archive**:
1. **Write**: Aplikasi menulis data langsung ke PostgreSQL (menggunakan Bun + Drizzle ORM).
2. **Mirror**: Admin dapat memicu sinkronisasi massal melalui menu **Pengaturan Sistem**.
3. **Overwrite**: Proses sinkronisasi akan menghapus data lama di Google Sheets dan menulis ulang data terbaru dari Postgres untuk memastikan integritas data mirror.

### 5.2. Manajemen Template Lokal
Konfigurasi template tidak lagi menggunakan ID Google Docs dari database.
- **Lokasi**: `backend/template/`
- **Metode**: Sistem membaca file `.docx` langsung dari server.
- **Update**: Pengguna dapat mengupdate template melalui menu **Sistem Template** di dashboard admin, yang akan mengunggah file baru ke folder lokal server.
