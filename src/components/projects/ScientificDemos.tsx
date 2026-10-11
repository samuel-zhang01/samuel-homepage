"use client";
import { PlotPanHint } from "./PlotPanHint";
import { ProjectCopy } from "./ProjectTranslationBoundary";
import { scientificCopy } from "./copy/scientificCopy";

import { CoverageShiftExperiment } from "./CoverageShiftExperiment";

import ClassicSelect from "../ClassicSelect";
import { System7Icon, type System7IconKind } from "../System7Icon";

import { useId, useState } from "react";

import { DemoWindow } from "./DemoChrome";
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
    <ProjectCopy copy={scientificCopy}><div className={styles.tabStrip} role="group" aria-label={label}>
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
    </div></ProjectCopy>
  );
}

function EvidenceNote({
  tone = "blue",
  icon,
  title,
  children,
}: {
  tone?: "blue" | "amber" | "green";
  icon: System7IconKind | "!" | "✓";
  title: string;
  children: React.ReactNode;
}) {
  const toneClass = tone === "amber" ? styles.note_amber : tone === "green" ? styles.note_green : "";

  return (
    <ProjectCopy copy={scientificCopy}><aside className={`${styles.evidenceNote} ${toneClass}`} role="note">
      <span className={icon === "!" || icon === "✓" ? styles.noteIcon : styles.noteArtwork} aria-hidden="true">{icon === "!" || icon === "✓" ? icon : <System7Icon kind={icon} miniature />}</span>
      <div>
        <strong>{title}</strong>
        <p>{children}</p>
      </div>
    </aside></ProjectCopy>
  );
}

type CfdModelId = "fno" | "gnn" | "unet";

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
    evaluation: "Recorded baseline evaluation",
    note: "The width-36 baseline combines three spectral blocks with a local pointwise path.",
  },
  gnn: {
    name: "MeshGraphNet",
    short: "GNN",
    relativeL2: "0.0165",
    architecture: "Message passing",
    representation: "Native mesh",
    parameters: "8,323",
    evaluation: "Recorded 500-file evaluation",
    note: "Ten residual processors exchange information along the original mesh edges.",
  },
  unet: {
    name: "U-Net baseline",
    short: "U-Net",
    relativeL2: "1.2823",
    architecture: "Encoder–decoder",
    representation: "Rasterised grid",
    parameters: "50,542,531",
    evaluation: "Shifted 20-file validation run",
    note: "This shifted set tests unfamiliar flow conditions, so its score cannot directly rank the model against the other runs.",
  },
};

export function CfdSurrogateDemo() {
  const [model, setModel] = useState<CfdModelId>("fno");
  const activeModel = CFD_MODELS[model];

  return <ProjectCopy copy={scientificCopy}><DemoWindow
    appName="FlowBench 7"
    title="What my flow models achieved"
    status="Recorded model results"
    purpose="I tested three ways to predict fluid motion: Fourier features on a grid, messages on a mesh and a U-Net image model."
    tryThis="Select a model to read its error, size and evaluation conditions. Use See the flow for the saved predictions."
    watchFor="Lower relative L2 means a closer numerical match. These runs use different evaluation conditions, so their errors do not form a fair league table."
    statusTone="safe"
    className={styles.scientificWindow}
    footer={<><span>Recorded relative L2 · evaluation splits differ</span><span>My training and evaluation results</span></>}
  >
    <div className={styles.resultsIntro}>
      <h3>What does the error number mean?</h3>
      <p>Relative L2 compares the size of a prediction error with the size of the reference flow field. A value of 0 means a perfect match; a value above 1 means the error is larger than the reference field itself.</p>
    </div>
    <nav className={styles.resultChoices} aria-label="Surrogate model">
      {(Object.entries(CFD_MODELS) as [CfdModelId, (typeof CFD_MODELS)[CfdModelId]][]).map(([id, item], index) => (
        <button type="button" className={`${styles.modelCard} ${model === id ? styles.modelCardActive : ""}`} aria-pressed={model === id} key={id} onClick={() => setModel(id)}>
          <span className={styles.modelIndex}>0{index + 1}</span>
          <span className={styles.modelCopy}><strong>{item.short}</strong><small>{item.name}</small></span>
          <span className={styles.modelScore}>{item.relativeL2}</span>
        </button>
      ))}
    </nav>
    <section className={styles.evidencePanel} aria-label={`${activeModel.name} evaluation summary`} aria-live="polite">
      <div className={`${styles.heroMetric} ${model === "unet" ? styles.heroMetricWarning : ""}`}>
        <span>Recorded relative L2</span><strong>{activeModel.relativeL2}</strong><small>{activeModel.evaluation}</small>
      </div>
      <dl className={styles.modelDetails}>
        <div><dt>Architecture</dt><dd>{activeModel.architecture}</dd></div>
        <div><dt>Representation</dt><dd>{activeModel.representation}</dd></div>
        <div><dt>Parameters</dt><dd>{activeModel.parameters}</dd></div>
        <div><dt>Readout</dt><dd>{activeModel.note}</dd></div>
      </dl>
    </section>
    <EvidenceNote icon="chart" title="What I learned">
      FNO and MeshGraphNet learned close matches on sets checked during training. My U-Net struggled on a separate 20-file set with different flow statistics. A small training error is not enough: I need to test the conditions where a surrogate will actually be used.
    </EvidenceNote>
  </DemoWindow></ProjectCopy>;
}

type VisionModelId = "simple" | "resnet18" | "resnet34" | "mobile" | "vit";
type VisionBenchmark = "pose" | "depth";

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

export function MicrorobotVisionDemo({ locale = "en-GB" }: { locale?: import("@/lib/i18n").Locale }) {
  const [model, setModel] = useState<VisionModelId>("resnet34");
  const [benchmark, setBenchmark] = useState<VisionBenchmark>("pose");
  const activeModel = VISION_MODELS[model];
  const primaryMetric = benchmark === "pose" ? activeModel.poseAccuracy : activeModel.depthRmse;
  const primaryLabel = benchmark === "pose" ? "Pose accuracy" : "Depth RMSE";

  return <ProjectCopy copy={scientificCopy} locale={locale}><ProjectTranslationBoundary locale={locale}><DemoWindow
    appName="MicroVision Lab"
    title="Which microrobot model would I choose?"
    status="Five-model comparison"
    purpose="I compared prediction quality with model size, because tracking a tiny robot needs both useful estimates and practical computing requirements."
    tryThis="Switch between pose and depth, then choose a model from the table. Compare its error with the number of learned parameters."
    watchFor="Higher pose accuracy is better; lower depth RMSE is better. MobileNetV3 is much smaller than ResNet34 or ViT, while the best model depends on the task."
    statusTone="safe"
    className={styles.scientificWindow}
    footer={<><span>Five models · 40 orientation classes</span><span>Recorded comparison · microscope images in the first tab</span></>}
  >
    <div className={styles.resultsIntro}>
      <h3>Two tasks, two ways to read the result</h3>
      <p>Pose accuracy is the percentage of images assigned the correct pitch-roll class. Depth RMSE is the typical size of an error on the normalised depth scale; it is not a distance in millimetres.</p>
    </div>
    <div className={styles.visionControls}>
      <label><span>Model</span><ClassicSelect value={model} onChange={(event) => setModel(event.target.value as VisionModelId)}>
        {(Object.entries(VISION_MODELS) as [VisionModelId, (typeof VISION_MODELS)[VisionModelId]][]).map(([id, item]) => <option value={id} key={id}>{item.name}</option>)}
      </ClassicSelect></label>
      <fieldset><legend>Benchmark</legend><div className={styles.binaryToggle}>
        <button type="button" aria-pressed={benchmark === "pose"} className={benchmark === "pose" ? styles.toggleActive : ""} onClick={() => setBenchmark("pose")}>Pose classification</button>
        <button type="button" aria-pressed={benchmark === "depth"} className={benchmark === "depth" ? styles.toggleActive : ""} onClick={() => setBenchmark("depth")}>Depth regression</button>
      </div></fieldset>
    </div>
    <section className={styles.resultSummary} aria-live="polite">
      <div className={styles.benchmarkPrimary}><span>{primaryLabel}</span><strong>{primaryMetric}</strong><small>{activeModel.name}</small></div>
      <dl className={styles.benchmarkFacts}>
        <div><dt>Pose accuracy</dt><dd>{activeModel.poseAccuracy}</dd></div>
        <div><dt>Depth RMSE</dt><dd>{activeModel.depthRmse}</dd></div>
        <div><dt>Parameters</dt><dd>{activeModel.parameters}</dd></div>
        <div><dt>Initialisation</dt><dd>{activeModel.pretraining}</dd></div>
      </dl>
    </section>
    <section className={styles.modelMatrix} aria-label="Five-model benchmark comparison">
      <div className={styles.matrixHeader}><span>Architecture</span><span>Pose</span><span>Depth RMSE</span><span>Params</span></div>
      {(Object.entries(VISION_MODELS) as [VisionModelId, (typeof VISION_MODELS)[VisionModelId]][]).map(([id, item]) => (
        <button type="button" aria-pressed={model === id} className={model === id ? styles.matrixActive : ""} key={id} onClick={() => setModel(id)}>
          <strong>{item.name}</strong><span>{item.poseAccuracy}</span><span>{item.depthRmse}</span><span>{item.parameters}</span>
        </button>
      ))}
    </section>
    <EvidenceNote icon="microscope" title="What I learned">
      My custom CNN with skip connections came close to the larger models for pose classification. Depth estimation benefited more from pretrained networks. These image-level tests still need a follow-up on complete unseen recordings, where neighbouring frames cannot cross between training and testing.
    </EvidenceNote>
  </DemoWindow></ProjectTranslationBoundary></ProjectCopy>;
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
  const x = (value: number) => 68 + value * 238;
  const y = (value: number) => 168 - value * 142;
  const polyline = points.map((point) => `${x(point.confidence)},${y(point.observed)}`).join(" ");

  return (
    <ProjectCopy copy={scientificCopy}><svg
      className={styles.reliabilityChart}
      viewBox="0 0 342 215"
      role="img"
      aria-label={`Fifteen-bin reliability diagram ${view} temperature scaling`}
    >
      <rect x="68" y="26" width="238" height="142" className={styles.chartPaper} />
      {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
        <g key={tick} className={styles.chartGrid}>
          <path d={`M${x(tick)} 26V168M68 ${y(tick)}H306`} />
          <text x={x(tick)} y="183" textAnchor="middle">{tick.toFixed(tick === 0 || tick === 1 ? 0 : 2)}</text>
          <text x="61" y={y(tick) + 3} textAnchor="end">{tick.toFixed(tick === 0 || tick === 1 ? 0 : 2)}</text>
        </g>
      ))}
      <path d="M68 168 306 26" className={styles.perfectLine} />
      <polyline points={polyline} className={styles.observedLine} />
      {points.map((point, index) => (
        <circle cx={x(point.confidence)} cy={y(point.observed)} r="3.4" key={index} className={styles.observedPoint} />
      ))}
      <text x="187" y="201" textAnchor="middle" className={styles.axisLabel}>Mean confidence</text>
      <text transform="translate(14 102) rotate(-90)" textAnchor="middle" className={styles.axisLabel}>Observed rate</text>
      <g className={styles.chartLegend}>
        <path d="M164 16h20" className={styles.perfectLine} /><text x="190" y="19">ideal</text>
        <path d="M248 16h20" className={styles.observedLine} /><text x="274" y="19">bins</text>
      </g>
    </svg></ProjectCopy>
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
    <ProjectCopy copy={scientificCopy}><DemoWindow
      appName="Reliability Laboratory"
      title="Calibration & Conformal Explorer"
      status="Executed results"
      purpose="Show why a confident scientific model can still be unreliable, and how calibration and conformal sets expose that gap."
      tryThis="Compare saved calibration results, then move the population in the synthetic coverage experiment."
      watchFor="The recorded calibration trade-off stays visible. The separate shift experiment recomputes interval membership for forty outcomes."
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
        The calibration panels read fixed results from the executed safety coursework. The separate synthetic shift experiment below recomputes interval membership in the browser. Split-conformal coverage relies on exchangeable calibration and test observations; population changes can reduce that coverage.
      </EvidenceNote>

      <div className={styles.reliabilityLayout}>
        <section className={styles.calibrationPanel}>
          <div className={styles.panelTitlebar}>
            <div><span>Probability quality</span><strong>Reliability diagram</strong></div>
            <TabStrip
              label="Temperature scaling state"
              options={[{ id: "before", label: "Before" }, { id: "after", label: "After" }] as const}
              value={calibrationView}
              onChange={setCalibrationView}
            />
          </div>
          <div className={styles.chartWrap} aria-live="polite">
            <PlotPanHint /><div className={styles.chartViewport} role="region" aria-label="Reliability diagram" tabIndex={0}>
              <ReliabilityChart view={calibrationView} />
            </div>
            <div className={styles.calibrationMetrics}>
              <article>
                <span>ECE</span><strong>{calibration.ece}</strong>
                <small>{calibrationView === "after" ? "improved ↓" : "baseline"}</small>
              </article>
              <article>
                <span>Brier</span><strong>{calibration.brier}</strong>
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
            <div><span>Uncertainty sets</span><strong>Coverage vs. width</strong></div>
            <span className={styles.splitBadge}>Split conformal</span>
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
              <span>Empirical coverage</span>
              <strong>{conformal.empirical.toFixed(2)}%</strong>
              <small>{(conformal.empirical - conformal.target) >= 0 ? "+" : ""}{(conformal.empirical - conformal.target).toFixed(2)} pp vs target</small>
            </article>
            <article>
              <span>Average width</span>
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
    <CoverageShiftExperiment />
    </DemoWindow></ProjectCopy>
  );
}
