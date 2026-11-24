# CuanWeb3

Platform peluang penghasilan Web3 berbahasa Indonesia. Next.js App Router,
TypeScript strict, Tailwind CSS v4, Supabase (Auth/Postgres), pnpm.

## Status

Fase 1 (MVP) — lihat `docs/PROGRESS.md` untuk detail lengkap, hasil
verifikasi, dan pekerjaan tersisa.

## Menjalankan secara lokal

```bash
pnpm install
cp .env.example .env.local   # isi kredensial bila ada, boleh dikosongkan dulu
pnpm dev
```

Tanpa kredensial Supabase, aplikasi tetap berjalan penuh dalam **mode
pengembangan**: listing, artikel, dan harga market memakai data contoh yang
diberi label "Contoh" / "Demo". Login, bookmark, dan panel admin akan
menampilkan pesan konfigurasi alih-alih error.

## Setup Supabase (opsional untuk pengembangan, wajib untuk fitur akun)

1. Buat project di [supabase.com](https://supabase.com).
2. Jalankan migrasi `supabase/migrations/0001_init.sql`: tempel seluruh isinya
   di **SQL Editor** dashboard lalu Run (atau `supabase db push` via CLI).
3. `supabase/seed.sql` berisi data contoh berlabel — **hanya** untuk project
   pengembangan, jangan dijalankan di database produksi.
4. **Authentication → URL Configuration**:
   - Site URL: `<NEXT_PUBLIC_SITE_URL>` (mis. `https://cuanweb3.com`).
   - Redirect URLs: `https://cuanweb3.com/auth/callback` dan
     `http://localhost:3000/auth/callback`.
5. **Login email (utama, gratis)** — provider Email aktif secara default di
   Supabase (Authentication → Sign In / Providers → Email). Dengan template
   bawaan, link masuk bekerja lewat `/auth/callback` tapi harus dibuka di
   browser yang sama. Supabase hanya mengizinkan edit template setelah
   custom SMTP dipasang; setelah itu, agar link berfungsi di perangkat lain, ubah template
   **Authentication → Emails → Magic Link** (dan **Confirm signup**) agar
   tautannya menjadi:
   ```html
   <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Masuk ke CuanWeb3</a>
   ```
   Catatan: SMTP bawaan Supabase dibatasi sangat ketat (hanya beberapa email
   per jam) dan ditujukan untuk uji coba. Sebelum promosi ke banyak pengguna,
   pasang SMTP sendiri di Project Settings → Authentication → SMTP.
   **Google (opsional)** — OAuth client di Google Cloud Console gratis.
   Redirect URI-nya `https://<project-ref>.supabase.co/auth/v1/callback`;
   tempel Client ID/Secret di provider Google Supabase, lalu set
   `NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=true` agar tombolnya tampil.
6. Isi env (`.env.local` untuk lokal, Environment Variables untuk Vercel):
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — dari
     Project Settings → API Keys (anon key atau publishable key `sb_publishable_…`).
   - `SUPABASE_SERVICE_ROLE_KEY` tidak dipakai di Fase 1; jangan diisi di
     client dan jangan di-commit.
7. Login sekali lewat `/login` agar profil otomatis
   terbuat, lalu jadikan admin lewat SQL editor:
   ```sql
   update public.profiles set is_admin = true
   where id = (select id from auth.users where email = 'email-kamu@gmail.com');
   ```
8. Akses `/admin` untuk mengelola peluang dan artikel.

## Opportunity Engine (otomatisasi peluang)

Detail lengkap: `docs/OPPORTUNITY-ENGINE.md`. Langkah aktivasi produksi:

1. Supabase SQL Editor: jalankan `supabase/migrations/0002_opportunity_engine.sql`.
2. Vercel → Settings → Environment Variables (Production), lalu redeploy:
   - `SUPABASE_SERVICE_ROLE_KEY` = secret key `sb_secret_…` (Project Settings → API Keys).
     **Server-only**: jangan beri awalan `NEXT_PUBLIC_`.
   - `CRON_SECRET` = string acak ≥32 karakter, mis. hasil
     `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
   - Opsional: `WEB3_CAREER_API_TOKEN` (token gratis dari web3.career).
3. Supabase SQL Editor: simpan secret yang sama ke Vault (sekali, jangan commit nilainya):
   ```sql
   select vault.create_secret('<CRON_SECRET>', 'cuanweb3_cron_secret');
   ```
   lalu jalankan `supabase/cron.sql` (mengaktifkan pg_cron + pg_net dan membuat 2 jadwal).
4. `/admin/automation` → Jalankan sinkronisasi sekarang → periksa Review Queue.

Uji: `pnpm test` (unit) dan `pnpm test:live` (ambil feed asli, tanpa database).

## Market data (opsional)

Default: data demo berlabel "Market • Demo". Untuk mengaktifkan harga live
dari [CoinGecko public API](https://www.coingecko.com/en/api/documentation),
set di `.env.local`:

```
MARKET_PROVIDER=coingecko
MARKET_API_KEY=   # opsional, untuk CoinGecko Demo API key
```

Jika fetch gagal, UI otomatis fallback ke data terakhir yang valid (ditandai
"Data tertunda") — tidak pernah diam-diam diganti data demo seolah live.

## Verifikasi

```bash
pnpm lint        # ESLint (flat config, eslint-config-next)
pnpm typecheck   # tsc --noEmit (strict)
pnpm test        # unit test (Vitest)
pnpm build       # production build, Turbopack
```

## Struktur folder

```
src/app/            Routes (App Router)
src/components/     Komponen UI per domain (layout, home, opportunities, admin, ...)
src/lib/            Data access, Supabase clients, market adapter, format helpers
src/types/          Tipe domain (Opportunity, dll.)
supabase/migrations/  Skema SQL + RLS, aman dijalankan ulang
supabase/seed.sql     Data contoh berlabel untuk pengembangan
public/assets/cua/    Aset maskot resmi CUA
references/           Acuan visual — jangan dipakai sebagai screenshot UI
```

## Catatan keamanan

- Jangan pernah meminta atau menyimpan seed phrase / private key pengguna.
- Secret (`SUPABASE_SERVICE_ROLE_KEY`, dll.) hanya di server/`.env.local`,
  tidak pernah di client atau Git.
- RLS Postgres bersifat deny-by-default; hak admin disimpan di kolom
  `profiles.is_admin` dan hanya bisa diubah lewat SQL langsung (tidak ada
  endpoint self-promote).
