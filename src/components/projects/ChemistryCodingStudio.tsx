"use client";
import { ProjectCopy } from "./ProjectTranslationBoundary";
import { chemistryCopy } from "./copy/chemistryCopy";

import ClassicSelect from "../ClassicSelect";

import { useId, useMemo, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { DemoWindow } from "./DemoChrome";
import { MathEquation } from "./MathEquation";
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
  { id: "dynamics", number: "03", label: "Potential + Verlet", short: "VV" },
  { id: "quantum", number: "04", label: "Quantum energies", short: "HF" },
  { id: "audit", number: "05", label: "Methods & development", short: "LOG" },
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
    tex: String.raw`v\!\left(t+\frac{\Delta t}{2}\right)=\lambda v(t)+\frac12a(t)\Delta t`,
    note: "Apply the thermostat scale, then advance velocity by half a time step.",
  },
  {
    number: "02",
    title: "Position + PBC",
    formula: "r(t + Δt) = r(t) + v(t + Δt/2)Δt",
    tex: String.raw`r(t+\Delta t)=r(t)+v\!\left(t+\frac{\Delta t}{2}\right)\Delta t`,
    note: "Move particles and wrap coordinates that cross the periodic box.",
  },
  {
    number: "03",
    title: "Pair forces",
    formula: "a(t + Δt) ← −∇U\u2097\u2c7c",
    tex: String.raw`a(t+\Delta t)\leftarrow-\nabla U_{\mathrm{LJ}}`,
    note: "Use minimum-image pair separations, the cutoff and the shifted potential.",
  },
  {
    number: "1/2",
    title: "Close velocity",
    formula: "v(t + Δt) = v(t + Δt/2) + ½a(t + Δt)Δt",
    tex: String.raw`v(t+\Delta t)=v\!\left(t+\frac{\Delta t}{2}\right)+\frac12a(t+\Delta t)\Delta t`,
    note: "Complete velocity Verlet with the newly evaluated acceleration.",
  },
  {
    number: "05",
    title: "Observables",
    formula: "T = 2⟨K⟩/d  ·  P = ρT + W/V",
    tex: String.raw`T=\frac{2\langle K\rangle}{d},\qquad P=\rho T+\frac{W}{V}`,
    note: "Record reduced temperature, energy and the virial pressure estimate.",
  },
] as const;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function reflectInto(value: number, minimum: number, maximum: number) {
  const span = maximum - minimum;
  const folded = ((value - minimum) % (2 * span) + 2 * span) % (2 * span);
  return minimum + (folded <= span ? folded : 2 * span - folded);
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
    <ProjectCopy copy={chemistryCopy}><label className={styles.rangeControl} htmlFor={id}>
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
    </label></ProjectCopy>
  );
}

function MetricCard({ label, value, detail }: { label: string; value: ReactNode; detail: ReactNode }) {
  return (
    <ProjectCopy copy={chemistryCopy}><div className={styles.metricCard}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div></ProjectCopy>
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
    { id: "record", label: "Interpretation" },
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
    <ProjectCopy copy={chemistryCopy}><section className={styles.methodDrawer} aria-label="Method details">
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
    </section></ProjectCopy>
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
    <ProjectCopy copy={chemistryCopy}><header className={styles.labHeading}>
      <div>
        <span>{kicker}</span>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <div className={styles.evidenceBadge}>
        <span aria-hidden="true" />
        {evidence}
      </div>
    </header></ProjectCopy>
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
      x: reflectInto(particle.x + (random() - 0.5) * 0.035, 0.06, 0.94),
      y: reflectInto(particle.y + (random() - 0.5) * 0.035, 0.06, 0.94),
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
        x: reflectInto(proposal[particle].x + (random() - 0.5) * 0.12, 0.045, 0.955),
        y: reflectInto(proposal[particle].y + (random() - 0.5) * 0.12, 0.045, 0.955),
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
    <ProjectCopy copy={chemistryCopy}><div className={styles.lab}>
      <LabHeading
        kicker="React extension · 25 Mar 2025"
        title="Metropolis molecular sampler"
        description="Move one particle with a symmetric reflected-boundary proposal, evaluate the Lennard–Jones energy change, then let temperature decide whether an uphill proposal survives. Every run is deterministic for its seed."
        evidence="Interactive calculation"
      />

      <div className={styles.experimentGrid}>
        <section className={styles.canvasCard} aria-label="Particle configuration">
          <div className={styles.cardToolbar}>
            <span>Particle configuration · 2D</span>
            <strong>{particles.length} particles</strong>
          </div>
          <svg
            className={styles.particleCanvas}
            viewBox="0 0 480 310"
            role="img"
            aria-label={`Nine-particle Lennard-Jones configuration after ${step} Monte Carlo moves`}
          >
            <rect x="18" y="18" width="444" height="274" fill="var(--s7-paper)" stroke="var(--s7-ink)" />
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
            <span>Last proposal</span>
            <strong>{lastMove ? (lastMove.accepted ? "Accepted" : "Rejected") : "Ready"}</strong>
            <dl>
              <div><dt>ΔU*</dt><dd>{lastMove ? formatSigned(lastMove.deltaEnergy) : "—"}</dd></div>
              <div><dt>P(accept)</dt><dd>{lastMove ? `${(lastMove.probability * 100).toFixed(1)}%` : "—"}</dd></div>
            </dl>
          </div>
          <div className={styles.historyCard}>
            <div><span>Accepted-state energy</span><strong>last {history.length}</strong></div>
            <div className={styles.plotScroll} role="region" aria-label="Scrollable plot" tabIndex={0}><svg viewBox="0 0 460 130" role="img" aria-label="Accepted configuration energy history">
              <line x1="14" x2="446" y1="116" y2="116" />
              <path d={chartPath} />
            </svg></div>
          </div>
        </aside>
      </div>

      <div className={styles.metricsRow}>
        <MetricCard label="Current energy" value={energy.toFixed(3)} detail="Reduced Lennard–Jones units" />
        <MetricCard label="Acceptance" value={`${(acceptanceRate * 100).toFixed(1)}%`} detail={`${accepted} of ${step} proposals`} />
        <MetricCard label="Thermal factor" value={<MathEquation display={false} tex={String.raw`e^{-\Delta U/${temperature.toFixed(1)}}`} />} detail="Applied only when ΔU > 0" />
      </div>

      <MethodDrawer
        equation={
          <div className={styles.formulaGrid}>
            <div className={styles.formulaCard}>
              <span>Pair potential</span>
              <p><MathEquation tex={String.raw`U(r)=4\varepsilon\left[\left(\frac{\sigma}{r}\right)^{12}-\left(\frac{\sigma}{r}\right)^6\right]`} label="U(r) = 4ε[(σ/r)¹² − (σ/r)⁶]" /></p>
              <small>Summed once over each particle pair.</small>
            </div>
            <div className={styles.formulaCard}>
              <span>Metropolis rule</span>
              <p><MathEquation tex={String.raw`P_{\mathrm{acc}}=\min\!\left[1,\exp\!\left(-\frac{\Delta U}{T^*}\right)\right]`} label="Pacc = min[1, exp(−ΔU/T*)]" /></p>
              <small>Downhill moves are certain; uphill moves pass a thermal draw.</small>
            </div>
          </div>
        }
        algorithm={
          <pre className={styles.codeBlock}><code>{`proposal = move_one_particle(state, seeded_rng)\nΔU = energy(proposal) - energy(state)\np = min(1, exp(-ΔU / temperature))\nstate = proposal if random() < p else state\nhistory.append(energy(state))`}</code></pre>
        }
        record={
          <div className={styles.recordNote}>
            <strong>Sampling a thermal distribution</strong>
            <p>A single-particle proposal changes the Lennard-Jones interaction energy. Downhill moves are accepted; some uphill moves are also accepted at finite temperature. After a rejected proposal, the accepted configuration and its energy stay unchanged.</p>
            <span>The course exercises were extended with a React sampling experiment; this browser version lets you inspect each accepted or rejected move.</span>
          </div>
        }
      />
    </div></ProjectCopy>
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
  const bonds = Math.max(length - 1, 1);
  const theoryEnd = Math.sqrt(bonds);
  const theoryGyration = Math.sqrt(bonds / 6);
  const modeDescription = mode === "notebook"
    ? "Notebook polar-angle sampler"
    : mode === "isotropic"
      ? "Isotropic spherical control"
      : "Six-neighbour self-avoiding lattice";

  return (
    <ProjectCopy copy={chemistryCopy}><div className={styles.lab}>
      <LabHeading
        kicker="Python study → Julia extension · Feb–Mar 2025"
        title="Rotatable polymer conformation lab"
        description="Trace a continuous ideal chain, correct its angular sampler, or switch to the later self-avoiding lattice implementation. Rotation changes only the camera—never the calculated conformation."
        evidence="Repeatable 3D calculation"
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
            <span>Conformation · orthographic projection</span>
            <strong>{modeDescription}</strong>
          </div>
          <svg viewBox="0 0 520 440" role="img" aria-label={`${length}-monomer ${modeDescription} projected in three dimensions`}>
            <defs>
              <linearGradient id="chem-polymer-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#0c706d" />
                <stop offset="0.52" stopColor="#273c85" />
                <stop offset="1" stopColor="#963d52" />
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
                    style={{ opacity: 0.7 + progress * 0.3 }}
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
            <text x="24" y="34" className={styles.svgReadout}>Start → end / {length} sites · {bonds} bonds</text>
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
            <span>Angular sampling</span>
            <strong>⟨Δz²⟩ = {result.zMoment.toFixed(3)}</strong>
            <p>{mode === "notebook" ? "Uniform φ targets 0.500, so poles are oversampled." : mode === "isotropic" ? "Uniform cos φ targets the isotropic value 0.333." : `${result.restarts} whole-walk restarts; no site revisits.`}</p>
          </div>
        </aside>
      </div>

      <div className={styles.metricsRow}>
        <MetricCard label="End-to-end R" value={result.endToEnd.toFixed(3)} detail={<>Ideal reference <MathEquation display={false} tex={String.raw`\sqrt{N-1}=${theoryEnd.toFixed(3)}`} label={`√(N − 1) = ${theoryEnd.toFixed(3)}`} /></>} />
        <MetricCard label="RADIUS OF Gyration" value={result.radiusGyration.toFixed(3)} detail={<>Ideal reference <MathEquation display={false} tex={String.raw`\sqrt{\frac{N-1}{6}}=${theoryGyration.toFixed(3)}`} label={`√((N − 1)/6) = ${theoryGyration.toFixed(3)}`} /></>} />
        <MetricCard label="Model" value={mode === "self-avoiding" ? "SAW / lattice" : "Random flight"} detail={modeDescription} />
      </div>

      <MethodDrawer
        equation={
          <div className={styles.formulaGrid}>
            <div className={styles.formulaCard}>
              <span>Chain size</span>
              <p><MathEquation tex={String.raw`R_e=\left|\mathbf r_N-\mathbf r_0\right|`} label="Rₑ = |rₙ − r₀|" /></p>
              <small>The end-to-end vector is unchanged by centring or camera rotation.</small>
            </div>
            <div className={styles.formulaCard}>
              <span>Gyration</span>
              <p><MathEquation tex={String.raw`R_g=\sqrt{\frac1N\sum_i\left|\mathbf r_i-\mathbf r_{\mathrm{cm}}\right|^2}`} label="Rᵍ = √[(1/N) Σᵢ|rᵢ − rcm|²]" /></p>
              <small>For this N-site display there are N − 1 bonds, so the ideal reference uses <MathEquation display={false} tex={String.raw`R_g\approx\sqrt{\frac{N-1}{6}}`} label="Rg ≈ √((N − 1)/6)" />.</small>
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
            <strong>Polymer sampling and self-avoidance</strong>
            <p>The February polymer exercises implement 2D/3D random flights, R<sub>e</sub>, R<sub>g</sub> and the √N scaling comparison. A later Julia extension adds a six-neighbour self-avoiding walk with restart-on-trap and Makie 3D output. The browser also exposes the original non-isotropic φ sampler.</p>
            <span>The course methods draw on SciPython and TU Delft teaching material.</span>
          </div>
        }
      />
    </div></ProjectCopy>
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

type MdParticle = { x: number; y: number; vx: number; vy: number };

function wrapCoordinate(value: number, box: number) {
  return ((value % box) + box) % box;
}

function mdForces(particles: readonly MdParticle[], box: number, epsilon: number, sigma: number, cutoff: number) {
  const accelerations = particles.map(() => ({ x: 0, y: 0 }));
  const cutoffDistance = cutoff * sigma;
  const cutoffEnergy = ljPotential(cutoffDistance, epsilon, sigma);
  let potential = 0;
  for (let row = 0; row < particles.length; row += 1) {
    for (let column = row + 1; column < particles.length; column += 1) {
      let dx = particles[row].x - particles[column].x;
      let dy = particles[row].y - particles[column].y;
      dx -= box * Math.round(dx / box);
      dy -= box * Math.round(dy / box);
      const distance = Math.max(Math.hypot(dx, dy), sigma * 0.2);
      if (distance >= cutoffDistance) continue;
      const magnitude = ljForce(distance, epsilon, sigma);
      const fx = magnitude * dx / distance;
      const fy = magnitude * dy / distance;
      accelerations[row].x += fx;
      accelerations[row].y += fy;
      accelerations[column].x -= fx;
      accelerations[column].y -= fy;
      potential += ljPotential(distance, epsilon, sigma) - cutoffEnergy;
    }
  }
  return { accelerations, potential };
}

function simulateMiniMd(steps: number, dt: number, epsilon: number, sigma: number, cutoff: number) {
  const box = 5.4 * sigma;
  const speed = 0.18 * Math.sqrt(epsilon);
  let particles: MdParticle[] = [
    { x: 1.15 * sigma, y: 1.15 * sigma, vx: speed, vy: speed * 0.45 },
    { x: 3.05 * sigma, y: 1.35 * sigma, vx: -speed * 0.7, vy: speed },
    { x: 1.45 * sigma, y: 3.25 * sigma, vx: speed * 0.35, vy: -speed * 0.9 },
    { x: 3.35 * sigma, y: 3.05 * sigma, vx: -speed * 0.65, vy: -speed * 0.55 },
  ];
  const meanVx = particles.reduce((sum, particle) => sum + particle.vx, 0) / particles.length;
  const meanVy = particles.reduce((sum, particle) => sum + particle.vy, 0) / particles.length;
  particles = particles.map((particle) => ({ ...particle, vx: particle.vx - meanVx, vy: particle.vy - meanVy }));
  let forceState = mdForces(particles, box, epsilon, sigma, cutoff);
  const energies: number[] = [];
  const frames: MdParticle[][] = [];

  const record = () => {
    const kinetic = particles.reduce((sum, particle) => sum + 0.5 * (particle.vx ** 2 + particle.vy ** 2), 0);
    energies.push(kinetic + forceState.potential);
    frames.push(particles.map((particle) => ({ ...particle })));
  };
  record();
  for (let step = 0; step < steps; step += 1) {
    particles = particles.map((particle, index) => ({
      ...particle,
      x: wrapCoordinate(particle.x + particle.vx * dt + 0.5 * forceState.accelerations[index].x * dt ** 2, box),
      y: wrapCoordinate(particle.y + particle.vy * dt + 0.5 * forceState.accelerations[index].y * dt ** 2, box),
    }));
    const nextForceState = mdForces(particles, box, epsilon, sigma, cutoff);
    particles = particles.map((particle, index) => ({
      ...particle,
      vx: particle.vx + 0.5 * (forceState.accelerations[index].x + nextForceState.accelerations[index].x) * dt,
      vy: particle.vy + 0.5 * (forceState.accelerations[index].y + nextForceState.accelerations[index].y) * dt,
    }));
    forceState = nextForceState;
    record();
  }
  const initialEnergy = energies[0];
  const finalEnergy = energies.at(-1) ?? initialEnergy;
  const relativeDrift = Math.abs(initialEnergy) > 1e-12 ? ((finalEnergy - initialEnergy) / Math.abs(initialEnergy)) * 100 : 0;
  return { box, particles, energies, frames, initialEnergy, finalEnergy, relativeDrift };
}

function DynamicsLab() {
  const [epsilon, setEpsilon] = useState(1);
  const [sigma, setSigma] = useState(1);
  const [distance, setDistance] = useState(1.18);
  const [cutoff, setCutoff] = useState(2.5);
  const [stage, setStage] = useState(0);
  const [timeStep, setTimeStep] = useState(0.006);
  const [trajectorySteps, setTrajectorySteps] = useState(160);
  const potential = ljPotential(distance, epsilon, sigma);
  const cutoffPotential = ljPotential(cutoff * sigma, epsilon, sigma);
  const shifted = distance < cutoff * sigma ? potential - cutoffPotential : 0;
  const force = distance < cutoff * sigma ? ljForce(distance, epsilon, sigma) : 0;
  const equilibrium = 2 ** (1 / 6) * sigma;
  const miniMd = useMemo(
    () => simulateMiniMd(trajectorySteps, timeStep, epsilon, sigma, cutoff),
    [cutoff, epsilon, sigma, timeStep, trajectorySteps],
  );

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
    <ProjectCopy copy={chemistryCopy}><div className={styles.lab}>
      <LabHeading
        kicker="COMPUTATIONAL LAB 4 · 18–23 FEB 2025"
        title="Lennard–Jones potential and Verlet explainer"
        description="Inspect the shifted 12–6 potential, examine the force at one separation and step through the velocity-Verlet update. A small numerical trajectory below lets you compare time steps."
        evidence="Equations and method"
      />

      <div className={styles.dynamicsGrid}>
        <section className={styles.potentialCard}>
          <div className={styles.cardToolbar}>
            <span>Pair potential · reduced coordinates</span>
            <strong>r<sub>min</sub> = {equilibrium.toFixed(3)}</strong>
          </div>
          <div className={styles.plotScroll} role="region" aria-label="Scrollable plot" tabIndex={0}><svg viewBox="0 0 600 270" role="img" aria-label="Lennard-Jones potential and cutoff-shifted potential as a function of separation">
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
          </svg></div>
          <div className={styles.legendRow}>
            <span><i className={styles.rawLegend} /> raw U(r)</span>
            <span><i className={styles.shiftedLegend} /> energy-shifted at cutoff</span>
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
        <MetricCard label="Raw potential" value={formatSigned(potential, 4)} detail="12–6 pair energy" />
        <MetricCard label="Shifted potential" value={formatSigned(shifted, 4)} detail={`U(r) − U(${cutoff.toFixed(1)}σ)`} />
        <MetricCard label="Force direction" value={force >= 0 ? "Outward" : "Inward"} detail={distance >= cutoff * sigma ? "Suppressed beyond cutoff" : `Fᵣ = ${formatSigned(force, 3)}`} />
      </div>

      <section className={styles.trajectoryLab} aria-labelledby="mini-md-title">
        <div className={styles.trajectoryHeader}>
          <div><span>Interactive trajectory</span><h4 id="mini-md-title">Four-particle periodic velocity-Verlet trajectory</h4><p>This deterministic reduced-unit system calculates minimum-image forces, wrapped positions and the full velocity-Verlet update. It is a small teaching model for exploring numerical integration.</p></div>
          <div><span>Relative energy drift</span><strong>{formatSigned(miniMd.relativeDrift, 4)}%</strong><small>{trajectorySteps} steps · Δt {timeStep.toFixed(3)}</small></div>
        </div>
        <div className={styles.trajectoryGrid}>
          <svg viewBox="0 0 360 300" role="img" aria-label={`Final periodic simulation frame with four particles after ${trajectorySteps} steps`}>
            <rect x="31" y="18" width="270" height="250" className={styles.periodicBox} />
            {miniMd.frames.map((frame, frameIndex) => frameIndex % Math.max(1, Math.floor(miniMd.frames.length / 28)) === 0 ? frame.map((particle, particleIndex) => (
              <circle key={`${frameIndex}-${particleIndex}`} cx={31 + (particle.x / miniMd.box) * 270} cy={18 + (particle.y / miniMd.box) * 250} r="1.5" className={styles.trajectoryGhost} />
            )) : null)}
            {miniMd.particles.map((particle, index) => <circle key={index} cx={31 + (particle.x / miniMd.box) * 270} cy={18 + (particle.y / miniMd.box) * 250} r="8" className={styles.trajectoryParticle} />)}
            <text x="166" y="290" textAnchor="middle" className={styles.axisLabel}>periodic box · L = {miniMd.box.toFixed(2)} σ-units</text>
          </svg>
          <div className={styles.energyTrace}>
            <div><span>Total energy change</span><strong>E₀ {miniMd.initialEnergy.toFixed(6)} → Eₜ {miniMd.finalEnergy.toFixed(6)}</strong></div>
            <div className={styles.plotScroll} role="region" aria-label="Scrollable plot" tabIndex={0}><svg viewBox="0 0 600 180" role="img" aria-label={`Total energy trace over ${trajectorySteps} velocity-Verlet steps`}>
              <line x1="30" x2="580" y1="152" y2="152" />
              <path d={linePath(miniMd.energies, 600, 180, 30)} />
            </svg></div>
            <div className={styles.trajectoryControls}>
              <RangeControl label="Time step Δt" value={timeStep} minimum={0.002} maximum={0.02} step={0.001} output={timeStep.toFixed(3)} onChange={setTimeStep} />
              <RangeControl label="Trajectory steps" value={trajectorySteps} minimum={25} maximum={400} step={25} output={String(trajectorySteps)} onChange={setTrajectorySteps} />
            </div>
            <div className={`${styles.driftAssessment} ${Math.abs(miniMd.relativeDrift) > 5 ? styles.driftBad : Math.abs(miniMd.relativeDrift) > 1 ? styles.driftWarn : styles.driftGood}`} role="status">
              <strong>{Math.abs(miniMd.relativeDrift) > 5 ? "UNSTABLE TEACHING RUN" : Math.abs(miniMd.relativeDrift) > 1 ? "VISIBLE INTEGRATION DRIFT" : "DRIFT BELOW 1%"}</strong>
              <span>{Math.abs(miniMd.relativeDrift) > 5 ? "Reduce Δt or shorten the run. A large energy change is a numerical failure signal, not a physical result." : "A small energy change is useful diagnostic information; compare time steps before drawing conclusions about numerical convergence."}</span>
            </div>
          </div>
        </div>
        <footer><span>4 particles</span><span>2D reduced units</span><span>Periodic boundaries</span><span>Minimum image</span><span>Energy-shifted cutoff</span><span>NVE · no thermostat</span></footer>
      </section>

      <section className={styles.integratorCard} aria-label="Velocity Verlet stepper">
        <div className={styles.integratorHeader}>
          <div><span>Velocity-Verlet steps</span><strong>Stage {stage + 1} of {mdStages.length}</strong></div>
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
          <MathEquation tex={mdStages[stage].tex} label={mdStages[stage].formula} />
          <p>{mdStages[stage].note}</p>
        </div>
      </section>

      <MethodDrawer
        equation={
          <div className={styles.formulaGrid}>
            <div className={styles.formulaCard}>
              <span>Shifted cutoff</span>
              <p><MathEquation tex={String.raw`U_s(r)=U(r)-U(r_c)`} label="Uₛ(r) = U(r) − U(rᶜ)" /></p>
              <small>For <MathEquation display={false} tex={String.raw`r<r_c`} label="r &lt; rc" />; this makes energy continuous, but not force-continuous, at the cutoff. The browser generalises the notebook’s <MathEquation display={false} tex={String.raw`\varepsilon=\sigma=1`} label="ε = σ = 1" /> expression.</small>
            </div>
            <div className={styles.formulaCard}>
              <span>Radial force</span>
              <p><MathEquation tex={String.raw`F_r=\frac{24\varepsilon}{r}\left[2\left(\frac\sigma r\right)^{12}-\left(\frac\sigma r\right)^6\right]`} label="Fᵣ = (24ε/r)[2(σ/r)¹² − (σ/r)⁶]" /></p>
              <small>Positive is repulsive; negative is attractive.</small>
            </div>
          </div>
        }
        algorithm={
          <pre className={styles.codeBlock}><code>{`for each pair i < j:\n    dr = minimum_image(r[i] - r[j])\n    if |dr| < cutoff:\n        U += lj(|dr|) - lj(cutoff)\n        a[i] += force(dr)\n        a[j] -= force(dr)\nvelocity_verlet(position, velocity, acceleration)`}</code></pre>
        }
        record={
          <div className={styles.recordNote}>
            <strong>Molecular-dynamics methods</strong>
            <p>The course work covers 2D and 3D initialisation, periodic boundaries, minimum-image forces, a 2.5σ cutoff, shifted energy, temperature, virial pressure, velocity Verlet and Berendsen-coupling comparisons. This view isolates the potential and integration steps.</p>
            <span>Adapted teaching material credits Dr Micaela Matta and the NZ Nano molecular-dynamics tutorial.</span>
          </div>
        }
      />
    </div></ProjectCopy>
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
    <ProjectCopy copy={chemistryCopy}><div className={styles.lab}>
      <LabHeading
        kicker="COMPUTATIONAL LAB 5 · 3–4 MAR 2025"
        title="Orbital shapes and Hartree–Fock energies"
        description="Compare a cusp-bearing Slater orbital with a Gaussian primitive, then explore the toluene basis-set energies and Na⁺–aromatic energy differences calculated during the course."
        evidence="Recorded energies and live calculations"
      />

      <div className={styles.quantumGrid}>
        <section className={styles.orbitalCard}>
          <div className={styles.cardToolbar}>
            <span>Normalised 1D 1s cross-section</span>
            <strong>φ(r)</strong>
          </div>
          <div className={styles.plotScroll} role="region" aria-label="Scrollable plot" tabIndex={0}><svg viewBox="0 0 600 270" role="img" aria-label="Slater-type and Gaussian-type 1s orbital functions">
            <g className={styles.chartGrid} aria-hidden="true">
              <line x1="38" x2="582" y1={orbitalChart.baselineY} y2={orbitalChart.baselineY} />
              <line x1={orbitalChart.zeroX} x2={orbitalChart.zeroX} y1="18" y2="238" />
            </g>
            <path d={orbitalChart.sto} className={styles.stoCurve} />
            <path d={orbitalChart.gto} className={styles.gtoCurve} />
            <text x="300" y="262" textAnchor="middle" className={styles.axisLabel}>signed 1D displacement r through the nucleus</text>
            <text x="52" y="35" className={styles.svgReadout}>cusp at r = 0</text>
          </svg></div>
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
            <span>Behaviour at the nucleus</span>
            <dl>
              <div><dt>φ<sub>STO</sub>(0)</dt><dd>{stoOrbital(zeta, 0).toFixed(4)}</dd></div>
              <div><dt>φ<sub>GTO</sub>(0)</dt><dd>{gtoOrbital(alpha, 0).toFixed(4)}</dd></div>
              <div><dt>φ′<sub>STO</sub>(0⁺)</dt><dd>{(-zeta * stoOrbital(zeta, 0)).toFixed(4)}</dd></div>
              <div><dt>φ′<sub>GTO</sub>(0)</dt><dd>0.0000</dd></div>
            </dl>
          </section>
          <section className={styles.bindingCard}>
            <label>
              <span>Na⁺ binding energy</span>
              <ClassicSelect value={selectedBinding} onChange={(event) => setSelectedBinding(event.currentTarget.value as typeof selectedBinding)}>
                {cationPiLedger.map((entry) => <option key={entry.id} value={entry.id}>{entry.label}</option>)}
              </ClassicSelect>
            </label>
            <strong>{bindingEnergy.toFixed(2)} kcal mol⁻¹</strong>
            <div className={styles.bindingEquation}><MathEquation tex={String.raw`\begin{aligned}&${binding.complex.toFixed(2)}\\&-(${binding.sodium.toFixed(2)})\\&-(${binding.aromatic.toFixed(2)})\end{aligned}`} label={`${binding.complex.toFixed(2)} − (${binding.sodium.toFixed(2)}) − (${binding.aromatic.toFixed(2)})`} /></div>
            <p>Recorded electronic-energy subtraction; no counterpoise or correlation correction is claimed.</p>
          </section>
        </aside>
      </div>

      <section className={styles.basisCard}>
        <div className={styles.basisHeader}>
          <div><span>Toluene HF basis-set convergence</span><strong>{selectedEnergy.basis}</strong></div>
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
              <p><MathEquation tex={String.raw`\phi_{\mathrm{STO}}=\sqrt{\frac{\zeta^3}{\pi}}\exp(-\zeta|r|)`} label="φSTO = √(ζ³/π) exp(−ζ|r|)" /></p>
              <small>Correct nuclear cusp and exponential long-range decay.</small>
            </div>
            <div className={styles.formulaCard}>
              <span>GAUSSIAN 1s</span>
              <p><MathEquation tex={String.raw`\phi_{\mathrm{GTO}}=\left(\frac{2\alpha}{\pi}\right)^{3/4}\exp(-\alpha r^2)`} label="φGTO = (2α/π)^(3/4) exp(−αr²)" /></p>
              <small>Smooth at the nucleus; Gaussian products make integrals tractable.</small>
            </div>
            <div className={styles.formulaCard}>
              <span>Binding-energy calculation</span>
              <p><MathEquation tex={String.raw`\Delta E_{\mathrm{bind}}=E_{\mathrm{complex}}-E_{\mathrm{Na}^+}-E_{\mathrm{aromatic}}`} label="ΔEbind = Ecomplex − ENa⁺ − Earomatic" /></p>
              <small>The selected system’s energy difference is recalculated above.</small>
            </div>
          </div>
        }
        algorithm={
          <pre className={styles.codeBlock}><code>{`sto(r, ζ) = sqrt(ζ³ / π) · exp(-ζ · |r|)\ngto(r, α) = (2α / π)^(3/4) · exp(-α · r²)\n\nfor basis in basis_sets:\n    record(function_count, scf_energy)\nΔE_bind = E_complex - E_sodium - E_aromatic`}</code></pre>
        }
        record={
          <div className={styles.recordNote}>
            <strong>Recorded quantum-chemistry results</strong>
            <p>The five toluene SCF energies and four Na⁺–aromatic energy triplets come from completed course calculations. The browser recalculates energy differences and analytic orbital curves; it does not rerun Hartree–Fock.</p>
            <span>Basis-set material credits Psi4Education and Molecular Modeling Basics; the cation–π lab credits Psi4Education and Mecozzi et al., PNAS 93 (1996).</span>
          </div>
        }
      />
    </div></ProjectCopy>
  );
}

function AuditLab() {
  const timeline = [
    { date: "24 JAN", title: "Computational foundations", detail: "Work with Python and Jupyter to connect chemical models with numerical calculations." },
    { date: "11–13 FEB", title: "Sampling and polymers", detail: "Explore Monte Carlo sampling, the central-limit theorem and random-flight polymer models." },
    { date: "18–23 FEB", title: "Molecular dynamics", detail: "Study Lennard-Jones interactions, periodic boundaries, velocity Verlet and thermostat choices." },
    { date: "03–04 MAR", title: "Quantum chemistry", detail: "Compare basis-set convergence and sodium–aromatic interaction energies." },
    { date: "22–25 MAR", title: "Independent extensions", detail: "Build Julia self-avoiding walks and a React Metropolis sampling experiment." },
    { date: "30 APR–12 MAY", title: "Refinement", detail: "Refine the five computational topics and their explanations." },
  ];
  return <ProjectCopy copy={chemistryCopy}><div className={styles.lab}>
    <LabHeading kicker="Methods and development" title="Five physical ideas, four interactive labs" description="Each experiment uses a different numerical method. Compare what it calculates, how to interpret it and which assumptions matter." evidence="Computational chemistry" />
    <section className={styles.claimLedger}>
      <div className={styles.sectionTitle}><span>01</span><div><strong>Choose a question to explore</strong><small>Connect the calculation to its physical meaning</small></div></div>
      <div className={styles.tableScroll} tabIndex={0} role="region" aria-label="Computational chemistry method guide"><table>
        <thead><tr><th>Method</th><th>Question</th><th>What to inspect</th></tr></thead>
        <tbody>
          <tr><th scope="row">Metropolis sampling</th><td>Which configurations are plausible at this temperature?</td><td>Energy changes, acceptance probability and the accepted configuration.</td></tr>
          <tr><th scope="row">Polymer walks</th><td>How do direction and self-avoidance rules change a chain’s shape?</td><td>End-to-end distance, radius of gyration and variation between seeds.</td></tr>
          <tr><th scope="row">Velocity Verlet</th><td>How do force and time step determine a numerical trajectory?</td><td>Position updates, periodic wrapping and total-energy drift.</td></tr>
          <tr><th scope="row">Basis sets</th><td>How does the orbital representation change an electronic-energy calculation?</td><td>Function count and the recorded change in SCF energy.</td></tr>
          <tr><th scope="row">Cation–π interactions</th><td>How does complex formation change electronic energy?</td><td>The complex energy minus the separate sodium-ion and aromatic energies.</td></tr>
        </tbody>
      </table></div>
    </section>
    <section className={styles.auditGrid}>
      <div className={styles.timelineCard}><div className={styles.sectionTitle}><span>02</span><div><strong>Development through 2025</strong><small>From course exercises to independent experiments</small></div></div>
        <ol className={styles.timeline}>{timeline.map(item => <li key={item.date}><time>{item.date}</time><div><strong>{item.title}</strong><p>{item.detail}</p></div></li>)}</ol>
      </div>
      <div className={styles.boundaryColumn}>
        <section className={styles.boundaryCard}><div className={styles.sectionTitle}><span>03</span><div><strong>Reading the results</strong><small>Calculated here or recorded earlier</small></div></div>
          <ul className={styles.evidenceList}>
            <li><i className={styles.liveDot} /><div><strong>Interactive calculations</strong><p>Sampling, polymer generation and the small dynamics trajectory run locally with controlled inputs.</p></div></li>
            <li><i className={styles.recordDot} /><div><strong>Recorded quantum energies</strong><p>The browser recomputes differences from recorded values; it does not run a new electronic-structure calculation.</p></div></li>
            <li><i className={styles.adaptedDot} /><div><strong>Model assumptions</strong><p>Compare seeds, time steps and model rules. A convincing picture alone does not establish convergence or physical accuracy.</p></div></li>
          </ul>
        </section>
      </div>
    </section>
    <div className={styles.attributionPanel}><span>Teaching foundations</span><p>The exercises credit Micaela Matta, Towards AI, the SciPython Book, TU Delft computational-physics lectures, NZ Nano, Psi4Education and Mecozzi et al. Samuel completed and extended the computational work; the browser provides an interactive way to explore those methods.</p></div>
  </div></ProjectCopy>;
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
    <ProjectCopy copy={chemistryCopy}><DemoWindow
      appName="Chemistry Lab"
      title="Chemistry coding workbench"
      status="Four interactive labs"
      purpose="Explore how sampling, molecular shape, numerical motion and quantum-energy calculations turn physical ideas into computational experiments."
      tryThis="Run the sampler, change polymer generation, step molecular dynamics or recompute a quantum-energy comparison."
      watchFor="Temperature changes which moves are accepted, polymer rules change shape, and time steps change energy drift. Quantum tables retain recorded calculations."
      statusTone="safe"
      className={styles.window}
      footer={
        <>
          <span>Computational chemistry · attributed teaching methods</span>
          <span>January–May 2025</span>
        </>
      }
    >
      <div className={styles.studio}>
        <section className={styles.studioHero}>
          <div>
            <span>Computational chemistry</span>
            <h2>Explore the rules, then see what they produce.</h2>
            <p>Samuel completed and extended computational-chemistry exercises, then built Julia and React experiments. These four labs connect the equations with configurations, trajectories and energy comparisons.</p>
          </div>
          <div className={styles.heroSeal} aria-label="Four interactive chemistry labs">
            <span>Explore</span>
            <strong>04</strong>
            <small>interactive labs</small>
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
    </DemoWindow></ProjectCopy>
  );
}

export default ChemistryCodingStudio;
