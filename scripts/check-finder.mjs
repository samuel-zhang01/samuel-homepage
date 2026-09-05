import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const compiled = ts.transpileModule(await readFile(new URL("../src/lib/projectSearch.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { foldSearch, parseProjectSearchIndex, searchExcerpt } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
let checks = 0;
function check(name, run) { run(); checks++; console.log(`PASS Find: ${name}`); }
const valid = { version: 1, documents: [{ slug: "orbital-lab", text: "Probability cloud\n電子機率密度" }] };
check("case, accents and compatibility characters", () => assert.equal(foldSearch("CAFÉ Ａ"), "cafe a"));
check("Chinese text survives normalisation", () => assert.equal(foldSearch("電子機率密度"), "電子機率密度"));
check("index text and folded form", () => assert.equal(parseProjectSearchIndex(valid, ["orbital-lab"]).get("orbital-lab").search, "probability cloud\n電子機率密度"));
for (const [name, value] of [
  ["null", null], ["wrong version", { ...valid, version: 2 }],
  ["missing projects", { ...valid, documents: [] }],
  ["unknown slug", { ...valid, documents: [{ slug: "external", text: "x" }] }],
  ["empty text", { ...valid, documents: [{ slug: "orbital-lab", text: " " }] }],
  ["non-text", { ...valid, documents: [{ slug: "orbital-lab", text: {} }] }],
  ["oversized document", { ...valid, documents: [{ slug: "orbital-lab", text: "x".repeat(500_001) }] }],
]) check(`reject ${name}`, () => assert.throws(() => parseProjectSearchIndex(value, ["orbital-lab"])));
check("duplicate documents", () => assert.throws(() => parseProjectSearchIndex({ version: 1, documents: [valid.documents[0], valid.documents[0]] }, ["orbital-lab", "note-pad"])));
check("relevant excerpt", () => assert.equal(searchExcerpt("An unrelated heading\nHydrogen probability cloud", ["probability"]), "Hydrogen probability cloud"));
check("bounded long excerpt", () => assert.ok(searchExcerpt("x".repeat(500) + " searchable " + "x".repeat(500), ["searchable"]).length <= 182));
check("no HTML evaluation", () => assert.equal(parseProjectSearchIndex({ version: 1, documents: [{ slug: "orbital-lab", text: "<script>alert(1)</script>" }] }, ["orbital-lab"]).get("orbital-lab").text, "<script>alert(1)</script>"));
console.log(`${checks} Find regressions passed.`);
