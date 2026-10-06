import assert from 'node:assert/strict';
import { mkdtemp, realpath, readdir, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { test } from 'node:test';
import { initializeConfiguration } from '../dist/config/index.js';
import { smokeSqlite } from '../dist/runtime/index.js';
import { probeStdio } from '../scripts/protocol-probe.mjs';

const settings = {
  project_alias: 'synthetic',
  apps: [
    {
      alias: 'fixture',
      allowed_origins: ['https://fixture.test'],
      scopes: [
        {
          alias: 'local',
          environment: 'local',
          origin: 'https://fixture.test',
          account_scope: 'sample',
          locale: 'en',
        },
      ],
      route_mappings: [],
      redaction_profiles: [
        {
          alias: 'safe',
          version: 1,
          allowed_labels: [],
          ignored_fields: [],
          unknown_text: 'drop',
        },
      ],
    },
  ],
};
test('stdio handshakes without tools or storage writes and exits on EOF', async (t) => {
  const directory = await realpath(
    await mkdtemp('/private/tmp/waygrain-a04-stdio-'),
  );
  t.after(() => rm(directory, { recursive: true, force: true }));
  const config = join(directory, 'private/config.json');
  await initializeConfiguration(config, settings);
  await probeStdio(resolve('dist/cli.js'), config);
  assert.deepEqual(await readdir(join(directory, 'private/storage')), []);
});
test('SQLite opens a private disposable disk database in WAL mode and removes it', async (t) => {
  const directory = await realpath(
    await mkdtemp('/private/tmp/waygrain-a04-sqlite-'),
  );
  t.after(() => rm(directory, { recursive: true, force: true }));
  await smokeSqlite(directory);
  assert.deepEqual(await readdir(directory), []);
});

test('missing explicitly installed browser fails with sanitized code and no retained probe database', async (t) => {
  const { spawnSync } = await import('node:child_process');
  const { default: process } = await import('node:process');
  const directory = await realpath(
    await mkdtemp('/private/tmp/waygrain-a04-missing-'),
  );
  t.after(() => rm(directory, { recursive: true, force: true }));
  const config = join(directory, 'private/config.json');
  await initializeConfiguration(config, settings);
  const result = spawnSync(
    process.execPath,
    [resolve('dist/cli.js'), 'smoke-runtime', '--config', config],
    {
      env: {
        ...process.env,
        PLAYWRIGHT_BROWSERS_PATH: join(directory, 'absent'),
      },
      encoding: 'utf8',
      timeout: 10_000,
    },
  );
  assert.equal(result.status, 1);
  assert.equal(result.stdout, '');
  assert.equal(result.stderr, '{"error":"BROWSER_UNAVAILABLE"}\n');
  assert.deepEqual(await readdir(join(directory, 'private/storage')), []);
});
