import Link from "next/link";
import { site } from "@/config/site";

/** Editorial breadcrumb — wayfinding that doubles as internal linking. */
export function Breadcrumb({ trail }: { trail: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <p className="meta text-faint">
        {trail.map((t, i) => (
          <span key={t.label}>
            {i > 0 && <span aria-hidden="true"> / </span>}
            {t.href ? (
              <Link href={t.href} className="transition-colors hover:text-cyan">
                {t.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-muted">
                {t.label}
              </span>
            )}
          </span>
        ))}
      </p>
    </nav>
  );
}

/** BreadcrumbList JSON-LD matching the visible trail. */
export function BreadcrumbJsonLd({ trail }: { trail: { label: string; href?: string }[] }) {
  const items = trail
    .filter((t) => t.href)
    .map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.label,
      item: `${site.url}${t.href}`,
    }));
  const data = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
