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
- `D` - **tim_poksi**: Relasi eksklusif data ke Tim mana user berada.
- `E` - **profile_image_url**: Link gambar profil.
- `F` - **last_login**: Timestamp login.
- `G` - **role**: Flag untuk menandai 'Admin' vs 'Super Admin'.

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
