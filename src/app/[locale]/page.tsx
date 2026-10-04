import SystemSevenDesktop from "@/components/SystemSevenDesktop";
import { localeOptions, normaliseLocale } from "@/lib/i18n";
import NotFound from "../not-found";

export function generateStaticParams() {
  return localeOptions.map((option) => ({ locale: option.slug }));
}

export default async function LocalisedHomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeSlug } = await params;
  const locale = normaliseLocale(localeSlug);
  if (!locale) return <NotFound />;
  return <SystemSevenDesktop initialApp="about" initialLocale={locale} />;
}
