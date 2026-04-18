# Panduan Deployment Massive VPS (Zero-Error) 🚀

Dokumen ini berisi panduan *deployment* *E-Office Dit. PL* ke server VPS Ubuntu secara berurutan dan dioptimalkan untuk VPS berspesifikasi rendah (RAM 2GB).

## Repositori & Domain
*   **Repo GitHub**: `https://github.com/ditoaryap-work/web-adminstrasi-ditpl`
*   **Domain Utama**: `administrasi.ditpl.web.id`

---

## 1. Persiapan Environment Server

```bash
# Update sistem dan lindungi RAM dengan 2GB Virtual Memory (Swap)
sudo apt update && sudo apt upgrade -y
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

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
# URL Database PostgreSQL
DATABASE_URL=postgresql://user:password@127.0.0.1:5432/eoffice
JWT_SECRET=super-secret-key-kemen-pl
FRONTEND_URL=https://administrasi.ditpl.web.id

# Google Drive OAuth2
GOOGLE_CLIENT_ID=GANTI_DENGAN_DATA_ANDA
GOOGLE_CLIENT_SECRET=GANTI_DENGAN_DATA_ANDA
GOOGLE_REFRESH_TOKEN=GANTI_DENGAN_DATA_ANDA
DRIVE_FOLDER_ID=GANTI_FOLDER_ID_ROOT
SPREADSHEET_ID=GANTI_SS_ID_BACKUP
EOF

# Jalankan migrasi database
bun run db:push

# Jalankan Backend menjadi daemon PM2
pm2 start src/index.ts --interpreter ~/.bun/bin/bun --name "backend-eoffice"
pm2 save
pm2 startup

# PENTING: Pastikan folder template sudah ada
mkdir -p ~/eoffice-ditpl/backend/template
# (Opsional) Jika template belum ada, Anda harus mengunggah file .docx ke folder ini
# atau mengunggahnya melalui Dashboard Admin -> Sistem Template.
```

## 4. Setup Frontend (Vue)

```bash
cd ~/eoffice-ditpl/frontend
npm install

# Jalankan pemeriksaan tipe statis secara ketat (Zero-Error Type Checking)
npx vue-tsc --noEmit

# Build aset UI ke produksi jika pemeriksaan tipe berhasil
npm run build

# Salin direktori dist Vue ke direktori root Nginx
sudo mkdir -p /var/www/eoffice-ditpl
sudo cp -r dist/* /var/www/eoffice-ditpl/
sudo chown -R www-data:www-data /var/www/eoffice-ditpl
```

## 5. Konfigurasi Nginx
Update Nginx agar mengarahkan trafik web (`/`) ke file statis Vue dan trafik API (`/api/`) ke Backend Bun.

```bash
cat << 'EOF' | sudo tee /etc/nginx/sites-available/eoffice-ditpl
server {
    listen 80;
    server_name administrasi.ditpl.web.id;

    root /var/www/eoffice-ditpl;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/eoffice-ditpl /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 6. Penyelesaian & Keamanan
- Pastikan Port 80/443 dibuka di Firewall VPS.
- Gunakan Certbot untuk SSL Gratis: `sudo apt install certbot python3-certbot-nginx && sudo certbot --nginx`.

---

## 🛠️ Tips Maintenance

- **Log Backend**: `pm2 logs backend-eoffice`
- **Rebuild Frontend**: Jalankan `npm run build` dan copy ulang folder `dist` ke `/var/www/eoffice-ditpl`.
- **Database Studio**: `bun run db:studio` (gunakan tunnel SSH jika port tidak dibuka publik).
- **Update Template**: Selalu pastikan file `.docx` di `backend/template` memiliki nama yang tepat:
    - `1_Template_SPT_v1.docx`
    - `2_Template_SPT_v2.docx`
    - `3_Template_SPJ.docx`
    - `4_Template_SPTJM.docx`
