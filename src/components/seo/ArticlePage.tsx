import Link from "next/link";
import { Display, Eyebrow } from "@/components/typography/Type";
import { Reveal, Stagger } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { BreadcrumbListJsonLd, TechArticleJsonLd } from "@/components/seo/JsonLd";
import { site } from "@/config/site";
import type { Article } from "@/data/articles";
import { getService } from "@/data/services";
import { getProject } from "@/data/projects";

/**
 * Article renderer — H1, lede, date, sections, proof links, CTA.
 * One template for every Insights piece; content lives in data/articles.
 */
export function ArticlePage({ article, canonical }: { article: Article; canonical: string }) {
  const service = getService(article.serviceSlug);
  const cases = article.caseSlugs
    .map((slug) => getProject(slug))
    .filter((p): p is NonNullable<typeof p> => p !== undefined);
  const trail = [
    { label: "Index", href: "/" },
    { label: "Insights", href: "/insights" },
    { label: article.h1 },
  ];

  return (
    <>
      <BreadcrumbListJsonLd
        items={trail
          .filter((t) => t.href)
          .map((t) => ({ name: t.label, url: `${site.url}${t.href}` }))}
      />
      <TechArticleJsonLd
        headline={article.h1}
        description={article.metaDescription}
        url={`${site.url}${canonical}`}
        about={article.keywords}
      />
      <SectionContainer>
        <Reveal>
          <Breadcrumb trail={trail} />
        </Reveal>
        <Reveal>
          <Eyebrow className="mb-4 mt-8 text-faint">{article.date}</Eyebrow>
          <Display as="h1" size="lg" className="max-w-[18ch]">
            {article.h1}
          </Display>
          <p className="mt-6 max-w-[62ch] text-base leading-relaxed text-muted md:text-lg">
            {article.lede}
          </p>
        </Reveal>
        {article.sections.map((s) => (
          <Reveal key={s.h2} className="mt-12 max-w-[72ch]">
            <h2 className="font-display text-2xl uppercase md:text-3xl">{s.h2}</h2>
            {s.paragraphs.map((p, i) => (
              <p key={i} className="mt-4 leading-relaxed text-muted">
                {p}
              </p>
            ))}
            {s.list && (
              <ul className="mt-4 space-y-2">
                {s.list.map((item) => (
                  <li key={item} className="border-t border-line pt-2 leading-relaxed text-muted">
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </Reveal>
        ))}
        <Reveal className="mt-12">
          <Eyebrow className="mb-4 text-faint">Proof behind this piece</Eyebrow>
          <p className="meta leading-loose">
            {service && (
              <span>
                <Link href={`/services/${service.slug}`} data-cursor="OPEN" className="text-muted transition-colors hover:text-cyan">
                  {service.h1} →
                </Link>
              </span>
            )}
            {cases.map((p) => (
              <span key={p.slug}>
                <span className="text-faint"> / </span>
                <Link href={`/work/${p.slug}`} data-cursor="OPEN" className="text-muted transition-colors hover:text-cyan">
                  {p.title} →
                </Link>
              </span>
            ))}
          </p>
          <Link
            href="/contact"
            data-cursor="OPEN"
            className="meta mt-8 inline-block border border-line-strong px-5 py-3 text-bone transition-colors hover:border-cyan hover:text-cyan"
          >
            {article.cta} →
          </Link>
        </Reveal>
      </SectionContainer>
    </>
  );
}

export function InsightsHub({ items }: { items: Article[] }) {
  return (
    <SectionContainer>
      <Reveal>
        <Breadcrumb trail={[{ label: "Index", href: "/" }, { label: "Insights" }]} />
      </Reveal>
      <Reveal>
        <Display as="h1" size="lg" className="mt-8 max-w-[14ch]">
          Notes from the build log.
        </Display>
        <p className="mt-6 max-w-[62ch] text-base leading-relaxed text-muted md:text-lg">
          Technical writing with proof behind it. No trend lists — each piece earns its place.
        </p>
      </Reveal>
      <Stagger className="mt-12">
        {items.map((a) => (
          <Link
            key={a.slug}
            data-stagger-item
            data-cursor="OPEN"
            href={`/insights/${a.slug}`}
            className="group grid gap-2 border-t border-line py-7 last:border-b md:grid-cols-[140px_1fr_auto] md:gap-8 md:items-baseline"
          >
            <span className="meta text-faint">{a.date}</span>
            <span>
              <span className="block font-display text-2xl uppercase transition-transform duration-300 group-hover:translate-x-2 md:text-3xl">
                {a.h1}
              </span>
              <span className="mt-2 block max-w-[62ch] text-sm leading-relaxed text-muted">
                {a.metaDescription}
              </span>
            </span>
            <span aria-hidden="true" className="meta text-faint transition-colors group-hover:text-cyan">
              →
            </span>
          </Link>
        ))}
      </Stagger>
    </SectionContainer>
  );
}
