# 🛒 Nitipcatip – Jasa Titip Web Application

Platform Jasa Titip (Jastip) modern berbasis **Next.js 15 + Tailwind CSS v4**, terintegrasi langsung dengan **Google Sheets** via Google Apps Script.

---

## 🚀 Cara Menjalankan Secara Lokal

```bash
# 1. Masuk ke folder proyek
cd /Users/macbook/luull/dev/PROJECT/nitipcatip

# 2. Install dependensi (sudah dilakukan saat init)
npm install

# 3. Salin file env dan isi nilainya
cp .env.local.example .env.local   # atau edit .env.local langsung

# 4. Jalankan server development
npm run dev
```

Buka browser di: **http://localhost:3000**

---

## ⚙️ Setup Google Sheets (Wajib untuk Form Submit)

### Langkah 1 – Buat Spreadsheet

1. Buka [Google Sheets](https://sheets.google.com)
2. Klik **"+ Blank"** untuk membuat spreadsheet baru
3. Beri nama: `Nitipcatip - Daftar Pesanan`

### Langkah 2 – Buka Apps Script Editor

1. Di menu atas spreadsheet, klik: **Extensions → Apps Script**
2. Tab baru akan terbuka dengan editor kode

### Langkah 3 – Paste Script Backend

1. **Hapus semua** kode default (`function myFunction() {...}`)
2. Buka file: [`google-apps-script/Code.gs`](./google-apps-script/Code.gs)
3. **Salin seluruh isinya** dan paste ke editor Apps Script
4. Klik **💾 Save** (Ctrl+S)

### Langkah 4 – Deploy sebagai Web App

1. Klik tombol **"Deploy"** di pojok kanan atas
2. Pilih **"New Deployment"**
3. Klik ikon ⚙️ lalu pilih **"Web App"**
4. Isi form deployment:
   | Field | Nilai |
   |---|---|
   | Description | `Nitipcatip API v1` |
   | Execute as | **Me** |
   | Who has access | **Anyone** ← WAJIB! |
5. Klik **"Deploy"**
6. Klik **"Authorize access"** → pilih akun Google kamu → izinkan semua permission
7. **Salin URL Web App** yang muncul (formatnya: `https://script.google.com/macros/s/XXXX.../exec`)

> ⚠️ **Penting!** Setiap kali kamu **mengedit** script, kamu harus membuat **"New Deployment"** baru. Jangan lupa salin URL deployment terbaru.

### Langkah 5 – Konfigurasi `.env.local`

Buka file `.env.local` di root proyek dan isi nilainya:

```env
# URL Web App dari Google Apps Script (langkah 4)
GOOGLE_SCRIPT_URL="https://script.google.com/macros/s/AKfycb.../exec"

# Nomor WhatsApp Admin (format internasional, tanpa + )
NEXT_PUBLIC_WA_ADMIN_NUMBER="628123456789"
```

Ganti `628123456789` dengan nomor WhatsApp asli admin kamu.

### Langkah 6 – Restart Dev Server

```bash
# Tekan Ctrl+C untuk stop server, lalu:
npm run dev
```

Setelah ini, setiap form yang berhasil disubmit akan otomatis muncul sebagai baris baru di Google Sheet!

---

## 📊 Struktur Kolom Google Sheet

| Kolom | Isi |
|---|---|
| No | Nomor urut pesanan |
| Timestamp | Waktu submit (WIB) |
| Nama Pemesan | Nama lengkap |
| WhatsApp | Nomor WA |
| Email | Email pemesan |
| Nama Barang | Nama produk |
| Link Produk | URL produk (opsional) |
| Ukuran / Varian | Ukuran atau varian |
| Warna | Warna barang |
| Jumlah | Jumlah unit |
| Harga Barang (Rp) | Harga per unit |
| Estimasi Ongkir (Rp) | Ongkos kirim |
| **Total Harga (Rp)** | **(Harga × Jumlah) + Ongkir** ← Otomatis! |
| Kota Tujuan | Kota pengiriman |
| Kode Pos | Kode pos |
| Catatan / Kupon | Catatan atau kode kupon |
| Lampiran | Link Google Drive foto produk |
| Status | Default: "Menunggu Konfirmasi" |

---

## 📁 Struktur Proyek

```
nitipcatip/
├── google-apps-script/
│   └── Code.gs              ← Script backend Google Sheets
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── submit-order/
│   │   │       └── route.ts ← Next.js API proxy ke Google Apps Script
│   │   ├── globals.css      ← Custom animations & global styles
│   │   ├── layout.tsx       ← Root layout + SEO metadata
│   │   └── page.tsx         ← Halaman utama (hero, trips, catalog, form)
│   ├── components/
│   │   ├── OrderForm.tsx    ← Form dual-column dengan validasi Zod
│   │   ├── OrderPreviewModal.tsx ← Preview pesanan sebelum submit
│   │   └── SuccessModal.tsx ← Notifikasi sukses + tombol WhatsApp
│   ├── config/
│   │   └── jastip.ts        ← Data Open Trips & Katalog Barang
│   └── types/
│       └── index.ts         ← TypeScript types + Zod validation schema
├── .env.local               ← Environment variables (GOOGLE_SCRIPT_URL, WA_NUMBER)
└── package.json
```

---

## ✨ Fitur Lengkap

### Halaman Client (Landing Page)
- **Hero Section** – Tagline & CTA button
- **Trust Badges** – Transparan, Rute Internasional, Mudah & Cepat
- **Open Trips Grid** – Kartu trip aktif (Bangkok, Tokyo, Singapore) dengan status & tanggal close
- **Katalog Barang Populer** – Grid produk populer dengan harga jastip
- **Autofill Form** – Klik "Titip Barang Ini" → form otomatis terisi nama & harga barang
- **Footer** – Info kontak & navigasi

### Form Pemesanan
- **Layout Dual Column** – Informasi Produk (kiri) + Informasi Pembeli (kanan)
- **Validasi Real-time** – react-hook-form + Zod
- **Drag & Drop Upload** – Lampiran gambar produk (max 5MB, preview langsung)
- **Kalkulasi Otomatis** – Total = (Harga × Jumlah) + Estimasi Ongkir
- **Preview Modal** – Tampilkan ringkasan pesanan sebelum submit
- **Tips Box** – Panduan singkat untuk pemesan

### Submit & Integrasi
- **Next.js API Route** – Proxy aman ke Google Apps Script (URL tidak terekspos ke browser)
- **Google Sheets** – Data tersimpan otomatis dengan formatting IDR dan header berwarna
- **Google Drive** – Lampiran gambar terupload otomatis ke folder "Nitipcatip Lampiran"
- **Success Modal** – Notifikasi sukses dengan ringkasan & tombol WhatsApp Admin
- **WhatsApp Integration** – Tombol kirim pesan ke admin dengan teks pesanan terisi otomatis

---

## 🛠️ Tech Stack

| Teknologi | Versi | Kegunaan |
|---|---|---|
| Next.js | 15 (App Router) | Framework utama |
| Tailwind CSS | v4 | Styling |
| React Hook Form | latest | Manajemen form |
| Zod | latest | Validasi schema |
| Lucide React | latest | Icon library |
| Google Apps Script | - | Backend ke Google Sheets |
| Google Sheets | - | Database pesanan |
| Google Drive | - | Penyimpanan lampiran |

---

## 🔧 Kustomisasi

### Ubah Open Trips
Edit file [`src/config/jastip.ts`](./src/config/jastip.ts) bagian `ACTIVE_TRIPS`:

```ts
{
  id: "trip-paris",
  destination: "Paris, France",
  flag: "🇫🇷",
  closeDate: "1 Juli 2026",
  eta: "10 Juli 2026",
  status: "Open",
  bannerUrl: "https://...",
}
```

### Ubah Katalog Barang
Edit bagian `CATALOG_ITEMS` di file yang sama:

```ts
{
  id: "cat-chanel",
  name: "Chanel Chance Eau de Parfum 50ml",
  category: "Beauty",
  price: 2500000,
  image: "https://...",
  description: "Parfum ikonik dari Paris.",
  defaultLink: "https://chanel.com/...",
}
```

### Ubah Nomor WhatsApp Admin
Di file `.env.local`:
```env
NEXT_PUBLIC_WA_ADMIN_NUMBER="6281234567890"
```
# nitip-catip
