# Pragya Labs — Phase 2: Cinematic Experience

**Thesis:** digital systems engineered with intelligence. **Status:** experience build.
SCENE 01 (Arrival) + SCENE 02 (Thesis) are live; remaining acts are documented placeholders.

## Quickstart

Requires **Node ≥ 22** (see docs/TECHNICAL-ARCHITECTURE.md).

```powershell
npm install
npm run dev        # http://localhost:3000
npm run lint       # eslint, zero warnings
npm run typecheck  # tsc --noEmit
npm run assets:check
npm run build
```

## What's inside

- `src/app/` — routes: `/`, `/work`, `/work/saarthians`, `/work/[project]`,
  `/lab`, `/about`, `/contact` (+ in-voice 404).
- `src/components/` — layout, navigation, typography, motion, 3D, projects, sections.
- `src/config/` + `src/styles/tokens.css` — design tokens (single source of truth).
- `src/data/` — typed projects + experiments. Outcomes are `placeholder` until
  verified — nothing is invented.
- `public/assets-manifest.json` — asset slots + naming system.
- `docs/` — ART-DIRECTION, ASSET-BIBLE, MOTION-SYSTEM, EXPERIENCE-MAP,
  TECHNICAL-ARCHITECTURE.

## The experience

`/` opens with **SCENE 01 — Arrival**: portal-environment video (poster-first),
materializing R3F Pragya Core (pointer tilt + light response, scroll descent),
masked-line typography, layered load choreography. **SCENE 02 — Thesis** is a
pinned 4-phase scroll system (CODE → DESIGN → INTELLIGENCE → convergence).
Foundation demos (typography / color / motion) and the selected-systems index
follow the remaining act placeholders.

## Deployment workflow (permanent rule)

GitHub `main` is production. The repo is connected to Vercel with Git
integration: every push to `main` triggers a production deployment
(preview deployments for other branches where applicable).

At the end of every meaningful phase:

1. `npm run lint` → 2. `npm run typecheck` → 3. tests if present →
4. `npm run build` → 5. inspect `git diff` → 6. commit → 7. `push to main` →
8. verify the Vercel deployment → 9. report URL + status.

Never claim "deployed" without a verified deployment. No secrets in the repo:
no `.env`, no tokens, no API keys.

## Rules for contributors (including future us)

No generic portfolio layouts, no glassmorphism soup, no fake stats/clients/
testimonials, no invented project outcomes, no copied references, no dependency
without a job. Every visual decision needs a purpose — see docs/ART-DIRECTION.md.
