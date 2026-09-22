# MOTION SYSTEM — Pragya Labs (Phase 2)

> Tokens: `--pl-duration-*`, `--pl-ease-*`, `--pl-stagger-*`, `--pl-distance-*`
> in `src/styles/tokens.css`, mirrored for JS in `src/config/tokens.ts`.
> Primitives: `src/components/motion/Reveal.tsx`, `EnvironmentLayer`.
> Gate: `motionAllowed()` in `src/lib/motion.ts` + `usePrefersReducedMotion()`.

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

## Signature interactions (1–2 BUILT in Phase 2, 3–5 documented)

1. Hero object reacts to cursor — BUILT: pointer parallax tilt + energy-light
   response in `PragyaCoreScene`, staged by the `HeroArrival` load timeline.
2. Object transforms as user scrolls — BUILT: descent + rotation + scale via
   scrubbed 0..1 progress ref; environment breathes via `EnvironmentLayer`
   parallax; hero type lifts away on a separate scrub.
3. Project scene transitions dimensionally (index row → case study).
4. Technology stack becomes an animated system (scroll-assembled diagram).
5. Final scene reconstructs the opening visual (the loop, ACT—09).

## Scroll choreography

GSAP ScrollTrigger is the single scroll authority (`registerMotion()` once).
Lenis drives smoothing (desktop only); ScrollTrigger reads native scroll so the
two never fight. Triggers default `once: true` for entrances, `scrub` only for
signature transforms. All triggers killed on unmount.

## 3D behavior

R3F canvases: `dpr [1, 1.75]` high tier / `1` reduced tier, shell particles
260/90, ambient 2D field ≈ 90/36 (desktop/mobile), standard materials over
physical, `frameloop="demand"` + static frame under reduced motion, pause on
`document.hidden`, dynamic import (`ssr: false`) so Three.js never enters initial
JS. Canvases mount only while their scene is near the viewport
(intersection-aware, 300px margin). Pointer input lerped; scroll input via
shared progress ref; load-in via shared intro ref. Mobile quality reduction is
mandatory before any new 3D scene ships.

## Cursor behavior

States DEFAULT / VIEW / OPEN / DRAG / EXPLORE (`src/config/cursor.ts`).
Contract live since Phase 1: `CursorProvider` + `useCursorIntent` + `data-cursor`
attributes (already placed on cards, CTAs, lab specimens). Visible renderer
deferred to Phase 3: dot + hairline ring, desktop `pointer:fine` only,
**never on touch, never under reduced motion**.

## Loading & page transitions

Phase 1: route-level `loading` skeletons were intentionally absent. Phase 2:
hero media is poster-first (video fades in on canplay); the Thesis pin is
skipped under reduced motion (static stack instead). The Phase 1 public motion
test area was retired in 2.1 (demos don't belong on the public site); the
motion language is exercised by the live scenes and documented here.
ACT—00 boot sequence (fast, skippable) and cross-route transitions (mask
wipes, no full-page fades) remain Phase 3.

## Reduced motion (foundation BEFORE major motion)

`prefersReducedMotion()` gates everything: GSAP tweens skipped (final state
applied), R3F goes static single-frame, Lenis never initializes, CSS kills
residual animation/transitions. The site must read complete and composed with
all motion removed — verified by emulating reduced motion during every review.
