import { z } from 'zod';

export const KNOWLEDGE_SCHEMA_VERSION = 1;
export const BROWSER_SCHEMA_VERSION = 1;
export const LIMITS = Object.freeze({
  ingest_bytes: 1024 * 1024,
  tree_nodes: 5000,
  tree_depth: 64,
  text_bytes: 4096,
  commit_operations: 100,
  default_records: 20,
  max_records: 50,
  default_output_bytes: 8192,
  max_neighbor_hops: 3,
  max_path_depth: 8,
  max_visited_nodes: 500,
  future_tolerance_ms: 300_000,
  default_max_age_seconds: 86_400,
});
export const id = z.uuid();
export const key = z
  .string()
  .min(1)
  .max(128)
  .regex(/^[A-Za-z0-9_-]+$/);
export const alias = z.string().regex(/^[a-z][a-z0-9_-]{0,63}$/);
// Byte bounds are also checked by the contract parser; maxLength bounds schema consumers.
export const text = z.string().max(LIMITS.text_bytes);
export const timestamp = z.iso.datetime();
export const revision = z.number().int().min(0).max(Number.MAX_SAFE_INTEGER);
export const hash = z.string().regex(/^[a-f0-9]{64}$/);
export const origin = z
  .url({ protocol: /^https?$/ })
  .max(2048)
  .regex(/^https?:\/\/[^\s/?#@]+$/)
  .refine((value) => {
    try {
      return new URL(value).origin === value;
    } catch {
      return false;
    }
  });
export const route = z
  .string()
  .max(1024)
  .regex(/^\/(?:[a-zA-Z0-9_:/.-]*)$/)
  .refine(
    (value) => !value.split('/').some((part) => part === '.' || part === '..'),
  );
export const scope = z.strictObject({
  environment: alias,
  origin,
  role: alias.default('unknown'),
  account_scope: alias,
  locale: z.string().regex(/^[a-zA-Z]{2,8}(?:-[a-zA-Z0-9]{1,8})*$/),
});
export const baseRequest = {
  schema_version: z.literal(KNOWLEDGE_SCHEMA_VERSION),
  project_id: id,
  app_id: id,
};
export const writeRequest = { ...baseRequest, request_id: key };
export const browserRequest = {
  ...baseRequest,
  browser_schema_version: z.literal(BROWSER_SCHEMA_VERSION),
};
export const evidenceClass = z.enum(['observed', 'inferred', 'test_verified']);
export const recordKind = z.enum([
  'screen',
  'state',
  'control',
  'action',
  'transition',
  'flow',
  'capture',
  'action_event',
  'test_run',
  'annotation',
]);
export const ids = z.array(id).max(LIMITS.max_records);
export const reference = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('existing'), id }),
  z.strictObject({ kind: z.literal('local'), client_ref: key }),
]);
export const warning = z.strictObject({
  code: key,
  message: text,
  affected_ids: ids,
});
export const errorCode = z.enum([
  'INVALID_INPUT',
  'UNKNOWN_SCOPE',
  'NOT_FOUND',
  'INCOMPATIBLE_CAPTURE',
  'UNSUPPORTED_FORMAT',
  'UNSUPPORTED_SCHEMA',
  'STORE_BUSY',
  'STORE_CORRUPT',
  'STORAGE_LIMIT',
  'LIMIT_EXCEEDED',
  'CONFLICT',
  'IDEMPOTENCY_CONFLICT',
  'BUDGET_EXCEEDED',
  'CURSOR_STALE',
  'BROWSER_UNAVAILABLE',
  'SESSION_CLOSED',
  'STALE_TARGET',
  'AMBIGUOUS_TARGET',
  'ORIGIN_NOT_ALLOWED',
  'CREDENTIAL_FIELD',
  'ACTION_NOT_ALLOWED',
  'EXECUTION_CONFLICT',
  'UNKNOWN_OUTCOME',
  'APPLICATION_ERROR',
  'ACTION_TIMEOUT',
  'ACTION_CANCELLED',
]);
export const errorSchema = z.strictObject({
  schema_version: z.literal(1),
  error: z.strictObject({
    code: errorCode,
    message: z.literal('Contract request rejected'),
    field_paths: z
      .array(z.array(z.union([key, z.number().int().nonnegative()])).max(128))
      .max(50),
  }),
});
export const cursor = z.strictObject({ token: key, store_revision: revision });
export const budget = z.strictObject({
  records: z
    .number()
    .int()
    .min(1)
    .max(LIMITS.max_records)
    .default(LIMITS.default_records),
  bytes: z
    .number()
    .int()
    .min(1)
    .max(Number.MAX_SAFE_INTEGER)
    .default(LIMITS.default_output_bytes),
});
export const freshness = z.strictObject({
  observed_at: timestamp,
  last_checked_at: timestamp.nullable(),
  application_version: text.nullable(),
  age_seconds: z.number().nonnegative(),
  scope_match: z.boolean(),
  status: z.enum(['recent', 'stale', 'contradicted', 'unknown']),
});
export const source = z.strictObject({
  producer: key,
  producer_version: key,
  format: key,
  format_version: key,
});
export const profile = z.strictObject({
  alias,
  version: z.number().int().positive(),
});
export function envelope<T extends z.ZodType>(data: T) {
  return z.strictObject({
    schema_version: z.literal(1),
    store_revision: revision,
    data,
    warnings: z.array(warning).max(50),
    next_cursor: cursor.optional(),
  });
}
export function browserEnvelope<T extends z.ZodType>(data: T) {
  return envelope(data).extend({
    browser_schema_version: z.literal(BROWSER_SCHEMA_VERSION),
  });
}
