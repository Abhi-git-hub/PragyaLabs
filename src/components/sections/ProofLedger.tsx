import Link from "next/link";
import { Display } from "@/components/typography/Type";
import { Reveal, Stagger } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";

/**
 * PROOF LEDGER — credibility without testimonials. No borrowed logos, no
 * invented quotes: every line links to something real you can open —
 * live products, open code, and this website itself.
 */
const ENTRIES = [
  {
    name: "Saarthians",
    fact: "Live at saarthians.online — real usage across 10 countries, predominantly mobile.",
    links: [
      { label: "Live", href: "https://saarthians.online" },
      { label: "Code", href: "https://github.com/Abhi-git-hub/Saarthians" },
      { label: "Case", href: "/work/saarthians" },
    ],
  },
  {
    name: "Adhyayan Classes",
    fact: "Live at adhyayanclasses.vercel.app since 2023 — a coaching institute's website, kept running.",
    links: [
      { label: "Live", href: "https://adhyayanclasses.vercel.app" },
      { label: "Code", href: "https://github.com/Abhi-git-hub/Adhyayan-Classes" },
      { label: "Case", href: "/work/adhyayan-classes" },
    ],
  },
  {
    name: "This website",
    fact: "The portfolio piece — realtime WebGL, scroll choreography, and every film above, all in production.",
    links: [{ label: "Source", href: "https://github.com/Abhi-git-hub/PragyaLabs" }],
  },
];

export function ProofLedger() {
  return (
    <SectionContainer eyebrow="Case studies">
      <Reveal>
        <Display size="md" className="max-w-[20ch]">
          Built from real problems, not generic templates.
        </Display>
        <p className="mt-6 max-w-[62ch] text-base leading-relaxed text-muted md:text-lg">
          No testimonials, no borrowed logos. Open the links — the work is where it
          claims to be.
        </p>
      </Reveal>
      <Stagger className="mt-12 space-y-0">
        {ENTRIES.map((e) => (
          <article
            key={e.name}
            data-stagger-item
            className="grid gap-3 border-t border-line py-8 last:border-b md:grid-cols-[220px_1fr_auto] md:items-baseline md:gap-8"
          >
            <h3 className="font-display text-2xl uppercase md:text-3xl">{e.name}</h3>
            <p className="max-w-[62ch] text-base leading-relaxed text-muted">{e.fact}</p>
            <p className="meta leading-loose">
              {e.links.map((l, i) => (
                <span key={l.href + l.label}>
                  {i > 0 && <span className="text-faint"> / </span>}
                  <Link
                    href={l.href}
                    data-cursor="OPEN"
                    className="text-muted transition-colors hover:text-cyan"
                    {...(l.href.startsWith("http")
                      ? { target: "_blank", rel: "noreferrer" }
                      : {})}
                  >
                    {l.label} →
                  </Link>
                </span>
              ))}
            </p>
          </article>
        ))}
      </Stagger>
    </SectionContainer>
  );
}
