"use client";

import { projectText, type ProjectCopyTable } from "@/lib/projectCopy";
import type { Locale } from "@/lib/i18n";
import { useProjectLocale } from "./ProjectTranslationBoundary";
import styles from "./PlotPanHint.module.css";

const copy = {
  "Swipe sideways; use arrow keys when focused.": [
    "横向滑动；聚焦后可使用方向键。",
    "橫向滑動；聚焦後可使用方向鍵。",
  ],
} satisfies ProjectCopyTable;

/** Keep the pan instruction outside the figure so it stays in view while panning. */
export function PlotPanHint({ locale: suppliedLocale }: { locale?: Locale } = {}) {
  const projectLocale = useProjectLocale();
  const locale = suppliedLocale ?? projectLocale;
  return <p className={styles.hint}>{projectText(locale, copy, "Swipe sideways; use arrow keys when focused.")}</p>;
}
