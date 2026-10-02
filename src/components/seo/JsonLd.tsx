import { site } from "@/config/site";
import { person } from "@/data/story";

/**
 * Organization + Person structured data.
 * Homepage and /about share the same verified facts — rendered as JSON-LD only.
 */
export function SiteJsonLd() {
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: site.name,
      description: site.thesis,
      url: site.url,
      email: site.contact.email,
      areaServed: "Worldwide",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Delhi",
        addressCountry: "IN",
      },
      founder: {
        "@type": "Person",
        name: person.name,
        jobTitle: person.role,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: person.name,
      jobTitle: person.role,
      url: site.url,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Delhi",
        addressCountry: "IN",
      },
      knowsAbout: [...person.areas],
      worksFor: {
        "@type": "Organization",
        name: site.name,
        url: site.url,
      },
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** WebSite entity — global reach declared once. */
export function WebSiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
    description: site.thesis,
    inLanguage: "en",
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** FAQPage for service pages — the visible FAQ owns rich-result eligibility. */
export function FaqJsonLd({ faq }: { faq: { q: string; a: string }[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
/** BreadcrumbList for the current trail — visible breadcrumbs required. */
export function BreadcrumbListJsonLd({ items }: { items: { name: string; url: string }[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** TechArticle for case studies — headline, author, about tech. No ratings. */
export function TechArticleJsonLd({
  headline,
  description,
  url,
  about,
}: {
  headline: string;
  description: string;
  url: string;
  about: string[];
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline,
    description,
    url,
    inLanguage: "en",
    author: {
      "@type": "Person",
      name: person.name,
      jobTitle: person.role,
    },
    about: about.map((name) => ({ "@type": "Thing", name })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
