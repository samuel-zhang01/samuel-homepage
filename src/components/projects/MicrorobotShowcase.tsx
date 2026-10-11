"use client";
import { ProjectCopy } from "./ProjectTranslationBoundary";
import { scientificCopy } from "./copy/scientificCopy";

import { useState } from "react";
import { System7Icon, type System7IconKind } from "../System7Icon";
import type { Locale } from "@/lib/i18n";
import { ModelArchitectureStudio } from "./ModelArchitectureStudio";
import { ProjectTranslationBoundary } from "./ProjectTranslationBoundary";
import { MicrorobotVisionDemo } from "./ScientificDemos";
import { MicrorobotResults } from "./ScientificPlayback";
import { SequenceSplitExperiment } from "./ScientificFailureExperiments";
import styles from "./MicrorobotShowcase.module.css";

const views = [
  { id: "images", label: "Microscopy & Grad-CAM", icon: "microscope", detail: "Inspect the image regions used for pose and depth" },
  { id: "benchmark", label: "Visual benchmark", icon: "chart", detail: "Compare recorded pose and depth estimates" },
  { id: "split", label: "Sequence split experiment", icon: "folder", detail: "Compare frame-level and sequence-level evaluation" },
  { id: "architecture", label: "How the models work", icon: "computer", detail: "From microscope images to orientation and depth" },
] as const satisfies readonly { id: string; label: string; icon: System7IconKind; detail: string }[];
type ShowcaseView = (typeof views)[number]["id"];

export function MicrorobotShowcase({ locale = "en-GB" }: { locale?: Locale }) {
  const [view, setView] = useState<ShowcaseView>("images");
  return (
    <ProjectCopy copy={scientificCopy} locale={locale}><ProjectTranslationBoundary locale={locale}>
      <div className={styles.showcase} lang={locale}>
        <section className={styles.projectPurpose} aria-labelledby="microrobot-purpose">
          <span>My microscope-image study</span>
          <h3 id="microrobot-purpose">Which way is a microrobot pointing, and how deep is it?</h3>
          <p>A single microscope image hides depth and orientation. I trained five image models on 2,000 grayscale images to recognise 40 pitch-roll poses and estimate normalised depth, so a robot could eventually be tracked and controlled from its image.</p>
          <p><strong>Start here:</strong> switch between Pose and Depth, then move the overlay slider. The same image serves two different tasks; the warm regions show where each trained model responds.</p>
        </section>
        <div className={styles.viewSwitch} role="group" aria-label="Microrobot project view">
          <div><span>Explore</span><strong>{views.find((item) => item.id === view)?.detail}</strong></div>
          {views.map((item) => <button key={item.id} type="button" aria-pressed={view === item.id} onClick={() => setView(item.id)}><span aria-hidden="true"><System7Icon kind={item.icon} miniature /></span>{item.label}</button>)}
        </div>
        <div role="group" className={styles.viewPanel} aria-label={views.find((item) => item.id === view)?.detail}>
          {view === "architecture" ? <ModelArchitectureStudio locale={locale} /> : view === "images" ? <MicrorobotResults /> : view === "benchmark" ? <MicrorobotVisionDemo locale={locale} /> : <SequenceSplitExperiment />}
        </div>
      </div>
    </ProjectTranslationBoundary></ProjectCopy>
  );
}
export default MicrorobotShowcase;
