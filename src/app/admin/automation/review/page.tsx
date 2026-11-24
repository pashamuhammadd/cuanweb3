import Link from "next/link";
import { ActionForm } from "@/components/admin/automation/action-form";
import { reviewOpportunity } from "@/lib/actions/automation";
import { CATEGORY_LABELS, REWARD_CERTAINTY_LABELS, ecosystemLabel } from "@/lib/categories";
import { getOpportunityTitles, listReviewQueue, listSources } from "@/lib/data/automation";
import { RISK_FLAG_LABELS } from "@/lib/engine/risk";
import { assessCategoryCompleteness, detailValueLabel, getCategorySpec, requirementLabel } from "@/lib/category-specs";
import { formatDate } from "@/lib/format";
import { OPPORTUNITY_CATEGORIES, type OpportunityRow } from "@/lib/supabase/database.types";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";

type Search = { source?: string; category?: string; view?: string };

function completeness(o: OpportunityRow) {
  const result = assessCategoryCompleteness(o.category, {
    organizer: o.organizer,
    externalUrl: o.external_url,
    deadlineAt: o.deadline_at,
    startsAt: o.starts_at,
    rewardValue: o.reward_value,
    rewardDescription: o.reward_description,
    country: o.country,
    description: o.source_excerpt,
    details: o.details ?? {},
  });
  return {
    required: result.missingRequired.map((r) => requirementLabel(o.category, r)),
    recommended: result.missingRecommended.map((r) => requirementLabel(o.category, r)),
  };
}

export default async function ReviewQueuePage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const view = sp.view === "rejected" ? "rejected" : "queue";
  const category = OPPORTUNITY_CATEGORIES.find((c) => c === sp.category);
  const [items, sources] = await Promise.all([
    listReviewQueue({ source: sp.source || undefined, category, view }),
    listSources(),
  ]);
  const duplicates = await getOpportunityTitles(items.map((i) => i.duplicate_of).filter((v): v is string => Boolean(v)));

  return (
    <div className="space-y-5">
      <form method="get" className="flex flex-wrap items-end gap-3 rounded-2xl border border-border-subtle bg-surface p-4" aria-label="Filter antrean">
        <div>
          <label htmlFor="f-view" className="text-xs text-muted-foreground">Tampilan</label>
          <select id="f-view" name="view" defaultValue={view} className="mt-1 block rounded-lg border border-border-subtle bg-surface-raised px-3 py-2 text-sm">
            <option value="queue">Menunggu review / berubah</option>
            <option value="rejected">Ditolak</option>
          </select>
        </div>
        <div>
          <label htmlFor="f-source" className="text-xs text-muted-foreground">Sumber</label>
          <select id="f-source" name="source" defaultValue={sp.source ?? ""} className="mt-1 block rounded-lg border border-border-subtle bg-surface-raised px-3 py-2 text-sm">
            <option value="">Semua sumber</option>
            {sources.map((s) => (
              <option key={s.key} value={s.key}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-cat" className="text-xs text-muted-foreground">Kategori</label>
          <select id="f-cat" name="category" defaultValue={category ?? ""} className="mt-1 block rounded-lg border border-border-subtle bg-surface-raised px-3 py-2 text-sm">
            <option value="">Semua kategori</option>
            {OPPORTUNITY_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="min-h-10 rounded-full border border-border-strong px-4 text-sm font-medium text-offwhite hover:border-teal hover:text-teal">
          Terapkan
        </button>
        <p className="ml-auto text-sm text-muted-foreground" aria-live="polite">
          {items.length} item
        </p>
      </form>

      {items.length === 0 && (
        <p className="rounded-2xl border border-dashed border-border-subtle p-8 text-center text-sm text-muted-foreground">
          Antrean kosong. Hasil sinkronisasi berikutnya akan muncul di sini.
        </p>
      )}

      <ul className="space-y-4">
        {items.map((o) => {
          const missing = completeness(o);
          const spec = getCategorySpec(o.category);
          const details = o.details ?? {};
          const dup = o.duplicate_of ? duplicates.get(o.duplicate_of) : undefined;
          return (
            <li key={o.id} className="rounded-2xl border border-border-subtle bg-surface p-5">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-teal/15 px-2 py-0.5 font-medium text-teal">{CATEGORY_LABELS[o.category]}</span>
                {o.review_state === "changed" && (
                  <span className="rounded-full bg-amber-500/15 px-2 py-0.5 font-medium text-amber-300">
                    Sumber berubah {o.source_changed_at ? formatDate(o.source_changed_at) : ""}
                  </span>
                )}
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 font-medium",
                    o.risk_level === "high" ? "bg-rose-500/15 text-rose-300" : o.risk_level === "medium" ? "bg-amber-500/15 text-amber-300" : "bg-emerald-500/15 text-emerald-400",
                  )}
                >
                  Risiko {o.risk_level === "high" ? "tinggi" : o.risk_level === "medium" ? "sedang" : "rendah"}
                </span>
                <span className="text-muted-foreground">
                  {o.source_name ?? o.source_provider ?? "manual"} · ditemukan {o.discovered_at ? formatDate(o.discovered_at) : "—"} · status {o.state}
                </span>
              </div>

              <h2 className="font-heading mt-2 text-base font-semibold text-offwhite">{o.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{o.summary}</p>

              <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1 text-xs sm:grid-cols-2">
                <div><dt className="inline text-muted-foreground">{spec.labels.organizer}: </dt><dd className="inline text-offwhite">{o.organizer ?? "Belum diketahui"}</dd></div>
                <div><dt className="inline text-muted-foreground">{spec.labels.reward}: </dt><dd className="inline text-offwhite">{o.reward_description ?? "Belum diketahui"}{o.category !== "jobs" && <> · {REWARD_CERTAINTY_LABELS[o.reward_certainty]}</>}</dd></div>
                <div><dt className="inline text-muted-foreground">{spec.labels.deadline}: </dt><dd className="inline text-offwhite">{o.deadline_at ? formatDate(o.deadline_at) : "Belum diketahui"}</dd></div>
                <div><dt className="inline text-muted-foreground">{spec.labels.location}: </dt><dd className="inline text-offwhite">{o.country ?? "Belum diketahui"}</dd></div>
                {spec.details.map((f) => (
                  <div key={f.key}>
                    <dt className="inline text-muted-foreground">{f.label}: </dt>
                    <dd className="inline text-offwhite">{details[f.key] ? detailValueLabel(o.category, f.key, details[f.key]!) : "Belum diketahui"}</dd>
                  </div>
                ))}
                {o.ecosystems.length > 0 && (
                  <div><dt className="inline text-muted-foreground">Ekosistem: </dt><dd className="inline text-offwhite">{o.ecosystems.map(ecosystemLabel).join(", ")}</dd></div>
                )}
              </dl>

              {missing.required.length > 0 ? (
                <p className="mt-2 text-xs text-amber-300">Wajib dilengkapi sebelum auto-publish: {missing.required.join(", ")}</p>
              ) : (
                <p className="mt-2 text-xs text-emerald-400">Field wajib lengkap — memenuhi syarat auto-publish.</p>
              )}
              {missing.recommended.length > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">Sebaiknya dilengkapi: {missing.recommended.join(", ")}</p>
              )}
              {o.risk_flags.length > 0 && (
                <p className="mt-1 text-xs text-rose-300">Indikasi risiko: {o.risk_flags.map((f) => RISK_FLAG_LABELS[f] ?? f).join(", ")}</p>
              )}
              {o.review_note && <p className="mt-1 text-xs text-muted-foreground">Alasan masuk antrean: {o.review_note}</p>}
              {dup && (
                <p className="mt-1 text-xs text-amber-300">
                  Kemungkinan duplikat dari:{" "}
                  <Link href={`/admin/opportunities/${o.duplicate_of}`} className="underline">
                    {dup.title}
                  </Link>{" "}
                  ({dup.state})
                </p>
              )}
              {o.source_excerpt && (
                <details className="mt-2 text-xs text-muted-foreground">
                  <summary className="cursor-pointer">Kutipan sumber (referensi admin)</summary>
                  <p className="mt-1">“{o.source_excerpt}”</p>
                </details>
              )}

              <div className="mt-4 flex flex-wrap items-start gap-3">
                {o.external_url && (
                  <a href={o.external_url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center text-sm font-medium text-teal hover:underline">
                    Cek sumber resmi ↗<span className="sr-only"> (tab baru)</span>
                  </a>
                )}
                <Link href={`/admin/opportunities/${o.id}`} className="inline-flex min-h-10 items-center text-sm font-medium text-gold hover:underline">
                  Edit
                </Link>
                {view === "queue" && (
                  <>
                    <ActionForm action={reviewOpportunity} submitLabel={o.state === "published" ? "Konfirmasi tetap tayang" : "Approve & publikasikan"}>
                      <input type="hidden" name="id" value={o.id} />
                      <input type="hidden" name="decision" value="approve" />
                    </ActionForm>
                    <ActionForm action={reviewOpportunity} submitLabel="Reject" variant="danger">
                      <input type="hidden" name="id" value={o.id} />
                      <input type="hidden" name="decision" value="reject" />
                    </ActionForm>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
