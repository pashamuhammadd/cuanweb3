/**
 * Tipe database diringkas secara manual agar selaras dengan
 * supabase/migrations/0001_init.sql. Saat proyek Supabase nyata sudah ada,
 * regenerasi dengan: supabase gen types typescript --local > ini.
 */

export const OPPORTUNITY_CATEGORIES = [
  "airdrop",
  "giveaway",
  "bounty",
  "contest",
  "jobs",
  "hackathon",
  "grants",
  "testnet",
  "ambassador",
  "paid_mission",
] as const;

export type OpportunityCategory = (typeof OPPORTUNITY_CATEGORIES)[number];

export type RewardCertainty = "guaranteed" | "competition" | "raffle" | "unconfirmed" | "unknown";
export type ReviewState = "not_required" | "pending" | "approved" | "rejected" | "changed";
export type ImportMethod = "manual" | "rss" | "api";
export type RiskLevel = "low" | "medium" | "high";

export type OpportunityState = "draft" | "published" | "expired" | "archived";

export type OpportunityRow = {
  id: string;
  slug: string;
  category: OpportunityCategory;
  title: string;
  summary: string;
  content: string;
  external_url: string | null;
  source_url: string | null;
  source_provider: string | null;
  external_id: string | null;
  reward_value: number | null;
  reward_currency: string | null;
  reward_description: string | null;
  reward_type: string | null;
  requirements: string[] | null;
  tags: string[] | null;
  country: string | null;
  deadline_at: string | null;
  published_at: string | null;
  verified_at: string | null;
  state: OpportunityState;
  image_path: string | null;
  is_free: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  organizer: string | null;
  ecosystems: string[];
  skills: string[];
  starts_at: string | null;
  cost_info: string | null;
  reward_certainty: RewardCertainty;
  review_state: ReviewState;
  review_note: string | null;
  import_method: ImportMethod;
  source_id: string | null;
  source_name: string | null;
  canonical_url: string | null;
  content_hash: string | null;
  source_excerpt: string | null;
  discovered_at: string | null;
  last_checked_at: string | null;
  source_changed_at: string | null;
  risk_level: RiskLevel;
  risk_flags: string[];
  duplicate_of: string | null;
  ad_excluded: boolean;
  expired_at: string | null;
};

export type ProfileRow = {
  id: string;
  username: string;
  avatar_url: string | null;
  skill_tags: string[] | null;
  locale: string;
  is_admin: boolean;
  status: string;
  notification_opt_in: boolean;
  created_at: string;
  updated_at: string;
};

export type BookmarkRow = {
  user_id: string;
  opportunity_id: string;
  created_at: string;
};

export type ArticleRow = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  cover_image_path: string | null;
  state: OpportunityState;
  published_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type IntegrationSourceRow = {
  id: string;
  key: string;
  name: string;
  adapter: string;
  kind: "rss" | "api";
  url: string;
  homepage_url: string | null;
  enabled: boolean;
  default_category: OpportunityCategory | null;
  categories: string[];
  ecosystems: string[];
  keyword_filter: boolean;
  interval_minutes: number;
  publish_mode: "manual" | "auto";
  trusted: boolean;
  requires_api_key: boolean;
  api_key_env: string | null;
  is_paid: boolean;
  cost_per_1k_requests_usd: number;
  daily_quota: number | null;
  monthly_quota: number | null;
  terms_note: string | null;
  status_note: string | null;
  last_run_at: string | null;
  last_success_at: string | null;
  next_run_at: string | null;
  last_status: string | null;
  last_error: string | null;
  consecutive_failures: number;
  backoff_until: string | null;
  http_etag: string | null;
  http_last_modified: string | null;
  created_at: string;
  updated_at: string;
};

export type ImportRunStatus = "running" | "success" | "partial" | "failed" | "skipped";

export type ImportRunRow = {
  id: string;
  source_id: string | null;
  trigger: "cron" | "manual" | "test";
  status: ImportRunStatus;
  started_at: string;
  finished_at: string | null;
  found: number;
  created: number;
  updated: number;
  published: number;
  queued: number;
  duplicates: number;
  skipped: number;
  errors: number;
  requests: number;
  error_message: string | null;
  details: Record<string, unknown>;
};

export type ApiUsageRow = {
  source_key: string;
  day: string;
  requests: number;
  blocked: number;
};

export type AppSettingRow = {
  key: string;
  value: unknown;
  updated_at: string;
};

export type FeatureFlagRow = {
  key: string;
  enabled: boolean;
  description: string;
  updated_at: string;
};

export type SubscriptionRow = {
  id: string;
  user_id: string;
  plan: "plus_30d";
  price_idr: number;
  status: "pending" | "active" | "expired" | "cancelled";
  valid_from: string | null;
  valid_to: string | null;
  external_ref: string | null;
  created_at: string;
  updated_at: string;
};

type SimpleTable<Row, Required extends keyof Row> = {
  Row: Row;
  Insert: Partial<Row> & Pick<Row, Required>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      opportunities: {
        Row: OpportunityRow;
        Insert: Partial<OpportunityRow> &
          Pick<OpportunityRow, "slug" | "category" | "title" | "summary" | "content">;
        Update: Partial<OpportunityRow>;
        Relationships: [];
      };
      profiles: {
        Row: ProfileRow;
        Insert: Partial<ProfileRow> & Pick<ProfileRow, "id" | "username">;
        Update: Partial<ProfileRow>;
        Relationships: [];
      };
      bookmarks: {
        Row: BookmarkRow;
        Insert: Pick<BookmarkRow, "user_id" | "opportunity_id"> &
          Partial<Pick<BookmarkRow, "created_at">>;
        Update: Partial<BookmarkRow>;
        Relationships: [
          {
            foreignKeyName: "bookmarks_opportunity_id_fkey";
            columns: ["opportunity_id"];
            isOneToOne: false;
            referencedRelation: "opportunities";
            referencedColumns: ["id"];
          },
        ];
      };
      articles: {
        Row: ArticleRow;
        Insert: Partial<ArticleRow> &
          Pick<ArticleRow, "slug" | "title" | "summary" | "content">;
        Update: Partial<ArticleRow>;
        Relationships: [];
      };
      integration_sources: SimpleTable<IntegrationSourceRow, "key" | "name" | "adapter" | "kind" | "url">;
      import_runs: SimpleTable<ImportRunRow, "trigger">;
      api_usage: SimpleTable<ApiUsageRow, "source_key" | "day">;
      app_settings: SimpleTable<AppSettingRow, "key" | "value">;
      feature_flags: SimpleTable<FeatureFlagRow, "key">;
      subscriptions: SimpleTable<SubscriptionRow, "user_id">;
    };
    Views: Record<string, never>;
    Functions: {
      consume_api_quota: {
        Args: { p_source_key: string; p_daily: number | null; p_monthly: number | null; p_amount?: number };
        Returns: boolean;
      };
      acquire_job_lock: {
        Args: { p_name: string; p_holder: string; p_ttl_seconds: number };
        Returns: boolean;
      };
      release_job_lock: { Args: { p_name: string; p_holder: string }; Returns: undefined };
      expire_opportunities: { Args: Record<string, never>; Returns: number };
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
  };
};
