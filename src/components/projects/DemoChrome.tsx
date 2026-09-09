"use client";

import type { ReactNode } from "react";
import { translateText } from "@/lib/i18n";
import { useProjectLocale } from "./ProjectTranslationBoundary";
import styles from "./DemoChrome.module.css";

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
  const t = (source: string) => translateText(locale, source);

  return (
    <section className={`system7-project ${styles.demoWindow} ${className}`} data-locale={locale} aria-label={`${t(title)} — ${t("interactive demo")}`}>
      <header className={styles.demoHeader}>
        <div>
          <span className={styles.eyebrow}>{t(appName)} · {locale === "en-GB" ? "Interactive project file" : t("INTERACTIVE PROJECT FILE")}</span>
          <h2>{t(title)}</h2>
        </div>
        <span className={`${styles.statusBadge} ${styles[statusTone]}`}>
          <span aria-hidden="true" />
          {t(status)}
        </span>
      </header>
      <details className={styles.demoContract} lang={locale}>
        <summary>{t("How to use this interactive demo")}</summary>
        <div className={styles.contractGrid}>
          <div className={styles.contractPurpose}>
            <span>{locale === "en-GB" ? "Purpose" : t("WHY THIS EXISTS")}</span>
            <strong>{t(purpose)}</strong>
          </div>
          <div>
            <span><i aria-hidden="true">01</i> {locale === "en-GB" ? "Try this" : t("TRY THIS")}</span>
            <p>{t(tryThis)}</p>
          </div>
          <div>
            <span><i aria-hidden="true">02</i> {locale === "en-GB" ? "Watch" : t("WATCH")}</span>
            <p>{t(watchFor)}</p>
          </div>
        </div>
      </details>
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
