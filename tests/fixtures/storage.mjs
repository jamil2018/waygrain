import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { initializeConfiguration } from '../../dist/config/index.js';
import { Store } from '../../dist/store/database.js';
import { fixtureSettings, fixtureCapture } from './ui/index.mjs';
export const fixtureNow = Date.parse('2026-10-07T00:00:00Z');
export async function storageFixture(t, settings = fixtureSettings()) {
  const root = await mkdtemp('/private/tmp/waygrain-capture-');
  const configPath = join(root, 'private/config.json');
  await initializeConfiguration(configPath, settings);
  const store = await Store.open(configPath);
  t.after(async () => {
    store.close();
    await rm(root, { recursive: true, force: true });
  });
  const app = store.location.configuration.apps[0];
  const base = {
    schema_version: 1,
    project_id: store.location.configuration.project_id,
    app_id: app.app_id,
  };
  let seq = 0;
  const request = (options = {}, overrides = {}) => ({
    ...base,
    request_id: `request_${++seq}`,
    screen_ref: { kind: 'new', name: 'Members', view_key: 'members' },
    capture: fixtureCapture({ ...options, seq }),
    ...overrides,
  });
  return { root, configPath, store, base, request };
}
