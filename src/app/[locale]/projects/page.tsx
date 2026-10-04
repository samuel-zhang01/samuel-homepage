import SystemSevenDesktop from "@/components/SystemSevenDesktop";
import { getProjectArchiveCopy } from "@/components/projects/projectArchiveI18n";
import { projects } from "@/data/projects";
import { localeOptions, normaliseLocale } from "@/lib/i18n";
import { getProjectText } from "@/lib/projectNarrative";
import { routeAlternates } from "@/lib/routeMetadata";
import type { Metadata } from "next";
import NotFound, { metadata as notFoundMetadata } from "../../not-found";

type RouteParams = Promise<{ locale: string }>;
type ProjectSearchParams = Promise<{ project?: string | string[]; view?: string | string[]; artifact?: string | string[] }>;

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
  if (!localeSlug) return notFoundMetadata;
  const locale = normaliseLocale(localeParam);
  if (!locale) return notFoundMetadata;
  const copy = getProjectArchiveCopy(locale);

  const slug = typeof projectParam === "string" ? projectParam : undefined;
  const project = projects.find((item) => item.slug === slug);
  const title = project ? `${getProjectText(locale, project.title)} — ${copy.header.title}` : copy.header.title;
  const description = project
    ? getProjectText(locale, project.summary)
    : copy.header.description;
  const projectQuery = project ? `?project=${encodeURIComponent(project.slug)}` : "";
  const canonical = `/${localeSlug}/projects${projectQuery}`;

  return {
    title: { absolute: `${title} · Samuel Zhang` },
    description,
    alternates: routeAlternates(canonical),
    openGraph: { title, description, type: "website", url: canonical, locale: locale.replace("-", "_") },
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
  const [{ locale: localeParam }, { project, view, artifact }] = await Promise.all([params, searchParams]);
  const locale = normaliseLocale(localeParam);
  if (!locale) return <NotFound />;

  return (
    <SystemSevenDesktop
      initialApp="projects"
      initialLocale={locale}
      initialProjectSlug={typeof project === "string" ? project : undefined}
      initialProjectDemo={view === "demo"}
      initialProjectArtifact={view === "pdf" && typeof artifact === "string" ? artifact : undefined}
      skipBoot
    />
  );
}
