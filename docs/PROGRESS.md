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
- **Status deploy production belum terkonfirmasi** — kode sudah di-push ke
  GitHub, tapi import ke Vercel dan pengarahan DNS `cuanweb3.com` dilakukan
  mandiri oleh pemilik di luar sesi ini; belum ada laporan balik apakah build
  Vercel sukses atau domain sudah live (lihat bagian Deployment di bawah).

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

## 2026-11-23 — Deployment: push GitHub + persiapan Vercel/domain

### Yang sudah dilakukan

- Repo Git diinisialisasi di root proyek (sebelumnya belum ada `.git`).
  Diverifikasi tidak ada file `.env*` atau secret lain yang ikut ter-stage
  sebelum commit pertama (`.gitignore` sudah menolak `.env*`, `node_modules`,
  `.next`).
- Commit awal (135 file) dan push berhasil ke repo **publik**
  `https://github.com/pashamuhammadd/cuanweb3` (branch `main`).
- Instruksi langkah-demi-langkah diberikan ke pemilik untuk:
  1. Import repo ke Vercel lewat dashboard (bukan CLI — Vercel CLI tidak
     dipasang di environment kerja ini, dan proses ini butuh login akun
     Vercel pemilik sendiri).
  2. Menambahkan domain `cuanweb3.com` (+ `www`) di **Settings → Domains**
     project Vercel, lalu menyalin persis nilai DNS (A record apex /
     CNAME `www` / atau opsi nameserver) yang ditampilkan dashboard untuk
     project tersebut — nilai ini spesifik per akun/project sehingga sengaja
     **tidak** dihardcode di sini atau di README.
  3. Menambahkan `NEXT_PUBLIC_SITE_URL=https://cuanweb3.com` di environment
     variables Vercel.

### Status (belum terverifikasi dari sisi kami)

- **Belum dikonfirmasi**: apakah import project di Vercel sudah dilakukan,
  apakah build pertama di Vercel sukses, dan apakah DNS `cuanweb3.com` sudah
  diarahkan. Semua langkah ini memerlukan login akun Vercel/registrar milik
  pemilik dan dilakukan di luar sesi ini — belum ada konfirmasi hasil balik.
  Next session harus menanyakan status ini dan membantu debug log build
  Vercel bila ada error.
- Setelah domain aktif, **redirect URI Google OAuth** di Supabase/Google
  Cloud Console juga perlu ditambah `https://cuanweb3.com/auth/callback`
  (selain `localhost:3000` untuk dev) — baru relevan setelah Supabase project
  dibuat (lihat bagian konfigurasi manual di atas).
- Commit pertama (push GitHub) sudah bersih tanpa file ini. Pembaruan
  `docs/PROGRESS.md` ini sendiri dibuat setelah push tersebut dan **belum
  di-commit/push** — menunggu konfirmasi pemilik di sesi berikutnya.

## Pekerjaan dihentikan sementara (2026-11-23)

Pemilik menghentikan pekerjaan sementara setelah tahap push GitHub ini.
Tidak ada pekerjaan kode yang menggantung/belum di-commit.

### Langkah berikutnya saat melanjutkan (urutan yang disarankan)

1. Cek status deploy Vercel pemilik (sudah diimport? build sukses? domain
   `cuanweb3.com` sudah terverifikasi?) — bantu debug bila ada error log.
2. Setup project Supabase nyata: jalankan `supabase/migrations/0001_init.sql`,
   aktifkan Google OAuth provider, isi env vars di Vercel (lihat README.md),
   lalu **uji ulang end-to-end dengan kredensial asli**: login Google,
   auto-provision profil, jadikan admin lewat SQL, CRUD opportunities/articles
   di `/admin`, bookmark, RLS (pastikan user biasa tidak bisa akses data user
   lain atau menulis ke tabel yang dibatasi admin).
   Ini masih jadi blocker utama Fase 1 yang belum tervalidasi secara nyata.
3. Audit aksesibilitas keyboard-only end-to-end (belum dilakukan).
4. Setelah 1–3 beres dan pemilik puas dengan Fase 1 di production, mulai
   Fase 2 (Campaign sponsor): tabel sponsors/campaigns/tasks/entries/
  draws/winners/payouts, alur funding, eligibility, draw CSPRNG teraudit.

## 2026-11-25 — Persiapan Supabase produksi (sesi lanjutan)

### Status dari pemilik

- Vercel + domain `cuanweb3.com`: **sudah live** (konfirmasi pemilik).
- Project Supabase `cuanweb3` sudah dibuat, masih kosong (migrasi belum jalan).

### Bug yang ditemukan dan diperbaiki sebelum migrasi dijalankan

1. **RLS infinite recursion** — policy `profiles_select_admin` membaca
   `profiles` dari dalam policy `profiles`; semua policy admin lain ikut
   memicu rekursi. Diganti fungsi `public.is_admin()` (SECURITY DEFINER,
   `search_path = ''`). `0001_init.sql` diedit langsung karena belum pernah
   dijalankan di database mana pun.
2. **Admin tidak bisa edit profil sendiri** (`with check is_admin = false`).
   Diganti column-level privileges: client hanya boleh menulis
   username/avatar/skill/locale/notifikasi; `is_admin`/`status` tidak bisa
   diubah dari client sama sekali.
3. `GRANT` eksplisit per tabel/role, `search_path` terkunci pada
   `set_updated_at`, bookmark hanya untuk peluang `published`.
4. **Username auto-provision bisa melebihi 24 karakter** → insert profil gagal
   diam-diam untuk email dengan local part > 17 karakter. Base dipotong 17
   karakter + error insert kini dicatat.
5. **Open redirect** di `/auth/callback` (`?redirect=@evil.com`) dan `/login`
   (`?redirect=//evil.com`). Ditambah `src/lib/safe-redirect.ts`.
6. README: langkah Google OAuth diperbaiki (Redirect URLs diisi di Supabase
   URL Configuration; Google hanya perlu callback `*.supabase.co`).

### Verifikasi

- `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build` — lulus.
- `safeRedirectPath` diuji manual terhadap `//`, `@host`, `https://`,
  `javascript:`, karakter kontrol → semua jatuh ke `/akun`.
- **Belum**: SQL belum dijalankan di Postgres nyata (tidak ada Postgres lokal
  di environment ini); uji end-to-end login/admin/bookmark/RLS menunggu
  pemilik menjalankan migrasi dan mengisi env Vercel.

### Login email (magic link) — pengganti Google sebagai metode utama

- Permintaan pemilik: tidak memakai Google Cloud Console untuk saat ini.
- Ditambah `EmailLoginForm` (`signInWithOtp`) + route `/auth/confirm`
  (`verifyOtp` token_hash, lintas perangkat). `/auth/callback` tetap melayani
  link PKCE default. Tombol Google kini hanya tampil bila
  `NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=true` (tidak ada tombol berujung error).
- Teks Privasi/Ketentuan disesuaikan dengan login email.
- Lint/typecheck/build lulus (40 route). Render form belum dicek visual karena
  butuh Supabase terkonfigurasi; akan dicek saat uji end-to-end.
- Keterbatasan: SMTP bawaan Supabase sangat dibatasi (beberapa email/jam) —
  cukup untuk uji coba, perlu SMTP sendiri sebelum trafik besar.

### Verifikasi produksi (2026-11-25, setelah push b9f4d59)

- Deploy Vercel baru aktif; env Supabase terbaca (form "Kirim link masuk"
  tampil di https://cuanweb3.com/login).
- **Dikonfirmasi pemilik**: login magic link berhasil, profil auto-provision
  terbuat, promosi admin via SQL berhasil, membuat + publish peluang di
  `/admin` berhasil (tampil publik di `/peluang/inihanyatesaja`).
- **Uji RLS sebagai anon** (REST API + publishable key): baca opportunities
  hanya yang `published`; draft opportunities/articles → `[]`; baca
  profiles/bookmarks → 42501; insert/update/delete opportunities → 42501;
  update `profiles.is_admin` → 42501; `rpc/is_admin` → `false`.
- Route terlindungi sebagai tamu: `/admin*` dan `/akun*` → 307 ke `/login`.
- Open redirect live: `/auth/callback?redirect=@evil.com` → tetap ke
  `cuanweb3.com/login`.
- **Belum diuji**: akun login non-admin kedua (bookmark, "Akses ditolak" di
  `/admin`, tidak bisa membaca profil/bookmark user lain), audit keyboard-only.

### SMTP + uji pengguna non-admin (2026-11-25)

- Custom SMTP **Resend** dipasang pemilik (domain `cuanweb3.com`
  terverifikasi), template Magic Link + Confirm signup diarahkan ke
  `/auth/confirm?token_hash=…&type=email` → link login berfungsi lintas
  perangkat (dikonfirmasi pemilik: link dibuka di HP berhasil).
- Pesan rate-limit di form login diperjelas.
- **Dikonfirmasi pemilik** dengan akun kedua (non-admin): login berhasil,
  bookmark peluang tersimpan dan tampil di profil.

### Audit aksesibilitas keyboard (2026-11-25)

Diuji di Chromium (desktop) dengan Tab/Enter/Space pada build produksi lokal,
plus pemeriksaan kode untuk form yang butuh login.

Temuan & perbaikan:
- **Tidak ada skip link** → ditambah "Lewati ke konten" (elemen fokus
  pertama, `main#konten` tabIndex -1). Diverifikasi: Enter memindahkan fokus
  ke konten utama.
- **Fokus nyaris tak terlihat** (outline bawaan 1px abu di latar gelap; 10
  input memakai `focus:outline-none` + perubahan border saja) → outline emas
  2px global via `:focus-visible` di `@layer base`, `focus:outline-none`
  dihapus. Diverifikasi di chip filter `/peluang`.
- **Pola ARIA tab tidak lengkap** di feed beranda (`role="tab"` tanpa
  tabpanel/arrow keys) → diganti grup tombol toggle `aria-pressed`.
- **Jumlah hasil filter tidak diumumkan** → `aria-live="polite"`.
- **Label tidak terhubung** pada select Kategori/Status di form admin
  peluang → `htmlFor`/`id`.

Lolos tanpa perubahan: urutan tab mengikuti DOM, tidak ada `tabindex`
positif, semua elemen interaktif punya nama aksesibel, landmark nav
berlabel, satu `h1` di `main`, chip filter bisa di-toggle dengan Space,
`prefers-reduced-motion` (CSS global + `useReducedMotion` di hero/ticker;
feed hanya fade opacity 150ms).

Belum: screen reader nyata (NVDA/VoiceOver), Safari/iOS, perangkat fisik.
Link teks footer ~18px tinggi — masuk pengecualian spacing WCAG 2.5.8, tidak
diubah.

Catatan: dev server yang sudah berjalan lama tidak memuat ulang perubahan
`globals.css`; restart `pnpm dev` bila style global tidak berubah.
