import assert from 'node:assert/strict';
import { randomUUID, createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { stat, readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fork } from 'node:child_process';
import { once } from 'node:events';
import { URL } from 'node:url';
import test from 'node:test';
import { STORE_SCHEMA_VERSION } from '../../dist/store/schema.js';
import { Store, ingest, evidence } from '../../dist/index.js';
import {
  writeBundle,
  readBundle,
  bundleHistory,
} from '../../dist/descriptor/store.js';
import { storageFixture, fixtureNow } from '../fixtures/storage.mjs';
import { contractFixture, revision } from './contract-fixture.mjs';
const Sqlite = createRequire(import.meta.url)('better-sqlite3');
const owned = (f) => ({
  ...contractFixture(),
  project_id: f.base.project_id,
  app_id: f.base.app_id,
});
const write = (f, bundle, expected = f.store.revision) =>
  writeBundle(f.store, {
    schema_version: 1,
    expected_revision: expected,
    bundle,
  });
const next = (b) => ({
  ...JSON.parse(JSON.stringify(b)),
  ...revision(),
  supersedes_revision_id: b.revision_id,
});
const downgrade = (path) => {
  const db = new Sqlite(path);
  db.exec(
    'DROP TABLE descriptor_turns;DROP TABLE descriptor_conversations;DROP TABLE descriptor_heads;DROP TABLE descriptor_revisions;DELETE FROM migrations WHERE version>=5;PRAGMA user_version=4;',
  );
  db.close();
};
test('W02 descriptor snapshots persist stable identities/history alongside legacy data and private files', async (t) => {
  const f = await storageFixture(t),
    req = f.request();
  const capture = ingest(f.store, req, fixtureNow).data;
  const b = owned(f);
  write(f, b);
  const updated = next(b),
    doc = updated.documents[0];
  doc.supersedes_revision_id = doc.revision_id;
  doc.revision_id = randomUUID();
  doc.purpose = 'Edited synthetic purpose';
  write(f, updated);
  assert.deepEqual(bundleHistory(f.store, b.app_id), [b, updated]);
  assert.throws(() =>
    f.store.db
      .prepare('UPDATE descriptor_revisions SET bundle_json=?')
      .run('{}'),
  );
  assert.throws(() =>
    f.store.db.prepare('DELETE FROM descriptor_revisions').run(),
  );
  const path = f.store.location.databasePath;
  f.store.close();
  const reopened = await Store.open(f.configPath);
  t.after(() => reopened.close());
  assert.deepEqual(readBundle(reopened, b.app_id), updated);
  assert.equal(bundleHistory(reopened, b.app_id)[0].documents[0].purpose, '');
  const old = evidence(
    reopened,
    { ...f.base, ids: [capture.capture_id], projection: 'structured' },
    fixtureNow,
  );
  assert.equal(old.data.items[0].id, capture.capture_id);
  assert.equal(reopened.db.pragma('quick_check', { simple: true }), 'ok');
  assert.deepEqual(reopened.db.pragma('foreign_key_check'), []);
  assert.equal((await stat(path)).mode & 0o777, 0o600);
});
test('W02 invalid/stale/concurrent writes preserve head, history and store revision atomically', async (t) => {
  const f = await storageFixture(t),
    b = owned(f);
  write(f, b);
  const peer = await Store.open(f.configPath);
  t.after(() => peer.close());
  const updated = next(b);
  write(f, updated, 1);
  assert.throws(
    () =>
      writeBundle(peer, {
        schema_version: 1,
        expected_revision: 1,
        bundle: next(updated),
      }),
    { code: 'CONFLICT' },
  );
  for (const change of [
    (x) => {
      x.sources[0].title = 'Changed without revision';
    },
    (x) => {
      x.project_id = randomUUID();
    },
    (x) => {
      x.claims[0].sources[0].source_id = randomUUID();
    },
    (x) => {
      x.supersedes_revision_id = b.revision_id;
    },
    (x) => {
      x.targets[1].kind = 'page';
      x.targets[1].page_id = null;
    },
  ]) {
    const bad = next(updated);
    change(bad);
    assert.throws(() => write(f, bad));
    assert.equal(f.store.revision, 2);
    assert.deepEqual(readBundle(f.store, b.app_id), updated);
  }
  f.store.db.exec(
    "CREATE TRIGGER fail_descriptor_head BEFORE UPDATE ON descriptor_heads BEGIN SELECT RAISE(ABORT,'synthetic failure'); END;",
  );
  assert.throws(() => write(f, next(updated)), { code: 'CONFLICT' });
  assert.equal(f.store.revision, 2);
  assert.equal(bundleHistory(f.store, b.app_id).length, 2);
  f.store.db.exec('DROP TRIGGER fail_descriptor_head');
  f.store.db.exec('BEGIN IMMEDIATE');
  assert.throws(
    () =>
      writeBundle(peer, {
        schema_version: 1,
        expected_revision: 2,
        bundle: next(updated),
      }),
    { code: 'STORE_BUSY' },
  );
  f.store.db.exec('ROLLBACK');
});
test('W02 v4 upgrade retains old data, rollback/future refusal retain consistent bytes and private backup', async (t) => {
  const f = await storageFixture(t),
    request = f.request();
  const capture = ingest(f.store, request, fixtureNow).data;
  const path = f.store.location.databasePath,
    directory = f.store.location.storageDirectory;
  f.store.close();
  downgrade(path);
  const db = new Sqlite(path);
  db.exec('CREATE TABLE descriptor_heads (synthetic INTEGER)');
  db.close();
  await assert.rejects(Store.open(f.configPath), { code: 'STORE_CORRUPT' });
  const broken = new Sqlite(path);
  assert.equal(broken.pragma('user_version', { simple: true }), 4);
  assert.equal(
    broken
      .prepare(
        "SELECT name FROM sqlite_master WHERE name='descriptor_revisions'",
      )
      .get(),
    undefined,
  );
  assert.equal(
    broken.prepare('SELECT id FROM captures').get().id,
    capture.capture_id,
  );
  broken.exec('DROP TABLE descriptor_heads');
  broken.close();
  const store = await Store.open(f.configPath);
  assert.equal(store.revision, 1);
  assert.equal(
    store.db.pragma('user_version', { simple: true }),
    STORE_SCHEMA_VERSION,
  );
  writeBundle(store, {
    schema_version: 1,
    expected_revision: 1,
    bundle: owned(f),
  });
  store.close();
  const backups = (await readdir(directory)).filter((x) =>
    x.startsWith('pre-migration-v4-'),
  );
  assert(backups.length);
  assert.equal((await stat(join(directory, backups[0]))).mode & 0o777, 0o600);
  const future = new Sqlite(path);
  future.pragma('user_version=999');
  future.close();
  const digest = async () =>
    createHash('sha256')
      .update(await readFile(path))
      .digest('hex');
  const before = await digest();
  await assert.rejects(Store.open(f.configPath), {
    code: 'UNSUPPORTED_SCHEMA',
  });
  assert.equal(await digest(), before);
});
test(
  'W02 killed migration rolls back namespaced tables and preserves legacy capture',
  { timeout: 15000 },
  async (t) => {
    const f = await storageFixture(t),
      capture = ingest(f.store, f.request(), fixtureNow).data;
    const path = f.store.location.databasePath;
    f.store.close();
    downgrade(path);
    const child = fork(
      new URL('./store-worker.mjs', import.meta.url),
      [f.configPath],
      { stdio: ['ignore', 'ignore', 'ignore', 'ipc'] },
    );
    const exit = once(child, 'exit');
    t.after(async () => {
      if (child.exitCode === null && child.signalCode === null)
        child.kill('SIGKILL');
      await exit;
    });
    const [message] = await once(child, 'message');
    assert.equal(message.type, 'staged');
    child.kill('SIGKILL');
    await exit;
    const db = new Sqlite(path);
    assert.equal(db.pragma('user_version', { simple: true }), 4);
    assert.equal(
      db.prepare('SELECT id FROM captures').get().id,
      capture.capture_id,
    );
    assert.equal(
      db
        .prepare(
          "SELECT name FROM sqlite_master WHERE name='descriptor_revisions'",
        )
        .get(),
      undefined,
    );
    db.close();
    const recovered = await Store.open(f.configPath);
    assert.equal(recovered.db.pragma('quick_check', { simple: true }), 'ok');
    recovered.close();
  },
);

test('W02 predecessor validation runs after expected-revision check inside the writer transaction', async (t) => {
  const f = await storageFixture(t),
    original = owned(f);
  write(f, original);
  const peer = await Store.open(f.configPath);
  t.after(() => peer.close());
  const peerBundle = next(original),
    staleBranch = next(original);
  const originalWrite = f.store.write.bind(f.store);
  let interleave = true;
  f.store.write = (expected, callback) => {
    if (interleave) {
      interleave = false;
      writeBundle(peer, {
        schema_version: 1,
        expected_revision: 1,
        bundle: peerBundle,
      });
    }
    return originalWrite(expected, callback);
  };
  // Even a guessed future store revision cannot authorize a stale predecessor.
  assert.throws(() => write(f, staleBranch, 2), { code: 'CONFLICT' });
  assert.equal(f.store.revision, 2);
  assert.deepEqual(readBundle(f.store, original.app_id), peerBundle);
  assert.equal(bundleHistory(f.store, original.app_id).length, 2);
});
