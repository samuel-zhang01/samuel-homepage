"use client";

import { useState } from "react";

import { CfdArchitectureStudio } from "./CfdArchitectureStudio";
import { CfdSurrogateDemo } from "./ScientificDemos";
import styles from "./MicrorobotShowcase.module.css";

type ShowcaseView = "architecture" | "results";

export function CfdShowcase() {
  const [view, setView] = useState<ShowcaseView>("architecture");

  return (
    <div className={styles.showcase}>
      <div className={styles.viewSwitch} role="group" aria-label="Neural CFD project view">
        <div>
          <span>PROJECT LENS</span>
          <strong>
            {view === "architecture"
              ? "Operators + tensors + experiment lineage"
              : "Saved run evidence · split-aware comparison"}
          </strong>
        </div>
        <button
          type="button"
          aria-pressed={view === "architecture"}
          onClick={() => setView("architecture")}
        >
          <span aria-hidden="true">⌁</span>
          Architectures &amp; lineage
        </button>
        <button
          type="button"
          aria-pressed={view === "results"}
          onClick={() => setView("results")}
        >
          <span aria-hidden="true">◉</span>
          Run evidence
        </button>
      </div>

      <div
        className={styles.viewPanel}
        aria-label={view === "architecture"
          ? "Neural CFD architecture and experiment lineage"
          : "Neural CFD saved run evidence"}
      >
        {view === "architecture" ? <CfdArchitectureStudio /> : <CfdSurrogateDemo />}
      </div>
    </div>
  );
}

export default CfdShowcase;
