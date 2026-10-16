import { randomUUID } from 'node:crypto';
import { KnowledgeError } from '../core/normalize.js';
import { sameScope, type DescriptorBundle } from './contracts.js';
type Claim = DescriptorBundle['claims'][number];
const mappings = (b: DescriptorBundle, c: Claim) =>
  b.mappings.filter(
    (m) => m.target_id === c.target_id && sameScope(m.scope, c.scope),
  );
export function freshnessReasons(
  previous: DescriptorBundle,
  next: DescriptorBundle,
  claim: Claim,
): string[] {
  const old = previous.claims.find((c) => c.id === claim.id);
  if (!old) return [];
  const reasons: string[] = [];
  if (JSON.stringify(old.sources) !== JSON.stringify(claim.sources))
    reasons.push('Source references changed');
  if (old.text !== claim.text) reasons.push('Claim content changed');
  if (
    claim.sources.some((ref) => {
      const before = previous.sources.find((s) => s.id === ref.source_id),
        after = next.sources.find((s) => s.id === ref.source_id);
      return before && after && before.content_hash !== after.content_hash;
    })
  )
    reasons.push('Source content changed');
  if (
    claim.sources.some((ref) => {
      const before = previous.sources.find((s) => s.id === ref.source_id),
        after = next.sources.find((s) => s.id === ref.source_id);
      return (
        before && after && before.supplied_revision !== after.supplied_revision
      );
    })
  )
    reasons.push('Source revision changed');
  if (old.scope.version !== claim.scope.version)
    reasons.push('Application version changed');
  if (claim.scope.version === null) reasons.push('Application version unknown');
  const before = mappings(previous, old),
    after = mappings(next, claim),
    target = next.targets.find((t) => t.id === claim.target_id);
  const projection = (items: typeof before) =>
    items
      .map((m) => ({ id: m.id, target_key: m.target_key, status: m.status }))
      .sort((a, b) => a.id.localeCompare(b.id));
  if (
    JSON.stringify(projection(before)) !== JSON.stringify(projection(after)) ||
    previous.targets.find((t) => t.id === old.target_id)?.key !== target?.key
  )
    reasons.push('Target mapping changed');
  if (
    after.length !== 1 ||
    after[0]!.status !== 'resolved' ||
    after[0]!.target_key !== target?.key ||
    next.mappings.filter(
      (m) =>
        sameScope(m.scope, claim.scope) &&
        m.target_key === after[0]!.target_key,
    ).length !== 1
  )
    reasons.push('Target mapping unresolved');
  return reasons;
}
/** Adds review warnings without changing verification timestamps, classes, unknowns or conflicts. */
export function markFreshness(
  previous: DescriptorBundle | null,
  input: DescriptorBundle,
): DescriptorBundle {
  if (!previous) return input;
  const next = JSON.parse(JSON.stringify(input)) as DescriptorBundle;
  for (const claim of next.claims) {
    const reasons = freshnessReasons(previous, next, claim);
    if (!reasons.length) continue;
    const old = previous.claims.find((c) => c.id === claim.id)!;
    const required = [...new Set([...claim.freshness.reasons, ...reasons])];
    if (
      claim.freshness.status === 'needs_review' &&
      JSON.stringify(required) === JSON.stringify(claim.freshness.reasons)
    )
      continue;
    if (claim.revision_id === old.revision_id) {
      claim.supersedes_revision_id = old.revision_id;
      claim.revision_id = randomUUID();
    }
    claim.freshness = { status: 'needs_review', reasons: required };
  }
  return next;
}
export function assertFreshness(
  previous: DescriptorBundle | null,
  next: DescriptorBundle,
  explicitVerification = false,
) {
  if (!previous) return;
  for (const claim of next.claims) {
    const old = previous.claims.find((c) => c.id === claim.id);
    if (!old) continue;
    const required = freshnessReasons(previous, next, claim);
    if (
      required.length &&
      (claim.freshness.status !== 'needs_review' ||
        required.some((r) => !claim.freshness.reasons.includes(r)))
    )
      throw new KnowledgeError('CONFLICT');
    if (
      !explicitVerification &&
      old.freshness.status !== 'current' &&
      claim.freshness.status === 'current'
    )
      throw new KnowledgeError('CONFLICT');
    if (
      !explicitVerification &&
      old.freshness.reasons.some((r) => !claim.freshness.reasons.includes(r))
    )
      throw new KnowledgeError('CONFLICT');
    if (
      !explicitVerification &&
      JSON.stringify(old.verification) !== JSON.stringify(claim.verification)
    )
      throw new KnowledgeError('CONFLICT');
  }
}
