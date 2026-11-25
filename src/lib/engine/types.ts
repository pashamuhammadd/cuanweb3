import type { DetailKey, RequirementKey } from "@/lib/category-specs";
import type {
  IntegrationSourceRow,
  OpportunityCategory,
  RewardCertainty,
  RiskLevel,
} from "@/lib/supabase/database.types";

/** Item mentah dari sebuah adapter. Hanya berisi data yang benar-benar ada di sumber. */
export type RawItem = {
  externalId: string;
  title: string;
  url: string;
  publishedAt?: string | null;
  /** Teks/HTML deskripsi dari sumber (dipakai untuk klasifikasi, tidak ditampilkan utuh). */
  description?: string | null;
  organizer?: string | null;
  deadlineAt?: string | null;
  startsAt?: string | null;
  /** Teks hadiah/gaji apa adanya dari sumber, mis. "$10,000" atau "$120k - $150k". */
  rewardText?: string | null;
  location?: string | null;
  remote?: boolean | null;
  tags?: string[];
  /** Link aksi resmi bila berbeda dari url (mis. apply_url Web3.Career — wajib dipakai apa adanya). */
  applyUrl?: string | null;
  /** Kategori yang sudah pasti dari sumber terstruktur (mis. API jobs/hackathon). */
  categoryHint?: OpportunityCategory | null;
};

export type SourceConfig = Pick<
  IntegrationSourceRow,
  | "id"
  | "key"
  | "name"
  | "adapter"
  | "kind"
  | "url"
  | "homepage_url"
  | "enabled"
  | "default_category"
  | "categories"
  | "ecosystems"
  | "keyword_filter"
  | "interval_minutes"
  | "publish_mode"
  | "trusted"
  | "requires_api_key"
  | "api_key_env"
  | "is_paid"
  | "daily_quota"
  | "monthly_quota"
  | "http_etag"
  | "http_last_modified"
>;

export type FetchResult = {
  items: RawItem[];
  requests: number;
  /** true bila server membalas 304 (tidak ada perubahan sejak fetch terakhir). */
  notModified?: boolean;
  etag?: string | null;
  lastModified?: string | null;
};

export type AdapterContext = {
  /** Wajib dipanggil sebelum SETIAP request keluar; melempar QuotaExceededError bila kuota habis. */
  beforeRequest: () => Promise<void>;
  env: Record<string, string | undefined>;
  fetchImpl?: typeof fetch;
  /** Batas waktu absolut (epoch ms) untuk seluruh pekerjaan adapter. */
  deadline: number;
  /** true = abaikan cache HTTP (ETag/Last-Modified) agar item lama diproses ulang. */
  ignoreCache?: boolean;
};

export type SourceAdapter = {
  key: string;
  fetchItems(source: SourceConfig, ctx: AdapterContext): Promise<FetchResult>;
};

export class QuotaExceededError extends Error {
  constructor(sourceKey: string) {
    super(`Kuota gratis untuk sumber "${sourceKey}" sudah habis; request dihentikan.`);
    this.name = "QuotaExceededError";
  }
}

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

/** Kandidat peluang yang sudah dinormalisasi — siap divalidasi & disimpan. */
export type NormalizedCandidate = {
  externalId: string;
  title: string;
  organizer: string | null;
  category: OpportunityCategory;
  ecosystems: string[];
  skills: string[];
  tags: string[];
  summary: string;
  content: string;
  sourceExcerpt: string | null;
  rewardValue: number | null;
  rewardCurrency: string | null;
  rewardDescription: string | null;
  rewardType: string | null;
  rewardCertainty: RewardCertainty;
  deadlineAt: string | null;
  startsAt: string | null;
  requirements: string[];
  costInfo: string | null;
  isFree: boolean;
  country: string | null;
  externalUrl: string;
  sourceUrl: string;
  canonicalUrl: string;
  contentHash: string;
  riskLevel: RiskLevel;
  riskFlags: string[];
  /** Field khusus kategori (lihat category-specs). */
  details: Partial<Record<DetailKey, string>>;
  /** Field WAJIB kategori yang belum terisi — harus kosong untuk auto-publish. */
  missing: RequirementKey[];
  missingRecommended: RequirementKey[];
  completeness: number;
};
