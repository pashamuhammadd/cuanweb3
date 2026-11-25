"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { toggleBookmarkInStore, useBookmarkState } from "./bookmark-store";
import { cn } from "@/lib/cn";

export function CardBookmark({ id, title }: { id: string; title: string }) {
  const { status, ids } = useBookmarkState();
  const router = useRouter();
  const pathname = usePathname();
  const [pending, start] = useTransition();
  const [pop, setPop] = useState(false);

  if (status === "disabled") return null;
  const saved = ids.has(id);

  return (
    <button
      type="button"
      disabled={pending || status === "loading"}
      aria-pressed={status === "anonymous" ? undefined : saved}
      onClick={() => {
        if (status === "anonymous") {
          router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
          return;
        }
        start(async () => {
          const r = await toggleBookmarkInStore(id);
          if (r.status === "requires_login") router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
          if (r.status === "ok") setPop(true);
        });
      }}
      onAnimationEnd={() => setPop(false)}
      className={cn(
        "press relative z-10 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors disabled:opacity-60",
        saved
          ? "border-gold/50 bg-gold/15 text-gold"
          : "border-border-faint text-offwhite/70 hover:border-teal hover:text-teal",
      )}
    >
      {saved ? (
        <BookmarkCheck className={cn("h-4.5 w-4.5", pop && "motion-safe:animate-pop")} aria-hidden />
      ) : (
        <Bookmark className={cn("h-4.5 w-4.5", pop && "motion-safe:animate-pop")} aria-hidden />
      )}
      <span className="sr-only">
        {status === "anonymous" ? `Masuk untuk menyimpan ${title}` : saved ? `Hapus ${title} dari tersimpan` : `Simpan ${title}`}
      </span>
    </button>
  );
}
