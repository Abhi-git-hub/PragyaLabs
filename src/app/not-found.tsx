import Link from "next/link";
import { Display, Eyebrow } from "@/components/typography/Type";
import { SectionContainer } from "@/components/layout/SectionContainer";

/** 404 — stays in-voice: a lab misfire, not a joke page. */
export default function NotFound() {
  return (
    <SectionContainer eyebrow="Signal lost">
      <Display size="lg">No specimen here.</Display>
      <Eyebrow className="mt-6 text-faint">The coordinate you requested is outside the lab.</Eyebrow>
      <Link
        href="/"
        className="meta mt-8 inline-block border border-line-strong px-5 py-3 text-bone transition-colors hover:border-cyan hover:text-cyan"
      >
        ← Return to index
      </Link>
    </SectionContainer>
  );
}
