// In-memory synthetic form entry simulates the human login path. No auth state,
// body, values, snapshots or screenshots are saved or returned by Waygrain.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import console from 'node:console';
import { openBrowser } from '../../dist/browser/engine.js';

let loginCompleted = false;
let forbiddenRequests = 0;
const server = createServer((req, res) => {
  if (req.url === '/login' && req.method === 'POST') {
    req.resume();
    req.on('end', () => {
      loginCompleted = true;
      res.writeHead(302, {
        'Set-Cookie': 'synthetic-session=1; HttpOnly; SameSite=Strict',
        Location: '/',
      });
      res.end();
    });
  } else {
    res.setHeader('Content-Type', 'text/html');
    res.end(
      req.headers.cookie
        ? '<h1>Signed in</h1>'
        : '<h1>Login</h1><form method="post" action="/login"><label>Username<input name="username" autocomplete="username"></label><label>Password<input type="password" name="password" autocomplete="current-password"></label><button>Login</button></form>',
    );
  }
});
const forbidden = createServer((_req, res) => {
  forbiddenRequests++;
  res.end();
});
server.listen(0, '127.0.0.1');
forbidden.listen(0, '127.0.0.1');
await Promise.all([once(server, 'listening'), once(forbidden, 'listening')]);
const origin = `http://127.0.0.1:${server.address().port}`;
const binding = () => ({
  session_id: randomUUID(),
  page_id: randomUUID(),
  scope: {
    environment: 'local',
    origin,
    role: 'unknown',
    account_scope: 'synthetic',
    locale: 'en',
  },
});
let owned;
try {
  owned = await openBrowser(binding(), () => {});
  await owned.page.goto(origin);
  await owned.page.getByLabel('Username').fill('SYNTHETIC_USER');
  await owned.page.getByLabel('Password').fill('SYNTHETIC_PASSWORD');
  await owned.page.getByRole('button', { name: 'Login', exact: true }).click();
  await owned.page.getByRole('heading', { name: 'Signed in' }).waitFor();
  assert(loginCompleted);
  await owned.page
    .goto(`http://127.0.0.1:${forbidden.address().port}`)
    .catch(() => {});
  assert.equal(forbiddenRequests, 0);
  await owned.browser.close();
  owned = await openBrowser(binding(), () => {});
  await owned.page.goto(origin);
  await owned.page
    .getByRole('heading', { name: 'Login', exact: true })
    .waitFor();
  console.log(
    'C01 headed synthetic form login and fresh-context isolation PASS; foreign-origin server received zero requests; no retained login data. This is automated human-path simulation, not host or real-account qualification.',
  );
} finally {
  await owned?.browser.close();
  server.closeAllConnections();
  forbidden.closeAllConnections();
  await Promise.all([
    new Promise((r) => server.close(r)),
    new Promise((r) => forbidden.close(r)),
  ]);
}
