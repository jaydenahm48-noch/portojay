# Noch Portfolio

Personal portfolio website — Next.js + Google Sheets + Google Drive + Admin Panel.

## Tech Stack

- **Framework**: Next.js 15 (Pages Router)
- **Language**: TypeScript
- **Styling**: CSS custom (public frontend) + Tailwind CSS (admin panel)
- **Data Store**: Google Sheets (via Google Sheets API)
- **File Storage**: Google Drive (via Google Drive API)
- **Auth**: JWT (jose) + bcrypt
- **Deploy**: Vercel

---

## Setup Lokal

### 1. Clone & Install

```bash
# Install dependencies
npm install
```

### 2. Setup Google Cloud Project

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau gunakan yang sudah ada
3. Aktifkan dua API:
   - **Google Sheets API**
   - **Google Drive API**
4. Buat **Service Account**:
   - IAM & Admin → Service Accounts → Create
   - Beri nama, klik Done
   - Buka service account → Keys → Add Key → JSON
   - Download file JSON (simpan aman, jangan commit ke git)

### 3. Setup Google Sheets

1. Buka [Google Sheets](https://sheets.google.com) → Buat spreadsheet baru
2. Beri nama: `noch-portfolio-db`
3. Ambil **Spreadsheet ID** dari URL:
   `https://docs.google.com/spreadsheets/d/**{SPREADSHEET_ID}**/edit`
4. Klik Share → tambahkan email service account sebagai **Editor**

### 4. Setup Google Drive

1. Buka [Google Drive](https://drive.google.com)
2. Buat folder baru bernama `noch-portfolio`
3. Klik kanan folder → Share → tambahkan email service account sebagai **Editor**
4. Ambil **Folder ID** dari URL saat folder dibuka:
   `https://drive.google.com/drive/folders/**{FOLDER_ID}**`

### 5. Buat File `.env.local`

Salin dari template:

```bash
cp .env.example .env.local
```

Isi semua nilai di `.env.local`:

```bash
# Dari file JSON service account yang didownload:
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-sa@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMII...\n-----END PRIVATE KEY-----\n"

# Spreadsheet ID dari step 3
GOOGLE_SPREADSHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms

# Folder ID dari step 4
GOOGLE_DRIVE_ROOT_FOLDER_ID=1A2B3C4D5E6F7G8H9I0J

# Generate dengan: node scripts/generate-password-hash.js
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2b$10$...

# Generate dengan: node scripts/generate-jwt-secret.js
JWT_SECRET=abc123...

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Penting:** `GOOGLE_PRIVATE_KEY` harus dalam satu baris dengan `\n` literal (bukan newline asli).
> Ambil nilai `private_key` dari file JSON dan ganti newline dengan `\n`.

### 6. Generate Credentials Admin

```bash
# Generate password hash
node scripts/generate-password-hash.js

# Generate JWT secret
node scripts/generate-jwt-secret.js
```

Salin output ke `.env.local`.

### 7. Inisialisasi Google Sheets & Drive

```bash
# Buat tab/sheet dan header row
node scripts/init-sheets.js

# Buat struktur folder Drive
node scripts/init-drive.js
```

### 8. Jalankan Development Server

```bash
npm run dev
```

Buka:
- **Website**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin/login

---

## Struktur URL

### Public

| URL | Keterangan |
|---|---|
| `/` | Halaman utama portfolio |
| `/#home` | Section Home |
| `/#about` | Section About |
| `/#service` | Section Services |
| `/#portfolio` | Section Portfolio |
| `/#contact` | Section Contact |

### Admin Panel

| URL | Keterangan |
|---|---|
| `/admin/login` | Halaman login |
| `/admin/dashboard` | Dashboard |
| `/admin/profile` | Edit profil & social links |
| `/admin/services` | Kelola services |
| `/admin/projects` | Kelola projects |
| `/admin/projects/new` | Tambah project baru |
| `/admin/projects/[id]/edit` | Edit project + gallery |
| `/admin/skills` | Kelola skills |
| `/admin/messages` | Inbox pesan |

### API

| Method | Endpoint | Auth | Keterangan |
|---|---|---|---|
| GET | `/api/portfolio` | - | List published projects |
| GET | `/api/portfolio/[slug]` | - | Detail project + gallery |
| GET | `/api/services` | - | List published services |
| GET | `/api/skills` | - | List published skills |
| GET | `/api/profile` | - | Data profil publik |
| POST | `/api/contact` | - | Kirim pesan |
| POST | `/api/admin/auth/login` | - | Login admin |
| POST | `/api/admin/auth/logout` | ✅ | Logout |
| GET/PUT | `/api/admin/profile` | ✅ | Baca/update profil |
| GET/POST | `/api/admin/services` | ✅ | List/tambah service |
| GET/PUT/DELETE | `/api/admin/services/[id]` | ✅ | Detail/edit/hapus service |
| GET/POST | `/api/admin/projects` | ✅ | List/tambah project |
| GET/PUT/DELETE | `/api/admin/projects/[id]` | ✅ | Detail/edit/hapus project |
| GET/POST/PUT/DELETE | `/api/admin/projects/[id]/images` | ✅ | Kelola gallery images |
| GET/POST | `/api/admin/skills` | ✅ | List/tambah skill |
| GET/PUT/DELETE | `/api/admin/skills/[id]` | ✅ | Detail/edit/hapus skill |
| GET | `/api/admin/messages` | ✅ | List pesan |
| GET/PUT/DELETE | `/api/admin/messages/[id]` | ✅ | Detail/update/hapus pesan |
| POST | `/api/admin/upload` | ✅ | Upload file ke Drive |

---

## Deploy ke Vercel

### 1. Push ke GitHub

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/username/noch-portfolio.git
git push -u origin main
```

### 2. Import ke Vercel

1. Buka [vercel.com](https://vercel.com) → New Project
2. Import dari GitHub repository
3. Framework: Next.js (auto-detected)
4. Tambahkan semua environment variables dari `.env.local`

> **Penting untuk `GOOGLE_PRIVATE_KEY` di Vercel:**
> Salin nilai termasuk `"..."` dan pastikan `\n` tetap sebagai `\n` (bukan newline asli).

5. Deploy!

### 3. Verifikasi

Setelah deploy, buka:
- `https://your-domain.vercel.app/` — public website
- `https://your-domain.vercel.app/admin/login` — admin panel

---

## Struktur Google Sheets

| Sheet | Kolom |
|---|---|
| Profile | key, value |
| Skills | id, name, category, level, icon, sort_order, published |
| Services | id, title, description, icon, image, sort_order, published |
| Projects | id, title, slug, description, technologies, thumbnail, github_url, demo_url, featured, published, sort_order, created_at, updated_at |
| Project_Images | id, project_id, image, caption, sort_order, created_at |
| Messages | id, name, email, subject, message, created_at, status |

---

## Struktur Google Drive

```
noch-portfolio/          ← root folder (GOOGLE_DRIVE_ROOT_FOLDER_ID)
├── profile/
│   ├── photo-{timestamp}.jpg
│   └── cv-{timestamp}.pdf
├── services/
│   └── {service-id}/
│       └── image-{timestamp}.jpg
└── projects/
    └── {project-slug}/
        ├── thumbnail-{timestamp}.jpg
        ├── detail-{timestamp}.jpg
        └── ...
```

---

## Security Notes

- Google credentials **tidak pernah** dikirim ke browser
- Semua operasi Google API dilakukan di server (API routes)
- Admin routes dilindungi JWT via Next.js middleware
- Password admin disimpan sebagai bcrypt hash
- File `.env.local` di-ignore oleh git
