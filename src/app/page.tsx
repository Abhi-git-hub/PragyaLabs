import { Hero } from "@/components/sections/Hero";
import { Metamorphosis } from "@/components/sections/Metamorphosis";
import { Statement } from "@/components/sections/Statement";
import { FeaturedWork } from "@/components/sections/FeaturedWork";
import { Immersive } from "@/components/sections/Immersive";
import { AboutSection } from "@/components/sections/AboutSection";
import { TransitionBand } from "@/components/motion/TransitionBand";
import { SiteJsonLd, WebSiteJsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Pragya Labs — AI, Web & Creative Technology Studio",
  description:
    "Pragya Labs is an independent digital systems studio building custom AI systems, web applications and immersive experiences. Proof, not promises.",
  canonical: "/",
});

/**
 * HOME — one continuous system: opening world → metamorphosis →
 * statement → featured work → ember chapter → human world.
 * Cut below until earned.
 */
export default function HomePage() {
  return (
    <>
      <SiteJsonLd />
      <WebSiteJsonLd />
      <Hero />
      <Metamorphosis />
      <TransitionBand label="Refraction seam — chamber to belief" />
      <Statement />
      <TransitionBand label="Refraction seam — belief to proof" />
      <FeaturedWork />
      <Immersive />
      <AboutSection />
    </>
  );
}
