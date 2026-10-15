import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import process from 'node:process';
import console from 'node:console';
import { writeFile } from 'node:fs/promises';
import { performance } from 'node:perf_hooks';
import { query, evidence, ingest } from '../../../dist/index.js';
import {
  query as oldQuery,
  evidence as oldEvidence,
} from '../../../tasks/evidence/g06/prechange-runtime/dist/index.js';
import {
  storageFixture,
  fixtureNow,
} from '../../../tests/fixtures/storage.mjs';

const cases = [
  {
    id: 'admin-members',
    screen: 'members',
    name: 'Members',
    role: 'admin',
    required: ['Invite', 'Active'],
    selected: 'Active',
  },
  {
    id: 'viewer-settings',
    screen: 'settings',
    name: 'Settings',
    role: 'viewer',
    required: ['Save'],
    disabled: 'Save',
  },
  {
    id: 'admin-detail',
    screen: 'detail',
    name: 'Member detail',
    role: 'admin',
    required: ['Remove member'],
  },
  {
    id: 'invite-dialog',
    screen: 'members',
    name: 'Members',
    role: 'admin',
    modal: true,
    required: ['Invite', 'Cancel', 'Active'],
    dialog: true,
    selected: 'Active',
  },
];
const median = (xs) => {
  const values = [...xs].sort((a, b) => a - b),
    half = Math.floor(values.length / 2);
  return values.length % 2
    ? values[half]
    : (values[half - 1] + values[half]) / 2;
};
const distribution = (xs) => ({
  min: Math.min(...xs),
  median: median(xs),
  max: Math.max(...xs),
});
const pointer = (value, path) =>
  path
    .slice(1)
    .split('/')
    .reduce((v, key) => v[key], value);
const rows = [],
  setups = [];
const startedAt = new Date().toISOString();
for (const c of cases) {
  const cleanup = [];
  try {
    const began = performance.now();
    const f = await storageFixture({ after: (fn) => cleanup.push(fn) });
    const req = f.request(c, {
      screen_ref: { kind: 'new', name: c.name, view_key: c.screen },
    });
    ingest(f.store, req, fixtureNow);
    setups.push({ case: c.id, setup_ingest_ms: performance.now() - began });
    const input = {
      ...f.base,
      mode: 'search',
      scope: req.capture.scope,
      filters: { kinds: ['capture'], terms: [c.name] },
      budget: { records: 20, bytes: 8192 },
    };
    const old = () => {
      const q = oldQuery(f.store, input, fixtureNow);
      const e = oldEvidence(
        f.store,
        {
          ...f.base,
          ids: q.data.records.map((r) => r.id),
          projection: 'structured',
          budget: input.budget,
        },
        fixtureNow,
      );
      return [q, e];
    };
    const compact = () => [
      query(f.store, { ...input, projection: 'compact' }, fixtureNow),
    ];
    const baseline = old();
    assert.deepEqual(query(f.store, input, fixtureNow), baseline[0]);
    assert.deepEqual(
      evidence(
        f.store,
        {
          ...f.base,
          ids: baseline[0].data.records.map((r) => r.id),
          projection: 'structured',
          budget: input.budget,
        },
        fixtureNow,
      ),
      baseline[1],
    );
    const result = compact()[0];
    assert.equal(result.data.status, 'complete');
    assert.equal(result.data.applicability, 'requires_check');
    assert.equal(result.data.records.length, 1);
    const item = result.data.records[0],
      source = baseline[1].data.items[0].capture;
    const { compact: snippets, ...original } = item;
    assert.deepEqual(original, baseline[0].data.records[0]);
    assert.equal(snippets.source_id, item.id);
    assert.deepEqual(pointer(source, snippets.view_path), snippets.view);
    assert.equal(snippets.omitted_nodes, 0);
    for (const { source_path, ...node } of snippets.nodes) {
      const actual = pointer(source, source_path);
      const { role, name, enabled, visible, selected } = actual;
      assert.deepEqual(node, {
        role,
        name,
        enabled,
        visible,
        ...(selected === undefined ? {} : { selected }),
      });
    }
    for (const label of c.required)
      assert(snippets.nodes.some((n) => n.name === label && n.visible));
    if (c.selected)
      assert(snippets.nodes.some((n) => n.name === c.selected && n.selected));
    if (c.disabled)
      assert(
        snippets.nodes.some(
          (n) => n.name === c.disabled && n.enabled === false,
        ),
      );
    if (c.dialog) assert(snippets.nodes.some((n) => n.role === 'dialog'));
    for (let i = 0; i < 35; i++) {
      const order = i % 2 ? ['compact', 'legacy'] : ['legacy', 'compact'];
      const pair = {};
      for (const arm of order) {
        const tick = performance.now();
        const responses = arm === 'legacy' ? old() : compact();
        const bytes = responses.reduce(
          (n, response) => n + Buffer.byteLength(JSON.stringify(response)),
          0,
        );
        pair[arm] = {
          ms: performance.now() - tick,
          response_bytes: bytes,
          calls: responses.length,
        };
      }
      if (i >= 5)
        rows.push({
          case: c.id,
          repetition: i - 4,
          order,
          ...pair,
          evidence_equivalent: true,
          error: null,
        });
    }
  } finally {
    for (const fn of cleanup.reverse()) await fn();
  }
}
const perCase = cases.map((c) => {
  const selected = rows.filter((r) => r.case === c.id);
  return {
    case: c.id,
    samples: selected.length,
    ...Object.fromEntries(
      ['legacy', 'compact'].map((arm) => [
        arm,
        {
          ms: distribution(selected.map((r) => r[arm].ms)),
          response_bytes: distribution(
            selected.map((r) => r[arm].response_bytes),
          ),
          calls: selected[0][arm].calls,
        },
      ]),
    ),
  };
});
const legacyBytes = median(perCase.map((c) => c.legacy.response_bytes.median));
const compactBytes = median(
  perCase.map((c) => c.compact.response_bytes.median),
);
const result = {
  runtime: {
    node: process.version,
    platform: process.platform,
    arch: process.arch,
  },
  started_at: startedAt,
  finished_at: new Date().toISOString(),
  method:
    '30 alternating sequential pairs per case after 5 paired warmups; latency includes core execution+JSON serialization; no MCP transport, model or browser',
  tokens: null,
  tokens_reason: 'no model session; tokens unmeasured',
  setups,
  rows,
  per_case: perCase,
  aggregate: {
    legacy_response_bytes: legacyBytes,
    compact_response_bytes: compactBytes,
    response_byte_reduction_percent: (1 - compactBytes / legacyBytes) * 100,
    legacy_ms: median(perCase.map((c) => c.legacy.ms.median)),
    compact_ms: median(perCase.map((c) => c.compact.ms.median)),
  },
  acceptance: {
    all_four_useful_and_equivalent: true,
    calls_reduced_2_to_1: true,
    median_combined_bytes_lower: compactBytes < legacyBytes,
  },
  cleanup: 'all four synthetic stores closed and temporary roots removed',
};
await writeFile(
  process.argv[2] ?? 'tasks/evidence/g06/comparison.json',
  JSON.stringify(result, null, 2) + '\n',
);
console.log(
  JSON.stringify({
    samples: rows.length,
    aggregate: result.aggregate,
    acceptance: result.acceptance,
  }),
);
