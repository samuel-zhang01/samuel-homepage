"use client";

import { useId, useMemo, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { DemoWindow } from "./DemoChrome";
import styles from "./ChemistryCodingStudio.module.css";

type LabId = "metropolis" | "polymer" | "dynamics" | "quantum" | "audit";
type MethodView = "equation" | "algorithm" | "record";
type PolymerMode = "notebook" | "isotropic" | "self-avoiding";

type Point2 = { x: number; y: number };
type Point3 = { x: number; y: number; z: number };
type MonteCarloMove = {
  accepted: boolean;
  deltaEnergy: number;
  probability: number;
  particle: number;
};

const labTabs: Array<{ id: LabId; number: string; label: string; short: string }> = [
  { id: "metropolis", number: "01", label: "Metropolis sampler", short: "MC" },
  { id: "polymer", number: "02", label: "Polymer walks", short: "3D" },
  { id: "dynamics", number: "03", label: "Molecular dynamics", short: "MD" },
  { id: "quantum", number: "04", label: "Quantum ledger", short: "HF" },
  { id: "audit", number: "05", label: "Evidence trail", short: "LOG" },
];

const initialParticles: Point2[] = [
  { x: 0.19, y: 0.25 },
  { x: 0.42, y: 0.2 },
  { x: 0.69, y: 0.24 },
  { x: 0.28, y: 0.51 },
  { x: 0.58, y: 0.48 },
  { x: 0.8, y: 0.55 },
  { x: 0.22, y: 0.78 },
  { x: 0.51, y: 0.75 },
  { x: 0.76, y: 0.81 },
];

const basisEnergies = [
  { basis: "STO-3G", functions: 43, energy: -266.476489342162 },
  { basis: "3-21G", functions: 79, energy: -268.240126805497 },
  { basis: "6-31G*", functions: 121, energy: -269.739831990059 },
  { basis: "6-311G**", functions: 174, energy: -269.799886114754 },
  { basis: "6-311+G**", functions: 202, energy: -269.802673617679 },
] as const;

const cationPiLedger = [
  {
    id: "benzene",
    label: "Benzene",
    aromatic: -144768.2,
    sodium: -101442.73,
    complex: -246237.99,
  },
  {
    id: "phenylborane",
    label: "Phenylborane",
    aromatic: -160617.96,
    sodium: -101442.73,
    complex: -262085.0,
  },
  {
    id: "trifluorobenzene",
    label: "1,3,5-trifluorobenzene",
    aromatic: -330857.13,
    sodium: -101442.73,
    complex: -432312.31,
  },
  {
    id: "phenol",
    label: "Phenol",
    aromatic: -191737.67,
    sodium: -101442.73,
    complex: -293209.86,
  },
] as const;

const mdStages = [
  {
    number: "1/2",
    title: "Half velocity",
    formula: "v(t + Δt/2) = λv(t) + ½a(t)Δt",
    note: "Apply the thermostat scale, then advance velocity by half a time step.",
  },
  {
    number: "02",
    title: "Position + PBC",
    formula: "r(t + Δt) = r(t) + v(t + Δt/2)Δt",
    note: "Move particles and wrap coordinates that cross the periodic box.",
  },
  {
    number: "03",
    title: "Pair forces",
    formula: "a(t + Δt) ← −∇U\u2097\u2c7c",
    note: "Use minimum-image pair separations, the cutoff and the shifted potential.",
  },
  {
    number: "1/2",
    title: "Close velocity",
    formula: "v(t + Δt) = v(t + Δt/2) + ½a(t + Δt)Δt",
    note: "Complete velocity Verlet with the newly evaluated acceleration.",
  },
  {
    number: "05",
    title: "Observables",
    formula: "T = 2⟨K⟩/d  ·  P = ρT + W/V",
    note: "Record reduced temperature, energy and the virial pressure estimate.",
  },
] as const;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function mulberry32(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value + 0x6d2b79f5) >>> 0;
    let mixed = value;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

function randomForMove(seed: number, move: number) {
  return mulberry32((seed ^ Math.imul(move + 1, 0x9e3779b1)) >>> 0);
}

function pairEnergy(distance: number, epsilon = 1, sigma = 0.145) {
  const safeDistance = Math.max(distance, sigma * 0.42);
  const ratio6 = (sigma / safeDistance) ** 6;
  return 4 * epsilon * (ratio6 ** 2 - ratio6);
}

function configurationEnergy(particles: Point2[]) {
  let energy = 0;
  for (let row = 0; row < particles.length; row += 1) {
    for (let column = row + 1; column < particles.length; column += 1) {
      const dx = particles[row].x - particles[column].x;
      const dy = particles[row].y - particles[column].y;
      energy += pairEnergy(Math.hypot(dx, dy));
    }
  }
  return energy;
}

function linePath(values: number[], width: number, height: number, padding: number) {
  if (values.length === 0) return "";
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const span = Math.max(maximum - minimum, 1e-9);
  return values
    .map((value, index) => {
      const x = padding + (index / Math.max(values.length - 1, 1)) * (width - 2 * padding);
      const y = height - padding - ((value - minimum) / span) * (height - 2 * padding);
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

function formatSigned(value: number, digits = 3) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(digits)}`;
}

function RangeControl({
  label,
  value,
  minimum,
  maximum,
  step,
  output,
  onChange,
}: {
  label: string;
  value: number;
  minimum: number;
  maximum: number;
  step: number;
  output: string;
  onChange: (value: number) => void;
}) {
  const id = useId();
  return (
    <label className={styles.rangeControl} htmlFor={id}>
      <span>
        {label}
        <output htmlFor={id}>{output}</output>
      </span>
      <input
        id={id}
        type="range"
        min={minimum}
        max={maximum}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
      />
    </label>
  );
}

function MetricCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className={styles.metricCard}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}

function MethodDrawer({
  equation,
  algorithm,
  record,
}: {
  equation: ReactNode;
  algorithm: ReactNode;
  record: ReactNode;
}) {
  const [view, setView] = useState<MethodView>("equation");
  const panelId = useId();
  const activeTabId = `${panelId}-${view}`;
  const items: Array<{ id: MethodView; label: string }> = [
    { id: "equation", label: "Equation" },
    { id: "algorithm", label: "Code sketch" },
    { id: "record", label: "Notebook record" },
  ];
  function moveMethodTab(event: KeyboardEvent<HTMLButtonElement>) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const currentIndex = items.findIndex((item) => item.id === view);
    const nextIndex = event.key === "Home"
      ? 0
      : event.key === "End"
        ? items.length - 1
        : (currentIndex + (event.key === "ArrowRight" ? 1 : -1) + items.length) % items.length;
    const next = items[nextIndex].id;
    setView(next);
    document.getElementById(`${panelId}-${next}`)?.focus();
  }
  return (
    <section className={styles.methodDrawer} aria-label="Method details">
      <div className={styles.methodTabs} role="tablist" aria-label="Method representation">
        {items.map((item) => (
          <button
            key={item.id}
            id={`${panelId}-${item.id}`}
            type="button"
            role="tab"
            aria-selected={view === item.id}
            aria-controls={panelId}
            tabIndex={view === item.id ? 0 : -1}
            onClick={() => setView(item.id)}
            onKeyDown={moveMethodTab}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div id={panelId} className={styles.methodPanel} role="tabpanel" aria-labelledby={activeTabId}>
        {view === "equation" ? equation : view === "algorithm" ? algorithm : record}
      </div>
    </section>
  );
}

function LabHeading({
  kicker,
  title,
  description,
  evidence,
}: {
  kicker: string;
  title: string;
  description: string;
  evidence: string;
}) {
  return (
    <header className={styles.labHeading}>
      <div>
        <span>{kicker}</span>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <div className={styles.evidenceBadge}>
        <span aria-hidden="true" />
        {evidence}
      </div>
    </header>
  );
}

function MetropolisLab() {
  const [temperature, setTemperature] = useState(1.0);
  const [seed, setSeed] = useState(20250325);
  const [particles, setParticles] = useState<Point2[]>(initialParticles);
  const [step, setStep] = useState(0);
  const [accepted, setAccepted] = useState(0);
  const [history, setHistory] = useState<number[]>([configurationEnergy(initialParticles)]);
  const [lastMove, setLastMove] = useState<MonteCarloMove | null>(null);

  const reset = (nextSeed = seed) => {
    const random = mulberry32(nextSeed);
    const jittered = initialParticles.map((particle) => ({
      x: clamp(particle.x + (random() - 0.5) * 0.035, 0.06, 0.94),
      y: clamp(particle.y + (random() - 0.5) * 0.035, 0.06, 0.94),
    }));
    setParticles(jittered);
    setStep(0);
    setAccepted(0);
    setHistory([configurationEnergy(jittered)]);
    setLastMove(null);
  };

  const runMoves = (count: number) => {
    let nextParticles = particles.map((particle) => ({ ...particle }));
    let nextStep = step;
    let nextAccepted = accepted;
    let nextHistory = [...history];
    let moveRecord: MonteCarloMove | null = lastMove;

    for (let moveIndex = 0; moveIndex < count; moveIndex += 1) {
      const random = randomForMove(seed, nextStep);
      const particle = Math.floor(random() * nextParticles.length);
      const proposal = nextParticles.map((point) => ({ ...point }));
      proposal[particle] = {
        x: clamp(proposal[particle].x + (random() - 0.5) * 0.12, 0.045, 0.955),
        y: clamp(proposal[particle].y + (random() - 0.5) * 0.12, 0.045, 0.955),
      };
      const before = configurationEnergy(nextParticles);
      const after = configurationEnergy(proposal);
      const deltaEnergy = after - before;
      const probability = deltaEnergy <= 0 ? 1 : Math.exp(-deltaEnergy / temperature);
      const moveAccepted = random() < probability;
      if (moveAccepted) {
        nextParticles = proposal;
        nextAccepted += 1;
      }
      nextStep += 1;
      nextHistory.push(configurationEnergy(nextParticles));
      moveRecord = { accepted: moveAccepted, deltaEnergy, probability, particle };
    }

    if (nextHistory.length > 180) nextHistory = nextHistory.slice(-180);
    setParticles(nextParticles);
    setStep(nextStep);
    setAccepted(nextAccepted);
    setHistory(nextHistory);
    setLastMove(moveRecord);
  };

  const energy = history.at(-1) ?? configurationEnergy(particles);
  const acceptanceRate = step === 0 ? 0 : accepted / step;
  const chartPath = linePath(history, 460, 130, 14);

  return (
    <div className={styles.lab}>
      <LabHeading
        kicker="STANDALONE REACT EXTENSION · 25 MAR 2025"
        title="Metropolis molecular sampler"
        description="Move one particle, evaluate the Lennard–Jones energy change, then let temperature decide whether an uphill proposal survives. Every run is deterministic for its seed."
        evidence="LIVE REIMPLEMENTATION"
      />

      <div className={styles.experimentGrid}>
        <section className={styles.canvasCard} aria-label="Particle configuration">
          <div className={styles.cardToolbar}>
            <span>CONFIGURATION / 2D REDUCED SPACE</span>
            <strong>{particles.length} particles</strong>
          </div>
          <svg
            className={styles.particleCanvas}
            viewBox="0 0 480 310"
            role="img"
            aria-label={`Nine-particle Lennard-Jones configuration after ${step} Monte Carlo moves`}
          >
            <defs>
              <radialGradient id="chem-particle-halo">
                <stop offset="0" stopColor="#60a5fa" stopOpacity="0.28" />
                <stop offset="1" stopColor="#60a5fa" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="chem-chamber" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#101b28" />
                <stop offset="1" stopColor="#071018" />
              </linearGradient>
            </defs>
            <rect x="18" y="18" width="444" height="274" rx="4" fill="url(#chem-chamber)" />
            <g className={styles.chamberGrid} aria-hidden="true">
              {[1, 2, 3, 4, 5].map((index) => (
                <line key={`v-${index}`} x1={18 + index * 74} x2={18 + index * 74} y1="18" y2="292" />
              ))}
              {[1, 2, 3].map((index) => (
                <line key={`h-${index}`} x1="18" x2="462" y1={18 + index * 68.5} y2={18 + index * 68.5} />
              ))}
            </g>
            {particles.map((particle, index) => {
              const x = 18 + particle.x * 444;
              const y = 18 + particle.y * 274;
              const isMoved = lastMove?.particle === index;
              return (
                <g key={index} className={isMoved ? styles.activeParticle : undefined}>
                  <circle cx={x} cy={y} r="34" fill="url(#chem-particle-halo)" />
                  <circle cx={x} cy={y} r="9" className={styles.particle} />
                  <text x={x} y={y + 3.4} textAnchor="middle">
                    {index + 1}
                  </text>
                </g>
              );
            })}
            <text x="30" y="43" className={styles.svgReadout}>
              U* {energy.toFixed(3)}
            </text>
            <text x="450" y="280" textAnchor="end" className={styles.svgReadout}>
              seed {seed}
            </text>
          </svg>
          <div className={styles.simActions}>
            <button type="button" onClick={() => runMoves(1)}>Single move</button>
            <button type="button" onClick={() => runMoves(50)} className={styles.primaryAction}>Run 50</button>
            <button type="button" onClick={() => reset()}>Reset</button>
          </div>
        </section>

        <aside className={styles.controlRail}>
          <RangeControl
            label="Reduced temperature T*"
            value={temperature}
            minimum={0.2}
            maximum={3}
            step={0.1}
            output={temperature.toFixed(1)}
            onChange={setTemperature}
          />
          <RangeControl
            label="Deterministic seed"
            value={seed}
            minimum={20250001}
            maximum={20259999}
            step={1}
            output={String(seed)}
            onChange={(value) => {
              setSeed(value);
              reset(value);
            }}
          />
          <div className={`${styles.moveReceipt} ${lastMove?.accepted ? styles.moveAccepted : styles.moveRejected}`} aria-live="polite">
            <span>LAST PROPOSAL</span>
            <strong>{lastMove ? (lastMove.accepted ? "ACCEPTED" : "REJECTED") : "READY"}</strong>
            <dl>
              <div><dt>ΔU*</dt><dd>{lastMove ? formatSigned(lastMove.deltaEnergy) : "—"}</dd></div>
              <div><dt>P(accept)</dt><dd>{lastMove ? `${(lastMove.probability * 100).toFixed(1)}%` : "—"}</dd></div>
            </dl>
          </div>
          <div className={styles.historyCard}>
            <div><span>ACCEPTED-STATE ENERGY</span><strong>last {history.length}</strong></div>
            <svg viewBox="0 0 460 130" role="img" aria-label="Accepted configuration energy history">
              <line x1="14" x2="446" y1="116" y2="116" />
              <path d={chartPath} />
            </svg>
          </div>
        </aside>
      </div>

      <div className={styles.metricsRow}>
        <MetricCard label="CURRENT ENERGY" value={energy.toFixed(3)} detail="Reduced Lennard–Jones units" />
        <MetricCard label="ACCEPTANCE" value={`${(acceptanceRate * 100).toFixed(1)}%`} detail={`${accepted} of ${step} proposals`} />
        <MetricCard label="THERMAL GATE" value={`e^(−ΔU/${temperature.toFixed(1)})`} detail="Applied only when ΔU > 0" />
      </div>

      <MethodDrawer
        equation={
          <div className={styles.formulaGrid}>
            <div className={styles.formulaCard}>
              <span>PAIR POTENTIAL</span>
              <p><var>U</var>(<var>r</var>) = 4<var>ε</var>[(<var>σ</var>/<var>r</var>)<sup>12</sup> − (<var>σ</var>/<var>r</var>)<sup>6</sup>]</p>
              <small>Summed once over each particle pair.</small>
            </div>
            <div className={styles.formulaCard}>
              <span>METROPOLIS RULE</span>
              <p><var>P</var><sub>acc</sub> = min[1, exp(−Δ<var>U</var> / <var>T</var>*)]</p>
              <small>Downhill moves are certain; uphill moves pass a thermal draw.</small>
            </div>
          </div>
        }
        algorithm={
          <pre className={styles.codeBlock}><code>{`proposal = move_one_particle(state, seeded_rng)\nΔU = energy(proposal) - energy(state)\np = min(1, exp(-ΔU / temperature))\nstate = proposal if random() < p else state\nhistory.append(energy(state))`}</code></pre>
        }
        record={
          <div className={styles.recordNote}>
            <strong>What the private archive actually contains</strong>
            <p>A 492-line React/D3 experiment committed on 25 March 2025 models five particles, a 12–6 potential, single-particle displacements and the Metropolis gate. The archived component does not compile as committed and records proposal energy after rejected moves; this safe demo preserves the method while fixing both defects.</p>
            <span>Private repository · no explicit licence · source is intentionally not linked.</span>
          </div>
        }
      />
    </div>
  );
}

function generatePolymer(length: number, seed: number, mode: PolymerMode) {
  const random = mulberry32(seed);
  const points: Point3[] = [{ x: 0, y: 0, z: 0 }];
  const directions: Point3[] = [];
  let restarts = 0;

  if (mode === "self-avoiding") {
    const latticeDirections: Point3[] = [
      { x: 1, y: 0, z: 0 }, { x: -1, y: 0, z: 0 },
      { x: 0, y: 1, z: 0 }, { x: 0, y: -1, z: 0 },
      { x: 0, y: 0, z: 1 }, { x: 0, y: 0, z: -1 },
    ];
    for (let attempt = 0; attempt < 400; attempt += 1) {
      points.splice(0, points.length, { x: 0, y: 0, z: 0 });
      directions.splice(0, directions.length);
      const visited = new Set(["0,0,0"]);
      let trapped = false;
      while (points.length < length) {
        const shuffled = latticeDirections.map((direction) => ({ ...direction }));
        for (let index = shuffled.length - 1; index > 0; index -= 1) {
          const swap = Math.floor(random() * (index + 1));
          [shuffled[index], shuffled[swap]] = [shuffled[swap], shuffled[index]];
        }
        const current = points.at(-1) ?? points[0];
        const direction = shuffled.find((candidate) => {
          const key = `${current.x + candidate.x},${current.y + candidate.y},${current.z + candidate.z}`;
          return !visited.has(key);
        });
        if (!direction) {
          trapped = true;
          break;
        }
        const next = {
          x: current.x + direction.x,
          y: current.y + direction.y,
          z: current.z + direction.z,
        };
        points.push(next);
        directions.push(direction);
        visited.add(`${next.x},${next.y},${next.z}`);
      }
      if (!trapped && points.length === length) break;
      restarts += 1;
    }
  } else {
    while (points.length < length) {
      const theta = random() * Math.PI * 2;
      let zStep: number;
      let radial: number;
      if (mode === "notebook") {
        const phi = random() * Math.PI;
        zStep = Math.cos(phi);
        radial = Math.sin(phi);
      } else {
        zStep = random() * 2 - 1;
        radial = Math.sqrt(Math.max(0, 1 - zStep ** 2));
      }
      const direction = {
        x: Math.cos(theta) * radial,
        y: Math.sin(theta) * radial,
        z: zStep,
      };
      const current = points.at(-1) ?? points[0];
      points.push({
        x: current.x + direction.x,
        y: current.y + direction.y,
        z: current.z + direction.z,
      });
      directions.push(direction);
    }
  }

  const centre = points.reduce(
    (sum, point) => ({ x: sum.x + point.x, y: sum.y + point.y, z: sum.z + point.z }),
    { x: 0, y: 0, z: 0 },
  );
  centre.x /= points.length;
  centre.y /= points.length;
  centre.z /= points.length;
  const centred = points.map((point) => ({
    x: point.x - centre.x,
    y: point.y - centre.y,
    z: point.z - centre.z,
  }));
  const first = centred[0];
  const last = centred.at(-1) ?? first;
  const endToEnd = Math.hypot(last.x - first.x, last.y - first.y, last.z - first.z);
  const radiusGyration = Math.sqrt(
    centred.reduce((sum, point) => sum + point.x ** 2 + point.y ** 2 + point.z ** 2, 0) /
      centred.length,
  );
  const zMoment = directions.length === 0
    ? 0
    : directions.reduce((sum, direction) => sum + direction.z ** 2, 0) / directions.length;
  return { points: centred, endToEnd, radiusGyration, zMoment, restarts };
}

function projectPolymer(points: Point3[], turn: number, tilt: number) {
  const yaw = (turn * Math.PI) / 180;
  const pitch = (tilt * Math.PI) / 180;
  const projected = points.map((point) => {
    const xYaw = point.x * Math.cos(yaw) + point.z * Math.sin(yaw);
    const zYaw = -point.x * Math.sin(yaw) + point.z * Math.cos(yaw);
    return {
      x: xYaw,
      y: point.y * Math.cos(pitch) - zYaw * Math.sin(pitch),
      depth: point.y * Math.sin(pitch) + zYaw * Math.cos(pitch),
    };
  });
  const extent = Math.max(
    ...projected.flatMap((point) => [Math.abs(point.x), Math.abs(point.y)]),
    1,
  );
  return projected.map((point) => ({
    x: 260 + (point.x / extent) * 205,
    y: 220 - (point.y / extent) * 175,
    depth: point.depth,
  }));
}

function PolymerLab() {
  const [mode, setMode] = useState<PolymerMode>("notebook");
  const [length, setLength] = useState(180);
  const [seed, setSeed] = useState(22032025);
  const [turn, setTurn] = useState(-28);
  const [tilt, setTilt] = useState(22);
  const result = useMemo(() => generatePolymer(length, seed, mode), [length, seed, mode]);
  const projected = useMemo(() => projectPolymer(result.points, turn, tilt), [result.points, turn, tilt]);
  const theoryEnd = Math.sqrt(length);
  const theoryGyration = Math.sqrt(length / 6);
  const modeDescription = mode === "notebook"
    ? "Notebook polar-angle sampler"
    : mode === "isotropic"
      ? "Isotropic spherical control"
      : "Six-neighbour self-avoiding lattice";

  return (
    <div className={styles.lab}>
      <LabHeading
        kicker="PYTHON NOTEBOOK → JULIA EXTENSION · FEB–MAR 2025"
        title="Rotatable polymer conformation lab"
        description="Trace a continuous ideal chain, correct its angular sampler, or switch to the later self-avoiding lattice implementation. Rotation changes only the camera—never the calculated conformation."
        evidence="SEEDED 3D CALCULATION"
      />

      <div className={styles.modeSwitch} role="group" aria-label="Polymer model">
        {([
          ["notebook", "Notebook sampler"],
          ["isotropic", "Isotropic control"],
          ["self-avoiding", "Self-avoiding lattice"],
        ] as Array<[PolymerMode, string]>).map(([id, label]) => (
          <button key={id} type="button" aria-pressed={mode === id} onClick={() => setMode(id)}>{label}</button>
        ))}
      </div>

      <div className={styles.polymerGrid}>
        <section className={styles.polymerViewport}>
          <div className={styles.cardToolbar}>
            <span>CONFORMATION / ORTHOGRAPHIC PROJECTION</span>
            <strong>{modeDescription}</strong>
          </div>
          <svg viewBox="0 0 520 440" role="img" aria-label={`${length}-monomer ${modeDescription} projected in three dimensions`}>
            <defs>
              <linearGradient id="chem-polymer-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#22d3ee" />
                <stop offset="0.52" stopColor="#818cf8" />
                <stop offset="1" stopColor="#fb7185" />
              </linearGradient>
            </defs>
            <g className={styles.axisTripod} aria-hidden="true">
              <line x1="58" y1="374" x2="103" y2="374" />
              <line x1="58" y1="374" x2="58" y2="329" />
              <line x1="58" y1="374" x2="34" y2="395" />
              <text x="109" y="378">x</text><text x="54" y="320">y</text><text x="22" y="408">z</text>
            </g>
            <g className={styles.polymerSegments}>
              {projected.slice(1).map((point, index) => {
                const previous = projected[index];
                const progress = index / Math.max(projected.length - 2, 1);
                return (
                  <line
                    key={index}
                    x1={previous.x}
                    y1={previous.y}
                    x2={point.x}
                    y2={point.y}
                    style={{ opacity: 0.38 + progress * 0.62 }}
                  />
                );
              })}
            </g>
            {projected.length > 0 ? (
              <>
                <circle cx={projected[0].x} cy={projected[0].y} r="7" className={styles.polymerStart} />
                <circle cx={projected.at(-1)?.x} cy={projected.at(-1)?.y} r="7" className={styles.polymerEnd} />
              </>
            ) : null}
            <text x="24" y="34" className={styles.svgReadout}>START → END / {length} sites</text>
          </svg>
          <div className={styles.legendRow}>
            <span><i className={styles.startDot} /> start</span>
            <span><i className={styles.chainLine} /> chain index</span>
            <span><i className={styles.endDot} /> end</span>
          </div>
        </section>

        <aside className={styles.controlRail}>
          <RangeControl label="Monomers N" value={length} minimum={20} maximum={320} step={10} output={String(length)} onChange={setLength} />
          <RangeControl label="Camera turn" value={turn} minimum={-180} maximum={180} step={1} output={`${turn}°`} onChange={setTurn} />
          <RangeControl label="Camera tilt" value={tilt} minimum={-65} maximum={65} step={1} output={`${tilt}°`} onChange={setTilt} />
          <RangeControl label="Conformation seed" value={seed} minimum={22030000} maximum={22039999} step={1} output={String(seed)} onChange={setSeed} />
          <button type="button" className={styles.seedButton} onClick={() => setSeed((current) => current >= 22039999 ? 22030000 : current + 1)}>
            Generate next seeded chain
          </button>
          <div className={styles.samplerDiagnostic}>
            <span>ANGULAR DIAGNOSTIC</span>
            <strong>⟨Δz²⟩ = {result.zMoment.toFixed(3)}</strong>
            <p>{mode === "notebook" ? "Uniform φ targets 0.500, so poles are oversampled." : mode === "isotropic" ? "Uniform cos φ targets the isotropic value 0.333." : `${result.restarts} whole-walk restart${result.restarts === 1 ? "" : "s"}; no site revisits.`}</p>
          </div>
        </aside>
      </div>

      <div className={styles.metricsRow}>
        <MetricCard label="END-TO-END R" value={result.endToEnd.toFixed(3)} detail={`Ideal reference √N = ${theoryEnd.toFixed(3)}`} />
        <MetricCard label="RADIUS OF GYRATION" value={result.radiusGyration.toFixed(3)} detail={`Ideal reference √(N/6) = ${theoryGyration.toFixed(3)}`} />
        <MetricCard label="MODEL" value={mode === "self-avoiding" ? "SAW / lattice" : "Random flight"} detail={modeDescription} />
      </div>

      <MethodDrawer
        equation={
          <div className={styles.formulaGrid}>
            <div className={styles.formulaCard}>
              <span>CHAIN SIZE</span>
              <p><var>R</var><sub>e</sub> = |<b>r</b><sub>N</sub> − <b>r</b><sub>0</sub>|</p>
              <small>The end-to-end vector is unchanged by centring or camera rotation.</small>
            </div>
            <div className={styles.formulaCard}>
              <span>GYRATION</span>
              <p><var>R</var><sub>g</sub> = √[(1/<var>N</var>) Σ |<b>r</b><sub>i</sub> − <b>r</b><sub>cm</sub>|²]</p>
              <small>The notebook compares ideal chains with R<sub>g</sub> ≈ √(N/6).</small>
            </div>
          </div>
        }
        algorithm={
          <pre className={styles.codeBlock}><code>{mode === "self-avoiding"
            ? `walk = {(0, 0, 0)}\nwhile len(walk) < N:\n    candidates = shuffle(±x, ±y, ±z)\n    take first site not in visited\n    if trapped: restart whole walk`
            : `θ = 2π · random()\n${mode === "notebook" ? "φ = π · random()       # archived sampler" : "cosφ = 2 · random() - 1 # isotropic control"}\nstep = (cosθ sinφ, sinθ sinφ, cosφ)\nr[i] = r[i-1] + step\nr -= centre_of_mass(r)`}</code></pre>
        }
        record={
          <div className={styles.recordNote}>
            <strong>Two source stages, one visible correction</strong>
            <p>The February polymer notebook implements 2D/3D random flights, R<sub>e</sub>, R<sub>g</sub> and the √N scaling comparison. A separate 22 March Julia file adds a six-neighbour self-avoiding walk with restart-on-trap and Makie 3D output. The browser control also exposes the notebook’s non-isotropic φ sampler instead of concealing it.</p>
            <span>Teaching notebook attributes SciPython and TU Delft material; this page does not reproduce its questions or supplied solutions.</span>
          </div>
        }
      />
    </div>
  );
}

function ljPotential(distance: number, epsilon: number, sigma: number) {
  const ratio6 = (sigma / Math.max(distance, sigma * 0.2)) ** 6;
  return 4 * epsilon * (ratio6 ** 2 - ratio6);
}

function ljForce(distance: number, epsilon: number, sigma: number) {
  const safe = Math.max(distance, sigma * 0.2);
  const ratio6 = (sigma / safe) ** 6;
  return (24 * epsilon / safe) * (2 * ratio6 ** 2 - ratio6);
}

function DynamicsLab() {
  const [epsilon, setEpsilon] = useState(1);
  const [sigma, setSigma] = useState(1);
  const [distance, setDistance] = useState(1.18);
  const [cutoff, setCutoff] = useState(2.5);
  const [stage, setStage] = useState(0);
  const potential = ljPotential(distance, epsilon, sigma);
  const cutoffPotential = ljPotential(cutoff * sigma, epsilon, sigma);
  const shifted = distance < cutoff * sigma ? potential - cutoffPotential : 0;
  const force = distance < cutoff * sigma ? ljForce(distance, epsilon, sigma) : 0;
  const equilibrium = 2 ** (1 / 6) * sigma;

  const chart = useMemo(() => {
    const width = 600;
    const height = 270;
    const left = 42;
    const right = 18;
    const top = 18;
    const bottom = 38;
    const minX = 0.82 * sigma;
    const maxX = 3 * sigma;
    const minY = -1.35 * epsilon;
    const maxY = 1.8 * epsilon;
    const mapX = (value: number) => left + ((value - minX) / (maxX - minX)) * (width - left - right);
    const mapY = (value: number) => top + ((maxY - clamp(value, minY, maxY)) / (maxY - minY)) * (height - top - bottom);
    const raw: string[] = [];
    const shiftedPath: string[] = [];
    for (let index = 0; index < 180; index += 1) {
      const radius = minX + (index / 179) * (maxX - minX);
      const rawValue = ljPotential(radius, epsilon, sigma);
      const shiftedValue = radius < cutoff * sigma ? rawValue - cutoffPotential : 0;
      raw.push(`${index === 0 ? "M" : "L"}${mapX(radius).toFixed(2)},${mapY(rawValue).toFixed(2)}`);
      shiftedPath.push(`${index === 0 ? "M" : "L"}${mapX(radius).toFixed(2)},${mapY(shiftedValue).toFixed(2)}`);
    }
    return {
      raw: raw.join(" "),
      shifted: shiftedPath.join(" "),
      markerX: mapX(distance),
      markerY: mapY(shifted),
      cutoffX: mapX(cutoff * sigma),
      zeroY: mapY(0),
      equilibriumX: mapX(equilibrium),
    };
  }, [cutoff, cutoffPotential, distance, epsilon, equilibrium, shifted, sigma]);

  return (
    <div className={styles.lab}>
      <LabHeading
        kicker="COMPUTATIONAL LAB 4 · 18–23 FEB 2025"
        title="Lennard–Jones dynamics debugger"
        description="Interrogate the shifted 12–6 potential, inspect the force at one separation and walk through the exact velocity-Verlet pipeline recorded in the molecular-dynamics notebook."
        evidence="FORMULA + PIPELINE"
      />

      <div className={styles.dynamicsGrid}>
        <section className={styles.potentialCard}>
          <div className={styles.cardToolbar}>
            <span>PAIR POTENTIAL / REDUCED COORDINATES</span>
            <strong>r<sub>min</sub> = {equilibrium.toFixed(3)}</strong>
          </div>
          <svg viewBox="0 0 600 270" role="img" aria-label="Lennard-Jones potential and cutoff-shifted potential as a function of separation">
            <g className={styles.chartGrid} aria-hidden="true">
              <line x1="42" x2="582" y1={chart.zeroY} y2={chart.zeroY} />
              <line x1="42" x2="42" y1="18" y2="232" />
              <line x1={chart.cutoffX} x2={chart.cutoffX} y1="18" y2="232" className={styles.cutoffLine} />
              <line x1={chart.equilibriumX} x2={chart.equilibriumX} y1="18" y2="232" className={styles.equilibriumLine} />
            </g>
            <path d={chart.raw} className={styles.rawPotential} />
            <path d={chart.shifted} className={styles.shiftedPotential} />
            <circle cx={chart.markerX} cy={chart.markerY} r="6" className={styles.potentialMarker} />
            <text x={chart.cutoffX - 5} y="31" textAnchor="end" className={styles.svgReadout}>r<tspan baselineShift="sub">c</tspan></text>
            <text x={chart.equilibriumX + 5} y="214" className={styles.svgReadout}>minimum</text>
            <text x="300" y="260" textAnchor="middle" className={styles.axisLabel}>separation r / σ</text>
            <text x="13" y="130" textAnchor="middle" transform="rotate(-90 13 130)" className={styles.axisLabel}>energy U / ε</text>
          </svg>
          <div className={styles.legendRow}>
            <span><i className={styles.rawLegend} /> raw U(r)</span>
            <span><i className={styles.shiftedLegend} /> shifted at cutoff</span>
            <span><i className={styles.markerLegend} /> inspected separation</span>
          </div>
        </section>

        <aside className={styles.controlRail}>
          <RangeControl label="Separation r" value={distance} minimum={0.84 * sigma} maximum={3 * sigma} step={0.01} output={distance.toFixed(2)} onChange={setDistance} />
          <RangeControl label="Well depth ε" value={epsilon} minimum={0.4} maximum={2} step={0.1} output={epsilon.toFixed(1)} onChange={setEpsilon} />
          <RangeControl label="Zero crossing σ" value={sigma} minimum={0.7} maximum={1.3} step={0.05} output={sigma.toFixed(2)} onChange={(value) => { setSigma(value); setDistance((current) => clamp(current, 0.84 * value, 3 * value)); }} />
          <RangeControl label="Cutoff rᶜ / σ" value={cutoff} minimum={1.8} maximum={3} step={0.1} output={cutoff.toFixed(1)} onChange={setCutoff} />
          <div className={styles.forceDial}>
            <span>PAIR FORCE</span>
            <strong>{formatSigned(force, 3)} ε/σ</strong>
            <p>{force > 0.01 ? "Repulsive branch" : force < -0.01 ? "Attractive branch" : "At equilibrium / beyond cutoff"}</p>
          </div>
        </aside>
      </div>

      <div className={styles.metricsRow}>
        <MetricCard label="RAW POTENTIAL" value={formatSigned(potential, 4)} detail="12–6 pair energy" />
        <MetricCard label="SHIFTED POTENTIAL" value={formatSigned(shifted, 4)} detail={`U(r) − U(${cutoff.toFixed(1)}σ)`} />
        <MetricCard label="FORCE DIRECTION" value={force >= 0 ? "OUTWARD" : "INWARD"} detail={distance >= cutoff * sigma ? "Suppressed beyond cutoff" : `Fᵣ = ${formatSigned(force, 3)}`} />
      </div>

      <section className={styles.integratorCard} aria-label="Velocity Verlet stepper">
        <div className={styles.integratorHeader}>
          <div><span>VELOCITY-VERLET TAPE</span><strong>Stage {stage + 1} of {mdStages.length}</strong></div>
          <button type="button" onClick={() => setStage((current) => (current + 1) % mdStages.length)}>Advance stage →</button>
        </div>
        <div className={styles.integratorTrack} role="list">
          {mdStages.map((item, index) => (
            <button
              type="button"
              role="listitem"
              key={item.title}
              aria-current={stage === index ? "step" : undefined}
              onClick={() => setStage(index)}
            >
              <span>{item.number}</span>
              <strong>{item.title}</strong>
            </button>
          ))}
        </div>
        <div className={styles.stageReadout} aria-live="polite">
          <code>{mdStages[stage].formula}</code>
          <p>{mdStages[stage].note}</p>
        </div>
      </section>

      <MethodDrawer
        equation={
          <div className={styles.formulaGrid}>
            <div className={styles.formulaCard}>
              <span>SHIFTED CUTOFF</span>
              <p><var>U</var><sub>s</sub>(<var>r</var>) = <var>U</var>(<var>r</var>) − <var>U</var>(<var>r</var><sub>c</sub>)</p>
              <small>For r &lt; r<sub>c</sub>; the browser generalises the notebook’s ε = σ = 1 expression.</small>
            </div>
            <div className={styles.formulaCard}>
              <span>RADIAL FORCE</span>
              <p><var>F</var><sub>r</sub> = (24<var>ε</var>/<var>r</var>)[2(<var>σ</var>/<var>r</var>)<sup>12</sup> − (<var>σ</var>/<var>r</var>)<sup>6</sup>]</p>
              <small>Positive is repulsive; negative is attractive.</small>
            </div>
          </div>
        }
        algorithm={
          <pre className={styles.codeBlock}><code>{`for each pair i < j:\n    dr = minimum_image(r[i] - r[j])\n    if |dr| < cutoff:\n        U += lj(|dr|) - lj(cutoff)\n        a[i] += force(dr)\n        a[j] -= force(dr)\nvelocity_verlet(position, velocity, acceleration)`}</code></pre>
        }
        record={
          <div className={styles.recordNote}>
            <strong>Executed notebook scope</strong>
            <p>The archived lab contains 2D and 3D initialisation, periodic boundaries, minimum-image forces, a 2.5σ cutoff, shifted energy, temperature, virial pressure, velocity Verlet and Berendsen-coupling comparisons. Its final notebook is unusually large because outputs and revisions were retained; this demo isolates the scientific kernel.</p>
            <span>Adapted teaching material credits Dr Micaela Matta and the NZ Nano molecular-dynamics tutorial.</span>
          </div>
        }
      />
    </div>
  );
}

function stoOrbital(zeta: number, radius: number) {
  return Math.sqrt(zeta ** 3 / Math.PI) * Math.exp(-zeta * Math.abs(radius));
}

function gtoOrbital(alpha: number, radius: number) {
  return (2 * alpha / Math.PI) ** 0.75 * Math.exp(-alpha * radius ** 2);
}

function QuantumLab() {
  const [zeta, setZeta] = useState(2.0925);
  const [alpha, setAlpha] = useState(1);
  const [selectedBasis, setSelectedBasis] = useState(4);
  const [selectedBinding, setSelectedBinding] = useState<(typeof cationPiLedger)[number]["id"]>("benzene");
  const binding = cationPiLedger.find((entry) => entry.id === selectedBinding) ?? cationPiLedger[0];
  const bindingEnergy = binding.complex - binding.sodium - binding.aromatic;
  const selectedEnergy = basisEnergies[selectedBasis];
  const referenceEnergy = basisEnergies[0].energy;

  const orbitalChart = useMemo(() => {
    const width = 600;
    const height = 270;
    const padding = { left: 38, right: 18, top: 18, bottom: 32 };
    const values = Array.from({ length: 201 }, (_, index) => -4 + (index / 200) * 8);
    const maxY = Math.max(stoOrbital(zeta, 0), gtoOrbital(alpha, 0)) * 1.08;
    const mapX = (value: number) => padding.left + ((value + 4) / 8) * (width - padding.left - padding.right);
    const mapY = (value: number) => padding.top + ((maxY - value) / maxY) * (height - padding.top - padding.bottom);
    const makePath = (fn: (radius: number) => number) => values.map((radius, index) => `${index === 0 ? "M" : "L"}${mapX(radius).toFixed(2)},${mapY(fn(radius)).toFixed(2)}`).join(" ");
    return {
      sto: makePath((radius) => stoOrbital(zeta, radius)),
      gto: makePath((radius) => gtoOrbital(alpha, radius)),
      zeroX: mapX(0),
      baselineY: mapY(0),
    };
  }, [alpha, zeta]);

  const energyMinimum = Math.min(...basisEnergies.map((entry) => entry.energy));
  const energyMaximum = Math.max(...basisEnergies.map((entry) => entry.energy));
  const energySpan = energyMaximum - energyMinimum;

  return (
    <div className={styles.lab}>
      <LabHeading
        kicker="COMPUTATIONAL LAB 5 · 3–4 MAR 2025"
        title="Orbital shapes and Hartree–Fock ledger"
        description="Compare a cusp-bearing Slater orbital with a Gaussian primitive, then inspect the exact toluene basis-set and Na⁺–aromatic arithmetic recorded in the notebooks."
        evidence="RECORDED OUTPUT + LIVE MATH"
      />

      <div className={styles.quantumGrid}>
        <section className={styles.orbitalCard}>
          <div className={styles.cardToolbar}>
            <span>NORMALISED 1s RADIAL PROFILE</span>
            <strong>φ(r)</strong>
          </div>
          <svg viewBox="0 0 600 270" role="img" aria-label="Slater-type and Gaussian-type 1s orbital functions">
            <g className={styles.chartGrid} aria-hidden="true">
              <line x1="38" x2="582" y1={orbitalChart.baselineY} y2={orbitalChart.baselineY} />
              <line x1={orbitalChart.zeroX} x2={orbitalChart.zeroX} y1="18" y2="238" />
            </g>
            <path d={orbitalChart.sto} className={styles.stoCurve} />
            <path d={orbitalChart.gto} className={styles.gtoCurve} />
            <text x="300" y="262" textAnchor="middle" className={styles.axisLabel}>radial displacement r</text>
            <text x="52" y="35" className={styles.svgReadout}>cusp at r = 0</text>
          </svg>
          <div className={styles.legendRow}>
            <span><i className={styles.stoLegend} /> STO · exponential tail</span>
            <span><i className={styles.gtoLegend} /> GTO · smooth origin</span>
          </div>
          <div className={styles.orbitalControls}>
            <RangeControl label="STO exponent ζ" value={zeta} minimum={0.5} maximum={3} step={0.025} output={zeta.toFixed(3)} onChange={setZeta} />
            <RangeControl label="GTO exponent α" value={alpha} minimum={0.2} maximum={5.5} step={0.05} output={alpha.toFixed(2)} onChange={setAlpha} />
          </div>
        </section>

        <aside className={styles.quantumRail}>
          <section className={styles.cuspCard}>
            <span>NUCLEAR CUSP CHECK</span>
            <dl>
              <div><dt>φ<sub>STO</sub>(0)</dt><dd>{stoOrbital(zeta, 0).toFixed(4)}</dd></div>
              <div><dt>φ<sub>GTO</sub>(0)</dt><dd>{gtoOrbital(alpha, 0).toFixed(4)}</dd></div>
              <div><dt>φ′<sub>STO</sub>(0⁺)</dt><dd>{(-zeta * stoOrbital(zeta, 0)).toFixed(4)}</dd></div>
              <div><dt>φ′<sub>GTO</sub>(0)</dt><dd>0.0000</dd></div>
            </dl>
          </section>
          <section className={styles.bindingCard}>
            <label>
              <span>Na⁺ BINDING CALCULATION</span>
              <select value={selectedBinding} onChange={(event) => setSelectedBinding(event.currentTarget.value as typeof selectedBinding)}>
                {cationPiLedger.map((entry) => <option key={entry.id} value={entry.id}>{entry.label}</option>)}
              </select>
            </label>
            <strong>{bindingEnergy.toFixed(2)} kcal mol⁻¹</strong>
            <code>{binding.complex.toFixed(2)} − ({binding.sodium.toFixed(2)}) − ({binding.aromatic.toFixed(2)})</code>
            <p>Recorded electronic-energy subtraction; no counterpoise or correlation correction is claimed.</p>
          </section>
        </aside>
      </div>

      <section className={styles.basisCard}>
        <div className={styles.basisHeader}>
          <div><span>TOLUENE HF CONVERGENCE LEDGER</span><strong>{selectedEnergy.basis}</strong></div>
          <p>{selectedEnergy.functions} basis functions · ΔE from STO-3G {formatSigned(selectedEnergy.energy - referenceEnergy, 6)} E<sub>h</sub></p>
        </div>
        <div className={styles.energyPlot} role="group" aria-label="Toluene Hartree-Fock energies by basis-set size">
          {basisEnergies.map((entry, index) => {
            const position = ((entry.energy - energyMaximum) / -energySpan) * 100;
            return (
              <button
                key={entry.basis}
                type="button"
                aria-pressed={selectedBasis === index}
                onClick={() => setSelectedBasis(index)}
                style={{ "--energy-position": `${position}%` } as CSSProperties}
              >
                <span>{entry.basis}</span>
                <i />
                <small>{entry.functions}</small>
              </button>
            );
          })}
          <div className={styles.energyAxis}><span>−266.48 E<sub>h</sub></span><span>lower SCF energy →</span><span>−269.80 E<sub>h</sub></span></div>
        </div>
        <div className={styles.tableScroll} tabIndex={0} role="region" aria-label="Recorded basis-set energy table">
          <table>
            <thead><tr><th>Basis</th><th>Functions</th><th>SCF energy / E<sub>h</sub></th><th>Δ from prior / E<sub>h</sub></th></tr></thead>
            <tbody>
              {basisEnergies.map((entry, index) => (
                <tr key={entry.basis}>
                  <th scope="row">{entry.basis}</th>
                  <td>{entry.functions}</td>
                  <td>{entry.energy.toFixed(9)}</td>
                  <td>{index === 0 ? "reference" : formatSigned(entry.energy - basisEnergies[index - 1].energy, 6)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <MethodDrawer
        equation={
          <div className={styles.formulaGrid}>
            <div className={styles.formulaCard}>
              <span>SLATER 1s</span>
              <p><var>φ</var><sub>STO</sub> = √(<var>ζ</var>³/π) exp(−<var>ζ</var>|<var>r</var>|)</p>
              <small>Correct nuclear cusp and exponential long-range decay.</small>
            </div>
            <div className={styles.formulaCard}>
              <span>GAUSSIAN 1s</span>
              <p><var>φ</var><sub>GTO</sub> = (2<var>α</var>/π)<sup>3/4</sup> exp(−<var>αr</var>²)</p>
              <small>Smooth at the nucleus; Gaussian products make integrals tractable.</small>
            </div>
            <div className={styles.formulaCard}>
              <span>BINDING LEDGER</span>
              <p>Δ<var>E</var><sub>bind</sub> = <var>E</var><sub>complex</sub> − <var>E</var><sub>Na⁺</sub> − <var>E</var><sub>aromatic</sub></p>
              <small>The selected record is recomputed above, not copied as a static label.</small>
            </div>
          </div>
        }
        algorithm={
          <pre className={styles.codeBlock}><code>{`sto(r, ζ) = sqrt(ζ³ / π) · exp(-ζ · |r|)\ngto(r, α) = (2α / π)^(3/4) · exp(-α · r²)\n\nfor basis in basis_sets:\n    record(function_count, scf_energy)\nΔE_bind = E_complex - E_sodium - E_aromatic`}</code></pre>
        }
        record={
          <div className={styles.recordNote}>
            <strong>Recorded, not independently reproduced</strong>
            <p>The five toluene SCF energies and four Na⁺–aromatic electronic-energy triplets are notebook outputs. The browser recomputes only their arithmetic and analytic orbital curves; it does not rerun Hartree–Fock or claim benchmark accuracy.</p>
            <span>Basis-set material credits Psi4Education and Molecular Modeling Basics; the cation–π lab credits Psi4Education and Mecozzi et al., PNAS 93 (1996).</span>
          </div>
        }
      />
    </div>
  );
}

function AuditLab() {
  const timeline = [
    { date: "24 JAN", title: "Notebook foundations", detail: "Jupyter and Python teaching notebooks enter the archive." },
    { date: "11–13 FEB", title: "Sampling + polymers", detail: "Monte Carlo, central-limit and random-flight polymer work is iterated." },
    { date: "18–23 FEB", title: "Molecular dynamics", detail: "Lennard–Jones, PBC, velocity Verlet and thermostat comparisons are added." },
    { date: "03–04 MAR", title: "Quantum chemistry", detail: "Basis-set convergence and Na⁺–aromatic calculations are recorded." },
    { date: "22–25 MAR", title: "Independent extensions", detail: "Julia self-avoiding walk and React Metropolis files follow the notebooks." },
    { date: "30 APR–12 MAY", title: "Revision pass", detail: "All five scientific notebooks receive later refinement commits." },
  ];

  return (
    <div className={styles.lab}>
      <LabHeading
        kicker="REPOSITORY AUDIT · SOURCE BOUNDARY"
        title="What the archive proves—and what it does not"
        description="A compact evidence ledger separates live browser calculations, recorded notebook outputs, adapted teaching material and unsupported portfolio-level claims."
        evidence="PRIVATE / NO LICENCE"
      />

      <div className={styles.auditHero}>
        <div><span>TRACKED COMP-CHEM FILES</span><strong>46</strong><p>12 notebooks plus code, figures and local data.</p></div>
        <div><span>AUDITED METHOD LABS</span><strong>5</strong><p>Monte Carlo, polymers, MD, basis sets and cation–π.</p></div>
        <div><span>VISIBLE HISTORY WINDOW</span><strong>109 days</strong><p>24 January → 12 May 2025.</p></div>
      </div>

      <section className={styles.auditGrid}>
        <div className={styles.timelineCard}>
          <div className={styles.sectionTitle}><span>01</span><div><strong>SANITISED BUILD LINEAGE</strong><small>Commit emails, hashes and private paths omitted</small></div></div>
          <ol className={styles.timeline}>
            {timeline.map((item) => (
              <li key={item.date}>
                <time>{item.date}</time>
                <div><strong>{item.title}</strong><p>{item.detail}</p></div>
              </li>
            ))}
          </ol>
        </div>

        <div className={styles.boundaryColumn}>
          <section className={styles.boundaryCard}>
            <div className={styles.sectionTitle}><span>02</span><div><strong>EVIDENCE CLASSES</strong><small>How to read this demo</small></div></div>
            <ul className={styles.evidenceList}>
              <li><i className={styles.liveDot} /><div><strong>Live calculation</strong><p>Deterministic TypeScript reimplementation executed in this browser.</p></div></li>
              <li><i className={styles.recordDot} /><div><strong>Recorded result</strong><p>Numeric output present in a notebook, not independently rerun here.</p></div></li>
              <li><i className={styles.adaptedDot} /><div><strong>Adapted teaching source</strong><p>Attributed course material; neither authorship nor republication is claimed.</p></div></li>
              <li><i className={styles.privateDot} /><div><strong>Private source</strong><p>Repository access and redistribution remain closed because no licence is present.</p></div></li>
            </ul>
          </section>

          <section className={styles.boundaryCard}>
            <div className={styles.sectionTitle}><span>03</span><div><strong>PUBLICATION GATE</strong><small>Applied to this showcase</small></div></div>
            <dl className={styles.gateList}>
              <div><dt>Notebook files</dt><dd>Not shipped</dd></div>
              <div><dt>Assessed prompts / answers</dt><dd>Excluded</dd></div>
              <div><dt>Personal emails + job IDs</dt><dd>Excluded</dd></div>
              <div><dt>Private repository URL</dt><dd>Not linked</dd></div>
              <div><dt>Standard formula reimplementation</dt><dd>Included</dd></div>
              <div><dt>Attribution boundary</dt><dd>Visible</dd></div>
            </dl>
          </section>
        </div>
      </section>

      <section className={styles.claimLedger}>
        <div className={styles.sectionTitle}><span>04</span><div><strong>CLAIM CONFIDENCE</strong><small>Repository evidence only</small></div></div>
        <div className={styles.tableScroll} tabIndex={0} role="region" aria-label="Claim confidence table">
          <table>
            <thead><tr><th>Claim</th><th>Evidence</th><th>Safe portfolio wording</th></tr></thead>
            <tbody>
              <tr><th scope="row">Scientific Python practice</th><td><span className={styles.strongEvidence}>Strong</span></td><td>Completed and iterated computational-chemistry notebooks.</td></tr>
              <tr><th scope="row">Interactive scientific extensions</th><td><span className={styles.strongEvidence}>Strong</span></td><td>Built later React and Julia experiments around sampling and 3D walks.</td></tr>
              <tr><th scope="row">Original curriculum authorship</th><td><span className={styles.weakEvidence}>Not supported</span></td><td>Do not infer from this repository; notebooks identify another author and adaptations.</td></tr>
              <tr><th scope="row">20+ sessions / 80+ students / endorsement</th><td><span className={styles.weakEvidence}>Not in repo</span></td><td>Keep only if corroborated by separate approved evidence.</td></tr>
              <tr><th scope="row">Open source availability</th><td><span className={styles.weakEvidence}>No</span></td><td>Private case study; no explicit licence and no source-download action.</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <div className={styles.attributionPanel}>
        <span>ATTRIBUTION NOTE</span>
        <p>The audited notebooks explicitly credit Micaela Matta and adaptations from sources including Towards AI, the SciPython Book, TU Delft computational-physics lectures, the NZ Nano molecular-dynamics tutorial, Psi4Education and Mecozzi et al. This portfolio demo is a new interface around the methods and Samuel’s recorded work; it is not a replacement copy of those materials.</p>
      </div>
    </div>
  );
}

export function ChemistryCodingStudio() {
  const [activeLab, setActiveLab] = useState<LabId>("metropolis");
  const panelId = useId();
  const activeTabId = `${panelId}-${activeLab}`;
  function moveLabTab(event: KeyboardEvent<HTMLButtonElement>) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const currentIndex = labTabs.findIndex((tab) => tab.id === activeLab);
    const nextIndex = event.key === "Home"
      ? 0
      : event.key === "End"
        ? labTabs.length - 1
        : (currentIndex + (event.key === "ArrowRight" ? 1 : -1) + labTabs.length) % labTabs.length;
    const next = labTabs[nextIndex].id;
    setActiveLab(next);
    document.getElementById(`${panelId}-${next}`)?.focus();
  }

  return (
    <DemoWindow
      appName="CHEMLAB.OS / NOTEBOOK ATLAS"
      title="Chemistry coding workbench"
      status="4 LIVE LABS · SOURCE AUDITED"
      statusTone="safe"
      className={styles.window}
      footer={
        <>
          <span>PRIVATE SOURCE · NO EXPLICIT LICENCE · ATTRIBUTED METHODS</span>
          <span>JAN–MAY 2025 ARCHIVE</span>
        </>
      }
    >
      <div className={styles.studio}>
        <section className={styles.studioHero}>
          <div>
            <span>COMPUTATIONAL CHEMISTRY / EVIDENCE WORKBENCH</span>
            <h2>From notebook cells to inspectable scientific instruments.</h2>
            <p>Four deterministic browser labs expose the mathematics, algorithm and recorded evidence separately—so the interesting work is visible without distributing private coursework.</p>
          </div>
          <div className={styles.heroSeal} aria-label="Source audit complete">
            <span>AUDIT</span>
            <strong>05 / 05</strong>
            <small>methods traced</small>
          </div>
        </section>

        <nav className={styles.labTabs} role="tablist" aria-label="Scientific computing labs">
          {labTabs.map((tab) => (
            <button
              key={tab.id}
              id={`${panelId}-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={activeLab === tab.id}
              aria-controls={panelId}
              tabIndex={activeLab === tab.id ? 0 : -1}
              onClick={() => setActiveLab(tab.id)}
              onKeyDown={moveLabTab}
            >
              <span>{tab.number}</span>
              <strong>{tab.label}</strong>
              <small>{tab.short}</small>
            </button>
          ))}
        </nav>

        <div id={panelId} role="tabpanel" aria-labelledby={activeTabId} className={styles.labPanel}>
          {activeLab === "metropolis" ? <MetropolisLab /> : null}
          {activeLab === "polymer" ? <PolymerLab /> : null}
          {activeLab === "dynamics" ? <DynamicsLab /> : null}
          {activeLab === "quantum" ? <QuantumLab /> : null}
          {activeLab === "audit" ? <AuditLab /> : null}
        </div>
      </div>
    </DemoWindow>
  );
}

export default ChemistryCodingStudio;
