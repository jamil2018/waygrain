import { randomUUID } from 'node:crypto';
import { scope, recordKind, reference } from '../contracts/common.js';
import { annotation, RELATION_ENDPOINTS } from '../contracts/operations.js';
import { Store } from '../store/database.js';
import { canonical, KnowledgeError, } from './normalize.js';
export function record(store, app, id, kind) {
    const row = store.db
        .prepare('SELECT * FROM records WHERE id=? AND app_id=?')
        .get(id, app);
    if (!row || (kind && row.kind !== kind))
        throw new KnowledgeError('NOT_FOUND');
    return row;
}
export function scopeId(store, app, value, allowEmpty = false) {
    const json = canonical(value);
    if (!app.scopes.some((entry) => canonical({
        environment: entry.environment,
        origin: entry.origin,
        role: entry.role,
        account_scope: entry.account_scope,
        locale: entry.locale,
    }) === json))
        throw new KnowledgeError('UNKNOWN_SCOPE');
    const row = store.db
        .prepare('SELECT id FROM scopes WHERE app_id=? AND scope_json=?')
        .get(app.app_id, json);
    if (!row && !allowEmpty)
        throw new KnowledgeError('NOT_FOUND');
    return row?.id ?? '';
}
// All retained prose must be explicitly reviewed by the operator, like capture labels.
export function safeProse(app, value) {
    const normalized = value.replace(/\s+/g, ' ').trim();
    if (!normalized ||
        !app.redaction_profiles.some((p) => p.allowed_labels.some((label) => label.replace(/\s+/g, ' ').trim() === normalized)))
        throw new KnowledgeError('INVALID_INPUT');
    return normalized;
}
export function graphPayload(store, id) {
    const row = store.db
        .prepare('SELECT payload_json FROM graph_records WHERE id=?')
        .get(id);
    if (!row)
        throw new KnowledgeError('NOT_FOUND');
    return JSON.parse(row.payload_json);
}
export function putGraph(store, app, scope, kind, payload, revision, now, id = randomUUID()) {
    store.db
        .prepare('INSERT INTO records VALUES(?,?,?,?,?)')
        .run(id, app, scope, kind, revision);
    store.db
        .prepare('INSERT INTO graph_records VALUES(?,?,?,?,?,?)')
        .run(id, app, scope, kind, canonical(payload), new Date(now).toISOString());
    return id;
}
export function relate(store, app, source, target, type) {
    const a = record(store, app, source), b = record(store, app, target);
    if (a.scope_id !== b.scope_id ||
        !RELATION_ENDPOINTS[type].some(([from, to]) => from === a.kind && to === b.kind))
        throw new KnowledgeError('INCOMPATIBLE_CAPTURE');
    store.db
        .prepare('INSERT OR IGNORE INTO relations VALUES(?,?,?,?,?)')
        .run(source, target, app, a.scope_id, type);
}
export function supports(store, app, evidence, target) {
    const e = record(store, app, evidence), t = record(store, app, target);
    if (e.scope_id !== t.scope_id)
        return false;
    if (e.id === t.id && e.kind === 'capture')
        return true;
    if (e.kind === 'annotation')
        return graphPayload(store, evidence).target_id === target;
    if (t.kind === 'flow')
        return graphPayload(store, target).transition_ids.some((id) => supports(store, app, evidence, id));
    if (e.kind === 'action_event' && t.kind !== 'transition') {
        const event = graphPayload(store, evidence);
        if (t.kind === 'action')
            return event.action_id === target;
        if (t.kind === 'action_event')
            return evidence === target;
        if (t.kind === 'capture')
            return [event.before_capture_id, event.after_capture_id].includes(target);
        return [event.before_capture_id, event.after_capture_id]
            .filter((id) => id !== null)
            .some((id) => supports(store, app, id, target));
    }
    if (t.kind === 'action')
        return supports(store, app, evidence, graphPayload(store, target).state_id);
    if (t.kind === 'action_event') {
        const event = graphPayload(store, target);
        return (e.kind === 'capture' &&
            [event.before_capture_id, event.after_capture_id].includes(evidence));
    }
    if (t.kind === 'transition') {
        const transition = graphPayload(store, target);
        return [
            transition.before_capture_id,
            transition.after_capture_id,
            transition.action_event_id,
        ].includes(evidence);
    }
    if (e.kind === 'capture') {
        const capture = store.db
            .prepare('SELECT coverage FROM captures WHERE id=?')
            .get(evidence);
        if (capture.coverage !== 'complete')
            return false;
        return !!store.db
            .prepare('SELECT 1 FROM evidence_links WHERE capture_id=? AND target_id=?')
            .get(evidence, target);
    }
    return false;
}
