"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { projectText } from "@/lib/projectCopy";
import { ProjectCopy } from "./ProjectTranslationBoundary";
import { productPreviewMotionCopy as copy } from "./copy/productPreviewMotionCopy";
import styles from "./ProductPreviewMotion.module.css";

const steps = ["Inspect", "Rebuild", "Verify", "New copy"] as const;
const explanations = ["The picture is readable. Its MP4 index is broken.", "Rebuild the container around the existing picture and sound.", "Decode the new copy and check its streams and timing.", "Publish the checked copy. Keep the original."];

export function ProductPreviewMotion({ locale }: { locale: Locale }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const t = (source: string) => projectText(locale, copy, source);
  useEffect(() => {
    if (!playing) return;
    if (step === 3) { setPlaying(false); return; }
    const timer = window.setTimeout(() => setStep(previous => Math.min(3, previous + 1)), 1100);
    return () => window.clearTimeout(timer);
  }, [playing, step]);
  return <ProjectCopy copy={copy} locale={locale}><section className={styles.preview} aria-label={t("A repair, from start to finish")}>
    <h2>{t("A repair, from start to finish")}</h2>
    <div className={styles.steps} role="group" aria-label={t("Next step")}>{steps.map((label, index) => <button type="button" key={label} aria-pressed={step === index} onClick={() => { setPlaying(false); setStep(index); }}><span>{index + 1}</span>{t(label)}</button>)}</div>
    <div className={styles.files} data-step={step}>
      <div><strong>{t("Original")}</strong><code>Example.mp4</code><div className={styles.film} aria-hidden="true">{Array.from({ length: 12 }, (_, index) => <i key={index} data-index={index === 0 ? "broken" : "picture"} />)}</div></div>
      <span className={styles.arrow} aria-hidden="true">→</span>
      <div className={styles.output} key={step}><strong>{t("Recovered copy")}</strong><code>{step === 0 ? "…" : "Example.mkv"}</code><div className={styles.film} aria-hidden="true">{Array.from({ length: 12 }, (_, index) => <i key={index} data-index={step === 0 ? "waiting" : step > 1 ? "checked" : "picture"} />)}</div></div>
    </div>
    <p role="status" aria-live="polite">{t(explanations[step])}</p>
    <div className={styles.controls}><button className="s7-button" type="button" onClick={() => { if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setStep(3); setPlaying(false); return; } if (step === 3) setStep(0); setPlaying(previous => !previous); }}>{t(playing ? "Pause" : "Play the workflow")}</button><button className="s7-button" type="button" disabled={step === 3} onClick={() => { setPlaying(false); setStep(previous => Math.min(3, previous + 1)); }}>{t("Next step")}</button><button className="s7-button" type="button" onClick={() => { setPlaying(false); setStep(0); }}>{t("Start again")}</button></div>
    <small>{t("Illustrated example · missing recording data cannot be recreated.")}</small>
  </section></ProjectCopy>;
}
