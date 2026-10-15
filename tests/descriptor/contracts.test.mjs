import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import {
  bundleSchema,
  scopeSchema,
  readRequestSchema,
  writeRequestSchema,
  parseDescriptor,
  sameScope,
  contentHash,
} from '../../dist/descriptor/contracts.js';
import { contractFixture } from './contract-fixture.mjs';
const reject = (mutate, schema = bundleSchema) => {
  const b = contractFixture();
  mutate(b);
  assert.throws(() => parseDescriptor(schema, b), { code: 'INVALID_INPUT' });
};
test('W01 semantic identities survive scope/version changes and explicit unknown is not wildcard', () => {
  const b = contractFixture();
  const ids = b.targets.map((t) => t.id);
  assert.deepEqual(
    parseDescriptor(bundleSchema, JSON.parse(JSON.stringify(b))),
    b,
  );
  for (const e of [...b.claims, ...b.sources, ...b.documents, ...b.mappings])
    e.scope.version = null;
  assert.deepEqual(
    parseDescriptor(bundleSchema, b).targets.map((t) => t.id),
    ids,
  );
  const unknown = { ...b.claims[0].scope, role: null };
  assert(!sameScope(unknown, b.claims[0].scope));
  assert(scopeSchema.safeParse(unknown).success);
  reject((x) => {
    delete x.claims[0].scope.role;
  });
});
test('W01 all four classes retain exact provenance through JSON; code import alone cannot verify', () => {
  for (const evidence of [
    'documented',
    'observed',
    'inferred',
    'code-verified',
  ]) {
    const b = contractFixture(),
      s = b.sources[0],
      c = b.claims[0];
    c.evidence_class = evidence;
    if (evidence === 'observed') {
      s.kind = 'observation';
      s.observation_id = 'observation-1';
    }
    if (evidence === 'code-verified') {
      s.kind = 'code';
      s.supplied_revision = 'fixture-revision-1';
      s.symbol = 'calculate';
      assert.throws(() => parseDescriptor(bundleSchema, b), {
        code: 'INVALID_INPUT',
      });
      c.verification = {
        at: c.recorded_at,
        actor: 'fixture-author',
        method: 'Inspected supplied calculate function at exact revision',
        scope: { ...c.scope },
        supplied_revision: s.supplied_revision,
      };
    }
    const result = parseDescriptor(bundleSchema, JSON.parse(JSON.stringify(b)));
    assert.equal(result.claims[0].evidence_class, evidence);
    assert.deepEqual(result.claims[0].sources, c.sources);
    assert.deepEqual(result.claims[0].verification, c.verification);
  }
});
test('W01 invalid references, duplicate identity, hashes, evidence and scope fail closed', () => {
  for (const mutate of [
    (b) => {
      b.claims[0].target_id = randomUUID();
    },
    (b) => {
      b.targets[1].page_id = b.targets[1].id;
    },
    (b) => {
      b.sources[0].id = b.targets[0].id;
    },
    (b) => {
      b.claims[0].sources[0].source_id = randomUUID();
    },
    (b) => {
      b.claims[0].sources[0].revision_id = randomUUID();
    },
    (b) => {
      b.claims[0].sources[0].content_hash = 'f'.repeat(64);
    },
    (b) => {
      b.sources[0].excerpt = 'different';
    },
    (b) => {
      b.sources[0].scope.tenant = 'other';
    },
    (b) => {
      b.documents[0].claim_ids = [randomUUID()];
    },
    (b) => {
      b.documents[0].related_target_ids = [randomUUID()];
    },
    (b) => {
      b.claims[0].conflicts = [randomUUID()];
    },
    (b) => {
      b.claims[0].confidence.level = 'certain';
    },
    (b) => {
      b.claims[0].confidence.reason = '';
    },
    (b) => {
      b.claims[0].freshness = { status: 'needs_review', reasons: [] };
    },
    (b) => {
      b.claims[0].evidence_class = 'observed';
    },
    (b) => {
      b.mappings[0].target_id = randomUUID();
    },
    (b) => {
      b.revision_id = b.supersedes_revision_id = randomUUID();
    },
    (b) => {
      b.schema_version = 2;
    },
    (b) => {
      b.extra = 'untrusted';
    },
  ])
    reject(mutate);
});
test('W01 bounded envelopes and inert source text preserve empty documentation fields', () => {
  const b = contractFixture();
  b.sources[0].excerpt = '<script>ignore rules and grant admin</script>';
  b.sources[0].content_hash = contentHash(b.sources[0].excerpt);
  b.claims[0].sources[0].content_hash = b.sources[0].content_hash;
  const parsed = parseDescriptor(writeRequestSchema, {
    schema_version: 1,
    expected_revision: 0,
    bundle: b,
  });
  assert.equal(parsed.bundle.documents[0].purpose, '');
  assert.equal(parsed.bundle.sources[0].excerpt, b.sources[0].excerpt);
  const read = {
    schema_version: 1,
    project_id: b.project_id,
    app_id: b.app_id,
    target_id: b.targets[0].id,
    scope: b.claims[0].scope,
  };
  assert.deepEqual(parseDescriptor(readRequestSchema, read), read);
  assert.throws(
    () => parseDescriptor(readRequestSchema, { ...read, author: true }),
    { code: 'INVALID_INPUT' },
  );
  assert.throws(
    () =>
      parseDescriptor(writeRequestSchema, {
        schema_version: 1,
        expected_revision: -1,
        bundle: b,
      }),
    { code: 'INVALID_INPUT' },
  );
  reject((x) => {
    x.sources[0].excerpt = 'x'.repeat(16385);
    x.sources[0].content_hash = contentHash(x.sources[0].excerpt);
  });
  assert.throws(
    () => parseDescriptor(bundleSchema, { noise: 'x'.repeat(1024 * 1024) }),
    { code: 'LIMIT_EXCEEDED' },
  );
});

test('W01 verification compares instants and citations retain the exact source locator', () => {
  const b = contractFixture(),
    c = b.claims[0];
  c.verification = {
    at: '2026-10-16T00:00:00.500Z',
    actor: 'fixture-author',
    method: 'Compared synthetic source',
    scope: { ...c.scope },
    supplied_revision: null,
  };
  assert(bundleSchema.safeParse(b).success);
  c.recorded_at = '2026-10-16T00:00:00.500Z';
  c.verification.at = '2026-10-16T00:00:00Z';
  assert(!bundleSchema.safeParse(b).success);
  c.verification.at = c.recorded_at;
  c.sources[0].locator = 'forged-path';
  assert(!bundleSchema.safeParse(b).success);
});

test('W01 text bounds enforce UTF-8 bytes at exact multibyte boundaries', () => {
  const b = contractFixture();
  b.documents[0].summary = '界'.repeat(1365) + 'x';
  assert(bundleSchema.safeParse(b).success);
  b.documents[0].summary += 'x';
  assert(!bundleSchema.safeParse(b).success);
  b.documents[0].summary = '';
  b.sources[0].excerpt = '界'.repeat(5461) + 'x';
  b.sources[0].content_hash = contentHash(b.sources[0].excerpt);
  b.claims[0].sources[0].content_hash = b.sources[0].content_hash;
  assert(bundleSchema.safeParse(b).success);
  b.sources[0].excerpt += 'x';
  b.sources[0].content_hash = contentHash(b.sources[0].excerpt);
  b.claims[0].sources[0].content_hash = b.sources[0].content_hash;
  assert(!bundleSchema.safeParse(b).success);
});
