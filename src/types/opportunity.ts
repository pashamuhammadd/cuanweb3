import type { OpportunityCategory, OpportunityRow } from "@/lib/supabase/database.types";

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
  };
}

export type OpportunityFilters = {
  category?: OpportunityCategory;
  search?: string;
  freeOnly?: boolean;
  deadlineSoon?: boolean;
  skill?: string;
};
