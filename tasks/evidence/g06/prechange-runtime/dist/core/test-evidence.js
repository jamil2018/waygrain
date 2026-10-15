import { testRun, operation } from '../contracts/operations.js';
import { Store } from '../store/database.js';
import { KnowledgeError } from './normalize.js';
import { graphPayload, putGraph, record, relate, scopeId, supports, } from './graph.js';
import { captureRow } from './traces.js';
export function supportsClaim(store, app, evidence, target) {
    const t = record(store, app, target);
    if (t.kind === 'flow') {
        const flow = graphPayload(store, target);
        return flow.transition_ids.every((id) => supportsClaim(store, app, evidence, id));
    }
    if (t.kind === 'action')
        return evidence.some((id) => record(store, app, id).kind === 'action_event' &&
            graphPayload(store, id).action_id === target);
    if (t.kind === 'action_event') {
        const event = graphPayload(store, target);
        return (evidence.includes(target) ||
            (event.after_capture_id !== null &&
                [event.before_capture_id, event.after_capture_id].every((id) => evidence.includes(id))));
    }
    if (t.kind === 'transition') {
        const transition = graphPayload(store, target);
        // A transition assertion must cover the trace, not just one endpoint.
        return (evidence.includes(transition.action_event_id) ||
            [transition.before_capture_id, transition.after_capture_id].every((id) => evidence.includes(id)));
    }
    return evidence.some((id) => supports(store, app, id, target));
}
export function validateRun(store, app, id, now) {
    const run = graphPayload(store, id);
    const scope = scopeId(store, app, run.scope);
    if (Date.parse(run.finished_at) > now + 300000)
        throw new KnowledgeError('INVALID_INPUT');
    for (const assertion of run.assertions) {
        const target = record(store, app.app_id, assertion.target_id);
        if (target.scope_id !== scope ||
            !supportsClaim(store, app.app_id, assertion.evidence_ids, target.id))
            throw new KnowledgeError('INCOMPATIBLE_CAPTURE');
        for (const evidence of assertion.evidence_ids) {
            const e = record(store, app.app_id, evidence);
            if (e.scope_id !== scope ||
                !['capture', 'action_event'].includes(e.kind) ||
                !supports(store, app.app_id, evidence, target.id))
                throw new KnowledgeError('INCOMPATIBLE_CAPTURE');
            const at = e.kind === 'capture'
                ? captureRow(store, app.app_id, evidence).captured_at
                : graphPayload(store, evidence).occurred_at;
            if (Date.parse(at) < Date.parse(run.started_at) ||
                Date.parse(at) > Date.parse(run.finished_at))
                throw new KnowledgeError('INCOMPATIBLE_CAPTURE');
        }
    }
}
export function requireVerification(store, app, runId, target) {
    record(store, app.app_id, runId, 'test_run');
    const run = graphPayload(store, runId), t = record(store, app.app_id, target);
    if (record(store, app.app_id, runId).scope_id !== t.scope_id ||
        run.outcome !== 'passed' ||
        !run.assertions.some((a) => a.target_id === target &&
            a.result === 'passed' &&
            supportsClaim(store, app.app_id, a.evidence_ids, target)))
        throw new KnowledgeError('INCOMPATIBLE_CAPTURE');
}
export function testOperation(store, app, op, resolve, deferred, revision, now, id) {
    if (op.op === 'create_flow') {
        const scope = scopeId(store, app, op.scope);
        const transitions = op.transition_ids.map(resolve);
        let previous;
        for (const transition of transitions) {
            const row = record(store, app.app_id, transition, 'transition'), value = graphPayload(store, transition);
            if (row.scope_id !== scope ||
                (previous && previous !== value.source_state_id))
                throw new KnowledgeError('INCOMPATIBLE_CAPTURE');
            previous = value.target_state_id;
        }
        putGraph(store, app.app_id, scope, 'flow', { name: op.name, transition_ids: transitions, scope: op.scope }, revision, now, id);
        for (const transition of transitions)
            relate(store, app.app_id, transition, id, 'part_of');
        return id;
    }
    if (op.op === 'record_test_run') {
        const scope = scopeId(store, app, op.run.scope);
        const run = {
            ...op.run,
            assertions: op.run.assertions.map((a) => ({
                ...a,
                target_id: deferred(a.target_id),
                evidence_ids: a.evidence_ids.map(resolve),
            })),
        };
        return putGraph(store, app.app_id, scope, 'test_run', run, revision, now, id);
    }
    throw new KnowledgeError('INVALID_INPUT');
}
