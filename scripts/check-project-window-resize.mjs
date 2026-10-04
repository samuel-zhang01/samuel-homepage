// Exercise real desktop resizing and project/profile access on short work surfaces.
// Playwright stays in an external QA installation, outside release dependencies.
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";

if (!process.env.PLAYWRIGHT_CORE_PATH) throw new Error("Set PLAYWRIGHT_CORE_PATH to an external Playwright installation.");
const require = createRequire(import.meta.url);
const playwright = require(process.env.PLAYWRIGHT_CORE_PATH);
const origin = process.env.REVIEW_ORIGIN ?? "http://127.0.0.1:5174";
const output = resolve(process.env.PROJECT_RESIZE_REPORT_DIR ?? ".codex/reports/project-window-resize");
const engines = (process.env.PROJECT_RESIZE_ENGINES ?? "chromium").split(",");
await mkdir(output, { recursive: true });
const report = { origin, started: new Date().toISOString(), tests: [] };

async function resizeWindow(page, window, width) {
  const zoom = window.locator(".window-zoom");
  if (await zoom.getAttribute("aria-pressed") === "true") await zoom.click();
  await window.locator(".window-resize-handle").focus();
  // Drive the public keyboard control to its supported minimum, then widen it.
  for (let index = 0; index < 18; index++) await page.keyboard.press("Shift+ArrowLeft");
  for (let index = 0; index < 18; index++) await page.keyboard.press("Shift+ArrowUp");
  if (width === 640) for (let index = 0; index < 5; index++) await page.keyboard.press("Shift+ArrowRight");
  const bounds = await window.boundingBox();
  assert.equal(bounds?.width, width, "Actual keyboard resize reaches the intended width");
  assert.equal(bounds?.height, 240, "Actual keyboard resize reaches the supported short height");
}

async function chooseRow(page, window, row) {
  const slug = await row.getAttribute("data-project-slug");
  await row.click();
  await page.waitForFunction(expected => new URL(location.href).searchParams.get("selected") === expected, slug);
  const workspace = window.locator("[data-detail-open]");
  assert.equal(await workspace.getAttribute("data-detail-open"), "true", "A real project document opens");
  const back = window.locator('button[class*="backToList"]');
  await back.click();
  await page.waitForFunction(() => !new URL(location.href).searchParams.has("selected"));
  assert.equal(await workspace.getAttribute("data-detail-open"), "false", "Back restores the project list");
  // Back restores focus on the next animation frame. Complete that public
  // transition before starting a separate End-key interaction.
  await page.evaluate(() => new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done))));
  return slug;
}

async function inspectReachable(control) {
  await control.scrollIntoViewIfNeeded();
  await control.hover();
  const visible = await control.evaluate(element => {
    const bounds = element.getBoundingClientRect();
    let left = Math.max(0, bounds.left), right = Math.min(innerWidth, bounds.right);
    let top = Math.max(0, bounds.top), bottom = Math.min(innerHeight, bounds.bottom);
    for (let parent = element.parentElement; parent; parent = parent.parentElement) {
      // Root overflow clips to the viewport. Fixed desktop children do not
      // necessarily contribute a height to the body's own layout rectangle.
      if (parent === document.body || parent === document.documentElement) continue;
      const style = getComputedStyle(parent), clip = parent.getBoundingClientRect();
      if (/(auto|scroll|hidden|clip)/.test(style.overflowX)) { left = Math.max(left, clip.left); right = Math.min(right, clip.right); }
      if (/(auto|scroll|hidden|clip)/.test(style.overflowY)) { top = Math.max(top, clip.top); bottom = Math.min(bottom, clip.bottom); }
    }
    return { width: right - left, height: bottom - top };
  });
  assert.ok(visible.width > 0 && visible.height > 0, "Actual content is visible through its scrolling/clipping ancestors");
  return visible;
}

try {
  for (const engine of engines) {
    if (!playwright[engine]) throw new Error(`Unknown Playwright engine: ${engine}`);
    const browser = await playwright[engine].launch({ headless: true, ...(engine === "chromium" ? { args: ["--no-sandbox"] } : {}) });
    try {
      for (const locale of ["en-gb", "zh-tw"]) for (const width of [320, 640]) for (const view of ["guided", "files", "map"]) {
        const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
        await context.addInitScript(() => { sessionStorage.setItem("samuel-system-7-boot", "seen"); });
        const page = await context.newPage();
        page.setDefaultTimeout(15_000);
        const test = { engine, browserVersion: browser.version(), locale, width, height: 240, view, pageErrors: [] };
        report.tests.push(test);
        page.on("pageerror", error => test.pageErrors.push(error.message));
        try {
          await page.goto(`${origin}/${locale}/projects?view=${view}`);
          await page.waitForFunction(() => document.documentElement.dataset.reduceEffects !== undefined);
          const window = page.locator('[data-app-id="projects"]');
          await window.locator(".classic-module-loading").waitFor({ state: "hidden" });
          await page.waitForFunction(expected => [...document.querySelectorAll('[data-app-id="projects"] [role="tab"][aria-selected="true"]')].some(tab => tab.id.endsWith(`-${expected}-tab`)), view);
          await resizeWindow(page, window, width);
          if (view === "map") {
            const twoDimensions = window.getByRole("button", { name: /^(2D view|二維檢視)$/ });
            await twoDimensions.click();
            assert.equal(await twoDimensions.getAttribute("aria-pressed"), "true", "Graph controls remain reachable after resize");
            test.checks = ["actual supported keyboard resize", "scrollable graph control activates"];
          } else {
            const catalogue = window.locator('[class*="ProjectLibrary_catalogue"]');
            assert.ok((await catalogue.boundingBox())?.height > 0, "Catalogue retains a real layout height");
            const rows = catalogue.locator("button[data-project-slug]");
            assert.ok(await rows.count() > 1, "The catalogue contains real projects");
            test.firstSlug = await chooseRow(page, window, rows.first());
            // End navigation must reveal and open the final project too.
            await rows.first().focus();
            await page.keyboard.press("End");
            const lastSlug = await rows.last().getAttribute("data-project-slug");
            await page.waitForFunction(expected => document.activeElement?.getAttribute("data-project-slug") === expected, lastSlug);
            await page.keyboard.press("Enter");
            await page.waitForFunction(expected => new URL(location.href).searchParams.get("selected") === expected, lastSlug);
            await window.locator('button[class*="backToList"]').click();
            await page.waitForFunction(() => !new URL(location.href).searchParams.has("selected"));
            test.lastSlug = lastSlug;
            test.checks = ["actual supported keyboard resize", "first project pointer activation and return", "last project End/Enter activation and return"];
          }
          test.horizontalOverflow = await window.locator(".mac-window__content").evaluate(pane => pane.scrollWidth - pane.clientWidth);
          assert.ok(test.horizontalOverflow <= 1, "Project pane stays horizontally bounded");
          assert.deepEqual(test.pageErrors, [], "No unhandled page errors");
          test.passed = true;
          console.log(`PASS ${engine} ${locale} ${view} ${width}×240: ${test.checks.join("; ")}`);
        } catch (error) {
          test.error = error.stack;
          await page.screenshot({ path: resolve(output, `${engine}-${locale}-${view}-${width}-failure.png`) });
          throw error;
        } finally {
          await context.close();
          await writeFile(resolve(output, "project-resize.json"), `${JSON.stringify(report, null, 2)}\n`);
        }
      }
      for (const locale of ["en-gb", "zh-tw"]) for (const width of [320, 640]) for (const app of ["about", "experience", "education", "documents"]) {
        const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
        await context.addInitScript(() => { sessionStorage.setItem("samuel-system-7-boot", "seen"); });
        const page = await context.newPage(); page.setDefaultTimeout(15_000);
        const test = { engine, browserVersion: browser.version(), locale, width, height: 240, app, pageErrors: [] };
        report.tests.push(test);
        page.on("pageerror", error => test.pageErrors.push(error.message));
        try {
          await page.goto(`${origin}/${locale}/${app === "about" ? "" : app}`);
          await page.waitForFunction(() => document.documentElement.dataset.reduceEffects !== undefined);
          const window = page.locator(`[data-app-id="${app}"]`);
          await window.locator(".classic-module-loading").waitFor({ state: "hidden" });
          await resizeWindow(page, window, width);
          const pane = window.locator(".mac-window__content");
          if (app === "documents") {
            const finalDocument = window.locator(".documents-library > button").last();
            const documentId = await finalDocument.getAttribute("id");
            await finalDocument.click();
            await page.waitForFunction(expected => location.hash === `#${expected}`, documentId);
            assert.equal(await finalDocument.getAttribute("aria-pressed"), "true", "The last library document activates");
            const reader = window.locator('.pdf-reader[data-status="ready"]');
            await reader.waitFor();
            assert.ok((await reader.boundingBox())?.height > 0, "Loaded reader retains a layout height");
            const canvas = reader.locator(".pdf-reader__page canvas").first();
            await page.waitForFunction(() => document.querySelector('[data-app-id="documents"] .pdf-reader__page canvas')?.width > 1);
            test.visibleCanvas = await inspectReachable(canvas);
            const stage = reader.locator(".pdf-reader__stage");
            test.readerScroll = await stage.evaluate(element => { element.scrollTop = element.scrollHeight; return element.scrollTop; });
            assert.ok(test.readerScroll > 0, "The actual PDF stage can scroll through its rendered page");
            test.documentId = documentId;
            test.checks = ["actual supported keyboard resize", "last document pointer activation", "visible rendered PDF canvas and stage scrolling"];
          } else {
            const finalLink = app === "about" ? pane.locator(".about-main a[download]").last()
              : app === "experience" ? pane.locator(".career-record").last().locator(".profile-source-links a").last()
              : pane.locator(".education-app a").last();
            test.visibleLink = await inspectReachable(finalLink);
            test.checks = ["actual supported keyboard resize", "final profile content link is reachable after scrolling"];
          }
          test.horizontalOverflow = await pane.evaluate(element => element.scrollWidth - element.clientWidth);
          assert.ok(test.horizontalOverflow <= 1, "Profile pane stays horizontally bounded");
          assert.deepEqual(test.pageErrors, [], "No unhandled page errors");
          test.passed = true;
          console.log(`PASS ${engine} ${locale} ${app} ${width}×240: ${test.checks.join("; ")}`);
        } catch (error) {
          test.error = error.stack;
          await page.screenshot({ path: resolve(output, `${engine}-${locale}-${app}-${width}-failure.png`) });
          throw error;
        } finally {
          await context.close();
          await writeFile(resolve(output, "project-resize.json"), `${JSON.stringify(report, null, 2)}\n`);
        }
      }
    } finally { await browser.close(); }
  }
  report.finished = new Date().toISOString();
} finally {
  await writeFile(resolve(output, "project-resize.json"), `${JSON.stringify(report, null, 2)}\n`);
}
