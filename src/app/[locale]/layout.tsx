import type { Metadata } from "next";
import { normaliseLocale } from "@/lib/i18n";

const descriptions = {
  "en-GB": "Samuel Zhang is an applied AI engineer, product builder and COVERD founder turning ambiguous problems into useful, human-centred systems.",
  "en-US": "Samuel Zhang is an applied AI engineer, product builder, and COVERD founder turning ambiguous problems into useful, human-centered systems.",
  "zh-CN": "Samuel Zhang 是应用人工智能工程师、产品构建者与 COVERD 创始人，致力于把模糊的问题转化为真正有用、以人为本的系统。",
  "zh-TW": "Samuel Zhang 是應用人工智慧工程師、產品構建者與 COVERD 創辦人，致力於把模糊的問題轉化為真正有用、以人為本的系統。",
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeSlug } = await params;
  const locale = normaliseLocale(localeSlug) ?? "en-GB";
  const title = locale === "zh-CN"
    ? "Samuel System 7 — Samuel Zhang 的个人网站"
    : locale === "zh-TW"
      ? "Samuel System 7 — Samuel Zhang 的個人網站"
      : "Samuel System 7 — Samuel Zhang";
  return {
    title: { absolute: title },
    description: descriptions[locale],
    alternates: {
      languages: {
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
