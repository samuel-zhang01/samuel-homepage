"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import { projectText } from "@/lib/projectCopy";
import ClassicSelect from "../ClassicSelect";
import { System7Icon } from "../System7Icon";
import { ProjectCopy } from "./ProjectTranslationBoundary";
import { ultraConvertCopy } from "./copy/ultraConvertCopy";
import styles from "./UltraConvertStudio.module.css";

type Category = "image" | "audio" | "document";
type Scenario = "mixed" | "photos" | "sound";
type Sample = { stem: string; extension: string; category: Category; label: string };
const scenarios = [
  { id: "mixed", label: "A mixed selection", description: "A photo, a recording and a note need different output formats. I can review them in one batch instead of opening three separate converters." },
  { id: "photos", label: "Images for a website", description: "I can turn a collection of images into WebP for a website, while keeping the original images for editing." },
  { id: "sound", label: "Audio from a video", description: "I can extract a video's audio as MP3, then prepare it alongside a WAV recording in the same batch." },
] as const;
const samples: Record<Scenario, readonly Sample[]> = {
  mixed: [{ stem: "Photo", extension: "png", category: "image", label: "Image" }, { stem: "Recording", extension: "wav", category: "audio", label: "Audio" }, { stem: "Notes", extension: "md", category: "document", label: "Document" }],
  photos: [{ stem: "Photo", extension: "png", category: "image", label: "Image" }, { stem: "Poster", extension: "jpg", category: "image", label: "Image" }],
  sound: [{ stem: "Clip", extension: "mp4", category: "audio", label: "Video → audio" }, { stem: "Recording", extension: "wav", category: "audio", label: "Audio" }],
};
const formats = {
  image: [{ id: "webp", label: "WebP · web images", detail: "WebP is useful for web images. A lossy conversion changes pixels; the original stays available." }, { id: "png", label: "PNG · lossless image", detail: "PNG avoids lossy image compression. It can be larger than a web-oriented format." }, { id: "jpg", label: "JPEG · shared photos", detail: "JPEG is widely readable for photos, but uses lossy compression and cannot retain transparency." }],
  audio: [{ id: "mp3", label: "MP3 · compatible audio", detail: "MP3 is widely compatible compressed audio. It changes the sound representation and keeps the source recording." }, { id: "flac", label: "FLAC · lossless audio", detail: "FLAC is lossless audio compression. Converting a lossy source to FLAC does not restore detail that is already missing." }, { id: "opus", label: "Opus · compact audio", detail: "Opus is useful for compact audio, including speech. Check that the receiving app supports it." }],
  document: [{ id: "docx", label: "DOCX · editable document", detail: "DOCX makes the note editable in a word processor. Document conversion preserves structure rather than exact page layout." }, { id: "epub", label: "EPUB · reflowable ebook", detail: "EPUB turns the note into a reflowable ebook. Exact page layout is not preserved." }, { id: "html", label: "HTML · browser document", detail: "HTML makes the note readable in a browser. Supporting image resources are bundled with the result where needed." }],
} as const;

export function UltraConvertStudio({ locale = "en-GB" }: { locale?: Locale }) {
  const [scenario, setScenario] = useState<Scenario>("mixed");
  const [targets, setTargets] = useState<Record<Category, string>>({ image: "webp", audio: "mp3", document: "docx" });
  const [beside, setBeside] = useState(true);
  const [complete, setComplete] = useState(false);
  const t = (source: string) => projectText(locale, ultraConvertCopy, source);
  const selected = scenarios.find((item) => item.id === scenario)!;
  const files = samples[scenario];
  const categories = [...new Set(files.map((file) => file.category))];
  const outputName = (file: Sample) => `${file.stem}${beside && file.extension === targets[file.category] ? " (2)" : ""}.${targets[file.category]}`;

  return <ProjectCopy copy={ultraConvertCopy} locale={locale}><section className={`system7-project ${styles.studio}`} aria-label="UltraConvert product walkthrough">
    <header className={styles.intro}><span className={styles.productIcon}><System7Icon kind="ultraconvert" /></span><div><span className={styles.eyebrow}>UltraConvert · native Mac app</span><h2>Convert a mixed batch on my Mac.</h2><p>I built UltraConvert to bring everyday file conversion into one Mac app: choose files, review useful output formats, and decide exactly where the new copies go.</p></div></header>
    <div className={styles.productLinks}><a className="s7-button" href="https://github.com/samuel-zhang01/UltraConvert/releases/tag/v1.6.0" target="_blank" rel="noopener noreferrer">Download the Mac preview</a><a className="s7-button" href="https://github.com/samuel-zhang01/UltraConvert#install" target="_blank" rel="noopener noreferrer">Installation guide</a><a className="s7-button" href="https://github.com/samuel-zhang01/UltraConvert#readme" target="_blank" rel="noopener noreferrer">Read my user guide</a><span>v1.6.0 preview · Apple Silicon installer · conversion engines installed separately</span></div>

    <section className={styles.converter} aria-labelledby="uc-try-title"><div className={styles.sectionHead}><h3 id="uc-try-title">Try a conversion before installing</h3><p>Pick a task, choose the formats, then preview the new files.</p></div><div className={styles.scenarios} role="group" aria-label="Choose a conversion example">{scenarios.map((item) => <button type="button" className="s7-button" key={item.id} aria-pressed={scenario === item.id} onClick={() => { setScenario(item.id); setComplete(false); }}>{t(item.label)}</button>)}</div><p className={styles.scenarioDescription}>{t(selected.description)}</p>
      <div className={styles.actionBar}><button type="button" className="s7-button is-default" onClick={() => setComplete(true)}>Preview converted batch</button><span>{complete ? "Example results ready" : "Use the defaults or change formats and destination below"}</span></div>
      {complete && <section className={styles.result} aria-labelledby="uc-result-title" aria-live="polite"><h4 id="uc-result-title">My new copies</h4><p>{beside ? "Each result is saved beside its own original. Existing files are kept; a name collision gets a new name." : "All results go into one fresh batch folder in my chosen destination, with a result folder for each conversion. The original files stay where they are."}</p><ul>{files.map((file) => <li key={file.stem}><code>{outputName(file)}</code><span>{t(file.label)}</span></li>)}</ul></section>}
      <div className={styles.workspace}><section className={styles.queue} aria-labelledby="uc-input-title"><h4 id="uc-input-title">1. Add files</h4><div className={styles.fileList}>{files.map((file) => <div className={styles.file} key={file.stem}><span className={styles.fileIcon}><System7Icon kind="document" /></span><div><code>{file.stem}.{file.extension}</code><small>{t(file.label)}</small></div><span className={styles.arrow} aria-hidden="true">→</span><code>{targets[file.category].toUpperCase()}</code></div>)}</div><p className={styles.originalNote}>Manual conversion always keeps my originals.</p></section>
        <section className={styles.formats} aria-labelledby="uc-formats-title"><h4 id="uc-formats-title">2. Choose formats</h4>{categories.map((category) => { const format = formats[category].find((item) => item.id === targets[category])!; return <div className={styles.formatRow} key={category}><label htmlFor={`uc-format-${category}`}>{t(category === "image" ? "Images" : category === "audio" ? "Audio" : "Documents")}</label><ClassicSelect id={`uc-format-${category}`} value={targets[category]} onChange={(event) => { setTargets((previous) => ({ ...previous, [category]: event.target.value })); setComplete(false); }}>{formats[category].map((item) => <option key={item.id} value={item.id}>{t(item.label)}</option>)}</ClassicSelect><p>{t(format.detail)}</p></div>; })}</section></div>
      <fieldset className={styles.destination}><legend>3. Save to</legend><label><input type="radio" name="uc-destination" checked={beside} onChange={() => { setBeside(true); setComplete(false); }} />Beside source files</label><label><input type="radio" name="uc-destination" checked={!beside} onChange={() => { setBeside(false); setComplete(false); }} />One new batch folder</label></fieldset>
      <p className={styles.exampleNote}>These sample filenames illustrate the workflow. This browser preview does not convert files; the Mac app processes them locally.</p>
    </section>

    <details className={styles.details}><summary>Use it straight from Finder</summary><div className={styles.detailBody}><p>Select one file or a mixed batch, right-click, and choose Convert Here or Convert to Destination. My app opens the same review flow with the destination selected.</p><p>Format shortcuts such as WebP or MP3 also prepare a batch for review. I still choose compatible formats and click Convert before anything runs.</p><a href="https://github.com/samuel-zhang01/UltraConvert#enable-the-finder-actions" target="_blank" rel="noopener noreferrer">Enable Finder actions</a></div></details>
    <details className={styles.details}><summary>Let folder rules handle repeated work</summary><div className={styles.detailBody}><p>For a recurring task, I can watch a small inbox, match new files, convert or rename them, and save results to a chosen folder. Rules run while the app is open, including when its main window is closed.</p><ol className={styles.rule}><li><strong>When</strong> a stable new image arrives in my chosen inbox</li><li><strong>Then</strong> convert it to WebP</li><li><strong>Save</strong> the result to my chosen output folder</li><li><strong>After success</strong> keep the original by default</li></ol><p>I can test a rule without changing files, then explicitly enable it. Optional Archive or Trash actions require a deliberate choice.</p><a href="https://github.com/samuel-zhang01/UltraConvert#folder-rules-v150-preview" target="_blank" rel="noopener noreferrer">Read about folder rules</a></div></details>
    <details className={styles.details}><summary>Formats, setup and how it works</summary><div className={styles.detailBody}><p>My app supports images, audio, video, documents, ebooks, geospatial datasets and structured data. It recognises file contents where possible and offers compatible targets for each category.</p><p>The native interface is built with Swift and AppKit. A local Python coordinator runs the conversion tools. There is no account, upload service or telemetry.</p><p>The public v1.6.0 preview is signed and Apple-notarized. Install Homebrew, download the installer ZIP, keep its folder together, and run the installer described in my guide. The app alone does not include the conversion engines.</p><p>Format conversion involves tradeoffs: a document can change layout, lossy formats can change image or sound detail, and some metadata or extra media tracks may not be retained. My guide explains the limits.</p><a href="https://github.com/samuel-zhang01/UltraConvert#formats" target="_blank" rel="noopener noreferrer">Browse formats and preservation limits</a></div></details>
  </section></ProjectCopy>;
}

export default UltraConvertStudio;
