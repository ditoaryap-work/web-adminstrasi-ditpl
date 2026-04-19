# 🔍 Panduan Penggunaan Graphify

Dokumen ini berisi panduan untuk mengelola *Knowledge Graph* proyek menggunakan [Graphify](https://github.com/safishamsi/graphify). Tool ini membantu AI memahami arsitektur kode secara mendalam (AST + Semantic).

---

## 🚀 Cara Menjalankan (Trigger Re-index)

Gunakan perintah ini jika Anda telah menambahkan banyak fitur baru, mengubah struktur database (Drizzle Schema), atau menambah file dokumentasi baru.

### 1. Melalui Chat AI (Rekomendasi)
Cukup ketik perintah ini di chat:
```bash
graphify .
```
AI akan otomatis mendeteksi file, mengekstrak fungsi/kelas, dan memperbarui peta arsitektur.

### 2. Melalui Terminal (Manual)
Jika Anda ingin menjalankan secara manual via zsh (dengan Python 3.11):
```bash
graphify update .
```
*Catatan: Pastikan `mcp_config.json` di komputer Anda sudah merujuk ke interpreter Python yang benar.*

---

## 📊 Hasil Pemetaan

Setiap kali dijalankan, Graphify akan memperbarui folder `graphify-out/`:

- 🌐 **[report.html](graphify-out/report.html)**: Buka file ini di browser untuk melihat ringkasan visual, kelompok kode (clusters), dan entitas pusat (God Nodes).
- 🧬 **[graph.json](graphify-out/graph.json)**: Data mentah graf yang digunakan oleh AI untuk melakukan navigasi lintas file.

---

## 🧬 Pemetaan AST (Drizzle & Hono)

Dalam proyek ini, Graphify dikonfigurasi secara khusus untuk memahami relasi modern:
1. **Schema Mapping**: Menghubungkan definisi tabel di `backend/src/db/schema.ts` (PostgreSQL via Drizzle) ke endpoint API di `backend/src/routes/`.
2. **Type Safety**: Melacak ketergantungan tipe data **camelCase** dari Backend menuju `frontend/src/types/api.ts`.
3. **UI Lineage**: Membantu AI mengetahui komponen Vue mana saja yang akan terpengaruh jika skema database diubah.
4. **Template Logic**: Memetakan relasi antara `backend/template/` dengan servis generator dokumen.

---

## 💡 Manfaat di Proyek Ini

1. **Frontend (Vue)**: Melihat ketergantungan komponen UI ke API.
2. **Backend (Bun/Hono)**: Memahami alur dari Route ke Service, serta integrasi **Drizzle ORM** dengan database **Postgres**.
3. **Database (Drizzle & Postgres)**: Melacak kolom mana di database yang digunakan oleh fungsi mana di Backend.
4. **Sistem Template**: Memahami bagaimana file lokal diunggah dan digunakan untuk generator dokumen.

---

## ❓ Contoh Pertanyaan yang Bisa Anda Ajukan ke AI

Setelah graf terupdate, Anda bisa bertanya hal-hal cerdas seperti:

- *"Jelaskan hubungan antara `PegawaiManager.vue` dengan backend schema."*
- *"Jika saya mengubah tipe data `totalBiaya` di Drizzle, file apa saja yang harus di-update?"*
- *"Tunjukkan semua fungsi yang memanggil `drive.service.ts`."*

---

## ⚠️ Troubleshooting

- **Error Expat/Python 3.14**: Gunakan Python 3.11 yang sudah dikonfigurasi di `~/.gemini/antigravity/mcp_config.json`.
- **Graf Tidak Update**: Pastikan Anda menjalankan `/graphify .` (dengan titik).

---
*Dibuat oleh Antigravity untuk Administrasi Dit. PL.*
