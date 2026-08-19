"use client";

import { useId, useMemo, useState, type CSSProperties } from "react";

import { DemoWindow, MacButton } from "./DemoChrome";
import styles from "./DecisionDemos.module.css";

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

const pounds = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

function SourceNote({
  title,
  children,
  tone = "blue",
}: {
  title: string;
  children: React.ReactNode;
  tone?: "blue" | "amber" | "green";
}) {
  return (
    <aside className={`${styles.sourceNote} ${tone === "blue" ? "" : styles[tone]}`} role="note">
      <span className={styles.sourceIcon} aria-hidden="true">
        {tone === "amber" ? "!" : tone === "green" ? "✓" : "i"}
      </span>
      <div>
        <strong>{title}</strong>
        <p>{children}</p>
      </div>
    </aside>
  );
}

function RangeField({
  label,
  valueLabel,
  help,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  valueLabel: string;
  help?: string;
}) {
  const helpId = useId();
  return (
    <label className={styles.rangeField}>
      <span className={styles.rangeHeading}>
        <strong>{label}</strong>
        <output>{valueLabel}</output>
      </span>
      <input {...props} type="range" aria-describedby={help ? helpId : undefined} />
      {help ? <small id={helpId}>{help}</small> : null}
    </label>
  );
}

const AIR_CONFIGURATIONS = [
  {
    id: "lean",
    name: "Lean monitor",
    cost: 2_500,
    rmse: 0.9211,
    sensors: ["C6H6(GT)"],
    metric: "5-fold CV RMSE",
  },
  {
    id: "balanced",
    name: "Balanced monitor",
    cost: 3_500,
    rmse: 0.8286,
    sensors: ["C6H6(GT)", "PT08.S1(CO)"],
    metric: "5-fold CV RMSE",
  },
  {
    id: "full",
    name: "Full research model",
    cost: 10_700,
    rmse: 0.3874,
    sensors: ["All 11 recorded predictors"],
    metric: "reported test RMSE",
  },
] as const;

export function AirQualityBudgetDemo() {
  const [budget, setBudget] = useState(3_500);
  const selected = AIR_CONFIGURATIONS.filter((configuration) => configuration.cost <= budget).at(-1) ??
    AIR_CONFIGURATIONS[0];
  const next = AIR_CONFIGURATIONS.find((configuration) => configuration.cost > budget);
  const chartWidth = 470;
  const chartHeight = 200;
  const x = (cost: number) => 48 + ((cost - 2_000) / 9_000) * 392;
  const y = (rmse: number) => 20 + ((1 - rmse) / 0.7) * 142;
  const cvPoints = AIR_CONFIGURATIONS.slice(0, 2)
    .map((configuration) => `${x(configuration.cost)},${y(configuration.rmse)}`)
    .join(" ");

  return (
    <DemoWindow
      appName="Monitor Planner"
      title="Air-quality sensor budget"
      status="COURSEWORK · HYPOTHETICAL"
      statusTone="safe"
      className={styles.window}
      footer={
        <>
          <span>7,674 cleaned observations</span>
          <span>No live sensor or procurement data</span>
        </>
      }
    >
      <SourceNote title="Historical coursework explorer">
        The three points reproduce reported modelling outputs. Prices are assignment assumptions—not
        supplier quotes—and the interface does not retrain a model.
      </SourceNote>

      <div className={styles.twoColumnLayout}>
        <section className={styles.controlPanel} aria-labelledby="air-controls-title">
          <div className={styles.panelTitle}>
            <span aria-hidden="true">01</span>
            <div>
              <p>DESIGN CONTROL</p>
              <h3 id="air-controls-title">Set a hardware ceiling</h3>
            </div>
          </div>

          <RangeField
            label="Available sensor budget"
            valueLabel={pounds.format(budget)}
            min={2_500}
            max={10_700}
            step={100}
            value={budget}
            onChange={(event) => setBudget(Number(event.target.value))}
            help="The planner selects the lowest-error reported configuration that fits this ceiling."
          />
          <div className={styles.rangeTicks} aria-hidden="true">
            <span>£2.5k</span>
            <span>£3.5k</span>
            <span>£10.7k</span>
          </div>

          <div className={styles.selectionCard} aria-live="polite">
            <span className={styles.selectionFlag}>BEST REPORTED FIT</span>
            <h4>{selected.name}</h4>
            <div className={styles.bigMetric}>
              <strong>{selected.rmse.toFixed(4)}</strong>
              <span>{selected.metric}</span>
            </div>
            <dl className={styles.compactFacts}>
              <div>
                <dt>Cost</dt>
                <dd>{pounds.format(selected.cost)}</dd>
              </div>
              <div>
                <dt>Headroom</dt>
                <dd>{pounds.format(budget - selected.cost)}</dd>
              </div>
            </dl>
            <div className={styles.sensorList} aria-label="Included signals">
              {selected.sensors.map((sensor) => (
                <span key={sensor}>✓ {sensor}</span>
              ))}
            </div>
            {next ? (
              <p className={styles.nextStep}>
                Add <strong>{pounds.format(next.cost - budget)}</strong> to unlock {next.name.toLowerCase()}.
              </p>
            ) : (
              <p className={styles.nextStep}>All reported predictors fit inside this ceiling.</p>
            )}
          </div>
        </section>

        <section className={styles.chartPanel} aria-labelledby="air-frontier-title">
          <div className={styles.chartHeading}>
            <div>
              <span>REPORTED SNAPSHOTS</span>
              <h3 id="air-frontier-title">Cost–accuracy frontier</h3>
            </div>
            <span className={styles.lowerLegend}>LOWER RMSE IS BETTER</span>
          </div>

          <div
            className={styles.svgFrame}
            role="region"
            tabIndex={0}
            aria-label="Scrollable cost–accuracy frontier chart"
          >
            <svg
              className={styles.frontierChart}
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              role="img"
              aria-label="Reported error falls from 0.9211 at 2500 pounds to 0.8286 at 3500 pounds. A methodologically separate full model reports 0.3874 at 10700 pounds."
            >
              <g className={styles.gridLines} aria-hidden="true">
                {[0.4, 0.6, 0.8, 1].map((tick) => (
                  <g key={tick}>
                    <line x1="48" x2="440" y1={y(tick)} y2={y(tick)} />
                    <text x="8" y={y(tick) + 3}>{tick.toFixed(1)}</text>
                  </g>
                ))}
                <line x1="48" x2="440" y1="162" y2="162" />
              </g>
              <polyline className={styles.frontierLine} points={cvPoints} />
              <line
                className={styles.caveatLine}
                x1={x(AIR_CONFIGURATIONS[1].cost)}
                y1={y(AIR_CONFIGURATIONS[1].rmse)}
                x2={x(AIR_CONFIGURATIONS[2].cost)}
                y2={y(AIR_CONFIGURATIONS[2].rmse)}
              />
              {AIR_CONFIGURATIONS.map((configuration) => {
                const active = configuration.id === selected.id;
                return (
                  <g key={configuration.id} className={active ? styles.activePoint : styles.chartPoint}>
                    <circle cx={x(configuration.cost)} cy={y(configuration.rmse)} r={active ? 8 : 6} />
                    <text x={x(configuration.cost)} y={y(configuration.rmse) - 12} textAnchor="middle">
                      {configuration.rmse.toFixed(configuration.id === "full" ? 3 : 4)}
                    </text>
                    <text x={x(configuration.cost)} y="181" textAnchor="middle">
                      £{(configuration.cost / 1_000).toFixed(1)}k
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className={styles.legendRow}>
            <span><i className={styles.solidKey} /> Same CV comparison</span>
            <span><i className={styles.dashedKey} /> Different evaluation result</span>
          </div>

          <SourceNote title="Methodology caveat" tone="amber">
            The £2,500 and £3,500 designs report five-fold cross-validation RMSE. The £10,700 point
            matches the full KRR-RBF test RMSE, so the dashed connection is context—not a controlled
            like-for-like frontier. Repeated nested validation would be needed for procurement.
          </SourceNote>
        </section>
      </div>
    </DemoWindow>
  );
}

function cyberRates(threshold: number) {
  const falsePositiveRate = clamp(0.257 * (1 - threshold ** 2.2), 0, 1);
  const truePositiveRate = clamp(1 - 0.005 * (threshold / 0.5) ** 6, 0.55, 1);
  return { falsePositiveRate, truePositiveRate };
}

function cyberMatrix(threshold: number) {
  const { falsePositiveRate, truePositiveRate } = cyberRates(threshold);
  const fp = Math.round(falsePositiveRate * 1_000);
  const tp = Math.round(truePositiveRate * 1_000);
  return { tn: 1_000 - fp, fp, fn: 1_000 - tp, tp };
}

function MatrixCell({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "good" | "bad";
}) {
  return (
    <div
      className={`${styles.matrixCell} ${tone === "good" ? "" : styles[tone]}`}
      style={{ "--heat": `${8 + (value / 1_000) * 32}%` } as CSSProperties}
    >
      <span>{label}</span>
      <strong>{value.toLocaleString("en-GB")}</strong>
      <small>{(value / 10).toFixed(1)}% of class</small>
    </div>
  );
}

export function CyberThresholdDemo() {
  const [thresholdPercent, setThresholdPercent] = useState(20);
  const [falseNegativeCost, setFalseNegativeCost] = useState(1_000_000);
  const [falsePositiveCost, setFalsePositiveCost] = useState(1_000);
  const threshold = thresholdPercent / 100;
  const matrix = cyberMatrix(threshold);
  const totalCost = matrix.fn * falseNegativeCost + matrix.fp * falsePositiveCost;
  const curve = useMemo(() => {
    return Array.from({ length: 50 }, (_, index) => {
      const pointThreshold = (index + 1) / 50;
      const pointMatrix = cyberMatrix(pointThreshold);
      return {
        threshold: pointThreshold,
        cost: pointMatrix.fn * falseNegativeCost + pointMatrix.fp * falsePositiveCost,
      };
    });
  }, [falseNegativeCost, falsePositiveCost]);
  const maximumCost = Math.max(...curve.map((point) => point.cost), 1);
  const pointX = (pointThreshold: number) => 42 + pointThreshold * 372;
  const pointY = (cost: number) => 18 + (1 - cost / maximumCost) * 112;
  const curvePoints = curve.map((point) => `${pointX(point.threshold)},${pointY(point.cost)}`).join(" ");

  return (
    <DemoWindow
      appName="Threshold Workbench"
      title="Cyber-risk cost simulator"
      status="SYNTHETIC SCENARIO"
      statusTone="working"
      className={styles.window}
      footer={
        <>
          <span>Source anchor: 10,000 balanced flows</span>
          <span>Reported RBF ROC-AUC 0.9343</span>
        </>
      }
    >
      <SourceNote title="Do not read this as validation" tone="amber">
        The adjustable confusion matrix is a deterministic teaching scenario, not a replay of held-out
        predictions. The coursework threshold was optimised on its test set (reported ≈0.0203), which
        makes that minimum optimistic; production selection needs untouched validation and calibration.
      </SourceNote>

      <div className={styles.cyberLayout}>
        <section className={styles.controlPanel} aria-labelledby="cyber-controls-title">
          <div className={styles.panelTitle}>
            <span aria-hidden="true">01</span>
            <div>
              <p>WHAT-IF CONTROLS</p>
              <h3 id="cyber-controls-title">Choose the operating point</h3>
            </div>
          </div>
          <RangeField
            label="Alert threshold"
            valueLabel={threshold.toFixed(2)}
            min={1}
            max={99}
            step={1}
            value={thresholdPercent}
            onChange={(event) => setThresholdPercent(Number(event.target.value))}
            help="Lower values flag more traffic; higher values suppress alerts."
          />
          <RangeField
            label="Cost of one missed attack"
            valueLabel={pounds.format(falseNegativeCost)}
            min={50_000}
            max={1_000_000}
            step={50_000}
            value={falseNegativeCost}
            onChange={(event) => setFalseNegativeCost(Number(event.target.value))}
          />
          <RangeField
            label="Cost of one false alarm"
            valueLabel={pounds.format(falsePositiveCost)}
            min={500}
            max={10_000}
            step={500}
            value={falsePositiveCost}
            onChange={(event) => setFalsePositiveCost(Number(event.target.value))}
          />
          <div className={styles.actionStrip}>
            <MacButton
              onClick={() => {
                setThresholdPercent(20);
                setFalseNegativeCost(1_000_000);
                setFalsePositiveCost(1_000);
              }}
            >
              Reset teaching scenario
            </MacButton>
            <span>FN:FP = {Math.round(falseNegativeCost / falsePositiveCost).toLocaleString("en-GB")}:1</span>
          </div>
        </section>

        <section className={styles.matrixPanel} aria-labelledby="matrix-title" aria-live="polite">
          <div className={styles.chartHeading}>
            <div>
              <span>SYNTHETIC 2,000-FLOW COHORT</span>
              <h3 id="matrix-title">Confusion matrix</h3>
            </div>
            <span className={styles.hypothesisBadge}>HYPOTHETICAL</span>
          </div>
          <div className={styles.matrixAxisTop} aria-hidden="true">
            <span>PREDICT BENIGN</span>
            <span>PREDICT ATTACK</span>
          </div>
          <div className={styles.matrixWithAxis}>
            <div className={styles.matrixAxisSide} aria-hidden="true">
              <span>ACTUAL BENIGN</span>
              <span>ACTUAL ATTACK</span>
            </div>
            <div className={styles.matrixGrid}>
              <MatrixCell label="True negative" value={matrix.tn} tone="good" />
              <MatrixCell label="False positive" value={matrix.fp} tone="bad" />
              <MatrixCell label="False negative" value={matrix.fn} tone="bad" />
              <MatrixCell label="True positive" value={matrix.tp} tone="good" />
            </div>
          </div>
        </section>
      </div>

      <section className={styles.costPanel} aria-labelledby="cost-curve-title">
        <div className={styles.costSummary}>
          <span>TOTAL SCENARIO COST</span>
          <strong>{pounds.format(totalCost)}</strong>
          <small>{matrix.fn} misses × {pounds.format(falseNegativeCost)} + {matrix.fp} false alarms × {pounds.format(falsePositiveCost)}</small>
        </div>
        <div
          className={styles.costChartWrap}
          role="region"
          tabIndex={0}
          aria-label="Scrollable threshold-cost chart"
        >
          <div className={styles.chartHeading}>
            <div>
              <span>RELATIVE SHAPE · CURRENT COST ASSUMPTIONS</span>
              <h3 id="cost-curve-title">Cost by threshold</h3>
            </div>
          </div>
          <svg
            className={styles.costChart}
            viewBox="0 0 430 158"
            role="img"
            aria-label={`Synthetic cost curve. Current threshold ${threshold.toFixed(2)} has total scenario cost ${pounds.format(totalCost)}.`}
          >
            <g className={styles.gridLines} aria-hidden="true">
              <line x1="42" x2="414" y1="130" y2="130" />
              <line x1="42" x2="42" y1="18" y2="130" />
              <text x="42" y="149">0</text>
              <text x="226" y="149" textAnchor="middle">THRESHOLD 0.5</text>
              <text x="414" y="149" textAnchor="end">1</text>
            </g>
            <polyline className={styles.costLine} points={curvePoints} />
            <line className={styles.cursorLine} x1={pointX(threshold)} x2={pointX(threshold)} y1="18" y2="130" />
            <circle className={styles.cursorPoint} cx={pointX(threshold)} cy={pointY(totalCost)} r="6" />
            <line className={styles.referenceLine} x1={pointX(0.0203)} x2={pointX(0.0203)} y1="18" y2="130" />
          </svg>
          <div className={styles.legendRow}>
            <span><i className={styles.currentKey} /> Current scenario</span>
            <span><i className={styles.referenceKey} /> Original test-optimised reference</span>
          </div>
        </div>
      </section>
    </DemoWindow>
  );
}

type RegularisationMethod = "ridge" | "lasso";

const COEFFICIENT_SERIES = [
  { name: "Traffic proxy", beta: 1.28, className: styles.seriesA },
  { name: "Temperature", beta: -0.78, className: styles.seriesB },
  { name: "Humidity", beta: 0.46, className: styles.seriesC },
  { name: "Noise feature", beta: -0.19, className: styles.seriesD },
] as const;

function regularisedCoefficient(beta: number, lambda: number, method: RegularisationMethod) {
  if (method === "ridge") return beta / (1 + lambda);
  return Math.sign(beta) * Math.max(Math.abs(beta) - lambda, 0);
}

export function RegularisationLabDemo() {
  const [method, setMethod] = useState<RegularisationMethod>("lasso");
  const [lambdaHundredths, setLambdaHundredths] = useState(45);
  const lambda = lambdaHundredths / 100;
  const coefficients = COEFFICIENT_SERIES.map((series) => ({
    ...series,
    value: regularisedCoefficient(series.beta, lambda, method),
  }));
  const zeroCount = coefficients.filter((series) => Math.abs(series.value) < 0.0001).length;
  const chartPath = (beta: number) =>
    Array.from({ length: 61 }, (_, index) => {
      const pathLambda = index / 40;
      const pathCoefficient = regularisedCoefficient(beta, pathLambda, method);
      const x = 42 + (pathLambda / 1.5) * 360;
      const y = 82 - (pathCoefficient / 1.4) * 55;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(" ");

  return (
    <DemoWindow
      appName="Shrinkage Lab"
      title="Ridge & LASSO coefficient paths"
      status="CONCEPT EXPLORER"
      statusTone="safe"
      className={styles.window}
      footer={
        <>
          <span>Real in-browser closed-form calculations</span>
          <span>Orthonormal toy design · no fitted personal data</span>
        </>
      }
    >
      <SourceNote title="A mathematical miniature">
        This is a newly authored concept explorer, not the coursework fit. It assumes standardised,
        orthogonal features so shrinkage has a transparent closed form; real correlated data requires
        fitting and validation.
      </SourceNote>

      <div className={styles.regularisationLayout}>
        <section className={styles.controlPanel} aria-labelledby="regularisation-controls-title">
          <div className={styles.panelTitle}>
            <span aria-hidden="true">λ</span>
            <div>
              <p>MODEL CONTROL</p>
              <h3 id="regularisation-controls-title">Apply a penalty</h3>
            </div>
          </div>
          <fieldset className={styles.segmentedFieldset}>
            <legend>Penalty family</legend>
            {(["ridge", "lasso"] as const).map((option) => (
              <label key={option} className={method === option ? styles.segmentActive : ""}>
                <input
                  type="radio"
                  name="regularisation-method"
                  value={option}
                  checked={method === option}
                  onChange={() => setMethod(option)}
                />
                <span>{option === "ridge" ? "Ridge · L2" : "LASSO · L1"}</span>
              </label>
            ))}
          </fieldset>
          <RangeField
            label="Penalty strength (λ)"
            valueLabel={lambda.toFixed(2)}
            min={0}
            max={150}
            step={1}
            value={lambdaHundredths}
            onChange={(event) => setLambdaHundredths(Number(event.target.value))}
            help="Move λ right to penalise larger coefficients more strongly."
          />
          <div className={styles.formulaCard}>
            <span>ORTHONORMAL CLOSED FORM</span>
            <code>
              {method === "ridge"
                ? "β̂ridge = β̂OLS / (1 + λ)"
                : "β̂lasso = sign(β̂OLS) · max(|β̂OLS| − λ, 0)"}
            </code>
            <p>
              {method === "ridge"
                ? "L2 continuously shrinks every signal, but does not set one exactly to zero."
                : "L1 uses soft-thresholding, so weaker signals can become exactly zero."}
            </p>
          </div>
        </section>

        <section className={styles.pathPanel} aria-labelledby="path-title">
          <div className={styles.chartHeading}>
            <div>
              <span>LIVE CLIENT-SIDE CALCULATION</span>
              <h3 id="path-title">Coefficient path</h3>
            </div>
            <span className={styles.lambdaBadge}>λ {lambda.toFixed(2)}</span>
          </div>
          <div
            className={styles.svgFrame}
            role="region"
            tabIndex={0}
            aria-label="Scrollable regularisation coefficient-path chart"
          >
            <svg
              className={styles.pathChart}
              viewBox="0 0 430 158"
              role="img"
              aria-label={`${method} coefficient paths at lambda ${lambda.toFixed(2)}. ${zeroCount} of 4 coefficients are zero.`}
            >
              <g className={styles.gridLines} aria-hidden="true">
                <line x1="42" x2="402" y1="82" y2="82" />
                <line x1="42" x2="42" y1="18" y2="137" />
                <text x="34" y="30" textAnchor="end">+1.4</text>
                <text x="34" y="85" textAnchor="end">0</text>
                <text x="34" y="137" textAnchor="end">−1.4</text>
                <text x="42" y="153">λ 0</text>
                <text x="402" y="153" textAnchor="end">λ 1.5</text>
              </g>
              {COEFFICIENT_SERIES.map((series) => (
                <path key={series.name} className={`${styles.coefficientPath} ${series.className}`} d={chartPath(series.beta)} />
              ))}
              <line
                className={styles.cursorLine}
                x1={42 + (lambda / 1.5) * 360}
                x2={42 + (lambda / 1.5) * 360}
                y1="18"
                y2="137"
              />
              {coefficients.map((series) => (
                <circle
                  key={series.name}
                  className={`${styles.pathDot} ${series.className}`}
                  cx={42 + (lambda / 1.5) * 360}
                  cy={82 - (series.value / 1.4) * 55}
                  r="4"
                />
              ))}
            </svg>
          </div>

          <div className={styles.coefficientList} aria-live="polite">
            {coefficients.map((series) => (
              <div className={styles.coefficientRow} key={series.name}>
                <span className={`${styles.seriesSwatch} ${series.className}`} aria-hidden="true" />
                <span>{series.name}</span>
                <div className={styles.coefficientTrack} aria-hidden="true">
                  <i className={styles.zeroLine} />
                  <i
                    className={series.value >= 0 ? styles.positiveBar : styles.negativeBar}
                    style={{ "--bar-size": `${(Math.abs(series.value) / 1.4) * 50}%` } as CSSProperties}
                  />
                </div>
                <strong>{series.value.toFixed(3)}</strong>
              </div>
            ))}
          </div>
          <p className={styles.pathReadout}>
            <strong>{zeroCount}/4 exactly zero.</strong>{" "}
            {method === "lasso" ? "The active set changes at each soft-threshold." : "Ridge retains the full set."}
          </p>
        </section>
      </div>
    </DemoWindow>
  );
}

type DagNode = "confounder" | "treatment" | "outcome" | "collider";

const DAG_COPY: Record<DagNode, { title: string; text: string }> = {
  confounder: {
    title: "Experience (Z) · confounder",
    text: "A common cause of treatment and outcome. Adjusting for Z blocks the backdoor path T ← Z → Y in this toy graph.",
  },
  treatment: {
    title: "Treatment (T)",
    text: "The intervention or policy whose effect is being estimated. Its direct arrow points toward the outcome.",
  },
  outcome: {
    title: "Outcome (Y)",
    text: "The measured response. Causal interpretation needs assumptions beyond any weighting calculation.",
  },
  collider: {
    title: "Response flag (C) · collider",
    text: "A shared effect of treatment and outcome. Conditioning on C opens T → C ← Y and can introduce bias.",
  },
};

const OPE_UNITS = [
  { id: "A", treated: true, outcome: 9.2, extremePropensity: 0.07 },
  { id: "B", treated: false, outcome: 4.2, extremePropensity: 0.93 },
  { id: "C", treated: true, outcome: 7.1, extremePropensity: 0.14 },
  { id: "D", treated: false, outcome: 5.8, extremePropensity: 0.86 },
  { id: "E", treated: true, outcome: 8.4, extremePropensity: 0.28 },
  { id: "F", treated: false, outcome: 3.7, extremePropensity: 0.72 },
  { id: "G", treated: true, outcome: 6.8, extremePropensity: 0.42 },
  { id: "H", treated: false, outcome: 6.0, extremePropensity: 0.58 },
  { id: "I", treated: true, outcome: 10.1, extremePropensity: 0.18 },
  { id: "J", treated: false, outcome: 4.9, extremePropensity: 0.82 },
  { id: "K", treated: true, outcome: 7.7, extremePropensity: 0.35 },
  { id: "L", treated: false, outcome: 5.5, extremePropensity: 0.65 },
] as const;

export function CausalOpeDemo() {
  const arrowId = `dag-arrow-${useId().replaceAll(":", "")}`;
  const [focusedNode, setFocusedNode] = useState<DagNode>("confounder");
  const [adjustConfounder, setAdjustConfounder] = useState(false);
  const [adjustCollider, setAdjustCollider] = useState(false);
  const [overlapQuality, setOverlapQuality] = useState(70);
  const [clipWeights, setClipWeights] = useState(false);
  const ope = useMemo(() => {
    const blend = (100 - overlapQuality) / 90;
    const units = OPE_UNITS.map((unit) => {
      const propensity = 0.5 + blend * (unit.extremePropensity - 0.5);
      const rawWeight = unit.treated ? 1 / propensity : 1 / (1 - propensity);
      return {
        ...unit,
        propensity,
        rawWeight,
        weight: clipWeights ? Math.min(rawWeight, 10) : rawWeight,
      };
    });
    const treated = units.filter((unit) => unit.treated);
    const control = units.filter((unit) => !unit.treated);
    const weightedMean = (group: typeof units) =>
      group.reduce((sum, unit) => sum + unit.weight * unit.outcome, 0) /
      group.reduce((sum, unit) => sum + unit.weight, 0);
    const weights = units.map((unit) => unit.weight);
    const meanWeight = weights.reduce((sum, weight) => sum + weight, 0) / weights.length;
    const variance = weights.reduce((sum, weight) => sum + (weight - meanWeight) ** 2, 0) / weights.length;
    const sumWeights = weights.reduce((sum, weight) => sum + weight, 0);
    const effectiveSampleSize = sumWeights ** 2 / weights.reduce((sum, weight) => sum + weight ** 2, 0);
    return {
      units,
      ate: weightedMean(treated) - weightedMean(control),
      variance,
      effectiveSampleSize,
      maximumWeight: Math.max(...weights),
    };
  }, [clipWeights, overlapQuality]);

  const adjustmentStatus = adjustCollider
    ? { tone: "danger", title: "Collider opened", text: "Conditioning on C creates a non-causal association. Remove C from the adjustment set." }
    : adjustConfounder
      ? { tone: "success", title: "Backdoor blocked", text: "Z blocks the displayed backdoor path. This is a graphical criterion, not proof of identification." }
      : { tone: "warning", title: "Backdoor remains open", text: "T ← Z → Y can confound the observed treatment–outcome association." };

  function activateNode(node: DagNode) {
    setFocusedNode(node);
    if (node === "confounder") setAdjustConfounder((current) => !current);
    if (node === "collider") setAdjustCollider((current) => !current);
  }

  return (
    <DemoWindow
      appName="Causal Sandbox"
      title="DAG & off-policy weighting lab"
      status="RE-AUTHORED TOY"
      statusTone="safe"
      className={styles.window}
      footer={
        <>
          <span>Synthetic 12-unit sample</span>
          <span>No assessed solution text or real decisions</span>
        </>
      }
    >
      <SourceNote title="Learning interface—not a causal claim">
        The graph, outcomes and propensities were newly authored for this portfolio. Click nodes to test
        an adjustment set, then stress the same inverse-propensity mechanism used in OPE.
      </SourceNote>

      <div className={styles.causalLayout}>
        <section className={styles.dagPanel} aria-labelledby="dag-title">
          <div className={styles.chartHeading}>
            <div>
              <span>CLICKABLE GRAPH</span>
              <h3 id="dag-title">Backdoors & colliders</h3>
            </div>
            <MacButton
              onClick={() => {
                setAdjustConfounder(false);
                setAdjustCollider(false);
                setFocusedNode("confounder");
              }}
            >
              Clear set
            </MacButton>
          </div>
          <div className={styles.dagCanvas}>
            <svg viewBox="0 0 480 240" aria-hidden="true" focusable="false">
              <defs>
                <marker id={arrowId} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                  <path d="M0,0 L8,4 L0,8 z" />
                </marker>
              </defs>
              <g markerEnd={`url(#${arrowId})`}>
                <path d="M218 55 L116 104" />
                <path d="M262 55 L364 104" />
                <path d="M126 125 L354 125" />
                <path d="M112 148 L216 195" />
                <path d="M368 148 L264 195" />
              </g>
              <text x="240" y="114" textAnchor="middle">causal effect</text>
              <text x="151" y="75" textAnchor="middle">backdoor</text>
              <text x="332" y="187" textAnchor="middle">collider path</text>
            </svg>
            <button
              className={`${styles.dagNode} ${styles.nodeZ} ${adjustConfounder ? styles.nodeSelected : ""}`}
              type="button"
              aria-pressed={adjustConfounder}
              onClick={() => activateNode("confounder")}
            >
              <span>Z</span>
              <strong>Experience</strong>
              <small>{adjustConfounder ? "ADJUSTING" : "CONFOUNDER"}</small>
            </button>
            <button className={`${styles.dagNode} ${styles.nodeT}`} type="button" onClick={() => activateNode("treatment")}>
              <span>T</span>
              <strong>Treatment</strong>
              <small>EXPOSURE</small>
            </button>
            <button className={`${styles.dagNode} ${styles.nodeY}`} type="button" onClick={() => activateNode("outcome")}>
              <span>Y</span>
              <strong>Outcome</strong>
              <small>RESPONSE</small>
            </button>
            <button
              className={`${styles.dagNode} ${styles.nodeC} ${adjustCollider ? styles.nodeDanger : ""}`}
              type="button"
              aria-pressed={adjustCollider}
              onClick={() => activateNode("collider")}
            >
              <span>C</span>
              <strong>Response flag</strong>
              <small>{adjustCollider ? "ADJUSTING" : "COLLIDER"}</small>
            </button>
          </div>
          <div className={`${styles.dagStatus} ${adjustmentStatus.tone === "warning" ? "" : styles[adjustmentStatus.tone]}`} aria-live="polite">
            <span aria-hidden="true">{adjustmentStatus.tone === "success" ? "✓" : "!"}</span>
            <div>
              <strong>{adjustmentStatus.title}</strong>
              <p>{adjustmentStatus.text}</p>
            </div>
          </div>
          <div className={styles.nodeInspector}>
            <span>SELECTED NODE</span>
            <strong>{DAG_COPY[focusedNode].title}</strong>
            <p>{DAG_COPY[focusedNode].text}</p>
          </div>
        </section>

        <section className={styles.opePanel} aria-labelledby="ope-title">
          <div className={styles.chartHeading}>
            <div>
              <span>IPS / IPW DIAGNOSTIC</span>
              <h3 id="ope-title">Overlap stress test</h3>
            </div>
            <span className={styles.hypothesisBadge}>TOY DATA</span>
          </div>
          <RangeField
            label="Propensity overlap quality"
            valueLabel={`${overlapQuality}%`}
            min={10}
            max={100}
            step={1}
            value={overlapQuality}
            onChange={(event) => setOverlapQuality(Number(event.target.value))}
            help="Poor overlap makes the observed action unlikely for some units and inflates inverse weights."
          />
          <label className={styles.checkboxRow}>
            <input type="checkbox" checked={clipWeights} onChange={(event) => setClipWeights(event.target.checked)} />
            <span>
              <strong>Clip applied weights at 10</strong>
              <small>Reduces variance, but changes the estimand and may add bias.</small>
            </span>
          </label>

          <div className={styles.opeMetrics} aria-live="polite">
            <div>
              <span>HÁJEK ATE TOY</span>
              <strong>{ope.ate >= 0 ? "+" : ""}{ope.ate.toFixed(2)}</strong>
              <small>outcome units</small>
            </div>
            <div>
              <span>WEIGHT VARIANCE</span>
              <strong>{ope.variance.toFixed(2)}</strong>
              <small>lower is steadier</small>
            </div>
            <div>
              <span>EFFECTIVE N</span>
              <strong>{ope.effectiveSampleSize.toFixed(1)}</strong>
              <small>of {OPE_UNITS.length}</small>
            </div>
          </div>

          <div className={styles.weightPlot} aria-label="Applied inverse-propensity weights for 12 synthetic units">
            <div className={styles.weightLegend}>
              <span><i className={styles.treatedKey} /> Treated</span>
              <span><i className={styles.controlKey} /> Control</span>
              <span>max w {ope.maximumWeight.toFixed(1)}</span>
            </div>
            <div className={styles.weightBars}>
              {ope.units.map((unit) => (
                <div className={styles.weightColumn} key={unit.id} title={`Unit ${unit.id}: weight ${unit.weight.toFixed(2)}`}>
                  <span
                    className={unit.treated ? styles.treatedBar : styles.controlBar}
                    style={{ height: `${Math.max(5, (unit.weight / ope.maximumWeight) * 76)}%` }}
                  />
                  <small>{unit.id}</small>
                </div>
              ))}
            </div>
          </div>

          <p className={styles.identificationNote}>
            <strong>Calculation:</strong> stabilised (Hájek) treated mean minus control mean using
            inverse observed-action propensities. Exchangeability, positivity and consistency remain
            identification assumptions; a tidy ATE number does not verify them.
          </p>
        </section>
      </div>
    </DemoWindow>
  );
}
