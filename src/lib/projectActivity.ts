import { projects } from "../data/projects";

export type ProjectActivityRequest = {
  slug: string;
  kind: "demo" | "pdf";
  artifactHref?: string;
};

/** Resolve shared addresses only to activities declared in the public catalogue. */
export function resolveProjectActivity(
  slug: string | undefined,
  view: string | null | undefined,
  artifact: string | null | undefined,
): ProjectActivityRequest | null {
  const project = projects.find((item) => item.slug === slug);
  if (!project) return null;
  if (view === "demo" && project.demo) return { slug: project.slug, kind: "demo" };
  if (view === "pdf" && artifact && project.artifacts?.some((item) => item.kind === "PDF" && item.href === artifact)) {
    return { slug: project.slug, kind: "pdf", artifactHref: artifact };
  }
  return null;
}

/** Keep the original artifact href intact through a query-string round trip. */
export function projectActivitySearch(request: ProjectActivityRequest): string {
  const activity = resolveProjectActivity(request.slug, request.kind, request.artifactHref);
  if (!activity) throw new Error("Unknown project activity");
  const params = new URLSearchParams({ project: activity.slug, view: activity.kind });
  if (activity.artifactHref) params.set("artifact", activity.artifactHref);
  return `?${params.toString()}`;
}
