import { z } from 'zod';
import {
  baseRequest,
  writeRequest,
  id,
  ids,
  key,
  text,
  revision,
  scope,
  cursor,
  budget,
  envelope,
  freshness,
  evidenceClass,
  recordKind,
  timestamp,
  LIMITS,
} from './common.js';
import { capture, screenRef, ingestResult, coverage, view } from './capture.js';
import { operation, guards } from './operations.js';

import { recordSummary } from './records.js';

const evidenceSummary = z.strictObject({
  evidence_ids: ids,
  provenance: evidenceClass,
  coverage,
  freshness,
});
const queryBase = {
  ...baseRequest,
  scope,
  budget: budget.default({
    records: LIMITS.default_records,
    bytes: LIMITS.default_output_bytes,
  }),
  cursor: cursor.optional(),
  max_age_seconds: z
    .number()
    .int()
    .nonnegative()
    .max(Number.MAX_SAFE_INTEGER)
    .default(LIMITS.default_max_age_seconds),
};
const traversal = {
  max_depth: z
    .number()
    .int()
    .min(1)
    .max(LIMITS.max_path_depth)
    .default(LIMITS.max_path_depth),
  max_visited: z
    .number()
    .int()
    .min(1)
    .max(LIMITS.max_visited_nodes)
    .default(LIMITS.max_visited_nodes),
};
const queryInput = z.discriminatedUnion('mode', [
  z.strictObject({
    ...queryBase,
    mode: z.literal('search'),
    filters: z.strictObject({
      ids: ids.optional(),
      kinds: z.array(recordKind).max(10).optional(),
      tags: z.array(text).max(50).optional(),
      terms: z.array(text).max(50).optional(),
      name: text.optional(),
    }),
  }),
  z.strictObject({
    ...queryBase,
    mode: z.literal('neighbors'),
    target_id: id,
    hops: z.number().int().min(1).max(LIMITS.max_neighbor_hops).default(1),
  }),
  z.strictObject({
    ...queryBase,
    ...traversal,
    mode: z.literal('path'),
    source_state_id: id,
    target_state_id: id,
  }),
  z.strictObject({
    ...queryBase,
    ...traversal,
    mode: z.literal('flow'),
    flow_id: id,
  }),
]);
const boundedResult = z.discriminatedUnion('status', [
  z.strictObject({
    status: z.literal('complete'),
    records: z.array(recordSummary).min(1).max(LIMITS.max_records),
    guards,
    applicability: z.enum(['unconditional', 'conditional', 'requires_check']),
  }),
  z.strictObject({
    status: z.literal('no_matches'),
    records: z.tuple([]),
    guards: z.tuple([]),
    applicability: z.literal('requires_check'),
  }),
  z.strictObject({
    status: z.literal('incomplete'),
    records: z.array(recordSummary).max(LIMITS.max_records),
    guards,
    applicability: z.enum(['conditional', 'requires_check']),
    reason: z.literal('BUDGET_EXCEEDED'),
  }),
]);
const statusData = z.strictObject({
  store_schema_version: z.number().int().positive(),
  supported_schema_versions: z.tuple([z.literal(1)]),
  capabilities: z
    .array(z.enum(['ingest', 'query', 'changes', 'evidence', 'refresh_plan']))
    .max(5),
  counts: z
    .array(
      z.strictObject({
        kind: recordKind,
        count: z.number().int().nonnegative(),
      }),
    )
    .max(10),
  byte_usage: z.strictObject({
    database: revision,
    wal: revision,
    cap: revision,
  }),
  ingest_formats: z
    .array(z.strictObject({ format: key, version: key }))
    .max(10),
});
const structuredAnnotationBase = {
  projection: z.literal('structured_annotation'),
  id,
  kind: z.literal('annotation'),
  target_id: id,
  annotation_kind: z.enum([
    'name',
    'tag',
    'description',
    'prerequisite',
    'interpretation',
  ]),
  value: text,
  author_type: z.enum(['agent', 'human']),
  evidence_ids: ids.min(1),
  scope,
  revision,
  supersedes_id: id.nullable(),
};
const structuredAnnotation = z.discriminatedUnion('provenance', [
  z.strictObject({
    ...structuredAnnotationBase,
    provenance: z.literal('observed'),
  }),
  z.strictObject({
    ...structuredAnnotationBase,
    provenance: z.literal('inferred'),
    rationale: text.min(1),
  }),
  z.strictObject({
    ...structuredAnnotationBase,
    provenance: z.literal('test_verified'),
    test_run_id: id,
  }),
]);
const evidenceItem = z.union([
  z.strictObject({
    projection: z.literal('summary'),
    id,
    kind: z.enum(['capture', 'annotation']),
    scope,
    source_summary: evidenceSummary,
  }),
  z.strictObject({
    projection: z.literal('structured_capture'),
    id,
    kind: z.literal('capture'),
    screen_id: id,
    state_id: id.nullable(),
    request_id: key,
    received_at: timestamp,
    capture,
  }),
  structuredAnnotation,
]);
const evidenceData = z.discriminatedUnion('status', [
  z.strictObject({
    status: z.literal('available'),
    items: z.array(evidenceItem).min(1).max(50),
  }),
  z.strictObject({
    status: z.literal('unavailable'),
    items: z.tuple([]),
    missing_ids: ids.min(1),
  }),
  z.strictObject({
    status: z.literal('incomplete'),
    items: z.array(evidenceItem).max(50),
    missing_ids: ids,
    reason: z.literal('BUDGET_EXCEEDED'),
  }),
]);
const changesInput = z.discriminatedUnion('mode', [
  z.strictObject({
    ...baseRequest,
    mode: z.literal('captures'),
    before_capture_id: id,
    after_capture_id: id,
    budget: budget.optional(),
    cursor: cursor.optional(),
  }),
  z.strictObject({
    ...baseRequest,
    mode: z.literal('revisions'),
    scope,
    from_revision: revision,
    to_revision: revision,
    budget: budget.optional(),
    cursor: cursor.optional(),
  }),
]);
const change = z.strictObject({
  kind: z.enum(['added', 'removed', 'altered', 'not_seen']),
  subject: z.enum(['control', 'tab', 'modal', 'outcome', 'annotation']),
  before_id: id.nullable(),
  after_id: id.nullable(),
  evidence_ids: ids.min(1),
  coverage,
});
const changesData = z.discriminatedUnion('status', [
  z.strictObject({
    status: z.literal('comparable'),
    changes: z.array(change).max(50),
    invalidated_ids: ids,
    complete: z.boolean(),
  }),
  z.strictObject({
    status: z.literal('incomparable'),
    reason: z.enum(['scope', 'normalization_version', 'coverage']),
    evidence_ids: ids,
    changes: z.tuple([]),
  }),
]);
const refreshData = z.strictObject({
  status: z.enum(['planned', 'blocked', 'unsupported', 'needs_user_input']),
  steps: z
    .array(
      z.strictObject({
        target_id: id,
        expected_scope: scope,
        expected_view: view.optional(),
        minimum_observations: z.enum([
          'complete_state',
          'before_action_after',
          'passed_assertion',
        ]),
        prerequisites: z.array(text).max(50),
      }),
    )
    .max(50),
  unresolved_ids: ids,
  complete: z.boolean(),
});

export const knowledgeContracts = {
  wg_status: {
    input: z.strictObject(baseRequest),
    output: envelope(statusData),
  },
  wg_ingest: {
    input: z.strictObject({
      ...writeRequest,
      screen_ref: screenRef,
      capture,
      expected_store_revision: revision.optional(),
    }),
    output: envelope(ingestResult),
  },
  wg_commit: {
    input: z.strictObject({
      ...writeRequest,
      expected_store_revision: revision,
      operations: z.array(operation).min(1).max(LIMITS.commit_operations),
    }),
    output: envelope(
      z.strictObject({
        created_ids: z.array(id).max(100),
        client_refs: z.array(z.strictObject({ client_ref: key, id })).max(100),
        new_revision: revision,
      }),
    ),
  },
  wg_query: { input: queryInput, output: envelope(boundedResult) },
  wg_evidence: {
    input: z.strictObject({
      ...baseRequest,
      ids: ids.min(1),
      projection: z.enum(['summary', 'structured']).default('summary'),
      budget: budget.optional(),
      cursor: cursor.optional(),
    }),
    output: envelope(evidenceData),
  },
  wg_changes: { input: changesInput, output: envelope(changesData) },
  wg_plan_refresh: {
    input: z.strictObject({
      ...baseRequest,
      target_ids: ids.min(1),
      scope,
      max_age_seconds: z
        .number()
        .int()
        .nonnegative()
        .default(LIMITS.default_max_age_seconds),
      step_budget: z.number().int().min(1).max(50).default(20),
    }),
    output: envelope(refreshData),
  },
} as const;
