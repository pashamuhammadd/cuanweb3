import Link from "next/link";
import { Bookmark } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getSessionUser } from "@/lib/auth";
import { isOpportunityBookmarked } from "@/lib/actions/bookmarks";
import { BookmarkToggleClient } from "./bookmark-toggle-client";

export async function BookmarkButton({ opportunityId, redirectTo = "/peluang" }: { opportunityId: string; redirectTo?: string }) {
  if (!isSupabaseConfigured()) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-dashed border-border-subtle px-5 py-2.5 text-sm text-muted-foreground">
        <Bookmark className="h-4 w-4" aria-hidden />
        Simpan (perlu konfigurasi Supabase)
      </span>
    );
  }

  const user = await getSessionUser();

  if (!user) {
    return (
      <Link
        href={`/login?redirect=${encodeURIComponent(redirectTo)}`}
        className="inline-flex items-center gap-2 rounded-full border border-border-strong px-5 py-2.5 text-sm font-medium text-offwhite transition-colors hover:border-teal hover:text-teal"
      >
        <Bookmark className="h-4 w-4" aria-hidden />
        Masuk untuk menyimpan
      </Link>
    );
  }

  const bookmarked = await isOpportunityBookmarked(opportunityId);

  return <BookmarkToggleClient opportunityId={opportunityId} initialBookmarked={bookmarked} />;
}
