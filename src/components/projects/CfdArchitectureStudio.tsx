"use client";

import { useState } from "react";

import { DemoWindow } from "./DemoChrome";
import styles from "./CfdArchitectureStudio.module.css";

type ModelId = "fno" | "gnn" | "unet";
type ViewMode = "diagram" | "table";
type EvidenceTone = "authored" | "scaffold" | "trained" | "drift" | "boundary";
type FnoVariantId = "baseline" | "checkpoint" | "improved" | "multiscale";
type FnoPhase = "spatial" | "fft" | "weights" | "inverse";

type EvidenceBadge = {
  label: string;
  tone: EvidenceTone;
};

type FnoVariant = {
  id: FnoVariantId;
  shortName: string;
  name: string;
  source: string;
  pairing: string;
  input: string;
  width: string;
  modes: string;
  blocks: string;
  head: string;
  parameters: string;
  result: string;
  note: string;
  badges: EvidenceBadge[];
};

type ArchitectureRow = {
  stage: string;
  contract: string;
  shape: string;
  evidence: string;
};

const MODEL_TABS: ReadonlyArray<{ id: ModelId; label: string; subtitle: string }> = [
  { id: "fno", label: "Fourier operator", subtitle: "spatial ⇄ spectral" },
  { id: "gnn", label: "MeshGraphNet", subtitle: "native mesh messages" },
  { id: "unet", label: "U-Net", subtitle: "raster encoder–decoder" },
];

const FNO_VARIANTS: Record<FnoVariantId, FnoVariant> = {
  baseline: {
    id: "baseline",
    shortName: "Executed baseline",
    name: "Three-block FNO3d",
    source: "solution2_executed.ipynb",
    pairing: "Tracked notebook definition + preserved execution output; weights are not tracked at HEAD",
    input: "3 physical channels",
    width: "36",
    modes: "8 × 8 × 4",
    blocks: "3 spectral + pointwise blocks",
    head: "36 → 128 → 3",
    parameters: "3,990,575",
    result: "relative L2 0.0163 · test-labelled split also used for training-time checks",
    note: "This result belongs to the three-block notebook definition. Its test-labelled loader was also used for periodic evaluation while training, so it is not presented as a final-only evaluation set. The result is not reassigned to the ignored loose root checkpoint now present locally.",
    badges: [
      { label: "SCAFFOLD COMPLETED", tone: "scaffold" },
      { label: "TRAINED / EXECUTED", tone: "trained" },
    ],
  },
  checkpoint: {
    id: "checkpoint",
    shortName: "Loose checkpoint",
    name: "Four-block enhanced FNO3d",
    source: "Local best_model.pth + epoch_20.pth state dictionaries (Git-ignored)",
    pairing: "Local ignored tensor-key audit; no .pth is tracked at HEAD and no compatible metric output is paired",
    input: "6 features in fc0",
    width: "36",
    modes: "8 × 8 × 4",
    blocks: "4 spectral + pointwise + LayerNorm blocks",
    head: "36 → 128 → 64 → 3",
    parameters: "5,327,471 derived from stored tensor shapes",
    result: "no result claimed",
    note: "The stored keys include spec_convs.0…3, pointwise_convs.0…3, layer_norms.0…3 and fc3. They cannot load into the executed three-block class without a matching definition.",
    badges: [
      { label: "LOCAL IGNORED WEIGHT", tone: "trained" },
      { label: "CODE DRIFT", tone: "drift" },
    ],
  },
  improved: {
    id: "improved",
    shortName: "Later experiment",
    name: "Five-block residual FNO3d",
    source: "solution.ipynb + train_improved.py",
    pairing: "Tracked five-block code + its executed notebook output; local weights are Git-ignored",
    input: "6 = 3 physics + 3 auxiliary",
    width: "48",
    modes: "12 × 12 × 5",
    blocks: "5 spectral + pointwise + LayerNorm blocks",
    head: "48 → 128 → 64 → 3",
    parameters: "33,204,920 in the executed notebook · 33,204,899 in the later trainer",
    result: "relative L2 0.002549 · test-labelled split used for validation and best-weight selection",
    note: "The executed notebook retains an unused 6→3 skip projection (21 trainable parameters); train_improved.py removes it and reuses the first three input channels directly. The reported run belongs to the 33,204,920-parameter notebook definition. Its test-labelled loader supplied both checkpoint selection and the reported relative L2, so this is not final-only evaluation evidence and is not ranked against GNN or U-Net.",
    badges: [
      { label: "AUTHORED EXPERIMENT", tone: "authored" },
      { label: "TRAINED / EXECUTED", tone: "trained" },
    ],
  },
  multiscale: {
    id: "multiscale",
    shortName: "Branch design",
    name: "Multi-scale gradient FNO3d",
    source: "versions/v3_multiscale_gradient/train_v3.py",
    pairing: "Committed implementation; no version-local result bundle found",
    input: "3 fields + 3 grid coordinates",
    width: "32",
    modes: "(4,4,2) · (8,8,4) · (12,12,4)",
    blocks: "4 multi-scale spectral + 1×1 skip blocks",
    head: "32 → 128 → 64 → 3",
    parameters: "not asserted from README estimate",
    result: "code-defined experiment · no metric claimed",
    note: "Each block fans out across three Fourier resolutions, fuses them, adds a 1×1 skip path and applies GroupNorm. The repository contains the training path, but no version-local checkpoint or log was found in the audited tree.",
    badges: [
      { label: "AUTHORED BRANCH", tone: "authored" },
      { label: "CODE PRESENT", tone: "scaffold" },
    ],
  },
};

const FNO_PHASES: ReadonlyArray<{ id: FnoPhase; label: string; explanation: string }> = [
  { id: "spatial", label: "1 · Spatial", explanation: "A real-valued field enters on a regular H × W × T grid; this panel is a topology schematic, not a saved prediction." },
  { id: "fft", label: "2 · rFFT", explanation: "rfftn transforms the final three axes. The last axis keeps N/2 + 1 entries because the input is real-valued." },
  { id: "weights", label: "3 · Modes", explanation: "Four learned complex tensors operate on signed x/y corners and the retained positive z/time slice." },
  { id: "inverse", label: "4 · Inverse", explanation: "irfftn returns to the original spatial dimensions before the pointwise path and projection head produce three fields." },
];

const QUADRANTS = [
  { label: "W1 · +x / +y", slice: "[:m1, :m2, :m3]" },
  { label: "W2 · −x / +y", slice: "[-m1:, :m2, :m3]" },
  { label: "W3 · +x / −y", slice: "[:m1, -m2:, :m3]" },
  { label: "W4 · −x / −y", slice: "[-m1:, -m2:, :m3]" },
] as const;

const UNET_SKIPS = [
  {
    id: 0,
    encoder: "Stem",
    encoderShape: "64 × 80 × 320",
    decoder: "Decoder 4",
    decoderShape: "64 × 80 × 320",
    detail: "The untouched stem feature is concatenated after the final 128→64 transposed-convolution output, then reduced from 128 to 64 channels by a 3×3 convolution.",
  },
  {
    id: 1,
    encoder: "Encoder 1",
    encoderShape: "128 × 40 × 160",
    decoder: "Decoder 3",
    decoderShape: "128 × 40 × 160",
    detail: "The first downsampled feature is concatenated with the 256→128 transposed-convolution output; the following 3×3 convolution maps 256 channels to 128.",
  },
  {
    id: 2,
    encoder: "Encoder 2",
    encoderShape: "256 × 20 × 80",
    decoder: "Decoder 2",
    decoderShape: "256 × 20 × 80",
    detail: "The second encoder feature crosses the U at 20 × 80; concatenation temporarily forms 512 channels before the decoder convolution restores 256.",
  },
  {
    id: 3,
    encoder: "Encoder 3",
    encoderShape: "512 × 10 × 40",
    decoder: "Decoder 1",
    decoderShape: "512 × 10 × 40",
    detail: "The deepest stored skip joins the first 1024→512 transposed-convolution output and is reduced from 1,024 concatenated channels to 512.",
  },
] as const;

const TIMELINE = [
  {
    date: "27 JAN — 02 FEB 2026",
    commits: "30b396e → 1d745a8",
    model: "U-Net",
    title: "Grid pipeline, encoder–decoder and execution record",
    detail: "The repository moves from its first saved state through mesh-to-grid preprocessing, a four-level adapted U-Net, recorded checkpoint-save output and the shifted validation diagnosis. Local .pth files are Git-ignored and none is tracked at HEAD.",
    badges: [
      { label: "SCAFFOLD ADAPTED", tone: "scaffold" as const },
      { label: "TRAINED", tone: "trained" as const },
    ],
  },
  {
    date: "16 FEB — 02 MAR 2026",
    commits: "452cb32 → 4833a1a",
    model: "MeshGraphNet",
    title: "Native-mesh message passing completed and run",
    detail: "The starter notebook is completed with feature construction, residual edge/node processors, autoregressive inference and recorded epoch-100 execution. The local checkpoint is Git-ignored and no .pth is tracked at HEAD.",
    badges: [
      { label: "SCAFFOLD COMPLETED", tone: "scaffold" as const },
      { label: "TRAINED", tone: "trained" as const },
    ],
  },
  {
    date: "02 — 04 MAR 2026",
    commits: "9e61840 → b1262f9",
    model: "FNO",
    title: "Baseline execution, then architecture drift",
    detail: "The executed three-block notebook preserves a 0.0163 output on a test-labelled loader also used during training-time checks. Current local, Git-ignored root weights encode a different four-block, six-input model, so the artifacts remain deliberately unpaired; no .pth is tracked at HEAD.",
    badges: [
      { label: "TRAINED", tone: "trained" as const },
      { label: "CODE DRIFT", tone: "drift" as const },
    ],
  },
  {
    date: "06 MAR 2026",
    commits: "d713c61 → 2cacadc",
    model: "FNO",
    title: "Residual, physics, lightweight and multi-scale branches",
    detail: "Later commits add larger residual code and three focused experiment directories. This timeline records their design contracts without promoting README estimates or unpaired outputs to benchmark results.",
    badges: [
      { label: "AUTHORED EXPERIMENTS", tone: "authored" as const },
      { label: "PAIRING AUDITED", tone: "boundary" as const },
    ],
  },
] as const;

const EVIDENCE_DEFINITIONS: ReadonlyArray<{ badge: EvidenceBadge; definition: string }> = [
  { badge: { label: "AUTHORED", tone: "authored" }, definition: "A project-specific implementation or experiment branch is present in the audited repository." },
  { badge: { label: "SCAFFOLD", tone: "scaffold" }, definition: "Course starter structure remains; completion or adaptation is described without claiming the entire scaffold as original." },
  { badge: { label: "TRAINED", tone: "trained" }, definition: "Execution output or a compatible checkpoint supports the claim shown beside it." },
  { badge: { label: "CODE DRIFT", tone: "drift" }, definition: "Current code, checkpoint keys or recorded output do not form one load-compatible artifact pair." },
];

function badgeClass(tone: EvidenceTone) {
  if (tone === "authored") return styles.badgeAuthored;
  if (tone === "scaffold") return styles.badgeScaffold;
  if (tone === "trained") return styles.badgeTrained;
  if (tone === "drift") return styles.badgeDrift;
  return styles.badgeBoundary;
}

function Badge({ badge }: { badge: EvidenceBadge }) {
  return <span className={`${styles.badge} ${badgeClass(badge.tone)}`}>{badge.label}</span>;
}

function BadgeRow({ badges }: { badges: readonly EvidenceBadge[] }) {
  return <div className={styles.badgeRow}>{badges.map((badge) => <Badge key={`${badge.tone}-${badge.label}`} badge={badge} />)}</div>;
}

function ArchitectureTable({ caption, rows }: { caption: string; rows: readonly ArchitectureRow[] }) {
  return (
    <div className={styles.tableScroller} tabIndex={0} role="region" aria-label={`${caption} architecture table`}>
      <table className={styles.architectureTable}>
        <caption>{caption}</caption>
        <thead>
          <tr><th scope="col">Stage</th><th scope="col">Operation contract</th><th scope="col">Shape / width</th><th scope="col">Evidence</th></tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.stage}>
              <th scope="row">{row.stage}</th>
              <td>{row.contract}</td>
              <td><code>{row.shape}</code></td>
              <td>{row.evidence}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function fnoRows(variant: FnoVariant): ArchitectureRow[] {
  const blockContract = variant.id === "multiscale"
    ? "Three SpectralConv3d scales → concatenate/fuse + Conv3d 1×1 skip → GroupNorm"
    : variant.id === "improved"
      ? "SpectralConv3d + pointwise Conv1d → LayerNorm; GELU between blocks; residual every second block"
      : variant.id === "checkpoint"
        ? "Stored keys: SpectralConv3d + pointwise Conv1d + LayerNorm"
        : "SpectralConv3d + pointwise Conv1d; ReLU after the first two blocks";
  return [
    { stage: "Input", contract: variant.input, shape: variant.input, evidence: variant.source },
    { stage: "Lift", contract: "Linear projection on the channel axis", shape: `width ${variant.width}`, evidence: variant.id === "checkpoint" ? "fc0 tensor shape" : "declared layer" },
    { stage: "Operator blocks", contract: blockContract, shape: `${variant.blocks} · modes ${variant.modes}`, evidence: variant.id === "checkpoint" ? "stored parameter keys" : "source definition" },
    { stage: "Projection", contract: "Per-location linear head", shape: variant.head, evidence: variant.id === "checkpoint" ? "fc1/fc2/fc3 tensor shapes" : "source definition" },
    { stage: "Result boundary", contract: variant.result, shape: variant.parameters, evidence: variant.pairing },
  ];
}

function FnoSpectrum({ phase, quadrant }: { phase: FnoPhase; quadrant: number }) {
  const phaseRecord = FNO_PHASES.find((item) => item.id === phase) ?? FNO_PHASES[0];
  const cells = Array.from({ length: 96 }, (_, index) => {
    const col = index % 12;
    const row = Math.floor(index / 12);
    const corner = row < 3 ? (col < 3 ? 0 : col > 8 ? 1 : -1) : row > 4 ? (col < 3 ? 2 : col > 8 ? 3 : -1) : -1;
    return { index, col, row, corner };
  });

  return (
    <figure className={styles.spectrumFigure}>
      <svg viewBox="0 0 560 250" role="img" aria-labelledby="fno-spectrum-title fno-spectrum-desc">
        <title id="fno-spectrum-title">FNO spatial and spectral operation diagram</title>
        <desc id="fno-spectrum-desc">{phaseRecord.explanation} The index cells show retained Fourier regions only and do not encode learned coefficient values.</desc>
        <g className={phase === "spatial" || phase === "inverse" ? styles.svgActive : styles.svgMuted}>
          <rect className={styles.spatialPlate} x="20" y="40" width="164" height="164" />
          {Array.from({ length: 7 }, (_, index) => <line key={`v-${index}`} x1={40 + index * 21} x2={40 + index * 21} y1="49" y2="195" />)}
          {Array.from({ length: 7 }, (_, index) => <line key={`h-${index}`} x1="29" x2="175" y1={60 + index * 21} y2={60 + index * 21} />)}
          <circle cx="77" cy="122" r="18" />
          <path d="M95 91 C125 70 145 86 171 82 M95 114 C127 101 145 111 174 106 M95 137 C130 148 148 134 174 141 M95 160 C125 181 148 161 171 168" />
          <text x="102" y="221">H × W × T · real field</text>
        </g>
        <path className={styles.transformArrow} d="M197 122 H239" />
        <path className={styles.transformArrowHead} d="m232 114 9 8-9 8" />
        <text className={styles.transformLabel} x="202" y="108">rFFT</text>
        <g className={phase === "fft" || phase === "weights" ? styles.svgActive : styles.svgMuted}>
          <rect className={styles.frequencyPlate} x="255" y="40" width="276" height="164" />
          {cells.map((cell) => (
            <rect
              key={cell.index}
              className={cell.corner < 0 ? styles.frequencyCell : cell.corner === quadrant ? styles.frequencyCellSelected : styles.frequencyCellRetained}
              x={267 + cell.col * 21}
              y={48 + cell.row * 18}
              width="17"
              height="14"
            />
          ))}
          <line className={styles.frequencyAxis} x1="393" x2="393" y1="46" y2="196" />
          <line className={styles.frequencyAxis} x1="262" x2="524" y1="121" y2="121" />
          <text x="265" y="221">index map · four signed x/y corners · low z slice</text>
          <text x="509" y="116">+x</text>
          <text x="257" y="116">−x</text>
          <text x="398" y="57">+y</text>
          <text x="398" y="194">−y</text>
        </g>
      </svg>
      <figcaption>
        <strong>{phaseRecord.label}</strong>
        <span>{phaseRecord.explanation}</span>
        <em>Index topology only — cell fill is not a coefficient magnitude, prediction or activation.</em>
      </figcaption>
    </figure>
  );
}

function FnoStudio({ viewMode }: { viewMode: ViewMode }) {
  const [variantId, setVariantId] = useState<FnoVariantId>("baseline");
  const [phase, setPhase] = useState<FnoPhase>("weights");
  const [quadrant, setQuadrant] = useState(0);
  const variant = FNO_VARIANTS[variantId];

  return (
    <section className={styles.modelWorkspace} aria-labelledby="fno-heading">
      <div className={styles.sectionHeading}>
        <div><span>MODEL FAMILY 01</span><h3 id="fno-heading">Fourier Neural Operator · artifact pairing lab</h3></div>
        <BadgeRow badges={variant.badges} />
      </div>

      <div className={styles.variantStrip} role="group" aria-label="Choose an FNO artifact variant">
        {(Object.values(FNO_VARIANTS) as FnoVariant[]).map((item) => (
          <button type="button" key={item.id} aria-pressed={variantId === item.id} onClick={() => setVariantId(item.id)}>
            <span>{item.shortName}</span><strong>{item.name}</strong><small>{item.blocks}</small>
          </button>
        ))}
      </div>

      <div className={styles.artifactPairing}>
        <div><span>SOURCE ARTIFACT</span><strong>{variant.source}</strong></div>
        <div><span>PAIRING STATUS</span><strong>{variant.pairing}</strong></div>
        <div><span>RESULT CONTRACT</span><strong>{variant.result}</strong></div>
      </div>

      {viewMode === "diagram" ? (
        <>
          <div className={styles.pipeline} aria-label={`${variant.name} architecture pipeline`}>
            <article><span>01 · INPUT</span><strong>{variant.input}</strong><small>channel-last field tensor</small></article>
            <i aria-hidden="true">→</i>
            <article><span>02 · LIFT</span><strong>Linear → width {variant.width}</strong><small>per grid location</small></article>
            <i aria-hidden="true">→</i>
            <article><span>03 · OPERATOR</span><strong>{variant.blocks}</strong><small>modes {variant.modes}</small></article>
            <i aria-hidden="true">→</i>
            <article><span>04 · HEAD</span><strong>{variant.head}</strong><small>three output fields</small></article>
          </div>

          <div className={styles.fnoInspector}>
            <aside className={styles.inspectorControls}>
              <div className={styles.controlLabel}><span>DOMAIN WALKTHROUGH</span><strong>Inspect one operation at a time</strong></div>
              <div className={styles.phaseButtons} role="group" aria-label="Select Fourier operation phase">
                {FNO_PHASES.map((item) => <button type="button" key={item.id} aria-pressed={phase === item.id} onClick={() => setPhase(item.id)}>{item.label}</button>)}
              </div>
              <div className={styles.controlLabel}><span>FOURIER CORNER</span><strong>{QUADRANTS[quadrant].label}</strong></div>
              <div className={styles.quadrantButtons} role="group" aria-label="Select learned Fourier weight corner">
                {QUADRANTS.map((item, index) => (
                  <button type="button" key={item.label} aria-pressed={quadrant === index} onClick={() => { setQuadrant(index); setPhase("weights"); }}>
                    <span>{item.label}</span><code>{item.slice}</code>
                  </button>
                ))}
              </div>
              <p className={styles.liveExplanation} aria-live="polite"><strong>Selected:</strong> {QUADRANTS[quadrant].slice}. For {variant.modes}, the same signed-corner rule is applied at every declared spectral block{variant.id === "multiscale" ? " and at each of the three declared scales" : ""}.</p>
            </aside>
            <FnoSpectrum phase={phase} quadrant={quadrant} />
          </div>
        </>
      ) : <ArchitectureTable caption={`${variant.name} · exact source contract`} rows={fnoRows(variant)} />}

      <aside className={variant.id === "checkpoint" ? styles.driftNote : styles.methodNote} role="note">
        <strong>{variant.id === "checkpoint" ? "WHY THE RED BOUNDARY MATTERS" : "EVIDENCE NOTE"}</strong>
        <p>{variant.note}</p>
        <dl><div><dt>Parameters</dt><dd>{variant.parameters}</dd></div><div><dt>Comparison policy</dt><dd>No cross-split ranking</dd></div></dl>
      </aside>
    </section>
  );
}

function gnnRows(step: number): ArchitectureRow[] {
  return [
    { stage: "Raw node", contract: "[u, v, p] + wall/inlet/outlet/object masks", shape: "7 features per node", evidence: "forward() concatenation" },
    { stage: "Raw edge", contract: "2D positional difference + L2 norm", shape: "3 features per directed edge", evidence: "get_diff_and_norm()" },
    { stage: "Encoders", contract: "Linear → ReLU → Linear → LayerNorm", shape: "node 7→10 · edge 3→10", evidence: "MeshGraphNet.__init__" },
    { stage: `Processor ${step}`, contract: "Edge MLP([source,target,edge]) + edge; scatter-add; Node MLP([node,sum]) + node", shape: "latent width 10", evidence: "ProcessorLayer.message/aggregate/forward" },
    { stage: "Processor stack", contract: "Ten independently instantiated residual message-passing blocks", shape: "10 processors", evidence: "num_layers=10 + ModuleList loop" },
    { stage: "Decoder", contract: "Linear → ReLU → Linear; decoded delta + input field", shape: "10 → 10 → 3", evidence: "decoder and forward return" },
  ];
}

function GnnSchematic({ step }: { step: number }) {
  const nodes = [
    { x: 44, y: 68 }, { x: 116, y: 35 }, { x: 176, y: 80 },
    { x: 78, y: 139 }, { x: 157, y: 150 }, { x: 227, y: 116 },
  ];
  const edges = [[0, 1], [0, 3], [1, 2], [1, 3], [2, 4], [2, 5], [3, 4], [4, 5]] as const;
  return (
    <figure className={styles.gnnFigure}>
      <svg viewBox="0 0 560 220" role="img" aria-labelledby="gnn-title gnn-desc">
        <title id="gnn-title">MeshGraphNet message passing schematic at processor {step}</title>
        <desc id="gnn-desc">A small schematic graph explains residual edge and node updates. It is not the stored 2,051-node sample geometry.</desc>
        <g className={styles.meshSchematic}>
          {edges.map(([from, to], index) => <line key={index} x1={nodes[from].x} y1={nodes[from].y} x2={nodes[to].x} y2={nodes[to].y} />)}
          {nodes.map((node, index) => <g key={index}><circle cx={node.x} cy={node.y} r={index === 2 ? 10 : 7} /><text x={node.x} y={node.y + 3}>{index + 1}</text></g>)}
        </g>
        <path className={styles.gnnArrow} d="M255 108 H300" /><path className={styles.gnnArrowHead} d="m292 100 10 8-10 8" />
        <g className={styles.messageBlock}>
          <rect x="315" y="27" width="219" height="65" />
          <text className={styles.messageTitle} x="328" y="47">EDGE UPDATE · PROCESSOR {step}/10</text>
          <text x="328" y="68">MLP([xᵢ, xⱼ, eᵢⱼ]) + eᵢⱼ</text>
          <text x="328" y="82">30 → 10 → 10 · residual</text>
          <rect x="315" y="111" width="219" height="65" />
          <text className={styles.messageTitle} x="328" y="131">NODE UPDATE · SCATTER ADD</text>
          <text x="328" y="152">MLP([xᵢ, Σe′ᵢⱼ]) + xᵢ</text>
          <text x="328" y="166">20 → 10 → 10 · residual</text>
        </g>
        <text className={styles.schematicLabel} x="26" y="202">SCHEMATIC TOPOLOGY · NOT SAMPLE COORDINATES</text>
      </svg>
      <figcaption>Every processor uses the same width-10 contract; the stepper exposes depth, not fabricated intermediate values.</figcaption>
    </figure>
  );
}

function GnnStudio({ viewMode }: { viewMode: ViewMode }) {
  const [step, setStep] = useState(1);
  const moveStep = (delta: number) => setStep((current) => Math.max(1, Math.min(10, current + delta)));
  return (
    <section className={styles.modelWorkspace} aria-labelledby="gnn-heading">
      <div className={styles.sectionHeading}>
        <div><span>MODEL FAMILY 02</span><h3 id="gnn-heading">MeshGraphNet · residual processor microscope</h3></div>
        <BadgeRow badges={[{ label: "SCAFFOLD COMPLETED", tone: "scaffold" }, { label: "TRAINED", tone: "trained" }]} />
      </div>

      <div className={styles.metricStrip}>
        <article><span>NODE INPUT</span><strong>7 → 10</strong><small>3 fields + 4 masks</small></article>
        <article><span>EDGE INPUT</span><strong>3 → 10</strong><small>Δx, Δy, ‖Δ‖₂</small></article>
        <article><span>PROCESSORS</span><strong>10</strong><small>residual edge + node updates</small></article>
        <article><span>PARAMETERS</span><strong>8,323</strong><small>executed model printout</small></article>
        <article><span>AUDITED SAMPLE</span><strong>2,051 nodes</strong><small>11,858 directed edge entries</small></article>
      </div>

      <div className={styles.processorControl}>
        <div><span>PROCESSOR DEPTH</span><strong>Inspecting block {step} of 10</strong></div>
        <button type="button" onClick={() => moveStep(-1)} disabled={step === 1} aria-label="Previous processor block">−</button>
        <input aria-label="Processor block" type="range" min="1" max="10" value={step} onChange={(event) => setStep(Number(event.target.value))} />
        <button type="button" onClick={() => moveStep(1)} disabled={step === 10} aria-label="Next processor block">+</button>
        <output aria-live="polite">{String(step).padStart(2, "0")} / 10</output>
      </div>

      <div className={styles.processorRail} aria-label="Ten processor blocks">
        {Array.from({ length: 10 }, (_, index) => (
          <button type="button" key={index} aria-pressed={step === index + 1} onClick={() => setStep(index + 1)}><span>{index + 1}</span><small>EDGE + NODE</small></button>
        ))}
      </div>

      {viewMode === "diagram" ? <GnnSchematic step={step} /> : <ArchitectureTable caption={`MeshGraphNet · processor ${step} selected`} rows={gnnRows(step)} />}

      <div className={styles.gnnLedger}>
        <article><span>EDGE RESIDUAL</span><code>updated_edges = edge_mlp([xᵢ, xⱼ, e]) + e</code><p>Edge messages concatenate source, target and current edge embeddings before the residual update.</p></article>
        <article><span>NODE RESIDUAL</span><code>updated_nodes = node_mlp([x, scatter_add(e′)]) + x</code><p>Directed messages are summed at nodes; the decoded three-field delta is finally added to the input field.</p></article>
        <article><span>RESULT BOUNDARY</span><strong>relative L2 0.0165</strong><p>Preserved 500-file test-labelled execution; the same loader was called during the training routine. The local epoch-100 weight is Git-ignored, no .pth is tracked at HEAD, and this result is never ranked against the shifted U-Net run.</p></article>
      </div>
    </section>
  );
}

function unetRows(selectedSkip: number): ArchitectureRow[] {
  return [
    { stage: "Input + stem", contract: "Conv2d 3→64, 3×3, stride 1, padding 1 → BatchNorm → LeakyReLU(0.2)", shape: "3×80×320 → 64×80×320", evidence: "notebook input_layer" },
    { stage: "Encoder 1", contract: "4×4 stride-2 Conv 64→128 → 3×3 Conv 128→128", shape: "128 × 40 × 160", evidence: selectedSkip === 1 ? "selected skip" : "declared loop" },
    { stage: "Encoder 2", contract: "4×4 stride-2 Conv 128→256 → 3×3 Conv 256→256", shape: "256 × 20 × 80", evidence: selectedSkip === 2 ? "selected skip" : "declared loop" },
    { stage: "Encoder 3", contract: "4×4 stride-2 Conv 256→512 → 3×3 Conv 512→512", shape: "512 × 10 × 40", evidence: selectedSkip === 3 ? "selected skip" : "declared loop" },
    { stage: "Encoder 4", contract: "4×4 stride-2 Conv 512→1024 → 3×3 Conv 1024→1024", shape: "1024 × 5 × 20", evidence: "declared loop" },
    { stage: "Bottleneck", contract: "3×3 Conv 1024→1024 → BatchNorm → LeakyReLU(0.2)", shape: "1024 × 5 × 20", evidence: "notebook bottleneck" },
    { stage: "Decoder 1", contract: "TransposeConv 1024→512 + concat skip → 3×3 Conv 1024→512", shape: "512 × 10 × 40", evidence: selectedSkip === 3 ? "selected skip destination" : "declared loop" },
    { stage: "Decoder 2", contract: "TransposeConv 512→256 + concat skip → 3×3 Conv 512→256", shape: "256 × 20 × 80", evidence: selectedSkip === 2 ? "selected skip destination" : "declared loop" },
    { stage: "Decoder 3", contract: "TransposeConv 256→128 + concat skip → 3×3 Conv 256→128", shape: "128 × 40 × 160", evidence: selectedSkip === 1 ? "selected skip destination" : "declared loop" },
    { stage: "Decoder 4", contract: "TransposeConv 128→64 + concat stem → 3×3 Conv 128→64", shape: "64 × 80 × 320", evidence: selectedSkip === 0 ? "selected skip destination" : "declared loop" },
    { stage: "Output", contract: "1×1 Conv2d 64→3", shape: "3 × 80 × 320", evidence: "executed validation output shape" },
  ];
}

function UnetStudio({ viewMode }: { viewMode: ViewMode }) {
  const [selectedSkip, setSelectedSkip] = useState(3);
  const skip = UNET_SKIPS[selectedSkip];
  return (
    <section className={styles.modelWorkspace} aria-labelledby="unet-heading">
      <div className={styles.sectionHeading}>
        <div><span>MODEL FAMILY 03</span><h3 id="unet-heading">U-Net · shape-checked skip-connection explorer</h3></div>
        <BadgeRow badges={[{ label: "SCAFFOLD ADAPTED", tone: "scaffold" }, { label: "TRAINED", tone: "trained" }]} />
      </div>

      <div className={styles.metricStrip}>
        <article><span>INPUT GRID</span><strong>3 × 80 × 320</strong><small>u · v · pressure</small></article>
        <article><span>DEPTH</span><strong>4 + bottleneck</strong><small>64 → 1,024 channels</small></article>
        <article><span>SKIPS</span><strong>4 concatenations</strong><small>click a bridge below</small></article>
        <article><span>PARAMETERS</span><strong>50,542,531</strong><small>exact declared model</small></article>
        <article><span>EVALUATION</span><strong>shifted split</strong><small>relative error 1.2823</small></article>
      </div>

      {viewMode === "diagram" ? (
        <div className={styles.unetWorkbench}>
          <div className={styles.unetInput}><span>INPUT</span><strong>3 × 80 × 320</strong><small>regular grid generated from mesh fields</small></div>
          <div className={styles.unetDiagram}>
            {UNET_SKIPS.map((item) => (
              <div className={`${styles.skipRow} ${selectedSkip === item.id ? styles.skipRowSelected : ""}`} key={item.id}>
                <article><span>{item.encoder}</span><strong>{item.encoderShape}</strong><small>{item.id === 0 ? "3×3 stem" : "4×4 ↓2 then 3×3"}</small></article>
                <button type="button" aria-pressed={selectedSkip === item.id} onClick={() => setSelectedSkip(item.id)} aria-label={`Highlight skip ${item.id + 1}: ${item.encoder} to ${item.decoder}`}>
                  <i aria-hidden="true" /><span>SKIP {item.id + 1}</span><i aria-hidden="true" />
                </button>
                <article><span>{item.decoder}</span><strong>{item.decoderShape}</strong><small>transpose 4×4 ↑2 · concat · 3×3</small></article>
              </div>
            ))}
            <div className={styles.unetBottleneck}><span>ENCODER 4 → BOTTLENECK → DECODER 1</span><strong>1,024 × 5 × 20</strong><small>3×3 convolution at maximum channel depth</small></div>
          </div>
          <div className={styles.unetOutput}><span>OUTPUT</span><strong>3 × 80 × 320</strong><small>final 1×1 convolution</small></div>
          <aside className={styles.skipInspector} aria-live="polite">
            <span>SELECTED BRIDGE · SKIP {skip.id + 1}</span><h4>{skip.encoder} → {skip.decoder}</h4><code>{skip.encoderShape} ⇢ concat ⇢ {skip.decoderShape}</code><p>{skip.detail}</p>
          </aside>
        </div>
      ) : <ArchitectureTable caption={`U-Net · skip ${selectedSkip + 1} selected`} rows={unetRows(selectedSkip)} />}

      <aside className={styles.shiftNote} role="note">
        <strong>SEPARATE EVALUATION — NOT A LEADERBOARD LOSS</strong>
        <p>The U-Net notebook records low in-training validation losses, then reports relative error 1.2823 on a different processed validation path whose consecutive-step values were diagnosed as distribution-shifted. Notebook output records checkpoint saves, but the local .pth files are Git-ignored and none is tracked at HEAD. The atlas keeps that failure visible and does not place it below the FNO/GNN test results as if the splits were interchangeable.</p>
      </aside>
    </section>
  );
}

function ExperimentTimeline() {
  const [selected, setSelected] = useState(2);
  const event = TIMELINE[selected];
  return (
    <section className={styles.timelineSection} aria-labelledby="timeline-heading">
      <div className={styles.sectionHeading}>
        <div><span>SANITISED REPOSITORY HISTORY</span><h3 id="timeline-heading">Experiment lineage · design, execution and drift</h3></div>
        <span className={styles.timelinePolicy}>DATES + SHORT HASHES · GENERIC COMMIT MESSAGES OMITTED</span>
      </div>
      <div className={styles.timelineRail} role="group" aria-label="Select experiment history event">
        {TIMELINE.map((item, index) => (
          <button type="button" key={item.date} aria-pressed={selected === index} onClick={() => setSelected(index)}>
            <span>{item.date}</span><strong>{item.model}</strong><small>{item.commits}</small>
          </button>
        ))}
      </div>
      <article className={styles.timelineDetail} aria-live="polite">
        <div><span>{event.date}</span><code>{event.commits}</code></div>
        <div><h4>{event.title}</h4><p>{event.detail}</p></div>
        <BadgeRow badges={event.badges} />
      </article>
    </section>
  );
}

export function CfdArchitectureStudio() {
  const [model, setModel] = useState<ModelId>("fno");
  const [viewMode, setViewMode] = useState<ViewMode>("diagram");

  return (
    <DemoWindow
      appName="CFD Architecture Atlas"
      title="Neural surrogate architecture & experiment studio"
      status="SOURCE-AUDITED"
      statusTone="safe"
      className={styles.studio}
      footer={<><span>PRIVATE SOURCE · DERIVED ARCHITECTURE METADATA ONLY</span><span>NO LICENCE DECLARED · NO DATASETS OR WEIGHTS PUBLISHED</span></>}
    >
      <aside className={styles.boundaryBanner} role="note">
        <div><span aria-hidden="true">⌁</span><strong>PUBLIC DEMO BOUNDARY</strong></div>
        <p>These three source repositories are private and no explicit licence was found. This exhibit publishes reviewed architecture facts, execution provenance and non-data schematics—not course data, checkpoints or reusable source code.</p>
        <Badge badge={{ label: "PRIVATE / NO-LICENCE", tone: "boundary" }} />
      </aside>

      <div className={styles.topToolbar}>
        <div className={styles.modelTabs} role="group" aria-label="Select CFD model family">
          {MODEL_TABS.map((tab) => (
            <button type="button" key={tab.id} aria-pressed={model === tab.id} onClick={() => setModel(tab.id)}>
              <strong>{tab.label}</strong><span>{tab.subtitle}</span>
            </button>
          ))}
        </div>
        <div className={styles.viewToggle} role="group" aria-label="Architecture view mode">
          <span>VIEW</span>
          <button type="button" aria-pressed={viewMode === "diagram"} onClick={() => setViewMode("diagram")}>Interactive diagram</button>
          <button type="button" aria-pressed={viewMode === "table"} onClick={() => setViewMode("table")}>2D evidence table</button>
        </div>
      </div>

      {model === "fno" ? <FnoStudio viewMode={viewMode} /> : model === "gnn" ? <GnnStudio viewMode={viewMode} /> : <UnetStudio viewMode={viewMode} />}

      <ExperimentTimeline />

      <section className={styles.evidenceKey} aria-labelledby="evidence-key-heading">
        <div><span>EVIDENCE LANGUAGE</span><h3 id="evidence-key-heading">What each label means</h3></div>
        <dl>
          {EVIDENCE_DEFINITIONS.map((item) => <div key={item.badge.label}><dt><Badge badge={item.badge} /></dt><dd>{item.definition}</dd></div>)}
        </dl>
      </section>
    </DemoWindow>
  );
}

export default CfdArchitectureStudio;
