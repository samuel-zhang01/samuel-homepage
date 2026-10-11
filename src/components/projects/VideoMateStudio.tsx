"use client";

import { useEffect, useState, type CSSProperties } from "react";
import type { Locale } from "@/lib/i18n";
import { projectText } from "@/lib/projectCopy";
import ClassicSelect from "../ClassicSelect";
import { System7Icon } from "../System7Icon";
import { ProjectCopy } from "./ProjectTranslationBoundary";
import { videoMateCopy } from "./copy/videoMateCopy";
import { advanceLabJob, createLabJob, labJobView, labSamplePhases, labSamples, planLabSample, type LabId, type LabJob, type LabOptions, type LabResult, type LabBlock } from "./videoMateLab";
import styles from "./VideoMateStudio.module.css";

const names: Record<LabId, string> = { healthy: "Healthy MOV", index: "Broken MP4 index", frames: "Damaged frames", tail: "Missing end of recording", notes: "Companion notes" };
const findings: Record<LabId, string> = { healthy: "Readable picture and sound", index: "Readable streams; broken container", frames: "3 damaged sections out of 20", tail: "39 of 60 seconds remain", notes: "Ordinary text file" };
const tasks = [{ id: "inspect", label: "Inspect", description: "Check without changing files" }, { id: "repair", label: "Repair", description: "Make checked copies" }, { id: "migrate", label: "Migrate", description: "Build a new collection" }] as const;
const phaseNames = { inspect: "Inspect", prepare: "Make a copy", verify: "Verify", publish: "Publish" };
const methodNames = { none: "No new file", copy: "Byte-for-byte copy", remux: "Remux · encoded streams kept", preserve: "MKV · FFV1 video / PCM audio", mp4: "MP4 · H.264 video / AAC audio" };
const results: Record<LabResult["kind"], { label: string; detail: string }> = {
  healthy: { label: "Full check passed", detail: "No repair needed; the original stays in place." },
  metadata: { label: "Metadata read · video unchecked", detail: "Quick inspection cannot establish whether the whole recording plays." },
  container: { label: "Container needs repair", detail: "Readable encoded streams can be placed in a new container." },
  damaged: { label: "Decode errors found", detail: "Damaged sections need recovery and review." },
  incomplete: { label: "21 seconds missing", detail: "Conversion cannot recreate the missing end." },
  untouched: { label: "Left alone", detail: "Inspect and Repair do not process companion notes." },
  copied: { label: "Copied unchanged", detail: "The copied bytes match the original." },
  recovered: { label: "Checked copy ready", detail: "The candidate passed independent decode, stream and timing checks." },
  partial: { label: "Shorter copy · needs review", detail: "39 seconds retained. The missing 21 seconds are still absent." },
  withheld: { label: "Not published", detail: "The candidate failed a required check. The original stays in place." },
  omitted: { label: "Omitted · reported", detail: "No acceptable repair; the omission stays visible in the result." },
  unresolved_copy: { label: "Unresolved copy in collection", detail: "Byte-verified copy, still damaged. It is not a verified recovery." },
  review_copy: { label: "Unchanged copy in review folder", detail: "Kept apart from the new collection; still needs review." },
};
const initialOptions: LabOptions = { task: "repair", depth: "full", route: "mp4", unresolved: "exclude", allowShorter: false, maxShorter: 10, convertHealthy: false };

function Strip({ blocks, progress, active, label }: { blocks: readonly LabBlock[]; progress: number; active: boolean; label: string }) {
  return <ProjectCopy copy={videoMateCopy}><div className={styles.strip} role="img" aria-label={label} data-active={active || undefined} style={{ "--vm-progress": `${progress * 100}%` } as CSSProperties}>
    {blocks.map((block, index) => <span key={index} data-state={block} />)}<i aria-hidden="true" className={styles.scanHead} />
  </div></ProjectCopy>;
}

export function VideoMateStudio({ locale = "en-GB" }: { locale?: Locale }) {
  const [options, setOptions] = useState<LabOptions>(initialOptions);
  const [queue, setQueue] = useState<LabId[]>(labSamples.map(sample => sample.id));
  const [selectedId, setSelectedId] = useState<LabId>("index");
  const [job, setJob] = useState<LabJob | null>(null);
  const t = (source: string, values?: Readonly<Record<string, string | number>>) => projectText(locale, videoMateCopy, source, values);
  const view = job ? labJobView(job) : null;
  const locked = job?.mode === "running" || job?.mode === "paused";
  const focusedId = locked && view?.currentId ? view.currentId : selectedId;
  const sample = labSamples.find(item => item.id === focusedId)!;
  const planned = planLabSample(sample, job?.options ?? options);
  const finished = view?.results.find(result => result.id === focusedId);
  const current = locked && focusedId === view?.currentId;
  const candidateVisible = Boolean(finished || (current && view?.phase !== "inspect"));
  const candidateTitle = finished?.destination === "collection" ? "New copy" : finished?.destination === "review" ? "Review copy" : "Candidate · not published";
  const published = view?.results.filter(result => result.destination === "collection") ?? [];
  const review = view?.results.filter(result => result.destination === "review") ?? [];
  const omissions = view?.results.filter(result => result.kind === "omitted" || result.kind === "withheld") ?? [];
  const needsReview = view?.results.some(result => result.losses || ["partial", "unresolved_copy", "review_copy", "omitted", "withheld"].includes(result.kind));
  const inspectionQuick = (job?.options ?? options).task === "inspect" && (job?.options ?? options).depth === "quick";

  useEffect(() => {
    if (job?.mode !== "running") return;
    const timer = window.setInterval(() => setJob(previous => previous?.mode === "running" ? advanceLabJob(previous) : previous), 120);
    return () => window.clearInterval(timer);
  }, [job?.mode]);

  function changeOptions(patch: Partial<LabOptions>) { if (!locked) { setOptions(previous => ({ ...previous, ...patch })); setJob(null); } }
  function changeQueue(id: LabId) { if (!locked) { setQueue(previous => previous.includes(id) ? previous.filter(item => item !== id) : [...previous, id]); setJob(null); } }
  function start(step = false) {
    if (!queue.length) return;
    setSelectedId(queue.includes(selectedId) ? selectedId : queue[0]);
    const next = createLabJob(queue, options, step ? "paused" : "running");
    setJob(step ? advanceLabJob(next, true) : next);
  }
  function step() { if (!job || job.mode === "done") start(true); else setJob(advanceLabJob({ ...job, mode: "paused" }, true)); }
  const progress = view && job && view.total ? Math.round(job.tick / view.total * 100) : 0;
  const outcome = finished ? results[finished.kind] : null;
  const visiblePhases = current && view ? view.phases : labSamplePhases(sample, job?.options ?? options);

  return <ProjectCopy copy={videoMateCopy} locale={locale}><section className={`system7-project ${styles.studio}`} aria-label="VideoMate browser lab">
    <header className={styles.intro}><span className={styles.productIcon}><System7Icon kind="videomate" /></span><div><span className={styles.eyebrow}>VideoMate · desktop app</span><h2>Recover a collection, one checked file at a time.</h2><p>I built VideoMate to inspect damaged videos, keep readable material and leave originals untouched.</p></div></header>
    <div className={styles.productLinks}><a className="s7-button" href="https://github.com/samuel-zhang01/VideoMate#install-and-start" target="_blank" rel="noopener noreferrer">Get started from source</a><a className="s7-button" href="https://github.com/samuel-zhang01/VideoMate#readme" target="_blank" rel="noopener noreferrer">Read my user guide</a><span>0.8.5 source preview · desktop installers are still in development</span></div>

    <div className={styles.workflows} role="group" aria-label="Choose a VideoMate task">{tasks.map(task => <button type="button" className="s7-button" key={task.id} aria-pressed={options.task === task.id} disabled={locked} onClick={() => changeOptions({ task: task.id })}><strong>{t(task.label)}</strong><small>{t(task.description)}</small></button>)}</div>
    <section className={styles.lab} aria-label="Try the processing workflow">
      <div className={styles.transport}><button type="button" className="s7-button is-default" disabled={!queue.length || locked} onClick={() => start()}>{t(job?.mode === "done" ? "Run again" : "Run selected queue")}</button>{locked && <button type="button" className="s7-button" onClick={() => setJob(previous => previous ? { ...previous, mode: previous.mode === "running" ? "paused" : "running" } : previous)}>{t(job?.mode === "running" ? "Pause" : "Continue")}</button>}<button type="button" className="s7-button" disabled={!queue.length || job?.mode === "running"} onClick={step}>Step one phase</button><button type="button" className="s7-button" disabled={!job} onClick={() => setJob(null)}>Reset</button><a className="s7-button" href="#vm-files-title">Choose files</a><span>{t("{count} selected", { count: queue.length })}</span></div>
      <p className={styles.status} role="status">{job?.mode === "done" ? t(options.task === "inspect" ? "Inspection finished · no new files" : needsReview ? "Finished · review losses and omissions" : "Finished · new collection ready") : locked ? t(job?.mode === "paused" ? "Paused · continue from this phase" : "Working: {file} · {phase}", { file: t(names[view!.currentId]), phase: t(phaseNames[view!.phase]) }) : t(queue.length ? "Choose files and options, then run or step through the queue." : "Select at least one example file.")}</p>
      <div className={styles.options}>
        {options.task === "inspect" ? <label className={styles.option}><span>Inspection</span><ClassicSelect value={options.depth} disabled={locked} onChange={event => changeOptions({ depth: event.target.value as LabOptions["depth"] })} aria-label={t("Inspection")}><option value="full">{t("Full · decode the whole video")}</option><option value="quick">{t("Quick · metadata only")}</option></ClassicSelect><small>{t(options.depth === "quick" ? "Fast, but later decode errors stay unknown." : "Check picture and sound from start to finish.")}</small></label>
          : <label className={styles.option}><span>Recovery</span><ClassicSelect value={options.route} disabled={locked} onChange={event => changeOptions({ route: event.target.value as LabOptions["route"] })} aria-label={t("Recovery")}><option value="mp4">{t("Compatible MP4")}</option><option value="preserve">{t("Preserve decoded samples · MKV")}</option><option value="remux">{t("Remux only · keep encoded streams")}</option></ClassicSelect><small>{t(options.route === "remux" ? "A new container cannot fix corrupt encoded frames." : options.route === "preserve" ? "FFV1 / PCM keeps decoded samples; it cannot undo damage." : "Copy eligible streams, otherwise encode H.264 / AAC.")}</small></label>}
        {options.task === "migrate" && <label className={styles.option}><span>Unresolved files</span><ClassicSelect value={options.unresolved} disabled={locked} onChange={event => changeOptions({ unresolved: event.target.value as LabOptions["unresolved"] })} aria-label={t("Unresolved files")}><option value="exclude">{t("Exclude and report")}</option><option value="review">{t("Copy to separate review folder")}</option><option value="copy">{t("Copy unchanged into collection")}</option></ClassicSelect></label>}
        {options.task !== "inspect" && <details className={styles.lossOptions}><summary>Partial footage and conversion</summary><div><label className={styles.check}><input type="checkbox" checked={options.allowShorter} disabled={locked} onChange={event => changeOptions({ allowShorter: event.target.checked })} /><span>Allow a verified shorter copy</span></label>{options.allowShorter && <label className={styles.range}><span>{t("Shortening limit: {percent}%", { percent: options.maxShorter })}</span><input type="range" min="0" max="50" step="5" value={options.maxShorter} disabled={locked} aria-label={t("Maximum shortening percentage")} onChange={event => changeOptions({ maxShorter: Number(event.target.value) })} /><small>Missing-end sample loses 35%; a 10% limit withholds it.</small></label>}{options.route === "mp4" && <label className={styles.check}><input type="checkbox" checked={options.convertHealthy} disabled={locked} onChange={event => changeOptions({ convertHealthy: event.target.checked })} /><span>Convert healthy videos to MP4 too</span></label>}</div></details>}
      </div>

      {job && view && <div className={styles.progress}><progress max="100" value={progress} aria-label={t("Queue progress")} /><span>{t("{done} / {total} files finished", { done: view.finished, total: job.ids.length })} · {progress}%</span></div>}

      <div className={styles.workspace}>
        <section className={styles.collection} aria-labelledby="vm-files-title"><div className={styles.sectionHead}><h3 id="vm-files-title">Original collection</h3><div className={styles.selectionActions}><button type="button" className="s7-button" disabled={locked} onClick={() => { setQueue(labSamples.map(item => item.id)); setJob(null); }}>Select all</button><button type="button" className="s7-button" disabled={locked} onClick={() => { setQueue([]); setJob(null); }}>Clear selection</button></div></div>
          <div className={styles.fileList}>{labSamples.map(item => { const result = view?.results.find(value => value.id === item.id); return <div className={styles.file} key={item.id} data-selected={focusedId === item.id || undefined}><label className={styles.queueCheck}><input type="checkbox" checked={queue.includes(item.id)} disabled={locked} onChange={() => changeQueue(item.id)} aria-label={t("Include {file}", { file: t(names[item.id]) })} /></label><button type="button" className={styles.fileButton} disabled={locked} aria-pressed={focusedId === item.id} onClick={() => setSelectedId(item.id)}><span className={styles.fileIcon}><System7Icon kind={item.id === "notes" ? "document" : "videomate"} /></span><span><strong>{t(names[item.id])}</strong><small>{t(result ? results[result.kind].label : findings[item.id])}</small></span></button></div>; })}</div><p className={styles.originalNote}>Originals stay here, unchanged.</p>
        </section>
        <section className={styles.inspector} aria-labelledby="vm-current-title"><h3 id="vm-current-title">{t(names[focusedId])}</h3>
          <ol className={styles.phases} aria-label="Processing phases" style={{ "--vm-phases": visiblePhases.length } as CSSProperties}>{visiblePhases.map((phase, index) => <li key={phase} data-blocked={Boolean(finished && phase === "publish" && finished.destination === "none") || undefined} data-active={current && view?.phase === phase || undefined} data-complete={Boolean(finished) || Boolean(current && view && view.phases.indexOf(view.phase) > index) || undefined}><b>{index + 1}</b><span>{t(finished && phase === "publish" && finished.destination === "none" ? "Not published" : phaseNames[phase])}</span></li>)}</ol>
          <div className={styles.flow}><div className={styles.framePanel}><div><strong>Original</strong><code>{sample.filename}</code></div><Strip blocks={sample.blocks} progress={inspectionQuick ? 0 : view?.progress ?? 0} active={Boolean(current && view?.phase === "inspect" && !inspectionQuick)} label={t(findings[focusedId])} /><small>{t(sample.duration ? "{seconds} second example" : "Text-file bytes", { seconds: sample.duration })}</small></div>{planned.method !== "none" && <><span className={styles.arrow} aria-hidden="true">↓</span><div className={styles.framePanel} data-stage={current ? view?.phase : finished ? "done" : "waiting"}><div><strong>{t(candidateTitle)}</strong><span>{t(candidateVisible ? methodNames[planned.method] : "Waiting")}</span></div>{candidateVisible ? <Strip blocks={planned.blocks} progress={view?.progress ?? 0} active={Boolean(current && (view?.phase === "prepare" || view?.phase === "verify"))} label={t(planned.losses ? "New representation; missing or damaged content is not restored." : "Candidate data awaiting independent verification.")} /> : <div className={styles.emptyFrame}>{t(options.task === "inspect" ? "Inspection makes no replacement files." : "A separate copy appears here during the run.")}</div>}<small>{t(candidateVisible ? planned.kind === "partial" ? "39 seconds kept · 21 seconds still missing" : planned.method === "preserve" ? "Decoded samples kept losslessly · damage remains" : planned.reencoded ? "H.264 / AAC encode · picture and sound can change" : "Encoded streams or bytes kept" : "Nothing published yet")}</small></div></>}</div>
          {candidateVisible && planned.method !== "none" && <div className={styles.checks} aria-label="Output checks">{["Decode", "Stream properties", "Timing", "Copied bytes"].map((label, index) => { const state = index === 0 ? planned.decode : index === 1 ? planned.method === "copy" || planned.method === "none" ? "not_run" : "passed" : index === 2 ? planned.timing : planned.bytes; const checked = Boolean(finished || (current && view?.phase === "publish")); return <div key={label}><span>{t(label)}</span><strong data-state={checked ? state : "waiting"}>{t(checked ? state === "passed" ? "Passed" : state === "failed" ? "Failed" : "Not needed" : "Pending")}</strong></div>; })}</div>}
          <div className={styles.legend} aria-label="Example data key">{(["readable", "damaged", "missing", "lost"] as const).map((state, index) => <span key={state}><i data-state={state} aria-hidden="true" />{t(["Readable", "Damaged", "Missing", "Lost during recovery"][index])}</span>)}</div>
          {outcome && finished && <div className={styles.outcome}><strong>{t(outcome.label)}</strong><p>{t(finished.kind === "withheld" || finished.kind === "omitted" ? finished.decode === "failed" ? "Remux keeps the damaged frames; the decode check failed." : "35% of the recording is missing; the shortening rule withholds this copy." : outcome.detail)}</p>{finished.losses && <p>{t(finished.kind === "partial" ? "Shortening was explicitly allowed; review the retained footage." : finished.reencoded ? "Encoding changes the representation; damaged sections are not restored." : "The unresolved content still needs review.")}</p>}</div>}
        </section>
      </div>
      <section className={styles.outputs} aria-labelledby="vm-output-title"><div className={styles.sectionHead}><span className={styles.fileIcon}><System7Icon kind="folder" /></span><h3 id="vm-output-title">New collection</h3><strong>{published.length}</strong></div>{published.length ? <ul>{published.map(result => <li key={result.id}><code>{result.filename}</code><span>{t(results[result.kind].label)}</span>{result.losses && <b>Review losses</b>}</li>)}</ul> : <p>{t(job?.options.task === "inspect" ? "Inspection makes no replacement files." : "Only completed, checked work appears here.")}</p>}{review.length > 0 && <div><h4>Separate review folder</h4><ul>{review.map(result => <li key={result.id}><code>{result.filename}</code><span>{t(results[result.kind].label)}</span></li>)}</ul></div>}{omissions.length > 0 && <div><h4>Not published</h4><ul>{omissions.map(result => <li key={result.id}><span>{t(names[result.id])}</span><span>{t(results[result.kind].label)}</span></li>)}</ul></div>}</section>
      <p className={styles.exampleNote}>Generated example files · browser simulation, not FFmpeg.</p>
    </section>
    <details className={styles.details}><summary>What the real app does</summary><div className={styles.detailBody}><p>Full inspection decodes picture and sound. Recovery verifies a separate candidate before publication. Migration also byte-checks ordinary copies.</p><p>MP4 may copy eligible streams or encode new ones. FFV1 / PCM preserves decoded samples, not missing or damaged original content.</p><a href="https://github.com/samuel-zhang01/VideoMate/blob/main/docs/recovery-options.md" target="_blank" rel="noopener noreferrer">Read the recovery options</a></div></details>
  </section></ProjectCopy>;
}

export default VideoMateStudio;
