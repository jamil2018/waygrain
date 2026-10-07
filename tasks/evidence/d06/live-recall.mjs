// Independent checkpoint: synthetic reviewed labels only; temporary stores removed.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { randomUUID } from 'node:crypto';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync, spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import process from 'node:process';
import console from 'node:console';
import { setTimeout as delay } from 'node:timers/promises';
import { fixtureSettings } from '../../../tests/fixtures/ui/index.mjs';
const packageRoot = resolve(process.env.D06_PACKAGE_DIR ?? '.');
const moduleAt = (p) => import(pathToFileURL(join(packageRoot, 'dist', p)));
const { initializeConfiguration, Store, ingest, commit, query, evidence } =
  await moduleAt('index.js');
for (const value of [ingest, commit, query, evidence])
  assert.equal(typeof value, 'function');
const { openBrowser } = await moduleAt('browser/engine.js');
const { BrowserDriver } = await moduleAt('browser/driver.js');
const { BrowserActions } = await moduleAt('browser/actions.js');
const { AttemptJournal } = await moduleAt('browser/attempts.js');
let owned, store;
let deliveries = 0;
const server = createServer((q, r) => {
  if (q.url === '/dispatch') {
    deliveries++;
    q.resume();
    r.end();
    return;
  }
  r.setHeader('Content-Type', 'text/html');
  r.end(
    `<!doctype html><html lang="en"><title>Fixture</title><body><h1>Members</h1><button onclick="this.disabled=true;fetch('/dispatch')">Save</button><span>SYNTHETIC_UNREVIEWED_NEVER_RETAIN</span></body></html>`,
  );
});
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const root = await mkdtemp('/private/tmp/waygrain-d06-live-');
const origin = `http://127.0.0.1:${server.address().port}`;
const config = join(root, 'private/config.json');
const existing = (id) => ({ kind: 'existing', id });
const local = (client_ref) => ({ kind: 'local', client_ref });
let counter = 0;
try {
  const settings = fixtureSettings();
  const settingsApp = settings.apps[0];
  settingsApp.allowed_origins = [origin];
  for (const x of [...settingsApp.scopes, ...settingsApp.route_mappings])
    x.origin = origin;
  await initializeConfiguration(config, settings);
  store = await Store.open(config);
  const app = store.location.configuration.apps[0];
  const { alias, ...scope } = app.scopes[0];
  assert(alias);
  const base = {
    schema_version: 1,
    project_id: store.location.configuration.project_id,
    app_id: app.app_id,
  };
  const binding = { session_id: randomUUID(), page_id: randomUUID(), scope };
  const started_at = new Date().toISOString();
  owned = await openBrowser(binding, () => {});
  await owned.page.goto(origin + '/members'); // Explicit synthetic initial navigation; no coding-host claim.
  const driver = new BrowserDriver(owned.page, app, binding);
  const actions = new BrowserActions(driver);
  const journal = new AttemptJournal(store, app.app_id);
  const before = await driver.snapshot();
  await actions.decorate(before);
  assert.equal(before.capture.coverage.kind, 'complete');
  assert(!JSON.stringify(before).includes('SYNTHETIC_UNREVIEWED_NEVER_RETAIN'));
  const a = ingest(store, {
    ...base,
    request_id: 'live_before',
    screen_ref: { kind: 'new', name: 'Members', view_key: 'members' },
    capture: before.capture,
  }).data;
  const target = before.targets.find((t) => t.name === 'Save');
  assert(target);
  const q = {
    ...base,
    browser_schema_version: 1,
    request_id: 'live_action',
    execution_id: 'live_execution',
    action: {
      session_id: binding.session_id,
      page_id: binding.page_id,
      snapshot_id: before.snapshot_id,
      target_id: target.target_id,
      kind: 'click',
    },
  };
  const marker = await actions.prepare(q);
  assert.equal(marker.state, 'pending');
  assert.equal(marker.trace_id, before.capture.trace_id);
  assert(marker.trace_seq > before.capture.trace_seq);
  journal.reserve(q.request_id, 'wg_browser_act', q.action, marker);
  assert.equal(deliveries, 0);
  // Fresh connection sees the durable marker before application dispatch.
  const observer = await Store.open(config);
  assert.equal(
    new AttemptJournal(observer, app.app_id).read(q.execution_id).state,
    'unknown',
  );
  observer.close();
  const delivered = owned.page.waitForResponse(
    (r) => r.url() === origin + '/dispatch',
  );
  const receipt = await actions.act(q.execution_id);
  await delivered;
  assert.equal(receipt.state, 'succeeded');
  assert.equal(deliveries, 1);
  assert(await owned.page.getByRole('button', { name: 'Save' }).isDisabled());
  journal.finish(q.request_id, receipt);
  assert.equal(
    journal.replay(q.execution_id, 'wg_browser_act', q.action).state,
    'succeeded',
  );
  assert.equal(deliveries, 1);
  const after = await driver.snapshot();
  assert.equal(after.capture.coverage.kind, 'complete');
  assert(receipt.trace_seq < after.capture.trace_seq);
  assert(
    Date.parse(before.capture.captured_at) <= Date.parse(receipt.occurred_at),
  );
  assert(
    Date.parse(receipt.occurred_at) <= Date.parse(after.capture.captured_at),
  );
  const b = ingest(store, {
    ...base,
    request_id: 'live_after',
    screen_ref: { kind: 'existing', screen_id: a.screen_id },
    capture: after.capture,
  }).data;
  assert.notEqual(a.state_id, b.state_id);
  const control = store.db
    .prepare(
      "SELECT id FROM controls WHERE state_id=? AND json_extract(descriptor_json,'$.name')=?",
    )
    .get(a.state_id, 'Save');
  assert(control);
  const ops = [
    {
      op: 'create_action',
      client_ref: 'action',
      state_id: existing(a.state_id),
      control_id: existing(control.id),
      verb: 'click',
      input_schema: { kind: 'none', required: false },
      preconditions: ['Home'],
    },
    {
      op: 'record_action_event',
      client_ref: 'event',
      event: {
        action_id: local('action'),
        before_capture_id: existing(a.capture_id),
        after_capture_id: existing(b.capture_id),
        trace_id: receipt.trace_id,
        trace_seq: receipt.trace_seq,
        session_id: receipt.session_id,
        tab_id: receipt.page_id,
        scope,
        occurred_at: receipt.occurred_at,
        outcome: 'success',
        error_code: null,
      },
    },
    {
      op: 'create_transition',
      client_ref: 'transition',
      source_state_id: existing(a.state_id),
      action_id: local('action'),
      target_state_id: existing(b.state_id),
      before_capture_id: existing(a.capture_id),
      after_capture_id: existing(b.capture_id),
      action_event_id: local('event'),
      outcome: 'success',
      guards: ['Members'],
      provenance: 'test_verified',
      test_run_id: local('run'),
    },
    {
      op: 'create_flow',
      client_ref: 'flow',
      name: 'Members',
      transition_ids: [local('transition')],
      scope,
    },
    {
      op: 'record_test_run',
      client_ref: 'run',
      run: {
        runner: 'synthetic_runner',
        runner_version: 'v1',
        application_version: 'Members',
        scope,
        started_at,
        finished_at: new Date().toISOString(),
        outcome: 'passed',
        assertions: [
          {
            target_id: local('transition'),
            assertion: 'Members',
            result: 'passed',
            evidence_ids: [local('event')],
          },
          {
            target_id: local('flow'),
            assertion: 'Save',
            result: 'passed',
            evidence_ids: [local('event')],
          },
        ],
      },
    },
    {
      op: 'add_annotation',
      client_ref: 'annotation',
      annotation: {
        target_id: local('flow'),
        kind: 'description',
        value: 'Save',
        author_type: 'agent',
        evidence_ids: [local('event')],
        scope,
        provenance: 'test_verified',
        test_run_id: local('run'),
      },
    },
  ];
  const write = (operations) =>
    commit(store, {
      ...base,
      request_id: 'checkpoint_' + ++counter,
      expected_store_revision: store.revision,
      operations: JSON.parse(JSON.stringify(operations)),
    });
  const revisionBefore = store.revision;
  for (const mutate of [
    (o) => (o[1].event.trace_seq = before.capture.trace_seq),
    (o) =>
      (o[1].event.occurred_at = new Date(
        Date.parse(before.capture.captured_at) - 1,
      ).toISOString()),
    (o) => (o[4].run.assertions[0].result = 'failed'),
    (o) => (o[4].run.assertions[1].evidence_ids = [existing(a.capture_id)]),
  ]) {
    const bad = structuredClone(ops);
    mutate(bad);
    assert.throws(() => write(bad), { code: 'INCOMPATIBLE_CAPTURE' });
    assert.equal(store.revision, revisionBefore);
    assert.equal(
      store.db.prepare('SELECT count(*) n FROM graph_records').get().n,
      0,
    );
  }
  const committed = write(ops);
  const ids = Object.fromEntries(
    committed.data.client_refs.map((r) => [r.client_ref, r.id]),
  );
  const ask = {
    ...base,
    mode: 'path',
    scope,
    source_state_id: a.state_id,
    target_state_id: b.state_id,
    budget: { records: 50, bytes: 60000 },
  };
  const recalled = query(store, ask);
  assert.equal(recalled.data.applicability, 'conditional');
  assert.deepEqual(recalled.data.guards, ['Members', 'Home']);
  assert.equal(recalled.data.status, 'complete');
  assert.equal(
    recalled.data.records.find((r) => r.id === ids.transition).evidence
      .provenance,
    'test_verified',
  );
  assert.equal(
    query(store, {
      ...ask,
      source_state_id: b.state_id,
      target_state_id: a.state_id,
    }).data.status,
    'no_matches',
  );
  assert.equal(
    query(store, { ...ask, max_visited: 1 }).data.status,
    'incomplete',
  );
  for (const bytes of [1, 64, 512, 8192]) {
    let bounded;
    try {
      bounded = query(store, { ...ask, budget: { records: 1, bytes } });
    } catch (e) {
      assert.equal(e.code, 'BUDGET_EXCEEDED');
      continue;
    }
    assert(Buffer.byteLength(JSON.stringify(bounded)) <= bytes);
    assert.equal(bounded.data.status, 'incomplete');
  }
  const small = query(store, { ...ask, budget: { records: 1, bytes: 8192 } });
  assert(small.next_cursor);
  const queriedRevision = store.revision;
  assert.equal(
    evidence(store, {
      ...base,
      ids: [ids.annotation],
      projection: 'structured',
    }).data.items[0].test_run_id,
    ids.run,
  );
  assert.equal(store.revision, queriedRevision);
  const receiptRows = JSON.stringify(
    store.db.prepare('SELECT * FROM receipts').all(),
  );
  assert(!receiptRows.includes('SYNTHETIC_UNREVIEWED_NEVER_RETAIN'));
  for (const path of [
    store.location.databasePath,
    store.location.databasePath + '-wal',
  ])
    assert(
      !(await readFile(path)).includes(
        Buffer.from('SYNTHETIC_UNREVIEWED_NEVER_RETAIN'),
      ),
    );
  await owned.browser.close();
  owned = undefined;
  store.close();
  store = undefined;
  // A truly fresh process reopens the store after browser and writer store close.
  const cli = join(packageRoot, 'dist/cli.js');
  const cliQuery = (input) =>
    JSON.parse(
      execFileSync(process.execPath, [cli, 'query', '--config', config], {
        input: JSON.stringify(input),
        encoding: 'utf8',
      }),
    );
  const cliResult = cliQuery(ask);
  assert.deepEqual(
    cliResult.data.records.map((r) => r.id),
    recalled.data.records.map((r) => r.id),
  );
  assert.equal(cliResult.data.applicability, 'conditional');
  const flowAsk = {
    ...base,
    mode: 'flow',
    scope,
    flow_id: ids.flow,
    budget: { records: 50, bytes: 60000 },
  };
  assert.deepEqual(cliQuery(flowAsk).data.records[0].transition_ids, [
    ids.transition,
  ]);
  const child = spawn(process.execPath, [cli, 'serve', '--config', config], {
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  const lines = createInterface({ input: child.stdout });
  const responses = new Map();
  let diagnostics = '';
  child.stderr.on('data', (b) => (diagnostics += b));
  lines.on('line', (l) => {
    const r = JSON.parse(l);
    responses.set(r.id, r);
  });
  const exited = new Promise((r) => child.once('exit', (code) => r(code)));
  const rpc = async (id, method, params) => {
    child.stdin.write(
      JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n',
    );
    for (let n = 0; n < 500 && !responses.has(id); n++) await delay(10);
    assert(responses.has(id));
    return responses.get(id);
  };
  try {
    assert.equal(
      (
        await rpc(1, 'initialize', {
          protocolVersion: '2025-11-25',
          capabilities: {},
          clientInfo: { name: 'synthetic-d06', version: '1' },
        })
      ).result.serverInfo.name,
      'waygrain',
    );
    child.stdin.write(
      '{"jsonrpc":"2.0","method":"notifications/initialized"}\n',
    );
    const mcp = await rpc(2, 'tools/call', {
      name: 'wg_query',
      arguments: flowAsk,
    });
    assert.equal(
      mcp.result.structuredContent.data.applicability,
      'conditional',
    );
    assert.deepEqual(
      mcp.result.structuredContent.data.records[0].transition_ids,
      [ids.transition],
    );
    child.stdin.end();
    assert.equal(await exited, 0);
    assert.equal(diagnostics, '');
  } finally {
    lines.close();
    if (child.exitCode === null) child.kill('SIGKILL');
    await exited;
  }
  console.log(
    JSON.stringify({
      status: 'live_recall_passed',
      node: process.version,
      packed: Boolean(process.env.D06_PACKAGE_DIR),
      actual_dispatches: deliveries,
      trace: 'actual_browser_generated_sequence_and_times',
      recall: 'fresh_process_CLI_and_MCP_after_browser_store_close',
      privacy: 'sanitized_capture_journal_DB_WAL',
      failed_commits_atomic: 4,
    }),
  );
} finally {
  await owned?.browser.close();
  store?.close();
  server.closeAllConnections();
  await new Promise((r) => server.close(r));
  await rm(root, { recursive: true, force: true });
}
