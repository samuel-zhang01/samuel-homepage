// Verify the actual icon family, component output and catalogue identities.
// Run from any directory: node scripts/check-system7-icons.mjs [repository root]
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, lstatSync, readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import ts from "typescript";

const root = resolve(process.argv[2] ?? resolve(dirname(fileURLToPath(import.meta.url)), ".."));
const require = createRequire(resolve(root, "package.json"));
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const modules = new Map();
function load(file) {
  const filename = resolve(root, file);
  if (modules.has(filename)) return modules.get(filename);
  const compiled = ts.transpileModule(readFileSync(filename, "utf8"), {
    fileName: filename,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  const loaded = { exports: {} };
  modules.set(filename, loaded.exports);
  new Function("module", "exports", "require", compiled)(loaded, loaded.exports, name => {
    if (name === "next/image") return { __esModule: true, default: props => {
      const imageAttributes = { ...props };
      delete imageAttributes.unoptimized;
      return React.createElement("img", imageAttributes);
    } };
    if (name.endsWith(".module.css")) return { __esModule: true, default: new Proxy({}, { get: (_, key) => String(key) }) };
    if (!name.startsWith(".") && !name.startsWith("@/")) return require(name);
    const target = name.startsWith("@/") ? resolve(root, "src", name.slice(2)) : resolve(dirname(filename), name);
    for (const extension of [".ts", ".tsx", ".mjs"]) if (existsSync(`${target}${extension}`)) return load(`${target}${extension}`);
    throw new Error(`Icon check cannot resolve ${name} from ${filename}`);
  });
  modules.set(filename, loaded.exports);
  return loaded.exports;
}

function source(file) {
  return ts.createSourceFile(file, readFileSync(resolve(root, file), "utf8"), ts.ScriptTarget.Latest, true, file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
}
function visit(node, callback) { callback(node); ts.forEachChild(node, child => visit(child, callback)); }
function unwrapped(node) {
  while (node && (ts.isAsExpression(node) || ts.isSatisfiesExpression(node) || ts.isParenthesizedExpression(node))) node = node.expression;
  return node;
}
function literalUnion(file, name) {
  const tree = source(file);
  let declaration;
  visit(tree, node => { if (ts.isTypeAliasDeclaration(node) && node.name.text === name) declaration = node; });
  assert.ok(declaration && ts.isUnionTypeNode(declaration.type), `${file}: ${name} is an explicit identity inventory`);
  return declaration.type.types.map(type => {
    assert.ok(ts.isLiteralTypeNode(type) && ts.isStringLiteral(type.literal), `${name} has a non-string identity`);
    return type.literal.text;
  });
}
function sourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = resolve(directory, entry.name);
    assert.ok(!entry.isSymbolicLink(), `Unexpected source symlink: ${file}`);
    return entry.isDirectory() ? sourceFiles(file) : /\.tsx?$/.test(entry.name) ? [file] : [];
  });
}
function imageProps(node) {
  if (Array.isArray(node)) return node.flatMap(imageProps);
  if (!React.isValidElement(node)) return [];
  if (node.type === "img") return [node.props];
  if (typeof node.type === "function") return imageProps(node.type(node.props));
  return imageProps(node.props.children);
}
function exactKeys(map, expected, label) {
  assert.deepEqual(Object.keys(map).sort(), [...new Set(expected)].sort(), `${label}: missing or stale identity`);
  for (const [id, kind] of Object.entries(map)) assert.ok(Object.hasOwn(SYSTEM7_ICONS, kind), `${label}: ${id} refers to missing ${kind}`);
}
function finderApplications(file) {
  const tree = source(file);
  const names = ["INITIAL_WINDOWS", "DESKTOP_ICONS", "FINDER_APPLICATIONS"];
  const declarations = new Map();
  visit(tree, node => {
    if (ts.isVariableDeclaration(node) && names.includes(node.name.getText(tree))) declarations.set(node.name.getText(tree), node.getText(tree));
  });
  for (const name of names) assert.ok(declarations.has(name), `${file}: missing ${name} inventory`);
  // Evaluate the authored catalogue construction, without loading the desktop's
  // unrelated applications or duplicating its app filtering/description rules.
  const compiled = ts.transpileModule(names.map(name => `const ${declarations.get(name)};`).join("\n"), {
    compilerOptions: { target: ts.ScriptTarget.ES2022 },
  }).outputText;
  return new Function(`${compiled}\nreturn FINDER_APPLICATIONS;`)();
}

const { SYSTEM7_ICONS } = load("src/lib/system7Icons.ts");
const { SYSTEM7_ICON_BOUNDS } = load("src/lib/system7IconBounds.ts");
const { System7Icon } = load("src/components/System7Icon.tsx");
const { ProjectArtwork } = load("src/components/projects/ProjectArtwork.tsx");
const { projects } = load("src/data/projects.ts");
const { applicationIconKinds, projectIconKinds, serviceIconKinds, arcadeIconKinds, contactIconKinds, getProjectIcon, getApplicationIcon } = load("src/lib/iconIdentity.ts");
const provenance = JSON.parse(readFileSync(resolve(root, "docs/SYSTEM7_ICON_PROMPTS.json"), "utf8"));
const provenanceByKind = new Map(provenance.icons.map(icon => [icon.kind, icon]));
assert.ok(SYSTEM7_ICONS && Object.keys(SYSTEM7_ICONS).length > 0, "The generated icon registry is empty");
assert.equal(provenanceByKind.size, provenance.icons.length, "Prompt provenance has no duplicate subjects");
assert.deepEqual([...provenanceByKind.keys()].sort(), Object.keys(SYSTEM7_ICONS).sort(), "Prompt provenance covers every canonical subject exactly once");
const assets = new Set();
const hashes = new Set();
let totalBytes = 0;
for (const [kind, path] of Object.entries(SYSTEM7_ICONS)) {
  assert.match(kind, /^[a-z][a-z0-9]*$/, `Invalid icon kind ${kind}`);
  const record = provenanceByKind.get(kind);
  assert.equal(record.sourcePixelsPreserved, true, `${kind}: native preservation is explicitly recorded`);
  const url = new URL(path, "http://localhost");
  const pathname = url.pathname;
  assert.equal(pathname, kind === "coverd" ? "/coverd-logo-black-on-transparent.png" : `/system7-icons/${kind}.png`, `${kind}: canonical source path`);
  assert.equal(path, kind === "coverd" ? pathname : `${pathname}?v=${record.sourceSha256.slice(0, 12)}`, `${kind}: cache revision matches the authentic native source`);
  assert.ok(!assets.has(pathname), `${kind}: another kind already owns this asset`);
  assets.add(pathname);
  const file = resolve(root, "public", `.${pathname}`);
  assert.ok(lstatSync(file).isFile(), `${kind}: icon must be a regular public file`);
  const bytes = readFileSync(file);
  assert.equal(bytes.subarray(0, 8).toString("hex"), "89504e470d0a1a0a", `${kind}: invalid PNG signature`);
  const hash = createHash("sha256").update(bytes).digest("hex");
  assert.equal(hash, record.sourceSha256, `${kind}: source PNG bytes must remain intact`);
  assert.equal(hash, record.deliveredSha256, `${kind}: reviewed delivery hash`);
  assert.equal(bytes.length, record.bytes, `${kind}: recorded native byte count`);
  assert.ok(!hashes.has(hash), `${kind}: duplicates another named icon's complete image`);
  hashes.add(hash);
  totalBytes += bytes.length;
  const metadata = await sharp(bytes).metadata();
  assert.equal(metadata.format, "png", `${kind}: decoded format`);
  const canvas = record.nativeWidth;
  assert.ok(Number.isSafeInteger(canvas) && canvas > 128, `${kind}: authentic native resolution, not an enlarged128px delivery`);
  assert.equal(record.nativeHeight, canvas, `${kind}: recorded square native source`);
  assert.equal(metadata.width, canvas, `${kind}: width`);
  assert.equal(metadata.height, canvas, `${kind}: height`);
  assert.equal(metadata.hasAlpha, true, `${kind}: real alpha channel is required`);
  assert.equal(metadata.pages ?? 1, 1, `${kind}: animated icon is unexpected`);
  const { data, info } = await sharp(bytes).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  assert.equal(info.channels, 4, `${kind}: RGBA decode`);
  let transparent = 0, visible = 0;
  const bounds = [canvas, canvas, -1, -1];
  for (let y = 0; y < canvas; y++) for (let x = 0; x < canvas; x++) {
    const alpha = data[(y * canvas + x) * 4 + 3];
    if (alpha === 0) transparent++;
    // Measure optical framing only. No source pixels or alpha values are
    // discarded: the exact native PNG hash above rejects image rewriting.
    if (alpha >= 16) {
      visible++;
      bounds[0] = Math.min(bounds[0], x); bounds[1] = Math.min(bounds[1], y);
      bounds[2] = Math.max(bounds[2], x); bounds[3] = Math.max(bounds[3], y);
    }
  }
  assert.ok(transparent >= canvas * canvas * 0.2, `${kind}: insufficient truly transparent exterior`);
  assert.ok(visible >= canvas * canvas * 0.05, `${kind}: blank or almost invisible image`);
  assert.ok(bounds[0] >= 4 && bounds[1] >= 4 && bounds[2] <= canvas - 5 && bounds[3] <= canvas - 5, `${kind}: visible artwork touches its canvas edge (${bounds.join(", ")})`);
  assert.deepEqual(SYSTEM7_ICON_BOUNDS[kind], [...bounds, canvas], `${kind}: optical framing bounds must match the actual alpha pixels`);
  for (const miniature of [false, true]) {
    const images = imageProps(System7Icon({ kind, miniature }));
    assert.equal(images.length, 1, `${kind}: one image in ${miniature ? "miniature" : "normal"} mode`);
    const image = images[0];
    assert.equal(image.src, path, `${kind}: normal and miniature must use the same canonical asset`);
    assert.equal(image.alt, "", `${kind}: named neighboring text owns the accessible label`);
    assert.equal(String(image["aria-hidden"]), "true", `${kind}: decorative image stays hidden from assistive technology`);
    assert.ok(Number.isFinite(image.width) && image.width > 0 && image.width === image.height, `${kind}: square intrinsic dimensions`);
    assert.equal(image.width, canvas, `${kind}: rendered intrinsic size matches the authentic PNG`);
    assert.equal(image.style.width, image.style.height, `${kind}: optical framing must preserve aspect ratio`);
    const scale = parseFloat(image.style.width) / 100;
    assert.ok(Math.abs(scale * Math.max(bounds[2] - bounds[0] + 1, bounds[3] - bounds[1] + 1) / canvas - .9) < 1e-9, `${kind}: visible maximum span fills 90 percent of its slot`);
  }
}
assert.equal(totalBytes, provenance.delivery.totalBytes, "Manifest records the actual native family bytes");

const familyFiles = readdirSync(resolve(root, "public/system7-icons"), { withFileTypes: true });
assert.ok(familyFiles.every(entry => entry.isFile()), "Icon family may not contain directories or symlinks");
assert.deepEqual(familyFiles.map(entry => `/system7-icons/${entry.name}`).sort(), [...assets].filter(path => path.startsWith("/system7-icons/")).sort(), "Icon directory has unowned files or obsolete variants");

const desktopFile = "src/components/SystemSevenDesktop.tsx";
exactKeys(applicationIconKinds, literalUnion(desktopFile, "AppId"), "Application icons");
exactKeys(projectIconKinds, projects.map(project => project.slug), "Project icons");
exactKeys(arcadeIconKinds, literalUnion(desktopFile, "ArcadeGameId"), "Arcade icons");
const serviceCodes = [];
const contactServices = [];
visit(source(desktopFile), node => {
  if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === "contactIconKinds") contactServices.push(node.name.text);
  if (!ts.isVariableDeclaration(node) || node.name.getText() !== "services") return;
  const array = unwrapped(node.initializer);
  if (!array || !ts.isArrayLiteralExpression(array)) return;
  for (const item of array.elements) {
    if (!ts.isObjectLiteralExpression(item)) continue;
    const code = item.properties.find(property => ts.isPropertyAssignment(property) && property.name.getText() === "code");
    if (code && ts.isStringLiteral(code.initializer)) serviceCodes.push(code.initializer.text);
  }
});
assert.ok(serviceCodes.length > 0, "Home Lab service inventory is empty");
exactKeys(serviceIconKinds, serviceCodes, "Home Lab service icons");
assert.ok(contactServices.length > 0, "Contact service inventory is empty");
exactKeys(contactIconKinds, contactServices, "Contact service icons");

const { default: DesktopFinder } = load("src/components/DesktopFinder.tsx");
const { desktopCopy } = load("src/components/desktopCopy.ts");
const { localeOptions, translateText } = load("src/lib/i18n.ts");
const applications = finderApplications(desktopFile);
assert.equal(applications.length, 23, "Find renders the complete application catalogue");
const textMarkup = (tag, value) => renderToStaticMarkup(React.createElement(tag, null, value));
let finderRenders = 0;
for (const { locale } of localeOptions) {
  const markup = renderToStaticMarkup(React.createElement(DesktopFinder, {
    applications, locale, onClose() {}, onOpenApplication() {}, onOpenProject() {},
  }));
  const rows = markup.match(/<button\b[^>]*id="finder-app-[^"]*"[^>]*>[\s\S]*?<\/button>/g) ?? [];
  assert.equal(rows.length, applications.length, `${locale}: all application results are rendered`);
  for (const app of applications) {
    const row = rows.find(value => value.includes(`id="finder-app-${app.id}"`));
    assert.ok(row, `${locale}: missing ${app.id} result`);
    assert.match(row, /<strong>.+<\/strong>/, `${locale} ${app.id}: visible application title`);
    assert.match(row, /<small>.+<\/small>/, `${locale} ${app.id}: visible full application description`);
    assert.ok(row.includes(`data-system7-icon="${applicationIconKinds[app.id]}"`), `${locale} ${app.id}: canonical result icon`);
    for (const [tag, field] of [["strong", "title"], ["small", "description"]]) {
      const sourceText = app[field];
      if (locale === "en-GB" || locale === "en-US") {
        assert.ok(row.includes(textMarkup(tag, translateText(locale, sourceText))), `${locale} ${app.id}: English ${field} is preserved`);
      } else if (Object.hasOwn(desktopCopy, sourceText)) {
        const reviewedText = desktopCopy[sourceText][locale === "zh-CN" ? 0 : 1];
        assert.ok(row.includes(textMarkup(tag, reviewedText)), `${locale} ${app.id}: ${field} uses its reviewed desktop copy`);
      }
    }
    finderRenders++;
  }
  if (locale === "zh-CN" || locale === "zh-TW") {
    const settings = rows.find(value => value.includes('id="finder-app-settings"'));
    assert.ok(!settings.includes("<strong>Settings</strong>"), `${locale}: Settings title must be localized`);
    assert.ok(!settings.includes("<small>Desktop appearance, language and comfort settings.</small>"), `${locale}: Settings description must be localized`);
  }
}

for (const [id, kind] of Object.entries(applicationIconKinds)) assert.equal(getApplicationIcon(id), kind, `${id}: application accessor`);
let nativeProjects = 0;
const secondaryCareerLinks = [];
for (const project of projects) {
  const kind = getProjectIcon(project.slug);
  assert.equal(kind, projectIconKinds[project.slug], `${project.slug}: project accessor`);
  if (project.systemApp === "experience" && project.demo) {
    // This chemistry project links to a career section as additional context;
    // that destination is a different object, not another chemistry app icon.
    secondaryCareerLinks.push(project.slug);
  } else if (project.systemApp) {
    nativeProjects++;
    assert.equal(kind, getApplicationIcon(project.systemApp), `${project.slug}: catalogue and running application must have one identity`);
  }
  for (const compact of [false, true]) {
    const images = imageProps(ProjectArtwork({ project, compact }));
    assert.equal(images.length, 1, `${project.slug}: one ${compact ? "compact" : "full"} project image`);
    assert.equal(images[0].src, SYSTEM7_ICONS[kind], `${project.slug}: artwork uses canonical generated icon`);
  }
}
assert.deepEqual(secondaryCareerLinks, ["coding-series"], "Review any new secondary application link before exempting its identity");
for (const name of ["constructor", "__proto__", "toString", "missing-icon-project"]) {
  assert.throws(() => getProjectIcon(name), /not registered/, `${name}: unknown project lookup must not leak a prototype value or default icon`);
  assert.throws(() => getApplicationIcon(name), /not registered/, `${name}: unknown application lookup must not leak a prototype value or default icon`);
}

let literalUses = 0;
for (const file of sourceFiles(resolve(root, "src"))) {
  const tree = source(file);
  visit(tree, node => {
    if (!ts.isJsxSelfClosingElement(node) && !ts.isJsxOpeningElement(node)) return;
    if (node.tagName.getText(tree) !== "System7Icon") return;
    const kind = node.attributes.properties.find(property => ts.isJsxAttribute(property) && property.name.getText(tree) === "kind");
    if (!kind?.initializer || !ts.isStringLiteral(kind.initializer)) return;
    literalUses++;
    assert.ok(Object.hasOwn(SYSTEM7_ICONS, kind.initializer.text), `${file}: literal ${kind.initializer.text} icon is missing`);
  });
}
console.log(`System 7 identities: ${assets.size} transparent PNG subjects including the original COVERD brand, ${totalBytes} bytes; verified optical bounds and equal scaling at 90% of the frame; ${assets.size * 2} normal/miniature renders; ${Object.keys(applicationIconKinds).length} applications, ${projects.length} projects (${nativeProjects} shared application identities), ${Object.keys(arcadeIconKinds).length} games, ${serviceCodes.length} lab and ${contactServices.length} contact services; ${projects.length * 2} project artwork renders; ${finderRenders} Find application renders across ${localeOptions.length} locales; ${literalUses} literal references.`);
