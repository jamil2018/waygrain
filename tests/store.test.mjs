import assert from 'node:assert/strict';
import { mkdtemp, rm, stat, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import test from 'node:test';
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import process from 'node:process';
import { once } from 'node:events';
import { setTimeout, clearTimeout } from 'node:timers';
import { initializeConfiguration } from '../dist/config/index.js';
import { Store, BUSY_TIMEOUT_MS } from '../dist/store/database.js';
import { fixtureSettings } from './fixtures/ui/index.mjs';
const require = createRequire(import.meta.url);
const Sqlite = require('better-sqlite3');
export async function setup(t) {
  const root = await mkdtemp('/private/tmp/waygrain-b03-');
  t.after(() => rm(root, { recursive: true, force: true }));
  const configPath = join(root, 'private/config.json');
  await initializeConfiguration(configPath, fixtureSettings());
  return { configPath, root };
}
test('B03 initial schema, WAL, private files, revisions and failed writes are atomic', async (t) => {
  const { configPath } = await setup(t);
  const store = await Store.open(configPath);
  t.after(() => store.close());
  assert.equal(store.db.pragma('foreign_keys', { simple: true }), 1);
  assert.equal(store.db.pragma('journal_mode', { simple: true }), 'wal');
  assert.equal(store.db.pragma('user_version', { simple: true }), 1);
  assert.equal(store.db.pragma('quick_check', { simple: true }), 'ok');
  assert.equal(store.revision, 0);
  assert.throws(
    () =>
      store.write(0, () => {
        store.db
          .prepare('INSERT INTO scopes VALUES(?,?,?)')
          .run('bad', 'missing-app', '{}');
      }),
    { code: 'CONFLICT' },
  );
  assert.equal(store.revision, 0);
  assert.throws(
    () =>
      store.write(0, () => {
        store.db
          .prepare('INSERT INTO scopes VALUES(?,?,?)')
          .run(
            'rolled-back',
            store.location.configuration.apps[0].app_id,
            '{}',
          );
        throw new Error('failure after insert');
      }),
    { code: 'STORE_CORRUPT' },
  );
  assert.deepEqual(store.db.prepare('SELECT * FROM scopes').all(), []);
  store.write(0, (revision) => assert.equal(revision, 1));
  assert.throws(() => store.write(0, () => {}), { code: 'CONFLICT' });
  assert.equal(store.revision, 1);
  assert.throws(
    () =>
      store.write(1, () => {
        throw new Error('synthetic failure');
      }),
    { code: 'STORE_CORRUPT' },
  );
  assert.equal(store.revision, 1);
  for (const path of [
    store.location.databasePath,
    store.location.coordinationPath,
    store.location.databasePath + '-wal',
    store.location.databasePath + '-shm',
  ])
    assert.equal((await stat(path)).mode & 0o777, 0o600);
  assert.deepEqual(store.db.prepare('SELECT * FROM scopes').all(), []);
});
test('B03 lifetime readers admit peers but refuse exclusive maintenance until all close', async (t) => {
  const { configPath } = await setup(t);
  const one = await Store.open(configPath);
  const two = await Store.open(configPath);
  try {
    const start = Date.now();
    await assert.rejects(Store.open(configPath, 'maintenance'), {
      code: 'STORE_BUSY',
    });
    assert(Date.now() - start < BUSY_TIMEOUT_MS + 1500);
    one.close();
    await assert.rejects(Store.open(configPath, 'maintenance'), {
      code: 'STORE_BUSY',
    });
    two.write(0, () => {});
    assert.equal(two.revision, 1);
  } finally {
    one.close();
    two.close();
  }
  const exclusive = await Store.open(configPath, 'maintenance');
  try {
    await assert.rejects(Store.open(configPath), { code: 'STORE_BUSY' });
  } finally {
    exclusive.close();
  }
  const reopened = await Store.open(configPath);
  assert.equal(reopened.revision, 1);
  reopened.close();
});
test('B03 failed migration and future schema are refused without changing knowledge bytes', async (t) => {
  const { configPath, root } = await setup(t);
  const path = join(root, 'private/storage/knowledge.sqlite');
  await writeFile(path, '', { mode: 0o600 });
  const db = new Sqlite(path);
  db.exec('CREATE TABLE unrelated (id INTEGER);');
  db.close();
  const before = await readFile(path);
  await assert.rejects(Store.open(configPath), { code: 'STORE_CORRUPT' });
  assert.deepEqual(await readFile(path), before);
  const future = new Sqlite(path);
  future.pragma('user_version=99');
  future.close();
  const newer = await readFile(path);
  await assert.rejects(Store.open(configPath), { code: 'UNSUPPORTED_SCHEMA' });
  assert.deepEqual(await readFile(path), newer);
});
test('B03 competing writer busy timeout and read snapshot revision are bounded', async (t) => {
  const { configPath } = await setup(t);
  const one = await Store.open(configPath);
  const two = await Store.open(configPath);
  try {
    one.db.exec('BEGIN IMMEDIATE');
    assert.throws(() => two.write(0, () => {}), { code: 'STORE_BUSY' });
    one.db.exec('ROLLBACK');
    two.write(0, () => {});
    one.transaction(() => assert.equal(one.revision, 1), false);
  } finally {
    one.close();
    two.close();
  }
});

test('B03 coordination lifetime lock is honored by a separate process', async (t) => {
  const { configPath } = await setup(t);
  const child = spawn(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `
    import {Store} from './dist/store/database.js';
    const store = await Store.open(process.argv[1]);
    process.stdout.write('ready');
    process.stdin.resume();
    process.stdin.once('end', () => store.close());
  `,
      configPath,
    ],
    { stdio: ['pipe', 'pipe', 'pipe'] },
  );
  const exit = once(child, 'exit');
  const timer = setTimeout(() => child.kill('SIGKILL'), 10000);
  try {
    const [ready] = await once(child.stdout, 'data');
    assert.equal(String(ready), 'ready');
    await assert.rejects(Store.open(configPath, 'maintenance'), {
      code: 'STORE_BUSY',
    });
    const peer = await Store.open(configPath);
    peer.write(0, () => {});
    peer.close();
    child.stdin.end();
    assert.deepEqual(await exit, [0, null]);
    const maintenance = await Store.open(configPath, 'maintenance');
    assert.equal(maintenance.revision, 1);
    maintenance.close();
  } finally {
    clearTimeout(timer);
    if (child.exitCode === null) child.kill('SIGKILL');
    await exit;
  }
});
