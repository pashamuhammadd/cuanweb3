-- CuanWeb3 Opportunity Engine — penjadwalan dengan Supabase Cron (pg_cron + pg_net).
-- Jalankan SETELAH migrasi 0002 dan SETELAH deploy Vercel berisi /api/cron/opportunity-sync.
-- Aman dijalankan ulang: cron.schedule dengan nama yang sama memperbarui job lama.
--
-- LANGKAH 0 (sekali): simpan CRON_SECRET yang SAMA dengan env Vercel ke Vault.
-- Jalankan baris di bawah secara terpisah setelah mengganti nilainya, JANGAN
-- commit nilai asli ke Git:
--   select vault.create_secret('<CRON_SECRET-anda>', 'cuanweb3_cron_secret');
-- Untuk mengganti secret: select vault.update_secret(
--   (select id from vault.secrets where name = 'cuanweb3_cron_secret'), '<baru>');

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Sinkronisasi sumber setiap 3 jam (menit ke-7 agar tidak bentrok jam bulat).
-- Endpoint memeriksa sendiri sumber mana yang jatuh tempo, lock mencegah
-- proses bertumpuk, dan kuota per sumber dihitung di database.
select cron.schedule(
  'cuanweb3-opportunity-sync',
  '7 */3 * * *',
  $$
  select net.http_post(
    url := 'https://cuanweb3.com/api/cron/opportunity-sync',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        select decrypted_secret from vault.decrypted_secrets where name = 'cuanweb3_cron_secret'
      )
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000
  );
  $$
);

-- Tandai peluang yang lewat deadline sebagai "Berakhir" setiap jam (murni SQL,
-- tidak bergantung pada Vercel).
select cron.schedule(
  'cuanweb3-expire-opportunities',
  '15 * * * *',
  $$ select public.expire_opportunities(); $$
);

-- Cek jadwal:      select jobid, jobname, schedule, active from cron.job;
-- Cek hasil HTTP:  select id, status_code, left(content, 300), created
--                  from net._http_response order by created desc limit 10;
-- Hentikan:        select cron.unschedule('cuanweb3-opportunity-sync');
