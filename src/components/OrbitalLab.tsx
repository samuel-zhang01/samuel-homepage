"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent, type SetStateAction } from "react";
import type { Locale } from "@/lib/i18n";
import { elements, getOrbitalSamples, getRadialDistribution, orbitalLabel, orbitalNodes, ORBITAL_SOURCES, type ElementRecord } from "@/lib/orbitals";
import ClassicSelect from "./ClassicSelect";
import OrbitalSurfaceCanvas from "./OrbitalSurfaceCanvas";
import { orbitalCopies } from "./orbitalI18n";
import styles from "./OrbitalLab.module.css";
import { advanceOrbitalRotation, runOrbitalAnimation, type OrbitalAngles } from "@/lib/orbitalAnimation";

const letters = ["s", "p", "d", "f"];
const initialAngles = { yaw: -1.5, pitch: -.25 };

function tablePosition(element: ElementRecord) {
  if (element.number >= 57 && element.number <= 71) return { gridColumn: element.number - 53, gridRow: 9 };
  if (element.number >= 89 && element.number <= 103) return { gridColumn: element.number - 85, gridRow: 10 };
  return { gridColumn: element.group ?? 3, gridRow: element.period + 1 };
}

function turnPoint(x: number, y: number, z: number, yaw: number, pitch: number) {
  const horizontal = x * Math.cos(yaw) + z * Math.sin(yaw);
  const depth = -x * Math.sin(yaw) + z * Math.cos(yaw);
  return [horizontal, y * Math.cos(pitch) - depth * Math.sin(pitch), y * Math.sin(pitch) + depth * Math.cos(pitch)];
}

export default function OrbitalLab({ locale, active = true }: { locale: Locale; active?: boolean }) {
  const c = orbitalCopies[locale];
  const [atomicNumber, setAtomicNumber] = useState(6);
  const [shellKey, setShellKey] = useState("2-1");
  const [m, setM] = useState(0);
  const [phaseInk, setPhaseInk] = useState(true);
  const [slice, setSlice] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [angles, setAngleState] = useState(initialAngles);
  const cameraRef = useRef<OrbitalAngles>(initialAngles);
  const frameRef = useRef<((view: OrbitalAngles) => void) | null>(null);
  const compassRef = useRef<SVGSVGElement>(null);
  const setAngles = useCallback((update: SetStateAction<OrbitalAngles>) => {
    const next = typeof update === "function" ? update(cameraRef.current) : update;
    cameraRef.current = next;
    frameRef.current?.(next);
    setAngleState({ ...next });
  }, []);
  const [status, setStatus] = useState("");
  const [compactCanvas, setCompactCanvas] = useState(false);
  const [renderMode, setRenderMode] = useState<"ascii" | "points" | "surface">("ascii");
  const [opacity, setOpacity] = useState(.45);
  const [tableOpen, setTableOpen] = useState(false);
  const [ultra, setUltra] = useState(false);
  const [canvasPixels, setCanvasPixels] = useState(960);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const periodicRef = useRef<HTMLDetailsElement>(null);
  const asciiRef = useRef("");
  const dragRef = useRef<{ id: number; x: number; y: number; yaw: number; pitch: number } | null>(null);
  const element = elements[atomicNumber - 1];
  const subshell = element.configuration.find((shell) => `${shell.n}-${shell.l}` === shellKey) ?? element.configuration.at(-1)!;
  const component = Math.max(-subshell.l, Math.min(subshell.l, m));
  const cloud = useMemo(() => getOrbitalSamples(subshell.n, subshell.l, component, 12_000), [subshell.n, subshell.l, component]);
  const radial = useMemo(() => getRadialDistribution(subshell.n, subshell.l), [subshell.n, subshell.l]);
  const nodes = orbitalNodes(subshell.n, subshell.l);
  const label = orbitalLabel(subshell.n, subshell.l, component);
  const shellName = `${subshell.n}${letters[subshell.l]}`;
  const cellColumns = compactCanvas ? ultra ? 128 : 96 : ultra ? 240 : 160;
  const cellRows = Math.round(cellColumns * (compactCanvas ? .6 : .45));
  const cellHeight = 10;
  const width = cellColumns * 6;
  const height = cellRows * cellHeight;
  const surfaceHeight = Math.round(canvasPixels * (compactCanvas ? 1 : .75));
  const asciiHeight = Math.round(canvasPixels * height / width);
  const unavailable = useCallback(() => { setRenderMode("ascii"); setSpinning(false); setStatus(c.unavailable); }, [c.unavailable]);
  const paintCompass = useCallback((view: OrbitalAngles) => {
    const axes = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    Array.from(compassRef.current?.children ?? []).forEach((group, index) => {
      const axis = axes[index];
      const [x, y] = turnPoint(axis[0], axis[1], axis[2], view.yaw, view.pitch);
      const [line, dot, text] = Array.from(group.children);
      line.setAttribute("x2", String(42 + x * 24)); line.setAttribute("y2", String(42 - y * 24));
      dot.setAttribute("cx", String(42 + x * 24)); dot.setAttribute("cy", String(42 - y * 24));
      const short = Math.hypot(x, y) < .45;
      text.setAttribute("x", String(short ? 51 : 42 + x * 34)); text.setAttribute("y", String(short ? 55 : 46 - y * 34));
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const measure = () => {
      const cssWidth = canvas.getBoundingClientRect().width;
      setCompactCanvas(cssWidth < 560);
      setCanvasPixels(Math.max(320, Math.min(2560, Math.round(cssWidth * Math.min(3, window.devicePixelRatio || 1)))));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(canvas);
    window.addEventListener("resize", measure);
    return () => { observer.disconnect(); window.removeEventListener("resize", measure); };
  }, [renderMode]);

  function selectElement(number: number) {
    const next = elements[Math.min(118, Math.max(1, number)) - 1];
    const last = [...next.configuration].sort((a, b) => (a.n + a.l) - (b.n + b.l) || a.n - b.n).at(-1)!;
    setAtomicNumber(next.number);
    setShellKey(`${last.n}-${last.l}`);
    setM(0);
    setStatus("");
  }

  useEffect(() => {
    if (!active) setSpinning(false);
  }, [active]);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stopHidden = () => { if (document.hidden) setSpinning(false); };
    const stopMotion = () => { if (motion.matches) setSpinning(false); };
    document.addEventListener("visibilitychange", stopHidden);
    motion.addEventListener("change", stopMotion);
    return () => {
      document.removeEventListener("visibilitychange", stopHidden);
      motion.removeEventListener("change", stopMotion);
    };
  }, []);

  useEffect(() => {
    if (!spinning || !active || document.hidden) return;
    return runOrbitalAnimation((elapsed) => {
      cameraRef.current = advanceOrbitalRotation(cameraRef.current, elapsed);
      frameRef.current?.(cameraRef.current);
      paintCompass(cameraRef.current);
    });
  }, [active, spinning, paintCompass]);

  useEffect(() => { paintCompass(cameraRef.current); }, [angles, renderMode, paintCompass]);

  useEffect(() => {
    if (renderMode !== "ascii") return;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const density = new Float32Array(cellColumns * cellRows);
    const sign = new Float32Array(cellColumns * cellRows);
    const draw = (view: OrbitalAngles) => {
      // Draw text at backing-store resolution, never stretch an old low-res bitmap.
      context.setTransform(canvasPixels / width, 0, 0, asciiHeight / height, 0, 0);
      density.fill(0); sign.fill(0);
      const cyaw = Math.cos(view.yaw), syaw = Math.sin(view.yaw);
      const cpitch = Math.cos(view.pitch), spitch = Math.sin(view.pitch);
      const scale = Math.min(width, height) * .46 / cloud.radius;
      for (const point of cloud.points) {
        if (slice && Math.abs(point.z) > cloud.radius * .065) continue;
        const x = point.x * cyaw + point.z * syaw;
        const y = point.y * cpitch - (-point.x * syaw + point.z * cyaw) * spitch;
        const column = cellColumns / 2 + x * scale / 6 - .5;
        const row = cellRows / 2 - y * scale / cellHeight - .5;
        // Bilinear splatting preserves sample weight while reducing grid flicker.
        for (let dy = 0; dy <= 1; dy++) for (let dx = 0; dx <= 1; dx++) {
          const cx = Math.floor(column) + dx, cy = Math.floor(row) + dy;
          if (cx < 0 || cx >= cellColumns || cy < 0 || cy >= cellRows) continue;
          const weight = (1 - Math.abs(column - cx)) * (1 - Math.abs(row - cy));
          const index = cy * cellColumns + cx;
          density[index] += weight;
          sign[index] += point.phase * weight;
        }
      }
      context.fillStyle = "#fffff3";
      context.fillRect(0, 0, width, height);
      context.strokeStyle = "#d3d3c5";
      context.setLineDash([2, 5]);
      context.beginPath();
      context.moveTo(width / 2, 14); context.lineTo(width / 2, height - 14);
      context.moveTo(14, height / 2); context.lineTo(width - 14, height / 2);
      context.stroke();
      context.setLineDash([]);
      context.font = "10px Monaco, Courier New, monospace";
      context.textAlign = "center";
      context.textBaseline = "middle";
      let maximum = 1;
      for (const value of density) maximum = Math.max(maximum, value);
      const ramp = ".:-=+*#%@";
      const rows: string[] = [];
      for (let row = 0; row < cellRows; row++) {
        let line = "";
        for (let column = 0; column < cellColumns; column++) {
          const index = row * cellColumns + column;
          if (density[index] === 0) { line += " "; continue; }
          const value = Math.min(ramp.length - 1, Math.floor(Math.sqrt(density[index] / maximum) * (ramp.length - 1)));
          const glyph = ramp[value];
          context.fillStyle = phaseInk ? sign[index] >= 0 ? "#11177a" : "#99412c" : "#111";
          context.fillText(glyph, column * 6 + 3, row * cellHeight + cellHeight / 2);
          line += phaseInk ? sign[index] >= 0 ? ".:+#"[Math.min(3, Math.floor(value / 2))] : ",;-="[Math.min(3, Math.floor(value / 2))] : glyph;
        }
        rows.push(line.trimEnd());
      }
      asciiRef.current = rows.join("\n");
    };
    frameRef.current = draw;
    draw(cameraRef.current);
    return () => { if (frameRef.current === draw) frameRef.current = null; };
  }, [cloud, angles, phaseInk, slice, renderMode, cellColumns, cellRows, cellHeight, width, height, canvasPixels, asciiHeight]);

  function adjust(yaw: number, pitch: number) {
    setSpinning(false);
    setAngles((current) => ({ yaw: current.yaw + yaw, pitch: Math.max(-Math.PI / 2, Math.min(Math.PI / 2, current.pitch + pitch)) }));
  }
  function handleKeys(event: KeyboardEvent<HTMLCanvasElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const delta = event.shiftKey ? .4 : .15;
    if (event.key === "ArrowLeft") adjust(-delta, 0);
    else if (event.key === "ArrowRight") adjust(delta, 0);
    else if (event.key === "ArrowUp") adjust(0, delta);
    else if (event.key === "ArrowDown") adjust(0, -delta);
    else if (event.key === "Home") { setSpinning(false); setAngles(initialAngles); }
    else return;
    event.preventDefault(); event.stopPropagation();
  }
  function beginDrag(event: PointerEvent<HTMLCanvasElement>) {
    if (!event.isPrimary || event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.focus({ preventScroll: true });
    dragRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY, ...cameraRef.current };
    setSpinning(false);
  }
  function moveDrag(event: PointerEvent<HTMLCanvasElement>) {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    setAngles({ yaw: drag.yaw + (event.clientX - drag.x) * .012, pitch: Math.max(-Math.PI / 2, Math.min(Math.PI / 2, drag.pitch + (event.clientY - drag.y) * .012)) });
  }
  function saveAscii() {
    const config = element.configuration.map((shell) => `${shell.n}${letters[shell.l]}${shell.electrons}`).join(" ");
    const text = `${element.number} ${element.symbol} — ${element.name}\n${c.configuration}: ${config}\n${element.configurationStatus === "reference" ? c.reference : c.illustrative}\n${label} | n=${subshell.n}, l=${subshell.l}, real m=${component}\n${c.scale}\n${slice ? c.slice : c.density}\n\n${asciiRef.current}\n\n${phaseInk ? `${c.positive}: .:+# | ${c.negative}: ,;-=\n` : ""}${c.modelBody}\n${c.phaseBody}\n${c.projectionBody}\n${c.scaleBody}\n${c.configBody}\n\n${ORBITAL_SOURCES.configurations}\n${ORBITAL_SOURCES.elementIndex}\n${ORBITAL_SOURCES.hydrogen}\n`;
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = `orbital-${element.symbol}-${subshell.n}${letters[subshell.l]}-${component}.txt`;
    anchor.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
    setStatus(c.saved);
  }
  function saveImage() {
    if (canvasRef.current?.dataset.ready !== "true") { setStatus(c.loading); return; }
    canvasRef.current?.toBlob((blob) => {
      if (!blob) { setStatus(c.unavailable); return; }
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url; anchor.download = `orbital-${element.symbol}-${shellName}-${component}.png`;
      anchor.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
      setStatus(c.imageSaved);
    }, "image/png");
  }
  const canvasProps = {
    tabIndex: 0, role: "img" as const,
    "aria-label": `${renderMode === "ascii" ? c.canvas : renderMode === "points" ? c.pointsCanvas : c.surfaceCanvas}: ${label}; n=${subshell.n}, l=${subshell.l}, m=${component}. ${c.drag}`,
    onKeyDown: handleKeys, onPointerDown: beginDrag, onPointerMove: moveDrag,
    onPointerUp: () => { dragRef.current = null; }, onPointerCancel: () => { dragRef.current = null; }, onLostPointerCapture: () => { dragRef.current = null; },
  };
  const radialMaximum = Math.max(...radial.map((point) => point.probability), .00001);
  const radialEnd = radial.at(-1)?.r ?? 1;
  const radialPath = radial.map((point, index) => `${index ? "L" : "M"}${(12 + point.r / radialEnd * 256).toFixed(2)},${(82 - point.probability / radialMaximum * 66).toFixed(2)}`).join(" ");
  const orbitalsInSubshell = 2 * subshell.l + 1;
  const shellCounts = Array.from({ length: Math.max(...element.configuration.map((shell) => shell.n)) }, (_, index) => element.configuration.filter((shell) => shell.n === index + 1).reduce((sum, shell) => sum + shell.electrons, 0));

  return <div className={styles.app}>
    <header className={styles.header}>
      <div><span>{c.strap}</span><h3>{c.title}</h3><p>{c.intro}</p></div>
      <div className={styles.presets} aria-label={c.subshell}>{[[1, "H · 1s", "1-0"], [6, "C · 2p", "2-1"], [26, "Fe · 3d", "3-2"], [58, "Ce · 4f", "4-3"]].map(([number, title, shell]) => <button key={number} type="button" onClick={() => { selectElement(Number(number)); setShellKey(String(shell)); }}>{title}</button>)}</div>
    </header>
    <details className={styles.periodic} ref={periodicRef} open={tableOpen} onToggle={(event) => setTableOpen(event.currentTarget.open)}>
      <summary>{c.periodic}<span>{element.number} · {element.symbol}</span></summary><p>{c.tableHint}</p>
      <div className={styles.tableSelection}><span role="status">{element.number} · {element.symbol} · {label}</span><button type="button" onClick={() => { setTableOpen(false); window.requestAnimationFrame(() => { canvasRef.current?.scrollIntoView({ block: "center" }); canvasRef.current?.focus({ preventScroll: true }); }); }}>{c.viewOrbital} ↓</button></div>
      <div className={styles.tableScroll}>
        <div className={styles.table} role="group" aria-label={c.periodic}>
          {Array.from({ length: 18 }, (_, index) => <span key={`group-${index}`} style={{ gridColumn: index + 2, gridRow: 1 }} className={styles.groupNumber} title={`${c.group} ${index + 1}`}>{index + 1}</span>)}
          {Array.from({ length: 7 }, (_, index) => <span key={`period-${index}`} style={{ gridColumn: 1, gridRow: index + 2 }} className={styles.periodNumber} title={`${c.period} ${index + 1}`}>{index + 1}</span>)}
          <div className={styles.tableKey} aria-label={c.blockKey}>{letters.map((block) => <span key={block}><i data-block={block} />{block}</span>)}<a href={ORBITAL_SOURCES.elementIndex} target="_blank" rel="noreferrer">{c.referenceDetails} ↗</a></div>
          <span style={{ gridColumn: 4, gridRow: 7 }} className={styles.seriesPlaceholder}>57–71</span><span style={{ gridColumn: 4, gridRow: 8 }} className={styles.seriesPlaceholder}>89–103</span>
          <span className={styles.seriesName} style={{ gridColumn: "2 / 5", gridRow: 9 }}>{c.lanthanoids}</span><span className={styles.seriesName} style={{ gridColumn: "2 / 5", gridRow: 10 }}>{c.actinoids}</span>
          {elements.map((entry) => <button type="button" key={entry.number} style={{ ...tablePosition(entry), gridColumn: tablePosition(entry).gridColumn + 1 }} data-block={entry.block} aria-pressed={entry.number === atomicNumber} tabIndex={entry.number === atomicNumber ? 0 : -1} aria-label={`${entry.number} ${entry.symbol}, ${entry.name}`} title={`${entry.number} ${entry.name} · ${c.period} ${entry.period} · ${c.block} ${entry.block}`} onClick={() => selectElement(entry.number)} onKeyDown={(event) => {
            let number = entry.number;
            if (event.key === "ArrowLeft") number--; else if (event.key === "ArrowRight") number++;
            else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
              const here = tablePosition(entry);
              const direction = event.key === "ArrowUp" ? -1 : 1;
              const target = elements.filter((candidate) => { const position = tablePosition(candidate); return position.gridColumn === here.gridColumn && (position.gridRow - here.gridRow) * direction > 0; }).sort((a, b) => direction * (tablePosition(a).gridRow - tablePosition(b).gridRow))[0];
              if (target) number = target.number;
            } else if (event.key === "Home") number = 1; else if (event.key === "End") number = 118; else return;
            event.preventDefault(); number = Math.max(1, Math.min(118, number)); selectElement(number);
            event.currentTarget.parentElement?.querySelector<HTMLButtonElement>(`[data-element="${number}"]`)?.focus();
          }} data-element={entry.number}><small>{entry.number}</small><strong>{entry.symbol}</strong></button>)}
        </div>
      </div>
    </details>
    <div className={styles.workbench}>
      <section className={styles.viewer} aria-label={c.density}>
        <header className={styles.instrumentLabel}><strong>{c.density}</strong><span>{label}</span></header>
        <div className={styles.renderControls}>
          <div role="group" aria-label={c.renderMode}>{(["ascii", "points", "surface"] as const).map((mode) => <button type="button" key={mode} aria-pressed={renderMode === mode} onClick={() => { setRenderMode(mode); setStatus(""); }}>{mode === "ascii" ? c.asciiMode : mode === "points" ? c.pointsMode : c.surfaceMode}</button>)}</div>
          {renderMode === "ascii" && <label><span>{c.detail}</span><ClassicSelect value={ultra ? "ultra" : "fine"} onChange={(event) => setUltra(event.target.value === "ultra")}><option value="fine">{c.fine}</option><option value="ultra">{c.ultra}</option></ClassicSelect></label>}
        </div>
        <div className={styles.canvasFrame}>
          {renderMode === "ascii" ? <canvas {...canvasProps} key="ascii" ref={canvasRef} width={canvasPixels} height={asciiHeight} data-renderer="ascii" data-columns={cellColumns} data-rows={cellRows} /> : <OrbitalSurfaceCanvas {...canvasProps} key="3d" canvasRef={canvasRef} cameraRef={cameraRef} frameRef={frameRef} width={canvasPixels} height={surfaceHeight} n={subshell.n} l={subshell.l} m={component} yaw={angles.yaw} pitch={angles.pitch} phaseInk={phaseInk} slice={slice} representation={renderMode} cloud={cloud} opacity={opacity} loadingLabel={c.loading} onUnavailable={unavailable} />}
          <svg ref={compassRef} className={styles.compass} viewBox="0 0 84 84" aria-hidden="true">{[["x", [1, 0, 0]], ["y", [0, 1, 0]], ["z", [0, 0, 1]]].map(([name, axis]) => {
            const [x, y] = turnPoint(...(axis as [number, number, number]), angles.yaw, angles.pitch);
            const short = Math.hypot(x, y) < .45;
            return <g key={String(name)}><line x1="42" y1="42" x2={42 + x * 24} y2={42 - y * 24} /><circle cx={42 + x * 24} cy={42 - y * 24} r="1.5" /><text x={short ? 51 : 42 + x * 34} y={short ? 55 : 46 - y * 34}>{name}</text></g>;
          })}</svg>
        </div>
        {renderMode === "points" && <label className={styles.opacityControl}><span>{c.opacity}</span><input type="range" min="10" max="80" step="5" value={Math.round(opacity * 100)} onChange={(event) => setOpacity(Number(event.target.value) / 100)} /><output>{Math.round(opacity * 100)}%</output></label>}
        <div className={styles.legend}><span>{c.scale}</span>{phaseInk && <span><i />{c.positive} <i />{c.negative}</span>}</div>
        <div className={styles.viewOptions}><label><input type="checkbox" checked={phaseInk} onChange={(event) => setPhaseInk(event.target.checked)} />{c.phase}</label><label><input type="checkbox" checked={slice} onChange={(event) => setSlice(event.target.checked)} />{c.slice}</label></div>
        <div className={styles.transport}>
          <div><button type="button" aria-label={c.left} onClick={() => adjust(-.2, 0)}>←</button><button type="button" aria-label={c.right} onClick={() => adjust(.2, 0)}>→</button><button type="button" aria-label={c.up} onClick={() => adjust(0, .2)}>↑</button><button type="button" aria-label={c.down} onClick={() => adjust(0, -.2)}>↓</button></div>
          <button type="button" aria-pressed={spinning} onClick={() => setSpinning(!spinning)}>{spinning ? c.pause : c.rotate}</button>
          <button type="button" onClick={() => { setAngles(initialAngles); setSpinning(false); }}>{c.reset}</button>
          <button type="button" onClick={renderMode === "ascii" ? saveAscii : saveImage}>{renderMode === "ascii" ? c.save : c.saveImage}</button>
        </div>
        <p className={styles.hint}>{c.drag} {c.motion}</p>
        {renderMode === "surface" && <p className={styles.hint}>{c.surfaceNote}</p>}
        {renderMode === "points" && <p className={styles.hint}>{c.pointsNote}</p>}
        {slice && <p className={styles.hint}>{c.sliceNote}</p>}
        <span className={styles.status} role="status">{status}</span>
      </section>
      <aside className={styles.inspector}>
        <label className={styles.elementPicker}><span>{c.element}</span><ClassicSelect value={atomicNumber} onChange={(event) => selectElement(Number(event.target.value))}>{elements.map((entry) => <option key={entry.number} value={entry.number} lang="en-GB">{entry.number} · {entry.symbol} — {entry.name}</option>)}</ClassicSelect></label>
        <div className={styles.elementCard}><button type="button" onClick={() => selectElement(atomicNumber - 1)} disabled={atomicNumber === 1} aria-label={c.previous}>‹</button><div><small>{atomicNumber}</small><strong>{element.symbol}</strong><span lang="en-GB">{element.name}</span></div><button type="button" onClick={() => selectElement(atomicNumber + 1)} disabled={atomicNumber === 118} aria-label={c.next}>›</button></div>
        <dl className={styles.elementFacts}><div><dt>{c.period}</dt><dd>{element.period}</dd></div><div><dt>{c.group}</dt><dd>{element.group ?? "—"}</dd></div><div><dt>{c.block}</dt><dd>{element.block}</dd></div><div><dt>{c.shells}</dt><dd>{shellCounts.join(" · ")}</dd></div></dl>
        <button className={styles.tableShortcut} type="button" onClick={() => { setTableOpen(true); periodicRef.current?.scrollIntoView({ block: "start", behavior: "instant" }); }}>{c.chooseTable} ↑</button>
        <section className={styles.config}><h4>{c.configuration}</h4><p>{element.configuration.map((shell) => <span key={`${shell.n}-${shell.l}`}>{shell.n}{letters[shell.l]}<sup>{shell.electrons}</sup>{" "}</span>)}</p><small>{element.configurationStatus === "reference" ? c.reference : c.illustrative}</small></section>
        <div className={styles.subshells} role="group" aria-label={c.subshell}>{element.configuration.map((shell) => <button type="button" key={`${shell.n}-${shell.l}`} aria-pressed={shell.n === subshell.n && shell.l === subshell.l} onClick={() => { setShellKey(`${shell.n}-${shell.l}`); setM(0); setStatus(""); }}>{shell.n}{letters[shell.l]}</button>)}</div>
        <label className={styles.elementPicker}><span>{c.component}</span><ClassicSelect value={component} onChange={(event) => { setM(Number(event.target.value)); setStatus(""); }}>{Array.from({ length: orbitalsInSubshell }, (_, index) => index - subshell.l).map((value) => <option key={value} value={value}>{orbitalLabel(subshell.n, subshell.l, value)}</option>)}</ClassicSelect></label>
        <p className={styles.hint}>{c.componentHint}</p>
        <div className={styles.boxes} role="group" aria-label={c.unpaired}>{Array.from({ length: orbitalsInSubshell }, (_, index) => {
          const up = index < subshell.electrons, down = index + orbitalsInSubshell < subshell.electrons;
          const count = Number(up) + Number(down);
          return <span key={index} role="img" aria-label={count === 1 ? c.singleElectron : `${count} ${c.electrons}`}><svg viewBox="0 0 24 24" aria-hidden="true">{up && <path d="M7 20V4M3 8l4-4 4 4" />}{down && <path d="M17 4v16m-4-4 4 4 4-4" />}</svg></span>;
        })}<small>{shellName}: {subshell.electrons}/{orbitalsInSubshell * 2}</small></div>
        <p className={styles.hint}>{Math.min(subshell.electrons, orbitalsInSubshell * 2 - subshell.electrons)} {c.unpairedCount}</p>
        <p className={styles.hint}>{c.boxNote}</p>
        <dl className={styles.nodes}><div><dt>{c.radial}</dt><dd>{nodes.radial}</dd></div><div><dt>{c.angular}</dt><dd>{nodes.angular}</dd></div><div><dt>{c.total}</dt><dd>{nodes.total}</dd></div></dl>
        <figure className={styles.radial}><figcaption>{c.radialTitle} · {c.radialAxis}</figcaption><svg viewBox="0 0 280 104" role="img" aria-label={`${c.radialTitle}: ${shellName}; ${c.radialAxis}`}><path d="M12 10V82H268" fill="none" stroke="#777" /><path d={radialPath} fill="none" stroke="#11177a" strokeWidth="2" /><text x="12" y="99">0</text><text x="265" y="99" textAnchor="end">{radialEnd.toFixed(0)} a₀</text></svg></figure>
      </aside>
    </div>
    <details className={styles.notes}><summary>{c.sources}</summary><h4>{c.model}</h4><p>{c.modelBody}</p><p>{c.phaseBody}</p><p>{c.projectionBody}</p><p>{c.pointsNote}</p><p>{c.surfaceNote}</p><p>{c.scaleBody}</p><p>{c.configBody}</p><div><a href={ORBITAL_SOURCES.configurations} target="_blank" rel="noreferrer">{c.sourceNist} ↗</a><a href={ORBITAL_SOURCES.hydrogen} target="_blank" rel="noreferrer">{c.sourceMath} ↗</a><a href={ORBITAL_SOURCES.elementIndex} target="_blank" rel="noreferrer">NIST · 93–104 ↗</a></div></details>
  </div>;
}
