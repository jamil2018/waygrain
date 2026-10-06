import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { ingest } from '../dist/core/ingest.js';
import { storageFixture, fixtureNow } from './fixtures/storage.mjs';
import { sensitive, fixtureSettings } from './fixtures/ui/index.mjs';

test('B04 distinct captures preserve history while compatible identity and controls are reused', async (t) => {
  const { store, request } = await storageFixture(t);
  const firstRequest = request();
  const one = ingest(store, firstRequest, fixtureNow);
  const two = ingest(store, request(), fixtureNow);
  assert.notEqual(one.data.capture_id, two.data.capture_id);
  assert.equal(one.data.screen_id, two.data.screen_id);
  assert.equal(one.data.state_id, two.data.state_id);
  assert.equal(one.data.state_hash, two.data.state_hash);
  assert.deepEqual(one.data.control_ids, two.data.control_ids);
  assert.equal(store.revision, 2);
  assert.deepEqual(ingest(store, firstRequest, fixtureNow), one);
  assert.equal(store.revision, 2);
  const changed = request({ version: 2 });
  const three = ingest(store, changed, fixtureNow);
  assert.notEqual(three.data.state_id, one.data.state_id);
  assert.equal(
    store.db.prepare('SELECT COUNT(*) AS n FROM captures').get().n,
    3,
  );
  assert.equal(store.db.prepare('SELECT COUNT(*) AS n FROM states').get().n, 2);
  assert.throws(() =>
    store.db
      .prepare('UPDATE states SET state_hash=? WHERE id=?')
      .run('a'.repeat(64), one.data.state_id),
  );
  const raw = {
    ...firstRequest,
    capture: {
      ...firstRequest.capture,
      tree: { ...firstRequest.capture.tree, name: 'changed unapproved text' },
    },
  };
  assert.throws(() => ingest(store, raw, fixtureNow), {
    code: 'IDEMPOTENCY_CONFLICT',
  });
});
test('B04 screen names/routes alone never merge; explicit IDs and configured view keys constrain identity', async (t) => {
  const { store, request } = await storageFixture(t);
  const one = ingest(
    store,
    request({}, { screen_ref: { kind: 'new', name: 'Members' } }),
    fixtureNow,
  );
  const two = ingest(
    store,
    request({}, { screen_ref: { kind: 'new', name: 'Members' } }),
    fixtureNow,
  );
  assert.notEqual(one.data.screen_id, two.data.screen_id);
  const three = ingest(
    store,
    request(
      {},
      { screen_ref: { kind: 'existing', screen_id: one.data.screen_id } },
    ),
    fixtureNow,
  );
  assert.equal(three.data.state_id, one.data.state_id);
  const wrongKey = request(
    {},
    { screen_ref: { kind: 'new', name: 'Members', view_key: 'settings' } },
  );
  assert.throws(() => ingest(store, wrongKey, fixtureNow), {
    code: 'INCOMPATIBLE_CAPTURE',
  });
  const wrongScope = request(
    { role: 'viewer' },
    { screen_ref: { kind: 'existing', screen_id: one.data.screen_id } },
  );
  assert.throws(() => ingest(store, wrongScope, fixtureNow), {
    code: 'NOT_FOUND',
  });
  assert.equal(store.revision, 3);
});
test('B04 partial fragments have no state/control identity and cannot confirm complete evidence', async (t) => {
  const { store, request } = await storageFixture(t);
  const full = ingest(store, request(), fixtureNow);
  const partial = request();
  partial.capture.coverage = {
    kind: 'partial',
    subtree: 'members',
    reason: 'subtree_only',
  };
  const result = ingest(store, partial, fixtureNow);
  assert.equal(result.data.state_id, null);
  assert.equal(result.data.state_hash, null);
  assert.deepEqual(result.data.control_ids, []);
  assert.match(result.data.fragment_hash, /^[a-f0-9]{64}$/);
  assert.equal(store.db.prepare('SELECT COUNT(*) AS n FROM states').get().n, 1);
  assert.deepEqual(
    store.db
      .prepare('SELECT target_id FROM evidence_links WHERE capture_id=?')
      .all(result.data.capture_id),
    [{ target_id: full.data.screen_id }],
  );
  assert.equal(
    store.db
      .prepare('SELECT COUNT(*) AS n FROM evidence_links WHERE target_id=?')
      .get(full.data.state_id).n,
    1,
  );
});
test('B04 scope/application separation, revision conflicts and sequence reuse fail atomically', async (t) => {
  const settings = fixtureSettings();
  settings.apps.push({
    ...JSON.parse(JSON.stringify(settings.apps[0])),
    alias: 'second',
  });
  const { store, request } = await storageFixture(t, settings);
  const one = ingest(store, request(), fixtureNow);
  for (const options of [{ role: 'viewer' }, { environment: 'production' }]) {
    const result = ingest(store, request(options), fixtureNow);
    assert.notEqual(result.data.state_id, one.data.state_id);
    assert.notEqual(result.data.screen_id, one.data.screen_id);
  }
  const crossApp = request(
    {},
    {
      app_id: store.location.configuration.apps[1].app_id,
      screen_ref: { kind: 'existing', screen_id: one.data.screen_id },
    },
  );
  assert.throws(() => ingest(store, crossApp, fixtureNow), {
    code: 'NOT_FOUND',
  });
  const stale = request({}, { expected_store_revision: 0 });
  assert.throws(() => ingest(store, stale, fixtureNow), { code: 'CONFLICT' });
  const duplicateSeq = request();
  duplicateSeq.capture.trace_seq = 1;
  assert.throws(() => ingest(store, duplicateSeq, fixtureNow), {
    code: 'CONFLICT',
  });
  assert.equal(store.revision, 3);
  assert.equal(
    store.db.prepare('SELECT COUNT(*) AS n FROM receipts').get().n,
    3,
  );
});
test('B04 privacy repeats on disk/WAL/receipts and sanitized replay has exactly one effect', async (t) => {
  const { store, request } = await storageFixture(t);
  const raw = request(
    {},
    {
      screen_ref: {
        kind: 'new',
        name: sensitive.personal,
        view_key: 'members',
      },
    },
  );
  const first = ingest(store, raw, fixtureNow);
  const replay = JSON.parse(JSON.stringify(raw));
  replay.capture.tree.children.at(-1).name = sensitive.secret;
  assert.deepEqual(ingest(store, replay, fixtureNow), first);
  for (const path of [
    store.location.databasePath,
    store.location.databasePath + '-wal',
  ]) {
    const bytes = await readFile(path);
    for (const value of Object.values(sensitive))
      assert(!bytes.includes(Buffer.from(value)));
  }
  assert.equal(store.db.prepare('SELECT name FROM screens').get().name, '');
  assert.equal(store.revision, 1);
  const invalid = request();
  invalid.capture.tree.value = sensitive.secret;
  assert.throws(
    () => ingest(store, invalid, fixtureNow),
    (error) => !JSON.stringify(error).includes(sensitive.secret),
  );
  assert.equal(store.revision, 1);
});

test('B04 replay survives reopening and numeric control order remains stable beyond ten children', async (t) => {
  const { store, configPath, request } = await storageFixture(t);
  const input = request();
  input.capture.tree.children = Array.from({ length: 12 }, () => ({
    role: 'button',
    name: 'Invite',
    enabled: true,
    visible: true,
    children: [],
  }));
  const one = ingest(store, input, fixtureNow);
  const repeat = request();
  repeat.capture.tree = input.capture.tree;
  assert.deepEqual(
    ingest(store, repeat, fixtureNow).data.control_ids,
    one.data.control_ids,
  );
  store.close();
  const { Store } = await import('../dist/store/database.js');
  const reopened = await Store.open(configPath);
  try {
    assert.deepEqual(ingest(reopened, input, fixtureNow), one);
    assert.equal(reopened.revision, 2);
  } finally {
    reopened.close();
  }
});

test('B04 failure after screen/state/control creation rolls every record and receipt back', async (t) => {
  const { store, request } = await storageFixture(t);
  store.db.exec(
    "CREATE TRIGGER reject_capture BEFORE INSERT ON captures BEGIN SELECT RAISE(ABORT,'synthetic'); END;",
  );
  assert.throws(() => ingest(store, request(), fixtureNow), {
    code: 'CONFLICT',
  });
  assert.equal(store.revision, 0);
  for (const table of [
    'records',
    'scopes',
    'screens',
    'states',
    'controls',
    'captures',
    'evidence_links',
    'receipts',
  ])
    assert.equal(
      store.db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get().n,
      0,
    );
});
