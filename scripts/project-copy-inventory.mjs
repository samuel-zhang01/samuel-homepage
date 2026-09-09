import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { basename, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = fileURLToPath(new URL("../", import.meta.url));
const copyFields = new Set(["label", "title", "description", "detail", "explanation", "operation", "summary", "hint", "note", "copy", "caption", "strength", "runs", "message", "purpose", "tryThis", "watchFor", "status", "appName", "placeholder", "alt", "aria-label", "aria-description", "aria-valuetext", "heading", "shortLabel", "empty", "audience", "problem", "contribution", "boundary", "limitation", "reason", "rule", "role", "name", "question", "short", "date", "tooltip"]);
const sourceTags = new Set(["pre", "code", "kbd", "samp", "math", "script", "style"]);
const copyAttributes = new Set(["label", "title", "description", "detail", "hint", "note", "caption", "heading", "empty", "appName", "status", "purpose", "tryThis", "watchFor", "placeholder", "alt", "aria-label", "aria-description", "aria-valuetext"]);
for (const field of ["shortName", "group", "evidence", "merchant", "adapter", "en", "english", "promptEn", "explanationEn", "exampleEn", "target", "change", "approach", "benefit", "input", "result", "blocks", "stage", "subtitle", "encoder", "decoder", "architecture", "representation", "evaluation", "family", "originLabel", "architectureNote", "origin", "definition", "shape"]) copyFields.add(field);
const normalise = (source) => source.replace(/\s+/g, " ").trim();
const entities = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
const decodeJsx = (source) => source.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (entity, key) => key.startsWith("#") ? String.fromCodePoint(parseInt(key.replace(/^#x?/i, ""), /^#x/i.test(key) ? 16 : 10)) : entities[key] ?? entity);

/** Candidate inventory, reviewed by authors: data labels and dynamics are explicit. */
export function extractProjectCopyInventory(source, filename) {
  const file = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const entries = new Map();
  const add = (node, value, kind) => {
    const text = normalise(kind === "jsx" || kind === "attribute" ? decodeJsx(value) : value);
    if (!/[a-zA-Z]{2}/.test(text) || /^(?:https?:\/\/|#[0-9a-f]{3,8}$)/i.test(text) || (text.startsWith("/") && !/\s/.test(text))) return;
    const line = file.getLineAndCharacterOfPosition(node.getStart(file)).line + 1;
    if (entries.has(text)) { entries.get(text).lines.push(line); return; }
    entries.set(text, { id: createHash("sha256").update(text).digest("hex").slice(0, 12), source: text, kind, lines: [line] });
  };
  const strings = (node, kind) => {
    if (ts.isStringLiteralLike(node)) add(node, node.text, kind);
    else if (ts.isTemplateExpression(node)) add(node, node.head.text + node.templateSpans.map((span, index) => `{${index}}${span.literal.text}`).join(""), "template");
    else if (ts.isConditionalExpression(node)) { strings(node.whenTrue, kind); strings(node.whenFalse, kind); }
    else if (ts.isBinaryExpression(node) && [ts.SyntaxKind.QuestionQuestionToken, ts.SyntaxKind.BarBarToken, ts.SyntaxKind.AmpersandAmpersandToken].includes(node.operatorToken.kind)) { strings(node.left, kind); strings(node.right, kind); }
    else if (ts.isParenthesizedExpression(node)) strings(node.expression, kind);
  };
  function visit(node) {
    if (ts.isJsxElement(node) && sourceTags.has(node.openingElement.tagName.getText(file))) return;
    if (ts.isTaggedTemplateExpression(node) && node.tag.getText(file) === "String.raw") return;
    if (ts.isJsxText(node)) add(node, node.text, "jsx");
    if (ts.isJsxExpression(node) && node.expression && !ts.isJsxAttribute(node.parent)) strings(node.expression, "expression");
    if (ts.isJsxAttribute(node) && copyAttributes.has(node.name.getText(file)) && node.initializer) {
      const value = ts.isJsxExpression(node.initializer) ? node.initializer.expression : node.initializer;
      if (value) strings(value, "attribute");
    }
    if (ts.isPropertyAssignment(node) && copyFields.has(node.name.getText(file).replace(/^['"]|['"]$/g, ""))) strings(node.initializer, "data");
    if (ts.isArrayLiteralExpression(node)) {
      for (const child of node.elements) if (ts.isStringLiteralLike(child) && /[A-Z]|\s/.test(child.text)) add(child, child.text, "array");
    }
    if (ts.isCallExpression(node) && /(?:^t$|projectText$|translateText$|set(?:Status|Message)$)/.test(node.expression.getText(file))) {
      const argumentsToReview = node.expression.getText(file) === "t" && node.arguments.length === 3 ? [node.arguments[0]] : node.arguments;
      for (const argument of argumentsToReview) strings(argument, "explicit");
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  return [...entries.values()];
}

async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => entry.isDirectory() ? files(join(directory, entry.name)) : entry.name.endsWith(".tsx") ? [join(directory, entry.name)] : []))).flat();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const selected = process.argv.find((argument) => /\.tsx?$/.test(argument));
  const paths = selected ? [join(root, selected)] : await files(join(root, "src", "components", "projects"));
  const inventory = [];
  for (const path of paths) {
    const source = await readFile(path, "utf8");
    if (/I18n|TranslationBoundary|MathEquation/.test(basename(path))) continue;
    inventory.push({ file: relative(root, path), scoped: source.includes("<ProjectCopy"), entries: extractProjectCopyInventory(source, path) });
  }
  const output = process.argv.indexOf("--output");
  if (output >= 0) await writeFile(process.argv[output + 1], JSON.stringify(inventory, null, 2) + "\n");
  for (const item of inventory.sort((a, b) => b.entries.length - a.entries.length)) console.log(`${item.scoped ? "SCOPED " : "PENDING"} ${item.entries.length.toString().padStart(4)} ${item.file}`);
  console.log(`${inventory.length} files; ${new Set(inventory.flatMap((item) => item.entries.map((entry) => entry.source))).size} unique copy candidates. Review code/proper-name exceptions; this inventory is not a translation-completeness claim.`);
}
