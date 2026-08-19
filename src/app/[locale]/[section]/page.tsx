import SystemSevenDesktop, { type AppId } from "@/components/SystemSevenDesktop";
import { localeOptions, normaliseLocale, translateText } from "@/lib/i18n";
import type { Metadata } from "next";
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
  resume: "documents",
  skills: "skills",
};

const sectionMetadata: Record<string, { title: string; description: string }> = {
  about: {
    title: "About Samuel Zhang",
    description: "Start here: biography, current work and highlights.",
  },
  contact: {
    title: "Contact Samuel",
    description: "Email, LinkedIn and GitHub without leaving the desktop.",
  },
  coverd: {
    title: "COVERD — Founder’s Desk",
    description: "Samuel’s startup, product thesis and responsible-AI principles.",
  },
  documents: {
    title: "Documents",
    description: "Current Applied AI CV and reviewed learning material in one continuous reader.",
  },
  education: {
    title: "Education & Awards",
    description: "Imperial, King’s College London and academic awards.",
  },
  experience: {
    title: "Career",
    description: "Professional history from emergency operations to applied AI.",
  },
  games: {
    title: "Desk Arcade",
    description: "Four small games with profile-themed easter eggs.",
  },
  interests: {
    title: "Interests & Notes",
    description: "Photography, hiking, music, teaching and life outside work.",
  },
  lab: {
    title: "Home Lab Network",
    description: "Samuel’s self-hosted AI, storage and automation infrastructure.",
  },
  skills: {
    title: "Skills & Capabilities",
    description: "Technical, product, research and leadership capabilities.",
  },
};

export function generateStaticParams() {
  return localeOptions.flatMap((option) =>
    Object.keys(sections).map((section) => ({ locale: option.slug, section })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; section: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, section } = await params;
  const locale = normaliseLocale(localeParam);
  const content = sectionMetadata[section];
  if (!locale || !content) return {};

  const canonicalLocale = localeOptions.find((option) => option.locale === locale)?.slug ?? "en-gb";
  const title = translateText(locale, content.title);
  const description = translateText(locale, content.description);
  return {
    title: { absolute: `${title} · Samuel Zhang` },
    description,
    alternates: {
      canonical: `/${canonicalLocale}/${section}`,
      languages: {
        "x-default": `/${section}`,
        "en-GB": `/en-gb/${section}`,
        "en-US": `/en-us/${section}`,
        "zh-Hans": `/zh-cn/${section}`,
        "zh-Hant": `/zh-tw/${section}`,
      },
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: `/${canonicalLocale}/${section}`,
      locale: locale.replace("-", "_"),
    },
    twitter: { card: "summary", title, description },
  };
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
  return (
    <SystemSevenDesktop
      initialApp={initialApp}
      initialLocale={locale}
      skipBoot
    />
  );
}
