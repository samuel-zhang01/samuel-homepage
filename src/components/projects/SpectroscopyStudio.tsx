"use client";

import { type KeyboardEvent, useEffect, useId, useMemo, useRef, useState } from "react";
import { DemoWindow } from "./DemoChrome";
import styles from "./SpectroscopyStudio.module.css";

type TracePoint = { x: number; y: number };
type ExportFormat = "png" | "jpg" | "tif" | "pdf" | "eps";
type PlotColour = "red" | "green" | "blue" | "cyan" | "magenta" | "yellow" | "black";

const SOURCE_URL =
  "https://github.com/samuel-zhang01/CPROT-Spec-Fast-Plotter/tree/9c6496d7b3c9f67dad163bf6f289de5e22ed3fd0";
const TRACE_START = 2000;

const colourOptions: Array<{ value: PlotColour; label: string; stroke: string }> = [
  { value: "red", label: "Red", stroke: "#c32d3c" },
  { value: "green", label: "Green", stroke: "#16835d" },
  { value: "blue", label: "Blue", stroke: "#1e49a5" },
  { value: "cyan", label: "Cyan", stroke: "#008f9a" },
  { value: "magenta", label: "Magenta", stroke: "#b32e86" },
  { value: "yellow", label: "Yellow", stroke: "#a77a00" },
  { value: "black", label: "Black", stroke: "#151515" },
];

function gaussian(x: number, centre: number, width: number, amplitude: number) {
  return amplitude * Math.exp(-0.5 * ((x - centre) / width) ** 2);
}

const syntheticTrace: TracePoint[] = Array.from({ length: 1201 }, (_, index) => {
  const x = TRACE_START + index * 5;
  const floor = 0.00028 + 0.00008 * Math.sin(index * 0.73) + 0.000045 * Math.cos(index * 0.19);
  const y =
    floor +
    gaussian(x, 2380, 24, 0.012) +
    gaussian(x, 3170, 39, 0.020) +
    gaussian(x, 4180, 21, 0.008) +
    gaussian(x, 5175, 29, 0.043) +
    gaussian(x, 6350, 51, 0.027) +
    gaussian(x, 7420, 33, 0.017);
  return { x, y: Math.max(0, y) };
});

const fullTraceMaximum = Math.max(...syntheticTrace.map((point) => point.y));
const initialYRange: [number, number] = [0, fullTraceMaximum * 1.08];

function makeTicks(min: number, max: number, count: number) {
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) return [min];
  return Array.from({ length: count }, (_, index) => min + (index / (count - 1)) * (max - min));
}

function formatX(value: number, span: number) {
  if (span < 0.2) return value.toFixed(3);
  if (span < 20) return value.toFixed(2);
  if (span < 500) return value.toFixed(1);
  return Math.round(value).toLocaleString("en-GB");
}

function formatY(value: number) {
  return Math.abs(value) < 0.001 && value !== 0 ? value.toExponential(2) : value.toFixed(3);
}

function autoYRange(points: TracePoint[]): [number, number] {
  if (points.length === 0) return initialYRange;
  const maximum = Math.max(...points.map((point) => point.y));
  return [0, Math.max(0.001, maximum * 1.08)];
}

function slugify(value: string) {
  const safe = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return safe || "spectrum";
}

function SpectrumChart({
  loaded,
  points,
  xRange,
  yRange,
  title,
  xLabel,
  yLabel,
  colour,
  grid,
  legend,
  legendText,
}: {
  loaded: boolean;
  points: TracePoint[];
  xRange: [number, number];
  yRange: [number, number];
  title: string;
  xLabel: string;
  yLabel: string;
  colour: string;
  grid: boolean;
  legend: boolean;
  legendText: string;
}) {
  const rawId = useId();
  const clipId = `spec-clip-${rawId.replace(/:/g, "")}`;
  const [xMin, xMax] = xRange;
  const [yMin, yMax] = yRange;
  const xSpan = Math.max(0.000001, xMax - xMin);
  const ySpan = Math.max(0.000001, yMax - yMin);
  const plot = { left: 74, top: 44, width: 660, height: 270 };
  const xTicks = makeTicks(xMin, xMax, 6);
  const yTicks = makeTicks(yMin, yMax, 5);
  const xToSvg = (x: number) => plot.left + ((x - xMin) / xSpan) * plot.width;
  const yToSvg = (y: number) => plot.top + plot.height - ((y - yMin) / ySpan) * plot.height;
  const visibleWithEdges = points.filter((point) => point.x >= xMin - 5 && point.x <= xMax + 5);
  const path = visibleWithEdges
    .map((point, index) => `${index === 0 ? "M" : "L"}${xToSvg(point.x).toFixed(2)},${yToSvg(point.y).toFixed(2)}`)
    .join(" ");

  return (
    <svg className={styles.chart} viewBox="0 0 780 372" role="img" aria-labelledby={`${clipId}-title ${clipId}-description`}>
      <title id={`${clipId}-title`}>{title || "Untitled spectrum"}</title>
      <desc id={`${clipId}-description`}>
        {loaded
          ? `Synthetic two-column spectrum from ${formatX(xMin, xSpan)} to ${formatX(xMax, xSpan)} megahertz. ${points.length} total samples are loaded.`
          : "Empty plotting axes. Load the synthetic trace to begin."}
      </desc>
      <defs>
        <clipPath id={clipId}>
          <rect x={plot.left} y={plot.top} width={plot.width} height={plot.height} />
        </clipPath>
      </defs>
      <rect width="780" height="372" fill="#ececea" />
      <rect x={plot.left} y={plot.top} width={plot.width} height={plot.height} fill="#fff" stroke="#20211f" />
      <text x="404" y="24" textAnchor="middle" className={styles.chartTitle}>{title || "Title"}</text>

      {yTicks.map((tick) => {
        const y = yToSvg(tick);
        return (
          <g key={`y-${tick}`}>
            {grid ? <line x1={plot.left} x2={plot.left + plot.width} y1={y} y2={y} className={styles.gridLine} /> : null}
            <line x1={plot.left - 5} x2={plot.left} y1={y} y2={y} stroke="#292a28" />
            <text x={plot.left - 9} y={y + 3} textAnchor="end" className={styles.tickLabel}>{formatY(tick)}</text>
          </g>
        );
      })}

      {xTicks.map((tick) => {
        const x = xToSvg(tick);
        return (
          <g key={`x-${tick}`}>
            {grid ? <line x1={x} x2={x} y1={plot.top} y2={plot.top + plot.height} className={styles.gridLine} /> : null}
            <line x1={x} x2={x} y1={plot.top + plot.height} y2={plot.top + plot.height + 5} stroke="#292a28" />
            <text x={x} y={plot.top + plot.height + 17} textAnchor="middle" className={styles.tickLabel}>{formatX(tick, xSpan)}</text>
          </g>
        );
      })}

      <g clipPath={`url(#${clipId})`}>
        {loaded && path ? <path d={path} fill="none" stroke={colour} strokeWidth="1.7" vectorEffect="non-scaling-stroke" /> : null}
      </g>

      {!loaded ? (
        <g>
          <rect x="264" y="145" width="280" height="68" fill="#f4f4f0" stroke="#8f908b" strokeDasharray="5 4" />
          <text x="404" y="174" textAnchor="middle" className={styles.emptyTitle}>NO TRACE LOADED</text>
          <text x="404" y="192" textAnchor="middle" className={styles.emptyCopy}>Use “Load synthetic file” in the control panel.</text>
        </g>
      ) : null}

      {loaded && legend ? (
        <g transform="translate(565 59)">
          <rect width="150" height="29" fill="#fff" stroke="#696a66" />
          <line x1="10" x2="42" y1="14" y2="14" stroke={colour} strokeWidth="2" />
          <text x="50" y="18" className={styles.legendLabel}>{legendText || "Synthetic trace"}</text>
        </g>
      ) : null}

      <text x="404" y="360" textAnchor="middle" className={styles.axisLabel}>{xLabel || "X"}</text>
      <text x="18" y="179" textAnchor="middle" transform="rotate(-90 18 179)" className={styles.axisLabel}>{yLabel || "Y"}</text>
    </svg>
  );
}

function ControlField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className={styles.textField}>
      <span>{label}</span>
      <input type="text" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

export function SpectroscopyStudio() {
  const [loaded, setLoaded] = useState(true);
  const [plotTitle, setPlotTitle] = useState("Synthetic rotational spectrum");
  const [xLabel, setXLabel] = useState("Frequency (MHz)");
  const [yLabel, setYLabel] = useState("Intensity (a.u.)");
  const [showGrid, setShowGrid] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [legendText, setLegendText] = useState("Synthetic trace");
  const [plotColour, setPlotColour] = useState<PlotColour>("blue");
  const [centreDraft, setCentreDraft] = useState("5175");
  const [centre, setCentre] = useState(5175);
  const [fineRange, setFineRange] = useState(0.01);
  const [coarseRange, setCoarseRange] = useState(10);
  const [lowerDraft, setLowerDraft] = useState("5140");
  const [upperDraft, setUpperDraft] = useState("5210");
  const [xRange, setXRange] = useState<[number, number]>([5140, 5210]);
  const [yRange, setYRange] = useState<[number, number]>(() => autoYRange(syntheticTrace.filter((point) => point.x >= 5140 && point.x <= 5210)));
  const [format, setFormat] = useState<ExportFormat>("png");
  const [dpiDraft, setDpiDraft] = useState("600");
  const [exportOpen, setExportOpen] = useState(false);
  const [exportPrepared, setExportPrepared] = useState(false);
  const [message, setMessage] = useState("Synthetic two-column trace preloaded for a privacy-safe demonstration.");
  const exportTriggerRef = useRef<HTMLButtonElement>(null);
  const closeExportRef = useRef<HTMLButtonElement>(null);

  const selectedColour = colourOptions.find((option) => option.value === plotColour) ?? colourOptions[2];
  const visiblePoints = useMemo(
    () => (loaded ? syntheticTrace.filter((point) => point.x >= xRange[0] && point.x <= xRange[1]) : []),
    [loaded, xRange],
  );
  const visibleMaximum = visiblePoints.length
    ? visiblePoints.reduce((maximum, point) => (point.y > maximum.y ? point : maximum), visiblePoints[0])
    : null;
  const xSpan = xRange[1] - xRange[0];
  const ySpan = yRange[1] - yRange[0];
  const dpi = Math.min(1200, Math.max(72, Number(dpiDraft) || 600));
  const rasterFormat = format === "png" || format === "jpg" || format === "tif";

  useEffect(() => {
    if (exportOpen) closeExportRef.current?.focus();
  }, [exportOpen]);

  function closeExport() {
    setExportOpen(false);
    window.requestAnimationFrame(() => exportTriggerRef.current?.focus());
  }

  function handleDialogKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeExport();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>("button:not(:disabled), input:not(:disabled), select:not(:disabled), a[href]"),
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function loadOrEject() {
    if (loaded) {
      setLoaded(false);
      setExportPrepared(false);
      setMessage("Trace ejected. The source locks plot colour after loading; choose a colour, then reload.");
      return;
    }
    setLoaded(true);
    setCentre(5175);
    setCentreDraft("5175");
    setFineRange(0.01);
    setCoarseRange(10);
    setXRange([5140, 5210]);
    setLowerDraft("5140");
    setUpperDraft("5210");
    setYRange(autoYRange(syntheticTrace.filter((point) => point.x >= 5140 && point.x <= 5210)));
    setExportPrepared(false);
    setMessage("Loaded 1,201 synthetic rows × 2 numeric columns and focused the generated 5,175 MHz feature. No repository data was read.");
  }

  function applyCentre() {
    const nextCentre = Number(centreDraft);
    if (!Number.isFinite(nextCentre)) {
      setMessage("Centre rejected: enter a finite numeric frequency.");
      return;
    }
    const nextRange: [number, number] = [nextCentre - 1, nextCentre + 1];
    setCentre(nextCentre);
    setXRange(nextRange);
    setLowerDraft(String(nextRange[0]));
    setUpperDraft(String(nextRange[1]));
    const nextVisible = syntheticTrace.filter((point) => point.x >= nextRange[0] && point.x <= nextRange[1]);
    setYRange(autoYRange(nextVisible));
    setMessage("Source behavior reproduced: changing centre applies a ±1 MHz window and resets Y to auto.");
  }

  function applySymmetricRange(value: number, kind: "fine" | "coarse") {
    const nextRange: [number, number] = [centre - value, centre + value];
    setXRange(nextRange);
    setLowerDraft(String(Number(nextRange[0].toFixed(3))));
    setUpperDraft(String(Number(nextRange[1].toFixed(3))));
    setMessage(`${kind === "fine" ? "Fine" : "Coarse"} half-range set to ${value.toFixed(kind === "fine" ? 2 : 0)} MHz around ${centre.toFixed(2)} MHz.`);
  }

  function pan(delta: number) {
    const nextRange: [number, number] = [xRange[0] + delta, xRange[1] + delta];
    setXRange(nextRange);
    setLowerDraft(String(Number(nextRange[0].toFixed(3))));
    setUpperDraft(String(Number(nextRange[1].toFixed(3))));
    setMessage(`X window shifted ${delta > 0 ? "+" : ""}${delta} MHz without changing its ${xSpan.toFixed(2)} MHz width.`);
  }

  function nudgeY(delta: number) {
    const proposed = yRange[1] + delta;
    const safeguarded = Math.max(yRange[0] + 0.0001, proposed);
    setYRange([yRange[0], safeguarded]);
    setMessage(
      safeguarded !== proposed
        ? "Safety adaptation stopped the upper Y bound crossing the lower bound."
        : `Upper Y bound shifted ${delta > 0 ? "+" : ""}${delta.toFixed(3)}; lower bound is unchanged, matching the source callback.`,
    );
  }

  function applyDirectRange() {
    const lower = Number(lowerDraft);
    const upper = Number(upperDraft);
    if (!Number.isFinite(lower) || !Number.isFinite(upper) || lower >= upper) {
      setMessage("Range rejected: lower and upper must be finite, with lower < upper. This guard improves on the source error path.");
      return;
    }
    setXRange([lower, upper]);
    setMessage(`Direct X range applied: ${lower.toFixed(3)} to ${upper.toFixed(3)} MHz.`);
  }

  function resetView() {
    setLoaded(true);
    setCentre(5175);
    setCentreDraft("5175");
    setFineRange(0.01);
    setCoarseRange(10);
    setLowerDraft("5140");
    setUpperDraft("5210");
    setXRange([5140, 5210]);
    setYRange(autoYRange(syntheticTrace.filter((point) => point.x >= 5140 && point.x <= 5210)));
    setMessage("Generated 5,175 MHz focus window restored. Reset is a browser convenience, not a source control.");
  }

  function prepareExport() {
    setDpiDraft(String(dpi));
    setExportPrepared(true);
    setMessage(`Export preview prepared as ${format.toUpperCase()} at ${dpi} DPI. No file was written.`);
  }

  return (
    <DemoWindow
      appName="CPROT SPEC PLOTTER · WEB RECONSTRUCTION"
      title="Fast Spectroscopy Plotter"
      status={loaded ? "SYNTHETIC TRACE LOADED" : "WAITING FOR TRACE"}
      statusTone={loaded ? "safe" : "working"}
      className={styles.studio}
      footer={
        <>
          <span>MATLAB APP DESIGNER SOURCE · JUL 2022</span>
          <span>PUBLICLY VIEWABLE · NO EXPLICIT LICENCE</span>
        </>
      }
    >
      <div className={styles.provenanceBanner} role="note">
        <span>SOURCE-FAITHFUL REBUILD</span>
        <p>
          The original plots two numeric columns and changes presentation only. This exhibit uses a
          deterministic synthetic trace; it does not copy either bundled 240,000-row experiment file.
        </p>
        <strong>NO SPECTRAL PROCESSING CLAIMS</strong>
      </div>

      <section className={styles.application} aria-label="Interactive spectroscopy plotting workbench">
        <aside className={styles.leftPanel} aria-label="Plot presentation controls">
          <div className={styles.panelCap}><span>01</span><strong>PLOT SETUP</strong></div>
          <ControlField label="Plot title" value={plotTitle} onChange={setPlotTitle} />
          <ControlField label="X label" value={xLabel} onChange={setXLabel} />
          <ControlField label="Y label" value={yLabel} onChange={setYLabel} />

          <div className={styles.checks}>
            <label><input type="checkbox" checked={showGrid} onChange={(event) => setShowGrid(event.target.checked)} /> Grid</label>
            <label><input type="checkbox" checked={showLegend} onChange={(event) => setShowLegend(event.target.checked)} /> Legend</label>
          </div>
          {showLegend ? <ControlField label="Legend text" value={legendText} onChange={setLegendText} /> : null}

          <label className={styles.selectField}>
            <span>Plot colour</span>
            <select value={plotColour} disabled={loaded} onChange={(event) => setPlotColour(event.target.value as PlotColour)}>
              {colourOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <p className={styles.lockNote}>{loaded ? "Locked after load, matching source." : "Choose before loading."} “Magenta” safely corrects the source’s “megenta” typo.</p>

          <button className={styles.largeButton} type="button" onClick={loadOrEject}>
            <span aria-hidden="true">{loaded ? "↥" : "↧"}</span>
            {loaded ? "Eject synthetic file" : "Load synthetic file"}
          </button>
          <button ref={exportTriggerRef} className={styles.largeButton} type="button" disabled={!loaded} onClick={() => { setExportOpen(true); setExportPrepared(false); }}>
            <span aria-hidden="true">▣</span>
            Save as…
          </button>

          <div className={styles.fileCard}>
            <span>SYNTHETIC INPUT</span>
            <strong>rotational_demo.dat</strong>
            <dl>
              <div><dt>Rows</dt><dd>{loaded ? "1,201" : "—"}</dd></div>
              <div><dt>Columns</dt><dd>{loaded ? "2" : "—"}</dd></div>
              <div><dt>Network</dt><dd>none</dd></div>
            </dl>
          </div>
        </aside>

        <div className={styles.plotPanel}>
          <div className={styles.panelCap}><span>02</span><strong>FIGURE CANVAS</strong><em>ACCESSIBLE SVG</em></div>
          <div className={styles.chartFrame}>
            <SpectrumChart
              loaded={loaded}
              points={syntheticTrace}
              xRange={xRange}
              yRange={yRange}
              title={plotTitle}
              xLabel={xLabel}
              yLabel={yLabel}
              colour={selectedColour.stroke}
              grid={showGrid}
              legend={showLegend}
              legendText={legendText}
            />

            <div className={styles.yNudges} aria-label="Upper Y axis limit controls">
              <button type="button" onClick={() => nudgeY(0.01)} aria-label="Raise upper Y limit by 0.01" title="Upper Y +0.01">∧∧</button>
              <button type="button" onClick={() => nudgeY(0.001)} aria-label="Raise upper Y limit by 0.001" title="Upper Y +0.001">∧</button>
              <button type="button" onClick={() => nudgeY(-0.001)} aria-label="Lower upper Y limit by 0.001" title="Upper Y −0.001">∨</button>
              <button type="button" onClick={() => nudgeY(-0.01)} aria-label="Lower upper Y limit by 0.01" title="Upper Y −0.01">∨∨</button>
            </div>
          </div>

          <div className={styles.panRow} aria-label="Frequency pan controls">
            {[
              [-100, "<<<"],
              [-10, "<<"],
              [-0.1, "<"],
              [0.1, ">"],
              [10, ">>"],
              [100, ">>>"],
            ].map(([delta, label]) => (
              <button key={delta} type="button" onClick={() => pan(Number(delta))} aria-label={`Pan ${Number(delta) > 0 ? "right" : "left"} by ${Math.abs(Number(delta))} megahertz`} title={`${Number(delta) > 0 ? "+" : "−"}${Math.abs(Number(delta))} MHz`}>
                {label}
              </button>
            ))}
          </div>

          <div className={styles.rangeDeck}>
            <div className={styles.rangeInputs}>
              <label>
                <span>Centre MHz</span>
                <input
                  type="number"
                  value={centreDraft}
                  onChange={(event) => setCentreDraft(event.target.value)}
                  onKeyDown={(event) => { if (event.key === "Enter") applyCentre(); }}
                />
              </label>
              <button type="button" onClick={applyCentre}>Apply ±1</button>
              <div className={styles.boundFieldset} role="group" aria-labelledby="spec-range-label">
                <span id="spec-range-label" className={styles.boundLegend}>Range MHz</span>
                <span className={styles.boundPair}>
                  <label>
                    <span className={styles.srOnly}>Lower frequency bound</span>
                    <input type="number" step="0.1" value={lowerDraft} onChange={(event) => setLowerDraft(event.target.value)} />
                  </label>
                  <label>
                    <span className={styles.srOnly}>Upper frequency bound</span>
                    <input type="number" step="0.1" value={upperDraft} onChange={(event) => setUpperDraft(event.target.value)} />
                  </label>
                </span>
              </div>
              <button type="button" onClick={applyDirectRange}>Apply range</button>
            </div>

            <div className={styles.sliders}>
              <label>
                <span><b>Fine range</b><output htmlFor="spec-fine-range">±{fineRange.toFixed(2)} MHz</output></span>
                <input
                  id="spec-fine-range"
                  type="range"
                  min="0.01"
                  max="10.01"
                  step="0.5"
                  value={fineRange}
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    setFineRange(value);
                    applySymmetricRange(value, "fine");
                  }}
                />
              </label>
              <label>
                <span><b>Coarse range</b><output htmlFor="spec-coarse-range">±{coarseRange.toFixed(0)} MHz</output></span>
                <input
                  id="spec-coarse-range"
                  type="range"
                  min="10"
                  max="210"
                  step="10"
                  value={coarseRange}
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    setCoarseRange(value);
                    applySymmetricRange(value, "coarse");
                  }}
                />
              </label>
              <button type="button" onClick={resetView}>Reset full view</button>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.readoutBar} role="status" aria-live="polite">
        <span>STATUS</span>
        <p>{message}</p>
        <strong>{visiblePoints.length.toLocaleString("en-GB")} VISIBLE ROWS</strong>
      </div>

      <section className={styles.inspectionGrid} aria-label="Trace calculations and source boundary">
        <div className={styles.traceInspector}>
          <div className={styles.sectionHeading}>
            <div><span>ACCESSIBILITY ADAPTATION</span><h3>Visible trace ledger</h3></div>
            <strong>{xSpan.toFixed(xSpan < 20 ? 2 : 1)} MHz WINDOW</strong>
          </div>
          <div className={styles.metricRow}>
            <div><span>X range</span><strong>{formatX(xRange[0], xSpan)} → {formatX(xRange[1], xSpan)}</strong></div>
            <div><span>Y span</span><strong>{formatY(ySpan)}</strong></div>
            <div><span>Samples shown</span><strong>{visiblePoints.length.toLocaleString("en-GB")}</strong></div>
            <div><span>Max sample</span><strong>{visibleMaximum ? formatY(visibleMaximum.y) : "—"}</strong></div>
          </div>
          <div className={styles.tableWrap}>
            <table>
              <caption>Three deterministic samples summarising the currently visible trace</caption>
              <thead><tr><th scope="col">Position</th><th scope="col">Frequency / MHz</th><th scope="col">Intensity / a.u.</th></tr></thead>
              <tbody>
                <tr><th scope="row">First visible</th><td>{visiblePoints[0] ? visiblePoints[0].x.toFixed(2) : "—"}</td><td>{visiblePoints[0] ? visiblePoints[0].y.toExponential(4) : "—"}</td></tr>
                <tr><th scope="row">Maximum sample</th><td>{visibleMaximum ? visibleMaximum.x.toFixed(2) : "—"}</td><td>{visibleMaximum ? visibleMaximum.y.toExponential(4) : "—"}</td></tr>
                <tr><th scope="row">Last visible</th><td>{visiblePoints.at(-1) ? visiblePoints.at(-1)?.x.toFixed(2) : "—"}</td><td>{visiblePoints.at(-1) ? visiblePoints.at(-1)?.y.toExponential(4) : "—"}</td></tr>
              </tbody>
            </table>
          </div>
          <p>
            This ledger describes the SVG without relying on sight. It computes simple viewport summaries;
            it is not baseline correction, smoothing, normalisation or peak picking.
          </p>
        </div>

        <div className={styles.sourceLedger}>
          <div className={styles.sectionHeading}>
            <div><span>SOURCE CONTRACT</span><h3>Implemented vs deliberately absent</h3></div>
            <a href={SOURCE_URL} target="_blank" rel="noreferrer">Inspect repository ↗</a>
          </div>
          <ul>
            <li><span className={styles.present}>PRESENT</span><p>Two-column load, title and axis labels, grid, legend, seven plot colours.</p></li>
            <li><span className={styles.present}>PRESENT</span><p>Centre ±1, fine/coarse symmetric range, direct bounds and six exact X pan increments.</p></li>
            <li><span className={styles.present}>PRESENT</span><p>Upper-Y nudges and PNG/JPG/TIF/PDF/EPS export at prompted DPI, default 600.</p></li>
            <li><span className={styles.absent}>ABSENT</span><p>No evidenced baseline correction, smoothing, normalisation, integration or peak picking.</p></li>
            <li><span className={styles.adapted}>ADAPTED</span><p>Synthetic preload, inline legend naming, validation, reset, accessible ledger and export preview are browser safety improvements.</p></li>
          </ul>
        </div>
      </section>

      {exportOpen ? (
        <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeExport(); }}>
          <section className={styles.exportDialog} role="dialog" aria-modal="true" aria-labelledby="spec-export-title" onKeyDown={handleDialogKeyDown}>
            <div className={styles.dialogTitlebar}>
              <button ref={closeExportRef} type="button" onClick={closeExport} aria-label="Close export preview">×</button>
              <strong id="spec-export-title">SAVE AS · EXPORT PREVIEW</strong>
              <span aria-hidden="true" />
            </div>
            <div className={styles.dialogBody}>
              <div className={styles.exportFields}>
                <label>
                  <span>Format</span>
                  <select value={format} onChange={(event) => { setFormat(event.target.value as ExportFormat); setExportPrepared(false); }}>
                    <option value="png">PNG</option>
                    <option value="jpg">JPG</option>
                    <option value="tif">TIF</option>
                    <option value="pdf">PDF</option>
                    <option value="eps">EPS</option>
                  </select>
                </label>
                <label>
                  <span>Resolution / DPI</span>
                  <input type="number" min="72" max="1200" value={dpiDraft} onChange={(event) => { setDpiDraft(event.target.value); setExportPrepared(false); }} />
                </label>
              </div>

              <div className={styles.exportPreview}>
                <div className={styles.paperPreview}>
                  <div className={styles.miniPlot}>
                    <span>{plotTitle || "Title"}</span>
                    <i style={{ borderColor: selectedColour.stroke }} />
                  </div>
                </div>
                <dl>
                  <div><dt>Filename</dt><dd>{slugify(plotTitle)}.{format}</dd></div>
                  <div><dt>Canvas</dt><dd>7.5 × 3.5 in preview</dd></div>
                  <div><dt>{rasterFormat ? "Raster size" : "Output mode"}</dt><dd>{rasterFormat ? `${Math.round(7.5 * dpi).toLocaleString("en-GB")} × ${Math.round(3.5 * dpi).toLocaleString("en-GB")} px` : "vector container"}</dd></div>
                  <div><dt>Resolution</dt><dd>{dpi} DPI</dd></div>
                </dl>
              </div>

              {exportPrepared ? (
                <div className={styles.exportReady} role="status">
                  <span>✓</span>
                  <p><strong>Preview manifest ready.</strong> The original calls MATLAB <code>exportgraphics</code>; this portfolio does not write or download a substitute file.</p>
                </div>
              ) : null}
              <p className={styles.dialogNote}>The 7.5 × 3.5 inch canvas and input guards are showcase adaptations. Supported formats and the default 600 DPI come directly from the source callback.</p>
            </div>
            <div className={styles.dialogActions}>
              <button type="button" onClick={closeExport}>Cancel</button>
              <button type="button" onClick={prepareExport}>Prepare preview</button>
            </div>
          </section>
        </div>
      ) : null}
    </DemoWindow>
  );
}

export default SpectroscopyStudio;
