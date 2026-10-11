"use client";

import Image from "next/image";
import { useState } from "react";
import { ProjectCopy, useProjectLocale } from "./ProjectTranslationBoundary";
import { projectText } from "@/lib/projectCopy";
import { mriCopy } from "./copy/mriCopy";
import styles from "./MriRecordedComparison.module.css";

// Exact visual bounds in the existing 2200×948 report figure; the source pixels
// are only displayed through CSS windows, never re-inferred or recoloured.
const PANELS = {
  4: { zero:448, reconstructed:889, zeroPsnr:27.0, reconstructedPsnr:29.6 },
  8: { zero:1331, reconstructed:1773, zeroPsnr:25.8, reconstructedPsnr:27.1 },
} as const;
const SOURCE = "/projects/mri/media/recorded-reconstruction.webp";
export function MriRecordedComparison() {
  const locale = useProjectLocale();
  const [acceleration, setAcceleration] = useState<4 | 8>(4);
  const [method, setMethod] = useState<"reconstructed" | "zero">("reconstructed");
  const [view, setView] = useState<"images" | "errors">("images");
  const [divider, setDivider] = useState(50);
  const panel = PANELS[acceleration];
  const psnr = method === "reconstructed" ? panel.reconstructedPsnr : panel.zeroPsnr;
  const tx = (source: string) => projectText(locale, mriCopy, source);
  function crop(x: number, y: number, label: string) {
    return <div className={styles.crop} role="img" aria-label={label}><Image unoptimized src={SOURCE} width={2200} height={948} alt="" draggable={false} style={{ left:`${-x / 420 * 100}%`, top:`${-y / 420 * 100}%` }} /></div>;
  }
  return <ProjectCopy copy={mriCopy}><section className={styles.viewer} aria-label="Explore my saved MRI reconstruction">
    <header className={styles.viewerHeading}><h3>Compare the heart structures I recovered</h3><p>Drag the divider across this saved slice. Then keep fewer measurements or inspect the error maps.</p></header>
    <div className={styles.controls}>
      <fieldset><legend>Measurements retained</legend><div>{([4,8] as const).map((value) => <button type="button" aria-pressed={acceleration === value} key={value} onClick={() => setAcceleration(value)}>{value}×<small>{value === 4 ? "About one in four lines" : "About one in eight lines"}</small></button>)}</div></fieldset>
      <fieldset><legend>Compare with the reference</legend><div><button type="button" aria-pressed={method === "reconstructed"} onClick={() => { setMethod("reconstructed"); setView("images"); }}>My reconstruction</button><button type="button" aria-pressed={method === "zero"} onClick={() => { setMethod("zero"); setView("images"); }}>Retained measurements only</button></div></fieldset>
    </div>
    <div className={styles.viewTabs} role="group" aria-label="Saved slice display"><button type="button" aria-pressed={view === "images"} onClick={() => setView("images")}>Image comparison</button><button type="button" aria-pressed={view === "errors"} onClick={() => setView("errors")}>Where the errors remain</button><span>{acceleration}× · {view === "errors" ? `${panel.zeroPsnr.toFixed(1)} → ${panel.reconstructedPsnr.toFixed(1)}` : psnr.toFixed(1)} dB <small>Image match score (PSNR)</small></span></div>
    {view === "images" ? <div className={styles.imageComparison}>
      <div className={styles.wipe} role="img" aria-label={projectText(locale,mriCopy,"Full reference on the left; {0} at {1}× on the right. Divider at {2}%.",{0:tx(method === "reconstructed" ? "my reconstruction" : "retained measurements only"),1:acceleration,2:divider})}>
        {crop(7,88,"Full-measurement cardiac MRI reference")}
        <div className={styles.resultLayer} style={{ clipPath:`inset(0 0 0 ${divider}%)` }}>{crop(panel[method],88,projectText(locale,mriCopy,"Saved {0} image at {1}×",{0:tx(method === "reconstructed" ? "reconstructed" : "zero-filled"),1:acceleration}))}</div>
        <span className={styles.dividerLine} style={{ left:`${divider}%` }} aria-hidden="true" />
        <div className={styles.imageLabels} aria-hidden="true"><span>Reference</span><span>{method === "reconstructed" ? "My reconstruction" : "Retained only"}</span></div>
      </div>
      <label className={styles.dividerControl}><span>Comparison divider</span><input aria-label="Comparison divider" type="range" min={0} max={100} value={divider} onChange={(event) => setDivider(Number(event.target.value))} /><strong>{divider}% / {100-divider}%</strong></label>
      <div className={styles.quickActions}><button type="button" onClick={() => setDivider(100)}>Show full reference</button><button type="button" onClick={() => setDivider(0)}>Show full result</button><button type="button" onClick={() => setDivider(50)}>Split the view</button></div>
    </div> : <div className={styles.errorComparison}>
      <figure>{crop(panel.zero,518,projectText(locale,mriCopy,"Saved zero-filled absolute error at {0}×",{0:acceleration}))}<figcaption>Retained measurements only</figcaption></figure>
      <figure>{crop(panel.reconstructed,518,projectText(locale,mriCopy,"Saved reconstruction absolute error at {0}×",{0:acceleration}))}<figcaption>My reconstruction</figcaption></figure>
      <p className={styles.errorLegend}><i aria-hidden="true" /><span>Same error scale: 0 to 0.15 image-intensity units. Brighter means a larger difference from the reference.</span></p>
    </div>}
    <p className={styles.outcome} aria-live="polite">{view === "errors" ? "Both maps use the same colour scale. Look for remaining errors at tissue boundaries." : method === "zero" ? "Keeping fewer measurements introduces visible aliasing. The model tries to recover the missing structure." : acceleration === 4 ? "At 4×, this reconstruction improves the pictured slice from 27.0 to 29.6 dB. Compare the heart boundaries with the reference." : "At 8×, this reconstruction reaches 27.1 dB on the pictured slice, below its 4× result. A plausible image can still lose detail."}</p>
    <p className={styles.sourceNote}>These are cropped views of my saved report figure. The displayed PSNR belongs to this example; the reconstruction tab shows separate 236-slice averages. Grayscale panels use their original display scaling.</p>
  </section></ProjectCopy>;
}
