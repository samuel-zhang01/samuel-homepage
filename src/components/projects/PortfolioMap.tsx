"use client";

import { getProjectOrigins } from "@/data/projectOrigins";
import ClassicSelect from "../ClassicSelect";

import {
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  accessMeta,
  isInteractiveProject,
  projectAreas,
  projects,
  type Project,
  type ProjectAccess,
  type ProjectArea,
} from "../../data/projects";
import type { Locale } from "@/lib/i18n";
import { projectText } from "@/lib/projectCopy";
import { ProjectCopy, ProjectLocaleProvider, useProjectLocale } from "./ProjectTranslationBoundary";
import { portfolioCopy } from "./copy/portfolioCopy";
import { projectNarrativeCopy } from "./copy/projectNarrativeCopy";

// This optional comparison view is lazy-loaded; narrative copy stays with its project UI.
const portfolioViewCopy = { ...projectNarrativeCopy, ...portfolioCopy };
import { ModelLineageMap } from "./ModelLineageMap";
import styles from "./PortfolioMap.module.css";

type ViewId = "timeline" | "matrix" | "tools" | "compare" | "models" | "ledger";
type ProjectStatus = Project["status"];
type TimelineSpan =
  | { kind: "dated"; start: number; end: number }
  | { kind: "ongoing" };

type Relationship = {
  sharedTools: string[];
  sharedArtifactKinds: string[];
  signals: string[];
};

const VIEWS: Array<{ id: ViewId; label: string; hint: string }> = [
  { id: "compare", label: "Compare projects", hint: "shared context and methods" },
  { id: "timeline", label: "Timeline", hint: "work across the years" },
  { id: "tools", label: "Tools", hint: "where methods appear" },
  { id: "matrix", label: "Browse by area", hint: "topics and availability" },
  { id: "models", label: "Model lineage", hint: "architecture and scale" },
  { id: "ledger", label: "Reading guide", hint: "what the views show" },
];

const AREA_COLOURS: Record<ProjectArea, string> = {
  Products: "#80402d",
  "Applied AI": "#2f6971",
  "Machine Learning": "#4e4f87",
  Research: "#6b4d78",
  Systems: "#3f654b",
  Education: "#8a6c2f",
};

const STATUS_ORDER: ProjectStatus[] = ["Active", "Shipped", "Research", "Archive"];
const STATUS_VALUES = STATUS_ORDER.filter((status) => projects.some((project) => project.status === status));
const ACCESS_VALUES = Object.keys(accessMeta) as ProjectAccess[];
const AREA_VALUES = projectAreas.filter((area) => projects.some((project) => project.area === area));

function parseTimelineSpan(label: string): TimelineSpan {
  const parts = label.match(/\d{2,4}/g)?.map(Number) ?? [];
  if (!parts.length) return { kind: "ongoing" };
  const start = parts[0];
  if (parts.length === 1) return { kind: "dated", start, end: start };
  const end = parts[1] < 100 ? Math.floor(start / 100) * 100 + parts[1] : parts[1];
  return { kind: "dated", start, end };
}

const SPANS = new Map(projects.map((project) => [project.slug, parseTimelineSpan(project.year)]));
const DATED_SPANS = [...SPANS.values()].filter((span): span is Extract<TimelineSpan, { kind: "dated" }> => (
  span.kind === "dated"
));
const MIN_YEAR = Math.min(...DATED_SPANS.map((span) => span.start));
const MAX_YEAR = Math.max(...DATED_SPANS.map((span) => span.end));
const YEAR_AXIS = Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, index) => MIN_YEAR + index);

const TOOL_ROWS = (() => {
  const index = new Map<string, Project[]>();
  projects.forEach((project) => {
    new Set(project.tools).forEach((tool) => {
      const rows = index.get(tool) ?? [];
      rows.push(project);
      index.set(tool, rows);
    });
  });
  return [...index.entries()]
    .map(([label, toolProjects]) => ({ label, projects: toolProjects }))
    .sort((left, right) => right.projects.length - left.projects.length || left.label.localeCompare(right.label));
})();

function artifactKinds(project: Project) {
  return [...new Set((project.artifacts ?? []).map((artifact) => artifact.kind))].sort();
}

function relationship(left: Project, right: Project): Relationship {
  const rightTools = new Set(right.tools);
  const sharedTools = [...new Set(left.tools.filter((tool) => rightTools.has(tool)))].sort();
  const rightArtifactKinds = new Set(artifactKinds(right));
  const sharedArtifactKinds = artifactKinds(left).filter((kind) => rightArtifactKinds.has(kind));
  const sharedOrigins = getProjectOrigins(left.slug).filter((origin) => origin.projects.includes(right.slug));
  const signals = [
    ...sharedOrigins.map((origin) => `Work context · ${origin.label}`),
    ...sharedTools.map((tool) => `Exact tool · ${tool}`),
    ...(left.area === right.area ? [`Area · ${left.area}`] : []),
    ...(left.access === right.access ? [`Access · ${accessMeta[left.access].label}`] : []),
    ...(left.status === right.status ? [`Status · ${left.status}`] : []),
    ...(isInteractiveProject(left) && isInteractiveProject(right) ? ["Demo · both declare an interactive exhibit"] : []),
    ...sharedArtifactKinds.map((kind) => `Artifact kind · ${kind}`),
  ];
  return { sharedTools, sharedArtifactKinds, signals };
}

const DEFAULT_PAIR = (() => {
  let pair: [Project, Project] = [projects[0], projects[1]];
  let maximum = -1;
  projects.forEach((left, leftIndex) => {
    projects.slice(leftIndex + 1).forEach((right) => {
      const count = relationship(left, right).signals.length;
      if (count > maximum) {
        pair = [left, right];
        maximum = count;
      }
    });
  });
  return pair;
})();

const TOTAL_DEMOS = projects.filter(isInteractiveProject).length;
const TOTAL_PROTECTED = projects.filter((project) => project.access === "proprietary").length;
const TOTAL_ARTIFACTS = projects.reduce((sum, project) => sum + (project.artifacts?.length ?? 0), 0);
const TOTAL_TOOL_ASSIGNMENTS = projects.reduce((sum, project) => sum + project.tools.length, 0);

function timelineSort(left: Project, right: Project) {
  const leftSpan = SPANS.get(left.slug) ?? { kind: "ongoing" as const };
  const rightSpan = SPANS.get(right.slug) ?? { kind: "ongoing" as const };
  const leftEnd = leftSpan.kind === "ongoing" ? MAX_YEAR + 1 : leftSpan.end;
  const rightEnd = rightSpan.kind === "ongoing" ? MAX_YEAR + 1 : rightSpan.end;
  const leftStart = leftSpan.kind === "ongoing" ? MAX_YEAR + 1 : leftSpan.start;
  const rightStart = rightSpan.kind === "ongoing" ? MAX_YEAR + 1 : rightSpan.start;
  return rightEnd - leftEnd || rightStart - leftStart || left.title.localeCompare(right.title);
}

function TimelineView({
  onPreview,
  onOpen,
}: {
  onPreview: (project: Project) => void;
  onOpen: (project: Project) => void;
}) {
  const [yearFilter, setYearFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | ProjectStatus>("all");
  const [accessFilter, setAccessFilter] = useState<"all" | ProjectAccess>("all");
  const [rovingSlug, setRovingSlug] = useState<string | null>(null);
  const rowRefs = useRef(new Map<string, HTMLButtonElement>());

  const filtered = useMemo(() => projects
    .filter((project) => {
      const span = SPANS.get(project.slug) ?? { kind: "ongoing" as const };
      const matchesYear = yearFilter === "all"
        || (yearFilter === "ongoing" && span.kind === "ongoing")
        || (span.kind === "dated" && Number(yearFilter) >= span.start && Number(yearFilter) <= span.end);
      return matchesYear
        && (statusFilter === "all" || project.status === statusFilter)
        && (accessFilter === "all" || project.access === accessFilter);
    })
    .sort(timelineSort), [accessFilter, statusFilter, yearFilter]);

  const activeSlug = rovingSlug && filtered.some((project) => project.slug === rovingSlug)
    ? rovingSlug
    : filtered[0]?.slug ?? null;

  useEffect(() => {
    if (rovingSlug !== activeSlug) setRovingSlug(activeSlug);
  }, [activeSlug, rovingSlug]);

  function moveFocus(target: Project | undefined) {
    if (!target) return;
    setRovingSlug(target.slug);
    onPreview(target);
    rowRefs.current.get(target.slug)?.focus();
    rowRefs.current.get(target.slug)?.scrollIntoView({ block: "nearest" });
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>, project: Project) {
    const index = filtered.findIndex((item) => item.slug === project.slug);
    let target: Project | undefined;
    switch (event.key) {
      case "ArrowUp":
        target = filtered[index - 1];
        break;
      case "ArrowDown":
        target = filtered[index + 1];
        break;
      case "Home":
        target = filtered[0];
        break;
      case "End":
        target = filtered.at(-1);
        break;
      default:
        return;
    }
    event.preventDefault();
    moveFocus(target);
  }

  return (
    <ProjectCopy copy={portfolioViewCopy}><div className={styles.timelineView}>
      <section className={styles.filterDeck} aria-labelledby="portfolio-timeline-heading">
        <div>
          <span>EXPLORE BY YEAR</span>
          <strong id="portfolio-timeline-heading">When the work happened</strong>
          <p>Choose a year to find the projects active during that period. Work without a fixed date appears in its own ongoing column.</p>
        </div>
        <label><span>Year</span><ClassicSelect value={yearFilter} onChange={(event) => setYearFilter(event.target.value)}><option value="all">All years</option>{YEAR_AXIS.map((year) => <option key={year} value={year}>{year}</option>)}<option value="ongoing">Ongoing work</option></ClassicSelect></label>
        <label><span>Status</span><ClassicSelect value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "all" | ProjectStatus)}><option value="all">All statuses</option>{STATUS_VALUES.map((status) => <option key={status} value={status}>{status}</option>)}</ClassicSelect></label>
        <label><span>Access</span><ClassicSelect value={accessFilter} onChange={(event) => setAccessFilter(event.target.value as "all" | ProjectAccess)}><option value="all">All access levels</option>{ACCESS_VALUES.map((access) => <option key={access} value={access}>{accessMeta[access].label}</option>)}</ClassicSelect></label>
        <output aria-live="polite"><strong>{filtered.length}</strong><span>of {projects.length} records</span></output>
      </section>

      <section className={styles.timelinePanel} aria-label="Project chronology">
        <div className={styles.panelHeading}><span>YR</span><strong>PROJECT TIMELINE</strong><em>{MIN_YEAR}—{MAX_YEAR} + ONGOING</em></div>
        <p className={styles.keyboardHelp}><strong>Keyboard:</strong> Tab enters the project rows once; use ↑/↓ or Home/End, then Enter to open the focused project.</p>
        <div className={styles.timelineAxis} aria-hidden="true">
          <span>PROJECT</span>
          <div style={{ "--year-count": YEAR_AXIS.length + 1 } as CSSProperties}>{YEAR_AXIS.map((year) => <b key={year}>{year}</b>)}<b>ONGOING</b></div>
        </div>
        <div className={styles.timelineRows}>
          {filtered.map((project) => {
            const span = SPANS.get(project.slug) ?? { kind: "ongoing" as const };
            const startColumn = span.kind === "ongoing" ? YEAR_AXIS.length + 1 : span.start - MIN_YEAR + 1;
            const columnSpan = span.kind === "ongoing" ? 1 : span.end - span.start + 1;
            return (
              <button
                type="button"
                key={project.slug}
                ref={(element) => {
                  if (element) rowRefs.current.set(project.slug, element);
                  else rowRefs.current.delete(project.slug);
                }}
                tabIndex={project.slug === activeSlug ? 0 : -1}
                data-access={project.access}
                data-status={project.status.toLowerCase()}
                aria-label={`${project.title}; ${project.year}; ${project.area}; ${accessMeta[project.access].label}; ${project.status}`}
                onFocus={() => { setRovingSlug(project.slug); onPreview(project); }}
                onKeyDown={(event) => handleKeyDown(event, project)}
                onClick={() => onOpen(project)}
              >
                <span className={styles.timelineIdentity} style={{ "--area-colour": AREA_COLOURS[project.area] } as CSSProperties}>
                  <small>{project.area} · {project.year}</small><strong>{project.shortTitle ?? project.title}</strong><i>{accessMeta[project.access].short} · {project.status}{isInteractiveProject(project) ? " · DEMO" : ""}</i>
                </span>
                <span className={styles.timelineGraph} style={{ "--year-count": YEAR_AXIS.length + 1 } as CSSProperties} aria-hidden="true">
                  <i style={{ "--start-column": startColumn, "--column-span": columnSpan, "--area-colour": AREA_COLOURS[project.area] } as CSSProperties}><b>{project.year}</b></i>
                </span>
                <span className={styles.openGlyph} aria-hidden="true">›</span>
              </button>
            );
          })}
          {!filtered.length && <div className={styles.emptyState}><strong>No matching project span</strong><p>Change one filter; explore another part of the collection.</p></div>}
        </div>
      </section>
    </div></ProjectCopy>
  );
}

function MatrixView({
  onPreview,
  onOpen,
}: {
  onPreview: (project: Project) => void;
  onOpen: (project: Project) => void;
}) {
  const locale = useProjectLocale();
  const t = (source: string) => projectText(locale, portfolioViewCopy, source);
  const [focus, setFocus] = useState<{ area: ProjectArea; access?: ProjectAccess; demo?: true }>({ area: AREA_VALUES[0] });
  const focusedProjects = projects.filter((project) => (
    project.area === focus.area
    && (!focus.access || project.access === focus.access)
    && (!focus.demo || isInteractiveProject(project))
  ));
  const focusLabel = focus.demo
    ? `${t(focus.area)} · ${t("Interactive demos")}`
    : focus.access
      ? `${t(focus.area)} · ${t(accessMeta[focus.access].label)}`
      : `${t(focus.area)} · ${t("All access levels")}`;

  function cellButton(count: number, nextFocus: typeof focus, label: string) {
    const selected = nextFocus.area === focus.area && nextFocus.access === focus.access && nextFocus.demo === focus.demo;
    return count > 0 ? (
      <button type="button" aria-label={`${label}: ${count} projects`} aria-pressed={selected} onClick={() => setFocus(nextFocus)}>{count}</button>
    ) : <span aria-label={`${label}: 0 projects`}>0</span>;
  }

  return (
    <ProjectCopy copy={portfolioViewCopy}><div className={styles.matrixView}>
      <section className={styles.matrixIntro}>
        <div><span>AVAILABILITY</span><strong>Access level</strong><p>Each project appears in one availability category.</p></div>
        <div><span>TRY THE WORK</span><strong>Interactive demo</strong><p>Interactive demos are marked separately so you can find projects to try.</p></div>
        <div><span>COLLECTION TOTAL</span><strong>{ACCESS_VALUES.map((access) => projects.filter((project) => project.access === access).length).reduce((sum, count) => sum + count, 0)} = {projects.length}</strong><p>The four availability categories together cover the collection.</p></div>
      </section>

      <div className={styles.matrixWorkspace}>
        <section className={styles.matrixPanel}>
          <div className={styles.panelHeading}><span>{AREA_VALUES.length}×{ACCESS_VALUES.length + 1}</span><strong>TOPICS × AVAILABILITY</strong><em>PROJECT COUNTS</em></div>
          <p className={styles.tableHelp}>The table scrolls horizontally when needed. Focus it and use ←/→, Shift + mouse wheel or a horizontal trackpad gesture.</p>
          <div className={styles.tableScroll} role="region" aria-label="Scrollable area by access and demo matrix" tabIndex={0}>
            <table>
              <caption>Project counts by declared area, exclusive access level and overlapping demo flag</caption>
              <thead><tr><th scope="col">Area</th>{ACCESS_VALUES.map((access) => <th scope="col" key={access}><span>{accessMeta[access].short}</span>{accessMeta[access].label}</th>)}<th scope="col"><span>DEMO</span>Interactive</th><th scope="col">Total</th></tr></thead>
              <tbody>
                {AREA_VALUES.map((area) => {
                  const areaProjects = projects.filter((project) => project.area === area);
                  return (
                    <tr key={area}>
                      <th scope="row"><i style={{ background: AREA_COLOURS[area] }} />{area}</th>
                      {ACCESS_VALUES.map((access) => {
                        const count = areaProjects.filter((project) => project.access === access).length;
                        return <td key={access}>{cellButton(count, { area, access }, `${t(area)}, ${t(accessMeta[access].label)}`)}</td>;
                      })}
                      <td className={styles.demoColumn}>{cellButton(areaProjects.filter(isInteractiveProject).length, { area, demo: true }, `${t(area)}, ${t("Interactive")}`)}</td>
                      <td>{cellButton(areaProjects.length, { area }, `${t(area)}, ${t("Total")}`)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot><tr><th scope="row">All records</th>{ACCESS_VALUES.map((access) => <td key={access}>{projects.filter((project) => project.access === access).length}</td>)}<td>{TOTAL_DEMOS}</td><td>{projects.length}</td></tr></tfoot>
            </table>
          </div>
        </section>

        <section className={styles.cellInspector} aria-live="polite">
          <div className={styles.panelHeading}><span>SEL</span><strong>{focusLabel.toUpperCase()}</strong><em>{focusedProjects.length} RECORDS</em></div>
          <div className={styles.focusedProjects}>
            {focusedProjects.map((project) => (
              <button type="button" key={project.slug} onFocus={() => onPreview(project)} onMouseEnter={() => onPreview(project)} onClick={() => onOpen(project)}>
                <span style={{ "--area-colour": AREA_COLOURS[project.area] } as CSSProperties}>{project.shortTitle ?? project.title}</span>
                <small>{project.year} · {project.status} · {accessMeta[project.access].short}</small>
                <b>{isInteractiveProject(project) ? "DEMO" : "FILE"}</b>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div></ProjectCopy>
  );
}

function ToolIndexView({
  onPreview,
  onOpen,
}: {
  onPreview: (project: Project) => void;
  onOpen: (project: Project) => void;
}) {
  const locale = useProjectLocale();
  const t = (source: string) => projectText(locale, portfolioViewCopy, source);
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [selectedTool, setSelectedTool] = useState(TOOL_ROWS[0]?.label ?? "");
  const matching = TOOL_ROWS.filter((row) => `${row.label} ${t(row.label)}`.toLocaleLowerCase(locale).includes(query.trim().toLocaleLowerCase(locale)));
  const visible = query.trim() || showAll ? matching : matching.slice(0, 18);
  const selected = visible.find((row) => row.label === selectedTool) ?? visible[0];
  const maximum = TOOL_ROWS[0]?.projects.length ?? 1;
  const repeated = TOOL_ROWS.filter((row) => row.projects.length > 1).length;
  const selectedAreas = AREA_VALUES
    .map((area) => ({ area, count: selected?.projects.filter((project) => project.area === area).length ?? 0 }))
    .filter((row) => row.count > 0);

  return (
    <ProjectCopy copy={portfolioViewCopy}><div className={styles.toolsView}>
      <section className={styles.toolSummary}>
        <div><span>TOOLS AND METHODS</span><strong>{TOOL_ROWS.length}</strong><small>No alias merging</small></div>
        <div><span>PROJECT–TOOL LINKS</span><strong>{TOTAL_TOOL_ASSIGNMENTS}</strong><small>Tools listed across all projects</small></div>
        <div><span>USED ACROSS PROJECTS</span><strong>{repeated}</strong><small>Listed by at least two projects</small></div>
        <label><span>Find a tool or method</span><input type="search" value={query} placeholder="e.g. PyTorch" onChange={(event) => setQuery(event.target.value)} /></label>
      </section>

      <div className={styles.toolWorkspace}>
        <section className={styles.toolIndex}>
          <div className={styles.panelHeading}><span>IDX</span><strong>TOOLS ACROSS THE COLLECTION</strong><em>{matching.length} MATCHING LABELS</em></div>
          <p className={styles.toolBoundary}>Explore where a tool or method appears. Specific versions and combinations, such as “React 19” and “React + TypeScript”, retain separate entries.</p>
          <div className={styles.toolRows}>
            {visible.map((row) => (
              <button type="button" key={row.label} aria-pressed={selected?.label === row.label} onClick={() => setSelectedTool(row.label)}>
                <span>{row.label}</span>
                <i><b style={{ width: `${Math.max(4, (row.projects.length / maximum) * 100)}%` }} /></i>
                <strong>{row.projects.length}</strong>
              </button>
            ))}
            {!visible.length && <div className={styles.emptyState}><strong>No exact tool label matches “{query}”</strong><p>Try a shorter literal fragment; the index does not infer synonyms.</p></div>}
          </div>
          {!query.trim() && TOOL_ROWS.length > 18 && <button type="button" className={styles.showAll} onClick={() => setShowAll((current) => !current)}>{showAll ? "Show the 18 most-declared labels" : `Show all ${TOOL_ROWS.length} exact labels`}</button>}
        </section>

        <aside className={styles.toolInspector} aria-live="polite">
          <div className={styles.panelHeading}><span>TOOL</span><strong>{selected ? t(selected.label) : "—"}</strong><em>{selected?.projects.length ?? 0} RECORDS</em></div>
          {selected ? (
            <>
              <dl className={styles.toolAreaMix}>
                {selectedAreas.map(({ area, count }) => <div key={area}><dt><i style={{ background: AREA_COLOURS[area] }} />{area}</dt><dd>{count}</dd></div>)}
              </dl>
              <div className={styles.toolProjects}>
                {selected.projects.map((project) => (
                  <button type="button" key={project.slug} onFocus={() => onPreview(project)} onMouseEnter={() => onPreview(project)} onClick={() => onOpen(project)}>
                    <span>{project.shortTitle ?? project.title}</span><small>{project.area} · {project.year}</small><b>›</b>
                  </button>
                ))}
              </div>
              <p className={styles.toolNote}>The count shows how many projects list this tool. Open a project to see what it contributed and how it was used.</p>
            </>
          ) : null}
        </aside>
      </div>
    </div></ProjectCopy>
  );
}

function ProjectCompareCard({
  label,
  project,
  locale,
  onOpen,
}: {
  label: string;
  project: Project;
  locale: Locale;
  onOpen: () => void;
}) {
  return (
    <ProjectCopy copy={portfolioViewCopy}><article className={styles.compareCard} style={{ "--area-colour": AREA_COLOURS[project.area] } as CSSProperties}>
      <span>{label} · {project.area}</span>
      <h3>{project.shortTitle ?? project.title}</h3>
      <p lang={locale}>{projectText(locale, portfolioViewCopy, project.summary)}</p>
      <dl>
        <div><dt>Year</dt><dd>{project.year}</dd></div>
        <div><dt>Status</dt><dd>{project.status}</dd></div>
        <div><dt>Access</dt><dd>{accessMeta[project.access].label}</dd></div>
        <div><dt>Demo</dt><dd>{isInteractiveProject(project) ? "Available" : "No"}</dd></div>
        <div><dt>Artifacts</dt><dd>{project.artifacts?.length ?? 0}</dd></div>
      </dl>
      <button type="button" onClick={onOpen}>Open {label}</button>
    </article></ProjectCopy>
  );
}

function ComparisonView({
  onPreview,
  onOpen,
  locale,
}: {
  onPreview: (project: Project) => void;
  onOpen: (project: Project) => void;
  locale: Locale;
}) {
  const [leftSlug, setLeftSlug] = useState(DEFAULT_PAIR[0].slug);
  const [rightSlug, setRightSlug] = useState(DEFAULT_PAIR[1].slug);
  const left = projects.find((project) => project.slug === leftSlug) ?? projects[0];
  const right = projects.find((project) => project.slug === rightSlug) ?? projects[1];
  const overlap = relationship(left, right);
  const rightTools = new Set(right.tools);
  const leftTools = new Set(left.tools);
  const leftOnly = [...new Set(left.tools.filter((tool) => !rightTools.has(tool)))];
  const rightOnly = [...new Set(right.tools.filter((tool) => !leftTools.has(tool)))];
  const neighbours = projects
    .filter((project) => project.slug !== left.slug)
    .map((project) => ({ project, overlap: relationship(left, project) }))
    .sort((a, b) => b.overlap.signals.length - a.overlap.signals.length || a.project.title.localeCompare(b.project.title))
    .slice(0, 6);

  function chooseLeft(slug: string) {
    setLeftSlug(slug);
    if (slug === rightSlug) setRightSlug(projects.find((project) => project.slug !== slug)?.slug ?? rightSlug);
    onPreview(projects.find((project) => project.slug === slug) ?? left);
  }

  function chooseRight(slug: string) {
    setRightSlug(slug);
    if (slug === leftSlug) setLeftSlug(projects.find((project) => project.slug !== slug)?.slug ?? leftSlug);
    onPreview(projects.find((project) => project.slug === slug) ?? right);
  }

  return (
    <ProjectCopy copy={portfolioViewCopy}><div className={styles.compareView}>
      <section className={styles.compareSelectors}>
        <div><span>PROJECT A</span><ClassicSelect aria-label="Comparison project A" value={left.slug} onChange={(event) => chooseLeft(event.target.value)}>{projects.map((project) => <option key={project.slug} value={project.slug}>{project.title}</option>)}</ClassicSelect></div>
        <div className={styles.overlapDial}><span>SHARED CONNECTIONS</span><strong>{overlap.signals.length}</strong><small>contexts, tools and project features</small></div>
        <div><span>PROJECT B</span><ClassicSelect aria-label="Comparison project B" value={right.slug} onChange={(event) => chooseRight(event.target.value)}>{projects.map((project) => <option key={project.slug} value={project.slug}>{project.title}</option>)}</ClassicSelect></div>
      </section>

      <div className={styles.compareCards}>
        <ProjectCompareCard label="A" project={left} locale={locale} onOpen={() => onOpen(left)} />
        <ProjectCompareCard label="B" project={right} locale={locale} onOpen={() => onOpen(right)} />
      </div>

      <div className={styles.relationshipWorkspace}>
        <section className={styles.signalPanel}>
          <div className={styles.panelHeading}><span>=</span><strong>WHAT THESE PROJECTS SHARE</strong><em>{overlap.signals.length} TOTAL</em></div>
          {overlap.signals.length ? <ul>{overlap.signals.map((signal) => <li key={signal}><span>✓</span>{signal}</li>)}</ul> : <div className={styles.emptyState}><strong>Different project contexts</strong><p>These projects have different contexts and methods. Select another pair to explore their connections.</p></div>}
          <div className={styles.toolDelta}>
            <section><span>A ONLY · {leftOnly.length}</span><div>{leftOnly.map((tool) => <i key={tool}>{tool}</i>)}</div></section>
            <section><span>SHARED · {overlap.sharedTools.length}</span><div>{overlap.sharedTools.map((tool) => <i key={tool}>{tool}</i>)}</div></section>
            <section><span>B ONLY · {rightOnly.length}</span><div>{rightOnly.map((tool) => <i key={tool}>{tool}</i>)}</div></section>
          </div>
        </section>

        <aside className={styles.neighbourPanel}>
          <div className={styles.panelHeading}><span>REL</span><strong>RELATED TO PROJECT A</strong><em>TOP 6</em></div>
          <p>Projects with more shared contexts, tools and features appear first. Equal counts are ordered by title.</p>
          <div>
            {neighbours.map(({ project, overlap: neighbourOverlap }) => (
              <button type="button" key={project.slug} aria-pressed={project.slug === right.slug} onFocus={() => onPreview(project)} onClick={() => { setRightSlug(project.slug); onPreview(project); }}>
                <span>{project.shortTitle ?? project.title}</span><small>{neighbourOverlap.sharedTools.length} shared tools · {neighbourOverlap.signals.length} signals</small><b>{neighbourOverlap.signals.length}</b>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div></ProjectCopy>
  );
}

function LedgerView() {
  return (
    <ProjectCopy copy={portfolioViewCopy}><div className={styles.ledgerView}>
      <section className={styles.ledgerHero}>
        <div><span>FIND A WAY INTO THE WORK</span><h3>Six views, one connected collection</h3><p>Compare methods, follow work through time, or start with a tool you know. Each view opens the same project documents and interactive demonstrations.</p></div>
        <dl><div><dt>Projects</dt><dd>{projects.length}</dd></div><div><dt>Interactive demos</dt><dd>{TOTAL_DEMOS}</dd></div><div><dt>Materials to explore</dt><dd>{TOTAL_ARTIFACTS}</dd></div></dl>
      </section>
      <div className={styles.definitionGrid}>
        <section><span>01 · COMPARE</span><strong>Find a shared thread</strong><p>Select two projects to compare their work context, tools and outputs. The connection count describes shared features; it does not rank project quality.</p></section>
        <section><span>02 · TIMELINE</span><strong>Follow the years</strong><p>A project spanning 2023–26 appears in each of those four years. Ongoing work without a fixed date has its own column.</p></section>
        <section><span>03 · TOOLS</span><strong>Start from a familiar method</strong><p>Choose a tool to see the projects that use it and the areas they connect. Versions and combinations retain separate entries.</p></section>
        <section><span>04 · AREAS</span><strong>Find something to open</strong><p>Browse topics by availability. The separate demo column highlights work you can explore interactively.</p></section>
        <section><span>05 · MODELS</span><strong>Understand architecture choices</strong><p>Follow model families, their components and the scale of the experiments. Open a project for the task, results and limitations.</p></section>
        <section><span>06 · PROJECTS</span><strong>Read the work in context</strong><p>Each project connects its purpose, contribution, demonstrations and supporting material. Those details explain more than a count of tools or connections.</p></section>
      </div>
    </div></ProjectCopy>
  );
}

function ProjectInspector({
  project,
  locale,
  onOpen,
}: {
  project: Project;
  locale: Locale;
  onOpen: (project: Project) => void;
}) {
  return (
    <ProjectCopy copy={portfolioViewCopy}><aside className={styles.projectInspector} aria-live="polite">
      <div className={styles.inspectorHeading}><span>SELECTED PROJECT</span><b>{project.year}</b></div>
      <div className={styles.inspectorTitle} style={{ "--area-colour": AREA_COLOURS[project.area] } as CSSProperties}>
        <span>{project.area}</span><h2>{project.shortTitle ?? project.title}</h2><p>{project.eyebrow}</p>
      </div>
      <div className={styles.inspectorFlags}>
        <span data-kind="status">{project.status}</span><span data-kind="access">{accessMeta[project.access].label}</span>{isInteractiveProject(project) && <span data-kind="demo">Interactive</span>}{project.artifacts?.length ? <span data-kind="artifact">{project.artifacts.length} supporting materials</span> : null}
      </div>
      <p className={styles.inspectorSummary} lang={locale}>{projectText(locale, portfolioViewCopy, project.summary)}</p>
      <section className={styles.inspectorTools}><span>TOOLS AND METHODS · {project.tools.length}</span><div>{project.tools.map((tool) => <i key={tool}>{tool}</i>)}</div></section>
      <button type="button" className={styles.openProject} onClick={() => onOpen(project)}>Open project <span aria-hidden="true">›</span></button>
      <small className={styles.inspectorBoundary}>Open the project to explore its purpose, interactive demo and supporting material.</small>
    </aside></ProjectCopy>
  );
}

export function PortfolioMap({
  onSelectProject,
  initialSlug,
  locale = "en-GB",
}: {
  onSelectProject: (slug: string) => void;
  initialSlug?: string;
  locale?: Locale;
}) {
  const [view, setView] = useState<ViewId>("compare");
  const [tabStop, setTabStop] = useState<ViewId>("compare");
  const viewId = useId();
  const viewTabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [selectedSlug, setSelectedSlug] = useState(() => (
    projects.some((project) => project.slug === initialSlug) ? initialSlug! : projects[0]?.slug ?? ""
  ));
  const selectedProject = projects.find((project) => project.slug === selectedSlug) ?? projects[0];

  function preview(project: Project) {
    setSelectedSlug(project.slug);
  }

  function open(project: Project) {
    setSelectedSlug(project.slug);
    onSelectProject(project.slug);
  }

  function navigateViews(event: ReactKeyboardEvent<HTMLButtonElement>, currentIndex: number) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const nextIndex = event.key === "Home"
      ? 0
      : event.key === "End"
        ? VIEWS.length - 1
        : (currentIndex + (event.key === "ArrowRight" ? 1 : -1) + VIEWS.length) % VIEWS.length;
    setTabStop(VIEWS[nextIndex].id);
    viewTabRefs.current[nextIndex]?.focus();
  }

  return (
    <ProjectLocaleProvider locale={locale}><ProjectCopy copy={portfolioViewCopy}><section className={styles.portfolioMap} aria-label="Portfolio map" lang="en-GB">
      <header className={styles.mapHeader}>
        <div><span>SAMUEL / PROJECT COLLECTION</span><h2>Explore the collection</h2><p>Compare projects, follow their timeline and explore the methods that connect them.</p></div>
        <dl aria-label="Portfolio catalogue summary">
          <div><dt>Files</dt><dd>{projects.length}</dd></div>
          <div><dt>Interactive</dt><dd>{TOTAL_DEMOS}</dd></div>
          <div><dt>Protected</dt><dd>{TOTAL_PROTECTED}</dd></div>
          <div><dt>Exact tools</dt><dd>{TOOL_ROWS.length}</dd></div>
          <div><dt>Artifacts</dt><dd>{TOTAL_ARTIFACTS}</dd></div>
        </dl>
      </header>

      <div className={styles.viewTabs} role="tablist" aria-label="Portfolio map views">
        {VIEWS.map((item, index) => (
          <button
            type="button"
            key={item.id}
            ref={(element) => { viewTabRefs.current[index] = element; }}
            role="tab"
            id={`${viewId}-${item.id}-tab`}
            aria-selected={view === item.id}
            aria-controls={view === item.id ? `${viewId}-${item.id}-panel` : undefined}
            tabIndex={tabStop === item.id ? 0 : -1}
            onFocus={() => setTabStop(item.id)}
            onClick={() => { setView(item.id); setTabStop(item.id); }}
            onKeyDown={(event) => navigateViews(event, index)}
          >
            <span>0{index + 1}</span><strong>{item.label}</strong><small>{item.hint}</small>
          </button>
        ))}
      </div>

      <div className={styles.mapWorkspace}>
        <div
          className={styles.mapCanvas}
          role="tabpanel"
          id={`${viewId}-${view}-panel`}
          aria-labelledby={`${viewId}-${view}-tab`}
          tabIndex={0}
        >
          {view === "timeline" && <TimelineView onPreview={preview} onOpen={open} />}
          {view === "matrix" && <MatrixView onPreview={preview} onOpen={open} />}
          {view === "tools" && <ToolIndexView onPreview={preview} onOpen={open} />}
          {view === "compare" && <ComparisonView onPreview={preview} onOpen={open} locale={locale} />}
          {view === "models" && <ModelLineageMap initialSlug={selectedProject.slug} onSelectProject={onSelectProject} />}
          {view === "ledger" && <LedgerView />}
        </div>
        <ProjectInspector project={selectedProject} locale={locale} onOpen={open} />
      </div>

      <footer className={styles.mapFooter}>
        <span>{projects.length} projects connected through work, methods and learning.</span>
        <span>Choose a project to explore its contribution</span>
      </footer>
    </section></ProjectCopy></ProjectLocaleProvider>
  );
}

export default PortfolioMap;
