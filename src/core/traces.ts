import type { z } from 'zod';
import { actionEvent, operation } from '../contracts/operations.js';
import { Store } from '../store/database.js';
import { canonical, KnowledgeError } from './normalize.js';
import {
  graphPayload,
  putGraph,
  record,
  relate,
  scopeId,
  type Scope,
  type Reference,
} from './graph.js';
import type { AppConfiguration } from './normalize.js';

type Operation = z.output<typeof operation>;
export type Action = Omit<
  Extract<Operation, { op: 'create_action' }>,
  'op' | 'client_ref' | 'state_id' | 'control_id'
> & { state_id: string; control_id: string | null };
export type ActionEvent = Omit<
  z.output<typeof actionEvent>,
  'action_id' | 'before_capture_id' | 'after_capture_id'
> & {
  action_id: string;
  before_capture_id: string;
  after_capture_id: string | null;
};
export type Transition = Omit<
  Extract<Operation, { op: 'create_transition' }>,
  | 'op'
  | 'client_ref'
  | 'source_state_id'
  | 'action_id'
  | 'target_state_id'
  | 'before_capture_id'
  | 'after_capture_id'
  | 'action_event_id'
  | 'test_run_id'
> & {
  source_state_id: string;
  action_id: string;
  target_state_id: string;
  before_capture_id: string;
  after_capture_id: string;
  action_event_id: string;
  test_run_id?: string;
};
interface CaptureRow {
  id: string;
  app_id: string;
  scope_id: string;
  state_id: string | null;
  coverage: string;
  trace_id: string;
  trace_seq: number;
  session_id: string;
  tab_id: string;
  captured_at: string;
}
export function captureRow(store: Store, app: string, id: string): CaptureRow {
  record(store, app, id, 'capture');
  return store.db
    .prepare('SELECT * FROM captures WHERE id=?')
    .get(id) as CaptureRow;
}
export function requireTraceSlot(
  store: Store,
  app: string,
  scope: string,
  trace: {
    trace_id: string;
    trace_seq: number;
    session_id: string;
    tab_id: string;
  },
) {
  const params = [
    app,
    scope,
    trace.session_id,
    trace.tab_id,
    trace.trace_id,
    trace.trace_seq,
  ];
  if (
    store.db
      .prepare(
        'SELECT 1 FROM captures WHERE app_id=? AND scope_id=? AND session_id=? AND tab_id=? AND trace_id=? AND trace_seq=?',
      )
      .get(...params) ||
    store.db
      .prepare(
        "SELECT 1 FROM graph_records WHERE kind='action_event' AND app_id=? AND scope_id=? AND json_extract(payload_json,'$.session_id')=? AND json_extract(payload_json,'$.tab_id')=? AND json_extract(payload_json,'$.trace_id')=? AND json_extract(payload_json,'$.trace_seq')=?",
      )
      .get(...params)
  )
    throw new KnowledgeError('CONFLICT');
}
function checkEvent(
  store: Store,
  app: string,
  event: ActionEvent,
  scope: string,
  now: number,
) {
  const action = graphPayload<Action>(store, event.action_id);
  record(store, app, event.action_id, 'action');
  const before = captureRow(store, app, event.before_capture_id);
  const after = event.after_capture_id
    ? captureRow(store, app, event.after_capture_id)
    : null;
  if (
    before.state_id !== action.state_id ||
    before.coverage !== 'complete' ||
    before.scope_id !== scope ||
    (after && (after.coverage !== 'complete' || after.scope_id !== scope))
  )
    throw new KnowledgeError('INCOMPATIBLE_CAPTURE');
  for (const capture of [before, ...(after ? [after] : [])]) {
    if (
      capture.trace_id !== event.trace_id ||
      capture.session_id !== event.session_id ||
      capture.tab_id !== event.tab_id
    )
      throw new KnowledgeError('INCOMPATIBLE_CAPTURE');
  }
  const at = Date.parse(event.occurred_at);
  if (
    !(before.trace_seq < event.trace_seq) ||
    (after && !(event.trace_seq < after.trace_seq)) ||
    Date.parse(before.captured_at) > at ||
    (after && at > Date.parse(after.captured_at)) ||
    at > now + 300000 ||
    (event.outcome === 'success' && !after) ||
    (event.outcome === 'success' && event.error_code)
  )
    throw new KnowledgeError('INCOMPATIBLE_CAPTURE');
}
export function traceOperation(
  store: Store,
  app: AppConfiguration,
  op: Operation,
  resolve: (ref: Reference) => string,
  revision: number,
  now: number,
  id: string,
  deferred: (ref: Reference) => string,
): string {
  if (op.op === 'create_action') {
    const state = record(store, app.app_id, resolve(op.state_id), 'state');
    const control = op.control_id
      ? record(store, app.app_id, resolve(op.control_id), 'control')
      : null;
    if (control) {
      const row = store.db
        .prepare('SELECT state_id FROM controls WHERE id=?')
        .get(control.id) as { state_id: string };
      if (row.state_id !== state.id)
        throw new KnowledgeError('INCOMPATIBLE_CAPTURE');
    }
    if (!control && !['navigate', 'scroll', 'key'].includes(op.verb))
      throw new KnowledgeError('INVALID_INPUT');
    const expected = {
      click: 'none',
      fill: 'text',
      select: 'option',
      check: 'boolean',
      uncheck: 'boolean',
      scroll: 'scroll',
      key: 'navigation_key',
      navigate: 'none',
    } as const;
    if (op.input_schema.kind !== expected[op.verb])
      throw new KnowledgeError('INVALID_INPUT');
    const createdId = putGraph(
      store,
      app.app_id,
      state.scope_id,
      'action',
      {
        state_id: state.id,
        control_id: control?.id ?? null,
        verb: op.verb,
        input_schema: op.input_schema,
        preconditions: op.preconditions,
      },
      revision,
      now,
      id,
    );
    relate(store, app.app_id, state.id, createdId, 'offers');
    return createdId;
  }
  if (op.op === 'record_action_event') {
    const event: ActionEvent = {
      ...op.event,
      action_id: resolve(op.event.action_id),
      before_capture_id: resolve(op.event.before_capture_id),
      after_capture_id: op.event.after_capture_id
        ? resolve(op.event.after_capture_id)
        : null,
    };
    const scope = scopeId(store, app, event.scope);
    checkEvent(store, app.app_id, event, scope, now);
    requireTraceSlot(store, app.app_id, scope, event);
    return putGraph(
      store,
      app.app_id,
      scope,
      'action_event',
      event,
      revision,
      now,
      id,
    );
  }
  if (op.op === 'create_transition') {
    const before = captureRow(store, app.app_id, resolve(op.before_capture_id));
    const after = captureRow(store, app.app_id, resolve(op.after_capture_id));
    const action = record(store, app.app_id, resolve(op.action_id), 'action');
    const eventRecord = record(
      store,
      app.app_id,
      resolve(op.action_event_id),
      'action_event',
    );
    const event = graphPayload<ActionEvent>(store, eventRecord.id);
    const source = record(
        store,
        app.app_id,
        resolve(op.source_state_id),
        'state',
      ),
      target = record(store, app.app_id, resolve(op.target_state_id), 'state');
    checkEvent(store, app.app_id, event, source.scope_id, now);
    if (
      source.id !== before.state_id ||
      target.id !== after.state_id ||
      target.scope_id !== source.scope_id ||
      event.before_capture_id !== before.id ||
      event.after_capture_id !== after.id ||
      event.action_id !== action.id ||
      event.outcome !== op.outcome ||
      (op.provenance === 'observed' && op.test_run_id)
    )
      throw new KnowledgeError('INCOMPATIBLE_CAPTURE');
    const payload: Transition = {
      source_state_id: source.id,
      target_state_id: target.id,
      action_id: action.id,
      before_capture_id: before.id,
      after_capture_id: after.id,
      action_event_id: eventRecord.id,
      outcome: op.outcome,
      guards: op.guards,
      provenance: op.provenance,
      ...(op.test_run_id ? { test_run_id: deferred(op.test_run_id) } : {}),
    };
    const createdId = putGraph(
      store,
      app.app_id,
      source.scope_id,
      'transition',
      payload,
      revision,
      now,
      id,
    );
    relate(store, app.app_id, source.id, target.id, 'transitions_to');
    return createdId;
  }
  throw new KnowledgeError('INVALID_INPUT');
}
export function scopeForRecord(store: Store, id: string): Scope {
  const row = store.db
    .prepare(
      'SELECT scope_json FROM scopes WHERE id=(SELECT scope_id FROM records WHERE id=?)',
    )
    .get(id) as { scope_json: string };
  return JSON.parse(row.scope_json) as Scope;
}
export function sameScope(a: Scope, b: Scope) {
  return canonical(a) === canonical(b);
}
