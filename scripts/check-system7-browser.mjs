// Focused icon identity audit through real menus, Find and application windows.
// PLAYWRIGHT_CORE_PATH=/external/playwright REVIEW_ORIGIN=http://127.0.0.1:5190 node scripts/check-system7-browser.mjs
// BROWSER_ENGINE defaults to Chromium; raw reports/screenshots stay ignored.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
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
const origin = process.env.REVIEW_ORIGIN ?? "http://127.0.0.1:5190";
const output = resolve(process.env.ICON_REPORT_DIR ?? ".codex/reports/icon-unification");
await mkdir(resolve(output, "screenshots"), { recursive: true });
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
function arrayIds(file, name) {
  const tree = ts.createSourceFile(file, readFileSync(resolve(root, file), "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let array;
  const visit = node => { if (ts.isVariableDeclaration(node) && node.name.getText(tree) === name) array = node.initializer; ts.forEachChild(node, visit); };
  visit(tree);
  while (array && (ts.isAsExpression(array) || ts.isSatisfiesExpression(array))) array = array.expression;
  assert.ok(array && ts.isArrayLiteralExpression(array), `${name} is an inspectable identity inventory`);
  return array.elements.map(item => {
    const id = item.properties.find(property => property.name.getText(tree) === "id");
    assert.ok(id && ts.isStringLiteral(id.initializer));
    return id.initializer.text;
  });
}
function documentCopyPair(key) {
  const file = "src/components/projects/ProjectDocument.tsx";
  const tree = ts.createSourceFile(file, readFileSync(resolve(root, file), "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let pair;
  const visit = node => {
    if (ts.isPropertyAssignment(node) && ts.isStringLiteral(node.name) && node.name.text === key && ts.isArrayLiteralExpression(node.initializer)) pair = node.initializer.elements;
    ts.forEachChild(node, visit);
  };
  visit(tree);
  assert.ok(pair?.length === 2 && pair.every(ts.isStringLiteral), `ProjectDocument owns its localized ${key} label`);
  return pair.map(item => item.text);
}
const { projects } = load("src/data/projects.ts");
const { localeOptions, translateText } = load("src/lib/i18n.ts");
const { getProjectText } = load("src/lib/projectNarrative.ts");
const { SYSTEM7_ICONS } = load("src/lib/system7Icons.ts");
const canonicalPaths = new Set(Object.values(SYSTEM7_ICONS));
const isCanonicalRequest = url => canonicalPaths.has(new URL(url).pathname);
const { applicationIconKinds, projectIconKinds, arcadeIconKinds, serviceIconKinds } = load("src/lib/iconIdentity.ts");
const demoLaunchCopy = documentCopyPair("Open interactive demo");
const desktopIds = arrayIds("src/components/SystemSevenDesktop.tsx", "DESKTOP_ICONS");
const finderIds = arrayIds("src/components/SystemSevenDesktop.tsx", "INITIAL_WINDOWS").filter(id => !["secret", "project", "projectActivity"].includes(id));
const locales = localeOptions.filter(option => !process.env.ICON_LOCALES || process.env.ICON_LOCALES.split(",").includes(option.slug));
const widths = process.env.ICON_WIDTHS?.split(",").map(Number) ?? [1440, 320];
const navigationDelayMs = Number(process.env.ICON_NAVIGATION_DELAY_MS ?? 250);
assert.ok(locales.length > 0 && widths.length > 0 && widths.every(width => [1440, 320].includes(width)));
assert.ok(Number.isFinite(navigationDelayMs) && navigationDelayMs >= 0, "Navigation pacing must be a nonnegative duration in milliseconds");
const browser = await playwright[engine].launch({ headless: true, ...(engine === "chromium" ? { args: ["--no-sandbox"] } : {}) });
const report = { engine, browserVersion: browser.version(), origin, started: new Date().toISOString(), inventory: { iconCount: Object.keys(SYSTEM7_ICONS).length, applications: finderIds, projectCount: projects.length, demoCount: projects.filter(project => project.demo).length, locales: locales.map(option => option.slug), widths, navigationDelayMs }, assetResponses: [], profiles: [] };
console.log(`System 7 browser audit ${engine} ${report.browserVersion}: ${Object.keys(SYSTEM7_ICONS).length} exact production assets; ${locales.length * widths.length} locale/viewport profiles.`);
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
let screenshots = 0;
async function snapshot(page, profile, name) {
  if (!(profile.locale === "en-gb" && profile.width === 1440 || profile.locale === "zh-tw" && profile.width === 320)) return;
  const filename = `${engine}-${profile.locale}-${profile.width}-${name}.png`;
  await page.screenshot({ path: resolve(output, "screenshots", filename), fullPage: false });
  profile.screenshots.push(filename); screenshots++;
}
async function inspectIcons(page, profile) {
  const images = await page.locator("img[data-system7-icon]").evaluateAll(nodes => nodes.map(image => ({ kind: image.dataset.system7Icon, source: image.getAttribute("src") })));
  for (const image of images) assert.equal(image.source, SYSTEM7_ICONS[image.kind], `Rendered ${image.kind} does not use its canonical PNG`);
  const legacy = await page.locator('img[src*="/system7-icons/"]:not([data-system7-icon])').count();
  assert.equal(legacy, 0, "An icon bypasses the unified renderer");
  const decoded = await page.locator("img[data-system7-icon]").evaluateAll(async nodes => {
    const visible = nodes.filter(image => {
      const box = image.getBoundingClientRect();
      if (!box.width || !box.height || box.right <= 0 || box.bottom <= 0 || box.left >= innerWidth || box.top >= innerHeight) return false;
      for (let parent = image.parentElement; parent; parent = parent.parentElement) {
        const style = getComputedStyle(parent);
        if (style.visibility === "hidden" || style.display === "none") return false;
        // Root overflow propagates to the viewport; a fixed desktop can leave
        // BODY with no layout height without clipping its visible descendants.
        if (parent === document.body || parent === document.documentElement) continue;
        if (/(hidden|clip|auto|scroll)/.test(style.overflowX + style.overflowY)) {
          const clip = parent.getBoundingClientRect();
          if (box.right <= clip.left || box.left >= clip.right || box.bottom <= clip.top || box.top >= clip.bottom) return false;
        }
      }
      return true;
    });
    return Promise.all(visible.map(async image => {
      if (!image.complete) await new Promise((done, reject) => {
        const timer = setTimeout(() => reject(new Error(`Icon did not load: ${image.src}`)), 15000);
        image.addEventListener("load", () => { clearTimeout(timer); done(); }, { once: true });
        image.addEventListener("error", () => { clearTimeout(timer); reject(new Error(`Broken icon: ${image.src}`)); }, { once: true });
      });
      await image.decode();
      return { kind: image.dataset.system7Icon, width: image.naturalWidth, height: image.naturalHeight, rendering: getComputedStyle(image).imageRendering };
    }));
  });
  assert.ok(decoded.length > 0, "Every inspected UI state must contain visible decoded icons");
  for (const image of decoded) {
    const canvas = image.kind === "coverd" ? 512 : 128;
    assert.equal(image.width, canvas, `${image.kind}: decoded width`);
    assert.equal(image.height, canvas, `${image.kind}: decoded height`);
    assert.equal(image.rendering, image.kind === "coverd" ? "auto" : "pixelated", `${image.kind}: subject-appropriate rendering`);
    profile.decodedKinds.add(image.kind);
  }
  profile.imageObservations += images.length;
  profile.decodedImageObservations += decoded.length;
}
async function geometry(page, id) {
  const overflow = await page.evaluate(appId => {
    const doc = document.documentElement;
    const pane = document.querySelector(`[data-app-id="${appId}"] .mac-window__content`);
    return { document: doc.scrollWidth - doc.clientWidth, pane: pane ? pane.scrollWidth - pane.clientWidth : null };
  }, id);
  assert.ok(overflow.document <= 1 && overflow.pane <= 1, `${id}: horizontal overflow ${JSON.stringify(overflow)}`);
  return overflow;
}
async function windowIdentity(page, id, kind) {
  const window = page.locator(`[data-app-id="${id}"]`);
  await window.waitFor();
  assert.equal(await window.locator(".mac-titlebar h2 img").count(), 0, `${id}: System7 titlebar contains only its centered title`);
  assert.equal(await page.locator(".menu-status .active-application img").getAttribute("data-system7-icon"), kind, `${id}: active application menu identity`);
  assert.equal(await page.locator(".window-switcher button.is-active img").getAttribute("data-system7-icon"), kind, `${id}: application switcher identity`);
  return window;
}
async function openFinder(page) {
  await page.keyboard.press("Control+k");
  await page.locator("dialog[open] #finder-results").waitFor();
}
async function openFound(page, key) {
  await page.waitForTimeout(navigationDelayMs);
  await openFinder(page);
  const item = page.locator(`#finder-${key}`);
  await item.scrollIntoViewIfNeeded();
  await item.click();
  await page.locator("dialog[open]").waitFor({ state: "hidden" });
}
async function closeWindow(page, id) {
  await page.waitForTimeout(navigationDelayMs);
  await page.locator(`[data-app-id="${id}"] .window-close`).click();
  await page.locator(`[data-app-id="${id}"]`).waitFor({ state: "hidden" });
}
try {
  const assetsContext = await browser.newContext();
  for (const [kind, path] of Object.entries(SYSTEM7_ICONS)) {
    const response = await assetsContext.request.get(`${origin}${path}`);
    assert.equal(response.status(), 200, `${kind}: production asset status`);
    assert.match(response.headers()["content-type"], /^image\/png(?:;|$)/, `${kind}: production PNG MIME`);
    const bytes = await response.body();
    assert.equal(hash(bytes), hash(readFileSync(resolve(root, "public", `.${path}`))), `${kind}: production bytes differ from checked asset`);
    report.assetResponses.push({ kind, bytes: bytes.length, sha256: hash(bytes) });
  }
  await assetsContext.close();
  for (const option of locales) for (const width of widths) {
    const profile = { locale: option.slug, width, checks: [], screenshots: [], pageErrors: [], failedImages: [], canceledImages: [], decodedKinds: new Set(), imageObservations: 0, decodedImageObservations: 0 };
    report.profiles.push(profile);
    const context = await browser.newContext({ viewport: { width, height: width === 320 ? 568 : 1000 } });
    const page = await context.newPage(); page.setDefaultTimeout(30000);
    page.on("pageerror", error => profile.pageErrors.push(error.stack));
    page.on("requestfailed", request => {
      if (!isCanonicalRequest(request.url())) return;
      const failure = request.failure()?.errorText;
      const entry = { url: request.url(), failure };
      if (/ERR_ABORTED|NS_BINDING_ABORTED|cancelled|canceled/i.test(failure ?? "")) profile.canceledImages.push(entry);
      else profile.failedImages.push(entry);
    });
    page.on("response", response => { if (isCanonicalRequest(response.url()) && response.status() >= 400) profile.failedImages.push({ url: response.url(), status: response.status() }); });
    try {
      await page.goto(`${origin}/${option.slug}/projects?view=files`, { timeout: 60000 });
      await page.waitForFunction(() => document.documentElement.dataset.reduceEffects !== undefined);
      if (width === 320) await page.getByRole("button", { name: /^(Got it|知道了|明白了|了解了)$/ }).click();
      await page.locator('[data-app-id="projects"] [data-project-slug]').first().waitFor();
      assert.equal(await page.locator("html").getAttribute("lang"), option.locale);
      const desktop = await page.locator(".desktop-icon__graphic img").evaluateAll(nodes => nodes.map(image => image.dataset.system7Icon));
      assert.deepEqual(desktop, desktopIds.map(id => applicationIconKinds[id]), "Desktop uses application identities");
      await page.locator(".apple-menu").click();
      const menu = await page.locator(".apple-dropdown img").evaluateAll(nodes => nodes.map(image => image.dataset.system7Icon));
      assert.ok(menu.includes("orbital") && menu.includes("finder") && menu.includes("coverd"), "Menu includes canonical Orbital, Find and COVERD identities");
      await inspectIcons(page, profile); await snapshot(page, profile, "desktop-menu");
      await page.keyboard.press("Escape");
      await windowIdentity(page, "projects", applicationIconKinds.projects);
      await inspectIcons(page, profile); await geometry(page, "projects");
      profile.checks.push({ group: "desktop-menu-archive" });
      await closeWindow(page, "projects");
      await openFinder(page);
      assert.equal(await page.locator("#finder-results [role=option]").count(), finderIds.length + projects.length, "Find exposes the complete catalogue");
      for (const id of finderIds) assert.equal(await page.locator(`#finder-app-${id} img`).getAttribute("data-system7-icon"), applicationIconKinds[id], `${id}: Find application identity`);
      for (const project of projects) assert.equal(await page.locator(`#finder-project-${project.slug} img`).getAttribute("data-system7-icon"), projectIconKinds[project.slug], `${project.slug}: Find project identity`);
      assert.equal(await page.locator("#finder-app-orbitals img").getAttribute("src"), await page.locator("#finder-project-orbital-lab img").getAttribute("src"), "Both Orbital search results use one image");
      await inspectIcons(page, profile); await snapshot(page, profile, "finder");
      profile.checks.push({ group: "finder", applications: finderIds.length, projects: projects.length });
      await page.keyboard.press("Escape");
      await page.locator("dialog[open]").waitFor({ state: "hidden" });
      for (const id of finderIds) {
        await openFound(page, `app-${id}`);
        const window = await windowIdentity(page, id, applicationIconKinds[id]);
        await window.locator(".classic-module-loading, .sidequest-app-loading").first().waitFor({ state: "hidden" });
        if (id === "games") for (const [gameId, kind] of Object.entries(arcadeIconKinds)) assert.equal(await window.locator(`[data-game-id="${gameId}"] img`).getAttribute("data-system7-icon"), kind, `${gameId}: arcade launcher`);
        if (id === "lab") assert.equal(await window.locator(".service-card img").count(), Object.keys(serviceIconKinds).length, "Every Home Lab service has an icon");
        await inspectIcons(page, profile); const overflow = await geometry(page, id);
        if (["desk", "orbitals", "games", "lab", "contact"].includes(id)) await snapshot(page, profile, id);
        profile.checks.push({ group: "applications", id, kind: applicationIconKinds[id], overflow });
        await closeWindow(page, id);
      }
      console.log(`${engine} ${option.slug} ${width}: all ${finderIds.length} Find applications checked; opening ${projects.length} project documents and ${projects.filter(project => project.demo).length} demos.`);
      for (const project of projects) {
        await openFound(page, `project-${project.slug}`);
        const window = page.locator('[data-app-id="project"]');
        await window.getByRole("heading", { level: 1, name: getProjectText(option.locale, project.title), exact: true }).waitFor();
        await windowIdentity(page, "project", projectIconKinds[project.slug]);
        assert.equal(await window.locator("article header img[data-system7-icon]").first().getAttribute("data-system7-icon"), projectIconKinds[project.slug], `${project.slug}: document artwork`);
        await inspectIcons(page, profile); const overflow = await geometry(page, "project");
        profile.checks.push({ group: "documents", slug: project.slug, kind: projectIconKinds[project.slug], overflow });
        if (project.slug === "orbital-lab") await snapshot(page, profile, "orbital-document");
        if (project.demo) {
          const demoLaunchLabel = option.locale === "zh-CN" ? demoLaunchCopy[0] : option.locale === "zh-TW" ? demoLaunchCopy[1] : translateText(option.locale, "Open interactive demo");
          await window.getByRole("button", { name: demoLaunchLabel, exact: false }).first().click();
          const activity = await windowIdentity(page, "projectActivity", projectIconKinds[project.slug]);
          await activity.locator("[data-locale]").first().getByRole("heading").first().waitFor();
          await activity.locator(".classic-module-loading").waitFor({ state: "hidden" });
          await activity.getByText(translateText(option.locale, "OPENING INTERACTIVE FILE…"), { exact: true }).waitFor({ state: "hidden" });
          await inspectIcons(page, profile); const demoOverflow = await geometry(page, "projectActivity");
          if (["videomate", "microrobot-vision", "neural-cfd-surrogates", "parliamo-italian-learning"].includes(project.slug)) await snapshot(page, profile, `demo-${project.slug}`);
          profile.checks.push({ group: "activities", slug: project.slug, kind: projectIconKinds[project.slug], overflow: demoOverflow });
          await closeWindow(page, "projectActivity");
        }
        await closeWindow(page, "project");
        if (profile.checks.filter(check => check.group === "documents").length % 10 === 0) console.log(`${engine} ${option.slug} ${width}: ${profile.checks.length} identity states checked.`);
      }
      // The existing keyboard easter egg also reaches this overlay on phones,
      // whose optional Special menu is hidden. Use the real key sequence.
      await page.evaluate(() => document.activeElement?.blur());
      for (const key of ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"]) await page.keyboard.press(key);
      await windowIdentity(page, "secret", applicationIconKinds.secret);
      await inspectIcons(page, profile); await geometry(page, "secret");
      profile.checks.push({ group: "secret" });
      await closeWindow(page, "secret");
      assert.equal(profile.failedImages.length, 0, "No icon asset requests failed");
      assert.equal(profile.pageErrors.length, 0, "No browser errors during icon interactions");
      console.log(`PASS ${engine} ${option.slug} ${width}: ${profile.checks.length} identity states, ${profile.imageObservations} rendered icon observations, ${profile.decodedImageObservations} visible image decodes`);
    } catch (error) {
      profile.error = error.stack; await page.screenshot({ path: resolve(output, "screenshots", `${engine}-${option.slug}-${width}-failure.png`) });
      throw error;
    } finally {
      profile.decodedKinds = [...profile.decodedKinds].sort();
      await context.close();
      await writeFile(resolve(output, `browser-${engine}.json`), `${JSON.stringify(report, null, 2)}\n`);
    }
  }
  report.finished = new Date().toISOString();
  report.summary = { profiles: report.profiles.length, checks: report.profiles.reduce((sum, profile) => sum + profile.checks.length, 0), imageObservations: report.profiles.reduce((sum, profile) => sum + profile.imageObservations, 0), decodedImageObservations: report.profiles.reduce((sum, profile) => sum + profile.decodedImageObservations, 0), screenshots, failedImages: 0, pageErrors: 0 };
  console.log(`System 7 browser audit ${engine}: ${JSON.stringify(report.summary)}`);
} finally {
  await browser.close();
  await writeFile(resolve(output, `browser-${engine}.json`), `${JSON.stringify(report, null, 2)}\n`);
}
