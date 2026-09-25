import { notFound } from "next/navigation";
import { ServicePage } from "@/components/seo/ServicePage";
import { getService, getServiceSlugs } from "@/data/services";
import { buildMetadata } from "@/lib/metadata";

export function generateStaticParams(): Array<{ service: string }> {
  return getServiceSlugs().map((service) => ({ service }));
}

export async function generateMetadata({ params }: { params: Promise<{ service: string }> }) {
  const { service: slug } = await params;
  const service = getService(slug);
  if (!service) return buildMetadata({ title: "Not found — Pragya Labs" });
  return buildMetadata({
    title: service.title,
    description: service.metaDescription,
    canonical: `/services/${slug}`,
  });
}

/** One strong page owns each commercial topic cluster. */
export default async function ServiceRoute({ params }: { params: Promise<{ service: string }> }) {
  const { service: slug } = await params;
  const service = getService(slug);
  if (!service) notFound();
  return <ServicePage service={service} />;
}
