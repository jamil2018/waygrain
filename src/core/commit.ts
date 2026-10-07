import { randomUUID } from 'node:crypto';
import type { z } from 'zod';
import { contracts } from '../contracts/index.js';
import { validateRequest, validateResponse } from '../contracts/validation.js';
import { Store } from '../store/database.js';
import { canonical, digest, KnowledgeError } from './normalize.js';
import {
  supportsClaim,
  testOperation,
  validateRun,
  requireVerification,
} from './test-evidence.js';
import type { Transition } from './traces.js';
import { traceOperation } from './traces.js';
import { selectedApp } from './ingest.js';
import {
  graphPayload,
  putGraph,
  record,
  relate,
  safeProse,
  scopeId,
  supports,
  type Annotation,
  type Reference,
} from './graph.js';

type Request = z.output<typeof contracts.wg_commit.input>;
export function commit(store: Store, input: unknown, now = Date.now()) {
  const request = validateRequest('wg_commit', input, now) as Request;
  const app = selectedApp(store, request);
  // Sanitize before digesting or writing. Unknown prose never reaches a receipt.
  for (const op of request.operations) {
    if (op.op === 'add_annotation' || op.op === 'supersede_annotation') {
      op.annotation.value = safeProse(app, op.annotation.value);
      if (op.annotation.provenance === 'inferred')
        op.annotation.rationale = safeProse(app, op.annotation.rationale);
    } else if (op.op === 'alias_identity')
      op.rationale = safeProse(app, op.rationale);
    else if (op.op === 'create_action')
      op.preconditions = op.preconditions.map((p) => safeProse(app, p));
    else if (op.op === 'create_transition')
      op.guards = op.guards.map((p) => safeProse(app, p));
    else if (op.op === 'create_flow') op.name = safeProse(app, op.name);
    else if (op.op === 'record_test_run') {
      op.run.application_version = safeProse(app, op.run.application_version);
      op.run.assertions.forEach((a) => {
        a.assertion = safeProse(app, a.assertion);
      });
    } else if (op.op !== 'record_action_event')
      throw new KnowledgeError('INVALID_INPUT');
  }
  const requestDigest = digest(request);
  return store.transaction(() => {
    const replay = store.db
      .prepare('SELECT * FROM receipts WHERE app_id=? AND request_id=?')
      .get(app.app_id, request.request_id) as
      { tool: string; digest: string; receipt_json: string } | undefined;
    if (replay) {
      if (replay.tool !== 'wg_commit' || replay.digest !== requestDigest)
        throw new KnowledgeError('IDEMPOTENCY_CONFLICT');
      return validateResponse('wg_commit', JSON.parse(replay.receipt_json));
    }
    store.requireRevision(request.expected_store_revision);
    const revision = store.advanceRevision();
    const plannedIds = new Map(
      request.operations.map((op) => [op, randomUUID()]),
    );
    const plannedRefs = new Map(
      request.operations
        .filter((op) => op.client_ref)
        .map((op) => [op.client_ref!, plannedIds.get(op)!]),
    );
    const refs = new Map<string, string>();
    const deferred = (ref: Reference) => {
      if (ref.kind === 'existing') {
        record(store, app.app_id, ref.id);
        return ref.id;
      }
      const id = plannedRefs.get(ref.client_ref);
      if (!id) throw new KnowledgeError('NOT_FOUND');
      return id;
    };
    const created: string[] = [];
    const resolve = (ref: Reference) => {
      const id = ref.kind === 'existing' ? ref.id : refs.get(ref.client_ref);
      if (!id) throw new KnowledgeError('NOT_FOUND');
      record(store, app.app_id, id);
      return id;
    };
    for (const op of request.operations) {
      let id: string;
      if (op.op === 'add_annotation' || op.op === 'supersede_annotation') {
        const a = op.annotation;
        const target = resolve(a.target_id),
          t = record(store, app.app_id, target);
        const scope = scopeId(store, app, a.scope);
        if (scope !== t.scope_id)
          throw new KnowledgeError('INCOMPATIBLE_CAPTURE');
        const evidence = a.evidence_ids.map(resolve);
        if (!evidence.every((e) => supports(store, app.app_id, e, target)))
          throw new KnowledgeError('INCOMPATIBLE_CAPTURE');
        // Inferences may interpret evidence; an annotation is never itself a new observation.
        if (
          a.provenance === 'observed' &&
          evidence.some((e) => record(store, app.app_id, e).kind !== 'capture')
        )
          throw new KnowledgeError('INCOMPATIBLE_CAPTURE');
        if (
          t.kind === 'flow' &&
          !supportsClaim(store, app.app_id, evidence, target)
        )
          throw new KnowledgeError('INCOMPATIBLE_CAPTURE');
        const previous =
          op.op === 'supersede_annotation' ? resolve(op.supersedes_id) : null;
        if (previous) {
          record(store, app.app_id, previous, 'annotation');
          const old = graphPayload<Annotation>(store, previous);
          if (old.target_id !== target || old.kind !== a.kind)
            throw new KnowledgeError('INCOMPATIBLE_CAPTURE');
        }
        const payload = {
          ...a,
          target_id: target,
          evidence_ids: evidence,
          revision,
          supersedes_id: previous,
          ...(a.provenance === 'test_verified'
            ? { test_run_id: deferred(a.test_run_id) }
            : {}),
        };
        id = putGraph(
          store,
          app.app_id,
          scope,
          'annotation',
          payload,
          revision,
          now,
          plannedIds.get(op)!,
        );
        relate(store, app.app_id, id, target, 'describes');
      } else if (op.op === 'alias_identity') {
        const from = record(store, app.app_id, op.from_id, op.record_kind),
          to = record(store, app.app_id, op.to_id, op.record_kind);
        if (from.scope_id !== to.scope_id || from.id === to.id)
          throw new KnowledgeError('INCOMPATIBLE_CAPTURE');
        if (
          !op.evidence_ids.every(
            (e) =>
              supports(store, app.app_id, e, from.id) ||
              supports(store, app.app_id, e, to.id),
          ) ||
          ![from.id, to.id].every((t) =>
            op.evidence_ids.some((e) => supports(store, app.app_id, e, t)),
          )
        )
          throw new KnowledgeError('INCOMPATIBLE_CAPTURE');
        const seen = new Set([from.id]);
        let next: string | undefined = to.id;
        while (next) {
          if (seen.has(next)) throw new KnowledgeError('CONFLICT');
          seen.add(next);
          next = (
            store.db
              .prepare('SELECT to_id FROM identity_aliases WHERE from_id=?')
              .get(next) as { to_id: string } | undefined
          )?.to_id;
        }
        id = plannedIds.get(op)!;
        store.db
          .prepare('INSERT INTO identity_aliases VALUES(?,?,?,?,?,?,?,?,?)')
          .run(
            id,
            from.id,
            to.id,
            app.app_id,
            from.scope_id,
            from.kind,
            op.rationale,
            canonical(op.evidence_ids),
            revision,
          );
      } else if (op.op === 'create_flow' || op.op === 'record_test_run')
        id = testOperation(
          store,
          app,
          op,
          resolve,
          deferred,
          revision,
          now,
          plannedIds.get(op)!,
        );
      else
        id = traceOperation(
          store,
          app,
          op,
          resolve,
          revision,
          now,
          plannedIds.get(op)!,
          deferred,
        );
      created.push(id);
      if (op.client_ref) refs.set(op.client_ref, id);
    }
    for (const id of created) {
      const row = store.db
        .prepare('SELECT kind,payload_json FROM graph_records WHERE id=?')
        .get(id) as { kind: string; payload_json: string } | undefined;
      if (row?.kind === 'test_run') validateRun(store, app, id, now);
      if (row?.kind === 'transition') {
        const transition = JSON.parse(row.payload_json) as Transition;
        if (transition.provenance === 'test_verified')
          requireVerification(store, app, transition.test_run_id!, id);
      }
      if (row?.kind === 'annotation') {
        const annotation = JSON.parse(row.payload_json) as Annotation;
        if (annotation.provenance === 'test_verified')
          requireVerification(
            store,
            app,
            annotation.test_run_id!,
            annotation.target_id,
          );
      }
    }
    const result = validateResponse('wg_commit', {
      schema_version: 1,
      store_revision: revision,
      warnings: [],
      data: {
        created_ids: created,
        client_refs: [...refs].map(([client_ref, id]) => ({ client_ref, id })),
        new_revision: revision,
      },
    });
    store.db
      .prepare('INSERT INTO receipts VALUES(?,?,?,?,?)')
      .run(
        app.app_id,
        request.request_id,
        'wg_commit',
        requestDigest,
        canonical(result),
      );
    return result;
  });
}
