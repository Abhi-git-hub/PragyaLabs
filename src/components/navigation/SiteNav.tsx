"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { nav, site } from "@/config/site";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/cn";

/**
 * Premium minimal navigation (Phase 2): fixed hairline bar, index numbers,
 * mono labels. Hides on scroll-down, returns on scroll-up (desktop, full
 * motion only); intensifies its backdrop once past the hero. Mobile menu is
 * a full-width index sheet, intentionally designed — not a shrunken desktop.
 */
export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const lastY = useRef(0);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        setPastHero(y > window.innerHeight * 0.7);
        if (open || y <= 240) setHidden(false);
        else if (y > lastY.current + 4) setHidden(true);
        else if (y < lastY.current - 4) setHidden(false);
        lastY.current = y;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [reduced, open ]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b border-line backdrop-blur-md transition-transform duration-300",
        pastHero ? "bg-void/90" : "bg-void/60",
        hidden && !open ? "-translate-y-full" : "translate-y-0"
      )}
    >      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:bg-cyan focus:px-3 focus:py-2 focus:font-mono focus:text-xs focus:text-black"
      >
        Skip to content
      </a>
      <nav
        aria-label="Primary"
        className="mx-auto flex h-14 w-full max-w-[var(--pl-container)] items-center justify-between px-[var(--pl-gutter)]"
      >
        <Link href="/" className="font-display text-sm uppercase tracking-[0.08em]" aria-label="Pragya Labs home">
          Pragya<span className="text-cyan">—</span>Labs
        </Link>

        <ul className="hidden items-center gap-7 md:flex">
          {nav.map((r) => (
            <li key={r.href}>
              <Link
                href={r.href}
                aria-current={pathname === r.href ? "page" : undefined}
                className={cn(
                  "meta transition-colors hover:text-bone",
                  pathname === r.href ? "text-bone" : "text-faint"
                )}
              >
                <span className="mr-1.5 text-faint">{r.index}</span>
                {r.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          <span className="meta text-faint">{site.location}</span>
          <span className="inline-block size-1.5 rounded-full bg-lime" aria-hidden="true" />
          <span className="meta text-faint">SYS.ONLINE</span>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="meta border border-line px-3 py-2 text-bone md:hidden"
        >
          {open ? "Close" : "Menu"}
        </button>
      </nav>

      {open && (
        <div id="mobile-menu" className="border-t border-line bg-void md:hidden">
          <ul className="space-y-1 px-[var(--pl-gutter)] py-4">
            {nav.map((r) => (
              <li key={r.href}>
                <Link
                  href={r.href}
                  onClick={() => setOpen(false)}
                  aria-current={pathname === r.href ? "page" : undefined}
                  className={cn(
                    "flex items-baseline gap-3 py-2 font-display text-2xl uppercase",
                    pathname === r.href ? "text-bone" : "text-muted"
                  )}
                >
                  <span className="meta text-faint">{r.index}</span>
                  {r.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
