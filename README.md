# 📚 LMS Petrokimia — Platform Pembelajaran Digital

Platform pembelajaran digital untuk satu kursus, dilengkapi dengan:
- 📖 **PDF Flipbook** — Baca nota dalam format flipbook yang interaktif
- 🎬 **Video YouTube** — Tonton video berkaitan topik
- 📝 **Past Year Questions** — Akses soalan peperiksaan lepas
- 🤖 **Cikgu AI** — Tanya soalan, AI jawab berdasarkan nota sahaja

---

## 🚀 Panduan Setup

### Langkah 1: Install Node.js
Muat turun dan pasang Node.js dari [nodejs.org](https://nodejs.org) (versi 18 atau lebih baru).

### Langkah 2: Setup Supabase

1. Buka [supabase.com](https://supabase.com) dan daftar akaun percuma
2. Cipta projek baru
3. Pergi ke **SQL Editor** dan jalankan fail [`supabase/schema.sql`](./supabase/schema.sql)
4. Pergi ke **Storage** → **New Bucket**:
   - Cipta bucket `notes` (public: ✅)
   - Cipta bucket `pastyear` (public: ✅)
5. Dapatkan URL dan keys dari **Settings → API**

### Langkah 3: Setup Google Gemini API

1. Buka [aistudio.google.com](https://aistudio.google.com)
2. Log masuk dengan akaun Google
3. Klik **Get API Key** → **Create API Key**
4. Salin API key

### Langkah 4: Konfigurasi Environment Variables

```bash
# Salin fail contoh
cp .env.example .env.local
```

Edit `.env.local` dan isi nilai berikut:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
ADMIN_PASSWORD=JKPK12345
GEMINI_API_KEY=AIzaSy...
NEXTAUTH_SECRET=mana-mana-string-rawak-yang-panjang
NEXTAUTH_URL=http://localhost:3000
```

### Langkah 5: Install & Jalankan

```bash
# Install dependencies
npm install

# Jalankan dalam mod development
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) dalam browser.

---

## 📂 Struktur Projek

```
lms-petrokimia/
├── app/
│   ├── page.tsx              # Halaman login (pilih pelajar/pensyarah)
│   ├── admin/
│   │   ├── layout.tsx        # Guard: hanya admin boleh akses
│   │   └── page.tsx          # Dashboard pensyarah
│   ├── student/
│   │   ├── layout.tsx        # Guard: hanya pelajar berdaftar
│   │   ├── page.tsx          # Home pelajar
│   │   ├── topic/[id]/       # Halaman topik (nota + video)
│   │   ├── pastyear/         # Soalan past year
│   │   └── ask-ai/           # Cikgu AI chatbot
│   └── api/
│       ├── auth/             # Login endpoints
│       ├── course-settings/  # Nama & maklumat kursus
│       ├── topics/           # CRUD topik
│       ├── notes/            # CRUD nota + AI indexing
│       ├── videos/           # CRUD video YouTube
│       ├── pastyear/         # CRUD soalan past year
│       └── chat/             # Cikgu AI (Gemini + RAG)
├── components/
│   └── PdfFlipbook.tsx       # Komponen flipbook PDF
├── lib/
│   ├── supabase.ts           # Supabase client
│   ├── gemini.ts             # Google Gemini AI
│   └── utils.ts              # Helper functions
├── types/
│   └── index.ts              # TypeScript types
└── supabase/
    └── schema.sql            # Database schema
```

---

## 📖 Cara Guna

### Untuk Pensyarah (Admin)

1. Buka platform → Klik **Saya Pensyarah**
2. Masukkan password (`JKPK12345` secara default, boleh tukar dalam `.env.local`)
3. Dalam Admin Dashboard:
   - **Tab Kursus**: Tetapkan nama kursus, kod, dan nama pensyarah
   - **Tab Topik**: Tambah topik-topik dalam kursus
   - **Tab Nota PDF**:
     1. Upload PDF ke Supabase Storage (bucket `notes`)
     2. Salin URL fail
     3. Tambah nota dalam sistem
     4. Klik **🤖 Index AI** untuk Cikgu AI belajar dari nota tersebut
   - **Tab Video**: Tambah link YouTube mengikut topik
   - **Tab Past Year**: Upload soalan & skema jawapan

### Untuk Pelajar

1. Buka platform → Klik **Saya Pelajar**
2. Masukkan nama dan nombor matrik
3. Akses topik, baca nota dalam flipbook, tonton video
4. Akses Past Year Questions
5. Tanya Cikgu AI soalan berkaitan kursus

---

## 🤖 Cara Index Nota untuk Cikgu AI

Untuk Cikgu AI dapat menjawab soalan berdasarkan nota:

1. Buka PDF nota anda
2. Pilih semua teks (Ctrl+A) dan salin (Ctrl+C)
3. Dalam Admin Dashboard → Tab Nota PDF
4. Klik **🤖 Index AI** pada nota berkenaan
5. Tampal teks nota dalam kotak yang muncul
6. Klik OK — sistem akan proses dan index nota

> ⚠️ Nota yang belum di-index tidak dapat digunakan oleh Cikgu AI.

---

## 🌐 Deploy ke Vercel (Percuma)

1. Push kod ke GitHub
2. Buka [vercel.com](https://vercel.com) dan import projek
3. Tambah semua environment variables dari `.env.local`
4. Deploy!

---

## 🔧 Tech Stack

| Teknologi | Kegunaan |
|---|---|
| Next.js 14 | Framework utama (frontend + API) |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Supabase | Database + Storage + pgvector |
| Google Gemini | AI (Cikgu AI) |
| PDF.js | Render PDF dalam browser |
| Lucide React | Ikon |

---

## 📝 Lesen

Untuk kegunaan pendidikan. © 2024
