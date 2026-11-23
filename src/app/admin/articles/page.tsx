import Link from "next/link";
import { listAllArticlesForAdmin } from "@/lib/data/admin-articles";
import { formatDate } from "@/lib/format";

export default async function AdminArticlesPage() {
  const articles = await listAllArticlesForAdmin();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-xl font-bold text-offwhite">Artikel</h1>
        <Link
          href="/admin/articles/new"
          className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-charcoal"
        >
          + Tulis artikel
        </Link>
      </div>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-border-subtle">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="bg-surface text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Judul</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Diperbarui</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {articles.map((a) => (
              <tr key={a.id} className="border-t border-border-subtle">
                <td className="px-4 py-3 font-medium text-offwhite">{a.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{a.state}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(a.updated_at)}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/articles/${a.id}`} className="text-gold hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {articles.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  Belum ada artikel.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
