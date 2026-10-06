import assert from 'node:assert/strict';
import {
  chmod,
  link,
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rm,
  stat,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';
import {
  initializeConfiguration,
  loadConfiguration,
} from '../dist/config/index.js';
import {
  validateSettings,
  validateConfiguration,
} from '../dist/config/schema.js';

export function settings() {
  return {
    project_alias: 'synthetic',
    apps: [
      {
        alias: 'fixture',
        allowed_origins: ['http://localhost:3000'],
        scopes: [
          {
            alias: 'viewer',
            environment: 'local',
            origin: 'http://localhost:3000',
            account_scope: 'sample',
            locale: 'en-US',
          },
        ],
        route_mappings: [
          {
            view_key: 'members',
            origin: 'http://localhost:3000',
            route_template: '/members/:id',
          },
        ],
        redaction_profiles: [
          {
            alias: 'labels',
            version: 1,
            allowed_labels: ['Members'],
            ignored_fields: [],
            unknown_text: 'drop',
          },
        ],
      },
    ],
  };
}

async function fixture(t) {
  const directory = await realpath(await mkdtemp('/private/tmp/waygrain-a03-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  return { directory, path: join(directory, 'private', 'config.json') };
}
const rejectsCode = (promise, code) => assert.rejects(promise, { code });

test('init and reload mint stable UUIDs, explicit scopes and restricted fixed storage', async (t) => {
  const { directory, path } = await fixture(t);
  const receipt = await initializeConfiguration(path, settings());
  const loaded = await loadConfiguration(path);
  assert.equal(loaded.configuration.project_id, receipt.project_id);
  assert.deepEqual(
    loaded.configuration.apps.map((app) => app.app_id),
    receipt.app_ids,
  );
  assert.notEqual(receipt.project_id, receipt.app_ids[0]);
  assert.equal(loaded.configuration.apps[0].scopes[0].role, 'unknown');
  assert.equal(loaded.configuration.storage_limit_bytes, 104857600);
  assert.equal(
    loaded.databasePath,
    join(directory, 'private/storage/knowledge.sqlite'),
  );
  assert.equal(
    loaded.coordinationPath,
    join(directory, 'private/storage/coordination.sqlite'),
  );
  assert(Object.isFrozen(loaded.configuration.apps[0].scopes[0]));
  for (const [entry, mode] of [
    [join(directory, 'private'), 0o700],
    [loaded.storageDirectory, 0o700],
    [path, 0o600],
  ]) {
    assert.equal((await stat(entry)).mode & 0o777, mode);
  }
  await assert.rejects(readFile(loaded.databasePath), { code: 'ENOENT' });
  const original = await readFile(path);
  await rejectsCode(
    initializeConfiguration(path, settings()),
    'ALREADY_INITIALIZED',
  );
  assert.deepEqual(await readFile(path), original);
});

test('strict validation rejects caller IDs, storage overrides, duplicates and origin mismatches before writes', async (t) => {
  const { directory, path } = await fixture(t);
  const invalid = [];
  for (const change of [
    { project_id: 'caller' },
    { storage_path: '/private/tmp/elsewhere' },
    { storage_limit_bytes: 0 },
    { apps: [] },
    { project_alias: 'identifying@email.test' },
  ])
    invalid.push({ ...settings(), ...change });
  for (const mutate of [
    (app) => {
      app.allowed_origins = ['http://localhost:3000/'];
    },
    (app) => {
      app.allowed_origins = ['https://user:pass@example.test'];
    },
    (app) => {
      app.scopes[0].origin = 'https://example.test';
    },
    (app) => {
      app.scopes.push(app.scopes[0]);
    },
    (app) => {
      app.route_mappings[0].route_template = '/members?secret=x';
    },
    (app) => {
      app.route_mappings[0].route_template = '/a/../b';
    },
    (app) => {
      app.redaction_profiles[0].unknown_text = 'retain';
    },
  ]) {
    const input = settings();
    mutate(input.apps[0]);
    invalid.push(input);
  }
  for (const input of invalid)
    await rejectsCode(initializeConfiguration(path, input), 'INVALID_CONFIG');
  await assert.rejects(stat(join(directory, 'private')), { code: 'ENOENT' });
  const input = settings();
  input.apps.push(input.apps[0]);
  assert.throws(() => validateSettings(input), { code: 'INVALID_CONFIG' });
});

test('relative, traversal, symlink, missing parent and existing directories are refused without neighbor edits', async (t) => {
  const { directory } = await fixture(t);
  for (const path of [
    'relative/config.json',
    join(directory, 'other.json'),
    `${directory}/../escape/config.json`,
    `${directory}//new/config.json`,
  ]) {
    await rejectsCode(
      initializeConfiguration(path, settings()),
      'INVALID_PATH',
    );
  }
  const outside = join(directory, 'outside');
  await mkdir(outside);
  const sentinel = join(outside, 'sentinel');
  await writeFile(sentinel, 'synthetic neighbor');
  await symlink(outside, join(directory, 'redirect'));
  await rejectsCode(
    initializeConfiguration(
      join(directory, 'redirect/new/config.json'),
      settings(),
    ),
    'INVALID_PATH',
  );
  await rejectsCode(
    initializeConfiguration(
      join(directory, 'missing/new/config.json'),
      settings(),
    ),
    'CONFIG_IO',
  );
  await rejectsCode(
    initializeConfiguration(join(outside, 'config.json'), settings()),
    'ALREADY_INITIALIZED',
  );
  assert.equal(await readFile(sentinel, 'utf8'), 'synthetic neighbor');
});

test('load refuses unsafe permissions, file links, storage symlinks and invalid schema', async (t) => {
  const { directory, path } = await fixture(t);
  await initializeConfiguration(path, settings());
  const original = await readFile(path, 'utf8');
  await chmod(path, 0o644);
  await rejectsCode(loadConfiguration(path), 'INVALID_PATH');
  await chmod(path, 0o600);
  const storage = join(directory, 'private/storage');
  await chmod(storage, 0o755);
  await rejectsCode(loadConfiguration(path), 'INVALID_PATH');
  await chmod(storage, 0o700);
  await link(path, join(directory, 'hardlink'));
  await rejectsCode(loadConfiguration(path), 'INVALID_PATH');
  await rm(join(directory, 'hardlink'));
  await rm(path);
  await symlink(join(directory, 'absent'), path);
  await rejectsCode(loadConfiguration(path), 'CONFIG_IO');
  await rm(path);
  await writeFile(path, original, { mode: 0o600 });
  const db = join(storage, 'knowledge.sqlite');
  await symlink(path, db);
  await rejectsCode(loadConfiguration(path), 'INVALID_PATH');
  await rm(db);
  const invalid = JSON.parse(original);
  invalid.schema_version = 2;
  await writeFile(path, JSON.stringify(invalid));
  await rejectsCode(loadConfiguration(path), 'INVALID_CONFIG');
  invalid.schema_version = 1;
  invalid.apps[0].app_id = invalid.project_id;
  assert.throws(() => validateConfiguration(invalid), {
    code: 'INVALID_CONFIG',
  });
  await writeFile(path, 'x'.repeat(65537));
  await rejectsCode(loadConfiguration(path), 'INVALID_PATH');
});

test('concurrent init admits one writer and never remints an initialized location', async (t) => {
  const { path } = await fixture(t);
  const results = await Promise.allSettled([
    initializeConfiguration(path, settings()),
    initializeConfiguration(path, settings()),
  ]);
  assert.equal(
    results.filter((result) => result.status === 'fulfilled').length,
    1,
  );
  const rejected = results.find((result) => result.status === 'rejected');
  assert.equal(rejected.reason.code, 'ALREADY_INITIALIZED');
  await loadConfiguration(path);
});
