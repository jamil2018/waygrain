# Test harness

`npm test` builds the TypeScript modules, then uses the Node test runner to
discover `tests/**/*.test.mjs`. A03 adds synthetic configuration and CLI tests:
identity, scope validation, explicit paths, restrictive permissions, symlinks,
overwrite refusal, concurrent setup, bounded reads, and sanitized diagnostics.
Fixtures live in automatically removed temporary directories.

A02 historically had zero product tests; its receipt remains unchanged.
A04 adds stdio handshake/EOF and disposable disk SQLite/WAL probes.
`npm run smoke:packed` separately exercises a clean tarball install and explicitly
installs/launches blank headed Chromium. See the [probe guide](../docs/runtime-feasibility.md).
These checks do not prove graph persistence, product browser/privacy behavior,
redaction enforcement or host compatibility. Playwright Test is reserved for later browser scenarios.

A05 adds contract fixtures for all seven knowledge and six browser tools. Both
Zod and the SDK AJV validator check generated JSON Schema. Boundary tests cover
unknown fields, limits, partial captures, typed operations, live bindings and
uncertain receipts. These schema examples do not attest implemented tool behavior.

Phase B adds synthetic UI/redaction/store/ingest/evidence tests. Current stdio
checks exercise the three implemented knowledge tools, safe argument errors and
EOF storage cleanup; they supersede the scaffold behavior in the historical
A04–A06 receipts. CLI/core/MCP parity, budgets/cursors, identity/history, scoped
FKs, lifetime maintenance locks, partial coverage and disk/WAL privacy are
asserted. `npm run test:fixtures` explicitly launches headed synthetic pages;
ordinary quality checks launch no browser. See [capture/persistence](../docs/capture-persistence.md).
