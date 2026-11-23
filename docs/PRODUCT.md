# Product requirements

## Visi
CuanWeb3.com membantu masyarakat Indonesia menemukan peluang penghasilan Web3. Basis awal adalah grup Facebook Komunitas Cuan Web3 dengan sekitar 53,1 ribu anggota. Target 70% peluang cuan, 30% pembelajaran praktis. Tagline: Temukan peluang. Raih cuan.

## Akun dan aktivitas
Pengunjung boleh membaca listing publik, harga dan artikel. Login wajib untuk mengikuti campaign internal, menyimpan peluang, klaim hadiah, mengelola profil dan membuka alur partisipasi eksternal dari situs. Pendaftaran eksternal tetap mengikuti aturan penyelenggara. Google OAuth, satu akun Google unik (provider subject) per akun CuanWeb3; username unik, minat, skill, avatar, preferensi notifikasi. Cegah satu akun berpartisipasi dua kali pada satu campaign. Deteksi duplikasi bukti dan tujuan pembayaran secara proporsional serta review manual; sediakan mekanisme banding. Jangan mengklaim OAuth membuktikan satu orang hanya memiliki satu akun Google.

## Modul utama
- Market: daftar BTC, ETH, SOL, BNB dan aset lain dari provider data pasar resmi jika tersedia, perubahan 24 jam, harga USD/IDR, waktu pembaruan dan stale/error states. Provider opsional; jangan menampilkan harga demo sebagai live.
- Airdrop: sumber resmi, eligibility, chain, deadline, estimasi reward bila diumumkan, langkah, status, biaya/modal bila ada, risiko wallet, tanggal verifikasi. Bedakan reward pasti dan belum dikonfirmasi.
- Giveaway: campaign buatan admin bersama sponsor, task checklist, bukti, verifikasi, deadline, eligible entries, pengundian transparan dan hasil. Gratis, satu kesempatan per campaign per peserta terverifikasi. Aktivasi undian produksi setelah pemilik mengonfirmasi persyaratan setempat dan platform task. Hindari engagement artifisial atau tugas klik iklan.
- Bounty & Kontes: meme, video, desain, tulisan, developer, lain-lain. Syarat, hadiah, jumlah pemenang, format, deadline, sumber, link submit, tutorial. Semua kontes eksternal dibuka lewat sumber asli.
- Web3 Jobs: judul, perusahaan, skill, jenis kerja, remote/lokasi, kompensasi jika tersedia, link apply resmi.
- Hackathon: kategori, tahap, tim, hadiah, tanggal dan link resmi; fitur cari tim pada fase lanjutan.
- Grants: ekosistem, persyaratan, tahap proyek, dana jika diumumkan, link resmi, panduan proposal, milestone, demo dan anggaran; tanpa menjanjikan kelolosan.
- Misi berbayar: panel tester produk/game, feedback terstruktur, slot, jumlah bayaran, estimasi waktu, review dan pembayaran sponsor. Slot reservasi atomik, expire/release; reward dibayar hanya kepada peserta dengan slot sah dan hasil diterima.
- Academy: panduan singkat dan praktis di halaman peluang, artikel publik, kuis opsional. Dasar Web3 dan keamanan wallet. Jangan paksa kelas sebelum ikut peluang.
- Community: diskusi, agenda, cari tim, bedah pengalaman pemenang. Moderasi dan report.

## Admin
CRUD listing seluruh kategori, draft/published/expired/archived, preview, search, filters, sponsor, pengelolaan campaign dan peserta, submission review/revisi, ledger hadiah dan bukti pembayaran, artikel, pengaturan iklan, akses Plus, audit trail. Admin dapat mengedit hasil import sebelum publish, menghapus duplikat, menandai verified_at, dan memperbarui sumber. Gunakan arsip untuk data historis berhubungan transaksi.

## Monetisasi
AdSense milik pemilik; pasang unit manual di artikel/halaman publik yang memenuhi kebijakan Google dan setelah disetujui. Jangan memberi reward untuk melihat/klik iklan, jangan menempatkan iklan dekat task atau klaim; jangan mengada-adakan publisher ID. Sponsor banner berlabel jelas. Giveaway dan misi sponsor menggunakan 40% fee kotor platform, 60% dana hadiah sebagai default konfigurabel sebelum campaign tayang. Tampilkan rincian dan simpan snapshot anggaran, dana diterima, reward terbayar, status dan biaya secara konsisten. Jangan gunakan hadiah dari pelanggan Plus.

## Free dan Plus (rancangan, belum final)
Free: semua peluang publik, daftar giveaway, misi, profil dasar, simpan peluang. Plus Rp10.000/30 hari: fitur flag, halaman Radar Peluang Pribadi, pengingat deadline, agenda, filter profil tersimpan, checklist/templates. Pembayaran dan daftar manfaat final menunggu arahan pemilik. Plus tidak mengubah peluang menang giveaway. Jangan aktifkan billing produksi tanpa persetujuan. Hindari janji return atau pendapatan pasti.
