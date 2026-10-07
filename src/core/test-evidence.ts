import type { z } from 'zod';
import { testRun, operation } from '../contracts/operations.js';
import { Store } from '../store/database.js';
import { KnowledgeError, type AppConfiguration } from './normalize.js';
import {
  graphPayload,
  putGraph,
  record,
  relate,
  scopeId,
  supports,
  type Reference,
} from './graph.js';
import { captureRow, type ActionEvent, type Transition } from './traces.js';

export interface Flow {
  name: string;
  transition_ids: string[];
  scope: z.output<typeof testRun>['scope'];
}
export type TestRun = Omit<z.output<typeof testRun>, 'assertions'> & {
  assertions: {
    target_id: string;
    assertion: string;
    result: 'passed' | 'failed' | 'skipped';
    evidence_ids: string[];
  }[];
};
type Operation = z.output<typeof operation>;
export function supportsClaim(
  store: Store,
  app: string,
  evidence: string[],
  target: string,
): boolean {
  const t = record(store, app, target);
  if (t.kind === 'flow') {
    const flow = graphPayload<Flow>(store, target);
    return flow.transition_ids.every((id) =>
      supportsClaim(store, app, evidence, id),
    );
  }
  if (t.kind === 'action')
    return evidence.some(
      (id) =>
        record(store, app, id).kind === 'action_event' &&
        graphPayload<ActionEvent>(store, id).action_id === target,
    );
  if (t.kind === 'action_event') {
    const event = graphPayload<ActionEvent>(store, target);
    return (
      evidence.includes(target) ||
      (event.after_capture_id !== null &&
        [event.before_capture_id, event.after_capture_id].every((id) =>
          evidence.includes(id),
        ))
    );
  }
  if (t.kind === 'transition') {
    const transition = graphPayload<Transition>(store, target);
    // A transition assertion must cover the trace, not just one endpoint.
    return (
      evidence.includes(transition.action_event_id) ||
      [transition.before_capture_id, transition.after_capture_id].every((id) =>
        evidence.includes(id),
      )
    );
  }
  return evidence.some((id) => supports(store, app, id, target));
}
export function validateRun(
  store: Store,
  app: AppConfiguration,
  id: string,
  now: number,
) {
  const run = graphPayload<TestRun>(store, id);
  const scope = scopeId(store, app, run.scope);
  if (Date.parse(run.finished_at) > now + 300000)
    throw new KnowledgeError('INVALID_INPUT');
  for (const assertion of run.assertions) {
    const target = record(store, app.app_id, assertion.target_id);
    if (
      target.scope_id !== scope ||
      !supportsClaim(store, app.app_id, assertion.evidence_ids, target.id)
    )
      throw new KnowledgeError('INCOMPATIBLE_CAPTURE');
    for (const evidence of assertion.evidence_ids) {
      const e = record(store, app.app_id, evidence);
      if (
        e.scope_id !== scope ||
        !['capture', 'action_event'].includes(e.kind) ||
        !supports(store, app.app_id, evidence, target.id)
      )
        throw new KnowledgeError('INCOMPATIBLE_CAPTURE');
      const at =
        e.kind === 'capture'
          ? captureRow(store, app.app_id, evidence).captured_at
          : graphPayload<ActionEvent>(store, evidence).occurred_at;
      if (
        Date.parse(at) < Date.parse(run.started_at) ||
        Date.parse(at) > Date.parse(run.finished_at)
      )
        throw new KnowledgeError('INCOMPATIBLE_CAPTURE');
    }
  }
}
export function requireVerification(
  store: Store,
  app: AppConfiguration,
  runId: string,
  target: string,
) {
  record(store, app.app_id, runId, 'test_run');
  const run = graphPayload<TestRun>(store, runId),
    t = record(store, app.app_id, target);
  if (
    record(store, app.app_id, runId).scope_id !== t.scope_id ||
    run.outcome !== 'passed' ||
    !run.assertions.some(
      (a) =>
        a.target_id === target &&
        a.result === 'passed' &&
        supportsClaim(store, app.app_id, a.evidence_ids, target),
    )
  )
    throw new KnowledgeError('INCOMPATIBLE_CAPTURE');
}
export function testOperation(
  store: Store,
  app: AppConfiguration,
  op: Operation,
  resolve: (r: Reference) => string,
  deferred: (r: Reference) => string,
  revision: number,
  now: number,
  id: string,
) {
  if (op.op === 'create_flow') {
    const scope = scopeId(store, app, op.scope);
    const transitions = op.transition_ids.map(resolve);
    let previous: string | undefined;
    for (const transition of transitions) {
      const row = record(store, app.app_id, transition, 'transition'),
        value = graphPayload<Transition>(store, transition);
      if (
        row.scope_id !== scope ||
        (previous && previous !== value.source_state_id)
      )
        throw new KnowledgeError('INCOMPATIBLE_CAPTURE');
      previous = value.target_state_id;
    }
    putGraph(
      store,
      app.app_id,
      scope,
      'flow',
      { name: op.name, transition_ids: transitions, scope: op.scope },
      revision,
      now,
      id,
    );
    for (const transition of transitions)
      relate(store, app.app_id, transition, id, 'part_of');
    return id;
  }
  if (op.op === 'record_test_run') {
    const scope = scopeId(store, app, op.run.scope);
    const run: TestRun = {
      ...op.run,
      assertions: op.run.assertions.map((a) => ({
        ...a,
        target_id: deferred(a.target_id),
        evidence_ids: a.evidence_ids.map(resolve),
      })),
    };
    return putGraph(
      store,
      app.app_id,
      scope,
      'test_run',
      run,
      revision,
      now,
      id,
    );
  }
  throw new KnowledgeError('INVALID_INPUT');
}
