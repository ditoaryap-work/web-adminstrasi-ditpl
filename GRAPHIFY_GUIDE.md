# 🔍 Panduan Penggunaan Graphify

Dokumen ini berisi panduan untuk mengelola *Knowledge Graph* proyek menggunakan [Graphify](https://github.com/safishamsi/graphify). Tool ini membantu AI memahami arsitektur kode secara mendalam (AST + Semantic).

---

## 🚀 Cara Menjalankan (Trigger Re-index)

Gunakan perintah ini jika Anda telah menambahkan banyak fitur baru, mengubah struktur database, atau menambah file dokumentasi baru.

### 1. Melalui Chat AI (Rekomendasi)
Cukup ketik perintah ini di chat:
```bash
/graphify .
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

## 💡 Manfaat di Proyek Ini

Dalam proyek **Web Administrasi Dit. PL**, Graphify membantu menghubungkan:
1. **Frontend (Vue)**: Melihat ketergantungan komponen UI ke API.
2. **Backend (Bun/Hono)**: Memahami alur dari Route ke Service.
3. **Database (Sheets)**: Melacak kolom mana di Spreadsheet yang digunakan oleh fungsi mana di Backend.

---

## ❓ Contoh Pertanyaan yang Bisa Anda Ajukan ke AI

Setelah graf terupdate, Anda bisa bertanya hal-hal cerdas seperti:

- *"Jelaskan hubungan antara `PegawaiManager.vue` dengan `sheets.service.ts`."*
- *"Jika saya menghapus kolom `tim_poksi` di Google Sheets, fungsi apa saja yang akan error?"*
- *"Di mana letak logika penomoran surat otomatis?"*
- *"Tunjukkan semua fungsi yang menggunakan library `pdf.service.ts`."*

---

## ⚠️ Troubleshooting

- **Error Expat/Python 3.14**: Gunakan Python 3.11 yang sudah dikonfigurasi di `~/.gemini/antigravity/mcp_config.json`.
- **Graf Tidak Update**: Pastikan Anda menjalankan `/graphify .` (dengan titik) untuk merujuk ke direktori saat ini.
- **Node Tidak Ditemukan**: Jika file baru belum muncul di graf, jalankan kembali perintah `/graphify .`.

---
*Dibuat oleh Antigravity untuk Administrasi Dit. PL.*
