import type { Project } from "@/data/projects";
import { getProjectIcon } from "@/lib/iconIdentity";
import { System7Icon } from "../System7Icon";
import styles from "./ProjectArtwork.module.css";

export function ProjectArtwork({ project, compact = false }: { project: Project; compact?: boolean }) {
  return <div className={styles.artwork} data-compact={compact || undefined} aria-hidden="true">
    <System7Icon kind={getProjectIcon(project.slug)} />
  </div>;
}
