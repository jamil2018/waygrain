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
