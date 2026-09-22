import type { Metadata } from "next";
import { site } from "@/config/site";

export function buildMetadata(overrides: Partial<Metadata> = {}): Metadata {
  const title = overrides.title ?? `${site.name} — ${site.thesis}`;
  return {
    metadataBase: new URL(site.url),
    title,
    description: site.thesis,
    authors: [{ name: site.author }],
    openGraph: {
      title: String(title),
      description: site.thesis,
      type: "website",
      locale: "en_IN",
    },
    twitter: { card: "summary_large_image", title: String(title), description: site.thesis },
    ...overrides,
  };
}
