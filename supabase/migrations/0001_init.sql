-- CuanWeb3 — Phase 1 (MVP) schema
-- Aman dijalankan ulang: setiap statement memakai IF NOT EXISTS / OR REPLACE.
-- RLS deny-by-default: setiap tabel mengaktifkan RLS dan hanya membuka akses
-- eksplisit lewat policy di bawah.

create extension if not exists "pgcrypto";

-- updated_at trigger helper ------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- profiles ------------------------------------------------------------------
create table if not exists profiles (
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

drop trigger if exists profiles_set_updated_at on profiles;
create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function set_updated_at();

alter table profiles enable row level security;

drop policy if exists "profiles_select_own" on profiles;
create policy "profiles_select_own" on profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_select_admin" on profiles;
create policy "profiles_select_admin" on profiles
  for select using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin)
  );

drop policy if exists "profiles_update_own" on profiles;
create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id and is_admin = false);

drop policy if exists "profiles_insert_own" on profiles;
create policy "profiles_insert_own" on profiles
  for insert with check (auth.uid() = id and is_admin = false);

-- opportunities ---------------------------------------------------------------
create table if not exists opportunities (
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
  created_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint opportunities_provider_external_id_unique
    unique (source_provider, external_id)
);

create index if not exists opportunities_category_state_idx
  on opportunities (category, state, published_at desc);
create index if not exists opportunities_deadline_idx on opportunities (deadline_at);

drop trigger if exists opportunities_set_updated_at on opportunities;
create trigger opportunities_set_updated_at
  before update on opportunities
  for each row execute function set_updated_at();

alter table opportunities enable row level security;

drop policy if exists "opportunities_select_published" on opportunities;
create policy "opportunities_select_published" on opportunities
  for select using (state = 'published');

drop policy if exists "opportunities_select_admin" on opportunities;
create policy "opportunities_select_admin" on opportunities
  for select using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin)
  );

drop policy if exists "opportunities_write_admin" on opportunities;
create policy "opportunities_write_admin" on opportunities
  for all using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin)
  )
  with check (
    exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin)
  );

-- articles (Academy) -----------------------------------------------------------
create table if not exists articles (
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
  created_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists articles_set_updated_at on articles;
create trigger articles_set_updated_at
  before update on articles
  for each row execute function set_updated_at();

alter table articles enable row level security;

drop policy if exists "articles_select_published" on articles;
create policy "articles_select_published" on articles
  for select using (state = 'published');

drop policy if exists "articles_select_admin" on articles;
create policy "articles_select_admin" on articles
  for select using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin)
  );

drop policy if exists "articles_write_admin" on articles;
create policy "articles_write_admin" on articles
  for all using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin)
  )
  with check (
    exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin)
  );

-- bookmarks ---------------------------------------------------------------------
create table if not exists bookmarks (
  user_id uuid not null references profiles (id) on delete cascade,
  opportunity_id uuid not null references opportunities (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, opportunity_id)
);

alter table bookmarks enable row level security;

drop policy if exists "bookmarks_select_own" on bookmarks;
create policy "bookmarks_select_own" on bookmarks
  for select using (auth.uid() = user_id);

drop policy if exists "bookmarks_insert_own" on bookmarks;
create policy "bookmarks_insert_own" on bookmarks
  for insert with check (auth.uid() = user_id);

drop policy if exists "bookmarks_delete_own" on bookmarks;
create policy "bookmarks_delete_own" on bookmarks
  for delete using (auth.uid() = user_id);
