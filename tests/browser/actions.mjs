// Synthetic actual-driver actions and durable replay. No raw observations/input values saved.
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { setTimeout as delay } from 'node:timers/promises';
import { randomUUID } from 'node:crypto';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import console from 'node:console';
import { openBrowser } from '../../dist/browser/engine.js';
import { BrowserDriver } from '../../dist/browser/driver.js';
import { BrowserActions } from '../../dist/browser/actions.js';
import { AttemptJournal } from '../../dist/browser/attempts.js';
import { initializeConfiguration } from '../../dist/config/index.js';
import { Store } from '../../dist/store/database.js';
import { fixtureSettings } from '../fixtures/ui/index.mjs';
let clicks = 0;
const server = createServer((q, r) => {
  if (q.url === '/clicked') {
    clicks++;
    q.resume();
    r.end();
    return;
  }
  r.setHeader('Content-Type', 'text/html');
  r.end(
    `<!doctype html><h1>Members</h1><button onclick="fetch('/clicked')">Save</button><label>Name<input autocomplete="off"></label><label>Password<input type="password"></label><label>Email<input autocomplete="username"></label><label>Username<input autocomplete="off"></label><label>One-time code<input autocomplete="off"></label><label>Billing name<input autocomplete="cc-name"></label><label>Search<input placeholder="Enter PIN" autocomplete="off"></label><label>Enabled<input type="checkbox"></label><label>Category<select><option>General</option><option>Security</option><optgroup disabled label="Disabled"><option>Pending</option></optgroup></select></label><button onclick="fetch('/clicked');const end=Date.now()+10000;while(Date.now()&lt;end){}">Slow</button><div style="height:2500px"></div>`,
  );
});
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const origin = `http://127.0.0.1:${server.address().port}`;
const root = await mkdtemp('/private/tmp/waygrain-c04-');
let owned, store;
try {
  const settings = fixtureSettings();
  const s = settings.apps[0];
  s.allowed_origins = [origin];
  for (const x of [...s.scopes, ...s.route_mappings]) x.origin = origin;
  s.redaction_profiles[0].allowed_labels.push(
    'Name',
    'Enabled',
    'Category',
    'Username',
    'One-time code',
    'Billing name',
    'Search',
    'Slow',
    'Disabled',
  );
  const config = join(root, 'private/config.json');
  await initializeConfiguration(config, settings);
  store = await Store.open(config);
  const app = store.location.configuration.apps[0];
  const { alias, ...scope } = app.scopes[0];
  assert(alias);
  const binding = { session_id: randomUUID(), page_id: randomUUID(), scope };
  owned = await openBrowser(binding, () => {});
  await owned.page.goto(origin + '/members');
  const driver = new BrowserDriver(owned.page, app, binding),
    actions = new BrowserActions(driver),
    journal = new AttemptJournal(store, app.app_id);
  let snapshot,
    seq = 0;
  const take = async () => {
    snapshot = await driver.snapshot();
    await actions.decorate(snapshot);
    return snapshot;
  };
  const request = (name, kind, extra = {}) => {
    const target = snapshot.targets.find((t) => t.name === name);
    assert(target);
    return {
      schema_version: 1,
      browser_schema_version: 1,
      project_id: store.location.configuration.project_id,
      app_id: app.app_id,
      request_id: 'request_' + seq,
      execution_id: 'execution_' + seq++,
      action: {
        session_id: binding.session_id,
        page_id: binding.page_id,
        snapshot_id: snapshot.snapshot_id,
        target_id: target.target_id,
        kind,
        ...extra,
      },
    };
  };
  const run = async (q) => {
    const metadata =
      q.action.kind === 'fill'
        ? {
            kind: 'fill',
            session_id: q.action.session_id,
            page_id: q.action.page_id,
            snapshot_id: q.action.snapshot_id,
            target_id: q.action.target_id,
          }
        : q.action;
    const replay = journal.replay(q.execution_id, 'wg_browser_act', metadata);
    if (replay) return replay;
    const marker = await actions.prepare(q);
    journal.reserve(q.request_id, 'wg_browser_act', metadata, marker);
    const result = await actions.act(q.execution_id);
    journal.finish(q.request_id, result);
    return result;
  };
  await take();
  assert(
    snapshot.targets
      .find((t) => t.name === 'Name')
      .permitted_actions.includes('fill'),
  );
  for (const label of [
    'Password',
    'Email',
    'Username',
    'One-time code',
    'Billing name',
    'Search',
  ]) {
    assert.deepEqual(
      snapshot.targets.find((t) => t.name === label).permitted_actions,
      [],
    );
    await assert.rejects(
      actions.prepare(
        request(label, 'fill', { text: 'SYNTHETIC_CREDENTIAL_NEVER_DISPATCH' }),
      ),
      { code: 'CREDENTIAL_FIELD' },
    );
  }
  const fill = request('Name', 'fill', {
    text: 'SYNTHETIC_NONCREDENTIAL_INPUT_NEVER_RETAIN',
  });
  assert.equal((await run(fill)).state, 'succeeded');
  assert.equal(
    (
      await run({
        ...fill,
        action: {
          ...fill.action,
          text: 'SYNTHETIC_CHANGED_INPUT_NEVER_RETAIN',
        },
      })
    ).state,
    'succeeded',
  );
  await take();
  const response = owned.page.waitForResponse(
    (r) => r.url() === origin + '/clicked',
    { timeout: 5000 },
  );
  const click = request('Save', 'click');
  assert.equal((await run(click)).state, 'succeeded');
  await response;
  const count = clicks;
  assert.equal((await run(click)).state, 'succeeded');
  assert.equal(clicks, count);
  assert.equal(clicks, 1);
  await take();
  assert.equal((await run(request('Enabled', 'check'))).state, 'succeeded');
  assert(await owned.page.getByLabel('Enabled').isChecked());
  await take();
  assert.equal((await run(request('Enabled', 'uncheck'))).state, 'succeeded');
  assert(!(await owned.page.getByLabel('Enabled').isChecked()));
  await take();
  const category = snapshot.targets.find((t) => t.name === 'Category');
  assert.equal(category.option_ids.length, 2);
  assert(JSON.stringify(snapshot.capture.tree).includes('Security'));
  const staleOption = request('Category', 'select', {
    option_id: category.option_ids[1],
  });
  await owned.page
    .getByLabel('Category')
    .locator('option')
    .nth(1)
    .evaluate(
      (option) =>
        (option.value = 'SYNTHETIC_CHANGED_OPTION_VALUE_NEVER_RETAIN'),
    );
  await assert.rejects(actions.prepare(staleOption), { code: 'STALE_TARGET' });
  await owned.page.goto(origin + '/members');
  await take();
  const staleReplacement = request('Category', 'select', {
    option_id: snapshot.targets.find((t) => t.name === 'Category')
      .option_ids[1],
  });
  await owned.page
    .getByLabel('Category')
    .locator('option')
    .nth(1)
    .evaluate((option) => option.replaceWith(option.cloneNode(true)));
  await assert.rejects(actions.prepare(staleReplacement), {
    code: 'STALE_TARGET',
  });
  await owned.page.goto(origin + '/members');
  await take();
  const freshCategory = snapshot.targets.find((t) => t.name === 'Category');
  assert.equal(
    (
      await run(
        request('Category', 'select', {
          option_id: freshCategory.option_ids[1],
        }),
      )
    ).state,
    'succeeded',
  );
  await take();
  assert.equal(
    (await run(request('Save', 'key', { key: 'Tab' }))).state,
    'succeeded',
  );
  await take();
  assert.equal(
    (await run(request('Save', 'scroll', { axis: 'vertical', delta: 200 })))
      .state,
    'succeeded',
  );
  await take();
  const cancelled = request('Slow', 'click');
  const marker = await actions.prepare(cancelled);
  const meta = cancelled.action;
  journal.reserve(cancelled.request_id, 'wg_browser_act', meta, marker);
  const operation = actions.act(cancelled.execution_id);
  await delay(300);
  await owned.browser.close();
  const uncertain = await operation;
  assert.equal(uncertain.state, 'unknown');
  journal.finish(cancelled.request_id, uncertain);
  assert.equal(
    journal.replay(cancelled.execution_id, 'wg_browser_act', meta).state,
    'unknown',
  );
  const data = JSON.stringify(store.db.prepare('SELECT * FROM receipts').all());
  for (const v of [
    'SYNTHETIC_CREDENTIAL_NEVER_DISPATCH',
    'SYNTHETIC_NONCREDENTIAL_INPUT_NEVER_RETAIN',
    'SYNTHETIC_CHANGED_INPUT_NEVER_RETAIN',
  ])
    assert(!data.includes(v));
  for (const path of [
    store.location.databasePath,
    store.location.databasePath + '-wal',
  ]) {
    const bytes = await readFile(path);
    assert(
      !bytes.includes(
        Buffer.from('SYNTHETIC_NONCREDENTIAL_INPUT_NEVER_RETAIN'),
      ),
    );
  }
  console.log(
    'C04 headed seven-action matrix, credential refusal, consumed snapshots, durable one-effect replay and input-value absence PASS.',
  );
} finally {
  await owned?.browser.close();
  store?.close();
  server.closeAllConnections();
  await new Promise((r) => server.close(r));
  await rm(root, { recursive: true, force: true });
}
