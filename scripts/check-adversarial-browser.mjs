// Independent browser challenges. Dedicated, disposable contexts only.
// Run with Node 22, REVIEW_ORIGIN, BROWSER_ENGINE and PLAYWRIGHT_CORE_PATH.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
const require = createRequire(import.meta.url);
if (!process.env.PLAYWRIGHT_CORE_PATH) throw new Error('Set PLAYWRIGHT_CORE_PATH to an installed Playwright package.');
const pw = require(process.env.PLAYWRIGHT_CORE_PATH);
const engine = process.env.BROWSER_ENGINE ?? 'chromium';
const origin = process.env.REVIEW_ORIGIN ?? 'http://127.0.0.1:5186';
const out = process.env.REVIEW_SCREENSHOT_DIR ?? 'docs/reviews/app-improvements-2026-10-04';
await mkdir(out, { recursive: true });
await mkdir(".codex/reports/app-audit", { recursive: true });
const report = { engine, origin, version: null, started: new Date().toISOString(), tests: [], pageErrors: [], requestFailures: [] };
let browser;
async function challenge(name, run) {
  if (process.env.ADVERSARIAL_GROUP && !new RegExp(process.env.ADVERSARIAL_GROUP).test(name)) return;
  let context;
  try {
    context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    await run(context);
    report.tests.push({ name, result: 'PASS' });
    console.log(`PASS ${engine}: ${name}`);
  } catch (e) {
    report.tests.push({ name, result: 'FAIL', error: e.stack });
    console.log(`FAIL ${engine}: ${name}: ${e.message}`);
  } finally { await context?.close(); }
}
async function page(c, path, size) {
  const p = await c.newPage(); p.setDefaultTimeout(20000);
  if (size) await p.setViewportSize(size);
  p.on('pageerror', e => report.pageErrors.push({ path, message: e.message }));
  p.on('requestfailed', r => report.requestFailures.push({ path, url: r.url(), error: r.failure()?.errorText }));
  await p.goto(`${origin}${path}`, { timeout: 60000 });
  await p.waitForFunction(() => document.documentElement.dataset.reduceEffects !== undefined);
  const acknowledge = p.getByRole('button', { name: /^(Got it|知道了|明白了|了解了)$/ });
  if (await acknowledge.count()) await acknowledge.click();
  return p;
}
const app = (p, id) => p.locator(`[data-app-id="${id}"]`);
async function overflow(p, id) {
  assert.equal(await p.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1), false);
  if (id) assert.equal(await app(p, id).locator('.mac-window__content').evaluate(e => e.scrollWidth > e.clientWidth + 1), false);
}
try {
  browser = await pw[engine].launch({ headless: true, ...(engine === 'chromium' ? { executablePath: process.env.BROWSER_EXECUTABLE_PATH, args: ['--no-sandbox'] } : {}) });
  report.version = browser.version();
  await challenge('settings: four language routes on 320px phone and short landscape', async c => {
    for (const [locale, html] of [['en-gb','en-GB'],['en-us','en-US'],['zh-cn','zh-CN'],['zh-tw','zh-TW']]) {
      for (const size of [{ width: 320, height: 568 }, { width: 844, height: 390 }]) {
        const p = await page(c, `/${locale}/settings`, size);
        await app(p,'settings').getByRole('heading').first().waitFor();
        assert.equal(await p.locator('html').getAttribute('lang'), html);
        await overflow(p, 'settings');
        await app(p,'settings').getByRole('button').last().scrollIntoViewIfNeeded();
        await p.screenshot({ path: `${out}/adversarial-${engine}-${locale}-settings-${size.width}.png` });
        await p.close();
      }
    }
  });
  await challenge('settings: keyboard theme, language and all comfort controls, with preserved focus', async c => {
    const p = await page(c, '/en-gb/settings', { width: 390, height: 844 });
    for (const name of ['Blue','Paper','Classic']) {
      const radio = app(p,'settings').getByRole('radio',{ name, exact: true });
      await radio.focus(); await p.keyboard.press('Space');
      assert.equal(await radio.isChecked(),true);
      await p.screenshot({ path: `${out}/adversarial-${engine}-theme-${name.toLowerCase()}.png` });
    }
    const us = app(p,'settings').getByRole('radio',{ name: 'English (US)', exact: true });
    await us.focus(); await p.keyboard.press('Space');
    await p.waitForURL('**/en-us/settings');
    assert.equal(await us.evaluate(e => e === document.activeElement),true);
    const hours = app(p,'settings').getByRole('radio',{ name: '12-hour', exact: true });
    await hours.focus(); await p.keyboard.press('Space');
    const motion = app(p,'settings').getByRole('checkbox',{ name: 'Reduce interface effects', exact: true });
    await motion.focus(); await p.keyboard.press('Space');
    assert.equal(await motion.isChecked(),true);
    await p.waitForFunction(() => document.documentElement.dataset.reduceEffects === 'true');
    const startup = app(p,'settings').getByRole('checkbox',{ name: 'Show the startup sequence', exact: true });
    await startup.focus(); await p.keyboard.press('Space');
    assert.equal(await startup.isChecked(),false);
    await p.reload(); await app(p,'settings').getByRole('radio',{ name: '12-hour', exact: true, checked: true }).waitFor();
    assert.equal(await hours.isChecked(),true); assert.equal(await startup.isChecked(),false);
    await overflow(p,'settings');
  });
  await challenge('Finder: focus trap, keyboard selection and restore, unsuccessful search', async c => {
    const p = await page(c,'/en-gb/settings',{ width: 320, height: 568 });
    const launch = p.getByRole('button',{ name: 'Samuel menu', exact: true });
    await launch.focus(); await p.keyboard.press('Control+k');
    const find = p.getByRole('dialog',{ name: 'Find…', exact: true });
    await find.waitFor(); const input = find.getByRole('combobox');
    assert.equal(await input.evaluate(e => e === document.activeElement),true);
    await input.fill('zzzz-no-result');
    await find.getByText('No matching files. Try a shorter name or another keyword.',{exact:true}).waitFor();
    assert.equal(await find.getByRole('button',{name:'Open',exact:true}).isEnabled(),false);
    await input.fill('settings');
    await p.keyboard.press('ArrowDown');
    const selected = await input.getAttribute('aria-activedescendant');
    assert.ok(selected && await p.locator(`#${selected}`).getAttribute('aria-selected') === 'true');
    for(let i=0;i<12;i++){ await p.keyboard.press('Tab'); assert.equal(await find.evaluate(e=>e.contains(document.activeElement)),true); }
    await input.focus(); await p.keyboard.press('Escape');
    await find.waitFor({state:'hidden'});
    assert.equal(await launch.evaluate(e=>e===document.activeElement),true);
  });
  await challenge('Finder: detailed-index failure retains name search, retry recovers',async c=>{
    let fail = true;
    await c.route('**/search/project-text-*.json',r=> fail ? r.fulfill({status:503,body:'unavailable'}) : r.continue());
    const p=await page(c,'/en-gb/settings',{width:320,height:568});
    await p.keyboard.press('Control+k'); const find=p.getByRole('dialog',{name:'Find…',exact:true});
    await find.getByRole('checkbox',{name:'Detailed search',exact:true}).check();
    await find.getByText('Detailed search is unavailable. Name and keyword search still works.',{exact:true}).waitFor();
    await find.getByRole('combobox').fill('settings');
    await find.getByRole('option',{name:/Settings/}).waitFor();
    await p.screenshot({path:`${out}/adversarial-${engine}-finder-recovery.png`});
    fail=false; await find.getByRole('button',{name:'Try again',exact:true}).click();
    await find.locator('[role="listbox"]').waitFor();
    await p.waitForFunction(()=>document.querySelector('#finder-results')?.getAttribute('aria-busy')==='false');
    assert.equal(await find.getByText('Detailed search is unavailable. Name and keyword search still works.',{exact:true}).count(),0);
  });
  await challenge('ClassicSelect: converter pointer selection, keyboard Escape and Tab, mobile top layer',async c=>{
    const p=await page(c,'/en-gb/desk',{width:320,height:568});
    await app(p,'desk').getByRole('button',{name:/^Open Unit Converter\./}).click();
    const source=app(p,'converter').getByRole('combobox',{name:'Source unit',exact:true});
    await source.waitFor(); await source.click();
    const list=p.getByRole('listbox').filter({visible:true});
    await list.waitFor(); const options=list.getByRole('option');
    const label=await options.nth(1).innerText();
    await options.nth(1).click();
    assert.equal(await source.getAttribute('aria-expanded'),'false'); assert.ok((await source.innerText()).includes(label.replace('✓','').trim()));
    await source.focus(); await p.keyboard.press('ArrowDown');
    assert.equal(await source.getAttribute('aria-expanded'),'true');
    const bounds=await list.boundingBox(); assert.ok(bounds.x>=0 && bounds.x+bounds.width<=320 && bounds.y>=0 && bounds.y+bounds.height<=568);
    await p.screenshot({path:`${out}/adversarial-${engine}-classic-select.png`});
    await p.keyboard.press('Escape');
    assert.equal(await source.evaluate(e=>e===document.activeElement),true);
    await p.keyboard.press('ArrowDown'); await p.keyboard.press('Tab');
    assert.equal(await source.getAttribute('aria-expanded'),'false'); assert.equal(await source.evaluate(e=>e===document.activeElement),false);
  });
  await challenge('PDF: source is available while healthy; keyboard zoom and Fit width work on phone',async c=>{
    const p=await page(c,'/en-gb/projects?project=growmat');
    await p.getByRole('button',{name:'Open showcase PDF',exact:false}).click();
    await p.setViewportSize({width:390,height:844});
    const activity=app(p,'projectActivity'); await activity.locator('.pdf-reader[data-status="ready"]').waitFor();
    const link=activity.locator('a[data-native-navigation]');
    assert.equal(await link.count(),1); assert.match(await link.getAttribute('href'),/\.pdf$/);
    assert.equal(await link.evaluate(e=>e.tagName),'A');
    const zoom=activity.getByRole('button',{name:'Zoom in',exact:true}); await zoom.focus(); await p.keyboard.press('Enter');
    assert.equal(await activity.locator('.pdf-reader').getAttribute('data-zoomed'),'true');
    await activity.getByRole('button',{name:/^Fit width/}).click();
    await overflow(p,'projectActivity');
    await p.screenshot({path:`${out}/adversarial-${engine}-pdf-phone.png`});
    const href=await link.getAttribute('href');
    await link.focus(); await p.keyboard.press('Enter');
    await p.waitForURL(url=>url.pathname===href,{timeout:30000});
    assert.equal(new URL(p.url()).pathname,href);
  });
  await challenge('PDF: forced worker-module failure exposes retry and original source; retry recovers',async c=>{
    let fail=true;
    await c.route('**/_vendor/pdfjs/pdf.min.mjs',r=>fail?r.fulfill({status:503,body:'unavailable',contentType:'text/javascript'}):r.continue());
    const p=await page(c,'/en-gb/projects?project=growmat');
    await p.getByRole('button',{name:'Open showcase PDF',exact:false}).click();
    const activity=app(p,'projectActivity'); await activity.locator('.pdf-reader[data-status="error"]').waitFor();
    await activity.getByText('The built-in preview could not render this file.',{exact:true}).waitFor();
    assert.equal(await activity.getByRole('link',{name:'Open this document in the current tab',exact:true}).isVisible(),true);
    await p.screenshot({path:`${out}/adversarial-${engine}-pdf-error.png`});
    fail=false; await activity.getByRole('button',{name:'Try again',exact:true}).click();
    await activity.locator('.pdf-reader[data-status="ready"]').waitFor({timeout:30000});
  });
  await challenge('module: slow Settings skeleton, reduced motion, and recoverable local chunk failure',async c=>{
    let release;
    const hold = new Promise(resolve=>{release=resolve;});
    await c.route('**/*DesktopSettings*.js',async r=>{await hold; await r.fulfill({status:503,contentType:'text/javascript',body:'unavailable'});});
    const p=await c.newPage(); p.setDefaultTimeout(25000); await p.emulateMedia({reducedMotion:'reduce'});
    const pending=p.goto(`${origin}/en-gb/settings`,{timeout:60000});
    await p.locator('.classic-module-loading').waitFor();
    const duration=await p.locator('.classic-module-loading i').evaluate(e=>getComputedStyle(e).animationDuration);
    assert.ok(['0s','1e-06s','0.000001s'].includes(duration),`Reduced motion animation duration ${duration}`);
    await p.screenshot({path:`${out}/adversarial-${engine}-settings-loading.png`});
    release(); await pending;
    await app(p,'settings').getByText('This application could not open',{exact:true}).waitFor({timeout:30000});
    assert.equal(await app(p,'settings').getByRole('button',{name:'Reload page',exact:true}).isVisible(),true);
    await p.getByRole('button',{name:'Samuel menu',exact:true}).click();
    await p.getByRole('menuitem',{name:'Desk Accessories',exact:true}).click();
    await app(p,'desk').getByRole('heading').first().waitFor();
    await p.screenshot({path:`${out}/adversarial-${engine}-chunk-failure-other-window.png`});
  });
  await challenge('MRI: recorded comparison available with limitation copy in three locales',async c=>{
    for(const [slug,images,limits,phrase] of [['en-gb','Recorded images','Study & limits','The Recorded images tab shows a saved reconstruction comparison.'],['zh-cn','已保存图像','研究与局限','标签页展示已保存的重建对比'],['zh-tw','已儲存影像','研究與侷限','分頁展示已儲存的重建比較']]){
      const p=await page(c,`/${slug}/projects?project=trustworthy-mri-reconstruction&view=demo`);
      await p.getByRole('button',{name:images,exact:false}).click();
      const img=p.locator('img[src="/projects/mri/media/recorded-reconstruction.webp"]');
      await img.scrollIntoViewIfNeeded(); await img.evaluate(e=>e.decode()); assert.equal(await img.evaluate(e=>e.naturalWidth),2200);
      await p.getByRole('button',{name:limits,exact:false}).click(); await p.getByText(phrase,{exact:false}).waitFor();
      await p.close();
    }
  });
} catch(e) { report.launchError=e.stack; console.log(`ENGINE ERROR ${engine}: ${e.stack}`); }
finally {
  report.finished=new Date().toISOString();
  await writeFile(`.codex/reports/app-audit/adversarial-${engine}${process.env.ADVERSARIAL_GROUP?'-focused':''}.json`,JSON.stringify(report,null,2));
  await browser?.close();
}
if(report.launchError||report.tests.some(t=>t.result==='FAIL')) process.exitCode=1;
