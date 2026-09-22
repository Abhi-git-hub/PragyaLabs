# ART DIRECTION — Pragya Labs (Phase 1, locked foundation)

> Status: LOCKED for Phase 1. Changes require updating tokens (`src/styles/tokens.css`
> + `src/config/tokens.ts`), the demos on `/`, and this document together.

## 1. Creative thesis

**PRAGYA LABS — Digital systems engineered with intelligence.**
Internal phrase: **Enter the lab.**

The site is an experimental digital laboratory the visitor walks into, not a
portfolio they scroll past. Discovery order: identity → thesis → experimentation
→ work → technology → philosophy → person → contact. Every section must answer
"what happens here" in one sentence or be cut.

## 2. Visual direction — DARK MATTER / PRISMATIC INTELLIGENCE

**Base (80/15):** obsidian `#060608`, graphite `#0B0C10` / `#12141A`, soft bone
white `#F4F3EC` for type. Rooms stay near-black.

**Energy (5%):** electric cyan `#35E9FF`, spectral blue `#4D7CFF`, ultraviolet
`#8B5CFF`, controlled acid lime `#C6FF3D`. Energy arrives **through light,
reflection, particles, objects, and motion** — never as flat background fills.
Lime is a signal color (status, active states), not decoration.

**Materials:** chrome (one element per viewport max, `text-chrome`), smoked glass
(background scrims only), crystal/polished graphite (3D surfaces).

**Prohibited:** giant generic gradients, glassmorphism soup, SaaS cards, skill
bars/percentages, stock AI imagery (robot heads, brains, laptops, businessmen,
futuristic cities), fake stats/clients/awards/testimonials, copied layouts.

## 3. Color system

Tokens: `--pl-background/surface/surface-2/foreground/muted/faint/border`,
`--pl-accent-cyan/blue/violet/lime`. Usage law: 80% obsidian/graphite, 15% bone,
5% energy. Contrast: bone-on-obsidian ≈ 19:1; muted `#9BA0AB` on obsidian ≈ 7:1
(body-safe); faint `#5B606B` is metadata-only, never body text. Lime-on-black for
status microcopy only. Live demo: `/` → Foundation F—02.

## 4. Typography (evaluated, documented choice)

| Voice | Face | Role |
|---|---|---|
| Display | **Anton** (400, condensed) | Editorial mass: hero, act titles, index rows |
| Body | **Inter** (variable) | Quiet explanation; max 62ch |
| Mono | **JetBrains Mono** (variable) | Technical metadata, eyebrows, coordinates |

**Why this trio:** Anton's condensed uppercase mass reads "monumental instrument"
against dark matter without needing weight range; Inter disappears correctly as
body; JetBrains Mono gives the lab its instrument-panel voice. Considered and
rejected: Space Grotesk (overused in AI-startup aesthetics), Archivo (needs more
tuning to feel distinct), IBM Plex Mono (warmer, less precise at small sizes).
Loaded via `next/font/google` (self-hosted, zero layout shift). Live demo: `/` → F—01.
Components: `src/components/typography/Type.tsx` (`Display`, `Body`, `Eyebrow`).

## 5. Lighting & imagery

Light is motivated: key from object-emissive (cyan/violet point lights in 3D),
type legibility via radial falloff scrims, never global brightening. Imagery
subjects allowed: technological sculptures, computational objects, energy cores,
orbital systems, neural structures, crystalline computation, data architecture,
experimental interfaces. Reference `assets/NeonDigitalCrystalCore.png` (concept
only) informed the Core prototype's chrome-ring + crystal + orbital language;
`assets/uiLook.png` / `assets/uiLook2.png` study the arrival composition and
lab atmosphere (see ASSET-BIBLE).

## 6. Motion & interaction (summary — see MOTION-SYSTEM.md)

GSAP owns scroll choreography, R3F owns 3D, CSS owns micro. Signature five
(documented, Phase 2): cursor-reactive hero object → scroll-transforming object →
dimensional project transitions → animated stack system → finale reconstructing
the opening visual. Cursor states DEFAULT/VIEW/OPEN/DRAG/EXPLORE (desktop only).

## 7. Responsive philosophy

Not desktop-shrunk. Three composition bands: **320–430** stacked cinematic (type
leads, 3D becomes backdrop, Lenis off, particle counts cut); **768** condensed
dual; **1024+** full lab grid with smoothing. Touch targets ≥ 44px; mobile keeps
cinematic feel through scale and pacing, not effects. Breakpoints live in
`src/config/tokens.ts`.

## 8. Accessibility philosophy

Motion is enhancement: everything is legible and operable with JS motion off and
under `prefers-reduced-motion` (final states render, tweens never fire).
Semantic landmarks, one `h1` per route, visible focus ring (cyan, 2px + offset),
skip link, keyboard-operable menu, `aria-hidden` on decorative canvases, live
regions reserved for Phase 2 async moments. Faint token never carries meaning
alone — status always pairs color with text.
