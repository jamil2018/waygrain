import { randomUUID } from 'node:crypto';
import type { z } from 'zod';
import { scope, recordKind, reference } from '../contracts/common.js';
import { annotation, RELATION_ENDPOINTS } from '../contracts/operations.js';
import { Store } from '../store/database.js';
import {
  canonical,
  KnowledgeError,
  type AppConfiguration,
} from './normalize.js';

export type Scope = z.output<typeof scope>;
export type RecordKind = z.output<typeof recordKind>;
export type Reference = z.output<typeof reference>;
export interface RecordRow {
  id: string;
  app_id: string;
  scope_id: string;
  kind: RecordKind;
  created_revision: number;
}
type AnnotationInput = z.output<typeof annotation>;
export type Annotation = Omit<
  AnnotationInput,
  'target_id' | 'evidence_ids' | 'test_run_id'
> & {
  target_id: string;
  evidence_ids: string[];
  test_run_id?: string;
  revision: number;
  supersedes_id: string | null;
};
export function record(
  store: Store,
  app: string,
  id: string,
  kind?: RecordKind,
): RecordRow {
  const row = store.db
    .prepare('SELECT * FROM records WHERE id=? AND app_id=?')
    .get(id, app) as RecordRow | undefined;
  if (!row || (kind && row.kind !== kind))
    throw new KnowledgeError('NOT_FOUND');
  return row;
}
export function scopeId(
  store: Store,
  app: AppConfiguration,
  value: Scope,
): string {
  const json = canonical(value);
  if (
    !app.scopes.some(
      (entry) =>
        canonical({
          environment: entry.environment,
          origin: entry.origin,
          role: entry.role,
          account_scope: entry.account_scope,
          locale: entry.locale,
        }) === json,
    )
  )
    throw new KnowledgeError('UNKNOWN_SCOPE');
  const row = store.db
    .prepare('SELECT id FROM scopes WHERE app_id=? AND scope_json=?')
    .get(app.app_id, json) as { id: string } | undefined;
  if (!row) throw new KnowledgeError('NOT_FOUND');
  return row.id;
}
// All retained prose must be explicitly reviewed by the operator, like capture labels.
export function safeProse(app: AppConfiguration, value: string): string {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (
    !normalized ||
    !app.redaction_profiles.some((p) =>
      p.allowed_labels.some(
        (label) => label.replace(/\s+/g, ' ').trim() === normalized,
      ),
    )
  )
    throw new KnowledgeError('INVALID_INPUT');
  return normalized;
}
export function graphPayload<T>(store: Store, id: string): T {
  const row = store.db
    .prepare('SELECT payload_json FROM graph_records WHERE id=?')
    .get(id) as { payload_json: string } | undefined;
  if (!row) throw new KnowledgeError('NOT_FOUND');
  return JSON.parse(row.payload_json) as T;
}
export function putGraph(
  store: Store,
  app: string,
  scope: string,
  kind: RecordKind,
  payload: unknown,
  revision: number,
  now: number,
  id = randomUUID(),
): string {
  store.db
    .prepare('INSERT INTO records VALUES(?,?,?,?,?)')
    .run(id, app, scope, kind, revision);
  store.db
    .prepare('INSERT INTO graph_records VALUES(?,?,?,?,?,?)')
    .run(id, app, scope, kind, canonical(payload), new Date(now).toISOString());
  return id;
}
export function relate(
  store: Store,
  app: string,
  source: string,
  target: string,
  type: keyof typeof RELATION_ENDPOINTS,
) {
  const a = record(store, app, source),
    b = record(store, app, target);
  if (
    a.scope_id !== b.scope_id ||
    !RELATION_ENDPOINTS[type].some(
      ([from, to]) => from === a.kind && to === b.kind,
    )
  )
    throw new KnowledgeError('INCOMPATIBLE_CAPTURE');
  store.db
    .prepare('INSERT OR IGNORE INTO relations VALUES(?,?,?,?,?)')
    .run(source, target, app, a.scope_id, type);
}
export function supports(
  store: Store,
  app: string,
  evidence: string,
  target: string,
): boolean {
  const e = record(store, app, evidence),
    t = record(store, app, target);
  if (e.scope_id !== t.scope_id) return false;
  if (e.id === t.id && e.kind === 'capture') return true;
  if (e.kind === 'capture') {
    const capture = store.db
      .prepare('SELECT coverage FROM captures WHERE id=?')
      .get(evidence) as { coverage: string };
    if (capture.coverage !== 'complete') return false;
    return !!store.db
      .prepare(
        'SELECT 1 FROM evidence_links WHERE capture_id=? AND target_id=?',
      )
      .get(evidence, target);
  }
  if (e.kind === 'annotation')
    return graphPayload<Annotation>(store, evidence).target_id === target;
  return false;
}
