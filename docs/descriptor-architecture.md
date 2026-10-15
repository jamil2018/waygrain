# Descriptor architecture — W00

Frozen for the bounded v0.3 local slice, 16 October 2026. Baseline commit: `52324b742fa77ee448b489f77f126c802fec7870`. No product behavior changes in W00. Public release remains HOLD.

## Existing interfaces and compatibility

The package is private ESM TypeScript with Node 24/26, Zod, better-sqlite3, MCP and Playwright already pinned. Keep these versions, package exports and license. `src/index.ts` exports configuration, contracts, Store, capture/graph/query/refresh/recovery/deletion APIs. `src/cli.ts` dispatches the established commands; `src/mcp/index.ts` provides the existing tools. The descriptor adds internal modules without silently changing these contracts. Existing compact capture projections retain observed provenance; they are not semantic component identities or verified formulas.

Store schema 4 has sequential migrations 1–4 in `src/store/schema.ts`, applied under an exclusive coordination lock in `Store.open`. `Store.write(expectedRevision, callback)` checks optimistic revision and commits atomically; `transaction` rejects asynchronous callbacks. Private config/store/sidecars use owner-only permissions and reject symlinks. Keep these primitives and their crash/concurrency tests.

| Existing area                                                  | Disposition                                                            |
| -------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Configuration, private-file checks, coordination, transactions | Keep and reuse                                                         |
| Legacy captures/graph, CLI/MCP, compact retrieval              | Keep compatible; no reinterpretation of IDs                            |
| Descriptor identities, documents, sources, claims and mappings | Extend with separate versioned semantic contracts and additive storage |
| Prior capture or supplied code evidence                        | Bridge through explicit source locator, revision, hash and method only |
| G05–G08 fixtures/reports and archived v0.2 roadmap             | Keep immutable historical evidence; never new gate credit              |

## Five boundaries and ownership

1. `src/descriptor/contracts.ts` and `store.ts`: strict JSON schemas, semantic identity/reference validation, append-only bundle revisions and persisted state. A bundle includes project/app/target/source/claim/document/mapping identities; UI state belongs to applicability, never identity.
2. `src/descriptor/retrieval.ts`: authorized, deterministic, bounded projections with revision, omissions, conflicts, unknowns, source locators and freshness intact. Deny before constructing any visible content.
3. `src/descriptor/authoring.ts` and `freshness.ts`: validate/preview/commit imports, expected revisions, export/history and explicit invalidation/verification. No read can verify evidence.
4. `src/descriptor/http/` and `ui/`, plus `assets/descriptor-demo/`: loopback service, separate authoring route/client capability, browser-native TypeScript/DOM/CSS, explicit registered target keys and accessible documentation panels. Build browser code separately with the existing TypeScript compiler; Node-only imports cannot enter the browser graph. No framework or dependency addition is needed.
5. `src/descriptor/providers/` and `conversation.ts`: bounded evidence package, deterministic provider and answer validation, persistent sanitized scoped turns. Providers receive no tools or host mutation capabilities. History is context, not evidence.

## Access and transport contract

Trusted server configuration or an embedded host creates an access context containing a principal alias, allowed project/app IDs, exact environment/version/role/tenant/UI-state scopes, and read versus author permission. The server selects a preconfigured fixture context; request-body roles never grant authority. Unknown dimensions match only explicit unknowns, never every role. Reauthorize every read/source/turn/export, before snippets or metadata leave the core, and again before displaying asynchronous results. Author operations require the distinct author context. The reusable adapter receives only read capabilities; authoring APIs are not in its client interface.

Bind to `127.0.0.1`; validate exact Host and same Origin, reject cross-origin writes and unsupported content types, and use server-controlled file locations. Never expose stores, arbitrary paths or unrestricted source bodies. UI uses textContent and DOM creation rather than imported HTML. Do not read host input values; register explicit element/target metadata only. Details controls live outside host buttons/forms. Escape restores focus. No screenshots, traces, profiles or raw snapshots are retained.

## Storage and limits

Add a numbered legacy store migration only when sharing that database; use namespaced descriptor tables with their own payload schema version. Migration must acquire existing exclusive lifecycle coordination, retain all legacy rows and fail transactionally on invalid/future versions. No automatic migration of real stores for qualification. W02 tests fresh/upgrade/failure/restart paths on disposable synthetic configuration. Semantic records retain stable IDs and append-only revisions; superseding never deletes prior evidence. Expected-revision writes reject stale/concurrent authors. No silent merge or overwrite of a newer import. All relationships are validated before a transaction; dangling, duplicate or cross-project/app links fail closed.

Initial explicit limits: 1 MiB JSON request/import, 256 records per entity collection, 16 KiB per source excerpt, 4 KiB per documentation/claim field, 2 KiB question, 32 KiB evidence package, 32 selected claims, 20 retained turns per conversation, 100 conversations per project. Responses report missing/truncated evidence. Schemas enforce limits rather than relying on the UI. Storage retains the configured legacy capacity check. No credentials, arbitrary host form values, customer data, source/question diagnostic logs, telemetry or network providers.

## Commands and qualification

Existing quality commands: `npm run typecheck`, `build`, `lint`, `format:check`, `test`, `check`. `check` runs typecheck, lint, formatting, then test (whose pretest builds). Existing browser commands explicitly launch Playwright: `test:fixtures`, `test:browser:lifecycle`, `test:browser:snapshots`, `test:browser:navigation`, `test:browser:actions`. Their presence is not a fresh browser pass. No historical model cohort or pre-bootstrap A01 checker is a W gate.

W06 owns `demo:descriptor`: build and start the local shell, using only synthetic persisted fixtures. W22 owns consolidated `test:descriptor` and clean-checkout replay/documentation. Focused tests under `tests/descriptor/` can use Node's test runner as introduced. Browser suites use real Playwright without retained screenshots/video/traces. Browser installation is an explicit prerequisite, never a hidden download. Default deterministic provider works offline with no paid key. Each task gets independent exact-artifact acceptance before its commit/push; substantive edits renew review.

Baseline host: macOS arm64, Node 26.11.0, npm 11.20.0. `npm run check` passed 138 tests, no failures/skips; standalone build passed. Independent pre-W clean-like replay also passed with installed dependencies reused. Node24, fresh dependency installation, new descriptor UI and general host portability are not qualified by those results. See W00 receipt for exact commands and hashes.
