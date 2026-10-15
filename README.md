# Waygrain

Waygrain is becoming a standalone app descriptor: living documentation that explains pages, components and hidden business rules, with evidence-backed contextual clarification.

The active [v0.3 plan](tasks/plan.md) targets a local synthetic calculation app, documentation editor/import, reusable read-only documentation surface and offline deterministic clarification. These capabilities are planned, not yet implemented. Existing TypeScript/SQLite/MCP/browser foundations remain available; the [task register](tasks/todo.md) tracks new implementation separately from historical work.

## Existing implementation and historical status

Phases A–E and the amended Codex-only Phase F pilot are verified. Phase G records a constrained Codex evaluation and assisted agent installation trials, followed by a reviewed private release candidate. The warm efficiency threshold failed; original human adoption, second-application and second-host requirements remain unmet. See the [release-readiness verdict](https://github.com/jamil2018/waygrain/blob/main/docs/release-readiness.md) and [evaluation methodology](https://github.com/jamil2018/waygrain/blob/main/docs/evaluation.md). The foundation includes explicit private configuration, packed MCP/SQLite/headed Chromium probes and all 13 public contract definitions. The A06 foundation, B06 capture, C05 browser, D06 recall and E06 recovery checkpoint verdicts, evidence and limitations are preserved in the [historical task register](tasks/history/2026-10-16-v0.2/tasks/todo.md). See the [setup guide](https://github.com/jamil2018/waygrain/blob/main/docs/configuration.md), [runtime probe guide](https://github.com/jamil2018/waygrain/blob/main/docs/runtime-feasibility.md) and [contract guide](https://github.com/jamil2018/waygrain/blob/main/docs/contracts.md).

The MCP endpoint implements redacted capture ingestion, status and bounded evidence retrieval over a scoped SQLite store. See the [capture and persistence guide](https://github.com/jamil2018/waygrain/blob/main/docs/capture-persistence.md). The owned browser provides independently verified lifecycle, sanitized snapshots, guarded navigation, bounded actions and durable attempt receipts; see the [browser guide](https://github.com/jamil2018/waygrain/blob/main/docs/browser.md). Guarded annotations, supersession, audited identity aliases and validated action/event/transition traces, ordered flows and scoped test-run evidence are implemented through `wg_commit`; see the [graph and recall guide](https://github.com/jamil2018/waygrain/blob/main/docs/graph-and-recall.md). Scoped lexical search, bounded neighbors, observed paths and ordered flow retrieval are available through `wg_query`. Evidence-backed comparisons and declarative refresh plans are available through `wg_changes` and `wg_plan_refresh`. Private archival export, online backup, verified offline restore, recoverable scoped deletion/undo, previewed purge and conservative ingestion storage limits are implemented through the maintenance CLI; see the [changes and recovery guide](https://github.com/jamil2018/waygrain/blob/main/docs/changes-and-recovery.md). Durability evidence covers local macOS process crashes, with hardware power loss unverified. The macOS pilot verifies scoped fresh-session recall through explicit Codex CLI stdio setup; see [plugin setup](PLUGIN_SETUP.md). Automatic plugin discovery, desktop UI installation, Claude Code, Cursor and cross-platform support remain unverified.

The tarball includes this README, plugin setup, three skills and public schemas. Longer source and evaluation documents are linked online and require network access.

## Development setup

Use Node.js 24 LTS (Node 26 is the smoke-test target) and npm. From this checkout:

```sh
npm ci
npm run check
```

`check` runs strict typechecking, ESLint, Prettier checks, the Node test harness and the TypeScript build. Individual commands are `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm test` and `npm run build`. Output goes to `dist/` without bundling. The A03 tests exercise configuration and CLI setup with synthetic fixtures. `npm test` builds the modules before running them. Playwright Test is pinned for later browser scenarios. `npm run smoke:packed` explicitly installs Chromium into a disposable location and launches a blank headed window; ordinary install/check commands do not install or launch browsers.

Exact dependency pins and declared licenses are recorded in [the dependency inventory](https://github.com/jamil2018/waygrain/blob/main/docs/dependencies.md), with the complete resolved graph in `package-lock.json`. The package is private until separately authorized release work. No install hook edits host settings or repository ignore rules.

The [A01 Python checker](https://github.com/jamil2018/waygrain/blob/main/tasks/evidence/a01/check-documents.py) preserves the original pre-bootstrap assertions. Run it only against that historical artifact; it intentionally fails on this later package scaffold and is not the current quality command.

## Existing plugin workflow

1. Query remembered knowledge for the required application, role, and environment.
2. Open an ephemeral browser session on request and obtain a current sanitized snapshot.
3. Ingest a before capture, perform an authorized action, and ingest the after capture.
4. Commit a supported trace and retrieve scoped evidence in later sessions.

Saved controls are descriptions, not executable handles. A fresh screen observation does not verify every transition or flow. Browser actions remain subject to the user's and host's authorization.

## Existing architecture

The package separates schemas, redaction and normalization, graph operations, SQLite persistence, MCP transport, CLI, and the isolated Playwright browser worker. The deterministic knowledge core accepts plain JSON and cannot invoke the browser. External structured ingestion remains supported.

The selected stack is TypeScript/ESM, Node.js 24 with Node 26 smoke testing, the official MCP SDK, Zod, better-sqlite3, and Playwright. Dependency versions and declared licenses are recorded in A02; historical compatibility evidence retains its original limits. The v0.3 UI and service need their own verification. See [ADR-001](https://github.com/jamil2018/waygrain/blob/main/docs/decisions/001-bundled-browser.md) for choices, boundaries, and consequences.

## Documentation

- [Documentation index](https://github.com/jamil2018/waygrain/blob/main/docs/README.md) — source precedence and reading guide.
- [Implementation plan](https://github.com/jamil2018/waygrain/blob/main/tasks/plan.md) — architecture, task dependencies, acceptance criteria, and release gates.
- [Task register](https://github.com/jamil2018/waygrain/blob/main/tasks/todo.md) — actual status and evidence.
- [Product specification v0.3](docs/specification-v0.3.md) — active baseline; [ADR-004](docs/decisions/004-standalone-app-descriptor.md) records the pivot.
- [Bundled browser amendment](https://github.com/jamil2018/waygrain/blob/main/docs/decisions/001-bundled-browser.md) — historical browser boundaries retained where applicable.
- [Contributing](https://github.com/jamil2018/waygrain/blob/main/CONTRIBUTING.md) — task scope, verification, and review workflow.
- [Security](https://github.com/jamil2018/waygrain/blob/main/SECURITY.md) — reporting and planned privacy boundaries.

## License

Licensed under [Apache-2.0](LICENSE). See the [dependency license inventory](https://github.com/jamil2018/waygrain/blob/main/docs/dependencies.md).
