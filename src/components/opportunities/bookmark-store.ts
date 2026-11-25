"use client";

import { useEffect, useSyncExternalStore } from "react";
import { listMyBookmarkIds, toggleBookmark } from "@/lib/actions/bookmarks";

/**
 * Status bookmark untuk kartu di halaman yang di-cache (ISR). Dimuat sekali
 * per sesi halaman, dan hanya bila ada cookie sesi Supabase, sehingga
 * pengunjung anonim tidak memicu request tambahan.
 */
type State = { status: "idle" | "loading" | "ready" | "anonymous" | "disabled"; ids: Set<string> };

let state: State = { status: "idle", ids: new Set() };
const listeners = new Set<() => void>();
const SERVER_STATE: State = { status: "idle", ids: new Set() };

function set(next: State) {
  state = next;
  listeners.forEach((l) => l());
}

function hasSessionCookie(): boolean {
  return typeof document !== "undefined" && /(?:^|;\s*)sb-[^=]+-auth-token/.test(document.cookie);
}

function load() {
  if (state.status !== "idle") return;
  if (!hasSessionCookie()) {
    set({ status: "anonymous", ids: new Set() });
    return;
  }
  set({ ...state, status: "loading" });
  listMyBookmarkIds()
    .then((r) => {
      if (r.status === "ok") set({ status: "ready", ids: new Set(r.ids) });
      else set({ status: r.status === "anonymous" ? "anonymous" : "disabled", ids: new Set() });
    })
    .catch(() => set({ status: "anonymous", ids: new Set() }));
}

export function useBookmarkState(): State {
  const snapshot = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => SERVER_STATE,
  );
  useEffect(load, []);
  return snapshot;
}

export async function toggleBookmarkInStore(id: string) {
  const result = await toggleBookmark(id);
  if (result.status === "ok") {
    const ids = new Set(state.ids);
    if (result.bookmarked) ids.add(id);
    else ids.delete(id);
    set({ status: "ready", ids });
  } else if (result.status === "requires_login") {
    set({ status: "anonymous", ids: new Set() });
  } else if (result.status === "not_configured") {
    set({ status: "disabled", ids: new Set() });
  }
  return result;
}
