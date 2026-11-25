import Image from "next/image";
import type { OpportunityCategory } from "@/lib/supabase/database.types";
import { categoryIllustration, categoryStyle } from "@/lib/category-theme";
import { getCategory } from "@/lib/nav";
import { cn } from "@/lib/cn";

const SIZES = {
  sm: { box: "h-9 w-9 rounded-lg", img: 28, icon: "h-4.5 w-4.5" },
  md: { box: "h-12 w-12 rounded-xl md:h-14 md:w-14", img: 48, icon: "h-6 w-6" },
  lg: { box: "h-14 w-14 rounded-2xl md:h-20 md:w-20", img: 80, icon: "h-7 w-7 md:h-9 md:w-9" },
  xl: { box: "h-20 w-20 rounded-2xl md:h-28 md:w-28", img: 112, icon: "h-9 w-9 md:h-12 md:w-12" },
} as const;

/**
 * Tile ikon kategori: ilustrasi WebP bila tersedia, fallback ikon Lucide.
 * Selalu dekoratif (alt="") karena label teks kategori ditampilkan di sebelahnya.
 */
export function CategoryIcon({
  category,
  size = "md",
  className,
  priority,
}: {
  category: OpportunityCategory;
  size?: keyof typeof SIZES;
  className?: string;
  priority?: boolean;
}) {
  const s = SIZES[size];
  const src = categoryIllustration(category);
  const Icon = getCategory(category).icon;

  return (
    <span
      aria-hidden
      style={categoryStyle(category)}
      className={cn("cat-tile relative inline-flex shrink-0 items-center justify-center overflow-hidden ring-1 ring-white/5", s.box, className)}
    >
      {src ? (
        <Image
          src={src}
          alt=""
          width={s.img}
          height={s.img}
          sizes={`${s.img}px`}
          priority={priority}
          className="h-[86%] w-[86%] object-contain"
        />
      ) : (
        <Icon className={s.icon} strokeWidth={1.75} />
      )}
    </span>
  );
}
