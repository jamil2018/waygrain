// Explicit headed/process cleanup evidence; no browser content or profiles retained.
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { spawn, fork } from 'node:child_process';
import { once } from 'node:events';
import { setTimeout as delay } from 'node:timers/promises';
import process from 'node:process';
import console from 'node:console';
import { initializeConfiguration } from '../../dist/config/index.js';
import { fixtureSettings } from '../fixtures/ui/index.mjs';

const root = await mkdtemp('/private/tmp/waygrain-c01-');
let child;
try {
  const config = join(root, 'private/config.json');
  await initializeConfiguration(config, fixtureSettings());
  const script = join(root, 'owner.mjs');
  await writeFile(
    script,
    `import { Store } from ${JSON.stringify('file://' + resolve('dist/store/database.js'))};
import { BrowserSession } from ${JSON.stringify('file://' + resolve('dist/browser/session.js'))};
const store = await Store.open(${JSON.stringify(config)});
const browser = new BrowserSession(store);
const c=store.location.configuration; const {alias,...scope}=c.apps[0].scopes[0];
const base={schema_version:1,browser_schema_version:1,project_id:c.project_id,app_id:c.apps[0].app_id};
const req={...base,request_id:'open',scope};
const opened=await browser.dispatch('wg_browser_open',req);
const again=await browser.dispatch('wg_browser_open',req);
if(JSON.stringify(opened)!==JSON.stringify(again))throw Error();
try {await browser.dispatch('wg_browser_open',{...req,request_id:'second'});throw Error();}catch(e){if(e.code!=='CONFLICT')throw e;}
if((await browser.dispatch('wg_browser_status',base)).data.status!=='open')throw Error();
process.send({ready:true});
process.on('message',async()=>{const result=await browser.dispatch('wg_browser_close',{...base,request_id:'close',session_id:opened.data.page.session_id});if(result.data.cleanup!=='complete')throw Error();await browser.close();store.close();process.disconnect();});
`,
  );
  for (const mode of ['normal', 'parent_loss', 'signal']) {
    child = spawn(process.execPath, [script], {
      stdio: ['ignore', 'ignore', 'pipe', 'ipc'],
      env: { ...process.env, TMPDIR: root },
    });
    let diagnostics = '';
    child.stderr.on('data', (c) => (diagnostics += c));
    const exit = once(child, 'exit');
    const ready = await Promise.race([
      once(child, 'message'),
      exit.then(() => {
        throw new Error('Owner exited before browser ready: ' + diagnostics);
      }),
      delay(25000).then(() => {
        throw new Error('Launch timeout');
      }),
    ]);
    assert(ready[0].ready);
    assert.equal(
      (await readdir(root)).filter((n) => n.startsWith('waygrain-browser-'))
        .length,
      1,
    );
    if (mode === 'normal') child.send('close');
    else child.kill(mode === 'parent_loss' ? 'SIGKILL' : 'SIGTERM');
    await exit;
    for (
      let i = 0;
      i < 150 &&
      (await readdir(root)).some((n) => n.startsWith('waygrain-browser-'));
      i++
    )
      await delay(100);
    assert.equal(
      (await readdir(root)).filter((n) => n.startsWith('waygrain-browser-'))
        .length,
      0,
      mode + ' cleanup',
    );
    assert.equal(diagnostics, '');
  }
  for (const milliseconds of [10, 150, 500]) {
    const launchRoot = join(root, 'waygrain-browser-startup-' + milliseconds);
    await mkdir(launchRoot, { mode: 0o700 });
    child = fork(resolve('dist/browser/worker.js'), [], {
      stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
      execArgv: [],
      env: {
        ...process.env,
        TMPDIR: launchRoot,
        TMP: launchRoot,
        TEMP: launchRoot,
        DEBUG: '',
        PWDEBUG: '',
      },
    });
    const exit = once(child, 'exit');
    child.send({
      id: 1,
      command: 'open',
      page: {
        session_id: '00000000-0000-4000-8000-000000000001',
        page_id: '00000000-0000-4000-8000-000000000002',
        scope: {
          environment: 'local',
          origin: 'https://fixture.test',
          role: 'unknown',
          account_scope: 'synthetic',
          locale: 'en',
        },
      },
    });
    await delay(milliseconds);
    child.disconnect();
    assert.deepEqual(await exit, [0, null]);
    await assert.rejects(readdir(launchRoot), { code: 'ENOENT' });
  }
  console.log(
    'C01 headed lifecycle PASS: explicit open/status/replay/conflict/close, signal, killed-parent and three startup-loss cleanup timings; scratch deleted. Manual login not exercised by this harness.',
  );
} finally {
  if (child?.exitCode === null && child?.signalCode === null)
    child.kill('SIGTERM');
  await rm(root, { recursive: true, force: true });
}
