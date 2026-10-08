// Live owned-browser MCP pilot. Only sanitized tool output is read or retained.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { createInterface } from 'node:readline';
import { join } from 'node:path';
import process from 'node:process';
import { setTimeout, clearTimeout } from 'node:timers';
import { setTimeout as delay } from 'node:timers/promises';

const root = process.argv[2];
assert(root?.startsWith('/private/tmp/waygrain-f-pilot-'));
const runId = randomUUID();
const { errorCode } = await import(join(root, 'node_modules/waygrain/dist/contracts/common.js'));
class PilotToolError extends Error {
  constructor(code) { super('PILOT_TOOL_FAILED'); this.code = code; }
}
const configPath = join(root, 'private/config.json');
const config = JSON.parse(await readFile(configPath, 'utf8'));
const app = config.apps.find((app) => app.alias === 'blogen');
const { alias, ...scope } = app.scopes.find((scope) => scope.alias === 'local-admin');
assert.equal(alias, 'local-admin');
const base = { schema_version: 1, project_id: config.project_id, app_id: app.app_id };
const browserBase = { ...base, browser_schema_version: 1 };
const child = spawn(process.execPath, [join(root, 'node_modules/waygrain/dist/cli.js'), 'serve', '--config', configPath], {
  env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: join(root, 'browsers') },
  stdio: ['pipe', 'pipe', 'pipe'],
});
const replies = new Map();
let protocolError = false;
let diagnostics = false;
child.stderr.on('data', () => { diagnostics = true; });
const output = createInterface({ input: child.stdout });
output.on('line', (line) => {
  try { const response = JSON.parse(line); replies.set(response.id, response); }
  catch { protocolError = true; }
});
let id = 0;
let sequence = 0;
const exit = new Promise((resolve) => child.once('exit', (code, signal) => resolve({ code, signal })));
async function rpc(method, params) {
  const requestId = ++id;
  child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: requestId, method, params }) + '\n');
  const deadline = Date.now() + 35000;
  while (!replies.has(requestId) && Date.now() < deadline && child.exitCode === null && !protocolError)
    await delay(20);
  assert(!protocolError && replies.has(requestId), 'MCP response unavailable');
  const response = replies.get(requestId);
  replies.delete(requestId);
  assert(!response.error, 'MCP protocol rejected');
  return response.result;
}
async function call(name, args) {
  const result = await rpc('tools/call', { name, arguments: args });
  if (result.isError) {
    const parsed = errorCode.safeParse(result.structuredContent?.error?.code);
    throw new PilotToolError(parsed.success ? parsed.data : 'PILOT_UNKNOWN_TOOL_ERROR');
  }
  assert(result.structuredContent);
  return result.structuredContent;
}
const receipt = { schema_version: 1, application: 'blogen', run_id: runId, runtime: {node: process.version, platform: process.platform, arch: process.arch}, base, scope, captures: [], attempts: [], closure: null };
let page;
let snapshot;
let uncertainExecution;
async function take() {
  snapshot = (await call('wg_browser_snapshot', { ...browserBase, ...page })).data;
  const route = snapshot.capture.view.route_template;
  assert(['/categories', '/admin/categories'].includes(route), 'Not a feature route');
  const ingested = await call('wg_ingest', { ...base, request_id: `${runId}_pilot_ingest_${++sequence}`,
    screen_ref: { kind: 'new', name: 'Categories', view_key: route === '/categories' ? 'categories' : 'admin-categories' },
    capture: snapshot.capture });
  assert.equal(ingested.data.coverage, snapshot.capture.coverage.kind);
  if (ingested.data.coverage === 'partial') assert.equal(ingested.data.state_id, null);
  const entry = { ...ingested.data, route, modal_stack: snapshot.capture.view.modal_stack,
    trace_id: snapshot.capture.trace_id, trace_seq: snapshot.capture.trace_seq, captured_at: snapshot.capture.captured_at };
  receipt.captures.push(entry);
  await save();
  const labels = [];
  const visit = (node) => { if (node.name) labels.push({role: node.role, name: node.name}); for (const child of node.children) visit(child); };
  visit(snapshot.capture.tree);
  return { capture: entry, targets: snapshot.targets, labels };
}
async function save() {
  await writeFile(join(root, `pilot-receipt-${runId}.json`), JSON.stringify(receipt, null, 2) + '\n', { mode: 0o600 });
}
async function shutdown() {
  const timedOut = Symbol('timeout');
  let timer;
  const timeout = new Promise((resolve) => { timer = setTimeout(() => resolve(timedOut), 30000); });
  const terminated = await Promise.race([exit, timeout]);
  clearTimeout(timer);
  if (terminated === timedOut) {
    child.kill('SIGTERM');
    const late = await Promise.race([exit, delay(10000).then(() => timedOut)]);
    if (late === timedOut) child.kill('SIGKILL');
    await exit;
    throw new Error('PILOT_SHUTDOWN_UNCONFIRMED');
  }
  return terminated;
}
const emit = (value) => process.stdout.write(JSON.stringify(value) + '\n');
const input = createInterface({ input: process.stdin });
const commands = input[Symbol.asyncIterator]();
try {
await rpc('initialize', { protocolVersion: '2025-11-25', capabilities: {}, clientInfo: { name: 'codex-f03-pilot', version: '1' } });
child.stdin.write('{"jsonrpc":"2.0","method":"notifications/initialized"}\n');
const tools = await rpc('tools/list', {});
assert.equal(tools.tools.length, 13);
emit({ status: 'ready', run_id: runId, tool_count: tools.tools.length });
  for await (const line of commands) {
    try {
      const command = JSON.parse(line);
      if (command.op === 'open') {
        const opened = await call('wg_browser_open', { ...browserBase, request_id: `${runId}_pilot_open_${++sequence}`, scope });
        page = { session_id: opened.data.page.session_id, page_id: opened.data.page.page_id };
        emit({ status: 'opened', manual_navigation_required: true });
      } else if (command.op === 'snapshot') emit(await take());
      else if (command.op === 'act') {
        assert(snapshot && receipt.captures.length && !uncertainExecution);
        const matches = snapshot.targets.filter((target) => target.name === command.name && target.permitted_actions.includes(command.kind));
        assert.equal(matches.length, 1, 'Current target not unique/actionable');
        const action = { ...page, snapshot_id: snapshot.snapshot_id, target_id: matches[0].target_id, kind: command.kind };
        if (command.kind === 'fill') action.text = command.text;
        if (command.kind === 'key') action.key = command.key;
        const execution_id = `${runId}_pilot_execution_${++sequence}`;
        snapshot = null;
        uncertainExecution = execution_id;
        const result = await call('wg_browser_act', { ...browserBase, request_id: `${runId}_pilot_action_${sequence}`, execution_id, action });
        if (['succeeded', 'failed', 'not_started'].includes(result.data.state)) uncertainExecution = null;
        receipt.attempts.push({ ...result.data, before_capture_id: receipt.captures.at(-1).capture_id });
        snapshot = null;
        await save();
        emit({ attempt: result.data });
      } else if (command.op === 'navigate') {
        assert(snapshot && !uncertainExecution);
        assert(['/categories', '/admin/categories'].includes(command.route));
        const snapshot_id = snapshot.snapshot_id;
        const execution_id = `${runId}_pilot_execution_${++sequence}`;
        snapshot = null;
        uncertainExecution = execution_id;
        const result = await call('wg_browser_navigate', { ...browserBase, ...page, snapshot_id, scope,
          request_id: `${runId}_pilot_navigation_${sequence}`, execution_id, url: scope.origin + command.route });
        if (['succeeded', 'failed', 'not_started'].includes(result.data.state)) uncertainExecution = null;
        receipt.attempts.push({ ...result.data, before_capture_id: receipt.captures.at(-1).capture_id });
        snapshot = null;
        await save();
        emit({ attempt: result.data });
      } else if (command.op === 'status') {
        emit({status: (await call('wg_browser_status', {...browserBase, ...(uncertainExecution ? {execution_id: uncertainExecution} : {})})).data});
      } else if (command.op === 'close') {
        receipt.closure = (await call('wg_browser_close', { ...browserBase, session_id: page.session_id, request_id: `${runId}_pilot_close_${++sequence}` })).data;
        await save();
        emit({ closure: receipt.closure });
      } else if (command.op === 'quit') break;
      else throw new Error('INVALID_PILOT_COMMAND');
    } catch (error) { snapshot = null; emit({ error: 'PILOT_COMMAND_FAILED', tool_code: error instanceof PilotToolError ? error.code : null, requires_new_observation: true, uncertain_execution_id: uncertainExecution ?? null }); }
  }
} finally {
  input.close();
  child.stdin.end();
  const terminated = await shutdown();
  output.close();
  assert.deepEqual(terminated, { code: 0, signal: null });
  assert.equal(diagnostics, false);
  emit({ status: 'server_closed', captures: receipt.captures.length, attempts: receipt.attempts.length });
}
