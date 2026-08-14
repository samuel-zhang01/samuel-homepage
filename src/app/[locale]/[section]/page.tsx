import SystemSevenDesktop, { type AppId } from "@/components/SystemSevenDesktop";
import { localeOptions, normaliseLocale } from "@/lib/i18n";
import { notFound, redirect } from "next/navigation";

const sections: Record<string, AppId> = {
  about: "about",
  contact: "contact",
  coverd: "coverd",
  documents: "documents",
  education: "education",
  experience: "experience",
  games: "games",
  interests: "scrapbook",
  lab: "lab",
  projects: "projects",
  resume: "documents",
  skills: "skills",
};

export function generateStaticParams() {
  return localeOptions.flatMap((option) =>
    Object.keys(sections).map((section) => ({ locale: option.slug, section })),
  );
}

export default async function LocalisedSectionPage({
  params,
}: {
  params: Promise<{ locale: string; section: string }>;
}) {
  const { locale: localeSlug, section } = await params;
  const locale = normaliseLocale(localeSlug);
  if (locale && section === "resume") redirect(`/${localeSlug}/documents`);
  const initialApp = sections[section];
  if (!locale || !initialApp) notFound();
  return <SystemSevenDesktop initialApp={initialApp} initialLocale={locale} skipBoot />;
}
