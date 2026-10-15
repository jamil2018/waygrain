// Evaluation-only source/claim/question facade. Production contracts are unchanged.
import { McpServer } from '@modelcontextprotocol/server';
import { StdioServerTransport } from '@modelcontextprotocol/server/stdio';
import { chromium } from 'playwright';
import { z } from 'zod';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { randomUUID, createHash } from 'node:crypto';
import { readFile, writeFile, rename } from 'node:fs/promises';
import { join } from 'node:path';
import process from 'node:process';
import { Buffer } from 'node:buffer';
import { performance } from 'node:perf_hooks';
import { openBrowser } from '../../../dist/browser/engine.js';
import { BrowserDriver } from '../../../dist/browser/driver.js';
import { BrowserActions } from '../../../dist/browser/actions.js';
import {
  initializeConfiguration,
  loadConfiguration,
} from '../../../dist/index.js';
import { sensitive } from '../../../tests/fixtures/ui/index.mjs';
import { corpus, variants } from './corpus.mjs';
import { ownerReply } from './owner.mjs';
import { limits } from './protocol.mjs';
import { settings, html, facts } from './fixture.mjs';
const root = process.argv[2],
  options = JSON.parse(await readFile(join(root, 'options.json'), 'utf8'));
const sourceRows = [...corpus(options.world), ...(options.shared ?? [])],
  exposed = new Set();
const receipt = {
  tool_calls: [],
  exposures: [],
  owner_replies: [],
  observations: [],
  actions: [],
  browser_calls: 0,
  knowledge_calls: 0,
  packet_reads: [],
  headless_detected: null,
  cleanup: null,
  error: null,
  shared_sha256: createHash('sha256')
    .update(JSON.stringify(options.shared ?? []))
    .digest('hex'),
};
const began = performance.now();
async function flush() {
  await writeFile(join(root, 'receipt.next'), JSON.stringify(receipt), {
    mode: 0o600,
  });
  await rename(join(root, 'receipt.next'), join(root, 'receipt.json'));
}
const safe = (value) => {
  if (Object.values(sensitive).some((s) => JSON.stringify(value).includes(s)))
    throw new Error('privacy_failed');
  return value;
};
const launch = chromium.launch.bind(chromium);
chromium.launch = (opts) =>
  launch({
    ...opts,
    headless: true,
    handleSIGTERM: false,
    handleSIGINT: false,
  });
let selected = { screen: 'home', role: 'admin' },
  owned,
  driver,
  actions,
  binding,
  latest;
const http = createServer((_q, r) => {
  r.setHeader('Content-Type', 'text/html');
  r.end(html({ ...selected, ...variants[options.world] }));
});
http.listen(0, '127.0.0.1');
await once(http, 'listening');
const origin = `http://127.0.0.1:${http.address().port}`,
  config = join(root, 'private/config.json');
await initializeConfiguration(config, settings(origin));
const app = (await loadConfiguration(config)).configuration.apps[0];
const scope = (role) => {
  const { alias: _alias, ...s } = app.scopes.find(
    (s) => s.role === role && s.environment === 'staging',
  );
  void _alias;
  return s;
};
async function navigate(screen, role) {
  if (!owned) {
    binding = {
      session_id: randomUUID(),
      page_id: randomUUID(),
      scope: scope(role),
    };
    owned = await openBrowser(binding, () => {});
    receipt.headless_detected = await owned.page.evaluate(() =>
      globalThis.navigator.userAgent.includes('HeadlessChrome'),
    );
    if (!receipt.headless_detected) throw new Error('headless_not_detected');
    receipt.browser_calls++;
  }
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
function expose(rows, tool) {
  safe(rows);
  for (const row of rows) exposed.add(row.id);
  receipt.exposures.push({ tool, rows });
  return { records: rows };
}
async function snapshot() {
  if (!driver) await navigate('home', 'admin');
  const s = await driver.snapshot();
  await actions.decorate(s);
  safe(s.capture);
  latest = s;
  receipt.browser_calls++;
  const row = {
    id: 'obs_' + options.session_id + '_' + (receipt.observations.length + 1),
    kind: 'observation',
    observed_at: s.capture.captured_at,
    scope: s.capture.scope,
    coverage: s.capture.coverage.kind,
    facts: facts(s.capture),
  };
  receipt.observations.push(row);
  sourceRows.push(row);
  expose([row], 'browser_snapshot');
  // Only reduced facts and transient targets leave this adapter; raw snapshots never persist.
  return { ...row, snapshot_id: s.snapshot_id, targets: s.targets };
}
const definitions = {
  source_list: {
    schema: z.strictObject({}),
    description:
      'List source IDs/titles/kinds only. Listing is not supporting content evidence.',
    run: () => ({
      records: sourceRows.map(({ id, title, kind }) => ({ id, title, kind })),
    }),
  },
  source_search: {
    schema: z.strictObject({ term: z.string().max(120) }),
    description:
      'Search original messy documents, acquired simulated owner replies and reduced observations. Empty term returns all. Returns full numbered documentary lines and metadata.',
    run: (q) => {
      receipt.knowledge_calls++;
      const terms = q.term.toLowerCase().split(/\s+/).filter(Boolean);
      return expose(
        sourceRows
          .filter(
            (r) =>
              !terms.length ||
              terms.some((t) => JSON.stringify(r).toLowerCase().includes(t)),
          )
          .map(numbered),
        'source_search',
      );
    },
  },
  source_read: {
    schema: z.strictObject({ id: z.string().max(90) }),
    description:
      'Read exactly one allowlisted source ID; no paths or arbitrary files.',
    run: (q) => {
      receipt.knowledge_calls++;
      const row = sourceRows.find((r) => r.id === q.id);
      if (!row) throw new Error('unknown_evidence');
      return expose([numbered(row)], 'source_read');
    },
  },
  ask_owner: {
    schema: z.strictObject({
      question: z.string().max(800),
      evidence_ids: z.array(z.string().max(90)).min(1).max(10),
    }),
    description:
      'Ask a focused scripted synthetic owner question about a material product-policy gap. Cite actually returned relevant evidence. Reports are attributed simulations, not runtime proof.',
    run: (q) => {
      receipt.knowledge_calls++;
      const refs = q.evidence_ids.map((r) => r.split('#')[0]);
      const reply = ownerReply(options.world, q.question, refs, exposed);
      const row = {
        id:
          'owner_' +
          options.session_id +
          '_' +
          (receipt.owner_replies.length + 1),
        kind: 'human_reported',
        simulated: true,
        reported_at: new Date().toISOString(),
        question: q.question,
        evidence_ids: refs,
        ...reply,
      };
      receipt.owner_replies.push(row);
      sourceRows.push(row);
      return expose([row], 'ask_owner');
    },
  },
  browser_navigate: {
    schema: z.strictObject({
      screen: z.enum(['home', 'members', 'settings', 'detail']),
      role: z.enum(['admin', 'viewer']),
    }),
    description:
      'Navigate isolated synthetic current UI. Snapshot separately for evidence.',
    run: async (q) => {
      await navigate(q.screen, q.role);
      return { navigated: true };
    },
  },
  browser_snapshot: {
    schema: z.strictObject({}),
    description:
      'Observe reduced safe UI facts with fresh transient click targets. Never backend proof.',
    run: snapshot,
  },
  browser_click: {
    schema: z.strictObject({
      snapshot_id: z.string().max(80),
      target_id: z.string().max(80),
    }),
    description:
      'Only fresh invitation open/cancel and tabs are permitted; no Save/Remove/typing.',
    run: async (q) => {
      const name =
        latest?.targets.find((t) => t.target_id === q.target_id)?.name ?? null;
      const record = {
        name,
        role: selected.role,
        screen: selected.screen,
        state: 'not_started',
        dispatch: 'not_dispatched',
        error: null,
      };
      receipt.actions.push(record);
      receipt.browser_calls++;
      if (
        !['Invite', 'Invite member', 'Cancel', 'Active', 'Pending'].includes(
          name,
        )
      ) {
        record.error = 'action_not_allowed';
        throw new Error('action_not_allowed');
      }
      try {
        const request = {
          execution_id: randomUUID(),
          action: { ...binding, ...q, kind: 'click' },
        };
        const marker = await actions.prepare(request);
        await writeFile(join(root, 'attempt.json'), JSON.stringify(marker), {
          mode: 0o600,
        });
        const result = await actions.act(request.execution_id);
        Object.assign(record, {
          state: result.state,
          dispatch: result.dispatch,
          error: result.error_code,
        });
        return result;
      } catch (e) {
        record.error = e.code ?? 'action_refused';
        throw e;
      }
    },
  },
};
function numbered(row) {
  return row.kind === 'document'
    ? { ...row, lines: row.lines.map((text, i) => ({ line: i + 1, text })) }
    : row;
}
if (options.condition === 'organized')
  definitions.knowledge_search = {
    schema: z.strictObject({ term: z.string().max(120) }),
    description:
      'Read investigator-authored organized packet, citations, applicability/conflicts/open questions. Not independent truth; follow original evidence pointers. Empty term returns entire packet.',
    run: (q) => {
      receipt.knowledge_calls++;
      if (!options.packet) return { status: 'unavailable_packet' };
      const words = q.term.toLowerCase().split(/\s+/).filter(Boolean);
      const claims = options.packet.claims.filter(
        (c) =>
          !words.length ||
          words.some((w) => JSON.stringify(c).toLowerCase().includes(w)),
      );
      const rows = claims.map((c) => ({
        ...c,
        id: 'packet_' + c.id,
        kind: 'agent_packet_claim',
      }));
      expose(rows, 'knowledge_search');
      const result = {
        summary: options.packet.summary,
        claims: rows,
        open_questions: options.packet.open_questions,
        source_map: options.packet.source_map,
        provenance_notice:
          'Agent interpretation; original investigator exposure must support claimed provenance.',
      };
      receipt.packet_reads.push(result);
      return result;
    },
  };
let closing = false;
async function close() {
  if (closing) return;
  closing = true;
  receipt.cleanup = {};
  for (const [name, fn] of [
    ['driver', () => driver?.invalidate()],
    ['context', () => owned?.context.close()],
    ['browser', () => owned?.browser.close()],
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
  const d = definitions[req.params.name],
    record = {
      tool: d ? req.params.name : 'unknown_tool',
      ms: 0,
      error: null,
      response_bytes: null,
    };
  receipt.tool_calls.push(record);
  const began = performance.now();
  let value;
  try {
    if (!d || receipt.tool_calls.length > limits.tools)
      throw new Error('tool_budget');
    value = safe(await d.run(d.schema.parse(req.params.arguments ?? {})));
  } catch (e) {
    const allowed = [
      'STALE_TARGET',
      'AMBIGUOUS_TARGET',
      'ACTION_NOT_ALLOWED',
      'privacy_failed',
      'unknown_evidence',
      'tool_budget',
      'action_not_allowed',
    ];
    record.error = allowed.includes(e.code ?? e.message)
      ? (e.code ?? e.message)
      : 'tool_failed';
    value = { error: record.error };
  }
  record.ms = performance.now() - began;
  record.response_bytes = Buffer.byteLength(JSON.stringify(value));
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
