"use client";

/*
Solid–liquid equilibrium relationships are independently implemented from the
public, MIT-licensed Clapeyron.jl equations pinned in the evidence view
(copyright 2020 Hon Wa Yew and Pierre Walker). The local research repository
was audited for workflow structure only; it is private, has no repository-level
licence, and no local compound data, parameters, results or code are shipped.
*/

import { useId, useMemo, useState } from "react";
import { DemoWindow } from "./DemoChrome";
import styles from "./DrugSolubilityStudio.module.css";

type ViewId = "solver" | "basis" | "validation" | "evidence";
type Basis = "mole" | "mass";
type ScenarioId = "reference" | "near-melt" | "strong-positive";

type SolverConfig = {
  temperature: number;
  meltingTemperature: number;
  fusionEnthalpy: number;
  interactionA: number;
  solventMolarMass: number;
  soluteMolarMass: number;
};

type Iteration = {
  iteration: number;
  log10x: number;
  x: number;
  residual: number;
  step: "initial" | "newton" | "bisection";
};

type SolverResult = {
  x: number;
  idealX: number;
  gamma: number;
  rhs: number;
  residual: number;
  energyResidual: number;
  iterations: Iteration[];
  converged: boolean;
};

type CurvePoint = {
  temperature: number;
  idealX: number;
  nonIdealX: number;
  idealMass: number;
  nonIdealMass: number;
};

type SyntheticPoint = {
  temperature: number;
  observed: number;
  split: "calibration" | "holdout";
};

const R = 8.31446261815324;
const CLAPEYRON_COMMIT = "3c71bfa917a5bfc37bf01fef8f5adbcbddbf437a";
const CLAPEYRON_ROOT = `https://github.com/ClapeyronThermo/Clapeyron.jl/blob/${CLAPEYRON_COMMIT}`;
const SLE_SOURCE = `${CLAPEYRON_ROOT}/src/methods/property_solvers/multicomponent/solids/sle_solubility.jl`;
const SOLID_SOURCE = `${CLAPEYRON_ROOT}/src/models/CompositeModel/SolidModel/SolidHfus.jl`;
const MARGULES_SOURCE = `${CLAPEYRON_ROOT}/src/models/Activity/Margules/Margules.jl`;
const CLAPEYRON_LICENSE = `${CLAPEYRON_ROOT}/LICENSE.md`;

const VIEWS: Array<{ id: ViewId; label: string; hint: string }> = [
  { id: "solver", label: "Equilibrium solver", hint: "activity-corrected root" },
  { id: "basis", label: "Measurement basis", hint: "x ↔ mg g⁻¹ solvent" },
  { id: "validation", label: "Synthetic validation", hint: "fit without private data" },
  { id: "evidence", label: "Evidence boundary", hint: "source + exclusions" },
];

const SCENARIOS: Array<{ id: ScenarioId; label: string; hint: string; config: SolverConfig }> = [
  {
    id: "reference",
    label: "Illustrative Q/L",
    hint: "moderate positive deviation",
    config: {
      temperature: 298,
      meltingTemperature: 420,
      fusionEnthalpy: 25_000,
      interactionA: 0.8,
      solventMolarMass: 92,
      soluteMolarMass: 260,
    },
  },
  {
    id: "near-melt",
    label: "Near melting point",
    hint: "weaker fusion penalty",
    config: {
      temperature: 375,
      meltingTemperature: 420,
      fusionEnthalpy: 25_000,
      interactionA: 0.4,
      solventMolarMass: 92,
      soluteMolarMass: 260,
    },
  },
  {
    id: "strong-positive",
    label: "Strong non-ideality",
    hint: "γQ > 1 lowers xQ",
    config: {
      temperature: 298,
      meltingTemperature: 440,
      fusionEnthalpy: 28_000,
      interactionA: 1.35,
      solventMolarMass: 110,
      soluteMolarMass: 310,
    },
  },
];

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function massBasisFromMoleFraction(x: number, solventMolarMass: number, soluteMolarMass: number) {
  return (x / Math.max(1 - x, Number.EPSILON)) * (soluteMolarMass / solventMolarMass) * 1_000;
}

function moleFractionFromMassBasis(mass: number, solventMolarMass: number, soluteMolarMass: number) {
  const ratio = mass * 0.001 * (solventMolarMass / soluteMolarMass);
  return ratio / (1 + ratio);
}

function solveSolubility(
  temperature: number,
  meltingTemperature: number,
  fusionEnthalpy: number,
  interactionA: number,
): SolverResult {
  const safeTemperature = Math.min(temperature, meltingTemperature - 0.001);
  const rhs = (fusionEnthalpy / R) * (1 / meltingTemperature - 1 / safeTemperature);
  const idealX = clamp(Math.exp(rhs), 1e-12, 1 - 1e-12);
  const ln10 = Math.log(10);
  const residualAtLogX = (log10x: number) => {
    const x = 10 ** log10x;
    return ln10 * log10x + interactionA * (1 - x) ** 2 - rhs;
  };

  let low = -12;
  let high = -1e-12;
  let log10x = clamp((rhs - interactionA) / ln10, low, high);
  let nextStep: Iteration["step"] = "initial";
  const iterations: Iteration[] = [];
  let converged = false;

  for (let iteration = 0; iteration < 32; iteration += 1) {
    const x = 10 ** log10x;
    const residual = residualAtLogX(log10x);
    iterations.push({ iteration, log10x, x, residual, step: nextStep });

    if (Math.abs(residual) < 1e-10) {
      converged = true;
      break;
    }

    if (residual > 0) high = log10x;
    else low = log10x;

    const derivative = ln10 * (1 - 2 * interactionA * x * (1 - x));
    const candidate = log10x - residual / derivative;
    const useNewton = Number.isFinite(candidate) && candidate > low && candidate < high;
    log10x = useNewton ? candidate : (low + high) / 2;
    nextStep = useNewton ? "newton" : "bisection";
  }

  const x = clamp(10 ** log10x, 1e-12, 1 - 1e-12);
  const gamma = Math.exp(interactionA * (1 - x) ** 2);
  const residual = Math.log(x * gamma) - rhs;

  return {
    x,
    idealX,
    gamma,
    rhs,
    residual,
    energyResidual: R * safeTemperature * residual,
    iterations,
    converged,
  };
}

function formatScientific(value: number, digits = 3) {
  if (value === 0) return "0";
  return value.toExponential(digits);
}

function formatMass(value: number) {
  if (value >= 100) return `${value.toFixed(1)} mg g⁻¹`;
  if (value >= 1) return `${value.toFixed(2)} mg g⁻¹`;
  return `${value.toFixed(4)} mg g⁻¹`;
}

function makeCurve(config: SolverConfig) {
  const lower = Math.min(config.temperature, Math.max(250, config.meltingTemperature - 170));
  const upper = Math.max(config.temperature, config.meltingTemperature - 3);
  return Array.from({ length: 32 }, (_, index): CurvePoint => {
    const temperature = lower + (index / 31) * (upper - lower);
    const result = solveSolubility(temperature, config.meltingTemperature, config.fusionEnthalpy, config.interactionA);
    return {
      temperature,
      idealX: result.idealX,
      nonIdealX: result.x,
      idealMass: massBasisFromMoleFraction(result.idealX, config.solventMolarMass, config.soluteMolarMass),
      nonIdealMass: massBasisFromMoleFraction(result.x, config.solventMolarMass, config.soluteMolarMass),
    };
  });
}

function linePath(points: Array<{ x: number; y: number }>) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(" ");
}

function SolubilityChart({ curve, config, result, basis }: { curve: CurvePoint[]; config: SolverConfig; result: SolverResult; basis: Basis }) {
  const width = 800;
  const height = 310;
  const left = 66;
  const right = 24;
  const top = 24;
  const bottom = 50;
  const values = curve.flatMap((point) => basis === "mole" ? [point.idealX, point.nonIdealX] : [point.idealMass, point.nonIdealMass]);
  const logValues = values.map((value) => Math.log10(Math.max(value, 1e-12)));
  const minimumLog = Math.floor(Math.min(...logValues));
  const maximumLog = Math.ceil(Math.max(...logValues));
  const logSpan = Math.max(maximumLog - minimumLog, 1);
  const minimumTemperature = curve[0].temperature;
  const maximumTemperature = curve.at(-1)?.temperature ?? minimumTemperature + 1;
  const xScale = (temperature: number) => left + ((temperature - minimumTemperature) / (maximumTemperature - minimumTemperature)) * (width - left - right);
  const yScale = (value: number) => top + ((maximumLog - Math.log10(Math.max(value, 1e-12))) / logSpan) * (height - top - bottom);
  const idealPath = linePath(curve.map((point) => ({ x: xScale(point.temperature), y: yScale(basis === "mole" ? point.idealX : point.idealMass) })));
  const nonIdealPath = linePath(curve.map((point) => ({ x: xScale(point.temperature), y: yScale(basis === "mole" ? point.nonIdealX : point.nonIdealMass) })));
  const selectedValue = basis === "mole" ? result.x : massBasisFromMoleFraction(result.x, config.solventMolarMass, config.soluteMolarMass);

  return (
    <div className={styles.chartShell}>
      <div className={styles.chartHeader}>
        <div><span>INVENTED Q/L PHASE BOUNDARY</span><strong>Temperature sensitivity on a logarithmic reporting axis</strong></div>
        <div className={styles.legend}><span data-line="ideal">Ideal γ = 1</span><span data-line="nonideal">Symmetric Margules</span></div>
      </div>
      <svg className={styles.chart} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Synthetic solubility curve in ${basis === "mole" ? "mole fraction" : "milligrams per gram solvent"}, from ${minimumTemperature.toFixed(0)} to ${maximumTemperature.toFixed(0)} kelvin.`}>
        <title>Synthetic solid–liquid equilibrium curve</title>
        <desc>Ideal and activity-corrected illustrative solubility for invented Compound Q in invented Solvent L. The vertical scale is logarithmic.</desc>
        {Array.from({ length: 5 }, (_, index) => {
          const fraction = index / 4;
          const y = top + fraction * (height - top - bottom);
          const exponent = maximumLog - fraction * logSpan;
          return <g key={index}><line className={styles.gridLine} x1={left} x2={width - right} y1={y} y2={y} /><text className={styles.axisText} x={left - 10} y={y + 3}>10^{exponent.toFixed(1)}</text></g>;
        })}
        {[0, 1, 2, 3, 4].map((index) => {
          const fraction = index / 4;
          const temperature = minimumTemperature + fraction * (maximumTemperature - minimumTemperature);
          const x = xScale(temperature);
          return <g key={index}><line className={styles.tickLine} x1={x} x2={x} y1={top} y2={height - bottom} /><text className={styles.axisTextCentre} x={x} y={height - 28}>{temperature.toFixed(0)}</text></g>;
        })}
        <path className={styles.idealLineShadow} d={idealPath} />
        <path className={styles.idealLine} d={idealPath} />
        <path className={styles.nonIdealLineShadow} d={nonIdealPath} />
        <path className={styles.nonIdealLine} d={nonIdealPath} />
        <line className={styles.selectedGuide} x1={xScale(config.temperature)} x2={xScale(config.temperature)} y1={top} y2={height - bottom} />
        <circle className={styles.selectedPoint} cx={xScale(config.temperature)} cy={yScale(selectedValue)} r="5" />
        <text className={styles.axisLabel} x={(left + width - right) / 2} y={height - 7}>temperature / K</text>
        <text className={styles.axisLabel} x="13" y={height / 2} transform={`rotate(-90 13 ${height / 2})`}>{basis === "mole" ? "mole fraction xQ" : "mg Q / g solvent L"}</text>
      </svg>
    </div>
  );
}

function ParameterControl({ label, value, min, max, step, unit, onChange }: { label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (value: number) => void }) {
  const inputId = useId();
  const outputId = `${inputId}-value`;

  return (
    <div className={styles.parameterControl}>
      <span><label htmlFor={inputId}>{label}</label><output id={outputId} htmlFor={inputId}>{value.toLocaleString("en-GB", { maximumFractionDigits: 2 })} {unit}</output></span>
      <input id={inputId} aria-describedby={outputId} type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </div>
  );
}

function MetricCard({ label, value, detail, tone = "neutral" }: { label: string; value: string; detail: string; tone?: "neutral" | "blue" | "green" | "amber" }) {
  return <article className={styles.metricCard} data-tone={tone}><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>;
}

const SYNTHETIC_TRUTH = { meltingTemperature: 420, fusionEnthalpy: 25_000, interactionA: 0.65 };
const SYNTHETIC_OFFSETS = [1.025, 0.982, 1.014, 0.974, 1.021, 0.991];
const SYNTHETIC_POINTS: SyntheticPoint[] = [278, 288, 298, 308, 318, 328].map((temperature, index) => ({
  temperature,
  observed: solveSolubility(temperature, SYNTHETIC_TRUTH.meltingTemperature, SYNTHETIC_TRUTH.fusionEnthalpy, SYNTHETIC_TRUTH.interactionA).x * SYNTHETIC_OFFSETS[index],
  split: index < 4 ? "calibration" : "holdout",
}));

function aard(rows: Array<{ observed: number; predicted: number }>) {
  return rows.reduce((sum, row) => sum + Math.abs((row.predicted - row.observed) / row.observed), 0) / rows.length * 100;
}

function logRmse(rows: Array<{ observed: number; predicted: number }>) {
  const squared = rows.reduce((sum, row) => sum + (Math.log10(row.predicted) - Math.log10(row.observed)) ** 2, 0);
  return Math.sqrt(squared / rows.length);
}

function ValidationChart({ rows }: { rows: Array<SyntheticPoint & { predicted: number }> }) {
  const width = 720;
  const height = 255;
  const left = 60;
  const right = 24;
  const top = 24;
  const bottom = 42;
  const values = rows.flatMap((row) => [row.observed, row.predicted]);
  const minLog = Math.floor(Math.min(...values.map(Math.log10)));
  const maxLog = Math.ceil(Math.max(...values.map(Math.log10)));
  const span = Math.max(maxLog - minLog, 1);
  const xScale = (temperature: number) => left + ((temperature - rows[0].temperature) / ((rows.at(-1)?.temperature ?? rows[0].temperature + 1) - rows[0].temperature)) * (width - left - right);
  const yScale = (value: number) => top + ((maxLog - Math.log10(value)) / span) * (height - top - bottom);
  const predictedPath = linePath(rows.map((row) => ({ x: xScale(row.temperature), y: yScale(row.predicted) })));

  return (
    <svg className={styles.validationChart} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Synthetic calibration and holdout observations compared with the current illustrative model curve.">
      <title>Synthetic validation exercise</title>
      <desc>Four invented calibration points and two invented holdout points compared with a symmetric Margules solid-liquid equilibrium calculation.</desc>
      {[0, 1, 2, 3].map((index) => {
        const y = top + index / 3 * (height - top - bottom);
        return <line key={index} className={styles.gridLine} x1={left} x2={width - right} y1={y} y2={y} />;
      })}
      <path className={styles.validationPathShadow} d={predictedPath} />
      <path className={styles.validationPath} d={predictedPath} />
      {rows.map((row) => <circle key={row.temperature} className={row.split === "calibration" ? styles.calibrationPoint : styles.holdoutPoint} cx={xScale(row.temperature)} cy={yScale(row.observed)} r="5" />)}
      <text className={styles.axisLabel} x={width / 2} y={height - 6}>temperature / K</text>
      <text className={styles.axisLabel} x="13" y={height / 2} transform={`rotate(-90 13 ${height / 2})`}>log mole fraction</text>
    </svg>
  );
}

export function DrugSolubilityStudio() {
  const [view, setView] = useState<ViewId>("solver");
  const [basis, setBasis] = useState<Basis>("mole");
  const [scenario, setScenario] = useState<ScenarioId | null>("reference");
  const [config, setConfig] = useState<SolverConfig>(SCENARIOS[0].config);
  const [basisLogX, setBasisLogX] = useState(-1.4);
  const [trialA, setTrialA] = useState(0);

  const result = useMemo(() => solveSolubility(config.temperature, config.meltingTemperature, config.fusionEnthalpy, config.interactionA), [config]);
  const curve = useMemo(() => makeCurve(config), [config]);
  const massBasis = massBasisFromMoleFraction(result.x, config.solventMolarMass, config.soluteMolarMass);
  const basisX = 10 ** basisLogX;
  const basisMass = massBasisFromMoleFraction(basisX, config.solventMolarMass, config.soluteMolarMass);
  const roundTripX = moleFractionFromMassBasis(basisMass, config.solventMolarMass, config.soluteMolarMass);

  const validationRows = useMemo(() => SYNTHETIC_POINTS.map((point) => ({
    ...point,
    predicted: solveSolubility(point.temperature, SYNTHETIC_TRUTH.meltingTemperature, SYNTHETIC_TRUTH.fusionEnthalpy, trialA).x,
  })), [trialA]);
  const calibrationRows = validationRows.filter((row) => row.split === "calibration");
  const holdoutRows = validationRows.filter((row) => row.split === "holdout");

  const selectScenario = (id: ScenarioId) => {
    const selected = SCENARIOS.find((item) => item.id === id) ?? SCENARIOS[0];
    setScenario(id);
    setConfig(selected.config);
  };

  const updateConfig = (patch: Partial<SolverConfig>) => {
    setScenario(null);
    setConfig((current) => {
      const next = { ...current, ...patch };
      next.temperature = Math.min(next.temperature, next.meltingTemperature - 1);
      return next;
    });
  };

  const fitSyntheticA = () => {
    let bestA = -1.5;
    let bestLoss = Number.POSITIVE_INFINITY;
    for (let index = 0; index <= 300; index += 1) {
      const candidateA = -1.5 + index * 0.01;
      const candidateRows = SYNTHETIC_POINTS.filter((point) => point.split === "calibration").map((point) => ({
        observed: point.observed,
        predicted: solveSolubility(point.temperature, SYNTHETIC_TRUTH.meltingTemperature, SYNTHETIC_TRUTH.fusionEnthalpy, candidateA).x,
      }));
      const loss = aard(candidateRows);
      if (loss < bestLoss) {
        bestLoss = loss;
        bestA = candidateA;
      }
    }
    setTrialA(Number(bestA.toFixed(2)));
  };

  return (
    <DemoWindow
      appName="SLE_SOLVER.jl · privacy-safe workflow port"
      title="Solid–Liquid Solubility Workflow"
      status="SYNTHETIC · NOT VALIDATED"
      statusTone="safe"
      className={styles.studio}
      footer={<><span>PRIVATE RESEARCH WORKFLOW · NO COMPOUNDS OR RESULTS SHIPPED</span><span>OPEN EQUATIONS · INVENTED Q/L PARAMETERS · EDUCATIONAL ONLY</span></>}
    >
      <aside className={styles.boundaryBanner} role="note">
        <span>SAFE WORKFLOW EXHIBIT</span>
        <p>Invented Compound Q and Solvent L exercise public SLE equations and generic basis conversions. No molecule, dataset, parameter, result, client, job-application or personal file is read into this component.</p>
        <strong>NOT A PROPERTY PREDICTION</strong>
      </aside>

      <nav className={styles.viewTabs} aria-label="Solubility workflow views">
        {VIEWS.map((option) => <button key={option.id} type="button" aria-current={view === option.id ? "page" : undefined} onClick={() => setView(option.id)}><strong>{option.label}</strong><span>{option.hint}</span></button>)}
      </nav>

      {view === "solver" ? (
        <div className={styles.solverView}>
          <section className={styles.metricGrid} aria-label="Current illustrative equilibrium metrics">
            <MetricCard label="Activity-corrected xQ" value={formatScientific(result.x)} detail="equilibrium mole fraction" tone="blue" />
            <MetricCard label="Mass reporting basis" value={formatMass(massBasis)} detail="mg Q per g solvent L" tone="green" />
            <MetricCard label="Activity coefficient γQ" value={result.gamma.toFixed(4)} detail="symmetric Margules" />
            <MetricCard label="Chemical-potential residual" value={`${formatScientific(result.energyResidual, 2)} J mol⁻¹`} detail="RT · [ln(xγ) − fusion term]" tone="amber" />
            <MetricCard label="Safeguarded solve" value={`${result.iterations.length} steps`} detail={result.converged ? "dimensionless residual converged" : "iteration cap reached"} />
          </section>

          <section className={styles.controlDeck} aria-labelledby="solver-controls-heading">
            <div className={styles.deckIntro}><span>INVENTED PARAMETER DECK</span><h3 id="solver-controls-heading">Trace one public equilibrium relation</h3><p>Temperature must remain below the illustrative melting point. CpSL is deliberately zero; pressure effects and polymorph selection are out of scope.</p></div>
            <div className={styles.scenarioButtons} role="group" aria-label="Illustrative parameter scenario">
              {SCENARIOS.map((item) => <button key={item.id} type="button" aria-pressed={scenario === item.id} onClick={() => selectScenario(item.id)}><strong>{item.label}</strong><span>{item.hint}</span></button>)}
            </div>
            <div className={styles.parameterGrid}>
              <ParameterControl label="Temperature T" value={config.temperature} min={250} max={config.meltingTemperature - 1} step={1} unit="K" onChange={(temperature) => updateConfig({ temperature })} />
              <ParameterControl label="Melting point Tm" value={config.meltingTemperature} min={340} max={500} step={1} unit="K" onChange={(meltingTemperature) => updateConfig({ meltingTemperature })} />
              <ParameterControl label="Fusion enthalpy ΔHfus" value={config.fusionEnthalpy / 1_000} min={12} max={40} step={0.5} unit="kJ mol⁻¹" onChange={(value) => updateConfig({ fusionEnthalpy: value * 1_000 })} />
              <ParameterControl label="Margules interaction A" value={config.interactionA} min={-1.5} max={1.5} step={0.05} unit="" onChange={(interactionA) => updateConfig({ interactionA })} />
            </div>
          </section>

          <div className={styles.solverGrid}>
            <div className={styles.chartColumn}>
              <div className={styles.basisSwitch} role="group" aria-label="Chart reporting basis"><span>REPORT AS</span><button type="button" aria-pressed={basis === "mole"} onClick={() => setBasis("mole")}>Mole fraction xQ</button><button type="button" aria-pressed={basis === "mass"} onClick={() => setBasis("mass")}>mg Q / g solvent</button></div>
              <SolubilityChart curve={curve} config={config} result={result} basis={basis} />
            </div>
            <section className={styles.calculationTape} aria-labelledby="calculation-tape-heading">
              <div className={styles.panelHeading}><div><span>VISIBLE CALCULATION TAPE</span><h3 id="calculation-tape-heading">From fusion penalty to reportable basis</h3></div><strong>{result.converged ? "CONVERGED" : "REVIEW"}</strong></div>
              <ol>
                <li><span>01</span><div><strong>Fusion term</strong><code>ΔHfus/R · (1/Tm − 1/T)</code><output>{result.rhs.toFixed(6)}</output></div></li>
                <li><span>02</span><div><strong>Ideal boundary</strong><code>xideal = exp(fusion term)</code><output>{formatScientific(result.idealX, 5)}</output></div></li>
                <li><span>03</span><div><strong>Activity correction</strong><code>ln γQ = A · (1 − xQ)²</code><output>{Math.log(result.gamma).toFixed(6)}</output></div></li>
                <li><span>04</span><div><strong>Implicit root</strong><code>ln(xQ γQ) − fusion term = 0</code><output>{formatScientific(result.residual, 3)}</output></div></li>
                <li><span>05</span><div><strong>Reporting basis</strong><code>xQ/(1−xQ) · MQ/ML · 1000</code><output>{formatMass(massBasis)}</output></div></li>
              </ol>
              <p>Positive A gives γQ &gt; 1 and lowers the equilibrium mole fraction relative to the ideal calculation. This browser model does not evaluate PC-SAFT.</p>
            </section>
          </div>

          <details className={styles.dataFallback}>
            <summary>Accessible phase-boundary table <span>{curve.length} synthetic temperatures</span></summary>
            <div className={styles.tableScroll} role="region" aria-label="Synthetic solubility curve data" tabIndex={0}>
              <table><thead><tr><th>T / K</th><th>Ideal xQ</th><th>Activity-corrected xQ</th><th>Ideal mg g⁻¹</th><th>Corrected mg g⁻¹</th></tr></thead><tbody>{curve.map((point) => <tr key={point.temperature}><td>{point.temperature.toFixed(2)}</td><td>{formatScientific(point.idealX, 5)}</td><td>{formatScientific(point.nonIdealX, 5)}</td><td>{point.idealMass.toFixed(5)}</td><td>{point.nonIdealMass.toFixed(5)}</td></tr>)}</tbody></table>
            </div>
          </details>
        </div>
      ) : null}

      {view === "basis" ? (
        <div className={styles.basisView}>
          <section className={styles.basisHero}>
            <div><span>MEASUREMENT CONTRACT</span><h3>Mole fraction is not mg per gram of solution</h3><p>The generic local helper converts the SLE output into milligrams of solute per gram of solvent. The denominator distinction is retained explicitly here.</p></div>
            <button type="button" onClick={() => setBasisLogX(Math.log10(result.x))}>Load current solver xQ</button>
          </section>
          <div className={styles.basisLayout}>
            <section className={styles.converterCard}>
              <div className={styles.panelHeading}><div><span>INTERACTIVE BASIS CONVERTER</span><h3>Invented Q/L molar masses</h3></div><strong>ROUND-TRIP CHECKED</strong></div>
              <div className={styles.converterControls}>
                <ParameterControl label="log₁₀ mole fraction xQ" value={basisLogX} min={-5} max={-0.05} step={0.01} unit="" onChange={setBasisLogX} />
                <ParameterControl label="Solvent L molar mass" value={config.solventMolarMass} min={40} max={180} step={1} unit="g mol⁻¹" onChange={(solventMolarMass) => updateConfig({ solventMolarMass })} />
                <ParameterControl label="Compound Q molar mass" value={config.soluteMolarMass} min={120} max={480} step={1} unit="g mol⁻¹" onChange={(soluteMolarMass) => updateConfig({ soluteMolarMass })} />
              </div>
              <div className={styles.conversionReadout}>
                <article><span>SLE OUTPUT</span><strong>{formatScientific(basisX, 5)}</strong><small>mol Q / total mol</small></article>
                <div aria-hidden="true">→</div>
                <article><span>REPORTING OUTPUT</span><strong>{formatMass(basisMass)}</strong><small>mg Q / g solvent L</small></article>
              </div>
              <div className={styles.roundTrip}><span>ROUND-TRIP INVARIANT</span><code>x → mg/g solvent → x</code><strong>absolute Δ = {formatScientific(Math.abs(roundTripX - basisX), 2)}</strong></div>
            </section>
            <section className={styles.formulaLedger}>
              <div className={styles.panelHeading}><div><span>GENERIC LOCAL WORKFLOW</span><h3>Two reciprocal transforms</h3></div><strong>NO COMPOUND DATA</strong></div>
              <article><span>FORWARD</span><h4>Mole fraction → mass ratio</h4><div className={styles.formula}><i>m</i><sub>Q/L</sub><b>=</b><span><i>x</i><sub>Q</sub> / (1 − <i>x</i><sub>Q</sub>)</span><b>·</b><span><i>M</i><sub>Q</sub> / <i>M</i><sub>L</sub></span><b>· 1000</b></div><p>The result is milligrams of Q per gram of solvent L—not milligrams per gram of the final solution.</p></article>
              <article><span>INVERSE</span><h4>Mass ratio → mole fraction</h4><div className={styles.formula}><i>x</i><sub>Q</sub><b>=</b><span><i>r</i> / (1 + <i>r</i>)</span><em>where r = m · 0.001 · ML/MQ</em></div><p>The inverse is useful when an experimental reporting basis must be reconciled before model comparison.</p></article>
              <aside><strong>Unit gate</strong><p>Both molar masses use g mol⁻¹; the factor 1000 converts g/g solvent to mg/g solvent. No density or volume conversion is implied.</p></aside>
            </section>
          </div>
        </div>
      ) : null}

      {view === "validation" ? (
        <div className={styles.validationView}>
          <aside className={styles.syntheticBanner} role="note"><span>SYNTHETIC METHOD EXERCISE</span><p>All six points, offsets and “truth” parameters are authored for this browser. These metrics demonstrate a split-aware workflow; they are not evidence about any compound or deployed model.</p><strong>NOT VALIDATION EVIDENCE</strong></aside>
          <section className={styles.fitControls}>
            <div><span>ONE-PARAMETER ILLUSTRATION</span><h3>Fit A on four points; inspect two untouched synthetic holdouts</h3><p>The exercise makes calibration/holdout separation visible without importing a private experimental table.</p></div>
            <ParameterControl label="Trial interaction A" value={trialA} min={-1.5} max={1.5} step={0.01} unit="" onChange={setTrialA} />
            <div className={styles.fitButtons}><button type="button" onClick={fitSyntheticA}>Fit calibration grid</button><button type="button" onClick={() => setTrialA(0)}>Reset A = 0</button></div>
          </section>
          <section className={styles.validationMetrics} aria-label="Synthetic fitting metrics">
            <MetricCard label="Trial interaction A" value={trialA.toFixed(2)} detail="browser-only parameter" tone="blue" />
            <MetricCard label="Calibration AARD" value={`${aard(calibrationRows).toFixed(2)}%`} detail="4 invented points" tone="green" />
            <MetricCard label="Holdout AARD" value={`${aard(holdoutRows).toFixed(2)}%`} detail="2 invented points" tone="amber" />
            <MetricCard label="All-point log RMSE" value={logRmse(validationRows).toFixed(4)} detail="log₁₀ mole fraction" />
          </section>
          <div className={styles.validationGrid}>
            <section className={styles.validationChartCard}><div className={styles.panelHeading}><div><span>SPLIT-AWARE TRACE</span><h3>Prediction curve and invented observations</h3></div><div className={styles.pointLegend}><span data-point="calibration">Calibration</span><span data-point="holdout">Holdout</span></div></div><ValidationChart rows={validationRows} /></section>
            <section className={styles.validationTableCard}><div className={styles.panelHeading}><div><span>RECONCILIATION TABLE</span><h3>Every metric has a row</h3></div><strong>6 SYNTHETIC</strong></div><div className={styles.tableScroll} role="region" aria-label="Synthetic calibration and holdout values" tabIndex={0}><table><thead><tr><th>T / K</th><th>Split</th><th>Observed xQ</th><th>Predicted xQ</th><th>Abs. rel.</th></tr></thead><tbody>{validationRows.map((row) => <tr key={row.temperature}><td>{row.temperature}</td><td><span data-split={row.split}>{row.split}</span></td><td>{formatScientific(row.observed, 4)}</td><td>{formatScientific(row.predicted, 4)}</td><td>{(Math.abs((row.predicted - row.observed) / row.observed) * 100).toFixed(2)}%</td></tr>)}</tbody></table></div><p>Grid fitting minimises calibration AARD only. Holdout rows never enter the objective.</p></section>
          </div>
        </div>
      ) : null}

      {view === "evidence" ? (
        <div className={styles.evidenceView}>
          <section className={styles.evidenceHero}><div><span>PROVENANCE MAP</span><h3>What the workflow demonstrates—and what it cannot prove</h3><p>The private local repository establishes workflow shape. Public Clapeyron.jl establishes the open thermodynamic engine. The browser port publishes only independently authored synthetic calculations.</p></div><strong>STRICT SEPARATION</strong></section>
          <section className={styles.ledgerGrid}>
            <article data-tone="audited"><span>AUDITED LOCAL WORKFLOW</span><h3>Structure only</h3><ul><li>Generic template defines mole-fraction ↔ mg/g-solvent transforms.</li><li>Template notebooks invoke CompositeModel, SolidHfus and sle_solubility.</li><li>Parameter estimation and error comparison appear as workflow stages.</li><li>Private repository has no root licence or Manifest pin.</li></ul></article>
            <article data-tone="open"><span>PUBLIC OPEN ENGINE</span><h3>MIT Clapeyron.jl</h3><ul><li>SLE objective balances liquid and solid chemical potentials.</li><li>Solubility unknown is solved in log₁₀ composition space.</li><li>SolidHfus supplies Tm, ΔHfus and optional CpSL.</li><li>Margules supplies an excess-Gibbs activity model.</li></ul></article>
            <article data-tone="adapted"><span>BROWSER ADAPTATION</span><h3>Inspectable simplification</h3><ul><li>Invented Compound Q and Solvent L only.</li><li>Symmetric Margules A with CpSL fixed to zero.</li><li>Safeguarded Newton step with bisection fallback.</li><li>Deterministic synthetic calibration/holdout exercise.</li></ul></article>
            <article data-tone="excluded"><span>EXCLUDED / UNSUPPORTED</span><h3>No performance claim</h3><ul><li>No molecule, experimental table or fitted parameter.</li><li>No client, employer, job application or personal artifact.</li><li>No polymorph, uncertainty or pressure validation.</li><li>No claim of predictive accuracy or reduced experiments.</li></ul></article>
          </section>
          <div className={styles.evidenceLayout}>
            <section className={styles.sourceMatrix}><div className={styles.panelHeading}><div><span>EVIDENCE MATRIX</span><h3>Claim status by layer</h3></div><strong>8 CHECKS</strong></div><div className={styles.tableScroll} role="region" aria-label="Solubility workflow evidence matrix" tabIndex={0}><table><thead><tr><th>Capability</th><th>Evidence boundary</th><th>Status</th></tr></thead><tbody>
              <tr><td>Mole ↔ mg/g solvent conversion</td><td>Generic local helper structure</td><td><span data-status="audited">AUDITED</span></td></tr>
              <tr><td>Solid–liquid chemical-potential objective</td><td>Pinned public Clapeyron solver</td><td><span data-status="open">OPEN</span></td></tr>
              <tr><td>Fusion relation with CpSL = 0</td><td>Pinned public SolidHfus model</td><td><span data-status="open">OPEN</span></td></tr>
              <tr><td>Symmetric Margules activity correction</td><td>Browser simplification of public GE model</td><td><span data-status="adapted">ADAPTED</span></td></tr>
              <tr><td>Safeguarded log-space solver</td><td>Browser implementation</td><td><span data-status="adapted">ADAPTED</span></td></tr>
              <tr><td>Synthetic calibration/holdout split</td><td>Browser-generated exercise</td><td><span data-status="synthetic">SYNTHETIC</span></td></tr>
              <tr><td>Compound-specific parameterisation</td><td>Not published or inspected for this demo</td><td><span data-status="excluded">EXCLUDED</span></td></tr>
              <tr><td>Experimental predictive validation</td><td>No safe public evidence</td><td><span data-status="unsupported">UNSUPPORTED</span></td></tr>
            </tbody></table></div></section>
            <section className={styles.sourceLinks}><div className={styles.panelHeading}><div><span>PINNED OPEN SOURCES</span><h3>Inspect the equations</h3></div><strong>MIT</strong></div><a href={SLE_SOURCE} target="_blank" rel="noreferrer"><span>01</span><div><strong>SLE solubility solver</strong><small>log₁₀ unknown · μliquid − μsolid objective</small></div><em>↗</em></a><a href={SOLID_SOURCE} target="_blank" rel="noreferrer"><span>02</span><div><strong>SolidHfus model</strong><small>Tm · ΔHfus · optional CpSL</small></div><em>↗</em></a><a href={MARGULES_SOURCE} target="_blank" rel="noreferrer"><span>03</span><div><strong>Margules activity model</strong><small>binary excess Gibbs energy</small></div><em>↗</em></a><a href={CLAPEYRON_LICENSE} target="_blank" rel="noreferrer"><span>04</span><div><strong>MIT licence</strong><small>© 2020 Hon Wa Yew and Pierre Walker</small></div><em>↗</em></a><p>The local Clapeyron.jl-Dev repository is private and has no root licence, so no local repository link or reuse grant is offered.</p></section>
          </div>
        </div>
      ) : null}
    </DemoWindow>
  );
}

export default DrugSolubilityStudio;
