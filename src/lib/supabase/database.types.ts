/**
 * Tipe database diringkas secara manual agar selaras dengan
 * supabase/migrations/0001_init.sql. Saat proyek Supabase nyata sudah ada,
 * regenerasi dengan: supabase gen types typescript --local > ini.
 */

export type OpportunityCategory =
  | "airdrop"
  | "giveaway"
  | "bounty"
  | "jobs"
  | "hackathon"
  | "grants";

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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
