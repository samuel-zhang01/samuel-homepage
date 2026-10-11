import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const sourcePath = new URL("../src/lib/ultraConvertDemo.ts", import.meta.url);
const compiled = ts.transpileModule(await readFile(sourcePath, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 }, fileName: sourcePath.pathname,
}).outputText;
const { templateRule, exampleFiles, planRule, renameStem, matchCondition } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
let checks = 0;
const check = (name, run) => { try { run(); checks++; } catch (error) { throw new Error(`UltraConvert demo: ${name}`, { cause: error }); } };
const rule = templateRule("image"), [photo, poster, audio, video] = exampleFiles("images");
check("default image rule plans a separate WebP", () => assert.equal(planRule(rule, photo).outputPath, "Web output/Photo-webp.webp"));
check("a different category stays unchanged", () => assert.equal(planRule(rule, audio).matches, false));
check("nonrecursive inbox ignores nested files", () => assert.equal(planRule(rule, poster).matches, false));
check("recursive flag includes nested files", () => assert.equal(planRule({ ...rule, recursive: true }, poster).outputName, "Poster-webp.webp"));
check("the selected inbox restricts matching", () => assert.equal(planRule({ ...rule, inbox: "media" }, photo).matches, false));
check("filename suffix is case-insensitive and includes extension", () => assert.equal(matchCondition(photo, { id: "x", field: "nameSuffix", value: ".PNG" }), true));
check("filename prefixes and contains use original full name", () => {
  assert.equal(matchCondition(photo, { id: "x", field: "namePrefix", value: "PHO" }), true);
  assert.equal(matchCondition(photo, { id: "x", field: "nameContains", value: "oto.p" }), true);
});
check("format aliases share detected identity", () => assert.equal(matchCondition({ ...photo, format: "jpeg" }, { id: "x", field: "format", value: "jpg" }), true));
const twoConditions = { ...rule, conditions: [...rule.conditions, { id: "x", field: "nameContains", value: "Recording" }] };
check("ALL requires every condition", () => assert.equal(planRule(twoConditions, photo).matches, false));
check("ANY can match a second category but incompatible conversion stops", () => assert.equal(planRule({ ...twoConditions, matchAll: false }, audio).issue, "incompatible-format"));
check("rename before conversion uses the original format token", () => assert.equal(planRule({ ...rule, steps: [...rule.steps].reverse() }, photo).outputName, "Photo-png.webp"));
check("collisions are numbered without replacing an output", () => assert.equal(planRule(rule, photo, ["Web output/Photo-webp.webp", "Web output/Photo-webp (2).webp"]).outputName, "Photo-webp (3).webp"));
check("collision scope is the chosen destination", () => assert.equal(planRule({ ...rule, destination: "exports" }, photo, ["Web output/Photo-webp.webp"]).outputPath, "Exports/Photo-webp.webp"));
check("a watched output folder is blocked", () => assert.equal(planRule({ ...rule, destination: "inbox" }, photo).issue, "unsafe-destination"));
check("blank conditions are invalid", () => assert.equal(planRule({ ...rule, conditions: [{ id: "x", field: "format", value: " " }] }, photo).issue, "empty-condition"));
check("video to audio updates the category for later steps", () => assert.equal(planRule({ ...rule, conditions: [{ id: "x", field: "category", value: "video" }], steps: [{ id: "a", kind: "convert", value: "mp3" }, { id: "b", kind: "convert", value: "opus" }] }, video).outputName, "Clip.opus"));
check("unknown tokens, separators, hidden names and overlong names are rejected", () => {
  for (const name of ["{unknown}", "{name}/{format}", ".{name}", "a".repeat(181), " "]) assert.equal(renameStem(name, "Photo", "png"), undefined);
});
check("documents require conversion when routing companion resources", () => { const document = exampleFiles("images").find(file => file.category === "document"); assert.equal(planRule({ ...rule, conditions: [{ id: "x", field: "category", value: "document" }], steps: [{ id: "a", kind: "rename", value: "{name}" }] }, document).issue, "conversion-required"); });
check("the displayed example date is deterministic", () => assert.equal(renameStem("{name}-{date}", "Photo", "png"), "Photo-2026-10-11"));
check("planning never changes original file metadata", () => { const original = JSON.stringify(photo); planRule(rule, photo); assert.equal(JSON.stringify(photo), original); });
console.log(`UltraConvert demo: ${checks} matching, action-order, naming, destination and preservation checks passed.`);
