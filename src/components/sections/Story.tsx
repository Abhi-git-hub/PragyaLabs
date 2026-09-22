import { Display, Eyebrow } from "@/components/typography/Type";
import { Reveal, Stagger } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { Portrait } from "@/components/person/Portrait";
import { Signature } from "@/components/person/Signature";
import { storyBeats } from "@/data/story";

/**
 * ACT 03 — THE STORY. Quiet editorial chapter: one portrait, three beats,
 * one signature. Facts only, no mythology. The face is revealed gradually —
 * it never dominates the site.
 */
export function Story() {
  return (
    <SectionContainer index="03" eyebrow="The story">
      <Reveal>
        <Display size="md" className="max-w-[14ch]">
          How a lab gets built.
        </Display>
      </Reveal>
      <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <Reveal className="relative">
          <Portrait className="h-[52svh] lg:h-full lg:min-h-[560px]" />
          <div className="mt-3 flex items-center justify-between">
            <Eyebrow className="text-faint">Abhi — Delhi, 2026</Eyebrow>
            <Eyebrow className="text-faint">Fig. 01</Eyebrow>
          </div>
        </Reveal>
        <Stagger className="flex flex-col justify-between gap-10">
          <div className="space-y-0">
            {storyBeats.map((beat) => (
              <div key={beat.era} data-stagger-item className="border-t border-line py-7 last:border-b">
                <Eyebrow className="text-cyan">{beat.era}</Eyebrow>
                <h3 className="mt-3 font-display text-2xl uppercase leading-tight md:text-3xl">
                  {beat.title}
                </h3>
                {beat.lines.map((line) => (
                  <p key={line} className="mt-3 max-w-[52ch] leading-relaxed text-muted">
                    {line}
                  </p>
                ))}
              </div>
            ))}
          </div>
          <div data-stagger-item>
            <Eyebrow className="mb-2 text-faint">The mark</Eyebrow>
            <Signature className="max-w-[300px]" />
          </div>
        </Stagger>
      </div>
    </SectionContainer>
  );
}
