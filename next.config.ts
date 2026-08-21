import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === "development";
const isolatedDistDir = process.env.NEXT_DIST_DIR?.trim();

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  // Webpack's React Refresh runtime evaluates its development bundle. Keep
  // that allowance—and WebSocket HMR—strictly out of the production policy.
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""} https://static.cloudflareinsights.com`,
  "script-src-attr 'none'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self'${isDevelopment ? " ws: wss:" : ""} https://cloudflareinsights.com`,
  "frame-src 'self'",
  "media-src 'self'",
  "manifest-src 'self'",
  "worker-src 'self' blob:",
].join("; ");

const nextConfig: NextConfig = {
  ...(isolatedDistDir ? { distDir: isolatedDistDir } : {}),
  // Permit the canonical HTTPS hostname as well as trusted LAN development
  // origins. Production requests are additionally host-checked in middleware.
  allowedDevOrigins: ["127.0.0.1", "192.168.*.*", "10.*.*.*", "me.samuelzhang.co.uk"],
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  productionBrowserSourceMaps: false,
  images: {
    // Only three reviewed local assets use next/image. Constraining both the
    // source path and quality prevents the optimiser becoming an open cache or
    // CPU-amplification surface on the LAN-facing container.
    localPatterns: [
      { pathname: "/coverd-logo-black-on-transparent.png" },
      { pathname: "/headshot.jpg" },
      { pathname: "/projects/neural-cfd-surrogates/cylinder-wake.png" },
    ],
    remotePatterns: [],
    qualities: [75],
    minimumCacheTTL: 3_600,
    maximumDiskCacheSize: 96 * 1024 * 1024,
    maximumResponseBody: 2 * 1024 * 1024,
  },
  webpack(config) {
    // Small, reviewed portfolio fixtures remain local CSV sources of truth.
    // Webpack embeds their text in the relevant lazy demo chunk; no runtime
    // network request or public raw-data endpoint is introduced.
    config.module.rules.push({ test: /\.csv$/i, type: "asset/source" });
    return config;
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
          { key: "X-XSS-Protection", value: "0" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
          {
            key: "Permissions-Policy",
            value: "accelerometer=(), autoplay=(), browsing-topics=(), camera=(), display-capture=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()",
          },
        ],
      },
      {
        // Public documents are hash-reviewed at build time but retain readable
        // filenames, so cache them briefly rather than claiming immutability.
        source: "/:path*.pdf",
        headers: [
          { key: "Cache-Control", value: "public, max-age=3600, stale-while-revalidate=86400" },
        ],
      },
      {
        source: "/:path*.:extension(avif|gif|ico|jpeg|jpg|png|svg|webp)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
    ];
  },
};

export default nextConfig;
