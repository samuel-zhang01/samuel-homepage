import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const compiled = ts.transpileModule(await readFile(new URL("../src/lib/deskPersistence.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { mergeDeskData, stageDeskDraft, commitDeskDrafts, readDeskConflicts, pendingPrefix, storageKeys } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
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
console.log(`Desk persistence: ${checks} merge, conflict, recovery and failure checks passed.`);
