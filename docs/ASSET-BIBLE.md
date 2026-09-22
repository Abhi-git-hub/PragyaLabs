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

¹ Concept reference `public/hero/pragya-core--concept.png` (sourced from
`assets/NeonDigitalCrystalCore.png`, the creative-exploration artifact). It is a
**reference, not a production asset** — nothing hardwires it; the live prototype
is procedural R3F. Production Core (custom glb or refined procedural) is a P0
Phase 2 gate.
² Phase 1 ships a procedural 2D canvas field (`BackgroundField`); the sprite
variant is only needed if a shader pass is added later.
³ Interim vector mark at `src/app/icon.svg`; final brand mark (drawn from the
production Core geometry language) is a Phase 2 P1.

## Per-asset delivery checklist (before `status: production`)

source/master archived in `assets/` → web + mobile + thumb exported → AVIF/WebP
→ `next/image` widths wired → poster frame for every 3D/video → manifest row
updated → `npm run assets:check` green.
