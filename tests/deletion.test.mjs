import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import {
  ingest,
  query,
  Store,
  deleteScope,
  undoDelete,
  previewPurge,
  purge,
  backup,
  restore,
} from '../dist/index.js';
import { traceFixture, local } from './fixtures/graph.mjs';
import { storageFixture, fixtureNow } from './fixtures/storage.mjs';

test('scoped deletion hides only selected records; guarded undo restores graph links and replay is bounded', async (t) => {
  const f = await traceFixture(t);
  const g = f.write([
    f.action,
    f.event,
    f.transition,
    {
      op: 'create_flow',
      client_ref: 'flow',
      name: 'Members',
      transition_ids: [local('transition')],
      scope: f.scope,
    },
  ]);
  const flow = g.data.client_refs.find((r) => r.client_ref === 'flow').id;
  const other = ingest(f.store, f.request({ role: 'viewer' }), fixtureNow).data;
  const q = {
    ...f.base,
    mode: 'flow',
    scope: f.scope,
    flow_id: flow,
    budget: { records: 50, bytes: 100000 },
  };
  const before = query(f.store, q, fixtureNow).data;
  const input = {
    ...f.base,
    scope: f.scope,
    request_id: 'delete_a',
    expected_store_revision: f.store.revision,
  };
  const d = deleteScope(f.store, input);
  assert.equal(query(f.store, q, fixtureNow).data.status, 'no_matches');
  assert.deepEqual(deleteScope(f.store, input), d);
  assert.equal(
    query(
      f.store,
      {
        ...f.base,
        mode: 'search',
        scope: { ...f.scope, role: 'viewer' },
        filters: { ids: [other.state_id] },
      },
      fixtureNow,
    ).data.records[0].id,
    other.state_id,
  );
  assert.throws(() => ingest(f.store, f.before, fixtureNow), {
    code: 'NOT_FOUND',
  });
  assert.throws(() => ingest(f.store, f.request(), fixtureNow), {
    code: 'CONFLICT',
  });
  assert.throws(() => f.write([{ ...f.action, client_ref: 'hidden_action' }]), {
    code: 'NOT_FOUND',
  });
  assert.throws(
    () =>
      undoDelete(f.store, {
        ...f.base,
        request_id: 'undo_stale',
        deletion_batch: d.deletion_batch,
        expected_store_revision: 0,
      }),
    { code: 'CONFLICT' },
  );
  const u = undoDelete(f.store, {
    ...f.base,
    request_id: 'undo_a',
    deletion_batch: d.deletion_batch,
    expected_store_revision: f.store.revision,
  });
  assert.equal(u.record_count, d.record_count);
  assert.deepEqual(query(f.store, q, fixtureNow).data, before);
});
test('purge needs exclusive access and a fresh scoped preview; backups retain separately recoverable data', async (t) => {
  const f = await traceFixture(t);
  const snapshot = await backup(f.store);
  const d = deleteScope(f.store, {
    ...f.base,
    scope: f.scope,
    request_id: 'delete_b',
    expected_store_revision: f.store.revision,
  });
  const p = previewPurge(f.store, { ...f.base, scope: f.scope });
  assert.equal(p.record_count, d.record_count);
  assert.equal(p.backups_retain_data, true);
  assert.throws(
    () =>
      purge(f.store, {
        ...f.base,
        scope: f.scope,
        preview_token: p.preview_token,
      }),
    { code: 'STORE_BUSY' },
  );
  f.store.close();
  const m = await Store.open(f.configPath, 'maintenance');
  try {
    assert.throws(
      () => purge(m, { ...f.base, scope: f.scope, preview_token: 'stale' }),
      { code: 'CONFLICT' },
    );
    const r = purge(m, {
      ...f.base,
      scope: f.scope,
      preview_token: p.preview_token,
    });
    assert.equal(r.record_count, d.record_count);
    assert.equal(r.storage_reclaimed, true);
    assert.deepEqual(m.db.prepare('SELECT * FROM records').all(), []);
    assert.deepEqual(m.db.pragma('foreign_key_check'), []);
    assert.throws(
      () =>
        undoDelete(m, {
          ...f.base,
          request_id: 'after_purge',
          deletion_batch: d.deletion_batch,
          expected_store_revision: m.revision,
        }),
      { code: 'CONFLICT' },
    );
  } finally {
    m.close();
  }
  await restore(f.configPath, snapshot.backup_id, snapshot.sha256);
  const reopened = await Store.open(f.configPath);
  assert.equal(reopened.revision, snapshot.store_revision);
  reopened.close();
});
test('lowering storage cap refuses ingestion atomically and preserves existing history', async (t) => {
  const f = await storageFixture(t);
  const first = f.request();
  const a = ingest(f.store, first, fixtureNow).data;
  f.store.close();
  const config = JSON.parse(await readFile(f.configPath, 'utf8'));
  config.storage_limit_bytes = 1;
  await writeFile(f.configPath, JSON.stringify(config));
  const reopened = await Store.open(f.configPath);
  try {
    const revision = reopened.revision;
    assert.throws(() => ingest(reopened, f.request(), fixtureNow), {
      code: 'STORAGE_LIMIT',
    });
    assert.equal(reopened.revision, revision);
    assert.equal(
      ingest(reopened, first, fixtureNow).data.capture_id,
      a.capture_id,
    );
    assert.equal(
      query(
        reopened,
        {
          ...f.base,
          scope: first.capture.scope,
          mode: 'search',
          filters: { ids: [a.state_id] },
        },
        fixtureNow,
      ).data.records.length,
      1,
    );
  } finally {
    reopened.close();
  }
});
