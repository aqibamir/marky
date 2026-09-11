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
          <div className="max-w-4xl mx-auto px-2 sm:px-4">
            <div className="flex items-center justify-between h-14 px-2">
              <Link href="/" className="font-bold tracking-tight shrink-0">
                🚗 Driving Theory
              </Link>
              <ModeSwitcher />
            </div>
            <nav className="flex text-sm font-medium border-t border-border -mx-2 sm:mx-0">
              {[
                ["/practice", "Practice"],
                ["/history", "History"],
                ["/insights", "Insights"],
                ["/driving-questions", "Browse"],
              ].map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  className="flex-1 text-center py-3 hover:text-primary hover:bg-secondary/50 active:bg-secondary transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <div className="flex-1 flex flex-col">{children}</div>
      </body>
    </html>
  );
}
