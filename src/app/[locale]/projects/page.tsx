import SystemSevenDesktop from "@/components/SystemSevenDesktop";
import { projects } from "@/data/projects";
import { localeOptions, normaliseLocale } from "@/lib/i18n";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type RouteParams = Promise<{ locale: string }>;
type ProjectSearchParams = Promise<{ project?: string | string[] }>;

function canonicalLocaleSlug(locale: string) {
  const resolved = normaliseLocale(locale);
  return localeOptions.find((option) => option.locale === resolved)?.slug;
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: RouteParams;
  searchParams: ProjectSearchParams;
}): Promise<Metadata> {
  const [{ locale: localeParam }, { project: projectParam }] = await Promise.all([
    params,
    searchParams,
  ]);
  const localeSlug = canonicalLocaleSlug(localeParam);
  if (!localeSlug) return {};

  const slug = typeof projectParam === "string" ? projectParam : undefined;
  const project = projects.find((item) => item.slug === slug);
  const title = project ? `${project.title} — Project Archive` : "Project Archive";
  const description = project?.summary
    ?? "Explore Samuel Zhang's products, applied AI research, machine-learning experiments and systems through public demos, case studies and clearly marked private work.";
  const projectQuery = project ? `?project=${encodeURIComponent(project.slug)}` : "";
  const canonical = `/${localeSlug}/projects${projectQuery}`;

  return {
    title: { absolute: `${title} · Samuel Zhang` },
    description,
    alternates: {
      canonical,
      languages: {
        "x-default": `/projects${projectQuery}`,
        "en-GB": `/en-gb/projects${projectQuery}`,
        "en-US": `/en-us/projects${projectQuery}`,
        "zh-Hans": `/zh-cn/projects${projectQuery}`,
        "zh-Hant": `/zh-tw/projects${projectQuery}`,
      },
    },
    openGraph: { title, description, type: "website", url: canonical },
    twitter: { card: "summary", title, description },
  };
}

export default async function LocalisedProjectsPage({
  params,
  searchParams,
}: {
  params: RouteParams;
  searchParams: ProjectSearchParams;
}) {
  const [{ locale: localeParam }, { project }] = await Promise.all([params, searchParams]);
  const locale = normaliseLocale(localeParam);
  if (!locale) notFound();

  return (
    <SystemSevenDesktop
      initialApp="projects"
      initialLocale={locale}
      initialProjectSlug={typeof project === "string" ? project : undefined}
      skipBoot
    />
  );
}
