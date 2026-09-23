# Pragya Labs — Elevation Pass: Proof Over Polish

**Thesis:** digital systems engineered with intelligence. **Status:** elevated
per PRD/TRD v1.0 — living hero layer, deepened case studies from a single
content source, draw-on signature mark, SEO/observability wired, no invented
facts. Unresolved owner inputs are tracked outside the repo, never filled.

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

`/` runs one story: layered Arrival (press the Core — it surges) with the
CODE × DESIGN × INTELLIGENCE statement, Origin (portrait discovered
slit→full, Class 10 → rebuilding → real work → Pragya Labs), Work worlds
(Saarthians scrolled narrative + live data layer, RAG retrieval diagram,
compact specimen), evidence-linked Systems, sharp Approach, understated
Person, "Let's build something" Contact, and an orbital Loop echo.
`/work` hosts the worlds + index; `/about` the readable story.

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
