import { Buffer } from 'node:buffer';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { commit, ingest, evidence, Store } from '../dist/index.js';
import { initialSchema } from '../dist/store/schema.js';
import { storageFixture, fixtureNow } from './fixtures/storage.mjs';
const existing = (id) => ({ kind: 'existing', id });
const local = (client_ref) => ({ kind: 'local', client_ref });
export function annotationOp(capture, target, scope, overrides = {}) {
  return {
    op: 'add_annotation',
    annotation: {
      target_id: existing(target),
      kind: 'tag',
      value: 'Members',
      author_type: 'agent',
      evidence_ids: [existing(capture)],
      scope,
      provenance: 'observed',
      ...overrides,
    },
  };
}
export function committer(f) {
  let seq = 0;
  return (operations) =>
    commit(
      f.store,
      {
        ...f.base,
        request_id: `commit_${++seq}`,
        expected_store_revision: f.store.revision,
        operations: JSON.parse(JSON.stringify(operations)),
      },
      fixtureNow,
    );
}
test('D01 atomic guarded commits, provenance, conflicts, supersession, refs and replay', async (t) => {
  const f = await storageFixture(t);
  const req = f.request();
  const c = ingest(f.store, req, fixtureNow).data;
  const write = committer(f);
  const op = annotationOp(c.capture_id, c.state_id, req.capture.scope);
  const request = {
    ...f.base,
    request_id: 'replay',
    expected_store_revision: f.store.revision,
    operations: [{ ...op, client_ref: 'tag' }],
  };
  const receipt = commit(f.store, request, fixtureNow);
  const first = receipt.data.created_ids[0];
  assert.deepEqual(commit(f.store, request, fixtureNow), receipt);
  assert.throws(
    () =>
      commit(
        f.store,
        {
          ...request,
          operations: [
            { ...op, annotation: { ...op.annotation, value: 'Settings' } },
          ],
        },
        fixtureNow,
      ),
    { code: 'IDEMPOTENCY_CONFLICT' },
  );
  assert.throws(
    () => commit(f.store, { ...request, request_id: 'stale' }, fixtureNow),
    { code: 'CONFLICT' },
  );
  const before = f.store.revision;
  assert.throws(
    () =>
      write([
        op,
        {
          ...op,
          annotation: { ...op.annotation, target_id: local('missing') },
        },
      ]),
    { code: 'NOT_FOUND' },
  );
  assert.equal(f.store.revision, before);
  const second = write([
    {
      ...op,
      annotation: {
        ...op.annotation,
        value: 'Settings',
        provenance: 'inferred',
        rationale: 'Home',
      },
    },
    {
      op: 'supersede_annotation',
      supersedes_id: existing(first),
      annotation: { ...op.annotation, value: 'Invite' },
    },
  ]).data.created_ids;
  const result = evidence(
    f.store,
    {
      ...f.base,
      ids: [first, ...second],
      projection: 'structured',
      budget: { bytes: 20000, records: 20 },
    },
    fixtureNow,
  );
  assert.equal(result.data.items[0].value, 'Members');
  assert.equal(result.data.items[1].provenance, 'inferred');
  assert.equal(result.data.items[2].supersedes_id, first);
  assert.equal(
    f.store.db
      .prepare("SELECT COUNT(*) n FROM graph_records WHERE kind='annotation'")
      .get().n,
    3,
  );
  const batch = write([
    { ...op, client_ref: 'one' },
    {
      ...op,
      annotation: {
        ...op.annotation,
        provenance: 'inferred',
        rationale: 'Home',
        evidence_ids: [local('one')],
      },
    },
  ]);
  assert.equal(batch.data.created_ids.length, 2);
  assert.throws(
    () =>
      write([
        {
          ...op,
          annotation: {
            ...op.annotation,
            provenance: 'test_verified',
            test_run_id: existing(c.capture_id),
          },
        },
      ]),
    { code: 'NOT_FOUND' },
  );
});
test('D01 aliases are audited, preserve histories and refuse cycles/scope mismatches', async (t) => {
  const f = await storageFixture(t);
  const a = f.request({}, { screen_ref: { kind: 'new', name: 'Members' } });
  const one = ingest(f.store, a, fixtureNow).data;
  const b = f.request({}, { screen_ref: { kind: 'new', name: 'Members' } });
  const two = ingest(f.store, b, fixtureNow).data;
  const write = committer(f);
  const alias = {
    op: 'alias_identity',
    record_kind: 'screen',
    from_id: one.screen_id,
    to_id: two.screen_id,
    rationale: 'Members',
    evidence_ids: [one.capture_id, two.capture_id],
  };
  write([alias]);
  assert.equal(f.store.db.prepare('SELECT count(*) n FROM screens').get().n, 2);
  assert.throws(
    () => write([{ ...alias, from_id: two.screen_id, to_id: one.screen_id }]),
    { code: 'CONFLICT' },
  );
  assert.throws(() => write([alias]), { code: 'CONFLICT' });
  assert.equal(
    f.store.db.prepare('SELECT count(*) n FROM identity_aliases').get().n,
    1,
  );
  assert.throws(() => write([{ ...alias, from_id: one.state_id }]), {
    code: 'NOT_FOUND',
  });
});
test('D01 rejected prose and unrelated or partial evidence leave no records/secret bytes', async (t) => {
  const f = await storageFixture(t);
  const req = f.request();
  const c = ingest(f.store, req, fixtureNow).data;
  const write = committer(f);
  const secret = 'synthetic_d01_private_value_9a';
  const before = f.store.revision;
  assert.throws(
    () =>
      write([
        annotationOp(c.capture_id, c.state_id, req.capture.scope, {
          value: secret,
        }),
      ]),
    { code: 'INVALID_INPUT' },
  );
  const partialRequest = f.request();
  partialRequest.capture.coverage = {
    kind: 'partial',
    subtree: 'root',
    reason: 'unsupported',
  };
  const partial = ingest(f.store, partialRequest, fixtureNow).data;
  assert.throws(
    () =>
      write([annotationOp(partial.capture_id, c.screen_id, req.capture.scope)]),
    { code: 'INCOMPATIBLE_CAPTURE' },
  );
  write([
    annotationOp(partial.capture_id, partial.capture_id, req.capture.scope),
  ]);
  const other = ingest(
    f.store,
    f.request({}, { screen_ref: { kind: 'new', name: 'Home' } }),
    fixtureNow,
  ).data;
  assert.throws(
    () =>
      write([annotationOp(other.capture_id, c.state_id, req.capture.scope)]),
    { code: 'INCOMPATIBLE_CAPTURE' },
  );
  assert.equal(before, 1);
  for (const path of [
    f.store.location.databasePath,
    f.store.location.databasePath + '-wal',
  ])
    assert(!(await readFile(path)).includes(Buffer.from(secret)));
});
test('D01 v1 migration retains captures/receipts and backup under exclusive authority', async (t) => {
  const f = await storageFixture(t);
  const req = f.request();
  const c = ingest(f.store, req, fixtureNow).data;
  const path = f.store.location.databasePath;
  f.store.close();
  const Sqlite = createRequire(import.meta.url)('better-sqlite3');
  const db = new Sqlite(path);
  // Recreate an actual v1 database with retained historical rows using the unchanged v1 SQL.
  const rows = Object.fromEntries(
    [
      'meta',
      'migrations',
      'apps',
      'scopes',
      'records',
      'screens',
      'states',
      'controls',
      'captures',
      'evidence_links',
      'receipts',
    ].map((table) => [table, db.prepare(`SELECT * FROM ${table}`).all()]),
  );
  db.close();
  const { unlink } = await import('node:fs/promises');
  await unlink(path);
  const old = new Sqlite(path);
  old.exec(initialSchema);
  old.pragma('foreign_keys=ON');
  for (const [table, values] of Object.entries(rows))
    for (const row of values) {
      if (table === 'migrations' && row.version === 2) continue;
      old
        .prepare(
          `INSERT INTO ${table} VALUES(${Object.keys(row)
            .map(() => '?')
            .join(',')})`,
        )
        .run(...Object.values(row));
    }
  old.close();
  const { chmod } = await import('node:fs/promises');
  await chmod(path, 0o600);
  const migrated = await Store.open(f.configPath);
  t.after(() => migrated.close());
  assert.equal(migrated.revision, 1);
  assert.equal(migrated.db.pragma('foreign_keys', { simple: true }), 1);
  assert.deepEqual(ingest(migrated, req, fixtureNow).data, c);
  assert.equal(migrated.db.pragma('foreign_key_check').length, 0);
  assert(
    (await readdir(migrated.location.storageDirectory)).some((name) =>
      name.startsWith('pre-migration-v1-'),
    ),
  );
});

test('D01 CLI/MCP commits use the same guarded service and bounded annotation projections', async (t) => {
  const f = await storageFixture(t);
  const { spawnSync } = await import('node:child_process');
  const { resolve } = await import('node:path');
  const { default: process } = await import('node:process');
  const { probeStdio } = await import('../scripts/protocol-probe.mjs');
  await probeStdio(resolve('dist/cli.js'), f.configPath, async (call) => {
    const request = f.request();
    request.capture.captured_at = new Date(Date.now() - 1000).toISOString();
    const capture = await call(10, 'tools/call', {
      name: 'wg_ingest',
      arguments: request,
    });
    const op = annotationOp(
      capture.result.structuredContent.data.capture_id,
      capture.result.structuredContent.data.state_id,
      request.capture.scope,
    );
    const input = {
      ...f.base,
      request_id: 'transport_commit',
      expected_store_revision: 1,
      operations: [op],
    };
    const receipt = await call(11, 'tools/call', {
      name: 'wg_commit',
      arguments: input,
    });
    assert(!receipt.result.isError);
    const cli = spawnSync(
      process.execPath,
      [resolve('dist/cli.js'), 'commit', '--config', f.configPath],
      { input: JSON.stringify(input), encoding: 'utf8', timeout: 10000 },
    );
    assert.equal(cli.status, 0);
    assert.deepEqual(JSON.parse(cli.stdout), receipt.result.structuredContent);
    const ids = receipt.result.structuredContent.data.created_ids;
    const summary = evidence(f.store, { ...f.base, ids }, fixtureNow);
    assert.equal(
      summary.data.items[0].source_summary.freshness.status,
      'unknown',
    );
    const tiny = evidence(
      f.store,
      { ...f.base, ids, budget: { records: 1, bytes: 200 } },
      fixtureNow,
    );
    assert.equal(tiny.data.status, 'incomplete');
  });
});
