// PLAYWRIGHT_CORE_PATH=/external/playwright REVIEW_ORIGIN=http://127.0.0.1:5187 node scripts/check-arcade-browser.mjs
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { deskArcade, peakDock } from "./lib/arcade-test-fixtures.mjs";

const require = createRequire(import.meta.url);
assert.ok(process.env.PLAYWRIGHT_CORE_PATH, "Set PLAYWRIGHT_CORE_PATH to an external Playwright installation");
const playwright = require(process.env.PLAYWRIGHT_CORE_PATH);
const engine = process.env.BROWSER_ENGINE ?? "chromium";
assert.ok(["chromium", "webkit", "firefox"].includes(engine));
const origin = process.env.REVIEW_ORIGIN ?? "http://127.0.0.1:5187";
const output = process.env.GAMES_REPORT_DIR ?? ".codex/reports/arcade-regressions";
const widths = (process.env.GAMES_WIDTHS ?? "320,390,1440").split(",").map(Number);
const locales = (process.env.GAMES_LOCALES ?? "en-gb").split(",");
assert.ok(widths.every(width => Number.isFinite(width) && width >= 320));
assert.ok(locales.every(locale => ["en-gb", "en-us", "zh-cn", "zh-tw"].includes(locale)));
await mkdir(output, { recursive: true });
const report = {
  engine, origin, started: new Date().toISOString(),
  qualification: "Known solutions use production seeded generators. Exact Peak Dock fits validate UI reachability and scoring, not an independent scientific model. Browser document hiding is simulated.",
  profiles: [],
};
const browser = await playwright[engine].launch({ headless: true, ...(engine === "chromium" ? {
  executablePath: process.env.BROWSER_EXECUTABLE_PATH,
  args: ["--no-sandbox"],
} : {}) });
report.browserVersion = browser.version();
const save = () => writeFile(resolve(output, `${engine}-arcade.json`), JSON.stringify(report, null, 2));
const frame = page => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));

async function fitExact(game, difficulty) {
  const level = ["easy", "medium", "hard"].indexOf(difficulty);
  await game.locator(".hplc-difficulty__levels button").nth(level).click();
  const seed = Number((await game.locator(".hplc-sample-strip p").innerText()).match(/\d{10}/)[0]);
  const sample = peakDock.generateSample(difficulty, seed);
  await game.evaluate(async (element, components) => {
    const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    for (let index = 0; index < components.length; index += 1) {
      for (const [prefix, value] of [["hplc-rt-", components[index].referenceRt], ["hplc-amplitude-", components[index].targetAmplitude]]) {
        const input = element.querySelectorAll(`input[id^="${prefix}"]`)[index];
        if (!input) continue;
        setValue.call(input, String(value));
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
        await new Promise(requestAnimationFrame);
      }
    }
  }, sample.components);
  assert.deepEqual(await game.locator('input[id^="hplc-rt-"]').evaluateAll(inputs => inputs.map(input => Number(input.value))), sample.components.map(component => component.referenceRt));
  await game.locator(".hplc-fit-button").click();
  await game.locator(".hplc-result.is-revealed").waitFor();
  assert.match((await game.locator(".hplc-result header strong").innerText()).replace(/\s+/g, ""), /^100\/100$/);
  return { seed, sample };
}

try {
  for (const locale of locales) for (const width of widths) {
    const profile = { locale, width, result: "PASS", checks: [], pageErrors: [] };
    const context = await browser.newContext({ viewport: { width, height: width < 721 ? 844 : 1000 }, hasTouch: true });
    const page = await context.newPage();
    page.setDefaultTimeout(15_000);
    page.on("pageerror", error => profile.pageErrors.push(error.message));
    try {
      await page.goto(`${origin}/${locale}/games`);
      await page.waitForFunction(() => document.documentElement.dataset.reduceEffects !== undefined);
      const guide = page.getByRole("button", { name: /^(Got it|知道了|明白了|了解了)$/ });
      if (await guide.isVisible()) await guide.click();
      const stage = page.locator('[data-app-id="games"] .game-stage');
      await stage.locator(".minefield").waitFor();
      const select = async id => {
        await page.locator(`[data-game-id="${id}"]`).click();
        await page.waitForFunction(id => document.querySelector(".games-app")?.dataset.game === id, id);
        await frame(page);
      };
      const mines = stage.locator(".minefield"), mineActions = stage.locator(".mine-toolbar button");
      await mineActions.first().click(); await mines.locator("button").nth(1).click(); await mineActions.first().click();
      await mines.locator("button").first().click();
      assert.equal(await stage.locator(".game-face--lost").count(), 0, "The first reveal is safe even after placing a flag");
      assert.equal(await mines.locator("button").nth(1).innerText(), "F", "First-reveal placement preserves pre-existing flags");
      await mineActions.last().click();
      await mines.locator("button").first().click();
      assert.equal(await stage.locator(".game-face--lost").count(), 0, "The first reveal after reset is also safe");
      const knownField = deskArcade.createMinefield(92, 0);
      const safeSquares = knownField.flatMap((cell, index) => cell.mine ? [] : [index]);
      await mines.evaluate(async (board, squares) => { for (const square of squares) { board.querySelectorAll("button")[square].click(); await new Promise(requestAnimationFrame); } }, safeSquares);
      assert.equal(await stage.locator(".game-face--won").count(), 1, "All safe squares complete the field");
      profile.checks.push("Minefield first reveal/reset safety, preserved flag and full win");

      await select("puzzle");
      const tile = stage.locator(".puzzle-board button:not(:disabled)").first();
      const identity = await tile.getAttribute("data-puzzle-tile");
      await tile.focus(); await page.keyboard.press("Enter"); await frame(page);
      assert.equal(await page.evaluate(() => document.activeElement.getAttribute("data-puzzle-tile")), identity, "The moved tile retains keyboard focus");
      assert.match(await stage.locator(".puzzle-counter").innerText(), /^1/);
      const blankIndex = await stage.locator(".puzzle-board button").evaluateAll(buttons => buttons.findIndex(button => button.dataset.puzzleTile === "0"));
      await page.keyboard.press(blankIndex >= 4 ? "ArrowUp" : "ArrowDown"); await frame(page);
      assert.match(await stage.locator(".puzzle-counter").innerText(), /^2/, "Arrow navigation continues after Enter without refocusing");
      assert.ok(await page.evaluate(() => Boolean(document.activeElement.closest(".puzzle-board"))));
      profile.checks.push("Sliding Puzzle preserves focus and consecutive keyboard moves");

      await select("snake");
      const snake = stage.locator(".snake-game"); await snake.waitFor();
      const snakeToggle = snake.locator(".arcade-game__actions button").first();
      await snakeToggle.click();
      await page.waitForFunction(() => document.querySelector(".snake-game .arcade-game__scoreboard dd")?.textContent === "10");
      await snakeToggle.click(); const resumeLabel = await snakeToggle.innerText();
      await frame(page); const snakeBoard = await snake.locator('[role="img"]').innerHTML();
      await select("minefield"); await page.waitForTimeout(400);
      assert.equal(await snake.locator('[role="img"]').innerHTML(), snakeBoard, "Inactive Snake remains frozen");
      await select("snake"); assert.equal(await snake.locator('[role="img"]').innerHTML(), snakeBoard);
      assert.equal(await snakeToggle.innerText(), resumeLabel); assert.equal(await snake.locator(".arcade-game__scoreboard dd").first().innerText(), "10");
      await snakeToggle.click(); await select("minefield"); await select("snake");
      assert.equal(await snakeToggle.innerText(), resumeLabel, "Switching away from a running game pauses it");
      await snakeToggle.click();
      await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, value: true }); document.dispatchEvent(new Event("visibilitychange")); });
      await frame(page); assert.equal(await snakeToggle.innerText(), resumeLabel);
      const hiddenSnakeBoard = await snake.locator('[role="img"]').innerHTML(); await page.waitForTimeout(400);
      assert.equal(await snake.locator('[role="img"]').innerHTML(), hiddenSnakeBoard);
      await page.evaluate(() => { delete document.hidden; document.dispatchEvent(new Event("visibilitychange")); });
      await snakeToggle.click();
      const gameGuide = snake.locator(".arcade-game__guide");
      await gameGuide.locator("summary").click(); await frame(page);
      assert.equal(await snakeToggle.innerText(), resumeLabel, "Opening instructions pauses the game");
      assert.ok(await gameGuide.locator("p").first().isVisible(), "The game description remains available on phones");
      assert.ok(await gameGuide.locator("#snake-game-keys").isVisible());
      await gameGuide.locator("summary").click();
      profile.checks.push("Snake score/session survives game changes, pauses when inactive/hidden and needs resume");

      await select("brickbreaker");
      const brick = stage.locator(".brick-game"); await brick.waitFor();
      const brickToggle = brick.locator(".arcade-game__actions button").first();
      const paddleX = () => brick.locator(".brick-game__paddle").evaluate(element => Number(element.style.transform.match(/translate3d\(([-\d.]+)%/)[1]) * 24 / 100);
      await brickToggle.click();
      for (const [index, sign] of [[1, 1], [0, -1]]) {
        const button = brick.locator(".brick-game__move-controls button").nth(index);
        await button.scrollIntoViewIfNeeded(); const bounds = await button.boundingBox(); const before = await paddleX();
        await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2); await page.mouse.down();
        await page.waitForTimeout(300); const during = await paddleX(); await page.mouse.up();
        assert.ok((during - before) * sign > 15, "Changing focus between paddle controls must preserve continuous mouse-hold movement");
      }
      await brickToggle.click(); const brickResumeLabel = await brickToggle.innerText(); await frame(page);
      const brickBoard = await brick.locator('[role="img"]').innerHTML();
      await select("snake"); await page.waitForTimeout(400); await select("brickbreaker");
      assert.equal(await brick.locator('[role="img"]').innerHTML(), brickBoard); assert.equal(await brickToggle.innerText(), brickResumeLabel);
      profile.checks.push("Brick Breaker holds through internal focus changes and preserves paused session");

      await select("spectrum");
      const peak = stage.locator(".hplc-peak-dock"); await peak.waitFor(); await frame(page);
      for (const difficulty of ["easy", "medium", "hard"]) {
        const { seed, sample } = await fitExact(peak, difficulty);
        const scored = await peak.locator(".hplc-result").innerHTML();
        await select("snake"); await select("spectrum");
        assert.equal(await peak.locator(".hplc-result").innerHTML(), scored, "Peak Dock retains its current fit when changing games");
        const range = peak.locator('input[id^="hplc-rt-"]').first();
        await range.scrollIntoViewIfNeeded(); await range.focus(); await page.keyboard.press("ArrowRight");
        assert.equal(await peak.locator(".hplc-result.is-revealed").count(), 0);
        await peak.locator(".hplc-reset-button").click();
        assert.deepEqual(await peak.locator('input[id^="hplc-rt-"]').evaluateAll(inputs => inputs.map(input => Number(input.value))), sample.initialRetentionTimes);
        await peak.locator(".hplc-fit-button").click(); await peak.locator(".hplc-result.is-revealed").waitFor();
        await peak.locator(".hplc-new-sample").click();
        const nextSeed = Number((await peak.locator(".hplc-sample-strip p").innerText()).match(/\d{10}/)[0]);
        assert.notEqual(nextSeed, seed); assert.equal(await peak.locator(".hplc-result.is-revealed").count(), 0);
        const nextSample = peakDock.generateSample(difficulty, nextSeed);
        assert.deepEqual(await peak.locator('input[id^="hplc-rt-"]').evaluateAll(inputs => inputs.map(input => Number(input.value))), nextSample.initialRetentionTimes);
        if (difficulty !== "easy") assert.deepEqual(await peak.locator('input[id^="hplc-amplitude-"]').evaluateAll(inputs => inputs.map(input => Number(input.value))), nextSample.initialAmplitudes);
        profile.checks.push(`Peak Dock ${difficulty}: 100-point fit, preserved session, edit invalidation, reset and new sample`);
      }
      assert.deepEqual(profile.pageErrors, []);
      console.log(`PASS ${engine} arcade ${locale} ${width}: ${profile.checks.length} behavior groups`);
    } catch (error) {
      profile.result = "FAIL"; profile.error = error.stack;
      await page.screenshot({ path: resolve(output, `${engine}-${locale}-${width}-failure.png`) }).catch(() => {});
      console.log(`FAIL ${engine} arcade ${locale} ${width}: ${error.message}`);
    } finally { report.profiles.push(profile); await save(); await context.close(); }
  }
} finally { await browser.close(); }
report.completed = new Date().toISOString(); await save();
assert.ok(report.profiles.every(profile => profile.result === "PASS"), `Arcade browser failures: ${resolve(output, `${engine}-arcade.json`)}`);
