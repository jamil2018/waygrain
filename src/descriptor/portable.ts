import { z } from 'zod';
import type { Store } from '../store/database.js';
import {
  bundleSchema,
  contentHash,
  parseDescriptor,
  DescriptorError,
  type AccessContext,
} from './contracts.js';
import { authorizeAuthorBundle } from './authoring.js';
import { bundleHistory, restoreBundleHistory } from './store.js';

export const archiveSchema = z.strictObject({
  format: z.literal('waygrain-descriptor-history'),
  schema_version: z.literal(1),
  history: z.array(bundleSchema).min(1).max(64),
});
const candidateSchema = z.strictObject({
  expected_revision: z.number().int().min(0),
  archive: archiveSchema,
});
const commitSchema = z.strictObject({
  candidate: candidateSchema,
  digest: z.string().regex(/^[a-f0-9]{64}$/),
});
export function exportDescriptor(
  store: Store,
  context: AccessContext,
  appId: string,
) {
  const history = store.transaction(() => bundleHistory(store, appId), false);
  if (!history.length) throw new DescriptorError('NOT_FOUND');
  for (const bundle of history) authorizeAuthorBundle(context, bundle);
  const archive = parseDescriptor(archiveSchema, {
    format: 'waygrain-descriptor-history',
    schema_version: 1,
    history,
  });
  // Every successful export must fit the largest supported restore commit envelope.
  parseDescriptor(commitSchema, {
    candidate: { expected_revision: Number.MAX_SAFE_INTEGER, archive },
    digest: '0'.repeat(64),
  });
  return archive;
}

export function previewRestore(
  store: Store,
  context: AccessContext,
  input: unknown,
) {
  const candidate = parseDescriptor(candidateSchema, input);
  for (const bundle of candidate.archive.history)
    authorizeAuthorBundle(context, bundle);
  const result = restoreBundleHistory(
    store,
    candidate.expected_revision,
    candidate.archive.history,
    true,
  );
  const receipt = { candidate, digest: contentHash(JSON.stringify(candidate)) };
  parseDescriptor(commitSchema, receipt);
  return { ...receipt, ...result };
}
export function commitRestore(
  store: Store,
  context: AccessContext,
  input: unknown,
) {
  const { candidate, digest } = parseDescriptor(commitSchema, input);
  for (const bundle of candidate.archive.history)
    authorizeAuthorBundle(context, bundle);
  if (contentHash(JSON.stringify(candidate)) !== digest)
    throw new DescriptorError('CONFLICT');
  return restoreBundleHistory(
    store,
    candidate.expected_revision,
    candidate.archive.history,
  );
}
