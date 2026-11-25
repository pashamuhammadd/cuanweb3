import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { listBookmarkedOpportunities } from "@/lib/data/bookmarks";
import { OpportunityCard } from "@/components/opportunities/opportunity-card";

export default async function AkunTersimpanPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const items = await listBookmarkedOpportunities(user.id);

  return (
    <div>
      <h1 className="font-heading text-xl font-bold text-offwhite">Peluang tersimpan</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {items.length} peluang yang sudah kamu simpan.
      </p>

      {items.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-border-subtle p-8 text-center text-sm text-muted-foreground">
          Belum ada peluang tersimpan. Jelajahi{" "}
          <Link href="/peluang" className="text-gold hover:underline">
            halaman peluang
          </Link>{" "}
          dan simpan yang menarik.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
          {items.map((item) => (
            <OpportunityCard key={item.id} opportunity={item} />
          ))}
        </div>
      )}
    </div>
  );
}
