import {
  DescriptorError,
  parseDescriptor,
  DESCRIPTOR_LIMITS,
} from '../contracts.js';
import {
  answerSchema,
  type ProviderInput,
  type ClarificationAnswer,
  type AnswerProvider,
} from './contracts.js';
const rule =
  'Total = quantity × unit price; quantity ≥ 10 receives 10% discount; round half up to two decimals.';
const fixtureCodeHash =
  '9f93d6642e198e285f28afdf84e0bc946469480be7ba46cfbb08100a7ae933fc';
const sorted = (items: string[]) => [...new Set(items)].sort();
/** Finite evidence-derived templates are the grounding boundary. Free-form provider prose is never accepted as a fact. */
export function groundedAnswer(
  input: ProviderInput,
  label: string,
): ClarificationAnswer {
  const { request: r, evidence: e, question_kind: kind } = input;
  const conflicts = sorted(
    e.claims.flatMap((c) => (c.conflicts.length ? [c.id, ...c.conflicts] : [])),
  );
  const warnings = sorted([
    ...e.claims
      .filter((c) => c.freshness.status !== 'current')
      .map(() => 'EVIDENCE_NEEDS_REVIEW'),
    ...e.claims.filter((c) => c.unknown).map(() => 'UNRESOLVED_UNKNOWN'),
    ...(r.scope.version === null ? ['APPLICATION_VERSION_UNKNOWN'] : []),
  ]);
  const result: ClarificationAnswer = {
    schema_version: 1,
    conversation_id: r.conversation_id,
    project_id: r.project_id,
    app_id: r.app_id,
    target_id: r.target_id,
    page_id: r.page_id,
    scope: r.scope,
    evidence_revision_id: e.revision_id!,
    provider_label: label,
    derivation: 'unsupported',
    status: 'unsupported',
    text: 'This deterministic fixture contract cannot answer this request or act on the application. Ask the supported quantity/price question or inspect the documentation.',
    citations: [],
    evidence_classes: [],
    conflicts: conflicts.slice(0, 64),
    missing: [...e.missing],
    warnings,
  };
  if (conflicts.length > 64) result.missing.push('CONFLICT_METADATA_TRUNCATED');
  let selected: typeof e.claims = [];
  if (kind === 'unsupported')
    result.missing.push('SUPPORTED_QUESTION_TEMPLATE');
  else if (kind === 'tax') {
    result.derivation = 'tax';
    result.status = 'unknown';
    result.text =
      'No qualified tax interpretation is available in this deterministic fixture. A supplied applicable tax policy and qualified calculation are required.';
    result.missing.push('SUPPORTED_TAX_POLICY');
  } else if (kind === 'nine_without_context') {
    result.derivation = 'missing';
    result.status = 'unknown';
    result.text =
      'The nine-item follow-up needs a prior supported calculation in this same conversation and scope. Ask the full quantity and unit-price question first.';
    result.missing.push('PRIOR_CALCULATION_CONTEXT');
  } else if (conflicts.length) {
    result.derivation = 'conflict';
    result.status = 'conflict';
    selected = e.claims.filter((c) => conflicts.includes(c.id));
    result.text =
      'Conflicting scoped evidence remains unresolved:\n' +
      selected.map((c) => `[${c.evidence_class}] ${c.text}`).join('\n') +
      '\nNo reconciliation or calculation is established.';
    if (conflicts.some((id) => !selected.some((c) => c.id === id)))
      result.missing.push('CONFLICT_EVIDENCE_INCOMPLETE');
  } else {
    const mappings = e.mappings.filter((m) => m.target_id === r.target_id),
      target = e.targets.find((t) => t.id === r.target_id);
    const mappingReady =
      mappings.length === 1 &&
      mappings[0]!.status === 'resolved' &&
      mappings[0]!.target_key === target?.key &&
      e.mappings.filter((m) => m.target_key === mappings[0]!.target_key)
        .length === 1;
    const rank = (kind: string) =>
      kind === 'documented' ? 0 : kind === 'code-verified' ? 1 : 2;
    const claim = [...e.claims]
      .sort(
        (a, b) =>
          rank(a.evidence_class) - rank(b.evidence_class) ||
          a.id.localeCompare(b.id),
      )
      .find(
        (c) =>
          !c.unknown &&
          c.text === rule &&
          c.sources.every((ref) => {
            const s = e.sources.find((s) => s.id === ref.source_id);
            return (
              s &&
              ((c.evidence_class === 'documented' &&
                s.kind === 'document' &&
                s.excerpt === rule) ||
                (c.evidence_class === 'code-verified' &&
                  s.kind === 'code' &&
                  s.content_hash === fixtureCodeHash &&
                  s.symbol === 'calculate' &&
                  s.supplied_revision === c.verification?.supplied_revision))
            );
          }),
      );
    if (!claim || e.truncated || !mappingReady || r.scope.version === null) {
      result.derivation = 'missing';
      result.status = 'unknown';
      result.text =
        'The scoped evidence cannot establish this fixture calculation. Inspect the missing evidence, version and target mapping before retrying.';
      if (!claim) result.missing.push('QUALIFIED_FIXTURE_RULE');
      if (!mappingReady) result.missing.push('TARGET_MAPPING_UNRESOLVED');
      if (r.scope.version === null)
        result.missing.push('APPLICATION_VERSION_UNKNOWN');
      if (e.truncated) result.missing.push('EVIDENCE_TRUNCATED');
    } else {
      selected = [claim];
      result.status = 'supported';
      result.derivation = kind;
      const prefix = `Using the ${claim.evidence_class} synthetic rule${claim.freshness.status !== 'current' ? ' (needs review)' : ''}: `;
      result.text =
        prefix +
        (kind === 'ten'
          ? '10 × 10 = 100 before discount. Quantity 10 meets the ≥ 10 condition; 10% of 100 is 10, so the total is 90.00 after rounding half up to two decimals.'
          : kind === 'nine'
            ? '9 × 10 = 90. Quantity 9 is below 10, so no quantity discount applies. The total is 90.00 after rounding half up to two decimals.'
            : rule);
    }
  }
  if (conflicts.length > 64 && result.status === 'conflict')
    result.text +=
      '\nAdditional conflict references are omitted from this bounded answer; the disagreement remains unresolved.';
  result.citations = selected.flatMap((c) =>
    c.sources.map((ref) => ({
      claim_id: c.id,
      source_id: ref.source_id,
      source_revision_id: ref.revision_id,
      content_hash: ref.content_hash,
      locator: ref.locator,
      evidence_class: c.evidence_class,
    })),
  );
  if (result.citations.length > 32 || Buffer.byteLength(result.text) > 8192) {
    result.text =
      'Conflicting evidence exceeds this bounded answer view. Inspect the documentation sources; no reconciliation is established.';
    result.citations = result.citations.slice(0, 32);
    result.missing.push('ANSWER_EVIDENCE_TRUNCATED');
  }
  result.evidence_classes = sorted(
    result.citations.map((c) => c.evidence_class),
  ) as typeof result.evidence_classes;
  result.missing = sorted(result.missing);
  const parsed = parseDescriptor(answerSchema, result);
  if (
    Buffer.byteLength(JSON.stringify(parsed)) > DESCRIPTOR_LIMITS.evidenceBytes
  )
    throw new DescriptorError('LIMIT_EXCEEDED');
  return parsed;
}
export function validateAnswer(
  input: ProviderInput,
  output: unknown,
  label: string,
): ClarificationAnswer {
  try {
    const parsed = parseDescriptor(answerSchema, output),
      expected = groundedAnswer(input, label);
    if (JSON.stringify(parsed) !== JSON.stringify(expected))
      throw new Error('UNSUPPORTED_OUTPUT');
    return parsed;
  } catch {
    throw new DescriptorError('INVALID_ANSWER');
  }
}
export async function executeProvider(
  input: ProviderInput,
  provider: AnswerProvider,
  timeoutMs = 2000,
) {
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 5000)
    throw new DescriptorError('INVALID_INPUT');
  let timer: ReturnType<typeof setTimeout> | undefined;
  let output: unknown;
  try {
    output = await Promise.race([
      provider.generate(input),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs);
      }),
    ]);
  } catch {
    throw new DescriptorError('PROVIDER_UNAVAILABLE');
  } finally {
    clearTimeout(timer);
  }
  return validateAnswer(input, output, provider.label);
}
