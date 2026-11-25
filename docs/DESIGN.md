# Design system dan motion

Gunakan mockup references/ui-desktop-mobile.png sebagai acuan komposisi. Harga, deadline dan listing di mockup hanya ilustrasi. Palet: charcoal #0C1117, petrol teal #102B2B, gold #F4BD35, white #F5F5F5, teal accent #258C83. Surface sedikit lebih terang dari background, border teal/muted, teks sekunder tetap terbaca. Heading tebal geometris (mis. Bricolage Grotesque), body Geist atau Inter, angka market tabular. Gunakan font yang dapat dimuat secara lokal.

Desktop layout: header logo/nav/masuk/Plus, ticker market, hero CUA di rooftop, enam kategori (Airdrop, Giveaway, Bounty & Kontes, Web3 Jobs, Hackathon, Grants), filter dan feed peluang, panel Plus, misi berbayar, panduan, footer. Grid responsif; gunakan container max-width sekitar 1440px. Mobile: header ringkas, ticker scroll, hero ringkas, grid 3x2 kategori, card list, bottom navigation Beranda/Peluang/Market/Akun; safe-area inset. Jangan ada horizontal overflow selain ticker yang memang bisa di-scroll. Tambahkan kontrol pencarian dan filter kategori, skill, free/no modal, deadline.

## Motion specification
- Hero: layer ilustrasi bergeser kecil saat muncul (opacity + translate 12px), ambient parallax sangat halus hanya pada desktop pointer-capable; tidak menghalangi teks.
- Kartu: stagger entrance 40–60ms, hover lift maksimal 4px, durasi 180–240ms; tap feedback 100–150ms. Filter results crossfade singkat tanpa layout jump.
- Ticker: update angka dengan opacity transition dan arah warna, tidak berkilau atau berkedip; pause bila user menghendaki. Hindari live region spam untuk setiap harga.
- CUA: idle breathing/bob 2–4px dengan siklus 3–5 detik untuk aset transparan, celebratory motion hanya saat berhasil. PNG bukan rig animasi; jangan mendistorsi karakter. Animasi advanced dapat ditambahkan kelak.
- Navigasi: active indicator yang bergeser lembut; detail page fade/translate maksimal 200ms; drawer/dialog dengan focus trap dan restore focus.
- Loading: skeleton stabil, reserved image aspect ratios, toast untuk sukses/error, tombol disabled hanya ketika proses berlangsung.
- Reduced motion: hapus parallax, loop dan stagger saat prefers-reduced-motion: reduce; fungsi tetap berjalan. Animasi hanya transform/opacity sebisa mungkin. Lazy-load non-critical images, Next Image, responsive sizes, convert PNG ke WebP/AVIF bila aman sambil mempertahankan sumber asli.
- Target mobile 360–430px dan desktop 1280–1440px. Uji 360, 390, 768, 1024, 1440px, keyboard dan touch. Gunakan sedikit efek glow sebagai aksen, bukan efek berat pada semua kartu.

## Aset
Gunakan manifest ASSETS.md. Buat icon UI dengan icon library yang konsisten (misalnya Lucide) dan jangan gunakan gambar screenshot sebagai komponen. Logo sementara dapat dibuat dari teks CUAN (emas) WEB3 (putih) dengan ikon kepala CUA dari aset terpisah. Tampilkan alt yang bermakna pada gambar informatif dan alt kosong pada dekorasi.
