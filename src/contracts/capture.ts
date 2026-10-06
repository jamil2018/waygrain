import { z } from 'zod';
import {
  alias,
  id,
  key,
  text,
  timestamp,
  scope,
  source,
  profile,
  route,
  hash,
  LIMITS,
} from './common.js';

export const view = z.strictObject({
  route_template: route,
  selected_tabs: z.array(alias).max(50),
  modal_stack: z.array(alias).max(50),
  feature_variants: z
    .array(z.strictObject({ name: alias, variant: alias }))
    .max(50),
});
export const coverage = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('complete'), subtree: z.literal('root') }),
  z.strictObject({
    kind: z.literal('partial'),
    subtree: key,
    reason: z.enum(['truncated', 'unsupported', 'subtree_only']),
  }),
]);
export const locatorHint = z.strictObject({
  kind: z.enum(['accessible_name', 'test_id']),
  hint: text,
  source,
  observed_at: timestamp,
});
export const treeNode = z.strictObject({
  role: key,
  name: text,
  enabled: z.boolean(),
  visible: z.boolean(),
  selected: z.boolean().optional(),
  locator_hint: locatorHint.optional(),
  get children() {
    return z.array(treeNode).max(LIMITS.tree_nodes);
  },
});
export type TreeNode = z.infer<typeof treeNode>;
export const capture = z.strictObject({
  captured_at: timestamp,
  trace_id: key,
  trace_seq: z.number().int().nonnegative(),
  session_id: key,
  tab_id: key,
  source,
  scope,
  view,
  tree: treeNode,
  coverage,
  redaction_profile: profile,
});
export const screenRef = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('existing'), screen_id: id }),
  z.strictObject({
    kind: z.literal('new'),
    name: text,
    view_key: alias.optional(),
  }),
]);
export const redactionSummary = z.strictObject({
  dropped_fields: z.number().int().nonnegative(),
  dropped_texts: z.number().int().nonnegative(),
  profile,
});
const ingestResultBase = {
  screen_id: id,
  capture_id: id,
  control_ids: z.array(id).max(LIMITS.tree_nodes),
  redaction_summary: redactionSummary,
};
export const ingestResult = z.discriminatedUnion('coverage', [
  z.strictObject({
    ...ingestResultBase,
    coverage: z.literal('complete'),
    state_id: id,
    state_hash: hash,
    fragment_hash: z.null(),
  }),
  z.strictObject({
    ...ingestResultBase,
    coverage: z.literal('partial'),
    state_id: z.null(),
    state_hash: z.null(),
    fragment_hash: hash,
    control_ids: z.tuple([]),
  }),
]);
