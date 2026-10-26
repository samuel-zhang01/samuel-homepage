import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const file = new URL("../src/components/projects/browserViewLab.ts", import.meta.url);
const compiled = ts.transpileModule(await readFile(file, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 }, fileName: file.pathname,
}).outputText;
const { createBrowserWalkthrough, browserStep } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
let state = createBrowserWalkthrough();
const next = (type, rest = {}) => { state = browserStep(state, { type, ...rest }); };
assert.equal(browserStep(state, { type: "agent-submit" }), state, "Finishing cannot skip the handoff");
assert.equal(browserStep(state, { type: "name", value: "Ignored" }), state, "The initial form awaits the demonstrated agent action");
next("agent-fill");
assert.deepEqual(state.page, { name: "Alex", reminder: true, submitted: false });
next("name", { value: "   " }); next("agent-read");
assert.equal(state.phase, "edit"); assert.equal(state.nameError, true);
next("name", { value: "Riley" }); next("reminder", { value: false }); next("agent-read");
assert.deepEqual(state.observed, { name: "Riley", reminder: false, submitted: false });
assert.equal(state.nameError, false);
next("name", { value: "Morgan" });
assert.equal(state.phase, "edit"); assert.equal(state.observed, null, "Changing the form invalidates the previous readback");
next("agent-read"); next("close");
assert.equal(state.panelOpen, false); assert.equal(state.page.name, "Morgan");
assert.equal(browserStep(state, { type: "name", value: "Hidden edit" }), state);
next("open"); assert.equal(state.phase, "return"); assert.equal(state.page.submitted, false);
next("close"); next("agent-submit");
assert.equal(state.panelOpen, false); assert.equal(state.page.submitted, true);
next("open");
assert.equal(state.phase, "complete");
assert.deepEqual(state.page, { name: "Morgan", reminder: false, submitted: true });
next("edit-again"); assert.equal(state.page.name, "Morgan"); assert.equal(state.page.submitted, false);
next("name", { value: "x".repeat(50) }); assert.equal(state.page.name.length, 40);
next("reset"); assert.deepEqual(state, createBrowserWalkthrough());
console.log("Browser View walkthrough: shared-value handoff, blank-name recovery, readback invalidation, closed-panel completion, reopen, repeat and reset passed.");
