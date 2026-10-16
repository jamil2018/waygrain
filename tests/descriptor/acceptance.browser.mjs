/* global window, document */
import assert from 'node:assert/strict';
import test from 'node:test';
import { chromium } from 'playwright';
import { descriptorFixture } from '../../dist/descriptor/fixture.js';
import { startDescriptorService } from '../../dist/descriptor/http/server.js';
import { writeBundle } from '../../dist/descriptor/store.js';
import { groundedAnswer } from '../../dist/descriptor/providers/validation.js';
import { storageFixture } from '../fixtures/storage.mjs';
const ten = 'Why is the total 90 for 10 items at 10 each?';
async function setup(t, touch = false) {
  const f = await storageFixture(t);
  writeBundle(f.store, {
    schema_version: 1,
    expected_revision: 0,
    bundle: await descriptorFixture(f.base.project_id, f.base.app_id),
  });
  let release, entered;
  const service = await startDescriptorService(f.store, {
    provider: {
      label: 'Held synthetic acceptance provider',
      generate: async (input) => {
        entered?.();
        await new Promise((resolve) => {
          release = resolve;
        });
        return groundedAnswer(input, 'Held synthetic acceptance provider');
      },
    },
  });
  t.after(() => service.close());
  const browser = await chromium.launch({ headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage({
    viewport: { width: 320, height: 640 },
    hasTouch: touch,
  });
  page.setDefaultTimeout(5000);
  await page.goto(service.readURL);
  await page
    .getByRole('status')
    .filter({ hasText: 'Documentation ready' })
    .waitFor();
  await page.evaluate(() => {
    window.actions = 0;
    document.addEventListener('fixture-calculated', () => window.actions++);
  });
  return {
    page,
    hold: () =>
      new Promise((resolve) => {
        entered = resolve;
      }),
    release: () => release(),
  };
}
test('W21 preserves a newer draft and restores owned panel focus when an answer replaces a source trigger', async (t) => {
  const { page, hold, release } = await setup(t);
  const details = page.getByRole('button', {
    name: 'Details for calculate',
    exact: true,
  });
  await details.focus();
  await page.keyboard.press('Enter');
  const panel = page.getByRole('region', {
    name: 'Component documentation',
    exact: true,
  });
  const section = panel.getByRole('region', {
    name: 'Ask about this',
    exact: true,
  });
  const question = section.getByLabel('Product question');
  const ask = section.getByRole('button', {
    name: 'Ask about this',
    exact: true,
  });
  await section
    .getByRole('status')
    .filter({ hasText: 'Ready for a scoped' })
    .waitFor();
  await question.fill(ten);
  const first = hold();
  await ask.focus();
  await page.keyboard.press('Enter');
  await first;
  await question.fill('What about 9?');
  release();
  await section
    .getByRole('status')
    .filter({ hasText: 'Answer ready.' })
    .waitFor();
  assert.equal(await question.inputValue(), 'What about 9?');
  const second = hold();
  await ask.click();
  await second;
  const citation = section
    .getByRole('button', {
      name: 'Open cited documented source 1',
      exact: true,
    })
    .first();
  await citation.click();
  const inspector = page.getByRole('region', { name: 'Source inspector' });
  await inspector.locator('pre').waitFor();
  release();
  await section
    .getByRole('status')
    .filter({ hasText: 'Answer ready.' })
    .waitFor();
  assert(
    (await section.textContent()).includes('no quantity discount applies'),
  );
  await page.keyboard.press('Escape');
  const close = panel.getByRole('button', {
    name: 'Close documentation',
    exact: true,
  });
  assert(await close.evaluate((el) => el === document.activeElement));
  await page.keyboard.press('Escape');
  assert(await details.evaluate((el) => el === document.activeElement));
  assert.equal(await page.evaluate(() => window.actions), 0);
  assert.equal(await page.locator('#total').textContent(), 'Not calculated');
});
test('W21 narrow touch navigation opens component/page sources without host activation or horizontal overflow', async (t) => {
  const { page } = await setup(t, true);
  await page
    .getByRole('button', { name: 'Details for calculate', exact: true })
    .tap();
  let panel = page.getByRole('region', {
    name: 'Component documentation',
    exact: true,
  });
  await panel
    .getByRole('button')
    .filter({ hasText: 'Synthetic documented' })
    .first()
    .tap();
  const inspector = page.getByRole('region', { name: 'Source inspector' });
  await inspector.locator('pre').waitFor();
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  );
  await inspector.getByRole('button', { name: 'Close source inspector' }).tap();
  await panel
    .getByRole('button', { name: 'Close documentation', exact: true })
    .tap();
  await page
    .getByRole('button', { name: 'Page documentation', exact: true })
    .tap();
  panel = page.getByRole('region', { name: 'Page documentation', exact: true });
  await panel
    .getByRole('heading', { name: 'Purpose', exact: true })
    .first()
    .waitFor();
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  );
  assert.equal(await page.evaluate(() => window.actions), 0);
  assert.equal(await page.locator('#total').textContent(), 'Not calculated');
});
