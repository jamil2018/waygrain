import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import process from 'node:process';
import { test } from 'node:test';
import { storageFixture } from './fixtures/storage.mjs';
import { diagnose } from '../dist/runtime/diagnostics.js';
import { probeStdio } from '../scripts/protocol-probe.mjs';

test('plugin diagnostics report availability without browser launch or graph mutation', async (t) => {
  const fixture = await storageFixture(t);
  fixture.store.close();
  const storage = join(fixture.root, 'private/storage');
  const before = await readdir(storage);
  const result = await diagnose(fixture.configPath);
  assert.equal(result.configuration, 'valid');
  assert.equal(result.sqlite, 'disk_wal');
  assert.equal(result.browser_launch, 'not_tested');
  assert.equal(result.host_integration, 'not_tested');
  assert.equal(result.project_id, fixture.base.project_id);
  assert.deepEqual(await readdir(storage), before);
  const child = spawnSync(
    process.execPath,
    [resolve('dist/cli.js'), 'doctor', '--config', fixture.configPath],
    {
      encoding: 'utf8',
      env: {
        ...process.env,
        PLAYWRIGHT_BROWSERS_PATH: join(fixture.root, 'absent'),
      },
      timeout: 10000,
    },
  );
  assert.equal(child.status, 0, child.stderr);
  assert.equal(child.stderr, '');
  assert.equal(JSON.parse(child.stdout).status, 'needs_browser_install');
  assert.equal(JSON.parse(child.stdout).browser_installed, false);
  assert(!child.stdout.includes(fixture.root));
});

test('plugin env launch exposes all tools and refuses missing or relative configuration', async (t) => {
  const fixture = await storageFixture(t);
  fixture.store.close();
  const cli = resolve('dist/cli.js');
  await probeStdio(cli, fixture.configPath, undefined, {
    args: ['serve-env'],
    env: { ...process.env, WAYGRAIN_CONFIG: fixture.configPath },
  });
  for (const config of ['', 'relative/config.json']) {
    const result = spawnSync(process.execPath, [cli, 'serve-env'], {
      encoding: 'utf8',
      env: { ...process.env, WAYGRAIN_CONFIG: config },
      timeout: 10000,
    });
    assert.equal(result.status, 1);
    assert.equal(result.stdout, '');
    assert.match(
      result.stderr,
      /^\{"error":"(?:INVALID_CONFIG|INVALID_PATH)"\}\n$/,
    );
  }
});

test('portable and generated compatibility manifests preserve identity and server launch', async () => {
  const json = async (path) => JSON.parse(await readFile(path, 'utf8'));
  const [plugin, codex, portable, compatibility, pkg] = await Promise.all([
    json('plugin.json'),
    json('.codex-plugin/plugin.json'),
    json('mcp.json'),
    json('.mcp.json'),
    json('package.json'),
  ]);
  assert.equal(plugin.name, pkg.name);
  assert.equal(plugin.version, pkg.version);
  assert.equal(codex.name, plugin.name);
  assert.equal(codex.version, plugin.version);
  const { type, ...server } = portable.mcpServers.waygrain;
  assert.equal(type, 'stdio');
  assert.deepEqual(compatibility.mcpServers.waygrain, server);
  assert.equal(server.command, 'waygrain');
  assert.deepEqual(server.args, ['serve-env']);
  assert.equal(codex.skills, './skills/');
  assert.equal(codex.mcpServers, './.mcp.json');
});
