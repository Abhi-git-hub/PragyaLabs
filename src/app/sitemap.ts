import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { getProjectSlugs } from "@/data/projects";

/** Sitemap: all public routes incl. generated case studies. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url;
  const now = new Date();
  const staticRoutes = ["", "/work", "/about", "/contact"].map((route) => ({
    url: `${base}${route}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: route === "" ? 1 : 0.8,
  }));
  const cases = getProjectSlugs().map((slug) => ({
    url: `${base}/work/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));
  return [...staticRoutes, ...cases];
}
