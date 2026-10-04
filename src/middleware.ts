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

// These are the finite page routes, including the CV redirect. The request
// guard verifies this inventory against the App Router's actual section map.
const SECTION_ROUTES = new Set([
  "settings", "about", "contact", "coverd", "desk", "documents", "education",
  "experience", "games", "interests", "lab", "orbitals", "sidequest", "resume", "skills", "projects",
]);
const ROOT_RESOURCE_ROUTES = new Set([
  "robots.txt", "sitemap.xml", "manifest.webmanifest",
  "GROWMAT Showcase External Highest Quality.pdf",
  "Samuel-Zhang-Applied-AI-CV.pdf", "Samuel-Zhang-Applied-AI-CV-en-US.pdf",
  "Samuel-Zhang-Applied-AI-CV-zh-CN.pdf", "Samuel-Zhang-Applied-AI-CV-zh-TW.pdf",
]);

function isMissingFinitePage(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  // Deeper paths already reach Next's unmatched-route recovery renderer.
  if (!segments.length || segments.length > 2) return false;
  try {
    for (let index = 0; index < segments.length; index++) segments[index] = decodeURIComponent(segments[index]);
  } catch { return false; }
  const [first, second] = segments;
  if (segments.length === 1) {
    return !Object.hasOwn(CONTENT_LANGUAGES, first) && !SECTION_ROUTES.has(first) && !ROOT_RESOURCE_ROUTES.has(first);
  }
  // Images/framework assets bypass middleware. The other shallow public files
  // are the four generated search indexes; the full asset crawl pins their bytes.
  if (first === "search" && /^project-text-(?:en-gb|en-us|zh-cn|zh-tw)\.json$/.test(second)) return false;
  return !Object.hasOwn(CONTENT_LANGUAGES, first) || !SECTION_ROUTES.has(second);
}

function requestHostname(request: NextRequest) {
  const host = request.headers.get("host")?.trim().toLowerCase() ?? "";
  // Validate the entire authority before extracting it. Splitting at ':' or
  // ']' would treat malformed values such as [::1]evil.invalid as loopback.
  const authority = /^(\[[^\]]+\]|[^:[\]\s]+)(?::([0-9]{1,5}))?$/.exec(host);
  if (!authority || (authority[2] && Number(authority[2]) > 65535)) return "";
  return authority[1].startsWith("[") ? authority[1].slice(1, -1) : authority[1];
}

function isPrivateLanIpv4(hostname: string) {
  if (!/^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname)) return false;
  const segments = hostname.split(".");
  const octets = segments.map(Number);
  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) return false;
  // URL parsers may interpret zero-prefixed IPv4 segments as octal. Require
  // canonical decimal input so 010.0.0.1 cannot redirect to public 8.0.0.1,
  // and inputs such as 10.0.0.08 cannot throw while building a locale URL.
  if (segments.some((segment, index) => segment !== String(octets[index]))) return false;
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
    // Match the edge policy so duplicate proxy/app headers cannot weaken the
    // browser's effective HSTS directive depending on header ordering.
    response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
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
    const rawLocaleSegment = request.nextUrl.pathname.split("/")[1];
    let localeSegment = rawLocaleSegment?.toLowerCase();
    try { localeSegment = decodeURIComponent(rawLocaleSegment ?? "").toLowerCase(); }
    catch { /* Malformed paths retain the normal missing-route response. */ }
    const canonicalLocale = localeSegment ? (Object.hasOwn(CANONICAL_LOCALE_ALIASES, localeSegment) ? CANONICAL_LOCALE_ALIASES[localeSegment] : undefined)
      ?? (Object.hasOwn(CONTENT_LANGUAGES, localeSegment) && rawLocaleSegment !== localeSegment ? localeSegment : undefined) : undefined;
    if (canonicalLocale) {
      const redirectUrl = request.nextUrl.clone();
      const pathSegments = redirectUrl.pathname.split("/");
      pathSegments[1] = canonicalLocale;
      redirectUrl.pathname = pathSegments.join("/");
      if (process.env.NODE_ENV === "production") {
        // Next's URL may describe the upstream container or a forwarded
        // hostname. Build public redirects from the authority we validated
        // above, never from that unrelated origin or x-forwarded-host.
        const protocol = requestHostname(request) === CANONICAL_PUBLIC_HOST ? "https:" : redirectUrl.protocol;
        const publicOrigin = new URL(`${protocol}//${request.headers.get("host")!.trim().toLowerCase()}`);
        redirectUrl.protocol = publicOrigin.protocol;
        redirectUrl.hostname = publicOrigin.hostname;
        redirectUrl.port = publicOrigin.port;
      }
      return applyCanonicalProductionHeaders(request, NextResponse.redirect(redirectUrl, 308));
    }
    const contentLanguage = localeSegment && Object.hasOwn(CONTENT_LANGUAGES, localeSegment) ? CONTENT_LANGUAGES[localeSegment] : undefined;
    const responseLanguage = contentLanguage ?? "en-GB";
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-samuel-locale", responseLanguage);
    // Throwing notFound() inside these dynamic pages yields an empty error
    // shell in this Next release. Their server-rendered recovery component
    // keeps the original URL; middleware supplies the actual HTTP status.
    const missingPage = isMissingFinitePage(request.nextUrl.pathname);
    const response = NextResponse.next({ status: missingPage ? 404 : 200, request: { headers: requestHeaders } });
    if (missingPage) response.headers.set("Cache-Control", "no-store");
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
