import Link from "next/link";
import { Display } from "@/components/typography/Type";
import { Reveal } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { Signature } from "@/components/person/Signature";
import { person } from "@/data/story";

/**
 * CHAPTER 06 — PERSON. Understated identity: name, focus, coordinates.
 * "I build" — never a pedestal. The full story lives in CHAPTER 02 and /about.
 */
export function Person() {
  return (
    <SectionContainer eyebrow="Person" id="person" className="scroll-mt-20">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <Display size="lg">
            {person.name}
            <br />
            builds.
          </Display>
          <p className="mt-6 max-w-[52ch] text-base leading-relaxed text-muted md:text-lg">
            {person.role} working across AI, the web, and interaction — {person.location},{" "}
            {person.year}. Currently inside Saarthians and this laboratory.
          </p>
          <Link
            href="/about"
            data-cursor="OPEN"
            className="meta mt-8 inline-block border border-line-strong px-5 py-3 text-bone transition-colors hover:border-cyan hover:text-cyan"
          >
            The longer story →
          </Link>
        </Reveal>
        <Reveal className="flex flex-col justify-between gap-10">
          <dl className="meta grid gap-5 border-t border-line pt-6 sm:grid-cols-2">
            <div>
              <dt className="text-faint">Focus now</dt>
              {person.focus.map((f) => (
                <dd key={f} className="mt-2 text-bone">{f}</dd>
              ))}
            </div>
            <div>
              <dt className="text-faint">Areas</dt>
              {person.areas.map((a) => (
                <dd key={a} className="mt-2 text-bone">{a}</dd>
              ))}
            </div>
          </dl>
          <div>
            <p className="meta mb-2 text-faint">Signed</p>
            <Signature className="max-w-[260px]" />
          </div>
        </Reveal>
      </div>
    </SectionContainer>
  );
}
