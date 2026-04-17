# Panduan Deployment Massive VPS (Zero-Error) 🚀

Dokumen ini berisi panduan *deployment* *E-Office Dit. PL* ke server VPS Ubuntu secara berurutan dan dioptimalkan untuk VPS berspesifikasi rendah (RAM 2GB).

## Repositori & Domain
*   **Repo GitHub**: `https://github.com/ditoaryap-work/web-adminstrasi-ditpl`
*   **Domain 1**: `wministrasi.ditpl.web.id`
*   **Domain 2**: `administrasi.ditpl.web.id`

---

## 1. Persiapan Environment Server
*Note: Karena baru saja restart VPS, pastikan jalankan perintah ini pelan-pelan menunggu satu proses selesai sebelum melanjutkan.*

```bash
# Update sistem dan lindungi RAM dengan 2GB Virtual Memory (Swap)
sudo apt update && sudo apt upgrade -y
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Pastikan swap tidak terduplikasi di fstab (Jalankan ini hanya SEKALI)
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Install software pondasi: Nginx, Git, Node.js v20
sudo apt install -y nginx git curl
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Bun dan Process Manager (PM2)
curl -fsSL https://bun.sh/install | bash
export PATH="$HOME/.bun/bin:$PATH"
source ~/.bashrc
sudo npm install -g pm2
```

## 2. Setup Kloning Source Code
```bash
cd ~
git clone https://github.com/ditoaryap-work/web-adminstrasi-ditpl.git eoffice-ditpl
cd ~/eoffice-ditpl
```

## 3. Setup Backend (Bun) & PM2 Daemon
```bash
cd ~/eoffice-ditpl/backend
bun install

# Buat file konfigurasi `.env` Production
cat << 'EOF' > .env
PORT=3000
NODE_ENV=production
# URL Database sesuaikan jika Anda pakai local postgre atau remote
DATABASE_URL=postgresql://ditoaryap:GANTI_PASSWORD@127.0.0.1:5432/eoffice
JWT_SECRET=super-secret-key-kemen-pl
FRONTEND_URL=http://administrasi.ditpl.web.id

# Google Drive OAuth2
GOOGLE_CLIENT_ID=GANTI_DENGAN_DATA_ANDA
GOOGLE_CLIENT_SECRET=GANTI_DENGAN_DATA_ANDA
GOOGLE_REFRESH_TOKEN=GANTI_DENGAN_DATA_ANDA
DRIVE_FOLDER_ID=1nnC83WOJAeYdU7FsmnGCOCiY0wnlutpH
SPREADSHEET_ID=1-ymmybpidvx2b4KGoWVXtOJvEdPiSI4vCG0TRCQaLCw
EOF

# Jalankan migrasi database
bunx drizzle-kit push

# Jalankan Backend menjadi daemon PM2
pm2 start src/index.ts --interpreter ~/.bun/bin/bun --name "backend-eoffice"
pm2 save
pm2 startup
# (Penting: Jalankan perintah sudo env PATH... yang dimuntahkan oleh pm2 startup di layar Anda)
```

## 4. Setup Frontend (Vue)
Tahap ini paling krusial. Pastikan VPS Anda tidak sedang memproses tugas berat lain.

```bash
cd ~/eoffice-ditpl/frontend
npm install

# Beritahu Vue alamat API tujuan 
cat << 'EOF' > .env
VITE_API_URL=/api
EOF

# Build aset UI ke produksi
npm run build

# Salin direktori dist Vue ke direktori root Nginx
sudo rm -rf /var/www/eoffice-ditpl
sudo mkdir -p /var/www/eoffice-ditpl
sudo cp -r dist/* /var/www/eoffice-ditpl/
sudo chown -R www-data:www-data /var/www/eoffice-ditpl
```

## 5. Konfigurasi Nginx Canggih
Kita atur Nginx agar bisa mendengarkan *kedua domain* Anda sekaligus, sembari menjaga rute statis (Vue) dan API (Bun) secara paralel.

```bash
# Hapus default page Nginx
sudo rm /etc/nginx/sites-enabled/default

# Buat block server untuk dua domain
cat << 'EOF' | sudo tee /etc/nginx/sites-available/eoffice-ditpl
server {
    listen 80;
    server_name api.administrasi.ditpl.web.id api.ditpl.web.id;

    # Alihkan seluruh trafik /api/ ke Backend Bun (Port 3000)
    location /api/ {
        # 1. Tangani Preflight CORS (OPTIONS) secara instan di Nginx
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '$http_origin' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE' always;
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }

        # 2. Teruskan ke Bun (Tanpa trailing slash di 3000 agar path utuh terkirim)
        proxy_pass http://127.0.0.1:3000;
        
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Hindari timeout saat render file PDF berukuran besar
        proxy_read_timeout 180s;
        proxy_connect_timeout 180s;
        proxy_send_timeout 180s;

        # Izinkan upload template berukuran besar (max 10MB)
        client_max_body_size 10M;
    }
}
EOF

# Aktifkan setir rute & Restart!
sudo ln -sf /etc/nginx/sites-available/eoffice-ditpl /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 6. Pembersihan Akhir (Sangat Penting)
Setelah instalasi selesai, pastikan Anda melakukan **Purge Cache** di Cloudflare Dashboard dan **Hard Reload** di browser (Cmd+Shift+R) agar script frontend yang lama tidak mengganggu koneksi baru.

sudo nginx -t
sudo systemctl restart nginx
```

Selesai. Tunggu apa lagi, kini akses **`administrasi.ditpl.web.id`** menggunakan browser Anda.

_Tips: Error `dpkg lock` yang tadinya Anda dapatkan biasanya terjadi karena sistem Ubuntu baru booting dan apt sedang menjalankan 'daily periodic update' di background, diamkan saja 1-2 menit setelah SSH reboot, dan lock nya akan hilang dengan sendirinya._
