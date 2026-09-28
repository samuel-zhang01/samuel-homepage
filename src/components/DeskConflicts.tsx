"use client";

import { translateText, type Locale } from "@/lib/i18n";
import type { DeskConflict } from "@/lib/deskPersistence";

export function DeskConflicts<T>({ conflicts, dismiss, locale, onRestore }: { conflicts: DeskConflict<T>[]; dismiss: () => void; locale: Locale; onRestore: (value: T) => void }) {
  if (!conflicts.length) return null;
  const t = (text: string) => translateText(locale, text);
  const download = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(conflicts.map(({ current, incoming }) => ({ current, incoming })), null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "desk-conflicting-drafts.json";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return <aside className="desk-conflicts" aria-label={t("Conflicting drafts")}>
    <p role="status">{t("Another tab edited the same data. Both drafts are kept here until you dismiss them.")}</p>
    <details><summary>{t("Review saved drafts")}</summary>{conflicts.map(conflict => <div key={conflict.key}>
      <p>{t("Previously saved draft")}</p><pre>{JSON.stringify(conflict.current, null, 2)}</pre>
      <button type="button" onClick={() => onRestore(conflict.current)}>{t("Use previously saved version")}</button>
      <p>{t("Incoming draft")}</p><pre>{JSON.stringify(conflict.incoming, null, 2)}</pre>
      <button type="button" onClick={() => onRestore(conflict.incoming)}>{t("Use incoming version")}</button>
    </div>)}</details>
    <button type="button" onClick={download}>{t("Download both drafts")}</button>{" "}
    <button type="button" onClick={dismiss}>{t("Keep current data and dismiss drafts")}</button>
  </aside>;
}
