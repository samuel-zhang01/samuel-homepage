// Compiled regressions for phone window navigation and startup image preparation.
// External Playwright only; this test does not add browser tools to the app.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const require = createRequire(import.meta.url);
assert.ok(process.env.PLAYWRIGHT_CORE_PATH, "Provide an external Playwright installation.");
const pw = require(process.env.PLAYWRIGHT_CORE_PATH);
const origin = process.env.REVIEW_ORIGIN ?? "http://127.0.0.1:5187";
const output = resolve(process.env.MOBILE_NAV_REPORT_DIR ?? ".codex/reports/mobile-navigation");
const engines = (process.env.BROWSER_ENGINES ?? "chromium,webkit").split(",");
const locales = (process.env.MOBILE_NAV_LOCALES ?? "en-gb,en-us,zh-cn,zh-tw").split(",");
const widths = (process.env.MOBILE_NAV_WIDTHS ?? "320,390").split(",").map(Number);
const destinations = [
  ["experience", "briefcase"], ["projects", "folder"], ["documents", "pdf"],
  ["contact", "mail"], ["settings", "controls"], ["education", "university"],
  ["lab", "network"], ["scrapbook", "photos"], ["games", "game"],
  ["coverd", "coverd"], ["sidequest", "runner"],
];
await mkdir(output, { recursive: true });
const report = { origin, started: new Date().toISOString(), navigation: [], loading: [], qualifications: ["Viewport emulation does not qualify physical-phone input or field performance."] };
const save = () => writeFile(resolve(output, "results.json"), JSON.stringify(report, null, 2) + "\n");
async function selectedVisible(page, id) {
  await page.waitForFunction(app => {
    const active = document.querySelector(".mac-window.is-active");
    const dock = document.querySelector(".window-switcher");
    const selected = dock?.querySelector('[aria-current="page"]');
    if (active?.getAttribute("data-app-id") !== app || !selected) return false;
    const target = selected.getBoundingClientRect(), bounds = dock.getBoundingClientRect();
    return target.width > 0 && target.left >= bounds.left - 1 && target.right <= bounds.right + 1;
  }, id);
}
for (const engine of engines) {
  const browser = await pw[engine].launch({ headless: true, ...(engine === "chromium" ? { args: ["--no-sandbox"] } : {}) });
  try {
    for (const locale of locales) for (const width of widths) {
      const context = await browser.newContext({ viewport: { width, height: width === 320 ? 568 : 844 }, isMobile: engine !== "firefox", hasTouch: true, reducedMotion: "reduce" });
      await context.addInitScript(() => { sessionStorage.setItem("samuel-system7-boot", "seen"); sessionStorage.setItem("samuel-mobile-window-guide", "seen"); });
      const page = await context.newPage();
      const entry = { engine, version: browser.version(), locale, width, checks: [], pageErrors: [] };
      report.navigation.push(entry);
      page.on("pageerror", error => entry.pageErrors.push(error.message));
      try {
        await page.goto(`${origin}/${locale}/about`);
        await selectedVisible(page, "about");
        assert.equal(await page.locator(".desktop-icons img").count(), 0, "Covered phone launchers do not request artwork.");
        for (const [id, icon] of destinations) {
          await page.locator(".apple-menu").click();
          await page.locator('.apple-dropdown [role="menuitem"]').filter({ has: page.locator(`[data-system7-frame="${icon}"]`) }).first().click();
          await selectedVisible(page, id);
          assert.equal(await page.locator('.window-switcher [aria-current="page"]').count(), 1);
        }
        assert.equal(await page.locator(".window-switcher button").count(), 12);
        entry.checks.push("1/3/6/12 open windows reveal and identify the current destination");
        await page.screenshot({ path: resolve(output, `${engine}-${locale}-${width}-dock.png`) });
        const first = page.locator(".window-switcher button").filter({ has: page.locator('[data-system7-frame="profile"]') });
        await first.click(); await selectedVisible(page, "about");
        const last = page.locator(".window-switcher button").filter({ has: page.locator('[data-system7-frame="runner"]') });
        await last.click(); await selectedVisible(page, "sidequest");
        await page.locator(".window-switcher").evaluate(dock => { dock.scrollLeft = 0; });
        await page.setViewportSize({ width: width === 320 ? 390 : 320, height: 650 });
        await selectedVisible(page, "sidequest");
        entry.checks.push("switching and viewport resizing reveal the active item");
        while (await page.locator(".mac-window").count()) {
          await page.locator(".mac-window.is-active .window-close").click();
          await page.evaluate(() => new Promise(done => requestAnimationFrame(done)));
        }
        await page.waitForFunction(() => document.activeElement === document.querySelector(".apple-menu"));
        assert.equal(await page.locator(".desktop-icon").count(), 13);
        assert.equal(await page.locator(".desktop-icons").evaluate(node => node.inert), false);
        await page.locator(".apple-menu").click();
        await page.locator('.apple-dropdown [role="menuitem"]').filter({ has: page.locator('[data-system7-frame="folder"]') }).click();
        await selectedVisible(page, "projects");
        entry.checks.push("close-last restores visible Menu focus and the desktop remains usable");
        assert.deepEqual(entry.pageErrors, []);
        entry.passed = true;
        console.log(`PASS navigation ${engine} ${locale} ${width}`);
      } catch (error) {
        entry.error = error.stack;
        await page.screenshot({ path: resolve(output, `${engine}-${locale}-${width}-failed.png`) }).catch(() => {});
        throw error;
      } finally { await context.close(); await save(); }
    }
    if (engine !== "chromium" || process.env.MOBILE_NAV_SKIP_LOADING) continue;
    for (const scenario of [{ route: "", boot: true }, { route: "about", boot: false }, { route: "projects", boot: false }, { route: "projects", boot: true, restart: true }]) {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
      await context.addInitScript(boot => {
        sessionStorage.setItem("samuel-mobile-window-guide", "seen");
        if (!boot) sessionStorage.setItem("samuel-system7-boot", "seen");
        window.__startupReveal = null;
        let seen = false;
        new MutationObserver(() => {
          if (document.querySelector(".boot-screen")) seen = true;
          else if (seen && window.__startupReveal === null) window.__startupReveal = performance.now();
        }).observe(document, { childList: true, subtree: true });
      }, scenario.boot);
      const page = await context.newPage(); const entry = { ...scenario, pageErrors: [] }; report.loading.push(entry);
      page.on("pageerror", error => entry.pageErrors.push(error.message));
      try {
        await page.goto(`${origin}/en-gb/${scenario.route}`);
        if (scenario.restart) {
          await page.locator('[data-app-id="projects"] .classic-module-loading').waitFor({ state: "hidden" });
          await page.locator(".apple-menu").click();
          await page.locator(".apple-dropdown").getByRole("menuitem", { name: "Restart…", exact: true }).click();
        }
        if (scenario.boot) {
          await page.locator(".boot-screen").waitFor();
          assert.ok((await page.locator(".boot-screen button").boundingBox()).height >= 44);
          await page.locator(".boot-screen").waitFor({ state: "hidden" });
        }
        const app = scenario.route === "projects" && !scenario.restart ? "projects" : "about";
        await page.locator(`[data-app-id="${app}"]`).waitFor();
        await page.waitForFunction(app => {
          const root = document.querySelector(`[data-app-id="${app}"]`);
          const visible = [...root.querySelectorAll('[data-system7-frame], .portrait-frame')].filter(node => {
            const r = node.getBoundingClientRect();
            if (!r.width || !r.height || r.top >= innerHeight || r.bottom <= 0) return false;
            const pane = node.closest(".mac-window__content"); const clip = pane.getBoundingClientRect();
            return r.top < clip.bottom && r.bottom > clip.top;
          });
          return visible.length > 0 && visible.every(node => { const image = node.querySelector("img"); return image?.complete && image.naturalWidth > 0; });
        }, app);
        await page.waitForTimeout(700);
        entry.measured = await page.evaluate(() => ({ reveal: window.__startupReveal, resources: performance.getEntriesByType("resource").map(r => ({ url: r.name, start: r.startTime, transfer: r.transferSize, encoded: r.encodedBodySize, type: r.initiatorType })) }));
        entry.resourceBytes = entry.measured.resources.reduce((sum, r) => sum + r.transfer, 0);
        entry.imageBytes = entry.measured.resources.filter(r => r.type === "img").reduce((sum, r) => sum + r.encoded, 0);
        if (!scenario.restart) assert.ok(entry.resourceBytes < (app === "about" ? 2 : 4) * 1024 * 1024, "Phone first-screen resources remain within the explicit route budget.");
        assert.equal(await page.locator(".desktop-icons img").count(), 0);
        if (scenario.boot) {
          const profile = entry.measured.resources.find(r => new URL(r.url).pathname === "/system7-icons/profile.png");
          const portrait = entry.measured.resources.find(r => new URL(r.url).searchParams.get("url") === "/headshot.jpg");
          assert.ok(entry.measured.reveal && profile?.start < entry.measured.reveal && portrait?.start < entry.measured.reveal, "The anticipation interval prepares actual first-screen images.");
        }
        assert.deepEqual(entry.pageErrors, []); entry.passed = true;
        await page.screenshot({ path: resolve(output, `loading-${scenario.restart ? "restart" : scenario.route || "startup"}.png`) });
        console.log(`PASS phone loading ${scenario.restart ? "restart" : scenario.route || "startup"}: ${(entry.resourceBytes / 1024).toFixed(1)} KiB resources`);
      } finally { await context.close(); await save(); }
    }
  } finally { await browser.close(); }
}
report.finished = new Date().toISOString(); await save();
