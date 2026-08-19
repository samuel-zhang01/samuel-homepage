import SystemSevenDesktop from "@/components/SystemSevenDesktop";
import { projects } from "@/data/projects";
import type { Metadata } from "next";

type ProjectSearchParams = Promise<{ project?: string | string[] }>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: ProjectSearchParams;
}): Promise<Metadata> {
  const { project: projectParam } = await searchParams;
  const slug = typeof projectParam === "string" ? projectParam : undefined;
  const project = projects.find((item) => item.slug === slug);
  const title = project ? `${project.title} — Project Archive` : "Project Archive";
  const description = project?.summary
    ?? "Explore Samuel Zhang's products, applied AI research, machine-learning experiments and systems through public demos, case studies and clearly marked private work.";
  const canonical = project ? `/projects?project=${encodeURIComponent(project.slug)}` : "/projects";
  const projectQuery = project ? `?project=${encodeURIComponent(project.slug)}` : "";

  return {
    title,
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

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: ProjectSearchParams;
}) {
  const { project } = await searchParams;
  const initialProjectSlug = typeof project === "string" ? project : undefined;
  return <SystemSevenDesktop initialApp="projects" initialProjectSlug={initialProjectSlug} skipBoot />;
}
