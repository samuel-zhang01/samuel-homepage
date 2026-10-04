// Isolated browser checks. No existing browser/profile or desk data is touched.
// PLAYWRIGHT_CORE_PATH=<installation> BROWSER_EXECUTABLE_PATH=/usr/bin/chromium
// REVIEW_ORIGIN=http://127.0.0.1:5186 node scripts/check-app-improvements.mjs
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";

const require = createRequire(import.meta.url);
if (!process.env.PLAYWRIGHT_CORE_PATH) throw new Error("Set PLAYWRIGHT_CORE_PATH to an installed Playwright package.");
const playwright = require(process.env.PLAYWRIGHT_CORE_PATH);
const engine = process.env.BROWSER_ENGINE ?? "chromium";
const browser = await playwright[engine].launch({ headless: true, ...(engine === "chromium" ? { executablePath: process.env.BROWSER_EXECUTABLE_PATH, args: ["--no-sandbox"] } : {}) });
const origin = process.env.REVIEW_ORIGIN ?? "http://127.0.0.1:5186";
const output = process.env.REVIEW_SCREENSHOT_DIR ?? "/tmp/homepage-app-improvements";
await mkdir(output, { recursive: true });
let checks = 0;
const contexts = [];
const unexpectedErrors = [];
const report = { engine, version: browser.version(), origin, started: new Date().toISOString(), tests: [], unexpectedErrors };
async function context(options = {}) { const c = await browser.newContext(options); contexts.push(c); return c; }
async function page(c, path = "/en-gb/settings") {
  const p = await c.newPage(); p.setDefaultTimeout(30000);
  p.on("pageerror", error => unexpectedErrors.push(error.message));
  await p.goto(`${origin}${path}`, { timeout: 60000 });
  await p.waitForFunction(() => document.documentElement.dataset.reduceEffects !== undefined);
  await p.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  return p;
}
const settings = p => p.locator('[data-app-id="settings"]');
async function dismissGuide(p) { await p.waitForFunction(() => document.documentElement.dataset.reduceEffects !== undefined); await p.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))); const b = p.getByRole("button", { name: /^(Got it|知道了|明白了|了解了)$/ }); if (await b.count()) await b.click(); }
async function check(name, run) {
  if (process.env.REVIEW_GROUP && !new RegExp(process.env.REVIEW_GROUP).test(name)) return;
  try {
    await run(); checks++; report.tests.push({ name, result: "PASS" }); console.log(`PASS ${name}`);
  } catch (error) {
    report.tests.push({ name, result: "FAIL", error: error.stack }); throw error;
  }
}
async function noOverflow(p) {
  assert.equal(await p.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1), false, "No document horizontal overflow");
  const bounds = await settings(p).locator('.mac-window__content').evaluate(e => ({ scroll: e.scrollWidth, width: e.clientWidth }));
  assert.ok(bounds.scroll <= bounds.width + 1, `Settings content overflow: ${JSON.stringify(bounds)}`);
}
try {
  await check("four locales and narrow, desktop, landscape settings routes", async () => {
    for (const [slug, language, heading] of [["en-gb", "en-GB", "Make this desktop yours."], ["en-us", "en-US", "Make this desktop yours."], ["zh-cn", "zh-CN", "按你的习惯设置桌面。"], ["zh-tw", "zh-TW", "依照你的習慣設定桌面。"]]) {
      const c = await context();
      for (const size of [{ width: 1440, height: 1000 }, { width: 320, height: 568 }, { width: 390, height: 844 }, { width: 844, height: 390 }]) {
        const p = await page(c); await p.setViewportSize(size); await p.goto(`${origin}/${slug}/settings`);
        await settings(p).getByRole("heading", { name: heading, exact: true }).waitFor();
        await dismissGuide(p);
        assert.equal(await p.locator("html").getAttribute("lang"), language);
        await noOverflow(p);
        await p.screenshot({ path: `${output}/${slug}-${size.width}.png` });
        await p.close();
      }
    }
  });
  await check("main menu and Find expose settings on a fresh phone", async () => {
    const c = await context({ viewport: { width: 320, height: 568 } });
    const p = await page(c, "/en-gb/desk");
    const guide = p.getByRole("dialog", { name: "How to get around" });
    await guide.waitFor();
    assert.equal(await p.locator(".system-menubar").getAttribute("inert"), "");
    await p.keyboard.press("Tab");
    assert.equal(await p.getByRole("button", { name: "Got it", exact: true }).evaluate(e => e === document.activeElement), true);
    await p.getByRole("button", { name: "Got it", exact: true }).click();
    await p.getByRole("button", { name: "Samuel menu", exact: true }).click();
    await p.getByRole("menuitem", { name: "Settings", exact: true }).click();
    await settings(p).getByRole("heading", { name: "Make this desktop yours.", exact: true }).waitFor();
    assert.equal(new URL(p.url()).pathname, "/en-gb/settings");
    await p.keyboard.press("Control+k");
    const finder = p.getByRole("dialog", { name: "Find…" });
    await finder.getByRole("combobox").fill("settings");
    await finder.getByRole("option", { name: /Settings/ }).waitFor();
    await p.keyboard.press("Enter");
    await finder.waitFor({ state: "hidden" });
    await settings(p).getByRole("heading").first().waitFor();
  });
  await check("three original patterns, controls, reload and cross-tab preferences", async () => {
    const c = await context({ viewport: { width: 1440, height: 1000 } });
    const a = await page(c), b = await page(c);
    for (const pattern of ["Blue", "Paper", "Classic"]) {
      await settings(a).getByRole("radio", { name: pattern, exact: true }).check();
      await b.locator(`.system-desktop.desktop-pattern--${pattern.toLowerCase()}`).waitFor();
      assert.equal(await settings(b).getByRole("radio", { name: pattern, exact: true }).isChecked(), true);
    }
    // The existing View menu and new Settings must share one persisted value.
    await a.getByRole("button", { name: "View", exact: true }).click();
    await a.getByRole("menuitemradio", { name: "Paper Pattern", exact: true }).click();
    await settings(a).getByRole("radio", { name: "Paper", exact: true, checked: true }).waitFor();
    await settings(b).getByRole("radio", { name: "Paper", exact: true, checked: true }).waitFor();
    await settings(a).getByRole("radio", { name: "12-hour", exact: true }).check();
    await settings(a).getByRole("checkbox", { name: "Reduce interface effects", exact: true }).check();
    await b.waitForFunction(() => document.documentElement.dataset.reduceEffects === "true");
    await settings(a).getByRole("checkbox", { name: "Show the startup sequence", exact: true }).uncheck();
    assert.equal(await a.evaluate(() => JSON.parse(localStorage.getItem("samuel-system7-preferences-v1")).clockFormat), "12h");
    await a.reload();
    await settings(a).getByRole("radio", { name: "12-hour", exact: true, checked: true }).waitFor();
    assert.equal(await settings(a).getByRole("radio", { name: "12-hour", exact: true }).isChecked(), true);
    assert.equal(await settings(a).getByRole("checkbox", { name: "Show the startup sequence", exact: true }).isChecked(), false);
    await a.waitForFunction(() => /am|pm/i.test(document.querySelector(".menu-clock")?.textContent ?? ""));
    await a.evaluate(() => sessionStorage.clear());
    await a.goto(`${origin}/en-gb`);
    await a.locator(".system-desktop").waitFor();
    assert.equal(await a.locator(".boot-screen").count(), 0);
  });
  await check("reset preserves language and desk data; language change keeps keyboard focus", async () => {
    const c = await context(); const p = await page(c, "/en-gb/desk");
    await p.locator('[data-app-id="desk"]').getByRole("button", { name: /^Open Note Pad\./ }).click();
    const note = p.locator('[data-app-id="notepad"]');
    await note.getByText("Saved on this browser", { exact: true }).waitFor();
    await note.locator("textarea").fill("EXISTING DESK DATA");
    await p.waitForFunction(() => JSON.parse(localStorage.getItem("samuel-system7-notepad-v1") ?? "null")?.pages?.[0] === "EXISTING DESK DATA");
    const savedNote = await p.evaluate(() => localStorage.getItem("samuel-system7-notepad-v1"));
    await p.getByRole("button", { name: "Samuel menu", exact: true }).click();
    await p.getByRole("menuitem", { name: "Settings", exact: true }).click();
    await settings(p).getByRole("radio", { name: "Blue", exact: true }).check();
    const localeRadio = settings(p).getByRole("radio", { name: "English (US)", exact: true });
    await localeRadio.focus(); await p.keyboard.press("Space");
    assert.equal(new URL(p.url()).pathname, "/en-us/settings");
    assert.equal(await localeRadio.evaluate(e => document.activeElement === e), true);
    await settings(p).getByRole("button", { name: "Reset display settings", exact: true }).click();
    assert.equal(await settings(p).getByRole("radio", { name: "Classic", exact: true }).isChecked(), true);
    assert.equal(await localeRadio.isChecked(), true);
    assert.equal(await p.evaluate(() => localStorage.getItem("samuel-system7-notepad-v1")), savedNote);
    await settings(p).getByRole("button", { name: "Open desk backup tools", exact: true }).click();
    await p.locator('[data-app-id="desk"]').waitFor();
    assert.equal(new URL(p.url()).pathname, "/en-us/desk");
  });
  await check("invalid preference schema and old theme key recover safely", async () => {
    const c = await context();
    await c.addInitScript(() => { localStorage.setItem("samuel-system7-preferences-v1", '{"clockFormat":"invalid","showStartup":"false","reduceEffects":"true"}'); localStorage.setItem("samuel-system7-pattern", "paper"); });
    const p = await page(c);
    await settings(p).getByRole("radio", { name: "Paper", exact: true, checked: true }).waitFor();
    assert.equal(await settings(p).getByRole("radio", { name: "Paper", exact: true }).isChecked(), true);
    assert.equal(await settings(p).getByRole("radio", { name: "24-hour", exact: true }).isChecked(), true);
    assert.equal(await settings(p).getByRole("checkbox", { name: "Reduce interface effects", exact: true }).isChecked(), false);
    assert.equal(await settings(p).getByRole("checkbox", { name: "Show the startup sequence", exact: true }).isChecked(), true);
    await p.evaluate(() => localStorage.setItem("samuel-system7-preferences-v1", "{broken"));
    await p.evaluate(() => window.dispatchEvent(new StorageEvent("storage", { key: "samuel-system7-preferences-v1" })));
    assert.equal(await settings(p).getByRole("radio", { name: "24-hour", exact: true }).isChecked(), true);
  });
  await check("blocked storage and quota failures keep successive session choices", async () => {
    for (const failure of ["getter", "quota"]) {
      const c = await context();
      await c.addInitScript(failure => {
        if (failure === "getter") Object.defineProperty(window, "localStorage", { get() { throw new DOMException("Blocked", "SecurityError"); } });
        else Storage.prototype.setItem = function() { throw new DOMException("Full", "QuotaExceededError"); };
      }, failure);
      const p = await page(c);
      await settings(p).getByRole("radio", { name: "Blue", exact: true }).check();
      await settings(p).getByRole("radio", { name: "12-hour", exact: true }).check();
      await settings(p).getByRole("checkbox", { name: "Reduce interface effects", exact: true }).check();
      assert.equal(await settings(p).getByRole("radio", { name: "Blue", exact: true }).isChecked(), true);
      assert.equal(await settings(p).getByRole("radio", { name: "12-hour", exact: true }).isChecked(), true);
      await settings(p).getByText("Browser storage is unavailable. These settings apply for this visit only.", { exact: true }).waitFor();
    }
  });
  await check("device reduced motion overrides normal interface settings", async () => {
    const c = await context({ reducedMotion: "reduce" }); const p = await page(c);
    assert.equal(await settings(p).getByRole("checkbox", { name: "Reduce interface effects", exact: true }).isChecked(), false);
    const duration = await settings(p).getByRole("button", { name: "Reset display settings", exact: true }).evaluate(e => getComputedStyle(e).transitionDuration);
    assert.ok(duration && duration.split(",").every(value => Number.parseFloat(value) <= 0.000001), `Reduced-motion transition duration: ${duration}`);
  });
  assert.deepEqual(unexpectedErrors, [], "No unexpected browser runtime errors");
  console.log(`${checks} app-improvement groups passed on ${engine} ${browser.version()}. Screenshots: ${output}`);
} finally {
  report.finished = new Date().toISOString();
  await mkdir(".codex/reports/app-audit", { recursive: true });
  await writeFile(`.codex/reports/app-audit/preferences-${engine}${process.env.REVIEW_REPORT_SUFFIX ?? ""}${process.env.REVIEW_GROUP ? "-focused" : ""}.json`, JSON.stringify(report, null, 2));
  for (const c of contexts) await c.close();
  await browser.close();
}
