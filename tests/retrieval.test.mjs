import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { spawnSync } from 'node:child_process';
import process from 'node:process';
import test from 'node:test';
import { resolve } from 'node:path';
import { status, evidence } from '../dist/core/retrieval.js';
import { ingest } from '../dist/core/ingest.js';
import { Store } from '../dist/store/database.js';
import { storageFixture, fixtureNow } from './fixtures/storage.mjs';
import { sensitive } from './fixtures/ui/index.mjs';
import { probeStdio } from '../scripts/protocol-probe.mjs';
import { contractJsonSchemas } from '../dist/contracts/index.js';

const size = (value) => Buffer.byteLength(JSON.stringify(value));
test('B05 status/evidence share contracts, declare only implemented capabilities and preserve freshness/revision', async (t) => {
  const { store, base, request } = await storageFixture(t);
  const one = ingest(store, request(), fixtureNow);
  const partial = request();
  partial.capture.coverage = {
    kind: 'partial',
    subtree: 'members',
    reason: 'subtree_only',
  };
  const two = ingest(store, partial, fixtureNow);
  const snapshot = status(store, base);
  assert.equal(snapshot.store_revision, 2);
  assert.deepEqual(snapshot.data.capabilities, ['ingest', 'evidence']);
  assert.equal(snapshot.data.counts.find((c) => c.kind === 'capture').count, 2);
  assert(snapshot.data.byte_usage.database > 0);
  assert(snapshot.data.byte_usage.wal > 0);
  const ids = [one.data.capture_id, two.data.capture_id];
  const summary = evidence(store, { ...base, ids }, fixtureNow + 86401000);
  assert.equal(summary.data.status, 'available');
  assert.equal(summary.data.items[0].projection, 'summary');
  assert.equal(summary.data.items[0].source_summary.freshness.status, 'stale');
  assert.equal(
    summary.data.items[0].source_summary.freshness.last_checked_at,
    null,
  );
  const structured = evidence(
    store,
    { ...base, ids, projection: 'structured' },
    fixtureNow,
  );
  assert.equal(structured.data.items[1].state_id, null);
  assert.equal(structured.data.items[1].capture.coverage.kind, 'partial');
  for (const marker of Object.values(sensitive))
    assert(!JSON.stringify(structured).includes(marker));
  assert.equal(store.revision, 2);
  const unavailable = evidence(store, { ...base, ids: [...ids, base.app_id] });
  assert.equal(unavailable.data.status, 'unavailable');
  assert.deepEqual(unavailable.data.items, []);
  assert.deepEqual(unavailable.data.missing_ids, [base.app_id]);
  assert.throws(() => status(store, { ...base, project_id: base.app_id }), {
    code: 'UNKNOWN_SCOPE',
  });
});

test('B05 evidence budgets, continuation/filter binding and stale revision cannot hide incompleteness', async (t) => {
  const { store, base, request } = await storageFixture(t);
  const ids = Array.from(
    { length: 3 },
    () => ingest(store, request(), fixtureNow).data.capture_id,
  );
  const input = {
    ...base,
    ids,
    projection: 'structured',
    budget: { records: 1, bytes: 8192 },
  };
  const first = evidence(store, input, fixtureNow);
  assert.equal(first.data.status, 'incomplete');
  assert.equal(first.data.items.length, 1);
  assert(first.next_cursor);
  assert(size(first) <= 8192);
  const second = evidence(
    store,
    { ...input, cursor: first.next_cursor },
    fixtureNow,
  );
  assert.equal(second.data.items[0].id, ids[1]);
  const last = evidence(
    store,
    { ...input, cursor: second.next_cursor },
    fixtureNow,
  );
  assert.equal(last.data.status, 'available');
  assert.equal(last.data.items[0].id, ids[2]);
  assert.throws(
    () =>
      evidence(store, {
        ...input,
        projection: 'summary',
        cursor: first.next_cursor,
      }),
    { code: 'INVALID_INPUT' },
  );
  const tiny = evidence(
    store,
    { ...input, budget: { records: 1, bytes: 256 } },
    fixtureNow,
  );
  assert.equal(tiny.data.status, 'incomplete');
  assert.deepEqual(tiny.data.items, []);
  assert(!tiny.next_cursor);
  assert(size(tiny) <= 256);
  assert.throws(
    () => evidence(store, { ...input, budget: { records: 1, bytes: 1 } }),
    { code: 'BUDGET_EXCEEDED' },
  );
  ingest(store, request(), fixtureNow);
  assert.throws(
    () => evidence(store, { ...input, cursor: first.next_cursor }),
    { code: 'CURSOR_STALE' },
  );
});

test('B05 CLI/core and MCP/core status, ingest, structured evidence and errors agree', async (t) => {
  const { store, configPath, base, request } = await storageFixture(t);
  const firstInput = request();
  firstInput.capture.captured_at = new Date(Date.now() - 1000).toISOString();
  const cli = (command, input, extra = []) =>
    spawnSync(
      process.execPath,
      [resolve('dist/cli.js'), command, '--config', configPath, ...extra],
      {
        input: input === undefined ? undefined : JSON.stringify(input),
        encoding: 'utf8',
        timeout: 10000,
      },
    );
  const statusCli = cli('status', undefined, ['--app', 'fixture']);
  assert.equal(statusCli.status, 0);
  const parsedStatus = JSON.parse(statusCli.stdout);
  assert.equal(parsedStatus.store_revision, 0);
  assert.deepEqual(
    parsedStatus.data.capabilities,
    status(store, base).data.capabilities,
  );
  const oneCli = cli('ingest', firstInput);
  assert.equal(oneCli.status, 0);
  const one = JSON.parse(oneCli.stdout);
  assert.deepEqual(ingest(store, firstInput), one);
  const evidenceInput = {
    ...base,
    ids: [one.data.capture_id],
    projection: 'structured',
  };
  const fetched = cli('evidence', evidenceInput);
  assert.equal(fetched.status, 0);
  assert.deepEqual(JSON.parse(fetched.stdout), evidence(store, evidenceInput));
  const bad = cli('evidence', {
    ...evidenceInput,
    [sensitive.secret]: sensitive.personal,
  });
  assert.equal(bad.status, 1);
  assert.equal(JSON.parse(bad.stderr).error.code, 'INVALID_INPUT');
  for (const marker of Object.values(sensitive))
    assert(!bad.stderr.includes(marker));
  store.close();
  // Fresh independently initialized config is required by the handshake probe.
  const second = await storageFixture(t);
  second.store.close();
  await probeStdio(
    resolve('dist/cli.js'),
    second.configPath,
    async (call, serverBase, tools) => {
      const schemas = contractJsonSchemas();
      for (const tool of tools) {
        assert.deepEqual(tool.inputSchema, schemas[tool.name].input);
        assert.deepEqual(tool.outputSchema, schemas[tool.name].output);
      }
      const raw = second.request();
      raw.capture.captured_at = new Date(Date.now() - 1000).toISOString();
      const captured = await call(10, 'tools/call', {
        name: 'wg_ingest',
        arguments: raw,
      });
      assert(!captured.result.isError);
      const receipt = captured.result.structuredContent;
      const evidenceRequest = {
        ...serverBase,
        ids: [receipt.data.capture_id],
        projection: 'structured',
      };
      const fetched = await call(11, 'tools/call', {
        name: 'wg_evidence',
        arguments: evidenceRequest,
      });
      assert(!fetched.result.isError);
      const live = await Store.open(second.configPath);
      try {
        assert.deepEqual(ingest(live, raw), receipt);
        assert.deepEqual(
          evidence(live, evidenceRequest),
          fetched.result.structuredContent,
        );
        assert.equal(live.revision, 1);
      } finally {
        live.close();
      }
      const unknown = await call(12, 'tools/call', {
        name: 'wg_query',
        arguments: serverBase,
      });
      assert.equal(
        unknown.result.structuredContent.error.code,
        'INVALID_INPUT',
      );
    },
  );
});
