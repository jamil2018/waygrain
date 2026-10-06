import { z } from 'zod';
import {
  id,
  key,
  text,
  scope,
  timestamp,
  reference,
  evidenceClass,
  recordKind,
  LIMITS,
  errorCode,
} from './common.js';

export const verb = z.enum([
  'click',
  'fill',
  'select',
  'check',
  'uncheck',
  'scroll',
  'key',
  'navigate',
]);
export const outcome = z.enum(['success', 'error', 'timeout', 'cancelled']);
export const safeInput = z.strictObject({
  kind: z.enum([
    'none',
    'text',
    'option',
    'boolean',
    'scroll',
    'navigation_key',
  ]),
  required: z.boolean(),
  max_length: z.number().int().min(0).max(LIMITS.text_bytes).optional(),
});
export const guards = z.array(text).max(50);
export const actionEvent = z.strictObject({
  action_id: reference,
  before_capture_id: reference,
  after_capture_id: reference.nullable(),
  trace_id: key,
  trace_seq: z.number().int().nonnegative(),
  session_id: key,
  tab_id: key,
  scope,
  occurred_at: timestamp,
  outcome,
  error_code: errorCode.nullable(),
});
export const testRun = z.strictObject({
  runner: key,
  runner_version: key,
  application_version: text,
  scope,
  started_at: timestamp,
  finished_at: timestamp,
  outcome: z.enum(['passed', 'failed', 'skipped']),
  assertions: z
    .array(
      z.strictObject({
        target_id: reference,
        assertion: text,
        result: z.enum(['passed', 'failed', 'skipped']),
        evidence_ids: z.array(reference).min(1).max(50),
      }),
    )
    .min(1)
    .max(100),
});
const annotationBase = {
  target_id: reference,
  kind: z.enum([
    'name',
    'tag',
    'description',
    'prerequisite',
    'interpretation',
  ]),
  value: text,
  author_type: z.enum(['agent', 'human']),
  evidence_ids: z.array(reference).min(1).max(50),
  scope,
};
export const annotation = z.discriminatedUnion('provenance', [
  z.strictObject({ ...annotationBase, provenance: z.literal('observed') }),
  z.strictObject({
    ...annotationBase,
    provenance: z.literal('inferred'),
    rationale: text.min(1),
  }),
  z.strictObject({
    ...annotationBase,
    provenance: z.literal('test_verified'),
    test_run_id: reference,
  }),
]);
const op = { client_ref: key.optional() };
export const operation = z.discriminatedUnion('op', [
  z.strictObject({
    ...op,
    op: z.literal('create_action'),
    state_id: reference,
    control_id: reference.nullable(),
    verb,
    input_schema: safeInput,
    preconditions: guards,
  }),
  z.strictObject({
    ...op,
    op: z.literal('record_action_event'),
    event: actionEvent,
  }),
  z.strictObject({ ...op, op: z.literal('record_test_run'), run: testRun }),
  z.strictObject({
    ...op,
    op: z.literal('create_transition'),
    source_state_id: reference,
    action_id: reference,
    target_state_id: reference,
    before_capture_id: reference,
    after_capture_id: reference,
    action_event_id: reference,
    outcome,
    guards,
    provenance: evidenceClass.exclude(['inferred']),
    test_run_id: reference.optional(),
  }),
  z.strictObject({
    ...op,
    op: z.literal('create_flow'),
    name: text,
    transition_ids: z.array(reference).min(1).max(100),
    scope,
  }),
  z.strictObject({ ...op, op: z.literal('add_annotation'), annotation }),
  z.strictObject({
    ...op,
    op: z.literal('supersede_annotation'),
    supersedes_id: reference,
    annotation,
  }),
  z.strictObject({
    ...op,
    op: z.literal('alias_identity'),
    record_kind: recordKind,
    from_id: id,
    to_id: id,
    rationale: text.min(1),
    evidence_ids: z.array(id).min(1).max(50),
  }),
]);
// Endpoint table is a contract, not a graph validator or authorization grant.
export const RELATION_ENDPOINTS = Object.freeze({
  contains: [
    ['screen', 'state'],
    ['state', 'control'],
  ],
  offers: [['state', 'action']],
  transitions_to: [['state', 'state']],
  part_of: [['transition', 'flow']],
  describes: [
    ['annotation', 'screen'],
    ['annotation', 'state'],
    ['annotation', 'control'],
    ['annotation', 'action'],
    ['annotation', 'transition'],
    ['annotation', 'flow'],
    ['annotation', 'capture'],
    ['annotation', 'action_event'],
    ['annotation', 'test_run'],
  ],
} as const);
