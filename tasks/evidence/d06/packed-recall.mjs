// Independent clean-consumer packed smoke plus actual graph/CLI/MCP recall.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtemp, realpath, readFile, writeFile, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import process from 'node:process';
import console from 'node:console';
const root = await realpath(await mkdtemp('/private/tmp/waygrain-d06-pack-'));
const env = {
  ...process.env,
  npm_config_cache: join(root, 'npm-cache'),
  PLAYWRIGHT_BROWSERS_PATH: join(root, 'browsers'),
  PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: '1',
};
const run = (cmd, args, cwd = root) =>
  execFileSync(cmd, args, {
    cwd,
    env,
    encoding: 'utf8',
    timeout: 240000,
    maxBuffer: 1024 * 1024,
  });
try {
  const [pack] = JSON.parse(
    run(
      'npm',
      ['pack', '--json', '--silent', '--pack-destination', root],
      resolve('.'),
    ),
  );
  const archive = join(root, pack.filename);
  const sha256 = createHash('sha256')
    .update(await readFile(archive))
    .digest('hex');
  assert(
    pack.files.every((f) =>
      /^(dist\/|LICENSE$|README.md$|package.json$)/.test(f.path),
    ),
  );
  await writeFile(
    join(root, 'package.json'),
    JSON.stringify({
      private: true,
      type: 'module',
      dependencies: { waygrain: `file:${archive}` },
    }),
  );
  run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund']);
  const packageRoot = join(root, 'node_modules/waygrain');
  env.D06_PACKAGE_DIR = packageRoot;
  run(process.execPath, [
    '--input-type=module',
    '-e',
    `import assert from 'node:assert/strict'; import {ingest,commit,query,evidence,Store} from 'waygrain'; import {contractJsonSchemas} from 'waygrain/contracts'; import schemas from 'waygrain/contracts/schemas.json' with {type:'json'}; for(const x of [ingest,commit,query,evidence,Store.open])assert.equal(typeof x,'function');assert.deepEqual(schemas.tools,contractJsonSchemas());`,
  ]);
  const cli = join(packageRoot, 'dist/cli.js');
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
  const settingsPath = join(root, 'settings.json'),
    config = join(root, 'private/config.json');
  await writeFile(settingsPath, JSON.stringify(settings));
  assert.equal(
    JSON.parse(
      run(process.execPath, [
        cli,
        'init',
        '--config',
        config,
        '--settings',
        settingsPath,
      ]),
    ).status,
    'initialized',
  );
  assert.equal(
    JSON.parse(
      run(process.execPath, [cli, 'install-browser', '--config', config]),
    ).status,
    'browser_installed',
  );
  assert.equal(
    JSON.parse(
      run(process.execPath, [cli, 'smoke-runtime', '--config', config]),
    ).status,
    'runtime_smoke_passed',
  );
  const live = JSON.parse(
    run(process.execPath, [resolve('tasks/evidence/d06/live-recall.mjs')]),
  );
  assert.equal(live.status, 'live_recall_passed');
  assert.equal(live.packed, true);
  const runtimeHashes = [];
  for (const f of pack.files
    .filter((f) => f.path.startsWith('dist/'))
    .sort((a, b) => a.path.localeCompare(b.path))) {
    const bytes = await readFile(join(packageRoot, f.path));
    assert.deepEqual(bytes, await readFile(resolve(f.path)));
    runtimeHashes.push(
      f.path + ' ' + createHash('sha256').update(bytes).digest('hex'),
    );
  }
  console.log(
    JSON.stringify({
      status: 'packed_recall_passed',
      node: process.version,
      tarball_sha256: sha256,
      packed_files: pack.files.length,
      runtime_manifest_sha256: createHash('sha256')
        .update(runtimeHashes.join('\n'))
        .digest('hex'),
      install: 'clean_consumer_ignore_scripts_explicit_browser_install',
      exports: 'graph_and_generated_schemas',
      smoke: 'headed_blank_SQLite',
      recall: live,
    }),
  );
} finally {
  await rm(root, { recursive: true, force: true });
}
