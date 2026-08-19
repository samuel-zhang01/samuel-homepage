import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === "development";
const isolatedDistDir = process.env.NEXT_DIST_DIR?.trim();

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "object-src 'none'",
  // Webpack's React Refresh runtime evaluates its development bundle. Keep
  // that allowance—and WebSocket HMR—strictly out of the production policy.
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""} https://static.cloudflareinsights.com`,
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
  allowedDevOrigins: ["127.0.0.1", "192.168.*.*", "10.*.*.*"],
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  productionBrowserSourceMaps: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
          { key: "X-XSS-Protection", value: "0" },
          // Browsers ignore COOP on an HTTP LAN origin and emit a misleading
          // console warning. Production is expected behind TLS and keeps it.
          ...(!isDevelopment
            ? [{ key: "Cross-Origin-Opener-Policy", value: "same-origin" }]
            : []),
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
