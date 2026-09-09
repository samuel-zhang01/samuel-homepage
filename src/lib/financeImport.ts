/** Browser adaptation of finance-app/ingest.py, reviewed 9 September 2026.
 * Invented, debit-account fixtures use integer pennies. Identity strings expose
 * the source SHA-1 inputs; equality is checked directly instead of hashing them.
 * This models parsed-row insertion, not file parsing or database persistence.
 */
export type ImportRow = { date: string; amount: number; description: string; providerId?: string };
export type ImportStatement = { name: string; account: string; opening: number; closing: number; rows: ImportRow[] };
export type StoredImportRow = ImportRow & { identity: string; occurrence: number };
export type ImportDecision = StoredImportRow & { inserted: boolean; retainedAmount: number; changedContent: boolean };
export type ImportReceipt = {
  name: string; parsedClosing: number; declaredClosing: number; difference: number;
  reconciled: boolean; inserted: number; ignored: number; decisions: ImportDecision[];
};
export type ImportState = { ledger: StoredImportRow[]; history: ImportReceipt[] };
export const emptyImportState = (): ImportState => ({ ledger: [], history: [] });

export function applyStatement(state: ImportState, statement: ImportStatement): ImportState {
  const ledger = [...state.ledger];
  const occurrences = new Map<string, number>();
  const decisions = statement.rows.map((row): ImportDecision => {
    const signature = JSON.stringify([row.date, row.amount, row.description]);
    const occurrence = occurrences.get(signature) ?? 0;
    occurrences.set(signature, occurrence + 1);
    const identity = row.providerId
      ? `${statement.account}|id|${row.providerId}`
      : `${statement.account}|${row.date}|${(row.amount / 100).toFixed(2)}|${row.description}|${occurrence}`;
    const existing = ledger.find((stored) => stored.identity === identity);
    const candidate = { ...row, identity, occurrence };
    if (!existing) ledger.push(candidate);
    return {
      ...candidate, inserted: !existing, retainedAmount: existing?.amount ?? row.amount,
      changedContent: !!existing && (existing.amount !== row.amount || existing.date !== row.date || existing.description !== row.description),
    };
  });
  const parsedClosing = statement.opening + statement.rows.reduce((sum, row) => sum + row.amount, 0);
  const difference = statement.closing - parsedClosing;
  const inserted = decisions.filter((row) => row.inserted).length;
  return { ledger, history: [...state.history, {
    name: statement.name, parsedClosing, declaredClosing: statement.closing, difference,
    reconciled: Math.abs(difference) <= 2 || statement.rows.length === 0,
    inserted, ignored: decisions.length - inserted, decisions,
  }] };
}

export type ImportScenarioId = "occurrence" | "provider" | "balance" | "empty";
export const financeImportScenarios: { id: ImportScenarioId; label: string; question: string; note: string }[] = [
  { id: "occurrence", label: "Repeated charges", question: "Which repeated charge belongs in the ledger?", note: "The occurrence counter starts at zero for each statement. Exact overlaps share keys; a third identical charge receives occurrence 2. This assumes compatible grouping across exports; partial exports of indistinguishable charges still need review." },
  { id: "provider", label: "Changed provider ID row", question: "What happens when an export corrects an existing transaction?", note: "A provider ID takes precedence over the amount. The source keeps the first stored row even when the incoming amount changes. The changed-content marker here is an added review aid. Both parsed statements balance independently." },
  { id: "balance", label: "Balance mismatch", question: "Where does a failed reconciliation go?", note: "The source records the reconciliation result and then attempts every insertion. A £10 difference therefore appears alongside a stored transaction. The flag is available for review after import." },
  { id: "empty", label: "Empty statement", question: "What does a successful status establish for an empty statement?", note: "The source treats an empty transaction list as reconciled. Here the declared balance differs by £10 and the status still passes. Reviewing the residual alongside the status exposes this special case." },
];

export function financeImportBatches(id: ImportScenarioId): ImportStatement[] {
  const row = { date: "2026-06-01", amount: -1250, description: "Fixture merchant" };
  const base = { account: "fixture-account-a", opening: 10000 };
  if (id === "occurrence") return [
    { ...base, name: "Two same-day charges", closing: 7500, rows: [{ ...row }, { ...row }] },
    { ...base, name: "Exact overlapping export", closing: 7500, rows: [{ ...row }, { ...row }] },
    { ...base, name: "Expanded export: three charges", closing: 6250, rows: [{ ...row }, { ...row }, { ...row }] },
  ];
  if (id === "provider") return [
    { ...base, name: "Original provider row", closing: 6000, rows: [{ ...row, amount: -4000, providerId: "FIXTURE-ID-1" }] },
    { ...base, name: "Corrected amount, same provider ID", closing: 5500, rows: [{ ...row, amount: -4500, providerId: "FIXTURE-ID-1" }] },
  ];
  return [{ ...base, name: id === "empty" ? "Empty statement with a balance change" : "Declared closing differs by £10", closing: 9000, rows: id === "empty" ? [] : [{ ...row, amount: -2000 }] }];
}
