# Test harness

`npm test` builds the TypeScript modules, then uses the Node test runner to
discover `tests/**/*.test.mjs`. A03 adds synthetic configuration and CLI tests:
identity, scope validation, explicit paths, restrictive permissions, symlinks,
overwrite refusal, concurrent setup, bounded reads, and sanitized diagnostics.
Fixtures live in automatically removed temporary directories.

A02 historically had zero product tests; its receipt remains unchanged.
These setup checks do not prove SQLite, MCP, browser, redaction enforcement or
host compatibility. Playwright Test is reserved for later browser scenarios.
