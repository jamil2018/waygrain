import type { z } from 'zod';
import { contracts, LIMITS, type Responses } from '../contracts/index.js';
import { validateRequest, validateResponse } from '../contracts/validation.js';
import { Store } from '../store/database.js';
import { digest, KnowledgeError } from './normalize.js';
import { selectedApp } from './ingest.js';
import { traverse } from './traversal.js';
import { record, scopeId } from './graph.js';
import { summary, visible, visibleSql, activeAnnotations } from './summary.js';

type Query = z.output<typeof contracts.wg_query.input>;
export interface Selection {
  ids: string[];
  exhausted: boolean;
  guards: string[];
  applicability: 'unconditional' | 'conditional' | 'requires_check';
}
const lexical = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase();
const activeTagSql = `SELECT lower(json_extract(a.payload_json,'$.value')) AS tag FROM graph_records a WHERE a.kind='annotation' AND json_extract(a.payload_json,'$.target_id')=r.id AND json_extract(a.payload_json,'$.kind')='tag' AND ${visibleSql('a')} AND NOT EXISTS (SELECT 1 FROM graph_records newer WHERE newer.kind='annotation' AND json_extract(newer.payload_json,'$.supersedes_id')=a.id AND ${visibleSql('newer')})`;
const activeNameSql = activeTagSql.replace("='tag'", "='name'");
const namesSql = `COALESCE(s.name,ss.name,json_extract(c.descriptor_json,'$.name'),cs.name,json_extract(g.payload_json,'$.name'),json_extract(g.payload_json,'$.value'),json_extract(g.payload_json,'$.verb'),json_extract(g.payload_json,'$.outcome'),json_extract(g.payload_json,'$.runner'),'')`;
function search(
  store: Store,
  q: Extract<Query, { mode: 'search' }>,
  scope: string,
  offset: number,
): Selection {
  const where = [`r.app_id=?`, `r.scope_id=?`, visibleSql('r')];
  const params: unknown[] = [q.app_id, scope];
  if (q.filters.ids) {
    if (!q.filters.ids.length)
      return {
        ids: [],
        exhausted: true,
        guards: [],
        applicability: 'requires_check',
      };
    where.push(`r.id IN (${q.filters.ids.map(() => '?').join(',')})`);
    params.push(...q.filters.ids);
  }
  if (q.filters.kinds) {
    if (!q.filters.kinds.length)
      return {
        ids: [],
        exhausted: true,
        guards: [],
        applicability: 'requires_check',
      };
    where.push(`r.kind IN (${q.filters.kinds.map(() => '?').join(',')})`);
    params.push(...q.filters.kinds);
  }
  for (const tag of q.filters.tags ?? []) {
    where.push(`? IN (${activeTagSql})`);
    params.push(lexical(tag));
  }
  const text = `lower(${namesSql} || ' ' || COALESCE((SELECT group_concat(tag,' ') FROM (${activeTagSql})),'' ) || ' ' || COALESCE((SELECT group_concat(tag,' ') FROM (${activeNameSql})),''))`;
  const terms = [
    ...(q.filters.terms ?? []),
    ...(q.filters.name ? [q.filters.name] : []),
  ]
    .map(lexical)
    .filter(Boolean);
  for (const term of terms) {
    where.push(`(r.id=? OR instr(${text},?)>0)`);
    params.push(term, term);
  }
  const rankParams: unknown[] = [];
  const exactIds = (q.filters.ids ?? []).concat(terms);
  const rankId = exactIds.length
    ? `r.id IN (${exactIds.map(() => '?').join(',')})`
    : '0';
  rankParams.push(...exactIds);
  const exact = (q.filters.tags ?? []).concat(terms).map(lexical);
  const rankName = exact.length
    ? exact
        .map(
          () =>
            `(lower(${namesSql})=? OR ? IN (${activeTagSql}) OR ? IN (${activeNameSql}))`,
        )
        .join(' OR ')
    : '0';
  exact.forEach((v) => rankParams.push(v, v, v));
  const sql = `SELECT r.id,CASE WHEN ${rankId} THEN 0 WHEN ${rankName} THEN 1 ELSE 2 END AS rank FROM records r LEFT JOIN screens s ON s.id=r.id LEFT JOIN states st ON st.id=r.id LEFT JOIN screens ss ON ss.id=st.screen_id LEFT JOIN controls c ON c.id=r.id LEFT JOIN captures cp ON cp.id=r.id LEFT JOIN screens cs ON cs.id=cp.screen_id LEFT JOIN graph_records g ON g.id=r.id WHERE ${where.join(' AND ')} ORDER BY rank,r.id LIMIT 51 OFFSET ?`;
  const rows = store.db.prepare(sql).all(...rankParams, ...params, offset) as {
    id: string;
  }[];
  return {
    ids: rows.map((r) => r.id),
    exhausted: rows.length < 51,
    guards: [],
    applicability: 'requires_check',
  };
}
export const graphEdgesSql = `
 SELECT source_id a,target_id b FROM relations
 UNION SELECT capture_id a,target_id b FROM evidence_links
 UNION SELECT id a,json_extract(payload_json,'$.state_id') b FROM graph_records WHERE kind='action'
 UNION SELECT id a,json_extract(payload_json,'$.control_id') b FROM graph_records WHERE kind='action'
 UNION SELECT id a,json_extract(payload_json,'$.action_id') b FROM graph_records WHERE kind IN ('action_event','transition')
 UNION SELECT id a,json_extract(payload_json,'$.before_capture_id') b FROM graph_records WHERE kind IN ('action_event','transition')
 UNION SELECT id a,json_extract(payload_json,'$.after_capture_id') b FROM graph_records WHERE kind IN ('action_event','transition')
 UNION SELECT id a,json_extract(payload_json,'$.source_state_id') b FROM graph_records WHERE kind='transition'
 UNION SELECT id a,json_extract(payload_json,'$.target_state_id') b FROM graph_records WHERE kind='transition'
 UNION SELECT id a,json_extract(payload_json,'$.action_event_id') b FROM graph_records WHERE kind='transition'
`;
function neighbors(
  store: Store,
  q: Extract<Query, { mode: 'neighbors' }>,
  scope: string,
): Selection {
  const target = record(store, q.app_id, q.target_id);
  if (target.scope_id !== scope)
    throw new KnowledgeError('INCOMPATIBLE_CAPTURE');
  if (!visible(store, target.id))
    return {
      ids: [],
      exhausted: true,
      guards: [],
      applicability: 'requires_check',
    };
  const seen = new Set([target.id]);
  let frontier = [target.id];
  const ids: string[] = [];
  for (let hop = 0; hop < q.hops; hop++) {
    const next: string[] = [];
    for (const id of frontier) {
      const rows = store.db
        .prepare(
          `SELECT DISTINCT r.id FROM (${graphEdgesSql}) edges JOIN records r ON r.id=CASE WHEN edges.a=? THEN edges.b ELSE edges.a END WHERE (edges.a=? OR edges.b=?) AND r.app_id=? AND r.scope_id=? AND ${visibleSql('r')} ORDER BY r.id LIMIT 501`,
        )
        .all(id, id, id, q.app_id, scope) as { id: string }[];
      for (const row of rows)
        if (!seen.has(row.id)) {
          if (seen.size >= LIMITS.max_visited_nodes)
            return {
              ids,
              exhausted: false,
              guards: [],
              applicability: 'requires_check',
            };
          seen.add(row.id);
          ids.push(row.id);
          next.push(row.id);
        }
      if (rows.length > 500)
        return {
          ids,
          exhausted: false,
          guards: [],
          applicability: 'requires_check',
        };
    }
    frontier = next.sort();
    if (!frontier.length) break;
  }
  return { ids, exhausted: true, guards: [], applicability: 'requires_check' };
}
export function query(
  store: Store,
  input: unknown,
  now = Date.now(),
): Responses['wg_query'] {
  const q = validateRequest('wg_query', input, now) as Query;
  const app = selectedApp(store, q);
  return store.transaction(() => {
    const scope = scopeId(store, app, q.scope, true),
      revision = store.revision;
    const filter = JSON.parse(
      JSON.stringify({ ...q, cursor: undefined, budget: undefined }),
    );
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
        offset < 0 ||
        q.cursor.token !== token(offset)
      )
        throw new KnowledgeError('INVALID_INPUT');
    }
    const selected =
      q.mode === 'search'
        ? search(store, q, scope, offset)
        : q.mode === 'neighbors'
          ? neighbors(store, q, scope)
          : traverse(store, q, scope);
    if (q.mode !== 'search' && offset > selected.ids.length)
      throw new KnowledgeError('INVALID_INPUT');
    const changed: string[] = [];
    if (q.mode === 'path' || q.mode === 'flow') {
      for (const id of selected.ids) {
        const row = record(store, q.app_id, id);
        if (row.kind === 'state') {
          const state = store.db
            .prepare('SELECT screen_id FROM states WHERE id=?')
            .get(id) as { screen_id: string };
          const latest = store.db
            .prepare(
              `SELECT c.state_id FROM captures c JOIN records r ON r.id=c.id WHERE c.screen_id=? AND c.coverage='complete' AND ${visibleSql('c')} ORDER BY julianday(c.captured_at) DESC,r.created_revision DESC,c.id LIMIT 1`,
            )
            .get(state.screen_id) as { state_id: string } | undefined;
          if (latest && latest.state_id !== id) changed.push(id);
        }
        const evidence = summary(
          store,
          q.app_id,
          id,
          now,
          q.max_age_seconds,
        ).evidence;
        if (
          evidence.freshness.status === 'stale' ||
          evidence.freshness.status === 'unknown' ||
          evidence.freshness.status === 'contradicted'
        )
          if (selected.applicability === 'unconditional')
            selected.applicability = 'requires_check';
      }
      if (changed.length && selected.applicability === 'unconditional')
        selected.applicability = 'requires_check';
    }
    const ids = q.mode === 'search' ? selected.ids : selected.ids.slice(offset);
    if (q.cursor && (!offset || !ids.length))
      throw new KnowledgeError('INVALID_INPUT');
    const records: Extract<
      Responses['wg_query']['data'],
      { status: 'complete' }
    >['records'] = [];
    const warnings: Responses['wg_query']['warnings'] = changed.length
      ? [
          {
            code: 'STATE_CHANGED',
            message:
              'A referenced historical state has newer complete evidence.',
            affected_ids: changed.slice(0, 50),
          },
        ]
      : [];
    const envelope = (complete: boolean, next?: number) => ({
      schema_version: 1,
      store_revision: revision,
      warnings: [...new Set(warnings.map((w) => w.code))].map((code) => ({
        code,
        message: warnings.find((w) => w.code === code)!.message,
        affected_ids: [
          ...new Set(
            warnings
              .filter((w) => w.code === code)
              .flatMap((w) => w.affected_ids),
          ),
        ],
      })),
      data: complete
        ? records.length
          ? {
              status: 'complete',
              records,
              guards: selected.guards,
              applicability: selected.applicability,
            }
          : {
              status: 'no_matches',
              records: [],
              guards: [],
              applicability: 'requires_check',
            }
        : {
            status: 'incomplete',
            records,
            guards: selected.guards,
            applicability:
              selected.applicability === 'unconditional'
                ? 'requires_check'
                : selected.applicability,
            reason: 'BUDGET_EXCEEDED',
          },
      ...(next === undefined
        ? {}
        : { next_cursor: { token: token(next), store_revision: revision } }),
    });
    const fits = (v: unknown) =>
      Buffer.byteLength(JSON.stringify(v)) <= q.budget.bytes;
    let index = 0;
    while (index < ids.length && records.length < q.budget.records) {
      const item = summary(
        store,
        q.app_id,
        ids[index]!,
        now,
        q.max_age_seconds,
      );
      const oldWarnings = warnings.length;
      if (item.evidence.freshness.status === 'contradicted')
        warnings.push({
          code: 'ANNOTATION_CONFLICT',
          message: 'Supported annotations conflict.',
          affected_ids: [item.id],
        });
      if (
        activeAnnotations(store, item.id).length > 50 ||
        (item.evidence.coverage.kind === 'partial' &&
          item.evidence.coverage.reason === 'truncated')
      )
        warnings.push({
          code: 'EVIDENCE_LIMIT',
          message: 'Evidence summary is bounded.',
          affected_ids: [item.id],
        });
      records.push(item);
      const next = offset + index + 1;
      if (
        !fits(
          envelope(
            index + 1 === ids.length && selected.exhausted,
            index + 1 === ids.length && selected.exhausted ? undefined : next,
          ),
        )
      ) {
        records.pop();
        warnings.splice(oldWarnings);
        break;
      }
      index++;
    }
    const complete = index === ids.length && selected.exhausted;
    const next =
      !complete && index > 0 && index < ids.length
        ? offset + index
        : !complete && q.mode === 'search' && index > 0
          ? offset + index
          : undefined;
    const result = envelope(complete, next);
    if (!fits(result)) throw new KnowledgeError('BUDGET_EXCEEDED');
    return validateResponse('wg_query', result);
  }, false);
}
