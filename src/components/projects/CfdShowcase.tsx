"use client";
import { ProjectCopy } from "./ProjectTranslationBoundary";
import { scientificCopy } from "./copy/scientificCopy";

import { useState } from "react";
import { System7Icon, type System7IconKind } from "../System7Icon";
import { CfdArchitectureStudio } from "./CfdArchitectureStudio";
import { CfdSurrogateDemo } from "./ScientificDemos";
import { CfdFlowPlayer } from "./ScientificPlayback";
import { RolloutExperiment } from "./ScientificFailureExperiments";
import styles from "./MicrorobotShowcase.module.css";

const views = [
  { id: "motion", label: "See the flow", icon: "flow", detail: "Watch my graph model predict the wake behind a cylinder" },
  { id: "results", label: "Recorded results", icon: "chart", detail: "Compare each run with its own evaluation conditions" },
  { id: "rollout", label: "Rollout experiment", icon: "clock", detail: "Explore how autoregressive prediction compounds error" },
  { id: "architecture", label: "How the models work", icon: "computer", detail: "Three ways to learn the evolution of a flow field" },
] as const satisfies readonly { id: string; label: string; icon: System7IconKind; detail: string }[];
type ShowcaseView = (typeof views)[number]["id"];

export function CfdShowcase() {
  const [view, setView] = useState<ShowcaseView>("motion");
  return (
    <ProjectCopy copy={scientificCopy}><div className={styles.showcase}>
      <section className={styles.projectPurpose} aria-labelledby="cfd-purpose">
        <span>My fluid-prediction experiments</span>
        <h3 id="cfd-purpose">Can a neural network predict the next flow field?</h3>
        <p>I trained Fourier, graph and U-Net models to predict velocity and pressure around a cylinder. A full fluid simulation is expensive; I wanted to understand which representations could learn its changing flow.</p>
        <p><strong>Start here:</strong> press Play flow and follow the alternating wake behind the cylinder. These are saved predictions from my graph model; the other tabs explain my results and model choices.</p>
      </section>
      <div className={styles.viewSwitch} role="group" aria-label="Neural CFD project view">
        <div><span>Explore</span><strong>{views.find((item) => item.id === view)?.detail}</strong></div>
        {views.map((item) => <button key={item.id} type="button" aria-pressed={view === item.id} onClick={() => setView(item.id)}><span aria-hidden="true"><System7Icon kind={item.icon} miniature /></span>{item.label}</button>)}
      </div>
      <div role="group" className={styles.viewPanel} aria-label={views.find((item) => item.id === view)?.detail}>
        {view === "architecture" ? <CfdArchitectureStudio /> : view === "motion" ? <CfdFlowPlayer /> : view === "results" ? <CfdSurrogateDemo /> : <RolloutExperiment />}
      </div>
    </div></ProjectCopy>
  );
}
export default CfdShowcase;
