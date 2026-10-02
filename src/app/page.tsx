import { Hero } from "@/components/sections/Hero";
import { Recognition } from "@/components/sections/Recognition";
import { CapabilityModules } from "@/components/sections/CapabilityModules";
import { Method } from "@/components/sections/Method";
import { ProofLedger } from "@/components/sections/ProofLedger";
import { Trust } from "@/components/sections/Trust";
import { Founder } from "@/components/sections/Founder";
import { FinalCta } from "@/components/sections/FinalCta";
import { SiteJsonLd, WebSiteJsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Pragya Labs | Custom AI Systems, Web Applications & Interactive Experiences",
  description:
    "Pragya Labs builds grounded AI systems, RAG applications, web products, and interactive digital experiences around real data and workflows.",
  canonical: "/",
});

/**
 * HOME — Grounded Intelligence spine:
 * fragments → context → intelligence → interface → impact.
 * Hero chamber is the single full-page WebGL scene; every later
 * chapter earns its motion from the narrative, not decoration.
 */
export default function HomePage() {
  return (
    <>
      <SiteJsonLd />
      <WebSiteJsonLd />
      <Hero />
      <Recognition />
      <CapabilityModules />
      <Method />
      <ProofLedger />
      <Trust />
      <Founder />
      <FinalCta />
    </>
  );
}
