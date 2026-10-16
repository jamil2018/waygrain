import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import type { Store } from '../store/database.js';
import { authorize } from './retrieval.js';
import { readBundle, previewBundle, writeBundle } from './store.js';
import {
  boundedText,
  contentHash,
  idSchema,
  scopeSchema,
  parseDescriptor,
  writeRequestSchema,
  DescriptorError,
  type AccessContext,
  type DescriptorBundle,
} from './contracts.js';

export function authorizeAuthorBundle(
  context: AccessContext,
  bundle: DescriptorBundle,
) {
  if (
    !context.author ||
    !context.grants.some(
      (g) => g.project_id === bundle.project_id && g.app_id === bundle.app_id,
    )
  )
    throw new DescriptorError('ACCESS_DENIED');
  for (const { scope } of [
    ...bundle.documents,
    ...bundle.claims,
    ...bundle.sources,
    ...bundle.mappings,
  ])
    authorize(
      context,
      {
        schema_version: 1,
        project_id: bundle.project_id,
        app_id: bundle.app_id,
        target_id: bundle.targets[0]?.id ?? bundle.app_id,
        scope,
      },
      true,
    );
}
const sourceImportSchema = z.strictObject({
  kind: z.literal('source'),
  expected_revision: z.number().int().min(0),
  project_id: idSchema,
  app_id: idSchema,
  target_id: idSchema,
  scope: scopeSchema,
  source_id: idSchema,
  title: boundedText(4096).min(1),
  origin: boundedText(4096).min(1),
  content: boundedText(4096).min(1),
  locator: boundedText(4096).min(1),
  source_kind: z.enum(['document', 'observation', 'code']),
  supplied_revision: z.string().min(1).max(128).nullable(),
  symbol: boundedText(4096).nullable(),
  observation_id: z.string().min(1).max(128).nullable(),
});
export const importSchema = z.discriminatedUnion('kind', [
  sourceImportSchema,
  z.strictObject({ kind: z.literal('bundle'), candidate: writeRequestSchema }),
]);
const receiptSchema = z.strictObject({
  expected_revision: z.number().int().min(0),
  digest: z.string().regex(/^[a-f0-9]{64}$/),
});
export const importCommitSchema = z.strictObject({
  candidate: writeRequestSchema,
  receipt: receiptSchema,
});
function sourceCandidate(
  store: Store,
  context: AccessContext,
  input: z.infer<typeof sourceImportSchema>,
) {
  authorize(
    context,
    {
      schema_version: 1,
      project_id: input.project_id,
      app_id: input.app_id,
      target_id: input.target_id,
      scope: input.scope,
    },
    true,
  );
  const old = readBundle(store, input.app_id);
  if (!old || !old.targets.some((t) => t.id === input.target_id))
    throw new DescriptorError('NOT_FOUND');
  authorizeAuthorBundle(context, old);
  if (old.sources.some((s) => s.id === input.source_id))
    throw new DescriptorError('CONFLICT');
  const b = JSON.parse(JSON.stringify(old)) as DescriptorBundle;
  b.supersedes_revision_id = old.revision_id;
  b.revision_id = randomUUID();
  const revision_id = randomUUID();
  const source = {
    id: input.source_id,
    revision_id,
    supersedes_revision_id: null,
    scope: input.scope,
    kind: input.source_kind,
    title: input.title,
    origin: input.origin,
    excerpt: input.content,
    content_hash: contentHash(input.content),
    locator: input.locator,
    supplied_revision: input.supplied_revision,
    symbol: input.symbol,
    observation_id: input.observation_id,
  };
  b.sources.push(source);
  const claim = {
    id: randomUUID(),
    revision_id: randomUUID(),
    supersedes_revision_id: null,
    target_id: input.target_id,
    scope: input.scope,
    text: input.content,
    evidence_class:
      input.source_kind === 'code'
        ? ('inferred' as const)
        : input.source_kind === 'observation'
          ? ('observed' as const)
          : ('documented' as const),
    sources: [
      {
        source_id: source.id,
        revision_id,
        content_hash: source.content_hash,
        locator: source.locator,
      },
    ],
    recorded_at: new Date().toISOString(),
    verification: null,
    confidence: {
      level: 'low' as const,
      reason:
        'Imported supplied content; no independent code or host verification performed.',
    },
    unknown: input.source_kind === 'code',
    conflicts: [],
    freshness: {
      status: 'unknown' as const,
      reasons: ['Imported source requires explicit review'],
    },
  };
  b.claims.push(claim);
  const document = b.documents.find(
    (d) =>
      d.target_id === input.target_id &&
      JSON.stringify(d.scope) === JSON.stringify(input.scope),
  );
  if (document) {
    document.supersedes_revision_id = document.revision_id;
    document.revision_id = randomUUID();
    document.claim_ids.push(claim.id);
  }
  return parseDescriptor(writeRequestSchema, {
    schema_version: 1,
    expected_revision: input.expected_revision,
    bundle: b,
  });
}
export function previewImport(
  store: Store,
  context: AccessContext,
  input: unknown,
) {
  const parsed = parseDescriptor(importSchema, input);
  const candidate =
    parsed.kind === 'bundle'
      ? parsed.candidate
      : sourceCandidate(store, context, parsed);
  authorizeAuthorBundle(context, candidate.bundle);
  previewBundle(store, candidate);
  const validated = {
    candidate,
    receipt: {
      expected_revision: candidate.expected_revision,
      digest: contentHash(JSON.stringify(candidate)),
    },
    valid: true,
  };
  // Preview must also fit the exact commit envelope, including its receipt.
  parseDescriptor(importCommitSchema, {
    candidate,
    receipt: validated.receipt,
  });
  return validated;
}
export function commitImport(
  store: Store,
  context: AccessContext,
  input: unknown,
) {
  const { candidate, receipt } = parseDescriptor(importCommitSchema, input);
  authorizeAuthorBundle(context, candidate.bundle);
  if (
    receipt.expected_revision !== candidate.expected_revision ||
    receipt.digest !== contentHash(JSON.stringify(candidate))
  )
    throw new DescriptorError('CONFLICT');
  return writeBundle(store, candidate);
}
