export type DesktopPattern = "classic" | "blue" | "paper";
export type DesktopPreferences = {
  pattern: DesktopPattern;
  clockFormat: "24h" | "12h";
  reduceEffects: boolean;
  showStartup: boolean;
};

export const PATTERN_STORAGE_KEY = "samuel-system7-pattern";
export const PREFERENCES_STORAGE_KEY = "samuel-system7-preferences-v1";
export const DEFAULT_DESKTOP_PREFERENCES: DesktopPreferences = {
  pattern: "classic", clockFormat: "24h", reduceEffects: false, showStartup: true,
};

export function readDesktopPreferences(storage: Pick<Storage, "getItem">): DesktopPreferences {
  let saved: Partial<DesktopPreferences> = {};
  try {
    const value: unknown = JSON.parse(storage.getItem(PREFERENCES_STORAGE_KEY) ?? "null");
    if (value && typeof value === "object" && !Array.isArray(value)) saved = value;
  } catch {
    // Corrupt preferences must never prevent the desktop or desk data opening.
  }
  const pattern = storage.getItem(PATTERN_STORAGE_KEY);
  return {
    pattern: pattern === "blue" || pattern === "paper" ? pattern : "classic",
    clockFormat: saved.clockFormat === "12h" ? "12h" : "24h",
    reduceEffects: saved.reduceEffects === true,
    showStartup: saved.showStartup !== false,
  };
}
