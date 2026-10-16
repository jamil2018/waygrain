import { createHash } from 'node:crypto';
import { z } from 'zod';

export const DESCRIPTOR_LIMITS = {
  requestBytes: 1024 * 1024,
  entities: 256,
  field: 4096,
  source: 16384,
  question: 2048,
  evidenceBytes: 32768,
  claims: 32,
  turns: 20,
  conversations: 100,
} as const;
export class DescriptorError extends Error {
  constructor(
    readonly code:
      | 'INVALID_INPUT'
      | 'LIMIT_EXCEEDED'
      | 'CONFLICT'
      | 'ACCESS_DENIED'
      | 'NOT_FOUND'
      | 'UNSUPPORTED_SCHEMA'
      | 'PROVIDER_UNAVAILABLE',
  ) {
    super(code);
  }
}
export const idSchema = z.uuid();
export const boundedText = (bytes: number) =>
  z
    .string()
    .max(bytes)
    .refine((value) => Buffer.byteLength(value) <= bytes, 'UTF-8 byte limit');
const text = boundedText(DESCRIPTOR_LIMITS.field);
const label = z.string().min(1).max(128);
const hash = z.string().regex(/^[a-f0-9]{64}$/);
const time = z.iso.datetime();
export const scopeSchema = z.strictObject({
  environment: label.nullable(),
  version: label.nullable(),
  role: label.nullable(),
  tenant: label.nullable(),
  state: label.nullable(),
});
export type DescriptorScope = z.infer<typeof scopeSchema>;
export const sameScope = (a: DescriptorScope, b: DescriptorScope) =>
  (Object.keys(a) as (keyof DescriptorScope)[]).every(
    (key) => a[key] === b[key],
  );
export const contentHash = (value: string) =>
  createHash('sha256').update(value).digest('hex');
const revision = {
  revision_id: idSchema,
  supersedes_revision_id: idSchema.nullable(),
};
export const targetSchema = z.strictObject({
  id: idSchema,
  kind: z.enum(['page', 'component']),
  page_id: idSchema.nullable(),
  key: label,
});
export const sourceSchema = z
  .strictObject({
    id: idSchema,
    ...revision,
    scope: scopeSchema,
    kind: z.enum(['document', 'observation', 'code']),
    title: text,
    origin: text,
    excerpt: boundedText(DESCRIPTOR_LIMITS.source),
    content_hash: hash,
    locator: text,
    supplied_revision: label.nullable(),
    symbol: text.nullable(),
    observation_id: label.nullable(),
  })
  .superRefine((s, ctx) => {
    if (
      contentHash(s.excerpt) !== s.content_hash ||
      (s.kind === 'code' &&
        (!s.supplied_revision || !s.symbol || !s.locator)) ||
      (s.kind === 'observation' && !s.observation_id)
    )
      ctx.addIssue({ code: 'custom', message: 'Invalid source provenance' });
  });
const sourceRefSchema = z.strictObject({
  source_id: idSchema,
  revision_id: idSchema,
  content_hash: hash,
  locator: text.min(1),
});
export const claimSchema = z
  .strictObject({
    id: idSchema,
    ...revision,
    target_id: idSchema,
    scope: scopeSchema,
    text: text.min(1),
    evidence_class: z.enum([
      'documented',
      'observed',
      'code-verified',
      'inferred',
    ]),
    sources: z.array(sourceRefSchema).min(1).max(32),
    recorded_at: time,
    verification: z
      .strictObject({
        at: time,
        actor: label,
        method: text.min(1),
        scope: scopeSchema,
        supplied_revision: label.nullable(),
      })
      .nullable(),
    confidence: z.strictObject({
      level: z.enum(['low', 'medium', 'high']),
      reason: text.min(1),
    }),
    unknown: z.boolean(),
    conflicts: z.array(idSchema).max(32),
    freshness: z.strictObject({
      status: z.enum(['current', 'needs_review', 'unknown']),
      reasons: z.array(text).max(32),
    }),
  })
  .superRefine((c, ctx) => {
    if (
      (c.evidence_class === 'code-verified' &&
        !c.verification?.supplied_revision) ||
      (c.verification &&
        !sameScope(c.scope, c.verification.scope) &&
        !(
          c.freshness.status === 'needs_review' &&
          sameScope(c.scope, {
            ...c.verification.scope,
            version: c.scope.version,
          })
        )) ||
      (c.verification &&
        Date.parse(c.verification.at) < Date.parse(c.recorded_at)) ||
      (c.freshness.status === 'needs_review' && !c.freshness.reasons.length) ||
      c.conflicts.includes(c.id)
    )
      ctx.addIssue({ code: 'custom', message: 'Invalid claim qualification' });
  });
export const documentSchema = z.strictObject({
  id: idSchema,
  ...revision,
  target_id: idSchema,
  scope: scopeSchema,
  name: text,
  summary: text,
  purpose: text,
  inputs: z.array(text).max(32),
  rules: z.array(text).max(32),
  conditions: z.array(text).max(32),
  outputs: z.array(text).max(32),
  side_effects: z.array(text).max(32),
  errors: z.array(text).max(32),
  workflows: z.array(text).max(32),
  limitations: z.array(text).max(32),
  related_target_ids: z.array(idSchema).max(32),
  claim_ids: z.array(idSchema).max(32),
});
export const mappingSchema = z.strictObject({
  id: idSchema,
  target_id: idSchema,
  scope: scopeSchema,
  target_key: label,
  status: z.enum(['resolved', 'missing', 'ambiguous', 'needs_review']),
});
const collection = <T extends z.ZodType>(schema: T) =>
  z.array(schema).max(DESCRIPTOR_LIMITS.entities);
export const bundleSchema = z
  .strictObject({
    schema_version: z.literal(1),
    project_id: idSchema,
    app_id: idSchema,
    ...revision,
    targets: collection(targetSchema),
    sources: collection(sourceSchema),
    claims: collection(claimSchema),
    documents: collection(documentSchema),
    mappings: collection(mappingSchema),
  })
  .superRefine((b, ctx) => {
    const fail = () =>
      ctx.addIssue({
        code: 'custom',
        message: 'Invalid descriptor references',
      });
    const entities = [
      ...b.targets,
      ...b.sources,
      ...b.claims,
      ...b.documents,
      ...b.mappings,
    ];
    const ids = [b.project_id, b.app_id, ...entities.map((e) => e.id)];
    if (new Set(ids).size !== ids.length) fail();
    const targets = new Map(b.targets.map((t) => [t.id, t]));
    const sources = new Map(b.sources.map((s) => [s.id, s]));
    const claims = new Map(b.claims.map((c) => [c.id, c]));
    for (const t of b.targets) {
      if (
        (t.kind === 'page' && t.page_id !== null) ||
        (t.kind === 'component' &&
          targets.get(t.page_id ?? '')?.kind !== 'page')
      )
        fail();
    }
    for (const c of b.claims) {
      if (!targets.has(c.target_id)) fail();
      for (const ref of c.sources) {
        const s = sources.get(ref.source_id);
        if (
          !s ||
          !sameScope(s.scope, c.scope) ||
          s.revision_id !== ref.revision_id ||
          s.content_hash !== ref.content_hash ||
          ref.locator !== s.locator
        ) {
          fail();
          continue;
        }
        if (
          c.evidence_class === 'code-verified' &&
          (s.kind !== 'code' ||
            (s.supplied_revision !== c.verification?.supplied_revision &&
              c.freshness.status !== 'needs_review'))
        )
          fail();
        if (c.evidence_class === 'observed' && s.kind !== 'observation') fail();
      }
      for (const conflict of c.conflicts) {
        const other = claims.get(conflict);
        if (
          !other ||
          other.target_id !== c.target_id ||
          !sameScope(other.scope, c.scope)
        )
          fail();
      }
    }
    for (const d of b.documents) {
      if (
        !targets.has(d.target_id) ||
        d.related_target_ids.some((id) => !targets.has(id))
      )
        fail();
      for (const id of d.claim_ids) {
        const c = claims.get(id);
        if (!c || c.target_id !== d.target_id || !sameScope(c.scope, d.scope))
          fail();
      }
    }
    for (const m of b.mappings) if (!targets.has(m.target_id)) fail();
    for (const e of [b, ...b.sources, ...b.claims, ...b.documents])
      if (e.revision_id === e.supersedes_revision_id) fail();
  });
export type DescriptorBundle = z.infer<typeof bundleSchema>;
export type DescriptorClaim = DescriptorBundle['claims'][number];
export type DescriptorDocument = DescriptorBundle['documents'][number];
export const readRequestSchema = z.strictObject({
  schema_version: z.literal(1),
  project_id: idSchema,
  app_id: idSchema,
  target_id: idSchema,
  scope: scopeSchema,
});
export const writeRequestSchema = z.strictObject({
  schema_version: z.literal(1),
  expected_revision: z.number().int().min(0),
  bundle: bundleSchema,
});
// Only trusted configuration/host code supplies this; never parse it from a browser body.
export const accessContextSchema = z.strictObject({
  principal: label,
  author: z.boolean(),
  grants: z
    .array(
      z.strictObject({
        project_id: idSchema,
        app_id: idSchema,
        scope: scopeSchema,
      }),
    )
    .min(1)
    .max(256),
});
export type AccessContext = z.infer<typeof accessContextSchema>;
export type ReadRequest = z.infer<typeof readRequestSchema>;
export function parseDescriptor<T extends z.ZodType>(
  schema: T,
  input: unknown,
): z.infer<T> {
  let encoded: string;
  try {
    encoded = JSON.stringify(input);
  } catch {
    throw new DescriptorError('INVALID_INPUT');
  }
  if (typeof encoded !== 'string') throw new DescriptorError('INVALID_INPUT');
  if (Buffer.byteLength(encoded) > DESCRIPTOR_LIMITS.requestBytes)
    throw new DescriptorError('LIMIT_EXCEEDED');
  const result = schema.safeParse(input);
  if (!result.success) throw new DescriptorError('INVALID_INPUT');
  return result.data;
}
