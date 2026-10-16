/* global document, Event */
import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, mkdir, copyFile, chmod, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { Store } from '../../dist/store/database.js';
import { descriptorFixture } from '../../dist/descriptor/fixture.js';
import { startDescriptorService } from '../../dist/descriptor/http/server.js';
import { writeBundle, bundleHistory } from '../../dist/descriptor/store.js';
import { storageFixture } from '../fixtures/storage.mjs';
test('W12 editor exports full history, previews clean restore, invalidates edits and restores without partial writes', async (t) => {
  const f = await storageFixture(t),
    bundle = await descriptorFixture(f.base.project_id, f.base.app_id);
  writeBundle(f.store, { schema_version: 1, expected_revision: 0, bundle });
  const source = await startDescriptorService(f.store);
  t.after(() => source.close());
  const root = await mkdtemp('/private/tmp/waygrain-archive-ui-');
  await mkdir(join(root, 'storage'), { mode: 0o700 });
  const config = join(root, 'config.json');
  await copyFile(f.configPath, config);
  await chmod(config, 0o600);
  const store = await Store.open(config),
    target = await startDescriptorService(store);
  t.after(async () => {
    await target.close();
    store.close();
    await rm(root, { recursive: true, force: true });
  });
  const browser = await chromium.launch({ headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage();
  page.setDefaultTimeout(5000);
  let errors = 0;
  page.on('pageerror', () => errors++);
  await page.goto(source.authorURL);
  await page
    .getByRole('button', { name: 'Export history', exact: true })
    .click();
  await page.getByRole('status').filter({ hasText: 'Export ready.' }).waitFor();
  const archive = await page
    .getByLabel('History archive (JSON)', { exact: true })
    .inputValue();
  assert.deepEqual(JSON.parse(archive).history, [bundle]);
  await page.goto(target.authorURL);
  const text = page.getByLabel('History archive (JSON)', { exact: true }),
    preview = page.getByRole('button', {
      name: 'Preview history restore',
      exact: true,
    }),
    commit = page.getByRole('button', {
      name: 'Commit history restore',
      exact: true,
    });
  await text.evaluate((el, value) => {
    el.value = value;
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }, archive);
  await preview.click();
  await page
    .getByRole('status')
    .filter({ hasText: 'Validated 1 revisions' })
    .waitFor();
  assert.equal(store.revision, 0);
  assert(await commit.isEnabled());
  await text.fill('{}');
  assert(await commit.isDisabled());
  assert.equal(store.revision, 0);
  await text.evaluate((el, value) => {
    el.value = value;
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }, archive);
  await preview.click();
  await page
    .getByRole('status')
    .filter({ hasText: 'Validated 1 revisions' })
    .waitFor();
  await commit.click();
  await page
    .getByRole('status')
    .filter({ hasText: 'History restored.' })
    .waitFor();
  assert.deepEqual(bundleHistory(store, bundle.app_id), [bundle]);
  await page.reload();
  await page
    .getByRole('status')
    .filter({ hasText: 'Saved revision 1' })
    .waitFor();
  assert(
    (await page.locator('#bundle-editor').inputValue()).includes(
      bundle.sources[0].id,
    ),
  );
  await text.evaluate((el, value) => {
    el.value = value;
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }, archive);
  await preview.click();
  await page
    .getByRole('status')
    .filter({ hasText: 'Restore refused:' })
    .waitFor();
  assert(await commit.isDisabled());
  assert.equal(store.revision, 1);
  assert.equal(errors, 0);
  assert.equal(
    await page.evaluate(
      () => document.querySelectorAll('script[src*="calculate"]').length,
    ),
    0,
  );
});
