import { Hero } from "@/components/sections/Hero";
import { Work } from "@/components/sections/Work";
import { SiteJsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({ title: "Pragya Labs — Digital systems engineered with intelligence." });

/**
 * HOME — the first experience slice: the opening world, then the
 * Saarthians world. Nothing else until the slice earns it.
 */
export default function HomePage() {
  return (
    <>
      <SiteJsonLd />
      <Hero />
      <Work />
    </>
  );
}
