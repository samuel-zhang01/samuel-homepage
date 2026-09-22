"use client";

import dynamic from "next/dynamic";
import { useEffect, useId, useRef, useState } from "react";
import { projects } from "@/data/projects";
import { localeSlug, type Locale } from "@/lib/i18n";
import { projectActivitySearch } from "@/lib/projectActivity";
import { projectText, type ProjectCopyTable } from "@/lib/projectCopy";
import { getProjectText } from "@/lib/projectNarrative";
import { ProjectDemoRouter } from "./ProjectDemoRouter";
import { ProjectLocaleProvider, useProjectLocale } from "./ProjectTranslationBoundary";
import styles from "./ProjectActivity.module.css";

const copy = {
  "Back to project": ["返回项目", "返回專案"],
  "Project": ["项目", "專案"],
  "Share demo": ["分享演示", "分享示範"],
  "Share PDF": ["分享 PDF", "分享 PDF"],
  "Link copied — share it with a friend.": ["链接已复制，分享给朋友吧。", "連結已複製，分享給朋友吧。"],
  "Copy this address": ["复制此地址", "複製此位址"],
  "Save PDF": ["保存 PDF", "儲存 PDF"],
  "GROWMAT showcase": ["GROWMAT 项目展示", "GROWMAT 專案展示"],
  "Italian practice workbook": ["意大利语练习册", "義大利語練習冊"],
  "Bilingual reading workbook": ["双语阅读练习册", "雙語閱讀練習冊"],
  "Curriculum syllabus": ["课程大纲", "課程大綱"],
  "Interactive demo": ["交互演示", "互動示範"],
  "Project activity navigation": ["项目内容导航", "專案內容導覽"],
  "Loading document…": ["正在加载文档…", "正在載入文件…"],
  "This project activity is unavailable.": ["此项目内容暂不可用。", "此專案內容暫時無法使用。"],
} satisfies ProjectCopyTable;

// Catalogue labels invite an action; the open reader needs a document name.
const documentTitles: Readonly<Record<string, string>> = {
  "Open the original GROWMAT showcase PDF": "GROWMAT showcase",
  "Open the Italian practice workbook": "Italian practice workbook",
  "Open the bilingual reading workbook": "Bilingual reading workbook",
  "Curriculum syllabus": "Curriculum syllabus",
};

function PdfLoading() {
  const locale = useProjectLocale();
  return <p className={styles.loading} role="status">{projectText(locale, copy, "Loading document…")}</p>;
}

const PdfPreview = dynamic(() => import("@/components/PdfPreview"), { loading: PdfLoading, ssr: false });

export default function ProjectActivity({ slug, locale, kind, artifactHref, active, onBack }: {
  slug: string;
  locale: Locale;
  kind: "demo" | "pdf";
  artifactHref?: string;
  active: boolean;
  onBack: () => void;
}) {
  const project = projects.find((item) => item.slug === slug);
  // A shared URL may only select a PDF authored in this project's catalogue.
  const artifact = kind === "pdf" ? project?.artifacts?.find((item) => item.kind === "PDF" && (!artifactHref || item.href === artifactHref)) : undefined;
  const valid = Boolean(project && (kind === "demo" ? project.demo : artifact));
  const [copied, setCopied] = useState(false);
  const [fallbackUrl, setFallbackUrl] = useState("");
  const fallbackRef = useRef<HTMLInputElement>(null);
  const fallbackId = useId();
  const t = (source: string) => projectText(locale, copy, source);
  const documentTitle = artifact ? (documentTitles[artifact.label] ? t(documentTitles[artifact.label]) : getProjectText(locale, artifact.label)) : "";

  useEffect(() => { setCopied(false); setFallbackUrl(""); }, [slug, kind, artifactHref, locale]);
  useEffect(() => {
    if (!fallbackUrl) return;
    fallbackRef.current?.focus();
    fallbackRef.current?.select();
  }, [fallbackUrl]);

  const share = async () => {
    if (!valid) return;
    const search = projectActivitySearch({ slug, kind, artifactHref: artifact?.href });
    const url = new URL(`/${localeSlug(locale)}/projects${search}`, window.location.origin).href;
    setCopied(false);
    setFallbackUrl("");
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setFallbackUrl(url);
    }
  };

  return <ProjectLocaleProvider locale={locale}><article className={`system7-project ${styles.activity}`} data-kind={kind} data-active={active} lang={locale}>
    <nav className={`s7-toolbar ${styles.toolbar}`} aria-label={t("Project activity navigation")}>
      <button type="button" className={`s7-button ${styles.backButton}`} onClick={onBack} aria-label={t("Back to project")}>
        <span aria-hidden="true">←</span>
        <span className={styles.fullBackLabel}>{t("Back to project")}</span>
        <span className={styles.shortBackLabel}>{t("Project")}</span>
      </button>
      {valid && <>
        <h1 className={styles.title}>{artifact ? documentTitle : `${getProjectText(locale, project!.title)} · ${t("Interactive demo")}`}</h1>
        <button type="button" className={`s7-button is-share ${styles.shareButton}`} onClick={share}>
          {t(kind === "demo" ? "Share demo" : "Share PDF")}
          <svg className={styles.shareIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="1" /><path d="M15 8V4H4v11h4" /></svg>
        </button>
        {artifact && <a className={`s7-button ${styles.downloadButton}`} href={artifact.href} download aria-label={t("Save PDF")} title={t("Save PDF")}>
          <span className={styles.downloadLabel}>{t("Save PDF")}</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M4 15v5h16v-5" /></svg>
        </a>}
      </>}
      {copied && <p className={styles.shareStatus} role="status">{t("Link copied — share it with a friend.")}</p>}
      {fallbackUrl && <div className={styles.shareFallback}>
        <label htmlFor={fallbackId}>{t("Copy this address")}</label>
        <input ref={fallbackRef} id={fallbackId} value={fallbackUrl} readOnly onFocus={(event) => event.currentTarget.select()} />
      </div>}
    </nav>
    {!valid ? <p className={styles.loading} role="status">{t("This project activity is unavailable.")}</p>
      : kind === "demo" && project?.demo ? <div className={styles.demo}><ProjectDemoRouter key={project.slug} demoId={project.demo} locale={locale} active={active} /></div>
        : artifact && <div className={styles.reader}><PdfPreview key={artifact.href} src={artifact.href} title={documentTitle} locale={locale} /></div>}
  </article></ProjectLocaleProvider>;
}
