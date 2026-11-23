-- Seed data contoh untuk pengembangan lokal. SEMUA baris berlabel "(Contoh)"
-- pada judul. Jangan jalankan di database produksi.
-- Jalankan setelah 0001_init.sql, mis. lewat `supabase db reset` (yang otomatis
-- menjalankan file ini) atau `psql -f supabase/seed.sql`.

insert into opportunities (
  slug, category, title, summary, content, reward_description,
  requirements, tags, country, deadline_at, published_at, verified_at,
  state, is_free
) values
  (
    'airdrop-komunitas-contoh', 'airdrop', 'Airdrop Komunitas (Contoh)',
    'Ikuti tugas sederhana di komunitas dan dapatkan reward token (simulasi).',
    'Ini adalah contoh listing airdrop untuk keperluan pengembangan. Langkah: (1) Bergabung ke komunitas resmi, (2) Selesaikan tugas sosial, (3) Hubungkan wallet pada platform resmi penyelenggara.',
    '±100-500 token (contoh, belum dikonfirmasi)',
    array['Wallet non-custodial', 'Akun X/Twitter aktif', 'Bergabung Discord'],
    array['pemula', 'tanpa-modal'], 'Global',
    now() + interval '45 days', now() - interval '5 days', now() - interval '2 days',
    'published', true
  ),
  (
    'giveaway-bounty-video-contoh', 'giveaway', 'Giveaway Bounty Video Edukasi Web3 (Contoh)',
    'Buat video singkat bertema Web3 (di bawah 3 menit) dan dapatkan reward.',
    'Contoh campaign giveaway bersama sponsor. Peserta membuat video edukasi singkat dan submit bukti melalui panel CuanWeb3 untuk direview admin.',
    'Rp250.000 (contoh)',
    array['Video orisinal', 'Durasi di bawah 3 menit', 'Mencantumkan hashtag resmi'],
    array['kreatif', 'video'], 'Indonesia',
    now() + interval '30 days', now() - interval '3 days', now() - interval '1 days',
    'published', true
  ),
  (
    'bounty-desain-poster-contoh', 'bounty', 'Bounty Desain Poster Komunitas (Contoh)',
    'Rancang poster promosi komunitas Web3 dan menangkan hadiah.',
    'Contoh bounty desain. Kirim karya melalui formulir submit resmi penyelenggara sebelum deadline.',
    'Rp500.000 untuk 3 pemenang (contoh)',
    array['Desain orisinal', 'Format PNG/JPG', 'Resolusi minimal 1080px'],
    array['desain', 'kreatif'], 'Indonesia',
    now() + interval '20 days', now() - interval '6 days', now() - interval '4 days',
    'published', true
  ),
  (
    'web3-community-staff-contoh', 'jobs', 'Web3 Community Staff (Contoh)',
    'Kesempatan kerja paruh waktu mendukung operasional komunitas.',
    'Contoh lowongan kerja Web3. Tanggung jawab meliputi moderasi komunitas dan koordinasi konten.',
    'Rp3.000.000 / bulan (contoh)',
    array['Pengalaman moderasi komunitas', 'Bahasa Indonesia & Inggris aktif'],
    array['remote', 'paruh-waktu'], 'Indonesia',
    now() + interval '29 days', now() - interval '7 days', now() - interval '3 days',
    'published', true
  ),
  (
    'hackathon-ide-ekosistem-contoh', 'hackathon', 'Hackathon Ide Ekosistem (Contoh)',
    'Kompetisi membangun prototipe produk Web3 bersama tim.',
    'Contoh hackathon dua tahap: ide dan prototipe. Tim terdiri dari 2-5 orang.',
    'Hadiah diumumkan menyusul (contoh)',
    array['Tim 2-5 orang', 'Prototipe berjalan', 'Presentasi demo'],
    array['tim', 'developer'], 'Global',
    now() + interval '45 days', now() - interval '10 days', now() - interval '5 days',
    'published', true
  ),
  (
    'grants-ekosistem-pemula-contoh', 'grants', 'Grants Ekosistem untuk Proyek Pemula (Contoh)',
    'Pendanaan tahap awal untuk proyek yang mendukung ekosistem.',
    'Contoh program grants. Proposal mencakup deskripsi proyek, milestone, dan anggaran. Tidak ada jaminan kelolosan.',
    'Dana bervariasi sesuai milestone (contoh)',
    array['Proposal tertulis', 'Milestone jelas', 'Tim aktif'],
    array['pendanaan'], 'Global',
    now() + interval '60 days', now() - interval '12 days', now() - interval '6 days',
    'published', true
  )
on conflict (slug) do nothing;

insert into articles (slug, title, summary, content, state, published_at) values
  (
    'dasar-keamanan-wallet', 'Dasar Keamanan Wallet Web3',
    'Panduan singkat menjaga wallet tetap aman sebelum mengikuti peluang Web3.',
    'Jangan pernah membagikan seed phrase atau private key ke siapa pun, termasuk ke "admin" yang menghubungi lewat DM. Gunakan wallet terpisah untuk mencoba airdrop berisiko. Selalu verifikasi URL resmi sebelum menghubungkan wallet.',
    'published', now() - interval '20 days'
  )
on conflict (slug) do nothing;

-- Untuk menjadikan user tertentu sebagai admin pertama, jalankan manual setelah
-- pengguna tersebut login minimal sekali (profil otomatis terbuat):
--   update profiles set is_admin = true where username = 'username-kamu';
