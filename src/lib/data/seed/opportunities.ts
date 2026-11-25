import type { Opportunity } from "@/types/opportunity";

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function daysAgo(days: number): string {
  return daysFromNow(-days);
}

/**
 * Data contoh untuk mode pengembangan (Supabase belum dikonfigurasi) dan untuk
 * seed database saat setup lokal. Semua item berlabel isDemo: true dan harus
 * ditampilkan dengan badge "Contoh" di UI — bukan peluang nyata.
 */
export const SEED_OPPORTUNITIES: Opportunity[] = [
  {
    id: "seed-airdrop-1",
    slug: "airdrop-komunitas-contoh",
    category: "airdrop",
    title: "Airdrop Komunitas (Contoh)",
    summary: "Ikuti tugas sederhana di komunitas dan dapatkan reward token (simulasi).",
    content:
      "Ini adalah contoh listing airdrop untuk keperluan pengembangan. Langkah: (1) Bergabung ke komunitas resmi, (2) Selesaikan tugas sosial, (3) Hubungkan wallet pada platform resmi penyelenggara. Reward belum dikonfirmasi oleh proyek, jangan dianggap sebagai jaminan.",
    externalUrl: null,
    sourceUrl: null,
    rewardValue: null,
    rewardCurrency: null,
    rewardDescription: "±100-500 token (contoh, belum dikonfirmasi)",
    requirements: ["Wallet non-custodial", "Akun X/Twitter aktif", "Bergabung Discord"],
    tags: ["pemula", "tanpa-modal"],
    country: "Global",
    deadlineAt: daysFromNow(69),
    verifiedAt: daysAgo(2),
    publishedAt: daysAgo(5),
    isFree: true,
    isDemo: true,
  },
  {
    id: "seed-giveaway-1",
    slug: "giveaway-bounty-video-contoh",
    category: "giveaway",
    title: "Giveaway Bounty Video Edukasi Web3 (Contoh)",
    summary: "Buat video singkat bertema Web3 (di bawah 3 menit) dan dapatkan reward.",
    content:
      "Contoh campaign giveaway bersama sponsor. Peserta membuat video edukasi singkat, mengunggah ke platform yang ditentukan, lalu submit bukti melalui panel CuanWeb3 untuk direview admin. Satu kesempatan per peserta terverifikasi.",
    externalUrl: null,
    sourceUrl: null,
    rewardValue: 250000,
    rewardCurrency: "IDR",
    rewardDescription: "Rp250.000 (contoh)",
    requirements: ["Video orisinal", "Durasi di bawah 3 menit", "Mencantumkan hashtag resmi"],
    tags: ["kreatif", "video"],
    country: "Indonesia",
    deadlineAt: daysFromNow(74),
    verifiedAt: daysAgo(1),
    publishedAt: daysAgo(3),
    isFree: true,
    isDemo: true,
  },
  {
    id: "seed-bounty-1",
    slug: "bounty-desain-poster-contoh",
    category: "bounty",
    title: "Bounty Desain Poster Komunitas (Contoh)",
    summary: "Rancang poster promosi komunitas Web3 dan menangkan hadiah.",
    content:
      "Contoh bounty desain. Kirim karya dalam format PNG/JPG melalui formulir submit resmi penyelenggara sebelum deadline. Pemenang dipilih berdasarkan voting komunitas dan kurasi tim.",
    externalUrl: null,
    sourceUrl: null,
    rewardValue: 500000,
    rewardCurrency: "IDR",
    rewardDescription: "Rp500.000 untuk 3 pemenang (contoh)",
    requirements: ["Desain orisinal", "Format PNG/JPG", "Resolusi minimal 1080px"],
    tags: ["desain", "kreatif"],
    country: "Indonesia",
    deadlineAt: daysFromNow(20),
    verifiedAt: daysAgo(4),
    publishedAt: daysAgo(6),
    isFree: true,
    isDemo: true,
  },
  {
    id: "seed-jobs-1",
    slug: "web3-community-staff-contoh",
    category: "jobs",
    title: "Web3 Community Staff (Contoh)",
    summary: "Kesempatan kerja paruh waktu mendukung operasional komunitas.",
    content:
      "Contoh lowongan kerja Web3. Tanggung jawab meliputi moderasi komunitas, menyusun agenda AMA, dan koordinasi dengan tim konten. Pelamar diarahkan ke tautan resmi penyelenggara.",
    externalUrl: null,
    sourceUrl: null,
    rewardValue: 3000000,
    rewardCurrency: "IDR",
    rewardDescription: "Rp3.000.000 / bulan (contoh)",
    requirements: ["Pengalaman moderasi komunitas", "Bahasa Indonesia & Inggris aktif"],
    tags: ["remote", "paruh-waktu"],
    country: "Indonesia",
    deadlineAt: daysFromNow(29),
    verifiedAt: daysAgo(3),
    publishedAt: daysAgo(7),
    isFree: true,
    isDemo: true,
  },
  {
    id: "seed-hackathon-1",
    slug: "hackathon-ide-ekosistem-contoh",
    category: "hackathon",
    title: "Hackathon Ide Ekosistem (Contoh)",
    summary: "Kompetisi membangun prototipe produk Web3 bersama tim.",
    content:
      "Contoh hackathon dua tahap: ide dan prototipe. Tim terdiri dari 2-5 orang. Pendaftaran dan submission dilakukan melalui platform resmi penyelenggara.",
    externalUrl: null,
    sourceUrl: null,
    rewardValue: null,
    rewardCurrency: null,
    rewardDescription: "Hadiah diumumkan menyusul (contoh)",
    requirements: ["Tim 2-5 orang", "Prototipe berjalan", "Presentasi demo"],
    tags: ["tim", "developer"],
    country: "Global",
    deadlineAt: daysFromNow(45),
    verifiedAt: daysAgo(5),
    publishedAt: daysAgo(10),
    isFree: true,
    isDemo: true,
  },
  {
    id: "seed-grants-1",
    slug: "grants-ekosistem-pemula-contoh",
    category: "grants",
    title: "Grants Ekosistem untuk Proyek Pemula (Contoh)",
    summary: "Pendanaan tahap awal untuk proyek yang mendukung ekosistem.",
    content:
      "Contoh program grants. Proposal mencakup deskripsi proyek, milestone, dan anggaran. Tidak ada jaminan kelolosan. Proses review dilakukan oleh tim penyelenggara resmi.",
    externalUrl: null,
    sourceUrl: null,
    rewardValue: null,
    rewardCurrency: null,
    rewardDescription: "Dana bervariasi sesuai milestone (contoh)",
    requirements: ["Proposal tertulis", "Milestone jelas", "Tim aktif"],
    tags: ["pendanaan"],
    country: "Global",
    deadlineAt: daysFromNow(60),
    verifiedAt: daysAgo(6),
    publishedAt: daysAgo(12),
    isFree: true,
    isDemo: true,
  },
];
