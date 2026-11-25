import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

/** Judul section + subjudul opsional + tautan "Lihat semua" ke route nyata. */
export function SectionHeading({
  id,
  title,
  subtitle,
  href,
  linkLabel = "Lihat semua",
  srSuffix,
  as: Tag = "h2",
}: {
  id: string;
  title: ReactNode;
  subtitle?: ReactNode;
  href?: string;
  linkLabel?: string;
  srSuffix?: string;
  as?: "h2" | "h3";
}) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div className="min-w-0">
        <Tag id={id} className="font-heading text-xl font-bold text-offwhite md:text-[26px]">
          {title}
        </Tag>
        {subtitle && <p className="mt-0.5 text-sm text-muted-foreground md:text-[15px]">{subtitle}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-lg px-1 text-sm font-medium text-gold underline-offset-4 hover:underline md:text-[15px]"
        >
          {linkLabel}
          {srSuffix && <span className="sr-only"> {srSuffix}</span>}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      )}
    </div>
  );
}
