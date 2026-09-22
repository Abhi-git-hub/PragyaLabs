# Pragya Labs — Phase 3: Full Cinematic Experience

**Thesis:** digital systems engineered with intelligence. **Status:** the real
experience. Ten home chapters (Arrival → Thesis → Story → Work → Lab → Stack →
Philosophy → Person → Contact → Loop), live lab specimens, evidence-based
stack, story with approved portrait + signature. No demos, no scaffolding
language on any public route.

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

`/` runs ten chapters: portal-video Arrival with materializing Core, pinned
CODE × DESIGN × INTELLIGENCE Thesis, quiet Story (Class 10 → rebuilding →
Pragya Labs), Saarthians system-flow Work proof, three live Lab specimens,
evidence-linked Stack, editorial Philosophy, understated Person, "Let's build
something" Contact, and a Loop that reassembles the Core. `/lab` hosts
full-length specimens; `/about` the readable story; `/work` the index.

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
