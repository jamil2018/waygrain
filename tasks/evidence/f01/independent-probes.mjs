import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { initializeConfiguration } from '../../../dist/config/index.js';
import { fixtureSettings } from '../../../tests/fixtures/ui/index.mjs';
const root = await mkdtemp('/private/tmp/f01-independent-probe-');
const cli = fileURLToPath(new URL('../../../dist/cli.js', import.meta.url));
const config = join(root, 'private/config.json');
const hash = (x) => createHash('sha256').update(x).digest('hex');
try {
  await initializeConfiguration(config, fixtureSettings());
  const before = hash(await readFile(config));
  const doctor = spawnSync(
    process.execPath,
    [cli, 'doctor', '--config', config],
    {
      encoding: 'utf8',
      env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: join(root, 'absent') },
    },
  );
  assert.equal(doctor.status, 0);
  assert.equal(doctor.stderr, '');
  assert.equal(JSON.parse(doctor.stdout).browser_installed, false);
  assert.equal(JSON.parse(doctor.stdout).browser_launch, 'not_tested');
  assert.deepEqual(await readdir(join(root, 'private/storage')), []);
  assert.equal(hash(await readFile(config)), before);
  assert(!doctor.stdout.includes(root));
  for (const v of [
    '',
    'relative/config.json',
    '/private/tmp/synthetic-secret-value/config.json',
  ]) {
    const p = spawnSync(process.execPath, [cli, 'serve-env'], {
      encoding: 'utf8',
      env: { ...process.env, WAYGRAIN_CONFIG: v },
      timeout: 10000,
    });
    assert.equal(p.status, 1);
    assert.equal(p.stdout, '');
    assert.match(
      p.stderr,
      /^\{"error":"(?:INVALID_CONFIG|INVALID_PATH|CONFIG_IO)"\}\n$/,
    );
    assert(!p.stderr.includes('synthetic-secret'));
  }
  await writeFile(config, '{"synthetic-secret-value":"untrusted"}', {
    mode: 0o600,
  });
  const invalid = spawnSync(
    process.execPath,
    [cli, 'doctor', '--config', config],
    { encoding: 'utf8' },
  );
  assert.equal(invalid.status, 1);
  assert.equal(invalid.stdout, '');
  assert.equal(invalid.stderr, '{"error":"INVALID_CONFIG"}\n');
  console.log(
    JSON.stringify({
      status: 'passed',
      node: process.version,
      checks: [
        'initialized_doctor_no_graph_or_configuration_mutation',
        'no_host_path_output',
        'absent_browser_report',
        'env_fail_closed',
        'invalid_config_no_contents_output',
      ],
    }),
  );
} finally {
  await rm(root, { recursive: true, force: true });
}
