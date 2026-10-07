import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { Store } from './database.js';
import {
  baseRequest,
  writeRequest,
  scope,
  revision,
  id,
  key,
} from '../contracts/common.js';
import { selectedApp } from '../core/ingest.js';
import { scopeId } from '../core/graph.js';
import { canonical, digest, KnowledgeError } from '../core/normalize.js';
import { visibleSql } from '../core/summary.js';
const deletionInput = z.strictObject({
  ...writeRequest,
  scope,
  expected_store_revision: revision,
});
const undoInput = z.strictObject({
  ...writeRequest,
  deletion_batch: id,
  expected_store_revision: revision,
});
const previewInput = z.strictObject({ ...baseRequest, scope });
const purgeInput = z.strictObject({
  ...baseRequest,
  scope,
  preview_token: key,
});
function parse<T>(schema: z.ZodType<T>, input: unknown): T {
  const r = schema.safeParse(input);
  if (!r.success) throw new KnowledgeError('INVALID_INPUT');
  return r.data;
}
function receipt<T>(
  store: Store,
  app: string,
  request: string,
  tool: string,
  input: unknown,
  callback: () => T,
): T {
  const hash = digest(input);
  return store.transaction(() => {
    const replay = store.db
      .prepare(
        'SELECT tool,digest,receipt_json FROM receipts WHERE app_id=? AND request_id=?',
      )
      .get(app, request) as
      { tool: string; digest: string; receipt_json: string } | undefined;
    if (replay) {
      if (replay.tool !== tool || replay.digest !== hash)
        throw new KnowledgeError('IDEMPOTENCY_CONFLICT');
      return JSON.parse(replay.receipt_json) as T;
    }
    const result = callback();
    store.db
      .prepare('INSERT INTO receipts VALUES(?,?,?,?,?)')
      .run(app, request, tool, hash, canonical(result));
    return result;
  });
}
export function deleteScope(store: Store, input: unknown) {
  const q = parse(deletionInput, input),
    app = selectedApp(store, q);
  return receipt(store, app.app_id, q.request_id, 'delete-scope', q, () => {
    store.requireRevision(q.expected_store_revision);
    const selected = scopeId(store, app, q.scope);
    const rows = store.db
      .prepare(
        `SELECT r.id FROM records r WHERE r.app_id=? AND r.scope_id=? AND ${visibleSql('r')}`,
      )
      .all(app.app_id, selected) as { id: string }[];
    const rev = store.advanceRevision(),
      batch = randomUUID();
    store.db
      .prepare('INSERT INTO deletion_batches VALUES(?,?,?,?,?,NULL,NULL)')
      .run(batch, app.app_id, selected, rev, rows.length);
    for (const row of rows)
      store.db
        .prepare('INSERT INTO tombstones VALUES(?,?,?,NULL)')
        .run(row.id, batch, rev);
    return {
      status: 'deleted' as const,
      deletion_batch: batch,
      record_count: rows.length,
      store_revision: rev,
    };
  });
}
export function undoDelete(store: Store, input: unknown) {
  const q = parse(undoInput, input);
  selectedApp(store, q);
  return receipt(store, q.app_id, q.request_id, 'undo-delete', q, () => {
    store.requireRevision(q.expected_store_revision);
    const batch = store.db
      .prepare(
        'SELECT undone_revision,purged_revision FROM deletion_batches WHERE id=? AND app_id=?',
      )
      .get(q.deletion_batch, q.app_id) as
      | { undone_revision: number | null; purged_revision: number | null }
      | undefined;
    if (!batch) throw new KnowledgeError('NOT_FOUND');
    if (batch.undone_revision !== null || batch.purged_revision !== null)
      throw new KnowledgeError('CONFLICT');
    const rev = store.advanceRevision();
    const restored = store.db
      .prepare(
        'UPDATE tombstones SET undone_revision=? WHERE deletion_batch=? AND undone_revision IS NULL',
      )
      .run(rev, q.deletion_batch).changes;
    store.db
      .prepare('UPDATE deletion_batches SET undone_revision=? WHERE id=?')
      .run(rev, q.deletion_batch);
    return {
      status: 'restored' as const,
      deletion_batch: q.deletion_batch,
      record_count: restored,
      store_revision: rev,
    };
  });
}
function preview(store: Store, q: z.output<typeof previewInput>) {
  const app = selectedApp(store, q),
    selected = scopeId(store, app, q.scope, true);
  const rows = store.db
    .prepare(
      `SELECT r.id,r.kind FROM records r WHERE r.app_id=? AND r.scope_id=? AND NOT (${visibleSql('r')}) ORDER BY r.id`,
    )
    .all(app.app_id, selected) as { id: string; kind: string }[];
  return {
    status: 'preview' as const,
    scope: q.scope,
    store_revision: store.revision,
    record_count: rows.length,
    counts: Object.fromEntries(
      [...new Set(rows.map((r) => r.kind))]
        .sort()
        .map((kind) => [kind, rows.filter((r) => r.kind === kind).length]),
    ),
    sample_ids: rows.slice(0, 50).map((r) => r.id),
    preview_token: `${store.revision}_${digest({ project: q.project_id, app: q.app_id, scope: q.scope, rows, epoch: store.cursorEpoch })}`,
    backups_retain_data: true,
  };
}
export function previewPurge(store: Store, input: unknown) {
  const q = parse(previewInput, input);
  return store.transaction(() => preview(store, q), false);
}
export function purge(store: Store, input: unknown) {
  const q = parse(purgeInput, input);
  selectedApp(store, q);
  if (!store.maintenance) throw new KnowledgeError('STORE_BUSY');
  store.db.pragma('secure_delete = ON');
  const result = store.transaction(() => {
    const p = preview(store, {
      schema_version: q.schema_version,
      project_id: q.project_id,
      app_id: q.app_id,
      scope: q.scope,
    });
    if (q.preview_token !== p.preview_token)
      throw new KnowledgeError('CONFLICT');
    const selected = scopeId(store, selectedApp(store, q), q.scope, true);
    const revision = store.advanceRevision();
    store.db.exec('CREATE TEMP TABLE purge_ids (id TEXT PRIMARY KEY)');
    store.db
      .prepare(
        `INSERT INTO purge_ids SELECT r.id FROM records r WHERE r.app_id=? AND r.scope_id=? AND NOT (${visibleSql('r')})`,
      )
      .run(q.app_id, selected);
    // Refuse an unexpected retained dependency rather than silently broadening deletion.
    const dependency = store.db
      .prepare(
        'SELECT 1 FROM graph_records g JOIN json_tree(g.payload_json) j JOIN purge_ids p ON j.value=p.id WHERE g.id NOT IN (SELECT id FROM purge_ids) LIMIT 1',
      )
      .get();
    if (dependency) throw new KnowledgeError('CONFLICT');
    store.db
      .exec(`DELETE FROM evidence_links WHERE capture_id IN (SELECT id FROM purge_ids) OR target_id IN (SELECT id FROM purge_ids);
      DELETE FROM relations WHERE source_id IN (SELECT id FROM purge_ids) OR target_id IN (SELECT id FROM purge_ids);
      DELETE FROM identity_aliases WHERE from_id IN (SELECT id FROM purge_ids) OR to_id IN (SELECT id FROM purge_ids);
      UPDATE deletion_batches SET purged_revision=${revision} WHERE id IN (SELECT deletion_batch FROM tombstones WHERE record_id IN (SELECT id FROM purge_ids)) AND undone_revision IS NULL;
      DELETE FROM tombstones WHERE record_id IN (SELECT id FROM purge_ids);
      DELETE FROM graph_records WHERE id IN (SELECT id FROM purge_ids);
      DELETE FROM controls WHERE id IN (SELECT id FROM purge_ids);
      DELETE FROM captures WHERE id IN (SELECT id FROM purge_ids);
      DELETE FROM states WHERE id IN (SELECT id FROM purge_ids);
      DELETE FROM screens WHERE id IN (SELECT id FROM purge_ids);
      DELETE FROM records WHERE id IN (SELECT id FROM purge_ids);
      DROP TABLE purge_ids;`);
    return {
      status: 'purged' as const,
      record_count: p.record_count,
      store_revision: revision,
      backups_retain_data: true,
    };
  });
  try {
    const checkpoint = () => {
      const rows = store.db.pragma('wal_checkpoint(TRUNCATE)') as {
        busy: number;
      }[];
      if (rows.some((r) => r.busy !== 0))
        throw new KnowledgeError('STORE_BUSY');
    };
    checkpoint();
    store.db.exec('VACUUM');
    checkpoint();
    return { ...result, storage_reclaimed: true };
  } catch {
    return { ...result, storage_reclaimed: false };
  }
}
