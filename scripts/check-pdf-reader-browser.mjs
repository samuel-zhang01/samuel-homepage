// Real PDF.js workers, network cancellation and retry in disposable browsers.
// PLAYWRIGHT_CORE_PATH points to an external QA installation; REVIEW_ORIGIN
// selects a running dev or production preview. No application dependencies added.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

if (!process.env.PLAYWRIGHT_CORE_PATH) throw new Error("Set PLAYWRIGHT_CORE_PATH to an external Playwright installation.");
const playwright = createRequire(import.meta.url)(process.env.PLAYWRIGHT_CORE_PATH);
const origin = process.env.REVIEW_ORIGIN ?? "http://127.0.0.1:5174";
const engines = (process.env.PDF_READER_ENGINES ?? "chromium,firefox,webkit").split(",");
const output = resolve(process.env.PDF_READER_REPORT_DIR ?? ".codex/reports/pdf-reader-cleanup/browser");
await mkdir(output, { recursive: true });
const report = { origin, started: new Date().toISOString(), tests: [] };

async function open(browser, test) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addInitScript(() => {
    sessionStorage.setItem("samuel-system-7-boot", "seen");
    const audit = window.__pdfReaderAudit = { workers: [], urls: [], revoked: [], heldTermination: null };
    const NativeWorker = window.Worker;
    window.Worker = class extends NativeWorker {
      constructor(url, options) {
        super(url, options);
        this.auditRecord = { url: String(url), terminated: 0, disposalMarker: false };
        audit.workers.push(this.auditRecord);
      }
      postMessage(message, ...options) {
        if (message?.type === "samuel-pdf-reader-dispose") this.auditRecord.disposalMarker = true;
        if (message?.action === "Terminate" && audit.heldTermination === this.auditRecord.url) return;
        return super.postMessage(message, ...options);
      }
      terminate() { this.auditRecord.terminated++; return super.terminate(); }
    };
    const create = URL.createObjectURL.bind(URL), revoke = URL.revokeObjectURL.bind(URL);
    URL.createObjectURL = blob => { const url = create(blob); audit.urls.push(url); return url; };
    URL.revokeObjectURL = url => { audit.revoked.push(url); return revoke(url); };
  });
  const page = await context.newPage();
  page.setDefaultTimeout(20_000);
  page.on("pageerror", error => test.pageErrors.push({ message: error.message, stack: error.stack }));
  page.on("console", message => { if (message.type() === "error") test.consoleErrors.push(message.text()); });
  return { context, page };
}

async function enterAndResize(page) {
  await page.goto(`${origin}/en-gb/documents`);
  await page.waitForFunction(() => document.documentElement.dataset.reduceEffects !== undefined);
  const app = page.locator('[data-app-id="documents"]');
  await app.locator(".window-resize-handle").focus();
  for (let i = 0; i < 18; i++) await page.keyboard.press("Shift+ArrowLeft");
  for (let i = 0; i < 18; i++) await page.keyboard.press("Shift+ArrowUp");
  const bounds = await app.boundingBox();
  assert.equal(bounds.width, 320); assert.equal(bounds.height, 240);
  return app;
}

async function rendered(page, id = "italian-reading") {
  await page.waitForFunction(expected => document.querySelector(".documents-library > button.is-active")?.id === expected
    && document.querySelector('[data-app-id="documents"] .pdf-reader')?.dataset.status === "ready", id);
  const canvas = page.locator('[data-app-id="documents"] .pdf-reader__page canvas').first();
  const pixels = await canvas.evaluate(element => {
    const { width, height } = element;
    const data = element.getContext("2d").getImageData(0, 0, width, height).data;
    let ink = 0;
    for (let i = 0; i < data.length; i += 64) if (data[i + 3] && Math.min(data[i], data[i + 1], data[i + 2]) < 220) ink++;
    return { width, height, ink };
  });
  assert.ok(pixels.width > 1 && pixels.height > 1 && pixels.ink > 10, "The real replacement PDF paints visible content");
  return pixels;
}

async function released(page, test, active = 1) {
  await page.waitForFunction(expected => window.__pdfReaderAudit.workers.filter(worker => !worker.terminated).length === expected, active);
  // A successful destroy must clear its fallback timer, rather than terminating
  // a second time one second later. Inspect actual worker/URL ownership.
  await page.waitForTimeout(1200);
  test.resources = await page.evaluate(() => window.__pdfReaderAudit);
  assert.equal(test.resources.workers.filter(worker => !worker.terminated).length, active);
  for (const worker of test.resources.workers.filter(worker => worker.terminated)) {
    assert.equal(worker.terminated, 1, "Successful disposal clears the fallback timer");
    assert.equal(worker.disposalMarker, true, "The worker receives disposal before termination");
    assert.ok(test.resources.revoked.includes(worker.url), "Disposed worker Blob URL is revoked");
  }
}

async function heldRequest(page, pattern) {
  let release;
  const gate = new Promise(resolveGate => { release = resolveGate; });
  let markHeld;
  const held = new Promise(resolveHeld => { markHeld = resolveHeld; });
  let first = true;
  await page.route(pattern, async route => {
    if (!first) { await route.continue(); return; }
    first = false; markHeld(route.request().url());
    await gate;
    // The application may already have aborted this old request.
    await route.continue().catch(() => {});
  });
  return { held, release };
}

let failed = false;
for (const engine of engines) {
  const browser = await playwright[engine].launch({ headless: true });
  async function check(name, run) {
    if (process.env.PDF_READER_GROUP && !new RegExp(process.env.PDF_READER_GROUP).test(name)) return;
    const test = { engine, version: browser.version(), name, pageErrors: [], consoleErrors: [] };
    report.tests.push(test);
    const { context, page } = await open(browser, test);
    try {
      await run(page, test);
      test.passed = true; console.log(`PASS ${engine}: ${name}`);
    } catch (error) {
      failed = true; test.error = error.stack;
      await page.screenshot({ path: resolve(output, `${engine}-${report.tests.length}-failure.png`) });
      console.log(`FAIL ${engine}: ${name}: ${error.message}`);
    } finally {
      await context.close();
      await writeFile(resolve(output, "pdf-reader.json"), `${JSON.stringify(report, null, 2)}\n`);
    }
  }
  try {
    for (const [name, pattern] of [["held PDF cancellation", "**/Samuel-Zhang-Applied-AI-CV.pdf?*"], ["held worker-module cancellation", "**/_vendor/pdfjs/pdf.worker.min.mjs*"]]) {
      await check(name, async (page, test) => {
        const pending = await heldRequest(page, pattern);
        try {
          const app = await enterAndResize(page);
          test.heldUrl = await pending.held;
          assert.equal(await app.locator(".pdf-reader").getAttribute("data-status"), "loading");
          await app.locator("#italian-reading").click();
          test.pixels = await rendered(page);
          pending.release();
          await page.waitForTimeout(300);
          assert.deepEqual(test.pageErrors, []); assert.deepEqual(test.consoleErrors, []);
          await released(page, test);
          assert.equal(await app.locator("#italian-reading").getAttribute("aria-pressed"), "true", "Late completion cannot replace the selected PDF");
          assert.deepEqual(test.pageErrors, []); assert.deepEqual(test.consoleErrors, []);
        } finally { pending.release(); }
      });
    }
    await check("rapid switching across real PDFs", async (page, test) => {
      const app = await enterAndResize(page);
      await rendered(page, "ai-cv");
      for (let round = 0; round < 2; round++) for (const id of ["growmat-showcase", "study-rl", "italian-practice", "ai-cv", "italian-reading"]) {
        await app.locator(`#${id}`).click();
        await page.evaluate(() => new Promise(resolveFrame => requestAnimationFrame(resolveFrame)));
      }
      test.pixels = await rendered(page);
      await released(page, test);
      assert.deepEqual(test.pageErrors, []); assert.deepEqual(test.consoleErrors, []);
    });
    await check("stalled worker termination remains bounded", async (page, test) => {
      const app = await enterAndResize(page); await rendered(page, "ai-cv");
      await page.evaluate(() => { const audit = window.__pdfReaderAudit; audit.heldTermination = audit.workers.find(worker => !worker.terminated).url; });
      await app.locator("#italian-reading").click(); test.pixels = await rendered(page);
      await released(page, test);
      assert.deepEqual(test.pageErrors, []); assert.deepEqual(test.consoleErrors, []);
    });
    for (const mode of ["module-load failure", "active worker error"]) {
      await check(`${mode} surfaces and retry loads the real worker`, async (page, test) => {
        const requests = []; let reject = true;
        await page.route("**/_vendor/pdfjs/pdf.worker.min.mjs*", async route => {
          requests.push(route.request().url());
          if (!reject) { await route.continue(); return; }
          if (mode === "module-load failure") {
            await route.fulfill({ status: 503, contentType: "text/javascript", body: "Unavailable" });
          } else {
            const response = await route.fetch();
            await route.fulfill({ response, body: `${await response.text()}\nsetTimeout(() => { throw new Error("Worker was terminated"); }, 40);` });
          }
        });
        const app = await enterAndResize(page);
        await app.locator('.pdf-reader[data-status="error"]').waitFor();
        await released(page, test, 0);
        if (mode === "active worker error") {
          assert.ok(test.consoleErrors.some(error => error.includes("PDF preview worker failed")), "The same exception surfaces in the error UI and diagnostic while the worker is active");
          assert.ok(test.pageErrors.some(error => error.message.includes("Worker was terminated")), "The real active-worker exception remains observable");
        }
        test.expectedFailureErrors = [...test.pageErrors];
        const errorsBeforeRetry = test.pageErrors.length;
        reject = false; await app.getByRole("button", { name: "Try again", exact: true }).click();
        test.pixels = await rendered(page, "ai-cv"); await released(page, test);
        assert.ok(requests.some(url => url.endsWith("pdf.worker.min.mjs?retry=1")), "Retry uses a fresh worker module URL");
        assert.deepEqual(test.pageErrors.slice(errorsBeforeRetry), []);
        test.requests = requests;
      });
    }
    await check("PDF fetch failure releases the worker and retry recovers", async (page, test) => {
      let reject = true;
      await page.route("**/Samuel-Zhang-Applied-AI-CV.pdf?*", route => reject ? route.fulfill({ status: 404, body: "Missing PDF" }) : route.continue());
      const app = await enterAndResize(page);
      await app.locator('.pdf-reader[data-status="error"]').waitFor(); await released(page, test, 0);
      assert.deepEqual(test.pageErrors, []);
      const errorsBeforeRetry = test.consoleErrors.length;
      reject = false; await app.getByRole("button", { name: "Try again", exact: true }).click();
      test.pixels = await rendered(page, "ai-cv"); await released(page, test);
      assert.deepEqual(test.pageErrors, []); assert.deepEqual(test.consoleErrors.slice(errorsBeforeRetry), []);
    });
  } finally { await browser.close(); }
}
if (failed) process.exitCode = 1;
console.log(`${report.tests.filter(test => test.passed).length}/${report.tests.length} real PDF reader browser cases passed.`);
