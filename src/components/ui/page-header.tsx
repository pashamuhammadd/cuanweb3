import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Header halaman ringkas: visual kecil opsional + judul + deskripsi + aksi. */
export function PageHeader({
  visual,
  title,
  description,
  actions,
  className,
}: {
  visual?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-wrap items-center gap-4", className)}>
      {visual && <div className="shrink-0">{visual}</div>}
      <div className="min-w-0 flex-1">
        <h1 className="font-heading text-2xl font-bold text-offwhite md:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground md:text-base">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}
