import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { ingest, query, planRefresh } from '../dist/index.js';
import { storageFixture, fixtureNow } from './fixtures/storage.mjs';
import { traceFixture, local } from './fixtures/graph.mjs';

test('freshness follows new complete observations, not reads, replay or partial fragment volume', async (t) => {
  const f = await storageFixture(t);
  const first = f.request();
  first.capture.captured_at = new Date(fixtureNow - 172800000).toISOString();
  const a = ingest(f.store, first, fixtureNow).data;
  const ask = (id) =>
    query(
      f.store,
      {
        ...f.base,
        mode: 'search',
        scope: first.capture.scope,
        filters: { ids: [id] },
      },
      fixtureNow,
    ).data.records[0];
  for (let i = 0; i < 55; i++) {
    const p = f.request();
    p.capture.coverage = {
      kind: 'partial',
      subtree: 'root',
      reason: 'truncated',
    };
    ingest(f.store, p, fixtureNow);
  }
  const s = ask(a.screen_id);
  assert.equal(s.evidence.freshness.last_checked_at, first.capture.captured_at);
  assert.equal(s.evidence.freshness.status, 'stale');
  assert.equal(Date.parse(s.evidence.freshness.observed_at), fixtureNow);
  const r = {
    ...f.base,
    target_ids: [a.state_id, a.screen_id],
    scope: first.capture.scope,
  };
  const rev = f.store.revision;
  assert.equal(planRefresh(f.store, r, fixtureNow).data.steps.length, 2);
  assert.equal(f.store.revision, rev);
  ingest(f.store, first, fixtureNow);
  assert.equal(
    ask(a.state_id).evidence.freshness.last_checked_at,
    first.capture.captured_at,
  );
  const newObservation = f.request();
  ingest(f.store, newObservation, fixtureNow);
  assert.equal(ask(a.state_id).evidence.freshness.status, 'recent');
  assert.equal(planRefresh(f.store, r, fixtureNow).data.steps.length, 0);
});
test('screen refresh never reverifies historical transitions or flows; plans are scoped and bounded', async (t) => {
  const f = await traceFixture(t);
  const result = f.write([
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
  const ids = Object.fromEntries(
    result.data.client_refs.map((r) => [r.client_ref, r.id]),
  );
  const later = fixtureNow + 172800000;
  const r = f.request();
  r.capture.trace_id = 'fresh_trace';
  r.capture.captured_at = new Date(later).toISOString();
  ingest(f.store, r, later);
  const q = {
    ...f.base,
    scope: f.scope,
    target_ids: [ids.flow, ids.transition],
    max_age_seconds: 86400,
  };
  const rev = f.store.revision;
  const plan = planRefresh(f.store, q, later);
  assert.equal(plan.data.steps.length, 1);
  assert.equal(plan.data.steps[0].minimum_observations, 'before_action_after');
  assert.equal(f.store.revision, rev);
  const tr = query(
    f.store,
    {
      ...f.base,
      mode: 'search',
      scope: f.scope,
      filters: { ids: [ids.transition] },
    },
    later,
  ).data.records[0];
  assert.equal(tr.evidence.freshness.status, 'stale');
  const capped = planRefresh(
    f.store,
    {
      ...q,
      target_ids: [f.a.state_id, ids.transition, randomUUID()],
      step_budget: 1,
    },
    later,
  );
  assert.equal(capped.data.complete, false);
  assert.equal(capped.data.steps.length, 1);
  assert(capped.data.unresolved_ids.length);
  assert.throws(
    () =>
      planRefresh(
        f.store,
        { ...q, scope: { ...f.scope, role: 'viewer' } },
        later,
      ),
    { code: 'INCOMPATIBLE_CAPTURE' },
  );
});
