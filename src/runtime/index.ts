import { execFile } from 'node:child_process';
import { mkdtemp, open, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { McpServer } from '@modelcontextprotocol/server';
import { StdioServerTransport } from '@modelcontextprotocol/server/stdio';
import { loadConfiguration } from '../config/index.js';

const execute = promisify(execFile);
const require = createRequire(import.meta.url);
export class RuntimeError extends Error {
  constructor(
    readonly code:
      | 'SQLITE_UNAVAILABLE'
      | 'BROWSER_UNAVAILABLE'
      | 'BROWSER_INSTALL_FAILED'
      | 'MCP_FAILED',
  ) {
    super(code);
  }
}

// A04 uses a disposable database only; the graph store and coordination are B03.
interface ProbeDatabase {
  pragma(sql: string): unknown;
  prepare(sql: string): { get(): unknown };
  close(): void;
}
export async function smokeSqlite(storageDirectory: string): Promise<void> {
  const directory = await mkdtemp(join(storageDirectory, 'feasibility-'));
  let database: ProbeDatabase | undefined;
  try {
    const path = join(directory, 'probe.sqlite');
    const file = await open(path, 'wx', 0o600);
    await file.close();
    const Database = require('better-sqlite3') as new (
      path: string,
    ) => ProbeDatabase;
    database = new Database(path);
    const mode = database.pragma('journal_mode = WAL') as {
      journal_mode?: string;
    }[];
    if (mode[0]?.journal_mode !== 'wal') throw new Error();
    const integrity = database.pragma('quick_check') as {
      quick_check?: string;
    }[];
    if (integrity[0]?.quick_check !== 'ok') throw new Error();
    const result = database.prepare('SELECT 1 AS ok').get() as { ok?: number };
    if (result.ok !== 1) throw new Error();
  } catch {
    throw new RuntimeError('SQLITE_UNAVAILABLE');
  } finally {
    try {
      database?.close();
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  }
}

export async function installBrowser(): Promise<void> {
  try {
    await execute(
      process.execPath,
      [
        join(dirname(require.resolve('playwright/package.json')), 'cli.js'),
        'install',
        'chromium',
        '--no-shell',
      ],
      { timeout: 180_000, maxBuffer: 1024 * 1024 },
    );
  } catch {
    throw new RuntimeError('BROWSER_INSTALL_FAILED');
  }
}

export async function smokeRuntime(configPath: string) {
  const { storageDirectory } = await loadConfiguration(configPath);
  await smokeSqlite(storageDirectory);
  try {
    await execute(
      process.execPath,
      [fileURLToPath(new URL('./browser-probe.js', import.meta.url))],
      { timeout: 30_000, maxBuffer: 4096 },
    );
  } catch {
    throw new RuntimeError('BROWSER_UNAVAILABLE');
  }
  return {
    status: 'runtime_smoke_passed',
    sqlite: 'disk_wal',
    browser: 'headed_chromium_blank',
  };
}

export async function serve(configPath: string): Promise<void> {
  await loadConfiguration(configPath);
  // No public tools or storage effects before their assigned roadmap tasks.
  const server = new McpServer({
    name: 'waygrain-feasibility',
    version: '0.0.0',
  });
  server.server.onerror = () =>
    process.stderr.write('{"error":"MCP_FAILED"}\n');
  const transport = new StdioServerTransport(process.stdin, process.stdout, {
    maxBufferSize: 1024 * 1024,
  });
  await server.connect(transport);
  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.once(signal, () => {
      void server.close();
    });
  }
}
