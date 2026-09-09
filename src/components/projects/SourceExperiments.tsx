"use client";

import { useState } from "react";
import { ProjectCopy } from "./ProjectTranslationBoundary";
import { sourceExperimentsCopy } from "./copy/sourceExperimentsCopy";
import ClassicSelect from "../ClassicSelect";
import styles from "./LlmPostTrainingLab.module.css";

const londonClock = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", hour: "2-digit", minute: "2-digit", timeZoneName: "short" });
const windows = {
  spring: { label: "29 March 2026 · clocks forward", start: "2026-03-29T00:00:00Z", end: "2026-03-29T02:00:00Z" },
  autumn: { label: "25 October 2026 · clocks back", start: "2026-10-24T23:00:00Z", end: "2026-10-25T03:00:00Z" },
};

export function SchedulingDstExperiment() {
  const [day, setDay] = useState<keyof typeof windows>("autumn");
  const [duration, setDuration] = useState(30);
  const [buffers, setBuffers] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const current = windows[day];
  const start = Date.parse(current.start), end = Date.parse(current.end);
  const before = buffers ? 5 : 0, after = buffers ? 10 : 0;
  const slots = [];
  for (let instant = start + before * 60000; instant + (duration + after) * 60000 <= end; instant += (duration + before + after) * 60000) slots.push(instant);
  return <ProjectCopy copy={sourceExperimentsCopy}><section className={styles.lab} aria-label="Daylight-saving booking experiment">
    <header className={styles.heading}><span>YASA / DAYLIGHT-SAVING TIME</span><h3>When 01:00 happens twice.</h3><p>Generate real intervals inside a London 00:00–03:00 window. Inspect the UTC identity behind each local clock label.</p></header>
    <div className={styles.panel}><div className={styles.controls}>
      <label>Clock change<ClassicSelect value={day} onChange={(e) => { setDay(e.target.value as keyof typeof windows); setSelected(null); }}>{Object.entries(windows).map(([id, window]) => <option value={id} key={id}>{window.label}</option>)}</ClassicSelect></label>
      <label>Meeting length<ClassicSelect value={String(duration)} onChange={(e) => { setDuration(Number(e.target.value)); setSelected(null); }}>{[15,30,60].map((minutes) => <option value={minutes} key={minutes}>{minutes} minutes</option>)}</ClassicSelect></label>
    </div><label><input type="checkbox" checked={buffers} onChange={(e) => { setBuffers(e.target.checked); setSelected(null); }} /> Add 5 minutes before and 10 minutes after each meeting</label>
      <div className={styles.metrics} aria-live="polite"><article><span>Local availability</span><strong>00:00–03:00</strong></article><article><span>Real elapsed time</span><strong>{(end - start) / 3600000} hours</strong></article><article><span>Generated slots</span><strong>{slots.length}</strong></article></div>
      <div className={styles.actions} role="group" aria-label="Generated meeting slots">{slots.map((instant) => <button key={instant} type="button" aria-pressed={selected === instant} onClick={() => setSelected(instant)}>{londonClock.format(instant)}</button>)}</div>
      <div className={styles.prompt} aria-live="polite">{selected === null ? <strong>Select a slot to inspect its interval.</strong> : <><strong>{londonClock.format(selected)} → {londonClock.format(selected + duration * 60000)}</strong><span>UTC start: {new Date(selected).toISOString()}</span><span>UTC end: {new Date(selected + duration * 60000).toISOString()}</span><span>Elapsed meeting time: {duration} minutes</span></>}</div>
      <p className={styles.note}>The autumn 01:00 BST and 01:00 GMT slots are an hour apart. In spring the local clock jumps from 00:59 to 02:00. Allocation and reservations use the real interval.</p>
      <details className={styles.receipt}><summary>How the time window becomes slots</summary><p>The London window spans two elapsed hours in spring and four in autumn. Meetings use real elapsed minutes within that UTC interval. A buffer reserves extra time before and after each meeting, reducing the number of available slots.</p></details>
    </div>
  </section></ProjectCopy>;
}

const backupScenarios = {
  dump: { label: "The dump command fails", source: ["Check the lock file", "Create the lock file", "Dump exits with a failure", "Append a success message", "Remove the lock file"], guarded: ["Acquire an atomic lock", "Run the dump into a temporary file", "Read the failing exit status", "Record failure and preserve the last verified backup", "Release the lock in cleanup"] },
  interrupted: { label: "The process is interrupted", source: ["Check the lock file", "Create the lock file", "Process exits before cleanup", "Lock file remains", "Next job keeps waiting"], guarded: ["Acquire an atomic lock", "Register cleanup for handled exits", "Process receives a handled termination signal", "Exit handler releases the lock", "Next job can start"] },
  race: { label: "Two jobs arrive together", source: ["Job A sees an absent lock", "Job B sees an absent lock", "Job A creates the file", "Job B touches the same file", "Both jobs enter the backup section"], guarded: ["Job A requests an atomic lock", "Job A owns the lock", "Job B requests the same lock", "Job B waits with a deadline", "Only A enters the backup section"] },
};

export function BackupFailureExperiment() {
  const [scenario, setScenario] = useState<keyof typeof backupScenarios>("dump");
  const [step, setStep] = useState(0);
  const current = backupScenarios[scenario];
  return <ProjectCopy copy={sourceExperimentsCopy}><section className={styles.lab} aria-label="Backup failure experiment">
    <header className={styles.heading}><span>HOME LAB / BACKUP FAILURES</span><h3>Would the success log survive a failed backup?</h3><p>Inject a failure and compare how two backup workflows handle locks, exit status and cleanup.</p></header>
    <div className={styles.panel}><div className={styles.controls}><label>Failure to inject<ClassicSelect value={scenario} onChange={(e) => { setScenario(e.target.value as keyof typeof backupScenarios); setStep(0); }}>{Object.entries(backupScenarios).map(([id, item]) => <option key={id} value={id}>{item.label}</option>)}</ClassicSelect></label><div className={styles.actions}><button type="button" disabled={step === 5} onClick={() => setStep((value) => value + 1)}>Advance one event</button><button type="button" onClick={() => setStep(0)}>Reset replay</button></div></div>
      <div className={styles.comparison} aria-live="polite"><article><h5>Basic backup sequence</h5><ol>{current.source.slice(0,step).map((event,i) => <li key={i}>{event}</li>)}</ol>{step === 0 ? <p>Ready to replay.</p> : null}</article><article><h5>Guarded backup sequence</h5><ol>{current.guarded.slice(0,step).map((event,i) => <li key={i}>{event}</li>)}</ol>{step === 0 ? <p>Ready to replay.</p> : null}</article></div>
      <p className={styles.note}>{step < 5 ? `Event ${step} of 5. Follow the lock owner, exit status and reported result.` : scenario === "dump" ? "The basic sequence logs success after a failing dump. The guarded flow checks exit status before accepting the output." : scenario === "interrupted" ? "The lock can outlive an interrupted job. Cleanup for handled exits lets the next attempt proceed." : "Check-then-touch lets both jobs enter. An atomic operation establishes one owner."}</p>
      <details className={styles.receipt}><summary>How a guarded backup completes</summary><p>An atomic lock establishes one owner. The dump writes to a temporary file; its exit status determines whether that output becomes the next accepted backup. Cleanup releases the lock after handled exits.</p><p>Abrupt power loss needs operating-system-managed locks or stale-lock recovery. Test a restore to check the backup itself. A retention count of 180 files covers a duration determined by successful backup frequency.</p></details>
    </div>
  </section></ProjectCopy>;
}

export function MriErrorExperiment() {
  const [pattern, setPattern] = useState<"diffuse" | "localised">("diffuse");
  const [amplitude, setAmplitude] = useState(.1);
  const [acceleration, setAcceleration] = useState(4);
  const errors = Array.from({ length: 16 }, (_, i) => pattern === "diffuse" ? amplitude : i === 5 ? amplitude * 4 : 0);
  const mse = errors.reduce((sum,value) => sum + value * value, 0) / errors.length;
  const mae = errors.reduce((sum,value) => sum + Math.abs(value), 0) / errors.length;
  const desired = Math.floor(256 / acceleration), acs = Math.floor(256 * .08), lines = Math.max(desired,acs);
  return <ProjectCopy copy={sourceExperimentsCopy}><section className={styles.lab} aria-label="MRI error and sampling experiments">
    <header className={styles.heading}><span>MRI / SYNTHETIC MECHANISM EXPERIMENTS</span><h3>Same squared error. Different spatial damage.</h3><p>Spread a fixed error budget across a patch or concentrate it in one pixel. Watch which metrics distinguish the patterns.</p></header>
    <div className={styles.panel}><div className={styles.controls}><label>Error pattern<ClassicSelect value={pattern} onChange={(e) => setPattern(e.target.value as typeof pattern)}><option value="diffuse">Sixteen small errors</option><option value="localised">One concentrated error</option></ClassicSelect></label><label>Base residual · {amplitude.toFixed(2)}<input type="range" min=".05" max=".2" step=".01" value={amplitude} onChange={(e) => setAmplitude(Number(e.target.value))} /></label></div>
      <div className={styles.comparison}><article><h5>4 × 4 residual patch</h5><div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:4 }}>{errors.map((value,i) => <div key={i} style={{ padding:"12px 4px", textAlign:"center", background:`rgba(17,23,122,${value})`, color:value > .45 ? "white" : "#111", border:"1px solid #999", fontSize:14 }}>{value.toFixed(2)}</div>)}</div></article><article><h5>Recomputed pixel metrics</h5><dl><div><dt>MSE</dt><dd>{mse.toFixed(4)}</dd></div><div><dt>PSNR, unit peak</dt><dd>{(-10 * Math.log10(mse)).toFixed(2)} dB</dd></div><div><dt>MAE</dt><dd>{mae.toFixed(4)}</dd></div></dl><p className={styles.note}>At residual 0.10, both patterns have MSE 0.01 and PSNR 20 dB. MAE changes from 0.10 to 0.025. Spatial structure needs its own inspection.</p></article></div>
      <details className={styles.receipt}><summary>Inspect the central sampling budget</summary><label>Requested acceleration<ClassicSelect value={String(acceleration)} onChange={(e) => setAcceleration(Number(e.target.value))}>{[4,8,16].map((r) => <option key={r} value={r}>R = {r}</option>)}</ClassicSelect></label><p>{`For 256 phase-encoding lines and an 8% central calibration band: target ${desired} lines, central band ${acs} lines, retained ${lines} lines, effective R = ${(256 / lines).toFixed(2)}.`}</p><p>At R = 16, the 20 central lines already exceed the requested 16-line budget. The central band limits the achievable acceleration.</p></details>
      <p className={styles.note}>The reconstruction objective combines L1 error with SSIM loss. The pixel experiment explains why spatial structure matters alongside an aggregate error metric; the sampling budget shows how the central calibration band limits acceleration.</p>
    </div>
  </section></ProjectCopy>;
}
