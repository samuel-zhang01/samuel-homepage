"use client";

import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import type { Locale } from "@/lib/i18n";
import { projectText } from "@/lib/projectCopy";
import { cyberCohort, confoundingCohort, shrinkCoefficient } from "@/lib/decisionExperiments";
import { shiftedCoverage } from "@/lib/learningMechanics";
import { projectConceptScience } from "@/data/projectConceptScience";
import { ProjectCopy } from "./ProjectTranslationBoundary";
import { projectConceptScienceCopy as copy } from "./copy/projectConceptScienceCopy";
import styles from "./ProjectConceptScience.module.css";

/** Four source-informed snapshots. The shared player owns every clock and control. */
export function ProjectConceptScience({ slug, step, locale }: { slug: string; step: number; locale: Locale }) {
  const concept = projectConceptScience[slug];
  if (!concept) return null;
  const current = Math.max(0, Math.min(3, Number.isFinite(step) ? Math.floor(step) : 0));
  const tx = (source: string) => projectText(locale, copy, source);
  const stat = (label: string, value: ReactNode, tone?: string) => <div className={styles.stat} data-tone={tone}><span>{label}</span><strong>{value}</strong></div>;
  const meter = (label: string, value: number, maximum: number, shown: string, tone = "blue") => <div className={styles.meter}><span>{label}</span><div className={styles.track}><i data-tone={tone} style={{ width: `${Math.max(0, Math.min(100, Math.abs(value) / maximum * 100))}%` }} /></div><strong>{shown}</strong></div>;
  let scene: ReactNode;

  if (slug === "study-rl") {
    const safePath = [24, 16, 17, 18, 19, 20, 21, 22, 23, 31];
    scene = <>
      <div className={styles.gridWorld} aria-hidden="true">{Array.from({ length: 32 }, (_, index) => <div key={index} data-cliff={index > 24 && index < 31} data-path={current === 3 && safePath.includes(index)} data-agent={index === (current === 1 ? 25 : current === 3 ? 31 : 24)}>{index === 24 ? tx("Start") : index === 31 ? tx("Goal") : current === 1 && index === 25 ? "×" : current === 3 && safePath.includes(index) ? "·" : ""}</div>)}</div>
      <div className={styles.legend}><i data-tone="red" />Cliff<i data-tone="blue" />{current === 3 ? "Nine-move detour" : "Start"}</div>
      <div className={styles.stats}>{stat("Reward", current === 1 ? "−100" : current === 3 ? "−9" : "—", current === 1 ? "red" : undefined)}{stat("Learning rate", "0.1")}{stat("Action value", current >= 2 ? "−10" : "0")}</div>
      {current === 2 && <p className={styles.equation}><span translate="no">Q(S,→) = 0 + 0.1 × (−100 − 0) = −10</span></p>}
    </>;
  } else if (slug === "sequential-decisions-lab") {
    const observations = [[1, 0], current === 3 ? [1, 1, 0] : [1, 1], [0, 0]];
    const t = current === 3 ? 7 : 6;
    scene = <>
      <div className={styles.arms}>{observations.map((rewards, index) => {
        const mean = rewards.reduce((sum, reward) => sum + reward, 0) / rewards.length;
        const bonus = Math.sqrt(2 * Math.log(t) / rewards.length);
        const chosen = current === 3 ? index === 0 : current === 2 && index === 1;
        return <div key={index} data-selected={chosen} className={styles.arm}><strong translate="no">{["A", "B", "C"][index]}</strong><div className={styles.observations} aria-hidden="true">{rewards.map((reward, i) => <i key={i} data-hit={reward === 1}>{reward}</i>)}</div><span>Observed mean</span><b>{mean.toFixed(3)}</b><div className={styles.upperTrack} aria-hidden="true"><i style={{ width:`${mean / 2.5 * 100}%` }} /><i data-tone="amber" style={{ width:`${current === 0 ? 0 : bonus / 2.5 * 100}%` }} /></div><span>{"Upper bound"}</span><b>{current === 0 ? "—" : (mean + bonus).toFixed(3)}</b></div>;
      })}</div>
      <div className={styles.legend}><i data-tone="blue" />Observed mean<i data-tone="amber" />Exploration bonus</div>
      {current >= 2 && <p className={styles.result}>{current === 3 ? "Next choice" : "Chosen option"}<strong translate="no">{current === 3 ? "A" : "B"}</strong></p>}
    </>;
  } else if (slug === "microrobot-vision") {
    const original = "/projects/microrobot/media/pose-sample-2-original.webp";
    const response = current >= 2 ? "/projects/microrobot/media/depth-sample-2-heatmap.webp" : "/projects/microrobot/media/pose-sample-2-heatmap.webp";
    scene = <>
      <div className={styles.imagePair}><figure><Image unoptimized src={original} width={214} height={213} alt={tx("Shared microscope image")} /><figcaption>Shared microscope image</figcaption></figure><figure><div className={styles.overlay}><Image unoptimized src={original} width={214} height={213} alt="" /><Image unoptimized src={response} width={214} height={213} alt={current === 0 ? "" : tx(current >= 2 ? "Depth response" : "Pose response")} style={{ opacity: current === 0 ? 0 : .72 }} /></div><figcaption>{current === 0 ? "Response hidden" : current >= 2 ? "Depth response" : "Pose response"}</figcaption></figure></div>
      {current === 3 ? <div className={styles.modelSize}>{meter("ResNet34",21.4,21.4,"21.4M","ink")}{meter("MobileNetV3",1.5,21.4,"1.5M","blue")}<div className={styles.stats}>{stat("Relative model size","7.0%")}{stat("Depth error change","RMSE +0.0069")}</div></div> : <div className={styles.stats}>{stat(current === 2 ? "Recorded depth target" : "Labelled orientation",current === 2 ? "0.36" : "60° / 0°")}{stat("Label / prediction",current === 0 ? "—" : current === 1 ? "27 / 27" : "—")}</div>}
    </>;
  } else if (slug === "trustworthy-mri-reconstruction") {
    const crop = (x: number, y: number, label: string) => <figure><div className={styles.mriCrop}><Image unoptimized src="/projects/mri/media/recorded-reconstruction.webp" width={2200} height={948} alt={tx(label)} style={{ left:`${-x / 420 * 100}%`,top:`${-y / 420 * 100}%` }} /></div><figcaption>{label}</figcaption></figure>;
    scene = <>
      <div className={styles.measurementLines} aria-hidden="true">{Array.from({ length:16 },(_,i)=><i key={i} data-retained={current === 0 || i % 4 === 0} />)}</div>
      <div className={styles.imagePair}>{crop(current === 3 ? 448 : 7,current === 3 ? 518 : 88,current === 3 ? "Input error" : "Reference image")}{crop(current === 0 ? 7 : current === 1 ? 448 : 889,current === 3 ? 518 : 88,current === 3 ? "Reconstruction error" : current === 1 ? "Retained measurements" : current === 0 ? "Reference image" : "Reconstruction")}</div>
      <div className={styles.stats}>{stat("Illustrated lines",current === 0 ? "16 / 16" : "4 / 16")}{stat(current === 3 ? "Shared error scale" : "Image match score",current === 0 ? "—" : current === 1 ? "27.0 dB" : current === 2 ? "29.6 dB" : "0–0.15")}</div>
    </>;
  } else if (slug === "neural-cfd-surrogates") {
    const frame = [0,6,12,19][current];
    scene = <>
      <div className={styles.flowFields}>{[0,frame].map((value,i)=><figure key={i}><Image unoptimized src={`/projects/neural-cfd/media/gnn-rollout/frame-${String(value).padStart(2,"0")}-velocity-y.webp`} width={543} height={172} alt={tx(i === 0 ? "First saved field" : "Current saved field")} /><figcaption><span>{i === 0 ? "First saved field" : "Current saved field"}</span><strong>{projectText(locale,copy,"Frame {0} / 20",{0:value+1})}</strong></figcaption></figure>)}</div>
      <div className={styles.savedFrames} aria-hidden="true">{Array.from({length:20},(_,i)=><i key={i} data-current={i===frame} data-reached={i<=frame}/>)}</div>
    </>;
  } else if (slug === "air-quality-sensor-optimisation") {
    const benzene = current !== 3;
    const co = current !== 1;
    const available = !benzene ? "No available prediction" : co ? "Balanced" : "Benzene only";
    scene = <>
      <div className={styles.sensorRack}>{[["Benzene input",benzene],["CO sensor",co]].map(([name,online])=><div className={styles.sensor} key={String(name)} data-online={online}><div className={styles.signalWave} aria-hidden="true">{[3,6,4,9,5,7,3,8,5,6,4,7].map((height,i)=><i key={i} style={{height:`${online ? height*3 : 2}px`}} />)}</div><strong>{String(name)}</strong><span><i data-tone={online ? "green" : "red"}/>{online ? "Online" : "Offline"}</span></div>)}</div>
      <p className={styles.result}><span>Available design</span><strong>{available}</strong></p>
      <div className={styles.stats}>{stat("Validation RMSE",!benzene ? "—" : co ? "0.8286" : "0.9211")}{stat("Planning cost",!benzene ? "—" : co ? "£3,500" : "£2,500")}</div>
    </>;
  } else if (slug === "cost-sensitive-cyber-detection") {
    const threshold = [.2,.2,.8,.99][current];
    const attackPercent = current === 0 ? 50 : 1;
    const cohort = cyberCohort(threshold,attackPercent);
    const alerts = cohort.tp + cohort.fp;
    scene = <>
      <div className={styles.stats}>{stat("Attack share",`${attackPercent}%`)}{stat("Threshold",threshold.toFixed(2))}</div>
      <div className={styles.alertMatrix}>{[["Caught attacks",cohort.tp,"green"],["Missed attacks",cohort.fn,"red"],["False alarms",cohort.fp,"amber"],["Correct quiet flows",cohort.tn,"ink"]].map(([label,value,tone])=><div key={label} data-tone={tone}><span>{label}</span><strong>{value}</strong><div className={styles.track} aria-hidden="true"><i data-tone={tone} style={{width:`${Math.max(1,Number(value)/2000*100)}%`}} /></div></div>)}</div>
      <div className={styles.stats}>{stat("Alerts to review",alerts)}{stat("Real attacks among alerts",`${(100*cohort.tp/alerts).toFixed(1)}%`)}</div>
    </>;
  } else if (slug === "regularisation-lab") {
    const beta = [1.28,-.78,.46,-.19];
    const method = current === 1 ? "ridge" : "lasso";
    const lambda = current === 0 ? 0 : .45;
    const coefficients = beta.map(value=>shrinkCoefficient(value,lambda,method));
    const noise = current === 3 ? 3 : 0;
    const prediction = coefficients[0] + noise*coefficients[3];
    scene = <>
      <div className={styles.coefficients}>{["Traffic proxy","Temperature","Humidity","Noise feature"].map((label,i)=><div key={label}><span>{label}</span><div className={styles.coefficientTrack} aria-hidden="true"><i style={{left:coefficients[i]<0?`${50-Math.abs(coefficients[i])/1.4*45}%`:"50%",width:`${Math.abs(coefficients[i])/1.4*45}%`}} data-tone={coefficients[i]<0?"amber":"blue"}/></div><strong>{coefficients[i].toFixed(3)}</strong></div>)}</div>
      <div className={styles.stats}>{stat("Noise feature",noise)}{stat("Prediction",prediction.toFixed(3))}{stat("No penalty",(beta[0]+noise*beta[3]).toFixed(3))}</div>
      <p className={styles.equation}><span translate="no">{current === 0 ? "λ = 0" : `${method === "ridge" ? "Ridge" : "LASSO"} · λ = 0.45`}</span><span>Input × coefficient</span></p>
    </>;
  } else if (slug === "safety-critical-ai") {
    const shift = [0,.5,1,2][current];
    const result = shiftedCoverage(.9,shift);
    scene = <>
      <div className={styles.stats}>{stat("Fixed radius","±0.90")}{stat("Population shift",`+${shift.toFixed(2)}`)}{stat("Covered",`${result.covered} / 40`)}</div>
      <svg className={styles.residualPlot} viewBox="0 0 400 120" aria-hidden="true"><rect x="29" y="10" width="162" height="78" fill="#dce2ee"/><line x1="20" x2="380" y1="91" y2="91" stroke="#555"/>{[-1,0,1,2,3].map(tick=><text key={tick} x={20+(tick+1)*90} y="113" textAnchor="middle">{tick}</text>)}{result.rows.map((row,i)=><g key={i} className={styles.residual} style={{transform:`translate(${20+(row.residual+1)*90}px,${22+i%3*24}px)`}}>{row.covered?<circle r="4" fill="#11177a"/>:<path d="M-3,-3l6,6m0,-6l-6,6" stroke="#8c2637" strokeWidth="2"/>}</g>)}</svg>
      <div className={styles.legend}><i data-tone="blue"/>Covered<i data-tone="red"/>Outside</div><p className={styles.equation}>Residual = observed − predicted</p>
    </>;
  } else if (slug === "safe-learning-to-defer") {
    const reviewed = current < 2 ? 0 : current === 2 ? 20 : 30;
    const pending = 72-reviewed;
    scene = <>
      <div className={styles.gate}><span>High entropy</span><b>OR</b><span>Low confidence</span></div>
      <div className={styles.claims} aria-hidden="true">{Array.from({length:200},(_,i)=><i key={i} data-tone={current===0?"neutral":i<128?"blue":current===1?"amber":i<128+reviewed?"green":"neutral"}/>)}</div>
      <div className={styles.stats}>{current===0?stat("Awaiting routing",200):<>{stat("Automated",128,"blue")}{stat(current===1?"Needs review":"Reviewed",current===1?72:reviewed,current===1?"amber":"green")}{current>=2&&stat("Pending",pending)}</>}</div>
    </>;
  } else if (slug === "causal-ope-lab") {
    const cohort = confoundingCohort(35);
    scene = <>
      <strong>{current === 1 ? "Experience mix" : "Synthetic success rate"}</strong>
      {current === 1 ? <div className={styles.composition}>{[85,15].map((percent,i)=><div key={i}><strong>{i===0?"Treated":"Control"}</strong><div className={styles.upperTrack} aria-hidden="true"><i style={{width:`${percent}%`}}/><i data-tone="amber" style={{width:`${100-percent}%`}}/></div><span>Less experienced</span><b>{percent}%</b></div>)}<div className={styles.legend}><i data-tone="blue"/>Less experienced<i data-tone="amber"/>More experienced</div></div> : current === 2 ? <div className={styles.withinGroups}>{cohort.groups.map(group=><div key={group.key}><strong>{group.key==="less"?"Less experienced":"More experienced"}</strong>{meter("Treated",group.treatedRate,1,`${group.treatedRate*100}%`)}{meter("Control",group.controlRate,1,`${group.controlRate*100}%`,"amber")}<b>+10</b></div>)}</div> : <div className={styles.groupBars}>{meter("Treated",current===3?.6:.39,1,current===3?"60%":"39%")}{meter("Control",current===3?.5:.71,1,current===3?"50%":"71%","amber")}</div>}
      <p className={styles.result}><span>{current>=2?"Adjusted difference":"Pooled difference"}</span><strong>{projectText(locale,copy,"{0} percentage points",{0:current>=2?"+10":"−32"})}</strong></p>
    </>;
  } else if (slug === "ai-venture-reasoning") {
    const cash = current === 0 ? 1200000 : current === 1 ? 1020000 : current === 2 ? 326000 : -18400;
    const cashAt = (month: number, stressed: boolean) => 1020000-(month>0?120000:0)-month*82000*(stressed?1.6:1);
    const path = (stressed: boolean) => Array.from({length:8},(_,m)=>`${22+m*48},${22+(1020000-cashAt(m,stressed))/1100000*108}`).join(" ");
    scene = <>
      <div className={styles.cashBar} aria-hidden="true"><i style={{width:`${current===0?100:85}%`}}/><i data-tone="amber" style={{width:current===0?"0%":"15%"}}/></div>
      <div className={styles.stats}>{stat("Cash available",new Intl.NumberFormat(locale,{style:"currency",currency:"GBP",maximumFractionDigits:0}).format(cash),cash<0?"red":undefined)}{stat("Protected reserve",current===0?"—":"£180,000")}</div>
      {current>=2&&<><svg className={styles.cashPlot} viewBox="0 0 380 150" aria-hidden="true"><line x1="22" x2="358" y1="122" y2="122" stroke="#999" strokeDasharray="3 3"/><polyline points={path(false)} fill="none" stroke="#11177a" strokeWidth="3"/>{current===3&&<polyline points={path(true)} fill="none" stroke="#8c2637" strokeWidth="3"/>}</svg><div className={styles.legend}><i data-tone="blue"/>Baseline plan{current===3&&<><i data-tone="red"/>Burn +60%</>}<span>Month seven</span></div></>}
    </>;
  } else if (slug === "insurance-lead-matching") {
    scene = <>
      <div className={styles.checkCards}>{[["Trading",true],["Lead history",current>=1],["Policy wording",current>=2]].map(([label,checked])=><div key={String(label)} data-complete={checked}><span>{label}</span><strong>{checked?"Checked":"Unassessed"}</strong><small aria-hidden="true">{checked?"✓":"—"}</small></div>)}</div>
      <div className={styles.authority}><span aria-hidden="true">{current===3?"☑":"□"}</span><span>{current===3?"Authority verified":"Authority unverified"}</span></div>
      <p className={styles.result} data-tone={current===3?"green":"amber"}><strong>{current===3?"Ready for broker review":"Review held"}</strong></p>
    </>;
  } else if (slug === "cv-keyword-automator") {
    scene = <>
      <div className={styles.documentPair}><div><strong>Job requirement</strong><div className={styles.words}>{["Python","SQL","Cloud"].map((word,i)=><span key={word} data-found={current>0&&i<2} data-gap={current>=2&&i===2}>{word}</span>)}</div></div><div><strong>Matching sentence</strong><p>Built Python and SQL pipelines.</p></div></div>
      {current>0&&<div className={styles.stats}>{stat("Matched terms","2 / 3")}{stat("Cloud",current>=2?"Unassessed":"—")}</div>}
      {current>=2&&<p className={styles.gap}>Cloud experience still needs a real example.</p>}
      {current===3&&<pre className={styles.keywordOutput}>{'{"keywords": ["Python", "SQL"]}'}</pre>}
    </>;
  } else {
    const courses = ["Python programming","Machine learning","Algorithms","Web development","Marketing","Finance"];
    const order = current === 2 ? [2,1] : [1,2];
    scene = <>
      <div className={styles.courseRows}>{(current<2?courses.map((name,index)=>({name,index})):order.map(index=>({name:courses[index],index}))).map(({name,index},i)=><div key={name} data-excluded={current===1&&index!==1&&index!==2}><span className={styles.rank}>{current<2?index+1:i+1}</span><strong>{name}</strong><span>{current===0?"—":current===1?(index===1||index===2?"✓":"×"):current===2?"?":index===1?"99.8":"91.9"}</span></div>)}</div>
      <p className={styles.result}><span>{current===0?"Mock courses":current===1?"Eligible courses":current===2?"Random source order":"Declared weighted score"}</span><strong>{current===0?6:current===1?2:""}</strong></p>
      {current===3&&<p className={styles.weights}>Category 35 · level 25 · time 15 · budget 15 · rating 10</p>}
    </>;
  }
  return <ProjectCopy copy={copy} locale={locale}><div className={styles.scene} role="group" aria-label={concept.title} data-slug={slug} data-step={current} style={{"--concept-step":current} as CSSProperties}>{scene}</div></ProjectCopy>;
}
