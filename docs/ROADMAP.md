# Roadmap dan acceptance

## Phase 1 — MVP
Bangun home, responsive UI, enam kategori listing, SEO detail, market adapter dan fallback, Google auth, profil, bookmarks, admin CRUD dan article editor. Buat migrasi, seed data demo berlabel, loading/error/empty states, role dan RLS. Admin bisa membuat dan publish listing, pengguna bisa membaca, login dan menyimpan. Uji akses member dan admin. Market menampilkan data aktual hanya bila provider dikonfigurasi; status dan timestamp jelas.

## Phase 2 — Campaign sponsor
Sponsor, campaign funding/admin, task checklist, entry unique, review, state transitions, eligibility, simulasi draw audit dan payout ledger. Uji duplicate entries, deadline, re-submit, biaya/anggaran, concurrency. Aktifkan produksi setelah owner menyetujui legal/partner/payment setup. Dana hadiah harus tersedia sebelum campaign dibuka.

## Phase 3 — Misi dan komunitas
Slot reservasi/waitlist, panel tester, feedback, review, pembayaran terkontrol, komunitas dan moderasi, penemuan tim hackathon, notifikasi opt-in, agenda. Pastikan misi dan reward transparan.

## Phase 4 — Plus & monetisasi
Validasi manfaat Plus dengan pemilik, implementasi entitlement dan akses Rp10.000/30 hari, sandbox pembayaran yang idempotent, expiry, cancellation/renewal dengan transparansi. AdSense manual di halaman konten terverifikasi, tidak dipasang pada alur task/reward, tidak memancing klik. Sponsor banner langsung dengan label. Tracking conversion agregat dan privacy policy sesuai implementasi.

## Phase 5 — Integrasi dan skalabilitas
Adapter sumber yang diizinkan, import drafts, deduplication, monitoring, cron, analytics agregat, backup/restore, performa mobile dan aksesibilitas. Jangan mengikat MVP pada API yang belum tersedia.

## Definition of done setiap fase
Fungsional end-to-end pada jalur normal, responsif, akses server benar, lint/typecheck/build lulus, smoke tests sesuai fase. Uji mobile/desktop, keyboard/reduced-motion. Catat implementasi, asumsi, blocker aktual, konfigurasi manual dan langkah verifikasi. Jangan mengklaim fitur vendor aktif tanpa kredensial dan hasil pengujian nyata.
