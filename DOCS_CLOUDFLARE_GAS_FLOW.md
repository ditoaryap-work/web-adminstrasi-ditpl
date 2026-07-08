# Arsitektur & Alur Sistem: Cloudflare + Google Apps Script (GAS)

Dokumen ini menjelaskan alur kerja (*flow*) arsitektur aplikasi yang menggunakan **Cloudflare Pages** sebagai *hosting* Frontend dan **Google Apps Script (GAS)** sebagai *serverless backend*. Dokumen ini disusun khusus agar Tim IT dapat dengan mudah memahami bagaimana komponen-komponen ini saling berkomunikasi.

---

## 1. Topologi Arsitektur

Secara garis besar, alur komunikasi data berjalan melalui 3 lapisan utama:

```text
[ 1. Client / Browser ]
          │
          ▼
[ 2. Cloudflare Pages ] 
  (Frontend Vue 3)
          │
  (Cloudflare Functions) ---> Proxy `/api/gas`
          │
          ▼
[ 3. Google Apps Script (GAS) ]
  (Serverless Backend)
          │
          ▼
[ 4. Database & Storage ]
  (Google Sheets & Google Drive)
```

---

## 2. Rincian Komponen & Alur Kerja

### A. Lapisan Frontend (Cloudflare Pages)
- **Lokasi Folder:** `frontend/`
- Frontend dibangun menggunakan **Vue 3** + **Vite**. 
- Ketika di-_deploy_ ke Cloudflare Pages, semua file Vue di-_build_ menjadi file statis (HTML, CSS, JS).
- **Tantangan:** Frontend tidak bisa melakukan `fetch` langsung ke endpoint GAS (URL `script.google.com`) karena adanya aturan **CORS** (Cross-Origin Resource Sharing) dari browser yang sangat ketat pada endpoint Google.

### B. Lapisan Proxy (Cloudflare Pages Functions)
- **Lokasi File:** `frontend/functions/api/gas.ts`
- **Tujuan:** Untuk mengatasi masalah CORS di atas, kita memanfaatkan fitur *Cloudflare Functions*.
- **Cara Kerja:** 
  1. Frontend Vue tidak me-request langsung ke GAS, melainkan me-request ke path API internal miliknya sendiri (contoh: `/api/gas`).
  2. Cloudflare Function (`gas.ts`) menangkap request tersebut.
  3. Cloudflare Function di _server-side_ akan meneruskan (*forward/proxy*) request tersebut ke URL GAS asli (`https://script.google.com/macros/s/.../exec`).
  4. Karena request ke GAS dilakukan oleh server Cloudflare (bukan browser pengguna), maka isu CORS berhasil dihindari.
  5. Cloudflare menerima balasan dari GAS, lalu mengembalikannya ke Frontend dengan tambahan _header_ CORS yang aman.

### C. Lapisan Backend (Google Apps Script / GAS)
- **Lokasi Folder:** `backend-gas/`
- **Tujuan:** Bertindak sebagai backend yang mengeksekusi logika bisnis dan operasi database (CRUD).
- **Struktur File:** 
  - `Code.gs`: Entry point utama (`doPost`) yang menerima payload dari Cloudflare.
  - File lainnya (`Spt.gs`, `Spj.gs`, `Surat.gs`, dll) memproses request spesifik sesuai jenis data.
- **Cara Kerja:** GAS menerima request (berupa `text/plain` dari Cloudflare agar aman), mem-parsing JSON tersebut, lalu melakukan operasi baca/tulis ke **Google Sheets** (sebagai database) atau **Google Drive** (sebagai penyimpan file).

---

## 3. Catatan Penting untuk Tim IT (Masa Transisi / Hybrid)

Saat ini, proyek berada dalam tahap **Hybrid** atau **Transisi**:

1. Anda akan melihat adanya folder `backend/` yang menggunakan **Bun + Hono + PostgreSQL**. Ini adalah infrastruktur backend baru yang jauh lebih cepat dibandingkan GAS.
2. Di `frontend/src/config/api.ts`, terdapat fungsi `fetchApi` yang mem-parsing request lama (`legacy-handler`) dan meneruskannya ke backend Bun (jika `VITE_API_URL` menunjuk ke server Bun).
3. **Kesimpulan:** Jika ingin mempertahankan murni arsitektur **GAS**, maka tim IT harus fokus pada `frontend/functions/api/gas.ts` dan folder `backend-gas/`. Namun, jika mengikuti pembaruan terbaru, aplikasi secara bertahap sudah dipindahkan (di-_migrate_) menggunakan backend **Bun (Hono)** dan **PostgreSQL** yang berjalan di atas VPS (lihat file `DOCS_ARCHITECTURE.md` dan `VPS_DEPLOYMENT.md` untuk detail VPS).

---

*Dokumen ini dibuat untuk memperjelas alur data khusus pada ekosistem Cloudflare + GAS bagi Tim IT.*
