import SystemSevenDesktop, { type AppId } from "@/components/SystemSevenDesktop";
import { projectText } from "@/lib/projectCopy";
import { desktopCopy } from "@/components/desktopCopy";
import { localeOptions, normaliseLocale } from "@/lib/i18n";
import { routeAlternates } from "@/lib/routeMetadata";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import NotFound, { metadata as notFoundMetadata } from "../../not-found";

const sections: Record<string, AppId> = {
  settings: "settings",
  about: "about",
  contact: "contact",
  coverd: "coverd",
  desk: "desk",
  documents: "documents",
  education: "education",
  experience: "experience",
  games: "games",
  interests: "scrapbook",
  lab: "lab",
  orbitals: "orbitals",
  sidequest: "sidequest",
  resume: "documents",
  skills: "skills",
};

const sectionMetadata: Record<string, { title: string; description: string }> = {
  settings: { title: "Settings", description: "Desktop appearance, language and comfort settings." },
  orbitals: {
    title: "Orbital Lab",
    description: "Explore atomic orbitals in a fast, browser-local ASCII laboratory.",
  },
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
    description: "My startup, product thesis and responsible-AI principles.",
  },
  desk: {
    title: "Desk Accessories",
    description: "Eight everyday tools and a fast atomic-orbital lab, all in your browser.",
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
    description: "Seven local games with profile-themed puzzles and calculations.",
  },
  interests: {
    title: "Interests & Notes",
    description: "Photography, hiking, music, teaching and life outside work.",
  },
  lab: {
    title: "Home Lab Network",
    description: "My self-hosted AI, storage and automation infrastructure.",
  },
  sidequest: {
    title: "RUN/HACK — Field Journal",
    description: "A rain-soaked running hackathon field journal: the runner-only build rule, 44 team kilometres, a 100+ person track community and second-place app SideQuest.",
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
  const content = Object.hasOwn(sectionMetadata, section) ? sectionMetadata[section] : undefined;
  if (!locale || !content) return notFoundMetadata;

  const canonicalLocale = localeOptions.find((option) => option.locale === locale)?.slug ?? "en-gb";
  const title = projectText(locale, desktopCopy, content.title);
  const description = projectText(locale, desktopCopy, content.description);
  return {
    title: { absolute: `${title} · Samuel Zhang` },
    description,
    alternates: routeAlternates(`/${canonicalLocale}/${section}`),
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
  const initialApp = Object.hasOwn(sections, section) ? sections[section] : undefined;
  if (!locale || !initialApp) return <NotFound />;
  return (
    <SystemSevenDesktop
      initialApp={initialApp}
      initialLocale={locale}
      skipBoot
    />
  );
}
