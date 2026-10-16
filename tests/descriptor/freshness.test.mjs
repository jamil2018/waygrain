/* global structuredClone */
import assert from 'node:assert/strict';
import test from 'node:test';
import { randomUUID } from 'node:crypto';
import {
  markFreshness,
  freshnessReasons,
  assertFreshness,
} from '../../dist/descriptor/freshness.js';
import { contractFixture, scope } from './contract-fixture.mjs';
import { storageFixture } from '../fixtures/storage.mjs';
import { contentHash } from '../../dist/descriptor/contracts.js';
import {
  writeBundle,
  readBundle,
  bundleHistory,
} from '../../dist/descriptor/store.js';
import { verifyClaim } from '../../dist/descriptor/verification.js';
import {
  retrieveDescriptor,
  inspectSource,
} from '../../dist/descriptor/retrieval.js';
test('W13 source/version/mapping invalidation is scoped; it never advances verification or resolves conflicts', () => {
  const old = contractFixture(),
    base = structuredClone(old),
    claim = old.claims[0];
  base.revision_id = randomUUID();
  base.supersedes_revision_id = old.revision_id;
  assert.deepEqual(markFreshness(old, base), base);
  for (const [change, reason] of [
    [
      (b) => {
        b.sources[0].content_hash = 'f'.repeat(64);
      },
      'Source content changed',
    ],
    [
      (b) => {
        b.claims[0].scope.version = '2';
      },
      'Application version changed',
    ],
    [
      (b) => {
        b.mappings[0].target_key = 'moved-control';
      },
      'Target mapping changed',
    ],
    [
      (b) => {
        b.mappings = [];
      },
      'Target mapping unresolved',
    ],
    [
      (b) => {
        b.claims[0].scope.version = null;
      },
      'Application version unknown',
    ],
  ]) {
    const next = structuredClone(base);
    change(next);
    assert(freshnessReasons(old, next, next.claims[0]).includes(reason));
    const marked = markFreshness(old, next),
      changed = marked.claims[0];
    assert.equal(changed.freshness.status, 'needs_review');
    assert(changed.freshness.reasons.includes(reason));
    assert.equal(changed.supersedes_revision_id, claim.revision_id);
    assert.notEqual(changed.revision_id, claim.revision_id);
    assert.deepEqual(changed.verification, claim.verification);
    assert.deepEqual(changed.conflicts, claim.conflicts);
    assert.equal(changed.unknown, claim.unknown);
    assert.equal(changed.evidence_class, claim.evidence_class);
    assertFreshness(old, marked);
    assert.throws(() => assertFreshness(old, next), { code: 'CONFLICT' });
  }
  const forged = structuredClone(base);
  forged.claims[0].freshness = { status: 'current', reasons: [] };
  assert.throws(() => assertFreshness(old, forged), { code: 'CONFLICT' });
});

test('W13 store enforcement and controlled manual verification preserve old evidence, unknowns and conflicts', async (t) => {
  const f = await storageFixture(t),
    b = {
      ...contractFixture(),
      project_id: f.base.project_id,
      app_id: f.base.app_id,
    };
  const c = b.claims[0],
    s = b.sources[0];
  c.freshness = { status: 'current', reasons: [] };
  c.unknown = true;
  c.verification = {
    at: '2026-10-16T01:00:00Z',
    actor: 'original-author',
    method: 'supplied-source-review',
    scope: { ...scope },
    supplied_revision: null,
  };
  const secondSource = {
    ...structuredClone(s),
    id: randomUUID(),
    revision_id: randomUUID(),
    excerpt: 'Synthetic alternative: 20% discount.',
  };
  secondSource.content_hash = contentHash(secondSource.excerpt);
  const second = {
    ...structuredClone(c),
    id: randomUUID(),
    revision_id: randomUUID(),
    text: secondSource.excerpt,
    sources: [
      {
        source_id: secondSource.id,
        revision_id: secondSource.revision_id,
        content_hash: secondSource.content_hash,
        locator: secondSource.locator,
      },
    ],
    conflicts: [c.id],
  };
  c.conflicts = [second.id];
  b.sources.push(secondSource);
  b.claims.push(second);
  writeBundle(f.store, { schema_version: 1, expected_revision: 0, bundle: b });
  const context = {
    principal: 'scoped-synthetic-author',
    author: true,
    grants: [{ project_id: b.project_id, app_id: b.app_id, scope }],
  };
  const request = {
    schema_version: 1,
    project_id: b.project_id,
    app_id: b.app_id,
    target_id: c.target_id,
    scope,
  };
  const next = structuredClone(b);
  next.supersedes_revision_id = b.revision_id;
  next.revision_id = randomUUID();
  next.sources[0].supersedes_revision_id = s.revision_id;
  next.sources[0].revision_id = randomUUID();
  next.sources[0].excerpt = 'Changed synthetic policy source';
  next.sources[0].content_hash = contentHash(next.sources[0].excerpt);
  next.claims[0].supersedes_revision_id = c.revision_id;
  next.claims[0].revision_id = randomUUID();
  next.claims[0].sources[0] = {
    source_id: s.id,
    revision_id: next.sources[0].revision_id,
    content_hash: next.sources[0].content_hash,
    locator: s.locator,
  };
  assert.throws(
    () =>
      writeBundle(f.store, {
        schema_version: 1,
        expected_revision: 1,
        bundle: next,
      }),
    { code: 'CONFLICT' },
  );
  const marked = markFreshness(b, next);
  writeBundle(f.store, {
    schema_version: 1,
    expected_revision: 1,
    bundle: marked,
  });
  assert.deepEqual(readBundle(f.store, b.app_id).claims[1], second);
  for (let i = 0; i < 3; i++) {
    retrieveDescriptor(f.store, context, request);
    inspectSource(f.store, context, request, s.id);
  }
  assert.equal(f.store.revision, 2);
  assert.deepEqual(
    readBundle(f.store, b.app_id).claims[0].verification,
    c.verification,
  );
  const verify = {
    schema_version: 1,
    expected_revision: 2,
    project_id: b.project_id,
    app_id: b.app_id,
    claim_id: c.id,
    scope,
    method: 'supplied-source-review',
  };
  assert.throws(
    () =>
      verifyClaim(
        f.store,
        context,
        { ...verify, method: 'structural-similarity' },
        '2026-10-17T00:00:00Z',
      ),
    { code: 'INVALID_INPUT' },
  );
  verifyClaim(f.store, context, verify, '2026-10-17T00:00:00Z');
  const verified = readBundle(f.store, b.app_id),
    current = verified.claims[0];
  assert.equal(current.verification.at, '2026-10-17T00:00:00Z');
  assert.equal(current.verification.actor, context.principal);
  assert.equal(current.freshness.status, 'current');
  assert.equal(current.unknown, true);
  assert.deepEqual(current.conflicts, [second.id]);
  assert.equal(current.evidence_class, 'documented');
  assert.deepEqual(bundleHistory(f.store, b.app_id)[0], b);
  const missing = structuredClone(verified);
  missing.revision_id = randomUUID();
  missing.supersedes_revision_id = verified.revision_id;
  missing.mappings[0].target_key = 'unmapped-control';
  const stale = markFreshness(verified, missing);
  writeBundle(f.store, {
    schema_version: 1,
    expected_revision: 3,
    bundle: stale,
  });
  assert.throws(
    () =>
      verifyClaim(
        f.store,
        context,
        { ...verify, expected_revision: 4 },
        '2026-10-18T00:00:00Z',
      ),
    { code: 'CONFLICT' },
  );
  assert.equal(f.store.revision, 4);
});

test('W13 changed supplied code/version retain old verification as stale; explicit review binds the new revision; unknown version refuses', async (t) => {
  const f = await storageFixture(t),
    b = {
      ...contractFixture(),
      project_id: f.base.project_id,
      app_id: f.base.app_id,
    },
    c = b.claims[0],
    s = b.sources[0];
  s.kind = 'code';
  s.supplied_revision = 'supplied-r1';
  s.symbol = 'calculate';
  c.evidence_class = 'code-verified';
  c.freshness = { status: 'current', reasons: [] };
  c.verification = {
    at: '2026-10-16T00:00:00Z',
    actor: 'original',
    method: 'supplied-source-review',
    scope: { ...scope },
    supplied_revision: s.supplied_revision,
  };
  writeBundle(f.store, { schema_version: 1, expected_revision: 0, bundle: b });
  const context = {
    principal: 'reviewer',
    author: true,
    grants: [
      { project_id: b.project_id, app_id: b.app_id, scope },
      {
        project_id: b.project_id,
        app_id: b.app_id,
        scope: { ...scope, version: null },
      },
    ],
  };
  const next = structuredClone(b);
  next.revision_id = randomUUID();
  next.supersedes_revision_id = b.revision_id;
  const source = next.sources[0];
  source.supersedes_revision_id = source.revision_id;
  source.revision_id = randomUUID();
  source.supplied_revision = 'supplied-r2';
  source.excerpt = 'Changed synthetic code supplied for review';
  source.content_hash = contentHash(source.excerpt);
  next.claims[0].supersedes_revision_id = c.revision_id;
  next.claims[0].revision_id = randomUUID();
  next.claims[0].sources[0] = {
    source_id: source.id,
    revision_id: source.revision_id,
    content_hash: source.content_hash,
    locator: source.locator,
  };
  const marked = markFreshness(b, next);
  writeBundle(f.store, {
    schema_version: 1,
    expected_revision: 1,
    bundle: marked,
  });
  assert.deepEqual(
    readBundle(f.store, b.app_id).claims[0].verification,
    c.verification,
  );
  const verify = {
    schema_version: 1,
    expected_revision: 2,
    project_id: b.project_id,
    app_id: b.app_id,
    claim_id: c.id,
    scope,
    method: 'supplied-source-review',
  };
  verifyClaim(f.store, context, verify, '2026-10-17T00:00:00Z');
  const verified = readBundle(f.store, b.app_id);
  assert.equal(
    verified.claims[0].verification.supplied_revision,
    'supplied-r2',
  );
  const unknown = structuredClone(verified);
  unknown.revision_id = randomUUID();
  unknown.supersedes_revision_id = verified.revision_id;
  for (const key of ['sources', 'claims', 'documents'])
    for (const item of unknown[key]) {
      item.supersedes_revision_id = item.revision_id;
      item.revision_id = randomUUID();
      item.scope.version = null;
    }
  for (const mapping of unknown.mappings) mapping.scope.version = null;
  unknown.claims[0].sources[0].revision_id = unknown.sources[0].revision_id;
  const warning = markFreshness(verified, unknown);
  writeBundle(f.store, {
    schema_version: 1,
    expected_revision: 3,
    bundle: warning,
  });
  assert.equal(warning.claims[0].verification.scope.version, '1');
  assert(
    warning.claims[0].freshness.reasons.includes('Application version changed'),
  );
  assert.throws(
    () =>
      verifyClaim(
        f.store,
        context,
        { ...verify, expected_revision: 4, scope: { ...scope, version: null } },
        '2026-10-18T00:00:00Z',
      ),
    { code: 'CONFLICT' },
  );
  assert.equal(f.store.revision, 4);
});
