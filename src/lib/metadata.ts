import type { Metadata } from "next";
import { site } from "@/config/site";

export function buildMetadata(
  overrides: Partial<Metadata> & { canonical?: string; description?: string } = {}
): Metadata {
  const { canonical, description, title, ...rest } = overrides;
  const finalTitle = title ?? `${site.name} — ${site.thesis}`;
  const finalDescription = description ?? site.thesis;
  return {
    metadataBase: new URL(site.url),
    title: finalTitle,
    description: finalDescription,
    authors: [{ name: site.author }],
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title: String(finalTitle),
      description: finalDescription,
      url: canonical,
      type: "website",
      locale: "en_US",
    },
    twitter: { card: "summary_large_image", title: String(finalTitle), description: finalDescription },
    ...rest,
  };
}
