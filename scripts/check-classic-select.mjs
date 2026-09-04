import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const sourcePath = new URL("../src/lib/classicSelectBehavior.ts", import.meta.url);
const compiled = ts.transpileModule(await readFile(sourcePath, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  fileName: sourcePath.pathname,
}).outputText;
const { nextSelectOption, matchSelectOption, selectMenuPlacement } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
let checks = 0;
function check(name, run) {
  try { run(); checks += 1; } catch (error) { throw new Error(`Classic select regression: ${name}`, { cause: error }); }
}
const options = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta", disabled: true },
  { value: "c", label: "Café" },
  { value: "d", label: "Carbon" },
  { value: "e", label: "碳" },
];
check("Arrow Down skips disabled options", () => assert.equal(nextSelectOption(options, 0, 1), 2));
check("Arrow Up skips disabled options", () => assert.equal(nextSelectOption(options, 2, -1), 0));
check("forward movement wraps", () => assert.equal(nextSelectOption(options, 4, 1), 0));
check("backward movement wraps", () => assert.equal(nextSelectOption(options, 0, -1), 4));
check("Home finds first available option", () => assert.equal(nextSelectOption(options, -1, 1), 0));
check("End finds last available option", () => assert.equal(nextSelectOption(options, 0, -1), 4));
check("empty menu is safe", () => assert.equal(nextSelectOption([], -1, 1), -1));
check("fully disabled menu has no target", () => assert.equal(nextSelectOption(options.map(option => ({ ...option, disabled: true })), 1, 1), -1));
check("typeahead folds diacritics", () => assert.equal(matchSelectOption(options, "CAFE", -1), 2));
check("typeahead folds fullwidth characters", () => assert.equal(matchSelectOption(options, "ＣＡＲ", -1), 3));
check("typeahead keeps Chinese characters", () => assert.equal(matchSelectOption(options, "碳", -1), 4));
check("typeahead skips disabled matches", () => assert.equal(matchSelectOption(options, "b", -1), -1));
check("repeated prefix cycles forward", () => assert.equal(matchSelectOption(options, "c", 2), 3));
check("repeated prefix wraps", () => assert.equal(matchSelectOption(options, "c", 3), 2));
check("missing and empty options are safe", () => assert.equal(matchSelectOption([], "a", 0), -1));
const viewport = { width: 390, height: 844 };
check("ordinary menu opens below its trigger", () => {
  const placement = selectMenuPlacement({ left: 20, top: 100, bottom: 144, width: 200 }, viewport, 200);
  assert.equal(placement.top, 146);
  assert.equal(placement.left, 20);
  assert.equal(placement.width, 200);
});
check("menu near bottom flips above", () => {
  const placement = selectMenuPlacement({ left: 20, top: 700, bottom: 744, width: 200 }, viewport, 240);
  assert.equal(placement.top, 458);
});
check("wide trigger cannot push menu beyond phone edges", () => {
  const placement = selectMenuPlacement({ left: 370, top: 100, bottom: 144, width: 500 }, viewport, 200);
  assert.equal(placement.left, 8);
  assert.equal(placement.width, 374);
});
check("long menus have a bounded scrolling area", () => {
  const placement = selectMenuPlacement({ left: 20, top: 400, bottom: 444, width: 200 }, viewport, 2_000);
  assert.equal(placement.maxHeight, 320);
});
check("negative offscreen positions are bounded horizontally", () => {
  assert.equal(selectMenuPlacement({ left: -20, top: 100, bottom: 144, width: 200 }, viewport, 200).left, 8);
});
console.log(`Classic select gate: ${checks} keyboard, typeahead and viewport regressions passed.`);
