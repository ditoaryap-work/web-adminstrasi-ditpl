# Arsitektur & Database Master [APP] E-Office Dit. PL

Dokumen ini adalah cetak biru mutlak keseluruhan infrastruktur Google Drive dan Google Sheets yang menggerakan web E-Office Dit. PL. Digunakan sebagai peta untuk pengembangan fitur selanjutnya.

## 1. Peta Hierarki Google Drive

Sistem penyimpanan membagi arsip berdasarkan *Tim Poksi*. Setiap Tim memegang kontrol dan privasi atas dokumennya.

```text
📁 [APP] E-Office Dit. PL
 ├── 📁 1_Database
 │    └── 📊 Database E-Office (Spreadsheet Induk dengan 7 Tab)
 │
 ├── 📁 2_Template_Sistem
 │    ├── 📄 1_Template_SPT_v1
 │    ├── 📄 2_Template_SPT_v2
 │    ├── 📄 3_Template_SPJ / Kuitansi
 │    └── 📄 4_Template_SPTJM
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

Semua pergerakan basis data ditangani terpusat melalui file `Database E-Office`. File ini berisikan setidaknya 7 Tab:

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
- `D` - **template_id_spt_v1**
- `E` - **template_id_spt_v2**
- `F` - **template_id_sptjm**
- `G` - **folder_id_surat_masuk** (Modul E-Arsip)
- `H` - **folder_id_surat_keluar** (Modul E-Arsip)
- `I` - **folder_id_notulensi**    (Modul E-Arsip)
- `J` - **folder_id_spj**          (Modul SPJ)
- `K` - **template_id_spj**        (Modul SPJ)

### TAB 3: `SBM` (Kamus Standar Biaya Masukan)
- Tabel masif ini menyimpan referensi akuntansi uang harian, tiket, pajak bandara, dll. Sistem membaca kota `Kec_Kab` dan parameter `Pesawat` maupun Golongan Eselon.

### TAB 4: `MASTER_PEGAWAI` (Data Fungsional Pejabat)
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
- `J` - biaya_sbm
- `K` - total_biaya
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
Untuk mendukung akses lintas unit bagi Super Admin, sistem menggunakan logika khusus pada Backend (GAS):
1. **Keyword 'SEMUA'**: Saat Super Admin mengakses data, Frontend akan mengirimkan parameter `tim_poksi: 'SEMUA'`.
2. **Bypass Filter**: Di sisi GAS, jika parameter yang diterima adalah `'SEMUA'`, maka pencarian data di Spreadsheet akan mengabaikan filter kolom `tim_poksi` dan mengembalikan seluruh baris data.
3. **Persistensi Role**: Informasi role disimpan pada **Kolom G** di tab `DATA_ADMIN`. Sistem secara otomatis memastikan kolom ini tersedia saat melakukan pengambilan/penyimpanan data admin.

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

### 4.2. Standarisasi Hirarki Tombol Aksi
Seluruh modul manajer (SPT, SPJ, SPTJM, Arsip) mengikuti hirarki tombol aksi yang terpadu:
1. **Preview (Primary)**: Warna Biru (`bg-blue-600`), Ikon `Eye`. Membuka modal pratinjau internal.
2. **Download (Secondary)**: Warna Indigo (`bg-indigo-50`), Ikon `Download`. Memicu unduhan file langsung.
3. **Edit (Management)**: Warna Emerald (`bg-emerald-50`), Ikon `Edit`. Membuka form modifikasi data.
4. **Hapus (Destructive)**: Warna Rose (`bg-rose-50`), Ikon `Trash2`. Menghapus data dengan konfirmasi.

### 4.3. Pola Navigasi Sidebar (Re-mount)
File: `src/components/Layout.vue`

Untuk memastikan user dapat mereset tampilan halaman (misalnya keluar dari Form Mode kembali ke List Mode) hanya dengan mengklik menu yang sama di sidebar:
- **Timestamp Query**: Klik pada menu yang sedang aktif akan menambahkan parameter unik `_t=[timestamp]` ke URL.
- **Full-Path Key**: `router-view` menggunakan `:key="$route.fullPath"` sehingga setiap perubahan parameter (termasuk timestamp) akan memaksa komponen halaman untuk melakukan insialisasi ulang (re-mount).
