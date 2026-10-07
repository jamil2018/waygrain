// Synthetic-only live mapper and ingest checks; raw JSON stays in process memory.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { randomUUID } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import console from 'node:console';
import { openBrowser } from '../../dist/browser/engine.js';
import { snapshotPage } from '../../dist/browser/snapshot.js';
import {
  fixtureSettings,
  fixtureHtml,
  sensitive,
} from '../fixtures/ui/index.mjs';
import { initializeConfiguration } from '../../dist/config/index.js';
import { Store } from '../../dist/store/database.js';
import { ingest } from '../../dist/core/ingest.js';
let showPassword = false;
let unsupportedEditing = false;
const server = createServer((_q, r) => {
  r.setHeader('Content-Type', 'text/html');
  if (unsupportedEditing) {
    r.end(
      '<div contenteditable>Invite</div><input type="date"><input type="color">',
    );
    return;
  }
  r.end(
    fixtureHtml({
      screen: 'members',
      role: 'admin',
      environment: 'staging',
      version: 1,
      modal: showPassword,
    }),
  );
});
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const origin = `http://127.0.0.1:${server.address().port}`;
const root = await mkdtemp('/private/tmp/waygrain-c02-');
let owned, store;
try {
  const settings = fixtureSettings();
  settings.apps[0].allowed_origins = [origin];
  for (const s of settings.apps[0].scopes) s.origin = origin;
  for (const r of settings.apps[0].route_mappings) r.origin = origin;
  const path = join(root, 'private/config.json');
  await initializeConfiguration(path, settings);
  store = await Store.open(path);
  const app = store.location.configuration.apps[0];
  const { alias, ...scope } = app.scopes[0];
  assert(alias);
  const binding = { session_id: randomUUID(), page_id: randomUUID(), scope };
  owned = await openBrowser(binding, () => {});
  await owned.page.goto(origin + '/members');
  const a = await snapshotPage(owned.page, app, binding, 'trace', 1);
  for (const v of Object.values(sensitive))
    assert(!JSON.stringify(a).includes(v));
  assert(a.targets.some((t) => t.name === 'Invite'));
  const base = {
    schema_version: 1,
    project_id: store.location.configuration.project_id,
    app_id: app.app_id,
  };
  const before = ingest(store, {
    ...base,
    request_id: 'one',
    screen_ref: { kind: 'new', name: 'Members', view_key: 'members' },
    capture: a.capture,
  });
  const b = await snapshotPage(owned.page, app, binding, 'trace', 2);
  const after = ingest(store, {
    ...base,
    request_id: 'two',
    screen_ref: { kind: 'new', name: 'Members', view_key: 'members' },
    capture: b.capture,
  });
  assert.equal(before.data.state_id, after.data.state_id);
  await owned.page.getByRole('button', { name: 'Invite', exact: true }).click();
  const modal = await snapshotPage(owned.page, app, binding, 'trace', 3);
  for (const v of Object.values(sensitive))
    assert(!JSON.stringify(modal).includes(v));
  assert.equal(modal.capture.coverage.kind, 'complete');
  assert.deepEqual(modal.capture.view.modal_stack, ['invite']);
  showPassword = true;
  await owned.page.goto(origin + '/members');
  const unsupported = await snapshotPage(owned.page, app, binding, 'trace', 4);
  assert.equal(unsupported.capture.coverage.kind, 'partial');
  assert.equal(unsupported.capture.coverage.reason, 'unsupported');
  assert(unsupported.targets.every((t) => t.permitted_actions.length === 0));
  unsupportedEditing = true;
  await owned.page.goto(origin + '/members');
  const editing = await snapshotPage(owned.page, app, binding, 'trace', 5);
  assert.equal(editing.capture.coverage.reason, 'unsupported');
  assert.deepEqual(editing.capture.tree.children, []);
  assert.deepEqual(editing.targets, []);
  console.log(
    'C02 headed public JSON mapping/redaction/ingestion PASS; unsupported state is explicit; no retained raw observations.',
  );
} finally {
  await owned?.browser.close();
  store?.close();
  server.closeAllConnections();
  await new Promise((r) => server.close(r));
  await rm(root, { recursive: true, force: true });
}
