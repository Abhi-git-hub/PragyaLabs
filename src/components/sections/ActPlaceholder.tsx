import Link from "next/link";
import { Display, Eyebrow, Body } from "@/components/typography/Type";
import { Reveal } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";

export type ActDef = {
  act: string;
  title: string;
  message: string;
  visual: string;
  interaction: string;
  transition: string;
  cta?: { label: string; href: string };
};

/**
 * Architectural placeholder for a homepage act. Documents intent;
 * full scenes are composed here in later phases.
 */
export function ActPlaceholder({ act }: { act: ActDef }) {
  return (
    <SectionContainer index={act.act} eyebrow={act.title}>
      <Reveal>
        <Display size="md" className="max-w-[12ch]">
          {act.title}
        </Display>
        <Body className="mt-6">{act.message}</Body>
        <dl className="meta mt-8 grid gap-3 border-t border-line pt-6 sm:grid-cols-3">
          <div>
            <dt className="text-faint">Visual</dt>
            <dd className="mt-1 normal-case tracking-normal text-muted">{act.visual}</dd>
          </div>
          <div>
            <dt className="text-faint">Interaction</dt>
            <dd className="mt-1 normal-case tracking-normal text-muted">{act.interaction}</dd>
          </div>
          <div>
            <dt className="text-faint">Transition</dt>
            <dd className="mt-1 normal-case tracking-normal text-muted">{act.transition}</dd>
          </div>
        </dl>
        {act.cta && (
          <Link
            href={act.cta.href}
            data-cursor="OPEN"
            className="meta mt-8 inline-block border border-line-strong px-5 py-3 text-bone transition-colors hover:border-cyan hover:text-cyan"
          >
            {act.cta.label} →
          </Link>
        )}
      </Reveal>
      <div className="mt-4 flex items-center gap-3" aria-hidden="true">
        <Eyebrow className="text-faint">Phase 1 — placeholder</Eyebrow>
        <span className="h-px flex-1 bg-line" />
      </div>
    </SectionContainer>
  );
}
