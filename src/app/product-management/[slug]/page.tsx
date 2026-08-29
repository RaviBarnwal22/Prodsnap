import { SEODetailPage } from "@/components/SEODetailPage";
import { SEOContentData } from "@/lib/seo-content";
import { Metadata } from "next";
import { notFound } from "next/navigation";

// Since it's backed by static content, we use SSG for maximum SEO performance
export const dynamic = "force-static";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const pages = Object.keys(SEOContentData["product-management"] || {});
  return pages.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = SEOContentData["product-management"]?.[slug];
  if (!page) return {};

  return {
    title: page.title,
    description: page.metaDescription,
    alternates: {
      canonical: `https://prodsnap.in/product-management/${slug}`,
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const page = SEOContentData["product-management"]?.[slug];
  if (!page) {
    notFound();
  }

  return (
    <SEODetailPage
      pageData={page}
      pillarId="product-management"
      categorySlug={slug}
    />
  );
}
