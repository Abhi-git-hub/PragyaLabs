# TECHNICAL ARCHITECTURE — Pragya Labs (Studio Build)

> Frontend only: no backend, no database, no auth, no CMS, no API routes.

## Framework & rendering

Next.js 15 (App Router) + React 19 + TypeScript (strict, `noEmit`, `@/*` →
`./src/*`). Default: Server Components; `"use client"` only at interactive
leaves (nav, motion primitives, canvases, test area). Static generation where
possible (`generateStaticParams` for `/work/[project]`). SEO via per-route
`buildMetadata()` (OpenGraph/Twitter/en_IN) in `src/lib/metadata.ts`.

## Component structure

```
src/
  app/            /, /work, /work/[project], /about, /contact;
                  /lab redirects to /work (gallery retired, systems kept)
  components/
    layout/       SectionContainer, SiteFooter (shell, rhythm)
    navigation/   SiteNav (hide-on-scroll + progress hairline + mobile sheet)
    typography/   Display / Body / Eyebrow (the three voices)
    motion/       Reveal / Stagger, CursorProvider + Cursor (visible renderer),
                  RouteTransition, Film (gated video inserts)
    3d/           SignalChamber (procedural pipe architecture, dish, console,
                  smoke video layer, dust; intro/scroll refs, tiers),
                  PragyaCoreScene + Canvas (Loop echo only),
                  BackgroundField (2D ambient)
    lab/          ParticleLab (Saarthians data layer), RetrievalViz (RAG world),
                  MajdoorVisual (reach signal), XFrontendVisual (density study)
    person/       Portrait (parallax + grain), Signature = SignatureMark
                  (authentic vector, clip-wipe draw-on + light pass)
    projects/     ProjectCard (enriched rows), CaseStudy (verified-only),
                  SystemFlow (Saarthians pipeline), SaarthiansVisual (live layer)
    sections/     Hero (Signal Chamber), CraftSequence, Story→Origin,
                  Work (worlds), Philosophy→Approach, Person, ContactSection, Loop
  hooks/          use-prefers-reduced-motion, use-pointer (rAF-friendly ref),
                  use-device-capability (high/reduced tiers)
  lib/            motion (GSAP registry + gate), smooth-scroll (Lenis),
                  metadata, cn (no clsx dependency)
  data/           projects (single source: problem/decisions/challenge/
                  outcome/gallery, metrics omitted until real),
                  story (owner-provided facts only), stack (evidence-linked)
  config/         site/routes, tokens mirror, cursor states
  styles/         tokens.css (source of truth) + globals.css (Tailwind v4 @theme)
```

Composition over monoliths: pages assemble sections; sections assemble
primitives. No page component owns rendering logic it can delegate.

## Motion architecture

React → interface/state. GSAP (+ ScrollTrigger, registered once) → scroll
choreography; ScrollTrigger is the single scroll authority. R3F → 3D scenes
(dynamic import, `ssr:false`). CSS → micro (120ms) + interface (200–350ms)
transitions. Scroll→3D bridge: a mutable `{ current: 0..1 }` progress ref owned
by the section, read in `useFrame` — no react re-renders in the loop.

## 3D architecture

One canvas per moment, each dynamically loaded. Budgets: `dpr ≤ 1.75`, shell
particles ≈ 260, ambient 2D field ≈ 90/36 (desktop/mobile), standard materials
over physical, `frameloop="demand"` + static frame under reduced motion, pause
on hidden tab. No WebGL without a poster fallback and a mobile quality cut.

## Asset pipeline

`assets/` (masters, unserved) → `public/` (production: AVIF/WebP images,
720p gated film with posters, 1024w texture maps) → `next/image` with explicit
dimensions. Manifest (`public/assets-manifest.json`) + `npm run assets:check`
gate every addition. Production media: `src/app/icon.svg`,
`public/textures/*`, `public/film/*`, `public/person/*` (see ASSET-BIBLE).

## Performance strategy

Minimal client JS (server-first, dynamic 3D), `optimizePackageImports` for
three/fiber/drei/gsap, self-hosted fonts, AVIF/WebP + responsive assets,
poster-first video (plays only in-viewport, high tier, full motion),
intersection-aware canvases, capability tiers via `useDeviceCapability`
(mobile / ≤4 cores / ≤4GB / no WebGL / data-saver → reduced), GPU-conscious
animation (transform/opacity only), Lenis desktop-only, progressive
enhancement throughout. No library duplication: one tool per job (GSAP scroll,
R3F 3D, CSS micro).

## Accessibility strategy

Landmarks + skip link + one `h1`/route, visible cyan focus, keyboard-operable
menu, decorative HUD labels + canvases `aria-hidden`, reduced-motion
final-state rendering before any signature motion, contrast-safe tokens
(signal cyan ≈13.8:1 on obsidian, faint = metadata only), 44px+ touch targets,
status never color-alone.

## Observability & SEO

Vercel Analytics + Speed Insights in the root layout (first-party, minimal).
`sitemap.ts` + `robots.ts` cover all routes incl. generated case studies;
per-case OG images via `opengraph-image.tsx`; Organization/Person JSON-LD on
`/` and `/about`. Lighthouse CI workflow asserts performance ≥90 and LCP
≤2s on hero/case routes per PR.

## Live stats (optional, TRD v2 §3.4)

`GET /api/stats` proxies Cloudflare Analytics server-side. Enable with env
vars (Vercel project settings — never committed):
`CF_API_TOKEN` (Analytics:Read on the zone) + `CF_ZONE_ID`. Cached 5 min
(`revalidate: 300`). Without them the route 503s and `<LiveStats/>` renders
nothing — the token never touches the client bundle. Monitor the route's
latency/error rate in Speed Insights if enabled.

## Toolchain

`npm run dev | build | start | lint (flat config: base JS + TS + Next
core-web-vitals via @next/eslint-plugin-next, zero warnings) |
typecheck (tsc --noEmit) | assets:check`. Dev requirement: **Node ≥ 22**
(enforced via `engines`; drei's transitive `camera-controls` requires it).
No secrets, no `.env` in repo.
