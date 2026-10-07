import { setTimeout, clearTimeout } from 'node:timers';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import process from 'node:process';
import { readFile } from 'node:fs/promises';

export async function probeStdio(cli, configPath, exercise) {
  const child = spawn(
    process.execPath,
    [cli, 'serve', '--config', configPath],
    { stdio: ['pipe', 'pipe', 'pipe'] },
  );
  let diagnostics = '';
  child.stderr.on('data', (chunk) => {
    diagnostics += chunk;
  });
  const lines = createInterface({ input: child.stdout });
  const responses = new Map();
  let failure;
  lines.on('line', (line) => {
    try {
      const response = JSON.parse(line);
      responses.set(response.id, response);
    } catch {
      failure = new Error('Nonprotocol stdout');
    }
  });
  const exit = new Promise((resolve) =>
    child.once('exit', (code, signal) => resolve({ code, signal })),
  );
  const timer = setTimeout(() => child.kill('SIGKILL'), 10_000);
  async function request(id, method, params) {
    child.stdin.write(
      JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n',
    );
    const deadline = Date.now() + 5000;
    while (
      !responses.has(id) &&
      Date.now() < deadline &&
      child.exitCode === null &&
      !failure
    ) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    if (failure) throw failure;
    assert(responses.has(id), 'Missing MCP response');
    return responses.get(id);
  }
  try {
    const initialized = await request(1, 'initialize', {
      protocolVersion: '2025-11-25',
      capabilities: {},
      clientInfo: { name: 'synthetic-a04', version: '1' },
    });
    assert.equal(initialized.result.serverInfo.name, 'waygrain');
    assert.equal(initialized.result.protocolVersion, '2025-11-25');
    assert.deepEqual(initialized.result.capabilities, { tools: {} });
    child.stdin.write(
      '{"jsonrpc":"2.0","method":"notifications/initialized"}\n',
    );
    const ping = await request(2, 'ping', {});
    assert.deepEqual(ping.result, {});
    const tools = await request(3, 'tools/list', {});
    assert.deepEqual(
      tools.result.tools.map((t) => t.name),
      [
        'wg_status',
        'wg_ingest',
        'wg_evidence',
        'wg_commit',
        'wg_query',
        'wg_changes',
        'wg_plan_refresh',
        'wg_browser_open',
        'wg_browser_status',
        'wg_browser_snapshot',
        'wg_browser_navigate',
        'wg_browser_act',
        'wg_browser_close',
      ],
    );
    const config = JSON.parse(await readFile(configPath, 'utf8'));
    const base = {
      schema_version: 1,
      project_id: config.project_id,
      app_id: config.apps[0].app_id,
    };
    const status = await request(4, 'tools/call', {
      name: 'wg_status',
      arguments: base,
    });
    assert.equal(status.result.structuredContent.store_revision, 0);
    assert.deepEqual(status.result.structuredContent.data.capabilities, [
      'ingest',
      'evidence',
      'query',
      'changes',
      'refresh_plan',
    ]);
    const rejected = await request(5, 'tools/call', {
      name: 'wg_status',
      arguments: { ...base, SYNTHETIC_SECRET_KEY: 'SYNTHETIC_SECRET_VALUE' },
    });
    assert.equal(rejected.result.isError, true);
    assert.equal(rejected.result.structuredContent.error.code, 'INVALID_INPUT');
    assert(!JSON.stringify(rejected).includes('SYNTHETIC_SECRET_KEY'));
    assert(!JSON.stringify(rejected).includes('SYNTHETIC_SECRET_VALUE'));
    if (exercise) await exercise(request, base, tools.result.tools);
    child.stdin.end();
    assert.deepEqual(await exit, { code: 0, signal: null });
    assert.equal(diagnostics, '');
  } finally {
    clearTimeout(timer);
    lines.close();
    if (child.exitCode === null) child.kill('SIGKILL');
    await exit;
  }
}
