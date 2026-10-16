/* global fetch, URL */
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import {
  descriptorFixture,
  fixtureTargets,
  fixtureScopes,
  fixtureAccess,
} from '../../dist/descriptor/fixture.js';
import { contentHash } from '../../dist/descriptor/contracts.js';
import { writeBundle, readBundle } from '../../dist/descriptor/store.js';
import { prepareClarification } from '../../dist/descriptor/providers/evidence.js';
import { executeProvider } from '../../dist/descriptor/providers/validation.js';
import {
  deterministicProvider,
  DETERMINISTIC_LABEL,
} from '../../dist/descriptor/providers/deterministic.js';
import { storageFixture } from '../fixtures/storage.mjs';
test('W16 frozen offline question matrix preserves scope, evidence, conflicts and freshness without network or store actions', async (t) => {
  const f = await storageFixture(t),
    bundle = await descriptorFixture(f.base.project_id, f.base.app_id);
  writeBundle(f.store, { schema_version: 1, expected_revision: 0, bundle });
  const matrix = JSON.parse(
    await readFile(new URL('./provider-cases.json', import.meta.url), 'utf8'),
  );
  const originalFetch = fetch;
  let outbound = 0;
  globalThis.fetch = () => {
    outbound++;
    throw new Error('NETWORK_FORBIDDEN');
  };
  t.after(() => {
    globalThis.fetch = originalFetch;
  });
  for (const item of matrix) {
    const scope = fixtureScopes()[item.scope],
      request = {
        ...f.base,
        scope,
        target_id: fixtureTargets.calculate,
        page_id: fixtureTargets.page,
        conversation_id: randomUUID(),
        question: item.question,
      };
    const basis = item.basis
      ? {
          conversation_id: request.conversation_id,
          project_id: request.project_id,
          app_id: request.app_id,
          target_id: request.target_id,
          page_id: request.page_id,
          scope,
          unit_price: '10',
        }
      : undefined;
    const prepared = prepareClarification(
        f.store,
        fixtureAccess(f.base.project_id, f.base.app_id, scope),
        request,
        basis,
      ),
      answer = await executeProvider(prepared, deterministicProvider());
    assert.equal(answer.status, item.status, item.name);
    if (item.contains) assert(answer.text.includes(item.contains), item.name);
    if (item.missing) assert(answer.missing.includes(item.missing), item.name);
    if (item.warning) assert(answer.warnings.includes(item.warning), item.name);
    assert.deepEqual(answer.scope, scope);
    assert.equal(answer.provider_label, DETERMINISTIC_LABEL);
    for (const citation of answer.citations)
      assert(
        prepared.evidence.sources.some(
          (s) =>
            s.id === citation.source_id &&
            s.revision_id === citation.source_revision_id,
        ),
      );
    if (item.status === 'conflict') assert(answer.citations.length >= 2);
    if (item.status === 'supported') assert(answer.citations.length > 0);
  }
  assert.equal(outbound, 0);
  assert.equal(f.store.revision, 1);
  assert.deepEqual(readBundle(f.store, bundle.app_id), bundle);
});
test('W16 altered or merely inferred rule evidence cannot establish an unsupported fixture formula', async (t) => {
  for (const mode of ['changed-rule', 'inferred-only']) {
    const f = await storageFixture(t),
      bundle = await descriptorFixture(f.base.project_id, f.base.app_id);
    if (mode === 'changed-rule') {
      for (const source of bundle.sources.filter(
        (s) => s.kind === 'document',
      )) {
        source.excerpt = source.excerpt.replaceAll('10%', '20%');
        source.content_hash = contentHash(source.excerpt);
      }
      for (const claim of bundle.claims) {
        claim.text = claim.text.replaceAll('10%', '20%');
        for (const ref of claim.sources)
          ref.content_hash = bundle.sources.find(
            (s) => s.id === ref.source_id,
          ).content_hash;
      }
    } else
      for (const claim of bundle.claims) {
        claim.evidence_class = 'inferred';
        claim.verification = null;
      }
    writeBundle(f.store, { schema_version: 1, expected_revision: 0, bundle });
    const scope = fixtureScopes()[0],
      request = {
        ...f.base,
        scope,
        target_id: fixtureTargets.calculate,
        page_id: fixtureTargets.page,
        conversation_id: randomUUID(),
        question: 'Why is the total 90 for 10 items at 10 each?',
      };
    const answer = await executeProvider(
      prepareClarification(
        f.store,
        fixtureAccess(f.base.project_id, f.base.app_id, scope),
        request,
      ),
      deterministicProvider(),
    );
    assert.equal(answer.status, 'unknown');
    assert(answer.missing.includes('QUALIFIED_FIXTURE_RULE'));
    assert.equal(answer.citations.length, 0);
    assert.equal(f.store.revision, 1);
  }
});
