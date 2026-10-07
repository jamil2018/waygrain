import { Buffer } from 'node:buffer';
import assert from 'node:assert/strict';
import test from 'node:test';
import { query, ingest } from '../dist/index.js';
import { storageFixture, fixtureNow } from './fixtures/storage.mjs';
import { traceFixture, existing } from './fixtures/graph.mjs';
const ask = (f, extra = {}, budget = { records: 50, bytes: 60000 }) =>
  query(
    f.store,
    {
      ...f.base,
      mode: 'search',
      scope: f.scope ?? f.before.capture.scope,
      ...(extra.mode && extra.mode !== 'search' ? {} : { filters: {} }),
      budget,
      ...extra,
    },
    fixtureNow,
  );
test('D04 scoped deterministic lexical search ranks IDs/names/tags and returns provenance', async (t) => {
  const f = await traceFixture(t);
  const result = f.write([f.action, f.event, f.transition]);
  const transition = result.data.created_ids[2];
  f.write([
    {
      op: 'add_annotation',
      annotation: {
        target_id: existing(transition),
        kind: 'tag',
        value: 'Members',
        author_type: 'agent',
        evidence_ids: [existing(f.a.capture_id)],
        scope: f.scope,
        provenance: 'inferred',
        rationale: 'Home',
      },
    },
  ]);
  const matches = ask(f, { filters: { terms: ['members'] } });
  assert.equal(matches.data.status, 'complete');
  const tagged = matches.data.records.find((r) => r.id === transition);
  assert(tagged);
  assert.equal(tagged.evidence.provenance, 'observed');
  assert.deepEqual(
    ask(f, { filters: { ids: [transition] } }).data.records.map((r) => r.id),
    [transition],
  );
  const captures = ask(f, { filters: { kinds: ['capture'] } }).data.records;
  assert.equal(captures.length, 2);
  const all = ask(f);
  assert.equal(
    all.data.records.length,
    f.store.db.prepare('SELECT count(*) n FROM records').get().n,
  );
  for (const item of all.data.records) assert.deepEqual(item.scope, f.scope);
  const viewer = { ...f.scope, role: 'viewer' };
  assert.equal(ask(f, { scope: viewer }).data.status, 'no_matches');
  assert.throws(() => ask(f, { scope: { ...f.scope, role: 'unknown' } }), {
    code: 'UNKNOWN_SCOPE',
  });
  assert.deepEqual(
    ask(f, { filters: { terms: ['members'] } }).data.records.map((r) => r.id),
    matches.data.records.map((r) => r.id),
  );
});
test('D04 record/byte budgets, cursor filters and mutation are explicit; empty stores have no matches', async (t) => {
  const empty = await storageFixture(t);
  const req = empty.request();
  empty.scope = req.capture.scope;
  assert.equal(ask(empty).data.status, 'no_matches');
  const f = await traceFixture(t);
  const page = ask(f, {}, { records: 1, bytes: 8192 });
  assert.equal(page.data.status, 'incomplete');
  assert(page.next_cursor);
  assert.equal(page.data.records.length, 1);
  const rest = ask(
    f,
    { cursor: page.next_cursor },
    { records: 50, bytes: 60000 },
  );
  assert.equal(rest.data.status, 'complete');
  assert(!rest.data.records.some((r) => r.id === page.data.records[0].id));
  assert.throws(
    () => ask(f, { filters: { terms: ['Home'] }, cursor: page.next_cursor }),
    { code: 'INVALID_INPUT' },
  );
  const bounded = ask(f, {}, { records: 20, bytes: 1024 });
  assert.equal(bounded.data.status, 'incomplete');
  assert(Buffer.byteLength(JSON.stringify(bounded)) <= 1024);
  const extra = f.request();
  extra.capture.trace_seq = 5;
  ingest(f.store, extra, fixtureNow);
  assert.throws(() => ask(f, { cursor: page.next_cursor }), {
    code: 'CURSOR_STALE',
  });
});
test('D04 bounded typed neighbors respect hops/tombstones and expose annotation conflicts', async (t) => {
  const f = await traceFixture(t);
  f.write([f.action, f.event, f.transition]);
  const op = {
    op: 'add_annotation',
    annotation: {
      target_id: existing(f.a.state_id),
      kind: 'description',
      value: 'Members',
      author_type: 'agent',
      evidence_ids: [existing(f.a.capture_id)],
      scope: f.scope,
      provenance: 'observed',
    },
  };
  f.write([op, { ...op, annotation: { ...op.annotation, value: 'Settings' } }]);
  const conflict = ask(f, { filters: { ids: [f.a.state_id] } });
  assert.equal(
    conflict.data.records[0].evidence.freshness.status,
    'contradicted',
  );
  assert.equal(conflict.warnings[0].code, 'ANNOTATION_CONFLICT');
  const one = ask(f, { mode: 'neighbors', target_id: f.a.screen_id, hops: 1 });
  assert(one.data.records.some((r) => r.id === f.a.state_id));
  const three = ask(f, {
    mode: 'neighbors',
    target_id: f.a.screen_id,
    hops: 3,
  });
  assert(three.data.records.length >= one.data.records.length);
  const revision = f.store.revision;
  f.store.write(revision, (revision) =>
    f.store.db
      .prepare('INSERT INTO tombstones VALUES(?,?,?,NULL)')
      .run(f.a.state_id, 'synthetic_batch', revision),
  );
  assert.equal(
    ask(f, { filters: { ids: [f.a.state_id] } }).data.status,
    'no_matches',
  );
  assert(
    !ask(f, {
      mode: 'neighbors',
      target_id: f.a.screen_id,
      hops: 1,
    }).data.records.some((r) => r.id === f.a.state_id),
  );
});

test('D04 lexical rank precedes stable ties; flow/test summaries preserve exact verification', async (t) => {
  const f = await traceFixture(t);
  const result = f.write([f.action, f.event, f.transition]);
  const transition = result.data.created_ids[2];
  const created = f.write([
    {
      op: 'create_flow',
      name: 'Members',
      transition_ids: [existing(transition)],
      scope: f.scope,
    },
    {
      op: 'record_test_run',
      run: {
        runner: 'synthetic',
        runner_version: 'v1',
        application_version: 'Members',
        scope: f.scope,
        started_at: new Date(fixtureNow - 5000).toISOString(),
        finished_at: new Date(fixtureNow).toISOString(),
        outcome: 'passed',
        assertions: [
          {
            target_id: existing(f.a.state_id),
            assertion: 'Members',
            result: 'passed',
            evidence_ids: [existing(f.a.capture_id)],
          },
        ],
      },
    },
  ]);
  const all = ask(f);
  assert.equal(all.data.status, 'complete');
  const state = all.data.records.find((r) => r.id === f.a.state_id),
    tr = all.data.records.find((r) => r.id === transition);
  assert.equal(state.evidence.provenance, 'test_verified');
  assert.equal(state.evidence.freshness.application_version, 'Members');
  assert.equal(tr.evidence.provenance, 'observed');
  const flow = all.data.records.find(
    (r) => r.id === created.data.created_ids[0],
  );
  assert.deepEqual(flow.transition_ids, [transition]);
  const request = f.request(
    {},
    { screen_ref: { kind: 'new', name: 'Invite member' } },
  );
  request.capture.trace_seq = 5;
  ingest(f.store, request, fixtureNow);
  const exact = f.request({}, { screen_ref: { kind: 'new', name: 'Invite' } });
  exact.capture.trace_seq = 7;
  const c = ingest(f.store, exact, fixtureNow).data;
  const ranked = ask(f, { filters: { kinds: ['screen'], terms: ['Invite'] } })
    .data.records;
  assert.equal(ranked[0].id, c.screen_id);
  assert.equal(ranked.at(-1).name, 'Invite member');
});

test('D04 public MCP and CLI return the same scoped query without mutation', async (t) => {
  const f = await storageFixture(t);
  const { probeStdio } = await import('../scripts/protocol-probe.mjs');
  const { resolve } = await import('node:path');
  const { spawnSync } = await import('node:child_process');
  const { default: process } = await import('node:process');
  await probeStdio(
    resolve('dist/cli.js'),
    f.configPath,
    async (call, base, tools) => {
      assert.equal(
        tools.find((t) => t.name === 'wg_query').annotations.readOnlyHint,
        true,
      );
      const request = f.request();
      request.capture.captured_at = new Date(Date.now() - 1000).toISOString();
      const capture = await call(10, 'tools/call', {
        name: 'wg_ingest',
        arguments: request,
      });
      const input = {
        ...base,
        mode: 'search',
        scope: request.capture.scope,
        filters: { ids: [capture.result.structuredContent.data.state_id] },
      };
      const response = await call(11, 'tools/call', {
        name: 'wg_query',
        arguments: input,
      });
      assert(!response.result.isError);
      assert.equal(response.result.structuredContent.store_revision, 1);
      const cli = spawnSync(
        process.execPath,
        [resolve('dist/cli.js'), 'query', '--config', f.configPath],
        { input: JSON.stringify(input), encoding: 'utf8', timeout: 10000 },
      );
      assert.equal(cli.status, 0);
      const result = JSON.parse(cli.stdout);
      assert.equal(
        result.data.records[0].id,
        response.result.structuredContent.data.records[0].id,
      );
      assert.equal(f.store.revision, 1);
    },
  );
});

test('D04 recent partial captures cannot advance whole-screen recall freshness', async (t) => {
  const f = await storageFixture(t);
  const complete = f.request();
  complete.capture.captured_at = new Date(fixtureNow - 172800000).toISOString();
  const old = ingest(f.store, complete, fixtureNow).data;
  f.scope = complete.capture.scope;
  const partial = f.request();
  partial.capture.captured_at = new Date(fixtureNow - 1000).toISOString();
  partial.capture.coverage = {
    kind: 'partial',
    subtree: 'root',
    reason: 'unsupported',
  };
  ingest(f.store, partial, fixtureNow);
  const screen = ask(f, { filters: { ids: [old.screen_id] } }).data.records[0];
  assert.equal(screen.evidence.freshness.status, 'stale');
  assert.equal(screen.evidence.freshness.age_seconds, 172800);
  assert.equal(
    screen.evidence.freshness.last_checked_at,
    complete.capture.captured_at,
  );
});

test('D04 warning groups remain bounded without discarding affected record identities', async (t) => {
  const f = await traceFixture(t);
  // Valid guarded batches create many independently conflicting supported claims.
  for (const control of f.a.control_ids) {
    const ops = Array.from({ length: 52 }, (_, i) => ({
      op: 'add_annotation',
      annotation: {
        target_id: existing(control),
        kind: 'description',
        value: i % 2 ? 'Members' : 'Settings',
        author_type: 'agent',
        evidence_ids: [existing(f.a.capture_id)],
        scope: f.scope,
        provenance: 'observed',
      },
    }));
    f.write(ops);
  }
  const result = ask(f, {
    filters: { kinds: ['control'], ids: f.a.control_ids },
  });
  assert.equal(result.data.status, 'complete');
  assert.equal(result.warnings.length, 2);
  for (const warning of result.warnings)
    assert.deepEqual(
      [...warning.affected_ids].sort(),
      [...f.a.control_ids].sort(),
    );
});
