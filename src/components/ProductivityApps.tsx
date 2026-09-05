"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { translateText, type Locale } from "@/lib/i18n";
import { advanceFocusState, enterCalculatorDecimal, enterCalculatorDigit, localDateKey, type FocusState } from "@/lib/deskBehavior";
import ProductivityExtras, { normaliseProductivityExtraBackup } from "./ProductivityExtras";
import styles from "./ProductivityApps.module.css";

export type ProductivityAppId =
  | "desk"
  | "notepad"
  | "sketch"
  | "tasks"
  | "focus"
  | "calendar"
  | "calculator"
  | "converter"
  | "palette";

type ProductivityAppsProps = {
  app: ProductivityAppId;
  locale: Locale;
  openApp: (id: ProductivityAppId | "orbitals") => void;
};

type AccessoryKind = ProductivityAppId | "orbitals";

const NOTE_PAGE_COUNT = 8;
const NOTE_STORAGE_KEY = "samuel-system7-notepad-v1";
const FOCUS_STORAGE_KEY = "samuel-system7-focus-v1";
const CALCULATOR_STORAGE_KEY = "samuel-system7-calculator-v1";
const DESK_RESTORE_EVENT = "samuel-desk-storage-restored";
const DESK_FLUSH_EVENT = "samuel-desk-storage-flush";
const MAX_BACKUP_FILE_BYTES = 12_000_000;
// The bounded Sketch Pad is the largest entry (120 × 500 quantised points).
// Two million characters leaves headroom below common per-origin storage caps.
const MAX_BACKUP_ENTRY_CHARS = 2_000_000;
const DESK_STORAGE_KEYS = [
  NOTE_STORAGE_KEY,
  FOCUS_STORAGE_KEY,
  CALCULATOR_STORAGE_KEY,
  "samuel-system7-sketch-v1",
  "samuel-system7-tasks-v1",
  "samuel-system7-calendar-v1",
  "samuel-system7-converter-v1",
  "samuel-system7-palette-v1",
] as const;

type DeskFlushDetail = { failedKeys: string[] };

function reportFlushFailure(event: Event | undefined, key: string) {
  const detail = (event as CustomEvent<DeskFlushDetail> | undefined)?.detail;
  if (Array.isArray(detail?.failedKeys) && !detail.failedKeys.includes(key)) detail.failedKeys.push(key);
}

function normaliseDeskBackupEntry(key: string, raw: string): string | null {
  const extra = normaliseProductivityExtraBackup(key, raw);
  if (extra !== null) return extra;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (parsed.version !== 1) return null;
    if (key === NOTE_STORAGE_KEY) {
      if (!Array.isArray(parsed.pages) || parsed.pages.length !== NOTE_PAGE_COUNT || !parsed.pages.every((page) => typeof page === "string" && page.length <= 8_000)) return null;
      if (typeof parsed.activePage !== "number" || !Number.isInteger(parsed.activePage) || parsed.activePage < 0 || parsed.activePage >= NOTE_PAGE_COUNT) return null;
      const sourcePages = parsed.pages as string[];
      const pages = emptyNotePages().map((_, index) => sourcePages[index] ?? "");
      return JSON.stringify({ version: 1, activePage: parsed.activePage, pages });
    }
    if (key === FOCUS_STORAGE_KEY) {
      const durationSeconds = parsed.durationSeconds;
      const remainingSeconds = parsed.remainingSeconds;
      const endsAt = parsed.endsAt;
      const completedCount = parsed.completedCount;
      if (
        typeof durationSeconds !== "number" || !Number.isInteger(durationSeconds) || durationSeconds < 60 || durationSeconds > 7_200
        || typeof remainingSeconds !== "number" || !Number.isInteger(remainingSeconds) || remainingSeconds < 0 || remainingSeconds > durationSeconds
        || typeof parsed.running !== "boolean"
        || (endsAt !== null && (typeof endsAt !== "number" || !Number.isFinite(endsAt) || endsAt > Date.now() + durationSeconds * 1_000 + 1_000))
        || (parsed.running && typeof endsAt !== "number")
        || typeof parsed.completedDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(parsed.completedDate)
        || typeof completedCount !== "number" || !Number.isInteger(completedCount) || completedCount < 0 || completedCount > 10_000
      ) return null;
      return JSON.stringify({
        version: 1,
        durationSeconds,
        remainingSeconds,
        endsAt: parsed.running ? endsAt : null,
        running: parsed.running,
        completedDate: parsed.completedDate,
        completedCount,
      });
    }
    if (key === CALCULATOR_STORAGE_KEY) {
      if (!Array.isArray(parsed.tape) || parsed.tape.length > 8) return null;
      const seenIds = new Set<number>();
      const tape: TapeEntry[] = [];
      for (const entry of parsed.tape) {
        if (typeof entry !== "object" || entry === null) return null;
        const candidate = entry as Partial<TapeEntry>;
        if (
          typeof candidate.id !== "number"
          || !Number.isSafeInteger(candidate.id)
          || candidate.id < 0
          || seenIds.has(candidate.id)
          || typeof candidate.expression !== "string"
          || candidate.expression.length > 80
          || typeof candidate.result !== "string"
          || candidate.result.length > 40
        ) return null;
        seenIds.add(candidate.id);
        tape.push({
          id: candidate.id,
          expression: candidate.expression,
          result: candidate.result,
        });
      }
      return JSON.stringify({ version: 1, tape });
    }
  } catch {
    return null;
  }
  return null;
}

function AccessoryIcon({ kind, compact = false }: { kind: AccessoryKind; compact?: boolean }) {
  const common = {
    fill: "none",
    stroke: "#111",
    strokeWidth: 3,
    strokeLinecap: "square" as const,
    strokeLinejoin: "miter" as const,
  };

  const artwork: Record<AccessoryKind, React.ReactNode> = {
    orbitals: (
      <g {...common}>
        <path d="M5 5h38v38H5z" fill="#fffdf0" />
        <path d="M23 23C3 22 6 4 17 10c5 3 7 8 6 13ZM25 25c20 1 17 19 6 13-5-3-7-8-6-13Z" fill="#11177a" strokeWidth="2" />
        <path d="M25 23c1-20 19-17 13-6-3 5-8 7-13 6ZM23 25C22 45 4 42 10 31c3-5 8-7 13-6Z" fill="#bd674b" strokeWidth="2" />
        <circle cx="24" cy="24" r="2" fill="#111" />
      </g>
    ),
    desk: (
      <g {...common}>
        <path d="M4 14h15l4-6h10l4 6h7v29H4z" fill="#f2ca59" />
        <path d="M9 20h12v16H9z" fill="#fff" strokeWidth="2" />
        <circle cx="33" cy="28" r="8" fill="#d8d8d2" strokeWidth="2" />
        <path d="M33 23v6l4 2" strokeWidth="2" />
      </g>
    ),
    notepad: (
      <g {...common}>
        <path d="M8 4h31v40H8z" fill="#fffdf0" />
        <path d="M14 13h19M14 20h19M14 27h19M14 34h13" stroke="#6b78a8" strokeWidth="2" />
        <path d="M31 44v-9h8" fill="#f2ca59" />
        <path d="M13 4v6M21 4v6M29 4v6" strokeWidth="2" />
      </g>
    ),
    focus: (
      <g {...common}>
        <circle cx="24" cy="26" r="17" fill="#fff" />
        <path d="M18 4h12M24 4v5M37 12l4 4M11 12l-4 4" />
        <path d="M24 15v12l8 5" stroke="#11177a" />
        <circle cx="24" cy="26" r="2" fill="#111" />
      </g>
    ),
    calculator: (
      <g {...common}>
        <rect x="7" y="3" width="34" height="42" fill="#d8d8d2" />
        <rect x="12" y="8" width="24" height="8" fill="#cfe0b8" strokeWidth="2" />
        {[0, 1, 2].map((row) => [0, 1, 2].map((column) => (
          <rect
            key={`${row}-${column}`}
            x={12 + column * 9}
            y={21 + row * 8}
            width="6"
            height="5"
            fill={column === 2 ? "#f2ca59" : "#fff"}
            strokeWidth="2"
          />
        )))}
      </g>
    ),
    sketch: (
      <g {...common}>
        <path d="M5 7h31l7 7v28H5z" fill="#fff" />
        <path d="M36 7v8h7" fill="#d8d8d2" />
        <path d="m12 34 4-9 17-17 6 6-17 17z" fill="#f2ca59" />
        <path d="m16 25 6 6" strokeWidth="2" />
        <path d="M11 36c7-2 14-1 21 2" stroke="#11177a" strokeWidth="2" />
      </g>
    ),
    tasks: (
      <g {...common}>
        <path d="M7 5h34v39H7z" fill="#fffdf0" />
        <path d="m12 15 3 3 6-7M12 27l3 3 6-7" stroke="#237747" />
        <path d="M24 15h11M24 27h11M12 38h23" stroke="#6b78a8" strokeWidth="2" />
      </g>
    ),
    calendar: (
      <g {...common}>
        <path d="M5 9h38v34H5z" fill="#fff" />
        <path d="M5 9h38v10H5z" fill="#b83b3b" />
        <path d="M14 4v10M34 4v10" />
        <path d="M12 25h6v6h-6zm9 0h6v6h-6zm9 0h6v6h-6zM12 34h6v5h-6zm9 0h6v5h-6z" fill="#d8d8d2" strokeWidth="2" />
      </g>
    ),
    converter: (
      <g {...common}>
        <path d="M7 13h29M30 7l6 6-6 6" stroke="#11177a" />
        <path d="M41 35H12M18 29l-6 6 6 6" stroke="#b83b3b" />
        <rect x="5" y="6" width="8" height="14" fill="#f2ca59" strokeWidth="2" />
        <rect x="35" y="28" width="8" height="14" fill="#d3e5c2" strokeWidth="2" />
      </g>
    ),
    palette: (
      <g {...common}>
        <path d="M24 5c-12 0-20 8-20 18 0 8 7 16 15 16h4c3 0 4-3 2-5-2-3 0-7 4-7h7c5 0 8-4 8-8C44 11 35 5 24 5z" fill="#fff" />
        <circle cx="13" cy="19" r="3" fill="#ef5647" strokeWidth="2" />
        <circle cx="22" cy="13" r="3" fill="#f2ca59" strokeWidth="2" />
        <circle cx="32" cy="16" r="3" fill="#4e9a61" strokeWidth="2" />
        <circle cx="16" cy="29" r="3" fill="#4568b2" strokeWidth="2" />
      </g>
    ),
  };

  return (
    <span className={`${styles.accessoryIcon}${compact ? ` ${styles.accessoryIconCompact}` : ""}`} aria-hidden="true">
      <svg viewBox="0 0 48 48" shapeRendering="crispEdges">{artwork[kind]}</svg>
    </span>
  );
}

function DeskAccessories({ locale, openApp }: Omit<ProductivityAppsProps, "app">) {
  const t = (value: string) => translateText(locale, value);
  const restoreInputRef = useRef<HTMLInputElement | null>(null);
  const [backupStatus, setBackupStatus] = useState("");
  const accessories: Array<{
    id: Exclude<ProductivityAppId, "desk"> | "orbitals";
    name: string;
    eyebrow: string;
    description: string;
  }> = [
    {
      id: "orbitals",
      name: "Orbital Lab",
      eyebrow: "A SMALL QUANTUM LABORATORY",
      description: "Explore atomic orbitals in a fast, browser-local ASCII laboratory.",
    },
    {
      id: "notepad",
      name: "Note Pad",
      eyebrow: "EIGHT QUICK PAGES",
      description: "Jot something down, turn the page and find it here next time.",
    },
    {
      id: "sketch",
      name: "Sketch Pad",
      eyebrow: "INK WITHOUT THE MESS",
      description: "Draw with mouse, trackpad or touch; undo freely and export a PNG.",
    },
    {
      id: "tasks",
      name: "Quick List",
      eyebrow: "A TINY COMMAND CENTRE",
      description: "Capture tasks, mark priorities and keep the list across visits.",
    },
    {
      id: "focus",
      name: "Focus Clock",
      eyebrow: "A FRIENDLIER ALARM CLOCK",
      description: "Run a focus sprint, take a short break and keep a tiny daily tally.",
    },
    {
      id: "calendar",
      name: "Pocket Calendar",
      eyebrow: "DATES WITH A MEMORY",
      description: "Plan by day with a private note saved to this browser.",
    },
    {
      id: "calculator",
      name: "Desk Calculator",
      eyebrow: "WITH PAPER TAPE",
      description: "Make a quick calculation and keep the latest workings in view.",
    },
    {
      id: "converter",
      name: "Unit Converter",
      eyebrow: "MEASURE TWICE",
      description: "Convert everyday length, mass, temperature and data units.",
    },
    {
      id: "palette",
      name: "Colour Studio",
      eyebrow: "COLOUR WITH CONTRAST",
      description: "Build accessible palettes, check contrast and save favourite swatches.",
    },
  ];

  const exportBackup = () => {
    try {
      const flushDetail: DeskFlushDetail = { failedKeys: [] };
      window.dispatchEvent(new CustomEvent<DeskFlushDetail>(DESK_FLUSH_EVENT, { detail: flushDetail }));
      if (flushDetail.failedKeys.length > 0) throw new Error("flush-failed");
      const apps: Record<string, string> = {};
      for (const key of DESK_STORAGE_KEYS) {
        const value = window.localStorage.getItem(key);
        if (value !== null) {
          const normalised = value.length <= MAX_BACKUP_ENTRY_CHARS ? normaliseDeskBackupEntry(key, value) : null;
          if (normalised === null) {
            throw new Error("invalid-local-data");
          }
          apps[key] = normalised;
        }
      }
      const backup = JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), apps }, null, 2);
      const blob = new Blob([backup], { type: "application/json;charset=utf-8" });
      if (blob.size > MAX_BACKUP_FILE_BYTES) throw new Error("backup-too-large");
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `samuel-desk-backup-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
      setBackupStatus("Desk backup downloaded.");
    } catch {
      setBackupStatus("Backup unavailable in this browser.");
    }
  };

  const restoreBackup = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      if (file.size > MAX_BACKUP_FILE_BYTES) throw new Error("backup-too-large");
      const parsed = JSON.parse(await file.text()) as { version?: unknown; apps?: unknown };
      if (parsed.version !== 1 || typeof parsed.apps !== "object" || parsed.apps === null || Array.isArray(parsed.apps)) {
        throw new Error("invalid-backup");
      }
      const apps = parsed.apps as Record<string, unknown>;
      const candidates = new Map<string, string>();
      for (const key of DESK_STORAGE_KEYS) {
        if (!Object.hasOwn(apps, key)) continue;
        const value = apps[key];
        if (typeof value !== "string" || value.length > MAX_BACKUP_ENTRY_CHARS) throw new Error("invalid-entry");
        const normalised = normaliseDeskBackupEntry(key, value);
        if (normalised === null) throw new Error("invalid-entry");
        candidates.set(key, normalised);
      }
      if (!window.confirm(t("Restore this backup? It will replace your current Desk Accessories data."))) return;
      const originals = new Map(DESK_STORAGE_KEYS.map((key) => [key, window.localStorage.getItem(key)]));
      try {
        for (const key of DESK_STORAGE_KEYS) {
          const value = candidates.get(key);
          if (value === undefined) window.localStorage.removeItem(key);
          else window.localStorage.setItem(key, value);
        }
      } catch (error) {
        for (const [key, value] of originals) {
          try {
            if (value === null) window.localStorage.removeItem(key);
            else window.localStorage.setItem(key, value);
          } catch {
            // Continue restoring every original entry on a best-effort basis.
          }
        }
        throw error;
      }
      window.dispatchEvent(new Event(DESK_RESTORE_EVENT));
      setBackupStatus("Backup restored. Open accessories are refreshed.");
    } catch {
      setBackupStatus("That file is not a valid Desk Accessories backup.");
    }
  };

  return (
    <div className={styles.launcher}>
      <header className={styles.launcherHeader}>
        <div>
          <span className={styles.eyebrow}>{t("DESK ACCESSORIES")}</span>
          <h3>{t("A few useful things, left within reach.")}</h3>
        </div>
        <AccessoryIcon kind="desk" />
      </header>
      <p className={styles.launcherIntro}>
        {t("Eight everyday tools and an orbital lab, all in this browser. Your notes, drawings and plans stay on this device; nothing is uploaded or synced.")}
      </p>
      <section className={styles.storageStrip} aria-label={t("Desk data and backup")}>
        <span className={styles.storageLamp} aria-hidden="true" />
        <div>
          <strong>{t("Local autosave is on")}</strong>
          <small>{t("Export one backup file whenever you want to move your desk.")}</small>
        </div>
        <div className={styles.storageActions}>
          <button type="button" onClick={exportBackup}>{t("Export backup")}</button>
          <button type="button" onClick={() => restoreInputRef.current?.click()}>{t("Restore backup…")}</button>
          <input
            ref={restoreInputRef}
            className={styles.srOnly}
            type="file"
            tabIndex={-1}
            accept="application/json,.json"
            onChange={restoreBackup}
            aria-label={t("Choose a Desk Accessories backup")}
          />
        </div>
        <span className={styles.backupStatus} role="status">{backupStatus ? t(backupStatus) : ""}</span>
      </section>
      <div className={styles.accessoryGrid}>
        {accessories.map((accessory) => (
          <button
            key={accessory.id}
            type="button"
            className={styles.accessoryCard}
            onClick={() => openApp(accessory.id)}
            aria-label={`${t("Open")} ${t(accessory.name)}. ${t(accessory.description)}`}
          >
            <AccessoryIcon kind={accessory.id} />
            <span className={styles.accessoryCardCopy}>
              <small>{t(accessory.eyebrow)}</small>
              <strong>{t(accessory.name)}</strong>
              <span>{t(accessory.description)}</span>
            </span>
            <span className={styles.openGlyph} aria-hidden="true">↗</span>
          </button>
        ))}
      </div>
      <p className={styles.launcherFootnote}>
        {t("Inspired by the desk accessories tucked into the classic Macintosh Apple menu.")}
      </p>
    </div>
  );
}

function emptyNotePages(): string[] {
  return Array.from({ length: NOTE_PAGE_COUNT }, () => "");
}

function countWords(value: string, locale: Locale): number {
  if (!value.trim()) return 0;
  if (typeof Intl.Segmenter === "function") {
    const segmenter = new Intl.Segmenter(locale, { granularity: "word" });
    return Array.from(segmenter.segment(value)).filter((segment) => segment.isWordLike).length;
  }
  return value.trim().split(/\s+/u).length;
}

function formatNotePage(locale: Locale, current: number, total: number): string {
  if (locale === "zh-CN") return `第 ${current} 页，共 ${total} 页`;
  if (locale === "zh-TW") return `第 ${current} 頁，共 ${total} 頁`;
  return `Page ${current} of ${total}`;
}

function formatNoteEditorLabel(locale: Locale, page: number): string {
  const title = translateText(locale, "Note Pad");
  if (locale === "zh-CN") return `${title} — 第 ${page} 页`;
  if (locale === "zh-TW") return `${title} — 第 ${page} 頁`;
  return `${title} — ${translateText(locale, "Page")} ${page}`;
}

function NotePad({ locale }: { locale: Locale }) {
  const t = (value: string) => translateText(locale, value);
  const [pages, setPages] = useState<string[]>(emptyNotePages);
  const [activePage, setActivePage] = useState(0);
  const [storageReady, setStorageReady] = useState(false);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "unavailable">("saved");
  const [clearArmed, setClearArmed] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const storageAvailableRef = useRef(true);
  const latestNoteRef = useRef({ activePage: 0, pages: emptyNotePages() });
  latestNoteRef.current = { activePage, pages };

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(NOTE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as { version?: number; activePage?: number; pages?: unknown };
        const storedPages = parsed.pages;
        if (parsed.version === 1 && Array.isArray(storedPages)) {
          const restored = emptyNotePages().map((_, index) => (
            typeof storedPages[index] === "string" ? storedPages[index].slice(0, 8_000) : ""
          ));
          const restoredPage = Number.isInteger(parsed.activePage) && parsed.activePage! >= 0 && parsed.activePage! < NOTE_PAGE_COUNT
            ? parsed.activePage!
            : 0;
          latestNoteRef.current = { activePage: restoredPage, pages: restored };
          setPages(restored);
          setActivePage(restoredPage);
        }
      }
    } catch {
      storageAvailableRef.current = false;
      setSaveState("unavailable");
    } finally {
      setStorageReady(true);
    }
  }, []);

  useEffect(() => {
    if (!storageReady || !storageAvailableRef.current) return;
    setSaveState("saving");
    const saveTimer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(NOTE_STORAGE_KEY, JSON.stringify({ version: 1, activePage, pages }));
        setSaveState("saved");
      } catch {
        storageAvailableRef.current = false;
        setSaveState("unavailable");
      }
    }, 180);
    return () => window.clearTimeout(saveTimer);
  }, [activePage, pages, storageReady]);

  useEffect(() => {
    if (!storageReady) return;
    const flush = (event?: Event) => {
      try {
        window.localStorage.setItem(NOTE_STORAGE_KEY, JSON.stringify({ version: 1, ...latestNoteRef.current }));
        storageAvailableRef.current = true;
        setSaveState("saved");
      } catch {
        storageAvailableRef.current = false;
        setSaveState("unavailable");
        reportFlushFailure(event, NOTE_STORAGE_KEY);
      }
    };
    const restore = () => {
      try {
        const raw = window.localStorage.getItem(NOTE_STORAGE_KEY);
        const parsed = raw ? JSON.parse(normaliseDeskBackupEntry(NOTE_STORAGE_KEY, raw) ?? "null") as { activePage: number; pages: string[] } | null : null;
        const next = parsed ?? { activePage: 0, pages: emptyNotePages() };
        latestNoteRef.current = next;
        setActivePage(next.activePage);
        setPages(next.pages);
        setClearArmed(false);
        storageAvailableRef.current = true;
        setSaveState("saved");
      } catch {
        storageAvailableRef.current = false;
        setSaveState("unavailable");
      }
    };
    const restoreFromStorage = (event: StorageEvent) => {
      if (event.storageArea === window.localStorage && (event.key === NOTE_STORAGE_KEY || event.key === null)) restore();
    };
    window.addEventListener(DESK_FLUSH_EVENT, flush);
    window.addEventListener(DESK_RESTORE_EVENT, restore);
    window.addEventListener("storage", restoreFromStorage);
    window.addEventListener("pagehide", flush);
    return () => {
      flush();
      window.removeEventListener(DESK_FLUSH_EVENT, flush);
      window.removeEventListener(DESK_RESTORE_EVENT, restore);
      window.removeEventListener("storage", restoreFromStorage);
      window.removeEventListener("pagehide", flush);
    };
  }, [storageReady]);

  useEffect(() => {
    if (!clearArmed) return;
    const disarmTimer = window.setTimeout(() => setClearArmed(false), 3_000);
    return () => window.clearTimeout(disarmTimer);
  }, [clearArmed]);

  const body = pages[activePage];
  const wordCount = countWords(body, locale);

  const updateBody = (value: string) => {
    setPages((current) => current.map((page, index) => index === activePage ? value.slice(0, 8_000) : page));
    setClearArmed(false);
  };

  const turnPage = (direction: -1 | 1) => {
    setActivePage((current) => (current + direction + NOTE_PAGE_COUNT) % NOTE_PAGE_COUNT);
    setClearArmed(false);
    window.requestAnimationFrame(() => editorRef.current?.focus());
  };

  const insertDate = () => {
    const date = new Intl.DateTimeFormat(locale, { dateStyle: "full" }).format(new Date());
    const editor = editorRef.current;
    const start = editor?.selectionStart ?? body.length;
    const end = editor?.selectionEnd ?? body.length;
    const prefix = start > 0 && body[start - 1] !== "\n" ? "\n" : "";
    const insertion = `${prefix}${date}\n`;
    updateBody(`${body.slice(0, start)}${insertion}${body.slice(end)}`);
    window.requestAnimationFrame(() => {
      const caret = start + insertion.length;
      editorRef.current?.focus();
      editorRef.current?.setSelectionRange(caret, caret);
    });
  };

  const clearPage = () => {
    if (!clearArmed) {
      setClearArmed(true);
      return;
    }
    updateBody("");
    setClearArmed(false);
    editorRef.current?.focus();
  };

  const downloadPage = () => {
    const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `samuel-system7-note-${activePage + 1}.txt`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
  };

  const saveLabel = saveState === "unavailable"
    ? t("Browser storage unavailable")
    : saveState === "saving"
      ? t("Saving…")
      : t("Saved on this browser");

  return (
    <div className={styles.notePad}>
      <div className={styles.noteToolbar}>
        <button type="button" onClick={insertDate}>{t("Insert date")}</button>
        <button type="button" onClick={downloadPage} disabled={!body}>{t("Save a copy…")}</button>
        <span className={styles.toolbarSpacer} />
        <button
          type="button"
          className={clearArmed ? styles.dangerButton : undefined}
          onClick={clearPage}
          disabled={!body}
        >
          {clearArmed ? t("Clear now") : t("Clear page")}
        </button>
      </div>
      <div className={styles.notePaper}>
        <div className={styles.noteBinding} aria-hidden="true" />
        <textarea
          ref={editorRef}
          value={body}
          onChange={(event) => updateBody(event.target.value)}
          maxLength={8_000}
          spellCheck
          aria-label={formatNoteEditorLabel(locale, activePage + 1)}
          placeholder={t("Type a note, paste a thought, or make a tiny to-do list…")}
        />
      </div>
      <footer className={styles.noteStatus}>
        <span role="status" aria-live="polite">{saveLabel}</span>
        <div className={styles.notePagination}>
          <button
            type="button"
            className={styles.pageTurn}
            onClick={() => turnPage(-1)}
            aria-label={t("Previous page")}
            title={t("Previous page")}
          >
            ‹
          </button>
          <strong aria-live="polite">{formatNotePage(locale, activePage + 1, NOTE_PAGE_COUNT)}</strong>
          <button
            type="button"
            className={styles.pageTurn}
            onClick={() => turnPage(1)}
            aria-label={t("Next page")}
            title={t("Next page")}
          >
            ›
          </button>
        </div>
        <span>{wordCount} {wordCount === 1 ? t("word") : t("words")}</span>
      </footer>
    </div>
  );
}

function freshFocusState(): FocusState {
  return {
    durationSeconds: 25 * 60,
    remainingSeconds: 25 * 60,
    endsAt: null,
    running: false,
    completedDate: localDateKey(),
    completedCount: 0,
  };
}

function focusStateFromStorage(raw: string | null): { state: FocusState; completedWhileClosed: boolean } | null {
  if (!raw) return { state: freshFocusState(), completedWhileClosed: false };
  const normalised = normaliseDeskBackupEntry(FOCUS_STORAGE_KEY, raw);
  if (!normalised) return null;
  const parsed = JSON.parse(normalised) as FocusState & { version: 1 };
  const now = Date.now();
  const today = localDateKey(new Date(now));
  const expired = parsed.running && parsed.endsAt !== null && parsed.endsAt <= now;
  const expiredToday = expired && localDateKey(new Date(parsed.endsAt!)) === today;
  return {
    completedWhileClosed: expiredToday,
    state: advanceFocusState(parsed, now),
  };
}

function FocusClock({ locale }: { locale: Locale }) {
  const t = (value: string) => translateText(locale, value);
  const [timer, setTimer] = useState<FocusState>(freshFocusState);
  const [storageReady, setStorageReady] = useState(false);
  const [customMinutes, setCustomMinutes] = useState("20");
  const [now, setNow] = useState<Date | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const latestFocusRef = useRef(timer);
  latestFocusRef.current = timer;

  useEffect(() => {
    try {
      const restored = focusStateFromStorage(window.localStorage.getItem(FOCUS_STORAGE_KEY));
      if (restored) {
        latestFocusRef.current = restored.state;
        setTimer(restored.state);
        if (restored.completedWhileClosed) setAnnouncement("Focus session complete.");
      }
    } catch {
      // The clock still works for the current tab when storage is unavailable.
    } finally {
      setStorageReady(true);
    }
  }, []);

  useEffect(() => {
    const updateNow = () => {
      const next = new Date();
      const today = localDateKey(next);
      setNow(next);
      setTimer((current) => current.completedDate === today
        ? current
        : { ...current, completedDate: today, completedCount: 0 });
    };
    updateNow();
    const clockTimer = window.setInterval(updateNow, 1_000);
    return () => window.clearInterval(clockTimer);
  }, []);

  useEffect(() => {
    if (!timer.running || timer.endsAt === null) return;
    const tick = () => {
      const current = latestFocusRef.current;
      const next = advanceFocusState(current);
      if (next === current) return;
      if (current.running && !next.running && current.endsAt !== null && localDateKey(new Date(current.endsAt)) === next.completedDate) {
        setAnnouncement("Focus session complete.");
      }
      latestFocusRef.current = next;
      setTimer(next);
    };
    tick();
    const interval = window.setInterval(tick, 250);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [timer.endsAt, timer.running]);

  useEffect(() => {
    if (!storageReady) return;
    try {
      window.localStorage.setItem(FOCUS_STORAGE_KEY, JSON.stringify({ version: 1, ...timer }));
    } catch {
      // Persistence is an enhancement; the active timer remains usable.
    }
  }, [storageReady, timer]);

  useEffect(() => {
    if (!storageReady) return;
    const flush = (event?: Event) => {
      try {
        window.localStorage.setItem(FOCUS_STORAGE_KEY, JSON.stringify({ version: 1, ...latestFocusRef.current }));
      } catch {
        // The running clock remains usable if browser storage is unavailable.
        reportFlushFailure(event, FOCUS_STORAGE_KEY);
      }
    };
    const restore = () => {
      try {
        const restored = focusStateFromStorage(window.localStorage.getItem(FOCUS_STORAGE_KEY));
        if (!restored) return;
        latestFocusRef.current = restored.state;
        setTimer(restored.state);
        setAnnouncement(restored.completedWhileClosed ? "Focus session complete." : "");
      } catch {
        // A validated backup should not reach this branch.
      }
    };
    const restoreFromStorage = (event: StorageEvent) => {
      if (event.storageArea === window.localStorage && (event.key === FOCUS_STORAGE_KEY || event.key === null)) restore();
    };
    window.addEventListener(DESK_FLUSH_EVENT, flush);
    window.addEventListener(DESK_RESTORE_EVENT, restore);
    window.addEventListener("storage", restoreFromStorage);
    window.addEventListener("pagehide", flush);
    return () => {
      flush();
      window.removeEventListener(DESK_FLUSH_EVENT, flush);
      window.removeEventListener(DESK_RESTORE_EVENT, restore);
      window.removeEventListener("storage", restoreFromStorage);
      window.removeEventListener("pagehide", flush);
    };
  }, [storageReady]);

  const chooseDuration = (minutes: number) => {
    const durationSeconds = Math.max(60, Math.min(120 * 60, Math.round(minutes * 60)));
    setTimer((current) => ({
      ...current,
      durationSeconds,
      remainingSeconds: durationSeconds,
      endsAt: null,
      running: false,
    }));
    setAnnouncement("");
  };

  const startOrPause = () => {
    const now = Date.now();
    const latest = latestFocusRef.current;
    // A click can arrive before the next clock tick after the tab wakes.
    // Settle an elapsed session first so Pause cannot lose its completion.
    if (latest.running && latest.endsAt !== null && latest.endsAt <= now) {
      const settled = advanceFocusState(latest, now);
      latestFocusRef.current = settled;
      setTimer(settled);
      setAnnouncement(localDateKey(new Date(latest.endsAt)) === settled.completedDate ? "Focus session complete." : "");
      return;
    }
    setAnnouncement("");
    setTimer((current) => {
      if (current.running && current.endsAt !== null) {
        return {
          ...current,
          remainingSeconds: Math.max(0, Math.min(current.durationSeconds, Math.ceil((current.endsAt - now) / 1_000))),
          endsAt: null,
          running: false,
        };
      }
      const remainingSeconds = current.remainingSeconds > 0
        ? current.remainingSeconds
        : current.durationSeconds;
      return {
        ...current,
        remainingSeconds,
        endsAt: Date.now() + remainingSeconds * 1_000,
        running: true,
      };
    });
  };

  const reset = () => {
    setTimer((current) => ({
      ...current,
      remainingSeconds: current.durationSeconds,
      endsAt: null,
      running: false,
    }));
    setAnnouncement("");
  };

  const minutes = Math.floor(timer.remainingSeconds / 60);
  const seconds = timer.remainingSeconds % 60;
  const progress = timer.durationSeconds > 0
    ? Math.round(((timer.durationSeconds - timer.remainingSeconds) / timer.durationSeconds) * 100)
    : 0;
  const timeLabel = now
    ? new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(now)
    : "--:--:--";
  const dateLabel = now
    ? new Intl.DateTimeFormat(locale, { weekday: "long", month: "long", day: "numeric" }).format(now)
    : "";
  const customMinuteValue = Number(customMinutes);
  const customMinutesValid = Number.isInteger(customMinuteValue) && customMinuteValue >= 1 && customMinuteValue <= 120;

  return (
    <div className={styles.focusClock}>
      <header className={styles.clockHeader}>
        <div>
          <span className={styles.eyebrow}>{t("CURRENT TIME")}</span>
          <strong>{timeLabel}</strong>
          <small>{dateLabel}</small>
        </div>
        <AccessoryIcon kind="focus" />
      </header>

      <section className={styles.timerPanel} aria-labelledby="focus-timer-heading">
        <div className={styles.timerTopline}>
          <span id="focus-timer-heading" className={styles.eyebrow}>{t("FOCUS TIMER")}</span>
          <span className={styles.localBadge}>{t("LOCAL")}</span>
        </div>
        <div
          className={`${styles.timerFace}${announcement ? ` ${styles.timerComplete}` : ""}`}
          role="progressbar"
          aria-label={t("Focus session progress")}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          aria-valuetext={locale === "zh-CN"
            ? `剩余 ${minutes} 分钟 ${seconds} 秒`
            : locale === "zh-TW"
              ? `剩餘 ${minutes} 分鐘 ${seconds} 秒`
              : `${minutes} ${minutes === 1 ? "minute" : "minutes"} ${seconds} ${seconds === 1 ? "second" : "seconds"} remaining`}
        >
          <span>{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}</span>
          <small>{timer.running ? t("COUNTING DOWN") : announcement ? t(announcement) : t("READY WHEN YOU ARE")}</small>
        </div>

        <div className={styles.presetRow} aria-label={t("Timer presets")}>
          {[25, 5, 15].map((preset) => (
            <button
              key={preset}
              type="button"
              className={timer.durationSeconds === preset * 60 ? styles.isSelected : undefined}
              onClick={() => chooseDuration(preset)}
              aria-pressed={timer.durationSeconds === preset * 60}
            >
              {preset === 25 ? t("25 min focus") : preset === 5 ? t("5 min break") : t("15 min reset")}
            </button>
          ))}
        </div>

        <div className={styles.customTimer}>
          <label htmlFor="focus-custom-minutes">{t("Custom minutes")}</label>
          <input
            id="focus-custom-minutes"
            type="number"
            min={1}
            max={120}
            value={customMinutes}
            onChange={(event) => setCustomMinutes(event.target.value)}
          />
          <button type="button" onClick={() => chooseDuration(customMinuteValue)} disabled={!customMinutesValid}>{t("Set")}</button>
        </div>

        <div className={styles.timerActions}>
          <button type="button" className={styles.defaultButton} onClick={startOrPause}>
            {timer.running ? t("Pause") : t("Start")}
          </button>
          <button type="button" onClick={reset}>{t("Reset")}</button>
        </div>
      </section>

      <footer className={styles.sessionTally}>
        <span>{t("TODAY")}</span>
        <div aria-hidden="true">
          {Array.from({ length: 4 }, (_, index) => (
            <i key={index} className={index < Math.min(4, timer.completedCount) ? styles.isFilled : undefined} />
          ))}
        </div>
        <strong>{timer.completedCount} {timer.completedCount === 1 ? t("session") : t("sessions")}</strong>
      </footer>
      <span className={styles.srOnly} aria-live="polite">{announcement ? t(announcement) : ""}</span>
    </div>
  );
}

type Operator = "+" | "−" | "×" | "÷";

type TapeEntry = {
  id: number;
  expression: string;
  result: string;
};

function calculate(left: number, right: number, operator: Operator): number {
  if (operator === "+") return left + right;
  if (operator === "−") return left - right;
  if (operator === "×") return left * right;
  return right === 0 ? Number.NaN : left / right;
}

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "Error";
  const rounded = Number(value.toPrecision(12));
  const plain = String(rounded);
  return plain.length <= 14 ? plain : rounded.toExponential(7);
}

function DeskCalculator({ locale }: { locale: Locale }) {
  const t = (value: string) => translateText(locale, value);
  const [display, setDisplay] = useState("0");
  const [accumulator, setAccumulator] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [memory, setMemory] = useState(0);
  const [tape, setTape] = useState<TapeEntry[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const latestTapeRef = useRef(tape);
  latestTapeRef.current = tape;

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(CALCULATOR_STORAGE_KEY);
      if (stored) {
        const normalised = normaliseDeskBackupEntry(CALCULATOR_STORAGE_KEY, stored);
        if (normalised) {
          const parsed = JSON.parse(normalised) as { tape: TapeEntry[] };
          const restored = parsed.tape;
          latestTapeRef.current = restored;
          setTape(restored);
        }
      }
    } catch {
      // The calculator remains fully usable without saved tape.
    } finally {
      setStorageReady(true);
    }
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    try {
      window.localStorage.setItem(CALCULATOR_STORAGE_KEY, JSON.stringify({ version: 1, tape }));
    } catch {
      // Keeping tape between visits is optional.
    }
  }, [storageReady, tape]);

  useEffect(() => {
    if (!storageReady) return;
    const flush = (event?: Event) => {
      try {
        window.localStorage.setItem(CALCULATOR_STORAGE_KEY, JSON.stringify({ version: 1, tape: latestTapeRef.current }));
      } catch {
        // Keeping tape between visits is optional.
        reportFlushFailure(event, CALCULATOR_STORAGE_KEY);
      }
    };
    const restore = () => {
      try {
        const raw = window.localStorage.getItem(CALCULATOR_STORAGE_KEY);
        const parsed = raw ? JSON.parse(normaliseDeskBackupEntry(CALCULATOR_STORAGE_KEY, raw) ?? "null") as { tape: TapeEntry[] } | null : null;
        const next = parsed?.tape ?? [];
        latestTapeRef.current = next;
        setTape(next);
      } catch {
        // A validated backup should not reach this branch.
      }
    };
    const restoreFromStorage = (event: StorageEvent) => {
      if (event.storageArea === window.localStorage && (event.key === CALCULATOR_STORAGE_KEY || event.key === null)) restore();
    };
    window.addEventListener(DESK_FLUSH_EVENT, flush);
    window.addEventListener(DESK_RESTORE_EVENT, restore);
    window.addEventListener("storage", restoreFromStorage);
    window.addEventListener("pagehide", flush);
    return () => {
      flush();
      window.removeEventListener(DESK_FLUSH_EVENT, flush);
      window.removeEventListener(DESK_RESTORE_EVENT, restore);
      window.removeEventListener("storage", restoreFromStorage);
      window.removeEventListener("pagehide", flush);
    };
  }, [storageReady]);

  const numericDisplay = Number(display);

  const inputDigit = (digit: string) => {
    setCopyStatus("");
    setDisplay(enterCalculatorDigit(display, waitingForOperand, digit));
    setWaitingForOperand(false);
  };

  const inputDecimal = () => {
    setCopyStatus("");
    setDisplay(enterCalculatorDecimal(display, waitingForOperand));
    setWaitingForOperand(false);
  };

  const commitOperation = (nextOperator: Operator) => {
    setCopyStatus("");
    const input = Number.isFinite(numericDisplay) ? numericDisplay : 0;
    if (accumulator === null || operator === null) {
      setAccumulator(input);
    } else if (!waitingForOperand) {
      const result = calculate(accumulator, input, operator);
      const formatted = formatNumber(result);
      setDisplay(formatted);
      setAccumulator(Number.isFinite(result) ? result : null);
    }
    setOperator(nextOperator);
    setWaitingForOperand(true);
  };

  const equals = () => {
    if (operator === null || accumulator === null || waitingForOperand || display === "Error") return;
    const right = numericDisplay;
    const result = calculate(accumulator, right, operator);
    const formatted = formatNumber(result);
    const expression = `${formatNumber(accumulator)} ${operator} ${formatNumber(right)} =`;
    setDisplay(formatted);
    setTape((current) => {
      const usedIds = new Set(current.map((entry) => entry.id));
      let id = Date.now();
      while (usedIds.has(id)) id += 1;
      return [...current, { id, expression, result: formatted }].slice(-8);
    });
    setAccumulator(null);
    setOperator(null);
    setWaitingForOperand(true);
  };

  const clear = () => {
    setDisplay("0");
    setAccumulator(null);
    setOperator(null);
    setWaitingForOperand(false);
    setCopyStatus("");
  };

  const toggleSign = () => {
    setCopyStatus("");
    if (display === "Error" || display === "0") return;
    setDisplay(formatNumber(-numericDisplay));
  };

  const percent = () => {
    setCopyStatus("");
    if (display === "Error") return;
    setDisplay(formatNumber(numericDisplay / 100));
    setWaitingForOperand(false);
  };

  const recallMemory = () => {
    setCopyStatus("");
    setDisplay(formatNumber(memory));
    setWaitingForOperand(false);
  };

  const changeMemory = (direction: 1 | -1) => {
    if (!Number.isFinite(numericDisplay)) return;
    setMemory((current) => current + numericDisplay * direction);
    setWaitingForOperand(true);
  };

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(display);
      setCopyStatus("Copied");
    } catch {
      setCopyStatus("Copy unavailable");
    }
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.target instanceof HTMLButtonElement && (event.key === "Enter" || event.key === " ")) return;
    if (/^\d$/.test(event.key)) inputDigit(event.key);
    else if (event.key === "." || event.key === ",") inputDecimal();
    else if (event.key === "+") commitOperation("+");
    else if (event.key === "-") commitOperation("−");
    else if (event.key === "*") commitOperation("×");
    else if (event.key === "/") commitOperation("÷");
    else if (event.key === "%") percent();
    else if (event.key === "Enter" || event.key === "=") equals();
    else if (event.key === "Escape" || event.key === "Backspace") clear();
    else return;
    event.preventDefault();
  };

  const buttons = [
    { label: "7", action: () => inputDigit("7") },
    { label: "8", action: () => inputDigit("8") },
    { label: "9", action: () => inputDigit("9") },
    { label: "÷", action: () => commitOperation("÷"), operator: true },
    { label: "4", action: () => inputDigit("4") },
    { label: "5", action: () => inputDigit("5") },
    { label: "6", action: () => inputDigit("6") },
    { label: "×", action: () => commitOperation("×"), operator: true },
    { label: "1", action: () => inputDigit("1") },
    { label: "2", action: () => inputDigit("2") },
    { label: "3", action: () => inputDigit("3") },
    { label: "−", action: () => commitOperation("−"), operator: true },
    { label: "0", action: () => inputDigit("0"), wide: true },
    { label: ".", action: inputDecimal },
    { label: "+", action: () => commitOperation("+"), operator: true },
  ];

  return (
    <div className={styles.calculator} onKeyDown={handleKeyDown} tabIndex={0} aria-label={t("Desk Calculator keyboard area")}>
      <section className={styles.calculatorMachine}>
        <div className={styles.calculatorDisplay} aria-live="polite">
          <span>{memory !== 0 ? "M" : ""}</span>
          <strong>{display === "Error" ? t("Error") : display}</strong>
          <small>{operator && accumulator !== null ? `${formatNumber(accumulator)} ${operator}` : "\u00a0"}</small>
        </div>
        <div className={styles.memoryRow}>
          <button type="button" onClick={() => setMemory(0)} aria-label={t("Memory clear")}>MC</button>
          <button type="button" onClick={recallMemory} aria-label={t("Memory recall")}>MR</button>
          <button type="button" onClick={() => changeMemory(1)} aria-label={t("Add to memory")}>M+</button>
          <button type="button" onClick={() => changeMemory(-1)} aria-label={t("Subtract from memory")}>M−</button>
        </div>
        <div className={styles.functionRow}>
          <button type="button" onClick={clear} aria-label={t("Clear calculator")}>{display === "0" && accumulator === null ? "AC" : "C"}</button>
          <button type="button" onClick={toggleSign} aria-label={t("Toggle sign")}>±</button>
          <button type="button" onClick={percent} aria-label={t("Percent")}>%</button>
          <button type="button" onClick={equals} className={styles.equalsButton} aria-label={t("Equals")}>=</button>
        </div>
        <div className={styles.keypad}>
          {buttons.map((button) => (
            <button
              key={button.label}
              type="button"
              className={`${button.operator ? styles.operatorKey : ""}${button.wide ? ` ${styles.wideKey}` : ""}`}
              onClick={button.action}
              aria-label={button.operator
                ? t(button.label === "+" ? "Add" : button.label === "−" ? "Subtract" : button.label === "×" ? "Multiply" : "Divide")
                : undefined}
            >
              {button.label}
            </button>
          ))}
        </div>
      </section>

      <aside className={styles.paperTape} aria-label={t("Recent calculations")}>
        <header>
          <div>
            <span className={styles.eyebrow}>{t("PAPER TAPE")}</span>
            <strong>{t("Recent calculations")}</strong>
          </div>
          <button type="button" onClick={() => setTape([])} disabled={tape.length === 0}>{t("Clear")}</button>
        </header>
        <ol>
          {tape.length === 0 ? (
            <li className={styles.emptyTape}>{t("Your latest eight calculations will appear here.")}</li>
          ) : tape.slice().reverse().map((entry) => (
            <li key={entry.id}>
              <span>{entry.expression}</span>
              <strong>{entry.result === "Error" ? t("Error") : entry.result}</strong>
            </li>
          ))}
        </ol>
        <footer>
          <button type="button" onClick={copyResult}>{t("Copy result")}</button>
          <span role="status">{copyStatus ? t(copyStatus) : ""}</span>
        </footer>
      </aside>
    </div>
  );
}

export default function ProductivityApps({ app, locale, openApp }: ProductivityAppsProps) {
  if (app === "desk") return <DeskAccessories locale={locale} openApp={openApp} />;
  if (app === "notepad") return <NotePad locale={locale} />;
  if (app === "focus") return <FocusClock locale={locale} />;
  if (app === "calculator") return <DeskCalculator locale={locale} />;
  return <ProductivityExtras app={app} locale={locale} />;
}
