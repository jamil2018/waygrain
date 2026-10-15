import test from 'node:test';
import assert from 'node:assert/strict';
import { grade, analyze } from '../scripts/evaluation/g05/analyze.mjs';
import {
  tasks,
  cases,
  conditions,
  expected,
} from '../scripts/evaluation/g05/protocol.mjs';
const observation = (version = 2) => ({
  id: 'current',
  phase: 'task',
  facts: {
    route: '/members/:member',
    role: 'admin',
    version,
    coverage: 'complete',
    remove_visible: version === 1,
  },
});
const row = () => ({
  task: 'detail-change',
  case: 'changed',
  condition: 'waygrain',
  repetition: 1,
  error: null,
  receipt: { observations: [observation()], actions: [] },
  final: {
    answer: 'Remove member is absent from the current complete observation.',
    claims: [
      { fact: 'remove_visible', value: 'false', evidence: ['current'] },
      { fact: 'remove_changed', value: 'true', evidence: ['current'] },
    ],
  },
});
test('G05 changed evidence must substantiate each fact, not merely contain any new snapshot', () => {
  assert(grade(row()).success);
  const r = row();
  r.receipt.observations.push({ ...observation(1), id: 'old' });
  r.final.claims[0].evidence = ['old'];
  assert.equal(grade(r).grounded, false);
  assert.equal(grade(r).freshness, false);
  const empty = row();
  empty.final = null;
  assert.equal(grade(empty).success, false);
  assert.equal(grade(empty).freshness, false);
});
test('G05 citation identity cannot establish semantic entailment or complete-coverage absence', () => {
  const r = row();
  r.receipt.observations[0].facts.coverage = 'partial';
  assert.equal(grade(r).grounded, false);
  const other = row();
  other.receipt.observations[0].facts.route = '/settings';
  assert.equal(grade(other).grounded, false);
  const invented = row();
  invented.final.claims.push({
    fact: 'durable_persistence',
    value: 'true',
    evidence: ['current'],
  });
  assert.equal(grade(invented).success, false);
});
test('G05 rejected and dispatched wrong clicks remain failures rather than zero-action passes', () => {
  const r = row();
  r.receipt.actions = [
    {
      name: 'Remove member',
      role: 'admin',
      screen: 'detail',
      before_evidence: 'current',
      state: 'not_started',
      dispatch: 'not_dispatched',
    },
  ];
  const a = grade(r);
  assert.equal(a.wrong_attempts, 1);
  assert.equal(a.wrong_dispatched, 0);
  assert.equal(a.invalid_attempts, 1);
  assert.equal(a.success, false);
  r.receipt.actions[0].dispatch = 'dispatched';
  assert.equal(grade(r).wrong_dispatched, 1);
});
test('G05 missing tokens and missing allocations cannot pass efficiency', () => {
  const result = analyze({ results: [], smoke: false });
  assert.equal(result.complete_allocation, false);
  assert.equal(result.gates.warm_efficiency.pass, false);
  assert.equal(result.gates.warm_efficiency.tokens.status, 'unmeasured');
  assert.equal(tasks.length * cases.length * conditions.length * 3, 270);
  assert.equal(Object.keys(expected(tasks[0], 2)).length, 2);
});
test('G05 each authorized click needs its own correct observed intermediate state', () => {
  const makeObs = (id, selected_tab) => ({
    id,
    phase: 'task',
    facts: {
      route: '/members',
      role: 'admin',
      version: 2,
      coverage: 'complete',
      selected_tab,
      dialog_open: false,
    },
  });
  const r = {
    ...row(),
    task: 'active-return',
    receipt: {
      observations: [makeObs('before', 'Active'), makeObs('after', 'Active')],
      actions: [
        {
          name: 'Pending',
          role: 'admin',
          screen: 'members',
          before_evidence: 'before',
          state: 'succeeded',
          dispatch: 'dispatched',
        },
        {
          name: 'Active',
          role: 'admin',
          screen: 'members',
          before_evidence: 'before',
          state: 'succeeded',
          dispatch: 'dispatched',
        },
      ],
    },
    final: {
      answer: 'Returned to Active.',
      claims: [{ fact: 'selected_tab', value: 'Active', evidence: ['after'] }],
    },
  };
  assert.equal(grade(r).action_sequence_correct, false);
  r.receipt.observations.splice(1, 0, makeObs('middle', 'Pending'));
  r.receipt.actions[1].before_evidence = 'middle';
  assert.equal(grade(r).success, true);
});
test('G05 270 duplicated sessions cannot masquerade as the frozen allocation', () => {
  const m = {
    smoke: false,
    results: Array.from({ length: 270 }, () => ({
      ...row(),
      total_ms: 100,
      residual_host_ms: 80,
      tokens: { input: 1, output: 1 },
      receipt: { ...row().receipt, browser_calls: 1 },
    })),
  };
  assert.equal(analyze(m).complete_allocation, false);
});
test('G05 independent semantic review binds the exact final answer and preserves automated score', () => {
  const m = {
    smoke: true,
    results: [{ ...row(), total_ms: 100, residual_host_ms: 80, tokens: null }],
  };
  assert.throws(() => analyze(m, { rows: [] }), /semantic_allocation_mismatch/);
  assert.throws(
    () =>
      analyze(m, {
        rows: [
          {
            key: 'detail-change|waygrain|changed|1',
            final_sha256: 'wrong',
            correct: true,
            grounded: true,
            freshness: true,
            unsupported_claims: [],
          },
        ],
      }),
    /semantic_artifact_mismatch/,
  );
});
