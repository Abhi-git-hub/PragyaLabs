import Link from "next/link";
import { Reveal, Stagger } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { services } from "@/data/services";

/**
 * Services strip — the commercial spine on the homepage. Four disciplines,
 * one line each, linking to the pages that own each intent. Editorial rows,
 * not agency blocks; also gives crawlers the service vocabulary the
 * cinematic sections deliberately avoid stuffing.
 */
export function ServicesStrip() {
  return (
    <SectionContainer eyebrow="What the studio builds">
      <Stagger>
        {services.map((s) => (
          <Link
            key={s.slug}
            data-stagger-item
            data-cursor="OPEN"
            href={`/services/${s.slug}`}
            className="group grid gap-1 border-t border-line py-6 last:border-b md:grid-cols-[220px_1fr_auto] md:gap-8 md:items-baseline"
          >
            <span className="meta text-faint">{s.kicker}</span>
            <span>
              <span className="block font-display text-xl uppercase transition-transform duration-300 group-hover:translate-x-2 md:text-2xl">
                {s.h1}
              </span>
              <span className="mt-1 block max-w-[62ch] text-sm leading-relaxed text-muted">
                {s.lede.split(".")[0]}.
              </span>
            </span>
            <span aria-hidden="true" className="meta text-faint transition-colors group-hover:text-cyan">
              →
            </span>
          </Link>
        ))}
      </Stagger>
      <Reveal>
        <p className="meta mt-8 text-faint">
          Delhi, India — working worldwide.{" "}
          <Link href="/contact" className="text-muted transition-colors hover:text-cyan">
            Start a project →
          </Link>
        </p>
      </Reveal>
    </SectionContainer>
  );
}
