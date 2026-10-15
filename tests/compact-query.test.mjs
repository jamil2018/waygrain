import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import test from 'node:test';
import { query, evidence, ingest } from '../dist/index.js';
import {
  query as oldQuery,
  evidence as oldEvidence,
} from '../tasks/evidence/g06/prechange-runtime/dist/index.js';
import { storageFixture, fixtureNow } from './fixtures/storage.mjs';
import { traceFixture, existing } from './fixtures/graph.mjs';
import { fixtureSettings } from './fixtures/ui/index.mjs';

const ask = (f, req, extra = {}) => ({
  ...f.base,
  mode: 'search',
  scope: req.capture.scope,
  filters: { kinds: ['capture'] },
  projection: 'compact',
  ...extra,
});
const pointer = (value, path) =>
  path
    .slice(1)
    .split('/')
    .reduce((v, key) => v[key], value);

test('G06 compact citations resolve exactly, preserve defaults and do not write', async (t) => {
  const f = await storageFixture(t);
  const req = f.request({ modal: true });
  ingest(f.store, req, fixtureNow);
  const input = ask(f, req);
  const defaultInput = { ...input };
  delete defaultInput.projection;
  assert.deepEqual(
    query(f.store, defaultInput, fixtureNow),
    oldQuery(f.store, defaultInput, fixtureNow),
  );
  const revision = f.store.revision;
  const result = query(f.store, input, fixtureNow);
  const item = result.data.records[0];
  const readInput = { ...f.base, ids: [item.id], projection: 'structured' };
  const source = evidence(f.store, readInput, fixtureNow);
  assert.deepEqual(source, oldEvidence(f.store, readInput, fixtureNow));
  assert.equal(result.data.applicability, 'requires_check');
  assert.equal(item.compact.source_id, item.id);
  const stored = source.data.items[0].capture;
  assert.deepEqual(pointer(stored, item.compact.view_path), item.compact.view);
  for (const { source_path, ...excerpt } of item.compact.nodes) {
    const node = pointer(stored, source_path);
    const { role, name, enabled, visible, selected } = node;
    assert.deepEqual(excerpt, {
      role,
      name,
      enabled,
      visible,
      ...(selected === undefined ? {} : { selected }),
    });
    assert(!('locator_hint' in excerpt));
  }
  assert(item.compact.nodes.some((n) => n.role === 'dialog'));
  assert(item.compact.nodes.some((n) => n.name === 'Cancel'));
  assert.equal(item.compact.omitted_nodes, 0);
  assert.equal(f.store.revision, revision);
  assert.equal(item.evidence.freshness.application_version, null);
  assert.equal(item.evidence.freshness.last_checked_at, null);
});

test('G06 stale and partial captures retain source freshness and cannot imply currentness', async (t) => {
  const f = await storageFixture(t);
  const req = f.request();
  req.capture.coverage = {
    kind: 'partial',
    subtree: 'members',
    reason: 'subtree_only',
  };
  ingest(f.store, req, fixtureNow);
  const input = ask(f, req);
  const later = fixtureNow + 2 * 86400000;
  const item = query(f.store, input, later).data.records[0];
  const plain = { ...input };
  delete plain.projection;
  assert.deepEqual(
    item.evidence,
    query(f.store, plain, later).data.records[0].evidence,
  );
  assert.equal(item.evidence.freshness.status, 'stale');
  assert.equal(item.evidence.coverage.kind, 'partial');
  assert.equal(item.state_id, null);
});

test('G06 older captures never inherit later observation age', async (t) => {
  const f = await storageFixture(t);
  const first = f.request();
  const a = ingest(f.store, first, fixtureNow).data;
  const next = f.request({ version: 2 });
  next.capture.captured_at = new Date(fixtureNow + 2 * 86400000).toISOString();
  ingest(f.store, next, fixtureNow + 2 * 86400000);
  const item = query(
    f.store,
    ask(f, first, { filters: { kinds: ['capture'], ids: [a.capture_id] } }),
    fixtureNow + 2 * 86400000,
  ).data.records[0];
  assert.equal(item.evidence.freshness.age_seconds, 172800);
  assert.equal(item.evidence.freshness.status, 'stale');
  assert(item.compact.nodes.some((n) => n.name === 'Invite'));
  assert(!item.compact.nodes.some((n) => n.name === 'Invite member'));
});

test('G06 conflicts remain contradicted with unchanged warnings', async (t) => {
  const f = await traceFixture(t);
  const op = {
    op: 'add_annotation',
    annotation: {
      target_id: existing(f.a.capture_id),
      kind: 'description',
      value: 'Members',
      author_type: 'agent',
      evidence_ids: [existing(f.a.capture_id)],
      scope: f.scope,
      provenance: 'observed',
    },
  };
  f.write([op, { ...op, annotation: { ...op.annotation, value: 'Settings' } }]);
  const item = query(
    f.store,
    ask(f, f.before, {
      filters: { kinds: ['capture'], ids: [f.a.capture_id] },
    }),
    fixtureNow,
  );
  assert.equal(item.data.records[0].evidence.freshness.status, 'contradicted');
  assert.equal(item.warnings[0].code, 'ANNOTATION_CONFLICT');
});

test('G06 scope, missing and tombstoned captures expose no snippets', async (t) => {
  const f = await storageFixture(t);
  const req = f.request();
  const a = ingest(f.store, req, fixtureNow).data;
  assert.equal(
    query(
      f.store,
      ask(f, req, { scope: { ...req.capture.scope, role: 'viewer' } }),
      fixtureNow,
    ).data.status,
    'no_matches',
  );
  assert.equal(
    query(
      f.store,
      ask(f, req, {
        filters: {
          kinds: ['capture'],
          ids: ['00000000-0000-4000-8000-000000000001'],
        },
      }),
      fixtureNow,
    ).data.status,
    'no_matches',
  );
  f.store.write(f.store.revision, (rev) =>
    f.store.db
      .prepare('INSERT INTO tombstones VALUES(?,?,?,NULL)')
      .run(a.capture_id, 'g06_synthetic', rev),
  );
  assert.equal(
    query(f.store, ask(f, req), fixtureNow).data.status,
    'no_matches',
  );
});

test('G06 unsupported kind/mode combinations fail closed', async (t) => {
  const f = await storageFixture(t);
  const req = f.request();
  const a = ingest(f.store, req, fixtureNow).data;
  for (const filters of [
    {},
    { kinds: ['control'] },
    { kinds: ['capture', 'control'] },
  ])
    assert.throws(() => query(f.store, ask(f, req, { filters }), fixtureNow), {
      code: 'INVALID_INPUT',
    });
  const input = {
    ...f.base,
    mode: 'neighbors',
    scope: req.capture.scope,
    target_id: a.screen_id,
    projection: 'compact',
  };
  assert.throws(() => query(f.store, input, fixtureNow), {
    code: 'INVALID_INPUT',
  });
});

test('G06 node and UTF8 name omissions are explicit, exact and deterministic', async (t) => {
  const settings = fixtureSettings();
  settings.apps[0].redaction_profiles[0].allowed_labels.push('界'.repeat(100));
  const f = await storageFixture(t, settings);
  const req = f.request();
  req.capture.tree.children = [
    {
      role: 'heading',
      name: '界'.repeat(100),
      enabled: true,
      visible: true,
      children: [],
    },
    ...Array.from({ length: 20 }, () => ({
      role: 'button',
      name: 'Invite',
      enabled: true,
      visible: true,
      children: [],
    })),
  ];
  ingest(f.store, req, fixtureNow);
  const result = query(f.store, ask(f, req), fixtureNow);
  assert.deepEqual(result, query(f.store, ask(f, req), fixtureNow));
  const c = result.data.records[0].compact;
  assert.equal(c.nodes.length, 16);
  assert.equal(c.omitted_nodes, 6);
  assert.deepEqual(c.omission_reasons, ['NODE_LIMIT', 'TEXT_LIMIT']);
  assert(!c.nodes.some((n) => n.name.includes('界')));
});

test('G06 byte/record limits preserve citations and bind projection/revision cursors', async (t) => {
  const f = await storageFixture(t);
  const req = f.request();
  ingest(f.store, req, fixtureNow);
  ingest(f.store, f.request({ version: 2 }), fixtureNow);
  const input = ask(f, req, { budget: { records: 1, bytes: 8192 } });
  const first = query(f.store, input, fixtureNow);
  assert.equal(first.data.status, 'incomplete');
  assert(first.next_cursor);
  assert(first.data.records[0].compact.source_id);
  const second = query(
    f.store,
    { ...input, cursor: first.next_cursor },
    fixtureNow,
  );
  assert.equal(second.data.status, 'complete');
  assert.notEqual(first.data.records[0].id, second.data.records[0].id);
  const plain = { ...input, cursor: first.next_cursor };
  delete plain.projection;
  assert.throws(() => query(f.store, plain, fixtureNow), {
    code: 'INVALID_INPUT',
  });
  const tiny = query(
    f.store,
    { ...input, budget: { records: 1, bytes: 1024 } },
    fixtureNow,
  );
  assert.equal(tiny.data.status, 'incomplete');
  assert.equal(tiny.data.records.length, 0);
  assert(!tiny.next_cursor);
  assert(Buffer.byteLength(JSON.stringify(tiny)) <= 1024);
  ingest(f.store, f.request(), fixtureNow);
  assert.throws(
    () => query(f.store, { ...input, cursor: first.next_cursor }, fixtureNow),
    { code: 'CURSOR_STALE' },
  );
});
