import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import type { Store } from '../store/database.js';
import {
  idSchema,
  scopeSchema,
  sameScope,
  parseDescriptor,
  DescriptorError,
  type AccessContext,
} from './contracts.js';
import { authorize } from './retrieval.js';
import { authorizeAuthorBundle } from './authoring.js';
import { readBundle, writeBundle } from './store.js';
import { freshnessReasons } from './freshness.js';
const verifySchema = z.strictObject({
  schema_version: z.literal(1),
  expected_revision: z.number().int().min(0),
  project_id: idSchema,
  app_id: idSchema,
  claim_id: idSchema,
  scope: scopeSchema,
  method: z.enum(['supplied-source-review', 'synthetic-behavior-test']),
});
export function verifyClaim(
  store: Store,
  context: AccessContext,
  input: unknown,
  now = new Date().toISOString(),
) {
  const request = parseDescriptor(verifySchema, input);
  if (request.project_id !== store.location.configuration.project_id)
    throw new DescriptorError('ACCESS_DENIED');
  authorize(
    context,
    {
      schema_version: 1,
      project_id: request.project_id,
      app_id: request.app_id,
      target_id: request.claim_id,
      scope: request.scope,
    },
    true,
  );
  const previous = readBundle(store, request.app_id);
  if (!previous) throw new DescriptorError('NOT_FOUND');
  authorizeAuthorBundle(context, previous);
  const next = JSON.parse(JSON.stringify(previous)) as typeof previous;
  const claim = next.claims.find(
    (c) => c.id === request.claim_id && sameScope(c.scope, request.scope),
  );
  if (!claim) throw new DescriptorError('NOT_FOUND');
  if (
    freshnessReasons(previous, previous, claim).length ||
    Date.parse(now) < Date.parse(claim.verification?.at ?? claim.recorded_at)
  )
    throw new DescriptorError('CONFLICT');
  const code = next.sources.find(
    (s) =>
      claim.sources.some((ref) => ref.source_id === s.id) && s.kind === 'code',
  );
  claim.supersedes_revision_id = claim.revision_id;
  claim.revision_id = randomUUID();
  claim.verification = {
    at: now,
    actor: context.principal,
    method: request.method,
    scope: claim.scope,
    supplied_revision:
      claim.evidence_class === 'code-verified' ? code!.supplied_revision : null,
  };
  claim.freshness = { status: 'current', reasons: [] };
  next.supersedes_revision_id = previous.revision_id;
  next.revision_id = randomUUID();
  return writeBundle(
    store,
    {
      schema_version: 1,
      expected_revision: request.expected_revision,
      bundle: next,
    },
    true,
  );
}
