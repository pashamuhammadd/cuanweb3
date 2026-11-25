import { Logo } from "./logo";
import { DesktopNav } from "./desktop-nav";
import { AccountMenu } from "./account-menu";
import { getMarketSnapshot } from "@/lib/market";
import { MarketTicker } from "@/components/market/market-ticker";

export async function SiteHeader() {
  const snapshot = await getMarketSnapshot();

  return (
    <header className="sticky top-0 z-40 bg-charcoal/90 backdrop-blur-md supports-[backdrop-filter]:bg-charcoal/80">
      <div className="border-b border-border-faint">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-3 px-4 md:h-16 md:px-6 lg:gap-8 lg:px-10">
          <Logo />
          <DesktopNav />
          <div className="ml-auto flex items-center gap-2">
            <AccountMenu />
          </div>
        </div>
      </div>
      <div className="border-b border-border-faint bg-section/80">
        <div className="mx-auto max-w-[1440px] px-4 md:px-6 lg:px-10">
          <MarketTicker snapshot={snapshot} />
        </div>
      </div>
    </header>
  );
}
