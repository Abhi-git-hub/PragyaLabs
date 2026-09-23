# Pragya Labs — Studio Build: A Physical Place for Digital Work

**Thesis:** digital systems engineered with intelligence. **Status:** recomposed
as a serious digital studio experience — Signal Chamber hero from acquired
raw materials, craft sequence from recorded footage, Saarthians world grounded
in its real repository, four project worlds, no demo galleries, no HUD.
The work is the protagonist; the studio is the world.

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
  `/about`, `/contact` (+ in-voice 404). `/lab` redirects to `/work`.
- `src/components/` — layout, navigation, typography, motion, 3D, lab systems,
  person, projects, sections.
- `src/config/` + `src/styles/tokens.css` — design tokens (single source of truth).
- `src/data/` — typed projects (outcomes `placeholder` until verified),
  story (owner-provided facts only), stack (evidence-linked).
- `public/assets-manifest.json` — asset slots + naming system.
- `docs/` — ART-DIRECTION, ASSET-BIBLE, MOTION-SYSTEM, EXPERIENCE-MAP,
  TECHNICAL-ARCHITECTURE.

## The experience

`/` runs one sequence: Signal Chamber arrival (procedural pipe architecture,
instrument console, antenna dish, smoke + dust), craft studies (recorded
machinery, interior, materials), Origin (portrait discovered, Class 10 →
Pragya Labs), Work worlds (Saarthians narrative + live data, RAG diagram,
Majdoor signal, X specimen), Approach, Person, Contact with a 12-hour reply
promise, and an orbital Loop echo. `/work` hosts the worlds + index;
`/about` the readable story with detail crops.

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
