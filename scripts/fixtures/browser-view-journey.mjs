import assert from "node:assert/strict";

/** Runs against the actual translated demo, using stable structure and keyboard actions. */
export async function exerciseBrowserView(page, demo) {
  const first = demo.locator('[data-viewer="0"]');
  const second = demo.locator('[data-viewer="1"]');
  const firstNote = first.locator("textarea"), secondNote = second.locator("textarea");
  await firstNote.fill("Keep this review");
  assert.equal(await secondNote.inputValue(), "Keep this review");
  assert.equal(await secondNote.isDisabled(), true);
  await second.locator("button").nth(1).focus();
  await page.keyboard.press("Enter");
  await demo.locator("[data-agent-action]").click();
  assert.equal(await first.locator('input[type="checkbox"]').isChecked(), true);
  assert.equal(await second.locator('input[type="checkbox"]').isChecked(), false);
  await second.locator("button").nth(1).click();
  assert.equal(await second.locator('input[type="checkbox"]').isChecked(), true);
  assert.equal(await secondNote.inputValue(), "Keep this review");
  await second.locator('button[aria-pressed]').click();
  await secondNote.fill("Second viewer edit");
  assert.equal(await firstNote.inputValue(), "Second viewer edit");
  const details = demo.locator("details");
  await details.locator("summary").focus(); await page.keyboard.press("Enter");
  const buttons = details.getByRole("button");
  for (let index = 0; index < 4; index++) await buttons.nth(0).click();
  assert.equal(await buttons.nth(0).isDisabled(), true);
  assert.equal(await details.locator('[data-filled="true"]').count(), 4);
  assert.match(await details.locator('[data-transport-status]').innerText(), /256 KiB/);
  await buttons.nth(1).click();
  assert.equal(await buttons.nth(0).isEnabled(), true);
  assert.equal(await details.locator('[data-filled="true"]').count(), 3);
  await buttons.nth(2).click();
  assert.equal(await details.locator('[data-filled="true"]').count(), 0);
  assert.equal(await buttons.nth(0).isDisabled(), true);
  await buttons.nth(3).click();
  assert.equal(await buttons.nth(0).isEnabled(), true);
  await demo.locator('[data-agent-action]').locator('..').getByRole('button').nth(1).click();
  assert.equal(await firstNote.inputValue(), "");
  assert.equal(await secondNote.isDisabled(), true);
  assert.equal(await first.locator('input[type="checkbox"]').isChecked(), false);
  return { kind: "shared-browser-recovery", displayedContentChanged: true, checks: ["shared note", "view-only guard", "disconnected stale snapshot", "agent continuation", "reconnect preserves state", "second-viewer input", "four-slot bound", "ACK resumes", "stall disconnect", "reset", "keyboard"] };
}
