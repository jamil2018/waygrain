import { randomUUID } from 'node:crypto';
import { validateRequest, validateResponse } from '../contracts/validation.js';
import { contracts } from '../contracts/index.js';
import { requireTraceSlot } from './traces.js';
import { visible } from './summary.js';
import { Store } from '../store/database.js';
import { KnowledgeError, canonical, digest, normalizeCapture, safeScreenName, stateProjection, NORMALIZATION_VERSION, } from './normalize.js';
export function selectedApp(store, request) {
    if (request.project_id !== store.location.configuration.project_id)
        throw new KnowledgeError('UNKNOWN_SCOPE');
    const app = store.location.configuration.apps.find((a) => a.app_id === request.app_id);
    if (!app)
        throw new KnowledgeError('UNKNOWN_SCOPE');
    return app;
}
const controlRoles = new Set([
    'button',
    'link',
    'textbox',
    'checkbox',
    'radio',
    'combobox',
    'option',
    'tab',
    'menuitem',
    'switch',
    'slider',
    'spinbutton',
]);
function newRecord(store, app, scope, kind, revision) {
    const id = randomUUID();
    store.db
        .prepare('INSERT INTO records VALUES(?,?,?,?,?)')
        .run(id, app, scope, kind, revision);
    return id;
}
function resolveScope(store, appId, scope) {
    const json = canonical(scope);
    const existing = store.db
        .prepare('SELECT id FROM scopes WHERE app_id=? AND scope_json=?')
        .get(appId, json);
    if (existing)
        return existing.id;
    const id = randomUUID();
    store.db.prepare('INSERT INTO scopes VALUES(?,?,?)').run(id, appId, json);
    return id;
}
function resolveScreen(store, request, app, scopeId, revision) {
    const ref = request.screen_ref;
    let screen;
    if (ref.kind === 'existing') {
        screen = store.db
            .prepare('SELECT * FROM screens WHERE id=? AND app_id=? AND scope_id=?')
            .get(ref.screen_id, app.app_id, scopeId);
        if (!screen)
            throw new KnowledgeError('NOT_FOUND');
    }
    else if (ref.view_key) {
        if (!app.route_mappings.some((m) => m.view_key === ref.view_key &&
            m.origin === request.capture.scope.origin &&
            m.route_template === request.capture.view.route_template))
            throw new KnowledgeError('INCOMPATIBLE_CAPTURE');
        screen = store.db
            .prepare('SELECT * FROM screens WHERE app_id=? AND scope_id=? AND view_key=?')
            .get(app.app_id, scopeId, ref.view_key);
    }
    if (screen) {
        if (!visible(store, screen.id))
            throw new KnowledgeError('CONFLICT');
        if (screen.route_template !== request.capture.view.route_template)
            throw new KnowledgeError('INCOMPATIBLE_CAPTURE');
        return screen.id;
    }
    if (ref.kind !== 'new')
        throw new KnowledgeError('NOT_FOUND');
    const id = newRecord(store, app.app_id, scopeId, 'screen', revision);
    store.db
        .prepare('INSERT INTO screens(id,app_id,scope_id,name,route_template,view_key) VALUES(?,?,?,?,?,?)')
        .run(id, app.app_id, scopeId, ref.name, request.capture.view.route_template, ref.view_key ?? null);
    return id;
}
function controls(store, tree, stateId, app, scope, revision) {
    const ids = [];
    function visit(node, path) {
        if (controlRoles.has(node.role)) {
            const id = newRecord(store, app, scope, 'control', revision);
            // Hints are observation-specific and remain in captures, not immutable state controls.
            const descriptor = {
                path,
                role: node.role,
                name: node.name,
                enabled: node.enabled,
                visible: node.visible,
                ...(node.selected === undefined ? {} : { selected: node.selected }),
            };
            store.db
                .prepare('INSERT INTO controls(id,app_id,scope_id,state_id,descriptor_path,descriptor_json) VALUES(?,?,?,?,?,?)')
                .run(id, app, scope, stateId, path, canonical(descriptor));
            ids.push(id);
        }
        node.children.forEach((child, index) => visit(child, `${path}/${String(index).padStart(4, '0')}`));
    }
    visit(tree, 'root');
    return ids;
}
export function ingest(store, input, now = Date.now()) {
    const parsed = validateRequest('wg_ingest', input, now);
    const app = selectedApp(store, parsed);
    const { capture, redaction_summary } = normalizeCapture(parsed.capture, app);
    const sanitized = {
        ...parsed,
        capture,
        screen_ref: parsed.screen_ref.kind === 'new'
            ? {
                ...parsed.screen_ref,
                name: safeScreenName(parsed.screen_ref.name, app, capture.redaction_profile),
            }
            : parsed.screen_ref,
    };
    const requestDigest = digest(sanitized);
    return store.transaction(() => {
        const replay = store.db
            .prepare('SELECT tool,digest,receipt_json FROM receipts WHERE app_id=? AND request_id=?')
            .get(app.app_id, parsed.request_id);
        if (replay) {
            if (replay.tool !== 'wg_ingest' || replay.digest !== requestDigest)
                throw new KnowledgeError('IDEMPOTENCY_CONFLICT');
            const result = validateResponse('wg_ingest', JSON.parse(replay.receipt_json));
            if (!visible(store, result.data.capture_id))
                throw new KnowledgeError('NOT_FOUND');
            return result;
        }
        store.requireRevision(parsed.expected_store_revision);
        store.requireStorageCapacity();
        const revision = store.advanceRevision();
        const scopeId = resolveScope(store, app.app_id, capture.scope);
        requireTraceSlot(store, app.app_id, scopeId, capture);
        const screenId = resolveScreen(store, sanitized, app, scopeId, revision);
        const projection = stateProjection(capture, screenId);
        const stateHash = digest(projection);
        let stateId = null;
        let controlIds = [];
        const fragmentHash = capture.coverage.kind === 'partial'
            ? digest({ projection, coverage: capture.coverage })
            : null;
        if (capture.coverage.kind === 'complete') {
            const state = store.db
                .prepare('SELECT id,projection_json FROM states WHERE screen_id=? AND normalization_version=? AND state_hash=?')
                .get(screenId, NORMALIZATION_VERSION, stateHash);
            if (state) {
                if (state.projection_json !== canonical(projection))
                    throw new KnowledgeError('CONFLICT');
                stateId = state.id;
                const rows = store.db
                    .prepare('SELECT id FROM controls WHERE state_id=? ORDER BY descriptor_path')
                    .all(stateId);
                controlIds = rows.map((r) => r.id);
            }
            else {
                stateId = newRecord(store, app.app_id, scopeId, 'state', revision);
                store.db
                    .prepare('INSERT INTO states(id,app_id,scope_id,screen_id,normalization_version,state_hash,projection_json) VALUES(?,?,?,?,?,?,?)')
                    .run(stateId, app.app_id, scopeId, screenId, NORMALIZATION_VERSION, stateHash, canonical(projection));
                controlIds = controls(store, capture.tree, stateId, app.app_id, scopeId, revision);
            }
        }
        if (stateId) {
            for (const [source, target] of [
                [screenId, stateId],
                ...controlIds.map((id) => [stateId, id]),
            ])
                store.db
                    .prepare("INSERT OR IGNORE INTO relations VALUES(?,?,?,?,'contains')")
                    .run(source, target, app.app_id, scopeId);
        }
        const captureId = newRecord(store, app.app_id, scopeId, 'capture', revision);
        store.db
            .prepare('INSERT INTO captures(id,app_id,scope_id,screen_id,state_id,request_id,received_at,captured_at,coverage,capture_json,fragment_hash,trace_id,trace_seq,session_id,tab_id) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
            .run(captureId, app.app_id, scopeId, screenId, stateId, parsed.request_id, new Date(now).toISOString(), capture.captured_at, capture.coverage.kind, canonical(capture), fragmentHash, capture.trace_id, capture.trace_seq, capture.session_id, capture.tab_id);
        for (const target of [
            screenId,
            ...(stateId ? [stateId, ...controlIds] : []),
        ])
            store.db
                .prepare('INSERT INTO evidence_links VALUES(?,?,?,?)')
                .run(captureId, target, app.app_id, scopeId);
        const common = {
            screen_id: screenId,
            capture_id: captureId,
            control_ids: controlIds,
            redaction_summary,
        };
        const data = stateId
            ? {
                ...common,
                coverage: 'complete',
                state_id: stateId,
                state_hash: stateHash,
                fragment_hash: null,
            }
            : {
                ...common,
                coverage: 'partial',
                state_id: null,
                state_hash: null,
                fragment_hash: fragmentHash,
            };
        const result = validateResponse('wg_ingest', {
            schema_version: 1,
            store_revision: revision,
            data,
            warnings: [],
        });
        store.db
            .prepare('INSERT INTO receipts VALUES(?,?,?,?,?)')
            .run(app.app_id, parsed.request_id, 'wg_ingest', requestDigest, canonical(result));
        store.requireStorageCapacity();
        return result;
    });
}
