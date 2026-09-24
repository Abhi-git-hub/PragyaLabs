import { Hero } from "@/components/sections/Hero";
import { Metamorphosis } from "@/components/sections/Metamorphosis";
import { Statement } from "@/components/sections/Statement";
import { FeaturedWork } from "@/components/sections/FeaturedWork";
import { SiteJsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({ title: "Pragya Labs — Digital systems engineered with intelligence." });

/**
 * HOME — one continuous system: opening world → metamorphosis →
 * statement → featured work. Everything below is cut until it earns it.
 */
export default function HomePage() {
  return (
    <>
      <SiteJsonLd />
      <Hero />
      <Metamorphosis />
      <Statement />
      <FeaturedWork />
    </>
  );
}
