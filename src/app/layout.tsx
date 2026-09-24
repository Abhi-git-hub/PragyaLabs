import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Anton, Inter, JetBrains_Mono } from "next/font/google";
import { SiteNav } from "@/components/navigation/SiteNav";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { BackgroundField } from "@/components/3d/BackgroundField";
import { CursorProvider } from "@/components/motion/CursorProvider";
import { Cursor } from "@/components/motion/Cursor";
import { Preloader } from "@/components/motion/Preloader";
import { ScrollCurves } from "@/components/motion/ScrollCurves";
import { RouteTransition } from "@/components/motion/RouteTransition";
import { SmoothScroll } from "@/lib/smooth-scroll";
import { site } from "@/config/site";
import "@/styles/globals.css";

const display = Anton({ weight: "400", subsets: ["latin"], variable: "--font-display" });
const body = Inter({ subsets: ["latin"], variable: "--font-body" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: `${site.name} — ${site.thesis}`,
  description: site.thesis,
  authors: [{ name: site.author }],
  openGraph: {
    title: site.name,
    description: site.thesis,
    type: "website",
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image", title: site.name, description: site.thesis },
};

export const viewport: Viewport = {
  themeColor: "#050608",
  colorScheme: "dark",
};

/**
 * Global page shell: fonts, ambient background system, nav, footer.
 * Lenis smoothing, contextual cursor, and subtle route transitions
 * wrap every route. Analytics + Speed Insights report real-user CWV (TRD §11).
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="bg-void font-body text-bone">
        <Preloader />
        <CursorProvider>
          <SmoothScroll>
            {/* Ambient background system — fixed, non-interactive, GPU-capped */}
            <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
              <BackgroundField />
            </div>
            <ScrollCurves />
            <SiteNav />
            <main id="main" className="relative z-10 pt-14">
              <RouteTransition>{children}</RouteTransition>
            </main>
            <div className="relative z-10">
              <SiteFooter />
            </div>
            <Cursor />
            <div className="film-grain" aria-hidden="true" />
          </SmoothScroll>
        </CursorProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
