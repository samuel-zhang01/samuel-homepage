import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildProjectSearch, extractPublicCopy, searchLocales } from "./prepare-project-search.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const { indexes, records } = await buildProjectSearch();
let checks = 0;
function check(name, callback) { callback(); checks += 1; console.log(`✓ ${name}`); }
const document = (locale, slug) => indexes[locale].documents.find((entry) => entry.slug === slug)?.text;

check("Explicit public contexts retain lowercase units and identifier-shaped labels", () => {
  const { text } = extractPublicCopy([
    'const units = [{ label: "mL", value: "millilitres" }, { name: "auto-rotate" }];',
    'function App() { return <div title="aria-looking-label" aria-label={"mL"} className="private-control-class">',
    '{t("auto-rotate")}{translateText(locale, "mL")}{"kg"}',
    '{active ? "spin-fast" : "standBy"}',
    '<option>mmol</option><span placeholder={"x-label"}>cm</span>',
    '</div>; }',
  ].join("\n"));
  for (const value of ["mL", "auto-rotate", "aria-looking-label", "kg", "spin-fast", "standBy", "mmol", "x-label", "cm"]) assert.ok(text.has(value), value);
  assert.ok(!text.has("private-control-class"));
});
check("Visible template literals retain fixed fragments without indexing live values", () => {
  const { text } = extractPublicCopy([
    'function App() { return <p title={`auto-rotate ${speed} mL`}>',
    '{t(`lowercase-prefix ${count} lowercase-suffix`)}',
    '{`page ${current} of ${total}`}',
    '</p>; }',
  ].join("\n"));
  for (const value of ["auto-rotate", "mL", "lowercase-prefix", "lowercase-suffix", "page", "of"]) assert.ok(text.has(value), value);
  for (const value of ["speed", "count", "current", "total"]) assert.ok(!text.has(value), value);
});
check("Rendered JSX whitespace and inline emphasis preserve complete static phrases", () => {
  const { text } = extractPublicCopy('<p>\n  Trace the{" "}\n  <strong>electron density</strong>{" "}without\n  losing the line.\n</p>');
  assert.ok(text.has("Trace the electron density without losing the line."));
  const adjacent = extractPublicCopy('<span>wave<strong>function</strong></span>').text;
  assert.ok(adjacent.has("wavefunction"));
  assert.ok(!adjacent.has("wave function"));
});
check("JSX HTML entities are indexed as the text visitors actually read", () => {
  const { text } = extractPublicCopy('<p>Methodology &amp; provenance: workflow&apos;s &#945; &lt; 2</p>');
  assert.ok(text.has("Methodology & provenance: workflow's α < 2"));
  assert.ok(![...text].some((value) => /&(?:amp|apos|lt);/.test(value)));
});

check("Every project has exactly one nonempty detailed-search document in every locale", () => {
  for (const index of Object.values(indexes)) {
    assert.equal(index.version, 1);
    assert.equal(index.documents.length, records.length);
    assert.equal(new Set(index.documents.map((entry) => entry.slug)).size, records.length);
    for (const entry of index.documents) assert.ok(entry.text.length > 100, entry.slug);
  }
});
check("All nine standalone desk apps have full-copy coverage", () => {
  for (const slug of ["orbital-lab", "desk-note-pad", "desk-sketch-pad", "desk-quick-list", "desk-focus-clock", "desk-pocket-calendar", "desk-calculator", "desk-unit-converter", "desk-colour-studio"]) {
    assert.ok(document("en-GB", slug), slug);
  }
});
check("Deep demo copy covers inactive views and alternative control states", () => {
  const finance = document("en-GB", "ocean-depths-finance");
  for (const phrase of ["An exact replay exercises idempotency", "No pairs pass this configuration.", "PENNY-CLOSE CONTROL"]) assert.ok(finance.includes(phrase), phrase);
  assert.ok(document("en-GB", "desk-colour-studio").includes("Colour Studio holds 12 swatches. Remove one before saving another."));
});
check("Editorial case briefs and build logs are searchable", () => {
  assert.ok(document("en-GB", "sequential-decisions-lab").includes("twelve-seed UCB1/Thompson/epsilon bake-off"));
  for (const { project } of records) for (const phase of project.phases) assert.ok(document("en-GB", project.slug).includes(phase.text), `${project.slug} ${phase.label}`);
});
check("Chinese and English aliases coexist without adding unrelated dictionaries", () => {
  assert.ok(document("zh-CN", "desk-note-pad").includes("插入日期"));
  assert.ok(document("zh-TW", "desk-note-pad").includes("插入日期"));
  assert.ok(document("zh-CN", "desk-note-pad").includes("Insert date"));
  assert.ok(document("zh-CN", "orbital-lab").includes("原子轨道实验室"));
  assert.ok(document("zh-TW", "orbital-lab").includes("原子軌域實驗室"));
  assert.ok(!document("en-GB", "desk-note-pad").includes("Kilobytes"));
  assert.ok(!document("zh-CN", "desk-note-pad").includes("PENNY-CLOSE CONTROL"));
});
check("Shared demo modules do not index every sibling component", () => {
  assert.ok(document("en-GB", "regularisation-lab").includes("Shrinkage Lab"));
  assert.ok(document("en-GB", "causal-ope-lab").includes("Decision Evidence Lab"));
  assert.ok(document("en-GB", "air-quality-sensor-optimisation").includes("Monitor Planner"));
  assert.ok(!document("en-GB", "regularisation-lab").includes("Decision Evidence Lab"));
  assert.ok(!document("en-GB", "air-quality-sensor-optimisation").includes("Shrinkage Lab"));
});
check("Implementation source, private paths, credentials and storage keys are absent", () => {
  const all = JSON.stringify(indexes);
  for (const forbidden of ["gl_Position", "uniform vec2", "normaliseDeskBackupEntry", "samuel-system7-notepad-v1", "/Users/", "process.env", "BEGIN OPENSSH PRIVATE KEY"]) assert.ok(!all.includes(forbidden), forbidden);
  for (const { provenance } of records) for (const path of provenance) {
    assert.ok(path.startsWith("src/"));
    assert.ok(!/\.env|private|node_modules|raw\//.test(path), path);
  }
});
check("Demand-loaded indexes remain below 2 MiB per locale", () => {
  for (const index of Object.values(indexes)) assert.ok(Buffer.byteLength(JSON.stringify(index)) < 2_000_000);
});
const rebuilt = await buildProjectSearch();
check("Index construction is deterministic", () => assert.deepEqual(rebuilt.indexes, indexes));
for (const locale of searchLocales) {
  const path = resolve(root, `public/search/project-text-${locale.toLowerCase()}.json`);
  const actual = await readFile(path, "utf8").catch(() => { throw new Error(`Missing generated index ${path}. Run npm run prepare:search.`); });
  check(`${locale} generated index is current (stale copy fails the build)`, () => assert.ok(actual === `${JSON.stringify(indexes[locale])}\n`, `Run npm run prepare:search after public copy changes (${locale}).`));
}
console.log(`Project detailed-search checks passed (${checks}).`);
