# Waygrain

Persistent product knowledge for coding agents: remember explored screens, controls, states, and journeys, then retrieve the evidence behind an answer.

Waygrain is being designed as a local plugin with a stdio MCP server, SQLite knowledge store, and an isolated browser for agent-directed capture and interaction. The goal is to help developers explain features, prepare journeys, and identify UI changes across sessions. Its value and compatibility still need to be tested.

## Current status

A01 is verified. A02 adds the private Apache-2.0 npm package scaffold and quality commands; see the [task register](tasks/todo.md) for its verification status. The ESM entry point is intentionally empty. MCP, CLI, configuration, storage and browser behavior arrive in later tasks. Host support remains unverified.

## Development setup

Use Node.js 24 LTS (Node 26 is the smoke-test target) and npm. From this checkout:

```sh
npm ci
npm run check
```

`check` runs strict typechecking, ESLint, Prettier checks, the Node test harness and the TypeScript build. Individual commands are `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm test` and `npm run build`. Output goes to `dist/` without bundling. The A02 test harness contains zero product tests; that result does not verify product behavior. Playwright Test is pinned for later browser scenarios, with no browser installation in this setup.

Exact dependency pins and declared licenses are recorded in [the dependency inventory](docs/dependencies.md), with the complete resolved graph in `package-lock.json`. The package is private until separately authorized release work. No install hook edits host settings or repository ignore rules.

The [A01 Python checker](tasks/evidence/a01/check-documents.py) preserves the original pre-bootstrap assertions. Run it only against that historical artifact; it intentionally fails on this later package scaffold and is not the current quality command.

## Planned workflow

1. Query remembered knowledge for the required application, role, and environment.
2. Open an ephemeral browser session on request and obtain a current sanitized snapshot.
3. Ingest a before capture, perform an authorized action, and ingest the after capture.
4. Commit a supported trace and retrieve scoped evidence in later sessions.

Saved controls are descriptions, not executable handles. A fresh screen observation does not verify every transition or flow. Browser actions remain subject to the user's and host's authorization.

## Architecture

The planned package separates schemas, redaction and normalization, graph operations, SQLite persistence, MCP transport, CLI, and the isolated Playwright browser worker. The deterministic knowledge core accepts plain JSON and cannot invoke the browser. External structured ingestion remains supported.

The selected stack is TypeScript/ESM, Node.js 24 with Node 26 smoke testing, the official MCP SDK, Zod, better-sqlite3, and Playwright. Dependency versions and declared licenses are recorded in A02; public APIs, native packaging and host compatibility still need their assigned feasibility checks. See [ADR-001](docs/decisions/001-bundled-browser.md) for choices, boundaries, and consequences.

## Documentation

- [Documentation index](docs/README.md) — source precedence and reading guide.
- [Implementation plan](tasks/plan.md) — architecture, task dependencies, acceptance criteria, and release gates.
- [Task register](tasks/todo.md) — actual status and evidence.
- [Product specification snapshot](docs/specification-v0.2.md) — v0.2 baseline.
- [Bundled browser amendment](docs/decisions/001-bundled-browser.md) — explicit changes to that baseline.
- [Contributing](CONTRIBUTING.md) — task scope, verification, and review workflow.
- [Security](SECURITY.md) — reporting and planned privacy boundaries.

## License

Licensed under [Apache-2.0](LICENSE). See the [dependency license inventory](docs/dependencies.md).
