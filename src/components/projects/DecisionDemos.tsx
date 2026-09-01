"use client";

import { useId, useMemo, useState, type CSSProperties } from "react";

import { DECISION_OPE_LOGS } from "@/data/decisionOpeLogs";

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

const AIR_MODEL_RESULTS = [
  { name: "OLS", testR2: 0.9065, testRmse: 0.4413, features: "11", transparency: 1 },
  { name: "Ridge", testR2: 0.9063, testRmse: 0.4417, features: "11", transparency: 0.9 },
  { name: "Lasso", testR2: 0.9065, testRmse: 0.4412, features: "10", transparency: 1 },
  { name: "KRR polynomial", testR2: 0.9169, testRmse: 0.4161, features: "kernel", transparency: 0.35 },
  { name: "KRR RBF", testR2: 0.9279, testRmse: 0.3874, features: "kernel", transparency: 0.2 },
] as const;

const AIR_MISSINGNESS = [
  { name: "NO2(GT)", value: 5.42 },
  { name: "NOx(GT)", value: 5.38 },
  { name: "PT08.S1(CO)", value: 4.3 },
  { name: "C6H6(GT)", value: 4.3 },
  { name: "PT08.S2(NMHC)", value: 4.3 },
  { name: "PT08.S3(NOx)", value: 4.3 },
  { name: "PT08.S4(NO2)", value: 4.3 },
  { name: "PT08.S5(O3)", value: 4.3 },
  { name: "Temperature", value: 4.3 },
  { name: "Relative humidity", value: 4.3 },
] as const;

export function AirQualityBudgetDemo() {
  const [surface, setSurface] = useState<"data" | "models" | "planner">("planner");
  const [budget, setBudget] = useState(3_500);
  const [interpretability, setInterpretability] = useState(60);
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
  const rankedModels = useMemo(() => {
    const fitWeight = 1 - interpretability / 100;
    return AIR_MODEL_RESULTS.map((model) => {
      const fitScore = clamp((model.testR2 - 0.9) / 0.03, 0, 1);
      return { ...model, score: fitWeight * fitScore + (1 - fitWeight) * model.transparency };
    }).sort((left, right) => right.score - left.score);
  }, [interpretability]);

  return (
    <DemoWindow
      appName="Monitor Planner"
      title="Air-quality sensor budget"
      status="COURSEWORK · HYPOTHETICAL"
      purpose="Turn source data quality and model evidence into an explicit trade-off between sensor cost, predictive value and interpretability."
      tryThis="Change the sensor budget and interpretability preference, then compare the feasible choices."
      watchFor="The browser-only recommendation moves along a constrained frontier; it is not a live procurement or deployment decision."
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
        The source contains 7,674 air-quality observations, train-only KNN imputation and scaling,
        five regression families, regularisation paths and a hypothetical sensor-cost exercise. This
        browser chapter exposes those stages without shipping the dataset or claiming procurement validation.
      </SourceNote>

      <div className={styles.surfaceTabs} role="group" aria-label="Air-quality decision lab chapter">
        <button type="button" aria-pressed={surface === "data"} onClick={() => setSurface("data")}>01 · Data QA</button>
        <button type="button" aria-pressed={surface === "models"} onClick={() => setSurface("models")}>02 · Model lab</button>
        <button type="button" aria-pressed={surface === "planner"} onClick={() => setSurface("planner")}>03 · Sensor decision</button>
      </div>

      {surface === "data" ? (
        <div className={styles.airAuditGrid}>
          <section className={styles.controlPanel} aria-labelledby="air-data-title">
            <div className={styles.panelTitle}>
              <span aria-hidden="true">01</span>
              <div><p>DATA CONTRACT</p><h3 id="air-data-title">What one row represents</h3></div>
            </div>
            <dl className={styles.airDataFacts}>
              <div><dt>Rows</dt><dd>7,674 ambient snapshots</dd></div>
              <div><dt>Target</dt><dd>CO(GT) · mg/m³</dd></div>
              <div><dt>Predictors</dt><dd>11 sensor/environment signals</dd></div>
              <div><dt>Split</dt><dd>6,139 train / 1,535 test</dd></div>
              <div><dt>Imputation</dt><dd>KNN k=5 · fit on train</dd></div>
              <div><dt>Scaling</dt><dd>StandardScaler · fit on train</dd></div>
            </dl>
            <SourceNote title="Analytical boundary" tone="amber">
              The rows are time-indexed observations, but the recorded workflow uses a random 80/20 split.
              That does not establish performance under future-time or site shift; a temporal evaluation is
              the safer deployment test.
            </SourceNote>
          </section>
          <section className={styles.chartPanel} aria-labelledby="air-missing-title">
            <div className={styles.chartHeading}>
              <div><span>SOURCE-RECORDED PROFILE</span><h3 id="air-missing-title">Missingness before imputation</h3></div>
              <span className={styles.lowerLegend}>10 OF 11 PREDICTORS SHOWN</span>
            </div>
            <div className={styles.missingBars}>
              {AIR_MISSINGNESS.map((feature) => (
                <div key={feature.name}>
                  <span>{feature.name}</span>
                  <i style={{ "--missing": `${(feature.value / 6) * 100}%` } as CSSProperties} aria-hidden="true" />
                  <strong>{feature.value.toFixed(2)}%</strong>
                </div>
              ))}
            </div>
            <p className={styles.identificationNote}>
              <strong>Why it matters:</strong> imputation and scaling are learned from the training partition and reused on test. The portfolio does not rerun or redistribute the original observations.
            </p>
          </section>
        </div>
      ) : surface === "models" ? (
        <div className={styles.airModelGrid}>
          <section className={styles.controlPanel} aria-labelledby="air-model-priority-title">
            <div className={styles.panelTitle}>
              <span aria-hidden="true">02</span>
              <div><p>BROWSER DECISION RULE</p><h3 id="air-model-priority-title">Choose the trade-off</h3></div>
            </div>
            <RangeField
              label="Interpretability priority"
              valueLabel={`${interpretability}%`}
              min={0}
              max={100}
              value={interpretability}
              onChange={(event) => setInterpretability(Number(event.target.value))}
              help="The ranking blends source-recorded test R² with an explicitly authored transparency score. It is not source model selection."
            />
            <div className={styles.modelWinner} aria-live="polite">
              <span>CURRENT BROWSER RANK</span>
              <strong>{rankedModels[0].name}</strong>
              <p>Score {rankedModels[0].score.toFixed(3)} · test R² {rankedModels[0].testR2.toFixed(4)} · {rankedModels[0].features} features</p>
            </div>
          </section>
          <section className={styles.chartPanel} aria-labelledby="air-model-table-title">
            <div className={styles.chartHeading}>
              <div><span>SOURCE-RECORDED RESULTS</span><h3 id="air-model-table-title">Five model families</h3></div>
              <span className={styles.lowerLegend}>RANDOM 80/20 TEST</span>
            </div>
            <div className={styles.modelTableWrap} role="region" tabIndex={0} aria-label="Scrollable air-quality model comparison">
              <table className={styles.modelTable}>
                <thead><tr><th>Model</th><th>Test R²</th><th>Test RMSE</th><th>Features</th><th>Browser score</th></tr></thead>
                <tbody>{rankedModels.map((model, index) => (
                  <tr key={model.name} data-best={index === 0 ? "true" : undefined}>
                    <th scope="row">{model.name}</th><td>{model.testR2.toFixed(4)}</td><td>{model.testRmse.toFixed(4)}</td><td>{model.features}</td><td>{model.score.toFixed(3)}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            <p className={styles.identificationNote}>
              The RBF kernel reports the strongest recorded fit, while the linear models retain interpretability. The source results are historical coursework outputs, not a fresh reproducibility run.
            </p>
          </section>
        </div>
      ) : <>

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
      </>}
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
      purpose="Show how false-positive and false-negative costs change a classifier threshold—and why leaked historical evidence cannot validate it."
      tryThis="Change the cost assumptions and threshold, then inspect the audit and rerun requirements."
      watchFor="The hypothetical cost balance changes, while the performance claim remains withheld until a leakage-safe evaluation exists."
      statusTone="working"
      className={styles.window}
      footer={
        <>
          <span>Source audit: 10,000 labelled rows</span>
          <span>Historical metric withheld pending leakage-safe rerun</span>
        </>
      }
    >
      <SourceNote title="Do not read this as validation" tone="amber">
        The adjustable confusion matrix is a deterministic teaching scenario, not a replay of held-out
        predictions. The coursework data include 4,904 duplicate rows beyond the first; 1,084 of 2,000
        seeded test rows exactly recur in training. Its transform also fits during use and the threshold
        was selected on the test set. A grouped or deduplicated rerun with train-only preprocessing,
        validation selection and an untouched final test is required before reporting performance.
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
            <span><i className={styles.referenceKey} /> Historical test-optimised threshold (not validation)</span>
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
      purpose="Make regularisation visible: Ridge continuously shrinks coefficients, while LASSO can remove them from the active model."
      tryThis="Raise lambda and switch between Ridge and LASSO."
      watchFor="Coefficient magnitudes and the active set change through real in-browser toy calculations, not a replay of the source notebook fit."
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
        orthogonal features so shrinkage has a closed form; real correlated data requires
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

type OpePolicy = "uniform" | "conservative" | "challenger";

const OPE_POLICY_COPY: Record<OpePolicy, { title: string; text: string }> = {
  uniform: {
    title: "Uniform policy",
    text: "Assigns each of the two synthetic actions with probability 0.5. This is the easiest overlap check.",
  },
  conservative: {
    title: "Conservative policy",
    text: "Moves gradually toward action 1 as the context segment increases, staying relatively close to the logger.",
  },
  challenger: {
    title: "Challenger policy",
    text: "Reverses the logger’s broad preference. Importance weights expose where the log has little support for that change.",
  },
};

function targetActionOneProbability(policy: OpePolicy, segment: number) {
  if (policy === "uniform") return 0.5;
  if (policy === "conservative") return [0.35, 0.44, 0.56, 0.65][segment];
  return [0.76, 0.66, 0.34, 0.24][segment];
}

function OpeEstimatorWorkbench() {
  const [policy, setPolicy] = useState<OpePolicy>("challenger");
  const [overlapQuality, setOverlapQuality] = useState(58);
  const [clipEnabled, setClipEnabled] = useState(false);
  const [clipAt, setClipAt] = useState(5);
  const [switchTau, setSwitchTau] = useState(4);

  const audit = useMemo(() => {
    const stress = (100 - overlapQuality) / 90;
    const rows = DECISION_OPE_LOGS.map((sourceRow) => {
      const { action, segment } = sourceRow;
      const rawBehaviourOne = sourceRow.behaviourActionOne;
      const behaviourOne = 0.5 + (rawBehaviourOne - 0.5) * stress;
      const propensity = action === 1 ? behaviourOne : 1 - behaviourOne;
      const targetOne = targetActionOneProbability(policy, segment);
      const targetProbability = action === 1 ? targetOne : 1 - targetOne;
      const rawWeight = targetProbability / propensity;
      const weight = clipEnabled ? Math.min(rawWeight, clipAt) : rawWeight;
      const { q0, q1, reward } = sourceRow;
      const qLogged = action === 1 ? q1 : q0;
      const qTarget = (1 - targetOne) * q0 + targetOne * q1;
      const correction = weight * (reward - qLogged);
      return {
        id: sourceRow.id,
        segment,
        action,
        reward,
        propensity,
        targetProbability,
        rawWeight,
        weight,
        qLogged,
        qTarget,
        dr: qTarget + correction,
        switched: rawWeight <= switchTau ? qTarget + correction : qTarget,
      };
    });
    const mean = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;
    const weights = rows.map((row) => row.weight);
    const weightSum = weights.reduce((sum, value) => sum + value, 0);
    const weightSquareSum = weights.reduce((sum, value) => sum + value ** 2, 0);
    const ips = mean(rows.map((row) => row.weight * row.reward));
    const snips = rows.reduce((sum, row) => sum + row.weight * row.reward, 0) / weightSum;
    return {
      rows,
      estimates: {
        IPS: ips,
        SNIPS: snips,
        Direct: mean(rows.map((row) => row.qTarget)),
        DR: mean(rows.map((row) => row.dr)),
        "SWITCH-DR": mean(rows.map((row) => row.switched)),
      },
      ess: weightSum ** 2 / weightSquareSum,
      maxWeight: Math.max(...rows.map((row) => row.rawWeight)),
      clippedCount: rows.filter((row) => row.rawWeight > clipAt).length,
      unsupportedCount: rows.filter((row) => row.propensity < 0.2).length,
    };
  }, [clipAt, clipEnabled, overlapQuality, policy, switchTau]);

  const essShare = audit.ess / audit.rows.length;

  return (
    <div className={styles.opeWorkbench}>
      <section className={styles.opeControls} aria-labelledby="ope-workbench-controls">
        <div className={styles.chartHeading}>
          <div>
            <span>COUNTERFACTUAL POLICY</span>
            <h3 id="ope-workbench-controls">Logged-policy replay</h3>
          </div>
          <span className={styles.hypothesisBadge}>{DECISION_OPE_LOGS.length} LOCAL CSV ROWS</span>
        </div>

        <fieldset className={styles.policyChoices}>
          <legend>Evaluation policy</legend>
          {(Object.keys(OPE_POLICY_COPY) as OpePolicy[]).map((candidate) => (
            <label key={candidate} className={candidate === policy ? styles.policyActive : undefined}>
              <input
                type="radio"
                name="ope-policy"
                value={candidate}
                checked={candidate === policy}
                onChange={() => setPolicy(candidate)}
              />
              <span>{OPE_POLICY_COPY[candidate].title}</span>
            </label>
          ))}
        </fieldset>
        <p className={styles.policyDescription}>{OPE_POLICY_COPY[policy].text}</p>

        <RangeField
          label="Logger overlap quality"
          valueLabel={`${overlapQuality}%`}
          min={10}
          max={100}
          value={overlapQuality}
          onChange={(event) => setOverlapQuality(Number(event.target.value))}
          help="Lower overlap makes some logged actions unlikely under the behaviour policy, increasing importance weights."
        />
        <RangeField
          label="SWITCH-DR threshold τ"
          valueLabel={switchTau.toFixed(1)}
          min={1}
          max={12}
          step={0.5}
          value={switchTau}
          onChange={(event) => setSwitchTau(Number(event.target.value))}
          help="Use the DR correction at or below τ; fall back to the direct reward model above it."
        />
        <label className={styles.checkboxRow}>
          <input type="checkbox" checked={clipEnabled} onChange={(event) => setClipEnabled(event.target.checked)} />
          <span>
            <strong>Clip importance weights</strong>
            <small>A bias–variance sensitivity control, not a free stability improvement.</small>
          </span>
        </label>
        {clipEnabled ? (
          <RangeField
            label="Maximum applied weight"
            valueLabel={clipAt.toFixed(1)}
            min={1}
            max={12}
            step={0.5}
            value={clipAt}
            onChange={(event) => setClipAt(Number(event.target.value))}
            help={`${audit.clippedCount}/${audit.rows.length} rows are currently clipped; report this fraction with the estimate.`}
          />
        ) : null}
      </section>

      <section className={styles.opeResults} aria-labelledby="ope-workbench-results">
        <div className={styles.chartHeading}>
          <div>
            <span>ESTIMATOR RECEIPT</span>
            <h3 id="ope-workbench-results">Same log, five estimators</h3>
          </div>
          <span className={essShare < 0.35 ? styles.essDanger : styles.essGood}>
            ESS {audit.ess.toFixed(1)} / {audit.rows.length}
          </span>
        </div>

        <div className={styles.estimatorGrid} aria-live="polite">
          {Object.entries(audit.estimates).map(([name, value]) => (
            <div key={name}>
              <span>{name}</span>
              <strong>{value.toFixed(3)}</strong>
              <small>{name === "Direct" ? "reward model only" : name === "SWITCH-DR" ? `τ ${switchTau.toFixed(1)}` : "estimated value"}</small>
            </div>
          ))}
        </div>

        <div className={styles.opeDiagnostics}>
          <div>
            <span>MAX RAW WEIGHT</span>
            <strong>{audit.maxWeight.toFixed(2)}</strong>
          </div>
          <div>
            <span>ESS SHARE</span>
            <strong>{(essShare * 100).toFixed(0)}%</strong>
          </div>
          <div>
            <span>PROPENSITY &lt; 0.20</span>
            <strong>{audit.unsupportedCount}</strong>
          </div>
          <div>
            <span>CLIPPED ROWS</span>
            <strong>{clipEnabled ? audit.clippedCount : 0}</strong>
          </div>
        </div>

        <div className={styles.logTableWrap} role="region" tabIndex={0} aria-label="Scrollable synthetic logged-policy evidence table">
          <table className={styles.logTable}>
            <thead>
              <tr><th>Log</th><th>Seg.</th><th>a</th><th>r</th><th>πb(a|x)</th><th>π(a|x)</th><th>w</th></tr>
            </thead>
            <tbody>
              {audit.rows.map((row) => (
                <tr key={row.id} data-risk={row.propensity < 0.15 ? "high" : undefined}>
                  <th scope="row">{row.id}</th>
                  <td>{row.segment + 1}</td>
                  <td>{row.action}</td>
                  <td>{row.reward}</td>
                  <td>{row.propensity.toFixed(3)}</td>
                  <td>{row.targetProbability.toFixed(3)}</td>
                  <td title={`Raw weight ${row.rawWeight.toFixed(3)}`}>{row.weight.toFixed(3)}{clipEnabled && row.rawWeight > clipAt ? "*" : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className={styles.identificationNote}>
          <strong>Source mechanic:</strong> the audited Week 11 code consumes (context, action, reward, recorded behaviour propensity), fits one ridge reward model per arm, and evaluates IPS, SNIPS, Direct, DR and SWITCH-DR. This deterministic browser log is loaded from a schema-checked local CSV; it demonstrates estimator mechanics, not a deployed policy result.
        </p>
      </section>
    </div>
  );
}

export function CausalOpeDemo() {
  const arrowId = `dag-arrow-${useId().replaceAll(":", "")}`;
  const [surface, setSurface] = useState<"causal" | "ope">("causal");
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
      appName="Decision Evidence Lab"
      title="Causal adjustment & off-policy evaluation"
      status="SOURCE-ALIGNED REBUILD"
      purpose="Separate two often-confused questions: estimating an intervention effect and evaluating a new policy from logged decisions."
      tryThis="Open a causal path, then switch to OPE and reduce overlap for the challenger policy."
      watchFor="Invalid adjustment paths, effective sample size and estimator disagreement reveal when a decision claim loses support."
      statusTone="safe"
      className={styles.window}
      footer={
        <>
          <span>Two distinct chapters · causal adjustment + OPE</span>
          <span>No assessed text, private logs or real decisions</span>
        </>
      }
    >
      <SourceNote title="Two questions that should not be collapsed">
        The causal chapter asks whether an adjustment set blocks the displayed backdoor path. The OPE chapter asks what a counterfactual policy would have earned from logged bandit feedback. Both use synthetic browser fixtures and keep their assumptions visible.
      </SourceNote>

      <div className={styles.surfaceTabs} role="group" aria-label="Decision evidence lab chapter">
        <button type="button" aria-pressed={surface === "causal"} onClick={() => setSurface("causal")}>01 · Causal adjustment</button>
        <button type="button" aria-pressed={surface === "ope"} onClick={() => setSurface("ope")}>02 · Off-policy evaluation</button>
      </div>

      {surface === "ope" ? <OpeEstimatorWorkbench /> : <div className={styles.causalLayout}>
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
              <span>IPW DIAGNOSTIC</span>
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
      </div>}
    </DemoWindow>
  );
}
