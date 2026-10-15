import assert from 'node:assert/strict';
import { URL } from 'node:url';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { calculate } from '../../assets/descriptor-demo/calculate.mjs';
import {
  descriptorFixture,
  fixtureTargets,
  fixtureScope,
  fixtureAccess,
} from '../../dist/descriptor/fixture.js';
import { contentHash } from '../../dist/descriptor/contracts.js';
import { writeBundle, readBundle } from '../../dist/descriptor/store.js';
import { retrieveDescriptor } from '../../dist/descriptor/retrieval.js';
import { Store } from '../../dist/index.js';
import { storageFixture } from '../fixtures/storage.mjs';
test('W04 synthetic calculation boundaries, decimal half-up rounding and validation', () => {
  for (const [q, p, total, discounted] of [
    [10, 10, '90.00', true],
    [9, 10, '90.00', false],
    [3, '0.335', '1.01', false],
    [1, '1.005', '1.01', false],
    [10, '0.335', '3.02', true],
    [0, 10, '0.00', false],
    [10000, 1000000, '9000000000.00', true],
  ])
    assert.deepEqual(calculate(q, p), { total, discounted });
  for (const [q, p] of [
    [-1, 1],
    [1.5, 1],
    ['NaN', 1],
    [10001, 1],
    [1, -1],
    [1, '1.00001'],
    [1, '1e3'],
    [1, 1000001],
    ['', 10],
  ])
    assert.throws(() => calculate(q, p));
});
test('W04 persisted fixture retains four classes and exact supplied source revision/method across restart', async (t) => {
  const f = await storageFixture(t),
    bundle = await descriptorFixture(f.base.project_id, f.base.app_id);
  writeBundle(f.store, { schema_version: 1, expected_revision: 0, bundle });
  const request = {
    ...f.base,
    target_id: fixtureTargets.calculate,
    scope: fixtureScope,
  };
  const context = fixtureAccess(f.base.project_id, f.base.app_id, fixtureScope);
  const result = retrieveDescriptor(f.store, context, request);
  assert.deepEqual(
    [...new Set(result.claims.map((c) => c.evidence_class))].sort(),
    ['code-verified', 'documented', 'inferred', 'observed'],
  );
  const verified = result.claims.find(
    (c) => c.evidence_class === 'code-verified',
  );
  const code = await readFile(
    new URL('../../assets/descriptor-demo/calculate.mjs', import.meta.url),
    'utf8',
  );
  assert.equal(verified.verification.supplied_revision, contentHash(code));
  assert(verified.verification.method.includes('fixture.test.mjs'));
  assert.equal(
    result.sources.find((s) => s.id === verified.sources[0].source_id).excerpt,
    code,
  );
  const before = readBundle(f.store, f.base.app_id);
  f.store.close();
  const reopened = await Store.open(f.configPath);
  t.after(() => reopened.close());
  assert.deepEqual(readBundle(reopened, f.base.app_id), before);
});
test('W04 role/version/tenant/state/unknown fixtures are isolated and negative scenarios are explicit', async (t) => {
  const f = await storageFixture(t),
    b = await descriptorFixture(f.base.project_id, f.base.app_id);
  writeBundle(f.store, { schema_version: 1, expected_revision: 0, bundle: b });
  const scopes = b.claims
    .map((c) => c.scope)
    .filter(
      (s, i, all) =>
        all.findIndex(
          (other) => JSON.stringify(other) === JSON.stringify(s),
        ) === i,
    );
  assert(scopes.some((s) => s.role === 'editor' && s.version === '2'));
  assert(
    scopes.some((s) => s.version === '2' && s.state === 'changed-version'),
  );
  for (const scope of scopes) {
    const context = fixtureAccess(b.project_id, b.app_id, scope);
    const result = retrieveDescriptor(f.store, context, {
      ...f.base,
      target_id: fixtureTargets.calculate,
      scope,
    });
    assert(result.claims.length > 0);
    assert(!result.truncated);
    assert(
      result.sources.every(
        (s) => JSON.stringify(s.scope) === JSON.stringify(scope),
      ),
    );
    assert(
      result.claims.every(
        (c) => JSON.stringify(c.scope) === JSON.stringify(scope),
      ),
    );
    if (scope.state === 'conflict') {
      const conflicts = result.claims.filter((c) => c.conflicts.length);
      assert.equal(conflicts.length, 2);
      assert.equal(
        new Set(conflicts.flatMap((c) => c.sources.map((s) => s.source_id)))
          .size,
        2,
      );
    }
    if (scope.state === 'ambiguous-mapping') {
      const page = retrieveDescriptor(f.store, context, {
        ...f.base,
        target_id: fixtureTargets.page,
        scope,
      });
      assert(
        new Set(page.mappings.map((m) => m.target_key)).size <
          page.mappings.length,
      );
    }
    if (scope.state.includes('mapping'))
      assert(
        result.mappings.every(
          (m) =>
            m.status ===
            (scope.state === 'missing-mapping' ? 'missing' : 'ambiguous'),
        ),
      );
    if (
      scope.state === 'changed-source' ||
      scope.state === 'changed-version' ||
      scope.version === null
    )
      assert(result.claims.every((c) => c.freshness.status === 'needs_review'));
    assert(!result.claims.some((c) => /tax (is|equals) [0-9]/i.test(c.text)));
  }
});
