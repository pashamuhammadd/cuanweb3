import { ActionForm } from "@/components/admin/automation/action-form";
import { addRssSource, runSyncNow, testSource, updateSource } from "@/lib/actions/automation";
import { CATEGORY_LABELS } from "@/lib/categories";
import { listSources } from "@/lib/data/automation";
import { formatDateTime, isFutureDate } from "@/lib/format";
import { OPPORTUNITY_CATEGORIES, type IntegrationSourceRow } from "@/lib/supabase/database.types";
import { cn } from "@/lib/cn";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const inputClass =
  "mt-1 w-full min-h-11 rounded-xl border border-border-subtle bg-surface-raised px-3 py-2 text-sm text-offwhite focus:border-teal";

function Badge({ tone, children }: { tone: "ok" | "muted" | "warn" | "danger"; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-xs font-medium",
        tone === "ok" && "bg-emerald-500/15 text-emerald-300",
        tone === "muted" && "bg-surface-raised text-muted-foreground",
        tone === "warn" && "bg-amber-500/15 text-amber-300",
        tone === "danger" && "bg-rose-500/15 text-rose-300",
      )}
    >
      {children}
    </span>
  );
}

function SourceCard({ source }: { source: IntegrationSourceRow }) {
  const keyConfigured = source.api_key_env ? Boolean(process.env[source.api_key_env]) : true;
  const locked = source.is_paid || source.adapter === "none";
  const fieldId = (name: string) => `${source.key}-${name}`;

  return (
    <article className="card-surface p-4 md:p-5" aria-labelledby={fieldId("title")}>
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 id={fieldId("title")} className="font-heading text-base font-semibold text-offwhite">
            {source.name}
          </h3>
          <p className="truncate text-xs text-muted-foreground">
            {source.kind.toUpperCase()} · {source.adapter} · {source.url}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {source.is_paid ? (
            <Badge tone="danger">Berbayar, dikunci</Badge>
          ) : source.enabled ? (
            <Badge tone="ok">Aktif</Badge>
          ) : (
            <Badge tone="muted">Nonaktif</Badge>
          )}
          {source.requires_api_key && (
            <Badge tone={keyConfigured ? "ok" : "warn"}>
              {source.api_key_env ? `${source.api_key_env}: ${keyConfigured ? "terisi" : "belum diisi"}` : "Butuh API key"}
            </Badge>
          )}
          <Badge tone={source.publish_mode === "auto" ? "warn" : "muted"}>
            {source.publish_mode === "auto" ? "Auto-publish" : "Manual review"}
          </Badge>
          {source.trusted && <Badge tone="ok">Tepercaya</Badge>}
        </div>
      </header>

      {(source.terms_note || source.status_note) && (
        <div className="mt-3 space-y-1 text-xs text-muted-foreground">
          {source.terms_note && <p>Ketentuan: {source.terms_note}</p>}
          {source.status_note && <p className="text-amber-300">{source.status_note}</p>}
        </div>
      )}

      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
        <div>
          <dt className="text-muted-foreground">Sinkron terakhir</dt>
          <dd className="text-offwhite">{source.last_run_at ? formatDateTime(source.last_run_at) : "-"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Status</dt>
          <dd className={source.last_status === "failed" ? "text-rose-300" : "text-offwhite"}>{source.last_status ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Berikutnya</dt>
          <dd className="text-offwhite">{source.next_run_at ? formatDateTime(source.next_run_at) : "Cron berikutnya"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Backoff</dt>
          <dd className="text-offwhite">
            {source.backoff_until && isFutureDate(source.backoff_until)
              ? `s/d ${formatDateTime(source.backoff_until)} (${source.consecutive_failures}× gagal)`
              : "-"}
          </dd>
        </div>
      </dl>
      {source.last_error && <p className="mt-2 text-xs text-rose-300">Error terakhir: {source.last_error}</p>}

      {!locked && (
        <details className="mt-4 rounded-xl border border-border-subtle p-3">
          <summary className="cursor-pointer text-sm font-medium text-offwhite">Pengaturan sumber</summary>
          <ActionForm action={updateSource} submitLabel="Simpan" className="mt-3">
            <input type="hidden" name="id" value={source.id} />
            <div className="flex flex-wrap gap-4 text-sm text-offwhite">
              <label className="flex items-center gap-2">
                <input type="checkbox" name="enabled" defaultChecked={source.enabled} className="h-4 w-4 accent-teal" />
                Aktif
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="trusted" defaultChecked={source.trusted} className="h-4 w-4 accent-teal" />
                Sumber tepercaya
              </label>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
              <div>
                <label htmlFor={fieldId("mode")} className="text-xs text-muted-foreground">Mode publikasi</label>
                <select id={fieldId("mode")} name="publishMode" defaultValue={source.publish_mode} className={inputClass}>
                  <option value="manual">Manual (review admin)</option>
                  <option value="auto">Otomatis bila lolos validasi</option>
                </select>
              </div>
              <div>
                <label htmlFor={fieldId("interval")} className="text-xs text-muted-foreground">Interval (menit)</label>
                <input id={fieldId("interval")} name="intervalMinutes" type="number" min={60} max={10080} step={30} defaultValue={source.interval_minutes} className={inputClass} />
              </div>
              <div>
                <label htmlFor={fieldId("daily")} className="text-xs text-muted-foreground">Kuota harian (request)</label>
                <input id={fieldId("daily")} name="dailyQuota" type="number" min={0} defaultValue={source.daily_quota ?? ""} className={inputClass} />
              </div>
              <div>
                <label htmlFor={fieldId("monthly")} className="text-xs text-muted-foreground">Kuota bulanan (request)</label>
                <input id={fieldId("monthly")} name="monthlyQuota" type="number" min={0} defaultValue={source.monthly_quota ?? ""} className={inputClass} />
              </div>
            </div>
            <fieldset>
              <legend className="text-xs text-muted-foreground">
                Kategori yang boleh dihasilkan (kosong = semua; kategori default: {source.default_category ? CATEGORY_LABELS[source.default_category] : "-"})
              </legend>
              <div className="mt-1 flex flex-wrap gap-2">
                {OPPORTUNITY_CATEGORIES.map((c) => (
                  <label key={c} className="flex items-center gap-1.5 rounded-full border border-border-subtle px-2.5 py-1 text-xs text-offwhite">
                    <input type="checkbox" name="categories" value={c} defaultChecked={source.categories.includes(c)} className="accent-teal" />
                    {CATEGORY_LABELS[c]}
                  </label>
                ))}
              </div>
            </fieldset>
          </ActionForm>
        </details>
      )}

      {!locked && (
        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
          <ActionForm action={testSource} submitLabel="Tes koneksi" pendingLabel="Menguji…" variant="secondary">
            <input type="hidden" name="key" value={source.key} />
          </ActionForm>
          {source.enabled && (
            <ActionForm action={runSyncNow} submitLabel="Sinkronkan sekarang" pendingLabel="Menyinkronkan…" variant="secondary">
              <input type="hidden" name="key" value={source.key} />
            </ActionForm>
          )}
        </div>
      )}
    </article>
  );
}

export default async function SourcesPage() {
  const sources = await listSources();
  const active = sources.filter((s) => !s.is_paid && s.adapter !== "none");
  const optional = sources.filter((s) => s.is_paid || s.adapter === "none");

  return (
    <div className="space-y-8">
      <section aria-labelledby="sumber-aktif" className="space-y-4">
        <h2 id="sumber-aktif" className="font-heading text-lg font-semibold text-offwhite">Sumber dengan adapter</h2>
        {active.map((s) => (
          <SourceCard key={s.id} source={s} />
        ))}
      </section>

      <section aria-labelledby="tambah-sumber" className="card-surface p-4 md:p-5">
        <h2 id="tambah-sumber" className="font-heading text-lg font-semibold text-offwhite">Tambah sumber RSS</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Hanya feed RSS/Atom resmi yang memang disediakan penerbitnya. Sumber baru masuk dalam keadaan nonaktif dan
          mode manual.
        </p>
        <ActionForm action={addRssSource} submitLabel="Tambah sumber" className="mt-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="new-name" className="text-xs text-muted-foreground">Nama sumber</label>
              <input id="new-name" name="name" required maxLength={80} className={inputClass} />
            </div>
            <div>
              <label htmlFor="new-url" className="text-xs text-muted-foreground">URL feed (https)</label>
              <input id="new-url" name="url" type="url" required className={inputClass} />
            </div>
            <div>
              <label htmlFor="new-home" className="text-xs text-muted-foreground">Halaman resmi (opsional)</label>
              <input id="new-home" name="homepageUrl" type="url" className={inputClass} />
            </div>
            <div>
              <label htmlFor="new-cat" className="text-xs text-muted-foreground">Kategori default</label>
              <select id="new-cat" name="defaultCategory" className={inputClass} defaultValue="grants">
                {OPPORTUNITY_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="new-eco" className="text-xs text-muted-foreground">Ekosistem (pisahkan koma)</label>
              <input id="new-eco" name="ecosystems" className={inputClass} placeholder="solana, ethereum" />
            </div>
            <label className="flex items-center gap-2 self-end pb-2 text-sm text-offwhite">
              <input type="checkbox" name="keywordFilter" defaultChecked className="h-4 w-4 accent-teal" />
              Feed berita: ambil hanya item berkata kunci peluang
            </label>
          </div>
        </ActionForm>
      </section>

      <section aria-labelledby="sumber-opsional" className="space-y-4">
        <h2 id="sumber-opsional" className="font-heading text-lg font-semibold text-offwhite">
          Integrasi opsional (butuh izin, API key, atau berbayar)
        </h2>
        {optional.map((s) => (
          <SourceCard key={s.id} source={s} />
        ))}
      </section>
    </div>
  );
}
