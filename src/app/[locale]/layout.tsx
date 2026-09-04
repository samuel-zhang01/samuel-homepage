import type { Metadata } from "next";
import { normaliseLocale } from "@/lib/i18n";

const descriptions = {
  "en-GB": "Samuel Zhang is an applied AI engineer, product builder and COVERD founder who builds useful, human-centred systems for ambiguous problems.",
  "en-US": "Samuel Zhang is an applied AI engineer, product builder, and COVERD founder who builds useful, human-centered systems for ambiguous problems.",
  "zh-CN": "Samuel Zhang 是应用人工智能工程师、产品开发者与 COVERD 创始人，专注为需求尚不明确的问题打造实用、以人为本的系统。",
  "zh-TW": "Samuel Zhang 是應用人工智慧工程師、產品開發者與 COVERD 創辦人，專注為需求尚未明確的問題打造實用、以人為本的系統。",
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeSlug } = await params;
  const locale = normaliseLocale(localeSlug) ?? "en-GB";
  const canonicalLocale = locale === "en-GB"
    ? "en-gb"
    : locale === "en-US"
      ? "en-us"
      : locale === "zh-CN"
        ? "zh-cn"
        : "zh-tw";
  const title = locale === "zh-CN"
    ? "Samuel System 7 — Samuel Zhang 的个人网站"
    : locale === "zh-TW"
      ? "Samuel System 7 — Samuel Zhang 的個人網站"
      : "Samuel System 7 — Samuel Zhang";
  return {
    title: { absolute: title },
    description: descriptions[locale],
    alternates: {
      canonical: `/${canonicalLocale}`,
      languages: {
        "x-default": "/",
        "en-GB": "/en-gb",
        "en-US": "/en-us",
        "zh-Hans": "/zh-cn",
        "zh-Hant": "/zh-tw",
      },
    },
    openGraph: { title, description: descriptions[locale], locale: locale.replace("-", "_") },
    twitter: { card: "summary", title, description: descriptions[locale] },
  };
}

export default function LocalisedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
