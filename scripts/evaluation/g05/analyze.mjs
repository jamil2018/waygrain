import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import process from 'node:process';
import { tasks, conditions, cases, expected, median } from './protocol.mjs';
const bool = (v) =>
  ['false', 'no', 'unproven', 'not proven', 'unverified'].includes(
    v.toLowerCase(),
  )
    ? 'false'
    : ['true', 'yes'].includes(v.toLowerCase())
      ? 'true'
      : v;
export function supports(claim, observation, task) {
  const f = observation.facts,
    value = bool(claim.value),
    key = claim.fact;
  const member = f.route === '/members',
    detail = f.route === '/members/:member',
    settings = f.route === '/settings';
  if (key === 'backend_proven') return value === 'false';
  if (key === 'invite_label')
    return member && f.role === 'admin' && value === f.invite_label;
  if (key === 'invite_visible')
    return (
      member &&
      f.role === 'viewer' &&
      f.coverage === 'complete' &&
      value === String(f.invite_visible)
    );
  if (key === 'selected_tab')
    return member && f.role === 'admin' && value === f.selected_tab;
  if (key === 'save_admin' || key === 'save_viewer')
    return settings && f.role === key.slice(5) && value === f.save;
  if (key === 'remove_visible')
    return (
      detail &&
      f.role === 'admin' &&
      f.coverage === 'complete' &&
      value === String(f.remove_visible)
    );
  if (key === 'dialog_open') return member && value === String(f.dialog_open);
  if (key === 'label_changed')
    return (
      task.id === 'invite-change' &&
      member &&
      f.role === 'admin' &&
      value === String(f.invite_label !== 'Invite')
    );
  if (key === 'remove_changed')
    return (
      task.id === 'detail-change' &&
      detail &&
      f.role === 'admin' &&
      f.coverage === 'complete' &&
      value === String(!f.remove_visible)
    );
  return false;
}
export function grade(row) {
  const task = tasks.find((t) => t.id === row.task),
    version = row.case === 'changed' ? 2 : 1,
    want = expected(task, version);
  const obs = row.receipt?.observations ?? [],
    actions = row.receipt?.actions ?? [];
  const claims = row.final?.claims ?? [];
  const unsupported = [];
  for (const c of claims) {
    const refs = c.evidence.map((id) => obs.find((o) => o.id === id));
    if (
      !Object.hasOwn(want, c.fact) ||
      !refs.length ||
      refs.some((o) => !o) ||
      !refs.some((o) => supports(c, o, task)) ||
      (row.case === 'changed' &&
        !refs.some((o) => o.facts.version === 2 && supports(c, o, task)))
    )
      unsupported.push(c.fact);
  }
  const correct = task.facts.every((f) =>
    claims.some((c) => c.fact === f && bool(c.value) === want[f]),
  );
  const required =
    task.id === 'invite-cancel'
      ? [version === 2 ? 'Invite member' : 'Invite', 'Cancel']
      : task.id === 'pending-switch'
        ? ['Pending']
        : task.id === 'active-return'
          ? ['Pending', 'Active']
          : [];
  let wrong_attempts = 0,
    wrong_dispatched = 0,
    invalid_attempts = 0;
  actions.forEach((a, i) => {
    const wrong =
      a.name !== required[i] || a.role !== 'admin' || a.screen !== 'members';
    if (wrong) {
      wrong_attempts++;
      if (a.dispatch === 'dispatched' || a.dispatch === 'uncertain')
        wrong_dispatched++;
    }
    if (a.state !== 'succeeded' || a.dispatch !== 'dispatched')
      invalid_attempts++;
  });
  const taskObs = obs.filter((o) => o.phase === 'task'),
    last = taskObs.at(-1);
  const postEach = actions.every((a, i) => {
    const before = obs.findIndex((o) => o.id === a.before_evidence);
    const next = actions[i + 1]
      ? obs.findIndex((o) => o.id === actions[i + 1].before_evidence)
      : obs.length;
    return taskObs.some((o) => {
      const position = obs.indexOf(o),
        f = o.facts;
      if (
        position <= before ||
        position > next ||
        f.role !== 'admin' ||
        f.route !== '/members'
      )
        return false;
      if (a.name === 'Invite' || a.name === 'Invite member')
        return f.dialog_open;
      if (a.name === 'Cancel') return !f.dialog_open;
      if (a.name === 'Pending' || a.name === 'Active')
        return f.selected_tab === a.name;
      return false;
    });
  });
  const sequence =
    actions.length === required.length &&
    !wrong_attempts &&
    !invalid_attempts &&
    postEach;
  const finalState =
    required.length === 0 ||
    (last?.facts.role === 'admin' &&
      last.facts.route === '/members' &&
      (task.id === 'invite-cancel'
        ? !last.facts.dialog_open
        : last.facts.selected_tab ===
          (task.id === 'pending-switch' ? 'Pending' : 'Active')));
  const freshness =
    row.case !== 'changed' ||
    (correct &&
      claims.length > 0 &&
      !unsupported.length &&
      actions.every(
        (a) => obs.find((o) => o.id === a.before_evidence)?.facts.version === 2,
      ));
  return {
    correct,
    grounded: !unsupported.length && claims.length > 0,
    unsupported_claims: unsupported,
    wrong_attempts,
    wrong_dispatched,
    invalid_attempts,
    action_sequence_correct: sequence,
    observed_final_state_correct: finalState,
    freshness,
    success:
      !row.error &&
      correct &&
      !unsupported.length &&
      sequence &&
      finalState &&
      freshness,
  };
}
export function analyze(matrix, semantic = null) {
  const reviewRows = new Map((semantic?.rows ?? []).map((r) => [r.key, r]));
  if (
    semantic &&
    (reviewRows.size !== matrix.results.length ||
      semantic.rows.length !== matrix.results.length)
  )
    throw new Error('semantic_allocation_mismatch');
  const scored = matrix.results.map((row) => {
    const automated = grade(row);
    const key = [row.task, row.condition, row.case, row.repetition].join('|');
    const reviewed = reviewRows.get(key);
    if (
      semantic &&
      (!reviewed ||
        reviewed.final_sha256 !==
          createHash('sha256')
            .update(JSON.stringify(row.final))
            .digest('hex') ||
        ['correct', 'grounded', 'freshness'].some(
          (k) => typeof reviewed[k] !== 'boolean',
        ) ||
        !Array.isArray(reviewed.unsupported_claims))
    )
      throw new Error('semantic_artifact_mismatch');
    const score = reviewed
      ? {
          ...automated,
          correct: reviewed.correct,
          grounded: reviewed.grounded,
          freshness: reviewed.freshness,
          unsupported_claims: reviewed.unsupported_claims,
        }
      : automated;
    if (reviewed)
      score.success =
        !row.error &&
        score.correct &&
        score.grounded &&
        score.freshness &&
        !score.unsupported_claims.length &&
        score.action_sequence_correct &&
        score.observed_final_state_correct;
    return { ...row, automated_score: automated, score };
  });
  const distributions = conditions.flatMap((condition) =>
    cases.map((caseName) => {
      const rows = scored.filter(
        (r) => r.condition === condition && r.case === caseName,
      );
      const perTask = tasks.map((t) => {
        const rs = rows.filter((r) => r.task === t.id);
        return {
          task: t.id,
          n: rs.length,
          total_ms: median(rs.map((r) => r.total_ms)),
          residual_host_ms: median(rs.map((r) => r.residual_host_ms)),
          browser_calls: median(
            rs.map((r) => r.receipt?.browser_calls ?? null),
          ),
          task_browser_calls: median(
            rs.map((r) =>
              r.receipt
                ? r.receipt.tool_calls?.filter((c) =>
                    c.tool.startsWith('browser_'),
                  ).length
                : null,
            ),
          ),
          tokens: median(
            rs.map((r) => (r.tokens ? r.tokens.input + r.tokens.output : null)),
          ),
        };
      });
      return {
        condition,
        case: caseName,
        attempts: rows.length,
        success: rows.filter((r) => r.score.success).length,
        wrong_attempts: rows.reduce((n, r) => n + r.score.wrong_attempts, 0),
        wrong_dispatched: rows.reduce(
          (n, r) => n + r.score.wrong_dispatched,
          0,
        ),
        invalid_attempts: rows.reduce(
          (n, r) => n + r.score.invalid_attempts,
          0,
        ),
        unsupported_claims: rows.reduce(
          (n, r) => n + r.score.unsupported_claims.length,
          0,
        ),
        freshness_failures: rows.filter((r) => !r.score.freshness).length,
        per_task_medians: perTask,
        median_total_ms: median(perTask.map((t) => t.total_ms)),
        median_residual_host_ms: median(perTask.map((t) => t.residual_host_ms)),
        median_browser_calls: median(perTask.map((t) => t.browser_calls)),
        median_tokens: median(perTask.map((t) => t.tokens)),
        rows: rows.map((r) => ({
          task: r.task,
          repetition: r.repetition,
          total_ms: r.total_ms,
          residual_host_ms: r.residual_host_ms,
          browser_calls: r.receipt?.browser_calls ?? null,
          retained_bytes: r.receipt?.retained_bytes ?? null,
          tokens: r.tokens,
          error: r.error,
          score: r.score,
        })),
      };
    }),
  );
  const warm = (c) =>
    distributions.find((d) => d.condition === c && d.case === 'warm');
  const gain = (key) => {
    const bs = conditions
      .slice(0, 2)
      .map((c) => ({ condition: c, value: warm(c)[key] }));
    if (bs.some((b) => b.value === null) || warm('waygrain')[key] === null)
      return { status: 'unmeasured' };
    const b = bs.sort((a, b) => a.value - b.value)[0],
      w = warm('waygrain')[key];
    return {
      baseline: b.condition,
      baseline_value: b.value,
      waygrain_value: w,
      fraction: b.value === 0 ? null : (b.value - w) / b.value,
      pass: b.value > 0 && (b.value - w) / b.value >= 0.2,
    };
  };
  const calls = gain('median_browser_calls'),
    time = gain('median_total_ms'),
    tokens = gain('median_tokens');
  const cold = distributions.filter((d) => d.case === 'cold');
  const coldBase = Math.min(
    ...cold
      .filter((d) => d.condition !== 'waygrain')
      .map((d) => d.median_total_ms),
  );
  const coldOverhead =
    cold.find((d) => d.condition === 'waygrain').median_total_ms / coldBase - 1;
  const allocation = new Set(
    matrix.results.map((r) =>
      [r.task, r.condition, r.case, r.repetition].join('|'),
    ),
  );
  const valid =
    matrix.results.length === 270 &&
    allocation.size === 270 &&
    !matrix.smoke &&
    tasks.every((t) =>
      conditions.every((c) =>
        cases.every((k) =>
          [1, 2, 3].every((n) => allocation.has([t.id, c, k, n].join('|'))),
        ),
      ),
    );
  return {
    matrix_sha256: createHash('sha256')
      .update(JSON.stringify(matrix))
      .digest('hex'),
    complete_allocation: valid,
    semantic_review: semantic ?? 'pending_independent_review',
    distributions,
    gates: {
      warm_efficiency: {
        calls,
        time,
        tokens,
        pass: valid && calls.pass && (time.pass || tokens.pass),
      },
      cold_overhead: {
        fraction: Number.isFinite(coldOverhead) ? coldOverhead : null,
        within_15_percent:
          Number.isFinite(coldOverhead) && coldOverhead <= 0.15,
        break_even: 'not_established',
      },
      correctness_action_freshness: semantic
        ? {
            no_regression:
              valid &&
              cases.every((k) => {
                const ds = distributions.filter((d) => d.case === k),
                  w = ds.find((d) => d.condition === 'waygrain'),
                  bs = ds.filter((d) => d.condition !== 'waygrain');
                return (
                  w.success >= Math.max(...bs.map((d) => d.success)) &&
                  w.unsupported_claims <=
                    Math.min(...bs.map((d) => d.unsupported_claims))
                );
              }),
            no_additional_wrong_actions:
              valid &&
              cases.every((k) => {
                const ds = distributions.filter((d) => d.case === k),
                  w = ds.find((d) => d.condition === 'waygrain'),
                  bs = ds.filter((d) => d.condition !== 'waygrain');
                return [
                  'wrong_attempts',
                  'wrong_dispatched',
                  'invalid_attempts',
                ].every((key) => w[key] <= Math.min(...bs.map((d) => d[key])));
              }),
            changed_freshness:
              valid &&
              distributions
                .filter(
                  (d) => d.case === 'changed' && d.condition === 'waygrain',
                )
                .every((d) => d.freshness_failures === 0),
          }
        : 'pending_semantic_review',
    },
    errors: scored
      .filter((r) => r.error)
      .map((r) => ({
        task: r.task,
        condition: r.condition,
        case: r.case,
        repetition: r.repetition,
        error: r.error,
      })),
    scored_answers: scored.map((r) => ({
      task: r.task,
      condition: r.condition,
      case: r.case,
      repetition: r.repetition,
      final: r.final,
      automated_score: r.automated_score,
      score: r.score,
    })),
  };
}
if (process.argv[1]?.endsWith('/analyze.mjs')) {
  const matrix = JSON.parse(await readFile(process.argv[2], 'utf8'));
  const semantic = process.argv[4]
    ? JSON.parse(await readFile(process.argv[4], 'utf8'))
    : null;
  const summary = analyze(matrix, semantic);
  await writeFile(process.argv[3], JSON.stringify(summary, null, 2) + '\n', {
    mode: 0o600,
  });
}
