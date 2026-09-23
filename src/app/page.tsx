import { Hero } from "@/components/sections/Hero";
import { World02 } from "@/components/sections/World02";
import { Work } from "@/components/sections/Work";
import { SiteJsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({ title: "Pragya Labs — Digital systems engineered with intelligence." });

/**
 * HOME — World 01 (opening) → World 02 (lattice engine) → Saarthians world.
 * Nothing else until the interaction earns it.
 */
export default function HomePage() {
  return (
    <>
      <SiteJsonLd />
      <Hero />
      <World02 />
      <Work />
    </>
  );
}
