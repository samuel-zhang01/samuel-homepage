"use client";

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
  commit: string;
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
  artifact: string;
  note: string;
  projectSlug: string;
};

const FAMILY_META: Record<Family, { label: string; colour: string; repositoryCount: number }> = {
  Vision: { label: "Microrobot vision", colour: "#2f6971", repositoryCount: 1 },
  CFD: { label: "Neural CFD surrogates", colour: "#6b4d78", repositoryCount: 3 },
  MRI: { label: "MRI reconstruction", colour: "#8a5b2f", repositoryCount: 1 },
};

const KIND_LABELS: Record<EvidenceKind, string> = {
  design: "DESIGN",
  data: "DATA",
  run: "EXECUTED",
  selection: "SELECTION",
  release: "REVISION",
  drift: "DRIFT AUDIT",
  snapshot: "SNAPSHOT",
};

const MILESTONES = ([
  {
    id: "vision-report",
    date: "04 DEC 2025",
    sortableDate: "2025-12-04",
    commit: "1af6d06",
    family: "Vision",
    kind: "design",
    title: "Report scaffold enters history",
    detail: "The report source, IEEE template and reference material establish the first retained milestone. No training or performance claim is attached to this commit.",
    projectSlug: "microrobot-vision",
  },
  {
    id: "vision-orientation",
    date: "07 DEC 2025",
    sortableDate: "2025-12-07",
    commit: "63adb26",
    family: "Vision",
    kind: "data",
    title: "EXIF orientation correction joins the pipeline",
    detail: "The notebook, comparison image, rotation audit and a local SimpleCNN state changed together. The image-level split still allows adjacent video frames to cross partitions, so its scores are not group-held-out evidence.",
    projectSlug: "microrobot-vision",
  },
  {
    id: "vision-evaluation",
    date: "08 DEC 2025",
    sortableDate: "2025-12-08",
    commit: "872620a",
    family: "Vision",
    kind: "run",
    title: "Classification, depth and interpretation surfaces expand",
    detail: "Training histories, model comparisons, Grad-CAM views and regression diagnostics appear together. These artifacts support error inspection, not causal explanations.",
    projectSlug: "microrobot-vision",
  },
  {
    id: "vision-five-models",
    date: "10 DEC 2025",
    sortableDate: "2025-12-10",
    commit: "53496b4",
    family: "Vision",
    kind: "run",
    title: "Five model families are reconciled",
    detail: "SimpleCNN, ResNet18, ResNet34, MobileNetV3-Small and ViT-B/16 run directories, plots and the comparison CSV are consolidated into one experiment snapshot with traceable inputs.",
    projectSlug: "microrobot-vision",
  },
  {
    id: "vision-selection",
    date: "13 DEC 2025",
    sortableDate: "2025-12-13",
    commit: "d59a4a5",
    family: "Vision",
    kind: "selection",
    title: "Best-model and deployment pack are revised together",
    detail: "The notebook, comparison CSV, report, plots and deployment artifacts change in the selection milestone. A later 100% result is excluded here because test data monitored epoch selection.",
    projectSlug: "microrobot-vision",
  },
  {
    id: "vision-report-final",
    date: "20 DEC 2025",
    sortableDate: "2025-12-20",
    commit: "0133d9b",
    family: "Vision",
    kind: "release",
    title: "Final report and architecture revision",
    detail: "Final ResNet outputs, the roll–pitch grid, deployment notes and model documentation are revised. Internally conflicting final regression RMSE values remain quarantined.",
    projectSlug: "microrobot-vision",
  },
  {
    id: "vision-head",
    date: "20 DEC 2025",
    sortableDate: "2025-12-20T12:00:00",
    commit: "19dacbe",
    family: "Vision",
    kind: "drift",
    title: "Audited head closes with loader and checkpoint caveats",
    detail: "The last audited change updates the deployment loader. Weight files seen during the local audit are Git-ignored at this head; SimpleCNN keys also predate later skip-layer definitions.",
    projectSlug: "microrobot-vision",
  },
  {
    id: "cfd-unet",
    date: "27 JAN — 02 FEB 2026",
    sortableDate: "2026-01-27",
    commit: "30b396e → 1d745a8",
    family: "CFD",
    kind: "run",
    title: "Grid U-Net scaffold becomes an executed surrogate",
    detail: "Mesh-to-grid preprocessing and a four-level U-Net are completed and run for 100 epochs. Its 1.2823 relative-L2 result belongs to a distinct shifted 20-file evaluation split and is not ranked against the FNO or graph runs.",
    projectSlug: "neural-cfd-surrogates",
  },
  {
    id: "cfd-gnn",
    date: "16 FEB — 02 MAR 2026",
    sortableDate: "2026-02-16",
    commit: "452cb32 → 4833a1a",
    family: "CFD",
    kind: "drift",
    title: "MeshGraphNet is completed, trained, then code drifts",
    detail: "The starter scaffold gains node/edge encoders, ten residual processors and autoregressive inference. The local ignored checkpoint predates the ELU source revision and matches the same tensor topology; activations are not encoded in a state dictionary.",
    projectSlug: "neural-cfd-surrogates",
  },
  {
    id: "cfd-fno-baseline",
    date: "02 — 04 MAR 2026",
    sortableDate: "2026-03-02",
    commit: "9e61840 → b1262f9",
    family: "CFD",
    kind: "drift",
    title: "FNO baseline runs before architecture and weight drift",
    detail: "An executed three-block, three-input notebook records 0.0163 relative L2. The locally present ignored checkpoint instead encodes a four-block, six-input model, so output and weights are deliberately shown as separate milestones.",
    projectSlug: "neural-cfd-surrogates",
  },
  {
    id: "cfd-fno-branches",
    date: "04 — 06 MAR 2026",
    sortableDate: "2026-03-04",
    commit: "0eafa68 → 2cacadc",
    family: "CFD",
    kind: "run",
    title: "Residual, physics and multi-scale FNO branches expand",
    detail: "Later commits add a 33.205M-parameter executed notebook plus physics, lightweight and multi-scale experiments. Matching weights are absent for the largest run, so execution output—not reproducible deployment—is the evidence level.",
    projectSlug: "neural-cfd-surrogates",
  },
  {
    id: "mri-snapshot",
    date: "03 APR 2026",
    sortableDate: "2026-04-03",
    commit: "93bc9cd",
    family: "MRI",
    kind: "snapshot",
    title: "Pinned public head consolidates reconstruction and trust pipeline",
    detail: "The pinned head contains the residual ReconUNet, three soft data-consistency scalars, MC-dropout and ensemble evaluation logic plus the final report configuration. This view retains one audited head milestone from a visible 22-commit public history; no weights are bundled, and no finer chronology is presented here.",
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
    origin: "ImageNet backbone; fresh one-channel stem and authored head",
    artifact: "Local ignored state dictionary · not tracked at audited head",
    note: "A compact transfer-learning branch; the torchvision backbone is not claimed as an authored architecture.",
    projectSlug: "microrobot-vision",
  },
  {
    id: "simplecnn-cls",
    family: "Vision",
    name: "SimpleCNN · current classification definition",
    parameters: 4_154_856,
    role: "40-class pose classifier",
    origin: "Source-authored residual CNN trained from scratch",
    artifact: "Definition/checkpoint drift; local ignored checkpoint has fewer keys",
    note: "The current design has four residual additions: two projected skips and two identity additions. The local state dictionary predates the two later parameterised projection layers.",
    projectSlug: "microrobot-vision",
  },
  {
    id: "resnet18-cls",
    family: "Vision",
    name: "ResNet18 · classification",
    parameters: 11_190_760,
    role: "40-class pose classifier",
    origin: "ImageNet backbone; fresh grayscale stem and authored head",
    artifact: "Executed notebook output · named weight file absent",
    note: "The parameter total comes from executed output; the implementation fine-tunes a pretrained backbone.",
    projectSlug: "microrobot-vision",
  },
  {
    id: "resnet34-cls",
    family: "Vision",
    name: "ResNet34 · classification",
    parameters: 21_298_920,
    role: "40-class pose classifier",
    origin: "ImageNet backbone; fresh grayscale stem and authored head",
    artifact: "Local ignored state dictionary · not tracked at audited head",
    note: "The notebook replaces the pretrained first convolution outright; RGB averaging is absent.",
    projectSlug: "microrobot-vision",
  },
  {
    id: "vit-cls",
    family: "Vision",
    name: "ViT-B/16 · classification",
    parameters: 85_435_432,
    role: "40-class pose classifier",
    origin: "ImageNet backbone; RGB-averaged patch adapter and authored head",
    artifact: "Executed notebook output · named weight file absent",
    note: "The largest vision configuration in this audit; parameter count is scale, not evidence of better generalisation.",
    projectSlug: "microrobot-vision",
  },
  {
    id: "meshgraphnet",
    family: "CFD",
    name: "MeshGraphNet · 10 processors",
    parameters: 8_323,
    role: "Native-mesh autoregressive flow surrogate",
    origin: "Course/starter scaffold completed and adapted locally",
    artifact: "Local ignored checkpoint predates ELU revision; activation inferred from chronology",
    note: "Node 7→10 and edge 3→10 encoders feed ten residual message-passing blocks and a 10→3 decoder. ReLU is supported by the contemporaneous source, not encoded in the state dictionary.",
    projectSlug: "neural-cfd-surrogates",
  },
  {
    id: "fno-executed",
    family: "CFD",
    name: "FNO · executed three-block baseline",
    parameters: 3_990_575,
    role: "3-D spectral flow surrogate",
    origin: "Starter-scaffold implementation with authored training work",
    artifact: "Executed notebook output; loose local weights encode another topology",
    note: "Input fields are lifted 3→36 before three spectral/pointwise blocks and a 36→128→3 head.",
    projectSlug: "neural-cfd-surrogates",
  },
  {
    id: "fno-local-checkpoint",
    family: "CFD",
    name: "FNO · locally audited four-block checkpoint",
    parameters: 5_327_471,
    role: "Six-input 3-D spectral flow surrogate",
    origin: "Authored feature and residual adaptation",
    artifact: "Compatible local checkpoint, Git-ignored and untracked at head",
    note: "Six channels combine u/v/p with x/y and obstacle distance; four width-36 spectral blocks use 8×8×4 modes.",
    projectSlug: "neural-cfd-surrogates",
  },
  {
    id: "fno-improved",
    family: "CFD",
    name: "FNO · later executed residual experiment",
    parameters: 33_204_920,
    role: "Five-block residual spectral surrogate",
    origin: "Authored feature, normalization and residual experiments",
    artifact: "Executed output present; matching weights absent",
    note: "Executed-notebook count: five width-48 blocks with 12×12×5 modes plus an unused 21-parameter skip projection. The later standalone trainer removes that layer and instantiates 33,204,899 parameters.",
    projectSlug: "neural-cfd-surrogates",
  },
  {
    id: "cfd-unet",
    family: "CFD",
    name: "Grid U-Net · four-level surrogate",
    parameters: 50_542_531,
    role: "3×80×320 grid-to-grid flow surrogate",
    origin: "Course skeleton completed and adapted locally",
    artifact: "Executed output and local ignored checkpoint",
    note: "Strided-convolution encoder 64→128→256→512→1024 with four transposed-convolution skip stages; not max pooling.",
    projectSlug: "neural-cfd-surrogates",
  },
  {
    id: "mri-segmentation",
    family: "MRI",
    name: "Segmentation U-Net · frozen evaluator",
    parameters: 1_923_848,
    role: "Eight-class downstream evaluator",
    origin: "Separate evaluation model; not the reconstruction network",
    artifact: "Definition/report evidence; weights not bundled here",
    note: "This frozen network measures downstream segmentation behavior and must not be conflated with the main reconstructor.",
    projectSlug: "trustworthy-mri-reconstruction",
  },
  {
    id: "mri-recon",
    family: "MRI",
    name: "ReconUNet · final report configuration",
    parameters: 7_756_580,
    role: "Residual 256×256 MRI reconstructor",
    origin: "Source-authored architecture trained from scratch",
    artifact: "Repository/report aggregates; weights not bundled or reproduced here",
    note: "Base width 32, symmetric 32→64→128→256→512 path and three sequential learnable soft data-consistency scalars.",
    projectSlug: "trustworthy-mri-reconstruction",
  },
] satisfies ModelConfig[]).sort((left, right) => left.parameters - right.parameters);

const MIN_LOG = 3;
const MAX_LOG = 8;
const SCALE_TICKS = [10_000, 100_000, 1_000_000, 10_000_000, 100_000_000];
const TOTAL_REPOSITORIES = Object.values(FAMILY_META).reduce(
  (total, item) => total + item.repositoryCount,
  0,
);

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
    <section className={styles.lineage} aria-label="Model experiment lineage">
      <header className={styles.header}>
        <div>
          <span>PRIVATE + PUBLIC SOURCE AUDIT · DEC 2025—APR 2026</span>
          <h3>Model Lineage Observatory</h3>
          <p>One chronology across vision, CFD and MRI work—separating design, execution, local-only artifacts and drift before comparing architecture scale.</p>
        </div>
        <dl aria-label="Model lineage summary">
          <div><dt>Repositories</dt><dd>{TOTAL_REPOSITORIES}</dd></div>
          <div><dt>Milestones</dt><dd>{MILESTONES.length}</dd></div>
          <div><dt>Configurations</dt><dd>{CONFIGS.length}</dd></div>
          <div><dt>Parameter span</dt><dd>8.3K—85.4M</dd></div>
        </dl>
      </header>

      <div className={styles.controls}>
        <div className={styles.viewSwitch} role="group" aria-label="Model lineage view">
          {([
            ["history", "01", "Git history"],
            ["scale", "02", "Parameter scale"],
            ["contract", "03", "Evidence contract"],
          ] as const).map(([id, number, label]) => (
            <button key={id} type="button" aria-pressed={view === id} onClick={() => setView(id)}>
              <span>{number}</span><strong>{label}</strong>
            </button>
          ))}
        </div>
        <div className={styles.familySwitch} role="group" aria-label="Filter model family">
          <span>FAMILY</span>
          {(["All", "Vision", "CFD", "MRI"] as const).map((item) => (
            <button key={item} type="button" aria-pressed={family === item} onClick={() => chooseFamily(item)}>{item}</button>
          ))}
        </div>
      </div>

      {view === "history" && (
        <div className={styles.historyWorkspace}>
          <section className={styles.historyPanel}>
            <div className={styles.panelHeading}>
              <div><span>ORDERED EVENT LOG</span><strong>Sanitised Git chronology</strong></div>
              <label><span>Evidence</span><ClassicSelect value={kind} onChange={(event) => setKind(event.target.value as EvidenceKind | "all")}><option value="all">All evidence types</option>{Object.entries(KIND_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</ClassicSelect></label>
            </div>
            <p className={styles.chartNote}>Dates and short hashes are source-audited. Raw commit messages are intentionally replaced with descriptive labels; intervals do not imply equal effort.</p>
            <ol className={styles.timeline}>
              {milestones.map((item) => (
                <li key={item.id} style={familyStyle(item.family)}>
                  <button type="button" aria-pressed={selectedMilestone?.id === item.id} onClick={() => setSelectedMilestoneId(item.id)}>
                    <span className={styles.eventDate}><time dateTime={item.sortableDate.slice(0, 10)}>{item.date}</time><code>{item.commit}</code></span>
                    <span className={styles.eventRail} aria-hidden="true"><i /></span>
                    <span className={styles.eventCopy}><small>{item.family} · {KIND_LABELS[item.kind]}</small><strong>{item.title}</strong><em>{item.detail}</em></span>
                  </button>
                </li>
              ))}
              {!milestones.length && <li className={styles.empty}><strong>No matching milestones</strong><span>Change the family or evidence filter; the underlying audit remains unchanged.</span></li>}
            </ol>
          </section>

          {selectedMilestone ? (
            <aside className={styles.inspector} style={familyStyle(selectedMilestone.family)} aria-live="polite">
              <div className={styles.inspectorTop}><span>SELECTED MILESTONE</span><b>{KIND_LABELS[selectedMilestone.kind]}</b></div>
              <small>{selectedMilestone.family} · {selectedMilestone.date}</small>
              <h4>{selectedMilestone.title}</h4>
              <code>{selectedMilestone.commit}</code>
              <p>{selectedMilestone.detail}</p>
              <dl>
                <div><dt>Family</dt><dd>{FAMILY_META[selectedMilestone.family].label}</dd></div>
                <div><dt>Evidence</dt><dd>{KIND_LABELS[selectedMilestone.kind]}</dd></div>
                <div><dt>Source access</dt><dd>{selectedMilestone.family === "MRI" ? "Public · no licence" : "Private · no source action"}</dd></div>
              </dl>
              <button type="button" onClick={() => onSelectProject(selectedMilestone.projectSlug)}>Open project architecture <span aria-hidden="true">›</span></button>
            </aside>
          ) : (
            <aside className={`${styles.inspector} ${styles.emptyInspector}`} aria-live="polite">
              <div className={styles.inspectorTop}><span>FILTERED VIEW</span><b>0 MATCHES</b></div>
              <h4>No milestone selected</h4>
              <p>This family has no milestone with the chosen evidence type. Change either filter to inspect an event tied to a source artifact.</p>
            </aside>
          )}
        </div>
      )}

      {view === "scale" && (
        <div className={styles.scaleWorkspace}>
          <section className={styles.scalePanel} aria-labelledby="parameter-scale-title">
            <div className={styles.panelHeading}><div><span>LOG₁₀ AXIS · EXACT COUNTS</span><strong id="parameter-scale-title">Trainable parameter scale</strong></div><output>{configs.length} configurations</output></div>
            <p className={styles.chartNote}>Architecture size spans four orders of magnitude, so the bar position uses a labelled logarithmic axis. Parameters are not a quality, originality or performance score.</p>
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
            <div className={styles.inspectorTop}><span>SELECTED CONFIGURATION</span><b>{selectedConfig.family}</b></div>
            <small>{selectedConfig.role}</small>
            <h4>{selectedConfig.name}</h4>
            <strong className={styles.parameterValue}>{formatParameters(selectedConfig.parameters)} <span>trainable parameters</span></strong>
            <dl>
              <div><dt>Origin</dt><dd>{selectedConfig.origin}</dd></div>
              <div><dt>Artifact</dt><dd>{selectedConfig.artifact}</dd></div>
            </dl>
            <p>{selectedConfig.note}</p>
            <button type="button" onClick={() => onSelectProject(selectedConfig.projectSlug)}>Open exact architecture <span aria-hidden="true">›</span></button>
          </aside>
        </div>
      )}

      {view === "contract" && (
        <div className={styles.contractView}>
          <section className={styles.boundaryHero}>
            <div><span>WHAT THIS VIEW ANSWERS</span><strong>How did the implementation evidence evolve?</strong><p>It links model design, data corrections, executed runs, selections and known artifact drift to dated repository states.</p></div>
            <div><span>WHAT IT DOES NOT ANSWER</span><strong>Which model is universally “best”?</strong><p>Tasks, splits and selection procedures differ. No accuracy, RMSE or relative-L2 result is ranked across projects.</p></div>
          </section>

          <section className={styles.sourceTable}>
            <div className={styles.panelHeading}><div><span>5 REPOSITORIES · 3 PROJECT FILES</span><strong>Source and publication boundary</strong></div></div>
            <div role="region" tabIndex={0} aria-label="Scrollable model lineage source table">
              <table>
                <caption>Repository families, source visibility and evidence limits</caption>
                <thead><tr><th scope="col">Family</th><th scope="col">Repositories</th><th scope="col">Visibility</th><th scope="col">Retained evidence</th><th scope="col">Public boundary</th></tr></thead>
                <tbody>
                  <tr><th scope="row">Microrobot vision</th><td>IX-DeepLearning</td><td>Private · no explicit licence</td><td>Git history, notebook output, report, local ignored weights</td><td>No source, frame, report or weight is redistributed</td></tr>
                  <tr><th scope="row">Neural CFD</th><td>FNO + GNN + U-Net</td><td>Private · no explicit licences</td><td>Git histories, executed outputs, local ignored checkpoints</td><td>No private repository or weight action is exposed</td></tr>
                  <tr><th scope="row">MRI reconstruction</th><td>IX-Medical-Imaging</td><td>Public · no explicit licence</td><td>Public history, definitions and report aggregates</td><td>Pinned source is linked in its project; no data or weights bundled</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <div className={styles.definitionGrid}>
            <section><span>01 · AUTHORED</span><strong>Project-specific implementation</strong><p>An architecture, adapter, head or experiment branch is present locally; dependency backbones stay attributed.</p></section>
            <section><span>02 · EXECUTED</span><strong>Output supports the run</strong><p>Notebook or report output exists, but that does not imply a matching deployable checkpoint.</p></section>
            <section><span>03 · LOCAL ARTIFACT</span><strong>Inspected, not tracked</strong><p>A local checkpoint can prove tensor keys and parameter count without being reproducible from repository HEAD.</p></section>
            <section><span>04 · DRIFT</span><strong>Artifacts diverge</strong><p>Code, checkpoint or prose differ; the mismatch remains visible throughout reconciliation.</p></section>
            <section><span>05 · SCALE</span><strong>Exact parameter lookup</strong><p>The logarithmic chart compares architecture magnitude only—not quality, effort, efficiency or originality.</p></section>
            <section><span>06 · PRIVACY</span><strong>Metadata reconstruction</strong><p>No training row, microscope frame, CFD array, MRI slice, checkpoint or private source is fetched by this view.</p></section>
          </div>
        </div>
      )}

      <footer className={styles.footer}>
        <span>{MILESTONES.length} dated milestones · {CONFIGS.length} exact configuration counts · {TOTAL_REPOSITORIES} audited repositories</span>
        <span>No fetch · no weights · no cross-task leaderboard</span>
      </footer>
    </section>
  );
}

export default ModelLineageMap;
