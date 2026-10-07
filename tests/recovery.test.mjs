import test from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { readFile, writeFile, stat } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import {
  backup,
  exportArchive,
  restore,
  Store,
  ingest,
  query,
} from '../dist/index.js';
import { traceFixture, local } from './fixtures/graph.mjs';
import { fixtureNow } from './fixtures/storage.mjs';

test('consistent backup and offline restore preserve graph IDs, revisions, evidence and query results', async (t) => {
  const f = await traceFixture(t);
  const graph = f.write([
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
  const flow = graph.data.client_refs.find((r) => r.client_ref === 'flow').id;
  const q = {
    ...f.base,
    mode: 'flow',
    scope: f.scope,
    flow_id: flow,
    budget: { records: 50, bytes: 100000 },
  };
  const before = query(f.store, q, fixtureNow);
  const cursorQuery = { ...q, budget: { records: 1, bytes: 8192 } };
  const oldCursor = query(f.store, cursorQuery, fixtureNow).next_cursor;
  assert(oldCursor);
  const saved = await backup(f.store);
  const exported = await exportArchive(f.store);
  const exportPath = join(
    f.store.location.storageDirectory,
    `export-${exported.export_id}.json`,
  );
  const archive = JSON.parse(await readFile(exportPath, 'utf8'));
  assert.equal(archive.archival_only, true);
  assert.equal(archive.store_revision, before.store_revision);
  assert.equal(archive.tables.graph_records.length, 4);
  for (const text of ['SYNTHETIC_SECRET', 'Ada Fixture', 'ignore previous'])
    assert(!(await readFile(exportPath, 'utf8')).includes(text));
  const r = f.request();
  r.capture.trace_id = 'other_trace';
  ingest(f.store, r, fixtureNow);
  await assert.rejects(restore(f.configPath, saved.backup_id, saved.sha256), {
    code: 'STORE_BUSY',
  });
  const path = f.store.location.databasePath;
  f.store.close();
  await assert.rejects(restore(f.configPath, saved.backup_id, '0'.repeat(64)), {
    code: 'STORE_CORRUPT',
  });
  await assert.rejects(restore(f.configPath, '../unsafe', saved.sha256), {
    code: 'INVALID_INPUT',
  });
  const result = await restore(f.configPath, saved.backup_id, saved.sha256);
  assert.equal(result.store_revision, before.store_revision);
  assert.equal((await stat(path)).mode & 0o777, 0o600);
  const reopened = await Store.open(f.configPath);
  try {
    assert.deepEqual(query(reopened, q, fixtureNow), before);
    assert.throws(
      () => query(reopened, { ...cursorQuery, cursor: oldCursor }, fixtureNow),
      { code: 'CURSOR_STALE' },
    );
  } finally {
    reopened.close();
  }
});
test('restore rejects corrupt backups and restores a corrupt live image under offline authority', async (t) => {
  const f = await traceFixture(t);
  const b = await backup(f.store);
  const storage = f.store.location.storageDirectory;
  const path = f.store.location.databasePath;
  f.store.close();
  const id = randomUUID();
  await writeFile(join(storage, `backup-${id}.sqlite`), 'invalid', {
    mode: 0o600,
  });
  await assert.rejects(restore(f.configPath, id, b.sha256), {
    code: 'STORE_CORRUPT',
  });
  await writeFile(path, 'corrupt');
  const r = await restore(f.configPath, b.backup_id, b.sha256);
  assert.equal(r.status, 'restored');
  const reopened = await Store.open(f.configPath);
  assert.equal(reopened.revision, 2);
  reopened.close();
});
