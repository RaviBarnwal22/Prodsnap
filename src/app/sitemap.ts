import { MetadataRoute } from "next";
import { SEOContentData } from "@/lib/seo-content";

const baseUrl = "https://prodsnap.in";

// Every entry used to carry `new Date()`, so a deploy that touched nothing
// still told Google the entire site had changed. That devalues the signal.
// Content-bearing routes now carry the date their content last actually moved
// — bump CONTENT_LAST_MODIFIED when the SEO content or page copy changes.
const CONTENT_LAST_MODIFIED = new Date("2026-09-22");

export default function sitemap(): MetadataRoute.Sitemap {
  // Routes whose content genuinely changes often.
  const frequentRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, changeFrequency: "daily" as const, priority: 1.0 },
    { url: `${baseUrl}/practice`, changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${baseUrl}/prodsense`, changeFrequency: "daily" as const, priority: 0.8 },
    { url: `${baseUrl}/mentors`, changeFrequency: "weekly" as const, priority: 0.7 },
  ].map((r) => ({ ...r, lastModified: new Date() }));

  // Stable marketing / conversion routes.
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/mentorship`, changeFrequency: "monthly" as const, priority: 0.9 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${baseUrl}/community`, changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${baseUrl}/exam`, changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${baseUrl}/contact`, changeFrequency: "yearly" as const, priority: 0.3 },
    { url: `${baseUrl}/terms`, changeFrequency: "yearly" as const, priority: 0.2 },
    { url: `${baseUrl}/privacy`, changeFrequency: "yearly" as const, priority: 0.2 },
  ].map((r) => ({ ...r, lastModified: CONTENT_LAST_MODIFIED }));

  // Category pillar pages.
  const pillarRoutes: MetadataRoute.Sitemap = [
    "/product-management",
    "/product-management-interview",
    "/frameworks",
    "/product-analytics",
    "/templates",
    "/glossary",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: CONTENT_LAST_MODIFIED,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Programmatic content pages, derived from the same source the routes render.
  const dynamicRoutes: MetadataRoute.Sitemap = [];
  Object.keys(SEOContentData).forEach((pillarId) => {
    Object.keys(SEOContentData[pillarId] || {}).forEach((slug) => {
      dynamicRoutes.push({
        url: `${baseUrl}/${pillarId}/${slug}`,
        lastModified: CONTENT_LAST_MODIFIED,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    });
  });

  return [...frequentRoutes, ...staticRoutes, ...pillarRoutes, ...dynamicRoutes];
}
