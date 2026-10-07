import type { Responses } from '../contracts/index.js';
import type { TreeNode } from '../contracts/capture.js';
import { Store } from '../store/database.js';
import { graphPayload, record, type Annotation, type Scope } from './graph.js';
import { type Action, type ActionEvent, type Transition } from './traces.js';
import { type Flow, type TestRun } from './test-evidence.js';
import { type Capture } from './normalize.js';

export const visibleSql = (alias: string) =>
  `NOT EXISTS (SELECT 1 FROM tombstones ts WHERE ts.record_id=${alias}.id AND ts.undone_revision IS NULL)`;
export function visible(store: Store, id: string): boolean {
  return !!store.db
    .prepare(`SELECT 1 FROM records r WHERE id=? AND ${visibleSql('r')}`)
    .get(id);
}
export function activeAnnotations(
  store: Store,
  target: string,
): { id: string; annotation: Annotation }[] {
  return (
    store.db
      .prepare(
        `SELECT g.id,g.payload_json FROM graph_records g WHERE g.kind='annotation' AND json_extract(g.payload_json,'$.target_id')=? AND ${visibleSql('g')} AND NOT EXISTS (SELECT 1 FROM graph_records newer WHERE newer.kind='annotation' AND json_extract(newer.payload_json,'$.supersedes_id')=g.id AND ${visibleSql('newer')}) ORDER BY g.id LIMIT 51`,
      )
      .all(target) as { id: string; payload_json: string }[]
  ).map((row) => ({
    id: row.id,
    annotation: JSON.parse(row.payload_json) as Annotation,
  }));
}
function captureIds(store: Store, id: string): string[] {
  const r = store.db.prepare('SELECT kind FROM records WHERE id=?').get(id) as {
    kind: string;
  };
  if (r.kind === 'capture') return [id];
  if (['screen', 'state', 'control'].includes(r.kind))
    return (
      store.db
        .prepare(
          `SELECT c.id FROM captures c JOIN evidence_links e ON c.id=e.capture_id WHERE e.target_id=? AND ${visibleSql('c')} ORDER BY julianday(c.captured_at) DESC,c.id LIMIT 51`,
        )
        .all(id) as { id: string }[]
    ).map((r) => r.id);
  if (r.kind === 'action')
    return captureIds(store, graphPayload<Action>(store, id).state_id);
  if (r.kind === 'transition') {
    const tr = graphPayload<Transition>(store, id);
    return [tr.before_capture_id, tr.after_capture_id];
  }
  if (r.kind === 'action_event') {
    const e = graphPayload<ActionEvent>(store, id);
    return [
      e.before_capture_id,
      ...(e.after_capture_id ? [e.after_capture_id] : []),
    ];
  }
  if (r.kind === 'flow')
    return [
      ...new Set(
        graphPayload<Flow>(store, id).transition_ids.flatMap((id) =>
          captureIds(store, id),
        ),
      ),
    ];
  if (r.kind === 'annotation')
    return graphPayload<Annotation>(store, id).evidence_ids.filter(
      (id) =>
        (
          store.db.prepare('SELECT kind FROM records WHERE id=?').get(id) as {
            kind: string;
          }
        ).kind === 'capture',
    );
  return [
    ...new Set(
      graphPayload<TestRun>(store, id)
        .assertions.flatMap((a) => a.evidence_ids)
        .filter(
          (id) =>
            (
              store.db
                .prepare('SELECT kind FROM records WHERE id=?')
                .get(id) as { kind: string }
            ).kind === 'capture',
        ),
    ),
  ];
}
export function summary(
  store: Store,
  app: string,
  id: string,
  now: number,
  maxAge: number,
): Extract<
  Responses['wg_query']['data'],
  { status: 'complete' }
>['records'][number] {
  const r = record(store, app, id);
  const scope = JSON.parse(
    (
      store.db
        .prepare('SELECT scope_json FROM scopes WHERE id=?')
        .get(r.scope_id) as { scope_json: string }
    ).scope_json,
  ) as Scope;
  const graph = store.db
    .prepare('SELECT recorded_at FROM graph_records WHERE id=?')
    .get(id) as { recorded_at: string } | undefined;
  let name = '',
    fields: Record<string, unknown> = {},
    provenance: 'observed' | 'inferred' | 'test_verified' = 'observed';
  const ids = captureIds(store, id).filter((id) => visible(store, id));
  const captures = ids.map(
    (id) =>
      JSON.parse(
        (
          store.db
            .prepare('SELECT capture_json FROM captures WHERE id=?')
            .get(id) as { capture_json: string }
        ).capture_json,
      ) as Capture,
  );
  const dates = captures
    .map((c) => c.captured_at)
    .sort((a, b) => Date.parse(a) - Date.parse(b));
  // Check time comes from all qualifying observations, independent of summary caps.
  const completeDates = ['screen', 'state', 'control'].includes(r.kind)
    ? ((
        store.db
          .prepare(
            `SELECT c.captured_at AS at FROM captures c JOIN evidence_links e ON c.id=e.capture_id WHERE e.target_id=? AND c.coverage='complete' AND ${visibleSql('c')} ORDER BY julianday(c.captured_at) DESC,c.id LIMIT 1`,
          )
          .get(id) as { at: string } | undefined
      )?.at ?? null)
    : null;
  const checkedDates = completeDates
    ? [completeDates]
    : captures
        .filter((c) => c.coverage.kind === 'complete')
        .map((c) => c.captured_at)
        .sort((a, b) => Date.parse(a) - Date.parse(b));

  let at = dates.at(-1) ?? graph?.recorded_at ?? new Date(0).toISOString();
  let coverage: Capture['coverage'] =
    captures.length && captures.every((c) => c.coverage.kind === 'complete')
      ? { kind: 'complete', subtree: 'root' }
      : { kind: 'partial', subtree: 'root', reason: 'unsupported' };
  const screenName = (id: string) =>
    (
      store.db.prepare('SELECT name FROM screens WHERE id=?').get(id) as {
        name: string;
      }
    ).name;
  switch (r.kind) {
    case 'screen': {
      const s = store.db
        .prepare('SELECT * FROM screens WHERE id=?')
        .get(id) as { name: string; route_template: string };
      name = s.name;
      fields = {
        route_template: s.route_template,
        creation_revision: r.created_revision,
      };
      break;
    }
    case 'state': {
      const s = store.db.prepare('SELECT * FROM states WHERE id=?').get(id) as {
        screen_id: string;
        state_hash: string;
        normalization_version: number;
        projection_json: string;
      };
      name = screenName(s.screen_id);
      fields = {
        screen_id: s.screen_id,
        state_hash: s.state_hash,
        normalization_version: String(s.normalization_version),
        view: (JSON.parse(s.projection_json) as { view: Capture['view'] }).view,
      };
      break;
    }
    case 'control': {
      const c = store.db
        .prepare('SELECT * FROM controls WHERE id=?')
        .get(id) as {
        state_id: string;
        descriptor_path: string;
        descriptor_json: string;
      };
      const d = JSON.parse(c.descriptor_json) as TreeNode;
      name = d.name;
      fields = {
        state_id: c.state_id,
        role: d.role,
        enabled: d.enabled,
        visible: d.visible,
        descriptor: c.descriptor_path,
      };
      break;
    }
    case 'capture': {
      const c = store.db
        .prepare('SELECT * FROM captures WHERE id=?')
        .get(id) as {
        screen_id: string;
        state_id: string | null;
        request_id: string;
        received_at: string;
        capture_json: string;
      };
      const capture = JSON.parse(c.capture_json) as Capture;
      name = screenName(c.screen_id);
      fields = {
        screen_id: c.screen_id,
        state_id: c.state_id,
        request_id: c.request_id,
        received_at: c.received_at,
        trace_id: capture.trace_id,
        trace_seq: capture.trace_seq,
        session_id: capture.session_id,
        tab_id: capture.tab_id,
        captured_at: capture.captured_at,
        source: capture.source,
        redaction_profile: capture.redaction_profile,
      };
      break;
    }
    case 'annotation': {
      const a = graphPayload<Annotation>(store, id);
      name = a.value;
      provenance = a.provenance;
      fields = {
        target_id: a.target_id,
        annotation_kind: a.kind,
        value: a.value,
        author_type: a.author_type,
        revision: a.revision,
        supersedes_id: a.supersedes_id,
      };
      break;
    }
    case 'action': {
      const a = graphPayload<Action>(store, id);
      name = a.verb;
      fields = { ...a };
      break;
    }
    case 'action_event': {
      const e = graphPayload<ActionEvent>(store, id);
      name = e.outcome;
      fields = { ...e };
      break;
    }
    case 'transition': {
      const tr = graphPayload<Transition>(store, id);
      name = tr.outcome;
      provenance = tr.provenance;
      fields = { ...tr };
      delete fields.provenance;
      delete fields.test_run_id;
      break;
    }
    case 'flow': {
      const f = graphPayload<Flow>(store, id);
      name = f.name;
      fields = { transition_ids: f.transition_ids };
      at = dates[0] ?? at;
      break;
    }
    case 'test_run': {
      const run = graphPayload<TestRun>(store, id);
      name = run.runner;
      fields = { ...run };
      break;
    }
  }
  if (['screen', 'state', 'control'].includes(r.kind) && checkedDates.length)
    at = checkedDates.at(-1)!;
  const active = activeAnnotations(store, id);

  const contradicted = ['name', 'description', 'interpretation'].some(
    (kind) =>
      new Set(
        active
          .filter((a) => a.annotation.kind === kind)
          .map((a) => a.annotation.value),
      ).size > 1,
  );
  const passed = store.db
    .prepare(
      `SELECT g.payload_json FROM graph_records g JOIN json_each(g.payload_json,'$.assertions') a WHERE g.app_id=? AND g.scope_id=? AND g.kind='test_run' AND json_extract(g.payload_json,'$.outcome')='passed' AND json_extract(a.value,'$.target_id')=? AND json_extract(a.value,'$.result')='passed' AND ${visibleSql('g')} ORDER BY g.recorded_at DESC,g.id LIMIT 1`,
    )
    .get(app, r.scope_id, id) as { payload_json: string } | undefined;
  const version = passed
    ? (JSON.parse(passed.payload_json) as TestRun).application_version
    : null;
  if (passed) provenance = 'test_verified';
  if (ids.length > 50)
    coverage = { kind: 'partial', subtree: 'root', reason: 'truncated' };
  const unknown =
    !captures.length ||
    (r.kind === 'screen' && !checkedDates.length) ||
    (r.kind === 'annotation' && provenance === 'inferred');
  const age = Math.max(0, (now - Date.parse(at)) / 1000);
  return {
    id,
    kind: r.kind,
    name,
    scope,
    ...fields,
    evidence: {
      evidence_ids: ids.slice(0, 50),
      provenance,
      coverage,
      freshness: {
        observed_at: dates.at(-1) ?? at,
        last_checked_at:
          unknown ||
          [
            'capture',
            'annotation',
            'action',
            'test_run',
            'action_event',
          ].includes(r.kind)
            ? null
            : r.kind === 'screen'
              ? (checkedDates.at(-1) ?? null)
              : at,
        application_version: version,
        age_seconds: age,
        scope_match: true,
        status: contradicted
          ? 'contradicted'
          : unknown
            ? 'unknown'
            : age <= maxAge
              ? 'recent'
              : 'stale',
      },
    },
  } as Extract<
    Responses['wg_query']['data'],
    { status: 'complete' }
  >['records'][number];
}
