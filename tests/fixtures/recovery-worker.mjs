import process from 'node:process';
import { createRequire, syncBuiltinESMExports } from 'node:module';
import { promises as fs } from 'node:fs';
import { Store, ingest, restore, loadConfiguration } from '../../dist/index.js';
import { deletionMigration } from '../../dist/store/schema.js';
import { fixtureCapture } from './ui/index.mjs';
import { randomUUID } from 'node:crypto';
const [mode, configPath, prefix, backupId, sha256] = process.argv.slice(2);
const require = createRequire(import.meta.url);
const Sqlite = require('better-sqlite3');
const pause = () =>
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0);
let store;
try {
  if (mode === 'legacy-peer') {
    const location = await loadConfiguration(configPath);
    const coordination = new Sqlite(location.coordinationPath),
      db = new Sqlite(location.databasePath);
    try {
      coordination.exec('BEGIN');
      coordination.prepare('SELECT singleton FROM lifetime_lock').get();
      db.prepare('SELECT revision FROM meta').get();
      process.send({ type: 'legacy-peer' });
      await new Promise((resolve) => process.once('message', resolve));
    } finally {
      db.close();
      coordination.close();
    }
  } else if (mode === 'migration-kill') {
    const original = Sqlite.prototype.exec;
    Sqlite.prototype.exec = function (sql) {
      const result = original.call(this, sql);
      if (sql === deletionMigration) {
        process.send({ type: 'migration-staged' });
        pause();
      }
      return result;
    };
    store = await Store.open(configPath);
  } else if (mode === 'restore-before' || mode === 'restore-after') {
    process.on('message', () => {}); // Keep the IPC channel alive at the async crash barrier.
    const original = fs.rename;
    fs.rename = async function (from, to) {
      if (from.includes('/restore-') && to.endsWith('/knowledge.sqlite')) {
        if (mode === 'restore-before') {
          process.send({ type: 'restore-before' });
          await new Promise(() => {});
        }
        const result = await original(from, to);
        process.send({ type: 'restore-after' });
        await new Promise(() => {});
        return result;
      }
      return original(from, to);
    };
    syncBuiltinESMExports();
    await restore(configPath, backupId, sha256);
  } else {
    store = await Store.open(configPath);
    const base = {
      schema_version: 1,
      project_id: store.location.configuration.project_id,
      app_id: store.location.configuration.apps[0].app_id,
    };
    if (mode === 'hold-write') {
      store.db.exec('BEGIN IMMEDIATE');
      store.advanceRevision();
      store.db
        .prepare('INSERT INTO scopes VALUES(?,?,?)')
        .run(randomUUID(), base.app_id, '{"synthetic_pending":true}');
      process.send({ type: 'holding' });
      await new Promise((resolve) => process.once('message', resolve));
      store.db.exec('ROLLBACK');
    } else if (mode === 'peer') {
      process.send({ type: 'peer' });
      await new Promise((resolve) => process.once('message', resolve));
    } else if (mode === 'writers') {
      process.send({ type: 'ready' });
      await new Promise((resolve) => process.once('message', resolve));
      let successes = 0,
        busy = 0;
      for (let i = 0; i < 20; i++) {
        try {
          ingest(store, {
            ...base,
            request_id: `${prefix}_${i}`,
            screen_ref: { kind: 'new', name: 'Members', view_key: 'members' },
            capture: fixtureCapture({ seq: Number(prefix) * 1000 + i }),
          });
          successes++;
        } catch (error) {
          if (error.code !== 'STORE_BUSY') throw error;
          busy++;
        }
      }
      process.send({ type: 'done', successes, busy });
    } else throw new Error('UNKNOWN_FIXTURE_MODE');
  }
} catch (error) {
  process.send({ type: 'error', code: error.code ?? 'FIXTURE_FAILURE' });
  process.exitCode = 1;
} finally {
  store?.close();
  process.disconnect();
}
