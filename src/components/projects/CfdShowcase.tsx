"use client";
import { ProjectCopy } from "./ProjectTranslationBoundary";
import { scientificCopy } from "./copy/scientificCopy";

import { useState } from "react";
import { CfdArchitectureStudio } from "./CfdArchitectureStudio";
import { CfdSurrogateDemo } from "./ScientificDemos";
import { CfdFlowPlayer } from "./ScientificPlayback";
import { RolloutExperiment } from "./ScientificFailureExperiments";
import styles from "./MicrorobotShowcase.module.css";

const views = [
  { id: "architecture", label: "How the models work", icon: "⌁", detail: "Three ways to learn the evolution of a flow field" },
  { id: "motion", label: "Vertical velocity & motion", icon: "▶", detail: "Saved flow sequences + FNO and U-Net figures" },
  { id: "results", label: "Recorded results", icon: "◉", detail: "Compare each run with its own evaluation conditions" },
  { id: "rollout", label: "Rollout experiment", icon: "↻", detail: "Explore how autoregressive prediction compounds error" },
] as const;
type ShowcaseView = (typeof views)[number]["id"];

export function CfdShowcase() {
  const [view, setView] = useState<ShowcaseView>("architecture");
  return (
    <ProjectCopy copy={scientificCopy}><div className={styles.showcase}>
      <div className={styles.viewSwitch} role="group" aria-label="Neural CFD project view">
        <div><span>Explore</span><strong>{views.find((item) => item.id === view)?.detail}</strong></div>
        {views.map((item) => <button key={item.id} type="button" aria-pressed={view === item.id} onClick={() => setView(item.id)}><span aria-hidden="true">{item.icon}</span>{item.label}</button>)}
      </div>
      <div className={styles.viewPanel} aria-label={views.find((item) => item.id === view)?.detail}>
        {view === "architecture" ? <CfdArchitectureStudio /> : view === "motion" ? <CfdFlowPlayer /> : view === "results" ? <CfdSurrogateDemo /> : <RolloutExperiment />}
      </div>
    </div></ProjectCopy>
  );
}
export default CfdShowcase;
