import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "CuanWeb3: Temukan peluang. Raih cuan.",
    template: "%s | CuanWeb3",
  },
  description:
    "CuanWeb3 membantu masyarakat Indonesia menemukan peluang penghasilan Web3: airdrop, giveaway, bounty, kontes, pekerjaan, hackathon, dan grants dalam satu tempat.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0c1117",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${bricolage.variable} ${geist.variable} ${geistMono.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-background text-foreground antialiased">
        <noscript>
          <style>{`.reveal{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <a
          href="#konten"
          className="sr-only rounded-full bg-gold px-4 py-2 text-sm font-semibold text-charcoal focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:px-4 focus:py-2"
        >
          Lewati ke konten
        </a>
        <SiteHeader />
        <main id="konten" tabIndex={-1} className="flex-1 pb-[calc(4.5rem+env(safe-area-inset-bottom))] focus:outline-none lg:pb-0">
          {children}
        </main>
        <SiteFooter />
        <MobileBottomNav />
      </body>
    </html>
  );
}
