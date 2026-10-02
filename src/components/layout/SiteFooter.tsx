import Link from "next/link";
import { footerNav, site } from "@/config/site";

/** Global page shell: skip link target, nav offset, footer with real data only. */
export function SiteFooter() {
  return (
    <footer className="theme-ink border-t border-line bg-ink text-bone">
      <div className="mx-auto grid w-full max-w-[var(--pl-container)] gap-10 px-[var(--pl-gutter)] py-12 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <p className="font-display text-2xl uppercase">Pragya Labs</p>
          <p className="mt-4 max-w-[38ch] text-sm leading-relaxed text-muted">
            Pragya Labs is an independent digital systems studio building custom AI
            systems, RAG applications, web products, and immersive digital experiences.
          </p>
          <p className="meta mt-4 text-faint">Intelligent systems, thoughtfully built.</p>
        </div>
        <nav aria-label="Footer">
          <p className="meta mb-4 text-faint">Index</p>
          <ul className="space-y-2">
            {footerNav.map((r) => (
              <li key={r.href}>
                <Link href={r.href} className="meta transition-colors hover:text-bone">
                  {r.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="meta mb-4 text-faint">Coordinates</p>
          <p className="meta">{site.location}</p>
          <p className="meta mt-2">{site.year}</p>
          <p className="meta mt-2 text-faint">Independent studio</p>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex w-full max-w-[var(--pl-container)] items-center justify-between px-[var(--pl-gutter)] py-4">
          <p className="meta text-faint">© {site.year} {site.name}</p>
          <p className="meta text-faint">{site.internalPhrase}</p>
        </div>
      </div>
    </footer>
  );
}
