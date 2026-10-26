"use client";

import type { ReactNode } from "react";
import type { Locale } from "@/lib/i18n";
import { projectText } from "@/lib/projectCopy";
import { productConceptNumbers, projectConceptProducts } from "@/data/projectConceptProducts";
import { ProjectCopy } from "./ProjectTranslationBoundary";
import { projectConceptProductsCopy as copy } from "./copy/projectConceptProductsCopy";
import styles from "./ProjectConceptProducts.module.css";

type Point = readonly [number, number];

function line(points: readonly Point[], bounds: readonly [number, number, number, number]) {
  const [xmin, xmax, ymin, ymax] = bounds;
  return points.map(([x, y], i) => `${i ? "L" : "M"}${(22 + (x - xmin) / (xmax - xmin) * 356).toFixed(2)},${(145 - (y - ymin) / (ymax - ymin) * 125).toFixed(2)}`).join(" ");
}

function curve(points: readonly Point[], bounds: readonly [number, number, number, number], reference?: readonly Point[], marker?: Point) {
  const [xmin, xmax, ymin, ymax] = bounds;
  return <svg className={styles.plot} viewBox="0 0 400 168" aria-hidden="true">
    {[.25, .5, .75].map(value => <path key={value} d={`M22 ${145 - value * 125}H378`} className={styles.gridLine} />)}
    <path d="M22 16V145H378" className={styles.axis} />
    {reference ? <path d={line(reference, bounds)} className={styles.reference} /> : null}
    <path d={line(points, bounds)} className={styles.trace} />
    {marker ? <circle cx={22 + (marker[0] - xmin) / (xmax - xmin) * 356} cy={145 - (marker[1] - ymin) / (ymax - ymin) * 125} r="5" className={styles.marker} /> : null}
  </svg>;
}

function contrast(foreground: string, background: string) {
  const luminance = (hex: string) => {
    const rgb = [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16) / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
    return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
  };
  const a = luminance(foreground), b = luminance(background);
  return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
}

function renderScene(slug: string, step: number, locale: Locale): ReactNode {
  const t = (value: string) => projectText(locale, copy, value);
  const pair = (label: string, value: ReactNode, active = false) => <div className={`${styles.pair} ${active ? styles.active : ""}`}><span>{t(label)}</span><strong>{value}</strong></div>;
  const status = (value: string, tone: "normal" | "good" | "wait" = "normal") => <span className={styles.status} data-tone={tone}>{t(value)}</span>;
  const field = (label: string, value: ReactNode) => <div className={styles.field}><span>{t(label)}</span><div>{value}</div></div>;
  const heading = (value: string) => <h3 className={styles.heading}>{t(value)}</h3>;
  const strip = (values: readonly string[], selected: number) => <div className={styles.strip}>{values.map((value, index) => <span key={value} data-selected={index === selected}>{t(value)}</span>)}</div>;
  const paper = (content: ReactNode) => <div className={styles.paper}>{content}</div>;

  if (slug === "ultra-convert") return <>
    {heading("A watched folder, a predictable result")}
    <div className={styles.columns}>
      {paper(<><small>{t("Incoming file")}</small><code>Portrait.png</code>{status(step < 2 ? "Waiting for stability" : "Stable file", step < 2 ? "wait" : "good")}<div className={styles.fileProgress}><i style={{ width: `${[20, 60, 100, 100][step]}%` }} /></div><small>{t("Original stays")}</small></>)}
      {paper(<><small>{t("Rule order")}</small><ol className={styles.ruleList}><li data-selected={step > 0}><b>1</b><span>PNG → WebP</span></li><li><b>2</b><span>{t("Other images")}</span></li></ol></>)}
    </div>
    <div className={styles.output}>{pair("Destination", <code>{step === 3 ? "Converted/Portrait.webp" : "Converted/"}</code>, step === 3)}{status(step === 3 ? "New copy ready" : "No output yet", step === 3 ? "good" : "wait")}</div>
  </>;

  if (slug === "videomate") return <>
    {heading("Picture retained, container rebuilt")}
    <div className={styles.columns}>
      {paper(<><small>{t("Original")}</small><code>Example.mp4</code><div className={styles.stream}><i className={styles.broken} />{Array.from({length:9},(_,index)=><i key={index} />)}</div>{status("Broken index", "wait")}</>)}
      {paper(<><small>{t("Candidate copy")}</small><code>{step === 0 ? "…" : "Example.mkv"}</code><div className={styles.stream}>{Array.from({length:10},(_,index)=><i key={index} data-checked={step > 1} data-pending={step === 0} />)}</div>{status(step < 2 ? "Not verified" : "Checks passed",step < 2 ? "wait" : "good")}</>)}
    </div>
    <div className={styles.checks}>{["Decode", "Streams", "Timing"].map(label=><span key={label}><b>{step > 1 ? "✓" : "·"}</b>{t(label)}</span>)}</div>
    {pair("New collection", step === 3 ? t("1 checked copy") : t("0 copies"), step === 3)}
  </>;

  if (slug === "orbital-lab") {
    const radial: Point[] = Array.from({length:61},(_,i)=>{const radius=i/12;return[radius,4*radius**2*Math.exp(-2*radius)];});
    const radius = Math.max(1, step);
    const probability = 1 - Math.exp(-2*radius) * (1+2*radius+2*radius**2);
    return <>{heading("Hydrogen-like 1s orbital")}{strip(["Radial probability", "3D density", "Phase"],0)}
      {paper(<><div className={styles.plotCaption}><b>{t("Radial probability")}</b><span>{t("Radius in Bohr units")}</span></div>{curve(radial,[0,5,0,.6],undefined,[radius,4*radius**2*Math.exp(-2*radius)])}<div className={styles.axisLabels}><span>0</span><span>1</span><span>3</span><span>5 a₀</span></div></>)}
      <div className={styles.metrics}>{pair("Region", <span>r ≤ {radius} a₀</span>)}{pair("Probability inside", `${(probability*100).toFixed(1)}%`,true)}</div>
    </>;
  }

  if (slug === "desk-note-pad") return <>
    {strip(["Page 1", "Page 2", "8 pages"],step === 2 ? 1 : 0)}
    <div className={styles.notebook}><small>{t(step === 2 ? "Page 2" : "Page 1")}</small>{step !== 2 && step > 0 ? <code>11 Oct 2026</code> : null}<p>{t(step === 2 ? "Try the new idea." : "Bring the notebook to the meeting.")}</p>{step === 0 ? <span className={styles.caret} aria-hidden="true" /> : null}</div>
    <div className={styles.output}>{status("Saved in this browser","good")}{step === 3 ? <code>note-1.txt</code> : <span>{t("Text export available")}</span>}</div>
  </>;

  if (slug === "desk-sketch-pad") return <>
    {strip(["Ink black", "System blue", "Undo", "PNG"],step)}
    <div className={styles.drawing}><svg viewBox="0 0 360 160" aria-hidden="true"><path d="M40 116L54 82L78 54L104 79L139 113L167 102L193 58L219 40L243 70L281 109L318 88" className={styles.drawInk}/>{step===1 ? <path d="M43 133L104 139L179 130L243 139L310 133" className={styles.drawBlue}/> : null}</svg></div>
    <div className={styles.output}>{pair("Strokes", step===1 ? 2 : 1)}{status(step===2 ? "Last stroke removed" : step===3 ? "PNG ready" : "Local drawing",step>1 ? "good" : "normal")}</div>
  </>;

  if (slug === "desk-quick-list") return <>
    {strip(["All", "Active", "Completed"],step===3 ? 1 : 0)}
    <ul className={styles.tasks}>{(step===3 ? [1,2] : [0,1,2]).map(index=><li key={index} data-complete={step>=2 && index===0}><span className={styles.checkbox}>{step>=2 && index===0 ? "✓" : ""}</span><span>{t(["Prepare the demo", "Review the notes", "Export a backup"][index])}</span><b className={styles.priority}>{step>0 && index===1 ? "!" : ""}</b></li>)}</ul>
    <div className={styles.output}>{pair("Remaining", step>=2 ? 2 : 3)}{status(step===3 ? "Unfinished tasks only" : "Tasks saved", "good")}</div>
  </>;

  if (slug === "desk-focus-clock") return <>
    {heading("Focus sprint")}
    <div className={styles.timer}><span>{t(step===1 ? "Paused" : step===3 ? "Complete" : "Focus")}</span><strong>{["25:00","12:30","12:30","00:00"][step]}</strong><div className={styles.fileProgress}><i style={{width:`${[0,50,50,100][step]}%`}}/></div></div>
    <div className={styles.metrics}>{pair("Daily tally",step===3 ? "1" : "0")}{pair("Deadline",t(step===1 ? "Paused" : step===3 ? "Reached" : "Set"))}</div>
  </>;

  if (slug === "desk-pocket-calendar") return <>
    {heading("October 2026")}
    <div className={styles.calendar}>{Array.from({length:21},(_,index)=>{const date=index+1;return <span key={date} data-selected={date===(step===2 ? 15 : 11)} data-note={date===11 && step>0}>{date}{date===11 && step>0 ? <i/> : null}</span>;})}</div>
    {field(step===2 ? "15 October" : "11 October",t(step===2 ? "No note for this date" : step===0 ? "Choose a date to write" : "Prepare the meeting notes."))}
  </>;

  if (slug === "desk-calculator") return <>
    <div className={styles.columns}>{paper(<><small>{t("Display")}</small><div className={styles.numberDisplay}>{step===0 ? "12.5 × 4" : step===2 ? "60" : "50"}</div><div className={styles.keys}>{["7","8","9","÷","4","5","6","×","1","2","3","−","0",".","=","+"].map(key=><span key={key}>{key}</span>)}</div></>)}{paper(<><small>{t("Paper tape")}</small><ol className={styles.tape}><li><code>12.5 × 4</code><b>{step===0 ? "…" : "50"}</b></li>{step===2 ? <li><code>50 + 10</code><b>60</b></li> : null}</ol><div className={styles.memory}>{t("Memory")} <b>{step>=2 ? "50" : "0"}</b></div></>)}</div>
    {status(step===3 ? "Result copied" : "Workings stay visible",step===3 ? "good" : "normal")}
  </>;

  if (slug === "desk-unit-converter") return <>
    {strip(["Temperature", "Data"],step>1 ? 1 : 0)}
    <div className={styles.conversion}>{field("From",<><strong>{step>1 ? "1,000" : step===1 ? "68" : "20"}</strong><code>{step>1 ? "kB" : step===1 ? "°F" : "°C"}</code></>)}<span className={styles.equal}> = </span>{field("To",<><strong>{step>1 ? "1" : step===1 ? "20" : "68"}</strong><code>{step>1 ? "MB" : step===1 ? "°C" : "°F"}</code></>)}</div>
    {paper(<code>{step>1 ? "1 MB = 1,000 kB" : "°F = °C × 9/5 + 32"}</code>)}
    {status(step===3 ? "Result copied" : "Same quantity, different units",step===3 ? "good" : "normal")}
  </>;

  if (slug === "desk-colour-studio") {
    const foreground=step===0 ? "#999999" : "#11177a", background="#ffffff";
    return <>{heading("Foreground / background")}
      <div className={styles.colourSample} style={{color:foreground,background}}><strong>{t("Readable words")}</strong><small>{t("One colour pair")}</small></div>
      <div className={styles.metrics}>{pair("Foreground",<code>{foreground.toUpperCase()}</code>)}{pair("Contrast ratio",`${contrast(foreground,background).toFixed(2)}:1`,true)}</div>
      <div className={styles.output}><div className={styles.swatches}><i style={{background:foreground}}/><i style={{background}}/>{step===3 ? <i style={{background:foreground}} data-saved="true"/> : null}</div>{status(step===0 ? "Below 4.5:1" : step===3 ? "Swatch saved" : "Above 4.5:1",step===0 ? "wait" : "good")}</div>
    </>;
  }

  if (slug === "coverd-ai") return <>
    {heading("Application review")}
    {paper(<><small>{t("Applicant statement")}</small><p>{t(step<2 ? "I built a reporting dashboard." : "I maintained the dashboard after release.")}</p></>)}
    <div className={styles.dimensions}>{["Skills","Experience","Domain","Trajectory","Communication","Culture"].map((label,index)=><div key={label} data-selected={step>0 && (index<2 || step>1 && index===3)}><span>{t(label)}</span><b>{step>0 && (index<2 || step>1 && index===3) ? "✓" : "·"}</b></div>)}</div>
    <div className={styles.output}>{status(step<2 ? "Follow-up available" : "Additional context")}{pair("Final decision",t("Recruiter review"),step===3)}</div>
  </>;

  if (slug === "growmat") {
    const loads=step<2 ? [3.5,1] : [2,2.5];
    return <>{heading("Workload / available capacity")}
      <div className={styles.capacityChart}>{loads.map((load,index)=><div key={index}><div className={styles.capacityColumn}><span className={styles.capacityLimit}/><i style={{height:`${load/4*100}%`}} data-over={load>3}/></div><b>{t(index===0 ? "Monday" : "Tuesday")}</b><small>{(load/3*100).toFixed(0)}%</small></div>)}</div>
      <div className={styles.legend}><span><i/>{t("Workload")}</span><span><i className={styles.dashed}/>{t("Capacity: 3 FTE/day")}</span></div>
      {paper(<div className={styles.jobRow}><b>{t("Example job A")}</b><span>1.5 FTE/day</span><span className={step>0 ? styles.active : ""}>{t(step>0 ? "Tuesday" : "Monday")}</span></div>)}
      {status(step===1 ? "Schedule changed; recalculation pending" : step<2 ? "Monday exceeds capacity" : "Workload recalculated",step>1 ? "good" : "wait")}
    </>;
  }

  if (slug === "ocean-depths-finance") return <>
    {heading("One financial picture")}
    <div className={styles.metrics}>{pair("Bank cash",step>0 ? "£2,200" : "£2,400")}{pair("Investments","£4,600")}{pair("Credit debt",step>0 ? "−£200" : "−£400")}{pair("Net worth","£6,600",true)}</div>
    {paper(step===0 ? <p>{t("Cash + investments − debt")}</p> : step===1 ? <div className={styles.payment}><span>{t("Bank")}<b>−£200</b></span><span>→</span><span>{t("Credit card")}<b>+£200</b></span></div> : step===2 ? <div className={styles.payment}><span>{t("Monthly charge")}<b>£20 → £24</b></span>{status("Price change: +20%","wait")}</div> : <div className={styles.payment}><code>statement.csv</code>{status("Repeated rows skipped","good")}</div>)}
    {status(step===0 ? "Accounts included once" : "Net worth unchanged","good")}
  </>;

  if (slug === "coverd-yasa") return <>
    {heading("Choose an available time")}
    <div className={styles.appointmentGrid}>{["09:00","09:15","10:15"].map((time,index)=><div key={time} data-unavailable={index===0 || index===1 && step===3} data-selected={index===1 && step>0}><b>{time}</b><span>{t(index===0 ? "Occupied" : index===1 && step>0 ? step===3 ? "Confirmed" : "Selected" : "Available")}</span></div>)}</div>
    {paper(<div className={styles.booking}>{field("Meeting",t("15-minute meeting"))}{field("Host","Riley")}{field("Guest time",<span>09:15 · Europe/London</span>)}</div>)}
    {status(step===0 ? "Available slots only" : step===1 ? "Booking details ready" : step===2 ? "Conflict check passed" : "Calendar invitation ready",step>1 ? "good" : "normal")}
  </>;

  if (slug === "parliamo-italian-learning") return <>
    {strip(["Notice","Check","Produce","Revisit"],step)}
    <div className={styles.flashcard}><small>{t("Italian")}</small><strong lang="it" translate="no">{step===0 ? "Noi abbiamo lavorato ieri." : step===1 ? "Noi ___ lavorato ieri." : step===2 ? "Ieri ho…" : "Loro ___ lavorato ieri."}</strong><p>{t(step===2 ? "Write one completed event from your day." : step===1 ? "Use a hint, then try the auxiliary." : "Think of the subject and time.")}</p></div>
    <div className={styles.metrics}>{pair("Next review",t(step===3 ? "Next day after support" : "After an answer"),step===3)}{pair("First attempt",t("Kept after corrections"))}</div>
  </>;

  if (slug === "innovation-models-reflection") {
    const selected=[0,2,3,1][step];
    return <>{heading("Responsibility × resource authority")}
      <div className={styles.innovation}>{["Opportunist","Advocate","Enabler","Producer"].map((name,index)=><div key={name} data-selected={index===selected}><b>{t(name)}</b><small>{t(index%2 ? "Focused owner" : "Shared responsibility")}</small><small>{t(index<2 ? "Negotiated resources" : "Dedicated budget")}</small></div>)}</div>
      <div className={styles.metrics}>{pair("Responsibility",t(step>1 ? "Focused owner" : "Shared responsibility"))}{pair("Budget",t(step===1 || step===2 ? "Dedicated budget" : "Negotiated resources"))}</div>
    </>;
  }

  if (slug === "pc-saft-thermodynamics") {
    const record=productConceptNumbers.thermo[step],reference=productConceptNumbers.thermo[0];
    return <>{heading("Pressure versus molar density")}{paper(<><div className={styles.plotCaption}><b>330 K</b><span>kAB {record.k.toFixed(2)}</span></div>{curve(record.points,[100,1495,0,2.5],step>0 ? reference.points : undefined,[500,record.pressure])}<div className={styles.axisLabels}><span>100</span><span>{t("Density (mol/m³)")}</span><span>1,495</span></div><div className={styles.legend}><span><i/>{t("Current mixture")}</span><span><i className={styles.dashed}/>{t("Reference")}</span></div></>)}
      <div className={styles.metrics}>{pair("Pressure at 500 mol/m³",`${record.pressure.toFixed(3)} MPa`,true)}{pair("Interaction",`kAB = ${record.k.toFixed(2)}`)}</div>
    </>;
  }

  if (slug === "drug-solubility") {
    const rows=productConceptNumbers.solubility,record=rows[step];
    return <>{heading("Temperature versus dissolved amount")}{paper(<><div className={styles.plotCaption}><b>{record.temperature} K</b><span>{t("mg / g solvent")}</span></div>{curve(rows.map(v=>[v.temperature,v.mass]),[298,358,0,600],undefined,[record.temperature,record.mass])}<div className={styles.axisLabels}><span>298</span><span>{t("Temperature (K)")}</span><span>358</span></div></>)}
      <div className={styles.metrics}>{pair("Mole fraction",record.fraction.toFixed(5))}{pair("Dissolved amount",`${record.mass.toFixed(2)} mg/g`,true)}</div>
    </>;
  }

  if (slug === "molecular-recognition") {
    const predicted=[2158.41,2387.612,2744.828,3098.177,3521.744,3990.332],differences=[-42,16,53,-7,77,-31];
    return <>{heading("Candidate E-01 / generated spectrum")}
      <div className={styles.spectralRows}><div><small>{t("Predicted")}</small><svg viewBox="0 0 380 80" aria-hidden="true">{predicted.map((frequency,index)=><path key={index} d={`M${24+(frequency-2100)/2000*330} 68V${20+index%3*9}`} className={styles.trace}/>)}</svg></div><div><small>{t("Generated observed")}</small><svg viewBox="0 0 380 80" aria-hidden="true">{predicted.map((frequency,index)=><path key={index} d={`M${24+(frequency+differences[index]/1000-2100)/2000*330} 68V${18+index%3*10}`} className={step>1 ? styles.trace : styles.reference}/>)}<path d="M91 68V41M199 68V47" className={styles.reference}/></svg></div></div>
      <div className={styles.frequencyList}>{predicted.slice(0,3).map((frequency,index)=><div key={frequency}><code>{frequency.toFixed(3)} MHz</code><strong>{step>1 ? `${differences[index]>0 ? "+" : ""}${differences[index]} kHz` : t("Not matched yet")}</strong></div>)}</div>
      {status(step>1 ? "Several lines agree; background peaks remain" : "Compare a candidate fingerprint",step>1 ? "good" : "normal")}
    </>;
  }

  if (slug === "cprot-spectroscopy-plotter") {
    const minimum=step===0 ? 2000 : 4975, maximum=step===0 ? 8000 : 5375;
    const points: Point[]=Array.from({length:121},(_,i)=>{const x=minimum+i*(maximum-minimum)/120;const centres=[2380,3170,4180,5175,6350,7420],widths=[24,39,21,29,51,33],amplitudes=[.012,.020,.008,.043,.027,.017];return[x,.00028+centres.reduce((sum,c,index)=>sum+amplitudes[index]*Math.exp(-.5*((x-c)/widths[index])**2),0)];});
    return <>{heading("Frequency window")}
      {paper(<><div className={styles.plotCaption}><b>{t(step<2 ? "Spectrum" : "Rotational spectrum")}</b><span>{t("Intensity (a.u.)")}</span></div>{curve(points,[minimum,maximum,0,.05])}<div className={styles.axisLabels}><span>{minimum}</span><span>{t("Frequency (MHz)")}</span><span>{maximum}</span></div></>)}
      <div className={styles.metrics}>{pair("Centre","5,175 MHz")}{pair("Visible span",step===0 ? "6,000 MHz" : "400 MHz",true)}</div>
      {step===3 ? status("Figure export: 600 DPI","good") : status("Generated measurement trace")}
    </>;
  }

  if (slug === "deep-learning-environment-resolver") return <>
    {heading("Host → environment → runtime check")}
    <div className={styles.host}>{field("Example host",<code>macOS · arm64</code>)}{field("Environment",<code>Python 3.13 · Conda</code>)}</div>
    <ol className={styles.checklist}>{["Architecture route","Framework imports","PyTorch device check","TensorFlow device check"].map((label,index)=><li key={label} data-active={[0,2,3,3][index]<=step}><b>{[0,2,3,3][index]<=step ? "✓" : "·"}</b><span>{t(label)}</span><code>{[0,2,3,3][index]>step ? "…" : index===2 ? "MPS" : index===3 ? "CPU" : t("Checked")}</code></li>)}</ol>
    {status(step===3 ? "One CPU fallback remains visible" : "Checks pending",step===3 ? "wait" : "normal")}
  </>;

  if (slug === "gromacs-hpc") return <>
    {heading("Environment layers / preparation output")}
    <ol className={styles.layers}>{["Windows workstation","WSL 2 Linux","GPU-capable container","Prepared molecular topology"].map((label,index)=><li key={label} data-active={index<=step+1}><span>{String(index+1).padStart(2,"0")}</span><b>{t(label)}</b></li>)}</ol>
    {paper(<code>gmx pdb2gmx</code>)}{status(step===3 ? "Topology prepared; dynamics not run" : "Preparation route")}
  </>;

  if (slug === "home-automation-stack") return <>
    {heading("Keep the recovery point")}
    <div className={styles.columns}>{paper(<><small>{t("Last verified backup")}</small><code>database.previous.sql</code>{status("Retained", "good")}</>)}{paper(<><small>{t("New dump")}</small><code>database.pending.sql</code>{status(step===0 ? "Scheduled" : "Failed; not promoted",step===0 ? "normal" : "wait")}</>)}</div>
    <ol className={styles.checklist}>{["Read exit status","Preserve good backup","Restore to a separate target"].map((label,index)=><li key={label} data-active={step>index}><b>{step>index ? "✓" : "·"}</b><span>{t(label)}</span></li>)}</ol>
    {status(step===3 ? "Restore check completed in the example" : "Live services untouched",step===3 ? "good" : "normal")}
  </>;

  if (slug === "stock-market-engine") {
    const data=productConceptNumbers.market,count=[1,10,25,50][step],points=data.history.slice(0,count+1).map((p,i)=>[i,p] as const),event=data.events[step];
    return <>{heading("A seeded 50-event day")}{paper(<><div className={styles.plotCaption}><b>{t("Price (toy units)")}</b><span>{count}/50</span></div>{curve(points,[0,50,90,101])}<div className={styles.axisLabels}><span>0</span><span>{t("Trade events")}</span><span>50</span></div></>)}
      <div className={styles.metrics}>{pair("Last trade",<>{t(event.side.toLowerCase() === "buy" ? "Buy" : "Sell")} · {event.quantity}</>)}{pair("Price",data.history[count].toFixed(3),true)}</div>
      {step===3 ? <div className={styles.metrics}>{pair("Full-day return",`${data.fullReturn.toFixed(2)}%`)}{pair("Original partial window",`${data.partialReturn.toFixed(2)}%`)}</div> : <small>{t("Quantity × random impact × coefficient")}</small>}
    </>;
  }

  if (slug === "covid-decision-support") return <>
    {heading("Public information → planning context")}
    <ol className={styles.brief}>{["Public epidemiological information","Changes and planning questions","A concise planning brief","Human operational review"].map((label,index)=><li key={label} data-active={index<=step}><span>{index+1}</span><strong>{t(label)}</strong>{index<step ? <b>✓</b> : null}</li>)}</ol>
    {status("Public contribution only")}
  </>;

  if (slug === "coding-series") return <>
    {heading("One Metropolis decision")}
    <div className={styles.metrics}>{pair("Current energy","−1.0")}{pair("Proposed energy",step>0 ? "−0.8" : "…")}{pair("Temperature","0.4")}{pair("Acceptance probability",step>0 ? "0.607" : "…")}</div>
    {paper(<><code>p = exp(−0.2 / 0.4)</code>{step>1 ? <div className={styles.drawDecision}>{t("Random draw")} <b>0.700 &gt; 0.607</b>{status("Rejected", "wait")}</div> : null}</>)}
    {pair("Recorded chain", <code>{step===3 ? "−1.0, −1.0" : "−1.0"}</code>, step===3)}
  </>;

  return null;
}

export function ProjectConceptProducts({slug,step,locale}:{slug:string;step:number;locale:Locale}) {
  if (!projectConceptProducts[slug]) return null;
  const boundedStep=Number.isFinite(step) ? Math.max(0,Math.min(3,Math.trunc(step))) : 0;
  return <ProjectCopy copy={copy} locale={locale}><div className={styles.scene} data-product-concept={slug} data-step={boundedStep}>{renderScene(slug,boundedStep,locale)}</div></ProjectCopy>;
}
