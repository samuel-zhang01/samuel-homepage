/** Three-way merges retain independent fields; overlapping edits are also saved as recovery copies. */
export function mergeDeskData<T>(base: T, current: T, incoming: T): { value: T; conflict: boolean } {
  const equal = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
  let conflict = false;
  const merge = (b: unknown, c: unknown, n: unknown): unknown => {
    if (equal(n, b) || equal(c, n)) return c;
    if (equal(c, b)) return n;
    if (Array.isArray(b) && Array.isArray(c) && Array.isArray(n)) {
      const identified = [...b, ...c, ...n].every(item => item && typeof item === "object" && typeof item.id === "string");
      if (identified) {
        const ids = [...new Set([...c, ...n].map(item => item.id))];
        return ids.map(id => merge(b.find(item => item.id === id), c.find(item => item.id === id), n.find(item => item.id === id))).filter(item => item !== undefined);
      }
      if (b.length === c.length && b.length === n.length) return b.map((item, index) => merge(item, c[index], n[index]));
    }
    const record = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object" && !Array.isArray(v);
    if (record(b) && record(c) && record(n)) {
      return Object.fromEntries([...new Set([...Object.keys(b), ...Object.keys(c), ...Object.keys(n)])]
        .map(key => [key, merge(b[key], c[key], n[key])]).filter(([, value]) => value !== undefined));
    }
    conflict = true;
    return n;
  };
  return { value: merge(base, current, incoming) as T, conflict };
}

export type DeskDraft<T = unknown> = { base: T; value: T };
export type DeskConflict<T = unknown> = { key: string; current: T; incoming: T };
const deskLock = "samuel-desk-save";
let coordinationDatabase: Promise<IDBDatabase> | undefined;

/** IndexedDB transactions also coordinate tabs on origins without Web Locks (e.g. HTTP LAN previews). */
export async function withDeskLock<T>(action: () => T): Promise<T> {
  if (navigator.locks) return navigator.locks.request(deskLock, action);
  coordinationDatabase ??= new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("samuel-desk-coordination", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("lock");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => { coordinationDatabase = undefined; reject(request.error); };
  });
  const database = await coordinationDatabase;
  return new Promise<T>((resolve, reject) => {
    const transaction = database.transaction("lock", "readwrite");
    let result: T;
    const request = transaction.objectStore("lock").get("save");
    request.onsuccess = () => {
      try { result = action(); }
      catch (error) { transaction.abort(); reject(error); }
    };
    transaction.oncomplete = () => resolve(result);
    transaction.onerror = transaction.onabort = () => reject(transaction.error ?? new Error("Desk save interrupted"));
  });
}
export const pendingPrefix = (key: string) => `${key}:pending:`;
export const conflictPrefix = (key: string) => `${key}:conflict:`;

export function storageKeys(prefix: string): string[] {
  return Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index)!)
    .filter(key => key?.startsWith(prefix)).sort();
}
export function readDeskData<T>(key: string, initial: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) return initial;
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.version !== 1) return initial;
    return (key === "samuel-system7-notepad-v1" ? { activePage: parsed.activePage, pages: parsed.pages } : parsed.data) ?? initial;
  } catch { return initial; }
}
function encode(key: string, value: unknown) {
  return JSON.stringify(key === "samuel-system7-notepad-v1" ? { version: 1, ...value as object } : { version: 1, data: value });
}
/** Persist before requesting a lock: pagehide cannot wait for asynchronous work. */
export function stageDeskDraft<T>(key: string, draft: DeskDraft<T>): void {
  const revision = Math.max(Date.now() * 1000, ...storageKeys(pendingPrefix(key)).map(entry => Number(entry.slice(pendingPrefix(key).length).split(":")[0]) + 1));
  localStorage.setItem(`${pendingPrefix(key)}${revision}:${crypto.randomUUID()}`, JSON.stringify(draft));
}
export function readDeskConflicts<T>(key: string): DeskConflict<T>[] {
  return storageKeys(conflictPrefix(key)).map(entry => ({ key: entry, ...JSON.parse(localStorage.getItem(entry)!) }));
}
/** Caller holds the shared Web Lock. Each pending record is removed only after its result is durable. */
export function commitDeskDrafts<T>(key: string, initial: T, validate: (value: unknown) => T | null): T {
  let current = validate(readDeskData(key, initial)) ?? initial;
  for (const entry of storageKeys(pendingPrefix(key))) {
    const draft = JSON.parse(localStorage.getItem(entry)!) as DeskDraft;
    const base = validate(draft.base);
    const incoming = validate(draft.value);
    if (base === null || incoming === null) throw new Error("Invalid pending desk draft");
    const merged = mergeDeskData(base, current, incoming);
    const value = validate(merged.value);
    // If a merged collection exceeds an app limit, preserve both complete versions.
    if (merged.conflict || value === null) {
      localStorage.setItem(`${conflictPrefix(key)}${entry.slice(pendingPrefix(key).length)}`, JSON.stringify({ current, incoming }));
    }
    current = value ?? incoming;
    localStorage.setItem(key, encode(key, current));
    localStorage.removeItem(entry);
  }
  return current;
}
