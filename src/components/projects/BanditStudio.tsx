"use client";
import { PlotPanHint } from "./PlotPanHint";

import { ProjectCopy, useProjectLocale } from "./ProjectTranslationBoundary";
import { projectText } from "@/lib/projectCopy";
import { banditStudioCopy } from "./copy/banditStudioCopy";

import ClassicSelect from "../ClassicSelect";

import { type KeyboardEvent as ReactKeyboardEvent, useEffect, useId, useMemo, useState } from "react";
import { DemoWindow } from "./DemoChrome";
import { MathEquation } from "./MathEquation";
import styles from "./BanditStudio.module.css";

type ViewId = "policy" | "regret" | "method";
type ScenarioId = "wide" | "close" | "gaussian";
type RewardKind = "bernoulli" | "gaussian";
type DecisionMode = "initialise" | "explore" | "exploit" | "optimism" | "posterior";
type ComparisonPolicy = "epsilon" | "ucb1" | "thompson";

type ArmDefinition = {
  id: string;
  label: string;
  note: string;
  mean: number;
};

type Scenario = {
  id: ScenarioId;
  label: string;
  shortLabel: string;
  kind: RewardKind;
  sigma: number;
  seedSalt: number;
  description: string;
  arms: readonly ArmDefinition[];
};

type ArmStat = {
  pulls: number;
  reward: number;
  positive: number;
  estimate: number;
  lastStep: number | null;
};

type BanditEvent = {
  step: number;
  armIndex: number;
  armId: string;
  armLabel: string;
  mode: DecisionMode;
  reward: number;
  oracleReward: number;
  expectedGap: number;
  realisedGap: number;
  estimateAfter: number;
  scores: number[];
};

type TracePoint = {
  step: number;
  expectedRegret: number;
  realisedRegret: number;
  policyReward: number;
  oracleReward: number;
  policyExpected: number;
  oracleExpected: number;
};

type Simulation = {
  stats: ArmStat[];
  events: BanditEvent[];
  trace: TracePoint[];
  modeCounts: Record<DecisionMode, number>;
};

const MAX_STEPS = 500;

const views: Array<{ id: ViewId; number: string; label: string; short: string }> = [
  { id: "policy", number: "01", label: "Policy console", short: "LIVE" },
  { id: "regret", number: "02", label: "Regret & oracle", short: "TRACE" },
  { id: "method", number: "03", label: "Method ledger", short: "AUDIT" },
];

const scenarios: Record<ScenarioId, Scenario> = {
  wide: {
    id: "wide",
    label: "Bernoulli · wide gaps",
    shortLabel: "Wide gap",
    kind: "bernoulli",
    sigma: 0,
    seedSalt: 0x17a4c913,
    description: "The Week 01 teaching fixture: three binary-reward arms with means 0.20, 0.50 and 0.80.",
    arms: [
      { id: "A", label: "Arm A", note: "low response", mean: 0.2 },
      { id: "B", label: "Arm B", note: "middle response", mean: 0.5 },
      { id: "C", label: "Arm C", note: "clear optimum", mean: 0.8 },
    ],
  },
  close: {
    id: "close",
    label: "Bernoulli · close contest",
    shortLabel: "Close gap",
    kind: "bernoulli",
    sigma: 0,
    seedSalt: 0x52db71af,
    description: "A harder synthetic control where small mean gaps make early binary outcomes unusually persuasive.",
    arms: [
      { id: "A", label: "Arm A", note: "baseline", mean: 0.46 },
      { id: "B", label: "Arm B", note: "near tie", mean: 0.51 },
      { id: "C", label: "Arm C", note: "near tie", mean: 0.54 },
      { id: "D", label: "Arm D", note: "narrow optimum", mean: 0.57 },
    ],
  },
  gaussian: {
    id: "gaussian",
    label: "Gaussian · noisy values",
    shortLabel: "CONTINUOUS",
    kind: "gaussian",
    sigma: 0.65,
    seedSalt: 0x78f02d41,
    description: "A synthetic Gaussian reward experiment with fixed means and reward noise σ = 0.65.",
    arms: [
      { id: "A", label: "Arm A", note: "negative mean", mean: -0.3 },
      { id: "B", label: "Arm B", note: "neutral", mean: 0 },
      { id: "C", label: "Arm C", note: "modest value", mean: 0.18 },
      { id: "D", label: "Arm D", note: "best mean", mean: 0.5 },
    ],
  },
};

const seeds = [7, 23, 101, 2026] as const;
const comparisonSeeds = [3, 7, 11, 19, 23, 31, 47, 71, 101, 211, 503, 2026] as const;

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

function rewardRandom(seed: number, scenario: Scenario, step: number, armIndex: number) {
  const mixed = (
    seed ^
    scenario.seedSalt ^
    Math.imul(step + 1, 0x9e3779b1) ^
    Math.imul(armIndex + 1, 0x85ebca6b)
  ) >>> 0;
  return mulberry32(mixed);
}

function rewardAt(seed: number, scenario: Scenario, step: number, armIndex: number) {
  const random = rewardRandom(seed, scenario, step, armIndex);
  const mean = scenario.arms[armIndex].mean;
  if (scenario.kind === "bernoulli") return random() < mean ? 1 : 0;
  const u1 = Math.max(random(), 1e-12);
  const u2 = random();
  const standardNormal = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + scenario.sigma * standardNormal;
}

function standardNormal(random: () => number) {
  const u1 = Math.max(random(), 1e-12);
  const u2 = random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

// Marsaglia-Tsang sampling lets the browser reproduce the source's
// Beta(1,1)-Bernoulli Thompson update without a statistics dependency.
function gammaSample(shape: number, random: () => number): number {
  if (shape < 1) {
    return gammaSample(shape + 1, random) * Math.pow(Math.max(random(), 1e-12), 1 / shape);
  }
  const d = shape - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  while (true) {
    const x = standardNormal(random);
    const vRoot = 1 + c * x;
    if (vRoot <= 0) continue;
    const v = vRoot ** 3;
    const u = random();
    if (u < 1 - 0.0331 * x ** 4 || Math.log(Math.max(u, 1e-12)) < 0.5 * x ** 2 + d * (1 - v + Math.log(v))) {
      return d * v;
    }
  }
}

function betaSample(alpha: number, beta: number, random: () => number) {
  const left = gammaSample(alpha, random);
  const right = gammaSample(beta, random);
  return left / (left + right);
}

function simulateComparisonPolicy(
  scenario: Scenario,
  policy: ComparisonPolicy,
  seed: number,
  rounds: number,
) {
  const pulls = scenario.arms.map(() => 0);
  const means = scenario.arms.map(() => 0);
  const successes = scenario.arms.map(() => 0);
  const failures = scenario.arms.map(() => 0);
  const random = mulberry32((seed ^ scenario.seedSalt ^ 0x6c8e9cf5 ^ policy.length) >>> 0);
  const bestMean = Math.max(...scenario.arms.map((arm) => arm.mean));
  let regret = 0;

  for (let step = 0; step < rounds; step += 1) {
    let armIndex: number;
    if (step < scenario.arms.length) {
      armIndex = step;
    } else if (policy === "epsilon") {
      if (random() < 0.1) armIndex = Math.min(scenario.arms.length - 1, Math.floor(random() * scenario.arms.length));
      else armIndex = means.indexOf(Math.max(...means));
    } else if (policy === "ucb1") {
      const scores = means.map((mean, index) => mean + Math.sqrt((2 * Math.log(step + 1)) / pulls[index]));
      armIndex = scores.indexOf(Math.max(...scores));
    } else {
      const samples = scenario.arms.map((_, index) => betaSample(successes[index] + 1, failures[index] + 1, random));
      armIndex = samples.indexOf(Math.max(...samples));
    }

    const reward = rewardAt(seed, scenario, step, armIndex);
    pulls[armIndex] += 1;
    means[armIndex] += (reward - means[armIndex]) / pulls[armIndex];
    successes[armIndex] += reward;
    failures[armIndex] += 1 - reward;
    regret += bestMean - scenario.arms[armIndex].mean;
  }
  return regret;
}

function policyBakeoff(scenario: Scenario, rounds: number) {
  if (scenario.kind !== "bernoulli") return null;
  const policies: ComparisonPolicy[] = ["epsilon", "ucb1", "thompson"];
  return policies.map((policy) => {
    const values = comparisonSeeds.map((seed) => simulateComparisonPolicy(scenario, policy, seed, rounds));
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    return { policy, mean, minimum: Math.min(...values), maximum: Math.max(...values) };
  });
}

function simulateBandit(scenario: Scenario, epsilon: number, seed: number, rounds: number, policy: ComparisonPolicy = "epsilon"): Simulation {
  const stats: ArmStat[] = scenario.arms.map(() => ({
    pulls: 0,
    reward: 0,
    positive: 0,
    estimate: 0,
    lastStep: null,
  }));
  const events: BanditEvent[] = [];
  const trace: TracePoint[] = [{
    step: 0,
    expectedRegret: 0,
    realisedRegret: 0,
    policyReward: 0,
    oracleReward: 0,
    policyExpected: 0,
    oracleExpected: 0,
  }];
  const modeCounts: Record<DecisionMode, number> = { initialise: 0, explore: 0, exploit: 0, optimism: 0, posterior: 0 };
  const policyRandom = mulberry32((seed ^ scenario.seedSalt ^ 0xa53a9e71) >>> 0);
  const bestMean = Math.max(...scenario.arms.map((arm) => arm.mean));
  const bestArmIndex = scenario.arms.findIndex((arm) => arm.mean === bestMean);
  let expectedRegret = 0;
  let realisedRegret = 0;
  let policyReward = 0;
  let oracleReward = 0;
  let policyExpected = 0;
  let oracleExpected = 0;

  for (let stepIndex = 0; stepIndex < rounds; stepIndex += 1) {
    let armIndex: number;
    let mode: DecisionMode;
    let scores = stats.map(stat => stat.estimate);

    if (stepIndex < scenario.arms.length) {
      // Browser contract: exactly one deterministic observation per arm before ε-greedy begins.
      armIndex = stepIndex;
      mode = "initialise";
    } else if (policy === "ucb1") {
      scores = stats.map(stat => stat.estimate + Math.sqrt(2 * (scenario.kind === "gaussian" ? scenario.sigma ** 2 : 1) * Math.log(stepIndex + 1) / stat.pulls));
      armIndex = scores.indexOf(Math.max(...scores));
      mode = "optimism";
    } else if (policy === "thompson") {
      scores = stats.map(stat => betaSample(stat.reward + 1, stat.pulls - stat.reward + 1, policyRandom));
      armIndex = scores.indexOf(Math.max(...scores));
      mode = "posterior";
    } else if (policyRandom() < epsilon) {
      armIndex = Math.min(scenario.arms.length - 1, Math.floor(policyRandom() * scenario.arms.length));
      mode = "explore";
    } else {
      const maximumEstimate = Math.max(...stats.map((stat) => stat.estimate));
      const tied = stats
        .map((stat, index) => ({ stat, index }))
        .filter(({ stat }) => Math.abs(stat.estimate - maximumEstimate) < 1e-12)
        .map(({ index }) => index);
      armIndex = tied.length === 1 ? tied[0] : tied[Math.min(tied.length - 1, Math.floor(policyRandom() * tied.length))];
      mode = "exploit";
    }

    const reward = rewardAt(seed, scenario, stepIndex, armIndex);
    const oracleOutcome = rewardAt(seed, scenario, stepIndex, bestArmIndex);
    const chosenMean = scenario.arms[armIndex].mean;
    const expectedGap = bestMean - chosenMean;
    const realisedGap = oracleOutcome - reward;
    const stat = stats[armIndex];
    stat.pulls += 1;
    stat.reward += reward;
    stat.positive += reward > 0 ? 1 : 0;
    stat.estimate += (reward - stat.estimate) / stat.pulls;
    stat.lastStep = stepIndex + 1;
    expectedRegret += expectedGap;
    realisedRegret += realisedGap;
    policyReward += reward;
    oracleReward += oracleOutcome;
    policyExpected += chosenMean;
    oracleExpected += bestMean;
    modeCounts[mode] += 1;

    events.push({
      step: stepIndex + 1,
      armIndex,
      armId: scenario.arms[armIndex].id,
      armLabel: scenario.arms[armIndex].label,
      mode,
      reward,
      oracleReward: oracleOutcome,
      expectedGap,
      realisedGap,
      estimateAfter: stat.estimate,
      scores,
    });
    trace.push({
      step: stepIndex + 1,
      expectedRegret,
      realisedRegret,
      policyReward,
      oracleReward,
      policyExpected,
      oracleExpected,
    });
  }

  return { stats, events, trace, modeCounts };
}

function linePath(
  values: readonly { x: number; y: number }[],
  xMinimum: number,
  xMaximum: number,
  yMinimum: number,
  yMaximum: number,
  plot: { x: number; y: number; width: number; height: number },
) {
  const xSpan = Math.max(1e-9, xMaximum - xMinimum);
  const ySpan = Math.max(1e-9, yMaximum - yMinimum);
  return values.map((point, index) => {
    const x = plot.x + ((point.x - xMinimum) / xSpan) * plot.width;
    const y = plot.y + plot.height - ((point.y - yMinimum) / ySpan) * plot.height;
    return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(" ");
}

function formatReward(value: number, kind: RewardKind) {
  return kind === "bernoulli" ? value.toFixed(0) : value.toFixed(2);
}

function formatMean(value: number, kind: RewardKind) {
  return kind === "bernoulli" ? `${(value * 100).toFixed(1)}%` : value.toFixed(3);
}

function formatSigned(value: number, digits = 2) {
  return `${value >= 0 ? "+" : "−"}${Math.abs(value).toFixed(digits)}`;
}

function estimatePosition(value: number, scenario: Scenario) {
  if (scenario.kind === "bernoulli") return clamp(value * 100, 0, 100);
  const minimum = Math.min(...scenario.arms.map((arm) => arm.mean)) - scenario.sigma;
  const maximum = Math.max(...scenario.arms.map((arm) => arm.mean)) + scenario.sigma;
  return clamp(((value - minimum) / (maximum - minimum)) * 100, 0, 100);
}

function truePosition(value: number, scenario: Scenario) {
  return estimatePosition(value, scenario);
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
    <ProjectCopy copy={banditStudioCopy}><label className={styles.rangeControl} htmlFor={id}>
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
    </label></ProjectCopy>
  );
}

function DecisionMap({ scenario, events }: { scenario: Scenario; events: readonly BanditEvent[] }) {
  const rawId = useId();
  const chartId = `bandit-map-${rawId.replace(/:/g, "")}`;
  const visible = events.slice(-90);
  const firstStep = visible[0]?.step ?? 0;
  const lastStep = visible.at(-1)?.step ?? 0;
  const plot = { x: 72, y: 35, width: 750, height: 195 };
  const xFor = (step: number) => plot.x + ((step - firstStep) / Math.max(1, lastStep - firstStep)) * plot.width;
  const yFor = (armIndex: number) => plot.y + (armIndex / Math.max(1, scenario.arms.length - 1)) * plot.height;
  const modeColour: Record<DecisionMode, string> = {
    initialise: "#f1be52",
    explore: "#df7178",
    exploit: "#64d8df",
    optimism: "#64d8df",
    posterior: "#df7178",
  };

  return (
    <ProjectCopy copy={banditStudioCopy}><PlotPanHint key="pan-instruction" /><div key="plot-region" className={styles.plotViewport} role="group" aria-labelledby={`${chartId}-title`} tabIndex={0}><svg className={styles.decisionMap} viewBox="0 0 860 286" role="img" aria-labelledby={`${chartId}-title ${chartId}-desc`}>
      <title id={`${chartId}-title`}>Recent policy choices by arm</title>
      <desc id={`${chartId}-desc`}>
        {visible.length
          ? `${visible.length} decisions from round ${firstStep} to ${lastStep}. Each dot shows the selected arm; the final choice is circled.`
          : "No decisions yet. Step the seeded simulation to populate the decision map."}
      </desc>
      <rect width="860" height="286" fill="#091724" />
      <rect x={plot.x} y={plot.y - 14} width={plot.width} height={plot.height + 28} fill="#0d2231" stroke="#456171" />
      {scenario.arms.map((arm, index) => {
        const y = yFor(index);
        return (
          <g key={arm.id}>
            <line x1={plot.x} x2={plot.x + plot.width} y1={y} y2={y} className={styles.darkGrid} />
            <text x={plot.x - 14} y={y + 4} textAnchor="end" className={styles.mapArm}>{arm.id}</text>
          </g>
        );
      })}
      {visible.length ? visible.map((event) => (
        <g key={event.step}>
          <circle
            cx={xFor(event.step)}
            cy={yFor(event.armIndex)}
            r={event.mode === "initialise" ? 5.5 : 4.2}
            fill={modeColour[event.mode]}
            stroke={event.reward > 0 ? "#fff" : "#1b3443"}
            strokeWidth={event.reward > 0 ? 1.4 : 0.8}
          />
          {event.step === lastStep ? <circle cx={xFor(event.step)} cy={yFor(event.armIndex)} r="9" fill="none" stroke="#fff" strokeDasharray="2 2" /> : null}
        </g>
      )) : (
        <g>
          <rect x="264" y="105" width="370" height="68" fill="#102b3b" stroke="#4e7280" strokeDasharray="5 4" />
          <text x="449" y="134" textAnchor="middle" className={styles.emptyMapTitle}>Waiting for round 001</text>
          <text x="449" y="153" textAnchor="middle" className={styles.emptyMapCopy}>Use “Step once” to force-initialise Arm A.</text>
        </g>
      )}
      <text x={plot.x} y="272" className={styles.mapTick}>{visible.length ? `ROUND ${String(firstStep).padStart(3, "0")}` : "ROUND 000"}</text>
      <text x={plot.x + plot.width} y="272" textAnchor="end" className={styles.mapTick}>{visible.length ? `ROUND ${String(lastStep).padStart(3, "0")}` : ""}</text>
      <g transform="translate(400 16)">
        <circle cx="0" cy="0" r="4" fill="#f1be52" /><text x="9" y="3" className={styles.mapLegend}>forced</text>
        <circle cx="73" cy="0" r="4" fill="#df7178" /><text x="82" y="3" className={styles.mapLegend}>random / sampled</text>
        <circle cx="245" cy="0" r="4" fill="#64d8df" /><text x="254" y="3" className={styles.mapLegend}>value / bound</text>
      </g>
    </svg></div></ProjectCopy>
  );
}

function RegretChart({ trace }: { trace: readonly TracePoint[] }) {
  const rawId = useId();
  const chartId = `regret-chart-${rawId.replace(/:/g, "")}`;
  const plot = { x: 68, y: 38, width: 760, height: 230 };
  const maximumStep = Math.max(1, trace.at(-1)?.step ?? 0);
  const expectedValues = trace.map((point) => point.expectedRegret);
  const realisedValues = trace.map((point) => point.realisedRegret);
  const rawMinimum = Math.min(0, ...expectedValues, ...realisedValues);
  const rawMaximum = Math.max(0, ...expectedValues, ...realisedValues);
  const padding = Math.max(1, (rawMaximum - rawMinimum) * 0.1);
  const minimum = rawMinimum - padding;
  const maximum = rawMaximum + padding;
  const expectedPath = linePath(trace.map((point) => ({ x: point.step, y: point.expectedRegret })), 0, maximumStep, minimum, maximum, plot);
  const realisedPath = linePath(trace.map((point) => ({ x: point.step, y: point.realisedRegret })), 0, maximumStep, minimum, maximum, plot);
  const xTicks = Array.from({ length: 6 }, (_, index) => (index / 5) * maximumStep);
  const yTicks = Array.from({ length: 5 }, (_, index) => minimum + (index / 4) * (maximum - minimum));
  const yFor = (value: number) => plot.y + plot.height - ((value - minimum) / (maximum - minimum)) * plot.height;
  const last = trace.at(-1) ?? trace[0];

  return (
    <ProjectCopy copy={banditStudioCopy}><PlotPanHint key="pan-instruction" /><div key="plot-region" className={styles.plotViewport} role="group" aria-labelledby={`${chartId}-title`} tabIndex={0}><svg className={styles.regretChart} viewBox="0 0 880 338" role="img" aria-labelledby={`${chartId}-title ${chartId}-desc`}>
      <title id={`${chartId}-title`}>Expected pseudo-regret and realised counterfactual regret</title>
      <desc id={`${chartId}-desc`}>
        Through round {last.step}, cumulative expected pseudo-regret is {last.expectedRegret.toFixed(2)} and realised oracle-minus-policy reward is {last.realisedRegret.toFixed(2)}.
      </desc>
      <rect width="880" height="338" fill="#fff" />
      <rect x={plot.x} y={plot.y} width={plot.width} height={plot.height} fill="#f8faf8" stroke="#6f7b80" />
      {yTicks.map((tick) => {
        const y = yFor(tick);
        return (
          <g key={tick}>
            <line x1={plot.x} x2={plot.x + plot.width} y1={y} y2={y} className={styles.lightGrid} />
            <text x={plot.x - 9} y={y + 3} textAnchor="end" className={styles.lightTick}>{tick.toFixed(1)}</text>
          </g>
        );
      })}
      {xTicks.map((tick) => {
        const x = plot.x + (tick / maximumStep) * plot.width;
        return (
          <g key={tick}>
            <line x1={x} x2={x} y1={plot.y} y2={plot.y + plot.height} className={styles.lightGrid} />
            <text x={x} y={plot.y + plot.height + 18} textAnchor="middle" className={styles.lightTick}>{Math.round(tick)}</text>
          </g>
        );
      })}
      {minimum <= 0 && maximum >= 0 ? <line x1={plot.x} x2={plot.x + plot.width} y1={yFor(0)} y2={yFor(0)} stroke="#59666b" strokeWidth="1.2" /> : null}
      <path d={expectedPath} fill="none" stroke="#087f8c" strokeWidth="2.4" vectorEffect="non-scaling-stroke" />
      <path d={realisedPath} fill="none" stroke="#bd535d" strokeWidth="2" strokeDasharray="5 3" vectorEffect="non-scaling-stroke" />
      <g transform="translate(516 17)">
        <line x1="0" x2="27" y1="0" y2="0" stroke="#087f8c" strokeWidth="2.4" />
        <text x="34" y="4" className={styles.lightLegend}>expected / pseudo</text>
        <line x1="154" x2="181" y1="0" y2="0" stroke="#bd535d" strokeWidth="2" strokeDasharray="5 3" />
        <text x="188" y="4" className={styles.lightLegend}>realised</text>
      </g>
      <text x="448" y="326" textAnchor="middle" className={styles.lightAxis}>Round t</text>
      <text x="18" y="154" textAnchor="middle" transform="rotate(-90 18 154)" className={styles.lightAxis}>Cumulative regret</text>
    </svg></div></ProjectCopy>
  );
}

export function BanditStudio() {
  const locale = useProjectLocale();
  const t = (source: string, values?: Record<string, string | number>) => projectText(locale, banditStudioCopy, source, values);
  const [view, setView] = useState<ViewId>("policy");
  const [scenarioId, setScenarioId] = useState<ScenarioId>("wide");
  const [epsilonPercent, setEpsilonPercent] = useState(10);
  const [seed, setSeed] = useState<number>(23);
  const [rounds, setRounds] = useState(0);
  const [revealTruth, setRevealTruth] = useState(false);
  const [message, setMessage] = useState("Seed 23 is ready. The first three steps are forced initialization, one arm at a time.");
  const [policy, setPolicy] = useState<ComparisonPolicy>("epsilon");
  const [playing, setPlaying] = useState(false);
  const [playTarget, setPlayTarget] = useState(0);
  const running = playing && rounds < playTarget;
  const scenario = scenarios[scenarioId];
  const policyLabel = policy === "epsilon" ? "ε-greedy" : policy === "ucb1" ? "UCB1 policy" : "Thompson sampling";
  const simulation = useMemo(
    () => simulateBandit(scenario, epsilonPercent / 100, seed, rounds, policy),
    [scenario, epsilonPercent, seed, rounds, policy],
  );
  const bakeoff = useMemo(() => policyBakeoff(scenario, Math.max(50, rounds)), [rounds, scenario]);
  const current = simulation.trace.at(-1) ?? simulation.trace[0];
  const lastEvent = simulation.events.at(-1) ?? null;
  const bestMean = Math.max(...scenario.arms.map((arm) => arm.mean));
  const bestArm = scenario.arms.find((arm) => arm.mean === bestMean) ?? scenario.arms[0];
  const bestEstimatedIndex = rounds >= scenario.arms.length
    ? simulation.stats.reduce((best, stat, index, all) => stat.estimate > all[best].estimate ? index : best, 0)
    : null;
  const optimalPulls = simulation.stats[scenario.arms.indexOf(bestArm)]?.pulls ?? 0;
  const postInitRounds = Math.max(0, rounds - scenario.arms.length);
  const optimalShare = postInitRounds > 0
    ? Math.max(0, optimalPulls - 1) / postInitRounds
    : 0;
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setRounds(value => Math.min(MAX_STEPS, value + 1)), 150);
    return () => window.clearInterval(timer);
  }, [running]);

  function changeScenario(next: ScenarioId) {
    setPlaying(false); setPlayTarget(0);
    if (next === "gaussian" && policy === "thompson") setPolicy("epsilon");
    setScenarioId(next);
    setRounds(0);
    setMessage(`${scenarios[next].label} loaded. Replay begins with ${scenarios[next].arms.length} forced initialization steps.`);
  }

  function changeSeed(next: number) {
    setPlaying(false); setPlayTarget(0);
    setSeed(next);
    setRounds(0);
    setMessage(`Seed ${next} loaded. Policy and per-arm reward streams are deterministic and separate.`);
  }

  function changeEpsilon(next: number) {
    setPlaying(false);
    setEpsilonPercent(next);
    setMessage(
      rounds
        ? `The ${rounds}-round history was replayed from seed ${seed} at ε = ${next}%.`
        : `Exploration set to ε = ${next}%. Forced initialization remains unchanged.`,
    );
  }

  function moveRounds(delta: number) {
    const next = clamp(rounds + delta, 0, MAX_STEPS);
    setRounds(next);
    if (next === rounds) return;
    if (delta < 0) setMessage(`Replay moved back to round ${next}; all estimates were rebuilt from seed ${seed}.`);
    else if (next <= scenario.arms.length) setMessage(`Forced initialization ${next}/${scenario.arms.length}: ${scenario.arms[next - 1].label} received its first observation.`);
    else setMessage(`Advanced to round ${next}. The selected policy and reward streams reproduce the same seed.`);
  }

  function replay() {
    setPlaying(false); setPlayTarget(0);
    setRounds(0);
    setMessage(`Seed ${seed} rewound to round 0. Repeating the same controls reproduces the same trajectory.`);
  }

  function handleViewKey(event: ReactKeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % views.length;
    else if (event.key === "ArrowLeft") nextIndex = (index - 1 + views.length) % views.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = views.length - 1;
    else return;
    event.preventDefault();
    setView(views[nextIndex].id);
    const tabList = event.currentTarget.closest('[role="tablist"]');
    tabList?.querySelectorAll<HTMLElement>('[role="tab"]')[nextIndex]?.focus();
  }

  const checkpointSteps = Array.from(new Set([
    0,
    Math.min(rounds, scenario.arms.length),
    ...[10, 25, 50, 100, 200, 300, 400, 500].filter((step) => step <= rounds),
    rounds,
  ])).sort((left, right) => left - right);

  return (
    <ProjectCopy copy={banditStudioCopy}><DemoWindow
      appName="STUDY-RL · Bandit lab"
      title="Sequential Decisions Console"
      status={rounds ? `${rounds} SEEDED ROUNDS` : "Ready at round 0"}
      purpose="See how a learning policy balances trying uncertain options against repeatedly choosing the current best option."
      tryThis="Watch 100 rounds. Pause to read why the last arm was chosen, then replay with UCB1 or Thompson sampling."
      watchFor="The chosen arms, learned value estimates and regret trace change together; the oracle is a comparison, not information available to the policy."
      statusTone={rounds ? "working" : "safe"}
      className={styles.studio}
      footer={
        <>
          <span>{policyLabel} · incremental sample mean</span>
          <span>Toy environment · no live decisions</span>
        </>
      }
    >
      <div className={styles.boundaryStrip} role="note">
        <p>Generated rewards, real policy updates. The true means stay hidden from the learner.</p>
        <span>SEED {seed}</span>
      </div>

      <div className={styles.viewTabs} role="tablist" aria-label="Bandit studio views">
        {views.map((tab, index) => (
          <button
            key={tab.id}
            id={`bandit-tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={view === tab.id}
            aria-controls={view === tab.id ? `bandit-panel-${tab.id}` : undefined}
            tabIndex={view === tab.id ? 0 : -1}
            onClick={() => setView(tab.id)}
            onKeyDown={(event) => handleViewKey(event, index)}
          >
            <span>{tab.number}</span><strong>{tab.label}</strong><small>{tab.short}</small>
          </button>
        ))}
      </div>

      <div className={styles.workspace}>
        {view === "policy" ? (
          <section id="bandit-panel-policy" role="tabpanel" aria-labelledby="bandit-tab-policy" className={styles.policyPanel}>
            <div className={styles.sectionHeading}>
              <div><span>One state · k actions</span><h3>Policy console</h3><p>Every arm starts with one observation. After that, your chosen policy decides where to look next.</p></div>
              <div className={styles.phaseBadge}><small>Policy phase</small><strong>{rounds < scenario.arms.length ? "INITIALISE" : policyLabel}</strong><span>{rounds < scenario.arms.length ? `${rounds}/${scenario.arms.length} arms observed` : `${rounds - scenario.arms.length} policy choices`}</span></div>
            </div>

            <div role="group" className={styles.transport} aria-label="Simulation transport controls">
              <button type="button" className={styles.stepButton} disabled={rounds === MAX_STEPS} onClick={() => { if (running) setPlaying(false); else { if (rounds >= playTarget) setPlayTarget(Math.min(MAX_STEPS, rounds + 100)); setPlaying(true); } }}>{running ? "Pause" : rounds > 0 && rounds < playTarget ? "Continue" : "Watch 100 rounds"}</button>
              <button type="button" disabled={running || rounds === MAX_STEPS} onClick={() => moveRounds(1)}>Step once</button>
              <button type="button" disabled={running || rounds === 0} onClick={() => moveRounds(-1)}>← Back 1</button>
              <button type="button" disabled={running || rounds === MAX_STEPS} onClick={() => moveRounds(25)}>+25 rounds</button>
              <button type="button" disabled={running || rounds === MAX_STEPS} onClick={() => moveRounds(100)}>+100 rounds</button>
              <button type="button" disabled={rounds === 0} onClick={replay}>Replay seed</button>
            </div>
            <div className={styles.consoleGrid}>
              <aside className={styles.controlDesk} aria-label="Bandit simulation controls">
                <div className={styles.panelCap}><span>Experiment controls</span><b>{scenario.shortLabel}</b></div>
                <label className={styles.selectField}>
                  <span>Learning policy</span>
                  <ClassicSelect aria-label={t("Learning policy")} value={policy} onChange={(event) => { setPlaying(false); setPlayTarget(0); setPolicy(event.target.value as ComparisonPolicy); setRounds(0); setMessage("Policy changed. Start with the same seed to compare its choices."); }}>
                    <option value="epsilon">{t("ε-greedy")}</option>
                    <option value="ucb1">{t("UCB1 policy")}</option>
                    <option value="thompson" disabled={scenario.kind === "gaussian"}>{t("Thompson sampling")}</option>
                  </ClassicSelect>
                  <small>{policy === "epsilon" ? "Explore randomly with probability ε; otherwise choose the largest estimate." : policy === "ucb1" ? "Add an uncertainty bonus to each estimate; choose the largest upper bound." : "Draw one plausible success rate per arm; choose the largest sampled rate."}</small>
                </label>
                <label className={styles.selectField}>
                  <span>Environment</span>
                  <ClassicSelect aria-label={t("Environment")} value={scenarioId} onChange={(event) => changeScenario(event.target.value as ScenarioId)}>
                    <option value="wide">{t("Bernoulli · wide gaps")}</option>
                    <option value="close">{t("Bernoulli · close contest")}</option>
                    <option value="gaussian">{t("Gaussian · noisy values")}</option>
                  </ClassicSelect>
                </label>
                <label className={styles.selectField}>
                  <span>Replay seed</span>
                  <ClassicSelect aria-label={t("Replay seed")} value={seed} onChange={(event) => changeSeed(Number(event.target.value))}>
                    {seeds.map((entry) => <option key={entry} value={entry}>{t("Seed {0}", {0: entry})}</option>)}
                  </ClassicSelect>
                </label>
                {policy === "epsilon" ? <RangeControl
                  id="bandit-epsilon"
                  label="Exploration ε"
                  value={epsilonPercent}
                  minimum={0}
                  maximum={50}
                  step={5}
                  output={`${epsilonPercent}%`}
                  onChange={changeEpsilon}
                /> : null}
                <label className={styles.truthToggle}>
                  <input type="checkbox" checked={revealTruth} onChange={(event) => setRevealTruth(event.target.checked)} />
                  <span><strong>Reveal true means</strong><small>The policy never reads this switch.</small></span>
                </label>
                <div className={styles.scenarioCard}>
                  <span>Environment note</span>
                  <strong>{scenario.label}</strong>
                  <p>{scenario.id === "gaussian" ? <>A synthetic Gaussian reward experiment with fixed means and reward noise <MathEquation tex={String.raw`\sigma = 0.65`} display={false} />.</> : scenario.description}</p>
                  <dl>
                    <div><dt>Reward</dt><dd>{scenario.kind === "bernoulli" ? "binary {0,1}" : `Normal · σ ${scenario.sigma}`}</dd></div>
                    <div><dt>Arms</dt><dd>{scenario.arms.length}</dd></div>
                    <div><dt>Horizon</dt><dd>{MAX_STEPS}</dd></div>
                  </dl>
                </div>
              </aside>

              <div className={styles.liveDesk}>
                <div role="group" className={styles.metricRail} aria-label="Current bandit metrics">
                  <div><span>ROUND</span><strong>{String(rounds).padStart(3, "0")}</strong></div>
                  <div><span>Policy reward</span><strong>{formatReward(current.policyReward, scenario.kind)}</strong></div>
                  <div><span>Estimate leader</span><strong>{bestEstimatedIndex === null ? "—" : scenario.arms[bestEstimatedIndex].id}</strong></div>
                  <div><span>Optimal share</span><strong>{postInitRounds ? `${(optimalShare * 100).toFixed(1)}%` : "—"}</strong></div>
                </div>
                <div className={styles.mapFrame}>
                  <DecisionMap scenario={scenario} events={simulation.events} />
                  <div className={styles.mapReceipt}>
                    <span>Decision tape · last 90</span>
                    <p>{lastEvent ? `Round ${lastEvent.step}: ${lastEvent.armLabel} · ${lastEvent.mode} · reward ${formatReward(lastEvent.reward, scenario.kind)}.` : "No action has been selected."}</p>
                    <strong>{simulation.modeCounts.initialise} FORCED</strong>
                  </div>
                </div>

              </div>
            </div>

            <div className={styles.liveStatus} role="status" aria-live="polite">
              <span>Run log</span><p>{running ? "Learning one round at a time. Pause to inspect the last decision." : rounds > 0 && playTarget > 0 ? rounds >= playTarget ? `Playback finished at round ${rounds}. Estimates and choices are kept.` : `Paused at round ${rounds}. Continue or inspect the last choice.` : message}</p><strong>Local · seeded</strong>
            </div>

            {lastEvent ? <section className={styles.choiceExplanation} aria-labelledby="choice-title">
              <h4 id="choice-title">Why this arm?</h4>
              <p>{lastEvent.mode === "initialise" ? "First observation: try each arm once before comparing estimates." : lastEvent.mode === "explore" ? "The exploration coin chose a random arm; a smaller estimate can still be selected." : lastEvent.mode === "exploit" ? "This arm had the largest estimate before the reward. Ties are broken randomly." : lastEvent.mode === "optimism" ? "This arm had the largest estimate plus uncertainty bonus before the reward." : "This arm had the largest sampled success rate. The next draw can choose differently."}</p>
              <div className={styles.choiceScores} role="list" aria-label="Scores before the last choice">{scenario.arms.map((arm, index) => <div role="listitem" key={arm.id} className={index === lastEvent.armIndex ? styles.selectedScore : ""}><span>{arm.label}</span><strong>{lastEvent.scores[index].toFixed(3)}</strong><small>{policy === "ucb1" ? "Upper bound" : policy === "thompson" ? "Sampled rate" : "Prior estimate"}</small></div>)}</div>
              <p>{t("{arm} received reward {reward}; its estimate is now {estimate}.", {arm: t(lastEvent.armLabel), reward: formatReward(lastEvent.reward, scenario.kind), estimate: lastEvent.estimateAfter.toFixed(3)})}</p>
            </section> : null}

            <section className={styles.armBoard} aria-labelledby="arm-board-title">
              <div className={styles.boardHeading}><div><span>Empirical estimates</span><h4 id="arm-board-title">What the policy currently believes</h4></div><p><MathEquation tex={String.raw`\widehat Q`} display={false} /> is updated only for the selected arm using the incremental sample mean.</p></div>
              <div className={styles.armGrid}>
                {scenario.arms.map((arm, index) => {
                  const stat = simulation.stats[index];
                  const expectedContribution = stat.pulls * (bestMean - arm.mean);
                  const standardError = stat.pulls === 0
                    ? null
                    : scenario.kind === "bernoulli"
                      ? Math.sqrt(Math.max(0, stat.estimate * (1 - stat.estimate)) / stat.pulls)
                      : scenario.sigma / Math.sqrt(stat.pulls);
                  return (
                    <article key={arm.id} className={`${styles.armCard} ${lastEvent?.armIndex === index ? styles.lastArm : ""}`}>
                      <div className={styles.armHeader}><span>{arm.id}</span><div><strong>{arm.label}</strong><small>{arm.note}</small></div><em>{stat.lastStep === null ? "UNPLAYED" : `LAST #${stat.lastStep}`}</em></div>
                      <div className={styles.estimateReadout}><strong>{stat.pulls ? formatMean(stat.estimate, scenario.kind) : "—"}</strong><span><MathEquation tex={String.raw`\widehat Q`} display={false} /> empirical mean</span></div>
                      <div
                        className={styles.estimateTrack}
                        role="img"
                        aria-label={`${arm.label}: empirical estimate ${stat.pulls ? formatMean(stat.estimate, scenario.kind) : "unobserved"}${revealTruth ? `; true mean ${formatMean(arm.mean, scenario.kind)}` : "; true mean hidden"}`}
                      >
                        <i style={{ width: `${stat.pulls ? estimatePosition(stat.estimate, scenario) : 0}%` }} />
                        {revealTruth ? <b style={{ left: `${truePosition(arm.mean, scenario)}%` }} /> : null}
                      </div>
                      <div className={styles.armStats}>
                        <div><span>Pulls</span><strong>{stat.pulls}</strong></div>
                        <div><span>{scenario.kind === "bernoulli" ? "Wins" : <><MathEquation tex={String.raw`\sum`} display={false} /> reward</>}</span><strong>{scenario.kind === "bernoulli" ? stat.positive : stat.reward.toFixed(2)}</strong></div>
                        <div><span>±1 SE</span><strong>{standardError === null ? "—" : standardError.toFixed(3)}</strong></div>
                        <div><span><MathEquation tex={String.raw`\sum`} display={false} /> mean gap</span><strong>{expectedContribution.toFixed(2)}</strong></div>
                      </div>
                      <div className={styles.truthLine}><span>TRUE <MathEquation tex={String.raw`\mu`} display={false} /></span><strong>{revealTruth ? formatMean(arm.mean, scenario.kind) : "HIDDEN"}</strong></div>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className={styles.dataLedger} aria-labelledby="bandit-ledger-title">
              <div className={styles.boardHeading}><div><span>Accessible run state</span><h4 id="bandit-ledger-title">Arm-by-arm data ledger</h4></div><p>The visual cards and this table expose the same deterministic state.</p></div>
              <PlotPanHint />
              <div role="group" className={styles.tableWrap} tabIndex={0} aria-label="Scrollable arm statistics table">
                <table>
                  <caption>Arm statistics after {rounds} seeded rounds</caption>
                  <thead><tr><th scope="col">Arm</th><th scope="col">True mean</th><th scope="col">Pulls</th><th scope="col">Reward sum</th><th scope="col">Empirical <MathEquation tex={String.raw`\widehat Q`} display={false} /></th><th scope="col">Estimate error</th><th scope="col">Pseudo-regret contribution</th></tr></thead>
                  <tbody>{scenario.arms.map((arm, index) => {
                    const stat = simulation.stats[index];
                    return (
                      <tr key={arm.id}>
                        <th scope="row">{arm.id} · {arm.label}</th>
                        <td>{revealTruth ? formatMean(arm.mean, scenario.kind) : "hidden"}</td>
                        <td>{stat.pulls}</td>
                        <td>{formatReward(stat.reward, scenario.kind)}</td>
                        <td>{stat.pulls ? formatMean(stat.estimate, scenario.kind) : "—"}</td>
                        <td>{stat.pulls && revealTruth ? formatSigned(stat.estimate - arm.mean, 3) : "—"}</td>
                        <td>{(stat.pulls * (bestMean - arm.mean)).toFixed(3)}</td>
                      </tr>
                    );
                  })}</tbody>
                  <tfoot><tr><th scope="row" colSpan={2}>Total / reconciliation</th><td>{rounds}</td><td>{formatReward(current.policyReward, scenario.kind)}</td><td colSpan={2}>—</td><td>{current.expectedRegret.toFixed(3)}</td></tr></tfoot>
                </table>
              </div>
            </section>
          </section>
        ) : null}

        {view === "regret" ? (
          <section id="bandit-panel-regret" role="tabpanel" aria-labelledby="bandit-tab-regret" className={styles.regretPanel}>
            <div className={styles.sectionHeading}>
              <div><span>Mean gap ≠ sampled outcome</span><h3>Regret and oracle comparison</h3><p>One trace accounts for chosen means; the other compares rewards drawn from a fixed counterfactual table.</p></div>
              <div className={styles.oracleBadge}><small>Toy oracle</small><strong>{revealTruth ? bestArm.id : <MathEquation tex={String.raw`\mu^*`} display={false} />}</strong><span>{revealTruth ? `mean ${formatMean(bestMean, scenario.kind)}` : "truth hidden in policy view"}</span></div>
            </div>

            <div className={styles.regretGrid}>
              <div className={styles.chartCard}>
                <div className={styles.chartCap}><span>Cumulative trace</span><strong>ROUND {rounds}</strong></div>
                <RegretChart trace={simulation.trace} />
                <div className={styles.traceSummary}>
                  <div><i className={styles.expectedSwatch} /><span>Expected / pseudo-regret</span><strong>{current.expectedRegret.toFixed(2)}</strong></div>
                  <div><i className={styles.realisedSwatch} /><span>Realised oracle − policy</span><strong>{formatSigned(current.realisedRegret, 2)}</strong></div>
                </div>
              </div>

              <aside className={styles.oraclePanel} aria-label="Oracle comparison receipt">
                <div className={styles.panelCap}><span>Oracle receipt</span><b>SEED {seed}</b></div>
                <section>
                  <span>Expectation account</span>
                  <dl>
                    <div><dt>Oracle <MathEquation tex={String.raw`T\mu^*`} display={false} /></dt><dd>{current.oracleExpected.toFixed(2)}</dd></div>
                    <div><dt>Chosen <MathEquation tex={String.raw`\sum_t\mu_{A_t}`} display={false} /></dt><dd>{current.policyExpected.toFixed(2)}</dd></div>
                    <div className={styles.totalRow}><dt>Difference</dt><dd>{current.expectedRegret.toFixed(2)}</dd></div>
                  </dl>
                </section>
                <section>
                  <span>Realised account</span>
                  <dl>
                    <div><dt>Oracle <MathEquation tex={String.raw`\sum_t R_t^*`} display={false} /></dt><dd>{formatReward(current.oracleReward, scenario.kind)}</dd></div>
                    <div><dt>Policy <MathEquation tex={String.raw`\sum_t R_t`} display={false} /></dt><dd>{formatReward(current.policyReward, scenario.kind)}</dd></div>
                    <div className={styles.totalRow}><dt>Difference</dt><dd>{formatSigned(current.realisedRegret, 2)}</dd></div>
                  </dl>
                </section>
                <div className={styles.oracleNote}>
                  <strong>Counterfactual, not causal</strong>
                  <p>Every round pre-generates one independent reward per arm. The toy oracle reads the best-mean arm’s draw; a live system could not observe all alternatives.</p>
                </div>
              </aside>
            </div>

            <div className={styles.definitionGrid}>
              <section><span>MONOTONE</span><strong>Action-path pseudo-regret</strong><div className={styles.inlineFormula}><MathEquation tex={String.raw`\bar R_T = \sum_t (\mu^* - \mu_{A_t})`} label="Action-path pseudo-regret" /></div><p>Uses known toy means. Each increment is non-negative, so this line cannot fall.</p></section>
              <section><span>Noisy · may fall</span><strong>Realised counterfactual regret</strong><div className={styles.inlineFormula}><MathEquation tex={String.raw`\widetilde R_T = \sum_t (R_t^* - R_t)`} label="Realised counterfactual regret" /></div><p>Uses seeded outcomes. A lucky policy draw can make an increment negative.</p></section>
              <section><span>Oracle limit</span><strong>Available only in simulation</strong><div className={styles.inlineFormula}><MathEquation tex={String.raw`A^* = \operatorname*{arg\,max}_a \mu_a`} label="Best-mean oracle arm" /></div><p>Ground-truth means and unchosen rewards are deliberately unavailable in operational bandit logs.</p></section>
            </div>

            <section className={styles.bakeoff} aria-labelledby="policy-bakeoff-title">
              <div className={styles.boardHeading}>
                <div><span>Source-mechanic comparison</span><h4 id="policy-bakeoff-title">Three policies · twelve paired seeds</h4></div>
                <p>Each policy replays the same deterministic reward table. Compare the pseudo-regret of its chosen actions; realised rewards also contain sampling noise.</p>
              </div>
              {bakeoff ? (
                <div className={styles.bakeoffGrid}>
                  {bakeoff.map((entry) => {
                    const label = entry.policy === "epsilon" ? "ε-greedy · 0.10" : entry.policy === "ucb1" ? <>UCB1 · <MathEquation tex={String.raw`c=2`} display={false} /></> : "Thompson · Beta";
                    const description = entry.policy === "epsilon"
                      ? "Fixed random exploration plus greedy empirical means."
                      : entry.policy === "ucb1"
                        ? <>Optimism bonus <MathEquation tex={String.raw`\sqrt{\frac{2\log t}{n_a}}`} display={false} /> shrinks with evidence.</>
                        : <>Sample <MathEquation tex={String.raw`\operatorname{Beta}(\text{successes}+1,\text{failures}+1)`} display={false} />, then act greedily.</>;
                    return (
                      <article key={entry.policy}>
                        <span>{entry.policy === "epsilon" ? "BASELINE" : "Adaptive exploration"}</span>
                        <strong>{label}</strong>
                        <p>{description}</p>
                        <dl><div><dt>Mean regret</dt><dd>{entry.mean.toFixed(2)}</dd></div><div><dt>Seed range</dt><dd>{entry.minimum.toFixed(2)}—{entry.maximum.toFixed(2)}</dd></div></dl>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className={styles.bakeoffUnavailable} role="note"><strong>Bernoulli policies only</strong><span>Beta-Bernoulli Thompson Sampling and bounded-reward UCB1 are intentionally withheld for the Gaussian scenario.</span></div>
              )}
              <footer><span>HORIZON {Math.max(50, rounds)}</span><span>12 Fixed seeds</span><span>Paired synthetic rewards</span><span>Source definitions · week 01</span></footer>
            </section>

            <section className={styles.checkpointLedger} aria-labelledby="checkpoint-title">
              <div className={styles.boardHeading}><div><span>Trace reconciliation</span><h4 id="checkpoint-title">Selected checkpoints</h4></div><p>Expected difference equals pseudo-regret at every row by construction.</p></div>
              <PlotPanHint />
              <div role="group" className={styles.tableWrap} tabIndex={0} aria-label="Scrollable regret checkpoint table">
                <table>
                  <caption>Expected and realised regret checkpoints</caption>
                  <thead><tr><th scope="col">Round</th><th scope="col">Oracle expected</th><th scope="col">Policy expected</th><th scope="col">Pseudo-regret</th><th scope="col">Oracle realised</th><th scope="col">Policy realised</th><th scope="col">Realised regret</th></tr></thead>
                  <tbody>{checkpointSteps.map((step) => {
                    const point = simulation.trace[step];
                    return (
                      <tr key={step}>
                        <th scope="row">{step}</th><td>{point.oracleExpected.toFixed(2)}</td><td>{point.policyExpected.toFixed(2)}</td><td>{point.expectedRegret.toFixed(2)}</td><td>{formatReward(point.oracleReward, scenario.kind)}</td><td>{formatReward(point.policyReward, scenario.kind)}</td><td>{formatSigned(point.realisedRegret, 2)}</td>
                      </tr>
                    );
                  })}</tbody>
                </table>
              </div>
            </section>
          </section>
        ) : null}

        {view === "method" ? (
          <section id="bandit-panel-method" role="tabpanel" aria-labelledby="bandit-tab-method" className={styles.methodPanel}>
            <div className={styles.sectionHeading}>
              <div><span>Method</span><h3>From a policy choice to cumulative regret</h3><p>Each round selects an arm, observes a seeded reward and updates the estimate. The oracle makes the cost of exploration visible.</p></div>
            </div>

            <div role="group" className={styles.algorithmFlow} aria-label="Browser learning sequence">
              <div><span>01</span><strong>Force K pulls</strong><small>A, B, … exactly once</small></div>
              <i aria-hidden="true">→</i>
              <div><span>02</span><strong>Apply chosen policy</strong><small>random, bound or posterior</small></div>
              <i aria-hidden="true">→</i>
              <div><span>03</span><strong>Select arm</strong><small>use information so far</small></div>
              <i aria-hidden="true">→</i>
              <div><span>04</span><strong>Observe reward</strong><small>seeded per t × arm</small></div>
              <i aria-hidden="true">→</i>
              <div><span>05</span><strong>Update & account</strong><small>estimate + two regrets</small></div>
            </div>

            <div className={styles.methodGrid}>
              <section className={styles.equationDeck} aria-labelledby="equation-deck-title">
                <div className={styles.cardCap}><span>Executable equations</span><strong>Generic bandit math</strong></div>
                <h4 id="equation-deck-title">Four lines drive the workbench</h4>
                <PlotPanHint />
                <div className={styles.equationRow}><span>POLICY</span><div><MathEquation tex={String.raw`A_t = \begin{cases} \operatorname{uniform}(\mathcal A), & \text{with probability }\varepsilon, \\ \operatorname*{arg\,max}_a \widehat Q_a, & \text{otherwise}. \end{cases}`} label="Epsilon-greedy policy" /></div></div>
                <div className={styles.equationRow}><span>UPDATE</span><div><MathEquation tex={String.raw`\widehat Q_{a,n} \leftarrow \widehat Q_{a,n-1} + \frac{R_n - \widehat Q_{a,n-1}}{n}`} label="Incremental sample-mean update" /></div></div>
                <div className={styles.equationRow}><span>PSEUDO</span><div><MathEquation tex={String.raw`\bar R_T = \sum_{t=1}^{T}(\mu^* - \mu_{A_t}) = \sum_a N_a(T)\Delta_a`} label="Cumulative pseudo-regret identity" /></div></div>
                <div className={styles.equationRow}><span>REALISED</span><div><MathEquation tex={String.raw`\widetilde R_T = \sum_{t=1}^{T}(R_t^* - R_t)`} label="Cumulative realised counterfactual regret" /></div></div>
                <p>The first three relations align with the Week 01 environment, agent and cumulative-regret contracts. The realised counterfactual ledger is an explicit browser addition.</p>
              </section>

              <section className={styles.sourceLedger} aria-labelledby="source-ledger-title">
                <div className={styles.cardCap}><span>Experiment design</span><strong>Reproducible synthetic rewards</strong></div>
                <h4 id="source-ledger-title">What shapes the comparison</h4>
                <ul>
                  <li><span className={styles.groundedTag}>GROUNDED</span><p>Bernoulli and Gaussian arms, mean-gap regret, ε-greedy selection and incremental estimates.</p></li>
                  <li><span className={styles.groundedTag}>GROUNDED</span><p>The three-arm means (0.20, 0.50, 0.80), ε = 0.10 and a 200-round teaching fixture.</p></li>
                  <li><span className={styles.adaptedTag}>ADAPTED</span><p>One forced pull per arm gives every estimate an observed reward before exploitation begins.</p></li>
                  <li><span className={styles.adaptedTag}>ADAPTED</span><p>A stable browser PRNG and split policy/reward streams replace runtime-dependent randomness.</p></li>

                </ul>
              </section>
            </div>

            <section className={styles.initialisationAudit} aria-labelledby="initialisation-title">
              <div><span>Browser hardening</span><h4 id="initialisation-title">Forced initialization is a declared policy stage</h4><p>ε-greedy does not mathematically require forced pulls: zero estimates plus random tie-breaking are also valid. This exhibit intentionally pulls A → B → … once, because its interface promises defined empirical estimates before ε-greedy begins.</p></div>
              <div className={styles.initSequence}>{scenario.arms.map((arm, index) => <span key={arm.id} className={rounds > index ? styles.initDone : ""}><b>{index + 1}</b>{arm.id}</span>)}<i>then chosen policy</i></div>
            </section>

            <aside className={styles.boundaryGrid} role="note">
              <section><span>Limitations</span><strong>A stationary testbed</strong><p>Known arm means and complete synthetic counterfactuals simplify this comparison. Delayed feedback, changing rewards, interference and uncertain logging policies require additional methods.</p></section>
            </aside>
          </section>
        ) : null}
      </div>
    </DemoWindow></ProjectCopy>
  );
}

export default BanditStudio;
