import { Display } from "@/components/typography/Type";
import { Reveal } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";

/**
 * TRUST — the editorial relief. Warm ivory, calm type, one gentle SVG
 * schematic: fragments on the left, a single clear line to the right.
 * No canvas, no particles, no heavy motion.
 */
export function Trust() {
  return (
    <div className="theme-light bg-paper text-ink">
      <SectionContainer eyebrow="The principle">
        <Reveal>
          <Display as="h2" size="md" className="max-w-[24ch]">
            Technology should reduce complexity — not create more of it.
          </Display>
          <p className="mt-6 max-w-[58ch] text-base leading-relaxed text-muted md:text-lg">
            We work from your actual use case, users, data, and workflow to create
            systems that are clear, maintainable, and ready for real use.
          </p>
        </Reveal>
        <Reveal>
          <svg
            viewBox="0 0 600 160"
            className="mt-12 block h-auto w-full"
            role="img"
            aria-label="Schematic: scattered fragments converge through one clear line into a single organized node"
          >
            {[30, 65, 100, 135].map((y, i) => (
              <g key={y}>
                <rect
                  x={10 + (i % 2) * 26}
                  y={y - 12}
                  width={44}
                  height={24}
                  fill="none"
                  stroke="#526178"
                  strokeWidth={1.2}
                  opacity={0.65}
                />
                <path
                  d={`M ${80 + (i % 2) * 26} ${y} C 220 ${y}, 260 80, 400 80`}
                  fill="none"
                  stroke="#007FA3"
                  strokeWidth={1.4}
                  opacity={0.75}
                />
              </g>
            ))}
            <circle cx={470} cy={80} r={30} fill="none" stroke="#101827" strokeWidth={1.5} />
            <circle cx={470} cy={80} r={16} fill="none" stroke="#6D3DF5" strokeWidth={1.5} />
            <circle cx={470} cy={80} r={4.5} fill="#007FA3" />
            <text x={516} y={76} fill="#526178" fontSize={12} letterSpacing={2} fontFamily="monospace">
              ONE
            </text>
            <text x={516} y={94} fill="#526178" fontSize={12} letterSpacing={2} fontFamily="monospace">
              SYSTEM
            </text>
          </svg>
        </Reveal>
      </SectionContainer>
    </div>
  );
}
