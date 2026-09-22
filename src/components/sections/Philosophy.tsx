import { Display, Eyebrow } from "@/components/typography/Type";
import { Reveal, Stagger } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";

const principles = [
  { title: "Make complexity invisible.", note: "The system does the hard part; the visitor feels none of it." },
  { title: "Motion should communicate.", note: "Every animation carries hierarchy or progression — or it is cut." },
  { title: "Performance is part of design.", note: "A stuttering experience is a broken composition." },
  { title: "AI should solve real problems.", note: "Retrieval over reverie. Grounded answers over generated fog." },
  { title: "Build before you brag.", note: "Proof first. This site is the evidence." },
];

/**
 * ACT 07 — THE PHILOSOPHY. Quiet editorial: five principles, sharp copy,
 * room to breathe. How the builder thinks, not LinkedIn inspiration.
 */
export function Philosophy() {
  return (
    <SectionContainer index="07" eyebrow="The philosophy">
      <Reveal>
        <Display size="md" className="max-w-[12ch]">
          How the builder thinks.
        </Display>
      </Reveal>
      <Stagger className="mt-10 max-w-[880px]">
        {principles.map((p, i) => (
          <div key={p.title} data-stagger-item className="border-t border-line py-7 last:border-b">
            <div className="flex items-baseline gap-6">
              <Eyebrow className="text-faint">P—{String(i + 1).padStart(2, "0")}</Eyebrow>
              <h3 className="font-display text-2xl uppercase leading-tight md:text-4xl">{p.title}</h3>
            </div>
            <p className="mt-2 pl-12 text-muted md:pl-14">{p.note}</p>
          </div>
        ))}
      </Stagger>
    </SectionContainer>
  );
}
