import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import ModeSwitcher from "@/components/ModeSwitcher";

export const metadata: Metadata = {
  title: "German Driving Theory",
  description: "Browse and practice the German driving theory questions, sorted by points.",
  viewport: {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
  },
  themeColor: "#0b1512",
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
    <html lang="en">
      <body className="font-sans antialiased bg-background text-foreground min-h-screen flex flex-col">
        <header className="safe-top sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
          <nav className="max-w-4xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2">
            <Link href="/" className="font-bold tracking-tight">
              🚗 Driving Theory
            </Link>
            <div className="flex gap-4 text-sm font-medium">
              <Link href="/practice" className="hover:text-primary">
                Practice
              </Link>
              <Link href="/insights" className="hover:text-primary">
                Insights
              </Link>
              <Link href="/driving-questions" className="hover:text-primary">
                Browse
              </Link>
            </div>
            <ModeSwitcher />
          </nav>
        </header>
        <div className="flex-1 flex flex-col">{children}</div>
      </body>
    </html>
  );
}
