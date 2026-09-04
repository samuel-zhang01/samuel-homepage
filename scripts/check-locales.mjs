import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import simplifiedToTraditionalCharacters from "opencc-js/dict/STCharacters";
import ts from "typescript";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const systemPath = resolve(projectRoot, "src/components/SystemSevenDesktop.tsx");
const productivityPath = resolve(projectRoot, "src/components/ProductivityApps.tsx");
const productivityExtrasPath = resolve(projectRoot, "src/components/ProductivityExtras.tsx");
const finderPath = resolve(projectRoot, "src/components/DesktopFinder.tsx");
const i18nPath = resolve(projectRoot, "src/lib/i18n.ts");
const archiveI18nPath = resolve(projectRoot, "src/components/projects/projectArchiveI18n.ts");
const projectsPath = resolve(projectRoot, "src/data/projects.ts");
const projectSuitesPath = resolve(projectRoot, "src/components/projects/projectSuites.ts");
const enUsCvPath = resolve(projectRoot, "others/localised-cv/Samuel-Zhang-Applied-AI-CV-en-US.tex");
const zhTwCvPath = resolve(projectRoot, "others/localised-cv/Samuel-Zhang-Applied-AI-CV-zh-TW.tex");
const sideQuestPath = resolve(projectRoot, "src/components/SideQuestCabinetApp.tsx");
const sideQuestI18nPath = resolve(projectRoot, "src/components/sideQuestI18n.tsx");

const [
  systemSource,
  productivitySource,
  productivityExtrasSource,
  finderSource,
  i18nSource,
  archiveI18nSource,
  projectsSource,
  projectSuitesSource,
  enUsCvSource,
  zhTwCvSource,
  sideQuestSource,
  sideQuestI18nSource,
] = await Promise.all([
  readFile(systemPath, "utf8"),
  readFile(productivityPath, "utf8"),
  readFile(productivityExtrasPath, "utf8"),
  readFile(finderPath, "utf8"),
  readFile(i18nPath, "utf8"),
  readFile(archiveI18nPath, "utf8"),
  readFile(projectsPath, "utf8"),
  readFile(projectSuitesPath, "utf8"),
  readFile(enUsCvPath, "utf8"),
  readFile(zhTwCvPath, "utf8"),
  readFile(sideQuestPath, "utf8"),
  readFile(sideQuestI18nPath, "utf8"),
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
const orbitalI18nPath = resolve(projectRoot, "src/components/orbitalI18n.ts");
const orbitalModule = await compileModule(await readFile(orbitalI18nPath, "utf8"), orbitalI18nPath);
const archiveLocales = ["en-GB", "en-US", "zh-CN", "zh-TW"];
const archiveCopies = Object.fromEntries(
  archiveLocales.map((locale) => [locale, flatten(archiveModule.getProjectArchiveCopy(locale))]),
);
const archiveKeys = Object.keys(archiveCopies["en-GB"]);
const archiveErrors = [];
const orbitalErrors = [];
const orbitalKeys = Object.keys(orbitalModule.orbitalCopies["en-GB"]);
for (const locale of archiveLocales) {
  const copy = orbitalModule.orbitalCopies[locale];
  if (Object.keys(copy).length !== orbitalKeys.length) orbitalErrors.push(`${locale} orbital key count differs`);
  for (const key of orbitalKeys) {
    if (typeof copy[key] !== "string" || !copy[key].trim()) orbitalErrors.push(`${locale} missing orbital key: ${key}`);
    if (locale.startsWith("zh-") && key !== "radialAxis" && copy[key] === orbitalModule.orbitalCopies["en-GB"][key]) orbitalErrors.push(`${locale} untranslated orbital key: ${key}`);
  }
}
const acceptedArchiveIdentity = new Set(["SYSTEM 7", "PDF"]);
const regionalisationChecks = [
  ["en-US", "CV & documents", "Resume & documents"],
  ["en-US", "Virtualisation cluster", "Virtualization cluster"],
  ["en-US", "Self-hosted document access and synchronisation across personal devices.", "Self-hosted document access and synchronization across personal devices."],
  ["en-US", "A containerised environment for exploring open-source ERP and workflow software.", "A containerized environment for exploring open-source ERP and workflow software."],
  ["en-US", "Musical theatre", "Musical theater"],
  ["en-US", "Fit randomised HPLC–UV peaks across three difficulty levels.", "Fit randomized HPLC–UV peaks across three difficulty levels."],
  ["en-US", "MODELLING", "MODELING"],
  ["zh-TW", "Celsius", "攝氏"],
  ["zh-TW", "Fahrenheit", "華氏"],
  ["zh-TW", "Kelvin", "克耳文"],
];
const regionalisationErrors = regionalisationChecks.flatMap(([locale, source, expected]) => {
  const actual = coreModule.translateText(locale, source);
  return actual === expected
    ? []
    : [`${locale} regionalisation mismatch for ${source}: expected ${expected}, received ${actual}`];
});
const regionalSourceErrors = [];
const enUsCvBritishMatch = enUsCvSource.match(/\b(?:containerised|virtualisation|synchronisation|energised|theatre)\b/i);
if (enUsCvBritishMatch) {
  regionalSourceErrors.push(`${enUsCvPath} retains British spelling: ${enUsCvBritishMatch[0]}`);
}
const zhTwMainlandMatch = zhTwCvSource.match(/(?:構建|支持|審計|接入|此前|核查|全棧|高級領導|應急|配置|憑據|氣候變化|攝氏度|華氏度|開爾文)/);
if (zhTwMainlandMatch) {
  regionalSourceErrors.push(`${zhTwCvPath} retains non-Taiwan terminology: ${zhTwMainlandMatch[0]}`);
}

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

const sideQuestI18nFile = ts.createSourceFile(
  sideQuestI18nPath,
  sideQuestI18nSource,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX,
);
let sideQuestZhObject;
let sideQuestTraditionalPhrasesArray;

function findSideQuestObjects(node) {
  if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
    if (node.name.text === "zhCN" && ts.isObjectLiteralExpression(node.initializer)) {
      sideQuestZhObject = node.initializer;
    }
    if (node.name.text === "traditionalPhrases" && ts.isArrayLiteralExpression(node.initializer)) {
      sideQuestTraditionalPhrasesArray = node.initializer;
    }
  }
  ts.forEachChild(node, findSideQuestObjects);
}

findSideQuestObjects(sideQuestI18nFile);
if (!sideQuestZhObject) throw new Error("Could not find the SideQuest zhCN translation dictionary.");
if (!sideQuestTraditionalPhrasesArray) throw new Error("Could not find the SideQuest Taiwan phrase map.");

const sideQuestZhValues = sideQuestZhObject.properties.flatMap((property) => {
  if (!ts.isPropertyAssignment(property) || !ts.isStringLiteralLike(property.initializer)) return [];
  return [{
    value: property.initializer.text,
    line: sideQuestI18nFile.getLineAndCharacterOfPosition(property.getStart(sideQuestI18nFile)).line + 1,
  }];
});
const sideQuestZhKeys = new Set();
const duplicateSideQuestZhKeys = [];
for (const property of sideQuestZhObject.properties) {
  if (!ts.isPropertyAssignment(property)) continue;
  const key = ts.isStringLiteralLike(property.name) || ts.isIdentifier(property.name)
    ? property.name.text
    : null;
  if (!key) continue;
  if (sideQuestZhKeys.has(key)) duplicateSideQuestZhKeys.push(key);
  sideQuestZhKeys.add(key);
}
const sideQuestTraditionalPhrases = sideQuestTraditionalPhrasesArray.elements.flatMap((element) => {
  if (!ts.isArrayLiteralExpression(element) || element.elements.length !== 2) return [];
  const [from, to] = element.elements;
  if (!ts.isStringLiteralLike(from) || !ts.isStringLiteralLike(to)) return [];
  return [[from.text, to.text]];
});

const zhKeys = new Set();
const zhKeyLocations = new Map();
const duplicateZhKeys = [];
for (const property of zhObject.properties) {
  if (!ts.isPropertyAssignment(property)) continue;
  const key = ts.isStringLiteralLike(property.name) || ts.isIdentifier(property.name)
    ? property.name.text
    : null;
  if (!key) continue;
  if (zhKeys.has(key)) duplicateZhKeys.push(key);
  zhKeys.add(key);
  zhKeyLocations.set(key, i18nFile.getLineAndCharacterOfPosition(property.getStart(i18nFile)).line + 1);
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
  "name",
  "eyebrow",
  "meta",
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
  "Proxmox",
  "GLKVM",
  "WireGuard",
  "Pi-hole",
  "Fail2ban",
  "Guacamole",
  "Portainer",
  "Homepage",
  "Ofelia",
  "PostgreSQL",
  "Aranet Air Quality",
  "Nextcloud",
  "Jellyfin",
  "Kiwix",
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
  "MC",
  "MR",
  "M+",
  "M−",
  "M",
  "AC",
  "C",
  "文/A",
  "HEX",
  "RGB",
  "HSL",
  "AAA",
  "AA",
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

function addVisible(value, node, sourceFile, sourcePath, allowLowercase = false) {
  const compact = decodeJsx(value);
  if (!compact || !/[A-Za-z]/.test(compact)) return;
  if (acceptedCoreIdentity.has(compact)) return;
  if (/^(?:https?:|mailto:|\/)/i.test(compact)) return;
  if (!allowLowercase && /^[a-z\d_-]+$/i.test(compact) && compact[0] === compact[0].toLowerCase()) return;
  if (!visibleStrings.has(compact)) {
    visibleStrings.set(compact, {
      path: sourcePath,
      line: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1,
    });
  }
}

const sideQuestFile = ts.createSourceFile(
  sideQuestPath,
  sideQuestSource,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX,
);
const translatedSideQuestAttributes = new Set([
  "alt",
  "aria-label",
  "title",
  "placeholder",
  "chapter",
  "intro",
]);
const visibleSideQuestCollections = new Set([
  "panels",
  "dayMoments",
  "teammates",
  "judgingCriteria",
  "schedule",
  "creditGroups",
  "challengeOptions",
  "loopSteps",
  "loopDetails",
]);
const acceptedSideQuestIdentity = new Set([
  "SZ",
  "Samuel Zhang",
  "JR",
  "Javiera Rubio",
  "AG",
  "Andrés Daniel Godoy Ortiz",
  "Tijs",
  "Siena",
  "Luke",
  "Rachel",
  "Zizou",
  "Aruzhan",
  "Cognition",
  "Healf",
  "ElevenLabs",
  "Wispr Flow",
  "ROXFIT",
  "Deepline",
  "Tavily",
  "Thrad",
  "km",
  "KM ÷ 2",
  "min",
  "5K",
  "RH",
  "44 km",
  "SideQuest",
]);
const sideQuestSourceStrings = new Map();

function addSideQuestSource(value, node, allowLowercase = false) {
  const compact = decodeJsx(value);
  if (!compact || !/[A-Za-z]/.test(compact)) return;
  if (acceptedSideQuestIdentity.has(compact)) return;
  if (/^(?:https?:|mailto:|\/)/i.test(compact)) return;
  if (!allowLowercase && /^[a-z\d_-]+$/i.test(compact) && compact[0] === compact[0].toLowerCase()) return;
  if (!sideQuestSourceStrings.has(compact)) {
    sideQuestSourceStrings.set(compact, {
      path: sideQuestPath,
      line: sideQuestFile.getLineAndCharacterOfPosition(node.getStart(sideQuestFile)).line + 1,
    });
  }
}

function visitSideQuest(node, renderedExpression = false) {
  if (ts.isJsxText(node)) addSideQuestSource(node.text, node, true);

  if (ts.isJsxAttribute(node)) {
    const name = node.name.text;
    if (
      translatedSideQuestAttributes.has(name)
      && node.initializer
      && ts.isStringLiteral(node.initializer)
    ) {
      addSideQuestSource(node.initializer.text, node.initializer, true);
    }
    if (node.initializer && ts.isJsxExpression(node.initializer) && node.initializer.expression) {
      visitSideQuest(node.initializer.expression, translatedSideQuestAttributes.has(name));
    }
    return;
  }

  if (ts.isJsxExpression(node)) {
    if (node.expression) visitSideQuest(node.expression, true);
    return;
  }

  if (renderedExpression && ts.isStringLiteralLike(node)) {
    addSideQuestSource(node.text, node);
  }

  ts.forEachChild(node, (child) => visitSideQuest(child, renderedExpression));
}

function collectSideQuestSources(node) {
  if (
    ts.isVariableDeclaration(node)
    && ts.isIdentifier(node.name)
    && visibleSideQuestCollections.has(node.name.text)
    && node.initializer
  ) {
    visitSideQuest(node.initializer, true);
  }
  if (
    ts.isCallExpression(node)
    && ts.isIdentifier(node.expression)
    && node.expression.text === "localizeSideQuestTree"
    && node.arguments[1]
  ) {
    visitSideQuest(node.arguments[1]);
  }
  if (
    ts.isCallExpression(node)
    && ts.isIdentifier(node.expression)
    && node.expression.text === "setSandboxResult"
  ) {
    for (const argument of node.arguments) {
      if (ts.isStringLiteralLike(argument)) addSideQuestSource(argument.text, argument, true);
    }
  }
  ts.forEachChild(node, collectSideQuestSources);
}

collectSideQuestSources(sideQuestFile);

function visitSystem(node, sourceFile, sourcePath, renderedExpression = false) {
  if (ts.isJsxText(node)) addVisible(node.text, node, sourceFile, sourcePath);

  if (ts.isJsxAttribute(node)) {
    const name = node.name.text;
    if (translatedAttributes.has(name) && node.initializer && ts.isStringLiteral(node.initializer)) {
      addVisible(node.initializer.text, node.initializer, sourceFile, sourcePath);
    }
    if (node.initializer && ts.isJsxExpression(node.initializer) && node.initializer.expression) {
      visitSystem(node.initializer.expression, sourceFile, sourcePath, translatedAttributes.has(name));
    }
    return;
  }

  if (ts.isJsxExpression(node)) {
    if (node.expression) visitSystem(node.expression, sourceFile, sourcePath, true);
    return;
  }

  if (renderedExpression && ts.isStringLiteralLike(node)) addVisible(node.text, node, sourceFile, sourcePath);

  if (
    ts.isPropertyAssignment(node)
    && ts.isIdentifier(node.name)
    && visibleRecordFields.has(node.name.text)
    && ts.isStringLiteralLike(node.initializer)
  ) {
    addVisible(node.initializer.text, node.initializer, sourceFile, sourcePath);
  }

  if (
    ts.isCallExpression(node)
    && ts.isIdentifier(node.expression)
    && node.expression.text === "setWordMessage"
  ) {
    for (const argument of node.arguments) {
      if (ts.isStringLiteralLike(argument)) addVisible(argument.text, argument, sourceFile, sourcePath);
    }
  }

  if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
    const argumentIndex = node.expression.text === "t"
      ? 0
      : node.expression.text === "translateText"
        ? 1
        : -1;
    const argument = argumentIndex >= 0 ? node.arguments[argumentIndex] : null;
    if (argument && ts.isStringLiteralLike(argument)) addVisible(argument.text, argument, sourceFile, sourcePath, true);
  }

  if (
    ts.isCallExpression(node)
    && ts.isIdentifier(node.expression)
    && node.expression.text === "factorUnit"
    && node.arguments[1]
    && ts.isStringLiteralLike(node.arguments[1])
  ) {
    addVisible(node.arguments[1].text, node.arguments[1], sourceFile, sourcePath, true);
  }

  ts.forEachChild(node, (child) => visitSystem(child, sourceFile, sourcePath, renderedExpression));
}

const productivityFile = ts.createSourceFile(
  productivityPath,
  productivitySource,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX,
);
const productivityExtrasFile = ts.createSourceFile(
  productivityExtrasPath,
  productivityExtrasSource,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX,
);

const projectsFile = ts.createSourceFile(
  projectsPath,
  projectsSource,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TS,
);
const projectSuitesFile = ts.createSourceFile(
  projectSuitesPath,
  projectSuitesSource,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TS,
);
const projectTranslationSources = new Map();

function addProjectTranslationSource(value, node, sourceFile, sourcePath) {
  if (!projectTranslationSources.has(value)) {
    projectTranslationSources.set(value, {
      path: sourcePath,
      line: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1,
    });
  }
}

function collectProjectSummaries(node) {
  if (
    ts.isPropertyAssignment(node)
    && ts.isIdentifier(node.name)
    && node.name.text === "summary"
    && ts.isStringLiteralLike(node.initializer)
  ) {
    addProjectTranslationSource(node.initializer.text, node.initializer, projectsFile, projectsPath);
  }
  ts.forEachChild(node, collectProjectSummaries);
}

function collectSuiteCopy(node) {
  if (
    ts.isPropertyAssignment(node)
    && ts.isIdentifier(node.name)
    && (node.name.text === "title" || node.name.text === "description")
    && ts.isStringLiteralLike(node.initializer)
  ) {
    addProjectTranslationSource(node.initializer.text, node.initializer, projectSuitesFile, projectSuitesPath);
  }
  ts.forEachChild(node, collectSuiteCopy);
}

collectProjectSummaries(projectsFile);
for (const statement of projectSuitesFile.statements) {
  if (!ts.isVariableStatement(statement)) continue;
  for (const declaration of statement.declarationList.declarations) {
    if (
      ts.isIdentifier(declaration.name)
      && declaration.name.text === "projectSuites"
      && declaration.initializer
    ) {
      collectSuiteCopy(declaration.initializer);
    }
  }
}

visitSystem(systemFile, systemFile, systemPath);
visitSystem(productivityFile, productivityFile, productivityPath);
visitSystem(productivityExtrasFile, productivityExtrasFile, productivityExtrasPath);
const finderFile = ts.createSourceFile(finderPath, finderSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
visitSystem(finderFile, finderFile, finderPath);

const comprehensiveSimplifiedCharacters = new Set(
  simplifiedToTraditionalCharacters
    .split("|")
    .map((entry) => entry.slice(0, entry.indexOf(" ")))
    .filter((character) => [...character].length === 1),
);
const validTraditionalVariants = new Set(["吃", "台", "峰", "秘", "群"]);

function isContextuallyTraditional(value, character, index) {
  if (validTraditionalVariants.has(character)) return true;
  const context = value.slice(Math.max(0, index - 2), index + 3);
  if (character === "里" && /(?:(?:公|英)里|里程)/.test(context)) return true;
  if (character === "干" && /干(?:預|擾|涉|係)/.test(context)) return true;
  if (character === "准" && /(?:獲准|批准|准許)/.test(context)) return true;
  if (character === "游" && /(?:上游|中游|下游|游離)/.test(context)) return true;
  return false;
}

function findTraditionalResidue(value) {
  for (let index = 0; index < value.length;) {
    const character = String.fromCodePoint(value.codePointAt(index));
    if (comprehensiveSimplifiedCharacters.has(character) && !isContextuallyTraditional(value, character, index)) {
      return character;
    }
    index += character.length;
  }
  return null;
}

const traditionalResiduals = [...visibleStrings].flatMap(([value, location]) => {
  const translated = coreModule.translateText("zh-TW", value);
  const residual = findTraditionalResidue(translated);
  if (residual) return [`${location.path}:${location.line}: ${residual} remains in ${translated}`];
  if (translated.includes("恢複")) return [`${location.path}:${location.line}: contextually incorrect 恢複 in ${translated}`];
  return [];
});

for (const [value, location] of projectTranslationSources) {
  const translated = coreModule.translateText("zh-TW", value);
  const residual = findTraditionalResidue(translated);
  if (residual) traditionalResiduals.push(`${location.path}:${location.line}: ${residual} remains in ${translated}`);
  if (translated.includes("恢複")) {
    traditionalResiduals.push(`${location.path}:${location.line}: contextually incorrect 恢複 in ${translated}`);
  }
}

for (const [value, line] of zhKeyLocations) {
  const translated = coreModule.translateText("zh-TW", value);
  const residual = findTraditionalResidue(translated);
  if (residual) traditionalResiduals.push(`${i18nPath}:${line}: ${residual} remains in ${translated}`);
  if (translated.includes("恢複")) traditionalResiduals.push(`${i18nPath}:${line}: contextually incorrect 恢複 in ${translated}`);
}

for (const { value, line } of sideQuestZhValues) {
  let phraseAdjusted = value;
  for (const [from, to] of sideQuestTraditionalPhrases) {
    phraseAdjusted = phraseAdjusted.replaceAll(from, to);
  }
  const translated = coreModule.toTraditionalMandarin(phraseAdjusted);
  const residual = findTraditionalResidue(translated);
  if (residual) traditionalResiduals.push(`${sideQuestI18nPath}:${line}: ${residual} remains in ${translated}`);
  if (translated.includes("恢複")) {
    traditionalResiduals.push(`${sideQuestI18nPath}:${line}: contextually incorrect 恢複 in ${translated}`);
  }
}

for (const [key, value] of Object.entries(archiveCopies["zh-TW"])) {
  if (typeof value !== "string") continue;
  const residual = findTraditionalResidue(value);
  if (residual) traditionalResiduals.push(`zh-TW archive key ${key}: ${residual} remains in ${value}`);
  if (value.includes("恢複")) traditionalResiduals.push(`zh-TW archive key ${key}: contextually incorrect 恢複`);
}

const missingCoreKeys = [...visibleStrings]
  .filter(([value]) => !zhKeys.has(value))
  .map(([value, location]) => `${location.path}:${location.line}: ${value}`);
for (const [key, value] of Object.entries(orbitalModule.orbitalCopies["zh-TW"])) {
  const residual = findTraditionalResidue(value);
  if (residual) traditionalResiduals.push(`zh-TW orbital key ${key}: ${residual} remains in ${value}`);
}
const missingSideQuestKeys = [...sideQuestSourceStrings]
  .filter(([value]) => !sideQuestZhKeys.has(value))
  .map(([value, location]) => `${location.path}:${location.line}: ${value}`);
const missingProjectKeys = [...projectTranslationSources]
  .filter(([value]) => !zhKeys.has(value))
  .map(([value, location]) => `${location.path}:${location.line}: ${value}`);

const errors = [
  ...orbitalErrors,
  ...archiveErrors,
  ...regionalisationErrors,
  ...regionalSourceErrors,
  ...duplicateZhKeys.map((key) => `duplicate zhCN key: ${key}`),
  ...duplicateSideQuestZhKeys.map((key) => `duplicate SideQuest zhCN key: ${key}`),
  ...missingCoreKeys.map((entry) => `missing zhCN translation: ${entry}`),
  ...missingSideQuestKeys.map((entry) => `missing SideQuest zhCN translation: ${entry}`),
  ...missingProjectKeys.map((entry) => `missing project zhCN translation: ${entry}`),
  ...traditionalResiduals.map((entry) => `Traditional Chinese residue: ${entry}`),
];

if (errors.length) {
  console.error("Locale coverage validation failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Locale gate: ${archiveKeys.length} archive keys and ${orbitalKeys.length} orbital keys match across 4 locales; ${visibleStrings.size} core System 7 strings, ${projectTranslationSources.size} project summaries/suite strings and ${sideQuestSourceStrings.size} RUN/HACK source strings have Mandarin coverage; ${sideQuestZhValues.length} RUN/HACK translations are free of Simplified-character residue.`,
);
