import { execFile } from 'node:child_process';
import { mkdtemp, open, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { StdioServerTransport } from '@modelcontextprotocol/server/stdio';
import { loadConfiguration } from '../config/index.js';
import { Store } from '../store/database.js';
import { BrowserSession } from '../browser/session.js';
import { knowledgeServer } from '../mcp/index.js';
const execute = promisify(execFile);
const require = createRequire(import.meta.url);
export class RuntimeError extends Error {
    code;
    constructor(code) {
        super(code);
        this.code = code;
    }
}
export async function smokeSqlite(storageDirectory) {
    const directory = await mkdtemp(join(storageDirectory, 'feasibility-'));
    let database;
    try {
        const path = join(directory, 'probe.sqlite');
        const file = await open(path, 'wx', 0o600);
        await file.close();
        const Database = require('better-sqlite3');
        database = new Database(path);
        const mode = database.pragma('journal_mode = WAL');
        if (mode[0]?.journal_mode !== 'wal')
            throw new Error();
        const integrity = database.pragma('quick_check');
        if (integrity[0]?.quick_check !== 'ok')
            throw new Error();
        const result = database.prepare('SELECT 1 AS ok').get();
        if (result.ok !== 1)
            throw new Error();
    }
    catch {
        throw new RuntimeError('SQLITE_UNAVAILABLE');
    }
    finally {
        try {
            database?.close();
        }
        finally {
            await rm(directory, { recursive: true, force: true });
        }
    }
}
export async function installBrowser() {
    try {
        await execute(process.execPath, [
            join(dirname(require.resolve('playwright/package.json')), 'cli.js'),
            'install',
            'chromium',
            '--no-shell',
        ], { timeout: 180_000, maxBuffer: 1024 * 1024 });
    }
    catch {
        throw new RuntimeError('BROWSER_INSTALL_FAILED');
    }
}
export async function smokeRuntime(configPath) {
    const { storageDirectory } = await loadConfiguration(configPath);
    await smokeSqlite(storageDirectory);
    try {
        await execute(process.execPath, [fileURLToPath(new URL('./browser-probe.js', import.meta.url))], { timeout: 30_000, maxBuffer: 4096 });
    }
    catch {
        throw new RuntimeError('BROWSER_UNAVAILABLE');
    }
    return {
        status: 'runtime_smoke_passed',
        sqlite: 'disk_wal',
        browser: 'headed_chromium_blank',
    };
}
export async function serve(configPath) {
    const store = await Store.open(configPath);
    const browser = new BrowserSession(store);
    const server = knowledgeServer(store, browser);
    server.server.onerror = () => process.stderr.write('{"error":"MCP_FAILED"}\n');
    server.server.onclose = () => {
        void browser.dispose().finally(() => store.close());
    };
    const transport = new StdioServerTransport(process.stdin, process.stdout, {
        maxBufferSize: 1024 * 1024 + 64 * 1024,
    });
    try {
        await server.connect(transport);
    }
    catch (error) {
        await browser.dispose();
        store.close();
        throw error;
    }
    for (const signal of ['SIGINT', 'SIGTERM']) {
        process.once(signal, () => {
            void browser
                .dispose()
                .finally(() => server.close())
                .finally(() => store.close());
        });
    }
}
