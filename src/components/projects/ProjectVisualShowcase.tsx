"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import type { Project } from "@/data/projects";
import type { Locale } from "@/lib/i18n";
import { getProjectText } from "@/lib/projectNarrative";
import { projectText } from "@/lib/projectCopy";
import { projectShowcaseImages } from "@/data/projectShowcaseImages";
import { projectConceptScience } from "@/data/projectConceptScience";
import { projectConceptProducts } from "@/data/projectConceptProducts";
import { projectShowcaseImagesCopy } from "./copy/projectShowcaseImagesCopy";
import { projectConceptScienceCopy } from "./copy/projectConceptScienceCopy";
import { projectConceptProductsCopy } from "./copy/projectConceptProductsCopy";
import { projectVisualShowcaseCopy as copy } from "./copy/projectVisualShowcaseCopy";
import { ProjectConceptScience } from "./ProjectConceptScience";
import { ProjectConceptProducts } from "./ProjectConceptProducts";
import { ProjectCopy } from "./ProjectTranslationBoundary";
import { useScientificExperimentClock } from "./useScientificExperimentClock";
import styles from "./ProjectVisualShowcase.module.css";

export default function ProjectVisualShowcase({ project, locale, active = true }: { project: Project; locale: Locale; active?: boolean }) {
  const images = [...(project.preview ? [project.preview, ...(project.preview.gallery ?? [])] : []), ...(projectShowcaseImages[project.slug] ?? [])].filter((image, index, all) => all.findIndex(candidate => candidate.src === image.src) === index);
  const science = projectConceptScience[project.slug as keyof typeof projectConceptScience];
  const product = projectConceptProducts[project.slug as keyof typeof projectConceptProducts];
  const concept = science ?? product;
  const conceptCopy = science ? projectConceptScienceCopy : projectConceptProductsCopy;
  const t = (source: string) => projectText(locale, copy, source);
  const describe = (source: string) => projectText(locale, conceptCopy, source);
  const imageText = (source: string) => source in projectShowcaseImagesCopy ? projectText(locale, projectShowcaseImagesCopy, source) : getProjectText(locale, source);
  const [view, setView] = useState<"images" | "concept">(images.length ? "images" : "concept");
  const [imageIndex, setImageIndex] = useState(0);
  const [inspect, setInspect] = useState(false);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [inView, setInView] = useState(false);
  const [reduceEffects, setReduceEffects] = useState(false);
  const [preferenceReady, setPreferenceReady] = useState(false);
  const root = useRef<HTMLElement>(null);
  const id = useId();
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const image = images[Math.min(imageIndex, Math.max(0, images.length - 1))];
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const observer = new IntersectionObserver(entries => setInView(entries.some(entry => entry.isIntersecting)), { threshold: 0.1 });
    observer.observe(element);
    const updatePreference = () => setReduceEffects(document.documentElement.dataset.reduceEffects === "true");
    updatePreference();
    setPreferenceReady(true);
    const preference = new MutationObserver(updatePreference);
    preference.observe(document.documentElement, { attributes: true, attributeFilter: ["data-reduce-effects"] });
    return () => { observer.disconnect(); preference.disconnect(); };
  }, []);
  const motionAllowed = useScientificExperimentClock(playing && active && inView && view === "concept" && step < 3 && !reduceEffects, () => setStep(previous => Math.min(3, previous + 1)), 1700);
  useEffect(() => { if (step === 3) setPlaying(false); }, [step]);
  const show = (next: "images" | "concept") => { setPlaying(false); setView(next); };
  const selectStep = (next: number) => { setPlaying(false); setStep(next); };
  const tabKey = (event: KeyboardEvent<HTMLButtonElement>, current: number) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? 1 : 1 - current;
    show(next === 0 ? "images" : "concept"); tabs.current[next]?.focus();
  };
  if (!images.length && !concept) return null;
  return <ProjectCopy copy={copy} locale={locale}><section ref={root} className={styles.showcase} aria-label={t("See the project")} data-reduced={reduceEffects || !motionAllowed}>
    {images.length > 0 && concept && <div className={styles.tabs} role="tablist" aria-label={t("Project views")}>
      {(["images", "concept"] as const).map((kind, index) => <button key={kind} ref={element => { tabs.current[index] = element; }} className="s7-button" role="tab" id={`${id}-${kind}-tab`} aria-controls={`${id}-${kind}`} aria-selected={view === kind} tabIndex={view === kind ? 0 : -1} onClick={() => show(kind)} onKeyDown={event => tabKey(event, index)}>{t(kind === "images" ? "Images & results" : "Core idea")}</button>)}
    </div>}
    {view === "images" && image && <div role={concept ? "tabpanel" : undefined} id={`${id}-images`} aria-labelledby={concept ? `${id}-images-tab` : undefined}>
      {images.length > 1 && <div className={styles.imageChoices} role="group" aria-label={t("Choose an image")}>{images.map((item, index) => <button type="button" key={item.src} className="s7-button" aria-pressed={imageIndex === index} onClick={() => { setImageIndex(index); setInspect(false); }}>{item.label ? imageText(item.label) : projectText(locale, copy, "Image {number}", { number: index + 1 })}</button>)}</div>}
      <figure className={styles.figure}>
        <div className={styles.imageStage} data-inspect={inspect} tabIndex={inspect ? 0 : undefined} role={inspect ? "region" : undefined} aria-label={inspect ? t("Scroll to inspect the original image.") : undefined}>
          <Image unoptimized src={image.src} alt={imageText(image.alt)} width={image.width ?? 543} height={image.height ?? 172} className={styles.image} sizes="(max-width: 720px) 90vw, 900px" />
        </div>
        <figcaption>{imageText(image.caption)}</figcaption>
        <div className={styles.imageActions}>
          <button type="button" className="s7-button" aria-pressed={inspect} onClick={() => setInspect(previous => !previous)}>{t(inspect ? "Fit image" : "Inspect at full size")}</button>
          <a className="s7-button" href={image.src} target="_blank" rel="noopener noreferrer">{t("Open full image")} ↗</a>
          {"source" in image && image.source && <a className="s7-button" href={image.source as string} target="_blank" rel="noopener noreferrer">{t("Read the original")} ↗</a>}
        </div>
      </figure>
    </div>}
    {view === "concept" && concept && <div role={images.length ? "tabpanel" : undefined} id={`${id}-concept`} aria-labelledby={images.length ? `${id}-concept-tab` : undefined} className={styles.concept}>
      <h2>{describe(concept.title)}</h2>
      <div className={styles.scene} data-step={step} data-playing={playing && motionAllowed && !reduceEffects}>
        {science ? <ProjectConceptScience slug={project.slug} step={step} locale={locale} /> : <ProjectConceptProducts slug={project.slug} step={step} locale={locale} />}
      </div>
      <div className={styles.steps} role="group" aria-label={t("Concept steps")}>{concept.steps.map((item, index) => <button type="button" key={item.name} className="s7-button" aria-pressed={step === index} onClick={() => selectStep(index)}><span aria-hidden="true">{index + 1}</span>{describe(item.name)}</button>)}</div>
      <p className={styles.caption} role="status" aria-live="polite">{describe(concept.steps[step].caption)}</p>
      <div className={styles.controls}>
        <button type="button" className="s7-button is-primary" disabled={!motionAllowed || reduceEffects} onClick={() => { if (step === 3) setStep(0); setPlaying(previous => !previous); }}>{t(playing ? "Pause" : "Play the idea")}</button>
        <button type="button" className="s7-button" disabled={step === 3} onClick={() => selectStep(Math.min(3, step + 1))}>{t("Next step")}</button>
        <button type="button" className="s7-button" onClick={() => selectStep(0)}>{t("Start again")}</button>
      </div>
      {preferenceReady && (!motionAllowed || reduceEffects) && <p className={styles.note}>{t("Motion is reduced. Choose a step to explore.")}</p>}
      {concept.note && <p className={styles.note}>{describe(concept.note)}</p>}
    </div>}
  </section></ProjectCopy>;
}
