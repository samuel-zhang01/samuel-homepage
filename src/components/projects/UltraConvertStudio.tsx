"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { Locale } from "@/lib/i18n";
import { projectText, type ProjectCopyValues } from "@/lib/projectCopy";
import { DEMO_FORMATS, exampleFiles, planRule, renameStem, templateRule, uniqueOutputName, type ConvertCategory, type DemoCondition, type DemoFile, type DemoRule, type DemoStep, type PlanIssue } from "@/lib/ultraConvertDemo";
import ClassicSelect from "../ClassicSelect";
import { System7Icon } from "../System7Icon";
import { ProjectCopy } from "./ProjectTranslationBoundary";
import { ultraConvertCopy } from "./copy/ultraConvertCopy";
import styles from "./UltraConvertStudio.module.css";

type Tab = "rules" | "finder" | "image";
type FileStatus = "existing" | "queued" | "settling" | "checking" | "saving" | "saved" | "no-match" | "blocked" | "paused";
type Arrival = { file: DemoFile; status: FileStatus; rule: DemoRule; path?: string; issue?: PlanIssue };
type Published = { id: string; path: string; original: string };
const categories: ConvertCategory[] = ["image", "audio", "video", "document", "config"];
const categoryLabels = { image: "Images", audio: "Audio", video: "Video", document: "Documents", config: "Structured data" } as const;
const fieldLabels = { category: "Detected category", format: "Detected format", nameContains: "Filename contains", namePrefix: "Filename starts with", nameSuffix: "Filename ends with" } as const;
const statusLabels: Record<FileStatus, string> = { existing: "Existing · not queued", queued: "Waiting in queue", settling: "Waiting for a stable file", checking: "Checking conditions", saving: "Running actions", saved: "Saved · original kept", "no-match": "No match · unchanged", blocked: "Stopped · original kept", paused: "Arrived while paused · ignored" };
const issueLabels: Record<PlanIssue, string> = { "empty-condition": "Give every condition a value.", "invalid-name": "Use a valid name and only the supported tokens.", "incompatible-format": "This output format does not fit this file category.", "unsafe-destination": "Save outside the watched inbox to prevent a loop.", "conversion-required": "Documents need a Convert block to preserve companion resources." };
const tabs: { id: Tab; label: string }[] = [{ id: "rules", label: "Folder rules" }, { id: "finder", label: "Finder actions" }, { id: "image", label: "Convert an image" }];
const finderActions = ["Convert Here", "Convert to Destination", "Choose Format…", "Convert to WebP", "Convert to MP3"];
const allFormats = [...new Set(categories.flatMap(category => [...DEMO_FORMATS[category]]))];
const finderSamples = exampleFiles("images").filter(file => ["photo", "recording", "clip", "notes"].includes(file.id));
const ruleEqual = (a: DemoRule, b: DemoRule) => JSON.stringify(a) === JSON.stringify(b);

export function UltraConvertStudio({ locale = "en-GB" }: { locale?: Locale }) {
  const t = (source: string, values?: ProjectCopyValues) => projectText(locale, ultraConvertCopy, source, values);
  const [tab, setTab] = useState<Tab>("rules");
  const [draft, setDraft] = useState<DemoRule>(() => templateRule("image"));
  const [savedRule, setSavedRule] = useState<DemoRule>(() => templateRule("image"));
  const [watching, setWatching] = useState(true);
  const [arrivals, setArrivals] = useState<Arrival[]>(() => exampleFiles("images").slice(0, 2).map(file => ({ file, status: "existing", rule: templateRule("image") })));
  const [published, setPublished] = useState<Published[]>([]);
  const publishedRef = useRef(published);
  publishedRef.current = published;
  const counter = useRef(10);
  const [sampleId, setSampleId] = useState("photo");
  const [previewId, setPreviewId] = useState("photo");
  const [announcement, setAnnouncement] = useState("Save the rule and add files to see it run.");
  const [dragId, setDragId] = useState<string | null>(null);
  const monitorRef = useRef<HTMLElement>(null);
  const example = exampleFiles(draft.inbox).find(file => file.id === previewId)!;
  const preview = planRule(draft, example, published.map(output => output.path));
  const invalidDraft = draft.conditions.some(condition => !condition.value.trim()) ? "empty-condition" : draft.destination === "inbox" ? "unsafe-destination" : draft.steps.some(step => step.kind === "rename" && !renameStem(step.value, "Photo", "webp")) ? "invalid-name" : undefined;
  const dirty = !ruleEqual(draft, savedRule);
  const current = arrivals.find(item => ["queued", "settling", "checking", "saving"].includes(item.status));

  // One file advances at a time. The shortened clock illustrates the native
  // stable-file wait; matching, names, ordered actions and collision logic run.
  useEffect(() => {
    if (!watching || !current) return;
    const { file, rule, status } = current;
    const delay = status === "settling" ? rule.settleSeconds * 120 : 280;
    const timer = setTimeout(() => {
      let next: FileStatus = status === "queued" ? "settling" : "checking";
      let issue: PlanIssue | undefined, path: string | undefined;
      if (status === "checking" || status === "saving") {
        const plan = planRule(rule, file, publishedRef.current.map(output => output.path));
        issue = plan.issue;
        next = issue ? "blocked" : !plan.matches ? "no-match" : status === "checking" ? "saving" : "saved";
        if (next === "saved" && plan.outputPath) {
          path = plan.outputPath;
          setPublished(previous => [...previous, { id: `${file.id}-output-${counter.current++}`, path: plan.outputPath!, original: file.name }].slice(-12));
        }
      }
      setArrivals(previous => previous.map(item => item.file.id === file.id ? { ...item, status: next, issue, path } : item));
      setAnnouncement(issue ? issueLabels[issue] : statusLabels[next]);
    }, delay);
    return () => clearTimeout(timer);
  }, [current, watching]);

  function appendFiles(files: DemoFile[], rule = savedRule, enabled = watching) {
    const additions: Arrival[] = files.map(file => ({ file: { ...file, id: `${file.id}-${counter.current++}` }, rule, status: enabled ? "queued" : "paused" }));
    setArrivals(previous => [...previous, ...additions].slice(-18));
    setAnnouncement(enabled ? "New files queued. Originals stay in the inbox." : "Paused arrivals are ignored. Resume, then run existing files explicitly.");
  }
  function saveRule(addFiles = false) {
    if (invalidDraft) return;
    setSavedRule(draft);
    setArrivals(previous => previous.map(item => ({ ...item, status: "existing", rule: draft })));
    setAnnouncement("Rule saved. Existing files form the baseline.");
    if (addFiles) {
      appendFiles(exampleFiles(draft.inbox), draft);
      if (window.matchMedia("(max-width: 720px)").matches) {
        monitorRef.current?.scrollIntoView({ block: "start" });
        monitorRef.current?.focus({ preventScroll: true });
      }
    }
  }
  function toggleWatching() {
    setWatching(previous => !previous);
    setArrivals(previous => previous.map(item => ["queued", "settling", "checking", "saving"].includes(item.status) ? { ...item, status: "existing" } : item));
    setAnnouncement(watching ? "Watching paused. New arrivals will be ignored." : "Watching resumed. Existing files form a new baseline.");
  }
  function updateCondition(id: string, update: Partial<DemoCondition>) {
    setDraft(previous => ({ ...previous, conditions: previous.conditions.map(condition => condition.id === id ? { ...condition, ...update } : condition) }));
  }
  function updateStep(id: string, update: Partial<DemoStep>) {
    setDraft(previous => ({ ...previous, steps: previous.steps.map(step => step.id === id ? { ...step, ...update } : step) }));
  }
  function moveStep(id: string, target: number) {
    setDraft(previous => {
      const steps = [...previous.steps], from = steps.findIndex(step => step.id === id);
      if (from < 0 || target < 0 || target >= steps.length) return previous;
      steps.splice(target, 0, steps.splice(from, 1)[0]);
      return { ...previous, steps };
    });
  }
  function tabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const next = tabs[(index + (event.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length].id;
    setTab(next);
    document.getElementById(`uc-tab-${next}`)?.focus();
  }

  const [selection, setSelection] = useState(["photo", "recording", "notes"]);
  const finderFiles = finderSamples;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [batch, setBatch] = useState<DemoFile[] | null>(null);
  const [here, setHere] = useState(true);
  const [targets, setTargets] = useState<Record<ConvertCategory, string>>({ image: "webp", audio: "mp3", video: "mp4", document: "docx", config: "yaml" });
  const [presetRejected, setPresetRejected] = useState(false);
  const [finderOutputs, setFinderOutputs] = useState<string[]>([]);
  const [finderRunning, setFinderRunning] = useState(false);
  const batchCategories = [...new Set(batch?.map(file => file.category) ?? [])];
  useEffect(() => { if (menuOpen) menuRef.current?.querySelector<HTMLButtonElement>("button")?.focus(); }, [menuOpen]);
  useEffect(() => {
    if (!finderRunning || !batch) return;
    const timer = setTimeout(() => {
      const occupied = [...finderOutputs];
      const outputs = batch.map(file => {
        const name = `${file.name.replace(/\.[^.]+$/, "")}.${targets[file.category]}`;
        const path = here ? uniqueOutputName(name, [...finderFiles.map(item => item.name), ...occupied]) : `Batch/${file.name.replace(/\.[^.]+$/, "")}/${name}`;
        occupied.push(path);
        return path;
      });
      setFinderOutputs(outputs);
      setFinderRunning(false);
    }, 650);
    return () => clearTimeout(timer);
  }, [finderRunning, batch, finderOutputs, finderFiles, here, targets]);
  function prepareBatch(action: string) {
    const files = finderFiles.filter(file => selection.includes(file.id));
    if (!files.length) return;
    const preset = action === "Convert to WebP" ? "webp" : action === "Convert to MP3" ? "mp3" : undefined;
    const compatible = !preset || files.every(file => DEMO_FORMATS[file.category].includes(preset));
    if (preset && compatible) setTargets(previous => Object.fromEntries(categories.map(category => [category, files.some(file => file.category === category) ? preset : previous[category]])) as Record<ConvertCategory, string>);
    setPresetRejected(!compatible);
    setBatch(files);
    setHere(action !== "Convert to Destination");
    setFinderOutputs([]);
    setMenuOpen(false);
  }
  function menuKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") { setMenuOpen(false); document.getElementById("uc-open-finder")?.focus(); }
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      const buttons = [...(menuRef.current?.querySelectorAll<HTMLButtonElement>("button") ?? [])];
      const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
      buttons[event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : (index + (event.key === "ArrowDown" ? 1 : buttons.length - 1)) % buttons.length]?.focus();
    }
  }

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bitmapRef = useRef<ImageBitmap | null>(null);
  const imageEpoch = useRef(0);
  const [sourceName, setSourceName] = useState("Sample.png");
  const [sourceBytes, setSourceBytes] = useState(0);
  const [imageFormat, setImageFormat] = useState("webp");
  const [quality, setQuality] = useState(85);
  const [imageBusy, setImageBusy] = useState(false);
  const [imageError, setImageError] = useState("");
  const [imageResult, setImageResult] = useState<{ url: string; name: string; bytes: number; mime: string } | null>(null);
  const imageResultRef = useRef(imageResult);
  imageResultRef.current = imageResult;
  function clearImageResult() {
    imageEpoch.current++;
    if (imageResultRef.current) URL.revokeObjectURL(imageResultRef.current.url);
    imageResultRef.current = null;
    setImageResult(null); setImageError(""); setImageBusy(false);
  }
  useEffect(() => {
    if (tab !== "image" || !canvasRef.current) return;
    const canvas = canvasRef.current, context = canvas.getContext("2d");
    if (!context) return;
    if (bitmapRef.current) {
      canvas.width = bitmapRef.current.width; canvas.height = bitmapRef.current.height;
      context.drawImage(bitmapRef.current, 0, 0);
      return;
    }
    canvas.width = 720; canvas.height = 420;
    const sky = context.createLinearGradient(0, 0, 0, 420);
    sky.addColorStop(0, "#708ba1"); sky.addColorStop(1, "#e9d8b4");
    context.fillStyle = sky; context.fillRect(0, 0, 720, 420);
    context.fillStyle = "#f3e4be"; context.beginPath(); context.arc(510, 105, 43, 0, Math.PI * 2); context.fill();
    context.fillStyle = "#627b72"; context.beginPath(); context.moveTo(0, 300); context.lineTo(160, 145); context.lineTo(325, 305); context.lineTo(470, 185); context.lineTo(720, 335); context.lineTo(720, 420); context.lineTo(0, 420); context.fill();
    context.fillStyle = "#3d5b55"; context.beginPath(); context.moveTo(0, 345); context.lineTo(240, 285); context.lineTo(510, 370); context.lineTo(720, 310); context.lineTo(720, 420); context.lineTo(0, 420); context.fill();
    canvas.toBlob(blob => { if (blob) setSourceBytes(blob.size); }, "image/png");
  }, [tab]);
  useEffect(() => () => { bitmapRef.current?.close(); if (imageResultRef.current) URL.revokeObjectURL(imageResultRef.current.url); }, []);
  async function loadImage(file?: File) {
    if (!file) return;
    clearImageResult();
    const epoch = imageEpoch.current;
    if (file.size > 16 * 1024 * 1024) { setImageError("Choose an image smaller than 16 MB."); return; }
    try {
      const bitmap = await createImageBitmap(file);
      if (epoch !== imageEpoch.current) { bitmap.close(); return; }
      if (bitmap.width * bitmap.height > 24_000_000) { bitmap.close(); setImageError("Choose an image under 24 megapixels."); return; }
      const canvas = canvasRef.current, context = canvas?.getContext("2d");
      if (!canvas || !context) { bitmap.close(); return; }
      bitmapRef.current?.close(); bitmapRef.current = bitmap;
      canvas.width = bitmap.width; canvas.height = bitmap.height; context.drawImage(bitmap, 0, 0);
      setSourceName(file.name); setSourceBytes(file.size);
    } catch { setImageError("This browser could not open that image. Try PNG, JPEG or WebP."); }
  }
  function convertImage() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    clearImageResult();
    const epoch = imageEpoch.current, mime = imageFormat === "jpg" ? "image/jpeg" : `image/${imageFormat}`;
    setImageBusy(true);
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = canvas.width; exportCanvas.height = canvas.height;
    const context = exportCanvas.getContext("2d");
    if (!context) { setImageBusy(false); setImageError("This browser cannot export that format. Choose another."); return; }
    if (imageFormat === "jpg") { context.fillStyle = "#ffffff"; context.fillRect(0, 0, exportCanvas.width, exportCanvas.height); }
    context.drawImage(canvas, 0, 0);
    exportCanvas.toBlob(blob => {
      if (epoch !== imageEpoch.current) return;
      setImageBusy(false);
      if (!blob || blob.type !== mime) { setImageError("This browser cannot export that format. Choose another."); return; }
      const name = uniqueOutputName(`${sourceName.replace(/\.[^.]+$/, "")}.${imageFormat}`, [sourceName]);
      setImageResult({ url: URL.createObjectURL(blob), name, bytes: blob.size, mime: blob.type });
    }, mime, quality / 100);
  }

  return <ProjectCopy copy={ultraConvertCopy} locale={locale}><section className={`system7-project ${styles.studio}`} aria-label="UltraConvert interactive product demo">
    <header className={styles.intro}><span className={styles.productIcon}><System7Icon kind="ultraconvert" /></span><div><span className={styles.eyebrow}>UltraConvert · native Mac app</span><h2>Make file conversion a small, repeatable task.</h2><p>I built UltraConvert so I can convert a batch from Finder, or let a folder rule handle the next file for me.</p></div></header>
    <nav className={styles.productLinks} aria-label="Get UltraConvert"><a className="s7-button" href="https://github.com/samuel-zhang01/UltraConvert/releases/tag/v1.6.0" target="_blank" rel="noopener noreferrer">Download the Mac preview</a><a href="https://github.com/samuel-zhang01/UltraConvert#install" target="_blank" rel="noopener noreferrer">Install and start</a><span>v1.6.0 · Apple Silicon · engines installed separately</span></nav>
    <div className={styles.tabs} role="tablist" aria-label="Explore UltraConvert">{tabs.map((item, index) => <button key={item.id} id={`uc-tab-${item.id}`} role="tab" type="button" className="s7-button" aria-selected={tab === item.id} aria-controls={`uc-panel-${item.id}`} tabIndex={tab === item.id ? 0 : -1} onKeyDown={event => tabKey(event, index)} onClick={() => setTab(item.id)}>{t(item.label)}</button>)}</div>

    {tab === "rules" && <div role="tabpanel" id="uc-panel-rules" aria-labelledby="uc-tab-rules" className={styles.panel}>
      <div className={styles.sectionHead}><h3>Build a rule. Drop in a file. Watch it run.</h3><p>Try moving Rename above Convert: the format token uses the format at that step.</p></div>
      <div className={styles.toolbar}><button type="button" className="s7-button is-default" disabled={Boolean(invalidDraft)} onClick={() => saveRule(true)}>Save and add example files</button><button type="button" className="s7-button" disabled={!dirty || Boolean(invalidDraft)} onClick={() => saveRule()}>Save rule</button><button type="button" className="s7-button" onClick={() => { const initial = templateRule("image"); setDraft(initial); setSavedRule(initial); setWatching(true); setPublished([]); setArrivals(exampleFiles("images").slice(0, 2).map(file => ({ file, status: "existing", rule: initial }))); setAnnouncement("Save the rule and add files to see it run."); }}>Reset example</button><span>{dirty ? "Unsaved changes · watcher uses the saved rule" : "Saved rule · watching new arrivals"}</span></div>
      <section className={styles.preview}><h4>Live rule preview</h4><label className={styles.control}><span>Test with</span><ClassicSelect aria-label={t("Preview file")} value={previewId} onChange={event => setPreviewId(event.target.value)}>{exampleFiles(draft.inbox).map(file => <option value={file.id} key={file.id}>{file.name}</option>)}</ClassicSelect></label><div className={`${styles.previewOutcome} ${preview.matches && !preview.issue ? styles.match : styles.noMatch}`}><strong>{preview.issue || invalidDraft ? "Rule needs a change" : preview.matches ? "Match → new copy" : "No match → leave unchanged"}</strong><code>{preview.outputPath ?? example.name}</code></div>{(invalidDraft || preview.issue) && <p role="alert" className={styles.error}>{t(issueLabels[(invalidDraft ?? preview.issue)!])}</p>}<small>Filename conditions ignore case and include the extension. Example date: 2026-10-11.</small></section>
      <div className={styles.ruleWorkspace}><section className={styles.composer} aria-label="Puzzle rule composer">
        <div className={styles.templates} role="group" aria-label="Start from a rule"><span>Start with</span>{(["image", "audio", "config"] as const).map(category => <button type="button" className="s7-button" key={category} onClick={() => setDraft(templateRule(category))}>{t(categoryLabels[category])}</button>)}</div>
        <div className={styles.puzzle}><h4><span className={styles.blockWord}>WHEN</span> A new file arrives</h4><label className={styles.control}><span>Watch folder</span><ClassicSelect aria-label={t("Watch folder")} value={draft.inbox} onChange={event => setDraft(previous => ({ ...previous, inbox: event.target.value as DemoRule["inbox"] }))}><option value="images">{t("Image inbox")}</option><option value="media">{t("Media inbox")}</option></ClassicSelect></label><div className={styles.row}><label className={styles.check}><input type="checkbox" checked={draft.recursive} onChange={event => setDraft(previous => ({ ...previous, recursive: event.target.checked }))} />Include subfolders</label><label className={styles.control}><span>Stable for</span><ClassicSelect aria-label={t("Stable for")} value={draft.settleSeconds} onChange={event => setDraft(previous => ({ ...previous, settleSeconds: Number(event.target.value) }))}>{[2, 3, 5].map(seconds => <option value={seconds} key={seconds}>{t("{seconds} seconds", { seconds })}</option>)}</ClassicSelect></label></div></div>
        <div className={styles.puzzle}><h4><span className={styles.blockWord}>IF</span> Match these conditions</h4><ClassicSelect aria-label={t("Condition mode")} value={draft.matchAll ? "all" : "any"} onChange={event => setDraft(previous => ({ ...previous, matchAll: event.target.value === "all" }))}><option value="all">{t("ALL conditions")}</option><option value="any">{t("ANY condition")}</option></ClassicSelect><div className={styles.conditions}>{draft.conditions.map((condition, index) => <div className={styles.condition} key={condition.id}><span className={styles.conditionField}><ClassicSelect aria-label={t("Condition {number}", { number: index + 1 })} value={condition.field} onChange={event => updateCondition(condition.id, { field: event.target.value as DemoCondition["field"], value: event.target.value === "category" ? "image" : event.target.value === "format" ? "png" : "Photo" })}>{Object.entries(fieldLabels).map(([field, label]) => <option value={field} key={field}>{t(label)}</option>)}</ClassicSelect></span><span className={styles.conditionField}>{condition.field === "category" ? <ClassicSelect aria-label={t("Category for condition {number}", { number: index + 1 })} value={condition.value} onChange={event => updateCondition(condition.id, { value: event.target.value })}>{categories.map(category => <option key={category} value={category}>{t(categoryLabels[category])}</option>)}</ClassicSelect> : <input className={styles.textInput} aria-label={t("Value for condition {number}", { number: index + 1 })} value={condition.value} maxLength={80} onChange={event => updateCondition(condition.id, { value: event.target.value })} />}</span><span className={preview.conditionMatches[index] ? styles.match : styles.noMatch}>{preview.conditionMatches[index] ? "Match" : "No match"}</span><button className="s7-button" type="button" aria-label={t("Remove condition {number}", { number: index + 1 })} disabled={draft.conditions.length === 1} onClick={() => setDraft(previous => ({ ...previous, conditions: previous.conditions.filter(item => item.id !== condition.id) }))}>×</button></div>)}</div><button type="button" className="s7-button" disabled={draft.conditions.length >= 12} onClick={() => setDraft(previous => ({ ...previous, conditions: [...previous.conditions, { id: `condition-${counter.current++}`, field: "nameContains", value: "Photo" }] }))}>Add condition</button></div>
        <div className={styles.actionStack} aria-label="Ordered actions">{draft.steps.map((step, index) => <div key={step.id} className={`${styles.puzzle} ${dragId === step.id ? styles.dragging : ""}`} onDragOver={event => { if (dragId) event.preventDefault(); }} onDrop={event => { event.preventDefault(); if (dragId) moveStep(dragId, index); setDragId(null); }}><div className={styles.blockHead}><h4><span className={styles.blockWord}>{index + 1}</span>{step.kind === "convert" ? "Convert" : "Rename"}</h4><div className={styles.orderButtons}><button type="button" className="s7-button" draggable onDragStart={event => { event.dataTransfer.setData("text/plain", step.id); setDragId(step.id); }} onDragEnd={() => setDragId(null)} aria-label={t("Drag action {number}; use the move buttons with a keyboard", { number: index + 1 })}>≡</button><button type="button" className="s7-button" disabled={index === 0} onClick={() => moveStep(step.id, index - 1)} aria-label={t("Move action {number} up", { number: index + 1 })}>↑</button><button type="button" className="s7-button" disabled={index === draft.steps.length - 1} onClick={() => moveStep(step.id, index + 1)} aria-label={t("Move action {number} down", { number: index + 1 })}>↓</button><button type="button" className="s7-button" disabled={draft.steps.length === 1} aria-label={t("Remove action {number}", { number: index + 1 })} onClick={() => setDraft(previous => ({ ...previous, steps: previous.steps.filter(item => item.id !== step.id) }))}>×</button></div></div>{step.kind === "convert" ? <ClassicSelect aria-label={t("Output format for action {number}", { number: index + 1 })} value={step.value} onChange={event => updateStep(step.id, { value: event.target.value })}>{allFormats.map(format => <option key={format} value={format}>{format.toUpperCase()}</option>)}</ClassicSelect> : <><input className={styles.textInput} aria-label={t("Name template for action {number}", { number: index + 1 })} value={step.value} maxLength={180} onChange={event => updateStep(step.id, { value: event.target.value })} /><small className={styles.tokens}><span>Tokens</span> <code>{"{name} {format} {date}"}</code></small></>}<div className={styles.trace}><span>After this step</span><code>{preview.traces[index] ?? "—"}</code></div></div>)}</div>
        <div className={styles.row}><button type="button" className="s7-button" disabled={draft.steps.length >= 8} onClick={() => setDraft(previous => ({ ...previous, steps: [...previous.steps, { id: `action-${counter.current++}`, kind: "convert", value: "webp" }] }))}>Add Convert</button><button type="button" className="s7-button" disabled={draft.steps.length >= 8} onClick={() => setDraft(previous => ({ ...previous, steps: [...previous.steps, { id: `action-${counter.current++}`, kind: "rename", value: "{name}-{date}" }] }))}>Add Rename</button></div>
        <div className={styles.puzzle}><h4><span className={styles.blockWord}>SAVE</span> A new copy</h4><ClassicSelect aria-label={t("Output folder")} value={draft.destination} onChange={event => setDraft(previous => ({ ...previous, destination: event.target.value as DemoRule["destination"] }))}><option value="web">{t("Web output · outside the inbox")}</option><option value="exports">{t("Exports · outside the inbox")}</option><option value="inbox">{t("Watched inbox · blocked")}</option></ClassicSelect><p className={styles.keep}>Keep the original · never overwrite an existing output</p></div>
      </section><aside className={styles.monitor} ref={monitorRef} tabIndex={-1} aria-label="Rule preview and activity">
        <section className={styles.inbox}><div className={styles.sectionTitle}><h4>Watched inbox</h4><span className={watching ? styles.match : styles.noMatch}>{watching ? "Watching" : "Paused"}</span></div><div className={styles.row}><ClassicSelect aria-label={t("New example file")} value={sampleId} onChange={event => setSampleId(event.target.value)}>{exampleFiles(savedRule.inbox).map(file => <option value={file.id} key={file.id}>{file.name}</option>)}</ClassicSelect><button type="button" className="s7-button" onClick={() => appendFiles([exampleFiles(savedRule.inbox).find(file => file.id === sampleId)!])}>Add file</button></div><div className={styles.row}><button type="button" className="s7-button" onClick={toggleWatching}>{watching ? "Pause watching" : "Resume watching"}</button><button type="button" className="s7-button" disabled={!watching || Boolean(current)} onClick={() => { setArrivals(previous => previous.map(item => ({ file: item.file, rule: savedRule, status: "queued" }))); setAnnouncement("Existing files explicitly queued with the saved rule."); }}>Run existing files</button></div><div className={styles.pipeline} aria-hidden="true">{["Arrival", "Stable", "Match", "Actions", "Save"].map((label, index) => <span key={label} className={current && ["queued", "settling", "checking", "saving"].indexOf(current.status) === index ? styles.activeStage : ""}>{t(label)}</span>)}</div><div className={styles.fileList}>{arrivals.map(item => <div className={`${styles.file} ${item.status === "saving" ? styles.processing : ""}`} key={item.file.id}><span className={styles.fileIcon}><System7Icon kind="document" /></span><div><code>{item.file.nested ? `Subfolder/${item.file.name}` : item.file.name}</code><small className={item.status === "saved" ? styles.match : ""}>{t(item.issue ? issueLabels[item.issue] : statusLabels[item.status])}</small></div></div>)}</div></section>
        <section className={styles.outputs}><h4>Output folder</h4>{published.length ? <ul>{published.map(output => <li key={output.id}><code>{output.path}</code><small>Original kept in the inbox</small></li>)}</ul> : <p>No new copies yet.</p>}</section>
      </aside></div><p className={styles.liveStatus} role="status" aria-live="polite">{t(announcement)}</p><p className={styles.boundary}>Sample files and a shortened clock. Matching, naming and routing run here; the Mac app runs the conversion engines.</p>
    </div>}

    {tab === "finder" && <div role="tabpanel" id="uc-panel-finder" aria-labelledby="uc-tab-finder" className={styles.panel}><div className={styles.sectionHead}><h3>Start with files already selected in Finder.</h3><p>Select a few examples, open the actions, then review the prepared batch.</p></div><div className={styles.finderWorkspace}><section className={styles.finder} aria-label="Example Finder selection" onContextMenu={event => { event.preventDefault(); if (selection.length) setMenuOpen(true); }}><div className={styles.finderTitle}><span className={styles.inlineIcon}><System7Icon kind="finder" /></span><strong>Example files</strong></div><div className={styles.finderGrid}>{finderFiles.map(file => <button type="button" className={styles.finderFile} key={file.id} aria-pressed={selection.includes(file.id)} disabled={finderRunning} onClick={() => { setSelection(previous => previous.includes(file.id) ? previous.filter(id => id !== file.id) : [...previous, file.id]); setBatch(null); setFinderOutputs([]); }}><span className={styles.fileIcon}><System7Icon kind="document" /></span><code>{file.name}</code></button>)}</div><button id="uc-open-finder" type="button" className="s7-button" aria-haspopup="menu" aria-expanded={menuOpen} disabled={!selection.length || finderRunning} onClick={() => setMenuOpen(previous => !previous)}>Open Finder actions</button>{menuOpen && <div role="menu" aria-label="UltraConvert Finder actions" className={styles.contextMenu} ref={menuRef} onKeyDown={menuKey}><span className={styles.menuCaption}>Quick Actions / Services</span>{finderActions.map(action => <button type="button" role="menuitem" key={action} onClick={() => prepareBatch(action)}><span className={styles.inlineIcon}><System7Icon kind="ultraconvert" /></span>{t(action)}</button>)}<button type="button" role="menuitem" onClick={() => { setMenuOpen(false); document.getElementById("uc-open-finder")?.focus(); }}>Close menu</button></div>}<p className={styles.hint}>Right-click also opens this menu. On a Mac, these are Quick Actions and Services.</p></section><section className={styles.batch} aria-label="Prepared conversion batch"><h4>Review before converting</h4>{batch ? <><p>{t("{count} files prepared · originals stay where they are", { count: batch.length })}</p>{presetRejected && <p className={styles.error} role="alert">That preset does not fit the whole selection. Choose a format for each category.</p>}{batchCategories.map(category => <label className={styles.control} key={category}><span>{t(categoryLabels[category])}</span><ClassicSelect disabled={finderRunning} aria-label={t("{category} output", { category: t(categoryLabels[category]) })} value={targets[category]} onChange={event => { setTargets(previous => ({ ...previous, [category]: event.target.value })); setPresetRejected(false); setFinderOutputs([]); }}>{DEMO_FORMATS[category].map(format => <option key={format} value={format}>{format.toUpperCase()}</option>)}</ClassicSelect></label>)}<fieldset className={styles.destination} disabled={finderRunning}><legend>Save to</legend><label><input type="radio" name="uc-finder-destination" checked={here} onChange={() => { setHere(true); setFinderOutputs([]); }} />Beside source files</label><label><input type="radio" name="uc-finder-destination" checked={!here} onChange={() => { setHere(false); setFinderOutputs([]); }} />One new batch folder</label></fieldset><button type="button" className="s7-button is-default" disabled={presetRejected || finderRunning} onClick={() => setFinderRunning(true)}>{finderRunning ? "Preparing example outputs…" : "Convert example batch"}</button><div className={styles.batchResult} aria-live="polite">{finderOutputs.length > 0 && <><strong>New copies · originals kept</strong><ul>{finderOutputs.map(path => <li key={path}><code>{path}</code></li>)}</ul></>}</div></> : <p>Choose an action to prepare the selected files. Nothing starts automatically.</p>}</section></div><p className={styles.boundary}>This batch uses sample files. Conversion runs in the Mac app; the image tab can convert a real image in this browser.</p><a className={styles.guideLink} href="https://github.com/samuel-zhang01/UltraConvert#enable-the-finder-actions" target="_blank" rel="noopener noreferrer">Enable these Finder actions on my Mac</a></div>}

    {tab === "image" && <div role="tabpanel" id="uc-panel-image" aria-labelledby="uc-tab-image" className={styles.panel}><div className={styles.sectionHead}><h3>Convert an image here, for real.</h3><p>Use my generated sample or choose an image. The browser creates the new file locally; the image is never uploaded.</p></div><div className={styles.imageWorkspace}><figure className={styles.imagePreview}><canvas ref={canvasRef} aria-label={t("Image to convert")} /><figcaption><code>{sourceName}</code><span>{t("{size} KB · original unchanged", { size: (sourceBytes / 1024).toFixed(1) })}</span></figcaption></figure><section className={styles.imageControls} aria-label="Local image conversion"><label className={styles.upload}><span className="s7-button">Choose a local image</span><input aria-label={t("Choose a local image")} type="file" accept="image/png,image/jpeg,image/webp" onChange={event => { void loadImage(event.target.files?.[0]); event.target.value = ""; }} /></label><label className={styles.control}><span>Output format</span><ClassicSelect aria-label={t("Image output format")} value={imageFormat} onChange={event => { clearImageResult(); setImageFormat(event.target.value); }}><option value="webp">WebP</option><option value="png">PNG</option><option value="jpg">JPEG</option></ClassicSelect></label><label className={styles.control}><span>{t("Quality · {quality}%", { quality })}</span><input type="range" min={10} max={100} step={5} value={quality} disabled={imageFormat === "png"} aria-label={t("Image quality")} onChange={event => { clearImageResult(); setQuality(Number(event.target.value)); }} /></label><p className={styles.hint}>{imageFormat === "png" ? "PNG is lossless; quality does not apply." : imageFormat === "jpg" ? "JPEG is lossy and does not keep transparency. Transparent areas use white." : "WebP uses lossy compression here. The original is kept."}</p><button type="button" className="s7-button is-default" disabled={imageBusy} onClick={convertImage}>{imageBusy ? "Converting…" : "Convert image"}</button>{imageError && <p className={styles.error} role="alert">{t(imageError)}</p>}{imageResult && <div className={styles.realResult} role="status"><strong>Image converted locally</strong><code>{imageResult.name}</code><span>{t("{size} KB · output {format}", { size: (imageResult.bytes / 1024).toFixed(1), format: imageResult.mime })}</span><a className="s7-button is-default" href={imageResult.url} download={imageResult.name}>Download converted image</a></div>}</section></div><p className={styles.boundary}>This browser tool supports PNG, JPEG and WebP. My Mac app also handles audio, video, documents and data with its installed engines.</p></div>}

    <details className={styles.details}><summary>How this relates to my Mac app</summary><div className={styles.detailBody}><p>The puzzle blocks follow my native rule editor: match the original file, run actions from top to bottom, save outside watched folders, and keep originals by default.</p><p>Saving or resuming starts a fresh baseline. Existing files only run when I explicitly choose Run Existing Files. The app watches while open, including with its main window closed.</p><a href="https://github.com/samuel-zhang01/UltraConvert#folder-rules" target="_blank" rel="noopener noreferrer">Read my rule guide</a><a href="https://github.com/samuel-zhang01/UltraConvert#formats" target="_blank" rel="noopener noreferrer">Formats and conversion limits</a></div></details>
  </section></ProjectCopy>;
}

export default UltraConvertStudio;
