"use client";

import { MathEquation } from "./MathEquation";
import { ProjectCopy } from "./ProjectTranslationBoundary";
import { coverageShiftCopy } from "./copy/coverageShiftCopy";

import { useState } from "react";
import { shiftedCoverage } from "@/lib/learningMechanics";
import styles from "./LlmPostTrainingLab.module.css";

export function CoverageShiftExperiment() {
  const [shift, setShift] = useState(0);
  const [target, setTarget] = useState(.9);
  const result = shiftedCoverage(target, shift);
  return <ProjectCopy copy={coverageShiftCopy}><section className={styles.lab} aria-label="Coverage under distribution shift">
    <header className={styles.heading}><span>SYNTHETIC EXPERIMENT / LIVE CALCULATION</span><h3>Keep the interval. Move the population.</h3><p>Calibrate once, then add a systematic prediction error to a new batch. Count which outcomes still fall inside the interval.</p></header>
    <div className={styles.panel}>
      <div className={styles.controls}><label>Requested coverage · {(target * 100).toFixed(0)}%<input type="range" min=".8" max=".95" step=".05" value={target} onChange={(event) => setTarget(Number(event.target.value))} /></label><label>Population shift · +{shift.toFixed(2)} residual units<input type="range" min="0" max="2" step=".05" value={shift} onChange={(event) => setShift(Number(event.target.value))} /></label></div>
      <div className={styles.metrics} aria-live="polite"><article><span>Calibrated radius</span><strong>±{result.radius.toFixed(2)}</strong></article><article><span>Covered outcomes</span><strong>{result.covered} / {result.total}</strong></article><article><span>Batch coverage</span><strong>{(100 * result.covered / result.total).toFixed(1)}%</strong></article></div>
      <div className={styles.chartLegend}><span><MathEquation display={false} tex={String.raw`r=y-\widehat{y}`} label="Residual equals observed minus predicted" /></span><span>Horizontal range: −1 to +3</span></div>
      <svg viewBox="0 0 620 160" role="img" aria-label={`${result.covered} of 40 synthetic residuals are within the fixed interval. Circles are covered; crosses fall outside.`} style={{ width: "100%", display: "block", background: "white", border: "1px solid #999" }}>
        <rect x={80 + (1 - result.radius) * 125} y="26" width={result.radius * 250} height="94" fill="#dbe4f7" />
        <line x1="80" x2="580" y1="120" y2="120" stroke="#555" />
        {[-1, 0, 1, 2, 3].map((tick) => <line key={tick} x1={80 + (tick + 1) * 125} x2={80 + (tick + 1) * 125} y1="120" y2="127" stroke="#555" />)}
        {result.rows.map((row, i) => { const x = 80 + (row.residual + 1) * 125; const y = 47 + (i % 3) * 26; return row.covered ? <circle key={i} cx={x} cy={y} r="5" fill="#11177a" /> : <path key={i} d={`M${x - 4},${y - 4}l8,8m0,-8l-8,8`} stroke="#9a2537" strokeWidth="2" />; })}

      </svg>
      <p className={styles.note} role="status">{shift === 0 ? "Baseline batch: inspect the outcomes near the interval edges, then increase the shift." : `The radius stays fixed at ${result.radius.toFixed(2)} while the population moves. ${result.total - result.covered} outcomes now fall outside. Exchangeability is the assumption this stress test challenges.`}</p>
      <div className={styles.actions}><button type="button" onClick={() => { setTarget(.9); setShift(0); }}>Reset population</button></div>
      <details className={styles.receipt}><summary>Inspect the calculation</summary><p>99 calibration absolute residuals run from 0.01 to 0.99. The finite-sample rank is <MathEquation tex={String.raw`k=\left\lceil(99+1)\times ${target}\right\rceil=${result.rank}`} />The 40 test residuals follow <MathEquation tex={String.raw`r_i=\frac{i-19.5}{20}+${shift.toFixed(2)},\qquad i=0,\ldots,39`} />A point is covered when <MathEquation display={false} tex={String.raw`\lvert r_i\rvert\le R`} />, where R is the calibrated radius.</p><p>This deliberately constructed batch illustrates coverage sensitivity. The fixed coursework results above remain a separate evidence record.</p></details>
    </div>
  </section></ProjectCopy>;
}
