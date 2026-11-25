import Image from "next/image";
import type { OpportunityCategory } from "@/lib/supabase/database.types";
import { categoryIllustration } from "@/lib/category-theme";
import { getCategory } from "@/lib/nav";
import { cn } from "@/lib/cn";

/** Ukuran tampil ikon (px). File WebP sudah punya padding internal. */
const SIZES = {
  xs: { px: 20, box: "h-5 w-5", icon: "h-4 w-4" },
  sm: { px: 28, box: "h-7 w-7", icon: "h-5 w-5" },
  md: { px: 40, box: "h-9 w-9 md:h-10 md:w-10", icon: "h-6 w-6" },
  lg: { px: 56, box: "h-12 w-12 md:h-14 md:w-14", icon: "h-8 w-8" },
  xl: { px: 96, box: "h-12 w-12 md:h-24 md:w-24", icon: "h-8 w-8 md:h-14 md:w-14" },
} as const;

/**
 * Ikon garis gold kategori (tanpa maskot). Fallback ikon Lucide bila file
 * belum tersedia. Selalu dekoratif: label teks kategori ada di sebelahnya.
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
    <span aria-hidden className={cn("relative inline-flex shrink-0 items-center justify-center text-gold", s.box, className)}>
      {src ? (
        <Image
          src={src}
          alt=""
          width={s.px}
          height={s.px}
          sizes={`${s.px * 2}px`}
          priority={priority}
          className="h-full w-full scale-[1.3] object-contain"
        />
      ) : (
        <Icon className={s.icon} strokeWidth={1.6} />
      )}
    </span>
  );
}
