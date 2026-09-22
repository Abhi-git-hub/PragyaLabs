# MOTION SYSTEM — Pragya Labs (Phase 1)

> Tokens: `--pl-duration-*`, `--pl-ease-*`, `--pl-stagger-*`, `--pl-distance-*`
> in `src/styles/tokens.css`, mirrored for JS in `src/config/tokens.ts`.
> Primitives: `src/components/motion/Reveal.tsx`. Gate: `motionAllowed()` in
> `src/lib/motion.ts` + `usePrefersReducedMotion()`.

## Categories

| Category | Tokens | Examples | Owner |
|---|---|---|---|
| MICRO | 120ms, ease-out, 12px | button lifts, underline collapses, focus rings | CSS |
| INTERFACE | 200–350ms, `expo.out`, 24px | menu open, card hover, filter swaps | CSS / GSAP |
| SECTION | 600ms, `expo.out`, 48px + 70ms stagger | act entrances, index rows, `Reveal`/`Stagger` | GSAP ScrollTrigger |
| SIGNATURE | 1000–1600ms, scrubbed | the five interactions below | GSAP + R3F |

Easing voice: one primary (`--pl-ease-lab` ≈ `expo.out`), one alternative
(quart), linear for scrubbed/procedural. No bounce, no elastic, no springy
overshoot — the lab is precise, not playful.

## Signature interactions (documented, built in Phase 2)

1. Hero object reacts to cursor (pointer parallax → tilt/lighting shift).
2. Object transforms as user scrolls (descent + rotation + scale via scrubbed 0..1 progress ref — **architecture proven in Phase 1** by `PlaygroundHero` → `PragyaCoreCanvas`).
3. Project scene transitions dimensionally (index row → case study).
4. Technology stack becomes an animated system (scroll-assembled diagram).
5. Final scene reconstructs the opening visual (the loop, ACT—09).

## Scroll choreography

GSAP ScrollTrigger is the single scroll authority (`registerMotion()` once).
Lenis drives smoothing (desktop only); ScrollTrigger reads native scroll so the
two never fight. Triggers default `once: true` for entrances, `scrub` only for
signature transforms. All triggers killed on unmount.

## 3D behavior

R3F canvases: `dpr [1, 1.75]`, capped particle counts (≈260 shell / 90 ambient
desktop, less on mobile), `frameloop="demand"` under reduced motion, pause on
`document.hidden`, dynamic import (`ssr: false`) so Three.js never enters initial
JS. Pointer input lerped; scroll input via shared progress ref. Mobile quality
reduction is mandatory before any new 3D scene ships.

## Cursor behavior

States DEFAULT / VIEW / OPEN / DRAG / EXPLORE (`src/config/cursor.ts`).
Contract in Phase 1: `CursorProvider` + `useCursorIntent` + `data-cursor`
attributes. Visible renderer in Phase 2: dot + hairline ring, desktop
`pointer:fine` only, **never on touch, never under reduced motion**.

## Loading & page transitions

Phase 1: route-level `loading` skeletons are intentionally absent (placeholders
render instantly); Next `loading.tsx` per heavy route in Phase 2. ACT—00 boot
sequence (fast, skippable) and cross-route transitions (mask wipes, no full-page
fades) are Phase 2. Test area: `/` → Foundation F—03.

## Reduced motion (foundation BEFORE major motion)

`prefersReducedMotion()` gates everything: GSAP tweens skipped (final state
applied), R3F goes static single-frame, Lenis never initializes, CSS kills
residual animation/transitions. The site must read complete and composed with
all motion removed — verified by emulating reduced motion during every review.
