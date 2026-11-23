"use client";

import { useActionState } from "react";
import { saveOpportunity, type SaveOpportunityState } from "@/lib/actions/admin-opportunities";
import { CATEGORIES } from "@/lib/nav";
import type { OpportunityRow } from "@/lib/supabase/database.types";

const initialState: SaveOpportunityState = { status: "idle" };

export function OpportunityForm({ opportunity }: { opportunity?: OpportunityRow }) {
  const [state, formAction, isPending] = useActionState(saveOpportunity, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {opportunity && <input type="hidden" name="id" value={opportunity.id} />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Judul" name="title" defaultValue={opportunity?.title} required />
        <Field label="Slug" name="slug" defaultValue={opportunity?.slug} required />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-offwhite">Kategori</label>
          <select
            name="category"
            defaultValue={opportunity?.category ?? "airdrop"}
            className="mt-1.5 w-full rounded-lg border border-border-subtle bg-surface-raised px-3 py-2 text-sm text-offwhite focus:border-teal focus:outline-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-offwhite">Status</label>
          <select
            name="state"
            defaultValue={opportunity?.state ?? "draft"}
            className="mt-1.5 w-full rounded-lg border border-border-subtle bg-surface-raised px-3 py-2 text-sm text-offwhite focus:border-teal focus:outline-none"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="expired">Expired</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <TextArea label="Ringkasan" name="summary" defaultValue={opportunity?.summary} rows={2} required />
      <TextArea label="Konten lengkap" name="content" defaultValue={opportunity?.content} rows={6} required />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Deskripsi reward"
          name="rewardDescription"
          defaultValue={opportunity?.reward_description ?? ""}
        />
        <Field
          label="Deadline"
          name="deadlineAt"
          type="datetime-local"
          defaultValue={opportunity?.deadline_at?.slice(0, 16) ?? ""}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Syarat (pisahkan koma)"
          name="requirements"
          defaultValue={opportunity?.requirements?.join(", ") ?? ""}
        />
        <Field label="Tags (pisahkan koma)" name="tags" defaultValue={opportunity?.tags?.join(", ") ?? ""} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="URL resmi" name="externalUrl" defaultValue={opportunity?.external_url ?? ""} />
        <Field label="URL sumber" name="sourceUrl" defaultValue={opportunity?.source_url ?? ""} />
      </div>

      <label className="flex items-center gap-2 text-sm text-offwhite">
        <input
          type="checkbox"
          name="isFree"
          defaultChecked={opportunity?.is_free ?? true}
          className="h-4 w-4 rounded border-border-subtle bg-surface-raised accent-teal"
        />
        Tanpa modal (gratis)
      </label>

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

function Field({
  label,
  name,
  defaultValue,
  required,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium text-offwhite">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        className="mt-1.5 w-full rounded-lg border border-border-subtle bg-surface-raised px-3 py-2 text-sm text-offwhite focus:border-teal focus:outline-none"
      />
    </div>
  );
}

function TextArea({
  label,
  name,
  defaultValue,
  rows,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  rows: number;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium text-offwhite">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        required={required}
        className="mt-1.5 w-full rounded-lg border border-border-subtle bg-surface-raised px-3 py-2 text-sm text-offwhite focus:border-teal focus:outline-none"
      />
    </div>
  );
}
