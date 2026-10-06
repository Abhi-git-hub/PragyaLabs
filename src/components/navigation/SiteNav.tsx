"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
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
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const lastY = useRef(0);
  const reduced = usePrefersReducedMotion();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(max > 0 ? Math.min(1, y / max) : 0);
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

  // Active section indicator — homepage anchors only.
  useEffect(() => {
    if (pathname !== "/") {
      setActiveSection(null);
      return;
    }
    const ids = ["capabilities", "method", "work", "start"];
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection(`/#${entry.target.id}`);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return (
    <header
      className={cn(
        "nav-enter fixed inset-x-0 top-0 z-50 transition-all duration-500",
        pastHero
          ? "glass-signal border-b border-line"
          : "border-b border-transparent bg-transparent",
        hidden && !open ? "-translate-y-full" : "translate-y-0"
      )}
      >      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:bg-cyan focus:px-3 focus:py-2 focus:font-mono focus:text-xs focus:text-black"
      >
        Skip to content
      </a>
      {/* Journey progress — 1px energy line under the bar */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px origin-left bg-cyan/70"
        style={{ transform: `scaleX(${progress})` }}
      />
      <nav
        aria-label="Primary"
        className="mx-auto flex h-14 w-full max-w-[var(--pl-container)] items-center justify-between px-[var(--pl-gutter)]"
      >
        <Link href="/" className="flex items-center gap-3" aria-label="Pragya Labs home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" aria-hidden="true" className="block h-8 w-8 object-contain" />
          <span className="font-display text-sm uppercase tracking-[0.08em]">
            Pragya<span className="text-cyan">—</span>Labs
          </span>
        </Link>

        <ul className="hidden items-center gap-7 md:flex">
          {nav.map((r) => {
            const isActive = pathname === r.href || (pathname === "/" && activeSection === r.href);
            return (
              <li key={r.href}>
                <Link
                  href={r.href}
                  aria-current={isActive ? (r.href.startsWith("/#") ? "true" : "page") : undefined}
                  className={cn(
                    "meta link-line transition-colors hover:text-bone",
                    isActive ? "link-line-active" : "text-faint"
                  )}
                >
                  {r.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden items-center gap-5 md:flex">
          <span className="meta text-faint">{site.location}</span>
          <Link
            href="/contact"
            data-cursor="OPEN"
            className="btn-nav meta bg-cyan px-4 py-2 transition-colors hover:bg-lime"
          >
            Start a project
          </Link>
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

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="border-t border-line bg-void md:hidden"
          >
            <ul className="space-y-1 px-[var(--pl-gutter)] py-4">
              {nav.map((r, i) => (
                <motion.li
                  key={r.href}
                  initial={reduceMotion ? false : { opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.32, delay: 0.05 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    href={r.href}
                    onClick={() => setOpen(false)}
                    aria-current={pathname === r.href ? "page" : undefined}
                    className={cn(
                      "flex items-baseline gap-3 py-2 font-display text-2xl uppercase",
                      pathname === r.href ? "text-bone" : "text-muted"
                    )}
                  >
                    {r.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
