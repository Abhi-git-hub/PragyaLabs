# Asset audit — Grounded Intelligence build

`assets/` is gitignored (disk-only masters, ~1.4GB incl. a stray 208MB Qoder exe — safe to delete locally). `public/` is served (~15MB). No stock AI-robot imagery anywhere. No Lottie, no 3D model files (all geometry procedural).

## Proof media (highest value — central placement)
| File | Spec | Status |
|---|---|---|
| `public/film/adhyayan--feature.mp4` + poster | 1280×576, 20.4s, 2.1MB, h264 | Proof card hero media. Real site, verified frames. Keep. |
| `public/film/saarthians--feature.mp4` + poster | 720p-class, 2.2MB | Proof card hero media. AI-mockup footage — captioned strictly as concept film. Keep. |
| `public/person/desk--web.jpg` | 1400w, 189KB (cut from `assets/me_10.png`) | NEW — real desk photo, Founder section. Keep. |
| `assets/saarthians.mp4` | 1280×720, 10s, 4.5MB | Frame-checked: AI-mockup gibberish text. NOT product proof. Stays a concept-film source only. |
| `assets/adhyayanclasses.mp4` | 1350×608, 20.4s, 9MB | Master for the Adhyayan cut. Keep on disk. |

## Atmosphere (used, keep)
`smoke/rain/lathe/drop/black/interior/saarthians--texture` cuts + posters (craft studies + transition band — back in the homepage flow), `public/textures/*` (6 diffuse maps, in-manifest), `public/person/workspace*.jpg` (About page), `signature.svg` (About).

## Decorative / non-proof (do not present as evidence)
`portrait--*.jpg` (AI-stylized portrait — never a founder headshot), `detail--*.jpg`, `antenna--web.jpg`, `signature--detail.jpg`, `pragya-core--concept.png` (2.2MB concept render, unused), `assets/me_11/12.png`, `landscape.jpg` (6.5MB), `industrial_interior.mp4`, `abstract_movement/city_at_night.mp4` (4K stock-scale, never ship as-is — cut to ≤720p if ever used).

## Optimization rules
- Film: 720p max, CRF 23–26, `-movflags +faststart`, no audio, poster required, `preload="metadata"`, pause offscreen.
- Photos: 1400w max, q≤5 (≈200KB), `next/image` with `sizes`.
- Never serve from `assets/`; never commit masters (gitignored).
