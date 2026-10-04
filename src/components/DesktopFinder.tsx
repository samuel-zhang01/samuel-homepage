"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { projects } from "@/data/projects";
import { translateText, type Locale } from "@/lib/i18n";
import { projectText } from "@/lib/projectCopy";
import { foldSearch, parseProjectSearchIndex, searchExcerpt, type ProjectSearchIndex } from "@/lib/projectSearch";
import type { AppId } from "./SystemSevenDesktop";
import { System7Icon, type System7IconKind } from "./System7Icon";
import { getApplicationIcon, getProjectIcon } from "@/lib/iconIdentity";
import { desktopCopy } from "./desktopCopy";
import styles from "./DesktopFinder.module.css";

export type FinderApplication = {
  id: AppId;
  title: string;
  description: string;
};

type FinderResult = {
  key: string;
  title: string;
  description: string;
  kind: "application" | "project";
  search: string;
  appId?: AppId;
  projectSlug?: string;
  icon: System7IconKind;
  excerpt?: string;
};

const indexCache = new Map<Locale, ProjectSearchIndex>();

export default function DesktopFinder({
  applications,
  locale,
  onClose,
  onOpenApplication,
  onOpenProject,
}: {
  applications: FinderApplication[];
  locale: Locale;
  onClose: () => void;
  onOpenApplication: (id: AppId) => void;
  onOpenProject: (slug: string) => void;
}) {
  const t = (text: string) => translateText(locale, text);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const [query, setQuery] = useState("");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [detailed, setDetailed] = useState(false);
  const [loadedIndex, setLoadedIndex] = useState<{ locale: Locale; index: ProjectSearchIndex } | null>(null);
  const [indexError, setIndexError] = useState(false);
  const [retry, setRetry] = useState(0);
  const detailIndex = loadedIndex?.locale === locale ? loadedIndex.index : null;
  const loading = detailed && !detailIndex && !indexError;
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!detailed) return;
    setIndexError(false);
    const cached = indexCache.get(locale);
    if (cached) { setLoadedIndex({ locale, index: cached }); return; }
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15_000);
    let active = true;
    fetch(`/search/project-text-${locale.toLowerCase()}.json`, { signal: controller.signal, credentials: "same-origin" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Search index unavailable");
        const index = parseProjectSearchIndex(await response.json(), projects.map((project) => project.slug));
        if (!active) return;
        indexCache.set(locale, index);
        setLoadedIndex({ locale, index });
      })
      .catch(() => { if (active) setIndexError(true); })
      .finally(() => window.clearTimeout(timeout));
    return () => { active = false; controller.abort(); window.clearTimeout(timeout); };
  }, [detailed, locale, retry]);

  // Native modal behavior supplies focus containment and makes the desktop
  // inert, including pointer and screen-reader navigation behind the dialog.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    searchRef.current?.focus();
    return () => dialog.close();
  }, []);

  const allResults = useMemo<FinderResult[]>(() => [
    ...applications.map((app) => {
      const title = projectText(locale, desktopCopy, app.title);
      const description = projectText(locale, desktopCopy, app.description);
      return {
        key: `app-${app.id}`, kind: "application" as const,
        appId: app.id, title, description, icon: getApplicationIcon(app.id),
        search: foldSearch(`${app.title} ${title} ${app.description} ${description}`),
      };
    }),
    ...projects.map((project) => ({
      key: `project-${project.slug}`, kind: "project" as const,
      projectSlug: project.slug, icon: getProjectIcon(project.slug),
      title: translateText(locale, project.shortTitle ?? project.title),
      description: translateText(locale, project.summary),
      search: foldSearch([
        project.title, project.shortTitle, translateText(locale, project.title), project.summary,
        translateText(locale, project.summary), project.area, ...project.tools,
      ].join(" ")),
    })),
  ], [applications, locale]);
  const results = useMemo(() => {
    const words = foldSearch(query).trim().split(/\s+/u).filter(Boolean);
    const matches: FinderResult[] = [];
    const deeperMatches: FinderResult[] = [];
    for (const result of allResults) {
      if (words.every((word) => result.search.includes(word))) { matches.push(result); continue; }
      const document = detailed && result.projectSlug ? detailIndex?.get(result.projectSlug) : undefined;
      if (document && words.every((word) => result.search.includes(word) || document.search.includes(word))) {
        deeperMatches.push({ ...result, excerpt: searchExcerpt(document.text, words) });
      }
    }
    return [...matches, ...deeperMatches];
  }, [allResults, query, detailed, detailIndex]);
  const selectedIndex = Math.max(0, results.findIndex((result) => result.key === selectedKey));
  const selected = results[selectedIndex];

  useEffect(() => {
    const list = resultsRef.current;
    const option = selected ? document.getElementById(`finder-${selected.key}`) : null;
    if (!list || !option) return;
    // Keep keyboard navigation inside the results. scrollIntoView also scrolls
    // the outer dialog on short screens and can hide the search field.
    const optionBounds = option.getBoundingClientRect();
    const listBounds = list.getBoundingClientRect();
    if (optionBounds.top < listBounds.top) list.scrollTop -= listBounds.top - optionBounds.top;
    else if (optionBounds.bottom > listBounds.bottom) list.scrollTop += optionBounds.bottom - listBounds.bottom;
  }, [selected]);

  function openResult(result: FinderResult | undefined) {
    if (!result) return;
    if (result.appId) onOpenApplication(result.appId);
    else if (result.projectSlug) onOpenProject(result.projectSlug);
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing || event.defaultPrevented) return;
    if (event.key === "Escape") {
      // Search inputs otherwise consume the first Escape to clear their text.
      event.preventDefault();
      event.stopPropagation();
      onCloseRef.current();
    } else if (event.key === "Enter") {
      event.preventDefault();
      openResult(selected);
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!results.length) return;
      const delta = event.key === "ArrowDown" ? 1 : -1;
      setSelectedKey(results[(selectedIndex + delta + results.length) % results.length].key);
    }
  }

  function containTabFocus(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== "Tab" || event.defaultPrevented) return;
    // Some engines move focus to the document after the final modal control.
    // Keep both directions inside Find instead of leaving an invisible stop.
    const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(
      'button:not([disabled]):not([tabindex="-1"]), input:not([disabled]):not([tabindex="-1"]), [tabindex="0"]',
    )).filter(control => control.getClientRects().length > 0);
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.finder}
      aria-labelledby="finder-title"
      aria-describedby="finder-description"
      onKeyDown={containTabFocus}
      onCancel={(event) => { event.preventDefault(); onCloseRef.current(); }}
    >
      <header className={styles.titlebar}>
        <button type="button" className={styles.closeBox} aria-label={t("Close Find")} onClick={onClose} />
        <h2 id="finder-title">{t("Find…")}</h2>
        <span aria-hidden="true" />
      </header>
      <div className={styles.body}>
        <div className={styles.intro}>
          <span className={styles.introIcon} aria-hidden="true"><System7Icon kind="finder" /></span>
          <p id="finder-description">{t("Find an app, a project, or a useful little distraction.")}</p>
        </div>
        <label className={styles.searchLabel} htmlFor="finder-search">{t("Name or keyword")}</label>
        <div className={styles.searchRow}>
          <input
            ref={searchRef}
            id="finder-search"
            type="search"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded="true"
            aria-controls="finder-results"
            aria-activedescendant={selected ? `finder-${selected.key}` : undefined}
            autoComplete="off"
            spellCheck={false}
            maxLength={120}
            value={query}
            onChange={(event) => { setQuery(event.target.value); setSelectedKey(null); }}
            onKeyDown={handleSearchKeyDown}
          />
          <button type="button" disabled={!query} onClick={() => { setQuery(""); setSelectedKey(null); searchRef.current?.focus(); }}>{t("Clear")}</button>
        </div>
        <label className={styles.detailToggle}>
          <input type="checkbox" checked={detailed} onChange={(event) => { setDetailed(event.target.checked); setSelectedKey(null); }} aria-describedby="finder-detail-description" />
          {t("Detailed search")}
        </label>
        <p className={styles.detailHelp} id="finder-detail-description">{t("Include project write-ups, build logs and demo text. Private notes and imported files are never indexed.")}</p>
        {loading && <p className={styles.indexStatus} role="status">{t("Loading the project text index…")}</p>}
        {detailed && indexError && <div className={styles.indexStatus} role="status">
          <span>{t("Detailed search is unavailable. Name and keyword search still works.")}</span>
          <button type="button" onClick={() => { setIndexError(false); setRetry((value) => value + 1); }}>{t("Try again")}</button>
        </div>}
        <div className={styles.listHeader}>
          <span>{t("On Samuel HD")}</span>
          <span role="status">{t("Matches")}: {new Intl.NumberFormat(locale).format(results.length)}</span>
        </div>
        <div ref={resultsRef} className={styles.results} id="finder-results" role="listbox" aria-label={t("Found items")} aria-busy={loading}>
          {results.map((result) => (
            <button
              type="button"
              role="option"
              tabIndex={-1}
              id={`finder-${result.key}`}
              key={result.key}
              aria-selected={selected?.key === result.key}
              onPointerDown={(event) => event.preventDefault()}
              onClick={() => openResult(result)}
            >
              <span className={styles.itemIcon} aria-hidden="true">
                <System7Icon kind={result.icon} miniature />
              </span>
              <span className={styles.itemCopy}>
                <strong>{result.title}</strong>
                <small className={result.excerpt ? styles.excerpt : undefined}>{result.excerpt ?? result.description}</small>
              </span>
              <span className={styles.itemKind}>{result.kind === "project" ? t("Project file") : t("Application")}</span>
            </button>
          ))}
        </div>
        {!results.length && !loading && <p className={styles.empty}>{t("No matching files. Try a shorter name or another keyword.")}</p>}
        <footer className={styles.footer}>
          <p>{t("↑ ↓ to choose · Return to open · Esc to cancel")}</p>
          <div>
            <button type="button" onClick={onClose}>{t("Cancel")}</button>
            <button type="button" className={styles.defaultButton} disabled={!selected} onClick={() => openResult(selected)}>{t("Open")}</button>
          </div>
        </footer>
      </div>
    </dialog>
  );
}
