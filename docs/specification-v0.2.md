# Waygrain product specification — baseline snapshot

Source: https://chatgpt.com/space/page_262002eefff08191b791867eb0eb32f2

Source version: 0.2, 4 October 2026. Retrieved: 6 October 2026. Page sequence: 2. This local snapshot is reference evidence; the source Page was not edited.

---

Version 0.2 · 4 October 2026 · Proposed design for implementation

Waygrain is a lightweight, local product knowledge plugin for coding agents. It retains evidence about explored screens, controls, states and journeys so an agent can answer product questions and prepare browser work without rediscovering the same interface every session. This specification defines the product, storage model, tool contracts and tests for a narrow first implementation.

The recommended design is a host-neutral stdio MCP server with a small maintenance CLI and one embedded SQLite store. The existing coding agent supplies meaning; its existing browser or scout supplies observations. Waygrain validates, stores, relates and retrieves that knowledge deterministically. It introduces no separate language model, memory agent, hosted account or database service.

The value is a hypothesis to test: evidence-backed recall should reduce repeated exploration and make answers easier to verify. No runtime integration, installation, benchmark or compatibility claim has been established by this specification. Implementation requires a separate go-ahead.

## Product decision

The primary user is a developer who repeatedly asks a coding agent to understand and change an existing web product. The first deployment should sit beside the current scout service and machine-readable browser snapshots. It should preserve useful knowledge across tasks while leaving navigation, execution and permission checks where they already live.

Three jobs define the product:

1. **Explain a feature.** Find the screens, visible controls, observed outcomes and supporting evidence behind a question such as “How does inviting a teammate work?” State what remains unknown.

2. **Prepare a journey.** Retrieve a previously observed route to a target screen, the relevant role and environment, and the checks required before an agent uses it again.

3. **Explain a change.** Compare compatible observations and identify a removed control, changed label, new modal or changed transition, with direct evidence rather than an unqualified summary.

Waygrain’s proposed distinction is product-specific evidence and state management in a small local tool. A saved description alone cannot distinguish an admin-only control from a removed feature, or a remembered path from one verified in the current session. A general graph library alone does not define these semantics. This is a design position, not a claim of market uniqueness or proven superiority.

The working name is Waygrain. Initial name research found no obvious indexed collision, but package, domain and trademark availability are not cleared.

## First release scope

Build for one application, three to five principal screens and at least three journeys that revisit shared screens. Include two roles, a modal or tab variation, and one deliberately changed UI version. The first host is the existing coding-agent workflow with its current scout; a second independent MCP host is a release portability check, not another integration platform to build.

The first release must include:

- Structured observation ingestion, conservative normalization and state hashes

- Durable screens, states, controls, actions, transitions, flows and evidence references

- Agent-authored tags and explanations with explicit provenance

- Bounded search, neighborhood and path queries, plus evidence retrieval

- Scope-aware change detection, freshness metadata and refresh plans

- Atomic local persistence, conflict handling, export, backup and recoverable scoped deletion

- A short setup guide, host instructions and reproducible correctness and efficiency tests

Excluded are autonomous exploration, task execution, browser control, a new planning loop, embeddings, vector databases, model calls, team synchronization, cloud services, a graph dashboard, broad adapter discovery, source-code analysis and a complete model of the application. A graph contains only explored states. UI observations cannot prove an underlying business rule, backend authorization guarantee or all possible outcomes.

## User workflow

On a first task, the agent checks for relevant knowledge. If none exists, it explores normally using its authorized tools. After a useful observation, it sends a sanitized structured capture to Waygrain. It may then attach concise semantic annotations, such as “team invitation,” and link an action to the before and after captures when it actually observed the transition.

On a later task, the agent queries with the application, environment and role. Waygrain returns a small evidence-backed result, its age and scope, and any contradictions or missing coverage. The agent refreshes relevant UI through the same browser tools when current correctness matters. Waygrain accepts the new capture and updates its history; the agent then decides whether and how to act.

Example: a stored admin journey contains Settings → Members → Invite dialog. A viewer query must not return that journey as usable. If the Invite button was renamed, a new compatible capture records the changed label. If a viewer never had the button, that is a separate scoped observation, not evidence that the admin feature disappeared.

## Architecture and integration boundary

Use TypeScript and Node as the proposed implementation stack, subject to a short packaging check in the actual repository. Keep six small modules: protocol schemas, normalization, graph operations, SQLite persistence, MCP transport and CLI. The runtime dependency budget is the official MCP SDK, its required schema support and at most one maintained embedded SQLite binding. Prefer a runtime-provided binding only after supported Node versions and stability are verified. Pin versions and document their licenses. No ORM, graph database, parser suite or model SDK is needed.

The core library accepts and returns plain JSON values so the CLI and MCP server exercise identical behavior. The server writes protocol traffic to stdout and sanitized diagnostics to stderr. It binds no network port and makes no outbound calls. Installation must not edit host configuration silently.

The baseline is **bring your own observations**. A host instruction file tells the coding agent when to query, what structured capture to submit and when to refresh. A small mapping helper may convert one known scout snapshot format into the public ingest schema. Keep this helper outside the graph core and version its format. Unknown formats fail clearly rather than being heuristically parsed as authoritative evidence.

MCP standardizes communication between a host and servers; it does not give one server another server’s authenticated browser session. Waygrain therefore cannot promise automatic access to Playwright, every MCP browser, or an existing tab. The host must orchestrate its own tools. Initial capability reporting declares only `ingest`, `query`, `changes`, `evidence` and `refresh_plan`. Any future direct-capture adapter must declare its actual session ownership and supported operations separately. [MCP architecture](https://modelcontextprotocol.io/docs/learn/architecture)

## Identity and stored records

Every record belongs to a `project_id` and `app_id`. A configured project selects one local store; neither tool input nor page content may redirect writes to an arbitrary path. IDs are opaque UUIDs minted by Waygrain, except for caller-supplied idempotency keys and opaque local scope aliases. Never use text labels as globally unique identity.

A scope consists of `environment`, `origin`, `role`, `account_scope` and `locale`. These fields are explicit strings; use nonidentifying local aliases for tenant/account scope. Missing role is `unknown`, never a wildcard. Browser tab identity and capture session are provenance, not durable screen identity. Within a scope, state also distinguishes route template, tab selection, modal stack and declared feature variants. Parameters that affect behavior belong in the variant; personal record IDs do not.

| Record | Required content and invariant |
| --- | --- |
| Screen | ID, scope, route template, name, creation revision; an agent may propose a name, but duplicate names do not merge screens |
| State | ID, screen ID, canonical state hash, normalization version, selected tabs, modal stack, feature variants; immutable structure |
| Control | ID, state ID, role, safe accessible name, enabled/visible flags and structural descriptor; a reference to a state, not a reusable executable handle |
| Action | ID, state ID, control ID if applicable, verb, safe input schema and preconditions; no stored secret or personal input value |
| Transition | ID, source state, action, target state, evidence capture pair, outcome and guards; observed transitions need a linked before/action/after trace |
| Flow | ID, name, ordered transition IDs and declared scope; a reusable description of an observed journey, not an executable script |
| Capture | ID, request key, screen ID, trace ID and sequence, session and tab aliases, capture time, receipt time, scope, redacted observation, coverage and source format/version; only complete captures resolve to a state ID |
| Action event | ID, action ID, trace ID and sequence, occurrence time, session/tab/scope and before/after capture IDs; records one actual attempt without input values |
| Test run | ID, runner/version, application version, scope, start/end times, outcome and assertions with capture or action-event evidence IDs |
| Annotation | ID, target ID, kind, value, author type, evidence IDs, revision and optional supersedes ID; semantic claims stay separate from structure |

Use relation types `contains`, `offers`, `transitions_to`, `part_of` and `describes`. Validate endpoint types: for example, `offers` connects a state to an action. Do not accept arbitrary untyped edges. Capture-to-record evidence joins and observation history are first-class tables, not prose embedded in a node.

An identity match is conservative. Exact canonical state equality within the same screen and scope can reuse a state. Similar names, route proximity or matching labels cannot merge states. New captures of an unchanged state still receive distinct capture IDs; this preserves time, session and verification history. Explicit identity reconciliation creates an audited alias and retains both histories, with revision guards.

Each ingest requires `screen_ref`, a tagged union of `{kind: "existing", screen_id}` or `{kind: "new", name, view_key?}`. The existing form must reference the same app and scope. The new form creates a screen and returns its ID. A configured app-specific `view_key` is unique within app and scope and may deterministically resolve that screen on later captures; it must be explicitly supplied, never inferred from a route or name. Without that key, later captures must reuse the returned screen ID. Ingest reports identity conflicts instead of merging silently.

## Evidence and semantic annotations

Every claim has one of three provenance classes:

- **Observed:** supported by a structured capture or an actual before/action/after trace

- **Inferred:** supplied by the agent as an interpretation with a rationale and cited evidence

- **Test verified:** linked to a recorded test run, assertions, application version and matching scope

These are provenance labels, not probabilities. The tool checks references and trace consistency; it cannot independently certify that a caller’s browser or test report is truthful. Do not invent confidence percentages. If useful, expose empirical counts such as three successful observations out of four attempts, with their dates and scope.

An agent proposes names, feature tags, descriptions, prerequisites and interpretations through a guarded commit. The tool validates types, lengths, references and provenance requirements; it never upgrades an inference to an observation because its wording sounds certain. Contradictory supported annotations coexist as a conflict until explicitly resolved. A superseding annotation links the previous record rather than erasing its evidence.

A single screenshot or snapshot can support visible structure. It cannot establish that clicking a control reaches a particular state. An observed transition requires captures from one trace, a recorded action between them and an observed outcome; an error or timeout is an outcome too. Never create an edge merely because two screens were visited consecutively in unrelated sessions.

The host supplies a `trace_id` and monotonically increasing `trace_seq` for captures and action events. An action event links `before_capture_id`, `after_capture_id` and `action_id`; it includes `occurred_at`, `outcome` and safe error codes, never raw input values. To create an observed transition, `wg_commit` atomically validates identical app, scope, session, tab and trace; `before.trace_seq < event.trace_seq < after.trace_seq`; consistent timestamps; complete endpoint captures; and an action/control belonging to the source state. Reject conflicting sequence reuse. A timeout without a complete after capture can remain a failed action event with a null after ID, but cannot establish a transition to an invented target.

Test-verified claims require a stored test-run payload: `runner`, `runner_version`, `application_version`, `scope`, `started_at`, `finished_at`, `outcome`, and assertions containing `target_id`, `assertion`, `result` and evidence IDs. Verification applies only to passed assertions whose evidence and scope match the target; an overall passing run does not verify every graph record. The host attests to the run, while Waygrain validates the payload and references. Failed runs remain evidence without promoting a claim.

## Observation normalization and change detection

The v1 ingest schema accepts a structured accessibility-style tree plus explicit scope and view state. Plain text snapshots require a versioned mapping helper before ingestion. Preserve control roles, safe names, enabled and selected flags, hierarchy, ordered collections where order matters, route templates, tabs and modals. The host may provide a safe test ID or other locator hint, but Waygrain stores it as a hint with its source and observation time.

Remove transient snapshot element references, session handles, volatile framework IDs and configured nonsemantic fields before hashing. Snapshot references such as temporary node numbers must never become durable executable locators. Drop input values, cookies, tokens and non-allowlisted free text before persistence. Normalize whitespace and object-key ordering; do not alphabetize UI children. Do not blanket-remove numbers or record labels: use explicit app rules when a changing value is irrelevant, and version those rules.

Compute a SHA-256 digest of the canonical, redacted state projection including scope, screen identity and normalization version. Use stable serialization. Store the projection so the hash is explainable. Never hash raw secrets as a workaround for retaining them. Agent prose and capture timestamps do not affect the structural hash.

Compare only compatible scope and normalization versions. A change result names added, removed and altered controls, tabs, modals and observed outcomes, and cites both captures. A version change in normalization returns `incomparable` unless both captures can be safely re-normalized from retained redacted structure. A missing control in an incomplete or truncated capture is `not_seen`, not `removed`. Removal requires comparable complete coverage of the relevant subtree.

If a normalized state changes, create a new immutable state and connect its screen history. Existing flows and transitions remain historical evidence. Mark their applicability as requiring a check where their referenced state changed; do not silently retarget old edges to new controls.

In v1, partial captures are evidence fragments attached to a screen. They have a `fragment_hash` incorporating coverage, and `state_id: null`; they cannot create, reuse or confirm a complete state. They may support annotations explicitly limited to the observed subtree. A partial capture never advances whole-state, transition or flow freshness. Obtain a complete capture before using it as an observed transition endpoint.

## Public tool contracts

All v1 tools use JSON Schema with unknown keys rejected. Requests carry `schema_version: 1`, `project_id` and `app_id`; writes also carry `request_id`. Responses carry `schema_version`, `store_revision`, `data`, `warnings` and optional `next_cursor`. A warning is structured as `code`, `message` and affected IDs. Errors use stable codes with field paths and do not echo rejected sensitive values.

| Tool | Inputs | Output and behavior |
| --- | --- | --- |
| `wg_status` | Project and app | Store/schema versions, declared capabilities, counts, byte usage and supported ingest formats; no UI freshness promise |
| `wg_ingest` | Screen reference, capture, optional expected store revision | Atomic screen/capture/state/control upsert; returns screen/capture IDs, state ID and hash for complete captures, or null state ID and fragment hash for partial captures, plus redaction summary |
| `wg_commit` | Expected revision, typed annotation/action/action-event/test-run/transition/flow operations | All-or-nothing validation and commit; returns created IDs and new revision; stale revision returns `CONFLICT` |
| `wg_query` | Mode, scope, filters, result budget, cursor | Bounded matching records with evidence summaries, provenance, age and coverage; never executes or refreshes |
| `wg_evidence` | Explicit capture or annotation IDs, projection, cursor | Redacted evidence and source metadata; default is summary, structured evidence is opt-in |
| `wg_changes` | Two capture IDs or a scoped revision range | Compatible structural and annotation changes, coverage limits and invalidated references |
| `wg_plan_refresh` | Target IDs, required scope, maximum age and step budget | A declarative plan for the host to inspect relevant states; no browser calls, execution claim or changed freshness |

The capture object requires `captured_at`, `trace_id`, `trace_seq`, `session_id`, `tab_id`, `source`, `scope`, `view`, `tree`, `coverage` and `redaction_profile`; `screen_ref` is its sibling in the ingest request. `source` contains producer and format versions. `coverage` states `complete` or `partial` and the covered subtree. `view` includes route template, tabs, modals and feature variants. Caller timestamps are retained alongside server receipt time; future timestamps beyond five minutes are rejected. Imported older observations remain historical.

Commit operations are `create_action`, `record_action_event`, `record_test_run`, `create_transition`, `create_flow`, `add_annotation`, `supersede_annotation` and `alias_identity`. New records may use request-local `client_ref` values so a single atomic batch can link them; the receipt maps each client reference to its durable ID. All existing references must belong to the selected app and compatible scope. `alias_identity` is an explicit reconciliation operation, never an automatic side effect of ingestion.

Proposed operational limits are 1 MiB per ingest request, 5,000 tree nodes, depth 64 and 4 KiB per safe text field. Reject oversize requests with `LIMIT_EXCEEDED`; never truncate invisibly. One commit supports at most 100 operations. A failed write leaves no partial records. Store the idempotency key with a digest of the sanitized request: identical replay returns the original receipt, while a changed payload returns `IDEMPOTENCY_CONFLICT`.

Query modes are `search`, `neighbors`, `path` and `flow`. Search uses exact IDs, tags and normalized lexical terms, without embeddings. Rank exact ID, then exact name/tag, then lexical matches; break ties by stable ID. Neighbors are one hop by default, capped at three. Path uses bounded breadth-first traversal over compatible observed or test-verified transitions only; inferred edges are excluded. Guards are returned for host evaluation. If reachability depends on an unevaluated guard, label the path conditional rather than asserting it is executable.

Defaults are 20 records, 8 KiB serialized output, a 50-record maximum, path depth eight and 500 visited nodes. If a budget is exceeded, return a continuation or explicit `BUDGET_EXCEEDED`, not a seemingly complete answer. Cursors bind filters and a store revision; writes invalidate older cursors with `CURSOR_STALE`, prompting a new query. This simple v1 rule avoids misleading pagination during concurrent mutation.

Stable error codes also include `INVALID_INPUT`, `UNKNOWN_SCOPE`, `NOT_FOUND`, `INCOMPATIBLE_CAPTURE`, `UNSUPPORTED_FORMAT`, `UNSUPPORTED_SCHEMA`, `STORE_BUSY`, `STORE_CORRUPT` and `STORAGE_LIMIT`. Structured output must distinguish no matches, incomplete search, incompatible data and unavailable evidence.

## Freshness and refresh behavior

Recency is not proof of correctness. Return `observed_at`, `last_checked_at`, `application_version` when known, `age_seconds`, scope match and a status of `recent`, `stale`, `contradicted` or `unknown`. The proposed default maximum age is 24 hours, configurable per query; this is a retrieval policy, not a promise that a day-old interface is safe to act on. Unknown application version must remain visible.

`last_checked_at` for a state advances only when a new compatible complete observation arrives. Partial captures have their own observation time and never confirm unobserved content. Reading a record, requesting a plan or reusing a prior capture does not refresh it. A new capture can confirm one state without confirming every outgoing transition. A refreshed screen alone does not reverify a whole flow.

Refresh plans list target states, expected scope, minimum useful observations and unresolved prerequisites. They may reference known descriptive routes, but contain no executable scripts or authorization. The host uses its existing scout and permissions to gather evidence, or reports `blocked`, `unsupported` or `needs_user_input`. Authentication, session access, destructive controls and consequential actions stay governed by the host. Failed or blocked refreshes leave old evidence intact and visibly stale.

Immediately before using a remembered control, the host must obtain current evidence and resolve it in that live UI. A stored accessible-name hint or test ID helps discovery but is never a permission grant or substitute for a current handle.

## Local storage and recovery

Use one embedded SQLite database per configured project, with normalized tables for the records above, evidence joins, scope definitions, idempotency receipts, tombstones and schema migrations. A monotonic store revision advances once per successful write transaction. Immutable observations coexist with versioned annotations. Foreign keys and unique constraints enforce identity and request-key boundaries.

Use WAL on a local filesystem, parameterized SQL and short write transactions. Reads see a consistent snapshot; concurrent writers serialize. Set a bounded busy timeout and return `STORE_BUSY` after it rather than retrying indefinitely. Multiple stdio processes may open the same local store. Network shares and live folder-sync locations are unsupported in v1. SQLite WAL uses sidecar files and is not a single-file-copy backup format while active. [SQLite WAL](https://sqlite.org/wal.html)

On startup, validate schema version and run a lightweight integrity check. A newer unsupported schema is read-only or refused with an upgrade message; it is never downgraded automatically. Migration and restore require exclusive maintenance access honored by every process; v1 may require all server instances to stop. If exclusive access cannot be established, return `STORE_BUSY`. Before a migration, produce a consistent backup using the binding’s backup API, run migration in a transaction and verify integrity. Roll back a failed migration. Never automatically replace the store with a backup while another connection may write; an explicit offline restore must verify the backup and exclusivity first. [SQLite backup API](https://sqlite.org/backup.html)

The CLI provides `status`, `export`, `backup`, `restore`, `delete-scope` and `undo-delete`. Export is versioned JSON containing IDs, scopes, provenance and redacted evidence. Import, if included, validates the entire bundle, remaps conflicting IDs explicitly and commits atomically; otherwise defer import and document export as archival only. Backups must round-trip IDs, revisions and evidence.

Scoped deletion creates tombstones and a recoverable deletion batch, with queries excluding that batch immediately. Permanent purge is a distinct explicit command with a clear affected-record preview; it also explains that separate backups retain data. No automatic permanent deletion or silent pruning in v1. A proposed 100 MiB default store cap rejects further ingestion with remediation guidance. Lowering a cap must not discard existing history. The CLI should report actual database plus WAL size.

## Privacy and security requirements

Default retention is structured, redacted UI metadata. Raw snapshots, screenshots, response bodies, form values, cookies, passwords, authentication tokens, payment information and personal record text are not persisted. Prefer allowlisting known product labels over trying to detect every secret after capture. The host sanitizes before sending; Waygrain repeats deterministic checks before writing and fails closed on forbidden fields. Unknown free text is dropped or rejected according to the explicit profile.

Sanitize URL parameters and route segments; store route templates with approved variants. Scope aliases must not reveal real account identifiers. A safe label may still contain personal data, so each pilot application needs a reviewed allowlist/redaction fixture. Redaction is defense in depth, not a guarantee that arbitrary untrusted text is safe. The initial release does not offer raw-capture retention.

Use restrictive local directory/file permissions where supported. Exclude stores and backups from version control through documented setup; do not silently edit a repository. Local storage is not encrypted by Waygrain, so users requiring at-rest protection need their existing encrypted filesystem. No telemetry, network egress, credential discovery or cross-project search by default.

Treat page text, labels and annotations as untrusted data. Never execute text, follow embedded instructions, interpolate it into shell commands or turn it into tool permissions. Exported evidence retains this warning in machine-readable metadata. Restrict file operations to the configured store and explicit CLI paths; validate symlinks and path traversal. Logs contain IDs, timings and error codes, not evidence bodies.

## Implementation work packages

1. **Confirm the host boundary.** Inspect the actual scout output, supported runtime and host configuration. Select one snapshot format and one maintained SQLite binding. Record exact dependency versions and a sanitized fixture. Acceptance: an existing scout observation can become a valid v1 capture without replacing browser control.

2. **Build the deterministic core.** Implement schemas, redaction profiles, normalization, stable hashes, scope matching and typed graph validators. Acceptance: fixtures produce repeatable hashes and correctly separate roles, tabs, modals and environments.

3. **Add transactional persistence.** Implement schema, migrations, revision guards, idempotency, evidence joins, backup and tombstones. Acceptance: concurrency and crash tests preserve committed data with no partial graph mutations.

4. **Expose the small tool surface.** Add the seven MCP tools, CLI and bounded query/diff behavior. Acceptance: contract tests cover valid, invalid, oversized, stale and partial inputs; no tool emits executable browser handles or invokes a model.

5. **Connect the first workflow.** Add short host instructions and one mapping helper, then exercise the controlled UI and current scout. Acceptance: a new agent session can explain a feature and retrieve its evidence without an invisible shared session assumption.

6. **Run the adoption and portability gates.** Compare against existing baselines, install in a second host, and document limits. Acceptance: the gates below pass before a broader release or adapter investment.

Keep implementation in a small package, with separate `core`, `store`, `mcp`, `cli`, `fixtures` and `tests` directories. Generate tool schemas from one source of truth. A repository and runtime have not been inspected for this specification, so an engineering duration would be provisional; estimate after work package one rather than treating a prior rough range as a delivery commitment.

## Acceptance tests

The controlled test application has Home, Settings, Members and a member detail screen; an Invite modal; admin and viewer roles; two environments; and a second UI version with one renamed button and one removed control. Use synthetic accounts and values only.

| Test | Passing result |
| --- | --- |
| Repeated capture | New capture IDs preserve history; unchanged canonical state reuses the same state ID/hash |
| Screen identity | Explicit screen IDs or configured stable keys resolve correctly; equal route/name alone never merges screens |
| Noise and meaningful changes | Changed timestamps or transient references do not change a hash; changed role, enabled state, modal, selected tab or meaningful order does |
| Scope separation | Viewer/staging evidence cannot satisfy an admin/production query; unknown role never widens access |
| Transition evidence | Unrelated visits, mismatched scopes, reused sequence numbers and reversed ordering fail; a valid complete before/action/after trace succeeds; inferred edges are excluded from usable-path search |
| Test evidence | Only a passed, scoped assertion with linked evidence can mark its target test verified; unrelated records and failed runs cannot |
| Staleness | Query and refresh-plan calls never advance check times; a current screen capture does not verify unexecuted transitions |
| Partial captures | Partial evidence has no state ID and cannot confirm a complete state or transition; missing nodes are not reported removed; incompatible normalizer versions are explicit |
| Sensitive content | Seeded secrets and personal fixture values appear in neither database, WAL, backup, export nor logs |
| Injection and locators | Malicious labels remain inert data; transient snapshot references never appear as durable executable locators |
| Concurrent writes | Two writers using one revision yield one commit and one conflict; repeated request key has one effect |
| Crash and migration | Forced termination during a write or migration leaves a valid recoverable store; unsupported future schema is not altered; live peer processes block maintenance/restore without losing their commits |
| Query limits | Large graphs respect record, byte, hop and node budgets; stale cursors and incomplete results are distinguishable |
| Delete and restore | Scoped deletion hides only its scope; undo restores IDs and links; verified backup restores equivalent query results |

For each test, retain fixture version, expected result and automated assertion. A “test verified” product fact also needs the corresponding UI-test run and scope; passing storage tests does not verify product behavior.

## Evaluation and release gates

Compare three conditions using the same agent/model configuration, application version, starting state and task set: the existing scout alone, the scout with a simple snapshot-and-notes folder, and the scout with Waygrain. Count all capture, annotation, query and refresh overhead. Do not compare a warm graph only against a cold baseline.

Run at least ten representative tasks across feature explanation, journey preparation and change detection, with three repetitions each. Measure cold start, warm repeat and changed-UI cases separately. Log wall time, agent input/output tokens, browser calls, retained bytes, task success and unsupported factual claims. Where a host does not expose token counts, mark tokens unmeasured rather than estimating them as facts.

The following are proposed decision thresholds, not measured results:

- Warm tasks reduce median browser calls and either wall time or total agent tokens by at least 20 percent against the stronger baseline

- Overall task success and evidence-grounded answer correctness are no worse than the baseline; no additional wrong UI actions are acceptable

- Changed-UI cases detect the seeded changes before the agent relies on obsolete evidence; no inferred path is presented as observed

- Cold-start overhead stays within 15 percent median wall time, or a documented repeated-use break-even justifies the extra setup

- Three developers unfamiliar with the implementation can install it, ingest a fixture and answer a query in ten minutes or less without a separate service

- A second application and a second MCP host pass smoke tests through the public schema and small mapping instructions without changes to the graph core

Report distributions and individual failures, not only averages. With a small pilot these thresholds are practical release gates, not statistical proof. If Waygrain fails to beat ordinary snapshots and files, simplify or stop. If only one custom scout benefits, keep it as a local helper until portability justifies a standalone plugin.

## Reuse and remaining decisions

Graphify is a credible reusable general-graph option: its published workflow includes persistent graph output, path queries and an MCP entry point. Its Python-oriented extraction pipeline is broader than this product’s minimal UI evidence store. Waygrain should not depend on it for v1; a later versioned JSON export can support directed graph analysis if users need it. Inspect the current API and license at implementation time rather than promising compatibility from documentation alone. [Graphify workflow](https://github.com/Graphify-Labs/graphify/blob/v8/graphify/skill.md) · [Graphify server](https://github.com/Graphify-Labs/graphify/blob/v8/graphify/serve.py)

The generic MCP memory pattern is useful for simple entities and relations, but this design requires scoped observations, transition traces, freshness, conflict handling and recovery as explicit contracts. Adding that behavior to a broad dependency should be evaluated against the small implementation above; neither route has been runtime-tested here.

Before implementation, choose the first pilot application, inspect the exact scout snapshot format, confirm the supported Node versions and SQLite packaging, and choose the first test host. These are bounded setup decisions, not reasons to expand the architecture. Keep all performance, adoption and interoperability claims provisional until the corresponding gate passes.


