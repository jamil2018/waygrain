# Capture and persistence (Phase B)

B01 supplies synthetic fixtures in `tests/fixtures/ui/index.mjs`: Home, Settings,
Members and Member detail; admin/viewer and staging/production; selected tabs,
Invite modal, and UI v2's renamed invitation and removed member control. Seeded
personal, secret, payment and instruction-like strings are synthetic test data.
They are negative privacy cases, never real credentials or copied page content.

`npm test` validates the structured corpus. `npm run test:fixtures` explicitly
launches disposable headed Chromium to assert fixture rendering, role/version
controls, tab selection and modal open/cancel. Install Chromium explicitly through
the documented setup first. The browser check retains no snapshots, screenshots,
profiles, traces or authentication state. DevTools MCP is unavailable in the
implementation environment; Playwright assertions supply the live DOM evidence.
These checks do not attest the future Waygrain browser component or mapping.

B02 adds strict-input redaction and canonical state projections. Names survive
only when their normalized whitespace matches a reviewed profile label. Unknown
text becomes empty; roles must be recognized accessibility roles. Routes must
match configured templates. Tab, modal, feature-variant and partial-subtree
aliases also require profile approval. Unknown profiles/formats fail closed.
Forbidden unknown fields (including values, cookies, tokens and temporary refs)
are rejected by public validation, before normalization or storage.

Only allowlisted accessible-name hints survive; unconfigured test IDs are dropped.
Hints and observation/provenance timestamps do not affect state hashes. Hashes
include screen identity, scope, normalization/profile version and ordered UI
structure. Hashes never contain raw rejected text. Only `locator_hint` may be a
configured ignored field in this version; rules that erase semantic fields fail.
Opaque trace/session/source/request keys must be caller-minted nonidentifying
metadata, not copied page values. Operator allowlists still require review;
redaction cannot guarantee that an operator's approved label is safe.

B03 opens the fixed configured knowledge database with foreign keys, WAL, a
250 ms busy timeout, startup integrity/version checks and transactional revision
guards. The initial schema contains scope-bound screens, immutable states,
controls, captures, evidence links and idempotency receipt slots. Transactions
roll back records and revision together. Future schemas are refused unchanged.
Existing unversioned tables are not adopted. The initial migration runs under
exclusive coordination; a nonempty eligible old database is backed up using the
SQLite binding before mutation. Later numbered upgrades and full crash recovery
remain E05, and backup/restore CLI behavior remains E03.

The separate coordination database uses rollback-journal shared read locks for
normal process lifetimes, and an exclusive lock for migration/maintenance. It
contains only a singleton lock row and schema version. Multiple normal peers can
write the WAL database; maintenance refuses while any peer owns a lifetime lock.
Closing the owning connections releases it; a persisted PID is never lock
ownership proof. The scoped tests include a separate-process peer. Controlled
private parent directories and local filesystems remain prerequisites.

B04 exposes a core `ingest(store, request)` service (public transport integration
is B05). Every request passes the public size/depth/schema/time checks, scope
configuration and redaction before entering a short transaction. Screens resolve
only through a returned ID or an explicitly configured view key within app and
scope. Equal names/routes alone never merge screens. Unknown names become empty;
semantic naming remains later annotation work. Complete compatible projections
reuse immutable states/controls but mint new captures and evidence links.
Partial captures retain coverage-bearing fragment hashes, have no state/control
identity and attach evidence only to their screen. They do not confirm a state.

Receipts use a digest of the sanitized request; identical replay returns the
original receipt even after reopening, without another revision or observation.
Changed sanitized payloads conflict. Revision guards and reused trace sequence
numbers fail atomically. Input metadata must be nonidentifying; unknown values are
never hashed as a retention workaround. Only redacted structure enters SQLite,
WAL and receipt rows. This slice does not yet implement freshness, graph
annotations, actions, transitions, query, changes or cap remediation.

B05 implements `wg_status`, `wg_ingest` and `wg_evidence` through the same core
used by CLI. `serve --config /absolute/private/config.json` advertises these three
tools with the A05 schemas; the other ten schemas remain definitions only.
Capability reporting currently declares `ingest` and `evidence`. Startup opens
only the fixed private knowledge/coordination files; EOF and normal signals close
the connections. No browser is launched by these operations.

CLI commands are:

```sh
waygrain status --config /absolute/private/config.json --app fixture
waygrain ingest --config /absolute/private/config.json < sanitized-request.json
waygrain evidence --config /absolute/private/config.json < evidence-request.json
```

Ingest/evidence stdin contains the full public JSON request with minted project
and app IDs; input is bounded to 1 MiB. Requests cannot choose storage paths.
Errors use the same fixed message, stable code and sanitized field paths as core;
configuration/process errors retain their separate setup codes. Evidence is
untrusted data and conveys no execution instructions or permissions.

Evidence defaults to summaries of explicit capture IDs; `projection: structured`
opts into retained redacted captures. Missing or wrong-app IDs return `unavailable`
with existing items withheld. Annotations remain D01 work. Duplicate IDs are
collapsed. Every successful knowledge envelope fits the requested record/byte
budget (defaults 20 records/8192 bytes). Transport protocol wrappers and MCP's
text compatibility copy are outside that envelope budget. When bounded retrieval
makes progress, its continuation binds IDs, projection, app/project and revision.
Writes stale older cursors. If one item cannot fit, an explicit empty incomplete
result without a cursor requests a larger byte budget; a budget too small for
even that result raises `BUDGET_EXCEEDED`. Reads never advance revision or check
times. Capture recency is descriptive; unknown application version and null
`last_checked_at` are explicit, and retrieval does not verify states or flows.
