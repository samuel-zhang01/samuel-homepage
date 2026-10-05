// Complete source-derived browser crawl. External Playwright; disposable contexts only.
// PLAYWRIGHT_CORE_PATH=/path/to/playwright REVIEW_ORIGIN=http://127.0.0.1:5187 node scripts/check-deep-browser.mjs
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
if (!process.env.PLAYWRIGHT_CORE_PATH) throw new Error("Set PLAYWRIGHT_CORE_PATH to an external Playwright installation.");
const pw = require(process.env.PLAYWRIGHT_CORE_PATH);
const engine = process.env.BROWSER_ENGINE ?? "chromium";
assert.ok(["chromium", "firefox", "webkit"].includes(engine));
const origin = process.env.REVIEW_ORIGIN ?? "http://127.0.0.1:5187";
const output = process.env.DEEP_REPORT_DIR ?? ".codex/reports/deep-audit";
const screenshots = process.env.REVIEW_SCREENSHOT_DIR ?? ".codex/reports/deep-audit/screenshots";
await mkdir(output, { recursive: true }); await mkdir(screenshots, { recursive: true });
const modules = new Map();
function load(file) {
  const filename = resolve(root, file);
  if (modules.has(filename)) return modules.get(filename);
  const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), { fileName: filename, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  const loadedModule = { exports: {} }; modules.set(filename, loadedModule.exports);
  new Function("module", "exports", "require", outputText)(loadedModule, loadedModule.exports, name => {
    if (!name.startsWith(".") && !name.startsWith("@/")) return require(name);
    const target = name.startsWith("@/") ? resolve(root, "src", name.slice(2)) : resolve(dirname(filename), name);
    return load(existsSync(`${target}.ts`) ? `${target}.ts` : `${target}.tsx`);
  });
  return loadedModule.exports;
}
function objectFromSource(file, name) {
  const source = ts.createSourceFile(file, readFileSync(resolve(root, file), "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let object;
  const visit = node => { if (ts.isVariableDeclaration(node) && node.name.getText(source) === name) object = node.initializer; ts.forEachChild(node, visit); };
  visit(source); assert.ok(object && ts.isObjectLiteralExpression(object), `${file}:${name} is an inspectable object inventory`);
  return Object.fromEntries(object.properties.map(property => [property.name.text ?? property.name.getText(source), ts.isStringLiteral(property.initializer) ? property.initializer.text : property.initializer.getText(source)]));
}
function arrayIdsFromSource(file, name) {
  const source = ts.createSourceFile(file, readFileSync(resolve(root, file), "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let array;
  const visit = node => { if (ts.isVariableDeclaration(node) && node.name.getText(source) === name) array = node.initializer; ts.forEachChild(node, visit); };
  visit(source); if (ts.isAsExpression(array)) array = array.expression;
  assert.ok(ts.isArrayLiteralExpression(array), `${file}:${name} is an inspectable array inventory`);
  return array.elements.map(element => { const property = element.properties.find(property => property.name.getText(source) === "id"); assert.ok(ts.isStringLiteral(property.initializer)); return property.initializer.text; });
}
const { projects } = load("src/data/projects.ts");
const { localeOptions, localeCvAssets, translateText } = load("src/lib/i18n.ts");
const { getProjectText } = load("src/lib/projectNarrative.ts");
const { getProjectStory } = load("src/components/projects/projectStories.ts");
const sections = { "": "about", projects: "projects", ...objectFromSource("src/app/[locale]/[section]/page.tsx", "sections") };
const demoRegistry = objectFromSource("src/components/projects/ProjectDemoRouter.tsx", "demoComponents");
const gameIds = arrayIdsFromSource("src/components/SystemSevenDesktop.tsx", "ARCADE_GAMES");
const systemProjects = [...new Map(projects.filter(project => project.systemApp).map(project => [project.systemApp, project])).values()];
assert.deepEqual([...new Set(projects.filter(p => p.demo).map(p => p.demo))].sort(), Object.keys(demoRegistry).sort(), "Catalogue and lazy demo registry agree");
const localeFilter = process.env.DEEP_LOCALES?.split(",");
const selectedLocales = localeOptions.filter(item => !localeFilter || localeFilter.includes(item.slug));
assert.ok(selectedLocales.length > 0);
const widths = process.env.DEEP_WIDTHS?.split(",").map(Number) ?? [1440, 320];
assert.ok(widths.length > 0 && widths.every(width => [1440, 320].includes(width)));
const slugFilter = process.env.DEEP_SLUGS?.split(",");
const selectedProjects = projects.filter(project => !slugFilter || slugFilter.includes(project.slug));
if (slugFilter) assert.equal(selectedProjects.length, new Set(slugFilter).size, "Every requested project exists");
const groupFilter = process.env.DEEP_GROUP ? new RegExp(process.env.DEEP_GROUP) : undefined;
const jobs = [];
for (const option of selectedLocales) for (const width of widths) {
  for (const project of selectedProjects) jobs.push({ group: "documents", project, option, width, route: `/${option.slug}/projects?project=${project.slug}` });
  for (const [section, appId] of Object.entries(sections)) jobs.push({ group: "sections", option, width, appId, section, route: `/${option.slug}/${section}` });
  for (const project of selectedProjects.filter(project => project.demo)) jobs.push({ group: "demos", project, option, width, route: `/${option.slug}/projects?project=${project.slug}` });
  for (const project of selectedProjects) for (const artifact of project.artifacts?.filter(artifact => artifact.kind === "PDF") ?? []) jobs.push({ group: "pdfs", project, artifact, option, width, route: `/${option.slug}/projects?project=${project.slug}` });
  for (const gameId of gameIds) jobs.push({ group: "games", gameId, option, width, appId: "games", route: `/${option.slug}/games` });
  for (const project of systemProjects.filter(project => !slugFilter || slugFilter.includes(project.slug))) jobs.push({ group: "systemApps", project, option, width, appId: project.systemApp, route: `/${option.slug}/projects?project=${project.slug}` });
  jobs.push({ group: "nojs", option, width, route: `/${option.slug}/` });
  for (const javaScriptEnabled of [false, true]) jobs.push({ group: "missing", option, width, javaScriptEnabled, route: `/${option.slug}/audit-missing-item` });
}
for (const width of widths) for (const javaScriptEnabled of [false, true]) jobs.push({ group: "missing", option: localeOptions[0], width, javaScriptEnabled, route: "/audit-missing-item" });
for (const width of widths) for (const javaScriptEnabled of [false, true]) {
  jobs.push({ group: "missing", option: localeOptions[0], width, javaScriptEnabled, route: "/xx-xz/projects" });
  const option = localeOptions.find(option => option.slug === "zh-tw");
  jobs.push({ group: "missing", option, width, javaScriptEnabled, route: "/zh-tw/a/b/c" });
  for (const key of ["constructor", "__proto__", "toString"]) {
    jobs.push({ group: "missing", option: localeOptions[0], width, javaScriptEnabled, route: `/${key}` });
    jobs.push({ group: "missing", option, width, javaScriptEnabled, route: `/zh-tw/${key}` });
  }
  jobs.push({ group: "missing", option: localeOptions[0], width, javaScriptEnabled, route: "/audit-missing-item?lang=constructor" });
}
for (const width of widths) for (const pattern of ["classic", "blue", "paper"]) {
  const option = selectedLocales.find(option => option.slug === (width === 320 ? "zh-tw" : "en-gb")) ?? selectedLocales[0];
  jobs.push({ group: "themes", option, width, pattern, appId: "settings", route: `/${option.slug}/settings` });
}
const selectedJobs = jobs.filter(job => !groupFilter || groupFilter.test(job.group));
assert.ok(selectedJobs.length > 0, "Selected matrix is nonempty");
const report = { engine, browserVersion: null, playwrightVersion: require(resolve(process.env.PLAYWRIGHT_CORE_PATH, "package.json")).version, origin, started: new Date().toISOString(), inventory: { projectCount: projects.length, demoCount: Object.keys(demoRegistry).length, pdfCount: projects.flatMap(project => project.artifacts?.filter(artifact => artifact.kind === "PDF") ?? []).length, gameIds, systemApps: systemProjects.map(project => ({ appId: project.systemApp, slug: project.slug })), sections, locales: selectedLocales.map(option => option.slug), widths }, planned: Object.fromEntries(["documents", "sections", "demos", "pdfs", "games", "systemApps", "nojs", "missing", "themes"].map(group => [group, selectedJobs.filter(job => job.group === group).length])), visits: [] };
const browser = await pw[engine].launch({ headless: true, ...(engine === "chromium" ? { executablePath: process.env.BROWSER_EXECUTABLE_PATH, args: ["--no-sandbox"], ignoreDefaultArgs: ["--hide-scrollbars"] } : {}) });
report.browserVersion = browser.version();
console.log(`Deep crawl ${engine} ${report.browserVersion}: ${selectedJobs.length} source-derived journeys; ${JSON.stringify(report.planned)}`);
const app = (p, id) => p.locator(`[data-app-id="${id}"]`);
async function sampleScreenshot(p, job, visit, name) {
  if (job.width !== 320 || job.option.slug !== "zh-tw") return;
  const file = `${engine}-${name}-zh-tw-320.png`;
  await p.screenshot({ path: `${screenshots}/${file}` }); visit.screenshot = file;
}
const labels = {
  "en-gb": { guide: "Got it", launch: "Open interactive demo", notes: "Implementation notes", nojs: "JavaScript is turned off.", back: "Back to project" },
  "en-us": { guide: "Got it", launch: "Open interactive demo", notes: "Implementation notes", nojs: "JavaScript is turned off.", back: "Back to project" },
  "zh-cn": { guide: "知道了", launch: "打开交互演示", notes: "实现说明", nojs: "JavaScript 已关闭。", back: "返回项目" },
  "zh-tw": { guide: "知道了", launch: "開啟互動示範", notes: "實作說明", nojs: "JavaScript 已關閉。", back: "返回專案" },
};
async function ready(p, job) {
  await p.waitForFunction(() => document.documentElement.dataset.reduceEffects !== undefined);
  if (job.width === 320) await p.getByRole("button", { name: /^(Got it|知道了|明白了|了解了)$/ }).click();
  await p.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  assert.equal(await p.locator("html").getAttribute("lang"), job.option.locale);
}
async function geometry(p, id) {
  const result = await p.evaluate(appId => {
    const pane = document.querySelector(`[data-app-id="${appId}"] .mac-window__content`);
    const doc = document.documentElement;
    const overflow = { document: doc.scrollWidth - doc.clientWidth, pane: pane ? pane.scrollWidth - pane.clientWidth : null };
    const offenders = pane && overflow.pane > 1 ? [...pane.querySelectorAll("*")].filter(element => {
      const rect = element.getBoundingClientRect(); const box = pane.getBoundingClientRect();
      return rect.width > 0 && (rect.right > box.right + 2 || rect.left < box.left - 2);
    }).slice(0, 12).map(element => ({ tag: element.tagName, class: element.className?.baseVal ?? element.className, text: element.textContent?.trim().slice(0, 100) })) : [];
    return { overflow, offenders };
  }, id);
  assert.ok(result.overflow.document <= 1 && result.overflow.pane <= 1, `Horizontal overflow: ${JSON.stringify(result)}`);
  return result.overflow;
}
async function inspectImages(p, container) {
  const sources = [];
  for (const image of await container.locator("img").all()) {
    if (!await image.isVisible()) continue;
    await image.scrollIntoViewIfNeeded();
    // Responsive/lazy image selection can still be in progress after scrolling.
    // Require the selected resource to finish and have real dimensions before
    // calling decode(); a broken image still times out and fails this check.
    await p.waitForFunction(image => image.complete && image.naturalWidth > 0 && image.naturalHeight > 0, await image.elementHandle());
    const decoded = await image.evaluate(async image => { await image.decode(); return { source: image.getAttribute("src"), width: image.naturalWidth, height: image.naturalHeight, alt: image.getAttribute("alt"), hidden: image.getAttribute("aria-hidden") }; });
    assert.ok(decoded.width > 0 && decoded.height > 0, `Decoded image dimensions: ${decoded.source}`);
    assert.ok(decoded.alt !== null, `Image has alternative text or explicit empty decorative alternative: ${decoded.source}`);
    sources.push(decoded.source);
  }
  return sources;
}
async function inspectLinks(container, project) {
  const links = await container.locator("a[href]").evaluateAll(nodes => nodes.map(node => ({ href: node.getAttribute("href"), absolute: node.href, target: node.target, rel: node.rel, label: (node.getAttribute("aria-label") ?? node.textContent).trim() })));
  for (const link of links) {
    assert.ok(link.label.length > 0, `Link has a name: ${link.href}`);
    assert.ok(!/^javascript:|^data:/i.test(link.href), `Executable link: ${link.href}`);
    if (/^https?:/i.test(link.href)) assert.ok(link.href.startsWith("https:"), `External source uses HTTPS: ${link.href}`);
    if (link.target === "_blank") assert.ok(link.rel.includes("noopener") || link.rel.includes("noreferrer"), `New-tab source separates opener: ${link.href}`);
  }
  if (project?.sourceUrl && project.access !== "proprietary") assert.ok(links.some(link => link.href === project.sourceUrl), "Document preserves its exact catalogue source URL");
  if (project?.websiteUrl) assert.ok(links.some(link => link.href === project.websiteUrl), "Document preserves its exact catalogue website URL");
  return links.map(link => link.href);
}
async function documentChecks(p, job, visit) {
  const window = app(p, "project"); await window.waitFor();
  const document = window.locator('[data-embedded="false"]'); await document.waitFor();
  assert.equal(await document.getAttribute("lang"), job.option.locale);
  await document.getByRole("heading", { level: 1, name: getProjectText(job.option.locale, job.project.title), exact: true }).waitFor();
  assert.equal(await document.getByText(getProjectText(job.option.locale, job.project.summary), { exact: true }).isVisible(), true);
  const notes = document.getByRole("region", { name: labels[job.option.slug].notes, exact: true });
  if (getProjectStory(job.project) || job.project.phases.length || job.project.highlights.length) {
    await notes.waitFor(); assert.equal(await notes.locator("details, summary").count(), 0);
    for (const block of await notes.locator("p, dd, ol, ul").all()) assert.equal(await block.isVisible(), true, "Project explanation is visible without disclosure");
  }
  if (job.project.privacyNote) assert.equal(await document.getByText(getProjectText(job.option.locale, job.project.privacyNote), { exact: true }).isVisible(), true);
  visit.links = await inspectLinks(document, job.project);
  visit.images = await inspectImages(p, document);
  visit.geometry = await geometry(p, "project");
  if (job.project.demo === "mri-trust") await sampleScreenshot(p, job, visit, "mri-document");
  visit.checks.push("translated title/summary/privacy", "visible explanation bodies", "exact catalogue links", "image decode/alternatives", "document and pane width");
}
async function exerciseState(p, demo) {
  const before = await demo.innerText();
  const candidates = [
    [demo.locator('button[role="tab"][aria-selected="false"]:not(:disabled)'), "aria-selected", "true"],
    [demo.locator('nav:has(button[aria-current="page"]) button:not([aria-current="page"]):not(:disabled)'), "aria-current", "page"],
    [demo.locator('button[aria-pressed="false"]:not(:disabled)'), "aria-pressed", "true"],
  ];
  for (const [choices, attribute, value] of candidates) {
    for (const choice of await choices.all()) {
      if (!await choice.isVisible()) continue;
      const index = await choice.evaluate(button => [...button.closest("[data-locale]").querySelectorAll("button")].indexOf(button));
      const label = (await choice.innerText()).trim(); await choice.scrollIntoViewIfNeeded(); await choice.focus(); await p.keyboard.press("Enter");
      // The copy boundary can replace a button node while updating a view.
      // Inspect the current rendered button instead of retaining a detached node.
      await p.waitForFunction(({ index, attribute, value }) => document.querySelector('[data-app-id="projectActivity"] [data-locale]')?.querySelectorAll("button")[index]?.getAttribute(attribute) === value, { index, attribute, value });
      const after = await demo.innerText();
      assert.notEqual(after, before, `Demo action changes displayed content: ${label}`);
      return { kind: attribute, label, displayedContentChanged: true };
    }
  }
  for (const range of await demo.locator('input[type="range"]:not(:disabled)').all()) {
    if (!await range.isVisible()) continue;
    const value = await range.inputValue(); const min = await range.getAttribute("min");
    await range.scrollIntoViewIfNeeded(); await range.focus(); await p.keyboard.press(value === min ? "ArrowRight" : "ArrowLeft");
    assert.notEqual(await range.inputValue(), value, "Keyboard range value changed");
    assert.notEqual(await demo.innerText(), before, "Keyboard range updates displayed result");
    return { kind: "range", label: await range.getAttribute("aria-label") ?? "associated range label", displayedContentChanged: true };
  }
  throw new Error("No supported meaningful state action discovered; requires an explicit fixture, not a blanket pass");
}
async function demoChecks(p, job, visit) {
  const document = app(p, "project");
  const launch = document.getByRole("button", { name: labels[job.option.slug].launch, exact: false }).first();
  await launch.waitFor(); await launch.scrollIntoViewIfNeeded(); await launch.focus(); await p.keyboard.press("Enter");
  const activity = app(p, "projectActivity"); const demo = activity.locator("[data-locale]").first();
  await demo.waitFor(); assert.equal(await demo.getAttribute("data-locale"), job.option.locale);
  assert.equal(new URL(p.url()).searchParams.get("project"), job.project.slug); assert.equal(new URL(p.url()).searchParams.get("view"), "demo");
  assert.equal(await activity.locator('[data-kind="demo"]').count(), 1);
  const toolbar = activity.locator('[class*="ProjectActivity_toolbar"]'); const pane = activity.locator(".mac-window__content");
  const position = await toolbar.boundingBox(); const bounds = await pane.boundingBox();
  assert.ok(position.y >= bounds.y - 1 && position.y + position.height <= bounds.y + bounds.height + 1, "Demo launch jumps to reachable activity navigation");
  assert.ok((await demo.getByRole("heading").first().innerText()).trim().length > 0, "Demo exposes a semantic title");
  visit.initialGeometry = await geometry(p, "projectActivity");
  visit.state = await exerciseState(p, demo);
  visit.images = await inspectImages(p, demo);
  visit.geometry = await geometry(p, "projectActivity");
  visit.links = await inspectLinks(demo);
  if (job.project.demo === "finance") await sampleScreenshot(p, job, visit, "finance-demo");
  await activity.locator(".window-close").focus(); await p.keyboard.press("Enter");
  await activity.waitFor({ state: "detached" });
  await p.waitForFunction(() => document.activeElement?.closest('[data-app-id="project"]') && document.activeElement.textContent.includes(document.documentElement.lang.startsWith("en") ? "Open interactive demo" : document.documentElement.lang === "zh-CN" ? "打开交互演示" : "開啟互動示範"));
  assert.equal(new URL(p.url()).searchParams.get("project"), job.project.slug); assert.notEqual(new URL(p.url()).searchParams.get("view"), "demo");
  assert.equal(await launch.evaluate(button => button === document.activeElement), true, "Close restores the originating keyboard launch control");
  visit.checks.push("keyboard launch and shared route", "reachable jump/navigation", "meaningful selected state plus changed content", "image/link/pane checks", "keyboard close and originating focus");
}
async function sectionChecks(p, job, visit) {
  const window = app(p, job.appId); await window.waitFor();
  // Visible loading copy is not sufficient evidence of a loaded core app.
  await window.locator(".classic-module-loading, .sidequest-app-loading, .productivity-app-loading").waitFor({ state: "detached" });
  assert.equal(await window.locator(".mac-window__content").isVisible(), true);
  assert.ok((await window.innerText()).trim().length > 0);
  if (job.appId === "documents") {
    await window.locator('.pdf-reader[data-status="ready"]').waitFor();
    assert.equal(await window.locator('a[data-native-navigation]').getAttribute("href"), localeCvAssets[job.option.locale].src);
    assert.ok(await window.locator("canvas").first().evaluate(canvas => canvas.width > 1 && canvas.height > 1), "Regional CV actually renders");
    visit.checks.push("exact regional CV source and rendered canvas");
  }
  const close = window.locator(".window-close"); assert.equal(await close.getAttribute("aria-label") !== null, true);
  await close.focus(); assert.equal(await close.evaluate(button => button === document.activeElement), true);
  const outline = await close.evaluate(button => { const style = getComputedStyle(button); return { outline: style.outlineStyle, boxShadow: style.boxShadow, border: style.borderStyle }; });
  assert.ok(outline.outline !== "none" || outline.boxShadow !== "none", "Focused close exposes a visible outline or shadow");
  visit.keyboardFocus = outline; visit.links = await inspectLinks(window);
  visit.images = await inspectImages(p, window.locator(".mac-window__content")); visit.geometry = await geometry(p, job.appId);
  if (job.section === "resume") assert.equal(new URL(p.url()).pathname, `/${job.option.slug}/documents`);
  visit.checks.push("correct active app and language", "named keyboard-focusable close", "images and named safe links", "bounded document/pane");
}
async function pdfChecks(p, job, visit) {
  const document = app(p, "project");
  // Root preferences hydration can finish before the lazy project document.
  // An empty evaluateAll() result is not evidence that an artifact is missing.
  await document.locator('[data-embedded="false"]').waitFor();
  const buttons = document.locator("button");
  const label = getProjectText(job.option.locale, job.artifact.label);
  const index = await buttons.evaluateAll((buttons, label) => buttons.findIndex(button => button.title === label || button.textContent.includes(label)), label);
  assert.ok(index >= 0, `Declared PDF has an actual document launch control: ${job.artifact.href}`);
  const launch = buttons.nth(index); await launch.scrollIntoViewIfNeeded(); await launch.focus(); await p.keyboard.press("Enter");
  const activity = app(p, "projectActivity"); await activity.waitFor();
  const reader = activity.locator(".pdf-reader"); await reader.waitFor();
  await p.waitForFunction(() => [...document.querySelectorAll('[data-app-id="projectActivity"] .pdf-reader canvas')].some(canvas => canvas.width > 1 && canvas.height > 1));
  assert.equal(new URL(p.url()).searchParams.get("project"), job.project.slug);
  assert.equal(new URL(p.url()).searchParams.get("view"), "pdf");
  assert.equal(new URL(p.url()).searchParams.get("artifact"), job.artifact.href);
  assert.equal(await reader.locator('a[data-native-navigation]').getAttribute("href"), job.artifact.href);
  assert.ok((await reader.locator('canvas[aria-label]').first().getAttribute("aria-label")).length > 0, "Rendered PDF canvas identifies its document and page");
  visit.initialGeometry = await geometry(p, "projectActivity");
  const zoom = reader.getByRole("button", { name: translateText(job.option.locale, "Zoom in"), exact: true });
  await zoom.focus(); await p.keyboard.press("Enter");
  await p.waitForFunction(() => document.querySelector('[data-app-id="projectActivity"] .pdf-reader')?.getAttribute("data-zoomed") === "true");
  const stage = reader.locator(".pdf-reader__stage"); await stage.focus();
  assert.equal(await stage.evaluate(node => node === document.activeElement), true);
  assert.ok((await stage.getAttribute("aria-description")).length > 0, "Zoomed reader explains keyboard panning");
  await reader.locator(".pdf-reader__fit").focus(); await p.keyboard.press("Enter");
  await p.waitForFunction(() => !document.querySelector('[data-app-id="projectActivity"] .pdf-reader')?.hasAttribute("data-zoomed"));
  visit.geometry = await geometry(p, "projectActivity"); visit.links = await inspectLinks(activity);
  if (job.project.slug === "growmat") await sampleScreenshot(p, job, visit, "growmat-pdf");
  await activity.locator(".window-close").focus(); await p.keyboard.press("Enter"); await activity.waitFor({ state: "detached" });
  await p.waitForFunction(() => Boolean(document.activeElement?.closest('[data-app-id="project"]')));
  assert.equal(await launch.evaluate(button => button === document.activeElement), true, "PDF close restores its specific launch control");
  assert.equal(new URL(p.url()).searchParams.get("project"), job.project.slug); assert.notEqual(new URL(p.url()).searchParams.get("view"), "pdf");
  visit.checks.push("keyboard artifact launch", "rendered labelled PDF canvas", "exact artifact/source route", "keyboard zoom/fit and named pan stage", "bounded reader pane", "specific keyboard close focus");
}
async function noJsChecks(p, job, visit) {
  const main = p.locator(".no-js-notice"); await main.waitFor();
  assert.equal(await p.locator("html").getAttribute("lang"), job.option.locale);
  await main.getByText(labels[job.option.slug].nojs, { exact: false }).waitFor();
  assert.equal(await main.locator(`a[href="${localeCvAssets[job.option.locale].src}"]`).count(), 1);
  assert.equal(await main.locator('a[href^="mailto:"]').count(), 1);
  assert.equal(await main.locator('nav a[lang]').count(), localeOptions.length);
  const cv = main.locator(`a[href="${localeCvAssets[job.option.locale].src}"]`); await cv.focus(); assert.equal(await cv.evaluate(link => link === document.activeElement), true);
  assert.equal(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
  visit.links = await inspectLinks(main); visit.checks.push("localized no-JS notice", "exact regional CV and email", "four-language navigation", "keyboard focus and width");
  await sampleScreenshot(p, job, visit, "nojs-essentials");
}
async function keyboardActivate(p, locator) {
  await locator.scrollIntoViewIfNeeded(); await locator.focus(); await p.keyboard.press("Enter");
  await p.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}
async function gameChecks(p, job, visit) {
  const window = app(p, "games"); await window.waitFor();
  const select = window.locator(`[data-game-id="${job.gameId}"]`); await keyboardActivate(p, select);
  await p.waitForFunction(id => document.querySelector(".games-app")?.getAttribute("data-game") === id, job.gameId);
  assert.equal(await select.getAttribute("aria-pressed"), "true");
  const stage = window.locator(".game-stage"); await stage.getByRole("heading").first().waitFor();
  const t = text => translateText(job.option.locale, text);
  if (job.gameId === "minefield") {
    const flag = stage.locator(".mine-toolbar button").first(); await keyboardActivate(p, flag);
    assert.equal(await flag.getAttribute("aria-pressed"), "true");
    await keyboardActivate(p, stage.locator(".minefield button").first());
    assert.equal(await stage.locator(".minefield button").first().innerText(), "F");
    await keyboardActivate(p, stage.locator(".mine-toolbar button").last());
    assert.equal(await stage.locator(".minefield button").first().innerText(), "");
    assert.equal(await flag.getAttribute("aria-pressed"), "false");
    visit.state = "keyboard flag cell and reset";
  } else if (job.gameId === "puzzle") {
    const before = await stage.locator(".puzzle-board").innerText();
    await keyboardActivate(p, stage.locator(".puzzle-board button:not(:disabled)").first());
    assert.notEqual(await stage.locator(".puzzle-board").innerText(), before);
    assert.match(await stage.locator(".puzzle-counter").innerText(), /^1/);
    await keyboardActivate(p, stage.locator(".puzzle-actions button"));
    assert.match(await stage.locator(".puzzle-counter").innerText(), /^0/);
    visit.state = "legal keyboard tile move and shuffle reset";
  } else if (job.gameId === "samword") {
    await stage.locator(".samword-form input").fill("AAAAAA"); await p.keyboard.press("Enter");
    const row = stage.locator('.samword-row[role="img"]'); await row.waitFor();
    assert.ok((await row.getAttribute("aria-label")).length > 0);
    assert.equal(await row.locator("span").allTextContents().then(text => text.join("")), "AAAAAA");
    await keyboardActivate(p, stage.locator(".samword-file-actions button").last());
    assert.equal(await stage.locator('.samword-row[role="img"]').count(), 0);
    visit.state = "keyboard six-letter guess with scored semantic row and next-file reset";
  } else if (job.gameId === "memory") {
    await keyboardActivate(p, stage.locator(".memory-grid button").first());
    assert.equal(await stage.locator(".memory-grid button.is-visible").count(), 1);
    assert.notEqual(await stage.locator(".memory-grid button").first().innerText(), "?");
    visit.stateGeometry = await geometry(p, "games");
    await keyboardActivate(p, stage.locator(".memory-status button"));
    assert.equal(await stage.locator(".memory-grid button.is-visible").count(), 0);
    visit.state = "keyboard card reveal and shuffle reset";
  } else if (job.gameId === "snake" || job.gameId === "brickbreaker") {
    const game = stage.locator(job.gameId === "snake" ? ".snake-game" : ".brick-game"); await game.waitFor();
    await keyboardActivate(p, game.getByRole("button", { name: t("Play"), exact: true }));
    await game.getByRole("button", { name: t("Pause"), exact: true }).waitFor();
    await keyboardActivate(p, game.getByRole("button", { name: t("Pause"), exact: true }));
    await game.getByRole("button", { name: t("Resume"), exact: true }).waitFor();
    const board = game.locator('[role="img"]'); const paused = await board.innerHTML();
    await p.waitForTimeout(350); assert.equal(await board.innerHTML(), paused, "Paused board remains unchanged over two Snake ticks / many Brick animation frames");
    visit.stateGeometry = await geometry(p, "games");
    await keyboardActivate(p, game.getByRole("button", { name: t("Reset"), exact: true }));
    await game.getByRole("button", { name: t("Play"), exact: true }).waitFor();
    visit.state = "keyboard play/pause, frozen board observation and ready reset";
  } else if (job.gameId === "spectrum") {
    const game = stage.locator(".hplc-peak-dock"); await game.waitFor();
    const range = game.locator('input[type="range"]').first(); const before = await range.inputValue();
    await range.scrollIntoViewIfNeeded(); await range.focus(); await p.keyboard.press("ArrowRight"); assert.notEqual(await range.inputValue(), before);
    await keyboardActivate(p, game.locator(".hplc-fit-button")); await game.locator(".hplc-result.is-revealed").waitFor();
    assert.ok((await game.locator(".hplc-result").innerText()).trim().length > 0);
    visit.stateGeometry = await geometry(p, "games"); await sampleScreenshot(p, job, visit, "peak-dock-fit");
    await keyboardActivate(p, game.locator(".hplc-reset-button")); assert.equal(await game.locator(".hplc-result.is-revealed").count(), 0);
    visit.state = "keyboard retention adjustment, fit result and reset";
  } else throw new Error(`No meaningful game fixture for ${job.gameId}`);
  visit.links = await inspectLinks(window); visit.images = await inspectImages(p, stage); visit.geometry = await geometry(p, "games");
  if (job.gameId === "spectrum") await sampleScreenshot(p, job, visit, "peak-dock");
  await keyboardActivate(p, window.locator(".window-close")); await window.waitFor({ state: "detached" });
  visit.checks.push("source-derived game and native keyboard selection", "actual bounded game action/result/reset", "pause sample for realtime games", "semantics/resources/width", "keyboard game-window close");
}
async function systemAppChecks(p, job, visit) {
  const document = app(p, "project"); const launchName = job.option.locale.startsWith("en") ? "Open application" : job.option.locale === "zh-CN" ? "打开应用" : "開啟應用程式";
  const launch = document.getByRole("button", { name: launchName, exact: false }); await keyboardActivate(p, launch);
  const window = app(p, job.appId); await window.waitFor();
  const t = text => translateText(job.option.locale, text);
  if (job.appId === "notepad") {
    const editor = window.locator("textarea"); await editor.fill("Deep audit note");
    await keyboardActivate(p, window.getByRole("button", { name: t("Next page"), exact: true })); assert.equal(await editor.inputValue(), "");
    await keyboardActivate(p, window.getByRole("button", { name: t("Previous page"), exact: true })); assert.equal(await editor.inputValue(), "Deep audit note");
    visit.state = "note input and retained page navigation";
  } else if (job.appId === "sketch") {
    const canvas = window.locator("canvas"); await canvas.scrollIntoViewIfNeeded(); const before = await canvas.evaluate(canvas => canvas.toDataURL()); const box = await canvas.boundingBox();
    await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await p.mouse.down(); await p.mouse.move(box.x + box.width / 2 + 16, box.y + box.height / 2 + 16, { steps: 4 }); await p.mouse.up();
    await window.getByRole("button", { name: t("Undo"), exact: true }).waitFor();
    assert.notEqual(await canvas.evaluate(canvas => canvas.toDataURL()), before, "Pointer stroke changes actual canvas pixels");
    await keyboardActivate(p, window.getByRole("button", { name: t("Undo"), exact: true })); assert.equal(await canvas.evaluate(canvas => canvas.toDataURL()), before);
    visit.state = "pointer stroke and keyboard undo restore canvas pixels";
  } else if (job.appId === "tasks") {
    await window.locator("#quick-task").fill("Deep audit task"); await p.keyboard.press("Enter");
    const checkbox = window.getByRole("checkbox", { name: `${t("Complete")} Deep audit task`, exact: true }); await checkbox.waitFor(); await checkbox.focus(); await p.keyboard.press("Space");
    assert.equal(await window.getByRole("checkbox", { name: `${t("Reopen")} Deep audit task`, exact: true }).isChecked(), true); await keyboardActivate(p, window.getByRole("button", { name: `${t("Delete task")}: Deep audit task`, exact: true }));
    assert.equal(await window.getByText("Deep audit task", { exact: true }).count(), 0); visit.state = "keyboard task add/complete/delete";
  } else if (job.appId === "focus") {
    const preset = window.getByRole("button", { name: t("5 min break"), exact: true }); await keyboardActivate(p, preset); assert.equal(await preset.getAttribute("aria-pressed"), "true");
    await keyboardActivate(p, window.getByRole("button", { name: t("Start"), exact: true })); await window.getByRole("button", { name: t("Pause"), exact: true }).waitFor();
    await keyboardActivate(p, window.getByRole("button", { name: t("Pause"), exact: true })); await window.getByRole("button", { name: t("Start"), exact: true }).waitFor();
    await keyboardActivate(p, window.getByRole("button", { name: t("Reset"), exact: true })); assert.match(await window.getByRole("progressbar").innerText(), /05:00/); visit.state = "keyboard preset/start/pause/reset to five minutes";
  } else if (job.appId === "calendar") {
    const month = window.locator('[class*="monthPanel"] h3'); const before = await month.innerText();
    await keyboardActivate(p, window.getByRole("button", { name: t("Next month"), exact: true })); assert.notEqual(await month.innerText(), before);
    await window.locator("textarea").fill("Deep audit reminder"); assert.equal(await window.locator("textarea").inputValue(), "Deep audit reminder"); visit.state = "keyboard month change and selected-date note input";
  } else if (job.appId === "calculator") {
    const keyboard = window.getByLabel(t("Desk Calculator keyboard area"), { exact: true }); await keyboard.focus(); await p.keyboard.press("2"); await p.keyboard.press("+"); await p.keyboard.press("3"); await p.keyboard.press("Enter");
    const display = window.locator('[class*="calculatorDisplay"] strong'); assert.equal(await display.innerText(), "5"); await p.keyboard.press("Escape"); assert.equal(await display.innerText(), "0"); visit.state = "keyboard 2+3=5 and clear";
  } else if (job.appId === "converter") {
    await window.getByRole("textbox", { name: t("Value to convert"), exact: true }).fill("12");
    const output = window.locator('[class*="converterOutput"] strong'); const expected = new Intl.NumberFormat(job.option.locale, { maximumSignificantDigits: 10 }).format(12 / .3048);
    assert.equal(await output.innerText(), expected); await keyboardActivate(p, window.getByRole("button", { name: t("Swap units"), exact: true }));
    assert.equal(await output.innerText(), new Intl.NumberFormat(job.option.locale, { maximumSignificantDigits: 10 }).format(12)); visit.state = "metres-to-feet numeric result and keyboard swap back to twelve metres";
  } else if (job.appId === "palette") {
    await window.getByRole("textbox", { name: t("Hex colour"), exact: true }).fill("#FFFFFF"); await p.keyboard.press("Enter");
    await p.waitForFunction(() => document.querySelector('[data-app-id="palette"] input[type="color"]')?.value === "#ffffff");
    assert.equal(await window.locator('input[type="color"]').inputValue(), "#ffffff"); assert.equal(await window.locator('[class*="colourValues"] dd').first().innerText(), "255, 255, 255");
    await window.getByText(t("Use black text"), { exact: true }).waitFor(); visit.state = "keyboard white hex input yields RGB255 and black text recommendation";
  } else if (job.appId === "orbitals") {
    const canvas = window.locator("canvas"); await canvas.waitFor(); const before = await canvas.getAttribute("aria-label");
    await keyboardActivate(p, window.getByRole("button", { name: "H · 1s", exact: true }));
    await p.waitForFunction(() => document.querySelector('[data-app-id="orbitals"] canvas')?.getAttribute("aria-label")?.includes("n=1, l=0, m=0"));
    assert.notEqual(await canvas.getAttribute("aria-label"), before); assert.ok(await canvas.evaluate(canvas => canvas.width > 0 && canvas.height > 0)); visit.state = "keyboard hydrogen1s preset updates actual named orbital canvas";
  } else if (job.appId === "lab") {
    const before = await window.locator(".service-card").count(); await keyboardActivate(p, window.locator('.lab-filters button[aria-pressed="false"]').first());
    assert.ok(await window.locator(".service-card").count() > 0 && await window.locator(".service-card").count() < before); visit.state = "keyboard category filter changes actual service-card inventory";
  } else if (job.appId === "experience") {
    const disclosure = window.locator(".career-projects-more").first(); await keyboardActivate(p, disclosure.locator("summary")); assert.equal(await disclosure.getAttribute("open") !== null, true);
    for (const link of await disclosure.locator("a").all()) assert.equal(await link.isVisible(), true); visit.state = "keyboard career disclosure exposes additional project links";
  } else if (job.appId === "coverd") {
    assert.equal(await window.locator(".coverd-pipeline article").count(), 5); assert.equal(await window.locator('a[href="https://coverd.ai/"]').count(), 1); visit.state = "informational application: five actual pipeline steps and exact external product link; no local mutable state";
  } else throw new Error(`No meaningful application fixture for ${job.appId}`);
  visit.links = await inspectLinks(window); visit.images = await inspectImages(p, window.locator(".mac-window__content")); visit.geometry = await geometry(p, job.appId);
  if (job.appId === "orbitals") await sampleScreenshot(p, job, visit, "orbital-tool");
  await keyboardActivate(p, window.locator(".window-close")); await window.waitFor({ state: "detached" });
  await p.waitForFunction(() => Boolean(document.activeElement?.closest('[data-app-id="project"]')));
  assert.equal(await launch.evaluate(button => button === document.activeElement), true, "Application close restores its originating document launch control");
  assert.equal(new URL(p.url()).searchParams.get("project"), job.project.slug);
  visit.checks.push("actual catalog application keyboard launch", "application-specific result/state or explicit informational-content fixture", "resource/semantic/width checks", "keyboard close and originating document focus/route");
}
async function missingChecks(p, job, visit) {
  const main = p.getByRole("main"); await main.waitFor();
  assert.equal(await p.locator("html").getAttribute("lang"), job.option.locale);
  assert.ok((await main.innerText()).includes("404"), "404 recovery is actual visible HTML rather than serialized Flight data");
  assert.ok((await main.getByRole("heading", { level: 1 }).first().innerText()).trim().length > 0);
  const projects = main.locator('a[href$="/projects"]');
  assert.equal(await projects.count(), 1); assert.ok(await main.locator("a[href]").count() >= 2, "Projects and restart recovery are reachable");
  await projects.focus(); assert.equal(await projects.evaluate(link => link === document.activeElement), true);
  const target = new URL(await projects.getAttribute("href"), origin);
  if (job.option.locale !== "en-GB") assert.equal(target.pathname, `/${job.option.slug}/projects`);
  assert.equal(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
  visit.links = await inspectLinks(main);
  if (!job.javaScriptEnabled && job.route === "/zh-tw/audit-missing-item") await sampleScreenshot(p, job, visit, "nojs-404-recovery");
  await p.keyboard.press("Enter"); await p.waitForURL(target.href);
  if (job.javaScriptEnabled) await app(p, "projects").waitFor();
  else await p.locator(".no-js-notice").waitFor();
  visit.recoveredTo = new URL(p.url()).pathname;
  visit.checks.push("visible localized 404 HTML", "projects/restart recovery", "keyboard recovery reaches actual projects or no-JS essentials", "bounded width");
}
let next = 0; let failedScreenshots = 0;
async function worker() {
  while (next < selectedJobs.length) {
    const job = selectedJobs[next++];
    const visit = { group: job.group, slug: job.project?.slug, demoId: job.project?.demo, artifact: job.artifact?.href, gameId: job.gameId, appId: job.appId, section: job.section, locale: job.option.slug, width: job.width, pattern: job.pattern, javaScriptEnabled: job.javaScriptEnabled ?? job.group !== "nojs", route: job.route, result: "PASS", checks: [], pageErrors: [], assetFailures: [], requestFailures: [] };
    const context = await browser.newContext({ viewport: { width: job.width, height: job.width === 320 ? 568 : 1000 }, javaScriptEnabled: visit.javaScriptEnabled });
    if (job.group !== "nojs") await context.addInitScript(() => sessionStorage.setItem("samuel-system7-boot", "seen"));
    const p = await context.newPage(); p.setDefaultTimeout(25000);
    p.on("pageerror", error => visit.pageErrors.push(error.message));
    p.on("response", response => { if (response.url().startsWith(origin) && response.status() >= 400 && response.request().resourceType() !== "document") visit.assetFailures.push({ url: response.url(), status: response.status() }); });
    p.on("requestfailed", request => {
      const error = request.failure()?.errorText;
      // Firefox/Chromium may report a script preload as CSP-blocked when the
      // context explicitly disables JavaScript. This is the requested no-JS
      // state, not an application resource failure. Retain it as evidence.
      if (!visit.javaScriptEnabled && request.resourceType() === "script" && error === "csp") {
        (visit.disabledScriptRequests ??= []).push(request.url());
      } else if (!/ABORT|CANCEL|NS_BINDING_ABORTED/i.test(error ?? "")) visit.requestFailures.push({ url: request.url(), error });
    });
    try {
      const response = await p.goto(`${origin}${job.route}`, { timeout: 60000 }); assert.equal(response.status(), job.group === "missing" ? 404 : 200);
      if (job.group !== "nojs" && job.group !== "missing") await ready(p, job);
      if (job.group === "documents") await documentChecks(p, job, visit);
      else if (job.group === "demos") await demoChecks(p, job, visit);
      else if (job.group === "pdfs") await pdfChecks(p, job, visit);
      else if (job.group === "games") await gameChecks(p, job, visit);
      else if (job.group === "systemApps") await systemAppChecks(p, job, visit);
      else if (job.group === "sections") await sectionChecks(p, job, visit);
      else if (job.group === "nojs") await noJsChecks(p, job, visit);
      else if (job.group === "missing") await missingChecks(p, job, visit);
      else if (job.group === "themes") {
        const radio = app(p, "settings").locator(`input[name="desktop-pattern"][value="${job.pattern}"]`); await radio.focus(); await p.keyboard.press("Space");
        await p.locator(`.system-desktop.desktop-pattern--${job.pattern}`).waitFor(); assert.equal(await radio.isChecked(), true);
        visit.geometry = await geometry(p, "settings"); visit.checks.push("native keyboard theme selection", "actual retained desktop pattern", "bounded settings pane");
        if (job.width === 320) await p.screenshot({ path: `${screenshots}/${engine}-theme-${job.pattern}-320.png` });
      }
      assert.deepEqual(visit.pageErrors, [], "No unhandled page errors"); assert.deepEqual(visit.assetFailures, [], "No missing/failing requested same-origin resources"); assert.deepEqual(visit.requestFailures, [], "No unexpected failed requests");
    } catch (error) {
      visit.result = "FAIL"; visit.error = error.stack;
      console.log(`FAIL ${engine} ${job.group} ${job.project?.slug ?? job.gameId ?? job.section ?? job.pattern ?? job.route} ${job.option.slug} ${job.width}: ${error.message}`);
      if (failedScreenshots++ < 12) { const file = `${engine}-failure-${job.group}-${job.project?.slug ?? job.gameId ?? job.section ?? job.pattern ?? "home"}-${job.option.slug}-${job.width}.png`; await p.screenshot({ path: `${screenshots}/${file}` }).catch(() => {}); visit.screenshot = file; }
    } finally {
      report.visits.push(visit);
      const completed = report.visits.length;
      if (completed % 20 === 0) console.log(`Progress ${engine}: ${completed}/${selectedJobs.length}; failures=${report.visits.filter(visit => visit.result === "FAIL").length}`);
      await context.close();
    }
  }
}
try {
  const concurrency = Math.max(1, Math.min(4, Number(process.env.DEEP_CONCURRENCY ?? 3)));
  await Promise.all(Array.from({ length: concurrency }, worker));
} finally {
  await browser.close(); report.finished = new Date().toISOString();
  report.summary = Object.fromEntries(Object.keys(report.planned).map(group => { const visits = report.visits.filter(visit => visit.group === group); return [group, { visited: visits.length, passed: visits.filter(visit => visit.result === "PASS").length, failed: visits.filter(visit => visit.result === "FAIL").length }]; }));
  const suffix = process.env.DEEP_REPORT_NAME ?? `${engine}-crawl`;
  await writeFile(`${output}/${suffix}.json`, JSON.stringify(report, null, 2));
  console.log(`Final ${engine}: ${JSON.stringify(report.summary)}; ${output}/${suffix}.json`);
}
if (report.visits.some(visit => visit.result !== "PASS") || report.visits.length !== selectedJobs.length) process.exitCode = 1;
