/** Bounded browser counterpart of UltraConvert's AutomationCore/RuleNaming.
 * It plans invented files only; it never claims to run native conversion engines. */
export type ConvertCategory = "image" | "audio" | "video" | "document" | "config";
export type DemoInbox = "images" | "media";
export type RuleField = "category" | "format" | "nameContains" | "namePrefix" | "nameSuffix";
export type DemoFile = { id: string; name: string; category: ConvertCategory; format: string; inbox: DemoInbox; nested?: boolean };
export type DemoCondition = { id: string; field: RuleField; value: string };
export type DemoStep = { id: string; kind: "convert" | "rename"; value: string };
export type DemoRule = { inbox: DemoInbox; recursive: boolean; settleSeconds: number; matchAll: boolean; conditions: DemoCondition[]; steps: DemoStep[]; destination: "web" | "exports" | "inbox" };
export type PlanIssue = "empty-condition" | "invalid-name" | "incompatible-format" | "unsafe-destination" | "conversion-required";
export type RulePlan = { matches: boolean; conditionMatches: boolean[]; traces: string[]; outputName?: string; outputPath?: string; issue?: PlanIssue };

export const DEMO_FORMATS: Record<ConvertCategory, readonly string[]> = {
  image: ["webp", "png", "jpg"], audio: ["mp3", "wav", "flac", "opus"],
  video: ["mp4", "webm", "mp3", "opus"], document: ["docx", "md", "html", "epub"], config: ["json", "yaml", "toml"],
};
const formatAliases: Record<string, string> = { jpeg: "jpg", yml: "yaml" };
const alias = (format: string) => formatAliases[format.toLowerCase()] ?? format.toLowerCase();
export function matchCondition(file: DemoFile, condition: DemoCondition): boolean {
  const value = condition.value.toLowerCase(), name = file.name.toLowerCase();
  if (!value.trim()) return false;
  switch (condition.field) {
    case "category": return file.category === value;
    case "format": return alias(file.format) === alias(value);
    case "nameContains": return name.includes(value);
    case "namePrefix": return name.startsWith(value);
    case "nameSuffix": return name.endsWith(value);
  }
}
export function renameStem(template: string, name: string, format: string, date = "2026-10-11"): string | undefined {
  const result = template.replaceAll("{name}", name).replaceAll("{format}", format).replaceAll("{date}", date).trim();
  if (!result || result === "." || result === ".." || result.startsWith(".") || /[/\\:\0\n\r{}]/.test(result) || new TextEncoder().encode(result).length > 180) return undefined;
  return result;
}
export function uniqueOutputName(name: string, occupied: readonly string[]): string {
  const dot = name.lastIndexOf("."), stem = dot > 0 ? name.slice(0, dot) : name, extension = dot > 0 ? name.slice(dot) : "";
  let candidate = name, index = 2;
  while (occupied.includes(candidate)) candidate = `${stem} (${index++})${extension}`;
  return candidate;
}
export function planRule(rule: DemoRule, file: DemoFile, occupiedPaths: readonly string[] = []): RulePlan {
  const conditionMatches = rule.conditions.map(condition => matchCondition(file, condition));
  const eligible = file.inbox === rule.inbox && (!file.nested || rule.recursive);
  const matches = eligible && (rule.matchAll ? conditionMatches.every(Boolean) : conditionMatches.some(Boolean));
  const plan: RulePlan = { matches, conditionMatches, traces: [] };
  if (rule.conditions.some(condition => !condition.value.trim())) return { ...plan, issue: "empty-condition" };
  if (!matches) return plan;
  if (rule.destination === "inbox") return { ...plan, issue: "unsafe-destination" };
  if (file.category === "document" && !rule.steps.some(step => step.kind === "convert")) return { ...plan, issue: "conversion-required" };
  let name = file.name.replace(/\.[^.]+$/, ""), format = alias(file.format), category = file.category;
  for (const step of rule.steps) {
    if (step.kind === "convert") {
      if (!DEMO_FORMATS[category].includes(step.value)) return { ...plan, issue: "incompatible-format" };
      format = step.value;
      if (category === "video" && DEMO_FORMATS.audio.includes(format)) category = "audio";
    } else {
      const renamed = renameStem(step.value, name, format);
      if (!renamed) return { ...plan, issue: "invalid-name" };
      name = renamed;
    }
    plan.traces.push(`${name}.${format}`);
  }
  const folder = rule.destination === "web" ? "Web output" : "Exports";
  const occupied = occupiedPaths.filter(path => path.startsWith(`${folder}/`)).map(path => path.slice(folder.length + 1));
  plan.outputName = uniqueOutputName(`${name}.${format}`, occupied);
  plan.outputPath = `${folder}/${plan.outputName}`;
  return plan;
}
export function templateRule(category: "image" | "audio" | "config"): DemoRule {
  return {
    inbox: category === "audio" ? "media" : "images", recursive: false, settleSeconds: 3, matchAll: true,
    conditions: [{ id: "condition-1", field: "category", value: category }],
    steps: [{ id: "action-1", kind: "convert", value: category === "image" ? "webp" : category === "audio" ? "mp3" : "yaml" }, { id: "action-2", kind: "rename", value: "{name}-{format}" }],
    destination: category === "image" ? "web" : "exports",
  };
}
export const exampleFiles = (inbox: DemoInbox): DemoFile[] => [
  { id: "photo", name: "Photo.png", category: "image", format: "png", inbox },
  { id: "poster", name: "Poster.jpg", category: "image", format: "jpg", inbox, nested: true },
  { id: "recording", name: "Recording.wav", category: "audio", format: "wav", inbox },
  { id: "clip", name: "Clip.mp4", category: "video", format: "mp4", inbox },
  { id: "notes", name: "Notes.md", category: "document", format: "md", inbox },
  { id: "settings", name: "Settings.json", category: "config", format: "json", inbox },
];
