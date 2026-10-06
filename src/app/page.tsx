import { Hero } from "@/components/sections/Hero";
import { Recognition } from "@/components/sections/Recognition";
import { Metamorphosis } from "@/components/sections/Metamorphosis";
import { CapabilityModules } from "@/components/sections/CapabilityModules";
import { ServicesStrip } from "@/components/sections/ServicesStrip";
import { Method } from "@/components/sections/Method";
import { ProofLedger } from "@/components/sections/ProofLedger";
import { CraftSequence } from "@/components/sections/CraftSequence";
import { EngineeringWall } from "@/components/sections/EngineeringWall";
import { Immersive } from "@/components/sections/Immersive";
import { Trust } from "@/components/sections/Trust";
import { Founder } from "@/components/sections/Founder";
import { FinalCta } from "@/components/sections/FinalCta";
import { TransitionBand } from "@/components/motion/TransitionBand";
import { SignalTicker } from "@/components/motion/SignalTicker";
import { SiteJsonLd, WebSiteJsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Pragya Labs | Custom AI Systems, Web Applications & Interactive Experiences",
  description:
    "Pragya Labs builds grounded AI systems, RAG applications, web products, and interactive digital experiences around real data and workflows.",
  canonical: "/",
});

/**
 * HOME — Grounded Intelligence spine, fully immersive:
 * fragments → context → craft → capability → method → proof →
 * engineering → creative technology → relief → founder → final.
 * Hero chamber is the hero WebGL scene; Metamorphosis, the services
 * atlas, and the ember world carry the pinned chapters; films and
 * canvas carry the proof. Every effect advances the funnel.
 */
export default function HomePage() {
  return (
    <>
      <SiteJsonLd />
      <WebSiteJsonLd />
      <Hero />
      <SignalTicker />
      <Recognition />
      <Metamorphosis />
      <TransitionBand label="Fragments to craft — the engine room" />
      <CapabilityModules />
      <ServicesStrip />
      <Method />
      <ProofLedger />
      <CraftSequence />
      <EngineeringWall />
      <Immersive />
      <Trust />
      <Founder />
      <FinalCta />
    </>
  );
}
