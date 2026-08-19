"use client";

import { useMemo, useState } from "react";
import { DemoWindow } from "./DemoChrome";
import styles from "./StockMarketStudio.module.css";

type ViewId = "lab" | "window" | "evidence";
type MetricMode = "legacy" | "corrected";
type Side = "BUY" | "SELL";
type ScenarioId = "source" | "quiet" | "floor";

type SimulationConfig = {
  seed: number;
  initialPrice: number;
  maxQuantity: number;
  maxPriceImpact: number;
};

type ImpactEvent = {
  id: number;
  day: number;
  outerTrade: number;
  trader: number;
  side: Side;
  quantity: number;
  sentiment: number;
  randomImpact: number;
  requestedImpact: number;
  realisedImpact: number;
  priceBefore: number;
  priceAfter: number;
  cumulativeVolume: number;
  floorHit: boolean;
};

type DailyAudit = {
  day: number;
  firstHistoryIndex: number;
  lastHistoryIndex: number;
  open: number;
  close: number;
  legacyWindow: number[];
  correctedWindow: number[];
  legacyReturn: number;
  correctedReturn: number;
  legacyVolatility: number;
  correctedVolatility: number;
};

type SimulationResult = {
  history: number[];
  volumes: number[];
  events: ImpactEvent[];
  dailyAudits: DailyAudit[];
  price: number;
  volume: number;
  buyOrders: number;
  sellOrders: number;
  floorHits: number;
};

const TRADES_PER_DAY = 10;
const TRADERS_PER_TRADE = 5;
const EVENTS_PER_DAY = TRADES_PER_DAY * TRADERS_PER_TRADE;
const MAX_BATCHES = 200;

const SCENARIOS: Array<{
  id: ScenarioId;
  label: string;
  hint: string;
  config: SimulationConfig;
}> = [
  {
    id: "source",
    label: "Source defaults",
    hint: "P₀ 100 · Q 100 · α .01",
    config: { seed: 2025, initialPrice: 100, maxQuantity: 100, maxPriceImpact: 0.01 },
  },
  {
    id: "quiet",
    label: "Low impact",
    hint: "P₀ 100 · Q 40 · α .002",
    config: { seed: 731, initialPrice: 100, maxQuantity: 40, maxPriceImpact: 0.002 },
  },
  {
    id: "floor",
    label: "Floor stress",
    hint: "P₀ .18 · Q 100 · α .02",
    config: { seed: 17, initialPrice: 0.18, maxQuantity: 100, maxPriceImpact: 0.02 },
  },
];

const VIEW_OPTIONS: Array<{ id: ViewId; label: string; hint: string }> = [
  { id: "lab", label: "Impact lab", hint: "seeded event replay" },
  { id: "window", label: "Window audit", hint: "legacy vs corrected" },
  { id: "evidence", label: "Source map", hint: "claims + invariants" },
];

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function createSeededRandom(seed: number) {
  let state = (Math.trunc(seed) >>> 0) || 0x6d2b79f5;

  const uniform = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4_294_967_296;
  };

  const normal = () => {
    const u1 = Math.max(uniform(), Number.EPSILON);
    const u2 = uniform();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  };

  return { uniform, normal };
}

function sampleStandardDeviation(values: number[]) {
  if (values.length < 2) return 0;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const squared = values.reduce((sum, value) => sum + (value - mean) ** 2, 0);
  return Math.sqrt(squared / (values.length - 1));
}

function percentageReturn(open: number, close: number) {
  return ((close - open) / open) * 100;
}

function simulate(config: SimulationConfig, batches: number): SimulationResult {
  const random = createSeededRandom(config.seed);
  const history = [config.initialPrice];
  const volumes = [0];
  const events: ImpactEvent[] = [];
  const dailyAudits: DailyAudit[] = [];

  let price = config.initialPrice;
  let volume = 0;
  let buyOrders = 0;
  let sellOrders = 0;
  let floorHits = 0;
  let dailySentiment = 0.5;

  for (let batch = 0; batch < batches; batch += 1) {
    const day = Math.floor(batch / TRADES_PER_DAY) + 1;
    const outerTrade = (batch % TRADES_PER_DAY) + 1;

    if (outerTrade === 1) dailySentiment = random.uniform();

    const currentSentiment = clamp(dailySentiment + random.normal() * 0.1, 0.1, 0.9);

    for (let trader = 1; trader <= TRADERS_PER_TRADE; trader += 1) {
      const side: Side = random.uniform() < currentSentiment ? "BUY" : "SELL";
      const quantity = Math.floor(random.uniform() * config.maxQuantity) + 1;
      const randomImpact = random.uniform();
      const requestedImpact = quantity * randomImpact * config.maxPriceImpact;
      const priceBefore = price;

      if (side === "BUY") {
        price += requestedImpact;
        buyOrders += 1;
      } else {
        price = Math.max(price - requestedImpact, 0.01);
        sellOrders += 1;
      }

      const floorHit = side === "SELL" && priceBefore - requestedImpact < 0.01;
      if (floorHit) floorHits += 1;

      volume += quantity;
      history.push(price);
      volumes.push(quantity);
      events.push({
        id: events.length + 1,
        day,
        outerTrade,
        trader,
        side,
        quantity,
        sentiment: currentSentiment,
        randomImpact,
        requestedImpact,
        realisedImpact: Math.abs(price - priceBefore),
        priceBefore,
        priceAfter: price,
        cumulativeVolume: volume,
        floorHit,
      });
    }

    if (outerTrade === TRADES_PER_DAY) {
      const firstHistoryIndex = history.length - EVENTS_PER_DAY - 1;
      const lastHistoryIndex = history.length - 1;
      const correctedWindow = history.slice(firstHistoryIndex, lastHistoryIndex + 1);
      const legacyWindow = history.slice(-TRADES_PER_DAY);
      const open = correctedWindow[0];
      const close = correctedWindow.at(-1) ?? open;

      dailyAudits.push({
        day,
        firstHistoryIndex,
        lastHistoryIndex,
        open,
        close,
        legacyWindow,
        correctedWindow,
        legacyReturn: percentageReturn(legacyWindow[0], close),
        correctedReturn: percentageReturn(open, close),
        legacyVolatility: sampleStandardDeviation(legacyWindow),
        correctedVolatility: sampleStandardDeviation(correctedWindow),
      });
    }
  }

  return {
    history,
    volumes,
    events,
    dailyAudits,
    price,
    volume,
    buyOrders,
    sellOrders,
    floorHits,
  };
}

function formatMoney(value: number, digits = 2) {
  return `$${value.toFixed(digits)}`;
}

function formatSigned(value: number, digits = 2) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(digits)}%`;
}

function linePoints(
  values: number[],
  width: number,
  height: number,
  padding: number,
  scaleMinimum = Math.min(...values),
  scaleMaximum = Math.max(...values),
) {
  const minimum = scaleMinimum;
  const maximum = scaleMaximum;
  const flat = Math.abs(maximum - minimum) < 0.000001;
  const span = Math.max(maximum - minimum, 0.000001);
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;

  return values
    .map((value, index) => {
      const x = padding + (index / Math.max(values.length - 1, 1)) * usableWidth;
      const y = flat ? padding + usableHeight / 2 : padding + ((maximum - value) / span) * usableHeight;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

function PriceTrace({
  history,
  audit,
  mode,
}: {
  history: number[];
  audit: DailyAudit | null;
  mode: MetricMode;
}) {
  const width = 820;
  const height = 254;
  const padding = 28;
  const sliceStart = Math.max(0, history.length - 201);
  const visible = history.slice(sliceStart);
  const minimum = Math.min(...visible);
  const maximum = Math.max(...visible);
  const points = linePoints(visible, width, height, padding, minimum, maximum);
  const movingWindow = Math.min(50, history.length);
  const movingAverage = history.map((_, index) => {
    const start = Math.max(0, index - movingWindow + 1);
    const window = history.slice(start, index + 1);
    return window.reduce((sum, value) => sum + value, 0) / window.length;
  }).slice(sliceStart);
  const movingAveragePoints = linePoints(movingAverage, width, height, padding, minimum, maximum);
  const lastPointCoordinates = points.split(" ").at(-1)?.split(",") ?? [String(width - padding), String(height / 2)];
  const xForIndex = (index: number) => {
    const relative = clamp(index - sliceStart, 0, Math.max(visible.length - 1, 1));
    return padding + (relative / Math.max(visible.length - 1, 1)) * (width - padding * 2);
  };
  const correctedStart = audit ? xForIndex(audit.firstHistoryIndex) : padding;
  const legacyStart = audit ? xForIndex(audit.lastHistoryIndex - (TRADES_PER_DAY - 1)) : width - padding;
  const chartEnd = audit ? xForIndex(audit.lastHistoryIndex) : width - padding;

  return (
    <div className={styles.chartShell}>
      <div className={styles.chartHeading}>
        <div>
          <span>PRICE TRACE · SYNTHETIC INSTRUMENT</span>
          <strong>{visible.length - 1} visible impact events</strong>
        </div>
        <div className={styles.windowLegend} aria-label="Metric window legend">
          <span data-tone="average">50-period mean</span>
          <span data-tone="corrected">Correct day</span>
          <span data-tone="legacy">Source window</span>
        </div>
      </div>
      <svg
        className={styles.priceChart}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Synthetic price trace from ${formatMoney(visible[0])} to ${formatMoney(visible.at(-1) ?? visible[0])}. Visible minimum ${formatMoney(minimum)}, maximum ${formatMoney(maximum)}.`}
      >
        <title>Synthetic single-stock price trace</title>
        <desc>
          This chart replays the Julia stochastic impact equations with a deterministic browser random-number generator. It is not real market data.
        </desc>
        {[0, 1, 2, 3, 4].map((row) => {
          const y = padding + (row / 4) * (height - padding * 2);
          return <line key={row} className={styles.gridLine} x1={padding} x2={width - padding} y1={y} y2={y} />;
        })}
        {audit ? (
          <>
            <rect
              className={`${styles.windowBand} ${styles.correctedBand}`}
              x={correctedStart}
              y={padding}
              width={Math.max(chartEnd - correctedStart, 2)}
              height={height - padding * 2}
              opacity={mode === "corrected" ? 0.2 : 0.08}
            />
            <rect
              className={`${styles.windowBand} ${styles.legacyBand}`}
              x={legacyStart}
              y={padding}
              width={Math.max(chartEnd - legacyStart, 2)}
              height={height - padding * 2}
              opacity={mode === "legacy" ? 0.26 : 0.1}
            />
          </>
        ) : null}
        <polyline className={styles.traceShadow} points={points} />
        <polyline className={styles.traceLine} points={points} />
        <polyline className={styles.movingAverage} points={movingAveragePoints} />
        <circle
          className={styles.lastPoint}
          cx={Number(lastPointCoordinates[0])}
          cy={Number(lastPointCoordinates[1])}
          r="4.5"
        />
        <text className={styles.axisText} x={padding} y={18}>{formatMoney(maximum)}</text>
        <text className={styles.axisText} x={padding} y={height - 8}>{formatMoney(minimum)}</text>
        <text className={styles.axisTextEnd} x={width - padding} y={height - 8}>event {history.length - 1}</text>
      </svg>
    </div>
  );
}

function MetricCard({ label, value, detail, tone = "neutral" }: { label: string; value: string; detail: string; tone?: "neutral" | "blue" | "green" | "amber" }) {
  return (
    <article className={styles.metricCard} data-tone={tone}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function AuditStatus({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return <span className={ok ? styles.pass : styles.fail}>{ok ? "PASS" : "CHECK"} · {children}</span>;
}

export function StockMarketStudio() {
  const [view, setView] = useState<ViewId>("lab");
  const [scenario, setScenario] = useState<ScenarioId | null>("source");
  const [config, setConfig] = useState<SimulationConfig>(SCENARIOS[0].config);
  const [batches, setBatches] = useState(10);
  const [metricMode, setMetricMode] = useState<MetricMode>("corrected");

  const result = useMemo(() => simulate(config, batches), [config, batches]);
  const latestAudit = result.dailyAudits.at(-1) ?? null;
  const buySellRatio = result.buyOrders / Math.max(result.sellOrders, 1);
  const overallReturn = percentageReturn(config.initialPrice, result.price);
  const overallVolatility = sampleStandardDeviation(result.history);
  const selectedDailyReturn = latestAudit
    ? metricMode === "legacy"
      ? latestAudit.legacyReturn
      : latestAudit.correctedReturn
    : null;
  const selectedDailyVolatility = latestAudit
    ? metricMode === "legacy"
      ? latestAudit.legacyVolatility
      : latestAudit.correctedVolatility
    : null;

  const volumeInvariant = result.volume === result.volumes.reduce((sum, quantity) => sum + quantity, 0);
  const countInvariant = result.buyOrders + result.sellOrders === result.history.length - 1;
  const historyInvariant = result.history.length === result.volumes.length;
  const floorInvariant = result.history.every((price) => price >= 0.01);
  const quantityInvariant = result.events.every((event) => event.quantity >= 1 && event.quantity <= config.maxQuantity);

  const selectScenario = (id: ScenarioId) => {
    const selected = SCENARIOS.find((item) => item.id === id) ?? SCENARIOS[0];
    setScenario(id);
    setConfig(selected.config);
    setBatches(10);
  };

  const updateConfig = (patch: Partial<SimulationConfig>) => {
    setScenario(null);
    setConfig((current) => ({ ...current, ...patch }));
  };

  const runNextDay = () => {
    setBatches((current) => {
      const remaining = current % TRADES_PER_DAY === 0 ? TRADES_PER_DAY : TRADES_PER_DAY - (current % TRADES_PER_DAY);
      return Math.min(current + remaining, MAX_BATCHES);
    });
  };

  return (
    <DemoWindow
      appName="Stockmarket.jl · audited browser port"
      title="Stochastic Market Impact Lab"
      status="SOURCE-AUDITED"
      statusTone="safe"
      className={styles.studio}
      footer={
        <>
          <span>PRIVATE REPOSITORY · NO EXPLICIT LICENCE · SOURCE NOT REDISTRIBUTED</span>
          <span>FICTIONAL PROCESS · NOT MARKET DATA OR FINANCIAL ADVICE</span>
        </>
      }
    >
      <section className={styles.provenanceBanner} aria-label="Source provenance notice">
        <span>JULIA CORE</span>
        <p>
          Faithful to the single-stock stochastic price-impact equations in <code>Stockmarket.jl</code>. The deterministic RNG,
          controls, chart, table and corrected metric window are browser adaptations.
        </p>
        <strong>NO ORDER BOOK</strong>
      </section>

      <nav className={styles.viewTabs} aria-label="Market impact lab views">
        {VIEW_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-current={view === option.id ? "page" : undefined}
            onClick={() => setView(option.id)}
          >
            <strong>{option.label}</strong>
            <span>{option.hint}</span>
          </button>
        ))}
      </nav>

      {view === "lab" ? (
        <div className={styles.labView}>
          <section className={styles.metricGrid} aria-label="Current simulation metrics">
            <MetricCard label="Synthetic price" value={formatMoney(result.price)} detail={`${formatSigned(overallReturn)} from P₀`} tone="blue" />
            <MetricCard label="Impact events" value={String(result.events.length)} detail={`${batches} outer trade loops`} />
            <MetricCard label="Share volume" value={result.volume.toLocaleString("en-GB")} detail="Σ submitted quantities" tone="green" />
            <MetricCard label="Buy / sell ratio" value={buySellRatio.toFixed(2)} detail="B ÷ max(S, 1)" />
            <MetricCard label="Price dispersion" value={overallVolatility.toFixed(4)} detail="sample std(history)" tone="amber" />
          </section>

          <section className={styles.scenarioPanel} aria-labelledby="scenario-heading">
            <div className={styles.sectionIntro}>
              <span>DETERMINISTIC REPLAY</span>
              <h3 id="scenario-heading">Choose an auditable scenario</h3>
              <p>Each preset reruns the same source equations from event zero. Seed control is an adaptation; the Julia script does not call <code>Random.seed!</code>.</p>
            </div>
            <div className={styles.scenarioButtons} role="group" aria-label="Simulation scenario">
              {SCENARIOS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={scenario === item.id}
                  onClick={() => selectScenario(item.id)}
                >
                  <strong>{item.label}</strong>
                  <span>{item.hint}</span>
                </button>
              ))}
            </div>
            <div className={styles.parameterGrid}>
              <label>
                <span>Replay seed <output>{config.seed}</output></span>
                <input
                  type="range"
                  min="1"
                  max="4096"
                  step="1"
                  value={config.seed}
                  onChange={(event) => updateConfig({ seed: Number(event.target.value) })}
                />
              </label>
              <label>
                <span>Initial price P₀ <output>{formatMoney(config.initialPrice)}</output></span>
                <input
                  type="range"
                  min="0.05"
                  max="150"
                  step="0.01"
                  value={config.initialPrice}
                  onChange={(event) => updateConfig({ initialPrice: Number(event.target.value) })}
                />
              </label>
              <label>
                <span>Maximum quantity Q <output>{config.maxQuantity}</output></span>
                <input
                  type="range"
                  min="1"
                  max="200"
                  step="1"
                  value={config.maxQuantity}
                  onChange={(event) => updateConfig({ maxQuantity: Number(event.target.value) })}
                />
              </label>
              <label>
                <span>Impact coefficient α <output>{config.maxPriceImpact.toFixed(3)}</output></span>
                <input
                  type="range"
                  min="0.001"
                  max="0.03"
                  step="0.001"
                  value={config.maxPriceImpact}
                  onChange={(event) => updateConfig({ maxPriceImpact: Number(event.target.value) })}
                />
              </label>
            </div>
            <div className={styles.runControls}>
              <button type="button" className={styles.primaryAction} onClick={() => setBatches((current) => Math.min(current + 1, MAX_BATCHES))} disabled={batches >= MAX_BATCHES}>
                Step one loop <span>+5 events</span>
              </button>
              <button type="button" onClick={runNextDay} disabled={batches >= MAX_BATCHES}>
                Run to day close <span>10 loops · 50 events</span>
              </button>
              <button type="button" onClick={() => setBatches(0)}>
                Reset ledger <span>same seed</span>
              </button>
            </div>
          </section>

          <div className={styles.marketGrid}>
            <div className={styles.traceColumn}>
              <PriceTrace history={result.history} audit={latestAudit} mode={metricMode} />
              <section className={styles.equationStrip} aria-label="Source price impact equations">
                <div><span>BUY</span><code>Pₜ = Pₜ₋₁ + q · u · α</code></div>
                <div><span>SELL</span><code>Pₜ = max(Pₜ₋₁ − q · u · α, 0.01)</code></div>
                <div><span>SIDE</span><code>buy ⇔ uₛ &lt; clamp(s + ε, .1, .9)</code></div>
              </section>
            </div>

            <section className={styles.tapePanel} aria-labelledby="tape-heading">
              <div className={styles.panelHeading}>
                <div><span>IMPACT EVENT TAPE</span><h3 id="tape-heading">Latest state mutations</h3></div>
                <strong>{result.floorHits} floor hits</strong>
              </div>
              <div className={styles.tableScroll} role="region" aria-label="Latest impact events" tabIndex={0}>
                <table className={styles.eventTable}>
                  <thead><tr><th>#</th><th>Side</th><th>Qty</th><th>Sent.</th><th>Δ requested</th><th>Price</th></tr></thead>
                  <tbody>
                    {result.events.length === 0 ? (
                      <tr><td colSpan={6} className={styles.emptyCell}>Ledger reset. Step one outer loop to emit five impact events.</td></tr>
                    ) : result.events.slice(-12).reverse().map((event) => (
                      <tr key={event.id} data-side={event.side.toLowerCase()}>
                        <td><span className={styles.eventId}>{event.id}</span><small>D{event.day} · T{event.outerTrade}.{event.trader}</small></td>
                        <td><strong>{event.side}</strong>{event.floorHit ? <em>FLOOR</em> : null}</td>
                        <td>{event.quantity}</td>
                        <td>{event.sentiment.toFixed(2)}</td>
                        <td>{formatMoney(event.requestedImpact, 4)}</td>
                        <td>{formatMoney(event.priceAfter, 4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className={styles.tapeNote}>“Trade” in the loop is not a matched transaction: there is no counterparty, bid, ask, resting order or execution price in the source.</p>
            </section>
          </div>

          <details className={styles.dataFallback}>
            <summary>Accessible price-series table <span>{result.history.length} observations</span></summary>
            <div className={styles.tableScroll} role="region" aria-label="Price history data" tabIndex={0}>
              <table>
                <thead><tr><th>History index</th><th>Price</th><th>Submitted quantity</th><th>Cumulative volume</th></tr></thead>
                <tbody>
                  {result.history.slice(-60).map((price, offset) => {
                    const index = Math.max(0, result.history.length - 60) + offset;
                    const cumulative = result.volumes.slice(0, index + 1).reduce((sum, quantity) => sum + quantity, 0);
                    return <tr key={index}><td>{index}</td><td>{formatMoney(price, 6)}</td><td>{result.volumes[index]}</td><td>{cumulative}</td></tr>;
                  })}
                </tbody>
              </table>
            </div>
          </details>
        </div>
      ) : null}

      {view === "window" ? (
        <div className={styles.windowView}>
          <section className={styles.modePanel} aria-labelledby="metric-window-heading">
            <div>
              <span>CALCULATION FORENSICS</span>
              <h3 id="metric-window-heading">Which daily window should the metric use?</h3>
              <p>The script records five prices for every outer “trade”, then indexes history as if it recorded one. Toggle the reporting lens; the simulated path does not change.</p>
            </div>
            <div className={styles.modeSwitch} role="group" aria-label="Daily metric window">
              <button type="button" aria-pressed={metricMode === "legacy"} onClick={() => setMetricMode("legacy")}>
                <strong>Source window</strong><span>10 prices · 9 transitions</span>
              </button>
              <button type="button" aria-pressed={metricMode === "corrected"} onClick={() => setMetricMode("corrected")}>
                <strong>Correct day</strong><span>51 prices · 50 transitions</span>
              </button>
            </div>
          </section>

          {latestAudit ? (
            <>
              <section className={styles.auditMetrics} aria-label={`Day ${latestAudit.day} metric comparison`}>
                <MetricCard label={`${metricMode === "legacy" ? "Source" : "Corrected"} daily return`} value={formatSigned(selectedDailyReturn ?? 0, 3)} detail={metricMode === "legacy" ? "last 10 stored prices" : "day open → day close"} tone={metricMode === "legacy" ? "amber" : "green"} />
                <MetricCard label={`${metricMode === "legacy" ? "Source" : "Corrected"} daily dispersion`} value={(selectedDailyVolatility ?? 0).toFixed(5)} detail="Statistics.std · n − 1" tone={metricMode === "legacy" ? "amber" : "green"} />
                <MetricCard label="Window coverage" value={metricMode === "legacy" ? "18%" : "100%"} detail={metricMode === "legacy" ? "9 of 50 transitions" : "50 of 50 transitions"} tone={metricMode === "legacy" ? "amber" : "green"} />
                <MetricCard label="Audited day" value={`Day ${latestAudit.day}`} detail={`${latestAudit.firstHistoryIndex} → ${latestAudit.lastHistoryIndex}`} />
              </section>
              <PriceTrace history={result.history} audit={latestAudit} mode={metricMode} />

              <div className={styles.auditGrid}>
                <section className={styles.derivationCard}>
                  <div className={styles.cardKicker}>SOURCE EXPRESSION</div>
                  <h3>Why the index is short by a factor of five</h3>
                  <code className={styles.codeBlock}>daily_return = (history[end] -{"\n"}  history[end-trades_per_day+1]) /{"\n"}  history[end-trades_per_day+1] * 100</code>
                  <ol>
                    <li><span>01</span><p><strong><code>trades_per_day = 10</code></strong> controls the outer loop.</p></li>
                    <li><span>02</span><p>Each outer loop calls <strong>five traders</strong>.</p></li>
                    <li><span>03</span><p>Every trader appends one new price, producing <strong>50 events per day</strong>.</p></li>
                    <li><span>04</span><p>The source slice keeps 10 prices: only <strong>nine of 50 daily transitions</strong>.</p></li>
                  </ol>
                </section>

                <section className={styles.comparisonCard}>
                  <div className={styles.cardKicker}>RECONCILIATION · DAY {latestAudit.day}</div>
                  <h3>Same path, different denominator</h3>
                  <div className={styles.tableScroll} role="region" aria-label="Legacy and corrected daily metric comparison" tabIndex={0}>
                    <table className={styles.comparisonTable}>
                      <thead><tr><th>Metric</th><th>Source</th><th>Corrected</th><th>Difference</th></tr></thead>
                      <tbody>
                        <tr><th>Open anchor</th><td>{formatMoney(latestAudit.legacyWindow[0], 4)}</td><td>{formatMoney(latestAudit.open, 4)}</td><td>{formatMoney(latestAudit.legacyWindow[0] - latestAudit.open, 4)}</td></tr>
                        <tr><th>Close</th><td>{formatMoney(latestAudit.close, 4)}</td><td>{formatMoney(latestAudit.close, 4)}</td><td>$0.0000</td></tr>
                        <tr><th>Return</th><td>{formatSigned(latestAudit.legacyReturn, 3)}</td><td>{formatSigned(latestAudit.correctedReturn, 3)}</td><td>{formatSigned(latestAudit.legacyReturn - latestAudit.correctedReturn, 3)}</td></tr>
                        <tr><th>Sample std</th><td>{latestAudit.legacyVolatility.toFixed(5)}</td><td>{latestAudit.correctedVolatility.toFixed(5)}</td><td>{(latestAudit.legacyVolatility - latestAudit.correctedVolatility).toFixed(5)}</td></tr>
                        <tr><th>Observations</th><td>{latestAudit.legacyWindow.length}</td><td>{latestAudit.correctedWindow.length}</td><td>−{latestAudit.correctedWindow.length - latestAudit.legacyWindow.length}</td></tr>
                      </tbody>
                    </table>
                  </div>
                  <p>The corrected dispersion includes the day-open price and all 50 post-event prices. This is an audit definition, not a claim that price-level standard deviation is a conventional return-volatility measure.</p>
                </section>
              </div>
            </>
          ) : (
            <section className={styles.emptyAudit}>
              <span>NO COMPLETED DAY</span>
              <h3>The daily-statistics code only runs after ten outer loops.</h3>
              <p>Return to the impact lab and run to day close to compare the source and corrected windows.</p>
              <button type="button" onClick={() => { runNextDay(); setView("window"); }}>Run to day close</button>
            </section>
          )}
        </div>
      ) : null}

      {view === "evidence" ? (
        <div className={styles.evidenceView}>
          <section className={styles.evidenceHero}>
            <div>
              <span>IMPLEMENTATION BOUNDARY</span>
              <h3>A stochastic impact model—not an exchange</h3>
              <p>Audit scope: the complete project repository tree, all reachable Git revisions, dangling-object scan, and homepage/CV copies across the local workspace. Only one 252-line Julia artifact implements this project.</p>
            </div>
            <strong>HIGH CONFIDENCE</strong>
          </section>

          <section className={styles.ledgerGrid} aria-label="Source and adaptation ledger">
            <article data-tone="source">
              <span>CODE-BACKED · JULIA</span>
              <h3>Present in Stockmarket.jl</h3>
              <ul>
                <li>One mutable state object for a single synthetic stock.</li>
                <li>Immediate quantity-scaled random price impacts.</li>
                <li>Buy/sell counters, cumulative quantity and price history.</li>
                <li>Daily random sentiment with Gaussian perturbation.</li>
                <li>Plots, sample standard deviation and a 50-period mean.</li>
              </ul>
            </article>
            <article data-tone="adapted">
              <span>BROWSER-ADAPTED · THIS DEMO</span>
              <h3>Added for inspection</h3>
              <ul>
                <li>Seeded xorshift replay and deterministic presets.</li>
                <li>SVG price trace and accessible data tables.</li>
                <li>Event-level requested versus realised impact tape.</li>
                <li>Correct full-day comparison window.</li>
                <li>Live invariant and claim-drift checks.</li>
              </ul>
            </article>
            <article data-tone="unsupported">
              <span>CV / HOMEPAGE COPY ONLY</span>
              <h3>Not found in source</h3>
              <ul>
                <li>Order book, bids, asks or price–time priority.</li>
                <li>Counterparties, fills or a matching algorithm.</li>
                <li>SQL schema, database or persistent orders.</li>
                <li>WebSocket server or streamed book updates.</li>
                <li>React trading UI, accounts or portfolio maths.</li>
              </ul>
            </article>
          </section>

          <div className={styles.evidenceGrid}>
            <section className={styles.capabilityCard}>
              <div className={styles.panelHeading}><div><span>CAPABILITY MATRIX</span><h3>Claim-to-code reconciliation</h3></div><strong>9 CHECKS</strong></div>
              <div className={styles.tableScroll} role="region" aria-label="Claim to source capability matrix" tabIndex={0}>
                <table className={styles.capabilityTable}>
                  <thead><tr><th>Capability</th><th>Evidence</th><th>Verdict</th></tr></thead>
                  <tbody>
                    <tr><td>Stochastic price impact</td><td><code>place_buy_order!</code> / <code>place_sell_order!</code></td><td><span data-verdict="present">PRESENT</span></td></tr>
                    <tr><td>Sentiment-biased side</td><td><code>rand() &lt; sentiment</code></td><td><span data-verdict="present">PRESENT</span></td></tr>
                    <tr><td>Quantity + volume counters</td><td><code>volume += quantity</code></td><td><span data-verdict="present">PRESENT</span></td></tr>
                    <tr><td>Resting order book</td><td>No order collection or price level</td><td><span data-verdict="absent">ABSENT</span></td></tr>
                    <tr><td>Price–time matching</td><td>No order ID, timestamp or match loop</td><td><span data-verdict="absent">ABSENT</span></td></tr>
                    <tr><td>Market-order execution</td><td>Price mutates without counterparty</td><td><span data-verdict="absent">ABSENT</span></td></tr>
                    <tr><td>SQL persistence</td><td>No schema, query or database dependency</td><td><span data-verdict="absent">ABSENT</span></td></tr>
                    <tr><td>WebSocket transport</td><td>No server, client or protocol code</td><td><span data-verdict="absent">ABSENT</span></td></tr>
                    <tr><td>Portfolio accounting</td><td>No cash, position, P&amp;L or account state</td><td><span data-verdict="absent">ABSENT</span></td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className={styles.invariantCard}>
              <div className={styles.panelHeading}><div><span>LIVE CALCULATION AUDIT</span><h3>State invariants</h3></div><strong>{result.events.length} EVENTS</strong></div>
              <div className={styles.invariantList}>
                <article><code>B + S = |history| − 1</code><AuditStatus ok={countInvariant}>{result.buyOrders} + {result.sellOrders} = {result.history.length - 1}</AuditStatus></article>
                <article><code>volume = Σ submitted q</code><AuditStatus ok={volumeInvariant}>{result.volume.toLocaleString("en-GB")} shares reconcile</AuditStatus></article>
                <article><code>|history| = |volumes|</code><AuditStatus ok={historyInvariant}>{result.history.length} = {result.volumes.length}</AuditStatus></article>
                <article><code>Pₜ ≥ $0.01</code><AuditStatus ok={floorInvariant}>minimum {formatMoney(Math.min(...result.history), 4)}</AuditStatus></article>
                <article><code>1 ≤ q ≤ Q</code><AuditStatus ok={quantityInvariant}>Q = {config.maxQuantity}</AuditStatus></article>
                <article><code>B / max(S, 1)</code><AuditStatus ok={Number.isFinite(buySellRatio)}>ratio {buySellRatio.toFixed(4)}</AuditStatus></article>
              </div>
              <p className={styles.floorCaveat}>At the $0.01 sell floor, the Julia function returns the requested impact even when the realised price change is smaller. This port preserves both values so the discrepancy is visible.</p>
            </section>
          </div>

          <section className={styles.auditTrail}>
            <div><span>AUTHORITATIVE ARTIFACT</span><strong>Stockmarket.jl · 252 lines</strong><small>First and only file commit: 9 Apr 2025</small></div>
            <div><span>HISTORY COVERAGE</span><strong>1 relevant commit</strong><small>No deleted or dangling exchange implementation found</small></div>
            <div><span>REPOSITORY BOUNDARY</span><strong>Private · no licence</strong><small>No public source action should be shown</small></div>
            <div><span>RNG BOUNDARY</span><strong>Browser deterministic</strong><small>Seeded replay does not reproduce Julia&apos;s default RNG stream</small></div>
          </section>
        </div>
      ) : null}
    </DemoWindow>
  );
}

export default StockMarketStudio;
