# MOTION SYSTEM — Pragya Labs (Studio Build)

> Tokens: `--pl-duration-*`, `--pl-ease-*` in `src/styles/tokens.css`.
> Primitives: `Reveal`, `Film` (gated video), `SignatureMark` (wipe + pass).
> Gate: `motionAllowed()` + `usePrefersReducedMotion()`.
> Voice: weighted, precise, cinematic, deliberate. No floating, no springs-as-toys,
> no camera shake, nothing moving all at once.

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

## Signature interactions (all BUILT; every effect answers "why HERE")

1. Hero object reacts to cursor — pointer parallax tilt + energy-light response,
   staged by the load timeline; a press fires a light surge (`surgeRef`).
2. Object transforms as user scrolls — descent + rotation + scale via scrubbed
   0..1 progress ref; environment breathes via parallax; hero type lifts away.
3. Work worlds carry the technique — particle field as Saarthians' live data
   layer, retrieval diagram as the RAG story, glyph seams as chapter
   transitions, spring cursor globally. No standalone demo gallery.
4. Technology stack assembles on scroll — clip-reveal rows, evidence links.
5. The Loop echoes the opening — reassembled Core + orbital path + the mark.

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
Visible renderer BUILT in Phase 3 (`Cursor.tsx`): dot + hairline ring with
state label, lerped follow, event-delegated `data-cursor` zones, desktop
`pointer:fine` only, **never on touch, never under reduced motion**.

## Loading & page transitions

Type paints first; canvases hydrate after (dynamic, intersection-gated,
single R3F canvas per viewport — never several running at once). Film
inserts play only in viewport, pause offscreen/hidden, poster-first.
Reduced motion: static composed frames everywhere — chamber, diagrams,
signature whole, films still.

## Reduced motion (foundation BEFORE major motion)

`prefersReducedMotion()` gates everything: GSAP tweens skipped (final state
applied), R3F goes static single-frame, Lenis never initializes, CSS kills
residual animation/transitions. The site must read complete and composed with
all motion removed — verified by emulating reduced motion during every review.
