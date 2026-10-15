// Evaluation adapter only: same frozen browser driver in every arm, no product changes.
import { McpServer } from '@modelcontextprotocol/server';
import { chromium } from 'playwright';
import { StdioServerTransport } from '@modelcontextprotocol/server/stdio';
import { z } from 'zod';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { randomUUID } from 'node:crypto';
import {
  readFile,
  writeFile,
  rename,
  mkdir,
  readdir,
  stat,
} from 'node:fs/promises';
import { join } from 'node:path';
import process from 'node:process';
import { performance } from 'node:perf_hooks';
import { openBrowser } from '../../../dist/browser/engine.js';
import { BrowserDriver } from '../../../dist/browser/driver.js';
import { BrowserActions } from '../../../dist/browser/actions.js';
import {
  initializeConfiguration,
  loadConfiguration,
  Store,
  ingest,
  query,
  evidence,
} from '../../../dist/index.js';
import { sensitive } from '../../../tests/fixtures/ui/index.mjs';
import { settings, html, facts } from './fixture.mjs';
import { limits } from './protocol.mjs';
const root = process.argv[2],
  options = JSON.parse(await readFile(join(root, 'options.json'), 'utf8'));
// Isolated evaluation process: preserve frozen engine guards, override only launch mode.
const launch = chromium.launch.bind(chromium);
chromium.launch = (options) => launch({ ...options, headless: true });
const began = performance.now();
const receipt = {
  tool_calls: [],
  observations: [],
  actions: [],
  browser_calls: 0,
  knowledge_calls: 0,
  setup_ms: 0,
  priming_ms: 0,
  retained_bytes: 0,
  cleanup: null,
  error: null,
};
async function flush() {
  await writeFile(join(root, 'receipt.next'), JSON.stringify(receipt), {
    mode: 0o600,
  });
  await rename(join(root, 'receipt.next'), join(root, 'receipt.json'));
}
const safe = (value) => {
  const text = JSON.stringify(value);
  if (Object.values(sensitive).some((v) => text.includes(v)))
    throw new Error('privacy_failed');
  return value;
};
let version = 1,
  selected = { screen: 'home', role: 'admin' },
  owned,
  driver,
  actions,
  store,
  app,
  binding,
  latest;
const captures = new Map(),
  saved = new Map();
const http = createServer((_q, r) => {
  r.setHeader('Content-Type', 'text/html');
  r.end(html({ ...selected, version }));
});
http.listen(0, '127.0.0.1');
await once(http, 'listening');
const origin = `http://127.0.0.1:${http.address().port}`;
const config = join(root, 'private/config.json');
await initializeConfiguration(config, settings(origin));
app = (await loadConfiguration(config)).configuration.apps[0];
if (options.condition === 'waygrain') store = await Store.open(config);
const base = store
  ? {
      schema_version: 1,
      project_id: store.location.configuration.project_id,
      app_id: app.app_id,
    }
  : null;
await mkdir(join(root, 'notes'), { mode: 0o700 });
const scope = (role) => {
  const { alias: _alias, ...s } = app.scopes.find(
    (s) => s.role === role && s.environment === 'staging',
  );
  void _alias;
  return s;
};
async function startBrowser() {
  if (owned) return;
  binding = {
    session_id: randomUUID(),
    page_id: randomUUID(),
    scope: scope('admin'),
  };
  owned = await openBrowser(binding, () => {});
  receipt.headless_detected = await owned.page.evaluate(() =>
    globalThis.navigator.userAgent.includes('HeadlessChrome'),
  );
  if (!receipt.headless_detected) throw new Error('headless_not_detected');
  receipt.browser_calls++;
}
async function navigate(screen, role) {
  await startBrowser();
  await driver?.invalidate();
  selected = { screen, role };
  binding = { ...binding, scope: scope(role) };
  await owned.page.goto(
    origin + (screen === 'detail' ? '/members/fixture' : '/' + screen),
    { timeout: 5000 },
  );
  receipt.browser_calls++;
  driver = new BrowserDriver(owned.page, app, binding);
  actions = new BrowserActions(driver);
  latest = null;
}
async function snapshot(phase = 'task') {
  const s = await driver.snapshot();
  await actions.decorate(s);
  safe(s.capture);
  latest = s;
  receipt.browser_calls++;
  const id = 'obs_' + (receipt.observations.length + 1);
  captures.set(id, s.capture);
  receipt.observations.push({
    id,
    phase,
    captured_at: s.capture.captured_at,
    facts: facts(s.capture),
  });
  return { evidence_id: id, ...s };
}
async function retain(id) {
  const c = captures.get(id);
  if (!c) throw new Error('unknown_evidence');
  if (store) {
    receipt.knowledge_calls++;
    const screen =
      c.view.route_template === '/members/:member'
        ? 'detail'
        : c.view.route_template.slice(1);
    const r = ingest(store, {
      ...base,
      request_id: randomUUID(),
      screen_ref: { kind: 'new', name: screen, view_key: screen },
      capture: c,
    });
    saved.set(r.data.capture_id, c);
    receipt.observations.push({
      id: r.data.capture_id,
      phase: 'retained',
      captured_at: c.captured_at,
      facts: facts(c),
      source_id: id,
    });
    return { id: r.data.capture_id };
  }
  const key = 'note_' + id;
  await writeFile(
    join(root, 'notes', key + '.json'),
    JSON.stringify({ id: key, capture: c }),
    { mode: 0o600 },
  );
  saved.set(key, c);
  receipt.observations.push({
    id: key,
    phase: 'retained',
    captured_at: c.captured_at,
    facts: facts(c),
    source_id: id,
  });
  return { id: key };
}
await navigate('home', 'admin');
receipt.setup_ms = performance.now() - began;
if (options.case !== 'cold') {
  const p = performance.now();
  for (const [screen, role] of [
    ['members', 'admin'],
    ['members', 'viewer'],
    ['settings', 'admin'],
    ['settings', 'viewer'],
    ['detail', 'admin'],
  ]) {
    await navigate(screen, role);
    const s = await snapshot('prime');
    if (options.condition !== 'browser-only') await retain(s.evidence_id);
  }
  receipt.priming_ms = performance.now() - p;
  receipt.priming_browser_calls = receipt.browser_calls - 2;
  receipt.priming_knowledge_calls = receipt.knowledge_calls;
}
if (options.case === 'changed') version = 2;
await navigate('home', 'admin');
// Browser-only gets no retained observations. All models start fresh after identical priming.
const screen = z.enum(['home', 'members', 'settings', 'detail']),
  role = z.enum(['admin', 'viewer']);
const definitions = {
  browser_navigate: {
    schema: z.strictObject({ screen, role }),
    description:
      'Navigate the synthetic UI to a declared screen and role. Returns no observation; snapshot separately.',
    run: async (q) => {
      await navigate(q.screen, q.role);
      return { navigated: true };
    },
  },
  browser_snapshot: {
    schema: z.strictObject({}),
    description:
      'Read sanitized live UI evidence and fresh temporary click targets; never input values.',
    run: () => snapshot(),
  },
  browser_click: {
    schema: z.strictObject({
      snapshot_id: z.string().max(80),
      target_id: z.string().max(80),
    }),
    description:
      'Click a fresh target only when explicitly authorized by the task. Every attempted and dispatched action is scored.',
    run: async (q) => {
      const name =
        latest?.targets.find((t) => t.target_id === q.target_id)?.name ?? null;
      const record = {
        name,
        role: selected.role,
        screen: selected.screen,
        before_evidence:
          receipt.observations.filter((o) => o.phase === 'task').at(-1)?.id ??
          null,
        state: 'not_started',
        dispatch: 'not_dispatched',
        error: null,
      };
      receipt.actions.push(record);
      receipt.browser_calls++;
      try {
        const request = {
          execution_id: randomUUID(),
          action: { ...binding, ...q, kind: 'click' },
        };
        const marker = await actions.prepare(request);
        // Durable sanitized pre-dispatch journal common to all arms; no input values.
        await writeFile(join(root, 'attempt.json'), JSON.stringify(marker), {
          mode: 0o600,
        });
        const result = await actions.act(request.execution_id);
        Object.assign(record, {
          state: result.state,
          dispatch: result.dispatch,
          error: result.error_code,
        });
        await writeFile(join(root, 'attempt.json'), JSON.stringify(result), {
          mode: 0o600,
        });
        return result;
      } catch (e) {
        record.error = e.code ?? 'action_refused';
        throw e;
      }
    },
  },
};
if (options.condition !== 'browser-only') {
  definitions.memory_save = {
    schema: z.strictObject({ evidence_id: z.string().max(80) }),
    description:
      'Retain a sanitized observed capture with timestamp and scope. Returns its persistent ID; executable target IDs are not retained.',
    run: (q) => retain(q.evidence_id),
  };
  definitions.memory_search = {
    schema: z.strictObject({ term: z.string().max(100), role }),
    description:
      'Search historical memory by lexical terms (empty lists all); includes timestamps and scope. Retention alone never establishes current applicability.',
    run: async (q) => {
      safe(q);
      if (store) {
        receipt.knowledge_calls++;
        return query(store, {
          ...base,
          mode: 'search',
          scope: scope(q.role),
          filters: {
            kinds: ['capture'],
            ...(q.term ? { terms: [q.term] } : {}),
          },
          budget: { records: 50, bytes: 60000 },
        });
      }
      const rows = [];
      for (const file of await readdir(join(root, 'notes'))) {
        const n = JSON.parse(await readFile(join(root, 'notes', file), 'utf8'));
        if (n.capture && n.capture.scope.role !== q.role) continue;
        if (
          !q.term ||
          JSON.stringify(n).toLowerCase().includes(q.term.toLowerCase())
        )
          rows.push(n);
      }
      return { records: rows };
    },
  };
  definitions.memory_read = {
    schema: z.strictObject({ id: z.string().max(80) }),
    description: 'Read historical sanitized evidence by persistent ID.',
    run: async (q) => {
      if (store) {
        receipt.knowledge_calls++;
        return evidence(store, {
          ...base,
          ids: [q.id],
          projection: 'structured',
          budget: { records: 50, bytes: 60000 },
        });
      }
      if (!/^note_(obs_\d+|prose_\d+)$/.test(q.id))
        throw new Error('unknown_evidence');
      return JSON.parse(
        await readFile(join(root, 'notes', q.id + '.json'), 'utf8'),
      );
    },
  };
}
if (options.condition === 'notes-folder')
  definitions.notes_write = {
    schema: z.strictObject({
      text: z.string().max(4000),
      evidence_ids: z.array(z.string().max(80)).max(10),
    }),
    description:
      'Write ordinary free-text synthetic notes citing observed IDs. Notes may state uncertainty; they do not create executable targets or verified facts.',
    run: async (q) => {
      safe(q);
      if (q.evidence_ids.some((id) => !captures.has(id) && !saved.has(id)))
        throw new Error('unknown_evidence');
      const id = 'note_prose_' + (receipt.tool_calls.length + 1);
      await writeFile(
        join(root, 'notes', id + '.json'),
        JSON.stringify({ id, ...q, written_at: new Date().toISOString() }),
        { mode: 0o600 },
      );
      return { id };
    },
  };
async function bytes(path) {
  let n = 0;
  for (const e of await readdir(path, { withFileTypes: true })) {
    const p = join(path, e.name);
    n += e.isDirectory() ? await bytes(p) : (await stat(p)).size;
  }
  return n;
}
let closing = false;
async function close() {
  if (closing) return;
  closing = true;
  receipt.cleanup = {};
  try {
    receipt.retained_bytes = store
      ? (await bytes(join(root, 'private'))) - (await stat(config)).size
      : await bytes(join(root, 'notes'));
  } catch {
    receipt.error ??= 'measurement_failed';
  }
  for (const [name, fn] of [
    ['driver', () => driver?.invalidate()],
    ['context', () => owned?.context.close()],
    ['browser', () => owned?.browser.close()],
    ['store', () => store?.close()],
    [
      'server',
      async () => {
        http.closeAllConnections();
        await new Promise((r) => http.close(r));
      },
    ],
  ]) {
    try {
      await fn();
      receipt.cleanup[name] = 'complete';
    } catch {
      receipt.cleanup[name] = 'failed';
      receipt.error ??= 'cleanup_failed';
    }
  }
  if (owned) receipt.browser_calls++;
  receipt.server_total_ms = performance.now() - began;
  await flush();
  process.exit(0);
}
const server = new McpServer({ name: 'study', version: '1.0.0' });
server.server.registerCapabilities({ tools: {} });
server.server.setRequestHandler('tools/list', () => ({
  tools: Object.entries(definitions).map(([name, d]) => ({
    name,
    description: d.description,
    inputSchema: z.toJSONSchema(d.schema),
  })),
}));
server.server.setRequestHandler('tools/call', async (req) => {
  const d = definitions[req.params.name];
  const record = {
    tool: d ? req.params.name : 'unknown_tool',
    ms: 0,
    error: null,
  };
  receipt.tool_calls.push(record);
  const began = performance.now();
  let value;
  try {
    if (!d || receipt.tool_calls.length > limits.tools)
      throw new Error('tool_budget');
    const q = d.schema.parse(req.params.arguments ?? {});
    value = safe(await d.run(q));
  } catch (e) {
    const allowed = [
      'STALE_TARGET',
      'AMBIGUOUS_TARGET',
      'ACTION_NOT_ALLOWED',
      'CREDENTIAL_FIELD',
      'privacy_failed',
      'unknown_evidence',
      'tool_budget',
    ];
    record.error = allowed.includes(e.code ?? e.message)
      ? (e.code ?? e.message)
      : 'tool_failed';
    value = { error: record.error };
  }
  record.ms = performance.now() - began;
  await flush();
  return {
    ...(record.error ? { isError: true } : {}),
    content: [{ type: 'text', text: JSON.stringify(value) }],
  };
});
await flush();
await server.connect(
  new StdioServerTransport(process.stdin, process.stdout, {
    maxMessageSize: 1024 * 1024,
  }),
);
process.stdin.on('end', () => void close());
process.on('SIGTERM', () => void close());
process.on('SIGINT', () => void close());
