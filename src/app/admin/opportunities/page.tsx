import Link from "next/link";
import { listAllOpportunitiesForAdmin } from "@/lib/data/admin-opportunities";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";

const STATE_STYLES: Record<string, string> = {
  draft: "bg-surface-raised text-muted-foreground",
  published: "bg-emerald-500/15 text-emerald-300",
  expired: "bg-amber-500/15 text-amber-400",
  archived: "bg-rose-500/15 text-rose-400",
};

export default async function AdminOpportunitiesPage() {
  const opportunities = await listAllOpportunitiesForAdmin();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-xl font-bold text-offwhite">Peluang</h1>
        <Link
          href="/admin/opportunities/new"
          className="press inline-flex h-11 items-center justify-center rounded-xl bg-gold px-4 text-sm font-semibold text-charcoal"
        >
          + Tambah
        </Link>
      </div>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-border-subtle">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-surface text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Judul</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Diperbarui</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {opportunities.map((o) => (
              <tr key={o.id} className="border-t border-border-subtle">
                <td className="px-4 py-3 font-medium text-offwhite">{o.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{o.category}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      STATE_STYLES[o.state],
                    )}
                  >
                    {o.state}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(o.updated_at)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/opportunities/${o.id}`}
                    className="text-gold hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {opportunities.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Belum ada peluang. Tambahkan yang pertama.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
