import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const cache = new Map();
function load(path) {
  const absolute = resolve(root, path);
  if (cache.has(absolute)) return cache.get(absolute);
  const evaluated = { exports: {} };
  const output = ts.transpileModule(readFileSync(absolute, "utf8"), {
    fileName: absolute,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  runInNewContext(output, { module: evaluated, exports: evaluated.exports, require(name) {
    if (name.startsWith("@/")) return load(`src/${name.slice(2)}.ts`);
    if (name.startsWith(".")) return load(resolve(dirname(absolute), `${name}.ts`));
    return require(name);
  } }, { filename: absolute });
  cache.set(absolute, evaluated.exports);
  return evaluated.exports;
}

const { projects, accessMeta } = load("src/data/projects.ts");
const { projectStories, projectCaseStudies } = load("src/components/projects/projectStories.ts");
const { projectOrigins } = load("src/data/projectOrigins.ts");
const { projectNarrativeCopy } = load("src/components/projects/copy/projectNarrativeCopy.ts");
const { projectMenuCopy } = load("src/components/projectMenuCopy.ts");
const { getProjectText } = load("src/lib/projectNarrative.ts");
const audit = JSON.parse(readFileSync(resolve(root, "src/components/projects/copy/projectNarrativeCopy.audit.json"), "utf8"));
const sources = new Set();
const add = (value) => {
  if (typeof value === "string") sources.add(value);
  else if (Array.isArray(value)) value.forEach(add);
};
for (const project of projects) {
  for (const key of [project.title, project.shortTitle, project.summary].filter(Boolean)) assert.equal(JSON.stringify(projectMenuCopy[key]), JSON.stringify(projectNarrativeCopy[key]), `Desktop project translation drift: ${key}`);
  for (const field of ["title", "shortTitle", "eyebrow", "summary", "detail", "tools", "highlights", "privacyNote", "area", "status"]) add(project[field]);
  project.phases.forEach(phase => { add(phase.label); add(phase.text); });
  project.artifacts?.forEach(artifact => add(artifact.label));
  if (project.preview) { add(project.preview.alt); add(project.preview.caption); }
}
for (const story of [...Object.values(projectStories), ...Object.values(projectCaseStudies)]) Object.values(story).forEach(add);
for (const origin of projectOrigins) { add(origin.label); add(origin.period); add(origin.context); }
for (const meta of Object.values(accessMeta)) Object.values(meta).forEach(add);
add("Career and education connections");

for (const source of sources) {
  const pair = projectNarrativeCopy[source];
  assert.ok(pair?.length === 2, `Missing catalogue/story/origin translation: ${source}`);
  for (const [index, locale] of ["zh-CN", "zh-TW"].entries()) {
    assert.ok(pair[index]?.trim(), `Empty ${locale}: ${source}`);
    assert.equal(getProjectText(locale, source), pair[index], `Untranslated runtime value in ${locale}: ${source}`);
    if (pair[index] === source) assert.ok(audit.identities[source], `Unreviewed English identity in ${locale}: ${source}`);
  }
  assert.ok(!/数据|项目|源代码|软件|运行|传感器|帐户|恢複/.test(pair[1]), `Unreviewed Traditional terminology: ${pair[1]}`);
}
// Preserve the important quantitative interpretation in both language editions.
for (const [slug, tokens] of [
  ["trustworthy-mri-reconstruction", ["31.90", "0.889", "R=4"]],
  ["safe-learning-to-defer", ["89.5%", "64%"]],
  ["cost-sensitive-cyber-detection", ["10,000", "4,904", "54.2%"]],
  ["study-rl", ["25", "32", "19"]],
]) {
  const project = projects.find(item => item.slug === slug);
  for (const locale of ["zh-CN", "zh-TW"]) for (const token of tokens) assert.ok(getProjectText(locale, project.detail).includes(token), `${slug}: ${locale} lost ${token}`);
}
console.log(`Project narratives: ${sources.size} visible strings across ${projects.length} projects, ${Object.keys(projectStories).length} interactive stories, ${Object.keys(projectCaseStudies).length} case studies and ${projectOrigins.length} career connections have explicit CN/TW runtime coverage.`);
