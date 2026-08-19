import SystemSevenDesktop from "@/components/SystemSevenDesktop";
import { localeOptions, normaliseLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return localeOptions.map((option) => ({ locale: option.slug }));
}

export default async function LocalisedHomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeSlug } = await params;
  const locale = normaliseLocale(localeSlug);
  if (!locale) notFound();
  return <SystemSevenDesktop initialApp="about" initialLocale={locale} />;
}
