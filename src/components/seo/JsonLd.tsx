import { site } from "@/config/site";
import { person } from "@/data/story";

/**
 * Person + ProfessionalService structured data (TRD §10).
 * Homepage and /about share the same facts — rendered as JSON-LD only.
 */
export function SiteJsonLd() {
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      name: site.name,
      description: site.thesis,
      url: site.url,
      email: site.contact.email,
      areaServed: "IN",
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
