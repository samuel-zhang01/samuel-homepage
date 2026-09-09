"use client";

import { getProjectText } from "@/lib/projectNarrative";

import Image from "next/image";
import { useRef, useState } from "react";
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
} satisfies ProjectCopyTable;

type SystemApp = NonNullable<Project["systemApp"]> | "sidequest";
export default function ProjectDocument({ slug, locale, onOpenApp, onBack, onGraph }: {
  slug: string; locale: Locale; onOpenApp: (id: SystemApp) => void;
  onBack: () => void; onGraph: (slug: string) => void;
}) {
  const project = projects.find((item) => item.slug === slug);
  const experimentRef = useRef<HTMLDivElement>(null);
  const [shareStatus, setShareStatus] = useState("");
  const t = (source: string) => projectText(locale, copy, source);
  if (!project) return null;
  const scrollToExperiment = () => {
    experimentRef.current?.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    experimentRef.current?.focus({ preventScroll: true });
  };
  const share = async () => {
    const url = new URL(`/${localeSlug(locale)}/projects?project=${encodeURIComponent(slug)}`, window.location.origin).href;
    try { await navigator.clipboard.writeText(url); setShareStatus(t("Link copied")); }
    catch { setShareStatus(`${t("Copy this address")}: ${url}`); }
  };
  return <ProjectLocaleProvider locale={locale}><article className={`system7-project ${styles.document}`} lang={locale}>
    <nav className={`s7-toolbar ${styles.toolbar}`} aria-label={t("Project navigation")}>
      <button className="s7-button" onClick={onBack}>← {t("All projects")}</button>
      <button className="s7-button" onClick={() => onGraph(slug)}>{t("Connections")} ↗</button>
      {project.demo && <button className="s7-button" onClick={scrollToExperiment}>{t("Explore the project")} ↓</button>}
      <button className="s7-button" onClick={share}>{t("Copy link")}</button>
      {shareStatus && <span role="status">{shareStatus}</span>}
    </nav>
    <header className={styles.header}>
      <ProjectArtwork project={project} />
      <div><p className={styles.context}>{getProjectText(locale, project.area)} · {project.year === "ONGOING" ? t("Ongoing") : project.year}</p>
        <h1>{getProjectText(locale, project.title)}</h1>
        <p className={styles.summary}>{getProjectText(locale, project.summary)}</p>
        <p className={styles.tools}>{project.tools.map(tool => getProjectText(locale, tool)).join(" · ")}</p>
      </div>
    </header>
    <ProjectCaseBrief project={project} locale={locale} />
    {project.preview && <figure className={styles.preview}>
      <Image src={project.preview.src} alt={getProjectText(locale, project.preview.alt)} width={543} height={172} sizes="(max-width: 720px) 90vw, 640px" />
      <figcaption>{getProjectText(locale, project.preview.caption)}</figcaption>
    </figure>}
    {(project.websiteUrl || project.artifacts?.length || project.sourceUrl || project.systemApp) && <nav className={styles.materials} aria-label={t("Project materials")}>
      {project.systemApp && <button className="s7-button is-default" onClick={() => onOpenApp(project.systemApp!)}>{t("Open application")} ↗</button>}
      {project.websiteUrl && <a className="s7-button" href={project.websiteUrl} target="_blank" rel="noopener noreferrer">{t("Visit website")} ↗</a>}
      {project.artifacts?.map((artifact) => <a className="s7-button" key={artifact.href} href={artifact.href} target="_blank" rel="noopener noreferrer">{getProjectText(locale, artifact.label)} ↗</a>)}
      {project.sourceUrl && project.access !== "proprietary" && <a className="s7-button" href={project.sourceUrl} target="_blank" rel="noopener noreferrer">{t("View repository")} ↗</a>}
    </nav>}
    {project.demo && <div className={styles.experiment} id={`interactive-lab-${slug}`} ref={experimentRef} tabIndex={-1}>
      <ProjectDemoRouter demoId={project.demo} locale={locale} />
    </div>}
    {project.privacyNote && <details className={styles.boundary}><summary>{t("About the demonstration")}</summary><p>{getProjectText(locale, project.privacyNote)}</p></details>}
  </article></ProjectLocaleProvider>;
}
