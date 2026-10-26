import assert from "node:assert/strict";

/** Exercise the visible guided handoff through the real translated controls. */
export async function exerciseBrowserView(page, demo) {
  const next = demo.locator('[data-next-action]');
  const name = demo.locator('[data-demo-name]');
  const reminder = demo.locator('[data-demo-reminder]');
  const action = async expected => {
    assert.equal(await next.getAttribute('data-next-action'), expected);
    await next.scrollIntoViewIfNeeded(); await next.focus(); await page.keyboard.press('Enter');
  };
  assert.equal(await name.isDisabled(), true);
  await action('agent-fill');
  await page.waitForFunction(() => document.activeElement?.hasAttribute('data-demo-name'));
  assert.equal(await name.inputValue(), 'Alex'); assert.equal(await reminder.isChecked(), true);
  await name.fill(''); await action('agent-read');
  assert.equal(await name.getAttribute('aria-invalid'), 'true');
  assert.equal(await name.evaluate(e => e === document.activeElement), true);
  // This is also an English dictionary key: user-authored values must stay exact in Mandarin.
  await name.fill('Name'); await reminder.uncheck(); await action('agent-read');
  await page.waitForFunction(() => document.activeElement?.getAttribute('data-next-action') === 'close');
  assert.ok((await demo.locator('[data-agent-message]').innerText()).includes('Name'));
  await name.fill('Riley Example');
  assert.equal(await next.getAttribute('data-next-action'), 'agent-read');
  await action('agent-read');
  assert.ok((await demo.locator('[data-agent-message]').innerText()).includes('Riley Example'));
  const second = demo.locator('details:has([data-second-view])');
  await second.locator('summary').focus(); await page.keyboard.press('Enter');
  assert.equal(await demo.locator('[data-mirror-name]').innerText(), 'Riley Example');
  await action('close');
  assert.equal(await demo.locator('[data-panel-open]').getAttribute('data-panel-open'), 'false');
  assert.equal(await name.count(), 0);
  assert.equal(await demo.locator('[data-mirror-name]').innerText(), 'Riley Example');
  await demo.locator('[data-reopen-early]').click();
  await page.waitForFunction(() => document.activeElement?.getAttribute('data-next-action') === 'close');
  assert.equal(await name.inputValue(), 'Riley Example');
  await action('close'); await action('agent-submit');
  assert.equal(await demo.locator('[data-panel-open]').getAttribute('data-panel-open'), 'false');
  const mirrorResult = await demo.locator('[data-mirror-result]').innerText();
  await action('open');
  assert.equal(await demo.getAttribute('data-phase'), 'complete');
  assert.equal(await demo.locator('[data-saved-name]').innerText(), 'Riley Example');
  assert.equal(await demo.locator('[data-signup-result] h3').innerText(), mirrorResult);
  await demo.locator('[data-edit-again]').click();
  assert.equal(await name.inputValue(), 'Riley Example'); assert.equal(await reminder.isChecked(), false);
  await demo.locator('[data-restart]').click();
  assert.equal(await next.getAttribute('data-next-action'), 'agent-fill');
  assert.equal(await name.inputValue(), ''); assert.equal(await name.isDisabled(), true);
  return { kind: 'guided-browser-handoff', displayedContentChanged: true, checks: ['agent fills visible form', 'visitor changes actual fields', 'blank-name feedback and focus', 'agent reads visitor values', 'edit invalidates stale readback', 'second screen mirrors values', 'close preserves browser', 'early reopen', 'agent finishes while closed', 'reopen retains chosen values', 'repeat/reset', 'keyboard'] };
}
