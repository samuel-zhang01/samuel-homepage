import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

// Compile the same pure helpers used by the accessories. No React harness,
// copied implementation, browser dependency or generated file is needed.
const sourcePath = new URL("../src/lib/deskBehavior.ts", import.meta.url);
const compiled = ts.transpileModule(await readFile(sourcePath, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  fileName: sourcePath.pathname,
}).outputText;
const {
  advanceFocusState,
  enterCalculatorDecimal,
  enterCalculatorDigit,
  localDateKey,
  parseConverterInput,
} = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

let checks = 0;
function check(name, run) {
  try {
    run();
    checks += 1;
  } catch (error) {
    throw new Error(`Desk behavior regression: ${name}`, { cause: error });
  }
}

const now = new Date(2026, 8, 5, 12).getTime();
const today = "2026-09-05";
const base = {
  durationSeconds: 1_500,
  remainingSeconds: 300,
  endsAt: now + 300_000,
  running: true,
  completedDate: today,
  completedCount: 7,
};

check("unchanged timer keeps state identity", () => {
  assert.strictEqual(advanceFocusState(base, now), base);
});
check("countdown rounds upward and follows elapsed wall time", () => {
  assert.equal(advanceFocusState(base, now + 1_001).remainingSeconds, 299);
  assert.equal(advanceFocusState(base, now + 120_000).remainingSeconds, 180);
});
check("same-day completion settles exactly once", () => {
  const completed = advanceFocusState(base, now + 300_000);
  assert.equal(completed.remainingSeconds, 0);
  assert.equal(completed.running, false);
  assert.equal(completed.endsAt, null);
  assert.equal(completed.completedCount, 8);
  assert.strictEqual(advanceFocusState(completed, now + 600_000), completed);
});
check("sleeping across midnight does not credit yesterday to today", () => {
  const completed = advanceFocusState({
    ...base,
    endsAt: new Date(2026, 8, 4, 23, 59, 59).getTime(),
    completedDate: "2026-09-04",
  }, now);
  assert.equal(completed.completedCount, 0);
  assert.equal(completed.completedDate, today);
  assert.equal(completed.running, false);
});
check("a session crossing midnight is credited on its actual end date", () => {
  const completed = advanceFocusState({ ...base, endsAt: now - 1, completedDate: "2026-09-04" }, now);
  assert.equal(completed.completedCount, 1);
  assert.equal(completed.completedDate, today);
});
check("paused clock resets only its daily tally at midnight", () => {
  const paused = advanceFocusState({ ...base, endsAt: null, running: false, completedDate: "2026-09-04" }, now);
  assert.equal(paused.remainingSeconds, 300);
  assert.equal(paused.completedCount, 0);
});
check("wall-clock rollback cannot exceed the selected duration", () => {
  assert.equal(advanceFocusState(base, now - 7_200_000).remainingSeconds, base.durationSeconds);
});
check("daily tally stays inside its persisted-data bound", () => {
  assert.equal(advanceFocusState({ ...base, endsAt: now, completedCount: 10_000 }, now).completedCount, 10_000);
});
check("settling progress never mutates its input", () => {
  const original = { ...base };
  advanceFocusState(Object.freeze(original), now + 300_000);
  assert.deepEqual(original, base);
});
check("local date keys use the local calendar", () => {
  assert.equal(localDateKey(new Date(2026, 0, 2, 0, 1)), "2026-01-02");
});

for (const [input, expected] of [["1e3", 1_000], ["1e-9", 1e-9], ["-.5", -.5], ["  +2,5  ", 2.5], ["1.", 1], ["0", 0]]) {
  check(`converter accepts ${JSON.stringify(input)} without changing its meaning`, () => {
    assert.equal(parseConverterInput(input), expected);
  });
}
for (const input of ["", " ", "10 apples", "1e", "1,2,3", "0x10", "--2", "Infinity", "1e999"]) {
  check(`converter rejects ${JSON.stringify(input)} instead of manufacturing a result`, () => {
    assert.equal(Number.isNaN(parseConverterInput(input)), true);
  });
}

check("calculator begins a fresh operand after a result or an error", () => {
  assert.equal(enterCalculatorDigit("42", true, "7"), "7");
  assert.equal(enterCalculatorDigit("Error", false, "7"), "7");
});
check("scientific notation cannot become malformed through digit entry", () => {
  assert.equal(enterCalculatorDigit("1e-10", false, "2"), "2");
  assert.equal(enterCalculatorDecimal("1e-10", false), "0.");
});
check("calculator retains ordinary decimal editing and its input bound", () => {
  assert.equal(enterCalculatorDigit("0", false, "2"), "2");
  assert.equal(enterCalculatorDigit("-12.3", false, "4"), "-12.34");
  assert.equal(enterCalculatorDigit("123456789012", false, "3"), "123456789012");
  assert.equal(enterCalculatorDecimal("12.3", false), "12.3");
  assert.equal(enterCalculatorDecimal("12", false), "12.");
  assert.equal(enterCalculatorDecimal("Error", false), "0.");
  assert.equal(enterCalculatorDecimal("12", true), "0.");
});

console.log(`Desk behavior gate: ${checks} timer, converter and calculator regressions passed.`);
