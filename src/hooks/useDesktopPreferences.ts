"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_DESKTOP_PREFERENCES, PATTERN_STORAGE_KEY, PREFERENCES_STORAGE_KEY, readDesktopPreferences, type DesktopPreferences } from "@/lib/desktopPreferences";

export function useDesktopPreferences() {
  const [preferences, setPreferences] = useState(DEFAULT_DESKTOP_PREFERENCES);
  const latest = useRef(preferences);
  const sessionOnly = useRef(false);
  const [storageAvailable, setStorageAvailable] = useState<boolean | null>(null);
  useEffect(() => {
    const load = () => {
      try {
        const next = readDesktopPreferences(window.localStorage);
        if (sessionOnly.current) return;
        latest.current = next;
        setPreferences(next);
      } catch { sessionOnly.current = true; setStorageAvailable(false); }
    };
    const sync = (event: StorageEvent) => {
      if (event.key === null || event.key === PATTERN_STORAGE_KEY || event.key === PREFERENCES_STORAGE_KEY) load();
    };
    load();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.reduceEffects = String(preferences.reduceEffects);
    return () => { delete document.documentElement.dataset.reduceEffects; };
  }, [preferences.reduceEffects]);

  const updatePreferences = useCallback((change: Partial<DesktopPreferences>) => {
    // Read the latest persisted values before merging, so separate tabs changing
    // different controls do not overwrite each other's unchanged preferences.
    let previous = latest.current;
    if (!sessionOnly.current) {
      try { previous = readDesktopPreferences(window.localStorage); } catch { /* session only */ }
    }
    const next = { ...previous, ...change };
    latest.current = next;
    setPreferences(next);
    try {
      window.localStorage.setItem(PATTERN_STORAGE_KEY, next.pattern);
      window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify({
        clockFormat: next.clockFormat, reduceEffects: next.reduceEffects, showStartup: next.showStartup,
      }));
      setStorageAvailable(true);
      sessionOnly.current = false;
    } catch { sessionOnly.current = true; setStorageAvailable(false); }
  }, []);
  return { preferences, updatePreferences, storageAvailable };
}
