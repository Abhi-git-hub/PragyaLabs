import { Display, Eyebrow } from "@/components/typography/Type";
import { Reveal, Stagger } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { principles } from "@/data/principles";

/**
 * CHAPTER 05 — APPROACH. Concise and sharp: five principles, room to
 * breathe. How the builder thinks — never motivational filler.
 * Copy lives in `data/principles` (TRD §6).
 */
export function Philosophy() {
  return (
    <SectionContainer eyebrow="Approach" id="approach" className="scroll-mt-20">
      <Reveal>
        <Display size="md" className="max-w-[12ch]">
          How the builder thinks.
        </Display>
      </Reveal>
      <Stagger className="mt-10 max-w-[880px]">
        {principles.map((p) => (
          <div key={p.id} data-stagger-item className="border-t border-line py-7 last:border-b">
            <div className="flex items-baseline gap-6">
              <Eyebrow className="text-faint">
                <span aria-hidden="true">{p.id}</span>
              </Eyebrow>
              <h3 className="font-display text-2xl uppercase leading-tight md:text-4xl">{p.title}</h3>
            </div>
            <p className="mt-2 pl-12 text-muted md:pl-14">{p.note}</p>
          </div>
        ))}
      </Stagger>
    </SectionContainer>
  );
}
