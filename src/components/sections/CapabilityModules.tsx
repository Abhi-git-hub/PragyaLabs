import Link from "next/link";
import { ChapterHead } from "@/components/typography/ChapterHead";
import { Stagger } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";

/**
 * CAPABILITY — three modules, not a SaaS grid. Oversized editorial panels,
 * each with a quiet inline SVG micro-scene, micro-tags, and a link to the
 * matching service page. Everything works without hover.
 */
const MODULES = [
  {
    index: "01",
    label: "Ground AI",
    title: "AI systems that answer from real context.",
    copy: "RAG applications, knowledge tools, and AI assistants designed around approved sources, retrieval quality, evaluation, and the people who rely on the answer.",
    tags: "RAG / Retrieval / Evaluation / Knowledge Systems",
    href: "/services/ai-development",
    link: "Explore AI systems",
    accent: "#3DFFA2",
    visual: "ground",
  },
  {
    index: "02",
    label: "Useful software",
    title: "Web applications that move work forward.",
    copy: "Dashboards, internal tools, platforms, and customer-facing products shaped around actual workflows — not generic feature lists.",
    tags: "Next.js / React / Product Architecture / Integrations",
    href: "/services/web-development",
    link: "Explore web applications",
    accent: "#168F62",
    visual: "software",
  },
  {
    index: "03",
    label: "Memorable interaction",
    title: "Interactive experiences that make complexity clear.",
    copy: "Immersive websites, visual storytelling, motion systems, and real-time interfaces that help people understand, explore, and remember.",
    tags: "WebGL / Motion / 3D / Storytelling",
    href: "/services/creative-technology",
    link: "Explore interactive work",
    accent: "#C9FFF0",
    visual: "interaction",
  },
] as const;

function MicroScene({ kind, accent }: { kind: string; accent: string }) {
  if (kind === "ground") {
    // Source fragments converge into a response ribbon.
    return (
      <svg viewBox="0 0 200 120" className="block h-28 w-full" aria-hidden="true">
        {[18, 48, 78].map((y) => (
          <g key={y}>
            <rect x={10} y={y - 10} width={34} height={20} fill="none" stroke="#737B78" strokeWidth={1} opacity={0.7} />
            <path d={`M 44 ${y} C 90 ${y}, 100 60, 150 60`} fill="none" stroke={accent} strokeWidth={1.2} opacity={0.8} />
          </g>
        ))}
        <rect x={150} y={48} width={42} height={24} fill="none" stroke="#F2F1EA" strokeWidth={1.2} />
        <path d="M 158 58 L 184 58" stroke={accent} strokeWidth={1.5} />
        <path d="M 158 64 L 176 64" stroke="#737B78" strokeWidth={1} />
      </svg>
    );
  }
  if (kind === "software") {
    // Fragmented UI aligns into an operational grid.
    return (
      <svg viewBox="0 0 200 120" className="block h-28 w-full" aria-hidden="true">
        <rect x={20} y={14} width={160} height={10} fill="none" stroke="#F2F1EA" strokeWidth={1.2} />
        {[0, 1, 2].map((c) =>
          [0, 1].map((r) => (
            <rect
              key={`${c}-${r}`}
              x={20 + c * 56}
              y={34 + r * 38}
              width={48}
              height={30}
              fill="none"
              stroke={c === 1 && r === 0 ? accent : "#737B78"}
              strokeWidth={c === 1 && r === 0 ? 1.5 : 1}
              opacity={c === 1 && r === 0 ? 1 : 0.6}
            />
          ))
        )}
      </svg>
    );
  }
  // Sculptural form revealing layers.
  return (
    <svg viewBox="0 0 200 120" className="block h-28 w-full" aria-hidden="true">
      <ellipse cx={100} cy={60} rx={62} ry={40} fill="none" stroke="#737B78" strokeWidth={1} opacity={0.6} />
      <ellipse cx={100} cy={60} rx={42} ry={27} fill="none" stroke={accent} strokeWidth={1.2} opacity={0.85} />
      <ellipse cx={100} cy={60} rx={22} ry={14} fill="none" stroke="#F2F1EA" strokeWidth={1.2} />
      <circle cx={100} cy={60} r={3.5} fill={accent} />
    </svg>
  );
}

export function CapabilityModules() {
  return (
    <SectionContainer id="capabilities" className="scroll-mt-20">
      <ChapterHead
        index="03"
        eyebrow="What we build"
        title="What the system can become."
        lede="Every engagement is different. The systems we build usually combine one or more of these capabilities."
      />
      <Stagger className="mt-12 grid gap-6 lg:grid-cols-3">
        {MODULES.map((m) => (
          <article
            key={m.index}
            data-stagger-item
            className="group flex flex-col border border-line bg-graphite p-6 transition-colors duration-300 hover:border-line-strong md:p-8"
          >
            <div className="flex items-baseline justify-between">
              <p className="meta" style={{ color: m.accent }}>
                {m.index} / {m.label}
              </p>
            </div>
            <h3 className="mt-4 font-display text-2xl font-semibold leading-tight md:text-3xl">
              {m.title}
            </h3>
            <div className="mt-6 border-t border-line pt-6" aria-hidden="true">
              <MicroScene kind={m.visual} accent={m.accent} />
            </div>
            <p className="mt-6 flex-1 leading-relaxed text-muted">{m.copy}</p>
            <p className="meta mt-6 text-faint">{m.tags}</p>
            <Link
              href={m.href}
              data-cursor="OPEN"
              className="meta mt-6 inline-flex w-fit items-center gap-2 text-bone transition-all duration-200 hover:gap-3 hover:text-cyan"
            >
              {m.link} <span aria-hidden="true">→</span>
            </Link>
          </article>
        ))}
      </Stagger>
    </SectionContainer>
  );
}
