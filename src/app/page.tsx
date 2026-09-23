import { Hero } from "@/components/sections/Hero";
import { World02 } from "@/components/sections/World02";
import { Work } from "@/components/sections/Work";
import { Philosophy } from "@/components/sections/Philosophy";
import { Person } from "@/components/sections/Person";
import { ContactSection } from "@/components/sections/ContactSection";
import { Loop } from "@/components/sections/Loop";
import { SiteJsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({ title: "Pragya Labs — Digital systems engineered with intelligence." });

/**
 * HOME — one piece of work: opening world → lattice engine → Saarthians
 * world → studio thinking → human → contact → quiet resolution.
 */
export default function HomePage() {
  return (
    <>
      <SiteJsonLd />
      <Hero />
      <World02 />
      <Work />
      <Philosophy />
      <Person />
      <ContactSection />
      <Loop />
    </>
  );
}
