# Progress tracker

- [x] Phase 1 MVP — implementasi awal selesai, lihat detail di bawah
- [ ] Phase 2 Campaign sponsor
- [ ] Phase 3 Misi dan komunitas
- [ ] Phase 4 Plus dan monetisasi
- [ ] Phase 5 Integrasi dan skalabilitas

## 2026-11-23 — Fase 1 (MVP): implementasi awal

### Yang dibangun

- **Proyek**: Next.js 16 (App Router, Turbopack), React 19, TypeScript
  strict, Tailwind CSS v4, pnpm. `cacheComponents`/PPR sengaja **tidak**
  diaktifkan (lihat Keputusan teknis di bawah).
- **Desain**: token warna/Tailwind sesuai `docs/DESIGN.md` (charcoal, petrol,
  gold, teal), font Bricolage Grotesque (heading) + Geist (body) via
  `next/font/google` (self-hosted), motion dengan `motion` (framer-motion),
  menghormati `prefers-reduced-motion`.
- **Layout**: header + market ticker + nav desktop, bottom nav mobile
  (safe-area inset), footer desktop. Hero dengan parallax/bob halus pada CUA,
  aset `hero.png`/`welcome.png` sesuai breakpoint.
- **6 kategori** (`/airdrop /giveaway /bounty /jobs /hackathon /grants`) +
  `/peluang` (semua), masing-masing dengan filter (cari, skill, tanpa modal,
  deadline dekat) dan grid kartu responsif.
- **Detail peluang** (`/peluang/[slug]`) dengan metadata SEO (title,
  description, canonical, OG), status verifikasi, syarat, tombol simpan.
- **Market**: `/market` + ticker header. Adapter CoinGecko (`MARKET_PROVIDER`
  env, default nonaktif → data demo berlabel), fallback in-memory ke data
  terakhir valid saat fetch gagal (`stale`), tidak pernah menampilkan demo
  sebagai live.
- **Auth**: Google OAuth via Supabase (`@supabase/ssr`), `src/proxy.ts`
  (pengganti `middleware.ts` di Next 16) untuk refresh sesi, profil
  auto-provision idempotent setelah login pertama, logout.
- **Akun**: `/akun` (edit profil), `/akun/tersimpan` (bookmark), `/akun/aktivitas`
  dan `/akun/pembayaran` (placeholder jujur, fitur Fase 2–4).
- **Admin**: `/admin` dashboard, CRUD `opportunities` dan `articles` penuh
  (create/edit/draft-publish/arsip) dengan guard `is_admin` server-side,
  `/admin/users` (read-only), stub halaman campaigns/submissions/sponsors/
  payouts/settings (jujur ditandai "belum diimplementasikan").
- **Belajar (Academy)**: listing + detail artikel, konten keamanan wallet.
- **Komunitas, Plus, Misi**: halaman informasi, tanpa pembayaran/undian riil
  (sesuai instruksi — tidak boleh membuat fitur produksi tanpa otorisasi).
- **Statis**: Tentang, Kontak, Privasi, Ketentuan — draf jujur, bukan klaim
  compliance yang belum diverifikasi.
- **SEO**: `sitemap.ts`, `robots.ts` (disallow `/admin /akun /auth /login`),
  metadata per halaman, `not-found.tsx` bertema.
- **Data layer**: pola repository — pakai Supabase bila
  `NEXT_PUBLIC_SUPABASE_URL`/`ANON_KEY` terisi, else fallback ke seed data
  lokal berlabel `isDemo: true` (card menampilkan badge "Contoh"). Ini
  memenuhi instruksi "lanjutkan bagian yang dapat diuji tanpa kredensial".
- **Supabase**: `supabase/migrations/0001_init.sql` (profiles, opportunities,
  articles, bookmarks + RLS deny-by-default + trigger `updated_at`),
  `supabase/seed.sql` (data contoh), `.env.example`.

### Verifikasi yang sudah dijalankan

- `pnpm lint` — lulus, 0 error/warning.
- `pnpm exec tsc --noEmit` — lulus, 0 error (strict mode).
- `pnpm build` — lulus, 39 route ter-generate (lihat output route map di
  commit ini), tidak ada error prerender.
- Smoke test manual: seluruh route publik + `/login /akun /admin` + 1 detail
  peluang + 1 detail artikel + `/sitemap.xml /robots.txt` → semua HTTP 200
  pada `next dev`.
- Verifikasi visual (Chrome, desktop 1536px): beranda, halaman kategori
  dengan filter, dan halaman detail peluang dibandingkan terhadap
  `references/ui-desktop-mobile.png` — komposisi dan palet sesuai.
- **Verifikasi responsif mobile (2026-11-23, sesi lanjutan)**: tool
  `resize_window` bawaan browser tidak mengubah viewport nyata di environment
  ini (window tetap fullscreen), jadi verifikasi dilakukan lewat iframe
  berukuran tetap (360px, 390px, 768px, 800px) yang disuntikkan ke halaman
  kosong — iframe punya viewport CSS sendiri terlepas dari ukuran window
  induk, jadi breakpoint Tailwind teruji sungguhan. Hasil:
  - Ditemukan **bug nyata**: CSS Grid blowout di beranda — wrapper
    `<FeedSection>`+`<aside>` di `src/app/page.tsx` tidak punya `min-w-0`,
    sehingga pada viewport sempit grid child melebar melebihi track-nya dan
    menyebabkan ~25px horizontal overflow pada seluruh halaman (melanggar
    aturan DESIGN.md "jangan ada horizontal overflow selain ticker"). Sudah
    diperbaiki dengan menambah `min-w-0` pada kedua grid item.
  - Setelah perbaikan: `document.documentElement.scrollWidth -
    clientWidth === 0` di **seluruh** halaman publik (beranda, 6 kategori,
    peluang, market, belajar + detail, komunitas, plus, misi, login, akun,
    admin, tentang/kontak/privasi/ketentuan, detail peluang/artikel) pada
    360px, 390px, dan di sekitar breakpoint 768px (750px dan 782px, mewakili
    sisi mobile dan desktop dari breakpoint `md`).
  - Verifikasi visual pada 360px, 390px, dan 768px/800px: grid kategori
    3×2 di mobile, bottom nav fixed dengan indikator aktif, hero mobile
    (welcome.png, tidak terpotong), transisi ke nav desktop + grid 6 kolom +
    hero dua kolom di ≥768px — semua sesuai `docs/DESIGN.md`.
  - Belum dicek: perangkat fisik asli dan Safari/iOS (hanya Chromium
    tersedia di environment ini).

### Belum/tidak terverifikasi (blocker aktual)

- **Belum ada project Supabase nyata** — semua jalur auth/admin/bookmark
  sudah diimplementasikan penuh tapi baru teruji lewat code path "belum
  dikonfigurasi". Pemilik perlu membuat project, menjalankan migrasi, lalu
  tim perlu menguji ulang login Google, CRUD admin, dan RLS dengan kredensial
  asli sebelum go-live.
- **Keyboard/aksesibilitas**: struktur semantik dan focus state sudah
  ditulis (label, aria-pressed, aria-current, alt text), tapi belum ada audit
  keyboard-only end-to-end.
- **AdSense, payment provider, draw/undian produksi**: belum diimplementasikan
  sama sekali — sesuai instruksi, menunggu kredensial dan otorisasi pemilik.

### Keputusan teknis yang perlu diketahui pemilik

- Next.js 16 mengaktifkan Turbopack dan `cacheComponents` (Cache Components/
  PPR) secara default di scaffold. Kami **menonaktifkan** `cacheComponents`
  karena model cache barunya mewajibkan setiap data dinamis dibungkus
  `<Suspense>`/`"use cache"` secara eksplisit di seluruh aplikasi — perubahan
  arsitektur besar yang berisiko untuk MVP. Bisa dievaluasi lagi di Fase 5.
- Market data fallback "stale" disimpan in-memory per server instance (reset
  saat redeploy). Untuk persistensi lintas instance, perlu tabel
  `market_snapshots` (sudah ada di `docs/ARCHITECTURE.md`, belum dibuat).
- Admin pertama **tidak bisa** self-promote dari UI manapun — harus di-set
  lewat SQL (`update profiles set is_admin = true ...`) oleh pemilik, demi
  keamanan.

### Konfigurasi manual yang dibutuhkan dari pemilik sebelum fitur akun aktif

1. Project Supabase + jalankan `supabase/migrations/0001_init.sql`.
2. Aktifkan Google OAuth provider di Supabase + redirect URI di Google Cloud
   Console (lihat README.md).
3. Isi `.env.local` dari `.env.example`.
4. Opsional: `MARKET_PROVIDER=coingecko` untuk harga live.
5. Jadikan akun pertama admin lewat SQL (lihat README.md).

### Langkah berikutnya (usulan, menunggu arahan pemilik)

- Review visual mobile langsung (360–430px) sebelum lanjut ke Fase 2.
- Setup Supabase project nyata dan uji ulang auth + RLS dengan data asli.
- Mulai Fase 2 (Campaign sponsor): tabel sponsors/campaigns/tasks/entries/
  draws/winners/payouts, alur funding, eligibility, draw CSPRNG teraudit.
