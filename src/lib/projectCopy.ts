import { translateText, type Locale } from "./i18n";

/** English source is the stable key; both Mandarin editions are reviewed copy. */
export type ProjectCopyTable = Readonly<Record<string, readonly [simplified: string, traditional: string]>>;
export type ProjectCopyValues = Readonly<Record<string, string | number>>;

type Pattern = { source: string; matcher: RegExp; names: string[]; translations: readonly [string, string] };
const compiled = new WeakMap<ProjectCopyTable, Pattern[]>();
const placeholder = /\{([a-zA-Z0-9_]+)\}/g;
const escapeRegex = (source: string) => source.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function patterns(copy: ProjectCopyTable) {
  const existing = compiled.get(copy);
  if (existing) return existing;
  const result = Object.entries(copy).flatMap(([source, translations]) => {
    const matches = [...source.matchAll(placeholder)];
    if (!matches.length || source.replace(placeholder, "").trim().length < 2) return [];
    let offset = 0;
    let pattern = "^";
    for (const match of matches) {
      pattern += escapeRegex(source.slice(offset, match.index)) + "([\\s\\S]*?)";
      offset = (match.index ?? 0) + match[0].length;
    }
    pattern += escapeRegex(source.slice(offset)) + "$";
    return [{ source, matcher: new RegExp(pattern), names: matches.map((match) => match[1]), translations }];
  }).sort((a, b) => b.source.length - a.source.length);
  compiled.set(copy, result);
  return result;
}

/** Translate authored text or an explicitly registered interpolation template. */
export function projectText(locale: Locale, copy: ProjectCopyTable, source: string, values?: ProjectCopyValues): string {
  const compact = source.replace(/\s+/g, " ").trim();
  const fill = (value: string) => values ? value.replace(placeholder, (match, key: string) => String(values[key] ?? match)) : value;
  if (locale === "en-GB" || locale === "en-US") return translateText(locale, fill(source));
  const index = locale === "zh-CN" ? 0 : 1;
  const direct = copy[compact];
  let translated = direct ? fill(direct[index]) : undefined;
  if (translated === undefined && compact.length <= 4000) {
    for (const pattern of patterns(copy)) {
      const match = compact.match(pattern.matcher);
      if (!match) continue;
      const captured = Object.fromEntries(pattern.names.map((name, position) => [name, match[position + 1]]));
      translated = pattern.translations[index].replace(placeholder, (token, key: string) => {
        const value = captured[key];
        if (value === undefined) return token;
        const compactValue = value.replace(/\s+/g, " ").trim();
        const capturedCopy = copy[compactValue]?.[index];
        return capturedCopy === undefined ? translateText(locale, value) : `${value.match(/^\s*/)?.[0] ?? ""}${capturedCopy}${value.match(/\s*$/)?.[0] ?? ""}`;
      });
      break;
    }
  }
  if (translated === undefined) return translateText(locale, source);
  return `${source.match(/^\s*/)?.[0] ?? ""}${translated}${source.match(/\s*$/)?.[0] ?? ""}`;
}
