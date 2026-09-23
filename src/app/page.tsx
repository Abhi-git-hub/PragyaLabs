import { Hero } from "@/components/sections/Hero";
import { CraftSequence } from "@/components/sections/CraftSequence";
import { Origin } from "@/components/sections/Story";
import { Work } from "@/components/sections/Work";
import { Philosophy } from "@/components/sections/Philosophy";
import { Person } from "@/components/sections/Person";
import { ContactSection } from "@/components/sections/ContactSection";
import { Loop } from "@/components/sections/Loop";
import { SiteJsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({ title: "Pragya Labs — Digital systems engineered with intelligence." });

/**
 * HOME — one continuous studio experience: signal chamber → craft →
 * origin → work worlds → approach → person → contact → loop echo.
 * No demo galleries, no HUD, no dashboard.
 */
export default function HomePage() {
  return (
    <>
      <SiteJsonLd />
      <Hero />
      <CraftSequence />
      <Origin />
      <Work />
      <Philosophy />
      <Person />
      <ContactSection />
      <Loop />
    </>
  );
}
