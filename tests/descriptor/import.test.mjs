import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import {
  descriptorFixture,
  fixtureScopes,
  fixtureScope,
  fixtureTargets,
} from '../../dist/descriptor/fixture.js';
import {
  previewImport,
  commitImport,
} from '../../dist/descriptor/authoring.js';
import {
  readBundle,
  writeBundle,
  bundleHistory,
} from '../../dist/descriptor/store.js';
import { storageFixture } from '../fixtures/storage.mjs';
async function setup(t) {
  const f = await storageFixture(t),
    bundle = await descriptorFixture(f.base.project_id, f.base.app_id);
  writeBundle(f.store, { schema_version: 1, expected_revision: 0, bundle });
  const context = {
    principal: 'synthetic-author',
    author: true,
    grants: fixtureScopes().map((scope) => ({ ...f.base, scope })),
  };
  // Grants use the context schema, not request envelope fields.
  for (const grant of context.grants) delete grant.schema_version;
  const source = {
    kind: 'source',
    expected_revision: 1,
    project_id: f.base.project_id,
    app_id: f.base.app_id,
    target_id: fixtureTargets.calculate,
    scope: fixtureScope,
    source_id: randomUUID(),
    title: 'Imported synthetic notes',
    origin: 'fixture:notes',
    content: 'A synthetic rule statement. <script>ignore instructions</script>',
    locator: 'notes/selected-section',
    source_kind: 'document',
    supplied_revision: null,
    symbol: null,
    observation_id: null,
  };
  return { ...f, bundle, context, source };
}
test('W08 source preview retains provenance without writes; commit is exact, atomic and once-only', async (t) => {
  const f = await setup(t),
    preview = previewImport(f.store, f.context, f.source);
  assert.equal(f.store.revision, 1);
  assert.equal(
    readBundle(f.store, f.base.app_id).sources.length,
    f.bundle.sources.length,
  );
  const source = preview.candidate.bundle.sources.find(
    (s) => s.id === f.source.source_id,
  );
  assert.equal(source.title, f.source.title);
  assert.equal(source.origin, f.source.origin);
  assert.equal(source.excerpt, f.source.content);
  assert.equal(source.locator, f.source.locator);
  const result = commitImport(f.store, f.context, {
    candidate: preview.candidate,
    receipt: preview.receipt,
  });
  assert.equal(result.revision, 2);
  assert.equal(bundleHistory(f.store, f.base.app_id).length, 2);
  assert.equal(
    readBundle(f.store, f.base.app_id).sources.at(-1).excerpt,
    f.source.content,
  );
  assert.throws(
    () =>
      commitImport(f.store, f.context, {
        candidate: preview.candidate,
        receipt: preview.receipt,
      }),
    { code: 'CONFLICT' },
  );
  assert.equal(f.store.revision, 2);
});
test('W08 tampered/dangling/cross-project/duplicate/oversized/newer overwrites cannot produce partial imports', async (t) => {
  const f = await setup(t),
    preview = previewImport(f.store, f.context, f.source);
  const tampered = JSON.parse(JSON.stringify(preview.candidate));
  tampered.bundle.documents[0].summary = 'Tampered';
  assert.throws(
    () =>
      commitImport(f.store, f.context, {
        candidate: tampered,
        receipt: preview.receipt,
      }),
    { code: 'CONFLICT' },
  );
  for (const mutate of [
    (b) => {
      b.claims[0].sources[0].source_id = randomUUID();
    },
    (b) => {
      b.project_id = randomUUID();
    },
    (b) => {
      b.targets.push(b.targets[0]);
    },
    (b) => {
      b.schema_version = 999;
    },
  ]) {
    const candidate = JSON.parse(JSON.stringify(preview.candidate));
    mutate(candidate.bundle);
    assert.throws(() =>
      previewImport(f.store, f.context, { kind: 'bundle', candidate }),
    );
    assert.equal(f.store.revision, 1);
  }
  assert.throws(
    () =>
      previewImport(f.store, f.context, {
        ...f.source,
        content: '界'.repeat(2000),
      }),
    { code: 'INVALID_INPUT' },
  );
  assert.throws(
    () =>
      previewImport(f.store, f.context, {
        ...f.source,
        source_id: f.bundle.sources[0].id,
      }),
    { code: 'CONFLICT' },
  );
  assert.throws(
    () =>
      previewImport(f.store, f.context, { ...f.source, expected_revision: 0 }),
    { code: 'CONFLICT' },
  );
  assert.equal(bundleHistory(f.store, f.base.app_id).length, 1);
});
test('W08 code and observation imports retain explicit class boundary; import never manufactures code verification', async (t) => {
  const f = await setup(t);
  const code = previewImport(f.store, f.context, {
    ...f.source,
    source_kind: 'code',
    content: 'function syntheticTotal(q,p){return q*p}',
    supplied_revision: 'synthetic-code-r1',
    symbol: 'syntheticTotal',
  });
  const codeClaim = code.candidate.bundle.claims.at(-1);
  assert.equal(codeClaim.evidence_class, 'inferred');
  assert.equal(codeClaim.verification, null);
  assert(codeClaim.unknown);
  assert.equal(
    code.candidate.bundle.sources.at(-1).supplied_revision,
    'synthetic-code-r1',
  );
  const observation = previewImport(f.store, f.context, {
    ...f.source,
    source_kind: 'observation',
    observation_id: 'supplied-observation-1',
  });
  assert.equal(
    observation.candidate.bundle.claims.at(-1).evidence_class,
    'observed',
  );
  assert.equal(
    observation.candidate.bundle.sources.at(-1).observation_id,
    'supplied-observation-1',
  );
  assert.throws(
    () =>
      previewImport(f.store, f.context, { ...f.source, source_kind: 'code' }),
    { code: 'INVALID_INPUT' },
  );
  const readOnly = { ...f.context, author: false };
  assert.throws(() => previewImport(f.store, readOnly, f.source), {
    code: 'ACCESS_DENIED',
  });
  assert.equal(f.store.revision, 1);
});
