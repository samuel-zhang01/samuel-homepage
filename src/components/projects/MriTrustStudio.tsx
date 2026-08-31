"use client";

import { useId, useMemo, useState } from "react";
import { DemoWindow } from "./DemoChrome";
import styles from "./MriTrustStudio.module.css";

type View = "reconstruction" | "architecture" | "uncertainty" | "robustness" | "segmentation" | "audit";
type Acceleration = 4 | 8;
type ReconMethod = "zero" | "no-dc" | "dc";
type UqMethod = "dropout" | "ensemble";
type Attack = "FGSM" | "PGD-7";
type Attribution = "Saliency" | "Grad-CAM" | "Integrated gradients";
type ArchitectureStageId =
  | "input"
  | "enc1"
  | "enc2"
  | "enc3"
  | "enc4"
  | "bottleneck"
  | "dec4"
  | "dec3"
  | "dec2"
  | "dec1"
  | "output";
type DcCascade = 1 | 2 | 3;

const REPOSITORY_URL =
  "https://github.com/samuel-zhang01/IX-Medical-Imaging/tree/93bc9cd3e1175ed08a6d99a3443bdec3f1214f1e";

const reconstructionResults = {
  4: {
    zero: { psnr: 29.0, ssim: 0.786, nmse: null },
    "no-dc": { psnr: 23.84, ssim: 0.619, nmse: null },
    dc: { psnr: 31.9, ssim: 0.889, nmse: 0.016 },
  },
  8: {
    zero: { psnr: 28.01, ssim: 0.801, nmse: null },
    "no-dc": null,
    dc: { psnr: 29.59, ssim: 0.837, nmse: 0.028 },
  },
} as const;

const uncertaintyResults = {
  dropout: {
    label: "MC Dropout",
    runs: "T = 30 passes",
    psnr: 31.95,
    ssim: 0.889,
    ece: 0.026,
    ause: 0.000093,
    errorR: 0.59,
    segmentationR: 0.193,
    strength: "Pixel-level error ranking",
  },
  ensemble: {
    label: "Deep Ensemble",
    runs: "M = 3 models",
    psnr: 32.09,
    ssim: 0.891,
    ece: 0.017,
    ause: 0.00013,
    errorR: 0.493,
    segmentationR: 0.156,
    strength: "Calibrated intervals",
  },
} as const;

const attackResults = {
  epsilons: [0.005, 0.01, 0.02, 0.05],
  clean: [31.4, 31.4, 31.4, 31.4],
  FGSM: [28.9, 27.5, 25.6, 22.5],
  "PGD-7": [27.6, 25.8, 23.3, 19.8],
  uncertainty: [0.005, 0.006, 0.007, 0.009],
} as const;

const segmentationResults = {
  accelerations: [2, 4, 6, 8, 10],
  ground: [0.672, 0.672, 0.672, 0.672, 0.672],
  reconstructed: [0.668, 0.617, 0.54, 0.477, 0.377],
  zero: [0.538, 0.332, 0.262, 0.231, 0.216],
} as const;

const viewLabels: Array<{ id: View; number: string; label: string }> = [
  { id: "reconstruction", number: "01", label: "Reconstruct" },
  { id: "architecture", number: "02", label: "Architecture" },
  { id: "uncertainty", number: "03", label: "Uncertainty" },
  { id: "robustness", number: "04", label: "Stress test" },
  { id: "segmentation", number: "05", label: "Downstream" },
  { id: "audit", number: "06", label: "Audit trail" },
];

const architectureStages: Array<{
  id: ArchitectureStageId;
  shortLabel: string;
  label: string;
  tensor: string;
  operation: string;
  explanation: string;
}> = [
  {
    id: "input",
    shortLabel: "IN",
    label: "Zero-filled input",
    tensor: "B × 1 × 256²",
    operation: "Magnitude-image tensor",
    explanation: "The undersampled, zero-filled reconstruction enters the learned residual path and is also retained for the later residual addition.",
  },
  {
    id: "enc1",
    shortLabel: "E1",
    label: "Encoder level 1",
    tensor: "B × 32 × 256²",
    operation: "Double 3×3 convolution block",
    explanation: "The first encoder block keeps full spatial resolution and supplies the highest-resolution skip tensor.",
  },
  {
    id: "enc2",
    shortLabel: "E2",
    label: "Encoder level 2",
    tensor: "B × 64 × 128²",
    operation: "2× pooling · double 3×3 block",
    explanation: "Max-pooling halves the spatial dimensions while the feature width doubles to 64 channels.",
  },
  {
    id: "enc3",
    shortLabel: "E3",
    label: "Encoder level 3",
    tensor: "B × 128 × 64²",
    operation: "2× pooling · double 3×3 block",
    explanation: "This scale carries a 128-channel representation and a matching-resolution skip route to the decoder.",
  },
  {
    id: "enc4",
    shortLabel: "E4",
    label: "Encoder level 4",
    tensor: "B × 256 × 32²",
    operation: "2× pooling · double 3×3 block",
    explanation: "The deepest encoder level feeds both the bottleneck and the first decoder concatenation.",
  },
  {
    id: "bottleneck",
    shortLabel: "BN",
    label: "Bottleneck",
    tensor: "B × 512 × 16²",
    operation: "2× pooling · double 3×3 block",
    explanation: "The committed final configuration reaches 512 channels at 16×16 before the symmetric learned upsampling path begins.",
  },
  {
    id: "dec4",
    shortLabel: "D4",
    label: "Decoder level 4",
    tensor: "B × 256 × 32²",
    operation: "2×2 transpose conv · E4 concat · double 3×3 block",
    explanation: "Learned upsampling restores 32×32 resolution, then the E4 feature map is concatenated before the decoder block.",
  },
  {
    id: "dec3",
    shortLabel: "D3",
    label: "Decoder level 3",
    tensor: "B × 128 × 64²",
    operation: "2×2 transpose conv · E3 concat · double 3×3 block",
    explanation: "The decoder returns to 64×64 and concatenates the matching E3 encoder features.",
  },
  {
    id: "dec2",
    shortLabel: "D2",
    label: "Decoder level 2",
    tensor: "B × 64 × 128²",
    operation: "2×2 transpose conv · E2 concat · double 3×3 block",
    explanation: "The third learned upsampling stage restores 128×128 resolution and receives the E2 skip tensor.",
  },
  {
    id: "dec1",
    shortLabel: "D1",
    label: "Decoder level 1",
    tensor: "B × 32 × 256²",
    operation: "2×2 transpose conv · E1 concat · double 3×3 block",
    explanation: "The final decoder stage returns to full resolution and recombines the high-resolution E1 features.",
  },
  {
    id: "output",
    shortLabel: "OUT",
    label: "Residual output",
    tensor: "B × 1 × 256²",
    operation: "1×1 projection · residual add",
    explanation: "A 1×1 convolution projects to one correction channel. That correction is added to the original zero-filled input before soft data consistency.",
  },
];

const architecturePairs: Array<{
  encoder: ArchitectureStageId;
  decoder: ArchitectureStageId;
  skipLabel: string;
  skipTensor: string;
}> = [
  { encoder: "enc1", decoder: "dec1", skipLabel: "S1", skipTensor: "32 × 256²" },
  { encoder: "enc2", decoder: "dec2", skipLabel: "S2", skipTensor: "64 × 128²" },
  { encoder: "enc3", decoder: "dec3", skipLabel: "S3", skipTensor: "128 × 64²" },
  { encoder: "enc4", decoder: "dec4", skipLabel: "S4", skipTensor: "256 × 32²" },
];

function formatAuse(value: number) {
  return value === 0.000093 ? "9.3e-5" : "1.3e-4";
}

function maskLineIndices(acceleration: number) {
  const width = 64;
  const centerCount = Math.floor(width * 0.08);
  const centerStart = Math.floor((width - centerCount) / 2);
  const center = Array.from({ length: centerCount }, (_, index) => centerStart + index);
  const available = Array.from({ length: width }, (_, index) => index).filter(
    (index) => !center.includes(index),
  );
  let state = 177 + acceleration * 31;
  for (let index = available.length - 1; index > 0; index -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const swapIndex = state % (index + 1);
    [available[index], available[swapIndex]] = [available[swapIndex], available[index]];
  }
  const total = Math.floor(width / acceleration);
  return [...center, ...available.slice(0, total - centerCount)].sort((a, b) => a - b);
}

function SyntheticSlice({
  mode,
  acceleration = 4,
  severity = 0,
  label,
}: {
  mode: "clean" | "zero" | "recon" | "uncertainty" | "attack" | "segmentation";
  acceleration?: number;
  severity?: number;
  label: string;
}) {
  const rawId = useId();
  const id = rawId.replace(/:/g, "");
  const ghostCount = mode === "zero" ? (acceleration >= 8 ? 7 : 4) : mode === "attack" ? 6 : 0;
  const blur = mode === "zero" ? (acceleration >= 8 ? 1.8 : 1.15) : mode === "attack" ? 0.8 : 0.25;
  const uncertaintyOpacity = mode === "uncertainty" ? 0.94 : 0;

  return (
    <figure className={styles.sliceFrame} aria-label={`${label}, generated synthetic schematic`}>
      <div className={styles.syntheticFlag}>SYNTHETIC · NO PATIENT DATA</div>
      <svg className={styles.sliceSvg} viewBox="0 0 240 190" role="img" aria-label={label}>
        <defs>
          <radialGradient id={`${id}-body`} cx="50%" cy="48%" r="54%">
            <stop offset="0" stopColor="#c9ccd0" />
            <stop offset="0.55" stopColor="#737980" />
            <stop offset="1" stopColor="#252a30" />
          </radialGradient>
          <radialGradient id={`${id}-heat`} cx="50%" cy="50%" r="55%">
            <stop offset="0" stopColor="#fff7a8" />
            <stop offset="0.25" stopColor="#ff9d28" />
            <stop offset="0.62" stopColor="#df3765" />
            <stop offset="1" stopColor="#4a176d" stopOpacity="0" />
          </radialGradient>
          <filter id={`${id}-soft`}>
            <feGaussianBlur stdDeviation={blur} />
          </filter>
          <clipPath id={`${id}-clip`}>
            <ellipse cx="120" cy="96" rx="85" ry="77" />
          </clipPath>
        </defs>
        <rect width="240" height="190" fill="#06080b" />
        <g filter={`url(#${id}-soft)`}>
          <ellipse cx="120" cy="96" rx="85" ry="77" fill={`url(#${id}-body)`} />
          <ellipse cx="120" cy="99" rx="62" ry="57" fill="#343a40" opacity="0.92" />
          <path
            d="M76 100 C78 68 101 55 121 72 C138 48 171 69 170 99 C169 132 144 148 121 135 C98 151 73 132 76 100Z"
            fill="#aeb3b7"
            opacity="0.88"
          />
          <ellipse cx="103" cy="98" rx="20" ry="29" fill="#272c32" />
          <ellipse cx="143" cy="95" rx="24" ry="33" fill="#20252b" />
          <ellipse cx="103" cy="97" rx="12" ry="19" fill="#868c92" opacity="0.7" />
          <ellipse cx="144" cy="94" rx="14" ry="22" fill="#7d848b" opacity="0.68" />
          <path d="M65 62 Q120 30 178 63" fill="none" stroke="#d6d8da" strokeWidth="5" opacity="0.35" />
          <path d="M57 130 Q120 166 184 128" fill="none" stroke="#11151a" strokeWidth="9" opacity="0.65" />
        </g>

        {Array.from({ length: ghostCount }, (_, index) => {
          const offset = (index - (ghostCount - 1) / 2) * (mode === "attack" ? 9 : 13);
          return (
            <ellipse
              key={offset}
              cx={120 + offset}
              cy="96"
              rx="84"
              ry="75"
              fill="none"
              stroke={mode === "attack" ? "#e7e9eb" : "#bcc2c7"}
              strokeWidth={mode === "attack" ? 1.2 : 1.8}
              opacity={0.045 + severity * 0.006}
              clipPath={`url(#${id}-clip)`}
            />
          );
        })}

        {mode === "attack" ? (
          <g clipPath={`url(#${id}-clip)`} opacity={0.18 + severity * 0.02}>
            {Array.from({ length: 20 }, (_, index) => (
              <path
                key={index}
                d={`M38 ${34 + index * 7} L202 ${29 + index * 7 + ((index * 11) % 9)}`}
                stroke={index % 3 === 0 ? "#ff7a55" : "#e7ebef"}
                strokeWidth={index % 4 === 0 ? 1.4 : 0.7}
              />
            ))}
          </g>
        ) : null}

        {mode === "uncertainty" ? (
          <g opacity={uncertaintyOpacity}>
            <ellipse cx="82" cy="97" rx="32" ry="42" fill={`url(#${id}-heat)`} opacity="0.64" />
            <ellipse cx="156" cy="98" rx="37" ry="48" fill={`url(#${id}-heat)`} opacity="0.74" />
            <circle cx="121" cy="64" r="27" fill={`url(#${id}-heat)`} opacity="0.45" />
            <path
              d="M78 105 C80 66 109 54 124 74 C142 51 170 71 168 105"
              fill="none"
              stroke="#fff49d"
              strokeWidth="2"
              strokeDasharray="4 3"
              opacity="0.8"
            />
          </g>
        ) : null}

        {mode === "segmentation" ? (
          <g fill="none" strokeWidth="3">
            <path d="M83 98 C82 76 91 69 104 73 C116 78 119 112 104 122 C90 130 82 118 83 98Z" stroke="#49d6c8" />
            <path d="M122 73 C143 56 165 73 165 99 C165 126 145 139 126 126 C115 117 113 83 122 73Z" stroke="#f4d35e" />
            <path d="M72 83 Q117 45 171 76" stroke="#f46b8a" />
            <path d="M75 126 Q120 155 172 125" stroke="#78a8ff" />
          </g>
        ) : null}
        <text x="12" y="177" fill="#b9bec4" fontSize="8" letterSpacing="1.2">
          GENERATED ANATOMY-LIKE PHANTOM
        </text>
      </svg>
      <figcaption>{label}</figcaption>
    </figure>
  );
}

function KSpaceMask({ acceleration }: { acceleration: Acceleration }) {
  const lines = useMemo(() => maskLineIndices(acceleration), [acceleration]);
  const centerStart = Math.floor((64 - Math.floor(64 * 0.08)) / 2);
  const centerEnd = centerStart + Math.floor(64 * 0.08) - 1;

  return (
    <div className={styles.maskPanel}>
      <div className={styles.maskHeader}>
        <div>
          <span className={styles.microLabel}>CARTESIAN MASK · 64-COLUMN SCHEMATIC</span>
          <strong>{lines.length} / 64 lines retained</strong>
        </div>
        <span className={styles.readout}>{acceleration === 8 ? "12.5" : "25"}%</span>
      </div>
      <svg className={styles.maskSvg} viewBox="0 0 256 106" role="img" aria-label={`${acceleration} times Cartesian undersampling mask schematic`}>
        <defs>
          <radialGradient id={`kspace-energy-${acceleration}`} cx="50%" cy="50%" r="57%">
            <stop offset="0" stopColor="#f8f3b2" stopOpacity="0.86" />
            <stop offset="0.22" stopColor="#67d4d0" stopOpacity="0.35" />
            <stop offset="1" stopColor="#101429" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="256" height="106" fill="#090c16" />
        <rect width="256" height="106" fill={`url(#kspace-energy-${acceleration})`} />
        {lines.map((line) => {
          const inAcs = line >= centerStart && line <= centerEnd;
          return (
            <line
              key={line}
              x1={line * 4 + 2}
              x2={line * 4 + 2}
              y1="5"
              y2="101"
              stroke={inAcs ? "#fff2a7" : "#7de1dc"}
              strokeWidth={inAcs ? 3 : 1.5}
              opacity={inAcs ? 1 : 0.72}
            />
          );
        })}
        <path d="M120 9 H136" stroke="#fff" strokeWidth="1" />
        <text x="128" y="18" textAnchor="middle" fill="#fff" fontSize="7">
          ACS
        </text>
      </svg>
      <p>
        Generated mask follows the source algorithm: fixed central 8% ACS lines, then deterministic
        column placement to reach W/R. It is a schematic, not an experimental mask.
      </p>
    </div>
  );
}

function Metric({ label, value, detail, tone = "plain" }: { label: string; value: string; detail: string; tone?: "plain" | "good" | "warn" }) {
  return (
    <div className={`${styles.metric} ${tone === "plain" ? "" : styles[tone]}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}

function ReconstructionView() {
  const [acceleration, setAcceleration] = useState<Acceleration>(4);
  const [method, setMethod] = useState<ReconMethod>("dc");
  const [lambda, setLambda] = useState(0.72);
  const reported = reconstructionResults[acceleration][method];
  const baseline = reconstructionResults[acceleration].zero;
  const effectiveMethod = reported ? method : "dc";
  const effective = reported ?? reconstructionResults[acceleration].dc;
  const gain = effective.psnr - baseline.psnr;
  const predictedCoefficient = 0.42;
  const measuredCoefficient = 0.78;
  const blended = (1 - lambda) * predictedCoefficient + lambda * measuredCoefficient;

  function chooseAcceleration(next: Acceleration) {
    setAcceleration(next);
    if (next === 8 && method === "no-dc") setMethod("dc");
  }

  return (
    <section className={styles.workspace} aria-labelledby="mri-reconstruction-heading">
      <div className={styles.sectionLead}>
        <div>
          <span className={styles.kicker}>PHYSICS-INFORMED RECONSTRUCTION</span>
          <h3 id="mri-reconstruction-heading">What survives when k-space gets sparse?</h3>
          <p>
            Compare final-report aggregates from 236 held-out MR slices. The visual phantom and mask
            are generated locally; they are not dataset examples or model outputs.
          </p>
        </div>
        <div className={styles.controlStack}>
          <span className={styles.controlLabel}>ACCELERATION</span>
          <div className={styles.segmented} aria-label="Acceleration factor">
            {([4, 8] as const).map((value) => (
              <button key={value} type="button" aria-pressed={acceleration === value} onClick={() => chooseAcceleration(value)}>
                R={value}×
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.methodRail} aria-label="Reconstruction method">
        {([
          ["zero", "Zero-filled", "IFFT baseline"],
          ["no-dc", "U-Net only", "R=4 reported"],
          ["dc", "U-Net + DC", "3 cascades"],
        ] as const).map(([id, title, description]) => {
          const unavailable = id === "no-dc" && acceleration === 8;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={effectiveMethod === id}
              disabled={unavailable}
              onClick={() => setMethod(id)}
            >
              <span>{title}</span>
              <small>{unavailable ? "Not reported at R=8" : description}</small>
            </button>
          );
        })}
      </div>

      <div className={styles.reconGrid}>
        <div className={styles.imageWorkbench}>
          <SyntheticSlice
            mode={effectiveMethod === "zero" ? "zero" : effectiveMethod === "no-dc" ? "attack" : "recon"}
            acceleration={acceleration}
            severity={effectiveMethod === "no-dc" ? 6 : 0}
            label={effectiveMethod === "zero" ? `Zero-filled · R=${acceleration}×` : effectiveMethod === "no-dc" ? "U-Net without data consistency · R=4×" : `Residual U-Net + soft DC · R=${acceleration}×`}
          />
          <div className={styles.resultStrip} aria-live="polite">
            <Metric label="PSNR ↑" value={`${effective.psnr.toFixed(2)} dB`} detail="final report" tone={effectiveMethod === "dc" ? "good" : effectiveMethod === "no-dc" ? "warn" : "plain"} />
            <Metric label="SSIM ↑" value={effective.ssim.toFixed(3)} detail="final report" tone={effectiveMethod === "dc" ? "good" : "plain"} />
            <Metric label="NMSE ↓" value={effective.nmse === null ? "—" : effective.nmse.toFixed(3)} detail={effective.nmse === null ? "not reported" : "final report"} />
            <Metric
              label="VS ZERO-FILL"
              value={`${gain >= 0 ? "+" : ""}${gain.toFixed(2)} dB`}
              detail={effectiveMethod === "no-dc" ? "DC ablation underperforms" : effectiveMethod === "dc" ? "reported comparison" : "selected baseline"}
              tone={gain > 0 ? "good" : gain < 0 ? "warn" : "plain"}
            />
          </div>
        </div>
        <KSpaceMask acceleration={acceleration} />
      </div>

      <div className={styles.lowerGrid}>
        <div className={styles.formulaPanel}>
          <div className={styles.panelTitle}>
            <div>
              <span className={styles.microLabel}>SOFT DATA CONSISTENCY · TOY COEFFICIENT</span>
              <h4>Measured data gets a vote</h4>
            </div>
            <output htmlFor="dc-lambda" className={styles.readout}>λ {lambda.toFixed(2)}</output>
          </div>
          <label className={styles.sliderLabel} htmlFor="dc-lambda">
            Illustrative blend weight
            <input
              id="dc-lambda"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={lambda}
              onChange={(event) => setLambda(Number(event.target.value))}
            />
          </label>
          <div className={styles.equation}>
            <span>(1 − {lambda.toFixed(2)}) × {predictedCoefficient.toFixed(2)}</span>
            <b>+</b>
            <span>{lambda.toFixed(2)} × {measuredCoefficient.toFixed(2)}</span>
            <b>=</b>
            <strong>{blended.toFixed(3)}</strong>
          </div>
          <p>
            At measured locations, the source blends predicted and acquired k-space with a learned,
            sigmoid-gated λ; unmeasured locations retain the prediction. Values above are pedagogical—
            the trained λ was not reported.
          </p>
        </div>
        <div className={styles.pipelinePanel}>
          <span className={styles.microLabel}>VERIFIED MODEL PATH</span>
          <ol className={styles.pipeline}>
            <li><b>01</b><span>Magnitude image<br /><small>2-D FFT</small></span></li>
            <li><b>02</b><span>Random 1-D mask<br /><small>8% ACS retained</small></span></li>
            <li><b>03</b><span>4-level U-Net<br /><small>residual correction</small></span></li>
            <li><b>04</b><span>Soft DC × 3<br /><small>measured-line anchor</small></span></li>
          </ol>
          <div className={styles.factLine}>
            <span>R=4 DC ablation</span>
            <strong>31.9 → 23.8 dB</strong>
            <em>−8.1 dB reported</em>
          </div>
        </div>
      </div>
    </section>
  );
}

function architectureStage(id: ArchitectureStageId) {
  const stage = architectureStages.find((candidate) => candidate.id === id);
  if (!stage) throw new Error(`Missing MRI architecture stage: ${id}`);
  return stage;
}

function ArchitectureView() {
  const [selectedStageId, setSelectedStageId] = useState<ArchitectureStageId>("bottleneck");
  const [selectedSkip, setSelectedSkip] = useState(3);
  const [selectedCascade, setSelectedCascade] = useState<DcCascade>(1);
  const selectedStage = architectureStage(selectedStageId);
  const activeSkip = architecturePairs[selectedSkip];

  function renderStageButton(id: ArchitectureStageId) {
    const stage = architectureStage(id);
    const isSkipEndpoint = activeSkip.encoder === id || activeSkip.decoder === id;
    return (
      <button
        type="button"
        className={`${styles.architectureNode} ${selectedStageId === id ? styles.selectedNode : ""} ${isSkipEndpoint ? styles.skipEndpoint : ""}`}
        aria-pressed={selectedStageId === id}
        onClick={() => setSelectedStageId(id)}
      >
        <span>{stage.shortLabel}</span>
        <strong>{stage.label}</strong>
        <small>{stage.tensor}</small>
      </button>
    );
  }

  return (
    <section className={`${styles.workspace} ${styles.architectureWorkspace}`} aria-labelledby="mri-architecture-heading">
      <div className={styles.sectionLead}>
        <div>
          <span className={styles.kicker}>DEFINITION-DERIVED MODEL BLUEPRINT</span>
          <h3 id="mri-architecture-heading">Follow every scale, skip and physics constraint.</h3>
          <p>
            Select a tensor stage, a matching-resolution skip route or one of the three final soft data-consistency
            layers. Shapes and counts follow the committed final configuration; weights and inference outputs are not bundled here.
          </p>
        </div>
        <div className={styles.architectureStamp}>
          <span>FINAL RECONUNET</span>
          <strong>32 → 512 → 32</strong>
          <small>single-channel · 256²</small>
        </div>
      </div>

      <div className={styles.architectureFacts} aria-label="Reconstruction model architecture facts">
        <div><span>TRAINABLE PARAMETERS</span><strong>7,756,580</strong><small>includes 3 soft-DC scalars</small></div>
        <div><span>BACKBONE CONVOLUTIONS</span><strong>18 × 3×3</strong><small>nine double-convolution blocks</small></div>
        <div><span>LEARNED UPSAMPLING</span><strong>4 × 2×2</strong><small>transposed convolutions</small></div>
        <div><span>INITIALISATION</span><strong>FROM SCRATCH</strong><small>no pretrained backbone</small></div>
      </div>

      <div className={styles.architectureWorkbench}>
        <div
          className={styles.architectureViewport}
          tabIndex={0}
          role="region"
          aria-label="Interactive U-Net topology; scroll horizontally if needed"
        >
          <div className={styles.mapEntry}>
            {renderStageButton("input")}
            <span aria-hidden="true">RESIDUAL PATH →</span>
          </div>
          <div className={styles.architectureAxes} aria-hidden="true">
            <span>ENCODER · RESOLUTION ↓ · CONTEXT →</span>
            <span>DECODER · DETAIL ← · RESOLUTION ↑</span>
          </div>
          <ol className={styles.architectureMap} aria-label="Four encoder and decoder scale pairs plus bottleneck">
            {architecturePairs.map((pair, index) => (
              <li key={pair.skipLabel} className={selectedSkip === index ? styles.selectedSkipPair : ""}>
                {renderStageButton(pair.encoder)}
                <button
                  type="button"
                  className={styles.skipConnector}
                  aria-pressed={selectedSkip === index}
                  aria-label={`${pair.skipLabel}: select matching-resolution concatenation carrying ${pair.skipTensor} from ${architectureStage(pair.encoder).label} to ${architectureStage(pair.decoder).label}`}
                  onClick={() => {
                    setSelectedSkip(index);
                    setSelectedStageId(pair.decoder);
                  }}
                >
                  <span>↓ {pair.skipLabel} · CONCAT</span>
                  <small>{pair.skipTensor}</small>
                </button>
                {renderStageButton(pair.decoder)}
              </li>
            ))}
            <li className={styles.bottleneckPair}>
              {renderStageButton("bottleneck")}
              <span className={styles.turnArrow} aria-hidden="true">↓ TURN INTO DECODER</span>
            </li>
          </ol>
          <div className={styles.mapExit}>
            {renderStageButton("output")}
            <span aria-hidden="true">← 1×1 PROJECTION + INPUT RESIDUAL</span>
          </div>
        </div>

        <aside className={styles.stageInspector} aria-live="polite" aria-label="Selected architecture stage details">
          <span className={styles.microLabel}>SELECTED STAGE · {selectedStage.shortLabel}</span>
          <strong>{selectedStage.label}</strong>
          <output>{selectedStage.tensor}</output>
          <dl>
            <div><dt>Verified operation</dt><dd>{selectedStage.operation}</dd></div>
            <div><dt>Why it is here</dt><dd>{selectedStage.explanation}</dd></div>
          </dl>
          <p>
            Per-stage parameter totals are intentionally omitted: the repository defines the operations and total model count,
            but does not publish an audited stage-by-stage allocation.
          </p>
        </aside>
      </div>

      <div className={styles.architectureLowerGrid}>
        <section className={styles.dcPanel} aria-labelledby="mri-dc-cascade-heading">
          <div className={styles.panelTitle}>
            <div>
              <span className={styles.microLabel}>PHYSICS LAYER · SEQUENTIAL AFTER RESIDUAL U-NET</span>
              <h4 id="mri-dc-cascade-heading">Three learned soft-DC scalars</h4>
            </div>
            <span className={styles.readout}>λ{selectedCascade}</span>
          </div>
          <fieldset className={styles.dcSelector}>
            <legend>Select data-consistency cascade</legend>
            {([1, 2, 3] as const).map((cascade) => (
              <button
                key={cascade}
                type="button"
                aria-pressed={selectedCascade === cascade}
                onClick={() => setSelectedCascade(cascade)}
              >
                <span>DC {cascade}</span>
                <small>σ(λ{cascade})</small>
              </button>
            ))}
          </fieldset>
          <div className={styles.dcReadout} aria-live="polite">
            <span>CASCADE {selectedCascade} OF 3</span>
            <strong>Re-anchor acquired k-space lines</strong>
            <div className={styles.dcEquation}>
              <span>measured:</span>
              <code>(1 − σ(λ{selectedCascade})) k<sub>pred</sub> + σ(λ{selectedCascade}) k<sub>measured</sub></code>
              <span>unmeasured:</span>
              <code>k<sub>pred</sub></code>
            </div>
            <p>
              The code applies DC 1 → 2 → 3 to the running reconstruction after one residual U-Net pass.
              Each layer contributes one scalar parameter; trained λ values are not reported here.
            </p>
          </div>
        </section>

        <section className={styles.modelRoles} aria-labelledby="mri-model-roles-heading">
          <div className={styles.panelTitle}>
            <div>
              <span className={styles.microLabel}>MODEL ROLE SEPARATION</span>
              <h4 id="mri-model-roles-heading">Reconstructor ≠ evaluator</h4>
            </div>
            <span className={styles.readout}>2 systems</span>
          </div>
          <div className={styles.roleCards}>
            <article>
              <span>TRAINED RECONSTRUCTION SYSTEM</span>
              <strong>7,756,580</strong>
              <b>parameters · 4-level U-Net + DC</b>
              <p>Optimised from scratch to predict a residual correction, then constrained by three soft-DC layers.</p>
            </article>
            <article>
              <span>FROZEN DOWNSTREAM EVALUATOR</span>
              <strong>1,923,848</strong>
              <b>parameters · separate 3-level U-Net</b>
              <p>Trained separately on ground-truth images for eight-class segmentation, then frozen while reconstructed inputs are assessed.</p>
            </article>
          </div>
          <p className={styles.roleBoundary}>
            The segmentation network is an evaluation probe—not a decoder head, not part of the reconstruction parameter total,
            and not jointly optimised with ReconUNet.
          </p>
        </section>
      </div>

      <div
        className={styles.architectureTableFrame}
        tabIndex={0}
        role="region"
        aria-label="Architecture tensor ledger traced to source"
      >
        <table className={styles.architectureTable}>
          <caption>Semantic tensor ledger · final base_features=32 configuration</caption>
          <thead><tr><th scope="col">Stage</th><th scope="col">Output tensor</th><th scope="col">Committed operation</th></tr></thead>
          <tbody>
            {architectureStages.map((stage) => (
              <tr key={stage.id} data-selected={selectedStageId === stage.id ? "true" : undefined}>
                <th scope="row">{stage.shortLabel} · {stage.label}</th>
                <td>{stage.tensor}</td>
                <td>{stage.operation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function UncertaintyView() {
  const [method, setMethod] = useState<UqMethod>("dropout");
  const selected = uncertaintyResults[method];
  const eceReduction = Math.round((1 - uncertaintyResults.ensemble.ece / uncertaintyResults.dropout.ece) * 100);
  const auseReduction = Math.round((1 - uncertaintyResults.dropout.ause / uncertaintyResults.ensemble.ause) * 100);

  return (
    <section className={styles.workspace} aria-labelledby="mri-uncertainty-heading">
      <div className={styles.sectionLead}>
        <div>
          <span className={styles.kicker}>CALIBRATION + ERROR RANKING</span>
          <h3 id="mri-uncertainty-heading">Two uncertainty methods, different strengths.</h3>
          <p>
            Switch between the exact final-report results. Heat-map placement is a generated
            boundary-focused schematic, mirroring the reported qualitative pattern—not a saved prediction.
          </p>
        </div>
        <div className={styles.controlStack}>
          <span className={styles.controlLabel}>ESTIMATOR</span>
          <div className={styles.segmented} aria-label="Uncertainty estimator">
            <button type="button" aria-pressed={method === "dropout"} onClick={() => setMethod("dropout")}>MC Dropout</button>
            <button type="button" aria-pressed={method === "ensemble"} onClick={() => setMethod("ensemble")}>Ensemble</button>
          </div>
        </div>
      </div>

      <div className={styles.uqGrid}>
        <div className={styles.uncertaintyVisuals}>
          <SyntheticSlice mode="recon" label={`${selected.label} mean reconstruction`} />
          <SyntheticSlice mode="uncertainty" label={`${selected.label} uncertainty schematic`} />
        </div>
        <div className={styles.methodDossier} aria-live="polite">
          <div className={styles.dossierTop}>
            <span className={styles.microLabel}>SELECTED METHOD</span>
            <h4>{selected.label}</h4>
            <span className={styles.runStamp}>{selected.runs}</span>
          </div>
          <div className={styles.dossierMetrics}>
            <Metric label="PSNR ↑" value={`${selected.psnr.toFixed(2)} dB`} detail="R=4 final report" />
            <Metric label="ECE ↓" value={selected.ece.toFixed(3)} detail="calibration error" tone={method === "ensemble" ? "good" : "plain"} />
            <Metric label="AUSE ↓" value={formatAuse(selected.ause)} detail="sparsification" tone={method === "dropout" ? "good" : "plain"} />
            <Metric label="ERROR r ↑" value={selected.errorR.toFixed(3)} detail="uncertainty vs |error|" tone={method === "dropout" ? "good" : "plain"} />
          </div>
          <div className={styles.strengthCallout}>
            <span>BEST FIT</span>
            <strong>{selected.strength}</strong>
            <p>Segmentation-error correlation: r = {selected.segmentationR.toFixed(3)}</p>
          </div>
        </div>
      </div>

      <div className={styles.lowerGrid}>
        <div className={styles.comparisonPanel}>
          <div className={styles.panelTitle}>
            <div>
              <span className={styles.microLabel}>CALIBRATION · LOWER IS BETTER</span>
              <h4>Expected calibration error</h4>
            </div>
            <span className={styles.readout}>{eceReduction}% lower</span>
          </div>
          <div className={styles.barRows}>
            <div><span>MC Dropout</span><i><b style={{ width: `${(0.026 / 0.03) * 100}%` }} /></i><strong>0.026</strong></div>
            <div><span>Ensemble</span><i><b style={{ width: `${(0.017 / 0.03) * 100}%` }} /></i><strong>0.017</strong></div>
          </div>
          <p>Calculated from rounded values in the final report table. Ensemble calibration is stronger.</p>
        </div>
        <div className={styles.comparisonPanel}>
          <div className={styles.panelTitle}>
            <div>
              <span className={styles.microLabel}>SPARSIFICATION · LOWER IS BETTER</span>
              <h4>Area under sparsification error</h4>
            </div>
            <span className={styles.readout}>{auseReduction}% lower</span>
          </div>
          <div className={styles.barRows}>
            <div><span>MC Dropout</span><i><b style={{ width: `${(0.000093 / 0.00015) * 100}%` }} /></i><strong>9.3e-5</strong></div>
            <div><span>Ensemble</span><i><b style={{ width: `${(0.00013 / 0.00015) * 100}%` }} /></i><strong>1.3e-4</strong></div>
          </div>
          <p>Calculated from rounded table values. MC Dropout ranks unreliable pixels more tightly.</p>
        </div>
      </div>
    </section>
  );
}

function AttackChart({ selectedAttack, selectedIndex }: { selectedAttack: Attack; selectedIndex: number }) {
  const toX = (index: number) => 44 + index * 73;
  const toY = (value: number) => 154 - ((value - 18) / 14) * 118;
  const series = [
    { label: "Clean", values: attackResults.clean, color: "#777b82" },
    { label: "FGSM", values: attackResults.FGSM, color: "#0d7775" },
    { label: "PGD-7", values: attackResults["PGD-7"], color: "#b73d62" },
  ];

  return (
    <div className={styles.chartPanel}>
      <div className={styles.chartLegend}>
        {series.map((item) => <span key={item.label}><i style={{ background: item.color }} />{item.label}</span>)}
      </div>
      <svg viewBox="0 0 300 185" role="img" aria-label="Reported PSNR under FGSM and PGD attacks">
        {[20, 24, 28, 32].map((tick) => (
          <g key={tick}>
            <line x1="35" x2="273" y1={toY(tick)} y2={toY(tick)} stroke="#d0d0ca" strokeWidth="1" />
            <text x="29" y={toY(tick) + 3} textAnchor="end" fontSize="8" fill="#5e5e5a">{tick}</text>
          </g>
        ))}
        {series.map((item) => (
          <g key={item.label}>
            <polyline
              points={item.values.map((value, index) => `${toX(index)},${toY(value)}`).join(" ")}
              fill="none"
              stroke={item.color}
              strokeWidth={item.label === selectedAttack ? 3 : 1.6}
              opacity={item.label === "Clean" || item.label === selectedAttack ? 1 : 0.45}
            />
            {item.values.map((value, index) => (
              <circle
                key={`${item.label}-${index}`}
                cx={toX(index)}
                cy={toY(value)}
                r={item.label === selectedAttack && index === selectedIndex ? 5 : 2.5}
                fill={item.color}
                stroke="#fff"
                strokeWidth="1"
              >
                <title>{item.label}: {value.toFixed(1)} dB at ε={attackResults.epsilons[index]}</title>
              </circle>
            ))}
          </g>
        ))}
        {attackResults.epsilons.map((epsilon, index) => (
          <text key={epsilon} x={toX(index)} y="174" textAnchor="middle" fontSize="8" fill="#5e5e5a">{epsilon}</text>
        ))}
        <text x="153" y="184" textAnchor="middle" fontSize="8" fill="#343431">attack budget ε</text>
        <text x="8" y="20" fontSize="8" fill="#343431">PSNR dB</text>
      </svg>
      <p>Aggregate values transcribed from the final report; no per-slice samples are plotted.</p>
    </div>
  );
}

function RobustnessView() {
  const [mode, setMode] = useState<"attacks" | "shift">("attacks");
  const [attack, setAttack] = useState<Attack>("PGD-7");
  const [epsilonIndex, setEpsilonIndex] = useState(2);
  const [domain, setDomain] = useState<"MR" | "CT">("CT");
  const attackedPsnr = attackResults[attack][epsilonIndex];
  const epsilon = attackResults.epsilons[epsilonIndex];
  const uncertainty = attackResults.uncertainty[epsilonIndex];
  const drop = attackResults.clean[epsilonIndex] - attackedPsnr;
  const shift = domain === "MR" ? { psnr: 31.3, uncertainty: 0.004 } : { psnr: 30.4, uncertainty: 0.007 };

  return (
    <section className={styles.workspace} aria-labelledby="mri-robustness-heading">
      <div className={styles.sectionLead}>
        <div>
          <span className={styles.kicker}>FAILURE-MODE LAB</span>
          <h3 id="mri-robustness-heading">Does uncertainty rise when trust should fall?</h3>
          <p>
            Explore exact adversarial and cross-domain aggregates. Degradation in the generated phantom is
            only a visual cue; it is not a recovered experimental sample.
          </p>
        </div>
        <div className={styles.controlStack}>
          <span className={styles.controlLabel}>STRESSOR</span>
          <div className={styles.segmented} aria-label="Robustness stressor">
            <button type="button" aria-pressed={mode === "attacks"} onClick={() => setMode("attacks")}>Image attack</button>
            <button type="button" aria-pressed={mode === "shift"} onClick={() => setMode("shift")}>MR → CT shift</button>
          </div>
        </div>
      </div>

      {mode === "attacks" ? (
        <>
          <div className={styles.attackControls}>
            <div>
              <span className={styles.controlLabel}>ATTACK</span>
              <div className={styles.segmented} aria-label="Attack type">
                <button type="button" aria-pressed={attack === "FGSM"} onClick={() => setAttack("FGSM")}>FGSM</button>
                <button type="button" aria-pressed={attack === "PGD-7"} onClick={() => setAttack("PGD-7")}>PGD · 7 steps</button>
              </div>
            </div>
            <div className={styles.epsilonButtons}>
              <span className={styles.controlLabel}>BUDGET ε</span>
              <div>
                {attackResults.epsilons.map((value, index) => (
                  <button key={value} type="button" aria-pressed={epsilonIndex === index} onClick={() => setEpsilonIndex(index)}>{value}</button>
                ))}
              </div>
            </div>
          </div>
          <div className={styles.robustGrid}>
            <SyntheticSlice mode="attack" severity={epsilonIndex + (attack === "PGD-7" ? 2 : 0)} label={`Generated ${attack} stress schematic · ε=${epsilon}`} />
            <div className={styles.robustReadout} aria-live="polite">
              <div className={styles.resultStrip}>
                <Metric label="CLEAN" value="31.4 dB" detail="reported reference" />
                <Metric label={`${attack} PSNR`} value={`${attackedPsnr.toFixed(1)} dB`} detail={`ε = ${epsilon}`} tone="warn" />
                <Metric label="QUALITY DROP" value={`−${drop.toFixed(1)} dB`} detail="calculated difference" tone="warn" />
                <Metric label="UNCERTAINTY" value={uncertainty.toFixed(3)} detail="reported progression" />
              </div>
              <div className={styles.robustFinding}>
                <span>{attack === "PGD-7" ? "ITERATIVE ATTACK" : "SINGLE-STEP ATTACK"}</span>
                <strong>{attack === "PGD-7" ? "PGD is more damaging at every tested budget." : "FGSM degrades quality monotonically with budget."}</strong>
                <p>Soft DC re-imposes the untouched acquired k-space at measured locations, a physics-grounded constraint described in the report.</p>
              </div>
            </div>
            <AttackChart selectedAttack={attack} selectedIndex={epsilonIndex} />
          </div>
        </>
      ) : (
        <div className={styles.shiftLayout}>
          <div className={styles.shiftChooser}>
            <span className={styles.controlLabel}>EVALUATION DOMAIN</span>
            <div className={styles.domainSwitch}>
              <button type="button" aria-pressed={domain === "MR"} onClick={() => setDomain("MR")}><b>MR</b><small>in-domain</small></button>
              <span aria-hidden="true">→</span>
              <button type="button" aria-pressed={domain === "CT"} onClick={() => setDomain("CT")}><b>CT</b><small>out-of-domain</small></button>
            </div>
            <div className={styles.shiftMetrics} aria-live="polite">
              <Metric label="PSNR" value={`${shift.psnr.toFixed(1)} dB`} detail={domain === "MR" ? "MR-trained / MR test" : "MR-trained / CT test"} />
              <Metric label="UNCERTAINTY" value={shift.uncertainty.toFixed(3)} detail="reported rounded mean" tone={domain === "CT" ? "warn" : "plain"} />
            </div>
          </div>
          <SyntheticSlice mode={domain === "MR" ? "recon" : "uncertainty"} label={`${domain} domain · generated modality-shift schematic`} />
          <div className={styles.shiftCallout}>
            <span className={styles.microLabel}>REPORTED DISTRIBUTION-SHIFT SIGNAL</span>
            <strong>+77%</strong>
            <h4>uncertainty on CT</h4>
            <p>
              The report states +77% using unrounded experiment values, alongside a 0.9 dB PSNR drop.
              The displayed 0.004 and 0.007 means are rounded and imply 75%, so the reported percentage
              remains as reported in the source.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

function SegmentationView() {
  const [index, setIndex] = useState(1);
  const [gate, setGate] = useState(80);
  const acceleration = segmentationResults.accelerations[index];
  const ground = segmentationResults.ground[index];
  const reconstructed = segmentationResults.reconstructed[index];
  const zero = segmentationResults.zero[index];
  const preserved = Math.round((reconstructed / ground) * 100);
  const zeroPreserved = Math.round((zero / ground) * 100);
  const improvement = reconstructed / zero;
  const passesGate = preserved >= gate;

  return (
    <section className={styles.workspace} aria-labelledby="mri-segmentation-heading">
      <div className={styles.sectionLead}>
        <div>
          <span className={styles.kicker}>DOWNSTREAM TASK CHECK</span>
          <h3 id="mri-segmentation-heading">Pixel fidelity is not the finish line.</h3>
          <p>
            The source evaluates a segmentation network on ground-truth, reconstructed and zero-filled
            inputs. Select acceleration to calculate Dice preservation from the reported table.
          </p>
        </div>
        <div className={styles.controlStack}>
          <span className={styles.controlLabel}>ACCELERATION</span>
          <div className={styles.factorButtons} aria-label="Segmentation acceleration factor">
            {segmentationResults.accelerations.map((value, factorIndex) => (
              <button key={value} type="button" aria-pressed={index === factorIndex} onClick={() => setIndex(factorIndex)}>{value}×</button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.segGrid}>
        <SyntheticSlice mode="segmentation" acceleration={acceleration} label={`Generated segmentation-overlay schematic · R=${acceleration}×`} />
        <div className={styles.dicePanel} aria-live="polite">
          <div className={styles.panelTitle}>
            <div>
              <span className={styles.microLabel}>MEAN DICE · HIGHER IS BETTER</span>
              <h4>R={acceleration}× comparison</h4>
            </div>
            <span className={styles.readout}>{preserved}% preserved</span>
          </div>
          <div className={styles.diceRows}>
            {[
              ["Ground truth", ground, "ground"],
              ["U-Net + DC", reconstructed, "recon"],
              ["Zero-filled", zero, "zero"],
            ].map(([label, rawValue, variant]) => {
              const value = Number(rawValue);
              return (
                <div key={String(label)}>
                  <span>{label}</span>
                  <i><b className={styles[String(variant)]} style={{ width: `${(value / 0.7) * 100}%` }} /></i>
                  <strong>{value.toFixed(3)}</strong>
                </div>
              );
            })}
          </div>
          <div className={styles.calculationTape}>
            <div><span>RECON PRESERVATION</span><strong>{reconstructed.toFixed(3)} ÷ {ground.toFixed(3)} = {preserved}%</strong></div>
            <div><span>ZERO-FILL PRESERVATION</span><strong>{zero.toFixed(3)} ÷ {ground.toFixed(3)} = {zeroPreserved}%</strong></div>
            <div><span>RECON / ZERO RATIO</span><strong>{improvement.toFixed(2)}×</strong></div>
          </div>
        </div>
      </div>

      <div className={styles.lowerGrid}>
        <div className={styles.gatePanel}>
          <div className={styles.panelTitle}>
            <div>
              <span className={styles.microLabel}>PORTFOLIO WHAT-IF · NOT A SOURCE THRESHOLD</span>
              <h4>Task-preservation review gate</h4>
            </div>
            <span className={`${styles.gateStatus} ${passesGate ? styles.pass : styles.review}`}>{passesGate ? "PASS" : "REVIEW"}</span>
          </div>
          <label className={styles.sliderLabel} htmlFor="dice-gate">
            Minimum Dice preservation: {gate}%
            <input id="dice-gate" type="range" min="50" max="99" value={gate} onChange={(event) => setGate(Number(event.target.value))} />
          </label>
          <p>
            This interactive rule demonstrates how a downstream quality gate could operate. The report
            proposes uncertainty-guided flagging but does not prescribe this Dice threshold; it is not a
            clinical decision rule.
          </p>
        </div>
        <div className={styles.evidencePanel}>
          <span className={styles.microLabel}>TASK-LEVEL EVIDENCE</span>
          <strong>r = 0.193</strong>
          <h4>MC uncertainty ↔ segmentation error</h4>
          <p>
            Positive but moderate spatial correlation in the final table. At R=8×, reported Dice is
            0.477 versus 0.231 for zero-fill—more than double.
          </p>
        </div>
      </div>
    </section>
  );
}

function AuditView() {
  const [attribution, setAttribution] = useState<Attribution>("Grad-CAM");

  return (
    <section className={styles.workspace} aria-labelledby="mri-audit-heading">
      <div className={styles.sectionLead}>
        <div>
          <span className={styles.kicker}>METHOD + EVIDENCE BOUNDARY</span>
          <h3 id="mri-audit-heading">Show the mechanism—and the limits.</h3>
          <p>
            This map is traced to the study source. The portfolio demo contains no MM-WHS data, weights,
            assessed paper PDF, notebook output or reproduced repository figures.
          </p>
        </div>
        <a className={styles.sourceButton} href={REPOSITORY_URL} target="_blank" rel="noreferrer">Inspect public source ↗</a>
      </div>

      <div className={styles.auditGrid}>
        <div className={styles.xaiPanel}>
          <div className={styles.panelTitle}>
            <div>
              <span className={styles.microLabel}>EXPLAINABILITY ADAPTED TO RECONSTRUCTION</span>
              <h4>{attribution}</h4>
            </div>
            <span className={styles.readout}>loss target</span>
          </div>
          <div className={styles.xaiCanvas}>
            <SyntheticSlice mode={attribution === "Saliency" ? "segmentation" : "uncertainty"} label={`${attribution} boundary-focus schematic`} />
          </div>
          <div className={styles.factorButtons} aria-label="Attribution method">
            {(["Saliency", "Grad-CAM", "Integrated gradients"] as const).map((value) => (
              <button key={value} type="button" aria-pressed={attribution === value} onClick={() => setAttribution(value)}>{value}</button>
            ))}
          </div>
          <p>
            The source replaces the classification logit with reconstruction loss. It reports positive
            correlation with error and boundary-focused attribution, but does not tabulate exact XAI
            correlations; this canvas is deliberately qualitative.
          </p>
        </div>

        <div className={styles.specPanel}>
          <span className={styles.microLabel}>FINAL CONFIGURATION · REPORT</span>
          <dl className={styles.specList}>
            <div><dt>Backbone</dt><dd>4-level residual U-Net</dd></div>
            <div><dt>Blocks</dt><dd>InstanceNorm · LeakyReLU · spatial dropout</dd></div>
            <div><dt>Capacity</dt><dd>32 base features · p=0.11</dd></div>
            <div><dt>Physics</dt><dd>3 learnable soft-DC cascades</dd></div>
            <div><dt>Loss</dt><dd>0.51 SSIM + 0.49 L1</dd></div>
            <div><dt>Optimisation</dt><dd>10 Optuna trials · 100 epochs · cosine schedule</dd></div>
            <div><dt>Selected LR</dt><dd>1.6e-3 · weight decay 3.4e-6</dd></div>
            <div><dt>Images</dt><dd>256² magnitude · 8-class labels</dd></div>
          </dl>
        </div>
      </div>

      <div className={styles.datasetLedger}>
        <div>
          <span className={styles.microLabel}>MM-WHS SLICE COUNTS · AS REPORTED</span>
          <h4>Evaluation ledger</h4>
        </div>
        <div className={styles.ledgerTable} role="table" aria-label="Reported data split counts">
          <div role="row" className={styles.ledgerHead}><span role="columnheader">Modality</span><span role="columnheader">Train</span><span role="columnheader">Validation</span><span role="columnheader">Test</span></div>
          <div role="row"><strong role="rowheader">MR</strong><span role="cell">1,738</span><span role="cell">254</span><span role="cell">236</span></div>
          <div role="row"><strong role="rowheader">CT</strong><span role="cell">3,389</span><span role="cell">382</span><span role="cell">484</span></div>
        </div>
        <p>Images are referenced by the study but are not present in this showcase. K-space was retrospectively simulated from magnitude images.</p>
      </div>

      <div className={styles.limitations}>
        <div>
          <span>01</span>
          <strong>Acquisition realism</strong>
          <p>Simulated single-coil Cartesian undersampling from magnitude images; no prospective raw acquisition.</p>
        </div>
        <div>
          <span>02</span>
          <strong>Uncertainty scale</strong>
          <p>Only three ensemble members, with moderate uncertainty-to-segmentation correlation.</p>
        </div>
        <div>
          <span>03</span>
          <strong>Use boundary</strong>
          <p>Research evaluation, not clinical validation and not intended for diagnosis.</p>
        </div>
        <div>
          <span>04</span>
          <strong>Reuse boundary</strong>
          <p>The repository is publicly viewable but contains no explicit licence file; public access is not a reuse grant.</p>
        </div>
      </div>
    </section>
  );
}

export function MriTrustStudio() {
  const [view, setView] = useState<View>("reconstruction");

  return (
    <DemoWindow
      appName="TRUST LAB 1.0"
      title="Trustworthy MRI Reconstruction"
      status="REPORTED METRICS · SYNTHETIC VISUALS"
      statusTone="safe"
      className={styles.studio}
      footer={
        <>
          <span>PUBLIC SOURCE INSPECTION · NO EXPLICIT LICENCE</span>
          <span>NOT BUNDLED HERE: DATA · WEIGHTS · ASSESSMENT PDF</span>
        </>
      }
    >
      <div className={styles.disclaimer} role="note">
        <span>RESEARCH SHOWCASE</span>
        <p>
          Interactive calculations use repository-reported final-report aggregates that this exhibit
          has not independently reproduced. Scan-like graphics are generated anatomy schematics—not
          patient data, model inference or diagnostic evidence.
        </p>
        <strong>NOT FOR CLINICAL USE</strong>
      </div>

      <nav className={styles.tabs} aria-label="Trust analysis views">
        {viewLabels.map((item) => (
          <button key={item.id} type="button" aria-current={view === item.id ? "page" : undefined} onClick={() => setView(item.id)}>
            <span>{item.number}</span>
            <strong>{item.label}</strong>
          </button>
        ))}
      </nav>

      <div className={styles.viewShell}>
        {view === "reconstruction" ? <ReconstructionView /> : null}
        {view === "architecture" ? <ArchitectureView /> : null}
        {view === "uncertainty" ? <UncertaintyView /> : null}
        {view === "robustness" ? <RobustnessView /> : null}
        {view === "segmentation" ? <SegmentationView /> : null}
        {view === "audit" ? <AuditView /> : null}
      </div>
    </DemoWindow>
  );
}

export default MriTrustStudio;
