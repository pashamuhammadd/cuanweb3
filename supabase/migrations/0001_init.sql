-- CuanWeb3 — Phase 1 (MVP) schema
-- Aman dijalankan ulang: setiap statement memakai IF NOT EXISTS / OR REPLACE.
-- RLS deny-by-default: setiap tabel mengaktifkan RLS dan hanya membuka akses
-- eksplisit lewat policy di bawah. Hak kolom sensitif (is_admin, status)
-- dikunci lewat column-level privileges, bukan hanya policy.

create extension if not exists "pgcrypto";

-- updated_at trigger helper ------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- profiles ------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  avatar_url text,
  skill_tags text[] not null default '{}',
  locale text not null default 'id',
  is_admin boolean not null default false,
  status text not null default 'active',
  notification_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint username_format check (username ~ '^[a-zA-Z0-9_-]{3,24}$')
);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Cek admin lewat SECURITY DEFINER agar policy tidak membaca `profiles` dari
-- dalam policy `profiles` sendiri (penyebab "infinite recursion detected").
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select p.is_admin from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

alter table public.profiles enable row level security;

-- Hak kolom: client hanya boleh menulis kolom non-sensitif.
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant insert (id, username, avatar_url, locale) on public.profiles to authenticated;
grant update (username, avatar_url, skill_tags, locale, notification_opt_in)
  on public.profiles to authenticated;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin" on public.profiles
  for select to authenticated
  using ((select public.is_admin()));

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated
  with check ((select auth.uid()) = id and is_admin = false);

-- opportunities ---------------------------------------------------------------
create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category text not null check (
    category in ('airdrop', 'giveaway', 'bounty', 'jobs', 'hackathon', 'grants')
  ),
  title text not null,
  summary text not null,
  content text not null default '',
  external_url text,
  source_url text,
  source_provider text,
  external_id text,
  reward_value numeric,
  reward_currency text,
  reward_description text,
  reward_type text,
  requirements text[] not null default '{}',
  tags text[] not null default '{}',
  country text,
  deadline_at timestamptz,
  published_at timestamptz,
  verified_at timestamptz,
  state text not null default 'draft' check (
    state in ('draft', 'published', 'expired', 'archived')
  ),
  image_path text,
  is_free boolean not null default true,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint opportunities_provider_external_id_unique
    unique (source_provider, external_id)
);

create index if not exists opportunities_category_state_idx
  on public.opportunities (category, state, published_at desc);
create index if not exists opportunities_deadline_idx on public.opportunities (deadline_at);

drop trigger if exists opportunities_set_updated_at on public.opportunities;
create trigger opportunities_set_updated_at
  before update on public.opportunities
  for each row execute function public.set_updated_at();

alter table public.opportunities enable row level security;

revoke all on public.opportunities from anon, authenticated;
grant select on public.opportunities to anon, authenticated;
grant insert, update, delete on public.opportunities to authenticated;

drop policy if exists "opportunities_select_published" on public.opportunities;
create policy "opportunities_select_published" on public.opportunities
  for select to anon, authenticated
  using (state = 'published');

drop policy if exists "opportunities_select_admin" on public.opportunities;
create policy "opportunities_select_admin" on public.opportunities
  for select to authenticated
  using ((select public.is_admin()));

drop policy if exists "opportunities_write_admin" on public.opportunities;
create policy "opportunities_write_admin" on public.opportunities
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- articles (Academy) -----------------------------------------------------------
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text not null,
  content text not null default '',
  cover_image_path text,
  state text not null default 'draft' check (
    state in ('draft', 'published', 'expired', 'archived')
  ),
  published_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists articles_set_updated_at on public.articles;
create trigger articles_set_updated_at
  before update on public.articles
  for each row execute function public.set_updated_at();

alter table public.articles enable row level security;

revoke all on public.articles from anon, authenticated;
grant select on public.articles to anon, authenticated;
grant insert, update, delete on public.articles to authenticated;

drop policy if exists "articles_select_published" on public.articles;
create policy "articles_select_published" on public.articles
  for select to anon, authenticated
  using (state = 'published');

drop policy if exists "articles_select_admin" on public.articles;
create policy "articles_select_admin" on public.articles
  for select to authenticated
  using ((select public.is_admin()));

drop policy if exists "articles_write_admin" on public.articles;
create policy "articles_write_admin" on public.articles
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- bookmarks ---------------------------------------------------------------------
create table if not exists public.bookmarks (
  user_id uuid not null references public.profiles (id) on delete cascade,
  opportunity_id uuid not null references public.opportunities (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, opportunity_id)
);

create index if not exists bookmarks_opportunity_idx on public.bookmarks (opportunity_id);

alter table public.bookmarks enable row level security;

revoke all on public.bookmarks from anon, authenticated;
grant select, insert, delete on public.bookmarks to authenticated;

drop policy if exists "bookmarks_select_own" on public.bookmarks;
create policy "bookmarks_select_own" on public.bookmarks
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "bookmarks_insert_own" on public.bookmarks;
create policy "bookmarks_insert_own" on public.bookmarks
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.opportunities o
      where o.id = opportunity_id and o.state = 'published'
    )
  );

drop policy if exists "bookmarks_delete_own" on public.bookmarks;
create policy "bookmarks_delete_own" on public.bookmarks
  for delete to authenticated
  using ((select auth.uid()) = user_id);
