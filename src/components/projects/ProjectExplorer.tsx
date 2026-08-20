"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { memo, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type RefObject } from "react";
import {
  projectAreas,
  projects,
  type Project,
  type ProjectAccess,
  type ProjectArea,
} from "@/data/projects";
import type { Locale } from "@/lib/i18n";
import { ProjectActions } from "./ProjectActions";
import { ProjectCaseBrief } from "./ProjectCaseBrief";
import { ProjectDemoRouter } from "./ProjectDemoRouter";
import { ProjectGuidedIndex } from "./ProjectGuidedIndex";
import {
  formatProjectArchiveCopy,
  getProjectArchiveCopy,
} from "./projectArchiveI18n";
import { getProjectSuite } from "./projectSuites";
import styles from "./ProjectExplorer.module.css";

type SystemApp = NonNullable<Project["systemApp"]>;
type AccessFilter = ProjectAccess | "all";
type AreaFilter = ProjectArea | "all";
type ArchiveView = "guided" | "files" | "map";
type DetailView = "story" | "demo";
type LayoutMode = "catalogue" | "balanced" | "detail";
type SortMode = "curated" | "recent" | "title";

type ProjectExplorerProps = {
  initialSlug?: string;
  locale?: Locale;
  onOpenApp: (id: SystemApp) => void;
};

const accessOrder: ProjectAccess[] = [
  "open-source",
  "public-demo",
  "case-study",
  "proprietary",
];

const filterAccessOrder = accessOrder.filter((access) =>
  projects.some((project) => project.access === access),
);
const curatedOrder = new Map(projects.map((project, index) => [project.slug, index]));

const PortfolioMap = dynamic(
  () => import("./PortfolioMap").then((module) => module.PortfolioMap),
  {
    loading: () => (
      <div className={styles.mapLoading} role="status">
        <span aria-hidden="true" />
        <strong>INDEXING PROJECT FILES…</strong>
      </div>
    ),
  },
);

function latestProjectYear(project: Project) {
  if (/ongoing/i.test(project.year)) return Number.MAX_SAFE_INTEGER;
  const years = project.year.match(/\d{4}/g)?.map(Number) ?? [0];
  return Math.max(...years);
}

function replaceProjectQuery(slug: string) {
  if (!/\/projects\/?$/i.test(window.location.pathname)) return;
  const url = new URL(window.location.href);
  url.searchParams.set("project", slug);
  window.history.replaceState(null, "", `${url.pathname}${url.search}`);
}

function revealProjectRow(list: HTMLDivElement | null, slug: string) {
  if (!list) return;
  const row = Array.from(
    list.querySelectorAll<HTMLButtonElement>("[data-project-slug]"),
  ).find((candidate) => candidate.dataset.projectSlug === slug);
  if (!row) return;

  const listBounds = list.getBoundingClientRect();
  const rowBounds = row.getBoundingClientRect();
  if (rowBounds.top < listBounds.top) {
    list.scrollTop += rowBounds.top - listBounds.top;
  } else if (rowBounds.bottom > listBounds.bottom) {
    list.scrollTop += rowBounds.bottom - listBounds.bottom;
  }
}

function usesStackedProjectLayout(detail: HTMLElement | null) {
  const workspace = detail?.parentElement;
  return workspace ? window.getComputedStyle(workspace).display === "block" : false;
}

function ProjectVisual({ project, compact = false }: { project: Project; compact?: boolean }) {
  const visualClass = `${styles.visual} ${styles[`visual_${project.visual}`]}`;

  return (
    <div className={visualClass} aria-hidden="true" data-compact={compact ? "true" : "false"} lang="en-GB">
      <span className={styles.visualGrid} />
      <span className={styles.visualLineA} />
      <span className={styles.visualLineB} />
      <span className={styles.visualNodeA} />
      <span className={styles.visualNodeB} />
      <span className={styles.visualNodeC} />
      <strong>{project.shortTitle ?? project.title}</strong>
      <small>{project.year}</small>
    </div>
  );
}

function AccessBadge({ access, locale }: { access: ProjectAccess; locale: Locale }) {
  const meta = getProjectArchiveCopy(locale).access[access];
  return (
    <span className={`${styles.accessBadge} ${styles[`access_${access}`]}`} lang={locale}>
      <span aria-hidden="true">{access === "proprietary" ? "▣" : "◆"}</span>
      {meta.label}
    </span>
  );
}

function ProjectRow({
  project,
  selected,
  onSelect,
  onKeyDown,
  tabIndex,
  locale,
}: {
  project: Project;
  selected: boolean;
  onSelect: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
  tabIndex: number;
  locale: Locale;
}) {
  const copy = getProjectArchiveCopy(locale);
  const suite = getProjectSuite(project);
  const suiteChapter = suite ? suite.slugs.indexOf(project.slug) + 1 : 0;
  return (
    <button
      type="button"
      className={`${styles.projectRow} ${project.access === "proprietary" ? styles.row_proprietary : ""} ${selected ? styles.rowSelected : ""}`}
      data-project-slug={project.slug}
      onClick={onSelect}
      onKeyDown={onKeyDown}
      tabIndex={tabIndex}
      aria-pressed={selected}
      aria-keyshortcuts="ArrowUp ArrowDown Home End PageUp PageDown"
    >
      <ProjectVisual project={project} compact />
      <span className={styles.rowCopy}>
        <span className={styles.rowMeta}>
          <span lang={locale}>{copy.areas[project.area]}</span>
          <time>{project.year}</time>
        </span>
        <strong lang="en-GB">{project.title}</strong>
        <span className={styles.rowSummary} lang="en-GB">{project.summary}</span>
        <span className={styles.rowFooter} lang={locale}>
          <span className={`${styles.miniAccess} ${styles[`access_${project.access}`]}`}>
            {copy.access[project.access].short}
          </span>
          <span>{copy.statuses[project.status]}</span>
          {project.demo && (
            <span className={styles.resourceMarker}>
              ▶ {suite ? `${copy.markers.suite} ${suiteChapter}/${suite.slugs.length}` : copy.markers.demo}
            </span>
          )}
          {project.websiteUrl && <span className={styles.resourceMarker}>↗ {copy.markers.live}</span>}
          {project.artifacts?.[0] && (
            <span className={styles.resourceMarker}>◫ {copy.artifactKinds[project.artifacts[0].kind]}</span>
          )}
        </span>
      </span>
      <span className={styles.rowArrow} aria-hidden="true">›</span>
    </button>
  );
}

function EmptyState({ reset, locale }: { reset: () => void; locale: Locale }) {
  const copy = getProjectArchiveCopy(locale).catalogue;
  return (
    <div className={styles.emptyState} lang={locale}>
      <span className={styles.emptyIcon} aria-hidden="true">?</span>
      <strong>{copy.emptyTitle}</strong>
      <p>{copy.emptyDescription}</p>
      <button type="button" onClick={reset}>{copy.showAll}</button>
    </div>
  );
}

function FilteredEmptyDetail({
  query,
  access,
  area,
  featuredOnly,
  reset,
  locale,
  detailRef,
}: {
  query: string;
  access: AccessFilter;
  area: AreaFilter;
  featuredOnly: boolean;
  reset: () => void;
  locale: Locale;
  detailRef: RefObject<HTMLElement | null>;
}) {
  const copy = getProjectArchiveCopy(locale);
  const scope = [
    query.trim() ? { label: copy.filters.searchAria, value: `“${query.trim()}”` } : undefined,
    area !== "all" ? { label: copy.filters.disciplineAria, value: copy.areas[area] } : undefined,
    access !== "all" ? { label: copy.filters.accessAria, value: copy.access[access].label } : undefined,
    featuredOnly ? { label: copy.filters.featured, value: `★ ${copy.filters.featured}` } : undefined,
  ].filter((item): item is { label: string; value: string } => Boolean(item));

  return (
    <section
      ref={detailRef}
      id="project-detail"
      className={`${styles.detailPane} ${styles.filteredEmptyDetail}`}
      aria-labelledby="project-empty-detail-title"
      tabIndex={-1}
      lang={locale}
    >
      <div className={styles.emptyDetailPanel}>
        <span className={styles.emptyIcon} aria-hidden="true">?</span>
        <span className={styles.eyebrow}>
          {formatProjectArchiveCopy(copy.catalogue.objects, {
            shown: 0,
            total: projects.length,
          })}
        </span>
        <h3 id="project-empty-detail-title">{copy.catalogue.emptyTitle}</h3>
        <p>{copy.catalogue.emptyDescription}</p>
        {scope.length > 0 && (
          <dl className={styles.emptyScope}>
            {scope.map((item) => (
              <div key={item.label}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        )}
        <button type="button" onClick={reset}>{copy.catalogue.showAll}</button>
      </div>
    </section>
  );
}

function ProjectTitleTemplate({ template, title }: { template: string; title: string }) {
  const marker = "{title}";
  const markerIndex = template.indexOf(marker);
  if (markerIndex < 0) return <span lang="en-GB">{title}</span>;
  return (
    <>
      {template.slice(0, markerIndex)}
      <span lang="en-GB">{title}</span>
      {template.slice(markerIndex + marker.length)}
    </>
  );
}

function HeroAction({
  project,
  locale,
  onOpenDemo,
}: {
  project: Project;
  locale: Locale;
  onOpenDemo: () => void;
}) {
  const copy = getProjectArchiveCopy(locale);
  const suite = getProjectSuite(project);

  if (project.demo) {
    const chapter = suite ? suite.slugs.indexOf(project.slug) + 1 : 0;
    return (
      <button type="button" className={styles.heroAction} onClick={onOpenDemo}>
        <span aria-hidden="true">▶</span>
        <span>
          <small>
            {suite
              ? formatProjectArchiveCopy(copy.actions.suiteChapter, { chapter, total: suite.slugs.length })
              : copy.actions.liveDemo}
          </small>
          <strong>
            <ProjectTitleTemplate
              template={suite ? copy.actions.openSuite : copy.actions.openLab}
              title={suite?.title ?? project.shortTitle ?? project.title}
            />
          </strong>
        </span>
        <b aria-hidden="true">›</b>
      </button>
    );
  }

  const primaryResource = project.websiteUrl
    ? {
      href: project.websiteUrl,
      kind: copy.resourceKinds["LIVE WEBSITE"],
      label: project.slug === "coverd-ai" ? copy.actions.visitCoverd : copy.actions.visitWebsite,
      labelLang: locale,
    }
    : project.artifacts?.[0]
      ? {
        href: project.artifacts[0].href,
        kind: copy.artifactKinds[project.artifacts[0].kind],
        label: project.artifacts[0].label,
        labelLang: "en-GB" as const,
      }
      : project.sourceUrl && project.access !== "proprietary"
        ? {
          href: project.sourceUrl,
          kind: copy.resourceKinds[project.sourceLicence === "none-declared" ? "PUBLIC REPO" : "SOURCE"],
          label: project.sourceLicence === "none-declared"
            ? copy.actions.sourceNoLicence
            : copy.actions.viewRepository,
          labelLang: locale,
        }
        : undefined;

  if (!primaryResource) return null;

  return (
    <a
      className={styles.heroAction}
      href={primaryResource.href}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span aria-hidden="true">↗</span>
      <span>
        <small>{primaryResource.kind}</small>
        <strong lang={primaryResource.labelLang}>{primaryResource.label}</strong>
      </span>
      <b aria-hidden="true">›</b>
      <span className={styles.srOnly}>{copy.actions.opensNewWindow}</span>
    </a>
  );
}

function ProjectDetail({
  project,
  locale,
  view,
  setView,
  onOpenApp,
  onSelectProject,
  onOpenProjectDemo,
  detailRef,
}: {
  project: Project;
  locale: Locale;
  view: DetailView;
  setView: (view: DetailView) => void;
  onOpenApp: (id: SystemApp) => void;
  onSelectProject: (slug: string) => void;
  onOpenProjectDemo: (slug: string) => void;
  detailRef: RefObject<HTMLElement | null>;
}) {
  const copy = getProjectArchiveCopy(locale);

  if (view === "demo" && project.demo) {
    return (
      <section
        ref={detailRef}
        id="project-detail"
        className={styles.detailPane}
        aria-label={formatProjectArchiveCopy(copy.detail.interactiveDemoAria, { title: project.title })}
        tabIndex={0}
        lang={locale}
      >
        <div className={styles.demoHeader}>
          <button type="button" onClick={() => setView("story")}>{copy.detail.backToProject}</button>
          <div>
            <span>{copy.detail.safePort}</span>
            <strong lang="en-GB">{project.title}</strong>
          </div>
          <AccessBadge access={project.access} locale={locale} />
        </div>
        <div className={styles.demoBody} lang="en-GB">
          <ProjectCaseBrief
            project={project}
            locale={locale}
            onSelectProject={onSelectProject}
            onOpenProjectDemo={onOpenProjectDemo}
          />
          <ProjectDemoRouter demoId={project.demo} />
        </div>
      </section>
    );
  }

  return (
    <section
      ref={detailRef}
      id="project-detail"
      className={styles.detailPane}
      aria-label={formatProjectArchiveCopy(copy.detail.detailsAria, { title: project.title })}
      tabIndex={0}
      lang={locale}
    >
      <div className={styles.detailHero}>
        <ProjectVisual project={project} />
        <div className={styles.detailIntro}>
          <div className={styles.detailTopline}>
            <AccessBadge access={project.access} locale={locale} />
            <span>{copy.statuses[project.status]}</span>
            <time>{project.year}</time>
          </div>
          <span className={styles.eyebrow} lang="en-GB">{project.eyebrow}</span>
          <h3 lang="en-GB">{project.title}</h3>
          <p lang="en-GB">{project.summary}</p>
          <HeroAction
            project={project}
            locale={locale}
            onOpenDemo={() => setView("demo")}
          />
        </div>
      </div>

      {project.access === "proprietary" && (
        <div className={styles.redactedNotice} role="note">
          <span className={styles.lock} aria-hidden="true"><i /></span>
          <div>
            <strong>{copy.detail.privateBoundary}</strong>
            <p lang="en-GB">{project.privacyNote}</p>
          </div>
        </div>
      )}

      {project.privacyNote && project.access !== "proprietary" && (
        <div className={styles.safeNotice} role="note">
          <strong>{copy.detail.privacyNote}</strong>
          <span lang="en-GB">{project.privacyNote}</span>
        </div>
      )}

      <div className={styles.detailBody}>
        <p className={styles.longCopy} lang="en-GB">{project.detail}</p>

        {project.preview && (
          <figure className={styles.artifactPreview}>
            <div>
              <Image
                src={project.preview.src}
                alt={project.preview.alt}
                lang="en-GB"
                width={543}
                height={172}
                sizes="(max-width: 720px) 100vw, 560px"
              />
            </div>
            <figcaption>
              <span>{copy.detail.derivedArtifact}</span>
              <div lang="en-GB">{project.preview.caption}</div>
            </figcaption>
          </figure>
        )}

        <div className={styles.toolStrip} aria-label={copy.detail.technologiesAria}>
          {project.tools.map((tool) => <span key={tool} lang="en-GB">{tool}</span>)}
        </div>

        <section className={styles.progressSection}>
          <div className={styles.sectionHeading}>
            <span>{copy.detail.buildLog}</span>
            <strong>{copy.detail.buildJourney}</strong>
          </div>
          <ol className={styles.phases}>
            {project.phases.map((phase, index) => (
              <li key={phase.label}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><strong>{copy.phases[phase.label]}</strong><p lang="en-GB">{phase.text}</p></div>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.evidenceSection}>
          <div className={styles.sectionHeading}>
            <span>{copy.detail.evidence}</span>
            <strong>{copy.detail.safeToShow}</strong>
          </div>
          <ul className={styles.highlights}>
            {project.highlights.map((highlight) => <li key={highlight} lang="en-GB">{highlight}</li>)}
          </ul>
        </section>
      </div>

      <ProjectActions
        className={styles.projectActions}
        projectTitle={project.title}
        projectSlug={project.slug}
        locale={locale}
        website={project.websiteUrl ? {
          href: project.websiteUrl,
          label: project.slug === "coverd-ai" ? copy.actions.visitCoverd : copy.actions.visitWebsite,
          kind: "LIVE WEBSITE",
          primary: true,
          labelLang: locale,
        } : undefined}
        artifacts={project.artifacts?.map((artifact) => ({
          href: artifact.href,
          label: artifact.label,
          kind: artifact.kind,
          labelLang: "en-GB",
        }))}
        source={project.sourceUrl && project.access !== "proprietary" ? {
          href: project.sourceUrl,
          label: project.sourceLicence === "none-declared" ? copy.actions.sourceNoLicence : copy.actions.viewRepository,
          kind: project.sourceLicence === "none-declared" ? "PUBLIC REPO" : "SOURCE",
          labelLang: locale,
        } : undefined}
        onOpenDemo={project.demo ? () => setView("demo") : undefined}
        demoLabel={project.demo ? (
          <ProjectTitleTemplate template={copy.actions.openLab} title={project.shortTitle ?? project.title} />
        ) : undefined}
        onOpenSystemApp={project.systemApp ? () => onOpenApp(project.systemApp!) : undefined}
        systemAppLabel={project.systemApp === "coverd" ? copy.actions.openCoverdBrief : copy.actions.openSystemFile}
      />
    </section>
  );
}

function ProjectExplorer({ initialSlug, locale = "en-GB", onOpenApp }: ProjectExplorerProps) {
  const copy = getProjectArchiveCopy(locale);
  const hasInitialProject = projects.some((project) => project.slug === initialSlug);
  const viewId = useId();
  const [query, setQuery] = useState("");
  const [access, setAccess] = useState<AccessFilter>("all");
  const [area, setArea] = useState<AreaFilter>("all");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState(() =>
    hasInitialProject ? initialSlug! : projects[0].slug,
  );
  const [guidedSelectedSlug, setGuidedSelectedSlug] = useState<string | undefined>(() => (
    hasInitialProject ? initialSlug : undefined
  ));
  const [archiveView, setArchiveView] = useState<ArchiveView>(() => (
    hasInitialProject ? "files" : "guided"
  ));
  const [archiveTabStop, setArchiveTabStop] = useState<ArchiveView>(() => (
    hasInitialProject ? "files" : "guided"
  ));
  const [detailView, setDetailView] = useState<DetailView>("story");
  const [showLegend, setShowLegend] = useState(false);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("balanced");
  const [sortMode, setSortMode] = useState<SortMode>("curated");
  const detailRef = useRef<HTMLElement>(null);
  const projectListRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const viewTabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const shouldFocusDetail = useRef(false);
  const layoutBeforeDetailView = useRef<LayoutMode | null>(null);

  useEffect(() => {
    let frame = 0;
    const syncProjectQuery = () => {
      const projectParam = new URL(window.location.href).searchParams.get("project");
      if (!projectParam || !projects.some((project) => project.slug === projectParam)) return;
      setQuery("");
      setAccess("all");
      setArea("all");
      setFeaturedOnly(false);
      setSelectedSlug(projectParam);
      setGuidedSelectedSlug(projectParam);
      setDetailView("story");
      setArchiveView("files");
      setArchiveTabStop("files");
      frame = window.requestAnimationFrame(() => {
        if (usesStackedProjectLayout(detailRef.current)) {
          detailRef.current?.scrollIntoView({ block: "start" });
        }
      });
    };
    syncProjectQuery();
    window.addEventListener("popstate", syncProjectQuery);
    return () => {
      window.removeEventListener("popstate", syncProjectQuery);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const focusSearch = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      if (
        target instanceof HTMLInputElement
        || target instanceof HTMLTextAreaElement
        || target instanceof HTMLSelectElement
        || (target instanceof HTMLElement && target.isContentEditable)
      ) return;
      event.preventDefault();
      setArchiveView("files");
      setArchiveTabStop("files");
      window.requestAnimationFrame(() => {
        searchRef.current?.focus();
        searchRef.current?.select();
      });
    };
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);

  const filteredProjects = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matchingProjects = projects.filter((project) => {
      if (featuredOnly && !project.featured) return false;
      if (access !== "all" && project.access !== access) return false;
      if (area !== "all" && project.area !== area) return false;
      if (!needle) return true;
      const haystack = [
        project.title,
        project.shortTitle ?? "",
        project.eyebrow,
        project.summary,
        project.detail,
        project.privacyNote ?? "",
        project.area,
        copy.areas[project.area],
        project.status,
        copy.statuses[project.status],
        copy.access[project.access].label,
        ...project.tools,
        ...project.highlights,
        ...project.phases.map((phase) => phase.text),
      ].join(" ").toLowerCase();
      return haystack.includes(needle);
    });
    return [...matchingProjects].sort((left, right) => {
      if (sortMode === "recent") {
        return latestProjectYear(right) - latestProjectYear(left)
          || left.title.localeCompare(right.title, "en-GB");
      }
      if (sortMode === "title") return left.title.localeCompare(right.title, "en-GB");
      return (curatedOrder.get(left.slug) ?? 0) - (curatedOrder.get(right.slug) ?? 0);
    });
  }, [access, area, copy, featuredOnly, query, sortMode]);

  useEffect(() => {
    if (filteredProjects.length === 0) {
      if (detailView === "demo") {
        if (layoutBeforeDetailView.current) {
          setLayoutMode(layoutBeforeDetailView.current);
          layoutBeforeDetailView.current = null;
        }
        setDetailView("story");
      }
      return;
    }
    if (filteredProjects.some((project) => project.slug === selectedSlug)) return;

    const nextSlug = filteredProjects[0].slug;
    if (layoutBeforeDetailView.current) {
      setLayoutMode(layoutBeforeDetailView.current);
      layoutBeforeDetailView.current = null;
    }
    setSelectedSlug(nextSlug);
    setDetailView("story");
    replaceProjectQuery(nextSlug);
  }, [detailView, filteredProjects, selectedSlug]);

  const selectedProject = projects.find((project) => project.slug === selectedSlug) ?? projects[0];
  const activeCatalogueSlug = filteredProjects.some((project) => project.slug === selectedProject.slug)
    ? selectedProject.slug
    : filteredProjects[0]?.slug;
  const filteredProjectOrder = filteredProjects.map((project) => project.slug).join("|");
  const counts = useMemo(() => ({
    interactive: new Set(projects.filter((project) => project.demo).map((project) => (
      getProjectSuite(project)?.id ?? `project:${project.slug}`
    ))).size,
    suites: new Set(projects.map((project) => getProjectSuite(project)?.id).filter(Boolean)).size,
    open: projects.filter((project) => project.access !== "proprietary").length,
    private: projects.filter((project) => project.access === "proprietary").length,
  }), []);
  const activeLayoutLabel = layoutMode === "catalogue"
    ? copy.layout.catalogueFocus
    : layoutMode === "detail"
      ? copy.layout.detailFocus
      : copy.layout.balanced;

  useEffect(() => {
    if (archiveView !== "files" || !activeCatalogueSlug) return;
    const frame = window.requestAnimationFrame(() => {
      revealProjectRow(projectListRef.current, activeCatalogueSlug);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeCatalogueSlug, archiveView, filteredProjectOrder]);

  useEffect(() => {
    if (archiveView !== "files" || !/\/projects\/?$/i.test(window.location.pathname)) return;
    const originalTitle = document.title;
    document.title = `${selectedProject.title} · Project Archive · Samuel Zhang`;
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const originalCanonical = canonical?.href;
    if (canonical) {
      const canonicalUrl = new URL(canonical.href);
      canonicalUrl.searchParams.set("project", selectedProject.slug);
      canonical.href = canonicalUrl.toString();
    }
    return () => {
      document.title = originalTitle;
      if (canonical && originalCanonical) canonical.href = originalCanonical;
    };
  }, [archiveView, selectedProject]);

  useEffect(() => {
    if (!shouldFocusDetail.current) return;
    shouldFocusDetail.current = false;
    const detail = detailRef.current;
    if (!detail) return;
    detail.scrollTop = 0;
    detail.focus({ preventScroll: true });
    if (usesStackedProjectLayout(detail)) {
      detail.scrollIntoView({ block: "start" });
    }
  }, [archiveView, detailView, selectedSlug]);

  const selectProject = (slug: string) => {
    const stackedLayout = usesStackedProjectLayout(detailRef.current);
    const activateCurrentStory = stackedLayout && slug === selectedSlug && detailView === "story";
    shouldFocusDetail.current = stackedLayout && !activateCurrentStory;
    if (layoutBeforeDetailView.current) {
      setLayoutMode(layoutBeforeDetailView.current);
      layoutBeforeDetailView.current = null;
    }
    setSelectedSlug(slug);
    setGuidedSelectedSlug(slug);
    setDetailView("story");
    replaceProjectQuery(slug);
    if (activateCurrentStory) {
      window.requestAnimationFrame(() => {
        const detail = detailRef.current;
        if (!detail) return;
        detail.scrollTop = 0;
        detail.focus({ preventScroll: true });
        detail.scrollIntoView({ block: "start" });
      });
    }
  };

  const openProjectDemo = (slug: string) => {
    setArchiveView("files");
    setArchiveTabStop("files");
    const nextProject = projects.find((project) => project.slug === slug);
    if (!nextProject?.demo) {
      selectProject(slug);
      return;
    }
    shouldFocusDetail.current = true;
    if (!filteredProjects.some((project) => project.slug === slug)) {
      setQuery("");
      setAccess("all");
      setArea("all");
      setFeaturedOnly(false);
    }
    setSelectedSlug(slug);
    setGuidedSelectedSlug(slug);
    setDetailView("demo");
    replaceProjectQuery(slug);
  };

  const navigateCatalogue = (event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    if (!["ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown"].includes(event.key)) return;
    event.preventDefault();
    if (filteredProjects.length === 0) return;
    const pageStep = 5;
    const nextIndex = event.key === "Home"
      ? 0
      : event.key === "End"
        ? filteredProjects.length - 1
        : event.key === "PageUp"
          ? Math.max(0, currentIndex - pageStep)
          : event.key === "PageDown"
            ? Math.min(filteredProjects.length - 1, currentIndex + pageStep)
            : (currentIndex + (event.key === "ArrowDown" ? 1 : -1) + filteredProjects.length) % filteredProjects.length;
    const nextProject = filteredProjects[nextIndex];
    shouldFocusDetail.current = false;
    if (layoutBeforeDetailView.current) {
      setLayoutMode(layoutBeforeDetailView.current);
      layoutBeforeDetailView.current = null;
    }
    setSelectedSlug(nextProject.slug);
    setGuidedSelectedSlug(nextProject.slug);
    setDetailView("story");
    replaceProjectQuery(nextProject.slug);
    window.requestAnimationFrame(() => {
      document.querySelector<HTMLButtonElement>(`[data-project-slug="${nextProject.slug}"]`)?.focus();
    });
  };

  const focusSearchAfterCommit = () => {
    window.requestAnimationFrame(() => {
      searchRef.current?.focus({ preventScroll: true });
    });
  };

  const resetFilters = ({ focusSearch = false } = {}) => {
    setQuery("");
    setAccess("all");
    setArea("all");
    setFeaturedOnly(false);
    if (focusSearch) focusSearchAfterCommit();
  };

  const clearSearch = () => {
    setQuery("");
    focusSearchAfterCommit();
  };

  const changeDetailView = (nextView: DetailView) => {
    if (nextView === detailView) {
      shouldFocusDetail.current = false;
      return;
    }
    shouldFocusDetail.current = true;
    if (nextView === "story") {
      if (layoutBeforeDetailView.current) {
        setLayoutMode(layoutBeforeDetailView.current);
        layoutBeforeDetailView.current = null;
      }
    } else if (detailView === "story" && layoutMode === "balanced") {
      layoutBeforeDetailView.current = layoutMode;
      setLayoutMode("detail");
    }
    setDetailView(nextView);
  };

  const changeLayoutMode = (nextMode: LayoutMode) => {
    setLayoutMode(nextMode);
    if (detailView !== "story") layoutBeforeDetailView.current = null;
  };

  const selectProjectFromMap = (slug: string) => {
    shouldFocusDetail.current = true;
    if (layoutBeforeDetailView.current) {
      setLayoutMode(layoutBeforeDetailView.current);
      layoutBeforeDetailView.current = null;
    }
    if (!filteredProjects.some((project) => project.slug === slug)) {
      setQuery("");
      setAccess("all");
      setArea("all");
      setFeaturedOnly(false);
    }
    setArchiveView("files");
    setArchiveTabStop("files");
    setSelectedSlug(slug);
    setGuidedSelectedSlug(slug);
    setDetailView("story");
    replaceProjectQuery(slug);
  };

  const archiveViews: Array<{ id: ArchiveView; label: string; hint: string; glyph: string }> = [
    { id: "guided", label: copy.views.guided, hint: copy.views.guidedHint, glyph: "▦" },
    {
      id: "files",
      label: formatProjectArchiveCopy(copy.views.files, { count: projects.length }),
      hint: copy.views.filesHint,
      glyph: "▤",
    },
    { id: "map", label: copy.views.map, hint: copy.views.mapHint, glyph: "◈" },
  ];

  const activateArchiveView = (nextView: ArchiveView) => {
    setArchiveView(nextView);
    setArchiveTabStop(nextView);
    shouldFocusDetail.current = false;
  };

  const navigateArchiveViews = (
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
    view: ArchiveView,
  ) => {
    if (["Enter", " "].includes(event.key)) {
      event.preventDefault();
      activateArchiveView(view);
      return;
    }
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const nextIndex = event.key === "Home"
      ? 0
      : event.key === "End"
        ? archiveViews.length - 1
        : (currentIndex + (event.key === "ArrowRight" ? 1 : -1) + archiveViews.length) % archiveViews.length;
    setArchiveTabStop(archiveViews[nextIndex].id);
    viewTabRefs.current[nextIndex]?.focus();
  };

  return (
    <div className={styles.explorer} lang={locale}>
      <header className={styles.explorerHeader}>
        <div>
          <span className={styles.eyebrow}>{copy.header.eyebrow}</span>
          <h2>{copy.header.title}</h2>
          <p>{copy.header.description}</p>
        </div>
        <div className={styles.archiveStats} aria-label={copy.header.summaryAria}>
          <span><strong>{projects.length}</strong> {copy.header.files}</span>
          <span><strong>{counts.interactive}</strong> {copy.header.interactive}</span>
          <span><strong>{counts.suites}</strong> {copy.header.suites}</span>
          <span><strong>{counts.private}</strong> {copy.header.redacted}</span>
        </div>
      </header>

      <p className={styles.languageNotice} lang={locale} role="note">
        {copy.header.languageNotice}
      </p>

      <div className={styles.archiveViewTabs} role="tablist" aria-label={copy.views.aria}>
        {archiveViews.map((item, index) => (
          <button
            key={item.id}
            ref={(element) => { viewTabRefs.current[index] = element; }}
            id={`${viewId}-${item.id}-tab`}
            type="button"
            role="tab"
            className={styles.archiveViewTab}
            aria-controls={`${viewId}-${item.id}-panel`}
            aria-selected={archiveView === item.id}
            tabIndex={archiveTabStop === item.id ? 0 : -1}
            onFocus={() => setArchiveTabStop(item.id)}
            onClick={() => activateArchiveView(item.id)}
            onKeyDown={(event) => navigateArchiveViews(event, index, item.id)}
          >
            <span className={styles.archiveViewGlyph} aria-hidden="true">{item.glyph}</span>
            <span>
              <strong>{item.label}</strong>
              <small>{item.hint}</small>
            </span>
          </button>
        ))}
      </div>

      {archiveView === "guided" && (
        <section
          id={`${viewId}-guided-panel`}
          className={`${styles.archiveViewPanel} ${styles.guidedView}`}
          role="tabpanel"
          aria-labelledby={`${viewId}-guided-tab`}
          tabIndex={0}
        >
          <ProjectGuidedIndex
            locale={locale}
            selectedSlug={guidedSelectedSlug}
            onSelectProject={selectProjectFromMap}
            onOpenProjectDemo={openProjectDemo}
          />
        </section>
      )}

      {archiveView === "map" && (
        <section
          id={`${viewId}-map-panel`}
          className={`${styles.archiveViewPanel} ${styles.mapView}`}
          role="tabpanel"
          aria-labelledby={`${viewId}-map-tab`}
          tabIndex={0}
        >
          <PortfolioMap initialSlug={selectedProject.slug} onSelectProject={selectProjectFromMap} />
        </section>
      )}

      {archiveView === "files" && (
      <section
        id={`${viewId}-files-panel`}
        className={`${styles.archiveViewPanel} ${styles.filesView}`}
        role="tabpanel"
        aria-labelledby={`${viewId}-files-tab`}
      >
      <p className={styles.srOnly} aria-live="polite" aria-atomic="true">
        {filteredProjects.length === 0
          ? copy.catalogue.emptyTitle
          : formatProjectArchiveCopy(copy.catalogue.resultsStatus, {
            count: filteredProjects.length,
            title: selectedProject.title,
          })}
      </p>

      <div className={styles.toolbar}>
        <label className={styles.searchField}>
          <span aria-hidden="true" className={styles.searchGlyph} />
          <span className={styles.srOnly}>{copy.filters.searchAria}</span>
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Escape" || !query) return;
              event.preventDefault();
              setQuery("");
            }}
            placeholder={copy.filters.searchPlaceholder}
            aria-keyshortcuts="/ Escape"
          />
          {query
              ? <button type="button" onClick={clearSearch} aria-label={copy.filters.clearSearch}>×</button>
            : <kbd className={styles.searchKey} aria-hidden="true">/</kbd>}
        </label>
        <label>
          <span className={styles.srOnly}>{copy.filters.disciplineAria}</span>
          <select value={area} onChange={(event) => setArea(event.target.value as AreaFilter)}>
            <option value="all">{copy.filters.allDisciplines}</option>
            {projectAreas.map((item) => (
              <option key={item} value={item}>
                {copy.areas[item]} ({projects.filter((project) => project.area === item).length})
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className={styles.srOnly}>{copy.filters.accessAria}</span>
          <select value={access} onChange={(event) => setAccess(event.target.value as AccessFilter)}>
            <option value="all">{copy.filters.allAccess}</option>
            {filterAccessOrder.map((item) => (
              <option key={item} value={item}>
                {copy.access[item].label} ({projects.filter((project) => project.access === item).length})
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className={styles.srOnly}>{copy.filters.sortAria}</span>
          <select value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)}>
            <option value="curated">{copy.filters.sortCurated}</option>
            <option value="recent">{copy.filters.sortRecent}</option>
            <option value="title">{copy.filters.sortTitle}</option>
          </select>
        </label>
        <button
          type="button"
          className={`${styles.toggleButton} ${featuredOnly ? styles.toggleActive : ""}`}
          onClick={() => setFeaturedOnly((current) => !current)}
          aria-pressed={featuredOnly}
        >
          ★ {copy.filters.featured}
        </button>
        <div className={styles.layoutGroup} role="group" aria-label={copy.layout.aria}>
          <span className={styles.layoutModeLabel} aria-hidden="true">
            {copy.layout.label}: <strong>{activeLayoutLabel}</strong>
          </span>
          {([
            ["catalogue", "▥", copy.layout.catalogueFocus],
            ["balanced", "▦", copy.layout.balanced],
            ["detail", "▤", copy.layout.detailFocus],
          ] as const).map(([mode, icon, label]) => (
            <button
              key={mode}
              type="button"
              className={layoutMode === mode ? styles.layoutActive : ""}
              onClick={() => changeLayoutMode(mode)}
              aria-pressed={layoutMode === mode}
              aria-label={label}
              title={label}
            >
              <span aria-hidden="true">{icon}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          className={styles.legendButton}
          onClick={() => setShowLegend((current) => !current)}
          aria-expanded={showLegend}
        >
          {copy.filters.accessKey}
        </button>
      </div>

      {showLegend && (
        <div className={styles.legend}>
          {accessOrder.map((item) => {
            const count = projects.filter((project) => project.access === item).length;
            return (
              <div key={item} data-empty={count === 0 ? "true" : "false"}>
                <div className={styles.legendTopline}>
                  <AccessBadge access={item} locale={locale} />
                  <span>{count} {copy.header.files}</span>
                </div>
                <p>{copy.access[item].description}</p>
              </div>
            );
          })}
        </div>
      )}

      <div className={`${styles.workspace} ${styles[`workspace_${layoutMode}`]}`}>
        <aside className={styles.catalogue} aria-label={copy.catalogue.aria}>
          <div className={styles.catalogueHeader}>
            <span>{formatProjectArchiveCopy(copy.catalogue.objects, {
              shown: filteredProjects.length,
              total: projects.length,
            })}</span>
            <span className={styles.catalogueCommands}>
              {(query || access !== "all" || area !== "all" || featuredOnly) && (
                <button type="button" onClick={() => resetFilters({ focusSearch: true })}>{copy.filters.clearFilters}</button>
              )}
            </span>
          </div>
          <div ref={projectListRef} className={styles.projectList}>
            {filteredProjects.length > 0 ? filteredProjects.map((project, index) => (
              <ProjectRow
                key={project.slug}
                project={project}
                selected={project.slug === selectedProject.slug}
                onSelect={() => selectProject(project.slug)}
                onKeyDown={(event) => navigateCatalogue(event, index)}
                tabIndex={project.slug === activeCatalogueSlug ? 0 : -1}
                locale={locale}
              />
            )) : <EmptyState reset={() => resetFilters({ focusSearch: true })} locale={locale} />}
          </div>
          <div className={styles.catalogueFooter}>
            <span>{counts.open} {copy.catalogue.inspectable}</span>
            <span>•</span>
            <span>{counts.private} {copy.catalogue.protected}</span>
          </div>
        </aside>

        {filteredProjects.length === 0 && detailView === "story" ? (
          <FilteredEmptyDetail
            query={query}
            access={access}
            area={area}
            featuredOnly={featuredOnly}
            reset={() => resetFilters({ focusSearch: true })}
            locale={locale}
            detailRef={detailRef}
          />
        ) : (
          <ProjectDetail
            key={selectedProject.slug}
            project={selectedProject}
            locale={locale}
            view={detailView}
            setView={changeDetailView}
            onOpenApp={onOpenApp}
            onSelectProject={selectProjectFromMap}
            onOpenProjectDemo={openProjectDemo}
            detailRef={detailRef}
          />
        )}
      </div>
      </section>
      )}
    </div>
  );
}

export default memo(ProjectExplorer);
