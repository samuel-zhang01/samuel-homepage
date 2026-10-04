import type { Metadata } from "next";
import { normaliseLocale } from "@/lib/i18n";
import { routeAlternates } from "@/lib/routeMetadata";
import { metadata as notFoundMetadata } from "../not-found";

const descriptions = {
  "en-GB": "I'm Samuel Zhang, an applied AI engineer and founder of COVERD. Here are the products, research projects and small tools I've built, with working demos where I can show them.",
  "en-US": "I'm Samuel Zhang, an applied AI engineer and founder of COVERD. Here are the products, research projects, and small tools I've built, with working demos where I can show them.",
  "zh-CN": "我是 Samuel Zhang，应用人工智能工程师，也是 COVERD 的创始人。这里有我做过的产品、研究项目和小工具；能公开演示的，我也放上了可试用的版本。",
  "zh-TW": "我是 Samuel Zhang，應用人工智慧工程師，也是 COVERD 的創辦人。這裡有我做過的產品、研究專案和小工具；能公開展示的，也附上了可試用的版本。",
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeSlug } = await params;
  const locale = normaliseLocale(localeSlug);
  if (!locale) return notFoundMetadata;
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
    alternates: routeAlternates(`/${canonicalLocale}`),
    openGraph: { title, description: descriptions[locale], type: "website", url: `/${canonicalLocale}`, locale: locale.replace("-", "_") },
    twitter: { card: "summary", title, description: descriptions[locale] },
  };
}

export default function LocalisedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
