// Verify compiled Find labels, bilingual search, canonical icons and dismissal.
// Keep Playwright in an external QA installation; BROWSER_ENGINE selects the engine.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
if (!process.env.PLAYWRIGHT_CORE_PATH) throw new Error("Set PLAYWRIGHT_CORE_PATH to an external Playwright installation.");
const playwright = require(process.env.PLAYWRIGHT_CORE_PATH);
const engine = process.env.BROWSER_ENGINE ?? "chromium";
assert.ok(["chromium", "firefox", "webkit"].includes(engine));
const origin = process.env.REVIEW_ORIGIN ?? "http://127.0.0.1:5191";
const output = resolve(process.env.ICON_REPORT_DIR ?? ".codex/reports/icon-unification/finder-labels");
await mkdir(output, { recursive: true });
const modules = new Map();
function load(file) {
  const filename = resolve(root, file);
  if (modules.has(filename)) return modules.get(filename);
  const compiled = ts.transpileModule(readFileSync(filename, "utf8"), { fileName: filename, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const loaded = { exports: {} }; modules.set(filename, loaded.exports);
  new Function("module", "exports", "require", compiled)(loaded, loaded.exports, name => {
    if (!name.startsWith(".") && !name.startsWith("@/")) return require(name);
    const target = name.startsWith("@/") ? resolve(root, "src", name.slice(2)) : resolve(dirname(filename), name);
    return load(existsSync(`${target}.ts`) ? `${target}.ts` : `${target}.tsx`);
  });
  modules.set(filename, loaded.exports);
  return loaded.exports;
}
function finderInventory() {
  const file = "src/components/SystemSevenDesktop.tsx";
  const tree = ts.createSourceFile(file, readFileSync(resolve(root, file), "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const names = ["INITIAL_WINDOWS", "DESKTOP_ICONS", "FINDER_APPLICATIONS"];
  const declarations = names.map(name => {
    let declaration;
    const visit = node => { if (ts.isVariableDeclaration(node) && node.name.getText(tree) === name) declaration = node; ts.forEachChild(node, visit); };
    visit(tree);
    assert.ok(declaration, `${name}: authored Find inventory is missing`);
    return `const ${declaration.getText(tree)};`;
  });
  const compiled = ts.transpileModule(`${declarations.join("\n")}\nexport { FINDER_APPLICATIONS };`, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const loaded = { exports: {} };
  new Function("module", "exports", compiled)(loaded, loaded.exports);
  return loaded.exports.FINDER_APPLICATIONS;
}
const applications = finderInventory();
assert.ok(applications.length > 0 && new Set(applications.map(app => app.id)).size === applications.length);
const { localeOptions, translateText } = load("src/lib/i18n.ts");
const { projectText } = load("src/lib/projectCopy.ts");
const { desktopCopy } = load("src/components/desktopCopy.ts");
const { foldSearch } = load("src/lib/projectSearch.ts");
const { SYSTEM7_ICONS } = load("src/lib/system7Icons.ts");
const { applicationIconKinds, projectIconKinds } = load("src/lib/iconIdentity.ts");
const canonicalPaths = new Set(Object.values(SYSTEM7_ICONS));
const isCanonicalRequest = url => canonicalPaths.has(new URL(url).pathname);
const { projects } = load("src/data/projects.ts");
const settings = applications.find(app => app.id === "settings");
assert.ok(settings && Object.hasOwn(desktopCopy, settings.title) && Object.hasOwn(desktopCopy, settings.description), "Settings title and description have reviewed desktop copy");
for (const source of [settings.title, settings.description]) assert.ok(desktopCopy[source].length === 2 && desktopCopy[source].every(text => /\p{Script=Han}/u.test(text)), "Both Chinese Settings fields have authored Mandarin copy");
const locales = localeOptions.filter(option => !process.env.ICON_LOCALES || process.env.ICON_LOCALES.split(",").includes(option.slug));
const widths = process.env.ICON_WIDTHS?.split(",").map(Number) ?? [1440, 320];
assert.ok(locales.length && widths.length && widths.every(width => [1440, 320].includes(width)));
const browser = await playwright[engine].launch({ headless: true, ...(engine === "chromium" ? { args: ["--no-sandbox"] } : {}) });
const report = { engine, browserVersion: browser.version(), sourceRoot: root, origin, started: new Date().toISOString(), inventory: { applications, projectCount: projects.length, locales: locales.map(option => option.slug), widths }, profiles: [] };

async function visibleElement(field, label) {
  const visible = await field.evaluate(node => {
    const box = node.getBoundingClientRect();
    let left = Math.max(0, box.left), right = Math.min(innerWidth, box.right);
    let top = Math.max(0, box.top), bottom = Math.min(innerHeight, box.bottom);
    for (let parent = node; parent; parent = parent.parentElement) {
      const style = getComputedStyle(parent);
      if (style.visibility === "hidden" || style.display === "none" || Number(style.opacity) === 0) return false;
      // BODY overflow can propagate to the viewport around a fixed desktop.
      if (parent === document.body || parent === document.documentElement) continue;
      const clip = parent.getBoundingClientRect();
      if (/(hidden|clip|auto|scroll)/.test(style.overflowX)) { left = Math.max(left, clip.left); right = Math.min(right, clip.right); }
      if (/(hidden|clip|auto|scroll)/.test(style.overflowY)) { top = Math.max(top, clip.top); bottom = Math.min(bottom, clip.bottom); }
    }
    return right > left && bottom > top;
  });
  assert.ok(visible, `${label}: field must be visible after scrolling its result into view`);
}
async function visibleField(field, expected, label) {
  assert.equal(await field.textContent(), expected, label);
  assert.ok(expected.trim().length > 0, `${label}: authored field must not be blank`);
  await visibleElement(field, label);
}
async function resultIcon(row, id) {
  const image = row.locator("img[data-system7-icon]");
  assert.equal(await image.count(), 1, `${id}: one canonical result icon`);
  await visibleElement(image, `${id}: canonical icon`);
  const decoded = await image.evaluate(async node => {
    await node.decode();
    return { kind: node.dataset.system7Icon, source: node.getAttribute("src"), width: node.naturalWidth, height: node.naturalHeight, rendering: getComputedStyle(node).imageRendering };
  });
  assert.equal(decoded.kind, applicationIconKinds[id], `${id}: canonical application kind`);
  assert.equal(decoded.source, SYSTEM7_ICONS[decoded.kind], `${id}: canonical PNG`);
  const canvas = decoded.kind === "coverd" ? 512 : 128;
  assert.equal(decoded.width, canvas, `${id}: decoded width`);
  assert.equal(decoded.height, canvas, `${id}: decoded height`);
  assert.equal(decoded.rendering, decoded.kind === "coverd" ? "auto" : "pixelated", `${id}: subject-appropriate rendering`);
}
async function visibleActions(dialog, label, width) {
  const geometry = await dialog.locator("footer button").evaluateAll(buttons => {
    const modal = buttons[0]?.closest("dialog").getBoundingClientRect();
    return buttons.map(button => {
      const box = button.getBoundingClientRect();
      return { text: button.textContent, width: box.width, height: box.height, contained: box.left >= Math.max(0, modal.left) && box.right <= Math.min(innerWidth, modal.right) && box.top >= Math.max(0, modal.top) && box.bottom <= Math.min(innerHeight, modal.bottom) };
    });
  });
  assert.equal(geometry.length, 2, `${label}: both Find actions exist`);
  for (const action of geometry) {
    assert.ok(action.contained, `${label}: ${action.text} visible inside dialog and viewport`);
    assert.ok(action.width >= 44 && action.height >= (width === 320 ? 44 : 30), `${label}: ${action.text} usable target`);
  }
}
async function searchApplications(page, dialog, locale, query, target) {
  const words = foldSearch(query).trim().split(/\s+/u).filter(Boolean);
  const expected = applications.filter(app => {
    const text = foldSearch(`${app.title} ${projectText(locale, desktopCopy, app.title)} ${app.description} ${projectText(locale, desktopCopy, app.description)}`);
    return words.every(word => text.includes(word));
  }).map(app => `finder-app-${app.id}`).sort();
  assert.ok(expected.includes(`finder-app-${target}`), `${target}: authored search terms match this application`);
  await dialog.locator("#finder-search").fill(query);
  // Observe a painted state before checking a filter whose result set may
  // coincide with its previous localized or English alias.
  await page.evaluate(() => new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done))));
  await page.waitForFunction(ids => {
    const actual = [...document.querySelectorAll('#finder-results [id^="finder-app-"]')].map(row => row.id).sort();
    return JSON.stringify(actual) === JSON.stringify(ids);
  }, expected);
  await dialog.locator(`#finder-app-${target}`).waitFor();
}
try {
  for (const option of locales) for (const width of widths) {
    const profile = { locale: option.slug, width, applicationRows: 0, visibleFields: 0, decodedIcons: 0, localizedTitleSearches: 0, englishTitleSearches: 0, descriptionSearches: 0, pageErrors: [], failedImages: [] };
    report.profiles.push(profile);
    const context = await browser.newContext({ viewport: { width, height: width === 320 ? 568 : 1000 } });
    const page = await context.newPage(); page.setDefaultTimeout(30000);
    page.on("pageerror", error => profile.pageErrors.push(error.stack));
    page.on("response", response => { if (isCanonicalRequest(response.url()) && response.status() >= 400) profile.failedImages.push({ url: response.url(), status: response.status() }); });
    page.on("requestfailed", request => { const failure = request.failure()?.errorText ?? ""; if (isCanonicalRequest(request.url()) && !/ERR_ABORTED|NS_BINDING_ABORTED|cancelled|canceled/i.test(failure)) profile.failedImages.push({ url: request.url(), failure }); });
    try {
      await page.goto(`${origin}/${option.slug}/desk`);
      await page.waitForFunction(() => document.documentElement.dataset.reduceEffects !== undefined);
      if (width === 320) await page.getByRole("button", { name: /^(Got it|知道了|明白了|了解了)$/ }).click();
      await page.locator(".apple-menu").click();
      await page.locator(".apple-dropdown").getByRole("menuitem", { name: translateText(option.locale, "Find…"), exact: true }).click();
      const dialog = page.locator('dialog[aria-labelledby="finder-title"][open]');
      const search = dialog.locator("#finder-search");
      await search.waitFor();
      await page.waitForFunction(() => document.activeElement === document.querySelector("#finder-search") && document.querySelector(".desktop-window-layer")?.inert === true);
      assert.equal(await dialog.locator("#finder-results [role=option]").count(), applications.length + projects.length, "Find contains its complete unchanged catalogue");
      assert.equal(await dialog.locator('header img[data-system7-icon]').count(), 0, "Find title is centered text without competing artwork");
      assert.equal(await dialog.locator('img[data-system7-icon="finder"]').count(), 1, "Find introduction retains its canonical icon");
      await visibleActions(dialog, "Complete catalogue", width);
      for (const app of applications) {
        const row = dialog.locator(`#finder-app-${app.id}`);
        await row.scrollIntoViewIfNeeded();
        await visibleField(row.locator("strong"), projectText(option.locale, desktopCopy, app.title), `${app.id}: title`);
        await visibleField(row.locator("small"), projectText(option.locale, desktopCopy, app.description), `${app.id}: description`);
        await resultIcon(row, app.id);
        profile.applicationRows++; profile.visibleFields += 2; profile.decodedIcons++;
      }
      for (const project of projects) assert.equal(await dialog.locator(`#finder-project-${project.slug} img`).getAttribute("data-system7-icon"), projectIconKinds[project.slug], `${project.slug}: project identity remains intact`);
      assert.equal(await dialog.locator("#finder-app-orbitals img").getAttribute("src"), await dialog.locator("#finder-project-orbital-lab img").getAttribute("src"), "Both Orbital results still use one generated icon");
      for (const app of applications) {
        const localized = projectText(option.locale, desktopCopy, app.title);
        await searchApplications(page, dialog, option.locale, localized, app.id);
        profile.localizedTitleSearches++;
        if (app.title !== localized) {
          await searchApplications(page, dialog, option.locale, app.title, app.id);
          profile.englishTitleSearches++;
        }
      }
      await searchApplications(page, dialog, option.locale, projectText(option.locale, desktopCopy, settings.description), "settings");
      profile.descriptionSearches++;
      await visibleActions(dialog, "Filtered catalogue", width);
      assert.ok((await search.inputValue()).length > 0, "Escape is exercised with a nonempty search input");
      await page.keyboard.press("Escape");
      await page.waitForFunction(() => !document.querySelector("dialog[open]") && document.querySelector(".desktop-window-layer")?.inert === false && document.activeElement === document.querySelector(".apple-menu"));
      assert.equal(await page.locator(".apple-menu").getAttribute("aria-expanded"), "false", "Restoring the menu launcher does not reopen it");
      assert.equal(profile.pageErrors.length, 0, "No browser errors during translated Find interactions");
      assert.equal(profile.failedImages.length, 0, "No canonical icon requests failed");
      profile.passed = true;
      console.log(`PASS Find labels ${engine} ${option.slug} ${width}: ${profile.applicationRows} rows, ${profile.visibleFields} visible fields, ${profile.decodedIcons} PNG decodes, ${profile.localizedTitleSearches + profile.englishTitleSearches + profile.descriptionSearches} search checks; Escape restores original launcher focus.`);
    } catch (error) {
      profile.error = error.stack;
      await page.screenshot({ path: resolve(output, `${engine}-${option.slug}-${width}-failure.png`) });
      throw error;
    } finally {
      await context.close();
      await writeFile(resolve(output, `finder-labels-${engine}.json`), `${JSON.stringify(report, null, 2)}\n`);
    }
  }
  report.finished = new Date().toISOString();
  report.summary = { profiles: report.profiles.length, applicationRows: report.profiles.reduce((sum, profile) => sum + profile.applicationRows, 0), visibleFields: report.profiles.reduce((sum, profile) => sum + profile.visibleFields, 0), decodedIcons: report.profiles.reduce((sum, profile) => sum + profile.decodedIcons, 0), searchChecks: report.profiles.reduce((sum, profile) => sum + profile.localizedTitleSearches + profile.englishTitleSearches + profile.descriptionSearches, 0), pageErrors: 0, failedImages: 0 };
  console.log(`Find labels ${engine}: ${JSON.stringify(report.summary)}`);
} finally {
  await browser.close();
  await writeFile(resolve(output, `finder-labels-${engine}.json`), `${JSON.stringify(report, null, 2)}\n`);
}
