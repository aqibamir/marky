import "./globals.css";
import type { Metadata } from "next";
import { Barlow, Barlow_Semi_Condensed } from "next/font/google";
import Link from "next/link";
import ModeSwitcher from "@/components/ModeSwitcher";
import BrandMark from "@/components/BrandMark";
import { TabBar, TopNav } from "@/components/MainNav";

const sans = Barlow({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});
const display = Barlow_Semi_Condensed({
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "German Driving Theory",
  description: "Browse and practice the German driving theory questions, sorted by points.",
  viewport: {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f4ef" },
    { media: "(prefers-color-scheme: dark)", color: "#121315" },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Driving Theory",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground min-h-screen flex flex-col">
        <header className="safe-top sticky top-0 z-20 border-b border-border bg-background print:hidden">
          <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 font-display font-bold text-[19px] tracking-tight whitespace-nowrap"
            >
              <BrandMark />
              Driving Theory
            </Link>
            <TopNav />
            <ModeSwitcher />
          </div>
        </header>
        <div className="flex-1 flex flex-col pb-tabbar">{children}</div>
        <TabBar />
      </body>
    </html>
  );
}
