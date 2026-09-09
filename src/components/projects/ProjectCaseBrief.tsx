import { getProjectText } from "@/lib/projectNarrative";
import { ProjectOriginLinks } from "./ProjectOriginLinks";
import type { Project } from "@/data/projects";
import { type Locale } from "@/lib/i18n";
import { projectText, type ProjectCopyTable } from "@/lib/projectCopy";
import { getProjectStory } from "./projectStories";
import styles from "./ProjectCaseBrief.module.css";

const copy = {
  "Development": ["开发过程", "開發過程"],
  "Results and capabilities": ["成果与功能", "成果與功能"],
  "Try it": ["动手探索", "動手探索"],
} satisfies ProjectCopyTable;

export function ProjectCaseBrief({ project, locale }: { project: Project; locale: Locale }) {
  const story = getProjectStory(project);
  const t = (source: string) => projectText(locale, copy, source);
  return <div className={styles.brief}>
    <div className={styles.narrative}>
      <p>{getProjectText(locale, project.detail)}</p>
    </div>
    <section className={styles.development}><h2>{t("Development")}</h2>
      <ol>{project.phases.map(phase => <li key={phase.label}>{getProjectText(locale, phase.text)}</li>)}</ol>
    </section>
    {project.highlights.length > 0 && <section className={styles.results}><h2>{t("Results and capabilities")}</h2><ul>{project.highlights.map(highlight => <li key={highlight}>{getProjectText(locale, highlight)}</li>)}</ul></section>}
    {story && project.demo && <p className={styles.walkthrough}><strong>{t("Try it")}.</strong> {getProjectText(locale, story.walkthrough)}</p>}
    <ProjectOriginLinks slug={project.slug} locale={locale} />
  </div>;
}
