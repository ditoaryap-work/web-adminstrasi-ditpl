# Panduan Penggunaan AI Agent Skills (Antigravity) 🚀

Dokumen ini berisi daftar *skills* dari ekomistem katalog [antigravity-awesome-skills](https://github.com/sickn33/antigravity-awesome-skills) dan *built-in agent skills* yang telah melewati *deep check* agar cocok dan sangat efektif (*powerful*) digunakan di environment **Gemini** maupun **Claude**. 

Daftar di bawah dikurasi khusus untuk kompatibilitas maksimal dengan arsitektur proyek Sistem Administrasi Anda yang menggunakan:
- **Backend API**: Google Apps Script (GAS) menggunakan *JavaScript/TypeScript*
- **Database**: Google Spreadsheet
- **Frontend**: Vue.js + TypeScript (Vite)
- **Deployment**: Cloudflare

Anda dapat meminta Agen untuk *"mengaktifkan / menggunakan skill X"* di dalam *prompt* Anda untuk mendapatkan standar solusi tingkat *Senior Engineer*.

---

## 🔐 1. Security & Keamanan Data
Mengingat data pada aplikasi administrasi bersifat sensitif, keamanan adalah hal utama.
| Nama Skill | Deskripsi & Manfaat di Proyek Ini |
| :--- | :--- |
| `frontend-mobile-security-xss-scan` | Menganalisis *Cross-Site Scripting* (XSS) pada Frontend Vue. Sangat penting karena kita mengambil teks / data mentah pengguna dari Google Sheets (mencegah *script injection* saat data dirender). |
| `security-auditor` | Audit keamanan komprehensif pada lapisan pertukaran data (API payload) dari sisi Vue maupun keamanan otentikasi di Apps Script. |
| `differential-review` | Digunakan untuk melakukan *code review* pada sisi keamanan secara otomatis sesaat sebelum kita menyimpan atau melakukan modifikasi kode yang krusial. |

---

## ⚡ 2. Optimalisasi & Speed (Performance)
Untuk memastikan antarmuka *dashboard* dan pemuatan data berjumlah besar tetap ringan.
| Nama Skill | Deskripsi & Manfaat di Proyek Ini |
| :--- | :--- |
| `performance-engineer` | Membantu menemukan *bottleneck* (kemacetan) render di dalam aplikasi dan memberikan teknik observabilitas modern pada frontend maupun sisi fetching di GAS. |
| `web-performance-optimization` | Fokus mengurutkan dan menekan beban ukuran kode sebelum di-deploy ke Cloudflare agar load website instan. |
| `database-optimizer` | Melakukan audit fungsi iterasi / pencarian lambat (seperti `find` atau penulisan matriks 2D berulang) pada Google Apps Script (`.gs`) menjadi operasi *batching* yang jauh lebih cepat. |

---

## 🔌 3. API & Komunikasi Sistem
Tata kelola manajemen rute / *endpoints* (`doPost`, `doGet`) dari Google Apps Script.
| Nama Skill | Deskripsi & Manfaat di Proyek Ini |
| :--- | :--- |
| `api-design-principles` | Menjaga prinsip RESTful untuk Apps Script Anda, memilih format *response*, teknik parameterisasi, dan manajemen kode error yang konsisten di seluruh modul (`Auth.gs`, `Admin.gs`, dll). |
| `api-patterns` | Mendesain lapisan komunikasi dan *error handling* jika *rate limit* Google Apps Script tercapai (seperti pola *retry* di klien Axios). |
| `api-documenter` | Digunakan sewaktu-waktu jika Anda butuh *markdown* panduan API beserta rutenya (*endpoint signature*), memudahkan pemahaman tim. |

---

## 🗄️ 4. Database (Google Spreadsheet)
Karena proyek ini mengandalkan Spreadsheet, logika *database* harus direncanakan dengan cerdik meniru RDBMS (*Relational Database*).
| Nama Skill | Deskripsi & Manfaat di Proyek Ini |
| :--- | :--- |
| `googlesheets-automation` | Pemahaman mendalam terkait manipulasi Sheets via struktur Script V8 (operasi memformat antarmuka sel, manipulasi baris/kolom, hingga ekstraksi data tab). |
| `database-architect` | Mendesain bagaimana skema hubungan data antar-*Sheet* (misal: ID surat pada tabel Arsip harus terkunci pada tab Pegawai) berjalan baik meski tidak ada fasilitas SQL constraint di Spreadsheets. |
| `database-design` | Menentukan prioritas tipe kolom dan strategi *indexing* virtual untuk mempercepat *query* data pada Sheet. |

---

## 🏗️ 5. Arsitektur, Struktur Kode & Resource
Menjaga kode proyek dari keruwetan seiring skop fitur yang terus bertambah besar.
| Nama Skill | Deskripsi & Manfaat di Proyek Ini |
| :--- | :--- |
| `architecture-patterns` | Mengevaluasi dan memisahkan tugas klien UI (Vue), logika validasi (TS/Vue), dan operasi *database* pada layer (GAS) agar mengikuti standar *Clean Architecture*. |
| `moyu` | **Guardrail (Pembatas Anti Over-engineering)**. Aktifkan otomatis agar Gemini/Claude tidak membuat penulisan *code* yang terlalu kompleks atau mengubah file yang tidak Anda perintahkan saat merancang struktur. |
| `c4-architecture-c4-architecture` | Dokumentasi desain arsitektur visual untuk struktur *resource* Cloudflare -> Vue -> Google Apps Script -> Spreadsheet. |
| `systematic-debugging` | Pola pemecahan masalah (bug / layar putih). AI diwajibkan menyusun diagnosa terstruktur dan berhati-hati sebelum menulis dan merombak kode. |

---

## 💻 6. Coding (Vue, TypeScript, JavaScript, GAS)
Meningkatkan level penulisan kode sumber *(source code)* sehingga mudah dibaca dan dikelola.
| Nama Skill | Deskripsi & Manfaat di Proyek Ini |
| :--- | :--- |
| `frontend-dev-guidelines` | Standar kualitas tinggi dari instruktur senior frontend untuk struktur Vue, sistem *reactivity*, komponen, dsb. |
| `typescript-pro` | Memberikan *type-safety* ketat pada antarmuka komunikasi (di mana format data yang dikembalikan oleh GAS harus sejalan dengan definisi Tipe Vue). |
| `javascript-pro` | Peningkatan sintaks penulisan di *backend* Google Apps Script (`.gs`) dengan manipulasi Array, *destructuring*, memori efisien. |
| `frontend-ui-dark-ts` | Arahan desain visual estetika/premium dengan dukungan tema UI modern/kegelapan menggunakan kombinasi Typescript & CSS Tailwind (Sangat cocok untuk merombak UI Administrasi PL). |
| `ui-pattern` | Membuat komponen rakitan modern seperti *modal popup*, *tables*, validasi input form menggunakan praktik desain berkelas layaknya SaaS profesional. |
| `clean-code` & `uncle-bob-craft` | Filosofi penulisan kode agar bisa dibaca oleh manusia atau engineer lain di kemudian hari (*naming convention* variabel, pemisahan modular fungsi surat/spj, dan format yang rapi). |

---

## 🧪 7. Automated Testing & Quality Assurance
Skill untuk memastikan komponen stabil sebelum dilepas ke *Production*.
| Nama Skill | Deskripsi & Manfaat di Proyek Ini |
| :--- | :--- |
| `webapp-testing` / `e2e-testing-patterns` | Memandu cara melakukan *unit testing* simulasi *test* alur penggunaan fitur pada UI Vue. |
| `code-reviewer` | Expert AI yang mengaudit struktur dan logika proyek, sangat tepat digunakan apabila Anda telah menulis *module* baru dan ingin dicarikan titik rawan kesalahannya sebelum di-Deploy. |

---

## 💡 Contoh Prompt / Cara Penggunaan (Skenario Dunia Nyata)

Untuk mendapatkan hasil maksimal layaknya bekerja dengan *Senior Engineer*, Anda wajib menyebutkan / "memanggil" skill di atas di dalam instruksi (*prompt*) Anda. Berikut adalah pola pemanggilan efektif untuk berbagai skenario yang sering dihadapi dalam proyek:

### 1. Skenario Memperbaiki *Bug* (Misal: *Blank Screen* / Layar Putih)
Jika aplikasi mendadak *error*, layar menjadi kosong, atau render gagal saat (*fetching*) data:
> *"Terdapat bug saat saya membuka tabel SPJ, layarnya *blank*. Gunakan skill **systematic-debugging** untuk menganalisa akar permasalahannya dengan runut sebelum kamu asal merombak kode. Sertakan analisa **performance-engineer** jika data yang dimuat dari Sheets ternyata membebani render API."*

### 2. Skenario Merancang & Membuat Fitur Baru
Jika Anda ingin membuat modul atau fitur halaman baru (contoh: Laporan Keuangan):
> *"Saya ingin membuat panel fitur Laporan Keuangan baru di UI yang terhubung datanya ke Google Sheets. Panggil **architecture-patterns** agar arsitektur kodenya bersih terpisah dari modul lain. Buat tampilan UI-nya terlihat mahal menggunakan instruksi dari **frontend-ui-dark-ts** dan gunakan standarisasi elemen dari **ui-pattern**. Kerjakan sistematis ya."*

### 3. Skenario Mengoptimalkan Kode Super Lambat (*Refactoring*)
Jika proses eksekusi kode backend GAS lama, atau aplikasi Vue teramat lambat:
> *"Fungsi filter pencarian surat di file `Surat.gs` berjalan di atas 5 detik. Tolong bedah ulang (refactor) agar lebih cepat menggunakan **database-optimizer** dengan operasi basis *batching*. Terapkan juga **javascript-pro** untuk mempersingkat sintaks. Hidupkan opsi **moyu** agar tidak ada framework / tools tidak perlu yang sengaja kamu injeksikan."*

### 4. Skenario Keamanan (*Security Maintenance*)
Memastikan file yang mengambil teks input (misal form / deskripsi) aman dari serangan injeksi kode:
> *"Aktifkan **frontend-mobile-security-xss-scan**. Tolong tinjau keamanan binding data pada komponen daftar `Sptjm.vue`. Datanya kan kita ambil langsung dari file mentah Sheets, saya ingin kamu menambahkan *sanitize* (pembersih input) agar tidak bisa diinjeksi skrip perusak."*

### 5. Skenario Review Pekerjaan (*Pre-Commit / QA*)
Jika Anda telah mengedit kode cukup banyak dan ragu sebelum menyimpan (*deploy*):
> *"Saya barusan mengubah metode autentikasi pengguna dan manipulasi *state* Vue. Silakan bedah perubahan saya menggunakan mode **differential-review** dan **code-reviewer**. Tunjukkan kepada saya jika ada cara penulisan variabel yang berantakan dengan standar **clean-code**."*

---

> **Tips Rahasia:** Anda tidak perlu terpaku menggunakan format tebal (bold). Melalui *prompt natural* layaknya berbicara pada asisten: *"Gunakan moyu, ui-pattern, dan architecture-patterns dalam memperbaiki ini,"* – Agen akan langsung menerapkan memori instruksional dari ketiga komponen tersebut secara serentak!
