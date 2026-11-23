import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist } from "next/font/google";
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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "CuanWeb3 — Temukan peluang. Raih cuan.",
    template: "%s — CuanWeb3",
  },
  description:
    "CuanWeb3 membantu masyarakat Indonesia menemukan peluang penghasilan Web3: airdrop, giveaway, bounty, kontes, pekerjaan, hackathon, dan grants dalam satu tempat.",
  icons: {
    icon: "/assets/cua/avatar.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0c1117",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${bricolage.variable} ${geist.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-background text-foreground antialiased">
        <SiteHeader />
        <main className="flex-1 pb-20 md:pb-0">{children}</main>
        <SiteFooter />
        <MobileBottomNav />
      </body>
    </html>
  );
}
