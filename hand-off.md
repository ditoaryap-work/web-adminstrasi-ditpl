# Hand-Off Context — E-Office Dit. PL

> Dokumen ini berisi ringkasan status terkini proyek untuk mempermudah handoff ke sesi AI baru.
> **Terakhir diperbarui:** 2026-04-19

---

## 1. Completed (Sesi Terakhir)

### Modul SPTJM — Stabilisasi & Audit
- **Google Drive Cleanup**: Implementasi `deleteFileFromDrive` di `drive.service.ts`. File lama di Drive otomatis dihapus saat EDIT (PATCH) dan DELETE SPTJM.
- **Dead Code Removal**: Menghapus fungsi mati `addRincianPesawat` & `removeRincianPesawat` di `SptjmForm.vue`.
- **Pagination Fix**: Memperbaiki logika pagination di `SptjmList.vue` agar menggunakan `localCurrentPage` setter (bukan mutasi prop langsung).

### Aksesibilitas & UI
- **Audit WCAG 2.1 AA/AAA**: Perbaikan kontras teks pada seluruh modul (Login, Dashboard, SPT, SPTJM, SPJ, Arsip, Pegawai, Admin, Settings).
- **Global CSS Overrides**: Override `!important` pada elemen global (`th`, `placeholder`, `.subtext`) di `index.css`.
- **Layout Stabilisasi**: Fix nesting `</div>` di `AdminManager.vue` dan `Login.vue`.

### Deployment & Infrastruktur
- **VPS Sync**: Push ke `main` → `git stash && git pull` di VPS → `bun run db:push` berhasil.
- **pgweb Database Browser**: Setup `pgweb` sebagai pengganti Drizzle Studio (v0.31+ tidak bisa di-reverse-proxy karena Cloud Relay).
  - Akses: `https://db.administrasi.ditpl.web.id` (dilindungi password Nginx).
  - PM2 process: `db-studio` (pgweb pada port 4983).
- **Dokumentasi**: VPS_DEPLOYMENT.md diperbarui dengan section pgweb dan tips git stash.

---

## 2. Arsitektur Deployment (Aktif)

| Layer | Teknologi | Domain |
|---|---|---|
| Frontend | Vue 3 + Vite → Cloudflare Pages | `administrasi.ditpl.web.id` |
| Backend | Bun + Hono → PM2 + Nginx (VPS) | `api.ditpl.web.id` |
| Database | PostgreSQL (VPS lokal) | — |
| DB Browser | pgweb → PM2 + Nginx (VPS) | `db.administrasi.ditpl.web.id` |
| Storage | Google Drive (OAuth2) | — |
| Mirror | Google Sheets (1-way sync) | — |

**VPS IP**: `43.163.117.57` (Ubuntu 22.04)

---

## 3. Decisions (Keputusan Arsitektur)

- **Template Lokal**: Sistem template menggunakan file `.docx` di `backend/template/`, bukan Google Docs ID.
- **Drive Cleanup**: Setiap operasi EDIT/DELETE pada SPTJM (dan nantinya SPT/SPJ) wajib membersihkan file lama di Google Drive.
- **Caching Pattern**: Semua modul menggunakan `useDataStore` → `invalidateCache('module_name')` setelah CRUD.
- **Date Formatting**: Menggunakan `formatDateDisplay()` dan `formatDateForDB()` dari `formatter.ts` secara konsisten.
- **Domain Hierarchy**: `ditpl.web.id` sebagai root → `administrasi.ditpl.web.id` untuk project ini → sub-subdomain untuk service tambahan.

---

## 4. Known Issues & Blockers

- **Template SPJ Missing**: File `3_Template_SPJ.docx` di `backend/template/` belum diunggah (fitur cetak SPJ belum berfungsi penuh).
- **IDE CSS Warnings**: Peringatan `@tailwind` di editor bersifat kosmetik, tidak mempengaruhi runtime.

---

## 5. PM2 Process di VPS

| ID | Name | Command | Port |
|---|---|---|---|
| 0 | `backend-eoffice` | `bun src/index.ts` | 3000 |
| 2 | `db-studio` | `pgweb --bind 127.0.0.1 --listen 4983` | 4983 |

---

## 6. Next Steps (Prioritas)

1. **Upload Template SPJ**: Unggah `3_Template_SPJ.docx` ke `backend/template/` agar fitur cetak SPJ berfungsi.
2. **Audit Modul SPT & SPJ**: Terapkan pola Drive Cleanup yang sama dari SPTJM ke modul SPT dan SPJ.
3. **E2E Validation**: Uji alur lengkap SPT → SPTJM → SPJ → arsip otomatis untuk memastikan tidak ada regresi.
4. **Modul Arsip Surat**: Review dan stabilisasi jika diperlukan.

---

## 7. File Penting (Quick Reference)

| File | Fungsi |
|---|---|
| `backend/src/db/schema.ts` | Definisi seluruh tabel PostgreSQL (Drizzle) |
| `backend/src/routes/sptjm.ts` | CRUD + Drive cleanup untuk SPTJM |
| `backend/src/services/drive.service.ts` | Upload, download, delete file Google Drive |
| `backend/src/utils/formatter.ts` | Format tanggal, angka, dll. |
| `frontend/src/stores/dataStore.ts` | Cache management (`useDataStore`) |
| `frontend/src/components/sptjm/SptjmForm.vue` | Form input SPTJM |
| `frontend/src/components/sptjm/SptjmList.vue` | Tabel list SPTJM dengan pagination |
| `VPS_DEPLOYMENT.md` | Panduan lengkap deploy & maintenance VPS |
| `DOCS_ARCHITECTURE.md` | Cetak biru arsitektur & database |
