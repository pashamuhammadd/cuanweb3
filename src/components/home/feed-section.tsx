import type { Opportunity } from "@/types/opportunity";
import { OpportunityCard } from "@/components/opportunities/opportunity-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";

const LIMIT = 6;

/** Peluang terbaru: desktop 3 kolom kartu vertikal, mobile daftar horizontal. */
export function FeedSection({ items }: { items: Opportunity[] }) {
  const visible = items.slice(0, LIMIT);

  return (
    <section aria-labelledby="feed-heading">
      <SectionHeading id="feed-heading" title="Peluang Terbaru" subtitle="Kumpulan peluang Web3 terbaru dan terkurasi." href="/peluang" />

      {visible.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-border-subtle p-8 text-center text-sm text-muted-foreground">
          Belum ada peluang yang tayang. Cek lagi beberapa saat lagi.
        </p>
      ) : (
        <ul className="mt-4 grid grid-cols-1 gap-3 md:mt-5 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
          {visible.map((item, i) => (
            <li key={item.id}>
              <Reveal delay={i * 50} className="h-full">
                <OpportunityCard opportunity={item} priority={i < 3} />
              </Reveal>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
