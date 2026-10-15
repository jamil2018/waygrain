import { readFileSync, existsSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { open, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { loadConfiguration } from '../config/index.js';
import { checkPrivateEntry } from '../config/filesystem.js';
import { KnowledgeError } from '../core/normalize.js';
import { initialSchema, graphMigration, visibilityMigration, deletionMigration, STORE_SCHEMA_VERSION, } from './schema.js';
const require = createRequire(import.meta.url);
const Sqlite = require('better-sqlite3');
export const BUSY_TIMEOUT_MS = 250;
function sqliteError(error) {
    if (error instanceof KnowledgeError)
        return error;
    const code = error && typeof error === 'object' && 'code' in error
        ? String(error.code)
        : '';
    if (code.startsWith('SQLITE_BUSY') || code.startsWith('SQLITE_LOCKED'))
        return new KnowledgeError('STORE_BUSY');
    if (code.startsWith('SQLITE_CONSTRAINT'))
        return new KnowledgeError('CONFLICT');
    return new KnowledgeError('STORE_CORRUPT');
}
async function privateFile(path) {
    try {
        const file = await open(path, 'wx', 0o600);
        await file.close();
    }
    catch (error) {
        if (!(error &&
            typeof error === 'object' &&
            'code' in error &&
            error.code === 'EEXIST'))
            throw error;
    }
    await checkPrivateEntry(path, false);
}
function connect(path) {
    const mask = process.umask(0o077);
    try {
        const db = new Sqlite(path);
        try {
            db.pragma(`busy_timeout = ${BUSY_TIMEOUT_MS}`);
            db.pragma('foreign_keys = ON');
            return db;
        }
        catch (error) {
            db.close();
            throw error;
        }
    }
    finally {
        process.umask(mask);
    }
}
function integrity(db) {
    if (db.pragma('quick_check', { simple: true }) !== 'ok' ||
        (db.pragma('foreign_key_check') instanceof Array &&
            db.pragma('foreign_key_check').length))
        throw new KnowledgeError('STORE_CORRUPT');
}
async function openCoordination(location) {
    await privateFile(location.coordinationPath);
    const coordination = connect(location.coordinationPath);
    try {
        const coordinationVersion = coordination.pragma('user_version', {
            simple: true,
        });
        if (coordinationVersion !== 0 && coordinationVersion !== 1)
            throw new KnowledgeError('UNSUPPORTED_SCHEMA');
        if (coordinationVersion === 0) {
            coordination.exec('BEGIN EXCLUSIVE');
            try {
                if (coordination.pragma('user_version', { simple: true }) === 0)
                    coordination.exec('CREATE TABLE lifetime_lock (singleton INTEGER PRIMARY KEY CHECK(singleton=1)); INSERT INTO lifetime_lock VALUES(1); PRAGMA user_version=1;');
                coordination.exec('COMMIT');
            }
            catch (error) {
                coordination.exec('ROLLBACK');
                throw error;
            }
        }
        if (coordination.pragma('journal_mode', { simple: true }) !== 'delete')
            throw new KnowledgeError('STORE_CORRUPT');
        integrity(coordination);
        return coordination;
    }
    catch (error) {
        coordination.close();
        throw error;
    }
}
/** Holds exclusive lifetime authority without opening a possibly corrupt knowledge file. */
export async function offlineMaintenance(configPath, callback) {
    const location = await loadConfiguration(configPath);
    let coordination;
    try {
        coordination = await openCoordination(location);
        coordination.exec('BEGIN EXCLUSIVE');
        coordination.prepare('SELECT singleton FROM lifetime_lock').get();
        return await callback(location);
    }
    catch (error) {
        throw sqliteError(error);
    }
    finally {
        coordination?.close();
    }
}
export class Store {
    location;
    db;
    coordination;
    cursorEpoch;
    maintenance;
    closed = false;
    constructor(location, db, coordination, cursorEpoch, maintenance) {
        this.location = location;
        this.db = db;
        this.coordination = coordination;
        this.cursorEpoch = cursorEpoch;
        this.maintenance = maintenance;
    }
    static async open(configPath, mode = 'normal') {
        const location = await loadConfiguration(configPath);
        let coordination;
        let db;
        try {
            coordination = await openCoordination(location);
            coordination.exec(mode === 'maintenance' ? 'BEGIN EXCLUSIVE' : 'BEGIN');
            coordination.prepare('SELECT singleton FROM lifetime_lock').get();
            await privateFile(location.databasePath);
            db = connect(location.databasePath);
            let version = db.pragma('user_version', { simple: true });
            if (typeof version !== 'number' || version > STORE_SCHEMA_VERSION)
                throw new KnowledgeError('UNSUPPORTED_SCHEMA');
            if (version !== STORE_SCHEMA_VERSION || mode === 'maintenance') {
                if (mode === 'normal') {
                    db.close();
                    coordination.exec('ROLLBACK');
                    coordination.exec('BEGIN EXCLUSIVE');
                    coordination.prepare('SELECT singleton FROM lifetime_lock').get();
                    db = connect(location.databasePath);
                }
                // Recheck after acquiring maintenance authority; another migrator may have finished.
                version = db.pragma('user_version', { simple: true });
                if (version === 0) {
                    if (db
                        .prepare("SELECT name FROM sqlite_master WHERE type='table'")
                        .all().length)
                        throw new KnowledgeError('STORE_CORRUPT');
                    if ((await stat(location.databasePath)).size > 0) {
                        const backup = join(location.storageDirectory, 'pre-migration-v0.sqlite');
                        const file = await open(backup, 'wx', 0o600);
                        await file.close();
                        await db.backup(backup);
                        await checkPrivateEntry(backup, false);
                    }
                    db.exec('BEGIN IMMEDIATE');
                    try {
                        db.exec(initialSchema);
                        db.prepare('INSERT INTO meta VALUES(1,?,0)').run(location.configuration.project_id);
                        for (const app of location.configuration.apps)
                            db.prepare('INSERT INTO apps VALUES(?)').run(app.app_id);
                        db.prepare('INSERT INTO migrations VALUES(1,?)').run(new Date().toISOString());
                        integrity(db);
                        db.exec('COMMIT');
                    }
                    catch (error) {
                        db.exec('ROLLBACK');
                        throw error;
                    }
                }
                if (db.pragma('user_version', { simple: true }) === 1) {
                    if (version === 1) {
                        const backup = join(location.storageDirectory, 'pre-migration-v1-' + Date.now() + '.sqlite');
                        const file = await open(backup, 'wx', 0o600);
                        await file.close();
                        await db.backup(backup);
                        await checkPrivateEntry(backup, false);
                    }
                    db.pragma('foreign_keys = OFF');
                    db.exec('BEGIN IMMEDIATE');
                    try {
                        db.exec(graphMigration);
                        db.prepare('INSERT INTO migrations VALUES(2,?)').run(new Date().toISOString());
                        integrity(db);
                        db.exec('COMMIT');
                    }
                    catch (error) {
                        db.exec('ROLLBACK');
                        throw error;
                    }
                    finally {
                        db.pragma('foreign_keys = ON');
                    }
                }
                if (db.pragma('user_version', { simple: true }) === 2) {
                    if (version === 2) {
                        const backup = join(location.storageDirectory, 'pre-migration-v2-' + Date.now() + '.sqlite');
                        const file = await open(backup, 'wx', 0o600);
                        await file.close();
                        await db.backup(backup);
                        await checkPrivateEntry(backup, false);
                    }
                    db.exec('BEGIN IMMEDIATE');
                    try {
                        db.exec(visibilityMigration);
                        db.prepare('INSERT INTO migrations VALUES(3,?)').run(new Date().toISOString());
                        integrity(db);
                        db.exec('COMMIT');
                    }
                    catch (error) {
                        db.exec('ROLLBACK');
                        throw error;
                    }
                }
                if (db.pragma('user_version', { simple: true }) === 3) {
                    if (version === 3) {
                        const backup = join(location.storageDirectory, 'pre-migration-v3-' + Date.now() + '.sqlite');
                        const file = await open(backup, 'wx', 0o600);
                        await file.close();
                        await db.backup(backup);
                        await checkPrivateEntry(backup, false);
                    }
                    db.exec('BEGIN IMMEDIATE');
                    try {
                        db.exec(deletionMigration);
                        db.prepare('INSERT INTO migrations VALUES(4,?)').run(new Date().toISOString());
                        integrity(db);
                        db.exec('COMMIT');
                    }
                    catch (error) {
                        db.exec('ROLLBACK');
                        throw error;
                    }
                }
                if (db.pragma('user_version', { simple: true }) !== STORE_SCHEMA_VERSION)
                    throw new KnowledgeError('UNSUPPORTED_SCHEMA');
                if (mode === 'normal') {
                    db.close();
                    coordination.exec('ROLLBACK');
                    coordination.exec('BEGIN');
                    coordination.prepare('SELECT singleton FROM lifetime_lock').get();
                    db = connect(location.databasePath);
                }
            }
            if (db.pragma('user_version', { simple: true }) !== STORE_SCHEMA_VERSION)
                throw new KnowledgeError('UNSUPPORTED_SCHEMA');
            integrity(db);
            const meta = db
                .prepare('SELECT project_id FROM meta WHERE singleton=1')
                .get();
            if (meta?.project_id !== location.configuration.project_id)
                throw new KnowledgeError('UNKNOWN_SCOPE');
            const apps = db.prepare('SELECT id FROM apps').all();
            if (apps.length !== location.configuration.apps.length ||
                apps.some((a) => !location.configuration.apps.some((config) => config.app_id === a.id)))
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
            const epochPath = join(location.storageDirectory, 'cursor-epoch');
            const cursorEpoch = existsSync(epochPath)
                ? readFileSync(epochPath, 'utf8')
                : '';
            if (cursorEpoch && !/^[a-f0-9-]{36}$/.test(cursorEpoch))
                throw new KnowledgeError('STORE_CORRUPT');
            return new Store(location, db, coordination, cursorEpoch, mode === 'maintenance');
        }
        catch (error) {
            db?.close();
            coordination?.close();
            throw sqliteError(error);
        }
    }
    get revision() {
        this.assertOpen();
        return this.db.prepare('SELECT revision FROM meta WHERE singleton=1').get().revision;
    }
    assertOpen() {
        if (this.closed)
            throw new KnowledgeError('STORE_CORRUPT');
    }
    requireRevision(expected) {
        if (expected !== undefined && expected !== this.revision)
            throw new KnowledgeError('CONFLICT');
    }
    advanceRevision() {
        this.db
            .prepare('UPDATE meta SET revision=revision+1 WHERE singleton=1')
            .run();
        return this.revision;
    }
    transaction(callback, write = true) {
        this.assertOpen();
        let begun = false;
        try {
            this.db.exec(write ? 'BEGIN IMMEDIATE' : 'BEGIN');
            begun = true;
            const result = callback();
            if (result instanceof Promise)
                throw new KnowledgeError('INVALID_INPUT');
            this.db.exec('COMMIT');
            return result;
        }
        catch (error) {
            if (begun)
                this.db.exec('ROLLBACK');
            throw sqliteError(error);
        }
    }
    write(expected, callback) {
        return this.transaction(() => {
            this.requireRevision(expected);
            const revision = this.advanceRevision();
            return callback(revision);
        });
    }
    requireStorageCapacity() {
        const size = (path) => {
            try {
                return statSync(path).size;
            }
            catch (error) {
                if (error &&
                    typeof error === 'object' &&
                    'code' in error &&
                    error.code === 'ENOENT')
                    return 0;
                throw error;
            }
        };
        const pages = this.db.pragma('page_count', { simple: true });
        const pageSize = this.db.pragma('page_size', { simple: true });
        const actual = size(this.location.databasePath) +
            size(this.location.databasePath + '-wal');
        // Reserve an upper bound for a transaction that dirties every database page.
        const projected = Math.max(size(this.location.databasePath), pages * pageSize) +
            size(this.location.databasePath + '-wal') +
            32 +
            pages * (pageSize + 24);
        if (Math.max(actual, projected) >
            this.location.configuration.storage_limit_bytes)
            throw new KnowledgeError('STORAGE_LIMIT');
    }
    close() {
        if (this.closed)
            return;
        this.closed = true;
        try {
            this.db.close();
        }
        finally {
            this.coordination.close();
        }
    }
}
