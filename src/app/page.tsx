import { HeroArrival } from "@/components/sections/HeroArrival";
import { Thesis } from "@/components/sections/Thesis";
import { Origin } from "@/components/sections/Story";
import { Work } from "@/components/sections/Work";
import { Stack } from "@/components/sections/Stack";
import { Philosophy } from "@/components/sections/Philosophy";
import { Person } from "@/components/sections/Person";
import { ContactSection } from "@/components/sections/ContactSection";
import { Loop } from "@/components/sections/Loop";
import { GlyphBand } from "@/components/motion/GlyphBand";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({ title: "Pragya Labs — Digital systems engineered with intelligence." });

/**
 * HOME — one continuous experience: ARRIVAL (with thesis statement) →
 * ORIGIN → WORK → SYSTEMS → APPROACH → PERSON → CONTACT → LOOP.
 * Glyph seams carry progression between chapters. No demo galleries.
 */
export default function HomePage() {
  return (
    <>
      <HeroArrival />
      <Thesis />
      <GlyphBand label="SYS—TRANSIT / 01" />
      <Origin />
      <GlyphBand label="SYS—TRANSIT / 02" />
      <Work />
      <GlyphBand label="SYS—TRANSIT / 03" />
      <Stack />
      <Philosophy />
      <Person />
      <ContactSection />
      <Loop />
    </>
  );
}
