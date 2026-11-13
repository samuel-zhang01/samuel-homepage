// Compiled-browser checks for useful phone working space and filter disclosure.
// Keep Playwright external to app dependencies. Set BROWSER_NO_SANDBOX=1 only
// for an explicitly configured, trusted root test host.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

assert.ok(process.env.PLAYWRIGHT_CORE_PATH, 'Provide an external Playwright installation.');
const require = createRequire(import.meta.url);
const pw = require(process.env.PLAYWRIGHT_CORE_PATH);
const engine = process.env.BROWSER_ENGINE ?? 'chromium';
const origin = process.env.REVIEW_ORIGIN ?? 'http://127.0.0.1:5187';
const output = resolve(process.env.MOBILE_UI_REPORT_DIR ?? '.codex/reports/mobile-ui');
const locales = (process.env.MOBILE_UI_LOCALES ?? 'en-gb,en-us,zh-cn,zh-tw').split(',');
const sizes = (process.env.MOBILE_UI_SIZES ?? '320x568,390x844,844x390').split(',').map(value => value.split('x').map(Number));
const labels = {
  'en-gb': { filters: 'Filters', clear: 'Clear filters' },
  'en-us': { filters: 'Filters', clear: 'Clear filters' },
  'zh-cn': { filters: '筛选', clear: '清除筛选' },
  'zh-tw': { filters: '篩選', clear: '清除篩選' },
};
assert.ok(locales.every(locale => labels[locale]) && sizes.every(([w,h]) => w >= 320 && h >= 320));
await mkdir(output, { recursive: true });
const attached = Boolean(process.env.BROWSER_CDP_URL);
assert.ok(!attached || engine === 'chromium', 'CDP attachment supports Chromium only.');
const browser = attached
  ? await pw.chromium.connectOverCDP(process.env.BROWSER_CDP_URL)
  : await pw[engine].launch({ headless: true, ...(engine === 'chromium' && process.env.BROWSER_NO_SANDBOX === '1' ? { args: ['--no-sandbox'] } : {}) });
const report = { engine, version: browser.version(), origin, profiles: [], qualifications: ['Compiled viewport automation; real phone keyboards and physical touch devices require separate review.'] };
async function geometry(locator) {
  return locator.evaluate(node => { const r = node.getBoundingClientRect(); return { x:r.x, y:r.y, right:r.right, bottom:r.bottom, width:r.width, height:r.height }; });
}
function inside(rect, container) { return rect.x >= container.x - 1 && rect.right <= container.right + 1 && rect.y >= container.y - 1 && rect.bottom <= container.bottom + 1; }
try {
  for (const locale of locales) for (const [width,height] of sizes) {
    const context = await browser.newContext({ viewport:{width,height}, isMobile:engine !== 'firefox', hasTouch:true, reducedMotion:'reduce' });
    try {
      await context.addInitScript(() => { sessionStorage.setItem('samuel-system7-boot','seen'); sessionStorage.setItem('samuel-mobile-window-guide','seen'); });
      const page = await context.newPage(); page.setDefaultTimeout(20_000);
      const errors = []; page.on('pageerror', error => errors.push(String(error)));
      const profile = { locale,width,height,checks:[],games:[],errors }; report.profiles.push(profile);
      await page.goto(`${origin}/${locale}/projects`, {waitUntil:'networkidle'});
      await page.waitForFunction(() => document.documentElement.dataset.reduceEffects !== undefined);
      await page.locator('.classic-module-loading').waitFor({state:'hidden'});
      const app = page.locator('[data-app-id="projects"]');
      const search = app.locator('input[type="search"]').first();
      const filters = app.locator('[class*="ProjectLibrary_filtersToggle"]');
      const discipline = app.locator('[class*="ProjectLibrary_secondaryFilters"] [data-classic-select]');
      assert.ok(await search.isVisible(), 'Search remains visible while secondary filters are collapsed.');
      assert.ok(await search.evaluate(node => parseFloat(getComputedStyle(node).fontSize) >= 16), 'Editable phone search text is at least16px.');
      const collapsible = await filters.isVisible(); profile.filtersCollapsible = collapsible;
      assert.equal(await filters.getAttribute('aria-expanded'),'false');
      assert.equal(await discipline.isVisible(),!collapsible);
      const pane = await geometry(app.locator('.mac-window__content'));
      profile.initialRows = await app.locator('button[data-project-slug]').evaluateAll((nodes,p) => nodes.filter(node => { const r=node.getBoundingClientRect(); return r.height>0 && r.top>=p.y && r.bottom<=p.bottom; }).length,pane);
      if (width <= 390 && height >= 568) assert.ok(profile.initialRows >= 2, 'At least two complete project rows are visible before scrolling.');
      if (collapsible) {
        await filters.focus(); await page.keyboard.press('Enter');
        assert.equal(await filters.getAttribute('aria-expanded'),'true');
        assert.ok(await discipline.isVisible());
        await page.keyboard.press('Tab');
        assert.ok(await discipline.evaluate(node => node === document.activeElement), 'Expanding filters leads directly to the revealed Discipline control.');
      }
      await discipline.click(); await page.keyboard.press('ArrowDown'); await page.keyboard.press('Enter');
      await page.waitForFunction(() => new URLSearchParams(location.search).has('area'));
      if (collapsible) { await filters.click(); assert.equal(await discipline.isVisible(),false); }
      assert.equal(await app.locator('[class*="ProjectLibrary_filterBadge"]').textContent(),'1');
      await app.getByRole('button',{name:labels[locale].clear,exact:true}).click();
      await page.waitForFunction(() => !new URLSearchParams(location.search).has('area'));
      await search.fill('ultra');
      await app.locator('button[data-project-slug="ultra-convert"]').waitFor();
      await search.focus(); await page.keyboard.press('ArrowDown'); await page.keyboard.press('Enter');
      await page.waitForFunction(() => new URLSearchParams(location.search).get('selected') === 'ultra-convert');
      await app.locator('[class*="ProjectLibrary_detailPane"] [data-embedded="true"]').waitFor();
      assert.ok(await app.locator('[class*="ProjectLibrary_detailPane"]').isVisible(), 'Keyboard search result opens its document.');
      profile.checks.push('visible16pxsearch','twoinitialrowswhereportrait','keyboardfilterdisclosure','filterURLandactivebadge','clearrestoresunfilteredURL','keyboardsearchopensproject');
      await page.goto(`${origin}/${locale}/projects`, {waitUntil:'networkidle'});
      await page.locator('.classic-module-loading').waitFor({state:'hidden'});
      await page.screenshot({path:resolve(output,`${engine}-${locale}-${width}x${height}-projects.png`)});
      const graphTab = app.locator('[class*="ProjectLibrary_tabs"] [role="tab"]').last();
      await graphTab.focus(); await page.keyboard.press('Enter');
      await app.locator('canvas').first().waitFor({state:'visible'});
      profile.checks.push('keyboardopensdeferredknowledgegraph');
      await page.goto(`${origin}/${locale}/games`, {waitUntil:'networkidle'});
      await page.locator('.classic-module-loading').waitFor({state:'hidden'});
      const games = page.locator('[data-app-id="games"]');
      for (const id of ['minefield','puzzle','snake','brickbreaker']) {
        await games.locator(`[data-game-id="${id}"]`).click();
        await page.waitForTimeout(80);
        await games.locator('.game-stage').evaluate(node => {node.scrollTop=0;});
        await games.locator('.mac-window__content').evaluate(node => {node.scrollTop=0;});
        const pane = await geometry(games.locator('.mac-window__content'));
        const boardSelector = {minefield:'.minefield',puzzle:'.puzzle-board',snake:'.snake-game__board',brickbreaker:'.brick-game__machine'}[id];
        const controlSelector = {minefield:'.mine-toolbar',puzzle:'.puzzle-actions',snake:'.snake-game .arcade-game__controls',brickbreaker:'.brick-game .arcade-game__controls'}[id];
        const board = await geometry(games.locator(`${boardSelector}:visible`));
        const controls = await geometry(games.locator(`${controlSelector}:visible`));
        const test = {id,pane,board,controls}; profile.games.push(test);
        await page.screenshot({path:resolve(output,`${engine}-${locale}-${width}x${height}-${id}.png`)});
        if (height >= 568 || id === 'snake' || id === 'brickbreaker') {
          assert.ok(inside(board,pane), `${locale}/${width}×${height}/${id}: entire board is visible.`);
          assert.ok(inside(controls,pane), `${locale}/${width}×${height}/${id}: playing controls remain beside the board.`);
        }
        const targets = await games.locator(`${controlSelector}:visible button`).evaluateAll(nodes=>nodes.map(node=>{const r=node.getBoundingClientRect();return {w:r.width,h:r.height};}));
        assert.ok(targets.every(target=>target.w>=43 && target.h>=43),'Game action/direction controls retain44px touch targets.');
        if (id==='snake'||id==='brickbreaker') {
          const section = games.locator(id==='snake'?'.snake-game':'.brick-game');
          const toggle = section.locator('.arcade-game__actions button').first();
          await toggle.click(); await toggle.click();
          const pausedControls = await geometry(section.locator('.arcade-game__controls'));
          test.pausedControls = pausedControls;
          test.controlOverflow = await section.locator('.arcade-game__controls').evaluate(node => ({ width:node.clientWidth, scrollWidth:node.scrollWidth, buttons:[...node.querySelectorAll('button')].map(button=>({text:button.textContent,width:button.getBoundingClientRect().width,right:button.getBoundingClientRect().right})) }));
          await page.screenshot({path:resolve(output,`${engine}-${locale}-${width}x${height}-${id}-paused.png`)});
          assert.ok(inside(pausedControls,pane), 'Paused status keeps all game controls on screen.');
          assert.ok(test.controlOverflow.scrollWidth <= test.controlOverflow.width+1, 'Playing labels do not create horizontal overflow.');
          const guide = games.locator(`.${id==='snake'?'snake-game':'brick-game'} .arcade-game__guide`);
          await guide.locator('summary').click();
          assert.ok(await guide.getAttribute('open') !== null,'Instructions remain accessible after compaction.');
          assert.ok((await guide.locator('p').first().textContent()).trim().length>0);
          await guide.locator('summary').click();
        }
      }
      assert.deepEqual(errors,[],'No browser errors in mobile journeys.');
      profile.checks.push('completeboards','44pxplayingcontrols','sightedgameinstructions');
      console.log(`PASS ${engine} ${locale} ${width}×${height}`);
    } catch(error) {
      report.error=String(error.stack??error); throw error;
    } finally { await context.close(); await writeFile(resolve(output,'report.json'),JSON.stringify(report,null,2)); }
  }
} finally { if(!attached) await browser.close(); }
console.log(`Mobile UI: ${report.profiles.length} compiled locale/viewport journeys passed.`);
if(attached) process.exit(0);
