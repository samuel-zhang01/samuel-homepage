// Compiled profile/navigation regression journeys.
// Use REVIEW_ORIGIN, BROWSER_ENGINE and PLAYWRIGHT_CORE_PATH; each test owns a disposable context.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
const require = createRequire(import.meta.url);
if (!process.env.PLAYWRIGHT_CORE_PATH)
    throw new Error('Set PLAYWRIGHT_CORE_PATH to an external Playwright installation.');
const pw = require(process.env.PLAYWRIGHT_CORE_PATH);
const engine = process.env.BROWSER_ENGINE ?? 'chromium';
const origin = process.env.REVIEW_ORIGIN;
if (!origin)
    throw new Error('REVIEW_ORIGIN required: run against a compiled production preview');
const report = { engine, origin, started: new Date().toISOString(), tests: [], pageErrors: [], requests: [] };
const browser = await pw[engine].launch({ headless: true });
report.version = browser.version();
const app = (p, id) => p.locator(`[data-app-id="${id}"]`);
const state = async (p) => p.evaluate(() => ({ url: location.pathname + location.search + location.hash, active: document.querySelector('.mac-window.is-active')?.getAttribute('data-app-id'), document: document.querySelector('.documents-library > button.is-active')?.id, expanded: [...document.querySelectorAll('.skill-capability[open]')].map(e => e.id), focus: document.activeElement?.id || document.activeElement?.textContent?.trim().slice(0, 90), lang: document.documentElement.lang }));
async function open(c, route, viewport = { width: 1440, height: 1000 }) {
    const p = await c.newPage();
    p.setDefaultTimeout(10000);
    await p.setViewportSize(viewport);
    p.on('pageerror', e => report.pageErrors.push(e.message));
    p.on('requestfailed', r => {
        if (!['net::ERR_ABORTED', 'NS_BINDING_ABORTED', 'cancelled'].includes(r.failure()?.errorText))
            report.requests.push({ url: r.url(), error: r.failure()?.errorText });
    });
    await p.goto(origin + route, { timeout: 60000 });
    await p.waitForFunction(() => document.documentElement.dataset.reduceEffects !== undefined);
    await p.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    return p;
}
async function menuApp(p, label) {
    await p.locator('.apple-menu').click();
    await p.getByRole('menuitem', { name: label, exact: true }).click();
    await p.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}
async function challenge(name, run) {
    const c = await browser.newContext();
    await c.addInitScript(() => {
        sessionStorage.setItem('samuel-system7-boot', 'seen');
        sessionStorage.setItem('samuel-mobile-window-guide', 'seen');
    });
    let result = { name };
    try {
        await run(c, result);
        result.result = 'PASS';
        console.log(`PASS ${engine}: ${name}`);
    }
    catch (e) {
        result.result = 'FAIL';
        result.error = e.stack;
        console.log(`FAIL ${engine}: ${name}: ${e.message}`);
    }
    finally {
        report.tests.push(result);
        await c.close();
        await writeFile(`.codex/reports/profile-interaction/${engine}.json`, JSON.stringify(report, null, 2));
    }
}
await mkdir('.codex/reports/profile-interaction', { recursive: true });
try {
    await challenge('Skill deep link opens; keyboard Enter/Space supports multiple independent expansions', async (c, r) => {
        const p = await open(c, '/en-gb/skills#recovery');
        await p.waitForFunction(() => document.querySelector('#recovery')?.open);
        await p.locator('#containers > summary').focus();
        await p.keyboard.press('Enter');
        await p.locator('#scientific-programming > summary').focus();
        await p.keyboard.press('Space');
        r.state = await state(p);
        assert.ok(r.state.expanded.includes('recovery') && r.state.expanded.includes('containers') && r.state.expanded.includes('scientific-programming'));
        await p.locator('#containers > summary').focus();
        await p.keyboard.press('Enter');
        assert.equal(await p.locator('#containers').evaluate(e => e.open), false);
        assert.equal(await p.locator('#recovery').evaluate(e => e.open), true);
        await p.locator('#recovery a[href="/en-gb/experience#pfizer"]').click();
        await p.waitForFunction(() => document.querySelector('.mac-window.is-active')?.dataset.appId === 'experience');
        await p.goBack();
        await p.waitForFunction(() => document.querySelector('.mac-window.is-active')?.dataset.appId === 'skills');
        assert.equal(await p.locator('#scientific-programming').evaluate(e => e.open), true, 'Independently expanded skill survives source navigation and Back');
        await p.getByRole('button', { name: /^Language:/ }).click();
        await p.getByRole('menuitemradio', { name: /^繁體中文/ }).click();
        await p.waitForFunction(() => document.documentElement.lang === 'zh-TW');
        r.localized = await state(p);
        assert.ok(r.localized.expanded.includes('scientific-programming') && r.localized.expanded.includes('recovery'));
        assert.equal(r.localized.url, '/zh-tw/skills#recovery');
    });
    await challenge('Document keyboard selection remains represented by the address', async (c, r) => {
        const p = await open(c, '/en-gb/documents#growmat-showcase');
        await p.locator('#growmat-showcase').focus();
        await p.keyboard.press('Tab');
        r.state = await state(p);
        assert.equal(r.state.document, 'growmat-showcase', 'Tab focus must not switch the selected PDF');
        assert.equal(r.state.url, '/en-gb/documents#growmat-showcase');
        await p.keyboard.press('Enter');
        r.activated = await state(p);
        assert.equal(r.activated.document, 'study-rl');
        assert.equal(r.activated.url, '/en-gb/documents#study-rl', 'Enter-selected PDF must match shareable document URL');
    });
    await challenge('View CV returns to the CV after a different document was selected', async (c, r) => {
        const p = await open(c, '/en-gb/documents#growmat-showcase');
        await p.locator('#italian-reading').click();
        await menuApp(p, 'Career');
        await app(p, 'experience').getByRole('link', { name: 'View CV', exact: true }).click();
        // This window was already mounted behind Career. Its old library is
        // visible before the next animation frame focuses the new permalink.
        await p.waitForFunction(() => document.querySelector('.documents-library > button.is-active')?.id === 'ai-cv');
        r.state = await state(p);
        assert.equal(r.state.active, 'documents');
        assert.equal(r.state.document, 'ai-cv', 'View CV must select CV instead of last workbook');
    });
    await challenge('Document-to-project link, browser back and forward preserve selected document', async (c, r) => {
        const p = await open(c, '/en-gb/documents#growmat-showcase');
        await p.locator('#italian-reading').click();
        r.document = await state(p);
        await app(p, 'documents').getByRole('link', { name: /Open related project/ }).click();
        await app(p, 'project').waitFor();
        r.project = await state(p);
        await p.goBack();
        await p.waitForFunction(() => document.querySelector('.mac-window.is-active')?.dataset.appId === 'documents');
        r.back = await state(p);
        assert.equal(r.back.document, 'italian-reading');
        assert.equal(r.back.url, '/en-gb/documents#italian-reading');
        await p.goForward();
        await p.waitForFunction(() => document.querySelector('.mac-window.is-active')?.dataset.appId === 'project');
        r.forward = await state(p);
        assert.ok(r.forward.url.includes('project=parliamo-italian-learning'));
    });
    await challenge('Graph source opens correct document; back preserves selected graph node', async (c, r) => {
        const p = await open(c, '/en-gb/projects?view=map&node=experience%3Apfizer');
        const source = app(p, 'projects').getByRole('link', { name: /GROWMAT external showcase/ });
        await source.waitFor();
        await source.click();
        await p.waitForFunction(() => document.querySelector('.mac-window.is-active')?.dataset.appId === 'documents');
        r.document = await state(p);
        assert.equal(r.document.document, 'growmat-showcase');
        assert.equal(r.document.url, '/en-gb/documents#growmat-showcase');
        assert.equal(await p.locator('#growmat-showcase').evaluate(e => e.tabIndex), 0, 'Citation focus must retain native button tab order');
        await p.locator('#ai-cv').focus();
        await p.keyboard.press('Tab');
        assert.equal(await p.evaluate(() => document.activeElement?.id), 'growmat-showcase');
        await p.goBack();
        await p.waitForFunction(() => document.querySelector('.mac-window.is-active')?.dataset.appId === 'projects');
        r.back = await state(p);
        assert.ok(r.back.url.includes('node=experience%3Apfizer'));
        await app(p, 'projects').getByRole('link', { name: /GROWMAT external showcase/ }).waitFor();
        await p.goForward();
        await p.waitForFunction(() => document.querySelector('.mac-window.is-active')?.dataset.appId === 'documents');
        r.forward = await state(p);
        assert.equal(r.forward.document, 'growmat-showcase');
        assert.equal(await p.locator('#growmat-showcase').evaluate(e => e.tabIndex), 0, 'History restoration must retain native button tab order');
        await p.locator('#ai-cv').focus();
        await p.keyboard.press('Tab');
        assert.equal(await p.evaluate(() => document.activeElement?.id), 'growmat-showcase');
    });
    await challenge('Control-click and middle-click preserve native new-tab project links', async (c, r) => {
        const p = await open(c, '/en-gb/skills#recovery');
        await p.waitForFunction(() => document.querySelector('#recovery')?.open);
        const link = p.locator('#recovery .button-row a').first();
        r.before = await state(p);
        for (const options of [{ modifiers: ['Control'] }, { button: 'middle' }]) {
            // Closing the first native tab can leave Chromium's input focus on
            // the closed target. Return to the original tab before the next gesture.
            await p.bringToFront();
            await p.waitForFunction(() => document.hasFocus());
            // Chromium's native tab activation settles after DOM focus reports
            // true. Allow browser chrome to settle before testing its modifier gesture.
            if (engine === 'chromium') await p.waitForTimeout(250);
            const [newPage] = await Promise.all([c.waitForEvent('page'), link.click(options)]);
            await newPage.waitForURL('**/*project=growmat*');
            await newPage.waitForLoadState('domcontentloaded');
            r.popupUrls ??= [];
            r.popupUrls.push(newPage.url());
            assert.ok(newPage.url().includes('project=growmat'));
            await newPage.close();
        }
        r.after = await state(p);
        assert.equal(r.after.url, r.before.url);
        assert.equal(r.after.active, 'skills');
    });
    await challenge('Locale switch preserves CV selection and updates download edition', async (c, r) => {
        const p = await open(c, '/en-gb/documents#ai-cv');
        await p.getByRole('button', { name: /^Language:/ }).click();
        await p.getByRole('menuitemradio', { name: /^繁體中文/ }).click();
        await p.waitForFunction(() => document.documentElement.lang === 'zh-TW');
        r.state = await state(p);
        r.download = await app(p, 'documents').locator('.documents-toolbar a').getAttribute('href');
        assert.equal(r.state.document, 'ai-cv');
        assert.equal(r.state.url, '/zh-tw/documents#ai-cv');
        assert.ok(r.download.includes('CV-zh-TW.pdf'));
    });
    await challenge('Skill origin and source links work by keyboard then browser back', async (c, r) => {
        const p = await open(c, '/en-gb/skills#recovery');
        await p.waitForFunction(() => document.querySelector('#recovery')?.open);
        const origin = p.locator('#recovery a[href="/en-gb/experience#pfizer"]');
        await origin.focus();
        await p.keyboard.press('Enter');
        await p.waitForFunction(() => document.querySelector('.mac-window.is-active')?.dataset.appId === 'experience');
        // Window activation precedes the route handler's animation-frame focus.
        // Await that user-visible outcome; an absent or wrong target still fails.
        await p.waitForFunction(() => document.activeElement?.id === 'pfizer');
        r.experience = await state(p);
        assert.equal(r.experience.url, '/en-gb/experience#pfizer');
        assert.equal(r.experience.focus, 'pfizer');
        await p.goBack();
        await p.waitForFunction(() => document.querySelector('.mac-window.is-active')?.dataset.appId === 'skills');
        r.back = await state(p);
        assert.ok(r.back.expanded.includes('recovery'));
        assert.equal(r.back.url, '/en-gb/skills#recovery');
    });
    await challenge('Encoded skill and document anchors resolve their real record', async (c, r) => {
        const p = await open(c, '/en-gb/skills#%72ecovery');
        await p.waitForFunction(() => document.querySelector('#recovery')?.open);
        r.skill = await state(p);
        assert.ok(r.skill.expanded.includes('recovery'));
        const document = await open(c, '/en-gb/documents#growmat%2Dshowcase');
        await document.waitForFunction(() => document.querySelector('.documents-library > button.is-active')?.id === 'growmat-showcase');
        r.document = await state(document);
        assert.equal(r.document.document, 'growmat-showcase');
    });
    await challenge('Malformed fragment remains usable through project navigation and browser Back', async (c, r) => {
        const p = await open(c, '/en-gb/skills#%');
        const errors = [];
        p.on('pageerror', e => errors.push(e.message));
        await p.locator('#data-modelling > summary').focus();
        await p.keyboard.press('Enter');
        await p.locator('#data-modelling .button-row a').first().click();
        await app(p, 'project').waitFor();
        await p.goBack();
        await p.waitForFunction(() => document.querySelector('.mac-window.is-active')?.dataset.appId === 'skills');
        r.state = await state(p);
        assert.equal(r.state.url, '/en-gb/skills#%');
        assert.deepEqual(errors, [], 'Malformed fragment must not throw during focus restoration');
    });
    await challenge('Phone document buttons and skill summaries remain keyboard-reachable without overflow', async (c, r) => {
        for (const route of ['/en-gb/documents#italian-reading', '/zh-tw/skills#scientific-ml']) {
            const p = await open(c, route, { width: 320, height: 568 });
            r.states ??= [];
            r.states.push(await state(p));
            r.dimensions ??= [];
            r.dimensions.push(await p.evaluate(() => ({ body: { scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }, window: [...document.querySelectorAll('.mac-window__content')].map(e => ({ scroll: e.scrollWidth, client: e.clientWidth })) })));
            for (const dimensions of r.dimensions) {
                assert.ok(dimensions.body.scroll <= dimensions.body.client + 1);
                for (const win of dimensions.window)
                    assert.ok(win.scroll <= win.client + 1);
            }
            await p.close();
        }
    });
}
catch (e) {
    report.harnessError = e.stack;
}
finally {
    await browser.close();
    report.finished = new Date().toISOString();
    await writeFile(`.codex/reports/profile-interaction/${engine}.json`, JSON.stringify(report, null, 2));
}
if (report.harnessError || report.tests.some(test => test.result === 'FAIL') || report.pageErrors.length)
    process.exitCode = 1;
console.log(JSON.stringify({ engine, version: report.version, tests: report.tests.map(t => ({ name: t.name, result: t.result })), pageErrors: report.pageErrors.length, requestFailures: report.requests.length }));
