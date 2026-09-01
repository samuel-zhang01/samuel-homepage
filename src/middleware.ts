import { NextRequest, NextResponse } from "next/server";

const ALLOWED_METHODS = "GET, HEAD, OPTIONS";
const CANONICAL_PUBLIC_HOST = "me.samuelzhang.co.uk";
const CONTENT_LANGUAGES: Record<string, string> = {
  "en-gb": "en-GB",
  "en-us": "en-US",
  "zh-cn": "zh-CN",
  "zh-tw": "zh-TW",
};
const CANONICAL_LOCALE_ALIASES: Record<string, string> = {
  en_uk: "en-gb",
  uk: "en-gb",
  en_us: "en-us",
  us: "en-us",
  "zh-hans": "zh-cn",
  zh_cn: "zh-cn",
  "zh-hant": "zh-tw",
  zh_tw: "zh-tw",
};

function requestHostname(request: NextRequest) {
  const host = request.headers.get("host")?.trim().toLowerCase() ?? "";
  if (host.startsWith("[")) return host.slice(1, host.indexOf("]"));
  return host.split(":")[0];
}

function isPrivateLanIpv4(hostname: string) {
  if (!/^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname)) return false;
  const octets = hostname.split(".").map(Number);
  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) return false;
  return octets[0] === 10
    || (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31)
    || (octets[0] === 192 && octets[1] === 168);
}

function isTrustedProductionHost(request: NextRequest) {
  const hostname = requestHostname(request);
  return hostname === CANONICAL_PUBLIC_HOST
    || hostname === "localhost"
    || hostname === "127.0.0.1"
    || hostname === "::1"
    || isPrivateLanIpv4(hostname);
}

function applyCanonicalProductionHeaders(request: NextRequest, response: NextResponse) {
  // COOP is meaningful only on a trustworthy origin; sending it on a direct
  // HTTP LAN response makes browsers ignore it and emit a misleading warning.
  // Keep both transport-scoped headers on the canonical TLS host while LAN
  // troubleshooting retains the common security policy from next.config.ts.
  if (process.env.NODE_ENV === "production" && requestHostname(request) === CANONICAL_PUBLIC_HOST) {
    response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
    response.headers.set("Strict-Transport-Security", "max-age=31536000");
  }
  return response;
}

export function middleware(request: NextRequest) {
  // The container is intentionally reachable from the private LAN so a TLS
  // reverse proxy can forward the canonical hostname to it. Refuse arbitrary
  // Host headers in production while retaining local health checks and direct
  // LAN troubleshooting.
  if (process.env.NODE_ENV === "production" && !isTrustedProductionHost(request)) {
    return new NextResponse("Misdirected Request", {
      status: 421,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }

  if (request.method === "GET" || request.method === "HEAD") {
    const localeSegment = request.nextUrl.pathname.split("/")[1]?.toLowerCase();
    const canonicalLocale = localeSegment ? CANONICAL_LOCALE_ALIASES[localeSegment] : undefined;
    if (canonicalLocale) {
      const redirectUrl = request.nextUrl.clone();
      const pathSegments = redirectUrl.pathname.split("/");
      pathSegments[1] = canonicalLocale;
      redirectUrl.pathname = pathSegments.join("/");
      return applyCanonicalProductionHeaders(request, NextResponse.redirect(redirectUrl, 308));
    }
    const contentLanguage = localeSegment ? CONTENT_LANGUAGES[localeSegment] : undefined;
    const responseLanguage = contentLanguage ?? "en-GB";
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-samuel-locale", responseLanguage);
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.headers.set("Content-Language", responseLanguage);
    return applyCanonicalProductionHeaders(request, response);
  }

  if (request.method === "OPTIONS") {
    return applyCanonicalProductionHeaders(request, new NextResponse(null, {
      status: 204,
      headers: { Allow: ALLOWED_METHODS, "Cache-Control": "no-store" },
    }));
  }

  return applyCanonicalProductionHeaders(request, new NextResponse("Method Not Allowed", {
    status: 405,
    headers: {
      Allow: ALLOWED_METHODS,
      "Cache-Control": "no-store",
      "Content-Type": "text/plain; charset=utf-8",
    },
  }));
}

export const config = {
  // Next's image optimiser resolves local sources (for example
  // /headshot.jpg) through an internal request that has no Host header.
  // Keep static image files outside the Host-header guard so that request can
  // succeed; Nginx still validates public hosts before traffic reaches Next.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:avif|gif|ico|jpe?g|png|svg|webp)$).*)",
  ],
};
