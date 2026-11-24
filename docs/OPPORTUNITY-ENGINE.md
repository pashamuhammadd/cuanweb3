# CuanWeb3 Opportunity Engine

Sistem otomatis untuk mencari, mengolah, memvalidasi, dan mempublikasikan peluang Web3. Berjalan 24 jam di
infrastruktur Supabase + Vercel (tidak bergantung pada komputer pemilik) dengan **anggaran operasional Rp0**.

## Alur

```
Supabase Cron (tiap 3 jam) ──HTTP + secret──▶ Vercel /api/cron/opportunity-sync
                                                   │ lock (job_locks) — cegah proses bertumpuk
                                                   │ expire_opportunities() — deadline lewat → Berakhir
                                                   ▼
                 untuk tiap sumber aktif yang jatuh tempo (integration_sources)
   kuota (consume_api_quota) → adapter (RSS/API, retry+backoff, cache ETag/304)
   → normalisasi (kategori, ekosistem, skill, hadiah eksplisit, risiko, ringkasan ID)
   → validasi (deadline, kelengkapan, link) → deduplikasi (source+id, URL kanonik, judul mirip)
   → simpan ke opportunities: draft + antrean review  ATAU  published (bila lolos semua syarat auto)
   → catat import_runs + api_usage; update jadwal/backoff sumber
```

Kode: `src/lib/engine/` (modul murni + `runner.ts`), route `src/app/api/cron/opportunity-sync/route.ts`,
admin `src/app/admin/automation/*`, migrasi `supabase/migrations/0002_opportunity_engine.sql`, jadwal
`supabase/cron.sql`.

## Sumber data (riset 25 Nov 2026)

| Sumber | Status | Metode | Biaya / kuota | Catatan |
| --- | --- | --- | --- | --- |
| Ethereum Foundation Blog | **Aktif** | RSS resmi `blog.ethereum.org/feed.xml` | Gratis; batas internal 16/hari, 500/bulan | Filter kata kunci (grants, hackathon, testnet…) |
| Sui Blog | **Aktif** | RSS resmi `blog.sui.io/rss/` | Gratis; 16/hari | |
| Aptos Labs (Medium) | **Aktif** | RSS publik `medium.com/feed/aptoslabs` | Gratis; 16/hari | |
| Arbitrum Blog | **Aktif** | RSS resmi `blog.arbitrum.io/rss/` | Gratis; 16/hari | Saat diuji: 0 item relevan |
| Base Blog | **Aktif** | RSS resmi `base.org/blog/rss.xml` | Gratis; 16/hari | Saat diuji: 0 item relevan |
| Cryptocurrency Jobs | **Aktif** | RSS resmi `cryptocurrencyjobs.co/index.xml` | Gratis; 16/hari | 40 lowongan per fetch |
| Solana News | Nonaktif | RSS resmi | Gratis | Server membalas HTTP 429 saat diuji; aktifkan & tes ulang nanti |
| Web3.Career | Siap, butuh **token gratis** | API resmi `web3.career/api/v1` | Gratis; batas internal 8/hari | Wajib link-back *follow* ke `apply_url` tanpa UTM (sudah diterapkan) |
| Devpost | Nonaktif | Endpoint JSON publik **tidak terdokumentasi** | Gratis | Ketentuan belum bisa diverifikasi → butuh izin pemilik |
| Superteam Earn | Tidak ada adapter | Hanya *Agent API* (submit) | — | Tidak ada API baca listing resmi |
| Galxe | Tidak ada adapter | Integration API butuh token dashboard | — | Perlu akses Space |
| ETHGlobal, DoraHacks, Layer3 | Tidak diintegrasikan | Tidak ada API/feed publik resmi yang ditemukan | — | Scraping tidak dilakukan |
| Brave Search API | **Berbayar — dikunci** | API | Tidak ada paket gratis lagi (kredit $5/bulan, perlu kartu kredit) | Constraint DB melarang `enabled` bila `is_paid` |
| CoinMarketCap Airdrops | **Berbayar — dikunci** | API | Endpoint airdrop hanya paket Hobbyist+ | |

Batas kuota di atas adalah **batas internal** CuanWeb3 (bisa diubah admin) — RSS publik tidak punya kuota resmi,
jadi batas dipasang agar tetap sopan (1 request per sumber per 3 jam).

## Penjamin biaya Rp0

- `integration_sources_no_paid_enabled`: CHECK constraint — sumber `is_paid` tidak mungkin `enabled`.
- Admin tidak punya hak kolom untuk mengubah `is_paid`, `adapter`, atau `api_key_env`.
- Setiap request keluar melewati `consume_api_quota()` (atomik, per hari & per bulan, UTC); bila habis, request
  dihentikan dan dicatat sebagai *blocked*.
- Ringkasan & klasifikasi memakai aturan/template — **tanpa AI**. Flag `ai_enrichment_enabled` = false.

## Aturan konten (AdSense / hak cipta)

- Halaman publik memakai ringkasan & panduan **buatan CuanWeb3** (template berbahasa Indonesia) + tips keamanan
  per kategori; teks sumber hanya disimpan sebagai kutipan ≤280 karakter untuk admin.
- Nominal hadiah hanya diambil bila tertulis eksplisit di sumber (dengan kata konteks seperti *prize/grant/pool*).
  Field yang tidak ada → "Belum diketahui". Tidak ada tanggal/hadiah yang dikarang.
- Kepastian hadiah dibedakan: bayaran pasti, kompetisi, undian, belum dikonfirmasi, belum diketahui.
- Link sumber & tanggal terakhir dicek selalu ditampilkan.
- Peluang berakhir tetap bisa dibuka dengan label "Berakhir", lalu `noindex` setelah 30 hari dan keluar dari sitemap.
- Default **manual review**: tidak ada publikasi massal otomatis kecuali admin mengaktifkan mode auto untuk sumber
  DAN kategori.
- Iklan: `canShowAds()` mewajibkan flag `ads_enabled`, publisher ID, halaman tidak dikecualikan admin
  (`ad_excluded`), risiko rendah, dan bukan kategori tugas/klaim (giveaway, misi berbayar). Belum ada unit iklan
  terpasang. Integrasi ini **tidak menjamin** persetujuan AdSense.

## Validasi & deteksi risiko

Kandidat dilewati bila: link tidak valid, bukan peluang (filter kata kunci / pengumuman pemenang & rekap),
deadline sudah lewat, atau berita >45 hari tanpa deadline. Tanda risiko: meminta seed phrase/private key
(kalimat nasihat "never share…" dikecualikan), minta deposit untuk klaim, janji profit pasti, pemendek URL,
HTTP tanpa TLS, TLD berisiko, bahasa klaim mendesak. Risiko sedang/tinggi selalu masuk antrean review.

Auto-publish hanya bila **semua** terpenuhi: sumber mode auto + tepercaya, kategori mode auto, risiko rendah,
kelengkapan ≥60%, deadline belum lewat, link resmi merespons, tidak ada kemungkinan duplikat.

Perubahan di sumber terdeteksi lewat `content_hash`: draft diperbarui otomatis; listing tayang diberi status
review `changed` agar admin memeriksa.

## Fondasi Plus

Tabel `subscriptions` (Rp10.000 / 30 hari, tanpa pembayaran) + feature flag `plus_*` (semua mati) +
`hasPlusAccess()`. Radar, notifikasi, pengingat deadline, filter tersimpan, rekomendasi, dan agenda belum
dibangun — data peluang sudah memiliki `ecosystems`, `skills`, `deadline_at` yang dibutuhkan fitur tersebut.

## Menambah sumber baru

- **RSS resmi**: Admin → Automation → Sources → "Tambah sumber RSS" (masuk nonaktif + manual), Tes koneksi,
  lalu aktifkan.
- **API**: tulis adapter di `src/lib/engine/adapters/` yang mengembalikan `RawItem[]` dan memanggil
  `ctx.beforeRequest()` sebelum setiap request, daftarkan di `adapters/index.ts`, tambah baris
  `integration_sources` lewat migrasi. Token disimpan sebagai env server; tabel hanya menyimpan nama env-nya.

## Pengujian

- `pnpm test` — 40 unit test (parser RSS/Atom, Web3.Career, Devpost, klasifikasi, hadiah, risiko, dedupe,
  validasi & keputusan publish, gerbang kuota, retry/backoff, auth cron, open-redirect).
- `pnpm test:live` — mengambil 6 feed asli dan menjalankan normalisasi tanpa DB.
- Belum teruji otomatis: runner terhadap Postgres sungguhan (dilakukan setelah migrasi di Supabase — lihat
  PROGRESS.md).
