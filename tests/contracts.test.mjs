import { URL } from 'node:url';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AjvJsonSchemaValidator } from '@modelcontextprotocol/server/validators/ajv';
import {
  contracts,
  contractJsonSchemas,
  validateRequest,
  validateResponse,
  ContractError,
  errorSchema,
  LIMITS,
} from '../dist/contracts/index.js';
import {
  fixtures,
  clone,
  now,
  base,
  scope,
  operations,
  binding,
  attempts,
  uuid,
  tree,
} from './fixtures/contracts.mjs';

const jsonSchemas = contractJsonSchemas();
const validator = new AjvJsonSchemaValidator();
const jsonValidators = Object.fromEntries(
  Object.entries(jsonSchemas).map(([name, schemas]) => [
    name,
    {
      input: validator.getValidator(schemas.input),
      output: validator.getValidator(schemas.output),
    },
  ]),
);
for (const [name, fixture] of Object.entries(fixtures)) {
  test(`${name}: strict versioned request/response fixtures validate in Zod and generated JSON Schema`, () => {
    validateRequest(name, clone(fixture.input), now);
    validateResponse(name, clone(fixture.output));
    assert.equal(jsonValidators[name].input(clone(fixture.input)).valid, true);
    assert.equal(
      jsonValidators[name].output(clone(fixture.output)).valid,
      true,
    );
    const extra = { ...clone(fixture.input), filesystem_path: '/synthetic' };
    assert.throws(() => validateRequest(name, extra, now), ContractError);
    assert.equal(jsonValidators[name].input(extra).valid, false);
    const extraOutput = { ...clone(fixture.output), raw_snapshot: 'synthetic' };
    assert.throws(() => validateResponse(name, extraOutput), ContractError);
    assert.equal(jsonValidators[name].output(extraOutput).valid, false);
  });
}
test('all seven knowledge and six browser tools are covered and JSON schemas serialize', () => {
  assert.equal(Object.keys(contracts).length, 13);
  assert.deepEqual(Object.keys(contracts).sort(), Object.keys(fixtures).sort());
  assert.doesNotThrow(() => JSON.stringify(jsonSchemas));
});
test('query modes, defaults, limits, cursors and explicit incomplete results', () => {
  const search = validateRequest(
    'wg_query',
    clone(fixtures.wg_query.input),
    now,
  );
  assert.deepEqual(search.budget, { records: 20, bytes: 8192 });
  assert.equal(search.max_age_seconds, 86400);
  const missingRole = clone(fixtures.wg_query.input);
  delete missingRole.scope.role;
  assert.equal(
    validateRequest('wg_query', missingRole, now).scope.role,
    'unknown',
  );
  for (const extra of [
    { mode: 'neighbors', target_id: uuid(3) },
    { mode: 'path', source_state_id: uuid(3), target_state_id: uuid(4) },
    { mode: 'flow', flow_id: uuid(3) },
  ]) {
    const input = clone({
      ...base,
      scope,
      ...extra,
      cursor: { token: 'synthetic_cursor', store_revision: 0 },
    });
    validateRequest('wg_query', input, now);
    assert.equal(jsonValidators.wg_query.input(input).valid, true);
  }
  for (const extra of [
    { mode: 'neighbors', target_id: uuid(3), hops: 4 },
    {
      mode: 'path',
      source_state_id: uuid(3),
      target_state_id: uuid(4),
      max_depth: 9,
    },
    {
      mode: 'path',
      source_state_id: uuid(3),
      target_state_id: uuid(4),
      max_visited: 501,
    },
    { mode: 'search', filters: {}, budget: { records: 51, bytes: 8192 } },
  ])
    assert.throws(
      () =>
        validateRequest('wg_query', clone({ ...base, scope, ...extra }), now),
      ContractError,
    );
  const incomplete = clone(fixtures.wg_query.output);
  incomplete.data = {
    status: 'incomplete',
    records: [],
    guards: [],
    applicability: 'requires_check',
    reason: 'BUDGET_EXCEEDED',
  };
  incomplete.next_cursor = { token: 'synthetic_cursor', store_revision: 0 };
  validateResponse('wg_query', incomplete);
  assert.equal(jsonValidators.wg_query.output(incomplete).valid, true);
});
test('partial ingestion never reports a state identity or executable control', () => {
  const input = clone(fixtures.wg_ingest.input);
  input.capture.coverage = {
    kind: 'partial',
    subtree: 'synthetic_subtree',
    reason: 'subtree_only',
  };
  validateRequest('wg_ingest', input, now);
  const output = clone(fixtures.wg_ingest.output);
  output.data = {
    ...output.data,
    coverage: 'partial',
    state_id: null,
    state_hash: null,
    fragment_hash: 'b'.repeat(64),
  };
  validateResponse('wg_ingest', output);
  assert.equal(jsonValidators.wg_ingest.output(output).valid, true);
  output.data.state_id = uuid(5);
  assert.throws(() => validateResponse('wg_ingest', output), ContractError);
  assert.equal(jsonValidators.wg_ingest.output(output).valid, false);
});
test('tree node/depth, Unicode byte, total ingest byte and future timestamp bounds fail closed', () => {
  const request = () => clone(fixtures.wg_ingest.input);
  const depth64 = request();
  let node = depth64.capture.tree;
  for (let n = 1; n < 64; n++) {
    node.children.push(clone(tree));
    node = node.children[0];
  }
  validateRequest('wg_ingest', depth64, now);
  node.children.push(clone(tree));
  assert.throws(
    () => validateRequest('wg_ingest', depth64, now),
    (error) => error.code === 'LIMIT_EXCEEDED',
  );
  const nodes = request();
  nodes.capture.tree.children = Array.from({ length: 4999 }, () => clone(tree));
  validateRequest('wg_ingest', nodes, now);
  nodes.capture.tree.children.push(clone(tree));
  assert.throws(
    () => validateRequest('wg_ingest', nodes, now),
    (error) => error.code === 'LIMIT_EXCEEDED',
  );
  const unicode = request();
  unicode.capture.tree.name = '界'.repeat(1366);
  assert.throws(
    () => validateRequest('wg_ingest', unicode, now),
    (error) => error.code === 'LIMIT_EXCEEDED',
  );
  const large = request();
  large.capture.tree.children = Array.from({ length: 300 }, () => ({
    ...clone(tree),
    name: 'a'.repeat(4096),
  }));
  assert.throws(
    () => validateRequest('wg_ingest', large, now),
    (error) => error.code === 'LIMIT_EXCEEDED',
  );
  const future = request();
  future.capture.captured_at = new Date(now + 300000).toISOString();
  validateRequest('wg_ingest', future, now);
  future.capture.captured_at = new Date(now + 300001).toISOString();
  assert.throws(() => validateRequest('wg_ingest', future, now), ContractError);
});
test('commit operations are typed/bounded, local references are explicit, and no input values or untyped edges are accepted', () => {
  const input = clone(fixtures.wg_commit.input);
  validateRequest('wg_commit', input, now);
  input.operations = Array.from({ length: 101 }, () => clone(operations[0]));
  assert.throws(() => validateRequest('wg_commit', input, now), ContractError);
  for (const operation of [
    { ...clone(operations[0]), input_value: 'SYNTHETIC_REJECTED' },
    { op: 'create_edge', from_id: uuid(3), to_id: uuid(4) },
    { ...clone(operations[3]), provenance: 'inferred' },
  ])
    assert.throws(
      () =>
        validateRequest(
          'wg_commit',
          clone({ ...fixtures.wg_commit.input, operations: [operation] }),
          now,
        ),
      ContractError,
    );
  const duplicated = clone(fixtures.wg_commit.input);
  duplicated.operations = [clone(operations[0]), clone(operations[0])];
  assert.throws(
    () => validateRequest('wg_commit', duplicated, now),
    ContractError,
  );
  const testVerified = clone(fixtures.wg_commit.input);
  testVerified.operations = [
    { ...clone(operations[3]), provenance: 'test_verified' },
  ];
  assert.throws(
    () => validateRequest('wg_commit', testVerified, now),
    ContractError,
  );
  testVerified.operations[0].test_run_id = clone(operations[0].state_id);
  validateRequest('wg_commit', testVerified, now);
});
test('browser targets are live bindings and actions exclude selectors, code, credentials and dangerous keys', () => {
  for (const action of [
    { kind: 'fill', ...binding, target_id: uuid(13), text: '' },
    { kind: 'select', ...binding, target_id: uuid(13), option_id: uuid(14) },
    { kind: 'check', ...binding, target_id: uuid(13) },
    { kind: 'uncheck', ...binding, target_id: uuid(13) },
    {
      kind: 'scroll',
      ...binding,
      target_id: uuid(13),
      axis: 'vertical',
      delta: 1,
    },
    { kind: 'key', ...binding, target_id: uuid(13), key: 'Tab' },
  ]) {
    const input = clone({ ...fixtures.wg_browser_act.input, action });
    validateRequest('wg_browser_act', input, now);
    assert.equal(jsonValidators.wg_browser_act.input(input).valid, true);
  }
  for (const action of [
    { ...clone(fixtures.wg_browser_act.input.action), selector: '#synthetic' },
    { kind: 'evaluate', script: 'synthetic' },
    { kind: 'key', ...binding, target_id: uuid(13), key: 'Enter' },
    {
      kind: 'fill',
      ...binding,
      target_id: uuid(13),
      text: '',
      credential: true,
    },
  ])
    assert.throws(
      () =>
        validateRequest(
          'wg_browser_act',
          clone({ ...fixtures.wg_browser_act.input, action }),
          now,
        ),
      ContractError,
    );
  const missing = clone(fixtures.wg_browser_act.input);
  delete missing.action.snapshot_id;
  assert.throws(
    () => validateRequest('wg_browser_act', missing, now),
    ContractError,
  );
  for (const url of [
    'javascript:synthetic',
    'https://fixture.test/?synthetic=query',
    'https://synthetic@fixture.test/',
    'https://fixture.test/#synthetic',
  ])
    assert.throws(
      () =>
        validateRequest(
          'wg_browser_navigate',
          clone({ ...fixtures.wg_browser_navigate.input, url }),
          now,
        ),
      ContractError,
    );
});
test('browser receipts distinguish rejection, pending, success, failed and unknown without action values', () => {
  for (const receipt of attempts) {
    const output = clone({ ...fixtures.wg_browser_act.output, data: receipt });
    validateResponse('wg_browser_act', output);
    assert.equal(jsonValidators.wg_browser_act.output(output).valid, true);
  }
  const output = clone(fixtures.wg_browser_act.output);
  output.data = { ...attempts[4], dispatch: 'not_dispatched' };
  assert.throws(
    () => validateResponse('wg_browser_act', output),
    ContractError,
  );
  output.data = { ...attempts[4], text: 'SYNTHETIC_REJECTED' };
  assert.throws(
    () => validateResponse('wg_browser_act', output),
    ContractError,
  );
});
test('version failures and malformed/cyclic/executable objects produce only sanitized error paths', () => {
  const bad = clone(fixtures.wg_ingest.input);
  bad.capture.tree.SYNTHETIC_SECRET_FIELD = 'SYNTHETIC_REJECTED';
  try {
    validateRequest('wg_ingest', bad, now);
    assert.fail('accepted unknown field');
  } catch (error) {
    const serialized = JSON.stringify(error);
    assert(!serialized.includes('SYNTHETIC_SECRET_FIELD'));
    assert(!serialized.includes('SYNTHETIC_REJECTED'));
    assert.equal(errorSchema.safeParse(error.toJSON()).success, true);
  }
  assert.throws(
    () => validateRequest('wg_status', { ...base, schema_version: 2 }, now),
    (error) => error.code === 'UNSUPPORTED_SCHEMA',
  );
  assert.throws(
    () =>
      validateRequest(
        'wg_browser_status',
        { ...fixtures.wg_browser_status.input, browser_schema_version: 2 },
        now,
      ),
    (error) => error.code === 'UNSUPPORTED_SCHEMA',
  );
  const cyclic = {};
  cyclic.self = cyclic;
  assert.throws(() => validateRequest('wg_status', cyclic, now), ContractError);
  const getter = {};
  Object.defineProperty(getter, 'secret', {
    enumerable: true,
    get() {
      return assert.fail('executed getter');
    },
  });
  assert.throws(() => validateRequest('wg_status', getter, now), ContractError);
  assert.equal(LIMITS.text_bytes, 4096);
});

test('built JSON Schema artifact exactly matches the public schema source', async () => {
  const { readFile } = await import('node:fs/promises');
  const emitted = JSON.parse(
    await readFile(
      new URL('../dist/contracts/schemas.json', import.meta.url),
      'utf8',
    ),
  );
  assert.deepEqual(emitted.tools, jsonSchemas);
  assert.deepEqual(emitted.limits, LIMITS);
});

test('all record kinds and remaining result variants validate and nested unknown fields are rejected', async () => {
  const { resultVariants } = await import('./fixtures/contracts.mjs');
  for (const [name, variants] of Object.entries(resultVariants)) {
    for (const data of variants) {
      const output = clone({ ...fixtures[name].output, data });
      validateResponse(name, output);
      assert.equal(jsonValidators[name].output(output).valid, true);
      const unknown = clone(output);
      unknown.data.raw_screenshot = 'SYNTHETIC_REJECTED';
      assert.throws(() => validateResponse(name, unknown), ContractError);
      assert.equal(jsonValidators[name].output(unknown).valid, false);
    }
  }
  const input = clone(fixtures.wg_ingest.input);
  input.capture.tree.transient_ref = 'synthetic';
  assert.throws(() => validateRequest('wg_ingest', input, now), ContractError);
  assert.equal(jsonValidators.wg_ingest.input(input).valid, false);
  validateRequest(
    'wg_changes',
    clone({
      ...base,
      mode: 'revisions',
      scope,
      from_revision: 0,
      to_revision: 1,
    }),
    now,
  );
});

test('structured evidence and capture summaries enforce tree bounds and coverage-specific state identities', async () => {
  const { resultVariants, recordFixtures } =
    await import('./fixtures/contracts.mjs');
  const evidence = () =>
    clone({
      ...fixtures.wg_evidence.output,
      data: resultVariants.wg_evidence[1],
    });
  const deep = evidence();
  let node = deep.data.items[0].capture.tree;
  for (let n = 1; n < 65; n++) {
    node.children.push(clone(tree));
    node = node.children[0];
  }
  assert.throws(
    () => validateResponse('wg_evidence', deep),
    (error) => error.code === 'LIMIT_EXCEEDED',
  );
  const broad = evidence();
  broad.data.items[0].capture.tree.children = Array.from({ length: 5000 }, () =>
    clone(tree),
  );
  assert.throws(
    () => validateResponse('wg_evidence', broad),
    (error) => error.code === 'LIMIT_EXCEEDED',
  );
  const partial = evidence();
  partial.data.items[0].capture.coverage = {
    kind: 'partial',
    subtree: 'synthetic',
    reason: 'subtree_only',
  };
  assert.throws(() => validateResponse('wg_evidence', partial), ContractError);
  partial.data.items[0].state_id = null;
  validateResponse('wg_evidence', partial);
  const complete = evidence();
  complete.data.items[0].state_id = null;
  assert.throws(() => validateResponse('wg_evidence', complete), ContractError);
  const summary = clone({
    ...fixtures.wg_query.output,
    data: {
      status: 'complete',
      records: [recordFixtures[6]],
      guards: [],
      applicability: 'requires_check',
    },
  });
  summary.data.records[0].evidence.coverage = {
    kind: 'partial',
    subtree: 'synthetic',
    reason: 'subtree_only',
  };
  assert.throws(() => validateResponse('wg_query', summary), ContractError);
  summary.data.records[0].state_id = null;
  validateResponse('wg_query', summary);
});
test('structured annotations retain kind, author and provenance-specific evidence', async () => {
  const { resultVariants } = await import('./fixtures/contracts.mjs');
  const evidence = () =>
    clone({
      ...fixtures.wg_evidence.output,
      data: resultVariants.wg_evidence[2],
    });
  for (const field of ['annotation_kind', 'author_type']) {
    const output = evidence();
    delete output.data.items[0][field];
    assert.throws(() => validateResponse('wg_evidence', output), ContractError);
  }
  const inferred = evidence();
  inferred.data.items[0].provenance = 'inferred';
  assert.throws(() => validateResponse('wg_evidence', inferred), ContractError);
  inferred.data.items[0].rationale = 'Synthetic rationale';
  validateResponse('wg_evidence', inferred);
  assert.equal(jsonValidators.wg_evidence.output(inferred).valid, true);
  const verified = evidence();
  verified.data.items[0].provenance = 'test_verified';
  assert.throws(() => validateResponse('wg_evidence', verified), ContractError);
  verified.data.items[0].test_run_id = uuid(40);
  validateResponse('wg_evidence', verified);
  assert.equal(jsonValidators.wg_evidence.output(verified).valid, true);
});
test('deep invalid field paths remain within the public error envelope', () => {
  const input = clone(fixtures.wg_ingest.input);
  let node = input.capture.tree;
  for (let n = 1; n < 64; n++) {
    node.children.push(clone(tree));
    node = node.children[0];
  }
  node.name = 17;
  try {
    validateRequest('wg_ingest', input, now);
    assert.fail('invalid deep name accepted');
  } catch (error) {
    assert.equal(errorSchema.safeParse(error.toJSON()).success, true);
    assert(error.field_paths.every((path) => path.length <= 128));
  }
});
