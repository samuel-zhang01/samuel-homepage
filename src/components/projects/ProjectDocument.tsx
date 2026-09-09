"use client";

import { getProjectText } from "@/lib/projectNarrative";

import Image from "next/image";
import { useContext, useState } from "react";
import { projects, type Project } from "@/data/projects";
import { localeSlug, type Locale } from "@/lib/i18n";
import { projectText, type ProjectCopyTable } from "@/lib/projectCopy";
import { ProjectLocaleProvider } from "./ProjectTranslationBoundary";
import { ProjectCaseBrief } from "./ProjectCaseBrief";
import { ProjectWindowContext } from "./ProjectWindowContext";
import { ProjectArtwork } from "./ProjectArtwork";
export { default as ProjectActivity } from "./ProjectActivity";

import styles from "./ProjectDocument.module.css";

const copy = {
  "Ongoing": ["持续进行", "持續進行"],
  "All projects": ["全部项目", "全部專案"],
  "Connections": ["项目关联", "專案關聯"],
  "Explore the project": ["探索项目", "探索專案"],
  "Open showcase PDF": ["打开展示 PDF", "開啟展示 PDF"],
  "Open PDF": ["打开 PDF", "開啟 PDF"],
  "Share project": ["分享项目", "分享專案"],
  "Copy a link to share this project": ["复制链接，分享此项目", "複製連結，分享此專案"],
  "Opens in a desktop window": ["在桌面窗口中打开", "在桌面視窗中開啟"],
  "Project link": ["项目链接", "專案連結"],
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
  "Open live demo": ["打开交互演示", "開啟互動示範"],
  "Closing clears this demo’s unsaved changes.": ["关闭后，此演示中未保存的更改将被清除。", "關閉後，此示範中未儲存的變更將被清除。"],
  "Close demo and return to overview": ["关闭演示并返回概览", "關閉示範並返回概覽"],
  "Go to live demo": ["前往交互演示", "前往互動示範"],
} satisfies ProjectCopyTable;

type SystemApp = NonNullable<Project["systemApp"]> | "sidequest";
export default function ProjectDocument({ slug, locale, onOpenApp, onBack, onGraph, embedded = false }: {
  slug: string; locale: Locale; onOpenApp: (id: SystemApp) => void;
  onBack: () => void; onGraph: (slug: string) => void;
  embedded?: boolean;
}) {
  const project = projects.find((item) => item.slug === slug);
  const primaryPdf = !project?.demo ? project?.artifacts?.find(artifact => artifact.kind === "PDF") : undefined;
  const openActivity = useContext(ProjectWindowContext);
  const [shareStatus, setShareStatus] = useState("");
  const [shareFallback, setShareFallback] = useState("");
  const t = (source: string) => projectText(locale, copy, source);
  const openDemo = () => openActivity?.({ slug, kind: "demo" });
  const share = async () => {
    const url = new URL(`/${localeSlug(locale)}/projects?project=${encodeURIComponent(slug)}`, window.location.origin).href;
    try { await navigator.clipboard.writeText(url); setShareFallback(""); setShareStatus("Link copied"); }
    catch { setShareFallback(url); setShareStatus("Copy this address"); }
  };
  if (!project) return null;
  return <ProjectLocaleProvider locale={locale}><article className={`system7-project ${styles.document}`} data-embedded={embedded} lang={locale}>
    <nav className={`s7-toolbar ${styles.toolbar}`} aria-label={t("Project navigation")}>
      {project.demo && <button className="s7-button is-primary" onClick={openDemo} title={t("Opens in a desktop window")}>{t("Open live demo")} ↗</button>}
      {primaryPdf && <button className="s7-button is-primary" onClick={() => openActivity?.({ slug, kind: "pdf", artifactHref: primaryPdf.href })} title={getProjectText(locale, primaryPdf.label)}>{t(slug === "growmat" ? "Open showcase PDF" : "Open PDF")} ↗</button>}
      <button className={`s7-button ${embedded ? styles.backToList : ""}`} onClick={onBack}>← {t(embedded ? "Back to list" : "All projects")}</button>
      {embedded && <a className="s7-button" href={`/${localeSlug(locale)}/projects?project=${encodeURIComponent(slug)}`} target="_blank" rel="noopener noreferrer">{t("Open in new tab")} ↗</a>}
      <button className="s7-button" onClick={() => onGraph(slug)}>{t("Connections")} ↗</button>
      <button className="s7-button is-share" onClick={share} title={t("Copy a link to share this project")}>{t("Share project")} ↗</button>
      {shareStatus && <span role="status">{t(shareStatus)}</span>}
    </nav>
    {shareFallback && <label className={styles.shareFallback}>{t("Project link")}<input readOnly value={shareFallback} onFocus={event => event.target.select()} /></label>}
    <header className={styles.header}>
      <ProjectArtwork project={project} />
      <div><p className={styles.context}>{getProjectText(locale, project.area)} · {project.year === "ONGOING" ? t("Ongoing") : project.year}</p>
        <h1>{getProjectText(locale, project.title)}</h1>
        <p className={styles.summary}>{getProjectText(locale, project.summary)}</p>
        <p className={styles.tools}>{project.tools.map(tool => getProjectText(locale, tool)).join(" · ")}</p>
      </div>
    </header>
    {(project.websiteUrl || project.artifacts?.some(artifact => artifact !== primaryPdf) || project.sourceUrl || project.systemApp) && <nav className={styles.materials} aria-label={t("Project materials")}>
      {project.systemApp && <button className="s7-button is-primary" onClick={() => onOpenApp(project.systemApp!)}>{t("Open application")} ↗</button>}
      {project.websiteUrl && <a className="s7-button" href={project.websiteUrl} target="_blank" rel="noopener noreferrer">{t("Visit website")} ↗</a>}
      {project.artifacts?.filter(artifact => artifact !== primaryPdf).map((artifact) => artifact.kind === "PDF" ? <button className={`s7-button ${project.demo ? "" : "is-primary"}`} key={artifact.href} onClick={() => openActivity?.({ slug, kind: "pdf", artifactHref: artifact.href })} title={t("Opens in a desktop window")}>{getProjectText(locale, artifact.label)} ↗</button> : <a className="s7-button" key={artifact.href} href={artifact.href} target="_blank" rel="noopener noreferrer">{getProjectText(locale, artifact.label)} ↗</a>)}
      {project.sourceUrl && project.access !== "proprietary" && <a className="s7-button" href={project.sourceUrl} target="_blank" rel="noopener noreferrer">{t("View repository")} ↗</a>}
    </nav>}
    <ProjectCaseBrief project={project} locale={locale} onExplore={openDemo} />
    {project.preview && <figure className={styles.preview}>
      <Image src={project.preview.src} alt={getProjectText(locale, project.preview.alt)} width={543} height={172} sizes="(max-width: 720px) 90vw, 640px" />
      <figcaption>{getProjectText(locale, project.preview.caption)}</figcaption>
    </figure>}
    {project.privacyNote && <details className={styles.boundary}><summary>{t("About the demonstration")}</summary><p>{getProjectText(locale, project.privacyNote)}</p></details>}
  </article></ProjectLocaleProvider>;
}
