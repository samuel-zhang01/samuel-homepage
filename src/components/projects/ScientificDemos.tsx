"use client";

import { useId, useState } from "react";

import { DemoWindow, MacButton } from "./DemoChrome";
import { ProjectTranslationBoundary } from "./ProjectTranslationBoundary";
import styles from "./ScientificDemos.module.css";

type TabOption<T extends string> = {
  id: T;
  label: string;
};

function TabStrip<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly TabOption<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className={styles.tabStrip} role="group" aria-label={label}>
      {options.map((option) => (
        <button
          type="button"
          aria-pressed={value === option.id}
          className={value === option.id ? styles.activeTab : ""}
          key={option.id}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function EvidenceNote({
  tone = "blue",
  icon,
  title,
  children,
}: {
  tone?: "blue" | "amber" | "green";
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  const toneClass = tone === "amber" ? styles.note_amber : tone === "green" ? styles.note_green : "";

  return (
    <aside className={`${styles.evidenceNote} ${toneClass}`} role="note">
      <span className={styles.noteIcon} aria-hidden="true">{icon}</span>
      <div>
        <strong>{title}</strong>
        <p>{children}</p>
      </div>
    </aside>
  );
}

type CfdModelId = "fno" | "gnn" | "unet";
type CfdField = "truth" | "prediction" | "error";
type CfdTopology = "grid" | "mesh";

const CFD_MODELS: Record<CfdModelId, {
  name: string;
  short: string;
  relativeL2: string;
  architecture: string;
  representation: string;
  parameters: string;
  evaluation: string;
  note: string;
}> = {
  fno: {
    name: "Fourier Neural Operator",
    short: "FNO",
    relativeL2: "0.0163",
    architecture: "Spectral operator",
    representation: "Structured grid",
    parameters: "3,990,575",
    evaluation: "Executed notebook test run",
    note: "Baseline width-36, three-block FNO; the current loose checkpoint is a different later architecture.",
  },
  gnn: {
    name: "MeshGraphNet",
    short: "GNN",
    relativeL2: "0.0165",
    architecture: "Message passing",
    representation: "Native mesh",
    parameters: "8,323",
    evaluation: "Executed 500-file test run",
    note: "Ten processor blocks completed within the supplied ML4Sci starter scaffold.",
  },
  unet: {
    name: "U-Net baseline",
    short: "U-NET",
    relativeL2: "1.2823",
    architecture: "Encoder–decoder",
    representation: "Rasterised grid",
    parameters: "50,542,531",
    evaluation: "Shifted 20-file validation run",
    note: "A deliberately different distribution-shift check; it is not ranked against the test runs.",
  },
};

const CFD_FIELD_TABS: readonly TabOption<CfdField>[] = [
  { id: "truth", label: "Ground truth" },
  { id: "prediction", label: "Prediction" },
  { id: "error", label: "Absolute error" },
];

const CFD_FRAMES = ["Snapshot 01", "Snapshot 02", "Snapshot 03"] as const;

function FlowField({
  field,
  model,
  topology,
  frame,
}: {
  field: CfdField;
  model: CfdModelId;
  topology: CfdTopology;
  frame: number;
}) {
  const id = useId().replace(/:/g, "");
  const fieldGradient = `${id}-field`;
  const wakeGradient = `${id}-wake`;
  const errorGradient = `${id}-error`;
  const overlayPattern = `${id}-${topology}`;
  const phase = frame * 5;
  const modelWarp = field === "truth" ? 0 : model === "unet" ? 13 : model === "gnn" ? 2 : 0;
  const isError = field === "error";
  const viewLabel = field === "truth" ? "ground-truth" : field;

  return (
    <svg
      className={`${styles.flowField} ${field === "error" ? styles.flow_error : ""} ${model === "unet" && field !== "truth" ? styles.flowModel_unet : ""}`}
      viewBox="0 0 560 270"
      role="img"
      aria-label={`${CFD_MODELS[model].name} ${viewLabel} flow-field illustration with ${topology} overlay`}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id={fieldGradient} x1="0" x2="1" y1="0" y2="0.8">
          <stop offset="0" stopColor={isError ? "#10133c" : "#122a7a"} />
          <stop offset="0.35" stopColor={isError ? "#282b68" : "#1c77aa"} />
          <stop offset="0.66" stopColor={isError ? "#151a4d" : "#e0c756"} />
          <stop offset="1" stopColor={isError ? "#0b0e2c" : "#c43a3d"} />
        </linearGradient>
        <radialGradient id={wakeGradient} cx="0.25" cy="0.5" r="0.78">
          <stop offset="0" stopColor={isError ? "#ffdf70" : "#f9f6d7"} stopOpacity={isError ? "0.9" : "0.96"} />
          <stop offset="0.27" stopColor={isError ? "#d65d4d" : "#4ac0c0"} stopOpacity="0.86" />
          <stop offset="0.72" stopColor={isError ? "#20245a" : "#18205b"} stopOpacity="0.38" />
          <stop offset="1" stopColor="#11153f" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={errorGradient} cx="0.42" cy="0.5" r="0.58">
          <stop offset="0" stopColor="#fff3a6" stopOpacity={model === "unet" ? "1" : "0.75"} />
          <stop offset="0.34" stopColor="#e64e46" stopOpacity={model === "unet" ? "0.94" : "0.48"} />
          <stop offset="1" stopColor="#5b2b72" stopOpacity="0" />
        </radialGradient>
        <pattern id={`${id}-grid`} width="22" height="22" patternUnits="userSpaceOnUse">
          <path d="M 22 0 L 0 0 0 22" fill="none" stroke="#fff" strokeOpacity="0.27" strokeWidth="0.75" />
        </pattern>
        <pattern id={`${id}-mesh`} width="28" height="24" patternUnits="userSpaceOnUse">
          <path d="M0 24 14 0 28 24ZM0 0 14 24 28 0" fill="none" stroke="#fff" strokeOpacity="0.29" strokeWidth="0.7" />
          <circle cx="14" cy="12" r="1" fill="#fff" fillOpacity="0.44" />
        </pattern>
      </defs>

      <rect width="560" height="270" fill={`url(#${fieldGradient})`} />
      {!isError && <ellipse cx={252 + phase} cy={137} rx="250" ry="116" fill={`url(#${wakeGradient})`} opacity="0.88" />}
      {isError && (
        <>
          <ellipse cx={240 + phase} cy={134} rx={model === "unet" ? 238 : 116} ry={model === "unet" ? 112 : 62} fill={`url(#${errorGradient})`} />
          <ellipse cx="402" cy={82 + modelWarp} rx={model === "unet" ? 112 : 34} ry={model === "unet" ? 58 : 22} fill={`url(#${errorGradient})`} opacity="0.72" />
        </>
      )}

      <g className={styles.streamLines} fill="none" strokeLinecap="round">
        <path d={`M-5 46 C130 42 151 ${52 + phase} 194 70 S302 ${18 + modelWarp} 570 49`} />
        <path d={`M-5 83 C119 82 151 ${78 + phase} 192 95 S323 ${64 + modelWarp} 570 82`} />
        <path d={`M-5 116 C119 116 135 ${102 + phase} 189 106 C268 112 288 ${167 - modelWarp} 570 119`} />
        <path d={`M-5 153 C121 153 139 ${176 - phase} 191 163 C266 145 302 ${101 + modelWarp} 570 151`} />
        <path d={`M-5 191 C127 194 152 ${218 - phase} 203 201 S346 ${235 - modelWarp} 570 190`} />
        <path d={`M-5 228 C148 229 175 ${246 - phase} 240 231 S401 ${205 + modelWarp} 570 225`} />
      </g>

      <g className={styles.vortices} fill="none">
        <path d={`M225 100 C278 ${61 + modelWarp} 329 80 310 119 C291 157 242 119 274 100 C310 79 369 107 349 143`} />
        <path d={`M225 174 C270 ${215 - modelWarp} 331 197 312 158 C296 126 251 150 274 171 C309 200 381 169 357 132`} />
      </g>

      <rect width="560" height="270" fill={`url(#${overlayPattern})`} />
      <g className={styles.cylinder}>
        <circle cx="194" cy="135" r="34" />
        <circle cx="194" cy="135" r="25" />
        <path d="M194 100 V170M159 135H229" />
      </g>
      <g className={styles.fieldScale} aria-hidden="true">
        <rect x="493" y="20" width="13" height="84" rx="1" />
        <text x="515" y="28">MAX</text>
        <text x="515" y="103">MIN</text>
      </g>
      <g className={styles.axisMark} aria-hidden="true">
        <path d="M30 236h44M30 236v-34" />
        <text x="77" y="240">x</text>
        <text x="25" y="197">y</text>
      </g>
    </svg>
  );
}

export function CfdSurrogateDemo() {
  const [model, setModel] = useState<CfdModelId>("fno");
  const [field, setField] = useState<CfdField>("prediction");
  const [topology, setTopology] = useState<CfdTopology>("grid");
  const [frame, setFrame] = useState(0);
  const activeModel = CFD_MODELS[model];

  return (
    <DemoWindow
      appName="FlowBench 7"
      title="CFD Surrogate Model Workbench"
      status="ILLUSTRATIVE RESULT VIEW"
      statusTone="safe"
      className={styles.scientificWindow}
      footer={
        <>
          <span>Recorded relative L2 · evaluation splits differ</span>
          <span>Display-only port · no browser inference</span>
        </>
      }
    >
      <EvidenceNote icon="≋" title="Fixed benchmark values — not a live solver">
        Controls switch a newly generated browser illustration anchored to saved evaluation numbers. No CFD solve, model download, or claim of real-time inference is made.
      </EvidenceNote>

      <EvidenceNote tone="amber" icon="!" title="These values are not one leaderboard">
        FNO and MeshGraphNet use their executed test runs; U-Net uses a separate 20-file shifted validation run. The values document three experiments, but their ordering is not a valid cross-model rank.
      </EvidenceNote>

      <div className={styles.cfdLayout}>
        <nav className={styles.modelRail} aria-label="Surrogate model">
          <div className={styles.railHeading}>
            <span>MODEL FAMILY</span>
            <strong>03 candidates</strong>
          </div>
          {(Object.entries(CFD_MODELS) as [CfdModelId, (typeof CFD_MODELS)[CfdModelId]][]).map(([id, item], index) => (
            <button
              type="button"
              className={`${styles.modelCard} ${model === id ? styles.modelCardActive : ""} ${id === "unet" ? styles.modelCardWarning : ""}`}
              aria-pressed={model === id}
              key={id}
              onClick={() => setModel(id)}
            >
              <span className={styles.modelIndex}>0{index + 1}</span>
              <span className={styles.modelCopy}>
                <strong>{item.short}</strong>
                <small>{item.name}</small>
              </span>
              <span className={styles.modelScore}>{item.relativeL2}</span>
            </button>
          ))}
        </nav>

        <section className={styles.fieldWorkspace} aria-live="polite">
          <div className={styles.workspaceToolbar}>
            <TabStrip label="Flow-field channel" options={CFD_FIELD_TABS} value={field} onChange={setField} />
            <div className={styles.topologyToggle} aria-label="Topology overlay">
              <button type="button" aria-pressed={topology === "grid"} className={topology === "grid" ? styles.toggleActive : ""} onClick={() => setTopology("grid")}>▦ Grid</button>
              <button type="button" aria-pressed={topology === "mesh"} className={topology === "mesh" ? styles.toggleActive : ""} onClick={() => setTopology("mesh")}>△ Mesh</button>
            </div>
          </div>

          <figure className={styles.fieldFigure}>
            <div className={styles.figureChrome}>
              <span>{activeModel.short} / {field.toUpperCase()}</span>
              <span>{CFD_FRAMES[frame]} · t+1</span>
            </div>
            <FlowField field={field} model={model} topology={topology} frame={frame} />
            <figcaption>
              <span>ILLUSTRATIVE FIELD VIEW</span>
              <p>Generated SVG recreates the comparison interface; benchmark numbers come from saved project evaluation.</p>
            </figcaption>
          </figure>

          <div className={styles.snapshotBar}>
            <div>
              <span>SAVED SEQUENCE</span>
              <strong>{CFD_FRAMES[frame]} of 03</strong>
            </div>
            <MacButton onClick={() => setFrame((current) => (current + 1) % CFD_FRAMES.length)}>
              Next snapshot →
            </MacButton>
          </div>
        </section>
      </div>

      <section className={styles.evidencePanel} aria-label={`${activeModel.name} evaluation summary`}>
        <div className={`${styles.heroMetric} ${model === "unet" ? styles.heroMetricWarning : ""}`}>
          <span>RECORDED RELATIVE L2</span>
          <strong>{activeModel.relativeL2}</strong>
          <small>{activeModel.evaluation}</small>
        </div>
        <dl className={styles.modelDetails}>
          <div><dt>Architecture</dt><dd>{activeModel.architecture}</dd></div>
          <div><dt>Representation</dt><dd>{activeModel.representation}</dd></div>
          <div><dt>Parameters</dt><dd>{activeModel.parameters}</dd></div>
          <div><dt>Readout</dt><dd>{activeModel.note}</dd></div>
        </dl>
        <div className={styles.rankStrip} aria-label="Recorded relative L2 values and their separate evaluation runs">
          {(Object.entries(CFD_MODELS) as [CfdModelId, (typeof CFD_MODELS)[CfdModelId]][]).map(([id, item]) => (
            <div className={model === id ? styles.rankActive : ""} key={id}>
              <span><b>{item.short}</b><em>{item.relativeL2}</em></span>
              <small>{item.evaluation}</small>
            </div>
          ))}
        </div>
      </section>
    </DemoWindow>
  );
}

type VisionModelId = "simple" | "resnet18" | "resnet34" | "mobile" | "vit";
type VisionBenchmark = "pose" | "depth";
type VisionView = "pose" | "depth" | "attention";

const VISION_MODELS: Record<VisionModelId, {
  name: string;
  poseAccuracy: string;
  depthRmse: string;
  parameters: string;
  pretraining: string;
}> = {
  simple: { name: "SimpleCNN + skips", poseAccuracy: "98.25%", depthRmse: "0.0478", parameters: "4.2M", pretraining: "From scratch" },
  resnet18: { name: "ResNet18", poseAccuracy: "97.50%", depthRmse: "0.0256", parameters: "11.2M", pretraining: "ImageNet" },
  resnet34: { name: "ResNet34", poseAccuracy: "98.50%", depthRmse: "0.0256", parameters: "21.3M", pretraining: "ImageNet" },
  mobile: { name: "MobileNetV3", poseAccuracy: "97.50%", depthRmse: "0.0325", parameters: "1.6M", pretraining: "ImageNet" },
  vit: { name: "ViT-B/16", poseAccuracy: "98.25%", depthRmse: "0.0265", parameters: "85.4M", pretraining: "ImageNet" },
};

const VISION_VIEW_TABS: readonly TabOption<VisionView>[] = [
  { id: "pose", label: "Pose" },
  { id: "depth", label: "Depth" },
  { id: "attention", label: "Grad-CAM style" },
];

const MICRO_FRAMES = [
  { id: "frame-a", label: "Frame A", pitch: "+15°", roll: "−30°", depth: "0.64", rotation: -17 },
  { id: "frame-b", label: "Frame B", pitch: "+30°", roll: "+15°", depth: "0.42", rotation: 9 },
  { id: "frame-c", label: "Frame C", pitch: "−15°", roll: "+30°", depth: "0.78", rotation: 24 },
] as const;

function MicrorobotScene({ view, frameIndex }: { view: VisionView; frameIndex: number }) {
  const id = useId().replace(/:/g, "");
  const frame = MICRO_FRAMES[frameIndex];
  const heat = `${id}-heat`;
  const glass = `${id}-glass`;
  const grain = `${id}-grain`;

  return (
    <svg
      className={styles.robotScene}
      viewBox="0 0 520 310"
      role="img"
      aria-label={`Sanitised illustrative microrobot ${view === "attention" ? "Grad-CAM-style attention" : view} view for ${frame.label}`}
    >
      <defs>
        <radialGradient id={glass} cx="48%" cy="47%" r="68%">
          <stop offset="0" stopColor="#f6f8e9" />
          <stop offset="0.55" stopColor="#b8c8c4" />
          <stop offset="1" stopColor="#47576d" />
        </radialGradient>
        <radialGradient id={heat} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fff57c" stopOpacity="0.96" />
          <stop offset="0.34" stopColor="#ef6c38" stopOpacity="0.88" />
          <stop offset="0.7" stopColor="#c52958" stopOpacity="0.48" />
          <stop offset="1" stopColor="#612982" stopOpacity="0" />
        </radialGradient>
        <pattern id={grain} width="13" height="13" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="3" r="0.7" fill="#0e1a25" opacity="0.16" />
          <circle cx="10" cy="8" r="0.55" fill="#fff" opacity="0.32" />
          <path d="M5 12h2" stroke="#17232c" strokeOpacity="0.12" />
        </pattern>
      </defs>

      <rect width="520" height="310" fill={`url(#${glass})`} />
      <rect width="520" height="310" fill={`url(#${grain})`} />
      <g className={styles.scopeRings} fill="none">
        <ellipse cx="258" cy="154" rx="178" ry="116" />
        <ellipse cx="258" cy="154" rx="152" ry="97" />
        <ellipse cx="258" cy="154" rx="126" ry="79" />
        {view === "depth" && <ellipse cx="258" cy="154" rx="102" ry="64" />}
        {view === "depth" && <ellipse cx="258" cy="154" rx="84" ry="51" />}
      </g>

      <g transform={`rotate(${frame.rotation} 258 154)`} className={styles.robotBody}>
        <path d="M177 137 C196 111 225 104 258 118 C294 101 327 111 342 137 L330 168 C307 181 282 183 258 169 C234 184 207 181 185 168 Z" />
        <rect x="218" y="126" width="80" height="55" rx="18" />
        <path d="M194 131 159 103M190 161l-42 20M326 129l38-27M330 161l43 20" />
        <circle cx="157" cy="102" r="8" />
        <circle cx="146" cy="182" r="8" />
        <circle cx="365" cy="101" r="8" />
        <circle cx="375" cy="182" r="8" />
        <path d="M235 137h46M231 153h55M239 168h38" />
      </g>

      {view === "attention" && (
        <g className={styles.attentionLayer}>
          <ellipse cx="215" cy="137" rx="92" ry="74" fill={`url(#${heat})`} />
          <ellipse cx="319" cy="169" rx="78" ry="62" fill={`url(#${heat})`} />
          <circle cx="258" cy="153" r="56" fill={`url(#${heat})`} />
        </g>
      )}

      {view === "pose" && (
        <g className={styles.poseAxes}>
          <path d="M258 154 417 154M258 154 258 42" />
          <path d="M388 154a130 130 0 0 0-36-90" />
          <circle cx="258" cy="154" r="5" />
          <text x="422" y="159">roll</text>
          <text x="265" y="41">pitch</text>
        </g>
      )}

      {view === "depth" && (
        <g className={styles.depthGauge}>
          <path d="M464 57v190" />
          <path d="M455 57h18M455 152h18M455 247h18" />
          <circle cx="464" cy={247 - Number(frame.depth) * 190} r="8" />
          <text x="478" y="61">1.0</text>
          <text x="478" y="156">0.5</text>
          <text x="478" y="251">0.0</text>
        </g>
      )}

      <g className={styles.microscopeHud}>
        <path d="M20 47V20h27M473 20h27v27M20 263v27h27M473 290h27v-27" />
        <text x="25" y="280">SANITISED / ILLUSTRATIVE</text>
        <text x="391" y="280">50 μm</text>
        <path d="M390 265h87" />
      </g>
    </svg>
  );
}

export function MicrorobotVisionDemo({ locale = "en-GB" }: { locale?: import("@/lib/i18n").Locale }) {
  const [model, setModel] = useState<VisionModelId>("resnet34");
  const [benchmark, setBenchmark] = useState<VisionBenchmark>("pose");
  const [view, setView] = useState<VisionView>("pose");
  const [frameIndex, setFrameIndex] = useState(0);
  const activeModel = VISION_MODELS[model];
  const primaryMetric = benchmark === "pose" ? activeModel.poseAccuracy : activeModel.depthRmse;
  const primaryLabel = benchmark === "pose" ? "POSE ACCURACY" : "DEPTH RMSE";

  return (
    <ProjectTranslationBoundary locale={locale}>
    <DemoWindow
      appName="MicroVision Archive"
      title="Microrobot Pose & Depth Bench"
      status="SANITISED BENCHMARK"
      statusTone="safe"
      className={styles.scientificWindow}
      footer={
        <>
          <span>2,002 source frames · 40 observed pose classes</span>
          <span>Illustrative browser view · no source images shipped</span>
        </>
      }
    >
      <EvidenceNote tone="amber" icon="!" title="Important split limitation">
        The reported 100% final-run result came from a random split where adjacent frames could cross partitions, and the test loader was reused to monitor and select the best epoch. It is not an untouched held-out estimate or evidence of generalisation to new robots, recordings, or microscope setups.
      </EvidenceNote>

      <div className={styles.visionControls}>
        <label>
          <span>MODEL</span>
          <select value={model} onChange={(event) => setModel(event.target.value as VisionModelId)}>
            {(Object.entries(VISION_MODELS) as [VisionModelId, (typeof VISION_MODELS)[VisionModelId]][]).map(([id, item]) => (
              <option value={id} key={id}>{item.name}</option>
            ))}
          </select>
        </label>
        <fieldset>
          <legend>BENCHMARK</legend>
          <div className={styles.binaryToggle}>
            <button type="button" aria-pressed={benchmark === "pose"} className={benchmark === "pose" ? styles.toggleActive : ""} onClick={() => setBenchmark("pose")}>Pose classification</button>
            <button type="button" aria-pressed={benchmark === "depth"} className={benchmark === "depth" ? styles.toggleActive : ""} onClick={() => setBenchmark("depth")}>Depth regression</button>
          </div>
        </fieldset>
        <label>
          <span>SAFE SAMPLE</span>
          <select value={frameIndex} onChange={(event) => setFrameIndex(Number(event.target.value))}>
            {MICRO_FRAMES.map((frame, index) => <option value={index} key={frame.id}>{frame.label}</option>)}
          </select>
        </label>
      </div>

      <div className={styles.visionLayout}>
        <section className={styles.visionViewer}>
          <div className={styles.viewerHeader}>
            <TabStrip label="Microrobot analysis view" options={VISION_VIEW_TABS} value={view} onChange={setView} />
            <span>ROBOT 8 / {MICRO_FRAMES[frameIndex].label.toUpperCase()}</span>
          </div>
          <MicrorobotScene view={view} frameIndex={frameIndex} />
          <div className={styles.viewerReadout} aria-live="polite">
            {view === "pose" && (
              <><span>POSE LABEL</span><strong>Pitch {MICRO_FRAMES[frameIndex].pitch} · Roll {MICRO_FRAMES[frameIndex].roll}</strong><small>Illustrative class overlay</small></>
            )}
            {view === "depth" && (
              <><span>NORMALISED DEPTH</span><strong>{MICRO_FRAMES[frameIndex].depth}</strong><small>Illustrative depth overlay</small></>
            )}
            {view === "attention" && (
              <><span>INTERPRETABILITY VIEW</span><strong>Body contours + edge fringes</strong><small>Grad-CAM-style illustration—not a computed activation map</small></>
            )}
          </div>
        </section>

        <aside className={styles.benchmarkPanel} aria-live="polite">
          <div className={styles.benchmarkHeading}>
            <span>SAVED MODEL CARD</span>
            <strong>{activeModel.name}</strong>
          </div>
          <div className={styles.benchmarkPrimary}>
            <span>{primaryLabel}</span>
            <strong>{primaryMetric}</strong>
            <small>{benchmark === "pose" ? "reported comparison result" : "normalised held-out error"}</small>
          </div>
          <dl className={styles.benchmarkFacts}>
            <div><dt>Pose accuracy</dt><dd>{activeModel.poseAccuracy}</dd></div>
            <div><dt>Depth RMSE</dt><dd>{activeModel.depthRmse}</dd></div>
            <div><dt>Parameters</dt><dd>{activeModel.parameters}</dd></div>
            <div><dt>Initialisation</dt><dd>{activeModel.pretraining}</dd></div>
          </dl>
          {model === "resnet34" && (
            <div className={styles.hundredCallout}>
              <span>SEPARATE FINAL RUN</span>
              <strong>100%*</strong>
              <p>*Adjacent-frame random split plus test-monitored epoch selection; not an untouched estimate or external-sequence generalisation claim.</p>
            </div>
          )}
        </aside>
      </div>

      <section className={styles.modelMatrix} aria-label="Five-model benchmark comparison">
        <div className={styles.matrixHeader}>
          <span>ARCHITECTURE</span><span>POSE</span><span>DEPTH RMSE</span><span>PARAMS</span>
        </div>
        {(Object.entries(VISION_MODELS) as [VisionModelId, (typeof VISION_MODELS)[VisionModelId]][]).map(([id, item]) => (
          <button type="button" aria-pressed={model === id} className={model === id ? styles.matrixActive : ""} key={id} onClick={() => setModel(id)}>
            <strong>{item.name}</strong><span>{item.poseAccuracy}</span><span>{item.depthRmse}</span><span>{item.parameters}</span>
          </button>
        ))}
      </section>
    </DemoWindow>
    </ProjectTranslationBoundary>
  );
}

type CalibrationView = "before" | "after";

const RELIABILITY_POINTS: Record<CalibrationView, { confidence: number; observed: number }[]> = {
  before: [
    { confidence: 0.045, observed: 0.190 }, { confidence: 0.102, observed: 0.138 },
    { confidence: 0.167, observed: 0.209 }, { confidence: 0.233, observed: 0.207 },
    { confidence: 0.300, observed: 0.276 }, { confidence: 0.367, observed: 0.342 },
    { confidence: 0.432, observed: 0.345 }, { confidence: 0.498, observed: 0.489 },
    { confidence: 0.565, observed: 0.520 }, { confidence: 0.632, observed: 0.553 },
    { confidence: 0.699, observed: 0.719 }, { confidence: 0.766, observed: 0.772 },
    { confidence: 0.837, observed: 0.867 }, { confidence: 0.896, observed: 0.952 },
    { confidence: 0.957, observed: 1.000 },
  ],
  after: [
    { confidence: 0.044, observed: 0.196 }, { confidence: 0.101, observed: 0.135 },
    { confidence: 0.166, observed: 0.202 }, { confidence: 0.233, observed: 0.226 },
    { confidence: 0.299, observed: 0.278 }, { confidence: 0.366, observed: 0.350 },
    { confidence: 0.433, observed: 0.355 }, { confidence: 0.498, observed: 0.494 },
    { confidence: 0.565, observed: 0.506 }, { confidence: 0.632, observed: 0.534 },
    { confidence: 0.699, observed: 0.710 }, { confidence: 0.767, observed: 0.746 },
    { confidence: 0.836, observed: 0.874 }, { confidence: 0.899, observed: 0.935 },
    { confidence: 0.959, observed: 0.989 },
  ],
};

const CALIBRATION_METRICS = {
  before: { ece: "0.03994", brier: "0.183854", nll: "0.547396" },
  after: { ece: "0.03792", brier: "0.183823", nll: "0.547561" },
} as const;

const CONFORMAL_RUNS = [
  { target: 80, empirical: 81.00, width: 37.85, alpha: 0.20 },
  { target: 90, empirical: 89.88, width: 47.03, alpha: 0.10 },
  { target: 95, empirical: 95.75, width: 57.39, alpha: 0.05 },
] as const;

function ReliabilityChart({ view }: { view: CalibrationView }) {
  const points = RELIABILITY_POINTS[view];
  const x = (value: number) => 38 + value * 238;
  const y = (value: number) => 168 - value * 142;
  const polyline = points.map((point) => `${x(point.confidence)},${y(point.observed)}`).join(" ");

  return (
    <svg
      className={styles.reliabilityChart}
      viewBox="0 0 310 205"
      role="img"
      aria-label={`Fifteen-bin reliability diagram ${view} temperature scaling`}
    >
      <rect x="38" y="26" width="238" height="142" className={styles.chartPaper} />
      {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
        <g key={tick} className={styles.chartGrid}>
          <path d={`M${x(tick)} 26V168M38 ${y(tick)}H276`} />
          <text x={x(tick)} y="183" textAnchor="middle">{tick.toFixed(tick === 0 || tick === 1 ? 0 : 2)}</text>
          <text x="31" y={y(tick) + 3} textAnchor="end">{tick.toFixed(tick === 0 || tick === 1 ? 0 : 2)}</text>
        </g>
      ))}
      <path d="M38 168 276 26" className={styles.perfectLine} />
      <polyline points={polyline} className={styles.observedLine} />
      {points.map((point, index) => (
        <circle cx={x(point.confidence)} cy={y(point.observed)} r="3.4" key={index} className={styles.observedPoint} />
      ))}
      <text x="157" y="201" textAnchor="middle" className={styles.axisLabel}>MEAN CONFIDENCE</text>
      <text transform="translate(10 102) rotate(-90)" textAnchor="middle" className={styles.axisLabel}>OBSERVED RATE</text>
      <g className={styles.chartLegend}>
        <path d="M174 16h22" className={styles.perfectLine} /><text x="201" y="19">ideal</text>
        <path d="M228 16h22" className={styles.observedLine} /><text x="255" y="19">bins</text>
      </g>
    </svg>
  );
}

export function ReliabilityLabDemo() {
  const [calibrationView, setCalibrationView] = useState<CalibrationView>("before");
  const [coverageIndex, setCoverageIndex] = useState(1);
  const coverageInputId = useId();
  const calibration = CALIBRATION_METRICS[calibrationView];
  const conformal = CONFORMAL_RUNS[coverageIndex];
  const widthPercent = 28 + ((conformal.width - 37.85) / (57.39 - 37.85)) * 58;

  return (
    <DemoWindow
      appName="Reliability Laboratory"
      title="Calibration & Conformal Explorer"
      status="EXECUTED RESULTS"
      statusTone="safe"
      className={styles.scientificWindow}
      footer={
        <>
          <span>Temperature T = 0.9434 · 15 calibration bins</span>
          <span>Saved test outputs · lower is better for ECE, Brier, NLL</span>
        </>
      }
    >
      <EvidenceNote tone="green" icon="✓" title="Results preserved with their trade-offs">
        This port reads fixed outputs from the executed safety coursework. It does not refit the classifier or recompute conformal intervals in the browser. The split-conformal coverage result relies on exchangeability; the source explicitly notes that covariate shift can break that guarantee.
      </EvidenceNote>

      <div className={styles.reliabilityLayout}>
        <section className={styles.calibrationPanel}>
          <div className={styles.panelTitlebar}>
            <div><span>PROBABILITY QUALITY</span><strong>Reliability diagram</strong></div>
            <TabStrip
              label="Temperature scaling state"
              options={[{ id: "before", label: "Before" }, { id: "after", label: "After" }] as const}
              value={calibrationView}
              onChange={setCalibrationView}
            />
          </div>
          <div className={styles.chartWrap} aria-live="polite">
            <ReliabilityChart view={calibrationView} />
            <div className={styles.calibrationMetrics}>
              <article>
                <span>ECE</span><strong>{calibration.ece}</strong>
                <small>{calibrationView === "after" ? "improved ↓" : "baseline"}</small>
              </article>
              <article>
                <span>BRIER</span><strong>{calibration.brier}</strong>
                <small>{calibrationView === "after" ? "improved slightly ↓" : "baseline"}</small>
              </article>
              <article className={calibrationView === "after" ? styles.metricCaution : ""}>
                <span>NLL</span><strong>{calibration.nll}</strong>
                <small>{calibrationView === "after" ? "worsened slightly ↑" : "baseline"}</small>
              </article>
            </div>
          </div>
          <div className={styles.calibrationFinding}>
            <span aria-hidden="true">↳</span>
            <p><strong>Recorded result:</strong> ECE and Brier improved marginally, while test NLL moved from 0.547396 to 0.547561 (+0.000165).</p>
          </div>
        </section>

        <section className={styles.conformalPanel}>
          <div className={styles.panelTitlebar}>
            <div><span>UNCERTAINTY SETS</span><strong>Coverage vs. width</strong></div>
            <span className={styles.splitBadge}>SPLIT CONFORMAL</span>
          </div>

          <div className={styles.coverageControl}>
            <label htmlFor={coverageInputId}>
              <span>Target coverage</span>
              <strong>{conformal.target}%</strong>
            </label>
            <input
              id={coverageInputId}
              type="range"
              min="0"
              max="2"
              step="1"
              value={coverageIndex}
              aria-valuetext={`${conformal.target}% target coverage`}
              onChange={(event) => setCoverageIndex(Number(event.target.value))}
            />
            <div className={styles.rangeLabels} aria-hidden="true"><span>80%</span><span>90%</span><span>95%</span></div>
          </div>

          <div className={styles.coverageReadout} aria-live="polite">
            <article>
              <span>EMPIRICAL COVERAGE</span>
              <strong>{conformal.empirical.toFixed(2)}%</strong>
              <small>{(conformal.empirical - conformal.target) >= 0 ? "+" : ""}{(conformal.empirical - conformal.target).toFixed(2)} pp vs target</small>
            </article>
            <article>
              <span>AVERAGE WIDTH</span>
              <strong>{conformal.width.toFixed(2)}</strong>
              <small>full interval width</small>
            </article>
          </div>

          <div className={styles.intervalPlot} role="img" aria-label={`Average conformal interval width ${conformal.width.toFixed(2)} at ${conformal.target}% target coverage`}>
            <div className={styles.intervalAxis}><span>narrower</span><span>wider</span></div>
            <div className={styles.intervalTrack}>
              <span className={styles.intervalBand} style={{ width: `${widthPercent}%` }}>
                <i /><b>ŷ</b><i />
              </span>
            </div>
            <p>Higher requested coverage admits a wider band around each point prediction.</p>
          </div>

          <table className={styles.coverageTable}>
            <caption>Saved coverage sweep</caption>
            <thead><tr><th>Target</th><th>Observed</th><th>Width</th></tr></thead>
            <tbody>
              {CONFORMAL_RUNS.map((run, index) => (
                <tr key={run.target} className={coverageIndex === index ? styles.coverageActive : ""}>
                  <td><button type="button" onClick={() => setCoverageIndex(index)} aria-label={`Select ${run.target}% target coverage`}>{run.target}%</button></td>
                  <td>{run.empirical.toFixed(2)}%</td>
                  <td>{run.width.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className={styles.alphaReadout}>α = {conformal.alpha.toFixed(2)} · test-set empirical estimate</p>
        </section>
      </div>
    </DemoWindow>
  );
}
