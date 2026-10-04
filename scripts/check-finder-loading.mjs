// Compiled Find chunk delay/failure, dismissal, focus and late-delivery regressions.
// Keep Playwright and optional axe-core in an external QA installation.
import assert from "node:assert/strict";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
if (!process.env.PLAYWRIGHT_CORE_PATH) throw new Error("Set PLAYWRIGHT_CORE_PATH to an external Playwright installation.");
const pw = require(process.env.PLAYWRIGHT_CORE_PATH);
const snapshot = resolve(process.env.SOURCE_ROOT ?? resolve(dirname(fileURLToPath(import.meta.url)), ".."));
const origin = process.env.REVIEW_ORIGIN ?? "http://127.0.0.1:5191";
const output = resolve(process.env.ICON_REPORT_DIR ?? ".codex/reports/icon-unification/finder-loading");
const axeFile = resolve(dirname(process.env.PLAYWRIGHT_CORE_PATH), "axe-core/axe.min.js");
const axeSource = existsSync(axeFile) ? await readFile(axeFile, "utf8") : null;
await mkdir(output, { recursive: true });
const manifest = JSON.parse(await readFile(resolve(snapshot, process.env.NEXT_DIST_DIR ?? ".next-build", "react-loadable-manifest.json"), "utf8"));
const entries = Object.entries(manifest).filter(([name]) => name.endsWith("-> ./DesktopTools"));
assert.equal(entries.length, 1, "Find and Settings have one shared optional loader");
const scripts = entries[0][1].files.filter(file => file.endsWith(".js"));
assert.equal(scripts.length, 1, "Interception must target the actual shared loader chunk");
const chunkPath = `/_next/${scripts[0]}`;
const report = { origin, snapshot, chunkPath, started: new Date().toISOString(), tests: [] };
const browser = await pw.chromium.launch({ headless: true, args: ["--no-sandbox"] });
report.version = browser.version();
try {
  for (const { locale, width } of [{ locale: "en-gb", width: 1440 }, { locale: "zh-tw", width: 320 }]) {
    for (const mode of ["pending", "failed"]) for (const exit of ["escape", "button"]) {
      const context = await browser.newContext({ viewport: { width, height: width === 320 ? 568 : 1000 }, bypassCSP: true });
      const page = await context.newPage(); page.setDefaultTimeout(30000);
      const test = { locale, width, mode, exit, requests: 0, pageErrors: [] }; report.tests.push(test);
      page.on("pageerror", error => test.pageErrors.push(error.stack));
      let release, started;
      const hold = new Promise(done => { release = done; });
      const requested = new Promise(done => { started = done; });
      await page.route(`**${chunkPath}`, async route => {
        test.requests++; started();
        if (mode === "pending") { await hold; await route.continue(); }
        else await route.fulfill({ status: 503, contentType: "application/javascript", body: "/* simulated unavailable optional Find/Settings chunk */" });
      });
      try {
        await page.goto(`${origin}/${locale}/desk`);
        await page.waitForFunction(() => document.documentElement.dataset.reduceEffects !== undefined);
        if (width === 320) await page.getByRole("button", { name: /^(Got it|知道了|明白了|了解了)$/ }).click();
        await page.locator('[data-app-id="desk"] .classic-module-loading').waitFor({ state: "hidden" });
        assert.equal(test.requests, 0, "Shared tools are not loaded by the initial desk entry");
        const launcher = page.locator(".apple-menu");
        await launcher.click();
        await page.locator(".apple-dropdown").getByRole("menuitem", { name: /^(Find…|查找…|尋找…)$/ }).click();
        let requestTimer;
        try {
          await Promise.race([requested, new Promise((_, reject) => { requestTimer = setTimeout(() => reject(new Error("Shared chunk was never requested")), 30000); })]);
        } finally { clearTimeout(requestTimer); }
        await page.waitForFunction(() => document.querySelector(".desktop-window-layer")?.inert === true);
        assert.equal(await page.locator('dialog[aria-labelledby="finder-title"][open]').count(), 0, "Native Find has not mounted before the requested chunk resolves");
        const dialog = page.locator(`dialog[data-finder-state="${mode === "pending" ? "loading" : "failed"}"][open]`);
        await dialog.waitFor();
        if (axeSource) {
          await page.addScriptTag({ content: axeSource });
          test.accessibility = await page.evaluate(async state => {
            const result = await window.axe.run(document.querySelector(`dialog[data-finder-state="${state}"][open]`));
            return { version: window.axe.version, violations: result.violations, incomplete: result.incomplete, passedRules: result.passes.length };
          }, mode === "pending" ? "loading" : "failed");
          assert.equal(test.accessibility.violations.length, 0, `Default axe rules: ${mode} ${locale} dialog`);
        }
        if (exit === "escape") await page.keyboard.press("Escape");
        else await dialog.getByRole("button", { name: /^(Close Find|關閉尋找視窗)$/ }).click();
        try {
          await page.waitForFunction(() => document.querySelector(".desktop-window-layer")?.inert === false && document.activeElement === document.querySelector(".apple-menu"), null, { timeout: 5000 });
        } catch (error) {
          test.failureState = await page.evaluate(() => ({ active: { tag: document.activeElement?.tagName, id: document.activeElement?.id, class: document.activeElement?.className }, inert: document.querySelector(".desktop-window-layer")?.inert, dialogs: [...document.querySelectorAll("dialog")].map(dialog => ({ open: dialog.open, state: dialog.dataset.finderState })) }));
          await page.screenshot({ path: resolve(output, `lazy-find-${locale}-${mode}-${exit}-failure.png`) });
          throw error;
        }
        assert.equal(await page.locator("dialog[data-finder-state]").count(), 0, "Dismissal removes the failed or pending Find surface");
        assert.equal(await page.locator(".apple-menu").getAttribute("aria-expanded"), "false", "Menu remains closed after focus returns");
        if (mode === "pending") {
          const response = page.waitForResponse(response => new URL(response.url()).pathname === chunkPath && response.status() === 200);
          release(); await response;
          await page.evaluate(() => new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done))));
          assert.equal(await page.locator('dialog[aria-labelledby="finder-title"][open]').count(), 0, "Late optional chunk arrival does not reopen dismissed Find");
          assert.equal(await launcher.evaluate(element => element === document.activeElement), true, "Late chunk does not steal restored focus");
          await page.keyboard.press("Control+k");
          await page.locator("dialog[open] #finder-search").waitFor();
          await page.keyboard.press("Escape");
          await page.waitForFunction(() => !document.querySelector("dialog[open]") && document.activeElement === document.querySelector(".apple-menu"));
          assert.equal(test.pageErrors.length, 0, "Holding a real chunk produces no browser errors");
        } else {
          assert.ok(test.pageErrors.every(error => /ChunkLoadError|Loading chunk|load chunk|Failed to fetch/i.test(error)), "Only the deliberately blocked chunk may report an error");
        }
        await launcher.click();
        assert.equal(await page.locator(".apple-dropdown").isVisible(), true, "The normal desktop menu remains usable after dismissal");
        await page.keyboard.press("Escape");
        test.passed = true;
        console.log(`PASS lazy Find ${mode}/${exit} ${locale} ${width}: real chunk requests=${test.requests}; dismissal restores launcher focus and desktop access`);
      } finally {
        release();
        await context.close();
        await writeFile(resolve(output, "lazy-finder.json"), `${JSON.stringify(report, null, 2)}\n`);
      }
    }
  }
  report.finished = new Date().toISOString();
} finally {
  await browser.close();
  await writeFile(resolve(output, "lazy-finder.json"), `${JSON.stringify(report, null, 2)}\n`);
}
