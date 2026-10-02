/**
 * Asset registry — every production media file in one place with its
 * metadata and role. Components reference `assets.*`, never hardcoded
 * paths, so replacing media means editing this file (plus the manifest).
 */

export type FilmAsset = {
  src: string;
  poster: string;
  label: string;
  caption: string;
  credit: string;
};

export type PhotoAsset = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export const assets = {
  film: {
    saarthians: {
      src: "/film/saarthians--feature.mp4",
      poster: "/film/saarthians--feature--poster.jpg",
      label: "Saarthians concept film — interface explorations in motion",
      caption: "Saarthians — concept film. Verified facts live on the case page.",
      credit: "AI-mockup footage — presented strictly as concept film, never product.",
    },
    adhyayan: {
      src: "/film/adhyayan--feature.mp4",
      poster: "/film/adhyayan--feature--poster.jpg",
      label: "Adhyayan Classes — recorded walkthrough of the live site",
      caption: "Adhyayan Classes — recorded walkthrough. Live since 2023.",
      credit: "Recorded from the live production site.",
    },
  } satisfies Record<string, FilmAsset>,
  photo: {
    desk: {
      src: "/person/desk--web.jpg",
      alt: "Abhi's work desk in Delhi — laptop, notebook, and the books behind real projects",
      width: 1400,
      height: 1052,
    },
  } satisfies Record<string, PhotoAsset>,
} as const;
