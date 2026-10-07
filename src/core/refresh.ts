import type { z } from 'zod';
import { contracts, type Responses } from '../contracts/index.js';
import { validateRequest, validateResponse } from '../contracts/validation.js';
import { Store } from '../store/database.js';
import { selectedApp } from './ingest.js';
import { graphPayload, record, scopeId } from './graph.js';
import { summary, visible, visibleSql } from './summary.js';
import { KnowledgeError, type Capture } from './normalize.js';
import type { Flow } from './test-evidence.js';
import type { Action, Transition } from './traces.js';

type Step = Responses['wg_plan_refresh']['data']['steps'][number];
export function planRefresh(
  store: Store,
  input: unknown,
  now = Date.now(),
): Responses['wg_plan_refresh'] {
  const q = validateRequest('wg_plan_refresh', input, now) as z.output<
    typeof contracts.wg_plan_refresh.input
  >;
  const app = selectedApp(store, q);
  return store.transaction(() => {
    const scope = scopeId(store, app, q.scope, true);
    const steps: Step[] = [],
      unresolved = new Set<string>(),
      planned = new Set<string>();
    const add = (target: string, owner: string) => {
      if (planned.has(target)) return;
      const row = store.db
        .prepare('SELECT id,scope_id FROM records WHERE id=? AND app_id=?')
        .get(target, app.app_id) as
        { id: string; scope_id: string } | undefined;
      if (!row || !visible(store, target)) {
        unresolved.add(owner);
        return;
      }
      if (row.scope_id !== scope)
        throw new KnowledgeError('INCOMPATIBLE_CAPTURE');
      const r = record(store, app.app_id, target);
      const s = summary(store, app.app_id, target, now, q.max_age_seconds);
      if (r.kind === 'flow') {
        const transitions = graphPayload<Flow>(store, target).transition_ids;
        for (const id of transitions) add(id, owner);
        if (
          (s.evidence.provenance === 'test_verified' &&
            (transitions.some((id) => planned.has(id)) ||
              unresolved.has(owner) ||
              s.evidence.freshness.status !== 'recent')) ||
          s.evidence.freshness.status === 'contradicted'
        ) {
          if (steps.length >= q.step_budget) unresolved.add(owner);
          else {
            planned.add(target);
            steps.push({
              target_id: target,
              expected_scope: { ...q.scope },
              minimum_observations:
                s.evidence.provenance === 'test_verified'
                  ? 'passed_assertion'
                  : 'before_action_after',
              prerequisites: [
                'ordered_flow_trace',
                ...(s.evidence.provenance === 'test_verified'
                  ? ['matching_passed_assertion']
                  : []),
                ...(s.evidence.freshness.status === 'contradicted'
                  ? ['resolve_conflicting_annotations']
                  : []),
              ],
            });
          }
        }
        return;
      }
      let state: string | null = null,
        screen: string | null = null;
      if (r.kind === 'state') state = target;
      if (r.kind === 'control')
        state = (
          store.db
            .prepare('SELECT state_id FROM controls WHERE id=?')
            .get(target) as { state_id: string }
        ).state_id;
      if (r.kind === 'action')
        state = graphPayload<Action>(store, target).state_id;
      if (r.kind === 'transition')
        state = graphPayload<Transition>(store, target).source_state_id;
      if (r.kind === 'screen') screen = target;
      if (r.kind === 'capture')
        screen = (
          store.db
            .prepare('SELECT screen_id FROM captures WHERE id=?')
            .get(target) as { screen_id: string }
        ).screen_id;
      if (!state && !screen) {
        unresolved.add(owner);
        return;
      }
      if (state)
        screen = (
          store.db
            .prepare('SELECT screen_id FROM states WHERE id=?')
            .get(state) as { screen_id: string }
        ).screen_id;
      const endpointStates =
        r.kind === 'transition'
          ? [state!, graphPayload<Transition>(store, target).target_state_id]
          : state
            ? [state]
            : [];
      const changed = endpointStates.some((id) => {
        const row = store.db
          .prepare('SELECT screen_id FROM states WHERE id=?')
          .get(id) as { screen_id: string };
        const latest = store.db
          .prepare(
            `SELECT c.state_id FROM captures c JOIN records r ON r.id=c.id WHERE c.screen_id=? AND c.coverage='complete' AND ${visibleSql('c')} ORDER BY julianday(c.captured_at) DESC,r.created_revision DESC,c.id LIMIT 1`,
          )
          .get(row.screen_id) as { state_id: string } | undefined;
        return latest && latest.state_id !== id;
      });
      if (
        !changed &&
        s.evidence.freshness.status === 'recent' &&
        s.evidence.freshness.last_checked_at !== null
      )
        return;
      const observation = store.db
        .prepare(
          `SELECT c.capture_json FROM captures c WHERE c.screen_id=? AND c.coverage='complete' AND ${visibleSql('c')} ORDER BY julianday(c.captured_at) DESC,c.id LIMIT 1`,
        )
        .get(screen) as { capture_json: string } | undefined;
      if (steps.length >= q.step_budget) {
        unresolved.add(owner);
        return;
      }
      planned.add(target);
      steps.push({
        target_id: target,
        expected_scope: { ...q.scope },
        ...(state
          ? {
              expected_view: (
                JSON.parse(
                  (
                    store.db
                      .prepare('SELECT projection_json FROM states WHERE id=?')
                      .get(state) as { projection_json: string }
                  ).projection_json,
                ) as { view: Capture['view'] }
              ).view,
            }
          : observation
            ? {
                expected_view: (JSON.parse(observation.capture_json) as Capture)
                  .view,
              }
            : {}),
        minimum_observations:
          r.kind === 'transition'
            ? 'before_action_after'
            : s.evidence.provenance === 'test_verified'
              ? 'passed_assertion'
              : 'complete_state',
        prerequisites: [
          ...(r.kind === 'transition'
            ? [
                'host_authorized_action',
                'complete_before_and_after',
                'matching_scope_session_trace',
              ]
            : []),
          ...(s.evidence.provenance === 'test_verified'
            ? ['matching_passed_assertion', 'complete_state_observation']
            : []),
          ...(s.evidence.freshness.status === 'contradicted'
            ? ['resolve_conflicting_annotations']
            : []),
        ],
      });
    };
    for (const id of [...new Set(q.target_ids)]) add(id, id);
    return validateResponse('wg_plan_refresh', {
      schema_version: 1,
      store_revision: store.revision,
      warnings: [],
      data: {
        status: unresolved.size && !steps.length ? 'unsupported' : 'planned',
        steps,
        unresolved_ids: [...unresolved],
        complete: unresolved.size === 0,
      },
    });
  }, false);
}
