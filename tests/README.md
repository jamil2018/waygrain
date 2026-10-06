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
