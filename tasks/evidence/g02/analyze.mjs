import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import {
  conditions,
  cases,
  tasks,
  grade,
  median,
} from '../../../scripts/evaluation/protocol.mjs';
const source = await readFile(new URL('./matrix.json', import.meta.url));
const matrix = JSON.parse(source);
assert.equal(matrix.repetitions, 3);
assert.equal(matrix.batch_size, 10);
assert.equal(matrix.results.length, 27);
assert.equal(matrix.host.model, 'gpt-6.1-sol');
assert.equal(matrix.host.reasoning, 'low');
assert.equal(matrix.host.ephemeral, true);
const seen = new Set();
for (const row of matrix.results) {
  const key = [row.condition, row.case, row.repetition].join('/');
  assert(!seen.has(key));
  seen.add(key);
  assert(
    conditions.includes(row.condition) &&
      cases.includes(row.case) &&
      [1, 2, 3].includes(row.repetition),
  );
  assert.deepEqual(
    row.task_results,
    grade(row.host?.answers, row.case === 'changed' ? 2 : 1),
  );
  for (const k of ['total_ms', 'browser_calls', 'retained_bytes'])
    assert(Number.isFinite(row[k]) && row[k] >= 0);
  if (!row.error)
    assert(Object.values(row.cleanup).every((v) => v === 'complete'));
}
const comparability = [];
for (const caseName of cases)
  for (let r = 1; r <= 3; r++) {
    const rows = matrix.results.filter(
      (x) => x.case === caseName && x.repetition === r,
    );
    assert.equal(rows.length, 3);
    const available = rows.map((x) => x.context_sha256).filter(Boolean);
    comparability.push({
      case: caseName,
      repetition: r,
      available: available.length,
      identical: new Set(available).size === 1,
    });
  }
const measurements = conditions.flatMap((condition) =>
  cases.map((caseName) => {
    const rows = matrix.results.filter(
      (r) => r.condition === condition && r.case === caseName,
    );
    const values = (k) => rows.map((r) => r[k]);
    const tokens = rows.map((r) =>
      r.host?.tokens ? r.host.tokens.input + r.host.tokens.output : null,
    );
    return {
      condition,
      case: caseName,
      total_ms: values('total_ms'),
      batch_ms: values('task_batch_ms'),
      priming_ms: values('priming_ms'),
      browser_calls: values('browser_calls'),
      retained_bytes: values('retained_bytes'),
      tokens,
      median_total_ms: median(values('total_ms')),
      median_batch_ms: median(values('task_batch_ms')),
      median_browser_calls: median(values('browser_calls')),
      median_tokens: tokens.every((v) => v !== null) ? median(tokens) : null,
      success: rows
        .filter((r) => !r.error)
        .flatMap((r) => r.task_results)
        .filter((t) => t.correct && t.grounded).length,
      attempts: rows.length * tasks.length,
      failed_batches: rows.filter((r) => r.error).length,
    };
  }),
);
const get = (condition, caseName) =>
  measurements.find((r) => r.condition === condition && r.case === caseName);
const stronger = (metric) =>
  ['browser-only', 'notes-folder'].reduce((a, b) =>
    get(a, 'warm')[metric] <= get(b, 'warm')[metric] ? a : b,
  );
const improvement = (base, value) =>
  base === 0 ? null : (base - value) / base;
const callBase = stronger('median_browser_calls'),
  timeBase = stronger('median_total_ms'),
  tokenBase = conditions.every((c) => get(c, 'warm').median_tokens !== null)
    ? stronger('median_tokens')
    : null;
const w = get('waygrain', 'warm');
const callGain = improvement(
  get(callBase, 'warm').median_browser_calls,
  w.median_browser_calls,
);
const timeGain = improvement(
  get(timeBase, 'warm').median_total_ms,
  w.median_total_ms,
);
const tokenGain =
  w.median_tokens === null || tokenBase === null
    ? null
    : improvement(get(tokenBase, 'warm').median_tokens, w.median_tokens);
const success = (condition) =>
  measurements
    .filter((m) => m.condition === condition)
    .reduce((sum, m) => sum + m.success, 0);
const coldBase = Math.min(
  ...['browser-only', 'notes-folder'].map(
    (c) => get(c, 'cold').median_total_ms,
  ),
);
const coldOverhead =
  (get('waygrain', 'cold').median_total_ms - coldBase) / coldBase;
const failures = matrix.results.flatMap((r) =>
  r.task_results
    .filter((t) => t.failure)
    .map((t) => ({
      condition: r.condition,
      case: r.case,
      repetition: r.repetition,
      ...t,
    })),
);
const comparable = comparability.every((c) => c.available === 3 && c.identical);
const successfulBatches = matrix.results.every((r) => !r.error);
const summary = {
  comparability,
  matrix_sha256: createHash('sha256').update(source).digest('hex'),
  attempted_answers: 270,
  measurements,
  failures,
  batch_errors: matrix.results
    .filter((r) => r.error)
    .map((r) => ({
      condition: r.condition,
      case: r.case,
      repetition: r.repetition,
      error: r.error,
    })),
  unsupported_constrained_answers: matrix.results
    .flatMap((r) => r.task_results)
    .filter((t) => !t.correct && t.failure !== 'invalid_response').length,
  invalid_response_answers: matrix.results
    .flatMap((r) => r.task_results)
    .filter((t) => t.failure === 'invalid_response').length,
  ui_actions: { executed: 0, wrong_action_release_gate: 'unmeasured' },
  bounded_gates: {
    warm_efficiency: {
      call_baseline: callBase,
      time_baseline: timeBase,
      token_baseline: tokenBase,
      call_improvement: callGain,
      time_improvement: timeGain,
      token_improvement: tokenGain,
      pass:
        comparable &&
        successfulBatches &&
        callGain !== null &&
        callGain >= 0.2 &&
        ((timeGain !== null && timeGain >= 0.2) ||
          (tokenGain !== null && tokenGain >= 0.2)),
    },
    constrained_correctness_no_regression: {
      counts: Object.fromEntries(conditions.map((c) => [c, success(c)])),
      pass:
        success('waygrain') >=
        Math.max(success('browser-only'), success('notes-folder')),
    },
    cold_overhead: {
      fraction: coldOverhead,
      within_15_percent: coldOverhead <= 0.15,
      break_even: 'not_established',
    },
    changed_answers_correct: {
      pass: get('waygrain', 'changed').success === 30,
    },
  },
  original_release_gates: {
    agent_directed_efficiency: 'unqualified_scripted_driver',
    open_ended_correctness: 'unmeasured',
    wrong_ui_actions: 'unmeasured_no_actions',
    autonomous_change_detection: 'unmeasured_forced_refresh',
    human_adoption: 'unmet_agent_proxy_only',
    second_application: 'unverified',
    second_host: 'deferred_unverified',
  },
};
await writeFile(
  new URL('./summary.json', import.meta.url),
  JSON.stringify(summary, null, 2) + '\n',
);
