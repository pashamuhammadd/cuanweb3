import Image from "next/image";
import Link from "next/link";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-2 shrink-0 ${className ?? ""}`}
      aria-label="CuanWeb3 — ke beranda"
    >
      <Image
        src="/assets/cua/avatar.png"
        alt=""
        width={36}
        height={36}
        className="h-9 w-9 object-contain"
        priority
      />
      <span className="font-heading text-lg font-extrabold tracking-tight whitespace-nowrap">
        <span className="text-offwhite">CUAN</span>
        <span className="text-gold">WEB3</span>
      </span>
    </Link>
  );
}
