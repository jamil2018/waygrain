import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  mkdtemp,
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
  const [pack] = JSON.parse(
    run(
      'npm',
      ['pack', '--json', '--silent', '--pack-destination', directory],
      resolve('.'),
    ),
  );
  assert(
    pack.files.some((file) => file.path === 'dist/runtime/browser-probe.js'),
  );
  assert(
    pack.files.every((file) =>
      /^(dist\/|LICENSE$|README.md$|package.json$)/.test(file.path),
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
  const cli = join(directory, 'node_modules/waygrain/dist/cli.js');
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
  assert.deepEqual(await readdir(join(directory, 'private/storage')), []);
  assert.equal(
    JSON.parse(run(bin, ['install-browser', '--config', config])).status,
    'browser_installed',
  );
  const smoke = JSON.parse(run(bin, ['smoke-runtime', '--config', config]));
  assert.equal(smoke.status, 'runtime_smoke_passed');
  assert.deepEqual(await readdir(join(directory, 'private/storage')), []);
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
