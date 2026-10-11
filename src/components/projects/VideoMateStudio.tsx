"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import { projectText } from "@/lib/projectCopy";
import { System7Icon } from "../System7Icon";
import { ProjectCopy } from "./ProjectTranslationBoundary";
import { videoMateCopy } from "./copy/videoMateCopy";
import styles from "./VideoMateStudio.module.css";

type Workflow = "inspect" | "repair" | "migrate";
type Sample = { id: string; name: string; finding: string; explanation: string; blocks: readonly ("good" | "damaged" | "missing")[] };
type Outcome = { label: string; detail: string; tone: "good" | "review" | "neutral"; copied: boolean };

const samples: readonly Sample[] = [
  { id: "01", name: "Healthy video", finding: "Plays from start to finish", explanation: "The picture and audio can be decoded throughout. A healthy file needs no repair.", blocks: Array(20).fill("good") },
  { id: "02", name: "Broken MP4 index", finding: "Picture data remains readable", explanation: "The index that tells a player where to find the picture and sound is broken. Rebuilding the container can make the existing recording playable again.", blocks: ["damaged", ...Array(19).fill("good")] },
  { id: "03", name: "Damaged frames", finding: "One interval is damaged", explanation: "Most of the recording is readable, but some frames are damaged. A recovered copy may play while still containing a visible loss.", blocks: [...Array(8).fill("good"), ...Array(3).fill("damaged"), ...Array(9).fill("good")] },
  { id: "04", name: "Missing end of recording", finding: "Part of the source is absent", explanation: "The recording ends before the expected data is available. Missing bytes cannot be recreated by conversion.", blocks: [...Array(13).fill("good"), ...Array(7).fill("missing")] },
  { id: "05", name: "Companion notes", finding: "An ordinary text file", explanation: "A mixed folder can include notes as well as videos. Migration copies these files unchanged; Inspect and Repair leave them alone.", blocks: Array(20).fill("good") },
];

const workflows = [
  { id: "inspect", label: "Inspect", description: "What is readable?", action: "Show inspection findings", summary: "Inspection gives me a diagnosis without creating replacement files." },
  { id: "repair", label: "Repair", description: "Can I make a playable copy?", action: "Show recovery outcomes", summary: "Repair creates a separate copy only when it passes the output checks. A playable result can still have disclosed losses." },
  { id: "migrate", label: "Migrate", description: "Can I build a new collection?", action: "Show the new collection", summary: "Migration combines unchanged copies and checked repairs in a new folder. Anything unresolved is listed for review." },
] as const;

function outcomeFor(id: string, workflow: Workflow): Outcome {
  if (workflow === "inspect") {
    const outcomes: Record<string, Outcome> = {
      "01": { label: "Healthy", detail: "No repair is needed. Inspection creates no new file.", tone: "good", copied: false },
      "02": { label: "Container needs repair", detail: "Try rebuilding the MP4 container from the readable picture and audio.", tone: "review", copied: false },
      "03": { label: "Damaged recording", detail: "A repair may retain readable material; the damaged interval needs review.", tone: "review", copied: false },
      "04": { label: "Incomplete recording", detail: "The source is missing data. Inspection identifies the problem; it cannot fill the gap.", tone: "review", copied: false },
      "05": { label: "Left alone", detail: "This task inspects video, so the notes are left unchanged.", tone: "neutral", copied: false },
    };
    return outcomes[id];
  }
  if (id === "04") return { label: "Needs review · no new copy", detail: "This example has no acceptable recovery. I keep the original and report the omission rather than silently treating the collection as complete.", tone: "review", copied: false };
  if (id === "03") return { label: "Playable copy · losses reported", detail: "The readable material is encoded into a new file and checked again. The damaged interval is still a loss, so the result needs human review.", tone: "review", copied: true };
  if (id === "02") return { label: "Playable copy · checked again", detail: "The readable streams are placed in a rebuilt container without re-encoding. A separate full decode checks the new copy before it is kept.", tone: "good", copied: true };
  if (workflow === "migrate") return { label: "Copied unchanged", detail: "The file joins the new collection. Its copied bytes are checked against the original.", tone: "good", copied: true };
  return { label: id === "01" ? "No repair needed" : "Left alone", detail: "The original stays where it is. This repair task creates no unnecessary replacement.", tone: "neutral", copied: false };
}

export function VideoMateStudio({ locale = "en-GB" }: { locale?: Locale }) {
  const [workflow, setWorkflow] = useState<Workflow>("repair");
  const [selectedId, setSelectedId] = useState("02");
  const [complete, setComplete] = useState(false);
  const t = (source: string, values?: Readonly<Record<string, string | number>>) => projectText(locale, videoMateCopy, source, values);
  const selected = samples.find((sample) => sample.id === selectedId)!;
  const task = workflows.find((item) => item.id === workflow)!;
  const result = outcomeFor(selectedId, workflow);
  const copyCount = samples.filter((sample) => outcomeFor(sample.id, workflow).copied).length;

  return <ProjectCopy copy={videoMateCopy} locale={locale}><section className={`system7-project ${styles.studio}`} aria-label="VideoMate product walkthrough">
    <header className={styles.intro}>
      <span className={styles.productIcon}><System7Icon kind="videomate" /></span>
      <div><span className={styles.eyebrow}>VideoMate · desktop app</span><h2>Recover readable video. Keep the original.</h2><p>I built VideoMate to make damaged-video decisions understandable: find what still works, recover a separate copy, and see exactly what needs review.</p></div>
    </header>
    <div className={styles.productLinks}><a className="s7-button" href="https://github.com/samuel-zhang01/VideoMate#install-and-start" target="_blank" rel="noopener noreferrer">Get started from source</a><a className="s7-button" href="https://github.com/samuel-zhang01/VideoMate#readme" target="_blank" rel="noopener noreferrer">Read my user guide</a><span>0.8.5 source preview · desktop installers are still in development</span></div>

    <section className={styles.walkthrough} aria-labelledby="vm-try-title">
      <div className={styles.sectionHead}><h3 id="vm-try-title">Try a damaged-video collection</h3><p>Choose a task, then show the outcome. Click a file to understand the decision.</p></div>
      <div className={styles.workflows} role="group" aria-label="Choose a VideoMate task">{workflows.map((item) => <button type="button" className="s7-button" key={item.id} aria-pressed={workflow === item.id} onClick={() => { setWorkflow(item.id); setComplete(false); }}><strong>{t(item.label)}</strong><small>{t(item.description)}</small></button>)}</div>
      <div className={styles.actionBar}><button type="button" className="s7-button is-default" onClick={() => setComplete(true)}>{t(task.action)}</button><span role="status">{complete ? t(workflow === "inspect" ? "5 items reviewed · no replacement files" : "{count} new copies · 1 unresolved video", { count: copyCount }) : "Ready to walk through the example"}</span></div>
      <div className={styles.workspace}>
        <section className={styles.collection} aria-labelledby="vm-files-title"><h4 id="vm-files-title">Original collection</h4><div className={styles.fileList}>{samples.map((sample) => <button type="button" key={sample.id} className={styles.file} aria-pressed={selectedId === sample.id} onClick={() => setSelectedId(sample.id)}><span className={styles.fileIcon}><System7Icon kind={sample.id === "05" ? "document" : "videomate"} /></span><span><strong>{t(sample.name)}</strong><small>{complete ? t(outcomeFor(sample.id, workflow).label) : t(sample.finding)}</small></span></button>)}</div><p className={styles.originalNote}>All five originals stay unchanged.</p></section>
        <section className={styles.inspector} aria-labelledby="vm-selected-title"><h4 id="vm-selected-title">{t(selected.name)}</h4><p>{t(selected.explanation)}</p><div className={styles.stream} role="img" aria-label={t(selected.finding)}>{selected.blocks.map((block, index) => <span key={index} data-state={block} />)}</div><div className={styles.legend}><span><i data-state="good" />Readable</span><span><i data-state="damaged" />Damaged</span><span><i data-state="missing" />Missing</span></div>
          <div className={styles.outcome} data-tone={complete ? result.tone : "neutral"} aria-live="polite" aria-atomic="true"><span className={styles.eyebrow}>{complete ? "What I would get" : "What happens next"}</span><h5>{complete ? t(result.label) : t(task.description)}</h5><p>{complete ? t(result.detail) : t(task.summary)}</p></div>
        </section>
      </div>
      <p className={styles.exampleNote}>These five invented examples explain my app&apos;s decisions. This page does not process video; use the desktop app for your files.</p>
    </section>

    <details className={styles.details}><summary>What else can my desktop app do?</summary><div className={styles.detailBody}><ul><li><strong>Build a mixed-folder migration.</strong> Copy healthy videos and companion files, repair eligible damage, and choose whether unresolved files are omitted or placed in a separate review folder.</li><li><strong>Control the output.</strong> Choose preservation or compatible MP4, approximate size targets and optional audio normalization. Suitable hardware encoders have a software fallback.</li><li><strong>Continue interrupted work.</strong> Continue a stopped migration in the same session, or opt into a private restart checkpoint before starting.</li><li><strong>Work locally.</strong> Processing stays offline. Sensitive mode hides queue names and defaults to session-only history; this is application privacy treatment, not encryption.</li></ul></div></details>
    <details className={styles.details}><summary>How recovery works</summary><div className={styles.detailBody}><p>I use FFmpeg and FFprobe behind a native interface and command line. Full inspection decodes the audio and picture; a quick metadata check alone cannot tell me whether the whole recording is readable.</p><p>Recovery tries the selected policy, then checks the candidate independently. Rebuilding a container preserves readable encoded streams; encoding makes a new representation of decoded material. Neither route invents missing footage.</p><a href="https://github.com/samuel-zhang01/VideoMate/blob/main/docs/recovery-options.md" target="_blank" rel="noopener noreferrer">Read the recovery options</a></div></details>
  </section></ProjectCopy>;
}

export default VideoMateStudio;
