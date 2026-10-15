import { statSync } from 'node:fs';
import { contracts } from '../contracts/index.js';
import { Store } from '../store/database.js';
import { validateRequest, validateResponse } from '../contracts/validation.js';
import { LIMITS } from '../contracts/index.js';
import { digest, KnowledgeError } from './normalize.js';
import { visible } from './summary.js';
import { query } from './query.js';
import { planRefresh } from './refresh.js';
import { changes } from './changes.js';
import { commit } from './commit.js';
import { graphPayload } from './graph.js';
import { selectedApp, ingest } from './ingest.js';
import { STORE_SCHEMA_VERSION } from '../store/schema.js';
export const IMPLEMENTED_TOOLS = [
    'wg_status',
    'wg_ingest',
    'wg_evidence',
    'wg_commit',
    'wg_query',
    'wg_changes',
    'wg_plan_refresh',
];
const recordKinds = [
    'screen',
    'state',
    'control',
    'action',
    'transition',
    'flow',
    'capture',
    'action_event',
    'test_run',
    'annotation',
];
export function status(store, input) {
    const request = validateRequest('wg_status', input);
    selectedApp(store, request);
    const bytes = (path) => {
        try {
            return statSync(path).size;
        }
        catch (error) {
            if (error &&
                typeof error === 'object' &&
                'code' in error &&
                error.code === 'ENOENT')
                return 0;
            throw new KnowledgeError('STORE_CORRUPT');
        }
    };
    return store.transaction(() => {
        const rows = store.db
            .prepare('SELECT kind,COUNT(*) AS count FROM records WHERE app_id=? GROUP BY kind')
            .all(request.app_id);
        return validateResponse('wg_status', {
            schema_version: 1,
            store_revision: store.revision,
            warnings: [],
            data: {
                store_schema_version: STORE_SCHEMA_VERSION,
                supported_schema_versions: [1],
                capabilities: [
                    'ingest',
                    'evidence',
                    'query',
                    'changes',
                    'refresh_plan',
                ],
                counts: recordKinds.map((kind) => ({
                    kind,
                    count: rows.find((r) => r.kind === kind)?.count ?? 0,
                })),
                byte_usage: {
                    database: bytes(store.location.databasePath),
                    wal: bytes(store.location.databasePath + '-wal'),
                    cap: store.location.configuration.storage_limit_bytes,
                },
                ingest_formats: [{ format: 'structured_accessibility', version: '1' }],
            },
        });
    }, false);
}
export function evidence(store, input, now = Date.now()) {
    const request = validateRequest('wg_evidence', input);
    selectedApp(store, request);
    const budget = request.budget ?? {
        records: LIMITS.default_records,
        bytes: LIMITS.default_output_bytes,
    };
    const ids = [...new Set(request.ids)];
    return store.transaction(() => {
        const revision = store.revision;
        const filter = {
            project_id: request.project_id,
            app_id: request.app_id,
            ids,
            projection: request.projection,
        };
        const token = (offset) => `${offset}_${store.cursorEpoch || 'initial'}_${digest({ filter, revision, offset, epoch: store.cursorEpoch })}`;
        let offset = 0;
        if (request.cursor) {
            if (request.cursor.store_revision !== revision ||
                request.cursor.token.split('_')[1] !== (store.cursorEpoch || 'initial'))
                throw new KnowledgeError('CURSOR_STALE');
            offset = Number(request.cursor.token.split('_')[0]);
            if (!Number.isSafeInteger(offset) ||
                offset < 0 ||
                offset >= ids.length ||
                request.cursor.token !== token(offset))
                throw new KnowledgeError('INVALID_INPUT');
        }
        const missing = ids.filter((id) => !visible(store, id) ||
            !store.db
                .prepare("SELECT id FROM records WHERE id=? AND app_id=? AND kind IN ('capture','annotation')")
                .get(id, request.app_id));
        const envelope = (data, next) => ({
            schema_version: 1,
            store_revision: revision,
            data,
            warnings: [],
            ...(next === undefined
                ? {}
                : { next_cursor: { token: token(next), store_revision: revision } }),
        });
        const fits = (result) => Buffer.byteLength(JSON.stringify(result)) <= budget.bytes;
        if (missing.length) {
            const result = envelope({
                status: 'unavailable',
                items: [],
                missing_ids: missing,
            });
            if (!fits(result))
                throw new KnowledgeError('BUDGET_EXCEEDED');
            return validateResponse('wg_evidence', result);
        }
        const items = [];
        let index = offset;
        while (index < ids.length && items.length < budget.records) {
            const row = store.db
                .prepare('SELECT id,screen_id,state_id,request_id,received_at,capture_json FROM captures WHERE id=? AND app_id=?')
                .get(ids[index], request.app_id);
            if (!row) {
                const a = graphPayload(store, ids[index]);
                const stored = store.db
                    .prepare('SELECT recorded_at FROM graph_records WHERE id=?')
                    .get(ids[index]);
                const item = request.projection === 'structured'
                    ? {
                        projection: 'structured_annotation',
                        id: ids[index],
                        ...a,
                        kind: 'annotation',
                        annotation_kind: a.kind,
                    }
                    : {
                        projection: 'summary',
                        id: ids[index],
                        kind: 'annotation',
                        scope: a.scope,
                        source_summary: {
                            evidence_ids: a.evidence_ids,
                            provenance: a.provenance,
                            coverage: {
                                kind: 'partial',
                                subtree: 'root',
                                reason: 'unsupported',
                            },
                            freshness: {
                                observed_at: stored.recorded_at,
                                last_checked_at: null,
                                application_version: null,
                                age_seconds: Math.max(0, (now - Date.parse(stored.recorded_at)) / 1000),
                                scope_match: true,
                                status: 'unknown',
                            },
                        },
                    };
                const next = index + 1;
                const candidate = next === ids.length
                    ? envelope({ status: 'available', items: [...items, item] })
                    : envelope({
                        status: 'incomplete',
                        items: [...items, item],
                        missing_ids: [],
                        reason: 'BUDGET_EXCEEDED',
                    }, next);
                if (!fits(candidate))
                    break;
                items.push(item);
                index = next;
                continue;
            }
            const capture = JSON.parse(row.capture_json);
            const item = request.projection === 'structured'
                ? {
                    projection: 'structured_capture',
                    id: row.id,
                    kind: 'capture',
                    screen_id: row.screen_id,
                    state_id: row.state_id,
                    request_id: row.request_id,
                    received_at: row.received_at,
                    capture,
                }
                : {
                    projection: 'summary',
                    id: row.id,
                    kind: 'capture',
                    scope: capture.scope,
                    source_summary: {
                        evidence_ids: [row.id],
                        provenance: 'observed',
                        coverage: capture.coverage,
                        freshness: {
                            observed_at: capture.captured_at,
                            last_checked_at: null,
                            application_version: null,
                            age_seconds: Math.max(0, (now - Date.parse(capture.captured_at)) / 1000),
                            scope_match: true,
                            status: now - Date.parse(capture.captured_at) <=
                                LIMITS.default_max_age_seconds * 1000
                                ? 'recent'
                                : 'stale',
                        },
                    },
                };
            const next = index + 1;
            const candidate = next === ids.length
                ? envelope({ status: 'available', items: [...items, item] })
                : envelope({
                    status: 'incomplete',
                    items: [...items, item],
                    missing_ids: [],
                    reason: 'BUDGET_EXCEEDED',
                }, next);
            if (!fits(candidate))
                break;
            items.push(item);
            index = next;
        }
        const result = index === ids.length
            ? envelope({ status: 'available', items })
            : envelope({
                status: 'incomplete',
                items,
                missing_ids: [],
                reason: 'BUDGET_EXCEEDED',
            }, index > offset ? index : undefined);
        if (!fits(result))
            throw new KnowledgeError('BUDGET_EXCEEDED');
        return validateResponse('wg_evidence', result);
    }, false);
}
export function dispatch(store, tool, input, now = Date.now()) {
    switch (tool) {
        case 'wg_plan_refresh':
            return planRefresh(store, input, now);
        case 'wg_changes':
            return changes(store, input);
        case 'wg_status':
            return status(store, input);
        case 'wg_ingest':
            return ingest(store, input, now);
        case 'wg_query':
            return query(store, input, now);
        case 'wg_commit':
            return commit(store, input, now);
        case 'wg_evidence':
            return evidence(store, input, now);
        default:
            throw new KnowledgeError('INVALID_INPUT');
    }
}
