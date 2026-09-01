"use client";

import { useEffect, useId, useMemo, useRef, useState, type CSSProperties } from "react";
import { translateText, type Locale } from "@/lib/i18n";

type Difficulty = "easy" | "medium" | "hard";

type DifficultyConfig = {
  label: "Easy" | "Standard" | "Expert";
  anchors: readonly number[];
  amplitudeRange: readonly [number, number];
  sigmaRange: readonly [number, number];
  noiseAmplitude: number;
  retentionGuessError: readonly [number, number];
  amplitudeGuessScale: readonly [number, number];
  adjustableAmplitude: boolean;
};

type PeakComponent = {
  id: string;
  referenceRt: number;
  targetAmplitude: number;
  sigma: number;
  colour: string;
};

type GeneratedSample = {
  components: PeakComponent[];
  initialRetentionTimes: number[];
  initialAmplitudes: number[];
  noise: number[];
};

type DockState = {
  difficulty: Difficulty;
  seed: number;
  retentionTimes: number[];
  amplitudes: number[];
};

type FitResult = {
  score: number;
  meanRtError: number;
  meanAmplitudeError: number;
  rmse: number;
  orderCorrect: boolean;
  resolution: number;
  closestPair: string;
};

const DIFFICULTIES: Readonly<Record<Difficulty, DifficultyConfig>> = {
  easy: {
    label: "Easy",
    anchors: [1.25, 3.75, 6.2],
    amplitudeRange: [64, 84],
    sigmaRange: [0.13, 0.17],
    noiseAmplitude: 0.25,
    retentionGuessError: [0.3, 0.7],
    amplitudeGuessScale: [1, 1],
    adjustableAmplitude: false,
  },
  medium: {
    label: "Standard",
    anchors: [1.05, 2.72, 3.15, 6.15],
    amplitudeRange: [42, 102],
    sigmaRange: [0.14, 0.2],
    noiseAmplitude: 0.9,
    retentionGuessError: [0.4, 0.9],
    amplitudeGuessScale: [0.62, 1.38],
    adjustableAmplitude: true,
  },
  hard: {
    label: "Expert",
    anchors: [0.85, 2.05, 3.52, 3.86, 4.2, 6.55],
    amplitudeRange: [24, 116],
    sigmaRange: [0.13, 0.23],
    noiseAmplitude: 1.8,
    retentionGuessError: [0.45, 1.1],
    amplitudeGuessScale: [0.48, 1.52],
    adjustableAmplitude: true,
  },
} as const;

const COMPONENT_COLOURS = ["#a96300", "#c43f35", "#087985", "#62469a", "#2f7841", "#a93670"] as const;
const DIFFICULTY_SALTS: Readonly<Record<Difficulty, number>> = {
  easy: 0x3f21c,
  medium: 0x76ad9,
  hard: 0xb8137,
};
const INITIAL_DIFFICULTY: Difficulty = "easy";
const INITIAL_SEED = 732451;
const TRACE_TIMES = Array.from({ length: 201 }, (_, index) => index * 0.04);
const BASELINE = 5;
const AMPLITUDE_MIN = 15;
const AMPLITUDE_MAX = 130;
const PLOT = { left: 54, right: 738, top: 24, bottom: 260 } as const;

function createPrng(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function randomBetween(random: () => number, minimum: number, maximum: number) {
  return minimum + random() * (maximum - minimum);
}

function randomSignedMagnitude(random: () => number, minimum: number, maximum: number) {
  return (random() < 0.5 ? -1 : 1) * randomBetween(random, minimum, maximum);
}

function gaussian(x: number, centre: number, amplitude: number, sigma: number) {
  const distance = x - centre;
  return amplitude * Math.exp(-(distance * distance) / (2 * sigma * sigma));
}

function traceAt(
  time: number,
  components: readonly PeakComponent[],
  positions: readonly number[],
  amplitudes: readonly number[],
) {
  return BASELINE + components.reduce(
    (response, component, index) => response + gaussian(time, positions[index], amplitudes[index], component.sigma),
    0,
  );
}

function xPosition(time: number) {
  return PLOT.left + (time / 8) * (PLOT.right - PLOT.left);
}

function yPosition(response: number, yMaximum: number) {
  const clampedResponse = Math.min(yMaximum, Math.max(0, response));
  return PLOT.bottom - (clampedResponse / yMaximum) * (PLOT.bottom - PLOT.top);
}

function pathFrom(values: readonly number[], yMaximum: number) {
  return TRACE_TIMES.map((time, index) => {
    const command = index === 0 ? "M" : "L";
    return `${command}${xPosition(time).toFixed(2)},${yPosition(values[index], yMaximum).toFixed(2)}`;
  }).join(" ");
}

function clampRetentionTime(value: number) {
  return Math.min(7.5, Math.max(0.5, Math.round(value * 20) / 20));
}

function clampAmplitude(value: number) {
  return Math.min(AMPLITUDE_MAX, Math.max(AMPLITUDE_MIN, Math.round(value)));
}

function generateSample(difficulty: Difficulty, seed: number): GeneratedSample {
  const config = DIFFICULTIES[difficulty];
  const random = createPrng((seed ^ DIFFICULTY_SALTS[difficulty]) >>> 0);
  const positionJitter = difficulty === "easy" ? 0.1 : difficulty === "medium" ? 0.08 : 0.045;
  const minimumAmplitudeGap = difficulty === "easy" ? 5 : difficulty === "medium" ? 10 : 8;
  const usedAmplitudes: number[] = [];

  const components = config.anchors.map((anchor, index) => {
    // Hidden targets share the player's 0.05 minute / 1 mAU quantisation, so
    // an exact 100-point fit is always possible rather than merely close.
    const referenceRt = clampRetentionTime(anchor + randomBetween(random, -positionJitter, positionJitter));
    let targetAmplitude = Math.round(randomBetween(random, config.amplitudeRange[0], config.amplitudeRange[1]));
    for (let attempt = 0; attempt < 24 && usedAmplitudes.some((value) => Math.abs(value - targetAmplitude) < minimumAmplitudeGap); attempt += 1) {
      targetAmplitude = Math.round(randomBetween(random, config.amplitudeRange[0], config.amplitudeRange[1]));
    }
    if (usedAmplitudes.some((value) => Math.abs(value - targetAmplitude) < minimumAmplitudeGap)) {
      let bestCandidate = config.amplitudeRange[0];
      let bestDistance = -1;
      for (let candidate = config.amplitudeRange[0]; candidate <= config.amplitudeRange[1]; candidate += 1) {
        const distance = Math.min(...usedAmplitudes.map((value) => Math.abs(value - candidate)));
        if (distance > bestDistance) {
          bestCandidate = candidate;
          bestDistance = distance;
        }
      }
      targetAmplitude = bestCandidate;
    }
    usedAmplitudes.push(targetAmplitude);
    const sigma = Math.round(randomBetween(random, config.sigmaRange[0], config.sigmaRange[1]) * 200) / 200;
    const id = String.fromCharCode(65 + index);

    return {
      id,
      referenceRt,
      targetAmplitude,
      sigma,
      colour: COMPONENT_COLOURS[index % COMPONENT_COLOURS.length],
    };
  });

  const initialRetentionTimes = components.map((component) => clampRetentionTime(
    component.referenceRt + randomSignedMagnitude(random, config.retentionGuessError[0], config.retentionGuessError[1]),
  ));
  const initialAmplitudes = components.map((component) => (
    config.adjustableAmplitude
      ? clampAmplitude(component.targetAmplitude * randomBetween(random, config.amplitudeGuessScale[0], config.amplitudeGuessScale[1]))
      : component.targetAmplitude
  ));

  // Seeded detector noise plus a small low-frequency baseline ripple. Both are
  // stable for the lifetime of a sample and become stronger at higher levels.
  const noise = TRACE_TIMES.map((time) => config.noiseAmplitude * (
    (random() - 0.5) * 1.45 + Math.sin(time * 5.4 + seed * 0.001) * 0.22
  ));

  return { components, initialRetentionTimes, initialAmplitudes, noise };
}

function makeDockState(difficulty: Difficulty, seed: number): DockState {
  const sample = generateSample(difficulty, seed);
  return {
    difficulty,
    seed,
    retentionTimes: sample.initialRetentionTimes,
    amplitudes: sample.initialAmplitudes,
  };
}

function nextSampleSeed(seed: number) {
  if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
    const generated = new Uint32Array(1);
    window.crypto.getRandomValues(generated);
    if (generated[0] !== seed) return generated[0];
  }
  const next = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return next === seed ? (seed + 1) >>> 0 : next;
}

function scoreLabel(score: number) {
  if (score >= 92) return "EXCELLENT FIT";
  if (score >= 76) return "GOOD FIT";
  if (score >= 52) return "PARTIAL FIT";
  return "KEEP DOCKING";
}

function difficultyLabel(locale: Locale, difficulty: Difficulty) {
  if (locale === "zh-CN") return difficulty === "easy" ? "简单" : difficulty === "medium" ? "标准" : "专家";
  if (locale === "zh-TW") return difficulty === "easy" ? "簡單" : difficulty === "medium" ? "標準" : "專家";
  return DIFFICULTIES[difficulty].label;
}

function difficultySummary(locale: Locale, difficulty: Difficulty) {
  const peakCount = DIFFICULTIES[difficulty].anchors.length;
  const amplitudeMode = DIFFICULTIES[difficulty].adjustableAmplitude;
  if (locale === "zh-CN") return `${peakCount} 个峰 · ${amplitudeMode ? "保留时间 + 峰高" : "仅保留时间"}`;
  if (locale === "zh-TW") return `${peakCount} 個峰 · ${amplitudeMode ? "滯留時間 + 峰高" : "僅滯留時間"}`;
  return `${peakCount} peaks · ${amplitudeMode ? "retention time + amplitude" : "retention time only"}`;
}

function componentDisplayLabel(locale: Locale, id: string, index: number) {
  if (locale === "zh-CN") return `组分 ${id} — 峰 ${index + 1}`;
  if (locale === "zh-TW") return `組分 ${id} — 峰 ${index + 1}`;
  return `Component ${id} — peak ${index + 1}`;
}

function tryInstruction(locale: Locale, peakCount: number, adjustableAmplitude: boolean) {
  if (locale === "zh-CN") return adjustableAmplitude
    ? `移动全部 ${peakCount} 个固定峰宽组分并调整各自峰高，然后选择“拟合样品”。`
    : `移动全部 ${peakCount} 个固定形状组分，使其位于样品曲线下方，然后选择“拟合样品”。`;
  if (locale === "zh-TW") return adjustableAmplitude
    ? `移動全部 ${peakCount} 個固定峰寬組分並調整各自峰高，然後選擇「擬合樣品」。`
    : `移動全部 ${peakCount} 個固定形狀組分，使其位於樣品曲線下方，然後選擇「擬合樣品」。`;
  return adjustableAmplitude
    ? `Move all ${peakCount} fixed-width components and adjust each peak amplitude, then choose Fit sample.`
    : `Move all ${peakCount} fixed-shape components under the sample trace, then choose Fit sample.`;
}

function emptyResultText(locale: Locale, peakCount: number, adjustableAmplitude: boolean) {
  if (locale === "zh-CN") return adjustableAmplitude
    ? `移动并调整 ${peakCount} 个组分的峰高，再拟合样品以检查保留时间、振幅和整体曲线。`
    : `移动 ${peakCount} 个组分，再拟合样品以检查保留时间和整体曲线。`;
  if (locale === "zh-TW") return adjustableAmplitude
    ? `移動並調整 ${peakCount} 個組分的峰高，再擬合樣品以檢查滯留時間、振幅和整體曲線。`
    : `移動 ${peakCount} 個組分，再擬合樣品以檢查滯留時間和整體曲線。`;
  return adjustableAmplitude
    ? `Move and resize the ${peakCount} components, then fit the sample to check retention time, amplitude and overall trace shape.`
    : `Move the ${peakCount} components, then fit the sample to check retention time and overall trace shape.`;
}

function sampleStatusText(locale: Locale, difficulty: Difficulty, seed: number, peakCount: number) {
  const mode = difficultyLabel(locale, difficulty);
  const sampleSeed = String(seed >>> 0).padStart(10, "0");
  const amplitudeMode = DIFFICULTIES[difficulty].adjustableAmplitude;
  if (locale === "zh-CN") return `种子 ${sampleSeed} · ${mode} · ${peakCount} 个峰 · ${amplitudeMode ? "调整保留时间和振幅" : "调整保留时间"}`;
  if (locale === "zh-TW") return `種子 ${sampleSeed} · ${mode} · ${peakCount} 個峰 · ${amplitudeMode ? "調整滯留時間和振幅" : "調整滯留時間"}`;
  return `Seed ${sampleSeed} · ${mode} · ${peakCount} peaks · ${amplitudeMode ? "retention time + amplitude" : "retention time only"}`;
}

function watchInstruction(locale: Locale, adjustableAmplitude: boolean) {
  if (locale === "zh-CN") return adjustableAmplitude
    ? "匹配保留时间、振幅和洗脱顺序，然后检查最接近的峰对是否共洗脱。"
    : "匹配保留时间和洗脱顺序，然后检查最接近的峰对是否共洗脱。";
  if (locale === "zh-TW") return adjustableAmplitude
    ? "匹配滯留時間、振幅和洗脫順序，然後檢查最接近的峰對是否共洗脫。"
    : "匹配滯留時間和洗脫順序，然後檢查最接近的峰對是否共洗脫。";
  return adjustableAmplitude
    ? "Match retention time, amplitude and elution order, then inspect the closest pair for co-elution."
    : "Match retention time and elution order, then inspect the closest pair for co-elution.";
}

function sliderValueText(locale: Locale, component: PeakComponent, value: number) {
  const formatted = value.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (locale === "zh-CN") return `组分 ${component.id}，保留时间 ${formatted} 分钟`;
  if (locale === "zh-TW") return `組分 ${component.id}，滯留時間 ${formatted} 分鐘`;
  return `Component ${component.id}, retention time ${formatted} minutes`;
}

function amplitudeValueText(locale: Locale, component: PeakComponent, value: number) {
  const formatted = value.toLocaleString(locale, { maximumFractionDigits: 0 });
  if (locale === "zh-CN") return `组分 ${component.id}，振幅 ${formatted} 毫吸光度单位`;
  if (locale === "zh-TW") return `組分 ${component.id}，振幅 ${formatted} 毫吸光度單位`;
  return `Component ${component.id}, amplitude ${formatted} milli-absorbance units`;
}

function nudgeLabel(locale: Locale, component: PeakComponent, direction: -1 | 1) {
  if (locale === "zh-CN") return `${direction < 0 ? "提前" : "推后"}组分 ${component.id} 0.05 分钟`;
  if (locale === "zh-TW") return `${direction < 0 ? "提前" : "延後"}組分 ${component.id} 0.05 分鐘`;
  return `Move component ${component.id} ${direction < 0 ? "earlier" : "later"} by 0.05 minutes`;
}

function amplitudeNudgeLabel(locale: Locale, component: PeakComponent, direction: -1 | 1) {
  if (locale === "zh-CN") return `${direction < 0 ? "降低" : "提高"}组分 ${component.id} 振幅 1 毫吸光度单位`;
  if (locale === "zh-TW") return `${direction < 0 ? "降低" : "提高"}組分 ${component.id} 振幅 1 毫吸光度單位`;
  return `${direction < 0 ? "Decrease" : "Increase"} component ${component.id} amplitude by 1 milli-absorbance unit`;
}

function fitNarrative(locale: Locale, result: FitResult, adjustableAmplitude: boolean) {
  const rtError = result.meanRtError.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const amplitudeError = result.meanAmplitudeError.toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const rmse = result.rmse.toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const resolution = result.resolution.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const coEluting = result.resolution < 1.5;

  if (locale === "zh-CN") {
    return `得分 ${result.score}/100。平均保留时间误差 ${rtError} 分钟；${adjustableAmplitude ? `平均振幅误差 ${amplitudeError}%；` : ""}曲线均方根误差 ${rmse} mAU；洗脱顺序${result.orderCorrect ? "正确" : "需要调整"}。${result.closestPair} 近邻峰 Rs ${resolution}，${coEluting ? "属于共洗脱" : "已达到基线分离"}。`;
  }
  if (locale === "zh-TW") {
    return `得分 ${result.score}/100。平均滯留時間誤差 ${rtError} 分鐘；${adjustableAmplitude ? `平均振幅誤差 ${amplitudeError}%；` : ""}曲線均方根誤差 ${rmse} mAU；洗脫順序${result.orderCorrect ? "正確" : "需要調整"}。${result.closestPair} 相鄰峰 Rs ${resolution}，${coEluting ? "屬於共洗脫" : "已達到基線分離"}。`;
  }
  return `Score ${result.score}/100. Mean retention-time error ${rtError} min; ${adjustableAmplitude ? `mean amplitude error ${amplitudeError}%; ` : ""}trace RMSE ${rmse} mAU; elution order ${result.orderCorrect ? "correct" : "needs attention"}. The closest pair (${result.closestPair}) has Rs ${resolution} and is ${coEluting ? "co-eluting" : "baseline-resolved"}.`;
}

export default function HplcPeakDock({ locale }: { locale: Locale }) {
  const t = (source: string) => translateText(locale, source);
  const chartTitleId = useId();
  const chartDescriptionId = useId();
  const [dockState, setDockState] = useState<DockState>(() => makeDockState(INITIAL_DIFFICULTY, INITIAL_SEED));
  const [result, setResult] = useState<FitResult | null>(null);
  const didRandomiseInitialSample = useRef(false);
  const { difficulty, seed, retentionTimes, amplitudes } = dockState;
  const config = DIFFICULTIES[difficulty];
  const sample = useMemo(() => generateSample(difficulty, seed), [difficulty, seed]);

  useEffect(() => {
    if (didRandomiseInitialSample.current) return;
    didRandomiseInitialSample.current = true;
    setDockState(makeDockState(INITIAL_DIFFICULTY, nextSampleSeed(INITIAL_SEED)));
  }, []);

  const referencePositions = useMemo(
    () => sample.components.map((component) => component.referenceRt),
    [sample],
  );
  const targetAmplitudes = useMemo(
    () => sample.components.map((component) => component.targetAmplitude),
    [sample],
  );
  const sampleValues = useMemo(
    () => TRACE_TIMES.map((time, index) => Math.max(
      0,
      traceAt(time, sample.components, referencePositions, targetAmplitudes) + sample.noise[index],
    )),
    [referencePositions, sample, targetAmplitudes],
  );
  const yMaximum = useMemo(() => {
    const highestSampleValue = Math.max(...sampleValues);
    return Math.max(100, Math.ceil((highestSampleValue * 1.12) / 20) * 20);
  }, [sampleValues]);
  const yTicks = useMemo(
    () => Array.from({ length: 5 }, (_, index) => Math.round((yMaximum * index) / 4)),
    [yMaximum],
  );
  const samplePath = useMemo(() => pathFrom(sampleValues, yMaximum), [sampleValues, yMaximum]);
  const fittedValues = useMemo(
    () => TRACE_TIMES.map((time) => traceAt(time, sample.components, retentionTimes, amplitudes)),
    [amplitudes, retentionTimes, sample.components],
  );
  const fittedPath = useMemo(() => pathFrom(fittedValues, yMaximum), [fittedValues, yMaximum]);
  const componentPaths = useMemo(
    () => sample.components.map((component, index) => pathFrom(
      TRACE_TIMES.map((time) => gaussian(time, retentionTimes[index], amplitudes[index], component.sigma)),
      yMaximum,
    )),
    [amplitudes, retentionTimes, sample.components, yMaximum],
  );

  const setRetentionTime = (index: number, value: number) => {
    setDockState((current) => ({
      ...current,
      retentionTimes: current.retentionTimes.map((time, componentIndex) => (
        componentIndex === index ? clampRetentionTime(value) : time
      )),
    }));
    setResult(null);
  };

  const setAmplitude = (index: number, value: number) => {
    setDockState((current) => ({
      ...current,
      amplitudes: current.amplitudes.map((amplitude, componentIndex) => (
        componentIndex === index ? clampAmplitude(value) : amplitude
      )),
    }));
    setResult(null);
  };

  const loadDifficulty = (nextDifficulty: Difficulty) => {
    if (nextDifficulty === difficulty) return;
    setDockState(makeDockState(nextDifficulty, nextSampleSeed(seed)));
    setResult(null);
  };

  const loadNewSample = () => {
    const nextSeed = nextSampleSeed(seed);
    setDockState(makeDockState(difficulty, nextSeed));
    setResult(null);
  };

  const fitSample = () => {
    const rtErrors = sample.components.map((component, index) => Math.abs(retentionTimes[index] - component.referenceRt));
    const meanRtError = rtErrors.reduce((total, error) => total + error, 0) / rtErrors.length;
    const amplitudeErrors = sample.components.map((component, index) => (
      Math.abs(amplitudes[index] - component.targetAmplitude) / component.targetAmplitude
    ));
    const meanAmplitudeError = (amplitudeErrors.reduce((total, error) => total + error, 0) / amplitudeErrors.length) * 100;
    const squaredTraceError = sampleValues.reduce((total, sampleValue, index) => {
      const difference = fittedValues[index] - sampleValue;
      return total + difference * difference;
    }, 0);
    const rmse = Math.sqrt(squaredTraceError / sampleValues.length);
    const orderCorrect = retentionTimes.every((time, index) => index === 0 || retentionTimes[index - 1] < time);

    const orderedComponents = retentionTimes
      .map((retentionTime, index) => ({ component: sample.components[index], retentionTime }))
      .sort((left, right) => left.retentionTime - right.retentionTime);
    let resolution = Number.POSITIVE_INFINITY;
    let closestPair = `${orderedComponents[0].component.id}/${orderedComponents[1].component.id}`;
    for (let index = 0; index < orderedComponents.length - 1; index += 1) {
      const left = orderedComponents[index];
      const right = orderedComponents[index + 1];
      const currentResolution = Math.abs(right.retentionTime - left.retentionTime)
        / (2 * (left.component.sigma + right.component.sigma));
      if (currentResolution < resolution) {
        resolution = currentResolution;
        closestPair = `${left.component.id}/${right.component.id}`;
      }
    }

    const signalRange = Math.max(1, Math.max(...sampleValues) - BASELINE);
    const scoreableRmse = Math.max(0, rmse - config.noiseAmplitude);
    const normalisedRmse = scoreableRmse / signalRange;
    const score = Math.round(Math.max(0, Math.min(100,
      100
        - meanRtError * 22
        - meanAmplitudeError * (config.adjustableAmplitude ? 0.32 : 0)
        - normalisedRmse * 42
        - (orderCorrect ? 0 : 18),
    )));

    setResult({ score, meanRtError, meanAmplitudeError, rmse, orderCorrect, resolution, closestPair });
  };

  const reset = () => {
    setDockState(makeDockState(difficulty, seed));
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

      <fieldset className="hplc-difficulty">
        <legend>{t("DIFFICULTY")}</legend>
        <div className="hplc-difficulty__levels" role="group" aria-label={t("Peak Dock difficulty")}>
          {(Object.keys(DIFFICULTIES) as Difficulty[]).map((level) => (
            <button
              key={level}
              className={difficulty === level ? "is-active" : ""}
              type="button"
              aria-pressed={difficulty === level}
              onClick={() => loadDifficulty(level)}
            >
              <strong>{difficultyLabel(locale, level)}</strong>
              <small>{difficultySummary(locale, level)}</small>
            </button>
          ))}
        </div>
        <div className="hplc-sample-strip">
          <p role="status" aria-live="polite">
            {sampleStatusText(locale, difficulty, seed, sample.components.length)}
          </p>
          <button
            className="mac-button hplc-new-sample"
            type="button"
            onClick={loadNewSample}
            aria-label={`${t("New sample")}: ${difficultyLabel(locale, difficulty)}`}
          >
            {t("NEW SAMPLE")}
          </button>
        </div>
      </fieldset>

      <div className="hplc-context" aria-label={t("How to use Peak Dock")}>
        <section>
          <span>{t("WHY THIS EXISTS")}</span>
          <p>{t("Peak Dock teaches the first step of chromatogram interpretation: separate an observed signal into plausible component peaks without treating retention time as chemical identification.")}</p>
        </section>
        <section>
          <span>{t("TRY THIS")}</span>
          <p>{tryInstruction(locale, sample.components.length, config.adjustableAmplitude)}</p>
        </section>
        <section>
          <span>{t("WATCH")}</span>
          <p>{watchInstruction(locale, config.adjustableAmplitude)}</p>
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
            {t("A seeded sample trace and a movable fitted trace from zero to eight minutes. Higher difficulties add peaks, amplitude fitting, overlap and detector noise.")}
          </desc>

          <g className="hplc-grid" aria-hidden="true">
            {yTicks.map((response) => (
              <line key={response} x1={PLOT.left} x2={PLOT.right} y1={yPosition(response, yMaximum)} y2={yPosition(response, yMaximum)} />
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
            {yTicks.map((response) => (
              <g key={response}>
                <line x1={PLOT.left - 5} x2={PLOT.left} y1={yPosition(response, yMaximum)} y2={yPosition(response, yMaximum)} />
                <text x={PLOT.left - 9} y={yPosition(response, yMaximum) + 4}>{response.toLocaleString(locale)}</text>
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
              key={sample.components[index].id}
              className={`hplc-component-path hplc-component-path-${sample.components[index].id.toLowerCase()}`}
              d={path}
              fill="none"
              vectorEffect="non-scaling-stroke"
              style={{ "--hplc-component-colour": sample.components[index].colour } as CSSProperties}
            />
          ))}
          <path className="hplc-fitted-path" d={fittedPath} fill="none" vectorEffect="non-scaling-stroke" />

          <g className="hplc-peak-markers" aria-hidden="true">
            {sample.components.map((component, index) => (
              <g
                key={component.id}
                className={`hplc-peak-marker hplc-peak-marker-${component.id.toLowerCase()}`}
                transform={`translate(${xPosition(retentionTimes[index])} ${yPosition(traceAt(retentionTimes[index], sample.components, retentionTimes, amplitudes), yMaximum)})`}
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
        <legend>{t("DOCK COMPONENTS")}</legend>
        {sample.components.map((component, index) => {
          const idSuffix = `${component.id.toLowerCase()}-${chartTitleId.replaceAll(":", "")}`;
          const retentionControlId = `hplc-rt-${idSuffix}`;
          const amplitudeControlId = `hplc-amplitude-${idSuffix}`;
          const componentLabelId = `hplc-label-${idSuffix}`;
          return (
            <div
              className={`hplc-control hplc-control-${component.id.toLowerCase()}`}
              key={component.id}
              role="group"
              aria-labelledby={componentLabelId}
            >
              <label htmlFor={retentionControlId}>
                <span id={componentLabelId}>
                  <strong>{componentDisplayLabel(locale, component.id, index)}</strong>
                  <small>{t("RETENTION TIME")}</small>
                </span>
                <output htmlFor={retentionControlId}>
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
                  id={retentionControlId}
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

              {config.adjustableAmplitude ? (
                <>
                  <label htmlFor={amplitudeControlId}>
                    <span>{t("PEAK AMPLITUDE")}</span>
                    <output htmlFor={amplitudeControlId}>
                      {amplitudes[index].toLocaleString(locale, { maximumFractionDigits: 0 })}
                      <small>{t("mAU")}</small>
                    </output>
                  </label>
                  <div className="hplc-range-row">
                    <button
                      type="button"
                      onClick={() => setAmplitude(index, amplitudes[index] - 1)}
                      disabled={amplitudes[index] <= AMPLITUDE_MIN}
                      aria-label={amplitudeNudgeLabel(locale, component, -1)}
                    >
                      −
                    </button>
                    <input
                      id={amplitudeControlId}
                      type="range"
                      min={AMPLITUDE_MIN}
                      max={AMPLITUDE_MAX}
                      step="1"
                      value={amplitudes[index]}
                      onChange={(event) => setAmplitude(index, Number(event.target.value))}
                      aria-valuetext={amplitudeValueText(locale, component, amplitudes[index])}
                      style={{ "--hplc-component-colour": component.colour } as CSSProperties}
                    />
                    <button
                      type="button"
                      onClick={() => setAmplitude(index, amplitudes[index] + 1)}
                      disabled={amplitudes[index] >= AMPLITUDE_MAX}
                      aria-label={amplitudeNudgeLabel(locale, component, 1)}
                    >
                      +
                    </button>
                  </div>
                </>
              ) : (
                <div className="hplc-amplitude-lock">
                  <span>{t("PEAK AMPLITUDE")}</span>
                  <strong>{amplitudes[index].toLocaleString(locale)} <small>{t("mAU")}</small></strong>
                  <b>{t("LOCKED")}</b>
                </div>
              )}
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
              {config.adjustableAmplitude && (
                <div>
                  <dt>{t("MEAN AMPLITUDE ERROR")}</dt>
                  <dd>{result.meanAmplitudeError.toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}<small>{t("%")}</small></dd>
                </div>
              )}
              <div>
                <dt>{t("TRACE RMSE")}</dt>
                <dd>{result.rmse.toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} <small>{t("mAU")}</small></dd>
              </div>
            </dl>
            <div className={`hplc-resolution${result.resolution < 1.5 ? " is-coeluting" : " is-resolved"}`}>
              <div>
                <span>{t("CLOSEST PAIR")} {result.closestPair.replace("/", " / ")}</span>
                <strong>{t("Rs")} {result.resolution.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </div>
              <b>{result.resolution < 1.5 ? t("CO-ELUTING") : t("BASELINE-RESOLVED")}</b>
            </div>
            <p>{fitNarrative(locale, result, config.adjustableAmplitude)}</p>
            <small>{t("In this simulation, Rs below 1.5 flags a close pair that is not baseline-resolved.")}</small>
          </>
        ) : (
          <p>{emptyResultText(locale, sample.components.length, config.adjustableAmplitude)}</p>
        )}
      </div>

      <div className="hplc-disclaimer">
        <strong>{t("SIMULATED DATA")}</strong>
        <p>{t("Every sample is locally generated from a visible seed and is entirely simulated. Retention-time matching is against fictional references and is not proof of chemical identity.")}</p>
      </div>
    </section>
  );
}
