"use client";

import ClassicSelect from "../ClassicSelect";

import {
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { DemoWindow } from "./DemoChrome";
import styles from "./MolecularRecognitionStudio.module.css";

type StudioTab = "assignment" | "atlas" | "method";
type AssignmentView = "spectrum" | "matches" | "equations";
type MoleculeId = "exaltenone" | "muscone";
type BandId = "full" | "low" | "mid" | "high" | "focus";

type Candidate = {
  id: string;
  label: string;
  energy: number;
  constants: readonly [number, number, number];
  lines: readonly number[];
  pucker: number;
  phase: number;
  ellipticity: number;
};

type MoleculeRecord = {
  id: MoleculeId;
  name: string;
  formula: string;
  ring: string;
  publicCount: string;
  candidates: readonly Candidate[];
  residuals: readonly number[];
  distractors: readonly number[];
};

type ObservedLine = {
  id: string;
  frequency: number;
  intensity: number;
  kind: "target" | "background";
};

type Match = {
  predictedIndex: number;
  predicted: number;
  observed: number;
  residualKHz: number;
  intensity: number;
};

type Point3 = { x: number; y: number; z: number; atom: "C" | "O" };

const ABSTRACT_URL = "https://isms.illinois.edu/2025/schedule/schedule_session.php?sID=1669";
const CPROT_URL =
  "https://github.com/samuel-zhang01/CPROT-Spec-Fast-Plotter/tree/9c6496d7b3c9f67dad163bf6f289de5e22ed3fd0";

const studioTabs: Array<{ id: StudioTab; number: string; label: string; short: string }> = [
  { id: "assignment", number: "01", label: "Assignment desk", short: "FIT" },
  { id: "atlas", number: "02", label: "Conformer atlas", short: "3D" },
  { id: "method", number: "03", label: "Evidence & method", short: "LOG" },
];

const exaltenoneBase = [
  2158.41, 2387.612, 2744.828, 3098.177, 3521.744, 3990.332,
  4475.821, 5068.413, 5724.055, 6418.672, 7122.491, 7764.208,
] as const;

const musconeBase = [
  2079.276, 2498.514, 2811.809, 3260.428, 3795.146, 4157.391,
  4692.735, 5218.607, 5864.352, 6533.744, 7210.568, 7891.223,
] as const;

function shiftedLines(base: readonly number[], offsets: readonly number[]) {
  return base.map((frequency, index) => Number((frequency + offsets[index % offsets.length]).toFixed(6)));
}

const molecules: Record<MoleculeId, MoleculeRecord> = {
  exaltenone: {
    id: "exaltenone",
    name: "Exaltenone",
    formula: "C₁₅H₂₆O",
    ring: "15-membered macrocyclic ketone",
    publicCount: ">20 conformations reported",
    residuals: [-42, 16, 53, -7, 77, -31, 28, -63, 11, 46, -19, 34],
    distractors: [2266.739, 2964.055, 3378.222, 4340.104, 5398.377, 6821.611, 7488.91],
    candidates: [
      {
        id: "E-01",
        label: "candidate E-01",
        energy: 0,
        constants: [816.42, 372.18, 318.57],
        lines: exaltenoneBase,
        pucker: 0.34,
        phase: 0.18,
        ellipticity: 0.08,
      },
      {
        id: "E-02",
        label: "candidate E-02",
        energy: 0.72,
        constants: [764.1, 401.56, 329.44],
        lines: shiftedLines(exaltenoneBase, [2.84, -1.71, 3.33, -2.46, 1.94, -3.08]),
        pucker: 0.46,
        phase: 0.78,
        ellipticity: 0.14,
      },
      {
        id: "E-03",
        label: "candidate E-03",
        energy: 1.38,
        constants: [842.84, 354.62, 305.22],
        lines: shiftedLines(exaltenoneBase, [0.031, 4.25, -3.81, -0.044, 2.68, -4.37]),
        pucker: 0.27,
        phase: 1.24,
        ellipticity: 0.04,
      },
      {
        id: "E-04",
        label: "candidate E-04",
        energy: 2.14,
        constants: [701.35, 427.6, 341.26],
        lines: shiftedLines(exaltenoneBase, [-5.12, 3.77, -2.94, 4.63, -3.58, 2.22]),
        pucker: 0.52,
        phase: 1.81,
        ellipticity: 0.18,
      },
    ],
  },
  muscone: {
    id: "muscone",
    name: "Muscone",
    formula: "C₁₆H₃₀O",
    ring: "15-membered macrocyclic ketone",
    publicCount: ">30 conformations reported",
    residuals: [36, -58, 21, 69, -13, 44, -72, 8, 51, -27, 18, -46],
    distractors: [2194.703, 2672.811, 3470.963, 4421.177, 5610.822, 6164.388, 7552.044],
    candidates: [
      {
        id: "M-01",
        label: "candidate M-01",
        energy: 0,
        constants: [752.36, 346.91, 297.48],
        lines: musconeBase,
        pucker: 0.4,
        phase: 0.42,
        ellipticity: 0.1,
      },
      {
        id: "M-02",
        label: "candidate M-02",
        energy: 0.51,
        constants: [731.18, 369.44, 304.19],
        lines: shiftedLines(musconeBase, [3.46, -2.11, 2.77, -3.9, 4.18, -2.68]),
        pucker: 0.31,
        phase: 0.96,
        ellipticity: 0.05,
      },
      {
        id: "M-03",
        label: "candidate M-03",
        energy: 1.12,
        constants: [789.57, 331.74, 286.33],
        lines: shiftedLines(musconeBase, [-0.028, 3.88, -4.1, 0.052, -3.26, 4.41]),
        pucker: 0.49,
        phase: 1.48,
        ellipticity: 0.16,
      },
      {
        id: "M-04",
        label: "candidate M-04",
        energy: 1.96,
        constants: [684.22, 408.83, 322.72],
        lines: shiftedLines(musconeBase, [5.08, -4.36, 3.19, -2.82, 4.74, -3.55]),
        pucker: 0.56,
        phase: 2.06,
        ellipticity: 0.21,
      },
    ],
  },
};

const pipeline = [
  {
    number: "01",
    title: "Search conformers",
    tag: "PUBLIC ABSTRACT",
    detail:
      "Several conformational searches mapped the flexible macrocycles. The public record does not disclose the search settings or original candidate geometries.",
  },
  {
    number: "02",
    title: "Predict parameters",
    tag: "PUBLIC ABSTRACT",
    detail:
      "Various theoretical methods predicted relative energies and spectroscopic parameters. Method-by-method values are not reproduced here.",
  },
  {
    number: "03",
    title: "Acquire 2–8 GHz",
    tag: "PUBLIC ABSTRACT + REPO",
    detail:
      "CP-FTMW measurements covered 2–8 GHz. The 2022 MATLAB repository contains two-column Exaltenone traces across the same band; raw rows are deliberately not embedded.",
  },
  {
    number: "04",
    title: "Compare obs. / calc.",
    tag: "PUBLIC ABSTRACT",
    detail:
      "Experimental and theoretical spectroscopic parameters were compared to identify plausible conformations. This browser uses an explicitly documented nearest-line teaching algorithm.",
  },
  {
    number: "05",
    title: "Assign structures",
    tag: "2025 PUBLIC RECORD",
    detail:
      "The conference abstract reports more than 20 Exaltenone and more than 30 Muscone conformations observed and identified at that point in the study.",
  },
] as const;

const bands: Array<{ id: Exclude<BandId, "focus">; label: string; range: readonly [number, number] }> = [
  { id: "full", label: "2–8 GHz", range: [2000, 8000] },
  { id: "low", label: "2–4", range: [2000, 4000] },
  { id: "mid", label: "4–6", range: [4000, 6000] },
  { id: "high", label: "6–8", range: [6000, 8000] },
];

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function buildObserved(record: MoleculeRecord): ObservedLine[] {
  const target = record.candidates[0].lines.map((frequency, index) => ({
    id: `${record.id}-target-${index}`,
    frequency: frequency + record.residuals[index] / 1000,
    intensity: 0.46 + ((index * 37) % 51) / 100,
    kind: "target" as const,
  }));
  const background = record.distractors.map((frequency, index) => ({
    id: `${record.id}-background-${index}`,
    frequency,
    intensity: 0.2 + ((index * 23) % 34) / 100,
    kind: "background" as const,
  }));
  return [...target, ...background].sort((left, right) => left.frequency - right.frequency);
}

function matchCatalog(
  predicted: readonly number[],
  observed: readonly ObservedLine[],
  toleranceKHz: number,
  offsetKHz: number,
) {
  const unused = new Set(observed.map((_, index) => index));
  const matches: Match[] = [];
  predicted.forEach((rawFrequency, predictedIndex) => {
    const adjusted = rawFrequency + offsetKHz / 1000;
    let nearestIndex = -1;
    let nearestDelta = Number.POSITIVE_INFINITY;
    unused.forEach((observedIndex) => {
      const delta = Math.abs(observed[observedIndex].frequency - adjusted);
      if (delta < nearestDelta) {
        nearestDelta = delta;
        nearestIndex = observedIndex;
      }
    });
    if (nearestIndex >= 0 && nearestDelta * 1000 <= toleranceKHz) {
      const line = observed[nearestIndex];
      unused.delete(nearestIndex);
      matches.push({
        predictedIndex,
        predicted: adjusted,
        observed: line.frequency,
        residualKHz: (line.frequency - adjusted) * 1000,
        intensity: line.intensity,
      });
    }
  });
  return matches;
}

function rootMeanSquare(values: readonly number[]) {
  if (values.length === 0) return null;
  return Math.sqrt(values.reduce((sum, value) => sum + value ** 2, 0) / values.length);
}

function boltzmannPopulations(candidates: readonly Candidate[], temperature: number) {
  const gasConstant = 0.008314462618; // kJ mol⁻¹ K⁻¹
  const weights = candidates.map((candidate) => Math.exp(-candidate.energy / (gasConstant * temperature)));
  const partition = weights.reduce((sum, value) => sum + value, 0);
  return weights.map((value) => value / partition);
}

function formatSigned(value: number, digits = 1) {
  return `${value >= 0 ? "+" : "−"}${Math.abs(value).toFixed(digits)}`;
}

function SpectrumPlot({
  record,
  candidate,
  observed,
  matches,
  offsetKHz,
  noise,
  range,
  focusedFrequency,
}: {
  record: MoleculeRecord;
  candidate: Candidate;
  observed: readonly ObservedLine[];
  matches: readonly Match[];
  offsetKHz: number;
  noise: number;
  range: readonly [number, number];
  focusedFrequency: number | null;
}) {
  const rawId = useId();
  const chartId = `recognition-${rawId.replace(/:/g, "")}`;
  const [minimum, maximum] = range;
  const span = maximum - minimum;
  const plot = { x: 58, y: 34, width: 790, height: 222 };
  const visibleObserved = observed.filter((line) => line.frequency >= minimum && line.frequency <= maximum);
  const visiblePredicted = candidate.lines
    .map((frequency, index) => ({ index, frequency: frequency + offsetKHz / 1000 }))
    .filter((line) => line.frequency >= minimum && line.frequency <= maximum);
  const peakWidth = Math.max(0.006, span / 1900);
  const samples = Array.from({ length: 801 }, (_, index) => {
    const frequency = minimum + (index / 800) * span;
    const baseline = 0.018 + noise * (0.006 * Math.sin(index * 0.61) + 0.004 * Math.cos(index * 0.173));
    const signal = visibleObserved.reduce((sum, line) => {
      const distance = (frequency - line.frequency) / peakWidth;
      return sum + line.intensity * Math.exp(-0.5 * distance ** 2);
    }, 0);
    return { frequency, intensity: Math.max(0, baseline + signal) };
  });
  const yMaximum = Math.max(0.2, ...samples.map((sample) => sample.intensity)) * 1.08;
  const xOf = (frequency: number) => plot.x + ((frequency - minimum) / span) * plot.width;
  const yOf = (intensity: number) => plot.y + plot.height - (intensity / yMaximum) * plot.height;
  const path = samples
    .map((sample, index) => `${index === 0 ? "M" : "L"}${xOf(sample.frequency).toFixed(2)},${yOf(sample.intensity).toFixed(2)}`)
    .join(" ");
  const ticks = Array.from({ length: 5 }, (_, index) => minimum + (index / 4) * span);
  const isFine = span < 10;

  return (
    <svg className={styles.spectrum} viewBox="0 0 880 330" role="img" aria-labelledby={`${chartId}-title ${chartId}-desc`}>
      <title id={`${chartId}-title`}>{record.name} synthetic observed and predicted spectrum comparison</title>
      <desc id={`${chartId}-desc`}>
        Synthetic CP-FTMW teaching trace from {minimum.toFixed(isFine ? 3 : 0)} to {maximum.toFixed(isFine ? 3 : 0)} megahertz.
        {` ${visibleObserved.length} observed peaks, ${visiblePredicted.length} predicted sticks and ${matches.length} matches are represented.`}
      </desc>
      <defs>
        <clipPath id={`${chartId}-clip`}>
          <rect x={plot.x} y={plot.y} width={plot.width} height={plot.height} />
        </clipPath>
        <linearGradient id={`${chartId}-fade`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#1bc6d6" stopOpacity="0.22" />
          <stop offset="1" stopColor="#1bc6d6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="880" height="330" fill="#091622" />
      <rect x={plot.x} y={plot.y} width={plot.width} height={plot.height} fill="#0d1d2b" stroke="#486071" />

      {Array.from({ length: 4 }, (_, index) => {
        const y = plot.y + (index / 3) * plot.height;
        return <line key={index} x1={plot.x} x2={plot.x + plot.width} y1={y} y2={y} className={styles.chartGrid} />;
      })}
      {ticks.map((tick) => {
        const x = xOf(tick);
        return (
          <g key={tick}>
            <line x1={x} x2={x} y1={plot.y} y2={plot.y + plot.height} className={styles.chartGrid} />
            <text x={x} y={plot.y + plot.height + 20} textAnchor="middle" className={styles.chartTick}>
              {tick.toFixed(isFine ? 3 : 0)}
            </text>
          </g>
        );
      })}

      <g clipPath={`url(#${chartId}-clip)`}>
        <path d={`${path} L${plot.x + plot.width},${plot.y + plot.height} L${plot.x},${plot.y + plot.height} Z`} fill={`url(#${chartId}-fade)`} />
        <path d={path} fill="none" stroke="#70e2e9" strokeWidth="1.7" vectorEffect="non-scaling-stroke" />
        {visiblePredicted.map((line) => {
          const matched = matches.some((match) => match.predictedIndex === line.index);
          return (
            <line
              key={`predicted-${line.index}`}
              x1={xOf(line.frequency)}
              x2={xOf(line.frequency)}
              y1={plot.y + plot.height - (matched ? 56 : 34)}
              y2={plot.y + plot.height}
              stroke={matched ? "#f0bd50" : "#d97a79"}
              strokeWidth={matched ? 2 : 1.2}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
        {focusedFrequency !== null && focusedFrequency >= minimum && focusedFrequency <= maximum ? (
          <line
            x1={xOf(focusedFrequency)}
            x2={xOf(focusedFrequency)}
            y1={plot.y}
            y2={plot.y + plot.height}
            stroke="#fff"
            strokeDasharray="4 3"
            strokeWidth="1.2"
          />
        ) : null}
      </g>

      <text x={plot.x} y="20" className={styles.chartLabel}>SYNTHETIC OBSERVATION</text>
      <g transform="translate(633 13)">
        <line x1="0" x2="22" y1="0" y2="0" stroke="#70e2e9" strokeWidth="2" />
        <text x="28" y="4" className={styles.chartLegend}>observed trace</text>
        <line x1="112" x2="112" y1="-8" y2="7" stroke="#f0bd50" strokeWidth="2" />
        <text x="121" y="4" className={styles.chartLegend}>matched prediction</text>
      </g>
      <text x={453} y="315" textAnchor="middle" className={styles.chartAxis}>Frequency / MHz</text>
      <text x="17" y="146" textAnchor="middle" transform="rotate(-90 17 146)" className={styles.chartAxis}>Intensity / a.u.</text>
      <text x={plot.x + 8} y={plot.y + plot.height - 8} className={styles.stickLabel}>CALCULATED STICKS · {candidate.id}</text>
    </svg>
  );
}

function makeGeometry(record: MoleculeRecord, candidate: Candidate): Point3[] {
  const ring = Array.from({ length: 15 }, (_, index) => {
    const theta = (index / 15) * Math.PI * 2;
    const radialRipple = 1 + 0.055 * Math.sin(theta * 4 + candidate.phase);
    return {
      x: Math.cos(theta) * radialRipple * (1 + candidate.ellipticity),
      y: Math.sin(theta) * radialRipple * (0.84 - candidate.ellipticity * 0.18),
      z:
        candidate.pucker * Math.sin(theta * 3 + candidate.phase) +
        candidate.pucker * 0.34 * Math.sin(theta * 5 - candidate.phase),
      atom: "C" as const,
    };
  });
  const carbonylCarbon = ring[0];
  const oxygen = {
    x: carbonylCarbon.x * 1.42,
    y: carbonylCarbon.y * 1.42,
    z: carbonylCarbon.z + 0.16,
    atom: "O" as const,
  };
  if (record.id === "muscone") {
    const branch = ring[1];
    return [
      ...ring,
      oxygen,
      {
        x: branch.x * 1.36,
        y: branch.y * 1.36,
        z: branch.z + 0.27,
        atom: "C" as const,
      },
    ];
  }
  return [...ring, oxygen];
}

function rotatePoint(point: Point3, yaw: number, pitch: number) {
  const yawRadians = (yaw * Math.PI) / 180;
  const pitchRadians = (pitch * Math.PI) / 180;
  const x1 = point.x * Math.cos(yawRadians) + point.z * Math.sin(yawRadians);
  const z1 = -point.x * Math.sin(yawRadians) + point.z * Math.cos(yawRadians);
  const y2 = point.y * Math.cos(pitchRadians) - z1 * Math.sin(pitchRadians);
  const z2 = point.y * Math.sin(pitchRadians) + z1 * Math.cos(pitchRadians);
  return { ...point, x: x1, y: y2, z: z2 };
}

function ConformerProjection({
  record,
  candidate,
  yaw,
  pitch,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: {
  record: MoleculeRecord;
  candidate: Candidate;
  yaw: number;
  pitch: number;
  onPointerDown: (event: ReactPointerEvent<SVGSVGElement>) => void;
  onPointerMove: (event: ReactPointerEvent<SVGSVGElement>) => void;
  onPointerUp: (event: ReactPointerEvent<SVGSVGElement>) => void;
}) {
  const rawId = useId();
  const titleId = `conformer-${rawId.replace(/:/g, "")}`;
  const points = makeGeometry(record, candidate).map((point) => rotatePoint(point, yaw, pitch));
  const project = (point: Point3) => {
    const scale = 118 * (1 + point.z * 0.055);
    return { x: 270 + point.x * scale, y: 176 + point.y * scale, z: point.z };
  };
  const projected = points.map(project);
  const bonds: Array<[number, number]> = Array.from({ length: 15 }, (_, index) => [index, (index + 1) % 15]);
  bonds.push([0, 15]);
  if (record.id === "muscone") bonds.push([1, 16]);
  const orderedAtoms = projected
    .map((point, index) => ({ ...point, index, atom: points[index].atom }))
    .sort((left, right) => left.z - right.z);

  return (
    <svg
      className={styles.conformerSvg}
      viewBox="0 0 540 352"
      role="img"
      aria-labelledby={`${titleId}-title ${titleId}-desc`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <title id={`${titleId}-title`}>{record.name} synthetic {candidate.id} conformer schematic</title>
      <desc id={`${titleId}-desc`}>
        Rotatable schematic of a 15-membered carbon ring with one oxygen atom. It is a synthetic teaching geometry, not an optimized structure from the research files.
      </desc>
      <defs>
        <radialGradient id={`${titleId}-carbon`} cx="35%" cy="30%">
          <stop offset="0" stopColor="#f7fbfc" />
          <stop offset="0.38" stopColor="#8297a7" />
          <stop offset="1" stopColor="#1b2d3c" />
        </radialGradient>
        <radialGradient id={`${titleId}-oxygen`} cx="35%" cy="30%">
          <stop offset="0" stopColor="#ffd9d2" />
          <stop offset="0.42" stopColor="#e45d65" />
          <stop offset="1" stopColor="#7d1f2d" />
        </radialGradient>
      </defs>
      <rect width="540" height="352" fill="#091622" />
      <g className={styles.orbitGrid}>
        <ellipse cx="270" cy="176" rx="193" ry="88" />
        <ellipse cx="270" cy="176" rx="133" ry="60" />
        <line x1="44" x2="496" y1="176" y2="176" />
        <line x1="270" x2="270" y1="30" y2="322" />
      </g>
      <g>
        {bonds.map(([from, to]) => {
          const start = projected[from];
          const end = projected[to];
          return (
            <line
              key={`${from}-${to}`}
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              stroke={to === 15 ? "#d76368" : "#9fb4c2"}
              strokeWidth={to === 15 ? 6 : 5}
              strokeLinecap="round"
              opacity={clamp(0.68 + ((start.z + end.z) / 2) * 0.13, 0.42, 0.94)}
            />
          );
        })}
      </g>
      <g>
        {orderedAtoms.map((point) => {
          const radius = clamp(8.2 + point.z * 1.5, 6.5, 11.5);
          return (
            <g key={point.index}>
              <circle cx={point.x + 2} cy={point.y + 3} r={radius + 1} fill="#02080d" opacity="0.55" />
              <circle
                cx={point.x}
                cy={point.y}
                r={point.atom === "O" ? radius + 2 : radius}
                fill={`url(#${titleId}-${point.atom === "O" ? "oxygen" : "carbon"})`}
                stroke={point.atom === "O" ? "#ff9b9b" : "#d2dde3"}
                strokeWidth="1"
              />
              {point.atom === "O" ? <text x={point.x} y={point.y + 3} textAnchor="middle" className={styles.atomLabel}>O</text> : null}
            </g>
          );
        })}
      </g>
      <g className={styles.axisGlyph} transform="translate(50 292)">
        <line x1="0" x2="37" y1="0" y2="0" className={styles.axisA} />
        <line x1="0" x2="0" y1="0" y2="-37" className={styles.axisB} />
        <line x1="0" x2="25" y1="0" y2="22" className={styles.axisC} />
        <text x="43" y="4">a</text><text x="-4" y="-43">b</text><text x="29" y="29">c</text>
      </g>
      <text x="270" y="24" textAnchor="middle" className={styles.projectionTitle}>SYNTHETIC GEOMETRY · DRAG TO ROTATE</text>
      <text x="270" y="338" textAnchor="middle" className={styles.projectionFooter}>{candidate.id} · yaw {Math.round(yaw)}° · pitch {Math.round(pitch)}°</text>
    </svg>
  );
}

function RangeControl({
  id,
  label,
  value,
  minimum,
  maximum,
  step,
  output,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  minimum: number;
  maximum: number;
  step: number;
  output: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className={styles.rangeControl} htmlFor={id}>
      <span><b>{label}</b><output htmlFor={id}>{output}</output></span>
      <input
        id={id}
        type="range"
        min={minimum}
        max={maximum}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

export function MolecularRecognitionStudio() {
  const [activeTab, setActiveTab] = useState<StudioTab>("assignment");
  const [moleculeId, setMoleculeId] = useState<MoleculeId>("exaltenone");
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [assignmentView, setAssignmentView] = useState<AssignmentView>("spectrum");
  const [draftTolerance, setDraftTolerance] = useState(85);
  const [draftOffset, setDraftOffset] = useState(0);
  const [tolerance, setTolerance] = useState(85);
  const [offset, setOffset] = useState(0);
  const [noise, setNoise] = useState(0.65);
  const [temperature, setTemperature] = useState(180);
  const [band, setBand] = useState<BandId>("full");
  const [focusRange, setFocusRange] = useState<readonly [number, number]>([2000, 8000]);
  const [focusedFrequency, setFocusedFrequency] = useState<number | null>(null);
  const [runNumber, setRunNumber] = useState(1);
  const [message, setMessage] = useState(
    "Synthetic line catalog loaded. E-01 is the hidden reference candidate; run the documented matcher or test a decoy.",
  );
  const [yaw, setYaw] = useState(-24);
  const [pitch, setPitch] = useState(24);
  const [pipelineStage, setPipelineStage] = useState(3);
  const drag = useRef<{ x: number; y: number; yaw: number; pitch: number } | null>(null);

  const record = molecules[moleculeId];
  const candidate = record.candidates[candidateIndex] ?? record.candidates[0];
  const observed = useMemo(() => buildObserved(record), [record]);
  const matches = useMemo(
    () => matchCatalog(candidate.lines, observed, tolerance, offset),
    [candidate, observed, tolerance, offset],
  );
  const rms = rootMeanSquare(matches.map((match) => match.residualKHz));
  const populations = useMemo(
    () => boltzmannPopulations(record.candidates, temperature),
    [record, temperature],
  );
  const candidateResults = useMemo(
    () => record.candidates.map((entry) => matchCatalog(entry.lines, observed, tolerance, offset)),
    [record, observed, tolerance, offset],
  );
  const selectedPopulation = populations[candidateIndex] ?? 0;
  const activeBand = bands.find((entry) => entry.id === band);
  const chartRange = band === "focus" ? focusRange : (activeBand?.range ?? bands[0].range);
  const geometry = useMemo(() => makeGeometry(record, candidate), [record, candidate]);
  const ringOnly = geometry.slice(0, 15);
  const puckerRms = Math.sqrt(ringOnly.reduce((sum, point) => sum + point.z ** 2, 0) / ringOnly.length);
  const radiusOfGyration = Math.sqrt(
    ringOnly.reduce((sum, point) => sum + point.x ** 2 + point.y ** 2 + point.z ** 2, 0) / ringOnly.length,
  );

  function chooseMolecule(next: MoleculeId) {
    setMoleculeId(next);
    setCandidateIndex(0);
    setBand("full");
    setFocusedFrequency(null);
    setMessage(`${molecules[next].name} synthetic catalog loaded. Candidate ${molecules[next].candidates[0].id} is the controlled reference.`);
  }

  function runComparison() {
    const nextTolerance = Math.round(clamp(draftTolerance, 10, 250));
    const nextOffset = Math.round(clamp(draftOffset, -150, 150));
    const nextMatches = matchCatalog(candidate.lines, observed, nextTolerance, nextOffset);
    const nextRms = rootMeanSquare(nextMatches.map((match) => match.residualKHz));
    setTolerance(nextTolerance);
    setOffset(nextOffset);
    setRunNumber((value) => value + 1);
    setMessage(
      `Pass ${runNumber + 1}: ${candidate.id} matched ${nextMatches.length}/${candidate.lines.length} lines` +
        `${nextRms === null ? ". No RMS is defined." : ` with ${nextRms.toFixed(1)} kHz RMS.`}`,
    );
  }

  function resetMatcher() {
    setDraftTolerance(85);
    setDraftOffset(0);
    setTolerance(85);
    setOffset(0);
    setCandidateIndex(0);
    setBand("full");
    setFocusedFrequency(null);
    setMessage("Matcher reset to the deterministic reference: 85 kHz tolerance, zero calibration offset.");
  }

  function focusMatch(match: Match) {
    const halfSpan = 0.32;
    setFocusRange([Math.max(2000, match.observed - halfSpan), Math.min(8000, match.observed + halfSpan)]);
    setFocusedFrequency(match.observed);
    setBand("focus");
    setAssignmentView("spectrum");
    setMessage(`Focused observed line at ${match.observed.toFixed(6)} MHz; dashed cursor marks the assigned peak.`);
  }

  function startDrag(event: ReactPointerEvent<SVGSVGElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { x: event.clientX, y: event.clientY, yaw, pitch };
  }

  function moveDrag(event: ReactPointerEvent<SVGSVGElement>) {
    if (!drag.current) return;
    setYaw(drag.current.yaw + (event.clientX - drag.current.x) * 0.55);
    setPitch(clamp(drag.current.pitch - (event.clientY - drag.current.y) * 0.4, -75, 75));
  }

  function stopDrag(event: ReactPointerEvent<SVGSVGElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    drag.current = null;
  }

  function handleStudioTabKey(event: ReactKeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % studioTabs.length;
    else if (event.key === "ArrowLeft") nextIndex = (index - 1 + studioTabs.length) % studioTabs.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = studioTabs.length - 1;
    else return;

    event.preventDefault();
    setActiveTab(studioTabs[nextIndex].id);
    const tabList = event.currentTarget.closest('[role="tablist"]');
    const tabs = tabList?.querySelectorAll<HTMLElement>('[role="tab"]');
    tabs?.[nextIndex]?.focus();
  }

  return (
    <DemoWindow
      appName="MOLECULAR RECOGNITION · LAB"
      title="Macrocycle Assignment Workbench"
      status="PUBLIC RECORD + SYNTHETIC DATA"
      purpose="Demonstrate how rotational spectroscopists distinguish plausible molecular conformers by matching several predicted and observed transitions."
      tryThis="Offset the synthetic spectrum, compare a candidate with the decoy, then focus a matched transition."
      watchFor="Residuals and assignment confidence change across multiple lines; a single nearby peak is not treated as proof."
      statusTone="safe"
      className={styles.studio}
      footer={
        <>
          <span>CP-FTMW · 2–8 GHz · CONFERENCE RECORD 2025</span>
          <span>NO ASSESSED FILES · NO RAW EXPERIMENTAL ROWS</span>
        </>
      }
    >
      <section className={styles.hero} aria-labelledby="recognition-studio-title">
        <div className={styles.heroCopy}>
          <span>MOLECULAR SHAPE → ROTATIONAL SIGNATURE</span>
          <h2 id="recognition-studio-title">Compare theoretical predictions with the observed spectrum.</h2>
          <p>
            Reconstructed from a public MATLAB artifact and the 2025 ISMS conference record that names Samuel as a co-author.
            Every number you can manipulate below is synthetic; the research facts are kept separate and cited.
          </p>
        </div>
        <div className={styles.heroInstrument} aria-hidden="true">
          <div className={styles.instrumentRing}><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
          <span>2</span><b>GHz</b><em>CP–FTMW</em><b>GHz</b><span>8</span>
        </div>
      </section>

      <div className={styles.truthStrip} role="note">
        <strong>DISPLAY CONTRACT</strong>
        <p><b>Public facts:</b> molecules, method, range, comparison workflow and reported counts. <b>Simulation:</b> spectra, constants, energies, geometries and matches.</p>
        <span>RAW DATA STAYS OUT</span>
      </div>

      <div className={styles.studioTabs} role="tablist" aria-label="Molecular recognition workbench sections">
        {studioTabs.map((tab, index) => (
          <button
            key={tab.id}
            id={`recognition-tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={activeTab === tab.id ? `recognition-panel-${tab.id}` : undefined}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={(event) => handleStudioTabKey(event, index)}
          >
            <span>{tab.number}</span><strong>{tab.label}</strong><small>{tab.short}</small>
          </button>
        ))}
      </div>

      <div className={styles.workbench}>
        {activeTab === "assignment" ? (
          <section
            id="recognition-panel-assignment"
            role="tabpanel"
            aria-labelledby="recognition-tab-assignment"
            className={styles.assignmentPanel}
          >
            <div className={styles.sectionHeading}>
              <div><span>OBSERVED ↔ CALCULATED</span><h3>Greedy line-assignment sandbox</h3><p>Change the tolerance, add a calibration offset, test decoys and inspect every accepted residual. The matcher uses a documented ordered nearest-neighbour heuristic. It is neither a global bipartite fit nor the group&apos;s expert assignment workflow.</p></div>
              <div className={styles.recordBadge}><small>RESEARCH BAND</small><strong>2–8 GHz</strong><span>publicly documented</span></div>
            </div>

            <div className={styles.assignmentGrid}>
              <aside className={styles.controlPanel} aria-label="Assignment controls">
                <div className={styles.panelTitle}><span>CONTROL DESK</span><b>RUN {String(runNumber).padStart(2, "0")}</b></div>

                <fieldset className={styles.segmentField}>
                  <legend>Molecule</legend>
                  <div>
                    {(Object.keys(molecules) as MoleculeId[]).map((id) => (
                      <button key={id} type="button" aria-pressed={moleculeId === id} onClick={() => chooseMolecule(id)}>
                        {molecules[id].name}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <label className={styles.selectField}>
                  <span>Calculated catalog</span>
                  <ClassicSelect
                    value={candidateIndex}
                    onChange={(event) => {
                      const next = Number(event.target.value);
                      setCandidateIndex(next);
                      setMessage(`${record.candidates[next].id} selected. Re-run or inspect its line-hit pattern.`);
                    }}
                  >
                    {record.candidates.map((entry, index) => <option key={entry.id} value={index}>{entry.id} · synthetic</option>)}
                  </ClassicSelect>
                </label>

                <RangeControl
                  id="recognition-tolerance"
                  label="Match tolerance"
                  value={draftTolerance}
                  minimum={10}
                  maximum={250}
                  step={5}
                  output={`±${draftTolerance} kHz`}
                  onChange={setDraftTolerance}
                />
                <RangeControl
                  id="recognition-offset"
                  label="Catalog offset"
                  value={draftOffset}
                  minimum={-150}
                  maximum={150}
                  step={5}
                  output={`${formatSigned(draftOffset, 0)} kHz`}
                  onChange={setDraftOffset}
                />
                <RangeControl
                  id="recognition-noise"
                  label="Display noise"
                  value={noise}
                  minimum={0}
                  maximum={1}
                  step={0.05}
                  output={`${Math.round(noise * 100)}%`}
                  onChange={setNoise}
                />

                <div className={styles.controlActions}>
                  <button type="button" className={styles.runButton} onClick={runComparison}><span aria-hidden="true">▶</span> Run comparison</button>
                  <button type="button" onClick={resetMatcher}>Reset</button>
                </div>

                <div className={styles.moleculeCard}>
                  <span>SOURCE FACTS</span>
                  <strong>{record.name}</strong>
                  <dl>
                    <div><dt>Formula</dt><dd>{record.formula}</dd></div>
                    <div><dt>Ring</dt><dd>15 atoms</dd></div>
                    <div><dt>2025 status</dt><dd>{record.publicCount}</dd></div>
                  </dl>
                </div>
              </aside>

              <div className={styles.analysisDesk}>
                <div className={styles.deskToolbar}>
                  <div className={styles.viewSwitch} role="group" aria-label="Analysis view">
                    {(["spectrum", "matches", "equations"] as AssignmentView[]).map((view) => (
                      <button key={view} type="button" aria-pressed={assignmentView === view} onClick={() => setAssignmentView(view)}>
                        {view === "spectrum" ? "Spectrum" : view === "matches" ? "Match ledger" : "Equations"}
                      </button>
                    ))}
                  </div>
                  <div className={styles.bandSwitch} role="group" aria-label="Spectrum frequency window">
                    {bands.map((entry) => (
                      <button
                        key={entry.id}
                        type="button"
                        aria-pressed={band === entry.id}
                        onClick={() => { setBand(entry.id); setFocusedFrequency(null); }}
                      >{entry.label}</button>
                    ))}
                    {band === "focus" ? <button type="button" aria-pressed="true">peak focus</button> : null}
                  </div>
                </div>

                <div className={styles.metricRail} aria-label="Current comparison metrics">
                  <div><span>LINE HITS</span><strong>{matches.length}<small>/{candidate.lines.length}</small></strong></div>
                  <div><span>RMS RESIDUAL</span><strong>{rms === null ? "—" : rms.toFixed(1)}<small> kHz</small></strong></div>
                  <div><span>ACTIVE WINDOW</span><strong>{chartRange[0].toFixed(chartRange[1] - chartRange[0] < 10 ? 3 : 0)}<small> → {chartRange[1].toFixed(chartRange[1] - chartRange[0] < 10 ? 3 : 0)}</small></strong></div>
                  <div><span>CANDIDATE</span><strong>{candidate.id}</strong></div>
                </div>

                {assignmentView === "spectrum" ? (
                  <div className={styles.spectrumFrame}>
                    <SpectrumPlot
                      record={record}
                      candidate={candidate}
                      observed={observed}
                      matches={matches}
                      offsetKHz={offset}
                      noise={noise}
                      range={chartRange}
                      focusedFrequency={focusedFrequency}
                    />
                    <div className={styles.chartReadout}>
                      <span>SYNTHETIC FFT VIEW</span>
                      <p>Teal is a deterministic teaching trace; gold sticks pass the current one-to-one tolerance test.</p>
                      <strong>{observed.length} OBS. LINES</strong>
                    </div>
                  </div>
                ) : null}

                {assignmentView === "matches" ? (
                  <div className={styles.matchView}>
                    <div className={styles.tableHeader}>
                      <div><span>AUDITABLE OUTPUT</span><h4>Accepted line pairs</h4></div>
                      <p>Click any row to inspect the sub-MHz neighbourhood around that synthetic peak.</p>
                    </div>
                    <div className={styles.tableWrap}>
                      <table>
                        <caption>Accepted nearest-neighbour matches for {candidate.id}; all frequencies are synthetic</caption>
                        <thead><tr><th scope="col">Pair</th><th scope="col">Calculated / MHz</th><th scope="col">Observed / MHz</th><th scope="col">O−C / kHz</th><th scope="col">Inspect</th></tr></thead>
                        <tbody>
                          {matches.length ? matches.map((match, index) => (
                            <tr key={`${match.predictedIndex}-${match.observed}`}>
                              <th scope="row">{String(index + 1).padStart(2, "0")}</th>
                              <td>{match.predicted.toFixed(6)}</td>
                              <td>{match.observed.toFixed(6)}</td>
                              <td className={Math.abs(match.residualKHz) > tolerance * 0.75 ? styles.warmResidual : ""}>{formatSigned(match.residualKHz, 1)}</td>
                              <td><button type="button" onClick={() => focusMatch(match)}>Focus peak</button></td>
                            </tr>
                          )) : (
                            <tr><td colSpan={5} className={styles.emptyTable}>No one-to-one pairs pass ±{tolerance} kHz. Widen tolerance or test the reference catalog.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : null}

                {assignmentView === "equations" ? (
                  <div className={styles.equationView}>
                    <div className={styles.equationCard}>
                      <span>01 · CALIBRATION</span>
                      <div className={styles.formula}>ν̂<sub>j</sub> = ν<sup>calc</sup><sub>j</sub> + δ</div>
                      <p>The user-controlled offset δ is applied to every calculated line before matching.</p>
                    </div>
                    <div className={styles.equationCard}>
                      <span>02 · GREEDY ONE-TO-ONE MATCH</span>
                      <div className={styles.formula}>j* = arg min<sub>j ∈ unused</sub> |ν<sup>obs</sup><sub>i</sub> − ν̂<sub>j</sub>|</div>
                      <p>Predicted lines are visited in catalogue order; the nearest still-unused observation is accepted only when its absolute residual is no larger than tolerance τ. Changing order can change the result.</p>
                    </div>
                    <div className={styles.equationCard}>
                      <span>03 · FIT RECEIPT</span>
                      <div className={styles.formula}>RMS = √[(1/N) Σ(ν<sup>obs</sup><sub>i</sub> − ν̂<sub>j*</sub>)²]</div>
                      <p>Current output: {matches.length} pairs; {rms === null ? "RMS undefined" : `${rms.toFixed(2)} kHz RMS`}.</p>
                    </div>
                    <div className={`${styles.equationCard} ${styles.physicalCard}`}>
                      <span>PHYSICAL BACKGROUND · NOT A FIT CLAIM</span>
                      <div className={styles.formula}>A = h / (8π²I<sub>a</sub>)</div>
                      <p>Rotational constants are inversely related to principal moments of inertia. The public abstract says spectroscopic parameters were predicted; it does not publish the values used here.</p>
                    </div>
                    <pre className={styles.runReceipt} aria-label="Current matcher output">{`matcher_pass_${String(runNumber).padStart(2, "0")} {
  input: "synthetic/${moleculeId}/${candidate.id}"
  tolerance_kHz: ${tolerance}
  catalog_offset_kHz: ${offset}
  accepted_pairs: ${matches.length}
  rms_kHz: ${rms === null ? "null" : rms.toFixed(3)}
  assignment: "ordered greedy nearest-neighbour"
  global_optimum_claim: false
  network_calls: 0
}`}</pre>
                  </div>
                ) : null}
              </div>
            </div>

            <div className={styles.liveStatus} role="status" aria-live="polite">
              <span>ANALYSIS LOG</span><p>{message}</p><strong>DETERMINISTIC</strong>
            </div>

            <section className={styles.candidateBoard} aria-labelledby="candidate-board-title">
              <div className={styles.candidateHeading}>
                <div><span>SYNTHETIC SHORTLIST</span><h4 id="candidate-board-title">Candidate comparison board</h4></div>
                <RangeControl
                  id="recognition-temperature"
                  label="Illustrative Boltzmann T"
                  value={temperature}
                  minimum={80}
                  maximum={400}
                  step={10}
                  output={`${temperature} K`}
                  onChange={setTemperature}
                />
              </div>
              <p className={styles.populationCaveat}>Energy and population values are synthetic ranking aids, not measured conformer abundances or expansion temperature.</p>
              <div className={styles.candidateGrid}>
                {record.candidates.map((entry, index) => {
                  const result = candidateResults[index];
                  const entryRms = rootMeanSquare(result.map((match) => match.residualKHz));
                  return (
                    <button
                      key={entry.id}
                      type="button"
                      aria-pressed={candidateIndex === index}
                      onClick={() => { setCandidateIndex(index); setMessage(`${entry.id} moved to the analysis desk.`); }}
                    >
                      <span className={styles.candidateNumber}>{String(index + 1).padStart(2, "0")}</span>
                      <span className={styles.candidateIdentity}><strong>{entry.id}</strong><small>ΔE {entry.energy.toFixed(2)} kJ mol⁻¹</small></span>
                      <span className={styles.populationBar}><i style={{ "--bar-width": `${Math.max(3, populations[index] * 100)}%` } as CSSProperties} /><small>{(populations[index] * 100).toFixed(1)}%</small></span>
                      <span className={styles.hitScore}><strong>{result.length}/{entry.lines.length}</strong><small>{entryRms === null ? "no fit" : `${entryRms.toFixed(1)} kHz`}</small></span>
                    </button>
                  );
                })}
              </div>
            </section>
          </section>
        ) : null}

        {activeTab === "atlas" ? (
          <section
            id="recognition-panel-atlas"
            role="tabpanel"
            aria-labelledby="recognition-tab-atlas"
            className={styles.atlasPanel}
          >
            <div className={styles.sectionHeading}>
              <div><span>SHAPE ↔ INERTIA ↔ SPECTRUM</span><h3>Rotatable conformer atlas</h3><p>Explore why a flexible 15-membered ring can produce many distinguishable rotational signatures.</p></div>
              <div className={styles.syntheticStamp}>SCHEMATIC<br /><strong>NOT DFT</strong></div>
            </div>

            <div className={styles.atlasGrid}>
              <div className={styles.viewerCard}>
                <div className={styles.viewerToolbar}>
                  <div className={styles.moleculeButtons} role="group" aria-label="Atlas molecule">
                    {(Object.keys(molecules) as MoleculeId[]).map((id) => <button key={id} type="button" aria-pressed={moleculeId === id} onClick={() => chooseMolecule(id)}>{molecules[id].name}</button>)}
                  </div>
                  <label><span>Conformer</span><ClassicSelect value={candidateIndex} onChange={(event) => setCandidateIndex(Number(event.target.value))}>{record.candidates.map((entry, index) => <option key={entry.id} value={index}>{entry.id}</option>)}</ClassicSelect></label>
                </div>
                <div className={styles.projectionWrap}>
                  <ConformerProjection
                    record={record}
                    candidate={candidate}
                    yaw={yaw}
                    pitch={pitch}
                    onPointerDown={startDrag}
                    onPointerMove={moveDrag}
                    onPointerUp={stopDrag}
                  />
                </div>
                <div className={styles.rotationControls}>
                  <RangeControl id="recognition-yaw" label="Yaw" value={yaw} minimum={-180} maximum={180} step={1} output={`${Math.round(yaw)}°`} onChange={setYaw} />
                  <RangeControl id="recognition-pitch" label="Pitch" value={pitch} minimum={-75} maximum={75} step={1} output={`${Math.round(pitch)}°`} onChange={setPitch} />
                  <button type="button" onClick={() => { setYaw(-24); setPitch(24); }}>Reset view</button>
                </div>
              </div>

              <aside className={styles.geometryLedger} aria-label="Synthetic geometry calculations">
                <div className={styles.geometryHeader}><span>LIVE GEOMETRY LEDGER</span><strong>{record.formula}</strong></div>
                <div className={styles.constantBlock}>
                  <span>SYNTHETIC ROTATIONAL CONSTANTS / MHz</span>
                  <div>{(["A", "B", "C"] as const).map((axis, index) => <p key={axis}><b>{axis}</b><strong>{candidate.constants[index].toFixed(2)}</strong></p>)}</div>
                  <small>Larger principal moment ↔ smaller rotational constant.</small>
                </div>
                <dl className={styles.geometryMetrics}>
                  <div><dt>Ring atoms shown</dt><dd>15 C</dd></div>
                  <div><dt>Oxygen atoms</dt><dd>1 O</dd></div>
                  <div><dt>Puckering RMS</dt><dd>{puckerRms.toFixed(3)} u</dd></div>
                  <div><dt>Radius of gyration</dt><dd>{radiusOfGyration.toFixed(3)} u</dd></div>
                  <div><dt>Synthetic ΔE</dt><dd>{candidate.energy.toFixed(2)} kJ mol⁻¹</dd></div>
                  <div><dt>Illustrative weight</dt><dd>{(selectedPopulation * 100).toFixed(1)}%</dd></div>
                </dl>
                <div className={styles.geometryNote}>
                  <strong>Why the boundary matters</strong>
                  <p>This ring is generated from sinusoidal puckering controls. It demonstrates dimensional reasoning without posing as an unpublished optimized structure.</p>
                </div>
              </aside>
            </div>

            <section className={styles.energyLandscape} aria-labelledby="energy-landscape-title">
              <div className={styles.landscapeHeading}><div><span>RELATIVE-ENERGY SANDBOX</span><h4 id="energy-landscape-title">Four shapes, four rotational fingerprints</h4></div><p>Select a column to rotate that geometry and send its calculated sticks back to the assignment desk.</p></div>
              <div className={styles.energyChart}>
                {record.candidates.map((entry, index) => {
                  const height = 42 + (1 - entry.energy / 2.6) * 116;
                  return (
                    <button
                      key={entry.id}
                      type="button"
                      aria-pressed={candidateIndex === index}
                      aria-label={`Select ${entry.id}, synthetic relative energy ${entry.energy.toFixed(2)} kilojoules per mole`}
                      onClick={() => setCandidateIndex(index)}
                    >
                      <span className={styles.energyValue}>{entry.energy.toFixed(2)}</span>
                      <i style={{ height }}><b style={{ height: `${populations[index] * 100}%` }} /></i>
                      <strong>{entry.id}</strong>
                      <small>{(populations[index] * 100).toFixed(1)}%</small>
                    </button>
                  );
                })}
              </div>
              <div className={styles.energyLegend}><span><i /> lower synthetic ΔE</span><span><i /> Boltzmann fraction at {temperature} K</span></div>
            </section>
          </section>
        ) : null}

        {activeTab === "method" ? (
          <section
            id="recognition-panel-method"
            role="tabpanel"
            aria-labelledby="recognition-tab-method"
            className={styles.methodPanel}
          >
            <div className={styles.sectionHeading}>
              <div><span>PROVENANCE BEFORE POLISH</span><h3>What the sources support</h3><p>The public record is strong enough for a process reconstruction, but not for releasing the original analysis or asserting undocumented contribution details.</p></div>
              <div className={styles.auditSeal}><span>2 SOURCES</span><strong>0 RAW ROWS</strong><small>SHIPPED</small></div>
            </div>

            <div className={styles.pipeline} aria-label="Molecular recognition pipeline traced to source">
              {pipeline.map((stage, index) => (
                <button key={stage.number} type="button" aria-pressed={pipelineStage === index} onClick={() => setPipelineStage(index)}>
                  <span>{stage.number}</span><strong>{stage.title}</strong><small>{stage.tag}</small>
                </button>
              ))}
            </div>
            <div className={styles.stageDetail}>
              <span>{pipeline[pipelineStage].tag}</span>
              <strong>{pipeline[pipelineStage].number} · {pipeline[pipelineStage].title}</strong>
              <p>{pipeline[pipelineStage].detail}</p>
            </div>

            <div className={styles.evidenceGrid}>
              <section className={styles.publicRecord} aria-labelledby="public-record-title">
                <div className={styles.cardCap}><span>PRIMARY PUBLIC RECORD</span><strong>ISMS · 2025</strong></div>
                <h4 id="public-record-title">Macrocyclic musk conformational landscape</h4>
                <p>The official program lists Samuel among the KCL co-authors and records:</p>
                <ul>
                  <li>Muscone ({molecules.muscone.formula}) and Exaltenone ({molecules.exaltenone.formula}) as 15-membered macrocyclic ketones.</li>
                  <li>CP-FTMW spectroscopy across 2–8 GHz, supported by conformational searches and theoretical predictions.</li>
                  <li>Identification by comparing experimental and theoretical spectroscopic parameters.</li>
                  <li>More than 30 Muscone and more than 20 Exaltenone conformations observed and identified at the time of the abstract.</li>
                </ul>
                <a href={ABSTRACT_URL} target="_blank" rel="noreferrer">Open official session record <span aria-hidden="true">↗</span></a>
              </section>

              <section className={styles.sourceArtifact} aria-labelledby="source-artifact-title">
                <div className={styles.cardCap}><span>PUBLIC SOURCE ARTIFACT</span><strong>MATLAB · 2022</strong></div>
                <h4 id="source-artifact-title">CPROT Fast Spectroscopy Plotter</h4>
                <p>The pinned public repository independently establishes a MATLAB App Designer tool and Exaltenone two-column traces spanning 2,000–7,999.975 MHz.</p>
                <div className={styles.artifactStats}>
                  <div><span>APP</span><strong>.mlapp</strong></div>
                  <div><span>SAMPLE SHAPE</span><strong>240k × 2</strong></div>
                  <div><span>LICENCE</span><strong>NONE</strong></div>
                </div>
                <p className={styles.licenceWarning}><strong>No explicit repository licence:</strong> public access does not grant reuse rights. This exhibit links the commit and rebuilds concepts; it does not redistribute source or experiment rows.</p>
                <a href={CPROT_URL} target="_blank" rel="noreferrer">Inspect pinned repository <span aria-hidden="true">↗</span></a>
              </section>
            </div>

            <section className={styles.claimLedger} aria-labelledby="claim-ledger-title">
              <div className={styles.claimHeader}><div><span>CLAIM CONTROL</span><h4 id="claim-ledger-title">Evidence ledger</h4></div><p>Labels describe what can safely appear as fact on the project card.</p></div>
              <div className={styles.claimTableWrap} tabIndex={0} aria-label="Scrollable evidence ledger table">
                <table>
                  <caption>Source status of claims associated with the molecular-recognition project</caption>
                  <thead><tr><th scope="col">Claim</th><th scope="col">Status</th><th scope="col">Portfolio treatment</th></tr></thead>
                  <tbody>
                    <tr><th scope="row">Named co-author on the 2025 conference record</th><td><span className={styles.publicTag}>PUBLIC</span></td><td>Shown and linked.</td></tr>
                    <tr><th scope="row">2–8 GHz CP-FTMW + theory/experiment comparison</th><td><span className={styles.publicTag}>PUBLIC</span></td><td>Reconstructed with synthetic inputs.</td></tr>
                    <tr><th scope="row">20+ Exaltenone and 30+ Muscone conformations</th><td><span className={styles.publicTag}>PUBLIC</span></td><td>Attributed to the 2025 abstract.</td></tr>
                    <tr><th scope="row">MATLAB Exaltenone plotting artifact</th><td><span className={styles.sourceTag}>SOURCE</span></td><td>Pinned repository linked; no code/data copied.</td></tr>
                    <tr><th scope="row">40% faster analysis and research-group adoption</th><td><span className={styles.selfTag}>SELF-REPORTED</span></td><td>Not used as a verified demo metric.</td></tr>
                    <tr><th scope="row">Individual ownership of every assignment or method</th><td><span className={styles.absentTag}>NOT RESOLVED</span></td><td>Not claimed.</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            <div className={styles.boundaryGrid}>
              <section><span>SAFE TO SHOW</span><strong>Process & public outcome</strong><ul><li>Public abstract facts</li><li>Original browser calculations</li><li>Synthetic spectra and geometries</li><li>Source links and limitations</li></ul></section>
              <section><span>DELIBERATELY EXCLUDED</span><strong>Protected research material</strong><ul><li>Assessed reports and personal identifiers</li><li>Raw experimental rows</li><li>Unpublished optimized geometries</li><li>Third-party code or private notebooks</li></ul></section>
              <section><span>RECONSTRUCTION STATUS</span><strong>Educational, not analytical</strong><p>This workbench demonstrates the comparison logic and scientific intuition. It cannot reproduce or validate the research assignments without the original catalogs, settings and expert fitting workflow.</p></section>
            </div>
          </section>
        ) : null}
      </div>
    </DemoWindow>
  );
}

export default MolecularRecognitionStudio;
