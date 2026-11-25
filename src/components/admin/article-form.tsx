"use client";

import { useActionState } from "react";
import { saveArticle, type SaveArticleState } from "@/lib/actions/admin-articles";
import type { ArticleRow } from "@/lib/supabase/database.types";

const initialState: SaveArticleState = { status: "idle" };

export function ArticleForm({ article }: { article?: ArticleRow }) {
  const [state, formAction, isPending] = useActionState(saveArticle, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {article && <input type="hidden" name="id" value={article.id} />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="title" className="text-sm font-medium text-offwhite">
            Judul
          </label>
          <input
            id="title"
            name="title"
            defaultValue={article?.title}
            required
            className="mt-1.5 w-full rounded-lg border border-border-subtle bg-surface-raised px-3 py-2 text-sm text-offwhite focus:border-teal"
          />
        </div>
        <div>
          <label htmlFor="slug" className="text-sm font-medium text-offwhite">
            Slug
          </label>
          <input
            id="slug"
            name="slug"
            defaultValue={article?.slug}
            required
            className="mt-1.5 w-full rounded-lg border border-border-subtle bg-surface-raised px-3 py-2 text-sm text-offwhite focus:border-teal"
          />
        </div>
      </div>

      <div>
        <label htmlFor="state" className="text-sm font-medium text-offwhite">
          Status
        </label>
        <select
          id="state"
          name="state"
          defaultValue={article?.state ?? "draft"}
          className="mt-1.5 w-full max-w-xs rounded-lg border border-border-subtle bg-surface-raised px-3 py-2 text-sm text-offwhite focus:border-teal"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div>
        <label htmlFor="summary" className="text-sm font-medium text-offwhite">
          Ringkasan
        </label>
        <textarea
          id="summary"
          name="summary"
          rows={2}
          defaultValue={article?.summary}
          required
          className="mt-1.5 w-full rounded-lg border border-border-subtle bg-surface-raised px-3 py-2 text-sm text-offwhite focus:border-teal"
        />
      </div>

      <div>
        <label htmlFor="content" className="text-sm font-medium text-offwhite">
          Konten (mendukung paragraf teks biasa)
        </label>
        <textarea
          id="content"
          name="content"
          rows={10}
          defaultValue={article?.content}
          required
          className="mt-1.5 w-full rounded-lg border border-border-subtle bg-surface-raised px-3 py-2 text-sm text-offwhite focus:border-teal"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-charcoal transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60"
        >
          {isPending ? "Menyimpan…" : "Simpan"}
        </button>
        {state.status === "error" && <span className="text-sm text-rose-400">{state.message}</span>}
      </div>
    </form>
  );
}
