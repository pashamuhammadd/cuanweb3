import Image from "next/image";
import Link from "next/link";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`press flex min-h-10 shrink-0 items-center gap-2 rounded-lg ${className ?? ""}`}
      aria-label="CuanWeb3, ke beranda"
    >
      <Image
        src="/assets/cua/avatar.png"
        alt=""
        width={36}
        height={36}
        className="h-8 w-8 object-contain md:h-9 md:w-9"
        priority
      />
      <span className="font-heading text-[17px] font-extrabold tracking-tight whitespace-nowrap md:text-lg">
        <span className="text-offwhite">CUAN</span>
        <span className="text-gold">WEB3</span>
      </span>
    </Link>
  );
}
