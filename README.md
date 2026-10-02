# Pragya Labs — Grounded Intelligence

Independent digital systems studio: custom AI systems, RAG applications, web applications, and interactive digital experiences. Next.js + TypeScript + Tailwind + GSAP ScrollTrigger + React Three Fiber (hero chamber only).

## Setup

Requires Node >= 22.

```powershell
npm install
npm run dev        # http://localhost:3000
npm run lint       # eslint, zero warnings
npm run typecheck  # tsc --noEmit
npm run assets:check
npm run build
```

## Architecture

- `src/app/` — routes: `/`, `/work`, `/work/[project]`, `/services`, `/services/[service]`, `/insights`, `/about`, `/contact`, `/privacy`, `/terms`. `/lab` redirects to `/work`.
- `src/components/sections/` — homepage chapters (Hero, Recognition, Transformation, CapabilityModules, Method, ProofLedger, EngineeringWall, Trust, Founder, FinalCta).
- `src/components/{layout,navigation,typography,motion,ui,seo,lab,projects,3d}/` — shell, motion primitives, case visuals, the Signal Chamber.
- `src/lib/assets.ts` — asset registry (all production media + metadata). `src/config/tokens.ts` + `src/styles/tokens.css` — design + motion tokens.
- `src/data/` — typed projects (with honest `classification` + `role`), services (SEO titles/metas + FAQs), articles, story.

## Asset registry usage

Components import `assets` from `@/lib/assets` — never hardcode `/film/...` paths. Masters live in gitignored `assets/`; production cuts live in `public/` and must be registered in `public/assets-manifest.json`.

## How to add a new project

1. Add the entry in `src/data/projects.ts` with a truthful `classification` (`Client work` / `In progress` / `R&D experiment` / `Technical exploration` / `Interface study`) and `role`.
2. Add it to the `CARDS` list in `ProofLedger.tsx` if it belongs on the homepage.
3. Routes, sitemap, and next-case links generate automatically.

## How to replace project media

1. Cut the master: 720p, CRF 23–26, `+faststart`, no audio, plus a poster jpg.
2. Drop files in `public/film/`, register in `assets-manifest.json` and `src/lib/assets.ts`, run `npm run assets:check`.

## How to tune animation quality

- `use-device-capability` tiers (`high`/`reduced`) drive DPR, particle counts, and scene detail.
- Scroll chapters gate on `motionAllowed()` + `prefersReducedMotion()`; each section renders a static fallback.

## How to disable/reduce visual effects

- Global: respect OS reduced-motion (all ambient motion, pins, magnetic, cursor stop; static fallbacks render).
- Per-section: each chapter's `useEffect` returns early when motion is off — content stays fully readable.

## How to test performance and accessibility

- `npm run build` must stay green; keep film files < 3MB each.
- Keyboard-walk every page; check focus visibility; run the inquiry form with empty fields.
- Docs: `docs/ASSET-AUDIT.md` (media inventory), `docs/AUDIT-REUSE.md` (reuse + perf + a11y notes), `docs/JOURNEY.md` (funnel map), `docs/ART-DIRECTION.md` (mood, tokens, composition rules).
