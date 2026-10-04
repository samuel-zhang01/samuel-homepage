// Native history regression against a compiled, immutable production preview.
// Requires REVIEW_ORIGIN and PLAYWRIGHT_CORE_PATH; BROWSER_ENGINE defaults to chromium.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
const require = createRequire(import.meta.url);
if (!process.env.PLAYWRIGHT_CORE_PATH) throw new Error('Set PLAYWRIGHT_CORE_PATH to an external Playwright installation.');
if (!process.env.REVIEW_ORIGIN) throw new Error('Set REVIEW_ORIGIN to a compiled production preview.');
const playwright = require(process.env.PLAYWRIGHT_CORE_PATH);
const origin = process.env.REVIEW_ORIGIN;
const engine = process.env.BROWSER_ENGINE ?? 'chromium';
assert.ok(['chromium', 'firefox', 'webkit'].includes(engine));
const output = '.codex/reports/history-interaction';
await mkdir(output, { recursive: true });
const reportPath = `${output}/${engine}-${new URL(origin).port || 'default'}.json`;
const browser = await playwright[engine].launch({ headless: true });
const report = { engine, version: browser.version(), origin, started: new Date().toISOString(), tests: [], pageErrors: [] };
const active = page => page.locator('[data-app-id="projects"]');
const topics = page => active(page).getByRole('navigation', { name: 'Explore a subject', exact: true });
const frame = page => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
const historySnapshot = page => page.evaluate(() => ({ url: location.pathname + location.search + location.hash, length: history.length, writes: window.__historyRegressionWrites }));
async function challenge(name, route, run) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.addInitScript(() => {
    sessionStorage.setItem('samuel-system7-boot', 'seen');
    sessionStorage.setItem('samuel-mobile-window-guide', 'seen');
    window.__historyRegressionWrites = [];
    for (const method of ['replaceState', 'pushState']) {
      const original = history[method].bind(history);
      history[method] = (...args) => {
        const before = location.pathname + location.search + location.hash;
        const target = new URL(args[2] ?? location.href, location.href);
        const address = target.pathname + target.search + target.hash;
        const entry = { method, time: performance.now(), before, address, noOp: before === address };
        window.__historyRegressionWrites.push(entry);
        try { return original(...args); }
        catch (error) { entry.error = String(error); throw error; }
      };
    }
  });
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  const result = { name, errors: [] };
  page.on('pageerror', error => { result.errors.push(error.message); report.pageErrors.push(error.message); });
  try {
    await page.goto(origin + route, { timeout: 60000 });
    await page.waitForFunction(() => document.documentElement.dataset.reduceEffects !== undefined);
    await topics(page).waitFor({ state: route.includes('map') ? 'visible' : 'hidden' });
    await frame(page);
    result.initial = await historySnapshot(page);
    await run(page, result);
    assert.deepEqual(result.errors, [], 'History gestures must not raise browser errors');
    result.result = 'PASS';
  } catch (error) {
    result.result = 'FAIL';
    result.error = error.stack;
  } finally {
    result.final = await historySnapshot(page);
    report.tests.push(result);
    await context.close();
    await writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`${result.result} ${engine}: ${name}${result.error ? `: ${result.error.split('\n')[0]}` : ''}`);
  }
}
async function expectWrites(page, result, label, count, action) {
  const before = await historySnapshot(page);
  await action();
  await frame(page);
  const after = await historySnapshot(page);
  const writes = after.writes.slice(before.writes.length);
  result.steps ??= [];
  result.steps.push({ label, writes, url: after.url });
  assert.equal(writes.length, count, `${label}: expected ${count} native history writes`);
  assert.ok(writes.every(write => write.method === 'replaceState' && !write.noOp), `${label}: selection must only replace a changed address`);
  assert.equal(after.length, before.length, `${label}: graph selection must not add a Back entry`);
}
try {
  await challenge('Changed graph selections write once; repeated selection, reset and Enter write nothing', '/en-gb/projects?view=map', async (page, result) => {
    const subjects = topics(page).getByRole('button');
    await expectWrites(page, result, 'First subject', 1, () => subjects.nth(1).click());
    const first = await historySnapshot(page);
    assert.ok(new URL(origin + first.url).searchParams.get('node')?.startsWith('topic:'));
    await expectWrites(page, result, 'Same subject', 0, () => subjects.nth(1).click());
    await expectWrites(page, result, 'Second subject', 1, () => subjects.nth(2).click());
    await expectWrites(page, result, 'Reset changed selection', 1, () => subjects.nth(0).click());
    await expectWrites(page, result, 'Reset already-current All work', 0, () => subjects.nth(0).click());
    await expectWrites(page, result, 'Forty repeated Enter keys on current All work', 0, async () => {
      await subjects.nth(0).focus();
      for (let index = 0; index < 40; index++) await page.keyboard.press('Enter');
    });
  });
  await challenge('Seventy-five genuine graph changes stay below WebKit quota without pacing', '/en-gb/projects?view=map', async (page, result) => {
    const subjects = topics(page).getByRole('button');
    const before = await historySnapshot(page);
    const started = Date.now();
    for (let index = 0; index < 75; index++) {
      await subjects.nth(1 + index % 2).click();
      if (result.errors.length) break;
    }
    await frame(page);
    const after = await historySnapshot(page);
    result.elapsedMs = Date.now() - started;
    result.burstWrites = after.writes.slice(before.writes.length);
    assert.equal(result.burstWrites.length, 75, '75 changed selections require exactly 75 native replacements');
    assert.ok(result.burstWrites.every(write => write.method === 'replaceState' && !write.noOp && !write.error));
    assert.equal(after.length, before.length, 'Burst must retain replacement-only graph Back semantics');
    assert.equal(new URL(origin + after.url).searchParams.get('node'), 'topic:reinforcement-learning');
  });
  await challenge('Graph replacements preserve archive-tab browser Back and Forward', '/en-gb/projects?view=files', async (page, result) => {
    const before = await historySnapshot(page);
    await active(page).getByRole('tab', { name: 'Knowledge graph', exact: true }).click();
    await topics(page).waitFor();
    await frame(page);
    const map = await historySnapshot(page);
    assert.equal(map.length, before.length + 1, 'Changing archive view adds its existing Back entry');
    await expectWrites(page, result, 'Select first subject after tab change', 1, () => topics(page).getByRole('button').nth(1).click());
    await expectWrites(page, result, 'Select second subject after tab change', 1, () => topics(page).getByRole('button').nth(2).click());
    result.selected = await historySnapshot(page);
    await page.goBack();
    await active(page).getByRole('tab', { name: 'All projects', exact: true }).waitFor();
    await page.waitForFunction(() => new URL(location.href).searchParams.get('view') === 'files');
    result.back = await historySnapshot(page);
    assert.equal(result.back.url, '/en-gb/projects?view=files');
    await page.goForward();
    await page.waitForFunction(() => new URL(location.href).searchParams.get('node') === 'topic:scientific-ml');
    await topics(page).getByRole('button').nth(2).waitFor();
    await frame(page);
    result.forward = await historySnapshot(page);
    assert.equal(result.forward.url, result.selected.url);
    assert.equal(await topics(page).getByRole('button').nth(2).getAttribute('aria-pressed'), 'true');
  });
} finally {
  await browser.close();
  report.finished = new Date().toISOString();
  await writeFile(reportPath, JSON.stringify(report, null, 2));
}
if (report.tests.some(test => test.result === 'FAIL') || report.pageErrors.length) process.exitCode = 1;
console.log(JSON.stringify({ engine, version: report.version, origin, tests: report.tests.map(test => ({ name: test.name, result: test.result, elapsedMs: test.elapsedMs })), pageErrors: report.pageErrors.length, reportPath }));
