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
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-charcoal/95 backdrop-blur supports-[backdrop-filter]:bg-charcoal/80">
      <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-4 py-3 md:px-6">
        <Logo />
        <DesktopNav />
        <div className="ml-auto flex items-center gap-2">
          <AccountMenu />
          <Link
            href="/plus"
            className="inline-flex items-center gap-1.5 rounded-full bg-gold px-4 py-2 text-sm font-semibold text-charcoal transition-transform hover:scale-[1.03] active:scale-95"
          >
            <Crown className="h-4 w-4" aria-hidden />
            Plus
          </Link>
        </div>
      </div>
      <div className="mx-auto max-w-[1440px] px-4 pb-3 md:px-6">
        <MarketTicker snapshot={snapshot} />
      </div>
    </header>
  );
}
