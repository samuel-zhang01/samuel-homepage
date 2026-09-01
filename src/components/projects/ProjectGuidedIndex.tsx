"use client";

import Image from "next/image";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { projects, type Project } from "@/data/projects";
import type { Locale } from "@/lib/i18n";
import { getProjectArchiveCopy } from "./projectArchiveI18n";
import {
  projectShelfSpecs,
  projectStartPaths,
  projectSuites,
  type ProjectGuidedExperienceReference,
  type ProjectShelfId,
} from "./projectSuites";
import styles from "./ProjectGuidedIndex.module.css";

export type ProjectGuidedIndexProps = {
  locale?: Locale;
  selectedSlug?: string;
  onSelectProject: (slug: string) => void;
  onOpenProjectDemo: (slug: string) => void;
  onOpenLatestStory: () => void;
};

type GuidedExperience = {
  id: string;
  kind: "suite" | "project";
  title: string;
  description: string;
  chapters: readonly Project[];
  recommended: Project;
};

function requireProject(slug: string) {
  const project = projects.find((candidate) => candidate.slug === slug);
  if (!project) throw new Error(`Guided Project Archive references unknown project: ${slug}`);
  return project;
}

function resolveExperience(reference: ProjectGuidedExperienceReference): GuidedExperience {
  if (reference.kind === "project") {
    const project = requireProject(reference.slug);
    if (!project.demo) {
      throw new Error(`Standalone guided experience must be interactive: ${project.slug}`);
    }
    return {
      id: `project-${project.slug}`,
      kind: "project",
      title: project.title,
      description: project.summary,
      chapters: [project],
      recommended: project,
    };
  }

  const suite = projectSuites.find((candidate) => candidate.id === reference.id);
  if (!suite) throw new Error(`Guided Project Archive references unknown suite: ${reference.id}`);
  const chapters = suite.slugs.map(requireProject);
  const recommended = requireProject(reference.recommendedSlug);
  if (!suite.slugs.includes(recommended.slug) || !recommended.demo) {
    throw new Error(`Guided suite ${suite.id} needs an interactive recommended chapter.`);
  }
  return {
    id: `suite-${suite.id}`,
    kind: "suite",
    title: suite.title,
    description: suite.description,
    chapters,
    recommended,
  };
}

const GUIDED_SHELVES = projectShelfSpecs.map((shelf) => ({
  ...shelf,
  experiences: shelf.experiences.map(resolveExperience),
  supportingProjects: (shelf.supportingSlugs ?? []).map(requireProject),
}));

const START_PROJECTS = projectStartPaths.map((path) => ({ ...path, project: requireProject(path.slug) }));
const GUIDED_EXPERIENCE_COUNT = GUIDED_SHELVES.reduce(
  (total, shelf) => total + shelf.experiences.length,
  0,
);

function validateGuidedArchive() {
  const experiences = GUIDED_SHELVES.flatMap((shelf) => shelf.experiences);
  const suiteIds = experiences
    .filter((experience) => experience.kind === "suite")
    .map((experience) => experience.id.replace(/^suite-/, ""));
  const suiteProjectSlugs = new Set(projectSuites.flatMap((suite) => suite.slugs));
  const standaloneSlugs = experiences
    .filter((experience) => experience.kind === "project")
    .map((experience) => experience.recommended.slug);
  const expectedStandaloneSlugs = projects
    .filter((project) => project.demo && !suiteProjectSlugs.has(project.slug))
    .map((project) => project.slug);
  const visibleSlugList = GUIDED_SHELVES.flatMap((shelf) => [
    ...shelf.experiences.flatMap((experience) => (
      experience.chapters.map((project) => project.slug)
    )),
    ...shelf.supportingProjects.map((project) => project.slug),
  ]);
  const sameMembers = (left: readonly string[], right: readonly string[]) => (
    left.length === right.length && left.every((item) => right.includes(item))
  );

  if (
    GUIDED_EXPERIENCE_COUNT !== 14
    || !sameMembers(suiteIds, projectSuites.map((suite) => suite.id))
    || !sameMembers(standaloneSlugs, expectedStandaloneSlugs)
    || visibleSlugList.length !== projects.length
    || new Set(visibleSlugList).size !== projects.length
  ) {
    throw new Error("Guided Project Archive no longer reconciles with the project catalogue.");
  }
}

validateGuidedArchive();

function findGuidedLocation(slug?: string) {
  if (!slug) return null;
  for (const shelf of GUIDED_SHELVES) {
    const experience = shelf.experiences.find((candidate) => (
      candidate.chapters.some((project) => project.slug === slug)
    ));
    if (experience) {
      return {
        shelfId: shelf.id,
        experienceId: experience.kind === "suite" ? experience.id : null,
      };
    }
    if (shelf.supportingProjects.some((project) => project.slug === slug)) {
      return { shelfId: shelf.id, experienceId: null };
    }
  }
  return null;
}

function projectReferenceLabel(project: Project, locale: Locale) {
  const copy = getProjectArchiveCopy(locale);
  if (project.artifacts?.[0]) return copy.artifactKinds[project.artifacts[0].kind];
  if (project.websiteUrl) return copy.resourceKinds["LIVE WEBSITE"];
  if (project.sourceUrl) return copy.resourceKinds.SOURCE;
  return copy.guided.referenceFile;
}

export function ProjectGuidedIndex({
  locale = "en-GB",
  selectedSlug,
  onSelectProject,
  onOpenProjectDemo,
  onOpenLatestStory,
}: ProjectGuidedIndexProps) {
  const copy = getProjectArchiveCopy(locale);
  const idPrefix = useId();
  const selectedLocation = useMemo(() => findGuidedLocation(selectedSlug), [selectedSlug]);
  const [openShelfId, setOpenShelfId] = useState<ProjectShelfId | null>(
    () => selectedLocation?.shelfId ?? null,
  );
  const [openExperienceId, setOpenExperienceId] = useState<string | null>(
    () => selectedLocation?.experienceId ?? null,
  );
  const selectedShelfRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (!selectedLocation) return;
    setOpenShelfId(selectedLocation.shelfId);
    setOpenExperienceId(selectedLocation.experienceId);
    const frame = window.requestAnimationFrame(() => {
      selectedShelfRef.current?.scrollIntoView({
        block: "nearest",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [selectedLocation]);

  const toggleShelf = (shelfId: ProjectShelfId) => {
    const nextShelfId = openShelfId === shelfId ? null : shelfId;
    setOpenShelfId(nextShelfId);
    setOpenExperienceId(null);
  };

  return (
    <div className={styles.guidedIndex}>
      <header className={styles.hero}>
        <div className={styles.heroCopy} lang={locale}>
          <span className={styles.eyebrow}>{copy.guided.heroEyebrow}</span>
          <h2>{copy.guided.heroTitle}</h2>
          <p>{copy.guided.heroDescription}</p>
        </div>
        <dl className={styles.stats} aria-label={copy.guided.statsAria} lang={locale}>
          <div><dt>{copy.guided.experiencesStat}</dt><dd>{GUIDED_EXPERIENCE_COUNT}</dd></div>
          <div><dt>{copy.guided.suitesStat}</dt><dd>{projectSuites.length}</dd></div>
          <div><dt>{copy.guided.filesStat}</dt><dd>{projects.length}</dd></div>
        </dl>
      </header>

      <section className={styles.start} aria-labelledby={`${idPrefix}-start-title`}>
        <article className={styles.latestStory} aria-labelledby={`${idPrefix}-latest-title`}>
          <div className={styles.latestVisual}>
            <Image
              src="/hackathons/runhack/building-in-motion.jpg"
              alt={copy.guided.latestImageAlt}
              fill
              sizes="(max-width: 700px) 100vw, 42vw"
              unoptimized
            />
            <span className={styles.trackLines} aria-hidden="true" />
          </div>
          <div className={styles.latestCopy} lang={locale}>
            <div className={styles.latestMeta}>
              <span>{copy.guided.latestEyebrow}</span>
              <time dateTime="2026-08-29">{copy.guided.latestDate}</time>
            </div>
            <h3 id={`${idPrefix}-latest-title`}>{copy.guided.latestTitle}</h3>
            <p>{copy.guided.latestDescription}</p>
            <button type="button" onClick={onOpenLatestStory}>
              <span aria-hidden="true">↗</span> {copy.guided.latestAction}
            </button>
          </div>
        </article>

        <div className={styles.sectionHeading} lang={locale}>
          <div>
            <span className={styles.attention}><i aria-hidden="true" /> {copy.guided.startEyebrow}</span>
            <h3 id={`${idPrefix}-start-title`}>{copy.guided.startTitle}</h3>
          </div>
          <p>{copy.guided.startDescription}</p>
        </div>
        <ol
          className={styles.startLane}
          aria-label={`${copy.guided.startTitle}: ${copy.guided.startDescription}`}
        >
          {START_PROJECTS.map((path, index) => {
            const pathCopy = copy.guided.startPaths[path.id];
            const isSelected = selectedSlug === path.slug;
            return (
              <li key={path.slug}>
                <article
                  className={styles.startCard}
                  data-start={path.id}
                  data-selected={isSelected ? "true" : "false"}
                >
                  <div className={styles.cardTopline}>
                    <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                    <span lang={locale}>{pathCopy.eyebrow}</span>
                  </div>
                  <h4 lang={locale}>{pathCopy.title}</h4>
                  <p lang={locale}>{pathCopy.description}</p>
                  <div className={styles.cardActions}>
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      onClick={() => onSelectProject(path.slug)}
                      aria-current={isSelected ? "page" : undefined}
                    >
                      {copy.guided.readBrief}
                    </button>
                    <button
                      type="button"
                      className={styles.primaryButton}
                      onClick={() => onOpenProjectDemo(path.slug)}
                    >
                      <span aria-hidden="true">▶</span> {copy.guided.runDemo}
                    </button>
                  </div>
                </article>
              </li>
            );
          })}
        </ol>
      </section>

      <section className={styles.shelves} aria-labelledby={`${idPrefix}-shelves-title`}>
        <div className={styles.sectionHeading} lang={locale}>
          <div>
            <span className={styles.eyebrow}>{copy.guided.shelvesEyebrow}</span>
            <h3 id={`${idPrefix}-shelves-title`}>{copy.guided.shelvesTitle}</h3>
          </div>
          <p>{copy.guided.shelvesDescription}</p>
        </div>

        <ol className={styles.shelfGrid} data-expanded={openShelfId ? "true" : "false"}>
          {GUIDED_SHELVES.map((shelf, shelfIndex) => {
            const shelfCopy = copy.guided.shelves[shelf.id];
            const isOpen = openShelfId === shelf.id;
            const buttonId = `${idPrefix}-shelf-button-${shelf.id}`;
            const panelId = `${idPrefix}-shelf-panel-${shelf.id}`;
            const projectFileCount = shelf.experiences.reduce(
              (total, experience) => total + experience.chapters.length,
              0,
            ) + shelf.supportingProjects.length;

            return (
              <li
                key={shelf.id}
                ref={selectedLocation?.shelfId === shelf.id ? selectedShelfRef : undefined}
                className={styles.shelfItem}
                data-shelf={shelf.id}
                data-open={isOpen ? "true" : "false"}
                data-selected={selectedLocation?.shelfId === shelf.id ? "true" : "false"}
              >
                <button
                  id={buttonId}
                  type="button"
                  className={styles.shelfButton}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggleShelf(shelf.id)}
                >
                  <span className={styles.shelfCode} aria-hidden="true">{shelf.code}</span>
                  <span className={styles.shelfCopy} lang={locale}>
                    <span className={styles.shelfNumber}>
                      {copy.guided.drawer} {String(shelfIndex + 1).padStart(2, "0")}
                    </span>
                    <strong>{shelfCopy.title}</strong>
                    <span>{shelfCopy.description}</span>
                  </span>
                  <span className={styles.shelfCounts} lang={locale}>
                    <b>{shelf.experiences.length}</b>{" "}
                    {shelf.experiences.length === 1 ? copy.guided.experience : copy.guided.experiences}
                    <small>{projectFileCount} {copy.guided.filesStat}</small>
                  </span>
                  <span className={styles.disclosure} aria-hidden="true">{isOpen ? "−" : "+"}</span>
                </button>

                <div
                  id={panelId}
                  className={styles.shelfPanel}
                  role="region"
                  aria-labelledby={buttonId}
                  hidden={!isOpen}
                >
                  <ol className={styles.experienceList}>
                    {shelf.experiences.map((experience, experienceIndex) => {
                      if (experience.kind === "project") {
                        const project = experience.recommended;
                        return (
                          <li
                            key={experience.id}
                            className={styles.experience}
                            data-selected={selectedSlug === project.slug ? "true" : "false"}
                          >
                            <article className={styles.standaloneCard}>
                              <span className={styles.experienceIndex} aria-hidden="true">
                                {String(experienceIndex + 1).padStart(2, "0")}
                              </span>
                              <span className={styles.experienceCopy}>
                                <span className={styles.experienceMarker} lang={locale}>{copy.markers.demo}</span>
                                <strong lang="en-GB">{experience.title}</strong>
                                <span lang="en-GB">{experience.description}</span>
                              </span>
                              <span className={styles.standaloneActions} lang={locale}>
                                <button
                                  type="button"
                                  className={styles.secondaryButton}
                                  onClick={() => onSelectProject(project.slug)}
                                  aria-current={selectedSlug === project.slug ? "page" : undefined}
                                >
                                  {copy.guided.readBrief}
                                </button>
                                <button
                                  type="button"
                                  className={styles.primaryButton}
                                  onClick={() => onOpenProjectDemo(project.slug)}
                                >
                                  <span aria-hidden="true">▶</span> {copy.guided.runDemo}
                                </button>
                              </span>
                            </article>
                          </li>
                        );
                      }

                      const experienceOpen = openExperienceId === experience.id;
                      const experienceButtonId = `${idPrefix}-experience-button-${experience.id}`;
                      const experiencePanelId = `${idPrefix}-experience-panel-${experience.id}`;
                      const containsSelection = experience.chapters.some((project) => project.slug === selectedSlug);

                      return (
                        <li
                          key={experience.id}
                          className={styles.experience}
                          data-open={experienceOpen ? "true" : "false"}
                          data-selected={containsSelection ? "true" : "false"}
                        >
                          <button
                            id={experienceButtonId}
                            type="button"
                            className={styles.experienceButton}
                            aria-expanded={experienceOpen}
                            aria-controls={experiencePanelId}
                            onClick={() => setOpenExperienceId(experienceOpen ? null : experience.id)}
                          >
                            <span className={styles.experienceIndex} aria-hidden="true">
                              {String(experienceIndex + 1).padStart(2, "0")}
                            </span>
                            <span className={styles.experienceCopy}>
                              <span className={styles.experienceMarker} lang={locale}>{copy.markers.suite}</span>
                              <strong lang="en-GB">{experience.title}</strong>
                              <span lang="en-GB">{experience.description}</span>
                            </span>
                            <span className={styles.experienceMeta} lang={locale}>
                              {experience.chapters.length}{" "}
                              {experience.chapters.length === 1 ? copy.guided.chapter : copy.guided.chapters}
                              <small>{experienceOpen ? copy.guided.hideChapters : copy.guided.showChapters}</small>
                            </span>
                            <span className={styles.disclosure} aria-hidden="true">{experienceOpen ? "−" : "+"}</span>
                          </button>

                          <div
                            id={experiencePanelId}
                            className={styles.chapterPanel}
                            role="region"
                            aria-labelledby={experienceButtonId}
                            hidden={!experienceOpen}
                          >
                            <aside className={styles.recommended} lang={locale}>
                              <span>{copy.guided.recommended}</span>
                              <strong lang="en-GB">{experience.recommended.title}</strong>
                              <button
                                type="button"
                                onClick={() => onOpenProjectDemo(experience.recommended.slug)}
                              >
                                <span aria-hidden="true">▶</span> {copy.guided.runDemo}
                              </button>
                            </aside>
                            <ol className={styles.chapterList}>
                              {experience.chapters.map((project, chapterIndex) => (
                                <li key={project.slug} data-selected={selectedSlug === project.slug ? "true" : "false"}>
                                  <button
                                    type="button"
                                    className={styles.chapterSelect}
                                    onClick={() => onSelectProject(project.slug)}
                                    aria-current={selectedSlug === project.slug ? "page" : undefined}
                                  >
                                    <span className={styles.chapterNumber} aria-hidden="true">
                                      {String(chapterIndex + 1).padStart(2, "0")}
                                    </span>
                                    <span className={styles.chapterCopy}>
                                      <strong lang="en-GB">{project.title}</strong>
                                      <span lang={locale}>
                                        {copy.areas[project.area]} · {copy.statuses[project.status]}
                                      </span>
                                    </span>
                                    {!project.demo && (
                                      <span className={styles.fileMarker} lang={locale}>
                                        {projectReferenceLabel(project, locale)}
                                      </span>
                                    )}
                                  </button>
                                  {project.demo && (
                                    <button
                                      type="button"
                                      className={styles.demoButton}
                                      onClick={() => onOpenProjectDemo(project.slug)}
                                      aria-label={`${copy.guided.runDemo}: ${project.title}`}
                                    >
                                      <span aria-hidden="true">▶</span> {copy.markers.demo}
                                    </button>
                                  )}
                                </li>
                              ))}
                            </ol>
                          </div>
                        </li>
                      );
                    })}
                  </ol>

                  {shelf.supportingProjects.length > 0 && (
                    <section
                      className={styles.shelfResources}
                      aria-labelledby={`${idPrefix}-supporting-${shelf.id}`}
                    >
                      <div className={styles.shelfResourceHeading} lang={locale}>
                        <h4 id={`${idPrefix}-supporting-${shelf.id}`}>{copy.guided.supportingFiles}</h4>
                        <p>{copy.guided.supportingDescription}</p>
                      </div>
                      <ul className={styles.resourceList}>
                        {shelf.supportingProjects.map((project) => (
                          <li key={project.slug} data-selected={selectedSlug === project.slug ? "true" : "false"}>
                            <button
                              type="button"
                              onClick={() => onSelectProject(project.slug)}
                              aria-current={selectedSlug === project.slug ? "page" : undefined}
                            >
                              <span className={styles.resourceGlyph} aria-hidden="true">▤</span>
                              <span className={styles.resourceCopy}>
                                <strong lang="en-GB">{project.title}</strong>
                                <span lang="en-GB">{project.summary}</span>
                              </span>
                              <span className={styles.resourceMeta} lang={locale}>
                                {copy.access[project.access].short} · {projectReferenceLabel(project, locale)}
                              </span>
                              <span className={styles.resourceAction} lang={locale}>
                                {copy.guided.viewProject} ›
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <footer className={styles.reconciliation} lang={locale}>
        <span aria-hidden="true">✓</span>
        <p><strong>{copy.guided.reconciliationLead}</strong> {copy.guided.reconciliation}</p>
      </footer>
    </div>
  );
}

export default ProjectGuidedIndex;
