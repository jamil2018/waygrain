import { createHash } from 'node:crypto';
import type { z } from 'zod';
import {
  capture as captureSchema,
  type TreeNode,
} from '../contracts/capture.js';
import type { Configuration } from '../config/schema.js';
import { ContractError } from '../contracts/validation.js';

export const NORMALIZATION_VERSION = 1;
export type Capture = z.output<typeof captureSchema>;
export type AppConfiguration = Configuration['apps'][number];
export class KnowledgeError extends Error {
  constructor(
    readonly code:
      | 'UNKNOWN_SCOPE'
      | 'NOT_FOUND'
      | 'INCOMPATIBLE_CAPTURE'
      | 'UNSUPPORTED_FORMAT'
      | 'UNSUPPORTED_SCHEMA'
      | 'STORE_BUSY'
      | 'STORE_CORRUPT'
      | 'STORAGE_LIMIT'
      | 'CONFLICT'
      | 'IDEMPOTENCY_CONFLICT'
      | 'BUDGET_EXCEEDED'
      | 'CURSOR_STALE'
      | 'INVALID_INPUT',
  ) {
    super(code);
  }
  toJSON() {
    return {
      schema_version: 1,
      error: {
        code: this.code,
        message: 'Contract request rejected',
        field_paths: [],
      },
    };
  }
}
export function canonical(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  return (
    '{' +
    Object.entries(value)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([k, v]) => JSON.stringify(k) + ':' + canonical(v))
      .join(',') +
    '}'
  );
}
export const digest = (value: unknown) =>
  createHash('sha256').update(canonical(value)).digest('hex');
const whitespace = (value: string) => value.replace(/\s+/gu, ' ').trim();
const roles = new Set([
  'document',
  'heading',
  'button',
  'link',
  'textbox',
  'checkbox',
  'radio',
  'combobox',
  'option',
  'tab',
  'tablist',
  'dialog',
  'list',
  'listitem',
  'table',
  'row',
  'cell',
  'text',
  'group',
  'navigation',
  'main',
  'generic',
  'menu',
  'menuitem',
  'switch',
  'slider',
  'spinbutton',
  'status',
  'alert',
]);

/** Input must pass strict public validation first. No raw fields or input values are accepted. */
export function normalizeCapture(input: Capture, app: AppConfiguration) {
  if (
    !app.scopes.some(
      (entry) =>
        canonical({
          environment: entry.environment,
          origin: entry.origin,
          role: entry.role,
          account_scope: entry.account_scope,
          locale: entry.locale,
        }) === canonical(input.scope),
    )
  )
    throw new KnowledgeError('UNKNOWN_SCOPE');
  const profile = app.redaction_profiles.find(
    (p) =>
      p.alias === input.redaction_profile.alias &&
      p.version === input.redaction_profile.version,
  );
  if (!profile) throw new KnowledgeError('INCOMPATIBLE_CAPTURE');
  if (
    input.source.format !== 'structured_accessibility' ||
    input.source.format_version !== '1'
  )
    throw new KnowledgeError('UNSUPPORTED_FORMAT');
  if (
    !app.route_mappings.some(
      (m) =>
        m.origin === input.scope.origin &&
        m.route_template === input.view.route_template,
    )
  )
    throw new KnowledgeError('INCOMPATIBLE_CAPTURE');
  const allowed = new Set(profile.allowed_labels.map(whitespace));
  let dropped_texts = 0;
  let dropped_fields = 0;
  const safeText = (value: string) => {
    const normalized = whitespace(value);
    if (allowed.has(normalized)) return normalized;
    if (normalized) dropped_texts++;
    return '';
  };
  // Aliases describing UI state must be reviewed in the profile too; never retain free record IDs.
  for (const value of [
    ...input.view.selected_tabs,
    ...input.view.modal_stack,
    ...input.view.feature_variants.flatMap((v) => [v.name, v.variant]),
  ]) {
    if (!allowed.has(value)) throw new KnowledgeError('INCOMPATIBLE_CAPTURE');
  }
  if (
    input.coverage.kind === 'partial' &&
    input.coverage.subtree !== 'root' &&
    !allowed.has(input.coverage.subtree)
  )
    throw new KnowledgeError('INCOMPATIBLE_CAPTURE');
  const ignored = new Set(profile.ignored_fields);
  // Fields that can change UI meaning cannot be silently removed by a redaction rule.
  if ([...ignored].some((field) => !['locator_hint'].includes(field)))
    throw new KnowledgeError('INCOMPATIBLE_CAPTURE');
  const visit = (node: TreeNode): TreeNode => {
    if (!roles.has(node.role)) throw new KnowledgeError('INCOMPATIBLE_CAPTURE');
    const name = safeText(node.name);
    const result: TreeNode = {
      role: node.role,
      name,
      enabled: node.enabled,
      visible: node.visible,
      ...(node.selected === undefined ? {} : { selected: node.selected }),
      children: node.children.map(visit),
    };
    // Only allowlisted accessible-name hints survive. Arbitrary test IDs need a later reviewed mapping.
    if (node.locator_hint) {
      if (
        !ignored.has('locator_hint') &&
        node.locator_hint.kind === 'accessible_name' &&
        name &&
        whitespace(node.locator_hint.hint) === name
      )
        result.locator_hint = { ...node.locator_hint, hint: name };
      else dropped_fields++;
    }
    return result;
  };
  const capture: Capture = { ...input, tree: visit(input.tree) };
  return {
    capture,
    redaction_summary: {
      dropped_fields,
      dropped_texts,
      profile: input.redaction_profile,
    },
  };
}
export function stateProjection(capture: Capture, screenId: string) {
  const structural = (node: TreeNode): unknown => ({
    role: node.role,
    name: node.name,
    enabled: node.enabled,
    visible: node.visible,
    ...(node.selected === undefined ? {} : { selected: node.selected }),
    children: node.children.map(structural),
  });
  return {
    normalization_version: NORMALIZATION_VERSION,
    redaction_profile: capture.redaction_profile,
    screen_id: screenId,
    scope: capture.scope,
    view: capture.view,
    tree: structural(capture.tree),
  };
}
export function safeScreenName(
  name: string,
  app: AppConfiguration,
  profile: Capture['redaction_profile'],
) {
  const rule = app.redaction_profiles.find(
    (p) => p.alias === profile.alias && p.version === profile.version,
  );
  const normalized = whitespace(name);
  return rule?.allowed_labels.map(whitespace).includes(normalized)
    ? normalized
    : '';
}
export function errorResponse(error: unknown) {
  if (error instanceof KnowledgeError || error instanceof ContractError)
    return error.toJSON();
  return new KnowledgeError('STORE_CORRUPT').toJSON();
}
