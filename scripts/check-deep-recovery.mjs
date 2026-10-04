// Deep persistence/control challenges use disposable contexts and actual components.
// External QA dependencies: Playwright and esbuild; no application dependency.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';

const require = createRequire(import.meta.url);
if (!process.env.PLAYWRIGHT_CORE_PATH) throw new Error('Set PLAYWRIGHT_CORE_PATH to the external QA Playwright installation.');
const pw = require(process.env.PLAYWRIGHT_CORE_PATH);
const engine = process.env.BROWSER_ENGINE ?? 'chromium';
const origin = process.env.REVIEW_ORIGIN ?? 'http://127.0.0.1:5186';
const report = { engine, version: null, started: new Date().toISOString(), tests: [], pageErrors: [] };
const noteKey = 'samuel-system7-notepad-v1';
const focusKey = 'samuel-system7-focus-v1';
const restoreUnavailable = 'Restore unavailable in this browser. Current data and recovery records may still be available; export them before retrying.';
const app = (p, id) => p.locator(`[data-app-id="${id}"]`);
const notebook = text => JSON.stringify({ version: 1, activePage: 0, pages: [text, ...Array(7).fill('')] });
const backupFile = apps => ({ name: 'test-desk-backup.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ version: 1, apps })) });
let browser;
function track(p, location) { p.on('pageerror', error => report.pageErrors.push({ location, message: error.message, stack: error.stack })); }
async function ready(p) {
  await p.waitForFunction(() => document.documentElement.dataset.reduceEffects !== undefined);
  await p.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const guide = p.getByRole('button', { name: /^(Got it|知道了|明白了|了解了)$/ });
  if (await guide.count()) { await guide.click(); await guide.waitFor({ state: 'hidden' }); }
}
async function page(c) {
  const p = await c.newPage(); p.setDefaultTimeout(15000); track(p, 'desk');
  await p.goto(`${origin}/en-gb/desk`); await ready(p); return p;
}
async function open(p, name, id) {
  await app(p, 'desk').getByRole('button', { name: new RegExp(`^Open ${name}\\.`) }).click();
  await app(p, id).waitFor();
}
async function desk(p) {
  await p.getByRole('button', { name: 'Samuel menu', exact: true }).click();
  await p.getByRole('menuitem', { name: 'Desk Accessories', exact: true }).click();
}
async function restore(p, apps) {
  p.once('dialog', dialog => dialog.accept());
  await app(p, 'desk').locator('input[type="file"]').setInputFiles(backupFile(apps));
  await app(p, 'desk').getByText('Backup restored. Open accessories are refreshed.', { exact: true }).waitFor();
}
async function check(name, run) {
  if (process.env.DEEP_GROUP && !new RegExp(process.env.DEEP_GROUP).test(name)) return;
  const c = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  try { await run(c); report.tests.push({ name, result: 'PASS' }); console.log(`PASS ${engine}: ${name}`); }
  catch (error) { report.tests.push({ name, result: 'FAIL', error: error.stack }); console.log(`FAIL ${engine}: ${name}: ${error.message}`); }
  finally { await c.close(); }
}
async function harness(c, contents) {
  const esbuild = require(process.env.ESBUILD_PATH ?? path.join(path.dirname(process.env.PLAYWRIGHT_CORE_PATH), 'esbuild'));
  const result = await esbuild.build({ stdin: { contents, resolveDir: process.cwd(), loader: 'jsx' }, bundle: true, write: false,
    outfile: '/tmp/deep-harness.js', jsx: 'automatic', loader: { '.module.css': 'local-css' }, define: { 'process.env.NODE_ENV': '"production"' } });
  const assets = new Map(result.outputFiles.map(file => [`/${path.basename(file.path)}`, file.contents]));
  const server = createServer((request, response) => {
    if (request.url === '/') { response.setHeader('Content-Type', 'text/html'); response.end('<!doctype html><html lang="en"><head><link rel="stylesheet" href="/deep-harness.css"></head><body><div id="mount"></div><script src="/deep-harness.js"></script></body></html>'); }
    else if (assets.has(request.url)) { response.setHeader('Content-Type', request.url.endsWith('.css') ? 'text/css' : 'text/javascript'); response.end(assets.get(request.url)); }
    else { response.writeHead(404); response.end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const p = await c.newPage(); p.setDefaultTimeout(10000); track(p, 'mounted harness');
  await p.goto(`http://127.0.0.1:${server.address().port}`); await p.locator('#mount > *').waitFor();
  return { p, close: async () => { await p.close(); server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); } };
}
try {
  browser = await pw[engine].launch({ headless: true, ...(engine === 'chromium' ? { args: ['--no-sandbox'] } : {}) });
  report.version = browser.version();
  await check('restore: open dirty editor is flushed before import and imported data wins', async c => {
    await c.addInitScript(() => {
      // Hold the ordinary debounce to model a recently typed edit when Restore
      // begins. Native flush/restore events still run through the real hook.
      const original = window.setTimeout;
      window.setTimeout = function(callback, delay, ...args) { return original.call(this, callback, delay === 180 ? 5000 : delay, ...args); };
    });
    const p = await page(c); await open(p, 'Note Pad', 'notepad');
    await app(p, 'notepad').getByText('Saved on this browser', { exact: true }).waitFor();
    await app(p, 'notepad').locator('textarea').fill('DIRTY PRE-IMPORT NOTE');
    await desk(p); await restore(p, { [noteKey]: notebook('IMPORTED NOTE') });
    await p.waitForTimeout(300);
    assert.equal(await p.evaluate(key => JSON.parse(localStorage.getItem(key)).pages[0], noteKey), 'IMPORTED NOTE');
    assert.equal(await app(p, 'notepad').locator('textarea').inputValue(), 'IMPORTED NOTE');
    await p.waitForTimeout(600);
    assert.equal(await p.evaluate(key => JSON.parse(localStorage.getItem(key)).pages[0], noteKey), 'IMPORTED NOTE', 'Imported data stays stable after queued saves');
  });
  await check('restore: omitted running Focus Clock resets instead of resurrecting previous timer', async c => {
    const p = await page(c); await open(p, 'Focus Clock', 'focus');
    await app(p, 'focus').getByRole('button', { name: 'Start', exact: true }).click();
    await p.waitForFunction(key => JSON.parse(localStorage.getItem(key) ?? 'null')?.running === true, focusKey);
    await desk(p); await restore(p, { [noteKey]: notebook('ONLY NOTE IN IMPORT') });
    await p.waitForTimeout(1200);
    const timer = await p.evaluate(key => JSON.parse(localStorage.getItem(key) ?? 'null'), focusKey);
    assert.ok(timer === null || timer.running === false, 'An omitted timer must not resume or reappear as running');
    assert.equal(await app(p, 'focus').getByRole('button', { name: 'Start', exact: true }).count(), 1);
  });
  await check('restore: unsaved editor quota failure aborts replacement and preserves its visible edit', async c => {
    await c.addInitScript(({ noteKey }) => {
      localStorage.setItem(noteKey, JSON.stringify({ version: 1, activePage: 0, pages: ['ORIGINAL NOTE', ...Array(7).fill('')] }));
      const original = window.setTimeout;
      window.setTimeout = function(callback, delay, ...args) { return original.call(this, callback, delay === 180 ? 5000 : delay, ...args); };
      const write = Storage.prototype.setItem;
      Storage.prototype.setItem = function(key, value) {
        if (window.__failDraftWrites && key.startsWith(`${noteKey}:pending:`)) throw new DOMException('Synthetic draft quota failure', 'QuotaExceededError');
        return write.call(this, key, value);
      };
    }, { noteKey });
    const p = await page(c); await open(p, 'Note Pad', 'notepad');
    await app(p, 'notepad').getByText('Saved on this browser', { exact: true }).waitFor();
    await app(p, 'notepad').locator('textarea').fill('UNSAVED NOTE');
    await p.evaluate(() => { window.__failDraftWrites = true; });
    await desk(p); p.once('dialog', dialog => dialog.accept());
    await app(p, 'desk').locator('input[type="file"]').setInputFiles(backupFile({ [noteKey]: notebook('IMPORT THAT MUST NOT REPLACE') }));
    await app(p, 'desk').getByText(restoreUnavailable, { exact: true }).waitFor();
    assert.equal(await p.evaluate(key => JSON.parse(localStorage.getItem(key)).pages[0], noteKey), 'ORIGINAL NOTE');
    assert.equal(await app(p, 'notepad').locator('textarea').inputValue(), 'UNSAVED NOTE');
    await p.evaluate(() => { window.__failDraftWrites = false; window.dispatchEvent(new Event('samuel-desk-storage-flush')); });
    await p.waitForFunction(key => JSON.parse(localStorage.getItem(key)).pages[0] === 'UNSAVED NOTE', noteKey);
  });
  await check('restore: write failure rolls back valid entries and reports a browser failure', async c => {
    const p = await page(c);
    await p.evaluate(({ noteKey, focusKey }) => {
      localStorage.setItem(noteKey, JSON.stringify({ version: 1, activePage: 0, pages: ['ROLLBACK ORIGINAL', ...Array(7).fill('')] }));
      const write = Storage.prototype.setItem;
      Storage.prototype.setItem = function(key, value) {
        if (key === focusKey && window.__failFocusOnce) { window.__failFocusOnce = false; throw new DOMException('Synthetic restore quota failure', 'QuotaExceededError'); }
        return write.call(this, key, value);
      };
      window.__failFocusOnce = true;
    }, { noteKey, focusKey });
    p.once('dialog', dialog => dialog.accept());
    const clock = JSON.stringify({ version: 1, durationSeconds: 1500, remainingSeconds: 1500, endsAt: null, running: false, completedDate: '2026-10-04', completedCount: 0 });
    await app(p, 'desk').locator('input[type="file"]').setInputFiles(backupFile({ [noteKey]: notebook('ROLLBACK IMPORT'), [focusKey]: clock }));
    await app(p, 'desk').getByText(restoreUnavailable, { exact: true }).waitFor();
    assert.equal(await p.evaluate(key => JSON.parse(localStorage.getItem(key)).pages[0], noteKey), 'ROLLBACK ORIGINAL');
    assert.equal(await p.evaluate(key => localStorage.getItem(key), focusKey), null);
  });
  await check('restore: unreadable primary bytes remain downloadable after a valid import', async c => {
    const raw = '{unreadable-primary-before-import';
    await c.addInitScript(({ noteKey, raw }) => localStorage.setItem(noteKey, raw), { noteKey, raw });
    const p = await page(c); await restore(p, { [noteKey]: notebook('RESTORED OVER UNREADABLE PRIMARY') });
    assert.equal(await p.evaluate(key => JSON.parse(localStorage.getItem(key)).pages[0], noteKey), 'RESTORED OVER UNREADABLE PRIMARY');
    const downloadPromise = p.waitForEvent('download'); await app(p, 'desk').getByRole('button', { name: 'Download recovery records', exact: true }).click();
    const download = await downloadPromise; const stream = await download.createReadStream(); const chunks = []; for await (const chunk of stream) chunks.push(chunk);
    const recovery = JSON.parse(Buffer.concat(chunks));
    const archived = recovery.records.filter(record => record.key.startsWith(`${noteKey}:conflict:`)).map(record => JSON.parse(record.raw));
    assert.ok(archived.some(record => record.format === 'samuel-desk-unreadable-primary' && record.raw === raw), 'Restoring must preserve the exact unreadable primary bytes');
  });
  await check('restore: quota failure preserving unreadable primary aborts before canonical replacement', async c => {
    const raw = JSON.stringify({ version: 2, pages: ['FUTURE PRIMARY'] });
    await c.addInitScript(({ noteKey, raw }) => {
      localStorage.setItem(noteKey, raw);
      const write = Storage.prototype.setItem;
      Storage.prototype.setItem = function(key, value) {
        if (key.startsWith(`${noteKey}:conflict:`)) throw new DOMException('Synthetic recovery archive quota failure', 'QuotaExceededError');
        return write.call(this, key, value);
      };
    }, { noteKey, raw });
    const p = await page(c); p.once('dialog', dialog => dialog.accept());
    await app(p, 'desk').locator('input[type="file"]').setInputFiles(backupFile({ [noteKey]: notebook('MUST NOT REPLACE FUTURE DATA') }));
    await app(p, 'desk').getByText(restoreUnavailable, { exact: true }).waitFor();
    assert.equal(await p.evaluate(key => localStorage.getItem(key), noteKey), raw);
  });
  await check('restore: malformed pending drafts block replacement and remain untouched', async c => {
    await c.addInitScript(({ noteKey }) => {
      localStorage.setItem(noteKey, JSON.stringify({ version: 1, activePage: 0, pages: ['CURRENT NOTE', ...Array(7).fill('')] }));
      localStorage.setItem(`${noteKey}:pending:1:corrupt`, '{partial pending');
    }, { noteKey });
    const p = await page(c); p.once('dialog', dialog => dialog.accept());
    await app(p, 'desk').locator('input[type="file"]').setInputFiles(backupFile({ [noteKey]: notebook('MUST NOT REPLACE CURRENT NOTE') }));
    await app(p, 'desk').getByText(restoreUnavailable, { exact: true }).waitFor();
    assert.equal(await p.evaluate(key => JSON.parse(localStorage.getItem(key)).pages[0], noteKey), 'CURRENT NOTE');
    assert.equal(await p.evaluate(key => localStorage.getItem(`${key}:pending:1:corrupt`), noteKey), '{partial pending');
  });
  await check('restore: another tab keeps an overlapping dirty draft and both complete versions are recoverable', async c => {
    await c.addInitScript(() => {
      const original = window.setTimeout;
      window.setTimeout = function(callback, delay, ...args) { return original.call(this, callback, delay === 180 ? 5000 : delay, ...args); };
    });
    const importing = await page(c); const editing = await page(c); await open(editing, 'Note Pad', 'notepad');
    await app(editing, 'notepad').getByText('Saved on this browser', { exact: true }).waitFor();
    await app(editing, 'notepad').locator('textarea').fill('OTHER TAB DIRTY NOTE');
    await restore(importing, { [noteKey]: notebook('IMPORT IN FIRST TAB') });
    assert.equal(await importing.evaluate(key => JSON.parse(localStorage.getItem(key)).pages[0], noteKey), 'IMPORT IN FIRST TAB');
    assert.equal(await app(editing, 'notepad').locator('textarea').inputValue(), 'OTHER TAB DIRTY NOTE');
    await editing.evaluate(() => window.dispatchEvent(new Event('samuel-desk-storage-flush')));
    await editing.waitForFunction(key => Object.keys(localStorage).some(entry => entry.startsWith(`${key}:conflict:`)), noteKey);
    const versions = await editing.evaluate(key => Object.keys(localStorage).filter(entry => entry.startsWith(`${key}:conflict:`)).flatMap(entry => {
      const conflict = JSON.parse(localStorage.getItem(entry)); return [conflict.current.pages[0], conflict.incoming.pages[0]];
    }), noteKey);
    assert.deepEqual(new Set(versions), new Set(['IMPORT IN FIRST TAB', 'OTHER TAB DIRTY NOTE']));
    assert.equal(await app(editing, 'notepad').locator('textarea').inputValue(), 'OTHER TAB DIRTY NOTE');
    await app(editing, 'notepad').getByText('Another tab edited the same data. Both drafts are kept here until you dismiss them.', { exact: true }).waitFor();
  });
  await check('restore: another tab merges an independent notebook page without losing the imported page', async c => {
    await c.addInitScript(() => {
      const original = window.setTimeout;
      window.setTimeout = function(callback, delay, ...args) { return original.call(this, callback, delay === 180 ? 5000 : delay, ...args); };
    });
    const importing = await page(c); const editing = await page(c); await open(editing, 'Note Pad', 'notepad');
    await app(editing, 'notepad').getByText('Saved on this browser', { exact: true }).waitFor();
    await app(editing, 'notepad').getByRole('button', { name: 'Next page', exact: true }).click();
    await app(editing, 'notepad').locator('textarea').fill('OTHER TAB PAGE TWO');
    await restore(importing, { [noteKey]: notebook('IMPORTED PAGE ONE') });
    await editing.evaluate(() => window.dispatchEvent(new Event('samuel-desk-storage-flush')));
    await editing.waitForFunction(key => JSON.parse(localStorage.getItem(key)).pages[1] === 'OTHER TAB PAGE TWO', noteKey);
    assert.deepEqual(await editing.evaluate(key => JSON.parse(localStorage.getItem(key)).pages.slice(0, 2), noteKey), ['IMPORTED PAGE ONE', 'OTHER TAB PAGE TWO']);
    assert.equal(await editing.evaluate(key => Object.keys(localStorage).filter(entry => entry.startsWith(`${key}:conflict:`)).length, noteKey), 0);
  });
  await check('hook: a delayed initial lock cannot rewind an already staged edit', async c => {
    const fixture = await harness(c, `import React from 'react';import{createRoot}from'react-dom/client';import{useDeskPersistence}from'./src/hooks/useDeskPersistence.ts';
      const key='samuel-deep-hook-v1';localStorage.setItem(key,JSON.stringify({version:1,data:{text:'OLD'}}));
      window.__queuedLocks=[];Object.defineProperty(navigator,'locks',{value:{request(name,action){return new Promise((resolve,reject)=>window.__queuedLocks.push({action,resolve,reject}));}}});
      window.__releaseLock=async()=>{const next=window.__queuedLocks.shift();try{next.resolve(await next.action())}catch(error){next.reject(error)}};
      const validate=value=>value&&typeof value.text==='string'?value:null;
      function App(){const[value,setValue,state]=useDeskPersistence(key,{text:''},validate);return <main><input aria-label="Edit" value={value.text} onChange={event=>setValue({text:event.target.value})}/><output>{state}</output></main>}
      createRoot(document.getElementById('mount')).render(<App/>);`);
    try {
      const p = fixture.p; await p.waitForFunction(() => window.__queuedLocks.length === 1);
      await p.getByRole('textbox', { name: 'Edit' }).fill('NEW');
      await p.evaluate(() => window.dispatchEvent(new Event('samuel-desk-storage-flush')));
      await p.waitForFunction(() => window.__queuedLocks.length === 2);
      await p.evaluate(() => window.dispatchEvent(new StorageEvent('storage', { key: 'samuel-deep-hook-v1', storageArea: localStorage })));
      await p.waitForFunction(() => window.__queuedLocks.length === 3);
      assert.equal(await p.getByRole('textbox', { name: 'Edit' }).inputValue(), 'NEW', 'An initial storage refresh must not replace a staged edit with old canonical data');
      for (let index = 0; index < 3; index++) await p.evaluate(() => window.__releaseLock());
      await p.getByText('saved', { exact: true }).waitFor();
      assert.equal(await p.getByRole('textbox', { name: 'Edit' }).inputValue(), 'NEW');
    } finally { await fixture.close(); }
  });
  await check('hook: repeated mount/close cleans listeners and durably stages the last edit', async c => {
    const fixture = await harness(c, `import React,{useState} from 'react';import{createRoot}from'react-dom/client';import{useDeskPersistence}from'./src/hooks/useDeskPersistence.ts';
      const monitored=new Set(['storage','pagehide','samuel-desk-storage-flush','samuel-desk-storage-restored']);window.__listeners={};
      const add=window.addEventListener.bind(window),remove=window.removeEventListener.bind(window);window.addEventListener=(name,listener,...args)=>{if(monitored.has(name)){(window.__listeners[name]??=new Set()).add(listener)}return add(name,listener,...args)};window.removeEventListener=(name,listener,...args)=>{window.__listeners[name]?.delete(listener);return remove(name,listener,...args)};
      const validate=value=>value&&typeof value.text==='string'?value:null;
      function Editor(){const[value,setValue,state]=useDeskPersistence('samuel-deep-hook-v1',{text:''},validate);return <section><input aria-label="Edit" value={value.text} onChange={event=>setValue({text:event.target.value})}/><output>{state}</output></section>}
      function App(){const[open,setOpen]=useState(true);return <main><button onClick={()=>setOpen(!open)}>Toggle editor</button>{open&&<Editor/>}</main>}
      createRoot(document.getElementById('mount')).render(<App/>);`);
    try {
      const p = fixture.p;
      for (let index = 0; index < 8; index++) {
        await p.getByText('saved', { exact: true }).waitFor();
        assert.deepEqual(await p.evaluate(() => Object.values(window.__listeners).map(set => set.size)), [1, 1, 1, 1]);
        if (index) assert.equal(await p.getByRole('textbox', { name: 'Edit' }).inputValue(), `FINAL EDIT ${index - 1}`);
        await p.getByRole('textbox', { name: 'Edit' }).fill(`FINAL EDIT ${index}`);
        await p.getByRole('button', { name: 'Toggle editor' }).click();
        await p.getByRole('textbox', { name: 'Edit' }).waitFor({ state: 'hidden' });
        assert.deepEqual(await p.evaluate(() => Object.values(window.__listeners).map(set => set.size)), [0, 0, 0, 0]);
        await p.waitForFunction(text => JSON.parse(localStorage.getItem('samuel-deep-hook-v1') ?? 'null')?.data.text === text, `FINAL EDIT ${index}`);
        await p.getByRole('button', { name: 'Toggle editor' }).click();
      }
    } finally { await fixture.close(); }
  });
  await check('recovery: corrupt conflicts remain opaque and forged dismissal keys cannot delete unrelated data', async c => {
    await c.addInitScript(({ noteKey }) => {
      const data = text => ({ activePage: 0, pages: [text, ...Array(7).fill('')] });
      localStorage.setItem(noteKey, JSON.stringify({ version: 1, ...data('CURRENT NOTE') }));
      localStorage.setItem(`${noteKey}:conflict:1:valid`, JSON.stringify({ key: 'unrelated-data', current: data('PREVIOUS NOTE'), incoming: data('INCOMING NOTE') }));
      localStorage.setItem(`${noteKey}:conflict:2:corrupt`, '{partial conflict');
      localStorage.setItem('unrelated-data', 'MUST REMAIN');
    }, { noteKey });
    const p = await page(c); await open(p, 'Note Pad', 'notepad');
    await app(p, 'notepad').getByText('Unreadable drafts kept in this browser', { exact: true }).waitFor();
    await app(p, 'notepad').getByText('Review saved drafts', { exact: true }).click();
    await app(p, 'notepad').getByRole('button', { name: 'Use previously saved version', exact: true }).click();
    await p.waitForFunction(key => JSON.parse(localStorage.getItem(key)).pages[0] === 'PREVIOUS NOTE', noteKey);
    await app(p, 'notepad').getByRole('button', { name: 'Keep current data and dismiss drafts', exact: true }).click();
    assert.deepEqual(await p.evaluate(key => ({ corrupt: localStorage.getItem(`${key}:conflict:2:corrupt`), valid: localStorage.getItem(`${key}:conflict:1:valid`), unrelated: localStorage.getItem('unrelated-data') }), noteKey), { corrupt: '{partial conflict', valid: null, unrelated: 'MUST REMAIN' });
    await desk(p);
    const downloadPromise = p.waitForEvent('download'); await app(p, 'desk').getByRole('button', { name: 'Download recovery records', exact: true }).click();
    const download = await downloadPromise; const stream = await download.createReadStream(); const chunks = []; for await (const chunk of stream) chunks.push(chunk);
    const recovery = JSON.parse(Buffer.concat(chunks));
    assert.equal(recovery.records.find(record => record.key === `${noteKey}:conflict:2:corrupt`)?.raw, '{partial conflict');
  });
  await check('ClassicSelect: controlled native value and FormData stay aligned after form reset', async c => {
    const fixture = await harness(c, `import React,{useState} from 'react';import{createRoot}from'react-dom/client';import ClassicSelect from './src/components/ClassicSelect.tsx';
      function App(){const[value,setValue]=useState('gamma');return <form id="fixture"><ClassicSelect name="choice" value={value} aria-label="Controlled choice" onChange={event=>setValue(event.target.value)}><option value="alpha">Alpha</option><option value="beta">Beta</option><option value="gamma">Gamma</option></ClassicSelect><button type="reset">Reset</button></form>}
      createRoot(document.getElementById('mount')).render(<App/>);`);
    try {
      const p = fixture.p; const trigger = p.getByRole('combobox', { name: 'Controlled choice' });
      await trigger.click(); await p.getByRole('option', { name: 'Beta', exact: true }).click();
      assert.equal(await p.locator('select').inputValue(), 'beta');
      await p.getByRole('button', { name: 'Reset', exact: true }).click();
      await p.waitForTimeout(50);
      assert.ok((await trigger.innerText()).includes('Beta'));
      assert.equal(await p.locator('select').inputValue(), 'beta');
      assert.equal(await p.evaluate(() => new FormData(document.querySelector('form')).get('choice')), 'beta');
    } finally { await fixture.close(); }
  });
  await check('ClassicSelect: parent reset updates, cancelled reset and external form association', async c => {
    const fixture = await harness(c, `import React,{useState} from 'react';import{createRoot}from'react-dom/client';import ClassicSelect from './src/components/ClassicSelect.tsx';
      function App(){const[value,setValue]=useState('gamma');const[cancel,setCancel]=useState(false);return <main><form id="fixture" onReset={event=>cancel?event.preventDefault():setValue('alpha')}><button type="reset">Reset</button></form><ClassicSelect form="fixture" name="choice" value={value} aria-label="External choice" onChange={event=>setValue(event.target.value)}><option value="alpha">Alpha</option><option value="beta">Beta</option><option value="gamma">Gamma</option></ClassicSelect><button onClick={()=>setCancel(true)}>Cancel resets</button></main>}
      createRoot(document.getElementById('mount')).render(<App/>);`);
    try {
      const p = fixture.p; const trigger = p.getByRole('combobox', { name: 'External choice' });
      await trigger.click(); await p.getByRole('option', { name: 'Beta', exact: true }).click();
      await p.getByRole('button', { name: 'Reset', exact: true }).click(); await p.waitForTimeout(50);
      assert.ok((await trigger.innerText()).includes('Alpha'));
      assert.equal(await p.locator('select').inputValue(), 'alpha');
      assert.equal(await p.evaluate(() => new FormData(document.querySelector('form')).get('choice')), 'alpha');
      await trigger.click(); await p.getByRole('option', { name: 'Gamma', exact: true }).click();
      await p.getByRole('button', { name: 'Cancel resets', exact: true }).click();
      await p.getByRole('button', { name: 'Reset', exact: true }).click(); await p.waitForTimeout(50);
      assert.ok((await trigger.innerText()).includes('Gamma'));
      assert.equal(await p.locator('select').inputValue(), 'gamma');
    } finally { await fixture.close(); }
  });
  await check('ClassicSelect: required form validation focuses the visible control and blocks submit', async c => {
    const fixture = await harness(c, `import React from 'react';import{createRoot}from'react-dom/client';import ClassicSelect from './src/components/ClassicSelect.tsx';
      function App(){return <form onSubmit={event=>{event.preventDefault();document.querySelector('output').textContent='Submitted'}}><ClassicSelect name="choice" defaultValue="" required aria-label="Required choice"><option value="">Choose one</option><option value="beta">Beta</option></ClassicSelect><button type="submit">Submit</button><output>Waiting</output></form>}
      createRoot(document.getElementById('mount')).render(<App/>);`);
    try {
      const p = fixture.p; const trigger = p.getByRole('combobox', { name: 'Required choice' });
      await p.getByRole('button', { name: 'Submit', exact: true }).click();
      assert.equal(await p.locator('output').innerText(), 'Waiting');
      assert.equal(await trigger.evaluate(element => element === document.activeElement), true, 'Required invalid select must focus its visible combobox');
      assert.equal(await trigger.getAttribute('aria-invalid'), 'true');
      await trigger.click(); await p.getByRole('option', { name: 'Beta', exact: true }).click();
      await p.getByRole('button', { name: 'Submit', exact: true }).click();
      assert.equal(await p.locator('output').innerText(), 'Submitted');
      assert.equal(await trigger.getAttribute('aria-invalid'), null);
    } finally { await fixture.close(); }
  });
} catch (error) { report.engineError = error.stack; console.log(`ENGINE ERROR ${engine}: ${error.message}`); }
finally {
  report.finished = new Date().toISOString();
  await mkdir('.codex/reports/deep-audit', { recursive: true });
  await writeFile(`.codex/reports/deep-audit/recovery-${engine}${process.env.DEEP_GROUP ? '-focused' : ''}${process.env.REVIEW_REPORT_SUFFIX ?? ''}.json`, JSON.stringify(report, null, 2));
  await browser?.close();
}
if (report.engineError || report.pageErrors.length || report.tests.some(test => test.result !== 'PASS')) process.exitCode = 1;
