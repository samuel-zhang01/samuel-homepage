import { getProjectText } from "@/lib/projectNarrative";
import { ProjectOriginLinks } from "./ProjectOriginLinks";
import type { Project } from "@/data/projects";
import { type Locale } from "@/lib/i18n";
import { projectText, type ProjectCopyTable } from "@/lib/projectCopy";
import { getProjectStory } from "./projectStories";
import styles from "./ProjectCaseBrief.module.css";

const copy = {
  "Implementation notes": ["实现说明", "實作說明"],
  "Development": ["开发过程", "開發過程"],
  "Results and capabilities": ["成果与功能", "成果與功能"],
  "Who it helps": ["适用人群", "適用對象"],
  "The problem": ["要解决的问题", "要解決的問題"],
  "How it works": ["工作流程", "運作流程"],
  "The aim": ["项目目标", "專案目標"],
  "What I did": ["我做了什么", "我做了什麼"],
  "Open interactive demo": ["打开交互演示", "開啟互動示範"],
  "Try it.": ["动手探索。", "動手探索。"],
} satisfies ProjectCopyTable;

export function ProjectCaseBrief({ project, locale, onExplore }: {
  project: Project; locale: Locale; onExplore?: () => void;
}) {
  const story = getProjectStory(project);
  const t = (source: string) => projectText(locale, copy, source);
  return <div className={styles.brief}>
    <div className={styles.narrative}>
      {story && <><h2>{t("What I did")}</h2><p>{getProjectText(locale, story.contribution)}</p></>}
      {project.detail !== story?.contribution && <p>{getProjectText(locale, project.detail)}</p>}
      {project.demo && project.privacyNote && <p>{getProjectText(locale, project.privacyNote)}</p>}
    </div>
    {(story || project.phases.length > 0 || project.highlights.length > 0) && <details className={styles.contribution}>
      <summary>{t("Implementation notes")}</summary>
    {story && <div className={styles.context}>
      <section className={styles.problem}><h2>{t("The problem")}</h2><p>{getProjectText(locale, story.problem)}</p></section>
      <dl>
        <div><dt>{t("Who it helps")}</dt><dd>{getProjectText(locale, story.audience)}</dd></div>
        <div><dt>{t("The aim")}</dt><dd>{getProjectText(locale, story.objective)}</dd></div>
      </dl>
      <section className={styles.pipeline}><h2>{t("How it works")}</h2><p>{getProjectText(locale, story.pipeline)}</p></section>
    </div>}
    {project.phases.length > 0 && <section className={styles.development}><h2>{t("Development")}</h2>
      <ol>{project.phases.map(phase => <li key={phase.label}>{getProjectText(locale, phase.text)}</li>)}</ol>
    </section>}
    {project.highlights.length > 0 && <section className={styles.results}><h2>{t("Results and capabilities")}</h2><ul>{project.highlights.map(highlight => <li key={highlight}>{getProjectText(locale, highlight)}</li>)}</ul></section>}
    </details>}
    {story && project.demo && <div className={styles.walkthrough}>
      <p><strong>{t("Try it.")}</strong> {getProjectText(locale, story.walkthrough)}</p>
      {onExplore && <button type="button" className="s7-button is-primary" onClick={onExplore}>{t("Open interactive demo")} ↗</button>}
    </div>}
    <ProjectOriginLinks slug={project.slug} locale={locale} />
  </div>;
}
