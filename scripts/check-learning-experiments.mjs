import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = new URL("../", import.meta.url);
async function moduleAt(path) {
  const source = readFileSync(new URL(path, root), "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 }, fileName: fileURLToPath(new URL(path, root)) });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
}
const [cliff, mechanics, evidence, origins, catalogue] = await Promise.all([
  moduleAt("src/lib/cliffLearning.ts"), moduleAt("src/lib/learningMechanics.ts"), moduleAt("src/data/llmLabEvidence.ts"), moduleAt("src/data/projectOrigins.ts"), moduleAt("src/data/projects.ts"),
]);
const near = (actual, expected, tolerance = 1e-9) => assert.ok(Math.abs(actual - expected) < tolerance, `${actual} differs from ${expected}`);
const fixture = JSON.parse(readFileSync(new URL("scripts/fixtures/cliff-transitions.json", root), "utf8"));
for (const [state, action, next, reward, terminal] of fixture.rows) {
  const got = cliff.cliffTransition(state, action);
  assert.deepEqual([got.next, got.reward, got.terminal], [next, reward, terminal]);
}
assert.equal(fixture.rows.length, 148);
const settings = { method: "q-learning", alpha: .5, epsilon: .1, seed: 7 };
const initial = cliff.createCliffAgent(settings);
const before = structuredClone(initial);
const trained = cliff.trainCliff(initial, settings, 100, "episodes");
assert.deepEqual(initial, before, "Training must preserve the prior React state");
assert.deepEqual(trained, cliff.trainCliff(initial, settings, 100, "episodes"), "Seeds reproduce the run");
const evaluationBefore = structuredClone(trained);
const evaluation = cliff.evaluateCliff(trained);
assert.equal(evaluation.goal, true);
assert.equal(evaluation.reward, -13);
assert.deepEqual(trained, evaluationBefore, "Evaluation preserves both Q and RNG");
const stale = cliff.createCliffAgent({ ...settings, alpha: 1, epsilon: 0 });
stale.state = 0; stale.action = 0; stale.q[0] = [0, -.5, -2, -3];
assert.equal(cliff.trainCliff(stale, { ...settings, alpha: 1, epsilon: 0 }, 1, "steps").action, 1, "Q-learning chooses from the updated table at a wall");
const terminal = cliff.createCliffAgent(settings);
terminal.state = 35; terminal.action = 2; terminal.q[47] = [100,100,100,100];
near(cliff.trainCliff(terminal, settings, 1, "steps").last.target, -1);
const capped = cliff.createCliffAgent(settings);
capped.state = 0; capped.action = 0; capped.steps = 199; capped.q[0] = [-3,-2,-1,-4];
const atCap = cliff.trainCliff(capped, settings, 1, "steps");
assert.equal(atCap.episode, 1); assert.equal(atCap.history[0].goal, false); near(atCap.last.target, -2);
const sarsaSettings = { ...settings, method: "sarsa", epsilon: 0, alpha: 1 };
const sarsa = cliff.createCliffAgent(sarsaSettings);
sarsa.state = 0; sarsa.action = 0; sarsa.q[0] = [0,-.5,-2,-3];
assert.equal(cliff.trainCliff(sarsa, sarsaSettings, 1, "steps").action, 0, "SARSA carries its sampled action");
const dpo = mechanics.dpoPreference(.75,.5,.5);
near(dpo.probability, .6339745962155614); near(dpo.loss, .455746394408326, 1e-8);
near(mechanics.dpoPreference(.75,.75,2).loss, Math.log(2));
const lora = mechanics.stepLora(mechanics.initialLoraState,.1);
assert.deepEqual(lora.a, [1,-1]); assert.deepEqual(lora.b, [.1,-.1]);
near(mechanics.inspectLora(lora).loss,.81);
assert.equal(mechanics.shiftedCoverage(.9,0).covered,36);
assert.equal(mechanics.shiftedCoverage(.9,2).covered,0);
assert.throws(() => mechanics.shiftedCoverage(1,0), RangeError);
const rows = evidence.llmAnswerEvidence;
assert.equal(rows.length,32); assert.equal(new Set(rows.map((row) => row.id)).size,32);
assert.equal(rows.filter((row) => row.sft.exact_match).length,19);
assert.equal(rows.filter((row) => row.sft.valid_format).length,32);
assert.equal(rows.filter((row) => !row.base.terminated).length,10);
for (const row of rows) for (const model of [row.base,row.sft]) assert.equal(model.exact_match, model.valid_format && model.terminated && model.text === row.expected);
for (const origin of origins.projectOrigins) for (const slug of origin.projects) assert.ok(catalogue.projects.some((project) => project.slug === slug), `Unknown career-linked project ${slug}`);
assert.match(origins.projectOriginSearchText("growmat"), /Pfizer/);
console.log("Learning experiments: 148 source transitions, seeded control updates, terminal/cap contracts, LoRA/DPO, coverage stress, 32 recorded answers and career links passed.");
