# Pragya Labs — Phase 1: Experience Foundation

**Thesis:** digital systems engineered with intelligence. **Status:** foundation.
This repo is the public build log of a cinematic portfolio — currently
architecture, tokens, docs, and one technical prototype, not the full site.

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

## The prototype

`/` opens with the **Pragya Core Playground**: a pointer-reactive R3F crystal
system with scroll-aware descent, proving the visual direction and the
scroll→3D motion architecture before the full hero is built. Foundation demos
(typography / color / motion) follow the ACT 0–9 placeholders.

## Rules for contributors (including future us)

No generic portfolio layouts, no glassmorphism soup, no fake stats/clients/
testimonials, no invented project outcomes, no copied references, no dependency
without a job. Every visual decision needs a purpose — see docs/ART-DIRECTION.md.
