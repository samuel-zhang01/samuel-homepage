// Focused phone working-area regression. Browser tools stay outside app dependencies.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync, existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
assert.ok(process.env.PLAYWRIGHT_CORE_PATH, 'Provide an external Playwright installation.');
const pw = require(process.env.PLAYWRIGHT_CORE_PATH);
const engine = process.env.BROWSER_ENGINE ?? 'chromium';
const origin = process.env.REVIEW_ORIGIN ?? 'http://127.0.0.1:5217';
const output = resolve(process.env.PHONE_SPACE_REPORT_DIR ?? '.codex/reports/phone-space');
const cache = new Map();
function load(file) {
  const filename = resolve(root, file);
  if (cache.has(filename)) return cache.get(filename);
  const loaded = { exports: {} }; cache.set(filename, loaded.exports);
  const code = ts.transpileModule(readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function('module', 'exports', 'require', code)(loaded, loaded.exports, name => {
    if (!name.startsWith('.') && !name.startsWith('@/')) return require(name);
    const target = name.startsWith('@/') ? resolve(root, 'src', name.slice(2)) : resolve(dirname(filename), name);
    return load(existsSync(target + '.ts') ? target + '.ts' : target + '.tsx');
  });
  return loaded.exports;
}
const { projects } = load('src/data/projects.ts');
const { localeOptions } = load('src/lib/i18n.ts');
const locales = localeOptions.filter(locale => (process.env.PHONE_SPACE_LOCALES ?? 'en-gb,zh-tw').split(',').includes(locale.slug));
const sizes = (process.env.PHONE_SPACE_SIZES ?? '320x568,390x844').split(',').map(size => size.split('x').map(Number));
assert.ok(locales.length && sizes.every(([w,h]) => w >= 320 && h >= 240));
const cases = projects.filter(project => project.demo).map(project => ({ group: 'demos', id: project.slug, app: 'projectActivity', route: `projects?project=${project.slug}&view=demo`, project }));
cases.push({ group: 'pages', id: 'documents', app: 'documents', route: 'documents' }, { group: 'pages', id: 'desk', app: 'desk', route: 'desk' }, { group: 'pages', id: 'graph', app: 'projects', route: 'projects?view=map' }, { group: 'pages', id: 'orbitals', app: 'orbitals', route: 'orbitals' });
const selected = cases.filter(item => (!process.env.PHONE_SPACE_GROUP || item.group === process.env.PHONE_SPACE_GROUP) && (!process.env.PHONE_SPACE_SLUGS || process.env.PHONE_SPACE_SLUGS.split(',').includes(item.id)));
assert.ok(selected.length);
await mkdir(output, {recursive:true});
const report = { origin, engine, started:new Date().toISOString(), profiles:[], pageErrors:[], resourceErrors:[], qualifications:['Focused working-area checks complement the maintained full journey runner; screenshots require separate visual review.'] };
const browser = await pw[engine].launch({headless:true,...(engine === 'chromium' ? {args:['--no-sandbox'],ignoreDefaultArgs:['--hide-scrollbars']} : {})});
report.browserVersion = browser.version();
async function bounds(locator) { return locator.evaluate(element => { const r=element.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}; }); }
try {
  for (const locale of locales) for (const [width,height] of sizes) for (const item of selected) {
    const context = await browser.newContext({viewport:{width,height},isMobile:engine !== 'firefox',hasTouch:true,reducedMotion:'reduce'});
    await context.addInitScript(() => {sessionStorage.setItem('samuel-mobile-window-guide','seen');sessionStorage.setItem('samuel-system-7-boot','seen');});
    const page=await context.newPage();page.setDefaultTimeout(20_000);
    const test={id:item.id,group:item.group,locale:locale.slug,width,height,checks:[]}; report.profiles.push(test);
    page.on('pageerror',error=>report.pageErrors.push({id:item.id,locale:locale.slug,error:String(error)}));
    page.on('requestfailed',request=>report.resourceErrors.push({id:item.id,url:request.url(),error:request.failure()}));
    try {
      await page.goto(`${origin}/${locale.slug}/${item.route}`,{waitUntil:'networkidle'});
      await page.waitForFunction(() => document.documentElement.dataset.reduceEffects !== undefined);
      const window=page.locator(`[data-app-id="${item.app}"]`); await window.waitFor();
      await window.locator('.classic-module-loading').waitFor({state:'hidden'});
      const pane=window.locator('.mac-window__content'); test.pane=await bounds(pane);
      assert.ok(test.pane.height>=300 || height<568,'Phone retains at least300px of scrollable window content at tested portrait heights.');
      const stem=`${engine}-${locale.slug}-${width}x${height}-${item.id}`;
      if(item.group==='demos') {
        await window.locator('[data-locale]').first().waitFor();
        await window.locator('[class*="ProjectDemoRouter_loading"]').waitFor({state:'hidden'});
        const toolbar=window.locator('[class*="ProjectActivity_toolbar"]');test.toolbar=await bounds(toolbar);
        assert.ok(test.toolbar.height <= (item.id==='coverd-yasa'?118:68), 'Navigation leaves working room instead of repeating a long title.');
        const controls=await toolbar.locator('button,a').evaluateAll(nodes=>nodes.map(node=>({label:node.textContent.trim(),w:node.getBoundingClientRect().width,h:node.getBoundingClientRect().height})));
        assert.ok(controls.every(control=>control.w>=44 && control.h>=44),'Demo navigation keeps44px targets.');
        test.controls=controls;test.checks.push('compact navigation','44px navigation targets');
        await page.screenshot({path:resolve(output,stem+'-top.png')});
        const surface=window.locator('[data-locale]').first();
        // Reach the real largest visible instrument without treating decorative icons as charts.
        const instrument=await surface.locator('canvas,svg[role="img"],svg[viewBox]').evaluateAll(nodes=>nodes.map((node,index)=>({index,area:node.getBoundingClientRect().width*node.getBoundingClientRect().height})).filter(node=>node.area>12000).sort((a,b)=>b.area-a.area)[0]);
        if(instrument){const target=surface.locator('canvas,svg[role="img"],svg[viewBox]').nth(instrument.index);await target.scrollIntoViewIfNeeded();test.instrument=await bounds(target);await page.screenshot({path:resolve(output,stem+'-instrument.png')});test.checks.push('primary instrument reachable');}
        if(item.id==='study-rl') {
          const filters=surface.locator('[class*="RlAtlasDemo_filterBar"]');
          const geometry=await filters.evaluate(element=>({width:element.clientWidth,scrollWidth:element.scrollWidth,controls:[...element.querySelectorAll('button,[role="combobox"],input')].map(node=>{const r=node.getBoundingClientRect();return {x:r.x,right:r.right,height:r.height};})}));
          assert.ok(geometry.scrollWidth<=geometry.width+1 && geometry.controls.every(control=>control.x>=test.pane.x && control.right<=test.pane.x+test.pane.width && control.height>=44),'Every full Study RL filter remains in the phone pane with a44px target.');
          test.filters=geometry;test.checks.push('all Study RL filters reachable without horizontal clipping');
        }
        if(item.id==='safety-critical-ai') {
          const experiment=surface.locator('[class*="LlmPostTrainingLab_coveragePlot"]');
          await experiment.scrollIntoViewIfNeeded();test.secondaryInstrument=await bounds(experiment.locator('svg'));
          assert.ok(test.secondaryInstrument.height>=220,'The lower coverage experiment retains a useful plotting height.');
          await experiment.focus();await page.keyboard.press('ArrowRight');
          await page.waitForFunction(()=>document.querySelector('[class*="LlmPostTrainingLab_coveragePlot"]')?.scrollLeft>0);
          test.secondaryPan=await experiment.evaluate(element=>element.scrollLeft);test.checks.push('readable secondary coverage plot','actual keyboard pan');
          await page.screenshot({path:resolve(output,stem+'-secondary.png')});
        }
        test.overflow=await pane.evaluate(element=>({page:document.documentElement.scrollWidth-document.documentElement.clientWidth,pane:element.scrollWidth-element.clientWidth}));
        const back=toolbar.locator('button').first();await back.scrollIntoViewIfNeeded();await back.focus();await page.keyboard.press('Enter');
        await page.waitForFunction(()=>!location.search.includes('view=demo'));
        assert.ok(await page.locator('[data-app-id="project"]').isVisible(),'Back restores the overview.');
        test.checks.push('keyboard Back restores overview');
      } else if(item.id==='documents') {
        const reader=window.locator('.pdf-reader[data-status="ready"]');await reader.waitFor();
        const canvas=reader.locator('canvas').first();await page.waitForFunction(()=>document.querySelector('[data-app-id="documents"] .pdf-reader canvas')?.width>1);
        test.reader=await bounds(reader.locator('.pdf-reader__stage'));test.canvas=await bounds(canvas);
        assert.ok(test.reader.height>=240,'PDF has a useful reading viewport.');
        const visible=Math.min(test.canvas.y+test.canvas.height,test.pane.y+test.pane.height)-Math.max(test.canvas.y,test.pane.y);
        assert.ok(visible>=120,'A useful PDF area is visible on first open.');test.initialCanvasVisible=visible;
        const contextLink=window.locator('.documents-context a').first();await contextLink.scrollIntoViewIfNeeded();await contextLink.focus();assert.ok(await contextLink.evaluate(node=>node===document.activeElement));
        const finalDocument=window.locator('.documents-library > button').last();await finalDocument.click();assert.equal(await finalDocument.getAttribute('aria-pressed'),'true');
        await window.locator('.pdf-reader[data-status="ready"]').waitFor();test.checks.push('visible initial PDF','240px reader','context links reachable','last document selectable');
        const documentNav=window.locator('.documents-context > .button-row');
        if(await documentNav.count()) {
          const navigation=await documentNav.evaluate(element=>({clientWidth:element.clientWidth,scrollWidth:element.scrollWidth,targets:[...element.querySelectorAll('a')].map(node=>({height:node.getBoundingClientRect().height,width:node.getBoundingClientRect().width}))}));
          assert.ok(navigation.scrollWidth<=navigation.clientWidth+1 && navigation.targets.every(target=>target.height>=44 && target.width>=44),'Both document destinations remain full-size without a hidden horizontal continuation.');
          test.documentNavigation=navigation;test.checks.push('full document destination controls');
        }
      } else if(item.id==='desk') {
        const choices=window.locator('button[class*="accessoryCard"]');assert.equal(await choices.filter({has:page.locator('strong')}).count(),9);
        const first=choices.first();test.firstLauncher=await bounds(first);assert.ok(test.firstLauncher.y < test.pane.y+test.pane.height-44,'A launcher is reachable on first open.');
        const jump=window.locator('a[href="#desk-backup"]');await jump.focus();await page.keyboard.press('Enter');await page.waitForFunction(()=>location.hash==='#desk-backup');
        await page.waitForFunction(()=>{const backup=document.getElementById('desk-backup');const pane=document.querySelector('[data-app-id="desk"] .mac-window__content');if(!backup||!pane)return false;const b=backup.getBoundingClientRect(),p=pane.getBoundingClientRect();return b.y<p.bottom && b.bottom>p.y;});
        const backup=window.locator('#desk-backup');test.backup=await bounds(backup);assert.ok(test.backup.y<test.pane.y+test.pane.height);assert.equal(await backup.locator('button').count(),3);test.checks.push('launchers before backup','keyboard backup jump','three backup actions retained');
      } else if(item.id==='graph') {
        const jump=window.locator('[class*="KnowledgeGraph_phoneJump"]');await jump.focus();await page.keyboard.press('Enter');
        const stage=window.locator('[class*="KnowledgeGraph_stage__"]');test.instrument=await bounds(stage);assert.ok(test.instrument.height>=320);assert.ok(await stage.evaluate(node=>node===document.activeElement));
        const flat=window.getByRole('button',{name:locale.slug==='zh-tw'?'二維檢視':locale.slug==='zh-cn'?'二维视图':'2D view',exact:true});await flat.click();assert.equal(await flat.getAttribute('aria-pressed'),'true');await stage.scrollIntoViewIfNeeded();test.checks.push('keyboard map jump','full map height','projection control');
      } else if(item.id==='orbitals') {
        const jump=window.locator('[class*="OrbitalLab_phoneJump"]');await jump.focus();await page.keyboard.press('Enter');
        const canvas=window.locator('canvas[role="img"]');await page.waitForFunction(()=>{const canvas=document.querySelector('[data-app-id="orbitals"] canvas');if(!canvas || canvas.width<=1)return false;return canvas.getContext('2d')?.getImageData(0,0,canvas.width,canvas.height).data.some((value,index)=>index%4===0 && value<240);});test.instrument=await bounds(canvas);assert.ok(test.instrument.height>=220);assert.ok(await canvas.evaluate(node=>node===document.activeElement));await page.keyboard.press('ArrowRight');test.checks.push('keyboard orbital jump','useful canvas','camera key');
      }
      test.overflow??=await pane.evaluate(element=>({page:document.documentElement.scrollWidth-document.documentElement.clientWidth,pane:element.scrollWidth-element.clientWidth}));assert.ok(test.overflow.page<=1 && test.overflow.pane<=1,'No page or main-pane horizontal overflow.');
      await page.screenshot({path:resolve(output,stem+'-final.png')});test.passed=true;
      console.log(`PASS ${engine} ${locale.slug} ${width}x${height} ${item.id}`);
    } catch(error){test.error=String(error.stack);await page.screenshot({path:resolve(output,`${engine}-${locale.slug}-${width}x${height}-${item.id}-failed.png`)});throw error;}
    finally {await context.close();await writeFile(resolve(output,`${engine}.json`),JSON.stringify(report,null,2)+'\n');}
  }
  assert.deepEqual(report.pageErrors,[]);assert.deepEqual(report.resourceErrors,[]);report.finished=new Date().toISOString();
} finally {await browser.close();await writeFile(resolve(output,`${engine}.json`),JSON.stringify(report,null,2)+'\n');}
