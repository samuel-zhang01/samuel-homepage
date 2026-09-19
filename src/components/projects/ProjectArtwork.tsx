import Image from "next/image";
import type { Project } from "@/data/projects";
import { System7Icon, type System7IconKind } from "../System7Icon";
import styles from "./ProjectArtwork.module.css";

const covers: Record<string, string> = {
  "microrobot-vision": "/project-art/microrobot.webp",
  "neural-cfd-surrogates": "/project-art/neural-cfd.webp",
};

function projectIcon(project: Project): System7IconKind {
  const { slug, area } = project;
  if (slug === "orbital-lab") return "orbital";
  if (slug === "microrobot-vision") return "microscope";
  if (slug === "neural-cfd-surrogates") return "flow";
  if (slug.includes("note")) return "note";
  if (slug.includes("sketch")) return "sketch";
  if (slug.includes("quick-list")) return "tasks";
  if (slug.includes("calendar") || slug.includes("yasa")) return "calendar";
  if (slug.includes("clock")) return "clock";
  if (slug.includes("calculator")) return "calculator";
  if (slug.includes("colour")) return "palette";
  if (slug.includes("converter")) return "converter";
  if (slug.includes("mri")) return "mri";
  if (slug.includes("finance") || slug.includes("market") || slug.includes("venture")) return "finance";
  if (/molecular|spectroscopy|coding-series|thermodynamics|solubility/.test(slug)) return "molecule";
  if (/insurance|safe|safety|cyber/.test(slug)) return "shield";
  if (/rl|decisions|regularisation|causal|sensor/.test(slug)) return "chart";
  if (slug === "home-automation-stack") return "network";
  if (slug === "cv-keyword-automator") return "document";
  if (area === "Systems") return "computer";
  if (area === "Education") return "book";
  if (area === "Research") return "microscope";
  return "folder";
}

export function ProjectArtwork({ project, compact = false }: { project: Project; compact?: boolean }) {
  const cover = !compact && covers[project.slug];
  return <div className={styles.artwork} data-compact={compact || undefined} data-cover={!!cover || undefined} aria-hidden="true">
    {project.slug === "coverd-ai" ? <Image src="/coverd-logo-black-on-transparent.png" alt="" width={64} height={64} unoptimized /> : cover ? <Image src={cover} alt="" width={320} height={320} sizes="(max-width: 620px) 80px, 160px" />
      : <System7Icon kind={projectIcon(project)} />}
  </div>;
}
