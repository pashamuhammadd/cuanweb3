# Aturan kerja CuanWeb3

- Bahasa UI, dokumentasi pengguna, dan laporan progres: Indonesia. Nama kode dan identifier teknis boleh Inggris.
- Referensi utama branding: references/cua-official.png dan references/ui-desktop-mobile.png. Pertahankan CUA rubah fennec emas, hoodie teal logo C, celana cargo charcoal, sneakers emas/teal. Jangan meniru identitas Slushy atau Nimia.
- Gunakan Next.js App Router, TypeScript strict, Tailwind, Supabase, pnpm. Pilih versi kompatibel dan lihat dokumentasi resmi sebelum mengintegrasikan provider.
- Implementasi fitur end-to-end; jangan menyembunyikan tombol palsu atau status pembayaran palsu di produksi. Data demo hanya untuk pengembangan dan diberi label.
- Ikuti docs/PRODUCT.md, docs/DESIGN.md, docs/ARCHITECTURE.md, docs/ROADMAP.md. Jika ada konflik, utamakan instruksi terbaru pemilik.
- Layanan dan pesanan aset kreatif custom dikelola privat oleh Nimia Studio. CuanWeb3 hanya menampilkan peluang publik, kampanye sponsor dan misi komunitas.
- Jangan meminta seed phrase atau private key. Simpan secret server-side, gunakan env variables, validasi input, verifikasi role dan ownership di server, RLS deny-by-default, dan rate limiting.
- Jangan membuat transaksi keuangan riil, mengaktifkan kampanye undian produksi atau memublikasikan situs tanpa otorisasi pemilik. Gunakan mode pengujian dan fitur flag.
- Tetap bekerja secara bertahap, lapor hasil terverifikasi, jangan mengklaim selesai bila ada alur belum berfungsi. Periksa lint, typecheck, build dan alur pengguna untuk setiap milestone.
- Jangan mengubah atau menghapus file terkait pekerjaan pengguna tanpa alasan yang diperlukan. Pastikan perubahan dapat direview dan migrasi data aman.
- Aksesibilitas: keyboard, focus visible, label input, kontras, target sentuh nyaman, prefers-reduced-motion. Gunakan HTML semantik.
