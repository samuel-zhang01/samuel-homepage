import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import ts from "typescript";

const root = new URL("../", import.meta.url);
const source = readFileSync(new URL("src/lib/financeImport.ts", root), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
const { applyStatement, emptyImportState, financeImportBatches } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
const fixtures = JSON.parse(readFileSync(new URL("scripts/fixtures/finance-import.json", root), "utf8"));
let attempts = 0;
for (const fixture of fixtures.scenarios) {
  let state = emptyImportState();
  for (const step of fixture.steps) {
    const statement = step.statement;
    const before = structuredClone(state);
    const next = applyStatement(state, {
      name: step.sourceFile, account: statement.accountId,
      opening: Math.round(statement.openingBalance * 100), closing: Math.round(statement.closingBalance * 100),
      rows: statement.transactions.map((row) => ({ date: row.date, amount: Math.round(row.amount * 100), description: row.description, providerId: row.providerId ?? undefined })),
    });
    assert.deepEqual(state, before, "Insertion preserves prior React state");
    state = next;
    const receipt = state.history.at(-1);
    assert.equal(receipt.inserted, step.expected.newRows, fixture.id);
    assert.equal(receipt.ignored, step.expected.duplicateRows, fixture.id);
    assert.equal(receipt.reconciled, step.expected.reconciled, fixture.id);
    assert.equal(state.ledger.length, step.expected.ledgerRows, fixture.id);
    assert.equal(state.ledger.reduce((sum, row) => sum + row.amount, 0), Math.round(step.expected.ledgerMovement * 100), fixture.id);
    assert.deepEqual(state.ledger.map((row) => ({
      date: row.date, description: row.description, amount: row.amount / 100,
      dedupeKey: createHash("sha1").update(row.identity).digest("hex").slice(0, 20),
    })), step.expected.storedTransactions, "Identity strings reproduce original SHA-1 keys");
    attempts++;
  }
}
const expectedAdded = { occurrence: [2, 0, 1], provider: [1, 0], balance: [1], empty: [0] };
for (const [scenario, inserted] of Object.entries(expectedAdded)) {
  let state = emptyImportState();
  for (const [index, batch] of financeImportBatches(scenario).entries()) {
    state = applyStatement(state, batch);
    assert.equal(state.history.at(-1).inserted, inserted[index], `Visible ${scenario} batch ${index}`);
  }
  if (scenario === "provider") {
    assert.equal(state.ledger[0].amount, -4000);
    assert.equal(state.history.at(-1).decisions[0].changedContent, true);
  }
  const replay = applyStatement(state, financeImportBatches(scenario).at(-1));
  assert.equal(replay.history.at(-1).inserted, 0);
  assert.deepEqual(replay.ledger, state.ledger);
}
console.log(`Finance import: ${attempts} original-source fixture attempts, SHA-1 identities, retained amounts, reconciliation flags, immutable state and four visible scenarios passed.`);
