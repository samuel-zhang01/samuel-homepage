"use client";
import { ProjectCopy } from "./ProjectTranslationBoundary";
import { scientificCopy } from "./copy/scientificCopy";

import ClassicSelect from "../ClassicSelect";

import { useMemo, useState, type CSSProperties } from "react";

import styles from "./ModelLineageMap.module.css";

type Family = "Vision" | "CFD" | "MRI";
type View = "history" | "scale" | "contract";
type EvidenceKind = "design" | "data" | "run" | "selection" | "release" | "drift" | "snapshot";

type Milestone = {
  id: string;
  date: string;
  sortableDate: string;
  family: Family;
  kind: EvidenceKind;
  title: string;
  detail: string;
  projectSlug: string;
};

type ModelConfig = {
  id: string;
  family: Family;
  name: string;
  parameters: number;
  role: string;
  origin: string;
  approach: string;
  note: string;
  projectSlug: string;
};

const FAMILY_META: Record<Family, { label: string; colour: string; repositoryCount: number }> = {
  Vision: { label: "Microrobot vision", colour: "#2f6971", repositoryCount: 1 },
  CFD: { label: "Neural CFD surrogates", colour: "#6b4d78", repositoryCount: 3 },
  MRI: { label: "MRI reconstruction", colour: "#8a5b2f", repositoryCount: 1 },
};

const KIND_LABELS: Record<EvidenceKind, string> = {
  design: "Design",
  data: "Data",
  run: "Experiment",
  selection: "Selection",
  release: "Handoff",
  drift: "Development",
  snapshot: "Reconstruction",
};

const MILESTONES = ([
  {
    id: "vision-report",
    date: "04 DEC 2025",
    sortableDate: "2025-12-04",
    family: "Vision",
    kind: "design",
    title: "Define the microscopy prediction tasks",
    detail: "Frame the problem of estimating microrobot orientation and depth from grayscale images, and plan a comparison of several image-model families.",
    projectSlug: "microrobot-vision",
  },
  {
    id: "vision-orientation",
    date: "07 DEC 2025",
    sortableDate: "2025-12-07",
    family: "Vision",
    kind: "data",
    title: "Correct image orientation before training",
    detail: "Align image orientation metadata with pose labels so that preprocessing preserves the relationship between an image and the robot’s pitch and roll.",
    projectSlug: "microrobot-vision",
  },
  {
    id: "vision-evaluation",
    date: "08 DEC 2025",
    sortableDate: "2025-12-08",
    family: "Vision",
    kind: "run",
    title: "Inspect pose errors, depth errors and image attention",
    detail: "Compare training progress, confusion matrices and depth residuals. Grad-CAM highlights image regions associated with each prediction, helping inspect model behaviour.",
    projectSlug: "microrobot-vision",
  },
  {
    id: "vision-five-models",
    date: "10 DEC 2025",
    sortableDate: "2025-12-10",
    family: "Vision",
    kind: "run",
    title: "Compare five image-model families",
    detail: "Compare a custom CNN with ResNet18, ResNet34, MobileNetV3-Small and ViT-B/16 for orientation and depth estimation.",
    projectSlug: "microrobot-vision",
  },
  {
    id: "vision-selection",
    date: "13 DEC 2025",
    sortableDate: "2025-12-13",
    family: "Vision",
    kind: "selection",
    title: "Select models and prepare a prediction workflow",
    detail: "Use the recorded comparisons to choose models for precise estimation and compact inference, then prepare the image-loading and prediction workflow.",
    projectSlug: "microrobot-vision",
  },
  {
    id: "vision-report-final",
    date: "20 DEC 2025",
    sortableDate: "2025-12-20",
    family: "Vision",
    kind: "release",
    title: "Explain the final experiments and architectures",
    detail: "Bring together the ResNet analysis, roll–pitch orientation grid, architecture descriptions and instructions for using the trained models.",
    projectSlug: "microrobot-vision",
  },
  {
    id: "vision-head",
    date: "20 DEC 2025",
    sortableDate: "2025-12-20T12:00:00",
    family: "Vision",
    kind: "drift",
    title: "Refine microscopy image loading",
    detail: "Refine the image-loading and preprocessing workflow so new microscope images follow the same path into the prediction models.",
    projectSlug: "microrobot-vision",
  },
  {
    id: "cfd-unet",
    date: "27 JAN — 02 FEB 2026",
    sortableDate: "2026-01-27",
    family: "CFD",
    kind: "run",
    title: "Learn flow updates on a regular grid",
    detail: "Interpolate mesh fields onto a grid and train a four-level U-Net for 100 epochs. A separate shifted evaluation produces relative error 1.2823, highlighting sensitivity to unfamiliar flow conditions.",
    projectSlug: "neural-cfd-surrogates",
  },
  {
    id: "cfd-gnn",
    date: "16 FEB — 02 MAR 2026",
    sortableDate: "2026-02-16",
    family: "CFD",
    kind: "drift",
    title: "Predict flow directly on the mesh",
    detail: "Complete node and edge encoders, ten residual message-passing blocks and an autoregressive prediction loop. Neighbouring mesh points exchange information while retaining the original geometry.",
    projectSlug: "neural-cfd-surrogates",
  },
  {
    id: "cfd-fno-baseline",
    date: "02 — 04 MAR 2026",
    sortableDate: "2026-03-02",
    family: "CFD",
    kind: "drift",
    title: "Learn global flow patterns with Fourier modes",
    detail: "Train a three-block Fourier model and record relative L2 0.0163. A separate four-block extension adds more input context and normalisation.",
    projectSlug: "neural-cfd-surrogates",
  },
  {
    id: "cfd-fno-branches",
    date: "04 — 06 MAR 2026",
    sortableDate: "2026-03-04",
    family: "CFD",
    kind: "run",
    title: "Explore residual and multi-scale Fourier designs",
    detail: "Expand the design with wider residual blocks, physics terms, lightweight variants and several Fourier resolutions. The larger recorded run uses about 33.205 million parameters.",
    projectSlug: "neural-cfd-surrogates",
  },
  {
    id: "mri-snapshot",
    date: "03 APR 2026",
    sortableDate: "2026-04-03",
    family: "MRI",
    kind: "snapshot",
    title: "Combine reconstruction with uncertainty and consistency checks",
    detail: "Develop a residual reconstruction U-Net with three learnable data-consistency steps, then examine MC-dropout, ensembles and downstream segmentation. The model aims to recover useful images from incomplete measurements.",
    projectSlug: "trustworthy-mri-reconstruction",
  },
] satisfies Milestone[]).sort((left, right) => left.sortableDate.localeCompare(right.sortableDate));

const CONFIGS = ([
  {
    id: "mobilenet-cls",
    family: "Vision",
    name: "MobileNetV3-Small · classification",
    parameters: 1_558_568,
    role: "40-class pose classifier",
    origin: "ImageNet pretraining with a grayscale input and new pose head",
    approach: "Compact inverted residual blocks and channel attention",
    note: "A compact transfer-learning candidate for estimating orientation with fewer model parameters.",
    projectSlug: "microrobot-vision",
  },
  {
    id: "simplecnn-cls",
    family: "Vision",
    name: "SimpleCNN · residual classification design",
    parameters: 4_154_856,
    role: "40-class pose classifier",
    origin: "Custom CNN trained from scratch",
    approach: "Five convolutional blocks with four skip additions",
    note: "The developed design includes two projected skips and two identity skips. Recorded pose scores refer to an earlier version without the two learned projection skips.",
    projectSlug: "microrobot-vision",
  },
  {
    id: "resnet18-cls",
    family: "Vision",
    name: "ResNet18 · classification",
    parameters: 11_190_760,
    role: "40-class pose classifier",
    origin: "ImageNet pretraining with a grayscale input and new pose head",
    approach: "Four residual stages with two basic blocks each",
    note: "Fine-tuning reuses learned image features while the new input and output layers adapt them to microscopy.",
    projectSlug: "microrobot-vision",
  },
  {
    id: "resnet34-cls",
    family: "Vision",
    name: "ResNet34 · classification",
    parameters: 21_298_920,
    role: "40-class pose classifier",
    origin: "ImageNet pretraining with a grayscale input and new pose head",
    approach: "Deeper residual stages with block counts 3, 4, 6 and 3",
    note: "A new one-channel input convolution accepts microscope intensity. Residual connections carry features through the deeper model.",
    projectSlug: "microrobot-vision",
  },
  {
    id: "vit-cls",
    family: "Vision",
    name: "ViT-B/16 · classification",
    parameters: 85_435_432,
    role: "40-class pose classifier",
    origin: "ImageNet pretraining with averaged grayscale patch weights and a new head",
    approach: "Self-attention across 16×16 image patches",
    note: "The transformer can relate distant image regions. Its larger parameter count does not by itself imply better predictions.",
    projectSlug: "microrobot-vision",
  },
  {
    id: "meshgraphnet",
    family: "CFD",
    name: "MeshGraphNet · 10 processors",
    parameters: 8_323,
    role: "Native-mesh autoregressive flow surrogate",
    origin: "Course model completed and adapted for flow prediction",
    approach: "Residual message passing on the original mesh",
    note: "Node 7→10 and edge 3→10 encoders feed ten residual processors and a 10→3 decoder. Each prediction is added to the previous flow field.",
    projectSlug: "neural-cfd-surrogates",
  },
  {
    id: "fno-executed",
    family: "CFD",
    name: "FNO · three-block baseline",
    parameters: 3_990_575,
    role: "3-D spectral flow surrogate",
    origin: "Course model completed with flow-processing and training work",
    approach: "Global Fourier features combined with a local pointwise path",
    note: "Three input fields are lifted to width 36, processed by three spectral blocks, then projected through a 36→128→3 head.",
    projectSlug: "neural-cfd-surrogates",
  },
  {
    id: "fno-local-checkpoint",
    family: "CFD",
    name: "FNO · four-block extension",
    parameters: 5_327_471,
    role: "Six-input 3-D spectral flow surrogate",
    origin: "Custom feature and architecture adaptation",
    approach: "Six input features and four width-36 spectral blocks",
    note: "The six inputs combine velocity and pressure with x/y position and obstacle distance. Each spectral block retains 8×8×4 modes; no evaluation result is paired with this exact design.",
    projectSlug: "neural-cfd-surrogates",
  },
  {
    id: "fno-improved",
    family: "CFD",
    name: "FNO · five-block residual experiment",
    parameters: 33_204_920,
    role: "Five-block residual spectral surrogate",
    origin: "Custom feature, normalisation and residual experiments",
    approach: "Wider blocks and more retained Fourier modes",
    note: "Five width-48 blocks retain 12×12×5 modes. The count shown is the recorded run configuration; the evaluation set also guided model selection.",
    projectSlug: "neural-cfd-surrogates",
  },
  {
    id: "cfd-unet",
    family: "CFD",
    name: "Grid U-Net · four-level surrogate",
    parameters: 50_542_531,
    role: "3×80×320 grid-to-grid flow surrogate",
    origin: "Course model completed and adapted for flow prediction",
    approach: "Coarse flow context joined to high-resolution skip features",
    note: "Strided convolutions build a 64→128→256→512→1024 encoder. Four transposed-convolution stages restore the field resolution and merge the skip features.",
    projectSlug: "neural-cfd-surrogates",
  },
  {
    id: "mri-segmentation",
    family: "MRI",
    name: "Segmentation U-Net · frozen evaluator",
    parameters: 1_923_848,
    role: "Eight-class downstream evaluator",
    origin: "Separate model used to evaluate reconstructed images",
    approach: "Eight-class segmentation of the reconstructed anatomy",
    note: "Keeping this evaluator frozen helps examine whether reconstruction changes the downstream segmentation task.",
    projectSlug: "trustworthy-mri-reconstruction",
  },
  {
    id: "mri-recon",
    family: "MRI",
    name: "ReconUNet · reconstruction model",
    parameters: 7_756_580,
    role: "Residual 256×256 MRI reconstructor",
    origin: "Custom reconstruction architecture trained from scratch",
    approach: "Residual reconstruction with three learnable consistency steps",
    note: "A symmetric 32→64→128→256→512 path processes the image. Three soft data-consistency steps bring it back towards the acquired measurements.",
    projectSlug: "trustworthy-mri-reconstruction",
  },
] satisfies ModelConfig[]).sort((left, right) => left.parameters - right.parameters);

const MIN_LOG = 3;
const MAX_LOG = 8;
const SCALE_TICKS = [10_000, 100_000, 1_000_000, 10_000_000, 100_000_000];

function scalePercent(value: number) {
  return Math.max(0, Math.min(100, ((Math.log10(value) - MIN_LOG) / (MAX_LOG - MIN_LOG)) * 100));
}

function formatParameters(value: number) {
  return value.toLocaleString("en-GB");
}

function familyStyle(family: Family): CSSProperties {
  return { "--family-colour": FAMILY_META[family].colour } as CSSProperties;
}

export function ModelLineageMap({
  onSelectProject,
  initialSlug,
}: {
  onSelectProject: (slug: string) => void;
  initialSlug?: string;
}) {
  const initialFamily: Family = initialSlug === "neural-cfd-surrogates"
    ? "CFD"
    : initialSlug === "trustworthy-mri-reconstruction"
      ? "MRI"
      : "Vision";
  const [view, setView] = useState<View>("history");
  const [family, setFamily] = useState<Family | "All">("All");
  const [kind, setKind] = useState<EvidenceKind | "all">("all");
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(() => (
    MILESTONES.find((item) => item.family === initialFamily)?.id ?? MILESTONES[0].id
  ));
  const [selectedConfigId, setSelectedConfigId] = useState(() => (
    CONFIGS.find((item) => item.family === initialFamily)?.id ?? CONFIGS[0].id
  ));

  const milestones = useMemo(() => MILESTONES.filter((item) => (
    (family === "All" || item.family === family)
    && (kind === "all" || item.kind === kind)
  )), [family, kind]);
  const configs = useMemo(() => CONFIGS.filter((item) => family === "All" || item.family === family), [family]);
  const selectedMilestone = milestones.find((item) => item.id === selectedMilestoneId) ?? milestones[0] ?? null;
  const selectedConfig = configs.find((item) => item.id === selectedConfigId) ?? configs[0] ?? CONFIGS[0];

  function chooseFamily(next: Family | "All") {
    setFamily(next);
    const nextMilestone = MILESTONES.find((item) => next === "All" || item.family === next);
    const nextConfig = CONFIGS.find((item) => next === "All" || item.family === next);
    if (nextMilestone) setSelectedMilestoneId(nextMilestone.id);
    if (nextConfig) setSelectedConfigId(nextConfig.id);
  }

  return (
    <ProjectCopy copy={scientificCopy}><section className={styles.lineage} aria-label="Model experiment lineage">
      <header className={styles.header}>
        <div>
          <span>VISION · FLUID MOTION · MRI · DEC 2025—APR 2026</span>
          <h3>How the model designs developed</h3>
          <p>Follow the experiments from microscopy to fluid prediction and MRI. Compare how each problem shapes the model’s input, information flow and size.</p>
        </div>
        <dl aria-label="Model lineage summary">
          <div><dt>Applications</dt><dd>{Object.keys(FAMILY_META).length}</dd></div>
          <div><dt>Milestones</dt><dd>{MILESTONES.length}</dd></div>
          <div><dt>Configurations</dt><dd>{CONFIGS.length}</dd></div>
          <div><dt>Parameter span</dt><dd>8.3K—85.4M</dd></div>
        </dl>
      </header>

      <div className={styles.controls}>
        <div className={styles.viewSwitch} role="group" aria-label="Model lineage view">
          {([
            ["history", "01", "Development"],
            ["scale", "02", "Parameter scale"],
            ["contract", "03", "Design guide"],
          ] as const).map(([id, number, label]) => (
            <button key={id} type="button" aria-pressed={view === id} onClick={() => setView(id)}>
              <span>{number}</span><strong>{label}</strong>
            </button>
          ))}
        </div>
        <div className={styles.familySwitch} role="group" aria-label="Filter model family">
          <span>Family</span>
          {(["All", "Vision", "CFD", "MRI"] as const).map((item) => (
            <button key={item} type="button" aria-pressed={family === item} onClick={() => chooseFamily(item)}>{item}</button>
          ))}
        </div>
      </div>

      {view === "history" && (
        <div className={styles.historyWorkspace}>
          <section className={styles.historyPanel}>
            <div className={styles.panelHeading}>
              <div><span>Project development</span><strong>Experiment milestones</strong></div>
              <label><span>Activity</span><ClassicSelect value={kind} onChange={(event) => setKind(event.target.value as EvidenceKind | "all")}><option value="all">All activities</option>{Object.entries(KIND_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</ClassicSelect></label>
            </div>
            <p className={styles.chartNote}>Select a milestone to see what changed and why it mattered. The dates show development order; the intervals do not measure effort.</p>
            <ol className={styles.timeline}>
              {milestones.map((item) => (
                <li key={item.id} style={familyStyle(item.family)}>
                  <button type="button" aria-pressed={selectedMilestone?.id === item.id} onClick={() => setSelectedMilestoneId(item.id)}>
                    <span className={styles.eventDate}><time dateTime={item.sortableDate.slice(0, 10)}>{item.date}</time></span>
                    <span className={styles.eventRail} aria-hidden="true"><i /></span>
                    <span className={styles.eventCopy}><small>{item.family} · {KIND_LABELS[item.kind]}</small><strong>{item.title}</strong><em>{item.detail}</em></span>
                  </button>
                </li>
              ))}
              {!milestones.length && <li className={styles.empty}><strong>No matching milestones</strong><span>Change the family or activity filter to see more milestones.</span></li>}
            </ol>
          </section>

          {selectedMilestone ? (
            <aside className={styles.inspector} style={familyStyle(selectedMilestone.family)} aria-live="polite">
              <div className={styles.inspectorTop}><span>Selected milestone</span><b>{KIND_LABELS[selectedMilestone.kind]}</b></div>
              <small>{selectedMilestone.family} · {selectedMilestone.date}</small>
              <h4>{selectedMilestone.title}</h4>
              <p>{selectedMilestone.detail}</p>
              <dl>
                <div><dt>Family</dt><dd>{FAMILY_META[selectedMilestone.family].label}</dd></div>
                <div><dt>Activity</dt><dd>{KIND_LABELS[selectedMilestone.kind]}</dd></div>
              </dl>
              <button type="button" onClick={() => onSelectProject(selectedMilestone.projectSlug)}>Open project architecture <span aria-hidden="true">›</span></button>
            </aside>
          ) : (
            <aside className={`${styles.inspector} ${styles.emptyInspector}`} aria-live="polite">
              <div className={styles.inspectorTop}><span>Filtered view</span><b>0 Matches</b></div>
              <h4>No milestone selected</h4>
              <p>This family has no milestone for the chosen activity. Change either filter to explore its development.</p>
            </aside>
          )}
        </div>
      )}

      {view === "scale" && (
        <div className={styles.scaleWorkspace}>
          <section className={styles.scalePanel} aria-labelledby="parameter-scale-title">
            <div className={styles.panelHeading}><div><span>LOG₁₀ Axis · exact counts</span><strong id="parameter-scale-title">Trainable parameter scale</strong></div><output>{configs.length} configurations</output></div>
            <p className={styles.chartNote}>Model sizes span four orders of magnitude, so the chart uses a logarithmic axis. Each tenfold increase takes the same space. More parameters mean more learned values, not necessarily better predictions.</p>
            <div className={styles.scaleChart}>
              <div className={styles.scaleAxis} aria-hidden="true">{SCALE_TICKS.map((tick) => <span key={tick} style={{ left: `${scalePercent(tick)}%` }}>{tick >= 1_000_000 ? `${tick / 1_000_000}M` : `${tick / 1_000}K`}</span>)}</div>
              <div className={styles.modelRows}>
                {configs.map((config) => (
                  <button key={config.id} type="button" style={familyStyle(config.family)} aria-pressed={selectedConfig.id === config.id} onClick={() => setSelectedConfigId(config.id)}>
                    <span className={styles.modelIdentity}><small>{config.family}</small><strong>{config.name}</strong></span>
                    <span className={styles.modelTrack} aria-hidden="true"><i style={{ width: `${scalePercent(config.parameters)}%` }} /></span>
                    <b>{formatParameters(config.parameters)}</b>
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.familyLegend} aria-label="Model family legend">{(Object.keys(FAMILY_META) as Family[]).map((item) => <span key={item} style={familyStyle(item)}><i />{FAMILY_META[item].label}</span>)}</div>
          </section>

          <aside className={styles.inspector} style={familyStyle(selectedConfig.family)} aria-live="polite">
            <div className={styles.inspectorTop}><span>Selected configuration</span><b>{selectedConfig.family}</b></div>
            <small>{selectedConfig.role}</small>
            <h4>{selectedConfig.name}</h4>
            <strong className={styles.parameterValue}>{formatParameters(selectedConfig.parameters)} <span>trainable parameters</span></strong>
            <dl>
              <div><dt>Origin</dt><dd>{selectedConfig.origin}</dd></div>
              <div><dt>Design</dt><dd>{selectedConfig.approach}</dd></div>
            </dl>
            <p>{selectedConfig.note}</p>
            <button type="button" onClick={() => onSelectProject(selectedConfig.projectSlug)}>Open exact architecture <span aria-hidden="true">›</span></button>
          </aside>
        </div>
      )}

      {view === "contract" && (
        <div className={styles.contractView}>
          <section className={styles.boundaryHero}>
            <div><span>Start with the task</span><strong>What must the model learn from its input?</strong><p>Microscopy needs orientation and depth from an image. CFD needs a future flow field. MRI needs a useful reconstruction from incomplete measurements.</p></div>
            <div><span>Then check the result</span><strong>Does the model work under the intended conditions?</strong><p>Accuracy, depth error and flow error measure different things. Compare each model on its own task, with evaluation conditions that match its use.</p></div>
          </section>

          <section className={styles.sourceTable}>
            <div className={styles.panelHeading}><div><span>3 Applications</span><strong>How the problem shapes the architecture</strong></div></div>
            <div role="region" tabIndex={0} aria-label="Scrollable architecture design guide">
              <table>
                <caption>Inputs, model roles and useful evaluation questions</caption>
                <thead><tr><th scope="col">Project</th><th scope="col">Input</th><th scope="col">Prediction</th><th scope="col">Design choice</th><th scope="col">What to check</th></tr></thead>
                <tbody>
                  <tr><th scope="row">Microrobot vision</th><td>Grayscale microscope image</td><td>Orientation class or depth</td><td>Custom CNN or pretrained image backbone with a new task head</td><td>Pose accuracy, depth error and performance on unseen recordings</td></tr>
                  <tr><th scope="row">Neural CFD</th><td>Velocity and pressure on a mesh or grid</td><td>Later velocity and pressure fields</td><td>Graph messages, Fourier modes or U-Net skips</td><td>Single-step error, repeated prediction and unfamiliar flow conditions</td></tr>
                  <tr><th scope="row">MRI reconstruction</th><td>Incomplete frequency-space measurements</td><td>Reconstructed image and uncertainty</td><td>Residual U-Net with data-consistency steps</td><td>Image quality, measurement agreement and downstream segmentation</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <div className={styles.definitionGrid}>
            <section><span>01 · Image features</span><strong>Build local patterns into a whole-image estimate</strong><p>Convolutions gather spatial patterns. Pooling and task heads turn those patterns into orientation or depth predictions.</p></section>
            <section><span>02 · Transfer learning</span><strong>Adapt existing visual features</strong><p>ImageNet-pretrained backbones provide a starting point; grayscale inputs and new heads adapt them to microscopy.</p></section>
            <section><span>03 · Mesh messages</span><strong>Keep the simulation geometry</strong><p>Graph models pass information between neighbouring mesh points without first converting the field into an image grid.</p></section>
            <section><span>04 · Fourier modes</span><strong>Mix information across a flow field</strong><p>Frequency components capture broad patterns; learned mode weights and local paths combine them into a field update.</p></section>
            <section><span>05 · Skip connections</span><strong>Carry useful features through the network</strong><p>Residual additions and U-Net bridges help later stages use information from earlier ones.</p></section>
            <section><span>06 · Data consistency</span><strong>Respect the acquired measurements</strong><p>MRI consistency steps bring the reconstructed image back towards the measured frequency samples.</p></section>
          </div>
        </div>
      )}

      <footer className={styles.footer}>
        <span>{MILESTONES.length} development milestones · {CONFIGS.length} model configurations · 3 applications</span>
        <span>Compare architecture size within the context of each task</span>
      </footer>
    </section></ProjectCopy>
  );
}

export default ModelLineageMap;
