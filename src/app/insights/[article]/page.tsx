import { notFound } from "next/navigation";
import { ArticlePage } from "@/components/seo/ArticlePage";
import { getArticle, getArticleSlugs } from "@/data/articles";
import { buildMetadata } from "@/lib/metadata";

export function generateStaticParams(): Array<{ article: string }> {
  return getArticleSlugs().map((article) => ({ article }));
}

export async function generateMetadata({ params }: { params: Promise<{ article: string }> }) {
  const { article: slug } = await params;
  const article = getArticle(slug);
  if (!article) return buildMetadata({ title: "Not found — Pragya Labs" });
  return buildMetadata({
    title: `${article.title}`,
    description: article.metaDescription,
    canonical: `/insights/${slug}`,
  });
}

/** One template for every Insights article. */
export default async function ArticleRoute({ params }: { params: Promise<{ article: string }> }) {
  const { article: slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();
  return <ArticlePage article={article} canonical={`/insights/${slug}`} />;
}
