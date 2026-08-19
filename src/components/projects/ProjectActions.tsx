"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import {
  formatProjectArchiveCopy,
  getProjectArchiveCopy,
  localiseResourceKind,
} from "./projectArchiveI18n";
import styles from "./ProjectActions.module.css";

export type ProjectActionLink = {
  href: string;
  label: string;
  kind?: string;
  /** Promotes this resource to the principal, dark-blue action style. */
  primary?: boolean;
  download?: boolean;
  labelLang?: Locale;
};

export type ProjectActionsProps = {
  projectTitle: string;
  projectSlug: string;
  locale?: Locale;
  website?: ProjectActionLink;
  artifacts?: readonly ProjectActionLink[];
  source?: ProjectActionLink;
  onOpenDemo?: () => void;
  demoLabel?: ReactNode;
  onOpenSystemApp?: () => void;
  systemAppLabel?: string;
  className?: string;
};

type ShareStatus = "idle" | "copied" | "shared" | "manual";

function projectPermalink(projectSlug: string, pathname?: string | null, locale?: Locale) {
  const url = new URL(window.location.href);
  const localeSegmentByLanguage: Record<string, string> = {
    "en-US": "en-us",
    "zh-CN": "zh-cn",
    "zh-TW": "zh-tw",
  };
  const firstSegment = (pathname ?? url.pathname).split("/").filter(Boolean)[0]?.toLocaleLowerCase("en-GB");
  const pathLocale = ["en-gb", "en-us", "zh-cn", "zh-tw"].includes(firstSegment ?? "")
    ? firstSegment
    : undefined;
  const recognisedLocale = pathLocale
    ?? (locale ? localeSegmentByLanguage[locale] : undefined)
    ?? localeSegmentByLanguage[document.documentElement.lang];

  url.pathname = recognisedLocale
    ? `/${recognisedLocale}/projects`
    : "/projects";
  url.searchParams.delete("lang");
  url.searchParams.set("project", projectSlug);
  url.hash = "";
  return url.toString();
}

function legacyCopy(value: string) {
  const field = document.createElement("textarea");
  field.value = value;
  field.setAttribute("readonly", "");
  field.setAttribute("aria-hidden", "true");
  Object.assign(field.style, {
    position: "fixed",
    top: "0",
    left: "-9999px",
    width: "1px",
    height: "1px",
    opacity: "0",
  });

  const activeElement = document.activeElement instanceof HTMLElement
    ? document.activeElement
    : null;
  document.body.appendChild(field);
  field.select();
  field.setSelectionRange(0, field.value.length);

  let copied = false;
  try {
    copied = typeof document.execCommand === "function" && document.execCommand("copy");
  } catch {
    copied = false;
  } finally {
    field.remove();
    activeElement?.focus({ preventScroll: true });
  }
  return copied;
}

function ResourceLink({
  resource,
  locale,
  prominent = false,
}: {
  resource: ProjectActionLink;
  locale: Locale;
  prominent?: boolean;
}) {
  const kind = resource.kind?.trim() || "OPEN";
  const copy = getProjectArchiveCopy(locale).actions;
  const kindLabel = localiseResourceKind(locale, kind);
  const shouldDownload = Boolean(resource.download);

  return (
    <a
      className={`${styles.action} ${prominent || resource.primary ? styles.primaryAction : ""}`}
      href={resource.href}
      target={shouldDownload ? undefined : "_blank"}
      rel={shouldDownload ? undefined : "noopener noreferrer"}
      download={shouldDownload || undefined}
    >
      <span className={styles.actionIcon} aria-hidden="true">
        {kind.toLocaleUpperCase().includes("PDF") ? "◫" : "↗"}
      </span>
      <span className={styles.actionCopy}>
        <small>{kindLabel}</small>
        <strong lang={resource.labelLang ?? locale}>{resource.label}</strong>
      </span>
      {!shouldDownload && <span className={styles.newWindow}>{copy.newWindow}</span>}
      {!shouldDownload && <span className={styles.srOnly}>{copy.opensNewWindow}</span>}
    </a>
  );
}

export function ProjectActions({
  projectTitle,
  projectSlug,
  locale = "en-GB",
  website,
  artifacts = [],
  source,
  onOpenDemo,
  demoLabel,
  onOpenSystemApp,
  systemAppLabel,
  className = "",
}: ProjectActionsProps) {
  const copy = getProjectArchiveCopy(locale).actions;
  const resolvedDemoLabel = demoLabel ?? copy.defaultDemo;
  const resolvedSystemAppLabel = systemAppLabel ?? copy.defaultSystemApp;
  const pathname = usePathname();
  const [permalink, setPermalink] = useState("");
  const [shareStatus, setShareStatus] = useState<ShareStatus>("idle");
  const permalinkRef = useRef<HTMLInputElement>(null);
  const resetTimerRef = useRef<number | null>(null);

  const refreshPermalink = () => {
    const nextPermalink = projectPermalink(projectSlug, pathname, locale);
    setPermalink(nextPermalink);
    return nextPermalink;
  };

  const announce = (status: ShareStatus, resetAfter = 3200) => {
    setShareStatus(status);
    if (resetTimerRef.current !== null) window.clearTimeout(resetTimerRef.current);
    if (status !== "idle") {
      resetTimerRef.current = window.setTimeout(() => setShareStatus("idle"), resetAfter);
    }
  };

  useEffect(() => {
    setPermalink(projectPermalink(projectSlug, pathname, locale));
    setShareStatus("idle");
    const syncAddress = () => setPermalink(projectPermalink(projectSlug, window.location.pathname));
    window.addEventListener("popstate", syncAddress);
    return () => {
      window.removeEventListener("popstate", syncAddress);
      if (resetTimerRef.current !== null) window.clearTimeout(resetTimerRef.current);
    };
  }, [locale, pathname, projectSlug]);

  const selectPermalink = (currentValue?: string) => {
    const input = permalinkRef.current;
    if (!input) return;
    if (currentValue && input.value !== currentValue) input.value = currentValue;
    input.focus({ preventScroll: true });
    input.select();
    input.setSelectionRange(0, input.value.length);
  };

  const copyPermalink = async () => {
    const nextPermalink = refreshPermalink();
    let copied = false;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(nextPermalink);
        copied = true;
      }
    } catch {
      copied = false;
    }

    if (!copied) copied = legacyCopy(nextPermalink);
    if (copied) {
      announce("copied");
      return;
    }

    selectPermalink(nextPermalink);
    announce("manual", 6000);
  };

  const shareProject = async () => {
    const nextPermalink = refreshPermalink();
    if (typeof navigator.share !== "function") {
      await copyPermalink();
      return;
    }

    try {
      await navigator.share({
        title: projectTitle,
        text: formatProjectArchiveCopy(copy.shareMessage, { title: projectTitle }),
        url: nextPermalink,
      });
      announce("shared");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      await copyPermalink();
    }
  };

  const hasPrincipalAction = Boolean(onOpenDemo || website);
  const hasLaunchAction = Boolean(
    hasPrincipalAction || artifacts.length > 0 || source || onOpenSystemApp,
  );

  return (
    <section
      className={`${styles.panel} ${className}`}
      aria-label={formatProjectArchiveCopy(copy.panelAria, { title: projectTitle })}
      lang={locale}
    >
      <div className={styles.titleBar}>
        <span className={styles.windowControl} aria-hidden="true" />
        <span className={styles.titleRule} aria-hidden="true" />
        <strong>{copy.commands}</strong>
        <span className={styles.titleRule} aria-hidden="true" />
        <span className={`${styles.windowControl} ${styles.windowControlRight}`} aria-hidden="true" />
      </div>

      <div className={styles.launchArea}>
        <div className={styles.sectionLabel}>
          <span>01</span>
          <div>
            <strong>{copy.launchTitle}</strong>
            <small>{copy.launchDescription}</small>
          </div>
        </div>

        <div className={styles.actionGrid}>
          {onOpenDemo && (
            <button className={`${styles.action} ${styles.primaryAction}`} type="button" onClick={onOpenDemo}>
              <span className={styles.actionIcon} aria-hidden="true">▶</span>
              <span className={styles.actionCopy}><small>{copy.liveDemo}</small><strong>{resolvedDemoLabel}</strong></span>
              <span className={styles.runState}><i /> {copy.ready}</span>
            </button>
          )}
          {website && <ResourceLink resource={website} locale={locale} prominent />}
          {artifacts.map((artifact, index) => (
            <ResourceLink
              key={`${artifact.href}-${artifact.label}`}
              resource={artifact}
              locale={locale}
              prominent={!hasPrincipalAction && index === 0}
            />
          ))}
          {source && <ResourceLink resource={{ ...source, kind: source.kind || "SOURCE" }} locale={locale} />}
          {onOpenSystemApp && (
            <button className={styles.action} type="button" onClick={onOpenSystemApp}>
              <span className={styles.actionIcon} aria-hidden="true">⌘</span>
              <span className={styles.actionCopy}><small>{copy.systemSeven}</small><strong>{resolvedSystemAppLabel}</strong></span>
              <span className={styles.newWindow}>{copy.inDesktop}</span>
            </button>
          )}
          {!hasLaunchAction && (
            <div className={styles.emptyAction} role="note">
              <span aria-hidden="true">i</span>
              <div>
                <strong>{copy.emptyTitle}</strong>
                <small>{copy.emptyDescription}</small>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={styles.shareArea}>
        <div className={styles.sectionLabel}>
          <span>02</span>
          <div>
            <strong>{copy.shareTitle}</strong>
            <small>{copy.shareDescription}</small>
          </div>
        </div>

        <div className={styles.permalinkRow}>
          <label className={styles.addressField}>
            <span>{copy.directAddress}</span>
            <input
              ref={permalinkRef}
              type="text"
              value={permalink}
              readOnly
              spellCheck={false}
              aria-describedby={`share-status-${projectSlug}`}
              onFocus={(event) => event.currentTarget.select()}
            />
          </label>
          <div className={styles.shareButtons}>
            <button type="button" onClick={copyPermalink}>
              <span aria-hidden="true">⎘</span>
              {shareStatus === "copied" ? copy.copied : copy.copyLink}
            </button>
            <button type="button" onClick={shareProject}>
              <span aria-hidden="true">⇱</span>
              {copy.share}
            </button>
            <a
              href={permalink || undefined}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={!permalink}
              onClick={(event) => {
                if (!permalink) event.preventDefault();
              }}
            >
              <span aria-hidden="true">↗</span>
              {copy.openLink}
              <span className={styles.srOnly}>{copy.inNewWindow}</span>
            </a>
          </div>
        </div>

        <p
          id={`share-status-${projectSlug}`}
          className={`${styles.shareStatus} ${shareStatus === "idle" ? "" : styles[`status_${shareStatus}`]}`}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <span aria-hidden="true">{shareStatus === "idle" ? "i" : "✓"}</span>
          {copy.status[shareStatus]}
        </p>
      </div>
    </section>
  );
}
