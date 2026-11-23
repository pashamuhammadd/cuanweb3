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
2. Jalankan migrasi: `supabase/migrations/0001_init.sql` (lewat Supabase CLI
   `supabase db push`, atau tempel manual di SQL editor dashboard).
3. (Opsional) Jalankan `supabase/seed.sql` untuk data contoh berlabel.
4. Aktifkan provider **Google** di Authentication → Providers, dan set
   Authorized redirect URL ke `https://<project-ref>.supabase.co/auth/v1/callback`
   serta `<NEXT_PUBLIC_SITE_URL>/auth/callback` di Google Cloud Console.
5. Isi `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — dari
     Project Settings → API.
   - `SUPABASE_SERVICE_ROLE_KEY` — hanya untuk kebutuhan server khusus,
     jangan commit, jangan expose ke client.
6. Login sekali dengan akun Google kamu di `/login` agar profil otomatis
   terbuat, lalu jadikan admin lewat SQL editor:
   ```sql
   update profiles set is_admin = true where username = 'username-kamu';
   ```
7. Akses `/admin` untuk mengelola peluang dan artikel.

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
pnpm exec tsc --noEmit   # typecheck (strict)
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
