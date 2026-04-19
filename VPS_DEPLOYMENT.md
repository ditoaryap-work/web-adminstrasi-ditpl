# Panduan Deployment E-Office Dit. PL 🚀

Arsitektur deployment menggunakan **split hosting**:
- **Frontend**: Cloudflare Pages (auto-deploy dari GitHub)
- **Backend**: VPS Ubuntu + Bun + PM2 + Nginx reverse proxy

## Repositori & Domain
*   **Repo GitHub**: `https://github.com/ditoaryap-work/web-adminstrasi-ditpl`
*   **Domain Frontend**: `administrasi.ditpl.web.id` (Cloudflare Pages)
*   **Domain API**: `api.ditpl.web.id` (VPS)

---

## 1. Frontend — Cloudflare Pages

Frontend di-deploy otomatis oleh Cloudflare Pages setiap kali ada push ke branch `main`.

### Konfigurasi di Cloudflare Dashboard
| Setting | Value |
|---|---|
| Framework preset | Vue |
| Build command | `npm run build` |
| Build output directory | `frontend/dist` |
| Root directory | `frontend` |
| Node.js version | `20` |

### Environment Variables (Cloudflare Pages)
```
VITE_API_URL=https://api.ditpl.web.id
```

### SPA Redirect Rule
Buat file `frontend/public/_redirects`:
```
/*    /index.html   200
```
Ini memastikan Vue Router berfungsi dengan benar pada semua path.

---

## 2. Backend — VPS Ubuntu

### 2.1 Persiapan Environment Server

```bash
# Update sistem dan lindungi RAM dengan 2GB Virtual Memory (Swap)
sudo apt update && sudo apt upgrade -y
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Install software pondasi: Nginx, Git, Node.js v20, Ghostscript, LibreOffice
sudo apt install -y nginx git curl ghostscript libreoffice-writer
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Bun dan Process Manager (PM2)
curl -fsSL https://bun.sh/install | bash
export PATH="$HOME/.bun/bin:$PATH"
source ~/.bashrc
sudo npm install -g pm2
```

### 2.2 Setup Kloning Source Code
```bash
cd ~
git clone https://github.com/ditoaryap-work/web-adminstrasi-ditpl.git eoffice-ditpl
cd ~/eoffice-ditpl
```

### 2.3 Setup Backend (Bun) & PM2 Daemon
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

# Sinkronisasi skema database (Drizzle Push)
bun run db:push

# Jalankan Backend menjadi daemon PM2
pm2 start src/index.ts --interpreter ~/.bun/bin/bun --name "backend-eoffice"
pm2 save
pm2 startup

# PENTING: Pastikan folder template sudah ada
mkdir -p ~/eoffice-ditpl/backend/template
```

### 2.4 Konfigurasi Nginx (Reverse Proxy API Saja)
Nginx hanya berfungsi sebagai reverse proxy untuk API backend. Frontend tidak di-serve dari sini.

```bash
cat << 'EOF' | sudo tee /etc/nginx/sites-available/eoffice-ditpl
server {
    listen 80;
    server_name api.ditpl.web.id;

    location / {
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

### 2.5 Penyelesaian & Keamanan
- Pastikan Port 80/443 dibuka di Firewall VPS.
- Gunakan Certbot untuk SSL Gratis: `sudo apt install certbot python3-certbot-nginx && sudo certbot --nginx`.

---

## 3. Update / Redeploy

### Frontend (Otomatis)
Push ke branch `main` → Cloudflare Pages auto-build & deploy.

### Backend (Manual di VPS)
```bash
cd ~/eoffice-ditpl
git pull origin main
cd backend
bun install

# Sinkronisasi perubahan skema database ke VPS
bun run db:push

pm2 restart backend-eoffice
```

> **PENTING**: `bun run db:push` memastikan skema database di VPS selalu sama dengan skema lokal. Jalankan ini setiap kali ada perubahan pada `schema.ts`.

---

## 🛠️ Tips Maintenance

- **Log Backend**: `pm2 logs backend-eoffice`
- **Database Studio**: `bun run db:studio` (gunakan tunnel SSH jika port tidak dibuka publik).
- **Restart jika crash**: PM2 otomatis restart. Cek status: `pm2 status`.
- **Update Template**: Selalu pastikan file `.docx` di `backend/template` memiliki nama yang tepat sesuai konfigurasi di Dashboard Admin → Sistem Template.
