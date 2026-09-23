import Link from "next/link";
import { Display, Body, Eyebrow } from "@/components/typography/Type";
import { Reveal, Stagger } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { Portrait } from "@/components/person/Portrait";
import { Signature } from "@/components/person/Signature";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { SiteJsonLd } from "@/components/seo/JsonLd";
import { site } from "@/config/site";
import { storyBeats } from "@/data/story";
import { principles } from "@/data/principles";
import { getProject } from "@/data/projects";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({ title: "About — Pragya Labs" });

/** The readable story: background, journey, focus, approach, work, contact.
 *  Journey / principles / work all pull from single content sources (TRD §6). */
export default function AboutPage() {
  const featured = ["saarthians", "stock-rag", "majdoor-haq", "x-frontend-clone"]
    .map((slug) => getProject(slug))
    .filter((p): p is NonNullable<typeof p> => p !== undefined && p.featured);

  return (
    <>
      <SiteJsonLd />
      <SectionContainer eyebrow="About — the person">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <Reveal>
            <Display size="lg">Engineer, not persona.</Display>
            <Body className="mt-6">
              One engineer, {site.location} — building systems where AI earns
              its place and interfaces disappear. This page is the longer
              version: the face, the path, the method, and the work it produced.
            </Body>
            <dl className="meta mt-8 grid gap-3 border-t border-line pt-6 sm:grid-cols-2">
              <div>
                <dt className="text-faint">Discipline</dt>
                <dd className="mt-1 text-bone">Creative engineering</dd>
              </div>
              <div>
                <dt className="text-faint">Coordinates</dt>
                <dd className="mt-1 text-bone">
                  {site.location} — {site.year}
                </dd>
              </div>
            </dl>
          </Reveal>
          <Reveal>
            <Portrait className="h-[46svh] lg:h-full lg:min-h-[440px]" />
            <div className="mt-3 flex items-center justify-between" aria-hidden="true">
              <Eyebrow className="text-faint">Abhi — Delhi, 2026</Eyebrow>
              <Eyebrow className="text-faint">Fig. 01</Eyebrow>
            </div>
          </Reveal>
        </div>
      </SectionContainer>

      <SectionContainer eyebrow="Journey">
        <Stagger className="max-w-[880px]">
          {storyBeats.map((beat) => (
            <div key={beat.era} data-stagger-item className="border-t border-line py-8 last:border-b">
              <Eyebrow className="text-cyan">{beat.era}</Eyebrow>
              <h2 className="mt-3 font-display text-2xl uppercase md:text-4xl">{beat.title}</h2>
              {beat.lines.map((line) => (
                <p key={line} className="mt-3 max-w-[62ch] leading-relaxed text-muted">
                  {line}
                </p>
              ))}
            </div>
          ))}
        </Stagger>
      </SectionContainer>

      <SectionContainer eyebrow="Approach + selected work">
        <div className="grid gap-10 lg:grid-cols-2">
          <Reveal>
            <h2 className="font-display text-2xl uppercase md:text-3xl">
              {principles[4]?.title ?? "Build before you brag."}
            </h2>
            <Body className="mt-4">
              Complexity made invisible, motion that communicates, performance
              treated as design, AI aimed at real problems. The work below is
              the evidence.
            </Body>
            <p className="mt-4 max-w-[52ch] leading-relaxed text-muted">
              Working style, in one line: start from the person tapping glass —
              earn every layer above them.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-px bg-line">
              <figure className="bg-void">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/person/detail--hands.jpg"
                  alt="Detail — shoulder and sleeve in cool rim light"
                  loading="lazy"
                  className="block aspect-[4/3] w-full object-cover"
                />
                <figcaption className="meta px-4 py-2 text-faint">Detail 01 — at the bench</figcaption>
              </figure>
              <figure className="bg-void">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/person/detail--rim.jpg"
                  alt="Detail — hair edged with cool blue rim light"
                  loading="lazy"
                  className="block aspect-[4/3] w-full object-cover"
                />
                <figcaption className="meta px-4 py-2 text-faint">Detail 02 — rim light study</figcaption>
              </figure>
            </div>
            <div className="mt-8">
              <p className="meta mb-2 text-faint">Signed</p>
              <Signature className="max-w-[260px]" />
            </div>
          </Reveal>
          <div>
            {featured.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>
        </div>
        <Reveal>
          <Link
            href="/contact"
            data-cursor="OPEN"
            className="meta mt-10 inline-block border border-line-strong px-5 py-3 text-bone transition-colors hover:border-cyan hover:text-cyan"
          >
            Start a project →
          </Link>
        </Reveal>
      </SectionContainer>
    </>
  );
}
