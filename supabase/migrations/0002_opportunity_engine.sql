-- CuanWeb3 — Opportunity Engine (otomatisasi pencarian & import peluang)
-- Aman dijalankan ulang. Jalankan setelah 0001_init.sql.
--
-- Prinsip:
-- * Semua tulis dari engine memakai service role di server (cron/admin),
--   jadi RLS tabel baru cukup: admin boleh baca/ubah pengaturan, publik tidak.
-- * Biaya Rp0: sumber berbayar dikunci oleh CHECK constraint, tidak bisa
--   diaktifkan tanpa migrasi baru yang disetujui pemilik.

-- 1. Kategori diperluas -------------------------------------------------------
alter table public.opportunities drop constraint if exists opportunities_category_check;
alter table public.opportunities add constraint opportunities_category_check check (
  category in (
    'airdrop', 'giveaway', 'bounty', 'contest', 'jobs', 'hackathon',
    'grants', 'testnet', 'ambassador', 'paid_mission'
  )
);

-- 2. Sumber integrasi ----------------------------------------------------------
create table if not exists public.integration_sources (
  id uuid primary key default gen_random_uuid(),
  key text not null unique check (key ~ '^[a-z0-9_]{2,40}$'),
  name text not null,
  adapter text not null,                       -- 'rss' | 'web3career' | 'devpost' | ...
  kind text not null check (kind in ('rss', 'api')),
  url text not null,
  homepage_url text,
  enabled boolean not null default false,
  default_category text,
  categories text[] not null default '{}',
  ecosystems text[] not null default '{}',
  keyword_filter boolean not null default true, -- RSS berita: hanya item berkata kunci peluang
  interval_minutes integer not null default 180 check (interval_minutes between 60 and 10080),
  publish_mode text not null default 'manual' check (publish_mode in ('manual', 'auto')),
  trusted boolean not null default false,
  requires_api_key boolean not null default false,
  api_key_env text,                             -- NAMA env var server, bukan nilai key
  is_paid boolean not null default false,
  cost_per_1k_requests_usd numeric not null default 0,
  daily_quota integer check (daily_quota is null or daily_quota >= 0),
  monthly_quota integer check (monthly_quota is null or monthly_quota >= 0),
  terms_note text,
  status_note text,
  last_run_at timestamptz,
  last_success_at timestamptz,
  next_run_at timestamptz,
  last_status text,
  last_error text,
  consecutive_failures integer not null default 0,
  backoff_until timestamptz,
  http_etag text,                               -- cache: conditional GET (304)
  http_last_modified text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint integration_sources_no_paid_enabled check (not (is_paid and enabled))
);

drop trigger if exists integration_sources_set_updated_at on public.integration_sources;
create trigger integration_sources_set_updated_at
  before update on public.integration_sources
  for each row execute function public.set_updated_at();

-- 3. Kolom provenance / validasi pada opportunities ---------------------------
alter table public.opportunities
  add column if not exists organizer text,
  add column if not exists ecosystems text[] not null default '{}',
  add column if not exists skills text[] not null default '{}',
  add column if not exists starts_at timestamptz,
  add column if not exists cost_info text,
  add column if not exists reward_certainty text not null default 'unknown',
  add column if not exists review_state text not null default 'not_required',
  add column if not exists review_note text,
  add column if not exists import_method text not null default 'manual',
  add column if not exists source_id uuid references public.integration_sources (id) on delete set null,
  add column if not exists source_name text,
  add column if not exists canonical_url text,
  add column if not exists content_hash text,
  add column if not exists source_excerpt text,
  add column if not exists discovered_at timestamptz,
  add column if not exists last_checked_at timestamptz,
  add column if not exists source_changed_at timestamptz,
  add column if not exists risk_level text not null default 'low',
  add column if not exists risk_flags text[] not null default '{}',
  add column if not exists duplicate_of uuid references public.opportunities (id) on delete set null,
  add column if not exists ad_excluded boolean not null default false,
  add column if not exists expired_at timestamptz;

alter table public.opportunities drop constraint if exists opportunities_reward_certainty_check;
alter table public.opportunities add constraint opportunities_reward_certainty_check
  check (reward_certainty in ('guaranteed', 'competition', 'raffle', 'unconfirmed', 'unknown'));
alter table public.opportunities drop constraint if exists opportunities_review_state_check;
alter table public.opportunities add constraint opportunities_review_state_check
  check (review_state in ('not_required', 'pending', 'approved', 'rejected', 'changed'));
alter table public.opportunities drop constraint if exists opportunities_import_method_check;
alter table public.opportunities add constraint opportunities_import_method_check
  check (import_method in ('manual', 'rss', 'api'));
alter table public.opportunities drop constraint if exists opportunities_risk_level_check;
alter table public.opportunities add constraint opportunities_risk_level_check
  check (risk_level in ('low', 'medium', 'high'));

create index if not exists opportunities_canonical_url_idx on public.opportunities (canonical_url);
create index if not exists opportunities_review_state_idx on public.opportunities (review_state)
  where review_state in ('pending', 'changed');
create index if not exists opportunities_source_id_idx on public.opportunities (source_id);

-- 4. Riwayat sinkronisasi -------------------------------------------------------
create table if not exists public.import_runs (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.integration_sources (id) on delete cascade,
  trigger text not null check (trigger in ('cron', 'manual', 'test')),
  status text not null default 'running'
    check (status in ('running', 'success', 'partial', 'failed', 'skipped')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  found integer not null default 0,
  created integer not null default 0,
  updated integer not null default 0,
  published integer not null default 0,
  queued integer not null default 0,
  duplicates integer not null default 0,
  skipped integer not null default 0,
  errors integer not null default 0,
  requests integer not null default 0,
  error_message text,
  details jsonb not null default '{}'::jsonb
);

create index if not exists import_runs_started_idx on public.import_runs (started_at desc);
create index if not exists import_runs_source_idx on public.import_runs (source_id, started_at desc);

-- 5. Penggunaan API & kuota ----------------------------------------------------
create table if not exists public.api_usage (
  source_key text not null,
  day date not null,
  requests integer not null default 0,
  blocked integer not null default 0,
  primary key (source_key, day)
);

-- Atomik: kembalikan true dan catat bila kuota masih cukup; false (dan catat
-- "blocked") bila kuota harian/bulanan akan terlampaui. Zona waktu UTC.
create or replace function public.consume_api_quota(
  p_source_key text,
  p_daily integer,
  p_monthly integer,
  p_amount integer default 1
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_today date := (now() at time zone 'utc')::date;
  v_day integer;
  v_month integer;
begin
  perform pg_advisory_xact_lock(hashtext('api_usage:' || p_source_key));

  insert into public.api_usage (source_key, day) values (p_source_key, v_today)
  on conflict (source_key, day) do nothing;

  select requests into v_day from public.api_usage
  where source_key = p_source_key and day = v_today;

  select coalesce(sum(requests), 0) into v_month from public.api_usage
  where source_key = p_source_key and day >= date_trunc('month', v_today)::date;

  if (p_daily is not null and v_day + p_amount > p_daily)
     or (p_monthly is not null and v_month + p_amount > p_monthly) then
    update public.api_usage set blocked = blocked + 1
    where source_key = p_source_key and day = v_today;
    return false;
  end if;

  update public.api_usage set requests = requests + p_amount
  where source_key = p_source_key and day = v_today;
  return true;
end;
$$;

-- 6. Lock agar proses import tidak bertumpuk -----------------------------------
create table if not exists public.job_locks (
  name text primary key,
  holder text not null,
  locked_until timestamptz not null
);

create or replace function public.acquire_job_lock(p_name text, p_holder text, p_ttl_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_rows integer;
begin
  insert into public.job_locks as jl (name, holder, locked_until)
  values (p_name, p_holder, now() + make_interval(secs => p_ttl_seconds))
  on conflict (name) do update
    set holder = excluded.holder, locked_until = excluded.locked_until
    where jl.locked_until < now();
  get diagnostics v_rows = row_count;
  return v_rows > 0;
end;
$$;

create or replace function public.release_job_lock(p_name text, p_holder text)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.job_locks where name = p_name and holder = p_holder;
$$;

-- 7. Kedaluwarsa otomatis ---------------------------------------------------------
create or replace function public.expire_opportunities()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  update public.opportunities
     set state = 'expired', expired_at = now()
   where state = 'published'
     and deadline_at is not null
     and deadline_at < now();
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- Fungsi engine hanya untuk service role (server), bukan client.
revoke all on function public.consume_api_quota(text, integer, integer, integer) from public, anon, authenticated;
revoke all on function public.acquire_job_lock(text, text, integer) from public, anon, authenticated;
revoke all on function public.release_job_lock(text, text) from public, anon, authenticated;
revoke all on function public.expire_opportunities() from public, anon, authenticated;
grant execute on function public.consume_api_quota(text, integer, integer, integer) to service_role;
grant execute on function public.acquire_job_lock(text, text, integer) to service_role;
grant execute on function public.release_job_lock(text, text) to service_role;
grant execute on function public.expire_opportunities() to service_role;

-- 8. Pengaturan aplikasi & feature flag ---------------------------------------
create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

drop trigger if exists app_settings_set_updated_at on public.app_settings;
create trigger app_settings_set_updated_at
  before update on public.app_settings
  for each row execute function public.set_updated_at();

insert into public.app_settings (key, value) values
  ('automation_enabled', 'true'::jsonb),
  ('ai_enrichment_enabled', 'false'::jsonb),
  ('category_publish_modes', '{
     "airdrop":"manual","giveaway":"manual","bounty":"manual","contest":"manual",
     "jobs":"manual","hackathon":"manual","grants":"manual","testnet":"manual",
     "ambassador":"manual","paid_mission":"manual"}'::jsonb),
  ('expired_index_days', '30'::jsonb)
on conflict (key) do nothing;

create table if not exists public.feature_flags (
  key text primary key check (key ~ '^[a-z0-9_]{2,60}$'),
  enabled boolean not null default false,
  description text not null default '',
  updated_at timestamptz not null default now()
);

insert into public.feature_flags (key, enabled, description) values
  ('ads_enabled', false, 'Tampilkan unit AdSense (aktifkan hanya setelah disetujui Google).'),
  ('plus_enabled', false, 'CuanWeb3 Plus (Rp10.000/30 hari) — pembayaran belum aktif.'),
  ('plus_radar', false, 'Radar peluang berdasarkan minat dan skill.'),
  ('plus_notifications', false, 'Notifikasi peluang baru.'),
  ('plus_deadline_reminders', false, 'Pengingat deadline.'),
  ('plus_saved_filters', false, 'Filter peluang tersimpan.'),
  ('plus_recommendations', false, 'Rekomendasi peluang personal.'),
  ('plus_agenda', false, 'Agenda peluang pribadi.')
on conflict (key) do nothing;

-- 9. Fondasi Plus (tanpa pembayaran) ------------------------------------------
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  plan text not null default 'plus_30d' check (plan in ('plus_30d')),
  price_idr integer not null default 10000 check (price_idr >= 0),
  status text not null default 'pending'
    check (status in ('pending', 'active', 'expired', 'cancelled')),
  valid_from timestamptz,
  valid_to timestamptz,
  external_ref text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_user_idx on public.subscriptions (user_id, valid_to desc);

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- 10. RLS ------------------------------------------------------------------------
alter table public.integration_sources enable row level security;
alter table public.import_runs enable row level security;
alter table public.api_usage enable row level security;
alter table public.job_locks enable row level security;
alter table public.app_settings enable row level security;
alter table public.feature_flags enable row level security;
alter table public.subscriptions enable row level security;

revoke all on public.integration_sources, public.import_runs, public.api_usage,
  public.job_locks, public.app_settings, public.feature_flags, public.subscriptions
  from anon, authenticated;

-- Admin hanya boleh mengubah kolom operasional; is_paid, adapter, api_key_env,
-- dan kuota bawaan sumber berbayar tidak bisa diubah dari client.
grant select on public.integration_sources to authenticated;
grant update (enabled, default_category, categories, ecosystems, keyword_filter,
  interval_minutes, publish_mode, trusted, daily_quota, monthly_quota, next_run_at)
  on public.integration_sources to authenticated;
-- Admin boleh menambah sumber RSS gratis (adapter lain lewat migrasi/kode).
grant insert (key, name, adapter, kind, url, homepage_url, default_category, categories,
  ecosystems, keyword_filter, interval_minutes, daily_quota, monthly_quota)
  on public.integration_sources to authenticated;
grant select on public.import_runs, public.api_usage to authenticated;
grant select, update on public.app_settings to authenticated;
grant select on public.feature_flags to anon, authenticated;
grant update on public.feature_flags to authenticated;
grant select on public.subscriptions to authenticated;

drop policy if exists "integration_sources_admin_select" on public.integration_sources;
create policy "integration_sources_admin_select" on public.integration_sources
  for select to authenticated using ((select public.is_admin()));
drop policy if exists "integration_sources_admin_update" on public.integration_sources;
create policy "integration_sources_admin_update" on public.integration_sources
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "integration_sources_admin_insert_rss" on public.integration_sources;
create policy "integration_sources_admin_insert_rss" on public.integration_sources
  for insert to authenticated
  with check ((select public.is_admin()) and adapter = 'rss' and kind = 'rss');

drop policy if exists "import_runs_admin_select" on public.import_runs;
create policy "import_runs_admin_select" on public.import_runs
  for select to authenticated using ((select public.is_admin()));

drop policy if exists "api_usage_admin_select" on public.api_usage;
create policy "api_usage_admin_select" on public.api_usage
  for select to authenticated using ((select public.is_admin()));

drop policy if exists "app_settings_admin_select" on public.app_settings;
create policy "app_settings_admin_select" on public.app_settings
  for select to authenticated using ((select public.is_admin()));
drop policy if exists "app_settings_admin_update" on public.app_settings;
create policy "app_settings_admin_update" on public.app_settings
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "feature_flags_public_select" on public.feature_flags;
create policy "feature_flags_public_select" on public.feature_flags
  for select to anon, authenticated using (true);
drop policy if exists "feature_flags_admin_update" on public.feature_flags;
create policy "feature_flags_admin_update" on public.feature_flags
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own" on public.subscriptions
  for select to authenticated
  using ((select auth.uid()) = user_id or (select public.is_admin()));

-- 11. Sumber awal ---------------------------------------------------------------
-- Diverifikasi 2026-11-25: feed resmi berikut dapat diakses publik. Semua mulai
-- dengan publish_mode manual (masuk antrean review admin).
insert into public.integration_sources
  (key, name, adapter, kind, url, homepage_url, enabled, default_category, categories,
   ecosystems, keyword_filter, interval_minutes, trusted, requires_api_key, api_key_env,
   is_paid, cost_per_1k_requests_usd, daily_quota, monthly_quota, terms_note, status_note)
values
  ('ethereum_foundation_blog', 'Ethereum Foundation Blog', 'rss', 'rss',
   'https://blog.ethereum.org/feed.xml', 'https://blog.ethereum.org', true, 'grants',
   '{grants,hackathon,bounty,testnet}', '{ethereum}', true, 180, true, false, null,
   false, 0, 16, 500, 'Feed RSS resmi publik. Tampilkan ringkasan + link ke sumber.', null),
  ('sui_blog', 'Sui Blog', 'rss', 'rss',
   'https://blog.sui.io/rss/', 'https://blog.sui.io', true, 'grants',
   '{grants,hackathon,bounty,testnet,ambassador}', '{sui}', true, 180, true, false, null,
   false, 0, 16, 500, 'Feed RSS resmi publik.', null),
  ('aptos_labs_medium', 'Aptos Labs (Medium)', 'rss', 'rss',
   'https://medium.com/feed/aptoslabs', 'https://medium.com/aptoslabs', true, 'grants',
   '{grants,hackathon,bounty,testnet,ambassador}', '{aptos}', true, 180, true, false, null,
   false, 0, 16, 500, 'Feed RSS publik publikasi resmi Aptos Labs di Medium.', null),
  ('arbitrum_blog', 'Arbitrum Blog', 'rss', 'rss',
   'https://blog.arbitrum.io/rss/', 'https://blog.arbitrum.io', true, 'grants',
   '{grants,hackathon,bounty,ambassador}', '{arbitrum}', true, 180, true, false, null,
   false, 0, 16, 500, 'Feed RSS resmi publik.', null),
  ('base_blog', 'Base Blog', 'rss', 'rss',
   'https://www.base.org/blog/rss.xml', 'https://www.base.org/blog', true, 'grants',
   '{grants,hackathon,bounty,contest}', '{base}', true, 180, true, false, null,
   false, 0, 16, 500, 'Feed RSS resmi publik.', null),
  ('cryptocurrency_jobs', 'Cryptocurrency Jobs', 'rss', 'rss',
   'https://cryptocurrencyjobs.co/index.xml', 'https://cryptocurrencyjobs.co', true, 'jobs',
   '{jobs}', '{}', false, 180, true, false, null,
   false, 0, 16, 500, 'Feed RSS resmi situs. Selalu tautkan ke listing asli.', null),
  ('solana_news', 'Solana News', 'rss', 'rss',
   'https://solana.com/news/rss.xml', 'https://solana.com/news', false, 'grants',
   '{grants,hackathon,bounty,testnet}', '{solana}', true, 360, true, false, null,
   false, 0, 8, 250, 'Feed RSS resmi.', 'Nonaktif: server menolak (HTTP 429) saat diuji 2026-11-25. Coba aktifkan ulang dan tes koneksi.'),
  ('web3_career', 'Web3.Career Jobs API', 'web3career', 'api',
   'https://web3.career/api/v1', 'https://web3.career/web3-jobs-api', false, 'jobs',
   '{jobs}', '{}', false, 360, true, true, 'WEB3_CAREER_API_TOKEN',
   false, 0, 8, 200, 'API gratis dengan token. WAJIB link-back follow ke apply_url tanpa UTM; token per proyek.', 'Butuh token gratis dari web3.career (isi WEB3_CAREER_API_TOKEN di Vercel).'),
  ('devpost_hackathons', 'Devpost Hackathons', 'devpost', 'api',
   'https://devpost.com/api/hackathons', 'https://devpost.com/hackathons', false, 'hackathon',
   '{hackathon}', '{}', false, 360, false, false, null,
   false, 0, 8, 200, 'Endpoint JSON publik tetapi TIDAK terdokumentasi; ketentuan penggunaan belum terverifikasi.', 'Nonaktif sampai pemilik memverifikasi izin penggunaan dari Devpost.'),
  ('superteam_earn', 'Superteam Earn', 'none', 'api',
   'https://superteam.fun/earn', 'https://superteam.fun/earn', false, 'bounty',
   '{bounty,grants,hackathon}', '{solana}', false, 360, false, true, null,
   false, 0, 0, 0, 'Hanya Agent API (submit), tidak ada API publik resmi untuk membaca listing.', 'Belum ada adapter: tunggu API baca resmi atau izin tertulis.'),
  ('galxe', 'Galxe Quests', 'none', 'api',
   'https://docs.galxe.com', 'https://app.galxe.com', false, 'airdrop',
   '{airdrop,testnet}', '{}', false, 360, false, true, 'GALXE_API_TOKEN',
   false, 0, 0, 0, 'Integration API butuh token dari dashboard Galxe (akses space).', 'Belum ada adapter.'),
  ('brave_search', 'Brave Search API', 'none', 'api',
   'https://api.search.brave.com/res/v1/web/search', 'https://brave.com/search/api/', false, null,
   '{}', '{}', false, 1440, false, true, 'BRAVE_SEARCH_API_KEY',
   true, 5, 0, 0, 'Tidak ada paket gratis lagi (kredit $5/bulan, kartu kredit diperlukan, tagihan setelahnya).', 'Berbayar — dikunci nonaktif.'),
  ('coinmarketcap_airdrops', 'CoinMarketCap Airdrops API', 'none', 'api',
   'https://pro-api.coinmarketcap.com/v1/cryptocurrency/airdrops', 'https://coinmarketcap.com/api/pricing', false, 'airdrop',
   '{airdrop}', '{}', false, 1440, false, true, 'COINMARKETCAP_API_KEY',
   true, 0, 0, 0, 'Endpoint airdrops hanya untuk paket berbayar (Hobbyist ke atas).', 'Berbayar — dikunci nonaktif.')
on conflict (key) do nothing;
