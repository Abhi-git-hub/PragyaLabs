import { InsightsHub } from "@/components/seo/ArticlePage";
import { BreadcrumbListJsonLd } from "@/components/seo/JsonLd";
import { site } from "@/config/site";
import { articles } from "@/data/articles";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Insights — Technical Notes | Pragya Labs",
  description:
    "Technical writing with proof: grounded AI, retrieval evaluation, frontend performance. No trend lists.",
  canonical: "/insights",
});

/** Insights hub — grows one honest article at a time. */
export default function InsightsPage() {
  return (
    <>
      <BreadcrumbListJsonLd
        items={[
          { name: "Index", url: site.url },
          { name: "Insights", url: `${site.url}/insights` },
        ]}
      />
      <InsightsHub items={articles} />
    </>
  );
}
