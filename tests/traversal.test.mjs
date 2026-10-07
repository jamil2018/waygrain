import assert from 'node:assert/strict';
import test from 'node:test';
import { randomUUID } from 'node:crypto';
import { query, ingest } from '../dist/index.js';
import { traceFixture, existing } from './fixtures/graph.mjs';
import { fixtureNow } from './fixtures/storage.mjs';
function ask(f, extra = {}, budget = { records: 50, bytes: 60000 }) {
  return query(
    f.store,
    {
      ...f.base,
      scope: f.scope,
      mode: 'path',
      source_state_id: f.a.state_id,
      target_state_id: f.b.state_id,
      budget,
      ...extra,
    },
    fixtureNow,
  );
}
test('D05 paths retain exact observed edges and unevaluated guards/preconditions are conditional', async (t) => {
  const f = await traceFixture(t);
  const result = f.write([
    { ...f.action, preconditions: ['Home'] },
    f.event,
    { ...f.transition, guards: ['Members'] },
  ]);
  const [action, event, transition] = result.data.created_ids;
  const path = ask(f);
  assert.equal(path.data.status, 'complete');
  assert.equal(path.data.applicability, 'conditional');
  assert.deepEqual(path.data.guards, ['Members', 'Home']);
  assert.deepEqual(
    path.data.records.map((r) => r.id),
    [f.a.state_id, action, transition, f.b.state_id],
  );
  assert(path.warnings.some((w) => w.code === 'STATE_CHANGED'));
  assert.equal(f.store.revision, 3);
  const reversed = ask(f, {
    source_state_id: f.b.state_id,
    target_state_id: f.a.state_id,
  });
  assert.equal(reversed.data.status, 'no_matches');
  const conditional = ask(f, {}, { records: 1, bytes: 8192 });
  assert.equal(conditional.data.status, 'incomplete');
  assert(conditional.next_cursor);
  assert.equal(conditional.data.applicability, 'conditional');
  const next = ask(f, { cursor: conditional.next_cursor });
  assert.equal(next.data.status, 'complete');
  assert.deepEqual(next.data.guards, path.data.guards);
  assert.equal(
    event,
    JSON.parse(
      f.store.db
        .prepare('SELECT payload_json FROM graph_records WHERE id=?')
        .get(transition).payload_json,
    ).action_event_id,
  );
});
test('D05 traversal budgets and missing/tombstoned evidence differ from a completed no-path search', async (t) => {
  const f = await traceFixture(t);
  f.write([f.action, f.event, f.transition]);
  assert.equal(ask(f, { max_visited: 1 }).data.status, 'incomplete');
  assert.throws(() => ask(f, { source_state_id: f.a.capture_id }), {
    code: 'NOT_FOUND',
  });
  const extra = f.request({}, { screen_ref: { kind: 'new', name: 'Home' } });
  extra.capture.trace_seq = 5;
  const c = ingest(f.store, extra, fixtureNow).data;
  assert.equal(
    ask(f, { target_state_id: c.state_id }).data.status,
    'no_matches',
  );
  const revision = f.store.revision;
  f.store.write(revision, (r) =>
    f.store.db
      .prepare('INSERT INTO tombstones VALUES(?,?,?,NULL)')
      .run(f.a.capture_id, 'synthetic_delete', r),
  );
  assert.equal(ask(f).data.status, 'no_matches');
});
test('D05 inferred edge cannot create a usable path; bounded flow retrieval preserves order', async (t) => {
  const f = await traceFixture(t);
  const result = f.write([f.action, f.event, f.transition]);
  const transition = result.data.created_ids[2];
  const flow = f.write([
    {
      op: 'create_flow',
      name: 'Members',
      transition_ids: [existing(transition)],
      scope: f.scope,
    },
  ]).data.created_ids[0];
  const input = {
    ...f.base,
    mode: 'flow',
    scope: f.scope,
    flow_id: flow,
    budget: { records: 50, bytes: 60000 },
  };
  const recalled = query(f.store, input, fixtureNow);
  assert.equal(recalled.data.status, 'complete');
  assert.equal(recalled.data.records[0].kind, 'flow');
  assert.deepEqual(recalled.data.records[0].transition_ids, [transition]);
  const limited = query(f.store, { ...input, max_visited: 1 }, fixtureNow);
  assert.equal(limited.data.status, 'incomplete');
  const payload = JSON.parse(
    f.store.db
      .prepare('SELECT payload_json FROM graph_records WHERE id=?')
      .get(transition).payload_json,
  );
  const rogue = randomUUID();
  const scope = f.store.db
    .prepare('SELECT scope_id FROM records WHERE id=?')
    .get(transition).scope_id;
  f.store.write(f.store.revision, (revision) => {
    f.store.db
      .prepare('INSERT INTO records VALUES(?,?,?,?,?)')
      .run(rogue, f.base.app_id, scope, 'transition', revision);
    f.store.db.prepare('INSERT INTO graph_records VALUES(?,?,?,?,?,?)').run(
      rogue,
      f.base.app_id,
      scope,
      'transition',
      JSON.stringify({
        ...payload,
        source_state_id: f.b.state_id,
        target_state_id: f.a.state_id,
        provenance: 'inferred',
      }),
      new Date(fixtureNow).toISOString(),
    );
  });
  assert.equal(
    ask(f, { source_state_id: f.b.state_id, target_state_id: f.a.state_id })
      .data.status,
    'no_matches',
  );
});
