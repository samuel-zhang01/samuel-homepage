// Independent browser challenges. Dedicated, disposable contexts only.
// Run with Node 22, REVIEW_ORIGIN, BROWSER_ENGINE and PLAYWRIGHT_CORE_PATH.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { networkInterfaces } from 'node:os';
import path from 'node:path';
const require = createRequire(import.meta.url);
if (!process.env.PLAYWRIGHT_CORE_PATH) throw new Error('Set PLAYWRIGHT_CORE_PATH to an installed Playwright package.');
const pw = require(process.env.PLAYWRIGHT_CORE_PATH);
const engine = process.env.BROWSER_ENGINE ?? 'chromium';
const origin = process.env.REVIEW_ORIGIN ?? 'http://127.0.0.1:5186';
const out = process.env.REVIEW_SCREENSHOT_DIR ?? '.codex/reports/app-audit/screenshots';
const privateAddress = Object.values(networkInterfaces()).flat().find(address => address?.family === 'IPv4' && /^192\.168\.|^10\.|^172\.(1[6-9]|2\d|3[01])\./.test(address.address))?.address;
const insecureOrigin = process.env.INSECURE_REVIEW_ORIGIN ?? (privateAddress ? `http://${privateAddress}:${new URL(origin).port}` : null);
const settingsChunk = process.env.SETTINGS_CHUNK_PATH ? `**${process.env.SETTINGS_CHUNK_PATH}` : '**/*DesktopSettings*.js';
await mkdir(out, { recursive: true });
await mkdir(".codex/reports/app-audit", { recursive: true });
const report = { engine, origin, insecureOrigin, settingsChunk, version: null, started: new Date().toISOString(), tests: [], pageErrors: [], requestFailures: [], measurements: [] };
let browser;
async function challenge(name, run, options = {}) {
  if (process.env.ADVERSARIAL_GROUP && !new RegExp(process.env.ADVERSARIAL_GROUP).test(name)) return;
  let context;
  try {
    context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, ...options });
    await run(context);
    report.tests.push({ name, result: 'PASS' });
    console.log(`PASS ${engine}: ${name}`);
  } catch (e) {
    report.tests.push({ name, result: 'FAIL', error: e.stack });
    console.log(`FAIL ${engine}: ${name}: ${e.message}`);
  } finally { await context?.close(); }
}
async function page(c, path, size, pageOrigin = origin) {
  const p = await c.newPage(); p.setDefaultTimeout(20000);
  if (size) await p.setViewportSize(size);
  track(p, path);
  await p.goto(`${pageOrigin}${path}`, { timeout: 60000 });
  await settleShell(p);
  return p;
}
function track(p, path) {
  p.on('pageerror', e => report.pageErrors.push({ path, message: e.message, stack: e.stack }));
  p.on('requestfailed', r => report.requestFailures.push({ path, url: r.url(), error: r.failure()?.errorText }));
}
async function settleShell(p) {
  await p.waitForFunction(() => document.documentElement.dataset.reduceEffects !== undefined);
  await p.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const acknowledge = p.getByRole('button', { name: /^(Got it|知道了|明白了|了解了)$/ });
  if (await acknowledge.count()) { await acknowledge.click(); await acknowledge.waitFor({state:'hidden'}); }
}
async function mountSelectHarness(c) {
  // Bundle the real component, React and CSS into a temporary local harness.
  // This neither adds an application route nor changes the tested source.
  const esbuild = require(process.env.ESBUILD_PATH ?? path.join(path.dirname(process.env.PLAYWRIGHT_CORE_PATH), 'esbuild'));
  const result = await esbuild.build({
    stdin: { contents: `import React from 'react'; import {createRoot} from 'react-dom/client';
      import ClassicSelect from './src/components/ClassicSelect.tsx';
      const h=React.createElement; window.selectChanges=0;
      createRoot(document.getElementById('mount')).render(h('form',{id:'fixture'},
        h(ClassicSelect,{name:'sample',defaultValue:'alpha','aria-label':'Reset sample','aria-invalid':true,'aria-errormessage':'fixture-error',onChange:()=>window.selectChanges++},
          h('option',{value:'alpha'},'Alpha'),h('option',{value:'blocked',disabled:true},'Blocked'),h('option',{value:'gamma'},'Gamma')),
        h('button',{type:'reset'},'Reset form'),h('p',{id:'fixture-error'},'Choose a value')));`,
      resolveDir: process.cwd(), loader: 'jsx' },
    bundle: true, write: false, outfile: '/tmp/select-harness.js', jsx: 'automatic',
    loader: { '.module.css': 'local-css' }, define: { 'process.env.NODE_ENV': '"production"' },
  });
  const assets = new Map(result.outputFiles.map(file => [`/${path.basename(file.path)}`, file.contents]));
  const server = createServer((request, response) => {
    if (request.url === '/') {
      response.setHeader('Content-Type', 'text/html');
      response.end('<!doctype html><html lang="en"><head><link rel="stylesheet" href="/select-harness.css"></head><body><div id="mount"></div><script src="/select-harness.js"></script></body></html>');
    } else if (assets.has(request.url)) {
      response.setHeader('Content-Type', request.url.endsWith('.css') ? 'text/css' : 'text/javascript'); response.end(assets.get(request.url));
    } else { response.writeHead(404); response.end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const p = await c.newPage(); track(p, '/select-harness'); await p.goto(`http://127.0.0.1:${server.address().port}`);
  await p.getByRole('combobox', { name: 'Reset sample' }).waitFor();
  return { p, close: () => new Promise(resolve => server.close(resolve)) };
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
    for(const key of ['Tab','Shift+Tab']) for(let i=0;i<12;i++){
      await p.keyboard.press(key);
      assert.equal(await find.evaluate(e=>e.contains(document.activeElement)),true,`${key} step ${i} stays inside Find`);
    }
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
  await challenge('ClassicSelect: real mounted uncontrolled component follows native and cancelled form resets', async c => {
    const harness = await mountSelectHarness(c);
    try {
      const p = harness.p;
      const source = p.getByRole('combobox', { name: 'Reset sample' });
      assert.equal(await source.getAttribute('aria-invalid'), 'true');
      assert.equal(await source.getAttribute('aria-errormessage'), 'fixture-error');
      await source.click(); await p.getByRole('option', { name: 'Gamma', exact: true }).click();
      assert.equal(await p.locator('select').inputValue(), 'gamma');
      assert.equal(await p.evaluate(() => new FormData(document.querySelector('form')).get('sample')), 'gamma');
      assert.equal(await p.evaluate(() => window.selectChanges), 1);
      await source.click();
      await p.evaluate(() => document.querySelector('form').reset());
      await p.waitForFunction(() => document.querySelector('[role="combobox"]').textContent.includes('Alpha'),undefined,{timeout:3000}).catch(async error=>{
        error.message += ` Reset state: ${JSON.stringify(await p.evaluate(()=>({native:document.querySelector('select').value,trigger:document.querySelector('[role="combobox"]').textContent,options:[...document.querySelectorAll('select option')].map(option=>({value:option.value,selected:option.selected,defaultSelected:option.defaultSelected}))})))}`;
        throw error;
      });
      assert.equal(await p.locator('select').inputValue(), 'alpha');
      assert.equal(await p.evaluate(() => new FormData(document.querySelector('form')).get('sample')), 'alpha');
      assert.equal(await source.getAttribute('aria-expanded'), 'false');
      assert.equal(await p.evaluate(() => window.selectChanges), 1, 'Native reset does not emit change');
      await source.click(); await p.getByRole('option', { name: 'Gamma', exact: true }).click();
      await p.getByRole('button', { name: 'Reset form', exact: true }).click();
      await p.waitForFunction(() => document.querySelector('[role="combobox"]').textContent.includes('Alpha'));
      await source.click(); await p.getByRole('option', { name: 'Gamma', exact: true }).click();
      await p.evaluate(() => {
        const form = document.querySelector('form');
        form.addEventListener('reset', event => event.preventDefault(), { once: true });
        form.reset();
      });
      assert.equal(await p.locator('select').inputValue(), 'gamma');
      assert.ok((await source.innerText()).includes('Gamma'));
      await source.focus(); await p.keyboard.press('Home'); await p.keyboard.press('ArrowDown');
      assert.match(await source.getAttribute('aria-activedescendant'), /-2$/, 'The active option skips the disabled row');
      await p.keyboard.press('Enter');
      assert.equal(await p.locator('select').inputValue(), 'gamma', 'Keyboard skips disabled option');
    } finally { await harness.p.close(); await harness.close(); }
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
    const response = await c.request.get(new URL(href, origin).href);
    assert.equal(response.status(), 200); assert.match(response.headers()['content-type'], /application\/pdf/);
    assert.ok((await response.body()).subarray(0,5).equals(Buffer.from('%PDF-')));
    let downloaded;
    p.on('download', download => { downloaded = download; });
    const sourceRequest = p.waitForRequest(request => request.isNavigationRequest() && new URL(request.url()).pathname === new URL(href, origin).pathname);
    await link.focus(); await p.keyboard.press('Enter');
    await sourceRequest;
    // Headless Chromium/Firefox download PDFs; a PDF-capable browser can navigate.
    await p.waitForFunction(() => !document.querySelector('[data-app-id="projectActivity"]'), undefined, { timeout: 4000 }).catch(async () => {
      assert.ok(downloaded, 'The native source link causes either a document navigation or a real PDF download');
      assert.equal(await downloaded.failure(), null);
    });
  });
  await challenge('PDF: forced worker-module failure exposes retry and original source; retry recovers',async c=>{
    let fail=true;
    await c.route('**/_vendor/pdfjs/pdf.min.mjs*',r=>fail?r.fulfill({status:503,body:'unavailable',contentType:'text/javascript'}):r.continue());
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
    await c.route(settingsChunk,async r=>{await hold; await r.fulfill({status:503,contentType:'text/javascript',body:'unavailable'});});
    const p=await c.newPage(); track(p, '/en-gb/settings:failed-module'); p.setDefaultTimeout(25000); await p.emulateMedia({reducedMotion:'reduce'});
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
    await c.unroute(settingsChunk);
    await p.getByRole('button',{name:'Samuel menu',exact:true}).click();
    await p.getByRole('menuitem',{name:'Settings',exact:true}).click();
    await app(p,'settings').getByRole('button',{name:'Reload page',exact:true}).click();
    await app(p,'settings').getByRole('heading',{name:'Make this desktop yours.',exact:true}).waitFor();
  });
  await challenge('HTTP LAN: real insecure context saves simultaneous Note Pad and Quick List edits and reloads', async c => {
    assert.ok(insecureOrigin, 'Set INSECURE_REVIEW_ORIGIN to a reachable non-loopback HTTP preview');
    const a = await page(c, '/en-gb/desk', undefined, insecureOrigin);
    const b = await page(c, '/en-gb/desk', undefined, insecureOrigin);
    const capabilities = await a.evaluate(() => ({ secure: isSecureContext, randomUUID: typeof crypto.randomUUID, locks: typeof navigator.locks }));
    assert.equal(capabilities.secure, false, 'The actual browser origin must be insecure');
    assert.equal(capabilities.randomUUID, 'undefined'); assert.equal(capabilities.locks, 'undefined');
    report.measurements.push({ name: 'insecure-context capabilities', ...capabilities });
    const open = async (p, name, id) => {
      await app(p,'desk').getByRole('button',{name:new RegExp(`^Open ${name}\\.`)}).click();
      await app(p,id).getByText('Saved on this browser',{exact:true}).waitFor();
    };
    await open(a,'Note Pad','notepad'); await open(b,'Note Pad','notepad');
    await app(b,'notepad').getByRole('button',{name:'Next page',exact:true}).click();
    await Promise.all([app(a,'notepad').locator('textarea').fill('LAN PAGE A'),app(b,'notepad').locator('textarea').fill('LAN PAGE B')]);
    await a.waitForFunction(() => {
      const data = JSON.parse(localStorage.getItem('samuel-system7-notepad-v1') ?? 'null');
      return data?.pages[0] === 'LAN PAGE A' && data?.pages[1] === 'LAN PAGE B';
    });
    for(const p of [a,b]){
      await p.getByRole('button',{name:'Samuel menu',exact:true}).click();
      await p.getByRole('menuitem',{name:'Desk Accessories',exact:true}).click();
      await open(p,'Quick List','tasks');
    }
    await app(a,'tasks').getByLabel('New task',{exact:true}).fill('LAN TASK A');
    await app(b,'tasks').getByLabel('New task',{exact:true}).fill('LAN TASK B');
    await Promise.all([app(a,'tasks').getByRole('button',{name:'Add task',exact:true}).click(),app(b,'tasks').getByRole('button',{name:'Add task',exact:true}).click()]);
    await a.waitForFunction(() => {
      const items = JSON.parse(localStorage.getItem('samuel-system7-tasks-v1') ?? 'null')?.data.items;
      return items?.length === 2 && items.some(item=>item.text==='LAN TASK A') && items.some(item=>item.text==='LAN TASK B');
    });
    await a.reload();
    await settleShell(a);
    if (!await app(a,'tasks').count()) await open(a,'Quick List','tasks');
    await app(a,'tasks').getByText('Saved on this browser',{exact:true}).waitFor();
    await app(a,'tasks').getByText('LAN TASK A',{exact:true}).waitFor();
    await app(a,'tasks').getByText('LAN TASK B',{exact:true}).waitFor();
    await app(a,'tasks').getByRole('button',{name:'Close Quick List',exact:true}).click();
    await open(a,'Note Pad','notepad');
    const visibleNote=await app(a,'notepad').locator('textarea').inputValue();
    assert.ok(['LAN PAGE A','LAN PAGE B'].includes(visibleNote));
    await app(a,'notepad').getByRole('button',{name:visibleNote==='LAN PAGE A'?'Next page':'Previous page',exact:true}).click();
    assert.equal(await app(a,'notepad').locator('textarea').inputValue(),visibleNote==='LAN PAGE A'?'LAN PAGE B':'LAN PAGE A');
  });
  await challenge('recovery: malformed records survive valid edits, canonical export and opaque raw download', async c => {
    const noteKey = 'samuel-system7-notepad-v1';
    const records = {
      [`${noteKey}:pending:1700000000000000:bad`]: '{malformed-original',
      [`${noteKey}:conflict:1700000000000001:bad`]: JSON.stringify({key:'forged-key',current:{pages:[]},incoming:{pages:[]}}),
      'samuel-system7-tasks-v1:conflict:1700000000000002:bad': '{bad-task-conflict',
      'samuel-system7-sketch-v1': '{malformed-canonical',
    };
    const p = await page(c,'/en-gb/desk');
    await p.evaluate(records => Object.entries(records).forEach(([key,raw])=>localStorage.setItem(key,raw)), records);
    await app(p,'desk').getByRole('button',{name:/^Open Note Pad\./}).click();
    await app(p,'notepad').getByText('Unreadable drafts kept in this browser',{exact:true}).waitFor();
    await app(p,'notepad').locator('textarea').fill('VALID EDIT WITH MALFORMED RECORDS');
    await p.waitForFunction(() => JSON.parse(localStorage.getItem('samuel-system7-notepad-v1') ?? 'null')?.pages[0] === 'VALID EDIT WITH MALFORMED RECORDS');
    await app(p,'notepad').getByText('Unreadable drafts kept in this browser',{exact:true}).waitFor();
    await app(p,'notepad').getByRole('button',{name:'Close Note Pad',exact:true}).click();
    const canonicalDownload = p.waitForEvent('download');
    await app(p,'desk').getByRole('button',{name:'Export backup',exact:true}).click();
    const backup = await canonicalDownload;
    assert.equal(await backup.failure(),null);
    const { readFile } = await import('node:fs/promises');
    const saved = JSON.parse(await readFile(await backup.path(),'utf8'));
    assert.equal(JSON.parse(saved.apps[noteKey]).pages[0], 'VALID EDIT WITH MALFORMED RECORDS');
    assert.equal(saved.apps['samuel-system7-sketch-v1'], undefined);
    await app(p,'desk').getByText('Readable desk data downloaded. Recovery records remain in this browser.',{exact:true}).waitFor();
    const rawDownload = p.waitForEvent('download');
    await app(p,'desk').getByRole('button',{name:'Download recovery records',exact:true}).click();
    const downloaded = await rawDownload;
    assert.equal(await downloaded.failure(), null);
    const raw = await readFile(await downloaded.path(), 'utf8');
    const recovered = JSON.parse(raw);
    assert.equal(recovered.format,'samuel-desk-recovery-records');
    assert.equal(recovered.apps,undefined);
    for(const [key,value] of Object.entries(records)){
      assert.equal(recovered.records.find(record=>record.key===key)?.raw,value);
      assert.equal(await p.evaluate(key=>localStorage.getItem(key),key),value);
    }
    const before = await p.evaluate(()=>({...localStorage}));
    await app(p,'desk').locator('input[type="file"]').setInputFiles({name:'raw-recovery.json',mimeType:'application/json',buffer:Buffer.from(raw)});
    await app(p,'desk').getByText('That file is not a valid Desk Accessories backup.',{exact:true}).waitFor();
    assert.deepEqual(await p.evaluate(()=>({...localStorage})),before, 'Opaque recovery is never trusted as importable data');
    await p.reload(); await settleShell(p); await app(p,'desk').getByRole('button',{name:/^Open Note Pad\./}).click();
    await app(p,'notepad').getByText('Unreadable drafts kept in this browser',{exact:true}).waitFor();
    assert.equal(await app(p,'notepad').locator('textarea').inputValue(),'VALID EDIT WITH MALFORMED RECORDS');
  });
  await challenge('recovery: corrupt, unsupported and invalid primary bytes survive first valid edit and raw export', async c => {
    const noteKey='samuel-system7-notepad-v1';
    for(const [kind,original] of [
      ['malformed','{primary-original'],
      ['version',JSON.stringify({version:2,activePage:0,pages:['Future version',...Array(7).fill('')]})],
      ['schema',JSON.stringify({version:1,activePage:0,pages:[42,...Array(7).fill('')]})],
    ]){
      const p=await page(c,'/en-gb/desk');
      await p.evaluate(({noteKey,original})=>{localStorage.clear();localStorage.setItem(noteKey,original);},{noteKey,original});
      await app(p,'desk').getByRole('button',{name:/^Open Note Pad\./}).click();
      await app(p,'notepad').getByText('Unreadable drafts kept in this browser',{exact:true}).waitFor();
      assert.equal(await p.evaluate(key=>localStorage.getItem(key),noteKey),original,'Opening alone must preserve the original');
      const replacement=`VALID ${kind} REPLACEMENT`;
      await app(p,'notepad').locator('textarea').fill(replacement);
      await p.waitForFunction(({key,replacement})=>{
        try { return JSON.parse(localStorage.getItem(key)??'null')?.pages[0]===replacement; }
        catch { return false; }
      },{key:noteKey,replacement});
      await app(p,'notepad').getByText('Unreadable drafts kept in this browser',{exact:true}).waitFor();
      await app(p,'notepad').getByRole('button',{name:'Close Note Pad',exact:true}).click();
      const pending=p.waitForEvent('download');
      await app(p,'desk').getByRole('button',{name:'Download recovery records',exact:true}).click();
      const download=await pending; assert.equal(await download.failure(),null);
      const {readFile}=await import('node:fs/promises');
      const recovered=JSON.parse(await readFile(await download.path(),'utf8'));
      const opaque=recovered.records.find(record=>record.key.startsWith(`${noteKey}:conflict:`)&&record.key.endsWith(':unreadable-primary'));
      assert.ok(opaque);
      assert.equal(JSON.parse(opaque.raw).format,'samuel-desk-unreadable-primary');
      assert.equal(JSON.parse(opaque.raw).raw,original);
      assert.equal(JSON.parse(recovered.records.find(record=>record.key===noteKey).raw).pages[0],replacement);
      await p.close();
    }
  });
  await challenge('recovery: quota failure preserving primary retains original and latest edit, then retries', async c => {
    const p=await page(c,'/en-gb/desk');
    await p.evaluate(()=>{
      localStorage.setItem('samuel-system7-notepad-v1','{quota-original');
      window.allowPrimaryPreservation=false;
      const original=Storage.prototype.setItem;
      Storage.prototype.setItem=function(key,value){
        if(this===localStorage&&key.endsWith(':unreadable-primary')&&!window.allowPrimaryPreservation) throw new DOMException('Test quota','QuotaExceededError');
        return original.call(this,key,value);
      };
    });
    await app(p,'desk').getByRole('button',{name:/^Open Note Pad\./}).click();
    await app(p,'notepad').getByText('Unreadable drafts kept in this browser',{exact:true}).waitFor();
    await app(p,'notepad').locator('textarea').fill('LATEST WORK DURING QUOTA FAILURE');
    await app(p,'notepad').getByText('Browser storage unavailable',{exact:true}).waitFor();
    assert.equal(await p.evaluate(()=>localStorage.getItem('samuel-system7-notepad-v1')),'{quota-original');
    assert.ok(await p.evaluate(()=>Object.keys(localStorage).some(key=>key.startsWith('samuel-system7-notepad-v1:pending:')&&localStorage.getItem(key).includes('LATEST WORK DURING QUOTA FAILURE'))));
    await p.evaluate(()=>{window.allowPrimaryPreservation=true;window.dispatchEvent(new Event('samuel-desk-storage-restored'));});
    await p.waitForFunction(()=>JSON.parse(localStorage.getItem('samuel-system7-notepad-v1')??'null')?.pages[0]==='LATEST WORK DURING QUOTA FAILURE');
    await app(p,'notepad').getByText('Unreadable drafts kept in this browser',{exact:true}).waitFor();
    const preserved=await p.evaluate(()=>Object.keys(localStorage).filter(key=>key.endsWith(':unreadable-primary')).map(key=>JSON.parse(localStorage.getItem(key)).raw));
    assert.deepEqual(preserved,['{quota-original']);
  });
  await challenge('no JavaScript: localized CV/contact and four-language navigation remain usable', async c => {
    for(const [slug,html,label,notice] of [
      ['en-gb','en-GB','read my CV','JavaScript is turned off.'],
      ['en-us','en-US','read my resume','JavaScript is turned off.'],
      ['zh-cn','zh-CN','阅读我的简历','JavaScript 已关闭。'],
      ['zh-tw','zh-TW','閱讀我的履歷','JavaScript 已關閉。'],
    ]){
      const p=await c.newPage(); await p.goto(`${origin}/${slug}/settings`);
      const main=p.locator('.no-js-notice'); await main.waitFor();
      assert.equal(await p.locator('html').getAttribute('lang'),html);
      assert.ok((await main.innerText()).includes(notice));
      const cv=main.getByRole('link',{name:label,exact:true});
      const response=await c.request.head(new URL(await cv.getAttribute('href'),origin).href);
      assert.equal(response.status(),200); assert.match(response.headers()['content-type'],/application\/pdf/);
      assert.equal(await main.locator('a[href^="mailto:"]').count(),1);
      assert.equal(await main.locator('nav a').count(),4);
      assert.equal(await main.locator('nav a[aria-current="page"]').getAttribute('lang'),html);
      await main.getByRole('link',{name:slug==='en-gb'?'繁體中文':'English (UK)',exact:true}).click();
      assert.equal(await p.locator('html').getAttribute('lang'),slug==='en-gb'?'zh-TW':'en-GB');
      await p.close();
    }
  }, { javaScriptEnabled: false });
  await challenge('accessibility: 200% equivalent viewport reflow and touch target dimensions', async c => {
    for(const slug of ['en-gb','en-us','zh-cn','zh-tw']){
      // 1440×1000 at 200% desktop zoom yields 720×500 CSS pixels. This
      // verifies reflow, not native browser zoom controls or physical devices.
      const p=await page(c,`/${slug}/settings`,{width:720,height:500});
      await overflow(p,'settings');
      await app(p,'settings').getByRole('button').last().scrollIntoViewIfNeeded();
      await p.setViewportSize({width:390,height:844});
      const targets=await app(p,'settings').locator('button, label').evaluateAll(nodes=>nodes.map(node=>{
        const rect=node.getBoundingClientRect(); return {text:node.textContent.trim(),width:rect.width,height:rect.height};
      }).filter(target=>target.width>0 && target.height>0));
      for(const target of targets) assert.ok(target.width>=44 && target.height>=44,`${slug}: touch target ${JSON.stringify(target)}`);
      report.measurements.push({name:'settings touch targets',slug,targets});
      await p.screenshot({path:`${out}/adversarial-${engine}-${slug}-touch.png`});
      await p.close();
    }
  }, { hasTouch: true });
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
  await writeFile(`.codex/reports/app-audit/adversarial-${engine}${process.env.REVIEW_REPORT_SUFFIX??''}${process.env.ADVERSARIAL_GROUP?'-focused':''}.json`,JSON.stringify(report,null,2));
  await browser?.close();
}
if(report.launchError||report.pageErrors.length||report.tests.some(t=>t.result==='FAIL')) process.exitCode=1;
