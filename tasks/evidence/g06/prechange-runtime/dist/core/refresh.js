import { contracts } from '../contracts/index.js';
import { validateRequest, validateResponse } from '../contracts/validation.js';
import { Store } from '../store/database.js';
import { selectedApp } from './ingest.js';
import { graphPayload, record, scopeId } from './graph.js';
import { summary, visible, visibleSql } from './summary.js';
import { KnowledgeError } from './normalize.js';
export function planRefresh(store, input, now = Date.now()) {
    const q = validateRequest('wg_plan_refresh', input, now);
    const app = selectedApp(store, q);
    return store.transaction(() => {
        const scope = scopeId(store, app, q.scope, true);
        const steps = [], unresolved = new Set(), planned = new Set();
        const add = (target, owner) => {
            if (planned.has(target))
                return;
            const row = store.db
                .prepare('SELECT id,scope_id FROM records WHERE id=? AND app_id=?')
                .get(target, app.app_id);
            if (!row || !visible(store, target)) {
                unresolved.add(owner);
                return;
            }
            if (row.scope_id !== scope)
                throw new KnowledgeError('INCOMPATIBLE_CAPTURE');
            const r = record(store, app.app_id, target);
            const s = summary(store, app.app_id, target, now, q.max_age_seconds);
            if (r.kind === 'flow') {
                const transitions = graphPayload(store, target).transition_ids;
                for (const id of transitions)
                    add(id, owner);
                if ((s.evidence.provenance === 'test_verified' &&
                    (transitions.some((id) => planned.has(id)) ||
                        unresolved.has(owner) ||
                        s.evidence.freshness.status !== 'recent')) ||
                    s.evidence.freshness.status === 'contradicted') {
                    if (steps.length >= q.step_budget)
                        unresolved.add(owner);
                    else {
                        planned.add(target);
                        steps.push({
                            target_id: target,
                            expected_scope: { ...q.scope },
                            minimum_observations: s.evidence.provenance === 'test_verified'
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
            let state = null, screen = null;
            if (r.kind === 'state')
                state = target;
            if (r.kind === 'control')
                state = store.db
                    .prepare('SELECT state_id FROM controls WHERE id=?')
                    .get(target).state_id;
            if (r.kind === 'action')
                state = graphPayload(store, target).state_id;
            if (r.kind === 'transition')
                state = graphPayload(store, target).source_state_id;
            if (r.kind === 'screen')
                screen = target;
            if (r.kind === 'capture')
                screen = store.db
                    .prepare('SELECT screen_id FROM captures WHERE id=?')
                    .get(target).screen_id;
            if (!state && !screen) {
                unresolved.add(owner);
                return;
            }
            if (state)
                screen = store.db
                    .prepare('SELECT screen_id FROM states WHERE id=?')
                    .get(state).screen_id;
            const endpointStates = r.kind === 'transition'
                ? [state, graphPayload(store, target).target_state_id]
                : state
                    ? [state]
                    : [];
            const changed = endpointStates.some((id) => {
                const row = store.db
                    .prepare('SELECT screen_id FROM states WHERE id=?')
                    .get(id);
                const latest = store.db
                    .prepare(`SELECT c.state_id FROM captures c JOIN records r ON r.id=c.id WHERE c.screen_id=? AND c.coverage='complete' AND ${visibleSql('c')} ORDER BY julianday(c.captured_at) DESC,r.created_revision DESC,c.id LIMIT 1`)
                    .get(row.screen_id);
                return latest && latest.state_id !== id;
            });
            if (!changed &&
                s.evidence.freshness.status === 'recent' &&
                s.evidence.freshness.last_checked_at !== null)
                return;
            const observation = store.db
                .prepare(`SELECT c.capture_json FROM captures c WHERE c.screen_id=? AND c.coverage='complete' AND ${visibleSql('c')} ORDER BY julianday(c.captured_at) DESC,c.id LIMIT 1`)
                .get(screen);
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
                        expected_view: JSON.parse(store.db
                            .prepare('SELECT projection_json FROM states WHERE id=?')
                            .get(state).projection_json).view,
                    }
                    : observation
                        ? {
                            expected_view: JSON.parse(observation.capture_json)
                                .view,
                        }
                        : {}),
                minimum_observations: r.kind === 'transition'
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
        for (const id of [...new Set(q.target_ids)])
            add(id, id);
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
