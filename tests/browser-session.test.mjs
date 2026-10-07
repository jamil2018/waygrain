import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';
import process from 'node:process';
import { BrowserSession } from '../dist/browser/session.js';
import { storageFixture } from './fixtures/storage.mjs';

test('C01 closed lifecycle reads never start a worker; invalid scope and foreign sessions fail closed', async (t) => {
  const { store, base } = await storageFixture(t);
  const browser = new BrowserSession(store);
  const request = { ...base, browser_schema_version: 1 };
  assert.equal(
    (await browser.dispatch('wg_browser_status', request)).data.status,
    'closed',
  );
  await assert.rejects(
    browser.dispatch('wg_browser_close', {
      ...request,
      request_id: 'close',
      session_id: randomUUID(),
    }),
    { code: 'SESSION_CLOSED' },
  );
  await assert.rejects(
    browser.dispatch('wg_browser_open', {
      ...request,
      request_id: 'open',
      scope: {
        environment: 'local',
        origin: 'https://forbidden.test',
        role: 'admin',
        account_scope: 'sample',
        locale: 'en',
      },
    }),
    { code: 'UNKNOWN_SCOPE' },
  );
  assert.equal(store.revision, 0);
  await browser.close();
});

test('C01 unavailable explicit browser emits only a safe error and cleans launch scratch', async (t) => {
  const { spawnSync } = await import('node:child_process');
  const { join, resolve } = await import('node:path');
  const { readFile, writeFile, readdir } = await import('node:fs/promises');
  const { root, configPath } = await storageFixture(t);
  const script = join(root, 'missing.mjs');
  await writeFile(
    script,
    `import { Store } from ${JSON.stringify('file://' + resolve('dist/store/database.js'))};
import { BrowserSession } from ${JSON.stringify('file://' + resolve('dist/browser/session.js'))};
const store = await Store.open(${JSON.stringify(configPath)});
const browser = new BrowserSession(store);
const c = store.location.configuration;
const { alias, ...scope } = c.apps[0].scopes[0];
try { await browser.dispatch('wg_browser_open', {schema_version:1,browser_schema_version:1,project_id:c.project_id,app_id:c.apps[0].app_id,request_id:'open',scope}); }
catch (error) { process.stdout.write(error.code); }
finally { await browser.close(); store.close(); }
`,
  );
  const result = spawnSync(process.execPath, [script], {
    encoding: 'utf8',
    timeout: 30000,
    env: {
      ...process.env,
      TMPDIR: root,
      PLAYWRIGHT_BROWSERS_PATH: join(root, 'absent'),
    },
  });
  assert.equal(result.status, 0);
  assert.equal(result.stdout, 'BROWSER_UNAVAILABLE');
  assert.equal(result.stderr, '');
  assert.equal(
    (await readdir(root)).filter((n) => n.startsWith('waygrain-browser-'))
      .length,
    0,
  );
  assert(!(await readFile(script, 'utf8')).includes('SYNTHETIC_SECRET'));
});

test('C01 internal worker refuses standalone invocation without deleting caller temporary storage', async (t) => {
  const { spawnSync } = await import('node:child_process');
  const { resolve } = await import('node:path');
  const { readdir } = await import('node:fs/promises');
  const { root } = await storageFixture(t);
  const before = await readdir(root);
  const result = spawnSync(
    process.execPath,
    [resolve('dist/browser/worker.js')],
    { encoding: 'utf8', timeout: 5000, env: { ...process.env, TMPDIR: root } },
  );
  assert.equal(result.status, 1);
  assert.equal(result.stdout, '');
  assert.equal(result.stderr, '');
  assert.deepEqual(await readdir(root), before);
});
