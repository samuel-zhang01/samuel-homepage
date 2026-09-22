"use client";

import { useId, type ReactNode } from "react";
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
  const guidanceId = useId();
  const t = (source: string) => translateText(locale, source);

  return (
    <section className={`system7-project ${styles.demoWindow} ${className}`} data-locale={locale} aria-label={`${t(title)} — ${t("interactive demo")}`}>
      <header className={styles.demoHeader}>
        <div>
          <span className={styles.eyebrow}>{t(appName)}<span className={styles.fileContext}> · {locale.startsWith("en") ? "Interactive project file" : t("INTERACTIVE PROJECT FILE")}</span></span>
          <h2>{t(title)}</h2>
        </div>
        <span className={`${styles.statusBadge} ${styles[statusTone]}`}>
          <span aria-hidden="true" />
          {t(status)}
        </span>
      </header>
      <section className={styles.demoContract} lang={locale} aria-labelledby={guidanceId}>
        <h3 id={guidanceId}>{t("How to use this interactive demo")}</h3>
        <p className={styles.contractPurpose}>{t(purpose)}</p>
        <div className={styles.contractGrid}>
          <div>
            <h4>{locale.startsWith("en") ? "Try this" : t("TRY THIS")}</h4>
            <p>{t(tryThis)}</p>
          </div>
          <div>
            <h4>{locale.startsWith("en") ? "Watch" : t("WATCH")}</h4>
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
