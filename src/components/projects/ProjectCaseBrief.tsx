import Link from "next/link";
import { projects, type Project } from "@/data/projects";
import { localeSlug, translateText, type Locale } from "@/lib/i18n";
import { getProjectArchiveCopy } from "./projectArchiveI18n";
import { getProjectSuite } from "./projectSuites";
import { getProjectStory } from "./projectStories";
import styles from "./ProjectCaseBrief.module.css";

function evidenceLabel(project: Project) {
  if (project.access === "proprietary") return "PUBLIC BOUNDARY / SYNTHETIC OR HIGH-LEVEL EVIDENCE";
  if (project.access === "case-study") return "SOURCE-RECORDED METHOD / SAFE RECONSTRUCTION";
  return "SOURCE-RECORDED METHOD / BROWSER RECONSTRUCTION";
}

function formatChapter(template: string, chapter: number, total: number) {
  return template.replace("{chapter}", String(chapter)).replace("{total}", String(total));
}

export function ProjectCaseBrief({
  project,
  locale,
  onSelectProject,
  onOpenProjectDemo,
}: {
  project: Project;
  locale: Locale;
  onSelectProject: (slug: string) => void;
  onOpenProjectDemo: (slug: string) => void;
}) {
  const copy = getProjectArchiveCopy(locale).detail.caseBrief;
  const suite = getProjectSuite(project);
  const story = getProjectStory(project);
  const related = suite
    ? suite.slugs
      .filter((slug) => slug !== project.slug)
      .map((slug) => projects.find((candidate) => candidate.slug === slug))
      .filter((candidate): candidate is Project => Boolean(candidate))
    : [];
  return (
    <section className={styles.brief} aria-labelledby={`case-brief-${project.slug}`}>
      {suite ? (
        <nav className={styles.workspace} aria-label={`${copy.workspace}: ${translateText(locale, suite.title)}`}>
          <div>
            <span>{copy.workspace}</span>
            <strong lang={locale}>{translateText(locale, suite.title)}</strong>
            <small>{formatChapter(copy.chapter, suite.slugs.indexOf(project.slug) + 1, suite.slugs.length)}</small>
          </div>
          <div className={styles.chapterLinks}>
            {suite.slugs.map((slug, index) => {
              const chapter = projects.find((candidate) => candidate.slug === slug);
              if (!chapter) return null;
              const active = chapter.slug === project.slug;
              return (
                <button
                  key={chapter.slug}
                  type="button"
                  aria-current={active ? "page" : undefined}
                  aria-label={`${copy.openChapter} ${index + 1}: ${chapter.shortTitle ?? chapter.title}`}
                  disabled={active}
                  onClick={() => chapter.demo ? onOpenProjectDemo(chapter.slug) : onSelectProject(chapter.slug)}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <b lang="en-GB">{chapter.shortTitle ?? chapter.title}</b>
                </button>
              );
            })}
          </div>
        </nav>
      ) : null}
      <header className={styles.header}>
        <span>{copy.eyebrow}</span>
        <h4 id={`case-brief-${project.slug}`}>{copy.title}</h4>
        <p lang={locale}>{translateText(locale, project.summary)}</p>
        {story ? <div className={styles.audience}><span>{copy.audience}</span><p lang="en-GB">{story.audience}</p></div> : null}
        <Link className={styles.contact} href={`/${localeSlug(locale)}/contact`}>{copy.discuss}</Link>
      </header>

      <div className={`${styles.grid} ${story ? styles.storyGrid : ""}`}>
        {story ? (
          <>
            <section><span>{copy.problem}</span><p lang="en-GB">{story.problem}</p></section>
            <section><span>{copy.objective}</span><p lang="en-GB">{story.objective}</p></section>
            <section><span>{copy.contribution}</span><p lang="en-GB">{story.contribution}</p></section>
            <section className={styles.pipeline}><span>{copy.pipeline}</span><code lang="en-GB">{story.pipeline}</code></section>
          </>
        ) : (
          <section>
            <span>{copy.purpose}</span>
            <p>{project.detail}</p>
          </section>
        )}
        <section>
          <span>{copy.progression}</span>
          <ol>
            {project.phases.map((phase) => <li key={phase.label}><strong>{getProjectArchiveCopy(locale).phases[phase.label]}.</strong> {phase.text}</li>)}
          </ol>
        </section>
      </div>

      <div className={styles.evidence}>
        <div>
          <span>{copy.evidence} / {evidenceLabel(project)}</span>
          <ul>
            {project.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
          </ul>
        </div>
        <aside>
          <span>{copy.walkthrough}</span>
          <p lang={story ? "en-GB" : undefined}>{story?.walkthrough ?? copy.walkthroughCopy}</p>
        </aside>
      </div>

      {project.privacyNote ? (
        <p className={styles.boundary}><strong>{copy.boundary}.</strong> {project.privacyNote}</p>
      ) : null}

      {suite && related.length > 0 ? (
        <section className={styles.related} aria-label={`${copy.relatedSuite}: ${translateText(locale, suite.title)}`}>
          <div>
            <span>{copy.relatedSuite} / <b lang={locale}>{translateText(locale, suite.title)}</b></span>
            <p><span lang={locale}>{translateText(locale, suite.description)}</span> {copy.relatedCopy}</p>
          </div>
          <div className={styles.relatedLinks}>
            {related.map((relatedProject) => (
              <button
                key={relatedProject.slug}
                type="button"
                onClick={() => relatedProject.demo ? onOpenProjectDemo(relatedProject.slug) : onSelectProject(relatedProject.slug)}
              >
                {relatedProject.shortTitle ?? relatedProject.title} <b aria-hidden="true">→</b>
              </button>
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}
