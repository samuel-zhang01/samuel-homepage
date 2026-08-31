"use client";

/*
PC-SAFT residual equations and universal correlation coefficients are
reimplemented from Clapeyron.jl, audited at commit
3c71bfa917a5bfc37bf01fef8f5adbcbddbf437a.

MIT License
Copyright (c) 2020 Hon Wa Yew and Pierre Walker

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import { useId, useMemo, useState, type ReactNode } from "react";
import { DemoWindow } from "./DemoChrome";
import styles from "./ThermodynamicsStudio.module.css";

type ComponentParameters = {
  m: number;
  sigma: number;
  epsilon: number;
};

type BinaryParameters = {
  A: ComponentParameters;
  B: ComponentParameters;
};

type ResidualResult = {
  dA: number;
  dB: number;
  sigmaAB: number;
  epsilonAB: number;
  mBar: number;
  eta: number;
  aHardChain: number;
  aDispersion: number;
  aResidual: number;
};

type StateResult = ResidualResult & {
  z: number;
  pressureMPa: number;
  idealPressureMPa: number;
};

const CLAPEYRON_PC_SAFT_SOURCE =
  "https://github.com/ClapeyronThermo/Clapeyron.jl/blob/3c71bfa917a5bfc37bf01fef8f5adbcbddbf437a/src/models/SAFT/PCSAFT/PCSAFT.jl";
const CLAPEYRON_SAFT_EQUATIONS =
  "https://github.com/ClapeyronThermo/Clapeyron.jl/blob/3c71bfa917a5bfc37bf01fef8f5adbcbddbf437a/src/models/SAFT/equations.jl";
const CLAPEYRON_EOS_FUNCTIONS =
  "https://github.com/ClapeyronThermo/Clapeyron.jl/blob/3c71bfa917a5bfc37bf01fef8f5adbcbddbf437a/src/modules/eosfunctions/EoSFunctions.jl";
const CLAPEYRON_LICENSE =
  "https://github.com/ClapeyronThermo/Clapeyron.jl/blob/3c71bfa917a5bfc37bf01fef8f5adbcbddbf437a/LICENSE.md";
const AVOGADRO = 6.02214076e23;
const GAS_CONSTANT = 8.314462618;

const correlationOne = [
  [0.9105631445, -0.3084016918, -0.0906148351],
  [0.6361281449, 0.1860531159, 0.4527842806],
  [2.6861347891, -2.5030047259, 0.5962700728],
  [-26.547362491, 21.419793629, -1.7241829131],
  [97.759208784, -65.25588533, -4.1302112531],
  [-159.59154087, 83.318680481, 13.77663187],
  [91.297774084, -33.74692293, -8.6728470368],
] as const;

const correlationTwo = [
  [0.7240946941, -0.5755498075, 0.0976883116],
  [2.2382791861, 0.6995095521, -0.2557574982],
  [-4.0025849485, 3.892567339, -9.155856153],
  [-21.003576815, -17.215471648, 20.642075974],
  [26.855641363, 192.67226447, -38.804430052],
  [206.55133841, -161.82646165, 93.626774077],
  [-355.60235612, -165.20769346, -29.666905585],
] as const;

const initialParameters: BinaryParameters = {
  A: { m: 1.6, sigma: 3.2, epsilon: 170 },
  B: { m: 2.8, sigma: 3.8, epsilon: 240 },
};

function effectiveDiameter(component: ComponentParameters, temperature: number) {
  return component.sigma * (1 - 0.12 * Math.exp((-3 * component.epsilon) / temperature));
}

function polynomialIntegral(
  coefficients: ReadonlyArray<readonly [number, number, number]>,
  eta: number,
  mBar: number,
) {
  const mOne = (mBar - 1) / mBar;
  const mTwo = (mOne * (mBar - 2)) / mBar;
  let etaPower = 1;
  let result = 0;
  for (const [base, first, second] of coefficients) {
    result += (base + mOne * first + mTwo * second) * etaPower;
    etaPower *= eta;
  }
  return result;
}

function residualHelmholtz(
  molarDensity: number,
  temperature: number,
  xA: number,
  interaction: number,
  parameters: BinaryParameters,
): ResidualResult {
  const fractions = [xA, 1 - xA] as const;
  const components = [parameters.A, parameters.B] as const;
  const diameters = components.map((component) => effectiveDiameter(component, temperature));
  const numberDensity = (molarDensity * AVOGADRO) / 1e30;
  const zeta = [0, 1, 2, 3].map(
    (order) =>
      (Math.PI / 6) *
      numberDensity *
      fractions.reduce(
        (sum, fraction, index) =>
          sum + fraction * components[index].m * diameters[index] ** order,
        0,
      ),
  );
  const [zetaZero, zetaOne, zetaTwo, eta] = zeta;
  const mBar = fractions.reduce(
    (sum, fraction, index) => sum + fraction * components[index].m,
    0,
  );
  const freeVolume = 1 - eta;

  const hardSphere =
    (3 * zetaOne * zetaTwo) / freeVolume +
    zetaTwo ** 3 / (eta * freeVolume ** 2) +
    (zetaTwo ** 3 / eta ** 2 - zetaZero) * Math.log(freeVolume);
  const aHardSphere = hardSphere / zetaZero;

  let chainCorrection = 0;
  for (let index = 0; index < components.length; index += 1) {
    const contactDiameter = diameters[index] / 2;
    const radialDistribution =
      1 / freeVolume +
      (3 * contactDiameter * zetaTwo) / freeVolume ** 2 +
      (2 * contactDiameter ** 2 * zetaTwo ** 2) / freeVolume ** 3;
    chainCorrection +=
      fractions[index] * (components[index].m - 1) * Math.log(radialDistribution);
  }
  const aHardChain = mBar * aHardSphere - chainCorrection;

  let firstMoment = 0;
  let secondMoment = 0;
  for (let row = 0; row < components.length; row += 1) {
    for (let column = 0; column < components.length; column += 1) {
      const sigmaMixed = (components[row].sigma + components[column].sigma) / 2;
      const epsilonMixed =
        Math.sqrt(components[row].epsilon * components[column].epsilon) *
        (row === column ? 1 : 1 - interaction);
      const constant =
        fractions[row] *
        fractions[column] *
        components[row].m *
        components[column].m *
        sigmaMixed ** 3;
      const reducedEnergy = epsilonMixed / temperature;
      firstMoment += constant * reducedEnergy;
      secondMoment += constant * reducedEnergy ** 2;
    }
  }

  const cOne =
    1 /
    (1 +
      (mBar * (8 * eta - 2 * eta ** 2)) / freeVolume ** 4 +
      ((1 - mBar) *
        (20 * eta - 27 * eta ** 2 + 12 * eta ** 3 - 2 * eta ** 4)) /
        (freeVolume * (2 - eta)) ** 2);
  const integralOne = polynomialIntegral(correlationOne, eta, mBar);
  const integralTwo = polynomialIntegral(correlationTwo, eta, mBar);
  const aDispersion =
    -2 * Math.PI * numberDensity * integralOne * firstMoment -
    mBar * Math.PI * numberDensity * cOne * integralTwo * secondMoment;
  const sigmaAB = (parameters.A.sigma + parameters.B.sigma) / 2;
  const epsilonAB =
    Math.sqrt(parameters.A.epsilon * parameters.B.epsilon) * (1 - interaction);

  return {
    dA: diameters[0],
    dB: diameters[1],
    sigmaAB,
    epsilonAB,
    mBar,
    eta,
    aHardChain,
    aDispersion,
    aResidual: aHardChain + aDispersion,
  };
}

function evaluateState(
  molarDensity: number,
  temperature: number,
  xA: number,
  interaction: number,
  parameters: BinaryParameters,
): StateResult {
  const residual = residualHelmholtz(
    molarDensity,
    temperature,
    xA,
    interaction,
    parameters,
  );
  const step = Math.max(0.05, molarDensity * 1e-4);
  const lowerDensity = Math.max(0.001, molarDensity - step);
  const upperDensity = molarDensity + step;
  const derivative =
    (residualHelmholtz(upperDensity, temperature, xA, interaction, parameters)
      .aResidual -
      residualHelmholtz(lowerDensity, temperature, xA, interaction, parameters)
        .aResidual) /
    (upperDensity - lowerDensity);
  const z = 1 + molarDensity * derivative;
  const idealPressureMPa =
    (molarDensity * GAS_CONSTANT * temperature) / 1e6;

  return {
    ...residual,
    z,
    pressureMPa: idealPressureMPa * z,
    idealPressureMPa,
  };
}

function formatSigned(value: number, digits = 3) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(digits)}`;
}

function formatPressure(value: number) {
  if (Math.abs(value) >= 100) return value.toFixed(1);
  return value.toFixed(3);
}

function FormulaCard({
  step,
  title,
  left,
  right,
  note,
}: {
  step: string;
  title: string;
  left: ReactNode;
  right: ReactNode;
  note: string;
}) {
  return (
    <div className={styles.formulaCard}>
      <span>{step} · {title}</span>
      <div className={styles.formula} aria-label={`${title}: ${note}`}>
        <span className={styles.formulaLeft}>{left}</span>
        <b aria-hidden="true">=</b>
        <span className={styles.formulaRight}>{right}</span>
      </div>
      <p>{note}</p>
    </div>
  );
}

function IsothermChart({
  curve,
  selectedDensity,
  current,
}: {
  curve: Array<{ density: number; pressure: number; ideal: number; eta: number }>;
  selectedDensity: number;
  current: StateResult;
}) {
  const rawId = useId();
  const id = rawId.replace(/:/g, "");
  const plot = { left: 58, top: 32, width: 610, height: 268 };
  const values = curve.flatMap((point) => [point.pressure, point.ideal]);
  const rawMin = Math.min(0, ...values);
  const rawMax = Math.max(...values);
  const padding = Math.max(1, (rawMax - rawMin) * 0.08);
  const yMin = rawMin - padding;
  const yMax = rawMax + padding;
  const xMin = curve[0]?.density ?? 100;
  const xMax = curve.at(-1)?.density ?? 9000;
  const xScale = (density: number) =>
    plot.left + ((density - xMin) / (xMax - xMin)) * plot.width;
  const yScale = (pressure: number) =>
    plot.top + plot.height - ((pressure - yMin) / (yMax - yMin)) * plot.height;
  const modelPath = curve
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"}${xScale(point.density).toFixed(2)},${yScale(point.pressure).toFixed(2)}`,
    )
    .join(" ");
  const idealPath = curve
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"}${xScale(point.density).toFixed(2)},${yScale(point.ideal).toFixed(2)}`,
    )
    .join(" ");
  const xTicks = [100, 2000, 4000, 6000, 8000, 9000];
  const yTicks = Array.from(
    { length: 5 },
    (_, index) => yMin + (index / 4) * (yMax - yMin),
  );

  return (
    <svg
      className={styles.chart}
      viewBox="0 0 700 350"
      role="img"
      aria-labelledby={`${id}-title ${id}-description`}
    >
      <title id={`${id}-title`}>Synthetic PC-SAFT pressure-density isotherm</title>
      <desc id={`${id}-description`}>
        Pressure versus molar density for a synthetic non-associating binary mixture.
        The selected state is {formatPressure(current.pressureMPa)} megapascals at {selectedDensity.toLocaleString("en-GB")} moles per cubic metre.
      </desc>
      <defs>
        <clipPath id={`${id}-clip`}>
          <rect x={plot.left} y={plot.top} width={plot.width} height={plot.height} />
        </clipPath>
        <pattern id={`${id}-hatch`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" x2="0" y1="0" y2="6" stroke="#a13156" strokeWidth="2" opacity="0.13" />
        </pattern>
      </defs>
      <rect width="700" height="350" fill="#f7f7f2" />
      <rect x={plot.left} y={plot.top} width={plot.width} height={plot.height} fill="#fff" stroke="#252622" />
      <rect
        x={plot.left}
        y={yScale(0)}
        width={plot.width}
        height={Math.max(0, plot.top + plot.height - yScale(0))}
        fill={`url(#${id}-hatch)`}
        clipPath={`url(#${id}-clip)`}
      />
      {yTicks.map((tick) => (
        <g key={tick}>
          <line x1={plot.left} x2={plot.left + plot.width} y1={yScale(tick)} y2={yScale(tick)} className={styles.gridLine} />
          <text x={plot.left - 8} y={yScale(tick) + 3} textAnchor="end" className={styles.tickLabel}>{tick.toFixed(0)}</text>
        </g>
      ))}
      {xTicks.map((tick) => (
        <g key={tick}>
          <line x1={xScale(tick)} x2={xScale(tick)} y1={plot.top} y2={plot.top + plot.height} className={styles.gridLine} />
          <text x={xScale(tick)} y={plot.top + plot.height + 17} textAnchor="middle" className={styles.tickLabel}>{(tick / 1000).toFixed(1)}</text>
        </g>
      ))}
      <line x1={plot.left} x2={plot.left + plot.width} y1={yScale(0)} y2={yScale(0)} stroke="#922d4d" strokeWidth="1" />
      <g clipPath={`url(#${id}-clip)`}>
        <path d={idealPath} fill="none" stroke="#888983" strokeWidth="1.5" strokeDasharray="5 4" />
        <path d={modelPath} fill="none" stroke="#0c706d" strokeWidth="2.6" />
        <line x1={xScale(selectedDensity)} x2={xScale(selectedDensity)} y1={plot.top} y2={plot.top + plot.height} stroke="#192968" strokeDasharray="3 3" />
        <circle cx={xScale(selectedDensity)} cy={yScale(current.pressureMPa)} r="5" fill="#f4d55d" stroke="#192968" strokeWidth="2" />
      </g>
      <g transform="translate(78 48)">
        <rect width="164" height="47" fill="#fff" stroke="#777872" />
        <line x1="10" x2="36" y1="15" y2="15" stroke="#0c706d" strokeWidth="2.6" />
        <text x="43" y="18" className={styles.legendText}>PC-SAFT residual core</text>
        <line x1="10" x2="36" y1="33" y2="33" stroke="#888983" strokeWidth="1.5" strokeDasharray="5 4" />
        <text x="43" y="36" className={styles.legendText}>ideal gas reference</text>
      </g>
      <text x="362" y="338" textAnchor="middle" className={styles.axisLabel}>molar density / kmol m⁻³</text>
      <text x="15" y="168" textAnchor="middle" transform="rotate(-90 15 168)" className={styles.axisLabel}>pressure / MPa</text>
    </svg>
  );
}

function ParameterSlider({
  label,
  unit,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className={styles.parameterSlider}>
      <span><b>{label}</b><output>{value.toFixed(step < 1 ? 2 : 0)} {unit}</output></span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

export function ThermodynamicsStudio() {
  const [temperature, setTemperature] = useState(330);
  const [density, setDensity] = useState(3000);
  const [xA, setXA] = useState(0.5);
  const [interaction, setInteraction] = useState(0.02);
  const [parameters, setParameters] = useState<BinaryParameters>(initialParameters);
  const [selectedComponent, setSelectedComponent] = useState<"A" | "B">("A");

  const current = useMemo(
    () => evaluateState(density, temperature, xA, interaction, parameters),
    [density, temperature, xA, interaction, parameters],
  );
  const noInteraction = useMemo(
    () => evaluateState(density, temperature, xA, 0, parameters),
    [density, temperature, xA, parameters],
  );
  const curve = useMemo(
    () =>
      Array.from({ length: 90 }, (_, index) => {
        const pointDensity = 100 + (index / 89) * 8900;
        const state = evaluateState(
          pointDensity,
          temperature,
          xA,
          interaction,
          parameters,
        );
        return {
          density: pointDensity,
          pressure: state.pressureMPa,
          ideal: state.idealPressureMPa,
          eta: state.eta,
        };
      }),
    [temperature, xA, interaction, parameters],
  );
  const selected = parameters[selectedComponent];
  const pressureDelta = current.pressureMPa - noInteraction.pressureMPa;
  const derivative = (current.z - 1) / density;
  const regime =
    current.eta >= 0.5
      ? { label: "OUTSIDE DEMO RANGE", tone: "alert" as const, copy: "Packing fraction reached the guarded limit." }
      : current.z <= 0
        ? { label: "NEGATIVE-P BRANCH", tone: "warn" as const, copy: "Non-positive Z marks a negative-pressure homogeneous branch; equilibrium requires a phase solver." }
        : { label: "STATE EVALUATED", tone: "safe" as const, copy: "Single homogeneous-state equation evaluation only." };
  const sampleIndices = [0, Math.round(((density - 100) / 8900) * 89), 89];
  const samples = sampleIndices.map((index) => curve[Math.max(0, Math.min(89, index))]);

  function updateSelected(key: keyof ComponentParameters, value: number) {
    setParameters((previous) => ({
      ...previous,
      [selectedComponent]: { ...previous[selectedComponent], [key]: value },
    }));
  }

  function reset() {
    setTemperature(330);
    setDensity(3000);
    setXA(0.5);
    setInteraction(0.02);
    setParameters(initialParameters);
    setSelectedComponent("A");
  }

  return (
    <DemoWindow
      appName="PC-SAFT WORKBENCH · SAFE EXHIBIT"
      title="Synthetic Thermodynamics Studio"
      status="PUBLIC EQUATIONS · SYNTHETIC PARAMETERS"
      statusTone="safe"
      className={styles.studio}
      footer={
        <>
          <span>NON-ASSOCIATING BINARY · EDUCATIONAL CALCULATION</span>
          <span>NO DRUG · CLIENT · APPLICATION · EXPERIMENT DATA</span>
        </>
      }
    >
      <div className={styles.boundaryBanner} role="note">
        <span>SAFE SCIENTIFIC CORE</span>
        <p>
          Invented Fluid A/B parameters exercise the open PC-SAFT residual equations. Nothing is read
          from compound-solubility folders, job applications, client material or experimental tables.
        </p>
        <strong>NOT A PROPERTY PREDICTION</strong>
      </div>

      <section className={styles.workbench} aria-label="Interactive PC-SAFT parameter sensitivity workbench">
        <aside className={styles.controlRack}>
          <div className={styles.panelTitle}><span>01</span><strong>STATE VECTOR</strong></div>
          <ParameterSlider label="Temperature" unit="K" value={temperature} min={270} max={450} step={1} onChange={setTemperature} />
          <ParameterSlider label="Molar density" unit="mol m⁻³" value={density} min={100} max={9000} step={100} onChange={setDensity} />
          <ParameterSlider label="Mole fraction xA" unit="" value={xA} min={0.05} max={0.95} step={0.01} onChange={setXA} />
          <ParameterSlider label="Binary kAB" unit="" value={interaction} min={-0.1} max={0.15} step={0.01} onChange={setInteraction} />

          <div className={styles.componentTabs} aria-label="Synthetic component parameter editor">
            <button type="button" aria-pressed={selectedComponent === "A"} onClick={() => setSelectedComponent("A")}>Fluid A</button>
            <button type="button" aria-pressed={selectedComponent === "B"} onClick={() => setSelectedComponent("B")}>Fluid B</button>
          </div>
          <div className={styles.componentEditor}>
            <span className={styles.microLabel}>SYNTHETIC {selectedComponent} PARAMETERS</span>
            <ParameterSlider
              label="Segments m"
              unit=""
              value={selected.m}
              min={selectedComponent === "A" ? 1.2 : 2}
              max={selectedComponent === "A" ? 2.4 : 3}
              step={0.05}
              onChange={(value) => updateSelected("m", value)}
            />
            <ParameterSlider
              label="Diameter σ"
              unit="Å"
              value={selected.sigma}
              min={selectedComponent === "A" ? 2.9 : 3.3}
              max={selectedComponent === "A" ? 3.6 : 3.8}
              step={0.01}
              onChange={(value) => updateSelected("sigma", value)}
            />
            <ParameterSlider
              label="Energy ε/kB"
              unit="K"
              value={selected.epsilon}
              min={selectedComponent === "A" ? 120 : 180}
              max={selectedComponent === "A" ? 250 : 320}
              step={1}
              onChange={(value) => updateSelected("epsilon", value)}
            />
          </div>
          <button className={styles.resetButton} type="button" onClick={reset}>Reset synthetic system</button>
        </aside>

        <div className={styles.analysisPanel}>
          <div className={styles.panelTitle}><span>02</span><strong>PRESSURE–DENSITY ISOTHERM</strong><em>DETERMINISTIC SVG</em></div>
          <IsothermChart curve={curve} selectedDensity={density} current={current} />
          <div className={styles.chartNote}>
            <span className={styles[regime.tone]}>{regime.label}</span>
            <p>{regime.copy} Hatched negative-pressure regions are equation branches, not physical equilibrium states.</p>
          </div>
          <div className={styles.metricGrid} aria-live="polite">
            <div><span>PRESSURE</span><strong>{formatPressure(current.pressureMPa)} MPa</strong><small>p = ρRTZ</small></div>
            <div><span>COMPRESSIBILITY</span><strong>{current.z.toFixed(4)}</strong><small>Z = 1 + ρ ∂aʳᵉˢ/∂ρ</small></div>
            <div><span>PACKING FRACTION</span><strong>{current.eta.toFixed(4)}</strong><small>η = ζ₃</small></div>
            <div><span>RESIDUAL HELMHOLTZ</span><strong>{formatSigned(current.aResidual, 4)}</strong><small>Aʳᵉˢ / (nRT)</small></div>
          </div>
        </div>
      </section>

      <section className={styles.calculationTape} aria-label="Visible PC-SAFT calculations">
        <div className={styles.tapeHeading}>
          <span>03</span>
          <div><strong>CALCULATION TAPE</strong><small>all values update from the synthetic controls</small></div>
        </div>
        <div className={styles.tapeSteps}>
          <div><span>EFFECTIVE DIAMETERS</span><code>dA = {current.dA.toFixed(4)} Å</code><code>dB = {current.dB.toFixed(4)} Å</code></div>
          <b aria-hidden="true">→</b>
          <div><span>LORENTZ–BERTHELOT</span><code>σAB = {current.sigmaAB.toFixed(4)} Å</code><code>εAB/kB = {current.epsilonAB.toFixed(2)} K</code></div>
          <b aria-hidden="true">→</b>
          <div><span>HELMHOLTZ TERMS</span><code>aʰᶜ = {formatSigned(current.aHardChain, 4)}</code><code>aᵈⁱˢᵖ = {formatSigned(current.aDispersion, 4)}</code></div>
          <b aria-hidden="true">→</b>
          <div><span>DENSITY DERIVATIVE</span><code>∂aʳᵉˢ/∂ρ = {derivative.toExponential(3)}</code><code>Z = {current.z.toFixed(4)}</code></div>
        </div>
      </section>

      <div className={styles.detailGrid}>
        <section className={styles.sensitivityPanel}>
          <div className={styles.sectionHeading}>
            <div><span>PARAMETER SENSITIVITY</span><h3>What does kAB change?</h3></div>
            <strong>{formatSigned(pressureDelta, 3)} MPa</strong>
          </div>
          <div className={styles.mixingEquation}>
            <span>εAB/kB</span>
            <b>=</b>
            <span>√({parameters.A.epsilon.toFixed(0)} × {parameters.B.epsilon.toFixed(0)})</span>
            <b>×</b>
            <span>(1 − {interaction.toFixed(2)})</span>
            <b>=</b>
            <strong>{current.epsilonAB.toFixed(2)} K</strong>
          </div>
          <div className={styles.comparisonRows}>
            <div><span>kAB = 0 reference</span><i><b style={{ width: `${Math.min(100, Math.max(0, (noInteraction.epsilonAB / 320) * 100))}%` }} /></i><strong>{noInteraction.epsilonAB.toFixed(2)} K</strong></div>
            <div><span>selected kAB</span><i><b style={{ width: `${Math.min(100, Math.max(0, (current.epsilonAB / 320) * 100))}%` }} /></i><strong>{current.epsilonAB.toFixed(2)} K</strong></div>
          </div>
          <p>
            Positive kAB weakens the unlike dispersion energy under the combining rule; negative kAB
            strengthens it. The pressure delta compares the selected state with kAB = 0, holding every
            other synthetic input fixed.
          </p>
        </section>

        <section className={styles.ledgerPanel}>
          <div className={styles.sectionHeading}>
            <div><span>ACCESSIBLE CURVE LEDGER</span><h3>Three isotherm states</h3></div>
            <strong>T = {temperature} K</strong>
          </div>
          <div
            className={styles.tableWrap}
            role="region"
            aria-label="Three representative synthetic isotherm states"
            tabIndex={0}
          >
            <table>
              <caption>Synthetic model evaluations, not experimental observations</caption>
              <thead><tr><th scope="col">State</th><th scope="col">ρ / mol m⁻³</th><th scope="col">p / MPa</th><th scope="col">η</th></tr></thead>
              <tbody>
                {samples.map((sample, index) => (
                  <tr key={`${sample.density}-${index}`}>
                    <th scope="row">{index === 0 ? "Low density" : index === 1 ? "Selected vicinity" : "High density"}</th>
                    <td>{sample.density.toFixed(0)}</td>
                    <td>{formatPressure(sample.pressure)}</td>
                    <td>{sample.eta.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>Negative pressure or non-positive Z is not interpreted as phase coexistence. This exhibit does not solve coexistence, flash, bubble, dew or critical conditions.</p>
        </section>
      </div>

      <section className={styles.equationPanel}>
        <div className={styles.sectionHeading}>
          <div><span>PUBLIC EQUATION IMPLEMENTATION</span><h3>Equations evaluated in the browser</h3></div>
          <a href={CLAPEYRON_PC_SAFT_SOURCE} target="_blank" rel="noreferrer">Open pinned PC-SAFT source ↗</a>
        </div>
        <div className={styles.equationGrid}>
          <FormulaCard
            step="01"
            title="EFFECTIVE SIZE"
            left={<><var>d</var><sub>i</sub></>}
            right={<><var>σ</var><sub>i</sub>[1 − 0.12 exp(−3<var>ε</var><sub>i</sub>/<var>T</var>)]</>}
            note="Temperature-dependent Chen–Kreglewski diameter."
          />
          <FormulaCard
            step="02"
            title="PACKING MOMENTS"
            left={<><var>ζ</var><sub>n</sub></>}
            right={<>π<var>N</var><sub>A</sub><var>ρ</var>·10<sup>−30</sup>/6 · Σ<sub>i</sub> <var>x</var><sub>i</sub><var>m</var><sub>i</sub><var>d</var><sub>i</sub><sup>n</sup></>}
            note="ρ is in mol m⁻³ and d is in Å, so 10⁻³⁰ converts the segment-volume factor to m³. The third moment ζ₃ is the packing fraction η."
          />
          <FormulaCard
            step="03"
            title="RESIDUAL ENERGY"
            left={<><var>a</var><sup>res</sup></>}
            right={<><var>a</var><sup>hc</sup> + <var>a</var><sup>disp</sup> + 0<sup>assoc</sup></>}
            note="Association is exactly zero for this synthetic non-associating system."
          />
          <FormulaCard
            step="04"
            title="PRESSURE"
            left={<var>Z</var>}
            right={<>1 + <var>ρ</var> · ∂<var>a</var><sup>res</sup>/∂<var>ρ</var></>}
            note="A centred finite difference exposes the density derivative; p = ρRTZ."
          />
        </div>
        <dl className={styles.symbolLedger}>
          <div><dt>ρ</dt><dd>molar density</dd></div>
          <div><dt>xᵢ</dt><dd>mole fraction</dd></div>
          <div><dt>mᵢ</dt><dd>chain segments</dd></div>
          <div><dt>dᵢ</dt><dd>effective diameter</dd></div>
          <div><dt>aʳᵉˢ</dt><dd>reduced residual Helmholtz energy</dd></div>
          <div><dt>Z</dt><dd>compressibility factor</dd></div>
        </dl>
      </section>

      <section className={styles.boundaryLedger}>
        <div>
          <span className={styles.sourceTag}>LOCAL EVIDENCE</span>
          <strong>Generic Julia notebooks</strong>
          <p>The safe folders call PCSAFT, saturation pressure, bubble/dew pressure, mixture critical points, Helmholtz energy and related public Clapeyron APIs. No Manifest pins the historical package version.</p>
        </div>
        <div>
          <span className={styles.engineTag}>OPEN ENGINE</span>
          <strong>Clapeyron.jl residual core</strong>
          <p>Equations and universal coefficients are reimplemented from the pinned MIT <a href={CLAPEYRON_PC_SAFT_SOURCE} target="_blank" rel="noreferrer">PC-SAFT core ↗</a>, <a href={CLAPEYRON_SAFT_EQUATIONS} target="_blank" rel="noreferrer">shared SAFT equations ↗</a> and <a href={CLAPEYRON_EOS_FUNCTIONS} target="_blank" rel="noreferrer">reduced-energy interface ↗</a>, © 2020 Hon Wa Yew and Pierre Walker. <a href={CLAPEYRON_LICENSE} target="_blank" rel="noreferrer">Licence ↗</a></p>
        </div>
        <div>
          <span className={styles.adaptationTag}>ADAPTATION</span>
          <strong>Browser sensitivity layer</strong>
          <p>Invented parameters, guarded ranges, numerical pressure derivative, accessible chart and table are newly authored for this portfolio.</p>
        </div>
        <div>
          <span className={styles.excludedTag}>EXCLUDED</span>
          <strong>Private and compound-specific work</strong>
          <p>No job application, CV, client/pharma document, compound parameter, solubility notebook, experimental value, archive or personal path is read or shipped.</p>
        </div>
      </section>
    </DemoWindow>
  );
}

export default ThermodynamicsStudio;
