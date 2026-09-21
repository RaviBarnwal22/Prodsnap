import { MetadataRoute } from "next";

// Note on strategy: private-but-linkable routes (/login, /auth, /payment) are
// NOT disallowed here. A disallowed URL can still be indexed from an inbound
// link — Google just can't see why it shouldn't be. Those routes send
// `robots: noindex` from their layout instead, which requires crawl access.
// Only genuinely non-public surfaces are blocked below.
//
// Paths are prefix-matched, so "/admin" covers both /admin and /admin/*.
// The previous "/admin/" form did not match the bare /admin URL.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/api",
        "/feedback",
        "/*?q=", // internal search results — avoids index bloat from thin pages
      ],
    },
    sitemap: "https://prodsnap.in/sitemap.xml",
    host: "https://prodsnap.in",
  };
}
