"use client";
import { ProjectCopy } from "./ProjectTranslationBoundary";
import { scientificCopy } from "./copy/scientificCopy";

import { MathEquation } from "./MathEquation";

import { useState } from "react";
import styles from "./LlmPostTrainingLab.module.css";

export function RolloutExperiment() {
  const [gain, setGain] = useState(1.02);
  const [steps, setSteps] = useState(20);
  const [feedback, setFeedback] = useState(true);
  const errors = [0];
  for (let i = 0; i < steps; i++) errors.push((feedback ? gain * errors[i] : 0) + .01);
  const max = Math.max(.5, ...errors);
  return <ProjectCopy copy={scientificCopy}><section className={styles.lab} aria-label="Autoregressive rollout experiment">
    <header className={styles.heading}><span>CFD / Rollout mechanics</span><h3>One-step error can compound.</h3><p>Predicting many future flow fields means feeding each estimate into the next step. Change the feedback strength to see how small errors accumulate.</p></header>
    <div className={styles.panel}><div className={styles.controls}><label>Error amplification · {gain.toFixed(2)}×<input type="range" min=".9" max="1.1" step=".01" value={gain} onChange={(e) => setGain(Number(e.target.value))} /></label><label>Rollout length · {steps} steps<input type="range" min="1" max="40" step="1" value={steps} onChange={(e) => setSteps(Number(e.target.value))} /></label></div><div className={styles.actions}><button type="button" aria-pressed={feedback} onClick={() => setFeedback(true)}>Feed predictions forward</button><button type="button" aria-pressed={!feedback} onClick={() => setFeedback(false)}>Reset input error each step</button></div>
      <div className={styles.metrics} aria-live="polite"><article><span>Fresh error per step</span><strong>0.0100</strong></article><article><span>Final error</span><strong>{errors[steps].toFixed(4)}</strong></article><article><span>Relative to one step</span><strong>{(errors[steps] / .01).toFixed(1)}×</strong></article></div>
      <div className={styles.chartLegend}><span>Error scale: 0–{max.toFixed(2)}</span><span>Steps: 0–{steps}</span></div>
      <svg viewBox="0 0 600 185" role="img" aria-label={`Calculated error grows from 0 to ${errors[steps].toFixed(4)} over ${steps} steps`} style={{ width:"100%", background:"white", border:"1px solid #999" }}><path d="M50 15V165H580" stroke="#777" fill="none" /><polyline points={errors.map((value,i) => `${50+i/steps*530},${165-value/max*145}`).join(" ")} fill="none" stroke="#11177a" strokeWidth="3"/></svg>
      <div className={styles.derivation}><MathEquation tex={feedback ? String.raw`e_{t+1}=g\,e_t+0.01,\qquad e_0=0` : String.raw`e_{t+1}=0.01`} />{!feedback && <p>Reset input error each step</p>}<p>At 20 steps, gain 0.98 gives 0.1662, while 1.02 gives 0.2430. Both begin with the same 0.01 error.</p></div>
      <p className={styles.note}>The graph network feeds each predicted field into the next step. This simplified recurrence shows how feedback changes error over time; field accuracy and physical consistency add further checks.</p>
    </div>
  </section></ProjectCopy>;
}

export function SequenceSplitExperiment() {
  const [grouped, setGrouped] = useState(false);
  const sequences = Array.from({length:6}, (_, sequence) => Array.from({length:4}, (_, frame) => ({ sequence, frame, train: grouped ? sequence < 3 : frame < 2 })));
  const overlap = sequences.filter((frames) => frames.some((f) => f.train) && frames.some((f) => !f.train)).length;
  return <ProjectCopy copy={scientificCopy}><section className={styles.lab} aria-label="Frame and sequence split experiment">
    <header className={styles.heading}><span>Microrobot vision / evaluation design</span><h3>What is the independent observation?</h3><p>Split 24 fictional frames into equally sized training and test sets. Compare frame-level and sequence-level assignments.</p></header>
    <div className={styles.panel}><div className={styles.actions}><button type="button" aria-pressed={!grouped} onClick={() => setGrouped(false)}>Split individual frames</button><button type="button" aria-pressed={grouped} onClick={() => setGrouped(true)}>Hold out complete sequences</button></div>
      <div className={styles.metrics} aria-live="polite"><article><span>Training / test frames</span><strong>12 / 12</strong></article><article><span>Sequences in both sets</span><strong>{overlap} / 6</strong></article><article><span>Held-out sequences</span><strong>{grouped ? 3 : 0}</strong></article></div>
      <div className={styles.receipt}><table><caption>Each row is one fictional recording</caption><thead><tr><th>Sequence</th>{[1,2,3,4].map((n) => <th key={n}>Frame {n}</th>)}</tr></thead><tbody>{sequences.map((frames,i) => <tr key={i}><th>S{i+1}</th>{frames.map((frame) => <td key={frame.frame} style={{background:frame.train ? "#e0e6f7" : "#fff"}}>{frame.train ? "Train" : "Test"}</td>)}</tr>)}</tbody></table></div>
      <p className={styles.note}>{grouped ? "The test set contains three complete unseen sequences. Frame counts alone remain identical to the other split." : "Every test frame shares a source sequence with training frames. Correlated images can make a held-out frame easier than an unseen experimental sequence."}</p><p className={styles.note}>The microrobot models were evaluated with individual images split between training and testing. Nearby frames can look very similar. This fictional example shows why testing on complete unseen recordings would give a stronger check of performance in a new experiment.</p>
    </div>
  </section></ProjectCopy>;
}

export function MatchingOrderExperiment() {
  const [reverse, setReverse] = useState(false);
  const [tolerance, setTolerance] = useState(61);
  const predictions = reverse ? [2000.100,2000.060] : [2000.060,2000.100];
  const available = [2000,2000.070];
  const rows = predictions.map((prediction) => {
    const candidates = available.map((value,index) => ({ value,index,difference:Math.abs(value-prediction)*1000 })).sort((a,b) => a.difference-b.difference);
    const chosen = candidates[0];
    if (!chosen || chosen.difference > tolerance + 1e-7) return { prediction, match:null, residual:null };
    available.splice(chosen.index,1);return { prediction,match:chosen.value,residual:(chosen.value-prediction)*1000 };
  });
  const matched = rows.filter((row) => row.residual !== null);
  const rms = matched.length ? Math.sqrt(matched.reduce((sum,row) => sum + row.residual! ** 2,0)/matched.length) : null;
  return <ProjectCopy copy={scientificCopy}><section className={styles.lab} aria-label="Spectral matching order experiment">
    <header className={styles.heading}><span>Molecular recognition / matching assumptions</span><h3>A lower residual can hide a missing line.</h3><p>Assign each prediction to its nearest unused observation. Reverse the prediction order and inspect both coverage and residual.</p></header>
    <div className={styles.panel}><div className={styles.controls}><label>Tolerance · {tolerance} kHz<input type="range" min="5" max="110" step="1" value={tolerance} onChange={(e) => setTolerance(Number(e.target.value))} /></label><div className={styles.actions}><button type="button" aria-pressed={reverse} onClick={() => setReverse((value) => !value)}>Reverse prediction order</button></div></div>
      <div className={styles.metrics} aria-live="polite"><article><span>Assigned lines</span><strong>{matched.length} / 2</strong></article><article><span>Matched-line RMS</span><strong>{rms === null ? "—" : rms.toFixed(2)} kHz</strong></article><article><span>Unused observations</span><strong>{available.length}</strong></article></div>
      <div className={styles.receipt}><table><caption>Observed lines: 2000.000 and 2000.070 MHz</caption><thead><tr><th>Prediction order</th><th>Assigned observation</th><th>Observed − predicted</th></tr></thead><tbody>{rows.map((row,i) => <tr key={i}><td>{i+1}. {row.prediction.toFixed(3)}</td><td>{row.match?.toFixed(3) ?? "Unassigned"}</td><td>{row.residual === null ? "—" : `${row.residual.toFixed(2)} kHz`}</td></tr>)}</tbody></table></div>
      <p className={styles.note}>At 61 kHz, the first ordering keeps one match with 10 kHz RMS. Reversing it keeps both with 47.43 kHz RMS. An assignment assessment needs match coverage, tolerance and residual together.</p><p className={styles.note}>This two-line synthetic counterexample examines the ordered nearest-unused matching rule used in the workbench. A global assignment would consider all pairings together.</p>
    </div>
  </section></ProjectCopy>;
}
