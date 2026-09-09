/**
 * Execute the real experiment components without a browser or remote services.
 *
 * The harness supplies useState and presentation-only imports. It transpiles the
 * actual TSX, invokes its controls, and checks rendered values against source
 * fixtures or independently derived arithmetic. Layout, browser events and full
 * TypeScript checking remain the responsibility of the UI/build checks.
 *
 * Intended location: scripts/check-source-experiments.mjs
 * Run: node scripts/check-source-experiments.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDirectory, "..");
const require = createRequire(join(repositoryRoot, "package.json"));
const ts = require("typescript");
const React = require("react");
const fixtures = JSON.parse(
  readFileSync(join(scriptDirectory, "fixtures", "source-experiments.json"), "utf8"),
);
const results = [];

function test(name, check) {
  try {
    check();
    results.push({ name, passed: true });
    console.log(`PASS ${name}`);
  } catch (error) {
    results.push({ name, passed: false });
    console.error(`FAIL ${name}\n${error.stack ?? error.message}`);
  }
}

function approximately(actual, expected, tolerance = 1e-8) {
  assert.ok(
    Number.isFinite(actual) && Math.abs(actual - expected) <= tolerance,
    `Expected ${expected} within ${tolerance}; received ${actual}`,
  );
}

function descendants(element, result = []) {
  if (!element || typeof element !== "object") return result;
  if (Array.isArray(element)) {
    for (const child of element) descendants(child, result);
  } else if (element.props) {
    result.push(element);
    descendants(element.props.children, result);
  }
  return result;
}

function text(element) {
  if (typeof element === "string" || typeof element === "number") return String(element);
  if (Array.isArray(element)) return element.map(text).join("");
  return element?.props ? text(element.props.children) : "";
}

function selectWithValue(tree, value) {
  const element = descendants(tree).find(
    (node) => typeof node.props.onChange === "function" && node.props.value === String(value),
  );
  assert.ok(element, `Missing select with value ${value}`);
  return element;
}

function controlWithLabel(tree, fragment) {
  const label = descendants(tree).find(
    (node) => node.type === "label" && text(node).includes(fragment),
  );
  assert.ok(label, `Missing label containing ${fragment}`);
  const control = descendants(label).find((node) => typeof node.props.onChange === "function");
  assert.ok(control, `Label ${fragment} has no change handler`);
  return control;
}

function buttonWithText(tree, label) {
  const element = descendants(tree).find((node) => node.type === "button" && text(node) === label);
  assert.ok(element, `Missing button ${label}`);
  return element;
}

function click(tree, label) {
  buttonWithText(tree, label).props.onClick();
}

function metricValues(tree) {
  const container = descendants(tree).find((node) => node.props.className === "metrics");
  assert.ok(container, "Missing metric readouts");
  return descendants(container).filter((node) => node.type === "strong").map(text);
}

function tableRows(tree) {
  const body = descendants(tree).find((node) => node.type === "tbody");
  assert.ok(body, "Missing table body");
  return descendants(body)
    .filter((node) => node.type === "tr")
    .map((row) => descendants(row).filter((node) => node.type === "td").map(text));
}

function createHarness(filename, componentName) {
  const hookValues = [];
  let hookIndex = 0;
  const statefulReact = {
    ...React,
    useState(initialValue) {
      const index = hookIndex++;
      if (!(index in hookValues)) {
        hookValues[index] = typeof initialValue === "function" ? initialValue() : initialValue;
      }
      return [hookValues[index], (next) => {
        hookValues[index] = typeof next === "function" ? next(hookValues[index]) : next;
      }];
    },
  };

  const sourcePath = join(repositoryRoot, "src", "components", "projects", filename);
  const compiled = ts.transpileModule(readFileSync(sourcePath, "utf8"), {
    fileName: filename,
    reportDiagnostics: true,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  });
  const errors = (compiled.diagnostics ?? []).filter(
    (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error,
  );
  assert.equal(errors.length, 0, `Transpilation errors in ${filename}`);

  const evaluatedModule = { exports: {} };
  runInNewContext(compiled.outputText, {
    module: evaluatedModule,
    exports: evaluatedModule.exports,
    require(name) {
      if (name === "react") return statefulReact;
      if (name === "../ClassicSelect") {
        return { __esModule: true, default: (props) => React.createElement("select", props) };
      }
      if (name === "./DemoChrome") {
        return { DemoWindow: (props) => React.createElement("section", props) };
      }
      if (name === "./MathEquation") {
        return { MathEquation: (props) => React.createElement("span", { "data-equation": props.tex }, props.label ?? props.tex) };
      }
      if (name === "./ProjectTranslationBoundary") return { ProjectCopy: (props) => props.children };
      if (name === "./copy/sourceExperimentsCopy") return { sourceExperimentsCopy: {} };
      if (name === "./copy/scientificCopy") return { scientificCopy: {} };
      if (name.endsWith(".module.css")) {
        return { __esModule: true, default: new Proxy({}, { get: (_, key) => String(key) }) };
      }
      return require(name);
    },
    Math, Date, Intl, Set, Map, Array, console,
  }, { filename: sourcePath });

  assert.equal(typeof evaluatedModule.exports[componentName], "function");
  return {
    render() {
      hookIndex = 0;
      return evaluatedModule.exports[componentName]();
    },
  };
}

function meetingButtons(tree) {
  const group = descendants(tree).find(
    (node) => node.props["aria-label"] === "Generated meeting slots",
  );
  assert.ok(group, "Missing generated meeting slots");
  return descendants(group).filter((node) => node.type === "button");
}

test("DST intervals match all 12 original-source fixtures", () => {
  assert.equal(fixtures.dst.length, 12);
  for (const fixture of fixtures.dst) {
    const harness = createHarness("SourceExperiments.tsx", "SchedulingDstExperiment");
    let tree = harness.render();
    selectWithValue(tree, "autumn").props.onChange({ target: { value: fixture.day } });
    tree = harness.render();
    selectWithValue(tree, 30).props.onChange({ target: { value: String(fixture.duration) } });
    tree = harness.render();
    controlWithLabel(tree, "Add 5 minutes").props.onChange({ target: { checked: fixture.buffers } });
    tree = harness.render();

    const buttons = meetingButtons(tree);
    assert.deepEqual(buttons.map((node) => Number(node.key)), fixture.slots.map(([start]) => start));
    assert.equal(new Set(buttons.map((node) => node.key)).size, buttons.length);

    // Check every displayed interval's endpoint, not only the candidate count.
    for (const [index, button] of buttons.entries()) {
      button.props.onClick();
      tree = harness.render();
      const [start, end] = fixture.slots[index];
      assert.ok(text(tree).includes(new Date(start).toISOString()));
      assert.ok(text(tree).includes(new Date(end).toISOString()));
      assert.equal(end - start, fixture.duration * 60_000);
    }
    selectWithValue(tree, fixture.duration).props.onChange({ target: { value: String(fixture.duration) } });
    assert.ok(text(harness.render()).includes("Select a slot to inspect its interval."));
  }
});

test("DST repeated local hours retain distinct UTC identities", () => {
  const harness = createHarness("SourceExperiments.tsx", "SchedulingDstExperiment");
  const buttons = meetingButtons(harness.render());
  assert.equal(buttons.filter((node) => text(node) === "01:00 BST").length, 1);
  assert.equal(buttons.filter((node) => text(node) === "01:00 GMT").length, 1);
  const repeatedStarts = buttons.filter((node) => /^01:00/.test(text(node))).map((node) => Number(node.key));
  assert.equal(repeatedStarts[1] - repeatedStarts[0], 3_600_000);
});

test("MRI equal squared-error patterns preserve PSNR while MAE changes", () => {
  for (const amplitude of [0.05, 0.1, 0.2]) {
    for (const pattern of ["diffuse", "localised"]) {
      const harness = createHarness("SourceExperiments.tsx", "MriErrorExperiment");
      let tree = harness.render();
      selectWithValue(tree, "diffuse").props.onChange({ target: { value: pattern } });
      tree = harness.render();
      controlWithLabel(tree, "Base residual").props.onChange({ target: { value: String(amplitude) } });
      tree = harness.render();
      const values = descendants(tree).filter((node) => node.type === "dd").map((node) => parseFloat(text(node)));
      assert.equal(values.length, 3);
      // Tolerances account only for the precision of the displayed readouts.
      approximately(values[0], amplitude ** 2, 0.00005);
      approximately(values[1], -20 * Math.log10(amplitude), 0.0051);
      approximately(values[2], pattern === "diffuse" ? amplitude : amplitude / 4, 0.00005);
    }
  }
});

test("MRI sampling budgets match original-source R4/R8/R16 masks", () => {
  assert.equal(fixtures.mriSampling.length, 3);
  for (const fixture of fixtures.mriSampling) {
    const harness = createHarness("SourceExperiments.tsx", "MriErrorExperiment");
    let tree = harness.render();
    selectWithValue(tree, 4).props.onChange({ target: { value: String(fixture.acceleration) } });
    tree = harness.render();
    const expected = `target ${fixture.desired} lines, central band ${fixture.acs} lines, retained ${fixture.lines} lines, effective R = ${fixture.effectiveAcceleration.toFixed(2)}`;
    assert.ok(text(tree).includes(expected), `Missing source-backed budget for R${fixture.acceleration}`);
  }
});

test("Rollout values match a geometric series and reset baseline", () => {
  for (const gain of [0.9, 0.98, 1, 1.02, 1.1]) {
    for (const steps of [1, 20, 40]) {
      const harness = createHarness("ScientificFailureExperiments.tsx", "RolloutExperiment");
      let tree = harness.render();
      controlWithLabel(tree, "Error amplification").props.onChange({ target: { value: String(gain) } });
      tree = harness.render();
      controlWithLabel(tree, "Rollout length").props.onChange({ target: { value: String(steps) } });
      tree = harness.render();
      // Independent closed form, rather than repeating the component's loop.
      const expected = gain === 1 ? 0.01 * steps : 0.01 * (gain ** steps - 1) / (gain - 1);
      approximately(parseFloat(metricValues(tree)[1]), expected, 0.000051);
      const points = descendants(tree).find((node) => node.type === "polyline").props.points.split(" ");
      assert.equal(points.length, steps + 1);
      assert.ok(points.every((point) => point.split(",").every((value) => Number.isFinite(Number(value)))));
      click(tree, "Reset input error each step");
      tree = harness.render();
      approximately(parseFloat(metricValues(tree)[1]), 0.01);
      approximately(parseFloat(metricValues(tree)[2]), 1);
    }
  }
});

test("Sequence splits preserve 12/12 frames while eliminating shared sequences", () => {
  const harness = createHarness("ScientificFailureExperiments.tsx", "SequenceSplitExperiment");
  for (const grouped of [false, true]) {
    let tree = harness.render();
    click(tree, grouped ? "Hold out complete sequences" : "Split individual frames");
    tree = harness.render();
    const assignments = tableRows(tree);
    assert.equal(assignments.length, 6);
    assert.ok(assignments.every((row) => row.length === 4));
    assert.equal(assignments.flat().filter((value) => value === "Train").length, 12);
    assert.equal(assignments.flat().filter((value) => value === "Test").length, 12);
    const overlap = assignments.filter((row) => row.includes("Train") && row.includes("Test")).length;
    assert.equal(overlap, grouped ? 0 : 6);
    assert.equal(metricValues(tree)[1], `${overlap} / 6`);
  }
});

test("Matching preserves one-to-one assignments, tolerance and observed-minus-predicted residuals", () => {
  for (const reverse of [false, true]) {
    for (const tolerance of [5, 10, 29, 30, 60, 61, 100, 110]) {
      const harness = createHarness("ScientificFailureExperiments.tsx", "MatchingOrderExperiment");
      let tree = harness.render();
      if (reverse) {
        click(tree, "Reverse prediction order");
        tree = harness.render();
      }
      controlWithLabel(tree, "Tolerance").props.onChange({ target: { value: String(tolerance) } });
      tree = harness.render();
      const matched = tableRows(tree).filter((row) => row[1] !== "Unassigned");
      assert.equal(new Set(matched.map((row) => row[1])).size, matched.length);
      for (const row of matched) {
        const prediction = Number(row[0].replace(/^\d+\.\s*/, ""));
        const observation = Number(row[1]);
        const residual = parseFloat(row[2].replace("−", "-"));
        assert.ok(Math.abs(residual) <= tolerance);
        approximately(residual, (observation - prediction) * 1000, 0.0051);
      }
      assert.equal(parseInt(metricValues(tree)[0], 10), matched.length);
      if (tolerance === 61) {
        assert.equal(matched.length, reverse ? 2 : 1);
        approximately(parseFloat(metricValues(tree)[1]), reverse ? Math.sqrt(2250) : 10, 0.0051);
        assert.deepEqual(matched.map((row) => parseFloat(row[2].replace("−", "-"))), reverse ? [-30, -60] : [10]);
      }
      if (tolerance === 5) {
        assert.equal(matched.length, 0);
        assert.equal(metricValues(tree)[1], "— kHz");
      }
    }
  }
});

test("Backup replay ends after five events and resets when scenario changes", () => {
  for (const scenario of ["dump", "interrupted", "race"]) {
    const harness = createHarness("SourceExperiments.tsx", "BackupFailureExperiment");
    let tree = harness.render();
    selectWithValue(tree, "dump").props.onChange({ target: { value: scenario } });
    tree = harness.render();
    for (let event = 0; event < 5; event++) {
      click(tree, "Advance one event");
      tree = harness.render();
    }
    const lists = descendants(tree).filter((node) => node.type === "ol");
    assert.equal(lists.length, 2);
    assert.ok(lists.every((list) => descendants(list).filter((node) => node.type === "li").length === 5));
    assert.equal(buttonWithText(tree, "Advance one event").props.disabled, true);
    const nextScenario = scenario === "dump" ? "race" : "dump";
    selectWithValue(tree, scenario).props.onChange({ target: { value: nextScenario } });
    tree = harness.render();
    assert.equal(descendants(tree).filter((node) => node.type === "li").length, 0);
    assert.equal(buttonWithText(tree, "Advance one event").props.disabled, false);
  }
});

const failures = results.filter((result) => !result.passed);
console.log(`Source experiments: ${results.length - failures.length}/${results.length} checks passed.`);
process.exitCode = failures.length ? 1 : 0;
