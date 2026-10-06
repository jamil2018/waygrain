import { createRequire } from 'node:module';
import { open, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { loadConfiguration } from '../config/index.js';
import { checkPrivateEntry } from '../config/filesystem.js';
import { KnowledgeError } from '../core/normalize.js';
import { initialSchema, STORE_SCHEMA_VERSION } from './schema.js';

export interface Statement {
  get(...params: unknown[]): unknown;
  all(...params: unknown[]): unknown[];
  run(...params: unknown[]): { changes: number };
}
export interface Database {
  exec(sql: string): void;
  pragma(sql: string, options?: { simple: boolean }): unknown;
  prepare(sql: string): Statement;
  backup(path: string): Promise<unknown>;
  close(): void;
}
const require = createRequire(import.meta.url);
const Sqlite = require('better-sqlite3') as new (path: string) => Database;
export const BUSY_TIMEOUT_MS = 250;
function sqliteError(error: unknown): KnowledgeError {
  if (error instanceof KnowledgeError) return error;
  const code =
    error && typeof error === 'object' && 'code' in error
      ? String(error.code)
      : '';
  if (code.startsWith('SQLITE_BUSY') || code.startsWith('SQLITE_LOCKED'))
    return new KnowledgeError('STORE_BUSY');
  if (code.startsWith('SQLITE_CONSTRAINT'))
    return new KnowledgeError('CONFLICT');
  return new KnowledgeError('STORE_CORRUPT');
}
async function privateFile(path: string) {
  try {
    const file = await open(path, 'wx', 0o600);
    await file.close();
  } catch (error) {
    if (!(
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'EEXIST'
    ))
      throw error;
  }
  await checkPrivateEntry(path, false);
}
function connect(path: string): Database {
  const mask = process.umask(0o077);
  try {
    const db = new Sqlite(path);
    try {
      db.pragma(`busy_timeout = ${BUSY_TIMEOUT_MS}`);
      db.pragma('foreign_keys = ON');
      return db;
    } catch (error) {
      db.close();
      throw error;
    }
  } finally {
    process.umask(mask);
  }
}
function integrity(db: Database) {
  if (
    db.pragma('quick_check', { simple: true }) !== 'ok' ||
    (db.pragma('foreign_key_check') instanceof Array &&
      (db.pragma('foreign_key_check') as unknown[]).length)
  )
    throw new KnowledgeError('STORE_CORRUPT');
}
type Location = Awaited<ReturnType<typeof loadConfiguration>>;
export class Store {
  private closed = false;
  private constructor(
    readonly location: Location,
    readonly db: Database,
    private readonly coordination: Database,
  ) {}

  static async open(
    configPath: string,
    mode: 'normal' | 'maintenance' = 'normal',
  ): Promise<Store> {
    const location = await loadConfiguration(configPath);
    let coordination: Database | undefined;
    let db: Database | undefined;
    try {
      await privateFile(location.coordinationPath);
      coordination = connect(location.coordinationPath);
      const coordinationVersion = coordination.pragma('user_version', {
        simple: true,
      });
      if (coordinationVersion !== 0 && coordinationVersion !== 1)
        throw new KnowledgeError('UNSUPPORTED_SCHEMA');
      if (coordinationVersion === 0) {
        coordination.exec('BEGIN EXCLUSIVE');
        try {
          if (coordination.pragma('user_version', { simple: true }) === 0)
            coordination.exec(
              'CREATE TABLE lifetime_lock (singleton INTEGER PRIMARY KEY CHECK(singleton=1)); INSERT INTO lifetime_lock VALUES(1); PRAGMA user_version=1;',
            );
          coordination.exec('COMMIT');
        } catch (error) {
          coordination.exec('ROLLBACK');
          throw error;
        }
      }
      if (coordination.pragma('journal_mode', { simple: true }) !== 'delete')
        throw new KnowledgeError('STORE_CORRUPT');
      integrity(coordination);
      await privateFile(location.databasePath);
      db = connect(location.databasePath);
      let version = db.pragma('user_version', { simple: true });
      if (typeof version !== 'number' || version > STORE_SCHEMA_VERSION)
        throw new KnowledgeError('UNSUPPORTED_SCHEMA');
      if (version !== STORE_SCHEMA_VERSION || mode === 'maintenance') {
        coordination.exec('BEGIN EXCLUSIVE');
        coordination.prepare('SELECT singleton FROM lifetime_lock').get();
        // Recheck after acquiring maintenance authority; another migrator may have finished.
        version = db.pragma('user_version', { simple: true });
        if (version === 0) {
          if (
            db
              .prepare("SELECT name FROM sqlite_master WHERE type='table'")
              .all().length
          )
            throw new KnowledgeError('STORE_CORRUPT');
          if ((await stat(location.databasePath)).size > 0) {
            const backup = join(
              location.storageDirectory,
              'pre-migration-v0.sqlite',
            );
            const file = await open(backup, 'wx', 0o600);
            await file.close();
            await db.backup(backup);
            await checkPrivateEntry(backup, false);
          }
          db.exec('BEGIN IMMEDIATE');
          try {
            db.exec(initialSchema);
            db.prepare('INSERT INTO meta VALUES(1,?,0)').run(
              location.configuration.project_id,
            );
            for (const app of location.configuration.apps)
              db.prepare('INSERT INTO apps VALUES(?)').run(app.app_id);
            db.prepare('INSERT INTO migrations VALUES(1,?)').run(
              new Date().toISOString(),
            );
            integrity(db);
            db.exec('COMMIT');
          } catch (error) {
            db.exec('ROLLBACK');
            throw error;
          }
        } else if (version !== STORE_SCHEMA_VERSION)
          throw new KnowledgeError('UNSUPPORTED_SCHEMA');
        if (mode === 'normal') coordination.exec('ROLLBACK');
      }
      if (mode === 'normal') {
        coordination.exec('BEGIN');
        coordination.prepare('SELECT singleton FROM lifetime_lock').get();
      }
      integrity(db);
      const meta = db
        .prepare('SELECT project_id FROM meta WHERE singleton=1')
        .get() as { project_id?: string } | undefined;
      if (meta?.project_id !== location.configuration.project_id)
        throw new KnowledgeError('UNKNOWN_SCOPE');
      const apps = db.prepare('SELECT id FROM apps').all() as { id: string }[];
      if (
        apps.length !== location.configuration.apps.length ||
        apps.some(
          (a) =>
            !location.configuration.apps.some(
              (config) => config.app_id === a.id,
            ),
        )
      )
        throw new KnowledgeError('UNKNOWN_SCOPE');
      if (db.pragma('journal_mode = WAL', { simple: true }) !== 'wal')
        throw new KnowledgeError('STORE_CORRUPT');
      // Materialize WAL sidecars before checking their restrictive modes.
      db.prepare('SELECT revision FROM meta WHERE singleton=1').get();
      for (const path of [
        location.databasePath,
        location.coordinationPath,
        location.databasePath + '-wal',
        location.databasePath + '-shm',
      ])
        await checkPrivateEntry(path, false);
      return new Store(location, db, coordination);
    } catch (error) {
      db?.close();
      coordination?.close();
      throw sqliteError(error);
    }
  }
  get revision(): number {
    this.assertOpen();
    return (
      this.db.prepare('SELECT revision FROM meta WHERE singleton=1').get() as {
        revision: number;
      }
    ).revision;
  }
  private assertOpen() {
    if (this.closed) throw new KnowledgeError('STORE_CORRUPT');
  }
  requireRevision(expected?: number) {
    if (expected !== undefined && expected !== this.revision)
      throw new KnowledgeError('CONFLICT');
  }
  advanceRevision(): number {
    this.db
      .prepare('UPDATE meta SET revision=revision+1 WHERE singleton=1')
      .run();
    return this.revision;
  }
  transaction<T>(callback: () => T, write = true): T {
    this.assertOpen();
    let begun = false;
    try {
      this.db.exec(write ? 'BEGIN IMMEDIATE' : 'BEGIN');
      begun = true;
      const result = callback();
      if (result instanceof Promise) throw new KnowledgeError('INVALID_INPUT');
      this.db.exec('COMMIT');
      return result;
    } catch (error) {
      if (begun) this.db.exec('ROLLBACK');
      throw sqliteError(error);
    }
  }
  write<T>(expected: number | undefined, callback: (revision: number) => T): T {
    return this.transaction(() => {
      this.requireRevision(expected);
      const revision = this.advanceRevision();
      return callback(revision);
    });
  }
  close() {
    if (this.closed) return;
    this.closed = true;
    try {
      this.db.close();
    } finally {
      this.coordination.close();
    }
  }
}
