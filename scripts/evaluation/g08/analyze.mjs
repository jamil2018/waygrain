import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import process from 'node:process';
import { median } from '../g07/protocol.mjs';
export const hash = (value) =>
  createHash('sha256').update(JSON.stringify(value)).digest('hex');
export const baseId = (ref) => ref.split('#')[0];
export function validateFullReport(report) {
  const expected = new Set(
    ['amber', 'birch', 'cobalt'].flatMap((w) =>
      [1, 2, 3].flatMap((n) =>
        ['investigate', 'raw', 'organized'].map((c) => `${w}_${n}_${c}`),
      ),
    ),
  );
  if (report.results.length !== 27)
    throw new Error('invalid_session_allocation');
  for (const r of report.results) {
    if (
      r.session_id !== `${r.world}_${r.repetition}_${r.condition}` ||
      !expected.delete(r.session_id)
    )
      throw new Error('invalid_session_allocation');
  }
  if (expected.size) throw new Error('invalid_session_allocation');
}
export function validateSemantic(report, semantic) {
  validateFullReport(report);
  if (
    semantic.report_sha256 !== hash(report) ||
    semantic.investigations.length !== 9 ||
    semantic.answers.length !== 180
  )
    throw new Error('unbound_semantic_review');
  const invExpected = new Set(
    report.results
      .filter((r) => r.condition === 'investigate')
      .map((r) => r.session_id),
  );
  const answerExpected = new Set(
    report.results
      .filter((r) => r.condition !== 'investigate')
      .flatMap((r) =>
        Array.from({ length: 10 }, (_, i) => `${r.session_id}:Q${i + 1}`),
      ),
  );
  for (const i of semantic.investigations) {
    const r = report.results.find((r) => r.session_id === i.session_id);
    if (
      !r ||
      !invExpected.delete(i.session_id) ||
      i.final_sha256 !== hash(r.final) ||
      i.exposure_sha256 !== hash(r.receipt?.exposures ?? [])
    )
      throw new Error('unbound_semantic_review');
  }
  for (const a of semantic.answers) {
    const r = report.results.find((r) => r.session_id === a.session_id);
    const inv = report.results.find(
      (i) =>
        i.world === r?.world &&
        i.repetition === r?.repetition &&
        i.condition === 'investigate',
    );
    const answer =
      r?.final?.answers.find((v) => v.question_id === a.question_id) ?? null;
    if (
      !r ||
      !answerExpected.delete(`${a.session_id}:${a.question_id}`) ||
      a.condition !== r.condition ||
      a.world !== r.world ||
      a.answer_sha256 !== hash(answer) ||
      a.exposure_sha256 !== hash(r.receipt?.exposures ?? []) ||
      a.investigator_final_sha256 !== hash(inv.final)
    )
      throw new Error('unbound_semantic_review');
  }
}
export function exposedRows(row) {
  return (row.receipt?.exposures ?? []).flatMap((e) => e.rows);
}
export function referenceChain(ref, row, investigator) {
  const id = baseId(ref),
    direct = exposedRows(row).filter((r) => r.id === id);
  if (!direct.length) return { available: false, route: 'unexposed' };
  if (!id.startsWith('packet_'))
    return { available: true, route: 'direct', records: direct };
  const claims = direct.filter((r) => r.kind === 'agent_packet_claim');
  const invRows = exposedRows(investigator);
  const origins = claims.flatMap((c) => c.evidence_ids.map(baseId));
  return {
    available:
      origins.length > 0 &&
      origins.every((i) => invRows.some((r) => r.id === i)),
    route: 'packet_lineage',
    records: claims,
    origins: invRows.filter((r) => origins.includes(r.id)),
  };
}
export function metricSummary(report, semantic = null) {
  if (report.smoke === false) validateFullReport(report);
  if (semantic && report.smoke === false) validateSemantic(report, semantic);
  const pairs = [],
    investigators = report.results.filter((r) => r.condition === 'investigate');
  for (const inv of investigators) {
    const rows = report.results.filter(
      (r) =>
        r.world === inv.world &&
        r.repetition === inv.repetition &&
        r.condition !== 'investigate',
    );
    const raw = rows.find((r) => r.condition === 'raw'),
      org = rows.find((r) => r.condition === 'organized');
    const complete = [inv, raw, org].every(
      (r) =>
        r &&
        !r.error &&
        r.final &&
        r.tokens &&
        Object.values(r.receipt?.cleanup ?? {}).length === 4 &&
        Object.values(r.receipt.cleanup).every((v) => v === 'complete'),
    );
    pairs.push({
      world: inv.world,
      repetition: inv.repetition,
      complete,
      identical_shared:
        raw?.receipt?.shared_sha256 === org?.receipt?.shared_sha256,
      time_ratio: complete ? org.total_ms / raw.total_ms : null,
      token_ratio: complete
        ? (org.tokens.input + org.tokens.output) /
          (raw.tokens.input + raw.tokens.output)
        : null,
      raw_ms: raw?.total_ms,
      organized_ms: org?.total_ms,
      raw_tokens: raw?.tokens ? raw.tokens.input + raw.tokens.output : null,
      organized_tokens: org?.tokens
        ? org.tokens.input + org.tokens.output
        : null,
    });
  }
  const arms = Object.fromEntries(
    ['investigate', 'raw', 'organized'].map((c) => {
      const rows = report.results.filter((r) => r.condition === c);
      return [
        c,
        {
          allocated: rows.length,
          errors: rows
            .filter((r) => r.error)
            .map((r) => ({ session_id: r.session_id, error: r.error })),
          median_ms: median(rows.map((r) => r.total_ms)),
          median_tokens: median(
            rows.map((r) =>
              r.tokens ? r.tokens.input + r.tokens.output : NaN,
            ),
          ),
          measured_tokens_sum: rows.reduce(
            (a, r) => a + (r.tokens ? r.tokens.input + r.tokens.output : 0),
            0,
          ),
          missing_usage: rows.filter((r) => !r.tokens).length,
          browser_calls: rows.map((r) => r.receipt?.browser_calls ?? null),
          source_calls: rows.map(
            (r) =>
              r.receipt?.tool_calls.filter((t) => t.tool.startsWith('source_'))
                .length ?? null,
          ),
          owner_calls: rows.map((r) => r.receipt?.owner_replies.length ?? null),
        },
      ];
    }),
  );
  const paired = {
    time_ratio: median(pairs.map((p) => p.time_ratio ?? NaN)),
    token_ratio: median(pairs.map((p) => p.token_ratio ?? NaN)),
  };
  const worlds = ['amber', 'birch', 'cobalt'].map((world) => ({
    world,
    median_time_ratio: median(
      pairs.filter((p) => p.world === world).map((p) => p.time_ratio ?? NaN),
    ),
    median_token_ratio: median(
      pairs.filter((p) => p.world === world).map((p) => p.token_ratio ?? NaN),
    ),
  }));
  let quality = null;
  if (semantic) {
    const all = semantic.answers;
    const counts = (arm, world = null) =>
      all.filter(
        (a) =>
          a.condition === arm && (!world || a.world === world) && a.success,
      ).length;
    const critical = (arm, world = null) =>
      all.filter(
        (a) =>
          a.condition === arm && (!world || a.world === world) && a.critical,
      ).length;
    const noRegression = [null, 'amber', 'birch', 'cobalt'].every(
      (w) =>
        counts('organized', w) >= counts('raw', w) &&
        critical('organized', w) <= critical('raw', w),
    );
    quality = {
      investigation_success: semantic.investigations.filter((i) => i.success)
        .length,
      raw_success: counts('raw'),
      organized_success: counts('organized'),
      critical_raw: critical('raw'),
      critical_organized: critical('organized'),
      no_regression: noRegression,
      absolute_success:
        semantic.investigations.length === 9 &&
        semantic.investigations.every((i) => i.success) &&
        counts('raw') === 90 &&
        counts('organized') === 90 &&
        !all.some((a) => a.critical),
      per_world: ['amber', 'birch', 'cobalt'].map((w) => ({
        world: w,
        raw: counts('raw', w),
        organized: counts('organized', w),
      })),
    };
  }
  return {
    allocated_sessions: report.results.length,
    allocated_answers:
      report.results.filter((r) => r.condition !== 'investigate').length * 10,
    arms,
    pairs,
    paired,
    worlds,
    quality,
    descriptive_benefit: quality
      ? pairs.length === 9 &&
        pairs.every((p) => p.complete && p.identical_shared) &&
        quality.no_regression &&
        (paired.time_ratio <= 0.8 || paired.token_ratio <= 0.8)
      : null,
    interpretation:
      'Marginal organized-packet reuse over identically acquired evidence; not from-zero or amortized product superiority. Investigation and source curation costs separate. Correlated batches; small nine-pair synthetic sample.',
  };
}
if (process.argv[1]?.endsWith('/g08/analyze.mjs')) {
  const report = JSON.parse(await readFile(process.argv[2], 'utf8'));
  const semantic = process.argv[4]
    ? JSON.parse(await readFile(process.argv[4], 'utf8'))
    : null;
  await writeFile(
    process.argv[3],
    JSON.stringify(metricSummary(report, semantic), null, 2) + '\n',
  );
}
