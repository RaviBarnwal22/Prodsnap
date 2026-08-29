import { SEODetailPage } from "@/components/SEODetailPage";
import { SEOContentData } from "@/lib/seo-content";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-static";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const pages = Object.keys(SEOContentData["glossary"] || {});
  return pages.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = SEOContentData["glossary"]?.[slug];
  if (!page) return {};

  return {
    title: page.title,
    description: page.metaDescription,
    alternates: {
      canonical: `https://prodsnap.in/glossary/${slug}`,
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const page = SEOContentData["glossary"]?.[slug];
  if (!page) {
    notFound();
  }

  return (
    <SEODetailPage
      pageData={page}
      pillarId="glossary"
      categorySlug={slug}
    />
  );
}
