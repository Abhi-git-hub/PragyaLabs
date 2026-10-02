import { Hero } from "@/components/sections/Hero";
import { Metamorphosis } from "@/components/sections/Metamorphosis";
import { Statement } from "@/components/sections/Statement";
import { FeaturedWork } from "@/components/sections/FeaturedWork";
import { Immersive } from "@/components/sections/Immersive";
import { AboutSection } from "@/components/sections/AboutSection";
import { ServicesStrip } from "@/components/sections/ServicesStrip";
import { ProofLedger } from "@/components/sections/ProofLedger";
import { TransitionBand } from "@/components/motion/TransitionBand";
import { SiteJsonLd, WebSiteJsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Pragya Labs — AI, Web & Creative Technology Studio",
  description:
    "Custom AI systems and web applications built around your real business data. Pragya Labs designs reliable AI workflows, retrieval-augmented generation systems, and high-performance web products for teams that need technology to work in the real world.",
  canonical: "/",
});

/**
 * HOME — one continuous system: opening world → metamorphosis →
 * statement → featured work → ember chapter → services spine → human world.
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
      <ServicesStrip />
      <ProofLedger />
      <AboutSection />
    </>
  );
}
