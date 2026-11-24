import { CATEGORY_LABELS, ecosystemLabel } from "@/lib/categories";
import type { OpportunityCategory, RewardCertainty } from "@/lib/supabase/database.types";

const ID_DATE = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

function formatReward(value: number | null, currency: string | null): string | null {
  if (value == null || !currency) return null;
  const n = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(value);
  return currency === "USD" ? `US$${n}` : `${n} ${currency}`;
}

export type SummaryInput = {
  category: OpportunityCategory;
  title: string;
  organizer: string | null;
  ecosystems: string[];
  rewardValue: number | null;
  rewardCurrency: string | null;
  rewardCertainty: RewardCertainty;
  deadlineAt: string | null;
  location: string | null;
  remote: boolean | null;
  skills: string[];
  sourceName: string;
};

/**
 * Ringkasan singkat berbahasa Indonesia dari data terstruktur. Tidak menyalin
 * teks sumber — hanya fakta yang sudah diekstrak + kata "belum diketahui".
 */
export function buildSummary(input: SummaryInput): string {
  const label = CATEGORY_LABELS[input.category];
  const who = input.organizer ? ` dari ${input.organizer}` : "";
  const eco = input.ecosystems.length ? ` di ekosistem ${input.ecosystems.map(ecosystemLabel).join(", ")}` : "";
  const reward = formatReward(input.rewardValue, input.rewardCurrency);
  const rewardText =
    input.category === "jobs"
      ? reward
        ? `Kompensasi disebut sekitar ${reward}.`
        : "Kompensasi belum diketahui."
      : reward
        ? `Nilai hadiah yang disebut sumber: ${reward}.`
        : "Nilai hadiah belum diketahui.";
  const deadline = input.deadlineAt ? `Deadline ${ID_DATE.format(new Date(input.deadlineAt))}.` : "Deadline belum diketahui.";
  return `${label}${who}${eco}. ${rewardText} ${deadline}`.replace(/\s+/g, " ").trim().slice(0, 300);
}

const CATEGORY_TIPS: Record<OpportunityCategory, string[]> = {
  airdrop: [
    "Airdrop tidak pernah dijamin. Ikuti hanya lewat situs dan akun resmi proyek.",
    "Gunakan wallet terpisah untuk aktivitas airdrop dan jangan pernah memberikan seed phrase.",
  ],
  giveaway: [
    "Pastikan giveaway diumumkan dari akun resmi penyelenggara.",
    "Penyelenggara asli tidak meminta transfer dana atau seed phrase untuk mengirim hadiah.",
  ],
  bounty: [
    "Baca ruang lingkup (scope) dan aturan pengumpulan sebelum mulai mengerjakan.",
    "Hadiah biasanya hanya untuk submission yang diterima penyelenggara.",
  ],
  contest: [
    "Periksa format karya, aturan hak cipta, dan cara penjurian di halaman resmi.",
    "Hadiah kompetisi hanya untuk pemenang yang dipilih penyelenggara.",
  ],
  jobs: [
    "Lamar hanya lewat link resmi. Perusahaan asli tidak meminta biaya untuk melamar.",
    "Cek lokasi/remote, zona waktu, dan jenis kontrak di halaman lowongan.",
  ],
  hackathon: [
    "Cek track, aturan tim, tanggal pengumpulan, dan kriteria penilaian di situs resmi.",
    "Siapkan repositori, demo, dan presentasi singkat sebelum deadline.",
  ],
  grants: [
    "Baca prioritas program dan contoh proposal yang diterima sebelum mengajukan.",
    "Siapkan milestone, anggaran, dan demo. Grant tidak dijamin lolos.",
  ],
  testnet: [
    "Testnet umumnya tidak menjamin reward. Jangan gunakan aset mainnet untuk tugas testnet.",
    "Gunakan faucet resmi dan wallet terpisah.",
  ],
  ambassador: [
    "Pahami kewajiban (konten, event, komunitas) dan bentuk apresiasi di halaman resmi.",
    "Program resmi tidak meminta pembayaran untuk bergabung.",
  ],
  paid_mission: [
    "Cek estimasi waktu, jumlah bayaran, dan cara pembayaran langsung di sumber resmi.",
    "Waspadai misi yang meminta deposit atau data sensitif.",
  ],
};

export function buildContent(input: SummaryInput & { requirements: string[]; costInfo: string | null }): string {
  const lines: string[] = [];
  lines.push(`Peluang ini ditemukan otomatis dari ${input.sourceName} dan dirangkum oleh CuanWeb3. Selalu baca informasi lengkap di link resmi.`);
  const facts: string[] = [];
  if (input.organizer) facts.push(`Penyelenggara: ${input.organizer}`);
  if (input.ecosystems.length) facts.push(`Ekosistem: ${input.ecosystems.map(ecosystemLabel).join(", ")}`);
  if (input.location || input.remote != null) {
    facts.push(`Lokasi: ${[input.remote ? "Remote" : null, input.location].filter(Boolean).join(" · ") || "Belum diketahui"}`);
  }
  if (input.skills.length) facts.push(`Skill terkait: ${input.skills.join(", ")}`);
  facts.push(`Biaya/modal: ${input.costInfo ?? "Belum diketahui — cek di sumber resmi"}`);
  lines.push(facts.join("\n"));
  lines.push(`Tips CuanWeb3:\n${CATEGORY_TIPS[input.category].map((t) => `• ${t}`).join("\n")}`);
  return lines.join("\n\n");
}
