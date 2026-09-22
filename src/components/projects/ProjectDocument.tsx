"use client";

import { getProjectText } from "@/lib/projectNarrative";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { projects, type Project } from "@/data/projects";
import { localeSlug, type Locale } from "@/lib/i18n";
import { projectText, type ProjectCopyTable } from "@/lib/projectCopy";
import { ProjectLocaleProvider } from "./ProjectTranslationBoundary";
import { ProjectCaseBrief } from "./ProjectCaseBrief";
import { ProjectDemoRouter } from "./ProjectDemoRouter";
import { ProjectArtwork } from "./ProjectArtwork";
import styles from "./ProjectDocument.module.css";

const copy = {
  "Ongoing": ["持续进行", "持續進行"],
  "All projects": ["全部项目", "全部專案"],
  "More actions": ["更多操作", "更多操作"],
  "Connections": ["项目关联", "專案關聯"],
  "Explore the project": ["探索项目", "探索專案"],
  "Copy link": ["复制链接", "複製連結"],
  "Link copied": ["链接已复制", "連結已複製"],
  "Copy this address": ["复制此地址", "複製此位址"],
  "Project navigation": ["项目导航", "專案導覽"],
  "Project materials": ["项目资料", "專案資料"],
  "Open application": ["打开应用", "開啟應用程式"],
  "Visit website": ["访问网站", "瀏覽網站"],
  "View repository": ["查看代码库", "查看程式碼儲存庫"],
  "About the demonstration": ["演示说明", "示範說明"],
  "Back to list": ["返回列表", "返回清單"],
  "Open in new tab": ["在新标签页打开", "在新分頁開啟"],
  "Open interactive demo": ["打开交互演示", "開啟互動示範"],
  "Closing clears this demo’s unsaved changes.": ["关闭后，此演示中未保存的更改将被清除。", "關閉後，此示範中未儲存的變更將被清除。"],
  "Close demo and return to overview": ["关闭演示并返回概览", "關閉示範並返回概覽"],
  "Return to demo": ["前往交互演示", "前往互動示範"],
} satisfies ProjectCopyTable;

type SystemApp = NonNullable<Project["systemApp"]> | "sidequest";
export default function ProjectDocument({ slug, locale, onOpenApp, onBack, onGraph, embedded = false, initialDemo = false, active = true }: {
  slug: string; locale: Locale; onOpenApp: (id: SystemApp) => void;
  onBack: () => void; onGraph: (slug: string) => void;
  embedded?: boolean; initialDemo?: boolean; active?: boolean;
}) {
  const project = projects.find((item) => item.slug === slug);
  const documentRef = useRef<HTMLElement>(null);
  const launchRef = useRef<HTMLButtonElement>(null);
  const toolbarRef = useRef<HTMLElement>(null);
  const experimentRef = useRef<HTMLDivElement>(null);
  const [shareStatus, setShareStatus] = useState("");
  const [demoOpen, setDemoOpen] = useState(!embedded || initialDemo);
  const t = (source: string) => projectText(locale, copy, source);
  useEffect(() => {
    const toolbar = toolbarRef.current;
    if (!toolbar) return;
    const measure = () => {
      documentRef.current?.style.setProperty("--project-toolbar-height", `${Math.ceil(toolbar.getBoundingClientRect().height)}px`);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(toolbar);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!initialDemo) return;
    setDemoOpen(true);
    const frame = requestAnimationFrame(() => {
      experimentRef.current?.scrollIntoView({ block: "start", behavior: "instant" });
      experimentRef.current?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [initialDemo]);
  const scrollToExperiment = () => {
    setDemoOpen(true);
    requestAnimationFrame(() => {
      experimentRef.current?.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
      experimentRef.current?.focus({ preventScroll: true });
    });
  };
  const closeDemo = () => {
    setDemoOpen(false);
    requestAnimationFrame(() => {
      documentRef.current?.querySelector("h1")?.scrollIntoView({ block: "center", behavior: "instant" });
      launchRef.current?.focus({ preventScroll: true });
    });
  };
  const share = async () => {
    const url = new URL(`/${localeSlug(locale)}/projects?project=${encodeURIComponent(slug)}`, window.location.origin).href;
    try { await navigator.clipboard.writeText(url); setShareStatus(t("Link copied")); }
    catch { setShareStatus(`${t("Copy this address")}: ${url}`); }
  };
  if (!project) return null;
  return <ProjectLocaleProvider locale={locale}><article ref={documentRef} className={`system7-project ${styles.document}`} data-embedded={embedded} lang={locale}>
    <nav ref={toolbarRef} className={`s7-toolbar ${styles.toolbar}`} aria-label={t("Project navigation")}>
      <button className={`s7-button ${embedded ? styles.backToList : ""}`} onClick={onBack}>← {t(embedded ? "Back to list" : "All projects")}</button>
      {project.demo && <button ref={launchRef} className="s7-button" onClick={scrollToExperiment} aria-expanded={demoOpen} aria-controls={demoOpen ? `interactive-lab-${slug}` : undefined}>{t(embedded ? demoOpen ? "Return to demo" : "Open interactive demo" : "Explore the project")} ↓</button>}
      {shareStatus && <span role="status">{shareStatus}</span>}
    </nav>
    <details className={styles.secondaryActions}>
      <summary>{t("More actions")}</summary>
      <div>
      {embedded && <a className="s7-button" href={`/${localeSlug(locale)}/projects?project=${encodeURIComponent(slug)}`} target="_blank" rel="noopener noreferrer">{t("Open in new tab")} ↗</a>}
      <button className="s7-button" onClick={() => onGraph(slug)}>{t("Connections")} ↗</button>
      <button className="s7-button" onClick={share}>{t("Copy link")}</button>
      </div>
    </details>
    <header className={styles.header}>
      <ProjectArtwork project={project} />
      <div><p className={styles.context}>{getProjectText(locale, project.area)} · {project.year === "ONGOING" ? t("Ongoing") : project.year}</p>
        <h1>{getProjectText(locale, project.title)}</h1>
        <p className={styles.summary}>{getProjectText(locale, project.summary)}</p>
        <p className={styles.tools}>{project.tools.map(tool => getProjectText(locale, tool)).join(" · ")}</p>
      </div>
    </header>
    {(project.websiteUrl || project.artifacts?.length || project.sourceUrl || project.systemApp) && <nav className={styles.materials} aria-label={t("Project materials")}>
      {project.systemApp && <button className="s7-button is-default" onClick={() => onOpenApp(project.systemApp!)}>{t("Open application")} ↗</button>}
      {project.websiteUrl && <a className="s7-button" href={project.websiteUrl} target="_blank" rel="noopener noreferrer">{t("Visit website")} ↗</a>}
      {project.artifacts?.map((artifact) => <a className="s7-button" key={artifact.href} href={artifact.href} target="_blank" rel="noopener noreferrer">{getProjectText(locale, artifact.label)} ↗</a>)}
      {project.sourceUrl && project.access !== "proprietary" && <a className="s7-button" href={project.sourceUrl} target="_blank" rel="noopener noreferrer">{t("View repository")} ↗</a>}
    </nav>}
    <ProjectCaseBrief project={project} locale={locale} onExplore={scrollToExperiment} demoOpen={demoOpen} />
    {project.preview && <figure className={styles.preview}>
      <Image src={project.preview.src} alt={getProjectText(locale, project.preview.alt)} width={543} height={172} sizes="(max-width: 720px) 90vw, 640px" />
      <figcaption>{getProjectText(locale, project.preview.caption)}</figcaption>
    </figure>}
    {project.demo && demoOpen && <div className={styles.experiment} id={`interactive-lab-${slug}`} ref={experimentRef} tabIndex={-1}>
      <ProjectDemoRouter demoId={project.demo} locale={locale} active={active} />
      <div className={styles.experimentActions}><p>{t("Closing clears this demo’s unsaved changes.")}</p><button className="s7-button" onClick={closeDemo}>↑ {t("Close demo and return to overview")}</button></div>
    </div>}
    {project.privacyNote && !project.demo && <details className={styles.boundary}><summary>{t("About the demonstration")}</summary><p>{getProjectText(locale, project.privacyNote)}</p></details>}
  </article></ProjectLocaleProvider>;
}
