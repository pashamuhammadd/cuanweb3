import type { OpportunityCategory } from "@/lib/supabase/database.types";

/**
 * Spesifikasi per kategori: label yang tepat (Gaji vs Hadiah vs Nilai
 * pendanaan), field khusus kategori (disimpan di opportunities.details), dan
 * field WAJIB yang harus terisi sebelum listing boleh dipublikasikan otomatis.
 * Dipakai bersama oleh engine, halaman publik, dan admin.
 */

export type DetailKey =
  | "employment_type"
  | "work_mode"
  | "experience_level"
  | "job_function"
  | "task_type"
  | "winners_count"
  | "submission_format"
  | "selection_method"
  | "event_format"
  | "tracks"
  | "team_size"
  | "funding_type"
  | "project_stage"
  | "focus_area"
  | "eligibility_method"
  | "claim_method"
  | "network"
  | "commitment"
  | "program_duration"
  | "benefits"
  | "estimated_time"
  | "slots"
  | "payment_method";

export type DetailField = {
  key: DetailKey;
  label: string;
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
};

/** Field inti yang bisa diwajibkan. */
export type CoreField = "organizer" | "officialLink" | "deadline" | "startsAt" | "reward" | "location" | "description";
export type RequirementKey = CoreField | `details.${DetailKey}`;

export type CategorySpec = {
  labels: {
    reward: string;
    organizer: string;
    deadline: string;
    startsAt: string;
    requirements: string;
    location: string;
    cta: string;
  };
  details: DetailField[];
  /** Semua harus terisi agar boleh auto-publish. */
  required: RequirementKey[];
  /** Ditampilkan sebagai "sebaiknya dilengkapi", tidak memblokir. */
  recommended: RequirementKey[];
};

// ---------------------------------------------------------------- Opsi

const EMPLOYMENT_TYPES = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "contract", label: "Kontrak" },
  { value: "freelance", label: "Freelance" },
  { value: "internship", label: "Magang" },
];
const WORK_MODES = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "Di kantor (on-site)" },
];
const EXPERIENCE_LEVELS = [
  { value: "intern", label: "Magang / pemula" },
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Menengah" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead / Staff / Principal" },
  { value: "executive", label: "Head / Direktur / C-level" },
];
const TASK_TYPES = [
  { value: "development", label: "Development" },
  { value: "design", label: "Desain" },
  { value: "content", label: "Tulisan / konten" },
  { value: "video", label: "Video" },
  { value: "research", label: "Riset" },
  { value: "security", label: "Keamanan / audit" },
  { value: "community", label: "Komunitas / sosial" },
  { value: "other", label: "Lainnya" },
];
const EVENT_FORMATS = [
  { value: "online", label: "Online" },
  { value: "offline", label: "Offline (tatap muka)" },
  { value: "hybrid", label: "Hybrid" },
];
const SELECTION_METHODS = [
  { value: "raffle", label: "Undian" },
  { value: "judged", label: "Dipilih juri/penyelenggara" },
  { value: "first_come", label: "Siapa cepat dia dapat" },
  { value: "all_eligible", label: "Semua yang memenuhi syarat" },
];
const FUNDING_TYPES = [
  { value: "grant", label: "Hibah (tanpa ekuitas)" },
  { value: "milestone", label: "Bertahap per milestone" },
  { value: "retroactive", label: "Retroaktif (untuk karya yang sudah ada)" },
  { value: "rfp", label: "RFP / request for proposal" },
  { value: "research", label: "Riset / akademik" },
];
const PROJECT_STAGES = [
  { value: "idea", label: "Ide" },
  { value: "prototype", label: "Prototipe" },
  { value: "live", label: "Sudah live / mainnet" },
  { value: "any", label: "Semua tahap" },
];
const ELIGIBILITY_METHODS = [
  { value: "tasks", label: "Menyelesaikan tugas" },
  { value: "onchain", label: "Aktivitas on-chain" },
  { value: "snapshot", label: "Snapshot kepemilikan" },
  { value: "unknown", label: "Belum diumumkan" },
];

// ---------------------------------------------------------------- Spesifikasi

const BASE_LABELS = {
  organizer: "Penyelenggara",
  deadline: "Deadline",
  startsAt: "Mulai",
  requirements: "Syarat",
  location: "Lokasi / cakupan",
  cta: "Buka sumber resmi",
};

export const CATEGORY_SPECS: Record<OpportunityCategory, CategorySpec> = {
  jobs: {
    labels: {
      reward: "Gaji",
      organizer: "Perusahaan",
      deadline: "Batas lamaran",
      startsAt: "Mulai kerja",
      requirements: "Kualifikasi",
      location: "Lokasi kerja",
      cta: "Lamar di situs resmi",
    },
    details: [
      { key: "employment_type", label: "Jenis pekerjaan", options: EMPLOYMENT_TYPES },
      { key: "work_mode", label: "Mode kerja", options: WORK_MODES },
      { key: "experience_level", label: "Level pengalaman", options: EXPERIENCE_LEVELS },
      { key: "job_function", label: "Bidang", placeholder: "Engineering, Marketing, …" },
    ],
    required: ["organizer", "officialLink", "details.employment_type", "details.work_mode", "location"],
    recommended: ["reward", "details.experience_level"],
  },
  bounty: {
    labels: { ...BASE_LABELS, reward: "Hadiah bounty", organizer: "Pemberi bounty", deadline: "Batas submission", requirements: "Ruang lingkup & syarat" },
    details: [
      { key: "task_type", label: "Jenis tugas", options: TASK_TYPES },
      { key: "winners_count", label: "Jumlah pemenang", placeholder: "mis. 3 pemenang" },
      { key: "submission_format", label: "Format pengumpulan", placeholder: "mis. PR GitHub, link Figma" },
    ],
    required: ["organizer", "officialLink", "reward"],
    recommended: ["deadline", "details.task_type"],
  },
  contest: {
    labels: { ...BASE_LABELS, reward: "Total hadiah", deadline: "Batas pengumpulan karya", requirements: "Ketentuan lomba" },
    details: [
      { key: "submission_format", label: "Jenis karya", placeholder: "Meme, desain, video, tulisan…" },
      { key: "winners_count", label: "Jumlah pemenang", placeholder: "mis. 10 pemenang" },
      { key: "selection_method", label: "Cara penentuan pemenang", options: SELECTION_METHODS },
    ],
    required: ["organizer", "officialLink", "deadline"],
    recommended: ["reward", "details.selection_method"],
  },
  hackathon: {
    labels: { ...BASE_LABELS, reward: "Total hadiah (prize pool)", deadline: "Batas submission", startsAt: "Mulai", requirements: "Aturan peserta" },
    details: [
      { key: "event_format", label: "Format", options: EVENT_FORMATS },
      { key: "tracks", label: "Track / tema", placeholder: "DeFi, AI, Gaming…" },
      { key: "team_size", label: "Ukuran tim", placeholder: "mis. 1–5 orang" },
    ],
    required: ["organizer", "officialLink", "deadline"],
    recommended: ["reward", "details.event_format"],
  },
  grants: {
    labels: { ...BASE_LABELS, reward: "Nilai pendanaan", organizer: "Pemberi dana", deadline: "Batas pengajuan", requirements: "Kriteria" },
    details: [
      { key: "funding_type", label: "Jenis pendanaan", options: FUNDING_TYPES },
      { key: "project_stage", label: "Tahap proyek", options: PROJECT_STAGES },
      { key: "focus_area", label: "Fokus", placeholder: "Riset ZK, tooling, edukasi…" },
    ],
    required: ["organizer", "officialLink"],
    recommended: ["reward", "deadline", "details.funding_type"],
  },
  airdrop: {
    labels: { ...BASE_LABELS, reward: "Estimasi alokasi", organizer: "Proyek", deadline: "Batas klaim / snapshot", requirements: "Kriteria kelayakan" },
    details: [
      { key: "eligibility_method", label: "Cara memenuhi syarat", options: ELIGIBILITY_METHODS },
      { key: "network", label: "Jaringan", placeholder: "Ethereum, Solana…" },
      { key: "claim_method", label: "Cara klaim", placeholder: "Klaim di situs resmi proyek" },
    ],
    required: ["organizer", "officialLink", "details.eligibility_method"],
    recommended: ["deadline", "details.network"],
  },
  testnet: {
    labels: { ...BASE_LABELS, reward: "Potensi reward", organizer: "Proyek", deadline: "Testnet berakhir", startsAt: "Testnet dimulai", requirements: "Persyaratan teknis" },
    details: [
      { key: "network", label: "Jaringan testnet", placeholder: "mis. Hoodi, Sepolia" },
      { key: "task_type", label: "Jenis aktivitas", options: TASK_TYPES },
    ],
    required: ["organizer", "officialLink", "details.network"],
    recommended: ["startsAt", "deadline"],
  },
  ambassador: {
    labels: { ...BASE_LABELS, reward: "Kompensasi / benefit", organizer: "Program dari", deadline: "Batas pendaftaran", requirements: "Kriteria peserta" },
    details: [
      { key: "commitment", label: "Komitmen waktu", placeholder: "mis. 5 jam/minggu" },
      { key: "program_duration", label: "Durasi program", placeholder: "mis. 3 bulan" },
      { key: "benefits", label: "Benefit", placeholder: "Stipend, merchandise, akses event…" },
    ],
    required: ["organizer", "officialLink", "deadline"],
    recommended: ["details.commitment", "details.benefits"],
  },
  giveaway: {
    labels: { ...BASE_LABELS, reward: "Hadiah", deadline: "Batas ikut", requirements: "Cara ikut" },
    details: [
      { key: "winners_count", label: "Jumlah pemenang", placeholder: "mis. 50 pemenang" },
      { key: "selection_method", label: "Cara penentuan pemenang", options: SELECTION_METHODS },
    ],
    required: ["organizer", "officialLink", "reward", "deadline", "details.selection_method"],
    recommended: ["details.winners_count"],
  },
  paid_mission: {
    labels: { ...BASE_LABELS, reward: "Bayaran", organizer: "Pemberi misi", deadline: "Batas ambil misi", requirements: "Syarat peserta" },
    details: [
      { key: "estimated_time", label: "Estimasi waktu", placeholder: "mis. 30 menit" },
      { key: "slots", label: "Kuota peserta", placeholder: "mis. 100 slot" },
      { key: "payment_method", label: "Metode pembayaran", placeholder: "USDC, transfer bank…" },
    ],
    required: ["organizer", "officialLink", "reward", "details.estimated_time"],
    recommended: ["deadline", "details.slots"],
  },
};

export function getCategorySpec(category: OpportunityCategory): CategorySpec {
  return CATEGORY_SPECS[category];
}

/** Label tampilan untuk nilai detail (mis. "full_time" → "Full-time"). */
export function detailValueLabel(category: OpportunityCategory, key: DetailKey, value: string): string {
  const field = CATEGORY_SPECS[category].details.find((d) => d.key === key);
  return field?.options?.find((o) => o.value === value)?.label ?? value;
}

const CORE_LABEL_KEY: Record<CoreField, keyof CategorySpec["labels"] | null> = {
  organizer: "organizer",
  officialLink: null,
  deadline: "deadline",
  startsAt: "startsAt",
  reward: "reward",
  location: "location",
  description: null,
};

export function requirementLabel(category: OpportunityCategory, req: RequirementKey): string {
  const spec = CATEGORY_SPECS[category];
  if (req.startsWith("details.")) {
    const key = req.slice(8) as DetailKey;
    return spec.details.find((d) => d.key === key)?.label ?? key;
  }
  if (req === "officialLink") return "Link resmi";
  if (req === "description") return "Deskripsi";
  const labelKey = CORE_LABEL_KEY[req as CoreField];
  return labelKey ? spec.labels[labelKey] : req;
}

export type CompletenessInput = {
  organizer: string | null;
  externalUrl: string | null;
  deadlineAt: string | null;
  startsAt?: string | null;
  rewardValue?: number | null;
  rewardDescription?: string | null;
  country: string | null;
  description?: string | null;
  details: Partial<Record<DetailKey, string>>;
};

function isFilled(req: RequirementKey, input: CompletenessInput): boolean {
  if (req.startsWith("details.")) return Boolean(input.details[req.slice(8) as DetailKey]?.trim());
  switch (req) {
    case "organizer":
      return Boolean(input.organizer?.trim());
    case "officialLink":
      return Boolean(input.externalUrl);
    case "deadline":
      return Boolean(input.deadlineAt);
    case "startsAt":
      return Boolean(input.startsAt);
    case "reward":
      return input.rewardValue != null || Boolean(input.rewardDescription?.trim());
    case "location":
      return Boolean(input.country?.trim());
    case "description":
      return (input.description ?? "").trim().length >= 40;
    default:
      return false;
  }
}

/**
 * Kelengkapan sesuai kategori. `missingRequired` kosong = boleh auto-publish
 * (dari sisi kelengkapan). Skor = proporsi field wajib + disarankan yang terisi.
 */
export function assessCategoryCompleteness(category: OpportunityCategory, input: CompletenessInput) {
  const spec = CATEGORY_SPECS[category];
  const missingRequired = spec.required.filter((r) => !isFilled(r, input));
  const missingRecommended = spec.recommended.filter((r) => !isFilled(r, input));
  const total = spec.required.length + spec.recommended.length;
  const score = total === 0 ? 1 : (total - missingRequired.length - missingRecommended.length) / total;
  return { missingRequired, missingRecommended, score };
}
