/* global window */
// Explicit real-browser check with disposable synthetic store and no retained browser artifacts.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import { chromium } from 'playwright';
import {
  descriptorFixture,
  fixtureTargets,
} from '../../dist/descriptor/fixture.js';
import { startDescriptorService } from '../../dist/descriptor/http/server.js';
import {
  readBundle,
  writeBundle,
  previewBundle,
} from '../../dist/descriptor/store.js';
import { storageFixture } from '../fixtures/storage.mjs';
test('W07 real editor validates without writes, saves inert text, reloads provenance and mapping states', async (t) => {
  const f = await storageFixture(t),
    bundle = await descriptorFixture(f.base.project_id, f.base.app_id);
  writeBundle(f.store, { schema_version: 1, expected_revision: 0, bundle });
  const service = await startDescriptorService(f.store);
  t.after(() => service.close());
  const browser = await chromium.launch({ headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage();
  let pageErrors = 0,
    consoleErrors = 0;
  page.on('pageerror', () => pageErrors++);
  page.on('console', (m) => {
    if (['error', 'warning'].includes(m.type())) consoleErrors++;
  });
  await page.goto(service.authorURL);
  await page
    .getByRole('status')
    .filter({ hasText: 'Saved revision 1.' })
    .waitFor();
  const malicious = '<script>window.fixturePwned=1</script> synthetic purpose';
  await page.getByLabel('purpose', { exact: true }).fill(malicious);
  await page
    .getByRole('button', { name: 'Validate draft', exact: true })
    .click();
  await page
    .getByRole('status')
    .filter({ hasText: 'Draft valid. Nothing has been saved.' })
    .waitFor();
  assert.equal(f.store.revision, 1);
  assert.notEqual(
    readBundle(f.store, f.base.app_id).documents[0].purpose,
    malicious,
  );
  await page
    .getByRole('button', { name: 'Save revision', exact: true })
    .click();
  await page
    .getByRole('status')
    .filter({ hasText: 'Saved revision 2.' })
    .waitFor();
  assert.equal(f.store.revision, 2);
  assert.equal(
    readBundle(f.store, f.base.app_id).documents[0].purpose,
    malicious,
  );
  assert.equal(await page.evaluate(() => window.fixturePwned), undefined);
  await page.reload();
  await page
    .getByRole('status')
    .filter({ hasText: 'Saved revision 2.' })
    .waitFor();
  assert.equal(
    await page.getByLabel('purpose', { exact: true }).inputValue(),
    malicious,
  );
  const ambiguous = bundle.documents.findIndex(
    (d) =>
      d.scope.state === 'ambiguous-mapping' &&
      d.target_id === fixtureTargets.calculate,
  );
  await page
    .getByLabel('Page or component description')
    .selectOption(String(ambiguous));
  assert(
    (await page.locator('#mapping-list').textContent()).includes('ambiguous'),
  );
  assert(
    (await page.locator('#claim-list').textContent()).includes('code-verified'),
  );
  assert(
    (await page.locator('#claim-list').textContent()).includes(
      'assets/descriptor-demo/calculate.mjs#calculate',
    ),
  );
  // Invalid advanced bundle stays a local draft and validation cannot create partial rows.
  await page
    .getByText('Claims, sources, applicability and mappings', { exact: true })
    .click();
  const bad = readBundle(f.store, f.base.app_id);
  bad.documents[0].claim_ids = ['00000000-0000-4000-8000-000000000099'];
  await page.getByLabel('Knowledge bundle (JSON)').fill(JSON.stringify(bad));
  await page
    .getByRole('button', { name: 'Apply bundle changes to draft', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Validate draft', exact: true })
    .click();
  await page
    .getByRole('alert')
    .filter({ hasText: 'Validation failed: INVALID_INPUT' })
    .waitFor();
  assert.equal(f.store.revision, 2);
  // API conflict preview never advances state either.
  assert.throws(
    () =>
      previewBundle(f.store, {
        schema_version: 1,
        expected_revision: 1,
        bundle,
      }),
    { code: 'CONFLICT' },
  );
  assert.equal(f.store.revision, 2);
  await page.getByRole('button', { name: 'Reload saved', exact: true }).click();
  await page
    .getByRole('status')
    .filter({ hasText: 'Saved revision 2.' })
    .waitFor();
  const created = readBundle(f.store, f.base.app_id),
    targetId = randomUUID(),
    claimId = randomUUID();
  const template = created.claims.find(
    (c) =>
      c.evidence_class === 'documented' &&
      c.scope.role === 'reader' &&
      c.scope.version === '1' &&
      c.scope.state === 'default',
  );
  created.targets.push({
    id: targetId,
    kind: 'page',
    page_id: null,
    key: 'authored-page',
  });
  created.claims.push({
    ...template,
    id: claimId,
    revision_id: randomUUID(),
    supersedes_revision_id: null,
    target_id: targetId,
  });
  created.documents.push({
    ...created.documents[0],
    id: randomUUID(),
    revision_id: randomUUID(),
    supersedes_revision_id: null,
    target_id: targetId,
    name: 'Authored synthetic page',
    purpose: '',
    related_target_ids: [],
    claim_ids: [claimId],
  });
  created.mappings.push({
    id: randomUUID(),
    target_id: targetId,
    scope: template.scope,
    target_key: 'authored-page',
    status: 'missing',
  });
  await page
    .getByLabel('Knowledge bundle (JSON)')
    .fill(JSON.stringify(created));
  await page
    .getByRole('button', { name: 'Apply bundle changes to draft', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Validate draft', exact: true })
    .click();
  await page
    .getByRole('status')
    .filter({ hasText: 'Draft valid. Nothing has been saved.' })
    .waitFor();
  await page
    .getByRole('button', { name: 'Save revision', exact: true })
    .click();
  await page
    .getByRole('status')
    .filter({ hasText: 'Saved revision 3.' })
    .waitFor();
  const persisted = readBundle(f.store, f.base.app_id);
  assert.equal(
    persisted.documents.find((d) => d.target_id === targetId).purpose,
    '',
  );
  assert.equal(
    persisted.claims.find((c) => c.id === claimId).sources[0].source_id,
    template.sources[0].source_id,
  );
  assert.equal(
    persisted.mappings.find((m) => m.target_id === targetId).status,
    'missing',
  );
  // Expected failed validation logs a browser HTTP400; no unhandled JS failures.
  assert.equal(pageErrors, 0);
  assert(consoleErrors <= 1);
});
