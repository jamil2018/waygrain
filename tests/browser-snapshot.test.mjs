import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomUUID } from 'node:crypto';
import { mapSnapshot, mappedRoute } from '../dist/browser/snapshot.js';
import { validateResponse } from '../dist/contracts/index.js';
import { ingest } from '../dist/core/ingest.js';
import { storageFixture } from './fixtures/storage.mjs';
import { sensitive } from './fixtures/ui/index.mjs';

test('C02 public JSON mapping removes values/URLs/refs, preserves order and ingests compatible identity', async (t) => {
  const { store, base } = await storageFixture(t);
  const app = store.location.configuration.apps[0];
  const { alias, ...scope } = app.scopes[0];
  assert(alias);
  const binding = { session_id: randomUUID(), page_id: randomUUID(), scope };
  const raw = [
    { role: 'heading', name: 'Members' },
    {
      role: 'button',
      name: 'Invite',
      ref: 'SYNTHETIC_TRANSIENT_REF_DO_NOT_RETAIN',
      url: sensitive.secret,
    },
    {
      role: 'textbox',
      name: 'Email',
      text: sensitive.personal,
      children: [sensitive.payment],
    },
    { role: 'text', text: sensitive.injection },
  ];
  const a = mapSnapshot(raw, app, binding, '/members', 'trace', 1);
  const b = mapSnapshot(raw, app, binding, '/members', 'trace', 2);
  validateResponse('wg_browser_snapshot', {
    schema_version: 1,
    browser_schema_version: 1,
    store_revision: 0,
    warnings: [],
    data: a,
  });
  for (const marker of Object.values(sensitive))
    assert(!JSON.stringify(a).includes(marker));
  assert(!JSON.stringify(a).includes('SYNTHETIC_TRANSIENT_REF_DO_NOT_RETAIN'));
  assert.deepEqual(
    a.capture.tree.children.map((n) => n.name),
    ['Members', 'Invite', 'Email', ''],
  );
  assert.equal(a.targets.length, 2);
  const run = (data, id) =>
    ingest(store, {
      ...base,
      request_id: id,
      screen_ref: { kind: 'new', name: 'Members', view_key: 'members' },
      capture: data.capture,
    });
  const first = run(a, 'one'),
    second = run(b, 'two');
  assert.equal(first.data.state_id, second.data.state_id);
  assert.notEqual(first.data.capture_id, second.data.capture_id);
  assert.notEqual(a.snapshot_id, b.snapshot_id);
});

test('C02 unmapped/ambiguous routes fail and unsupported/truncated coverage is ingestible partial root', async (t) => {
  const { store, base } = await storageFixture(t);
  const app = store.location.configuration.apps[0];
  const { alias, ...scope } = app.scopes[0];
  assert(alias);
  const binding = { session_id: randomUUID(), page_id: randomUUID(), scope };
  assert.equal(
    mappedRoute(
      'https://fixture.test/members?secret=SYNTHETIC_SECRET#private',
      app,
      scope.origin,
    ),
    '/members',
  );
  assert.throws(
    () => mappedRoute('https://forbidden.test/members', app, scope.origin),
    { code: 'ORIGIN_NOT_ALLOWED' },
  );
  assert.throws(
    () => mappedRoute('https://fixture.test/missing', app, scope.origin),
    { code: 'INCOMPATIBLE_CAPTURE' },
  );
  const partial = mapSnapshot(
    [{ role: 'mystery', name: 'Members', expanded: true }],
    app,
    binding,
    '/members',
    'trace',
    1,
  );
  assert.equal(partial.capture.coverage.reason, 'unsupported');
  const output = ingest(store, {
    ...base,
    request_id: 'partial',
    screen_ref: { kind: 'new', name: 'Members', view_key: 'members' },
    capture: partial.capture,
  });
  assert.equal(output.data.state_id, null);
  const truncated = mapSnapshot(
    Array.from({ length: 6000 }, () => ({ role: 'button', name: 'Invite' })),
    app,
    binding,
    '/members',
    'trace',
    2,
  );
  assert.equal(truncated.capture.tree.children.length, 4999);
  assert.equal(truncated.capture.coverage.reason, 'truncated');
});
