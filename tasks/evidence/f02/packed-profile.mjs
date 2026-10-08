import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, rm, symlink } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
const root = await mkdtemp('/private/tmp/f02-independent-packed-');
try {
  const [pack] = JSON.parse(
    execFileSync(
      'npm',
      ['pack', '--json', '--silent', '--pack-destination', root],
      {
        cwd: resolve('.'),
        encoding: 'utf8',
        env: { ...process.env, npm_config_cache: join(root, 'cache') },
      },
    ),
  );
  assert(
    pack.files.some((x) => x.path === 'assets/pilot/blogen-settings.json'),
  );
  assert(
    pack.files.every((x) =>
      /^(dist\/|skills\/|assets\/pilot\/blogen-settings.json$|\.codex-plugin\/plugin.json$|\.mcp.json$|plugin.json$|mcp.json$|PLUGIN_SETUP.md$|LICENSE$|README.md$|package.json$)/.test(
        x.path,
      ),
    ),
  );
  const archive = join(root, pack.filename);
  execFileSync('tar', ['-xzf', archive, '-C', root]);
  // Reuse the dependency-installed checkout only for this isolated profile/schema probe.
  // This does not attest a new clean dependency installation or host integration.
  await symlink(resolve('node_modules'), join(root, 'package/node_modules'));
  const profile = await readFile(
    join(root, 'package/assets/pilot/blogen-settings.json'),
  );
  assert.deepEqual(
    profile,
    await readFile('assets/pilot/blogen-settings.json'),
  );
  const { validateSettings } = await import(
    pathToFileURL(join(root, 'package/dist/config/schema.js')).href
  );
  const parsed = validateSettings(JSON.parse(profile));
  assert.equal(parsed.apps[0].alias, 'blogen');
  assert.equal(parsed.apps[0].scopes.length, 2);
  const { initializeConfiguration, loadConfiguration } = await import(
    pathToFileURL(join(root, 'package/dist/config/index.js')).href
  );
  const config = join(root, 'private/config.json');
  await initializeConfiguration(config, parsed);
  const { configuration } = await loadConfiguration(config);
  assert.equal(
    configuration.apps[0].redaction_profiles[0].unknown_text,
    'drop',
  );
  console.log(
    JSON.stringify({
      status: 'passed',
      node: process.version,
      packed_files: pack.files.length,
      tarball_sha256: createHash('sha256')
        .update(await readFile(archive))
        .digest('hex'),
      profile_sha256: createHash('sha256').update(profile).digest('hex'),
      checks: [
        'intended_packed_file_allowlist',
        'profile_identical_to_reviewed_source',
        'packed_schema_validation',
        'packed_config_initialization_and_loading',
      ],
      dependencies: 'existing_checkout_reused_for_profile_probe',
      clean_install: 'not_retested_F02',
      browser: 'not_opened',
      host_integration: 'not_tested',
    }),
  );
} finally {
  await rm(root, { recursive: true, force: true });
}
