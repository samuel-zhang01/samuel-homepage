"use client";

import { parseProjectSearchIndex } from "@/lib/projectSearch";
import { getProjectText } from "@/lib/projectNarrative";
import dynamic from "next/dynamic";
import { memo, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import ClassicSelect from "../ClassicSelect";
import { projectAreas, projects, type Project } from "@/data/projects";
import { getProjectOrigins } from "@/data/projectOrigins";
import type { Locale } from "@/lib/i18n";
import { projectText, type ProjectCopyTable } from "@/lib/projectCopy";
import { ProjectLocaleProvider } from "./ProjectTranslationBoundary";
import { getProjectArchiveCopy } from "./projectArchiveI18n";
import { ProjectArtwork } from "./ProjectArtwork";
import styles from "./ProjectLibrary.module.css";

const KnowledgeGraph = dynamic(() => import("./KnowledgeGraph").then((module) => module.KnowledgeGraph));
const ProjectDocument = dynamic(() => import("./ProjectDocument"));
type View = "map" | "guided" | "files";
type SystemApp = NonNullable<Project["systemApp"]> | "sidequest";
const copy = {
  "Projects": ["项目", "專案"],
  "Work in software, science and product design.": ["软件、科学与产品设计作品。", "軟體、科學與產品設計作品。"],
  "Browse the files. Take a closer look.": ["浏览项目，深入了解。", "瀏覽專案，深入瞭解。"],
  "Knowledge graph": ["知识图谱", "知識圖譜"], "Selected work": ["精选作品", "精選作品"], "All projects": ["全部项目", "全部專案"],
  "Project views": ["项目视图", "專案檢視"], "Search projects": ["搜索项目", "搜尋專案"],
  "Search titles, methods or experience…": ["搜索名称、方法或经历…", "搜尋名稱、方法或經歷…"],
  "Searching project text…": ["正在搜索项目正文…", "正在搜尋專案內文…"],
  "Detailed search is unavailable. Showing matches in project descriptions.": ["暂时无法搜索全文，当前显示项目简介中的匹配结果。", "暫時無法搜尋全文，目前顯示專案簡介中的符合結果。"],
  "Discipline": ["领域", "領域"], "All disciplines": ["全部领域", "全部領域"],
  "No projects match.": ["没有匹配的项目。", "沒有符合條件的專案。"], "Clear filters": ["清除筛选", "清除篩選"],
  "{count} projects": ["{count} 个项目", "{count} 個專案"], "1 project": ["1 个项目", "1 個專案"],
  "Project details": ["项目详情", "專案詳細資料"], "Project list": ["项目列表", "專案清單"],
  "Select a project to read its story and explore the work.": ["选择项目，阅读背景并探索作品。", "選擇專案，閱讀背景並探索作品。"],
  "Try another search or clear the filters.": ["尝试其他关键词，或清除筛选条件。", "嘗試其他關鍵字，或清除篩選條件。"],
  "Building on the run": ["奔跑中的创作", "奔跑中的創作"],
  "A 44 km relay, a voice-built running app and a second-place finish.": ["44 公里接力赛、语音构建的跑步应用，以及第二名的成绩。", "44 公里接力賽、語音打造的跑步應用程式，以及第二名的成績。"],
  "Read the RUN/HACK story": ["阅读 RUN/HACK 的故事", "閱讀 RUN/HACK 的故事"],
  "Ongoing": ["持续进行", "持續進行"],
} satisfies ProjectCopyTable;

const fold = (text: string) => text.normalize("NFKD").replace(/\p{M}/gu, "").toLocaleLowerCase();
function viewFromAddress(): View {
  const view = new URL(window.location.href).searchParams.get("view");
  return view === "guided" ? "guided" : view === "files" || view === "list" ? "files" : "map";
}

function ProjectExplorer({ locale = "en-GB", active = true, onOpenApp }: {
  locale?: Locale; active?: boolean; onOpenApp: (id: SystemApp) => void;
}) {
  const t = (source: string) => projectText(locale, copy, source);
  const archiveCopy = getProjectArchiveCopy(locale);
  const [view, setView] = useState<View>("map");
  const [node, setNode] = useState<string | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [area, setArea] = useState("all");
  const [searchIndexes, setSearchIndexes] = useState<Partial<Record<Locale, Record<string, string>>>>({});
  const [indexLoading, setIndexLoading] = useState(false);
  const [indexError, setIndexError] = useState(false);
  const needIndex = query.trim().length > 0 && !searchIndexes[locale];
  useEffect(() => {
    if (!needIndex) { setIndexLoading(false); return; }
    const controller = new AbortController();
    setIndexLoading(true); setIndexError(false);
    fetch(`/search/project-text-${locale.toLowerCase()}.json`, { signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error("Search unavailable"); return response.json(); })
      .then((index: unknown) => {
        const parsed = parseProjectSearchIndex(index, projects.map(project => project.slug));
        const documents = Object.fromEntries([...parsed].map(([slug, document]) => [slug, document.search]));
        setSearchIndexes(current => ({ ...current, [locale]: documents }));
      })
      .catch(() => { if (!controller.signal.aborted) setIndexError(true); })
      .finally(() => { if (!controller.signal.aborted) setIndexLoading(false); });
    return () => controller.abort();
  }, [locale, needIndex]);
  const [mapVisited, setMapVisited] = useState(true);
  const [narrow, setNarrow] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const id = useId();
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new ResizeObserver(() => setNarrow(root.clientWidth <= 760));
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const updateAddress = (values: Record<string, string | null>, replace = false) => {
    const url = new URL(window.location.href);
    url.searchParams.delete("project");
    for (const [key, value] of Object.entries(values)) {
      if (value) url.searchParams.set(key, value); else url.searchParams.delete(key);
    }
    const address = `${url.pathname}${url.search}`;
    if (`${window.location.pathname}${window.location.search}` !== address) {
      window.history[replace ? "replaceState" : "pushState"](window.history.state, "", address);
    }
    window.dispatchEvent(new Event("samuel-project-route-change"));
  };
  useEffect(() => {
    const sync = (event?: Event) => {
      if (!/\/projects\/?$/.test(window.location.pathname)) return;
      const url = new URL(window.location.href);
      if (url.searchParams.has("project")) return;
      const nextView = viewFromAddress();
      const selected = url.searchParams.get("selected");
      const discipline = url.searchParams.get("area");
      setView(nextView); setNode(url.searchParams.get("node"));
      setSelectedSlug(projects.some(project => project.slug === selected) ? selected : null);
      setQuery(url.searchParams.get("q") ?? "");
      setArea(projectAreas.some(value => value === discipline) ? discipline! : "all");
      if (nextView === "map") setMapVisited(true);
      if (event?.type === "popstate") requestAnimationFrame(() => {
        if (!rootRef.current || rootRef.current.clientWidth > 760 || nextView === "map") return;
        if (detailRef.current?.getClientRects().length) detailRef.current.focus({ preventScroll: true });
        else listRef.current?.querySelector<HTMLButtonElement>('button[aria-current="true"]')?.focus({ preventScroll: true });
      });
    };
    sync();
    window.addEventListener("popstate", sync);
    window.addEventListener("samuel-project-graph", sync);
    return () => { window.removeEventListener("popstate", sync); window.removeEventListener("samuel-project-graph", sync); };
  }, []);
  const chooseView = (next: View) => {
    setView(next);
    const keepSelection = next !== "guided" || projects.some(project => project.slug === selectedSlug && project.featured);
    if (!keepSelection) setSelectedSlug(null);
    if (next === "map") setMapVisited(true);
    updateAddress({ view: next, ...(!keepSelection ? { selected: null } : {}) });
  };
  useEffect(() => {
    const shortcut = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey || event.isComposing || event.defaultPrevented) return;
      const target = event.target;
      if (target instanceof HTMLElement && (target.matches("input,textarea,select") || target.isContentEditable)) return;
      if (!rootRef.current?.closest(".mac-window")?.classList.contains("is-active")) return;
      event.preventDefault(); setView("files"); setSelectedSlug(null);
      const url = new URL(window.location.href);
      url.searchParams.delete("project"); url.searchParams.delete("selected"); url.searchParams.set("view", "files");
      window.history.pushState(window.history.state, "", `${url.pathname}${url.search}`);
      window.dispatchEvent(new Event("samuel-project-route-change"));
      requestAnimationFrame(() => searchRef.current?.focus());
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);

  const filtered = useMemo(() => {
    const words = fold(query).split(/\s+/).filter(Boolean);
    return projects.filter(project => (view !== "guided" || project.featured) && (area === "all" || project.area === area) && words.every(word => fold([
      project.title, project.shortTitle, project.summary, getProjectText(locale, project.title), getProjectText(locale, project.summary),
      searchIndexes[locale]?.[project.slug] ?? "", project.detail, getProjectText(locale, project.detail), project.year, ...project.tools, ...project.tools.map(tool => getProjectText(locale, tool)), ...getProjectOrigins(project.slug).flatMap(origin => [origin.label, origin.context, getProjectText(locale, origin.label), getProjectText(locale, origin.context)]),
    ].join(" ")).includes(word)));
  }, [query, area, locale, searchIndexes, view]);
  const orderedProjects = view === "guided" ? filtered : projectAreas.flatMap(value => filtered.filter(project => project.area === value));
  const selectedProject = orderedProjects.find(project => project.slug === selectedSlug) ?? orderedProjects[0];
  const showDetail = !!selectedSlug && selectedProject?.slug === selectedSlug;
  useEffect(() => { if (detailRef.current) detailRef.current.scrollTop = 0; }, [selectedProject?.slug]);
  useEffect(() => {
    if (!selectedSlug || view === "map") return;
    const row = listRef.current?.querySelector<HTMLButtonElement>(`button[data-project-slug="${selectedSlug}"]`);
    const folder = row?.closest("details");
    if (folder) folder.open = true;
    row?.scrollIntoView({ block: "nearest", behavior: "instant" });
  }, [selectedSlug, view]);
  const selectProject = (slug: string, fromGraph = false) => {
    setSelectedSlug(slug);
    if (fromGraph) { setView("files"); setQuery(""); setArea("all"); }
    updateAddress({ selected: slug, ...(fromGraph ? { view: "files", node: null, q: null, area: null } : {}) });
    requestAnimationFrame(() => {
      if (rootRef.current && rootRef.current.clientWidth <= 760) detailRef.current?.focus({ preventScroll: true });
    });
  };
  const backToList = () => {
    setSelectedSlug(null);
    updateAddress({ selected: null });
    requestAnimationFrame(() => listRef.current?.querySelector<HTMLButtonElement>(`button[data-project-slug="${selectedProject?.slug}"]`)?.focus({ preventScroll: true }));
  };
  const showConnections = (slug: string) => {
    const nextNode = `project:${slug}`;
    setNode(nextNode); setView("map"); setMapVisited(true); setSelectedSlug(null);
    updateAddress({ view: "map", node: nextNode, selected: null });
    requestAnimationFrame(() => tabsRef.current[0]?.focus());
  };
  const changeFilters = (nextQuery: string, nextArea: string) => {
    setQuery(nextQuery); setArea(nextArea); setSelectedSlug(null);
    updateAddress({ q: nextQuery || null, area: nextArea === "all" ? null : nextArea, selected: null }, true);
    if (listRef.current) listRef.current.scrollTop = 0;
  };
  const tabs: View[] = ["map", "guided", "files"];
  const labels = { map: "Knowledge graph", guided: "Selected work", files: "All projects" };
  const tabKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const next = event.key === "ArrowRight" ? (index + 1) % tabs.length : event.key === "ArrowLeft" ? (index + tabs.length - 1) % tabs.length : event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : null;
    if (next === null) return;
    event.preventDefault(); chooseView(tabs[next]); tabsRef.current[next]?.focus();
  };
  const rowKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    const rows = Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>("details[open] button[data-project-slug], ul[data-featured] button[data-project-slug]") ?? []);
    const index = rows.indexOf(event.currentTarget);
    const next = event.key === "ArrowDown" ? Math.min(rows.length - 1, index + 1) : event.key === "ArrowUp" ? Math.max(0, index - 1) : event.key === "Home" ? 0 : event.key === "End" ? rows.length - 1 : null;
    if (next === null) return;
    event.preventDefault(); rows[next]?.focus();
  };
  const projectRow = (project: Project) => <li key={project.slug}><button type="button" className={styles.project} data-project-slug={project.slug} aria-current={selectedProject?.slug === project.slug ? "true" : undefined} aria-controls={`${id}-detail`} onClick={() => selectProject(project.slug)} onKeyDown={rowKey}>
    <ProjectArtwork project={project} compact />
    <span><strong>{getProjectText(locale, project.title)}</strong><span>{getProjectText(locale, project.summary)}</span><small>{project.year === "ONGOING" ? t("Ongoing") : project.year} · {archiveCopy.statuses[project.status]}</small></span>
    <span className={styles.openArrow} aria-hidden="true">›</span>
  </button></li>;
  return <ProjectLocaleProvider locale={locale}><div ref={rootRef} className={`system7-project ${styles.library}`} lang={locale}>
    <header className={styles.header}><h1>{t("Projects")}</h1><p>{t(view === "map" ? "Work in software, science and product design." : "Browse the files. Take a closer look.")}</p></header>
    <div className={`s7-tabs ${styles.tabs}`} role="tablist" aria-label={t("Project views")}>
      {tabs.map((tab, index) => <button key={tab} ref={el => { tabsRef.current[index] = el; }} className="s7-tab" role="tab" id={`${id}-${tab}-tab`} aria-controls={`${id}-${tab}`} aria-selected={view === tab} tabIndex={view === tab ? 0 : -1} onKeyDown={event => tabKey(event, index)} onClick={() => chooseView(tab)}>{t(labels[tab])}</button>)}
    </div>
    {mapVisited && <section role="tabpanel" id={`${id}-map`} aria-labelledby={`${id}-map-tab`} hidden={view !== "map"} className={styles.graph}>
      <KnowledgeGraph active={active && view === "map"} locale={locale} initialNode={node ?? undefined} onSelectionChange={next => {
        setNode(next);
        if (view !== "map" || !rootRef.current?.closest(".mac-window")?.classList.contains("is-active")) return;
        const url = new URL(window.location.href); if (next) url.searchParams.set("node", next); else url.searchParams.delete("node");
        window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}`);
      }} onOpenProject={slug => selectProject(slug, true)} />
    </section>}
    {view !== "map" && <section role="tabpanel" id={`${id}-${view}`} aria-labelledby={`${id}-${view}-tab`} className={styles.workspace} data-detail-open={showDetail}>
      <aside className={styles.listPane} aria-label={t("Project list")}>
        <div className={styles.listTitle}><span aria-hidden="true">▰</span><strong>{t(labels[view])}</strong><span>{filtered.length}</span></div>
        <div className={styles.filters}>
          <label>{t("Search projects")}<input ref={searchRef} type="search" value={query} onChange={event => changeFilters(event.target.value, area)} onKeyDown={event => { if (event.key === "ArrowDown" || event.key === "Enter") { const first = listRef.current?.querySelector<HTMLButtonElement>("details[open] button[data-project-slug], ul[data-featured] button[data-project-slug]"); if (first) { event.preventDefault(); first.focus(); } } }} placeholder={t("Search titles, methods or experience…")} /></label>
          <label>{t("Discipline")}<ClassicSelect value={area} onChange={event => changeFilters(query, event.target.value)}><option value="all">{t("All disciplines")}</option>{projectAreas.map(value => <option key={value} value={value}>{archiveCopy.areas[value]}</option>)}</ClassicSelect></label>
          <div className={styles.filterStatus}><span role="status">{indexLoading ? t("Searching project text…") : filtered.length === 1 ? t("1 project") : projectText(locale, copy, "{count} projects", { count: filtered.length })}</span>{(query || area !== "all") && <button className={styles.clearFilters} onClick={() => changeFilters("", "all")}>{t("Clear filters")}</button>}</div>
          {indexError && query.trim() && <p className={styles.searchError} role="status">{t("Detailed search is unavailable. Showing matches in project descriptions.")}</p>}
        </div>
        <div ref={listRef} className={styles.catalogue}>
          {filtered.length ? view === "guided" ? <ul data-featured>{filtered.map(projectRow)}</ul> : projectAreas.filter(value => filtered.some(project => project.area === value)).map(value => <details className={styles.folder} key={value} open><summary><span aria-hidden="true">▰</span> {archiveCopy.areas[value]} <small>{filtered.filter(project => project.area === value).length}</small></summary><ul>{filtered.filter(project => project.area === value).map(projectRow)}</ul></details>) : <div className={styles.empty}><p>{t("No projects match.")}</p><button className="s7-button" onClick={() => changeFilters("", "all")}>{t("Clear filters")}</button></div>}
          {view === "guided" && !query && area === "all" && <article className={styles.latest}><h2>{t("Building on the run")}</h2><p>{t("A 44 km relay, a voice-built running app and a second-place finish.")}</p><button className="s7-button" onClick={() => onOpenApp("sidequest")}>{t("Read the RUN/HACK story")} ↗</button></article>}
        </div>
      </aside>
      <section ref={detailRef} id={`${id}-detail`} tabIndex={-1} className={styles.detailPane} aria-label={t("Project details")}>
        {selectedProject ? <ProjectDocument key={selectedProject.slug} slug={selectedProject.slug} locale={locale} onOpenApp={onOpenApp} onBack={backToList} onGraph={showConnections} embedded active={active && (!narrow || showDetail)} /> : <div className={styles.emptyDetail}><span aria-hidden="true">▤</span><h2>{t("No projects match.")}</h2><p>{t("Try another search or clear the filters.")}</p></div>}
      </section>
    </section>}
  </div></ProjectLocaleProvider>;
}
export default memo(ProjectExplorer);
