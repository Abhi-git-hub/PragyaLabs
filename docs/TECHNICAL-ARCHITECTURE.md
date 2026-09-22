# TECHNICAL ARCHITECTURE — Pragya Labs (Phase 1)

## Framework & rendering

Next.js 15 (App Router) + React 19 + TypeScript (strict, `noEmit`, `@/*` →
`./src/*`). Default: Server Components; `"use client"` only at interactive
leaves (nav, motion primitives, canvases, test area). Static generation where
possible (`generateStaticParams` for `/work/[project]`). SEO via per-route
`buildMetadata()` (OpenGraph/Twitter/en_IN) in `src/lib/metadata.ts`.

## Component structure

```
src/
  app/            routes: page + layout + not-found + icon (placeholders wired)
  components/
    layout/       SectionContainer, SiteFooter (shell, rhythm)
    navigation/   SiteNav (fixed hairline bar + mobile menu)
    typography/   Display / Body / Eyebrow (the three voices)
    motion/       Reveal / Stagger, CursorProvider (contract only)
    3d/           BackgroundField (2D ambient), PragyaCoreScene + Canvas (dynamic)
    projects/     ProjectCard (editorial index row)
    sections/     PlaygroundHero, ActPlaceholder, Type/Color/Motion demos
  hooks/          use-prefers-reduced-motion, use-pointer (rAF-friendly ref)
  lib/            motion (GSAP registry + gate), smooth-scroll (Lenis),
                  metadata, cn (no clsx dependency)
  data/           projects, experiments (typed, placeholders explicit)
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

`assets/` (masters, unserved) → `public/` (production, AVIF/WebP, responsive
pairs) → `next/image` with explicit dimensions. Manifest
(`public/assets-manifest.json`) + `npm run assets:check` gate every addition.
Current production files: `src/app/icon.svg`, `public/hero/pragya-core--concept.png`
(reference only).

## Performance strategy

Minimal client JS (server-first, dynamic 3D), `optimizePackageImports` for
three/fiber/drei/gsap, self-hosted fonts, AVIF/WebP + responsive assets, lazy
below-fold sections in Phase 2, GPU-conscious animation (transform/opacity
only), Lenis desktop-only, progressive enhancement throughout. No library
duplication: one tool per job (GSAP scroll, R3F 3D, CSS micro).

## Accessibility strategy

Landmarks + skip link + one `h1`/route, visible cyan focus, keyboard-operable
menu, decorative canvases `aria-hidden`, reduced-motion final-state rendering
before any signature motion, contrast-safe tokens (faint = metadata only),
44px+ touch targets, status never color-alone.

## Toolchain

`npm run dev | build | start | lint (eslint-config-next, zero warnings) |
typecheck (tsc --noEmit) | assets:check`. Dev requirement: **Node ≥ 22**
(drei's `camera-controls` transitive dependency requires it; Node 20 installs
with an EBADENGINE warning). No secrets, no `.env` in repo.
