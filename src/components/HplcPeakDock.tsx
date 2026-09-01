"use client";

import { useId, useMemo, useState, type CSSProperties } from "react";
import { translateText, type Locale } from "@/lib/i18n";

type PeakComponent = {
  id: "A" | "B" | "C";
  label: string;
  referenceRt: number;
  amplitude: number;
  sigma: number;
  colour: string;
};

type FitResult = {
  score: number;
  meanRtError: number;
  rmse: number;
  orderCorrect: boolean;
  resolution: number;
};

const PEAK_COMPONENTS: readonly PeakComponent[] = [
  {
    id: "A",
    label: "Component A — early peak",
    referenceRt: 1.65,
    amplitude: 70,
    sigma: 0.14,
    colour: "#e6a800",
  },
  {
    id: "B",
    label: "Component B — close pair 1",
    referenceRt: 4.25,
    amplitude: 84,
    sigma: 0.18,
    colour: "#d94d3f",
  },
  {
    id: "C",
    label: "Component C — close pair 2",
    referenceRt: 4.66,
    amplitude: 58,
    sigma: 0.17,
    colour: "#087f8c",
  },
] as const;

const INITIAL_RETENTION_TIMES = [1.05, 3.7, 5.3] as const;
const TRACE_TIMES = Array.from({ length: 201 }, (_, index) => index * 0.04);
const BASELINE = 5;
const Y_MAX = 110;
const PLOT = { left: 54, right: 738, top: 24, bottom: 260 } as const;

function gaussian(x: number, centre: number, amplitude: number, sigma: number) {
  const distance = x - centre;
  return amplitude * Math.exp(-(distance * distance) / (2 * sigma * sigma));
}

function traceAt(time: number, positions: readonly number[]) {
  return BASELINE + PEAK_COMPONENTS.reduce(
    (response, component, index) => response + gaussian(time, positions[index], component.amplitude, component.sigma),
    0,
  );
}

function xPosition(time: number) {
  return PLOT.left + (time / 8) * (PLOT.right - PLOT.left);
}

function yPosition(response: number) {
  return PLOT.bottom - (response / Y_MAX) * (PLOT.bottom - PLOT.top);
}

function pathFrom(values: readonly number[]) {
  return TRACE_TIMES.map((time, index) => {
    const command = index === 0 ? "M" : "L";
    return `${command}${xPosition(time).toFixed(2)},${yPosition(values[index]).toFixed(2)}`;
  }).join(" ");
}

function clampRetentionTime(value: number) {
  return Math.min(7.5, Math.max(0.5, Math.round(value * 20) / 20));
}

function scoreLabel(score: number) {
  if (score >= 92) return "EXCELLENT FIT";
  if (score >= 76) return "GOOD FIT";
  if (score >= 52) return "PARTIAL FIT";
  return "KEEP DOCKING";
}

function sliderValueText(locale: Locale, component: PeakComponent, value: number) {
  const formatted = value.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (locale === "zh-CN") return `组分 ${component.id}，保留时间 ${formatted} 分钟`;
  if (locale === "zh-TW") return `組分 ${component.id}，滯留時間 ${formatted} 分鐘`;
  return `Component ${component.id}, retention time ${formatted} minutes`;
}

function nudgeLabel(locale: Locale, component: PeakComponent, direction: -1 | 1) {
  if (locale === "zh-CN") return `${direction < 0 ? "提前" : "推后"}组分 ${component.id} 0.05 分钟`;
  if (locale === "zh-TW") return `${direction < 0 ? "提前" : "延後"}組分 ${component.id} 0.05 分鐘`;
  return `${direction < 0 ? "Move" : "Move"} component ${component.id} ${direction < 0 ? "earlier" : "later"} by 0.05 minutes`;
}

function fitNarrative(locale: Locale, result: FitResult) {
  const rtError = result.meanRtError.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const rmse = result.rmse.toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const resolution = result.resolution.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const coEluting = result.resolution < 1.5;

  if (locale === "zh-CN") {
    return `得分 ${result.score}/100。平均保留时间误差 ${rtError} 分钟；曲线均方根误差 ${rmse} mAU；洗脱顺序${result.orderCorrect ? "正确" : "需要调整"}。B/C 近邻峰 Rs ${resolution}，${coEluting ? "属于共洗脱" : "已达到基线分离"}。`;
  }
  if (locale === "zh-TW") {
    return `得分 ${result.score}/100。平均滯留時間誤差 ${rtError} 分鐘；曲線均方根誤差 ${rmse} mAU；洗脫順序${result.orderCorrect ? "正確" : "需要調整"}。B/C 相鄰峰 Rs ${resolution}，${coEluting ? "屬於共洗脫" : "已達到基線分離"}。`;
  }
  return `Score ${result.score}/100. Mean retention-time error ${rtError} min; trace RMSE ${rmse} mAU; elution order ${result.orderCorrect ? "correct" : "needs attention"}. The B/C close pair has Rs ${resolution} and is ${coEluting ? "co-eluting" : "baseline-resolved"}.`;
}

export default function HplcPeakDock({ locale }: { locale: Locale }) {
  const t = (source: string) => translateText(locale, source);
  const chartTitleId = useId();
  const chartDescriptionId = useId();
  const [retentionTimes, setRetentionTimes] = useState<number[]>([...INITIAL_RETENTION_TIMES]);
  const [result, setResult] = useState<FitResult | null>(null);

  const referencePositions = useMemo(() => PEAK_COMPONENTS.map((component) => component.referenceRt), []);
  const samplePath = useMemo(
    () => pathFrom(TRACE_TIMES.map((time) => traceAt(time, referencePositions))),
    [referencePositions],
  );
  const fittedPath = useMemo(
    () => pathFrom(TRACE_TIMES.map((time) => traceAt(time, retentionTimes))),
    [retentionTimes],
  );
  const componentPaths = useMemo(
    () => PEAK_COMPONENTS.map((component, index) => pathFrom(
      TRACE_TIMES.map((time) => gaussian(time, retentionTimes[index], component.amplitude, component.sigma)),
    )),
    [retentionTimes],
  );

  const setRetentionTime = (index: number, value: number) => {
    setRetentionTimes((current) => current.map((time, componentIndex) => (
      componentIndex === index ? clampRetentionTime(value) : time
    )));
    setResult(null);
  };

  const fitSample = () => {
    const errors = PEAK_COMPONENTS.map((component, index) => Math.abs(retentionTimes[index] - component.referenceRt));
    const meanRtError = errors.reduce((total, error) => total + error, 0) / errors.length;
    const squaredTraceError = TRACE_TIMES.reduce((total, time) => {
      const difference = traceAt(time, retentionTimes) - traceAt(time, referencePositions);
      return total + difference * difference;
    }, 0);
    const rmse = Math.sqrt(squaredTraceError / TRACE_TIMES.length);
    const orderCorrect = retentionTimes[0] < retentionTimes[1] && retentionTimes[1] < retentionTimes[2];
    // With Gaussian peaks, baseline width is approximately four sigma. This is
    // the conventional 2Δt / (w1 + w2) resolution estimate for the close pair.
    const resolution = Math.abs(retentionTimes[2] - retentionTimes[1])
      / (2 * (PEAK_COMPONENTS[1].sigma + PEAK_COMPONENTS[2].sigma));
    const score = Math.round(Math.max(0, Math.min(100,
      100 - meanRtError * 24 - rmse * 1.7 - (orderCorrect ? 0 : 20),
    )));

    setResult({ score, meanRtError, rmse, orderCorrect, resolution });
  };

  const reset = () => {
    setRetentionTimes([...INITIAL_RETENTION_TIMES]);
    setResult(null);
  };

  return (
    <section className="hplc-peak-dock" aria-labelledby="hplc-peak-dock-title">
      <header className="hplc-header">
        <div>
          <span className="hplc-kicker">{t("ANALYTICAL ACCESSORY 06")}</span>
          <h3 id="hplc-peak-dock-title">{t("Peak Dock")}</h3>
          <p>{t("Synthetic HPLC–UV peak fitting")}</p>
        </div>
        <div className="hplc-detector" aria-label={t("UV detector wavelength: 254 nanometres")}>
          <span>{t("UV–VIS")}</span>
          <strong>{t("254 nm")}</strong>
        </div>
      </header>

      <div className="hplc-context" aria-label={t("How to use Peak Dock")}>
        <section>
          <span>{t("WHY THIS EXISTS")}</span>
          <p>{t("Peak Dock teaches the first step of chromatogram interpretation: separate an observed signal into plausible component peaks without treating retention time as chemical identification.")}</p>
        </section>
        <section>
          <span>{t("TRY THIS")}</span>
          <p>{t("Move the three fixed-shape Gaussian components under the sample trace, then choose Fit sample.")}</p>
        </section>
        <section>
          <span>{t("WATCH")}</span>
          <p>{t("Match retention time and elution order, then inspect whether the two late peaks are still co-eluting.")}</p>
        </section>
      </div>

      <div className="hplc-chart-frame">
        <div className="hplc-chart-legend" aria-label={t("Chromatogram legend")}>
          <span className="hplc-legend-sample"><i aria-hidden="true" />{t("SAMPLE TRACE")}</span>
          <span className="hplc-legend-fit"><i aria-hidden="true" />{t("FITTED SUM")}</span>
          <span className="hplc-legend-components"><i aria-hidden="true" />{t("COMPONENTS")}</span>
        </div>
        <svg
          className="hplc-chart"
          viewBox="0 0 760 304"
          role="img"
          aria-labelledby={`${chartTitleId} ${chartDescriptionId}`}
        >
          <title id={chartTitleId}>{t("Synthetic HPLC–UV chromatogram at 254 nanometres")}</title>
          <desc id={chartDescriptionId}>
            {t("A fixed sample trace and a movable fitted trace from zero to eight minutes. Components B and C form an overlapping close pair.")}
          </desc>

          <g className="hplc-grid" aria-hidden="true">
            {[0, 30, 60, 90].map((response) => (
              <line key={response} x1={PLOT.left} x2={PLOT.right} y1={yPosition(response)} y2={yPosition(response)} />
            ))}
            {Array.from({ length: 9 }, (_, value) => (
              <line key={value} x1={xPosition(value)} x2={xPosition(value)} y1={PLOT.top} y2={PLOT.bottom} />
            ))}
          </g>

          <g className="hplc-axes" aria-hidden="true">
            <line x1={PLOT.left} x2={PLOT.right} y1={PLOT.bottom} y2={PLOT.bottom} />
            <line x1={PLOT.left} x2={PLOT.left} y1={PLOT.top} y2={PLOT.bottom} />
            {Array.from({ length: 9 }, (_, value) => (
              <g key={value}>
                <line x1={xPosition(value)} x2={xPosition(value)} y1={PLOT.bottom} y2={PLOT.bottom + 5} />
                <text x={xPosition(value)} y={PLOT.bottom + 19}>{value.toLocaleString(locale)}</text>
              </g>
            ))}
            {[0, 30, 60, 90].map((response) => (
              <g key={response}>
                <line x1={PLOT.left - 5} x2={PLOT.left} y1={yPosition(response)} y2={yPosition(response)} />
                <text x={PLOT.left - 9} y={yPosition(response) + 4}>{response.toLocaleString(locale)}</text>
              </g>
            ))}
            <text className="hplc-axis-label hplc-axis-label-x" x={(PLOT.left + PLOT.right) / 2} y="299">
              {t("RETENTION TIME (MIN)")}
            </text>
            <text
              className="hplc-axis-label hplc-axis-label-y"
              x={-(PLOT.top + PLOT.bottom) / 2}
              y="13"
              transform="rotate(-90)"
            >
              {t("UV RESPONSE (mAU)")}
            </text>
          </g>

          <path className="hplc-sample-path" d={samplePath} fill="none" vectorEffect="non-scaling-stroke" />
          {componentPaths.map((path, index) => (
            <path
              key={PEAK_COMPONENTS[index].id}
              className={`hplc-component-path hplc-component-path-${PEAK_COMPONENTS[index].id.toLowerCase()}`}
              d={path}
              fill="none"
              vectorEffect="non-scaling-stroke"
              style={{ "--hplc-component-colour": PEAK_COMPONENTS[index].colour } as CSSProperties}
            />
          ))}
          <path className="hplc-fitted-path" d={fittedPath} fill="none" vectorEffect="non-scaling-stroke" />

          <g className="hplc-peak-markers" aria-hidden="true">
            {PEAK_COMPONENTS.map((component, index) => (
              <g
                key={component.id}
                className={`hplc-peak-marker hplc-peak-marker-${component.id.toLowerCase()}`}
                transform={`translate(${xPosition(retentionTimes[index])} ${yPosition(traceAt(retentionTimes[index], retentionTimes))})`}
                style={{ "--hplc-component-colour": component.colour } as CSSProperties}
              >
                <circle r="7" />
                <text y="-11">{component.id}</text>
              </g>
            ))}
          </g>
        </svg>
      </div>

      <fieldset className="hplc-controls">
        <legend>{t("POSITION FIXED-SHAPE COMPONENTS")}</legend>
        {PEAK_COMPONENTS.map((component, index) => {
          const controlId = `hplc-${component.id.toLowerCase()}-${chartTitleId.replaceAll(":", "")}`;
          return (
            <div className={`hplc-control hplc-control-${component.id.toLowerCase()}`} key={component.id}>
              <label htmlFor={controlId}>
                <span>{t(component.label)}</span>
                <output htmlFor={controlId}>
                  {retentionTimes[index].toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  <small>{t("min")}</small>
                </output>
              </label>
              <div className="hplc-range-row">
                <button
                  type="button"
                  onClick={() => setRetentionTime(index, retentionTimes[index] - 0.05)}
                  disabled={retentionTimes[index] <= 0.5}
                  aria-label={nudgeLabel(locale, component, -1)}
                >
                  −
                </button>
                <input
                  id={controlId}
                  type="range"
                  min="0.5"
                  max="7.5"
                  step="0.05"
                  value={retentionTimes[index]}
                  onChange={(event) => setRetentionTime(index, Number(event.target.value))}
                  aria-valuetext={sliderValueText(locale, component, retentionTimes[index])}
                  style={{ "--hplc-component-colour": component.colour } as CSSProperties}
                />
                <button
                  type="button"
                  onClick={() => setRetentionTime(index, retentionTimes[index] + 0.05)}
                  disabled={retentionTimes[index] >= 7.5}
                  aria-label={nudgeLabel(locale, component, 1)}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </fieldset>

      <div className="hplc-actions">
        <button className="mac-button hplc-fit-button" type="button" onClick={fitSample}>
          {t("FIT SAMPLE")}
        </button>
        <button className="mac-button hplc-reset-button" type="button" onClick={reset}>
          {t("Reset")}
        </button>
      </div>

      <div className={`hplc-result${result ? " is-revealed" : ""}`} role="status" aria-live="polite">
        {result ? (
          <>
            <header>
              <span>{t(scoreLabel(result.score))}</span>
              <strong>{result.score}<small>{t("/ 100")}</small></strong>
            </header>
            <dl className="hplc-metrics">
              <div>
                <dt>{t("MEAN RT ERROR")}</dt>
                <dd>{result.meanRtError.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <small>{t("min")}</small></dd>
              </div>
              <div>
                <dt>{t("TRACE RMSE")}</dt>
                <dd>{result.rmse.toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} <small>{t("mAU")}</small></dd>
              </div>
              <div>
                <dt>{t("ELUTION ORDER")}</dt>
                <dd>{result.orderCorrect ? t("A → B → C") : t("CHECK ORDER")}</dd>
              </div>
            </dl>
            <div className={`hplc-resolution${result.resolution < 1.5 ? " is-coeluting" : " is-resolved"}`}>
              <div>
                <span>{t("CLOSE PAIR B / C")}</span>
                <strong>{t("Rs")} {result.resolution.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </div>
              <b>{result.resolution < 1.5 ? t("CO-ELUTING") : t("BASELINE-RESOLVED")}</b>
            </div>
            <p>{fitNarrative(locale, result)}</p>
            <small>{t("In this simulation, Rs below 1.5 flags a close pair that is not baseline-resolved.")}</small>
          </>
        ) : (
          <p>{t("Move the three components, then fit the sample to check retention time, trace shape and elution order.")}</p>
        )}
      </div>

      <div className="hplc-disclaimer">
        <strong>{t("SIMULATED DATA")}</strong>
        <p>{t("All chromatogram data are deterministic and simulated. Retention-time matching is against fictional references and is not proof of chemical identity.")}</p>
      </div>
    </section>
  );
}
