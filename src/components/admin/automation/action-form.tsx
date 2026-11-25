"use client";

import { useActionState, type ReactNode } from "react";
import type { ActionResult } from "@/lib/actions/automation";
import { cn } from "@/lib/cn";

type Action = (prev: ActionResult, formData: FormData) => Promise<ActionResult>;

const initial: ActionResult = { status: "idle" };

/**
 * Form server action dengan pesan hasil yang diumumkan ke screen reader.
 * `submitLabel`/`pendingLabel` dipakai untuk tombol utama.
 */
export function ActionForm({
  action,
  children,
  submitLabel,
  pendingLabel = "Memproses…",
  variant = "primary",
  className,
}: {
  action: Action;
  children?: ReactNode;
  submitLabel: string;
  pendingLabel?: string;
  variant?: "primary" | "secondary" | "danger";
  className?: string;
}) {
  const [state, formAction, isPending] = useActionState(action, initial);

  return (
    <form action={formAction} className={cn("space-y-3", className)}>
      {children}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className={cn(
            "inline-flex min-h-10 items-center rounded-full px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60",
            variant === "primary" && "bg-gold text-charcoal hover:bg-gold/90",
            variant === "secondary" && "border border-border-strong text-offwhite hover:border-teal hover:text-teal",
            variant === "danger" && "border border-rose-400/50 text-rose-300 hover:bg-rose-400/10",
          )}
        >
          {isPending ? pendingLabel : submitLabel}
        </button>
        <span role="status" aria-live="polite" className="text-sm">
          {state.status === "ok" && <span className="text-emerald-400">{state.message}</span>}
          {state.status === "error" && <span className="text-rose-300">{state.message}</span>}
        </span>
      </div>
      {state.detail && (
        <pre className="max-h-48 overflow-auto rounded-lg bg-surface-raised p-3 text-xs whitespace-pre-wrap text-muted-foreground">
          {state.detail}
        </pre>
      )}
    </form>
  );
}
