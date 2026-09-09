/**
 * Check saved science media and the controls that choose it.
 *
 * Run from the repository root: node scripts/check-scientific-media.mjs
 * The companion fixture belongs in scripts/fixtures/, never public/.
 * Images are decoded by the browser; this check verifies RIFF dimensions,
 * exact reviewed bytes, complete frame sets and source-backed sample labels.
 * A small React harness exercises state transitions without a DOM or training.
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, lstatSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import { scientificMedia } from "./fixtures/scientific-media.mjs";

const root = resolve(process.argv[2] ?? process.cwd());
const require = createRequire(join(root, "package.json"));
const React = require("react");
const ts = require("typescript");
const expected = new Map(scientificMedia);
const copyModuleCache = new Map();
function loadCopyModule(relativePath) {
  const absolute = resolve(root, relativePath);
  if (copyModuleCache.has(absolute)) return copyModuleCache.get(absolute);
  const output = ts.transpileModule(readFileSync(absolute, "utf8"), { fileName: absolute, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
  const evaluated = { exports: {} };
  copyModuleCache.set(absolute, evaluated.exports);
  runInNewContext(output, { module: evaluated, exports: evaluated.exports, require(name) {
    if (name.startsWith("@/")) return loadCopyModule(`src/${name.slice(2)}.ts`);
    if (name.startsWith(".")) return loadCopyModule(resolve(absolute, "..", `${name}.ts`));
    return require(name);
  } }, { filename: absolute });
  return evaluated.exports;
}
const { scientificCopy } = loadCopyModule("src/components/projects/copy/scientificCopy.ts");
const { localiseProjectTree } = loadCopyModule("src/components/projects/ProjectTranslationBoundary.tsx");
let passed = 0;
function test(name, fn) { fn(); passed++; console.log(`PASS ${name}`); }
function digest(bytes) { return createHash("sha256").update(bytes).digest("hex"); }
function media(path) { return join(root, "public", path); }

function webpSize(bytes) {
  assert.equal(bytes.toString("ascii", 0, 4), "RIFF");
  assert.equal(bytes.toString("ascii", 8, 12), "WEBP");
  assert.equal(bytes.readUInt32LE(4) + 8, bytes.length);
  for (let offset = 12; offset + 8 <= bytes.length;) {
    const type = bytes.toString("ascii", offset, offset + 4);
    const size = bytes.readUInt32LE(offset + 4), start = offset + 8;
    assert.ok(start + size <= bytes.length, "WebP chunk exceeds file bounds");
    if (type === "VP8X") return [bytes.readUIntLE(start + 4, 3) + 1, bytes.readUIntLE(start + 7, 3) + 1];
    if (type === "VP8L") {
      assert.equal(bytes[start], 0x2f);
      const bits = bytes.readUInt32LE(start + 1);
      return [(bits & 0x3fff) + 1, ((bits >>> 14) & 0x3fff) + 1];
    }
    if (type === "VP8 ") {
      assert.equal(bytes.toString("hex", start + 3, start + 6), "9d012a");
      return [bytes.readUInt16LE(start + 6) & 0x3fff, bytes.readUInt16LE(start + 8) & 0x3fff];
    }
    offset = start + size + (size & 1);
  }
  throw new Error("WebP image payload is missing");
}

function filesUnder(directory) {
  return readdirSync(media(directory), { withFileTypes: true }).flatMap((entry) => {
    assert.ok(!entry.isSymbolicLink(), `Unexpected symlink: ${directory}/${entry.name}`);
    const path = `${directory}/${entry.name}`;
    return entry.isDirectory() ? filesUnder(path) : [path];
  });
}

test("reviewed scientific images have exact hashes and valid dimensions", () => {
  for (const [path, entry] of scientificMedia) {
    assert.ok(lstatSync(media(path)).isFile(), path);
    const bytes = readFileSync(media(path));
    assert.ok(bytes.length <= entry.maximumBytes, `${path}: byte budget`);
    assert.equal(digest(bytes), entry.sha256, `${path}: reviewed content changed`);
    assert.deepEqual(webpSize(bytes), [entry.width, entry.height], `${path}: dimensions`);
  }
  const actual = [...filesUnder("projects/neural-cfd/media"), ...filesUnder("projects/microrobot/media"), ...filesUnder("projects/mri/media")];
  assert.deepEqual(actual.sort(), [...expected.keys()].sort());
  assert.ok(scientificMedia.reduce((sum, [, item]) => sum + item.maximumBytes, 0) < 3_600_000, "Scientific media exceed the combined transfer budget");
});

test("all 150 flow images form complete, changing sequences", () => {
  for (const [sequence, frames] of [["gnn-rollout", 20], ["gnn-simulation", 30]]) {
    for (const channel of ["velocity-x", "velocity-y", "pressure"]) {
      const hashes = new Set();
      for (let frame = 0; frame < frames; frame++) {
        const path = `projects/neural-cfd/media/${sequence}/frame-${String(frame).padStart(2, "0")}-${channel}.webp`;
        assert.ok(expected.has(path), path);
        hashes.add(expected.get(path).sha256);
      }
      assert.ok(hashes.size > 1, `${sequence}/${channel}: static sequence`);
    }
  }
});

test("pose and depth response views share their three microscope inputs", () => {
  for (let sample = 1; sample <= 3; sample++) {
    const a = expected.get(`projects/microrobot/media/pose-sample-${sample}-original.webp`);
    const b = expected.get(`projects/microrobot/media/depth-sample-${sample}-original.webp`);
    assert.equal(a.sha256, b.sha256, `Sample ${sample}: mismatched input across tasks`);
  }
});

const sourcePath = join(root, "src/components/projects/ScientificPlayback.tsx");
const compiled = ts.transpileModule(readFileSync(sourcePath, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  fileName: sourcePath,
}).outputText;

function harness(componentName, body = compiled, locale = "en-GB", expandChildren = false) {
  const values = [], effects = [], pending = [], timers = new Map(), requests = [];
  const visibilityListeners = new Set();
  const document = {
    hidden: false,
    addEventListener(name, listener) { if (name === "visibilitychange") visibilityListeners.add(listener); },
    removeEventListener(name, listener) { if (name === "visibilitychange") visibilityListeners.delete(listener); },
  };
  let stateIndex = 0, effectIndex = 0, dirty = false, nextTimer = 1;
  const statefulReact = {
    ...React,
    useState(initial) {
      const index = stateIndex++;
      if (!(index in values)) values[index] = typeof initial === "function" ? initial() : initial;
      return [values[index], (next) => {
        const value = typeof next === "function" ? next(values[index]) : next;
        if (!Object.is(value, values[index])) { values[index] = value; dirty = true; }
      }];
    },
    useMemo: (calculate) => calculate(),
    useRef: (current) => ({ current }),
    useId: () => "scientific-test",
    useEffect(callback, dependencies) {
      const index = effectIndex++, previous = effects[index];
      if (!previous || dependencies.some((value, i) => !Object.is(value, previous.dependencies[i]))) {
        pending.push(() => { previous?.cleanup?.(); effects[index] = { dependencies, cleanup: callback() }; });
      }
    },
  };
  function ProjectCopy({ children, copy, locale: selectedLocale }) { return localiseProjectTree(children, selectedLocale ?? locale, copy); }
  function resolveCopyScopes(node) {
    if (Array.isArray(node)) return node.map(resolveCopyScopes);
    if (!React.isValidElement(node)) return node;
    if (node.type === ProjectCopy) return resolveCopyScopes(ProjectCopy(node.props));
    if (expandChildren && typeof node.type === "function") return React.cloneElement(node, {}, resolveCopyScopes(node.type(node.props)));
    return React.cloneElement(node, {}, resolveCopyScopes(node.props.children));
  }
  const exports = {};
  runInNewContext(body, {
    document,
    module: { exports }, exports,
    require(name) {
      if (name === "./MathEquation") return { MathEquation: (props) => React.createElement("span", { "data-equation": props.tex }, props.label ?? props.tex) };
      if (name === "react") return statefulReact;
      if (name === "next/image") return { __esModule: true, default: "img" };
      if (name.endsWith("ProjectTranslationBoundary")) return { useProjectLocale: () => locale, ProjectCopy, ProjectTranslationBoundary: ({ children }) => children };
      if (name === "./copy/scientificCopy") return { scientificCopy };
      if (name === "@/lib/projectCopy") return loadCopyModule("src/lib/projectCopy.ts");
      if (["./CoverageShiftExperiment", "./ScientificFailureExperiments"].includes(name)) return new Proxy({}, { get: () => () => null });
      if (name.endsWith("DemoChrome")) return { DemoWindow: "section", MacButton: "button" };
      if (name.endsWith("ClassicSelect")) return { __esModule: true, default: "select" };
      if (name.endsWith(".module.css")) return { __esModule: true, default: new Proxy({}, { get: (_, key) => String(key) }) };
      return require(name);
    },
    window: {
      Image: class { set src(value) { assert.ok(expected.has(value.slice(1)), `Unreviewed frame request ${value}`); requests.push(value); this.onload?.(); } },
      setInterval(callback) { const id = nextTimer++; timers.set(id, callback); return id; },
      clearInterval(id) { timers.delete(id); },
    },
  }, { filename: sourcePath });
  return {
    render(props = {}) {
      let tree;
      for (let count = 0; count < 5; count++) {
        dirty = false; stateIndex = 0; effectIndex = 0;
        tree = exports[componentName](props);
        while (pending.length) pending.shift()();
        if (!dirty) return resolveCopyScopes(tree);
      }
      throw new Error("Component did not settle");
    },
    setHidden(hidden) { document.hidden = hidden; for (const listener of visibilityListeners) listener(); },
    get visibilityListenerCount() { return visibilityListeners.size; },
    tick() { for (const callback of timers.values()) callback(); },
    dispose() { effects.forEach((effect) => effect?.cleanup?.()); },
    get timerCount() { return timers.size; },
    get requests() { return requests; },
  };
}
function descendants(element, result = []) {
  if (Array.isArray(element)) element.forEach((node) => descendants(node, result));
  else if (element?.props) { result.push(element); descendants(element.props.children, result); }
  return result;
}
function text(element) {
  if (Array.isArray(element)) return element.map(text).join("");
  if (typeof element === "string" || typeof element === "number") return String(element);
  return element?.props ? text(element.props.children) : "";
}
function button(tree, label) { return descendants(tree).find((node) => node.type === "button" && (text(node) === label || node.props["aria-label"] === label)); }
function control(tree, label) { return descendants(tree).find((node) => typeof node.props.onChange === "function" && node.props["aria-label"] === label); }
function images(tree) { return descendants(tree).filter((node) => node.type === "img"); }
function click(tree, label) { const element = button(tree, label); assert.ok(element, label); element.props.onClick(); }
function assertFrame(tree, sequence, index, channelCount = 1) {
  const views = images(tree).filter((node) => node.props.src.includes(sequence));
  assert.equal(views.length, channelCount);
  assert.ok(views.every((node) => node.props.src.includes(`frame-${String(index).padStart(2, "0")}-`)));
}

test("playback wraps, scrubs, pauses and resets across complete sequences", () => {
  const app = harness("CfdFlowPlayer"); let tree = app.render();
  assertFrame(tree, "gnn-rollout", 0);
  assert.ok(images(tree)[0].props.src.endsWith("velocity-y.webp"), "Vertical velocity is the first animation");
  click(tree, "Previous frame"); tree = app.render(); assertFrame(tree, "gnn-rollout", 19);
  click(tree, "Next frame"); tree = app.render(); assertFrame(tree, "gnn-rollout", 0);
  control(tree, "Flow frame").props.onChange({ target: { value: "18" } }); tree = app.render();
  button(tree, "Next frame").props.onClick(); tree = app.render(); assertFrame(tree, "gnn-rollout", 19);
  const play = descendants(tree).find((node) => node.type === "button" && text(node).startsWith("Play flow"));
  assert.ok(play && !play.props.disabled); play.props.onClick(); tree = app.render(); assert.equal(app.timerCount, 1);
  app.tick(); tree = app.render(); assertFrame(tree, "gnn-rollout", 0);
  click(tree, "Simulation sequence"); tree = app.render(); assertFrame(tree, "gnn-simulation", 0); assert.equal(app.timerCount, 0);
  click(tree, "Previous frame"); tree = app.render(); assertFrame(tree, "gnn-simulation", 29);
  control(tree, "Flow frame").props.onChange({ target: { value: "4" } }); tree = app.render(); assertFrame(tree, "gnn-simulation", 4);
  click(tree, "All three fields"); tree = app.render(); assertFrame(tree, "gnn-simulation", 4, 3);
  click(tree, "Horizontal velocity · u"); tree = app.render(); assertFrame(tree, "gnn-simulation", 4);
  assert.ok(images(tree)[0].props.src.endsWith("velocity-x.webp"));
  click(tree, "Pressure · p"); tree = app.render(); assert.ok(images(tree)[0].props.src.endsWith("pressure.webp"));
  click(tree, "Play flow"); tree = app.render(); assert.equal(app.timerCount, 1);
  click(tree, "FNO & U-Net forecasts"); tree = app.render(); assert.equal(app.timerCount, 0);
});

test("background playback preserves its frame and resumes without duplicate timers", () => {
  const app = harness("CfdFlowPlayer"); let tree = app.render();
  click(tree, "Play flow"); app.render(); assert.equal(app.timerCount, 1);
  app.tick(); tree = app.render(); assertFrame(tree, "gnn-rollout", 1);
  app.setHidden(true); assert.equal(app.timerCount, 0);
  app.tick(); tree = app.render(); assertFrame(tree, "gnn-rollout", 1);
  app.setHidden(false); app.setHidden(false); assert.equal(app.timerCount, 1);
  app.tick(); tree = app.render(); assertFrame(tree, "gnn-rollout", 2);
  click(tree, "Pause flow"); app.render(); assert.equal(app.timerCount, 0);
  assert.equal(app.visibilityListenerCount, 0);
  app.setHidden(true); app.setHidden(false); assert.equal(app.timerCount, 0);
  click(app.render(), "Play flow"); app.render(); app.dispose();
  assert.equal(app.timerCount, 0); assert.equal(app.visibilityListenerCount, 0);
});

test("animation preload fetches only the selected channel", () => {
  const app = harness("CfdFlowPlayer"); let tree = app.render();
  assert.equal(app.requests.length, 20);
  assert.ok(app.requests.every((path) => path.endsWith("velocity-y.webp")));
  click(tree, "FNO & U-Net forecasts"); tree = app.render();
  assert.equal(app.requests.length, 20, "Still figures do not preload more animation frames");
});

test("forecast choices use their matching saved scientific figures", () => {
  const app = harness("CfdFlowPlayer"); let tree = app.render(); click(tree, "FNO & U-Net forecasts"); tree = app.render();
  for (const [label, file] of [["Fourier operator", "fno-baseline-prediction.webp"], ["Residual FNO", "fno-residual-prediction.webp"], ["Position-encoded FNO", "fno-multiscale-prediction.webp"], ["U-Net", "unet-prediction.webp"]]) {
    click(tree, label); tree = app.render();
    assert.equal(images(tree)[0].props.src, `/projects/neural-cfd/media/${file}`);
  }
});

test("microrobot labels match the recorded pose classes and depth targets", () => {
  const app = harness("MicrorobotResults"); let tree = app.render();
  for (const [id, pose, pitch, roll, depth] of [[1,12,30,45,"0.18"], [2,27,60,0,"0.36"], [3,39,90,0,"0.47"]]) {
    click(tree, `Sample ${id}`); tree = app.render(); click(tree, "Pose classification"); tree = app.render();
    assert.ok(text(tree).includes(`${pitch}° pitch · ${roll}° roll`));
    const reading = descendants(tree).find((node) => node.props.className === "robotReading");
    assert.ok(text(reading).includes(`Pose class${pose}`));
    assert.equal(images(tree)[0].props.src, `/projects/microrobot/media/pose-sample-${id}-original.webp`);
    click(tree, "Depth estimation"); tree = app.render();
    assert.ok(text(tree).includes(`Labelled depth${depth} · normalised`));
    assert.ok(!text(tree).includes("PREDICTED DEPTH"), "The saved figures supply targets only");
    assert.equal(images(tree)[0].props.src, `/projects/microrobot/media/depth-sample-${id}-original.webp`);
  }
  const slider = control(tree, "Heatmap blend");
  if (slider) {
    slider.props.onChange({ target: { value: "100" } }); tree = app.render();
    const layer = images(tree).find((node) => node.props.className === "blendLayer");
    assert.equal(layer.props.style.opacity, 1);
    assert.ok(layer.props.src.endsWith("-heatmap.webp"), "A 100% heatmap control must use the raw heatmap; a saved overlay is already blended");
  }
});
test("CFD pinned comparisons stay within one sequence and report ordinal offsets", () => {
  const app = harness("CfdFlowPlayer"); let tree = app.render();
  click(tree, "Pin current frame"); tree = app.render();
  assert.equal(images(tree).length, 2);
  click(tree, "Next frame"); tree = app.render();
  assert.ok(images(tree)[0].props.src.includes("gnn-rollout/frame-00-velocity-y"));
  assert.ok(images(tree)[1].props.src.includes("gnn-rollout/frame-01-velocity-y"));
  assert.ok(text(tree).includes("Offset +1 saved-frame intervals"));
  control(tree, "Flow frame").props.onChange({ target: { value: "12" } }); tree = app.render();
  click(tree, "Pin current frame"); tree = app.render();
  click(tree, "Previous frame"); tree = app.render();
  assert.ok(text(tree).includes("Offset -1 saved-frame intervals"));
  click(tree, "Simulation sequence"); tree = app.render();
  assertFrame(tree, "gnn-simulation", 0);
  assert.equal(button(tree, "Clear reference").props.disabled, true, "A reference cannot cross sequences");
  click(tree, "Pin current frame"); tree = app.render();
  click(tree, "Clear reference"); tree = app.render(); assertFrame(tree, "gnn-simulation", 0);
});

test("same-input comparison preserves source maps, targets and shared blend", () => {
  const app = harness("MicrorobotResults"); let tree = app.render();
  click(tree, "Compare tasks"); tree = app.render();
  assert.ok(text(tree).includes("Why is the depth map blue?"));
  for (const [sample, pose, target] of [[1, 12, "0.18"], [2, 27, "0.36"], [3, 39, "0.47"]]) {
    click(tree, `Sample ${sample}`); tree = app.render();
    const originals = images(tree).filter((node) => node.props.src.endsWith("-original.webp") && !node.props.src.includes("microscopy-"));
    assert.equal(originals.length, 3);
    assert.ok(originals.every((node) => node.props.src === `/projects/microrobot/media/pose-sample-${sample}-original.webp`));
    const layers = images(tree).filter((node) => node.props.className === "blendLayer");
    assert.deepEqual(layers.map((node) => node.props.src), ["pose", "depth"].map((task) => `/projects/microrobot/media/${task}-sample-${sample}-heatmap.webp`));
    assert.ok(text(tree).includes(`Label / prediction · ${pose} / ${pose}`));
    assert.ok(text(tree).includes(`Recorded target · ${target}`));
    assert.ok(!text(tree).includes("PREDICTED DEPTH"));
    for (const blend of [0, 100]) {
      control(tree, "Heatmap blend").props.onChange({ target: { value: String(blend) } }); tree = app.render();
      assert.ok(images(tree).filter((node) => node.props.className === "blendLayer").every((node) => node.props.style.opacity === blend / 100));
    }
  }
  assert.ok(text(tree).includes("do not represent equal confidence"));
});

test("new comparison controls use the project locale context", () => {
  for (const [locale, compare, sample, blend, pin, clear] of [
    ["zh-CN", "比较任务", "样本 3", "热图混合", "固定当前帧", "清除参考帧"],
    ["zh-TW", "比較任務", "樣本 3", "熱圖混合", "固定目前影格", "清除參考影格"],
  ]) {
    const robot = harness("MicrorobotResults", compiled, locale); let tree = robot.render();
    click(tree, compare); tree = robot.render(); click(tree, sample); tree = robot.render();
    assert.ok(control(tree, blend)); assert.ok(text(tree).includes("0.47"));
    const flow = harness("CfdFlowPlayer", compiled, locale); tree = flow.render();
    click(tree, pin); tree = flow.render(); assert.equal(images(tree).length, 2);
    click(tree, clear); tree = flow.render(); assert.equal(images(tree).length, 1);
  }
});

const architecturePath = join(root, "src/components/projects/CfdArchitectureStudio.tsx");
const architectureCompiled = ts.transpileModule(readFileSync(architecturePath, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  fileName: architecturePath,
}).outputText + "\nexports.FnoStudio = FnoStudio;";

test("FNO operator walkthrough starts paused, cycles in order and cleans up", () => {
  const app = harness("FnoStudio", architectureCompiled);
  const selectedPhase = (tree) => descendants(tree).find((node) => node.props.phase)?.props.phase;
  let tree = app.render({ viewMode: "diagram" });
  assert.equal(app.timerCount, 0, "All visitors, including reduced-motion users, start paused");
  click(tree, "Play operator animation"); tree = app.render({ viewMode: "diagram" });
  assert.equal(selectedPhase(tree), "spatial"); assert.equal(app.timerCount, 1);
  for (const expectedPhase of ["fft", "weights", "inverse", "spatial"]) {
    app.tick(); tree = app.render({ viewMode: "diagram" }); assert.equal(selectedPhase(tree), expectedPhase);
  }
  click(tree, "Pause operator animation"); tree = app.render({ viewMode: "diagram" }); assert.equal(app.timerCount, 0);
  click(tree, "Play operator animation"); tree = app.render({ viewMode: "diagram" });
  app.render({ viewMode: "table" }); assert.equal(app.timerCount, 0, "Hidden diagram has no timer");
  app.render({ viewMode: "diagram" }); app.dispose(); assert.equal(app.timerCount, 0, "Unmount clears timer");
});

function compileScientific(name, exports = "") {
  const path = join(root, `src/components/projects/${name}.tsx`);
  return ts.transpileModule(readFileSync(path, "utf8"), { fileName: path, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText + exports;
}
const scientificArchitectureBody = compileScientific("CfdArchitectureStudio", "\nexports.FnoStudio = FnoStudio; exports.GnnStudio = GnnStudio; exports.UnetStudio = UnetStudio;");
const microscopyArchitectureBody = compileScientific("ModelArchitectureStudio");
const lineageBody = compileScientific("ModelLineageMap");
const benchmarkBody = compileScientific("ScientificDemos");
const { projectText } = loadCopyModule("src/lib/projectCopy.ts");
function translate(locale, source) { return projectText(locale, scientificCopy, source); }
function assertLocalised(tree, forbidden, context) {
  const visible = text(tree);
  for (const source of forbidden) assert.ok(!visible.includes(source), `${context}: untranslated ${source}`);
  assert.match(visible, /[\u3400-\u9fff]/u, `${context}: Mandarin copy is present`);
}

test("Mandarin playback states translate channels, captions and accessible image descriptions", () => {
  for (const locale of ["zh-CN", "zh-TW"]) {
    const flow = harness("CfdFlowPlayer", compiled, locale); let tree = flow.render();
    for (const sequence of ["GNN prediction", "Simulation sequence"]) {
      click(tree, translate(locale, sequence)); tree = flow.render();
      for (const channel of ["Vertical velocity · v", "Horizontal velocity · u", "Pressure · p", "All three fields"]) {
        click(tree, translate(locale, channel)); tree = flow.render();
        assertLocalised(tree, ["Flow field channel", "Reading the animation", "Recorded GNN results", "velocity ·", "Pressure ·"], `${locale}/${sequence}/${channel}`);
        for (const item of images(tree)) assert.ok(!/frame|flow past|reference|predicted|simulation/i.test(item.props.alt), item.props.alt);
      }
    }
    click(tree, translate(locale, "FNO & U-Net forecasts")); tree = flow.render();
    for (const label of ["Fourier operator", "Residual FNO", "Position-encoded FNO", "U-Net"]) {
      click(tree, translate(locale, label)); tree = flow.render();
      assert.ok(!/saved horizontal|around a cylinder/.test(images(tree)[0].props.alt));
    }
    const robot = harness("MicrorobotResults", compiled, locale); tree = robot.render();
    for (const task of ["Pose classification", "Depth estimation", "Compare tasks"]) {
      click(tree, translate(locale, task)); tree = robot.render();
      for (const sample of [1, 2, 3]) {
        click(tree, translate(locale, `Sample ${sample}`)); tree = robot.render();
        assertLocalised(tree, ["Labelled depth", "Pose class", "Microscope image", "How to interpret", "Model response"], `${locale}/${task}/${sample}`);
        for (const item of images(tree)) assert.ok(!/sample|microscop|pitch|roll|adjustable|attribution overlay/i.test(item.props.alt), item.props.alt);
      }
    }
  }
});

test("Mandarin CFD diagrams and architecture tables retain all four FNO designs and mesh/skip controls", () => {
  for (const locale of ["zh-CN", "zh-TW"]) {
    const fno = harness("FnoStudio", scientificArchitectureBody, locale, true); let tree = fno.render({ viewMode: "diagram" });
    for (const label of ["Baseline", "Four-block extension", "Later experiment", "Multi-scale design"]) {
      const target = descendants(tree).find(node => node.type === "button" && text(node).startsWith(translate(locale, label)));
      assert.ok(target, label); target.props.onClick();
      for (const viewMode of ["diagram", "table"]) {
        tree = fno.render({ viewMode });
        assertLocalised(tree, ["physical channels", "input features", "spectral", "Supply the flow", "Shape / width", "Evaluation result unavailable", "DESIGN"], `${locale}/FNO/${label}/${viewMode}`);
      }
      tree = fno.render({ viewMode: "diagram" });
    }
    for (const [component, controlLabel, value] of [["GnnStudio", "Processor block", "10"], ["UnetStudio", null, null]]) {
      const app = harness(component, scientificArchitectureBody, locale, true); tree = app.render({ viewMode: "diagram" });
      if (controlLabel) { control(tree, translate(locale, controlLabel)).props.onChange({ target: { value } }); tree = app.render({ viewMode: "diagram" }); }
      tree = app.render({ viewMode: "table" });
      assertLocalised(tree, ["Raw node", "Raw edge", "latent width", "Selected skip", "Describe the", "Role", "Shape / width"], `${locale}/${component}`);
    }
  }
});

test("Mandarin microscopy architecture translates every model/task/stage without changing recorded counts", () => {
  for (const locale of ["zh-CN", "zh-TW"]) {
    const app = harness("ModelArchitectureStudio", microscopyArchitectureBody, locale, true); let tree = app.render({ locale });
    for (const model of ["SimpleCNN", "ResNet18", "ResNet34", "MobileNetV3", "ViT-B/16"]) {
      const choice = descendants(tree).find(node => node.type === "button" && descendants(node).some(child => child.type === "strong" && text(child) === model));
      assert.ok(choice, model); choice.props.onClick(); tree = app.render({ locale });
      for (const task of ["Pose · 40 class", "Depth · regression"]) {
        click(tree, translate(locale, task)); tree = app.render({ locale });
        const stages = descendants(tree).filter(node => node.type === "button" && node.props["aria-label"]?.startsWith(locale === "zh-CN" ? "查看 " : "查看 "));
        assert.ok(stages.length >= 5, `${model} stage buttons`);
        for (const stage of stages) {
          stage.props.onClick(); tree = app.render({ locale });
          assertLocalised(tree, ["CUSTOM MODEL", "IMAGENET PRETRAINING", "architectureNote", "features", "normalized depth", "downsample on entry", "Selected tensor", "Role"], `${locale}/${model}/${task}`);
        }
        assert.ok(text(tree).includes(model));
        const counts = { SimpleCNN: [4154856, 4134849], ResNet18: [11190760, 11301825], ResNet34: [21298920, 21409985], MobileNetV3: [1558568, 1518593], "ViT-B/16": [85435432, 85601793] };
        assert.ok(text(tree).includes(counts[model][task.startsWith("Pose") ? 0 : 1].toLocaleString("en-GB")), `${model}: original exact parameter count`);
      }
    }
  }
});

test("Mandarin lineage views translate development filters, design context and model scale", () => {
  for (const locale of ["zh-CN", "zh-TW"]) {
    const app = harness("ModelLineageMap", lineageBody, locale, true); let tree = app.render({ onSelectProject() {} });
    for (const view of ["Development", "Parameter scale", "Design guide"]) {
      const target = descendants(tree).find(node => node.type === "button" && text(node).endsWith(translate(locale, view)));
      assert.ok(target, view); target.props.onClick(); tree = app.render({ onSelectProject() {} });
      assertLocalised(tree, ["Select a milestone", "Trainable parameter scale", "ImageNet pretraining", "Custom CNN trained", "What must the model", "Activity", "All activities"], `${locale}/${view}`);
    }
  }
});
test("Mandarin recorded CFD and microscopy benchmarks translate model, field and sample states", () => {
  for (const locale of ["zh-CN", "zh-TW"]) {
    const cfd = harness("CfdSurrogateDemo", benchmarkBody, locale, true); let tree = cfd.render();
    for (const [name, result] of [["FNO", "0.0163"], ["GNN", "0.0165"], ["U-Net", "1.2823"]]) {
      const chosen = descendants(tree).find(node => node.type === "button" && descendants(node).some(child => child.type === "strong" && text(child) === name));
      assert.ok(chosen, name); chosen.props.onClick(); tree = cfd.render();
      for (const field of ["Ground truth", "Prediction", "Absolute error"]) {
        click(tree, translate(locale, field)); tree = cfd.render();
        for (let snapshot = 0; snapshot < 3; snapshot++) {
          click(tree, translate(locale, "Next snapshot →")); tree = cfd.render();
          assertLocalised(tree, ["Recorded baseline evaluation", "Recorded 500-file evaluation", "Shifted 20-file", "Spectral operator", "Message passing", "Rasterised", "TRUTH", "PREDICTION", "ERROR"], `${locale}/${name}/${field}`);
          assert.ok(text(tree).includes(result));
        }
      }
    }
    const robot = harness("MicrorobotVisionDemo", benchmarkBody, locale, true); tree = robot.render({ locale });
    for (const model of ["simple", "resnet18", "resnet34", "mobile", "vit"]) {
      descendants(tree).find(node => node.type === "select" && descendants(node).some(child => child.type === "option" && child.props.value === "resnet34")).props.onChange({ target: { value: model } });
      tree = robot.render({ locale });
      for (const task of ["Pose classification", "Depth regression"]) {
        click(tree, translate(locale, task)); tree = robot.render({ locale });
        for (const view of ["Pose", "Depth", "Grad-CAM style"]) {
          click(tree, translate(locale, view)); tree = robot.render({ locale });
          for (const frame of [0, 1, 2]) {
            descendants(tree).find(node => node.type === "select" && typeof node.props.value === "number").props.onChange({ target: { value: String(frame) } }); tree = robot.render({ locale });
            assertLocalised(tree, ["Frame A", "Frame B", "Frame C", "From scratch", "normalised held-out error", "POSE ACCURACY", "recorded pose"], `${locale}/${model}/${task}/${view}/${frame}`);
          }
        }
      }
    }
  }
});

test("Mandarin reliability state changes preserve the recorded calibration trade-off", () => {
  for (const locale of ["zh-CN", "zh-TW"]) {
    const app = harness("ReliabilityLabDemo", benchmarkBody, locale, true); let tree = app.render();
    for (const [state, nll] of [["Before", "0.547396"], ["After", "0.547561"]]) {
      click(tree, translate(locale, state)); tree = app.render();
      assert.ok(text(tree).includes(nll));
      for (let index = 0; index < 3; index++) {
        descendants(tree).find(node => node.type === "input" && node.props.type === "range").props.onChange({ target: { value: String(index) } }); tree = app.render();
        assertLocalised(tree, ["Target coverage", "Average width", "Empirical coverage", "Saved coverage", "full interval width"], `${locale}/${state}/${index}`);
        const description = descendants(tree).find(node => node.props["aria-label"]?.includes(locale === "zh-CN" ? "共形区间" : "共形區間"));
        assert.ok(description, "Translated calculated interval description");
      }
    }
  }
});
console.log(`Scientific media: ${passed} checks, ${scientificMedia.length} saved images.`);
