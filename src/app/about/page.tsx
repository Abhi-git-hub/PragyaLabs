import { AboutSection } from "@/components/sections/AboutSection";
import { SiteJsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({ title: "About — Pragya Labs" });

/** About renders the same human world as home — one source, no duplicates. */
export default function AboutPage() {
  return (
    <>
      <SiteJsonLd />
      <AboutSection />
    </>
  );
}
