import { getApiUsage } from "@/lib/data/automation";

export const dynamic = "force-dynamic";

function Meter({ used, limit, label }: { used: number; limit: number | null; label: string }) {
  if (limit == null) return <span className="text-muted-foreground">{used} / tanpa batas</span>;
  const pct = limit === 0 ? 100 : Math.min(100, Math.round((used / limit) * 100));
  return (
    <div>
      <span className="text-offwhite">
        {used} / {limit}
      </span>
      <div
        className="mt-1 h-1.5 w-28 overflow-hidden rounded-full bg-surface-raised"
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={limit}
        aria-valuenow={used}
      >
        <div className={pct >= 90 ? "h-full bg-rose-400" : pct >= 70 ? "h-full bg-amber-400" : "h-full bg-teal"} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default async function ApiUsagePage() {
  const rows = await getApiUsage();
  const totalCost = rows.reduce((n, r) => n + r.estimatedCostUsd, 0);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border-subtle bg-surface p-4 text-sm">
        <p className="text-offwhite">
          Estimasi biaya bulan ini: <strong className="tabular-nums-fixed">US${totalCost.toFixed(2)}</strong>{" "}
          <span className="text-muted-foreground">(semua sumber aktif gratis; sumber berbayar dikunci di database)</span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Setiap request keluar dihitung sebelum dikirim. Bila kuota harian/bulanan habis, request berikutnya otomatis
          dihentikan dan dicatat sebagai &quot;diblokir&quot;. Hitungan memakai zona waktu UTC.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border-subtle">
        <table className="w-full min-w-[760px] text-left text-sm">
          <caption className="sr-only">Penggunaan API per sumber</caption>
          <thead className="bg-surface text-xs uppercase text-muted-foreground">
            <tr>
              <th scope="col" className="px-3 py-3">Sumber</th>
              <th scope="col" className="px-3 py-3">Hari ini</th>
              <th scope="col" className="px-3 py-3">Bulan ini</th>
              <th scope="col" className="px-3 py-3 text-right">Sisa hari ini</th>
              <th scope="col" className="px-3 py-3 text-right">Sisa bulan ini</th>
              <th scope="col" className="px-3 py-3 text-right">Diblokir hari ini</th>
              <th scope="col" className="px-3 py-3 text-right">Est. biaya</th>
            </tr>
          </thead>
          <tbody className="tabular-nums-fixed">
            {rows.map((r) => (
              <tr key={r.source.id} className="border-t border-border-subtle">
                <td className="px-3 py-2.5">
                  <span className="text-offwhite">{r.source.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {r.source.is_paid ? "Berbayar, nonaktif" : r.source.enabled ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td className="px-3 py-2.5"><Meter used={r.today} limit={r.source.daily_quota} label={`Kuota harian ${r.source.name}`} /></td>
                <td className="px-3 py-2.5"><Meter used={r.month} limit={r.source.monthly_quota} label={`Kuota bulanan ${r.source.name}`} /></td>
                <td className="px-3 py-2.5 text-right">{r.remainingToday ?? "∞"}</td>
                <td className="px-3 py-2.5 text-right">{r.remainingMonth ?? "∞"}</td>
                <td className={r.blockedToday > 0 ? "px-3 py-2.5 text-right text-rose-300" : "px-3 py-2.5 text-right"}>{r.blockedToday}</td>
                <td className="px-3 py-2.5 text-right">US${r.estimatedCostUsd.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
