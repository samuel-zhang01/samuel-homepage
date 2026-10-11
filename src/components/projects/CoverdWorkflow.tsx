"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { ProjectCopy } from "./ProjectTranslationBoundary";
import { coverdWorkflowCopy } from "./copy/coverdWorkflowCopy";
import styles from "./CoverdWorkflow.module.css";

const dimensions = [
  { label: "Skills", words: ["python", "typescript"], question: "Which language did you use, and what did you build?" },
  { label: "Experience", words: ["deployed", "maintained"], question: "What did you ship, and what was your responsibility?" },
  { label: "Domain knowledge", words: ["recruitment", "hiring"], question: "What have you learned about the hiring workflow?" },
  { label: "Trajectory", words: ["promoted", "led"], question: "How has the scope of your work changed?" },
  { label: "Communication", words: ["documented", "presented"], question: "How did you explain your work to another person?" },
  { label: "Working preferences", words: [], question: "What working conditions help you do your best work?" },
];
const sample = "I built a Python API and maintained its tests.\nI deployed a recruitment dashboard.\nI documented the API for another developer.";
const stages = ["Application", "Specialist review", "Summary", "Follow-up"];

export default function CoverdWorkflow({ locale }: { locale: Locale }) {
  const [text, setText] = useState(sample);
  const [record, setRecord] = useState(sample);
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [selected, setSelected] = useState(0);
  const [answer, setAnswer] = useState("");
  const [followUps, setFollowUps] = useState<Record<number, string>>({});
  const [exported, setExported] = useState(false);
  const sentences = record.split(/\n|(?<=\.)\s/).map(line => line.trim()).filter(Boolean);
  const findings = dimensions.map((dimension, index) => ({ ...dimension, quote: followUps[index] || sentences.find(line => dimension.words.some(word => line.toLowerCase().includes(word))) || "" }));
  const missing = findings.filter(finding => !finding.quote).length;
  const ready = record.trim().length >= 30;
  useEffect(() => {
    if (!playing) return;
    if (stage === 3) { setPlaying(false); return; }
    const timer = window.setTimeout(() => setStage(previous => previous + 1), 850);
    return () => window.clearTimeout(timer);
  }, [playing, stage]);
  const start = (automatic: boolean) => {
    setRecord(text); setFollowUps({}); setAnswer(""); setSelected(0); setExported(false);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setStage(automatic && reduced ? 3 : 1); setPlaying(automatic && !reduced);
  };
  const exportNotes = () => {
    const content = JSON.stringify({ example: true, application: record, findings: findings.map(({ label, quote, question }) => ({ dimension: label, statement: quote || null, question: quote ? null : question })) }, null, 2);
    const url = URL.createObjectURL(new Blob([content], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = "coverd-example-review.json"; link.click(); URL.revokeObjectURL(url); setExported(true);
  };
  return <ProjectCopy copy={coverdWorkflowCopy} locale={locale}><section className={styles.workbench}>
    <header><h4>Try an application review</h4><p>I separate six dimensions, keep the applicant’s own statements visible and ask follow-up questions where the record is incomplete.</p><small>Worked example · editable text and literal matching in this browser. My product runs specialist AI agents; this playground does not call them.</small></header>
    <ol className={styles.stages} aria-label="Review stages">{stages.map((label, index) => <li key={label} data-active={stage === index}><span>{index + 1}</span>{label}</li>)}</ol>
    <div className={styles.layout}>
      <section className={styles.application}>
        <label htmlFor="coverd-example-cv">Example application</label>
        <textarea id="coverd-example-cv" rows={6} value={text} onChange={event => { setText(event.target.value); setPlaying(false); setStage(0); setExported(false); }} />
        <div className={styles.actions}><button className="s7-button is-primary" type="button" onClick={() => start(true)}>Play the review</button><button className="s7-button" type="button" onClick={() => { if (stage === 0) start(false); else { setPlaying(false); setStage(previous => Math.min(3, previous + 1)); } }} disabled={stage === 3}>Step one stage</button><button className="s7-button" type="button" onClick={() => { setPlaying(false); setText(sample); setRecord(sample); setFollowUps({}); setAnswer(""); setStage(0); setSelected(0); setExported(false); }}>Reset example</button></div>
        {playing && <button className="s7-button" type="button" onClick={() => setPlaying(false)}>Pause</button>}
        {stage === 0 && <p>Edit a sentence, then run the review. Try removing the deployment statement.</p>}
        {stage > 0 && !ready && <p role="status">The application is too short to review. Request a readable copy before assessing it.</p>}
      </section>
      <section className={styles.review} aria-live="polite">
        {stage === 0 ? <p>The six review dimensions appear here after you start.</p> : !ready ? <p>No assessment produced.</p> : <>
          <div className={styles.dimensions} role="group" aria-label="Specialist review">{findings.map((finding, index) => <button type="button" key={finding.label} aria-pressed={selected === index} onClick={() => { setSelected(index); setAnswer(""); }}><strong>{finding.label}</strong><span>{finding.quote ? "Statement found" : "Question needed"}</span></button>)}</div>
          <article className={styles.finding} key={selected}><h5>{findings[selected].label}</h5>{findings[selected].quote ? <><span>Applicant’s statement</span><blockquote>{findings[selected].quote}</blockquote><p>A statement to inspect, not a verified qualification.</p></> : <><p>No supporting statement in this example.</p><strong>{findings[selected].question}</strong></>}</article>
          {stage >= 2 && <p role="status">{missing === 0 ? "All six dimensions have a statement to review." : "Some dimensions need follow-up."} {findings.filter(finding => !finding.quote).map(finding => <span key={finding.label}> · {finding.label}</span>)}</p>}
          {stage === 3 && <form className={styles.followUp} onSubmit={event => { event.preventDefault(); if (!answer.trim()) return; setFollowUps(previous => ({ ...previous, [selected]: answer.trim() })); setAnswer(""); setExported(false); }}><label htmlFor="coverd-example-answer">Add an example follow-up answer</label><p>{findings[selected].question}</p><textarea id="coverd-example-answer" rows={2} value={answer} onChange={event => setAnswer(event.target.value)} /><button className="s7-button" type="submit" disabled={!answer.trim()}>Add to this review</button></form>}
          {stage >= 2 && <div className={styles.actions}><button className="s7-button" type="button" onClick={exportNotes}>Download example review</button>{exported && <span role="status">Review downloaded</span>}</div>}
        </>}
      </section>
    </div>
    <p className={styles.note}>Questions address gaps in the record. A recruiter reviews the statements and makes the hiring decision.</p>
  </section></ProjectCopy>;
}
