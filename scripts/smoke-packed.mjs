import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  mkdtemp,
  copyFile,
  readFile,
  readdir,
  realpath,
  rm,
  writeFile,
} from 'node:fs/promises';
import { join, resolve } from 'node:path';
import process from 'node:process';
import { probeStdio } from './protocol-probe.mjs';

const directory = await realpath(
  await mkdtemp('/private/tmp/waygrain-a04-packed-'),
);
const env = {
  ...process.env,
  npm_config_cache: join(directory, 'npm-cache'),
  PLAYWRIGHT_BROWSERS_PATH: join(directory, 'browsers'),
  PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: '1',
};
const run = (command, args, cwd = directory, timeout = 240_000) =>
  execFileSync(command, args, {
    cwd,
    env,
    encoding: 'utf8',
    timeout,
    maxBuffer: 1024 * 1024,
  });
try {
  let pack;
  if (process.argv[2]) {
    const supplied = resolve(process.argv[2]);
    const filename = 'waygrain-candidate.tgz';
    await copyFile(supplied, join(directory, filename));
    const entries = run('tar', ['-tf', join(directory, filename)])
      .trim()
      .split('\n');
    assert(
      entries.every(
        (entry) => entry.startsWith('package/') && !entry.includes('..'),
      ),
    );
    pack = {
      filename,
      files: entries.map((entry) => ({ path: entry.slice(8) })),
    };
    assert.equal(
      new Set(pack.files.map((file) => file.path)).size,
      pack.files.length,
    );
  } else {
    [pack] = JSON.parse(
      run(
        'npm',
        ['pack', '--json', '--silent', '--pack-destination', directory],
        resolve('.'),
      ),
    );
  }
  assert(
    pack.files.some((file) => file.path === 'dist/runtime/browser-probe.js'),
  );
  assert(
    pack.files.every((file) =>
      /^(dist\/|skills\/|assets\/pilot\/blogen-settings.json$|\.codex-plugin\/plugin.json$|\.mcp.json$|plugin.json$|mcp.json$|PLUGIN_SETUP.md$|LICENSE$|README.md$|package.json$)/.test(
        file.path,
      ),
    ),
  );
  const tarball = join(directory, pack.filename);
  const sha256 = createHash('sha256')
    .update(await readFile(tarball))
    .digest('hex');
  await writeFile(
    join(directory, 'package.json'),
    JSON.stringify({
      private: true,
      type: 'module',
      dependencies: { waygrain: `file:${tarball}` },
    }),
  );
  run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund']);
  run('npm', ['rebuild', 'better-sqlite3', '--offline']);
  assert(
    pack.files.some((file) => file.path === 'dist/contracts/schemas.json'),
  );
  run(process.execPath, [
    '--input-type=module',
    '-e',
    `
    import assert from 'node:assert/strict';
    import { contracts, validateRequest, contractJsonSchemas } from 'waygrain/contracts';
    import schemas from 'waygrain/contracts/schemas.json' with { type: 'json' };
    assert.equal(Object.keys(contracts).length, 13);
    assert.deepEqual(schemas.tools, contractJsonSchemas());
    validateRequest('wg_status', { schema_version: 1, project_id: '00000000-0000-4000-8000-000000000001', app_id: '00000000-0000-4000-8000-000000000002' });
  `,
  ]);
  const cli = join(directory, 'node_modules/waygrain/dist/cli.js');
  for (const path of [
    'plugin.json',
    'mcp.json',
    '.mcp.json',
    '.codex-plugin/plugin.json',
    'skills/understand-product/SKILL.md',
    'skills/explore-and-remember/SKILL.md',
    'skills/explain-changes/SKILL.md',
    'PLUGIN_SETUP.md',
  ])
    assert(
      pack.files.some((file) => file.path === path),
      path,
    );
  const settingsPath = join(directory, 'settings.json');
  await writeFile(
    settingsPath,
    JSON.stringify({
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
    }),
  );
  const config = join(directory, 'private/config.json');
  const bin = join(directory, 'node_modules/.bin/waygrain');
  assert.equal(
    JSON.parse(
      run(bin, ['init', '--config', config, '--settings', settingsPath]),
    ).status,
    'initialized',
  );
  await probeStdio(cli, config);
  await probeStdio(cli, config, undefined, {
    args: ['serve-env'],
    env: { ...env, WAYGRAIN_CONFIG: config },
  });
  assert.equal(
    JSON.parse(run(bin, ['doctor', '--config', config])).status,
    'needs_browser_install',
  );
  assert.deepEqual((await readdir(join(directory, 'private/storage'))).sort(), [
    'coordination.sqlite',
    'knowledge.sqlite',
  ]);
  assert.equal(
    JSON.parse(run(bin, ['install-browser', '--config', config])).status,
    'browser_installed',
  );
  const smoke = JSON.parse(run(bin, ['smoke-runtime', '--config', config]));
  assert.equal(
    JSON.parse(run(bin, ['doctor', '--config', config])).status,
    'ready_for_runtime_probe',
  );
  assert.equal(smoke.status, 'runtime_smoke_passed');
  assert.deepEqual((await readdir(join(directory, 'private/storage'))).sort(), [
    'coordination.sqlite',
    'knowledge.sqlite',
  ]);
  process.stdout.write(
    JSON.stringify({
      status: 'packed_smoke_passed',
      node: process.version,
      platform: process.platform,
      arch: process.arch,
      tarball_sha256: sha256,
      packed_files: pack.files.length,
      install: 'ignore_scripts',
      stdio: 'initialize_ping_eof',
      contracts: 'thirteen_public_exports_and_generated_schemas',
      ...smoke,
      status_packed: 'passed',
    }) + '\n',
  );
} catch {
  process.stderr.write('{"error":"PACKED_SMOKE_FAILED"}\n');
  process.exitCode = 1;
} finally {
  await rm(directory, { recursive: true, force: true });
}
