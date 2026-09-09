import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const root = new URL("../", import.meta.url);
const require = createRequire(import.meta.url);
const React = require("react");
const source = readFileSync(new URL("src/lib/mriUncertainty.ts", root), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
const { mriUncertaintySample } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} != ${expected}`);

// Values independently calculated from the eight residuals in decimal arithmetic.
const aligned = mriUncertaintySample(1, false, 4);
near(aligned.fullMse, 0.059825);
near(aligned.meanUncertainty, 0.1925);
near(aligned.retainedMse, 0.005925);
near(aligned.oracleMse, 0.005925);
near(aligned.relativeEce, 0);
const reversed = mriUncertaintySample(1, true, 4);
near(reversed.retainedMse, 0.113725);
near(reversed.oracleMse, 0.005925);
// All eight pixels occupy distinct source bins; |normalised reversed - error| sums to 25/6.
near(reversed.relativeEce, 25 / 48);
assert.deepEqual(reversed.rows.filter((row) => row.removed).map((row) => row.id), [1, 2, 3, 4]);

for (const scale of [0.25, 0.5, 1, 2, 8]) {
  for (const reverse of [false, true]) {
    for (let removed = 0; removed <= 6; removed += 1) {
      const sample = mriUncertaintySample(scale, reverse, removed);
      const reference = mriUncertaintySample(1, reverse, removed);
      near(sample.relativeEce, reference.relativeEce);
      near(sample.meanUncertainty, 0.1925 * scale);
      near(sample.fullMse, 0.059825);
      near(sample.retainedMse, reference.retainedMse);
      assert.equal(sample.retainedCount, 8 - removed);
      assert.ok(sample.retainedMse >= sample.oracleMse - 1e-12);
      if (!reverse || removed === 0) near(sample.retainedMse, sample.oracleMse);
    }
  }
}
for (const scale of [0, -1, NaN, Infinity]) assert.throws(() => mriUncertaintySample(scale, false, 4), RangeError);
for (const removed of [-1, 1.5, 8]) assert.throws(() => mriUncertaintySample(1, false, removed), RangeError);

// Invoke the actual controls and inspect their rendered readouts after each change.
const states = [];
let stateIndex = 0;
const evaluated = { exports: {} };
const component = ts.transpileModule(readFileSync(new URL("src/components/projects/MriTrustStudio.tsx", root), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
});
runInNewContext(component.outputText, {
  module: evaluated,
  exports: evaluated.exports,
  require(name) {
    if (name === "react") return {
      ...React,
      useId: () => "mri-test",
      useState(initial) {
        const index = stateIndex++;
        if (!(index in states)) states[index] = initial;
        return [states[index], (next) => { states[index] = next; }];
      },
    };
    if (name === "@/lib/mriUncertainty") return { mriUncertaintySample };
    if (name === "@/lib/i18n") return { translateText: (_, text) => text };
    if (name === "@/lib/projectCopy") return { projectText: (_locale, _copy, text) => text };
    if (name === "./ProjectTranslationBoundary") return { useProjectLocale: () => "en-GB", ProjectCopy: (props) => props.children };
    if (name === "./copy/mriCopy") return { mriCopy: {} };
    if (name === "./MathEquation") return { MathEquation: (props) => React.createElement("math", props) };
    if (name === "./SourceExperiments" || name === "./DemoChrome") return {};
    if (name.endsWith(".module.css")) return { __esModule: true, default: new Proxy({}, { get: (_, key) => key }) };
    return require(name);
  },
});
function descendants(node) {
  if (Array.isArray(node)) return node.flatMap(descendants);
  return node?.props ? [node, ...descendants(node.props.children)] : [];
}
const render = () => { stateIndex = 0; return descendants(evaluated.exports.UncertaintyRankingExperiment()); };
const readout = (nodes, label) => nodes.find((node) => node.props.label === label)?.props.value;
let nodes = render();
assert.equal(readout(nodes, "RELATIVE ECE ↓"), "0.0000");
nodes.find((node) => node.props.id === "mri-test-scale").props.onChange({ target: { value: "8" } });
nodes = render();
assert.equal(readout(nodes, "RELATIVE ECE ↓"), "0.0000");
assert.equal(readout(nodes, "MEAN UNCERTAINTY"), "1.5400");
nodes.find((node) => node.type === "button" && node.props.children === "Reversed").props.onClick();
nodes = render();
assert.equal(readout(nodes, "RETAINED MSE ↓"), "0.113725");
assert.equal(readout(nodes, "ORACLE MSE ↓"), "0.005925");
nodes.find((node) => node.props.id === "mri-test-remove").props.onChange({ target: { value: "0" } });
nodes = render();
assert.equal(readout(nodes, "RETAINED MSE ↓"), readout(nodes, "ORACLE MSE ↓"));
assert.equal(nodes.filter((node) => node.type === "tr" && node.props["data-removed"]).length, 0);

console.log("MRI uncertainty: 70 scale/ranking/removal configurations, independent MSE/ECE arithmetic, invalid budgets, and actual scale/ranking/removal controls passed.");
