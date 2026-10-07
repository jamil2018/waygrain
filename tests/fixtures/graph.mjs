import { commit, ingest } from '../../dist/index.js';
import { storageFixture, fixtureNow } from './storage.mjs';
export const existing = (id) => ({ kind: 'existing', id });
export const local = (client_ref) => ({ kind: 'local', client_ref });
export function committer(f) {
  let seq = 0;
  return (ops) =>
    commit(
      f.store,
      {
        ...f.base,
        request_id: `graph_commit_${++seq}`,
        expected_store_revision: f.store.revision,
        operations: JSON.parse(JSON.stringify(ops)),
      },
      fixtureNow,
    );
}
export async function traceFixture(t) {
  const f = await storageFixture(t);
  const before = f.request();
  before.capture.trace_seq = 1;
  before.capture.captured_at = new Date(fixtureNow - 3000).toISOString();
  const a = ingest(f.store, before, fixtureNow).data;
  const after = f.request();
  after.capture.trace_seq = 3;
  after.capture.captured_at = new Date(fixtureNow - 1000).toISOString();
  after.capture.tree.children[0].enabled = false;
  const b = ingest(f.store, after, fixtureNow).data;
  const scope = before.capture.scope;
  const action = {
    op: 'create_action',
    client_ref: 'action',
    state_id: existing(a.state_id),
    control_id: existing(a.control_ids[0]),
    verb: 'click',
    input_schema: { kind: 'none', required: false },
    preconditions: [],
  };
  const event = {
    op: 'record_action_event',
    client_ref: 'event',
    event: {
      action_id: local('action'),
      before_capture_id: existing(a.capture_id),
      after_capture_id: existing(b.capture_id),
      trace_id: before.capture.trace_id,
      trace_seq: 2,
      session_id: before.capture.session_id,
      tab_id: before.capture.tab_id,
      scope,
      occurred_at: new Date(fixtureNow - 2000).toISOString(),
      outcome: 'success',
      error_code: null,
    },
  };
  const transition = {
    op: 'create_transition',
    client_ref: 'transition',
    source_state_id: existing(a.state_id),
    action_id: local('action'),
    target_state_id: existing(b.state_id),
    before_capture_id: existing(a.capture_id),
    after_capture_id: existing(b.capture_id),
    action_event_id: local('event'),
    outcome: 'success',
    guards: [],
    provenance: 'observed',
  };
  return {
    ...f,
    a,
    b,
    before,
    after,
    scope,
    action,
    event,
    transition,
    write: committer(f),
  };
}
