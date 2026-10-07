import { randomUUID, createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { open, rename, unlink, stat } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { z } from 'zod';
import {
  Store,
  offlineMaintenance,
  BUSY_TIMEOUT_MS,
  type Database,
} from './database.js';
import {
  initialSchema,
  graphMigration,
  visibilityMigration,
  deletionMigration,
  STORE_SCHEMA_VERSION,
} from './schema.js';
import { checkPrivateEntry } from '../config/filesystem.js';
import { KnowledgeError, canonical } from '../core/normalize.js';
import type { Configuration } from '../config/schema.js';
const require = createRequire(import.meta.url);
const Sqlite = require('better-sqlite3') as new (
  path: string,
  options?: { readonly: boolean; fileMustExist: boolean },
) => Database;
const archiveId = z.uuid();
const schemaRows = (db: Database) =>
  db
    .prepare(
      "SELECT type,name,tbl_name,sql FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' ORDER BY type,name",
    )
    .all();
function verify(db: Database, configuration: Configuration) {
  if (db.pragma('user_version', { simple: true }) !== STORE_SCHEMA_VERSION)
    throw new KnowledgeError('UNSUPPORTED_SCHEMA');
  if (
    db.pragma('quick_check', { simple: true }) !== 'ok' ||
    (db.pragma('foreign_key_check') as unknown[]).length
  )
    throw new KnowledgeError('STORE_CORRUPT');
  const meta = db
    .prepare('SELECT project_id,revision FROM meta WHERE singleton=1')
    .get() as { project_id: string; revision: number } | undefined;
  const apps = db.prepare('SELECT id FROM apps ORDER BY id').all() as {
    id: string;
  }[];
  if (
    meta?.project_id !== configuration.project_id ||
    canonical(apps.map((a) => a.id)) !==
      canonical(configuration.apps.map((a) => a.app_id).sort())
  )
    throw new KnowledgeError('UNKNOWN_SCOPE');
  const expected = new Sqlite(':memory:');
  try {
    expected.exec(
      initialSchema + graphMigration + visibilityMigration + deletionMigration,
    );
    if (canonical(schemaRows(db)) !== canonical(schemaRows(expected)))
      throw new KnowledgeError('STORE_CORRUPT');
  } finally {
    expected.close();
  }
  return meta;
}
function connectArchive(path: string, readonly = true) {
  const mask = process.umask(0o077);
  try {
    const db = new Sqlite(path, { readonly, fileMustExist: true });
    db.pragma(`busy_timeout = ${BUSY_TIMEOUT_MS}`);
    return db;
  } finally {
    process.umask(mask);
  }
}
async function reserve(path: string) {
  const file = await open(path, 'wx', 0o600);
  await file.close();
}
async function syncFile(path: string) {
  const file = await open(path, 'r');
  try {
    await file.sync();
  } finally {
    await file.close();
  }
}
async function checksum(path: string) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest('hex');
}
async function removeArchive(path: string) {
  for (const suffix of ['', '-wal', '-shm'])
    await unlink(path + suffix).catch(() => undefined);
}
export async function backup(store: Store) {
  const id = randomUUID(),
    path = join(store.location.storageDirectory, `backup-${id}.sqlite`);
  await reserve(path);
  try {
    await store.db.backup(path);
    await checkPrivateEntry(path, false);
    const db = connectArchive(path, false);
    let meta;
    try {
      meta = verify(db, store.location.configuration);
      db.pragma('journal_mode = DELETE');
    } finally {
      db.close();
    }
    await syncFile(path);
    return {
      status: 'backed_up' as const,
      backup_id: id,
      store_revision: meta.revision,
      sha256: await checksum(path),
    };
  } catch (error) {
    await removeArchive(path);
    throw error;
  }
}
/** JSON export is archival, including redacted history and tombstones. No import API. */
export async function exportArchive(store: Store) {
  const id = randomUUID(),
    path = join(store.location.storageDirectory, `export-${id}.json`);
  const archive = store.transaction(() => {
    const tables = [
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
      'graph_records',
      'relations',
      'identity_aliases',
      'tombstones',
      'deletion_batches',
    ];
    return {
      export_version: 1,
      store_schema_version: STORE_SCHEMA_VERSION,
      project_id: store.location.configuration.project_id,
      store_revision: store.revision,
      archival_only: true,
      tables: Object.fromEntries(
        tables.map((table) => [
          table,
          store.db.prepare(`SELECT * FROM ${table} ORDER BY rowid`).all(),
        ]),
      ),
    };
  }, false);
  const file = await open(path, 'wx', 0o600);
  try {
    await file.writeFile(JSON.stringify(archive) + '\n');
    await file.sync();
  } catch (error) {
    await file.close();
    await unlink(path);
    throw error;
  }
  await file.close();
  return {
    status: 'exported' as const,
    export_id: id,
    store_revision: archive.store_revision,
    archival_only: true,
    sha256: await checksum(path),
  };
}
export async function restore(
  configPath: string,
  id: unknown,
  sha256: unknown,
) {
  const parsed = archiveId.safeParse(id);
  if (
    !parsed.success ||
    typeof sha256 !== 'string' ||
    !/^[a-f0-9]{64}$/.test(sha256)
  )
    throw new KnowledgeError('INVALID_INPUT');
  return offlineMaintenance(configPath, async (location) => {
    const path = join(
      location.storageDirectory,
      `backup-${parsed.data}.sqlite`,
    );
    await checkPrivateEntry(path, false);
    const expectedHash = await checksum(path);
    if (expectedHash !== sha256) throw new KnowledgeError('STORE_CORRUPT');
    // The supplied hash authenticates a standalone image, never unverified WAL overlays.
    for (const suffix of ['-wal', '-shm']) {
      try {
        await stat(path + suffix);
        throw new KnowledgeError('STORE_CORRUPT');
      } catch (error) {
        if (
          !error ||
          typeof error !== 'object' ||
          !('code' in error) ||
          error.code !== 'ENOENT'
        )
          throw error;
      }
    }
    const source = connectArchive(path);
    const staging = join(
      location.storageDirectory,
      `restore-${randomUUID()}.sqlite`,
    );
    let meta;
    try {
      meta = verify(source, location.configuration);
      await reserve(staging);
      await source.backup(staging);
    } catch (error) {
      await removeArchive(staging);
      throw error;
    } finally {
      source.close();
    }
    try {
      await checkPrivateEntry(staging, false);
      const verified = connectArchive(staging);
      try {
        verify(verified, location.configuration);
      } finally {
        verified.close();
      }
      await syncFile(staging);
      // Preserve the prior offline image and sidecars, even when corrupt. This is forensic,
      // not an attested consistent backup; only backup() has that guarantee.
      const recoveryId = randomUUID();
      for (const suffix of ['', '-wal', '-shm']) {
        const old = location.databasePath + suffix;
        try {
          await stat(old);
        } catch (error) {
          if (
            error &&
            typeof error === 'object' &&
            'code' in error &&
            error.code === 'ENOENT'
          )
            continue;
          throw error;
        }
        await checkPrivateEntry(old, false);
        // Retain the old file without removing it before the atomic main-file replacement.
        const file = await open(
          join(
            location.storageDirectory,
            `pre-restore-${recoveryId}.sqlite${suffix}`,
          ),
          'wx',
          0o600,
        );
        try {
          for await (const chunk of createReadStream(old))
            await file.writeFile(chunk);
          await file.sync();
        } finally {
          await file.close();
        }
      }
      // Checkpoint a valid current WAL before removing its sidecars, so a crash
      // before the atomic replacement still leaves all previously committed rows.
      let current: Database | undefined;
      try {
        current = connectArchive(location.databasePath, false);
        if (current.pragma('quick_check', { simple: true }) === 'ok') {
          const results = current.pragma('wal_checkpoint(TRUNCATE)') as {
            busy: number;
          }[];
          if (results.some((r) => r.busy !== 0))
            throw new KnowledgeError('STORE_BUSY');
        }
      } catch (error) {
        const code =
          error && typeof error === 'object' && 'code' in error
            ? String(error.code)
            : '';
        if (!['SQLITE_CORRUPT', 'SQLITE_NOTADB'].includes(code)) throw error;
      } finally {
        current?.close();
      }
      const epochPath = join(location.storageDirectory, 'cursor-epoch');
      const epochStaging = join(
        location.storageDirectory,
        `cursor-epoch-${randomUUID()}`,
      );
      const epoch = await open(epochStaging, 'wx', 0o600);
      try {
        await epoch.writeFile(randomUUID());
        await epoch.sync();
      } finally {
        await epoch.close();
      }
      await rename(epochStaging, epochPath);
      const epochDirectory = await open(location.storageDirectory, 'r');
      try {
        await epochDirectory.sync();
      } finally {
        await epochDirectory.close();
      }
      for (const suffix of ['-wal', '-shm'])
        await unlink(location.databasePath + suffix).catch((error) => {
          if (
            !error ||
            typeof error !== 'object' ||
            !('code' in error) ||
            error.code !== 'ENOENT'
          )
            throw error;
        });
      await rename(staging, location.databasePath);
      const directory = await open(location.storageDirectory, 'r');
      try {
        await directory.sync();
      } finally {
        await directory.close();
      }
      return {
        status: 'restored' as const,
        backup_id: parsed.data,
        store_revision: meta.revision,
        retained_previous_id: recoveryId,
      };
    } finally {
      await removeArchive(staging);
    }
  });
}
