import assert from 'node:assert/strict';
import test from 'node:test';
import { ingest, Store } from '../dist/index.js';
import { existing, local, traceFixture } from './fixtures/graph.mjs';
import { fixtureNow } from './fixtures/storage.mjs';
test('D02 atomic source action, ordered event and observed transition survive reopening', async (t) => {
  const f = await traceFixture(t);
  const result = f.write([f.action, f.event, f.transition]);
  assert.equal(result.data.created_ids.length, 3);
  assert.equal(
    f.store.db
      .prepare("SELECT COUNT(*) n FROM graph_records WHERE kind='transition'")
      .get().n,
    1,
  );
  assert.equal(
    f.store.db
      .prepare("SELECT COUNT(*) n FROM relations WHERE type='offers'")
      .get().n,
    1,
  );
  const peer = await Store.open(f.configPath);
  assert.equal(
    peer.db
      .prepare("SELECT COUNT(*) n FROM graph_records WHERE kind='transition'")
      .get().n,
    1,
  );
  peer.close();
  const collision = f.request();
  collision.capture.trace_seq = 2;
  assert.throws(() => ingest(f.store, collision, fixtureNow), {
    code: 'CONFLICT',
  });
  const actionId = result.data.client_refs.find(
    (r) => r.client_ref === 'action',
  ).id;
  assert.throws(
    () =>
      f.write([
        {
          ...f.event,
          event: { ...f.event.event, action_id: existing(actionId) },
        },
      ]),
    { code: 'CONFLICT' },
  );
});
test('D02 mismatched trace/scope/session/tab/sequence/time and source control reject whole batch', async (t) => {
  const cases = [
    { trace_id: 'other_trace' },
    { session_id: 'other_session' },
    { tab_id: 'other_tab' },
    { trace_seq: 1 },
    { trace_seq: 3 },
    { trace_seq: 4 },
    { occurred_at: new Date(fixtureNow - 4000).toISOString() },
    { occurred_at: new Date(fixtureNow).toISOString() },
    {
      scope: {
        environment: 'staging',
        origin: 'http://127.0.0.1:4173',
        role: 'viewer',
        account_scope: 'synthetic',
        locale: 'en',
      },
    },
  ];
  for (const change of cases) {
    const f = await traceFixture(t);
    const revision = f.store.revision;
    assert.throws(() =>
      f.write([
        f.action,
        { ...f.event, event: { ...f.event.event, ...change } },
        f.transition,
      ]),
    );
    assert.equal(f.store.revision, revision);
    assert.equal(
      f.store.db.prepare('SELECT COUNT(*) n FROM graph_records').get().n,
      0,
    );
  }
  const f = await traceFixture(t);
  assert.throws(
    () => f.write([{ ...f.action, control_id: existing(f.b.control_ids[0]) }]),
    { code: 'INCOMPATIBLE_CAPTURE' },
  );
  assert.throws(
    () =>
      f.write([
        { ...f.action, input_schema: { kind: 'text', required: true } },
      ]),
    { code: 'INVALID_INPUT' },
  );
  assert.throws(
    () =>
      f.write([
        f.action,
        f.event,
        { ...f.transition, source_state_id: existing(f.b.state_id) },
      ]),
    { code: 'INCOMPATIBLE_CAPTURE' },
  );
  assert.throws(
    () => f.write([f.action, f.event, { ...f.transition, outcome: 'timeout' }]),
    { code: 'INCOMPATIBLE_CAPTURE' },
  );
});
test('D02 missing/incomplete after evidence can retain failed event but never invent a transition', async (t) => {
  const f = await traceFixture(t);
  const failed = {
    ...f.event,
    event: {
      ...f.event.event,
      after_capture_id: null,
      outcome: 'timeout',
      error_code: 'ACTION_TIMEOUT',
    },
  };
  const result = f.write([f.action, failed]);
  const [action, event] = result.data.created_ids;
  assert.throws(
    () =>
      f.write([
        {
          ...f.transition,
          action_id: existing(action),
          action_event_id: existing(event),
        },
      ]),
    { code: 'INCOMPATIBLE_CAPTURE' },
  );
  const partial = f.request();
  partial.capture.trace_seq = 5;
  partial.capture.coverage = {
    kind: 'partial',
    subtree: 'root',
    reason: 'unsupported',
  };
  const fragment = ingest(f.store, partial, fixtureNow).data;
  assert.throws(
    () =>
      f.write([
        {
          ...f.event,
          event: {
            ...f.event.event,
            trace_seq: 4,
            action_id: existing(action),
            after_capture_id: existing(fragment.capture_id),
          },
        },
      ]),
    { code: 'INCOMPATIBLE_CAPTURE' },
  );
  assert.throws(
    () =>
      f.write([
        {
          ...f.transition,
          action_id: local('absent'),
          action_event_id: existing(event),
        },
      ]),
    { code: 'NOT_FOUND' },
  );
});
