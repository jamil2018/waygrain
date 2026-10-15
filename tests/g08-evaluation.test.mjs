import test from 'node:test';
import assert from 'node:assert/strict';
import { corpus, worlds } from '../scripts/evaluation/g08/corpus.mjs';
import { ownerReply } from '../scripts/evaluation/g08/owner.mjs';
import { prompt } from '../scripts/evaluation/g08/protocol.mjs';
import {
  referenceChain,
  metricSummary,
} from '../scripts/evaluation/g08/analyze.mjs';
import { html } from '../scripts/evaluation/g08/fixture.mjs';
test('sources contain no hidden approval answers; owner rejects unexposed/vague evidence', () => {
  for (const w of worlds) {
    assert.equal(corpus(w).length, 14);
    assert.equal(
      ownerReply(w, 'Who approves admin provisioning?', [w + '_08'], new Set())
        .status,
      'needs_evidence',
    );
    assert.equal(
      ownerReply(w, 'Tell me everything', [w + '_08'], new Set([w + '_08']))
        .status,
      'out_of_scope',
    );
    assert.equal(
      ownerReply(
        w,
        'Who approves admin provisioning?',
        [w + '_08'],
        new Set([w + '_08']),
      ).topic,
      'approval',
    );
    assert.equal(
      corpus(w).some((r) => r.lines.join(' ').includes('24-hour expiry')),
      false,
    );
  }
  assert.equal(prompt('investigate').includes('Q1:'), false);
});
test('unsupported packet reference cannot become exposure-grounded', () => {
  const work = {
    receipt: {
      exposures: [
        {
          rows: [
            {
              id: 'packet_c',
              kind: 'agent_packet_claim',
              evidence_ids: ['amber_17'],
            },
          ],
        },
      ],
    },
  };
  assert.equal(
    referenceChain('packet_c', work, { receipt: { exposures: [] } }).available,
    false,
  );
  assert.equal(
    referenceChain('packet_c', work, {
      receipt: { exposures: [{ rows: [{ id: 'amber_17' }] }] },
    }).available,
    true,
  );
  assert.equal(referenceChain('missing', work, {}).available, false);
});
test('failed pair blocks positive performance and keeps answer allocation', () => {
  const report = {
    results: [
      { world: 'amber', repetition: 1, condition: 'investigate', total_ms: 1 },
      {
        world: 'amber',
        repetition: 1,
        condition: 'raw',
        error: 'timeout',
        total_ms: 180000,
      },
      { world: 'amber', repetition: 1, condition: 'organized', total_ms: 1 },
    ],
  };
  const s = metricSummary(report, { answers: [], investigations: [] });
  assert.equal(s.allocated_answers, 20);
  assert.equal(s.pairs[0].complete, false);
  assert.equal(s.descriptive_benefit, false);
  assert.equal(s.arms.raw.missing_usage, 1);
});
test('discrepant synthetic viewer UI is intentional and isolated', () => {
  assert.match(
    html({
      screen: 'settings',
      role: 'viewer',
      version: 1,
      discrepancy: false,
    }),
    /<button disabled>Save/,
  );
  assert.doesNotMatch(
    html({ screen: 'settings', role: 'viewer', version: 1, discrepancy: true }),
    /<button disabled>Save/,
  );
});
test('full allocations and semantic bindings reject duplicate or unbound evidence', async () => {
  const { validateFullReport, validateSemantic, hash } =
    await import('../scripts/evaluation/g08/analyze.mjs');
  const results = ['amber', 'birch', 'cobalt'].flatMap((world) =>
    [1, 2, 3].flatMap((repetition) =>
      ['investigate', 'raw', 'organized'].map((condition) => ({
        world,
        repetition,
        condition,
        session_id: `${world}_${repetition}_${condition}`,
        final: null,
      })),
    ),
  );
  validateFullReport({ results });
  assert.throws(
    () => validateFullReport({ results: [...results.slice(1), results[1]] }),
    /invalid_session_allocation/,
  );
  assert.throws(
    () =>
      validateSemantic(
        { results },
        { report_sha256: hash({ results }), investigations: [], answers: [] },
      ),
    /unbound_semantic_review/,
  );
});
