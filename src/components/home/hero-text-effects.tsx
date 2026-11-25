"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

const GLYPHS = "01<>/{}[]=+*#_$;:";

function scramble(text: string, revealed: number, seed: number) {
  let out = "";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    out += i < revealed || ch === " " ? ch : GLYPHS[(7 * i + seed) % GLYPHS.length];
  }
  return out;
}

/**
 * Teks yang "terdekode" dari karakter acak menjadi teks asli.
 * Pembaca layar selalu menerima teks asli lewat span sr-only.
 */
export function DecodeText({
  text,
  delay = 0,
  duration = 900,
  className,
}: {
  text: string;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(text);

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      const p = Math.max(0, Math.min(1, (now - start - delay) / duration));
      setShown(p >= 1 ? text : scramble(text, Math.floor(p * text.length), Math.floor(now / 55)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      setShown(text);
    };
  }, [text, delay, duration, reduced]);

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{reduced ? text : shown}</span>
    </span>
  );
}

/** Baris perintah ala terminal yang mengetik dan menghapus kategori secara bergiliran. */
export function TypedCommand({ items }: { items: string[] }) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [length, setLength] = useState(items[0]?.length ?? 0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (reduced || items.length === 0) return;
    const word = items[index];
    let wait = deleting ? 28 : 70;
    if (!deleting && length === word.length) wait = 1800;
    if (deleting && length === 0) wait = 260;
    const t = setTimeout(() => {
      if (!deleting && length === word.length) setDeleting(true);
      else if (deleting && length === 0) {
        setDeleting(false);
        setIndex((i) => (i + 1) % items.length);
      } else setLength((l) => l + (deleting ? -1 : 1));
    }, wait);
    return () => clearTimeout(t);
  }, [index, length, deleting, items, reduced]);

  const word = items[index] ?? "";

  return (
    <p
      aria-hidden="true"
      className="mt-5 flex min-h-6 items-center gap-2 font-mono text-[0.8rem] text-muted-foreground sm:text-sm"
    >
      <span className="text-gold">$</span>
      <span>cari</span>
      <span className="text-offwhite">
        peluang/{reduced ? items[0] : word.slice(0, length)}
      </span>
      <span className="caret -ml-1 inline-block h-[1.1em] w-[0.55em] bg-gold" />
    </p>
  );
}
