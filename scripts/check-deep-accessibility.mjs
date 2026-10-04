// Exploratory axe-core audit: all default rules, full rendered document, no exclusions.
// External dependencies only; raw results remain in ignored .codex/reports.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';

const require = createRequire(import.meta.url);
if (!process.env.PLAYWRIGHT_CORE_PATH) throw new Error('Set PLAYWRIGHT_CORE_PATH to external Playwright.');
const pw = require(process.env.PLAYWRIGHT_CORE_PATH);
const axeDirectory = process.env.AXE_CORE_PATH ?? path.join(path.dirname(process.env.PLAYWRIGHT_CORE_PATH), 'axe-core');
const axePackage = require(path.join(axeDirectory, 'package.json'));
const axeSource = await readFile(path.join(axeDirectory, 'axe.min.js'), 'utf8');
const projectSource = ts.transpileModule(await readFile('src/data/projects.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { projects } = await import(`data:text/javascript;base64,${Buffer.from(projectSource).toString('base64')}`);
const sectionSource = ts.createSourceFile('sections.tsx', await readFile('src/app/[locale]/[section]/page.tsx', 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
let sections;
const visit = node => {
  if (ts.isVariableDeclaration(node) && node.name.getText(sectionSource) === 'sections') sections = node.initializer;
  ts.forEachChild(node, visit);
};
visit(sectionSource); assert.ok(sections && ts.isObjectLiteralExpression(sections));
const coreSections = ['', 'projects', ...sections.properties.map(property => property.name.text ?? property.name.getText(sectionSource))];
const demoProjects = projects.filter(project => project.demo);
assert.equal(new Set(demoProjects.map(project => project.demo)).size, demoProjects.length);
const profiles = [
  { locale: 'en-gb', width: 1440, height: 1000, launch: 'Open interactive demo' },
  { locale: 'zh-tw', width: 320, height: 568, launch: '開啟互動示範' },
];
const jobs = profiles.flatMap(profile => [
  ...coreSections.map(section => ({ group: 'sections', profile, route: `/${profile.locale}/${section}` })),
  ...demoProjects.map(project => ({ group: 'demos', profile, project: project.slug, demo: project.demo, route: `/${profile.locale}/projects?project=${project.slug}` })),
  ...projects.map(project => ({ group: 'documents', profile, project: project.slug, route: `/${profile.locale}/projects?project=${project.slug}` })),
]).filter(job => (!process.env.AXE_GROUP || new RegExp(process.env.AXE_GROUP).test(job.group)) && (!process.env.AXE_PROJECTS || process.env.AXE_PROJECTS.split(',').includes(job.project)));
assert.ok(jobs.length > 0);
const origin = process.env.REVIEW_ORIGIN ?? 'http://127.0.0.1:5188';
const engine = process.env.BROWSER_ENGINE ?? 'chromium';
const reportPath = `.codex/reports/deep-audit/accessibility-${engine}${process.env.REVIEW_REPORT_SUFFIX ?? ''}.json`;
await mkdir(path.dirname(reportPath), { recursive: true });
const report = { engine, version: null, axeVersion: axePackage.version, origin, started: new Date().toISOString(),
  method: 'axe.run(document) with all default enabled rules; no runOnly tags, rule disabling or DOM exclusions; guide dismissed; initial visible content; CSP bypass permits external QA injection only',
  inventory: { coreSections, projectCount: projects.length, demoCount: demoProjects.length, profiles },
  planned: jobs.length, visits: [] };
const browser = await pw[engine].launch({ headless: true, ...(engine === 'chromium' ? { args: ['--no-sandbox'] } : {}) });
report.version = browser.version();
let cursor = 0;
async function worker() {
  while (cursor < jobs.length) {
    const index = cursor++; const job = jobs[index];
    const c = await browser.newContext({ viewport: { width: job.profile.width, height: job.profile.height }, bypassCSP: true });
    const p = await c.newPage(); p.setDefaultTimeout(30000);
    const entry = { ...job, pageErrors: [], violations: [], incomplete: [] };
    p.on('pageerror', error => entry.pageErrors.push(error.stack));
    try {
      await p.goto(`${origin}${job.route}`, { timeout: 60000 });
      await p.waitForFunction(() => document.documentElement.dataset.reduceEffects !== undefined);
      await p.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const guide = p.getByRole('button', { name: /^(Got it|知道了|明白了|了解了)$/ });
      if (job.profile.width === 320) { await guide.click(); await guide.waitFor({ state: 'hidden' }); }
      if (job.group === 'documents' || job.group === 'demos') await p.locator('[data-app-id="project"]').getByRole('heading', { level: 1 }).waitFor();
      if (job.group === 'demos') {
        const launch = p.locator('[data-app-id="project"]').getByRole('button', { name: job.profile.launch, exact: false }).first();
        await launch.click();
        await p.locator('[data-app-id="projectActivity"] [data-locale]').getByRole('heading').first().waitFor();
      }
      await p.evaluate(() => document.fonts.ready);
      await p.addScriptTag({ content: axeSource });
      const result = await p.evaluate(async () => {
        const value = await window.axe.run(document, { resultTypes: ['violations', 'incomplete'] });
        return { violations: value.violations, incomplete: value.incomplete, passRuleCount: value.passes.length, inapplicableRuleCount: value.inapplicable.length };
      });
      Object.assign(entry, result); entry.result = 'COMPLETE';
      // Closed popovers produce manual-review results in axe. Verify their
      // relationships without dropping the rule or deleting legitimate ARIA.
      entry.popupReferences = await p.locator('[role="combobox"][aria-controls]').evaluateAll(elements => elements.map(element => ({
        id: element.id,
        expanded: element.getAttribute('aria-expanded'),
        references: element.getAttribute('aria-controls').split(/\s+/).map(id => {
          const target = document.getElementById(id);
          return { id, exists: Boolean(target), unique: document.querySelectorAll(`#${CSS.escape(id)}`).length === 1, role: target?.getAttribute('role') };
        }),
      })));
      assert.ok(entry.popupReferences.every(control => control.references.every(reference => reference.exists && reference.unique && reference.role === 'listbox')), 'Every combobox controls one existing, uniquely identified listbox');
      const important = result.violations.filter(violation => ['serious', 'critical'].includes(violation.impact));
      if (important.length) console.log(`FINDING ${engine} ${job.group} ${job.route} ${job.profile.width}: ${important.map(rule => `${rule.id}(${rule.impact},${rule.nodes.length})`).join(', ')}`);
    } catch (error) { entry.result = 'ERROR'; entry.error = error.stack; console.log(`ERROR ${job.route}: ${error.message}`); }
    finally { await c.close(); report.visits[index] = entry; }
    if (report.visits.filter(Boolean).length % 10 === 0) console.log(`Accessibility ${report.visits.filter(Boolean).length}/${jobs.length}`);
    await writeFile(reportPath, JSON.stringify(report, null, 2));
  }
}
try { await Promise.all(Array.from({ length: Number(process.env.AXE_CONCURRENCY ?? 2) }, worker)); }
finally {
  report.finished = new Date().toISOString(); await writeFile(reportPath, JSON.stringify(report, null, 2)); await browser.close();
}
const violations = report.visits.reduce((sum, entry) => sum + entry.violations.length, 0);
console.log(`Axe ${axePackage.version} ${engine}: ${report.visits.length}/${jobs.length} audits; ${violations} rule violations; ${report.visits.reduce((sum, entry) => sum + entry.incomplete.length, 0)} incomplete rule results.`);
if (report.visits.some(entry => entry.result !== 'COMPLETE' || entry.pageErrors.length || entry.violations.length)) process.exitCode = 1;
