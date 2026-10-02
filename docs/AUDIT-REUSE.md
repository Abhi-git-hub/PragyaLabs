# Grounded Intelligence refinement — reuse audit & notes

## Retained (technically sound, kept as-is or retinted)
- `SignalChamber` — the single full-page WebGL scene (hero). Retinted to cyan/violet/coral via tokens; types localized after PragyaCore removal.
- `BackgroundField` — global ambient 2D canvas, DPR-capped, IO-paused. Palette follows tokens.
- `Film` pattern (viewport-gated video + poster + reduced-motion still) — reused in Proof cards.
- `ParticleLab`, `RetrievalViz`, `MajdoorVisual`, `SaarthiansVisual`, `AdhyayanVisual` — case-page visuals, retinted.
- `SectionContainer`, `Reveal`/`Stagger`, `Magnetic` (fine-pointer only), `Breadcrumb`, JSON-LD set (+FAQPage, Organization).
- `SiteNav` (extended with Capabilities/Method/Insights + Start-a-project CTA), `SiteFooter` (commercial nav, contact, legal).
- `CaseStudy` template (+classification strip, +next-case CTA), `ProjectCard`, work index.
- `Preloader` — rewritten as time-boxed signal motif (≤1.5s, no fake counter, skipped on reduced motion).
- `SmoothScroll` (Lenis), `RouteTransition`, `Cursor` (gated; `OPEN CASE` labels on proof cards only).
- Asset pipeline (`assets/` masters → `public/film` cuts + manifest + `assets:check`) unchanged.

## Removed (dead or brief-conflicting)
- `Statement` (banned brand wording), `WordMachine` (banned wording), `Metamorphosis` + scene, `Immersive` + `EmberForms`, `ServicesStrip` + `ServicesAtlas`, `FeaturedWork`, `Process` (superseded by `Method`), `Work`, `CraftSequence`, `SaarthiansSpace`, `RainbowCursor`, `PragyaCore*`, `Loop` — all unreferenced after restructure. One full-page WebGL scene remains (hero).

## Information architecture (home spine)
Hero → Recognition → Capability → Method → Proof → Relief → Founder → Final. Fragments → Context → Intelligence → Interface → Impact.

## Performance notes
- WebGL dynamic-imported, never blocks LCP; hero copy is plain HTML.
- DPR capped (1.5), ~90/36 particles, IO-paused canvases, videos preload="metadata" + posters + tap controls.
- No bloom/volumetrics; pinned scrub only on capable desktop (Recognition), static flow otherwise.

## Accessibility checklist
- One H1 per page; semantic landmarks; decorative canvas aria-hidden; real `<label>`s + inline errors + `role="status"` on the inquiry form.
- Visible focus states, 44px+ targets, keyboard-operable menu, reduced-motion disables preloader/scrub/ambient/magnetic paths.
- Contrast: ice-on-ink body ≈12:1; light-scope cyan links use deep `#007FA3` (≈5:1 on ivory).

## Content workflow
- Copy lives in `src/data/*` (projects need `classification`; services carry SEO titles/metas + FAQs).
- Proof cards read `src/data/projects.ts` — add a project there and it appears on `/work`, sitemap, and (if listed) the Proof section.
- Contact form composes a `mailto:` with validation — no backend. Swapping in a form API later only touches `ProjectForm`.
