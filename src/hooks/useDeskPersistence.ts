"use client";

import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { commitDeskDrafts, withDeskLock, readDeskData, readDeskConflicts, stageDeskDraft, type DeskConflict } from "@/lib/deskPersistence";

export type SaveState = "loading" | "saving" | "saved" | "unavailable";
export type DeskFlushDetail = { failedKeys: string[]; pending?: Promise<void>[] };

export function useDeskPersistence<T>(key: string, initialValue: T, validate: (value: unknown) => T | null):
  [T, Dispatch<SetStateAction<T>>, SaveState, DeskConflict<T>[], () => void] {
  const [value, render] = useState(initialValue);
  const [state, setState] = useState<SaveState>("loading");
  const [conflicts, setConflicts] = useState<DeskConflict<T>[]>([]);
  const latest = useRef(value);
  const base = useRef(value);
  const dirty = useRef(false);
  const ready = useRef(false);
  const options = useRef({ initialValue, validate });
  options.current = { initialValue, validate };
  const flushRef = useRef<() => Promise<void>>(async () => {});
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const setValue: Dispatch<SetStateAction<T>> = useCallback(next => {
    latest.current = typeof next === "function" ? (next as (value: T) => T)(latest.current) : next;
    dirty.current = true;
    render(latest.current);
    setState("saving");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { void flushRef.current(); }, 180);
  }, []);

  useEffect(() => {
    let mounted = true;
    const fail = () => { if (mounted) setState("unavailable"); };
    const stage = () => {
      if (!dirty.current) return;
      stageDeskDraft(key, { base: base.current, value: latest.current });
      base.current = latest.current;
      dirty.current = false;
    };
    const sync = async (): Promise<boolean> => {
      try {
        if (!ready.current && !dirty.current) {
          const stored = options.current.validate(readDeskData(key, options.current.initialValue));
          if (stored !== null && mounted) {
            latest.current = base.current = stored;
            render(stored);
          }
        }
        await withDeskLock(() => {
          const next = commitDeskDrafts(key, options.current.initialValue, options.current.validate);
          if (mounted) {
            // A newer keystroke always stays in the editor until its own save.
            if (!dirty.current) {
              latest.current = base.current = next;
              render(next);
              setState("saved");
            }
            setConflicts(readDeskConflicts<T>(key));
            ready.current = true;
          }
        });
        return true;
      } catch { fail(); return false; }
    };
    const flush = async (event?: Event) => {
      clearTimeout(timer.current);
      const detail = (event as CustomEvent<DeskFlushDetail> | undefined)?.detail;
      try { stage(); } catch {
        fail();
        detail?.failedKeys.push(key);
        return;
      }
      const pending = sync().then(success => { if (!success) detail?.failedKeys.push(key); });
      detail?.pending?.push(pending);
      await pending;
      if (dirty.current || !ready.current) detail?.failedKeys.push(key);
    };
    flushRef.current = flush;
    const storage = (event: StorageEvent) => {
      if (event.storageArea === localStorage && (event.key === null || event.key === key || event.key.startsWith(`${key}:`))) void sync();
    };
    const restore = () => { void flush(); };
    void sync();
    window.addEventListener("storage", storage);
    window.addEventListener("samuel-desk-storage-flush", flush);
    window.addEventListener("samuel-desk-storage-restored", restore);
    window.addEventListener("pagehide", flush);
    return () => {
      mounted = false;
      void flush();
      window.removeEventListener("storage", storage);
      window.removeEventListener("samuel-desk-storage-flush", flush);
      window.removeEventListener("samuel-desk-storage-restored", restore);
      window.removeEventListener("pagehide", flush);
    };
  }, [key]);

  const dismiss = () => {
    try {
      for (const conflict of conflicts) localStorage.removeItem(conflict.key);
      setConflicts([]);
    } catch { setState("unavailable"); }
  };
  return [value, setValue, state, conflicts, dismiss];
}
