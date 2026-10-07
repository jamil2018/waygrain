import test from 'node:test';
import assert from 'node:assert/strict';
import { fork } from 'node:child_process';
import { once } from 'node:events';
import process from 'node:process';
import { URL } from 'node:url';
import { readFile, readdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { Store, ingest, backup, restore, query } from '../dist/index.js';
import { storageFixture, fixtureNow } from './fixtures/storage.mjs';
import { traceFixture, local } from './fixtures/graph.mjs';
const require = createRequire(import.meta.url),
  Sqlite = require('better-sqlite3');
function worker(t, mode, path, ...args) {
  const child = fork(
    new URL('./fixtures/recovery-worker.mjs', import.meta.url),
    [mode, path, ...args],
    {
      execPath: process.execPath,
      stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
    },
  );
  const exit = once(child, 'exit');
  t.after(async () => {
    if (child.exitCode === null && child.signalCode === null)
      child.kill('SIGKILL');
    await exit;
  });
  return { child, exit };
}
async function message(child, type) {
  const [m] = await once(child, 'message');
  assert.equal(m.type, type, JSON.stringify(m));
  return m;
}
function legacy(path, conflict = false) {
  const db = new Sqlite(path);
  db.exec(
    'DROP TABLE deletion_batches;DELETE FROM migrations WHERE version=4;PRAGMA user_version=3;',
  );
  if (conflict) db.exec('CREATE TABLE deletion_batches (synthetic INTEGER)');
  db.close();
}
test(
  'E05 concurrent process writers serialize effects; busy refusal is bounded and killed writes roll back',
  { timeout: 20000 },
  async (t) => {
    const f = await storageFixture(t);
    ingest(f.store, f.request(), fixtureNow);
    const count = f.store.db.prepare('SELECT COUNT(*) n FROM scopes').get().n;
    const hold = worker(t, 'hold-write', f.configPath);
    await message(hold.child, 'holding');
    const start = Date.now();
    assert.throws(() => ingest(f.store, f.request(), fixtureNow), {
      code: 'STORE_BUSY',
    });
    assert(Date.now() - start < 1800);
    hold.child.kill('SIGKILL');
    assert.deepEqual(await hold.exit, [null, 'SIGKILL']);
    assert.equal(f.store.revision, 1);
    assert.equal(
      f.store.db.prepare('SELECT COUNT(*) n FROM scopes').get().n,
      count,
    );
    assert.deepEqual(f.store.db.pragma('foreign_key_check'), []);
    const a = worker(t, 'writers', f.configPath, '1'),
      b = worker(t, 'writers', f.configPath, '2');
    await Promise.all([message(a.child, 'ready'), message(b.child, 'ready')]);
    const results = [message(a.child, 'done'), message(b.child, 'done')];
    a.child.send('go');
    b.child.send('go');
    const done = await Promise.all(results);
    await Promise.all([a.exit, b.exit]);
    const successes = done.reduce((n, r) => n + r.successes, 0);
    assert(successes > 0);
    assert.equal(successes + done.reduce((n, r) => n + r.busy, 0), 40);
    assert.equal(f.store.revision, 1 + successes);
    assert.equal(
      f.store.db.prepare('SELECT COUNT(*) n FROM captures').get().n,
      1 + successes,
    );
    assert.equal(f.store.db.pragma('quick_check', { simple: true }), 'ok');
  },
);
test(
  'E05 killed real migration and failed migration preserve legacy rows and verified pre-migration backup',
  { timeout: 20000 },
  async (t) => {
    const f = await storageFixture(t);
    const request = f.request();
    const data = ingest(f.store, request, fixtureNow).data;
    const path = f.store.location.databasePath,
      storage = f.store.location.storageDirectory;
    f.store.close();
    legacy(path);
    const peer = worker(t, 'legacy-peer', f.configPath);
    await message(peer.child, 'legacy-peer');
    await assert.rejects(Store.open(f.configPath), { code: 'STORE_BUSY' });
    peer.child.send('close');
    await peer.exit;
    const migration = worker(t, 'migration-kill', f.configPath);
    await message(migration.child, 'migration-staged');
    migration.child.kill('SIGKILL');
    assert.deepEqual(await migration.exit, [null, 'SIGKILL']);
    let db = new Sqlite(path);
    assert.equal(db.pragma('user_version', { simple: true }), 3);
    assert.equal(db.prepare('SELECT revision FROM meta').get().revision, 1);
    assert.equal(
      db.prepare('SELECT id FROM captures').get().id,
      data.capture_id,
    );
    assert.equal(db.pragma('quick_check', { simple: true }), 'ok');
    assert.deepEqual(db.pragma('foreign_key_check'), []);
    assert.equal(
      db
        .prepare("SELECT name FROM sqlite_master WHERE name='deletion_batches'")
        .get(),
      undefined,
    );
    db.close();
    const files = (await readdir(storage)).filter((n) =>
      n.startsWith('pre-migration-v3-'),
    );
    assert(files.length);
    db = new Sqlite(join(storage, files[0]));
    assert.equal(db.pragma('user_version', { simple: true }), 3);
    assert.equal(
      db.prepare('SELECT id FROM captures').get().id,
      data.capture_id,
    );
    db.close();
    const success = await Store.open(f.configPath);
    assert.equal(success.db.pragma('user_version', { simple: true }), 4);
    assert.equal(success.revision, 1);
    success.close();
    legacy(path, true);
    await assert.rejects(Store.open(f.configPath), { code: 'STORE_CORRUPT' });
    db = new Sqlite(path);
    assert.equal(db.pragma('user_version', { simple: true }), 3);
    assert.equal(db.prepare('SELECT revision FROM meta').get().revision, 1);
    assert.equal(
      db.prepare('SELECT id FROM captures').get().id,
      data.capture_id,
    );
    db.exec('DROP TABLE deletion_batches');
    db.close();
    const recovered = await Store.open(f.configPath);
    assert.equal(recovered.revision, 1);
    recovered.close();
    db = new Sqlite(path);
    db.pragma('user_version=99');
    db.close();
    const future = await readFile(path);
    await assert.rejects(Store.open(f.configPath), {
      code: 'UNSUPPORTED_SCHEMA',
    });
    assert.deepEqual(await readFile(path), future);
  },
);
test(
  'E05 peers refuse migration/restore; actual restore kills leave the old or verified new query image',
  { timeout: 30000 },
  async (t) => {
    const f = await traceFixture(t);
    f.write([
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
    const q = {
      ...f.base,
      scope: f.scope,
      mode: 'search',
      filters: { kinds: ['capture'] },
      budget: { records: 50, bytes: 100000 },
    };
    const saved = await backup(f.store),
      oldQuery = query(f.store, q, fixtureNow);
    const r = f.request();
    r.capture.trace_id = 'later_trace';
    ingest(f.store, r, fixtureNow);
    const newQuery = query(f.store, q, fixtureNow);
    f.store.close();
    const peer = worker(t, 'peer', f.configPath);
    await message(peer.child, 'peer');
    await assert.rejects(restore(f.configPath, saved.backup_id, saved.sha256), {
      code: 'STORE_BUSY',
    });
    await assert.rejects(Store.open(f.configPath, 'maintenance'), {
      code: 'STORE_BUSY',
    });
    peer.child.send('close');
    await peer.exit;
    for (const mode of ['restore-before', 'restore-after']) {
      const restoring = worker(
        t,
        mode,
        f.configPath,
        'unused',
        saved.backup_id,
        saved.sha256,
      );
      await message(restoring.child, mode);
      await assert.rejects(Store.open(f.configPath), { code: 'STORE_BUSY' });
      restoring.child.kill('SIGKILL');
      assert.deepEqual(await restoring.exit, [null, 'SIGKILL']);
      const reopened = await Store.open(f.configPath);
      try {
        assert.deepEqual(
          query(reopened, q, fixtureNow),
          mode === 'restore-before' ? newQuery : oldQuery,
        );
        assert.deepEqual(reopened.db.pragma('foreign_key_check'), []);
      } finally {
        reopened.close();
      }
    }
  },
);
