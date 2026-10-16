import { markFreshness } from '../../dist/descriptor/freshness.js';
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { request as httpRequest } from 'node:http';
import { URL } from 'node:url';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import { startDescriptorService } from '../../dist/descriptor/http/server.js';
import {
  descriptorFixture,
  fixtureTargets,
} from '../../dist/descriptor/fixture.js';
import { writeBundle } from '../../dist/descriptor/store.js';
import { storageFixture } from '../fixtures/storage.mjs';
function request(base, path = '/', method = 'GET', headers = {}, payload = '') {
  return new Promise((resolve, reject) => {
    const url = new URL(path, base);
    const req = httpRequest(url, { method, headers }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () =>
        resolve({
          status: res.statusCode,
          headers: res.headers,
          text: Buffer.concat(chunks).toString('utf8'),
        }),
      );
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}
async function setup(t) {
  const f = await storageFixture(t),
    bundle = await descriptorFixture(f.base.project_id, f.base.app_id);
  writeBundle(f.store, { schema_version: 1, expected_revision: 0, bundle });
  const service = await startDescriptorService(f.store);
  t.after(() => service.close());
  return { ...f, bundle, service };
}
test('W06 loopback service serves only allowlisted assets and denies wrong Host/Origin/role fields', async (t) => {
  const f = await setup(t),
    { readURL, authorURL } = f.service;
  const root = await request(readURL);
  assert.equal(root.status, 200);
  assert(root.text.includes('Calculate an order'));
  assert(
    root.headers['content-security-policy'].includes("frame-ancestors 'none'"),
  );
  const asset = await request(readURL, '/assets/descriptor-demo/calculate.mjs');
  assert.equal(asset.status, 200);
  for (const path of [
    '/.git/config',
    '/src/descriptor/store.ts',
    '/assets/descriptor-demo/../../package.json',
    '/api/bundle',
  ])
    assert.equal((await request(readURL, path)).status, 404);
  assert.equal(
    (await request(readURL, '/', 'GET', { Host: 'evil.example' })).status,
    403,
  );
  assert.equal(
    (
      await request(readURL, '/api/bootstrap', 'GET', {
        Origin: 'https://evil.example',
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await request(readURL, '/api/bootstrap', 'GET', {
        'Sec-Fetch-Site': 'cross-site',
      })
    ).status,
    403,
  );
  assert.equal(
    (await request(readURL, '/api/evidence?role=admin')).status,
    400,
  );
  assert.equal(
    (await request(readURL, '/api/evidence?context=999')).status,
    403,
  );
  assert.equal(
    (await request(readURL, '/api/evidence?context=0&context=1')).status,
    400,
  );
  const evidence = JSON.parse(
    (await request(readURL, `/api/evidence?target=${fixtureTargets.calculate}`))
      .text,
  );
  assert.equal(evidence.scope.role, 'reader');
  assert(evidence.claims.length > 0);
  assert.equal((await request(authorURL, '/api/evidence')).status, 404);
});
test('W06 read endpoint cannot author, author mutations require own Origin/content type and bounded schema', async (t) => {
  const f = await setup(t),
    { readURL, authorURL } = f.service;
  const updated = JSON.parse(JSON.stringify(f.bundle));
  updated.supersedes_revision_id = updated.revision_id;
  updated.revision_id = randomUUID();
  const payload = JSON.stringify({
    schema_version: 1,
    expected_revision: 1,
    bundle: updated,
  });
  const own = { Origin: authorURL, 'Content-Type': 'application/json' };
  assert.equal(
    (
      await request(
        readURL,
        '/api/bundle',
        'POST',
        { Origin: readURL, 'Content-Type': 'application/json' },
        payload,
      )
    ).status,
    404,
  );
  for (const headers of [
    { 'Content-Type': 'application/json' },
    { Origin: readURL, 'Content-Type': 'application/json' },
    { Origin: authorURL, 'Content-Type': 'text/plain' },
  ])
    assert.equal(
      (await request(authorURL, '/api/bundle', 'POST', headers, payload))
        .status,
      403,
    );
  assert.equal(
    (await request(authorURL, '/api/bundle', 'POST', own, '{')).status,
    400,
  );
  const oversized = await request(
    authorURL,
    '/api/bundle',
    'POST',
    own,
    JSON.stringify({ data: 'x'.repeat(1024 * 1024) }),
  );
  assert.equal(oversized.status, 413);
  assert(!oversized.text.includes('xxxx'));
  assert.equal(f.store.revision, 1);
  assert.equal(
    (await request(authorURL, '/api/bundle', 'POST', own, payload)).status,
    200,
  );
  assert.equal(f.store.revision, 2);
  assert.equal(
    (await request(authorURL, '/api/bundle', 'POST', own, payload)).status,
    409,
  );
  const authored = JSON.parse((await request(authorURL, '/api/bundle')).text);
  assert.equal(authored.bundle.revision_id, updated.revision_id);
});
test('W06 imported scope never expands trusted contexts or author read grants', async (t) => {
  const f = await setup(t),
    { authorURL } = f.service;
  const changed = JSON.parse(JSON.stringify(f.bundle));
  changed.supersedes_revision_id = changed.revision_id;
  changed.revision_id = randomUUID();
  for (const e of [
    ...changed.sources,
    ...changed.claims,
    ...changed.documents,
    ...changed.mappings,
  ]) {
    e.scope.role = 'unconfigured-superuser';
    if (e.verification) e.verification.scope.role = 'unconfigured-superuser';
  }
  for (const e of [
    ...changed.sources,
    ...changed.claims,
    ...changed.documents,
  ]) {
    e.supersedes_revision_id = e.revision_id;
    e.revision_id = randomUUID();
  }
  for (const c of changed.claims)
    for (const ref of c.sources)
      ref.revision_id = changed.sources.find(
        (s) => s.id === ref.source_id,
      ).revision_id;
  const result = await request(
    authorURL,
    '/api/bundle',
    'POST',
    { Origin: authorURL, 'Content-Type': 'application/json' },
    JSON.stringify({
      schema_version: 1,
      expected_revision: 1,
      bundle: changed,
    }),
  );
  assert.equal(result.status, 403);
  assert(!result.text.includes('unconfigured-superuser'));
  // Explicit trusted synthetic injection (including changed verification scope)
  // tests the author GET boundary independently of normal author writes.
  writeBundle(
    f.store,
    {
      schema_version: 1,
      expected_revision: 1,
      bundle: markFreshness(f.bundle, changed),
    },
    true,
  );
  const read = await request(authorURL, '/api/bundle');
  assert.equal(read.status, 403);
  assert(!read.text.includes('unconfigured-superuser'));
});
