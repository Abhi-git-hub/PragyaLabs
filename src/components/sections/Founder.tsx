import Image from "next/image";
import Link from "next/link";
import { Display } from "@/components/typography/Type";
import { Reveal } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { assets } from "@/lib/assets";

/**
 * FOUNDER — accountability as an advantage. Real workspace photograph
 * (never an artificial headshot), real facts, direct collaboration.
 * Contact details live on the contact page and footer — not here.
 */
export function Founder() {
  return (
    <SectionContainer eyebrow="Direct collaboration / Delhi, India">
      <div className="grid gap-10 md:grid-cols-2 md:items-center">
        <Reveal>
          <div className="overflow-hidden border border-line">
            <Image
              src={assets.photo.desk.src}
              alt={assets.photo.desk.alt}
              width={assets.photo.desk.width}
              height={assets.photo.desk.height}
              sizes="(max-width: 768px) 100vw, 50vw"
              loading="lazy"
              className="block aspect-[4/3] w-full object-cover"
            />
          </div>
          <p className="meta mt-3 text-faint">The desk — Delhi, 2026</p>
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
