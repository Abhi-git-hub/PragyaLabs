import Image from "next/image";
import Link from "next/link";
import { Display } from "@/components/typography/Type";
import { Reveal } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { Parallax } from "@/components/motion/Parallax";

/**
 * FOUNDER — accountability as an advantage. Real workspace photograph
 * (never an artificial headshot), real facts, direct collaboration.
 * Contact details live on the contact page and footer — not here.
 */
export function Founder() {
  return (
    <SectionContainer id="founder">
      <p className="meta mb-8 text-faint md:mb-12">Direct collaboration / Delhi, India</p>
      <div className="grid gap-10 md:grid-cols-2 md:items-center">
        <Reveal>
          <Parallax className="group relative overflow-hidden border border-line">
            <Image
              src="/person/founder--web.jpg"
              alt="Abhi at his desk in Delhi - the engineer behind Pragya Labs"
              width={1200}
              height={1500}
              sizes="(max-width: 768px) 100vw, 50vw"
              loading="lazy"
              className="block aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{ background: "linear-gradient(180deg, transparent 55%, rgb(5 6 8 / 0.55) 100%)" }}
            />
          </Parallax>
          <p className="meta mt-3 text-faint">Abhi — Delhi, 2026</p>
        </Reveal>
        <Reveal>
          <Display as="h2" size="md" className="max-w-[20ch]">
            Built close to the problem.
          </Display>
          <p className="mt-6 max-w-[56ch] leading-relaxed text-muted md:text-lg">
            Pragya Labs is led by Abhi — working directly across system design,
            product architecture, engineering, and interactive execution.
          </p>
          <p className="meta mt-6 text-faint">
            Think → Model → Build → Test → Ship. One engineer, full chain.
          </p>
          <p className="meta mt-6 text-faint">
            Based in Delhi, India. Working remotely with teams wherever the work fits.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/about" data-cursor="OPEN" className="btn-ghost">
              About the studio
            </Link>
            <a
              href="https://github.com/Abhi-git-hub"
              target="_blank"
              rel="noreferrer"
              data-cursor="OPEN"
              className="meta inline-flex min-h-[44px] items-center px-2 py-3 text-muted transition-colors hover:text-cyan"
            >
              GitHub →
            </a>
          </div>
        </Reveal>
      </div>
    </SectionContainer>
  );
}
