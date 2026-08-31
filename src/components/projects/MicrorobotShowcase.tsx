"use client";

import { useState } from "react";

import type { Locale } from "@/lib/i18n";
import { ModelArchitectureStudio } from "./ModelArchitectureStudio";
import { ProjectTranslationBoundary } from "./ProjectTranslationBoundary";
import { MicrorobotVisionDemo } from "./ScientificDemos";
import styles from "./MicrorobotShowcase.module.css";

type ShowcaseView = "architecture" | "benchmark";

export function MicrorobotShowcase({ locale = "en-GB" }: { locale?: Locale }) {
  const [view, setView] = useState<ShowcaseView>("architecture");

  return (
    <ProjectTranslationBoundary locale={locale}>
    <div className={styles.showcase} lang={locale}>
      <div className={styles.viewSwitch} role="group" aria-label="Microrobot project view">
        <div>
          <span>PROJECT LENS</span>
          <strong>{view === "architecture" ? "Architecture + evidence · □ toggles wide view" : "Saved benchmark viewer"}</strong>
        </div>
        <button
          type="button"
          aria-pressed={view === "architecture"}
          onClick={() => setView("architecture")}
        >
          <span aria-hidden="true">▧</span>
          Architecture &amp; lineage
        </button>
        <button
          type="button"
          aria-pressed={view === "benchmark"}
          onClick={() => setView("benchmark")}
        >
          <span aria-hidden="true">◉</span>
          Visual benchmark
        </button>
      </div>

      <div className={styles.viewPanel} aria-label={view === "architecture" ? "Model architecture and experiment lineage" : "Microrobot visual benchmark"}>
        {view === "architecture" ? <ModelArchitectureStudio locale={locale} /> : <MicrorobotVisionDemo locale={locale} />}
      </div>
    </div>
    </ProjectTranslationBoundary>
  );
}

export default MicrorobotShowcase;
