import { AboutSection } from "@/components/sections/AboutSection";
import { SiteJsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "About — Engineer, Not Persona | Pragya Labs",
  description:
    "Pragya Labs is the practice of one creative engineer in Delhi, India, working worldwide across AI, the web and interaction.",
  canonical: "/about",
});

/** About renders the same human world as home — one source, no duplicates. */
export default function AboutPage() {
  return (
    <>
      <SiteJsonLd />
      <AboutSection standalone />
    </>
  );
}
