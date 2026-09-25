import { Display, Eyebrow } from "@/components/typography/Type";
import { Reveal, Stagger } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { Breadcrumb, BreadcrumbJsonLd } from "@/components/seo/Breadcrumb";
import { services } from "@/data/services";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Services — AI, Web, Software & Creative Technology | Pragya Labs",
  description:
    "What Pragya Labs builds: custom AI systems, web applications, software platforms and interactive experiences — each with proof, not promises.",
  canonical: "/services",
});

/** Services index — four disciplines, each owning its intent. */
export default function ServicesPage() {
  const trail = [{ label: "Index", href: "/" }, { label: "Services" }];
  return (
    <>
      <BreadcrumbJsonLd trail={trail} />
      <SectionContainer>
        <Reveal>
          <Breadcrumb trail={trail} />
        </Reveal>
        <Reveal>
          <Display size="lg" className="mt-8 max-w-[14ch]">
            What the studio builds.
          </Display>
          <p className="mt-6 max-w-[62ch] text-base leading-relaxed text-muted md:text-lg">
            Four disciplines, one standard: shipped systems with evidence behind every claim.
          </p>
        </Reveal>
        <Stagger className="mt-12">
          {services.map((s) => (
            <a
              key={s.slug}
              data-stagger-item
              data-cursor="OPEN"
              href={`/services/${s.slug}`}
              className="group grid gap-2 border-t border-line py-7 last:border-b md:grid-cols-[220px_1fr_auto] md:gap-8 md:items-baseline"
            >
              <span className="meta text-faint">{s.kicker}</span>
              <span>
                <span className="block font-display text-2xl uppercase transition-transform duration-300 group-hover:translate-x-2 md:text-3xl">
                  {s.slug.replace(/-/g, " ")}
                </span>
                <span className="mt-2 block max-w-[62ch] text-sm leading-relaxed text-muted">
                  {s.metaDescription}
                </span>
              </span>
              <span aria-hidden="true" className="meta text-faint transition-colors group-hover:text-cyan">
                →
              </span>
            </a>
          ))}
        </Stagger>
        <Reveal>
          <Eyebrow className="mt-10 text-faint">Based in Delhi, India — working worldwide</Eyebrow>
        </Reveal>
      </SectionContainer>
    </>
  );
}
