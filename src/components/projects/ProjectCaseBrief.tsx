import { getProjectText } from "@/lib/projectNarrative";
import { ProjectOriginLinks } from "./ProjectOriginLinks";
import { hasEmbeddedProjectDemo, type Project } from "@/data/projects";
import { type Locale } from "@/lib/i18n";
import { projectText, type ProjectCopyTable } from "@/lib/projectCopy";
import { getProjectStory } from "./projectStories";
import styles from "./ProjectCaseBrief.module.css";

const copy = {
  "What I built": ["我做了什么", "我做了什麼"],
  "Why I built it": ["我为什么做这个项目", "我為什麼做這個專案"],
  "How it works": ["工作流程", "運作流程"],
  "What it can do": ["它能做什么", "它能做什麼"],
  "About this demo": ["关于这个演示", "關於這個示範"],
  "Open interactive demo": ["打开交互演示", "開啟互動示範"],
  "Try it": ["动手试试", "動手試試"],
  "Core features": ["核心功能", "核心功能"],
  "Try the playground": ["打开体验区", "開啟體驗區"],
} satisfies ProjectCopyTable;

export function ProjectCaseBrief({ project, locale, onExplore }: {
  project: Project; locale: Locale; onExplore?: () => void;
}) {
  const story = getProjectStory(project);
  const t = (source: string) => projectText(locale, copy, source);
  if (["ultra-convert", "videomate", "coverd-yasa"].includes(project.slug)) return <div className={`${styles.brief} ${styles.productBrief}`}>
    <section className={styles.productFeatures}>
      <h2>{t("Core features")}</h2>
      <ul>{project.highlights.map(highlight => <li key={highlight}>{getProjectText(locale, highlight)}</li>)}</ul>
    </section>
    {story && hasEmbeddedProjectDemo(project) && <section className={styles.productTry}>
      {onExplore && <button type="button" className="s7-button is-primary" onClick={onExplore}>{t("Try the playground")} ↗</button>}
      <p>{getProjectText(locale, story.walkthrough)}</p>
    </section>}
    {story && <details className={styles.method}>
      <summary><h2>{t("How it works")}</h2></summary>
      <p>{getProjectText(locale, story.pipeline)}</p>
      <p>{getProjectText(locale, project.detail)}</p>
      <h2 className={styles.productWhy}>{t("Why I built it")}</h2>
      <p>{getProjectText(locale, story.problem)}</p>
    </details>}
    {project.privacyNote && !project.websiteUrl && <p className={styles.productNote}>{getProjectText(locale, project.privacyNote)}</p>}
  </div>;
  return <div className={styles.brief}>
    <section className={styles.narrative} aria-label={t("What I built")}>
      <h2>{t("What I built")}</h2>
      {story && <p>{getProjectText(locale, story.contribution)}</p>}
      {!story && <p>{getProjectText(locale, project.detail)}</p>}
    </section>
    {story && <section className={styles.purpose}>
      <h2>{t("Why I built it")}</h2>
      <p>{getProjectText(locale, story.problem)}</p>
    </section>}
    {story && hasEmbeddedProjectDemo(project) && <section className={styles.walkthrough}>
      <h2>{t("Try it")}</h2>
      <p>{getProjectText(locale, story.walkthrough)}</p>
      {onExplore && <button type="button" className="s7-button is-primary" onClick={onExplore}>{t("Open interactive demo")} ↗</button>}
    </section>}
    {story && <details className={styles.method}>
      <summary><h2>{t("How it works")}</h2></summary>
      <div>
        <p>{getProjectText(locale, story.pipeline)}</p>
        {project.detail !== story.contribution && <p>{getProjectText(locale, project.detail)}</p>}
      </div>
    </details>}
    {project.highlights.length > 0 && <section className={styles.results}>
      <h2>{t("What it can do")}</h2>
      <ul>{project.highlights.map(highlight => <li key={highlight}>{getProjectText(locale, highlight)}</li>)}</ul>
    </section>}
    {hasEmbeddedProjectDemo(project) && project.privacyNote && <section className={styles.demoNote}>
      <h2>{t("About this demo")}</h2><p>{getProjectText(locale, project.privacyNote)}</p>
    </section>}
    <ProjectOriginLinks slug={project.slug} locale={locale} />
  </div>;
}
