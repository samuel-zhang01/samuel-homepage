import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const compiled = ts.transpileModule(await readFile(new URL("../src/lib/projectSearch.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { foldSearch, parseProjectSearchIndex, searchExcerpt } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
const i18nCompiled = ts.transpileModule(await readFile(new URL("../src/lib/i18n.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { translateText } = await import(`data:text/javascript;base64,${Buffer.from(i18nCompiled).toString("base64")}`);
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

// Exercise both production mappers so desktop labels cannot disappear between
// the desktop application catalogue and Find's searchable result text.
function mapper(sourceFile, selectNode, bindings) {
  let callback;
  function visit(node) { if (selectNode(node)) callback = node; ts.forEachChild(node, visit); }
  visit(sourceFile);
  assert.ok(callback, "Missing production application mapper");
  const output = ts.transpileModule(`const mapApplication = ${callback.getText(sourceFile)};`, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None },
  }).outputText;
  return new Function(...Object.keys(bindings), `${output}\nreturn mapApplication;`)(...Object.values(bindings));
}
const desktopSource = ts.createSourceFile("SystemSevenDesktop.tsx", await readFile(new URL("../src/components/SystemSevenDesktop.tsx", import.meta.url), "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const finderSource = ts.createSourceFile("DesktopFinder.tsx", await readFile(new URL("../src/components/DesktopFinder.tsx", import.meta.url), "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const desktopMapper = mapper(desktopSource, node => ts.isArrowFunction(node) && ts.isCallExpression(node.parent)
  && ts.isVariableDeclaration(node.parent.parent) && node.parent.parent.name.getText(desktopSource) === "FINDER_APPLICATIONS", {
  DESKTOP_ICONS: [{ id: "about", label: "Start Here", description: "Biography and portfolio routes." }],
});
const aboutApplication = desktopMapper({ id: "about", title: "About Samuel Zhang" });
for (const locale of ["en-GB", "en-US", "zh-CN", "zh-TW"]) check(`desktop label alias is searchable in ${locale}`, () => {
  const finderMapper = mapper(finderSource, node => ts.isArrowFunction(node) && ts.isCallExpression(node.parent)
    && node.parent.expression.getText(finderSource) === "applications.map", {
    locale, desktopCopy: {}, projectText: (selectedLocale, _copy, text) => translateText(selectedLocale, text),
    foldSearch, getApplicationIcon: id => id,
  });
  const result = finderMapper(aboutApplication);
  assert.equal(result.appId, "about");
  assert.ok(result.search.includes(foldSearch("Start Here")), "English desktop label must find its app in every locale");
  assert.ok(result.search.includes(foldSearch(translateText(locale, "Start Here"))), "Localized desktop label must find the same app");
});
console.log(`${checks} Find regressions passed.`);
