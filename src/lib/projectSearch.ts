export const foldSearch = (value: string) => value.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase();

export type ProjectSearchDocument = { text: string; search: string };
export type ProjectSearchIndex = Map<string, ProjectSearchDocument>;

/** Accept text only for known local projects; never render server-provided HTML. */
export function parseProjectSearchIndex(value: unknown, slugs: readonly string[]): ProjectSearchIndex {
  if (!value || typeof value !== "object" || !("version" in value) || value.version !== 1
    || !("documents" in value) || !Array.isArray(value.documents) || value.documents.length !== slugs.length) {
    throw new Error("Invalid project search index");
  }
  const allowed = new Set(slugs);
  const index: ProjectSearchIndex = new Map();
  let length = 0;
  for (const document of value.documents) {
    if (!document || typeof document !== "object" || typeof document.slug !== "string"
      || !allowed.has(document.slug) || index.has(document.slug)
      || typeof document.text !== "string" || !document.text.trim() || document.text.length > 500_000) {
      throw new Error("Invalid project search document");
    }
    length += document.text.length;
    if (length > 8_000_000) throw new Error("Project search index is too large");
    index.set(document.slug, { text: document.text, search: foldSearch(document.text) });
  }
  return index;
}

export function searchExcerpt(text: string, words: readonly string[]): string {
  const lines = text.split(/\n+/u).filter(Boolean);
  const line = lines.find((part) => words.every((word) => foldSearch(part).includes(word)))
    ?? lines.find((part) => words.some((word) => foldSearch(part).includes(word))) ?? lines[0] ?? "";
  const match = Math.max(0, ...words.map((word) => foldSearch(line).indexOf(word)).filter((index) => index >= 0));
  const start = Math.max(0, match - 45);
  return `${start ? "…" : ""}${line.slice(start, start + 180)}${line.length > start + 180 ? "…" : ""}`;
}
