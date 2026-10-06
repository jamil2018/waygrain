// Synthetic contract fixtures only. No browser content or retained form input values.
export const uuid = (n) =>
  `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
export const at = '2026-10-07T00:00:00Z';
export const now = Date.parse(at);
export const scope = {
  environment: 'local',
  origin: 'https://fixture.test',
  role: 'viewer',
  account_scope: 'synthetic',
  locale: 'en',
};
export const base = { schema_version: 1, project_id: uuid(1), app_id: uuid(2) };
export const browserBase = { ...base, browser_schema_version: 1 };
export const tree = {
  role: 'document',
  name: 'Fixture',
  enabled: true,
  visible: true,
  children: [],
};
export const capture = {
  captured_at: at,
  trace_id: 'synthetic_trace',
  trace_seq: 1,
  session_id: 'synthetic_session',
  tab_id: 'synthetic_tab',
  source: {
    producer: 'synthetic',
    producer_version: '1',
    format: 'structured_accessibility',
    format_version: '1',
  },
  scope,
  view: {
    route_template: '/fixture',
    selected_tabs: [],
    modal_stack: [],
    feature_variants: [],
  },
  tree,
  coverage: { kind: 'complete', subtree: 'root' },
  redaction_profile: { alias: 'synthetic', version: 1 },
};
export const ref = { kind: 'existing', id: uuid(3) };
export const operations = [
  {
    op: 'create_action',
    client_ref: 'synthetic_action',
    state_id: ref,
    control_id: ref,
    verb: 'click',
    input_schema: { kind: 'none', required: false },
    preconditions: [],
  },
  {
    op: 'record_action_event',
    event: {
      action_id: { kind: 'local', client_ref: 'synthetic_action' },
      before_capture_id: ref,
      after_capture_id: ref,
      trace_id: 'synthetic_trace',
      trace_seq: 2,
      session_id: 'synthetic_session',
      tab_id: 'synthetic_tab',
      scope,
      occurred_at: at,
      outcome: 'success',
      error_code: null,
    },
  },
  {
    op: 'record_test_run',
    run: {
      runner: 'synthetic',
      runner_version: '1',
      application_version: 'fixture_v1',
      scope,
      started_at: at,
      finished_at: at,
      outcome: 'passed',
      assertions: [
        {
          target_id: ref,
          assertion: 'Fixture visible',
          result: 'passed',
          evidence_ids: [ref],
        },
      ],
    },
  },
  {
    op: 'create_transition',
    source_state_id: ref,
    action_id: ref,
    target_state_id: ref,
    before_capture_id: ref,
    after_capture_id: ref,
    action_event_id: ref,
    outcome: 'success',
    guards: [],
    provenance: 'observed',
  },
  { op: 'create_flow', name: 'Fixture flow', transition_ids: [ref], scope },
  {
    op: 'add_annotation',
    annotation: {
      target_id: ref,
      kind: 'tag',
      value: 'fixture',
      author_type: 'agent',
      evidence_ids: [ref],
      scope,
      provenance: 'inferred',
      rationale: 'Synthetic fixture',
    },
  },
  {
    op: 'supersede_annotation',
    supersedes_id: ref,
    annotation: {
      target_id: ref,
      kind: 'description',
      value: 'Fixture visible',
      author_type: 'agent',
      evidence_ids: [ref],
      scope,
      provenance: 'observed',
    },
  },
  {
    op: 'alias_identity',
    record_kind: 'screen',
    from_id: uuid(3),
    to_id: uuid(4),
    rationale: 'Explicit synthetic alias',
    evidence_ids: [uuid(5)],
  },
];
export const binding = {
  session_id: uuid(10),
  page_id: uuid(11),
  snapshot_id: uuid(12),
};
export const receiptBase = {
  execution_id: 'synthetic_execution',
  ...binding,
  target_id: uuid(13),
  trace_id: 'synthetic_trace',
  trace_seq: 2,
  action_kind: 'click',
  occurred_at: at,
  after_snapshot_id: null,
};
export const attempts = [
  {
    ...receiptBase,
    state: 'not_started',
    dispatch: 'not_dispatched',
    error_code: 'STALE_TARGET',
  },
  {
    ...receiptBase,
    state: 'pending',
    dispatch: 'not_dispatched',
    error_code: null,
  },
  {
    ...receiptBase,
    state: 'succeeded',
    dispatch: 'dispatched',
    error_code: null,
  },
  {
    ...receiptBase,
    state: 'failed',
    dispatch: 'dispatched',
    error_code: 'BROWSER_UNAVAILABLE',
  },
  {
    ...receiptBase,
    state: 'unknown',
    dispatch: 'uncertain',
    error_code: 'UNKNOWN_OUTCOME',
  },
];
export const capabilities = {
  ownership: 'ephemeral_owned',
  headed: true,
  persistent_authentication: false,
  actions: ['click'],
  navigation_keys: ['Tab'],
};
const page = {
  session_id: binding.session_id,
  page_id: binding.page_id,
  scope,
};
const envelope = (data) => ({
  schema_version: 1,
  store_revision: 0,
  data,
  warnings: [],
});
const browserEnvelope = (data) => ({
  ...envelope(data),
  browser_schema_version: 1,
});
export const fixtures = {
  wg_status: {
    input: base,
    output: envelope({
      store_schema_version: 1,
      supported_schema_versions: [1],
      capabilities: ['ingest', 'query', 'changes', 'evidence', 'refresh_plan'],
      counts: [],
      byte_usage: { database: 0, wal: 0, cap: 104857600 },
      ingest_formats: [{ format: 'structured_accessibility', version: '1' }],
    }),
  },
  wg_ingest: {
    input: {
      ...base,
      request_id: 'synthetic_ingest',
      screen_ref: { kind: 'new', name: 'Fixture', view_key: 'fixture' },
      capture,
    },
    output: envelope({
      screen_id: uuid(3),
      capture_id: uuid(4),
      control_ids: [],
      redaction_summary: {
        dropped_fields: 0,
        dropped_texts: 0,
        profile: capture.redaction_profile,
      },
      coverage: 'complete',
      state_id: uuid(5),
      state_hash: 'a'.repeat(64),
      fragment_hash: null,
    }),
  },
  wg_commit: {
    input: {
      ...base,
      request_id: 'synthetic_commit',
      expected_store_revision: 0,
      operations,
    },
    output: {
      ...envelope({
        created_ids: [uuid(3)],
        client_refs: [{ client_ref: 'synthetic_action', id: uuid(3) }],
        new_revision: 1,
      }),
      store_revision: 1,
    },
  },
  wg_query: {
    input: { ...base, mode: 'search', scope, filters: {} },
    output: envelope({
      status: 'no_matches',
      records: [],
      guards: [],
      applicability: 'requires_check',
    }),
  },
  wg_evidence: {
    input: { ...base, ids: [uuid(3)] },
    output: envelope({
      status: 'unavailable',
      items: [],
      missing_ids: [uuid(3)],
    }),
  },
  wg_changes: {
    input: {
      ...base,
      mode: 'captures',
      before_capture_id: uuid(3),
      after_capture_id: uuid(4),
    },
    output: envelope({
      status: 'incomparable',
      reason: 'normalization_version',
      evidence_ids: [uuid(3), uuid(4)],
      changes: [],
    }),
  },
  wg_plan_refresh: {
    input: { ...base, target_ids: [uuid(3)], scope },
    output: envelope({
      status: 'planned',
      steps: [
        {
          target_id: uuid(3),
          expected_scope: scope,
          minimum_observations: 'complete_state',
          prerequisites: [],
        },
      ],
      unresolved_ids: [],
      complete: true,
    }),
  },
  wg_browser_open: {
    input: { ...browserBase, request_id: 'synthetic_open', scope },
    output: browserEnvelope({ status: 'open', page, capabilities }),
  },
  wg_browser_snapshot: {
    input: {
      ...browserBase,
      session_id: binding.session_id,
      page_id: binding.page_id,
    },
    output: browserEnvelope({
      ...binding,
      capture,
      targets: [
        {
          target_id: uuid(13),
          role: 'button',
          name: 'Fixture',
          permitted_actions: ['click'],
        },
      ],
    }),
  },
  wg_browser_navigate: {
    input: {
      ...browserBase,
      request_id: 'synthetic_navigate',
      execution_id: 'synthetic_execution',
      ...binding,
      scope,
      url: 'https://fixture.test/fixture',
    },
    output: browserEnvelope({
      ...attempts[2],
      action_kind: 'navigate',
      target_id: null,
    }),
  },
  wg_browser_act: {
    input: {
      ...browserBase,
      request_id: 'synthetic_act',
      execution_id: 'synthetic_execution',
      action: { kind: 'click', ...binding, target_id: uuid(13) },
    },
    output: browserEnvelope(attempts[2]),
  },
  wg_browser_status: {
    input: browserBase,
    output: browserEnvelope({ status: 'open', page, capabilities, attempts }),
  },
  wg_browser_close: {
    input: {
      ...browserBase,
      request_id: 'synthetic_close',
      session_id: binding.session_id,
    },
    output: browserEnvelope({
      status: 'closed',
      session_id: binding.session_id,
      cleanup: 'complete',
    }),
  },
};
export const clone = (value) => JSON.parse(JSON.stringify(value));

const recordBase = {
  id: uuid(30),
  name: 'Fixture',
  scope,
  evidence: {
    evidence_ids: [uuid(4)],
    provenance: 'observed',
    coverage: capture.coverage,
    freshness: {
      observed_at: at,
      last_checked_at: at,
      application_version: 'fixture_v1',
      age_seconds: 0,
      scope_match: true,
      status: 'recent',
    },
  },
};
export const recordFixtures = [
  {
    ...recordBase,
    kind: 'screen',
    route_template: '/fixture',
    creation_revision: 1,
  },
  {
    ...recordBase,
    kind: 'state',
    screen_id: uuid(3),
    state_hash: 'a'.repeat(64),
    normalization_version: '1',
    view: capture.view,
  },
  {
    ...recordBase,
    kind: 'control',
    state_id: uuid(5),
    role: 'button',
    enabled: true,
    visible: true,
    descriptor: 'Fixture button',
  },
  {
    ...recordBase,
    kind: 'action',
    state_id: uuid(5),
    control_id: uuid(6),
    verb: 'click',
    input_schema: { kind: 'none', required: false },
    preconditions: [],
  },
  {
    ...recordBase,
    kind: 'transition',
    source_state_id: uuid(5),
    action_id: uuid(6),
    target_state_id: uuid(7),
    before_capture_id: uuid(4),
    after_capture_id: uuid(8),
    action_event_id: uuid(9),
    outcome: 'success',
    guards: [],
  },
  { ...recordBase, kind: 'flow', transition_ids: [uuid(9)] },
  {
    ...recordBase,
    kind: 'capture',
    screen_id: uuid(3),
    state_id: uuid(5),
    request_id: 'synthetic_ingest',
    trace_id: 'synthetic_trace',
    trace_seq: 1,
    session_id: 'synthetic_session',
    tab_id: 'synthetic_tab',
    captured_at: at,
    received_at: at,
    source: capture.source,
    redaction_profile: capture.redaction_profile,
  },
  {
    ...recordBase,
    kind: 'action_event',
    action_id: uuid(6),
    before_capture_id: uuid(4),
    after_capture_id: uuid(8),
    trace_id: 'synthetic_trace',
    trace_seq: 2,
    session_id: 'synthetic_session',
    tab_id: 'synthetic_tab',
    occurred_at: at,
    outcome: 'success',
    error_code: null,
  },
  {
    ...recordBase,
    kind: 'test_run',
    runner: 'synthetic',
    runner_version: '1',
    application_version: 'fixture_v1',
    started_at: at,
    finished_at: at,
    outcome: 'passed',
    assertions: [
      {
        target_id: uuid(5),
        assertion: 'Fixture visible',
        result: 'passed',
        evidence_ids: [uuid(4)],
      },
    ],
  },
  {
    ...recordBase,
    kind: 'annotation',
    target_id: uuid(3),
    annotation_kind: 'description',
    value: 'Fixture visible',
    author_type: 'agent',
    revision: 1,
    supersedes_id: null,
  },
];
export const resultVariants = {
  wg_query: [
    {
      status: 'complete',
      records: recordFixtures,
      guards: [],
      applicability: 'unconditional',
    },
  ],
  wg_evidence: [
    {
      status: 'available',
      items: [
        {
          projection: 'summary',
          id: uuid(4),
          kind: 'capture',
          scope,
          source_summary: recordBase.evidence,
        },
      ],
    },
    {
      status: 'available',
      items: [
        {
          projection: 'structured_capture',
          request_id: 'synthetic_ingest',
          id: uuid(4),
          kind: 'capture',
          screen_id: uuid(3),
          state_id: uuid(5),
          received_at: at,
          capture,
        },
      ],
    },
    {
      status: 'available',
      items: [
        {
          projection: 'structured_annotation',
          annotation_kind: 'description',
          author_type: 'agent',
          id: uuid(4),
          kind: 'annotation',
          target_id: uuid(3),
          value: 'Fixture visible',
          provenance: 'observed',
          evidence_ids: [uuid(4)],
          scope,
          revision: 1,
          supersedes_id: null,
        },
      ],
    },
    {
      status: 'incomplete',
      items: [],
      missing_ids: [],
      reason: 'BUDGET_EXCEEDED',
    },
  ],
  wg_changes: [
    {
      status: 'comparable',
      changes: [
        {
          kind: 'altered',
          subject: 'control',
          before_id: uuid(6),
          after_id: uuid(7),
          evidence_ids: [uuid(4), uuid(8)],
          coverage: capture.coverage,
        },
      ],
      invalidated_ids: [],
      complete: true,
    },
  ],
  wg_browser_status: [
    { status: 'closed', page: null, capabilities, attempts: [] },
  ],
};
