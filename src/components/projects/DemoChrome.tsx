"use client";

import { useId, type ReactNode } from "react";
import { projectText, type ProjectCopyTable } from "@/lib/projectCopy";
import { useProjectLocale } from "./ProjectTranslationBoundary";
import styles from "./DemoChrome.module.css";

const copy = {
  "interactive demo": ["交互演示", "互動示範"],
  "What this shows": ["这个演示展示什么", "這個示範呈現什麼"],
  "Try this": ["试试这样操作", "試試這樣操作"],
  "What to notice": ["留意这些变化", "留意這些變化"],
} satisfies ProjectCopyTable;

type DemoWindowProps = {
  appName: string;
  title: string;
  status: string;
  purpose: string;
  tryThis: string;
  watchFor: string;
  statusTone?: "ready" | "working" | "safe";
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function DemoWindow({
  appName,
  title,
  status,
  purpose,
  tryThis,
  watchFor,
  statusTone = "ready",
  children,
  footer,
  className = "",
}: DemoWindowProps) {
  const locale = useProjectLocale();
  const guidanceId = useId();
  const t = (source: string) => projectText(locale, copy, source);

  return (
    <section className={`system7-project ${styles.demoWindow} ${className}`} data-locale={locale} aria-label={`${t(title)} — ${t("interactive demo")}`}>
      <header className={styles.demoHeader}>
        <div>
          <span className={styles.eyebrow}>{t(appName)}</span>
          <h2>{t(title)}</h2>
        </div>
        <span className={`${styles.statusBadge} ${styles[statusTone]}`}>
          <span aria-hidden="true" />
          {t(status)}
        </span>
      </header>
      <section className={styles.demoContract} lang={locale} aria-labelledby={guidanceId}>
        <h3 id={guidanceId}>{t("What this shows")}</h3>
        <p className={styles.contractPurpose}>{t(purpose)}</p>
        <div className={styles.contractGrid}>
          <div>
            <h4>{t("Try this")}</h4>
            <p>{t(tryThis)}</p>
          </div>
          <div>
            <h4>{t("What to notice")}</h4>
            <p>{t(watchFor)}</p>
          </div>
        </div>
      </section>
      <div className={styles.demoBody}>{children}</div>
      {footer ? <footer className={styles.statusBar}>{footer}</footer> : null}
    </section>
  );
}

export function MacButton({
  children,
  primary = false,
  variant = "normal",
  className = "",
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { primary?: boolean; variant?: "normal" | "default" | "icon" }) {
  return (
    <button
      {...props}
      type={type}
      className={`s7-button ${primary || variant === "default" ? "is-default" : ""} ${variant === "icon" ? "s7-button--icon" : ""} ${className}`}
    >
      {children}
    </button>
  );
}
