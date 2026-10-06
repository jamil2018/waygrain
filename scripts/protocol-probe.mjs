import { setTimeout, clearTimeout } from 'node:timers';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import process from 'node:process';

export async function probeStdio(cli, configPath) {
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
    assert.equal(initialized.result.serverInfo.name, 'waygrain-feasibility');
    assert.equal(initialized.result.protocolVersion, '2025-11-25');
    assert.deepEqual(initialized.result.capabilities, {});
    child.stdin.write(
      '{"jsonrpc":"2.0","method":"notifications/initialized"}\n',
    );
    const ping = await request(2, 'ping', {});
    assert.deepEqual(ping.result, {});
    const tools = await request(3, 'tools/list', {});
    assert.equal(tools.error.code, -32601);
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
