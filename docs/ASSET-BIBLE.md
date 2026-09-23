# ASSET BIBLE — Pragya Labs (Phase 1)

> Machine-readable mirror: `public/assets-manifest.json` (`npm run assets:check`).
> Rule: no randomly generated imagery. No asset ships without purpose + spec row.

## Conventions

- Naming: `{asset}--{variant}.{ext}`; variants: `source/concept/web/mobile/thumb/poster`.
- `assets/` (repo root) = masters + concept references, **never served**.
- `public/` = production files only, AVIF/WebP preferred, responsive pairs.
- Subjects allowed: technological sculptures, computational objects, energy
  cores, orbital systems, neural structures, crystalline computation, data
  architecture, experimental interfaces. Banned: robot heads, AI brains,
  laptops, businessmen, stock developers, cliché future cities.

## Required assets

| # | Name | Purpose | Kind / Format | Aspect | Desktop | Mobile | Priority | Status |
|---|---|---|---|---|---|---|---|---|
| 01 | `pragya-core` | Hero centerpiece | 3D → glb/webm + poster | 1:1 | 2048² | 1024² | P0 | concept¹ |
| 02 | `neural-orbital` | Intelligence section | 3D glb + poster png | 16:9 | 2560×1440 | 1280×720 | P1 | planned |
| 03 | `data-monolith` | Technology section | 3D glb + poster png | 4:5 | 1600×2000 | 1080×1350 | P1 | planned |
| 04 | `prismatic-ribbon` | Philosophy transition | webm + mp4 fallback + poster | 21:9 | 2560×1097 | 1280×549 | P2 | planned |
| 05 | `ai-planet` | Lab network sphere | 3D glb + poster png | 1:1 | 2048² | 1024² | P1 | planned |
| 06 | `particle-field` | Ambient background | procedural (sprite if needed) | n/a | 256² sprite | 128² sprite | P0 | planned² |
| 07 | `interface-grid` | Technical overlays | svg vector | n/a | vector | vector | P2 | planned |
| 08a | `project-saarthians` | Case-study hero + thumb | avif/webp | 16:10 / 4:3 | 2400×1500 / 1200×900 | 1280×800 / 800×600 | P0 | planned |
| 08b | `project-stock-rag` | Case-study hero + thumb | avif/webp | 16:10 / 4:3 | 2400×1500 / 1200×900 | 1280×800 / 800×600 | P1 | planned |
| 08c | `project-x-clone` | Case-study hero + thumb | avif/webp | 16:10 / 4:3 | 2400×1500 / 1200×900 | 1280×800 / 800×600 | P2 | planned |
| — | `brand-mark` | Favicon / avatar (interim) | svg | 1:1 | 512² | 192² | P0 | production³ |
| 09 | `portal-environment` | Arrival hero backdrop loop | mp4 + poster | 16:9 | 1280×720 / 7.8s | 640×360 cut | P0 | **retired** ⁴ |
| 10 | `portrait` | Story + about editorial portrait | jpg pair | 16:9 | 1600w | 900w | P0 | production⁵ |

¹ Concept reference `public/hero/pragya-core--concept.png` (sourced from
`assets/NeonDigitalCrystalCore.png`, the creative-exploration artifact). It is a
**reference, not a production asset** — nothing hardwires it; the live prototype
is procedural R3F. Production Core (custom glb or refined procedural) is a P0
Phase 2 gate.
² Phase 1 ships a procedural 2D canvas field (`BackgroundField`); the sprite
variant is only needed if a shader pass is added later.
³ Interim vector mark at `src/app/icon.svg`; final brand mark (drawn from the
production Core geometry language) is a Phase 2 P1.
⁴ RETIRED per PRD §6.1 (Elevation): the hero background is now the living
HeroField particle system — no video, no poster frame. Cut recipe preserved:
master `assets/uiLook2Video.mp4`, baked-text intro trimmed from t=2.0s, audio
stripped, 0.8s fade head/tail, CRF 26 (928KB) + 640×360 mobile cut (146KB).
Masters remain in `assets/`; production files removed from `public/`.

## Concept references (masters in `assets/`, unserved)

- `NeonDigitalCrystalCore.png` — chrome-ring crystal + orbital language; informed
  the procedural Core prototype.
- `uiLook.png` — arrival composition study: obsidian waterscape, portal ring,
  monoliths, PRAGYA LABS mass type + thesis lockup, hairline UI furniture
  ("EXPLORE / BUILD / EXPERIMENT / GROW", "DELHI / INDIA / GLOBAL BY DESIGN").
- `uiLook2.png` — lab-atmosphere study: network-lit planet, light-edged
  monoliths, "IDEAS / INTERFACES / INTELLIGENCE / IMPACT" motif ladder.
⁵ Approved artwork `assets/me01.png` (1672×941): dark studio, cool blue rim
light, planet backdrop, integrated signature. Production: 1600w web (173KB)
+ 900w mobile (53KB) via next/image; signature cropped to
`signature--detail.jpg` (42KB) for screen-blend reuse in story/about/loop —
never a logo, never distorted. Elevation adds two text-free detail crops
from the same artwork (`detail--hands.jpg`, `detail--rim.jpg`) so the About
page shows real moments, not one portrait doing all the work.
- `uiLook2Video.mp4` — portal-environment master (see ⁴ above). Baked text in
  the 0–2s intro; production cut removes it. Never served directly.
- `me01.png` — portrait/signature master (see ⁵ above). Never served directly.

These are direction inputs, not production assets. The production library
(ASSET-01…08) will be authored from this language in Phase 2.

## Per-asset delivery checklist (before `status: production`)

source/master archived in `assets/` → web + mobile + thumb exported → AVIF/WebP
→ `next/image` widths wired → poster frame for every 3D/video → manifest row
updated → `npm run assets:check` green.
