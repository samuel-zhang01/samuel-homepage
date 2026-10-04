import { projectOrigins, type ProjectOrigin } from "./projectOrigins";
import { profileExperiences, profileEducation } from "./profile";

export type ProfileOriginRecord = {
  id: string; label: string; description: string; section: "experience" | "education";
  period?: string; projectSlugs?: readonly string[]; relatedProjectSlugs?: readonly string[];
};

/** Resolve explicit provenance once for the desktop, archive and graph. Profile
 * projectSlugs are direct provenance; relatedProjectSlugs need not repeat them.
 * Preserve curated historical context, and reject incompatible declarations. */
export function mergeProfileProjectOrigins(origins: readonly ProjectOrigin[], records: readonly ProfileOriginRecord[]): ProjectOrigin[] {
  const resolved = new Map<string, ProjectOrigin>();
  for (const origin of origins) {
    if (resolved.has(origin.id)) throw new Error(`Duplicate project origin ${origin.id}`);
    for (const slug of origin.relatedProjects ?? []) {
      if (!origin.projects.includes(slug)) throw new Error(`Related project ${slug} missing from origin ${origin.id}`);
    }
    resolved.set(origin.id, { ...origin, projects: [...origin.projects], ...(origin.relatedProjects ? { relatedProjects: [...origin.relatedProjects] } : {}) });
  }
  const recordIds = new Set<string>();
  for (const record of records) {
    if (recordIds.has(record.id)) throw new Error(`Duplicate profile origin ${record.id}`);
    recordIds.add(record.id);
    const existing = resolved.get(record.id);
    if (existing && existing.section !== record.section) throw new Error(`Conflicting project origin section ${record.id}`);
    const links = new Map((existing?.projects ?? []).map(slug => [slug, existing?.relatedProjects?.includes(slug) ?? false]));
    const add = (slug: string, related: boolean) => {
      if (links.has(slug) && links.get(slug) !== related) throw new Error(`Conflicting project provenance ${record.id}:${slug}`);
      links.set(slug, related);
    };
    for (const slug of record.projectSlugs ?? []) add(slug, false);
    for (const slug of record.relatedProjectSlugs ?? []) add(slug, true);
    const relatedProjects = [...links].filter(([, related]) => related).map(([slug]) => slug);
    resolved.set(record.id, {
      id: record.id, label: existing?.label ?? record.label,
      context: existing?.context ?? record.description, section: record.section,
      period: record.period ?? existing?.period, projects: [...links.keys()],
      ...(relatedProjects.length ? { relatedProjects } : {}),
    });
  }
  return [...resolved.values()];
}

const legacyById = new Map(projectOrigins.map(origin => [origin.id, origin]));
export const profileOriginRecords = [
  ...profileExperiences.map(record => ({
    id: record.id, label: legacyById.get(record.id)?.label ?? `${record.company} · ${record.role}`,
    description: record.copy, section: "experience" as const,
    period: record.period, sourceIds: record.sourceIds, conceptIds: record.conceptIds,
    projectSlugs: record.projectSlugs, relatedProjectSlugs: record.relatedProjectSlugs,
  })),
  ...profileEducation.map(record => ({
    id: record.id, label: legacyById.get(record.id)?.label ?? `${record.institution} · ${record.title}`,
    description: record.description, section: "education" as const,
    period: record.period, sourceIds: record.sourceIds, conceptIds: record.conceptIds,
    projectSlugs: record.projectSlugs, relatedProjectSlugs: record.relatedProjectSlugs,
  })),
];

export const profileProjectOrigins = mergeProfileProjectOrigins(projectOrigins, profileOriginRecords);

const originsByProject = new Map<string, ProjectOrigin[]>();
for (const origin of profileProjectOrigins) for (const slug of origin.projects) {
  const entries = originsByProject.get(slug) ?? [];
  entries.push(origin); originsByProject.set(slug, entries);
}

/** O(number of linked records); returned arrays cannot mutate the index. */
export function getProfileProjectOrigins(slug: string): ProjectOrigin[] {
  return [...(originsByProject.get(slug) ?? [])];
}
