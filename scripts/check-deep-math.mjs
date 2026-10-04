// Actual overflowing equation journeys: explicit focus and native ArrowRight pan.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
const require = createRequire(import.meta.url);
if (!process.env.PLAYWRIGHT_CORE_PATH) throw new Error('Set PLAYWRIGHT_CORE_PATH to external Playwright.');
const pw = require(process.env.PLAYWRIGHT_CORE_PATH);
const engine = process.env.BROWSER_ENGINE ?? 'chromium';
const origin = process.env.REVIEW_ORIGIN ?? 'http://127.0.0.1:5186';
const report = { engine, version: null, origin, started: new Date().toISOString(), visits: [], pageErrors: [] };
const browser = await pw[engine].launch({ headless: true, ...(engine === 'chromium' ? { args: ['--no-sandbox'] } : {}) });
report.version = browser.version();
const cases = [
  { locale: 'en-gb', width: 1440, slug: 'cv-keyword-automator' },
  ...['cv-keyword-automator', 'regularisation-lab', 'safety-critical-ai', 'safe-learning-to-defer', 'pc-saft-thermodynamics', 'stock-market-engine', 'coding-series'].map(slug => ({ locale: 'zh-tw', width: 320, slug })),
];
try {
  for (const job of cases) {
    const c = await browser.newContext({ viewport: { width: job.width, height: job.width === 320 ? 568 : 1000 } });
    const p = await c.newPage(); p.setDefaultTimeout(20000);
    p.on('pageerror', error => report.pageErrors.push({ ...job, message: error.message }));
    const entry = { ...job, equations: [] };
    try {
      await p.goto(`${origin}/${job.locale}/projects?project=${job.slug}`);
      await p.waitForFunction(() => document.documentElement.dataset.reduceEffects !== undefined);
      await p.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const guide = p.getByRole('button', { name: /^(Got it|知道了)$/ });
      // A fresh narrow-screen context always shows the guide after boot finishes.
      // Waiting for it avoids a late guide intercepting the demo-launch click.
      if (job.width === 320) { await guide.click(); await guide.waitFor({ state: 'hidden' }); }
      await p.locator('[data-app-id="project"]').getByRole('button', { name: job.locale === 'en-gb' ? 'Open interactive demo' : '開啟互動示範', exact: false }).first().click();
      const demo = p.locator('[data-app-id="projectActivity"]'); await demo.locator('[data-math-equation]').first().waitFor();
      await p.evaluate(() => document.fonts.ready);
      await p.waitForFunction(() => [...document.querySelectorAll('[data-app-id="projectActivity"] [data-math-equation]')].filter(e => e.clientWidth > 0).every(e => (e.scrollWidth > e.clientWidth + 1) === (e.tabIndex === 0)));
      for (const equation of await demo.locator('[data-math-equation]').all()) {
        if (!await equation.isVisible()) continue;
        const dimensions = await equation.evaluate(element => ({ content: element.scrollWidth, viewport: element.clientWidth, tabIndex: element.tabIndex, overflowX: getComputedStyle(element).overflowX }));
        if (dimensions.overflowX !== 'auto') {
          // Firefox reports inline text's scrollWidth with clientWidth zero.
          // Such text is not an independently scrollable display region.
          assert.equal(dimensions.tabIndex, -1, 'Inline math does not add a tab stop');
        } else if (dimensions.content > dimensions.viewport + 1) {
          assert.equal(dimensions.tabIndex, 0);
          await equation.scrollIntoViewIfNeeded(); await equation.focus();
          assert.equal(await equation.evaluate(element => document.activeElement === element), true);
          await equation.evaluate(element => { element.scrollLeft = 0; });
          await p.keyboard.press('ArrowRight');
          await p.waitForFunction(element => element.scrollLeft > 0, await equation.elementHandle());
          dimensions.keyboardScroll = await equation.evaluate(element => element.scrollLeft);
          assert.ok(dimensions.keyboardScroll > 0);
        } else assert.equal(dimensions.tabIndex, -1, 'A fitting equation does not add a tab stop');
        entry.equations.push(dimensions);
      }
      assert.ok(entry.equations.length > 0, 'The demo renders equations');
      // Engine font metrics can make the EN desktop CV equation fit. Its absence
      // of a tab stop is then the required behavior; every narrow fixture overflows.
      if (job.width === 320) assert.ok(entry.equations.some(equation => equation.keyboardScroll > 0), 'The narrow demo contains a keyboard-panned equation');
      if (job.slug === 'stock-market-engine') assert.equal(await demo.locator('article[data-tone="amber"] > small').evaluate(element => element.scrollWidth <= element.clientWidth + 1), true, 'Metric detail wraps without a separate scroll-only text region');
      if (job.width === 320 && job.slug === 'cv-keyword-automator') {
        const equation = demo.locator('[data-math-equation]').first();
        const narrowWidth = await equation.evaluate(element => element.clientWidth);
        entry.viewportResize = [];
        for (const viewport of [{ width: 1440, height: 1000 }, { width: 320, height: 568 }]) {
          await p.setViewportSize(viewport);
          await p.waitForFunction(({ element, narrowWidth, wide }) =>
            (wide ? element.clientWidth > narrowWidth : element.clientWidth === narrowWidth)
            && (element.scrollWidth > element.clientWidth + 1) === (element.tabIndex === 0),
          { element: await equation.elementHandle(), narrowWidth, wide: viewport.width === 1440 });
          entry.viewportResize.push(await equation.evaluate(element => ({ content: element.scrollWidth, viewport: element.clientWidth, tabIndex: element.tabIndex })));
        }
      }
      entry.result = 'PASS'; console.log(`PASS ${engine} equation pan ${job.slug} ${job.width}`);
    } catch (error) { entry.result = 'FAIL'; entry.error = error.stack; console.log(`FAIL ${engine} ${job.slug}: ${error.message}`); }
    finally { await c.close(); report.visits.push(entry); }
  }
} finally {
  report.finished = new Date().toISOString(); await mkdir('.codex/reports/deep-audit', { recursive: true });
  await writeFile(`.codex/reports/deep-audit/math-${engine}${process.env.REVIEW_REPORT_SUFFIX ?? ''}.json`, JSON.stringify(report, null, 2));
  await browser.close();
}
if (report.pageErrors.length || report.visits.some(visit => visit.result !== 'PASS')) process.exitCode = 1;
