import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
// Scope: public catalogue metadata, case briefs, build logs, suite descriptions,
// static demo/app copy across inactive tabs and control states, and their existing
// translations. This is not a crawler: linked PDFs/external websites, browser
// notes/drawings, arbitrary user input and numerical simulation outputs are not
// indexed. Template literals contribute their fixed wording, not invented live
// values. Rendering support code and entire unrelated translation dictionaries
// are deliberately excluded. Provenance remains available to validation callers.
export const searchLocales = ["en-GB", "en-US", "zh-CN", "zh-TW"];
const modules = new Map();
const dictionaries = new Set([
  "src/lib/i18n.ts", "src/data/projects.ts", "src/components/orbitalI18n.ts",
  "src/components/projects/projectStories.ts", "src/components/projects/projectSuites.ts",
  "src/components/projects/projectArchiveI18n.ts",
  "src/components/ClassicSelect.tsx", "src/lib/classicSelectBehavior.ts",
  "src/lib/orbitalWebgl.ts", "src/lib/orbitalAnimation.ts",
]);
const nonDisplayDependencies = new Set(["normaliseDeskBackupEntry", "normaliseProductivityExtraBackup"]);
const appRoots = {
  orbitals: ["src/components/OrbitalLab.tsx", "OrbitalLab"],
  notepad: ["src/components/ProductivityApps.tsx", "NotePad"],
  focus: ["src/components/ProductivityApps.tsx", "FocusClock"],
  calculator: ["src/components/ProductivityApps.tsx", "DeskCalculator"],
  sketch: ["src/components/ProductivityExtras.tsx", "SketchPad"],
  tasks: ["src/components/ProductivityExtras.tsx", "QuickList"],
  calendar: ["src/components/ProductivityExtras.tsx", "PocketCalendar"],
  converter: ["src/components/ProductivityExtras.tsx", "UnitConverter"],
  palette: ["src/components/ProductivityExtras.tsx", "ColourStudio"],
  coverd: ["src/components/SystemSevenDesktop.tsx", "CoverdApp"],
  documents: ["src/components/SystemSevenDesktop.tsx", "DocumentsApp"],
  lab: ["src/components/SystemSevenDesktop.tsx", "LabApp"],
  experience: ["src/components/SystemSevenDesktop.tsx", "ExperienceApp"],
};

async function dataModule(path) {
  const source = await readFile(resolve(root, path), "utf8");
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  // These reviewed, repository-owned data modules have no runtime imports or I/O.
  if (/^import /m.test(js)) throw new Error(`Search data module gained a runtime dependency: ${path}`);
  return import(`data:text/javascript;base64,${Buffer.from(js).toString("base64")}`);
}

async function sourceModule(path) {
  if (modules.has(path)) return modules.get(path);
  const text = await readFile(resolve(root, path), "utf8");
  const source = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, path.endsWith("tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const declarations = new Map();
  const imports = new Map();
  for (const node of source.statements) {
    if (ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node)) {
      if (node.name) declarations.set(node.name.text, node);
      if (node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword)) declarations.set("default", node);
    } else if (ts.isVariableStatement(node)) {
      for (const declaration of node.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) declarations.set(declaration.name.text, declaration);
      }
    } else if (ts.isImportDeclaration(node) && node.importClause && !node.importClause.isTypeOnly) {
      const specifier = node.moduleSpecifier.text;
      if (!specifier.startsWith(".") && !specifier.startsWith("@/")) continue;
      if (/\.(css|json|csv)$/.test(specifier)) continue;
      const base = specifier.startsWith("@/") ? resolve(root, "src", specifier.slice(2)) : resolve(root, dirname(path), specifier);
      let target;
      for (const extension of [".ts", ".tsx", "/index.ts", "/index.tsx"]) {
        try { await readFile(base + extension); target = relative(root, base + extension); break; } catch (error) { if (error.code !== "ENOENT") throw error; }
      }
      if (!target) throw new Error(`Unresolved search source import ${path}: ${specifier}`);
      if (!target.startsWith("src/")) throw new Error(`Search import outside public source tree: ${target}`);
      if (node.importClause.name) imports.set(node.importClause.name.text, [target, "default"]);
      const bindings = node.importClause.namedBindings;
      if (bindings && ts.isNamedImports(bindings)) for (const binding of bindings.elements) {
        if (!binding.isTypeOnly) imports.set(binding.name.text, [target, (binding.propertyName ?? binding.name).text]);
      }
    }
  }
  const result = { source, declarations, imports };
  modules.set(path, result);
  return result;
}

const visibleAttributes = new Set(["title", "alt", "aria-label", "placeholder", "appName", "status", "purpose", "tryThis", "watchFor", "label"]);
const hiddenProperties = new Set(["id", "slug", "href", "src", "className", "key", "type", "method", "target", "rel", "role", "path", "filename", "storageKey", "format", "mimeType", "demo", "systemApp", "visual", "sourceUrl", "websiteUrl", "sourceLicence", "access"]);
const displayProperties = new Set(["label", "name", "title", "description", "caption", "summary", "detail", "unit", "heading", "help", "text", "message", "placeholder", "ariaLabel", "formula"]);
function explicitDisplayContext(node) {
  let current = node;
  while (current.parent) {
    const parent = current.parent;
    if (ts.isJsxAttribute(parent)) return visibleAttributes.has(parent.name.getText());
    if (ts.isJsxExpression(parent)) return ts.isJsxAttribute(parent.parent) ? visibleAttributes.has(parent.parent.name.getText()) : true;
    if (ts.isPropertyAssignment(parent)) return parent.initializer === current && displayProperties.has(parent.name.getText().replaceAll('"', ""));
    if (ts.isCallExpression(parent)) {
      const name = parent.expression.getText();
      return name === "t" && parent.arguments[0] === current
        || name === "translateText" && parent.arguments[1] === current
        || /\.(?:fillText|strokeText)$/.test(name) && parent.arguments[0] === current;
    }
    if (ts.isTemplateSpan(parent) || ts.isTemplateExpression(parent) || ts.isParenthesizedExpression(parent)
      || ts.isAsExpression(parent) || ts.isSatisfiesExpression(parent)
      || ts.isConditionalExpression(parent) && parent.condition !== current
      || ts.isBinaryExpression(parent) && parent.operatorToken.kind === ts.SyntaxKind.PlusToken) {
      current = parent;
      continue;
    }
    return false;
  }
  return false;
}
function visibleLiteral(node) {
  const parent = node.parent;
  // Rendering/translation intent wins over identifier-shaped spelling: mL,
  // auto-rotate and lowercase option labels are valid public copy.
  if (explicitDisplayContext(node)) return Boolean(node.text.trim());
  if (ts.isJsxAttribute(parent)) return visibleAttributes.has(parent.name.getText());
  if (ts.isPropertyAssignment(parent)) {
    if (parent.name === node || hiddenProperties.has(parent.name.getText().replaceAll('"', ""))) return false;
  }
  if (ts.isElementAccessExpression(parent) || ts.isImportDeclaration(parent) || ts.isLiteralTypeNode(parent)) return false;
  if (ts.isBinaryExpression(parent) && [ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken, ts.SyntaxKind.EqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsToken].includes(parent.operatorToken.kind)) return false;
  const value = node.text.trim();
  if (!value || /^(?:https?:|data:|\/|#[\da-f]{3,8}$)/i.test(value)) return false;
  if (/^\(?prefers-|^\d+(?:px|rem|em)\s|^[a-z]{2}-[A-Z]{2}$/.test(value)) return false;
  if (/^(?:[a-z]+[-_.:])+[a-z\d_.:-]+$/.test(value)) return false;
  if (/^(?:[a-z]+[A-Z]\w*|[A-Z][a-z]+[A-Z]\w*)$/.test(value)) return false;
  if (ts.isJsxExpression(parent) || ts.isConditionalExpression(parent)) return true;
  if (ts.isCallExpression(parent)) {
    const name = parent.expression.getText();
    if (/^(?:t|translateText)$/.test(name) || /\.(?:fillText|strokeText)$/.test(name)) return true;
    if (/(?:Storage|dispatchEvent|addEventListener|removeEventListener|querySelector|createElement|setAttribute|fetch|Error|console\.)/.test(name)) return false;
  }
  return /[\p{L}\p{N}]/u.test(value) && (/\s/.test(value) || /^[A-Z][\p{L}\p{N} +/−–²³]*$/u.test(value) || /[\u3400-\u9fff]/.test(value));
}

function normalise(text) { return text.replace(/\s+/g, " ").trim(); }
const jsxEntityCache = new Map();
function jsxText(text) {
  // Use the same compiler as the app for JSX entities (including numeric and
  // less common named entities), without evaluating the generated JavaScript.
  if (/&(?:#\w+|[a-z]+);/i.test(text)) {
    if (jsxEntityCache.has(text)) return jsxEntityCache.get(text);
    const compiled = ts.transpileModule(`const copy = <span>${text}</span>;`, { compilerOptions: { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2022 } }).outputText;
    const parsed = ts.createSourceFile("jsx-copy.js", compiled, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
    const initialiser = parsed.statements[0]?.declarationList?.declarations[0]?.initializer;
    const literal = initialiser?.arguments?.[2];
    if (!literal || !ts.isStringLiteral(literal)) throw new Error("Could not decode static JSX search text.");
    jsxEntityCache.set(text, literal.text);
    return literal.text;
  }
  const lines = text.replace(/\t/g, " ").split(/\r\n|\n|\r/);
  const last = lines.findLastIndex((line) => /[^ ]/.test(line));
  return lines.map((line, index) => {
    const value = (index === 0 ? line : line.replace(/^ +/, "")).replace(index === lines.length - 1 ? /$^/ : / +$/, "");
    return value ? value + (index < last ? " " : "") : "";
  }).join("");
}
function staticJsxText(node) {
  if (ts.isJsxText(node)) return jsxText(node.text);
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isJsxExpression(node)) return node.expression ? staticJsxText(node.expression) : "";
  if (ts.isJsxElement(node) || ts.isJsxFragment(node)) {
    const inline = new Set(["a", "b", "code", "em", "i", "mark", "s", "small", "span", "strong", "sub", "sup", "u"]);
    // Do not concatenate separate headings, table cells or paragraphs into a
    // made-up phrase; only coalesce naturally continuous inline text.
    if (node.children.some((child) => ts.isJsxElement(child) && !inline.has(child.openingElement.tagName.getText()))) return null;
    const parts = node.children.map(staticJsxText);
    return parts.every((part) => part !== null) ? parts.join("") : null;
  }
  return null;
}
export function extractPublicCopy(input) {
  const source = typeof input === "string" ? ts.createSourceFile("search-fixture.tsx", input, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX) : input;
  const text = new Set();
  const dependencies = new Set();
  function visit(node) {
    if (ts.isTypeNode(node) || ts.isThrowStatement(node)) return;
    if (ts.isJsxAttribute(node) && (hiddenProperties.has(node.name.getText()) || node.name.getText() === "style" || node.name.getText().startsWith("data-"))) return;
    if (ts.isJsxText(node)) text.add(normalise(jsxText(node.text)));
    if (ts.isJsxElement(node) || ts.isJsxFragment(node)) {
      const joined = staticJsxText(node);
      if (joined) text.add(normalise(joined));
    }
    if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) && visibleLiteral(node)) text.add(normalise(node.text));
    if (ts.isIdentifier(node) && !(ts.isPropertyAccessExpression(node.parent) && node.parent.name === node) && !(ts.isPropertyAssignment(node.parent) && node.parent.name === node)) dependencies.add(node.text);
    ts.forEachChild(node, visit);
  }
  visit(source);
  return { text, dependencies };
}
function values(value) {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(values);
  if (value && typeof value === "object") return Object.entries(value).filter(([key]) => !hiddenProperties.has(key)).flatMap(([, child]) => values(child));
  return [];
}

// Follow only the named component and declarations it references. This matters
// for files containing several independent demos: their unrelated text must not
// turn every search into a match. No browser storage, network or private files
// are read; string literals are extracted, never application code executed.
async function componentText(path, name, output, visited, provenance) {
  const key = `${path}#${name}`;
  if (visited.has(key) || dictionaries.has(path) || nonDisplayDependencies.has(name)) return;
  visited.add(key);
  const sourceData = await sourceModule(path);
  const declaration = sourceData.declarations.get(name);
  if (!declaration) {
    if (sourceData.imports.has(name)) return componentText(...sourceData.imports.get(name), output, visited, provenance);
    throw new Error(`Search component/dependency no longer exists: ${key}`);
  }
  provenance.add(path);
  const { text, dependencies } = extractPublicCopy(declaration);
  for (const value of text) output.add(value);
  for (const dependency of dependencies) {
    if (sourceData.declarations.has(dependency)) await componentText(path, dependency, output, visited, provenance);
    else if (sourceData.imports.has(dependency)) await componentText(...sourceData.imports.get(dependency), output, visited, provenance);
  }
}

async function demoRoots() {
  const path = "src/components/projects/ProjectDemoRouter.tsx";
  const { source, declarations } = await sourceModule(path);
  const dynamic = new Map();
  for (const [name, declaration] of declarations) {
    let file, exported;
    function visit(node) {
      if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword && ts.isStringLiteral(node.arguments[0])) file = node.arguments[0].text;
      if (ts.isPropertyAccessExpression(node) && node.expression.getText() === "module") exported = node.name.text;
      ts.forEachChild(node, visit);
    }
    visit(declaration);
    if (file && exported) dynamic.set(name, [relative(root, resolve(root, dirname(path), `${file}.tsx`)), exported]);
  }
  const result = new Map();
  function visit(node) {
    if (ts.isCaseClause(node) && ts.isStringLiteral(node.expression)) {
      let component;
      function find(child) { if (ts.isJsxSelfClosingElement(child)) component = child.tagName.getText(); ts.forEachChild(child, find); }
      node.statements.forEach(find);
      if (!dynamic.has(component)) throw new Error(`Missing search mapping for demo ${node.expression.text}`);
      result.set(node.expression.text, dynamic.get(component));
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return result;
}

export async function buildProjectSearch() {
  const [{ projects }, { translateText }, { projectStories }, suites, archive, orbital] = await Promise.all([
    dataModule("src/data/projects.ts"), dataModule("src/lib/i18n.ts"), dataModule("src/components/projects/projectStories.ts"),
    dataModule("src/components/projects/projectSuites.ts"), dataModule("src/components/projects/projectArchiveI18n.ts"), dataModule("src/components/orbitalI18n.ts"),
  ]);
  const demos = await demoRoots();
  const records = [];
  for (const project of projects) {
    const text = new Set(values(project).map(normalise));
    if (project.demo) {
      if (!demos.has(project.demo) || !projectStories[project.demo]) throw new Error(`Missing demo/story search coverage: ${project.slug}`);
      values(projectStories[project.demo]).forEach((value) => text.add(normalise(value)));
    }
    const suite = suites.getProjectSuite(project);
    if (suite) { text.add(suite.title); text.add(suite.description); }
    const provenance = new Set(["src/data/projects.ts"]);
    await componentText("src/components/projects/ProjectCaseBrief.tsx", "ProjectCaseBrief", text, new Set(), provenance);
    const entry = project.demo ? demos.get(project.demo) : project.systemApp ? appRoots[project.systemApp] : null;
    if (project.systemApp && !entry) throw new Error(`Missing system app search mapping: ${project.systemApp}`);
    if (entry) await componentText(...entry, text, new Set(), provenance);
    records.push({ project, text, provenance: [...provenance].sort() });
  }
  const indexes = Object.fromEntries(searchLocales.map((locale) => [locale, {
    version: 1,
    documents: records.map(({ project, text }) => {
      const strings = new Set();
      for (const value of text) { if (value) { strings.add(value); strings.add(normalise(translateText(locale, value))); } }
      // Include only archive detail chrome, not unrelated guided-start/menu copy.
      for (const language of new Set(["en-GB", locale])) {
        const copy = archive.getProjectArchiveCopy(language);
        [...values(copy.detail), ...values(copy.phases)].forEach((value) => strings.add(normalise(value)));
        if (project.systemApp === "orbitals") values(orbital.orbitalCopies[language]).forEach((value) => strings.add(normalise(value)));
      }
      return { slug: project.slug, text: [...strings].filter(Boolean).join("\n") };
    }),
  }]));
  return { indexes, records };
}

export async function writeProjectSearch() {
  const result = await buildProjectSearch();
  await mkdir(resolve(root, "public/search"), { recursive: true });
  for (const [locale, index] of Object.entries(result.indexes)) {
    const json = `${JSON.stringify(index)}\n`;
    if (Buffer.byteLength(json) > 2_000_000) throw new Error(`Search index size budget exceeded: ${locale}`);
    await writeFile(resolve(root, `public/search/project-text-${locale.toLowerCase()}.json`), json);
    console.log(`Project search ${locale}: ${index.documents.length} files, ${(Buffer.byteLength(json) / 1024).toFixed(1)} KiB (loaded only on detailed search).`);
  }
  return result;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await writeProjectSearch();
