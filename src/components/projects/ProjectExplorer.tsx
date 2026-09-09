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
type View = "map" | "guided" | "files";
type SystemApp = NonNullable<Project["systemApp"]> | "sidequest";
const copy = {
  "Projects": ["项目", "專案"],
  "Work in software, science and product design.": ["软件、科学与产品设计作品。", "軟體、科學與產品設計作品。"],
  "Choose a project to open its story and interactive work in a new window.": ["选择项目，在新窗口中阅读背景并探索交互内容。", "選擇專案，在新視窗中閱讀背景並探索互動內容。"],
  "Knowledge graph": ["知识图谱", "知識圖譜"], "Selected work": ["精选作品", "精選作品"], "All projects": ["全部项目", "全部專案"],
  "Project views": ["项目视图", "專案檢視"], "Search projects": ["搜索项目", "搜尋專案"],
  "Search titles, methods or experience…": ["搜索名称、方法或经历…", "搜尋名稱、方法或經歷…"],
  "Searching project text…": ["正在搜索项目正文…", "正在搜尋專案內文…"],
  "Detailed search is unavailable. Showing matches in project descriptions.": ["暂时无法搜索全文，当前显示项目简介中的匹配结果。", "暫時無法搜尋全文，目前顯示專案簡介中的符合結果。"],
  "Discipline": ["领域", "領域"], "All disciplines": ["全部领域", "全部領域"],
  "No projects match.": ["没有匹配的项目。", "沒有符合條件的專案。"], "Clear filters": ["清除筛选", "清除篩選"],
  "{count} projects": ["{count} 个项目", "{count} 個專案"], "1 project": ["1 个项目", "1 個專案"], "Open {title}": ["打开{title}", "開啟{title}"],
  "A few places to start": ["从这些作品开始", "從這些作品開始"],
  "Building on the run": ["奔跑中的创作", "奔跑中的創作"],
  "A 44 km relay, a voice-built running app and a second-place finish.": ["44 公里接力赛、语音构建的跑步应用，以及第二名的成绩。", "44 公里接力賽、語音打造的跑步應用程式，以及第二名的成績。"],
  "Read the RUN/HACK story": ["阅读 RUN/HACK 的故事", "閱讀 RUN/HACK 的故事"],
} satisfies ProjectCopyTable;

const fold = (text: string) => text.normalize("NFKD").replace(/\p{M}/gu, "").toLocaleLowerCase();
function viewFromAddress(): View {
  const view = new URL(window.location.href).searchParams.get("view");
  return view === "guided" ? "guided" : view === "files" || view === "list" ? "files" : "map";
}

function ProjectExplorer({ locale = "en-GB", active = true, onOpenApp, onOpenProject }: {
  locale?: Locale; active?: boolean; onOpenApp: (id: SystemApp) => void; onOpenProject: (slug: string) => void;
}) {
  const t = (source: string) => projectText(locale, copy, source);
  const archiveCopy = getProjectArchiveCopy(locale);
  const [view, setView] = useState<View>("map");
  const [node, setNode] = useState<string | null>(null);
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
  const searchRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const id = useId();
  useEffect(() => {
    const sync = () => {
      if (!/\/projects\/?$/.test(window.location.pathname)) return;
      const url = new URL(window.location.href);
      if (url.searchParams.has("project")) return;
      const nextView = viewFromAddress();
      setView(nextView); setNode(url.searchParams.get("node"));
      if (nextView === "map") setMapVisited(true);
    };
    sync();
    window.addEventListener("popstate", sync);
    window.addEventListener("samuel-project-graph", sync);
    return () => { window.removeEventListener("popstate", sync); window.removeEventListener("samuel-project-graph", sync); };
  }, []);
  const chooseView = (next: View) => {
    setView(next);
    if (next === "map") setMapVisited(true);
    const url = new URL(window.location.href);
    url.searchParams.delete("project"); url.searchParams.set("view", next);
    window.history.pushState(window.history.state, "", `${url.pathname}${url.search}`);
    window.dispatchEvent(new Event("samuel-project-route-change"));
  };
  useEffect(() => {
    const shortcut = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey || event.isComposing || event.defaultPrevented) return;
      const target = event.target;
      if (target instanceof HTMLElement && (target.matches("input,textarea,select") || target.isContentEditable)) return;
      if (!rootRef.current?.closest(".mac-window")?.classList.contains("is-active")) return;
      event.preventDefault(); setView("files");
      const url = new URL(window.location.href);
      url.searchParams.delete("project"); url.searchParams.set("view", "files");
      window.history.pushState(window.history.state, "", `${url.pathname}${url.search}`);
      window.dispatchEvent(new Event("samuel-project-route-change"));
      requestAnimationFrame(() => searchRef.current?.focus());
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);
  const filtered = useMemo(() => {
    const words = fold(query).split(/\s+/).filter(Boolean);
    return projects.filter(project => (area === "all" || project.area === area) && words.every(word => fold([
      project.title, project.shortTitle, project.summary, getProjectText(locale, project.title), getProjectText(locale, project.summary),
      searchIndexes[locale]?.[project.slug] ?? "", project.detail, getProjectText(locale, project.detail), project.year, ...project.tools, ...project.tools.map(tool => getProjectText(locale, tool)), ...getProjectOrigins(project.slug).flatMap(origin => [origin.label, origin.context, getProjectText(locale, origin.label), getProjectText(locale, origin.context)]),
    ].join(" ")).includes(word)));
  }, [query, area, locale, searchIndexes]);
  const tabs: View[] = ["map", "guided", "files"];
  const labels = { map: "Knowledge graph", guided: "Selected work", files: "All projects" };
  const tabKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const next = event.key === "ArrowRight" ? (index + 1) % tabs.length : event.key === "ArrowLeft" ? (index + tabs.length - 1) % tabs.length : event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : null;
    if (next === null) return;
    event.preventDefault(); chooseView(tabs[next]); tabsRef.current[next]?.focus();
  };
  const rowKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    const rows = Array.from(event.currentTarget.closest("ul")?.querySelectorAll<HTMLButtonElement>("button[data-project-slug]") ?? []);
    const index = rows.indexOf(event.currentTarget);
    const next = event.key === "ArrowDown" ? Math.min(rows.length - 1, index + 1) : event.key === "ArrowUp" ? Math.max(0, index - 1) : event.key === "Home" ? 0 : event.key === "End" ? rows.length - 1 : null;
    if (next === null) return;
    event.preventDefault(); rows[next]?.focus();
  };
  const projectRow = (project: Project) => <li key={project.slug}><button type="button" className={styles.project} data-project-slug={project.slug} onClick={() => onOpenProject(project.slug)} onKeyDown={rowKey}>
    <ProjectArtwork project={project} compact />
    <span><strong>{getProjectText(locale, project.title)}</strong><span>{getProjectText(locale, project.summary)}</span><small>{project.tools.slice(0, 4).map(tool => getProjectText(locale, tool)).join(" · ")}</small></span>
    <time>{project.year}</time><span className={styles.openArrow} aria-hidden="true">↗</span>
  </button></li>;
  return <ProjectLocaleProvider locale={locale}><div ref={rootRef} className={`system7-project ${styles.library}`} lang={locale}>
    <header className={styles.header}><h1>{t("Projects")}</h1><p>{t(view === "map" ? "Work in software, science and product design." : "Choose a project to open its story and interactive work in a new window.")}</p></header>
    <div className={`s7-tabs ${styles.tabs}`} role="tablist" aria-label={t("Project views")}>
      {tabs.map((tab, index) => <button key={tab} ref={el => { tabsRef.current[index] = el; }} className="s7-tab" role="tab" id={`${id}-${tab}-tab`} aria-controls={`${id}-${tab}`} aria-selected={view === tab} tabIndex={view === tab ? 0 : -1} onKeyDown={event => tabKey(event, index)} onClick={() => chooseView(tab)}>{t(labels[tab])}</button>)}
    </div>
    {mapVisited && <section role="tabpanel" id={`${id}-map`} aria-labelledby={`${id}-map-tab`} hidden={view !== "map"} className={styles.graph}>
      <KnowledgeGraph active={active && view === "map"} locale={locale} initialNode={node ?? undefined} onSelectionChange={next => {
        setNode(next);
        if (view !== "map" || !rootRef.current?.closest(".mac-window")?.classList.contains("is-active")) return;
        const url = new URL(window.location.href); if (next) url.searchParams.set("node", next); else url.searchParams.delete("node");
        window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}`);
      }} onOpenProject={slug => onOpenProject(slug)} />
    </section>}
    {view === "guided" && <section role="tabpanel" id={`${id}-guided`} aria-labelledby={`${id}-guided-tab`} className={styles.selected}>
      <h2>{t("A few places to start")}</h2>
      <ul>{projects.filter(project => project.featured).map(projectRow)}</ul>
      <article className={styles.latest}><h2>{t("Building on the run")}</h2><p>{t("A 44 km relay, a voice-built running app and a second-place finish.")}</p><button className="s7-button" onClick={() => onOpenApp("sidequest")}>{t("Read the RUN/HACK story")} ↗</button></article>
    </section>}
    {view === "files" && <section role="tabpanel" id={`${id}-files`} aria-labelledby={`${id}-files-tab`} className={styles.files}>
      <div className={`s7-toolbar ${styles.filters}`}><label>{t("Search projects")}<input ref={searchRef} type="search" value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => { if (event.key === "ArrowDown" || event.key === "Enter") { const first = rootRef.current?.querySelector<HTMLButtonElement>("button[data-project-slug]"); if (first) { event.preventDefault(); first.focus(); } } }} placeholder={t("Search titles, methods or experience…")} /></label><label>{t("Discipline")}<ClassicSelect value={area} onChange={event => setArea(event.target.value)}><option value="all">{t("All disciplines")}</option>{projectAreas.map(value => <option key={value} value={value}>{archiveCopy.areas[value]}</option>)}</ClassicSelect></label><span role="status">{indexLoading ? t("Searching project text…") : filtered.length === 1 ? t("1 project") : projectText(locale, copy, "{count} projects", { count: filtered.length })}</span></div>
      {indexError && query.trim() && <p className="s7-note">{t("Detailed search is unavailable. Showing matches in project descriptions.")}</p>}
      {filtered.length ? projectAreas.filter(value => filtered.some(project => project.area === value)).map(value => <details className={styles.folder} key={value} open><summary><span aria-hidden="true">▰</span> {archiveCopy.areas[value]} <small>{filtered.filter(project => project.area === value).length}</small></summary><ul>{filtered.filter(project => project.area === value).map(projectRow)}</ul></details>) : <div className={styles.empty}><p>{t("No projects match.")}</p><button className="s7-button" onClick={() => { setQuery(""); setArea("all"); }}>{t("Clear filters")}</button></div>}
    </section>}
  </div></ProjectLocaleProvider>;
}
export default memo(ProjectExplorer);
