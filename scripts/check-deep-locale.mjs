// Observe bootstrap language mutations as well as the eventual React locale.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
const require = createRequire(import.meta.url);
if (!process.env.PLAYWRIGHT_CORE_PATH) throw new Error('Set PLAYWRIGHT_CORE_PATH to external Playwright.');
const pw = require(process.env.PLAYWRIGHT_CORE_PATH);
const engine = process.env.BROWSER_ENGINE ?? 'chromium';
const origin = process.env.REVIEW_ORIGIN ?? 'http://127.0.0.1:5189';
const valid = ['en-GB', 'en-US', 'zh-CN', 'zh-TW'];
const report = { engine, version: null, started: new Date().toISOString(), tests: [], pageErrors: [] };
const browser = await pw[engine].launch({ headless: true, ...(engine === 'chromium' ? { args: ['--no-sandbox'] } : {}) });
report.version = browser.version();
const jobs = ['constructor', '__proto__', 'toString'].flatMap(poison => [
  { name: `invalid query falls back to valid stored locale: ${poison}`, route: `/about?lang=${encodeURIComponent(poison)}`, stored: 'zh-TW', expected: 'zh-TW' },
  { name: `valid query precedes invalid stored locale: ${poison}`, route: '/about?lang=zh-cn', stored: poison, expected: 'zh-CN' },
  { name: `invalid stored locale falls back to UK: ${poison}`, route: '/about', stored: poison, expected: 'en-GB' },
  { name: `valid route precedes both poisoned inputs: ${poison}`, route: `/en-us/about?lang=${encodeURIComponent(poison)}`, stored: poison, expected: 'en-US' },
]).filter(job => !process.env.LOCALE_PATTERN || new RegExp(process.env.LOCALE_PATTERN).test(job.name));
assert.ok(jobs.length > 0);
try {
  for (const job of jobs) {
    const c = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    await c.addInitScript(stored => {
      localStorage.setItem('samuel-system7-locale', stored);
      window.__localeTrace = [];
      // Old attribute values retain intermediate mutations even if bootstrap
      // and hydration both run before this observer's callback is delivered.
      const observer = new MutationObserver(records => {
        for (const record of records) {
          if (record.target !== document.documentElement) continue;
          if (record.oldValue) window.__localeTrace.push({ attribute: record.attributeName, value: record.oldValue });
          const value = record.target.getAttribute(record.attributeName);
          if (value) window.__localeTrace.push({ attribute: record.attributeName, value });
        }
      });
      observer.observe(document, { subtree: true, attributes: true, attributeOldValue: true, attributeFilter: ['lang', 'data-locale'] });
    }, job.stored);
    const p = await c.newPage(); p.setDefaultTimeout(20000);
    p.on('pageerror', error => report.pageErrors.push({ name: job.name, message: error.message }));
    const entry = { name: job.name, expected: job.expected };
    try {
      const response = await p.goto(`${origin}${job.route}`); assert.equal(response.status(), 200);
      await p.waitForFunction(expected => document.documentElement.dataset.reduceEffects !== undefined
        && document.documentElement.lang === expected
        && document.querySelector('main[data-locale]')?.getAttribute('data-locale') === expected, job.expected);
      entry.trace = await p.evaluate(() => window.__localeTrace);
      assert.ok(entry.trace.length > 0, 'The observer captured bootstrap/hydration language mutations');
      assert.ok(entry.trace.every(mutation => valid.includes(mutation.value)), `Every language mutation is supported: ${JSON.stringify(entry.trace)}`);
      assert.equal(await p.evaluate(() => document.documentElement.dataset.locale), job.expected);
      entry.result = 'PASS'; console.log(`PASS ${engine}: ${job.name}`);
    } catch (error) { entry.result = 'FAIL'; entry.error = error.stack; console.log(`FAIL ${engine}: ${job.name}: ${error.message}`); }
    finally { await c.close(); report.tests.push(entry); }
  }
} finally {
  report.finished = new Date().toISOString(); await mkdir('.codex/reports/deep-audit', { recursive: true });
  await writeFile(`.codex/reports/deep-audit/locale-${engine}${process.env.REVIEW_REPORT_SUFFIX ?? ''}.json`, JSON.stringify(report, null, 2));
  await browser.close();
}
if (report.pageErrors.length || report.tests.some(test => test.result !== 'PASS')) process.exitCode = 1;
