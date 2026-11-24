import type {
  ImportMethod,
  OpportunityCategory,
  OpportunityRow,
  OpportunityState,
  RewardCertainty,
  RiskLevel,
} from "@/lib/supabase/database.types";

export type { OpportunityCategory };

export type Opportunity = {
  id: string;
  slug: string;
  category: OpportunityCategory;
  title: string;
  summary: string;
  content: string;
  externalUrl: string | null;
  sourceUrl: string | null;
  rewardValue: number | null;
  rewardCurrency: string | null;
  rewardDescription: string | null;
  requirements: string[];
  tags: string[];
  country: string | null;
  deadlineAt: string | null;
  verifiedAt: string | null;
  publishedAt: string | null;
  isFree: boolean;
  isDemo: boolean;
  // Field Opportunity Engine — opsional agar seed data lama tetap valid.
  state?: OpportunityState;
  organizer?: string | null;
  ecosystems?: string[];
  skills?: string[];
  startsAt?: string | null;
  costInfo?: string | null;
  rewardCertainty?: RewardCertainty;
  sourceProvider?: string | null;
  sourceName?: string | null;
  importMethod?: ImportMethod;
  lastCheckedAt?: string | null;
  riskLevel?: RiskLevel;
  riskFlags?: string[];
  expiredAt?: string | null;
  adExcluded?: boolean;
  updatedAt?: string;
  /** Field khusus kategori (lihat src/lib/category-specs.ts). */
  details?: Record<string, string>;
};

export function mapOpportunityRow(row: OpportunityRow): Opportunity {
  return {
    id: row.id,
    slug: row.slug,
    category: row.category,
    title: row.title,
    summary: row.summary,
    content: row.content,
    externalUrl: row.external_url,
    sourceUrl: row.source_url,
    rewardValue: row.reward_value,
    rewardCurrency: row.reward_currency,
    rewardDescription: row.reward_description,
    requirements: row.requirements ?? [],
    tags: row.tags ?? [],
    country: row.country,
    deadlineAt: row.deadline_at,
    verifiedAt: row.verified_at,
    publishedAt: row.published_at,
    isFree: row.is_free,
    isDemo: false,
    state: row.state,
    organizer: row.organizer,
    ecosystems: row.ecosystems ?? [],
    skills: row.skills ?? [],
    startsAt: row.starts_at,
    costInfo: row.cost_info,
    rewardCertainty: row.reward_certainty,
    sourceProvider: row.source_provider,
    sourceName: row.source_name,
    importMethod: row.import_method,
    lastCheckedAt: row.last_checked_at,
    riskLevel: row.risk_level,
    riskFlags: row.risk_flags ?? [],
    expiredAt: row.expired_at,
    adExcluded: row.ad_excluded,
    updatedAt: row.updated_at,
    details: row.details ?? {},
  };
}

export type OpportunityFilters = {
  category?: OpportunityCategory;
  categories?: OpportunityCategory[];
  search?: string;
  freeOnly?: boolean;
  deadlineSoon?: boolean;
  skill?: string;
};
