"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type FormEvent,
  type PointerEvent as ReactPointerEvent,
  type SetStateAction,
} from "react";
import { translateText, type Locale } from "@/lib/i18n";
import styles from "./ProductivityApps.module.css";

export type ProductivityExtraId = "sketch" | "tasks" | "calendar" | "converter" | "palette";

type SaveState = "loading" | "saving" | "saved" | "unavailable";

const RESTORE_EVENT = "samuel-desk-storage-restored";
const FLUSH_EVENT = "samuel-desk-storage-flush";
const SKETCH_STORAGE_KEY = "samuel-system7-sketch-v1";
const TASKS_STORAGE_KEY = "samuel-system7-tasks-v1";
const CALENDAR_STORAGE_KEY = "samuel-system7-calendar-v1";
const CONVERTER_STORAGE_KEY = "samuel-system7-converter-v1";
const PALETTE_STORAGE_KEY = "samuel-system7-palette-v1";
type DeskFlushDetail = { failedKeys: string[] };

function reportFlushFailure(event: Event | undefined, key: string) {
  const detail = (event as CustomEvent<DeskFlushDetail> | undefined)?.detail;
  if (Array.isArray(detail?.failedKeys) && !detail.failedKeys.includes(key)) detail.failedKeys.push(key);
}

function usePersistentState<T>(
  key: string,
  initialValue: T,
  validate: (value: unknown) => T | null,
): [T, Dispatch<SetStateAction<T>>, SaveState] {
  const [value, setValue] = useState<T>(initialValue);
  const [ready, setReady] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("loading");
  const latestValue = useRef(value);
  const initialValueRef = useRef(initialValue);
  const readyRef = useRef(false);
  const validateRef = useRef(validate);

  latestValue.current = value;
  validateRef.current = validate;

  useEffect(() => {
    const load = (raw: string | null) => {
      if (!raw) {
        latestValue.current = initialValueRef.current;
        setValue(initialValueRef.current);
        return;
      }
      try {
        const envelope = JSON.parse(raw) as { version?: unknown; data?: unknown };
        const restored = envelope.version === 1 ? validateRef.current(envelope.data) : null;
        if (restored !== null) {
          // Keep the synchronous flush ref aligned during React Strict Mode's
          // setup/cleanup probe so a valid saved value is never overwritten by
          // the hook's empty initial value before the first rerender.
          latestValue.current = restored;
          setValue(restored);
        }
      } catch {
        // A corrupt entry is ignored so the accessory can still open safely.
      }
    };

    try {
      load(window.localStorage.getItem(key));
      setSaveState("saved");
    } catch {
      setSaveState("unavailable");
    } finally {
      readyRef.current = true;
      setReady(true);
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === key) load(event.newValue);
    };
    const handleRestore = () => {
      try {
        load(window.localStorage.getItem(key));
      } catch {
        setSaveState("unavailable");
      }
    };
    const flush = (event?: Event) => {
      if (!readyRef.current) return;
      try {
        window.localStorage.setItem(key, JSON.stringify({ version: 1, data: latestValue.current }));
        setSaveState("saved");
      } catch {
        setSaveState("unavailable");
        reportFlushFailure(event, key);
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(RESTORE_EVENT, handleRestore);
    window.addEventListener(FLUSH_EVENT, flush);
    window.addEventListener("pagehide", flush);
    return () => {
      flush();
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(RESTORE_EVENT, handleRestore);
      window.removeEventListener(FLUSH_EVENT, flush);
      window.removeEventListener("pagehide", flush);
    };
  }, [key]);

  useEffect(() => {
    if (!ready) return;
    setSaveState("saving");
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(key, JSON.stringify({ version: 1, data: value }));
        setSaveState("saved");
      } catch {
        setSaveState("unavailable");
      }
    }, 180);
    return () => window.clearTimeout(timer);
  }, [key, ready, value]);

  return [value, setValue, saveState];
}

function SaveBadge({ locale, state }: { locale: Locale; state: SaveState }) {
  const t = (value: string) => translateText(locale, value);
  const label = state === "unavailable"
    ? t("Browser storage unavailable")
    : state === "loading"
      ? t("Loading saved data…")
      : state === "saving"
        ? t("Saving…")
        : t("Saved on this browser");
  return (
    <span className={`${styles.saveBadge} ${styles[`saveBadge_${state}`]}`} role="status">
      <i aria-hidden="true" />
      {label}
    </span>
  );
}

function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

type DrawPoint = { x: number; y: number };
type DrawStroke = {
  id: string;
  colour: string;
  width: number;
  erase: boolean;
  points: DrawPoint[];
};
type SketchData = { strokes: DrawStroke[] };
// Keep the worst-case drawing comfortably inside the storage budget shared by
// all eight accessories. Pointer samples are also frame-limited below, so this
// still permits hours of ordinary sketching without repainting on every raw
// hardware event.
const MAX_SKETCH_STROKES = 120;
const MAX_POINTS_PER_STROKE = 500;

const PAINT_COLOURS = [
  { name: "Ink black", value: "#111111" },
  { name: "System blue", value: "#11177a" },
  { name: "Signal red", value: "#b83b3b" },
  { name: "Field green", value: "#237747" },
  { name: "Highlighter yellow", value: "#f2c14f" },
] as const;

function validateSketch(value: unknown): SketchData | null {
  if (typeof value !== "object" || value === null || !Array.isArray((value as SketchData).strokes)) return null;
  const source = (value as SketchData).strokes;
  if (source.length > MAX_SKETCH_STROKES) return null;
  const seenIds = new Set<string>();
  const strokes: DrawStroke[] = [];
  for (const stroke of source) {
    if (
      typeof stroke !== "object"
      || stroke === null
      || typeof stroke.id !== "string"
      || !stroke.id
      || stroke.id.length > 80
      || seenIds.has(stroke.id)
      || typeof stroke.colour !== "string"
      || !/^#[\da-f]{6}$/i.test(stroke.colour)
      || !Number.isFinite(stroke.width)
      || stroke.width <= 0
      || stroke.width > .25
      || typeof stroke.erase !== "boolean"
      || !Array.isArray(stroke.points)
      || stroke.points.length < 1
      || stroke.points.length > MAX_POINTS_PER_STROKE
      || !stroke.points.every((point) => (
        typeof point === "object"
        && point !== null
        && Number.isFinite(point.x)
        && Number.isFinite(point.y)
        && point.x >= 0
        && point.x <= 1
        && point.y >= 0
        && point.y <= 1
      ))
    ) return null;
    seenIds.add(stroke.id);
    strokes.push({
      id: stroke.id,
      colour: stroke.colour,
      width: stroke.width,
      erase: stroke.erase,
      // v1 drawings created before point quantisation can contain long
      // floating-point coordinates. Rounding is a lossless visual migration
      // that keeps the largest valid drawing below the backup entry limit.
      points: stroke.points.map((point) => ({
        x: Math.round(point.x * 10_000) / 10_000,
        y: Math.round(point.y * 10_000) / 10_000,
      })),
    });
  }
  return { strokes };
}

function paintStrokes(
  context: CanvasRenderingContext2D,
  strokes: DrawStroke[],
  width: number,
  height: number,
  exportMode = false,
) {
  const scale = Math.max(1, Math.min(width, height));
  for (const stroke of strokes) {
    const points = stroke.points;
    if (!points.length) continue;
    context.save();
    context.globalCompositeOperation = stroke.erase && !exportMode ? "destination-out" : "source-over";
    context.strokeStyle = stroke.erase && exportMode ? "#ffffff" : stroke.colour;
    context.fillStyle = stroke.erase && exportMode ? "#ffffff" : stroke.colour;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = Math.max(1, stroke.width * scale);
    if (points.length === 1) {
      context.beginPath();
      context.arc(points[0].x * width, points[0].y * height, context.lineWidth / 2, 0, Math.PI * 2);
      context.fill();
    } else {
      context.beginPath();
      context.moveTo(points[0].x * width, points[0].y * height);
      for (const point of points.slice(1)) context.lineTo(point.x * width, point.y * height);
      context.stroke();
    }
    context.restore();
  }
}

function renderSketch(canvas: HTMLCanvasElement, strokes: DrawStroke[]) {
  const bounds = canvas.getBoundingClientRect();
  if (bounds.width < 1 || bounds.height < 1) return;
  const ratio = Math.min(2, window.devicePixelRatio || 1);
  const pixelWidth = Math.max(1, Math.round(bounds.width * ratio));
  const pixelHeight = Math.max(1, Math.round(bounds.height * ratio));
  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }
  const context = canvas.getContext("2d");
  if (!context) return;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, bounds.width, bounds.height);
  paintStrokes(context, strokes, bounds.width, bounds.height);
}

function SketchPad({ locale }: { locale: Locale }) {
  const t = (value: string) => translateText(locale, value);
  const [drawing, setDrawing, saveState] = usePersistentState<SketchData>(
    SKETCH_STORAGE_KEY,
    { strokes: [] },
    validateSketch,
  );
  const [redo, setRedo] = useState<DrawStroke[][]>([]);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [colour, setColour] = useState(PAINT_COLOURS[0].value as string);
  const [brushSize, setBrushSize] = useState(5);
  const [showGrid, setShowGrid] = useState(true);
  const [clearArmed, setClearArmed] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeStroke = useRef<{ pointerId: number; strokeId: string } | null>(null);
  const pendingPoint = useRef<DrawPoint | null>(null);
  const drawFrame = useRef<number | null>(null);
  const strokesRef = useRef(drawing.strokes);
  strokesRef.current = drawing.strokes;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) renderSketch(canvas, drawing.strokes);
  }, [drawing.strokes]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => renderSketch(canvas, strokesRef.current));
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!clearArmed) return;
    const timer = window.setTimeout(() => setClearArmed(false), 3_000);
    return () => window.clearTimeout(timer);
  }, [clearArmed]);

  useEffect(() => {
    const resetHistory = () => {
      const active = activeStroke.current;
      const canvas = canvasRef.current;
      if (active && canvas?.hasPointerCapture(active.pointerId)) canvas.releasePointerCapture(active.pointerId);
      if (drawFrame.current !== null) window.cancelAnimationFrame(drawFrame.current);
      drawFrame.current = null;
      pendingPoint.current = null;
      activeStroke.current = null;
      setRedo([]);
      setClearArmed(false);
    };
    const resetHistoryFromStorage = (event: StorageEvent) => {
      if (event.key === SKETCH_STORAGE_KEY) resetHistory();
    };
    window.addEventListener(RESTORE_EVENT, resetHistory);
    window.addEventListener("storage", resetHistoryFromStorage);
    return () => {
      if (drawFrame.current !== null) window.cancelAnimationFrame(drawFrame.current);
      drawFrame.current = null;
      pendingPoint.current = null;
      window.removeEventListener(RESTORE_EVENT, resetHistory);
      window.removeEventListener("storage", resetHistoryFromStorage);
    };
  }, []);

  const pointFromEvent = (event: ReactPointerEvent<HTMLCanvasElement>): DrawPoint => {
    const bounds = event.currentTarget.getBoundingClientRect();
    return {
      x: Math.round(Math.max(0, Math.min(1, (event.clientX - bounds.left) / Math.max(1, bounds.width))) * 10_000) / 10_000,
      y: Math.round(Math.max(0, Math.min(1, (event.clientY - bounds.top) / Math.max(1, bounds.height))) * 10_000) / 10_000,
    };
  };

  const startStroke = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if ((event.button !== 0 && event.pointerType === "mouse") || activeStroke.current || drawing.strokes.length >= MAX_SKETCH_STROKES) return;
    event.preventDefault();
    const bounds = event.currentTarget.getBoundingClientRect();
    const stroke: DrawStroke = {
      id: makeId("stroke"),
      colour,
      width: brushSize / Math.max(1, Math.min(bounds.width, bounds.height)),
      erase: tool === "eraser",
      points: [pointFromEvent(event)],
    };
    activeStroke.current = { pointerId: event.pointerId, strokeId: stroke.id };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrawing((current) => ({ strokes: [...current.strokes, stroke] }));
    setRedo([]);
    setClearArmed(false);
  };

  const appendPoint = (strokeId: string, point: DrawPoint) => {
    setDrawing((current) => ({
      strokes: current.strokes.map((stroke) => (
        stroke.id === strokeId
          ? (() => {
              const previous = stroke.points.at(-1)!;
              const distance = Math.hypot(point.x - previous.x, point.y - previous.y);
              if (distance < .0015) return stroke;
              const sampled = stroke.points.length >= MAX_POINTS_PER_STROKE
                ? stroke.points.filter((_, index) => index % 2 === 0)
                : stroke.points;
              return { ...stroke, points: [...sampled, point] };
            })()
          : stroke
      )),
    }));
  };

  const continueStroke = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const active = activeStroke.current;
    if (!active || active.pointerId !== event.pointerId) return;
    event.preventDefault();
    pendingPoint.current = pointFromEvent(event);
    if (drawFrame.current !== null) return;
    const strokeId = active.strokeId;
    drawFrame.current = window.requestAnimationFrame(() => {
      drawFrame.current = null;
      const point = pendingPoint.current;
      pendingPoint.current = null;
      if (point) appendPoint(strokeId, point);
    });
  };

  const finishStroke = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const active = activeStroke.current;
    if (!active || active.pointerId !== event.pointerId) return;
    if (drawFrame.current !== null) window.cancelAnimationFrame(drawFrame.current);
    drawFrame.current = null;
    const finalPoint = pendingPoint.current;
    pendingPoint.current = null;
    if (finalPoint) appendPoint(active.strokeId, finalPoint);
    activeStroke.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const undo = () => {
    const last = drawing.strokes.at(-1);
    if (!last) return;
    setDrawing({ strokes: drawing.strokes.slice(0, -1) });
    setRedo((items) => [...items, [last]].slice(-MAX_SKETCH_STROKES));
  };

  const redoStroke = () => {
    const transaction = redo.at(-1);
    if (!transaction) return;
    setDrawing({ strokes: [...drawing.strokes, ...transaction] });
    setRedo(redo.slice(0, -1));
  };

  const clearDrawing = () => {
    if (!drawing.strokes.length) return;
    if (!clearArmed) {
      setClearArmed(true);
      return;
    }
    setRedo((items) => [...items, drawing.strokes].slice(-MAX_SKETCH_STROKES));
    setDrawing({ strokes: [] });
    setClearArmed(false);
  };

  const downloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const output = document.createElement("canvas");
    output.width = canvas.width;
    output.height = canvas.height;
    const context = output.getContext("2d");
    if (!context) return;
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, output.width, output.height);
    paintStrokes(context, drawing.strokes, output.width, output.height, true);
    const anchor = document.createElement("a");
    anchor.href = output.toDataURL("image/png");
    anchor.download = `samuel-sketch-${new Date().toISOString().slice(0, 10)}.png`;
    anchor.click();
  };

  return (
    <div className={styles.sketchPad}>
      <header className={styles.utilityHeader}>
        <div>
          <span className={styles.eyebrow}>{t("SKETCH PAD")}</span>
          <strong>{t("A canvas for quick thinking.")}</strong>
        </div>
        <SaveBadge locale={locale} state={saveState} />
      </header>
      <div className={styles.sketchToolbar} role="toolbar" aria-label={t("Drawing tools")}>
        <div className={styles.segmentedControl}>
          <button type="button" className={tool === "pen" ? styles.isSelected : undefined} onClick={() => setTool("pen")} aria-pressed={tool === "pen"}>{t("Pen")}</button>
          <button type="button" className={tool === "eraser" ? styles.isSelected : undefined} onClick={() => setTool("eraser")} aria-pressed={tool === "eraser"}>{t("Eraser")}</button>
        </div>
        <div className={styles.paintColours} aria-label={t("Ink colour")}>
          {PAINT_COLOURS.map((paint) => (
            <button
              key={paint.value}
              type="button"
              className={colour === paint.value && tool === "pen" ? styles.isSelectedColour : undefined}
              style={{ backgroundColor: paint.value }}
              onClick={() => { setColour(paint.value); setTool("pen"); }}
              aria-pressed={colour === paint.value && tool === "pen"}
              aria-label={`${t("Use")} ${t(paint.name)}`}
              title={t(paint.name)}
            />
          ))}
        </div>
        <label className={styles.brushSize}>
          <span>{t("Size")}</span>
          <input type="range" min={2} max={24} value={brushSize} onChange={(event) => setBrushSize(Number(event.target.value))} />
        </label>
        <div className={styles.sketchActions}>
          <button type="button" onClick={undo} disabled={!drawing.strokes.length}>{t("Undo")}</button>
          <button type="button" onClick={redoStroke} disabled={!redo.length}>{t("Redo")}</button>
          <button type="button" onClick={() => setShowGrid((current) => !current)} aria-pressed={showGrid}>{t("Grid")}</button>
          <button type="button" onClick={downloadPng} disabled={!drawing.strokes.length}>{t("Save PNG…")}</button>
          <button type="button" className={clearArmed ? styles.dangerButton : undefined} onClick={clearDrawing} disabled={!drawing.strokes.length}>
            {clearArmed ? t("Clear now") : t("New drawing")}
          </button>
        </div>
      </div>
      <div className={`${styles.sketchStage}${showGrid ? ` ${styles.sketchStageGrid}` : ""}`}>
        <canvas
          ref={canvasRef}
          className={styles.sketchCanvas}
          onPointerDown={startStroke}
          onPointerMove={continueStroke}
          onPointerUp={finishStroke}
          onPointerCancel={finishStroke}
          onLostPointerCapture={finishStroke}
          role="img"
          aria-label={t("Drawing canvas. Use a mouse, trackpad or touch to draw.")}
        />
      </div>
      <footer className={styles.utilityFooter}>
        <span>{drawing.strokes.length} / {MAX_SKETCH_STROKES} {t("strokes")}</span>
        {drawing.strokes.length >= MAX_SKETCH_STROKES && <strong role="status">{t("Drawing full — undo or start a new drawing.")}</strong>}
        <span>{t("Autosaved as editable strokes · exports as PNG")}</span>
      </footer>
    </div>
  );
}

type TaskPriority = "normal" | "important";
type TaskItem = { id: string; text: string; done: boolean; priority: TaskPriority; createdAt: number };
type TaskData = { items: TaskItem[] };

function validateTasks(value: unknown): TaskData | null {
  if (typeof value !== "object" || value === null || !Array.isArray((value as TaskData).items)) return null;
  if ((value as TaskData).items.length > 80) return null;
  const seenIds = new Set<string>();
  const items: TaskItem[] = [];
  for (const item of (value as TaskData).items) {
    if (!(
      typeof item === "object"
      && item !== null
      && typeof item.id === "string"
      && Boolean(item.id)
      && item.id.length <= 80
      && !seenIds.has(item.id)
      && typeof item.text === "string"
      && Boolean(item.text.trim())
      && item.text.length <= 180
      && typeof item.done === "boolean"
      && (item.priority === "normal" || item.priority === "important")
      && Number.isFinite(item.createdAt)
    )) return null;
    seenIds.add(item.id);
    items.push({
      id: item.id,
      text: item.text,
      done: item.done,
      priority: item.priority,
      createdAt: item.createdAt,
    });
  }
  return { items };
}

function QuickList({ locale }: { locale: Locale }) {
  const t = (value: string) => translateText(locale, value);
  const [tasks, setTasks, saveState] = usePersistentState<TaskData>(TASKS_STORAGE_KEY, { items: [] }, validateTasks);
  const [draft, setDraft] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("normal");
  const [filter, setFilter] = useState<"all" | "open" | "done">("all");
  const [clearArmed, setClearArmed] = useState(false);
  const [limitMessage, setLimitMessage] = useState("");

  useEffect(() => {
    if (!clearArmed) return;
    const timer = window.setTimeout(() => setClearArmed(false), 3_000);
    return () => window.clearTimeout(timer);
  }, [clearArmed]);

  const addTask = (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    if (tasks.items.length >= 80) {
      setLimitMessage("Quick List holds up to 80 tasks. Complete or remove one first.");
      return;
    }
    setTasks((current) => ({
      items: [...current.items, { id: makeId("task"), text: text.slice(0, 180), done: false, priority, createdAt: Date.now() }].slice(-80),
    }));
    setDraft("");
    setPriority("normal");
    setFilter("all");
    setLimitMessage("");
  };

  const visibleTasks = tasks.items.filter((item) => (
    filter === "all" || (filter === "open" ? !item.done : item.done)
  ));
  const openCount = tasks.items.filter((item) => !item.done).length;
  const completedCount = tasks.items.length - openCount;
  const completedLabel = locale === "zh-CN"
    ? `已完成 ${completedCount} 项`
    : locale === "zh-TW"
      ? `已完成 ${completedCount} 項`
      : `${completedCount} ${t("completed")}`;

  const clearCompleted = () => {
    if (!completedCount) return;
    if (!clearArmed) {
      setClearArmed(true);
      return;
    }
    setTasks((current) => ({ items: current.items.filter((item) => !item.done) }));
    setClearArmed(false);
    setLimitMessage("");
  };

  return (
    <div className={styles.quickList}>
      <header className={styles.utilityHeader}>
        <div>
          <span className={styles.eyebrow}>{t("QUICK LIST")}</span>
          <strong>{t("Capture it before it disappears.")}</strong>
        </div>
        <SaveBadge locale={locale} state={saveState} />
      </header>
      <form className={styles.taskComposer} onSubmit={addTask}>
        <label htmlFor="quick-task">{t("New task")}</label>
        <div>
          <input
            id="quick-task"
            value={draft}
            maxLength={180}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={t("What needs doing?")}
          />
          <select value={priority} onChange={(event) => setPriority(event.target.value as TaskPriority)} aria-label={t("Task priority")}>
            <option value="normal">{t("Normal")}</option>
            <option value="important">{t("Important")}</option>
          </select>
          <button type="submit" className={styles.defaultButton} disabled={!draft.trim()}>{t("Add task")}</button>
        </div>
      </form>
      <span className={styles.inlineStatus} role="status">{limitMessage ? t(limitMessage) : ""}</span>
      <div className={styles.listToolbar}>
        <div className={styles.segmentedControl} aria-label={t("Task filters")}>
          {(["all", "open", "done"] as const).map((value) => (
            <button key={value} type="button" className={filter === value ? styles.isSelected : undefined} onClick={() => setFilter(value)} aria-pressed={filter === value}>
              {value === "all" ? t("All") : value === "open" ? t("Open") : t("Completed")}
            </button>
          ))}
        </div>
        <button type="button" className={clearArmed ? styles.dangerButton : undefined} onClick={clearCompleted} disabled={!completedCount}>
          {clearArmed ? t("Clear now") : t("Clear completed")}
        </button>
      </div>
      <div className={styles.taskListWrap}>
        {visibleTasks.length === 0 ? (
          <div className={styles.utilityEmpty}>
            <span aria-hidden="true">✓</span>
            <strong>{filter === "done" ? t("Nothing completed yet.") : t("Your desk is clear.")}</strong>
            <p>{filter === "done" ? t("Finished tasks will collect here.") : t("Add one useful next action above.")}</p>
          </div>
        ) : (
          <ul className={styles.taskList}>
            {visibleTasks.map((item) => (
              <li key={item.id} className={`${item.done ? styles.taskDone : ""}${item.priority === "important" ? ` ${styles.taskImportant}` : ""}`}>
                <label className={styles.taskCheck}>
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => setTasks((current) => ({ items: current.items.map((task) => task.id === item.id ? { ...task, done: !task.done } : task) }))}
                    aria-label={`${item.done ? t("Reopen") : t("Complete")} ${item.text}`}
                  />
                </label>
                <span>{item.text}</span>
                {item.priority === "important" && <small>{t("IMPORTANT")}</small>}
                <button
                  type="button"
                  onClick={() => { setTasks((current) => ({ items: current.items.filter((task) => task.id !== item.id) })); setLimitMessage(""); }}
                  aria-label={`${t("Delete task")}: ${item.text}`}
                  title={t("Delete task")}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <footer className={styles.utilityFooter}>
        <strong>{openCount} {openCount === 1 ? t("task left") : t("tasks left")}</strong>
        <span>{completedLabel}</span>
      </footer>
    </div>
  );
}

type CalendarData = { notes: Record<string, string> };

function calendarDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseCalendarDate(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function isCalendarDateKey(key: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return false;
  const [year, month, day] = key.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);
  return parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day;
}

function validateCalendar(value: unknown): CalendarData | null {
  if (typeof value !== "object" || value === null || typeof (value as CalendarData).notes !== "object" || (value as CalendarData).notes === null || Array.isArray((value as CalendarData).notes)) return null;
  const entries = Object.entries((value as CalendarData).notes);
  if (entries.length > 370 || !entries.every(([key, note]) => isCalendarDateKey(key) && typeof note === "string" && note.length > 0 && note.length <= 2_000)) return null;
  const notes = Object.fromEntries(entries) as Record<string, string>;
  return { notes };
}

function PocketCalendar({ locale }: { locale: Locale }) {
  const t = (value: string) => translateText(locale, value);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return (
      <div className={styles.pocketCalendar}>
        <header className={styles.utilityHeader}>
          <div>
            <span className={styles.eyebrow}>{t("POCKET CALENDAR")}</span>
            <strong>{t("One quiet place for the day ahead.")}</strong>
          </div>
        </header>
        <div className={styles.utilityEmpty} role="status">{t("Loading saved data…")}</div>
      </div>
    );
  }
  return <PocketCalendarReady locale={locale} />;
}

function PocketCalendarReady({ locale }: { locale: Locale }) {
  const t = (value: string) => translateText(locale, value);
  const [today, setToday] = useState(() => new Date());
  const todayKey = calendarDateKey(today);
  const [selectedKey, setSelectedKey] = useState(todayKey);
  const [viewMonth, setViewMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [calendar, setCalendar, saveState] = usePersistentState<CalendarData>(CALENDAR_STORAGE_KEY, { notes: {} }, validateCalendar);
  const [limitMessage, setLimitMessage] = useState("");

  useEffect(() => {
    const checkDay = () => {
      const next = new Date();
      if (calendarDateKey(next) !== todayKey) setToday(next);
    };
    const timer = window.setInterval(checkDay, 60_000);
    return () => window.clearInterval(timer);
  }, [todayKey]);

  const weekdayLabels = useMemo(() => Array.from({ length: 7 }, (_, index) => (
    new Intl.DateTimeFormat(locale, { weekday: "short" }).format(new Date(2024, 0, (locale === "en-US" ? 7 : 1) + index))
  )), [locale]);
  const cells = useMemo(() => {
    const firstDay = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
    const weekOffset = locale === "en-US" ? firstDay.getDay() : (firstDay.getDay() + 6) % 7;
    const start = new Date(firstDay);
    start.setDate(firstDay.getDate() - weekOffset);
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return date;
    });
  }, [locale, viewMonth]);
  const selectedDate = parseCalendarDate(selectedKey);
  const monthLabel = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(viewMonth);
  const selectedLabel = new Intl.DateTimeFormat(locale, { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(selectedDate);

  const shiftMonth = (amount: number) => {
    setViewMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  };
  const goToday = () => {
    setSelectedKey(todayKey);
    setViewMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  };
  const updateNote = (note: string) => {
    if (note && !calendar.notes[selectedKey] && Object.keys(calendar.notes).length >= 370) {
      setLimitMessage("Calendar holds notes for up to 370 days. Clear an older note first.");
      return;
    }
    setLimitMessage("");
    setCalendar((current) => {
      const notes = { ...current.notes };
      if (note) notes[selectedKey] = note.slice(0, 2_000);
      else delete notes[selectedKey];
      return { notes };
    });
  };

  return (
    <div className={styles.pocketCalendar}>
      <header className={styles.utilityHeader}>
        <div>
          <span className={styles.eyebrow}>{t("POCKET CALENDAR")}</span>
          <strong>{t("One quiet place for the day ahead.")}</strong>
        </div>
        <SaveBadge locale={locale} state={saveState} />
      </header>
      <div className={styles.calendarLayout}>
        <section className={styles.monthPanel} aria-label={monthLabel}>
          <header className={styles.monthToolbar}>
            <button type="button" onClick={() => shiftMonth(-1)} aria-label={t("Previous month")}>‹</button>
            <h3>{monthLabel}</h3>
            <button type="button" onClick={() => shiftMonth(1)} aria-label={t("Next month")}>›</button>
            <button type="button" onClick={goToday}>{t("Today")}</button>
          </header>
          <div className={styles.weekdays} aria-hidden="true">
            {weekdayLabels.map((label) => <span key={label}>{label}</span>)}
          </div>
          <div className={styles.calendarGrid}>
            {cells.map((date) => {
              const key = calendarDateKey(date);
              const outside = date.getMonth() !== viewMonth.getMonth();
              const fullLabel = new Intl.DateTimeFormat(locale, { dateStyle: "full" }).format(date);
              return (
                <button
                  key={key}
                  type="button"
                  className={`${outside ? styles.outsideMonth : ""}${key === selectedKey ? ` ${styles.selectedDay}` : ""}`}
                  onClick={() => { setSelectedKey(key); if (outside) setViewMonth(new Date(date.getFullYear(), date.getMonth(), 1)); }}
                  aria-label={`${fullLabel}${calendar.notes[key] ? `. ${t("Has a saved note.")}` : ""}`}
                  aria-pressed={key === selectedKey}
                  aria-current={key === todayKey ? "date" : undefined}
                >
                  <span>{date.getDate()}</span>
                  {calendar.notes[key] && <i aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </section>
        <aside className={styles.dayNote}>
          <span className={styles.eyebrow}>{selectedKey === todayKey ? t("TODAY") : t("DAY NOTE")}</span>
          <h3>{selectedLabel}</h3>
          <textarea
            value={calendar.notes[selectedKey] ?? ""}
            maxLength={2_000}
            onChange={(event) => updateNote(event.target.value)}
            placeholder={t("Appointments, reminders, or the one thing that matters…")}
            aria-label={`${t("Note for")} ${selectedLabel}`}
          />
          <footer>
            <span>{(calendar.notes[selectedKey] ?? "").length} / 2000</span>
            <button type="button" onClick={() => updateNote("")} disabled={!calendar.notes[selectedKey]}>{t("Clear note")}</button>
          </footer>
          <span className={styles.inlineStatus} role="status">{limitMessage ? t(limitMessage) : ""}</span>
        </aside>
      </div>
    </div>
  );
}

type ConverterCategory = "length" | "mass" | "temperature" | "data";
type ConverterUnit = {
  id: string;
  label: string;
  symbol: string;
  toBase: (value: number) => number;
  fromBase: (value: number) => number;
};
type ConverterData = { category: ConverterCategory; from: string; to: string; input: string };

const factorUnit = (id: string, label: string, symbol: string, factor: number): ConverterUnit => ({
  id,
  label,
  symbol,
  toBase: (value) => value * factor,
  fromBase: (value) => value / factor,
});

const CONVERTER_GROUPS: Record<ConverterCategory, { label: string; units: ConverterUnit[] }> = {
  length: {
    label: "Length",
    units: [
      factorUnit("m", "Metres", "m", 1),
      factorUnit("km", "Kilometres", "km", 1_000),
      factorUnit("cm", "Centimetres", "cm", .01),
      factorUnit("ft", "Feet", "ft", .3048),
      factorUnit("in", "Inches", "in", .0254),
      factorUnit("mi", "Miles", "mi", 1_609.344),
    ],
  },
  mass: {
    label: "Mass",
    units: [
      factorUnit("kg", "Kilograms", "kg", 1),
      factorUnit("g", "Grams", "g", .001),
      factorUnit("lb", "Pounds", "lb", .45359237),
      factorUnit("oz", "Ounces", "oz", .028349523125),
    ],
  },
  temperature: {
    label: "Temperature",
    units: [
      { id: "c", label: "Celsius", symbol: "°C", toBase: (value) => value, fromBase: (value) => value },
      { id: "f", label: "Fahrenheit", symbol: "°F", toBase: (value) => (value - 32) * 5 / 9, fromBase: (value) => value * 9 / 5 + 32 },
      { id: "k", label: "Kelvin", symbol: "K", toBase: (value) => value - 273.15, fromBase: (value) => value + 273.15 },
    ],
  },
  data: {
    label: "Data",
    units: [
      factorUnit("b", "Bytes", "B", 1),
      factorUnit("kb", "Kilobytes", "KB", 1_000),
      factorUnit("mb", "Megabytes", "MB", 1_000_000),
      factorUnit("gb", "Gigabytes", "GB", 1_000_000_000),
      factorUnit("tb", "Terabytes", "TB", 1_000_000_000_000),
    ],
  },
};

function validateConverter(value: unknown): ConverterData | null {
  if (typeof value !== "object" || value === null) return null;
  const candidate = value as ConverterData;
  if (typeof candidate.category !== "string" || !Object.hasOwn(CONVERTER_GROUPS, candidate.category) || typeof candidate.input !== "string" || candidate.input.length > 40) return null;
  const units = CONVERTER_GROUPS[candidate.category].units;
  if (!units.some((unit) => unit.id === candidate.from) || !units.some((unit) => unit.id === candidate.to)) return null;
  return {
    category: candidate.category,
    from: candidate.from,
    to: candidate.to,
    input: candidate.input,
  };
}

function UnitConverter({ locale }: { locale: Locale }) {
  const t = (value: string) => translateText(locale, value);
  const [converter, setConverter, saveState] = usePersistentState<ConverterData>(
    CONVERTER_STORAGE_KEY,
    { category: "length", from: "m", to: "ft", input: "1" },
    validateConverter,
  );
  const [copyStatus, setCopyStatus] = useState("");
  const group = CONVERTER_GROUPS[converter.category];
  const fromUnit = group.units.find((unit) => unit.id === converter.from) ?? group.units[0];
  const toUnit = group.units.find((unit) => unit.id === converter.to) ?? group.units[1];
  const numericInput = Number(converter.input.replace(",", "."));
  const convertedCandidate = converter.input.trim() && Number.isFinite(numericInput)
    ? toUnit.fromBase(fromUnit.toBase(numericInput))
    : null;
  const converted = convertedCandidate !== null && Number.isFinite(convertedCandidate) ? convertedCandidate : null;
  const output = converted === null
    ? "—"
    : new Intl.NumberFormat(locale, { maximumSignificantDigits: 10 }).format(converted);

  const chooseCategory = (category: ConverterCategory) => {
    const units = CONVERTER_GROUPS[category].units;
    setConverter((current) => ({ ...current, category, from: units[0].id, to: units[1].id }));
    setCopyStatus("");
  };
  const swap = () => setConverter((current) => ({ ...current, from: current.to, to: current.from, input: converted === null ? current.input : String(Number(converted.toPrecision(12))) }));
  const copyOutput = async () => {
    if (converted === null) return;
    try {
      await navigator.clipboard.writeText(`${output} ${toUnit.symbol}`);
      setCopyStatus("Copied");
    } catch {
      setCopyStatus("Copy unavailable");
    }
  };

  return (
    <div className={styles.unitConverter}>
      <header className={styles.utilityHeader}>
        <div>
          <span className={styles.eyebrow}>{t("UNIT CONVERTER")}</span>
          <strong>{t("Useful answers, without a search box.")}</strong>
        </div>
        <SaveBadge locale={locale} state={saveState} />
      </header>
      <nav className={styles.converterCategories} aria-label={t("Conversion category")}>
        {(Object.keys(CONVERTER_GROUPS) as ConverterCategory[]).map((category) => (
          <button key={category} type="button" className={converter.category === category ? styles.isSelected : undefined} onClick={() => chooseCategory(category)} aria-pressed={converter.category === category}>
            {t(CONVERTER_GROUPS[category].label)}
          </button>
        ))}
      </nav>
      <section className={styles.converterWorkbench}>
        <label>
          <span>{t("From")}</span>
          <input
            value={converter.input}
            inputMode="decimal"
            onChange={(event) => setConverter((current) => ({ ...current, input: event.target.value.replace(/[^\d.,+-]/g, "").slice(0, 40) }))}
            aria-label={t("Value to convert")}
          />
            <select value={converter.from} onChange={(event) => setConverter((current) => ({ ...current, from: event.target.value }))} aria-label={t("Source unit")}>
            {group.units.map((unit) => <option key={unit.id} value={unit.id}>{t(unit.label)} ({unit.symbol})</option>)}
          </select>
        </label>
        <button type="button" className={styles.swapButton} onClick={swap} aria-label={t("Swap units")} title={t("Swap units")}>⇄</button>
        <div className={styles.converterOutput} aria-live="polite">
          <span>{t("To")}</span>
          <strong>{output}</strong>
          <small>{toUnit.symbol}</small>
          <select value={converter.to} onChange={(event) => setConverter((current) => ({ ...current, to: event.target.value }))} aria-label={t("Result unit")}>
            {group.units.map((unit) => <option key={unit.id} value={unit.id}>{t(unit.label)} ({unit.symbol})</option>)}
          </select>
        </div>
      </section>
      <section className={styles.conversionReadout}>
        <span className={styles.eyebrow}>{t("LIVE RESULT")}</span>
        <p>{converted === null ? t("Enter a number to begin.") : `${converter.input || 0} ${fromUnit.symbol} = ${output} ${toUnit.symbol}`}</p>
        <button type="button" onClick={copyOutput} disabled={converted === null}>{t("Copy result")}</button>
        <span role="status">{copyStatus ? t(copyStatus) : ""}</span>
      </section>
    </div>
  );
}

type PaletteData = { hex: string; swatches: string[] };

function normaliseHex(value: string): string | null {
  const compact = value.trim().replace(/^#/, "");
  if (/^[\da-f]{3}$/i.test(compact)) return `#${[...compact].map((character) => character.repeat(2)).join("").toUpperCase()}`;
  if (/^[\da-f]{6}$/i.test(compact)) return `#${compact.toUpperCase()}`;
  return null;
}

function validatePalette(value: unknown): PaletteData | null {
  if (typeof value !== "object" || value === null) return null;
  const candidate = value as PaletteData;
  const hex = typeof candidate.hex === "string" ? normaliseHex(candidate.hex) : null;
  if (!hex || !Array.isArray(candidate.swatches) || candidate.swatches.length > 12) return null;
  const swatches = candidate.swatches.map((swatch) => typeof swatch === "string" ? normaliseHex(swatch) : null);
  if (swatches.some((swatch) => swatch === null)) return null;
  const validSwatches = swatches as string[];
  if (new Set(validSwatches).size !== validSwatches.length) return null;
  return { hex, swatches: validSwatches };
}

function hexToRgb(hex: string): [number, number, number] {
  return [1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16)) as [number, number, number];
}

function rgbToHsl([red, green, blue]: [number, number, number]): [number, number, number] {
  const r = red / 255;
  const g = green / 255;
  const b = blue / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(lightness * 100)];
  const delta = max - min;
  const saturation = lightness > .5 ? delta / (2 - max - min) : delta / (max + min);
  let hue = max === r ? (g - b) / delta + (g < b ? 6 : 0) : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
  hue /= 6;
  return [Math.round(hue * 360), Math.round(saturation * 100), Math.round(lightness * 100)];
}

function relativeLuminance([red, green, blue]: [number, number, number]): number {
  const channels = [red, green, blue].map((value) => {
    const channel = value / 255;
    return channel <= .03928 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
  });
  return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
}

function contrastRatio(left: number, right: number): number {
  return (Math.max(left, right) + .05) / (Math.min(left, right) + .05);
}

function ColourStudio({ locale }: { locale: Locale }) {
  const t = (value: string) => translateText(locale, value);
  const [palette, setPalette, saveState] = usePersistentState<PaletteData>(
    PALETTE_STORAGE_KEY,
    { hex: "#11177A", swatches: ["#11177A", "#F2C14F", "#237747", "#B83B3B"] },
    validatePalette,
  );
  const [hexDraft, setHexDraft] = useState(palette.hex);
  const [copyStatus, setCopyStatus] = useState("");
  useEffect(() => setHexDraft(palette.hex), [palette.hex]);

  const rgb = hexToRgb(palette.hex);
  const hsl = rgbToHsl(rgb);
  const luminance = relativeLuminance(rgb);
  const whiteContrast = contrastRatio(luminance, 1);
  const blackContrast = contrastRatio(luminance, 0);
  const bestText = whiteContrast >= blackContrast ? "white" : "black";
  const bestRatio = Math.max(whiteContrast, blackContrast);

  const commitHex = () => {
    const next = normaliseHex(hexDraft);
    if (next) {
      setPalette((current) => ({ ...current, hex: next }));
      setHexDraft(next);
    } else {
      setHexDraft(palette.hex);
    }
  };
  const copyColour = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopyStatus("Copied");
    } catch {
      setCopyStatus("Copy unavailable");
    }
  };
  const addSwatch = () => {
    if (!palette.swatches.includes(palette.hex) && palette.swatches.length >= 12) {
      setCopyStatus("Colour Studio holds 12 swatches. Remove one before saving another.");
      return;
    }
    setPalette((current) => ({
      ...current,
      swatches: [...current.swatches.filter((swatch) => swatch !== current.hex), current.hex],
    }));
    setCopyStatus("");
  };

  return (
    <div className={styles.colourStudio}>
      <header className={styles.utilityHeader}>
        <div>
          <span className={styles.eyebrow}>{t("COLOUR STUDIO")}</span>
          <strong>{t("Pick boldly. Check responsibly.")}</strong>
        </div>
        <SaveBadge locale={locale} state={saveState} />
      </header>
      <div className={styles.colourLayout}>
        <section className={styles.colourPreview} style={{ backgroundColor: palette.hex }} aria-label={`${t("Colour preview")} ${palette.hex}`}>
          <div style={{ color: "#ffffff" }}>
            <strong>{t("White text")}</strong>
            <span>{whiteContrast.toFixed(2)}:1</span>
          </div>
          <div style={{ color: "#000000" }}>
            <strong>{t("Black text")}</strong>
            <span>{blackContrast.toFixed(2)}:1</span>
          </div>
        </section>
        <section className={styles.colourControls}>
          <label className={styles.nativeColourPicker}>
            <span>{t("Pick a colour")}</span>
            <input type="color" value={palette.hex} onChange={(event) => setPalette((current) => ({ ...current, hex: event.target.value.toUpperCase() }))} />
          </label>
          <label className={styles.hexField}>
            <span>HEX</span>
            <input
              value={hexDraft}
              maxLength={7}
              onChange={(event) => setHexDraft(event.target.value.toUpperCase())}
              onBlur={commitHex}
              onKeyDown={(event) => { if (event.key === "Enter") commitHex(); }}
              aria-label={t("Hex colour")}
            />
          </label>
          <dl className={styles.colourValues}>
            <div><dt>RGB</dt><dd>{rgb.join(", ")}</dd></div>
            <div><dt>HSL</dt><dd>{hsl[0]}°, {hsl[1]}%, {hsl[2]}%</dd></div>
          </dl>
          <div className={styles.colourButtons}>
            <button type="button" onClick={() => copyColour(palette.hex)}>{t("Copy HEX")}</button>
            <button type="button" onClick={() => copyColour(`rgb(${rgb.join(", ")})`)}>{t("Copy RGB")}</button>
            <button type="button" className={styles.defaultButton} onClick={addSwatch}>{t("Save swatch")}</button>
          </div>
          <span className={styles.colourCopyStatus} role="status">{copyStatus ? t(copyStatus) : ""}</span>
        </section>
      </div>
      <section className={styles.contrastResult}>
        <span className={styles.eyebrow}>{t("ACCESSIBLE TEXT CHECK")}</span>
        <strong>{t(bestText === "white" ? "Use white text" : "Use black text")}</strong>
        <span>{bestRatio.toFixed(2)}:1 · {bestRatio >= 7 ? "AAA" : bestRatio >= 4.5 ? "AA" : t("Large text only")}</span>
      </section>
      <section className={styles.savedSwatches} aria-label={t("Saved swatches")}>
        <header>
          <strong>{t("Saved swatches")}</strong>
          <span>{palette.swatches.length} / 12</span>
        </header>
        <div>
          {palette.swatches.map((swatch) => (
            <article key={swatch}>
              <button type="button" style={{ backgroundColor: swatch }} onClick={() => setPalette((current) => ({ ...current, hex: swatch }))} aria-pressed={palette.hex === swatch} aria-label={`${t("Use colour")} ${swatch}`} />
              <span>{swatch}</span>
              <button type="button" onClick={() => { setPalette((current) => ({ ...current, swatches: current.swatches.filter((value) => value !== swatch) })); setCopyStatus(""); }} aria-label={`${t("Remove colour")} ${swatch}`}>×</button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export function normaliseProductivityExtraBackup(key: string, raw: string): string | null {
  try {
    const envelope = JSON.parse(raw) as { version?: unknown; data?: unknown };
    if (envelope.version !== 1) return null;
    const validators: Record<string, (value: unknown) => unknown | null> = {
      [SKETCH_STORAGE_KEY]: validateSketch,
      [TASKS_STORAGE_KEY]: validateTasks,
      [CALENDAR_STORAGE_KEY]: validateCalendar,
      [CONVERTER_STORAGE_KEY]: validateConverter,
      [PALETTE_STORAGE_KEY]: validatePalette,
    };
    const validate = validators[key];
    if (!validate) return null;
    const data = validate(envelope.data);
    return data === null ? null : JSON.stringify({ version: 1, data });
  } catch {
    return null;
  }
}

export default function ProductivityExtras({ app, locale }: { app: ProductivityExtraId; locale: Locale }) {
  if (app === "sketch") return <SketchPad locale={locale} />;
  if (app === "tasks") return <QuickList locale={locale} />;
  if (app === "calendar") return <PocketCalendar locale={locale} />;
  if (app === "converter") return <UnitConverter locale={locale} />;
  return <ColourStudio locale={locale} />;
}
