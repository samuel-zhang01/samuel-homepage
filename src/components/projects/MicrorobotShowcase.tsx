"use client";
import { ProjectCopy } from "./ProjectTranslationBoundary";
import { scientificCopy } from "./copy/scientificCopy";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import { ModelArchitectureStudio } from "./ModelArchitectureStudio";
import { ProjectTranslationBoundary } from "./ProjectTranslationBoundary";
import { MicrorobotVisionDemo } from "./ScientificDemos";
import { MicrorobotResults } from "./ScientificPlayback";
import { SequenceSplitExperiment } from "./ScientificFailureExperiments";
import styles from "./MicrorobotShowcase.module.css";

const views = [
  { id: "architecture", label: "How the models work", icon: "▧", detail: "From microscope images to orientation and depth" },
  { id: "images", label: "Microscopy & Grad-CAM", icon: "◉", detail: "Inspect the image regions used for pose and depth" },
  { id: "benchmark", label: "Visual benchmark", icon: "▥", detail: "Compare recorded pose and depth estimates" },
  { id: "split", label: "Sequence split experiment", icon: "⋈", detail: "Compare frame-level and sequence-level evaluation" },
] as const;
type ShowcaseView = (typeof views)[number]["id"];

export function MicrorobotShowcase({ locale = "en-GB" }: { locale?: Locale }) {
  const [view, setView] = useState<ShowcaseView>("architecture");
  return (
    <ProjectCopy copy={scientificCopy} locale={locale}><ProjectTranslationBoundary locale={locale}>
      <div className={styles.showcase} lang={locale}>
        <div className={styles.viewSwitch} role="group" aria-label="Microrobot project view">
          <div><span>Explore</span><strong>{views.find((item) => item.id === view)?.detail}</strong></div>
          {views.map((item) => <button key={item.id} type="button" aria-pressed={view === item.id} onClick={() => setView(item.id)}><span aria-hidden="true">{item.icon}</span>{item.label}</button>)}
        </div>
        <div className={styles.viewPanel} aria-label={views.find((item) => item.id === view)?.detail}>
          {view === "architecture" ? <ModelArchitectureStudio locale={locale} /> : view === "images" ? <MicrorobotResults /> : view === "benchmark" ? <MicrorobotVisionDemo locale={locale} /> : <SequenceSplitExperiment />}
        </div>
      </div>
    </ProjectTranslationBoundary></ProjectCopy>
  );
}
export default MicrorobotShowcase;
