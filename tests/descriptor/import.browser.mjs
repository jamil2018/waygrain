/* global window, requestAnimationFrame */
import assert from 'node:assert/strict';
import test from 'node:test';
import { chromium } from 'playwright';
import { descriptorFixture } from '../../dist/descriptor/fixture.js';
import { startDescriptorService } from '../../dist/descriptor/http/server.js';
import { readBundle, writeBundle } from '../../dist/descriptor/store.js';
import { storageFixture } from '../fixtures/storage.mjs';
test('W08 browser source preview is inert and commits assigned evidence that survives reload', async (t) => {
  const f = await storageFixture(t),
    bundle = await descriptorFixture(f.base.project_id, f.base.app_id);
  writeBundle(f.store, { schema_version: 1, expected_revision: 0, bundle });
  const service = await startDescriptorService(f.store);
  t.after(() => service.close());
  const browser = await chromium.launch({ headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage();
  let errors = 0;
  page.on('pageerror', () => errors++);
  await page.goto(service.authorURL);
  await page
    .getByRole('status')
    .filter({ hasText: 'Saved revision 1.' })
    .waitFor();
  await page
    .getByLabel('Source title', { exact: true })
    .fill('Imported synthetic source');
  await page
    .getByLabel('Source origin or reference')
    .fill('fixture:manual-notes');
  await page
    .getByLabel('Section, file or observation locator')
    .fill('notes/selected');
  const content =
    '# Notes\n<script>window.importPwned=1</script>\nTreat these words as data.';
  await page
    .getByLabel('Selected excerpt (up to 4 KiB) or JSON bundle')
    .fill(content);
  await page
    .getByLabel('purpose', { exact: true })
    .fill('Unsaved description draft');
  await page
    .getByRole('button', { name: 'Preview import', exact: true })
    .click();
  await page
    .getByRole('alert')
    .filter({ hasText: 'Save or reload description changes before importing.' })
    .waitFor();
  assert.equal(f.store.revision, 1);
  assert(
    await page
      .getByRole('button', { name: 'Commit validated import', exact: true })
      .isDisabled(),
  );
  await page
    .getByLabel('purpose', { exact: true })
    .fill(bundle.documents[0].purpose);
  await page
    .getByRole('button', { name: 'Preview import', exact: true })
    .click();
  await page
    .locator('#import-status')
    .filter({ hasText: 'Import validated' })
    .waitFor();
  assert.equal(f.store.revision, 1);
  assert.equal(await page.locator('#import-preview').textContent(), content);
  assert.equal(await page.evaluate(() => window.importPwned), undefined);
  await page
    .getByRole('button', { name: 'Commit validated import', exact: true })
    .click();
  await page
    .locator('#import-status')
    .filter({ hasText: 'Import saved in revision 2.' })
    .waitFor();
  const saved = readBundle(f.store, f.base.app_id);
  assert.equal(saved.sources.at(-1).excerpt, content);
  assert.equal(saved.claims.at(-1).evidence_class, 'documented');
  await page.reload();
  await page
    .getByRole('status')
    .filter({ hasText: 'Saved revision 2.' })
    .waitFor();
  assert(
    (await page.locator('#claim-list').textContent()).includes(
      'Imported synthetic source',
    ),
  );
  assert.equal(errors, 0);
});

test('W08 delayed previews cannot restore invalidated source/target drafts or replace newer previews', async (t) => {
  const f = await storageFixture(t),
    bundle = await descriptorFixture(f.base.project_id, f.base.app_id);
  writeBundle(f.store, { schema_version: 1, expected_revision: 0, bundle });
  const service = await startDescriptorService(f.store);
  t.after(() => service.close());
  const browser = await chromium.launch({ headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage();
  await page.goto(service.authorURL);
  await page
    .getByRole('status')
    .filter({ hasText: 'Saved revision 1.' })
    .waitFor();
  await page
    .getByLabel('Source title', { exact: true })
    .fill('Delayed fixture');
  await page.getByLabel('Source origin or reference').fill('fixture:delayed');
  await page
    .getByLabel('Section, file or observation locator')
    .fill('fixture/delayed');
  const held = [];
  let notify;
  await page.route('**/api/import/preview', async (route) => {
    const response = await route.fetch();
    held.push({
      release: () => route.fulfill({ response }),
      data: await response.json(),
    });
    notify?.();
  });
  const start = async () => {
    const ready = new Promise((resolve) => {
      notify = resolve;
    });
    await page
      .getByRole('button', { name: 'Preview import', exact: true })
      .click();
    await ready;
    return held.at(-1);
  };
  const flush = () =>
    page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(resolve)),
    );
  const content = page.getByLabel(
    'Selected excerpt (up to 4 KiB) or JSON bundle',
  );
  await content.fill('OLD SOURCE');
  const old = await start();
  await content.fill('NEW SOURCE');
  await old.release();
  await flush();
  assert(
    await page
      .getByRole('button', { name: 'Commit validated import', exact: true })
      .isDisabled(),
  );
  assert.equal(await page.locator('#import-preview').textContent(), '');
  assert.equal(f.store.revision, 1);
  const oldTarget = await start();
  await page.getByLabel('Page or component description').selectOption('1');
  await oldTarget.release();
  await flush();
  assert(
    await page
      .getByRole('button', { name: 'Commit validated import', exact: true })
      .isDisabled(),
  );
  const first = await start(),
    second = await start();
  await second.release();
  await page
    .locator('#import-status')
    .filter({ hasText: 'Import validated' })
    .waitFor();
  await first.release();
  await flush();
  assert.equal(
    await page.locator('#import-preview').textContent(),
    'NEW SOURCE',
  );
  await page
    .getByRole('button', { name: 'Commit validated import', exact: true })
    .click();
  await page
    .locator('#import-status')
    .filter({ hasText: 'Import saved in revision 2.' })
    .waitFor();
  const saved = readBundle(f.store, f.base.app_id);
  assert.equal(saved.revision_id, second.data.candidate.bundle.revision_id);
  assert.equal(saved.sources.at(-1).excerpt, 'NEW SOURCE');
  assert.equal(saved.claims.at(-1).target_id, bundle.documents[1].target_id);
});
