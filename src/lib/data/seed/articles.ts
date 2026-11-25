export type SeedArticle = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  publishedAt: string;
};

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export const SEED_ARTICLES: SeedArticle[] = [
  {
    id: "seed-article-1",
    slug: "dasar-keamanan-wallet",
    title: "Dasar Keamanan Wallet Web3",
    summary: "Panduan singkat menjaga wallet tetap aman sebelum mengikuti peluang Web3.",
    content:
      "Jangan pernah membagikan seed phrase atau private key ke siapa pun, termasuk ke \"admin\" yang menghubungi lewat DM.\n\nGunakan wallet terpisah untuk mencoba airdrop berisiko, dan selalu verifikasi URL resmi sebelum menghubungkan wallet ke situs mana pun.\n\nAktifkan autentikasi dua faktor pada email dan akun yang terhubung ke wallet kamu.",
    publishedAt: daysAgo(20),
  },
  {
    id: "seed-article-2",
    slug: "cara-mulai-ikut-airdrop",
    title: "Cara Mulai Ikut Airdrop dengan Aman",
    summary: "Langkah praktis untuk pemula sebelum mengikuti airdrop pertama.",
    content:
      "Pelajari proyek sebelum berpartisipasi: baca whitepaper, cek tim, dan cari tahu status audit jika ada.\n\nGunakan wallet eksplorasi terpisah dari wallet utama berisi aset besar.\n\nJangan membayar \"gas fee\" ke pihak yang tidak jelas untuk klaim airdrop — proyek resmi biasanya memakai smart contract transparan.",
    publishedAt: daysAgo(14),
  },
];
