import { MetadataRoute } from "next";
import { SEOContentData } from "@/lib/seo-content";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://prodsnap.in";

  // 1. Core static routes
  const staticRoutes = [
    "",
    "/about",
    "/community",
    "/contact",
    "/jobs",
    "/mentorship",
    "/mentors",
    "/practice",
    "/prodsense",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  // 2. Category pillar pages
  const pillarRoutes = [
    "/product-management",
    "/frameworks",
    "/product-analytics",
    "/product-management-interview",
    "/templates",
    "/glossary",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // 3. Dynamic slug pages
  const dynamicRoutes: MetadataRoute.Sitemap = [];
  Object.keys(SEOContentData).forEach((pillarId) => {
    const pages = Object.keys(SEOContentData[pillarId] || {});
    pages.forEach((slug) => {
      dynamicRoutes.push({
        url: `${baseUrl}/${pillarId}/${slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      });
    });
  });

  return [...staticRoutes, ...pillarRoutes, ...dynamicRoutes];
}
