import Link from "next/link";
import { listAllOpportunitiesForAdmin } from "@/lib/data/admin-opportunities";

export default async function AdminDashboardPage() {
  const opportunities = await listAllOpportunitiesForAdmin();
  const published = opportunities.filter((o) => o.state === "published").length;
  const drafts = opportunities.filter((o) => o.state === "draft").length;

  return (
    <div>
      <h1 className="font-heading text-xl font-bold text-offwhite">Dashboard</h1>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total peluang" value={opportunities.length} />
        <StatCard label="Published" value={published} />
        <StatCard label="Draft" value={drafts} />
      </div>
      <div className="mt-6 flex gap-3">
        <Link
          href="/admin/opportunities/new"
          className="rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-charcoal"
        >
          + Tambah peluang
        </Link>
        <Link
          href="/admin/articles/new"
          className="rounded-full border border-border-strong px-5 py-2.5 text-sm font-semibold text-offwhite"
        >
          + Tulis artikel
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-heading mt-1 text-2xl font-bold text-offwhite tabular-nums-fixed">
        {value}
      </div>
    </div>
  );
}
