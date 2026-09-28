// Run against a separate browser-view test session; see docs/REVIEW_2026-09-22.md.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
const require = createRequire(import.meta.url);
if (!process.env.BROWSER_CDP_URL || !process.env.PLAYWRIGHT_CORE_PATH) throw new Error("Set BROWSER_CDP_URL and PLAYWRIGHT_CORE_PATH for an isolated browser-view test session.");
const { chromium } = require(process.env.PLAYWRIGHT_CORE_PATH);
const browser = await chromium.connectOverCDP(process.env.BROWSER_CDP_URL);
const context = browser.contexts()[0];
const origin = process.env.REVIEW_ORIGIN ?? "http://localhost:3000";
const screenshots = process.env.REVIEW_SCREENSHOT_DIR ?? "/tmp/review-fixes-screenshots";
await mkdir(screenshots, { recursive: true });
const pages = [];
const errors = [];
let checks = 0;
async function page(route = "/en-gb/desk", size = { width: 1440, height: 1000 }, withoutWebLocks = false) {
  const p = await context.newPage(); pages.push(p);
  p.setDefaultTimeout(15000);
  if (withoutWebLocks) await p.addInitScript(() => Object.defineProperty(navigator, "locks", { value: undefined }));
  p.on("pageerror", error => errors.push(error.message));
  await p.setViewportSize(size);
  await p.goto(`${origin}${route}`);
  return p;
}
const app = (p, id) => p.locator(`[data-app-id="${id}"]`);
async function open(p, name, id) {
  await app(p, "desk").getByRole("button", { name: new RegExp(`^Open ${name}\\.`) }).click();
  await app(p, id).getByText("Saved on this browser", { exact: true }).waitFor();
}
async function board(game) {
  return game.evaluate(element => [...element.querySelectorAll("[data-snake-x], .brick-game__ball, .brick-game__paddle, .brick-game__brick, .arcade-game__scoreboard dd")].map(node => node.outerHTML).join(""));
}
async function settled(p, key) {
  await p.waitForFunction(key => !Object.keys(localStorage).some(entry => entry.startsWith(`${key}:pending:`)), key);
}
async function saveContains(p, key, texts) {
  await p.waitForFunction(({ key, texts }) => {
    const content = Object.keys(localStorage).filter(entry => entry === key || entry.startsWith(`${key}:conflict:`)).map(entry => localStorage.getItem(entry)).join(" ");
    return texts.every(text => content.includes(text));
  }, { key, texts });
}
async function check(name, run) { if (process.env.REVIEW_GROUP && !new RegExp(process.env.REVIEW_GROUP).test(name)) return; await run(); checks++; console.log(`PASS ${name}`); }
let control;
let savedStorage;
try {
  control = await page();
  // Preserve any previous test data; only this dedicated browser's origin is touched.
  savedStorage = await control.evaluate(() => ({ ...localStorage }));
  await control.evaluate(() => localStorage.clear());
  await check("Note Pad simultaneous same-page edits retain both drafts and expose recovery", async () => {
    const a = await page(), b = await page();
    await open(a, "Note Pad", "notepad"); await open(b, "Note Pad", "notepad");
    await Promise.all([app(a, "notepad").locator("textarea").fill("TAB A DRAFT"), app(b, "notepad").locator("textarea").fill("TAB B NEWER DRAFT")]);
    await saveContains(a, "samuel-system7-notepad-v1", ["TAB A DRAFT", "TAB B NEWER DRAFT"]);
    await app(a, "notepad").getByRole("button", { name: "Download both drafts" }).waitFor();
    await app(a, "notepad").getByText("Review saved drafts", { exact: true }).click();
    const previous = await a.evaluate(() => {
      const key = Object.keys(localStorage).find(key => key.startsWith("samuel-system7-notepad-v1:conflict:"));
      return JSON.parse(localStorage.getItem(key)).current.pages[0];
    });
    await app(a, "notepad").getByRole("button", { name: "Use previously saved version", exact: true }).first().click();
    await a.waitForFunction(value => JSON.parse(localStorage.getItem("samuel-system7-notepad-v1")).pages[0] === value, previous);
    await a.close(); await b.close();
  });
  await check("independent Note Pad pages merge and close flush keeps the last keystroke", async () => {
    const a = await page(), b = await page();
    await open(a, "Note Pad", "notepad"); await open(b, "Note Pad", "notepad");
    await app(b, "notepad").getByRole("button", { name: "Next page" }).click();
    await Promise.all([app(a, "notepad").locator("textarea").fill("PAGE ONE"), app(b, "notepad").locator("textarea").fill("PAGE TWO")]);
    await a.waitForFunction(() => { const data = JSON.parse(localStorage.getItem("samuel-system7-notepad-v1")); return data.pages[0] === "PAGE ONE" && data.pages[1] === "PAGE TWO"; });
    await app(b, "notepad").locator("textarea").fill("LAST KEY BEFORE CLOSE");
    await app(b, "notepad").getByRole("button", { name: "Close Note Pad", exact: true }).click();
    await saveContains(a, "samuel-system7-notepad-v1", ["PAGE ONE", "LAST KEY BEFORE CLOSE"]);
    await a.close(); await b.close();
  });
  await check("Quick List simultaneous additions survive together, including pagehide", async () => {
    const a = await page(), b = await page();
    await open(a, "Quick List", "tasks"); await open(b, "Quick List", "tasks");
    await app(a, "tasks").getByLabel("New task", { exact: true }).fill("Task A");
    await app(b, "tasks").getByLabel("New task", { exact: true }).fill("Task B");
    await Promise.all([app(a, "tasks").getByRole("button", { name: "Add task", exact: true }).click(), app(b, "tasks").getByRole("button", { name: "Add task", exact: true }).click()]);
    await b.evaluate(() => window.dispatchEvent(new Event("pagehide")));
    await saveContains(a, "samuel-system7-tasks-v1", ["Task A", "Task B"]);
    await a.waitForFunction(() => JSON.parse(localStorage.getItem("samuel-system7-tasks-v1")).data.items.length === 2);
    await a.close(); await b.close();
  });
  await check("calendar same-date conflicts and independent dates retain drafts", async () => {
    const a = await page(), b = await page();
    await open(a, "Pocket Calendar", "calendar"); await open(b, "Pocket Calendar", "calendar");
    await Promise.all([app(a, "calendar").locator("textarea").fill("CALENDAR A"), app(b, "calendar").locator("textarea").fill("CALENDAR B")]);
    await saveContains(a, "samuel-system7-calendar-v1", ["CALENDAR A", "CALENDAR B"]);
    await app(a, "calendar").getByRole("button", { name: "Download both drafts" }).waitFor();
    const dates = await app(a, "calendar").locator("[data-date]").evaluateAll(nodes => nodes.slice(10, 12).map(node => node.dataset.date));
    await app(a, "calendar").locator(`[data-date="${dates[0]}"]`).click();
    await app(b, "calendar").locator(`[data-date="${dates[1]}"]`).click();
    await Promise.all([app(a, "calendar").locator("textarea").fill("DATE ONE"), app(b, "calendar").locator("textarea").fill("DATE TWO")]);
    await b.close();
    await a.waitForFunction(dates => { const notes = JSON.parse(localStorage.getItem("samuel-system7-calendar-v1")).data.notes; return notes[dates[0]] === "DATE ONE" && notes[dates[1]] === "DATE TWO"; }, dates);
    await a.close();
  });
  await check("IndexedDB fallback coordinates two editors without Web Locks", async () => {
    const size = { width: 1440, height: 1000 };
    const a = await page("/en-gb/desk", size, true), b = await page("/en-gb/desk", size, true);
    await open(a, "Note Pad", "notepad"); await open(b, "Note Pad", "notepad");
    await Promise.all([app(a, "notepad").locator("textarea").fill("FALLBACK A"), app(b, "notepad").locator("textarea").fill("FALLBACK B")]);
    await saveContains(a, "samuel-system7-notepad-v1", ["FALLBACK A", "FALLBACK B"]);
    await a.close(); await b.close();
  });
  await check("Selected projects overrides a remembered filtered archive; all seven badges are images", async () => {
    const p = await page("/en-gb/");
    await p.locator(".arcade-invite__games img").first().waitFor();
    assert.equal(await p.locator(".arcade-invite__games img").count(), 7);
    assert.equal(await p.locator(".arcade-invite__games b").allTextContents().then(values => values.join("")), "");
    await p.locator(".arcade-invite__games").scrollIntoViewIfNeeded();
    await p.screenshot({ path: `${screenshots}/game-badges-1440.png` });
    await p.getByRole("button", { name: /^Selected projects/ }).click();
    await p.getByRole("tab", { name: "Selected work", exact: true }).waitFor();
    assert.equal(await p.getByRole("tab", { name: "Selected work", exact: true }).getAttribute("aria-selected"), "true");
    await p.getByRole("tab", { name: "All projects", exact: true }).click();
    await app(p, "projects").getByRole("searchbox", { name: "Search projects", exact: true }).fill("nothing matches this query");
    await p.getByRole("button", { name: /^Start Here\./ }).click();
    await p.getByRole("button", { name: /^Selected projects/ }).click();
    assert.equal(new URL(p.url()).search, "?view=guided");
    assert.equal(await app(p, "projects").getByRole("searchbox", { name: "Search projects", exact: true }).inputValue(), "");
    await p.getByRole("button", { name: /^Start Here\./ }).click();
    await p.setViewportSize({ width: 390, height: 844 });
    await p.locator(".arcade-invite__games").scrollIntoViewIfNeeded();
    await p.screenshot({ path: `${screenshots}/game-badges-390.png` });
    await p.close();
  });
  await check("CV draft and selected tab survive desktop focus and the 760px boundary", async () => {
    const p = await page("/en-gb/projects?view=files");
    await p.locator('[data-project-slug="cv-keyword-automator"]').click();
    await p.getByRole("button", { name: "Open interactive demo", exact: false }).first().click();
    const editor = p.locator('[aria-describedby="cv-studio-cv-help"]');
    await editor.fill("CV DRAFT SURVIVES WINDOW FOCUS");
    await p.locator("#cv-studio-tab-output").click();
    for (const size of [{ width: 390, height: 844 }, { width: 1440, height: 1000 }]) {
      await p.locator(".menu-clock").click();
      await p.setViewportSize(size);
      assert.equal(await app(p, "projectActivity").count(), 1);
      await app(p, "calendar").getByRole("button", { name: "Close Pocket Calendar", exact: true }).click();
      assert.equal(await p.locator("#cv-studio-tab-output").getAttribute("aria-selected"), "true");
    }
    await p.locator("#cv-studio-tab-inputs").click();
    assert.equal(await editor.inputValue(), "CV DRAFT SURVIVES WINDOW FOCUS");
    for (const size of [{ width: 320, height: 568 }, { width: 390, height: 844 }]) {
      await p.setViewportSize(size);
      await app(p, "projectActivity").locator(".mac-window__content").evaluate(element => { element.scrollTop = 0; });
      await p.waitForTimeout(500);
      const detail = app(p, "projectActivity").locator(".mac-window__content");
      const bounds = await detail.boundingBox();
      const title = await p.getByRole("heading", { name: "Role-tailored CV build lab", exact: true }).boundingBox();
      const action = await p.getByRole("button", { name: "Restore sample", exact: true }).boundingBox();
      assert.ok(title.y >= bounds.y && title.y + title.height <= bounds.y + bounds.height, `Title visible at ${size.width}`);
      assert.ok(action.y >= bounds.y && action.y + action.height <= bounds.y + bounds.height, `Demo action visible at ${size.width}: ${JSON.stringify({ action, bounds })}`);
      assert.equal(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      await p.getByRole("button", { name: "Restore sample", exact: true }).focus();
      assert.equal(await p.evaluate(() => document.activeElement?.textContent.trim()), "Restore sample");
      await p.screenshot({ path: `${screenshots}/demo-${size.width}.png` });
    }
    await app(p, "projectActivity").locator(".window-close").click();
    assert.equal(await editor.count(), 0);
    await p.getByRole("button", { name: "Open interactive demo", exact: false }).first().click();
    assert.notEqual(await editor.inputValue(), "CV DRAFT SURVIVES WINDOW FOCUS");
    await p.close();
  });
  await check("Mandarin demo launch fits a 320px pane in both locales", async () => {
    for (const locale of ["zh-cn", "zh-tw"]) {
      const p = await page(`/${locale}/projects?view=files`);
      await p.locator('[data-project-slug="cv-keyword-automator"]').click();
      await p.setViewportSize({ width: 320, height: 568 });
      await p.locator('[data-embedded="true"] > nav button.is-primary').first().click();
      const experiment = app(p, "projectActivity").locator("[data-locale]");
      await experiment.locator('[aria-describedby="cv-studio-cv-help"]').waitFor();
      await p.waitForTimeout(500);
      const pane = await app(p, "projectActivity").locator(".mac-window__content").boundingBox();
      const title = await experiment.getByRole("heading").first().boundingBox();
      const action = await experiment.locator("button").nth(1).boundingBox();
      assert.ok(title.y >= pane.y && title.y + title.height <= pane.y + pane.height);
      assert.ok(action.y >= pane.y && action.y + action.height <= pane.y + pane.height);
      assert.equal(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      await p.screenshot({ path: `${screenshots}/demo-${locale}-320.png` });
      await p.close();
    }
  });
  await check("MRI saved image and limitations agree in English and both Mandarin editions", async () => {
    for (const [locale, images, limits, phrase] of [
      ["en-gb", "Recorded images", "Study & limits", "The Recorded images tab shows a saved reconstruction comparison."],
      ["zh-cn", "已保存图像", "研究与局限", "标签页展示已保存的重建对比"],
      ["zh-tw", "已儲存影像", "研究與侷限", "分頁展示已儲存的重建比較"],
    ]) {
      const p = await page(`/${locale}/projects?project=trustworthy-mri-reconstruction&view=demo`);
      await p.getByRole("button", { name: images, exact: false }).click();
      const figure = p.locator('img[src="/projects/mri/media/recorded-reconstruction.webp"]');
      await figure.scrollIntoViewIfNeeded();
      await figure.evaluate(image => image.decode());
      assert.equal(await figure.evaluate(image => image.naturalWidth), 2200);
      await p.getByRole("button", { name: limits, exact: false }).click();
      await p.getByText(phrase, { exact: false }).waitFor();
      assert.equal((await p.locator("body").innerText()).includes("Images are referenced by the study but are not present"), false);
      await p.close();
    }
  });
  await check("Snake and Brick Breaker pause unchanged across repeated desktop and browser hiding", async () => {
    const p = await page("/en-gb/games", { width: 390, height: 844 });
    await p.locator("[data-game-id]").first().waitFor();
    await p.getByRole("button", { name: "Got it", exact: true }).click();
    for (const [id, selector] of [["snake", ".snake-game"], ["brickbreaker", ".brick-game"]]) {
      await p.locator(`[data-game-id="${id}"]`).click();
      const game = p.locator(selector);
      for (let cycle = 0; cycle < 2; cycle++) {
        await game.getByRole("button", { name: /^(Play|Resume)$/ }).click();
        await p.waitForTimeout(200);
        await p.locator(".menu-clock").click();
        const frozen = await board(game);
        await p.waitForTimeout(2300);
        assert.equal(await board(game), frozen);
        await app(p, "calendar").getByRole("button", { name: "Close Pocket Calendar", exact: true }).click();
        assert.match(await game.innerText(), /Paused/);
      }
      await game.getByRole("button", { name: /^(Play|Resume)$/ }).click();
      await p.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, value: true }); document.dispatchEvent(new Event("visibilitychange")); });
      const frozen = await board(game);
      await p.waitForTimeout(500);
      assert.equal(await board(game), frozen);
      await p.evaluate(() => { delete document.hidden; document.dispatchEvent(new Event("visibilitychange")); });
      assert.match(await game.innerText(), /Paused/);
    }
    await p.close();
  });
  await check("main integration retains PDF windows, shared routes and the finance entry", async () => {
    const p = await page("/en-gb/projects?project=growmat");
    await p.getByRole("button", { name: "Open showcase PDF", exact: false }).click();
    const activity = app(p, "projectActivity");
    await p.setViewportSize({ width: 390, height: 844 });
    await activity.getByRole("button", { name: "Zoom in", exact: true }).click();
    assert.equal(await activity.locator(".pdf-reader").getAttribute("data-zoomed"), "true");
    await activity.getByRole("button", { name: /^Fit width/ }).click();
    const address = p.url();
    assert.equal(new URL(address).searchParams.get("view"), "pdf");
    assert.ok(new URL(address).searchParams.get("artifact"));
    await p.reload();
    await activity.getByRole("button", { name: "Zoom in", exact: true }).waitFor();
    await p.waitForFunction(() => [...document.querySelectorAll(".pdf-reader canvas")].some(canvas => canvas.width > 1));
    await p.getByRole("button", { name: "Got it", exact: true }).click();
    await activity.getByRole("button", { name: "Back to project", exact: true }).click();
    assert.equal(await activity.count(), 0);
    await p.getByRole("button", { name: "Open showcase PDF", exact: false }).waitFor();
    await p.goto(`${origin}/en-gb/`);
    await p.getByRole("link", { name: "Explore the finance demo", exact: false }).click();
    await app(p, "projectActivity").locator("[data-locale]").waitFor();
    assert.equal(new URL(p.url()).searchParams.get("project"), "ocean-depths-finance");
    assert.equal(new URL(p.url()).searchParams.get("view"), "demo");
    await p.close();
  });
  assert.deepEqual(errors, [], "No browser runtime errors");
  console.log(`${checks} browser regression groups passed. Screenshots: ${screenshots}`);
} finally {
  for (const p of pages) if (p !== control && !p.isClosed()) await p.close();
  if (control && savedStorage) {
    await settled(control, "samuel-system7-notepad-v1");
    await control.evaluate(values => { localStorage.clear(); for (const [key, value] of Object.entries(values)) localStorage.setItem(key, value); }, savedStorage);
    await control.close();
  }
  await browser.close();
}
