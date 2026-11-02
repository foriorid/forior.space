# Forior Space — Website Listing Properti

Website pribadi untuk agen properti. Alih-alih mengisi form satu per satu,
Anda cukup **chat seperti kirim WhatsApp** (teks bebas + foto), lalu AI
merapikannya otomatis menjadi listing: judul, deskripsi, harga, kamar tidur,
luas tanah/bangunan, sertifikat, lokasi, dan fasilitas.

- 📱 **Mobile-first + PWA** — bisa di-_install_ ke home screen HP, terasa seperti aplikasi.
- 💬 **Input via chat** — tulis bebas, AI yang memetakan jadi data terstruktur.
- 🖼️ **Upload foto** langsung dari galeri/kamera.
- 🏷️ **Jual & sewa**, filter tipe/lokasi, format Rupiah & m² otomatis.
- 🟢 Tombol **Hubungi via WhatsApp** di tiap listing.

---

## 1. Jalankan di lokal

```bash
npm install
cp .env.example .env.local   # lalu edit isinya
npm run dev
```

Buka http://localhost:3000

- Situs publik: `/`
- Halaman agen: `/admin` (akan diminta login ke `/masuk`)

> Saat pertama dijalankan, otomatis ada **4 listing contoh** supaya tidak kosong.
> Data tersimpan di folder `data/` (file JSON + foto) — folder ini tidak ikut di-commit.

## 2. Konfigurasi (`.env.local`)

| Variabel | Kegunaan |
|---|---|
| `ADMIN_PASSWORD` | Password login halaman Agen. **Wajib ganti.** |
| `APP_SECRET` | String acak untuk menandatangani cookie sesi. **Wajib ganti.** |
| `ANTHROPIC_API_KEY` | Kunci [Claude API](https://console.anthropic.com) untuk parsing chat + foto. |
| `ANTHROPIC_MODEL` | (opsional) Model parsing. Default `claude-haiku-5-5` (cepat & hemat). |
| `NEXT_PUBLIC_WA_NUMBER` | Nomor WhatsApp tombol "Hubungi" (format `628xxx`, tanpa `+`). |
| `NEXT_PUBLIC_SITE_NAME` / `_TAGLINE` / `_AGENT_NAME` | Branding. |

### Tanpa API key?
App tetap jalan: parsing memakai **parser sederhana** (regex) yang mengenali
pola umum Indonesia (`3KT`, `LT 120`, `2.5M`, `SHM`, `Bintaro`, dst). Begitu
`ANTHROPIC_API_KEY` diisi, parsing otomatis jadi jauh lebih pintar dan bisa
**membaca foto** untuk memperkaya deskripsi.

## 3. Cara pakai (alur agen)

1. Masuk ke **Agen** → **Tambah Listing via Chat**.
2. Tulis detail properti bebas, contoh:
   > `Rumah dijual Bintaro sektor 9, 3KT 2KM, LT 120 LB 90, SHM, 2.5M nego, carport 2 mobil, dekat tol`
3. Tambahkan foto → **Proses dengan AI**.
4. Periksa/edit hasil yang sudah terisi otomatis → **Publish** (atau Simpan Draft).

## 3b. Preview tampilan di GitHub Pages

Repo ini sudah punya workflow (`.github/workflows/pages.yml`) yang mem-publish
**preview statis situs publik** (beranda, cari, detail — dengan data contoh) ke
GitHub Pages setiap push ke `main`.

URL: **https://foriorid.github.io/future-pro/**

> Aktifkan sekali di **Settings → Pages → Build and deployment → Source: GitHub Actions**.
>
> ⚠️ Pages hanya file statis, jadi **chat AI, login agen, upload foto, dan
> listing dinamis tidak berfungsi di sini** — itu butuh server (lihat Vercel di
> bawah). Pages hanya untuk melihat desain/tampilan.

## 4. Deploy ke Vercel (aplikasi penuh)

1. Push repo ini ke GitHub.
2. Import di [vercel.com](https://vercel.com) → set semua env var dari `.env.example`.
3. Deploy.

> ⚠️ **Penting soal penyimpanan:** tanpa Supabase, data disimpan ke file disk
> (`data/`) yang **tidak permanen** di Vercel (serverless). Untuk produksi, isi
> env var Supabase (bagian 5) — integrasinya sudah siap, tinggal diaktifkan.

## 5. Penyimpanan permanen dengan Supabase (produksi)

Integrasi Supabase **sudah tersedia** dan aktif otomatis begitu env var-nya diisi.
Tanpa env var → app tetap pakai penyimpanan file lokal (mode coba-coba).

**Langkah:**

1. Buat akun & project gratis di [supabase.com](https://supabase.com).
2. Di dashboard → **SQL Editor** → tempel isi `docs/supabase-schema.sql` → **Run**
   (membuat tabel `listings`, `settings`, dan bucket storage `listings`).
3. Ambil kredensial di **Project Settings → API**:
   - `SUPABASE_URL` = Project URL
   - `SUPABASE_SERVICE_ROLE_KEY` = **service_role** key (rahasia, server-side saja)
4. Isi keduanya di `.env.local` (lokal) atau di Environment Variables Vercel.

Begitu diisi, semua listing & foto tersimpan permanen di Supabase — tidak hilang
saat redeploy. Login agen tetap pakai `ADMIN_PASSWORD` (cukup untuk satu agen).

> Arsitektur terpisah: `lib/store.ts` otomatis memilih `lib/store-supabase.ts`
> (Supabase) atau `lib/store-file.ts` (file). UI, API, dan parsing tidak berubah.

---

## Struktur proyek

```
app/
  (public)/          Situs publik: beranda, cari, detail listing
  admin/             Dashboard agen, tambah/edit listing
  masuk/             Halaman login agen
  api/               auth, parse (AI), upload, listings, images
components/           Kartu listing, carousel, bottom nav, editor, dll
lib/
  parse.ts           Chat/foto -> listing (Claude + fallback regex)
  store.ts           Lapisan penyimpanan (file JSON + foto) — swap ke DB di sini
  types.ts, format.ts, auth.ts, site.ts, seed.ts
public/              Ikon PWA, manifest, service worker, foto contoh
```

Dibangun dengan **Next.js 15 (App Router) + React 19 + Tailwind CSS v4**.
