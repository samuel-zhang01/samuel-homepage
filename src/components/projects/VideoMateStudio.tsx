"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { projectText } from "@/lib/projectCopy";
import { DemoWindow } from "./DemoChrome";
import { useProjectDemoActive } from "./ProjectDemoActivityContext";
import { ProjectCopy } from "./ProjectTranslationBoundary";
import { videoMateCopy } from "./copy/videoMateCopy";
import styles from "./VideoMateStudio.module.css";

type Workflow = "inspect" | "repair" | "migrate";
type MigrationPolicy = "keep" | "hevc";
type Sample = {
  id: string;
  name: string;
  kind: "video" | "document";
  format: string;
  duration: string;
  size: string;
  finding: string;
  explanation: string;
  blocks: readonly ("good" | "damaged" | "missing")[];
};
type Outcome = {
  label: string;
  route: string;
  detail: string;
  tone: "good" | "review" | "withheld" | "neutral";
  published: boolean;
};

const samples: readonly Sample[] = [
  {
    id: "01", name: "01 · Harbour lights", kind: "video", format: "MP4 · H.264 / AAC", duration: "00:42", size: "86 MB",
    finding: "Clean full decode", explanation: "The container opens and the intended audio and video streams decode end to end. This establishes readable integrity, not whether the original recording was complete.",
    blocks: Array(22).fill("good"),
  },
  {
    id: "02", name: "02 · Broken index", kind: "video", format: "MP4 · H.264 / AAC", duration: "01:06", size: "124 MB",
    finding: "Container index fault", explanation: "Encoded media remains readable, but the MP4 index is damaged. A bounded remux can rebuild a playable container without inventing frames.",
    blocks: ["damaged", ...Array(21).fill("good")],
  },
  {
    id: "03", name: "03 · Interrupted frames", kind: "video", format: "MOV · H.264 / PCM", duration: "00:53", size: "211 MB",
    finding: "Video decode errors", explanation: "A short interval contains damaged frames. A compatible encode may retain the readable portion, but the loss must be disclosed and the result independently checked.",
    blocks: [...Array(9).fill("good"), "damaged", "damaged", "damaged", ...Array(10).fill("good")],
  },
  {
    id: "04", name: "04 · Missing tail", kind: "video", format: "MP4 · HEVC / AAC", duration: "00:36", size: "71 MB",
    finding: "Source data absent", explanation: "The source ends before its expected media is available. The missing bytes cannot be recreated; this example is withheld from the output package.",
    blocks: [...Array(14).fill("good"), ...Array(8).fill("missing")],
  },
  {
    id: "05", name: "05 · Field notes", kind: "document", format: "TXT · companion file", duration: "—", size: "12 KB",
    finding: "Non-video companion", explanation: "Migration can carry a non-video file into the new package and verify its copy byte for byte. Inspect and Repair leave it alone.",
    blocks: Array(22).fill("good"),
  },
] as const;

const stages = [
  { label: "Discover", detail: "Classify five invented items without opening a visitor file." },
  { label: "Inspect", detail: "Model container and full software-decode findings." },
  { label: "Plan", detail: "Choose eligible copy, remux or encode routes." },
  { label: "Verify", detail: "Check each proposed output before publication." },
  { label: "Review", detail: "Show published, unchanged and withheld outcomes." },
] as const;

function outcomeFor(sample: Sample, workflow: Workflow, policy: MigrationPolicy, gpu: boolean): Outcome {
  if (sample.kind === "document") return workflow === "migrate"
    ? { label: "Copied unchanged", route: "Byte-verified companion copy", detail: "The synthetic document joins the new package without conversion.", tone: "good", published: true }
    : { label: "Outside this workflow", route: "No media worker", detail: "Only the migration workflow includes non-video companions.", tone: "neutral", published: false };
  if (workflow === "inspect") {
    const labels = {
      "01": "Readable throughout", "02": "Damaged container", "03": "Damaged stream", "04": "Incomplete source",
    } as Record<string, string>;
    return { label: labels[sample.id], route: "Software decode inspection", detail: sample.explanation, tone: sample.id === "01" ? "good" : sample.id === "04" ? "withheld" : "review", published: false };
  }
  if (sample.id === "04") return { label: "Withheld for review", route: "No verified candidate", detail: "Missing source bytes cannot be reconstructed. The original remains untouched and no incomplete output is published.", tone: "withheld", published: false };
  if (workflow === "repair") {
    if (sample.id === "01") return { label: "No repair needed", route: "Clean source retained", detail: "A healthy original does not need a recovered copy unless conversion is explicitly requested.", tone: "neutral", published: false };
    if (sample.id === "02") return { label: "Verified recovery", route: "Lossless remux → independent decode", detail: "The container is rebuilt from readable encoded streams; the candidate passes a separate full verification.", tone: "good", published: true };
    return { label: "Verified with losses", route: `${gpu ? "Qualified GPU" : "Software"} H.264 / AAC → independent decode`, detail: "A playable result passes verification, with a damaged interval and metadata loss disclosed for review.", tone: "review", published: true };
  }
  if (sample.id === "01") return { label: "Copied unchanged", route: "Byte-verified healthy copy", detail: "The healthy H.264 MP4 enters the new package without re-encoding under either migration profile.", tone: "good", published: true };
  if (sample.id === "02" && policy === "keep") return { label: "Verified recovery", route: "Remux → independent decode", detail: "Readable encoded streams are repackaged and verified before the copy is published.", tone: "good", published: true };
  const partial = sample.id === "03";
  const codec = policy === "keep" ? "H.264" : "HEVC";
  return {
    label: partial ? "Verified with losses" : "Verified HEVC output",
    route: `${gpu ? "Qualified GPU" : "Software"} ${codec} / AAC → independent decode`,
    detail: partial ? "The damaged interval is disclosed. The independently verified playable portion joins the package for human review." : "The candidate passes full decode and the selected MP4 output checks before publication.",
    tone: partial ? "review" : "good", published: true,
  };
}

export function VideoMateStudio({ locale = "en-GB" }: { locale?: Locale }) {
  const active = useProjectDemoActive();
  const [workflow, setWorkflow] = useState<Workflow>("migrate");
  const [policy, setPolicy] = useState<MigrationPolicy>("hevc");
  const [gpu, setGpu] = useState(true);
  const [sensitive, setSensitive] = useState(true);
  const [selectedId, setSelectedId] = useState("03");
  const [stage, setStage] = useState(-1);
  const t = (source: string) => projectText(locale, videoMateCopy, source);
  const selected = samples.find((sample) => sample.id === selectedId) ?? samples[0];
  const complete = stage === stages.length - 1;
  const outcomes = useMemo(() => new Map(samples.map((sample) => [sample.id, outcomeFor(sample, workflow, policy, gpu)])), [workflow, policy, gpu]);
  const selectedOutcome = outcomes.get(selected.id)!;
  const published = samples.filter((sample) => outcomes.get(sample.id)?.published).length;
  const withheld = workflow === "inspect" ? 0 : samples.filter((sample) => outcomes.get(sample.id)?.tone === "withheld").length;

  useEffect(() => {
    if (!active || stage < 0 || complete) return;
    const timer = window.setTimeout(() => setStage((current) => Math.min(current + 1, stages.length - 1)), 850);
    return () => window.clearTimeout(timer);
  }, [active, complete, stage]);

  const changeWorkflow = (next: Workflow) => { setWorkflow(next); setStage(-1); };
  const changePolicy = (next: MigrationPolicy) => { setPolicy(next); setStage(-1); };
  const changeGpu = () => { setGpu((current) => !current); setStage(-1); };
  const displayName = (sample: Sample) => sensitive ? `${t("Item")} ${sample.id}` : t(sample.name);

  return <ProjectCopy copy={videoMateCopy} locale={locale}><DemoWindow
    appName="VideoMate"
    title="The recovery desk"
    status="Synthetic collection · offline simulation"
    purpose="Follow an invented mixed folder through VideoMate's inspect, repair and migrate decisions. The browser models technical outcomes; it does not open or process media."
    tryThis="Select an item, switch the workflow or GPU route, then run the sample job. Compare what is published and what is held back."
    watchFor="Every candidate needs independent verification. An absent source segment stays absent, and originals are never changed."
    statusTone="safe"
    className={styles.studio}
    footer={<><span>5 fictional items · no uploads · no FFmpeg process</span><span>Originals always untouched</span></>}
  >
    <div className={styles.workspace}>
      <div className={styles.hero}>
        <div className={styles.brand}><Image src="/project-art/videomate-mark.svg" alt="" width={92} height={92} /><div><span className={styles.kicker}>OFFLINE VIDEO REPAIR</span><h3>What happens to a damaged file?</h3><p>Pick one of five invented files. See what VideoMate would copy, repair, re-encode or hold back.</p></div></div>
        <div className={styles.heroStat}><span>DEMO MODE</span><strong>100% synthetic</strong><small>No files leave or enter this page.</small></div>
      </div>

      <div className={styles.workflows} role="group" aria-label="Choose a VideoMate workflow">
        {(["inspect", "repair", "migrate"] as const).map((value, index) => <button type="button" key={value} aria-pressed={workflow === value} onClick={() => changeWorkflow(value)}>
          <span>0{index + 1}</span><strong>{t(value === "inspect" ? "Inspect" : value === "repair" ? "Repair" : "Migrate")}</strong><small>{t(value === "inspect" ? "Find what is readable" : value === "repair" ? "Recover a verified copy" : "Build a new collection")}</small>
        </button>)}
      </div>

      <div className={styles.mainGrid}>
        <section className={styles.queue} aria-labelledby="vm-queue-title">
          <div className={styles.sectionHead}><div><span className={styles.kicker}>01 / SOURCE</span><h4 id="vm-queue-title">Synthetic collection</h4></div><span className={styles.counter}>05 ITEMS</span></div>
          <p className={styles.subtle}>Choose a sample to inspect its technical evidence. The names and findings are invented.</p>
          <div className={styles.itemList}>
            {samples.map((sample) => <button type="button" key={sample.id} className={styles.item} aria-pressed={selected.id === sample.id} onClick={() => setSelectedId(sample.id)}>
              <span className={styles.itemGlyph} aria-hidden="true">{sample.kind === "video" ? "▣" : "▤"}</span>
              <span className={styles.itemText}><strong>{displayName(sample)}</strong><small>{t(sample.format)} · {sample.size}{sample.kind === "video" ? ` · ${sample.duration}` : ""}</small></span>
              <span className={styles.itemIndicator} data-tone={sample.id === "01" || sample.id === "05" ? "good" : sample.id === "04" ? "withheld" : "review"} aria-hidden="true" />
            </button>)}
          </div>
          <div className={styles.legend}><span><i data-tone="good" />Readable</span><span><i data-tone="review" />Damage</span><span><i data-tone="withheld" />Absent bytes</span></div>
        </section>

        <section className={styles.inspector} aria-labelledby="vm-inspector-title">
          <div className={styles.sectionHead}><div><span className={styles.kicker}>02 / EVIDENCE</span><h4 id="vm-inspector-title">{displayName(selected)}</h4></div><span className={styles.readout}>{selected.kind === "video" ? selected.duration : "TXT"}</span></div>
          <div className={styles.streamCard}>
            <div className={styles.streamTitle}><span>{selected.kind === "video" ? "STREAM INTEGRITY" : "FILE BYTES"}</span><strong>{t(selected.finding)}</strong></div>
            <div className={styles.filmstrip} role="img" aria-label={`${t(selected.finding)}. ${t(selected.explanation)}`}>
              {selected.blocks.map((block, index) => <span key={index} data-block={block} />)}
            </div>
            <div className={styles.trackFoot}><span>START</span><span>{selected.kind === "video" ? "PLAYBACK-RELATIVE POSITION" : "BYTE RANGE"}</span><span>END</span></div>
          </div>
          <p className={styles.evidenceText}>{t(selected.explanation)}</p>
          <div className={styles.routeCard} data-tone={complete ? selectedOutcome.tone : "neutral"}>
            <span className={styles.kicker}>{complete ? "JOB RESULT" : "PROPOSED ROUTE"}</span>
            <h5>{complete ? t(selectedOutcome.label) : t(workflow === "inspect" ? "Inspect first; publish nothing" : selectedOutcome.label)}</h5>
            <p>{complete ? t(selectedOutcome.detail) : t(selectedOutcome.route)}</p>
            {complete && <small>{t(selectedOutcome.route)}</small>}
          </div>
        </section>
      </div>

      <div className={styles.controlGrid}>
        <section className={styles.settings} aria-labelledby="vm-settings-title">
          <div className={styles.sectionHead}><div><span className={styles.kicker}>03 / OPTIONS</span><h4 id="vm-settings-title">Choose the route</h4></div></div>
          {workflow === "migrate" && <fieldset className={styles.policy}><legend>Migration profile</legend>
            <label><input type="radio" name="vm-policy" checked={policy === "keep"} onChange={() => changePolicy("keep")} /><span><strong>Keep healthy · MP4 recovery</strong><small>Copy clean files; repair only damaged video.</small></span></label>
            <label><input type="radio" name="vm-policy" checked={policy === "hevc"} onChange={() => changePolicy("hevc")} /><span><strong>Selective HEVC MP4</strong><small>Convert eligible video; verify every output.</small></span></label>
          </fieldset>}
          {workflow === "inspect" ? <p className={styles.inspectNote}>Inspection uses software decoding. GPU routing applies to repair and migration.</p> : <label className={styles.toggleRow}><input type="checkbox" checked={gpu} onChange={changeGpu} /><span><strong>Qualified GPU route available</strong><small>{gpu ? "Eligible encodes try hardware first." : "Eligible encodes use software fallback."}</small></span></label>}
          <label className={styles.toggleRow}><input type="checkbox" checked={sensitive} onChange={() => setSensitive((current) => !current)} /><span><strong>Mask sample names</strong><small>{sensitive ? "On · show neutral item numbers." : "Off · show invented sample names."}</small></span></label>
        </section>

        <section className={styles.runPanel} aria-labelledby="vm-run-title">
          <div className={styles.sectionHead}><div><span className={styles.kicker}>04 / ACTIVITY</span><h4 id="vm-run-title">Sample job</h4></div><span className={styles.counter}>{stage < 0 ? "READY" : complete ? "COMPLETE" : "RUNNING"}</span></div>
          <ol className={styles.pipeline} aria-label="Sample job stages">
            {stages.map((step, index) => <li key={step.label} className={styles.step} data-state={stage < index ? "pending" : stage === index ? "current" : "done"} aria-current={stage === index ? "step" : undefined}>
              <span>{String(index + 1).padStart(2, "0")}</span><div><strong>{t(step.label)}</strong><small>{t(step.detail)}</small></div>
            </li>)}
          </ol>
          <div className={styles.runActions}><button type="button" className={`s7-button is-primary ${styles.runButton}`} onClick={() => setStage(0)} disabled={stage >= 0 && !complete}>{complete ? "Run another pass" : stage >= 0 ? "Working…" : "Run sample job"} <span aria-hidden="true">↗</span></button><span role="status" aria-live="polite">{stage < 0 ? "Ready to simulate. No real media is touched." : t(stages[stage].detail)}</span></div>
        </section>
      </div>

      {complete && <section className={styles.results} aria-labelledby="vm-results-title">
        <div className={styles.sectionHead}><div><span className={styles.kicker}>05 / REVIEW</span><h4 id="vm-results-title">{workflow === "inspect" ? "Inspection findings" : "Verified package report"}</h4></div><span className={styles.resultTotals}>{workflow === "inspect" ? "5 classified" : `${published} published · ${withheld} withheld`}</span></div>
        <ul className={styles.resultList}>{samples.map((sample) => { const result = outcomes.get(sample.id)!; return <li className={styles.result} data-tone={result.tone} key={sample.id}><span>{sample.id}</span><div><strong>{displayName(sample)}</strong><small>{t(result.route)}</small></div><b>{t(result.label)}</b></li>; })}</ul>
        <p className={styles.resultNote}>This is an explanatory simulation. Verification shown here is a modeled decision, not proof from a processed file. Originals remain untouched.</p>
      </section>}
    </div>
  </DemoWindow></ProjectCopy>;
}

export default VideoMateStudio;
