import Image from "next/image";
import Link from "next/link";
import { Display } from "@/components/typography/Type";
import { Reveal } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";

/**
 * FOUNDER — accountability as an advantage. Real workspace photograph
 * (never an artificial headshot), real facts, direct collaboration.
 * Contact details live on the contact page and footer — not here.
 */
export function Founder() {
  return (
    <SectionContainer eyebrow="Direct collaboration">
      <div className="grid gap-10 md:grid-cols-2 md:items-center">
        <Reveal>
          <div className="overflow-hidden border border-line">
            <Image
              src="/person/workspace2--web.jpg"
              alt="Abhi at the work desk, looking up from the screen"
              width={1400}
              height={933}
              sizes="(max-width: 768px) 100vw, 50vw"
              loading="lazy"
              className="block aspect-[3/2] w-full object-cover"
            />
          </div>
          <p className="meta mt-3 text-faint">At the desk — Delhi, 2026</p>
        </Reveal>
        <Reveal>
          <Display as="h2" size="md" className="max-w-[20ch]">
            Built with accountable technical leadership.
          </Display>
          <p className="mt-6 max-w-[56ch] leading-relaxed text-muted md:text-lg">
            Pragya Labs is led by Abhi, an engineer working across AI systems, web
            applications, and interactive technology. You work directly with the person
            shaping the product, architecture, and experience.
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
