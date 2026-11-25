import Link from "next/link";
import { Crown } from "lucide-react";
import { Logo } from "./logo";
import { DesktopNav } from "./desktop-nav";
import { AccountMenu } from "./account-menu";
import { getMarketSnapshot } from "@/lib/market";
import { MarketTicker } from "@/components/market/market-ticker";

export async function SiteHeader() {
  const snapshot = await getMarketSnapshot();

  return (
    <header className="sticky top-0 z-40 border-b border-border-faint bg-charcoal/85 backdrop-blur-md supports-[backdrop-filter]:bg-charcoal/75">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-3 px-4 md:h-16 md:px-6 lg:gap-6">
        <Logo />
        <DesktopNav />
        <div className="ml-auto flex items-center gap-2">
          <AccountMenu />
          <Link
            href="/plus"
            className="press glow-gold inline-flex h-10 items-center gap-1.5 rounded-xl bg-gold px-3 text-sm font-semibold text-charcoal transition-[filter] hover:brightness-105 sm:px-4"
          >
            <Crown className="h-4 w-4" aria-hidden />
            Plus
          </Link>
        </div>
      </div>
      <div className="mx-auto max-w-[1440px] px-4 pb-2.5 md:px-6">
        <MarketTicker snapshot={snapshot} />
      </div>
    </header>
  );
}
