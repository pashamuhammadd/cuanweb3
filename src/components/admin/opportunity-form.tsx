"use client";

import { useActionState } from "react";
import { saveOpportunity, type SaveOpportunityState } from "@/lib/actions/admin-opportunities";
import { CATEGORY_LABELS, REWARD_CERTAINTY_LABELS } from "@/lib/categories";
import { OPPORTUNITY_CATEGORIES } from "@/lib/supabase/database.types";
import { RISK_FLAG_LABELS } from "@/lib/engine/risk";
import type { OpportunityRow } from "@/lib/supabase/database.types";

const initialState: SaveOpportunityState = { status: "idle" };

export function OpportunityForm({ opportunity }: { opportunity?: OpportunityRow }) {
  const [state, formAction, isPending] = useActionState(saveOpportunity, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {opportunity && <input type="hidden" name="id" value={opportunity.id} />}
      {opportunity?.published_at && (
        <input type="hidden" name="previousPublishedAt" value={opportunity.published_at} />
      )}

      {opportunity && opportunity.import_method !== "manual" && (
        <section
          aria-label="Info import otomatis"
          className="rounded-xl border border-teal/30 bg-teal/5 p-4 text-sm text-offwhite/90"
        >
          <p>
            <strong>Hasil import otomatis</strong> dari {opportunity.source_name ?? opportunity.source_provider} ·
            ditemukan {opportunity.discovered_at?.slice(0, 10) ?? "-"} · status review: {opportunity.review_state}
          </p>
          {opportunity.review_note && <p className="mt-1 text-muted-foreground">Catatan: {opportunity.review_note}</p>}
          {opportunity.risk_flags.length > 0 && (
            <p className="mt-1 text-rose-300">
              Risiko {opportunity.risk_level}: {opportunity.risk_flags.map((f) => RISK_FLAG_LABELS[f] ?? f).join(", ")}
            </p>
          )}
          {opportunity.source_excerpt && (
            <p className="mt-2 text-xs text-muted-foreground">
              Kutipan sumber (hanya untuk referensi admin, jangan disalin utuh): “{opportunity.source_excerpt}”
            </p>
          )}
        </section>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Judul" name="title" defaultValue={opportunity?.title} required />
        <Field label="Slug" name="slug" defaultValue={opportunity?.slug} required />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className="text-sm font-medium text-offwhite">Kategori</label>
          <select
            id="category"
            name="category"
            defaultValue={opportunity?.category ?? "airdrop"}
            className="mt-1.5 w-full rounded-lg border border-border-subtle bg-surface-raised px-3 py-2 text-sm text-offwhite focus:border-teal"
          >
            {OPPORTUNITY_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="state" className="text-sm font-medium text-offwhite">Status</label>
          <select
            id="state"
            name="state"
            defaultValue={opportunity?.state ?? "draft"}
            className="mt-1.5 w-full rounded-lg border border-border-subtle bg-surface-raised px-3 py-2 text-sm text-offwhite focus:border-teal"
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
        <Field label="Penyelenggara" name="organizer" defaultValue={opportunity?.organizer ?? ""} />
        <Field
          label="Ekosistem (pisahkan koma, mis. solana, ethereum)"
          name="ecosystems"
          defaultValue={opportunity?.ecosystems?.join(", ") ?? ""}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Skill (pisahkan koma)" name="skills" defaultValue={opportunity?.skills?.join(", ") ?? ""} />
        <div>
          <label htmlFor="rewardCertainty" className="text-sm font-medium text-offwhite">
            Jenis kepastian reward
          </label>
          <select
            id="rewardCertainty"
            name="rewardCertainty"
            defaultValue={opportunity?.reward_certainty ?? "unknown"}
            className="mt-1.5 w-full rounded-lg border border-border-subtle bg-surface-raised px-3 py-2 text-sm text-offwhite focus:border-teal"
          >
            {Object.entries(REWARD_CERTAINTY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Info modal/biaya" name="costInfo" defaultValue={opportunity?.cost_info ?? ""} />
        <Field
          label="Tanggal mulai"
          name="startsAt"
          type="datetime-local"
          defaultValue={opportunity?.starts_at?.slice(0, 16) ?? ""}
        />
      </div>

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

      <Field label="Lokasi / cakupan negara" name="country" defaultValue={opportunity?.country ?? ""} />

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

      <label className="flex items-center gap-2 text-sm text-offwhite">
        <input
          type="checkbox"
          name="markVerified"
          className="h-4 w-4 rounded border-border-subtle bg-surface-raised accent-teal"
        />
        Saya sudah memeriksa sumber resmi — tandai terverifikasi hari ini
      </label>

      <label className="flex items-center gap-2 text-sm text-offwhite">
        <input
          type="checkbox"
          name="adExcluded"
          defaultChecked={opportunity?.ad_excluded ?? false}
          className="h-4 w-4 rounded border-border-subtle bg-surface-raised accent-teal"
        />
        Jangan tampilkan iklan di halaman ini (eksklusi AdSense)
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
        className="mt-1.5 w-full rounded-lg border border-border-subtle bg-surface-raised px-3 py-2 text-sm text-offwhite focus:border-teal"
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
        className="mt-1.5 w-full rounded-lg border border-border-subtle bg-surface-raised px-3 py-2 text-sm text-offwhite focus:border-teal"
      />
    </div>
  );
}
