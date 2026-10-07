import assert from 'node:assert/strict';
import test from 'node:test';
import { evidence, ingest } from '../dist/index.js';
import { traceFixture, existing, local } from './fixtures/graph.mjs';
import { fixtureNow } from './fixtures/storage.mjs';
function run(f, overrides = {}) {
  return {
    op: 'record_test_run',
    client_ref: 'run',
    run: {
      runner: 'synthetic_runner',
      runner_version: 'v1',
      application_version: 'Members',
      scope: f.scope,
      started_at: new Date(fixtureNow - 4000).toISOString(),
      finished_at: new Date(fixtureNow).toISOString(),
      outcome: 'passed',
      assertions: [
        {
          target_id: local('transition'),
          assertion: 'Members',
          result: 'passed',
          evidence_ids: [local('event')],
        },
      ],
      ...overrides,
    },
  };
}
test('D03 atomic flows and matching passed assertions confer only targeted test verification', async (t) => {
  const f = await traceFixture(t);
  const transition = {
    ...f.transition,
    provenance: 'test_verified',
    test_run_id: local('run'),
  };
  const result = f.write([
    f.action,
    f.event,
    transition,
    {
      op: 'create_flow',
      client_ref: 'flow',
      name: 'Members',
      transition_ids: [local('transition')],
      scope: f.scope,
    },
    run(f),
    {
      op: 'add_annotation',
      annotation: {
        target_id: local('transition'),
        kind: 'description',
        value: 'Members',
        author_type: 'agent',
        evidence_ids: [existing(f.a.capture_id), existing(f.b.capture_id)],
        scope: f.scope,
        provenance: 'test_verified',
        test_run_id: local('run'),
      },
    },
  ]);
  const refs = Object.fromEntries(
    result.data.client_refs.map((r) => [r.client_ref, r.id]),
  );
  const flow = JSON.parse(
    f.store.db
      .prepare('SELECT payload_json FROM graph_records WHERE id=?')
      .get(refs.flow).payload_json,
  );
  assert.deepEqual(flow.transition_ids, [refs.transition]);
  const annotation = evidence(
    f.store,
    {
      ...f.base,
      ids: [result.data.created_ids.at(-1)],
      projection: 'structured',
    },
    fixtureNow,
  ).data.items[0];
  assert.equal(annotation.provenance, 'test_verified');
  assert.equal(annotation.test_run_id, refs.run);
  assert.equal(
    f.store.db
      .prepare("SELECT count(*) n FROM relations WHERE type='part_of'")
      .get().n,
    1,
  );
});
test('D03 failed/skipped/unrelated/timing/scope evidence cannot promote a target and rolls back the batch', async (t) => {
  const mutations = [
    { outcome: 'failed' },
    { outcome: 'skipped' },
    { started_at: new Date(fixtureNow - 500).toISOString() },
  ];
  for (const change of mutations) {
    const f = await traceFixture(t),
      revision = f.store.revision;
    assert.throws(
      () =>
        f.write([
          f.action,
          f.event,
          {
            ...f.transition,
            provenance: 'test_verified',
            test_run_id: local('run'),
          },
          run(f, change),
        ]),
      { code: 'INCOMPATIBLE_CAPTURE' },
    );
    assert.equal(f.store.revision, revision);
    assert.equal(
      f.store.db.prepare('SELECT COUNT(*) n FROM graph_records').get().n,
      0,
    );
  }
  const f = await traceFixture(t);
  const skipped = run(f);
  skipped.run.assertions[0].result = 'skipped';
  assert.throws(
    () =>
      f.write([
        f.action,
        f.event,
        {
          ...f.transition,
          provenance: 'test_verified',
          test_run_id: local('run'),
        },
        skipped,
      ]),
    { code: 'INCOMPATIBLE_CAPTURE' },
  );
  const unrelated = run(f);
  unrelated.run.assertions[0].target_id = existing(f.a.state_id);
  assert.throws(
    () =>
      f.write([
        f.action,
        f.event,
        {
          ...f.transition,
          provenance: 'test_verified',
          test_run_id: local('run'),
        },
        unrelated,
      ]),
    { code: 'INCOMPATIBLE_CAPTURE' },
  );
  const endpoint = run(f);
  endpoint.run.assertions[0].evidence_ids = [existing(f.a.capture_id)];
  assert.throws(() => f.write([f.action, f.event, f.transition, endpoint]), {
    code: 'INCOMPATIBLE_CAPTURE',
  });
});
test('D03 failed runs retain evidence; disconnected/reversed flow order rejects', async (t) => {
  const f = await traceFixture(t);
  const result = f.write([
    f.action,
    f.event,
    f.transition,
    run(f, { outcome: 'failed' }),
  ]);
  const transition = result.data.client_refs.find(
    (r) => r.client_ref === 'transition',
  ).id;
  assert.equal(
    f.store.db
      .prepare("SELECT count(*) n FROM graph_records WHERE kind='test_run'")
      .get().n,
    1,
  );
  assert.throws(
    () =>
      f.write([
        {
          op: 'create_flow',
          name: 'Members',
          transition_ids: [existing(transition), existing(transition)],
          scope: f.scope,
        },
      ]),
    { code: 'INCOMPATIBLE_CAPTURE' },
  );
  const unsafe = run(f);
  unsafe.run.application_version = 'synthetic_secret_version';
  assert.throws(() => f.write([unsafe]), { code: 'INVALID_INPUT' });
});

test('D03 every cited item must support the assertion target', async (t) => {
  const f = await traceFixture(t);
  const request = f.request({}, { screen_ref: { kind: 'new', name: 'Home' } });
  request.capture.trace_seq = 5;
  request.capture.captured_at = new Date(fixtureNow - 1000).toISOString();
  const unrelated = ingest(f.store, request, fixtureNow).data;
  const report = run(f);
  report.run.assertions[0].evidence_ids.push(existing(unrelated.capture_id));
  const revision = f.store.revision;
  assert.throws(() => f.write([f.action, f.event, f.transition, report]), {
    code: 'INCOMPATIBLE_CAPTURE',
  });
  assert.equal(f.store.revision, revision);
});
