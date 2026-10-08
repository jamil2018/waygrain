import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { validateSettings } from '../../../dist/config/schema.js';
import { mapSnapshot, mappedRoute } from '../../../dist/browser/snapshot.js';
import { normalizeCapture } from '../../../dist/core/normalize.js';
import { ingest } from '../../../dist/core/ingest.js';
import { storageFixture } from '../../../tests/fixtures/storage.mjs';
const settings = JSON.parse(
  await readFile(
    new URL('../../../assets/pilot/blogen-settings.json', import.meta.url),
    'utf8',
  ),
);
test('independent Blogen profile scope, modal, privacy and partial-ingest boundaries', async (t) => {
  validateSettings(settings);
  assert.deepEqual(settings.apps[0].allowed_origins, ['http://localhost:3000']);
  const fixture = await storageFixture(t, settings);
  const app = fixture.store.location.configuration.apps[0];
  const scope = { ...app.scopes[0] };
  delete scope.alias;
  const binding = { session_id: randomUUID(), page_id: randomUUID(), scope };
  const map = (raw, seq = 1) =>
    mapSnapshot(raw, app, binding, '/admin/categories', randomUUID(), seq);
  const snap = map([
    {
      role: 'dialog',
      name: 'Create category',
      children: [
        {
          role: 'textbox',
          name: 'Title',
          value: 'waygrain pilot category',
          children: ['waygrain pilot category'],
        },
        { role: 'button', name: 'Create' },
      ],
    },
    { role: 'button', name: 'SYNTHETIC_UNTRUSTED_EXECUTE' },
    { role: 'text', text: 'SYNTHETIC_PII' },
    { role: 'text', text: '2026-01-01' },
    { role: 'text', text: '739' },
  ]);
  assert.equal(snap.capture.coverage.kind, 'complete');
  assert.deepEqual(snap.capture.view.modal_stack, ['create_category']);
  assert(!JSON.stringify(snap).includes('SYNTHETIC_'));
  assert(!JSON.stringify(snap).includes('waygrain pilot category'));
  assert(!JSON.stringify(snap).includes('2026-01-01'));
  assert(!snap.targets.some((x) => x.name.includes('UNTRUSTED')));
  const unknownModal = map(
    [{ role: 'dialog', name: 'SYNTHETIC_UNKNOWN_MODAL' }],
    2,
  );
  assert.equal(unknownModal.capture.coverage.kind, 'partial');
  assert.deepEqual(unknownModal.capture.view.modal_stack, []);
  const table = map(
    [
      {
        role: 'table',
        name: 'Categories',
        children: [{ role: 'columnheader', name: 'Category' }],
      },
    ],
    3,
  );
  assert.equal(table.capture.coverage.kind, 'partial');
  const result = ingest(fixture.store, {
    ...fixture.base,
    request_id: 'independent_partial',
    screen_ref: {
      kind: 'new',
      name: 'Categories',
      view_key: 'admin-categories',
    },
    capture: table.capture,
  });
  assert.equal(result.data.state_id, null);
  assert.equal(
    mappedRoute(
      'http://localhost:3000/categories?synthetic=unknown#private',
      app,
      scope.origin,
    ),
    '/categories',
  );
  for (const url of [
    'http://127.0.0.1:3000/categories',
    'https://localhost:3000/categories',
    'http://localhost:3001/categories',
    'http://synthetic:synthetic@localhost:3000/categories',
  ])
    assert.throws(() => mappedRoute(url, app, scope.origin), {
      code: 'ORIGIN_NOT_ALLOWED',
    });
  for (const url of [
    'http://localhost:3000/admin/users',
    'http://localhost:3000/posts/search/categories/synthetic',
  ])
    assert.throws(() => mappedRoute(url, app, scope.origin), {
      code: 'INCOMPATIBLE_CAPTURE',
    });
  for (const override of [
    { role: 'owner' },
    { account_scope: 'synthetic-other' },
    { locale: 'en' },
    { origin: 'http://localhost:3001' },
  ])
    assert.throws(
      () =>
        normalizeCapture(
          { ...snap.capture, scope: { ...scope, ...override } },
          app,
        ),
      { code: 'UNKNOWN_SCOPE' },
    );
  console.log(
    JSON.stringify({
      status: 'passed',
      node: process.version,
      checks: [
        'unknown_text_and_counts_dropped',
        'allowlisted_editable_value_dropped',
        'unknown_modal_partial',
        'unsupported_table_partial_without_state',
        'origin_route_and_scope_refusals',
        'URL_query_fragment_not_retained',
      ],
    }),
  );
});
