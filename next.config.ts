import type { NextConfig } from "next";

const supabaseHost = (() => {
  try { return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').hostname } catch { return '' }
})();

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,

  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000, // 1 year
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // Blog images uploaded from the admin editor (Supabase Storage).
      ...(supabaseHost
        ? [{ protocol: 'https' as const, hostname: supabaseHost, pathname: '/storage/v1/object/public/**' }]
        : []),
    ],
  },

  async redirects() {
    return [
      // AI News was retired on 2026-10-10 (stale since March, nothing linked
      // to it). Permanent redirect so any indexed URL or bookmark still lands
      // somewhere useful instead of a 404.
      { source: '/ai-news', destination: '/blog', permanent: true },
      { source: '/ai-news/:path*', destination: '/blog', permanent: true },
    ];
  },

  async headers() {
    return [
      {
        // Immutable cache for versioned static assets
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Security headers on EVERY response, API routes included.
        // Deliberately no full Content-Security-Policy yet: a script-src policy has to be
        // validated against the Cashfree SDK, Supabase and Calendly before it can ship, and
        // a wrong one breaks checkout. frame-ancestors is safe on its own — it only controls
        // who may frame us, and replaces X-Frame-Options.
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(self)' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
    ];
  },
};

export default nextConfig;
