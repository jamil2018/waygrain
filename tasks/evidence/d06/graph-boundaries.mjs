// Independent synthetic many-edge cutoff and populated migration probe.
import assert from 'node:assert/strict';
import { rm, readFile } from 'node:fs/promises';
import console from 'node:console';
import process from 'node:process';
import { traceFixture, existing } from '../../../tests/fixtures/graph.mjs';
import { ingest, query, Store } from '../../../dist/index.js';
import { fixtureNow } from '../../../tests/fixtures/storage.mjs';
const cleanup = [];
const f = await traceFixture({ after: (fn) => cleanup.push(fn) });
try {
  const loopAfter = f.request();
  loopAfter.capture.trace_seq = 2000;
  loopAfter.capture.captured_at = new Date(fixtureNow - 500).toISOString();
  const c = ingest(f.store, loopAfter, fixtureNow).data;
  assert.equal(c.state_id, f.a.state_id);
  const action = f.write([f.action]).data.created_ids[0];
  const startedRevision = f.store.revision;
  const event = (i) => ({
    op: 'record_action_event',
    client_ref: 'ev_' + i,
    event: {
      action_id: existing(action),
      before_capture_id: existing(f.a.capture_id),
      after_capture_id: existing(c.capture_id),
      trace_id: f.before.capture.trace_id,
      trace_seq: 10 + i,
      session_id: f.before.capture.session_id,
      tab_id: f.before.capture.tab_id,
      scope: f.scope,
      occurred_at: new Date(fixtureNow - 1500).toISOString(),
      outcome: 'success',
      error_code: null,
    },
  });
  const edge = (i) => ({
    op: 'create_transition',
    source_state_id: existing(f.a.state_id),
    action_id: existing(action),
    target_state_id: existing(c.state_id),
    before_capture_id: existing(f.a.capture_id),
    after_capture_id: existing(c.capture_id),
    action_event_id: { kind: 'local', client_ref: 'ev_' + i },
    outcome: 'success',
    guards: [],
    provenance: 'observed',
  });
  for (let i = 0; i < 510; i += 25) {
    const ops = [];
    for (let j = i; j < Math.min(i + 25, 510); j++) ops.push(event(j), edge(j));
    f.write(ops);
  }
  assert.equal(f.store.revision - startedRevision, 21);
  const ask = {
    ...f.base,
    scope: f.scope,
    mode: 'path',
    source_state_id: f.a.state_id,
    target_state_id: f.b.state_id,
    budget: { records: 50, bytes: 60000 },
  };
  const bounded = query(f.store, ask, fixtureNow);
  assert.equal(bounded.data.status, 'incomplete');
  assert.equal(bounded.data.reason, 'BUDGET_EXCEEDED');
  assert.equal(bounded.next_cursor, undefined);
  assert.equal(bounded.data.records.length, 0);
  const n = query(
    f.store,
    {
      ...f.base,
      scope: f.scope,
      mode: 'neighbors',
      target_id: action,
      hops: 1,
      budget: { records: 50, bytes: 60000 },
    },
    fixtureNow,
  );
  assert.equal(n.data.status, 'incomplete');
  assert(n.data.records.length <= 50);
  assert(Buffer.byteLength(JSON.stringify(n)) <= 60000);
  const revision = f.store.revision;
  assert.throws(
    () =>
      f.write([
        {
          op: 'alias_identity',
          from_id: f.a.state_id,
          to_id: f.b.state_id,
          record_kind: 'state',
          rationale: 'UNREVIEWED_RECONCILIATION_TEXT',
          evidence_ids: [f.a.capture_id, f.b.capture_id],
        },
      ]),
    { code: 'INVALID_INPUT' },
  );
  assert.equal(f.store.revision, revision);
  for (const p of [
    f.store.location.databasePath,
    f.store.location.databasePath + '-wal',
  ])
    assert(
      !(await readFile(p)).includes(
        Buffer.from('UNREVIEWED_RECONCILIATION_TEXT'),
      ),
    );
  // Simulate actual version-two database with populated graph; upgrade visibility migration.
  f.store.db.exec(
    'DROP TABLE tombstones; DELETE FROM migrations WHERE version=3; PRAGMA user_version=2;',
  );
  f.store.close();
  const migrated = await Store.open(f.configPath);
  try {
    assert.equal(migrated.db.pragma('user_version', { simple: true }), 3);
    assert.equal(migrated.revision, revision);
    assert.equal(
      migrated.db
        .prepare("SELECT count(*) n FROM graph_records WHERE kind='transition'")
        .get().n,
      510,
    );
    assert.deepEqual(migrated.db.pragma('foreign_key_check'), []);
    assert.deepEqual(query(migrated, ask, fixtureNow), bounded);
    // Hide graph dependency using internal tombstone storage only, not deferred deletion CLI.
    migrated.write(migrated.revision, (r) =>
      migrated.db
        .prepare('INSERT INTO tombstones VALUES(?,?,?,NULL)')
        .run(c.capture_id, 'synthetic-hidden', r),
    );
    assert.equal(query(migrated, ask, fixtureNow).data.status, 'incomplete');
    migrated.write(migrated.revision, (r) => {
      for (const { id } of migrated.db
        .prepare(
          "SELECT id FROM graph_records WHERE kind='transition' LIMIT 10",
        )
        .all())
        migrated.db
          .prepare('INSERT INTO tombstones VALUES(?,?,?,NULL)')
          .run(id, 'synthetic-hidden-edges', r);
    });
    assert.equal(query(migrated, ask, fixtureNow).data.status, 'no_matches');
    assert.throws(
      () =>
        query(
          migrated,
          {
            ...f.base,
            scope: f.scope,
            mode: 'neighbors',
            target_id: action,
            hops: 1,
            cursor: n.next_cursor,
            budget: { records: 50, bytes: 60000 },
          },
          fixtureNow,
        ),
      { code: 'CURSOR_STALE' },
    );
  } finally {
    migrated.close();
  }
  console.log(
    JSON.stringify({
      status: 'graph_boundaries_passed',
      node: process.version,
      observed_self_edges: 510,
      examined_cutoff: 'incomplete_no_cursor',
      migration: 'populated_v2_to_v3_exact_result_revision_FK_preserved',
      hidden_dependency: 'no_matches',
      reads: 'bounded',
    }),
  );
} finally {
  for (const fn of cleanup) await fn();
  await rm(f.root, { recursive: true, force: true });
}
