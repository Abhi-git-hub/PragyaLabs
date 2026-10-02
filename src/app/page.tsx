import { Hero } from "@/components/sections/Hero";
import { Trust } from "@/components/sections/Trust";
import { Metamorphosis } from "@/components/sections/Metamorphosis";
import { Statement } from "@/components/sections/Statement";
import { FeaturedWork } from "@/components/sections/FeaturedWork";
import { Immersive } from "@/components/sections/Immersive";
import { AboutSection } from "@/components/sections/AboutSection";
import { FinalCta } from "@/components/sections/FinalCta";
import { ServicesStrip } from "@/components/sections/ServicesStrip";
import { ProofLedger } from "@/components/sections/ProofLedger";
import { Process } from "@/components/sections/Process";
import { TransitionBand } from "@/components/motion/TransitionBand";
import { SiteJsonLd, WebSiteJsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Custom AI Systems & Web Applications | Pragya Labs",
  description:
    "Pragya Labs builds custom AI systems, RAG applications, web products, and immersive digital experiences for teams solving real-world problems.",
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
      <Trust />
      <Metamorphosis />
      <TransitionBand label="Refraction seam — chamber to belief" />
      <Statement />
      <TransitionBand label="Refraction seam — belief to proof" />
      <FeaturedWork />
      <Immersive />
      <ServicesStrip />
      <ProofLedger />
      <Process />
      <AboutSection />
      <FinalCta />
    </>
  );
}
