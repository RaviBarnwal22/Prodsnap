import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/login/",
        "/auth/",
        "/api/",
        "/feedback/",
        "/*?q=", // Disallow internal search query crawls to avoid index bloat
      ],
    },
    sitemap: "https://prodsnap.in/sitemap.xml",
  };
}
