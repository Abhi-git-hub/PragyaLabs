import { HeroArrival } from "@/components/sections/HeroArrival";
import { Thesis } from "@/components/sections/Thesis";
import { Story } from "@/components/sections/Story";
import { Work } from "@/components/sections/Work";
import { LabTeaser } from "@/components/sections/LabTeaser";
import { Stack } from "@/components/sections/Stack";
import { Philosophy } from "@/components/sections/Philosophy";
import { Person } from "@/components/sections/Person";
import { ContactSection } from "@/components/sections/ContactSection";
import { Loop } from "@/components/sections/Loop";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({ title: "Pragya Labs — Digital systems engineered with intelligence." });

/**
 * HOME — the full narrative: ARRIVAL → THESIS → STORY → WORK → LAB →
 * STACK → PHILOSOPHY → PERSON → CONTACT → LOOP. Visitor-facing only.
 */
export default function HomePage() {
  return (
    <>
      <HeroArrival />
      <Thesis />
      <Story />
      <Work />
      <LabTeaser />
      <Stack />
      <Philosophy />
      <Person />
      <ContactSection />
      <Loop />
    </>
  );
}
