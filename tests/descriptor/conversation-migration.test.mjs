import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { Store, ingest } from '../../dist/index.js';
import { descriptorFixture } from '../../dist/descriptor/fixture.js';
import { writeBundle, readBundle } from '../../dist/descriptor/store.js';
import { storageFixture, fixtureNow } from '../fixtures/storage.mjs';
const Sqlite = createRequire(import.meta.url)('better-sqlite3');
function downgrade(path) {
  const db = new Sqlite(path);
  db.exec(
    'DROP TABLE descriptor_turns;DROP TABLE descriptor_conversations;DELETE FROM migrations WHERE version=6;PRAGMA user_version=5;',
  );
  db.close();
}
test('W17 v5 migration keeps exact descriptor/legacy history and private prechange backup; failed partial DDL rolls back', async (t) => {
  const f = await storageFixture(t),
    capture = ingest(f.store, f.request(), fixtureNow).data,
    bundle = await descriptorFixture(f.base.project_id, f.base.app_id);
  writeBundle(f.store, { schema_version: 1, expected_revision: 1, bundle });
  const path = f.store.location.databasePath,
    directory = f.store.location.storageDirectory;
  f.store.close();
  downgrade(path);
  const before = new Sqlite(path);
  before.exec('CREATE TABLE descriptor_turns(synthetic INTEGER)');
  before.close();
  await assert.rejects(Store.open(f.configPath), { code: 'STORE_CORRUPT' });
  const failed = new Sqlite(path);
  assert.equal(failed.pragma('user_version', { simple: true }), 5);
  assert.equal(
    failed
      .prepare(
        "SELECT name FROM sqlite_master WHERE name='descriptor_conversations'",
      )
      .get(),
    undefined,
  );
  assert.equal(
    failed.prepare('SELECT id FROM captures').get().id,
    capture.capture_id,
  );
  failed.exec('DROP TABLE descriptor_turns');
  failed.close();
  const reopened = await Store.open(f.configPath);
  t.after(() => reopened.close());
  assert.equal(reopened.revision, 2);
  assert.deepEqual(readBundle(reopened, bundle.app_id), bundle);
  assert.equal(reopened.db.pragma('user_version', { simple: true }), 6);
  assert.deepEqual(reopened.db.pragma('foreign_key_check'), []);
  const backups = (await readdir(directory)).filter((n) =>
    n.startsWith('pre-migration-v5-'),
  );
  assert(backups.length);
  for (const name of backups) {
    assert.equal((await stat(join(directory, name))).mode & 0o777, 0o600);
    const old = new Sqlite(join(directory, name));
    assert.equal(old.pragma('user_version', { simple: true }), 5);
    assert.equal(
      old.prepare('SELECT id FROM captures').get().id,
      capture.capture_id,
    );
    old.close();
  }
});
