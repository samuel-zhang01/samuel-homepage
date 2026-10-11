"use client";

import { MathEquation } from "./MathEquation";
import { PlotPanHint } from "./PlotPanHint";
import { ProjectCopy, useProjectLocale } from "./ProjectTranslationBoundary";
import { coverageShiftCopy } from "./copy/coverageShiftCopy";

import { useState } from "react";
import { useScientificExperimentClock } from "./useScientificExperimentClock";
import motion from "./ScientificExperiments.module.css";
import { projectText } from "@/lib/projectCopy";
import { shiftedCoverage } from "@/lib/learningMechanics";
import styles from "./LlmPostTrainingLab.module.css";

export function CoverageShiftExperiment() {
  const locale = useProjectLocale();
  const [shift, setShift] = useState(0);
  const [target, setTarget] = useState(.9);
  const [playing, setPlaying] = useState(false);
  const [baseline, setBaseline] = useState<{ target: number; shift: number } | null>(null);
  const result = shiftedCoverage(target, shift);
  const saved = baseline ? shiftedCoverage(baseline.target, baseline.shift) : null;
  const motionAllowed = useScientificExperimentClock(playing, () => {
    if (shift >= 2) setPlaying(false);
    else setShift(Math.min(2, Number((shift + .05).toFixed(2))));
  });
  function beginSweep() { setBaseline({ target, shift: 0 }); setShift(0); setPlaying(true); }
  function reset() { setPlaying(false); setTarget(.9); setShift(0); setBaseline(null); }
  return <ProjectCopy copy={coverageShiftCopy}><section className={styles.lab} aria-label="Coverage under distribution shift">
    <header className={styles.heading}><span>SYNTHETIC EXPERIMENT / LIVE CALCULATION</span><h3>Keep the interval. Move the population.</h3><p>Calibrate once, then add a systematic prediction error to a new batch. Count which outcomes still fall inside the interval.</p></header>
    <div className={styles.panel}>
      <div className={styles.controls}><label>Requested coverage · {(target * 100).toFixed(0)}%<input type="range" min=".8" max=".95" step=".05" value={target} onChange={(event) => { setPlaying(false); setTarget(Number(event.target.value)); }} /></label><label>Population shift · +{shift.toFixed(2)} residual units<input type="range" min="0" max="2" step=".05" value={shift} onChange={(event) => { setPlaying(false); setShift(Number(event.target.value)); }} /></label></div>
      <div className={motion.actions}>
        <button type="button" disabled={!motionAllowed} onClick={beginSweep}>Watch the population move</button>
        <button type="button" disabled={!playing} onClick={() => setPlaying(false)}>Pause experiment</button>
        <button type="button" onClick={() => { setPlaying(false); if (!baseline) setBaseline({ target, shift }); setShift(Math.min(2, Number((shift + .25).toFixed(2)))); }}>Step shift +0.25</button>
        <button type="button" onClick={() => { setPlaying(false); setBaseline({ target, shift }); }}>Save current comparison</button>
        <button type="button" onClick={reset}>Reset population</button>
      </div>
      <div className={styles.metrics} aria-live={playing ? "off" : "polite"}><article><span>Calibrated radius</span><strong>±{result.radius.toFixed(2)}</strong></article><article><span>Covered outcomes</span><strong>{result.covered} / {result.total}</strong></article><article><span>Batch coverage</span><strong>{(100 * result.covered / result.total).toFixed(1)}%</strong></article></div>
      {saved && <p className={motion.checkpoint}>{projectText(locale,coverageShiftCopy,"Saved comparison: {0} / {1} covered at shift +{2}. Current batch: {3} / {1}.",{0:saved.covered,1:saved.total,2:baseline!.shift.toFixed(2),3:result.covered})} {baseline!.target === target ? "The calibrated interval is unchanged." : "The requested coverage changed, so the calibrated radius also changed."}</p>}
      <div className={styles.chartLegend}><span><MathEquation display={false} tex={String.raw`r=y-\widehat{y}`} label="Residual equals observed minus predicted" /></span><span>Circles: covered. Crosses: outside the interval.</span></div>
      <PlotPanHint />
      <div className={styles.coveragePlot} role="region" tabIndex={0} aria-label="Coverage under distribution shift">
      <svg viewBox="0 0 620 160" role="img" aria-label={`${result.covered} of 40 synthetic residuals are within the fixed interval. Circles are covered; crosses fall outside.`}>
        <rect x={80 + (1 - result.radius) * 125} y="26" width={result.radius * 250} height="94" fill="#dbe4f7" />
        <line x1="80" x2="580" y1="120" y2="120" stroke="#555" />
        {[-1, 0, 1, 2, 3].map((tick) => <g key={tick} aria-hidden="true"><line x1={80 + (tick + 1) * 125} x2={80 + (tick + 1) * 125} y1="120" y2="127" stroke="#555" /><text x={80 + (tick + 1) * 125} y="145" textAnchor="middle" fontSize="12">{tick}</text></g>)}
        {result.rows.map((row, i) => { const x = 80 + (row.residual + 1) * 125; const y = 47 + (i % 3) * 26; return <g key={i} className={motion.movingPoint} style={{ transform:`translate(${x}px, ${y}px)` }}>{row.covered ? <circle r="5" fill="#11177a" /> : <path d="M-4,-4l8,8m0,-8l-8,8" stroke="#9a2537" strokeWidth="2" />}</g>; })}

      </svg>
      </div>
      <p className={styles.note} aria-live={playing ? "off" : "polite"}>{shift === 0 ? "Baseline batch: inspect the outcomes near the interval edges, then increase the shift." : `The radius stays fixed at ${result.radius.toFixed(2)} while the population moves. ${result.total - result.covered} outcomes now fall outside. Exchangeability is the assumption this stress test challenges.`}</p>
      <details className={styles.receipt}><summary className={motion.receiptSummary}>Inspect the calculation</summary><PlotPanHint /><p>99 calibration absolute residuals run from 0.01 to 0.99. The finite-sample rank is <MathEquation tex={String.raw`k=\left\lceil(99+1)\times ${target}\right\rceil=${result.rank}`} />The 40 test residuals follow <MathEquation tex={String.raw`r_i=\frac{i-19.5}{20}+${shift.toFixed(2)},\qquad i=0,\ldots,39`} />A point is covered when <MathEquation display={false} tex={String.raw`\lvert r_i\rvert\le R`} />, where R is the calibrated radius.</p><p>This example shows how population change affects coverage. The saved coursework results above describe my separate model evaluation.</p></details>
    </div>
  </section></ProjectCopy>;
}
