import { Display } from "@/components/typography/Type";
import { Reveal } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";

const swatches = [
  { name: "Obsidian", token: "--pl-background", hex: "#060608", fg: "text-bone", bg: "bg-void", border: true },
  { name: "Graphite", token: "--pl-surface", hex: "#0B0C10", fg: "text-bone", bg: "bg-graphite", border: true },
  { name: "Bone", token: "--pl-foreground", hex: "#F4F3EC", fg: "text-black", bg: "bg-bone", border: false },
  { name: "Muted", token: "--pl-muted", hex: "#9BA0AB", fg: "text-black", bg: "bg-muted", border: false },
  { name: "Cyan", token: "--pl-accent-cyan", hex: "#35E9FF", fg: "text-black", bg: "bg-cyan", border: false },
  { name: "Spectral", token: "--pl-accent-blue", hex: "#4D7CFF", fg: "text-white", bg: "bg-spectral", border: false },
  { name: "Ultra", token: "--pl-accent-violet", hex: "#8B5CFF", fg: "text-white", bg: "bg-ultra", border: false },
  { name: "Lime", token: "--pl-accent-lime", hex: "#C6FF3D", fg: "text-black", bg: "bg-lime", border: false },
];

/** Color system demo: base holds the room, energy arrives as light. */
export function ColorSystem() {
  return (
    <SectionContainer index="F—02" eyebrow="Color system">
      <Reveal>
        <Display size="sm" className="max-w-[20ch]">
          Near-black rooms, prismatic light.
        </Display>
      </Reveal>
      <ul className="mt-10 grid grid-cols-2 gap-px bg-line md:grid-cols-4" role="list" aria-label="Design tokens — color">
        {swatches.map((s) => (
          <li
            key={s.token}
            className={`${s.bg} ${s.fg} ${s.border ? "border border-line" : ""} flex min-h-36 flex-col justify-between p-4`}
          >
            <span className="meta opacity-70">{s.token}</span>
            <span>
              <span className="block font-display text-xl uppercase">{s.name}</span>
              <span className="meta opacity-70">{s.hex}</span>
            </span>
          </li>
        ))}
      </ul>
      <Reveal className="mt-6">
        <p className="meta text-faint">
          Usage law — 80% obsidian/graphite, 15% bone, 5% energy. Energy never fills backgrounds.
        </p>
      </Reveal>
    </SectionContainer>
  );
}
