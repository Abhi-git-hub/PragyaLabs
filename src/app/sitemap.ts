import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { getProjectSlugs } from "@/data/projects";
import { getServiceSlugs } from "@/data/services";

/** Sitemap: all public routes incl. services and generated case studies. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url;
  const now = new Date();
  const staticRoutes = ["", "/work", "/about", "/contact", "/services"].map((route) => ({
    url: `${base}${route}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: route === "" ? 1 : route === "/services" ? 0.9 : 0.8,
  }));
  const services = getServiceSlugs().map((slug) => ({
    url: `${base}/services/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));
  const cases = getProjectSlugs().map((slug) => ({
    url: `${base}/work/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));
  return [...staticRoutes, ...services, ...cases];
}
