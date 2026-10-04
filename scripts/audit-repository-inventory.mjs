import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, lstatSync, readFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

// Read-only evidence for cleanup decisions. Runtime reachability is not proof
// that authoring sources, regression fixtures or historical receipts are junk.
const root = process.cwd();
const gitFiles = (...args) => execFileSync("git", ["ls-files", ...args, "-z"], {
  encoding: "utf8", maxBuffer: 64 * 1024 * 1024,
}).split("\0").filter((filename) => filename && existsSync(filename));
const tracked = gitFiles("--cached");
const untracked = gitFiles("--others", "--exclude-standard");
const ignored = gitFiles("--others", "--ignored", "--exclude-standard");
const managed = [...new Set([...tracked, ...untracked])].sort();
function totals(files) {
  const groups = {};
  for (const filename of files) {
    const group = filename.includes("/") ? filename.split("/")[0] : "root";
    const metadata = lstatSync(filename);
    const current = groups[group] ??= { files: 0, bytes: 0, symlinks: 0 };
    current.files += 1;
    current.bytes += metadata.isFile() ? metadata.size : 0;
    current.symlinks += Number(metadata.isSymbolicLink());
  }
  return groups;
}

const config = ts.readConfigFile("tsconfig.json", ts.sys.readFile);
if (config.error) throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, "\n"));
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
const sources = managed.filter((filename) => filename.startsWith("src/") && /\.(?:tsx?|css|json|csv|svg)$/.test(filename));
const edges = new Map();
const unresolved = [];
for (const filename of sources) {
  const references = new Set();
  edges.set(filename, references);
  function add(specifier) {
    const resolved = ts.resolveModuleName(specifier, path.resolve(filename), parsed.options, ts.sys).resolvedModule;
    let target = resolved?.resolvedFileName;
    if (!target && (specifier.startsWith(".") || specifier.startsWith("@/"))) {
      const absolute = specifier.startsWith("@/") ? path.resolve("src", specifier.slice(2)) : path.resolve(path.dirname(filename), specifier);
      if (existsSync(absolute)) target = absolute;
    }
    if (target) {
      const relative = path.relative(root, target).split(path.sep).join("/");
      if (relative.startsWith("src/")) references.add(relative);
    } else if (specifier.startsWith(".") || specifier.startsWith("@/")) unresolved.push({ filename, specifier });
  }
  const source = readFileSync(filename, "utf8");
  if (filename.endsWith(".css")) {
    for (const [, specifier] of source.matchAll(/@import\s+["']([^"']+)["']/g)) add(specifier);
  } else if (/\.tsx?$/.test(filename)) {
    const tree = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, filename.endsWith("tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    function visit(node) {
      if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) add(node.moduleSpecifier.text);
      if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword && ts.isStringLiteral(node.arguments[0])) add(node.arguments[0].text);
      if (ts.isNewExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === "URL" && node.arguments?.[0] && ts.isStringLiteral(node.arguments[0]) && node.arguments[0].text.startsWith(".")) add(node.arguments[0].text);
      ts.forEachChild(node, visit);
    }
    visit(tree);
  }
}
const entries = sources.filter((filename) =>
  (filename.startsWith("src/app/") && /(?:^|\/)(?:page|layout|template|loading|error|global-error|not-found|route|manifest|robots|sitemap)\.[jt]sx?$/.test(filename)) ||
  filename === "src/app/icon.svg" || filename === "src/middleware.ts" || filename.endsWith(".d.ts"));
const reached = new Set();
function walk(filename) {
  if (reached.has(filename)) return;
  reached.add(filename);
  for (const target of edges.get(filename) ?? []) walk(target);
}
entries.forEach(walk);
const nonRuntime = sources.filter((filename) => !reached.has(filename));
const translationReceipts = nonRuntime.filter((filename) => filename.endsWith(".audit.json"));
const checkOnlyTranslationReceipts = managed.filter((filename) => filename.startsWith("scripts/fixtures/project-copy-audits/") && filename.endsWith(".audit.json"));
const reviewedSourceFixtures = nonRuntime.filter((filename) => filename.startsWith("src/data/project-fixtures/"));
const unresolvedOwnership = nonRuntime.filter((filename) => !translationReceipts.includes(filename) && !reviewedSourceFixtures.includes(filename));

const publicFiles = managed.filter((filename) => filename.startsWith("public/"));
const texts = new Map(managed.filter((filename) => /\.(?:tsx?|mjs|css|json|md)$/.test(filename) && !filename.startsWith("docs/reviews/")).map((filename) => [filename, readFileSync(filename, "utf8")]));
const iconSource = ts.createSourceFile("System7Icon.tsx", readFileSync("src/components/System7Icon.tsx", "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const iconKinds = new Set();
for (const node of iconSource.statements) {
  if (ts.isTypeAliasDeclaration(node) && node.name.text === "System7IconKind" && ts.isUnionTypeNode(node.type)) {
    for (const member of node.type.types) if (ts.isLiteralTypeNode(member) && ts.isStringLiteral(member.literal)) iconKinds.add(member.literal.text === "secret" ? "star" : member.literal.text);
  }
}
const computedIcons = [];
const assetCandidates = [];
for (const filename of publicFiles) {
  const icon = filename.match(/^public\/system7-icons\/([^/]+)\.(?:svg|png)$/);
  if (icon && iconKinds.has(icon[1])) { computedIcons.push(filename); continue; }
  const publicPath = `/${filename.slice(7)}`;
  const basename = path.basename(filename);
  if (![...texts.values()].some((text) => text.includes(publicPath) || text.includes(basename))) assetCandidates.push(filename);
}
const digests = new Map();
for (const filename of managed) {
  if (!lstatSync(filename).isFile()) continue;
  const digest = createHash("sha256").update(readFileSync(filename)).digest("hex");
  const group = digests.get(digest) ?? [];
  group.push(filename);
  digests.set(digest, group);
}
const scriptFiles = managed.filter((filename) => filename.startsWith("scripts/"));
const scriptCandidates = scriptFiles.filter((filename) => {
  const basename = path.basename(filename);
  return ![...texts].some(([owner, text]) => owner !== filename && (text.includes(filename) || text.includes(basename)));
});
const report = {
  method: "Git-managed inventory; TypeScript module resolution plus static/dynamic imports, worker URLs and CSS imports; Next convention entries; computed icon contract; literal asset/script owner candidates need human review.",
  tracked: { files: tracked.length, groups: totals(tracked) },
  untracked: { files: untracked.length, groups: totals(untracked) },
  ignored: { files: ignored.length, groups: totals(ignored) },
  reachability: { entries: entries.length, managedSources: sources.length, reachableManagedSources: sources.filter((filename) => reached.has(filename)).length, unresolvedImports: unresolved, translationReceipts, checkOnlyTranslationReceipts, reviewedSourceFixtures, unresolvedOwnership },
  assets: { managedPublicFiles: publicFiles.length, computedIconFiles: computedIcons.length, withoutLiteralOrComputedOwner: assetCandidates },
  scripts: { files: scriptFiles.length, withoutLiteralOwner: scriptCandidates },
  byteIdenticalGroups: [...digests.values()].filter((group) => group.length > 1),
};
console.log(JSON.stringify(report, null, 2));
