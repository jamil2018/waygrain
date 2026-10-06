import assert from 'node:assert/strict';
import test from 'node:test';
import {
  normalizeCapture,
  stateProjection,
  digest,
  canonical,
} from '../dist/core/normalize.js';
import { validateRequest } from '../dist/contracts/index.js';
import {
  fixtureCapture,
  fixtureSettings,
  sensitive,
  labels,
} from './fixtures/ui/index.mjs';
import { base, now } from './fixtures/contracts.mjs';
const clone = (value) => JSON.parse(JSON.stringify(value));
const app = fixtureSettings().apps[0];
// Reviewed aliases are profile labels, not page-derived record identifiers.

const normalize = (capture) =>
  normalizeCapture(
    validateRequest(
      'wg_ingest',
      {
        ...base,
        request_id: 'fixture',
        screen_ref: { kind: 'new', name: 'Members' },
        capture,
      },
      now,
    ).capture,
    app,
  );

test('B02 allowlisted structure and hashes are deterministic without losing UI order', () => {
  const raw = fixtureCapture();
  const result = normalize(raw);
  const retained = JSON.stringify(result);
  for (const value of Object.values(sensitive))
    assert(!retained.includes(value));
  assert.equal(result.redaction_summary.dropped_texts, 2);
  assert.equal(raw.tree.children.at(-1).name, sensitive.injection);
  const hash = (c) =>
    digest(stateProjection(normalize(c).capture, base.app_id));
  assert.equal(hash(raw), hash(clone(raw)));
  const noisy = clone(raw);
  noisy.captured_at = '2026-10-06T00:00:00Z';
  noisy.session_id = 'other_session';
  noisy.tree.children[1].locator_hint = {
    kind: 'accessible_name',
    hint: 'Active',
    source: raw.source,
    observed_at: raw.captured_at,
  };
  assert.equal(hash(raw), hash(noisy));
  for (const options of [
    { role: 'viewer' },
    { environment: 'production' },
    { tab: 'pending' },
    { modal: true },
    { version: 2 },
  ])
    assert.notEqual(hash(raw), hash(fixtureCapture(options)));
  const reordered = clone(raw);
  reordered.tree.children.reverse();
  assert.notEqual(hash(raw), hash(reordered));
  const disabled = clone(raw);
  disabled.tree.children[1].enabled = false;
  assert.notEqual(hash(raw), hash(disabled));
  assert.equal(canonical({ b: 1, a: 2 }), canonical({ a: 2, b: 1 }));
  assert.deepEqual(labels.includes('Invite'), true);
});

test('B02 forbidden fields fail before output; unreviewed routes, variants, roles and profiles fail closed', () => {
  const raw = fixtureCapture();
  for (const field of ['value', 'password', 'cookie', 'ref', 'token']) {
    const input = clone(raw);
    input.tree[field] = sensitive.secret;
    assert.throws(
      () => normalize(input),
      (error) => !JSON.stringify(error).includes(sensitive.secret),
    );
  }
  for (const edit of [
    (c) => (c.scope.role = 'unknown'),
    (c) => (c.redaction_profile.version = 2),
    (c) => (c.view.route_template = '/members/private-person'),
    (c) => (c.view.selected_tabs = ['private-person']),
    (c) => (c.tree.role = 'private-person'),
    (c) => (c.source.format = 'unsupported'),
  ]) {
    const input = clone(raw);
    edit(input);
    assert.throws(() => normalize(input));
  }
  const unknownHint = clone(raw);
  unknownHint.tree.locator_hint = {
    kind: 'test_id',
    hint: sensitive.secret,
    source: raw.source,
    observed_at: raw.captured_at,
  };
  const result = normalize(unknownHint);
  assert.equal(result.redaction_summary.dropped_fields, 1);
  assert(!JSON.stringify(result).includes(sensitive.secret));
  const spaced = fixtureCapture({ screen: 'home' });
  spaced.tree.children[0].name = '  Home \n';
  assert.equal(normalize(spaced).capture.tree.children[0].name, 'Home');
});
