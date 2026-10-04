import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const compiled = ts.transpileModule(await readFile(new URL("../src/lib/deskPersistence.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { mergeDeskData, stageDeskDraft, commitDeskDrafts, readDeskConflicts, pendingPrefix, conflictPrefix, storageKeys } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
const entries = new Map();
globalThis.localStorage = {
  get length() { return entries.size; },
  key: index => [...entries.keys()][index] ?? null,
  getItem: key => entries.get(key) ?? null,
  setItem: (key, value) => { entries.set(key, value); },
  removeItem: key => { entries.delete(key); },
};
let checks = 0;
function check(name, run) { entries.clear(); try { run(); checks++; } catch (cause) { throw new Error(name, { cause }); } }
const validate = value => value;
check("same-page conflict retains both complete drafts", () => {
  const key = "notes";
  const base = { pages: ["", ""] };
  stageDeskDraft(key, { base, value: { pages: ["TAB A", ""] } });
  stageDeskDraft(key, { base, value: { pages: ["TAB B", ""] } });
  commitDeskDrafts(key, base, validate);
  const conflicts = readDeskConflicts(key);
  assert.equal(conflicts.length, 1);
  assert.deepEqual(new Set([conflicts[0].current.pages[0], conflicts[0].incoming.pages[0]]), new Set(["TAB A", "TAB B"]));
});
check("independent notebook pages merge", () => {
  const base = { pages: ["", ""] };
  stageDeskDraft("notes", { base, value: { pages: ["A", ""] } });
  stageDeskDraft("notes", { base, value: { pages: ["", "B"] } });
  assert.deepEqual(commitDeskDrafts("notes", base, validate), { pages: ["A", "B"] });
  assert.equal(readDeskConflicts("notes").length, 0);
});
check("calendar dates merge without losing deletion", () => {
  assert.deepEqual(mergeDeskData({ notes: { one: "old" } }, { notes: {} }, { notes: { one: "old", two: "new" } }), { value: { notes: { two: "new" } }, conflict: false });
});
check("Quick List additions and independent fields merge by task identity", () => {
  const base = { items: [{ id: "one", text: "Task", done: false }] };
  const a = { items: [{ id: "one", text: "Renamed", done: false }, { id: "two", text: "Added", done: false }] };
  const b = { items: [{ id: "one", text: "Task", done: true }] };
  assert.deepEqual(mergeDeskData(base, a, b), { value: { items: [{ id: "one", text: "Renamed", done: true }, { id: "two", text: "Added", done: false }] }, conflict: false });
});
check("deletion versus a task edit preserves the removed version", () => {
  const base = { items: [{ id: "one", text: "Task" }] };
  stageDeskDraft("tasks", { base, value: { items: [] } });
  stageDeskDraft("tasks", { base, value: { items: [{ id: "one", text: "New draft" }] } });
  commitDeskDrafts("tasks", base, validate);
  assert.equal(readDeskConflicts("tasks").length, 1);
});
check("pagehide leaves a durable pending write for the next opener", () => {
  stageDeskDraft("notes", { base: { note: "" }, value: { note: "Last keystroke" } });
  assert.equal(localStorage.getItem("notes"), null);
  assert.equal(storageKeys(pendingPrefix("notes")).length, 1);
  assert.deepEqual(commitDeskDrafts("notes", { note: "" }, validate), { note: "Last keystroke" });
  assert.equal(storageKeys(pendingPrefix("notes")).length, 0);
});
check("HTTP LAN drafts persist when randomUUID is unavailable", () => {
  const cryptoDescriptor = Object.getOwnPropertyDescriptor(globalThis, "crypto");
  const originalCrypto = globalThis.crypto;
  Object.defineProperty(globalThis, "crypto", {
    configurable: true,
    value: { getRandomValues: originalCrypto.getRandomValues.bind(originalCrypto) },
  });
  try {
    const base = { pages: ["", ""] };
    stageDeskDraft("notes", { base, value: { pages: ["LAN A", ""] } });
    stageDeskDraft("notes", { base, value: { pages: ["", "LAN B"] } });
    const identifiers = storageKeys(pendingPrefix("notes")).map(key => key.split(":").at(-1));
    assert.equal(identifiers.length, 2);
    assert.ok(identifiers.every(id => /^[0-9a-f]{32}$/.test(id)));
    assert.notEqual(identifiers[0], identifiers[1]);
    assert.deepEqual(commitDeskDrafts("notes", base, validate), { pages: ["LAN A", "LAN B"] });
    assert.equal(storageKeys(pendingPrefix("notes")).length, 0);
  } finally {
    if (cryptoDescriptor) Object.defineProperty(globalThis, "crypto", cryptoDescriptor);
    else delete globalThis.crypto;
  }
});
check("failed canonical write keeps pending and recovery copies", () => {
  entries.set("notes", JSON.stringify({ version: 1, data: { note: "A" } }));
  stageDeskDraft("notes", { base: { note: "" }, value: { note: "B" } });
  const original = localStorage.setItem;
  localStorage.setItem = (key, value) => { if (key === "notes") throw new Error("Quota"); original(key, value); };
  assert.throws(() => commitDeskDrafts("notes", { note: "" }, validate));
  localStorage.setItem = original;
  assert.equal(storageKeys(pendingPrefix("notes")).length, 1);
  assert.equal(readDeskConflicts("notes").length, 1);
  commitDeskDrafts("notes", { note: "" }, validate);
  assert.equal(storageKeys(pendingPrefix("notes")).length, 0);
});
check("multiple staged edits keep causal order even in one clock tick", () => {
  const original = Date.now;
  Date.now = () => 100;
  stageDeskDraft("notes", { base: { note: "" }, value: { note: "one" } });
  stageDeskDraft("notes", { base: { note: "one" }, value: { note: "two" } });
  Date.now = original;
  assert.deepEqual(commitDeskDrafts("notes", { note: "" }, validate), { note: "two" });
  assert.equal(readDeskConflicts("notes").length, 0);
});
check("malformed pending JSON retains its exact raw data while newer edits commit", () => {
  const corruptKey = `${pendingPrefix("notes")}1:broken`;
  const corrupt = '{"base":{"note":"recoverable fragment"},';
  entries.set(corruptKey, corrupt);
  stageDeskDraft("notes", { base: { note: "" }, value: { note: "Valid new work" } });
  assert.deepEqual(commitDeskDrafts("notes", { note: "" }, validate), { note: "Valid new work" });
  assert.equal(localStorage.getItem(corruptKey), corrupt);
  assert.deepEqual(storageKeys(pendingPrefix("notes")), [corruptKey]);
  assert.equal(JSON.parse(localStorage.getItem("notes")).data.note, "Valid new work");
});
check("invalid pending shapes do not prevent drafts before and after them committing", () => {
  const validateNote = value => value && typeof value.note === "string" ? value : null;
  entries.set(`${pendingPrefix("notes")}1:first`, JSON.stringify({ base: { note: "" }, value: { note: "First" } }));
  const invalidKeys = [
    ["2:null", "null"],
    ["3:array", "[]"],
    ["4:missing", JSON.stringify({ value: { note: "" } })],
    ["5:badbase", JSON.stringify({ base: { note: 42 }, value: { note: "" } })],
    ["6:badvalue", JSON.stringify({ base: { note: "" }, value: { note: 42 } })],
  ].map(([suffix, raw]) => [`${pendingPrefix("notes")}${suffix}`, raw]);
  invalidKeys.forEach(([key, raw]) => entries.set(key, raw));
  entries.set(`${pendingPrefix("notes")}7:last`, JSON.stringify({ base: { note: "First" }, value: { note: "Last" } }));
  assert.deepEqual(commitDeskDrafts("notes", { note: "" }, validateNote), { note: "Last" });
  invalidKeys.forEach(([key, raw]) => assert.equal(localStorage.getItem(key), raw));
  assert.equal(storageKeys(pendingPrefix("notes")).length, invalidKeys.length);
});
check("malformed recovery JSON cannot hide valid conflicts or be removed by reading", () => {
  const corruptKey = `${conflictPrefix("notes")}0:broken`;
  entries.set(corruptKey, "{partial draft");
  stageDeskDraft("notes", { base: { note: "" }, value: { note: "A" } });
  stageDeskDraft("notes", { base: { note: "" }, value: { note: "B" } });
  commitDeskDrafts("notes", { note: "" }, validate);
  const conflicts = readDeskConflicts("notes", validate);
  assert.equal(conflicts.length, 1);
  assert.deepEqual(new Set([conflicts[0].current.note, conflicts[0].incoming.note]), new Set(["A", "B"]));
  assert.equal(localStorage.getItem(corruptKey), "{partial draft");
});
check("recovery restore data is validated and cannot override its actual storage key", () => {
  const validateNote = value => value && typeof value.note === "string" ? value : null;
  const realKey = `${conflictPrefix("notes")}1:valid`;
  const invalidKey = `${conflictPrefix("notes")}2:invalid`;
  entries.set(realKey, JSON.stringify({ key: "unrelated-data", current: { note: "A" }, incoming: { note: "B" } }));
  const invalid = JSON.stringify({ current: { note: 42 }, incoming: { note: "B" } });
  entries.set(invalidKey, invalid);
  const conflicts = readDeskConflicts("notes", validateNote);
  assert.deepEqual(conflicts, [{ key: realKey, current: { note: "A" }, incoming: { note: "B" } }]);
  assert.equal(localStorage.getItem(invalidKey), invalid);
});
check("malformed revision suffixes cannot poison subsequent save identifiers", () => {
  entries.set(`${pendingPrefix("notes")}not-a-number:broken`, "bad data");
  entries.set(`${pendingPrefix("notes")}Infinity:broken`, "bad data");
  stageDeskDraft("notes", { base: { note: "" }, value: { note: "Valid" } });
  const revision = storageKeys(pendingPrefix("notes")).map(key => key.slice(pendingPrefix("notes").length).split(":")[0]).find(value => /^\d+$/.test(value));
  assert.ok(Number.isSafeInteger(Number(revision)));
  assert.deepEqual(commitDeskDrafts("notes", { note: "" }, validate), { note: "Valid" });
  assert.equal(storageKeys(pendingPrefix("notes")).length, 2);
});
for (const [kind, raw] of [
  ["malformed JSON", '{partial-original'],
  ["unsupported version", JSON.stringify({ version: 2, data: { note: "Future data" } })],
  ["invalid schema", JSON.stringify({ version: 1, data: { note: 42 } })],
]) check(`${kind} primary is preserved before a valid replacement`, () => {
  const validNote = value => value && typeof value.note === "string" ? value : null;
  const initial = { note: "" };
  entries.set("notes", raw);
  commitDeskDrafts("notes", initial, validNote);
  assert.equal(entries.get("notes"), raw, "Opening alone retains the original primary");
  assert.equal(storageKeys(conflictPrefix("notes")).length, 0);
  stageDeskDraft("notes", { base: initial, value: { note: "Valid replacement" } });
  assert.deepEqual(commitDeskDrafts("notes", initial, validNote), { note: "Valid replacement" });
  const recovered = JSON.parse(entries.get(storageKeys(conflictPrefix("notes"))[0]));
  assert.equal(recovered.format, "samuel-desk-unreadable-primary");
  assert.equal(recovered.raw, raw);
  assert.equal(readDeskConflicts("notes", validNote).length, 0, "Opaque original bytes are not trusted app versions");
});
check("failure preserving corrupt primary keeps original and staged edit intact", () => {
  const validNote = value => value && typeof value.note === "string" ? value : null;
  const raw = '{original-primary';
  const initial = { note: "" };
  entries.set("notes", raw);
  stageDeskDraft("notes", { base: initial, value: { note: "New work" } });
  const original = localStorage.setItem;
  localStorage.setItem = (key, value) => { if (key.endsWith(":unreadable-primary")) throw new Error("Quota"); original(key, value); };
  try { assert.throws(() => commitDeskDrafts("notes", initial, validNote)); }
  finally { localStorage.setItem = original; }
  assert.equal(entries.get("notes"), raw);
  assert.equal(storageKeys(pendingPrefix("notes")).length, 1);
  assert.deepEqual(commitDeskDrafts("notes", initial, validNote), { note: "New work" });
  assert.equal(JSON.parse(entries.get(storageKeys(conflictPrefix("notes"))[0])).raw, raw);
  assert.equal(storageKeys(pendingPrefix("notes")).length, 0);
});
console.log(`Desk persistence: ${checks} merge, conflict, recovery and failure checks passed.`);
