import Link from "next/link";
import { ActionForm } from "@/components/admin/automation/action-form";
import { runSyncNow, updateAutomationSettings } from "@/lib/actions/automation";
import { CATEGORY_LABELS } from "@/lib/categories";
import { CRON_SCHEDULE_LABEL, getAutomationSettings, getOverviewStats } from "@/lib/data/automation";
import { formatDateTime } from "@/lib/format";
import { OPPORTUNITY_CATEGORIES } from "@/lib/supabase/database.types";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="card-surface p-4">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-heading tabular-nums-fixed mt-1 text-2xl font-bold text-offwhite">{value}</dd>
      {hint && <dd className="mt-0.5 text-xs text-muted-foreground">{hint}</dd>}
    </div>
  );
}

export default async function AutomationOverviewPage() {
  const [stats, settings] = await Promise.all([getOverviewStats(), getAutomationSettings()]);
  const serviceRoleReady = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const cronReady = Boolean(process.env.CRON_SECRET && process.env.CRON_SECRET.length >= 32);

  return (
    <div className="space-y-8">
      {(!serviceRoleReady || !cronReady) && (
        <div role="alert" className="rounded-xl border border-gold/40 bg-gold/10 p-4 text-sm text-offwhite">
          <p className="font-semibold">Konfigurasi belum lengkap</p>
          <ul className="mt-1 list-inside list-disc text-offwhite/90">
            {!serviceRoleReady && <li>Isi SUPABASE_SERVICE_ROLE_KEY (server-only) di Vercel agar engine bisa menulis data.</li>}
            {!cronReady && <li>Isi CRON_SECRET (minimal 32 karakter) di Vercel dan Supabase Vault untuk penjadwalan.</li>}
          </ul>
          <p className="mt-1 text-xs text-muted-foreground">Lihat README → Opportunity Engine.</p>
        </div>
      )}

      <section aria-labelledby="ringkasan">
        <h2 id="ringkasan" className="font-heading text-lg font-semibold text-offwhite">
          Ringkasan <span className="text-sm font-normal text-muted-foreground">({stats.window})</span>
        </h2>
        <dl className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Peluang ditemukan" value={stats.found} />
          <Stat label="Berhasil diimport" value={stats.created} />
          <Stat label="Dipublikasikan otomatis" value={stats.published} hint={`${stats.publishedImported} hasil import tayang total`} />
          <Stat label="Menunggu review" value={stats.pending} />
          <Stat label="Duplikasi" value={stats.duplicates} />
          <Stat label="Error" value={stats.errors} hint={`${stats.failedRuns} sinkronisasi gagal`} />
          <Stat label="Sinkronisasi terakhir" value={stats.lastSync ? formatDateTime(stats.lastSync) : "Belum pernah"} />
          <Stat
            label="Jadwal berikutnya"
            value={stats.nextRun ? formatDateTime(stats.nextRun) : "Saat cron berikutnya"}
            hint={`${CRON_SCHEDULE_LABEL} · ${stats.enabledSources} sumber aktif`}
          />
        </dl>
        <div className="mt-4 flex flex-wrap items-start gap-4">
          <ActionForm action={runSyncNow} submitLabel="Jalankan sinkronisasi sekarang" pendingLabel="Menyinkronkan… (maks. ±45 dtk)" />
          {stats.pending > 0 && (
            <Link href="/admin/automation/review" className="inline-flex min-h-10 items-center text-sm font-semibold text-gold hover:underline">
              Buka Review Queue ({stats.pending}) →
            </Link>
          )}
        </div>
      </section>

      <section aria-labelledby="pengaturan" className="card-surface p-4 md:p-5">
        <h2 id="pengaturan" className="font-heading text-lg font-semibold text-offwhite">Pengaturan publikasi</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Auto-publish hanya terjadi bila <strong>sumber</strong> dan <strong>kategori</strong> sama-sama mode otomatis,
          sumber ditandai tepercaya, risiko rendah, informasi cukup lengkap, link resmi dapat diakses, dan tidak ada
          kemungkinan duplikat. Selain itu masuk Review Queue.
        </p>
        <ActionForm action={updateAutomationSettings} submitLabel="Simpan pengaturan" className="mt-4">
          <label className="flex items-center gap-2 text-sm text-offwhite">
            <input
              type="checkbox"
              name="automationEnabled"
              defaultChecked={settings.automationEnabled}
              className="h-4 w-4 accent-gold"
            />
            Sinkronisasi terjadwal aktif
          </label>
          <fieldset className="mt-3">
            <legend className="text-sm font-medium text-offwhite">Mode publikasi per kategori</legend>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {OPPORTUNITY_CATEGORIES.map((c) => (
                <label key={c} className="flex items-center justify-between gap-2 rounded-lg border border-border-subtle px-3 py-2 text-sm text-offwhite">
                  {CATEGORY_LABELS[c]}
                  <select
                    name={`mode_${c}`}
                    defaultValue={settings.categoryModes[c] ?? "manual"}
                    className="rounded-md border border-border-subtle bg-surface-raised px-2 py-1 text-sm"
                    aria-label={`Mode publikasi ${CATEGORY_LABELS[c]}`}
                  >
                    <option value="manual">Manual</option>
                    <option value="auto">Otomatis</option>
                  </select>
                </label>
              ))}
            </div>
          </fieldset>
          <p className="text-xs text-muted-foreground">
            Pengayaan AI: <strong>nonaktif</strong> (integrasi opsional berbayar, belum dipasang). Ringkasan dibuat
            dengan template tanpa biaya.
          </p>
        </ActionForm>
      </section>
    </div>
  );
}
