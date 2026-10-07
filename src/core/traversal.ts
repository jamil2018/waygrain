import type { z } from 'zod';
import { contracts, LIMITS } from '../contracts/index.js';
import { Store } from '../store/database.js';
import { record, graphPayload } from './graph.js';
import { KnowledgeError } from './normalize.js';
import { visible, visibleSql } from './summary.js';
import type { Transition, Action } from './traces.js';
import type { Flow } from './test-evidence.js';
import type { Selection } from './query.js';
type Query = z.output<typeof contracts.wg_query.input>;
type Traversal = Extract<Query, { mode: 'path' | 'flow' }>;
const empty = (exhausted = true): Selection => ({
  ids: [],
  exhausted,
  guards: [],
  applicability: 'requires_check',
});
function availableTransition(store: Store, id: string) {
  const tr = graphPayload<Transition>(store, id);
  if (
    !['observed', 'test_verified'].includes(tr.provenance) ||
    ![
      id,
      tr.source_state_id,
      tr.target_state_id,
      tr.action_id,
      tr.action_event_id,
      tr.before_capture_id,
      tr.after_capture_id,
    ].every((id) => visible(store, id))
  )
    return null;
  const action = graphPayload<Action>(store, tr.action_id);
  if (action.control_id && !visible(store, action.control_id)) return null;
  return tr;
}
function selection(
  store: Store,
  transitions: string[],
  source: string,
  exhausted: boolean,
  flow?: string,
): Selection {
  const ids = [...(flow ? [flow] : []), source],
    guards = new Set<string>();
  let failed = false;
  for (const id of transitions) {
    const tr = graphPayload<Transition>(store, id),
      action = graphPayload<Action>(store, tr.action_id);
    ids.push(tr.action_id, id, tr.target_state_id);
    [...tr.guards, ...action.preconditions].forEach((g) => guards.add(g));
    failed ||= tr.outcome !== 'success';
  }
  if (guards.size > 50) throw new KnowledgeError('BUDGET_EXCEEDED');
  return {
    ids: [...new Set(ids)],
    exhausted,
    guards: [...guards],
    applicability:
      !exhausted || failed
        ? 'requires_check'
        : guards.size
          ? 'conditional'
          : 'unconditional',
  };
}
export function traverse(store: Store, q: Traversal, scope: string): Selection {
  if (q.mode === 'flow') {
    const row = record(store, q.app_id, q.flow_id, 'flow');
    if (row.scope_id !== scope)
      throw new KnowledgeError('INCOMPATIBLE_CAPTURE');
    if (!visible(store, row.id)) return empty();
    const flow = graphPayload<Flow>(store, row.id),
      selected: string[] = [];
    let exhausted = true,
      previous: string | undefined;
    const visited = new Set([row.id]);
    for (const id of flow.transition_ids) {
      const row = record(store, q.app_id, id, 'transition');
      if (row.scope_id !== scope)
        throw new KnowledgeError('INCOMPATIBLE_CAPTURE');
      const tr = availableTransition(store, id);
      if (!tr) return empty();
      if (previous && tr.source_state_id !== previous)
        throw new KnowledgeError('INCOMPATIBLE_CAPTURE');
      if (selected.length >= q.max_depth) {
        exhausted = false;
        break;
      }
      const added = [
        tr.source_state_id,
        tr.action_id,
        id,
        tr.target_state_id,
      ].filter((id) => !visited.has(id));
      if (visited.size + new Set(added).size > q.max_visited) {
        exhausted = false;
        break;
      }
      added.forEach((id) => visited.add(id));
      selected.push(id);
      previous = tr.target_state_id;
    }
    if (!selected.length && !exhausted)
      return {
        ids: [row.id],
        exhausted: false,
        guards: [],
        applicability: 'requires_check',
      };
    const first = graphPayload<Transition>(store, flow.transition_ids[0]!);
    return selection(store, selected, first.source_state_id, exhausted, row.id);
  }
  const source = record(store, q.app_id, q.source_state_id, 'state'),
    target = record(store, q.app_id, q.target_state_id, 'state');
  if (source.scope_id !== scope || target.scope_id !== scope)
    throw new KnowledgeError('INCOMPATIBLE_CAPTURE');
  if (!visible(store, source.id) || !visible(store, target.id)) return empty();
  if (source.id === target.id) return selection(store, [], source.id, true);
  const queue = [{ id: source.id, transitions: [] as string[] }],
    seen = new Set([source.id]);
  let exhausted = true,
    examined = 0;
  for (let index = 0; index < queue.length; index++) {
    const current = queue[index]!;
    const edges = store.db
      .prepare(
        `SELECT g.id FROM graph_records g WHERE g.kind='transition' AND g.app_id=? AND g.scope_id=? AND json_extract(g.payload_json,'$.source_state_id')=? AND json_extract(g.payload_json,'$.provenance') IN ('observed','test_verified') AND ${visibleSql('g')} ORDER BY g.id LIMIT ?`,
      )
      .all(q.app_id, scope, current.id, q.max_visited + 1) as { id: string }[];
    for (const edge of edges) {
      if (++examined > LIMITS.max_visited_nodes) return empty(false);
      const tr = availableTransition(store, edge.id);
      if (!tr || seen.has(tr.target_state_id)) continue;
      if (current.transitions.length >= q.max_depth) {
        exhausted = false;
        continue;
      }
      if (seen.size >= q.max_visited) return empty(false);
      const path = [...current.transitions, edge.id];
      if (tr.target_state_id === target.id)
        return selection(store, path, source.id, true);
      seen.add(tr.target_state_id);
      queue.push({ id: tr.target_state_id, transitions: path });
    }
    if (edges.length > q.max_visited) exhausted = false;
  }
  return empty(exhausted);
}
