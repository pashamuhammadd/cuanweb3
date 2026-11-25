"use client";

import { useState, useTransition } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { toggleBookmark } from "@/lib/actions/bookmarks";
import { cn } from "@/lib/cn";

export function BookmarkToggleClient({
  opportunityId,
  initialBookmarked,
}: {
  opportunityId: string;
  initialBookmarked: boolean;
}) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      aria-pressed={bookmarked}
      onClick={() => {
        startTransition(async () => {
          const result = await toggleBookmark(opportunityId);
          if (result.status === "ok") {
            setBookmarked(result.bookmarked);
          }
        });
      }}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-60",
        bookmarked
          ? "border-gold bg-gold/15 text-gold"
          : "border-border-strong text-offwhite hover:border-champagne/50 hover:text-champagne",
      )}
    >
      {bookmarked ? (
        <BookmarkCheck className="h-4 w-4" aria-hidden />
      ) : (
        <Bookmark className="h-4 w-4" aria-hidden />
      )}
      {bookmarked ? "Tersimpan" : "Simpan peluang"}
    </button>
  );
}
