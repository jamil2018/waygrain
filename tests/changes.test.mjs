import test from 'node:test';
import assert from 'node:assert/strict';
import { ingest, changes } from '../dist/index.js';
import { storageFixture, fixtureNow } from './fixtures/storage.mjs';

test('capture comparisons cite both captures, preserve coverage and reject incompatible scope', async (t) => {
  const f = await storageFixture(t);
  const a = ingest(f.store, f.request(), fixtureNow).data;
  const r = f.request();
  r.capture.tree.children[0].enabled = false;
  const b = ingest(f.store, r, fixtureNow).data;
  const q = {
    ...f.base,
    mode: 'captures',
    before_capture_id: a.capture_id,
    after_capture_id: b.capture_id,
  };
  const c = changes(f.store, q);
  assert.equal(c.data.status, 'comparable');
  assert.equal(c.data.complete, true);
  assert(c.data.changes.some((c) => c.kind === 'altered'));
  assert(c.data.invalidated_ids.includes(a.state_id));
  for (const item of c.data.changes)
    assert.deepEqual(item.evidence_ids, [a.capture_id, b.capture_id]);
  const partial = f.request();
  partial.capture.coverage = {
    kind: 'partial',
    subtree: 'root',
    reason: 'truncated',
  };
  partial.capture.tree.children = [];
  const p = ingest(f.store, partial, fixtureNow).data;
  const pc = changes(f.store, { ...q, after_capture_id: p.capture_id });
  assert.equal(pc.data.complete, false);
  assert(pc.data.changes.every((c) => c.kind !== 'removed'));
  assert(pc.data.changes.some((c) => c.kind === 'not_seen'));
  const other = ingest(f.store, f.request({ role: 'viewer' }), fixtureNow).data;
  assert.equal(
    changes(f.store, { ...q, after_capture_id: other.capture_id }).data.reason,
    'scope',
  );
});
test('revision comparisons are bounded, cursor-bound and read only', async (t) => {
  const f = await storageFixture(t);
  const r = f.request();
  ingest(f.store, r, fixtureNow);
  const s = f.request();
  s.capture.tree.children = [];
  ingest(f.store, s, fixtureNow);
  const q = {
    ...f.base,
    mode: 'revisions',
    scope: r.capture.scope,
    from_revision: 1,
    to_revision: 2,
    budget: { records: 1, bytes: 8192 },
  };
  const c = changes(f.store, q);
  assert.equal(c.data.complete, false);
  assert(c.next_cursor);
  assert.equal(f.store.revision, 2);
  const next = changes(f.store, { ...q, cursor: c.next_cursor });
  assert(next.data.changes.length);
  assert.throws(() => changes(f.store, { ...q, to_revision: 3 }), {
    code: 'INVALID_INPUT',
  });
  ingest(f.store, f.request(), fixtureNow);
  assert.throws(() => changes(f.store, { ...q, cursor: c.next_cursor }), {
    code: 'CURSOR_STALE',
  });
  assert.throws(
    () => changes(f.store, { ...q, budget: { records: 1, bytes: 1 } }),
    { code: 'BUDGET_EXCEEDED' },
  );
});
