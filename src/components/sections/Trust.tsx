import { ChapterHead } from "@/components/typography/ChapterHead";
import { Reveal } from "@/components/motion/Reveal";
import { SectionContainer } from "@/components/layout/SectionContainer";

/**
 * TRUST — the quiet relief. Calm type, one gentle SVG schematic:
 * fragments on the left, a single clear line to the right.
 * No canvas, no particles, no heavy motion.
 */
export function Trust() {
  return (
    <SectionContainer id="principle">
      <ChapterHead
        index="07"
        eyebrow="The principle"
        title="Technology should reduce complexity — not create more of it."
        lede="We work from your actual use case, users, data, and workflow to create systems that are clear, maintainable, and ready for real use."
      />
      <Reveal>
        <svg
          viewBox="0 0 600 130"
          className="mt-12 block h-auto w-full"
          role="img"
          aria-label="Schematic: scattered fragments converge through one clear line into a single organized node"
        >
          {[30, 65, 100].map((y, i) => (
            <g key={y}>
              <rect
                x={10 + (i % 2) * 26}
                y={y - 12}
                width={44}
                height={24}
                fill="none"
                stroke="#737B78"
                strokeWidth={1.2}
                opacity={0.65}
              />
              <path
                d={`M ${80 + (i % 2) * 26} ${y} C 220 ${y}, 260 65, 400 65`}
                fill="none"
                stroke="#3DFFA2"
                strokeWidth={1.4}
                opacity={0.75}
              />
            </g>
          ))}
          <circle cx={470} cy={65} r={30} fill="none" stroke="#F2F1EA" strokeWidth={1.5} />
          <circle cx={470} cy={65} r={16} fill="none" stroke="#168F62" strokeWidth={1.5} />
          <circle cx={470} cy={65} r={4.5} fill="#3DFFA2" />
        </svg>
        <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2" aria-label="One system">
          <li className="meta text-faint">
            <span aria-hidden="true" className="mr-2 inline-block h-px w-5 bg-cyan align-middle" />
            One system
          </li>
        </ul>
      </Reveal>
    </SectionContainer>
  );
}
