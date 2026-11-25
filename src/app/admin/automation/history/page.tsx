import { listImportRuns } from "@/lib/data/automation";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  success: "bg-emerald-500/15 text-emerald-300",
  partial: "bg-amber-500/15 text-amber-300",
  failed: "bg-rose-500/15 text-rose-300",
  running: "bg-teal/15 text-teal",
  skipped: "bg-surface-raised text-muted-foreground",
};

const STATUS_LABEL: Record<string, string> = {
  success: "Berhasil",
  partial: "Sebagian",
  failed: "Gagal",
  running: "Berjalan",
  skipped: "Dilewati",
};

const TRIGGER_LABEL: Record<string, string> = { cron: "Terjadwal", manual: "Manual", test: "Tes koneksi" };

export default async function SyncHistoryPage() {
  const runs = await listImportRuns(150);

  return (
    <div className="overflow-x-auto rounded-2xl border border-border-subtle">
      <table className="w-full min-w-[860px] text-left text-sm">
        <caption className="sr-only">Riwayat sinkronisasi 150 proses terakhir</caption>
        <thead className="bg-surface text-xs uppercase text-muted-foreground">
          <tr>
            <th scope="col" className="px-3 py-3">Waktu</th>
            <th scope="col" className="px-3 py-3">Sumber</th>
            <th scope="col" className="px-3 py-3">Pemicu</th>
            <th scope="col" className="px-3 py-3">Status</th>
            <th scope="col" className="px-3 py-3 text-right">Ditemukan</th>
            <th scope="col" className="px-3 py-3 text-right">Baru</th>
            <th scope="col" className="px-3 py-3 text-right">Diperbarui</th>
            <th scope="col" className="px-3 py-3 text-right">Duplikat</th>
            <th scope="col" className="px-3 py-3 text-right">Request</th>
            <th scope="col" className="px-3 py-3">Pesan</th>
          </tr>
        </thead>
        <tbody className="tabular-nums-fixed">
          {runs.map((r) => {
            const skipReasons = (r.details as { skipReasons?: Record<string, number> }).skipReasons;
            const itemErrors = (r.details as { itemErrors?: string[] }).itemErrors;
            return (
              <tr key={r.id} className="border-t border-border-subtle align-top">
                <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">{formatDateTime(r.started_at)}</td>
                <td className="px-3 py-2.5 text-offwhite">{r.source_name ?? "-"}</td>
                <td className="px-3 py-2.5 text-muted-foreground">{TRIGGER_LABEL[r.trigger] ?? r.trigger}</td>
                <td className="px-3 py-2.5">
                  <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", STATUS_STYLE[r.status])}>
                    {STATUS_LABEL[r.status] ?? r.status}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right">{r.found}</td>
                <td className="px-3 py-2.5 text-right">
                  {r.created}
                  {r.created > 0 && <span className="block text-xs text-muted-foreground">{r.published} tayang · {r.queued} review</span>}
                </td>
                <td className="px-3 py-2.5 text-right">{r.updated}</td>
                <td className="px-3 py-2.5 text-right">{r.duplicates}</td>
                <td className="px-3 py-2.5 text-right">{r.requests}</td>
                <td className="max-w-xs px-3 py-2.5 text-xs text-muted-foreground">
                  {r.error_message && <span className="block text-rose-300">{r.error_message}</span>}
                  {itemErrors?.map((e) => <span key={e} className="block text-rose-300">{e}</span>)}
                  {skipReasons && Object.keys(skipReasons).length > 0 && (
                    <span className="block">
                      Dilewati: {Object.entries(skipReasons).map(([k, v]) => `${k} ${v}`).join(", ")}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
          {runs.length === 0 && (
            <tr>
              <td colSpan={10} className="px-4 py-8 text-center text-muted-foreground">
                Belum ada riwayat sinkronisasi.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
