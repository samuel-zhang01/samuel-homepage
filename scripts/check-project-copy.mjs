import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { extractProjectCopyInventory } from "./project-copy-inventory.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const React = require("react");
const cache = new Map();
function load(path) {
  const absolute = resolve(root, path);
  if (cache.has(absolute)) return cache.get(absolute);
  const output = ts.transpileModule(readFileSync(absolute, "utf8"), { fileName: absolute, compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
  } }).outputText;
  const evaluated = { exports: {} };
  cache.set(absolute, evaluated.exports);
  runInNewContext(output, { module: evaluated, exports: evaluated.exports, require(name) {
    if (name.startsWith("@/")) return load(`src/${name.slice(2)}.ts`);
    if (name.startsWith(".")) return load(resolve(dirname(absolute), `${name}.ts`));
    return require(name);
  } }, { filename: absolute });
  return evaluated.exports;
}
const { projectText } = load("src/lib/projectCopy.ts");
const { translateText } = load("src/lib/i18n.ts");
const { localiseProjectTree } = load("src/components/projects/ProjectTranslationBoundary.tsx");
const copy = {
  "Ready": ["就绪", "就緒"],
  "Train": ["训练", "訓練"],
  "{count} of {total} samples": ["共 {total} 个样本，已选 {count} 个", "共 {total} 個樣本，已選 {count} 個"],
  "Selected: {0}": ["已选：{0}", "已選：{0}"],
  "Status{0}": ["状态{0}", "狀態{0}"],
  "· ready": ["· 就绪", "· 就緒"],
  "Value (m/s): {0}": ["速度（米/秒）：{0}", "速度（公尺/秒）：{0}"],
};
assert.equal(projectText("zh-CN", copy, "  Ready \n"), "  就绪 \n");
assert.equal(projectText("zh-TW", copy, "3 of 12 samples"), "共 12 個樣本，已選 3 個");
assert.equal(projectText("zh-CN", copy, "{count} of {total} samples", { count: 0, total: 12 }), "共 12 个样本，已选 0 个");
assert.equal(projectText("zh-TW", copy, "Selected: Train"), "已選：訓練");
assert.equal(projectText("zh-TW", copy, "Value (m/s): 1.5"), "速度（公尺/秒）：1.5");
assert.equal(projectText("zh-TW", copy, "Status · ready"), "狀態 · 就緒", "template captures normalize lookup keys while retaining surrounding spaces");
assert.equal(projectText("zh-TW", copy, "Status"), "狀態", "an explicitly registered optional template fragment may be empty");
assert.equal(projectText("zh-CN", copy, "Unknown formula x = 2"), "Unknown formula x = 2");
assert.equal(projectText("en-GB", copy, "{count} of {total} samples", { count: 3, total: 12 }), "3 of 12 samples");
const source = React.createElement("section", { lang: "en-GB", title: "Ready", "aria-label": "Ready" },
  React.createElement("p", null, 3, " of ", 12, " samples"),
  React.createElement("code", null, "Ready"),
  React.createElement("span", { translate: "no" }, "Ready"));
const result = localiseProjectTree(source, "zh-TW", copy);
assert.equal(result.props.lang, "zh-TW");
assert.equal(result.props.title, "就緒");
assert.equal(result.props["aria-label"], "就緒");
assert.equal(result.props.children[0].props.children[0], "共 12 個樣本，已選 3 個");
assert.equal(result.props.children[1].props.children, "Ready");
assert.equal(result.props.children[2].props.children, "Ready");
assert.equal(source.props.title, "Ready", "source tree remains immutable");
function Child() { throw new Error("A copy scope must never invoke another component"); }
const deferred = localiseProjectTree(React.createElement(Child, { appName: "Ready", purpose: "Train", footer: React.createElement("p", null, "Ready") }), "zh-TW", copy);
assert.equal(deferred.type, Child);
assert.equal(deferred.props.appName, "就緒");
assert.equal(deferred.props.footer.props.children[0], "就緒");
const math = localiseProjectTree(React.createElement(Child, { tex: String.raw`x_{\mathrm{Ready}}=2`, label: "Ready" }), "zh-TW", copy);
assert.equal(math.props.tex, String.raw`x_{\mathrm{Ready}}=2`);
assert.equal(math.props.label, "就緒");

const directory = resolve(root, "src/components/projects/copy");
const placeholders = (text) => [...text.matchAll(/\{([a-zA-Z0-9_]+)\}/g)].map((match) => match[1]).sort().join(",");
const errors = [];
let entryCount = 0;
let sourceCount = 0;
for (const name of readdirSync(directory).filter((name) => name.endsWith(".audit.json"))) {
  const audit = JSON.parse(readFileSync(resolve(directory, name), "utf8"));
  const table = load(resolve(directory, audit.dictionary))[audit.exportName];
  assert.ok(table && typeof table === "object", `${name}: dictionary export exists`);
  const identities = audit.identities ?? {};
  for (const [source, translations] of Object.entries(table)) {
    entryCount += 1;
    if (source !== source.replace(/\s+/g, " ").trim()) errors.push(`${name}: source key has unnormalised whitespace: ${source}`);
    if (!Array.isArray(translations) || translations.length !== 2) { errors.push(`${name}: expected CN/TW pair: ${source}`); continue; }
    for (const [index, text] of translations.entries()) {
      if (typeof text !== "string" || !text.trim()) { errors.push(`${name}: missing locale ${index}: ${source}`); continue; }
      if (placeholders(text) !== placeholders(source)) errors.push(`${name}: placeholder mismatch in locale ${index}: ${source}`);
      if (/[a-z]{2}/i.test(source) && text === source && !identities[source]) errors.push(`${name}: unexplained English identity in locale ${index}: ${source}`);
    }
  }
  for (const [source, reason] of Object.entries(identities)) {
    if (typeof reason !== "string" || reason.trim().length < 12) errors.push(`${name}: explain preserved source/proper name: ${source}`);
  }
  for (const path of [...audit.sources, ...(audit.dataSources ?? [])]) {
    sourceCount += 1;
    const source = readFileSync(resolve(root, path), "utf8");
    if (audit.sources.includes(path) && !source.includes("<ProjectCopy")) errors.push(`${path}: missing explicit returned-JSX scope`);
    for (const entry of extractProjectCopyInventory(source, path)) {
      if (table[entry.source] || identities[entry.source]) continue;
      if (["zh-CN", "zh-TW"].every((locale) => translateText(locale, entry.source) !== entry.source)) continue;
      errors.push(`${path}:${entry.lines[0]} [${entry.id}] missing reviewed copy: ${entry.source}`);
    }
  }
}
assert.equal(errors.length, 0, `Project copy audit failed:\n${errors.join("\n")}`);
console.log(`Project copy: ${entryCount} bilingual entries in ${sourceCount} registered source files; interpolation, accessible props, footer, source exclusions, immutable math and component boundaries passed. Unregistered demos remain explicitly outside this coverage count.`);
