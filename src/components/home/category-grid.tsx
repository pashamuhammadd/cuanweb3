import Image from "next/image";
import Link from "next/link";
import { HOME_CATEGORIES } from "@/lib/nav";

export function CategoryGrid() {
  return (
    <section aria-labelledby="kategori-heading" className="mx-auto max-w-[1440px] px-4 py-8 md:px-6">
      <h2 id="kategori-heading" className="sr-only">
        Kategori peluang
      </h2>
      <div className="grid grid-cols-3 gap-3 md:grid-cols-6 md:gap-4">
        {HOME_CATEGORIES.map((category, i) => (
          <Link
            key={category.slug}
            href={category.href}
            className="group flex flex-col items-center gap-2 rounded-2xl border border-border-subtle bg-surface p-3 text-center transition-all duration-200 hover:-translate-y-1 hover:border-gold/60 md:p-4"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="relative h-14 w-14 md:h-16 md:w-16">
              <Image
                src={category.image}
                alt=""
                fill
                sizes="64px"
                className="object-contain"
              />
            </div>
            <span className="text-xs font-medium text-offwhite group-hover:text-gold md:text-sm">
              {category.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
