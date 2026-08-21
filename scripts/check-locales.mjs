import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const systemPath = resolve(projectRoot, "src/components/SystemSevenDesktop.tsx");
const i18nPath = resolve(projectRoot, "src/lib/i18n.ts");
const archiveI18nPath = resolve(projectRoot, "src/components/projects/projectArchiveI18n.ts");

const [systemSource, i18nSource, archiveI18nSource] = await Promise.all([
  readFile(systemPath, "utf8"),
  readFile(i18nPath, "utf8"),
  readFile(archiveI18nPath, "utf8"),
]);

function compileModule(source, fileName) {
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
    fileName,
  }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
}

function flatten(value, prefix = "", result = {}) {
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (child && typeof child === "object") flatten(child, path, result);
    else result[path] = child;
  }
  return result;
}

const archiveModule = await compileModule(archiveI18nSource, archiveI18nPath);
const coreModule = await compileModule(i18nSource, i18nPath);
const archiveLocales = ["en-GB", "en-US", "zh-CN", "zh-TW"];
const archiveCopies = Object.fromEntries(
  archiveLocales.map((locale) => [locale, flatten(archiveModule.getProjectArchiveCopy(locale))]),
);
const archiveKeys = Object.keys(archiveCopies["en-GB"]);
const archiveErrors = [];
const acceptedArchiveIdentity = new Set(["SYSTEM 7", "PDF"]);

for (const locale of archiveLocales.slice(1)) {
  const copy = archiveCopies[locale];
  const copyKeys = Object.keys(copy);
  for (const key of archiveKeys) {
    if (!(key in copy)) archiveErrors.push(`${locale} is missing archive key ${key}`);
    if (
      locale.startsWith("zh-")
      && typeof copy[key] === "string"
      && copy[key] === archiveCopies["en-GB"][key]
      && !acceptedArchiveIdentity.has(copy[key])
    ) {
      archiveErrors.push(`${locale} leaves archive key ${key} untranslated: ${copy[key]}`);
    }
  }
  for (const key of copyKeys) {
    if (!archiveKeys.includes(key)) archiveErrors.push(`${locale} has unexpected archive key ${key}`);
  }
}

const i18nFile = ts.createSourceFile(
  i18nPath,
  i18nSource,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TS,
);
let zhObject;
let traditionalCharsObject;

function findZhObject(node) {
  if (
    ts.isVariableDeclaration(node)
    && ts.isIdentifier(node.name)
    && node.name.text === "zhCN"
    && node.initializer
    && ts.isObjectLiteralExpression(node.initializer)
  ) {
    zhObject = node.initializer;
  }
  if (
    ts.isVariableDeclaration(node)
    && ts.isIdentifier(node.name)
    && node.name.text === "traditionalChars"
    && node.initializer
    && ts.isObjectLiteralExpression(node.initializer)
  ) {
    traditionalCharsObject = node.initializer;
  }
  ts.forEachChild(node, findZhObject);
}

findZhObject(i18nFile);
if (!zhObject) throw new Error("Could not find the zhCN translation dictionary.");
if (!traditionalCharsObject) throw new Error("Could not find the Traditional Chinese character map.");

const zhKeys = new Set();
const duplicateZhKeys = [];
for (const property of zhObject.properties) {
  if (!ts.isPropertyAssignment(property)) continue;
  const key = ts.isStringLiteralLike(property.name) || ts.isIdentifier(property.name)
    ? property.name.text
    : null;
  if (!key) continue;
  if (zhKeys.has(key)) duplicateZhKeys.push(key);
  zhKeys.add(key);
}

const systemFile = ts.createSourceFile(
  systemPath,
  systemSource,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX,
);
const translatedAttributes = new Set(["aria-label", "title", "placeholder", "alt"]);
const visibleRecordFields = new Set([
  "title",
  "copy",
  "description",
  "clue",
  "fact",
  "label",
  "left",
  "right",
  "role",
  "company",
  "period",
  "location",
  "tag",
]);
const acceptedCoreIdentity = new Set([
  "Samuel Zhang",
  "SAMUEL.ZHANG",
  "coverd.ai",
  "COVERD",
  "GROWMAT",
  "Pfizer",
  "Marsh",
  "LinkedIn",
  "GitHub",
  "GitHub Actions Runner",
  "Nginx Proxy Manager",
  "Home Assistant",
  "Synology Cloud",
  "Frappe / ERPNext",
  "Odoo Lab",
  "BLE → SQL → Grafana",
  "ATS",
  "CV + VOICE",
  "ICL",
  "KCL",
  "SCDF",
  "DOCKER",
  "GRAFANA",
  "EXTERNAL",
  "F",
  "GHz",
  "8.00 GHz",
  "CO₂",
  "Empty puzzle space",
  "⌘W",
  "⌘Z",
  "⌘X",
  "⌘C",
  "⌘V",
  "∞ MB",
  "32 MB",
  "文/A",
]);
const visibleStrings = new Map();

function decodeJsx(value) {
  return value
    .replaceAll("&apos;", "'")
    .replaceAll("&#39;", "'")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", "\"")
    .replace(/\s+/g, " ")
    .trim();
}

function addVisible(value, node) {
  const compact = decodeJsx(value);
  if (!compact || !/[A-Za-z]/.test(compact)) return;
  if (acceptedCoreIdentity.has(compact)) return;
  if (/^(?:https?:|mailto:|\/)/i.test(compact)) return;
  if (/^[a-z\d_-]+$/i.test(compact) && compact[0] === compact[0].toLowerCase()) return;
  if (!visibleStrings.has(compact)) {
    visibleStrings.set(compact, systemFile.getLineAndCharacterOfPosition(node.getStart(systemFile)).line + 1);
  }
}

function visitSystem(node, renderedExpression = false) {
  if (ts.isJsxText(node)) addVisible(node.text, node);

  if (ts.isJsxAttribute(node)) {
    const name = node.name.text;
    if (translatedAttributes.has(name) && node.initializer && ts.isStringLiteral(node.initializer)) {
      addVisible(node.initializer.text, node.initializer);
    }
    if (node.initializer && ts.isJsxExpression(node.initializer) && node.initializer.expression) {
      visitSystem(node.initializer.expression, translatedAttributes.has(name));
    }
    return;
  }

  if (ts.isJsxExpression(node)) {
    if (node.expression) visitSystem(node.expression, true);
    return;
  }

  if (renderedExpression && ts.isStringLiteralLike(node)) addVisible(node.text, node);

  if (
    ts.isPropertyAssignment(node)
    && ts.isIdentifier(node.name)
    && visibleRecordFields.has(node.name.text)
    && ts.isStringLiteralLike(node.initializer)
  ) {
    addVisible(node.initializer.text, node.initializer);
  }

  if (
    ts.isCallExpression(node)
    && ts.isIdentifier(node.expression)
    && node.expression.text === "setWordMessage"
  ) {
    for (const argument of node.arguments) {
      if (ts.isStringLiteralLike(argument)) addVisible(argument.text, argument);
    }
  }

  ts.forEachChild(node, (child) => visitSystem(child, renderedExpression));
}

visitSystem(systemFile);

const simplifiedCharacters = new Set();
for (const property of traditionalCharsObject.properties) {
  if (!ts.isPropertyAssignment(property) || !ts.isStringLiteralLike(property.name)) continue;
  if (!ts.isStringLiteralLike(property.initializer)) continue;
  if (property.name.text !== property.initializer.text) simplifiedCharacters.add(property.name.text);
}

const traditionalResiduals = [...visibleStrings].flatMap(([value, line]) => {
  const translated = coreModule.translateText("zh-TW", value);
  const residual = [...translated].find((character) => simplifiedCharacters.has(character));
  if (residual) return [`${systemPath}:${line}: ${residual} remains in ${translated}`];
  if (translated.includes("恢複")) return [`${systemPath}:${line}: contextually incorrect 恢複 in ${translated}`];
  return [];
});

const obviousArchiveSimplifiedCharacters = new Set(["点", "键", "频", "钮", "颈"]);
for (const [key, value] of Object.entries(archiveCopies["zh-TW"])) {
  if (typeof value !== "string") continue;
  // Archive copy is independently translated rather than mechanically
  // converted. Restrict this check to unambiguous residue: characters such as
  // 游 are valid Traditional Chinese in 下游 even though 游泳 may become 遊泳.
  const residual = [...value].find((character) => obviousArchiveSimplifiedCharacters.has(character));
  if (residual) traditionalResiduals.push(`zh-TW archive key ${key}: ${residual} remains in ${value}`);
  if (value.includes("恢複")) traditionalResiduals.push(`zh-TW archive key ${key}: contextually incorrect 恢複`);
}

const missingCoreKeys = [...visibleStrings]
  .filter(([value]) => !zhKeys.has(value))
  .map(([value, line]) => `${systemPath}:${line}: ${value}`);

const errors = [
  ...archiveErrors,
  ...duplicateZhKeys.map((key) => `duplicate zhCN key: ${key}`),
  ...missingCoreKeys.map((entry) => `missing zhCN translation: ${entry}`),
  ...traditionalResiduals.map((entry) => `Traditional Chinese residue: ${entry}`),
];

if (errors.length) {
  console.error("Locale coverage validation failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Locale gate: ${archiveKeys.length} archive keys match across 4 locales; ${visibleStrings.size} core System 7 strings have Mandarin coverage.`,
);
