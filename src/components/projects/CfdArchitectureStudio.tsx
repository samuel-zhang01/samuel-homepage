"use client";
import { projectText } from "@/lib/projectCopy";
import { useProjectLocale, ProjectCopy } from "./ProjectTranslationBoundary";
import { scientificCopy } from "./copy/scientificCopy";

import { MathEquation } from "./MathEquation";

import { useEffect, useState } from "react";

import { DemoWindow } from "./DemoChrome";
import styles from "./CfdArchitectureStudio.module.css";
import { useProjectDemoActive } from "./ProjectDemoActivityContext";

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
  approach: string;
  benefit: string;
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
  operation: string;
  shape: string;
  role: string;
};

const MODEL_TABS: ReadonlyArray<{ id: ModelId; label: string; subtitle: string }> = [
  { id: "fno", label: "Fourier operator", subtitle: "spatial ⇄ spectral" },
  { id: "gnn", label: "MeshGraphNet", subtitle: "native mesh messages" },
  { id: "unet", label: "U-Net", subtitle: "raster encoder–decoder" },
];

const FNO_VARIANTS: Record<FnoVariantId, FnoVariant> = {
  baseline: {
    id: "baseline",
    shortName: "Baseline",
    name: "Three-block FNO3d",
    approach: "Regular grid → Fourier modes → flow fields",
    benefit: "Mix information across the grid with three spectral blocks",
    input: "3 physical channels",
    width: "36",
    modes: "8 × 8 × 4",
    blocks: "3 spectral + pointwise blocks",
    head: "36 → 128 → 3",
    parameters: "3,990,575",
    result: "relative L2 0.0163",
    note: "The baseline learns updates to velocity and pressure using global Fourier features and a local pointwise path. The reported relative L2 is 0.0163; its evaluation set was also checked during training.",
    badges: [
      { label: "Course model completed", tone: "scaffold" },
      { label: "Trained", tone: "trained" },
    ],
  },
  checkpoint: {
    id: "checkpoint",
    shortName: "Four-block extension",
    name: "Four-block enhanced FNO3d",
    approach: "Six input features with four spectral blocks",
    benefit: "Add input context, normalisation and a deeper output head",
    input: "6 input features",
    width: "36",
    modes: "8 × 8 × 4",
    blocks: "4 spectral + pointwise + LayerNorm blocks",
    head: "36 → 128 → 64 → 3",
    parameters: "5,327,471",
    result: "Evaluation result unavailable",
    note: "This extension adds a fourth spectral block, layer normalisation and a deeper projection head. Explore how its shape differs from the baseline; no evaluation result is available for this exact configuration.",
    badges: [
      { label: "Architecture variant", tone: "trained" },
      { label: "Design development", tone: "drift" },
    ],
  },
  improved: {
    id: "improved",
    shortName: "Later experiment",
    name: "Five-block residual FNO3d",
    approach: "Wider spectral blocks with residual connections",
    benefit: "Retain more Fourier modes and pass information through skip paths",
    input: "6 = 3 physics + 3 auxiliary",
    width: "48",
    modes: "12 × 12 × 5",
    blocks: "5 spectral + pointwise + LayerNorm blocks",
    head: "48 → 128 → 64 → 3",
    parameters: "33,204,920",
    result: "relative L2 0.002549",
    note: "Wider blocks, more retained modes and residual connections increase the model’s capacity. The recorded relative L2 is 0.002549; the same evaluation set guided model selection, so this is not an independent final test.",
    badges: [
      { label: "Custom experiment", tone: "authored" },
      { label: "Trained", tone: "trained" },
    ],
  },
  multiscale: {
    id: "multiscale",
    shortName: "Multi-scale design",
    name: "Multi-scale gradient FNO3d",
    approach: "Three Fourier resolutions inside each block",
    benefit: "Combine broad flow structure with finer spatial detail",
    input: "3 fields + 3 grid coordinates",
    width: "32",
    modes: "(4,4,2) · (8,8,4) · (12,12,4)",
    blocks: "4 multi-scale spectral + 1×1 skip blocks",
    head: "32 → 128 → 64 → 3",
    parameters: "Not reported",
    result: "Design experiment · no recorded metric",
    note: "Each block combines three Fourier resolutions, adds a 1×1 skip path and applies group normalisation. The aim is to capture flow structure at several scales; a numerical evaluation is not available for this variant.",
    badges: [
      { label: "Custom design", tone: "authored" },
      { label: "Experimental", tone: "scaffold" },
    ],
  },
};

const FNO_PHASES: ReadonlyArray<{ id: FnoPhase; label: string; explanation: string }> = [
  { id: "spatial", label: "1 · Spatial", explanation: "Velocity and pressure enter on a regular H × W × T grid. Follow one operator block to see how global flow patterns are processed." },
  { id: "fft", label: "2 · rFFT", explanation: "The real Fourier transform expresses the field as spatial and temporal frequencies. Symmetry lets the final axis store only N/2 + 1 entries." },
  { id: "weights", label: "3 · Modes", explanation: "Learned weights act on four signed x/y frequency regions and a retained positive z/time slice. Keeping fewer modes controls the detail and computation." },
  { id: "inverse", label: "4 · Inverse", explanation: "The inverse transform returns to the grid. A local pointwise path and output head then combine the features into three flow fields." },
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
    model: "U-Net",
    title: "Rasterise flow fields and train an encoder–decoder",
    detail: "Mesh fields are interpolated onto a regular grid, then passed through a four-level U-Net. Training and a shifted evaluation explore both the appeal of image-style processing and its limits on unfamiliar flow fields.",
    badges: [
      { label: "Course model adapted", tone: "scaffold" as const },
      { label: "Trained", tone: "trained" as const },
    ],
  },
  {
    date: "16 FEB — 02 MAR 2026",
    model: "MeshGraphNet",
    title: "Native-mesh message passing completed and run",
    detail: "Node and edge features feed ten residual message-passing blocks. The completed model trains for 100 epochs and predicts later states by feeding each output back as the next input.",
    badges: [
      { label: "Course model completed", tone: "scaffold" as const },
      { label: "Trained", tone: "trained" as const },
    ],
  },
  {
    date: "02 — 04 MAR 2026",
    model: "FNO",
    title: "Train the Fourier baseline and extend the design",
    detail: "A three-block Fourier model learns global field updates and records relative L2 0.0163. A four-block extension adds more input context and normalisation; its architecture is shown separately from the baseline result.",
    badges: [
      { label: "Trained", tone: "trained" as const },
      { label: "Design development", tone: "drift" as const },
    ],
  },
  {
    date: "06 MAR 2026",
    model: "FNO",
    title: "Residual, physics, lightweight and multi-scale branches",
    detail: "Further designs explore residual connections, physics terms, lighter models and several Fourier resolutions. The larger residual run has a recorded result; the other variants extend the design space.",
    badges: [
      { label: "Custom experiments", tone: "authored" as const },
      { label: "Design exploration", tone: "boundary" as const },
    ],
  },
] as const;

const EVIDENCE_DEFINITIONS: ReadonlyArray<{ badge: EvidenceBadge; definition: string }> = [
  { badge: { label: "Fourier", tone: "authored" }, definition: "Mix distant grid locations through frequency components; retained modes control the spatial and temporal detail." },
  { badge: { label: "Graph", tone: "scaffold" }, definition: "Keep the original mesh and pass information along its edges; processor depth expands the neighbourhood a node can use." },
  { badge: { label: "U-Net", tone: "trained" }, definition: "Combine a coarse view of the field with high-resolution features carried through skip connections." },
  { badge: { label: "Evaluation", tone: "boundary" }, definition: "Check both single-step accuracy and repeated predictions, using flow conditions representative of the intended use." },
];

function badgeClass(tone: EvidenceTone) {
  if (tone === "authored") return styles.badgeAuthored;
  if (tone === "scaffold") return styles.badgeScaffold;
  if (tone === "trained") return styles.badgeTrained;
  if (tone === "drift") return styles.badgeDrift;
  return styles.badgeBoundary;
}

function Badge({ badge }: { badge: EvidenceBadge }) {
  return <ProjectCopy copy={scientificCopy}><span className={`${styles.badge} ${badgeClass(badge.tone)}`}>{badge.label}</span></ProjectCopy>;
}

function BadgeRow({ badges }: { badges: readonly EvidenceBadge[] }) {
  return <ProjectCopy copy={scientificCopy}><div className={styles.badgeRow}>{badges.map((badge) => <Badge key={`${badge.tone}-${badge.label}`} badge={badge} />)}</div></ProjectCopy>;
}

function ArchitectureTable({ caption, rows }: { caption: string; rows: readonly ArchitectureRow[] }) {
  const locale = useProjectLocale();
  return (
    <ProjectCopy copy={scientificCopy}><div className={styles.tableScroller} tabIndex={0} role="region" aria-label={`${caption} architecture table`}>
      <table className={styles.architectureTable}>
        <caption>{caption}</caption>
        <thead>
          <tr><th scope="col">Stage</th><th scope="col">Operation</th><th scope="col">Shape / width</th><th scope="col">Role</th></tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.stage}>
              <th scope="row">{row.stage}</th>
              <td>{row.operation}</td>
              <td><code>{projectText(locale, scientificCopy, row.shape)}</code></td>
              <td>{row.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div></ProjectCopy>
  );
}

function fnoRows(variant: FnoVariant): ArchitectureRow[] {
  const blockContract = variant.id === "multiscale"
    ? "Three SpectralConv3d scales → concatenate/fuse + Conv3d 1×1 skip → GroupNorm"
    : variant.id === "improved"
      ? "SpectralConv3d + pointwise Conv1d → LayerNorm; GELU between blocks; residual every second block"
      : variant.id === "checkpoint"
        ? "SpectralConv3d + pointwise Conv1d + LayerNorm"
        : "SpectralConv3d + pointwise Conv1d; ReLU after the first two blocks";
  return [
    { stage: "Input", operation: variant.input, shape: variant.input, role: "Supply the flow state and any additional context" },
    { stage: "Lift", operation: "Linear projection on the channel axis", shape: `width ${variant.width}`, role: "Expand each location into a learned feature space" },
    { stage: "Operator blocks", operation: blockContract, shape: `${variant.blocks} · modes ${variant.modes}`, role: "Mix global flow patterns with local information" },
    { stage: "Projection", operation: "Per-location linear head", shape: variant.head, role: "Turn hidden features back into velocity and pressure" },
    { stage: "Model size", operation: variant.blocks, shape: `${variant.parameters} parameters`, role: variant.benefit },
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
    <ProjectCopy copy={scientificCopy}><figure className={styles.spectrumFigure}>
      <svg viewBox="0 0 560 270" role="img" aria-labelledby="fno-spectrum-title fno-spectrum-desc">
        <title id="fno-spectrum-title">FNO spatial and spectral operation diagram</title>
        <desc id="fno-spectrum-desc">{phaseRecord.explanation} The index cells show retained Fourier regions only and do not encode learned coefficient values.</desc>
        <g className={phase === "spatial" || phase === "inverse" ? styles.svgActive : styles.svgMuted}>
          <rect className={styles.spatialPlate} x="20" y="40" width="164" height="164" />
          {Array.from({ length: 7 }, (_, index) => <line key={`v-${index}`} x1={40 + index * 21} x2={40 + index * 21} y1="49" y2="195" />)}
          {Array.from({ length: 7 }, (_, index) => <line key={`h-${index}`} x1="29" x2="175" y1={60 + index * 21} y2={60 + index * 21} />)}
          <circle cx="77" cy="122" r="18" />
          <path d="M95 91 C125 70 145 86 171 82 M95 114 C127 101 145 111 174 106 M95 137 C130 148 148 134 174 141 M95 160 C125 181 148 161 171 168" />
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
          <text x="509" y="116">+x</text>
          <text x="257" y="116">−x</text>
          <text x="398" y="57">+y</text>
          <text x="398" y="194">−y</text>
        </g>
        <text x="102" y="232" textAnchor="middle">H × W × T</text>
        <text x="102" y="258" textAnchor="middle">Spatial field</text>
        <text x="393" y="232" textAnchor="middle">Retained Fourier regions</text>
        <text x="393" y="258" textAnchor="middle">Four x/y corners · low z slice</text>
      </svg>
      <figcaption>
        <strong>{phaseRecord.label}</strong>
        <span>{phaseRecord.explanation}</span>
        <em>Colour highlights the retained frequency regions. Use the flow-playback tab to inspect predicted fields.</em>
      </figcaption>
    </figure></ProjectCopy>
  );
}

function FnoStudio({ viewMode }: { viewMode: ViewMode }) {
  const active = useProjectDemoActive();
  const [variantId, setVariantId] = useState<FnoVariantId>("baseline");
  const [phase, setPhase] = useState<FnoPhase>("weights");
  const [playing, setPlaying] = useState(false);
  const [quadrant, setQuadrant] = useState(0);
  const variant = FNO_VARIANTS[variantId];

  useEffect(() => {
    if (!active || !playing || viewMode !== "diagram") return;
    const timer = window.setInterval(() => setPhase((current) => {
      const index = FNO_PHASES.findIndex((item) => item.id === current);
      return FNO_PHASES[(index + 1) % FNO_PHASES.length].id;
    }), 1800);
    return () => window.clearInterval(timer);
  }, [active, playing, viewMode]);

  return (
    <ProjectCopy copy={scientificCopy}><section className={styles.modelWorkspace} aria-labelledby="fno-heading">
      <div className={styles.sectionHeading}>
        <div><span>Model family 01</span><h3 id="fno-heading">Fourier Neural Operator · learning global flow patterns</h3></div>
        <BadgeRow badges={variant.badges} />
      </div>

      <div className={styles.variantStrip} role="group" aria-label="Choose an FNO design">
        {(Object.values(FNO_VARIANTS) as FnoVariant[]).map((item) => (
          <button type="button" key={item.id} aria-pressed={variantId === item.id} onClick={() => { setVariantId(item.id); setPlaying(false); }}>
            <span>{item.shortName}</span><strong>{item.name}</strong><small>{item.blocks}</small>
          </button>
        ))}
      </div>

      <div className={styles.artifactPairing}>
        <div><span>Representation</span><strong>{variant.approach}</strong></div>
        <div><span>Design choice</span><strong>{variant.benefit}</strong></div>
        <div><span>Recorded result</span><strong>{variant.result}</strong></div>
      </div>

      {viewMode === "diagram" ? (
        <>
          <div className={styles.pipeline} aria-label={`${variant.name} architecture pipeline`}>
            <article><span>01 · Input</span><strong>{variant.input}</strong><small>channel-last field tensor</small></article>
            <i aria-hidden="true">→</i>
            <article><span>02 · Lift</span><strong>Linear → width {variant.width}</strong><small>per grid location</small></article>
            <i aria-hidden="true">→</i>
            <article><span>03 · Operator</span><strong>{variant.blocks}</strong><small>modes {variant.modes}</small></article>
            <i aria-hidden="true">→</i>
            <article><span>04 · Head</span><strong>{variant.head}</strong><small>three output fields</small></article>
          </div>

          <div className={styles.fnoInspector}>
            <aside className={styles.inspectorControls}>
              <div className={styles.controlLabel}><span>Domain walkthrough</span><strong>Inspect one operation at a time</strong></div>
              <div className={styles.walkthroughControl}>
                <button type="button" aria-pressed={playing} onClick={() => { if (!playing) setPhase("spatial"); setPlaying((value) => !value); }}>{playing ? "Pause operator animation" : "Play operator animation"}</button>
                <p>Spatial field → Fourier transform → learned mode weights → inverse transform. A schematic walkthrough; playback starts on request.</p>
              </div>
              <div className={styles.phaseButtons} role="group" aria-label="Select Fourier operation phase">
                {FNO_PHASES.map((item) => <button type="button" key={item.id} aria-pressed={phase === item.id} onClick={() => { setPhase(item.id); setPlaying(false); }}>{item.label}</button>)}
              </div>
              <div className={styles.controlLabel}><span>Fourier corner</span><strong>{QUADRANTS[quadrant].label}</strong></div>
              <div className={styles.quadrantButtons} role="group" aria-label="Select learned Fourier weight corner">
                {QUADRANTS.map((item, index) => (
                  <button type="button" key={item.label} aria-pressed={quadrant === index} onClick={() => { setQuadrant(index); setPhase("weights"); setPlaying(false); }}>
                    <span>{item.label}</span><code>{item.slice}</code>
                  </button>
                ))}
              </div>
              <p className={styles.liveExplanation} aria-live="polite"><strong>Selected:</strong> {QUADRANTS[quadrant].slice}. For {variant.modes}, the same signed-corner rule is applied at every spectral block{variant.id === "multiscale" ? " and at each of the three scales" : ""}.</p>
            </aside>
            <FnoSpectrum phase={phase} quadrant={quadrant} />
          </div>
        </>
      ) : <ArchitectureTable caption={`${variant.name} · architecture`} rows={fnoRows(variant)} />}

      <aside className={styles.methodNote} role="note">
        <strong>How to read this design</strong>
        <p>{variant.note}</p>
        <dl><div><dt>Parameters</dt><dd>{variant.parameters}</dd></div><div><dt>Evaluation</dt><dd>Results use different evaluation conditions</dd></div></dl>
      </aside>
    </section></ProjectCopy>
  );
}

function gnnRows(step: number): ArchitectureRow[] {
  return [
    { stage: "Raw node", operation: "[u, v, p] + wall/inlet/outlet/object masks", shape: "7 features per node", role: "Describe the current flow and boundary type at each node" },
    { stage: "Raw edge", operation: "2D positional difference + L2 norm", shape: "3 features per directed edge", role: "Describe the direction and distance to a neighbour" },
    { stage: "Encoders", operation: "Linear → ReLU → Linear → LayerNorm", shape: "node 7→10 · edge 3→10", role: "Embed node and edge inputs in a shared feature width" },
    { stage: `Processor ${step}`, operation: "Edge MLP([source,target,edge]) + edge; scatter-add; Node MLP([node,sum]) + node", shape: "latent width 10", role: "Exchange local information while retaining the previous features" },
    { stage: "Processor stack", operation: "Ten independently instantiated residual message-passing blocks", shape: "10 processors", role: "Let information travel farther across the mesh" },
    { stage: "Decoder", operation: "Linear → ReLU → Linear; decoded delta + input field", shape: "10 → 10 → 3", role: "Predict a change in velocity and pressure" },
  ];
}

function GnnSchematic({ step }: { step: number }) {
  const nodes = [
    { x: 44, y: 68 }, { x: 116, y: 35 }, { x: 176, y: 80 },
    { x: 78, y: 139 }, { x: 157, y: 150 }, { x: 227, y: 116 },
  ];
  const edges = [[0, 1], [0, 3], [1, 2], [1, 3], [2, 4], [2, 5], [3, 4], [4, 5]] as const;
  return (
    <ProjectCopy copy={scientificCopy}><figure className={styles.gnnFigure}>
      <svg viewBox="0 0 560 252" role="img" aria-labelledby="gnn-title gnn-desc">
        <title id="gnn-title">MeshGraphNet message passing schematic at processor {step}</title>
        <desc id="gnn-desc">An illustrative mesh explains how residual edge and node updates pass information between neighbours.</desc>
        <g className={styles.meshSchematic}>
          {edges.map(([from, to], index) => <line key={index} x1={nodes[from].x} y1={nodes[from].y} x2={nodes[to].x} y2={nodes[to].y} />)}
          {nodes.map((node, index) => <g key={index}><circle cx={node.x} cy={node.y} r={index === 2 ? 10 : 7} /><text x={node.x} y={node.y + 3}>{index + 1}</text></g>)}
        </g>
        <path className={styles.gnnArrow} d="M255 108 H300" /><path className={styles.gnnArrowHead} d="m292 100 10 8-10 8" />
        <g className={styles.messageBlock}>
          <rect x="315" y="27" width="219" height="83" />
          <text className={styles.messageTitle} x="328" y="47">Edge update · processor {step}/10</text>
          <foreignObject x="328" y="55" width="200" height="32"><span style={{ fontSize: 11 }}><MathEquation display={false} tex={String.raw`\mathrm{MLP}([x_i,x_j,e_{ij}])+e_{ij}`} /></span></foreignObject>
          <text x="328" y="98">30 → 10 → 10 · residual</text>
          <rect x="315" y="123" width="219" height="84" />
          <text className={styles.messageTitle} x="328" y="141">Node update · scatter add</text>
          <foreignObject x="328" y="150" width="200" height="32"><span style={{ fontSize: 11 }}><MathEquation display={false} tex={String.raw`\mathrm{MLP}([x_i,\sum_j e^{\prime}_{ij}])+x_i`} /></span></foreignObject>
          <text x="328" y="195">20 → 10 → 10 · residual</text>
        </g>
        <text className={styles.schematicLabel} x="26" y="237">Illustrative mesh · neighbouring node updates</text>
      </svg>
      <figcaption>Each width-10 processor passes information between neighbouring nodes. Stepping through the ten blocks shows how the network builds a wider spatial context; the drawing illustrates the process.</figcaption>
    </figure></ProjectCopy>
  );
}

function GnnStudio({ viewMode }: { viewMode: ViewMode }) {
  const [step, setStep] = useState(1);
  const moveStep = (delta: number) => setStep((current) => Math.max(1, Math.min(10, current + delta)));
  return (
    <ProjectCopy copy={scientificCopy}><section className={styles.modelWorkspace} aria-labelledby="gnn-heading">
      <div className={styles.sectionHeading}>
        <div><span>Model family 02</span><h3 id="gnn-heading">MeshGraphNet · learning from neighbouring mesh points</h3></div>
        <BadgeRow badges={[{ label: "Course model completed", tone: "scaffold" }, { label: "Trained", tone: "trained" }]} />
      </div>

      <div className={styles.metricStrip}>
        <article><span>Node input</span><strong>7 → 10</strong><small>3 fields + 4 masks</small></article>
        <article><span>Edge input</span><strong>3 → 10</strong><small>Δx, Δy, ‖Δ‖₂</small></article>
        <article><span>Processors</span><strong>10</strong><small>residual edge + node updates</small></article>
        <article><span>Parameters</span><strong>8,323</strong><small>trainable values</small></article>
        <article><span>Example mesh</span><strong>2,051 nodes</strong><small>11,858 directed edge entries</small></article>
      </div>

      <div className={styles.processorControl}>
        <div><span>Processor depth</span><strong>Inspecting block {step} of 10</strong></div>
        <button type="button" onClick={() => moveStep(-1)} disabled={step === 1} aria-label="Previous processor block">−</button>
        <input aria-label="Processor block" type="range" min="1" max="10" value={step} onChange={(event) => setStep(Number(event.target.value))} />
        <button type="button" onClick={() => moveStep(1)} disabled={step === 10} aria-label="Next processor block">+</button>
        <output aria-live="polite">{String(step).padStart(2, "0")} / 10</output>
      </div>

      <div className={styles.processorRail} aria-label="Ten processor blocks">
        {Array.from({ length: 10 }, (_, index) => (
          <button type="button" key={index} aria-pressed={step === index + 1} onClick={() => setStep(index + 1)}><span>{index + 1}</span><small>Edge + node</small></button>
        ))}
      </div>

      {viewMode === "diagram" ? <GnnSchematic step={step} /> : <ArchitectureTable caption={`MeshGraphNet · processor ${step} selected`} rows={gnnRows(step)} />}

      <div className={styles.gnnLedger}>
        <article><span>Edge residual</span><MathEquation tex={String.raw`e^{\prime}=\mathrm{MLP}_{\mathrm{edge}}([x_i,x_j,e])+e`} /><p>Edge messages concatenate source, target and current edge embeddings before the residual update.</p></article>
        <article><span>Node residual</span><MathEquation tex={String.raw`x^{\prime}=\mathrm{MLP}_{\mathrm{node}}([x,\operatorname{scatter\_add}(e^{\prime})])+x`} /><p>Directed messages are summed at nodes; the decoded three-field delta is finally added to the input field.</p></article>
        <article><span>Recorded result</span><strong>relative L2 0.0165</strong><p>The 500-file evaluation records relative L2 0.0165. That set was also checked during training; the U-Net result uses a different evaluation distribution.</p></article>
      </div>
    </section></ProjectCopy>
  );
}

function unetRows(selectedSkip: number): ArchitectureRow[] {
  return [
    { stage: "Input + stem", operation: "Conv2d 3→64, 3×3, stride 1, padding 1 → BatchNorm → LeakyReLU(0.2)", shape: "3×80×320 → 64×80×320", role: "Extract local flow features without changing grid resolution" },
    { stage: "Encoder 1", operation: "4×4 stride-2 Conv 64→128 → 3×3 Conv 128→128", shape: "128 × 40 × 160", role: selectedSkip === 1 ? "Selected skip: preserve detail for Decoder 3" : "Reduce resolution and preserve features for Decoder 3" },
    { stage: "Encoder 2", operation: "4×4 stride-2 Conv 128→256 → 3×3 Conv 256→256", shape: "256 × 20 × 80", role: selectedSkip === 2 ? "Selected skip: preserve detail for Decoder 2" : "Reduce resolution and preserve features for Decoder 2" },
    { stage: "Encoder 3", operation: "4×4 stride-2 Conv 256→512 → 3×3 Conv 512→512", shape: "512 × 10 × 40", role: selectedSkip === 3 ? "Selected skip: preserve detail for Decoder 1" : "Reduce resolution and preserve features for Decoder 1" },
    { stage: "Encoder 4", operation: "4×4 stride-2 Conv 512→1024 → 3×3 Conv 1024→1024", shape: "1024 × 5 × 20", role: "Build a compact representation of the full flow field" },
    { stage: "Bottleneck", operation: "3×3 Conv 1024→1024 → BatchNorm → LeakyReLU(0.2)", shape: "1024 × 5 × 20", role: "Combine features at the coarsest spatial scale" },
    { stage: "Decoder 1", operation: "TransposeConv 1024→512 + concat skip → 3×3 Conv 1024→512", shape: "512 × 10 × 40", role: selectedSkip === 3 ? "Selected bridge: merge Encoder 3 detail" : "Upsample and merge Encoder 3 detail" },
    { stage: "Decoder 2", operation: "TransposeConv 512→256 + concat skip → 3×3 Conv 512→256", shape: "256 × 20 × 80", role: selectedSkip === 2 ? "Selected bridge: merge Encoder 2 detail" : "Upsample and merge Encoder 2 detail" },
    { stage: "Decoder 3", operation: "TransposeConv 256→128 + concat skip → 3×3 Conv 256→128", shape: "128 × 40 × 160", role: selectedSkip === 1 ? "Selected bridge: merge Encoder 1 detail" : "Upsample and merge Encoder 1 detail" },
    { stage: "Decoder 4", operation: "TransposeConv 128→64 + concat stem → 3×3 Conv 128→64", shape: "64 × 80 × 320", role: selectedSkip === 0 ? "Selected bridge: restore full-resolution stem detail" : "Upsample and merge full-resolution stem detail" },
    { stage: "Output", operation: "1×1 Conv2d 64→3", shape: "3 × 80 × 320", role: "Return horizontal velocity, vertical velocity and pressure" },
  ];
}

function UnetStudio({ viewMode }: { viewMode: ViewMode }) {
  const [selectedSkip, setSelectedSkip] = useState(3);
  const skip = UNET_SKIPS[selectedSkip];
  return (
    <ProjectCopy copy={scientificCopy}><section className={styles.modelWorkspace} aria-labelledby="unet-heading">
      <div className={styles.sectionHeading}>
        <div><span>Model family 03</span><h3 id="unet-heading">U-Net · combining local detail and wider context</h3></div>
        <BadgeRow badges={[{ label: "Course model adapted", tone: "scaffold" }, { label: "Trained", tone: "trained" }]} />
      </div>

      <div className={styles.metricStrip}>
        <article><span>Input grid</span><strong>3 × 80 × 320</strong><small>u · v · pressure</small></article>
        <article><span>Depth</span><strong>4 + bottleneck</strong><small>64 → 1,024 channels</small></article>
        <article><span>Skips</span><strong>4 concatenations</strong><small>click a bridge below</small></article>
        <article><span>Parameters</span><strong>50,542,531</strong><small>trainable values</small></article>
        <article><span>Evaluation</span><strong>shifted split</strong><small>relative error 1.2823</small></article>
      </div>

      {viewMode === "diagram" ? (
        <div className={styles.unetWorkbench}>
          <div className={styles.unetInput}><span>INPUT</span><strong>3 × 80 × 320</strong><small>regular grid generated from mesh fields</small></div>
          <div className={styles.unetDiagram}>
            {UNET_SKIPS.map((item) => (
              <div className={`${styles.skipRow} ${selectedSkip === item.id ? styles.skipRowSelected : ""}`} key={item.id}>
                <article><span>{item.encoder}</span><strong>{item.encoderShape}</strong><small>{item.id === 0 ? "3×3 stem" : "4×4 ↓2 then 3×3"}</small></article>
                <button type="button" aria-pressed={selectedSkip === item.id} onClick={() => setSelectedSkip(item.id)} aria-label={`Highlight skip ${item.id + 1}: ${item.encoder} to ${item.decoder}`}>
                  <i aria-hidden="true" /><span>Skip {item.id + 1}</span><i aria-hidden="true" />
                </button>
                <article><span>{item.decoder}</span><strong>{item.decoderShape}</strong><small>transpose 4×4 ↑2 · concat · 3×3</small></article>
              </div>
            ))}
            <div className={styles.unetBottleneck}><span>Encoder 4 → bottleneck → decoder 1</span><strong>1,024 × 5 × 20</strong><small>3×3 convolution at maximum channel depth</small></div>
          </div>
          <div className={styles.unetOutput}><span>OUTPUT</span><strong>3 × 80 × 320</strong><small>final 1×1 convolution</small></div>
          <aside className={styles.skipInspector} aria-live="polite">
            <span>Selected bridge · skip {skip.id + 1}</span><h4>{skip.encoder} → {skip.decoder}</h4><code>{skip.encoderShape} ⇢ concat ⇢ {skip.decoderShape}</code><p>{skip.detail}</p>
          </aside>
        </div>
      ) : <ArchitectureTable caption={`U-Net · skip ${selectedSkip + 1} selected`} rows={unetRows(selectedSkip)} />}

      <aside className={styles.shiftNote} role="note">
        <strong>What the shifted evaluation showed</strong>
        <p>Despite low validation losses during training, the U-Net recorded relative error 1.2823 on a different set of processed flow fields. Their consecutive-step values differed from the training distribution. This illustrates why a surrogate must be tested on the conditions where it will be used; these results cannot directly rank it against the FNO or graph model.</p>
      </aside>
    </section></ProjectCopy>
  );
}

function ExperimentTimeline() {
  const [selected, setSelected] = useState(2);
  const event = TIMELINE[selected];
  return (
    <ProjectCopy copy={scientificCopy}><section className={styles.timelineSection} aria-labelledby="timeline-heading">
      <div className={styles.sectionHeading}>
        <div><span>Project development</span><h3 id="timeline-heading">From grid prediction to spectral experiments</h3></div>
        <span className={styles.timelinePolicy}>January — March 2026</span>
      </div>
      <div className={styles.timelineRail} role="group" aria-label="Select experiment history event">
        {TIMELINE.map((item, index) => (
          <button type="button" key={item.date} aria-pressed={selected === index} onClick={() => setSelected(index)}>
            <span>{item.date}</span><strong>{item.model}</strong><small>{item.title}</small>
          </button>
        ))}
      </div>
      <article className={styles.timelineDetail} aria-live="polite">
        <div><span>{event.date}</span><strong>{event.model}</strong></div>
        <div><h4>{event.title}</h4><p>{event.detail}</p></div>
        <BadgeRow badges={event.badges} />
      </article>
    </section></ProjectCopy>
  );
}

export function CfdArchitectureStudio() {
  const [model, setModel] = useState<ModelId>("fno");
  const [viewMode, setViewMode] = useState<ViewMode>("diagram");

  return (
    <ProjectCopy copy={scientificCopy}><DemoWindow
      appName="CFD Architecture Atlas"
      title="Learning to predict fluid motion"
      status="Interactive architectures"
      purpose="Detailed fluid simulations are expensive. Explore three neural models that learn to predict velocity and pressure from previous flow fields."
      tryThis="Animate the Fourier operator, step through mesh messages, or select a U-Net skip connection to see how each design carries information."
      watchFor="Fourier modes capture broad patterns, graph messages follow the mesh, and U-Net skips preserve local detail. The diagrams explain the trained designs; flow playback is in the next tab."
      statusTone="safe"
      className={styles.studio}
      footer={<><span>3 representations · velocity + pressure</span><span>Interactive diagrams + recorded experiments</span></>}
    >
      <aside className={styles.boundaryBanner} role="note">
        <div><span aria-hidden="true">⌁</span><strong>The engineering question</strong></div>
        <p>How should a model represent a flow field? This work completed and adapted three course models, built the field-processing and training pipelines, and explored residual and multi-scale Fourier designs. Compare the paths below to see the trade-offs.</p>
        <Badge badge={{ label: "Learned flow models", tone: "boundary" }} />
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
          <span>View</span>
          <button type="button" aria-pressed={viewMode === "diagram"} onClick={() => setViewMode("diagram")}>Interactive diagram</button>
          <button type="button" aria-pressed={viewMode === "table"} onClick={() => setViewMode("table")}>Architecture table</button>
        </div>
      </div>

      {model === "fno" ? <FnoStudio viewMode={viewMode} /> : model === "gnn" ? <GnnStudio viewMode={viewMode} /> : <UnetStudio viewMode={viewMode} />}

      <ExperimentTimeline />

      <section className={styles.evidenceKey} aria-labelledby="evidence-key-heading">
        <div><span>Representation guide</span><h3 id="evidence-key-heading">What each design makes easier</h3></div>
        <dl>
          {EVIDENCE_DEFINITIONS.map((item) => <div key={item.badge.label}><dt><Badge badge={item.badge} /></dt><dd>{item.definition}</dd></div>)}
        </dl>
      </section>
    </DemoWindow></ProjectCopy>
  );
}

export default CfdArchitectureStudio;
