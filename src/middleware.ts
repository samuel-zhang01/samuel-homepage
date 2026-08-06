import { NextRequest, NextResponse } from "next/server";

const ALLOWED_METHODS = "GET, HEAD, OPTIONS";
const CONTENT_LANGUAGES: Record<string, string> = {
  "en-gb": "en-GB",
  "en-us": "en-US",
  "zh-cn": "zh-CN",
  "zh-tw": "zh-TW",
};

export function middleware(request: NextRequest) {
  if (request.method === "GET" || request.method === "HEAD") {
    const response = NextResponse.next();
    const localeSegment = request.nextUrl.pathname.split("/")[1]?.toLowerCase();
    if (localeSegment && CONTENT_LANGUAGES[localeSegment]) {
      response.headers.set("Content-Language", CONTENT_LANGUAGES[localeSegment]);
    }
    return response;
  }

  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: { Allow: ALLOWED_METHODS, "Cache-Control": "no-store" },
    });
  }

  return new NextResponse("Method Not Allowed", {
    status: 405,
    headers: {
      Allow: ALLOWED_METHODS,
      "Cache-Control": "no-store",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
