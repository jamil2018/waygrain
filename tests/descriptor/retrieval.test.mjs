import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import {
  retrieveDescriptor,
  inspectSource,
  authorize,
} from '../../dist/descriptor/retrieval.js';
import { writeBundle } from '../../dist/descriptor/store.js';
import {
  DESCRIPTOR_LIMITS,
  contentHash,
} from '../../dist/descriptor/contracts.js';
import { contractFixture, revision } from './contract-fixture.mjs';
import { storageFixture } from '../fixtures/storage.mjs';
async function setup(t, mutate = () => {}) {
  const f = await storageFixture(t),
    b = { ...contractFixture(), ...f.base };
  mutate(b);
  writeBundle(f.store, { schema_version: 1, expected_revision: 0, bundle: b });
  const request = {
    ...f.base,
    target_id: b.targets[1].id,
    scope: b.claims[0].scope,
  };
  const context = {
    principal: 'synthetic-reader',
    author: false,
    grants: [
      { project_id: b.project_id, app_id: b.app_id, scope: request.scope },
    ],
  };
  return { ...f, b, request, context };
}
test('W03 all trusted scope dimensions gate content before projection; caller role never grants access', async (t) => {
  const f = await setup(t),
    before = f.store.revision;
  const allowed = retrieveDescriptor(f.store, f.context, f.request);
  assert.equal(allowed.claims[0].text, f.b.claims[0].text);
  assert.deepEqual(
    inspectSource(f.store, f.context, f.request, f.b.sources[0].id),
    f.b.sources[0],
  );
  for (const dimension of [
    'environment',
    'version',
    'role',
    'tenant',
    'state',
  ]) {
    for (const value of ['different', null]) {
      const request = {
        ...f.request,
        scope: { ...f.request.scope, [dimension]: value },
      };
      assert.throws(() => retrieveDescriptor(f.store, f.context, request), {
        code: 'ACCESS_DENIED',
      });
    }
  }
  for (const dimension of ['project_id', 'app_id']) {
    assert.throws(
      () =>
        retrieveDescriptor(f.store, f.context, {
          ...f.request,
          [dimension]: randomUUID(),
        }),
      { code: 'ACCESS_DENIED' },
    );
  }
  assert.throws(
    () =>
      retrieveDescriptor(f.store, f.context, { ...f.request, role: 'admin' }),
    { code: 'INVALID_INPUT' },
  );
  assert.throws(() => authorize(f.context, f.request, true), {
    code: 'ACCESS_DENIED',
  });
  assert.throws(
    () => inspectSource(f.store, f.context, f.request, randomUUID()),
    { code: 'NOT_FOUND' },
  );
  assert.equal(f.store.revision, before);
  assert.deepEqual(retrieveDescriptor(f.store, f.context, f.request), allowed);
});
test('W03 applicability and authorization are distinct; unknown role returns only explicit unknown records', async (t) => {
  const sentinel = 'RESTRICTED_ADMIN_SENTINEL';
  const f = await setup(t, (b) => {
    b.documents[0].summary = sentinel;
    b.sources[0].title = sentinel;
    b.sources[0].origin = sentinel;
    b.targets[1].key = sentinel;
  });
  const unknown = { ...f.request.scope, role: null };
  const context = {
    ...f.context,
    grants: [{ ...f.context.grants[0], scope: unknown }],
  };
  const result = retrieveDescriptor(f.store, context, {
    ...f.request,
    scope: unknown,
  });
  assert(!JSON.stringify(result).includes(sentinel));
  assert.equal(result.claims.length, 0);
  assert.equal(result.sources.length, 0);
  assert(result.missing.includes('APPLICABLE_CLAIMS_MISSING'));
  assert.throws(
    () =>
      inspectSource(
        f.store,
        context,
        { ...f.request, scope: unknown },
        f.b.sources[0].id,
      ),
    { code: 'NOT_FOUND' },
  );
});
test('W03 page context includes permitted components; component context includes page facts; class/conflict/freshness preserved', async (t) => {
  const f = await setup(t, (b) => {
    const page = {
      ...b.documents[0],
      id: randomUUID(),
      ...revision(),
      target_id: b.targets[0].id,
      claim_ids: [],
      name: 'Page overview',
    };
    b.documents.push(page);
    const conflict = {
      ...b.claims[0],
      id: randomUUID(),
      ...revision(),
      text: 'Conflicting 20% discount',
      evidence_class: 'inferred',
      freshness: { status: 'needs_review', reasons: ['source changed'] },
      conflicts: [b.claims[0].id],
    };
    b.claims[0].conflicts = [conflict.id];
    b.claims.push(conflict);
  });
  for (const target_id of f.b.targets.map((x) => x.id)) {
    const result = retrieveDescriptor(f.store, f.context, {
      ...f.request,
      target_id,
    });
    assert.equal(result.documents.length, 2);
    assert.equal(result.claims.length, 2);
    assert(
      result.claims.some(
        (c) =>
          c.evidence_class === 'inferred' &&
          c.freshness.status === 'needs_review',
      ),
    );
    assert(result.claims.every((c) => c.conflicts.length === 1));
  }
});
test('W03 bounded deterministic selection keeps source closure and reports omissions without reads reverifying', async (t) => {
  const f = await setup(t, (b) => {
    b.sources[0].excerpt = '界'.repeat(5000);
    b.sources[0].content_hash = contentHash(b.sources[0].excerpt);
    b.claims[0].sources[0].content_hash = b.sources[0].content_hash;
    for (let i = 0; i < 40; i++)
      b.claims.push({
        ...b.claims[0],
        id: randomUUID(),
        ...revision(),
        text: `Synthetic claim ${i}`,
      });
  });
  const before = f.b.claims[0].verification;
  const result = retrieveDescriptor(f.store, f.context, f.request);
  assert(result.claims.length <= DESCRIPTOR_LIMITS.claims);
  assert(result.truncated);
  assert(result.omitted.claims > 0);
  assert(result.missing.includes('EVIDENCE_TRUNCATED'));
  assert(
    Buffer.byteLength(JSON.stringify(result)) <=
      DESCRIPTOR_LIMITS.evidenceBytes,
  );
  assert(
    result.claims.every((c) =>
      c.sources.every((s) => result.sources.some((x) => x.id === s.source_id)),
    ),
  );
  assert.deepEqual(result, retrieveDescriptor(f.store, f.context, f.request));
  assert.equal(f.b.claims[0].verification, before);
});
test('W03 a trusted grant for another project cannot read the local store even with same app ID', async (t) => {
  const f = await setup(t),
    project_id = randomUUID();
  const request = { ...f.request, project_id };
  const context = {
    ...f.context,
    grants: [{ ...f.context.grants[0], project_id }],
  };
  assert.throws(() => retrieveDescriptor(f.store, context, request), {
    code: 'ACCESS_DENIED',
  });
});
