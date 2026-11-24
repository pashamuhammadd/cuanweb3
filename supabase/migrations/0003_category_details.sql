-- CuanWeb3 — field khusus per kategori (jenis pekerjaan, mode kerja, format
-- hackathon, jenis pendanaan, dll). Aman dijalankan ulang.
-- Kunci yang valid didefinisikan di src/lib/category-specs.ts.

alter table public.opportunities
  add column if not exists details jsonb not null default '{}'::jsonb;

alter table public.opportunities drop constraint if exists opportunities_details_object_check;
alter table public.opportunities add constraint opportunities_details_object_check
  check (jsonb_typeof(details) = 'object' and pg_column_size(details) < 8192);
