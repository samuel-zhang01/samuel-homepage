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

const daily = await moduleAt("src/lib/parliamoDaily.ts");
assert.deepEqual(daily.planDailySample(5,2), {reviews:2,missions:0,used:4,waiting:0});
assert.deepEqual(daily.planDailySample(10,2), {reviews:2,missions:1,used:9,waiting:0});
assert.deepEqual(daily.planDailySample(15,2), {reviews:2,missions:2,used:14,waiting:0});
assert.deepEqual(daily.planDailySample(5,4), {reviews:2,missions:0,used:4,waiting:2});
assert.deepEqual(daily.planDailySample(15,2,false), {reviews:0,missions:0,used:0,waiting:2});
assert.ok(daily.matchesItalian(" CHIAMO! ","chiamo"));
assert.ok(!daily.matchesItalian("e","è"));
assert.ok(daily.matchesItalian("l’acqua","l'acqua"));
let attempt=daily.newDailyAttempt();
assert.deepEqual(daily.checkDailyAnswer(attempt,0),attempt,"Empty attempts are not scored");
assert.equal(daily.finishDailyMission(attempt),attempt,"An empty attempt cannot complete");
attempt=daily.checkDailyAnswer({...attempt,answers:["sono","ti"]},0);
assert.deepEqual(attempt.first,[false,null]);
attempt=daily.checkDailyAnswer({...attempt,answers:["chiamo","ti"]},0);
attempt=daily.checkDailyAnswer(attempt,1);
assert.deepEqual(attempt.first,[false,true],"Retry keeps the first miss");
assert.deepEqual(attempt.checked,[true,true]);
assert.equal(daily.finishDailyMission(attempt).completed,false,"Recall alone does not complete the output");
attempt=daily.finishDailyMission({...attempt,output:"Mi chiamo Ada.",rubric:[true,true]});
assert.equal(attempt.completed,true);
assert.equal(daily.finishDailyMission(attempt),attempt,"Completion is idempotent");
assert.deepEqual([1,3,7,14].map(i=>daily.nextDailyInterval(i,true)),[3,7,14,14]);
assert.ok([1,3,7,14].every(i=>daily.nextDailyInterval(i,false)===1));
console.log("Parliamo: budget boundaries, rest-day carry, accent handling, first-attempt preservation, output gate, duplicate completion and review intervals passed.");

// Literal expected allocations traced from study.ts dailyRecipe for each programme's first day.
const academyExpected = [
  ["supported", 30, { guided: 15, workshops: [15], tense: 0, companion: 0, waitingUnits: 0, total: 30 }],
  ["supported", 45, { guided: 30, workshops: [15], tense: 0, companion: 0, waitingUnits: 0, total: 45 }],
  ["supported", 60, { guided: 30, workshops: [15], tense: 10, companion: 5, waitingUnits: 0, total: 60 }],
  ["intensive", 30, { guided: 15, workshops: [15], tense: 0, companion: 0, waitingUnits: 1, total: 30 }],
  ["intensive", 45, { guided: 15, workshops: [15, 15], tense: 0, companion: 0, waitingUnits: 0, total: 45 }],
  ["intensive", 60, { guided: 30, workshops: [15, 15], tense: 0, companion: 0, waitingUnits: 0, total: 60 }],
  ["repair", 30, { guided: 15, workshops: [15], tense: 0, companion: 0, waitingUnits: 1, total: 30 }],
  ["repair", 45, { guided: 15, workshops: [15, 15], tense: 0, companion: 0, waitingUnits: 0, total: 45 }],
  ["repair", 60, { guided: 30, workshops: [15, 15], tense: 0, companion: 0, waitingUnits: 0, total: 60 }],
];
for (const [programme, minutes, expected] of academyExpected) {
  const actual = daily.planAcademySample(minutes, programme);
  assert.deepEqual(actual, expected);
  assert.equal(actual.guided + actual.workshops.reduce((a, b) => a + b, 0) + actual.tense + actual.companion, minutes);
}
let grammar = daily.newGrammarSample();
assert.equal(daily.checkGrammarSample(grammar), grammar, "Empty grammar answers are not scored");
assert.equal(daily.nextGrammarSample(grammar), grammar, "A review day cannot be advanced before an attempt");
const initialGrammar = structuredClone(grammar);
grammar = daily.checkGrammarSample({ ...grammar, answer: "hanno" });
assert.deepEqual(initialGrammar, daily.newGrammarSample(), "Checking does not mutate the previous state");
assert.deepEqual(grammar.attempts[0], { day: 1, answer: "hanno", correct: false, assisted: false });
grammar = daily.checkGrammarSample({ ...grammar, answer: " ABBIAMO! " });
assert.equal(grammar.attempts[0].correct, false, "Correcting must not overwrite the first miss");
assert.equal(grammar.attempts[1].assisted, true, "Feedback exposes the answer, so same-day correction is supported");
assert.equal(daily.checkGrammarSample(grammar), grammar, "Identical checks do not add duplicate attempts");
grammar = daily.nextGrammarSample(grammar);
assert.equal(grammar.day, 2); assert.equal(grammar.answer, "");
grammar = daily.checkGrammarSample({ ...grammar, answer: "abbiamo" });
assert.equal(grammar.attempts.at(-1).assisted, false, "A later blank recall can be independent");
assert.equal(daily.nextGrammarSample(grammar).day, 5, "Independent grammar success returns three days later");
let helped = daily.hintGrammarSample(daily.newGrammarSample());
helped = daily.checkGrammarSample({ ...helped, answer: "abbiamo" });
assert.equal(helped.attempts[0].correct, true);
assert.equal(helped.attempts[0].assisted, true, "Hint before first submission is preserved");
helped = daily.nextGrammarSample(helped);
assert.equal(helped.day, 2); assert.notEqual(helped.hintDay, helped.day);
helped = daily.checkGrammarSample({ ...helped, answer: "hanno" });
helped = daily.checkGrammarSample({ ...helped, answer: "abbiamo" });
assert.equal(helped.attempts.at(-1).assisted, true, "A later recall's same-day correction is still supported");
assert.equal(helped.attempts[0].assisted, true, "Later attempts never erase first-answer assistance");
const overlong = { ...daily.newGrammarSample(), answer: "x".repeat(501) };
assert.equal(daily.checkGrammarSample(overlong), overlong);
let boundedGrammar = daily.checkGrammarSample({ ...daily.newGrammarSample(), answer: "abbiamo" });
boundedGrammar = daily.hintGrammarSample(daily.nextGrammarSample(boundedGrammar));
boundedGrammar = daily.checkGrammarSample({ ...boundedGrammar, answer: "abbiamo" });
for (let index = 0; index < 12; index++) {
  boundedGrammar = daily.nextGrammarSample(boundedGrammar);
  boundedGrammar = daily.checkGrammarSample({ ...boundedGrammar, answer: "abbiamo" });
}
assert.equal(boundedGrammar.attempts.length, 12);
assert.equal(boundedGrammar.attempts[0].day, 1, "History bounding retains the original first attempt");
assert.ok(boundedGrammar.attempts.every(entry => !entry.assisted), "The earlier supported row has left the bounded history");
boundedGrammar = daily.checkGrammarSample({ ...boundedGrammar, answer: "ABBIAMO" });
assert.equal(boundedGrammar.attempts.at(-1).assisted, true, "Persistent hint evidence survives bounded history, matching the source");
console.log("Parliamo academy: nine expected programme/time recipes, bounded answers, hint-first scoring, honest correction, immutable first attempts, duplicate guards and later independent recall passed.");
