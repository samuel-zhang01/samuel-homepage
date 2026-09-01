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
    <section className={`${styles.demoWindow} ${className}`} aria-label={`${t(title)} — ${t("interactive demo")}`}>
      <div className={styles.titleBar}>
        <span className={styles.windowControl} aria-hidden="true" />
        <span className={styles.titleRule} aria-hidden="true" />
        <strong title={t(appName)}>{t(appName)}</strong>
        <span className={styles.titleRule} aria-hidden="true" />
        <span className={`${styles.windowControl} ${styles.windowControlRight}`} aria-hidden="true" />
      </div>
      <header className={styles.demoHeader}>
        <div>
          <span className={styles.eyebrow}>{t("INTERACTIVE PROJECT FILE")}</span>
          <h2>{t(title)}</h2>
        </div>
        <span className={`${styles.statusBadge} ${styles[statusTone]}`}>
          <span aria-hidden="true" />
          {t(status)}
        </span>
      </header>
      <aside className={styles.demoContract} aria-label={t("How to use this interactive demo")} lang={locale}>
        <div className={styles.contractPurpose}>
          <span>{t("WHY THIS EXISTS")}</span>
          <strong>{t(purpose)}</strong>
        </div>
        <div>
          <span><i aria-hidden="true">01</i> {t("TRY THIS")}</span>
          <p>{t(tryThis)}</p>
        </div>
        <div>
          <span><i aria-hidden="true">02</i> {t("WATCH")}</span>
          <p>{t(watchFor)}</p>
        </div>
      </aside>
      <div className={styles.demoBody}>{children}</div>
      {footer ? <footer className={styles.statusBar}>{footer}</footer> : null}
    </section>
  );
}

export function MacButton({
  children,
  primary = false,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { primary?: boolean }) {
  return (
    <button
      {...props}
      className={`${styles.macButton} ${primary ? styles.primaryButton : ""} ${props.className ?? ""}`}
    >
      {children}
    </button>
  );
}
