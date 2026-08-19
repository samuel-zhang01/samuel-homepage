"use client";

import type { ReactNode } from "react";
import styles from "./DemoChrome.module.css";

type DemoWindowProps = {
  appName: string;
  title: string;
  status: string;
  statusTone?: "ready" | "working" | "safe";
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function DemoWindow({
  appName,
  title,
  status,
  statusTone = "ready",
  children,
  footer,
  className = "",
}: DemoWindowProps) {
  return (
    <section className={`${styles.demoWindow} ${className}`} aria-label={`${title} interactive demo`}>
      <div className={styles.titleBar}>
        <span className={styles.windowControl} aria-hidden="true" />
        <span className={styles.titleRule} aria-hidden="true" />
        <strong title={appName}>{appName}</strong>
        <span className={styles.titleRule} aria-hidden="true" />
        <span className={`${styles.windowControl} ${styles.windowControlRight}`} aria-hidden="true" />
      </div>
      <header className={styles.demoHeader}>
        <div>
          <span className={styles.eyebrow}>INTERACTIVE PROJECT FILE</span>
          <h2>{title}</h2>
        </div>
        <span className={`${styles.statusBadge} ${styles[statusTone]}`}>
          <span aria-hidden="true" />
          {status}
        </span>
      </header>
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
