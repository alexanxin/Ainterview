import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [{ hostname: "localhost" }, { hostname: "ainterview.app" }],
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 86400, // 24 hours
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  experimental: {
    optimizeCss: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
      // Performance optimization headers
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Image caching
      {
        source: "/images/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, must-revalidate",
          },
        ],
      },
      // API rate limiting for Gemini API
      {
        source: "/api/gemini",
        headers: [
          {
            key: "Cache-Control",
            value: "private, max-age=300",
          },
        ],
      },
      // Resource hints for external dependencies
      {
        source: "/(.*)",
        headers: [
          {
            key: "Link",
            value:
              "</api/gemini>; rel=preconnect, <https://fonts.googleapis.com>; rel=preconnect; crossorigin, <https://fonts.gstatic.com>; rel=dns-prefetch",
          },
        ],
      },
    ];
  },
  // Performance optimizations
  poweredByHeader: false,
  compress: true,
};
