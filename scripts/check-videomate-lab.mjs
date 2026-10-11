import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const source = readFileSync(new URL("../src/components/projects/videoMateLab.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
const lab = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
const defaults = { task: "repair", depth: "full", route: "mp4", unresolved: "exclude", allowShorter: false, maxShorter: 10, convertHealthy: false };
const result = (id, patch = {}) => lab.planLabSample(lab.labSamples.find(sample => sample.id === id), { ...defaults, ...patch });
assert.equal(result("frames", { task: "inspect", depth: "quick" }).decode, "not_run");
assert.equal(result("frames", { task: "inspect", depth: "full" }).decode, "failed");
assert.equal(result("index").method, "remux", "Eligible MP4 streams stay encoded");
assert.equal(result("frames", { route: "remux" }).destination, "none", "Remux cannot repair corrupt frames");
assert.equal(result("frames", { route: "preserve" }).blocks.filter(block => block === "lost").length, 3, "Lost picture is not invented");
assert.equal(result("index", { route: "preserve" }).losses, false, "FFV1/PCM keeps decoded samples losslessly");
assert.equal(result("healthy").method, "none");
assert.equal(result("healthy", { convertHealthy: true }).method, "mp4");
assert.equal(result("healthy", { task: "migrate" }).bytes, "passed");
assert.equal(result("notes", { task: "migrate" }).filename, "05-notes.txt");
assert.equal(result("notes").destination, "none");
assert.equal(result("tail", { allowShorter: true, maxShorter: 30 }).destination, "none");
assert.equal(result("tail", { allowShorter: true, maxShorter: 35 }).duration, 39);
assert.equal(result("tail", { allowShorter: false, maxShorter: 50 }).destination, "none");
for (const route of ["remux", "preserve", "mp4"]) for (const allowShorter of [false, true]) for (const maxShorter of [0, 10, 30, 35, 40, 50]) {
  const tail = result("tail", { route, allowShorter, maxShorter });
  assert.equal(tail.destination === "collection", allowShorter && maxShorter >= 35);
  assert.deepEqual(tail.blocks.slice(13), Array(7).fill("missing"), "Missing bytes remain missing under every recovery policy");
}
for (const [unresolved, destination, kind] of [["exclude", "none", "omitted"], ["copy", "collection", "unresolved_copy"], ["review", "review", "review_copy"]]) {
  const tail = result("tail", { task: "migrate", unresolved });
  assert.equal(tail.destination, destination); assert.equal(tail.kind, kind);
  if (unresolved !== "exclude") { assert.equal(tail.filename, "04-truncated.mp4"); assert.equal(tail.bytes, "passed"); assert.equal(tail.losses, true); }
}
const ids = ["index", "tail"];
const options = { ...defaults };
let job = lab.createLabJob(ids, options, "paused");
ids.push("healthy"); options.allowShorter = true;
assert.deepEqual(job.ids, ["index", "tail"], "A run keeps its selected queue");
assert.equal(job.options.allowShorter, false, "A run keeps its option snapshot");
const before = structuredClone(job);
job = lab.advanceLabJob(job, true);
assert.equal(job.tick, 8); assert.equal(job.mode, "paused"); assert.deepEqual(before.tick, 0, "Stepping preserves previous state");
assert.equal(lab.labJobView(job).phase, "prepare");
assert.equal(lab.labJobView(job).results.length, 0);
job = lab.advanceLabJob(lab.advanceLabJob(job, true), true);
assert.equal(lab.labJobView(job).phase, "publish");
assert.equal(lab.labJobView(job).results.length, 0, "Verification alone does not publish a candidate");
job = lab.advanceLabJob(job, true);
assert.equal(lab.labJobView(job).results.length, 1);
while (job.mode !== "done") job = lab.advanceLabJob(job, true);
assert.deepEqual(lab.labJobView(job).results.map(row => [row.id, row.destination]), [["index", "collection"], ["tail", "none"]]);
assert.equal(lab.labJobView(lab.createLabJob(["healthy", "notes"], defaults)).total, 16, "Unnecessary recovery phases are skipped");
assert.equal(lab.createLabJob([], defaults).mode, "done");
assert.equal(lab.labJobView(lab.createLabJob([], defaults)).total, 0);
console.log("VideoMate browser lab: Quick/Full, remux and lossless/lossy routes, 72 shortening policies, three unresolved destinations, immutable selected queues and publication timing passed.");
