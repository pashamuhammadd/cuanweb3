"use client";

import { useId, useState, type FormEvent } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent"; email: string }
  | { kind: "error"; message: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function toFriendlyMessage(error: { message: string; status?: number; code?: string }) {
  if (error.status === 429 || error.code === "over_email_send_rate_limit") {
    return "Batas pengiriman email sedang tercapai. Coba lagi dalam beberapa menit hingga 1 jam.";
  }
  if (error.code === "email_address_invalid") return "Alamat email tidak valid.";
  return "Gagal mengirim link masuk. Coba lagi beberapa saat lagi.";
}

export function EmailLoginForm({ redirectTo }: { redirectTo?: string }) {
  const inputId = useId();
  const statusId = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(trimmed) || trimmed.length > 254) {
      setStatus({ kind: "error", message: "Masukkan alamat email yang valid." });
      return;
    }

    setStatus({ kind: "sending" });
    try {
      const supabase = createSupabaseBrowserClient();
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      if (redirectTo) callbackUrl.searchParams.set("redirect", redirectTo);

      const { error } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: { emailRedirectTo: callbackUrl.toString(), shouldCreateUser: true },
      });

      if (error) {
        setStatus({ kind: "error", message: toFriendlyMessage(error) });
        return;
      }
      setStatus({ kind: "sent", email: trimmed });
    } catch {
      setStatus({ kind: "error", message: "Gagal mengirim link masuk. Periksa koneksi kamu." });
    }
  }

  if (status.kind === "sent") {
    return (
      <div
        role="status"
        className="rounded-xl border border-champagne/30 bg-champagne/10 p-4 text-left text-sm text-offwhite"
      >
        <p className="font-semibold">Cek inbox email kamu</p>
        <p className="mt-1 text-muted-foreground">
          Link masuk sudah dikirim ke <strong className="text-offwhite">{status.email}</strong>.
          Buka link tersebut di browser ini. Periksa folder spam bila belum ada.
        </p>
        <button
          type="button"
          onClick={() => setStatus({ kind: "idle" })}
          className="mt-3 min-h-11 text-sm font-semibold text-gold underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          Pakai email lain
        </button>
      </div>
    );
  }

  const isSending = status.kind === "sending";

  return (
    <form onSubmit={handleSubmit} noValidate className="text-left">
      <label htmlFor={inputId} className="text-sm font-medium text-offwhite">
        Email
      </label>
      <input
        id={inputId}
        type="email"
        name="email"
        inputMode="email"
        autoComplete="email"
        required
        maxLength={254}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-invalid={status.kind === "error"}
        aria-describedby={status.kind === "error" ? statusId : undefined}
        placeholder="nama@email.com"
        className="mt-1.5 block h-12 w-full rounded-xl border border-border-subtle bg-surface-raised px-4 text-sm text-offwhite placeholder:text-muted-foreground focus-visible:border-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      />
      <button
        type="submit"
        disabled={isSending}
        className="press mt-3 inline-flex h-12 w-full items-center justify-center rounded-xl bg-gold px-5 text-sm font-semibold text-charcoal transition-[filter] hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-offwhite disabled:opacity-60"
      >
        {isSending ? "Mengirim…" : "Kirim link masuk"}
      </button>
      {status.kind === "error" && (
        <p id={statusId} role="alert" className="mt-2 text-sm text-rose-300">
          {status.message}
        </p>
      )}
    </form>
  );
}
