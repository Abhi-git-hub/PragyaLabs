import { Display, Eyebrow, Body } from "@/components/typography/Type";
import { Reveal, Stagger } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";

/** Typography system demo: display / body / mono voices with live scale. */
export function TypeSpecimen() {
  return (
    <SectionContainer index="F—01" eyebrow="Typography system">
      <Stagger>
        <div data-stagger-item>
          <Eyebrow className="mb-4 text-cyan">Display — Anton / editorial mass</Eyebrow>
          <Display size="lg">
            Digital systems engineered with intelligence.
          </Display>
        </div>
        <div data-stagger-item className="mt-10 grid gap-8 md:grid-cols-2">
          <div>
            <Eyebrow className="mb-4 text-faint">Body — Inter / readable</Eyebrow>
            <Body>
              Pragya Labs is an experimental digital laboratory. Body copy stays quiet
              so the objects, light, and motion can carry the energy. Long-form reading
              never competes with display moments.
            </Body>
          </div>
          <div>
            <Eyebrow className="mb-4 text-faint">Mono — JetBrains Mono / metadata</Eyebrow>
            <p className="meta">Creative engineering — AI / Web / Interaction</p>
            <p className="meta mt-2">Delhi — India / 2026 / SYS.ONLINE</p>
            <p className="meta mt-2 text-lime">Act 00 — System initialization</p>
          </div>
        </div>
      </Stagger>
      <Reveal className="mt-10">
        <p className="meta text-faint">
          Hierarchy rule — display states the thesis, body explains once, mono labels everything.
        </p>
      </Reveal>
    </SectionContainer>
  );
}
