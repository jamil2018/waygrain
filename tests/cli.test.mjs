import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import {
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  readdir,
  rm,
  writeFile,
} from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { test } from 'node:test';
import process from 'node:process';

const fixtureSettings = {
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
          role: 'viewer',
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
const cli = resolve('dist/cli.js');
const run = (args, cwd) =>
  spawnSync(process.execPath, [cli, ...args], {
    cwd,
    encoding: 'utf8',
    timeout: 3000,
  });

test('CLI uses only explicit paths, creates no host settings and emits bounded receipts', async (t) => {
  const directory = await realpath(
    await mkdtemp('/private/tmp/waygrain-a03-cli-'),
  );
  t.after(() => rm(directory, { recursive: true, force: true }));
  const settingsPath = join(directory, 'settings.json');
  const configPath = join(directory, 'private/config.json');
  await writeFile(settingsPath, JSON.stringify(fixtureSettings));
  await writeFile(join(directory, '.gitignore'), 'synthetic sentinel\n');
  const initialized = run(
    ['init', '--config', configPath, '--settings', settingsPath],
    directory,
  );
  assert.equal(initialized.status, 0, initialized.stderr);
  assert.equal(JSON.parse(initialized.stdout).status, 'initialized');
  assert.equal(initialized.stderr, '');
  const checked = run(['check-config', '--config', configPath], directory);
  assert.equal(checked.status, 0, checked.stderr);
  assert.equal(
    JSON.parse(checked.stdout).project_id,
    JSON.parse(initialized.stdout).project_id,
  );
  assert.equal(
    await readFile(join(directory, '.gitignore'), 'utf8'),
    'synthetic sentinel\n',
  );
  assert.deepEqual((await readdir(directory)).sort(), [
    '.gitignore',
    'private',
    'settings.json',
  ]);
  for (const args of [
    [],
    ['check-config'],
    ['check-config', '--config', 'relative/config.json'],
    ['serve', '--config', configPath],
    ['init', '--config', configPath, '--settings', settingsPath, '--force'],
  ]) {
    const result = run(args, directory);
    assert.equal(result.status, 1);
    assert.equal(result.stdout, '');
    assert.deepEqual(Object.keys(JSON.parse(result.stderr)), ['error']);
    assert(!result.stderr.includes(directory));
  }
  await writeFile(
    settingsPath,
    JSON.stringify({ forbidden_synthetic_input: 'NEVER_LOG_SYNTHETIC_VALUE' }),
  );
  const invalid = run(
    [
      'init',
      '--config',
      join(directory, 'invalid/config.json'),
      '--settings',
      settingsPath,
    ],
    directory,
  );
  assert.equal(invalid.status, 1);
  assert.equal(invalid.stderr.trim(), '{"error":"INVALID_CONFIG"}');
  assert(!invalid.stderr.includes('NEVER_LOG_SYNTHETIC_VALUE'));
  assert.deepEqual((await readdir(directory)).sort(), [
    '.gitignore',
    'private',
    'settings.json',
  ]);
});

test('CLI rejects named-pipe config and settings files without waiting for a writer', async (t) => {
  const directory = await realpath(
    await mkdtemp('/private/tmp/waygrain-a03-pipe-'),
  );
  t.after(() => rm(directory, { recursive: true, force: true }));
  const pipe = join(directory, 'settings.json');
  execFileSync('mkfifo', [pipe]);
  const result = run(
    [
      'init',
      '--config',
      join(directory, 'private/config.json'),
      '--settings',
      pipe,
    ],
    directory,
  );
  assert.equal(result.status, 1, String(result.error));
  assert.equal(result.stderr.trim(), '{"error":"INVALID_PATH"}');
  const privateDirectory = join(directory, 'private');
  await mkdir(privateDirectory, { mode: 0o700 });
  await mkdir(join(privateDirectory, 'storage'), { mode: 0o700 });
  const configPipe = join(privateDirectory, 'config.json');
  execFileSync('mkfifo', [configPipe]);
  const loaded = run(['check-config', '--config', configPipe], directory);
  assert.equal(loaded.status, 1, String(loaded.error));
  assert.equal(loaded.stderr.trim(), '{"error":"INVALID_PATH"}');
});
