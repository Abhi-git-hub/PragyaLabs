# EXPERIENCE MAP — Pragya Labs (Phase 2)

> Visitor journey: IDENTITY → THESIS → EXPERIMENTATION → WORK → TECHNOLOGY →
> PHILOSOPHY → PERSON → CONTACT. SCENE 01 + 02 are fully built; the rest hold
> documented placeholders until their phase arrives.

## Home (`/`) — the narrative spine

| Act | Section | Purpose | Message | Visual (planned) | Interaction (planned) | Transition | CTA |
|---|---|---|---|---|---|---|---|
| 00 | System init | Set the lab frame | "You are entering a system" | Mono boot overlay | Auto-play, skippable | Dissolve | → motion test |
| 01 | Arrival | Identity impact | "Pragya Labs" as monument | Portal video + Core + mass type (**BUILT — `HeroArrival`**) | Layered load, pointer tilt/light, scroll descent | Core recedes | — |
| 02 | Thesis | State the idea once | "CODE × DESIGN × INTELLIGENCE" | Pinned 4-phase scroll system (**BUILT — `Thesis`**) | Geometric → fluid → network → converge | Mask wipe | — |
| 03 | Work | Prove with systems | "Selected, real, verified" | Hairline index, dimensional hover | VIEW cursor | Horizontal slide | → /work |
| 04 | Lab | Show thinking | "Experiments in progress" | AI planet / network sphere | EXPLORE, draggable | Orbital rotation | → /lab |
| 05 | Stack | Technology as system | "Every tool earns its place" | Data monolith | Scroll-assembled diagram | Collapse | — |
| 06 | Philosophy | Restraint | "Fewer, better systems" | Prismatic ribbon | Scroll morph | Ribbon resolves | — |
| 07 | Person | Trust | "Engineer, not persona" | Portrait + coordinates | Quiet parallax | Fade | → /about |
| 08 | Contact | One channel | "Enter the lab" | Full-bleed CTA | Magnetic (desktop) | Loop reset | → /contact |
| 09 | Loop | Closure | "Ends where it began" | Core reassembly | Scroll rewind | → ACT 00 | — |

Public homepage (Phase 2.1 cleanup): SCENE 01 → SCENE 02 → selected-systems
index → footer. No internal demos, no placeholder acts, no scaffolding
language on any public route. The retired demo components
(TypeSpecimen/ColorSystem/MotionTestArea/ActPlaceholder) were presentation
only — the underlying tokens and primitives (`tokens.css`, `Reveal`,
`Stagger`) remain the production system.

## Routes

- `/work` — index of real systems; rows carry number/category/year/status.
  Dimensional preview + filters in Phase 2.
- `/work/saarthians` — flagship case study on the shared `CaseStudy`
  architecture (PROBLEM → SYSTEM → DESIGN → ENGINEERING → AI → SECURITY →
  EXPERIENCE); sections render verified data, the rest is tagged pending.
- `/work/[project]` — same template for all projects; outcome stays
  `placeholder` until verified.
- `/lab` — experiments with honest status labels (concept/prototype/live).
- `/about` — person + philosophy; facts only, no persona fiction.
- `/contact` — single channel; address placeholder until inbox is provisioned.
- `*` — in-voice 404 ("No specimen here") returning to index.

## Mobile journey

Same acts, recomposed: stacked cinematic, type leads, 3D as backdrop, no Lenis,
reduced particles, ≥44px targets. A mobile visitor must feel the same thesis
with half the effects — pacing and scale do the cinematic work.

## Conversion logic

One funnel, no traps: every act offers at most one CTA, all CTAs lead deeper
into proof (work/lab) or to contact. No newsletter, no popups, no fake socials.
