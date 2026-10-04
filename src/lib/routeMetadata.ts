import type { Metadata } from "next";

/** Keep direct routes and their four language variants on the same URL map. */
export function routeAlternates(canonical: string): Metadata["alternates"] {
  const path = canonical.replace(/^\/(?:en-gb|en-us|zh-cn|zh-tw)(?=\/|\?|$)/, "");
  const suffix = path === "/" ? "" : path;
  return {
    canonical,
    languages: {
      "x-default": suffix || "/",
      "en-GB": `/en-gb${suffix}`,
      "en-US": `/en-us${suffix}`,
      "zh-Hans": `/zh-cn${suffix}`,
      "zh-Hant": `/zh-tw${suffix}`,
    },
  };
}

/** Direct section links need their own identity before JavaScript hydrates. */
export function sectionMetadata(path: string, content: { title: string; description: string }): Metadata {
  return {
    ...content,
    alternates: routeAlternates(path),
    openGraph: { ...content, type: "website", url: path },
    twitter: { ...content, card: "summary" },
  };
}
