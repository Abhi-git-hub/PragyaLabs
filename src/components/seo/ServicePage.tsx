import Link from "next/link";
import { Display, Eyebrow } from "@/components/typography/Type";
import { Reveal, Stagger } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { BreadcrumbListJsonLd } from "@/components/seo/JsonLd";
import { site } from "@/config/site";
import type { Service } from "@/data/services";

/**
 * Shared commercial page composition — editorial rows in the studio voice,
 * never generic agency blocks. One H1, real evidence, one clear CTA.
 */
export function ServicePage({ service }: { service: Service }) {
  const trail = [
    { label: "Index", href: "/" },
    { label: "Services", href: "/services" },
    { label: service.h1 },
  ];

  return (
    <>
      <BreadcrumbListJsonLd
        items={trail
          .filter((t) => t.href)
          .map((t) => ({ name: t.label, url: `${site.url}${t.href}` }))}
      />
      <SectionContainer>
        <Reveal>
          <Breadcrumb trail={trail} />
        </Reveal>
        <Reveal>
          <Display as="h1" size="lg" className="mt-8 max-w-[16ch]">
            {service.h1}
          </Display>
          <p className="mt-6 max-w-[62ch] text-base leading-relaxed text-muted md:text-lg">
            {service.lede}
          </p>
        </Reveal>

        <Stagger className="mt-12 grid gap-10 md:grid-cols-2">
          <div data-stagger-item>
            <Eyebrow className="mb-4 text-faint">Who this is for</Eyebrow>
            <ul className="space-y-3">
              {service.forWho.map((w) => (
                <li key={w} className="border-t border-line pt-3 leading-relaxed text-muted">
                  {w}
                </li>
              ))}
            </ul>
          </div>
          <div data-stagger-item>
            <Eyebrow className="mb-4 text-faint">Problems it solves</Eyebrow>
            <ul className="space-y-3">
              {service.problems.map((p) => (
                <li key={p} className="border-t border-line pt-3 leading-relaxed text-muted">
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </Stagger>
      </SectionContainer>

      <SectionContainer eyebrow="How it gets built">
        <Stagger className="max-w-[880px]">
          {service.process.map((s, i) => (
            <div key={s.title} data-stagger-item className="border-t border-line py-7 last:border-b">
              <div className="flex items-baseline gap-6">
                <Eyebrow className="text-faint">0{i + 1}</Eyebrow>
                <h2 className="font-display text-2xl uppercase leading-tight md:text-3xl">{s.title}</h2>
              </div>
              <p className="mt-2 max-w-[62ch] pl-12 leading-relaxed text-muted md:pl-14">{s.body}</p>
            </div>
          ))}
        </Stagger>
      </SectionContainer>

      <SectionContainer eyebrow="Proof, not promises">
        <Reveal>
          <ul className="space-y-0">
            {service.proof.map((p) => (
              <li key={p.href + p.label} className="border-t border-line last:border-b">
                <Link
                  href={p.href}
                  data-cursor="OPEN"
                  className="group flex items-baseline justify-between gap-4 py-5"
                >
                  <span className="font-display text-xl uppercase transition-transform duration-300 group-hover:translate-x-2 md:text-2xl">
                    {p.label}
                  </span>
                  <span aria-hidden="true" className="meta text-faint transition-colors group-hover:text-cyan">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="meta mt-6 text-faint">Stack — {service.stack.join(" / ")}</p>
        </Reveal>
      </SectionContainer>

      <SectionContainer eyebrow="Honest answers">
        <Stagger className="max-w-[880px]">
          {service.faq.map((f) => (
            <div key={f.q} data-stagger-item className="border-t border-line py-6 last:border-b">
              <h2 className="text-lg text-bone">{f.q}</h2>
              <p className="mt-2 max-w-[62ch] leading-relaxed text-muted">{f.a}</p>
            </div>
          ))}
        </Stagger>
      </SectionContainer>

      <SectionContainer>
        <Reveal>
          <Eyebrow className="mb-4 text-faint">Related</Eyebrow>
          <p className="meta leading-loose">
            {service.related.map((r, i) => (
              <span key={r.href}>
                {i > 0 && <span className="text-faint"> / </span>}
                <Link href={r.href} className="text-muted transition-colors hover:text-cyan">
                  {r.label} →
                </Link>
              </span>
            ))}
          </p>
          <Link
            href="/contact"
            data-cursor="OPEN"
            className="meta mt-8 inline-block border border-line-strong px-5 py-3 text-bone transition-colors hover:border-cyan hover:text-cyan"
          >
            Start a project →
          </Link>
          <p className="meta mt-4 text-faint">
            {site.location} — replies within 12 hours
          </p>
        </Reveal>
      </SectionContainer>
    </>
  );
}
