import type { Responses } from '../contracts/index.js';
import type { z } from 'zod';
import { contracts, LIMITS } from '../contracts/index.js';
import { validateRequest, validateResponse } from '../contracts/validation.js';
import { Store } from '../store/database.js';
import { selectedApp } from './ingest.js';
import { scopeId } from './graph.js';
import {
  canonical,
  digest,
  KnowledgeError,
  type Capture,
} from './normalize.js';
import { visibleSql } from './summary.js';
import type { TreeNode } from '../contracts/capture.js';

type Change = Extract<
  Responses['wg_changes']['data'],
  { status: 'comparable' }
>['changes'][number];
interface Row {
  id: string;
  screen_id: string;
  state_id: string | null;
  capture_json: string;
}
function captureRow(store: Store, app: string, id: string): Row {
  const row = store.db
    .prepare(
      `SELECT c.* FROM captures c WHERE c.id=? AND c.app_id=? AND ${visibleSql('c')}`,
    )
    .get(id, app) as Row | undefined;
  if (!row) throw new KnowledgeError('NOT_FOUND');
  return row;
}
function compare(
  store: Store,
  a: Row,
  b: Row,
): Responses['wg_changes']['data'] {
  const before = JSON.parse(a.capture_json) as Capture,
    after = JSON.parse(b.capture_json) as Capture;
  if (
    a.screen_id !== b.screen_id ||
    canonical(before.scope) !== canonical(after.scope)
  )
    return {
      status: 'incomparable',
      reason: 'scope',
      evidence_ids: [a.id, b.id],
      changes: [],
    };
  const version = (id: string | null) =>
    id
      ? (
          store.db
            .prepare('SELECT normalization_version FROM states WHERE id=?')
            .get(id) as { normalization_version: number }
        ).normalization_version
      : 1;
  if (
    version(a.state_id) !== version(b.state_id) ||
    canonical(before.redaction_profile) !== canonical(after.redaction_profile)
  )
    return {
      status: 'incomparable',
      reason: 'normalization_version',
      evidence_ids: [a.id, b.id],
      changes: [],
    };
  if (before.coverage.subtree !== after.coverage.subtree)
    return {
      status: 'incomparable',
      reason: 'coverage',
      evidence_ids: [a.id, b.id],
      changes: [],
    };
  const changes: Change[] = [];
  const complete =
    before.coverage.kind === 'complete' && after.coverage.kind === 'complete';
  const coverage = complete
    ? after.coverage
    : after.coverage.kind === 'partial'
      ? after.coverage
      : before.coverage;
  const nodes = (c: Capture, state: string | null) => {
    const map = new Map<string, { node: unknown; id: string | null }>();
    const controls = state
      ? (store.db
          .prepare('SELECT id,descriptor_path FROM controls WHERE state_id=?')
          .all(state) as { id: string; descriptor_path: string }[])
      : [];
    const controlIds = new Map(controls.map((c) => [c.descriptor_path, c.id]));
    const walk = (n: TreeNode, path: string) => {
      map.set(path, {
        node: {
          role: n.role,
          name: n.name,
          enabled: n.enabled,
          visible: n.visible,
          selected: n.selected,
        },
        id: controlIds.get(path) ?? null,
      });
      n.children.forEach((child, i) =>
        walk(child, `${path}/${String(i).padStart(4, '0')}`),
      );
    };
    walk(c.tree, 'root');
    return map;
  };
  const left = nodes(before, a.state_id),
    right = nodes(after, b.state_id);
  for (const path of [...new Set([...left.keys(), ...right.keys()])].sort()) {
    const x = left.get(path),
      y = right.get(path);
    if (canonical(x?.node ?? null) === canonical(y?.node ?? null)) continue;
    changes.push({
      kind: !x ? 'added' : !y ? (complete ? 'removed' : 'not_seen') : 'altered',
      subject: 'control',
      before_id: x?.id ?? null,
      after_id: y?.id ?? null,
      evidence_ids: [a.id, b.id],
      coverage: { ...coverage },
    });
  }
  for (const [field, subject] of [
    ['selected_tabs', 'tab'],
    ['modal_stack', 'modal'],
    ['feature_variants', 'outcome'],
  ] as const) {
    if (canonical(before.view[field]) !== canonical(after.view[field]))
      changes.push({
        kind: 'altered',
        subject,
        before_id: a.id,
        after_id: b.id,
        evidence_ids: [a.id, b.id],
        coverage: { ...coverage },
      });
  }
  const invalidated: string[] = [];
  if (changes.length && a.state_id && a.state_id !== b.state_id) {
    invalidated.push(a.state_id);
    const refs = store.db
      .prepare(
        `WITH RECURSIVE affected(id) AS (
      SELECT ? UNION SELECT id FROM controls WHERE state_id=?
      UNION SELECT g.id FROM graph_records g JOIN json_tree(g.payload_json) j JOIN affected a ON j.value=a.id WHERE g.kind IN ('action','transition','flow') AND ${visibleSql('g')}
    ) SELECT id FROM affected ORDER BY id LIMIT 51`,
      )
      .all(a.state_id, a.state_id) as { id: string }[];
    invalidated.push(...refs.map((r) => r.id));
  }
  const ids = [...new Set(invalidated)];
  return {
    status: 'comparable',
    changes,
    invalidated_ids: ids.slice(0, 50),
    complete: complete && ids.length <= 50,
  };
}
export function changes(store: Store, input: unknown): Responses['wg_changes'] {
  const q = validateRequest('wg_changes', input) as z.output<
    typeof contracts.wg_changes.input
  >;
  const app = selectedApp(store, q);
  return store.transaction(() => {
    const revision = store.revision;
    const filter = { ...q, cursor: undefined, budget: undefined };
    const token = (offset: number) =>
      `${offset}_${store.cursorEpoch || 'initial'}_${digest({ filter, revision, offset, epoch: store.cursorEpoch })}`;
    let offset = 0;
    if (q.cursor) {
      if (
        q.cursor.store_revision !== revision ||
        q.cursor.token.split('_')[1] !== (store.cursorEpoch || 'initial')
      )
        throw new KnowledgeError('CURSOR_STALE');
      offset = Number(q.cursor.token.split('_')[0]);
      if (
        !Number.isSafeInteger(offset) ||
        offset < 1 ||
        q.cursor.token !== token(offset)
      )
        throw new KnowledgeError('INVALID_INPUT');
    }
    let data: Responses['wg_changes']['data'];
    if (q.mode === 'captures')
      data = compare(
        store,
        captureRow(store, app.app_id, q.before_capture_id),
        captureRow(store, app.app_id, q.after_capture_id),
      );
    else {
      if (q.from_revision > q.to_revision || q.to_revision > revision)
        throw new KnowledgeError('INVALID_INPUT');
      const scope = scopeId(store, app, q.scope, true);
      const rows = store.db
        .prepare(
          `SELECT c.* FROM captures c JOIN records r ON r.id=c.id WHERE c.app_id=? AND c.scope_id=? AND r.created_revision>? AND r.created_revision<=? AND ${visibleSql('c')} ORDER BY r.created_revision,c.id LIMIT 501`,
        )
        .all(app.app_id, scope, q.from_revision, q.to_revision) as Row[];
      const all: Change[] = [],
        invalidated = new Set<string>();
      let complete = rows.length <= 500;
      for (const row of rows.slice(0, 500)) {
        const previous = store.db
          .prepare(
            `SELECT c.* FROM captures c JOIN records r ON r.id=c.id WHERE c.screen_id=? AND r.created_revision<(SELECT created_revision FROM records WHERE id=?) AND ${visibleSql('c')} ORDER BY r.created_revision DESC,c.id LIMIT 1`,
          )
          .get(row.screen_id, row.id) as Row | undefined;
        if (!previous) continue;
        const comparison = compare(store, previous, row);
        if (comparison.status === 'incomparable') {
          // A revision range cannot silently omit incompatible observations.
          const result = {
            schema_version: 1,
            store_revision: revision,
            data: comparison,
            warnings: [],
          };
          if (q.cursor) throw new KnowledgeError('INVALID_INPUT');
          if (
            Buffer.byteLength(JSON.stringify(result)) >
            (q.budget?.bytes ?? LIMITS.default_output_bytes)
          )
            throw new KnowledgeError('BUDGET_EXCEEDED');
          return validateResponse('wg_changes', result);
        }
        all.push(...comparison.changes);
        comparison.invalidated_ids.forEach((id) => invalidated.add(id));
        complete &&= comparison.complete;
      }
      const annotations = store.db
        .prepare(
          `SELECT g.id,g.kind,g.payload_json FROM graph_records g JOIN records r ON r.id=g.id WHERE g.app_id=? AND g.scope_id=? AND g.kind IN ('annotation','action_event') AND r.created_revision>? AND r.created_revision<=? AND ${visibleSql('g')} ORDER BY r.created_revision,g.id LIMIT 501`,
        )
        .all(app.app_id, scope, q.from_revision, q.to_revision) as {
        id: string;
        kind: string;
        payload_json: string;
      }[];
      complete &&= annotations.length <= 500;
      for (const r of annotations.slice(0, 500)) {
        const p = JSON.parse(r.payload_json) as {
          supersedes_id?: string;
          evidence_ids?: string[];
          before_capture_id?: string;
          after_capture_id?: string;
        };
        all.push({
          kind: p.supersedes_id ? 'altered' : 'added',
          subject: r.kind === 'annotation' ? 'annotation' : 'outcome',
          before_id: p.supersedes_id ?? null,
          after_id: r.id,
          evidence_ids:
            r.kind === 'annotation'
              ? p.evidence_ids!.slice(0, 50)
              : [
                  p.before_capture_id!,
                  ...(p.after_capture_id ? [p.after_capture_id] : []),
                ],
          coverage: { kind: 'partial', subtree: 'root', reason: 'unsupported' },
        });
      }
      data = {
        status: 'comparable',
        changes: all,
        invalidated_ids: [...invalidated].slice(0, 50),
        complete: complete && invalidated.size <= 50,
      };
    }
    const budget = q.budget ?? {
      records: LIMITS.default_records,
      bytes: LIMITS.default_output_bytes,
    };
    const envelope = (d: unknown, next?: number) => ({
      schema_version: 1,
      store_revision: revision,
      data: d,
      warnings: [],
      ...(next === undefined
        ? {}
        : { next_cursor: { token: token(next), store_revision: revision } }),
    });
    const fits = (v: unknown) =>
      Buffer.byteLength(JSON.stringify(v)) <= budget.bytes;
    if (data.status === 'incomparable') {
      if (q.cursor) throw new KnowledgeError('INVALID_INPUT');
      const result = envelope(data);
      if (!fits(result)) throw new KnowledgeError('BUDGET_EXCEEDED');
      return validateResponse('wg_changes', result);
    }
    if (offset > data.changes.length) throw new KnowledgeError('INVALID_INPUT');
    const selected: Change[] = [];
    let index = offset;
    while (index < data.changes.length && selected.length < budget.records) {
      selected.push(data.changes[index]!);
      if (
        !fits(
          envelope(
            {
              ...data,
              changes: selected,
              complete: data.complete && index + 1 === data.changes.length,
            },
            index + 1 < data.changes.length ? index + 1 : undefined,
          ),
        )
      ) {
        selected.pop();
        break;
      }
      index++;
    }
    const result = envelope(
      {
        ...data,
        changes: selected,
        complete: data.complete && index === data.changes.length,
      },
      index > offset && index < data.changes.length ? index : undefined,
    );
    if (!fits(result)) throw new KnowledgeError('BUDGET_EXCEEDED');
    return validateResponse('wg_changes', result);
  }, false);
}
