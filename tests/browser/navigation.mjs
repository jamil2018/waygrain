// Live worker driver tests; synthetic fixtures only, no browser artifacts saved.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { randomUUID } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import console from 'node:console';
import { openBrowser } from '../../dist/browser/engine.js';
import { BrowserDriver } from '../../dist/browser/driver.js';
import { AttemptJournal } from '../../dist/browser/attempts.js';
import { initializeConfiguration } from '../../dist/config/index.js';
import { Store } from '../../dist/store/database.js';
import { fixtureSettings } from '../fixtures/ui/index.mjs';
let navigations = 0;
let forbiddenRequests = 0;
const forbidden = createServer((_q, r) => {
  forbiddenRequests++;
  r.end('forbidden');
});
forbidden.listen(0, '127.0.0.1');
await once(forbidden, 'listening');
const server = createServer((q, r) => {
  if (q.url === '/redirect') {
    r.writeHead(302, {
      Location: `http://127.0.0.1:${forbidden.address().port}/outside`,
    });
    r.end();
    return;
  }
  if (q.url === '/same-redirect') {
    r.writeHead(302, { Location: '/members' });
    r.end();
    return;
  }
  if (q.url === '/settings') navigations++;
  r.setHeader('Content-Type', 'text/html');
  r.end('<h1>Members</h1><button>Invite</button>');
});
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const origin = `http://127.0.0.1:${server.address().port}`;
const root = await mkdtemp('/private/tmp/waygrain-c03-');
let owned, store;
try {
  const settings = fixtureSettings();
  const appSettings = settings.apps[0];
  appSettings.allowed_origins = [origin];
  for (const x of [...appSettings.scopes, ...appSettings.route_mappings])
    x.origin = origin;
  const config = join(root, 'private/config.json');
  await initializeConfiguration(config, settings);
  store = await Store.open(config);
  const app = store.location.configuration.apps[0];
  const { alias, ...scope } = app.scopes[0];
  assert(alias);
  const binding = { session_id: randomUUID(), page_id: randomUUID(), scope };
  owned = await openBrowser(binding, () => {});
  // Simulates the required initial human navigation from about:blank.
  await owned.page.goto(origin + '/members');
  const driver = new BrowserDriver(owned.page, app, binding);
  let snapshot = await driver.snapshot();
  let target = snapshot.targets.find((t) => t.name === 'Invite');
  assert(target);
  const resolve = () =>
    driver.resolve(
      binding.session_id,
      binding.page_id,
      snapshot.snapshot_id,
      target.target_id,
    );
  await resolve();
  await owned.page
    .getByRole('button', { name: 'Invite', exact: true })
    .evaluate((n) => n.replaceWith(n.cloneNode(true)));
  await assert.rejects(resolve(), { code: 'STALE_TARGET' });
  snapshot = await driver.snapshot();
  target = snapshot.targets.find((t) => t.name === 'Invite');
  await owned.page
    .getByRole('button', { name: 'Invite', exact: true })
    .evaluate((n) => n.after(n.cloneNode(true)));
  snapshot = await driver.snapshot();
  target = snapshot.targets.find((t) => t.name === 'Invite');
  await assert.rejects(resolve(), { code: 'AMBIGUOUS_TARGET' });
  await owned.page.goto(origin + '/members');
  snapshot = await driver.snapshot();
  target = snapshot.targets.find((t) => t.name === 'Invite');
  await owned.page
    .getByRole('button', { name: 'Invite', exact: true })
    .evaluate((n) => (n.textContent = 'Cancel'));
  await assert.rejects(resolve(), { code: 'STALE_TARGET' });
  snapshot = await driver.snapshot();
  const q = {
    schema_version: 1,
    browser_schema_version: 1,
    project_id: store.location.configuration.project_id,
    app_id: app.app_id,
    request_id: 'navigate',
    execution_id: 'navigation',
    session_id: binding.session_id,
    page_id: binding.page_id,
    snapshot_id: snapshot.snapshot_id,
    scope,
    url: origin + '/settings',
  };
  await assert.rejects(
    driver.prepareNavigation({ ...q, url: 'https://forbidden.test/settings' }),
    { code: 'ORIGIN_NOT_ALLOWED' },
  );
  await assert.rejects(
    driver.prepareNavigation({ ...q, scope: { ...scope, role: 'viewer' } }),
    { code: 'UNKNOWN_SCOPE' },
  );
  const pending = await driver.prepareNavigation(q);
  const journal = new AttemptJournal(store, app.app_id);
  const metadata = {
    session_id: q.session_id,
    page_id: q.page_id,
    snapshot_id: q.snapshot_id,
    scope,
    route: '/settings',
  };
  journal.reserve(q.request_id, 'wg_browser_navigate', metadata, pending);
  assert.equal(journal.read(q.execution_id).state, 'unknown');
  const result = await driver.navigate(q.execution_id);
  journal.finish(q.request_id, result);
  assert.equal(result.state, 'succeeded');
  assert.equal(navigations, 1);
  assert.equal(
    journal.replay(q.execution_id, 'wg_browser_navigate', metadata).state,
    'succeeded',
  );
  assert.equal(navigations, 1);
  await assert.rejects(driver.navigate(q.execution_id), {
    code: 'EXECUTION_CONFLICT',
  });
  await assert.rejects(
    driver.resolve(
      binding.session_id,
      binding.page_id,
      snapshot.snapshot_id,
      target.target_id,
    ),
    { code: 'STALE_TARGET' },
  );
  await owned.page.goto(origin + '/same-redirect');
  assert.equal(owned.page.url(), origin + '/members');
  await owned.page.goto(origin + '/redirect').catch(() => {});
  assert.equal(forbiddenRequests, 0);
  console.log(
    'C03 headed target identity/replacement/ambiguity/change and guarded navigation PASS; durable attempt replay is non-dispatching.',
  );
} finally {
  await owned?.browser.close();
  store?.close();
  forbidden.closeAllConnections();
  await new Promise((r) => forbidden.close(r));
  server.closeAllConnections();
  await new Promise((r) => server.close(r));
  await rm(root, { recursive: true, force: true });
}
