/* global document, window */
// Real ephemeral browser; never retain screenshot/trace/video/profile/raw DOM artifacts.
import assert from 'node:assert/strict';
import console from 'node:console';
import { chromium } from 'playwright';
import { storageFixture } from '../fixtures/storage.mjs';
import { descriptorFixture } from '../../dist/descriptor/fixture.js';
import { writeBundle } from '../../dist/descriptor/store.js';
import { startDescriptorService } from '../../dist/descriptor/http/server.js';
const cleanups = [];
const f = await storageFixture({
  after: (callback) => cleanups.push(callback),
});
writeBundle(f.store, {
  schema_version: 1,
  expected_revision: 0,
  bundle: await descriptorFixture(f.base.project_id, f.base.app_id),
});
const service = await startDescriptorService(f.store);
let browser;
try {
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  let errors = 0;
  page.on('pageerror', () => errors++);
  page.on('console', (message) => {
    if (['error', 'warning'].includes(message.type())) errors++;
  });
  await page.goto(service.readURL);
  await page.getByRole('button', { name: 'Calculate', exact: true }).click();
  assert.equal(await page.locator('#total').textContent(), '90.00');
  await page.getByLabel('Quantity', { exact: true }).fill('9');
  await page.getByRole('button', { name: 'Calculate', exact: true }).click();
  assert.equal(
    await page.locator('#discount-note').textContent(),
    'No quantity discount.',
  );
  await page.getByLabel('Quantity', { exact: true }).fill('1.5');
  await page.getByRole('button', { name: 'Calculate', exact: true }).click();
  assert(
    (await page.getByRole('alert').textContent()).includes('whole quantity'),
  );
  assert.equal(
    await page.locator('#discount-note').textContent(),
    'Correct the inputs to calculate a total.',
  );
  for (const width of [320, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    );
  }
  await page.getByLabel('Quantity', { exact: true }).focus();
  await page.keyboard.press('Tab');
  assert.equal(await page.locator(':focus').getAttribute('id'), 'unit-price');
  assert.equal(errors, 0);
  console.log(
    'W04 real Chromium: calculation/validation, labels, keyboard and 4 viewport widths PASS; no artifacts retained.',
  );
} finally {
  await browser?.close();
  await service.close();
  for (const cleanup of cleanups) await cleanup();
}
