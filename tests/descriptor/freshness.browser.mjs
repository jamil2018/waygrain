import assert from 'node:assert/strict';
import test from 'node:test';
import { randomUUID } from 'node:crypto';
import { chromium } from 'playwright';
import {
  descriptorFixture,
  fixtureTargets,
} from '../../dist/descriptor/fixture.js';
import { contentHash } from '../../dist/descriptor/contracts.js';
import { startDescriptorService } from '../../dist/descriptor/http/server.js';
import {
  writeBundle,
  readBundle,
  bundleHistory,
} from '../../dist/descriptor/store.js';
import { storageFixture } from '../fixtures/storage.mjs';
test('W13 source edits surface review warnings; editor explicit verification appends actor/method without read-time promotion', async (t) => {
  const f = await storageFixture(t),
    b = await descriptorFixture(f.base.project_id, f.base.app_id);
  writeBundle(f.store, { schema_version: 1, expected_revision: 0, bundle: b });
  const service = await startDescriptorService(f.store);
  t.after(() => service.close());
  const browser = await chromium.launch({ headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage();
  page.setDefaultTimeout(5000);
  let errors = 0;
  page.on('pageerror', () => errors++);
  const next = JSON.parse(JSON.stringify(b));
  next.revision_id = randomUUID();
  next.supersedes_revision_id = b.revision_id;
  const claim = next.claims.find(
      (c) =>
        c.target_id === fixtureTargets.calculate &&
        c.scope.version === '1' &&
        c.scope.role === 'reader' &&
        c.scope.state === 'default' &&
        c.evidence_class === 'documented',
    ),
    source = next.sources.find((s) => s.id === claim.sources[0].source_id);
  source.supersedes_revision_id = source.revision_id;
  source.revision_id = randomUUID();
  source.excerpt = 'Changed synthetic source; manual review required.';
  source.content_hash = contentHash(source.excerpt);
  claim.supersedes_revision_id = claim.revision_id;
  claim.revision_id = randomUUID();
  claim.sources[0] = {
    source_id: source.id,
    revision_id: source.revision_id,
    content_hash: source.content_hash,
    locator: source.locator,
  };
  const response = await page.request.post(`${service.authorURL}/api/bundle`, {
    headers: { Origin: service.authorURL, 'Content-Type': 'application/json' },
    data: { schema_version: 1, expected_revision: 1, bundle: next },
  });
  assert.equal(response.status(), 200);
  await page.goto(service.readURL);
  await page
    .getByRole('status')
    .filter({ hasText: 'Documentation ready' })
    .waitFor();
  await page
    .getByRole('button', { name: 'Details for calculate', exact: true })
    .click();
  const panel = page.getByRole('region', { name: 'Component documentation' });
  await panel
    .getByRole('heading', { name: 'documented · needs_review', exact: true })
    .waitFor();
  assert((await panel.textContent()).includes('Source content changed'));
  assert.equal(
    readBundle(f.store, b.app_id).claims.find((c) => c.id === claim.id)
      .verification,
    null,
  );
  assert.equal(f.store.revision, 2);
  await page.goto(service.authorURL);
  await page
    .getByRole('status')
    .filter({ hasText: 'Saved revision 2' })
    .waitFor();
  const docIndex = b.documents.findIndex(
    (d) =>
      d.target_id === fixtureTargets.calculate &&
      d.scope.version === '1' &&
      d.scope.role === 'reader' &&
      d.scope.state === 'default',
  );
  await page.locator('#document-choice').selectOption(String(docIndex));
  const article = page.locator('#claim-list article').filter({
    has: page.getByRole('heading', {
      name: 'documented · needs_review',
      exact: true,
    }),
  });
  await article
    .getByRole('combobox', { name: 'Verification method', exact: true })
    .selectOption('supplied-source-review');
  await article
    .getByRole('button', { name: 'Record explicit verification', exact: true })
    .click();
  await page
    .getByRole('status')
    .filter({ hasText: 'Explicit verification recorded;' })
    .waitFor();
  const current = readBundle(f.store, b.app_id).claims.find(
    (c) => c.id === claim.id,
  );
  assert.equal(current.freshness.status, 'current');
  assert.equal(current.verification.actor, 'local-author');
  assert.equal(current.verification.method, 'supplied-source-review');
  assert.equal(f.store.revision, 3);
  assert.equal(bundleHistory(f.store, b.app_id).length, 3);
  assert.equal(b.claims.find((c) => c.id === claim.id).verification, null);
  await page.goto(service.readURL);
  await page
    .getByRole('status')
    .filter({ hasText: 'Documentation ready' })
    .waitFor();
  await page
    .getByRole('button', { name: 'Details for calculate', exact: true })
    .click();
  await page
    .getByRole('region', { name: 'Component documentation' })
    .getByRole('heading', { name: 'documented · current', exact: true })
    .waitFor();
  assert.equal(f.store.revision, 3);
  assert.equal(errors, 0);
});
